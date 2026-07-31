import React, { useState, useEffect } from 'react';
import { Booking, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { ReceiptModal } from '../components/ReceiptModal';
import {
  Calendar,
  Clock,
  MapPin,
  QrCode,
  XCircle,
  User as UserIcon,
  Phone,
  Mail,
  CheckCircle2,
  Trophy,
  AlertCircle
} from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedReceipt, setSelectedReceipt] = useState<Booking | null>(null);

  // Profile Form state
  const [fullname, setFullname] = useState(user?.fullname || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [activeTab, setActiveTab] = useState<'bookings' | 'profile'>('bookings');

  useEffect(() => {
    fetchUserBookings();
  }, [user]);

  const fetchUserBookings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings?user_id=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Refund will be processed.')) return;

    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PUT'
      });

      if (res.ok) {
        alert('Booking cancelled successfully.');
        fetchUserBookings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ fullname, phone });
    alert('Profile details updated successfully!');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
            alt={user?.fullname}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-emerald-500/30"
            referrerPolicy="no-referrer"
          />
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Customer Portal</span>
            <h1 className="text-2xl font-black text-white">{user?.fullname}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email} • {user?.phone}</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="bg-slate-800 p-1 rounded-2xl flex items-center gap-1 border border-slate-700">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'bookings' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            My Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'profile' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            Edit Profile
          </button>
        </div>
      </div>

      {activeTab === 'bookings' ? (
        <div className="space-y-4">
          <h2 className="text-xl font-black text-slate-900">Your Booking Passes & History</h2>

          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs font-bold">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No bookings found</h3>
              <p className="text-xs text-slate-500">Book your first sports turf ground slot today!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookings.map(bk => (
                <div
                  key={bk.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between gap-4 relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        REF: {bk.id}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          bk.booking_status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {bk.booking_status}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <img
                        src={bk.turf_image || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=200&q=80'}
                        alt=""
                        className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{bk.turf_name}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-emerald-600" /> {bk.turf_location}
                        </p>
                        <p className="text-xs text-slate-700 font-semibold mt-1">
                          📅 {bk.booking_date} • ⏰ {bk.start_time} - {bk.end_time}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Amount</span>
                      <span className="text-base font-extrabold text-slate-900">₹{bk.total_amount}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedReceipt(bk)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" /> View Receipt
                      </button>

                      {bk.booking_status === 'confirmed' && (
                        <button
                          onClick={() => handleCancelBooking(bk.id)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs px-3 py-2 rounded-xl transition-all cursor-pointer"
                          title="Cancel Booking"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm max-w-xl mx-auto space-y-6">
          <h2 className="text-xl font-black text-slate-900">Personal Details</h2>

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Full Name</label>
              <input
                type="text"
                value={fullname}
                onChange={e => setFullname(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-900 font-medium outline-none focus:border-emerald-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-900 font-medium outline-none focus:border-emerald-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-slate-100 border border-slate-200 rounded-2xl p-3 text-slate-500 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-2xl transition-all shadow-md cursor-pointer"
            >
              Save Profile Changes
            </button>
          </form>
        </div>
      )}

      {selectedReceipt && (
        <ReceiptModal
          booking={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
};
