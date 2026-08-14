import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { adminAccountService } from '../services/adminAccountService';
import { useAccountMutations } from './useAccountMutations';

jest.mock('../services/adminAccountService', () => ({
  adminAccountService: { updateStatus: jest.fn() },
}));

const mockUpdateStatus = adminAccountService.updateStatus as jest.MockedFunction<
  typeof adminAccountService.updateStatus
>;

/** Wrapper React Query riêng cho mỗi test — tránh cache dùng chung giữa các case. */
function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe('useAccountMutations — khóa/mở khóa tài khoản', () => {
  beforeEach(() => {
    mockUpdateStatus.mockReset();
  });

  test('lock gửi status DEACTIVATED (BE chưa hỗ trợ LOCKED — trả code 9001)', async () => {
    mockUpdateStatus.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useAccountMutations('u1'), { wrapper: createWrapper() });
    await result.current.lock.mutateAsync('u1');

    expect(mockUpdateStatus).toHaveBeenCalledWith('u1', 'DEACTIVATED');
  });

  test('unlock gửi status ACTIVE', async () => {
    mockUpdateStatus.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useAccountMutations('u1'), { wrapper: createWrapper() });
    await result.current.unlock.mutateAsync('u1');

    expect(mockUpdateStatus).toHaveBeenCalledWith('u1', 'ACTIVE');
  });

  test('lock ném lỗi lên caller để trang detail hiện toast', async () => {
    mockUpdateStatus.mockRejectedValueOnce(new Error('Không có quyền'));

    const { result } = renderHook(() => useAccountMutations('u1'), { wrapper: createWrapper() });

    await expect(result.current.lock.mutateAsync('u1')).rejects.toThrow('Không có quyền');
  });
});
