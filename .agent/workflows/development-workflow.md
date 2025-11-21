---
description: Development workflow and best practices for this repository
---

# Development Workflow

This document outlines the development workflow and best practices for this Next.js + TypeScript + Effect-TS project.

## Before Every Commit

Always run the following commands before committing and pushing:

```bash
npm run lint:fix && npm run lint && npm run check-typescript && npm run build
```

This ensures:
- ✅ Code passes linting rules (auto-fixed where possible)
- ✅ TypeScript type checking passes
- ✅ Next.js build completes successfully

## GitHub Actions CI/CD

The repository uses GitHub Actions for continuous integration and deployment.

### Workflow File
`.github/workflows/deploy.yml`

### Triggers
- **Push to main**: Runs on every push to the main branch
- **Schedule**: Runs hourly via cron (`0 * * * *`)
- **Manual**: Can be triggered via `workflow_dispatch`

### Build Steps
1. **Install dependencies**: `npm ci`
2. **Build Next.js app**: `npm run build`
3. **Build Storybook**: `npm run build-storybook` (validates Storybook builds)
4. **Upload artifact**: Prepares the `out` directory for deployment
5. **Deploy to GitHub Pages**: Deploys the static site

### Concurrency
The workflow uses a concurrency group (`pages`) with `cancel-in-progress: true`, which means:
- Only one deployment runs at a time
- New runs cancel in-progress runs

### Monitoring CI Status

After pushing changes:
1. Wait 2-3 minutes for the workflow to complete
2. Check status at: `https://github.com/nlisgo/nextjs-typescript-effect-ts/actions`
3. Or use the GitHub API: `https://api.github.com/repos/nlisgo/nextjs-typescript-effect-ts/actions/runs?per_page=5`

## Project Structure

### Key Directories
- `src/app/`: Next.js app router pages
- `src/components/`: React components with Storybook stories
- `src/services/`: Shared services (e.g., `AppRuntime.ts` for Effect resource provisioning)
- `src/queries/`: Data fetching logic using Effect-TS
- `src/codecs/`: Schema validation using Effect Schema
- `src/types/`: TypeScript type definitions
- `.storybook/`: Storybook configuration

### Effect-TS Resource Provisioning

All Effect resources are centralized in `src/services/AppRuntime.ts`:
- Exports `MainLayer` which includes `FetchHttpClient.layer`
- All `page.tsx` files use `Effect.provide(MainLayer)` instead of providing layers individually
- To add new resources, update `MainLayer` in `AppRuntime.ts`

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build Next.js app for production
- `npm run start`: Serve the built app locally
- `npm run lint`: Run ESLint
- `npm run lint:fix`: Auto-fix ESLint issues
- `npm run check-typescript`: Type check without emitting files
- `npm run watch-typescript`: Type check in watch mode
- `npm run storybook`: Start Storybook dev server
- `npm run build-storybook`: Build Storybook for production

## Deployment

The site is automatically deployed to GitHub Pages at:
`https://nlisgo.github.io/nextjs-typescript-effect-ts`

Deployment happens automatically when:
- Changes are pushed to main (after CI passes)
- The hourly scheduled workflow runs
