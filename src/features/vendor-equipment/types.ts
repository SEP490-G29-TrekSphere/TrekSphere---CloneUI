// src/features/vendor-equipment/types.ts
/**
 * Types cho khu vực quản lý Dụng cụ/Thiết bị trong kho — dùng chung cho Vendor
 * Manager và Vendor Staff. BE (`vendor-equipment-controller`) dùng chung 1 bộ
 * endpoint cho cả 2 role, chỉ khác UI/route (giống pattern vendor-tours).
 */

export interface VendorEquipmentItem {
  id: string;
  name: string;
  description?: string;
  totalQuantity: number;
  createdAt: string;
  updatedAt: string;
}

/** `GET /vendor/equipments` chỉ hỗ trợ lọc theo `keyword` phía server. */
export interface VendorEquipmentFilter {
  search?: string;
}

export interface VendorEquipmentListResponse {
  equipments: VendorEquipmentItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateVendorEquipmentPayload {
  equipmentName: string;
  description?: string;
  totalQuantity: number;
}

/** `PUT /vendor/equipments/{id}` nhận cùng shape với tạo mới — FE luôn gửi đủ 3 field. */
export type UpdateVendorEquipmentPayload = CreateVendorEquipmentPayload;
