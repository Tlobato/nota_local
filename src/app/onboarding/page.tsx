"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import {
  Building2,
  ExternalLink,
  Phone,
  Palette,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  HelpCircle,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    category: "Dental Care & Aesthetics",
    googleReviewUrl: "",
    notificationPhone: "",
    coverColor: "#2563eb",
  });

  const COLOR_PRESETS = [
    "#2563eb",
    "#0d9488",
    "#e11d48",
    "#d97706",
    "#ea580c",
    "#7c3aed",
    "#0f172a",
    "#4f46e5",
  ];

  // Auto-generate slug when typing business name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const autoSlug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setForm((prev) => ({
      ...prev,
      name,
      slug: prev.slug === "" || prev.slug === prev.name.toLowerCase() ? autoSlug : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/business/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to configure business profile.");
      }

      // Redirect to admin management dashboard
      router.push(`/admin`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred while saving profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-blue-600 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="flex justify-center mb-4">
          <Logo variant="dark" showRatingBadge={false} />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>7-Day Free Trial • No Credit Card Required</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Configure Your Business Profile
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Takes under 2 minutes to generate your customized review funnel and QR placards.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white text-slate-900 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl border border-slate-100">
          {/* Card-Free Guarantee Badge */}
          <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              ✓
            </div>
            <div className="text-xs text-emerald-950 leading-relaxed">
              <strong className="font-extrabold">Zero financial commitment:</strong> We do not ask for credit card or banking details to start your free 7-day trial. No automatic billing.
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Business Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Business / Clinic Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g., Smile Dental Care Clinic"
                  value={form.name}
                  onChange={handleNameChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900"
                />
              </div>
            </div>

            {/* Custom URL Slug */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Custom Page Slug
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden bg-slate-50 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
                <span className="px-3.5 text-xs text-slate-400 font-mono font-medium select-none">
                  notalocal.com/
                </span>
                <input
                  type="text"
                  required
                  placeholder="your-business"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                  className="w-full py-3 pr-4 bg-transparent text-sm font-semibold text-slate-900 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                This URL is embedded in your counter QR code and mobile review invites.
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Business Category
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Dentistry & Oral Surgery, Auto Repair, Barber Shop"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              />
            </div>

            {/* Official Google Review Link */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Official Google Review URL
                </label>
                <a
                  href="https://support.google.com/business/answer/3474122"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-medium"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>How to find my link?</span>
                </a>
              </div>
              <input
                type="url"
                required
                placeholder="https://search.google.com/local/writereview?placeid=... or g.page/r/..."
                value={form.googleReviewUrl}
                onChange={(e) => setForm({ ...form, googleReviewUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Satisfied customers (4 or 5 stars) will be routed directly to this link.
              </p>
            </div>

            {/* Notification Contact */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Manager Notification Phone / WhatsApp
              </label>
              <input
                type="tel"
                required
                placeholder="+1 (555) 123-4567"
                value={form.notificationPhone}
                onChange={(e) =>
                  setForm({ ...form, notificationPhone: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Used to alert your team immediately when constructive feedback requires attention.
              </p>
            </div>

            {/* Brand Color */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Brand Accent Color
              </label>
              <div className="flex flex-wrap items-center gap-2.5">
                {COLOR_PRESETS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setForm({ ...form, coverColor: hex })}
                    className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                      form.coverColor.toLowerCase() === hex.toLowerCase()
                        ? "border-slate-900 scale-110 shadow-md"
                        : "border-transparent opacity-80 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: hex }}
                  />
                ))}
                <input
                  type="color"
                  value={form.coverColor}
                  onChange={(e) => setForm({ ...form, coverColor: e.target.value })}
                  className="w-9 h-9 p-0.5 rounded-xl border border-slate-200 cursor-pointer bg-white"
                  title="Choose custom color"
                />
                <span className="text-xs text-slate-500 font-mono">{form.coverColor}</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 space-y-2.5">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span>Activating 7-day trial...</span>
                ) : (
                  <>
                    <span>Start Free 7-Day Trial</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-slate-400">
                Full access for 7 days with no automatic renewal. Only subscribe if you love the results.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
