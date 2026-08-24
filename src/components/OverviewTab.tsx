import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { DynamicIcon } from './DynamicIcon';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ArrowRight,
  Plus,
  AlertCircle,
  CreditCard,
  Building2,
  Trash2,
  Edit2,
  Send,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface OverviewTabProps {
  setActiveTab: (tab: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ setActiveTab }) => {
  const {
    t,
    totalBalance,
    monthIncome,
    monthExpense,
    netSavings,
    savingsRate,
    accounts,
    transactions,
    expenseByCategory,
    budgetSummaries,
    formatMoney,
    setIsAddTxModalOpen,
    setIsTransferModalOpen,
    setEditingTransaction,
    deleteTransaction,
    getCategoryById,
    getAccountById,
    activeLanguage,
    addTransaction,
    activeCurrency,
    categories,
  } = useFinance();

  // Natural Language Quick Input
  const [quickInput, setQuickInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    setIsAiLoading(true);
    setAiMessage(null);

    try {
      const res = await fetch('/api/ai/parse-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: quickInput, language: activeLanguage }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'AI жооп бере албады');
      }

      const p = data.data;
      if (!p.amount) throw new Error('Сумма аныкталган жок. Сураныч так жазыңыз.');

      // Find matching category
      let matchedCatId = p.category || (p.type === 'income' ? 'salary' : 'food');
      if (!categories.find((c) => c.id === matchedCatId)) {
        matchedCatId = p.type === 'income' ? 'other_income' : 'other_expense';
      }

      const defaultAcc = accounts[0]?.id || 'acc-main';

      addTransaction({
        title: p.title || (p.type === 'income' ? 'Киреше' : 'Чыгым'),
        amount: Number(p.amount),
        type: p.type || 'expense',
        categoryId: matchedCatId,
        accountId: defaultAcc,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        note: p.note || quickInput,
        currency: activeCurrency,
      });

      setAiMessage({
        text: `Ийгиликтүү кошулду: ${p.title || 'Операция'} - ${formatMoney(p.amount)} (${p.type === 'income' ? 'Киреше' : 'Чыгым'})`,
      });
      setQuickInput('');
      setTimeout(() => setAiMessage(null), 4000);
    } catch (err: any) {
      setAiMessage({ text: err.message || 'Ката кетти', isError: true });
    } finally {
      setIsAiLoading(false);
    }
  };

  // Prepare monthly chart data from the last 6 months or last 14 days
  const chartData = React.useMemo(() => {
    // Generate daily trends for current month
    const dailyMap: Record<string, { day: string; income: number; expense: number }> = {};
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Fill last 10 days
    for (let i = 9; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayDay = `${d.getDate()}.${d.getMonth() + 1}`;
      dailyMap[dateStr] = { day: displayDay, income: 0, expense: 0 };
    }

    transactions.forEach((tx) => {
      const d = new Date(tx.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        if (dailyMap[tx.date]) {
          if (tx.type === 'income') dailyMap[tx.date].income += tx.amount;
          if (tx.type === 'expense') dailyMap[tx.date].expense += tx.amount;
        }
      }
    });

    return Object.values(dailyMap);
  }, [transactions]);

  // Donut chart colors
  const donutData = expenseByCategory.slice(0, 5).map((item) => ({
    name: item.category.name,
    value: item.amount,
    color: item.category.color,
  }));

  const exceededBudgets = budgetSummaries.filter((b) => b.isExceeded);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 w-full max-w-full min-w-0 overflow-hidden">
      {/* Top Banner: AI Smart Sentence Quick Input */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 p-5 sm:p-7 text-white shadow-xl shadow-emerald-950/10 w-full">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-emerald-300 animate-spin" style={{ animationDuration: '8s' }} />
            <span>AI Акылдуу Ыкчам Эсептегич</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2">
            {t.overview.quickTransaction}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mb-4">
            {t.overview.quickTransactionHint}
          </p>

          <form onSubmit={handleQuickSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder="Жазыңыз: 1500 сомго дүкөндөн соода кылдым..."
                className="w-full pl-4 pr-10 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/80"
              />
              <Sparkles className="w-4 h-4 text-white/50 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              disabled={isAiLoading || !quickInput.trim()}
              className="px-6 py-3 rounded-2xl bg-white text-emerald-900 font-bold text-xs sm:text-sm hover:bg-emerald-50 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shrink-0 shadow-md active:scale-95"
            >
              {isAiLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Талдоодо...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Кошуу</span>
                </>
              )}
            </button>
          </form>

          {aiMessage && (
            <div
              className={`mt-3 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                aiMessage.isError
                  ? 'bg-red-500/20 text-red-100 border border-red-400/40'
                  : 'bg-emerald-400/20 text-emerald-100 border border-emerald-300/40'
              }`}
            >
              <span>{aiMessage.text}</span>
            </div>
          )}
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      </div>

      {/* Exceeded Budget Alert Bar (if any) */}
      {exceededBudgets.length > 0 && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <span className="font-bold">Эскертүү: </span>
              <span>
                {exceededBudgets.map((b) => b.category.name).join(', ')} категориялары боюнча айлык бюджет ашып кетти!
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('budgets')}
            className="text-amber-700 dark:text-amber-300 font-bold underline text-xs whitespace-nowrap ml-2"
          >
            Көрүү →
          </button>
        </div>
      )}

      {/* 4 Key Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Balance Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.overview.totalBalance}
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatMoney(totalBalance)}
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span>Бардык эсептер жана капчыктар</span>
            </div>
          </div>
        </div>

        {/* Monthly Income Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.overview.monthlyIncome}
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              +{formatMoney(monthIncome)}
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>Айлык, соода, фриланс</span>
            </div>
          </div>
        </div>

        {/* Monthly Expense Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.overview.monthlyExpense}
            </span>
            <div className="w-9 h-9 rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 tracking-tight">
              -{formatMoney(monthExpense)}
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-red-500" />
              <span>Коротулган чыгымдар</span>
            </div>
          </div>
        </div>

        {/* Net Savings & Rate */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.overview.netSavings}
            </span>
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
              {formatMoney(netSavings)}
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                <span>{t.overview.savingsRate}:</span>
                <span className="text-purple-600 font-bold">{savingsRate}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accounts Horizontal Carousel */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t.overview.myAccounts}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {accounts.length}
            </span>
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>{t.overview.transferMoney}</span>
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setActiveTab('accounts')}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1"
            >
              <span>{t.overview.viewAll}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: acc.color }}
                  >
                    <DynamicIcon name={acc.icon} className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[120px]">
                      {acc.name}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {acc.bankName || acc.type}
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-baseline justify-between">
                <span className="text-xs text-slate-400">{t.common.balance}:</span>
                <span className="font-extrabold text-base text-slate-900 dark:text-white">
                  {formatMoney(acc.balance, acc.currency)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Charts: Cashflow Dynamics & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 w-full min-w-0">
        {/* Cashflow Trend Area Chart (2 cols) */}
        <div className="lg:col-span-2 p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs min-w-0 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {t.overview.cashFlowTrend}
              </h3>
              <p className="text-xs text-slate-500">Күндөлүк киреше жана чыгым графиги</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-400">{t.common.income}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-slate-600 dark:text-slate-400">{t.common.expense}</span>
              </div>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '16px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`${formatMoney(Number(value))}`, '']}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#incomeGrad)"
                  name={t.common.income}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#EF4444"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#expenseGrad)"
                  name={t.common.expense}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Expense Donut Breakdown (1 col) */}
        <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between min-w-0 overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {t.overview.expenseBreakdown}
              </h3>
              <button
                onClick={() => setActiveTab('analytics')}
                className="text-xs font-bold text-emerald-600 hover:underline"
              >
                Толук
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">Бул айдагы эң чоң чыгымдар</p>

            {donutData.length > 0 ? (
              <div className="h-44 w-full flex items-center justify-center min-w-0 overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => formatMoney(Number(val))}
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                Чыгымдар каттала элек
              </div>
            )}
          </div>

          {/* Category List */}
          <div className="space-y-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            {expenseByCategory.slice(0, 4).map((item) => (
              <div key={item.category.id} className="flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2 truncate min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.category.color }}
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                    {item.category.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white shrink-0">
                  <span>{formatMoney(item.amount)}</span>
                  <span className="text-[10px] text-slate-400 font-normal w-7 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs min-w-0 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {t.overview.recentTransactions}
            </h3>
            <p className="text-xs text-slate-500">Акыркы киргизилген 6 операция</p>
          </div>
          <button
            onClick={() => setActiveTab('transactions')}
            className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 shrink-0"
          >
            <span>{t.overview.viewAll}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {transactions.slice(0, 6).map((tx) => {
            const category = getCategoryById(tx.categoryId);
            const account = getAccountById(tx.accountId);
            const toAccount = tx.toAccountId ? getAccountById(tx.toAccountId) : null;
            const isExpense = tx.type === 'expense';
            const isIncome = tx.type === 'income';

            return (
              <div
                key={tx.id}
                className="py-3 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/40 rounded-xl px-1.5 sm:px-2 transition-colors group gap-2"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: category ? `${category.color}15` : '#64748B15',
                      color: category?.color || '#64748B',
                    }}
                  >
                    <DynamicIcon name={category?.icon || 'Tag'} className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {tx.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                      <span className="truncate">{category?.name || tx.categoryId}</span>
                      <span>•</span>
                      <span className="truncate">{account?.name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-xs sm:text-base font-extrabold ${
                        isExpense
                          ? 'text-red-600 dark:text-red-400'
                          : isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {isExpense ? '-' : isIncome ? '+' : ''}
                      {formatMoney(tx.amount, tx.currency)}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => {
                        setEditingTransaction(tx);
                        setIsAddTxModalOpen(true);
                      }}
                      className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title={t.common.edit}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(t.common.confirmDelete)) {
                          deleteTransaction(tx.id);
                        }
                      }}
                      className="p-1.5 sm:p-2 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                      title={t.common.delete}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {transactions.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              {t.common.noData}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
