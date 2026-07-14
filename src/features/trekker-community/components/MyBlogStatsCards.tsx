import { Eye, FileText, MessageCircle } from 'lucide-react';
import type { TrekkerBlogStats } from '../types';

interface MyBlogStatsCardsProps {
  stats: TrekkerBlogStats;
}

/**
 * Cụm 3 thẻ thống kê tổng quan cho trang "Blog của tôi".
 * - Tổng số bài viết
 * - Tổng lượt xem
 * - Bình luận mới
 */
export function MyBlogStatsCards({ stats }: MyBlogStatsCardsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
      }}
    >
      <StatCard
        icon={<FileText className="h-5 w-5" style={{ color: '#06261D' }} />}
        label="TỔNG SỐ BÀI"
        value={stats.totalPosts}
      />
      <StatCard
        icon={<Eye className="h-5 w-5" style={{ color: '#06261D' }} />}
        label="TỔNG LƯỢT XEM"
        value={stats.totalViews}
        format="k"
      />
      <StatCard
        icon={<MessageCircle className="h-5 w-5" style={{ color: '#06261D' }} />}
        label="BÌNH LUẬN MỚI"
        value={stats.newComments}
      />
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  format?: 'k' | undefined;
}

function StatCard({ icon, label, value, format }: StatCardProps) {
  const displayValue = format === 'k' && value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value;

  return (
    <div
      className="flex items-center gap-4"
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        border: '1px solid #E6E2D1',
        padding: '20px 24px',
      }}
    >
      {/* Icon circle */}
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: '#F0EEE6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      {/* Text */}
      <div>
        <p
          className="text-xs font-medium tracking-wide uppercase mb-1"
          style={{ color: '#6F7B75' }}
        >
          {label}
        </p>
        <p className="text-2xl font-bold leading-none" style={{ color: '#06261D' }}>
          {displayValue}
        </p>
      </div>
    </div>
  );
}
