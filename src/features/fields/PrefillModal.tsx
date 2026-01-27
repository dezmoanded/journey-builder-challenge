import { useState } from 'react'
import '../../styles/ui.css'
import type { DataSource, JSONSchemaProperty } from './types'

export type PrefillModalProps = {
  dataSources: DataSource[]
  onCancel: () => void
  onSelect: (selection: {
    dataSourceId: string
    fieldKey: string
    field: JSONSchemaProperty
  }) => void
}

export function PrefillModal({ dataSources, onCancel, onSelect }: PrefillModalProps) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [selected, setSelected] = useState<{
    dataSourceId: string
    fieldKey: string
  } | null>(null)

  const handleSelect = () => {
    if (!selected) return
    const ds = dataSources.find((d) => d.id === selected.dataSourceId)
    if (!ds) return
    const field = ds.fields[selected.fieldKey]
    if (!field) return
    onSelect({ dataSourceId: ds.id, fieldKey: selected.fieldKey, field })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="prefill-modal-title"
      className="overlay overlay--center"
    >
      <div className="modal">
        <h2 id="prefill-modal-title" className="m-0 mb-4">
          Select data element to map
        </h2>

        <div className="stack">
          {dataSources.map((ds) => {
            const isOpen = expanded === ds.id
            return (
              <div key={ds.id} className="accordion">
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : ds.id)}
                  aria-expanded={isOpen}
                  className="accordion__trigger"
                >
                  {ds.name}
                </button>

                {isOpen && (
                  <div className="accordion__content stack-sm">
                    {Object.keys(ds.fields).length === 0 && (
                      <div className="p-8 text-muted">No fields available</div>
                    )}
                    {Object.entries(ds.fields).map(([key, field]) => {
                      const isSelected = selected?.dataSourceId === ds.id && selected?.fieldKey === key
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelected({ dataSourceId: ds.id, fieldKey: key })}
                          className={`list-item${isSelected ? ' is-selected' : ''}`}
                          title={field.title || key}
                        >
                          <div className="fw-600">{field.title ?? key}</div>
                          <div className="text-sm text-muted">{field.type}</div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="modal__footer">
          <button type="button" onClick={onCancel} className="btn btn--secondary">
            CANCEL
          </button>
          <button
            type="button"
            onClick={handleSelect}
            disabled={!selected}
            className="btn btn--primary"
          >
            SELECT
          </button>
        </div>
      </div>
    </div>
  )
}
