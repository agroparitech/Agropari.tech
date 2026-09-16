import React, { useState } from 'react';
import { ShieldAlert, Lock, Mail, KeyRound, AlertCircle, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import { UserAccount } from '../types';

interface AdminLoginGateProps {
  onAdminAuthenticated: (user: UserAccount) => void;
  onCancel?: () => void;
}

export const AdminLoginGate: React.FC<AdminLoginGateProps> = ({
  onAdminAuthenticated,
  onCancel
}) => {
  const [email, setEmail] = useState('devp3987@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Authentication failed: Invalid administrator credentials');
        return;
      }

      if (data.success && data.user) {
        if (data.user.role === 'admin' || data.user.email.toLowerCase() === 'devp3987@gmail.com') {
          onAdminAuthenticated(data.user);
        } else {
          setError('Access Denied: Only Administrator (devp3987@gmail.com) can access Admin Settings.');
        }
      }
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError('Connection error. Could not reach authentication server.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickCredentials = () => {
    setEmail('devp3987@gmail.com');
    setPassword('211008gaints');
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-stone-900 text-white p-6 text-center border-b border-stone-800">
        <div className="w-14 h-14 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold tracking-tight text-stone-100">
          Administrator Security Gate
        </h2>
        <p className="text-xs text-stone-400 mt-1">
          Restricted access for system configuration & official email approvals
        </p>
      </div>

      {/* Form Content */}
      <div className="p-6 space-y-5">
        <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl text-xs text-amber-950 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-900">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Administrator Credentials Protected</span>
          </div>
          <p className="text-stone-600 text-[11px] leading-relaxed">
            Admin Settings are locked. Enter the authorized Administrator Gmail ID (<code className="font-mono font-bold text-stone-900">devp3987@gmail.com</code>) and security password to manage official approvals and system rules.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-stone-800 block mb-1">
              Administrator Gmail ID
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="email"
                id="admin-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="devp3987@gmail.com"
                required
                className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono text-stone-900 focus:bg-white focus:border-amber-600 focus:outline-hidden text-xs"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-stone-800 block">Security Password</label>
              <button
                type="button"
                onClick={fillQuickCredentials}
                className="text-[11px] text-amber-700 hover:text-amber-800 font-bold hover:underline"
              >
                Auto-fill Admin Pass
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="password"
                id="admin-password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:bg-white focus:border-amber-600 focus:outline-hidden text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            id="admin-unlock-btn"
            disabled={isLoading}
            className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-black rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 text-xs sm:text-sm"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                <span>Verifying Administrator Access...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Unlock Admin Settings</span>
              </>
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2 text-stone-500 hover:text-stone-800 font-semibold text-xs text-center transition"
            >
              Return to Farmer View
            </button>
          )}
        </form>

        {/* Quick helper tag */}
        <div className="pt-2 text-center text-[11px] text-stone-400">
          Registered ID: <span className="font-mono text-stone-600">devp3987@gmail.com</span>
        </div>
      </div>
    </div>
  );
};
