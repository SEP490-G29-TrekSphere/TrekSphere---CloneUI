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

export interface EquipmentItem {
  id: string;
  name: string;
  category: 'personal' | 'shared';
  type: string; // e.g. "Trang phục", "Lều trại", "Nấu nướng", "Y tế"
  isEssential: boolean; // Bắt buộc
  assignedTo?: {
    name: string;
    role: string;
    avatar: string;
  };
  isPrepared: boolean;
  notes?: string;
}

const INITIAL_EQUIPMENT: EquipmentItem[] = [
  // PERSONAL ITEMS
  {
    id: 'eq-1',
    name: 'Giày trek cổ cao chống nước',
    category: 'personal',
    type: 'Trang phục',
    isEssential: true,
    isPrepared: true,
    notes: 'Đã test thử 5km, cổ cao bảo vệ cổ chân',
  },
  {
    id: 'eq-2',
    name: 'Áo mưa bộ (Áo + Quần riêng)',
    category: 'personal',
    type: 'Trang phục',
    isEssential: true,
    isPrepared: true,
    notes: 'Không dùng áo mưa cánh dơi nguy hiểm trên sống núi',
  },
  {
    id: 'eq-3',
    name: 'Gậy leo núi 2 tay',
    category: 'personal',
    type: 'Dụng cụ',
    isEssential: true,
    isPrepared: true,
  },
  {
    id: 'eq-4',
    name: 'Đèn pin đeo đầu + Pin dự phòng',
    category: 'personal',
    type: 'Điện tử',
    isEssential: true,
    isPrepared: false,
    notes: 'Phục vụ trek đêm dậy săn mây 04:00 sáng',
  },
  {
    id: 'eq-5',
    name: 'Bình nước 1.5L + Gói bột điện giải Oresol',
    category: 'personal',
    type: 'Y tế / Nước',
    isEssential: true,
    isPrepared: true,
  },

  // SHARED ITEMS
  {
    id: 'eq-6',
    name: 'Lều cắm trại 4 người chống nước 3000mm',
    category: 'shared',
    type: 'Lều trại',
    isEssential: true,
    assignedTo: {
      name: 'Việt Dũng',
      role: 'Thành viên',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    },
    isPrepared: true,
    notes: 'Kèm phủ chống sương đêm và đinh cọc ghim đất',
  },
  {
    id: 'eq-7',
    name: 'Bộ bếp gas dã ngoại + Nồi lẩu 3.5L',
    category: 'shared',
    type: 'Nấu nướng',
    isEssential: true,
    assignedTo: {
      name: 'Minh Anh',
      role: 'Thủ quỹ · Co-Leader',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    },
    isPrepared: true,
    notes: 'Mang theo 4 bình gas mini du lịch mới 100%',
  },
  {
    id: 'eq-8',
    name: 'Bộ nẹp y tế + Băng nén chấn thương đoàn',
    category: 'shared',
    type: 'Y tế',
    isEssential: true,
    assignedTo: {
      name: 'Hoàng Nam',
      role: 'Trưởng nhóm',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    },
    isPrepared: true,
    notes: 'Gồm gạc vô trùng, xịt giảm đau lạnh, nẹp ngón/cổ chân',
  },
  {
    id: 'eq-9',
    name: 'Dây thừng cứu hộ 20m (Tải trọng 800kg)',
    category: 'shared',
    type: 'Bảo hộ',
    isEssential: true,
    assignedTo: {
      name: 'Thu Trang',
      role: 'Thành viên',
      avatar:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
    },
    isPrepared: false,
    notes: 'Đoạn đường sống lưng nhiều dốc trượt',
  },
];

const MEMBER_OPTIONS = [
  {
    name: 'Hoàng Nam',
    role: 'Trưởng nhóm',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  },
  {
    name: 'Minh Anh',
    role: 'Thủ quỹ · Co-Leader',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
  },
  {
    name: 'Việt Dũng',
    role: 'Thành viên',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
  },
  {
    name: 'Thu Trang',
    role: 'Thành viên',
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
  },
];

