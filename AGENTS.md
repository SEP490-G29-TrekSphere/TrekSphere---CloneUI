# AGENTS.md — TrekSphere Frontend

## Project Overview

TrekSphere Frontend is a React 19 + TypeScript application built with Vite for the TrekSphere travel platform. It provides a modern, responsive UI for browsing tours, managing user profiles, and handling authentication.

### Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand (global state) + TanStack React Query (server state)
- **Forms**: React Hook Form + Zod validation
- **UI Components**: shadcn/ui (base-nova style)
- **Linting/Formatting**: Biome (replaces ESLint + Prettier)
- **Git Hooks**: Lefthook (pre-commit, commit-msg, pre-push)
- **Package Manager**: pnpm v11.9.0

### Architecture

The project follows **Feature-Sliced Design (FSD)** principles:

```
src/
├── assets/          # Static resources (images, CSS)
├── components/      # shadcn/ui base components
├── config/          # Global configuration (apiClient, queryClient)
├── constants/       # App constants (paths, roles)
├── features/       # Feature modules (auth, dashboard, home, news, profile, tours)
├── hooks/           # Shared React hooks
├── lib/             # Utility libraries (formatting)
├── routes/          # Application routes
├── services/        # API communication layer (all API calls go here)
├── shared/          # Shared components and utilities
│   ├── hooks/       # Shared hooks
│   ├── layout/       # Common layouts
│   └── ui/           # Shared UI components (App-prefixed)
├── store/           # Zustand global stores
├── utils/           # Shared utilities
└── validations/     # Global Zod schemas
```

---

## Setup Commands

### Prerequisites

- Node.js 22+ (check with `node --version`)
- pnpm 11.9.0+ (install with `npm install -g pnpm@11`)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd TrekSphere_FE

# Install dependencies
pnpm install

# Setup git hooks (runs automatically on install via prepare script)
pnpm prepare
```

### Environment Variables

Create a `.env` file in the project root:

```bash
VITE_API_URL=http://localhost:3000/api
```

The API base URL defaults to `http://localhost:3000/api` if not set.

---

## Development Workflow

### Starting the Development Server

```bash
# Start dev server with hot reload
pnpm dev

# Preview production build locally
pnpm preview
```

The dev server runs at `http://localhost:5173`.

### Type Checking

```bash
# Run TypeScript type checking
pnpm typecheck
```

Runs automatically via pre-push hook.

### Code Quality

```bash
# Check code (lint + format)
pnpm check

# Auto-fix issues
pnpm check:fix

# Auto-fix including unsafe fixes
pnpm check:fix:unsafe

# Full CI check (biome ci + typecheck)
pnpm ci
```

---

## Code Style Guidelines

### Component Naming

- **UI Components** (`src/shared/ui/`): Must use `App` prefix
  - `AppButton`, `AppCard`, `AppInput`, `AppBadge`, `AppSpinner`, etc.
- **Regular Components**: PascalCase without prefix

### React Components

Use **function declarations** instead of arrow functions:

```tsx
// ✅ CORRECT
export function Dashboard() {
  return <div>...</div>;
}

// ❌ INCORRECT
export const Dashboard = () => <div>...</div>;
```

### Styling

- Use **Tailwind CSS utility classes** exclusively
- Avoid inline styles except for dynamic values
- Global CSS only in `src/assets/css/global.css`

### Form Handling

All forms must use React Hook Form + Zod:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authSchema } from '@/features/auth/validations/auth.schema';

