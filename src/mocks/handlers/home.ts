import { http } from 'msw';
import { fail, ok } from '../envelope';

/**
 * Handlers cho feature `home`.
 *
 * `HomeHero`/`HomeStories`/`HomeTours`/`HomeTestimonials`/... đều dùng dữ liệu
 * tĩnh local (`src/features/home/data/reviews.ts`) hoặc tái sử dụng các
 * service của feature khác (tours → `vendor-tours`/`tours` handlers) — không
 * có service riêng nào khác trong `home` ngoài `newsletterService`.
 */
export const homeHandlers = [
  http.post('*/newsletter/subscribe', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { email?: string };
    if (!body.email || !/^\S+@\S+\.\S+$/.test(body.email)) {
      return fail('Email không hợp lệ.', 400, [{ field: 'email', message: 'Email không hợp lệ.' }]);
    }
    return ok({
      message: 'Đăng ký nhận bản tin thành công. Cảm ơn bạn đã đồng hành cùng TrekSphere!',
    });
  }),
];
