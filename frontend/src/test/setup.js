import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() }, Toaster: () => null }));
