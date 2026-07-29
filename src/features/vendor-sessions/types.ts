// src/features/vendor-sessions/types.ts
/**
 * Types cho khu vực "Trek Sessions" (Vendor Logistics — Module 5C) — dùng chung
 * Vendor Manager và Vendor Staff. Mirror schema BE tag "Vendor Logistics".
 *
 * Lưu ý: BE không có API liệt kê riêng "coordinator" — Coordinator thực chất là
 * nhân viên (vendor-staff) đang active, chọn qua Staff Directory. `coordinatorId`
 * gửi lên khi gán được suy luận là user id của nhân viên (không phải vendorStaffId),
 * dựa trên cách các API khác (SOS, tracking) định danh Hướng dẫn viên bằng user id.
 */

export type SessionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface VendorSessionSummary {
  sessionId: string;
  status: SessionStatus;
  startedAt?: string;
  endedAt?: string;
  tourId: string;
  tourName: string;
  departureDate: string;
  returnDate: string;
}

/** `GET /vendor/sessions` chỉ hỗ trợ lọc theo `tourId`/`status` phía server. */
export interface VendorSessionFilter {
  tourId?: string;
  status?: SessionStatus;
}

export interface VendorSessionListResponse {
  sessions: VendorSessionSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SessionCoordinator {
  coordinatorScheduleId: string;
  coordinatorId: string;
  fullName: string;
  phone?: string;
  email?: string;
  avatar?: string;
  isLead: boolean;
}

export interface SessionPorter {
  porterScheduleId: string;
  porterId: string;
  fullName: string;
  phone?: string;
  note?: string;
}

export interface SessionEquipment {
  sessionEquipmentId: string;
  equipmentId: string;
  equipmentName: string;
  quantity: number;
  note?: string;
}

export interface SessionAllocation extends VendorSessionSummary {
  coordinators: SessionCoordinator[];
  porters: SessionPorter[];
  equipments: SessionEquipment[];
}

export interface AssignCoordinatorPayload {
  coordinatorId: string;
  isLead: boolean;
}

export interface AssignPorterPayload {
  porterId: string;
  note?: string;
}

export interface AssignEquipmentPayload {
  equipmentId: string;
  quantity: number;
  note?: string;
}

/** Ứng viên Coordinator lấy từ Staff Directory (`vendor-manager/staff`). */
export interface CoordinatorCandidate {
  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
}
