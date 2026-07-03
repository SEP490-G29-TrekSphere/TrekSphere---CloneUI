import { Search } from 'lucide-react';
import { BLOG_CATEGORIES } from '../data/categories';
import type { BlogCategoryId } from '../types';

interface BlogFilterBarProps {
  selectedCategory: BlogCategoryId;
  onCategoryChange: (id: BlogCategoryId) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

/**
 * Thanh filter nổi: gồm các tab chuyên mục + ô tìm kiếm.
 * Nằm trong nền trắng, bo góc lớn, có đổ bóng.
 */
export function BlogFilterBar({
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}: BlogFilterBarProps) {
  return (
    <div className="flex flex-col items-stretch gap-3 rounded-2xl bg-card p-3 shadow-lg md:flex-row md:items-center md:gap-4 md:rounded-full md:p-2 md:pl-5">
      {/* Categories */}
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {BLOG_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors md:text-sm ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-muted text-primary hover:bg-accent/50'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <label className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 md:w-72">
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
