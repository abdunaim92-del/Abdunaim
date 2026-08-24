import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { CurrencyCode, LanguageCode } from '../types';
import {
  Wallet,
  Plus,
  Sparkles,
  ArrowLeftRight,
  Database,
  Globe,
  Coins,
  TrendingUp,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const {
    t,
    activeCurrency,
    setActiveCurrency,
    activeLanguage,
    setActiveLanguage,
    totalBalance,
    formatMoney,
    setIsAddTxModalOpen,
    setIsTransferModalOpen,
    setIsDataModalOpen,
  } = useFinance();

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors shadow-xs w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20 gap-2">
          {/* Brand Logo & Name */}
          <div
            id="brand-logo"
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base sm:text-xl tracking-tight text-slate-900 dark:text-white truncate">
                  {t.appName}
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                  v2.0
                </span>
              </div>
              <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 truncate">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Center: Live Total Balance Display */}
          <div className="hidden lg:flex items-center gap-3 bg-slate-100/80 dark:bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
                {t.overview.totalBalance}
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white">
                {formatMoney(totalBalance)}
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Quick AI Assistant Button (Hidden on mobile - available in bottom nav) */}
            <button
              id="btn-nav-ai-assistant"
              onClick={() => setActiveTab('aiAdvisor')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'aiAdvisor'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/50 dark:text-purple-300 dark:hover:bg-purple-900/50 border border-purple-200/70 dark:border-purple-800/70'
              }`}
              title={t.tabs.aiAdvisor}
            >
              <Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-300 animate-pulse" />
              <span>AI Кеңешчи</span>
            </button>

            {/* Quick Transfer Button (Hidden on mobile - available in bottom nav) */}
            <button
              id="btn-nav-transfer"
              onClick={() => setIsTransferModalOpen(true)}
              className="hidden sm:flex p-2 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 transition-colors items-center gap-1.5"
              title={t.overview.transferMoney}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span className="hidden md:inline">{t.common.transfer}</span>
            </button>

            {/* Main Quick Add Transaction Button (Desktop/Tablet) */}
            <button
              id="btn-nav-quick-add"
              onClick={() => setIsAddTxModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{t.common.quickAdd}</span>
            </button>

            {/* Currency Selector */}
            <div className="relative">
              <select
                id="select-currency"
                value={activeCurrency}
                onChange={(e) => setActiveCurrency(e.target.value as CurrencyCode)}
                className="appearance-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px] sm:text-xs font-semibold py-1.5 sm:py-2 pl-5 sm:pl-7 pr-2.5 sm:pr-4 rounded-xl cursor-pointer hover:bg-slate-200/70 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                title={t.common.currency}
              >
                <option value="KGS">KGS</option>
                <option value="USD">USD</option>
                <option value="RUB">RUB</option>
                <option value="EUR">EUR</option>
                <option value="KZT">KZT</option>
              </select>
              <Coins className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400 absolute left-1.5 sm:left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Language Selector */}
            <div className="relative">
              <select
                id="select-language"
                value={activeLanguage}
                onChange={(e) => setActiveLanguage(e.target.value as LanguageCode)}
                className="appearance-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px] sm:text-xs font-semibold py-1.5 sm:py-2 pl-5 sm:pl-7 pr-2.5 sm:pr-4 rounded-xl cursor-pointer hover:bg-slate-200/70 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                title={t.common.language}
              >
                <option value="ky">KG</option>
                <option value="ru">RU</option>
                <option value="en">EN</option>
              </select>
              <Globe className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400 absolute left-1.5 sm:left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Backup & Settings Modal Trigger */}
            <button
              id="btn-nav-database-modal"
              onClick={() => setIsDataModalOpen(true)}
              className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0"
              title={t.common.export + " / " + t.common.import}
            >
              <Database className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu (Desktop & Tablet) */}
        <nav className="hidden md:flex space-x-1 lg:space-x-2 overflow-x-auto py-2.5 scrollbar-none border-t border-slate-100 dark:border-slate-800/80">
          {[
            { id: 'overview', label: t.tabs.overview },
            { id: 'transactions', label: t.tabs.transactions },
            { id: 'analytics', label: t.tabs.analytics },
            { id: 'budgets', label: t.tabs.budgets },
            { id: 'accounts', label: t.tabs.accounts },
            { id: 'goals', label: t.tabs.goals },
            { id: 'debts', label: t.tabs.debts },
            { id: 'aiAdvisor', label: t.tabs.aiAdvisor, badge: 'AI' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
