import {
  Award,
  Cross,
  Crown,
  FileText,
  Footprints,
  Heart,
  Lock,
  Phone,
  ShieldCheck,
  Star,
  UserCheck,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/shared/hooks';
import {
  useGroupPeerReviews,
  useGroupWorkspaceMembers,
  useSubmitPeerReview,
} from '../../hooks/useGroupMembersWorkspace';
import type { PeerReviewPayload, WorkspaceMemberItem } from '../../services/groupWorkspaceService';
import { GroupPeerReviewModal } from './GroupPeerReviewModal';

interface GroupMembersWorkspaceProps {
  groupId: string;
  isLeader: boolean;
  tripStatus: 'ONGOING' | 'COMPLETED';
}

/** Avatar-fallback initials circle uses a single consistent token pair (no rainbow rotation). */
const AVATAR_FALLBACK_CLASS = 'bg-secondary text-secondary-foreground';

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?';
}

function maskPhone(phone: string | undefined) {
  if (!phone) return 'Chưa cập nhật';
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 6) return phone;
  return `${digits.slice(0, 4)}***${digits.slice(-3)}`;
}

/**
 * Bảng danh sách thành viên trong tab "Quản trị nhóm" — tái hiện MembersWorkspace (story-flow
 * mockup): lưới hồ sơ thành viên (Trust Score, kỹ năng, liên hệ khẩn cấp), hồ sơ y tế gated cho
 * Leader và luồng Peer Review khi chuyến đi đã hoàn thành, nối dữ liệu thật qua
 * `useGroupMembersWorkspace.ts`. `tripStatus` (đổi ở tab "Thành viên") quyết định Peer Review có
 * mở hay không.
 */
