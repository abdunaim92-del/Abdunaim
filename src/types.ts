export type CurrencyCode = 'KGS' | 'USD' | 'RUB' | 'EUR' | 'KZT';
export type LanguageCode = 'ky' | 'ru' | 'en';

export type TransactionType = 'expense' | 'income' | 'transfer';

export type AccountType = 'cash' | 'bank' | 'savings' | 'investment';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: CurrencyCode;
  color: string;
  icon: string;
  bankName?: string;
  accountNumber?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  accountId: string;
  toAccountId?: string; // only for transfer
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  note?: string;
  tags?: string[];
  currency: CurrencyCode;
  createdAt: number;
}

export interface Budget {
  id: string;
  categoryId: string;
  monthlyLimit: number;
  period: 'monthly' | 'weekly';
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: CurrencyCode;
  targetDate?: string;
  color: string;
  icon: string;
  notes?: string;
  completed: boolean;
}

export interface DebtPayment {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Debt {
  id: string;
  personName: string;
  phone?: string;
  amount: number;
  currency: CurrencyCode;
  type: 'they_owe' | 'i_owe'; // they_owe = I gave loan; i_owe = I borrowed
  dueDate?: string;
  createdDate: string;
  note?: string;
  isSettled: boolean;
  payments: DebtPayment[];
}

export interface FinancialHealthAnalysis {
  healthScore: number;
  healthStatus: string;
  summaryInsight: string;
  strengths: string[];
  warnings: string[];
  actionableTips: string[];
  recommendedBudgetAdjustment?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'model';
  text: string;
  timestamp: string;
}

export type DateFilterPreset = 'today' | 'yesterday' | 'week' | 'month' | 'last_month' | 'year' | 'all' | 'custom';
