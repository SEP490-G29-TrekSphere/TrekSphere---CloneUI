export interface MockUser {
  id: string;
  email: string;
  password: string;
  fullName: string;
  avatarUrl?: string;
  roles: string[];
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
}

/**
 * Tài khoản demo — dùng để đăng nhập thử từng role trong luồng UI.
 * Mật khẩu chung: "password123".
 */
export const mockUsers: MockUser[] = [
  {
    id: 'user-admin-1',
    email: 'admin@treksphere.vn',
    password: 'password123',
    fullName: 'Admin TrekSphere',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    roles: ['ADMIN'],
    phone: '0900000001',
    gender: 'other',
    dateOfBirth: '1990-01-01',
  },
  {
    id: 'user-trekker-1',
    email: 'trekker@treksphere.vn',
    password: 'password123',
    fullName: 'Nguyễn Văn Trekker',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    roles: ['TREKKER'],
    phone: '0900000002',
    gender: 'male',
    dateOfBirth: '1998-05-12',
  },
  {
    id: 'user-vendor-manager-1',
    email: 'manager@treksphere.vn',
    password: 'password123',
    fullName: 'Trần Thị Quản Lý',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    roles: ['VENDOR_MANAGER'],
    phone: '0900000003',
    gender: 'female',
    dateOfBirth: '1988-03-20',
  },
  {
    id: 'user-vendor-staff-1',
    email: 'partner@treksphere.vn',
    password: 'password123',
    fullName: 'Lê Văn Đối Tác',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    roles: ['VENDOR_STAFF'],
    phone: '0900000004',
    gender: 'male',
    dateOfBirth: '1992-07-08',
  },
  {
    id: 'user-coordinator-1',
    email: 'coordinator@treksphere.vn',
    password: 'password123',
    fullName: 'Phạm Thị Điều Phối',
    avatarUrl:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
    roles: ['COORDINATOR'],
    phone: '0900000005',
    gender: 'female',
    dateOfBirth: '1995-11-30',
  },
];

export function findUserByEmail(email: string): MockUser | undefined {
  return mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): MockUser | undefined {
  return mockUsers.find((u) => u.id === id);
}

export function issueTokensFor(user: MockUser) {
  return {
    access_token: `mock-access-${user.id}-${Date.now()}`,
    refresh_token: `mock-refresh-${user.id}`,
  };
}
