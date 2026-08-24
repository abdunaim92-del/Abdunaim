import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { DynamicIcon } from './DynamicIcon';
import {
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const AnalyticsTab: React.FC = () => {
  const {
    t,
    transactions,
    expenseByCategory,
    monthIncome,
    monthExpense,
    netSavings,
    savingsRate,
    formatMoney,
    categories,
    getCategoryById,
  } = useFinance();

  // Prepare Income Sources data
  const incomeSources = React.useMemo(() => {
    const totals: Record<string, number> = {};
    let totalIncomeSum = 0;

    transactions
      .filter((t) => t.type === 'income')
      .forEach((tx) => {
        totals[tx.categoryId] = (totals[tx.categoryId] || 0) + tx.amount;
        totalIncomeSum += tx.amount;
      });

    return Object.entries(totals).map(([catId, amount]) => {
      const cat = getCategoryById(catId) || {
        id: catId,
        name: catId,
        color: '#10B981',
      };
      return {
        name: cat.name,
        value: amount,
        percentage: totalIncomeSum > 0 ? Math.round((amount / totalIncomeSum) * 100) : 0,
        color: cat.color,
      };
    });
  }, [transactions, categories]);

  // Last 6 months trend data
  const monthlyTrendsData = React.useMemo(() => {
    const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    const now = new Date();
    const data = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const label = `${monthNames[m]} ${y !== now.getFullYear() ? y : ''}`;

      let income = 0;
      let expense = 0;

      transactions.forEach((tx) => {
        const txD = new Date(tx.date);
        if (txD.getFullYear() === y && txD.getMonth() === m) {
          if (tx.type === 'income') income += tx.amount;
          if (tx.type === 'expense') expense += tx.amount;
        }
      });

      data.push({ month: label, income, expense, net: income - expense });
    }

    return data;
  }, [transactions]);

  // Top 5 largest expenses
  const topExpenses = React.useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 w-full max-w-full min-w-0 overflow-hidden">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {t.analytics.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">{t.analytics.subtitle}</p>
      </div>

      {/* 50/30/20 Rule Audit Card */}
      <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <h3 className="font-bold text-sm sm:text-base">50/30/20 Эрежеси боюнча каржылык баланс</h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 font-medium self-start sm:self-auto shrink-0">
            Айлык эреже
          </span>
        </div>

        <p className="text-xs text-slate-300 mb-4">
          Классикалык финансылык эреже: Кирешеңиздин 50% негизги муктаждыктарга, 30% каалоолорго жана 20% топтоого / инвестицияга бөлүнүшү керек.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
            <span className="text-xs text-slate-400">Муктаждыктар (Турак, тамак, транспорт)</span>
            <div className="text-lg font-black text-white mt-1">
              {formatMoney(monthExpense * 0.7)}
            </div>
            <div className="text-[11px] text-emerald-300 mt-1">Нормада: 50% чейин</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
            <span className="text-xs text-slate-400">Көңүл ачуу & Каалоолор</span>
            <div className="text-lg font-black text-white mt-1">
              {formatMoney(monthExpense * 0.3)}
            </div>
            <div className="text-[11px] text-amber-300 mt-1">Нормада: 30% чейин</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
            <span className="text-xs text-slate-400">Үнөмдөө & Сактык (Сизде: {savingsRate}%)</span>
            <div className="text-lg font-black text-emerald-400 mt-1">
              {formatMoney(netSavings)}
            </div>
            <div className="text-[11px] text-emerald-300 mt-1">
              {savingsRate >= 20 ? '✓ Эң жакшы көрсөткүч!' : 'Сунуш: 20% жеткирүү'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full min-w-0">
        {/* Monthly Trend Comparison Bar Chart */}
        <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {t.analytics.monthlyTrend}
              </h3>
              <p className="text-xs text-slate-500">Акыркы 6 айдын киреше жана чыгымдары</p>
            </div>
            <BarChart3 className="w-5 h-5 text-slate-400 shrink-0" />
          </div>

          <div className="h-64 sm:h-72 w-full min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => formatMoney(Number(val))}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
                />
                <Bar dataKey="income" fill="#10B981" name={t.common.income} radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="#EF4444" name={t.common.expense} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Expense Donut Chart */}
        <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {t.analytics.categoryShare}
              </h3>
              <p className="text-xs text-slate-500">Чыгымдардын пайыздык үлүшү</p>
            </div>
            <PieIcon className="w-5 h-5 text-slate-400 shrink-0" />
          </div>

          <div className="h-64 sm:h-72 w-full flex items-center justify-center min-w-0 overflow-hidden">
            {expenseByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseByCategory.map((e) => ({
                      name: e.category.name,
                      value: e.amount,
                      color: e.category.color,
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={50}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expenseByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.category.color} />
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
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">Маалымат жок</div>
            )}
          </div>
        </div>
      </div>

      {/* Income Sources and Top 5 Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full min-w-0">
        {/* Income Sources Pie */}
        <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {t.analytics.incomeSources}
              </h3>
              <p className="text-xs text-slate-500">Кирешелердин түшүү каналдары</p>
            </div>
          </div>

          <div className="space-y-3">
            {incomeSources.map((source, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {source.name}
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatMoney(source.value)} ({source.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${source.percentage}%`,
                      backgroundColor: source.color,
                    }}
                  />
                </div>
              </div>
            ))}

            {incomeSources.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                Кирешелер жазыла элек
              </div>
            )}
          </div>
        </div>

        {/* Top Largest Expenses */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {t.analytics.largestExpenses}
              </h3>
              <p className="text-xs text-slate-500">Эң көп каражат сарпталган 5 операция</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {topExpenses.map((tx) => {
              const cat = getCategoryById(tx.categoryId);
              return (
                <div key={tx.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: cat ? `${cat.color}15` : '#64748B15',
                        color: cat?.color || '#64748B',
                      }}
                    >
                      <DynamicIcon name={cat?.icon || 'Tag'} className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {tx.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {cat?.name} • {tx.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-sm font-black text-red-600 dark:text-red-400">
                    -{formatMoney(tx.amount, tx.currency)}
                  </div>
                </div>
              );
            })}

            {topExpenses.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                Чыгымдар жок
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
