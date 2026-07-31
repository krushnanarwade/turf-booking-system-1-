import React, { useState, useEffect } from 'react';
import { Turf, Slot, Review } from '../types';
import { SlotPicker } from '../components/SlotPicker';
import { PaymentModal } from '../components/PaymentModal';
import { ReceiptModal } from '../components/ReceiptModal';
import { MapModal } from '../components/MapModal';
import { ReviewModal } from '../components/ReviewModal';
import { useWishlist } from '../context/WishlistContext';
import {
  Star,
  MapPin,
  Heart,
  Share2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Compass,
  MessageSquare,
  PlusCircle,
  ArrowLeft,
  DollarSign
} from 'lucide-react';

interface TurfDetailViewProps {
  turfId: string;
  onBack: () => void;
}

export const TurfDetailView: React.FC<TurfDetailViewProps> = ({ turfId, onBack }) => {
  const [turf, setTurf] = useState<Turf | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Selected Image
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Booking Flow States
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [completedBooking, setCompletedBooking] = useState<any>(null);

  // Modal States
  const [showMapModal, setShowMapModal] = useState<boolean>(false);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);

  const { isWishlisted, toggleWishlist } = useWishlist();

  useEffect(() => {
    fetchTurfDetails();
  }, [turfId]);

  const fetchTurfDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/turfs/${turfId}`);
      if (res.ok) {
        const data = await res.json();
        setTurf(data.turf);
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Failed to load turf:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !turf) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-500">Loading turf ground specifications...</p>
      </div>
    );
  }

  const wishlisted = isWishlisted(turf.id);

  return (
    <div className="space-y-8 pb-16">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-bold text-xs bg-white px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 shadow-sm transition-all cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Search Results
      </button>

      {/* Main Grid: Gallery & Slot Booking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Gallery & Venue Info */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Photo Viewer */}
          <div className="space-y-3">
            <div className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-lg">
              <img
                src={turf.images[activeImageIndex] || turf.images[0]}
                alt={turf.name}
                className="w-full h-full object-cover transition-all duration-300"
                referrerPolicy="no-referrer"
              />

              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={() => toggleWishlist(turf.id)}
                  className={`p-2.5 rounded-full backdrop-blur-md transition-all ${
                    wishlisted
                      ? 'bg-rose-500 text-white shadow-lg'
                      : 'bg-slate-900/50 text-white hover:bg-slate-900/80'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${wishlisted ? 'fill-white' : ''}`} />
                </button>

                <button
                  onClick={() => setShowMapModal(true)}
                  className="bg-slate-900/50 hover:bg-slate-900/80 backdrop-blur-md text-white p-2.5 rounded-full"
                  title="View Map"
                >
                  <Compass className="w-4 h-4" />
                </button>
              </div>

              <div className="absolute bottom-4 left-4 flex gap-1.5">
                {turf.sport_types.map(s => (
                  <span
                    key={s}
                    className="bg-emerald-950/80 backdrop-blur-md text-emerald-300 text-xs font-extrabold px-3 py-1 rounded-xl border border-emerald-500/30"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Image Thumbnails */}
            {turf.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {turf.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                      activeImageIndex === idx ? 'border-emerald-600 scale-105 shadow-md' : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Header Info */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {turf.location}, {turf.city}
              </span>

              <div className="flex items-center gap-1.5 text-amber-500 font-extrabold text-sm bg-amber-50 px-3 py-1 rounded-lg">
                <Star className="w-4 h-4 fill-amber-500" />
                <span>{turf.rating}</span>
                <span className="text-slate-400 font-normal text-xs">({turf.reviews_count} verified reviews)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">{turf.name}</h1>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{turf.description}</p>

            {/* Pricing Summary Badge */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Standard Rate</span>
                <span className="text-xl font-extrabold text-slate-900">₹{turf.price_per_hour} <span className="text-xs text-slate-500 font-normal">/ hour</span></span>
              </div>
              {turf.weekend_price_per_hour && (
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-amber-600 block">Weekend Surge</span>
                  <span className="text-sm font-bold text-amber-700">₹{turf.weekend_price_per_hour} / hour</span>
                </div>
              )}
            </div>
          </div>

          {/* Amenities & Equipment */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm">Ground Amenities & Facilities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {turf.amenities.map(a => (
                <div key={a} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs font-semibold text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Player Reviews</h3>
                <p className="text-xs text-slate-500">Real feedback from sports teams</p>
              </div>

              <button
                onClick={() => setShowReviewModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> Add Review
              </button>
            </div>

            <div className="space-y-3">
              {reviews.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No reviews yet. Be the first to review this turf!</p>
              ) : (
                reviews.map(rev => (
                  <div key={rev.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={rev.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                          alt={rev.user_name}
                          className="w-6 h-6 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="font-bold text-xs text-slate-900">{rev.user_name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500" /> {rev.rating}
                      </div>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Slot Picker & Checkout Trigger */}
        <div className="lg:col-span-5 space-y-6">
          <SlotPicker
            turf={turf}
            selectedSlotId={selectedSlot?.id}
            onSlotSelect={(slot, date) => {
              setSelectedSlot(slot);
              setSelectedDate(date);
            }}
          />

          {/* Booking Summary Box */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-emerald-400">Reservation Summary</h3>

            {selectedSlot ? (
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Selected Date</span>
                  <strong className="text-white">{selectedDate}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Slot Time</span>
                  <strong className="text-white">{selectedSlot.start_time} - {selectedSlot.end_time}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Price Rate</span>
                  <strong className="text-white">₹{selectedSlot.price} / hr</strong>
                </div>
                <div className="pt-3 border-t border-slate-800 flex justify-between text-sm">
                  <span className="font-bold text-white">Estimated Payable</span>
                  <strong className="text-emerald-400 text-base">₹{selectedSlot.price}</strong>
                </div>

                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 text-xs cursor-pointer"
                >
                  Proceed to Payment & Confirm Slot
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center border border-dashed border-slate-800 rounded-2xl">
                Please select an available date and time slot above to proceed with booking.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPaymentModal && selectedSlot && (
        <PaymentModal
          turf={turf}
          slot={selectedSlot}
          date={selectedDate}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={data => {
            setShowPaymentModal(false);
            setCompletedBooking(data.booking);
            fetchTurfDetails();
          }}
        />
      )}

      {completedBooking && (
        <ReceiptModal
          booking={completedBooking}
          onClose={() => setCompletedBooking(null)}
        />
      )}

      {showMapModal && (
        <MapModal
          turf={turf}
          onClose={() => setShowMapModal(false)}
        />
      )}

      {showReviewModal && (
        <ReviewModal
          turf={turf}
          onClose={() => setShowReviewModal(false)}
          onReviewSubmitted={fetchTurfDetails}
        />
      )}
    </div>
  );
};
