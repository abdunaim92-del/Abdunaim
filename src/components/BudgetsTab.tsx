import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { DynamicIcon } from './DynamicIcon';
import { Budget } from '../types';
import {
  Plus,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Trash2,
  ShieldAlert,
  Calendar,
  X,
} from 'lucide-react';

export const BudgetsTab: React.FC = () => {
  const {
    t,
    budgets,
    budgetSummaries,
    categories,
    formatMoney,
    addBudget,
    updateBudget,
    deleteBudget,
    activeCurrency,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [monthlyLimit, setMonthlyLimit] = useState<string>('');

  // Calculate days remaining in current month for daily safe allowance
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - now.getDate() + 1);

  const totalBudgetLimit = budgetSummaries.reduce((sum, b) => sum + b.limit, 0);
  const totalBudgetSpent = budgetSummaries.reduce((sum, b) => sum + b.spent, 0);
  const totalBudgetRemaining = Math.max(0, totalBudgetLimit - totalBudgetSpent);
  const safeDailySpend = Math.round(totalBudgetRemaining / daysRemaining);

  const handleOpenAdd = () => {
    setEditingBudget(null);
    const availableCategory = categories.find(
      (c) => c.type === 'expense' && !budgets.some((b) => b.categoryId === c.id)
    );
    setSelectedCategoryId(availableCategory?.id || categories[0]?.id || '');
    setMonthlyLimit('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setSelectedCategoryId(budget.categoryId);
    setMonthlyLimit(budget.monthlyLimit.toString());
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(monthlyLimit);
    if (isNaN(limit) || limit <= 0) return;

    if (editingBudget) {
      updateBudget(editingBudget.id, {
        categoryId: selectedCategoryId,
        monthlyLimit: limit,
      });
    } else {
      addBudget({
        categoryId: selectedCategoryId,
        monthlyLimit: limit,
        period: 'monthly',
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 w-full max-w-full min-w-0 overflow-hidden">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.budgets.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">{t.budgets.subtitle}</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 active:scale-95 transition-all self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{t.budgets.addBudget}</span>
        </button>
      </div>

      {/* Budget Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full min-w-0">
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs min-w-0">
          <span className="text-xs font-bold uppercase text-slate-500">Жалпы айлык лимит</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatMoney(totalBudgetLimit)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {budgets.length} категория боюнча
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs min-w-0">
          <span className="text-xs font-bold uppercase text-slate-500">Коротулган сумма</span>
          <div className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400 mt-1">
            {formatMoney(totalBudgetSpent)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {totalBudgetLimit > 0
              ? `${Math.round((totalBudgetSpent / totalBudgetLimit) * 100)}% коротулду`
              : '0%'}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 shadow-xs min-w-0">
          <span className="text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300">
            {t.budgets.dailySafeSpend}
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatMoney(safeDailySpend)} / күн
          </div>
          <div className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>Айдын аягына чейин: {daysRemaining} күн калды</span>
          </div>
        </div>
      </div>

      {/* Category Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 w-full min-w-0">
        {budgetSummaries.map((item) => {
          const isOver = item.isExceeded;
          const isNear = item.percentage >= 80 && !isOver;

          return (
            <div
              key={item.budget.id}
              className={`p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border transition-all shadow-xs ${
                isOver
                  ? 'border-red-300 dark:border-red-800/80 ring-1 ring-red-500/20'
                  : isNear
                  ? 'border-amber-300 dark:border-amber-800/80'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: item.category.color }}
                  >
                    <DynamicIcon name={item.category.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                      {item.category.name}
                    </h4>
                    <span className="text-xs text-slate-400">
                      Лимит: {formatMoney(item.limit)} / ай
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(item.budget)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title={t.common.edit}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Бул бюджетти өчүрөсүзбү?')) {
                        deleteBudget(item.budget.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                    title={t.common.delete}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600 dark:text-slate-400">
                    {t.budgets.spent}: <b className="text-slate-900 dark:text-white">{formatMoney(item.spent)}</b>
                  </span>
                  <span
                    className={
                      isOver
                        ? 'text-red-600'
                        : isNear
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }
                  >
                    {item.percentage}%
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver
                        ? 'bg-red-500'
                        : isNear
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, item.percentage)}%` }}
                  />
                </div>

                {/* Remaining or Exceeded message */}
                <div className="flex items-center justify-between text-xs pt-1">
                  {isOver ? (
                    <span className="text-red-600 dark:text-red-400 font-semibold flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>{t.budgets.exceeded} ({formatMoney(item.spent - item.limit)} ашты)</span>
                    </span>
                  ) : (
                    <span className="text-slate-500 dark:text-slate-400">
                      {t.budgets.remaining}: <b className="text-emerald-600 dark:text-emerald-400">{formatMoney(item.remaining)}</b>
                    </span>
                  )}

                  <span className="text-[11px] text-slate-400">
                    Күнүнө ~{formatMoney(Math.round(item.remaining / daysRemaining))}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {budgets.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400 space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
            <p className="text-sm">Азырынча бюджеттик лимиттер коюла элек</p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 shadow-sm"
            >
              + Биринчи лимитти кошуу
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 transition-all p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingBudget ? 'Бюджетти өзгөртүү' : t.budgets.addBudget}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Категория *
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  {categories
                    .filter((c) => c.type === 'expense')
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Айлык Лимит ({activeCurrency}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="20000"
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(e.target.value)}
                  className="w-full text-lg font-bold px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:scale-95"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
