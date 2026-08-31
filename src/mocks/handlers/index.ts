import { http, type HttpHandler } from 'msw';
import { adminHandlers } from './admin';
import { authHandlers } from './auth';
import { chatHandlers } from './chat';
import { companionGroupWorkspaceHandlers } from './companion-group-workspace';
import { companionGroupHandlers } from './companion-groups';
import { coordinatorHandlers } from './coordinator';
import { emergencySosHandlers } from './emergency-sos';
import { homeHandlers } from './home';
import { newsHandlers } from './news';
import { paymentHandlers } from './payments';
import { profileHandlers } from './profile';
import { reportHandlers } from './reports';
import { tourHandlers } from './tours';
import { trekkerCommunityHandlers } from './trekker-community';
import { vendorBookingHandlers } from './vendor-bookings';
import { vendorCancellationPolicyHandlers } from './vendor-cancellation-policies';
import { vendorEquipmentHandlers } from './vendor-equipment';
import { vendorManagerStaffHandlers } from './vendor-manager-staff';
import { vendorPorterHandlers } from './vendor-porters';
import { vendorProfileHandlers } from './vendor-profile';
import { vendorReportHandlers } from './vendor-reports';
import { vendorSessionHandlers } from './vendor-sessions';
import { vendorTourHandlers } from './vendor-tours';
import { vendorVoucherHandlers } from './vendor-vouchers';
import { fail } from '../envelope';

export const handlers: HttpHandler[] = [
  ...authHandlers,
  ...profileHandlers,
  ...homeHandlers,
  ...newsHandlers,
  ...trekkerCommunityHandlers,
  ...tourHandlers,
  ...vendorTourHandlers,
  ...vendorSessionHandlers,
  ...vendorCancellationPolicyHandlers,
  ...vendorVoucherHandlers,
  ...vendorBookingHandlers,
  ...paymentHandlers,
  ...adminHandlers,
  ...reportHandlers,
  ...companionGroupHandlers,
  ...companionGroupWorkspaceHandlers,
  ...chatHandlers,
  ...coordinatorHandlers,
  ...emergencySosHandlers,
  ...vendorEquipmentHandlers,
  ...vendorPorterHandlers,
  ...vendorManagerStaffHandlers,
  ...vendorProfileHandlers,
  ...vendorReportHandlers,

  /**
   * Catch-all fallback cho các request API chưa được khai báo handler riêng.
   * Trả về HTTP 404 envelope thay vì để MSW passthrough gọi fetch() sang backend
   * không tồn tại (gây uncaught `TypeError: Failed to fetch` trong Service Worker).
   */
  http.all('*', ({ request }) => {
    const url = new URL(request.url);
    if (url.pathname.includes('/api/') || url.pathname.includes('/v1/')) {
      console.warn(`[MSW] Unhandled API request: ${request.method} ${request.url}`);
      return fail(`Mock API endpoint chưa được khởi tạo: ${request.method} ${url.pathname}`, 404);
    }
  }),
];
