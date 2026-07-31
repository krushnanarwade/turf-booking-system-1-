import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useWishlist } from '../context/WishlistContext';
import {
  Trophy,
  Bell,
  Heart,
  User as UserIcon,
  Search,
  MapPin,
  LogOut,
  Calendar,
  LayoutDashboard,
  ShieldCheck,
  PlusCircle,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: any) => void;
  onOpenAuth: () => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  selectedCity,
  onCityChange
}) => {
  const { user, role, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const { wishlistIds } = useWishlist();

  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const cities = ['All', 'Mumbai', 'Bangalore', 'Delhi', 'Pune', 'Hyderabad'];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 block leading-none">
                Turf<span className="text-emerald-600">Hub</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mt-0.5">
                Sports Booking
              </span>
            </div>
          </button>

          {/* City Selector (Desktop) */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-100/80 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium transition-colors">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <select
              value={selectedCity}
              onChange={e => onCityChange(e.target.value)}
              className="bg-transparent border-none outline-none cursor-pointer font-semibold text-slate-800"
            >
              {cities.map(c => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Cities' : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center Nav Items */}
        <nav className="hidden lg:flex items-center gap-1 font-medium text-sm text-slate-600">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3 py-2 rounded-lg transition-colors ${
              currentView === 'home' ? 'text-emerald-600 bg-emerald-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Explore Turfs
          </button>

          {role === 'customer' && (
            <>
              <button
                onClick={() => onNavigate('wishlist')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  currentView === 'wishlist' ? 'text-emerald-600 bg-emerald-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Saved Turfs
                {wishlistIds.length > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {wishlistIds.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => onNavigate('my-bookings')}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  currentView === 'my-bookings' ? 'text-emerald-600 bg-emerald-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                My Bookings
              </button>
            </>
          )}

          {role === 'owner' && (
            <button
              onClick={() => onNavigate('owner-dashboard')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                currentView === 'owner-dashboard' ? 'text-emerald-600 bg-emerald-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-600" /> Owner Dashboard
            </button>
          )}

          {role === 'admin' && (
            <button
              onClick={() => onNavigate('admin-dashboard')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                currentView === 'admin-dashboard' ? 'text-emerald-600 bg-emerald-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-purple-600" /> Admin Control
            </button>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifDrawer(!showNotifDrawer);
                if (!showNotifDrawer) markAllAsRead();
              }}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Notification Drawer Popover */}
            {showNotifDrawer && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-4 divide-y divide-slate-100">
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                  </div>
                  <button
                    onClick={() => setShowNotifDrawer(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="py-2 max-h-80 overflow-y-auto space-y-2.5">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No notifications yet.</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`p-3 rounded-xl border text-xs transition-colors ${
                          n.is_read ? 'bg-slate-50 border-slate-100 text-slate-600' : 'bg-emerald-50/60 border-emerald-200/80 text-slate-900'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="font-semibold text-slate-900">{n.title}</span>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Auth Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                  alt={user.fullname}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500/30"
                  referrerPolicy="no-referrer"
                />
                <span className="text-xs font-semibold text-slate-800 max-w-[100px] truncate hidden sm:inline">
                  {user.fullname.split(' ')[0]}
                </span>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 p-2 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900">{user.fullname}</p>
                    <p className="text-slate-400 text-[11px] truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold uppercase text-[9px]">
                      Role: {role}
                    </span>
                  </div>

                  <div className="py-1 space-y-0.5">
                    {role === 'customer' && (
                      <button
                        onClick={() => {
                          onNavigate('my-bookings');
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center gap-2"
                      >
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" /> My Bookings
                      </button>
                    )}

                    {role === 'owner' && (
                      <button
                        onClick={() => {
                          onNavigate('owner-dashboard');
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center gap-2"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" /> Manage My Turfs
                      </button>
                    )}

                    {role === 'admin' && (
                      <button
                        onClick={() => {
                          onNavigate('admin-dashboard');
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center gap-2"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> Admin Console
                      </button>
                    )}
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 font-medium flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              Sign In / Register
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
