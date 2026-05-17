# AGENTS.md — AROMA Project Context for IBM Bob

> This file is generated and maintained by IBM Bob IDE via the `/init` command.
> It provides persistent project context across all Bob sessions and modes.
> **Do not delete.** Bob references this file at the start of every task session.

---

## Project Identity

**Name:** AROMA — AI-powered Repository & Object Model Analyzer  
**Hackathon:** IBM Bob Hackathon 2026  
**Theme:** "Turn idea into impact faster"  
**Stack:** Next.js 15, React 19, TypeScript 5, Tailwind CSS 4, IBM watsonx.ai  
**AI Backend:** IBM Granite 4-h-small via watsonx.ai REST API  
**Development Partner:** IBM Bob IDE (this file)  
**Runtime:** Bun (preferred) or Node.js 18+

---

## Architecture Summary

AROMA is a **full-stack web application** with a React frontend (Next.js App Router) and five server-side API routes that call IBM watsonx.ai. All IBM credentials live exclusively on the server — they are never sent to the browser.

```
src/
├── app/
│   ├── page.tsx                # Main SPA — sidebar navigation + tab routing
│   ├── layout.tsx              # Root layout (fonts, metadata, providers)
│   └── api/
│       ├── analyze/route.ts    # POST → Code architecture analysis
│       ├── chat/route.ts       # POST → Interactive flow tracer chat
│       ├── refactor/route.ts   # POST → Pattern detection & refactoring
│       ├── generate/route.ts   # POST → Documentation & test generation
│       ├── security/route.ts   # POST → Security vulnerability scanning
│       └── health/route.ts     # GET → System health & watsonx.ai connectivity check
├── components/
│   ├── legacy-code-agent/      # The six AROMA modules (one component each)
│   └── ui/                     # shadcn/ui component library
├── lib/
│   ├── watsonx.ts              # IBM watsonx.ai REST client + IAM token manager
│   ├── db.ts                   # Prisma database client (SQLite)
│   └── utils.ts                # cn() and shared utilities
├── store/
│   └── use-app-store.ts        # Zustand global state
└── hooks/
    ├── use-mobile.ts
    └── use-toast.ts
```

---

## The Six Modules

| Module | Component File | API Route | Purpose |
|--------|---------------|-----------|---------|
| Code Explorer | `code-explorer.tsx` | `/api/analyze` | Architecture mapping, file tree, complexity |
| Flow Tracer | `flow-tracer.tsx` | `/api/chat` | Conversational code flow analysis |
| Smart Refactor | `smart-refactor.tsx` | `/api/refactor` | Pattern detection, code smells, diffs |
| Doc & Test Gen | `doc-generator.tsx` | `/api/generate` | README, API docs, tests, inline comments |
| Health Dashboard | `dashboard.tsx` | (state-driven) | Recharts quality metrics, AI summary |
| Security Scanner | `security-scanner.tsx` | `/api/security` | OWASP Top 10, CWE references, score |

---

## API Routes

AROMA exposes six server-side API routes that handle AI inference and system monitoring:

| Route | Method | Purpose | Response |
|-------|--------|---------|----------|
| `/api/analyze` | POST | Code architecture analysis | JSON with file tree, complexity metrics, dependencies |
| `/api/chat` | POST | Interactive flow tracer chat | JSON with AI response message |
| `/api/refactor` | POST | Pattern detection & refactoring suggestions | JSON array of refactoring recommendations |
| `/api/generate` | POST | Documentation & test generation | JSON with generated docs, tests, comments |
| `/api/security` | POST | Security vulnerability scanning | JSON array of security findings with OWASP/CWE refs |
| `/api/health` | GET | System health & watsonx.ai connectivity | JSON with status, model info, timestamp |

**Health Check Response Schema:**
```typescript
{
  status: 'ok' | 'error',
  watsonx: 'connected' | 'disconnected',
  model: string,              // e.g., 'ibm/granite-4-h-small'
  timestamp: string,          // ISO 8601 format
  error?: string              // Only present when status is 'error'
}
```

The health endpoint is used for:
- Deployment validation (verify watsonx.ai credentials are correct)
- Monitoring and alerting (check if AI backend is reachable)
- Debugging (confirm IAM token acquisition and model availability)

