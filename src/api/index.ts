import type { Graph } from '../features/forms/types'
import type { DataSource, JSONSchemaProperty } from '../features/fields/types'

export type FormsApiOptions = {
  baseUrl?: string
  fetchImpl?: typeof fetch
}

// Centralized API: Forms API + shared data sources mocks
export function createFormsApi(options: FormsApiOptions = {}) {
  const baseUrl = options.baseUrl ?? (import.meta as any)?.env?.VITE_API_BASE_URL ?? 'http://localhost:3000'
  const fetcher = options.fetchImpl ?? fetch

  function buildUrl(path: string) {
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

// Mock: fetch global data sources for field prefill mapping
export async function fetchGlobalDataSources(): Promise<DataSource[]> {
  // Simulate a small async delay if desired
  // await new Promise((r) => setTimeout(r, 50))

  const s = (overrides: Partial<JSONSchemaProperty> = {}): JSONSchemaProperty => ({ type: 'string', ...overrides })
  const n = (overrides: Partial<JSONSchemaProperty> = {}): JSONSchemaProperty => ({ type: 'number', ...overrides })
  const b = (overrides: Partial<JSONSchemaProperty> = {}): JSONSchemaProperty => ({ type: 'boolean', ...overrides })

  const data: DataSource[] = [
    {
      id: 'global_action_props',
      name: 'Action Properties',
      type: 'global',
      fields: {
        action_id: s({ title: 'Action ID' }),
        action_name: s({ title: 'Action Name' }),
        created_at: s({ title: 'Created At', format: 'date-time' }),
        retries: n({ title: 'Retry Count' }),
        success: b({ title: 'Was Successful' }),
      },
    },
    {
      id: 'global_client_org_props',
      name: 'Client Organisation Properties',
      type: 'global',
      fields: {
        org_id: s({ title: 'Organisation ID' }),
        org_name: s({ title: 'Organisation Name' }),
        industry: s({ title: 'Industry' }),
        employee_count: n({ title: 'Employee Count' }),
        is_active: b({ title: 'Active' }),
      },
    },
  ]

  return data
}
