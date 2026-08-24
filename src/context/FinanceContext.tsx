import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Account,
  Category,
  Transaction,
  Budget,
  Goal,
  Debt,
  CurrencyCode,
  LanguageCode,
  DateFilterPreset,
} from '../types';
import {
  DEFAULT_ACCOUNTS,
  DEFAULT_CATEGORIES,
  DEFAULT_TRANSACTIONS,
  DEFAULT_BUDGETS,
  DEFAULT_GOALS,
  DEFAULT_DEBTS,
  EXCHANGE_RATES,
} from '../data/initialData';
import { translations } from '../data/translations';

interface FinanceContextType {
  // Data State
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  budgets: Budget[];
  goals: Goal[];
  debts: Debt[];
  activeCurrency: CurrencyCode;
  activeLanguage: LanguageCode;
  t: typeof translations.ky;

  // Filter State
  datePreset: DateFilterPreset;
  setDatePreset: (preset: DateFilterPreset) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategoryFilter: string;
  setSelectedCategoryFilter: (catId: string) => void;
  selectedAccountFilter: string;
  setSelectedAccountFilter: (accId: string) => void;
  selectedTypeFilter: string;
  setSelectedTypeFilter: (type: string) => void;

  // Modals state
  isAddTxModalOpen: boolean;
  setIsAddTxModalOpen: (open: boolean) => void;
  isTransferModalOpen: boolean;
  setIsTransferModalOpen: (open: boolean) => void;
  isDataModalOpen: boolean;
  setIsDataModalOpen: (open: boolean) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (tx: Transaction | null) => void;

  // Setters & Actions
  setActiveCurrency: (currency: CurrencyCode) => void;
  setActiveLanguage: (lang: LanguageCode) => void;

  // Transaction CRUD
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Account CRUD
  addAccount: (acc: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, acc: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  transferFunds: (fromAccountId: string, toAccountId: string, amount: number, note?: string, date?: string) => void;

  // Budget CRUD
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;

  // Goal CRUD
  addGoal: (goal: Omit<Goal, 'id' | 'currentAmount' | 'completed'>) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  depositToGoal: (goalId: string, amount: number, fromAccountId?: string) => void;
  withdrawFromGoal: (goalId: string, amount: number, toAccountId?: string) => void;
  deleteGoal: (id: string) => void;

  // Debt CRUD
  addDebt: (debt: Omit<Debt, 'id' | 'isSettled' | 'payments' | 'createdDate'>) => void;
  updateDebt: (id: string, debt: Partial<Debt>) => void;
  addDebtPayment: (debtId: string, amount: number, note?: string, accountId?: string) => void;
  settleDebt: (debtId: string) => void;
  deleteDebt: (id: string) => void;

  // Utilities & Helpers
  formatMoney: (amount: number, currency?: CurrencyCode) => string;
  convertCurrency: (amount: number, fromCurrency: CurrencyCode, toCurrency: CurrencyCode) => number;
  getCategoryById: (id: string) => Category | undefined;
  getAccountById: (id: string) => Account | undefined;

  // Computed Summaries
  filteredTransactions: Transaction[];
  totalBalance: number;
  monthIncome: number;
  monthExpense: number;
  netSavings: number;
  savingsRate: number;
  expenseByCategory: { category: Category; amount: number; percentage: number }[];
  budgetSummaries: {
    budget: Budget;
    category: Category;
    spent: number;
    limit: number;
    remaining: number;
    percentage: number;
    isExceeded: boolean;
  }[];
  totalOwedToMe: number;
  totalIOwe: number;
  totalSavedInGoals: number;

  // Data persistence
  loadDemoData: () => void;
  resetAllData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonString: string) => boolean;
  exportToCSV: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TRANSACTIONS: 'fin_transactions_v1',
  ACCOUNTS: 'fin_accounts_v1',
  CATEGORIES: 'fin_categories_v1',
  BUDGETS: 'fin_budgets_v1',
  GOALS: 'fin_goals_v1',
  DEBTS: 'fin_debts_v1',
  CURRENCY: 'fin_currency_v1',
  LANGUAGE: 'fin_language_v1',
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Language & Currency
  const [activeLanguage, setActiveLanguageState] = useState<LanguageCode>(() => {
    return (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as LanguageCode) || 'ky';
  });
  const [activeCurrency, setActiveCurrencyState] = useState<CurrencyCode>(() => {
    return (localStorage.getItem(STORAGE_KEYS.CURRENCY) as CurrencyCode) || 'KGS';
  });

