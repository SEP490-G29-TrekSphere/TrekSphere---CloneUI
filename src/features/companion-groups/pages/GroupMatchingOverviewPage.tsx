import { Compass, Users } from 'lucide-react';
import { useState } from 'react';

// Modals
import {
  CreateGroupFromVendorTourModal,
  LeaderVettingModal,
  MatchDetailsModal,
  SosEmergencyModal,
  TripDeclarationWizardModal,
  type VendorTourTemplate,
} from '../components/modals/GroupMatchingModals';
import { ApplicationsPreview } from '../components/overview/ApplicationsPreview';
import { DiscoveryPreview } from '../components/overview/DiscoveryPreview';
import { GroupDetailOutsiderView } from '../components/overview/GroupDetailOutsiderView';
import { MyApplicationStatusCard } from '../components/overview/MyApplicationStatusCard';
import { TripPreview } from '../components/overview/TripPreview';
import { WorkspacePreview } from '../components/overview/WorkspacePreview';
// Review Shell Components
import {
  AccessRestrictedState,
  isViewAllowedForActor,
} from '../components/review/AccessRestrictedState';
import { ReviewJourneyMap } from '../components/review/ReviewJourneyMap';
import { ReviewScenarioToolbar } from '../components/review/ReviewScenarioToolbar';
import { groupRecommendations } from '../data/groupMatchingMocks';
import { useGroupMatchingReviewScenario } from '../hooks/useGroupMatchingReviewScenario';
// Types & Mock data
import type { GroupRecommendation } from '../types/groupMatchingTypes';

interface GroupMatchingOverviewPageProps {
  initialMode?: '/' | '/inGroup' | 'inGroup';
}

export function GroupMatchingOverviewPage({ initialMode }: GroupMatchingOverviewPageProps = {}) {
  // Scenario state managed centrally
  const defaultPreset =
    initialMode === '/inGroup' || initialMode === 'inGroup' ? 'preset-trip' : 'preset-outsider';
  const {
    scenario,
    setActor,
    setGroupState,
    setApplicationState,
    setNetwork,
    setLocationPermission,
    setActiveView,
    applyPreset,
    resetScenario,
    presets,
  } = useGroupMatchingReviewScenario(defaultPreset);

  const [selectedMatchGroup, setSelectedMatchGroup] = useState<GroupRecommendation | null>(
    groupRecommendations[0]
  );

  // Modal States
  const [isJoinWizardOpen, setIsJoinWizardOpen] = useState<boolean>(false);
  const [isMatchDetailsOpen, setIsMatchDetailsOpen] = useState<boolean>(false);
  const [isLeaderVettingOpen, setIsLeaderVettingOpen] = useState<boolean>(false);
  const [isSosOpen, setIsSosOpen] = useState<boolean>(false);
  const [isCreateFromVendorTourOpen, setIsCreateFromVendorTourOpen] = useState<boolean>(false);

  const handleOpenMatchDetails = (group: GroupRecommendation) => {
    setSelectedMatchGroup(group);
    setIsMatchDetailsOpen(true);
  };

  const handleConfirmCloneVendorTour = (template: VendorTourTemplate, customTitle: string) => {
    // Switch to Leader role, RECRUITING state, and open workspace to demonstrate quick creation
    setActor('LEADER');
    setGroupState('RECRUITING');
    setActiveView('workspace');
    if (selectedMatchGroup) {
      setSelectedMatchGroup({
        ...selectedMatchGroup,
        title: customTitle,
        location: template.location,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-16">
      {/* 1. Header Navigation Banner */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-16 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-black shadow-md">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-foreground sm:text-lg">
                  Ghép Nhóm Trekking C2C
                </h1>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-400">
                  Review Workbench
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Mô phỏng trải nghiệm tìm bạn đồng hành theo Khung ngày tự do, Thể lực & Ngân sách
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
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-5">
        {/* Top Review Controls: Toolbar & Journey Navigation */}
        <ReviewScenarioToolbar
          scenario={scenario}
          presets={presets}
          onApplyPreset={applyPreset}
          onSetActor={setActor}
          onSetGroupState={setGroupState}
          onSetApplicationState={setApplicationState}
          onSetNetwork={setNetwork}
          onSetLocationPermission={setLocationPermission}
          onReset={resetScenario}
        />

        <ReviewJourneyMap scenario={scenario} onSelectStepView={(view) => setActiveView(view)} />

        {/* Dynamic Views with Role Access Boundaries */}
        {scenario.activeView === 'outsider-detail' && (
          <GroupDetailOutsiderView
            scenario={scenario}
            onOpenJoinWizard={() => setIsJoinWizardOpen(true)}
            onOpenMatchDetails={handleOpenMatchDetails}
            onOpenSos={() => setIsSosOpen(true)}
            onNavigateView={setActiveView}
          />
        )}

        {scenario.activeView === 'discovery' && (
          <DiscoveryPreview
            selectedMatchGroup={selectedMatchGroup}
            setSelectedMatchGroup={setSelectedMatchGroup}
            onOpenMatchDetails={handleOpenMatchDetails}
            onOpenJoinWizard={() => setIsJoinWizardOpen(true)}
            onOpenLeaderVetting={() => setIsLeaderVettingOpen(true)}
            onOpenCreateFromVendorTour={() => setIsCreateFromVendorTourOpen(true)}
          />
        )}

        {scenario.activeView === 'applications' &&
          (!isViewAllowedForActor('applications', scenario.actor) ? (
            <AccessRestrictedState
              view="applications"
              actor={scenario.actor}
              onSwitchActor={setActor}
              onOpenJoinWizard={() => setIsJoinWizardOpen(true)}
              onNavigateView={setActiveView}
            />
          ) : scenario.actor === 'LEADER' || scenario.actor === 'CO_LEADER' ? (
            <ApplicationsPreview />
          ) : (
            <MyApplicationStatusCard
              applicationState={scenario.applicationState ?? 'APPLIED'}
              actor={scenario.actor}
              onSetApplicationState={setApplicationState}
              onNavigateView={setActiveView}
            />
          ))}

        {scenario.activeView === 'workspace' &&
          (!isViewAllowedForActor('workspace', scenario.actor) ? (
            <AccessRestrictedState
              view="workspace"
              actor={scenario.actor}
              onSwitchActor={setActor}
              onOpenJoinWizard={() => setIsJoinWizardOpen(true)}
              onNavigateView={setActiveView}
            />
          ) : (
            <WorkspacePreview scenario={scenario} />
          ))}

        {scenario.activeView === 'trip' &&
          (!isViewAllowedForActor('trip', scenario.actor) ? (
            <AccessRestrictedState
              view="trip"
              actor={scenario.actor}
              onSwitchActor={setActor}
              onOpenJoinWizard={() => setIsJoinWizardOpen(true)}
              onNavigateView={setActiveView}
            />
          ) : (
            <TripPreview onOpenSos={() => setIsSosOpen(true)} />
          ))}
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
      <CreateGroupFromVendorTourModal
        isOpen={isCreateFromVendorTourOpen}
        onClose={() => setIsCreateFromVendorTourOpen(false)}
        onConfirmClone={handleConfirmCloneVendorTour}
      />
      <SosEmergencyModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
    </div>
  );
}

export default GroupMatchingOverviewPage;
