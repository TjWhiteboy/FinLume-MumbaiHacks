import React, { useState } from 'react';
import { User, loginUser, loginGuest } from '../services/authService';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await loginUser(email, password);
      onLoginSuccess(user);
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAccess = async () => {
    setIsGuestLoading(true);
    try {
      const user = await loginGuest();
      onLoginSuccess(user);
    } catch (err) {
      setError('Guest login failed.');
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-500 p-4">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-[440px] p-8 md:p-10 animate-fade-in-up transition-all border border-white/20 z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 mb-4 shadow-sm transform transition-transform hover:rotate-6">
             <i className="fa-solid fa-wallet text-3xl"></i>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">FinLume</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Smart Financial Coaching for Everyone</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2 animate-shake">
            <i className="fa-solid fa-circle-exclamation"></i>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 ml-1">Email Address</label>
            <div className="relative group">
              <i className="fa-solid fa-envelope absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-500 transition-colors"></i>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white focus:border-transparent outline-none transition-all text-slate-800 font-medium placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Password</label>
              <a href="#" className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline">Forgot?</a>
            </div>
            <div className="relative group">
              <i className="fa-solid fa-lock absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-500 transition-colors"></i>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white focus:border-transparent outline-none transition-all text-slate-800 font-medium placeholder:text-slate-400"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading || isGuestLoading}
            className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white rounded-xl font-bold shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-slate-400 font-medium">Or continue with</span>
          </div>
        </div>

        {/* Guest Access */}
        <button 
          onClick={handleGuestAccess}
          disabled={isLoading || isGuestLoading}
          className="w-full py-3.5 px-4 bg-white border-2 border-slate-200 hover:border-brand-500 hover:text-brand-600 text-slate-600 rounded-xl font-bold transition-all hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
        >
          {isGuestLoading ? (
            <i className="fa-solid fa-circle-notch fa-spin text-brand-500"></i>
          ) : (
            <>
              <i className="fa-solid fa-user-secret text-slate-400 group-hover:text-brand-500 transition-colors"></i>
              Guest Access
            </>
          )}
        </button>
        
        {/* Footer Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600">
            Don't have an account? <a href="#" className="font-bold text-brand-600 hover:text-brand-700 hover:underline">Sign up</a>
          </p>
        </div>
      </div>
      
      {/* Footer Info Outside Card */}
      <div className="mt-6 text-center space-y-3 z-10 animate-fade-in delay-200">
         <p className="text-center text-xs text-white/70 py-1 px-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 inline-block">
             <i className="fa-solid fa-circle-info mr-1"></i> Guest Mode loads sample financial data for testing.
         </p>
         
         <div className="flex justify-center gap-4">
            <div className="text-xs text-indigo-100 bg-indigo-900/40 p-3 rounded-xl border border-indigo-500/30 backdrop-blur-sm">
                <span className="opacity-70 mr-2">Demo Email:</span>
                <span className="font-mono bg-indigo-900/60 px-2 py-0.5 rounded text-white border border-indigo-500/30">demo@finlume.ai</span>
            </div>
            <div className="text-xs text-indigo-100 bg-indigo-900/40 p-3 rounded-xl border border-indigo-500/30 backdrop-blur-sm">
                <span className="opacity-70 mr-2">Password:</span>
                <span className="font-mono bg-indigo-900/60 px-2 py-0.5 rounded text-white border border-indigo-500/30">FinLume@123</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Login;