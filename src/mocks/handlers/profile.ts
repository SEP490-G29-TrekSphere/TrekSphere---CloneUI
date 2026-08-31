import { http } from 'msw';
import { findUserById, mockUsers } from '../data/users';
import { ok } from '../envelope';

/**
 * Handlers cho `profileService` (src/features/profile/services/profileService.ts).
 *
 * `getProfile` (GET /users/me) và phần đọc profile đã được `authHandlers`
 * (src/mocks/handlers/auth.ts) xử lý — KHÔNG duplicate ở đây.
 *
 * File này chỉ cover phần `authHandlers` chưa có:
 *  - PUT /users/me (multipart/form-data)  — profileService.updateProfile
 *  - POST /files/upload?folder=           — profileService.uploadFile
 *  - POST /files/upload/batch?folder=     — profileService.uploadFiles
 */

/** userId của người đang "đăng nhập" trong phiên demo — suy ra từ Bearer token giả. */
function currentUserIdFromAuthHeader(request: Request): string | null {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer mock-access-')) return null;
  const rest = auth.replace('Bearer mock-access-', '');
  return rest.split('-').slice(0, -1).join('-') || null;
}

function toUserProfile(user: (typeof mockUsers)[number]) {
  return {
    id: user.id,
    email: user.email,
    name: user.fullName,
    phone: user.phone,
    avatar: user.avatarUrl,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth,
    roles: user.roles,
    role: user.roles[0] ?? 'TREKKER',
  };
}

export const profileHandlers = [
  /** GET /users/:userId — Lấy thông tin public của user */
  http.get('*/users/:userId', async ({ params, request }) => {
    const userId = params.userId as string;
    if (userId === 'me') {
      const currentId = currentUserIdFromAuthHeader(request);
      const user = (currentId && findUserById(currentId)) || mockUsers[1];
      return ok(toUserProfile(user));
    }
    const user = findUserById(userId) || mockUsers[1];
    return ok(toUserProfile(user));
  }),

  /**
   * PUT /users/me — cập nhật profile qua multipart/form-data.
   * Fields: fullName, phone, dateOfBirth, gender, avatar (File, optional).
   * Không có store thật để ghi lại vĩnh viễn — chỉ echo lại dữ liệu vừa gửi lên
   * merge với user demo hiện tại, đủ để UI hiển thị đúng ngay sau khi lưu.
   */
  http.put('*/users/me', async ({ request }) => {
    const userId = currentUserIdFromAuthHeader(request);
    const user = (userId && findUserById(userId)) || mockUsers[1];
    const base = toUserProfile(user);

    const formData = await request.formData().catch(() => null);
    if (!formData) {
      return ok(base, 'Cập nhật thông tin cá nhân thành công.');
    }

    const fullName = formData.get('fullName');
    const phone = formData.get('phone');
    const dateOfBirth = formData.get('dateOfBirth');
    const gender = formData.get('gender');
    const avatarFile = formData.get('avatar');

    const updated = {
      ...base,
      ...(typeof fullName === 'string' && fullName ? { name: fullName } : {}),
      ...(typeof phone === 'string' && phone ? { phone } : {}),
      ...(typeof dateOfBirth === 'string' && dateOfBirth ? { dateOfBirth } : {}),
      ...(typeof gender === 'string' && gender
        ? { gender: gender.toLowerCase() as 'male' | 'female' | 'other' }
        : {}),
      ...(avatarFile instanceof File && avatarFile.size > 0
        ? { avatar: `https://picsum.photos/seed/avatar-${user.id}-${Date.now()}/300/300` }
        : {}),
    };

    return ok(updated, 'Cập nhật thông tin cá nhân thành công.');
  }),

  /**
   * POST /files/upload?folder=<folder> — upload 1 file, trả URL qua `message`
   * (đúng như BE thật — xem comment trong `profileService.uploadFile`).
   */
  http.post('*/files/upload', async ({ request }) => {
    const url = new URL(request.url);
    const folder = url.searchParams.get('folder') || 'general';
    const fakeUrl = `https://picsum.photos/seed/${folder}-${Date.now()}/600/600`;
    return ok(null, fakeUrl, 200);
  }),

  /**
   * POST /files/upload/batch?folder=<folder> — upload nhiều file, trả mảng URL
   * theo đúng envelope chuẩn (`data: string[]`).
   */
  http.post('*/files/upload/batch', async ({ request }) => {
    const url = new URL(request.url);
    const folder = url.searchParams.get('folder') || 'general';
    const formData = await request.formData().catch(() => null);
    const count = formData ? formData.getAll('files').length : 1;
    const urls = Array.from(
      { length: Math.max(count, 1) },
      (_, i) => `https://picsum.photos/seed/${folder}-${Date.now()}-${i}/600/600`
    );
    return ok(urls, 'Upload thành công.');
  }),
];