export function EquipmentWorkspace() {
  const [items, setItems] = useState<EquipmentItem[]>(INITIAL_EQUIPMENT);
  const [activeCategory, setActiveCategory] = useState<'all' | 'personal' | 'shared'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'personal' | 'shared'>('shared');
  const [newItemType, setNewItemType] = useState('Dụng cụ');
  const [newItemAssignee, setNewItemAssignee] = useState(MEMBER_OPTIONS[0].name);
  const [newItemNotes, setNewItemNotes] = useState('');

  const toggleStatus = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isPrepared: !item.isPrepared } : item))
    );
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const assignedMember = MEMBER_OPTIONS.find((m) => m.name === newItemAssignee);

    const newItem: EquipmentItem = {
      id: `eq-${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory,
      type: newItemType,
      isEssential: true,
      isPrepared: false,
      assignedTo: newItemCategory === 'shared' ? assignedMember : undefined,
      notes: newItemNotes.trim() || undefined,
    };

    setItems((prev) => [newItem, ...prev]);
    setIsModalOpen(false);
    setNewItemName('');
    setNewItemNotes('');
  };

  const filteredItems = items.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const totalCount = items.length;
  const preparedCount = items.filter((i) => i.isPrepared).length;
  const progressPercent = Math.round((preparedCount / totalCount) * 100);

  const sharedItems = items.filter((i) => i.category === 'shared');
  const personalItems = items.filter((i) => i.category === 'personal');

  return (
    <div className="space-y-6">
      {/* HEADER STATS & PROGRESS */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                Phân Công Đồ Dùng & Logistics Chuyến Đi
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  v2.2
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Chuẩn bị sẵn sàng hành trang cá nhân và phân công vật dụng dùng chung cho cả đoàn.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Phân Công Đồ Dùng Mới
          </button>
        </div>

        {/* PROGRESS BAR */}
        <div className="space-y-2 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Tiến độ chuẩn bị chung:
            </span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
              {preparedCount}/{totalCount} món ({progressPercent}%)
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
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
                ? 'bg-emerald-600 text-white shadow-xs'
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
                ? 'bg-emerald-600 text-white shadow-xs'
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
                ? 'bg-emerald-600 text-white shadow-xs'
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            onClick={() => toggleStatus(item.id)}
            onKeyUp={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                toggleStatus(item.id);
              }
            }}
            className={cn(
              'group relative rounded-2xl border p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3',
              item.isPrepared
                ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10'
                : 'border-border/80 bg-card hover:border-emerald-500/50 hover:shadow-sm'
            )}
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400">
                {item.isPrepared ? (
                  <CheckSquare className="h-5 w-5 fill-emerald-600 text-white dark:fill-emerald-400 dark:text-slate-900" />
                ) : (
                  <Square className="h-5 w-5 text-muted-foreground group-hover:text-emerald-600 transition" />
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
                    <span className="rounded-md bg-red-500/10 px-2 py-0.5 text-[10px] font-extrabold text-red-600 dark:text-red-400">
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
                  <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Flame className="h-3 w-3" /> Đồ dùng chung
                  </span>
                ) : (
                  <span className="font-bold text-slate-500 flex items-center gap-1">
                    <User className="h-3 w-3" /> Đồ cá nhân
                  </span>
                )}
              </span>

              {item.assignedTo ? (
                <div className="flex items-center gap-2 rounded-full bg-background border border-border/60 px-2.5 py-1">
                  <img
                    src={item.assignedTo.avatar}
                    alt={item.assignedTo.name}
                    className="h-4 w-4 rounded-full object-cover"
                  />
                  <span className="font-bold text-foreground text-[11px]">
                    {item.assignedTo.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    ({item.assignedTo.role})
                  </span>
                </div>
              ) : (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                  {item.isPrepared ? '✓ Đã sẵn sàng' : 'Chưa xếp vào balo'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL PHÂN CÔNG ĐỒ DÙNG MỚI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <Plus className="h-5 w-5 text-emerald-600" />
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
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Loại vật dụng:</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as 'personal' | 'shared')}
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
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
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
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
                    value={newItemAssignee}
                    onChange={(e) => setNewItemAssignee(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {MEMBER_OPTIONS.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name} ({m.role})
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
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
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

export default EquipmentWorkspace;
