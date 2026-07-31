import React, { useState, useEffect } from 'react';
import { Turf, Booking, Coupon, SportType } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Store,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Edit2,
  Trash2,
  TrendingUp,
  Tag,
  Clock,
  MapPin,
  Lock,
  Layers,
  X
} from 'lucide-react';

export const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const ownerId = user?.id || 'owner-1';

  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Tabs
  const [activeTab, setActiveTab] = useState<'turfs' | 'bookings' | 'offers'>('turfs');

  // Add/Edit Turf Modal State
  const [showTurfModal, setShowTurfModal] = useState<boolean>(false);
  const [editingTurf, setEditingTurf] = useState<Turf | null>(null);

  // Turf Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [area, setArea] = useState('Bandra West');
  const [pricePerHour, setPricePerHour] = useState(1200);
  const [weekendPrice, setWeekendPrice] = useState(1500);
  const [sportsSelected, setSportsSelected] = useState<SportType[]>(['Box Cricket', 'Football']);
  const [imageUrl, setImageUrl] = useState('');

  // Add Coupon Form State
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(20);

  useEffect(() => {
    fetchOwnerData();
  }, [ownerId]);

  const fetchOwnerData = async () => {
    setLoading(true);
    try {
      const [turfsRes, bookingsRes, couponsRes] = await Promise.all([
        fetch(`/api/turfs?owner_id=${ownerId}`),
        fetch(`/api/bookings?owner_id=${ownerId}`),
        fetch('/api/coupons')
      ]);

      if (turfsRes.ok) {
        const data = await turfsRes.json();
        setTurfs(data.turfs || []);
      }

      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        setBookings(data.bookings || []);
      }

      if (couponsRes.ok) {
        const data = await couponsRes.json();
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddTurf = () => {
    setEditingTurf(null);
    setName('');
    setDescription('');
    setLocation('');
    setCity('Mumbai');
    setArea('Bandra West');
    setPricePerHour(1200);
    setWeekendPrice(1500);
    setSportsSelected(['Box Cricket', 'Football']);
    setImageUrl('https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80');
    setShowTurfModal(true);
  };

  const handleOpenEditTurf = (turf: Turf) => {
    setEditingTurf(turf);
    setName(turf.name);
    setDescription(turf.description);
    setLocation(turf.location);
    setCity(turf.city);
    setArea(turf.area);
    setPricePerHour(turf.price_per_hour);
    setWeekendPrice(turf.weekend_price_per_hour || turf.price_per_hour);
    setSportsSelected(turf.sport_types);
    setImageUrl(turf.images[0] || '');
    setShowTurfModal(true);
  };

  const handleSaveTurf = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      owner_id: ownerId,
      owner_name: user?.fullname || 'Apex Sports Infra',
      name,
      description,
      location,
      city,
      area,
      latitude: 19.0596,
      longitude: 72.8295,
      price_per_hour: pricePerHour,
      weekend_price_per_hour: weekendPrice,
      sport_types: sportsSelected,
      images: [imageUrl || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80'],
      amenities: ['Floodlights', 'Parking', 'Changing Room', 'Locker', 'Equipment Rental'],
      status: 'active',
      opening_time: '06:00',
      closing_time: '23:00'
    };

    try {
      const url = editingTurf ? `/api/turfs/${editingTurf.id}` : '/api/turfs';
      const method = editingTurf ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(`Turf ground ${editingTurf ? 'updated' : 'added'} successfully!`);
        setShowTurfModal(false);
        fetchOwnerData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTurf = async (id: string) => {
    if (!window.confirm('Delete this turf ground?')) return;
    try {
      const res = await fetch(`/api/turfs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchOwnerData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // KPIs
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((acc, b) => acc + (b.payment_status === 'paid' ? b.total_amount : 0), 0);
  const todayBookingsCount = bookings.filter(b => b.booking_date === new Date().toISOString().split('T')[0]).length;

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Venue Owner Control Console</span>
          <h1 className="text-2xl font-black text-white">{user?.fullname}</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage turf inventory, slots, pricing surge, and player reservations.</p>
        </div>

        <button
          onClick={handleOpenAddTurf}
          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all text-xs cursor-pointer shadow-lg shadow-emerald-500/20"
        >
          <PlusCircle className="w-4 h-4" /> Add New Turf
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Revenue</span>
            <span className="text-2xl font-black text-slate-900">₹{totalRevenue}</span>
            <span className="text-[10px] text-emerald-600 font-bold block mt-1">+18% this month</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Bookings</span>
            <span className="text-2xl font-black text-slate-900">{totalBookings}</span>
            <span className="text-[10px] text-slate-500 font-bold block mt-1">Confirmed reservations</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Today's Games</span>
            <span className="text-2xl font-black text-slate-900">{todayBookingsCount}</span>
            <span className="text-[10px] text-indigo-600 font-bold block mt-1">Live slot activity</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Active Grounds</span>
            <span className="text-2xl font-black text-slate-900">{turfs.length}</span>
            <span className="text-[10px] text-emerald-600 font-bold block mt-1">Operational venues</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs Toolbar */}
      <div className="border-b border-slate-200 flex gap-6 text-sm font-bold text-slate-500">
        <button
          onClick={() => setActiveTab('turfs')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'turfs' ? 'border-emerald-600 text-emerald-700' : 'border-transparent hover:text-slate-900'
          }`}
        >
          My Turfs ({turfs.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'bookings' ? 'border-emerald-600 text-emerald-700' : 'border-transparent hover:text-slate-900'
          }`}
        >
          Customer Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('offers')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'offers' ? 'border-emerald-600 text-emerald-700' : 'border-transparent hover:text-slate-900'
          }`}
        >
          Offers & Coupons ({coupons.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'turfs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {turfs.map(turf => (
            <div key={turf.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
              <div>
                <img src={turf.images[0]} alt="" className="w-full h-40 object-cover" referrerPolicy="no-referrer" />
                <div className="p-5 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-900 text-base">{turf.name}</h3>
                    <span className="text-emerald-700 bg-emerald-50 text-xs font-bold px-2.5 py-0.5 rounded-md">
                      ₹{turf.price_per_hour}/hr
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {turf.location}, {turf.city}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {turf.sport_types.map(s => (
                      <span key={s} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleOpenEditTurf(turf)}
                  className="text-xs font-bold text-slate-700 hover:text-emerald-700 flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Ground
                </button>
                <button
                  onClick={() => handleDeleteTurf(turf.id)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-4">Booking ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Turf</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {bookings.map(b => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono font-bold">{b.id}</td>
                  <td className="p-4 font-bold">{b.user_name || 'Customer'}</td>
                  <td className="p-4">{b.turf_name}</td>
                  <td className="p-4">{b.booking_date} ({b.start_time}-{b.end_time})</td>
                  <td className="p-4 font-bold text-emerald-600">₹{b.total_amount}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                      {b.booking_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'offers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coupons.map(c => (
            <div key={c.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-base font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl">
                  {c.code}
                </span>
                <span className="text-xs font-bold text-slate-800">{c.discount_percentage}% OFF</span>
              </div>
              <p className="text-xs text-slate-600">{c.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Turf Modal */}
      {showTurfModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingTurf ? 'Edit Turf Ground' : 'Add New Turf Ground'}
              </h3>
              <button onClick={() => setShowTurfModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTurf} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Turf Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl p-2.5 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Area / Locality</label>
                  <input
                    type="text"
                    required
                    value={area}
                    onChange={e => setArea(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Address / Location</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Price / Hour (₹)</label>
                  <input
                    type="number"
                    required
                    value={pricePerHour}
                    onChange={e => setPricePerHour(Number(e.target.value))}
                    className="w-full bg-slate-50 border rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Weekend Price (₹)</label>
                  <input
                    type="number"
                    value={weekendPrice}
                    onChange={e => setWeekendPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl p-2.5"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-2xl cursor-pointer"
              >
                Save Turf Ground
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
