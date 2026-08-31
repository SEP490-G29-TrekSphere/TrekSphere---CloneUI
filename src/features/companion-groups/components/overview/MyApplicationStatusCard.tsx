import { AlertCircle, Check, CheckCircle2, Clock, Send, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { applicationRows } from '../../data/groupMatchingMocks';
import type { ApplicationState, PreviewView, ReviewActor } from '../../types/groupMatchingTypes';

interface MyApplicationStatusCardProps {
  applicationState: ApplicationState;
  actor: ReviewActor;
  onSetApplicationState: (state: ApplicationState) => void;
  onNavigateView?: (view: PreviewView) => void;
}

const TERMINAL_STATES: ApplicationState[] = [
  'REJECTED',
  'WITHDRAWN',
  'OFFER_DECLINED',
  'OFFER_EXPIRED',
];

const STEP_LABELS = ['Đã nộp đơn', 'Leader xem xét / Hàng chờ', 'Kết quả'];

function getStepIndex(state: ApplicationState): number {
  switch (state) {
    case 'APPLIED':
      return 0;
    case 'WAITLISTED':
    case 'SLOT_OFFERED':
      return 1;
    case 'ACCEPTED':
      return 2;
    default:
      return -1; // terminal / negative outcome — không đi theo happy path stepper
  }
}

export function MyApplicationStatusCard({
  applicationState,
  actor,
  onSetApplicationState,
  onNavigateView,
}: MyApplicationStatusCardProps) {
  // Demo mock: lấy nội dung đơn (nhóm, lời nhắn) từ đúng dòng self-service trong mock data.
  const myApp = applicationRows.find((a) => a.isSelf) ?? applicationRows[0];
  const stepIndex = getStepIndex(applicationState);
  const isTerminalNegative = TERMINAL_STATES.includes(applicationState);

  const handleWithdraw = () => onSetApplicationState('WITHDRAWN');
  const handleAcceptOffer = () => onSetApplicationState('ACCEPTED');
  const handleDeclineOffer = () => onSetApplicationState('OFFER_DECLINED');

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-6">
        {/* Header */}
        <div className="space-y-1 border-b border-border pb-4">
          <h3 className="text-base font-extrabold text-foreground">Đơn ứng tuyển của bạn</h3>
          <p className="text-xs text-muted-foreground">{myApp.group}</p>
        </div>

        {/* Stepper — chỉ hiện khi còn trên happy path */}
        {!isTerminalNegative && (
          <div className="flex items-center">
            {STEP_LABELS.map((label, idx) => {
              const isDone =
                idx < stepIndex || (idx === stepIndex && applicationState === 'ACCEPTED');
              const isActive = idx === stepIndex && applicationState !== 'ACCEPTED';
              return (
                <div key={label} className="flex-1 flex items-center last:flex-none">
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-black transition',
                        isDone
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : isActive
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-muted text-muted-foreground'
                      )}
                    >
                      {isDone ? <Check className="h-4 w-4" /> : idx + 1}
                    </div>
                    <span
                      className={cn(
                        'text-[10px] font-bold max-w-20 leading-tight',
                        isDone || isActive ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {label}
                    </span>
                  </div>
                  {idx < STEP_LABELS.length - 1 && (
                    <div
                      className={cn(
                        'h-0.5 flex-1 mx-1.5 mb-4 rounded-full transition',
                        idx < stepIndex ? 'bg-emerald-500' : 'bg-border'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Status banner */}
        {applicationState === 'APPLIED' && (
          <div className="rounded-2xl bg-blue-500/10 border border-blue-500/30 p-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-blue-600 shrink-0" />
            <div>
              <p className="text-xs font-extrabold text-blue-700 dark:text-blue-400">
                Đơn đang chờ Trưởng nhóm duyệt
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{myApp.meta}</p>
            </div>
          </div>
        )}

        {applicationState === 'WAITLISTED' && (
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-extrabold text-amber-700 dark:text-amber-300">
                Bạn đang trong Danh sách chờ (Waitlist #1)
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Hệ thống sẽ tự gửi Slot Offer nếu có chỗ trống — không cần nộp lại đơn.
              </p>
            </div>
          </div>
        )}

        {applicationState === 'SLOT_OFFERED' && (
          <div className="rounded-2xl bg-primary/10 border border-primary/30 p-4 space-y-1">
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary shrink-0 animate-pulse" />
              <p className="text-xs font-extrabold text-primary">Bạn có một Slot Offer!</p>
            </div>
            <p className="text-[11px] text-muted-foreground pl-7">{myApp.meta}</p>
          </div>
        )}

        {applicationState === 'ACCEPTED' && (
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <p className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
              Chúc mừng! Bạn đã là thành viên chính thức của nhóm.
            </p>
          </div>
        )}

        {applicationState === 'REJECTED' && (
          <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4 flex items-center gap-3">
            <XCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <p className="text-xs font-extrabold text-rose-700 dark:text-rose-400">
              Đơn của bạn đã bị từ chối.
            </p>
          </div>
        )}

        {(applicationState === 'WITHDRAWN' || applicationState === 'OFFER_DECLINED') && (
          <div className="rounded-2xl bg-slate-500/10 border border-slate-500/30 p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0" />
            <p className="text-xs font-extrabold text-muted-foreground">
              {applicationState === 'WITHDRAWN'
                ? 'Bạn đã rút đơn ứng tuyển.'
                : 'Bạn đã từ chối Slot Offer.'}
            </p>
          </div>
        )}

        {applicationState === 'OFFER_EXPIRED' && (
          <div className="rounded-2xl bg-slate-500/10 border border-slate-500/30 p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0" />
            <p className="text-xs font-extrabold text-muted-foreground">
              Slot Offer đã hết hạn phản hồi trong 24h.
            </p>
          </div>
        )}

        {/* Lời nhắn đã gửi (read-only) */}
        <div className="rounded-2xl bg-background border border-border p-3.5 space-y-1">
          <span className="text-[11px] font-extrabold text-foreground uppercase tracking-wider">
            Lời nhắn bạn đã gửi Trưởng nhóm:
          </span>
          <p className="text-xs text-muted-foreground leading-relaxed italic">"{myApp.answer}"</p>
        </div>

        {/* Actions theo state */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border">
          {applicationState === 'SLOT_OFFERED' && (
            <>
              <button
                type="button"
                onClick={handleDeclineOffer}
                className="rounded-full border border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 px-4 py-2 text-xs font-bold hover:bg-rose-100 transition"
              >
                Từ chối
              </button>
              <button
                type="button"
                onClick={handleAcceptOffer}
                className="rounded-full bg-emerald-600 text-white px-5 py-2 text-xs font-extrabold hover:bg-emerald-700 shadow-xs transition"
              >
                <CheckCircle2 className="h-3.5 w-3.5 inline mr-1" /> Chấp nhận tham gia
              </button>
            </>
          )}

          {(applicationState === 'APPLIED' || applicationState === 'WAITLISTED') && (
            <button
              type="button"
              onClick={handleWithdraw}
              className="rounded-full border border-border bg-background px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted transition"
            >
              Rút đơn
            </button>
          )}

          {onNavigateView && (
            <button
              type="button"
              onClick={() => onNavigateView('outsider-detail')}
              className="rounded-full border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition ml-auto"
            >
              Xem chi tiết nhóm
            </button>
          )}
        </div>
      </div>

      <p className="text-center text-[11px] text-muted-foreground">
        Góc nhìn:{' '}
        {actor === 'WAITLISTED_APPLICANT' ? 'Ứng viên trong Waitlist' : 'Ứng viên mới đăng ký'} ·
        Bạn chỉ xem được đơn của chính mình.
      </p>
    </div>
  );
}

export default MyApplicationStatusCard;
