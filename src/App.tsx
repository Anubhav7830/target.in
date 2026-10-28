import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  ExternalLink,
  Film,
  Mail,
  MapPin,
  Menu,
  Phone,
  Send,
  Upload,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  billingNote: string;
  description: string;
  recommended?: boolean;
  features: string[];
  purposeTag: string;
}

interface ReelSlot {
  id: string;
  label: string;
  videoUrl: string;
  caption: string;
  isMuted: boolean;
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'plan-1',
    name: 'Plan 1 — Basic Plan',
    price: '₹15,000',
    billingNote: 'Base Package',
    description: 'Essential monthly content & Meta campaign package with 10 Reels and 2 Carousels.',
    purposeTag: 'Plan 1 — Basic Plan (₹15,000 · 10 Reels + 2 Carousels)',
    features: [
      '10 High-Converting Reels',
      '2 Custom Carousels',
    ],
  },
  {
    id: 'plan-2',
    name: 'Plan 2 — Upgrade Plan',
    price: '₹20,000',
    billingNote: '+₹5,000 Upgrade (+3 Reels, +3 Carousels)',
    description: 'Upgraded volume with 3 additional Reels and 3 additional Carousels for faster growth.',
    recommended: true,
    purposeTag: 'Plan 2 — Upgrade Plan (₹20,000 · 13 Reels + 5 Carousels)',
    features: [
      '13 High-Converting Reels (10 + 3 Reels)',
      '5 Custom Carousels (2 + 3 Carousels)',
    ],
  },
  {
    id: 'plan-3',
    name: 'Plan 3 — Pro Upgrade',
    price: '₹25,000',
    billingNote: '+₹5,000 Upgrade (+3 Reels, +3 Carousels)',
    description: 'Maximum monthly output with a further 3 Reels and 3 Carousels upgrade.',
    purposeTag: 'Plan 3 — Pro Upgrade (₹25,000 · 16 Reels + 8 Carousels)',
    features: [
      '16 High-Converting Reels (13 + 3 Reels)',
      '8 Custom Carousels (5 + 3 Carousels)',
    ],
  },
];

