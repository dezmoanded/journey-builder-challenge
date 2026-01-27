// Local storage–backed store for field prefill mappings
// Keeps persistence concerns separated from UI components

import type {
  PrefillMappingsByNode,
  FieldPrefillMapping,
  PrefillSelection,
} from './types'

const STORAGE_KEY = 'prefillMappingsByNode'

// In-memory fallback for non-browser/test environments
let memoryStore: PrefillMappingsByNode = {}

function hasLocalStorage(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.localStorage
  } catch {
    return false
  }
}

function readAll(): PrefillMappingsByNode {
  if (!hasLocalStorage()) return memoryStore
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    return (parsed ?? {}) as PrefillMappingsByNode
  } catch {
    return {}
  }
}

function writeAll(data: PrefillMappingsByNode): void {
  if (!hasLocalStorage()) {
    memoryStore = data
    return
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Ignore quota or serialization errors for now
  }
}

export const prefillStore = {
  // Read complete mapping object
  getAll(): PrefillMappingsByNode {
    return readAll()
  },

  // Replace complete mapping object
  setAll(mappings: PrefillMappingsByNode): void {
    writeAll(mappings)
  },

  // Get mappings for a specific node
  getForNode(nodeId: string): FieldPrefillMapping {
    const all = readAll()
    return all[nodeId] ?? {}
  },

  // Overwrite mappings for a specific node
  setForNode(nodeId: string, mappings: FieldPrefillMapping): void {
    const all = readAll()
    all[nodeId] = { ...mappings }
    writeAll(all)
  },

  // Set/replace a single field mapping for a node
  set(nodeId: string, fieldKey: string, selection: PrefillSelection): void {
    const all = readAll()
    const nodeMappings = all[nodeId] ?? {}
    nodeMappings[fieldKey] = { ...selection }
    all[nodeId] = nodeMappings
    writeAll(all)
  },

  // Remove a field mapping for a node
  remove(nodeId: string, fieldKey: string): void {
    const all = readAll()
    const nodeMappings = all[nodeId]
    if (!nodeMappings) return
    if (fieldKey in nodeMappings) {
      delete nodeMappings[fieldKey]
      all[nodeId] = nodeMappings
      writeAll(all)
    }
  },

  // Clear all mappings (for all nodes)
  clear(): void {
    writeAll({})
  },
}
