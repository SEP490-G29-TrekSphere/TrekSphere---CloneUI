import { http } from 'msw';
import type { FitnessLevel } from '@/features/tours/types';
import { findBookingsByScheduleId } from '../data/bookings';
import {
  findCheckpointById,
  findScheduleById,
  findTourById,
  type MockCheckpoint,
  type MockSchedule,
  type MockTour,
  mockTours,
  nextCheckpointId,
  nextScheduleId,
  nextTourId,
  toTourDetailFromApi,
  VENDOR_ID,
} from '../data/tours';
import { mockUsers } from '../data/users';
import { fail, ok } from '../envelope';

/**
 * Mock cho `vendorTourService` + `vendorScheduleService` + `vendorScheduleCancellationService`
 * (`src/features/vendor-tours/services/*.ts`) — quản lý tour + lịch khởi hành của vendor hiện
 * tại, dùng chung tour database ở `src/mocks/data/tours.ts` với `tours.ts` (public browse) và
 * `vendor-sessions.ts` (logistics theo phiên).
 *
 *   GET    /vendor/tours                       — danh sách tour của vendor (lọc keyword + phân trang)
 *   POST   /vendor/tours                       — tạo tour mới (multipart/form-data), status mặc định DRAFT
 *   GET    /vendor/tours/:id                   — chi tiết tour (code thật gọi endpoint này dù docstring
 *                                                 cũ trong service ghi dùng `/tours/{id}` — trả cùng shape)
 *   PUT    /vendor/tours/:id                   — cập nhật tour (multipart/form-data)
 *   DELETE /vendor/tours/:id                   — xóa mềm tour
 *   POST   /vendor/tours/:id/submit-approval   — gửi duyệt
 *   PUT    /vendor/tours/:id/approve           — Manager duyệt
 *   PUT    /vendor/tours/:id/reject            — Manager từ chối (kèm reason)
 *   PUT    /vendor/tours/:id/hide              — Manager ẩn tour đã duyệt (kèm reason)
 *   POST   /vendor/tours/:id/revert-to-draft   — REJECTED -> DRAFT (Staff) / PENDING_APPROVAL (Manager)
 *   PUT    /vendor/tours/:id/unhide            — HIDDEN -> APPROVED
 *   POST   /vendor/tours/:id/restore           — khôi phục tour đã xóa mềm -> PENDING_APPROVAL
 *   POST   /vendor/tours/:tourId/checkpoints            — thêm checkpoint (multipart/form-data)
 *   PUT    /vendor/tours/checkpoints/:checkpointId       — sửa checkpoint (multipart/form-data)
 *   DELETE /vendor/tours/checkpoints/:checkpointId       — xóa checkpoint
 *   POST   /vendor/tours/:tourId/schedules               — tạo lịch khởi hành
 *   PUT    /vendor/tours/schedules/:scheduleId           — sửa lịch (kể cả đổi status -> CANCELLED)
 *   DELETE /vendor/tours/schedules/:scheduleId           — hủy lịch (chỉ khi chưa có khách đặt)
 */

function currentUserRole(request: Request): string {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer mock-access-')) return 'VENDOR_STAFF';
  const rest = auth.replace('Bearer mock-access-', '');
  const userId = rest.split('-').slice(0, -1).join('-');
  const user = mockUsers.find((u) => u.id === userId);
  return user?.roles[0] ?? 'VENDOR_STAFF';
}

function toVendorTourResponseDto(t: MockTour) {
  return {
    tourId: t.tourId,
    tourName: t.tourName,
    basePrice: t.basePrice,
    difficulty: t.difficulty,
    status: t.status,
    coverImageUrl: t.coverImageUrl,
    createdAt: t.createdAt,
    onlineBookingEnabled: Boolean(t.paymentPolicy && t.participationPolicy),
    onlineBookingDisabledReason: t.paymentPolicy ? null : 'Tour chưa sẵn sàng nhận đặt online.',
  };
}

function toTourDetailResponseDto(t: MockTour) {
  return { tourId: t.tourId, status: t.status };
}

