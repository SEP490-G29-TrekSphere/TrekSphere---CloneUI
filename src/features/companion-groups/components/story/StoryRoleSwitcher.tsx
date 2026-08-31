import { Crown, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StoryViewingAs } from '../../hooks/useGroupJoinStoryFlow';

interface StoryRoleSwitcherProps {
  viewingAs: StoryViewingAs;
  onChange: (viewingAs: StoryViewingAs) => void;
}

/**
 * Toggle nhỏ "giả lập đổi role" tại chỗ — KHÔNG phải bảng điều khiển ReviewScenarioToolbar.
 * Chỉ đổi góc nhìn cục bộ trong story flow (Chủ nhóm ⇄ Tôi/ứng viên), không đụng role thật.
 */
export function StoryRoleSwitcher({ viewingAs, onChange }: StoryRoleSwitcherProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 p-1">
      <span className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
        Xem như (demo):
      </span>
      <button
        type="button"
        onClick={() => onChange('ME')}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition',
          viewingAs === 'ME'
            ? 'bg-primary text-primary-foreground shadow-xs'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <User className="h-3.5 w-3.5" /> Tôi (ứng viên/thành viên)
      </button>
      <button
        type="button"
        onClick={() => onChange('OWNER')}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition',
          viewingAs === 'OWNER'
            ? 'bg-amber-600 text-white shadow-xs'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Crown className="h-3.5 w-3.5" /> Chủ nhóm
      </button>
    </div>
  );
}

export default StoryRoleSwitcher;
