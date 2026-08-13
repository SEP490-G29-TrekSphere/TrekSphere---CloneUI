/**
 * Phần banner tối màu phía trên cùng của trang Blog List.
 * Filter bar được render đè xuống ranh giới từ component cha.
 */
export function BlogHeroSection() {
  return (
    <section className="relative h-[350px] sm:h-[450px] w-full">
      <img
        src="https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1920&q=80"
        alt="Blog Kinh Nghiệm & Chia Sẻ"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4">
        <h1 className="mb-4 text-3xl font-bold sm:text-5xl lg:text-6xl text-white">
          Blog Kinh Nghiệm & Chia Sẻ
        </h1>
        <p className="max-w-2xl text-base sm:text-lg text-white/90">
          Khám phá cẩm nang trekking, review chi tiết các tour và những câu chuyện thực tế từ cộng
          đồng TrekSphere.
        </p>
      </div>
    </section>
  );
}
