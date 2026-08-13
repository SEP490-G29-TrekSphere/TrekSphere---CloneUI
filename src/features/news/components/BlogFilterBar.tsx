import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';

interface BlogFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  onSortChange: (sortBy: string, sortDir: 'asc' | 'desc') => void;
}

const sortOptions = [
  { value: 'createdAt-desc', label: 'Mới nhất' },
  { value: 'createdAt-asc', label: 'Cũ nhất' },
  { value: 'viewCount-desc', label: 'Xem nhiều nhất' },
];

/**
 * Thanh filter cho danh sách bài viết.
 * Gồm ô tìm kiếm (keyword) và Sắp xếp (sortBy, sortDir).
 */
export function BlogFilterBar({
  searchQuery,
  onSearchChange,
  sortBy,
  sortDir,
  onSortChange,
}: BlogFilterBarProps) {
  const currentSortValue = `${sortBy}-${sortDir}`;
  const currentSortLabel =
    sortOptions.find((o) => o.value === currentSortValue)?.label || 'Mới nhất';

  const handleSortChange = (val: string | null) => {
    if (!val) return;
    const [newSortBy, newSortDir] = val.split('-');
    onSortChange(newSortBy, newSortDir as 'asc' | 'desc');
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-full bg-card p-2 shadow-lg sm:pl-5">
      <label className="flex w-full sm:w-[400px] flex-1 items-center gap-2 rounded-full bg-muted px-4 py-2">
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

      <div className="flex w-full sm:w-auto items-center justify-end gap-2 pr-2">
        <span className="hidden text-xs text-muted-foreground sm:inline">Sắp xếp:</span>
        <Select value={currentSortValue} onValueChange={handleSortChange}>
          <SelectTrigger className="h-10 w-[180px] rounded-full bg-white px-4 text-sm font-semibold text-primary hover:border-primary/50">
            <span>{currentSortLabel}</span>
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
