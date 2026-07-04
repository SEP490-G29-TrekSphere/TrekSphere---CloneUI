# TrekSphere Frontend

Frontend project for the TrekSphere platform, built with React 19, TypeScript, and Vite, aiming for a smooth user experience and modern interface.

## Technologies Used

- **Core**: React 19 + TypeScript + Vite.
- **Styling**: Tailwind CSS v4.
- **State Management**: Zustand (Global State) + React Query (Server State).
- **Form & Validation**: React Hook Form + Zod.
- **UI Architecture**: Follows FSD (Feature-Sliced Design) principles and utilizes a UI Kit with the `App` prefix (AppButton, AppCard...).

## Installation & Running the Project

1. Clone the project and install dependencies:

   ```bash
   pnpm install
   # or
   npm install
   ```

2. Run the Development environment:
   ```bash
   npm run dev
   ```
   The project will launch at `http://localhost:5173`.

## Guidelines & Standards

Please carefully read the [AGENTS.md](./AGENTS.md) document to understand:

- The FSD directory structure.
- Component naming conventions (Function Declarations, `App` prefix).
- Commit code standards (Conventional Commits).

Want to contribute? Start with [CONTRIBUTING.md](./CONTRIBUTING.md) — it is the single entry point for issues, PRs, setup, and review flow.

## API Integration

- The API Base URL is currently configured via the `VITE_API_URL` environment variable (default: `http://localhost:3000/api`).
- The API communication layer uses `Axios` with pre-configured interceptors at `src/config/apiClient.ts`.

## Security

Please report vulnerabilities privately — see [SECURITY.md](./SECURITY.md). Do not file a public GitHub issue for security bugs.

## Code of Conduct

This project follows a [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you agree to uphold it. Report unacceptable behavior to the contacts listed in the CoC.

## License

This project is licensed under the [MIT License](./LICENSE).
