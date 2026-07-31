import React from 'react';
import { Turf } from '../types';
import { X, MapPin, Navigation, Compass, Phone, ExternalLink } from 'lucide-react';

interface MapModalProps {
  turf: Turf;
  onClose: () => void;
}

export const MapModal: React.FC<MapModalProps> = ({ turf, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-extrabold text-white text-base">{turf.name} Location</h3>
              <p className="text-xs text-slate-400">{turf.location}, {turf.city}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Stage */}
        <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden flex items-center justify-center p-6">
          {/* Simulated Map Visual Canvas */}
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/80 to-slate-800/40" />

          {/* Interactive Pin Card */}
          <div className="relative z-10 bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-slate-200 shadow-xl max-w-md text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-4 ring-emerald-500/20 animate-bounce">
              <Compass className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">{turf.name}</h4>
              <p className="text-xs text-slate-600 mt-1">{turf.location}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-emerald-50 text-emerald-800 font-extrabold text-[11px] rounded-full border border-emerald-200">
                Coordinates: {turf.latitude}, {turf.longitude} (~2.4 km away)
              </span>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <a
                href={`https://maps.google.com/?q=${turf.latitude},${turf.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
              >
                <Navigation className="w-3.5 h-3.5" /> Open Google Maps <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>Parking Available On-Site</span>
          <span className="font-semibold text-slate-900">Owner Helpline: +91 98111 22233</span>
        </div>
      </div>
    </div>
  );
};
