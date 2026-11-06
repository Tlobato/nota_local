"use client";

import React, { useState, useEffect } from "react";
import { Star, CheckCircle2, MessageSquareWarning, Send, ExternalLink, ShieldCheck, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";
import type { Business } from "@/lib/db/schema";

interface ReviewFlowProps {
  business: Business;
}

const RATING_DESCRIPTIONS: Record<number, { label: string; emoji: string }> = {
  1: { label: "Very unsatisfied", emoji: "😞" },
  2: { label: "Could be better", emoji: "🙁" },
  3: { label: "Average / Fair", emoji: "😐" },
  4: { label: "Very good!", emoji: "😊" },
  5: { label: "Outstanding! Perfect!", emoji: "🤩" },
};

export default function ReviewFlow({ business }: ReviewFlowProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [step, setStep] = useState<"rating" | "positive" | "negative_form" | "negative_done">("rating");

  // Form states for constructive/negative feedback
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [comment, setComment] = useState("");
  const [countdown, setCountdown] = useState(3);

  const activeRating = hoverRating || selectedRating || 0;

  // Handler for star selection
  const handleSelectStar = async (rating: number) => {
    setSelectedRating(rating);
    if (rating >= 4) {
      // 4 or 5 stars: Route to Google Reviews
      setStep("positive");
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Save positive review event in database
      try {
        await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessSlug: business.slug,
            rating,
          }),
        });
      } catch (e) {
        console.error("Error logging feedback:", e);
      }
    } else {
      // 1, 2 or 3 stars: Retain internally for manager resolution
      setStep("negative_form");
    }
  };

  // Automatic countdown redirection for positive reviews
  useEffect(() => {
    if (step === "positive" && business.googleReviewUrl) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = business.googleReviewUrl;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [step, business.googleReviewUrl]);

  // Submit private feedback (Optimistic UI)
  const handleSubmitNegative = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRating) return;

    setStep("negative_done");
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessSlug: business.slug,
          rating: selectedRating,
          customerName,
          customerPhone,
          comment,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden transition-all duration-300">
      {/* Top Banner with Brand Accent */}
      <div
        className="h-28 flex flex-col justify-end p-6 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${business.coverColor || "#2563eb"} 0%, #1e293b 100%)`,
        }}
      >
        <div className="absolute top-3 right-4 flex items-center gap-1.5 text-xs text-white/80 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Official Feedback Channel</span>
        </div>
        <p className="text-xs uppercase tracking-wider text-white/70 font-semibold mb-0.5">
          {business.category || "Customer Care"}
        </p>
        <h1 className="text-xl font-bold truncate leading-tight">{business.name}</h1>
      </div>

      <div className="p-6">
        {/* STEP 1: STAR SELECTION */}
        {step === "rating" && (
          <div className="text-center py-2">
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              {business.welcomeMessage || "How was your experience with us today?"}
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Tap the stars below to rate our service:
            </p>

            {/* Stars Container */}
            <div className="flex justify-center items-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= activeRating;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => handleSelectStar(star)}
                    className="p-1.5 focus:outline-none transition-transform hover:scale-125 active:scale-95 duration-150"
                    aria-label={`Rate with ${star} stars`}
                  >
                    <Star
                      className={`w-10 h-10 transition-colors duration-150 ${
                        isFilled
                          ? "fill-amber-400 text-amber-400 filter drop-shadow-sm"
                          : "text-slate-200 fill-slate-50"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Active Rating Description */}
            <div className="h-8 flex items-center justify-center">
              {activeRating > 0 ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-semibold animate-in fade-in zoom-in duration-200 border border-amber-200/60">
                  <span>{RATING_DESCRIPTIONS[activeRating].emoji}</span>
                  <span>{RATING_DESCRIPTIONS[activeRating].label}</span>
                </div>
              ) : (
                <span className="text-xs text-slate-400">Select 1 to 5 stars</span>
              )}
            </div>
          </div>
        )}

        {/* STEP 2 (POSITIVE): 4 OR 5 STARS -> GOOGLE REVIEW ROUTE */}
        {step === "positive" && (
          <div className="text-center py-4 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Thank you so much! 🎉
            </h2>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              We are thrilled you had a great experience! Could you take 10 seconds to share your praise on our official Google page? It helps our local team immensely.
            </p>

            <a
              href={business.googleReviewUrl}
              target="_self"
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base group"
            >
              <span>Post on Google Reviews</span>
              <ExternalLink className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            <p className="text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
              Redirecting automatically in <strong className="text-slate-600 font-semibold">{countdown}s</strong>...
            </p>
          </div>
        )}

        {/* STEP 2 (CONSTRUCTIVE): 1 TO 3 STARS -> PRIVATE FORM */}
        {step === "negative_form" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200/80 rounded-2xl mb-5">
              <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center shrink-0">
                <MessageSquareWarning className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-xs font-bold text-amber-900">We appreciate your honesty</h3>
                <p className="text-[11px] text-amber-700 leading-tight">
                  Your feedback goes directly to executive management for immediate follow-up.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitNegative} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  What could we have done better? *
                </label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what happened so we can make it right..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Your Name (optional)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g., Alex Johnson"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Phone / WhatsApp (optional, if you'd like a response)
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm shadow-md"
              >
                <span>Send to Management</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: FEEDBACK SUBMITTED CONFIRMATION */}
        {step === "negative_done" && (
          <div className="text-center py-6 animate-in fade-in zoom-in duration-300">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="text-lg font-bold text-slate-800 mb-2">
              Message Received
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">
              Thank you for sharing your experience. Our management team will review your comments and take corrective action immediately.
            </p>

            <button
              onClick={() => {
                setStep("rating");
                setSelectedRating(null);
                setHoverRating(null);
                setComment("");
              }}
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              <span>Back to home</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex items-center justify-between text-[11px] text-slate-400">
        <span>Protected by NotaLocal</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          Direct Resolution Service
        </span>
      </div>
    </div>
  );
}