export function LoginForm() {
  const form = useForm({
    resolver: zodResolver(authSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <form>
      <AppFormInput control={form.control} name="email" />
    </form>
  );
}
```

### API Calls

**All API calls must go through service files** in `src/services/`:

```bash
# ❌ NEVER do this in components
const response = await axios.get('/users');

// ✅ ALWAYS use services
import { authService } from '@/features/auth/services/authService';
const user = await authService.getCurrentUser();
```

### Import Aliases

The `@/` alias maps to `src/`:

```tsx
import { AppButton } from '@/components/ui/button';
import { authService } from '@/features/auth/services/authService';
import { paths } from '@/constants/paths';
```

### Biome Configuration

Key rules in `biome.json`:
- Indent: 2 spaces
- Line width: 100 characters
- Quotes: single quotes
- Semicolons: always
- Line endings: CRLF (Windows)

---

## Build and Deployment

### Build Commands

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

The build output goes to the `dist/` directory.

### CI/CD

- **Deployment**: Automatic deployment to Vercel on successful CI
- **Trigger**: Runs after CI workflow passes on `main` branch
- **Secrets Required**: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

### Git Hooks (Lefthook)

Hooks run automatically on git actions:

| Hook | Action | Command |
|------|--------|---------|
| `pre-commit` | Staged files | `pnpm biome check --write --staged` |
| `commit-msg` | Commit message | `pnpm commitlint --edit {1}` |
| `pre-push` | Before push | `pnpm typecheck` |

---

## Pull Request Guidelines

### Title Format

Follow **Conventional Commits**:

```
<type>(<scope>): <description>

Examples:
- feat(auth): add password reset functionality
- fix(dashboard): correct chart rendering issue
- chore(deps): update react-query to v5.101
- refactor(tours): simplify booking card component
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Commit Message Rules

- Max header length: 100 characters
- Max body line length: 120 characters
- Use imperative mood ("add" not "added")

### Required Checks Before PR

- [ ] `pnpm check` passes (Biome)
- [ ] `pnpm typecheck` passes (TypeScript)
- [ ] Commit messages follow Conventional Commits
- [ ] Tests pass (if any)

### PR Checklist

The project has a PR template (`.github/pull_request_template.md`) that must be completed:

- Summary of changes
- Related issue link
- Type of change
- Screenshots for UI changes
- Testing instructions
- Architecture notes for non-obvious decisions

---

## Testing

The project currently does not have a test suite configured. When adding tests:

- Place test files alongside source files: `Component.tsx` → `Component.test.tsx`
- Use Vitest for unit tests
- Use Playwright for E2E tests

Run tests with:

```bash
pnpm test        # Run all tests
pnpm test:watch  # Watch mode
pnpm test:ui     # UI mode
```

---

## Common Tasks

### Adding a New Feature

1. Create feature folder in `src/features/<feature-name>/`
2. Structure: `pages/`, `components/`, `services/`, `hooks/`, `validations/`, `types/`
3. Export from `src/features/<feature-name>/index.ts`
4. Add routes in `src/routes/AppRoutes.tsx`

### Adding a UI Component

1. Use shadcn CLI: `pnpm shadcn add <component-name>`
2. Components go in `src/components/ui/`
3. Shared components with `App` prefix go in `src/shared/ui/`

### Adding API Endpoint

1. Create service in `src/services/` or `src/features/<feature>/services/`
2. Use Axios via `src/config/apiClient.ts`
3. Add React Query hooks in feature hooks folder
4. Never call Axios directly in components

### Adding Global State

1. Create Zustand store in `src/store/`
2. Follow naming: `use<App>Store.ts` (e.g., `useAppStore.ts`, `useToastStore.ts`)

### Adding Validation Schema

1. Create Zod schema in `src/validations/` or `src/features/<feature>/validations/`
2. Export schema and inferred types
3. Use with React Hook Form: `zodResolver(schema)`

---

## Troubleshooting

### Lefthook Not Running

If git hooks don't execute:

```bash
# Reinstall hooks manually
pnpm prepare

# Or run lefthook directly
npx lefthook run pre-commit
```

### Biome Errors

```bash
# Fix all issues automatically
pnpm check:fix:unsafe

# Check specific file
pnpm biome check src/components/ui/button.tsx
```

### TypeScript Errors After Import Changes

```bash
# Clear cache and recheck
pnpm typecheck
```

### pnpm Lock File Issues

If you see dependency conflicts:

```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## Release Process

This repo uses a manual tag-and-release workflow. No automated GitHub Actions release job is required — the project is private and Vercel-deployed.

### Steps

1. **Pre-flight**: run `pnpm check` and `pnpm typecheck`; both must pass before proceeding.
2. **Sanitization gate** (first release or after adding new tooling): verify the `LICENSE` is standard MIT, the README License section matches, `.gitignore` covers `node_modules`, `.env`, and `dist/`, and run `pnpm audit --audit-level=high` — log any outstanding vulnerabilities in the release notes.
3. **Bump `package.json` version**: change `"version": "X.Y.Z"` on a feature branch (e.g. `0.0.0` → `0.0.1`).
4. **Commit & push the bump**: `git commit -m "chore: prepare release vX.Y.Z"` then `git push origin <branch>`.
5. **Tag & push**: `git tag -a vX.Y.Z -m "Release vX.Y.Z"` then `git push origin --tags` (push the branch first if not already pushed).
6. **Generate release notes**: `git log --oneline --no-merges $(git describe --tags --abbrev=0)..HEAD` (or a full recent log if no prior tag exists).
7. **Create the GitHub release**: `gh release create vX.Y.Z --title "Release vX.Y.Z" --notes "<notes>"`.
8. **`.github/release.yml`**: this file maps label names to changelog categories. It only references labels that currently exist in the repo. When you add a new label (e.g. `breaking`, `refactor`, `test`, `revert`), update both the repo labels and this file's `categories` block.
9. **Version bump ↔ release coupling**: the version bump commit and the tag **must be on the same branch** and the bump must be committed before tagging. A release with a missing or mismatched version bump (or a tag without a corresponding commit) is invalid.

---

## Additional Resources

- [AGENTS.md](./AGENTS.md) — Detailed coding standards and FSD documentation
- [README.md](./README.md) — Project overview and setup instructions
- [DESIGN.md](./DESIGN.md) — Design system and color palette