---

## IBM watsonx.ai Integration

**All AI calls go through `src/lib/watsonx.ts`.**

```typescript
import { callWatsonx, analyzeWithWatsonx, extractJSON } from "@/lib/watsonx";
```

Key functions:
- `callWatsonx(messages, options)` — Full messages array, returns string
- `analyzeWithWatsonx(systemPrompt, userContent, options)` — Convenience for single-turn
- `extractJSON<T>(raw)` — Safely extract JSON from model response (handles markdown fences)
- `safeParseJSON<T>(raw)` — Parse JSON with markdown fence stripping

Model: `ibm/granite-4-h-small`  
Endpoint: `https://us-south.ml.cloud.ibm.com/ml/v1/text/chat?version=2023-05-29`  
Auth: IBM IAM bearer token (auto-refreshed, 60-min TTL, cached module-level)

---

## Environment Variables (Never commit real values)

```
WATSONX_API_KEY=        # IBM Cloud API key
WATSONX_PROJECT_ID=     # watsonx.ai project ID (watsonx Hackathon Sandbox)
WATSONX_ENDPOINT=       # https://us-south.ml.cloud.ibm.com
WATSONX_MODEL_ID=       # ibm/granite-4-h-small
```

File: `.env` (gitignored). Template: `.env.example` (safe to commit).

---

## State Management

Zustand store at `src/store/use-app-store.ts` holds all client state:
- `currentView` — active tab/module
- `codeInput` — shared code textarea content
- `analysisResult` — Code Explorer output
- `projectAnalyzed` — boolean that unlocks Health Dashboard
- `chatMessages[]` — Flow Tracer conversation history
- `refactoringSuggestions[]` — Smart Refactor output
- `generatedDocs[]` — Doc & Test Gen output
- `securityFindings[]` — Security Scanner output

---

## Coding Standards

When Bob generates or modifies code in this project, follow these rules:

1. **TypeScript strict mode** — All values typed, no `any` unless justified with a comment
2. **Server-side AI only** — Never import `watsonx.ts` in client components (`'use client'`)
3. **Fallback first** — Every API route must have static fallback data when AI fails
4. **Error boundaries** — All API routes return `{ error: string }` with correct HTTP status on failure
5. **No hardcoded credentials** — Use `process.env.*` exclusively; never inline API keys
6. **Consistent imports** — Use `@/` alias (configured in `tsconfig.json`) for all internal imports
7. **Component naming** — PascalCase for components, camelCase for hooks and utilities
8. **API response shape** — Keep response shapes consistent with the schemas in `ARCHITECTURE.md`

---

## DO NOT

- Do not import from `src/lib/gemini.ts` — this file is DEPRECATED and will be removed
- Do not use `llama-3-405b-instruct`, `mistral-medium-2505`, or `mistral-small-3-1-24b-instruct-2503` (out of scope per hackathon guide)
- Do not expose `WATSONX_API_KEY` or `WATSONX_PROJECT_ID` in client components or logs
- Do not use `localStorage` or `sessionStorage` — all client state is in Zustand
- Do not bypass `.bobignore` exclusions when gathering context

---

## Key Files Bob Should Know About

| File | Purpose | Bob May Modify |
|------|---------|----------------|
| `src/lib/watsonx.ts` | Central IBM AI client | Only for extending capabilities |
| `src/store/use-app-store.ts` | All client state | When adding new module state |
| `src/app/page.tsx` | Navigation routing | When adding new modules |
| `ARCHITECTURE.md` | Architecture docs | Keep in sync with code changes |
| `bob_sessions/` | Judging deliverable | Bob exports session reports here |
| `.bobignore` | Bob context exclusions | Do not modify |

---

## bob_sessions Checklist

Before final submission, ensure `bob_sessions/` contains:
- [ ] At least one subfolder per major development session
- [ ] `screenshot.png` in each subfolder (task consumption summary)
- [ ] `task-history.md` in each subfolder (exported from Bob IDE History)
- [ ] `bob_sessions/README.md` with session index and descriptions
- [ ] NO credentials or API keys in any exported task history file

---

*Last updated by IBM Bob `/init` command — IBM Bob Hackathon 2026*