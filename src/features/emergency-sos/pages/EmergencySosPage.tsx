import { ChevronLeft, ChevronRight, Search, Siren, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/store/useToastStore';
import { IncidentLogPanel } from '../components/IncidentLogPanel';
import { SosAlertCard } from '../components/SosAlertCard';
import { SosMapPanel } from '../components/SosMapPanel';
import { useActiveSosAlerts } from '../hooks/useActiveSosAlerts';
import { useResolveSosAlert } from '../hooks/useResolveSosAlert';
import type { SosAlert } from '../types';
import { formatSosCode } from '../utils/formatRelativeTime';

type Tab = 'active' | 'resolved';

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

/**
 * Trang Quản lý Cảnh báo Khẩn cấp & Cứu hộ — dùng chung cho Vendor Manager và
 * Admin (2 role duy nhất được BE cấp quyền gọi `GET /tracking/sos/active`).
 * Tab "Đã xử lý" chỉ chứa các SOS được resolve trong phiên làm việc hiện tại
 * (BE không có API liệt kê lịch sử SOS đã xử lý).
 */
export default function EmergencySosPage() {
  const pageSize = 10;
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [tab, setTab] = useState<Tab>('active');
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [resolvedThisSession, setResolvedThisSession] = useState<SosAlert[]>([]);

  const { data, isLoading, isError, error, refetch } = useActiveSosAlerts(page, pageSize);
  const resolveMutation = useResolveSosAlert();

  const activeAlerts = (data?.content ?? []).filter((alert) => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return true;
    return alert.tourName.toLowerCase().includes(kw) || alert.senderName.toLowerCase().includes(kw);
  });

  const listForTab = tab === 'active' ? activeAlerts : resolvedThisSession;
  const selectedAlert = listForTab.find((a) => a.sosAlertId === selectedId) ?? listForTab[0];

  const handleResolve = (alert: SosAlert) => {
    resolveMutation.mutate(alert.sosAlertId, {
      onSuccess: (resolved) => {
        setResolvedThisSession((prev) => [resolved, ...prev]);
        toast.success(`Đã đánh dấu ${formatSosCode(resolved.sosAlertId)} đã cứu hộ.`);
      },
      onError: (err) => toast.error(errorMessage(err, 'Không thể cập nhật tín hiệu SOS.')),
    });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6" style={{ backgroundColor: '#FAF8F1' }}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#06261D' }}>
            Quản Lý Khẩn Cấp & Cứu Hộ
          </h1>
        </div>

        <div className="inline-flex rounded-full p-1" style={{ backgroundColor: '#EFECE6' }}>
          <button
            type="button"
            onClick={() => setTab('active')}
            className="rounded-full px-4 py-2 text-xs font-bold transition-all"
            style={
              tab === 'active'
                ? { backgroundColor: '#FFFFFF', color: '#06261D' }
                : { color: '#6F7B75' }
            }
          >
            Đang chờ ({activeAlerts.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('resolved')}
            className="rounded-full px-4 py-2 text-xs font-bold transition-all"
            style={
              tab === 'resolved'
                ? { backgroundColor: '#FFFFFF', color: '#06261D' }
                : { color: '#6F7B75' }
            }
          >
            Đã xử lý ({resolvedThisSession.length})
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4" style={{ color: '#6F7B75' }} />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm theo tên tour hoặc người gửi..."
          className="w-full rounded-full border pl-9 pr-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
          style={{ borderColor: '#E0DCD1', backgroundColor: '#FFFFFF' }}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
            </div>
          ) : isError ? (
            <div
              className="space-y-3 rounded-3xl bg-white p-6 text-center"
              style={{ border: '1px solid #E6E2D1' }}
            >
              <XCircle className="mx-auto h-8 w-8 text-red-600" />
              <p className="text-sm font-semibold text-red-600">
                {errorMessage(error, 'Không thể tải danh sách SOS.')}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="rounded-full px-4 py-2 text-xs font-bold"
                style={{ backgroundColor: '#F0EEE6', color: '#06261D' }}
              >
                Thử lại
              </button>
            </div>
          ) : listForTab.length === 0 ? (
            <div
              className="flex flex-col items-center gap-2 rounded-[28px] p-10 text-center"
              style={{ backgroundColor: '#EFECE6' }}
            >
              <Siren className="h-8 w-8" style={{ color: '#6F7B75' }} />
              <p className="text-sm font-semibold" style={{ color: '#06261D' }}>
                {tab === 'active'
                  ? 'Không có tín hiệu SOS nào đang chờ xử lý.'
                  : 'Chưa có SOS nào được xử lý trong phiên làm việc này.'}
              </p>
            </div>
          ) : (
            listForTab.map((alert) => (
              <SosAlertCard
                key={alert.sosAlertId}
                alert={alert}
                isSelected={selectedAlert?.sosAlertId === alert.sosAlertId}
                onSelect={() => setSelectedId(alert.sosAlertId)}
                onResolve={() => handleResolve(alert)}
                isResolving={
                  resolveMutation.isPending && resolveMutation.variables === alert.sosAlertId
                }
              />
            ))
          )}

          {tab === 'active' && data && data.totalPages > 1 && (
            <div className="flex items-center justify-between px-1 pt-2">
              <span className="text-xs font-semibold" style={{ color: '#6F7B75' }}>
                Trang {data.pageNumber + 1} / {data.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={data.pageNumber <= 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold disabled:opacity-40"
                  style={{ borderColor: '#E0DCD1', color: '#06261D' }}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trước
                </button>
                <button
                  type="button"
                  disabled={data.last}
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold disabled:opacity-40"
                  style={{ borderColor: '#E0DCD1', color: '#06261D' }}
                >
                  Sau
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <SosMapPanel alert={selectedAlert} />
          <IncidentLogPanel alert={selectedAlert} />
        </div>
      </div>
    </div>
  );
}
