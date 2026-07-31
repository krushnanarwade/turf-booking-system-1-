import React, { useState, useEffect } from 'react';
import { Turf, Slot } from '../types';
import { Calendar as CalendarIcon, Clock, Sun, Moon, Sunrise, Sunset, CheckCircle2, Lock } from 'lucide-react';

interface SlotPickerProps {
  turf: Turf;
  onSlotSelect: (slot: Slot, date: string) => void;
  selectedSlotId?: string;
}

export const SlotPicker: React.FC<SlotPickerProps> = ({ turf, onSlotSelect, selectedSlotId }) => {
  // Generate next 7 days
  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const [selectedDate, setSelectedDate] = useState<string>(dates[0]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchSlots(selectedDate);
  }, [selectedDate, turf.id]);

  const fetchSlots = async (dateStr: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/slots?turf_id=${turf.id}&date=${dateStr}`);
      if (res.ok) {
        const data = await res.json();
        setSlots(data.slots || []);
      }
    } catch (err) {
      console.error('Failed to fetch slots:', err);
    } finally {
      setLoading(false);
    }
  };

  // Group slots by time period
  const morningSlots = slots.filter(s => {
    const h = parseInt(s.start_time.split(':')[0], 10);
    return h >= 5 && h < 12;
  });

  const afternoonSlots = slots.filter(s => {
    const h = parseInt(s.start_time.split(':')[0], 10);
    return h >= 12 && h < 17;
  });

  const eveningSlots = slots.filter(s => {
    const h = parseInt(s.start_time.split(':')[0], 10);
    return h >= 17 && h < 21;
  });

  const nightSlots = slots.filter(s => {
    const h = parseInt(s.start_time.split(':')[0], 10);
    return h >= 21 || h < 5;
  });

  const formatDateDisplay = (dateStr: string) => {
    const d = new Date(dateStr);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    return { dayName, dayNum, month };
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-600" /> Select Date & Time Slot
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Operating hours: {turf.opening_time} - {turf.closing_time}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Booked
          </span>
        </div>
      </div>

      {/* Date Carousel */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {dates.map((dateStr, idx) => {
          const { dayName, dayNum, month } = formatDateDisplay(dateStr);
          const isSelected = selectedDate === dateStr;
          const isToday = idx === 0;

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/30 scale-105 font-bold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                {isToday ? 'Today' : dayName}
              </span>
              <span className="text-lg font-extrabold my-0.5">{dayNum}</span>
              <span className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>{month}</span>
            </button>
          );
        })}
      </div>

      {/* Slots Section */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          Loading available slots...
        </div>
      ) : (
        <div className="space-y-5 pt-2">
          {/* Morning Slots */}
          {morningSlots.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                <Sunrise className="w-4 h-4 text-amber-500" /> Morning Slots (06:00 AM - 12:00 PM)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {morningSlots.map(slot => (
                  <SlotButton
                    key={slot.id}
                    slot={slot}
                    isSelected={selectedSlotId === slot.id}
                    onSelect={() => onSlotSelect(slot, selectedDate)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Afternoon Slots */}
          {afternoonSlots.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                <Sun className="w-4 h-4 text-orange-500" /> Afternoon Slots (12:00 PM - 05:00 PM)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {afternoonSlots.map(slot => (
                  <SlotButton
                    key={slot.id}
                    slot={slot}
                    isSelected={selectedSlotId === slot.id}
                    onSelect={() => onSlotSelect(slot, selectedDate)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Evening Slots */}
          {eveningSlots.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                <Sunset className="w-4 h-4 text-purple-500" /> Evening Floodlit Slots (05:00 PM - 09:00 PM)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {eveningSlots.map(slot => (
                  <SlotButton
                    key={slot.id}
                    slot={slot}
                    isSelected={selectedSlotId === slot.id}
                    onSelect={() => onSlotSelect(slot, selectedDate)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Night Slots */}
          {nightSlots.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                <Moon className="w-4 h-4 text-indigo-500" /> Night Prime Slots (09:00 PM - 11:00 PM)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {nightSlots.map(slot => (
                  <SlotButton
                    key={slot.id}
                    slot={slot}
                    isSelected={selectedSlotId === slot.id}
                    onSelect={() => onSlotSelect(slot, selectedDate)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SlotButton: React.FC<{ slot: Slot; isSelected: boolean; onSelect: () => void }> = ({
  slot,
  isSelected,
  onSelect
}) => {
  const isAvailable = slot.status === 'available';

  return (
    <button
      disabled={!isAvailable}
      onClick={onSelect}
      className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-start justify-between gap-1.5 relative ${
        isSelected
          ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500 cursor-pointer'
          : isAvailable
          ? 'bg-white hover:bg-emerald-50 text-slate-800 border-slate-200 hover:border-emerald-500 cursor-pointer'
          : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
      }`}
    >
      <div className="flex items-center justify-between w-full">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-emerald-600" /> {slot.start_time} - {slot.end_time}
        </span>
        {isSelected ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        ) : !isAvailable ? (
          <Lock className="w-3.5 h-3.5 text-slate-400" />
        ) : null}
      </div>

      <div className="flex items-baseline justify-between w-full pt-1 border-t border-slate-100">
        <span className={`text-[11px] font-extrabold ${isSelected ? 'text-emerald-400' : 'text-slate-900'}`}>
          ₹{slot.price}
        </span>
        <span className={`text-[9px] font-bold uppercase tracking-wider ${isAvailable ? 'text-emerald-600' : 'text-slate-400'}`}>
          {isAvailable ? 'Available' : 'Booked'}
        </span>
      </div>
    </button>
  );
};
