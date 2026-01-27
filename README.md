# Journey Builder Challenge

Video: [https://drive.google.com/file/d/1Am0gRyhVM0xTXJSdBFUqam0Qbs2zoxwK/view?usp=sharing](https://drive.google.com/file/d/1Am0gRyhVM0xTXJSdBFUqam0Qbs2zoxwK/view?usp=sharing)

A small demo scaffolded like a production app: testing (Vitest + RTL), linting (ESLint), and formatting (Prettier). No CI or E2E included per scope.

## Requirements
- Node.js 18+ (Vite 5 compatible)
- npm (or use pnpm/yarn and adjust commands)

## Get Started
```sh
npm install
npm run dev
```
Visit http://localhost:5173

## Scripts
- dev: Start Vite dev server
- build: Type-check then build for production
- preview: Preview the production build locally
- test: Run unit tests once
- test:watch: Run unit tests in watch mode
- lint: Lint source files
- format: Format files with Prettier

## Project Structure
```
src/
  App.tsx
  main.tsx
  setupTests.ts
  components/
    Counter.tsx
    Counter.test.tsx
```

- Path alias: `@` -> `src` (use like `import { X } from '@/components/X'`)
- Vitest uses jsdom and loads `src/setupTests.ts` (adds jest-dom matchers)

## Testing
```sh
npm run test        # run once
npm run test:watch  # watch mode
```

## Linting & Formatting
```sh
npm run lint
npm run format
```

## Notes
- Keep components small and colocate tests next to them for discoverability.
- Expand structure (features/, pages/, lib/) as the demo grows.
