import React, { useState } from 'react';

interface BankConnectProps {
  onConnect: () => void;
}

const BankConnect: React.FC<BankConnectProps> = ({ onConnect }) => {
  const [loading, setLoading] = useState(false);

  const handleConnect = () => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      onConnect();
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center max-w-2xl mx-auto">
      <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <i className="fa-solid fa-building-columns text-4xl text-slate-500"></i>
      </div>
      <h2 className="text-3xl font-bold text-slate-800 mb-4">Connect Your Accounts</h2>
      <p className="text-slate-600 mb-8 leading-relaxed">
        FinLume needs read-only access to your transactions to analyze your irregular income streams and provide coaching.
        We use bank-grade security and never store your login credentials.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-8">
         <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center gap-3">
             <i className="fa-solid fa-shield-halved text-brand-500 text-xl"></i>
             <div className="text-left">
                 <p className="font-bold text-sm">Secure & Encrypted</p>
                 <p className="text-xs text-slate-500">256-bit encryption</p>
             </div>
         </div>
         <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center gap-3">
             <i className="fa-solid fa-eye text-brand-500 text-xl"></i>
             <div className="text-left">
                 <p className="font-bold text-sm">Read-Only Access</p>
                 <p className="text-xs text-slate-500">We cannot move money</p>
             </div>
         </div>
      </div>

      <button
        onClick={handleConnect}
        disabled={loading}
        className="group relative flex items-center justify-center py-4 px-8 border border-transparent text-lg font-medium rounded-full text-white bg-brand-600 hover:bg-brand-700 md:w-auto w-full shadow-lg transition-all hover:-translate-y-1"
      >
        {loading ? (
          <>
            <i className="fa-solid fa-circle-notch fa-spin mr-3"></i> Connecting...
          </>
        ) : (
          <>
            <i className="fa-solid fa-link mr-3"></i> Securely Connect Bank
          </>
        )}
      </button>
      <p className="mt-4 text-xs text-slate-400">Powered by SecureBankAPI (Simulated)</p>
    </div>
  );
};

export default BankConnect;