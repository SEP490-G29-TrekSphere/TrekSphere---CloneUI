import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { PATHS, ROLES } from '@/constants';
import { AccountDetail, AccountList, AdminDashboard } from '@/features/admin';
import ProtectedRoute from '@/routes/ProtectedRoute';
import RequireRole from '@/routes/RequireRole';
import MainLayout from '@/shared/layout/MainLayout';
import PublicLayout from '@/shared/layout/PublicLayout';
import { ScrollManager } from '@/shared/ui/ScrollManager';

// Lazy loading features (code-splitting theo route)
const Home = lazy(() => import('@/features/home/pages/Home'));
const Login = lazy(() => import('@/features/auth/pages/Login'));
const Register = lazy(() => import('@/features/auth/pages/Register'));
const VerifyEmail = lazy(() => import('@/features/auth/pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('@/features/auth/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/features/auth/pages/ResetPassword'));
const ChangePassword = lazy(() => import('@/features/auth/pages/ChangePassword'));
const Dashboard = lazy(() => import('@/features/dashboard/pages/Dashboard'));
const Notifications = lazy(() => import('@/features/notifications/pages/Notifications'));
const ListTours = lazy(() => import('@/features/tours/pages/ListTours'));
const TourDetails = lazy(() => import('@/features/tours/pages/TourDetails'));
const BookTour = lazy(() => import('@/features/tours/pages/BookTour'));
const BookingDetail = lazy(() => import('@/features/tours/pages/BookingDetail'));
const PayBooking = lazy(() => import('@/features/tours/pages/PayBooking'));
const MyBookings = lazy(() => import('@/features/tours/pages/MyBookings'));
const BlogList = lazy(() => import('@/features/news/pages/BlogList'));
const BlogDetails = lazy(() => import('@/features/news/pages/BlogDetails'));
const ViewProfile = lazy(() => import('@/features/profile/pages/ViewProfile'));
const EditProfile = lazy(() => import('@/features/profile/pages/EditProfile'));
const MyBlogList = lazy(() => import('@/features/trekker-community/pages/MyBlogList'));
const CreateBlogPost = lazy(() => import('@/features/trekker-community/pages/CreateBlogPost'));
const ChatList = lazy(() => import('@/features/chat/pages/ChatList'));
const AdminLayout = lazy(() => import('@/shared/layout/AdminLayout'));
const Applications = lazy(() => import('@/features/admin/pages/Applications'));
const ApplicationDetails = lazy(() => import('@/features/admin/pages/ApplicationDetails'));
const SystemSettings = lazy(() => import('@/features/admin/pages/SystemSettings'));

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
      <ScrollManager />
      <Routes>
        {/* Standalone routes — không qua layout chung (auth flow, notifications) */}
        <Route path={PATHS.LOGIN} element={<Login />} />
        <Route path={PATHS.REGISTER} element={<Register />} />
        <Route path={PATHS.VERIFY_EMAIL} element={<VerifyEmail />} />
        <Route path={PATHS.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route path={PATHS.RESET_PASSWORD} element={<ResetPassword />} />
        <Route
          path={PATHS.CHANGE_PASSWORD}
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />
        <Route path={PATHS.NOTIFICATIONS} element={<Notifications />} />
        <Route
          path={PATHS.CHAT}
          element={
            <ProtectedRoute>
              <ChatList />
            </ProtectedRoute>
          }
        />

        {/* Public routes — chung khung Header + Footer qua PublicLayout */}
        <Route element={<PublicLayout />}>
          <Route path={PATHS.HOME} element={<Home />} />
          <Route path={PATHS.TOURS} element={<ListTours />} />
          <Route path={PATHS.TOUR_DETAIL} element={<TourDetails />} />
          <Route path={PATHS.NEWS} element={<BlogList />} />
          <Route path={PATHS.NEWS_DETAIL} element={<BlogDetails />} />
          <Route path={PATHS.COMMUNITY} element={<MyBlogList />} />
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
          <Route path={PATHS.BLOG_LIST} element={<MyBlogList />} />
          <Route path={PATHS.BLOG_CREATE} element={<CreateBlogPost />} />
          <Route path={PATHS.BLOG_EDIT} element={<CreateBlogPost editMode />} />
          <Route path={PATHS.BOOK_TOUR} element={<BookTour />} />
          <Route path={PATHS.BOOKING_DETAIL} element={<BookingDetail />} />
          <Route path={PATHS.BOOKING_PAYMENT} element={<PayBooking />} />
          <Route path={PATHS.MY_TOURS} element={<MyBookings />} />
        </Route>

        {/* Admin routes — yêu cầu role admin, dùng AdminLayout với sidebar riêng */}
        <Route
          path={PATHS.ADMIN}
          element={
            <RequireRole allowedRoles={[ROLES.ADMIN]}>
              <AdminLayout />
            </RequireRole>
          }
        >
          <Route index element={<Navigate to={PATHS.ADMIN_ACCOUNTS} replace />} />
          <Route path={PATHS.ADMIN_DASHBOARD} element={<AdminDashboard />} />
          <Route path={PATHS.ADMIN_ACCOUNTS} element={<AccountList />} />
          <Route path={PATHS.ADMIN_ACCOUNT_DETAIL} element={<AccountDetail />} />
          <Route path={PATHS.ADMIN_TOURS} element={<AdminDashboard />} />
          <Route path={PATHS.ADMIN_DATA} element={<AdminDashboard />} />
          <Route path={PATHS.ADMIN_SETTINGS} element={<AdminDashboard />} />
          <Route path={PATHS.ADMIN_APPLICATIONS} element={<Applications />} />
          <Route path={PATHS.ADMIN_APPLICATION_DETAIL} element={<ApplicationDetails />} />
          <Route path={PATHS.ADMIN_SETTINGS} element={<SystemSettings />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
