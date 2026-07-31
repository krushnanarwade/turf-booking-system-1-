import React, { createContext, useContext, useState, useEffect } from 'react';

interface WishlistContextType {
  wishlistIds: string[];
  toggleWishlist: (turfId: string) => void;
  isWishlisted: (turfId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('turf_app_wishlist');
    if (saved) {
      try {
        setWishlistIds(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Default sample saved turfs
      const defaults = ['turf-1', 'turf-2'];
      setWishlistIds(defaults);
      localStorage.setItem('turf_app_wishlist', JSON.stringify(defaults));
    }
  }, []);

  const toggleWishlist = (turfId: string) => {
    setWishlistIds(prev => {
      const exists = prev.includes(turfId);
      const updated = exists ? prev.filter(id => id !== turfId) : [...prev, turfId];
      localStorage.setItem('turf_app_wishlist', JSON.stringify(updated));
      return updated;
    });
  };

  const isWishlisted = (turfId: string) => wishlistIds.includes(turfId);

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
