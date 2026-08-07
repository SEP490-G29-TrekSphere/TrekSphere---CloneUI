import { ArrowLeft, Printer } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPrimaryRole, PATHS, ROLES } from '@/constants';
import { formatDate } from '@/lib';
import { ConfirmActionDialog } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { AssignCoordinatorDialog } from '../components/AssignCoordinatorDialog';
import { AssignEquipmentDialog } from '../components/AssignEquipmentDialog';
import { AssignPorterDialog } from '../components/AssignPorterDialog';
import { CoordinatorCard } from '../components/CoordinatorCard';
import { EquipmentAllocationTable } from '../components/EquipmentAllocationTable';
import { PorterCard } from '../components/PorterCard';
import { SessionStatusBadge } from '../components/SessionStatusBadge';
import { useCoordinatorCandidates } from '../hooks/useCoordinatorCandidates';
import { useEquipmentCandidates } from '../hooks/useEquipmentCandidates';
import { usePorterCandidates } from '../hooks/usePorterCandidates';
import { useVendorSessionAllocations } from '../hooks/useVendorSessionAllocations';
import { useVendorSessionMutations } from '../hooks/useVendorSessionMutations';
import { formatShortId } from '../services/vendorSessionService';
import type { SessionCoordinator, SessionEquipment, SessionPorter } from '../types';

type RemoveTarget =
  | { kind: 'coordinator'; id: string; label: string }
  | { kind: 'porter'; id: string; label: string }
  | { kind: 'equipment'; id: string; label: string };

/**
 * Chi tiết phân công nhân sự & phân bổ trang thiết bị của 1 phiên Trekking —
 * dùng chung cho Vendor Manager và Vendor Staff, cả 2 role có đầy đủ quyền
 * gán/gỡ Coordinator, Porter, Thiết bị.
 */