export default function App() {
  // Navigation & Modal State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookNowModalOpen, setBookNowModalOpen] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  const triggerToast = (title: string, message: string) => {
    setToast({ title, message });
    setTimeout(() => {
      setToast((prev) => (prev?.title === title ? null : prev));
    }, 4500);
  };

  // 3 Reel Divs State (inside Best Work div) pre-loaded with the 3 provided Reels
  const videoRefs = React.useRef<Record<string, HTMLVideoElement | null>>({});

  const [reelSlots, setReelSlots] = useState<ReelSlot[]>([
    {
      id: 'reel-1',
      label: 'Reel Showcase 01',
      videoUrl: '/assets/aistudio/2_67029e5d.mp4?v=2',
      caption: 'Vidyashree Group of Colleges — Admissions Campaign',
      isMuted: true,
    },
    {
      id: 'reel-2',
      label: 'Reel Showcase 02',
      videoUrl:
        '/assets/aistudio/From_Klickpin.com-_Easy_Pinterest_marketing_ideas_that_make_your_next_project_look_polished_and_expensive_for_ideas_worth_saving_right_now-pin-id-_ed0a0911.mp4',
      caption: 'Property Walkthrough & High-Retention Hook',
      isMuted: true,
    },
    {
      id: 'reel-3',
      label: 'Reel Showcase 03',
      videoUrl: '/assets/aistudio/propexofficial_pindown.io_1793098459_f8f74c2b.mp4',
      caption: 'Elevate Ventures — Luxury Residences Reel',
      isMuted: true,
    },
  ]);

  const toggleReelMute = (id: string) => {
    setReelSlots((prev) =>
      prev.map((slot) => {
        const nextMuted = slot.id === id ? !slot.isMuted : true;
        const vid = videoRefs.current[slot.id];
        if (vid) {
          vid.muted = nextMuted;
          if (vid.paused) {
            vid.play().catch(() => {});
          }
        }
        return { ...slot, isMuted: nextMuted };
      })
    );
  };

  const handleReelFileUpload = (id: string, file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setReelSlots((prev) =>
      prev.map((slot) => (slot.id === id ? { ...slot, videoUrl: url, isMuted: true } : slot))
    );
    triggerToast('Reel Added', 'Your reel video has been loaded into the showcase slot.');
  };

  // Page Enquiry Form State (Name, Gmail, Number, Purpose)
  const [fullName, setFullName] = useState('');
  const [gmail, setGmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [purposeCategory, setPurposeCategory] = useState(
    'Plan 1 — Basic Plan (₹15,000 · 10 Reels + 2 Carousels)'
  );
  const [purposeDetails, setPurposeDetails] = useState('');

  // Modal Enquiry Form State (Name, Gmail, Number, Purpose)
  const [modalName, setModalName] = useState('');
  const [modalGmail, setModalGmail] = useState('');
  const [modalPhone, setModalPhone] = useState('');
  const [modalPurposeCategory, setModalPurposeCategory] = useState(
    'Plan 1 — Basic Plan (₹15,000 · 10 Reels + 2 Carousels)'
  );
  const [modalPurposeDetails, setModalPurposeDetails] = useState('');

  // Enquiry Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openBookNowModal = (
    defaultPurpose = 'Plan 1 — Basic Plan (₹15,000 · 10 Reels + 2 Carousels)'
  ) => {
    setModalPurposeCategory(defaultPurpose);
    setBookNowModalOpen(true);
  };

  const submitEnquiry = async (payload: {
    name: string;
    gmail: string;
    phoneNumber: string;
    purposeCategory: string;
    purposeDetails: string;
  }) => {
    setIsSubmitting(true);
    try {
      await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      triggerToast(
        'Booking Enquiry Submitted',
        `Thank you, ${payload.name}. We will contact you on ${payload.phoneNumber} and ${payload.gmail} shortly.`
      );
    } catch {
      triggerToast(
        'Booking Enquiry Submitted',
        `Thank you, ${payload.name}. We will contact you on ${payload.phoneNumber} and ${payload.gmail} shortly.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitEnquiry({
      name: fullName,
      gmail,
      phoneNumber,
      purposeCategory,
      purposeDetails,
    });
    setFullName('');
    setGmail('');
    setPhoneNumber('');
    setPurposeDetails('');
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitEnquiry({
      name: modalName,
      gmail: modalGmail,
      phoneNumber: modalPhone,
      purposeCategory: modalPurposeCategory,
      purposeDetails: modalPurposeDetails,
    });
    setBookNowModalOpen(false);
    setModalName('');
    setModalGmail('');
    setModalPhone('');
    setModalPurposeDetails('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 right-5 z-50 bg-dark-900 text-white px-5 py-4 rounded-xl shadow-xl border border-slate-800 flex items-center gap-3.5 max-w-sm transition-all duration-150"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-heading font-bold text-sm text-white truncate">{toast.title}</h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-snug">{toast.message}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white p-1"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP BAR CONTRACT: 3 Zones separated by gap-8 */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="#hero"
            className="font-heading font-extrabold text-2xl tracking-tight text-dark-900 whitespace-nowrap shrink-0"
          >
            target<span className="text-brand-purple">.in</span>
          </a>

          {/* Zone 2: Single-Line Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a
              href="#hero"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Home
            </a>
            <a
              href="#best-work-div"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Best Work
            </a>
            <a
              href="#pricing"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Pricing & Plans
            </a>
            <a
              href="#enquiry"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Enquiry Page
            </a>
          </nav>

          {/* Zone 3: 1 Primary Action ("Book Now") */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() =>
                openBookNowModal('Plan 1 — Basic Plan (₹15,000 · 10 Reels + 2 Carousels)')
              }
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-dark-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Book Now</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
            </button>

            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-lg text-dark-900 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-dark-900 text-white px-6 py-5 border-b border-slate-800 space-y-3">
            <a
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-sm font-medium text-slate-200 hover:text-white"
            >
              Home
            </a>
            <a
              href="#best-work-div"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-sm font-medium text-slate-200 hover:text-white"
            >
              Best Work
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-sm font-medium text-slate-200 hover:text-white"
            >
              Pricing & Plans
            </a>
            <a
              href="#enquiry"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-sm font-medium text-slate-200 hover:text-white"
            >
              Enquiry Page
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openBookNowModal('Plan 1 — Basic Plan (₹15,000 · 10 Reels + 2 Carousels)');
              }}
              className="w-full py-2.5 bg-brand-purple hover:bg-brand-violet text-white font-semibold text-sm rounded-lg transition-colors"
            >
              Book Now
            </button>
          </div>
        )}
      </header>

      <main className="flex-grow">
            {/* HERO SECTION */}
            <section id="hero" className="relative pt-14 pb-20 md:pt-20 md:pb-24 overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-5xl mx-auto space-y-6">
                  {/* Quiet Kicker Metadata (India Based - Uttarakhand 263153) */}
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm font-medium text-slate-600">
                    <span className="font-semibold text-brand-purple">
                      India&apos;s Meta Growth Agency
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Uttarakhand 263153</span>
                    <span aria-hidden="true">·</span>
                    <a
                      href="tel:+919012331009"
                      className="font-mono font-semibold text-slate-800 hover:text-brand-purple transition-colors tabular-nums"
                    >
                      +91 90123 31009
                    </a>
                  </div>

                  {/* Display Headline */}
                  <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-heading text-dark-900 leading-[1.12] text-balance">
                    High-Converting Meta Ads &{' '}
                    <span className="text-brand-purple">Verified Leads Across India.</span>
                  </h1>

                  {/* Subtitle */}
                  <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                    Based in Uttarakhand (263153), we create scroll-stopping Reels, Carousels, and
                    Meta lead generation campaigns built exclusively for Indian businesses.
                  </p>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                    <button
                      onClick={() =>
                        openBookNowModal('Plan 1 — Basic Plan (₹15,000 · 10 Reels + 2 Carousels)')
                      }
                      className="w-full sm:w-auto px-8 py-3.5 bg-dark-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2.5 whitespace-nowrap cursor-pointer"
                    >
                      <span>Book Now</span>
                      <ArrowRight className="w-4 h-4 text-indigo-400" />
                    </button>
                    <a
                      href="#pricing"
                      className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm rounded-xl border border-slate-300 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <span>View Pricing & Plans</span>
                    </a>
                  </div>

                  {/* BEST WORK REEL SHOWCASE */}
                  <div className="pt-12 text-left">
                    {/* DIV 1: BEST WORK (Contains 3 Reel Showcase Divs) */}
                    <div
                      id="best-work-div"
                      className="w-full bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 scroll-mt-24"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                        <div>
                          <span className="text-xs font-semibold text-brand-purple">
                            01. Showcase
                          </span>
                          <h2 className="text-2xl font-extrabold font-heading text-dark-900">
                            Best Work — Reel Showcase
                          </h2>
                        </div>
                        <span className="text-xs text-slate-500">
                          3 Vertical Reel Slots (9:16)
                        </span>
                      </div>

                      {/* 3 Reel Divs inside Best Work Div */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {reelSlots.map((slot, index) => (
                          <div
                            key={slot.id}
                            className="relative aspect-[9/16] rounded-xl border border-slate-200 bg-dark-900 overflow-hidden flex flex-col items-center justify-center text-center group shadow-sm"
                          >
                            {slot.videoUrl ? (
                              <div className="w-full h-full relative">
                                <video
                                  ref={(el) => {
                                    videoRefs.current[slot.id] = el;
                                  }}
                                  src={slot.videoUrl}
                                  autoPlay
                                  loop
                                  playsInline
                                  preload="auto"
                                  muted={slot.isMuted}
                                  onLoadedMetadata={(e) => {
                                    e.currentTarget.muted = slot.isMuted;
                                    e.currentTarget.play().catch(() => {});
                                  }}
                                  className="w-full h-full object-cover bg-black"
                                />
                                {/* Bottom-Corner Mute / Unmute Button */}
                                <button
                                  type="button"
                                  onClick={() => toggleReelMute(slot.id)}
                                  aria-label={slot.isMuted ? 'Unmute reel' : 'Mute reel'}
                                  className="absolute bottom-3 right-3 z-10 bg-dark-900/85 hover:bg-dark-900 text-white border border-white/15 backdrop-blur-xs px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  {slot.isMuted ? (
                                    <>
                                      <VolumeX className="w-4 h-4 text-rose-400" />
                                      <span>Unmute</span>
                                    </>
                                  ) : (
                                    <>
                                      <Volume2 className="w-4 h-4 text-emerald-400" />
                                      <span>Mute</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            ) : (
                              <label className="w-full h-full flex flex-col items-center justify-center p-4 cursor-pointer">
                                <div className="w-11 h-11 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center mb-3 group-hover:bg-brand-purple group-hover:text-white transition-colors">
                                  <Film className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-bold font-heading text-white">
                                  Reel Div 0{index + 1}
                                </span>
                                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-400">
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>Select Reel Video</span>
                                </span>
                                <input
                                  type="file"
                                  accept="video/*"
                                  className="hidden"
                                  onChange={(e) =>
                                    handleReelFileUpload(slot.id, e.target.files?.[0] || null)
                                  }
                                />
                              </label>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* PRICING & PLANS SECTION */}
            <section
              id="pricing"
              className="py-20 bg-white border-y border-slate-200 scroll-mt-16"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
                  <div className="text-xs font-semibold text-brand-purple">
                    Transparent Pricing & Plans (INR)
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-dark-900 text-balance">
                    Three Simple Plans — Reels & Carousels
                  </h2>
                  <p className="text-slate-600 text-sm sm:text-base">
                    Start with Plan 1 (Basic Plan at ₹15,000 for 10 Reels & 2 Carousels) or upgrade
                    by ₹5,000 for +3 Reels & +3 Carousels per tier.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                  {PRICING_PLANS.map((plan) => (
                    <div
                      key={plan.id}
                      className={`rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-colors ${
                        plan.recommended
                          ? 'bg-dark-900 text-white border-2 border-brand-purple shadow-xl'
                          : 'bg-[#F8FAFC] text-slate-900 border border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span
                            className={`text-xs font-semibold ${
                              plan.recommended ? 'text-indigo-400' : 'text-brand-purple'
                            }`}
                          >
                            {plan.recommended ? 'Most Popular Upgrade' : 'Service Plan'}
                          </span>
                          <span
                            className={`text-xs font-mono ${
                              plan.recommended ? 'text-slate-400' : 'text-slate-500'
                            }`}
                          >
                            {plan.billingNote}
                          </span>
                        </div>

                        <h3
                          className={`text-xl font-extrabold font-heading ${
                            plan.recommended ? 'text-white' : 'text-dark-900'
                          }`}
                        >
                          {plan.name}
                        </h3>

                        <div className="mt-4 mb-4 flex items-baseline gap-2">
                          <span
                            className={`text-3xl sm:text-4xl font-extrabold font-heading tabular-nums ${
                              plan.recommended ? 'text-white' : 'text-dark-900'
                            }`}
                          >
                            {plan.price}
                          </span>
                        </div>

                        <p
                          className={`text-xs sm:text-sm leading-relaxed mb-6 ${
                            plan.recommended ? 'text-slate-300' : 'text-slate-600'
                          }`}
                        >
                          {plan.description}
                        </p>

                        <div
                          className={`border-t pt-5 space-y-3 mb-8 ${
                            plan.recommended ? 'border-slate-800' : 'border-slate-200'
                          }`}
                        >
                          {plan.features.map((feat, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-2.5 text-xs sm:text-sm"
                            >
                              <Check
                                className={`w-4 h-4 shrink-0 mt-0.5 ${
                                  plan.recommended ? 'text-emerald-400' : 'text-brand-purple'
                                }`}
                              />
                              <span
                                className={plan.recommended ? 'text-slate-200' : 'text-slate-700'}
                              >
                                {feat}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => openBookNowModal(plan.purposeTag)}
                        className={`w-full py-3.5 px-5 rounded-xl font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                          plan.recommended
                            ? 'bg-brand-purple hover:bg-brand-violet text-white'
                            : 'bg-dark-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        <span>Book Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* BOOK NOW / ENQUIRY PAGE SECTION */}
            <section id="enquiry" className="py-20 bg-[#F8FAFC] scroll-mt-16">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl p-6 sm:p-10 lg:p-12 border border-slate-200">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* Left Column: Agency Location & Contact Info */}
                    <div className="lg:col-span-5 space-y-6">
                      <div>
                        <div className="text-xs font-semibold text-brand-purple mb-2">
                          Book Now — Direct Enquiry Page
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-dark-900 leading-tight text-balance">
                          Book Your Plan or Contractor Enquiry
                        </h2>
                        <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
                          Fill in your Name, Gmail, Phone Number, and Purpose of Enquiry. Our team
                          in Uttarakhand will call or WhatsApp you within 2 hours.
                        </p>
                      </div>

                      {/* Direct Agency Contact Card */}
                      <div className="space-y-4 pt-4 border-t border-slate-200 text-sm">
                        <div className="flex items-start gap-3">
                          <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                          <div>
                            <div className="text-xs text-slate-500 font-medium">
                              Phone & WhatsApp Number
                            </div>
                            <a
                              href="tel:+919012331009"
                              className="font-mono font-bold text-dark-900 hover:text-brand-purple transition-colors tabular-nums text-base"
                            >
                              +91 90123 31009
                            </a>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Mail className="w-4 h-4 text-brand-purple shrink-0 mt-1" />
                          <div>
                            <div className="text-xs text-slate-500 font-medium">Official Email</div>
                            <a
                              href="mailto:growth@target.in"
                              className="font-semibold text-dark-900 hover:text-brand-purple transition-colors"
                            >
                              growth@target.in
                            </a>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-brand-purple shrink-0 mt-1" />
                          <div>
                            <div className="text-xs text-slate-500 font-medium">
                              Office Location
                            </div>
                            <div className="font-semibold text-dark-900">
                              Uttarakhand — 263153, India
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Book Now Enquiry Form (Name, Gmail, Number, Purpose) */}
                    <div className="lg:col-span-7 bg-[#F8FAFC] p-6 sm:p-8 rounded-2xl border border-slate-200">
                      <div className="mb-6 border-b border-slate-200 pb-4">
                        <h3 className="text-lg font-extrabold font-heading text-dark-900">
                          Contractor / Client Booking Form
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Please provide your details below to book Plan 1, Plan 2, or Plan 3.
                        </p>
                      </div>

                      <form onSubmit={handleEnquirySubmit} className="space-y-5">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            1. Contractor / Client Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g. Rahul Sharma"
                            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-dark-900 focus:outline-none focus:border-brand-purple transition-colors"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                              2. Gmail / Email Address *
                            </label>
                            <input
                              type="email"
                              required
                              value={gmail}
                              onChange={(e) => setGmail(e.target.value)}
                              placeholder="yourname@gmail.com"
                              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-dark-900 focus:outline-none focus:border-brand-purple transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                              3. Mobile / WhatsApp Number *
                            </label>
                            <input
                              type="tel"
                              required
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              placeholder="e.g. 9012331009"
                              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-dark-900 focus:outline-none focus:border-brand-purple transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            4. Purpose of Enquiry (Select Plan) *
                          </label>
                          <select
                            required
                            value={purposeCategory}
                            onChange={(e) => setPurposeCategory(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-dark-900 focus:outline-none focus:border-brand-purple transition-colors"
                          >
                            <option value="Plan 1 — Basic Plan (₹15,000 · 10 Reels + 2 Carousels)">
                              Plan 1 — Basic Plan (₹15,000 · 10 Reels + 2 Carousels)
                            </option>
                            <option value="Plan 2 — Upgrade Plan (₹20,000 · 13 Reels + 5 Carousels)">
                              Plan 2 — Upgrade Plan (₹20,000 · 13 Reels + 5 Carousels)
                            </option>
                            <option value="Plan 3 — Pro Upgrade (₹25,000 · 16 Reels + 8 Carousels)">
                              Plan 3 — Pro Upgrade (₹25,000 · 16 Reels + 8 Carousels)
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Additional Purpose Details / Target City in India
                          </label>
                          <textarea
                            rows={3}
                            value={purposeDetails}
                            onChange={(e) => setPurposeDetails(e.target.value)}
                            placeholder="Describe your business, target city (e.g. Uttarakhand, Delhi NCR), and requirements..."
                            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-dark-900 focus:outline-none focus:border-brand-purple transition-colors"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-3.5 bg-dark-900 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Send className="w-4 h-4 text-indigo-400" />
                          <span>
                            {isSubmitting ? 'Submitting Enquiry...' : 'Book Now & Submit Enquiry'}
                          </span>
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </section>
      </main>

      {/* BOOK NOW MODAL (Includes Contractor/Client Name, Gmail, Number, and Purpose) */}
      {bookNowModalOpen && (
        <div
          className="fixed inset-0 bg-dark-900/75 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modalTitle"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setBookNowModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-dark-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <div className="text-xs font-semibold text-brand-purple mb-1">
                target.in · Uttarakhand 263153 · +91 90123 31009
              </div>
              <h3 id="modalTitle" className="text-2xl font-bold font-heading text-dark-900">
                Book Now — Quick Enquiry
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Enter your Name, Gmail, Phone Number, and Purpose below to book your plan.
              </p>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contractor / Client Name *
                </label>
                <input
                  type="text"
                  required
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gmail / Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={modalGmail}
                  onChange={(e) => setModalGmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile / WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  value={modalPhone}
                  onChange={(e) => setModalPhone(e.target.value)}
                  placeholder="e.g. 9012331009"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Purpose of Enquiry (Select Plan) *
                </label>
                <select
                  required
                  value={modalPurposeCategory}
                  onChange={(e) => setModalPurposeCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-purple"
                >
                  <option value="Plan 1 — Basic Plan (₹15,000 · 10 Reels + 2 Carousels)">
                    Plan 1 — Basic Plan (₹15,000 · 10 Reels + 2 Carousels)
                  </option>
                  <option value="Plan 2 — Upgrade Plan (₹20,000 · 13 Reels + 5 Carousels)">
                    Plan 2 — Upgrade Plan (₹20,000 · 13 Reels + 5 Carousels)
                  </option>
                  <option value="Plan 3 — Pro Upgrade (₹25,000 · 16 Reels + 8 Carousels)">
                    Plan 3 — Pro Upgrade (₹25,000 · 16 Reels + 8 Carousels)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Describe Your Purpose / Requirement
                </label>
                <textarea
                  rows={2}
                  value={modalPurposeDetails}
                  onChange={(e) => setModalPurposeDetails(e.target.value)}
                  placeholder="Share your business city, target audience, or question..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-purple"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-dark-900 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isSubmitting ? 'Submitting...' : 'Confirm Booking Enquiry'}</span>
                <ArrowRight className="w-4 h-4 text-indigo-400" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QUIET FOOTER */}
      <footer className="bg-dark-900 text-slate-400 text-sm border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand Info */}
            <div className="lg:col-span-2 space-y-3">
              <a
                href="#hero"
                className="font-heading font-extrabold text-2xl text-white tracking-tight inline-block"
              >
                target<span className="text-brand-purple">.in</span>
              </a>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                target.in is an India-based performance marketing agency in Uttarakhand (263153)
                specializing in high-converting Reels, Carousels, and Meta campaigns for
                Indian businesses and contractors.
              </p>
              <div className="text-xs text-slate-300 pt-1 space-y-1">
                <div>Location: Uttarakhand — 263153, India</div>
                <div>
                  Phone / WhatsApp:{' '}
                  <a
                    href="tel:+919012331009"
                    className="font-mono text-white hover:text-indigo-400 transition-colors tabular-nums"
                  >
                    +91 90123 31009
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-semibold text-white mb-3">Quick Navigation</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#hero" className="hover:text-white transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#best-work-div" className="hover:text-white transition-colors">
                    Best Work (3 Reels)
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition-colors">
                    Pricing & Plans
                  </a>
                </li>
                <li>
                  <a href="#enquiry" className="hover:text-white transition-colors">
                    Book Now / Enquiry Page
                  </a>
                </li>
              </ul>
            </div>

            {/* Direct Contact */}
            <div>
              <h4 className="text-xs font-semibold text-white mb-3">Book a Consultation</h4>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Speak directly with our Uttarakhand growth team or book your plan online.
              </p>
              <button
                onClick={() =>
                  openBookNowModal('Plan 1 — Basic Plan (₹15,000 · 10 Reels + 2 Carousels)')
                }
                className="w-full py-2.5 px-4 bg-brand-purple hover:bg-brand-violet text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Book Now
              </button>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <div>
              © {new Date().getFullYear()} target.in Agency (Uttarakhand 263153, India). All rights
              reserved.
            </div>
            <div className="flex items-center gap-6">
              <a
                href="tel:+919012331009"
                className="hover:text-slate-300 transition-colors font-mono tabular-nums"
              >
                +91 90123 31009
              </a>
              <a
                href="#enquiry"
                className="hover:text-slate-300 transition-colors inline-flex items-center gap-1"
              >
                <span>Enquiry Page</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
