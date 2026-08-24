import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  LayoutDashboard,
  ReceiptText,
  PieChart,
  Target,
  Plus,
  MoreHorizontal,
  Wallet,
  Sparkles,
  ArrowLeftRight,
  Database,
  HandCoins,
  ShieldCheck,
  X,
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const {
    t,
    setIsAddTxModalOpen,
    setIsTransferModalOpen,
    setIsDataModalOpen,
  } = useFinance();

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const mainTabs = [
    { id: 'overview', label: t.tabs.overview, icon: LayoutDashboard },
    { id: 'transactions', label: t.tabs.transactions, icon: ReceiptText },
    { id: 'analytics', label: t.tabs.analytics, icon: PieChart },
    { id: 'budgets', label: t.tabs.budgets, icon: ShieldCheck },
  ];

  const moreItems = [
    {
      id: 'aiAdvisor',
      label: t.tabs.aiAdvisor,
      sub: 'Gemini AI каржылык кеңешчи',
      icon: Sparkles,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/60',
      action: () => {
        setActiveTab('aiAdvisor');
        setIsMoreMenuOpen(false);
      },
    },
    {
      id: 'accounts',
      label: t.tabs.accounts,
      sub: 'Капчыктар жана банк карталары',
      icon: Wallet,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/60',
      action: () => {
        setActiveTab('accounts');
        setIsMoreMenuOpen(false);
      },
    },
    {
      id: 'goals',
      label: t.tabs.goals,
      sub: 'Топтоо максаттары жана пландар',
      icon: Target,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      action: () => {
        setActiveTab('goals');
        setIsMoreMenuOpen(false);
      },
    },
    {
      id: 'debts',
      label: t.tabs.debts,
      sub: 'Карыздар жана эсептешүүлөр',
      icon: HandCoins,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      action: () => {
        setActiveTab('debts');
        setIsMoreMenuOpen(false);
      },
    },
    {
      id: 'transfer',
      label: t.overview.transferMoney,
      sub: 'Эсептер арасында акча которуу',
      icon: ArrowLeftRight,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/60',
      action: () => {
        setIsTransferModalOpen(true);
        setIsMoreMenuOpen(false);
      },
    },
    {
      id: 'data',
      label: 'Экспорт & Резервдик көчүрмө',
      sub: 'Excel/JSON көчүрүү жана калыбына келтирүү',
      icon: Database,
      color: 'text-slate-600 dark:text-slate-400',
      bg: 'bg-slate-100 dark:bg-slate-800',
      action: () => {
        setIsDataModalOpen(true);
        setIsMoreMenuOpen(false);
      },
    },
  ];

  const isMoreTabActive = ['accounts', 'goals', 'debts', 'aiAdvisor'].includes(activeTab);

  return (
    <>
      {/* Mobile Sticky Bottom Navigation Bar (Visible on mobile/tablet screens < md) */}
      <nav
        id="mobile-bottom-navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 pb-safe px-2 py-1.5 shadow-lg"
      >
        <div className="flex items-center justify-around relative">
          {/* Main Tab 1: Overview */}
          <button
            id="mob-nav-overview"
            onClick={() => setActiveTab('overview')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              activeTab === 'overview'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">{t.tabs.overview}</span>
          </button>

          {/* Main Tab 2: Transactions */}
          <button
            id="mob-nav-transactions"
            onClick={() => setActiveTab('transactions')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              activeTab === 'transactions'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <ReceiptText className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">{t.tabs.transactions}</span>
          </button>

          {/* Center Floating Action Button (FAB) for Quick Add */}
          <div className="relative -top-4 flex items-center justify-center">
            <button
              id="mob-nav-fab-add"
              onClick={() => setIsAddTxModalOpen(true)}
              aria-label={t.transactions.addTransaction}
              className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 active:scale-90 transition-all border-4 border-slate-50 dark:border-slate-950"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </button>
          </div>

          {/* Main Tab 3: Analytics */}
          <button
            id="mob-nav-analytics"
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              activeTab === 'analytics'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <PieChart className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">{t.tabs.analytics}</span>
          </button>

          {/* Main Tab 4: More Menu Drawer Trigger */}
          <button
            id="mob-nav-more"
            onClick={() => setIsMoreMenuOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              isMoreTabActive || isMoreMenuOpen
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <MoreHorizontal className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Көбүрөөк</span>
          </button>
        </div>
      </nav>

      {/* Mobile "More" Bottom Sheet Modal */}
      {isMoreMenuOpen && (
        <div
          id="mob-more-drawer-overlay"
          onClick={() => setIsMoreMenuOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end justify-center animate-in fade-in duration-200"
        >
          <div
            id="mob-more-drawer-content"
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl p-5 border-t border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto"
          >
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto" />

            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Бардык бөлүмдөр жана кызматтар
              </h3>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Budgets Option */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  setActiveTab('budgets');
                  setIsMoreMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 p-3 rounded-2xl transition-all text-left ${
                  activeTab === 'budgets'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    {t.tabs.budgets} (Лимиттер)
                  </div>
                  <div className="text-xs text-slate-400">
                    Категориялар боюнча чыгым лимиттерин коюу
                  </div>
                </div>
              </button>

              {moreItems.map((item) => {
                const isCurrent = activeTab === item.id;
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className={`w-full flex items-center gap-3.5 p-3 rounded-2xl transition-all text-left ${
                      isCurrent
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center shrink-0`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        {item.label}
                      </div>
                      <div className="text-xs text-slate-400">{item.sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
