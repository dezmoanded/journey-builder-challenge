// Types for the Forms Blueprint Graph API
import type { JSONSchema } from '../fields/types'

// Lightweight identifiers and summaries
export type FormId = string
export type FormSummary = {
  id: FormId
  name: string
  description?: string
  is_reusable?: boolean
}

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
