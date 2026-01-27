import { useEffect, useState } from 'react'
import type { Graph, GraphForm } from '../forms'
import type { DataSource, PrefillSelection, FieldPrefillMapping } from './types'
import { getFormDataSources } from '../forms/GraphHelper'
import { fetchGlobalDataSources } from '../../api'
import '../../styles/ui.css'

export type FieldsListProps = {
  form: GraphForm
  graph?: Graph
  // Current mappings for this form (optional for now)
  mappings?: FieldPrefillMapping
  // Callback to update mapping for a given field on this form
  onUpdateMapping?: (fieldKey: string, selection: PrefillSelection | null) => void
}

export function FieldsList({ form, graph, mappings, onUpdateMapping }: FieldsListProps) {
  const properties = (form.field_schema as any)?.properties ?? {}
  const keys = Object.keys(properties)

  const [showPrefill, setShowPrefill] = useState(false)
  const [selectedFieldKey, setSelectedFieldKey] = useState<string | null>(null)
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [loadingSources, setLoadingSources] = useState(false)
  const [sourcesError, setSourcesError] = useState<string | null>(null)

  const hasMapped = keys.some((k) => Boolean(mappings && mappings[k]))

  async function loadSources(active: { current: boolean }) {
    try {
      const globals = await fetchGlobalDataSources()
      const formSources = graph ? getFormDataSources(graph, form.id) : []
      const combined: DataSource[] = [...globals, ...formSources]
      console.log("[loadSources]", {combined})
      if (active.current) setDataSources(combined)
    } catch (e) {
      if (active.current) setSourcesError(e instanceof Error ? e.message : String(e))
    } finally {
      if (active.current) setLoadingSources(false)
    }
  }

  useEffect(() => {
    if (!showPrefill) return
    const active = { current: true }
    setLoadingSources(true)
    setSourcesError(null)
    loadSources(active)
    return () => {
      active.current = false
    }
  }, [showPrefill, graph, form.id])

  // If there are mapped fields, prefetch sources to resolve names for display
  useEffect(() => {
    if (!hasMapped) return
    if (dataSources.length) return
    const active = { current: true }
    setSourcesError(null)
    // don't flip on overlay; we only show overlay when showPrefill is true
    setLoadingSources(true)
    loadSources(active)
    return () => {
      active.current = false
    }
  }, [hasMapped, graph, form.id, dataSources.length])

  if (!keys.length) {
    return (
      <section aria-label="Fields list">
        <p>No fields defined for this form.</p>
      </section>
    )
  }

  const openPrefill = (key: string) => {
    setSelectedFieldKey(key)
    setShowPrefill(true)
  }

  const closePrefill = () => {
    setShowPrefill(false)
    setSelectedFieldKey(null)
  }

  const clearMapping = (key: string) => {
    if (onUpdateMapping) onUpdateMapping(key, null)
  }

  return (
    <section aria-label="Fields list" className="stack">
      {keys.map((key) => {
        const selection = mappings && mappings[key]
        const isMapped = Boolean(selection)

        if (!isMapped) {
          return (
            <button
              key={key}
              type="button"
              onClick={() => openPrefill(key)}
              className="card card--muted card--clickable p-8"
              aria-label={`Configure prefill for ${key}`}
              title={`Configure prefill for ${key}`}
            >
              {key}
            </button>
          )
        }

        const ds = selection
          ? dataSources.find((d) => d.id === selection.dataSourceId)
          : undefined
        const dsName = ds?.name ?? selection?.dataSourceId ?? 'Unknown source'
        const mappedText = `${key}: ${dsName}.${selection?.sourceFieldKey ?? ''}`

        return (
          <div
            key={key}
            className="card card--muted p-8"
            aria-label={`Prefill set for ${key}`}
            title={mappedText}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}
          >
            <span>{mappedText}</span>
            <button
              type="button"
              onClick={() => clearMapping(key)}
              className="btn btn--ghost"
              aria-label={`Clear mapping for ${key}`}
              title={`Clear mapping for ${key}`}
            >
              ×
            </button>
          </div>
        )
      })}

      {showPrefill && (
        <div>
          {sourcesError ? (
            <div role="alert" className="alert alert--error">
              <p className="m-0 fw-600">Failed to load data sources</p>
              <pre className="pre-wrap">{sourcesError}</pre>
            </div>
          ) : null}

          {/* While loading, still render modal with empty list to keep UX predictable */}
          <PrefillModal
            dataSources={dataSources}
            onCancel={closePrefill}
            onSelect={({ dataSourceId, fieldKey: sourceFieldKey }) => {
              if (selectedFieldKey && onUpdateMapping) {
                const selection: PrefillSelection = { dataSourceId, sourceFieldKey }
                onUpdateMapping(selectedFieldKey, selection)
              }
              closePrefill()
            }}
          />

          {loadingSources && (
            <div className="overlay overlay--center" aria-hidden>
              <div className="modal">
                <p className="m-0">Loading data sources…</p>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

// Import placed at bottom to avoid potential circular import ordering issues in some bundlers
import { PrefillModal } from './PrefillModal'
