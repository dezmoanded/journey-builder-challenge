import type { Graph } from './types'

export type FormsApiOptions = {
  baseUrl?: string
  fetchImpl?: typeof fetch
}

// Factory to create a Forms API client with configurable base URL and fetch implementation
export function createFormsApi(options: FormsApiOptions = {}) {
  const baseUrl = options.baseUrl ?? (import.meta as any)?.env?.VITE_API_BASE_URL ?? 'http://localhost:3000'
  const fetcher = options.fetchImpl ?? fetch

  function buildUrl(path: string) {
    // Support baseUrl with or without trailing slash
    const url = new URL(path, baseUrl.endsWith('/') ? baseUrl : baseUrl + '/')
    return url.toString()
  }

  // GET /api/v1/:tenantId/actions/blueprints/:blueprintId/graph
  async function getBlueprintGraph(tenantId: string, blueprintId: string): Promise<Graph> {
    const url = buildUrl(`api/v1/${encodeURIComponent(tenantId)}/actions/blueprints/${encodeURIComponent(blueprintId)}/graph`)

    const res = await fetcher(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json, application/problem+json',
      },
    })

    const text = await res.text()
    let body: unknown = undefined
    try {
      body = text ? JSON.parse(text) : undefined
    } catch {
      // non-JSON body; leave as text
      body = text
    }

    if (!res.ok) {
      const err = new Error(`GET ${url} failed: ${res.status} ${res.statusText}`)
      ;(err as any).status = res.status
      ;(err as any).body = body
      throw err
    }

    return body as Graph
  }

  return {
    getBlueprintGraph,
  }
}
