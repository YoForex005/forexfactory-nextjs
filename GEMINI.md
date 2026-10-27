# Project Constraints & Rules

## CRITICAL RESTRICTIONS

The following components and files are strictly off-limits. Do NOT edit, touch, modify, or run mutating commands against these systems under any circumstances unless explicitly instructed by the user.

### 1. Database (DO NOT TOUCH)
- **Do not modify database schemas, migrations, or configurations**:
  - Do not edit or touch `prisma/schema.prisma`, `prisma/migrations/`, or any SQL/migration files.
  - Do not create, modify, or run database scripts (e.g., `*.sql`, `scripts/*db*`, `check-db.js`, `manual_db_fix.sql`, etc.).
- **Do not execute database mutations or migration commands**:
  - Do not run `prisma migrate`, `prisma db push`, `prisma db seed`, or any commands that write to, migrate, or mutate the database.
- **Do not alter database access layers**:
  - Do not modify Prisma client configurations, database connection pools, or raw query helpers.

### 2. Backend (DO NOT TOUCH)
- **Do not modify backend APIs, route handlers, or server logic**:
  - Do not edit files under `src/app/api/` or any server API endpoints.
  - Do not modify backend middleware, server actions, authentication services, or backend business logic.
- **Scope is strictly Frontend / UI**:
  - Work should focus exclusively on UI components (`src/components/`), client views/pages, layouts, styling (CSS/Tailwind), and public assets unless instructed otherwise.
  - Do not change how backend contracts or API responses are handled on the server side.

### 3. Environment Files (`.env*`) (DO NOT TOUCH)
- **Do not edit, create, overwrite, or delete environment files**:
  - Never modify `.env`, `.env.local`, `.env.production`, `.env.development`, or any other `.env*` file.
- **Do not expose or alter secrets**:
  - Do not print, extract, or log secret values, API keys, or database credentials.
  - Never commit, stage, or alter environment variable configurations.

