import {
  ArrowRightLeft,
  Bus,
  Calculator,
  CheckCircle2,
  Clock,
  Coins,
  Pencil,
  Plus,
  Receipt,
  Tent,
  Trash2,
  UserCheck,
  Users,
  Utensils,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/shared/hooks';
import { toast } from '@/store/useToastStore';
import type { ReviewActor } from '../../types/groupMatchingTypes';

export interface DebtSettlement {
  id: number;
  debtor: string;
  creditor: string;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'CONFIRMED';
}

export interface BudgetItem {
  id: number;
  category: 'trans' | 'food' | 'gear' | 'other';
  title: string;
  amount: number;
  note: string;
}

export interface ActualExpense {
  id: number;
  title: string;
  payer: string;
  amount: number;
}

const CATEGORY_CONFIG: Record<
  BudgetItem['category'],
  { label: string; icon: typeof Bus; colorClass: string }
> = {
  trans: {
    label: 'Di Chuyển',
    icon: Bus,
    colorClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  food: {
    label: 'Ăn Uống BBQ',
    icon: Utensils,
    colorClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  gear: {
    label: 'Dụng Cụ Lều Trại',
    icon: Tent,
    colorClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },
  other: {
    label: 'Chi Phí Khác',
    icon: Coins,
    colorClass: 'bg-muted text-muted-foreground border-border',
  },
};

interface BudgetWorkspaceProps {
  actor?: ReviewActor;
}

export function BudgetWorkspace({ actor = 'MEMBER' }: BudgetWorkspaceProps) {
  // Chỉ Leader/Treasurer được sửa dự toán chung và xác nhận settlement (UC-GMD09: [Treasurer/Member permission]).
  const canManageBudgetPlan = actor === 'LEADER' || actor === 'TREASURER';
  const [memberCount] = useState<number>(5);

  // Budget Items State
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    {
      id: 1,
      category: 'trans',
      title: 'Xe Limousine Khứ Hồi Hà Nội - Bắc Yên',
      amount: 2250000,
      note: 'Xe 16 chỗ đón tận nơi',
    },
    {
      id: 2,
      category: 'other',
      title: 'Chi phí thuê hướng dẫn địa hình (2 Ngày 1 Đêm)',
      amount: 1200000,
      note: 'Hỗ trợ dẫn tuyến Tà Xùa',
    },
    {
      id: 3,
      category: 'food',
      title: 'Ăn uống BBQ + Thực phẩm 3 ngày',
      amount: 1800000,
      note: 'Thịt lợn bản, gà nướng',
    },
    {
      id: 4,
      category: 'gear',
      title: 'Thuê Lều & Túi ngủ chuyên dụng',
      amount: 1000000,
      note: 'Thuê lều 4 người chống thấm',
    },
  ]);

  // Actual Expenses State
  const [actualExpenses, setActualExpenses] = useState<ActualExpense[]>([
    {
      id: 1,
      title: 'Tiền Thuê Xe Khứ Hồi Hà Nội - Bắc Yên',
      payer: 'Minh Tuấn (Leader)',
      amount: 2250000,
    },
    {
      id: 2,
      title: 'Mua Nước & Đồ Ăn BBQ',
      payer: 'Hương Trà (Hậu cần)',
      amount: 1800000,
    },
  ]);

  // P2P Debt Settlements State (Calculated via Greedy Algorithm)
  const [settlements, setSettlements] = useState<DebtSettlement[]>([
    {
      id: 1,
      debtor: 'Việt Dũng (Xế cứng)',
      creditor: 'Hương Trà (Hậu cần)',
      amount: 810000,
      dueDate: '17/08/2026',
      status: 'PENDING',
    },
    {
      id: 2,
      debtor: 'Linh Đan (Thành viên)',
      creditor: 'Minh Tuấn (Leader)',
      amount: 810000,
      dueDate: '22/08/2026',
      status: 'PENDING',
    },
  ]);

  // Modals state
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const budgetModalRef = useClickOutside<HTMLDivElement>(
    () => setIsBudgetModalOpen(false),
    isBudgetModalOpen
  );
  const [editingBudgetId, setEditingBudgetId] = useState<number | null>(null);
  const [budgetCategory, setBudgetCategory] = useState<BudgetItem['category']>('trans');
  const [budgetTitle, setBudgetTitle] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetNote, setBudgetNote] = useState('');

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const expenseModalRef = useClickOutside<HTMLDivElement>(
    () => setIsExpenseModalOpen(false),
    isExpenseModalOpen
  );
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expensePayer, setExpensePayer] = useState('Minh Tuấn (Leader)');
  const [expenseAmount, setExpenseAmount] = useState('');

  const handleConfirmSettlement = (id: number) => {
    setSettlements((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'CONFIRMED' } : s)));
    toast.success('Đã xác nhận hoàn tất thanh toán giao dịch thành công!');
  };

  // Computations
  const totalGroupBudget = budgetItems.reduce((acc, curr) => acc + curr.amount, 0);
  const avgBudgetPerPerson = memberCount > 0 ? Math.round(totalGroupBudget / memberCount) : 0;

  const totalActualSpent = actualExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const avgActualSpentPerPerson = memberCount > 0 ? Math.round(totalActualSpent / memberCount) : 0;

  // Handlers for Budget Item Modal
  const openAddBudgetModal = () => {
    setEditingBudgetId(null);
    setBudgetCategory('trans');
    setBudgetTitle('');
    setBudgetAmount('');
    setBudgetNote('');
    setIsBudgetModalOpen(true);
  };

  const openEditBudgetModal = (item: BudgetItem) => {
    setEditingBudgetId(item.id);
    setBudgetCategory(item.category);
    setBudgetTitle(item.title);
    setBudgetAmount(item.amount.toString());
    setBudgetNote(item.note);
    setIsBudgetModalOpen(true);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseInt(budgetAmount, 10) || 0;
    if (!budgetTitle.trim()) return;

    if (editingBudgetId !== null) {
      setBudgetItems((prev) =>
        prev.map((b) =>
          b.id === editingBudgetId
            ? {
                ...b,
                category: budgetCategory,
                title: budgetTitle.trim(),
                amount: amountVal,
                note: budgetNote.trim(),
              }
            : b
        )
      );
    } else {
      setBudgetItems((prev) => [
        ...prev,
        {
          id: Date.now(),
          category: budgetCategory,
          title: budgetTitle.trim(),
          amount: amountVal,
          note: budgetNote.trim(),
        },
      ]);
    }

    setIsBudgetModalOpen(false);
  };

  const handleDeleteBudget = (id: number) => {
    setBudgetItems((prev) => prev.filter((b) => b.id !== id));
  };

  // Handlers for Expense Modal
  const openAddExpenseModal = () => {
    setEditingExpenseId(null);
    setExpenseTitle('');
    setExpensePayer('Minh Tuấn (Leader)');
    setExpenseAmount('');
    setIsExpenseModalOpen(true);
  };

  const openEditExpenseModal = (exp: ActualExpense) => {
    setEditingExpenseId(exp.id);
    setExpenseTitle(exp.title);
    setExpensePayer(exp.payer);
    setExpenseAmount(exp.amount.toString());
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseInt(expenseAmount, 10) || 0;
    if (!expenseTitle.trim()) return;

    if (editingExpenseId !== null) {
      setActualExpenses((prev) =>
        prev.map((exp) =>
          exp.id === editingExpenseId
            ? { ...exp, title: expenseTitle.trim(), payer: expensePayer.trim(), amount: amountVal }
            : exp
        )
      );
    } else {
      setActualExpenses((prev) => [
        ...prev,
        {
          id: Date.now(),
          title: expenseTitle.trim(),
          payer: expensePayer.trim(),
          amount: amountVal,
        },
      ]);
    }

    setIsExpenseModalOpen(false);
  };

  const handleDeleteExpense = (id: number) => {
    setActualExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* CARD 1: KẾ HOẠCH DỰ TOÁN & CHIA SẺ CHI PHÍ */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Calculator className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Kế Hoạch Dự Toán & Chia Sẻ Chi Phí
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Định mức chi phí chuyến đi được tính tự động dựa trên số lượng thành viên ghép thực tế
            </p>
          </div>
          {canManageBudgetPlan ? (
            <button
              type="button"
              onClick={openAddBudgetModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
            >
              <Plus className="h-4 w-4" />
              Thêm Khoản Chi Mới
            </button>
          ) : (
            <span
              className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-2 text-[11px] font-bold text-muted-foreground"
              title="Chỉ Leader hoặc Treasurer được sửa dự toán chung của nhóm"
            >
              Chỉ Leader/Treasurer chỉnh dự toán
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

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-emerald-700 dark:text-emerald-300 uppercase">
              Dự Toán / Trekker
            </span>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
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
              {budgetItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-muted-foreground">
                    Chưa có khoản dự toán nào. Hãy bấm &quot;Thêm Khoản Chi Mới&quot; để thiết lập.
                  </td>
                </tr>
              ) : (
                budgetItems.map((item) => {
                  const config = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.other;
                  const Icon = config.icon;
                  const perPerson = Math.round(item.amount / (memberCount || 1));

                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border',
                            config.colorClass
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
                      <td className="p-3 font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {perPerson.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="p-3 text-muted-foreground max-w-[200px] truncate">
                        {item.note || '-'}
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        {canManageBudgetPlan ? (
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
                              className="p-1.5 text-rose-500 hover:text-rose-600 rounded-lg hover:bg-rose-500/10 transition"
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
              <Receipt className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Hóa Đơn Thực Tế & Greedy Debt Settlement
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ghi nhận các khoản ứng trước thực tế để tự động tính đối trừ giao dịch P2P tối ưu
            </p>
          </div>
          <button
            type="button"
            onClick={openAddExpenseModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 transition shadow-xs"
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
                <th className="p-3">Phương Thức Phân Chia</th>
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
                actualExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-bold text-foreground">{exp.title}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                        <UserCheck className="h-3.5 w-3.5" />
                        {exp.payer}
                      </span>
                    </td>
                    <td className="p-3 font-extrabold text-foreground whitespace-nowrap">
                      {exp.amount.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="p-3 text-muted-foreground whitespace-nowrap">
                      Chia đều {memberCount} người
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
                          className="p-1.5 text-rose-500 hover:text-rose-600 rounded-lg hover:bg-rose-500/10 transition"
                          title="Xóa"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* GREEDY DEBT SETTLEMENT BANNER */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs sm:text-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Kết Quả Tối Ưu Hóa Giao Dịch P2P (Greedy Settlement Algorithm):
          </div>

          <div className="text-xs text-foreground leading-relaxed space-y-1.5 border-t border-emerald-500/20 pt-3">
            <div>
              • Tổng chi thực tế cả đoàn:{' '}
              <strong className="text-emerald-700 dark:text-emerald-400 font-black">
                {totalActualSpent.toLocaleString('vi-VN')}đ
              </strong>{' '}
              (Trung bình{' '}
              <strong className="text-foreground">
                {avgActualSpentPerPerson.toLocaleString('vi-VN')}đ / Trekker
              </strong>
              ).
            </div>
            <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold">
              <ArrowRightLeft className="h-4 w-4 text-emerald-600 shrink-0" />
              Tự động giảm từ 10 giao dịch xuống còn 2 giao dịch trực tiếp giữa các thành viên:
            </div>
          </div>

          {/* DETAILED P2P SETTLEMENT TRANSACTIONS */}
          <div className="space-y-2.5 pt-1">
            <h4 className="text-[11px] font-extrabold tracking-wider uppercase text-emerald-900 dark:text-emerald-300">
              Danh Sách Giao Dịch Bù Trừ Nợ Trực Tiếp
            </h4>
            <div className="divide-y divide-emerald-500/20 rounded-xl border border-emerald-500/20 bg-background/80 overflow-hidden">
              {settlements.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/20 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-foreground text-xs">{item.debtor}</span>
                      <span className="text-xs text-muted-foreground font-medium">chuyển cho</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                        {item.creditor}
                      </span>
                      <span className="font-black text-rose-600 text-xs bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                        {item.amount.toLocaleString('vi-VN')}đ
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Hạn thanh toán: {item.dueDate}
                      </span>
                    </div>
                  </div>

                  {/* STATUS & ACTIONS */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {item.status === 'CONFIRMED' ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                        <CheckCircle2 className="h-4 w-4" /> Đã hoàn tất
                      </span>
                    ) : canManageBudgetPlan ? (
                      <button
                        type="button"
                        onClick={() => handleConfirmSettlement(item.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-xs"
                        title="Chỉ người nhận tiền (Leader/Treasurer) xác nhận"
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
              ))}
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
                <Calculator className="h-4 w-4 text-emerald-600" />
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
                  onChange={(e) => setBudgetCategory(e.target.value as BudgetItem['category'])}
                  className="w-full rounded-xl border border-border bg-background p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="w-full rounded-xl border border-border bg-background p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="w-full rounded-xl border border-border bg-background p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Ghi Chú Chi Tiết (Tùy chọn):</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Xe 16 chỗ đón tận nơi"
                  value={budgetNote}
                  onChange={(e) => setBudgetNote(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700 shadow-xs"
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
            className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                <Receipt className="h-4 w-4 text-purple-600" />
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
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Tên Hóa Đơn / Mục Chi Tiêu:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Mua Nước & Đồ Ăn BBQ..."
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Người Đã Ứng Tiền:</label>
                <select
                  value={expensePayer}
                  onChange={(e) => setExpensePayer(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Minh Tuấn (Leader)">Minh Tuấn (Leader)</option>
                  <option value="Hương Trà (Hậu cần)">Hương Trà (Hậu cần)</option>
                  <option value="Linh Đan (Thành viên)">Linh Đan (Thành viên)</option>
                  <option value="Việt Dũng (Xế cứng)">Việt Dũng (Xế cứng)</option>
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
                  className="w-full rounded-xl border border-border bg-background p-2.5 outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="rounded-xl bg-purple-600 px-4 py-2 font-bold text-white hover:bg-purple-700 shadow-xs"
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
