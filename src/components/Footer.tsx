import React from 'react';
import { Trophy, ShieldCheck, Heart, MapPin, Phone, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight">TurfHub</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            The premier online sports turf ground booking network. FIFA-approved turf grounds, floodlit box cricket, badminton courts, and automated slot passes.
          </p>
        </div>

        <div>
          <h4 className="font-extrabold text-white uppercase text-[11px] tracking-wider mb-3">Popular Sports</h4>
          <ul className="space-y-2 text-slate-400">
            <li>Box Cricket Arenas</li>
            <li>Football Turfs (5v5, 7v7)</li>
            <li>Indoor Badminton Courts</li>
            <li>Tennis Synthetic Grounds</li>
            <li>Beach Volleyball Tracks</li>
          </ul>
        </div>

        <div>
          <h4 className="font-extrabold text-white uppercase text-[11px] tracking-wider mb-3">Cities Served</h4>
          <ul className="space-y-2 text-slate-400">
            <li>Mumbai • Bandra & Andheri</li>
            <li>Bangalore • HSR Layout & Indiranagar</li>
            <li>Delhi • Connaught Place & Gurugram</li>
            <li>Pune • Kothrud & Viman Nagar</li>
            <li>Hyderabad • Jubilee Hills</li>
          </ul>
        </div>

        <div>
          <h4 className="font-extrabold text-white uppercase text-[11px] tracking-wider mb-3">Partner Support</h4>
          <ul className="space-y-2 text-slate-400">
            <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-emerald-500" /> Helpline: +91 1800 200 9090</li>
            <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-emerald-500" /> Email: support@turfhub.com</li>
            <li className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 256-Bit SSL Payment Security</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-900 py-6 text-center text-[11px] text-slate-500">
        © 2026 TurfHub Inc. All rights reserved. Built with React, TypeScript, Express & Python.
      </div>
    </footer>
  );
};
