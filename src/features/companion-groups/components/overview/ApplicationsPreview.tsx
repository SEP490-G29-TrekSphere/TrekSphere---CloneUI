import { Clock, UserCheck, XCircle } from 'lucide-react';
import { useState } from 'react';
import { applicationRows } from '../../data/groupMatchingMocks';
import type { ApplicationRow } from '../../types/groupMatchingTypes';

export function ApplicationsPreview() {
  const [apps, setApps] = useState<ApplicationRow[]>(applicationRows);
  const [selectedApp, setSelectedApp] = useState<ApplicationRow | null>(null);

  const handleApprove = (id: string) => {
    setApps((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: 'Đã chấp nhận (Duyệt)', tone: 'offer' as const } : a
      )
    );
  };

  const handleReject = (id: string) => {
    setApps((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Đã từ chối', tone: 'waitlist' as const } : a))
    );
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                Giai đoạn 2
              </span>
              <h3 className="text-base font-extrabold text-foreground">
                Quản lý Đơn Ứng tuyển & Duyệt Thành viên (Trust-based Vetting)
              </h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Leader xem xét hồ sơ thể lực, đánh giá uy tín (Trust Score) và câu trả lời để chấp
              nhận hoặc từ chối ứng viên.
            </p>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700">
            {apps.length} Đơn đang xử lý
          </span>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {apps.map((app) => (
          <div
            key={app.id}
            className="rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:border-primary/40 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={app.avatar}
                  alt={app.applicantName}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/20"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-foreground">{app.applicantName}</h4>
                    <span className="text-xs font-bold text-amber-600">
                      Trust Score: {app.trustScore}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{app.group}</p>
                  <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                    {app.experience}
                  </span>
                </div>
              </div>

              {/* Status Pill */}
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    app.tone === 'offer'
                      ? 'bg-emerald-500/10 text-emerald-700'
                      : app.tone === 'pending'
                        ? 'bg-amber-500/10 text-amber-700'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {app.status}
                </span>
              </div>
            </div>

            {/* Answer Message Box */}
            <div className="rounded-xl bg-background border border-border p-3.5 space-y-1">
              <span className="text-[11px] font-extrabold text-foreground uppercase tracking-wider">
                Câu trả lời phỏng vấn thể lực:
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed italic">"{app.answer}"</p>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {app.meta}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedApp(app)}
                  className="rounded-full border border-border px-3 py-1.5 font-bold text-foreground hover:bg-muted"
                >
                  Xem chi tiết hồ sơ
                </button>
                <button
                  type="button"
                  onClick={() => handleReject(app.id)}
                  className="rounded-full border border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 px-3 py-1.5 font-bold hover:bg-rose-100"
                >
                  <XCircle className="h-3.5 w-3.5 inline mr-1" /> Từ chối
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(app.id)}
                  className="rounded-full bg-emerald-600 text-white px-4 py-1.5 font-bold hover:bg-emerald-700 shadow-xs"
                >
                  <UserCheck className="h-3.5 w-3.5 inline mr-1" /> Chấp nhận ứng viên
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Applicant Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-extrabold text-foreground">
                Chi tiết ứng viên {selectedApp.applicantName}
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
                  <p className="text-emerald-700 font-bold">
                    Đã hoàn thành {selectedApp.tripsCount} chuyến đi C2C
                  </p>
                </div>
              </div>

              <div className="space-y-2 rounded-xl bg-background p-4 border border-border">
                <strong className="block text-foreground font-bold">Kinh nghiệm leo núi:</strong>
                <p className="text-muted-foreground leading-relaxed">{selectedApp.experience}</p>
              </div>

              <div className="space-y-2 rounded-xl bg-background p-4 border border-border">
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
              <button
                type="button"
                onClick={() => {
                  handleApprove(selectedApp.id);
                  setSelectedApp(null);
                }}
                className="rounded-full bg-emerald-600 text-white px-5 py-2 text-xs font-bold hover:bg-emerald-700"
              >
                Duyệt vào nhóm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
