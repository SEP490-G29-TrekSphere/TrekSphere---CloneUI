export type VoucherDiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';
export type VoucherStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';

export interface VendorVoucherFilter {
  discountType?: VoucherDiscountType;
  status?: VoucherStatus;
  validUntil?: string; // yyyy-MM-dd
  maxUsage?: number;
  keyword?: string;
  page?: number; // 0-based index for API, though UI can map it
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface VendorActiveVouchersFilter {
  discountType?: VoucherDiscountType;
  keyword?: string;
  page?: number; // default: 0
  size?: number; // default: 10
  sortBy?: string; // default: createdAt
  sortDir?: 'asc' | 'desc'; // default: desc
}

export interface VoucherResponse {
  voucherId: string;
  code: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  validFrom: string; // ISO DateTime
  validUntil: string; // ISO DateTime
  usedCount: number;
  maxUsage: number;
  minOrderValue: number;
  status: VoucherStatus;
}

export interface PaginationVoucherResponse {
  content: VoucherResponse[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface CreateVoucherRequest {
  code: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  minOrderValue: number;
  maxUsage: number;
  validFrom: string; // ISO string
  validUntil: string; // ISO string
}

export interface UpdateVoucherRequest {
  discountType: VoucherDiscountType;
  discountValue: number;
  minOrderValue: number;
  maxUsage: number;
  validFrom: string; // ISO string
  validUntil: string; // ISO string
  status: VoucherStatus;
}

export interface ValidateVoucherRequest {
  code: string;
  orderValue: number;
  vendorId: string;
}

export interface VoucherValidationResponse {
  discountAmount: number;
  message: string;
  valid: boolean;
}
