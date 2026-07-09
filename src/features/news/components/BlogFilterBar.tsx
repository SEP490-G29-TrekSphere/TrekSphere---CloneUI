import { Search } from 'lucide-react';

interface BlogFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

/**
 * Thanh filter đơn giản: ô tìm kiếm.
 *
 * BE hiện chỉ hỗ trợ filter `keyword` — không có filter category.
 * → UI chỉ hiển thị ô search. Khi BE bổ sung filter category
 *   thì thêm lại các tab chuyên mục.
 */
export function BlogFilterBar({ searchQuery, onSearchChange }: BlogFilterBarProps) {
  return (
    <div className="flex items-center gap-3 rounded-full bg-card p-2 pl-5 shadow-lg">
      <label className="flex flex-1 items-center gap-2 rounded-full bg-muted px-4 py-2">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm bài viết..."
          aria-label="Tìm kiếm bài viết"
          className="w-full bg-transparent text-sm text-primary outline-none placeholder:text-muted-foreground"
        />
      </label>
    </div>
  );
}
