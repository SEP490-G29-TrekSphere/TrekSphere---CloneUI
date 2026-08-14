import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Clock3, ExternalLink, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { adminRefundService } from '@/features/admin/services/adminRefundService';
import type { RefundTransaction } from '@/features/payments/types';
import { toast } from '@/store/useToastStore';

function money(value: number): string {
  return `${value.toLocaleString('vi-VN')}đ`;
}

function dateTime(value?: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(value)
  );
}

function statusLabel(status: RefundTransaction['status']): string {
  if (status === 'MANUAL_REVIEW') return 'Chờ xác minh';
  if (status === 'OVERDUE') return 'Quá hạn';
  return status;
}

export default function RefundReviews() {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const refunds = useQuery({
    queryKey: ['admin-refunds'],
    queryFn: () => adminRefundService.getRefunds(),
  });
  const review = useMutation({
    mutationFn: ({
      refundId,
      approved,
      note,
    }: {
      refundId: string;
      approved: boolean;
      note: string;
    }) => adminRefundService.reviewManualRefund(refundId, approved, note),
    onSuccess: (refund) => {
      toast.success(
        refund.status === 'REFUNDED'
          ? 'Đã xác nhận hoàn tiền.'
          : 'Đã trả yêu cầu về cho vendor xử lý lại.'
      );
      setNotes((current) => ({ ...current, [refund.refundTransactionId]: '' }));
      queryClient.invalidateQueries({ queryKey: ['admin-refunds'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const items = refunds.data ?? [];
  const reviewCount = items.filter((item) => item.status === 'MANUAL_REVIEW').length;
  const overdueCount = items.filter((item) => item.status === 'OVERDUE').length;

  function submit(refund: RefundTransaction, approved: boolean) {
    const note = notes[refund.refundTransactionId]?.trim();
    if (!note) {
      toast.error('Vui lòng nhập ghi chú đối soát trước khi xác nhận.');
      return;
    }
    review.mutate({ refundId: refund.refundTransactionId, approved, note });
  }

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-zinc-500">
            Đối soát tài chính
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#0B3025]">
            Duyệt hoàn tiền thủ công
          </h1>
          <p className="mt-2 text-sm font-medium text-zinc-600">
            Chỉ xác nhận sau khi mã giao dịch, số tiền và biên nhận đều khớp.
          </p>
        </div>
        <div className="flex gap-2 text-xs font-extrabold">
          <span className="rounded-full bg-sky-100 px-3 py-2 text-sky-800">
            {reviewCount} chờ duyệt
          </span>
          <span className="rounded-full bg-red-100 px-3 py-2 text-red-700">
            {overdueCount} quá hạn
          </span>
        </div>
      </header>

      {refunds.isLoading && (
        <div className="flex min-h-48 items-center justify-center rounded-3xl bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-[#0B3025]" />
        </div>
      )}

      {refunds.isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          Không thể tải danh sách refund: {(refunds.error as Error).message}
        </div>
      )}

      {!refunds.isLoading && !refunds.isError && items.length === 0 && (
        <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
          <p className="mt-3 font-bold text-zinc-700">Không có refund cần đối soát.</p>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {items.map((refund) => {
          const pending =
            review.isPending && review.variables?.refundId === refund.refundTransactionId;
          const canReview = refund.status === 'MANUAL_REVIEW';
          return (
            <article
              key={refund.refundTransactionId}
              className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-zinc-500">
                    Booking {refund.bookingCode || refund.bookingId}
                  </p>
                  <h2 className="mt-1 text-xl font-extrabold text-[#0B3025]">
                    {money(refund.amount)}
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-zinc-600">
                    {refund.vendorName || 'Vendor'} · {refund.destinationBin || 'Chưa có BIN'} ·{' '}
                    {refund.destinationAccountNumber ||
                      refund.maskedDestinationAccountNumber ||
                      'Chưa có STK'}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold ${
                    canReview ? 'bg-sky-100 text-sky-800' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {canReview ? (
                    <Clock3 className="h-3.5 w-3.5" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  )}
                  {statusLabel(refund.status)}
                </span>
              </div>

              <dl className="mt-4 grid gap-3 rounded-2xl bg-zinc-50 p-4 text-xs sm:grid-cols-2">
                <div>
                  <dt className="font-bold text-zinc-500">Mã giao dịch ngân hàng</dt>
                  <dd className="mt-1 break-all font-extrabold text-zinc-800">
                    {refund.manualBankReference || 'Chưa gửi'}
                  </dd>
                </div>
                <div>
                  <dt className="font-bold text-zinc-500">Thời điểm gửi biên nhận</dt>
                  <dd className="mt-1 font-extrabold text-zinc-800">
                    {dateTime(refund.manualSubmittedAt)}
                  </dd>
                </div>
                <div>
                  <dt className="font-bold text-zinc-500">Người nhận</dt>
                  <dd className="mt-1 font-extrabold text-zinc-800">
                    {refund.destinationAccountName || 'Chưa cập nhật'}
                  </dd>
                </div>
                <div>
                  <dt className="font-bold text-zinc-500">Hạn vendor xử lý</dt>
                  <dd className="mt-1 font-extrabold text-zinc-800">{dateTime(refund.dueAt)}</dd>
                </div>
              </dl>

              {refund.manualReceiptUrl ? (
                <a
                  href={refund.manualReceiptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-xs font-extrabold text-[#006241]"
                >
                  <img
                    src={refund.manualReceiptUrl}
                    alt="Biên nhận hoàn tiền"
                    className="h-24 w-24 rounded-xl object-cover"
                  />
                  Xem ảnh biên nhận đầy đủ <ExternalLink className="h-4 w-4" />
                </a>
              ) : (
                <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-xs font-semibold text-amber-800">
                  Vendor chưa gửi ảnh biên nhận.
                </p>
              )}

              {canReview && (
                <div className="mt-4 space-y-3 border-t border-zinc-200 pt-4">
                  <label className="block text-xs font-bold text-zinc-700">
                    Ghi chú đối soát
                    <textarea
                      value={notes[refund.refundTransactionId] ?? ''}
                      onChange={(event) =>
                        setNotes((current) => ({
                          ...current,
                          [refund.refundTransactionId]: event.target.value,
                        }))
                      }
                      maxLength={500}
                      rows={3}
                      placeholder="Ví dụ: Đã đối chiếu đúng số tiền và mã giao dịch..."
                      className="mt-2 w-full resize-none rounded-2xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[#006241]"
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => submit(refund, true)}
                      className="inline-flex items-center gap-2 rounded-full bg-[#006241] px-4 py-2 text-xs font-extrabold text-white disabled:opacity-60"
                    >
                      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Xác nhận đã hoàn
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => submit(refund, false)}
                      className="rounded-full border border-red-300 px-4 py-2 text-xs font-extrabold text-red-700 disabled:opacity-60"
                    >
                      Từ chối biên nhận
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
