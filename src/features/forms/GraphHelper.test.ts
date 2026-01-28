import { describe, it, expect } from 'vitest'
import { getFormDataSources } from './GraphHelper'
import type { Graph } from './types'

const nodeA = {
  id: 'node-a',
  type: 'form',
  position: { x: 0, y: 0 },
  data: {
    id: 'node-a',
    component_key: 'form',
    component_type: 'form',
    component_id: 'form-a',
    name: 'Form A Node',
    prerequisites: [],
    permitted_roles: [],
    input_mapping: {},
    sla_duration: { number: 0, unit: 'minutes' },
    approval_required: false,
    approval_roles: [],
  },
}

const nodeB = {
  id: 'node-b',
  type: 'form',
  position: { x: 100, y: 0 },
  data: {
    id: 'node-b',
    component_key: 'form',
    component_type: 'form',
    component_id: 'form-b',
    name: 'Form B Node',
    prerequisites: [],
    permitted_roles: [],
    input_mapping: {},
    sla_duration: { number: 0, unit: 'minutes' },
    approval_required: false,
    approval_roles: [],
  },
}

function makeGraph(): Graph {
  return {
    $schema: 'https://example.com/schema',
    id: 'graph-1',
    tenant_id: 'tenant-1',
    name: 'Test Graph',
    description: 'Graph for tests',
    category: 'test',
    nodes: [
      nodeA,
      nodeB,
      {
        id: 'node-x',
        type: 'task',
        position: { x: 50, y: -50 },
        data: {
          id: 'node-x',
          component_key: 'task',
          component_type: 'task',
          component_id: 'task-1',
          name: 'Task Node',
          prerequisites: [],
          permitted_roles: [],
          input_mapping: {},
          sla_duration: { number: 0, unit: 'minutes' },
          approval_required: false,
          approval_roles: [],
        },
      },
    ],
    edges: [
      { source: 'node-a', target: 'node-b' },
      { source: 'node-a', target: 'node-b' }, // duplicate edge to test de-duping
      { source: 'node-x', target: 'node-b' }, // non-form upstream
    ],
    forms: [
      {
        id: 'form-a',
        name: 'Form A',
        description: 'Form A desc',
        is_reusable: true,
        field_schema: {
          type: 'object',
          properties: {
            first_name: { type: 'string', title: 'First name' },
            age: { type: 'number', title: 'Age' },
          },
        },
        ui_schema: { type: 'VerticalLayout', elements: [] },
        dynamic_field_config: {},
      },
      {
        id: 'form-b',
        name: 'Form B',
        description: 'Form B desc',
        is_reusable: false,
        field_schema: {
          type: 'object',
          properties: {
            email: { type: 'string', title: 'Email' },
          },
        },
        ui_schema: { type: 'VerticalLayout', elements: [] },
        dynamic_field_config: {},
      },
      // A form without a node to exercise fallback in getNodeName
      {
        id: 'form-c',
        name: 'Form C',
        description: 'Form C desc',
        is_reusable: false,
        field_schema: { type: 'object', properties: {} },
        ui_schema: { type: 'VerticalLayout', elements: [] },
        dynamic_field_config: {},
      },
    ],
    branches: [],
    triggers: [],
  }
}

describe('GraphHelper.getFormDataSources', () => {
  it('returns upstream form nodes as DataSources with fields and type="form"', () => {
    const graph = makeGraph()
    const sources = getFormDataSources(graph, nodeB)
    expect(Array.isArray(sources)).toBe(true)
    expect(sources.length).toBe(1) // only Form A should be included

    const ds = sources[0]
    expect(ds).toMatchObject({ id: 'node-a', name: 'Form A Node', type: 'form' })
    // ensure fields are mapped from the upstream form's field_schema
    expect(Object.keys(ds.fields).sort()).toEqual(['age', 'first_name'])
    expect(ds.fields.first_name.type).toBe('string')
  })

  it('ignores non-form upstream nodes and de-duplicates sources', () => {
    const graph = makeGraph()
    const sources = getFormDataSources(graph, nodeB)
    // We already asserted length 1 above; reiterate here in case tests are split
    expect(sources.map((s) => s.id)).toEqual(['node-a'])
  })

  it('returns an empty list when the form has no upstream form nodes', () => {
    const graph = makeGraph()
    const sources = getFormDataSources(graph, nodeA)
    expect(sources).toEqual([])
  })
})
