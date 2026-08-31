import {
  CheckCircle2,
  CheckSquare,
  Flame,
  Package,
  Plus,
  Square,
  Tent,
  User,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  useAddEquipmentItem,
  useGroupEquipmentWorkspace,
  useToggleEquipmentPrepared,
} from '../../hooks/useGroupEquipmentWorkspace';
import type { MatchingMemberItem } from '../../services/companionGroupService';

interface GroupEquipmentWorkspaceProps {
  groupId: string;
  isLeader: boolean;
  members: MatchingMemberItem[];
}

/**
 * Tab "Đồ dùng" của Workspace: checklist & phân công trang thiết bị cá nhân/dùng chung —
 * tái hiện UI của `EquipmentWorkspace` (story-flow review) nhưng nối dữ liệu thật qua
 * `useGroupEquipmentWorkspace`. Thêm/phân công đồ dùng chung chỉ dành cho leader; tick trạng
 * thái "đã chuẩn bị" mở cho mọi thành viên (checklist cá nhân của từng người).
 */
export function GroupEquipmentWorkspace({
  groupId,
  isLeader,
  members,
}: GroupEquipmentWorkspaceProps) {
  const { data: items = [], isLoading } = useGroupEquipmentWorkspace(groupId);
  const addItem = useAddEquipmentItem(groupId);
  const toggle = useToggleEquipmentPrepared(groupId);

  const acceptedMembers = members.filter((m) => m.status === 'ACCEPTED');

  const [activeCategory, setActiveCategory] = useState<'all' | 'personal' | 'shared'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'personal' | 'shared'>('shared');
  const [newItemType, setNewItemType] = useState('Dụng cụ');
  const [newItemAssigneeId, setNewItemAssigneeId] = useState(acceptedMembers[0]?.userId ?? '');
  const [newItemNotes, setNewItemNotes] = useState('');

  function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const assignedMember = acceptedMembers.find((m) => m.userId === newItemAssigneeId);

    addItem.mutate(
      {
        name: newItemName.trim(),
        category: newItemCategory,
        type: newItemType,
        isEssential: true,
        assignedToUserId: newItemCategory === 'shared' ? assignedMember?.userId : undefined,
        assignedToName: newItemCategory === 'shared' ? assignedMember?.fullName : undefined,
        notes: newItemNotes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setNewItemName('');
          setNewItemNotes('');
        },
      }
    );
  }

  const filteredItems = items.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const totalCount = items.length;
  const preparedCount = items.filter((i) => i.isPrepared).length;
  const progressPercent = totalCount > 0 ? Math.round((preparedCount / totalCount) * 100) : 0;

  const sharedItems = items.filter((i) => i.category === 'shared');
  const personalItems = items.filter((i) => i.category === 'personal');

  if (isLoading) {
    return <p className="text-xs text-muted-foreground">Đang tải danh sách đồ dùng...</p>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER STATS & PROGRESS */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-foreground">
                Checklist & Phân Công Đồ Dùng Chuyến Đi
              </h3>
              <p className="text-xs text-muted-foreground">
                Chuẩn bị sẵn sàng hành trang cá nhân và phân công vật dụng dùng chung cho cả đoàn.
              </p>
            </div>
          </div>

          {isLeader ? (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary-hover transition shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Phân Công Đồ Dùng Mới
            </button>
          ) : (
            <span
              className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-2.5 text-[11px] font-bold text-muted-foreground shrink-0"
              title="Chỉ Leader được thêm hoặc phân công lại đồ dùng chung"
            >
              Chỉ Leader phân công
            </span>
          )}
        </div>

        {/* PROGRESS BAR */}
        <div className="space-y-2 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              Tiến độ chuẩn bị chung:
            </span>
            <span className="font-extrabold text-primary">
              {preparedCount}/{totalCount} món ({progressPercent}%)
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={cn(
              'rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer',
              activeCategory === 'all'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            )}
          >
            Tất cả ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('personal')}
            className={cn(
              'rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1.5',
              activeCategory === 'personal'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            )}
          >
            <User className="h-3.5 w-3.5" />
            Đồ cá nhân ({personalItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('shared')}
            className={cn(
              'rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1.5',
              activeCategory === 'shared'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            )}
          >
            <Tent className="h-3.5 w-3.5" />
            Đồ dùng chung ({sharedItems.length})
          </button>
        </div>

        <span className="hidden sm:inline text-xs text-muted-foreground italic">
          *Tick checkbox khi đã xếp đồ vào balo
        </span>
      </div>

      {/* EQUIPMENT LIST GRID */}
      {filteredItems.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-center text-xs text-muted-foreground">
          Chưa có đồ dùng nào được thêm vào checklist.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const assignedMember = item.assignedToUserId
              ? members.find((m) => m.userId === item.assignedToUserId)
              : undefined;
            const initials = item.assignedToName
              ? item.assignedToName
                  .split(' ')
                  .filter(Boolean)
                  .slice(-2)
                  .map((part) => part[0])
                  .join('')
                  .toUpperCase()
              : '';

            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => toggle.mutate(item.id)}
                onKeyUp={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    toggle.mutate(item.id);
                  }
                }}
                className={cn(
                  'group relative rounded-2xl border p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3',
                  item.isPrepared
                    ? 'border-primary/20 bg-primary/5'
                    : 'border-border/80 bg-card hover:border-primary/50 hover:shadow-sm'
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 text-primary">
                    {item.isPrepared ? (
                      <CheckSquare className="h-5 w-5 fill-primary text-white" />
                    ) : (
                      <Square className="h-5 w-5 text-muted-foreground group-hover:text-primary transition" />
                    )}
                  </span>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={cn(
                          'text-sm font-extrabold transition',
                          item.isPrepared ? 'line-through text-muted-foreground' : 'text-foreground'
                        )}
                      >
                        {item.name}
                      </h4>
                      {item.isEssential && (
                        <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-[10px] font-extrabold text-foreground">
                          Bắt buộc
                        </span>
                      )}
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                        {item.type}
                      </span>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.notes}</p>
                    )}
                  </div>
                </div>

                {/* ASSIGNEE BADGE / FOOTER */}
                <div className="flex items-center justify-between border-t border-border/40 pt-2.5 text-xs">
                  <span className="text-muted-foreground text-[11px]">
                    {item.category === 'shared' ? (
                      <span className="font-bold text-muted-foreground flex items-center gap-1">
                        <Flame className="h-3 w-3" /> Đồ dùng chung
                      </span>
                    ) : (
                      <span className="font-bold text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" /> Đồ cá nhân
                      </span>
                    )}
                  </span>

                  {item.assignedToName ? (
                    <div className="flex items-center gap-2 rounded-full bg-background border border-border/60 px-2.5 py-1">
                      {assignedMember?.avatarUrl ? (
                        <img
                          src={assignedMember.avatarUrl}
                          alt={item.assignedToName}
                          className="h-4 w-4 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/15 text-[8px] font-extrabold text-primary">
                          {initials}
                        </span>
                      )}
                      <span className="font-bold text-foreground text-[11px]">
                        {item.assignedToName}
                      </span>
                    </div>
                  ) : (
                    <span
                      className={cn(
                        'text-[11px] font-bold',
                        item.isPrepared ? 'text-primary' : 'text-muted-foreground'
                      )}
                    >
                      {item.isPrepared ? '✓ Đã sẵn sàng' : 'Chưa xếp vào balo'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL PHÂN CÔNG ĐỒ DÙNG MỚI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Thêm & Phân Công Đồ Dùng Mới
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">
                  Tên vật dụng / Trang thiết bị (*):
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Đèn bão cắm trại 50W, Túi ngủ -10 độ C..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Loại vật dụng:</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as 'personal' | 'shared')}
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="shared">Đồ dùng chung cả đoàn</option>
                    <option value="personal">Đồ dùng cá nhân</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Phân loại:</label>
                  <select
                    value={newItemType}
                    onChange={(e) => setNewItemType(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Lều trại">Lều trại</option>
                    <option value="Nấu nướng">Nấu nướng</option>
                    <option value="Y tế">Y tế & Cấp cứu</option>
                    <option value="Bảo hộ">Bảo hộ & Cứu hộ</option>
                    <option value="Điện tử">Điện tử & Đèn</option>
                    <option value="Trang phục">Trang phục</option>
                  </select>
                </div>
              </div>

              {newItemCategory === 'shared' && (
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">
                    Phân công thành viên phụ trách mang:
                  </label>
                  <select
                    value={newItemAssigneeId}
                    onChange={(e) => setNewItemAssigneeId(e.target.value)}
                    disabled={acceptedMembers.length === 0}
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-primary"
                  >
                    {acceptedMembers.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Ghi chú / Yêu cầu kỹ thuật:</label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Kiểm tra lượng gas còn trên 80%, nhớ mang adapter sạc..."
                  value={newItemNotes}
                  onChange={(e) => setNewItemNotes(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold text-muted-foreground hover:bg-muted"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={addItem.isPending}
                  className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary-hover transition disabled:opacity-50"
                >
                  Thêm & Phân Công
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupEquipmentWorkspace;
