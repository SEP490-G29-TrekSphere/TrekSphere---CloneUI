import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { VendorTourListItem } from '../types';
import { TourTableRow } from './TourTableRow';

function renderRow(status: VendorTourListItem['status']) {
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
            onDeleteClick={jest.fn()}
          />
        </tbody>
      </table>
    </MemoryRouter>
  );
}

test('hiện nút Sửa khi tour đang DRAFT', () => {
  renderRow('DRAFT');
  expect(screen.getByTitle('Sửa tour')).toBeTruthy();
});

test('hiện nút Sửa khi tour bị REJECTED', () => {
  renderRow('REJECTED');
  expect(screen.getByTitle('Sửa tour')).toBeTruthy();
});

test('ẩn nút Sửa khi tour đang PENDING_APPROVAL', () => {
  renderRow('PENDING_APPROVAL');
  expect(screen.queryByTitle('Sửa tour')).toBeNull();
});

test('ẩn nút Sửa khi tour đã APPROVED', () => {
  renderRow('APPROVED');
  expect(screen.queryByTitle('Sửa tour')).toBeNull();
});

test('ẩn nút Sửa khi tour đã HIDDEN', () => {
  renderRow('HIDDEN');
  expect(screen.queryByTitle('Sửa tour')).toBeNull();
});
