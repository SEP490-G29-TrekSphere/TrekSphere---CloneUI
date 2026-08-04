import { ArrowLeft, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PATHS } from '@/constants';
import { ConfirmActionDialog } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import { AltitudeTrackerWidget } from '../components/AltitudeTrackerWidget';
import { CheckpointTimeline } from '../components/CheckpointTimeline';
import { EmergencySosPanel } from '../components/EmergencySosPanel';
import { GearChecklistPanel } from '../components/GearChecklistPanel';
import { OperationsHeaderBar } from '../components/OperationsHeaderBar';
import { TrekkersPanel } from '../components/TrekkersPanel';
import { useSessionDetail, useTourCheckpoints } from '../hooks/useSessionOperations';
import { useSessionOperationsMutations } from '../hooks/useSessionOperationsMutations';
import { useSessionTrekkers } from '../hooks/useSessionTrekkers';

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
  const { data: checkpoints = [], isLoading: isCheckpointsLoading } = useTourCheckpoints(
    session?.tourId
  );
  const { data: trekkers = [], isLoading: isTrekkersLoading } = useSessionTrekkers(sessionId);
  const mutations = useSessionOperationsMutations(sessionId ?? '');

  const [reachedOrder, setReachedOrder] = useState(0);
  const [equipmentChecked, setEquipmentChecked] = useState<Record<string, boolean>>({});
  const [sosSentAt, setSosSentAt] = useState<string | undefined>(undefined);
  const [pendingEquipmentId, setPendingEquipmentId] = useState<string | undefined>(undefined);
  const [pendingGpsAction, setPendingGpsAction] = useState<PendingGpsAction | null>(null);
  const [sosAlertId, setSosAlertId] = useState<string | undefined>(undefined);
  const [isSosResolved, setIsSosResolved] = useState(false);

  const handleBack = () => navigate(PATHS.COORDINATOR_SCHEDULES);

  const handleStart = () => {
    mutations.startSession.mutate(undefined, {
      onSuccess: () => toast.success('Đã bắt đầu phiên tour.'),
      onError: (err) => toast.error(errorMessage(err, 'Không thể bắt đầu phiên tour.')),
    });
  };

  const handleEnd = () => {
    mutations.endSession.mutate(undefined, {
      onSuccess: () => {
        setReachedOrder(checkpoints.length);
        toast.success('Đã kết thúc phiên tour.');
      },
      onError: (err) => toast.error(errorMessage(err, 'Không thể kết thúc phiên tour.')),
    });
  };

  const handleCheckin = (note?: string) => {
    mutations.checkinCheckpoint.mutate(note, {
      onSuccess: (result) => {
        setReachedOrder((prev) => Math.max(prev, result.checkpointOrder));
        toast.success(`Đã check-in: ${result.checkpointName}`);
      },
      onError: (err) => toast.error(errorMessage(err, 'Check-in trạm dừng thất bại.')),
      onSettled: () => setPendingGpsAction(null),
    });
  };

  const handleToggleEquipment = (sessionEquipmentId: string, next: boolean) => {
    setPendingEquipmentId(sessionEquipmentId);
    mutations.checkEquipment.mutate(
      { sessionEquipmentId, isChecked: next },
      {
        onSuccess: (result) => {
          setEquipmentChecked((prev) => ({
            ...prev,
            [result.sessionEquipmentId]: result.isChecked,
          }));
        },
        onError: (err) => toast.error(errorMessage(err, 'Không thể cập nhật trạng thái trang bị.')),
        onSettled: () => setPendingEquipmentId(undefined),
      }
    );
  };

  const handleSendSos = (message?: string) => {
    mutations.sendSos.mutate(message, {
      onSuccess: (result) => {
        setSosSentAt(result.createdAt);
        setSosAlertId(result.sosAlertId);
        toast.success('Đã gửi tín hiệu SOS tới đội cứu hộ.');
      },
      onError: (err) => toast.error(errorMessage(err, 'Không thể gửi tín hiệu SOS.')),
      onSettled: () => setPendingGpsAction(null),
    });
  };

  const handleResolveSos = () => {
    if (!sosAlertId) return;
    mutations.resolveSos.mutate(sosAlertId, {
      onSuccess: () => {
        setIsSosResolved(true);
        toast.success('Đã xác nhận cứu hộ hoàn tất.');
      },
      onError: (err) => toast.error(errorMessage(err, 'Không thể cập nhật trạng thái cứu hộ.')),
    });
  };

  const handleAttendance = (
    attendanceType: 'START' | 'END',
    participants: { participantId: string; isPresent: boolean }[]
  ) => {
    mutations.recordAttendance.mutate(
      { attendanceType, participants },
      {
        onSuccess: () =>
          toast.success(
            attendanceType === 'START' ? 'Đã điểm danh xuất phát.' : 'Đã điểm danh kết thúc.'
          ),
        onError: (err) => toast.error(errorMessage(err, 'Điểm danh thất bại.')),
      }
    );
  };

  const handleConfirmGpsAction = () => {
    if (!pendingGpsAction) return;
    if (pendingGpsAction.type === 'checkin') {
      handleCheckin(pendingGpsAction.note);
    } else {
      handleSendSos(pendingGpsAction.message);
    }
  };

  if (isSessionLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
      </div>
    );
  }

  if (isSessionError || !session) {
    return (
      <div
        className="space-y-4 rounded-3xl bg-white p-6 text-center"
        style={{ border: '1px solid #E6E2D1' }}
      >
        <XCircle className="mx-auto h-10 w-10 text-red-600" />
        <p className="text-sm font-semibold text-red-600">
          {errorMessage(sessionError, 'Không thể tải thông tin phiên tour.')}
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

  const lastReachedCheckpoint =
    reachedOrder > 0 ? checkpoints.find((cp) => cp.checkpointOrder === reachedOrder) : undefined;
  const finalCheckpoint = checkpoints[checkpoints.length - 1];

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
        session={session}
        trekkerCount={trekkers.length}
        onStart={handleStart}
        onEnd={handleEnd}
        isStarting={mutations.startSession.isPending}
        isEnding={mutations.endSession.isPending}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CheckpointTimeline
            checkpoints={checkpoints}
            reachedOrder={reachedOrder}
            canCheckin={session.status === 'IN_PROGRESS'}
            isCheckingIn={mutations.checkinCheckpoint.isPending}
            onCheckin={(note) => setPendingGpsAction({ type: 'checkin', note })}
            isLoading={isCheckpointsLoading}
          />
        </div>

        <div className="space-y-6">
          <EmergencySosPanel
            onSendSos={(message) => setPendingGpsAction({ type: 'sos', message })}
            isSending={mutations.sendSos.isPending}
            lastSentAt={sosSentAt}
            sosAlertId={sosAlertId}
            isResolved={isSosResolved}
            onResolve={handleResolveSos}
            isResolving={mutations.resolveSos.isPending}
          />
          <GearChecklistPanel
            equipments={session.equipments}
            checkedMap={equipmentChecked}
            pendingId={pendingEquipmentId}
            onToggle={handleToggleEquipment}
          />
          <TrekkersPanel
            trekkers={trekkers}
            isLoading={isTrekkersLoading}
            isSubmitting={mutations.recordAttendance.isPending}
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
            pendingGpsAction.type === 'sos'
              ? mutations.sendSos.isPending
              : mutations.checkinCheckpoint.isPending
          }
          onConfirm={handleConfirmGpsAction}
          onCancel={() => setPendingGpsAction(null)}
        />
      )}
    </div>
  );
}
