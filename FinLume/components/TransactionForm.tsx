
import React, { useState, useEffect } from 'react';
import type { Transaction } from '../types';
import { TransactionType, Category } from '../types';

interface TransactionFormProps {
  initialType?: TransactionType;
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  onCancel: () => void;
}

const INCOME_CATEGORIES = [
  Category.FREELANCE,
  Category.SALARY,
  Category.INVESTMENT,
  Category.UNCATEGORIZED
];

const EXPENSE_CATEGORIES = [
  Category.FOOD,
  Category.TRANSPORT,
  Category.HOUSING,
  Category.SHOPPING,
  Category.ENTERTAINMENT,
  Category.HEALTH,
  Category.SAVINGS,
  Category.DEBT,
  Category.UNCATEGORIZED
];

const QUICK_FILLS = [
  { label: 'Coffee', category: Category.FOOD, icon: 'fa-mug-hot' },
  { label: 'Lunch', category: Category.FOOD, icon: 'fa-burger' },
  { label: 'Groceries', category: Category.FOOD, icon: 'fa-basket-shopping' },
  { label: 'Gas', category: Category.TRANSPORT, icon: 'fa-gas-pump' },
  { label: 'Uber', category: Category.TRANSPORT, icon: 'fa-car' },
];

const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, onCancel, initialType = TransactionType.EXPENSE }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(initialType);
  const [category, setCategory] = useState<Category>(initialType === TransactionType.INCOME ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);

  // Reset category when type changes (if changed manually via tabs)
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === TransactionType.INCOME) {
      setCategory(INCOME_CATEGORIES[0]);
    } else {
      setCategory(EXPENSE_CATEGORIES[0]);
    }
  };

  const handleQuickFill = (item: typeof QUICK_FILLS[0]) => {
    setType(TransactionType.EXPENSE);
    setCategory(item.category);
    setDescription(item.label);
    setAmount(''); // Reset amount so user enters it
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!description || isNaN(val) || val <= 0) return;

    onSubmit({
      date,
      description,
      amount: val,
      type,
      category,
    });
  };

  const isIncome = type === TransactionType.INCOME;
  const currentCategories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  
  // Theme colors based on transaction type
  const themeClass = isIncome ? 'text-green-600' : 'text-red-600';
  const ringClass = isIncome ? 'focus:ring-green-500' : 'focus:ring-red-500';
  const buttonBgClass = isIncome ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20' : 'bg-red-600 hover:bg-red-700 shadow-red-500/20';
  const iconBgClass = isIncome ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600';

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl border border-slate-100 animate-fade-in w-full max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h3 className={`text-2xl font-bold flex items-center gap-3 ${isIncome ? 'text-green-700' : 'text-slate-800'}`}>
            <div className={`p-2.5 rounded-xl ${iconBgClass}`}>
                <i className={`fa-solid ${isIncome ? 'fa-hand-holding-dollar' : 'fa-receipt'}`}></i>
            </div>
            {isIncome ? 'Add Income' : 'Add Expense'}
        </h3>
        <button 
            type="button" 
            onClick={onCancel} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
        >
            <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Type Selection - Full Width */}
        <div className="md:col-span-2 bg-slate-50 p-1.5 rounded-xl flex">
             <button
               type="button"
               onClick={() => handleTypeChange(TransactionType.EXPENSE)}
               className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                 type === TransactionType.EXPENSE 
                   ? 'bg-white text-red-600 shadow-sm ring-1 ring-slate-200' 
                   : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
               }`}
             >
               <i className="fa-solid fa-circle-arrow-down"></i> Expense
             </button>
             <button
               type="button"
               onClick={() => handleTypeChange(TransactionType.INCOME)}
               className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                 type === TransactionType.INCOME 
                   ? 'bg-white text-green-600 shadow-sm ring-1 ring-slate-200' 
                   : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
               }`}
             >
               <i className="fa-solid fa-circle-arrow-up"></i> Income
             </button>
        </div>

        {/* Quick Fills - Only for Expense */}
        {!isIncome && (
             <div className="md:col-span-2 animate-fade-in">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Quick Add</p>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {QUICK_FILLS.map((item) => (
                        <button
                            key={item.label}
                            type="button"
                            onClick={() => handleQuickFill(item)}
                            className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-lg text-xs font-bold transition-all whitespace-nowrap"
                        >
                            <i className={`fa-solid ${item.icon}`}></i>
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* Date */}
        <div>
           <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Date</label>
           <input 
             type="date" 
             value={date} 
             onChange={e => setDate(e.target.value)} 
             className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:bg-white outline-none transition-all font-medium text-slate-700 ${ringClass}`} 
             required 
           />
        </div>
        
        {/* Dedicated Amount Input Fields */}
        <div>
           {isIncome ? (
             <>
                <label className="block text-xs font-bold text-green-600 uppercase tracking-wide mb-2">Income Amount</label>
                <div className="relative">
                    <span className="absolute left-4 top-3.5 text-green-500 font-bold">$</span>
                    <input 
                    type="number" 
                    step="0.01" 
                    min="0.01"
                    value={amount} 
                    onChange={e => setAmount(e.target.value)} 
                    className="w-full p-3 pl-8 bg-green-50 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all font-bold placeholder:font-normal text-green-700 placeholder:text-green-300" 
                    placeholder="0.00" 
                    required 
                    />
                </div>
             </>
           ) : (
             <>
                <label className="block text-xs font-bold text-red-600 uppercase tracking-wide mb-2">Expense Amount</label>
                <div className="relative">
                    <span className="absolute left-4 top-3.5 text-red-500 font-bold">$</span>
                    <input 
                    type="number" 
                    step="0.01" 
                    min="0.01"
                    value={amount} 
                    onChange={e => setAmount(e.target.value)} 
                    className="w-full p-3 pl-8 bg-red-50 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition-all font-bold placeholder:font-normal text-red-700 placeholder:text-red-300" 
                    placeholder="0.00" 
                    required 
                    />
                </div>
             </>
           )}
        </div>

        {/* Category */}
        <div>
           <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Category</label>
           <div className="relative">
             <select 
               value={category} 
               onChange={e => setCategory(e.target.value as Category)} 
               className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:bg-white outline-none appearance-none transition-all font-medium text-slate-700 ${ringClass}`}
             >
               {currentCategories.map(cat => (
                 <option key={cat} value={cat}>{cat}</option>
               ))}
             </select>
             <i className="fa-solid fa-chevron-down absolute right-4 top-4 text-slate-400 pointer-events-none text-xs"></i>
           </div>
        </div>

        {/* Description */}
        <div>
           <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Description</label>
           <input 
             type="text" 
             value={description} 
             onChange={e => setDescription(e.target.value)} 
             className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:bg-white outline-none transition-all font-medium text-slate-700 ${ringClass}`} 
             placeholder={isIncome ? "e.g. Upwork Project" : "e.g. Grocery Store"} 
             required 
           />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-6 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-bold transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className={`px-8 py-3 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center gap-2 ${buttonBgClass}`}
        >
          <i className="fa-solid fa-check"></i> {isIncome ? 'Save Income' : 'Save Expense'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
