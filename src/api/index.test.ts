import { describe, it, expect, vi } from 'vitest'
import { createFormsApi, fetchGlobalDataSources } from './index'

function okResponse(body: unknown) {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    text: async () => JSON.stringify(body),
  } as any
}

function errorResponse(status: number, statusText: string, body: unknown) {
  return {
    ok: false,
    status,
    statusText,
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  } as any
}

describe('createFormsApi.getBlueprintGraph', () => {
  it('builds the correct URL, performs GET, and returns parsed JSON on success', async () => {
    const graph = { nodes: [], edges: [], forms: [] }
    const fetchMock = vi.fn(async () => okResponse(graph))
    const api = createFormsApi({ baseUrl: 'https://api.example.com', fetchImpl: fetchMock as any })

    const result = await api.getBlueprintGraph('tenant-1', 'bp_123')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const calledUrl = (fetchMock.mock.calls[0] as any)[0] as string
    const calledInit = (fetchMock.mock.calls[0] as any)[1] as RequestInit

    expect(calledUrl).toBe(
      'https://api.example.com/api/v1/tenant-1/actions/blueprints/bp_123/graph'
    )
    expect(calledInit?.method).toBe('GET')
    expect(result).toEqual(graph)
  })

  it('throws an error with status and parsed body on non-ok responses', async () => {
    const body = { message: 'Something went wrong' }
    const fetchMock = vi.fn(async () => errorResponse(500, 'Internal Server Error', body))
    const api = createFormsApi({ baseUrl: 'http://localhost:9999', fetchImpl: fetchMock as any })

    await expect(api.getBlueprintGraph('t', 'bp')).rejects.toMatchObject({
      status: 500,
      body,
    })

    // Also assert message contains method, url and status for debugging
    try {
      await api.getBlueprintGraph('t', 'bp')
    } catch (e) {
      const err = e as any
      expect(String(err.message)).toMatch(/GET .*\/api\/v1\/t\/actions\/blueprints\/bp\/graph failed: 500/)
    }
  })
})

describe('fetchGlobalDataSources', () => {
  it('returns the known set of global data sources', async () => {
    const data = await fetchGlobalDataSources()
    const ids = data.map((d) => d.id)
    expect(ids).toContain('global_action_props')
    expect(ids).toContain('global_client_org_props')
  })
})
