import { http } from 'msw';
import { type MockSchedule, mockTours } from '../data/tours';
import { fail, ok } from '../envelope';

/**
 * Mock cho `vendorSessionService` (`src/features/vendor-sessions/services/vendorSessionService.ts`)
 * — module "Vendor Logistics": mỗi "phiên tour" (session) tương ứng 1-1 với 1 lịch khởi hành
 * (`MockSchedule`) trong `src/mocks/data/tours.ts`, sinh ra tự động cho các lịch không còn ở
 * trạng thái `OPEN` "tương lai xa" (tức đã/đang/sẽ vận hành thực địa) để vendor phân bổ nhân sự
 * + trang thiết bị.
 *
 *   GET    /vendor/sessions                            — danh sách phiên (lọc tourId/status, page 1-based)
 *   GET    /vendor/sessions/by-schedule/:scheduleId     — tra phiên theo lịch khởi hành
 *   GET    /vendor/sessions/:id/allocations             — chi tiết phân bổ
 *   POST   /vendor/sessions/:id/coordinators            — gán điều phối viên
 *   DELETE /vendor/sessions/coordinators/:scheduleId    — gỡ điều phối viên
 *   POST   /vendor/sessions/:id/porters                 — gán porter
 *   DELETE /vendor/sessions/porters/:porterScheduleId   — gỡ porter
 *   POST   /vendor/sessions/:id/equipments               — cấp thiết bị
 *   DELETE /vendor/sessions/equipments/:sessionEquipmentId — thu hồi thiết bị
 *   PUT    /tracking/sessions/equipments/:sessionEquipmentId/check — đánh dấu đã kiểm tra thiết bị
 *   POST   /vendor/sessions/equipments/allocations/:sessionEquipmentId/confirm-return — xác nhận hoàn 1 thiết bị
 *   POST   /vendor/sessions/:id/equipments/confirm-return                              — xác nhận hoàn toàn bộ
 */

type SessionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

interface CoordinatorAllocation {
  coordinatorScheduleId: string;
  coordinatorId: string;
  fullName: string;
  phone?: string;
  email?: string;
  avatar?: string;
  isLead: boolean;
}

interface PorterAllocation {
  porterScheduleId: string;
  porterId: string;
  fullName: string;
  phone?: string;
  note?: string;
}

interface EquipmentAllocation {
  sessionEquipmentId: string;
  equipmentId: string;
  equipmentName: string;
  quantity: number;
  note?: string;
  isChecked?: boolean;
  returnedQuantity?: number;
  missingQuantity?: number;
  returnStatus?: 'NOT_RETURNED' | 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'REJECTED';
  submittedByName?: string;
  submittedAt?: string;
  confirmedByName?: string;
  confirmedAt?: string;
}

interface MockSession {
  sessionId: string;
  status: SessionStatus;
  startedAt?: string;
  endedAt?: string;
  tourId: string;
  tourName: string;
  departureDate: string;
  returnDate: string;
  scheduleId: string;
  coordinators: CoordinatorAllocation[];
  porters: PorterAllocation[];
  equipments: EquipmentAllocation[];
}

/** Roster ứng viên — mirror tên/id đã dùng ở `vendor-porters.ts` / `vendor-equipment.ts` cho nhất quán. */
const CANDIDATE_COORDINATORS: Record<
  string,
  { fullName: string; phone: string; email: string; avatar: string }
> = {
  'user-coordinator-1': {
    fullName: 'Phạm Thị Điều Phối',
    phone: '0900000005',
    email: 'coordinator@treksphere.vn',
    avatar: 'https://i.pravatar.cc/150?u=coordinator-1',
  },
  'coord-2': {
    fullName: 'Nguyễn Hữu Phát',
    phone: '0911222333',
    email: 'phat.coordinator@treksphere.vn',
    avatar: 'https://i.pravatar.cc/150?u=coordinator-2',
  },
};

