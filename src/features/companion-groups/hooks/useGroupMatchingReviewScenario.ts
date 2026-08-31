import { useCallback, useState } from 'react';
import { reviewPresets } from '../data/groupMatchingMocks';
import type {
  ApplicationState,
  GroupLifecycleState,
  GroupMatchingReviewScenario,
  PreviewView,
  ReviewActor,
  ReviewLocationPermission,
  ReviewNetwork,
  WorkspaceSubTab,
} from '../types/groupMatchingTypes';

export function useGroupMatchingReviewScenario(defaultPresetId: string = 'preset-outsider') {
  const initialPreset = reviewPresets.find((p) => p.id === defaultPresetId) || reviewPresets[0];

  const [scenario, setScenarioState] = useState<GroupMatchingReviewScenario>(initialPreset);

  const updateScenario = useCallback((updates: Partial<GroupMatchingReviewScenario>) => {
    setScenarioState((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const setActor = useCallback((actor: ReviewActor) => {
    setScenarioState((prev) => ({ ...prev, actor }));
  }, []);

  const setGroupState = useCallback((groupState: GroupLifecycleState) => {
    setScenarioState((prev) => {
      let defaultView = prev.activeView;
      if (groupState === 'IN_PROGRESS') defaultView = 'trip';
      else if (groupState === 'SETTLING' || groupState === 'READY' || groupState === 'COMPLETED')
        defaultView = 'workspace';
      else if (groupState === 'RECRUITING') defaultView = 'outsider-detail';
      return { ...prev, groupState, activeView: defaultView };
    });
  }, []);

  const setApplicationState = useCallback((applicationState: ApplicationState) => {
    setScenarioState((prev) => ({ ...prev, applicationState }));
  }, []);

  const setNetwork = useCallback((network: ReviewNetwork) => {
    setScenarioState((prev) => ({ ...prev, network }));
  }, []);

  const setLocationPermission = useCallback((locationPermission: ReviewLocationPermission) => {
    setScenarioState((prev) => ({ ...prev, locationPermission }));
  }, []);

  const setActiveView = useCallback(
    (activeView: PreviewView, activeWorkspaceTab?: WorkspaceSubTab) => {
      setScenarioState((prev) => ({
        ...prev,
        activeView,
        ...(activeWorkspaceTab ? { activeWorkspaceTab } : {}),
      }));
    },
    []
  );

  const applyPreset = useCallback((presetId: string) => {
    const target = reviewPresets.find((p) => p.id === presetId);
    if (target) {
      setScenarioState(target);
    }
  }, []);

  const resetScenario = useCallback(() => {
    setScenarioState(initialPreset);
  }, [initialPreset]);

  return {
    scenario,
    updateScenario,
    setActor,
    setGroupState,
    setApplicationState,
    setNetwork,
    setLocationPermission,
    setActiveView,
    applyPreset,
    resetScenario,
    presets: reviewPresets,
  };
}
