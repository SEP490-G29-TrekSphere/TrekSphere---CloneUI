import { Compass, Lock, Mountain, Route, UserCheck, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GroupMatchingReviewScenario, PreviewView } from '../../types/groupMatchingTypes';
import { isViewAllowedForActor } from './AccessRestrictedState';

interface ReviewJourneyMapProps {
  scenario: GroupMatchingReviewScenario;
  onSelectStepView: (view: PreviewView) => void;
}

interface JourneyStepItem {
  id: PreviewView;
  title: string;
  subTitle: string;
  icon: React.ElementType;
}

const JOURNEY_STEPS: JourneyStepItem[] = [
  {
    id: 'discovery',
    title: '1. Khám phá',
    subTitle: 'Tìm nhóm & gợi ý',
    icon: Compass,
  },
  {
    id: 'outsider-detail',
    title: '2. Chi tiết nhóm',
    subTitle: 'Lịch trình & Đơn xin',
    icon: Mountain,
  },
  {
    id: 'applications',
    title: '3. Duyệt đơn',
    subTitle: 'Waitlist & Offer',
    icon: UserCheck,
  },
  {
    id: 'workspace',
    title: '4. Workspace',
    subTitle: 'Checklist & Quỹ',
    icon: Users,
  },
  {
    id: 'trip',
    title: '5. Chuyến đi & SOS',
    subTitle: 'Check-in & Cứu hộ',
    icon: Route,
  },
];

export function ReviewJourneyMap({ scenario, onSelectStepView }: ReviewJourneyMapProps) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-3 shadow-xs backdrop-blur-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-foreground tracking-tight">
            🗺️ Hành trình Ghép nhóm C2C (Review Navigation)
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground">
          Nhấp vào chặng bất kỳ để mở trực tiếp màn hình tương ứng
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {JOURNEY_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = scenario.activeView === step.id;
          const isAllowed = isViewAllowedForActor(step.id, scenario.actor);

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onSelectStepView(step.id)}
              className={cn(
                'relative flex flex-col items-start rounded-xl p-2.5 text-left transition border group cursor-pointer',
                isActive
                  ? 'bg-primary/10 border-primary text-primary shadow-xs ring-1 ring-primary/30'
                  : isAllowed
                    ? 'bg-background/80 border-border text-foreground hover:bg-muted hover:border-primary/40'
                    : 'bg-muted/40 border-dashed border-amber-500/30 text-muted-foreground hover:bg-muted'
              )}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-lg font-bold text-xs transition',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : isAllowed
                        ? 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-center gap-1">
                  {!isAllowed && (
                    <span className="flex items-center gap-0.5 rounded-md bg-amber-500/10 px-1.5 py-0.2 text-[9px] font-bold text-amber-700 dark:text-amber-400 border border-amber-500/20">
                      <Lock className="h-2.5 w-2.5" /> Khóa
                    </span>
                  )}
                  <span className="text-[10px] font-black text-muted-foreground/60">
                    Step {idx + 1}
                  </span>
                </div>
              </div>

              <span className="text-xs font-extrabold tracking-tight truncate w-full flex items-center justify-between">
                <span>{step.title}</span>
              </span>
              <span className="text-[10px] text-muted-foreground truncate w-full mt-0.5">
                {step.subTitle}
              </span>

              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
