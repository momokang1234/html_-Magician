# CLAUDE.md

This file provides guidance for AI assistants working with the ZenHTML Runner codebase.

## Project Overview

ZenHTML Runner is a minimalist HTML/CSS/JS sandbox application built with React 19, TypeScript, and Vite. It provides a split-screen code editor with live preview, a snippet library with folder organization, and AI-powered code optimization via Google Gemini.

## Tech Stack

- **Framework:** React 19 with functional components and hooks
- **Language:** TypeScript (ES2022 target, strict mode)
- **Build Tool:** Vite 6.2
- **Styling:** Tailwind CSS (loaded via CDN in index.html)
- **Fonts:** Inter (UI) and Fira Code (editor) via Google Fonts CDN
- **AI Integration:** Google Gemini (`@google/genai` SDK, model: `gemini-3-flash-preview`)
- **Deployment:** Netlify (SPA redirect config in `netlify.toml`)
- **Storage:** localStorage for persistence (code, snippets, folders)

## Project Structure

```
/
├── components/
│   ├── EditorView.tsx        # Split-screen editor + live preview
│   ├── RunnerView.tsx        # Iframe-based HTML execution
│   └── LibrarySidebar.tsx    # Snippet/folder management sidebar
├── services/
│   ├── geminiService.ts      # Google Gemini AI integration
│   └── fileUtils.ts          # HTML parsing and filename utilities
├── App.tsx                   # Root component, state management
├── index.tsx                 # React DOM entry point
├── index.html                # HTML template (CDN imports, import maps)
├── types.ts                  # TypeScript interfaces and constants
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
```

There are no test, lint, or formatting commands configured.

## Environment Variables

- `GEMINI_API_KEY` — Required for AI code optimization feature. Set in `.env.local`. Injected via Vite's `define` plugin in `vite.config.ts`.

## Architecture

### Component Hierarchy

```
App (state management, localStorage persistence)
├── EditorView (code textarea + toolbar + embedded RunnerView)
│   └── RunnerView (live preview iframe)
├── LibrarySidebar (snippet list, folders, directory import)
└── RunnerView (fullscreen execution mode)
```

### State Management

- All app state lives in `App.tsx` using React hooks (`useState`, `useEffect`, `useCallback`)
- No external state management library
- State is persisted to localStorage with these keys:
  - `zen_html_code_v1` — current code
  - `zen_html_snippets_v1` — snippet data
  - `zen_html_folders_v1` — folder data
- Preview updates are debounced at 200ms

### Key Data Types (defined in `types.ts`)

- `Snippet` — `{ id, name, code, folderId, updatedAt, isLocal?, filePath? }`
- `Folder` — `{ id, name, isLocal?, parentId? }`
- `AppConstants` enum — localStorage keys and app defaults

### Service Layer

- **`geminiService.ts`** — `improveCodeWithAI(code)` sends code to Gemini for optimization, strips markdown fencing from response, returns original code on failure
- **`fileUtils.ts`** — `extractH1Content()` parses `<h1>` from HTML for naming; `sanitizeFileName()` cleans filenames

### Code Execution

RunnerView renders user code in an iframe using `srcDoc` with sandbox permissions: `allow-scripts allow-forms allow-modals allow-popups allow-same-origin`.

## Code Conventions

- **Components:** Functional components with `React.FC` type annotations and explicit props interfaces
- **Naming:** PascalCase for components, camelCase for functions/variables, UPPER_SNAKE_CASE for constants
- **IDs:** Generated with `crypto.randomUUID()`
- **Event handlers:** Named `handle*` (e.g., `handleSelectSnippet`), use `useCallback` for memoization
- **Module system:** ES modules (`"type": "module"`)
- **Path aliases:** `@/*` maps to project root (configured in both `vite.config.ts` and `tsconfig.json`)
- **No testing, linting, or formatting tools** are currently configured
