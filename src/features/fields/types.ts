// Shared types for fields and related schema

export type JSONSchema = {
  type: 'object'
  properties: Record<string, JSONSchemaProperty>
  required?: string[]
}

export type JSONSchemaProperty = {
  type: string // e.g., 'string' | 'array' | 'object' | ...
  title?: string
  format?: string
  enum?: any[] | null
  items?: { type: string; enum?: any[] }
  uniqueItems?: boolean
  avantos_type?: string
}

// A data source that exposes a set of fields that can be mapped
export type DataSource = {
  id: string
  name: string
  // where this data source comes from (e.g., 'global', 'form', etc.)
  type: string
  // Map of field key to its schema
  fields: Record<string, JSONSchemaProperty>
}

// Stronger identity aliases
export type DataSourceId = DataSource['id']

// Mapping models for field prefill selections
export type FieldKey = string
export type PrefillSelection = {
  dataSourceId: DataSourceId // points to a DataSource.id
  // key of the field on the selected DataSource
  sourceFieldKey: string
}

// Map of a node's field keys to the selected data source field
export type FieldPrefillMapping = Record<FieldKey, PrefillSelection>

// Top-level map of node id -> field mappings
export type PrefillMappingsByNode = Record<string, FieldPrefillMapping>
