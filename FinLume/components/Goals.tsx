import React, { useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { Goal, Account } from '../types';

interface GoalsProps {
  goals: Goal[];
  accounts: Account[];
  onUpdateGoal: (id: string, amount: number) => void;
  onAddGoal: (goal: Omit<Goal, 'id' | 'currentAmount'>) => void;
  onDeleteGoal: (id: string) => void;
}

const Goals: React.FC<GoalsProps> = ({ goals, accounts, onUpdateGoal, onAddGoal, onDeleteGoal }) => {
  const [simSaving, setSimSaving] = useState(50); // Simulation value
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
  
  // New Goal Form State
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('Savings');

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  const handleAddNewGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if(!name || !targetAmount || !deadline) return;

    onAddGoal({
        name,
        targetAmount: parseFloat(targetAmount),
        deadline,
        category
    });
    
    setIsModalOpen(false);
    // Reset form
    setName('');
    setTargetAmount('');
    setDeadline('');
    setCategory('Savings');
  };

  // Helper to calculate time metrics
  const getGoalMetrics = (goal: Goal) => {
      const now = new Date();
      const targetDate = new Date(goal.deadline);
      const monthsDiff = (targetDate.getFullYear() - now.getFullYear()) * 12 + (targetDate.getMonth() - now.getMonth());
      const monthsLeft = Math.max(0, monthsDiff);
      
      const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
      const requiredMonthly = monthsLeft > 0 ? remainingAmount / monthsLeft : remainingAmount;

      // Mock Pace Calculation (Assuming goal started 3 months ago for demo)
      const mockHistoryMonths = 3; 
      const impliedMonthlyPace = goal.currentAmount / mockHistoryMonths;
      const projectedMonthsToFinish = impliedMonthlyPace > 0 ? remainingAmount / impliedMonthlyPace : Infinity;
      const projectedDate = new Date();
      projectedDate.setMonth(projectedDate.getMonth() + projectedMonthsToFinish);

      return { monthsLeft, requiredMonthly, projectedDate, impliedMonthlyPace };
  };

  // Helper to generate mock graph data
  const getGraphData = (goal: Goal) => {
      // Create a smooth curve ending at current amount
      return [
          { name: 'Start', value: 0 },
          { name: 'Month 1', value: goal.currentAmount * 0.2 },
          { name: 'Month 2', value: goal.currentAmount * 0.45 },
          { name: 'Month 3', value: goal.currentAmount * 0.75 },
          { name: 'Now', value: goal.currentAmount },
      ];
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Your Saving Goals</h2>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30 flex items-center gap-2"
        >
          <i className="fa-solid fa-plus"></i> New Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
          const { monthsLeft, requiredMonthly, projectedDate, impliedMonthlyPace } = getGoalMetrics(goal);
          const graphData = getGraphData(goal);

          return (
            <div key={goal.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-fade-in group relative flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{goal.name}</h3>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">{goal.category}</p>
                </div>
                <div className="flex items-center gap-2">
                     <button 
                        onClick={() => setGoalToDelete(goal.id)}
                        className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete Goal"
                     >
                        <i className="fa-solid fa-trash-can"></i>
                     </button>
                     <div className="bg-slate-100 p-2 rounded-lg">
                        <i className={`fa-solid ${goal.category === 'Savings' ? 'fa-piggy-bank' : 'fa-bullseye'} text-slate-500`}></i>
                     </div>
                </div>
              </div>
              
              <div className="flex justify-between items-end mb-2">
                 <span className="text-2xl font-bold text-slate-700">${goal.currentAmount.toLocaleString()}</span>
                 <span className="text-sm text-slate-500 mb-1">of ${goal.targetAmount.toLocaleString()}</span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden">
                <div 
                    className="bg-brand-500 h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-xs text-slate-500 mb-6">
                <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                <span className={progress >= 100 ? "text-green-500 font-bold" : ""}>
                    {progress >= 100 ? "Completed!" : `${(100-progress).toFixed(0)}% to go`}
                </span>
              </div>

              {/* Goal Insights Section */}
              <div className="mt-auto pt-4 border-t border-slate-50 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <i className="fa-solid fa-chart-line"></i> Analysis
                      </h4>
                      
                      <div>
                          <p className="text-xs text-slate-500">Required Monthly</p>
                          <p className={`font-bold text-sm ${requiredMonthly > impliedMonthlyPace ? 'text-orange-500' : 'text-green-600'}`}>
                              ${requiredMonthly.toLocaleString(undefined, {maximumFractionDigits: 0})}/mo
                              {requiredMonthly > impliedMonthlyPace && <i className="fa-solid fa-caret-up ml-1 text-xs"></i>}
                          </p>
                      </div>

                      <div>
                          <p className="text-xs text-slate-500">Projected Completion</p>
                          <p className="font-bold text-sm text-slate-700">
                              {impliedMonthlyPace > 0 
                                ? projectedDate.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
                                : 'Needs Contribution'
                              }
                          </p>
                      </div>
                  </div>

                  <div className="h-24 bg-slate-50 rounded-lg overflow-hidden relative border border-slate-100">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={graphData}>
                              <defs>
                                <linearGradient id={`gradient-${goal.id}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <Tooltip 
                                contentStyle={{ fontSize: '12px', padding: '4px', borderRadius: '4px' }}
                                formatter={(value: number) => [`$${value.toFixed(0)}`, 'Amount']}
                                labelStyle={{ display: 'none' }}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#0ea5e9" 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill={`url(#gradient-${goal.id})`} 
                              />
                          </AreaChart>
                      </ResponsiveContainer>
                      <div className="absolute bottom-1 right-2 text-[9px] text-slate-400 font-medium pointer-events-none">
                          Growth Trend
                      </div>
                  </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                  <button 
                    onClick={() => onUpdateGoal(goal.id, 50)}
                    disabled={progress >= 100}
                    className="flex-1 py-2 border border-brand-200 text-brand-600 rounded-lg text-sm hover:bg-brand-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                      + $50
                  </button>
                  <button 
                    onClick={() => onUpdateGoal(goal.id, 100)}
                    disabled={progress >= 100}
                    className="flex-1 py-2 border border-brand-200 text-brand-600 rounded-lg text-sm hover:bg-brand-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                      + $100
                  </button>
              </div>
            </div>
          );
        })}
        {goals.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <i className="fa-solid fa-bullseye text-4xl mb-4 text-slate-300"></i>
                <p>No goals set yet. Create one to start saving!</p>
            </div>
        )}
      </div>

      {/* What-If Simulation */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <i className="fa-solid fa-flask text-accent-400"></i>
                "What If" Simulator
            </h3>
            <p className="text-slate-300 text-sm mb-6 max-w-lg">
                Visualize how small changes in your daily habits can impact your emergency fund over time.
            </p>

            <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-full md:w-1/2 space-y-4">
                    <label className="block text-sm font-medium text-slate-300">
                        If I save an extra <span className="text-white font-bold text-lg">${simSaving}</span> per week...
                    </label>
                    <input 
                        type="range" 
                        min="10" 
                        max="500" 
                        step="10" 
                        value={simSaving} 
                        onChange={(e) => setSimSaving(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accent-500"
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>$10</span>
                        <span>$500</span>
                    </div>
                </div>

                <div className="w-full md:w-1/2 bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/10">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-slate-300 uppercase">In 6 Months</p>
                            <p className="text-2xl font-bold text-accent-400">+${(simSaving * 4 * 6).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-300 uppercase">In 1 Year</p>
                            <p className="text-2xl font-bold text-accent-400">+${(simSaving * 52).toLocaleString()}</p>
                        </div>
                    </div>
                    <p className="mt-4 text-xs text-slate-300 border-t border-white/10 pt-3">
                        That's enough to cover <span className="text-white font-bold">{(simSaving * 52 / 1200).toFixed(1)} months</span> of rent!
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* New Goal Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl max-w-md w-full animate-scale-in border border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-slate-800">Create New Goal</h3>
                      <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                          <i className="fa-solid fa-xmark text-lg"></i>
                      </button>
                  </div>
                  
                  <form onSubmit={handleAddNewGoal} className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Goal Name</label>
                          <input 
                              type="text" 
                              value={name} 
                              onChange={(e) => setName(e.target.value)}
                              placeholder="e.g. New Laptop"
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all font-medium text-slate-700"
                              required
                          />
                      </div>
                      
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Target Amount ($)</label>
                          <input 
                              type="number" 
                              value={targetAmount} 
                              onChange={(e) => setTargetAmount(e.target.value)}
                              placeholder="2000"
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all font-medium text-slate-700"
                              required
                              min="1"
                          />
                      </div>
                      
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Target Date</label>
                          <input 
                              type="date" 
                              value={deadline} 
                              onChange={(e) => setDeadline(e.target.value)}
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all font-medium text-slate-700"
                              required
                          />
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Category</label>
                          <select 
                              value={category} 
                              onChange={(e) => setCategory(e.target.value)}
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all font-medium text-slate-700"
                          >
                              <option value="Savings">Savings</option>
                              <option value="Tech">Tech</option>
                              <option value="Travel">Travel</option>
                              <option value="Vehicle">Vehicle</option>
                              <option value="Home">Home</option>
                              <option value="Education">Education</option>
                              <option value="Other">Other</option>
                          </select>
                      </div>

                      <div className="flex gap-3 mt-6 pt-2">
                          <button
                              type="button"
                              onClick={() => setIsModalOpen(false)}
                              className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                          >
                              Cancel
                          </button>
                          <button
                              type="submit"
                              className="flex-1 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/30"
                          >
                              Create Goal
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Delete Confirmation Modal */}
      {goalToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-scale-in border border-slate-100">
                <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                         <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Delete Goal?</h3>
                    <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                        Are you sure you want to delete this goal? All progress will be lost.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setGoalToDelete(null)}
                        className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            if (goalToDelete) onDeleteGoal(goalToDelete);
                            setGoalToDelete(null);
                        }}
                        className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/30"
                    >
                        Delete
                    </button>
                </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Goals;