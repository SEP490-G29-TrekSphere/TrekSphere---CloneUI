import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronsUpDown,
  Clock3,
  CreditCard,
  ExternalLink,
  Info,
  Landmark,
  Loader2,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { paymentService } from '@/features/payments/services/paymentService';
import type { DepositType, TourPaymentPolicyPayload } from '@/features/payments/types';
import { VendorCancellationPolicyCard } from '@/features/vendor-cancellation-policies';
import { useVendorTourList } from '@/features/vendor-tours/hooks/useVendorTourList';
import { AppCard } from '@/shared/ui';
import { toast } from '@/store/useToastStore';

const accountSchema = z.object({
  clientId: z.string().trim().min(3, 'Vui lòng nhập Client ID của kênh payOS.'),
  apiKey: z.string().trim().min(3, 'Vui lòng nhập API Key của kênh payOS.'),
  checksumKey: z.string().trim().min(3, 'Vui lòng nhập Checksum Key của kênh payOS.'),
});

const policySchema = z
  .object({
    paymentOption: z.enum(['FULL_PAYMENT_ONLY', 'DEPOSIT_ONLY', 'FULL_OR_DEPOSIT']),
    depositType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']).optional(),
    depositValue: z.coerce.number().optional(),
    remainingDueDaysBeforeDeparture: z.coerce.number().int().min(0).optional(),
  })
  .superRefine((values, context) => {
    if (values.paymentOption === 'FULL_PAYMENT_ONLY') return;
    if (!values.depositType) {
      context.addIssue({ code: 'custom', path: ['depositType'], message: 'Chọn cách tính cọc.' });
    }
    if (!values.depositValue || values.depositValue <= 0) {
      context.addIssue({
        code: 'custom',
        path: ['depositValue'],
        message: 'Giá trị cọc phải lớn hơn 0.',
      });
    }
    if (
      values.depositType === 'PERCENTAGE' &&
      values.depositValue != null &&
      values.depositValue >= 100
    ) {
      context.addIssue({
        code: 'custom',
        path: ['depositValue'],
        message: 'Tỷ lệ cọc phải nhỏ hơn 100%.',
      });
    }
    if (values.remainingDueDaysBeforeDeparture == null) {
      context.addIssue({
        code: 'custom',
        path: ['remainingDueDaysBeforeDeparture'],
        message: 'Nhập hạn thanh toán phần còn lại.',
      });
    }
  });

type AccountValues = z.infer<typeof accountSchema>;
type PolicyValues = z.infer<typeof policySchema>;
type PolicyInput = z.input<typeof policySchema>;

const INPUT_CLASS =
  'mt-2 w-full rounded-2xl border border-[#D9D4C6] bg-[#FBF8F0] px-4 py-3 text-sm font-semibold text-[#1E3932] outline-none transition-colors placeholder:text-[#9BA39F] focus:border-[#006241] focus:bg-white focus:ring-2 focus:ring-[#006241]/10';

