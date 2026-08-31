import { Compass, Route, ShieldCheck, WalletCards } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type {
  MatchingGroupBudgetItem,
  MatchingGroupItineraryDay,
  MatchingGroupMatchReason,
} from '../../services/companionGroupService';

interface GroupOverviewTabsProps {
  ownerName: string;
  ownerAvatarUrl?: string;
  itinerary?: MatchingGroupItineraryDay[];
  budgetItems?: MatchingGroupBudgetItem[];
  journeyIntro?: string[];
  matchPercent?: number;
  matchReasons?: MatchingGroupMatchReason[];
}

const TABS = [
  { id: 'overview', label: 'Tổng quan', icon: Compass },
  { id: 'itinerary', label: 'Lộ trình', icon: Route },
  { id: 'budget', label: 'Dự toán', icon: WalletCards },
  { id: 'rules', label: 'Cam kết & An toàn', icon: ShieldCheck },
] as const;

type TabId = (typeof TABS)[number]['id'];

function formatVnd(amount: number) {
  return `${amount.toLocaleString('vi-VN')} đ`;
}

/**
 * Khối tab "Tổng quan / Lộ trình / Dự toán / Cam kết" cho trang chi tiết nhóm ghép —
 * tái hiện phong cách thiết kế của GroupDetailOutsiderView (story-flow review) nhưng
 * nối với dữ liệu nhóm thật thay vì dữ liệu tĩnh minh hoạ.
 */
export function GroupOverviewTabs({
  ownerName,
  ownerAvatarUrl,
  itinerary = [],
  budgetItems = [],
  journeyIntro = [],
  matchPercent,
  matchReasons = [],
}: GroupOverviewTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const budgetTotal = budgetItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      <div className="scrollbar-none flex overflow-x-auto rounded-2xl border border-border bg-card p-1.5 shadow-xs">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition',
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center gap-3.5 border-b border-border pb-4">
              {ownerAvatarUrl ? (
                <img
                  src={ownerAvatarUrl}
                  alt={ownerName}
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/20"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-200 text-sm font-bold text-emerald-900">
                  {ownerName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-base font-extrabold text-foreground">{ownerName}</h3>
                <p className="text-xs text-muted-foreground">Trưởng nhóm khởi xướng</p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Trưởng nhóm chịu trách nhiệm điều phối lịch trình, duyệt thành viên tham gia và quản
              lý nhóm chat chung trong suốt chuyến đi.
            </p>
          </div>

          {matchReasons.length > 0 && (
            <div className="space-y-3 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-5">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                <Compass className="h-5 w-5 shrink-0" />
                <h4 className="text-sm font-extrabold">
                  Vì sao bạn hợp cạ {matchPercent ?? 0}% với nhóm này?
                </h4>
              </div>
              <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                {matchReasons.map((reason) => (
                  <div
                    key={reason.label}
                    className="space-y-1 rounded-2xl border border-emerald-500/20 bg-background/80 p-3"
                  >
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      ✓ {reason.label}
                    </span>
                    <p className="text-muted-foreground">{reason.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {journeyIntro.length > 0 && (
            <div className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-xs">
              <h3 className="text-base font-extrabold text-foreground">
                Giới thiệu chi tiết hành trình
              </h3>
              <div className="space-y-3 text-xs leading-6 text-muted-foreground">
                {journeyIntro.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'itinerary' && (
        <div className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-xs">
          <h3 className="border-b border-border pb-3 text-base font-extrabold text-foreground">
            Lộ trình dự kiến
          </h3>
          {itinerary.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Trưởng nhóm chưa cập nhật lộ trình chi tiết cho chuyến đi này.
            </p>
          ) : (
            <div className="relative space-y-6 pl-6 text-xs text-muted-foreground before:absolute before:bottom-2 before:left-2.5 before:top-2 before:w-0.5 before:bg-border">
              {itinerary.map((day) => (
                <div key={day.day}>
                  <strong className="block font-bold text-foreground">
                    Ngày {day.day}: {day.title}
                  </strong>
                  <p className="mt-1">{day.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'budget' && (
        <div className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-base font-extrabold text-foreground">Dự toán chi phí chia đều</h3>
            {budgetItems.length > 0 && (
              <span className="text-lg font-black text-emerald-600">
                {formatVnd(budgetTotal)} / người
              </span>
            )}
          </div>
          {budgetItems.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Trưởng nhóm chưa cập nhật dự toán chi phí cho chuyến đi này.
            </p>
          ) : (
            <div className="space-y-2 text-xs">
              {budgetItems.map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between rounded-xl border border-border bg-background p-3"
                >
                  <span>{item.label}</span>
                  <strong>{formatVnd(item.amount)}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="space-y-4 rounded-3xl border border-border bg-card p-6 text-xs shadow-xs">
          <h3 className="border-b border-border pb-3 text-base font-extrabold text-foreground">
            Cam kết & Nguyên tắc đồng hành
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1 rounded-2xl border border-border bg-background p-4">
              <strong className="block font-bold text-foreground">Tuân thủ kỷ luật nhóm</strong>
              <p className="text-muted-foreground">
                Luôn giữ khoảng cách an toàn, nghe hướng dẫn trưởng nhóm & không tự tách đoàn.
              </p>
            </div>
            <div className="space-y-1 rounded-2xl border border-border bg-background p-4">
              <strong className="block font-bold text-foreground">Nguyên tắc Leave No Trace</strong>
              <p className="text-muted-foreground">
                Mang toàn bộ rác cá nhân xuống núi, giữ gìn cảnh quan thiên nhiên nguyên sơ.
              </p>
            </div>
            <div className="space-y-1 rounded-2xl border border-border bg-background p-4">
              <strong className="block font-bold text-foreground">Chia sẻ chi phí minh bạch</strong>
              <p className="text-muted-foreground">
                Đóng góp đúng theo dự toán, giữ hoá đơn để đối soát khi kết thúc chuyến đi.
              </p>
            </div>
            <div className="space-y-1 rounded-2xl border border-border bg-background p-4">
              <strong className="block font-bold text-foreground">An toàn là ưu tiên số 1</strong>
              <p className="text-muted-foreground">
                Báo ngay cho trưởng nhóm hoặc dùng SOS khi gặp sự cố trong hành trình.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
