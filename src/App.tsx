import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { WishlistProvider } from './context/WishlistContext';
import { RoleBanner } from './components/RoleBanner';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CustomerHome } from './views/CustomerHome';
import { TurfDetailView } from './views/TurfDetailView';
import { CustomerDashboard } from './views/CustomerDashboard';
import { WishlistView } from './views/WishlistView';
import { OwnerDashboard } from './views/OwnerDashboard';
import { AdminDashboard } from './views/AdminDashboard';
import { AuthModal } from './views/AuthModal';
import { Turf } from './types';
import { CheckCircle2, AlertCircle } from 'lucide-react';

function MainAppContent() {
  const { role } = useAuth();
  const { toast } = useNotifications();

  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedTurfId, setSelectedTurfId] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const handleSelectTurf = (turf: Turf) => {
    setSelectedTurfId(turf.id);
    setCurrentView('turf-detail');
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Demo Switcher Bar */}
      <RoleBanner />

      {/* Main App Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={() => setShowAuthModal(true)}
        selectedCity={selectedCity}
        onCityChange={city => setSelectedCity(city)}
      />

      {/* Toast Alert Popup */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <h4 className="font-extrabold text-xs text-white">{toast.title}</h4>
            <p className="text-[11px] text-slate-300 mt-0.5">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'home' && (
          <CustomerHome
            onSelectTurf={handleSelectTurf}
            selectedCity={selectedCity}
          />
        )}

        {currentView === 'turf-detail' && selectedTurfId && (
          <TurfDetailView
            turfId={selectedTurfId}
            onBack={() => setCurrentView('home')}
          />
        )}

        {currentView === 'my-bookings' && <CustomerDashboard />}

        {currentView === 'wishlist' && (
          <WishlistView onSelectTurf={handleSelectTurf} />
        )}

        {currentView === 'owner-dashboard' && <OwnerDashboard />}

        {currentView === 'admin-dashboard' && <AdminDashboard />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <WishlistProvider>
          <MainAppContent />
        </WishlistProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
