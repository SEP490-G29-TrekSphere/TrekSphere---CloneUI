import { AppButton, ScrollReveal } from '@/shared/ui';

const AVATARS = [
  'https://i.pravatar.cc/80?img=11',
  'https://i.pravatar.cc/80?img=12',
  'https://i.pravatar.cc/80?img=13',
  'https://i.pravatar.cc/80?img=14',
  'https://i.pravatar.cc/80?img=15',
];

export default function HomeCompanions() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <ScrollReveal variant="fade-up">
          <div className="rounded-3xl px-8 py-12 md:px-16 md:py-16 flex flex-col md:flex-row items-center justify-between gap-10 bg-primary">
            <ScrollReveal variant="fade-left" scrollOptions={{ delay: 100 }}>
              <div className="flex-1 text-white">
                <h2 className="text-3xl md:text-4xl font-bold leading-tight">Tìm bạn đồng hành</h2>
                <p className="mt-4 text-white/85 text-base leading-relaxed max-w-xl">
                  Đừng để hành trình đơn độc. Kết nối với hàng ngàn trekker cùng đam mê, chia sẻ
                  kinh nghiệm và cùng nhau chinh phục những đỉnh cao.
                </p>
                <AppButton
                  type="button"
                  className="mt-8 px-6 py-3 rounded-full font-semibold text-sm
                    text-primary bg-secondary hover:bg-secondary/80"
                >
                  Tham gia nhóm ngay
                </AppButton>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fade-right" scrollOptions={{ delay: 250 }}>
              <div className="flex items-center shrink-0">
                {AVATARS.map((src, idx) => (
                  <div
                    key={src}
                    className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-primary"
                    style={{
                      marginLeft: idx === 0 ? 0 : '-12px',
                      zIndex: AVATARS.length - idx,
                    }}
                  >
                    <img src={src} alt={`user-${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))}
                <div
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center font-bold text-sm bg-secondary text-primary"
                  style={{ marginLeft: '-12px' }}
                >
                  +1K
                </div>
              </div>
            </ScrollReveal>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
