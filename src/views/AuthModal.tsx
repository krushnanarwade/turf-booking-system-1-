import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { X, Trophy, Lock, Mail, User as UserIcon, Phone, ShieldCheck, Sparkles } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  // Form
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('customer');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let success = false;
    if (isRegister) {
      success = await register(fullname, email, phone, role, password);
    } else {
      success = await login(email, role, password);
    }

    if (success) {
      onClose();
    }
  };

  const handleQuickFill = (type: UserRole) => {
    if (type === 'customer') {
      setEmail('john@example.com');
      setPassword('password123');
      setRole('customer');
    } else if (type === 'owner') {
      setEmail('owner@turfhub.com');
      setPassword('password123');
      setRole('owner');
    } else {
      setEmail('admin@turfhub.com');
      setPassword('password123');
      setRole('admin');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <Trophy className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-black">{isRegister ? 'Create TurfHub Account' : 'Welcome Back'}</h3>
          </div>
          <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Quick Fill Demo Bar */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1.5">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Quick Demo Fill:
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill('customer')}
                className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg font-semibold text-slate-800"
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('owner')}
                className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg font-semibold text-slate-800"
              >
                Owner
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg font-semibold text-slate-800"
              >
                Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {isRegister && (
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullname}
                  onChange={e => setFullname(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl p-2.5 outline-none focus:border-emerald-600"
                />
              </div>
            )}

            <div>
              <label className="font-bold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50 border rounded-xl p-2.5 outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-50 border rounded-xl p-2.5 outline-none focus:border-emerald-600"
              />
            </div>

            {isRegister && (
              <>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl p-2.5 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Register As</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border rounded-xl p-2.5 font-bold"
                  >
                    <option value="customer">Player / Customer</option>
                    <option value="owner">Turf Venue Owner</option>
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-2xl transition-all shadow-md cursor-pointer mt-2"
            >
              {isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="text-center pt-2 border-t text-xs">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-emerald-700 font-bold hover:underline"
            >
              {isRegister ? 'Already have an account? Sign In' : 'New to TurfHub? Create an account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