  // Core Data
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : DEFAULT_TRANSACTIONS;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return saved ? JSON.parse(saved) : DEFAULT_ACCOUNTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return saved ? JSON.parse(saved) : DEFAULT_BUDGETS;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
    return saved ? JSON.parse(saved) : DEFAULT_GOALS;
  });

  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEBTS);
    return saved ? JSON.parse(saved) : DEFAULT_DEBTS;
  });

  // Filter State
  const [datePreset, setDatePreset] = useState<DateFilterPreset>('month');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');

  // Modals state
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
  }, [debts]);

  const setActiveLanguage = (lang: LanguageCode) => {
    setActiveLanguageState(lang);
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  };

  const setActiveCurrency = (curr: CurrencyCode) => {
    setActiveCurrencyState(curr);
    localStorage.setItem(STORAGE_KEYS.CURRENCY, curr);
  };

  const t = translations[activeLanguage] || translations.ky;

  // Currency Converter
  const convertCurrency = (amount: number, from: CurrencyCode, to: CurrencyCode): number => {
    if (from === to) return amount;
    const fromRate = EXCHANGE_RATES[from] || 1;
    const toRate = EXCHANGE_RATES[to] || 1;
    const inKgs = amount * fromRate;
    return inKgs / toRate;
  };

  // Money Formatter
  const formatMoney = (amount: number, currency: CurrencyCode = activeCurrency): string => {
    const formatted = Math.round(amount).toLocaleString('ru-RU');
    switch (currency) {
      case 'KGS':
        return `${formatted} сом`;
      case 'USD':
        return `$${formatted}`;
      case 'RUB':
        return `${formatted} ₽`;
      case 'EUR':
        return `€${formatted}`;
      case 'KZT':
        return `${formatted} ₸`;
      default:
        return `${formatted} ${currency}`;
    }
  };

  const getCategoryById = (id: string) => categories.find((c) => c.id === id);
  const getAccountById = (id: string) => accounts.find((a) => a.id === id);

  // Transaction CRUD with Account balance synchronization
  const addTransaction = (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...txData,
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: Date.now(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Update account balance
    setAccounts((prevAccounts) =>
      prevAccounts.map((acc) => {
        if (newTx.type === 'expense' && acc.id === newTx.accountId) {
          return { ...acc, balance: acc.balance - newTx.amount };
        }
        if (newTx.type === 'income' && acc.id === newTx.accountId) {
          return { ...acc, balance: acc.balance + newTx.amount };
        }
        if (newTx.type === 'transfer') {
          if (acc.id === newTx.accountId) {
            return { ...acc, balance: acc.balance - newTx.amount };
          }
          if (acc.id === newTx.toAccountId) {
            return { ...acc, balance: acc.balance + newTx.amount };
          }
        }
        return acc;
      })
    );
  };

  const updateTransaction = (id: string, updatedFields: Partial<Transaction>) => {
    const oldTx = transactions.find((t) => t.id === id);
    if (!oldTx) return;

    // Rollback old balance impact
    setAccounts((prev) =>
      prev.map((acc) => {
        let newBalance = acc.balance;
        if (oldTx.type === 'expense' && acc.id === oldTx.accountId) {
          newBalance += oldTx.amount;
        }
        if (oldTx.type === 'income' && acc.id === oldTx.accountId) {
          newBalance -= oldTx.amount;
        }
        if (oldTx.type === 'transfer') {
          if (acc.id === oldTx.accountId) newBalance += oldTx.amount;
          if (acc.id === oldTx.toAccountId) newBalance -= oldTx.amount;
        }
        return { ...acc, balance: newBalance };
      })
    );

    const mergedTx = { ...oldTx, ...updatedFields };

    // Apply new balance impact
    setAccounts((prev) =>
      prev.map((acc) => {
        let newBalance = acc.balance;
        if (mergedTx.type === 'expense' && acc.id === mergedTx.accountId) {
          newBalance -= mergedTx.amount;
        }
        if (mergedTx.type === 'income' && acc.id === mergedTx.accountId) {
          newBalance += mergedTx.amount;
        }
        if (mergedTx.type === 'transfer') {
          if (acc.id === mergedTx.accountId) newBalance -= mergedTx.amount;
          if (acc.id === mergedTx.toAccountId) newBalance += mergedTx.amount;
        }
        return { ...acc, balance: newBalance };
      })
    );

    setTransactions((prev) => prev.map((t) => (t.id === id ? mergedTx : t)));
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    // Rollback balance
    setAccounts((prev) =>
      prev.map((acc) => {
        if (tx.type === 'expense' && acc.id === tx.accountId) {
          return { ...acc, balance: acc.balance + tx.amount };
        }
        if (tx.type === 'income' && acc.id === tx.accountId) {
          return { ...acc, balance: acc.balance - tx.amount };
        }
        if (tx.type === 'transfer') {
          if (acc.id === tx.accountId) return { ...acc, balance: acc.balance + tx.amount };
          if (acc.id === tx.toAccountId) return { ...acc, balance: acc.balance - tx.amount };
        }
        return acc;
      })
    );

    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Account Actions
  const addAccount = (accData: Omit<Account, 'id'>) => {
    const newAcc: Account = {
      ...accData,
      id: 'acc-' + Date.now(),
    };
    setAccounts((prev) => [...prev, newAcc]);
  };

  const updateAccount = (id: string, accData: Partial<Account>) => {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...accData } : a)));
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  const transferFunds = (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    note?: string,
    date?: string
  ) => {
    const fromAcc = getAccountById(fromAccountId);
    const toAcc = getAccountById(toAccountId);
    if (!fromAcc || !toAcc) return;

    addTransaction({
      title: `${fromAcc.name} ➔ ${toAcc.name}`,
      amount,
      type: 'transfer',
      categoryId: 'transfer',
      accountId: fromAccountId,
      toAccountId: toAccountId,
      date: date || new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      note: note || `Которуу: ${fromAcc.name} -> ${toAcc.name}`,
      currency: fromAcc.currency,
    });
  };

  // Budget Actions
  const addBudget = (budgetData: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budgetData,
      id: 'bg-' + Date.now(),
    };
    setBudgets((prev) => [...prev, newBudget]);
  };

  const updateBudget = (id: string, budgetData: Partial<Budget>) => {
    setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, ...budgetData } : b)));
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  // Goal Actions
  const addGoal = (goalData: Omit<Goal, 'id' | 'currentAmount' | 'completed'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: 'gl-' + Date.now(),
      currentAmount: 0,
      completed: false,
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  const updateGoal = (id: string, goalData: Partial<Goal>) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const updated = { ...g, ...goalData };
        if (updated.currentAmount >= updated.targetAmount) {
          updated.completed = true;
        }
        return updated;
      })
    );
  };

  const depositToGoal = (goalId: string, amount: number, fromAccountId?: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const newAmt = g.currentAmount + amount;
        return {
          ...g,
          currentAmount: newAmt,
          completed: newAmt >= g.targetAmount,
        };
      })
    );

    if (fromAccountId) {
      const goal = goals.find((g) => g.id === goalId);
      addTransaction({
        title: `Максатка топтоо: ${goal?.name || 'Максат'}`,
        amount,
        type: 'expense',
        categoryId: 'investment',
        accountId: fromAccountId,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        note: `Топтоо максатына салынды`,
        currency: activeCurrency,
      });
    }
  };

  const withdrawFromGoal = (goalId: string, amount: number, toAccountId?: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const newAmt = Math.max(0, g.currentAmount - amount);
        return {
          ...g,
          currentAmount: newAmt,
          completed: newAmt >= g.targetAmount,
        };
      })
    );

    if (toAccountId) {
      const goal = goals.find((g) => g.id === goalId);
      addTransaction({
        title: `Максаттан чечүү: ${goal?.name || 'Максат'}`,
        amount,
        type: 'income',
        categoryId: 'other_income',
        accountId: toAccountId,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        note: `Топтолгон максаттан чыгарылды`,
        currency: activeCurrency,
      });
    }
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  // Debt Actions
  const addDebt = (debtData: Omit<Debt, 'id' | 'isSettled' | 'payments' | 'createdDate'>) => {
    const newDebt: Debt = {
      ...debtData,
      id: 'debt-' + Date.now(),
      isSettled: false,
      payments: [],
      createdDate: new Date().toISOString().split('T')[0],
    };
    setDebts((prev) => [newDebt, ...prev]);
  };

  const updateDebt = (id: string, debtData: Partial<Debt>) => {
    setDebts((prev) => prev.map((d) => (d.id === id ? { ...d, ...debtData } : d)));
  };

  const addDebtPayment = (debtId: string, amount: number, note?: string, accountId?: string) => {
    setDebts((prev) =>
      prev.map((d) => {
        if (d.id !== debtId) return d;
        const newPayments = [
          ...d.payments,
          {
            id: 'pay-' + Date.now(),
            amount,
            date: new Date().toISOString().split('T')[0],
            note,
          },
        ];
        const totalPaid = newPayments.reduce((s, p) => s + p.amount, 0);
        return {
          ...d,
          payments: newPayments,
          isSettled: totalPaid >= d.amount,
        };
      })
    );

    if (accountId) {
      const debt = debts.find((d) => d.id === debtId);
      if (debt?.type === 'they_owe') {
        // They paid me back -> Income
        addTransaction({
          title: `Карыз кайтарылды: ${debt.personName}`,
          amount,
          type: 'income',
          categoryId: 'other_income',
          accountId,
          date: new Date().toISOString().split('T')[0],
          note: `Карыз төлөмү: ${note || ''}`,
          currency: debt.currency,
        });
      } else if (debt?.type === 'i_owe') {
        // I paid my debt -> Expense
        addTransaction({
          title: `Карыз төлөндү: ${debt.personName}`,
          amount,
          type: 'expense',
          categoryId: 'bills',
          accountId,
          date: new Date().toISOString().split('T')[0],
          note: `Карыз жабуу: ${note || ''}`,
          currency: debt.currency,
        });
      }
    }
  };

  const settleDebt = (debtId: string) => {
    setDebts((prev) =>
      prev.map((d) => {
        if (d.id !== debtId) return d;
        const totalPaid = d.payments.reduce((s, p) => s + p.amount, 0);
        const remaining = Math.max(0, d.amount - totalPaid);
        const payments =
          remaining > 0
            ? [
                ...d.payments,
                {
                  id: 'pay-' + Date.now(),
                  amount: remaining,
                  date: new Date().toISOString().split('T')[0],
                  note: 'Толук жабылды',
                },
              ]
            : d.payments;
        return {
          ...d,
          isSettled: true,
          payments,
        };
      })
    );
  };

  const deleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  // Date Filtering Logic
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonthYear = lastMonthDate.getFullYear();
    const lastMonth = lastMonthDate.getMonth();

    return transactions.filter((tx) => {
      // Type Filter
      if (selectedTypeFilter !== 'all' && tx.type !== selectedTypeFilter) return false;

      // Category Filter
      if (selectedCategoryFilter !== 'all' && tx.categoryId !== selectedCategoryFilter) return false;

      // Account Filter
      if (
        selectedAccountFilter !== 'all' &&
        tx.accountId !== selectedAccountFilter &&
        tx.toAccountId !== selectedAccountFilter
      ) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = tx.title.toLowerCase().includes(q);
        const matchNote = tx.note?.toLowerCase().includes(q) || false;
        const matchAmount = tx.amount.toString().includes(q);
        const matchTags = tx.tags?.some((t) => t.toLowerCase().includes(q)) || false;
        if (!matchTitle && !matchNote && !matchAmount && !matchTags) return false;
      }

      // Date Preset Filter
      if (datePreset === 'all') return true;

      const txDate = new Date(tx.date);
      const txDateStr = tx.date;

      if (datePreset === 'today') return txDateStr === todayStr;
      if (datePreset === 'yesterday') return txDateStr === yesterdayStr;

      if (datePreset === 'week') {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return txDate >= sevenDaysAgo && txDate <= now;
      }

      if (datePreset === 'month') {
        return txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth;
      }

      if (datePreset === 'last_month') {
        return txDate.getFullYear() === lastMonthYear && txDate.getMonth() === lastMonth;
      }

      if (datePreset === 'year') {
        return txDate.getFullYear() === currentYear;
      }

      return true;
    });
  }, [
    transactions,
    selectedTypeFilter,
    selectedCategoryFilter,
    selectedAccountFilter,
    searchQuery,
    datePreset,
  ]);

  // Overall Financial Calculations
  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, acc) => {
      const converted = convertCurrency(acc.balance, acc.currency, activeCurrency);
      return sum + converted;
    }, 0);
  }, [accounts, activeCurrency]);

  const currentMonthTransactions = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return transactions.filter((tx) => {
      const d = new Date(tx.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [transactions]);

  const monthIncome = useMemo(() => {
    return currentMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, activeCurrency), 0);
  }, [currentMonthTransactions, activeCurrency]);

  const monthExpense = useMemo(() => {
    return currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, activeCurrency), 0);
  }, [currentMonthTransactions, activeCurrency]);

  const netSavings = monthIncome - monthExpense;
  const savingsRate = monthIncome > 0 ? Math.max(0, Math.round((netSavings / monthIncome) * 100)) : 0;

  // Category Expense Breakdown
  const expenseByCategory = useMemo(() => {
    const totals: Record<string, number> = {};
    let totalExpenseSum = 0;

    currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((tx) => {
        const val = convertCurrency(tx.amount, tx.currency, activeCurrency);
        totals[tx.categoryId] = (totals[tx.categoryId] || 0) + val;
        totalExpenseSum += val;
      });

    return Object.entries(totals)
      .map(([catId, amount]) => {
        const category = getCategoryById(catId) || {
          id: catId,
          name: catId,
          type: 'expense' as const,
          icon: 'Tag',
          color: '#94A3B8',
          bgClass: 'bg-gray-50',
          textClass: 'text-gray-600',
          borderClass: 'border-gray-200',
        };
        const percentage = totalExpenseSum > 0 ? Math.round((amount / totalExpenseSum) * 100) : 0;
        return { category, amount, percentage };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [currentMonthTransactions, activeCurrency, categories]);

  // Budget Summaries
  const budgetSummaries = useMemo(() => {
    return budgets.map((b) => {
      const category = getCategoryById(b.categoryId) || {
        id: b.categoryId,
        name: b.categoryId,
        type: 'expense' as const,
        icon: 'Tag',
        color: '#94A3B8',
        bgClass: 'bg-gray-50',
        textClass: 'text-gray-600',
        borderClass: 'border-gray-200',
      };

      const spent = currentMonthTransactions
        .filter((tx) => tx.type === 'expense' && tx.categoryId === b.categoryId)
        .reduce((sum, tx) => sum + convertCurrency(tx.amount, tx.currency, activeCurrency), 0);

      const limit = convertCurrency(b.monthlyLimit, 'KGS', activeCurrency);
      const remaining = Math.max(0, limit - spent);
      const percentage = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
      const isExceeded = spent > limit;

      return {
        budget: b,
        category,
        spent,
        limit,
        remaining,
        percentage,
        isExceeded,
      };
    });
  }, [budgets, currentMonthTransactions, activeCurrency, categories]);

  // Debts & Savings totals
  const totalOwedToMe = useMemo(() => {
    return debts
      .filter((d) => d.type === 'they_owe' && !d.isSettled)
      .reduce((sum, d) => {
        const paid = d.payments.reduce((s, p) => s + p.amount, 0);
        const remaining = Math.max(0, d.amount - paid);
        return sum + convertCurrency(remaining, d.currency, activeCurrency);
      }, 0);
  }, [debts, activeCurrency]);

  const totalIOwe = useMemo(() => {
    return debts
      .filter((d) => d.type === 'i_owe' && !d.isSettled)
      .reduce((sum, d) => {
        const paid = d.payments.reduce((s, p) => s + p.amount, 0);
        const remaining = Math.max(0, d.amount - paid);
        return sum + convertCurrency(remaining, d.currency, activeCurrency);
      }, 0);
  }, [debts, activeCurrency]);

  const totalSavedInGoals = useMemo(() => {
    return goals.reduce((sum, g) => sum + convertCurrency(g.currentAmount, g.currency, activeCurrency), 0);
  }, [goals, activeCurrency]);

  // Demo Data & Reset
  const loadDemoData = () => {
    setTransactions(DEFAULT_TRANSACTIONS);
    setAccounts(DEFAULT_ACCOUNTS);
    setBudgets(DEFAULT_BUDGETS);
    setGoals(DEFAULT_GOALS);
    setDebts(DEFAULT_DEBTS);
    setCategories(DEFAULT_CATEGORIES);
  };

  const resetAllData = () => {
    setTransactions([]);
    setAccounts([
      {
        id: 'acc-main',
        name: 'Накталай акча',
        type: 'cash',
        balance: 0,
        currency: 'KGS',
        color: '#059669',
        icon: 'Wallet',
      },
    ]);
    setBudgets([]);
    setGoals([]);
    setDebts([]);
  };

  const exportDataJSON = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      transactions,
      accounts,
      categories,
      budgets,
      goals,
      debts,
      activeCurrency,
    };
    return JSON.stringify(data, null, 2);
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.transactions && Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
      }
      if (data.accounts && Array.isArray(data.accounts)) {
        setAccounts(data.accounts);
      }
      if (data.budgets && Array.isArray(data.budgets)) {
        setBudgets(data.budgets);
      }
      if (data.goals && Array.isArray(data.goals)) {
        setGoals(data.goals);
      }
      if (data.debts && Array.isArray(data.debts)) {
        setDebts(data.debts);
      }
      if (data.categories && Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Date', 'Type', 'Category', 'Account', 'Amount', 'Currency', 'Title', 'Note'];
    const rows = transactions.map((t) => [
      t.id,
      t.date,
      t.type,
      getCategoryById(t.categoryId)?.name || t.categoryId,
      getAccountById(t.accountId)?.name || t.accountId,
      t.amount,
      t.currency,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `finances_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        accounts,
        categories,
        budgets,
        goals,
        debts,
        activeCurrency,
        activeLanguage,
        t,
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
        isAddTxModalOpen,
        setIsAddTxModalOpen,
        isTransferModalOpen,
        setIsTransferModalOpen,
        isDataModalOpen,
        setIsDataModalOpen,
        editingTransaction,
        setEditingTransaction,
        setActiveCurrency,
        setActiveLanguage,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addAccount,
        updateAccount,
        deleteAccount,
        transferFunds,
        addBudget,
        updateBudget,
        deleteBudget,
        addGoal,
        updateGoal,
        depositToGoal,
        withdrawFromGoal,
        deleteGoal,
        addDebt,
        updateDebt,
        addDebtPayment,
        settleDebt,
        deleteDebt,
        formatMoney,
        convertCurrency,
        getCategoryById,
        getAccountById,
        filteredTransactions,
        totalBalance,
        monthIncome,
        monthExpense,
        netSavings,
        savingsRate,
        expenseByCategory,
        budgetSummaries,
        totalOwedToMe,
        totalIOwe,
        totalSavedInGoals,
        loadDemoData,
        resetAllData,
        exportDataJSON,
        importDataJSON,
        exportToCSV,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
