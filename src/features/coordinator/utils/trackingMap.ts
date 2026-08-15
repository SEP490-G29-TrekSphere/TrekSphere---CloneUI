import type { SessionCheckpointStatus } from '../types';

export interface CheckpointMarkerAppearance {
  color: string;
  fillColor: string;
  label: string;
}

export function hasValidMapCoordinate(latitude?: number, longitude?: number): boolean {
  return (
    latitude !== undefined &&
    longitude !== undefined &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export function checkpointMarkerAppearance(
  checkpoint: SessionCheckpointStatus,
  isPendingSync: boolean
): CheckpointMarkerAppearance {
  if (isPendingSync) {
    return { color: '#B45309', fillColor: '#F59E0B', label: 'Đang chờ đồng bộ' };
  }
  if (checkpoint.status === 'REACHED') {
    return { color: '#15803D', fillColor: '#22C55E', label: 'Đã check-in' };
  }
  if (checkpoint.status === 'SKIPPED') {
    return { color: '#92400E', fillColor: '#D97706', label: 'Đã bỏ qua' };
  }
  return { color: '#B91C1C', fillColor: '#EF4444', label: 'Chưa đến' };
}
