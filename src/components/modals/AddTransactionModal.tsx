import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { TransactionType } from '../../types';
import { DynamicIcon } from '../DynamicIcon';
import {
  X,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  Calendar,
  Clock,
  Tag,
  FileText,
  Loader2,
  Check,
} from 'lucide-react';

export const AddTransactionModal: React.FC = () => {
  const {
    t,
    isAddTxModalOpen,
    setIsAddTxModalOpen,
    editingTransaction,
    setEditingTransaction,
    categories,
    accounts,
    activeCurrency,
    addTransaction,
    updateTransaction,
    activeLanguage,
  } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(
    new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  );
  const [note, setNote] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');

  // AI Smart Natural Language state
  const [smartPrompt, setSmartPrompt] = useState<string>('');
  const [isAiParsing, setIsAiParsing] = useState<boolean>(false);
  const [aiParseError, setAiParseError] = useState<string | null>(null);
  const [showAiBox, setShowAiBox] = useState<boolean>(false);

  // Initialize or reset form
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setTitle(editingTransaction.title);
      setCategoryId(editingTransaction.categoryId);
      setAccountId(editingTransaction.accountId);
      setToAccountId(editingTransaction.toAccountId || '');
      setDate(editingTransaction.date);
      setTime(editingTransaction.time || '');
      setNote(editingTransaction.note || '');
      setTagInput(editingTransaction.tags?.join(', ') || '');
      setShowAiBox(false);
    } else {
      setType('expense');
      setAmount('');
      setTitle('');
      setDate(new Date().toISOString().split('T')[0]);
      setTime(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
      setNote('');
      setTagInput('');
      setSmartPrompt('');
      setAiParseError(null);
      setShowAiBox(false);

      // Default category and account
      const firstExp = categories.find((c) => c.type === 'expense');
      if (firstExp) setCategoryId(firstExp.id);
      if (accounts.length > 0) {
        setAccountId(accounts[0].id);
        if (accounts.length > 1) setToAccountId(accounts[1].id);
      }
    }
  }, [editingTransaction, isAddTxModalOpen, categories, accounts]);

  // Adjust category if type changes
  useEffect(() => {
    if (type === 'transfer') {
      setCategoryId('transfer');
      return;
    }
    const matchingCat = categories.find((c) => c.type === type);
    if (matchingCat && (!categoryId || categoryId === 'transfer' || categories.find(c => c.id === categoryId)?.type !== type)) {
      setCategoryId(matchingCat.id);
    }
  }, [type, categories]);

  if (!isAddTxModalOpen) return null;

  const handleClose = () => {
    setIsAddTxModalOpen(false);
    setEditingTransaction(null);
  };

  // AI Parser handler
  const handleAiParse = async () => {
    if (!smartPrompt.trim()) return;
    setIsAiParsing(true);
    setAiParseError(null);

    try {
      const res = await fetch('/api/ai/parse-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: smartPrompt, language: activeLanguage }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'AI жооп бере албады');
      }

      const parsed = data.data;
      if (parsed.amount) setAmount(parsed.amount.toString());
      if (parsed.type) setType(parsed.type);
      if (parsed.title) setTitle(parsed.title);
      if (parsed.note) setNote(parsed.note);

      // Match category
      if (parsed.category) {
        const foundCat = categories.find(
          (c) => c.id === parsed.category || c.name.toLowerCase().includes(parsed.category.toLowerCase())
        );
        if (foundCat) setCategoryId(foundCat.id);
      }

      // Match account if hinted
      if (parsed.account) {
        const foundAcc = accounts.find((a) => a.type === parsed.account || a.id.includes(parsed.account));
        if (foundAcc) setAccountId(foundAcc.id);
      }

      setShowAiBox(false);
    } catch (err: any) {
      setAiParseError(err.message || 'Ката кетти');
    } finally {
      setIsAiParsing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const selectedCategory = categories.find((c) => c.id === categoryId);
    const finalTitle = title.trim() || selectedCategory?.name || (type === 'income' ? t.common.income : t.common.expense);

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, {
        type,
        amount: numAmount,
        title: finalTitle,
        categoryId: type === 'transfer' ? 'transfer' : categoryId,
        accountId,
        toAccountId: type === 'transfer' ? toAccountId : undefined,
        date,
        time,
        note,
        tags,
      });
    } else {
      addTransaction({
        type,
        amount: numAmount,
        title: finalTitle,
        categoryId: type === 'transfer' ? 'transfer' : categoryId,
        accountId,
        toAccountId: type === 'transfer' ? toAccountId : undefined,
        date,
        time,
        note,
        tags,
        currency: activeCurrency,
      });
    }

    handleClose();
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="add-transaction-modal-dialog"
        className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 transition-all pb-safe"
      >
        {/* Mobile handle indicator */}
        <div className="sm:hidden pt-2.5 pb-1">
          <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center font-bold">
              {editingTransaction ? '✎' : '+'}
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {editingTransaction ? t.common.edit : t.transactions.addTransaction}
              </h3>
              <p className="text-xs text-slate-500">
                {type === 'expense'
                  ? t.common.expense
                  : type === 'income'
                  ? t.common.income
                  : t.common.transfer}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Quick Input Box Toggle */}
        {!editingTransaction && (
          <div className="px-5 pt-4">
            <button
              type="button"
              onClick={() => setShowAiBox(!showAiBox)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-emerald-500/10 border border-purple-200 dark:border-purple-800/60 text-purple-800 dark:text-purple-300 text-xs font-semibold hover:opacity-90 transition-all"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-pulse" />
                <span>{t.common.smartAdd} (Сөз же текст менен жазуу)</span>
              </div>
              <span className="text-[11px] text-purple-600 underline">
                {showAiBox ? 'Жабуу' : 'Ачуу'}
              </span>
            </button>

            {showAiBox && (
              <div className="mt-3 p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 space-y-2.5">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Жөн эле жазыңыз (мис.: <i>"Таксиге 250 сом төлөдүм картадан"</i> же <i>"Айлык 50000 сом келди"</i>):
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={smartPrompt}
                    onChange={(e) => setSmartPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAiParse())}
                    placeholder={t.overview.quickTransactionHint}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleAiParse}
                    disabled={isAiParsing || !smartPrompt.trim()}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                  >
                    {isAiParsing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>AI...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Таануу</span>
                      </>
                    )}
                  </button>
                </div>
                {aiParseError && (
                  <p className="text-xs text-red-500 font-medium">{aiParseError}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Transaction Type Segmented Control */}
        <div className="p-5 pb-2">
          <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                type === 'expense'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>{t.common.expense}</span>
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>{t.common.income}</span>
            </button>
            <button
              type="button"
              onClick={() => setType('transfer')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                type === 'transfer'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>{t.common.transfer}</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Large Amount Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              {t.common.amount} ({activeCurrency}) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                required
                autoFocus
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-2xl sm:text-3xl font-extrabold tracking-tight px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                {activeCurrency}
              </span>
            </div>
          </div>

          {/* Title Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Аталышы / Багыты (Мисалы: Глобус, Такси, Айлык)
            </label>
            <input
              type="text"
              placeholder="Аталышын жазыңыз..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category Picker (if not transfer) */}
          {type !== 'transfer' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {t.common.category} *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-2xl">
                {filteredCategories.map((cat) => {
                  const isSelected = categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`flex items-center gap-2 p-2 rounded-xl text-left text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-sm ring-2 ring-emerald-500/50'
                          : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : cat.color + '20', color: isSelected ? '#fff' : cat.color }}
                      >
                        <DynamicIcon name={cat.icon} className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Account Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {type === 'transfer' ? t.common.fromAccount : t.common.account} *
              </label>
              <select
                required
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({Math.round(acc.balance).toLocaleString('ru-RU')} {acc.currency})
                  </option>
                ))}
              </select>
            </div>

            {type === 'transfer' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.common.toAccount} *
                </label>
                <select
                  required
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {accounts
                    .filter((a) => a.id !== accountId)
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({Math.round(acc.balance).toLocaleString('ru-RU')} {acc.currency})
                      </option>
                    ))}
                </select>
              </div>
            )}

            {type !== 'transfer' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.common.date} & {t.common.time}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                  <div className="relative w-24">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Date for Transfer mode */}
          {type === 'transfer' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.common.date}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
              />
            </div>
          )}

          {/* Note & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.common.note}</span>
              </label>
              <input
                type="text"
                placeholder="Кыскача белги..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.common.tags} (үтүр менен)</span>
              </label>
              <input
                type="text"
                placeholder="маркет, бензин, үй"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              {editingTransaction ? t.common.save : t.common.add}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
