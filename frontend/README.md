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

## Phase 9B Business UI

The frontend now includes role-aware business workspaces for customers, counter operators, venue managers, and organization admins. The dashboard shell reuses the authenticated layout, Redux auth state, Axios API client, Tailwind design tokens, and reusable UI primitives.

### Role navigation

Navigation is selected from the logged-in user's `role`:

- `customer` / `user`: dashboard, join queue, active queue, queue history, profile, account settings.
- `counter_operator`: counter dashboard, current queue, call-next queue list, queue status, profile.
- `venue_manager`: dashboard, queue management, counter management, employee management, profile.
- `organization_admin`: dashboard, branch management, venue management, user management, role management, queue management.

### Queue API integration

Business pages call the existing backend API through `src/services/businessApi.js`:

- `GET /queues` with pagination, search, filtering, and sorting.
- `GET /queues/:queueId` for queue details.
- `POST /queues/:queueId/join` for joining queues.
- `POST /queues/:queueId/call-next` and queue transition endpoints for operator/manager actions.
- `GET /queue-entries`, `GET /queue-entries/:entryId`, and entry action endpoints for history and processing.

### Reusable components

- `DataTable` provides pagination, search, filtering, empty state, loading state, and error display.
- `StatCard` provides responsive dashboard metric cards.
- Profile and queue forms use React Hook Form validation and loading states.

Counter, employee, branch, venue, user, and role management pages are wired into navigation with reusable table placeholders until corresponding backend APIs are available.

## Phase 9C real-time frontend

The dashboard shell connects to the existing Socket.IO server after authentication and displays a live connection indicator, notification badge, and in-app notification center. Queue lifecycle and queue-entry processing events are normalized into Redux by `realtimeSlice`, then dashboard and queue pages merge the live cache with REST responses so queue position, serving token, queue length, queue status, counter status, and personal entry status update without a page refresh.

Supported backend events include queue created, updated, deleted, paused, resumed, closed, customer joined, left, called, recalled, skipped, completed, entry cancelled, live queue updates, presence updates, and socket errors. Disconnects and backend socket errors produce user-friendly toast messages while REST reloads keep live state consistent with API responses.

## Analytics Dashboard

Phase 10A adds a protected `/dashboard/analytics` workspace for customers, counter operators, venue managers, organization admins, and super admins. The page reuses the existing queue and queue-entry APIs, Redux realtime socket state, cards, tables, filters, and theme styles. Analytics are derived client-side when a dedicated backend analytics endpoint is not available.

Included capabilities:
- KPI cards for total queues, active queues, completed queues, waiting customers, customers served today, average wait time, average service time, throughput, active counters, and online employees.
- Recharts visualizations for daily, weekly, monthly activity, peak hours, wait/service times, completion rate, counter performance, employee performance, and satisfaction placeholders.
- Reports for daily, weekly, monthly, queue, counter, and employee performance with reusable searchable/sortable tables.
- Filters for date range, organization, branch, venue, queue, and counter with reset support.
- CSV export through `analyticsExportService`, which supports registering additional formats later.
