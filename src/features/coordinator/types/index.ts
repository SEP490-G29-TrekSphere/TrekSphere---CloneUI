export type CoordinatorScheduleStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface CoordinatorScheduleFilter {
  status?: CoordinatorScheduleStatus;
  isCancelled?: boolean;
  departureDateFrom?: string;
  departureDateTo?: string;
  keyword?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

export interface CoordinatorScheduleItem {
  coordinatorScheduleId: string;
  isLead: boolean;
  isCancelled: boolean;
  tourSessionId: string;
  sessionStatus: CoordinatorScheduleStatus;
  tourId: string;
  tourName: string;
  departureDate: string;
  returnDate: string;
}

export interface CoordinatorScheduleListResponse {
  content: CoordinatorScheduleItem[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
