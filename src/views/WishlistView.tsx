import React, { useState, useEffect } from 'react';
import { Turf } from '../types';
import { useWishlist } from '../context/WishlistContext';
import { TurfCard } from '../components/TurfCard';
import { Heart, Compass } from 'lucide-react';

interface WishlistViewProps {
  onSelectTurf: (turf: Turf) => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({ onSelectTurf }) => {
  const { wishlistIds } = useWishlist();
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchWishlistedTurfs();
  }, [wishlistIds]);

  const fetchWishlistedTurfs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/turfs');
      if (res.ok) {
        const data = await res.json();
        const filtered = (data.turfs || []).filter((t: Turf) => wishlistIds.includes(t.id));
        setTurfs(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <Heart className="w-5 h-5 fill-rose-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Saved Turf Grounds</h1>
          <p className="text-xs text-slate-500">Quick access to your favorite sports venues</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs font-bold">Loading saved grounds...</div>
      ) : turfs.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
          <Compass className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">Your wishlist is empty</h3>
          <p className="text-xs text-slate-500">Heart any turf ground while browsing to save it here for fast booking.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {turfs.map(turf => (
            <TurfCard key={turf.id} turf={turf} onSelect={onSelectTurf} />
          ))}
        </div>
      )}
    </div>
  );
};
