import { ClipboardList } from 'lucide-react';
import type { SosAlert } from '../types';
import { formatSenderRole } from '../utils/formatRelativeTime';

interface IncidentLogPanelProps {
  alert?: SosAlert;
}

/**
 * Nhật ký xử lý sự cố — chỉ 2 mốc dữ liệu thật sự có từ `SosAlertResponse`
 * (lúc tạo + lúc xử lý xong). BE không trả `resolvedAt` nên mốc xử lý không
 * có giờ cụ thể, và không có nguồn nào cho các sự kiện dạng cảm biến/dispatcher.
 */
export function IncidentLogPanel({ alert }: IncidentLogPanelProps) {
  return (
    <div className="rounded-[28px] p-6" style={{ backgroundColor: '#EFECE6' }}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-base font-bold" style={{ color: '#06261D' }}>
          <ClipboardList className="h-4 w-4" />
          Nhật Ký Xử Lý Sự Cố
        </h3>
      </div>

      {!alert ? (
        <p className="text-sm font-medium" style={{ color: '#6F7B75' }}>
          Chọn 1 tín hiệu SOS để xem nhật ký.
        </p>
      ) : (
        <ul className="space-y-4">
          {alert.status === 'RESOLVED' && (
            <li className="flex gap-3">
              <span className="w-14 shrink-0 text-xs font-bold" style={{ color: '#6F7B75' }}>
                —
              </span>
              <p className="text-sm font-semibold" style={{ color: '#166534' }}>
                Đã tiếp nhận và cứu hộ thành công
                {alert.resolvedByName ? ` bởi ${alert.resolvedByName}` : ''}.
              </p>
            </li>
          )}
          <li className="flex gap-3">
            <span className="w-14 shrink-0 text-xs font-bold" style={{ color: '#6F7B75' }}>
              {new Date(alert.createdAt).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#06261D' }}>
                {alert.senderName} ({formatSenderRole(alert.senderRole)}) đã gửi tín hiệu SOS.
              </p>
              {alert.message && (
                <p className="mt-0.5 text-xs font-medium italic" style={{ color: '#6F7B75' }}>
                  "{alert.message}"
                </p>
              )}
            </div>
          </li>
        </ul>
      )}
    </div>
  );
}
