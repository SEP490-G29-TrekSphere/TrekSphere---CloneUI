import { ArrowLeft, Compass, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import {
  MatchDetailsModal,
  SosEmergencyModal,
  TripDeclarationWizardModal,
} from '../components/modals/GroupMatchingModals';
import { GroupDetailOutsiderView } from '../components/overview/GroupDetailOutsiderView';
import { MyApplicationStatusCard } from '../components/overview/MyApplicationStatusCard';
import { WorkspacePreview } from '../components/overview/WorkspacePreview';
import { PublicGroupBrowseView } from '../components/story/PublicGroupBrowseView';
import { StoryOwnerApplicationCard } from '../components/story/StoryOwnerApplicationCard';
import { StoryProfileGateScreen } from '../components/story/StoryProfileGateScreen';
import { StoryRoleSwitcher } from '../components/story/StoryRoleSwitcher';
import { useGroupJoinStoryFlow } from '../hooks/useGroupJoinStoryFlow';
import type {
  GroupMatchingReviewScenario,
  GroupRecommendation,
  ReviewActor,
} from '../types/groupMatchingTypes';

function buildScenario(
  actor: ReviewActor,
  group: GroupRecommendation | null
): GroupMatchingReviewScenario {
  return {
    id: 'story-flow',
    name: group?.title ?? 'Story Flow',
    description: 'Luồng click-thật, mock cục bộ',
    actor,
    groupState: 'RECRUITING',
    network: 'ONLINE',
    locationPermission: 'PROMPT',
    activeView: 'outsider-detail',
  };
}

type OwnerDashboardTab = 'applications' | 'workspace';

export function GroupMatchingStoryPage() {
  const {
    step,
    hasCompletedProfileMock,
    selectedGroup,
    applicationState,
    viewingAs,
    completeProfileMock,
    selectGroup,
    backToBrowse,
    submitApplication,
    setApplicationState,
    setViewingAs,
    resetStory,
  } = useGroupJoinStoryFlow();

  const [isJoinWizardOpen, setIsJoinWizardOpen] = useState(false);
  const [isMatchDetailsOpen, setIsMatchDetailsOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [ownerTab, setOwnerTab] = useState<OwnerDashboardTab>('applications');

  const handleSelectGroup = (group: GroupRecommendation) => {
    selectGroup(group);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-16">
      <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-16 z-20">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-black shadow-md">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-foreground sm:text-lg">
                  Tìm & Tham gia Nhóm
                </h1>
                <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-black text-blue-700 dark:text-blue-400">
                  Story Flow (demo)
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Đi qua từng màn bằng click thật — không dùng bảng điều khiển Review Workbench.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetStory}
            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-border bg-background px-3.5 text-xs font-bold text-foreground hover:bg-muted transition"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Làm lại từ đầu
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 space-y-5">
        {step === 'PROFILE_GATE' && !hasCompletedProfileMock && (
          <StoryProfileGateScreen onContinueMock={completeProfileMock} />
        )}

        {step === 'BROWSE' && <PublicGroupBrowseView onSelectGroup={handleSelectGroup} />}

        {step === 'GROUP_DETAIL' && selectedGroup && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={backToBrowse}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Quay lại danh sách nhóm
            </button>

            <GroupDetailOutsiderView
              scenario={buildScenario('GUEST', selectedGroup)}
              onOpenJoinWizard={() => setIsJoinWizardOpen(true)}
              onOpenMatchDetails={() => setIsMatchDetailsOpen(true)}
              onOpenSos={() => setIsSosOpen(true)}
            />
          </div>
        )}

        {step === 'DASHBOARD' && selectedGroup && applicationState && (
          <div className="space-y-5">
            <StoryRoleSwitcher viewingAs={viewingAs} onChange={setViewingAs} />

            {viewingAs === 'ME' && applicationState === 'APPLIED' && (
              <MyApplicationStatusCard
                applicationState={applicationState}
                actor="APPLICANT"
                onSetApplicationState={setApplicationState}
                onNavigateView={backToBrowse}
              />
            )}

            {viewingAs === 'ME' && applicationState === 'ACCEPTED' && (
              <div className="space-y-4">
                <div className="max-w-2xl mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-center">
                  <p className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                    Chúc mừng! Bạn đã là thành viên chính thức của {selectedGroup.title}.
                  </p>
                </div>
                <WorkspacePreview scenario={buildScenario('MEMBER', selectedGroup)} />
              </div>
            )}

            {viewingAs === 'ME' && applicationState === 'REJECTED' && (
              <div className="max-w-2xl mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4 text-center">
                <p className="text-xs font-extrabold text-rose-700 dark:text-rose-400">
                  Đơn của bạn đã bị Trưởng nhóm từ chối.
                </p>
              </div>
            )}

            {viewingAs === 'OWNER' && (
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 p-1 w-fit">
                  <button
                    type="button"
                    onClick={() => setOwnerTab('applications')}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                      ownerTab === 'applications'
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Đơn xin vào nhóm
                  </button>
                  <button
                    type="button"
                    onClick={() => setOwnerTab('workspace')}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                      ownerTab === 'workspace'
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Quản lý nhóm
                  </button>
                </div>

                {ownerTab === 'applications' ? (
                  <StoryOwnerApplicationCard
                    group={selectedGroup}
                    applicationState={applicationState}
                    onApprove={() => setApplicationState('ACCEPTED')}
                    onReject={() => setApplicationState('REJECTED')}
                  />
                ) : (
                  <WorkspacePreview scenario={buildScenario('LEADER', selectedGroup)} />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <TripDeclarationWizardModal
        isOpen={isJoinWizardOpen}
        onClose={() => setIsJoinWizardOpen(false)}
        selectedGroup={selectedGroup}
        onSubmitted={submitApplication}
      />
      <MatchDetailsModal
        isOpen={isMatchDetailsOpen}
        onClose={() => setIsMatchDetailsOpen(false)}
        group={selectedGroup}
      />
      <SosEmergencyModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
    </div>
  );
}

export default GroupMatchingStoryPage;
