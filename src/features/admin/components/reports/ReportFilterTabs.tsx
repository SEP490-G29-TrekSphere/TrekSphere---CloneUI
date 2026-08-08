export interface ReportFilterTabsProps {
  activeTab: 'all' | 'pending' | 'resolved' | 'dismissed';
  setActiveTab: (tab: 'all' | 'pending' | 'resolved' | 'dismissed') => void;
}

export function ReportFilterTabs({ activeTab, setActiveTab }: ReportFilterTabsProps) {
  return (
    <div className="flex items-center bg-[#E5E4DE]/60 p-1.5 rounded-full w-full overflow-x-auto whitespace-nowrap self-start md:self-auto border border-[#D5D4CE] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <button
        type="button"
        onClick={() => setActiveTab('all')}
        className={`px-5 py-1.5 text-xs font-bold rounded-full transition-all ${
          activeTab === 'all'
            ? 'bg-[#0B3025] text-white shadow-sm'
            : 'text-zinc-600 hover:text-zinc-900'
        }`}
      >
        Tất cả
      </button>
      <button
        type="button"
        onClick={() => setActiveTab('pending')}
        className={`px-5 py-1.5 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${
          activeTab === 'pending'
            ? 'bg-[#0B3025] text-white shadow-sm'
            : 'text-zinc-600 hover:text-zinc-900'
        }`}
      >
        Chờ xử lý
      </button>
      <button
        type="button"
        onClick={() => setActiveTab('resolved')}
        className={`px-5 py-1.5 text-xs font-bold rounded-full transition-all ${
          activeTab === 'resolved'
            ? 'bg-[#0B3025] text-white shadow-sm'
            : 'text-zinc-600 hover:text-zinc-900'
        }`}
      >
        Đã xử lý
      </button>
      <button
        type="button"
        onClick={() => setActiveTab('dismissed')}
        className={`px-5 py-1.5 text-xs font-bold rounded-full transition-all ${
          activeTab === 'dismissed'
            ? 'bg-[#0B3025] text-white shadow-sm'
            : 'text-zinc-600 hover:text-zinc-900'
        }`}
      >
        Bỏ qua
      </button>
    </div>
  );
}
