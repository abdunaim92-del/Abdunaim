import React, { useState } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { OverviewTab } from './components/OverviewTab';
import { TransactionsTab } from './components/TransactionsTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { BudgetsTab } from './components/BudgetsTab';
import { AccountsTab } from './components/AccountsTab';
import { GoalsTab } from './components/GoalsTab';
import { DebtsTab } from './components/DebtsTab';
import { AIAssistantTab } from './components/AIAssistantTab';
import { AddTransactionModal } from './components/modals/AddTransactionModal';
import { TransferModal } from './components/modals/TransferModal';
import { DataExportModal } from './components/modals/DataExportModal';

function FinanceApp() {
  const [activeTab, setActiveTab] = useState<string>('overview');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-emerald-500 selection:text-white pb-20 md:pb-0 overflow-x-hidden w-full max-w-full">
      {/* Top Navigation Bar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 overflow-x-hidden">
        {activeTab === 'overview' && <OverviewTab setActiveTab={setActiveTab} />}
        {activeTab === 'transactions' && <TransactionsTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'budgets' && <BudgetsTab />}
        {activeTab === 'accounts' && <AccountsTab />}
        {activeTab === 'goals' && <GoalsTab />}
        {activeTab === 'debts' && <DebtsTab />}
        {activeTab === 'aiAdvisor' && <AIAssistantTab />}
      </main>

      {/* Mobile Ergonomic Bottom Navigation Bar */}
      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Global Modals */}
      <AddTransactionModal />
      <TransferModal />
      <DataExportModal />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs py-6 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Финансы Эсептегич
            </span>
            <span>— Жеке жана үй-бүлөлүк бюджетти башкаруу платформасы</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Кыргызча / Русский / English</span>
            <span>•</span>
            <span>Gemini AI Интеграциясы</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <FinanceApp />
    </FinanceProvider>
  );
}
