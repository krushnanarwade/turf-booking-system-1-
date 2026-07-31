import React from 'react';
import { Turf } from '../types';
import { useWishlist } from '../context/WishlistContext';
import { Star, MapPin, Heart, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface TurfCardProps {
  turf: Turf;
  onSelect: (turf: Turf) => void;
}

export const TurfCard: React.FC<TurfCardProps> = ({ turf, onSelect }) => {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(turf.id);

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 hover:border-emerald-500/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={turf.images[0] || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80'}
          alt={turf.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />

        {/* Featured Badge */}
        {turf.is_featured && (
          <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
            <Zap className="w-3 h-3 fill-slate-950" /> Featured
          </div>
        )}

        {/* Wishlist Heart Toggle */}
        <button
          onClick={e => {
            e.stopPropagation();
            toggleWishlist(turf.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
            wishlisted
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
              : 'bg-slate-900/40 text-white hover:bg-slate-900/70'
          }`}
          title={wishlisted ? 'Remove from saved' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-white' : ''}`} />
        </button>

        {/* Sports Badges Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
          {turf.sport_types.map(sport => (
            <span
              key={sport}
              className="bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-lg"
            >
              {sport}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {turf.area}, {turf.city}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-md">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <span>{turf.rating}</span>
              <span className="text-slate-400 font-normal">({turf.reviews_count})</span>
            </div>
          </div>

          <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-emerald-700 transition-colors line-clamp-1 mb-1">
            {turf.name}
          </h3>

          <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-4">
            {turf.description}
          </p>
        </div>

        {/* Pricing & Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Starts at</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-slate-900">₹{turf.price_per_hour}</span>
              <span className="text-slate-500 text-xs">/ hr</span>
            </div>
          </div>

          <button
            onClick={() => onSelect(turf)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 group-hover:gap-2 cursor-pointer"
          >
            Book Slot <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
