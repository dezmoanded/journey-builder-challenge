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
      {
        id: 'node-2',
        type: 'form',
        position: { x: -100, y: -100 },
        data: {
          id: 'node-2',
          component_key: 'form_two',
          component_type: 'form',
          component_id: 'form-2',
          name: 'Form Two',
          prerequisites: [],
          permitted_roles: [],
          input_mapping: {},
          sla_duration: { number: 0, unit: 's' },
          approval_required: false,
          approval_roles: [],
        },
      },
    ],
    // node-2 (Form Two) feeds into node-1 (Form One)
    edges: [
      { id: 'e-2-1', source: 'node-2', target: 'node-1' },
    ],
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
      {
        id: 'form-2',
        name: 'Form Two',
        description: 'Upstream form with fields to map from',
        is_reusable: false,
        field_schema: {
          type: 'object',
          properties: {
            company_name: { type: 'string', title: 'Company Name' },
            employee_count: { type: 'number', title: 'Employee Count' },
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
  it('clicking a form shows its fields; clicking a field opens modal; selecting from a global data source updates the label', async () => {
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

    // Modal appears; expand the global data source
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

  it('maps a field from a form data source and then clears the mapping', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Select the downstream form (Form One)
    const formsRegion = await screen.findByRole('region', { name: /forms list/i })
    const [selectFormBtn] = within(formsRegion).getAllByRole('button', { name: /select form/i })
    await user.click(selectFormBtn)

    // Open configure for email
    const emailBtn = await screen.findByRole('button', {
      name: /configure prefill for email/i,
    })
    await user.click(emailBtn)

    // Modal appears; expand the upstream form data source (Form Two)
    const dialog = await screen.findByRole('dialog', { name: /select data element to map/i })
    const formTwoToggle = await within(dialog).findByRole('button', { name: /form two/i })
    await user.click(formTwoToggle)

    // Choose a field from Form Two and confirm
    const companyBtn = await within(dialog).findByRole('button', { name: /company name/i })
    await user.click(companyBtn)
    const selectBtn = await within(dialog).findByRole('button', { name: /select/i })
    await user.click(selectBtn)

    // Assert mapped label reflects the form DS name and field key
    await waitFor(() => {
      expect(
        screen.getByText(/email: form two\.company_name/i)
      ).toBeInTheDocument()
    })

    // Clear the mapping and verify it returns to unmapped state
    const clearBtn = await screen.findByRole('button', { name: /clear mapping for email/i })
    await user.click(clearBtn)
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /configure prefill for email/i })
      ).toBeInTheDocument()
    })
  })
})
