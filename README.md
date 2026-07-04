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

Please carefully read the [GUIDELINES.md](./GUIDELINES.md) document to understand:

- The FSD directory structure.
- Component naming conventions (Function Declarations, `App` prefix).
- Commit code standards (Conventional Commits).

## API Integration

- The API Base URL is currently configured via the `VITE_API_URL` environment variable (default: `http://localhost:3000/api`).
- The API communication layer uses `Axios` with pre-configured interceptors at `src/config/apiClient.ts`.

## License

This project is licensed under the [MIT License](./LICENSE).
