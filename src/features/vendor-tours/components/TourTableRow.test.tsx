import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ApiStatus, VendorTourListItem } from '../types';
import { MANAGER_EDITABLE_STATUSES, STAFF_EDITABLE_STATUSES, TourTableRow } from './TourTableRow';

type RowOverrides = Partial<React.ComponentProps<typeof TourTableRow>>;

function renderRow(status: VendorTourListItem['status'], overrides: RowOverrides = {}) {
  const tour: VendorTourListItem = {
    id: 't1',
    name: 'Đỉnh Phượng Hoàng',
    basePrice: 15000000,
    difficulty: 'MODERATE',
    status,
    createdAt: '2026-07-20T10:00:00Z',
  };
  return render(
    <MemoryRouter>
      <table>
        <tbody>
          <TourTableRow
            tour={tour}
            editPath="/vendor-manager/tours/t1/edit"
            schedulesPath="/vendor-manager/tours/t1/schedules"
            editableStatuses={new Set<ApiStatus>()}
            {...overrides}
          />
        </tbody>
      </table>
    </MemoryRouter>
  );
}

test('Staff: hiện nút Sửa khi tour đang DRAFT', () => {
  renderRow('DRAFT', { editableStatuses: STAFF_EDITABLE_STATUSES });
  expect(screen.getByTitle('Sửa tour')).toBeTruthy();
});

test('Staff: hiện nút Sửa khi tour bị REJECTED', () => {
  renderRow('REJECTED', { editableStatuses: STAFF_EDITABLE_STATUSES });
  expect(screen.getByTitle('Sửa tour')).toBeTruthy();
});

test('Staff: ẩn nút Sửa khi tour đang PENDING_APPROVAL', () => {
  renderRow('PENDING_APPROVAL', { editableStatuses: STAFF_EDITABLE_STATUSES });
  expect(screen.queryByTitle('Sửa tour')).toBeNull();
});

test('Manager: hiện nút Sửa khi tour đang PENDING_APPROVAL', () => {
  renderRow('PENDING_APPROVAL', { editableStatuses: MANAGER_EDITABLE_STATUSES });
  expect(screen.getByTitle('Sửa tour')).toBeTruthy();
});

test('Manager: ẩn nút Sửa khi tour đang DRAFT', () => {
  renderRow('DRAFT', { editableStatuses: MANAGER_EDITABLE_STATUSES });
  expect(screen.queryByTitle('Sửa tour')).toBeNull();
});

test('Manager: ẩn nút Sửa khi tour đã APPROVED', () => {
  renderRow('APPROVED', { editableStatuses: MANAGER_EDITABLE_STATUSES });
  expect(screen.queryByTitle('Sửa tour')).toBeNull();
});

test('Gửi kiểm duyệt: hiện khi có handler và status DRAFT', () => {
  renderRow('DRAFT', { onSubmitApprovalClick: jest.fn() });
  expect(screen.getByTitle('Gửi yêu cầu kiểm duyệt')).toBeTruthy();
});

test('Gửi kiểm duyệt: ẩn khi không truyền handler (vd: màn Manager)', () => {
  renderRow('DRAFT');
  expect(screen.queryByTitle('Gửi yêu cầu kiểm duyệt')).toBeNull();
});

test('Gửi kiểm duyệt: ẩn khi status không phải DRAFT/REJECTED dù có handler', () => {
  renderRow('PENDING_APPROVAL', { onSubmitApprovalClick: jest.fn() });
  expect(screen.queryByTitle('Gửi yêu cầu kiểm duyệt')).toBeNull();
});

test('Chuyển trạng thái: hiện khi có handler và status REJECTED', () => {
  renderRow('REJECTED', { onRevertClick: jest.fn() });
  expect(screen.getByTitle('Chuyển trạng thái / Sửa lại')).toBeTruthy();
});

test('Chuyển trạng thái: ẩn khi status không phải REJECTED', () => {
  renderRow('APPROVED', { onRevertClick: jest.fn() });
  expect(screen.queryByTitle('Chuyển trạng thái / Sửa lại')).toBeNull();
});

test('Ẩn tour: hiện khi có onHideClick và status APPROVED', () => {
  renderRow('APPROVED', { onHideClick: jest.fn() });
  expect(screen.getByTitle('Ẩn tour')).toBeTruthy();
});

test('Ẩn tour: ẩn khi status là HIDDEN dù có handler', () => {
  renderRow('HIDDEN', { onHideClick: jest.fn() });
  expect(screen.queryByTitle('Ẩn tour')).toBeNull();
});

test('Mở lại tour: hiện khi có onUnhideClick và status HIDDEN', () => {
  renderRow('HIDDEN', { onUnhideClick: jest.fn() });
  expect(screen.getByTitle('Mở lại tour')).toBeTruthy();
});

test('Mở lại tour: ẩn khi status là APPROVED dù có handler', () => {
  renderRow('APPROVED', { onUnhideClick: jest.fn() });
  expect(screen.queryByTitle('Mở lại tour')).toBeNull();
});

test('Lịch khởi hành: bật khi tour APPROVED', () => {
  renderRow('APPROVED');
  expect(screen.getByTitle('Lịch khởi hành')).toHaveProperty('disabled', false);
});

test('Lịch khởi hành: bật khi tour HIDDEN', () => {
  renderRow('HIDDEN');
  expect(screen.getByTitle('Lịch khởi hành')).toHaveProperty('disabled', false);
});

test('Lịch khởi hành: disable kèm tooltip lý do khi tour DRAFT', () => {
  renderRow('DRAFT');
  const button = screen.getByTitle('Tour cần được duyệt trước khi tạo lịch khởi hành');
  expect(button).toHaveProperty('disabled', true);
});

test('Xóa tour: hiện khi có onDeleteClick (vd: màn Manager)', () => {
  renderRow('APPROVED', { onDeleteClick: jest.fn() });
  expect(screen.getByTitle('Xóa tour')).toBeTruthy();
});

test('Xóa tour: ẩn khi không truyền onDeleteClick (vd: màn Staff)', () => {
  renderRow('APPROVED');
  expect(screen.queryByTitle('Xóa tour')).toBeNull();
});
