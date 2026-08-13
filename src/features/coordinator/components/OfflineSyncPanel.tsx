import {
  AlertTriangle,
  CheckCircle2,
  CloudDownload,
  CloudOff,
  CloudUpload,
  Database,
  Loader2,
  MapPin,
  RefreshCw,
  Wifi,
} from 'lucide-react';
import type { TrackingFailedItem } from '../types';

interface OfflineSyncPanelProps {
  isOnline: boolean;
  isPrepared: boolean;
  isPreparing: boolean;
  isSyncing: boolean;
  isGpsTracking: boolean;
  pendingEventCount: number;
  pendingLocationCount: number;
  failedItems: TrackingFailedItem[];
  lastSyncedAt?: string;
  expiresAt?: string;
  error?: string;
  onPrepare: () => void;
  onSync: () => void;
  onClearFailures: () => void;
}

function formatDateTime(value?: string): string {
  if (!value) return 'Chưa đồng bộ';
  return new Date(value).toLocaleString('vi-VN');
}

export function OfflineSyncPanel({
  isOnline,
  isPrepared,
  isPreparing,
  isSyncing,
  isGpsTracking,
  pendingEventCount,
  pendingLocationCount,
  failedItems,
  lastSyncedAt,
  expiresAt,
  error,
  onPrepare,
  onSync,
  onClearFailures,
}: OfflineSyncPanelProps) {
  const pendingTotal = pendingEventCount + pendingLocationCount;

  return (
    <section
      className="overflow-hidden rounded-3xl border"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#D8D3C4' }}
    >
      <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: isOnline ? '#E7F5EC' : '#FEF3C7' }}
          >
            {isOnline ? (
              <Wifi className="h-5 w-5 text-emerald-700" />
            ) : (
              <CloudOff className="h-5 w-5 text-amber-700" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-extrabold" style={{ color: '#06261D' }}>
                Tracking Offline
              </h2>
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                style={{
                  backgroundColor: isOnline ? '#DCFCE7' : '#FEF3C7',
                  color: isOnline ? '#166534' : '#92400E',
                }}
              >
                {isOnline ? 'Đang có mạng' : 'Đang mất mạng'}
              </span>
              {isGpsTracking && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700">
                  <MapPin className="h-3.5 w-3.5 animate-pulse" /> GPS đang ghi
                </span>
              )}
            </div>
            <p className="mt-1 text-xs font-medium" style={{ color: '#6F7B75' }}>
              {isPrepared
                ? `Đã lưu dữ liệu chuyến đi trên thiết bị • Hết hạn ${formatDateTime(expiresAt)}`
                : 'Tải offline pack trước khi xuất phát để thao tác được khi mất mạng.'}
            </p>
            {isPrepared && (
              <p className="mt-1 text-xs" style={{ color: '#6F7B75' }}>
                Đồng bộ gần nhất: {formatDateTime(lastSyncedAt)}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onPrepare}
            disabled={!isOnline || isPreparing || isSyncing || pendingTotal > 0}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40"
            style={{ borderColor: '#D8D3C4', color: '#06261D' }}
          >
            {isPreparing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CloudDownload className="h-4 w-4" />
            )}
            {isPrepared ? 'Tải lại dữ liệu' : 'Chuẩn bị offline'}
          </button>
          <button
            type="button"
            onClick={onSync}
            disabled={!isOnline || !isPrepared || isSyncing}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            style={{ backgroundColor: '#06261D' }}
          >
            {isSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : pendingTotal > 0 ? (
              <CloudUpload className="h-4 w-4" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isSyncing ? 'Đang đồng bộ' : `Đồng bộ ngay (${pendingTotal})`}
          </button>
        </div>
      </div>

      {isPrepared && (
        <div
          className="grid grid-cols-2 border-t sm:grid-cols-4"
          style={{ borderColor: '#E6E2D1', backgroundColor: '#F8F7F2' }}
        >
          <div className="flex items-center gap-2 px-4 py-3 text-xs font-semibold text-slate-700">
            <Database className="h-4 w-4 text-emerald-700" /> {pendingEventCount} thao tác chờ
          </div>
          <div className="flex items-center gap-2 px-4 py-3 text-xs font-semibold text-slate-700">
            <MapPin className="h-4 w-4 text-blue-700" /> {pendingLocationCount} GPS chờ
          </div>
          <div className="flex items-center gap-2 px-4 py-3 text-xs font-semibold text-slate-700">
            {pendingTotal === 0 ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            ) : (
              <CloudUpload className="h-4 w-4 text-amber-700" />
            )}
            {pendingTotal === 0 ? 'Đã đồng bộ hết' : 'Đã lưu an toàn'}
          </div>
          <div className="flex items-center gap-2 px-4 py-3 text-xs font-semibold text-slate-700">
            <AlertTriangle
              className={`h-4 w-4 ${failedItems.length > 0 ? 'text-red-600' : 'text-slate-400'}`}
            />
            {failedItems.length} lỗi cần xem
          </div>
        </div>
      )}

      {(error || failedItems.length > 0) && (
        <div className="border-t bg-red-50 px-5 py-3" style={{ borderColor: '#F3B4B4' }}>
          {error && <p className="text-xs font-semibold text-red-700">{error}</p>}
          {failedItems.slice(-3).map((item) => (
            <p key={`${item.kind}-${item.id}`} className="mt-1 text-xs text-red-700">
              [{item.code}] {item.message}
            </p>
          ))}
          {failedItems.length > 0 && (
            <button
              type="button"
              onClick={onClearFailures}
              className="mt-2 text-xs font-bold text-red-800 underline"
            >
              Đã xem, xoá danh sách lỗi
            </button>
          )}
        </div>
      )}
    </section>
  );
}
