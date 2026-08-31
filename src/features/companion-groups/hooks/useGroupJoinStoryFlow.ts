import { useCallback, useState } from 'react';
import type { ApplicationState, GroupRecommendation } from '../types/groupMatchingTypes';

export type StoryStep = 'PROFILE_GATE' | 'BROWSE' | 'GROUP_DETAIL' | 'DASHBOARD';
export type StoryViewingAs = 'OWNER' | 'ME';

interface StoryFlowState {
  step: StoryStep;
  hasCompletedProfileMock: boolean;
  selectedGroup: GroupRecommendation | null;
  /** null = chưa nộp đơn nào cho group đang xem. */
  applicationState: ApplicationState | null;
  viewingAs: StoryViewingAs;
}

const initialState: StoryFlowState = {
  step: 'PROFILE_GATE',
  hasCompletedProfileMock: false,
  selectedGroup: null,
  applicationState: null,
  viewingAs: 'ME',
};

/**
 * State máy cho luồng "story flow" click-thật (Tìm nhóm -> Chi tiết -> Xin vào nhóm -> Dashboard).
 * Hoàn toàn mock/local, không gọi API hay đụng useAppStore — độc lập với Review Workbench
 * (useGroupMatchingReviewScenario.ts) vốn dùng bảng điều khiển toolbar.
 */
export function useGroupJoinStoryFlow() {
  const [state, setState] = useState<StoryFlowState>(initialState);

  const completeProfileMock = useCallback(() => {
    setState((prev) => ({ ...prev, hasCompletedProfileMock: true, step: 'BROWSE' }));
  }, []);

  const selectGroup = useCallback((group: GroupRecommendation) => {
    setState((prev) => ({ ...prev, selectedGroup: group, step: 'GROUP_DETAIL' }));
  }, []);

  const backToBrowse = useCallback(() => {
    setState((prev) => ({ ...prev, step: 'BROWSE', selectedGroup: null }));
  }, []);

  const submitApplication = useCallback(() => {
    setState((prev) => ({
      ...prev,
      applicationState: 'APPLIED',
      step: 'DASHBOARD',
      viewingAs: 'ME',
    }));
  }, []);

  const setApplicationState = useCallback((applicationState: ApplicationState) => {
    setState((prev) => ({ ...prev, applicationState }));
  }, []);

  const setViewingAs = useCallback((viewingAs: StoryViewingAs) => {
    setState((prev) => ({ ...prev, viewingAs }));
  }, []);

  const resetStory = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    completeProfileMock,
    selectGroup,
    backToBrowse,
    submitApplication,
    setApplicationState,
    setViewingAs,
    resetStory,
  };
}
