import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import VendorManagerLayout from './VendorManagerLayout';

// `useLogout` internally imports from the `@/features/auth` barrel, which
// transitively pulls in unrelated pages (PublicHeader → AppEmptyState →
// `empty.svg?react`) that Jest has no transform for. No test here clicks
// "Đăng xuất", so mocking the hook avoids that unrelated import chain
// without touching any production code.
jest.mock('@/features/auth/hooks/useLogout', () => ({
  useLogout: () => ({ logout: jest.fn(), isLoggingOut: false }),
}));

function ChildProbe() {
  return <div>child-rendered</div>;
}

function renderLayout() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/vendor-manager/staff']}>
        <Routes>
          <Route path="/vendor-manager" element={<VendorManagerLayout />}>
            <Route path="staff" element={<ChildProbe />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  useAppStore.setState({ user: { id: 'u1', name: 'Vendor Owner', roles: ['vendor_manager'] } });
});

test('render thương hiệu TrekManager, nav "Nhân viên" active, các mục khác disabled', () => {
  renderLayout();
  expect(screen.getByText('TrekManager')).toBeTruthy();
  expect(screen.getByText('Quản lý đoàn leo núi')).toBeTruthy();

  const staffLink = screen.getByText('Nhân viên').closest('a');
  expect(staffLink).not.toBeNull();

  const disabledItem = screen.getByText('Tổng quan').closest('a');
  expect(disabledItem).toBeNull(); // disabled item render as <span>, không phải <a>
});

test('render trang con qua Outlet', () => {
  renderLayout();
  expect(screen.getByText('child-rendered')).toBeTruthy();
});

test('search input thay đổi giá trị (context truyền xuống Outlet)', () => {
  renderLayout();
  const input = screen.getByPlaceholderText('Tìm kiếm thông tin nhân viên...');
  fireEvent.change(input, { target: { value: 'quan' } });
  expect((input as HTMLInputElement).value).toBe('quan');
});

test('hiển thị tên user từ store', () => {
  renderLayout();
  expect(screen.getByText('Vendor Owner')).toBeTruthy();
});
