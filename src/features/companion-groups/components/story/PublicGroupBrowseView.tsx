import { CalendarDays, MapPin, Users } from 'lucide-react';
import { groupRecommendations } from '../../data/groupMatchingMocks';
import type { GroupRecommendation } from '../../types/groupMatchingTypes';

interface PublicGroupBrowseViewProps {
  onSelectGroup: (group: GroupRecommendation) => void;
}

const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
];

/**
 * "Trang tìm nhóm" — danh sách công khai các nhóm đang tuyển (UC-GU08/UC-GMD01).
 * Dùng lại mock groupRecommendations có sẵn, trình bày dạng card đơn giản
 * (ảnh bìa, thông tin sơ qua) — không kèm match score/lý do đề xuất như DiscoveryPreview,
 * vì đây là góc nhìn "browse công khai", không phải "gợi ý cá nhân hoá".
 */
export function PublicGroupBrowseView({ onSelectGroup }: PublicGroupBrowseViewProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-lg font-black text-foreground">Tìm nhóm đang tuyển thành viên</h2>
        <p className="text-xs text-muted-foreground">
          Danh sách công khai — bấm vào một nhóm để xem chi tiết trước khi ứng tuyển.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {groupRecommendations.map((group, idx) => (
          <button
            key={group.id}
            type="button"
            onClick={() => onSelectGroup(group)}
            className="text-left rounded-3xl border border-border bg-card overflow-hidden shadow-xs hover:border-primary/40 hover:shadow-md transition group cursor-pointer"
          >
            <div className="relative h-40 w-full overflow-hidden bg-slate-900">
              <img
                src={COVER_IMAGES[idx % COVER_IMAGES.length]}
                alt={group.title}
                className="h-full w-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <span className="absolute bottom-2 left-3 rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                Đang tuyển · {group.members}
              </span>
            </div>

            <div className="p-4 space-y-2">
              <h3 className="text-sm font-extrabold text-foreground leading-snug line-clamp-2">
                {group.title}
              </h3>
              <div className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> {group.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-amber-600 shrink-0" /> {group.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-blue-600 shrink-0" /> Độ khó:{' '}
                  {group.difficulty}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default PublicGroupBrowseView;
