import { http } from 'msw';
import { ok } from '../envelope';

/**
 * Mock cho `sosService.ts` (+ `formatRelativeTime`/`formatSosCode` chỉ là hàm format thuần,
 * không gọi API nên không cần mock). Đây cũng là kho dữ liệu SOS dùng chung với
 * `coordinator.ts` (trackingService.sendSos / getSosStatus gọi chung các endpoint
 * `/tracking/sessions/sos*`) — export thêm các hàm/mảng bên dưới để `coordinator.ts` import,
 * tránh 2 nơi định nghĩa 2 "nguồn sự thật" khác nhau cho cùng 1 tín hiệu SOS.
 */

export type SosAlertStatus = 'PENDING' | 'RESOLVED';

export interface SosAlert {
  sosAlertId: string;
  tourSessionId: string;
  tourName: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  latitude: number;
  longitude: number;
  message?: string;
  status: SosAlertStatus;
  createdAt: string;
  resolvedById?: string;
  resolvedByName?: string;
}

let idSeq = 300;
function nextId(prefix: string) {
  idSeq += 1;
  return `${prefix}-${idSeq}`;
}

export const sosAlerts: SosAlert[] = [
  {
    sosAlertId: 'sos-1',
    tourSessionId: 'session-fansipan-1',
    tourName: 'Chinh phục Fansipan 3N2Đ — cung Trạm Tôn',
    senderId: 'user-demo-tuankiet',
    senderName: 'Lê Tuấn Kiệt',
    senderRole: 'TREKKER',
    latitude: 22.30345,
    longitude: 103.7745,
    message: 'Một thành viên trong đoàn bị trẹo chân gần trạm 2800m, cần hỗ trợ y tế.',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 12 * 60_000).toISOString(),
  },
  {
    sosAlertId: 'sos-2',
    tourSessionId: 'session-puluong-1',
    tourName: 'Pù Luông mùa lúa chín 3N2Đ',
    senderId: 'user-coordinator-1',
    senderName: 'Phạm Thị Điều Phối',
    senderRole: 'COORDINATOR',
    latitude: 20.4235,
    longitude: 105.1521,
    message: 'Đoàn bị lạc đường do sương mù dày, cần định vị hỗ trợ dẫn đường.',
    status: 'RESOLVED',
    createdAt: new Date(Date.now() - 3 * 3_600_000).toISOString(),
    resolvedById: 'user-admin-1',
    resolvedByName: 'Admin TrekSphere',
  },
];

/** Dùng bởi `coordinator.ts` (trackingService.sendSos) để tạo tín hiệu SOS mới cho 1 phiên tour. */
export function createSosAlert(input: {
  tourSessionId: string;
  tourName?: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  latitude: number;
  longitude: number;
  message?: string;
}): SosAlert {
  const alert: SosAlert = {
    sosAlertId: nextId('sos'),
    tourSessionId: input.tourSessionId,
    tourName: input.tourName ?? 'Phiên tour đang diễn ra',
    senderId: input.senderId,
    senderName: input.senderName,
    senderRole: input.senderRole,
    latitude: input.latitude,
    longitude: input.longitude,
    message: input.message,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };
  sosAlerts.unshift(alert);
  return alert;
}

/** Dùng bởi `coordinator.ts` (trackingService.getSosStatus) để tra cứu SOS mới nhất của 1 phiên. */
export function getLatestSosForSession(tourSessionId: string): SosAlert | undefined {
  return sosAlerts
    .filter((a) => a.tourSessionId === tourSessionId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
}

function paginate<T>(items: T[], page: number, size: number) {
  const start = page * size;
  const content = items.slice(start, start + size);
  return {
    content,
    pageNumber: page,
    pageSize: size,
    totalElements: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / size)),
    last: start + size >= items.length,
  };
}

export const emergencySosHandlers = [
  // GET /tracking/sessions/sos/active — danh sách SOS đang chờ xử lý (PENDING), phân trang
  http.get('*/tracking/sessions/sos/active', async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '0');
    const size = Number(url.searchParams.get('size') ?? '20');
    const active = sosAlerts.filter((a) => a.status === 'PENDING');
    return ok(paginate(active, page, size));
  }),

  // PUT /tracking/sessions/sos/:sosId/resolve — dùng chung bởi sosService VÀ trackingService
  // (coordinator.ts KHÔNG đăng ký lại route này để tránh 2 handler trùng path/method).
  http.put('*/tracking/sessions/sos/:sosId/resolve', async ({ params }) => {
    const alert = sosAlerts.find((a) => a.sosAlertId === params.sosId);
    if (!alert) {
      const fallback: SosAlert = {
        sosAlertId: params.sosId as string,
        tourSessionId: 'unknown-session',
        tourName: 'Phiên tour',
        senderId: 'unknown',
        senderName: 'Người dùng',
        senderRole: 'TREKKER',
        latitude: 0,
        longitude: 0,
        status: 'RESOLVED',
        createdAt: new Date().toISOString(),
      };
      return ok(fallback, 'Đã xử lý tín hiệu SOS.');
    }
    alert.status = 'RESOLVED';
    alert.resolvedById = 'user-coordinator-1';
    alert.resolvedByName = 'Phạm Thị Điều Phối';
    return ok(alert, 'Đã xử lý tín hiệu SOS.');
  }),
];
