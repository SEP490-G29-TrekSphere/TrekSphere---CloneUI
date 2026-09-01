import { http } from 'msw';
import {
  findBlogById,
  findCommentById,
  type MockBlogComment,
  mockBlogs,
  nextCommentId,
} from '../data/blogs';
import { findUserById, mockUsers } from '../data/users';
import { fail, ok, page } from '../envelope';

/**
 * Handlers cho `blogService` (src/features/news/services/blogService.ts) —
 * phần đọc công khai của `/blogs` (list/detail/comments) dùng chung data
 * store với `trekker-community` (`src/mocks/data/blogs.ts`), vì cả 2 feature
 * cùng gọi vào 1 endpoint BE thật `/blogs`.
 *
 * GET /blogs, GET /blogs/:id và mọi thao tác trên comments đăng ký ở ĐÂY.
 * POST/PUT /blogs (tạo/sửa bài), PUT /blogs/:id/hide, DELETE /blogs/:id
 * đăng ký ở `trekker-community.ts` (khác method nên không đụng route).
 */

/** userId của người đang "đăng nhập" trong phiên demo — suy ra từ Bearer token giả. */
function currentUserIdFromAuthHeader(request: Request): string | null {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer mock-access-')) return null;
  const rest = auth.replace('Bearer mock-access-', '');
  return rest.split('-').slice(0, -1).join('-') || null;
}

/**
 * Shape trả về cho GET /blogs list — hợp nhất `BlogListItem` (feature `news`,
 * đọc công khai) với `TrekkerBlogItem` (feature `trekker-community`, "Blog của
 * tôi" cần thêm `status`/`totalComments`/`createdAt` để hiển thị badge trạng
 * thái), vì cả 2 feature cùng gọi chung 1 endpoint BE thật.
 */
function toListItem(blog: (typeof mockBlogs)[number]) {
  return {
    blogId: blog.blogId,
    title: blog.title,
    excerpt: blog.excerpt,
    coverImageUrl: blog.coverImageUrl,
    categoryName: blog.categoryName,
    authorId: blog.authorId,
    authorName: blog.authorName,
    authorAvatarUrl: blog.authorAvatarUrl,
    publishedAt: blog.publishedAt,
    readingTimeMinutes: blog.readingTimeMinutes,
    tags: blog.tags,
    viewCount: blog.viewCount,
    status: blog.status,
    totalComments: blog.comments.length,
    createdAt: blog.createdAt,
  };
}

function toDetail(blog: (typeof mockBlogs)[number]) {
  return {
    ...toListItem(blog),
    content: blog.content,
    comments: toCommentTree(blog.comments),
    totalComments: blog.comments.length,
    status: blog.status,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
  };
}

function toCommentDto(comment: MockBlogComment) {
  return {
    commentId: comment.commentId,
    userId: comment.userId,
    userFullName: comment.userFullName,
    userAvatarUrl: comment.userAvatarUrl,
    content: comment.content,
    status: comment.status,
    createdAt: comment.createdAt,
  };
}

/** BE trả comments dạng cây (replies) — mock chỉ có 1 cấp nên replies luôn rỗng. */
function toCommentTree(comments: MockBlogComment[]) {
  return comments
    .filter((c) => !c.parentCommentId)
    .map((c) => ({ ...toCommentDto(c), replies: [] as unknown[] }));
}

