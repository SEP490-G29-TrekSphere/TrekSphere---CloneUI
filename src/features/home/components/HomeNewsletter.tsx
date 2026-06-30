import { useState } from 'react';
import { AppButton, ScrollReveal } from '@/shared/ui';

export default function HomeNewsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <section className="py-20 bg-background">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <ScrollReveal variant="fade-up">
          <div className="rounded-3xl px-8 py-14 md:px-16 md:py-16 text-center bg-muted">
            <p className="text-sm font-medium text-muted-foreground">Đăng ký nhận tin</p>
            <h2 className="mt-3 text-2xl md:text-3xl font-bold text-primary">
              Nhận ngay thông tin về các tour mới nhất và ưu đãi dành riêng cho bạn.
            </h2>

            <form
              onSubmit={handleSubmit}
              className="mt-8 mx-auto flex items-center max-w-xl w-full bg-white rounded-full shadow-sm overflow-hidden h-14"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email của bạn"
                className="flex-1 h-full px-6 bg-transparent text-sm outline-none
                  text-primary placeholder:text-muted-foreground"
              />
              <AppButton
                type="submit"
                className="shrink-0 whitespace-nowrap h-full px-7 rounded-full text-sm font-semibold
                  text-white bg-primary hover:bg-primary-hover"
              >
                Đăng ký
              </AppButton>
            </form>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
