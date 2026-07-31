import React, { useState } from 'react';
import { Turf } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { X, Star, MessageSquare, Send } from 'lucide-react';

interface ReviewModalProps {
  turf: Turf;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ turf, onClose, onReviewSubmitted }) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to leave a review.');
      return;
    }

    if (!comment.trim()) {
      alert('Please enter a comment.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          user_name: user.fullname,
          turf_id: turf.id,
          rating,
          comment
        })
      });

      if (res.ok) {
        showToast('Review Submitted! ⭐', 'Thank you for rating this turf.');
        onReviewSubmitted();
        onClose();
      } else {
        alert('Failed to submit review.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Rate & Review</span>
            <h3 className="font-extrabold text-white text-base">{turf.name}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Rating Stars Selection */}
          <div className="text-center space-y-2">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">Your Rating</label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  type="button"
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-125 cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400 drop-shadow-md'
                        : 'text-slate-200 fill-slate-100'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-amber-600 block">
              {rating === 5 ? 'Awesome ground! 🔥' : rating === 4 ? 'Very Good 👍' : rating === 3 ? 'Average 👌' : 'Needs improvement'}
            </span>
          </div>

          {/* Comment Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> Share your experience
            </label>
            <textarea
              rows={4}
              required
              placeholder="How was the turf quality, lighting, parking, and staff behavior?"
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 outline-none focus:border-emerald-600 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer text-xs"
          >
            {isSubmitting ? 'Posting...' : <><Send className="w-4 h-4" /> Submit Review</>}
          </button>
        </form>
      </div>
    </div>
  );
};
