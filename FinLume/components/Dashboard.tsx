import React, { useMemo, useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import type { Transaction, Goal } from '../types';
import { TransactionType } from '../types';
import { generateInsights } from '../services/geminiService';

interface DashboardProps {
  transactions: Transaction[];
  goals: Goal[];
  income: number;
  expenses: number;
  onAddTransaction: (type: TransactionType) => void;
  onNavigateToCoach: () => void;
}

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

const Dashboard: React.FC<DashboardProps> = ({ transactions, goals, income, expenses, onAddTransaction, onNavigateToCoach }) => {
  const [insights, setInsights] = useState<{title: string, description: string, impact: string}[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    if (transactions.length > 0 && insights.length === 0) {
        setLoadingInsights(true);
        generateInsights(transactions).then(res => {
            setInsights(res);
            setLoadingInsights(false);
        });
    }
  }, [transactions]);

  const savings = income - expenses;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;

  // Process data for Monthly Chart
  const monthlyData = useMemo(() => {
    const data: Record<string, { month: string, income: number, expense: number }> = {};
    
    // Sort transactions by date asc first
    const sorted = [...transactions].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sorted.forEach(t => {
      const month = new Date(t.date).toLocaleString('default', { month: 'short' });
      if (!data[month]) data[month] = { month, income: 0, expense: 0 };
      if (t.type === TransactionType.INCOME) data[month].income += t.amount;
      else data[month].expense += t.amount;
    });

    return Object.values(data);
  }, [transactions]);

  // Process data for Category Pie Chart (Current Month)
  const categoryData = useMemo(() => {
    const currentMonthPrefix = new Date().toISOString().slice(0, 7); // YYYY-MM
    const data: Record<string, number> = {};
    
    transactions
      .filter(t => t.type === TransactionType.EXPENSE && t.date.startsWith(currentMonthPrefix))
      .forEach(t => {
        data[t.category] = (data[t.category] || 0) + t.amount;
      });

    return Object.entries(data)
        .map(([name, value]) => ({ name, value }))
        .sort((a,b) => b.value - a.value)
        .slice(0, 5); // Top 5
  }, [transactions]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Financial Overview</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative group">
          <div className="flex justify-between items-start">
             <div>
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Total Income</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">${income.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</p>
             </div>
             <button 
                onClick={() => onAddTransaction(TransactionType.INCOME)}
                className="w-8 h-8 rounded-full bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center transition-colors shadow-sm"
                title="Add Income"
             >
                <i className="fa-solid fa-plus text-sm"></i>
             </button>
          </div>
          <div className="mt-2 text-xs text-green-600 bg-green-50 inline-block px-2 py-1 rounded font-medium">
            Avg ${(income/3).toFixed(0)} / mo
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <div className="flex justify-between items-start">
              <div>
                 <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Total Spent</p>
                 <p className="text-2xl font-bold text-slate-800 mt-1">${expenses.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</p>
              </div>
              <button 
                onClick={() => onAddTransaction(TransactionType.EXPENSE)}
                className="w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors shadow-sm"
                title="Add Expense"
             >
                <i className="fa-solid fa-plus text-sm"></i>
             </button>
           </div>
          <div className="mt-2 text-xs text-red-600 bg-red-50 inline-block px-2 py-1 rounded font-medium">
             Avg ${(expenses/3).toFixed(0)} / mo
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Net Savings</p>
          <p className={`text-2xl font-bold mt-1 ${savings >= 0 ? 'text-accent-600' : 'text-danger-600'}`}>
            {savings >= 0 ? '+' : ''}${savings.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
          </p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-accent-500 h-1.5 rounded-full" style={{ width: `${Math.max(0, Math.min(100, savingsRate))}%` }}></div>
          </div>
        </div>

         <div 
          onClick={onNavigateToCoach}
          className="bg-brand-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02]"
         >
          <div className="absolute right-[-20px] top-[-20px] text-9xl text-white opacity-10">
             <i className="fa-solid fa-robot"></i>
          </div>
          <p className="text-sm font-medium uppercase tracking-wide opacity-80">FinLume Coach</p>
          <p className="text-xl font-bold mt-2">"You saved 12% more than last month!"</p>
          <p className="text-xs mt-4 opacity-80">Click to chat &rarr;</p>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="grid grid-cols-1 gap-4">
        <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
            <i className="fa-solid fa-wand-magic-sparkles text-brand-500"></i>
            AI Insights
        </h3>
        {loadingInsights ? (
             <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded"></div>
                </div>
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {insights.map((insight, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border-l-4 border-brand-500 shadow-sm">
                        <div className="flex justify-between items-start">
                            <h4 className="font-bold text-slate-800">{insight.title}</h4>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                                insight.impact === 'high' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                            }`}>{insight.impact} Impact</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-2">{insight.description}</p>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Goals Progress Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Goals Progress</h3>
        <div className="h-64">
           {goals.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={goals} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={100} />
                <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                />
                <Legend />
                <Bar dataKey="currentAmount" name="Current Saved" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                <Bar dataKey="targetAmount" name="Target Amount" fill="#cbd5e1" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
           ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-400">
                   <i className="fa-solid fa-bullseye text-3xl mb-2 opacity-50"></i>
                   <p>No goals set yet</p>
               </div>
           )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Income vs Expenses</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Spending (This Month)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{fontSize: '11px', paddingTop: '10px'}}/>
              </PieChart>
            </ResponsiveContainer>
             {categoryData.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm mt-8">
                    No expenses this month
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;