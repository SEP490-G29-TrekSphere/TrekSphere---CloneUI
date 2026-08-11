import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import {
  getTrekkerBlogEditPath,
  getTrekkerBookingPaymentPath,
  getTrekkerGroupDetailPath,
  PATHS,
  ROLES,
} from '@/constants';
import { getPrimaryRole } from '@/constants/roles';
import { AccountDetail, AccountList, AdminDashboard, BlogManagement } from '@/features/admin';
import ProtectedRoute from '@/routes/ProtectedRoute';
import RequireRole from '@/routes/RequireRole';
import MainLayout from '@/shared/layout/MainLayout';
import PublicLayout from '@/shared/layout/PublicLayout';
import { ScrollManager } from '@/shared/ui/ScrollManager';
import { useAppStore } from '@/store/useAppStore';

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
const MyApplications = lazy(() => import('@/features/profile/pages/MyApplications'));
const MyBlogList = lazy(() => import('@/features/trekker-community/pages/MyBlogList'));
const CreateBlogPost = lazy(() => import('@/features/trekker-community/pages/CreateBlogPost'));
const ChatList = lazy(() => import('@/features/chat/pages/ChatList'));
const CompanionGroups = lazy(() => import('@/features/companion-groups/pages/CompanionGroupsPage'));
const MyCompanionGroupsPage = lazy(
  () => import('@/features/companion-groups/pages/MyCompanionGroupsPage')
);
const CreateCompanionGroup = lazy(
  () => import('@/features/companion-groups/pages/CreateCompanionGroupPage')
);
const CompanionGroupDetail = lazy(
  () => import('@/features/companion-groups/pages/CompanionGroupDetailPage')
);
const JoinGroupRequestPage = lazy(
  () => import('@/features/companion-groups/pages/JoinGroupRequestPage')
);
const MyJoinRequestsPage = lazy(
  () => import('@/features/companion-groups/pages/MyJoinRequestsPage')
);
const AdminLayout = lazy(() => import('@/shared/layout/AdminLayout'));
const TrekkerLayout = lazy(() => import('@/features/trekker/layout/TrekkerLayout'));
const TrekkerViewProfile = lazy(() => import('@/features/trekker/pages/TrekkerViewProfile'));
const TrekkerChangePassword = lazy(() => import('@/features/trekker/pages/TrekkerChangePassword'));

const Applications = lazy(() => import('@/features/admin/pages/Applications'));
const ApplicationDetails = lazy(() => import('@/features/admin/pages/ApplicationDetails'));
const ReportDetail = lazy(() => import('@/features/admin/pages/ReportDetail'));
const Reports = lazy(() => import('@/features/admin/pages/Reports'));
const SystemSettings = lazy(() => import('@/features/admin/pages/SystemSettings'));
const VendorList = lazy(() => import('@/features/admin/vendors/pages/VendorList'));
const VendorManagerLayout = lazy(
  () => import('@/features/vendor-manager/layout/VendorManagerLayout')
);
const StaffList = lazy(() => import('@/features/vendor-manager/staff/pages/StaffList'));
const TourList = lazy(() => import('@/features/vendor-manager/tours/pages/TourList'));
const TourCreate = lazy(() => import('@/features/vendor-manager/tours/pages/TourCreate'));
const TourEdit = lazy(() => import('@/features/vendor-manager/tours/pages/TourEdit'));
const TourApprovals = lazy(() => import('@/features/vendor-manager/tours/pages/TourApprovals'));
const TourSchedules = lazy(() => import('@/features/vendor-manager/tours/pages/TourSchedules'));
const VendorReports = lazy(() => import('@/features/vendor-reports/pages/VendorReports'));
const VendorStaffLayout = lazy(() => import('@/features/vendor-staff/layout/VendorStaffLayout'));
const PartnerTourList = lazy(() => import('@/features/vendor-staff/tours/pages/TourList'));
const PartnerTourCreate = lazy(() => import('@/features/vendor-staff/tours/pages/TourCreate'));
const PartnerTourEdit = lazy(() => import('@/features/vendor-staff/tours/pages/TourEdit'));
const PartnerTourSchedules = lazy(
  () => import('@/features/vendor-staff/tours/pages/TourSchedules')
);
const EquipmentList = lazy(() => import('@/features/vendor-equipment/pages/EquipmentList'));
const VendorBookingList = lazy(() => import('@/features/vendor-bookings/pages/BookingList'));
const PorterList = lazy(() => import('@/features/vendor-porters/pages/PorterList'));
const PorterCreate = lazy(() => import('@/features/vendor-porters/pages/PorterCreate'));
const PorterEdit = lazy(() => import('@/features/vendor-porters/pages/PorterEdit'));
const SessionList = lazy(() => import('@/features/vendor-sessions/pages/SessionList'));
const SessionDetail = lazy(() => import('@/features/vendor-sessions/pages/SessionDetail'));
const VendorProfileOverview = lazy(
  () => import('@/features/vendor-profile/pages/VendorProfileOverview')
);
const VendorProfileEdit = lazy(() => import('@/features/vendor-profile/pages/VendorProfileEdit'));
const CoordinatorSchedulesPage = lazy(
  () => import('@/features/coordinator/pages/CoordinatorSchedulesPage')
);
const CoordinatorLayout = lazy(() => import('@/features/coordinator/layout/CoordinatorLayout'));
const CoordinatorSessionOperationsPage = lazy(
  () => import('@/features/coordinator/pages/CoordinatorSessionOperationsPage')
);
const EmergencySosPage = lazy(() => import('@/features/emergency-sos/pages/EmergencySosPage'));
const VendorVoucherList = lazy(() => import('@/features/vendor-vouchers/pages/VendorVoucherList'));

