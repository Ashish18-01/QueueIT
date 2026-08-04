# UI Components

## DataTable

`DataTable` is the shared table component for Phase 9B business screens. It supports:

- Search input
- Filter selects
- Sort select
- Loading state
- Error state
- Empty state
- Pagination
- Custom cell renderers

Provide `columns`, `rows`, and optional state callbacks from the page-level API hook.

## StatCard

`StatCard` renders dashboard metrics with consistent rounded corners, soft shadow, responsive typography, and dark-mode compatible colors.

## Real-time UX components

- `components/notifications/NotificationCenter.jsx` renders the in-app notification center and unread badge. The trigger has an accessible label and marks notifications read when opened.
- `components/errors/ErrorBoundary.jsx` wraps routed pages and falls back to `ErrorState` when a render error occurs.
- Existing `Skeleton`, `Loader`, `EmptyState`, and `ErrorState` components should be reused for global loading, empty, and error states.
