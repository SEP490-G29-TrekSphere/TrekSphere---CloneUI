import { ImagePlus, MapPin, X } from 'lucide-react';

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
  /** URL ảnh hiện có (checkpoint cũ) hoặc đã upload xong. */
  imageUrl?: string;
  /** Ảnh mới chọn, chưa upload — ưu tiên hơn `imageUrl` khi hiển thị preview. */
  imageFile?: File | null;
}

export function createEmptyCheckpointDraft(): CheckpointDraft {
  return {
    key: crypto.randomUUID(),
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    altitude: '',
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

  const handleFieldChange = <K extends keyof CheckpointDraft>(
    key: string,
    field: K,
    value: CheckpointDraft[K]
  ) => {
    onChange(
      checkpoints.map((checkpoint) =>
        checkpoint.key === key ? { ...checkpoint, [field]: value } : checkpoint
      )
    );
  };

  const handleImageChange = (key: string, file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) return;
    handleFieldChange(key, 'imageFile', file);
  };

  return (
    <div className="space-y-3">
      {checkpoints.map((checkpoint) => {
        const imagePreview = checkpoint.imageFile
          ? URL.createObjectURL(checkpoint.imageFile)
          : checkpoint.imageUrl;

        return (
          <div
            key={checkpoint.key}
            className="relative flex gap-3 rounded-2xl p-4"
            style={{ backgroundColor: '#F0EEE6' }}
          >
            <button
              type="button"
              onClick={() => handleRemove(checkpoint.key)}
              className="absolute right-3 top-3 transition-colors hover:text-red-500"
              style={{ color: '#6F7B75' }}
              aria-label="Xóa checkpoint"
            >
              <X className="h-4 w-4" />
            </button>

            <label
              htmlFor={`checkpoint-image-${checkpoint.key}`}
              className="flex h-20 w-20 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-xl"
              style={{ backgroundColor: '#FFFFFF', border: '1px dashed #D8D3C4' }}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Ảnh checkpoint"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImagePlus className="h-5 w-5" style={{ color: '#6F7B75' }} />
              )}
              <input
                id={`checkpoint-image-${checkpoint.key}`}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageChange(checkpoint.key, e.target.files?.[0])}
              />
            </label>

            <div className="min-w-0 flex-1 space-y-2 pr-6">
              <input
                type="text"
                value={checkpoint.name}
                onChange={(e) => handleFieldChange(checkpoint.key, 'name', e.target.value)}
                placeholder="Tên checkpoint (VD: Trạm nghỉ 2000m)"
                className="w-full rounded-xl border-none bg-white px-4 py-2.5 text-sm font-semibold focus:outline-none"
                style={{ color: '#06261D' }}
              />
              <textarea
                value={checkpoint.description}
                onChange={(e) => handleFieldChange(checkpoint.key, 'description', e.target.value)}
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
                  onChange={(e) => handleFieldChange(checkpoint.key, 'latitude', e.target.value)}
                  placeholder="Vĩ độ (lat)"
                  className="w-full rounded-xl border-none bg-white px-3 py-2 text-xs font-medium focus:outline-none"
                  style={{ color: '#06261D' }}
                />
                <input
                  type="number"
                  inputMode="decimal"
                  value={checkpoint.longitude}
                  onChange={(e) => handleFieldChange(checkpoint.key, 'longitude', e.target.value)}
                  placeholder="Kinh độ (lng)"
                  className="w-full rounded-xl border-none bg-white px-3 py-2 text-xs font-medium focus:outline-none"
                  style={{ color: '#06261D' }}
                />
                <input
                  type="number"
                  inputMode="decimal"
                  value={checkpoint.altitude}
                  onChange={(e) => handleFieldChange(checkpoint.key, 'altitude', e.target.value)}
                  placeholder="Độ cao (m)"
                  className="w-full rounded-xl border-none bg-white px-3 py-2 text-xs font-medium focus:outline-none"
                  style={{ color: '#06261D' }}
                />
              </div>
            </div>
          </div>
        );
      })}

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