export function GroupMembersWorkspace({
  groupId,
  isLeader,
  tripStatus,
}: GroupMembersWorkspaceProps) {
  const { data: members = [], isLoading } = useGroupWorkspaceMembers(groupId);
  const { data: myReviews = [] } = useGroupPeerReviews(groupId);
  const submitReview = useSubmitPeerReview(groupId);

  const [selectedMedicalMember, setSelectedMedicalMember] = useState<WorkspaceMemberItem | null>(
    null
  );
  const [peerReviewingMember, setPeerReviewingMember] = useState<WorkspaceMemberItem | null>(null);

  const reviewedIds = useMemo(
    () => new Set(myReviews.map((review) => review.revieweeId)),
    [myReviews]
  );

  const medicalModalRef = useClickOutside<HTMLDivElement>(
    () => setSelectedMedicalMember(null),
    Boolean(selectedMedicalMember)
  );

  // BR-MED-01: chỉ Leader được xem hồ sơ y tế của thành viên khác (mô hình thật không có Co-Leader).
  const canViewOthersMedical = isLeader;

  function handleSubmitReview(payload: PeerReviewPayload) {
    submitReview.mutate(payload, {
      onSuccess: () => {
        const nextUnreviewed = members.find(
          (m) => m.userId !== payload.revieweeId && !reviewedIds.has(m.userId)
        );
        setPeerReviewingMember(nextUnreviewed ?? null);
      },
    });
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <p className="text-xs text-muted-foreground">Đang tải danh sách thành viên...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* MAIN CONTAINER CARD */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Danh Sách Thành Viên ({members.length})
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Quản lý thông tin cá nhân, điểm uy tín (Trust Score), kỹ năng và liên hệ khẩn cấp
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-primary/10 px-3 py-1 text-xs font-extrabold text-primary border border-primary/20">
            <ShieldCheck className="h-4 w-4" />
            100% Đã Xác Minh Danh Tính
          </span>
        </div>

        {/* MEMBERS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => {
            const RoleIcon = member.isLeader ? Crown : UserCheck;
            const isReviewed = reviewedIds.has(member.userId);

            return (
              <div
                key={member.userId}
                className="rounded-xl border border-border bg-card p-4 space-y-4 shadow-2xs hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* MEMBER HEADER */}
                  <div className="flex items-center gap-3">
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.fullName}
                        className="h-11 w-11 shrink-0 rounded-xl object-cover shadow-xs"
                      />
                    ) : (
                      <div
                        className={cn(
                          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-black text-base shadow-xs',
                          AVATAR_FALLBACK_CLASS
                        )}
                      >
                        {getInitial(member.fullName)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-extrabold text-foreground leading-tight">
                        {member.fullName}
                      </h4>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 text-[11px] font-bold mt-0.5',
                          member.isLeader ? 'text-primary' : 'text-muted-foreground'
                        )}
                      >
                        <RoleIcon className="h-3 w-3" />
                        {member.roleLabel}
                      </span>
                    </div>
                  </div>

                  {/* STATS & INFO */}
                  <div className="space-y-1.5 text-xs text-muted-foreground pt-1 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5 text-primary fill-primary" />
                        Trust Score:
                      </span>
                      <strong className="text-foreground font-extrabold">
                        {member.trustScore} / 100
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Footprints className="h-3.5 w-3.5 text-muted-foreground" />
                        Đã đi thành công:
                      </span>
                      <strong className="text-foreground font-extrabold">
                        {member.completedTrips} chuyến
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        SĐT Khẩn cấp:
                      </span>
                      <strong className="text-foreground font-bold">
                        {maskPhone(member.medicalInfo.emergencyPhone)}
                        {member.medicalInfo.emergencyRelation
                          ? ` (${member.medicalInfo.emergencyRelation})`
                          : ''}
                      </strong>
                    </div>
                  </div>

                  {/* SKILL TAGS */}
                  {member.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {member.skills.map((skill) => (
                        <span
                          key={skill.name}
                          className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground border border-border"
                        >
                          <Wrench className="h-3 w-3 text-muted-foreground" />
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* ACTION BUTTONS */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {canViewOthersMedical ? (
                    <button
                      type="button"
                      onClick={() => setSelectedMedicalMember(member)}
                      aria-label={`Xem chi tiết y tế và khẩn cấp của ${member.fullName}`}
                      className="rounded-xl border border-border bg-muted/40 py-2 text-[11px] font-bold text-foreground hover:bg-muted transition shadow-2xs text-center truncate px-1"
                    >
                      Xem Y Tế
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      title="Chỉ Leader được xem hồ sơ y tế của thành viên khác (BR-MED-01)"
                      className="rounded-xl border border-border/80 bg-muted/40 py-2 text-[11px] font-semibold text-muted-foreground/60 cursor-not-allowed flex items-center justify-center gap-1 px-1"
                    >
                      <Lock className="h-3 w-3 shrink-0 opacity-50" />Y Tế (Khóa)
                    </button>
                  )}

                  {tripStatus === 'COMPLETED' ? (
                    <button
                      type="button"
                      onClick={() => setPeerReviewingMember(member)}
                      aria-label={`Đánh giá uy tín đồng đội cho ${member.fullName}`}
                      className={cn(
                        'rounded-xl border py-2 text-[11px] font-extrabold transition shadow-2xs flex items-center justify-center gap-1 px-1',
                        isReviewed
                          ? 'border-border bg-muted text-foreground'
                          : 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/20'
                      )}
                    >
                      <Award className="h-3 w-3 shrink-0" />
                      {isReviewed ? 'Đã Đánh Giá ✓' : 'Đánh Giá Peer'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      title="Tính năng Đánh Giá Peer chỉ mở sau khi nhóm hoàn thành chuyến đi và được Leader xác thực"
                      className="rounded-xl border border-border/80 bg-muted/40 py-2 text-[11px] font-semibold text-muted-foreground/60 cursor-not-allowed flex items-center justify-center gap-1 px-1"
                    >
                      <Lock className="h-3 w-3 shrink-0 opacity-50" />
                      Chờ Xong Tour
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MEDICAL & EMERGENCY DETAILS MODAL */}
      {selectedMedicalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div
            ref={medicalModalRef}
            className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-3">
                {selectedMedicalMember.avatarUrl ? (
                  <img
                    src={selectedMedicalMember.avatarUrl}
                    alt={selectedMedicalMember.fullName}
                    className="h-9 w-9 rounded-lg object-cover"
                  />
                ) : (
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg font-black text-sm',
                      AVATAR_FALLBACK_CLASS
                    )}
                  >
                    {getInitial(selectedMedicalMember.fullName)}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-extrabold text-foreground leading-tight">
                    Hồ Sơ Y Tế & Khẩn Cấp
                  </h4>
                  <span className="text-xs font-bold text-primary">
                    {selectedMedicalMember.fullName} ({selectedMedicalMember.roleLabel})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMedicalMember(null)}
                aria-label="Đóng cửa sổ thông tin y tế"
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-0.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <Heart className="h-3 w-3 text-muted-foreground" />
                    Nhóm Máu
                  </span>
                  <div className="text-sm font-black text-foreground">
                    {selectedMedicalMember.medicalInfo.bloodType ?? 'Chưa cập nhật'}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-0.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <Cross className="h-3 w-3 text-muted-foreground" />
                    Dị Ứng / Bệnh Lý
                  </span>
                  <div className="text-xs font-bold text-foreground truncate">
                    {selectedMedicalMember.medicalInfo.allergies ?? 'Không có'}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  Thông Tin Liên Hệ Khẩn Cấp (Emergency Contact)
                </span>
                <div className="text-xs font-extrabold text-foreground">
                  SĐT: {selectedMedicalMember.medicalInfo.emergencyPhone ?? 'Chưa cập nhật'}
                </div>
                <div className="text-xs text-muted-foreground">
                  Quan hệ: {selectedMedicalMember.medicalInfo.emergencyRelation ?? 'Chưa cập nhật'}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-muted-foreground" />
                  Chứng Chỉ / Kỹ Năng Nổi Bật
                </span>
                <div className="text-xs font-bold text-foreground">
                  {selectedMedicalMember.medicalInfo.certifications ?? 'Chưa cập nhật'}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <FileText className="h-3 w-3 text-muted-foreground" />
                  Ghi Chú Thể Lực & Kinh Nghiệm
                </span>
                <div className="text-xs text-muted-foreground leading-relaxed">
                  {selectedMedicalMember.medicalInfo.note ?? 'Chưa có ghi chú.'}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedMedicalMember(null)}
                className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-xs"
              >
                Đóng Hồ Sơ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PEER REVIEW MODAL */}
      {peerReviewingMember && (
        <GroupPeerReviewModal
          key={peerReviewingMember.userId}
          member={peerReviewingMember}
          allMembers={members}
          reviewedIds={reviewedIds}
          onClose={() => setPeerReviewingMember(null)}
          onSubmit={handleSubmitReview}
          isSubmitting={submitReview.isPending}
          onSelectMember={(m) => setPeerReviewingMember(m)}
        />
      )}
    </div>
  );
}
