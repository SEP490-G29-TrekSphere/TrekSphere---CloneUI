/**
 * Phần banner tối màu phía trên cùng của trang Blog List.
 * Filter bar được render đè xuống ranh giới từ component cha.
 */
export function BlogHeroSection() {
  return (
    <section
      className="relative flex w-full items-center justify-center px-4 py-14 sm:py-20 md:py-28"
      style={{
        backgroundImage:
          'linear-gradient(rgba(6, 38, 29, 0.85), rgba(6, 38, 29, 0.95)), url(https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-none w-full text-center">
        <h1 className="text-3xl font-bold text-white md:text-5xl">Blog Kinh Nghiệm & Chia Sẻ</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-white/80 md:text-base">
          Khám phá cẩm nang trekking, review chi tiết các tour và những câu chuyện thực tế từ cộng
          đồng TrekSphere.
        </p>
      </div>
    </section>
  );
}
