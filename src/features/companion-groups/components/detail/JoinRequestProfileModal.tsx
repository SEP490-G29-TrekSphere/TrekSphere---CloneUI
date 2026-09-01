import { Backpack, Mountain, ShieldCheck, Sparkles, Star, X } from 'lucide-react';
import {
  FITNESS_LEVELS,
  PACE_STYLES,
  SKILL_OPTIONS,
  TERRAIN_OPTIONS,
} from '@/features/profile/types';
import { getAdvancedProfile } from '@/features/profile/utils/advancedProfileStorage';
import { useClickOutside } from '@/shared/hooks';
import { computeTrustScore } from '@/shared/utils/trustScore';
import type { MatchingMemberItem } from '../../services/companionGroupService';
import { MemberAvatar } from './MemberAvatar';

interface JoinRequestProfileModalProps {
  request: MatchingMemberItem;
  onClose: () => void;
}

export function JoinRequestProfileModal({ request, onClose }: JoinRequestProfileModalProps) {
  const modalRef = useClickOutside<HTMLDivElement>(onClose);
  const { preferences: prefs } = getAdvancedProfile(request.userId);
  const trustScore = computeTrustScore(request.userId);

  const fitnessObj = FITNESS_LEVELS.find((f) => f.value === prefs.fitnessLevel);
  const paceObj = PACE_STYLES.find((p) => p.value === prefs.paceStyle);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div
        ref={modalRef}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <MemberAvatar fullName={request.fullName} avatarUrl={request.avatarUrl} size="lg" />
            <div>
              <h3 className="text-sm font-extrabold text-foreground">{request.fullName}</h3>
              <p className="text-[11px] text-muted-foreground">
                Yêu cầu gia nhập ngày {new Date(request.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ĐIỂM TIN CẬY */}
        <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <span className="text-xs font-extrabold text-primary block">Điểm tin cậy</span>
              <span className="text-[11px] text-muted-foreground">
                Uy tín tích lũy trên toàn hệ thống TrekSphere
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="text-lg font-black text-primary">{trustScore}</span>
            <span className="text-xs font-bold text-muted-foreground">/100</span>
          </div>
        </div>

        {/* LỜI NHẮN */}
        {request.message && (
          <div className="rounded-xl bg-muted/60 p-3.5">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Lời nhắn gửi trưởng nhóm
            </p>
            <p className="text-xs italic leading-relaxed text-foreground">"{request.message}"</p>
          </div>
        )}

        {/* HỒ SƠ GHÉP NHÓM & TIÊU CHÍ TREKKING */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
              Hồ Sơ Ghép Nhóm & Tiêu Chí Trekking
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-muted/40 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Trình độ & Thể lực
              </p>
              <p className="mt-1 text-sm font-bold text-foreground">
                {fitnessObj?.label ?? 'Chưa cập nhật'}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {prefs.fitnessLevel === 'other' && prefs.fitnessLevelCustom
                  ? prefs.fitnessLevelCustom
                  : fitnessObj?.desc}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Tốc độ di chuyển
              </p>
              <p className="mt-1 text-sm font-bold text-foreground">
                {paceObj?.label ?? 'Chưa cập nhật'}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {prefs.paceStyle === 'other' && prefs.paceStyleCustom
                  ? prefs.paceStyleCustom
                  : paceObj?.desc}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Backpack className="h-3 w-3" />
              Kỹ năng & Trang bị sẵn có
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {prefs.skillsAndEquipment.length > 0 ? (
                prefs.skillsAndEquipment.map((skillId) => {
                  const opt = SKILL_OPTIONS.find((s) => s.id === skillId);
                  const label =
                    skillId === 'other' && prefs.skillsCustom
                      ? `Khác: ${prefs.skillsCustom}`
                      : (opt?.label ?? skillId);
                  return (
                    <span
                      key={skillId}
                      className="rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-[11px] font-bold text-primary"
                    >
                      {label}
                    </span>
                  );
                })
              ) : (
                <span className="text-[11px] text-muted-foreground">Chưa cập nhật</span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Mountain className="h-3 w-3" />
              Địa hình mong muốn trải nghiệm
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {prefs.preferredTerrains.length > 0 ? (
                prefs.preferredTerrains.map((terrainId) => {
                  const opt = TERRAIN_OPTIONS.find((t) => t.id === terrainId);
                  const label =
                    terrainId === 'other' && prefs.terrainsCustom
                      ? `Khác: ${prefs.terrainsCustom}`
                      : (opt?.label ?? terrainId);
                  return (
                    <span
                      key={terrainId}
                      className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-bold text-foreground border border-border"
                    >
                      {label}
                    </span>
                  );
                })
              ) : (
                <span className="text-[11px] text-muted-foreground">Chưa cập nhật</span>
              )}
            </div>
          </div>

          {prefs.planningNotes && (
            <div className="rounded-xl border border-border bg-muted/40 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Kế hoạch & Mong muốn ghép nhóm
              </p>
              <p className="mt-1 text-xs font-semibold text-foreground">"{prefs.planningNotes}"</p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-1 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border bg-background px-4 py-2 text-xs font-bold text-foreground hover:bg-muted"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
