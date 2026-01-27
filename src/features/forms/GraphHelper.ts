// Utilities for working with the Forms Blueprint Graph
import type { Graph, GraphNode } from './types'
import type { DataSource } from '../fields/types'

function getNode(graph: Graph, formId: string): GraphNode | undefined {
  if (graph && formId) {
    return graph.nodes.find(node => formId == node.data.component_id)
  }
}

/**
 * Returns the display name for the node that corresponds to the given form ID.
 */
export function getNodeName(graph: Graph, formId: string): string {
  if (graph && formId) {
    const matched = getNode(graph, formId)
    const name = matched?.data?.name
    if (name) return name
  }

  return formId
}

/**
 * Returns the list of data sources available to the given form within the provided graph.
 */
export function getFormDataSources(graph: Graph, formId: string): DataSource[] {
  console.log("[getFormDataSources]", { graph, formId })
  return [...getDirectFormDataSources(graph, formId), ...getIndirectFormDataSources(graph, formId)]
}

function getDirectFormDataSources(graph: Graph, formId: string): DataSource[] {
  const node = getNode(graph, formId)
  if (node) {
    const direct = findUpstreamNodes(graph, new Set([node]))
    console.log("[getDirectFormDataSources]", { direct })
    return Array.from(direct).flatMap(node => {
      const ds = dataSourceFromNode(graph, node)
      return ds ? [ds] : []
    })
  }
  return []
}

function getIndirectFormDataSources(graph: Graph, formId: string): DataSource[] {
  const node = getNode(graph, formId)
  if (node) {
    let next = findUpstreamNodes(graph, new Set([node]))
    let depth = 0
    const results = new Set<GraphNode>()
    while (next.size > 0 && depth < 30) {
      next = findUpstreamNodes(graph, next)
      for (const n of next) {
        results.add(n)
      }
      depth += 1
    }
    return Array.from(results).flatMap(n => {
      const ds = dataSourceFromNode(graph, n)
      return ds ? [ds] : []
    })
  }

  return []
}

function findUpstreamNodes(graph: Graph, nodes: Set<GraphNode>): Set<GraphNode> {
  const result = new Set<GraphNode>()
  for (const node of nodes) {
    for (const edge of graph.edges) {
      if (edge.target == node.id) {
        const sourceNode = graph.nodes.find(n => n.id == edge.source)
        if (sourceNode) result.add(sourceNode)
      }
    }
  }
  return result
}

function dataSourceFromNode(graph: Graph, node: GraphNode): DataSource | undefined {
  const form = graph.forms.find(form => form.id == node.data.component_id)
  if (form) {
    return {
      id: form.id,
      name: node.data.name,
      type: 'form',
      fields: form.field_schema.properties,
    }
  }
}