/**
 * Redirect `/blog/edit/:blogId` (path cũ, nằm ngoài portal) sang path trekker
 * tương ứng — `<Navigate>` không tự nội suy được param nên cần đọc qua hook.
 */
function LegacyBlogEditRedirect() {
  const { blogId } = useParams();
  return (
    <Navigate to={blogId ? getTrekkerBlogEditPath(blogId) : PATHS.TREKKER_BLOG_LIST} replace />
  );
}

function ChatRedirect() {
  const location = useLocation();
  const user = useAppStore((state) => state.user);

  if (!user) {
    return <Navigate to={PATHS.LOGIN} state={{ from: location }} replace />;
  }

  const primaryRole = getPrimaryRole(user.roles);
  let chatPath: string = PATHS.TREKKER_CHAT;

  if (primaryRole === ROLES.ADMIN) {
    chatPath = PATHS.ADMIN_CHAT;
  } else if (primaryRole === ROLES.VENDOR_MANAGER) {
    chatPath = PATHS.VENDOR_MANAGER_CHAT;
  } else if (primaryRole === ROLES.VENDOR_STAFF) {
    chatPath = PATHS.PARTNER_CHAT;
  } else if (primaryRole === ROLES.COORDINATOR) {
    chatPath = PATHS.COORDINATOR_CHAT;
  }

  return <Navigate to={chatPath} state={location.state} replace />;
}

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
        <Route path={PATHS.CHAT} element={<ChatRedirect />} />

        {/* Blog của tôi chỉ sống trong portal Trekker (TrekkerLayout có sidebar).
            Các path `/blog*` cũ nằm trong MainLayout nên vào là mất sidebar —
            giữ lại dưới dạng redirect để link/bookmark cũ không vỡ. */}
        <Route path={PATHS.BLOG_LIST} element={<Navigate to={PATHS.TREKKER_BLOG_LIST} replace />} />
        <Route
          path={PATHS.BLOG_CREATE}
          element={<Navigate to={PATHS.TREKKER_BLOG_CREATE} replace />}
        />
        <Route path={PATHS.BLOG_EDIT} element={<LegacyBlogEditRedirect />} />

        {/* Public routes — chung khung Header + Footer qua PublicLayout */}
        <Route element={<PublicLayout />}>
          <Route path={PATHS.HOME} element={<Home />} />
          <Route path={PATHS.GROUPS} element={<CompanionGroups />} />
          <Route path={PATHS.GROUPS_CREATE} element={<CreateCompanionGroup />} />
          <Route path={PATHS.GROUPS_JOIN} element={<JoinGroupRequestPage />} />
          <Route path={PATHS.GROUPS_DETAIL} element={<CompanionGroupDetail />} />
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
          <Route path={PATHS.BOOK_TOUR} element={<BookTour />} />
          <Route path={PATHS.BOOKING_DETAIL} element={<BookingDetail />} />
          <Route path={PATHS.BOOKING_PAYMENT} element={<PayBooking />} />
          <Route path={PATHS.MY_TOURS} element={<MyBookings />} />
          <Route path={PATHS.MY_VENDOR_APPLICATIONS} element={<MyApplications />} />
        </Route>

        {/* Trekker routes — sidebar riêng (TrekSphere portal) */}
        <Route
          path={PATHS.TREKKER}
          element={
            <RequireRole allowedRoles={[ROLES.TREKKER]}>
              <TrekkerLayout />
            </RequireRole>
          }
        >
          <Route index element={<Navigate to={PATHS.TREKKER_PROFILE} replace />} />
          <Route path={PATHS.TREKKER_PROFILE} element={<TrekkerViewProfile />} />
          <Route
            path={PATHS.TREKKER_PROFILE_EDIT}
            element={<EditProfile returnPath={PATHS.TREKKER_PROFILE} />}
          />
          <Route path={PATHS.TREKKER_MY_TOURS} element={<MyBookings useTrekkerPaths />} />
          <Route path={PATHS.TREKKER_MY_GROUPS} element={<MyCompanionGroupsPage />} />
          {/* Chi tiết nhóm ghép mở từ portal Trekker — giữ nguyên sidebar thay vì
              nhảy sang `/groups/:groupId` (PublicLayout) làm mất điều hướng. */}
          <Route
            path={PATHS.TREKKER_GROUP_DETAIL}
            element={
              <CompanionGroupDetail
                embedded
                backPath={PATHS.TREKKER_MY_GROUPS}
                chatPath={PATHS.TREKKER_CHAT}
              />
            }
          />
          {/* Gửi yêu cầu tham gia mở từ portal Trekker — giữ sidebar thay vì
              nhảy sang `/groups/:groupId/join` (PublicLayout). */}
          <Route
            path={PATHS.TREKKER_GROUPS_JOIN}
            element={
              <JoinGroupRequestPage
                embedded
                backPath={PATHS.TREKKER_MY_GROUPS}
                getDetailPath={getTrekkerGroupDetailPath}
              />
            }
          />
          <Route path={PATHS.TREKKER_MY_JOIN_REQUESTS} element={<MyJoinRequestsPage />} />
          <Route path={PATHS.TREKKER_VENDOR_APPLICATIONS} element={<MyApplications />} />
          <Route path={PATHS.TREKKER_BLOG_LIST} element={<MyBlogList />} />
          <Route path={PATHS.TREKKER_BLOG_CREATE} element={<CreateBlogPost />} />
          <Route path={PATHS.TREKKER_BLOG_EDIT} element={<CreateBlogPost editMode />} />
          <Route path={PATHS.TREKKER_CHANGE_PASSWORD} element={<TrekkerChangePassword />} />
          <Route
            path={PATHS.TREKKER_BOOKING_DETAIL}
            element={
              <BookingDetail
                backPath={PATHS.TREKKER_MY_TOURS}
                paymentPath={getTrekkerBookingPaymentPath}
              />
            }
          />
          <Route
            path={PATHS.TREKKER_BOOKING_PAYMENT}
            element={<PayBooking backPath={PATHS.TREKKER_BOOKING_DETAIL} />}
          />
          <Route path={PATHS.TREKKER_CHAT} element={<ChatList hideSidebar />} />
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
          <Route path={PATHS.ADMIN_VENDORS} element={<VendorList />} />
          <Route path={PATHS.ADMIN_TOURS} element={<AdminDashboard />} />
          <Route path={PATHS.ADMIN_DATA} element={<AdminDashboard />} />
          <Route path={PATHS.ADMIN_SETTINGS} element={<AdminDashboard />} />
          <Route path={PATHS.ADMIN_APPLICATIONS} element={<Applications />} />
          <Route path={PATHS.ADMIN_APPLICATION_DETAIL} element={<ApplicationDetails />} />
          <Route path={PATHS.ADMIN_REPORTS} element={<Reports />} />
          <Route path={PATHS.ADMIN_REPORT_DETAIL} element={<ReportDetail />} />
          <Route path={PATHS.ADMIN_BLOGS} element={<BlogManagement />} />
          <Route path={PATHS.ADMIN_SETTINGS} element={<SystemSettings />} />
          <Route path={PATHS.ADMIN_EMERGENCY} element={<EmergencySosPage />} />
          <Route path={PATHS.ADMIN_CHAT} element={<ChatList hideSidebar />} />
        </Route>

        {/* Vendor Manager routes — yêu cầu role vendor_manager, dùng VendorManagerLayout riêng */}
        <Route
          path={PATHS.VENDOR_MANAGER}
          element={
            <RequireRole allowedRoles={[ROLES.VENDOR_MANAGER]}>
              <VendorManagerLayout />
            </RequireRole>
          }
        >
          <Route index element={<Navigate to={PATHS.VENDOR_MANAGER_TOURS} replace />} />
          <Route path={PATHS.VENDOR_MANAGER_PROFILE} element={<VendorProfileOverview />} />
          <Route path={PATHS.VENDOR_MANAGER_PROFILE_EDIT} element={<VendorProfileEdit />} />
          <Route path={PATHS.VENDOR_MANAGER_STAFF} element={<StaffList />} />
          <Route path={PATHS.VENDOR_MANAGER_TOURS} element={<TourList />} />
          <Route path={PATHS.VENDOR_MANAGER_TOUR_CREATE} element={<TourCreate />} />
          <Route path={PATHS.VENDOR_MANAGER_TOUR_EDIT} element={<TourEdit />} />
          <Route path={PATHS.VENDOR_MANAGER_TOUR_APPROVALS} element={<TourApprovals />} />
          <Route path={PATHS.VENDOR_MANAGER_TOUR_SCHEDULES} element={<TourSchedules />} />
          <Route path={PATHS.VENDOR_MANAGER_BOOKINGS} element={<VendorBookingList />} />
          <Route path={PATHS.VENDOR_MANAGER_EQUIPMENT} element={<EquipmentList />} />
          <Route path={PATHS.VENDOR_MANAGER_PORTERS} element={<PorterList />} />
          <Route path={PATHS.VENDOR_MANAGER_PORTER_CREATE} element={<PorterCreate />} />
          <Route path={PATHS.VENDOR_MANAGER_PORTER_EDIT} element={<PorterEdit />} />
          <Route path={PATHS.VENDOR_MANAGER_SESSIONS} element={<SessionList />} />
          <Route path={PATHS.VENDOR_MANAGER_SESSION_DETAIL} element={<SessionDetail />} />
          <Route path={PATHS.VENDOR_MANAGER_EMERGENCY} element={<EmergencySosPage />} />
          <Route path={PATHS.VENDOR_MANAGER_VOUCHERS} element={<VendorVoucherList />} />
          <Route path={PATHS.VENDOR_MANAGER_CHAT} element={<ChatList hideSidebar />} />
          <Route path={PATHS.VENDOR_MANAGER_REPORTS} element={<VendorReports />} />
        </Route>

        {/* Vendor Staff routes — yêu cầu role vendor_staff, dùng VendorStaffLayout riêng */}
        <Route
          path={PATHS.PARTNER}
          element={
            <RequireRole allowedRoles={[ROLES.VENDOR_STAFF]}>
              <VendorStaffLayout />
            </RequireRole>
          }
        >
          <Route index element={<Navigate to={PATHS.PARTNER_TOURS} replace />} />
          <Route path={PATHS.PARTNER_PROFILE} element={<VendorProfileOverview />} />
          <Route path={PATHS.PARTNER_TOURS} element={<PartnerTourList />} />
          <Route path={PATHS.PARTNER_TOUR_CREATE} element={<PartnerTourCreate />} />
          <Route path={PATHS.PARTNER_TOUR_EDIT} element={<PartnerTourEdit />} />
          <Route path={PATHS.PARTNER_TOUR_SCHEDULES} element={<PartnerTourSchedules />} />
          <Route path={PATHS.PARTNER_BOOKINGS} element={<VendorBookingList />} />
          <Route path={PATHS.PARTNER_EQUIPMENT} element={<EquipmentList />} />
          <Route path={PATHS.PARTNER_PORTERS} element={<PorterList />} />
          <Route path={PATHS.PARTNER_PORTER_CREATE} element={<PorterCreate />} />
          <Route path={PATHS.PARTNER_PORTER_EDIT} element={<PorterEdit />} />
          <Route path={PATHS.PARTNER_SESSIONS} element={<SessionList />} />
          <Route path={PATHS.PARTNER_SESSION_DETAIL} element={<SessionDetail />} />
          <Route path={PATHS.PARTNER_BLOG_CREATE} element={<CreateBlogPost />} />
          <Route path={PATHS.PARTNER_VOUCHERS} element={<VendorVoucherList />} />
          <Route path={PATHS.PARTNER_CHAT} element={<ChatList hideSidebar />} />
        </Route>

        {/* Coordinator routes — sidebar riêng (SummitGuard), không dùng MainLayout nữa */}
        <Route
          path={PATHS.COORDINATOR}
          element={
            <RequireRole
              allowedRoles={[
                ROLES.COORDINATOR,
                ROLES.VENDOR_STAFF,
                ROLES.VENDOR_MANAGER,
                ROLES.ADMIN,
              ]}
            >
              <CoordinatorLayout />
            </RequireRole>
          }
        >
          <Route index element={<Navigate to={PATHS.COORDINATOR_SCHEDULES} replace />} />
          <Route path={PATHS.COORDINATOR_SCHEDULES} element={<CoordinatorSchedulesPage />} />
          <Route
            path={PATHS.COORDINATOR_SESSION_OPERATIONS}
            element={<CoordinatorSessionOperationsPage />}
          />
          <Route path={PATHS.COORDINATOR_CHAT} element={<ChatList hideSidebar />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
