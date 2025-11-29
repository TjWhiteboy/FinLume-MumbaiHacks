import React, { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isConnected: boolean;
  onAddTransaction: () => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, isConnected, onAddTransaction, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
    { id: 'transactions', label: 'Transactions', icon: 'fa-list' },
    { id: 'coach', label: 'FinLume Coach', icon: 'fa-robot' },
    { id: 'goals', label: 'Goals & Plans', icon: 'fa-bullseye' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white shadow-xl">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight text-brand-500">
            <i className="fa-solid fa-wallet mr-2"></i>FinLume
          </h1>
          <p className="text-xs text-slate-400 mt-1">Smart Money for Gig Workers</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {isConnected && (
            <button
                onClick={onAddTransaction}
                className="w-full flex items-center gap-3 px-4 py-3 mb-6 bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-lg shadow-brand-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] font-bold"
            >
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <i className="fa-solid fa-plus"></i>
                </div>
                <span>Add Transaction</span>
            </button>
          )}

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if(isConnected || item.id === 'dashboard') setActiveTab(item.id)
              }}
              disabled={!isConnected && item.id !== 'dashboard'}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-brand-600 text-white shadow-md' 
                  : (!isConnected && item.id !== 'dashboard') ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <i className={`fa-solid ${item.icon} w-6`}></i>
              <span className="font-medium">{item.label}</span>
              {!isConnected && item.id !== 'dashboard' && <i className="fa-solid fa-lock ml-auto text-xs opacity-50"></i>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold shadow-md">
              AF
            </div>
            <div>
              <p className="text-sm font-medium text-white">AFO</p>
              <p className="text-xs text-slate-400">Freelancer</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-slate-800 hover:bg-red-900/50 text-slate-300 hover:text-red-200 transition-colors text-sm"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 text-white z-20 flex items-center justify-between p-4 shadow-lg">
        <div className="font-bold text-lg text-brand-500"><i className="fa-solid fa-wallet mr-2"></i>FinLume</div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          <i className="fa-solid fa-bars text-xl"></i>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/95 z-30 md:hidden flex flex-col p-6 animate-fade-in">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white">Menu</h2>
            <button onClick={() => setIsMobileMenuOpen(false)}><i className="fa-solid fa-xmark text-2xl text-white"></i></button>
          </div>
          <nav className="space-y-4 flex-1">
             {isConnected && (
                <button
                    onClick={() => { onAddTransaction(); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center p-4 rounded-xl text-lg bg-brand-600 text-white font-bold shadow-lg mb-6"
                >
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center mr-3">
                        <i className="fa-solid fa-plus"></i>
                    </div>
                    Add Transaction
                </button>
            )}
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                disabled={!isConnected && item.id !== 'dashboard'}
                className={`w-full flex items-center p-4 rounded-xl text-lg ${
                   activeTab === item.id ? 'bg-brand-600 text-white' : 'text-slate-300'
                }`}
              >
                <i className={`fa-solid ${item.icon} w-8`}></i>
                {item.label}
              </button>
            ))}
          </nav>
          
          <div className="pt-6 border-t border-slate-700">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold">
                  AF
                </div>
                <div>
                  <p className="text-base font-medium text-white">AFO</p>
                  <p className="text-sm text-slate-400">Freelancer</p>
                </div>
              </div>
              <button 
                onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                className="w-full py-4 bg-slate-800 text-red-300 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-right-from-bracket"></i>
                Sign Out
              </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 scrollbar-hide">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;