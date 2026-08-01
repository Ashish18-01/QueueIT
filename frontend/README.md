# QueueIt Frontend

React + Vite foundation for the QueueIt MERN application. Phase 9A includes authentication screens, protected dashboard routing, Redux Toolkit state, Axios API integration, Tailwind CSS theming, reusable UI primitives, Socket.IO client wiring, and Vitest/React Testing Library setup.

## Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Set `VITE_API_BASE_URL` to the existing backend API root, e.g. `http://localhost:5000/api`. Set `VITE_SOCKET_URL` to the backend Socket.IO origin.

## Scripts

- `npm run dev` — start Vite.
- `npm run build` — production build.
- `npm run test` — run Vitest once.
- `npm run lint` — lint source files.

## Folder Structure

```text
src/
  app/              App bootstrap
  components/       Shared reusable UI and shell components
  features/auth/    Auth API, Redux slice, and forms
  layouts/          Public, auth, and dashboard layouts
  pages/            Route pages and placeholders
  routes/           Router and route guards
  services/         Axios client and token persistence
  socket/           Socket.IO client foundation
  store/            Redux store and cross-cutting slices
  styles/           Tailwind entry and design tokens
  test/             Test setup
  utils/            Shared helpers and validation rules
```

## Phase Boundary

This frontend intentionally stops at the foundation. Queue screens, analytics, notifications, and live queue updates are not implemented in Phase 9A.
