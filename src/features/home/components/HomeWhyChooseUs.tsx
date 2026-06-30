import { ScrollReveal } from '@/shared/ui';

const FEATURES = [
  {
    title: 'Hướng dẫn viên chuyên nghiệp',
    description: 'Đội ngũ chuyên gia am hiểu địa hình, giàu kinh nghiệm và đầy nhiệt huyết.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#1F3933" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
        />
      </svg>
    ),
  },
  {
    title: 'An toàn là trên hết',
    description: 'Trang bị tiêu chuẩn quốc tế và quy trình bảo an nghiêm ngặt cho mọi hành trình.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#1F3933" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
        />
      </svg>
    ),
  },
  {
    title: 'Du lịch bền vững',
    description: 'Cam kết bảo vệ môi trường và hỗ trợ phát triển cộng đồng bản địa địa phương.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#1F3933" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
        />
      </svg>
    ),
  },
];

export default function HomeWhyChooseUs() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <ScrollReveal variant="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-primary">
            Tại sao chọn TrekSphere?
          </h2>
        </ScrollReveal>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10">
          {FEATURES.map((f, idx) => (
            <ScrollReveal
              key={f.title}
              variant="fade-up"
              scrollOptions={{ delay: idx * 120 }}
              className="flex flex-col items-center text-center feature-card-hover"
            >
              <div className="mb-5">{f.icon}</div>
              <h3 className="text-lg font-bold text-primary">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed max-w-xs text-muted-foreground">
                {f.description}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
