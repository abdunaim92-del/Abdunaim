import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { DynamicIcon } from './DynamicIcon';
import { DateFilterPreset, TransactionType } from '../types';
import {
  Search,
  Plus,
  FileSpreadsheet,
  Trash2,
  Edit2,
  Calendar,
  Filter,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
} from 'lucide-react';

export const TransactionsTab: React.FC = () => {
  const {
    t,
    filteredTransactions,
    categories,
    accounts,
    datePreset,
    setDatePreset,
    searchQuery,
    setSearchQuery,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    selectedAccountFilter,
    setSelectedAccountFilter,
    selectedTypeFilter,
    setSelectedTypeFilter,
    formatMoney,
    setIsAddTxModalOpen,
    setEditingTransaction,
    deleteTransaction,
    exportToCSV,
    getCategoryById,
    getAccountById,
  } = useFinance();

  // Calculate totals for currently filtered transactions
  const totalFilteredIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netFiltered = totalFilteredIncome - totalFilteredExpense;

  const datePresetsList: { key: DateFilterPreset; label: string }[] = [
    { key: 'today', label: t.transactions.datePresets.today },
    { key: 'yesterday', label: t.transactions.datePresets.yesterday },
    { key: 'week', label: t.transactions.datePresets.week },
    { key: 'month', label: t.transactions.datePresets.month },
    { key: 'last_month', label: t.transactions.datePresets.last_month },
    { key: 'year', label: t.transactions.datePresets.year },
    { key: 'all', label: t.transactions.datePresets.all },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full max-w-full min-w-0 overflow-hidden">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.transactions.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">{t.transactions.subtitle}</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold shadow-xs transition-all shrink-0"
            title="Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">{t.transactions.exportCsv}</span>
          </button>

          <button
            onClick={() => setIsAddTxModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t.transactions.addTransaction}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 min-w-0">
        {/* Date presets tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none max-w-full">
          {datePresetsList.map((preset) => (
            <button
              key={preset.key}
              onClick={() => setDatePreset(preset.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                datePreset === preset.key
                  ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Search & Dropdown Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.common.search}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Type Filter */}
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">{t.transactions.filterByType}: {t.common.all}</option>
            <option value="expense">{t.common.expense}</option>
            <option value="income">{t.common.income}</option>
            <option value="transfer">{t.common.transfer}</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">{t.transactions.filterByCategory}: {t.common.all}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.type === 'income' ? '+' : '-'})
              </option>
            ))}
          </select>

          {/* Account Filter */}
          <select
            value={selectedAccountFilter}
            onChange={(e) => setSelectedAccountFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">{t.transactions.filterByAccount}: {t.common.all}</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary for Selected Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-bold text-emerald-800 dark:text-emerald-300">
              {t.common.income}
            </span>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              +{formatMoney(totalFilteredIncome)}
            </div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-emerald-500" />
        </div>

        <div className="p-3.5 rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/40 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-bold text-red-800 dark:text-red-300">
              {t.common.expense}
            </span>
            <div className="text-lg font-black text-red-600 dark:text-red-400">
              -{formatMoney(totalFilteredExpense)}
            </div>
          </div>
          <ArrowDownRight className="w-5 h-5 text-red-500" />
        </div>

        <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/40 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-bold text-purple-800 dark:text-purple-300">
              {t.overview.netSavings} ({filteredTransactions.length} жазуу)
            </span>
            <div className="text-lg font-black text-purple-600 dark:text-purple-400">
              {formatMoney(netFiltered)}
            </div>
          </div>
          <Calendar className="w-5 h-5 text-purple-500" />
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredTransactions.map((tx) => {
            const category = getCategoryById(tx.categoryId);
            const account = getAccountById(tx.accountId);
            const toAccount = tx.toAccountId ? getAccountById(tx.toAccountId) : null;
            const isExpense = tx.type === 'expense';
            const isIncome = tx.type === 'income';

            return (
              <div
                key={tx.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
              >
                {/* Left details */}
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs mt-0.5 sm:mt-0"
                    style={{
                      backgroundColor: category ? `${category.color}15` : '#64748B15',
                      color: category?.color || '#64748B',
                    }}
                  >
                    <DynamicIcon name={category?.icon || 'Tag'} className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        {tx.title}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isExpense
                            ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                            : isIncome
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                        }`}
                      >
                        {isExpense
                          ? t.common.expense
                          : isIncome
                          ? t.common.income
                          : t.common.transfer}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {category?.name || tx.categoryId}
                      </span>
                      <span>•</span>
                      <span>
                        {tx.type === 'transfer' && toAccount
                          ? `${account?.name} ➔ ${toAccount.name}`
                          : account?.name}
                      </span>
                      <span>•</span>
                      <span>{tx.date} {tx.time && `(${tx.time})`}</span>
                    </div>

                    {tx.note && (
                      <p className="mt-1 text-xs text-slate-400 italic">
                        "{tx.note}"
                      </p>
                    )}

                    {/* Tags */}
                    {tx.tags && tx.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {tx.tags.map((tg, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
                          >
                            #{tg}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Amount & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left sm:text-right">
                    <div
                      className={`text-base sm:text-lg font-black tracking-tight ${
                        isExpense
                          ? 'text-red-600 dark:text-red-400'
                          : isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {isExpense ? '-' : isIncome ? '+' : ''}
                      {formatMoney(tx.amount, tx.currency)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingTransaction(tx);
                        setIsAddTxModalOpen(true);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title={t.common.edit}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(t.common.confirmDelete)) {
                          deleteTransaction(tx.id);
                        }
                      }}
                      className="p-2 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                      title={t.common.delete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredTransactions.length === 0 && (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <p className="text-sm">{t.common.noData}</p>
              <button
                onClick={() => setIsAddTxModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-semibold hover:underline"
              >
                + Биринчи жазууну кошуу
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