export default function VendorPaymentSettings() {
  const queryClient = useQueryClient();
  const [selectedTourId, setSelectedTourId] = useState('');
  const [tourPickerOpen, setTourPickerOpen] = useState(false);
  const [editingPayOs, setEditingPayOs] = useState(false);
  const toursQuery = useVendorTourList({}, 1, 100);
  const tours = toursQuery.data?.tours ?? [];
  const selectedTour = tours.find((tour) => tour.id === selectedTourId);

  const accountQuery = useQuery({
    queryKey: ['vendor-payos-account'],
    queryFn: paymentService.getPayOsAccount,
    retry: false,
  });
  const policyQuery = useQuery({
    queryKey: ['tour-payment-policy', selectedTourId],
    queryFn: () => paymentService.getTourPaymentPolicy(selectedTourId),
    enabled: Boolean(selectedTourId),
    retry: false,
  });

  const accountForm = useForm<AccountValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: { clientId: '', apiKey: '', checksumKey: '' },
  });
  const policyForm = useForm<PolicyInput, unknown, PolicyValues>({
    resolver: zodResolver(policySchema),
    defaultValues: { paymentOption: 'FULL_PAYMENT_ONLY' },
  });
  const paymentOption = policyForm.watch('paymentOption');
  const depositType = policyForm.watch('depositType');
  const depositValue = policyForm.watch('depositValue');
  const remainingDueDays = policyForm.watch('remainingDueDaysBeforeDeparture');

  useEffect(() => {
    if (!selectedTourId && tours.length > 0) setSelectedTourId(tours[0].id);
  }, [selectedTourId, tours]);

  useEffect(() => {
    if (accountQuery.data) {
      accountForm.reset({ clientId: accountQuery.data.clientId, apiKey: '', checksumKey: '' });
    }
  }, [accountForm, accountQuery.data]);

  useEffect(() => {
    const policy = policyQuery.data;
    if (!policy) {
      policyForm.reset({ paymentOption: 'FULL_PAYMENT_ONLY' });
      return;
    }
    policyForm.reset({
      paymentOption: policy.paymentOption,
      depositType: policy.depositType ?? undefined,
      depositValue: policy.depositValue ?? undefined,
      remainingDueDaysBeforeDeparture: policy.remainingDueDaysBeforeDeparture ?? undefined,
    });
  }, [policyForm, policyQuery.data]);

  const accountMutation = useMutation({
    mutationFn: (values: AccountValues) => paymentService.configurePayOsAccount(values),
    onSuccess: (account) => {
      queryClient.setQueryData(['vendor-payos-account'], account);
      accountForm.reset({ clientId: account.clientId, apiKey: '', checksumKey: '' });
      setEditingPayOs(false);
      toast.success('Đã kết nối kênh payOS và bật xác nhận tự động.');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const policyMutation = useMutation({
    mutationFn: (values: PolicyValues) => {
      const payload: TourPaymentPolicyPayload =
        values.paymentOption === 'FULL_PAYMENT_ONLY'
          ? { paymentOption: values.paymentOption }
          : {
              paymentOption: values.paymentOption,
              depositType: values.depositType,
              depositValue: values.depositValue,
              remainingDueDaysBeforeDeparture: values.remainingDueDaysBeforeDeparture,
            };
      return paymentService.updateTourPaymentPolicy(selectedTourId, payload);
    },
    onSuccess: (policy) => {
      queryClient.setQueryData(['tour-payment-policy', selectedTourId], policy);
      queryClient.invalidateQueries({ queryKey: ['tour-detail', selectedTourId] });
      toast.success(`Đã lưu policy phiên bản ${policy.policyVersion}.`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const accountActive = accountQuery.data?.status === 'ACTIVE';

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#6F7E72]">
            Tài chính & chính sách
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#1E3932]">
            Cấu hình thanh toán
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-[#6F7E72]">
            Kết nối kênh payOS, chọn cách khách thanh toán và thiết lập quyền lợi hoàn tiền cho từng
            tour.
          </p>
        </div>
        <span
          className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold ${
            accountActive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}
        >
          {accountActive ? <CheckCircle2 className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
          {accountActive ? 'payOS đã kết nối' : 'Chưa kết nối payOS'}
        </span>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <AppCard className="overflow-hidden rounded-[28px] border-[#DED9CA] bg-white p-0 shadow-[0_10px_35px_rgba(30,57,50,0.06)]">
          <div className="border-b border-[#EAE6DC] bg-[#FBF8F0] p-5 sm:p-6">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#6F7E72]">
              Bước 1
            </p>
            <h2 className="mt-0.5 text-lg font-extrabold text-[#1E3932]">
              Kết nối kênh nhận thanh toán
            </h2>
            <p className="mt-1 text-xs font-medium leading-relaxed text-[#6F7E72]">
              Khách thanh toán qua payOS; tiền về tài khoản ngân hàng được liên kết với kênh này.
            </p>
          </div>

          <form
            onSubmit={accountForm.handleSubmit((values) => accountMutation.mutate(values))}
            className="space-y-5 p-5 sm:p-6"
          >
            {accountActive && !editingPayOs ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-[#BBD8C7] bg-[#F1F8F4] p-4">
                  <p className="flex items-center gap-2 text-sm font-extrabold text-[#006241]">
                    <BadgeCheck className="h-5 w-5" /> Kênh payOS đang hoạt động
                  </p>
                  <dl className="mt-4 space-y-3 text-xs">
                    <div>
                      <dt className="font-bold text-[#6F7E72]">Client ID</dt>
                      <dd className="mt-1 break-all font-semibold text-[#1E3932]">
                        {accountQuery.data?.clientId}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-bold text-[#6F7E72]">API Key và Checksum Key</dt>
                      <dd className="mt-1 font-semibold text-[#1E3932]">
                        Đã lưu mã hóa · Không thể xem lại trên TrekSphere
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-2xl border border-[#E1DDCF] bg-[#FBF8F0] p-4">
                  <p className="flex items-start gap-2 text-[11px] font-medium leading-relaxed text-[#56655F]">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#006241]" />
                    Tiền thanh toán đi thẳng vào tài khoản ngân hàng liên kết với kênh payOS của
                    doanh nghiệp. TrekSphere không nhận hoặc giữ tiền của bạn.
                  </p>
                </div>

                {accountQuery.data?.webhookUrl && (
                  <details className="rounded-2xl border border-[#DDE8E1] bg-[#F1F7F3] p-4 text-[10px] text-[#547065]">
                    <summary className="cursor-pointer font-bold">Xem địa chỉ webhook</summary>
                    <p className="mt-2 break-all font-medium">{accountQuery.data.webhookUrl}</p>
                  </details>
                )}

                <button
                  type="button"
                  onClick={() => setEditingPayOs(true)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#006241] px-5 py-3 text-sm font-extrabold text-[#006241] transition-colors hover:bg-[#F0F7F3]"
                >
                  Cập nhật kết nối payOS
                </button>
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-[#DDE8E1] bg-[#F5FAF7] p-4">
                  <p className="text-xs font-extrabold text-[#1E3932]">Chuẩn bị trong 3 bước</p>
                  <ol className="mt-3 space-y-2 text-[11px] font-medium leading-relaxed text-[#56655F]">
                    <li>1. Đăng nhập payOS và tạo một kênh thanh toán cho doanh nghiệp.</li>
                    <li>2. Chọn tài khoản ngân hàng sẽ nhận tiền từ khách.</li>
                    <li>3. Sao chép bộ ba khóa tích hợp bên dưới để TrekSphere kết nối.</li>
                  </ol>
                  <p className="mt-3 flex items-start gap-2 text-[10px] font-semibold leading-relaxed text-[#006241]">
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    API Key và Checksum Key được mã hóa trước khi lưu và không được hiển thị lại.
                  </p>
                </div>

                <div className="grid gap-4">
                  <label className="block text-xs font-extrabold text-[#1E3932]">
                    Client ID của kênh payOS
                    <input
                      {...accountForm.register('clientId')}
                      autoComplete="off"
                      placeholder="Dán Client ID từ kênh thanh toán payOS"
                      className={INPUT_CLASS}
                    />
                    {accountForm.formState.errors.clientId && (
                      <span className="mt-1 block text-[11px] text-red-600">
                        {accountForm.formState.errors.clientId.message}
                      </span>
                    )}
                  </label>

                  <label className="block text-xs font-extrabold text-[#1E3932]">
                    API Key của kênh payOS
                    <input
                      type="password"
                      {...accountForm.register('apiKey')}
                      autoComplete="new-password"
                      placeholder={
                        accountQuery.data?.credentialsConfigured
                          ? 'Nhập lại API Key để thay đổi kết nối'
                          : 'Dán API Key từ kênh thanh toán payOS'
                      }
                      className={INPUT_CLASS}
                    />
                    {accountForm.formState.errors.apiKey && (
                      <span className="mt-1 block text-[11px] text-red-600">
                        {accountForm.formState.errors.apiKey.message}
                      </span>
                    )}
                  </label>

                  <label className="block text-xs font-extrabold text-[#1E3932]">
                    Checksum Key của kênh payOS
                    <input
                      type="password"
                      {...accountForm.register('checksumKey')}
                      autoComplete="new-password"
                      placeholder={
                        accountQuery.data?.credentialsConfigured
                          ? 'Nhập lại Checksum Key để thay đổi kết nối'
                          : 'Dán Checksum Key từ kênh thanh toán payOS'
                      }
                      className={INPUT_CLASS}
                    />
                    {accountForm.formState.errors.checksumKey && (
                      <span className="mt-1 block text-[11px] text-red-600">
                        {accountForm.formState.errors.checksumKey.message}
                      </span>
                    )}
                  </label>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-bold">
                  <a
                    href="https://my.payos.vn"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#006241] underline decoration-[#9CBFAD] underline-offset-4 hover:decoration-[#006241]"
                  >
                    Mở trang quản trị payOS <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href="https://payos.vn/docs/huong-dan-su-dung/tao-kenh-thanh-toan/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#50645B] underline decoration-[#C8C3B6] underline-offset-4 hover:text-[#1E3932]"
                  >
                    Xem hướng dẫn tạo kênh và lấy bộ khóa tích hợp
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                <div className="rounded-2xl border border-[#E1DDCF] bg-[#FBF8F0] p-4">
                  <div className="flex items-start gap-3">
                    <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-[#1E3932]" />
                    <div>
                      <p className="text-xs font-extrabold text-[#1E3932]">
                        Tài khoản ngân hàng nào sẽ nhận tiền?
                      </p>
                      <p className="mt-1 text-[11px] font-medium leading-relaxed text-[#6F7E72]">
                        Là tài khoản đã xác minh mà bạn chọn khi tạo kênh trên payOS. TrekSphere
                        không lưu số tài khoản hoặc mã QR riêng trong hồ sơ Vendor.
                      </p>
                    </div>
                  </div>
                </div>

                {accountQuery.data?.webhookUrl && (
                  <div className="rounded-2xl border border-[#DDE8E1] bg-[#F1F7F3] p-4">
                    <p className="flex items-center gap-2 text-xs font-extrabold text-[#006241]">
                      <ShieldCheck className="h-4 w-4" /> Kênh xác nhận tự động đã sẵn sàng
                    </p>
                    <p className="mt-1.5 text-[11px] font-medium leading-relaxed text-[#547065]">
                      Khi khách thanh toán thành công, trạng thái booking sẽ được cập nhật tự động.
                    </p>
                    <details className="mt-2 text-[10px] text-[#547065]">
                      <summary className="w-fit cursor-pointer font-bold underline underline-offset-2">
                        Xem địa chỉ kết nối kỹ thuật
                      </summary>
                      <p className="mt-1.5 break-all font-medium">{accountQuery.data.webhookUrl}</p>
                    </details>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={accountMutation.isPending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#006241] px-5 py-3 text-sm font-extrabold text-white transition-colors hover:bg-[#004F35] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {accountMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <BadgeCheck className="h-4 w-4" />
                  )}
                  Lưu và kiểm tra kết nối
                </button>
                {accountActive && (
                  <button
                    type="button"
                    onClick={() => {
                      accountForm.reset({
                        clientId: accountQuery.data?.clientId ?? '',
                        apiKey: '',
                        checksumKey: '',
                      });
                      setEditingPayOs(false);
                    }}
                    className="w-full text-center text-xs font-bold text-[#6F7E72] hover:text-[#1E3932]"
                  >
                    Hủy cập nhật
                  </button>
                )}
              </>
            )}
          </form>
        </AppCard>

        <AppCard className="overflow-hidden rounded-[28px] border-[#DED9CA] bg-white p-0 shadow-[0_10px_35px_rgba(30,57,50,0.06)]">
          <div className="border-b border-[#EAE6DC] bg-[#FBF8F0] p-5 sm:p-6">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#6F7E72]">
              Bước 2
            </p>
            <h2 className="mt-0.5 text-lg font-extrabold text-[#1E3932]">
              Phương thức thanh toán theo tour
            </h2>
            <p className="mt-1 text-xs font-medium text-[#6F7E72]">
              Chọn tour, sau đó quy định khách trả một lần hay chia thành hai đợt.
            </p>
          </div>

          <form
            onSubmit={policyForm.handleSubmit((values) => policyMutation.mutate(values))}
            className="space-y-6 p-5 sm:p-6"
          >
            <div>
              <p className="text-xs font-extrabold text-[#1E3932]">Tour áp dụng</p>
              <Popover open={tourPickerOpen} onOpenChange={setTourPickerOpen}>
                <PopoverTrigger
                  disabled={toursQuery.isLoading || tours.length === 0}
                  aria-label="Chọn tour áp dụng chính sách thanh toán"
                  className="mt-2 flex w-full items-center justify-between gap-3 rounded-2xl border border-[#D9D4C6] bg-[#FBF8F0] px-4 py-3 text-left text-sm font-semibold text-[#1E3932] outline-none transition-colors hover:border-[#B9CFC3] focus:border-[#006241] focus:ring-2 focus:ring-[#006241]/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="min-w-0 truncate">
                    {toursQuery.isLoading
                      ? 'Đang tải danh sách tour...'
                      : selectedTour?.name || 'Chưa có tour để cấu hình'}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 text-[#6F7E72]" />
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  sideOffset={6}
                  className="w-(--anchor-width) max-w-[calc(100vw-2rem)] gap-0 overflow-hidden rounded-2xl border border-[#D9D4C6] bg-white p-0 shadow-xl"
                >
                  <Command className="rounded-2xl! bg-white p-0">
                    <CommandInput placeholder="Tìm tour theo tên..." className="h-10" />
                    <CommandList className="max-h-64 p-1.5">
                      <CommandEmpty className="py-8 text-xs font-medium text-[#6F7E72]">
                        Không tìm thấy tour phù hợp.
                      </CommandEmpty>
                      <CommandGroup heading={`${tours.length} tour của doanh nghiệp`}>
                        {tours.map((tour) => (
                          <CommandItem
                            key={tour.id}
                            value={`${tour.name} ${tour.id}`}
                            data-checked={tour.id === selectedTourId}
                            onSelect={() => {
                              setSelectedTourId(tour.id);
                              setTourPickerOpen(false);
                            }}
                            className="min-h-10 cursor-pointer rounded-xl px-3 py-2.5 text-xs font-semibold text-[#1E3932] data-selected:bg-[#F0F7F3]"
                          >
                            <span className="line-clamp-2">{tour.name}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="mt-1.5 text-[11px] font-medium text-[#6F7E72]">
                Có thể gõ tên để tìm nhanh trong {tours.length} tour.
              </p>
            </div>

            <fieldset>
              <legend className="text-xs font-extrabold text-[#1E3932]">
                Khách có thể thanh toán như thế nào?
              </legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {[
                  [
                    'FULL_PAYMENT_ONLY',
                    'Thanh toán toàn bộ',
                    'Khách trả 100% giá trị đơn ngay sau khi đặt tour.',
                  ],
                  [
                    'DEPOSIT_ONLY',
                    'Đặt cọc bắt buộc',
                    'Khách trả tiền cọc trước, phần còn lại theo hạn.',
                  ],
                  [
                    'FULL_OR_DEPOSIT',
                    'Cho khách tự chọn',
                    'Khách chọn trả 100% hoặc chia thành hai đợt.',
                  ],
                ].map(([value, title, caption]) => (
                  <label
                    key={value}
                    className={`relative cursor-pointer rounded-2xl border p-4 transition-colors ${
                      paymentOption === value
                        ? 'border-[#006241] bg-[#F0F7F3] shadow-[0_0_0_1px_#006241]'
                        : 'border-[#E1DDCF] bg-[#FBF8F0] hover:border-[#B9CFC3]'
                    }`}
                  >
                    <input
                      type="radio"
                      value={value}
                      {...policyForm.register('paymentOption')}
                      className="sr-only"
                    />
                    {paymentOption === value && (
                      <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#006241] text-white">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                    <span className="block pr-6 text-sm font-extrabold text-[#1E3932]">
                      {title}
                    </span>
                    <span className="mt-1.5 block text-[11px] font-medium leading-relaxed text-[#6F7E72]">
                      {caption}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {paymentOption !== 'FULL_PAYMENT_ONLY' && (
              <div className="grid gap-4 rounded-2xl border border-[#E1DDCF] bg-[#FBF8F0] p-4 sm:grid-cols-3">
                <label className="text-xs font-extrabold text-[#1E3932]">
                  Cách tính tiền cọc
                  <Select
                    value={depositType ?? ''}
                    onValueChange={(value) =>
                      policyForm.setValue('depositType', value as DepositType, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger className="mt-2 h-auto w-full rounded-2xl border-[#D9D4C6] bg-white px-4 py-3 text-sm font-semibold text-[#1E3932] focus-visible:border-[#006241] focus-visible:ring-[#006241]/10">
                      <span>
                        {depositType === 'PERCENTAGE'
                          ? 'Theo phần trăm'
                          : depositType === 'FIXED_AMOUNT'
                            ? 'Số tiền cố định'
                            : 'Chọn cách tính'}
                      </span>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-[#D9D4C6]">
                      <SelectItem value="PERCENTAGE">Theo phần trăm giá tour</SelectItem>
                      <SelectItem value="FIXED_AMOUNT">Một số tiền cố định</SelectItem>
                    </SelectContent>
                  </Select>
                  {policyForm.formState.errors.depositType && (
                    <span className="mt-1 block text-[11px] text-red-600">
                      {policyForm.formState.errors.depositType.message}
                    </span>
                  )}
                </label>
                <label className="text-xs font-extrabold text-[#1E3932]">
                  Giá trị cọc {depositType === 'PERCENTAGE' ? '(%)' : '(VNĐ)'}
                  <input
                    type="number"
                    min={1}
                    {...policyForm.register('depositValue')}
                    className={INPUT_CLASS}
                  />
                  {policyForm.formState.errors.depositValue && (
                    <span className="mt-1 block text-[11px] text-red-600">
                      {policyForm.formState.errors.depositValue.message}
                    </span>
                  )}
                </label>
                <label className="text-xs font-extrabold text-[#1E3932]">
                  Hạn trả phần còn lại
                  <input
                    type="number"
                    min={0}
                    {...policyForm.register('remainingDueDaysBeforeDeparture')}
                    className={INPUT_CLASS}
                  />
                  {policyForm.formState.errors.remainingDueDaysBeforeDeparture && (
                    <span className="mt-1 block text-[11px] text-red-600">
                      {policyForm.formState.errors.remainingDueDaysBeforeDeparture.message}
                    </span>
                  )}
                </label>
              </div>
            )}

            <div className="rounded-2xl border border-[#CFE0D5] bg-[#F3F8F5] p-4">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#006241]">
                Khách sẽ nhìn thấy
              </p>
              <p className="mt-2 text-sm font-extrabold text-[#1E3932]">
                {paymentOption === 'FULL_PAYMENT_ONLY'
                  ? 'Khách thanh toán 100% giá trị đơn qua payOS ngay sau khi đặt tour.'
                  : paymentOption === 'DEPOSIT_ONLY'
                    ? 'Khách bắt buộc đặt cọc để giữ chỗ, sau đó thanh toán phần còn lại.'
                    : 'Khách tự chọn thanh toán toàn bộ hoặc đặt cọc để giữ chỗ.'}
              </p>
              {paymentOption !== 'FULL_PAYMENT_ONLY' && (
                <p className="mt-1.5 text-xs font-medium leading-relaxed text-[#56655F]">
                  Mức cọc:{' '}
                  <strong>
                    {depositValue
                      ? depositType === 'PERCENTAGE'
                        ? `${depositValue}% giá trị đơn`
                        : `${Number(depositValue).toLocaleString('vi-VN')}đ`
                      : 'chưa thiết lập'}
                  </strong>
                  {' · '}Hạn trả phần còn lại:{' '}
                  <strong>
                    {remainingDueDays != null
                      ? `trước khởi hành ${remainingDueDays} ngày`
                      : 'chưa thiết lập'}
                  </strong>
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-[#EEEADF] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-start gap-2 text-[11px] font-medium leading-relaxed text-[#6F7E72]">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Thay đổi chỉ áp dụng cho đơn mới. Các đơn đã tạo vẫn giữ điều khoản cũ.
              </p>
              <button
                type="submit"
                disabled={!selectedTourId || policyMutation.isPending || policyQuery.isFetching}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#006241] px-5 py-3 text-sm font-extrabold text-white transition-colors hover:bg-[#004F35] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {policyMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Lưu chính sách
              </button>
            </div>
          </form>
        </AppCard>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#6F7E72]">
            Bước 3
          </p>
          <h2 className="mt-1 text-xl font-extrabold text-[#1E3932]">
            Quyền lợi hủy tour &amp; hoàn tiền
          </h2>
          <p className="mt-1 text-xs font-medium text-[#6F7E72]">
            Thiết lập các mốc càng hủy sớm, khách càng được hoàn nhiều hơn.
          </p>
        </div>
        <VendorCancellationPolicyCard canManage />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          [CreditCard, 'Nhận tiền trực tiếp', 'Tiền vào tài khoản payOS của doanh nghiệp.'],
          [ShieldCheck, 'Xác nhận tự động', 'Chỉ kết nối hợp lệ mới cập nhật trạng thái đơn.'],
          [Clock3, 'Giữ nguyên điều khoản', 'Đơn đã tạo không bị ảnh hưởng bởi thay đổi mới.'],
        ].map(([Icon, title, description]) => {
          const FeatureIcon = Icon as typeof CreditCard;
          return (
            <div key={String(title)} className="rounded-2xl border border-[#E6E2D1] bg-white p-4">
              <FeatureIcon className="h-5 w-5 text-[#006241]" />
              <p className="mt-3 text-sm font-extrabold text-[#1E3932]">{String(title)}</p>
              <p className="mt-1 text-xs font-medium text-[#6F7E72]">{String(description)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
