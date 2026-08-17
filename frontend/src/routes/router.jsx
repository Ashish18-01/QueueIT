import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import LandingPage from '../pages/LandingPage.jsx';
import DashboardPage from '../pages/business/DashboardPage.jsx';
import { Loader } from '../components/ui/Loader.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import NotificationHistoryPage from '../pages/notifications/NotificationHistoryPage.jsx';
import { Forbidden, LoadingPage, NotFound } from '../pages/StatusPages.jsx';
import { ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage } from '../features/auth/AuthForms.jsx';
import { BranchManagementPage, CounterManagementPage, EmployeeManagementPage, QueueStatusPage, RoleManagementPage, UserManagementPage, VenueManagementPage } from '../pages/business/AdminPages.jsx';
import { CreateQueuePage, CurrentQueuePage, EntryDetailsPage, JoinQueuePage, QueueDetailsPage, QueueHistoryPage, QueueListPage } from '../pages/business/QueuePages.jsx';
import { OrganizationDashboardPage, OrganizationListPage, OrganizationOnboardingPage } from '../pages/business/OrganizationPages.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';

const AnalyticsDashboardPage = lazy(() => import('../features/analytics/AnalyticsDashboardPage.jsx'));
const LazyAnalytics = () => <Suspense fallback={<Loader />}><AnalyticsDashboardPage /></Suspense>;

export const router = createBrowserRouter([
  { element: <PublicLayout />, children: [{ path: '/', element: <LandingPage /> }] },
  { element: <AuthLayout />, children: [{ path: '/login', element: <LoginPage /> }, { path: '/register', element: <RegisterPage /> }, { path: '/forgot-password', element: <ForgotPasswordPage /> }, { path: '/reset-password', element: <ResetPasswordPage /> }] },
  { element: <ProtectedRoute />, children: [{ element: <DashboardLayout />, children: [
    { path: '/dashboard', element: <DashboardPage /> },
    { path: '/dashboard/organizations', element: <OrganizationListPage /> },
    { path: '/dashboard/organizations/new', element: <OrganizationOnboardingPage /> },
    { path: '/dashboard/organizations/:organizationId', element: <OrganizationDashboardPage /> },
    { path: '/dashboard/queues', element: <QueueListPage /> },
    { path: '/dashboard/queues/new', element: <CreateQueuePage /> },
    { path: '/dashboard/queues/active', element: <QueueListPage mode="active" /> },
    { path: '/dashboard/queues/join', element: <JoinQueuePage /> },
    { path: '/dashboard/queues/history', element: <QueueHistoryPage /> },
    { path: '/dashboard/queues/current', element: <CurrentQueuePage /> },
    { path: '/dashboard/queues/status', element: <QueueStatusPage /> },
    { path: '/dashboard/queues/:queueId', element: <QueueDetailsPage /> },
    { path: '/dashboard/entries/:entryId', element: <EntryDetailsPage /> },
    { path: '/dashboard/counters', element: <CounterManagementPage /> },
    { path: '/dashboard/employees', element: <EmployeeManagementPage /> },
    { path: '/dashboard/branches', element: <BranchManagementPage /> },
    { path: '/dashboard/venues', element: <VenueManagementPage /> },
    { path: '/dashboard/users', element: <UserManagementPage /> },
    { path: '/dashboard/roles', element: <RoleManagementPage /> },
    { path: '/dashboard/analytics', element: <LazyAnalytics /> },
    { path: '/dashboard/profile', element: <ProfilePage /> },
    { path: '/dashboard/settings', element: <ProfilePage /> },
    { path: '/dashboard/notifications', element: <NotificationHistoryPage /> },
  ] }] },
  { path: '/403', element: <Forbidden /> }, { path: '/loading', element: <LoadingPage /> }, { path: '*', element: <NotFound /> },
]);
