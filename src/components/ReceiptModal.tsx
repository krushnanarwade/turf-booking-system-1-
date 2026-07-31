import React from 'react';
import { Booking } from '../types';
import { X, Printer, Download, CheckCircle2, QrCode, Trophy, ShieldCheck, MapPin, Calendar, Clock } from 'lucide-react';

interface ReceiptModalProps {
  booking: Booking;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ booking, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:border-none print:m-0 print:max-w-none">
        {/* Receipt Header */}
        <div className="bg-emerald-600 text-white p-6 relative flex items-center justify-between print:bg-white print:text-slate-900 print:border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white print:text-emerald-600 print:bg-emerald-50">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-100 print:text-slate-500 block">
                Official Booking Receipt
              </span>
              <h3 className="text-lg font-extrabold text-white print:text-slate-900">TurfHub Pass</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-full transition-colors print:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-6">
          {/* Status Banner */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <div>
              <h4 className="font-extrabold text-emerald-950 text-xs uppercase tracking-wider">Booking Confirmed & Paid</h4>
              <p className="text-[11px] text-emerald-800">Present this QR pass at the venue entrance.</p>
            </div>
          </div>

          {/* Turf Details */}
          <div className="space-y-3">
            <h4 className="text-base font-extrabold text-slate-900">{booking.turf_name}</h4>
            <div className="space-y-1.5 text-xs text-slate-600">
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> {booking.turf_location}
              </p>
              <p className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> Date: <strong className="text-slate-900">{booking.booking_date}</strong>
              </p>
              <p className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> Time: <strong className="text-slate-900">{booking.start_time} - {booking.end_time}</strong>
              </p>
              <p className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> Sport: <strong className="text-slate-900">{booking.sport_type}</strong>
              </p>
            </div>
          </div>

          {/* Visual QR Code Section */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center gap-2 text-center">
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
              <QrCode className="w-28 h-28 text-slate-900" />
            </div>
            <span className="font-mono text-[11px] font-bold tracking-widest text-slate-700 uppercase">
              {booking.qr_code || `TH-${booking.id}`}
            </span>
            <span className="text-[10px] text-slate-400">Scan at turf reception for automated ground gate access</span>
          </div>

          {/* Amount Breakdown */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Booking Ref ID</span>
              <span className="font-mono font-bold text-slate-900">{booking.id}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Customer Name</span>
              <span className="font-semibold text-slate-900">{booking.user_name || 'Valued Customer'}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Payment Status</span>
              <span className="font-bold text-emerald-600 uppercase">PAID (ONLINE)</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-slate-900 font-extrabold text-sm">
              <span>Total Paid</span>
              <span className="text-emerald-600 text-base">₹{booking.total_amount}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 print:hidden">
            <button
              onClick={handlePrint}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
