// Utilities for working with the Forms Blueprint Graph
import type { Graph } from './types'
import type { DataSource } from '../fields/types'

/**
 * Returns the display name for the node that corresponds to the given form ID.
 * Implementation intentionally omitted; placeholder returns a fallback based on inputs.
 */
export function getNodeName(graph: Graph, formId: string): string {
  // Touch parameters to satisfy strict unused checks while this is a stub.
  if (graph && formId) {
    // no-op: when implemented, use `graph` to resolve a friendly display name for `formId`.
  }
  // Fallback: return the formId (or empty string) as a best-effort label.
  return formId || ''
}

/**
 * Returns the list of data sources available to the given form within the provided graph.
 * Stub implementation; will be implemented to inspect graph topology and form configuration.
 */
export function getFormDataSources(graph: Graph, formId: string): DataSource[] {
  // Touch parameters to satisfy strict unused checks while this is a stub.
  if (graph && formId) {
    // no-op: when implemented, derive data sources relevant to this form.
  }
  return []
}
