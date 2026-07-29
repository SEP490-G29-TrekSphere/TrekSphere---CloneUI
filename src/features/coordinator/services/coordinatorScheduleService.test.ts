import { ApiService } from '@/config/apiClient';
import { coordinatorScheduleService } from './coordinatorScheduleService';

jest.mock('@/config/apiClient', () => ({
  ApiService: jest.fn(),
}));

const mockApiService = ApiService as jest.MockedFunction<typeof ApiService>;

describe('coordinatorScheduleService', () => {
  beforeEach(() => {
    mockApiService.mockReset();
  });

  test('getAssignedSchedules calls GET /coordinator/schedules with correct parameters', async () => {
    const mockResponse = {
      data: {
        content: [
          {
            coordinatorScheduleId: 's1',
            isLead: true,
            isCancelled: false,
            tourSessionId: 'ts1',
            sessionStatus: 'PENDING',
            tourId: 't1',
            tourName: 'Fansipan Trek',
            departureDate: '2026-07-29',
            returnDate: '2026-07-31',
          },
        ],
        pageNumber: 0,
        pageSize: 10,
        totalElements: 1,
        totalPages: 1,
        last: true,
      },
    };

    mockApiService.mockResolvedValueOnce(mockResponse);

    const filter = {
      status: 'PENDING' as const,
      isCancelled: false,
      departureDateFrom: '2026-07-20',
      departureDateTo: '2026-07-30',
      keyword: 'Fansipan',
      page: 0,
      size: 10,
      sortBy: 'departureDate',
      sortDir: 'asc',
    };

    const result = await coordinatorScheduleService.getAssignedSchedules(filter);

    expect(mockApiService).toHaveBeenCalledWith('/coordinator/schedules', 'GET', undefined, {
      status: 'PENDING',
      isCancelled: 'false',
      departureDateFrom: '2026-07-20',
      departureDateTo: '2026-07-30',
      keyword: 'Fansipan',
      page: '0',
      size: '10',
      sortBy: 'departureDate',
      sortDir: 'asc',
    });
    expect(result).toEqual(mockResponse.data);
  });

  test('getAssignedSchedules throws error if api response returns error', async () => {
    mockApiService.mockResolvedValueOnce({
      error: 'Unauthorized access',
    });

    await expect(coordinatorScheduleService.getAssignedSchedules()).rejects.toThrow(
      'Unauthorized access'
    );
  });
});
