# AI Copilot Instructions for Expert System Diagnosis Platform

## Project Overview

**Sistem Pakar Web** is an expert system for diagnosing smartphone addiction risk in children using **Forward Chaining inference** algorithm. It's a full-stack TypeScript application with React frontend, Express backend, and SQLite database.

### Core Architecture

- **Frontend**: React 18 + Vite + Tailwind CSS + Zustand (state management)
- **Backend**: Express.js + TypeScript + sql.js (SQLite in-memory with file persistence)
- **Database**: SQLite with 5 core tables: users, symptoms, rules, diagnoses, articles, categories
- **Authentication**: JWT tokens with bcrypt password hashing

## Critical Patterns & Workflows

### 1. Forward Chaining Inference Engine (Backend)

The system's core logic in [backend/src/services/inference.ts](backend/src/services/inference.ts):

1. **Load rules** sorted by priority (1 = highest)
2. **Check conditions** - verify if all symptoms in rule are present in user's selection
3. **Return first match** - first rule matched wins (priority-based, not just any match)
4. **Generate trace** - log all rules evaluated for transparency in diagnosis results

**Key files**:
- [backend/src/services/inference.ts](backend/src/services/inference.ts) - `runInference()` implements the algorithm
- [backend/src/routes/diagnose.ts](backend/src/routes/diagnose.ts) - `/api/diagnose` endpoint calls inference
- **Data model**: `Rule` has `conditions: string[]` (symptom codes), `result: string` (category code), `priority: number`

**Example**: If rule R05 has conditions `["G01", "G03"]` and priority 2, it matches only if BOTH G01 AND G03 are selected by user.

### 2. Database Schema Design

SQLite file at `database.db` (or `DATABASE_PATH` env var):
- **symptoms**: code (G01-G15), text, help_text, active flag
- **rules**: code (R01-R16), conditions (JSON array), result (K01-K04), priority, recommendation
- **categories**: code (K01=Normal/K02=Light/K03=Moderate/K04=Severe), level (0-3), color, description
- **diagnoses**: stores symptom selections + rule trace for history
- **users**: JWT-authenticated users with role (user/admin)
- **articles**: educational content with publish status

**Foreign key**: User-submitted diagnoses reference user_id and store symptoms as JSON strings.

### 3. Authentication & Authorization

- **JWT flow**: Register → hash password with bcrypt → issue token on login
- **Middleware**: [backend/src/middleware/auth.ts](backend/src/middleware/auth.ts) validates tokens
- **Admin routes**: Require `role === 'admin'` check in backend + frontend route guards
- **Frontend state**: [frontend/src/store/authStore.ts](frontend/src/store/authStore.ts) (Zustand) persists auth token in localStorage

### 4. API Patterns

All backend routes follow REST conventions:
- **POST /api/diagnose** - Run inference on selected symptoms (accepts `{selected_symptoms: string[]}`)
- **GET /api/diagnose/:id** - Fetch diagnosis history entry
- **GET /api/admin** - Aggregate statistics (diagnoses count, symptom frequencies, trends)
- **Admin CRUD**: `/api/symptoms`, `/api/rules`, `/api/articles` with role checks
- **Response format**: `{error: string}` on error, typed response objects on success

### 5. Frontend Routing & Pages

- **Public**: HomePage, AboutPage, DiagnosePage, ArticlesPage
- **Protected**: HistoryPage (requires login to view user's diagnosis history)
- **Admin**: AdminDashboard, AdminSymptoms, AdminRules, AdminArticles (role-gated)
- **Route guards**: [frontend/src/App.tsx](frontend/src/App.tsx) defines `ProtectedRoute` and `AdminRoute` wrappers

### 6. Development Workflow

**Root package.json scripts**:
```json
"setup": "cd backend && npm run migrate && npm run seed",
"dev:backend": "cd backend && npm run dev",
"dev:frontend": "cd frontend && npm run dev"
```

**Database setup**: `migrate.ts` creates tables, `seed.ts` or `seed-simple.ts` populates symptoms/rules/categories.
**Running together**: Terminal 1 `npm run dev:backend`, Terminal 2 `npm run dev:frontend`.

## Project-Specific Conventions

1. **Symptom/Rule codes**: Semantic prefixes (G01-G15 for symptoms, R01-R16 for rules, K01-K04 for categories)
2. **Database persistence**: sql.js loads file into memory at startup, calls `saveDatabase()` after every mutation
3. **Trace format**: Rules always evaluated sequentially; trace includes all rules even non-matched ones
4. **JSON storage**: Symptoms array & rule conditions stored as JSON strings in DB, parsed in code
5. **Error handling**: Express middleware at [backend/src/server.ts](backend/src/server.ts) catches all errors; frontend uses Axios interceptors
6. **Admin data updates**: No cache invalidation needed - rules/symptoms fetched fresh on each request
7. **PDF export**: [frontend/src/utils/pdfExport.ts](frontend/src/utils/pdfExport.ts) uses jsPDF library for diagnosis PDFs

## Important Files by Purpose

| Purpose | Files |
|---------|-------|
| Inference logic | [backend/src/services/inference.ts](backend/src/services/inference.ts) |
| Database ops | [backend/src/database.ts](backend/src/database.ts) |
| Diagnosis endpoint | [backend/src/routes/diagnose.ts](backend/src/routes/diagnose.ts) |
| Admin endpoints | [backend/src/routes/admin.ts](backend/src/routes/admin.ts) |
| Auth logic | [backend/src/routes/auth.ts](backend/src/routes/auth.ts), [backend/src/middleware/auth.ts](backend/src/middleware/auth.ts) |
| Type definitions | [backend/src/types.ts](backend/src/types.ts) |
| Frontend routing | [frontend/src/App.tsx](frontend/src/App.tsx) |
| State management | [frontend/src/store/authStore.ts](frontend/src/store/authStore.ts) |
| API client | [frontend/src/services/api.ts](frontend/src/services/api.ts) |

## Common Tasks & Implementation Notes

- **Adding a symptom**: Insert in `symptoms` table, update `seed.ts`, assign new code G##
- **Adding a rule**: Insert in `rules` table with JSON conditions array, assign priority lower than existing rules you want to defer to
- **Fixing diagnosis result**: Check rule priority order in [backend/src/services/inference.ts](backend/src/services/inference.ts) - earlier matches in DB order win
- **Admin permission issue**: Verify `user.role === 'admin'` both in backend route AND frontend route guard
- **Database not persisting**: Ensure `saveDatabase()` called after mutations in [backend/src/database.ts](backend/src/database.ts)
