import '../../styles/ui.css'
import type { Graph, GraphNode } from './types'

export type FormsListProps = {
  graph: Graph
  onSelect: (node: GraphNode) => void
}

export function FormsList({ graph, onSelect }: FormsListProps) {
  const nodes = graph.nodes || []

  if (!nodes.length) {
    return (
      <section aria-label="Forms list">
        <p>No nodes found.</p>
      </section>
    )
  }

  return (
    <section aria-label="Forms list" className="grid">
      {nodes.map((node) => {
        // Only list nodes that are backed by a form component
        const isFormNode = node?.data?.component_type === 'form'
        if (!isFormNode) return null

        return (
          <button
            key={node.id}
            type="button"
            onClick={() => onSelect(node)}
            className="card card--clickable p-12"
            aria-label={`Select ${node.data?.name || 'node'}`}
            title={node.data?.name || 'Untitled node'}
          >
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="m-0">{node.data?.name || 'Untitled node'}</h3>
            </div>
          </button>
        )
      })}
    </section>
  )
}