const CANDIDATE_PORTERS: Record<string, { fullName: string; phone: string }> = {
  'porter-1': { fullName: 'Giàng A Chua', phone: '0912345671' },
  'porter-2': { fullName: 'Lý Thị Mai', phone: '0912345672' },
  'porter-3': { fullName: 'Sùng A Páo', phone: '0912345673' },
  'porter-4': { fullName: 'Vàng Seo Sáng', phone: '0912345674' },
  'porter-5': { fullName: 'Hoàng Thị Mến', phone: '0912345675' },
};

const CANDIDATE_EQUIPMENTS: Record<string, { equipmentName: string }> = {
  'equip-1': { equipmentName: 'Lều cắm trại 4 người' },
  'equip-2': { equipmentName: 'Túi ngủ giữ nhiệt -5°C' },
  'equip-3': { equipmentName: 'Dây leo núi 10mm' },
  'equip-4': { equipmentName: 'Bếp gas mini dã ngoại' },
  'equip-5': { equipmentName: 'Gậy trekking nhôm (đôi)' },
  'equip-6': { equipmentName: 'Đèn pin đội đầu' },
};

function scheduleStatusToSessionStatus(status: MockSchedule['status']): SessionStatus | null {
  switch (status) {
    case 'CANCELLED':
      return 'CANCELLED';
    case 'COMPLETED':
      return 'COMPLETED';
    case 'OPEN':
    case 'CLOSED':
      return null; // gán runtime bên dưới theo ngày khởi hành thực tế
    default:
      return null;
  }
}

/** Sinh session 1-1 cho mỗi lịch khởi hành đã "chốt" (có khách hoặc đã qua ngày mở bán). */
function buildSessions(): MockSession[] {
  const now = new Date('2026-08-29T00:00:00.000Z').getTime();
  const sessions: MockSession[] = [];
  let seq = 1;
  for (const tour of mockTours) {
    for (const schedule of tour.schedules) {
      if (
        schedule.status !== 'OPEN' &&
        schedule.status !== 'CLOSED' &&
        schedule.status !== 'COMPLETED'
      ) {
        continue; // lịch CANCELLED chưa từng vận hành thì không tạo phiên
      }
      const departureTime = new Date(schedule.departureDate).getTime();
      const returnTime = new Date(schedule.returnDate).getTime();
      const forced = scheduleStatusToSessionStatus(schedule.status);
      let status: SessionStatus;
      if (forced) {
        status = forced;
      } else if (now < departureTime) {
        status = 'PENDING';
      } else if (now >= departureTime && now <= returnTime) {
        status = 'IN_PROGRESS';
      } else {
        status = 'COMPLETED';
      }

      sessions.push({
        sessionId: `session-${seq++}`,
        status,
        startedAt:
          status === 'IN_PROGRESS' || status === 'COMPLETED' ? schedule.departureDate : undefined,
        endedAt: status === 'COMPLETED' ? schedule.returnDate : undefined,
        tourId: tour.tourId,
        tourName: tour.tourName,
        departureDate: schedule.departureDate,
        returnDate: schedule.returnDate,
        scheduleId: schedule.scheduleId,
        coordinators: [],
        porters: [],
        equipments: [],
      });
    }
  }
  return sessions;
}

const mockSessions: MockSession[] = buildSessions();

function findSessionById(sessionId: string): MockSession | undefined {
  return mockSessions.find((s) => s.sessionId === sessionId);
}

function findSessionByCoordinatorScheduleId(id: string) {
  return mockSessions.find((s) => s.coordinators.some((c) => c.coordinatorScheduleId === id));
}

function findSessionByPorterScheduleId(id: string) {
  return mockSessions.find((s) => s.porters.some((p) => p.porterScheduleId === id));
}

function findSessionByEquipmentAllocationId(id: string) {
  return mockSessions.find((s) => s.equipments.some((e) => e.sessionEquipmentId === id));
}

function toSummary(s: MockSession) {
  return {
    sessionId: s.sessionId,
    status: s.status,
    startedAt: s.startedAt,
    endedAt: s.endedAt,
    tourId: s.tourId,
    tourName: s.tourName,
    departureDate: s.departureDate,
    returnDate: s.returnDate,
  };
}

function toAllocation(s: MockSession) {
  return {
    ...toSummary(s),
    coordinators: s.coordinators,
    porters: s.porters,
    equipments: s.equipments,
  };
}

