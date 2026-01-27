import { useEffect, useMemo, useState } from 'react'
import { FormsList } from './features/forms'
import type { Graph, GraphForm } from './features/forms'
import { FieldsList, prefillStore } from './features/fields'
import type { FieldPrefillMapping, PrefillSelection } from './features/fields'
import { createFormsApi } from './api'
import './styles/ui.css'

export default function App() {
  const [graph, setGraph] = useState<Graph | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [selectedForm, setSelectedForm] = useState<GraphForm | null>(null)
  const [mappings, setMappings] = useState<FieldPrefillMapping>({})

  const tenantId = (import.meta as any).env?.VITE_TENANT_ID ?? '123'
  const blueprintId = (import.meta as any).env?.VITE_BLUEPRINT_ID ?? 'bp_456'

  const api = useMemo(() => createFormsApi(), [])

  // Fetch blueprint graph on load
  useEffect(() => {
    let active = true
    setError(null)

    api
      .getBlueprintGraph(tenantId, blueprintId)
      .then((g) => {
        if (!active) return
        setGraph(g)
      })
      .catch((e) => {
        if (!active) return
        setError(e instanceof Error ? e.message : String(e))
      })

    return () => {
      active = false
    }
  }, [api, tenantId, blueprintId])

  // Load mappings whenever the selected form changes
  useEffect(() => {
    if (!selectedForm) {
      setMappings({})
      return
    }
    const next = prefillStore.getForForm(selectedForm.id)
    setMappings(next)
  }, [selectedForm?.id])

  const handleUpdateMapping = (fieldKey: string, selection: PrefillSelection | null) => {
    if (!selectedForm) return
    const formId = selectedForm.id
    if (selection) {
      prefillStore.set(formId, fieldKey, selection)
      setMappings((prev) => ({ ...prev, [fieldKey]: selection }))
    } else {
      prefillStore.remove(formId, fieldKey)
      setMappings((prev) => {
        const copy = { ...prev }
        delete copy[fieldKey]
        return copy
      })
    }
  }

  return (
    <main className="app">
      <h1>Journey Builder Challenge</h1>

      <section>
        <h2 className="section-title">Forms</h2>
        {error ? (
          <div role="alert" className="alert alert--error">
            <p className="m-0 fw-600">Failed to load forms</p>
            <pre className="pre-wrap">{error}</pre>
            <small>
              Using tenantId={String(tenantId)}, blueprintId={String(blueprintId)}
            </small>
          </div>
        ) : graph ? (
          <FormsList graph={graph} onSelect={setSelectedForm} />
        ) : (
          <p>Loading forms…</p>
        )}
      </section>

      {selectedForm ? (
        <section>
          <div className="row">
            <h2 className="mt-16 mb-0">Fields for: {selectedForm.name || 'Untitled form'}</h2>
            <button
              type="button"
              onClick={() => setSelectedForm(null)}
              className="mt-16"
              aria-label="Clear selected form"
            >
              Clear selection
            </button>
          </div>
          <FieldsList
            form={selectedForm}
            graph={graph ?? undefined}
            mappings={mappings}
            onUpdateMapping={handleUpdateMapping}
          />
        </section>
      ) : null}
    </main>
  )
}
