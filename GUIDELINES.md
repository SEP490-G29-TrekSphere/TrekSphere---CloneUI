# TrekSphere Frontend Guidelines

This document outlines the coding principles, standards, and architectural structure of the TrekSphere Frontend project to ensure maintainable, scalable, and consistent code among team members.

## 1. Directory Architecture (FSD - Feature-Sliced Design)

The project applies a variant of FSD for clear structural separation:

- **`src/assets/`**: Contains static resources like images, SVG icons, and global CSS (`global.css`).
- **`src/config/`**: Where global application configurations are set, such as Axios configuration (`apiClient.ts`) or environment constants.
- **`src/features/`**: Contains the main features of the application (e.g., `auth`, `dashboard`). Each feature operates independently and encapsulates its own UI and local logic.
- **`src/routes/`**: Where application routes are defined.
- **`src/services/`**: The communication layer with the Backend. Absolutely **do not** call Axios directly within Components. All API calls must go through Service files (e.g., `authService.ts`).
- **`src/shared/`**: Contains components and utilities shared across the entire project (like `ui/` for UI Components, `layout/` for common layouts).
- **`src/store/`**: Global State management using Zustand (`useAppStore.ts`, `useToastStore.ts`).
- **`src/utils/`**: Shared utility functions (e.g., `storage.ts`, date formatting).
- **`src/validations/`**: Contains Schemas used for form validation (Zod).

## 2. Coding Rules

### Component & Functions (Function Declaration)

All React Components should use the **Function Declaration** syntax (traditional function) instead of Arrow Functions. This syntax makes the file easier to read and is more friendly with React features like Fast Refresh.

```tsx
// ✅ DO
export function Dashboard() { ... }

// ❌ DON'T
export const Dashboard: React.FC = () => { ... }
```

### UI Component Naming (`App` Prefix)

To avoid conflicts with default HTML tags and to clearly distinguish internal Components:

- Every shared UI Component in `src/shared/ui/` must start with the word **`App`**.
- Example: `<AppButton>`, `<AppTable>`, `<AppCard>`.

### Form Management & Validation

- **Always** use `react-hook-form` combined with `zod` for managing and validating forms.
- Form schemas must be declared using Zod and separated into the `validations/` directory (or within a `schemas` directory inside specific features).
- Use `<AppFormInput>` as the standardized Component for Input tags within Forms.

### CSS & Styling

- The project uses **Tailwind CSS v4** as the primary styling tool.
- **Do not** write plain CSS excessively (except for basic configurations in `src/assets/css/global.css`).
- Limit the use of inline styles (`style={{...}}`); maximize the use of Tailwind's utility classes.

## 3. State and API Management

- **Local State**: Use `useState` for small, localized states within components.
- **Global State**: Use `Zustand` (`src/store/`) for data that needs to be shared across multiple components (Auth, Toast, Loading).
- **Server State**: Use `@tanstack/react-query` to fetch and cache data from the API, combined with services in `src/services/`.

## 4. Quality Control (Linting & Formatting)

- The project uses **Biome** (an opinionated linter + formatter) managed by **Lefthook** git hooks.
- **Biome** runs on pre-commit for staged files, replacing ESLint and Prettier with a single unified tool.
- Available scripts:
  - `pnpm lint` — check code quality (lints + format)
  - `pnpm lint:fix` — check and auto-fix code quality issues
  - `pnpm format` — format all files
  - `pnpm format:check` — verify formatting without modifying files
- Please ensure the code is "clean" before pushing to the shared branch.
 