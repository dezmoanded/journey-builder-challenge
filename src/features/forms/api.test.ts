import { describe, it, expect, vi } from 'vitest'
import { createFormsApi } from './api'
import type { Graph } from './types'

describe('forms API', () => {
  it('builds the correct URL and returns parsed graph', async () => {
    const mockFetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      expect(url).toBe('https://example.com/api/v1/123/actions/blueprints/bp_456/graph')

      const graph: Graph = {
        $schema: 'https://schemas/ActionBlueprintGraphDescription.json',
        id: 'bp_123',
        tenant_id: '123',
        name: 'Demo',
        description: 'desc',
        category: 'cat',
        nodes: [],
        edges: [],
        forms: [],
        branches: [],
        triggers: [],
      }

      return new Response(JSON.stringify(graph), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }) as any
    })

    const api = createFormsApi({ baseUrl: 'https://example.com', fetchImpl: mockFetch as any })
    const data = await api.getBlueprintGraph('123', 'bp_456')

    expect(data.id).toBe('bp_123')
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('throws a helpful error on non-2xx', async () => {
    const mockFetch = vi.fn(async () => {
      return new Response(JSON.stringify({ error: 'not found' }), {
        status: 404,
        statusText: 'Not Found',
        headers: { 'Content-Type': 'application/json' },
      }) as any
    })

    const api = createFormsApi({ baseUrl: 'https://example.com', fetchImpl: mockFetch as any })

    await expect(api.getBlueprintGraph('t', 'bp')).rejects.toMatchObject({
      message: expect.stringContaining('failed: 404'),
      status: 404,
    })
  })
})
