import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Inbox,
  Send,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { applicationRows } from '../../data/groupMatchingMocks';
import type { ApplicationRow, ApplicationState } from '../../types/groupMatchingTypes';

type FilterTab = 'ALL' | 'APPLIED' | 'WAITLISTED' | 'SLOT_OFFERED' | 'HISTORY';

/** Chỉ phục vụ góc nhìn Leader/Co-Leader quản lý roster ứng viên.
 * Actor Applicant/Waitlisted dùng `MyApplicationStatusCard` — xem GroupMatchingOverviewPage.tsx. */
export function ApplicationsPreview() {
  const [apps, setApps] = useState<ApplicationRow[]>(applicationRows);
  const [selectedApp, setSelectedApp] = useState<ApplicationRow | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');

  // Action handlers updating state cleanly
  const updateAppState = (
    id: string,
    newState: ApplicationState,
    statusText: string,
    tone: ApplicationRow['tone']
  ) => {
    setApps((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              appState: newState,
              status: statusText,
              tone,
            }
          : a
      )
    );
  };

  const handleApprove = (id: string) => {
    updateAppState(id, 'ACCEPTED', 'Đã duyệt (Thành viên chính thức)', 'offer');
  };

  const handleWaitlist = (id: string) => {
    updateAppState(id, 'WAITLISTED', 'Danh sách chờ (Hàng chờ #1)', 'waitlist');
  };

  const handleOfferSlot = (id: string) => {
    updateAppState(id, 'SLOT_OFFERED', 'Đã gửi Offer Slot (Còn 24h)', 'pending');
  };

  const handleReject = (id: string) => {
    updateAppState(id, 'REJECTED', 'Đã từ chối đơn', 'waitlist');
  };

  // Filter application rows
  const filteredApps = apps.filter((app) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'APPLIED') return app.appState === 'APPLIED';
    if (activeFilter === 'WAITLISTED') return app.appState === 'WAITLISTED';
    if (activeFilter === 'SLOT_OFFERED') return app.appState === 'SLOT_OFFERED';
    if (activeFilter === 'HISTORY') {
      return ['ACCEPTED', 'REJECTED', 'WITHDRAWN', 'OFFER_DECLINED', 'OFFER_EXPIRED'].includes(
        app.appState
      );
    }
    return true;
  });

  const acceptedCount = apps.filter((a) => a.appState === 'ACCEPTED').length;
  const waitlistCount = apps.filter((a) => a.appState === 'WAITLISTED').length;
  const offeredCount = apps.filter((a) => a.appState === 'SLOT_OFFERED').length;
  const pendingCount = apps.filter((a) => a.appState === 'APPLIED').length;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Group Capacity */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Danh sách Đơn Ứng tuyển (Trưởng nhóm)
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Xem chi tiết hồ sơ, duyệt thành viên chính thức hoặc gửi suất giữ chỗ 24h.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              Sức chứa: {4 + acceptedCount}/8 Thành viên (Còn {4 - acceptedCount} chỗ)
            </span>
            {waitlistCount > 0 && (
              <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                Hàng chờ: {waitlistCount} người
              </span>
            )}
          </div>
        </div>

        {/* Filter Tab Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {[
              { key: 'ALL', label: 'Tất cả đơn', count: apps.length },
              { key: 'APPLIED', label: 'Mới ứng tuyển', count: pendingCount },
              { key: 'WAITLISTED', label: 'Hàng chờ', count: waitlistCount },
              { key: 'SLOT_OFFERED', label: 'Mời giữ chỗ (24h)', count: offeredCount },
              {
                key: 'HISTORY',
                label: 'Lịch sử',
                count: apps.length - pendingCount - waitlistCount - offeredCount,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveFilter(tab.key as FilterTab)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                  activeFilter === tab.key
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-background border border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span>{tab.label}</span>
                <span className="rounded-full bg-black/10 dark:bg-white/10 px-1.5 py-0.2 text-[10px]">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Applications List */}
      {filteredApps.length > 0 ? (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const isTerminal = [
              'ACCEPTED',
              'REJECTED',
              'WITHDRAWN',
              'OFFER_DECLINED',
              'OFFER_EXPIRED',
            ].includes(app.appState);

            return (
              <div
                key={app.id}
                className="rounded-3xl border border-border bg-card p-5 shadow-xs transition hover:border-primary/40 space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={app.avatar}
                      alt={app.applicantName}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/20"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-foreground">
                          {app.applicantName}
                        </h4>
                        <span className="text-xs font-bold text-amber-600">
                          ⭐ {app.trustScore} Điểm uy tín
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{app.group}</p>
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        {app.experience}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    {app.appState === 'WAITLISTED' && (
                      <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-extrabold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> Hàng chờ (#1)
                      </span>
                    )}

                    {app.appState === 'SLOT_OFFERED' && (
                      <span className="rounded-full bg-primary/10 border border-primary/30 px-3 py-1 text-xs font-extrabold text-primary flex items-center gap-1 animate-pulse">
                        <Send className="h-3.5 w-3.5" /> Đã mời giữ chỗ (Còn 24h)
                      </span>
                    )}

                    {app.appState === 'ACCEPTED' && (
                      <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Thành viên chính thức
                      </span>
                    )}

                    {app.appState === 'REJECTED' && (
                      <span className="rounded-full bg-rose-500/10 border border-rose-500/30 px-3 py-1 text-xs font-extrabold text-rose-700 dark:text-rose-400 flex items-center gap-1">
                        <XCircle className="h-3.5 w-3.5" /> Đã từ chối
                      </span>
                    )}

                    {app.appState === 'WITHDRAWN' && (
                      <span className="rounded-full bg-slate-500/10 border border-slate-500/30 px-3 py-1 text-xs font-extrabold text-muted-foreground flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" /> Đã rút đơn
                      </span>
                    )}

                    {app.appState === 'APPLIED' && (
                      <span className="rounded-full bg-blue-500/10 border border-blue-500/30 px-3 py-1 text-xs font-extrabold text-blue-700 dark:text-blue-400 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> Đơn mới
                      </span>
                    )}
                  </div>
                </div>

                {/* Interview Answer */}
                <div className="rounded-2xl bg-background border border-border p-3.5 space-y-1">
                  <span className="text-[11px] font-extrabold text-foreground uppercase tracking-wider">
                    Ghi chú kinh nghiệm & thể lực:
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    "{app.answer}"
                  </p>
                </div>

                {/* Action Matrix Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {app.meta}
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedApp(app)}
                      className="rounded-full border border-border px-3 py-1.5 font-bold text-foreground hover:bg-muted transition"
                    >
                      Hồ sơ
                    </button>

                    {/* Leader Actions */}
                    {!isTerminal && (
                      <>
                        {app.appState === 'APPLIED' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleReject(app.id)}
                              className="rounded-full border border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 px-3 py-1.5 font-bold hover:bg-rose-100 transition"
                            >
                              Từ chối
                            </button>
                            <button
                              type="button"
                              onClick={() => handleWaitlist(app.id)}
                              className="rounded-full border border-amber-300 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 px-3 py-1.5 font-bold hover:bg-amber-100 transition"
                            >
                              Hàng chờ (Waitlist)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApprove(app.id)}
                              className="rounded-full bg-emerald-600 text-white px-4 py-1.5 font-extrabold hover:bg-emerald-700 shadow-xs transition"
                            >
                              <UserCheck className="h-3.5 w-3.5 inline mr-1" /> Duyệt vào nhóm
                            </button>
                          </>
                        )}

                        {app.appState === 'WAITLISTED' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleReject(app.id)}
                              className="rounded-full border border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 px-3 py-1.5 font-bold hover:bg-rose-100 transition"
                            >
                              Từ chối
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOfferSlot(app.id)}
                              className="rounded-full bg-primary text-primary-foreground px-4 py-1.5 font-extrabold hover:bg-primary/90 shadow-xs transition"
                            >
                              Mời giữ chỗ (24h)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApprove(app.id)}
                              className="rounded-full bg-emerald-600 text-white px-4 py-1.5 font-extrabold hover:bg-emerald-700 shadow-xs transition"
                            >
                              <UserCheck className="h-3.5 w-3.5 inline mr-1" /> Duyệt vào nhóm
                            </button>
                          </>
                        )}

                        {app.appState === 'SLOT_OFFERED' && (
                          <button
                            type="button"
                            onClick={() => handleReject(app.id)}
                            className="rounded-full border border-border px-3 py-1.5 font-bold text-muted-foreground hover:bg-muted transition"
                          >
                            Hủy lời mời
                          </button>
                        )}
                      </>
                    )}

                    {/* Locked State Disclaimer */}
                    {isTerminal && (
                      <span className="text-[11px] font-bold text-muted-foreground italic bg-muted/60 px-3 py-1 rounded-full border border-border">
                        Đã hoàn tất
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Inbox className="h-7 w-7" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-foreground">
              Không có đơn nào trong mục này
            </h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Vui lòng chuyển bộ lọc sang mục khác hoặc tạo đơn ứng tuyển giả lập từ kịch bản
              Review.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveFilter('ALL')}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition"
          >
            Xem tất cả đơn
          </button>
        </div>
      )}

      {/* Applicant Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-extrabold text-foreground">
                Hồ sơ ứng viên {selectedApp.applicantName}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-4">
                <img
                  src={selectedApp.avatar}
                  alt="Avatar"
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-primary"
                />
                <div>
                  <h4 className="text-sm font-extrabold text-foreground">
                    {selectedApp.applicantName}
                  </h4>
                  <p className="text-muted-foreground">
                    Chỉ số tin cậy: ⭐ {selectedApp.trustScore} / 5.0
                  </p>
                  <p className="text-emerald-700 dark:text-emerald-400 font-bold">
                    Đã hoàn thành {selectedApp.tripsCount} chuyến đi C2C an toàn
                  </p>
                </div>
              </div>

              <div className="space-y-2 rounded-2xl bg-background p-4 border border-border">
                <strong className="block text-foreground font-bold">Kinh nghiệm & Thể lực:</strong>
                <p className="text-muted-foreground leading-relaxed">{selectedApp.experience}</p>
              </div>

              <div className="space-y-2 rounded-2xl bg-background p-4 border border-border">
                <strong className="block text-foreground font-bold">Câu trả lời phỏng vấn:</strong>
                <p className="text-muted-foreground leading-relaxed italic">
                  "{selectedApp.answer}"
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="rounded-full border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-muted"
              >
                Đóng
              </button>
              {selectedApp.appState === 'APPLIED' && (
                <button
                  type="button"
                  onClick={() => {
                    handleApprove(selectedApp.id);
                    setSelectedApp(null);
                  }}
                  className="rounded-full bg-emerald-600 text-white px-5 py-2 text-xs font-extrabold hover:bg-emerald-700"
                >
                  Duyệt vào nhóm
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
