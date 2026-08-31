import { http } from 'msw';
import { fail, ok } from '../envelope';
import { createSosAlert, getLatestSosForSession } from './emergency-sos';

/**
 * Mock cho toàn bộ service của trang Coordinator:
 *  - `coordinatorScheduleService.ts`  → GET /coordinator/schedules
 *  - `sessionOperationsService.ts`    → GET /vendor/sessions/:id/allocations,
 *                                        GET /tours/:tourId/checkpoints,
 *                                        GET /coordinator/schedules/:id/logistics-info
 *  - `trackingService.ts`             → toàn bộ /tracking/sessions/* (vận hành thực địa)
 *
 * `offlineTrackingDb.ts` KHÔNG có handler tương ứng — đó là wrapper IndexedDB thuần cục bộ
 * (mở DB `treksphere-tracking-offline`, đọc/ghi `sessions` object store), không có bất kỳ
 * lệnh gọi mạng nào nên không có gì để MSW chặn.
 *
 * SOS: dùng chung state với `emergency-sos.ts` (xem `createSosAlert`/`getLatestSosForSession`)
 * — PUT resolve chỉ đăng ký 1 lần bên `emergency-sos.ts` để tránh 2 handler trùng route.
 */

const SESSION_ID = 'session-fansipan-1';
const TOUR_ID = 'tour-fansipan-3d2n';

type TourSessionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type CheckpointProgressStatus = 'PENDING' | 'REACHED' | 'SKIPPED';

const scheduleItems = [
  {
    coordinatorScheduleId: 'cs-1',
    isLead: true,
    isCancelled: false,
    tourSessionId: SESSION_ID,
    sessionStatus: 'IN_PROGRESS' as TourSessionStatus,
    tourId: TOUR_ID,
    tourName: 'Chinh phục Fansipan 3N2Đ — cung Trạm Tôn',
    departureDate: '2026-08-28',
    returnDate: '2026-08-30',
  },
  {
    coordinatorScheduleId: 'cs-2',
    isLead: false,
    isCancelled: false,
    tourSessionId: 'session-puluong-1',
    sessionStatus: 'PENDING' as TourSessionStatus,
    tourId: 'tour-puluong-3d2n',
    tourName: 'Pù Luông mùa lúa chín 3N2Đ',
    departureDate: '2026-09-12',
    returnDate: '2026-09-14',
  },
  {
    coordinatorScheduleId: 'cs-3',
    isLead: true,
    isCancelled: false,
    tourSessionId: 'session-tanang-1',
    sessionStatus: 'COMPLETED' as TourSessionStatus,
    tourId: 'tour-tanang-phandung-2d1d',
    tourName: 'Tà Năng — Phan Dũng 2N1Đ',
    departureDate: '2026-07-05',
    returnDate: '2026-07-06',
  },
  {
    coordinatorScheduleId: 'cs-4',
    isLead: false,
    isCancelled: true,
    tourSessionId: 'session-bidoup-1',
    sessionStatus: 'CANCELLED' as TourSessionStatus,
    tourId: 'tour-bidoup-2d1d',
    tourName: 'Bidoup Núi Bà 2N1Đ — nhóm chụp ảnh',
    departureDate: '2026-09-05',
    returnDate: '2026-09-06',
  },
];

const checkpoints = [
  {
    checkpointId: 'cp-1',
    checkpointName: 'Trạm Tôn (điểm xuất phát)',
    description: 'Cổng vào, độ cao 1900m',
    latitude: 22.328,
    longitude: 103.7757,
    altitude: 1900,
    checkpointOrder: 1,
  },
  {
    checkpointId: 'cp-2',
    checkpointName: 'Trạm dừng 2200m',
    description: 'Điểm nghỉ chân, rừng trúc',
    latitude: 22.3175,
    longitude: 103.7751,
    altitude: 2200,
    checkpointOrder: 2,
  },
  {
    checkpointId: 'cp-3',
    checkpointName: 'Trạm dừng 2800m',
    description: 'Lán nghỉ qua đêm',
    latitude: 22.3061,
    longitude: 103.7749,
    altitude: 2800,
    checkpointOrder: 3,
  },
  {
    checkpointId: 'cp-4',
    checkpointName: 'Đỉnh Fansipan',
    description: '3143m — nóc nhà Đông Dương',
    latitude: 22.3035,
    longitude: 103.7748,
    altitude: 3143,
    checkpointOrder: 4,
  },
];

