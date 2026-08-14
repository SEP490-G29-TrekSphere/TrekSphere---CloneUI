import { Loader2, ShieldCheck, Siren } from 'lucide-react';
import { useState } from 'react';
import type { SessionSosStatus } from '../types';

interface EmergencySosPanelProps {
  /** Trạng thái SOS của phiên — `GET /tracking/sessions/{id}/sos/status`. */
  status?: SessionSosStatus;
  isLoadingStatus?: boolean;
  onSendSos: (message?: string) => void;
  isSending: boolean;
  onResolve: (sosAlertId: string) => void;
  isResolving: boolean;
  /** SOS mới chỉ nằm trong IndexedDB, chưa được backend ACK. */
  isLocallyQueued?: boolean;
}

function formatTime(value?: string): string {
  if (!value) return '';
  return ` lúc ${new Date(value).toLocaleTimeString('vi-VN')}`;
}

/**
 * Panel SOS của Coordinator. Trạng thái lấy từ BE thay vì state cục bộ, nên
 * Coordinator thấy được cả tín hiệu do người khác (Trekker) gửi, và biết đội cứu
 * hộ đã đóng ca chưa dù có reload trang hay đổi thiết bị.
 */
export function EmergencySosPanel({
  status,
  isLoadingStatus = false,
  onSendSos,
  isSending,
  onResolve,
  isResolving,
  isLocallyQueued = false,
}: EmergencySosPanelProps) {
  const [message, setMessage] = useState('');

  const alert = status?.sosAlert;
  const hasActiveAlert = Boolean(status?.hasActiveSosAlert);
  // Đã xử lý xong tín hiệu gần nhất và hiện không còn tín hiệu nào chờ.
  const isResolvedOnly =
    Boolean(status?.hasSosAlert) && !hasActiveAlert && Boolean(status?.resolved);

  const handleSend = () => {
    onSendSos(message.trim() || undefined);
    setMessage('');
  };

  return (
    <div
      className="rounded-3xl p-6 text-center"
      style={{ backgroundColor: '#FDECEC', border: '1px solid #F3B4B4' }}
    >
      <Siren className="mx-auto h-9 w-9" style={{ color: '#D32F2F' }} />
      <h2
        className="mt-2 text-base font-extrabold uppercase tracking-wide"
        style={{ color: '#D32F2F' }}
      >
        Khẩn cấp (SOS)
      </h2>

      {isLoadingStatus ? (
        <p
          className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium"
          style={{ color: '#8A4747' }}
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang kiểm tra trạng thái cứu hộ...
        </p>
      ) : hasActiveAlert ? (
        <>
          {isLocallyQueued ? (
            <div className="mt-3 rounded-2xl bg-amber-100 px-3 py-2 text-left text-xs font-bold text-amber-900">
              SOS đã lưu an toàn trên thiết bị nhưng chưa được máy chủ xác nhận. Hãy di chuyển tới
              nơi có sóng và gọi số cứu hộ dự phòng nếu tình huống nguy cấp.
            </div>
          ) : (
            <p className="mt-1 text-xs font-medium" style={{ color: '#8A4747' }}>
              Đã gửi tín hiệu SOS{formatTime(alert?.createdAt)}. Đội cứu hộ đã nhận được toạ độ GPS,
              tình huống đang chờ xử lý.
            </p>
          )}
          {alert?.message && (
            <p className="mt-1 text-xs font-semibold italic" style={{ color: '#8A4747' }}>
              “{alert.message}”
            </p>
          )}
          {!isLocallyQueued && (
            <button
              type="button"
              onClick={() => alert && onResolve(alert.sosAlertId)}
              disabled={isResolving || !alert}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white transition-all disabled:opacity-60"
              style={{ backgroundColor: '#06261D' }}
            >
              {isResolving && <Loader2 className="h-4 w-4 animate-spin" />}
              Hoàn thành cứu hộ
            </button>
          )}
        </>
      ) : (
        <>
          {isResolvedOnly && (
            <div
              className="mt-3 rounded-2xl px-3 py-2 text-left"
              style={{ backgroundColor: '#E7F5EC', border: '1px solid #B7E0C5' }}
            >
              <p
                className="flex items-center gap-1.5 text-xs font-bold"
                style={{ color: '#166534' }}
              >
                <ShieldCheck className="h-4 w-4 shrink-0" />
                Tín hiệu SOS gần nhất đã được xử lý
              </p>
              <p className="mt-0.5 text-xs font-medium" style={{ color: '#3F6B4E' }}>
                {alert?.resolvedByName
                  ? `Xác nhận bởi ${alert.resolvedByName}.`
                  : 'Đội cứu hộ đã xác nhận hoàn tất.'}
              </p>
            </div>
          )}

          <p className="mt-3 text-xs font-medium" style={{ color: '#8A4747' }}>
            Gửi tín hiệu cấp cứu và tọa độ GPS ngay lập tức cho đội cứu hộ.
          </p>

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Mô tả tình huống (tuỳ chọn)..."
            className="mt-3 w-full rounded-full border px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-400"
            style={{ borderColor: '#F3B4B4', backgroundColor: '#FFFFFF' }}
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={isSending}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white transition-all disabled:opacity-60"
            style={{ backgroundColor: '#D32F2F' }}
          >
            {isSending && <Loader2 className="h-4 w-4 animate-spin" />}
            Kích hoạt SOS
          </button>
        </>
      )}
    </div>
  );
}
