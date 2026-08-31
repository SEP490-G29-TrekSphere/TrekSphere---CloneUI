import { http } from 'msw';
import { findBlogById, type MockBlog, mockBlogs, nextBlogId } from '../data/blogs';
import { findUserById, mockUsers } from '../data/users';
import { created, fail, ok } from '../envelope';

/**
 * Handlers cho `trekkerBlogService` (src/features/trekker-community/services/trekkerBlogService.ts)
 * — phần ghi (create/update/hide/delete) của `/blogs`, dùng chung data store
 * mutable với `news.ts` (`src/mocks/data/blogs.ts`).
 *
 * GET /blogs và GET /blogs/:id (dùng cho list "Blog của tôi" và màn Sửa) đã
 * đăng ký ở `news.ts` — KHÔNG duplicate ở đây, chỉ khác method (POST/PUT/DELETE)
 * nên route không đụng nhau.
 */

/** userId của người đang "đăng nhập" trong phiên demo — suy ra từ Bearer token giả. */
function currentUserIdFromAuthHeader(request: Request): string | null {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer mock-access-')) return null;
  const rest = auth.replace('Bearer mock-access-', '');
  return rest.split('-').slice(0, -1).join('-') || null;
}

function toDetail(blog: MockBlog) {
  return {
    blogId: blog.blogId,
    title: blog.title,
    coverImageUrl: blog.coverImageUrl,
    status: blog.status,
    viewCount: blog.viewCount,
    authorId: blog.authorId,
    authorName: blog.authorName,
    authorAvatarUrl: blog.authorAvatarUrl,
    totalComments: blog.comments.length,
    createdAt: blog.createdAt,
    content: blog.content,
    updatedAt: blog.updatedAt,
  };
}

export const trekkerCommunityHandlers = [
  // POST /blogs (multipart/form-data) — tạo bài viết mới, đăng ngay PUBLISHED.
  http.post('*/blogs', async ({ request }) => {
    const userId = currentUserIdFromAuthHeader(request);
    const user = (userId && findUserById(userId)) || mockUsers[1];

    const formData = await request.formData().catch(() => null);
    const title = (formData?.get('title') as string | null)?.trim();
    const content = (formData?.get('content') as string | null)?.trim();
    const coverImage = formData?.get('coverImage');

    if (!title || !content) {
      return fail('Tiêu đề và nội dung không được để trống.', 400, [
        ...(!title ? [{ field: 'title', message: 'Tiêu đề không được để trống.' }] : []),
        ...(!content ? [{ field: 'content', message: 'Nội dung không được để trống.' }] : []),
      ]);
    }

    const now = new Date().toISOString();
    const blog: MockBlog = {
      blogId: nextBlogId(),
      title,
      excerpt: content.slice(0, 140),
      content,
      coverImageUrl:
        coverImage instanceof File && coverImage.size > 0
          ? `https://picsum.photos/seed/${encodeURIComponent(title)}-${Date.now()}/800/600`
          : `https://picsum.photos/seed/blog-${Date.now()}/800/600`,
      categoryName: 'experience',
      tags: [],
      authorId: user.id,
      authorName: user.fullName,
      authorAvatarUrl: user.avatarUrl ?? '',
      status: 'PUBLISHED',
      viewCount: 0,
      readingTimeMinutes: Math.max(1, Math.round(content.split(/\s+/).length / 200)),
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
      comments: [],
    };
    mockBlogs.unshift(blog);

    return created(toDetail(blog), 'Đăng bài viết thành công.');
  }),

  // PUT /blogs/:id (multipart/form-data) — cập nhật bài viết (chủ bài viết).
  http.put('*/blogs/:id', async ({ params, request }) => {
    const blog = findBlogById(String(params.id));
    if (!blog) return fail('Không tìm thấy bài viết.', 404);

    const formData = await request.formData().catch(() => null);
    const title = formData?.get('title') as string | null;
    const content = formData?.get('content') as string | null;
    const coverImage = formData?.get('coverImage');

    if (title?.trim()) {
      blog.title = title.trim();
    }
    if (content?.trim()) {
      blog.content = content.trim();
      blog.excerpt = content.trim().slice(0, 140);
    }
    if (coverImage instanceof File && coverImage.size > 0) {
      blog.coverImageUrl = `https://picsum.photos/seed/${blog.blogId}-${Date.now()}/800/600`;
    }
    blog.updatedAt = new Date().toISOString();

    return ok(toDetail(blog), 'Cập nhật bài viết thành công.');
  }),

  // PUT /blogs/:id/hide — không có body, BE tự toggle PUBLISHED <-> HIDDEN.
  http.put('*/blogs/:id/hide', ({ params }) => {
    const blog = findBlogById(String(params.id));
    if (!blog) return fail('Không tìm thấy bài viết.', 404);

    blog.status = blog.status === 'HIDDEN' ? 'PUBLISHED' : 'HIDDEN';
    return ok(null, blog.status === 'HIDDEN' ? 'Đã ẩn bài viết.' : 'Đã hiện lại bài viết.');
  }),

  // DELETE /blogs/:id — xóa vĩnh viễn (chủ bài viết hoặc Admin).
  http.delete('*/blogs/:id', ({ params }) => {
    const idx = mockBlogs.findIndex((b) => b.blogId === String(params.id));
    if (idx === -1) return fail('Không tìm thấy bài viết.', 404);
    mockBlogs.splice(idx, 1);
    return ok(null, 'Xóa bài viết thành công.');
  }),
];
