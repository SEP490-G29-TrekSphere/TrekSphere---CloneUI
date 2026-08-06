import { LayoutGrid, List, RotateCcw, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { PATHS } from '@/constants';
import { TourPagination } from '@/features/tours';
import { useTours } from '@/features/tours/hooks/useTours';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { AppButton, AppDatePicker } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { CompanionGroupCard, type GroupCardData } from '../components/CompanionGroupCard';
import { CreateCompanionGroupModal } from '../components/CreateCompanionGroupModal';
import { useMyMatchingGroups } from '../hooks/useMyMatchingGroups';

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

const roleTabs = [
  { value: 'ALL', label: 'Tất cả nhóm' },
  { value: 'OWNER', label: 'Nhóm tôi làm trưởng' },
  { value: 'MEMBER', label: 'Nhóm tôi tham gia' },
];

function getGroupProperties(group: GroupCardData) {
  const isApi = 'matchingGroupId' in group;
  return {
    ownerId: isApi ? group.ownerId : group.leader.id,
    groupName: isApi ? group.groupName : group.title,
    tourName: isApi ? group.tourName : group.location,
    status: isApi ? group.status : 'OPEN',
    tourId: isApi ? group.tourId : group.id,
    targetDate: isApi ? group.targetDate : group.departureDate,
  };
}

export default function MyCompanionGroupsPage() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const isGuest = !user;

  // Protect route
  useEffect(() => {
    if (isGuest) {
      navigate(PATHS.LOGIN);
    }
  }, [isGuest, navigate]);

  // --- Filter & UI state ---
  const [activeTab, setActiveTab] = useState<'ALL' | 'OWNER' | 'MEMBER'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [selectedTourId, setSelectedTourId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortKey, setSortKey] = useState('createdAt-desc');
  const [page, setPage] = useState(0);
  const [layout, setLayout] = useState<'list' | 'grid'>('grid');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Reset page on filter change
  // biome-ignore lint/correctness/useExhaustiveDependencies: setPage is stable
  useEffect(() => {
    setPage(0);
  }, [debouncedSearchQuery, selectedTourId, selectedDate, statusFilter, sortKey, activeTab]);

  const [sortBy, sortDir] = sortKey.split('-') as [string, string];

  // --- Data Loading ---
  const {
    data: myGroupsData,
    isLoading,
    isError,
  } = useMyMatchingGroups({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    keyword: debouncedSearchQuery || undefined,
    page,
    size: PAGE_SIZE,
    sortBy,
    sortDir,
  });

  // All tours for select dropdown
  const { tours: allTours } = useTours({ size: 50 });

  // Compute final groups list
  const finalGroups = useMemo(() => {
    if (isGuest || !user) return [];

    let list: GroupCardData[] = [];

    if (myGroupsData?.content) {
      list = myGroupsData.content;
    }

    // Apply Client-Side Tab Filter
    if (activeTab === 'OWNER') {
      list = list.filter((g) => getGroupProperties(g).ownerId === user.id);
    } else if (activeTab === 'MEMBER') {
      // For MEMBER tab, show groups where the user is NOT the owner but is part of the group.
      list = list.filter((g) => getGroupProperties(g).ownerId !== user.id);
    }

    // Apply client-side tour filter
    if (selectedTourId) {
      list = list.filter((g) => getGroupProperties(g).tourId === selectedTourId);
    }

    // Apply client-side date filter
    if (selectedDate) {
      list = list.filter((g) => getGroupProperties(g).targetDate === selectedDate);
    }

    return list;
  }, [isGuest, user, myGroupsData, activeTab, selectedTourId, selectedDate]);

  // Paginated client-side or server-side numbers
  const totalElements = myGroupsData?.totalElements ?? 0;
  const totalPages = myGroupsData?.totalPages ?? 0;
  const pageNumber = myGroupsData?.pageNumber ?? 0;

  const displayedGroups = finalGroups;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTourId('');
    setSelectedDate('');
    setStatusFilter('ALL');
    setSortKey('createdAt-desc');
    setPage(0);
    setActiveTab('ALL');
  };

  const handleCreateClick = () => {
    setIsCreateModalOpen(true);
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
  };

  const currentSortLabel = sortOptions.find((o) => o.value === sortKey)?.label ?? 'Mới nhất';

  if (isGuest) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Page Header ── */}
      <div className="pb-8">
        <h1 className="text-3xl font-black text-[#06261D] tracking-tight">Nhóm Của Tôi</h1>
        <p className="mt-2 text-sm text-[#6F7B75]">
          Quản lý các nhóm ghép bạn đã tạo hoặc đã tham gia để cùng đồng hành.
        </p>

        {/* Search bar & Create group button */}
        <div className="mt-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="w-full sm:max-w-md bg-white border border-[#E0DCD1] rounded-full p-2 shadow-xs flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3">
              <svg
                className="h-4 w-4 text-[#6F7B75] shrink-0"
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
                className="w-full bg-transparent text-sm text-[#06261D] placeholder:text-[#6F7B75] focus:outline-none"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleCreateClick}
            className="flex items-center gap-1.5 rounded-full bg-[#06261D] hover:bg-[#0B3025] px-5 py-2.5 text-xs font-bold text-white transition-all shrink-0 shadow-sm cursor-pointer"
          >
            + Tạo nhóm mới
          </button>
        </div>
      </div>

      {/* ── Tabs selector ── */}
      <div className="flex border-b border-[#E0DCD1] mb-6 gap-6">
        {roleTabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value as 'ALL' | 'OWNER' | 'MEMBER')}
              className={cn(
                'pb-3 text-sm font-semibold transition-all border-b-2 px-1 relative',
                isActive
                  ? 'border-[#06261D] text-[#06261D]'
                  : 'border-transparent text-[#6F7B75] hover:text-[#06261D]'
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Main Grid Layout ── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* LEFT: Sidebar filters */}
        <aside className="lg:col-span-3 flex flex-col gap-6">
          <div className="rounded-2xl border border-[#E0DCD1] bg-white p-5 shadow-xs">
            <h3 className="mb-5 text-base font-bold text-[#06261D]">Bộ lọc</h3>

            {/* Filter: Tour */}
            <div className="mb-6">
              <span className="mb-2 block text-[10px] font-bold tracking-wider text-[#6F7B75] uppercase">
                Tour
              </span>
              <select
                value={selectedTourId}
                onChange={(e) => setSelectedTourId(e.target.value)}
                className="w-full rounded-xl border border-[#E0DCD1] bg-white px-3 py-2 text-xs text-[#06261D] focus:outline-none focus:ring-1 focus:ring-[#06261D]"
              >
                <option value="">-- Tất cả các Tour --</option>
                {allTours.map((tour) => (
                  <option key={tour.id} value={tour.id}>
                    {tour.name}
                  </option>
                ))}
              </select>
            </div>

            <hr className="my-5 border-[#E0DCD1]" />

            {/* Filter: Ngày khởi hành */}
            <div className="mb-6">
              <span className="mb-2 block text-[10px] font-bold tracking-wider text-[#6F7B75] uppercase">
                Ngày khởi hành
              </span>
              <AppDatePicker
                selected={selectedDate ? new Date(selectedDate) : null}
                onChange={(date: Date | null) => {
                  if (!date) {
                    setSelectedDate('');
                    return;
                  }
                  const offset = date.getTimezoneOffset();
                  const localDate = new Date(date.getTime() - offset * 60 * 1000);
                  setSelectedDate(localDate.toISOString().split('T')[0]);
                }}
                className="w-full rounded-xl border border-[#E0DCD1] bg-white px-3 py-2 text-xs text-[#06261D] focus:outline-none focus:ring-1 focus:ring-[#06261D] cursor-pointer"
                placeholderText="Chọn ngày khởi hành"
              />
            </div>

            <hr className="my-5 border-[#E0DCD1]" />

            {/* Filter: Trạng thái */}
            <div className="mb-6">
              <span className="mb-3 block text-[10px] font-bold tracking-wider text-[#6F7B75] uppercase">
                Trạng thái nhóm
              </span>
              <div className="flex flex-col gap-2.5">
                {statusFilterOptions.map((opt) => {
                  const isActive = statusFilter === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStatusFilter(opt.value)}
                      className="flex items-center gap-3 text-left transition-colors hover:text-[#06261D]"
                    >
                      <span
                        className={cn(
                          'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all',
                          isActive
                            ? 'border-[#06261D] bg-[#06261D]'
                            : 'border-[#E0DCD1] bg-transparent'
                        )}
                      >
                        {isActive && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </span>
                      <span
                        className={cn(
                          'text-xs transition-all',
                          isActive ? 'font-semibold text-[#06261D]' : 'text-[#6F7B75]'
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
              className="w-full rounded-xl border border-[#E0DCD1] py-2 text-center text-xs font-semibold text-[#06261D] transition-all hover:bg-neutral-50 cursor-pointer"
            >
              Làm mới bộ lọc
            </button>
          </div>
        </aside>

        {/* RIGHT: Results */}
        <main className="lg:col-span-9">
          {/* Results header row */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#E0DCD1] pb-4">
            <div>
              <h2 className="text-xl font-bold text-[#06261D]">Danh sách nhóm ({totalElements})</h2>
            </div>

            <div className="flex items-center gap-4">
              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="hidden text-xs text-[#6F7B75] sm:inline">Sắp xếp:</span>
                <Select
                  value={sortKey}
                  onValueChange={(val) => {
                    if (val) setSortKey(val);
                  }}
                >
                  <SelectTrigger className="h-9 rounded-full bg-white border-[#E0DCD1] px-4 text-xs font-semibold text-[#06261D] hover:border-[#06261D]/50 focus:ring-0">
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
              <div className="flex items-center gap-1 rounded-full border border-[#E0DCD1] bg-white p-1">
                <button
                  type="button"
                  onClick={() => setLayout('list')}
                  className={cn(
                    'rounded-full p-1.5 transition-colors cursor-pointer',
                    layout === 'list'
                      ? 'bg-[#06261D] text-white font-semibold'
                      : 'text-[#6F7B75] hover:bg-neutral-50'
                  )}
                  aria-label="Hiển thị danh sách"
                >
                  <List className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setLayout('grid')}
                  className={cn(
                    'rounded-full p-1.5 transition-colors cursor-pointer',
                    layout === 'grid'
                      ? 'bg-[#06261D] text-white font-semibold'
                      : 'text-[#6F7B75] hover:bg-neutral-50'
                  )}
                  aria-label="Hiển thị lưới"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content area */}
          {isLoading ? (
            <GroupsSkeleton layout={layout} />
          ) : isError ? (
            <GroupsError onRetry={handleResetFilters} />
          ) : displayedGroups.length === 0 ? (
            <GroupsEmpty onReset={handleResetFilters} activeTab={activeTab} />
          ) : (
            <div
              className={
                layout === 'grid'
                  ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
                  : 'flex flex-col gap-5'
              }
            >
              {displayedGroups.map((group) => (
                <CompanionGroupCard
                  key={'matchingGroupId' in group ? group.matchingGroupId : group.id}
                  group={group}
                  layout={layout}
                  onJoinGroup={handleJoinGroup}
                  onViewDetail={handleViewDetail}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <TourPagination
                pageNumber={pageNumber}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </main>
      </div>

      {/* Create modal */}
      <CreateCompanionGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}

// ── Skeletons and Empty States ──

function GroupsSkeleton({ layout }: { layout: 'list' | 'grid' }) {
  const skeletonIds = ['sk-1', 'sk-2', 'sk-3'];
  if (layout === 'grid') {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {skeletonIds.map((id) => (
          <div
            key={`skeleton-grid-${id}`}
            className="flex flex-col rounded-2xl bg-white shadow-xs ring-1 ring-[#E0DCD1] p-4 gap-3"
          >
            <div className="h-28 w-full animate-pulse rounded-xl bg-neutral-100" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-neutral-100" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-100" />
            <div className="h-7 w-20 animate-pulse rounded-full bg-neutral-100 mt-2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {skeletonIds.map((id) => (
        <div
          key={`skeleton-list-${id}`}
          className="flex gap-4 rounded-2xl bg-white p-4 shadow-xs ring-1 ring-[#E0DCD1]"
        >
          <div className="flex flex-1 flex-col gap-2 py-1">
            <div className="h-5 w-2/3 animate-pulse rounded bg-neutral-100" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-100" />
            <div className="h-7 w-20 animate-pulse rounded-full bg-neutral-100 mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

function GroupsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
        <RotateCcw className="h-8 w-8" />
      </div>
      <h3 className="mb-2 text-base font-bold text-[#06261D]">Không thể tải danh sách nhóm</h3>
      <p className="mb-6 max-w-sm text-xs text-[#6F7B75]">
        Đã xảy ra lỗi kết nối với máy chủ. Vui lòng kiểm tra lại.
      </p>
      <AppButton onClick={onRetry}>Thử lại</AppButton>
    </div>
  );
}

function GroupsEmpty({ onReset, activeTab }: { onReset: () => void; activeTab: string }) {
  const message = useMemo(() => {
    if (activeTab === 'OWNER') return 'Bạn chưa tạo nhóm ghép nào.';
    if (activeTab === 'MEMBER') return 'Bạn chưa tham gia nhóm ghép nào.';
    return 'Bạn chưa có nhóm ghép nào.';
  }, [activeTab]);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-[#E0DCD1] rounded-2xl">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-[#06261D]">
        <Users className="h-8 w-8" />
      </div>
      <h3 className="mb-2 text-base font-bold text-[#06261D]">{message}</h3>
      <p className="mb-6 max-w-sm text-xs text-[#6F7B75]">
        Hãy tạo nhóm mới hoặc tìm kiếm những người bạn đồng hành cho chuyến đi sắp tới của bạn.
      </p>
      <AppButton onClick={onReset} className="bg-[#06261D] hover:bg-[#0B3025] text-white">
        Xem tất cả nhóm
      </AppButton>
    </div>
  );
}
