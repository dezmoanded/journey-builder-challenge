import { useState } from 'react'
import { FormsList } from '@/features/forms'
import type { GraphForm } from '@/features/forms'
import { FieldsList } from '@/features/fields'

export default function App() {
  const [selectedForm, setSelectedForm] = useState<GraphForm | null>(null)

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
          <FieldsList form={selectedForm} />
        </section>
      ) : null}
    </main>
  )
}
