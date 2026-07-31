import React, { useState } from 'react';
import { Turf, Slot } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { X, CreditCard, ShieldCheck, CheckCircle2, Ticket, Sparkles, Smartphone, Lock } from 'lucide-react';

interface PaymentModalProps {
  turf: Turf;
  slot: Slot;
  date: string;
  onClose: () => void;
  onSuccess: (bookingData: any) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  turf,
  slot,
  date,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [gateway, setGateway] = useState<'razorpay' | 'stripe'>('razorpay');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [upiId, setUpiId] = useState('user@upi');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');

  const basePrice = slot.price;
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const taxableAmount = Math.max(0, basePrice - discountAmount);
  const taxAmount = Math.round(taxableAmount * 0.18);
  const totalAmount = taxableAmount + taxAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, amount: basePrice })
      });

      if (res.ok) {
        const data = await res.json();
        setAppliedCoupon({ code: data.coupon.code, discount: data.discount });
        showToast('Coupon Applied! 🎉', `Saved ₹${data.discount} on your booking.`);
      } else {
        const err = await res.json();
        setCouponError(err.error || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (e) {
      setCouponError('Failed to validate coupon');
    }
  };

  const handlePayNow = async () => {
    if (!user) {
      alert('Please sign in to complete booking.');
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          user_name: user.fullname,
          user_email: user.email,
          user_phone: user.phone,
          turf_id: turf.id,
          slot_id: slot.id,
          booking_date: date,
          coupon_code: appliedCoupon ? appliedCoupon.code : null,
          payment_gateway: gateway
        })
      });

      if (res.ok) {
        const data = await res.json();
        setTimeout(() => {
          setIsProcessing(false);
          onSuccess(data);
        }, 1200);
      } else {
        const err = await res.json();
        setIsProcessing(false);
        alert(err.error || 'Payment failed');
      }
    } catch (err) {
      setIsProcessing(false);
      console.error(err);
      alert('Network error during payment');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between relative">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
              Checkout & Payment
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">{turf.name}</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              📅 {date} | ⏰ {slot.start_time} - {slot.end_time}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Coupon Input */}
          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 space-y-2">
            <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <Ticket className="w-4 h-4 text-emerald-600" /> Have a Coupon Code?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Try TURF20 or FIRSTGAME"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-900 outline-none focus:border-emerald-600"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                Apply
              </button>
            </div>
            {couponError && <p className="text-[11px] text-rose-600 font-semibold">{couponError}</p>}
            {appliedCoupon && (
              <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Code {appliedCoupon.code} applied! Saved ₹{appliedCoupon.discount}
              </p>
            )}
          </div>

          {/* Payment Gateway Tabs */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 block">Select Payment Gateway</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGateway('razorpay')}
                className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                  gateway === 'razorpay'
                    ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-600/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center text-xs">
                  RZP
                </div>
                <div>
                  <span className="font-extrabold text-xs block">Razorpay</span>
                  <span className="text-[10px] text-slate-500">UPI, NetBanking, Cards</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setGateway('stripe')}
                className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                  gateway === 'stripe'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-900 ring-2 ring-indigo-600/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black flex items-center justify-center text-xs">
                  STR
                </div>
                <div>
                  <span className="font-extrabold text-xs block">Stripe</span>
                  <span className="text-[10px] text-slate-500">Credit / Debit Cards</span>
                </div>
              </button>
            </div>
          </div>

          {/* Simulated Input Fields */}
          {gateway === 'razorpay' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-blue-600" /> Virtual UPI ID
              </label>
              <input
                type="text"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-600"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-indigo-600" /> Card Details (Test Card)
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={e => setCardNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono outline-none focus:border-indigo-600"
              />
            </div>
          )}

          {/* Price Breakdown */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Slot Duration (1 hr)</span>
              <span className="font-medium">₹{basePrice}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Coupon Discount</span>
                <span>- ₹{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>GST & Platform Fee (18%)</span>
              <span className="font-medium">₹{taxAmount}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-slate-900 font-extrabold text-sm">
              <span>Total Payable</span>
              <span className="text-emerald-600 text-base">₹{totalAmount}</span>
            </div>
          </div>

          {/* Security Guarantee & Pay Button */}
          <div className="space-y-3">
            <button
              disabled={isProcessing}
              onClick={handlePayNow}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Securing Slot & Processing Payment...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Pay ₹{totalAmount} via {gateway === 'razorpay' ? 'Razorpay' : 'Stripe'}
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 256-Bit SSL Encryption • Instant Slot Guarantee
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
