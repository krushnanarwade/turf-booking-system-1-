import React, { useState, useEffect } from 'react';
import { User, AdminStats, Payment } from '../types';
import {
  ShieldCheck,
  Users,
  Store,
  Trophy,
  DollarSign,
  TrendingUp,
  Download,
  Trash2,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  PieChart,
  BarChart3
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'transactions'>('analytics');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, txRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/transactions')
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) {
        const uData = await usersRes.json();
        setUsers(uData.users || []);
      }
      if (txRes.ok) {
        const tData = await txRes.json();
        setTransactions(tData.transactions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setUsers(prev => prev.map(u => (u.id === userId ? { ...u, status: newStatus as any } : u)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Booking ID', 'Amount', 'Status', 'Gateway', 'Time'];
    const rows = transactions.map(t => [
      t.id,
      t.booking_id,
      t.amount,
      t.payment_status,
      t.payment_gateway,
      t.transaction_time
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `turfhub_financial_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-xs font-bold">Loading admin portal analytics...</div>;
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-purple-950 text-white p-8 rounded-3xl border border-purple-900 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Platform Governance Console
          </span>
          <h1 className="text-2xl font-black text-white">System Administrator</h1>
          <p className="text-xs text-purple-200 mt-0.5">Platform-wide statistics, user moderation, transaction logs, and revenue reports.</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs transition-all cursor-pointer shadow-lg shadow-purple-900/30"
        >
          <FileSpreadsheet className="w-4 h-4" /> Export CSV Report
        </button>
      </div>

      {/* KPI Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Revenue</span>
            <span className="text-2xl font-black text-slate-900">₹{stats.totalRevenue}</span>
            <span className="text-[10px] text-purple-600 font-bold block mt-1">GTV Processed</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Active Bookings</span>
            <span className="text-2xl font-black text-slate-900">{stats.activeBookings}</span>
            <span className="text-[10px] text-emerald-600 font-bold block mt-1">Confirmed games</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Customers</span>
            <span className="text-2xl font-black text-slate-900">{stats.totalUsers}</span>
            <span className="text-[10px] text-slate-500 font-bold block mt-1">Registered players</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Turf Owners</span>
            <span className="text-2xl font-black text-slate-900">{stats.totalOwners}</span>
            <span className="text-[10px] text-slate-500 font-bold block mt-1">Verified partners</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Listed Turfs</span>
            <span className="text-2xl font-black text-slate-900">{stats.totalTurfs}</span>
            <span className="text-[10px] text-emerald-600 font-bold block mt-1">Active arenas</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-6 text-sm font-bold text-slate-500">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'analytics' ? 'border-purple-600 text-purple-700' : 'border-transparent hover:text-slate-900'
          }`}
        >
          Analytics Dashboard
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'users' ? 'border-purple-600 text-purple-700' : 'border-transparent hover:text-slate-900'
          }`}
        >
          Manage Users & Owners ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'transactions' ? 'border-purple-600 text-purple-700' : 'border-transparent hover:text-slate-900'
          }`}
        >
          Transaction Logs ({transactions.length})
        </button>
      </div>

      {activeTab === 'analytics' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Revenue Growth Visual Chart */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-600" /> Monthly Platform Revenue (₹)
            </h3>
            <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2">
              {stats.revenueChart.map(item => (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div
                    className="w-full bg-gradient-to-t from-purple-800 to-purple-500 rounded-t-xl hover:brightness-110 transition-all"
                    style={{ height: `${(item.amount / 150000) * 100}%` }}
                  />
                  <span className="text-[10px] font-bold text-slate-500">{item.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sport Distribution */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-600" /> Sport Category Demand Share
            </h3>
            <div className="space-y-3 pt-2">
              {stats.sportDistribution.map(sport => (
                <div key={sport.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>{sport.name}</span>
                    <span>{sport.value}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${sport.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold flex items-center gap-2">
                    <img src={u.avatarUrl} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                    <span>{u.fullname}</span>
                  </td>
                  <td className="p-4 uppercase font-bold text-[10px] text-purple-700">{u.role}</td>
                  <td className="p-4">{u.email}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleUserStatus(u.id, u.status)}
                      className="px-3 py-1 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      {u.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-4">Payment ID</th>
                <th className="p-4">Booking Ref</th>
                <th className="p-4">Gateway</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {transactions.map(t => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono font-bold text-slate-900">{t.payment_id}</td>
                  <td className="p-4 font-mono">{t.booking_id}</td>
                  <td className="p-4 uppercase font-bold text-[10px] text-blue-600">{t.payment_gateway}</td>
                  <td className="p-4 font-bold text-emerald-600">₹{t.amount}</td>
                  <td className="p-4 uppercase font-bold text-[10px] text-emerald-700">{t.payment_status}</td>
                  <td className="p-4 text-slate-400">{new Date(t.transaction_time).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
