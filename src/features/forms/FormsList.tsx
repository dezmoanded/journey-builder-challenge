import { useEffect, useMemo, useState } from 'react'
import '../../styles/ui.css'
import { createFormsApi } from '../../api'
import { getNodeName } from './GraphHelper'
import type { Graph, GraphForm } from './types'

export type FormsListProps = {
  tenantId?: string
  blueprintId?: string
  baseUrl?: string
  fetchImpl?: typeof fetch
  onSelect?: (form: GraphForm) => void
}

export function FormsList(props: FormsListProps) {
  const baseUrl = props.baseUrl ?? (import.meta as any).env?.VITE_API_BASE_URL
  const tenantId = props.tenantId ?? (import.meta as any).env?.VITE_TENANT_ID ?? '123'
  const blueprintId = props.blueprintId ?? (import.meta as any).env?.VITE_BLUEPRINT_ID ?? 'bp_456'

  const api = useMemo(() => createFormsApi({ baseUrl, fetchImpl: props.fetchImpl }), [baseUrl, props.fetchImpl])

  const [graph, setGraph] = useState<Graph | null>(null)
  const [forms, setForms] = useState<GraphForm[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    api
      .getBlueprintGraph(tenantId, blueprintId)
      .then((g) => {
        if (!active) return
        setGraph(g)
        setForms(Array.isArray(g.forms) ? g.forms : [])
      })
      .catch((e) => {
        if (!active) return
        setError(e instanceof Error ? e.message : String(e))
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [api, tenantId, blueprintId])

  if (loading && !graph) {
    return <p>Loading forms…</p>
  }

  if (error) {
    return (
      <div role="alert" className="alert alert--error">
        <p className="m-0 fw-600">Failed to load forms</p>
        <pre className="pre-wrap">{error}</pre>
        <small>
          Using tenantId={tenantId}, blueprintId={blueprintId}
          {baseUrl ? `, baseUrl=${baseUrl}` : ''}
        </small>
      </div>
    )
  }

  if (!forms.length) {
    return <p>No forms found.</p>
  }

  const clickable = typeof props.onSelect === 'function'

  return (
    <section aria-label="Forms list" className="stack-lg">
      {forms.map((f) => {
        let displayName = f.name || 'Untitled form'
        if (graph) {
          try {
            const computed = getNodeName(graph, f.id)
            if (computed) displayName = computed
          } catch {
            // getNodeName may not be implemented; fall back silently
          }
        }

        if (clickable) {
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => props.onSelect?.(f)}
              className="card card--clickable"
              aria-label={`Select form ${displayName}`}
            >
              <h3 className="m-0 mb-4">{displayName}</h3>
              {f.description ? (
                <p className="m-0 mb-6 text-muted">{f.description}</p>
              ) : null}
              <FormMeta form={f} />
            </button>
          )
        }

        return (
          <article key={f.id} className="card">
            <h3 className="m-0 mb-4">{displayName}</h3>
            {f.description ? (
              <p className="m-0 mb-6 text-muted">{f.description}</p>
            ) : null}
            <FormMeta form={f} />
          </article>
        )
      })}
    </section>
  )
}

function FormMeta({ form }: { form: GraphForm }) {
  const fieldsCount = (() => {
    const props = form.field_schema?.properties ?? {}
    return Object.keys(props).length
  })()

  return (
    <div className="meta">
      <span>Fields: {fieldsCount}</span>
      {form.is_reusable ? <span className="ml-8">• Reusable</span> : null}
    </div>
  )
}
