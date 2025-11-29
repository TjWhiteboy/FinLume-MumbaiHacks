
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum Category {
  FOOD = 'Food & Dining',
  TRANSPORT = 'Transport',
  HOUSING = 'Housing & Utilities',
  FREELANCE = 'Freelance Income',
  SALARY = 'Salary',
  INVESTMENT = 'Investment',
  SHOPPING = 'Shopping',
  ENTERTAINMENT = 'Entertainment',
  HEALTH = 'Health',
  SAVINGS = 'Savings',
  DEBT = 'Debt Payments',
  UNCATEGORIZED = 'Uncategorized'
}

export interface Transaction {
  id: string;
  date: string; // ISO date string
  amount: number;
  description: string;
  category: Category;
  type: TransactionType;
  merchant?: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit';
  balance: number;
  lastSynced: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
}

export interface FinancialContextType {
  transactions: Transaction[];
  accounts: Account[];
  goals: Goal[];
  isConnected: boolean;
  connectBank: () => void;
  disconnectBank: () => void;
  addTransaction: (t: Transaction) => void;
  updateGoal: (id: string, amount: number) => void;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  isThinking?: boolean;
}
