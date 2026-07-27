import { ApiService } from '@/config/apiClient';
import { vendorTourService } from './vendorTourService';

jest.mock('@/config/apiClient', () => ({
  ApiService: jest.fn(),
}));

const mockApiService = ApiService as jest.MockedFunction<typeof ApiService>;

describe('vendorTourService — duyệt/từ chối/ẩn tour', () => {
  beforeEach(() => {
    mockApiService.mockReset();
  });

  test('approveTour gọi PUT /vendor/tours/{id}/approve không kèm body', async () => {
    mockApiService.mockResolvedValueOnce({ data: { tourId: 't1', status: 'APPROVED' } });

    const result = await vendorTourService.approveTour('t1');

    expect(mockApiService).toHaveBeenCalledWith('/vendor/tours/t1/approve', 'PUT');
    expect(result).toEqual({ id: 't1', status: 'APPROVED' });
  });

  test('rejectTour gọi PUT /vendor/tours/{id}/reject kèm reason', async () => {
    mockApiService.mockResolvedValueOnce({ data: { tourId: 't1', status: 'REJECTED' } });

    const result = await vendorTourService.rejectTour('t1', 'Thiếu ảnh minh họa');

    expect(mockApiService).toHaveBeenCalledWith('/vendor/tours/t1/reject', 'PUT', {
      reason: 'Thiếu ảnh minh họa',
    });
    expect(result).toEqual({ id: 't1', status: 'REJECTED' });
  });

  test('hideTour gọi PUT /vendor/tours/{id}/hide kèm reason', async () => {
    mockApiService.mockResolvedValueOnce({ data: { tourId: 't1', status: 'HIDDEN' } });

    const result = await vendorTourService.hideTour('t1', 'Vi phạm chính sách');

    expect(mockApiService).toHaveBeenCalledWith('/vendor/tours/t1/hide', 'PUT', {
      reason: 'Vi phạm chính sách',
    });
    expect(result).toEqual({ id: 't1', status: 'HIDDEN' });
  });

  test('listMyTours trả về createdAt cho từng tour', async () => {
    mockApiService.mockResolvedValueOnce({
      data: {
        content: [
          {
            tourId: 't1',
            tourName: 'Đỉnh Phượng Hoàng',
            basePrice: 15000000,
            difficulty: 'MODERATE',
            status: 'PENDING_APPROVAL',
            coverImageUrl: null,
            createdAt: '2026-07-20T10:00:00Z',
          },
        ],
        pageNumber: 0,
        pageSize: 10,
        totalElements: 1,
        totalPages: 1,
        last: true,
      },
    });

    const result = await vendorTourService.listMyTours({}, 1, 10);

    expect(result.tours[0].createdAt).toBe('2026-07-20T10:00:00Z');
  });
});
