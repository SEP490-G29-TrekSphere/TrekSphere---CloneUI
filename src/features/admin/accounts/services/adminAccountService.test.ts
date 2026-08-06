import { ApiService } from '@/config/apiClient';
import { adminAccountService } from './adminAccountService';

jest.mock('@/config/apiClient', () => ({
  ApiService: jest.fn(),
}));

const mockApiService = ApiService as jest.MockedFunction<typeof ApiService>;

describe('adminAccountService.updateStatus', () => {
  beforeEach(() => {
    mockApiService.mockReset();
  });

  test('gửi status qua query param của PUT /users/{id}/status', async () => {
    mockApiService.mockResolvedValueOnce({ status: 200 });

    await adminAccountService.updateStatus('u1', 'DEACTIVATED');

    expect(mockApiService).toHaveBeenCalledWith('/users/u1/status', 'PUT', undefined, {
      status: 'DEACTIVATED',
    });
  });

  test('mở khóa gửi status ACTIVE', async () => {
    mockApiService.mockResolvedValueOnce({ status: 200 });

    await adminAccountService.updateStatus('u1', 'ACTIVE');

    expect(mockApiService).toHaveBeenCalledWith('/users/u1/status', 'PUT', undefined, {
      status: 'ACTIVE',
    });
  });

  test('ném Error kèm message của BE khi request thất bại', async () => {
    mockApiService.mockResolvedValueOnce({
      error: 'Chức năng khoá vĩnh viễn chưa được hỗ trợ',
      status: 400,
    });

    await expect(adminAccountService.updateStatus('u1', 'DEACTIVATED')).rejects.toThrow(
      'Chức năng khoá vĩnh viễn chưa được hỗ trợ'
    );
  });
});