async function parseTourFormData(request: Request) {
  const fd = await request.formData();
  const str = (key: string) => (fd.has(key) ? String(fd.get(key)) : undefined);
  const num = (key: string) => (fd.has(key) ? Number(fd.get(key)) : undefined);
  const bool = (key: string) => (fd.has(key) ? String(fd.get(key)) === 'true' : undefined);

  return {
    tourName: str('tourName'),
    description: str('description'),
    difficulty: str('difficulty') as MockTour['difficulty'] | undefined,
    location: str('location'),
    durationDays: num('durationDays'),
    basePrice: num('basePrice'),
    minCapacity: num('minCapacity'),
    maxCapacity: num('maxCapacity'),
    coverImageUrl: str('coverImageUrl'),
    hasCoverImageFile: fd.has('coverImage'),
    participationPolicy: {
      minAge: num('participationPolicy.minAge') ?? 0,
      maxAge: num('participationPolicy.maxAge') ?? null,
      fitnessLevel: (str('participationPolicy.fitnessLevel') ?? 'ANY') as FitnessLevel,
      healthRequirements: str('participationPolicy.healthRequirements') ?? null,
      restrictedMedicalConditions: str('participationPolicy.restrictedMedicalConditions') ?? null,
      requiredExperience: str('participationPolicy.requiredExperience') ?? null,
      requiredSkills: str('participationPolicy.requiredSkills') ?? null,
      requiredEquipment: str('participationPolicy.requiredEquipment') ?? null,
      requiredDocuments: str('participationPolicy.requiredDocuments') ?? null,
      requiresHealthDeclaration: bool('participationPolicy.requiresHealthDeclaration') ?? false,
      requiresMedicalCertificate: bool('participationPolicy.requiresMedicalCertificate') ?? false,
      guardianRequiredUnderAge: num('participationPolicy.guardianRequiredUnderAge') ?? null,
      additionalRequirements: str('participationPolicy.additionalRequirements') ?? null,
    },
  };
}

async function parseCheckpointFormData(request: Request) {
  const fd = await request.formData();
  const str = (key: string) => (fd.has(key) ? String(fd.get(key)) : undefined);
  const num = (key: string) => (fd.has(key) ? Number(fd.get(key)) : undefined);
  return {
    checkpointName: str('checkpointName'),
    description: str('description'),
    checkpointOrder: num('checkpointOrder'),
    latitude: num('latitude'),
    longitude: num('longitude'),
    altitude: num('altitude'),
    checkpointImageUrl: str('checkpointImageUrl'),
  };
}

