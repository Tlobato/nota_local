"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";
import {
  Star,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  QrCode,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  PhoneCall,
  Sparkles,
  Zap,
  Building,
  HeartHandshake,
  MessageSquareWarning,
  Send,
} from "lucide-react";
import confetti from "canvas-confetti";

import Logo from "@/components/Logo";

const SIMULATOR_RATINGS: Record<number, { label: string; emoji: string }> = {
  1: { label: "Very unsatisfied", emoji: "😞" },
  2: { label: "Could be better", emoji: "🙁" },
  3: { label: "Average / Fair", emoji: "😐" },
  4: { label: "Very good!", emoji: "😊" },
  5: { label: "Outstanding! Perfect!", emoji: "🤩" },
};

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const [hoverStar, setHoverStar] = useState<number | null>(null);
  const [demoRating, setDemoRating] = useState<number | null>(null);
  const [demoStep, setDemoStep] = useState<
    "choose" | "positive" | "negative_form" | "negative_done"
  >("choose");
  const [demoName, setDemoName] = useState("");
  const [demoPhone, setDemoPhone] = useState("");
  const [demoComment, setDemoComment] = useState("");

  const activeStar = hoverStar || demoRating || 0;

  const handleTestStar = (star: number) => {
    setDemoRating(star);
    if (star >= 4) {
      setDemoStep("positive");
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } else {
      setDemoStep("negative_form");
    }
  };

  const resetDemo = () => {
    setDemoRating(null);
    setHoverStar(null);
    setDemoName("");
    setDemoPhone("");
    setDemoComment("");
    setDemoStep("choose");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo variant="dark" showRatingBadge={true} />

          <div className="flex items-center gap-3">
            <Link
              href="/smile-dental-care"
              className="hidden sm:inline-block text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Live Demo
            </Link>

            {isLoaded && isSignedIn ? (
              <>
                <Link
                  href="/admin"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <div className="ml-1 flex items-center">
                  <UserButton />
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/admin"
                  className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/onboarding"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/30 transition-all"
                >
                  Start Free Trial
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-900 to-slate-900 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold shadow-sm">
            <span className="text-amber-400 text-sm">⭐</span>
            <span>The definitive reputation platform for local businesses</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Protect your Google score and{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
              multiply 5-star reviews.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            The intelligent review funnel that routes delighted customers straight to your Google profile while retaining constructive feedback internally before it becomes public.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isLoaded && isSignedIn ? (
              <>
                <Link
                  href="/admin"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <span>Go to Management Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#simulator"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-base border border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <span>Try Simulator</span>
                </a>
              </>
            ) : (
              <>
                <Link
                  href="/onboarding"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Start 7-Day Free Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#simulator"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-base border border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <span>Interactive Simulator</span>
                </a>
              </>
            )}
          </div>

          {!(isLoaded && isSignedIn) && (
            <div className="pt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm font-medium text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>No credit card or banking details required</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero automatic billing after trial period</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Printable QR placard ready in 2 minutes</span>
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Interactive Simulator */}
      <section id="simulator" className="py-16 px-4 sm:px-6 bg-slate-950/60 border-y border-slate-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
              Live Interactive Test
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Test both customer paths right now
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Select a star rating below to experience how NotaLocal handles happy vs unhappy customers:
            </p>
          </div>

          {/* Simulator Container */}
          <div className="w-full max-w-md mx-auto bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div
              className="h-24 flex flex-col justify-end p-5 text-white relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #2563eb 0%, #1e293b 100%)",
              }}
            >
              <div className="absolute top-3 right-4 flex items-center gap-1.5 text-[11px] text-white/90 bg-white/10 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Official Feedback Channel</span>
              </div>
              <p className="text-[11px] uppercase tracking-wider text-white/75 font-semibold">
                Interactive Preview
              </p>
              <h3 className="text-lg font-bold truncate leading-tight">
                Your Local Business / Clinic
              </h3>
            </div>

            <div className="p-6">
              {demoStep === "choose" && (
                <div className="py-2 text-center">
                  <h4 className="text-base sm:text-lg font-bold text-slate-800 mb-1.5">
                    How was your experience with us today?
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 mb-5">
                    Tap a star below to trigger the simulation:
                  </p>

                  <div className="flex justify-center items-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = star <= activeStar;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverStar(star)}
                          onMouseLeave={() => setHoverStar(null)}
                          onClick={() => handleTestStar(star)}
                          className="p-1.5 hover:scale-125 active:scale-95 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-9 h-9 transition-colors ${
                              isFilled
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200 fill-slate-50"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <div className="h-8 flex items-center justify-center">
                    {activeStar > 0 ? (
                      <span className="text-xs font-semibold px-3 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
                        {SIMULATOR_RATINGS[activeStar].emoji}{" "}
                        {SIMULATOR_RATINGS[activeStar].label}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">
                        Select 1 to 5 stars
                      </span>
                    )}
                  </div>
                </div>
              )}

              {demoStep === "positive" && (
                <div className="py-4 text-center space-y-4 animate-in fade-in">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      High Rating Detected! 🎉
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                      Happy customers (4 or 5 stars) are guided with 1 click directly to post their praise on Google Reviews!
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-left text-xs text-blue-900">
                    <p className="font-semibold mb-1">⚡ Automatic Redirection:</p>
                    <p className="text-blue-700">
                      The customer is instantly forwarded to your official Google Maps listing to amplify your ranking and public score.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={resetDemo}
                    className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    ← Test a low rating (1 to 3 stars)
                  </button>
                </div>
              )}

              {demoStep === "negative_form" && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
                    <MessageSquareWarning className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-900">
                        Constructive Feedback Shield Activated! 🛡️
                      </h4>
                      <p className="text-[11px] text-amber-700 mt-0.5 leading-snug">
                        Customers rating 1-3 stars never see the Google link. Instead, they share their concern directly with your management team.
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setDemoStep("negative_done");
                    }}
                    className="space-y-2.5 text-left"
                  >
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Customer Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Alex Taylor"
                        value={demoName}
                        onChange={(e) => setDemoName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Phone / WhatsApp (for private resolution)
                      </label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={demoPhone}
                        onChange={(e) => setDemoPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        What can we improve? *
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Explain what went wrong so management can resolve it..."
                        value={demoComment}
                        onChange={(e) => setDemoComment(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
                    >
                      <span>Send to Management</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={resetDemo}
                      className="w-full text-center text-xs text-blue-600 font-semibold hover:underline pt-1 cursor-pointer"
                    >
                      ← Back to test another rating
                    </button>
                  </form>
                </div>
              )}

              {demoStep === "negative_done" && (
                <div className="py-4 text-center space-y-3 animate-in fade-in">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    Resolution Alert Triggered!
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    The complaint is captured directly into your private dashboard (never posted to Google). You receive an instant notification to reach out to the customer and turn the relationship around.
                  </p>
                  <button
                    type="button"
                    onClick={resetDemo}
                    className="mt-2 text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    ← Test again from the beginning
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Counter Placard & QR Code Showcase */}
      <section className="py-20 px-4 sm:px-6 bg-slate-900 border-b border-slate-800/80">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Mockup Display */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-[300px] bg-slate-100 p-3.5 rounded-[32px] shadow-2xl border border-slate-700/60 relative">
                <div className="bg-white rounded-[24px] p-6 text-center shadow-sm border border-slate-200/80 flex flex-col items-center">
                  <div className="w-14 h-1.5 rounded-full bg-blue-600 mb-3.5" />

                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <span className="text-sm font-extrabold text-slate-900 tracking-tight mb-2">
                    Smile Dental Care
                  </span>

                  <h4 className="text-base font-extrabold text-slate-900 leading-snug mb-1.5">
                    Your feedback matters to us!
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                    Point your camera at the QR Code below to rate your visit in 30 seconds:
                  </p>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 mb-4 flex flex-col items-center justify-center">
                    <QrCode className="w-32 h-32 text-slate-900 stroke-[1.5]" />
                  </div>

                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold">
                    <Zap className="w-3 h-3 fill-blue-600 text-blue-600" />
                    <span>Takes less than 30 seconds</span>
                  </div>
                </div>
                <div className="w-28 h-2 bg-slate-300 rounded-b-xl mx-auto mt-1.5 opacity-75" />
              </div>
            </div>

            {/* Right Column: Explanations */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
                <QrCode className="w-3.5 h-3.5" />
                <span>Smart Counter Placard + Mobile Link</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                Why standard QR code stands are a{" "}
                <span className="text-amber-400">risky gamble</span>.
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                When you hand a customer an unfiltered Google Review link, any minor frustration can permanently damage your public score. With <strong>NotaLocal</strong>, you generate <strong>Smart QR Counter Displays</strong> ready to print in 2 minutes:
              </p>

              <div className="space-y-3.5">
                <div className="flex items-start gap-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/70">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Print-Ready High Resolution Artwork (300 DPI)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      Customized with your business name and branding colors. Export as PNG or print directly for reception desks and checkout counters.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/70">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Automated Review Filtering Built In
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      Customers rating <strong>4 or 5 stars</strong> publish on Google. Customers rating <strong>1 to 3 stars</strong> are redirected to your private manager inbox.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/70">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Direct WhatsApp & SMS Outreach
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      Send personalized review invites directly from the dashboard after a service appointment with 1-click messaging templates.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <Link
                    href="/onboarding"
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate Free QR Display (7-Day Trial)</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    <strong className="text-slate-200">Zero risk:</strong> no credit card or financial info required to begin.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Google Reputation Matters */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              The Math Behind Google Rankings
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-xl mx-auto">
              Local service businesses lose thousands in recurring revenue each month simply by ignoring review gating.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/60 p-6 rounded-3xl border border-slate-700/80">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-4">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">The 10-to-1 Rule</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                For every single 1-star review received, you need up to <strong>10 consecutive 5-star reviews</strong> just to recover your prior average.
              </p>
            </div>

            <div className="bg-slate-800/60 p-6 rounded-3xl border border-slate-700/80">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Local SEO Dominance</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Google's local search algorithm rewards profiles with recent, high-velocity reviews. More authentic praise pushes you ahead of competitors without paid ads.
              </p>
            </div>

            <div className="bg-slate-800/60 p-6 rounded-3xl border border-slate-700/80">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Rapid Service Recovery</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                92% of unhappy customers return to make future purchases when their complaint is heard and handled promptly through private channels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {!(isLoaded && isSignedIn) && (
        <section id="pricing" className="py-20 px-4 sm:px-6 bg-slate-950/80 border-t border-slate-800">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                7-Day Free Trial • No Payment Info Needed Upfront
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                Simple, transparent pricing for growing businesses
              </h2>
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
                Test NotaLocal free for <strong>7 days</strong> with full feature access. Afterward, pick the plan that suits your team:
              </p>

              <div className="max-w-2xl mx-auto pt-2">
                <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 px-4 py-2.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs sm:text-sm text-emerald-200">
                  <span className="font-extrabold text-emerald-400 shrink-0">
                    🔒 Zero Commitment:
                  </span>
                  <span>
                    No credit card required. No surprise auto-renewals at the end of the trial period.
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
              {/* Monthly Plan */}
              <div className="bg-slate-900/90 p-7 sm:p-8 rounded-3xl border border-slate-800 flex flex-col justify-between">
                <div className="space-y-5">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold mb-3">
                      Flexible Month-to-Month
                    </span>
                    <h3 className="text-xl font-bold text-white">Starter Plan</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Ideal for single-location shops and independent clinics.
                    </p>
                  </div>

                  <div className="py-4 border-y border-slate-800">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-extrabold text-white">$29</span>
                      <span className="text-xs text-slate-400">/ month</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Billed monthly • Cancel anytime with 1 click
                    </p>
                  </div>

                  <ul className="space-y-3">
                    {[
                      "7-day free trial with no card required",
                      "Custom branded rating landing page (name, cover, logo)",
                      "Smart review routing (4-5⭐ to Google / 1-3⭐ to internal inbox)",
                      "Instant email notifications for new negative feedback",
                      "High-resolution printable QR counter display artwork",
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8 space-y-2.5">
                  <Link
                    href="/onboarding"
                    className="w-full py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Start 7-Day Free Trial</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Annual Plan (Featured) */}
              <div className="relative bg-gradient-to-b from-blue-950/80 via-slate-900 to-slate-900 p-7 sm:p-8 rounded-3xl border-2 border-blue-500 shadow-2xl shadow-blue-600/20 flex flex-col justify-between">
                <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-[11px] font-extrabold uppercase tracking-wider shadow-lg">
                  Most Popular • 40% OFF
                </div>

                <div className="space-y-5">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold mb-3">
                      Complete Annual Protection
                    </span>
                    <h3 className="text-xl font-bold text-white">Annual Pro Plan</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Everything included with maximum annual savings and priority support.
                    </p>
                  </div>

                  <div className="py-4 border-y border-slate-800/80">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl sm:text-5xl font-extrabold text-white">$19</span>
                      <span className="text-xs text-slate-400">/ month billed annually</span>
                    </div>
                    <p className="text-xs text-emerald-400 font-semibold mt-1.5">
                      Save over 40% compared to month-to-month billing
                    </p>
                  </div>

                  <ul className="space-y-3">
                    {[
                      "All features included with unlimited review submissions",
                      "Priority support with dedicated onboarding assistance",
                      "Printable counter display artwork with custom branding",
                      "Staff response templates and resolution follow-up tracking",
                      "30-day money-back guarantee",
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8 space-y-2.5">
                  <Link
                    href="/onboarding"
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Start 7-Day Free Trial</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-b from-slate-900 to-slate-950 text-center border-t border-slate-800">
        <div className="max-w-2xl mx-auto space-y-6">
          {isLoaded && isSignedIn ? (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Your account is active</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white">
                Your business is protected!
              </h2>
              <p className="text-sm text-slate-400">
                Access your dashboard anytime to monitor review feedback, download placards, and track resolution metrics.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link
                  href="/admin"
                  className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/smile-dental-care"
                  className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all border border-slate-700"
                >
                  View Live Demo
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-extrabold text-white">
                Ready to protect and elevate your local reputation?
              </h2>
              <p className="text-sm text-slate-400">
                Test free for 7 days with zero credit card required. Generate your smart QR counter placard in under 2 minutes.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link
                  href="/onboarding"
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/25"
                >
                  Start My Free 7-Day Trial
                </Link>
                <Link
                  href="/smile-dental-care"
                  className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all border border-slate-700"
                >
                  View Live Demo
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 NotaLocal. All rights reserved.</p>
          <p className="text-slate-400">
            Engineered to empower local businesses and healthcare providers worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
}
