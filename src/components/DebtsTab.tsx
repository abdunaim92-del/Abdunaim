import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Debt, CurrencyCode } from '../types';
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Calendar,
  Phone,
  User,
  Trash2,
  Check,
  X,
  CreditCard,
} from 'lucide-react';

export const DebtsTab: React.FC = () => {
  const {
    t,
    debts,
    formatMoney,
    addDebt,
    settleDebt,
    addDebtPayment,
    deleteDebt,
    activeCurrency,
    accounts,
  } = useFinance();

  const [activeSubTab, setActiveSubTab] = useState<'all' | 'they_owe' | 'i_owe'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal form state
  const [personName, setPersonName] = useState('');
  const [type, setType] = useState<'i_owe' | 'they_owe'>('they_owe');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');

  const handleOpenAdd = () => {
    setPersonName('');
    setType(activeSubTab === 'i_owe' ? 'i_owe' : 'they_owe');
    setAmount('');
    setDueDate('');
    setPhone('');
    setNote('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!personName.trim() || isNaN(numAmount) || numAmount <= 0) return;

    addDebt({
      personName,
      type,
      amount: numAmount,
      currency: activeCurrency,
      dueDate: dueDate || undefined,
      phone: phone || undefined,
      note: note || undefined,
    });

    setIsModalOpen(false);
  };

  // Summaries
  const totalTheyOwe = debts
    .filter((d) => d.type === 'they_owe' && !d.isSettled)
    .reduce((sum, d) => sum + d.amount, 0);

  const totalIOwe = debts
    .filter((d) => d.type === 'i_owe' && !d.isSettled)
    .reduce((sum, d) => sum + d.amount, 0);

  const filteredDebts = debts.filter((d) => {
    if (activeSubTab === 'all') return true;
    return d.type === activeSubTab;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 w-full max-w-full min-w-0 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.debts.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">{t.debts.subtitle}</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 active:scale-95 transition-all self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{t.debts.addDebt}</span>
        </button>
      </div>

      {/* Debt Balance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full min-w-0">
        <div className="p-5 sm:p-6 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              {t.debts.theyOweMe} (Мага кайтарылуучу)
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              +{formatMoney(totalTheyOwe)}
            </div>
            <span className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-1 block">
              Башкалар сизге бере турган карыздар
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-red-50/60 dark:bg-red-950/40 border border-red-200/60 dark:border-red-800/40 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-800 dark:text-red-300">
              {t.debts.iOwe} (Мен бере турган)
            </span>
            <div className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 mt-1">
              -{formatMoney(totalIOwe)}
            </div>
            <span className="text-xs text-red-700/80 dark:text-red-400/80 mt-1 block">
              Сиз кайтарып беришиңиз керек болгон карыздар
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <ArrowDownRight className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'all'
              ? 'bg-slate-900 text-white dark:bg-emerald-600'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {t.common.all} ({debts.length})
        </button>
        <button
          onClick={() => setActiveSubTab('they_owe')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'they_owe'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {t.debts.theyOweMe}
        </button>
        <button
          onClick={() => setActiveSubTab('i_owe')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'i_owe'
              ? 'bg-red-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {t.debts.iOwe}
        </button>
      </div>

      {/* Debts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDebts.map((debt) => {
          const isTheyOwe = debt.type === 'they_owe';

          return (
            <div
              key={debt.id}
              className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all shadow-xs flex flex-col justify-between ${
                debt.isSettled
                  ? 'opacity-60 border-slate-200 dark:border-slate-800'
                  : isTheyOwe
                  ? 'border-emerald-200/80 dark:border-emerald-800/40'
                  : 'border-red-200/80 dark:border-red-800/40'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                        isTheyOwe
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950'
                          : 'bg-red-50 text-red-600 dark:bg-red-950'
                      }`}
                    >
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{debt.personName}</span>
                        {debt.isSettled && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 font-medium">
                            {t.debts.settled} ✓
                          </span>
                        )}
                      </h4>
                      <span
                        className={`text-xs font-semibold ${
                          isTheyOwe ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {isTheyOwe ? 'Мага карыз' : 'Мен карызмын'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-lg font-black ${
                        isTheyOwe ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {isTheyOwe ? '+' : '-'}
                      {formatMoney(debt.amount, debt.currency)}
                    </div>
                  </div>
                </div>

                {/* Info row */}
                <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {debt.dueDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.debts.dueDate}: {debt.dueDate}</span>
                    </div>
                  )}
                  {debt.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <a href={`tel:${debt.phone}`} className="text-blue-500 hover:underline">
                        {debt.phone}
                      </a>
                    </div>
                  )}
                  {debt.note && <p className="italic text-slate-400">"{debt.note}"</p>}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                {!debt.isSettled ? (
                  <button
                    onClick={() => settleDebt(debt.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-emerald-600 text-xs font-semibold hover:opacity-90 transition-all shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{t.debts.settleAction}</span>
                  </button>
                ) : (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Жабылган</span>
                  </span>
                )}

                <button
                  onClick={() => {
                    if (window.confirm('Бул карыз жазуусун өчүрөсүзбү?')) {
                      deleteDebt(debt.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                  title={t.common.delete}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredDebts.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400 space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
            <p className="text-sm">Карыздар жазыла элек</p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 shadow-sm"
            >
              + Жаңы карыз жазуу
            </button>
          </div>
        )}
      </div>

      {/* Add Debt Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 transition-all p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {t.debts.addDebt}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Type toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setType('they_owe')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    type === 'they_owe'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Мага карыз (+)
                </button>
                <button
                  type="button"
                  onClick={() => setType('i_owe')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    type === 'i_owe'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Мен карызмын (-)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Адамдын аты-жөнү *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Мис.: Аскар, Бакыт, Эсен..."
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Сумма ({activeCurrency}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-xl font-bold px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.debts.dueDate}
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Телефон номери
                  </label>
                  <input
                    type="tel"
                    placeholder="+996 700 000 000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.common.note}
                </label>
                <input
                  type="text"
                  placeholder="Мис.: Автотетик алууга бергем..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
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
