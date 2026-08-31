import {
  Award,
  Camera,
  Car,
  CheckCircle2,
  Clock,
  Compass,
  Cross,
  Crown,
  DollarSign,
  FileText,
  Footprints,
  Heart,
  Lock,
  Phone,
  Shield,
  ShieldCheck,
  Star,
  Tent,
  UserCheck,
  Users,
  Utensils,
  Wrench,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { ReviewActor } from '../../types/groupMatchingTypes';
import { PeerReviewModal, type ReviewData } from './PeerReviewModal';

export interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  avatarBg: string;
  role: string;
  roleType: 'leader' | 'co-leader' | 'member';
  roleIcon: typeof Crown;
  trustScore: number;
  completedTrips: number;
  emergencyContact: string;
  skills: { name: string; icon: typeof Wrench }[];
  medicalInfo: {
    bloodType: string;
    allergies: string;
    certifications: string;
    depositStatus: string;
    emergencyPhoneFull: string;
    emergencyRelation: string;
    note: string;
  };
}

interface MembersWorkspaceProps {
  actor?: ReviewActor;
}

export function MembersWorkspace({ actor = 'MEMBER' }: MembersWorkspaceProps) {
  // BR-MED-01: chỉ Vendor Coordinator/Group Leader (ở đây là Leader/Co-Leader) được xem Medical Profile của người khác.
  const canViewOthersMedical = actor === 'LEADER' || actor === 'CO_LEADER';
  const [members, setMembers] = useState<GroupMember[]>([
    {
      id: 'm1',
      name: 'Minh Tuấn',
      avatar: 'M',
      avatarBg: 'bg-emerald-600',
      role: 'Leader / Xế Cứng',
      roleType: 'leader',
      roleIcon: Crown,
      trustScore: 98,
      completedTrips: 14,
      emergencyContact: '0988***123 (Mẹ)',
      skills: [
        { name: 'Sửa xe', icon: Wrench },
        { name: 'Dẫn đường', icon: Compass },
      ],
      medicalInfo: {
        bloodType: 'O+',
        allergies: 'Không dị ứng thuốc',
        certifications: 'Dẫn đường Tà Xùa & Fansipan (3 năm)',
        depositStatus: 'Đã hoàn tất cọc 500.000đ',
        emergencyPhoneFull: '0988-765-123',
        emergencyRelation: 'Mẹ ruột (Bà Nguyễn Thị Mai)',
        note: 'Tiền sử thể lực tốt, đã hoàn thành 14 cung đường đèo Tây Bắc.',
      },
    },
    {
      id: 'm2',
      name: 'Hương Trà',
      avatar: 'H',
      avatarBg: 'bg-blue-600',
      role: 'Chốt Đoàn / Y Tế',
      roleType: 'co-leader',
      roleIcon: Shield,
      trustScore: 94,
      completedTrips: 8,
      emergencyContact: '0912***456 (Anh)',
      skills: [
        { name: 'Sơ cứu Bậc 2', icon: Cross },
        { name: 'Nấu ăn', icon: Utensils },
      ],
      medicalInfo: {
        bloodType: 'A+',
        allergies: 'Không dị ứng',
        certifications: 'Chứng chỉ sơ cứu Red Cross Bậc 2',
        depositStatus: 'Đã hoàn tất cọc 500.000đ',
        emergencyPhoneFull: '0912-345-456',
        emergencyRelation: 'Anh trai (Lê Văn Hoàng)',
        note: 'Mang theo túi y tế chuyên dụng trang bị đầy đủ băng gạc & thuốc chống sốc altitude.',
      },
    },
    {
      id: 'm3',
      name: 'Linh Đan',
      avatar: 'L',
      avatarBg: 'bg-amber-600',
      role: 'Thành Viên / Ôm',
      roleType: 'member',
      roleIcon: UserCheck,
      trustScore: 92,
      completedTrips: 5,
      emergencyContact: '0977***888 (Chị)',
      skills: [
        { name: 'Nhiếp ảnh', icon: Camera },
        { name: 'Dựng lều', icon: Tent },
      ],
      medicalInfo: {
        bloodType: 'B+',
        allergies: 'Hơi nhạy cảm với phấn hoa nhẹ',
        certifications: 'Kỹ năng chụp ảnh Flycam & Đèn đêm',
        depositStatus: 'Đã hoàn tất cọc 500.000đ',
        emergencyPhoneFull: '0977-888-999',
        emergencyRelation: 'Chị gái (Trần Linh Chi)',
        note: 'Có máy ảnh mirrorless hỗ trợ ghi lại toàn bộ kỉ niệm khoảnh khắc của đoàn.',
      },
    },
    {
      id: 'm4',
      name: 'Việt Dũng',
      avatar: 'V',
      avatarBg: 'bg-purple-600',
      role: 'Xế Cứng / Hậu Cần',
      roleType: 'member',
      roleIcon: Car,
      trustScore: 96,
      completedTrips: 11,
      emergencyContact: '0933***999 (Bố)',
      skills: [
        { name: 'Lái xe đèo', icon: Car },
        { name: 'Sửa xe cơ bản', icon: Wrench },
      ],
      medicalInfo: {
        bloodType: 'AB+',
        allergies: 'Không dị ứng',
        certifications: 'Bằng lái xe B2 & Bằng A2 đường trường',
        depositStatus: 'Đã hoàn tất cọc 500.000đ',
        emergencyPhoneFull: '0933-222-999',
        emergencyRelation: 'Bố ruột (Phạm Việt Hùng)',
        note: 'Chuyên chạy xe cào cào và đèo dốc sương mù đêm.',
      },
    },
    {
      id: 'm5',
      name: 'Bảo Ngọc',
      avatar: 'B',
      avatarBg: 'bg-teal-600',
      role: 'Thủ Quỹ / Hậu Cần',
      roleType: 'member',
      roleIcon: DollarSign,
      trustScore: 90,
      completedTrips: 4,
      emergencyContact: '0905***111 (Mẹ)',
      skills: [
        { name: 'Quản lý thu chi', icon: FileText },
        { name: 'Hậu cần đồ ăn', icon: Utensils },
      ],
      medicalInfo: {
        bloodType: 'O-',
        allergies: 'Không dị ứng',
        certifications: 'Quản lý tài chính & Kế toán nhóm',
        depositStatus: 'Đã hoàn tất cọc 500.000đ',
        emergencyPhoneFull: '0905-111-222',
        emergencyRelation: 'Mẹ ruột (Nguyễn Thu Hương)',
        note: 'Phụ trách ghi chép hóa đơn thực tế và đối soát Quỹ nhóm C2C.',
      },
    },
  ]);

  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);
  const [peerReviewingMember, setPeerReviewingMember] = useState<GroupMember | null>(null);
  const [reviewedMembers, setReviewedMembers] = useState<Record<string, ReviewData>>({});
  const [tripStatus, setTripStatus] = useState<'ONGOING' | 'COMPLETED'>('ONGOING');

  const handleReviewSubmit = (memberId: string, reviewData: ReviewData) => {
    setReviewedMembers((prev) => ({ ...prev, [memberId]: reviewData }));
    setMembers((prevMembers) =>
      prevMembers.map((m) =>
        m.id === memberId ? { ...m, trustScore: Math.min(100, m.trustScore + 2) } : m
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* MAIN CONTAINER CARD */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Danh Sách Thành Viên & Phân Công Vai Trò ({members.length}/8)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Quản lý thông tin cá nhân, điểm uy tín (Trust Score), kỹ năng và liên hệ khẩn cấp
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="h-4 w-4" />
            100% Đã Xác Minh Danh Tính
          </span>
        </div>

        {/* TRIP STATUS VERIFICATION BANNER */}
        <div
          className={cn(
            'rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all duration-200',
            tripStatus === 'COMPLETED'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-200'
          )}
        >
          <div className="flex items-start sm:items-center gap-3">
            {tripStatus === 'COMPLETED' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
            ) : (
              <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm">
                  {tripStatus === 'COMPLETED'
                    ? 'Chuyến đi đã được xác thực hoàn thành!'
                    : 'Chuyến đi đang trong giai đoạn thực hiện (18/10 - 20/10/2026)'}
                </span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider',
                    tripStatus === 'COMPLETED'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-600 text-white'
                  )}
                >
                  {tripStatus === 'COMPLETED' ? 'Đã đi xong' : 'Đang diễn ra'}
                </span>
              </div>
              <p className="text-[11px] opacity-80 mt-1">
                {tripStatus === 'COMPLETED'
                  ? 'Hệ thống đã mở tính năng Đánh Giá Peer Review. Bạn có thể chấm điểm uy tín Trust Score cho các đồng đội cùng đoàn.'
                  : 'Tính năng Đánh Giá Đồng Đội (Peer Review) được bảo mật và chỉ kích hoạt sau khi nhóm hoàn thành chuyến đi & được Leader xác thực.'}
              </p>
            </div>
          </div>

          {/* TOGGLE STATUS & QUICK REVIEW FOR DEMO TESTING */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 border-t sm:border-t-0 border-border/40 pt-2 sm:pt-0">
            {tripStatus === 'COMPLETED' && (
              <button
                type="button"
                onClick={() => {
                  const firstUnreviewed = members.find((m) => !reviewedMembers[m.id]) || members[0];
                  setPeerReviewingMember(firstUnreviewed);
                }}
                className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 font-black text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Award className="h-4 w-4" />
                <span>
                  Đánh Giá Nhanh ({Object.keys(reviewedMembers).length}/{members.length})
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setTripStatus(tripStatus === 'ONGOING' ? 'COMPLETED' : 'ONGOING')}
              className={cn(
                'rounded-xl px-3 py-2 font-bold text-xs border transition shadow-2xs flex items-center gap-1.5 cursor-pointer',
                tripStatus === 'COMPLETED'
                  ? 'bg-emerald-700/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 hover:bg-emerald-700/30'
                  : 'bg-amber-600 text-white border-amber-700 hover:bg-amber-700'
              )}
            >
              {tripStatus === 'COMPLETED' ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Chuyển trạng thái: Đang đi tour
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5" />
                  Chuyển trạng thái: Đã đi xong (Mở Review)
                </>
              )}
            </button>
          </div>
        </div>

        {/* MEMBERS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => {
            const RoleIcon = member.roleIcon;

            return (
              <div
                key={member.id}
                className="rounded-xl border border-border bg-card p-4 space-y-4 shadow-2xs hover:border-emerald-500/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* MEMBER HEADER */}
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-black text-white text-base shadow-xs',
                        member.avatarBg
                      )}
                    >
                      {member.avatar}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-foreground leading-tight">
                        {member.name}
                      </h4>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 text-[11px] font-bold mt-0.5',
                          member.roleType === 'leader'
                            ? 'text-amber-600 dark:text-amber-400'
                            : member.roleType === 'co-leader'
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                        )}
                      >
                        <RoleIcon className="h-3 w-3" />
                        {member.role}
                      </span>
                    </div>
                  </div>

                  {/* STATS & INFO */}
                  <div className="space-y-1.5 text-xs text-muted-foreground pt-1 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        Trust Score:
                      </span>
                      <strong className="text-foreground font-extrabold">
                        {member.trustScore} / 100
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Footprints className="h-3.5 w-3.5 text-emerald-600" />
                        Đã đi thành công:
                      </span>
                      <strong className="text-foreground font-extrabold">
                        {member.completedTrips} chuyến
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-purple-600" />
                        SĐT Khẩn cấp:
                      </span>
                      <strong className="text-foreground font-bold">
                        {member.emergencyContact}
                      </strong>
                    </div>
                  </div>

                  {/* SKILL TAGS */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {member.skills.map((skill) => {
                      const SkillIcon = skill.icon;
                      return (
                        <span
                          key={skill.name}
                          className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground border border-border"
                        >
                          <SkillIcon className="h-3 w-3 text-emerald-600" />
                          {skill.name}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {canViewOthersMedical ? (
                    <button
                      type="button"
                      onClick={() => setSelectedMember(member)}
                      aria-label={`Xem chi tiết y tế và khẩn cấp của ${member.name}`}
                      className="rounded-xl border border-border bg-muted/40 py-2 text-[11px] font-bold text-foreground hover:bg-muted transition shadow-2xs text-center truncate px-1"
                    >
                      Xem Y Tế
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      title="Chỉ Leader/Co-Leader được xem hồ sơ y tế của thành viên khác (BR-MED-01)"
                      className="rounded-xl border border-border/80 bg-muted/40 py-2 text-[11px] font-semibold text-muted-foreground/60 cursor-not-allowed flex items-center justify-center gap-1 px-1"
                    >
                      <Lock className="h-3 w-3 shrink-0 opacity-50" />Y Tế (Khóa)
                    </button>
                  )}

                  {tripStatus === 'COMPLETED' ? (
                    <button
                      type="button"
                      onClick={() => setPeerReviewingMember(member)}
                      aria-label={`Đánh giá uy tín đồng đội cho ${member.name}`}
                      className={cn(
                        'rounded-xl border py-2 text-[11px] font-extrabold transition shadow-2xs flex items-center justify-center gap-1 px-1',
                        reviewedMembers[member.id]
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20'
                      )}
                    >
                      <Award className="h-3 w-3 shrink-0" />
                      {reviewedMembers[member.id] ? 'Đã Đánh Giá ✓' : 'Đánh Giá Peer'}
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
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg font-black text-white text-sm',
                    selectedMember.avatarBg
                  )}
                >
                  {selectedMember.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-foreground leading-tight">
                    Hồ Sơ Y Tế & Khẩn Cấp
                  </h4>
                  <span className="text-xs font-bold text-emerald-600">
                    {selectedMember.name} ({selectedMember.role})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                aria-label="Đóng cửa sổ thông tin y tế"
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-extrabold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Trạng thái tiền cọc nhóm:
                </div>
                <div className="text-foreground font-bold pl-5">
                  {selectedMember.medicalInfo.depositStatus}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-0.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <Heart className="h-3 w-3 text-rose-500" />
                    Nhóm Máu
                  </span>
                  <div className="text-sm font-black text-foreground">
                    {selectedMember.medicalInfo.bloodType}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-0.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <Cross className="h-3 w-3 text-blue-500" />
                    Dị Ứng / Bệnh Lý
                  </span>
                  <div className="text-xs font-bold text-foreground truncate">
                    {selectedMember.medicalInfo.allergies}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <Phone className="h-3 w-3 text-purple-600" />
                  Thông Tin Liên Hệ Khẩn Cấp (Emergency Contact)
                </span>
                <div className="text-xs font-extrabold text-foreground">
                  SĐT: {selectedMember.medicalInfo.emergencyPhoneFull}
                </div>
                <div className="text-xs text-muted-foreground">
                  Quan hệ: {selectedMember.medicalInfo.emergencyRelation}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-amber-500" />
                  Chứng Chỉ / Kỹ Năng Nổi Bật
                </span>
                <div className="text-xs font-bold text-foreground">
                  {selectedMember.medicalInfo.certifications}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <FileText className="h-3 w-3 text-emerald-600" />
                  Ghi Chú Thể Lực & Kinh Nghiệm
                </span>
                <div className="text-xs text-muted-foreground leading-relaxed">
                  {selectedMember.medicalInfo.note}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
              >
                Đóng Hồ Sơ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PEER REVIEW MODAL (GIAI ĐOẠN 3) */}
      {peerReviewingMember && (
        <PeerReviewModal
          member={peerReviewingMember}
          allMembers={members}
          reviewedMembers={reviewedMembers}
          onClose={() => setPeerReviewingMember(null)}
          onSubmitReview={handleReviewSubmit}
          onSelectMember={(m) => setPeerReviewingMember(m)}
        />
      )}
    </div>
  );
}
