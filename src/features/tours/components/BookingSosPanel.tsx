import { Loader2, Siren } from 'lucide-react';
import { useState } from 'react';
import { AppButton, AppCard } from '@/shared/ui';

interface BookingSosPanelProps {
  onSendSos: (message?: string) => void;
  isSending: boolean;
  lastSentAt?: string;
}

/** Khối "SOS Khẩn Cấp" ở trang Chi tiết Đặt Tour — chỉ hiện khi booking đã CONFIRMED và có tourSessionId. */
export function BookingSosPanel({ onSendSos, isSending, lastSentAt }: BookingSosPanelProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    onSendSos(message.trim() || undefined);
  };

  return (
    <AppCard className="border-red-200 rounded-3xl bg-red-50/50 p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2 text-red-800 font-extrabold text-base border-b border-red-100 pb-3">
        <Siren className="h-5 w-5 text-red-600" />
        <h3>SOS Khẩn Cấp</h3>
      </div>
      <p className="text-xs font-semibold text-zinc-600 leading-relaxed">
        Gửi tín hiệu cấp cứu kèm toạ độ GPS hiện tại của bạn ngay lập tức cho đội hỗ trợ khi gặp sự
        cố trong chuyến đi.
      </p>

      <textarea
        rows={2}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Mô tả tình huống (tuỳ chọn)..."
        className="w-full p-3 rounded-2xl border border-red-200 bg-white text-xs font-semibold text-zinc-800 focus:outline-none focus:border-red-400 transition-colors"
      />

      <AppButton
        onClick={handleSend}
        disabled={isSending}
        variant="destructive"
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-colors border-none text-xs cursor-pointer"
      >
        {isSending && <Loader2 className="h-4 w-4 animate-spin" />}
        Kích hoạt SOS
      </AppButton>

      {lastSentAt && (
        <p className="text-[11px] font-semibold text-red-700 text-center">
          Đã gửi tín hiệu lúc {new Date(lastSentAt).toLocaleTimeString('vi-VN')}
        </p>
      )}
    </AppCard>
  );
}
