import React, { useState, useEffect } from 'react';
import { Turf, SportType } from '../types';
import { TurfCard } from '../components/TurfCard';
import { Search, MapPin, Filter, Trophy, Sparkles, Flame, Star, Clock, Compass } from 'lucide-react';

interface CustomerHomeProps {
  onSelectTurf: (turf: Turf) => void;
  selectedCity: string;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({ onSelectTurf, selectedCity }) => {
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('All');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(3000);
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);

  const sportsList: string[] = ['All', 'Cricket', 'Football', 'Box Cricket', 'Badminton', 'Tennis', 'Volleyball'];

  useEffect(() => {
    fetchTurfs();
  }, [selectedCity, selectedSport, searchQuery, maxPriceFilter, minRatingFilter]);

  const fetchTurfs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCity && selectedCity !== 'All') params.append('city', selectedCity);
      if (selectedSport && selectedSport !== 'All') params.append('sport', selectedSport);
      if (searchQuery) params.append('search', searchQuery);
      if (maxPriceFilter) params.append('maxPrice', maxPriceFilter.toString());
      if (minRatingFilter > 0) params.append('rating', minRatingFilter.toString());

      const res = await fetch(`/api/turfs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTurfs(data.turfs || []);
      }
    } catch (err) {
      console.error('Failed to fetch turfs:', err);
    } finally {
      setLoading(false);
    }
  };

  const featuredTurfs = turfs.filter(t => t.is_featured);
  const popularTurfs = [...turfs].sort((a, b) => b.rating - a.rating);

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Search Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white p-8 sm:p-12 border border-slate-800 shadow-2xl">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Instant Sports Slot Reservation
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Book Premier Turf Grounds in <span className="text-emerald-400 font-serif italic">Seconds</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Discover FIFA-approved football arenas, floodlit box cricket nets, BWF badminton courts, and quartz volleyball sand tracks with live slot confirmation.
          </p>

          {/* Search & Filter Bar */}
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-xl flex flex-col sm:flex-row items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-xl flex-1 w-full text-white">
              <Search className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search by turf name, area, or landmark..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-400 w-full font-medium"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="px-3 py-2 bg-white/10 rounded-xl flex items-center gap-1.5 text-xs text-white">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold">{selectedCity === 'All' ? 'All Cities' : selectedCity}</span>
              </div>
            </div>
          </div>

          {/* Sport Filter Chips */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Sports:</span>
            {sportsList.map(sport => (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedSport === sport
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {sport}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Filter Toolbar & Summary */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-700 text-xs font-bold">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Showing <strong className="text-slate-900">{turfs.length}</strong> available turfs</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-2">
            <span>Max Price:</span>
            <input
              type="range"
              min={500}
              max={3000}
              step={100}
              value={maxPriceFilter}
              onChange={e => setMaxPriceFilter(Number(e.target.value))}
              className="accent-emerald-600 cursor-pointer"
            />
            <strong className="text-slate-900">₹{maxPriceFilter}</strong>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Min Rating:</span>
            <select
              value={minRatingFilter}
              onChange={e => setMinRatingFilter(Number(e.target.value))}
              className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-800"
            >
              <option value={0}>Any Rating</option>
              <option value={4}>4.0+ Stars</option>
              <option value={4.5}>4.5+ Stars</option>
            </select>
          </div>
        </div>
      </div>

      {/* Featured Turfs Carousel / Section */}
      {featuredTurfs.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-extrabold text-slate-900">Featured Sports Arenas</h2>
            </div>
            <span className="text-xs text-slate-500 font-semibold">Handpicked Top Ratings</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTurfs.map(turf => (
              <TurfCard key={turf.id} turf={turf} onSelect={onSelectTurf} />
            ))}
          </div>
        </section>
      )}

      {/* Main Turfs Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-extrabold text-slate-900">
              {selectedSport === 'All' ? 'All Turf Venues' : `${selectedSport} Turfs`}
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-semibold">Verified Grounds</span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold">Scanning available turf slots...</p>
          </div>
        ) : turfs.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <Compass className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No turfs match your criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your price range, sport filters, or city selection to view more grounds.
            </p>
            <button
              onClick={() => {
                setSelectedSport('All');
                setSearchQuery('');
                setMaxPriceFilter(3000);
                setMinRatingFilter(0);
              }}
              className="mt-2 bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {turfs.map(turf => (
              <TurfCard key={turf.id} turf={turf} onSelect={onSelectTurf} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
