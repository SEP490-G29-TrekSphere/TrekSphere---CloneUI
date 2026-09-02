import {
  Clock,
  Compass,
  Eye,
  ImagePlus,
  Layers,
  MapPin,
  MapPinned,
  Plus,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/shared/hooks';
import {
  useAddCheckpoint,
  useDeleteCheckpoint,
  useGroupCheckpoints,
} from '../../hooks/useGroupCheckpoints';
import {
  useAddItineraryActivity,
  useAddItineraryDay,
  useDeleteItineraryActivity,
  useGroupItineraryWorkspace,
} from '../../hooks/useGroupItineraryWorkspace';
import type { CheckpointStatus, TimeSlot } from '../../services/groupWorkspaceService';

interface GroupItineraryWorkspaceTabProps {
  groupId: string;
  isLeader: boolean;
}

// Theo quy tắc single-accent của DESIGN.md, 4 buổi trong ngày không được mã hoá bằng 4 màu
// khác nhau (đó là kiểu "multi-accent" bị cấm) — thay vào đó dùng một badge trung tính duy
// nhất, để LABEL ("SÁNG"/"TRƯA"/"CHIỀU"/"TỐI") tự phân biệt các buổi thay vì màu sắc.
const TIME_SLOT_BADGE_CLASS = 'bg-muted text-foreground border-border';

const TIME_SLOTS: { id: TimeSlot; label: string; time: string }[] = [
  {
    id: 'morning',
    label: 'SÁNG',
    time: '06:00 - 11:30',
  },
  {
    id: 'noon',
    label: 'TRƯA',
    time: '11:30 - 13:30',
  },
  {
    id: 'afternoon',
    label: 'CHIỀU',
    time: '13:30 - 18:00',
  },
  {
    id: 'evening',
    label: 'TỐI',
    time: '18:00 - 22:00',
  },
];

const CHECKPOINT_STATUS_LABELS: Record<CheckpointStatus, string> = {
  COMPLETED: 'Đã check-in',
  IN_PROGRESS: 'Sẵn sàng check-in',
  UPCOMING: 'Chưa tới',
  SKIPPED: 'Đã bỏ qua',
};

/**
 * Tab "Lộ trình" của Workspace: nơi LÊN KẾ HOẠCH trước chuyến đi — gồm danh sách checkpoint
 * dự kiến (tái hiện "Waypoints Strip" của `ItineraryWorkspace.tsx` mockup, nối qua
 * `useGroupCheckpoints`) và Matrix Timeline Grid (lịch trình theo ngày/buổi, nối qua
 * `useGroupItineraryWorkspace`). Checkpoint đặt ở đây (không phải ở tab Tổng quan) vì đó là
 * việc CHUẨN BỊ trước khi đi; tab Tổng quan chỉ dùng để check-in/bỏ qua checkpoint đã lên kế
 * hoạch này khi đang thực sự di chuyển (giai đoạn 4).
 *
 * Quy ước phân quyền: thêm/xoá checkpoint và "Thêm Ngày" đều thay đổi cấu trúc lộ trình chung
 * nên chỉ leader được thực hiện (giống các workspace ngân sách/đồ dùng khác). "Thêm Hoạt Động"
 * thì mở cho mọi thành viên vì mockup gốc không giới hạn quyền ở mục này — coi như thành viên
 * có thể tự đề xuất hoạt động cho một ngày đã có sẵn.
 */
export function GroupItineraryWorkspaceTab({ groupId, isLeader }: GroupItineraryWorkspaceTabProps) {
  const { data, isLoading } = useGroupItineraryWorkspace(groupId);
  const addDay = useAddItineraryDay(groupId);
  const addActivity = useAddItineraryActivity(groupId);
  const deleteActivity = useDeleteItineraryActivity(groupId);

  const { data: checkpoints = [] } = useGroupCheckpoints(groupId);
  const addCheckpoint = useAddCheckpoint(groupId);
  const deleteCheckpoint = useDeleteCheckpoint(groupId);
  const [isCheckpointModalOpen, setIsCheckpointModalOpen] = useState(false);
  const [cpName, setCpName] = useState('');
  const [cpCategory, setCpCategory] = useState('');
  const [cpDistance, setCpDistance] = useState('');
  const [cpGps, setCpGps] = useState('');
  const [cpDescription, setCpDescription] = useState('');
  const [cpImageFile, setCpImageFile] = useState<File | null>(null);
  const [cpImagePreviewUrl, setCpImagePreviewUrl] = useState<string | null>(null);
  const cpImageInputRef = useRef<HTMLInputElement>(null);

  // Xem chi tiết một checkpoint đã có (đọc-only, không phải form sửa).
  const [viewingCheckpoint, setViewingCheckpoint] = useState<(typeof checkpoints)[number] | null>(
    null
  );

  // Ảnh mới chọn dùng object URL cục bộ để xem trước; phải revoke khi đổi/huỷ để tránh rò rỉ bộ nhớ.
  useEffect(() => {
    if (!cpImageFile) return;
    const objectUrl = URL.createObjectURL(cpImageFile);
    setCpImagePreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [cpImageFile]);

  const resetCheckpointForm = () => {
    setCpName('');
    setCpCategory('');
    setCpDistance('');
    setCpGps('');
    setCpDescription('');
    setCpImageFile(null);
    setCpImagePreviewUrl(null);
    if (cpImageInputRef.current) cpImageInputRef.current.value = '';
  };

  const handleCpImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCpImageFile(file);
  };

  const handleRemoveCpImage = () => {
    setCpImageFile(null);
    setCpImagePreviewUrl(null);
    if (cpImageInputRef.current) cpImageInputRef.current.value = '';
  };

  const handleAddCheckpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpName.trim()) return;
    addCheckpoint.mutate(
      {
        name: cpName.trim(),
        category: cpCategory.trim() || 'Trạm dừng chân',
        distanceAltitude: cpDistance.trim() || '—',
        gps: cpGps.trim() || '—',
        description: cpDescription.trim() || undefined,
        image: cpImageFile,
      },
      {
        onSuccess: () => {
          setIsCheckpointModalOpen(false);
          resetCheckpointForm();
        },
      }
    );
  };

  const days = data?.days ?? [];
  const activities = data?.activities ?? [];

  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  // Form states - Activity
  const [actDayId, setActDayId] = useState('');
  const [actSlot, setActSlot] = useState<TimeSlot>('morning');
  const [actTime, setActTime] = useState('');
  const [actTitle, setActTitle] = useState('');
  const [actLocation, setActLocation] = useState('');
  const [actAssignee, setActAssignee] = useState('');
  const [actDescription, setActDescription] = useState('');
  const [actImageFile, setActImageFile] = useState<File | null>(null);
  const [actImagePreviewUrl, setActImagePreviewUrl] = useState<string | null>(null);
  const actImageInputRef = useRef<HTMLInputElement>(null);

  // Xem chi tiết một hoạt động đã có trong lịch trình (đọc-only, không phải form sửa).
  const [viewingActivity, setViewingActivity] = useState<(typeof activities)[number] | null>(null);

  // Ảnh mới chọn dùng object URL cục bộ để xem trước; phải revoke khi đổi/huỷ để tránh rò rỉ bộ nhớ.
  useEffect(() => {
    if (!actImageFile) return;
    const objectUrl = URL.createObjectURL(actImageFile);
    setActImagePreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [actImageFile]);

  const resetActivityForm = () => {
    setActTitle('');
    setActLocation('');
    setActAssignee('');
    setActTime('');
    setActDescription('');
    setActImageFile(null);
    setActImagePreviewUrl(null);
    if (actImageInputRef.current) actImageInputRef.current.value = '';
  };

  const handleActImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setActImageFile(file);
  };

  const handleRemoveActImage = () => {
    setActImageFile(null);
    setActImagePreviewUrl(null);
    if (actImageInputRef.current) actImageInputRef.current.value = '';
  };

  const openActivityModal = () => {
    setActDayId(days[0]?.id ?? '');
    setActSlot('morning');
    setIsActivityModalOpen(true);
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle || !actDayId) return;

    addActivity.mutate(
      {
        dayId: actDayId,
        timeSlot: actSlot,
        timeRange: actTime || '08:00 - 09:00',
        title: actTitle,
        location: actLocation || 'Địa điểm tập trung',
        assignee: actAssignee || 'Toàn đội',
        description: actDescription.trim() || undefined,
        image: actImageFile,
      },
      {
        onSuccess: () => {
          resetActivityForm();
          setIsActivityModalOpen(false);
        },
      }
    );
  };

  const checkpointModalRef = useClickOutside<HTMLDivElement>(
    () => setIsCheckpointModalOpen(false),
    isCheckpointModalOpen
  );
  const activityModalRef = useClickOutside<HTMLDivElement>(
    () => setIsActivityModalOpen(false),
    isActivityModalOpen
  );
  const activityDetailRef = useClickOutside<HTMLDivElement>(
    () => setViewingActivity(null),
    Boolean(viewingActivity)
  );
  const checkpointDetailRef = useClickOutside<HTMLDivElement>(
    () => setViewingCheckpoint(null),
    Boolean(viewingCheckpoint)
  );

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <p className="text-xs text-muted-foreground">Đang tải lộ trình...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* CHECKPOINT DỰ KIẾN */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" />
              <h3 className="text-base font-extrabold text-foreground">
                Checkpoint dự kiến ({checkpoints.length})
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Các mốc dừng chân dự kiến trên cung đường — dùng để check-in khi đang di chuyển thật
              (tab "Tổng quan"). Có thể bỏ qua từng checkpoint nếu thực tế đi lệch kế hoạch.
            </p>
          </div>

          {isLeader && (
            <button
              type="button"
              onClick={() => setIsCheckpointModalOpen(true)}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Thêm checkpoint
            </button>
          )}
        </div>

        {checkpoints.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Chưa có checkpoint nào.{' '}
            {isLeader ? 'Bấm "Thêm checkpoint" để lên kế hoạch trước khi khởi hành.' : ''}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {checkpoints.map((cp) => (
              <div
                key={cp.id}
                className="group relative flex flex-col justify-between rounded-xl border border-border bg-background p-3 text-xs overflow-hidden transition hover:border-primary/50 shadow-2xs"
              >
                {cp.imageUrl && (
                  <div className="h-24 w-full -mx-3 -mt-3 mb-2.5 overflow-hidden border-b border-border relative">
                    <img
                      src={cp.imageUrl}
                      alt={cp.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <span className="absolute top-2 left-2 rounded-md bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[10px] font-extrabold text-white">
                      Chặng {cp.order}
                    </span>
                  </div>
                )}
                <div className="absolute right-2 top-2 z-10 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setViewingCheckpoint(cp)}
                    className="rounded-full bg-background/80 backdrop-blur-xs p-1.5 text-muted-foreground hover:text-primary shadow-2xs transition"
                    title="Xem chi tiết"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  {isLeader && (
                    <button
                      type="button"
                      disabled={deleteCheckpoint.isPending}
                      onClick={() => deleteCheckpoint.mutate(cp.id)}
                      className="rounded-full bg-background/80 backdrop-blur-xs p-1.5 text-muted-foreground hover:text-destructive shadow-2xs transition disabled:opacity-50"
                      title="Xoá checkpoint"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="space-y-1">
                  {!cp.imageUrl && (
                    <span className="text-[11px] font-extrabold text-muted-foreground">
                      Chặng {cp.order}
                    </span>
                  )}
                  <strong className="block text-xs font-bold text-foreground line-clamp-1">
                    {cp.name}
                  </strong>
                  <p className="text-[11px] text-muted-foreground">{cp.category}</p>
                  {cp.description && (
                    <p className="text-[10.5px] text-muted-foreground/90 line-clamp-2">
                      {cp.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 pt-2 mt-1 border-t border-border/40 text-[10.5px]">
                  {cp.distanceAltitude && cp.distanceAltitude !== '—' && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 font-bold text-emerald-700 dark:text-emerald-400">
                      <MapPinned className="h-3 w-3 shrink-0 text-emerald-600" />
                      {cp.distanceAltitude}
                    </span>
                  )}
                  {cp.gps && cp.gps !== '—' && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-primary">
                      <Compass className="h-3 w-3 shrink-0" />
                      {cp.gps}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MATRIX TIMELINE GRID */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <h3 className="text-base font-extrabold text-foreground">Thời Khóa Biểu Lộ Trình</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Phân bổ thời gian, công việc & người phụ trách theo từng buổi và theo từng ngày của
              chuyến đi.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isLeader && (
              <button
                type="button"
                disabled={addDay.isPending}
                onClick={() => addDay.mutate()}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" />
                Thêm Ngày
              </button>
            )}

            <button
              type="button"
              disabled={days.length === 0}
              onClick={openActivityModal}
              title={
                days.length === 0 ? 'Cần có ít nhất một ngày trước khi thêm hoạt động' : undefined
              }
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary-hover transition disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Thêm Hoạt Động
            </button>
          </div>
        </div>

        {days.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Chưa có lộ trình chi tiết — bấm Thêm Ngày để bắt đầu.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-background">
            <table className="w-full min-w-[700px] border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="w-36 p-3 text-left font-extrabold text-foreground uppercase tracking-wider text-[11px] border-r border-border">
                    BUỔI / THỜI GIAN
                  </th>
                  {days.map((day) => (
                    <th
                      key={day.id}
                      className="p-3 text-left border-r border-border last:border-r-0"
                    >
                      <span className="block font-black text-foreground text-xs">{day.title}</span>
                      <span className="text-[11px] font-normal text-muted-foreground">
                        {day.subtitle}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((slot) => (
                  <tr key={slot.id} className="border-b border-border last:border-b-0 align-top">
                    {/* Slot Label Header Cell */}
                    <td className="p-3 border-r border-border bg-muted/20">
                      <div className="space-y-1">
                        <span
                          className={cn(
                            'inline-block rounded-md px-2 py-0.5 text-[10px] font-black border',
                            TIME_SLOT_BADGE_CLASS
                          )}
                        >
                          {slot.label}
                        </span>
                        <span className="block text-[11px] font-mono text-muted-foreground">
                          {slot.time}
                        </span>
                      </div>
                    </td>

                    {/* Day Columns Cells */}
                    {days.map((day) => {
                      const slotActivities = activities.filter(
                        (a) => a.dayId === day.id && a.timeSlot === slot.id
                      );

                      return (
                        <td
                          key={day.id}
                          className="p-2.5 border-r border-border last:border-r-0 space-y-2 bg-card/40"
                        >
                          {slotActivities.length === 0 ? (
                            <div className="h-16 rounded-xl border border-dashed border-border/60 flex items-center justify-center text-[11px] text-muted-foreground/60">
                              Chưa có hoạt động
                            </div>
                          ) : (
                            slotActivities.map((act) => (
                              <div
                                key={act.id}
                                className="group relative rounded-xl border border-border bg-card p-3 shadow-xs hover:border-primary/50 transition-all space-y-1.5"
                              >
                                {/* Time & Action Header */}
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-[10px] font-bold text-primary flex items-center gap-1">
                                    <Clock className="h-3 w-3 shrink-0" />
                                    {act.timeRange}
                                  </span>
                                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                                    <button
                                      type="button"
                                      onClick={() => setViewingActivity(act)}
                                      className="text-muted-foreground hover:text-primary p-0.5"
                                      title="Xem chi tiết"
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={deleteActivity.isPending}
                                      onClick={() => deleteActivity.mutate(act.id)}
                                      className="text-muted-foreground hover:text-destructive p-0.5 disabled:opacity-50"
                                      title="Xóa hoạt động"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Title */}
                                <h5 className="font-bold text-foreground text-xs leading-snug">
                                  {act.title}
                                </h5>

                                {/* Location & Assignee */}
                                <div className="space-y-1 text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                                  <div className="flex items-center gap-1 truncate">
                                    <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                                    <span className="truncate">{act.location}</span>
                                  </div>
                                  <div className="flex items-center gap-1 font-semibold text-primary">
                                    <User className="h-3 w-3 shrink-0" />
                                    <span className="truncate">{act.assignee}</span>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: ADD CHECKPOINT */}
      {isCheckpointModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div
            ref={checkpointModalRef}
            className="w-full max-w-md max-h-[90vh] overflow-y-auto space-y-4 rounded-2xl border border-border bg-card p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="flex items-center gap-2 text-sm font-extrabold text-foreground">
                <Compass className="h-4 w-4 text-primary" />
                Thêm checkpoint mới
              </h4>
              <button
                type="button"
                onClick={() => setIsCheckpointModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddCheckpoint} className="space-y-3 text-xs">
              <input
                value={cpName}
                onChange={(e) => setCpName(e.target.value)}
                placeholder="Tên điểm đến (vd: Lán nghỉ 2.200m)"
                className="w-full rounded-xl border border-border bg-background p-2.5 outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                value={cpCategory}
                onChange={(e) => setCpCategory(e.target.value)}
                placeholder="Phân loại (vd: Trạm ăn trưa)"
                className="w-full rounded-xl border border-border bg-background p-2.5 outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                value={cpDistance}
                onChange={(e) => setCpDistance(e.target.value)}
                placeholder="Khoảng cách/độ cao (vd: 2.200m)"
                className="w-full rounded-xl border border-border bg-background p-2.5 outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                value={cpGps}
                onChange={(e) => setCpGps(e.target.value)}
                placeholder="Toạ độ GPS (vd: 21.2612° N, 104.6291° E)"
                className="w-full rounded-xl border border-border bg-background p-2.5 outline-none focus:ring-2 focus:ring-ring"
              />
              <textarea
                value={cpDescription}
                onChange={(e) => setCpDescription(e.target.value)}
                placeholder="Mô tả chi tiết (vd: Có nguồn nước, phù hợp dựng lều nghỉ đêm...)"
                rows={3}
                className="w-full resize-none rounded-xl border border-border bg-background p-2.5 outline-none focus:ring-2 focus:ring-ring"
              />

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Ảnh minh hoạ (tuỳ chọn):</label>
                {cpImagePreviewUrl ? (
                  <div className="relative w-24">
                    <img
                      src={cpImagePreviewUrl}
                      alt="Xem trước checkpoint"
                      className="h-24 w-24 rounded-xl object-cover border border-border"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveCpImage}
                      className="absolute -top-2 -right-2 rounded-full bg-destructive text-white p-1 shadow-xs hover:bg-destructive/90"
                      title="Xoá ảnh"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => cpImageInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-1.5 w-24 h-24 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition"
                  >
                    <ImagePlus className="h-5 w-5" />
                    <span className="text-[10px] font-bold">Tải ảnh lên</span>
                  </button>
                )}
                <input
                  ref={cpImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCpImageChange}
                  className="hidden"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCheckpointModalOpen(false)}
                  className="flex-1 rounded-full border border-border py-2.5 text-xs font-bold text-foreground hover:bg-muted"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!cpName.trim() || addCheckpoint.isPending}
                  className="flex-1 rounded-full bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
                >
                  Thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ACTIVITY */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div
            ref={activityModalRef}
            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Thêm Hoạt Động Vào Lịch Trình
              </h4>
              <button
                type="button"
                onClick={() => setIsActivityModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddActivity} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Chọn Ngày:</label>
                  <select
                    value={actDayId}
                    onChange={(e) => setActDayId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-ring"
                  >
                    {days.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Buổi / Khung giờ:</label>
                  <select
                    value={actSlot}
                    onChange={(e) => setActSlot(e.target.value as TimeSlot)}
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-ring"
                  >
                    {TIME_SLOTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label} ({s.time})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Khung giờ chi tiết:</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 06:00 - 07:30"
                    value={actTime}
                    onChange={(e) => setActTime(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Người phụ trách chính:</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Minh (Leader)"
                    value={actAssignee}
                    onChange={(e) => setActAssignee(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Tên hoạt động:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Khởi hành chặng 2 lên đỉnh núi"
                  value={actTitle}
                  onChange={(e) => setActTitle(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Địa điểm diễn ra:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Trạm nghỉ chân thứ 2"
                  value={actLocation}
                  onChange={(e) => setActLocation(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Mô tả chi tiết (tuỳ chọn):</label>
                <textarea
                  value={actDescription}
                  onChange={(e) => setActDescription(e.target.value)}
                  placeholder="Ví dụ: Cả đoàn tập trung điểm danh, kiểm tra trang bị trước khi xuất phát..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Ảnh minh hoạ (tuỳ chọn):</label>
                {actImagePreviewUrl ? (
                  <div className="relative w-24">
                    <img
                      src={actImagePreviewUrl}
                      alt="Xem trước hoạt động"
                      className="h-24 w-24 rounded-xl object-cover border border-border"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveActImage}
                      className="absolute -top-2 -right-2 rounded-full bg-destructive text-white p-1 shadow-xs hover:bg-destructive/90"
                      title="Xoá ảnh"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => actImageInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-1.5 w-24 h-24 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition"
                  >
                    <ImagePlus className="h-5 w-5" />
                    <span className="text-[10px] font-bold">Tải ảnh lên</span>
                  </button>
                )}
                <input
                  ref={actImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleActImageChange}
                  className="hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsActivityModalOpen(false)}
                  className="rounded-full border border-border bg-background px-4 py-2 font-bold text-foreground hover:bg-muted"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={addActivity.isPending}
                  className="rounded-full bg-primary px-5 py-2 font-bold text-primary-foreground shadow-sm hover:bg-primary-hover disabled:opacity-50"
                >
                  Thêm Vào Lịch Trình
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW ACTIVITY DETAIL */}
      {viewingActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div
            ref={activityDetailRef}
            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Chi Tiết Hoạt Động
              </h4>
              <button
                type="button"
                onClick={() => setViewingActivity(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {viewingActivity.imageUrl && (
              <img
                src={viewingActivity.imageUrl}
                alt={viewingActivity.title}
                className="w-full h-40 rounded-xl object-cover border border-border"
              />
            )}

            <div className="space-y-3 text-xs">
              <h5 className="text-sm font-extrabold text-foreground">{viewingActivity.title}</h5>

              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black border',
                    TIME_SLOT_BADGE_CLASS
                  )}
                >
                  {TIME_SLOTS.find((s) => s.id === viewingActivity.timeSlot)?.label ??
                    viewingActivity.timeSlot}
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-primary">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  {viewingActivity.timeRange}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {days.find((d) => d.id === viewingActivity.dayId)?.title ?? ''}
                </span>
              </div>

              <div className="space-y-1.5 border-t border-border pt-3">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>{viewingActivity.location}</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-primary">
                  <User className="h-3.5 w-3.5 shrink-0" />
                  <span>{viewingActivity.assignee}</span>
                </div>
              </div>

              {viewingActivity.description && (
                <p className="border-t border-border pt-3 text-muted-foreground leading-relaxed whitespace-pre-line">
                  {viewingActivity.description}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setViewingActivity(null)}
                className="rounded-full border border-border bg-background px-4 py-2 text-xs font-bold text-foreground hover:bg-muted"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIEW CHECKPOINT DETAIL */}
      {viewingCheckpoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div
            ref={checkpointDetailRef}
            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <Compass className="h-5 w-5 text-primary" />
                Chi Tiết Checkpoint
              </h4>
              <button
                type="button"
                onClick={() => setViewingCheckpoint(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {viewingCheckpoint.imageUrl && (
              <img
                src={viewingCheckpoint.imageUrl}
                alt={viewingCheckpoint.name}
                className="w-full h-40 rounded-xl object-cover border border-border"
              />
            )}

            <div className="space-y-3 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-extrabold text-muted-foreground">
                    Chặng {viewingCheckpoint.order}
                  </span>
                  <h5 className="text-sm font-extrabold text-foreground">
                    {viewingCheckpoint.name}
                  </h5>
                </div>
                <span
                  className={cn(
                    'shrink-0 inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-black border',
                    TIME_SLOT_BADGE_CLASS
                  )}
                >
                  {CHECKPOINT_STATUS_LABELS[viewingCheckpoint.status]}
                </span>
              </div>

              <p className="text-muted-foreground">{viewingCheckpoint.category}</p>

              <div className="flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
                {viewingCheckpoint.distanceAltitude &&
                  viewingCheckpoint.distanceAltitude !== '—' && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 font-bold text-emerald-700 dark:text-emerald-400">
                      <MapPinned className="h-3 w-3 shrink-0 text-emerald-600" />
                      {viewingCheckpoint.distanceAltitude}
                    </span>
                  )}
                {viewingCheckpoint.gps && viewingCheckpoint.gps !== '—' && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-primary">
                    <Compass className="h-3 w-3 shrink-0" />
                    {viewingCheckpoint.gps}
                  </span>
                )}
              </div>

              {viewingCheckpoint.description && (
                <p className="border-t border-border pt-3 text-muted-foreground leading-relaxed whitespace-pre-line">
                  {viewingCheckpoint.description}
                </p>
              )}

              {viewingCheckpoint.checkedInByName && (
                <div className="flex items-center gap-1.5 border-t border-border pt-3 font-semibold text-primary">
                  <User className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Đã check-in bởi {viewingCheckpoint.checkedInByName}
                    {viewingCheckpoint.checkedInAt &&
                      ` · ${new Date(viewingCheckpoint.checkedInAt).toLocaleString('vi-VN')}`}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setViewingCheckpoint(null)}
                className="rounded-full border border-border bg-background px-4 py-2 text-xs font-bold text-foreground hover:bg-muted"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
