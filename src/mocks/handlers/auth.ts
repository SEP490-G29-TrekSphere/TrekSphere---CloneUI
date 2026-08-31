import { http } from 'msw';
import { findUserByEmail, findUserById, issueTokensFor, mockUsers } from '../data/users';
import { fail, ok } from '../envelope';

function toAuthUser(user: (typeof mockUsers)[number]) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    roles: user.roles,
  };
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

/** userId của người đang "đăng nhập" trong phiên demo — suy ra từ Bearer token giả. */
function currentUserIdFromAuthHeader(request: Request): string | null {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer mock-access-')) return null;
  const rest = auth.replace('Bearer mock-access-', '');
  return rest.split('-').slice(0, -1).join('-') || null;
}

export const authHandlers = [
  http.post('*/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    const user = body.email ? findUserByEmail(body.email) : undefined;
    if (!user || user.password !== body.password) {
      return fail('Email hoặc mật khẩu không đúng.', 401);
    }
    return ok({ user: toAuthUser(user), ...issueTokensFor(user) });
  }),

  http.post('*/auth/register', async ({ request }) => {
    const body = (await request.json()) as { email?: string; fullName?: string };
    if (body.email && findUserByEmail(body.email)) {
      return fail('Email đã được sử dụng.', 409);
    }
    return ok(
      { userId: `user-new-${Date.now()}`, email: body.email ?? '', fullName: body.fullName ?? '' },
      'Đăng ký thành công. Vui lòng kiểm tra email để xác thực.',
      201
    );
  }),

  http.post('*/auth/forgot-password', async () =>
    ok({ message: 'Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.' })
  ),

  http.post('*/auth/reset-password', async () =>
    ok({ success: true, message: 'Đặt lại mật khẩu thành công.' })
  ),

  http.post('*/auth/logout', async () => ok({ message: 'Đăng xuất thành công.' })),

  http.post('*/auth/refresh-token', async ({ request }) => {
    const body = (await request.json().catch(() => null)) as { refreshToken?: string } | null;
    const user = mockUsers.find((u) => body?.refreshToken?.includes(u.id)) ?? mockUsers[1];
    return ok({ user: toAuthUser(user), ...issueTokensFor(user) });
  }),

  http.post('*/auth/change-password', async () => ok({ message: 'Đổi mật khẩu thành công.' })),

  http.post('*/auth/google', async ({ request }) => {
    const url = new URL(request.url);
    const idToken = url.searchParams.get('idToken');
    const user = idToken ? mockUsers[1] : undefined;
    if (!user) return fail('Google login thất bại.', 401);
    return ok({ user: toAuthUser(user), ...issueTokensFor(user) });
  }),

  http.get('*/auth/verify', async ({ request }) => {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    if (!token) return fail('Thiếu token xác thực.', 400);
    return ok({ message: 'Email verified successfully', success: true });
  }),

  http.get('*/users/me', async ({ request }) => {
    const userId = currentUserIdFromAuthHeader(request);
    const user = (userId && findUserById(userId)) || mockUsers[1];
    return ok(toUserProfile(user));
  }),

  http.put('*/users/profile', async ({ request }) => {
    const userId = currentUserIdFromAuthHeader(request);
    const user = (userId && findUserById(userId)) || mockUsers[1];
    const patch = (await request.json().catch(() => ({}))) as Partial<
      ReturnType<typeof toUserProfile>
    >;
    return ok({ ...toUserProfile(user), ...patch });
  }),
];
