import { fireEvent, render, screen } from '@testing-library/react';
import type { VendorTourListItem } from '../types';
import { TourApprovalTableRow } from './TourApprovalTableRow';

const tour: VendorTourListItem = {
  id: 't1',
  name: 'Đỉnh Phượng Hoàng',
  basePrice: 15000000,
  difficulty: 'MODERATE',
  status: 'PENDING_APPROVAL',
  createdAt: '2026-07-20T10:00:00Z',
};

interface RenderRowProps {
  onApproveClick?: (tour: VendorTourListItem) => void;
  onRejectClick?: (tour: VendorTourListItem) => void;
  onHideClick?: (tour: VendorTourListItem) => void;
}

function renderRow(props: RenderRowProps = {}) {
  return render(
    <table>
      <tbody>
        <TourApprovalTableRow tour={tour} {...props} />
      </tbody>
    </table>
  );
}

test('tab Chờ duyệt: hiện nút Duyệt + Từ chối, không hiện nút Ẩn', () => {
  renderRow({ onApproveClick: jest.fn(), onRejectClick: jest.fn() });
  expect(screen.getByTitle('Duyệt tour')).toBeTruthy();
  expect(screen.getByTitle('Từ chối tour')).toBeTruthy();
  expect(screen.queryByTitle('Ẩn tour')).toBeNull();
});

test('tab Đã duyệt: chỉ hiện nút Ẩn', () => {
  renderRow({ onHideClick: jest.fn() });
  expect(screen.queryByTitle('Duyệt tour')).toBeNull();
  expect(screen.queryByTitle('Từ chối tour')).toBeNull();
  expect(screen.getByTitle('Ẩn tour')).toBeTruthy();
});

test('bấm nút Duyệt gọi onApproveClick kèm đúng tour', () => {
  const onApproveClick = jest.fn();
  renderRow({ onApproveClick });
  fireEvent.click(screen.getByTitle('Duyệt tour'));
  expect(onApproveClick).toHaveBeenCalledWith(tour);
});