export const newsHandlers = [
  // GET /blogs?keyword=&page=&size=&sortBy=&sortDir= — chỉ trả bài PUBLISHED
  // (trang News công khai, không hiển thị DRAFT/HIDDEN của người khác).
  http.get('*/blogs', ({ request }) => {
    const url = new URL(request.url);
    const keyword = url.searchParams.get('keyword')?.trim().toLowerCase();
    const authorId = url.searchParams.get('authorId');
    const pageParam = Number(url.searchParams.get('page') ?? 0);
    const size = Number(url.searchParams.get('size') ?? 10);
    const sortBy = url.searchParams.get('sortBy') ?? 'publishedAt';
    const sortDir = url.searchParams.get('sortDir') === 'asc' ? 1 : -1;

    let items = mockBlogs.filter((b) => b.status === 'PUBLISHED');
    if (authorId) items = mockBlogs.filter((b) => b.authorId === authorId);
    if (keyword) {
      items = items.filter(
        (b) =>
          b.title.toLowerCase().includes(keyword) ||
          b.excerpt.toLowerCase().includes(keyword) ||
          b.tags.some((t) => t.toLowerCase().includes(keyword))
      );
    }
    items = [...items].sort((a, b) => {
      if (sortBy === 'viewCount') return sortDir * (a.viewCount - b.viewCount);
      return sortDir * (new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
    });

    return ok(page(items.map(toListItem), pageParam, size));
  }),

  // GET /blogs/:id — tăng viewCount mỗi lần gọi, giống hành vi BE thật.
  http.get('*/blogs/:id', ({ params }) => {
    const blog = findBlogById(String(params.id));
    if (!blog) return fail('Không tìm thấy bài viết.', 404);
    blog.viewCount += 1;
    return ok(toDetail(blog));
  }),

  // GET /blogs/:id/comments?topLevelOnly=&page=&size=
  http.get('*/blogs/:id/comments', ({ params, request }) => {
    const blog = findBlogById(String(params.id));
    if (!blog) return fail('Không tìm thấy bài viết.', 404);

    const url = new URL(request.url);
    const pageParam = Number(url.searchParams.get('page') ?? 0);
    const size = Number(url.searchParams.get('size') ?? 10);
    const topLevelOnly = url.searchParams.get('topLevelOnly') !== 'false';

    const source = topLevelOnly
      ? toCommentTree(blog.comments)
      : blog.comments.map((c) => ({ ...toCommentDto(c), replies: [] as unknown[] }));

    return ok(page(source, pageParam, size));
  }),

  // POST /blogs/:id/comments (auth) — body: { content, parentCommentId? }
  http.post('*/blogs/:id/comments', async ({ params, request }) => {
    const blog = findBlogById(String(params.id));
    if (!blog) return fail('Không tìm thấy bài viết.', 404);

    const userId = currentUserIdFromAuthHeader(request);
    const user = (userId && findUserById(userId)) || mockUsers[1];
    const body = (await request.json().catch(() => ({}))) as {
      content?: string;
      parentCommentId?: string | null;
    };
    if (!body.content?.trim()) {
      return fail('Nội dung bình luận không được để trống.', 400, [
        { field: 'content', message: 'Nội dung bình luận không được để trống.' },
      ]);
    }

    const comment: MockBlogComment = {
      commentId: nextCommentId(),
      userId: user.id,
      userFullName: user.fullName,
      userAvatarUrl: user.avatarUrl ?? '',
      content: body.content.trim(),
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      parentCommentId: body.parentCommentId ?? null,
    };
    blog.comments.push(comment);

    return ok({ ...toCommentDto(comment), replies: [] as unknown[] }, 'Bình luận thành công.', 201);
  }),

  // PUT /blogs/comments/:commentId (auth, chủ comment)
  http.put('*/blogs/comments/:commentId', async ({ params, request }) => {
    const comment = findCommentById(String(params.commentId));
    if (!comment) return fail('Không tìm thấy bình luận.', 404);

    const body = (await request.json().catch(() => ({}))) as { content?: string };
    if (!body.content?.trim()) {
      return fail('Nội dung bình luận không được để trống.', 400);
    }
    comment.content = body.content.trim();
    return ok(
      { ...toCommentDto(comment), replies: [] as unknown[] },
      'Cập nhật bình luận thành công.'
    );
  }),

  // DELETE /blogs/comments/:commentId (auth, chủ comment/Admin)
  http.delete('*/blogs/comments/:commentId', ({ params }) => {
    for (const blog of mockBlogs) {
      const idx = blog.comments.findIndex((c) => c.commentId === String(params.commentId));
      if (idx !== -1) {
        blog.comments.splice(idx, 1);
        return ok(null, 'Xóa bình luận thành công.');
      }
    }
    return fail('Không tìm thấy bình luận.', 404);
  }),
];
