import {
  ArrowRightLeft,
  Bus,
  Calculator,
  CheckCircle2,
  Coins,
  ImagePlus,
  Pencil,
  Plus,
  Receipt,
  Sparkles,
  Tent,
  Trash2,
  UserCheck,
  Users,
  Utensils,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/shared/hooks';
import {
  useConfirmSettlement,
  useDeleteActualExpense,
  useDeleteBudgetPlanItem,
  useGroupBudgetWorkspace,
  useSaveActualExpense,
  useSaveBudgetPlanItem,
} from '../../hooks/useGroupBudgetWorkspace';
import type { MatchingMemberItem } from '../../services/companionGroupService';
import type { BudgetCategory } from '../../services/groupWorkspaceService';

// Single-accent rule: category is distinguished by icon + label only, not by color —
// all badges share one neutral treatment instead of a 4-way color map.
const CATEGORY_BADGE_CLASS = 'bg-muted text-foreground border-border';

const CATEGORY_CONFIG: Record<BudgetCategory, { label: string; icon: typeof Bus }> = {
  trans: {
    label: 'Di Chuyển',
    icon: Bus,
  },
  food: {
    label: 'Ăn Uống BBQ',
    icon: Utensils,
  },
  gear: {
    label: 'Dụng Cụ Lều Trại',
    icon: Tent,
  },
  other: {
    label: 'Chi Phí Khác',
    icon: Coins,
  },
};

// Các khoản chi phát sinh thực tế phổ biến trong chuyến trekking — chọn nhanh thay vì gõ tay.
const QUICK_EXPENSE_PRESETS = [
  'Xăng xe / Thuê xe di chuyển',
  'Ăn uống / BBQ chung',
  'Nước uống & Đá',
  'Vé cổng / Phí tham quan',
  'Thuê lều trại / Dụng cụ',
  'Đồ sơ cứu y tế',
  'Phí gửi xe',
  'Phát sinh khác',
];

interface GroupBudgetWorkspaceProps {
  groupId: string;
  isLeader: boolean;
  members: MatchingMemberItem[];
}

/**
 * Tab "Ngân sách" của Workspace — tái hiện 2 card (Kế hoạch dự toán + Hóa đơn thực tế &
 * Greedy Debt Settlement) từ `BudgetWorkspace` (story-flow mock) nhưng nối dữ liệu thật qua
 * `useGroupBudgetWorkspace`. Settlements được tính sẵn ở backend (greedy min-cash-flow), FE chỉ
 * hiển thị và xác nhận.
 */
export function GroupBudgetWorkspace({ groupId, isLeader, members }: GroupBudgetWorkspaceProps) {
  const { data, isLoading } = useGroupBudgetWorkspace(groupId);
  const savePlanItem = useSaveBudgetPlanItem(groupId);
  const deletePlanItem = useDeleteBudgetPlanItem(groupId);
  const saveExpense = useSaveActualExpense(groupId);
  const deleteExpense = useDeleteActualExpense(groupId);
  const confirmSettlement = useConfirmSettlement(groupId);

  const memberCount = members.length;

  // Modals state
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [budgetCategory, setBudgetCategory] = useState<BudgetCategory>('trans');
  const [budgetTitle, setBudgetTitle] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetNote, setBudgetNote] = useState('');

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expensePayerId, setExpensePayerId] = useState(members[0]?.userId ?? '');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseBeneficiaryIds, setExpenseBeneficiaryIds] = useState<string[]>([]);
  const [expenseReceiptFile, setExpenseReceiptFile] = useState<File | null>(null);
  const [expenseReceiptPreviewUrl, setExpenseReceiptPreviewUrl] = useState<string | null>(null);
  const [expenseRemoveReceipt, setExpenseRemoveReceipt] = useState(false);
  const receiptInputRef = useRef<HTMLInputElement>(null);

  // Ảnh mới chọn dùng object URL cục bộ để xem trước; phải revoke khi đổi/huỷ để tránh rò rỉ bộ nhớ.
  useEffect(() => {
    if (!expenseReceiptFile) return;
    const objectUrl = URL.createObjectURL(expenseReceiptFile);
    setExpenseReceiptPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [expenseReceiptFile]);

  const budgetModalRef = useClickOutside<HTMLDivElement>(
    () => setIsBudgetModalOpen(false),
    isBudgetModalOpen
  );
  const expenseModalRef = useClickOutside<HTMLDivElement>(
    () => setIsExpenseModalOpen(false),
    isExpenseModalOpen
  );

  if (isLoading || !data) {
    return <p className="text-xs text-muted-foreground">Đang tải dữ liệu ngân sách...</p>;
  }

  const { planItems, actualExpenses, settlements } = data;

  // Computations
  const totalGroupBudget = planItems.reduce((acc, curr) => acc + curr.amount, 0);
  const avgBudgetPerPerson = memberCount > 0 ? Math.round(totalGroupBudget / memberCount) : 0;

  const totalActualSpent = actualExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const avgActualSpentPerPerson = memberCount > 0 ? Math.round(totalActualSpent / memberCount) : 0;

  // Handlers for Budget Item Modal
  function openAddBudgetModal() {
    setEditingBudgetId(null);
    setBudgetCategory('trans');
    setBudgetTitle('');
    setBudgetAmount('');
    setBudgetNote('');
    setIsBudgetModalOpen(true);
  }

  function openEditBudgetModal(item: (typeof planItems)[number]) {
    setEditingBudgetId(item.id);
    setBudgetCategory(item.category);
    setBudgetTitle(item.title);
    setBudgetAmount(item.amount.toString());
    setBudgetNote(item.note ?? '');
    setIsBudgetModalOpen(true);
  }

  function handleSaveBudget(e: React.FormEvent) {
    e.preventDefault();
    const amountVal = parseInt(budgetAmount, 10) || 0;
    if (!budgetTitle.trim()) return;

    savePlanItem.mutate(
      {
        id: editingBudgetId ?? undefined,
        category: budgetCategory,
        title: budgetTitle.trim(),
        amount: amountVal,
        note: budgetNote.trim(),
      },
      { onSuccess: () => setIsBudgetModalOpen(false) }
    );
  }

  function handleDeleteBudget(id: string) {
    deletePlanItem.mutate(id);
  }

  // Handlers for Expense Modal
  function resetExpenseReceiptState() {
    setExpenseReceiptFile(null);
    setExpenseReceiptPreviewUrl(null);
    setExpenseRemoveReceipt(false);
    if (receiptInputRef.current) receiptInputRef.current.value = '';
  }

  function openAddExpenseModal() {
    setEditingExpenseId(null);
    setExpenseTitle('');
    setExpensePayerId(members[0]?.userId ?? '');
    setExpenseAmount('');
    setExpenseBeneficiaryIds(members.map((m) => m.userId));
    resetExpenseReceiptState();
    setIsExpenseModalOpen(true);
  }

  function openEditExpenseModal(exp: (typeof actualExpenses)[number]) {
    setEditingExpenseId(exp.id);
    setExpenseTitle(exp.title);
    setExpensePayerId(exp.payerId);
    setExpenseAmount(exp.amount.toString());
    setExpenseBeneficiaryIds(
      exp.beneficiaryIds.length > 0 ? exp.beneficiaryIds : members.map((m) => m.userId)
    );
    resetExpenseReceiptState();
    setExpenseReceiptPreviewUrl(exp.receiptImageUrl ?? null);
    setIsExpenseModalOpen(true);
  }

  function toggleExpenseBeneficiary(userId: string) {
    setExpenseBeneficiaryIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  }

  function handleReceiptFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setExpenseReceiptFile(file);
      setExpenseRemoveReceipt(false);
    }
  }

  function handleRemoveReceipt() {
    setExpenseReceiptFile(null);
    setExpenseReceiptPreviewUrl(null);
    setExpenseRemoveReceipt(true);
    if (receiptInputRef.current) receiptInputRef.current.value = '';
  }

  function handleSaveExpense(e: React.FormEvent) {
    e.preventDefault();
    const amountVal = parseInt(expenseAmount, 10) || 0;
    if (!expenseTitle.trim() || !expensePayerId || expenseBeneficiaryIds.length === 0) return;

    saveExpense.mutate(
      {
        id: editingExpenseId ?? undefined,
        title: expenseTitle.trim(),
        payerId: expensePayerId,
        amount: amountVal,
        beneficiaryIds: expenseBeneficiaryIds,
        receiptImage: expenseReceiptFile,
        removeReceiptImage: expenseRemoveReceipt,
      },
      { onSuccess: () => setIsExpenseModalOpen(false) }
    );
  }

  function handleDeleteExpense(id: string) {
    deleteExpense.mutate(id);
  }

  return (
    <div className="space-y-6">
      {/* CARD 1: KẾ HOẠCH DỰ TOÁN & CHIA SẺ CHI PHÍ */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Kế Hoạch Dự Toán & Chia Sẻ Chi Phí
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Định mức chi phí chuyến đi được tính tự động dựa trên số lượng thành viên ghép thực tế
            </p>
          </div>
          {isLeader ? (
            <button
              type="button"
              onClick={openAddBudgetModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover transition shadow-xs"
            >
              <Plus className="h-4 w-4" />
              Thêm Khoản Chi Mới
            </button>
          ) : (
            <span
              className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-2 text-[11px] font-bold text-muted-foreground"
              title="Chỉ Leader được sửa dự toán chung của nhóm"
            >
              Chỉ Leader chỉnh dự toán
            </span>
          )}
        </div>

        {/* METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Tổng Chi Phí Đoàn
            </span>
            <div className="text-xl font-black text-foreground">
              {totalGroupBudget.toLocaleString('vi-VN')}đ
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              Sĩ Số Nhóm Ghép
            </span>
            <div className="text-xl font-black text-foreground">{memberCount} Trekker</div>
          </div>

          <div className="rounded-xl border border-secondary bg-secondary/30 p-4 space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-secondary-foreground uppercase">
              Dự Toán / Trekker
            </span>
            <div className="text-xl font-black text-secondary-foreground">
              {avgBudgetPerPerson.toLocaleString('vi-VN')}đ
            </div>
          </div>
        </div>

        {/* BUDGET TABLE */}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 font-bold text-muted-foreground border-b border-border">
              <tr>
                <th className="p-3">Danh Mục</th>
                <th className="p-3">Khoản Chi Tiêu</th>
                <th className="p-3">Tổng Chi Phí</th>
                <th className="p-3">Quy Tắc Chia</th>
                <th className="p-3">Phần / Người</th>
                <th className="p-3">Ghi Chú</th>
                <th className="p-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {planItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-muted-foreground">
                    Chưa có khoản dự toán nào. Hãy bấm &quot;Thêm Khoản Chi Mới&quot; để thiết lập.
                  </td>
                </tr>
              ) : (
                planItems.map((item) => {
                  const config = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.other;
                  const Icon = config.icon;
                  const perPerson = Math.round(item.amount / (memberCount || 1));

                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border',
                            CATEGORY_BADGE_CLASS
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {config.label}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-foreground">{item.title}</td>
                      <td className="p-3 font-extrabold text-foreground whitespace-nowrap">
                        {item.amount.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="p-3 text-muted-foreground whitespace-nowrap">
                        Chia đều {memberCount} người
                      </td>
                      <td className="p-3 font-extrabold text-primary whitespace-nowrap">
                        {perPerson.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="p-3 text-muted-foreground max-w-[200px] truncate">
                        {item.note || '-'}
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        {isLeader ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditBudgetModal(item)}
                              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition"
                              title="Sửa"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBudget(item.id)}
                              className="p-1.5 text-destructive hover:text-destructive rounded-lg hover:bg-destructive/10 transition"
                              title="Xóa"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic">Chỉ xem</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CARD 2: HÓA ĐƠN THỰC TẾ & GREEDY DEBT SETTLEMENT */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Hóa Đơn Thực Tế & Greedy Debt Settlement
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ghi nhận các khoản ứng trước thực tế để tự động tính đối trừ giao dịch P2P tối ưu
            </p>
          </div>
          <button
            type="button"
            onClick={openAddExpenseModal}
            disabled={members.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover transition shadow-xs disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Nhập Hóa Đơn
          </button>
        </div>

        {/* ACTUAL EXPENSES TABLE */}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 font-bold text-muted-foreground border-b border-border">
              <tr>
                <th className="p-3">Khoản Chi Phát Sinh</th>
                <th className="p-3">Người Đã Ứng Tiền</th>
                <th className="p-3">Số Tiền Thực Tế</th>
                <th className="p-3">Người Được Chi</th>
                <th className="p-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {actualExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-xs text-muted-foreground">
                    Chưa có hóa đơn thực tế nào. Bấm &quot;Nhập Hóa Đơn&quot; để thêm khoản đã ứng.
                  </td>
                </tr>
              ) : (
                actualExpenses.map((exp) => {
                  const beneficiaryCount = exp.beneficiaryIds.length || memberCount;
                  const isForWholeGroup = beneficiaryCount >= memberCount;
                  return (
                    <tr key={exp.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          {exp.receiptImageUrl && (
                            <a
                              href={exp.receiptImageUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="Xem ảnh hoá đơn"
                              className="shrink-0"
                            >
                              <img
                                src={exp.receiptImageUrl}
                                alt="Hoá đơn"
                                className="h-8 w-8 rounded-md object-cover border border-border"
                              />
                            </a>
                          )}
                          <span>{exp.title}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground">
                          <UserCheck className="h-3.5 w-3.5" />
                          {exp.payerName}
                        </span>
                      </td>
                      <td className="p-3 font-extrabold text-foreground whitespace-nowrap">
                        {exp.amount.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="p-3 text-muted-foreground whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1.5"
                          title={exp.beneficiaryNames.join(', ')}
                        >
                          <Users className="h-3.5 w-3.5" />
                          Chia đều {beneficiaryCount}/{memberCount} người
                          {!isForWholeGroup && (
                            <span className="text-[10px] font-bold text-primary">
                              ({exp.beneficiaryNames.join(', ')})
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditExpenseModal(exp)}
                            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition"
                            title="Sửa"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="p-1.5 text-destructive hover:text-destructive rounded-lg hover:bg-destructive/10 transition"
                            title="Xóa"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* GREEDY DEBT SETTLEMENT BANNER */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2 text-primary font-extrabold text-xs sm:text-sm">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Kết Quả Tối Ưu Hóa Giao Dịch P2P (Greedy Settlement Algorithm):
          </div>

          <div className="text-xs text-foreground leading-relaxed space-y-1.5 border-t border-primary/20 pt-3">
            <div>
              • Tổng chi thực tế cả đoàn:{' '}
              <strong className="text-primary font-black">
                {totalActualSpent.toLocaleString('vi-VN')}đ
              </strong>{' '}
              (Trung bình{' '}
              <strong className="text-foreground">
                {avgActualSpentPerPerson.toLocaleString('vi-VN')}đ / Trekker
              </strong>
              ).
            </div>
            <div className="flex items-center gap-1.5 text-primary font-bold">
              <ArrowRightLeft className="h-4 w-4 text-primary shrink-0" />
              Đã tối ưu hóa còn {settlements.length} giao dịch trực tiếp giữa các thành viên:
            </div>
          </div>

          {/* DETAILED P2P SETTLEMENT TRANSACTIONS */}
          <div className="space-y-2.5 pt-1">
            <h4 className="text-[11px] font-extrabold tracking-wider uppercase text-primary">
              Danh Sách Giao Dịch Bù Trừ Nợ Trực Tiếp
            </h4>
            <div className="divide-y divide-primary/20 rounded-xl border border-primary/20 bg-background/80 overflow-hidden">
              {settlements.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  Chưa có giao dịch bù trừ nào cần thực hiện.
                </div>
              ) : (
                settlements.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/20 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-foreground text-xs">{item.debtorName}</span>
                        <span className="text-xs text-muted-foreground font-medium">
                          chuyển cho
                        </span>
                        <span className="font-bold text-foreground text-xs">
                          {item.creditorName}
                        </span>
                        <span className="font-black text-primary text-xs bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                          {item.amount.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>

                    {/* STATUS & ACTIONS */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {item.status === 'CONFIRMED' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
                          <CheckCircle2 className="h-4 w-4" /> Đã hoàn tất
                        </span>
                      ) : isLeader ? (
                        <button
                          type="button"
                          disabled={confirmSettlement.isPending}
                          onClick={() => confirmSettlement.mutate(item.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-[11px] transition shadow-xs disabled:opacity-50"
                          title="Chỉ người nhận tiền (Leader) xác nhận"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Xác Nhận Đã Nhận
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-muted-foreground italic px-2">
                          Chờ payee xác nhận
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: ADD/EDIT BUDGET ITEM */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div
            ref={budgetModalRef}
            className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                <Calculator className="h-4 w-4 text-primary" />
                {editingBudgetId ? 'Chỉnh Sửa Khoản Dự Toán' : 'Thêm Khoản Dự Toán Ngân Sách'}
              </h4>
              <button
                type="button"
                onClick={() => setIsBudgetModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Danh Mục Chi Phí:</label>
                <select
                  value={budgetCategory}
                  onChange={(e) => setBudgetCategory(e.target.value as BudgetCategory)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="trans">Di Chuyển (Xe, Tàu, Taxi)</option>
                  <option value="food">Ăn Uống BBQ / Thực Phẩm</option>
                  <option value="gear">Dụng Cụ Lều Trại</option>
                  <option value="other">Chi Phí Khác</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Tên Khoản Chi Tiêu:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Xe Limousine Khứ Hồi..."
                  value={budgetTitle}
                  onChange={(e) => setBudgetTitle(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Tổng Số Tiền Dự Toán (VNĐ):</label>
                <input
                  type="number"
                  required
                  min={0}
                  step={10000}
                  placeholder="2250000"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Ghi Chú Chi Tiết (Tùy chọn):</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Xe 16 chỗ đón tận nơi"
                  value={budgetNote}
                  onChange={(e) => setBudgetNote(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsBudgetModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-bold text-muted-foreground hover:bg-muted"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savePlanItem.isPending}
                  className="rounded-xl bg-primary px-4 py-2 font-bold text-white hover:bg-primary-hover shadow-xs disabled:opacity-50"
                >
                  Lưu Khoản Chi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD/EDIT ACTUAL EXPENSE */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div
            ref={expenseModalRef}
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" />
                {editingExpenseId ? 'Chỉnh Sửa Hóa Đơn' : 'Nhập Hóa Đơn Thực Tế'}
              </h4>
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4 text-xs">
              {/* QUICK PRESETS */}
              <div className="space-y-1.5">
                <label className="font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Chọn Nhanh Khoản Chi Phổ Biến:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_EXPENSE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setExpenseTitle(preset)}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-[11px] font-bold transition',
                        expenseTitle === preset
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Tên Hóa Đơn / Mục Chi Tiêu:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Mua Nước & Đồ Ăn BBQ..."
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Người Đã Ứng Tiền:</label>
                <select
                  value={expensePayerId}
                  onChange={(e) => setExpensePayerId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 outline-none focus:ring-2 focus:ring-primary"
                >
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Số Tiền Thực Tế (VNĐ):</label>
                <input
                  type="number"
                  required
                  min={0}
                  step={10000}
                  placeholder="1800000"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* BENEFICIARIES */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-foreground">
                    Người Được Chi (chia đều số tiền cho những người được chọn):
                  </label>
                  <div className="flex items-center gap-2 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setExpenseBeneficiaryIds(members.map((m) => m.userId))}
                      className="text-primary hover:underline"
                    >
                      Chọn cả nhóm
                    </button>
                    <span className="text-border">|</span>
                    <button
                      type="button"
                      onClick={() => setExpenseBeneficiaryIds([])}
                      className="text-muted-foreground hover:underline"
                    >
                      Bỏ chọn hết
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto rounded-xl border border-border p-2.5">
                  {members.map((m) => {
                    const checked = expenseBeneficiaryIds.includes(m.userId);
                    return (
                      <label
                        key={m.userId}
                        className={cn(
                          'flex items-center gap-2 rounded-lg border px-2.5 py-1.5 cursor-pointer transition',
                          checked
                            ? 'border-primary bg-primary/5'
                            : 'border-transparent hover:bg-muted/40'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleExpenseBeneficiary(m.userId)}
                          className="accent-primary"
                        />
                        <span className="truncate font-bold text-foreground">{m.fullName}</span>
                      </label>
                    );
                  })}
                </div>
                {expenseBeneficiaryIds.length === 0 && (
                  <p className="text-destructive font-bold">
                    Cần chọn ít nhất một người được chi khoản này.
                  </p>
                )}
              </div>

              {/* RECEIPT IMAGE UPLOAD */}
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Ảnh Hóa Đơn (Tùy chọn):</label>
                {expenseReceiptPreviewUrl ? (
                  <div className="relative w-28">
                    <img
                      src={expenseReceiptPreviewUrl}
                      alt="Xem trước hoá đơn"
                      className="h-28 w-28 rounded-xl object-cover border border-border"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveReceipt}
                      className="absolute -top-2 -right-2 rounded-full bg-destructive text-white p-1 shadow-xs hover:bg-destructive/90"
                      title="Xoá ảnh"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => receiptInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-1.5 w-28 h-28 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition"
                  >
                    <ImagePlus className="h-5 w-5" />
                    <span className="text-[10px] font-bold">Tải ảnh lên</span>
                  </button>
                )}
                <input
                  ref={receiptInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptFileChange}
                  className="hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-bold text-muted-foreground hover:bg-muted"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saveExpense.isPending || expenseBeneficiaryIds.length === 0}
                  className="rounded-xl bg-primary px-4 py-2 font-bold text-white hover:bg-primary-hover shadow-xs disabled:opacity-50"
                >
                  Lưu Hóa Đơn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
