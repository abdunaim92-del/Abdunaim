import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { DynamicIcon } from './DynamicIcon';
import { Goal, CurrencyCode } from '../types';
import confetti from 'canvas-confetti';
import {
  Plus,
  PiggyBank,
  CheckCircle2,
  Calendar,
  Sparkles,
  Edit2,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  X,
} from 'lucide-react';

export const GoalsTab: React.FC = () => {
  const {
    t,
    goals,
    formatMoney,
    addGoal,
    updateGoal,
    deleteGoal,
    depositToGoal,
    withdrawFromGoal,
    activeCurrency,
    accounts,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [color, setColor] = useState('#10B981');
  const [icon, setIcon] = useState('Palmtree');
  const [notes, setNotes] = useState('');

  // Deposit / Withdraw Sub-modal state
  const [depositModalGoal, setDepositModalGoal] = useState<Goal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');
  const [isDepositMode, setIsDepositMode] = useState<boolean>(true); // true = deposit (+), false = withdraw (-)

  const handleOpenAdd = () => {
    setEditingGoal(null);
    setName('');
    setTargetAmount('');
    setTargetDate('');
    setColor('#10B981');
    setIcon('Palmtree');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
    setTargetDate(goal.targetDate || '');
    setColor(goal.color);
    setIcon(goal.icon);
    setNotes(goal.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numTarget = parseFloat(targetAmount);
    if (!name.trim() || isNaN(numTarget) || numTarget <= 0) return;

    if (editingGoal) {
      updateGoal(editingGoal.id, {
        name,
        targetAmount: numTarget,
        targetDate: targetDate || undefined,
        color,
        icon,
        notes: notes || undefined,
      });
    } else {
      addGoal({
        name,
        targetAmount: numTarget,
        currency: activeCurrency,
        targetDate: targetDate || undefined,
        color,
        icon,
        notes: notes || undefined,
      });
    }

    setIsModalOpen(false);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositModalGoal) return;
    const amountVal = parseFloat(depositAmount);
    if (isNaN(amountVal) || amountVal <= 0) return;

    if (isDepositMode) {
      depositToGoal(depositModalGoal.id, amountVal, selectedAccountId);
      if (depositModalGoal.currentAmount + amountVal >= depositModalGoal.targetAmount) {
        try {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (err) {
          // Safe fallback
        }
      }
    } else {
      withdrawFromGoal(depositModalGoal.id, amountVal, selectedAccountId);
    }

    setDepositModalGoal(null);
    setDepositAmount('');
  };

  const colorOptions = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#EF4444', '#14B8A6'];
  const iconOptions = ['Palmtree', 'Car', 'Home', 'GraduationCap', 'Sparkles', 'PiggyBank', 'Gift', 'ShieldCheck'];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 w-full max-w-full min-w-0 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.goals.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">{t.goals.subtitle}</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 active:scale-95 transition-all self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{t.goals.addGoal}</span>
        </button>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full min-w-0">
        {goals.map((goal) => {
          const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const isDone = goal.completed || goal.currentAmount >= goal.targetAmount;

          return (
            <div
              key={goal.id}
              className={`p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border transition-all shadow-xs flex flex-col justify-between ${
                isDone
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md"
                      style={{ backgroundColor: goal.color }}
                    >
                      <DynamicIcon name={goal.icon} className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{goal.name}</span>
                        {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      </h4>
                      {goal.targetDate && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>Мөөнөтү: {goal.targetDate}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(goal)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Бул максатты өчүрөсүзбү?')) {
                          deleteGoal(goal.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600 dark:text-slate-400">
                      Топтолду: <b className="text-slate-900 dark:text-white">{formatMoney(goal.currentAmount, goal.currency)}</b>
                    </span>
                    <span className="text-emerald-600 font-extrabold">{progress}%</span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full transition-all duration-700 shadow-xs"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: goal.color,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>Максат: {formatMoney(goal.targetAmount, goal.currency)}</span>
                    {!isDone ? (
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        Калганы: {formatMoney(Math.max(0, goal.targetAmount - goal.currentAmount), goal.currency)}
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-bold">Максатка жеттиңиз! 🎉</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Deposit / Withdraw Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => {
                    setDepositModalGoal(goal);
                    setIsDepositMode(true);
                    setDepositAmount('');
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold transition-colors"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.goals.deposit} (+)</span>
                </button>

                <button
                  onClick={() => {
                    setDepositModalGoal(goal);
                    setIsDepositMode(false);
                    setDepositAmount('');
                  }}
                  className="flex items-center justify-center p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 text-xs font-semibold"
                  title={t.goals.withdraw}
                >
                  <ArrowDownRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400 space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
            <PiggyBank className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm">Топтоо максаттары азырынча жок</p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 shadow-sm"
            >
              + Биринчи максатты түзүү
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 transition-all p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingGoal ? 'Максатты өзгөртүү' : t.goals.addGoal}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Максаттын аталышы *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Мис.: Жаңы унаа, Эс алуу, Үй оңдоо..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Максаттуу сумма ({activeCurrency}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="100000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Мөөнөтү (каалоо боюнча)
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Иконкасы
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {iconOptions.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcon(ic)}
                      className={`p-2 rounded-xl border ${
                        icon === ic
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-600 dark:bg-emerald-950'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600'
                      }`}
                    >
                      <DynamicIcon name={ic} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Түсү
                </label>
                <div className="flex items-center gap-2">
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        color === c ? 'scale-125 ring-2 ring-slate-900 dark:ring-white' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
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

      {/* Deposit / Withdraw Modal */}
      {depositModalGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 transition-all p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isDepositMode ? t.goals.deposit : t.goals.withdraw}: {depositModalGoal.name}
              </h3>
              <button onClick={() => setDepositModalGoal(null)} className="p-2 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Сумма ({depositModalGoal.currency}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  autoFocus
                  placeholder="5000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full text-xl font-bold px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isDepositMode ? 'Кайсы эсептен алынсын?' : 'Кайсы эсепке которулсун?'}
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatMoney(acc.balance, acc.currency)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDepositModalGoal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-md active:scale-95 ${
                    isDepositMode ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-blue-600 hover:bg-blue-500'
                  }`}
                >
                  {isDepositMode ? 'Топтоого кошуу' : 'Чыгарып алуу'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
