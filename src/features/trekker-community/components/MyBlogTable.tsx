import { Eye, EyeOff, FileImage, Pencil } from 'lucide-react';
import type { TrekkerBlogItem } from '../types';

interface MyBlogTableProps {
  blogs: TrekkerBlogItem[];
  onEdit?: (blog: TrekkerBlogItem) => void;
  onDelete?: (blog: TrekkerBlogItem) => void;
  onHide?: (blog: TrekkerBlogItem) => void;
}

/**
 * Bảng danh sách bài viết cho trang "Blog của tôi".
 * Gồm 5 cột: HÌNH ẢNH & TIÊU ĐỀ | TRẠNG THÁI | NGÀY TẠO | LƯỢT XEM | THAO TÁC
 */
export function MyBlogTable({ blogs, onEdit, onDelete, onHide }: MyBlogTableProps) {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        border: '1px solid #E6E2D1',
        overflow: 'hidden',
      }}
    >
      {/* Table Header */}
      <table className="w-full">
        <thead>
          <tr style={{ backgroundColor: '#F0EEE6' }}>
            <HeaderCell style={{ padding: '14px 20px', textAlign: 'left' }}>
              HÌNH ẢNH & TIÊU ĐỀ
            </HeaderCell>
            <HeaderCell>TRẠNG THÁI</HeaderCell>
            <HeaderCell>NGÀY TẠO</HeaderCell>
            <HeaderCell>LƯỢT XEM</HeaderCell>
            <HeaderCell style={{ textAlign: 'center' }}>THAO TÁC</HeaderCell>
          </tr>
        </thead>
        <tbody>
          {blogs.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-16 text-center" style={{ color: '#6F7B75' }}>
                <div className="flex flex-col items-center gap-3">
                  <FileImage className="h-10 w-10 opacity-30" style={{ color: '#6F7B75' }} />
                  <p className="font-medium">Chưa có bài viết nào</p>
                  <p className="text-sm">Bắt đầu chia sẻ hành trình của bạn ngay hôm nay!</p>
                </div>
              </td>
            </tr>
          ) : (
            blogs.map((blog, index) => (
              <TableRow
                key={blog.blogId}
                blog={blog}
                index={index}
                onEdit={onEdit}
                onDelete={onDelete}
                onHide={onHide}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function HeaderCell({
  children,
  style,
  className = '',
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${className}`}
      style={{ color: '#6F7B75', ...style }}
    >
      {children}
    </th>
  );
}

interface TableRowProps {
  blog: TrekkerBlogItem;
  index: number;
  onEdit?: (blog: TrekkerBlogItem) => void;
  onDelete?: (blog: TrekkerBlogItem) => void;
  onHide?: (blog: TrekkerBlogItem) => void;
}

function TableRow({ blog, index, onEdit, onDelete: _onDelete, onHide }: TableRowProps) {
  return (
    <tr
      style={{
        borderBottom: index < 10 ? '1px solid #E6E2D1' : 'none',
        backgroundColor: index % 2 === 1 ? '#FAFAF8' : 'transparent',
      }}
    >
      {/* Cột 1: Hình ảnh & Tiêu đề */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          {/* Thumbnail */}
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '8px',
              overflow: 'hidden',
              flexShrink: 0,
              backgroundColor: '#F0EEE6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {blog.coverImageUrl ? (
              <img
                src={blog.coverImageUrl}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <FileImage className="h-6 w-6 opacity-30" style={{ color: '#6F7B75' }} />
            )}
          </div>

          {/* Tiêu đề */}
          <div className="min-w-0 flex-1">
            <p
              className="font-semibold leading-tight line-clamp-2"
              style={{ color: '#06261D' }}
              title={blog.title}
            >
              {blog.title}
            </p>
          </div>
        </div>
      </td>

      {/* Cột 2: Trạng thái */}
      <td className="px-4 py-4 text-center">
        <StatusBadge status={blog.status} />
      </td>

      {/* Cột 3: Ngày tạo */}
      <td className="px-4 py-4 text-center" style={{ color: '#6F7B75' }}>
        {formatDate(blog.createdAt)}
      </td>

      {/* Cột 4: Lượt xem */}
      <td className="px-4 py-4 text-center">
        <ViewCount count={blog.viewCount} status={blog.status} />
      </td>

      {/* Cột 5: Thao tác */}
      <td className="px-4 py-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onHide?.(blog)}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
            title="Ẩn bài viết"
            style={{ color: '#6F7B75' }}
          >
            <EyeOff className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onEdit?.(blog)}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
            title="Sửa bài viết"
            style={{ color: '#6F7B75' }}
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

/** Badge trạng thái: Đã xuất bản / Bản nháp */
function StatusBadge({ status }: { status: TrekkerBlogItem['status'] }) {
  if (status === 'PUBLISHED') {
    return (
      <span
        className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
        style={{
          backgroundColor: '#A2EBD2',
          color: '#06261D',
        }}
      >
        Đã xuất bản
      </span>
    );
  }

  if (status === 'DRAFT') {
    return (
      <span
        className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
        style={{
          backgroundColor: '#F0EEE6',
          color: '#6F7B75',
        }}
      >
        Bản nháp
      </span>
    );
  }

  return (
    <span
      className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
      style={{
        backgroundColor: '#F0EEE6',
        color: '#6F7B75',
      }}
    >
      {status}
    </span>
  );
}

/** Hiển thị lượt xem với icon mắt */
function ViewCount({ count, status }: { count: number; status: TrekkerBlogItem['status'] }) {
  const isDraft = status === 'DRAFT';

  return (
    <span className="inline-flex items-center gap-1" style={{ color: '#6F7B75' }}>
      <Eye className="h-3.5 w-3.5" />
      {isDraft ? '--' : formatViewCount(count)}
    </span>
  );
}

/** Format số view: 2400 → "2.4k" */
function formatViewCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

/** Format date: "2023-10-15T00:00:00Z" → "15/10/2023" */
function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return isoString;
  }
}
