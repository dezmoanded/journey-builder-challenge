// Utilities for working with the Forms Blueprint Graph
import type { Graph } from './types'

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
