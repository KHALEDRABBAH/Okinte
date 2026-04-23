'use client';

import { useState } from 'react';
import { Star, MessageSquare, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TestimonialForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, content }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Extract error message from API response
        const errorMessage = data.error || `Failed to submit testimonial (${res.status})`;
        setError(errorMessage);
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        setRating(0);
        setContent('');
        setError(null);
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit testimonial';
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-primary font-medium text-sm hover:text-gold transition-colors"
      >
        <Star className="w-4 h-4" aria-hidden="true" /> Write a Review
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative"
            >
              <button 
                onClick={() => !isSubmitting && setIsOpen(false)}
                aria-label="Close review form"
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>

              <h2 className="text-xl font-heading font-bold text-primary mb-2">Share Your Experience</h2>
              <p className="text-gray-500 text-sm mb-6">Your feedback helps us improve and helps others make informed decisions.</p>

              {isSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" aria-hidden="true" />
                  <h3 className="text-lg font-bold text-primary">Thank You!</h3>
                  <p className="text-gray-500 text-sm mt-2">Your review has been submitted and is pending approval.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  {/* Star Rating */}
                  <div className="flex items-center gap-2 justify-center py-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        aria-label={`Rate ${star} out of 5 stars`}
                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star 
                          className={`w-8 h-8 ${
                            (hoveredRating || rating) >= star 
                              ? 'fill-gold text-gold' 
                              : 'text-gray-300'
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                    ))}
                  </div>

                  {/* Text Review */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                    <textarea
                      required
                      value={content}
                      onChange={(e) => setContent(e.target.value.slice(0, 500))}
                      placeholder="Tell us what you loved about our services..."
                      maxLength={500}
                      className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-gold resize-none h-32"
                    />
                    <p className="text-xs text-gray-500 mt-1">{content.length} / 500 characters</p>
                  </div>

                  <button 
                    type="submit" 
                    disabled={rating === 0 || !content.trim() || isSubmitting}
                    className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Submitting...</span>
                    ) : (
                      <span className="flex items-center gap-2"><MessageSquare className="w-4 h-4" aria-hidden="true" /> Submit Review</span>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
