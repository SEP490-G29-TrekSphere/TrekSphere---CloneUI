import { Eye, EyeOff, FileImage, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  MyBlogPagination,
  type TrekkerBlogItem,
  useTrekkerBlogList,
  useTrekkerBlogMutations,
} from '@/features/trekker-community';
import { useDebounce } from '@/shared/hooks';
import type { AdminLayoutContext } from '@/shared/layout/AdminLayout';
import { AppSpinner, ConfirmActionDialog } from '@/shared/ui';
import { toast } from '@/store/useToastStore';

const PAGE_SIZE = 10;

type PendingAction = { blog: TrekkerBlogItem; type: 'hide' | 'delete' };

/**
 * Trang "Quản lý Blog" — Admin xem toàn bộ bài viết trong hệ thống và
 * kiểm duyệt (ẩn bài vi phạm hoặc xóa vĩnh viễn).
 *
 * Dùng lại data layer của feature trekker-community (cùng endpoint `GET /blogs`,
 * chỉ khác không lọc theo `authorId`) — tránh viết trùng service/hook.
 */
export default function BlogManagement() {
  const [page, setPage] = useState(1);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const { searchValue } = useOutletContext<AdminLayoutContext>();
  const debouncedSearch = useDebounce(searchValue, 400);

  // biome-ignore lint/correctness/useExhaustiveDependencies: debouncedSearch chỉ dùng để trigger effect
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isError } = useTrekkerBlogList({
    keyword: debouncedSearch || undefined,
    page,
    size: PAGE_SIZE,
    sortBy: 'createdAt',
    sortDir: 'desc',
  });

  const { toggleVisibility, deleteBlog } = useTrekkerBlogMutations();

  const blogs = data?.items ?? [];
  const total = data?.meta.totalElements ?? 0;
  const totalPages = Math.max(1, data?.meta.totalPages ?? 1);
  const isActionPending = toggleVisibility.isPending || deleteBlog.isPending;

  const handleConfirmAction = () => {
    if (!pendingAction) return;
    const { blog, type } = pendingAction;

    if (type === 'hide') {
      const willHide = blog.status !== 'HIDDEN';
      toggleVisibility.mutate(blog.blogId, {
        onSuccess: () => {
          toast.success(willHide ? 'Đã ẩn bài viết vi phạm.' : 'Đã hiển thị lại bài viết.');
          setPendingAction(null);
        },
        onError: () => {
          toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
          setPendingAction(null);
        },
      });
    } else {
      deleteBlog.mutate(blog.blogId, {
        onSuccess: () => {
          toast.success('Đã xóa vĩnh viễn bài viết.');
          setPendingAction(null);
        },
        onError: () => {
          toast.error('Không thể xóa bài viết. Vui lòng thử lại.');
          setPendingAction(null);
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#0B3025] tracking-tight">Quản lý Blog</h1>
        <p className="text-zinc-500 text-sm font-medium mt-1">
          Kiểm duyệt bài viết blog trong toàn hệ thống TrekSphere.
          {total > 0 && ` Tổng cộng ${total} bài viết.`}
        </p>
      </div>

      <div
        className="overflow-hidden rounded-3xl bg-card shadow-sm"
        style={{ border: '1px solid #E6E2D1' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#F0EEE6' }}>
              <tr>
                <Th align="left">Hình ảnh & Tiêu đề</Th>
                <Th align="left">Tác giả</Th>
                <Th>Trạng thái</Th>
                <Th>Ngày tạo</Th>
                <Th>Lượt xem</Th>
                <Th align="right">Thao tác</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <EmptyRow>
                  <AppSpinner size="default" className="mx-auto text-primary" />
                </EmptyRow>
              ) : isError ? (
                <EmptyRow color="#DC2626">Không thể tải danh sách bài viết.</EmptyRow>
              ) : blogs.length === 0 ? (
                <EmptyRow>
                  <div className="flex flex-col items-center gap-2">
                    <FileImage className="h-8 w-8 opacity-30" />
                    <span>Không có bài viết nào phù hợp.</span>
                  </div>
                </EmptyRow>
              ) : (
                blogs.map((blog) => (
                  <BlogRow
                    key={blog.blogId}
                    blog={blog}
                    onHide={() => setPendingAction({ blog, type: 'hide' })}
                    onDelete={() => setPendingAction({ blog, type: 'delete' })}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <MyBlogPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalCount={total}
            pageSize={PAGE_SIZE}
          />
        )}
      </div>

      {pendingAction && (
        <ConfirmActionDialog
          variant={pendingAction.type === 'delete' ? 'destructive' : 'default'}
          title={
            pendingAction.type === 'delete'
              ? 'Xóa vĩnh viễn bài viết?'
              : pendingAction.blog.status === 'HIDDEN'
                ? 'Hiển thị lại bài viết?'
                : 'Ẩn bài viết vi phạm?'
          }
          description={
            pendingAction.type === 'delete'
              ? 'Bài viết sẽ bị xóa vĩnh viễn khỏi hệ thống và không thể khôi phục.'
              : pendingAction.blog.status === 'HIDDEN'
                ? 'Bài viết sẽ hiển thị công khai trở lại với cộng đồng.'
                : 'Bài viết sẽ bị ẩn khỏi cộng đồng do vi phạm. Tác giả sẽ nhận được thông báo.'
          }
          detail={`${pendingAction.blog.title} — bởi ${pendingAction.blog.authorName}`}
          confirmLabel={
            pendingAction.type === 'delete'
              ? 'Xóa vĩnh viễn'
              : pendingAction.blog.status === 'HIDDEN'
                ? 'Xác nhận hiển thị'
                : 'Xác nhận ẩn'
          }
          isPending={isActionPending}
          onConfirm={handleConfirmAction}
          onCancel={() => setPendingAction(null)}
        />
      )}
    </div>
  );
}

const ALIGN_CLASS: Record<'left' | 'right' | 'center', string> = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
};

function Th({
  children,
  align = 'center',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
}) {
  return (
    <th
      className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${ALIGN_CLASS[align]}`}
      style={{ color: '#06261D' }}
    >
      {children}
    </th>
  );
}

function EmptyRow({ children, color = '#6F7B75' }: { children: React.ReactNode; color?: string }) {
  return (
    <tr>
      <td colSpan={6} className="px-6 py-16 text-center text-sm" style={{ color }}>
        {children}
      </td>
    </tr>
  );
}

function BlogRow({
  blog,
  onHide,
  onDelete,
}: {
  blog: TrekkerBlogItem;
  onHide: () => void;
  onDelete: () => void;
}) {
  const isHidden = blog.status === 'HIDDEN';

  return (
    <tr style={{ borderTop: '1px solid #E6E2D1' }}>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg"
            style={{ backgroundColor: '#F0EEE6' }}
          >
            {blog.coverImageUrl ? (
              <img
                src={blog.coverImageUrl}
                alt={blog.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <FileImage className="h-5 w-5 opacity-30" style={{ color: '#6F7B75' }} />
            )}
          </div>
          <p className="min-w-0 flex-1 font-semibold line-clamp-2" style={{ color: '#06261D' }}>
            {blog.title}
          </p>
        </div>
      </td>
      <td className="px-6 py-4 text-sm" style={{ color: '#6F7B75' }}>
        {blog.authorName}
      </td>
      <td className="px-4 py-4 text-center">
        <span
          className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
          style={
            blog.status === 'PUBLISHED'
              ? { backgroundColor: '#A2EBD2', color: '#06261D' }
              : { backgroundColor: '#F0EEE6', color: '#6F7B75' }
          }
        >
          {blog.status === 'PUBLISHED'
            ? 'Đã xuất bản'
            : blog.status === 'HIDDEN'
              ? 'Đã ẩn'
              : blog.status}
        </span>
      </td>
      <td className="px-4 py-4 text-center text-sm" style={{ color: '#6F7B75' }}>
        {formatDate(blog.createdAt)}
      </td>
      <td className="px-4 py-4 text-center text-sm" style={{ color: '#6F7B75' }}>
        {blog.viewCount}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onHide}
            title={isHidden ? 'Hiển thị lại' : 'Ẩn bài viết'}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
            style={{ color: '#6F7B75' }}
          >
            {isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onDelete}
            title="Xóa vĩnh viễn"
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-red-50"
            style={{ color: '#EF4444' }}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${date.getFullYear()}`;
  } catch {
    return isoString;
  }
}
