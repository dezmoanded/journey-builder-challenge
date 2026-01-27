import '../../styles/ui.css'
import { getNodeName } from './GraphHelper'
import type { Graph, GraphForm } from './types'

export type FormsListProps = {
  graph?: Graph | null
  onSelect?: (form: GraphForm) => void
}

export function FormsList({ graph, onSelect }: FormsListProps) {
  const forms = Array.isArray(graph?.forms) ? graph!.forms : []

  if (!forms.length) {
    return <p>No forms found.</p>
  }

  const clickable = typeof onSelect === 'function'

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
              onClick={() => onSelect?.(f)}
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
