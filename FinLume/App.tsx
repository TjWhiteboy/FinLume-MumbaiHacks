import React, { useState } from 'react';
import Layout from './components/Layout';
import BankConnect from './components/BankConnect';
import Dashboard from './components/Dashboard';
import CoachChat from './components/CoachChat';
import Goals from './components/Goals';
import TransactionForm from './components/TransactionForm';
import Login from './components/Login';
import type { Transaction, Account, Goal } from './types';
import { TransactionType } from './types';
import { generateMockData } from './services/mockDataService';
import type { User } from './services/authService';

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);

  // App View State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isConnected, setIsConnected] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionModalType, setTransactionModalType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  
  // Data State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  // Computed State
  const totalIncome = transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, t) => acc + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, t) => acc + t.amount, 0);

  // Auth Handlers
  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    // In a real app, we'd fetch data here
    const data = generateMockData();
    setTransactions(data.transactions);
    setAccounts(data.accounts);
    setGoals(data.goals);
  };

  const handleLogout = () => {
    setUser(null);
    setIsConnected(false);
    setActiveTab('dashboard');
  };

  // Connection Handlers
  const handleBankConnect = () => {
    setIsConnected(true);
    setActiveTab('dashboard');
  };

  // Data Handlers
  const handleAddTransactionClick = (type: TransactionType = TransactionType.EXPENSE) => {
    setTransactionModalType(type);
    setIsTransactionModalOpen(true);
  };

  const handleTransactionSubmit = (t: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...t,
      id: Math.random().toString(36).substring(2, 9),
    };
    setTransactions(prev => [newTransaction, ...prev]);
    setIsTransactionModalOpen(false);
  };

  const handleUpdateGoal = (id: string, amount: number) => {
    setGoals(prev => prev.map(g => {
      if(g.id === id) {
        return { ...g, currentAmount: g.currentAmount + amount };
      }
      return g;
    }));
  };

  const handleAddGoal = (goal: Omit<Goal, 'id' | 'currentAmount'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Math.random().toString(36).substring(2, 9),
      currentAmount: 0
    };
    setGoals(prev => [...prev, newGoal]);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const confirmDeleteTransaction = () => {
    if (transactionToDelete) {
      setTransactions(prev => prev.filter(t => t.id !== transactionToDelete));
      setTransactionToDelete(null);
    }
  };

  // Render Logic
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderContent = () => {
    if (!isConnected) {
      return <BankConnect onConnect={handleBankConnect} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            transactions={transactions} 
            goals={goals}
            income={totalIncome}
            expenses={totalExpenses}
            onAddTransaction={handleAddTransactionClick}
            onNavigateToCoach={() => setActiveTab('coach')}
          />
        );
      case 'coach':
        return <CoachChat transactions={transactions} accounts={accounts} goals={goals} />;
      case 'goals':
        return (
          <Goals 
            goals={goals} 
            accounts={accounts} 
            onUpdateGoal={handleUpdateGoal} 
            onAddGoal={handleAddGoal} 
            onDeleteGoal={handleDeleteGoal}
          />
        );
      case 'transactions':
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">Recent Transactions</h2>
                    <button 
                        onClick={() => handleAddTransactionClick()}
                        className="text-sm font-bold text-brand-600 hover:text-brand-700"
                    >
                        + Add New
                    </button>
                </div>
                <div className="divide-y divide-slate-100">
                    {transactions.map(t => (
                        <div key={t.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === TransactionType.INCOME ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    <i className={`fa-solid ${t.type === TransactionType.INCOME ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">{t.description}</p>
                                    <p className="text-xs text-slate-500">{t.date} • {t.category}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`font-bold ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-slate-800'}`}>
                                    {t.type === TransactionType.INCOME ? '+' : '-'}${t.amount.toFixed(2)}
                                </span>
                                <button
                                    onClick={() => setTransactionToDelete(t.id)}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all rounded-lg hover:bg-red-50"
                                    title="Delete Transaction"
                                >
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                    {transactions.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                            No transactions yet. Add one to get started!
                        </div>
                    )}
                </div>
            </div>
        );
      default:
        return <div>Section Under Construction</div>;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      isConnected={isConnected}
      onAddTransaction={() => handleAddTransactionClick()}
      onLogout={handleLogout}
    >
      {renderContent()}

      {/* Transaction Modal Overlay */}
      {isTransactionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
           <TransactionForm 
              initialType={transactionModalType}
              onSubmit={handleTransactionSubmit} 
              onCancel={() => setIsTransactionModalOpen(false)} 
           />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {transactionToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-scale-in border border-slate-100">
                <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                         <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Delete Transaction?</h3>
                    <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                        Are you sure you want to delete this transaction? This action cannot be undone.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setTransactionToDelete(null)}
                        className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={confirmDeleteTransaction}
                        className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/30"
                    >
                        Delete
                    </button>
                </div>
           </div>
        </div>
      )}
    </Layout>
  );
};

export default App;