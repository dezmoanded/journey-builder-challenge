import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

// Use a function declaration (hoisted) and define all values inside the factory
function apiMockFactory() {
  const graph = {
    // Provide nodes to match node-centric UI (nodes reference backing forms)
    nodes: [
      {
        id: 'node-1',
        type: 'form',
        position: { x: 0, y: 0 },
        data: {
          id: 'node-1',
          component_key: 'form_one',
          component_type: 'form',
          component_id: 'form-1',
          name: 'Form One',
          prerequisites: [],
          permitted_roles: [],
          input_mapping: {},
          sla_duration: { number: 0, unit: 's' },
          approval_required: false,
          approval_roles: [],
        },
      },
    ],
    edges: [],
    forms: [
      {
        id: 'form-1',
        name: 'Form One',
        description: 'Form for integration test',
        is_reusable: false,
        field_schema: {
          type: 'object',
          properties: {
            first_name: { type: 'string', title: 'First name' },
            email: { type: 'string', title: 'Email' },
          },
        },
        ui_schema: { type: 'VerticalLayout', elements: [] },
        dynamic_field_config: {},
      },
    ],
  }

  return {
    createFormsApi: () => ({
      // match signature in FormsList: getBlueprintGraph(tenantId, blueprintId)
      getBlueprintGraph: async () => graph as any,
    }),
    fetchGlobalDataSources: async () => [
      {
        id: 'global_action_props',
        name: 'Action Properties',
        type: 'global',
        fields: {
          action_id: { type: 'string', title: 'Action ID' },
          action_name: { type: 'string', title: 'Action Name' },
        },
      },
    ],
  }
}

// Mock both the relative specifier used by code and Vite's resolved id
vi.mock('../../api', () => apiMockFactory())
vi.mock('/src/api/index.ts', () => apiMockFactory())

beforeEach(() => {
  // Ensure clean localStorage state for each run
  window.localStorage.clear()
})

describe('App integration: select form -> open fields -> map field', () => {
  it('clicking a form shows its fields; clicking a field opens modal; selecting updates the label', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Scope to the Forms list landmark to avoid multiple matches
    const formsRegion = await screen.findByRole('region', { name: /forms list/i })
    const [selectFormBtn] = within(formsRegion).getAllByRole('button', { name: /select form/i })
    await user.click(selectFormBtn)

    // FieldsList should show the field buttons (unmapped state)
    const firstNameBtn = await screen.findByRole('button', {
      name: /configure prefill for first_name/i,
    })
    expect(firstNameBtn).toBeInTheDocument()

    // Click the field to open the modal
    await user.click(firstNameBtn)

    // Modal appears; expand the data source
    const dialog = await screen.findByRole('dialog', { name: /select data element to map/i })
    const dsToggle = await within(dialog).findByRole('button', {
      name: /action properties/i,
    })
    await user.click(dsToggle)

    // Select a field from the data source and confirm
    const listItem = await within(dialog).findByRole('button', { name: /action id/i })
    await user.click(listItem)
    const selectBtn = await within(dialog).findByRole('button', { name: /select/i })
    await user.click(selectBtn)

    // After selection, the field card should display the mapped label
    await waitFor(() => {
      expect(
        screen.getByText(/first_name: action properties\.action_id/i)
      ).toBeInTheDocument()
    })
  })
})
