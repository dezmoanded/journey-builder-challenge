import { describe, it, expect } from 'vitest'
import { getNodeName } from './GraphHelper'
import type { Graph } from './types'

// Minimal valid Graph fixture for type safety
const graphFixture: Graph = {
  $schema: 'http://example.com/schema',
  id: 'graph_1',
  tenant_id: 'tenant_1',
  name: 'Test Graph',
  description: 'A graph used for testing',
  category: 'test',
  nodes: [],
  edges: [],
  forms: [],
  branches: [],
  triggers: [],
}

describe('GraphHelper.getNodeName', () => {
  it('throws not implemented for now', () => {
    expect(() => getNodeName(graphFixture, 'form_123')).toThrow(/not implemented/i)
  })
})
