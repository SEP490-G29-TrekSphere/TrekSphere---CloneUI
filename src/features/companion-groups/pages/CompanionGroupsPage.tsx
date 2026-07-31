import { CheckCircle2, Loader2, LogIn, SearchX } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/constants';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { CompanionGroupCard, type GroupCardData } from '../components/CompanionGroupCard';
import { CompanionHeroFilter } from '../components/CompanionHeroFilter';
import { CreateCompanionGroupModal } from '../components/CreateCompanionGroupModal';
import { useMatchingGroups } from '../hooks/useMatchingGroups';

export default function CompanionGroupsPage() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const isGuest = !user;
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const [selectedTourId, setSelectedTourId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 9;

  const [joinModalGroup, setJoinModalGroup] = useState<GroupCardData | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleCreateClick = () => {
    if (isGuest) {
      navigate(PATHS.LOGIN);
      return;
    }
    setIsCreateModalOpen(true);
  };

  // API Integration hook for GET /api/v1/matching-groups
  const { data, isLoading, isError } = useMatchingGroups({
    keyword: debouncedSearchQuery || undefined,
    tourId: selectedTourId || undefined,
    targetDate: selectedDate || undefined,
    page,
    size: pageSize,
    sortBy: 'createdAt',
    sortDir: 'desc',
  });

  const matchingGroups = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const isLastPage = data?.last ?? true;

  const handleJoinGroup = (group: GroupCardData) => {
    const groupId = 'matchingGroupId' in group ? group.matchingGroupId : group.id;
    navigate(`/groups/${groupId}/join`);
  };

  const handleViewDetail = (group: GroupCardData) => {
    const groupId = 'matchingGroupId' in group ? group.matchingGroupId : group.id;
    navigate(`/groups/${groupId}`);
  };

  const submitJoinRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinModalGroup) return;

    const groupTitle =
      'matchingGroupId' in joinModalGroup ? joinModalGroup.groupName : joinModalGroup.title;
    toast.success(`Đã gửi yêu cầu tham gia nhóm "${groupTitle}"! Leader sẽ duyệt sớm.`);
    setJoinModalGroup(null);
    setMessage('');
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTourId('');
    setSelectedDate('');
    setPage(0);
  };

  return (
    <div className="min-h-screen bg-[#faf8f1] dark:bg-background text-foreground pb-20">
      {/* Hero Section & Search Pill */}
      <CompanionHeroFilter
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setPage(0);
        }}
        selectedTourId={selectedTourId}
        onTourChange={(val) => {
          setSelectedTourId(val);
          setPage(0);
        }}
        selectedDate={selectedDate}
        onDateChange={(val) => {
          setSelectedDate(val);
          setPage(0);
        }}
      />

      {/* Main Content Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {/* Section Header matching design mockup */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Chuyến đi mới nhất
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Khám phá các nhóm đang tuyển thành viên hoặc tự tạo nhóm của riêng bạn
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleCreateClick}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1f3933] hover:bg-[#162c28] text-white text-xs sm:text-sm font-bold rounded-full transition-all shadow-md cursor-pointer"
            >
              <span>+ Tạo nhóm ghép mới</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              Đang tải danh sách nhóm ghép...
            </p>
          </div>
        ) : isError ? (
          /* Error State */
          <div className="py-16 text-center bg-red-50 dark:bg-red-950/20 rounded-3xl border border-red-200 dark:border-red-900/40 max-w-xl mx-auto my-8 p-8">
            <h3 className="text-lg font-bold text-red-700 dark:text-red-400">
              Không tìm thấy nhóm phù hợp
            </h3>
            <p className="text-xs text-red-600 dark:text-red-300 mt-1">
              Không có dữ liệu nhóm ghép cho từ khóa hoặc ngày khởi hành đã chọn.
            </p>
            <div className="mt-4 flex items-center justify-center">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-6 py-2.5 bg-red-600 text-white text-xs font-semibold rounded-full hover:bg-red-700 transition-colors cursor-pointer shadow-sm"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        ) : matchingGroups.length > 0 ? (
          <>
            {/* Group Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {matchingGroups.map((group) => (
                <CompanionGroupCard
                  key={group.matchingGroupId}
                  group={group}
                  onJoinGroup={handleJoinGroup}
                  onViewDetail={handleViewDetail}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                  className="px-5 py-2.5 bg-white dark:bg-card border border-stone-300 dark:border-stone-700 rounded-full font-semibold text-xs sm:text-sm text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer shadow-sm"
                >
                  Trang trước
                </button>

                <span className="text-xs sm:text-sm font-medium text-muted-foreground px-2">
                  Trang <strong className="text-foreground">{page + 1}</strong> / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={isLastPage || page >= totalPages - 1}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="px-5 py-2.5 bg-[#1f3933] hover:bg-[#162c28] text-white rounded-full font-semibold text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                >
                  Trang sau
                </button>
              </div>
            )}
          </>
        ) : isGuest ? (
          /* Guest Empty State — mời đăng nhập */
          <div className="py-16 text-center bg-white/60 dark:bg-card/40 rounded-3xl border border-dashed border-border max-w-xl mx-auto my-8 p-8">
            <LogIn className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground">Đăng nhập để xem nhóm ghép</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Các nhóm ghép công khai sẽ hiển thị sau khi bạn đăng nhập vào tài khoản.
            </p>
            <button
              type="button"
              onClick={() => navigate(PATHS.LOGIN)}
              className="mt-4 px-5 py-2 bg-[#1f3933] text-white text-xs font-semibold rounded-full hover:bg-[#162c28] transition-colors cursor-pointer shadow-sm"
            >
              Đăng nhập ngay
            </button>
          </div>
        ) : (
          /* Empty State */
          <div className="py-16 text-center bg-white/60 dark:bg-card/40 rounded-3xl border border-dashed border-border max-w-xl mx-auto my-8 p-8">
            <SearchX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground">Không tìm thấy nhóm phù hợp</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Thử thay đổi từ khóa hoặc chọn ngày khác để xem thêm kết quả.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 px-5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-full hover:opacity-90 transition-opacity cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </main>

      {/* Join Request Modal */}
      {joinModalGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <h3 className="text-xl font-bold text-foreground">Xin Tham Gia Nhóm</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Chuyến đi:{' '}
              <span className="font-semibold text-foreground">
                {'matchingGroupId' in joinModalGroup
                  ? joinModalGroup.groupName
                  : joinModalGroup.title}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Leader:{' '}
              <span className="font-semibold text-foreground">
                {'matchingGroupId' in joinModalGroup
                  ? joinModalGroup.ownerName
                  : joinModalGroup.leader.name}
              </span>
            </p>

            <form onSubmit={submitJoinRequest} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Lời nhắn gửi Trưởng nhóm (Không bắt buộc)
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Giới thiệu bản thân ngắn gọn, kinh nghiệm trekking hoặc thắc mắc của bạn..."
                  className="w-full bg-muted/60 border border-border rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setJoinModalGroup(null)}
                  className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-[#1f3933] hover:bg-[#162c28] text-white text-xs font-bold rounded-full transition-all cursor-pointer shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Gửi yêu cầu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Companion Group Modal */}
      <CreateCompanionGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
