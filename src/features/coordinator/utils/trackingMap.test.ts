import type { SessionCheckpointStatus } from '../types';
import { checkpointMarkerAppearance, hasValidMapCoordinate } from './trackingMap';

function checkpoint(status: SessionCheckpointStatus['status']): SessionCheckpointStatus {
  return {
    checkpointId: 'checkpoint-1',
    checkpointName: 'Trạm 1',
    checkpointOrder: 1,
    status,
  };
}

describe('checkpointMarkerAppearance', () => {
  test('checkpoint chưa đến có màu đỏ', () => {
    expect(checkpointMarkerAppearance(checkpoint('PENDING'), false).fillColor).toBe('#EF4444');
  });

  test('checkpoint chỉ chuyển xanh sau khi server xác nhận', () => {
    expect(checkpointMarkerAppearance(checkpoint('REACHED'), true).fillColor).toBe('#F59E0B');
    expect(checkpointMarkerAppearance(checkpoint('REACHED'), false).fillColor).toBe('#22C55E');
  });

  test('checkpoint bỏ qua có màu cam', () => {
    expect(checkpointMarkerAppearance(checkpoint('SKIPPED'), false).fillColor).toBe('#D97706');
  });
});

describe('hasValidMapCoordinate', () => {
  test('chấp nhận tọa độ hợp lệ và từ chối giá trị ngoài phạm vi', () => {
    expect(hasValidMapCoordinate(10.7769, 106.7009)).toBe(true);
    expect(hasValidMapCoordinate(91, 106.7009)).toBe(false);
    expect(hasValidMapCoordinate(10.7769, 181)).toBe(false);
    expect(hasValidMapCoordinate(undefined, 106.7009)).toBe(false);
  });
});
