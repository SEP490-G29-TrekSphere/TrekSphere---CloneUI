import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { PATHS } from '@/constants';
import MainLayout from '@/shared/layout/MainLayout';

// Lazy loading features (code-splitting theo route)
const Home = lazy(() => import('@/features/home/pages/Home'));
const Login = lazy(() => import('@/features/auth/pages/Login'));
const Register = lazy(() => import('@/features/auth/pages/Register'));
const ForgotPassword = lazy(() => import('@/features/auth/pages/ForgotPassword'));
const ChangePassword = lazy(() => import('@/features/auth/pages/ChangePassword'));
const Dashboard = lazy(() => import('@/features/dashboard/pages/Dashboard'));
const Notifications = lazy(() => import('@/features/notifications/pages/Notifications'));

function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path={PATHS.HOME} element={<Home />} />
        <Route path={PATHS.LOGIN} element={<Login />} />
        <Route path={PATHS.REGISTER} element={<Register />} />
        <Route path={PATHS.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route path={PATHS.NOTIFICATIONS} element={<Notifications />} />
        <Route path={PATHS.CHANGE_PASSWORD} element={<ChangePassword />} />

        {/* Protected/Layout Routes */}
        <Route element={<MainLayout />}>
          <Route path={PATHS.DASHBOARD} element={<Dashboard />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
