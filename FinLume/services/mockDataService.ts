import { Transaction, Account, Goal, Category, TransactionType } from '../types';

const generateId = () => Math.random().toString(36).substring(2, 9);

const MERCHANTS = {
  [Category.FOOD]: ['Uber Eats', 'Starbucks', 'Local Diner', 'Whole Foods', 'Trader Joes'],
  [Category.TRANSPORT]: ['Uber', 'Lyft', 'Shell Gas', 'Metro Ticket'],
  [Category.HOUSING]: ['Landlord LLC', 'City Utilities', 'Internet Provider'],
  [Category.SHOPPING]: ['Amazon', 'Target', 'Nike Store', 'Apple Store'],
  [Category.ENTERTAINMENT]: ['Netflix', 'Spotify', 'Cinema City', 'Steam Games'],
  [Category.HEALTH]: ['CVS Pharmacy', 'City Hospital Co-pay'],
  [Category.DEBT]: ['Visa Credit Card Payment', 'Student Loan Servicer'],
};

const INCOME_SOURCES = ['Upwork Client', 'Fiverr Gig', 'Local Consulting', 'Part-time Shift'];

export const generateMockData = (): { transactions: Transaction[]; accounts: Account[]; goals: Goal[] } => {
  const accounts: Account[] = [
    { id: 'acc_1', name: 'Chase Checking', type: 'checking', balance: 2450.50, lastSynced: new Date().toISOString() },
    { id: 'acc_2', name: 'Capital One Savings', type: 'savings', balance: 5000.00, lastSynced: new Date().toISOString() },
  ];

  const goals: Goal[] = [
    { id: 'g_1', name: 'Emergency Fund', targetAmount: 10000, currentAmount: 5000, deadline: '2024-12-31', category: 'Savings' },
    { id: 'g_2', name: 'New Laptop', targetAmount: 2000, currentAmount: 450, deadline: '2024-08-15', category: 'Tech' },
  ];

  const transactions: Transaction[] = [];
  const now = new Date();

  // Generate 3 months of data
  for (let i = 0; i < 90; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Random Income (Irregular)
    if (Math.random() > 0.85) {
      const amount = Math.floor(Math.random() * 800) + 150;
      transactions.push({
        id: generateId(),
        date: dateStr,
        amount,
        description: INCOME_SOURCES[Math.floor(Math.random() * INCOME_SOURCES.length)],
        category: Category.FREELANCE,
        type: TransactionType.INCOME,
      });
    }

    // Daily Expenses
    const dailyTxCount = Math.floor(Math.random() * 4); 
    for (let j = 0; j < dailyTxCount; j++) {
      const categories = Object.keys(MERCHANTS) as Category[];
      const cat = categories[Math.floor(Math.random() * categories.length)];
      const merchs = MERCHANTS[cat];
      const merchant = merchs[Math.floor(Math.random() * merchs.length)];
      
      let amount = 0;
      if (cat === Category.HOUSING) amount = 50 + Math.random() * 100; // Utilities
      else if (cat === Category.FOOD) amount = 10 + Math.random() * 50;
      else amount = 10 + Math.random() * 100;

      transactions.push({
        id: generateId(),
        date: dateStr,
        amount: parseFloat(amount.toFixed(2)),
        description: merchant,
        category: cat,
        type: TransactionType.EXPENSE,
        merchant
      });
    }

    // Monthly Rent (approx 1st of month)
    if (date.getDate() === 1) {
       transactions.push({
        id: generateId(),
        date: dateStr,
        amount: 1200,
        description: 'Monthly Rent',
        category: Category.HOUSING,
        type: TransactionType.EXPENSE,
      });
    }
  }

  return {
    transactions: transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    accounts,
    goals
  };
};