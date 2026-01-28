# Journey Builder React Coding Challenge

- Video: https://drive.google.com/file/d/1Am0gRyhVM0xTXJSdBFUqam0Qbs2zoxwK/view?usp=sharing

What this implements
- Fetch blueprint graph from the mock server and render a simple list of forms.
- Select a form to view its fields and configure prefill mappings.
- Map from three data source types: direct upstream forms, transitive upstream forms, and global data. Clear a mapping with the X button.

Quick start
1) Prereqs: Node 18+ and npm
2) Start the mock API server (required)
   - Repo: https://github.com/mosaic-avantos/frontendchallengeserver
   - Follow its README to run it locally, and ensure it’s reachable at http://localhost:3000
3) Install and run the app
   - npm install
   - npm run dev
   - Open http://localhost:5173

Testing and scripts
- npm run test        # run tests once (Vitest + React Testing Library)
- npm run test:watch  # watch mode
- npm run lint        # ESLint
- npm run format      # Prettier
- npm run build / npm run preview

Extending data sources (how to add new ones)
- Data source contract: see src/features/fields/types.ts (type DataSource)
- Current providers:
  - Upstream forms: src/features/forms/GraphHelper.ts#getFormDataSources(graph, node)
  - Global data: src/api/index.ts#fetchGlobalDataSources()
- To add a new source, implement a provider that returns DataSource[] and compose it where the field mapping UI gathers sources (FieldsList). No UI changes are required as long as you return DataSource objects.

Patterns
- Separation into modules under features/ (forms and fields), public interfaces and types exposed in index.ts
- Data models and hooks are passed into composable UI components (FormsList, FieldsList, PrefillModal). Coordination logic is handled at the top level.
- Integration tests, API client tests, and tests for graph traversal logic (GraphHelper).
