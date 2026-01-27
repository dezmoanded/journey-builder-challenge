// Local storage–backed store for field prefill mappings
// Keeps persistence concerns separated from UI components

import type {
  PrefillMappingsByForm,
  FieldPrefillMapping,
  PrefillSelection,
} from './types'

const STORAGE_KEY = 'prefillMappings'

// In-memory fallback for non-browser/test environments
let memoryStore: PrefillMappingsByForm = {}

function hasLocalStorage(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.localStorage
  } catch {
    return false
  }
}

function readAll(): PrefillMappingsByForm {
  if (!hasLocalStorage()) return memoryStore
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    return (parsed ?? {}) as PrefillMappingsByForm
  } catch {
    return {}
  }
}

function writeAll(data: PrefillMappingsByForm): void {
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
  getAll(): PrefillMappingsByForm {
    return readAll()
  },

  // Replace complete mapping object
  setAll(mappings: PrefillMappingsByForm): void {
    writeAll(mappings)
  },

  // Get mappings for a specific form
  getForForm(formId: string): FieldPrefillMapping {
    const all = readAll()
    return all[formId] ?? {}
  },

  // Overwrite mappings for a specific form
  setForForm(formId: string, mappings: FieldPrefillMapping): void {
    const all = readAll()
    all[formId] = { ...mappings }
    writeAll(all)
  },

  // Set/replace a single field mapping for a form
  set(formId: string, fieldKey: string, selection: PrefillSelection): void {
    const all = readAll()
    const formMappings = all[formId] ?? {}
    formMappings[fieldKey] = { ...selection }
    all[formId] = formMappings
    writeAll(all)
  },

  // Remove a field mapping for a form
  remove(formId: string, fieldKey: string): void {
    const all = readAll()
    const formMappings = all[formId]
    if (!formMappings) return
    if (fieldKey in formMappings) {
      delete formMappings[fieldKey]
      all[formId] = formMappings
      writeAll(all)
    }
  },

  // Clear all mappings (for all forms)
  clear(): void {
    writeAll({})
  },
}
