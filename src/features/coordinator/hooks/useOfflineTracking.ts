import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getOfflineRecord,
  putOfflineRecord,
  updateOfflineRecord,
} from '../services/offlineTrackingDb';
import { trackingService } from '../services/trackingService';
import type {
  CoordinatorSessionDetail,
  ParticipantAttendanceItem,
  TrackingEventResult,
  TrackingEventType,
  TrackingLocationSample,
  TrackingOfflineRecord,
  TrackingSnapshot,
  TrackingSyncEvent,
} from '../types';

const DEVICE_ID_KEY = 'treksphere-tracking-device-id';

interface CurrentGpsPosition {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  speedMetersPerSecond?: number;
  headingDegrees?: number;
}

function getOrCreateDeviceId(): string {
  const current = window.localStorage.getItem(DEVICE_ID_KEY);
  if (current) return current;
  const created = crypto.randomUUID();
  window.localStorage.setItem(DEVICE_ID_KEY, created);
  return created;
}

function getCurrentGpsPosition(): Promise<CurrentGpsPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Thiết bị không hỗ trợ định vị GPS.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: position.coords.accuracy,
          speedMetersPerSecond: position.coords.speed ?? undefined,
          headingDegrees: position.coords.heading ?? undefined,
        }),
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(new Error('Vui lòng cấp quyền truy cập vị trí để tiếp tục.'));
          return;
        }
        reject(new Error('Không thể lấy vị trí GPS hiện tại. Vui lòng thử lại.'));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
  });
}

function optimisticSnapshot(
  snapshot: TrackingSnapshot,
  type: TrackingEventType,
  payload: Record<string, unknown>,
  occurredAt: string,
  clientEventId: string
): TrackingSnapshot {
  if (type === 'EQUIPMENT_CHECKED') {
    return {
      ...snapshot,
      equipments: snapshot.equipments.map((item) =>
        item.sessionEquipmentId === payload.sessionEquipmentId
          ? {
              ...item,
              isChecked: Boolean(payload.isChecked),
              note: typeof payload.note === 'string' ? payload.note : item.note,
            }
          : item
      ),
    };
  }

  if (type === 'ATTENDANCE_START_RECORDED' || type === 'ATTENDANCE_END_RECORDED') {
    const attendance = new Map(
      ((payload.participants as ParticipantAttendanceItem[] | undefined) ?? []).map((item) => [
        item.participantId,
        item.isPresent,
      ])
    );
    const isStart = type === 'ATTENDANCE_START_RECORDED';
    return {
      ...snapshot,
      participants: snapshot.participants.map((item) => {
        const present = attendance.get(item.participantId);
        if (present === undefined) return item;
        return isStart
          ? { ...item, isPresentStart: present, startAttendedAt: occurredAt }
          : { ...item, isPresentEnd: present, endAttendedAt: occurredAt };
      }),
    };
  }

  if (type === 'SESSION_STARTED') {
    return {
      ...snapshot,
      status: 'IN_PROGRESS',
      startedAt: occurredAt,
    };
  }

  if (type === 'CHECKPOINT_REACHED') {
    return {
      ...snapshot,
      checkpoints: snapshot.checkpoints.map((item) =>
        item.checkpointId === payload.checkpointId
          ? { ...item, status: 'REACHED', reachedAt: occurredAt }
          : item
      ),
    };
  }

  if (type === 'CHECKPOINT_SKIPPED') {
    return {
      ...snapshot,
      checkpoints: snapshot.checkpoints.map((item) =>
        item.checkpointId === payload.checkpointId
          ? {
              ...item,
              status: 'SKIPPED',
              reachedAt: undefined,
              note: typeof payload.reason === 'string' ? payload.reason : undefined,
            }
          : item
      ),
    };
  }

  if (type === 'SESSION_ENDED') {
    return {
      ...snapshot,
      status: 'COMPLETED',
      endedAt: occurredAt,
    };
  }

  if (type === 'SOS_CREATED') {
    return {
      ...snapshot,
      latestSos: {
        sosAlertId: clientEventId,
        status: 'PENDING',
        latitude: Number(payload.latitude),
        longitude: Number(payload.longitude),
        message: typeof payload.message === 'string' ? payload.message : undefined,
        createdAt: occurredAt,
      },
    };
  }

  if (type === 'SOS_RESOLVED' && snapshot.latestSos) {
    return { ...snapshot, latestSos: { ...snapshot.latestSos, status: 'RESOLVED' } };
  }

  return snapshot;
}

function terminalEvent(result: TrackingEventResult): boolean {
  return ['ACCEPTED', 'DUPLICATE', 'CONFLICT', 'REJECTED'].includes(result.status);
}