interface CheckpointLog {
  sessionCheckpointLogId?: string;
  checkpointId: string;
  status: CheckpointProgressStatus;
  note?: string;
  reachedAt?: string;
}

const checkpointLogs: CheckpointLog[] = [
  {
    sessionCheckpointLogId: 'scl-1',
    checkpointId: 'cp-1',
    status: 'REACHED',
    reachedAt: '2026-08-28T00:10:00.000Z',
  },
  {
    sessionCheckpointLogId: 'scl-2',
    checkpointId: 'cp-2',
    status: 'REACHED',
    reachedAt: '2026-08-28T02:40:00.000Z',
  },
  { checkpointId: 'cp-3', status: 'PENDING' },
  { checkpointId: 'cp-4', status: 'PENDING' },
];

const sessionEquipments = [
  {
    sessionEquipmentId: 'se-1',
    equipmentId: 'eq-tent',
    equipmentName: 'Lều 2 người',
    quantity: 4,
    isChecked: true,
  },
  {
    sessionEquipmentId: 'se-2',
    equipmentId: 'eq-first-aid',
    equipmentName: 'Túi y tế cá nhân',
    quantity: 8,
    isChecked: true,
  },
  {
    sessionEquipmentId: 'se-3',
    equipmentId: 'eq-radio',
    equipmentName: 'Bộ đàm liên lạc',
    quantity: 3,
    isChecked: false,
  },
  {
    sessionEquipmentId: 'se-4',
    equipmentId: 'eq-headlamp',
    equipmentName: 'Đèn pin đội đầu',
    quantity: 8,
    isChecked: false,
  },
];

const sessionParticipants = [
  { participantId: 'p-1', fullName: 'Nguyễn Văn Trekker' },
  { participantId: 'p-2', fullName: 'Hoàng Nam' },
  { participantId: 'p-3', fullName: 'Thanh Hà' },
  { participantId: 'p-4', fullName: 'Minh Anh' },
  { participantId: 'p-5', fullName: 'Lê Tuấn Kiệt' },
];

let sessionStatus: TourSessionStatus = 'IN_PROGRESS';
let sessionStartedAt: string | undefined = '2026-08-28T00:00:00.000Z';
let sessionEndedAt: string | undefined;
let revision = 1;