export default function SessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const user = useAppStore((state) => state.user);
  const isManager = getPrimaryRole(user?.roles) === ROLES.VENDOR_MANAGER;
  const listPath = isManager ? PATHS.VENDOR_MANAGER_SESSIONS : PATHS.PARTNER_SESSIONS;

  const { data: session, isLoading, isError, error } = useVendorSessionAllocations(sessionId);
  const mutations = useVendorSessionMutations(sessionId ?? '');

  const {
    data: coordinatorCandidates = [],
    isLoading: isLoadingCoordinatorCandidates,
    error: coordinatorCandidatesError,
  } = useCoordinatorCandidates();
  const { data: porterCandidates = [] } = usePorterCandidates();
  const { data: equipmentCandidates = [] } = useEquipmentCandidates();

  const [assignCoordinatorOpen, setAssignCoordinatorOpen] = useState(false);
  const [assignPorterOpen, setAssignPorterOpen] = useState(false);
  const [assignEquipmentOpen, setAssignEquipmentOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<RemoveTarget | null>(null);
  const [equipmentChecked, setEquipmentChecked] = useState<Record<string, boolean>>({});
  const [pendingCheckId, setPendingCheckId] = useState<string | undefined>(undefined);

  const handleBack = () => navigate(listPath);

  const handleToggleEquipmentCheck = (equipment: SessionEquipment, next: boolean) => {
    setPendingCheckId(equipment.sessionEquipmentId);
    mutations.checkEquipment.mutate(
      { sessionEquipmentId: equipment.sessionEquipmentId, isChecked: next },
      {
        onSuccess: (result) => {
          setEquipmentChecked((prev) => ({
            ...prev,
            [result.sessionEquipmentId]: result.isChecked,
          }));
        },
        onError: (err) =>
          toast.error(
            err instanceof Error ? err.message : 'Không thể cập nhật trạng thái kiểm tra.'
          ),
        onSettled: () => setPendingCheckId(undefined),
      }
    );
  };

  const handleRemoveCoordinatorClick = (coordinator: SessionCoordinator) =>
    setRemoveTarget({
      kind: 'coordinator',
      id: coordinator.coordinatorScheduleId,
      label: coordinator.fullName,
    });
  const handleRemovePorterClick = (porter: SessionPorter) =>
    setRemoveTarget({ kind: 'porter', id: porter.porterScheduleId, label: porter.fullName });
  const handleRemoveEquipmentClick = (equipment: SessionEquipment) =>
    setRemoveTarget({
      kind: 'equipment',
      id: equipment.sessionEquipmentId,
      label: equipment.equipmentName,
    });

  const handleConfirmRemove = () => {
    if (!removeTarget) return;

    const onSuccess = () => {
      setRemoveTarget(null);
      toast.success('Đã cập nhật phân công.');
    };
    const onError = (err: unknown) =>
      toast.error(err instanceof Error ? err.message : 'Không thể thực hiện thao tác.');

    if (removeTarget.kind === 'coordinator') {
      mutations.removeCoordinator.mutate(removeTarget.id, { onSuccess, onError });
    } else if (removeTarget.kind === 'porter') {
      mutations.removePorter.mutate(removeTarget.id, { onSuccess, onError });
    } else {
      mutations.removeEquipment.mutate(removeTarget.id, { onSuccess, onError });
    }
  };

  const isRemovePending =
    mutations.removeCoordinator.isPending ||
    mutations.removePorter.isPending ||
    mutations.removeEquipment.isPending;

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div
        className="space-y-4 rounded-3xl bg-white p-6 text-center"
        style={{ border: '1px solid #E6E2D1' }}
      >
        <p className="text-sm" style={{ color: '#DC2626' }}>
          Không thể tải thông tin phiên tour:{' '}
          {error instanceof Error ? error.message : 'Lỗi không xác định'}
        </p>
        <button
          type="button"
          onClick={handleBack}
          className="rounded-full px-5 py-2.5 text-sm font-semibold"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #D8D3C4', color: '#06261D' }}
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const subtitleParts = [
    `Mã phiên: ${formatShortId(session.sessionId)}`,
    `Khởi hành: ${formatDate(session.departureDate)}`,
    `Về: ${formatDate(session.returnDate)}`,
  ];
  if (session.startedAt) {
    subtitleParts.push(`Bắt đầu: ${new Date(session.startedAt).toLocaleString('vi-VN')}`);
  }
  if (session.endedAt) {
    subtitleParts.push(`Kết thúc: ${new Date(session.endedAt).toLocaleString('vi-VN')}`);
  }

  const assignedCoordinatorUserIds = session.coordinators.map((c) => c.coordinatorId);
  const assignedPorterIds = session.porters.map((p) => p.porterId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={handleBack}
            className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: '#6F7B75' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách phiên
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1
              className="text-2xl sm:text-3xl font-extrabold tracking-tight"
              style={{ color: '#06261D' }}
            >
              {session.tourName}
            </h1>
            <SessionStatusBadge status={session.status} />
          </div>
          <p className="mt-1 text-sm font-medium" style={{ color: '#6F7B75' }}>
            {subtitleParts.join(' • ')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex h-fit items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
          style={{ backgroundColor: '#F0EEE6', color: '#06261D' }}
        >
          <Printer className="h-4 w-4" />
          In lịch trình
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <CoordinatorCard
          coordinators={session.coordinators}
          onAddClick={() => setAssignCoordinatorOpen(true)}
          onRemoveClick={handleRemoveCoordinatorClick}
        />
        <PorterCard
          porters={session.porters}
          onAddClick={() => setAssignPorterOpen(true)}
          onRemoveClick={handleRemovePorterClick}
        />
      </div>

      <EquipmentAllocationTable
        equipments={session.equipments}
        onAddClick={() => setAssignEquipmentOpen(true)}
        onRemoveClick={handleRemoveEquipmentClick}
        canCheck={!isManager}
        checkedMap={equipmentChecked}
        pendingCheckId={pendingCheckId}
        onToggleCheck={handleToggleEquipmentCheck}
      />

      <AssignCoordinatorDialog
        open={assignCoordinatorOpen}
        onOpenChange={setAssignCoordinatorOpen}
        candidates={coordinatorCandidates}
        assignedUserIds={assignedCoordinatorUserIds}
        isLoadingCandidates={isLoadingCoordinatorCandidates}
        candidatesError={coordinatorCandidatesError}
        isPending={mutations.assignCoordinator.isPending}
        onSubmit={(payload) =>
          mutations.assignCoordinator.mutate(payload, {
            onSuccess: () => {
              setAssignCoordinatorOpen(false);
              toast.success('Đã chỉ định điều phối viên.');
            },
            onError: (err) =>
              toast.error(
                err instanceof Error ? err.message : 'Không thể chỉ định điều phối viên.'
              ),
          })
        }
      />

      <AssignPorterDialog
        open={assignPorterOpen}
        onOpenChange={setAssignPorterOpen}
        candidates={porterCandidates}
        assignedPorterIds={assignedPorterIds}
        isPending={mutations.assignPorter.isPending}
        onSubmit={(payload) =>
          mutations.assignPorter.mutate(payload, {
            onSuccess: () => {
              setAssignPorterOpen(false);
              toast.success('Đã thêm porter.');
            },
            onError: (err) =>
              toast.error(err instanceof Error ? err.message : 'Không thể thêm porter.'),
          })
        }
      />

      <AssignEquipmentDialog
        open={assignEquipmentOpen}
        onOpenChange={setAssignEquipmentOpen}
        candidates={equipmentCandidates}
        isPending={mutations.assignEquipment.isPending}
        onSubmit={(payload) =>
          mutations.assignEquipment.mutate(payload, {
            onSuccess: () => {
              setAssignEquipmentOpen(false);
              toast.success('Đã cấp thiết bị.');
            },
            onError: (err) =>
              toast.error(err instanceof Error ? err.message : 'Không thể cấp thiết bị.'),
          })
        }
      />

      {removeTarget && (
        <ConfirmActionDialog
          title={
            removeTarget.kind === 'coordinator'
              ? 'Gỡ điều phối viên'
              : removeTarget.kind === 'porter'
                ? 'Gỡ porter'
                : 'Hủy phân bổ thiết bị'
          }
          description={`Bạn có chắc chắn muốn ${
            removeTarget.kind === 'equipment' ? 'thu hồi' : 'gỡ'
          } "${removeTarget.label}" khỏi phiên tour này không?`}
          confirmLabel="Xác nhận"
          variant="destructive"
          isPending={isRemovePending}
          onConfirm={handleConfirmRemove}
          onCancel={() => setRemoveTarget(null)}
        />
      )}
    </div>
  );
}
