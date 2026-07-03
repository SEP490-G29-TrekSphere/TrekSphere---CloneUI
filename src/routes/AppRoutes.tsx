import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { PATHS } from '@/constants';
import ProtectedRoute from '@/routes/ProtectedRoute';
import MainLayout from '@/shared/layout/MainLayout';
import PublicLayout from '@/shared/layout/PublicLayout';

// Lazy loading features (code-splitting theo route)
const Home = lazy(() => import('@/features/home/pages/Home'));
const Login = lazy(() => import('@/features/auth/pages/Login'));
const Register = lazy(() => import('@/features/auth/pages/Register'));
const ForgotPassword = lazy(() => import('@/features/auth/pages/ForgotPassword'));
const ChangePassword = lazy(() => import('@/features/auth/pages/ChangePassword'));
const Dashboard = lazy(() => import('@/features/dashboard/pages/Dashboard'));
const Notifications = lazy(() => import('@/features/notifications/pages/Notifications'));
const ListTours = lazy(() => import('@/features/tours/pages/ListTours'));
const TourDetails = lazy(() => import('@/features/tours/pages/TourDetails'));
const BlogList = lazy(() => import('@/features/news/pages/BlogList'));
const BlogDetails = lazy(() => import('@/features/news/pages/BlogDetails'));
const ViewProfile = lazy(() => import('@/features/profile/pages/ViewProfile'));
const EditProfile = lazy(() => import('@/features/profile/pages/EditProfile'));

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
        {/* Standalone routes — không qua layout chung (auth flow, notifications) */}
        <Route path={PATHS.LOGIN} element={<Login />} />
        <Route path={PATHS.REGISTER} element={<Register />} />
        <Route path={PATHS.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route path={PATHS.CHANGE_PASSWORD} element={<ChangePassword />} />
        <Route path={PATHS.NOTIFICATIONS} element={<Notifications />} />

        {/* Public routes — chung khung Header + Footer qua PublicLayout */}
        <Route element={<PublicLayout />}>
          <Route path={PATHS.HOME} element={<Home />} />
          <Route path={PATHS.TOURS} element={<ListTours />} />
          <Route path={PATHS.TOUR_DETAIL} element={<TourDetails />} />
          <Route path={PATHS.NEWS} element={<BlogList />} />
          <Route path={PATHS.NEWS_DETAIL} element={<BlogDetails />} />
        </Route>

        {/* Protected routes — yêu cầu đăng nhập, dùng MainLayout có Header/Sidebar */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path={PATHS.DASHBOARD} element={<Dashboard />} />
          <Route path={PATHS.PROFILE} element={<ViewProfile />} />
          <Route path={PATHS.EDIT_PROFILE} element={<EditProfile />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
