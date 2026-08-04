import { Loader2, ShieldCheck, Siren } from 'lucide-react';
import { useState } from 'react';

interface EmergencySosPanelProps {
  onSendSos: (message?: string) => void;
  isSending: boolean;
  lastSentAt?: string;
  /** ID của SOS vừa gửi — có giá trị nghĩa là đã gửi xong, hiện nút "Hoàn thành cứu hộ" thay vì form gửi. */
  sosAlertId?: string;
  isResolved: boolean;
  onResolve: () => void;
  isResolving: boolean;
}

export function EmergencySosPanel({
  onSendSos,
  isSending,
  lastSentAt,
  sosAlertId,
  isResolved,
  onResolve,
  isResolving,
}: EmergencySosPanelProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    onSendSos(message.trim() || undefined);
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

      {isResolved ? (
        <p
          className="mt-3 flex items-center justify-center gap-1.5 text-sm font-bold"
          style={{ color: '#166534' }}
        >
          <ShieldCheck className="h-4 w-4" />
          Đã xác nhận cứu hộ hoàn tất.
        </p>
      ) : sosAlertId ? (
        <>
          <p className="mt-1 text-xs font-medium" style={{ color: '#8A4747' }}>
            Đã gửi tín hiệu SOS
            {lastSentAt ? ` lúc ${new Date(lastSentAt).toLocaleTimeString('vi-VN')}` : ''}. Đội cứu
            hộ đã nhận được toạ độ GPS của bạn.
          </p>
          <button
            type="button"
            onClick={onResolve}
            disabled={isResolving}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white transition-all disabled:opacity-60"
            style={{ backgroundColor: '#06261D' }}
          >
            {isResolving && <Loader2 className="h-4 w-4 animate-spin" />}
            Hoàn thành cứu hộ
          </button>
        </>
      ) : (
        <>
          <p className="mt-1 text-xs font-medium" style={{ color: '#8A4747' }}>
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
