import { Compass, Globe, Lock, Route as RouteIcon, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
// Modals
import {
  LeaderVettingModal,
  MatchDetailsModal,
  SosEmergencyModal,
  TripDeclarationWizardModal,
} from '../components/modals/GroupMatchingModals';
import { ApplicationsPreview } from '../components/overview/ApplicationsPreview';
import { DiscoveryPreview } from '../components/overview/DiscoveryPreview';
// Subcomponents
import { GroupDetailOutsiderView } from '../components/overview/GroupDetailOutsiderView';
import { TripPreview } from '../components/overview/TripPreview';
import { WorkspacePreview } from '../components/overview/WorkspacePreview';
import { groupRecommendations } from '../data/groupMatchingMocks';
// Types & Mock data
import type { GroupRecommendation, PreviewView } from '../types/groupMatchingTypes';

interface GroupMatchingOverviewPageProps {
  initialMode?: '/' | '/inGroup' | 'inGroup';
}

export function GroupMatchingOverviewPage({ initialMode }: GroupMatchingOverviewPageProps = {}) {
  const location = useLocation();

  // Detect route mode from URL path or prop
  const isUrlInGroup =
    location.pathname.includes('/inGroup') ||
    initialMode === '/inGroup' ||
    initialMode === 'inGroup';

  // Main Route mode: '/' (Chưa vào nhóm) vs '/inGroup' (Đã ở trong nhóm)
  const [currentRouteMode, setCurrentRouteMode] = useState<'/' | '/inGroup'>(
    isUrlInGroup ? '/inGroup' : '/'
  );
  const [activeView, setActiveView] = useState<PreviewView>(
    isUrlInGroup ? 'workspace' : 'outsider-detail'
  );

  useEffect(() => {
    if (location.pathname.includes('/inGroup')) {
      setCurrentRouteMode('/inGroup');
      setActiveView('workspace');
    }
  }, [location.pathname]);

  const [selectedMatchGroup, setSelectedMatchGroup] = useState<GroupRecommendation | null>(
    groupRecommendations[0]
  );

  // Modal States
  const [isJoinWizardOpen, setIsJoinWizardOpen] = useState<boolean>(false);
  const [isMatchDetailsOpen, setIsMatchDetailsOpen] = useState<boolean>(false);
  const [isLeaderVettingOpen, setIsLeaderVettingOpen] = useState<boolean>(false);
  const [isSosOpen, setIsSosOpen] = useState<boolean>(false);

  const handleSwitchRouteMode = (mode: '/' | '/inGroup') => {
    setCurrentRouteMode(mode);
    if (mode === '/') {
      setActiveView('outsider-detail');
    } else {
      setActiveView('workspace');
    }
  };

  const handleOpenMatchDetails = (group: GroupRecommendation) => {
    setSelectedMatchGroup(group);
    setIsMatchDetailsOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-16">
      {/* 1. Header Navigation Banner */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-16 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-black shadow-md">
              <Compass className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-foreground sm:text-lg">
                  Ghép Nhóm Trekking C2C
                </h1>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-400">
                  Route Modularized
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Kết nối bạn đồng hành theo Khung ngày tự do, Thể lực & Ngân sách
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsLeaderVettingOpen(true)}
              className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-border bg-background px-3.5 text-xs font-bold text-foreground hover:bg-muted transition"
            >
              <Users className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">Khởi xướng nhóm mới</span>
            </button>
            <button
              type="button"
              onClick={() => setIsJoinWizardOpen(true)}
              className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full bg-primary px-4 text-xs font-extrabold text-primary-foreground shadow-md hover:bg-primary/90 transition"
            >
              Đăng ký ứng tuyển
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Page Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* Route Selector Switcher */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-extrabold text-primary">
                  <RouteIcon className="h-3.5 w-3.5" /> Chuyển đổi Luồng Route
                </span>
                <h2 className="text-sm font-extrabold text-foreground">
                  Giao diện Phân tách theo Trạng thái Thành viên
                </h2>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Chọn route bên dưới để xem giao diện ứng với góc nhìn tương ứng theo nghiệp vụ ghép
                nhóm:
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1.5 shadow-xs shrink-0">
              <button
                type="button"
                onClick={() => handleSwitchRouteMode('/')}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-extrabold transition',
                  currentRouteMode === '/'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Route: / (Chưa vào nhóm)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchRouteMode('/inGroup')}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-extrabold transition',
                  currentRouteMode === '/inGroup'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Route: /inGroup (Đã ở trong nhóm)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Views */}
        {activeView === 'outsider-detail' && (
          <GroupDetailOutsiderView
            onOpenJoinWizard={() => setIsJoinWizardOpen(true)}
            onOpenMatchDetails={handleOpenMatchDetails}
            onOpenSos={() => setIsSosOpen(true)}
          />
        )}

        {activeView === 'discovery' && (
          <DiscoveryPreview
            selectedMatchGroup={selectedMatchGroup}
            setSelectedMatchGroup={setSelectedMatchGroup}
            onOpenMatchDetails={handleOpenMatchDetails}
            onOpenJoinWizard={() => setIsJoinWizardOpen(true)}
            onOpenLeaderVetting={() => setIsLeaderVettingOpen(true)}
          />
        )}

        {activeView === 'applications' && <ApplicationsPreview />}

        {activeView === 'workspace' && <WorkspacePreview />}

        {activeView === 'trip' && <TripPreview onOpenSos={() => setIsSosOpen(true)} />}
      </main>

      {/* 3. Popup Modals */}
      <TripDeclarationWizardModal
        isOpen={isJoinWizardOpen}
        onClose={() => setIsJoinWizardOpen(false)}
        selectedGroup={selectedMatchGroup}
      />
      <MatchDetailsModal
        isOpen={isMatchDetailsOpen}
        onClose={() => setIsMatchDetailsOpen(false)}
        group={selectedMatchGroup}
      />
      <LeaderVettingModal
        isOpen={isLeaderVettingOpen}
        onClose={() => setIsLeaderVettingOpen(false)}
      />
      <SosEmergencyModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
    </div>
  );
}

export default GroupMatchingOverviewPage;
