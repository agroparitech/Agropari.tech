import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  AlertCircle,
  Building,
  UserPlus,
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';
import { UserAccount } from '../types';

interface OfficialAccessGateProps {
  onAuthenticated: (user: UserAccount) => void;
  onRequestAccreditation: () => void;
  requiredRoleName?: string;
}

export const OfficialAccessGate: React.FC<OfficialAccessGateProps> = ({
  onAuthenticated,
  onRequestAccreditation,
  requiredRoleName = 'Official or Agronomist'
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setPendingNotice(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.pendingApproval) {
          setPendingNotice(data.message || 'Account Pending Administrator Approval');
        } else {
          setError(data.error || 'Authentication failed: Invalid credentials');
        }
        return;
      }

      if (data.success && data.user) {
        const role = data.user.role;
        if (role === 'official' || role === 'agronomist' || role === 'admin') {
          onAuthenticated(data.user);
        } else {
          setError('Access Restricted: This section requires an approved Official or Agronomist account.');
        }
      }
    } catch (err: any) {
      console.error('Official login error:', err);
      setError('Connection error. Could not reach authentication server.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillApprovedOfficial = () => {
    setEmail('official.nashik@gov.agri.in');
    setPassword('Official@123');
    setError(null);
    setPendingNotice(null);
  };

  const fillApprovedAgronomist = () => {
    setEmail('dr.patil@agri.univ.in');
    setPassword('Doctor@123');
    setError(null);
    setPendingNotice(null);
  };

  const fillPendingAccount = () => {
    setEmail('officer.pune@gov.agri.in');
    setPassword('Officer@123');
    setError(null);
    setPendingNotice(null);
  };

  return (
    <div className="max-w-lg mx-auto my-10 bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden animate-fadeIn">
      {/* Banner */}
      <div className="bg-emerald-950 text-white p-6 text-center border-b border-emerald-800">
        <div className="w-14 h-14 bg-emerald-800/70 text-emerald-200 border border-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
          <Lock className="w-8 h-8 text-amber-300" />
        </div>
        <h2 className="text-xl font-black tracking-tight text-white">
          Official & Agronomist Access Lock
        </h2>
        <p className="text-xs text-emerald-300 mt-1 max-w-sm mx-auto">
          Login required to access Department disease surveillance dossiers, chemical dispatch authorizations, and clinical expert queues
        </p>
      </div>

      {/* Body */}
      <div className="p-6 space-y-5">
        {/* Pending Notice Banner (When account has not been approved by admin) */}
        {pendingNotice ? (
          <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-xs text-amber-950 space-y-2 animate-fadeIn">
            <div className="font-extrabold flex items-center gap-2 text-amber-900 text-sm">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 animate-pulse" />
              <span>Awaiting Administrator Email Approval</span>
            </div>
            <p className="text-stone-700 leading-relaxed text-[11px]">{pendingNotice}</p>
            <div className="pt-2 border-t border-amber-200 text-[11px] text-stone-600 flex items-center justify-between">
              <span>
                Required Approver: <strong className="text-stone-900 font-mono">devp3987@gmail.com</strong>
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Departmental Security Policy</span>
            </div>
            <p className="text-stone-600 text-[11px] leading-relaxed">
              When an Official or Agronomist logs in with their password, their access is validated against the verified email registry approved by the Administrator (<code className="font-mono font-bold text-stone-800">devp3987@gmail.com</code>).
            </p>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-stone-800 block mb-1">
              Official / Agronomist Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="email"
                id="official-login-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. official.nashik@gov.agri.in"
                required
                className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden text-xs"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-stone-800 block">Login Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="password"
                id="official-login-password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            id="official-login-submit-btn"
            disabled={isLoading}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 text-xs sm:text-sm"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                <span>Verifying Official Access...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4 text-amber-300" />
                <span>Unlock Official Dashboard & Queue</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Fill Buttons */}
        <div className="pt-2 border-t border-stone-200">
          <span className="text-[11px] font-bold text-stone-500 block mb-2">
            One-Click Test Accounts:
          </span>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <button
              type="button"
              onClick={fillApprovedOfficial}
              className="p-2 text-left bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-stone-700 transition"
            >
              <strong className="block text-emerald-800">🏛️ Approved Official</strong>
              <span className="text-stone-400 truncate block">official.nashik@...</span>
            </button>

            <button
              type="button"
              onClick={fillApprovedAgronomist}
              className="p-2 text-left bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-stone-700 transition"
            >
              <strong className="block text-emerald-800">🔬 Approved Agronomist</strong>
              <span className="text-stone-400 truncate block">dr.patil@...</span>
            </button>

            <button
              type="button"
              onClick={fillPendingAccount}
              className="p-2 text-left bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-amber-900 transition"
            >
              <strong className="block text-amber-800">⏳ Test Pending Approval</strong>
              <span className="text-stone-400 truncate block">officer.pune@...</span>
            </button>
          </div>
        </div>

        {/* Apply for Accreditation link */}
        <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs">
          <span className="text-stone-500">Not yet registered as an official?</span>
          <button
            type="button"
            onClick={onRequestAccreditation}
            className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline flex items-center gap-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Apply for Accreditation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