export function useOfflineTracking(sessionId: string, sessionMeta?: CoordinatorSessionDetail) {
  const [record, setRecord] = useState<TrackingOfflineRecord>();
  const [currentLocation, setCurrentLocation] = useState<TrackingLocationSample>();
  const [isLoading, setIsLoading] = useState(true);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [syncError, setSyncError] = useState<string>();
  const [gpsError, setGpsError] = useState<string>();
  const [isGpsTracking, setIsGpsTracking] = useState(false);
  const syncInProgressRef = useRef(false);
  const watchIdRef = useRef<number | undefined>(undefined);
  const lastGpsCapturedAtRef = useRef(0);

  const saveState = useCallback((next: TrackingOfflineRecord) => {
    setRecord(next);
    return next;
  }, []);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    getOfflineRecord(sessionId)
      .then((stored) => {
        if (active) {
          setRecord(stored);
          setCurrentLocation(stored?.pendingLocations.at(-1));
        }
      })
      .catch((error: unknown) => {
        if (active)
          setSyncError(error instanceof Error ? error.message : 'Không thể đọc dữ liệu offline.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [sessionId]);

  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  const prepareOffline = useCallback(async () => {
    if (!navigator.onLine) throw new Error('Cần có mạng để tải gói dữ liệu offline lần đầu.');
    if (record && (record.pendingEvents.length > 0 || record.pendingLocations.length > 0)) {
      throw new Error('Hãy đồng bộ hết dữ liệu đang chờ trước khi tải lại offline pack.');
    }
    setIsPreparing(true);
    setSyncError(undefined);
    try {
      const pack = await trackingService.createOfflinePack(sessionId, getOrCreateDeviceId());
      const next: TrackingOfflineRecord = {
        sessionId,
        pack,
        sessionMeta,
        pendingEvents: [],
        pendingLocations: [],
        failedItems: record?.failedItems ?? [],
        nextSequenceNumber: record?.nextSequenceNumber ?? 1,
        lastSyncedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await putOfflineRecord(next);
      saveState(next);
      return next;
    } finally {
      setIsPreparing(false);
    }
  }, [record, saveState, sessionId, sessionMeta]);

  const syncNow = useCallback(async () => {
    if (!navigator.onLine) throw new Error('Thiết bị đang offline. Dữ liệu vẫn được giữ an toàn.');
    if (syncInProgressRef.current) return;

    let current = await getOfflineRecord(sessionId);
    if (!current) throw new Error('Chưa tải gói dữ liệu offline cho phiên tour này.');

    syncInProgressRef.current = true;
    setIsSyncing(true);
    setSyncError(undefined);
    try {
      while (current.pendingEvents.length > 0) {
        const batchSize = Math.min(current.pack.maxEventBatchSize || 100, 100);
        const batch = current.pendingEvents
          .slice(0, batchSize)
          .sort((a, b) => a.sequenceNumber - b.sequenceNumber);
        const response = await trackingService.syncEvents(sessionId, {
          deviceSessionId: current.pack.deviceSessionId,
          deviceId: current.pack.deviceId,
          lastKnownRevision: current.pack.snapshot.revision,
          events: batch,
        });
        const terminalIds = new Set(
          response.results.filter(terminalEvent).map((item) => item.clientEventId)
        );
        const failures = response.results.filter(
          (item) => item.status === 'CONFLICT' || item.status === 'REJECTED'
        );

        current = await updateOfflineRecord(sessionId, (stored) => ({
          ...stored,
          pack: { ...stored.pack, snapshot: response.snapshot, serverTime: response.serverTime },
          sessionMeta: stored.sessionMeta
            ? { ...stored.sessionMeta, status: response.snapshot.status }
            : stored.sessionMeta,
          pendingEvents: stored.pendingEvents.filter(
            (item) => !terminalIds.has(item.clientEventId)
          ),
          failedItems: [
            ...stored.failedItems,
            ...failures.map((item) => ({
              id: item.clientEventId,
              kind: 'EVENT' as const,
              code: item.code ?? item.status,
              message: item.message ?? 'Event bị máy chủ từ chối.',
              failedAt: new Date().toISOString(),
            })),
          ],
          lastSyncedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        saveState(current);

        if (response.results.some((item) => item.status === 'RETRYABLE')) break;
      }

      if (current.pendingEvents.length > 0) {
        throw new Error(
          'Còn thao tác nghiệp vụ chưa được máy chủ xử lý. GPS sẽ được giữ trên thiết bị và đồng bộ sau.'
        );
      }

      while (current.pendingLocations.length > 0) {
        const batchSize = Math.min(current.pack.maxLocationBatchSize || 200, 200);
        const batch = current.pendingLocations.slice(0, batchSize);
        const response = await trackingService.sendLocationBatch(sessionId, {
          deviceSessionId: current.pack.deviceSessionId,
          deviceId: current.pack.deviceId,
          samples: batch,
        });
        const completedIds = new Set([
          ...response.acceptedSampleIds,
          ...response.duplicateSampleIds,
          ...response.rejectedSamples.map((item) => item.sampleId),
        ]);
        current = await updateOfflineRecord(sessionId, (stored) => ({
          ...stored,
          pendingLocations: stored.pendingLocations.filter(
            (item) => !completedIds.has(item.sampleId)
          ),
          failedItems: [
            ...stored.failedItems,
            ...response.rejectedSamples.map((item) => ({
              id: item.sampleId,
              kind: 'LOCATION' as const,
              code: item.code,
              message: item.message,
              failedAt: new Date().toISOString(),
            })),
          ],
          lastSyncedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        saveState(current);
      }

      const reconciled = await trackingService.getSyncState(
        sessionId,
        current.pack.snapshot.revision
      );
      current = await updateOfflineRecord(sessionId, (stored) => ({
        ...stored,
        pack: { ...stored.pack, snapshot: reconciled.snapshot },
        sessionMeta: stored.sessionMeta
          ? { ...stored.sessionMeta, status: reconciled.snapshot.status }
          : stored.sessionMeta,
        lastSyncedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      saveState(current);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể đồng bộ dữ liệu.';
      setSyncError(message);
      throw error;
    } finally {
      syncInProgressRef.current = false;
      setIsSyncing(false);
    }
  }, [saveState, sessionId]);

  const hasOfflineRecord = Boolean(record);

  useEffect(() => {
    if (!isOnline || !hasOfflineRecord || isLoading) return;
    syncNow().catch(() => undefined);
  }, [hasOfflineRecord, isLoading, isOnline, syncNow]);

  const pendingTotal = (record?.pendingEvents.length ?? 0) + (record?.pendingLocations.length ?? 0);

  useEffect(() => {
    if (!isOnline || !hasOfflineRecord || pendingTotal === 0) return;
    const retryTimer = window.setInterval(() => {
      syncNow().catch(() => undefined);
    }, 15000);
    return () => window.clearInterval(retryTimer);
  }, [hasOfflineRecord, isOnline, pendingTotal, syncNow]);

  const enqueueEvent = useCallback(
    async (type: TrackingEventType, payload: Record<string, unknown>) => {
      const occurredAt = new Date().toISOString();
      const clientEventId = crypto.randomUUID();
      const next = await updateOfflineRecord(sessionId, (stored) => {
        const event: TrackingSyncEvent = {
          clientEventId,
          sequenceNumber: stored.nextSequenceNumber,
          type,
          occurredAt,
          baseRevision: stored.pack.snapshot.revision,
          payload,
        };
        const snapshot = optimisticSnapshot(
          stored.pack.snapshot,
          type,
          payload,
          occurredAt,
          clientEventId
        );
        return {
          ...stored,
          pack: { ...stored.pack, snapshot },
          sessionMeta: stored.sessionMeta
            ? { ...stored.sessionMeta, status: snapshot.status }
            : stored.sessionMeta,
          pendingEvents: [...stored.pendingEvents, event],
          nextSequenceNumber: stored.nextSequenceNumber + 1,
          updatedAt: occurredAt,
        };
      });
      saveState(next);
      if (navigator.onLine) await syncNow().catch(() => undefined);
      const afterSync = await getOfflineRecord(sessionId);
      const failure = afterSync?.failedItems.find((item) => item.id === clientEventId);
      if (failure) throw new Error(`[${failure.code}] ${failure.message}`);
      const stillPending =
        afterSync?.pendingEvents.some((item) => item.clientEventId === clientEventId) ?? true;
      return { clientEventId, queuedOffline: stillPending };
    },
    [saveState, sessionId, syncNow]
  );

  const enqueueLocation = useCallback(
    async (position: CurrentGpsPosition) => {
      const sample: TrackingLocationSample = {
        sampleId: crypto.randomUUID(),
        recordedAt: new Date().toISOString(),
        ...position,
      };
      setCurrentLocation(sample);
      const next = await updateOfflineRecord(sessionId, (stored) => ({
        ...stored,
        pendingLocations: [...stored.pendingLocations, sample],
        updatedAt: new Date().toISOString(),
      }));
      saveState(next);
      if (navigator.onLine) syncNow().catch(() => undefined);
    },
    [saveState, sessionId, syncNow]
  );

  useEffect(() => {
    const shouldTrack = record?.pack.snapshot.status === 'IN_PROGRESS';
    if (!shouldTrack || !navigator.geolocation || watchIdRef.current !== undefined) return;

    const intervalMs = Math.max(record.pack.gpsIntervalSeconds || 30, 10) * 1000;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setGpsError(undefined);
        const now = Date.now();
        if (now - lastGpsCapturedAtRef.current < intervalMs) return;
        lastGpsCapturedAtRef.current = now;
        enqueueLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: position.coords.accuracy,
          speedMetersPerSecond: position.coords.speed ?? undefined,
          headingDegrees: position.coords.heading ?? undefined,
        }).catch(() => undefined);
      },
      () => setGpsError('Không thể theo dõi GPS. Hãy kiểm tra quyền vị trí của trình duyệt.'),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    );
    setIsGpsTracking(true);

    return () => {
      if (watchIdRef.current !== undefined) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = undefined;
      }
      setIsGpsTracking(false);
    };
  }, [enqueueLocation, record?.pack.gpsIntervalSeconds, record?.pack.snapshot.status]);

  const command = useMemo(
    () => ({
      startSession: () => enqueueEvent('SESSION_STARTED', {}),
      endSession: () => enqueueEvent('SESSION_ENDED', {}),
      checkinCheckpoint: async (note?: string) => {
        const nextCheckpoint = record?.pack.snapshot.checkpoints
          .filter((item) => item.status === 'PENDING')
          .sort((a, b) => a.checkpointOrder - b.checkpointOrder)[0];
        if (!nextCheckpoint) throw new Error('Không còn checkpoint nào đang chờ check-in.');
        const position = await getCurrentGpsPosition();
        setCurrentLocation({
          sampleId: crypto.randomUUID(),
          recordedAt: new Date().toISOString(),
          ...position,
        });
        return enqueueEvent('CHECKPOINT_REACHED', {
          checkpointId: nextCheckpoint.checkpointId,
          ...position,
          note,
        });
      },
      skipCheckpoint: (reason: string) => {
        const nextCheckpoint = record?.pack.snapshot.checkpoints
          .filter((item) => item.status === 'PENDING')
          .sort((a, b) => a.checkpointOrder - b.checkpointOrder)[0];
        if (!nextCheckpoint) throw new Error('Không còn checkpoint nào đang chờ xử lý.');
        const normalizedReason = reason.trim();
        if (!normalizedReason) throw new Error('Vui lòng nhập lý do bỏ qua checkpoint.');
        return enqueueEvent('CHECKPOINT_SKIPPED', {
          checkpointId: nextCheckpoint.checkpointId,
          reason: normalizedReason,
        });
      },
      recordAttendance: (type: 'START' | 'END', participants: ParticipantAttendanceItem[]) =>
        enqueueEvent(type === 'START' ? 'ATTENDANCE_START_RECORDED' : 'ATTENDANCE_END_RECORDED', {
          participants,
        }),
      checkEquipment: (sessionEquipmentId: string, isChecked: boolean) =>
        enqueueEvent('EQUIPMENT_CHECKED', { sessionEquipmentId, isChecked }),
      sendSos: async (message?: string) => {
        const position = await getCurrentGpsPosition();
        setCurrentLocation({
          sampleId: crypto.randomUUID(),
          recordedAt: new Date().toISOString(),
          ...position,
        });
        return enqueueEvent('SOS_CREATED', { ...position, message });
      },
      resolveSos: (sosAlertId: string) => enqueueEvent('SOS_RESOLVED', { sosAlertId }),
    }),
    [enqueueEvent, record?.pack.snapshot.checkpoints]
  );

  const clearFailedItems = useCallback(async () => {
    const next = await updateOfflineRecord(sessionId, (stored) => ({
      ...stored,
      failedItems: [],
      updatedAt: new Date().toISOString(),
    }));
    saveState(next);
  }, [saveState, sessionId]);

  return {
    record,
    snapshot: record?.pack.snapshot,
    isPrepared: Boolean(record),
    isLoading,
    isPreparing,
    isSyncing,
    isOnline,
    isGpsTracking,
    currentLocation,
    gpsError,
    syncError,
    pendingEventCount: record?.pendingEvents.length ?? 0,
    pendingLocationCount: record?.pendingLocations.length ?? 0,
    failedItems: record?.failedItems ?? [],
    prepareOffline,
    syncNow,
    clearFailedItems,
    command,
  };
}
