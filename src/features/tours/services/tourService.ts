import { ApiService } from '@/config/apiClient';
import type { TourListApiResponse, TourListParams } from '@/features/tours/types';

export interface TourListResponse {
  content: TourListApiResponse['content'];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  last: boolean;
}

/**
 * Serialize a `TourListParams` object into a query string. Only includes
 * keys with defined, non-empty values — the backend treats `keyword=` as
 * a meaningful (empty) search, but `keyword` absent means "no filter".
 */
function buildQuery(params: TourListParams): string {
  const search = new URLSearchParams();

  if (params.keyword !== undefined && params.keyword !== '') {
    search.set('keyword', params.keyword);
  }
  if (params.location !== undefined && params.location !== '') {
    search.set('location', params.location);
  }
  if (params.difficulty) {
    search.set('difficulty', params.difficulty);
  }
  if (params.page !== undefined) {
    search.set('page', String(params.page));
  }
  if (params.size !== undefined) {
    search.set('size', String(params.size));
  }
  if (params.sortBy) {
    search.set('sortBy', params.sortBy);
  }
  if (params.sortDir) {
    search.set('sortDir', params.sortDir);
  }

  return search.toString();
}

export const tourService = {
  async getTours(params: TourListParams = {}): Promise<TourListResponse> {
    const queryString = buildQuery(params);
    const path = queryString ? `/tours?${queryString}` : '/tours';

    const response = await ApiService<TourListApiResponse>(path, 'GET');

    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.data) {
      throw new Error('No data received from API');
    }

    return {
      content: response.data.content,
      totalElements: response.data.totalElements,
      totalPages: response.data.totalPages,
      pageNumber: response.data.pageNumber,
      pageSize: response.data.pageSize,
      last: response.data.last,
    };
  },
};
