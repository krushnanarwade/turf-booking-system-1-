import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, ShieldCheck, Store, UserCheck, Sparkles } from 'lucide-react';

export const RoleBanner: React.FC = () => {
  const { user, switchRole, role } = useAuth();

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-white text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-2 shadow-inner">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-semibold text-emerald-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> Demo Switcher:
        </span>
        <span className="text-slate-300">
          Currently viewing as <strong className="text-white capitalize underline decoration-emerald-500">{role}</strong> ({user?.fullname})
        </span>
      </div>

      <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60">
        <button
          onClick={() => switchRole('customer')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
            role === 'customer'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
          }`}
        >
          <User className="w-3.5 h-3.5" /> Customer
        </button>

        <button
          onClick={() => switchRole('owner')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
            role === 'owner'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
          }`}
        >
          <Store className="w-3.5 h-3.5" /> Turf Owner
        </button>

        <button
          onClick={() => switchRole('admin')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
            role === 'admin'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" /> Admin
        </button>
      </div>
    </div>
  );
};
