import { ArrowRight, CheckCircle2, SearchX } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/store/useToastStore';
import { CompanionGroupCard } from '../components/CompanionGroupCard';
import { CompanionHeroFilter } from '../components/CompanionHeroFilter';
import { CreateCompanionGroupModal } from '../components/CreateCompanionGroupModal';
import { MOCK_COMPANION_GROUPS } from '../data/mockCompanionGroups';
import type { CompanionDifficulty, CompanionGroup } from '../types';

export default function CompanionGroupsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Tất cả');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<CompanionDifficulty | 'All'>('All');
  const [joinModalGroup, setJoinModalGroup] = useState<CompanionGroup | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);

  // Filter logic
  const filteredGroups = useMemo(() => {
    return MOCK_COMPANION_GROUPS.filter((group) => {
      // Search query filter (title or description or tags)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = group.title.toLowerCase().includes(query);
        const matchLoc = group.location.toLowerCase().includes(query);
        const matchDesc = group.description?.toLowerCase().includes(query);
        if (!matchTitle && !matchLoc && !matchDesc) return false;
      }

      // Location filter
      if (selectedLocation !== 'Tất cả') {
        if (!group.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
          return false;
        }
      }

      // Difficulty filter
      if (selectedDifficulty !== 'All') {
        if (group.difficulty !== selectedDifficulty) return false;
      }

      return true;
    });
  }, [searchQuery, selectedLocation, selectedDifficulty]);

  const handleJoinGroup = (group: CompanionGroup) => {
    navigate(`/groups/${group.id}/join`);
  };

  const submitJoinRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinModalGroup) return;

    toast.success(`Đã gửi yêu cầu tham gia nhóm "${joinModalGroup.title}"! Leader sẽ duyệt sớm.`);
    setJoinModalGroup(null);
    setMessage('');
  };

  const displayedGroups = filteredGroups.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-[#faf8f1] dark:bg-background text-foreground pb-20">
      {/* Hero Section & Search Pill */}
      <CompanionHeroFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={setSelectedDifficulty}
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
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1f3933] hover:bg-[#162c28] text-white text-xs sm:text-sm font-bold rounded-full transition-all shadow-md cursor-pointer"
            >
              <span>+ Tạo nhóm ghép mới</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedLocation('Tất cả');
                setSelectedDifficulty('All');
                setSelectedDate('');
              }}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Group Cards Grid */}
        {displayedGroups.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {displayedGroups.map((group) => (
                <CompanionGroupCard key={group.id} group={group} onJoinGroup={handleJoinGroup} />
              ))}
            </div>

            {/* Load More Button */}
            {visibleCount < filteredGroups.length && (
              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 3)}
                  className="px-8 py-3 bg-white dark:bg-card border-2 border-stone-800 dark:border-stone-200 text-stone-900 dark:text-stone-100 rounded-full font-bold text-sm hover:bg-stone-900 hover:text-white dark:hover:bg-white dark:hover:text-stone-900 transition-all cursor-pointer shadow-sm"
                >
                  Tải thêm chuyến đi
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="py-16 text-center bg-white/60 dark:bg-card/40 rounded-3xl border border-dashed border-border max-w-xl mx-auto my-8 p-8">
            <SearchX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground">Không tìm thấy nhóm phù hợp</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Thử thay đổi từ khóa hoặc bộ lọc địa điểm / độ khó để xem thêm kết quả.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedLocation('Tất cả');
                setSelectedDifficulty('All');
                setSelectedDate('');
              }}
              className="mt-4 px-5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-full hover:opacity-90 transition-opacity"
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
              <span className="font-semibold text-foreground">{joinModalGroup.title}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Leader:{' '}
              <span className="font-semibold text-foreground">{joinModalGroup.leader.name}</span>
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
