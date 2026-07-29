import { CheckCircle2, QrCode, UploadCloud } from 'lucide-react';
import { useRef } from 'react';
import { toast } from '@/store/useToastStore';

interface PaymentQrCardProps {
  preview: string | null;
  onFileSelected: (file: File) => void;
  onClearPreview: () => void;
}

const MAX_SIZE_MB = 5;
const CHECKLIST = [
  'Sử dụng mã QR định dạng chuẩn VietQR.',
  'Hình ảnh rõ nét, không bị lóa sáng hoặc mất góc.',
  'Định dạng hỗ trợ: JPG, PNG (Tối đa 5MB).',
];

/**
 * Khối "Mã QR Thanh toán". Nút "Xóa mã hiện tại" chỉ xoá preview cục bộ —
 * API không hỗ trợ xoá QR đã lưu riêng biệt, chỉ replace khi upload ảnh mới
 * và bấm Lưu (xem spec).
 */
export function PaymentQrCard({ preview, onFileSelected, onClearPreview }: PaymentQrCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('Chỉ hỗ trợ định dạng JPG hoặc PNG.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Kích thước ảnh tối đa ${MAX_SIZE_MB}MB.`);
      return;
    }
    onFileSelected(file);
  };

  return (
    <div className="rounded-[32px] p-6 sm:p-8" style={{ backgroundColor: '#F6F4EB' }}>
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-full"
          style={{ backgroundColor: '#E6E2D1', color: '#06261D' }}
        >
          <QrCode className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold" style={{ color: '#06261D' }}>
            Mã QR Thanh toán
          </h3>
          <p className="text-xs" style={{ color: '#6F7B75' }}>
            Tải lên mã VietQR để khách hàng quét nhanh
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6 sm:flex-row">
        {/* Preview box */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative flex h-48 w-48 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed"
          style={{ borderColor: '#C5C0B0', backgroundColor: '#FFFFFF' }}
        >
          {preview ? (
            <img src={preview} alt="Xem trước mã QR" className="h-full w-full object-contain p-2" />
          ) : (
            <span className="px-4 text-center text-xs" style={{ color: '#6F7B75' }}>
              Chưa có mã QR
            </span>
          )}
          <span
            className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold"
            style={{ backgroundColor: 'rgba(6, 38, 29, 0.85)', color: '#FFFFFF' }}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            Tải lên ảnh mới
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={handleFileChange}
          />
        </button>

        {/* Hướng dẫn & thao tác */}
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6F7B75' }}>
            Hướng dẫn
          </p>
          <ul className="mt-3 space-y-2">
            {CHECKLIST.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm"
                style={{ color: '#06261D' }}
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: '#16A34A' }} />
                {item}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={onClearPreview}
            disabled={!preview}
            title="Chỉ xoá ảnh xem trước — chọn ảnh mới rồi bấm Lưu để cập nhật"
            className="mt-5 rounded-full px-4 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #C5C0B0', color: '#6F7B75' }}
          >
            Xóa mã hiện tại
          </button>
        </div>
      </div>
    </div>
  );
}
