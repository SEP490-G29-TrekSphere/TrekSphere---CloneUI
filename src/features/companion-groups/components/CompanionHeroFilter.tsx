import { Calendar, Compass, MapPin, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import type { CompanionDifficulty } from '../types';

interface CompanionHeroFilterProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedLocation: string;
  onLocationChange: (val: string) => void;
  selectedDate: string;
  onDateChange: (val: string) => void;
  selectedDifficulty: CompanionDifficulty | 'All';
  onDifficultyChange: (val: CompanionDifficulty | 'All') => void;
}

export function CompanionHeroFilter({
  searchQuery,
  onSearchChange,
  selectedLocation,
  onLocationChange,
  selectedDate,
  onDateChange,
  selectedDifficulty,
  onDifficultyChange,
}: CompanionHeroFilterProps) {
  const [showFilters, setShowFilters] = useState(false);

  const LOCATIONS = ['Tất cả', 'Lào Cai', 'Lâm Đồng', 'Đồng Nai', 'Thanh Hóa', 'Sơn La'];
  const DIFFICULTIES: Array<CompanionDifficulty | 'All'> = ['All', 'Dễ', 'Vừa', 'Khó', 'Rất khó'];

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
              placeholder="Bạn muốn đi đâu?"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          {/* Filter Pills button group */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 justify-center">
            {/* Location Filter Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer border ${
                  selectedLocation !== 'Tất cả'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-200/60 dark:border-emerald-800/40 hover:bg-emerald-200/70'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{selectedLocation !== 'Tất cả' ? selectedLocation : 'Địa điểm'}</span>
              </button>
            </div>

            {/* Date Filter Pill */}
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
                <span>{selectedDate || 'Thời gian'}</span>
              </button>
            </div>

            {/* Difficulty Filter Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer border ${
                  selectedDifficulty !== 'All'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-200/60 dark:border-emerald-800/40 hover:bg-emerald-200/70'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {selectedDifficulty !== 'All' ? `Khó: ${selectedDifficulty}` : 'Độ khó'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Filter Panel */}
      {showFilters && (
        <div className="mt-4 p-5 bg-card border border-border rounded-2xl shadow-lg max-w-3xl mx-auto text-left animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Location selector */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Lọc Địa Điểm
              </label>
              <div className="flex flex-wrap gap-1.5">
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => onLocationChange(loc)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedLocation === loc
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty selector */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Mức Độ Khó
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DIFFICULTIES.map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => onDifficultyChange(diff)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedDifficulty === diff
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    }`}
                  >
                    {diff === 'All' ? 'Tất cả' : diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Date filter selector */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Thời Gian Khởi Hành
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => onDateChange('')}
                  className="mt-2 text-[11px] text-muted-foreground underline hover:text-foreground"
                >
                  Xóa lọc ngày
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border flex justify-end">
            <button
              type="button"
              onClick={() => setShowFilters(false)}
              className="px-4 py-1.5 bg-primary text-primary-foreground rounded-full text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Hoàn tất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