export const vendorTourHandlers = [
  http.get('*/vendor/tours', async ({ request }) => {
    const url = new URL(request.url);
    const keyword = url.searchParams.get('keyword')?.toLowerCase();
    const page = Number(url.searchParams.get('page') ?? '0');
    const size = Number(url.searchParams.get('size') ?? '10');

    let filtered = mockTours.filter((t) => !t.isDeleted);
    if (keyword) {
      filtered = filtered.filter((t) => t.tourName.toLowerCase().includes(keyword));
    }
    filtered = [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const start = page * size;
    const content = filtered.slice(start, start + size).map(toVendorTourResponseDto);

    return ok({
      content,
      pageNumber: page,
      pageSize: size,
      totalElements: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / size)),
      last: start + size >= filtered.length,
    });
  }),

  http.post('*/vendor/tours', async ({ request }) => {
    const parsed = await parseTourFormData(request);
    if (!parsed.tourName || !parsed.location || !parsed.difficulty) {
      return fail('Thiếu thông tin bắt buộc để tạo tour.', 400, [
        { field: 'tourName', message: 'Tên tour là bắt buộc.' },
      ]);
    }
    const now = new Date().toISOString();
    const tourId = nextTourId();
    const created: MockTour = {
      tourId,
      slug: tourId,
      tourName: parsed.tourName,
      description: parsed.description ?? '',
      difficulty: parsed.difficulty,
      location: parsed.location,
      durationDays: parsed.durationDays ?? 1,
      basePrice: parsed.basePrice ?? 0,
      minCapacity: parsed.minCapacity ?? 1,
      maxCapacity: parsed.maxCapacity ?? 1,
      totalDistanceKm: 0,
      highlights: '',
      includes: '',
      excludes: '',
      coverImageUrl:
        parsed.coverImageUrl ??
        (parsed.hasCoverImageFile ? `https://picsum.photos/seed/${tourId}/800/600` : ''),
      status: 'DRAFT',
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      images: [],
      schedules: [],
      checkpoints: [],
      reviews: [],
      participationPolicy: { tourId, policyVersion: 1, ...parsed.participationPolicy },
      hasCancellationPolicies: false,
    };
    mockTours.unshift(created);
    return ok(toTourDetailResponseDto(created), 'Tạo tour thành công.', 201);
  }),

  http.get('*/vendor/tours/:id', async ({ params }) => {
    const tour = findTourById(params.id as string);
    if (!tour || tour.isDeleted) return fail('Không tìm thấy tour.', 404);
    return ok(toTourDetailFromApi(tour));
  }),

  http.put('*/vendor/tours/:id', async ({ request, params }) => {
    const tour = findTourById(params.id as string);
    if (!tour) return fail('Không tìm thấy tour.', 404);
    const parsed = await parseTourFormData(request);

    if (parsed.tourName !== undefined) tour.tourName = parsed.tourName;
    if (parsed.description !== undefined) tour.description = parsed.description;
    if (parsed.difficulty !== undefined) tour.difficulty = parsed.difficulty;
    if (parsed.location !== undefined) tour.location = parsed.location;
    if (parsed.durationDays !== undefined) tour.durationDays = parsed.durationDays;
    if (parsed.basePrice !== undefined) tour.basePrice = parsed.basePrice;
    if (parsed.minCapacity !== undefined) tour.minCapacity = parsed.minCapacity;
    if (parsed.maxCapacity !== undefined) tour.maxCapacity = parsed.maxCapacity;
    if (parsed.coverImageUrl) tour.coverImageUrl = parsed.coverImageUrl;
    else if (parsed.hasCoverImageFile)
      tour.coverImageUrl = `https://picsum.photos/seed/${tour.tourId}-${Date.now()}/800/600`;
    tour.participationPolicy = {
      tourId: tour.tourId,
      policyVersion: (tour.participationPolicy?.policyVersion ?? 0) + 1,
      ...parsed.participationPolicy,
    };
    tour.updatedAt = new Date().toISOString();

    return ok(toTourDetailResponseDto(tour), 'Cập nhật tour thành công.');
  }),

  http.delete('*/vendor/tours/:id', async ({ params }) => {
    const tour = findTourById(params.id as string);
    if (!tour) return fail('Không tìm thấy tour.', 404);
    tour.isDeleted = true;
    tour.updatedAt = new Date().toISOString();
    return ok(null, 'Xóa tour thành công.');
  }),

  http.post('*/vendor/tours/:id/submit-approval', async ({ params }) => {
    const tour = findTourById(params.id as string);
    if (!tour) return fail('Không tìm thấy tour.', 404);
    if (tour.status !== 'DRAFT' && tour.status !== 'REJECTED') {
      return fail('Chỉ có thể gửi duyệt tour đang ở trạng thái Nháp hoặc Bị từ chối.', 400);
    }
    tour.status = 'PENDING_APPROVAL';
    tour.updatedAt = new Date().toISOString();
    return ok(toTourDetailResponseDto(tour), 'Đã gửi tour để duyệt.');
  }),

  http.put('*/vendor/tours/:id/approve', async ({ params }) => {
    const tour = findTourById(params.id as string);
    if (!tour) return fail('Không tìm thấy tour.', 404);
    if (tour.status !== 'PENDING_APPROVAL') {
      return fail('Chỉ có thể duyệt tour đang chờ duyệt.', 400);
    }
    tour.status = 'APPROVED';
    tour.hasCancellationPolicies = true;
    tour.paymentPolicy = tour.paymentPolicy ?? {
      tourId: tour.tourId,
      paymentOption: 'FULL_OR_DEPOSIT',
      depositType: 'PERCENTAGE',
      depositValue: 30,
      remainingDueDaysBeforeDeparture: 7,
      policyVersion: 1,
    };
    tour.updatedAt = new Date().toISOString();
    return ok(toTourDetailResponseDto(tour), 'Duyệt tour thành công.');
  }),

  http.put('*/vendor/tours/:id/reject', async ({ request, params }) => {
    const tour = findTourById(params.id as string);
    if (!tour) return fail('Không tìm thấy tour.', 404);
    if (tour.status !== 'PENDING_APPROVAL') {
      return fail('Chỉ có thể từ chối tour đang chờ duyệt.', 400);
    }
    const body = (await request.json().catch(() => ({}))) as { reason?: string };
    if (!body.reason) return fail('Vui lòng nhập lý do từ chối.', 400);
    tour.status = 'REJECTED';
    tour.updatedAt = new Date().toISOString();
    return ok(toTourDetailResponseDto(tour), 'Đã từ chối tour.');
  }),

  http.put('*/vendor/tours/:id/hide', async ({ request, params }) => {
    const tour = findTourById(params.id as string);
    if (!tour) return fail('Không tìm thấy tour.', 404);
    if (tour.status !== 'APPROVED') {
      return fail('Chỉ có thể ẩn tour đang được duyệt.', 400);
    }
    const body = (await request.json().catch(() => ({}))) as { reason?: string };
    if (!body.reason) return fail('Vui lòng nhập lý do ẩn tour.', 400);
    tour.status = 'HIDDEN';
    tour.updatedAt = new Date().toISOString();
    return ok(toTourDetailResponseDto(tour), 'Đã ẩn tour.');
  }),

  http.post('*/vendor/tours/:id/revert-to-draft', async ({ request, params }) => {
    const tour = findTourById(params.id as string);
    if (!tour) return fail('Không tìm thấy tour.', 404);
    if (tour.status !== 'REJECTED') {
      return fail('Chỉ có thể chuyển tour đang bị từ chối.', 400);
    }
    const role = currentUserRole(request);
    tour.status = role === 'VENDOR_MANAGER' ? 'PENDING_APPROVAL' : 'DRAFT';
    tour.updatedAt = new Date().toISOString();
    return ok(toTourDetailResponseDto(tour), 'Đã chuyển trạng thái tour.');
  }),

  http.put('*/vendor/tours/:id/unhide', async ({ params }) => {
    const tour = findTourById(params.id as string);
    if (!tour) return fail('Không tìm thấy tour.', 404);
    if (tour.status !== 'HIDDEN') {
      return fail('Chỉ có thể mở lại tour đang bị ẩn.', 400);
    }
    tour.status = 'APPROVED';
    tour.updatedAt = new Date().toISOString();
    return ok(toTourDetailResponseDto(tour), 'Đã mở lại tour.');
  }),

  http.post('*/vendor/tours/:id/restore', async ({ params }) => {
    const tour = findTourById(params.id as string);
    if (!tour) return fail('Không tìm thấy tour.', 404);
    tour.isDeleted = false;
    tour.status = 'PENDING_APPROVAL';
    tour.updatedAt = new Date().toISOString();
    return ok(toTourDetailResponseDto(tour), 'Đã khôi phục tour.');
  }),

  http.post('*/vendor/tours/:tourId/checkpoints', async ({ request, params }) => {
    const tour = findTourById(params.tourId as string);
    if (!tour) return fail('Không tìm thấy tour.', 404);
    const parsed = await parseCheckpointFormData(request);
    if (!parsed.checkpointName) return fail('Tên checkpoint là bắt buộc.', 400);

    const checkpointId = nextCheckpointId();
    const checkpoint: MockCheckpoint = {
      checkpointId,
      tourId: tour.tourId,
      checkpointName: parsed.checkpointName,
      description: parsed.description ?? null,
      latitude: parsed.latitude ?? null,
      longitude: parsed.longitude ?? null,
      altitude: parsed.altitude ?? null,
      checkpointOrder: parsed.checkpointOrder ?? tour.checkpoints.length + 1,
      checkpointImageUrl: parsed.checkpointImageUrl ?? null,
      checkpointImageUrls: parsed.checkpointImageUrl ? parsed.checkpointImageUrl.split(',') : [],
    };
    tour.checkpoints.push(checkpoint);
    return ok({ checkpointId }, 'Thêm checkpoint thành công.', 201);
  }),

  http.put('*/vendor/tours/checkpoints/:checkpointId', async ({ request, params }) => {
    const found = findCheckpointById(params.checkpointId as string);
    if (!found) return fail('Không tìm thấy checkpoint.', 404);
    const parsed = await parseCheckpointFormData(request);
    const { checkpoint } = found;
    if (parsed.checkpointName !== undefined) checkpoint.checkpointName = parsed.checkpointName;
    if (parsed.description !== undefined) checkpoint.description = parsed.description;
    if (parsed.checkpointOrder !== undefined) checkpoint.checkpointOrder = parsed.checkpointOrder;
    if (parsed.latitude !== undefined) checkpoint.latitude = parsed.latitude;
    if (parsed.longitude !== undefined) checkpoint.longitude = parsed.longitude;
    if (parsed.altitude !== undefined) checkpoint.altitude = parsed.altitude;
    if (parsed.checkpointImageUrl !== undefined) {
      checkpoint.checkpointImageUrl = parsed.checkpointImageUrl;
      checkpoint.checkpointImageUrls = parsed.checkpointImageUrl.split(',');
    }
    return ok({ checkpointId: checkpoint.checkpointId }, 'Cập nhật checkpoint thành công.');
  }),

  http.delete('*/vendor/tours/checkpoints/:checkpointId', async ({ params }) => {
    const found = findCheckpointById(params.checkpointId as string);
    if (!found) return fail('Không tìm thấy checkpoint.', 404);
    found.tour.checkpoints = found.tour.checkpoints.filter(
      (c) => c.checkpointId !== params.checkpointId
    );
    return ok(null, 'Xóa checkpoint thành công.');
  }),

  http.post('*/vendor/tours/:tourId/schedules', async ({ request, params }) => {
    const tour = findTourById(params.tourId as string);
    if (!tour) return fail('Không tìm thấy tour.', 404);
    const body = (await request.json().catch(() => ({}))) as {
      departureDate?: string;
      returnDate?: string;
      price?: number;
      availableSlots?: number;
    };
    if (!body.departureDate || !body.returnDate) {
      return fail('Vui lòng nhập ngày khởi hành và ngày kết thúc.', 400);
    }
    const now = new Date().toISOString();
    const schedule: MockSchedule = {
      scheduleId: nextScheduleId(),
      tourId: tour.tourId,
      departureDate: body.departureDate,
      returnDate: body.returnDate,
      availableSlots: body.availableSlots ?? tour.maxCapacity,
      bookedSlots: 0,
      price: body.price ?? tour.basePrice,
      status: 'OPEN',
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      createdBy: VENDOR_ID,
      updatedBy: VENDOR_ID,
      deletedAt: null,
      deletedBy: null,
    };
    tour.schedules.push(schedule);
    return ok(schedule, 'Tạo lịch khởi hành thành công.', 201);
  }),

  http.put('*/vendor/tours/schedules/:scheduleId', async ({ request, params }) => {
    const found = findScheduleById(params.scheduleId as string);
    if (!found) return fail('Không tìm thấy lịch khởi hành.', 404);
    const { schedule } = found;
    const body = (await request.json().catch(() => ({}))) as {
      departureDate?: string;
      returnDate?: string;
      price?: number;
      availableSlots?: number;
      status?: MockSchedule['status'];
      reason?: string;
    };
    if (
      schedule.bookedSlots > 0 &&
      body.status &&
      body.status !== schedule.status &&
      !body.reason
    ) {
      return fail('Lịch đã có khách đặt — vui lòng nhập lý do thay đổi trạng thái.', 400);
    }
    if (body.departureDate !== undefined) schedule.departureDate = body.departureDate;
    if (body.returnDate !== undefined) schedule.returnDate = body.returnDate;
    if (body.price !== undefined) schedule.price = body.price;
    if (body.availableSlots !== undefined) schedule.availableSlots = body.availableSlots;
    if (body.status !== undefined) schedule.status = body.status;
    schedule.updatedAt = new Date().toISOString();
    return ok(schedule, 'Cập nhật lịch khởi hành thành công.');
  }),

  http.delete('*/vendor/tours/schedules/:scheduleId', async ({ params }) => {
    const found = findScheduleById(params.scheduleId as string);
    if (!found) return fail('Không tìm thấy lịch khởi hành.', 404);
    const { tour, schedule } = found;
    const existingBookings = findBookingsByScheduleId(schedule.scheduleId);
    if (schedule.bookedSlots > 0 || existingBookings.length > 0) {
      return fail('Không thể hủy lịch đã có khách đặt.', 400);
    }
    tour.schedules = tour.schedules.filter((s) => s.scheduleId !== schedule.scheduleId);
    return ok(null, 'Hủy lịch khởi hành thành công.');
  }),
];
