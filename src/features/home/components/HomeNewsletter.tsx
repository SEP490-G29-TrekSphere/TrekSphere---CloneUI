import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { newsletterService } from '@/features/home/services/newsletterService';

const newsletterSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Địa chỉ email không hợp lệ'),
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

export default function HomeNewsletter() {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    mode: 'onChange',
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: NewsletterFormValues) => {
    setStatus('pending');
    setErrorMessage('');
    try {
      const response = await newsletterService.subscribe(values.email);
      if (response.error) {
        setStatus('error');
        setErrorMessage(response.error || 'Có lỗi xảy ra, vui lòng thử lại.');
      } else {
        setStatus('success');
        reset();
      }
    } catch (err) {
      setStatus('error');
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra, vui lòng thử lại.';
      setErrorMessage(message);
    }
  };

  return (
    <section className="relative overflow-hidden min-h-[440px]">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80')]"
        aria-hidden="true"
      />
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,32,28,0.93)_0%,rgba(31,57,51,0.82)_100%)]"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-28">
        <span className="section-eyebrow text-white/50">Đừng bỏ lỡ</span>
        <h2 className="mt-3 text-3xl md:text-5xl font-black text-white leading-tight max-w-2xl">
          Nhận ngay thông tin về các tour mới nhất và ưu đãi dành riêng cho bạn.
        </h2>
        <p className="mt-4 text-white/65 text-base max-w-md">
          Hàng tuần cập nhật các tour mới, mẹo trekking, và ưu đãi độc quyền.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-lg w-full"
        >
          <div className="flex-1 flex flex-col items-start gap-1">
            <input
              type="email"
              {...register('email')}
              placeholder="Email của bạn"
              aria-label="Email đăng ký nhận tin"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'newsletter-email-error' : undefined}
              className="newsletter-glass-input w-full h-13 px-6 rounded-full text-sm outline-none focus:ring-2 focus:ring-white/30"
            />
            {errors.email && (
              <span
                id="newsletter-email-error"
                role="alert"
                className="text-rose-400 text-xs mt-1 pl-4"
              >
                {errors.email.message}
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={status === 'pending' || !isValid}
            className="shrink-0 h-13 px-7 rounded-full text-sm font-bold cursor-pointer
              text-primary bg-white hover:bg-white/90 transition-all hover:scale-[1.03] shadow-lg whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none"
          >
            {status === 'pending' ? 'Đang đăng ký...' : 'Đăng ký ngay'}
          </button>
        </form>

        {status === 'success' && (
          <p role="status" className="mt-4 text-emerald-400 text-sm font-semibold">
            Đăng ký nhận tin thành công!
          </p>
        )}
        {status === 'error' && (
          <p role="alert" className="mt-4 text-rose-400 text-sm font-semibold">
            {errorMessage}
          </p>
        )}

        <p className="mt-4 text-white/40 text-xs">Miễn phí. Hủy đăng ký bất kỳ lúc nào.</p>
      </div>
    </section>
  );
}
