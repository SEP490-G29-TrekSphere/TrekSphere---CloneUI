import { LayoutGrid, List, RotateCcw, SearchX } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { PATHS } from '@/constants';
import { TourPagination } from '@/features/tours';
import { useTours } from '@/features/tours/hooks/useTours';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { AppButton } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { CompanionGroupCard, type GroupCardData } from '../components/CompanionGroupCard';
import { CreateCompanionGroupModal } from '../components/CreateCompanionGroupModal';
import { useMatchingGroups } from '../hooks/useMatchingGroups';

const PAGE_SIZE = 9;

const sortOptions = [
  { value: 'createdAt-desc', label: 'Mới nhất' },
  { value: 'targetDate-asc', label: 'Ngày đi: Sớm nhất' },
  { value: 'targetDate-desc', label: 'Ngày đi: Muộn nhất' },
  { value: 'currentSize-desc', label: 'Nhiều thành viên nhất' },
];

const statusFilterOptions = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'OPEN', label: 'Đang mở' },
  { value: 'FULL', label: 'Đã đủ' },
  { value: 'CLOSED', label: 'Đã đóng' },
];

export default function CompanionGroupsPage() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const isGuest = !user;

  // --- Filter state ---
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [selectedTourId, setSelectedTourId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortKey, setSortKey] = useState('createdAt-desc');
  const [page, setPage] = useState(0);
  const [layout, setLayout] = useState<'list' | 'grid'>('grid');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: setPage is a stable useState setter
  useEffect(() => {
    setPage(0);
  }, [debouncedSearchQuery, selectedTourId, selectedDate, statusFilter, sortKey]);

  const [sortBy, sortDir] = sortKey.split('-') as [string, string];

  // --- Data ---
  const { data, isLoading, isError } = useMatchingGroups({
    keyword: debouncedSearchQuery || undefined,
    tourId: selectedTourId || undefined,
    targetDate: selectedDate || undefined,
    page,
    size: PAGE_SIZE,
    sortBy,
    sortDir,
  });

  const matchingGroups = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;
  const pageNumber = data?.pageNumber ?? 0;

  // Tours for sidebar filter dropdown
  const { tours: allTours } = useTours({ size: 50 });

  // Client-side status filter (API doesn't support it directly)
  const filteredGroups = useMemo(() => {
    if (statusFilter === 'ALL') return matchingGroups;
    return matchingGroups.filter((g) => g.status === statusFilter);
  }, [matchingGroups, statusFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTourId('');
    setSelectedDate('');
    setStatusFilter('ALL');
    setSortKey('createdAt-desc');
    setPage(0);
  };

  const handleJoinGroup = (group: GroupCardData) => {
    const groupId = 'matchingGroupId' in group ? group.matchingGroupId : group.id;
    navigate(`/groups/${groupId}/join`);
  };

  const handleViewDetail = (group: GroupCardData) => {
    const groupId = 'matchingGroupId' in group ? group.matchingGroupId : group.id;
    navigate(`/groups/${groupId}`);
  };

  const handlePageChange = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentSortLabel = sortOptions.find((o) => o.value === sortKey)?.label ?? 'Mới nhất';
  const isStatusFiltered = statusFilter !== 'ALL';

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="relative z-10">
        {/* Centered container matching ListTours */}
        <div className="mx-auto max-w-[1400px] w-full px-4 sm:px-6 lg:px-8">
          {/* ── Page header (search bar area) ── */}
          <div className="pt-10 pb-8 text-center sm:pt-14">
            <h1 className="text-3xl sm:text-4xl font-black text-primary tracking-tight">
              Tìm Bạn Đồng Hành
            </h1>
            <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Kết nối với những người cùng đam mê để chinh phục những cung đường huyền thoại.
            </p>

            {/* Search bar pill */}
            <div className="mt-7 mx-auto max-w-2xl bg-white border border-border rounded-full p-2 shadow-md flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-3">
                <svg
                  className="h-4 w-4 text-muted-foreground shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên nhóm, tour..."
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* ── Main 12-column grid (identical to ListTours) ── */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* LEFT: Sidebar filters */}
            <aside className="lg:col-span-3 flex flex-col gap-6">
              <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
                <h3 className="mb-5 text-lg font-bold text-primary">Bộ lọc</h3>

                {/* Filter: Tour */}
                <div className="mb-6">
                  <span className="mb-3 block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Tour
                  </span>
                  <select
                    value={selectedTourId}
                    onChange={(e) => setSelectedTourId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">-- Tất cả các Tour --</option>
                    {allTours.map((tour) => (
                      <option key={tour.id} value={tour.id}>
                        {tour.name}
                      </option>
                    ))}
                  </select>
                </div>

                <hr className="my-5 border-border" />

                {/* Filter: Ngày khởi hành */}
                <div className="mb-6">
                  <span className="mb-3 block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Ngày khởi hành
                  </span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <hr className="my-5 border-border" />

                {/* Filter: Trạng thái */}
                <div className="mb-6">
                  <span className="mb-3 block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Trạng thái
                  </span>
                  <div className="flex flex-col gap-2.5">
                    {statusFilterOptions.map((opt) => {
                      const isActive = statusFilter === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setStatusFilter(opt.value)}
                          aria-pressed={isActive}
                          className="flex items-center gap-3 text-left transition-colors hover:text-primary"
                        >
                          <span
                            className={cn(
                              'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all',
                              isActive ? 'border-primary bg-primary' : 'border-input bg-transparent'
                            )}
                          >
                            {isActive && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </span>
                          <span
                            className={cn(
                              'text-sm transition-all',
                              isActive ? 'font-semibold text-primary' : 'text-muted-foreground'
                            )}
                          >
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reset button */}
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="w-full rounded-xl border border-input py-2 text-center text-xs font-semibold text-primary transition-all hover:bg-muted"
                >
                  Làm mới bộ lọc
                </button>
              </div>
            </aside>

            {/* RIGHT: Results */}
            <main className="lg:col-span-9">
              {/* Results header row */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-primary">Nhóm ghép</h2>
                  <span className="text-xs text-muted-foreground">
                    {isStatusFiltered
                      ? `Hiển thị ${filteredGroups.length}/${matchingGroups.length} nhóm ở trang này`
                      : `Hiển thị ${totalElements} nhóm`}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Sort */}
                  <div className="flex items-center gap-2">
                    <span className="hidden text-xs text-muted-foreground sm:inline">Sắp xếp:</span>
                    <Select
                      value={sortKey}
                      onValueChange={(val) => {
                        if (val) setSortKey(val);
                      }}
                    >
                      <SelectTrigger className="h-10 rounded-full bg-white px-4 text-sm font-semibold text-primary hover:border-primary/50">
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

                  {/* Layout toggle */}
                  <div className="flex items-center gap-1 rounded-full border border-input bg-white p-1">
                    <button
                      type="button"
                      onClick={() => setLayout('list')}
                      aria-pressed={layout === 'list'}
                      className={cn(
                        'rounded-full p-1.5 transition-colors',
                        layout === 'list'
                          ? 'bg-primary text-white font-semibold'
                          : 'text-muted-foreground hover:bg-muted'
                      )}
                      aria-label="Hiển thị danh sách"
                    >
                      <List className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setLayout('grid')}
                      aria-pressed={layout === 'grid'}
                      className={cn(
                        'rounded-full p-1.5 transition-colors',
                        layout === 'grid'
                          ? 'bg-primary text-white font-semibold'
                          : 'text-muted-foreground hover:bg-muted'
                      )}
                      aria-label="Hiển thị lưới"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content area */}
              {isLoading ? (
                <GroupsSkeleton layout={layout} />
              ) : isError ? (
                <GroupsError onRetry={handleResetFilters} />
              ) : filteredGroups.length === 0 ? (
                <GroupsEmpty
                  isGuest={isGuest}
                  onLogin={() => navigate(PATHS.LOGIN)}
                  onReset={handleResetFilters}
                />
              ) : (
                <div
                  className={
                    layout === 'grid'
                      ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
                      : 'flex flex-col gap-5'
                  }
                >
                  {filteredGroups.map((group) => (
                    <CompanionGroupCard
                      key={group.matchingGroupId}
                      group={group}
                      layout={layout}
                      onJoinGroup={handleJoinGroup}
                      onViewDetail={handleViewDetail}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              <div className="mt-8">
                <TourPagination
                  pageNumber={pageNumber}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </main>
          </div>
        </div>

        <div className="h-16 sm:h-24" />
      </div>

      {/* Create modal */}
      <CreateCompanionGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function GroupsSkeleton({ layout }: { layout: 'list' | 'grid' }) {
  if (layout === 'grid') {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length skeleton
            key={`group-skeleton-${i}`}
            className="flex flex-col rounded-2xl bg-white shadow-sm ring-1 ring-border"
          >
            <div className="h-12 w-full animate-pulse rounded-t-2xl bg-muted" />
            <div className="flex flex-col p-4 gap-3">
              <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-8 w-28 animate-pulse rounded-full bg-muted mt-2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length skeleton
          key={`group-skeleton-${i}`}
          className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-border"
        >
          <div className="flex flex-1 flex-col gap-2 py-1">
            <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-7 w-28 animate-pulse rounded-full bg-muted mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

function GroupsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <svg
          className="h-10 w-10 text-destructive"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-primary">Không thể tải danh sách nhóm</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        Đã xảy ra lỗi kết nối. Vui lòng thử lại.
      </p>
      <AppButton onClick={onRetry}>
        <RotateCcw className="mr-2 h-4 w-4" />
        Thử lại
      </AppButton>
    </div>
  );
}

function GroupsEmpty({
  isGuest,
  onLogin,
  onReset,
}: {
  isGuest: boolean;
  onLogin: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <SearchX className="h-8 w-8" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-primary">
        {isGuest ? 'Đăng nhập để xem nhóm ghép' : 'Không tìm thấy nhóm phù hợp'}
      </h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        {isGuest
          ? 'Các nhóm ghép sẽ hiển thị sau khi bạn đăng nhập.'
          : 'Thử thay đổi bộ lọc hoặc từ khoá để xem thêm kết quả.'}
      </p>
      {isGuest ? (
        <AppButton onClick={onLogin}>Đăng nhập ngay</AppButton>
      ) : (
        <AppButton onClick={onReset}>Xóa tất cả bộ lọc</AppButton>
      )}
    </div>
  );
}
