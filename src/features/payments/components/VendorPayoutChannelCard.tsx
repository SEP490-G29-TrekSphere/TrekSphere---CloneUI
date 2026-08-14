import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, ChevronRight, ExternalLink, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { paymentService } from '@/features/payments/services/paymentService';
import { AppCard } from '@/shared/ui';
import { toast } from '@/store/useToastStore';

const payoutSchema = z.object({
  clientId: z.string().trim().min(3, 'Vui lòng nhập Client ID của Kênh Chi.'),
  apiKey: z.string().trim().min(3, 'Vui lòng nhập API Key của Kênh Chi.'),
  checksumKey: z.string().trim().min(3, 'Vui lòng nhập Checksum Key của Kênh Chi.'),
});

type PayoutValues = z.infer<typeof payoutSchema>;

const INPUT_CLASS =
  'mt-2 w-full rounded-2xl border border-[#D9D4C6] bg-[#FBF8F0] px-4 py-3 text-sm font-semibold text-[#1E3932] outline-none transition-colors placeholder:text-[#9BA39F] focus:border-[#006241] focus:bg-white focus:ring-2 focus:ring-[#006241]/10';

export function VendorPayoutChannelCard() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const payoutQuery = useQuery({
    queryKey: ['vendor-payout-account'],
    queryFn: paymentService.getPayoutAccount,
    retry: false,
  });
  const form = useForm<PayoutValues>({
    resolver: zodResolver(payoutSchema),
    defaultValues: { clientId: '', apiKey: '', checksumKey: '' },
  });

  useEffect(() => {
    if (!payoutQuery.data) return;
    form.reset({
      clientId: payoutQuery.data.clientId ?? '',
      apiKey: '',
      checksumKey: '',
    });
  }, [form, payoutQuery.data]);

  const mutation = useMutation({
    mutationFn: paymentService.configurePayoutAccount,
    onSuccess: (account) => {
      queryClient.setQueryData(['vendor-payout-account'], account);
      form.reset({ clientId: account.clientId ?? '', apiKey: '', checksumKey: '' });
      setEditing(false);
      toast.success('Kênh Chi đã được xác minh. Refund đủ điều kiện sẽ được chi tự động.');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const active = payoutQuery.data?.status === 'ACTIVE';

  return (
    <AppCard className="overflow-hidden rounded-[28px] border-[#DED9CA] bg-white p-0 shadow-[0_10px_35px_rgba(30,57,50,0.06)]">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center gap-3 bg-[#FBF8F0] p-5 transition-colors hover:bg-[#F6F2E8] sm:p-6 [&::-webkit-details-marker]:hidden">
          <ChevronRight className="h-5 w-5 shrink-0 text-[#006241] transition-transform group-open:rotate-90" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#6F7E72]">
              Không bắt buộc
            </p>
            <h2 className="mt-0.5 text-lg font-extrabold text-[#1E3932]">
              Tự động chuyển tiền hoàn
            </h2>
            <p className="mt-1 text-xs font-medium leading-relaxed text-[#6F7E72]">
              Mở rộng để cấu hình Kênh Chi payOS cho hoàn tiền tự động.
            </p>
          </div>
          <span
            className={`hidden shrink-0 rounded-full px-3 py-1 text-[10px] font-extrabold sm:inline-flex ${
              active ? 'bg-emerald-100 text-emerald-800' : 'bg-[#EAE6DC] text-[#6F7E72]'
            }`}
          >
            {active ? 'Đang hoạt động' : 'Manual-first'}
          </span>
        </summary>

        <form
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          className="space-y-5 border-t border-[#EAE6DC] p-5 sm:p-6"
        >
          {active && !editing ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#BBD8C7] bg-[#F1F8F4] p-4">
                <p className="flex items-center gap-2 text-sm font-extrabold text-[#006241]">
                  <BadgeCheck className="h-5 w-5" /> Kênh Chi đã xác minh
                </p>
                <dl className="mt-4 space-y-3 text-xs">
                  <div>
                    <dt className="font-bold text-[#6F7E72]">Tài khoản chi tiền</dt>
                    <dd className="mt-1 font-semibold text-[#1E3932]">
                      {payoutQuery.data?.accountName || 'Đã xác minh'} ·{' '}
                      {payoutQuery.data?.maskedAccountNumber || 'Đã ẩn'}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold text-[#6F7E72]">Client ID</dt>
                    <dd className="mt-1 break-all font-semibold text-[#1E3932]">
                      {payoutQuery.data?.clientId}
                    </dd>
                  </div>
                </dl>
              </div>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex w-full items-center justify-center rounded-full border border-[#006241] px-5 py-3 text-sm font-extrabold text-[#006241] hover:bg-[#F0F7F3]"
              >
                Cập nhật Kênh Chi
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                <label className="text-xs font-extrabold text-[#1E3932]">
                  Client ID
                  <input
                    {...form.register('clientId')}
                    autoComplete="off"
                    placeholder="Dán Client ID của Kênh Chi payOS"
                    className={INPUT_CLASS}
                  />
                  {form.formState.errors.clientId && (
                    <span className="mt-1 block text-[11px] text-red-600">
                      {form.formState.errors.clientId.message}
                    </span>
                  )}
                </label>
                <label className="text-xs font-extrabold text-[#1E3932]">
                  API Key
                  <input
                    type="password"
                    {...form.register('apiKey')}
                    autoComplete="new-password"
                    placeholder="Dán API Key của Kênh Chi payOS"
                    className={INPUT_CLASS}
                  />
                  {form.formState.errors.apiKey && (
                    <span className="mt-1 block text-[11px] text-red-600">
                      {form.formState.errors.apiKey.message}
                    </span>
                  )}
                </label>
                <label className="text-xs font-extrabold text-[#1E3932]">
                  Checksum Key
                  <input
                    type="password"
                    {...form.register('checksumKey')}
                    autoComplete="new-password"
                    placeholder="Dán Checksum Key của Kênh Chi payOS"
                    className={INPUT_CLASS}
                  />
                  {form.formState.errors.checksumKey && (
                    <span className="mt-1 block text-[11px] text-red-600">
                      {form.formState.errors.checksumKey.message}
                    </span>
                  )}
                </label>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-bold">
                <a
                  href="https://payos.vn/docs/huong-dan-su-dung/tao-kenh-chuyen-tien/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#50645B] underline underline-offset-4"
                >
                  Hướng dẫn tạo Kênh Chi <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#006241] px-5 py-3 text-sm font-extrabold text-white hover:bg-[#004F35] disabled:opacity-60"
              >
                {mutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <BadgeCheck className="h-4 w-4" />
                )}
                Lưu và kiểm tra Kênh Chi
              </button>
              {active && (
                <button
                  type="button"
                  onClick={() => {
                    form.reset({
                      clientId: payoutQuery.data?.clientId ?? '',
                      apiKey: '',
                      checksumKey: '',
                    });
                    setEditing(false);
                  }}
                  className="w-full text-center text-xs font-bold text-[#6F7E72]"
                >
                  Hủy cập nhật
                </button>
              )}
            </>
          )}
        </form>
      </details>
    </AppCard>
  );
}
