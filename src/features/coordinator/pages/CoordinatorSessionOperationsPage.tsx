import { ArrowLeft, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PATHS } from '@/constants';
import { ConfirmActionDialog } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import { AltitudeTrackerWidget } from '../components/AltitudeTrackerWidget';
import { CheckpointTimeline } from '../components/CheckpointTimeline';
import { EmergencySosPanel } from '../components/EmergencySosPanel';
import { GearChecklistPanel } from '../components/GearChecklistPanel';
import { OfflineSyncPanel } from '../components/OfflineSyncPanel';
import { OperationsHeaderBar } from '../components/OperationsHeaderBar';
import { TrekkersPanel } from '../components/TrekkersPanel';
import { useOfflineTracking } from '../hooks/useOfflineTracking';
import {
  useSessionCheckpointLogs,
  useSessionDetail,
  useSessionSosStatus,
  useTourCheckpoints,
} from '../hooks/useSessionOperations';
import { useSessionTrekkers } from '../hooks/useSessionTrekkers';
import type { CoordinatorSessionDetail, SessionCheckpointStatus, SessionSosStatus } from '../types';

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

/** Hành động đang chờ người dùng xác nhận chia sẻ vị trí trước khi thực sự gọi GPS + API. */
type PendingGpsAction = { type: 'checkin'; note?: string } | { type: 'sos'; message?: string };

export default function CoordinatorSessionOperationsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const {
    data: session,
    isLoading: isSessionLoading,
    isError: isSessionError,
    error: sessionError,
    refetch: refetchSession,
  } = useSessionDetail(sessionId);
  const offline = useOfflineTracking(sessionId ?? '', session);
  const { data: checkpointLogs = [], isLoading: isCheckpointLogsLoading } =
    useSessionCheckpointLogs(sessionId);
  const { data: tourCheckpoints = [], isLoading: isTourCheckpointsLoading } = useTourCheckpoints(
    session?.tourId ?? offline.record?.sessionMeta?.tourId
  );
  const { data: sosStatus, isLoading: isSosStatusLoading } = useSessionSosStatus(sessionId);
  const { data: trekkers = [], isLoading: isTrekkersLoading } = useSessionTrekkers(sessionId);

  const [pendingEquipmentId, setPendingEquipmentId] = useState<string | undefined>(undefined);
  const [pendingGpsAction, setPendingGpsAction] = useState<PendingGpsAction | null>(null);
  const [pendingAction, setPendingAction] = useState<string>();

  const effectiveSession = useMemo<CoordinatorSessionDetail | undefined>(() => {
    const base = session ?? offline.record?.sessionMeta;
    if (!base) return undefined;
    return {
      ...base,
      status: offline.snapshot?.status ?? base.status,
      startedAt: offline.snapshot?.startedAt ?? base.startedAt,
      endedAt: offline.snapshot?.endedAt ?? base.endedAt,
      equipments:
        offline.snapshot?.equipments.map((item) => ({
          sessionEquipmentId: item.sessionEquipmentId,
          equipmentId: item.equipmentId,
          equipmentName: item.equipmentName,
          quantity: item.quantity,
          note: item.note,
        })) ?? base.equipments,
    };
  }, [offline.record?.sessionMeta, offline.snapshot, session]);

  const effectiveTrekkers = useMemo(
    () =>
      offline.snapshot?.participants.map((item) => ({
        participantId: item.participantId,
        fullName: item.fullName,
      })) ?? trekkers,
    [offline.snapshot?.participants, trekkers]
  );

  /**
   * Nguồn hiển thị lộ trình: ưu tiên nhật ký checkpoint của phiên (có trạng thái
   * check-in thật). Phiên chưa bắt đầu thì BE chưa khởi tạo nhật ký → rơi về lộ
   * trình tour công khai, mọi trạm coi như PENDING để Coordinator vẫn xem trước
   * được hành trình.
   */
  const checkpoints = useMemo<SessionCheckpointStatus[]>(() => {
    if (offline.snapshot) {
      return [...offline.snapshot.checkpoints]
        .sort((a, b) => a.checkpointOrder - b.checkpointOrder)
        .map((checkpoint) => ({ ...checkpoint }));
    }
    if (checkpointLogs.length > 0) return checkpointLogs;
    return tourCheckpoints.map((cp) => ({ ...cp, status: 'PENDING' as const }));
  }, [checkpointLogs, offline.snapshot, tourCheckpoints]);

  const isCheckpointsLoading =
    !offline.snapshot && (isCheckpointLogsLoading || isTourCheckpointsLoading);

  const effectiveSosStatus = useMemo<SessionSosStatus | undefined>(() => {
    const latest = offline.snapshot?.latestSos;
    if (!latest) return sosStatus;
    return {
      tourSessionId: sessionId ?? '',
      hasSosAlert: true,
      hasActiveSosAlert: latest.status === 'PENDING',
      resolved: latest.status === 'RESOLVED',
      status: latest.status,
      sosAlert: {
        sosAlertId: latest.sosAlertId,
        status: latest.status,
        message: latest.message,
        createdAt: latest.createdAt,
      },
    };
  }, [offline.snapshot?.latestSos, sessionId, sosStatus]);

  const equipmentChecked = useMemo(
    () =>
      Object.fromEntries(
        (offline.snapshot?.equipments ?? []).map((item) => [
          item.sessionEquipmentId,
          item.isChecked,
        ])
      ),
    [offline.snapshot?.equipments]
  );

  const handleBack = () => navigate(PATHS.COORDINATOR_SCHEDULES);

  const ensurePrepared = (): boolean => {
    if (offline.isPrepared) return true;
    toast.warning('Hãy chọn “Chuẩn bị offline” trước khi thực hiện chuyến đi.');
    return false;
  };

  const runCommand = async (
    action: string,
    command: () => Promise<{ queuedOffline: boolean }>,
    success: string
  ) => {
    if (!ensurePrepared()) return;
    setPendingAction(action);
    try {
      const result = await command();
      toast.success(
        result.queuedOffline ? `${success} Đã lưu trên thiết bị và sẽ tự đồng bộ.` : success
      );
      if (!result.queuedOffline) refetchSession();
    } catch (error) {
      toast.error(errorMessage(error, 'Không thể lưu thao tác Tracking.'));
    } finally {
      setPendingAction(undefined);
      setPendingEquipmentId(undefined);
      setPendingGpsAction(null);
    }
  };

  const handleStart = () =>
    runCommand('start', () => offline.command.startSession(), 'Đã bắt đầu phiên tour.');

  const handleEnd = () =>
    runCommand('end', () => offline.command.endSession(), 'Đã kết thúc phiên tour.');

  const handleCheckin = (note?: string) => {
    const nextCheckpoint = checkpoints.find((checkpoint) => checkpoint.status === 'PENDING');
    return runCommand(
      'checkin',
      () => offline.command.checkinCheckpoint(note),
      `Đã ghi nhận check-in${nextCheckpoint ? `: ${nextCheckpoint.checkpointName}` : ''}.`
    );
  };

  const handleSkipCheckpoint = (reason: string) => {
    const nextCheckpoint = checkpoints.find((checkpoint) => checkpoint.status === 'PENDING');
    return runCommand(
      'skip-checkpoint',
      () => offline.command.skipCheckpoint(reason),
      `Đã bỏ qua checkpoint${nextCheckpoint ? `: ${nextCheckpoint.checkpointName}` : ''}.`
    );
  };

  const handleToggleEquipment = (sessionEquipmentId: string, next: boolean) => {
    setPendingEquipmentId(sessionEquipmentId);
    return runCommand(
      `equipment-${sessionEquipmentId}`,
      () => offline.command.checkEquipment(sessionEquipmentId, next),
      'Đã cập nhật trạng thái trang bị.'
    );
  };

  const handleSendSos = (message?: string) => {
    return runCommand('sos', () => offline.command.sendSos(message), 'Đã ghi nhận tín hiệu SOS.');
  };

  const handleResolveSos = (sosAlertId: string) => {
    return runCommand(
      'resolve-sos',
      () => offline.command.resolveSos(sosAlertId),
      'Đã xác nhận cứu hộ hoàn tất.'
    );
  };

  const handleAttendance = (
    attendanceType: 'START' | 'END',
    participants: { participantId: string; isPresent: boolean }[]
  ) => {
    return runCommand(
      `attendance-${attendanceType}`,
      () => offline.command.recordAttendance(attendanceType, participants),
      attendanceType === 'START' ? 'Đã điểm danh xuất phát.' : 'Đã điểm danh kết thúc.'
    );
  };

  const handlePrepareOffline = async () => {
    try {
      await offline.prepareOffline();
      toast.success('Đã tải dữ liệu chuyến đi. Thiết bị sẵn sàng hoạt động offline.');
    } catch (error) {
      toast.error(errorMessage(error, 'Không thể chuẩn bị dữ liệu offline.'));
    }
  };

  const handleSync = async () => {
    try {
      await offline.syncNow();
      toast.success('Đã đồng bộ và đối chiếu dữ liệu với máy chủ.');
      refetchSession();
    } catch (error) {
      toast.error(errorMessage(error, 'Đồng bộ thất bại. Dữ liệu vẫn được giữ trên thiết bị.'));
    }
  };

  const handleConfirmGpsAction = () => {
    if (!pendingGpsAction) return;
    if (pendingGpsAction.type === 'checkin') {
      handleCheckin(pendingGpsAction.note);
    } else {
      handleSendSos(pendingGpsAction.message);
    }
  };

  if ((isSessionLoading || offline.isLoading) && !effectiveSession) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
      </div>
    );
  }

  if (!effectiveSession) {
    return (
      <div
        className="space-y-4 rounded-3xl bg-white p-6 text-center"
        style={{ border: '1px solid #E6E2D1' }}
      >
        <XCircle className="mx-auto h-10 w-10 text-red-600" />
        <p className="text-sm font-semibold text-red-600">
          {errorMessage(
            sessionError,
            isSessionError
              ? 'Không thể tải thông tin phiên tour và chưa có dữ liệu offline trên thiết bị.'
              : 'Không thể tải thông tin phiên tour.'
          )}
        </p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => refetchSession()}
            className="rounded-full px-5 py-2.5 text-sm font-semibold"
            style={{ backgroundColor: '#F0EEE6', color: '#06261D' }}
          >
            Thử lại
          </button>
          <button
            type="button"
            onClick={handleBack}
            className="rounded-full px-5 py-2.5 text-sm font-semibold"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #D8D3C4', color: '#06261D' }}
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const lastReachedCheckpoint = [...checkpoints].reverse().find((cp) => cp.status === 'REACHED');
  const finalCheckpoint = checkpoints[checkpoints.length - 1];
  const hasPendingCheckpoints = checkpoints.some((checkpoint) => checkpoint.status === 'PENDING');

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex items-center gap-1.5 text-sm font-semibold"
        style={{ color: '#6F7B75' }}
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách lịch dẫn đoàn
      </button>

      <OperationsHeaderBar
        session={effectiveSession}
        trekkerCount={effectiveTrekkers.length}
        onStart={handleStart}
        onEnd={handleEnd}
        isStarting={pendingAction === 'start'}
        isEnding={pendingAction === 'end'}
        canEnd={!hasPendingCheckpoints}
        endDisabledReason="Hãy check-in hoặc bỏ qua có lý do tất cả checkpoint trước khi kết thúc tour."
      />

      <OfflineSyncPanel
        isOnline={offline.isOnline}
        isPrepared={offline.isPrepared}
        isPreparing={offline.isPreparing}
        isSyncing={offline.isSyncing}
        isGpsTracking={offline.isGpsTracking}
        pendingEventCount={offline.pendingEventCount}
        pendingLocationCount={offline.pendingLocationCount}
        failedItems={offline.failedItems}
        lastSyncedAt={offline.record?.lastSyncedAt}
        expiresAt={offline.record?.pack.expiresAt}
        error={offline.syncError}
        onPrepare={handlePrepareOffline}
        onSync={handleSync}
        onClearFailures={() => offline.clearFailedItems()}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CheckpointTimeline
            checkpoints={checkpoints}
            canCheckin={effectiveSession.status === 'IN_PROGRESS'}
            isCheckingIn={pendingAction === 'checkin'}
            isSkipping={pendingAction === 'skip-checkpoint'}
            onCheckin={(note) => setPendingGpsAction({ type: 'checkin', note })}
            onSkip={handleSkipCheckpoint}
            isLoading={isCheckpointsLoading}
          />
        </div>

        <div className="space-y-6">
          <EmergencySosPanel
            status={effectiveSosStatus}
            isLoadingStatus={!offline.snapshot && isSosStatusLoading}
            isLocallyQueued={offline.record?.pendingEvents.some(
              (event) => event.type === 'SOS_CREATED'
            )}
            onSendSos={(message) => setPendingGpsAction({ type: 'sos', message })}
            isSending={pendingAction === 'sos'}
            onResolve={handleResolveSos}
            isResolving={pendingAction === 'resolve-sos'}
          />
          <GearChecklistPanel
            equipments={effectiveSession.equipments}
            checkedMap={equipmentChecked}
            pendingId={pendingEquipmentId}
            onToggle={handleToggleEquipment}
          />
          <TrekkersPanel
            trekkers={effectiveTrekkers}
            isLoading={!offline.snapshot && isTrekkersLoading}
            isSubmitting={pendingAction?.startsWith('attendance-') ?? false}
            onSubmit={handleAttendance}
          />
          <AltitudeTrackerWidget
            currentAltitude={lastReachedCheckpoint?.altitude}
            targetAltitude={finalCheckpoint?.altitude}
          />
        </div>
      </div>

      {pendingGpsAction && (
        <ConfirmActionDialog
          title={
            pendingGpsAction.type === 'sos'
              ? 'Chia sẻ vị trí để gửi SOS'
              : 'Chia sẻ vị trí để Check-in'
          }
          description={
            pendingGpsAction.type === 'sos'
              ? 'Tín hiệu SOS sẽ gửi kèm toạ độ GPS hiện tại của bạn ngay lập tức cho đội cứu hộ Base Camp. Trình duyệt có thể hỏi quyền truy cập vị trí — hãy chọn "Cho phép".'
              : 'Ứng dụng cần vị trí GPS hiện tại của bạn để xác nhận đã đến trạm dừng (trong bán kính 200m). Trình duyệt có thể hỏi quyền truy cập vị trí — hãy chọn "Cho phép".'
          }
          confirmLabel={
            pendingGpsAction.type === 'sos' ? 'Cho phép & Gửi SOS' : 'Cho phép & Check-in'
          }
          cancelLabel="Để sau"
          variant={pendingGpsAction.type === 'sos' ? 'destructive' : 'default'}
          isPending={
            pendingGpsAction.type === 'sos' ? pendingAction === 'sos' : pendingAction === 'checkin'
          }
          onConfirm={handleConfirmGpsAction}
          onCancel={() => setPendingGpsAction(null)}
        />
      )}
    </div>
  );
}
