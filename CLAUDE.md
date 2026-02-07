# CLAUDE.md

This file provides guidance for AI assistants working with the ZenHTML Runner codebase.

## Project Overview

ZenHTML Runner is a minimalist HTML/CSS/JS sandbox application built with React 19, TypeScript, and Vite. It provides a split-screen code editor with live preview, a snippet library with folder organization, AI-powered code optimization via Google Gemini, automatic document classification, curriculum-based learning paths, and an analytics dashboard.

## Tech Stack

- **Framework:** React 19 with functional components and hooks
- **Language:** TypeScript (ES2022 target, strict mode)
- **Build Tool:** Vite 6.2
- **Styling:** Tailwind CSS (loaded via CDN in index.html)
- **Fonts:** Inter (UI) and Fira Code (editor) via Google Fonts CDN
- **AI Integration:** Google Gemini (`@google/genai` SDK, model: `gemini-3-flash-preview`)
- **Deployment:** Netlify (SPA redirect config in `netlify.toml`)
- **Storage:** localStorage with backend-swappable abstraction layer

## Project Structure

```
/
├── components/
│   ├── EditorView.tsx        # Split-screen editor + live preview
│   ├── RunnerView.tsx        # Iframe-based HTML execution
│   ├── LibrarySidebar.tsx    # Snippet/folder management sidebar with category filters
│   ├── StatsPanel.tsx        # Analytics dashboard modal (code stats, visualizations)
│   └── CurriculumView.tsx    # Curriculum/learning path manager modal
├── services/
│   ├── geminiService.ts      # Google Gemini AI integration (code optimization)
│   ├── classificationService.ts  # AI + heuristic auto-classification engine
│   ├── analyticsService.ts   # Code analysis & library statistics computation
│   ├── storageService.ts     # Backend abstraction layer (localStorage / API-ready)
│   └── fileUtils.ts          # HTML parsing and filename utilities
├── App.tsx                   # Root component, state management, feature orchestration
├── index.tsx                 # React DOM entry point
├── index.html                # HTML template (CDN imports, import maps)
├── types.ts                  # TypeScript interfaces, enums, and constants
├── vite.config.ts            # Vite config (port 3000, path aliases)
├── tsconfig.json             # TypeScript compiler options
├── package.json              # Dependencies and scripts
├── metadata.json             # App metadata
└── netlify.toml              # Netlify deployment config
```

## Commands

```bash
npm run dev        # Start dev server on port 3000
npm run build      # Production build (output: dist/)
npm run preview    # Preview production build
npm run typecheck  # TypeScript type checking (tsc --noEmit)
```

No test, lint, or formatting commands are configured yet.

## CI/CD

### GitHub Actions

Two workflows in `.github/workflows/`:

- **`ci.yml`** — Runs on push to `main` and on PRs targeting `main`. Steps: install, typecheck, build. Uploads `dist/` as artifact.
- **`deploy.yml`** — Runs on push to `main` (production deploy) and on PRs (preview deploy). Uses `nwtgck/actions-netlify@v3`.

### Netlify

