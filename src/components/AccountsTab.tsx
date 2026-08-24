import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { DynamicIcon } from './DynamicIcon';
import { Account, AccountType, CurrencyCode } from '../types';
import {
  Plus,
  ArrowLeftRight,
  Edit2,
  Trash2,
  Wallet,
  CreditCard,
  Building2,
  TrendingUp,
  X,
} from 'lucide-react';

export const AccountsTab: React.FC = () => {
  const {
    t,
    accounts,
    totalBalance,
    formatMoney,
    addAccount,
    updateAccount,
    deleteAccount,
    setIsTransferModalOpen,
    activeCurrency,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>(activeCurrency);
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [color, setColor] = useState('#2563EB');
  const [icon, setIcon] = useState('CreditCard');

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setName('');
    setType('bank');
    setBalance('0');
    setCurrency(activeCurrency);
    setBankName('');
    setAccountNumber('');
    setColor('#2563EB');
    setIcon('CreditCard');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (acc: Account) => {
    setEditingAccount(acc);
    setName(acc.name);
    setType(acc.type);
    setBalance(acc.balance.toString());
    setCurrency(acc.currency);
    setBankName(acc.bankName || '');
    setAccountNumber(acc.accountNumber || '');
    setColor(acc.color);
    setIcon(acc.icon);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numBalance = parseFloat(balance);
    if (!name.trim() || isNaN(numBalance)) return;

    if (editingAccount) {
      updateAccount(editingAccount.id, {
        name,
        type,
        balance: numBalance,
        currency,
        bankName,
        accountNumber,
        color,
        icon,
      });
    } else {
      addAccount({
        name,
        type,
        balance: numBalance,
        currency,
        bankName,
        accountNumber,
        color,
        icon,
      });
    }

    setIsModalOpen(false);
  };

  const colorOptions = ['#2563EB', '#059669', '#DC2626', '#7C3AED', '#D97706', '#0891B2', '#4F46E5', '#475569'];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 w-full max-w-full min-w-0 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.accounts.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">{t.accounts.subtitle}</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 text-xs sm:text-sm font-semibold transition-all shrink-0"
          >
            <ArrowLeftRight className="w-4 h-4 text-blue-500" />
            <span>{t.overview.transferMoney}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t.accounts.addAccount}</span>
          </button>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full min-w-0">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md"
                    style={{ backgroundColor: acc.color }}
                  >
                    <DynamicIcon name={acc.icon} className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">
                      {acc.name}
                    </h4>
                    <span className="text-xs text-slate-400">
                      {acc.bankName || t.accounts.accountTypeNames[acc.type]}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(acc)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title={t.common.edit}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {accounts.length > 1 && (
                    <button
                      onClick={() => {
                        if (window.confirm('Бул эсепти өчүрөсүзбү?')) {
                          deleteAccount(acc.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                      title={t.common.delete}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {acc.accountNumber && (
                <div className="text-xs font-mono text-slate-400 mb-3">
                  {acc.accountNumber}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
              <span className="text-xs text-slate-400 font-medium">{t.common.balance}:</span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {formatMoney(acc.balance, acc.currency)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 transition-all p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingAccount ? 'Эсепти өзгөртүү' : t.accounts.addAccount}
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
                  Эсептин аталышы *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Мис.: MBANK / Visa же Капчык"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Түрү
                  </label>
                  <select
                    value={type}
                    onChange={(e) => {
                      const newType = e.target.value as AccountType;
                      setType(newType);
                      if (newType === 'cash') setIcon('Wallet');
                      if (newType === 'bank') setIcon('CreditCard');
                      if (newType === 'savings') setIcon('PiggyBank');
                      if (newType === 'investment') setIcon('TrendingUp');
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="bank">Банк картасы / Эсеп</option>
                    <option value="cash">Накталай акча</option>
                    <option value="savings">Сактык эсеп / Депозит</option>
                    <option value="investment">Инвестиция</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Валютасы
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="KGS">KGS (сом)</option>
                    <option value="USD">USD ($)</option>
                    <option value="RUB">RUB (₽)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="KZT">KZT (₸)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Баштапкы Баланс ({currency}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full text-lg font-bold px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Банктын же Мекеменин аты (каалоо боюнча)
                </label>
                <input
                  type="text"
                  placeholder="Мис.: Optima Bank, Demir, Bakai..."
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                />
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Түсү
                </label>
                <div className="flex items-center gap-2">
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
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
    </div>
  );
};
