import { ImagePlus, MapPin, X } from 'lucide-react';
import { useEffect, useMemo } from 'react';

export interface CheckpointDraft {
  key: string;
  /** Có giá trị nếu đây là checkpoint đã tồn tại trên server (đổ từ GET khi Sửa). */
  checkpointId?: string;
  name: string;
  description: string;
  /** Lat/lng/altitude để dạng string cho input — parse sang number lúc submit. */
  latitude: string;
  longitude: string;
  altitude: string;
  /** URL ảnh đã có trên server (checkpoint cũ) — xem `parseCheckpointImageUrls`. */
  imageUrls: string[];
  /** Ảnh mới chọn, chưa upload — upload lúc submit rồi nối vào sau `imageUrls`. */
  imageFiles: File[];
}

/**
 * BE lưu toàn bộ ảnh của 1 checkpoint vào đúng 1 cột TEXT `checkpoint_image_url`,
 * nhiều ảnh thì nối URL lại phân tách bởi dấu phẩy. Tách ngược lại để hiển thị.
 */
export function parseCheckpointImageUrls(raw: string | undefined | null): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);
}

export function createEmptyCheckpointDraft(): CheckpointDraft {
  return {
    key: crypto.randomUUID(),
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    altitude: '',
    imageUrls: [],
    imageFiles: [],
  };
}

interface CheckpointFieldsProps {
  checkpoints: CheckpointDraft[];
  onChange: (checkpoints: CheckpointDraft[]) => void;
}

const MAX_IMAGE_SIZE_MB = 5;

/** Danh sách checkpoint có thể thêm/xóa/sửa — gửi lên API khi submit form Tạo/Sửa. */
export function CheckpointFields({ checkpoints, onChange }: CheckpointFieldsProps) {
  const handleAdd = () => {
    onChange([...checkpoints, createEmptyCheckpointDraft()]);
  };

  const handleRemove = (key: string) => {
    onChange(checkpoints.filter((checkpoint) => checkpoint.key !== key));
  };

  const handleChange = (key: string, patch: Partial<CheckpointDraft>) => {
    onChange(
      checkpoints.map((checkpoint) =>
        checkpoint.key === key ? { ...checkpoint, ...patch } : checkpoint
      )
    );
  };

  return (
    <div className="space-y-3">
      {checkpoints.map((checkpoint) => (
        <CheckpointRow
          key={checkpoint.key}
          checkpoint={checkpoint}
          onChange={(patch) => handleChange(checkpoint.key, patch)}
          onRemove={() => handleRemove(checkpoint.key)}
        />
      ))}

      <button
        type="button"
        onClick={handleAdd}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-3 text-sm font-semibold transition-colors"
        style={{ borderColor: '#D8D3C4', color: '#6F7B75' }}
      >
        <MapPin className="h-4 w-4" />
        Thêm checkpoint
      </button>
    </div>
  );
}

interface CheckpointRowProps {
  checkpoint: CheckpointDraft;
  onChange: (patch: Partial<CheckpointDraft>) => void;
  onRemove: () => void;
}