let seqCounter = 1;

export const vendorSessionHandlers = [
  http.get('*/vendor/sessions', async ({ request }) => {
    const url = new URL(request.url);
    const tourId = url.searchParams.get('tourId');
    const status = url.searchParams.get('status');
    const page = Number(url.searchParams.get('page') ?? '1'); // 1-based
    const size = Number(url.searchParams.get('size') ?? '10');

    let filtered = [...mockSessions];
    if (tourId) filtered = filtered.filter((s) => s.tourId === tourId);
    if (status) filtered = filtered.filter((s) => s.status === status);
    filtered.sort((a, b) => a.departureDate.localeCompare(b.departureDate));

    const start = (page - 1) * size;
    const content = filtered.slice(start, start + size).map(toSummary);

    return ok({
      content,
      pageNumber: page - 1,
      pageSize: size,
      totalElements: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / size)),
      last: start + size >= filtered.length,
    });
  }),

  http.get('*/vendor/sessions/by-schedule/:scheduleId', async ({ params }) => {
    const session = mockSessions.find((s) => s.scheduleId === params.scheduleId);
    if (!session) return fail('Không tìm thấy phiên tour tương ứng với lịch khởi hành này.', 404);
    return ok(toSummary(session));
  }),

  http.get('*/vendor/sessions/:id/allocations', async ({ params }) => {
    const session = findSessionById(params.id as string);
    if (!session) return fail('Không tìm thấy phiên tour.', 404);
    return ok(toAllocation(session));
  }),

  http.post('*/vendor/sessions/:id/coordinators', async ({ request, params }) => {
    const session = findSessionById(params.id as string);
    if (!session) return fail('Không tìm thấy phiên tour.', 404);
    const body = (await request.json().catch(() => ({}))) as {
      coordinatorId?: string;
      isLead?: boolean;
    };
    if (!body.coordinatorId) return fail('Vui lòng chọn điều phối viên.', 400);
    const candidate = CANDIDATE_COORDINATORS[body.coordinatorId] ?? {
      fullName: 'Điều phối viên',
      phone: undefined,
      email: undefined,
      avatar: undefined,
    };
    session.coordinators.push({
      coordinatorScheduleId: `coord-sch-${seqCounter++}`,
      coordinatorId: body.coordinatorId,
      fullName: candidate.fullName,
      phone: candidate.phone,
      email: candidate.email,
      avatar: candidate.avatar,
      isLead: body.isLead ?? false,
    });
    return ok(null, 'Gán điều phối viên thành công.', 201);
  }),

  http.delete('*/vendor/sessions/coordinators/:scheduleId', async ({ params }) => {
    const session = findSessionByCoordinatorScheduleId(params.scheduleId as string);
    if (!session) return fail('Không tìm thấy phân công điều phối viên.', 404);
    session.coordinators = session.coordinators.filter(
      (c) => c.coordinatorScheduleId !== params.scheduleId
    );
    return ok(null, 'Gỡ điều phối viên thành công.');
  }),

  http.post('*/vendor/sessions/:id/porters', async ({ request, params }) => {
    const session = findSessionById(params.id as string);
    if (!session) return fail('Không tìm thấy phiên tour.', 404);
    const body = (await request.json().catch(() => ({}))) as { porterId?: string; note?: string };
    if (!body.porterId) return fail('Vui lòng chọn porter.', 400);
    const candidate = CANDIDATE_PORTERS[body.porterId] ?? { fullName: 'Porter', phone: undefined };
    session.porters.push({
      porterScheduleId: `porter-sch-${seqCounter++}`,
      porterId: body.porterId,
      fullName: candidate.fullName,
      phone: candidate.phone,
      note: body.note,
    });
    return ok(null, 'Gán porter thành công.', 201);
  }),

  http.delete('*/vendor/sessions/porters/:porterScheduleId', async ({ params }) => {
    const session = findSessionByPorterScheduleId(params.porterScheduleId as string);
    if (!session) return fail('Không tìm thấy phân công porter.', 404);
    session.porters = session.porters.filter((p) => p.porterScheduleId !== params.porterScheduleId);
    return ok(null, 'Gỡ porter thành công.');
  }),

  http.post('*/vendor/sessions/:id/equipments', async ({ request, params }) => {
    const session = findSessionById(params.id as string);
    if (!session) return fail('Không tìm thấy phiên tour.', 404);
    const body = (await request.json().catch(() => ({}))) as {
      equipmentId?: string;
      quantity?: number;
      note?: string;
    };
    if (!body.equipmentId || !body.quantity) {
      return fail('Vui lòng chọn thiết bị và số lượng.', 400);
    }
    const candidate = CANDIDATE_EQUIPMENTS[body.equipmentId] ?? { equipmentName: 'Thiết bị' };
    session.equipments.push({
      sessionEquipmentId: `sess-equip-${seqCounter++}`,
      equipmentId: body.equipmentId,
      equipmentName: candidate.equipmentName,
      quantity: body.quantity,
      note: body.note,
      isChecked: false,
      returnStatus: 'NOT_RETURNED',
    });
    return ok(null, 'Cấp thiết bị thành công.', 201);
  }),

  http.delete('*/vendor/sessions/equipments/:sessionEquipmentId', async ({ params }) => {
    const session = findSessionByEquipmentAllocationId(params.sessionEquipmentId as string);
    if (!session) return fail('Không tìm thấy phân bổ thiết bị.', 404);
    session.equipments = session.equipments.filter(
      (e) => e.sessionEquipmentId !== params.sessionEquipmentId
    );
    return ok(null, 'Thu hồi thiết bị thành công.');
  }),

  http.put(
    '*/tracking/sessions/equipments/:sessionEquipmentId/check',
    async ({ request, params }) => {
      const session = findSessionByEquipmentAllocationId(params.sessionEquipmentId as string);
      if (!session) return fail('Không tìm thấy thiết bị được cấp.', 404);
      const equipment = session.equipments.find(
        (e) => e.sessionEquipmentId === params.sessionEquipmentId
      );
      if (!equipment) return fail('Không tìm thấy thiết bị được cấp.', 404);
      const body = (await request.json().catch(() => ({}))) as { isChecked?: boolean };
      equipment.isChecked = body.isChecked ?? true;
      return ok({
        sessionEquipmentId: equipment.sessionEquipmentId,
        isChecked: equipment.isChecked,
      });
    }
  ),

  http.post(
    '*/vendor/sessions/equipments/allocations/:sessionEquipmentId/confirm-return',
    async ({ params }) => {
      const session = findSessionByEquipmentAllocationId(params.sessionEquipmentId as string);
      if (!session) return fail('Không tìm thấy thiết bị được cấp.', 404);
      const equipment = session.equipments.find(
        (e) => e.sessionEquipmentId === params.sessionEquipmentId
      );
      if (!equipment) return fail('Không tìm thấy thiết bị được cấp.', 404);
      equipment.returnStatus = 'CONFIRMED';
      equipment.returnedQuantity = equipment.quantity;
      equipment.missingQuantity = 0;
      equipment.confirmedByName = 'Trần Thị Quản Lý';
      equipment.confirmedAt = new Date().toISOString();
      return ok(null, 'Xác nhận hoàn kho thành công.');
    }
  ),

  http.post('*/vendor/sessions/:id/equipments/confirm-return', async ({ params }) => {
    const session = findSessionById(params.id as string);
    if (!session) return fail('Không tìm thấy phiên tour.', 404);
    const now = new Date().toISOString();
    for (const equipment of session.equipments) {
      if (
        equipment.returnStatus === 'PENDING_CONFIRMATION' ||
        equipment.returnStatus === 'NOT_RETURNED'
      ) {
        equipment.returnStatus = 'CONFIRMED';
        equipment.returnedQuantity = equipment.quantity;
        equipment.missingQuantity = 0;
        equipment.confirmedByName = 'Trần Thị Quản Lý';
        equipment.confirmedAt = now;
      }
    }
    return ok(null, 'Xác nhận hoàn kho toàn bộ thành công.');
  }),
];