Configured in `netlify.toml`:
- Build: `npm run build` → `dist/`
- Node 20 pinned via `[build.environment]`
- SPA redirect: `/* → /index.html` (status 200)
- Static assets (`/assets/*`): 1-year immutable cache (Vite hashed filenames)
- Security headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`
- Preview/branch deploy contexts configured

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `NETLIFY_AUTH_TOKEN` | Netlify personal access token (Account Settings → Applications → Personal access tokens) |
| `NETLIFY_SITE_ID` | Netlify site ID (Site Settings → General → Site ID) |
| `GEMINI_API_KEY` | Google Gemini API key (for build-time injection) |

## Environment Variables

- `GEMINI_API_KEY` — Required for AI code optimization and auto-classification features. Set in `.env.local`. Injected via Vite's `define` plugin in `vite.config.ts`.

## Architecture

### Component Hierarchy

```
App (state management, localStorage persistence, feature orchestration)
├── EditorView (code textarea + toolbar + embedded RunnerView)
│   └── RunnerView (live preview iframe)
├── LibrarySidebar (snippet list, folders, category filter, tool buttons)
│   ├── CategoryBadge (color-coded category label per snippet)
│   └── DifficultyDot (beginner/intermediate/advanced indicator)
├── StatsPanel [modal] (analytics dashboard with visualizations)
├── CurriculumView [modal] (learning path manager with step tracking)
└── RunnerView (fullscreen execution mode)
```

### State Management

- All app state lives in `App.tsx` using React hooks (`useState`, `useEffect`, `useCallback`, `useMemo`)
- No external state management library
- State is persisted via `storageService.ts` abstraction with these localStorage keys:
  - `zen_html_code_v1` — current code
  - `zen_html_snippets_v1` — snippet data (with category, tags, difficulty)
  - `zen_html_folders_v1` — folder data
  - `zen_html_curriculums_v1` — curriculum data
- Preview updates are debounced at 200ms
- Analytics are memoized with `useMemo` to avoid recomputation

### Key Data Types (defined in `types.ts`)

- `Snippet` — `{ id, name, code, folderId, updatedAt, isLocal?, filePath?, category?, tags?, difficulty? }`
- `Folder` — `{ id, name, isLocal?, parentId? }`
- `Curriculum` — `{ id, name, description, steps[], createdAt, updatedAt }`
- `CurriculumStep` — `{ id, snippetId, order, note, isCompleted }`
- `CodeStats` — per-file analysis (HTML/CSS/JS line counts, tag count, selector count, etc.)
- `LibraryStats` — aggregate library metrics (category distribution, difficulty breakdown, activity)
- `SnippetCategory` enum — Layout, Animation, Form, Game, API Integration, Data Visualization, UI Component, Utility, Landing Page, Uncategorized
- `DifficultyLevel` type — `'beginner' | 'intermediate' | 'advanced'`
- `CATEGORY_COLORS` — color mapping for each category
- `AppConstants` enum — localStorage keys and app defaults

### Service Layer

- **`geminiService.ts`** — `improveCodeWithAI(code)` sends code to Gemini for optimization, strips markdown fencing from response, returns original code on failure
- **`classificationService.ts`** — `classifySnippet(code)` uses Gemini AI to determine category/tags/difficulty; `classifyByHeuristic(code)` provides instant regex-based fallback classification
- **`analyticsService.ts`** — `analyzeCode(code)` returns detailed per-file stats (HTML/CSS/JS lines, tag count, CSS selectors, JS functions, feature detection); `computeLibraryStats(snippets, folders, curriculums)` returns aggregate library metrics
- **`storageService.ts`** — `StorageBackend` interface abstraction with `LocalStorageBackend` implementation; export `storage` singleton; designed for easy swap to REST API backend
- **`fileUtils.ts`** — `extractH1Content()` parses `<h1>` from HTML for naming; `sanitizeFileName()` cleans filenames

### Code Execution

RunnerView renders user code in an iframe using `srcDoc` with sandbox permissions: `allow-scripts allow-forms allow-modals allow-popups allow-same-origin`.

### Feature: Auto-Classification

Snippets can be automatically classified by category, tags, and difficulty level:
- **AI path:** Sends code to Gemini, parses structured JSON response
- **Heuristic path:** Fast regex-based fallback that detects patterns (`@keyframes` → Animation, `<form>` → Form, `<canvas>` + game keywords → Game, etc.)
- Classification runs on import (heuristic) and on-demand via "Auto-Classify" button (AI)

### Feature: Curriculum System

Learning paths that organize snippets into ordered, trackable sequences:
- Create named curriculums with descriptions
- Add snippet references as steps with optional notes
- Track completion per step with progress percentage
- Reorder steps up/down
- Click a step to load the snippet in the editor

### Feature: Analytics Dashboard

Visual analytics panel showing:
- Summary cards (total snippets, lines, avg length, curriculums)
- Current file composition bar (HTML/CSS/JS split)
- Code complexity metrics (tags, selectors, functions)
- Feature badges (Responsive, Animated, External Resources)
- Category distribution bar chart
- Difficulty breakdown with percentages
- 14-day activity timeline

## Code Conventions

- **Components:** Functional components with `React.FC` type annotations and explicit props interfaces
- **Naming:** PascalCase for components, camelCase for functions/variables, UPPER_SNAKE_CASE for constants
- **IDs:** Generated with `crypto.randomUUID()`
- **Event handlers:** Named `handle*` (e.g., `handleSelectSnippet`), use `useCallback` for memoization
- **Module system:** ES modules (`"type": "module"`)
- **Path aliases:** `@/*` maps to project root (configured in both `vite.config.ts` and `tsconfig.json`)
- **Modals:** Rendered as fixed overlays with backdrop blur, closed via `onClose` callback
- **CI/CD:** GitHub Actions for typecheck/build (CI) and Netlify deploy (CD) on push/PR to `main`
- **No testing, linting, or formatting tools** are currently configured
