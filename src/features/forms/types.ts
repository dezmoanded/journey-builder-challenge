// Types for the Forms Blueprint Graph API

export type Graph = {
  $schema: string
  id: string
  tenant_id: string
  name: string
  description: string
  category: string
  nodes: GraphNode[]
  edges: GraphEdge[]
  forms: GraphForm[]
  branches: unknown[]
  triggers: unknown[]
}

export type GraphNode = {
  id: string
  type: string // e.g., "form"
  position: Position
  data: NodeData
}

export type Position = { x: number; y: number }

export type NodeData = {
  id: string
  component_key: string
  component_type: string // e.g., "form"
  component_id: string
  name: string
  prerequisites: string[]
  permitted_roles: string[]
  input_mapping: Record<string, unknown>
  sla_duration: { number: number; unit: string }
  approval_required: boolean
  approval_roles: string[]
}

export type GraphEdge = { source: string; target: string }

export type GraphForm = {
  id: string
  name: string
  description: string
  is_reusable: boolean
  field_schema: JSONSchema
  ui_schema: UISchema
  dynamic_field_config: Record<string, DynamicFieldConfig>
}

// Minimal JSON Schema subset used by the API
export type JSONSchema = {
  type: 'object'
  properties: Record<string, JSONSchemaProperty>
  required?: string[]
}

export type JSONSchemaProperty = {
  type: string // 'string' | 'array' | 'object' | ...
  title?: string
  format?: string
  enum?: any[] | null
  items?: { type: string; enum?: any[] }
  uniqueItems?: boolean
  avantos_type?: string
}

export type UISchema = {
  type: string // e.g., 'VerticalLayout'
  elements: Array<UISchemaElement>
}

export type UISchemaElement = {
  type: 'Control' | 'Button' | string
  scope: string
  label?: string
  options?: Record<string, unknown>
}

export type DynamicFieldConfig = {
  selector_field: string
  payload_fields: Record<string, { type: 'form_field'; value: string }>
  endpoint_id: string
}