let idSeq = 400;
function nextId(prefix: string) {
  idSeq += 1;
  return `${prefix}-${idSeq}`;
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

function buildSnapshot() {
  return {
    sessionId: SESSION_ID,
    status: sessionStatus,
    startedAt: sessionStartedAt,
    endedAt: sessionEndedAt,
    revision,
    participants: sessionParticipants.map((p) => ({
      participantId: p.participantId,
      fullName: p.fullName,
      isPresentStart: true,
      startAttendedAt: sessionStartedAt,
    })),
    equipments: sessionEquipments.map((e) => ({
      sessionEquipmentId: e.sessionEquipmentId,
      equipmentId: e.equipmentId,
      equipmentName: e.equipmentName,
      quantity: e.quantity,
      isChecked: e.isChecked,
    })),
    checkpoints: checkpoints.map((cp) => {
      const log = checkpointLogs.find((l) => l.checkpointId === cp.checkpointId);
      return {
        checkpointId: cp.checkpointId,
        checkpointName: cp.checkpointName,
        checkpointOrder: cp.checkpointOrder,
        latitude: cp.latitude,
        longitude: cp.longitude,
        status: log?.status ?? 'PENDING',
        reachedAt: log?.reachedAt,
      };
    }),
    latestSos: undefined,
  };
}

export const coordinatorHandlers = [
  // GET /coordinator/schedules
  http.get('*/coordinator/schedules', async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '0');
    const size = Number(url.searchParams.get('size') ?? '10');
    const status = url.searchParams.get('status');
    const isCancelled = url.searchParams.get('isCancelled');
    const keyword = url.searchParams.get('keyword')?.toLowerCase();
    const departureDateFrom = url.searchParams.get('departureDateFrom');
    const departureDateTo = url.searchParams.get('departureDateTo');

    let list = [...scheduleItems];
    if (status) list = list.filter((s) => s.sessionStatus === status);
    if (isCancelled !== null) list = list.filter((s) => String(s.isCancelled) === isCancelled);
    if (keyword) list = list.filter((s) => s.tourName.toLowerCase().includes(keyword));
    if (departureDateFrom) list = list.filter((s) => s.departureDate >= departureDateFrom);
    if (departureDateTo) list = list.filter((s) => s.departureDate <= departureDateTo);

    return ok(paginate(list, page, size));
  }),

  // GET /coordinator/schedules/:tourSessionId/logistics-info
  http.get('*/coordinator/schedules/:tourSessionId/logistics-info', async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '0');
    const size = Number(url.searchParams.get('size') ?? '100');
    return ok(paginate(sessionParticipants, page, size));
  }),

  // GET /vendor/sessions/:id/allocations
  http.get('*/vendor/sessions/:id/allocations', async () => {
    return ok({
      sessionId: SESSION_ID,
      status: sessionStatus,
      startedAt: sessionStartedAt,
      endedAt: sessionEndedAt,
      tourId: TOUR_ID,
      tourName: 'Chinh phục Fansipan 3N2Đ — cung Trạm Tôn',
      departureDate: '2026-08-28',
      returnDate: '2026-08-30',
      coordinators: [
        {
          coordinatorScheduleId: 'cs-1',
          coordinatorId: 'user-coordinator-1',
          fullName: 'Phạm Thị Điều Phối',
          isLead: true,
        },
      ],
      equipments: sessionEquipments,
    });
  }),

  // GET /tours/:tourId/checkpoints (public)
  http.get('*/tours/:tourId/checkpoints', async () => ok(checkpoints)),

  // POST /tracking/sessions/:sessionId/offline-pack
  http.post('*/tracking/sessions/:sessionId/offline-pack', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { deviceId?: string };
    const now = new Date();
    return ok({
      deviceSessionId: nextId('dsess'),
      deviceId: body.deviceId ?? 'unknown-device',
      actorId: 'user-coordinator-1',
      leadCoordinator: true,
      issuedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 12 * 3_600_000).toISOString(),
      serverTime: now.toISOString(),
      maxEventBatchSize: 100,
      maxLocationBatchSize: 200,
      gpsIntervalSeconds: 30,
      snapshot: buildSnapshot(),
    });
  }),

  // POST /tracking/sessions/:sessionId/sync-events
  http.post('*/tracking/sessions/:sessionId/sync-events', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      events?: { clientEventId: string; sequenceNumber: number }[];
    };
    revision += 1;
    const results = (body.events ?? []).map((e) => ({
      clientEventId: e.clientEventId,
      sequenceNumber: e.sequenceNumber,
      status: 'ACCEPTED' as const,
      resultRevision: revision,
    }));
    return ok({
      sessionId: SESSION_ID,
      revision,
      serverTime: new Date().toISOString(),
      results,
      snapshot: buildSnapshot(),
    });
  }),

  // GET /tracking/sessions/:sessionId/sync-state
  http.get('*/tracking/sessions/:sessionId/sync-state', async () => {
    return ok({
      revision,
      fullSnapshot: true,
      changes: [],
      snapshot: buildSnapshot(),
    });
  }),

  // GET /tracking/sessions/:sessionId/locations/latest — phải đứng TRƯỚC GET .../locations
  http.get('*/tracking/sessions/:sessionId/locations/latest', async ({ params }) => {
    return ok([
      {
        sampleId: 'sample-latest-1',
        sessionId: params.sessionId as string,
        actorId: 'user-coordinator-1',
        deviceId: 'device-1',
        recordedAt: new Date().toISOString(),
        receivedAt: new Date().toISOString(),
        latitude: 22.3061,
        longitude: 103.7749,
        accuracyMeters: 8,
        validationStatus: 'VALID' as const,
        late: false,
        stale: false,
      },
    ]);
  }),

  // GET /tracking/sessions/:sessionId/locations
  http.get('*/tracking/sessions/:sessionId/locations', async ({ params, request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') ?? '2000');
    const samples = checkpoints.slice(0, 3).map((cp, i) => ({
      sampleId: `sample-hist-${i}`,
      sessionId: params.sessionId as string,
      actorId: 'user-coordinator-1',
      deviceId: 'device-1',
      recordedAt: new Date(Date.now() - (3 - i) * 3_600_000).toISOString(),
      receivedAt: new Date(Date.now() - (3 - i) * 3_600_000).toISOString(),
      latitude: cp.latitude,
      longitude: cp.longitude,
      accuracyMeters: 10,
      validationStatus: 'VALID' as const,
      late: false,
      stale: false,
    }));
    return ok(samples.slice(0, limit));
  }),

  // POST /tracking/sessions/:sessionId/start
  http.post('*/tracking/sessions/:sessionId/start', async () => {
    sessionStatus = 'IN_PROGRESS';
    sessionStartedAt = new Date().toISOString();
    revision += 1;
    return ok({ status: sessionStatus, startedAt: sessionStartedAt });
  }),

  // POST /tracking/sessions/:sessionId/end
  http.post('*/tracking/sessions/:sessionId/end', async () => {
    sessionStatus = 'COMPLETED';
    sessionEndedAt = new Date().toISOString();
    revision += 1;
    return ok({ status: sessionStatus, endedAt: sessionEndedAt });
  }),

  // GET /tracking/sessions/:sessionId/checkpoint-logs
  http.get('*/tracking/sessions/:sessionId/checkpoint-logs', async () => {
    const list = checkpoints
      .map((cp) => {
        const log = checkpointLogs.find((l) => l.checkpointId === cp.checkpointId);
        return {
          sessionCheckpointLogId: log?.sessionCheckpointLogId,
          checkpointId: cp.checkpointId,
          checkpointName: cp.checkpointName,
          checkpointDescription: cp.description,
          checkpointOrder: cp.checkpointOrder,
          checkpointLatitude: cp.latitude,
          checkpointLongitude: cp.longitude,
          checkpointAltitude: cp.altitude,
          status: log?.status ?? 'PENDING',
          note: log?.note,
        };
      })
      .sort((a, b) => a.checkpointOrder - b.checkpointOrder);
    return ok(list);
  }),

  // POST /tracking/sessions/:sessionId/checkpoint-logs — check-in trạm kế tiếp theo GPS
  http.post('*/tracking/sessions/:sessionId/checkpoint-logs', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { note?: string };
    const next = checkpoints.find((cp) => {
      const log = checkpointLogs.find((l) => l.checkpointId === cp.checkpointId);
      return (log?.status ?? 'PENDING') === 'PENDING';
    });
    if (!next) return fail('Đã hoàn thành toàn bộ trạm dừng của hành trình.', 409);

    let log = checkpointLogs.find((l) => l.checkpointId === next.checkpointId);
    if (!log) {
      log = { checkpointId: next.checkpointId, status: 'PENDING' };
      checkpointLogs.push(log);
    }
    log.sessionCheckpointLogId = log.sessionCheckpointLogId ?? nextId('scl');
    log.status = 'REACHED';
    log.reachedAt = new Date().toISOString();
    log.note = body.note;
    revision += 1;

    return ok({
      checkpointId: next.checkpointId,
      checkpointName: next.checkpointName,
      checkpointOrder: next.checkpointOrder,
      status: log.status,
      reachedAt: log.reachedAt,
      note: log.note,
    });
  }),

  // POST /tracking/sessions/:sessionId/checkpoints/:checkpointId/skip
  http.post(
    '*/tracking/sessions/:sessionId/checkpoints/:checkpointId/skip',
    async ({ params, request }) => {
      const body = (await request.json().catch(() => ({}))) as { reason?: string };
      const cp = checkpoints.find((c) => c.checkpointId === params.checkpointId);
      if (!cp) return fail('Không tìm thấy trạm dừng.', 404);

      let log = checkpointLogs.find((l) => l.checkpointId === cp.checkpointId);
      if (!log) {
        log = { checkpointId: cp.checkpointId, status: 'PENDING' };
        checkpointLogs.push(log);
      }
      log.sessionCheckpointLogId = log.sessionCheckpointLogId ?? nextId('scl');
      log.status = 'SKIPPED';
      log.note = body.reason;
      revision += 1;

      return ok({
        checkpointId: cp.checkpointId,
        checkpointName: cp.checkpointName,
        checkpointOrder: cp.checkpointOrder,
        status: log.status,
        note: log.note,
      });
    }
  ),

  // POST /tracking/sessions/:sessionId/attendance
  http.post('*/tracking/sessions/:sessionId/attendance', async () => {
    revision += 1;
    return ok(null, 'Đã ghi nhận điểm danh.');
  }),

  // PUT /tracking/sessions/equipments/:sessionEquipmentId/check
  http.put(
    '*/tracking/sessions/equipments/:sessionEquipmentId/check',
    async ({ params, request }) => {
      const body = (await request.json().catch(() => ({}))) as { isChecked?: boolean };
      const eq = sessionEquipments.find((e) => e.sessionEquipmentId === params.sessionEquipmentId);
      if (!eq) return fail('Không tìm thấy trang thiết bị.', 404);
      eq.isChecked = body.isChecked ?? true;
      revision += 1;
      return ok({ sessionEquipmentId: eq.sessionEquipmentId, isChecked: eq.isChecked });
    }
  ),

  // GET /tracking/sessions/:sessionId/sos/status
  http.get('*/tracking/sessions/:sessionId/sos/status', async ({ params }) => {
    const tourSessionId = params.sessionId as string;
    const latest = getLatestSosForSession(tourSessionId);
    return ok({
      tourSessionId,
      hasSosAlert: Boolean(latest),
      hasActiveSosAlert: latest?.status === 'PENDING',
      resolved: latest ? latest.status === 'RESOLVED' : false,
      status: latest?.status,
      sosAlert: latest
        ? {
            sosAlertId: latest.sosAlertId,
            senderName: latest.senderName,
            senderRole: latest.senderRole,
            message: latest.message,
            status: latest.status,
            createdAt: latest.createdAt,
            resolvedByName: latest.resolvedByName,
          }
        : undefined,
    });
  }),

  // POST /tracking/sessions/sos — gửi tín hiệu SOS mới
  http.post('*/tracking/sessions/sos', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      tourSessionId?: string;
      latitude?: number;
      longitude?: number;
      message?: string;
    };
    const schedule = scheduleItems.find((s) => s.tourSessionId === body.tourSessionId);
    const alert = createSosAlert({
      tourSessionId: body.tourSessionId ?? SESSION_ID,
      tourName: schedule?.tourName,
      senderId: 'user-coordinator-1',
      senderName: 'Phạm Thị Điều Phối',
      senderRole: 'COORDINATOR',
      latitude: body.latitude ?? 22.3061,
      longitude: body.longitude ?? 103.7749,
      message: body.message,
    });
    return ok(
      { sosAlertId: alert.sosAlertId, status: alert.status, createdAt: alert.createdAt },
      'Đã gửi tín hiệu SOS.',
      201
    );
  }),

  // PUT /vendor/sessions/equipments/allocations/:sessionEquipmentId/return
  http.put('*/vendor/sessions/equipments/allocations/:sessionEquipmentId/return', async () => {
    return ok(null, 'Đã ghi nhận hoàn trả thiết bị.');
  }),

  // PUT /vendor/sessions/:sessionId/equipments/bulk-return
  http.put('*/vendor/sessions/:sessionId/equipments/bulk-return', async () => {
    return ok(null, 'Đã ghi nhận hoàn trả toàn bộ thiết bị.');
  }),
];

// Location batch route chứa dấu ':' ngay giữa segment ("locations:batch"), path-to-regexp
// (msw dùng nội bộ cho string route) không parse an toàn dạng này nên dùng RegExp + tự
// trích sessionId từ URL thay vì dùng cú pháp `:sessionId`.
coordinatorHandlers.push(
  http.post(/\/tracking\/sessions\/([^/]+)\/locations:batch$/, async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      samples?: { sampleId: string }[];
    };
    const sampleIds = (body.samples ?? []).map((s) => s.sampleId);
    return ok({
      acceptedSampleIds: sampleIds,
      duplicateSampleIds: [],
      rejectedSamples: [],
    });
  })
);
