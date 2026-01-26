import type { GraphForm } from '../forms'

export type FieldsListProps = {
  form: GraphForm
}

export function FieldsList({ form }: FieldsListProps) {
  const properties = (form.field_schema as any)?.properties ?? {}
  const keys = Object.keys(properties)

  if (!keys.length) {
    return (
      <section aria-label="Fields list">
        <p>No fields defined for this form.</p>
      </section>
    )
  }

  return (
    <section aria-label="Fields list" style={{ display: 'grid', gap: 8 }}>
      {keys.map((key) => (
        <div
          key={key}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            backgroundColor: '#f3f4f6', // light gray background
            border: '1px solid #e5e7eb', // subtle gray border
          }}
        >
          {key}
        </div>
      ))}
    </section>
  )
}
