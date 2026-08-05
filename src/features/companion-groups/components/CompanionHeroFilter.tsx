import { Calendar, Compass, MapPin, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useTours } from '@/features/tours/hooks/useTours';
import { AppInput } from '@/shared/ui';

interface CompanionHeroFilterProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedTourId: string;
  onTourChange: (val: string) => void;
  selectedDate: string;
  onDateChange: (val: string) => void;
}

export function CompanionHeroFilter({
  searchQuery,
  onSearchChange,
  selectedTourId,
  onTourChange,
  selectedDate,
  onDateChange,
}: CompanionHeroFilterProps) {
  const [showFilters, setShowFilters] = useState(false);

  // Fetch list of active tours for filtering
  const { tours } = useTours({ size: 50 });

  const selectedTour = tours.find((t) => t.id === selectedTourId);

  return (
    <div className="pt-28 pb-12 px-4 sm:px-6 max-w-5xl mx-auto text-center">
      {/* Title & Subtitle */}
      <h1 className="text-4xl sm:text-5xl font-black text-primary tracking-tight">
        Tìm Bạn Đồng Hành
      </h1>
      <p className="mt-4 text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
        Kết nối với những người cùng đam mê để chinh phục những cung đường huyền thoại. Mỗi hành
        trình là một câu chuyện mới đang chờ bạn viết tiếp.
      </p>

      {/* Floating Pill Search & Filter Container matching design */}
      <div className="mt-10 bg-white/90 dark:bg-card/90 backdrop-blur-md border border-border/80 rounded-full p-2 sm:p-3 shadow-xl max-w-3xl mx-auto transition-all">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {/* Main Input search field */}
          <div className="relative flex-1 w-full flex items-center bg-muted/50 dark:bg-muted/30 rounded-full px-4 py-2.5">
            <Compass className="w-5 h-5 text-muted-foreground shrink-0 mr-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Bạn muốn tìm từ khóa gì?"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          {/* Filter Pills button group */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 justify-center">
            {/* Tour Select Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer border ${
                  selectedTourId
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-200/60 dark:border-emerald-800/40 hover:bg-emerald-200/70'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="max-w-[120px] truncate">
                  {selectedTour ? selectedTour.name : 'Chọn Tour'}
                </span>
              </button>
            </div>

            {/* Target Date Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer border ${
                  selectedDate
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-200/60 dark:border-emerald-800/40 hover:bg-emerald-200/70'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>{selectedDate || 'Ngày đi'}</span>
              </button>
            </div>

            {/* Filter Panel Toggle */}
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className="p-2 rounded-full bg-muted hover:bg-muted/80 text-foreground transition-colors cursor-pointer"
              aria-label="Mở bộ lọc chi tiết"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Filter Panel */}
      {showFilters && (
        <div className="mt-4 p-5 bg-card border border-border rounded-2xl shadow-lg max-w-3xl mx-auto text-left animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Tour selector dropdown */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Lọc Theo Tour
              </label>
              <select
                value={selectedTourId}
                onChange={(e) => onTourChange(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="">-- Tất cả các Tour --</option>
                {tours.map((tour) => (
                  <option key={tour.id} value={tour.id}>
                    {tour.name} ({tour.location})
                  </option>
                ))}
              </select>
              {selectedTourId && (
                <button
                  type="button"
                  onClick={() => onTourChange('')}
                  className="mt-2 text-[11px] text-muted-foreground underline hover:text-foreground cursor-pointer"
                >
                  Xóa lọc Tour
                </button>
              )}
            </div>

            {/* Date filter selector */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Ngày Khởi Hành Dự Kiến (targetDate)
              </label>
              <AppInput
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              />
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => onDateChange('')}
                  className="mt-2 text-[11px] text-muted-foreground underline hover:text-foreground cursor-pointer"
                >
                  Xóa lọc ngày
                </button>
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-border flex justify-end">
            <button
              type="button"
              onClick={() => setShowFilters(false)}
              className="px-5 py-1.5 bg-primary text-primary-foreground rounded-full text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Hoàn tất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
