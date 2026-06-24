import { useState } from 'react';

export default function HomeNewsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <section className="py-20" style={{ backgroundColor: '#FAF8F1' }}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div
          className="rounded-3xl px-8 py-14 md:px-16 md:py-16 text-center"
          style={{ backgroundColor: '#F0EEE1' }}
        >
          <p className="text-sm font-medium" style={{ color: '#6F7B75' }}>
            Đăng ký nhận tin
          </p>
          <h2 className="mt-3 text-2xl md:text-3xl font-bold" style={{ color: '#1F3933' }}>
            Nhận ngay thông tin về các tour mới nhất và ưu đãi đặc quyền dành riêng cho bạn.
          </h2>

          <form
            onSubmit={handleSubmit}
            className="mt-8 mx-auto flex items-center max-w-xl w-full bg-white rounded-full shadow-sm overflow-hidden"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email của bạn"
              className="flex-1 px-6 py-3.5 bg-transparent text-sm outline-none placeholder:text-[#6F7B75]"
              style={{ color: '#1F3933' }}
            />
            <button
              type="submit"
              className="m-1.5 px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#1F3933' }}
            >
              Đăng ký
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
