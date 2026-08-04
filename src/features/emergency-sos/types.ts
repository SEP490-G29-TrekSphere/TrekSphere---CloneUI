export type SosAlertStatus = 'PENDING' | 'RESOLVED';

/** 1 tín hiệu SOS — mirror `SosAlertResponse` (BE tag "Tracking Management"). */
export interface SosAlert {
  sosAlertId: string;
  tourSessionId: string;
  tourName: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  latitude: number;
  longitude: number;
  message?: string;
  status: SosAlertStatus;
  createdAt: string;
  resolvedById?: string;
  resolvedByName?: string;
}

export interface SosAlertPage {
  content: SosAlert[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