function CheckpointRow({ checkpoint, onChange, onRemove }: CheckpointRowProps) {
  const { imageUrls, imageFiles } = checkpoint;

  // Tạo object URL 1 lần cho mỗi file (thay vì mỗi lần render) và thu hồi khi file đổi/unmount —
  // không revoke thì mỗi lần render lại rò rỉ thêm 1 blob trong bộ nhớ trình duyệt.
  const filePreviews = useMemo(
    () => imageFiles.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })),
    [imageFiles]
  );
  useEffect(
    () => () => {
      for (const { previewUrl } of filePreviews) URL.revokeObjectURL(previewUrl);
    },
    [filePreviews]
  );

  const handleAddImages = (fileList: FileList | null) => {
    if (!fileList) return;
    const accepted = [...fileList].filter(
      (file) => file.type.startsWith('image/') && file.size <= MAX_IMAGE_SIZE_MB * 1024 * 1024
    );
    if (accepted.length > 0) onChange({ imageFiles: [...imageFiles, ...accepted] });
  };

  return (
    <div className="relative flex gap-3 rounded-2xl p-4" style={{ backgroundColor: '#F0EEE6' }}>
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-3 top-3 transition-colors hover:text-red-500"
        style={{ color: '#6F7B75' }}
        aria-label="Xóa checkpoint"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex w-20 shrink-0 flex-col gap-2">
        {imageUrls.map((url, index) => (
          <ImageThumbnail
            key={url}
            src={url}
            alt={`Ảnh checkpoint ${index + 1}`}
            onRemove={() => onChange({ imageUrls: imageUrls.filter((item) => item !== url) })}
          />
        ))}
        {filePreviews.map(({ file, previewUrl }) => (
          <ImageThumbnail
            key={previewUrl}
            src={previewUrl}
            alt={`Ảnh checkpoint mới: ${file.name}`}
            onRemove={() => onChange({ imageFiles: imageFiles.filter((item) => item !== file) })}
          />
        ))}

        <label
          htmlFor={`checkpoint-image-${checkpoint.key}`}
          className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl"
          style={{ backgroundColor: '#FFFFFF', border: '1px dashed #D8D3C4' }}
        >
          <ImagePlus className="h-5 w-5" style={{ color: '#6F7B75' }} />
          <span className="text-[10px] font-semibold" style={{ color: '#6F7B75' }}>
            Thêm ảnh
          </span>
          <input
            id={`checkpoint-image-${checkpoint.key}`}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              handleAddImages(e.target.files);
              // Reset để chọn lại đúng file vừa xóa vẫn kích hoạt onChange.
              e.target.value = '';
            }}
          />
        </label>
      </div>

      <div className="min-w-0 flex-1 space-y-2 pr-6">
        <input
          type="text"
          value={checkpoint.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Tên checkpoint (VD: Trạm nghỉ 2000m)"
          className="w-full rounded-xl border-none bg-white px-4 py-2.5 text-sm font-semibold focus:outline-none"
          style={{ color: '#06261D' }}
        />
        <textarea
          value={checkpoint.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Mô tả ngắn về checkpoint này..."
          rows={2}
          className="w-full resize-none rounded-xl border-none bg-white px-4 py-2.5 text-sm focus:outline-none"
          style={{ color: '#06261D' }}
        />
        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={checkpoint.latitude}
            onChange={(e) => onChange({ latitude: e.target.value })}
            placeholder="Vĩ độ (lat)"
            className="w-full rounded-xl border-none bg-white px-3 py-2 text-xs font-medium focus:outline-none"
            style={{ color: '#06261D' }}
          />
          <input
            type="number"
            inputMode="decimal"
            value={checkpoint.longitude}
            onChange={(e) => onChange({ longitude: e.target.value })}
            placeholder="Kinh độ (lng)"
            className="w-full rounded-xl border-none bg-white px-3 py-2 text-xs font-medium focus:outline-none"
            style={{ color: '#06261D' }}
          />
          <input
            type="number"
            inputMode="decimal"
            value={checkpoint.altitude}
            onChange={(e) => onChange({ altitude: e.target.value })}
            placeholder="Độ cao (m)"
            className="w-full rounded-xl border-none bg-white px-3 py-2 text-xs font-medium focus:outline-none"
            style={{ color: '#06261D' }}
          />
        </div>
      </div>
    </div>
  );
}

interface ImageThumbnailProps {
  src: string;
  alt: string;
  onRemove: () => void;
}

function ImageThumbnail({ src, alt, onRemove }: ImageThumbnailProps) {
  return (
    <div className="relative h-20 w-20 overflow-hidden rounded-xl">
      <img src={src} alt={alt} className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 rounded-full bg-black/55 p-0.5 text-white transition-colors hover:bg-red-500"
        aria-label={`Xóa ${alt}`}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
