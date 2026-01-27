import { useEffect, useState } from 'react'
import { FormsList } from '@/features/forms'
import type { GraphForm } from '@/features/forms'
import { FieldsList } from '@/features/fields'
import { prefillStore } from '@/features/fields'
import type { FieldPrefillMapping, PrefillSelection } from '@/features/fields'

export default function App() {
  const [selectedForm, setSelectedForm] = useState<GraphForm | null>(null)
  const [mappings, setMappings] = useState<FieldPrefillMapping>({})

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
    <main style={{ padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Journey Builder Challenge</h1>

      <section>
        <h2 style={{ marginTop: 16 }}>Forms</h2>
        <FormsList onSelect={setSelectedForm} />
      </section>

      {selectedForm ? (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ marginTop: 16, marginBottom: 0 }}>
              Fields for: {selectedForm.name || 'Untitled form'}
            </h2>
            <button
              type="button"
              onClick={() => setSelectedForm(null)}
              style={{ marginTop: 16 }}
              aria-label="Clear selected form"
            >
              Clear selection
            </button>
          </div>
          <FieldsList
            form={selectedForm}
            mappings={mappings}
            onUpdateMapping={handleUpdateMapping}
          />
        </section>
      ) : null}
    </main>
  )
}
