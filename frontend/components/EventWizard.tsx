'use client';

import React, { useState } from 'react';
import type { EventType, SetupWizardData } from '../lib/types';
import {
  Heart,
  PartyPopper,
  Building2,
  Calendar,
  Users,
  DollarSign,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Tag,
  Shuffle,
  Crown,
  Gem,
  Zap,
} from './ui/Icons';

interface EventWizardProps {
  onSubmit: (data: SetupWizardData) => Promise<void>;
  isLoading: boolean;
  onAnnounce?: (msg: string) => void;
}

interface ArchetypeConfig {
  type: EventType;
  title: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
  defaultTitle: string;
  defaultBudget: number;
  defaultGuests: number;
  curatedPills: string[];
}

const EVENT_ARCHETYPES: ArchetypeConfig[] = [
  {
    type: 'wedding',
    title: 'Dream Wedding',
    badge: 'Ceremonial & Reception',
    description:
      'Full orchestration of ceremony vows, catering banquet, floral styling, photo/video coverage, and evening reception.',
    icon: <Heart className="w-6 h-6 text-rose-600" aria-hidden="true" />,
    defaultTitle: 'Avery & Jordan Wedding Celebration',
    defaultBudget: 35000,
    defaultGuests: 120,
    curatedPills: ['Rustic Boho', 'Garden Romance', 'Modern Minimalist', 'Tuscan Sunset', 'Black Tie Luxury'],
  },
  {
    type: 'birthday',
    title: 'Milestone Birthday',
    badge: 'Dynamic & Interactive',
    description:
      'Curated celebration with lounge venues, high-energy entertainment, custom bakery cake toasts, and themed party favors.',
    icon: <PartyPopper className="w-6 h-6 text-violet-600" aria-hidden="true" />,
    defaultTitle: 'Maya 30th Milestone Birthday Gala',
    defaultBudget: 8500,
    defaultGuests: 50,
    curatedPills: ['Tech Neon', 'Retro Arcade', 'Golden Glamour', 'Y2K Nostalgia', 'Cocktail Chic'],
  },
  {
    type: 'community',
    title: 'Community Gathering',
    badge: 'Civic & Cultural',
    description:
      'Public festivals with municipal permits, volunteer coordination, staging AV, cultural concessions, and waste logistics.',
    icon: <Building2 className="w-6 h-6 text-emerald-600" aria-hidden="true" />,
    defaultTitle: 'Oakridge Annual Harvest & Arts Festival',
    defaultBudget: 22000,
    defaultGuests: 450,
    curatedPills: ['Charity Gala', 'Cultural Heritage', 'Eco Friendly', 'Artisan Fair', 'Neighborhood Block Party'],
  },
];

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'INR', symbol: '₹', label: 'INR (₹)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
];

/**
 * 1. Dynamic Event-Based Adaptive Theming Configurations
 */
const THEME_STYLES: Record<
  EventType,
  {
    bgGradient: string;
    borderColor: string;
    cardBorder: string;
    subheadingBadge: string;
    badgeClass: string;
    accentText: string;
    accentBg: string;
    accentHover: string;
    accentRing: string;
    activeProgress: string;
    activeProgressNum: string;
    primaryBtn: string;
  }
> = {
  wedding: {
    bgGradient: 'bg-gradient-to-br from-rose-50/50 via-white to-amber-50/30',
    borderColor: 'border-rose-100',
    cardBorder: 'border-rose-200/70',
    subheadingBadge: '✨ Romantic & Elegant Curation',
    badgeClass: 'bg-rose-100/90 text-rose-900 border-rose-200',
    accentText: 'text-rose-600',
    accentBg: 'bg-rose-600',
    accentHover: 'hover:bg-rose-700',
    accentRing: 'focus-visible:ring-rose-500',
    activeProgress: 'bg-rose-50/90 border-rose-400 text-rose-950 shadow-xs ring-1 ring-rose-400',
    activeProgressNum: 'bg-rose-600 text-white',
    primaryBtn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25',
  },
  birthday: {
    bgGradient: 'bg-gradient-to-br from-violet-50/50 via-white to-fuchsia-50/30',
    borderColor: 'border-violet-100',
    cardBorder: 'border-violet-200/70',
    subheadingBadge: '🎉 High Energy & Milestone Celebration',
    badgeClass: 'bg-violet-100/90 text-violet-900 border-violet-200',
    accentText: 'text-violet-600',
    accentBg: 'bg-violet-600',
    accentHover: 'hover:bg-violet-700',
    accentRing: 'focus-visible:ring-violet-500',
    activeProgress: 'bg-violet-50/90 border-violet-400 text-violet-950 shadow-xs ring-1 ring-violet-400',
    activeProgressNum: 'bg-violet-600 text-white',
    primaryBtn: 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-600/25',
  },
  community: {
    bgGradient: 'bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30',
    borderColor: 'border-emerald-100',
    cardBorder: 'border-emerald-200/70',
    subheadingBadge: '🤝 Civic & Community Impact Gathering',
    badgeClass: 'bg-emerald-100/90 text-emerald-900 border-emerald-200',
    accentText: 'text-emerald-600',
    accentBg: 'bg-emerald-600',
    accentHover: 'hover:bg-emerald-700',
    accentRing: 'focus-visible:ring-emerald-500',
    activeProgress: 'bg-emerald-50/90 border-emerald-400 text-emerald-950 shadow-xs ring-1 ring-emerald-400',
    activeProgressNum: 'bg-emerald-600 text-white',
    primaryBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25',
  },
};

/**
 * 2. "One-Click Quick Fill" Demo Scenarios (For Hackathon Judges)
 */
interface DemoPreset {
  id: string;
  name: string;
  badgeLabel: string;
  eventType: EventType;
  title: string;
  guestCount: number;
  budgetLimit: number;
  currency: string;
  daysAhead: number;
  selectedPills: string[];
  culturalContext: string;
}

const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'preset-wedding',
    name: 'Destination Wedding (120 guests, $35,000)',
    badgeLabel: '💍 Destination Wedding',
    eventType: 'wedding',
    title: 'Avery & Jordan Destination Wedding in Tuscany',
    guestCount: 120,
    budgetLimit: 35000,
    currency: 'USD',
    daysAhead: 120, // ~4 months ahead
    selectedPills: ['Garden Romance', 'Tuscan Sunset', 'Black Tie Luxury'],
    culturalContext: 'Scenic sunset ceremony in Chianti vineyard with Italian string quartet and farm-to-table banquet.',
  },
  {
    id: 'preset-birthday',
    name: '30th Birthday Bash (45 guests, $4,500)',
    badgeLabel: '🎉 30th Birthday Bash',
    eventType: 'birthday',
    title: "Maya's Golden 30th Extravaganza",
    guestCount: 45,
    budgetLimit: 4500,
    currency: 'USD',
    daysAhead: 90, // ~3 months ahead
    selectedPills: ['Tech Neon', 'Cocktail Chic', 'Golden Glamour'],
    culturalContext: 'High-energy rooftop lounge with neon cocktails, DJ live set, and interactive photo booth.',
  },
  {
    id: 'preset-community',
    name: 'Charity Tech Meetup & Gala (250 guests, $15,000)',
    badgeLabel: '🤝 Charity Tech Meetup & Gala',
    eventType: 'community',
    title: 'Oakridge Annual Charity Tech Meetup & Gala',
    guestCount: 250,
    budgetLimit: 15000,
    currency: 'USD',
    daysAhead: 150, // ~5 months ahead
    selectedPills: ['Charity Gala', 'Tech Neon', 'Eco Friendly'],
    culturalContext: 'Keynote amphitheater, livestream AV setup, silent charity auction, and zero-waste catering.',
  },
];

/**
 * 4. Realistic Name Suggestions
 */
const NAME_SUGGESTIONS: Record<EventType, string[]> = {
  wedding: [
    "Avery & Jordan's Coastal Sunset Vows",
    "Maya & Liam's Tuscan Vineyard Wedding",
    "Elena & Marcus's Black-Tie Botanical Gala",
    "Sophia & Noah's Garden Romance Celebration",
    "Chloe & David's Modern Minimalist Union",
    "Amara & Julian's Golden Hour Nuptials",
  ],
  birthday: [
    "Maya's Golden 30th Extravaganza",
    "Marcus's Electric Neon 30th Lounge",
    "Julian's Retro Arcade & Cocktails Bash",
    "Serena's Y2K Nostalgia Milestone Night",
    "Lucas's High-Energy Milestone Soirée",
    "Zara's Velvet & Champagne 25th Gala",
  ],
  community: [
    "Oakridge Annual Charity Tech Meetup & Gala",
    "Greenwood Civic Innovation & Arts Gathering",
    "Metro Youth STEM & Culture Expo 2027",
    "Riverdale Eco-Heritage Harvest Festival",
    "Downtown Artisan & Community Unity Fair",
    "Civic Future Sustainable Cities Forum",
  ],
};

function getFutureDateString(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getDaysRemainingBadge(dateString: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length !== 3) return '';
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  const target = new Date(y, m, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return '⚠️ Past date';
  if (diffDays === 0) return '📅 Today';
  if (diffDays === 1) return '📅 Tomorrow';
  return `📅 ${diffDays} days from today`;
}

export function EventWizard({ onSubmit, isLoading, onAnnounce }: EventWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [title, setTitle] = useState(EVENT_ARCHETYPES[0].defaultTitle);
  const [date, setDate] = useState(() => getFutureDateString(122));
  const [guestCount, setGuestCount] = useState<number>(EVENT_ARCHETYPES[0].defaultGuests);
  const [budgetLimit, setBudgetLimit] = useState<number>(EVENT_ARCHETYPES[0].defaultBudget);
  const [budgetInputDisplay, setBudgetInputDisplay] = useState<string>(() =>
    EVENT_ARCHETYPES[0].defaultBudget.toLocaleString()
  );
  const [isBudgetFocused, setIsBudgetFocused] = useState<boolean>(false);
  const [currency, setCurrency] = useState<string>('USD');
  const [selectedPills, setSelectedPills] = useState<string[]>(['Garden Romance', 'Modern Minimalist']);
  const [culturalContext, setCulturalContext] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeArchetype = EVENT_ARCHETYPES.find((a) => a.type === eventType) || EVENT_ARCHETYPES[0];
  const activeTheme = THEME_STYLES[eventType] || THEME_STYLES.wedding;

  const handleSelectEventType = (type: EventType) => {
    setEventType(type);
    const arch = EVENT_ARCHETYPES.find((a) => a.type === type);
    if (arch) {
      setTitle(arch.defaultTitle);
      setBudgetLimit(arch.defaultBudget);
      setBudgetInputDisplay(arch.defaultBudget.toLocaleString());
      setGuestCount(arch.defaultGuests);
      setSelectedPills(arch.curatedPills.slice(0, 2));
      onAnnounce?.(`Selected ${arch.title}.`);
    }
  };

  const handleApplyPreset = (preset: DemoPreset) => {
    setEventType(preset.eventType);
    setTitle(preset.title);
    setGuestCount(preset.guestCount);
    setBudgetLimit(preset.budgetLimit);
    setBudgetInputDisplay(preset.budgetLimit.toLocaleString());
    setCurrency(preset.currency);
    setDate(getFutureDateString(preset.daysAhead));
    setSelectedPills(preset.selectedPills);
    setCulturalContext(preset.culturalContext);
    setErrors({});
    onAnnounce?.(`Loaded quick demo scenario: ${preset.name}`);
  };

  const handleSuggestName = () => {
    const list = NAME_SUGGESTIONS[eventType] || NAME_SUGGESTIONS.wedding;
    const filtered = list.filter((n) => n !== title);
    const randomPick = filtered[Math.floor(Math.random() * filtered.length)] || list[0];
    setTitle(randomPick);
    onAnnounce?.(`Suggested celebration name: ${randomPick}`);
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/[^0-9]/g, '');
    const num = parseInt(rawDigits, 10) || 0;
    setBudgetLimit(num);
    setBudgetInputDisplay(rawDigits);
  };

  const handleBudgetFocus = () => {
    setIsBudgetFocused(true);
    setBudgetInputDisplay(budgetLimit > 0 ? String(budgetLimit) : '');
  };

  const handleBudgetBlur = () => {
    setIsBudgetFocused(false);
    setBudgetInputDisplay(budgetLimit > 0 ? budgetLimit.toLocaleString() : '');
  };

  const togglePill = (pill: string) => {
    setSelectedPills((prev) => {
      const exists = prev.includes(pill);
      const next = exists ? prev.filter((p) => p !== pill) : [...prev, pill];
      onAnnounce?.(`${exists ? 'Removed' : 'Added'} theme tag ${pill}.`);
      return next;
    });
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!eventType) newErrors.eventType = 'Please select a celebration archetype.';
    }

    if (currentStep === 2) {
      if (!title.trim()) newErrors.title = 'Event title is required.';
      if (!date) {
        newErrors.date = 'Event date is required.';
      } else {
        const parts = date.split('-').map(Number);
        const selectedDate = new Date(parts[0], parts[1] - 1, parts[2]);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          newErrors.date = 'Event date must be in the future.';
        }
      }
      if (!guestCount || guestCount <= 0) {
        newErrors.guestCount = 'Guest count must be at least 1 person.';
      }
      if (!budgetLimit || budgetLimit <= 0) {
        newErrors.budgetLimit = 'Budget limit must be greater than zero.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : prev));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setErrors({});
    setStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : prev));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2)) return;

    const fullPreferences = [
      selectedPills.length > 0 ? `Themes: ${selectedPills.join(', ')}` : '',
      culturalContext.trim(),
    ]
      .filter(Boolean)
      .join('. ');

    const payload: SetupWizardData = {
      title: title.trim(),
      eventType,
      date: new Date(date).toISOString(),
      guestCount: Number(guestCount),
      budgetLimit: Number(budgetLimit),
      currency,
      culturalContext: culturalContext.trim() || undefined,
      userPreferences: fullPreferences || undefined,
      vibePills: selectedPills,
    };

    await onSubmit(payload);
  };

  // 3. Realistic Financial Intelligence & Live Per-Guest Calculation
  const perGuestAllocation = guestCount > 0 ? Math.round(budgetLimit / guestCount) : 0;

  const getBenchmarkHealth = (perGuest: number) => {
    if (perGuest < 50) {
      return {
        tag: '⚡ Lean / Budget-Friendly',
        badgeClass: 'bg-amber-100/90 text-amber-900 border-amber-300',
        note: 'Great for intimate DIY or community gatherings',
        icon: <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />,
      };
    }
    if (perGuest <= 250) {
      return {
        tag: '💎 Balanced & Moderate',
        badgeClass: 'bg-emerald-100/90 text-emerald-900 border-emerald-300',
        note: 'Covers standard venue, buffet catering & entertainment',
        icon: <Gem className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />,
      };
    }
    return {
      tag: '👑 Premium / Luxury Tier',
      badgeClass: 'bg-violet-100/90 text-violet-900 border-violet-300',
      note: 'Accommodates full-service catering, live band & bespoke decor',
      icon: <Crown className="w-3.5 h-3.5 text-violet-600 shrink-0" aria-hidden="true" />,
    };
  };

  const benchmark = getBenchmarkHealth(perGuestAllocation);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 4. Multi-Step Progress Tracker: [1. Event Type] -> [2. Scale & Budget] -> [3. Vibe & Themes] -> [4. AI Masterplan] */}
      <nav aria-label="Setup Wizard Progress" className="w-full">
        <ol className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { num: 1, label: '1. Event Type', desc: 'Select Archetype' },
            { num: 2, label: '2. Scale & Budget', desc: 'Parameters & Health' },
            { num: 3, label: '3. Vibe & Themes', desc: 'Aesthetic Styling' },
            { num: 4, label: '4. AI Masterplan', desc: 'Gemini Synthesis' },
          ].map((s) => {
            const isCurrent = step === s.num && !isLoading;
            const isComplete = step > s.num || (isLoading && s.num <= 3);
            const isFinalSynthesizing = s.num === 4 && isLoading;

            return (
              <li
                key={s.num}
                className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  isFinalSynthesizing
                    ? 'bg-violet-100/90 border-violet-400 text-violet-950 shadow-sm ring-2 ring-violet-500 animate-pulse'
                    : isCurrent
                      ? activeTheme.activeProgress
                      : isComplete
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                        : 'bg-white border-slate-200 text-slate-500'
                }`}
                aria-current={isCurrent || isFinalSynthesizing ? 'step' : undefined}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    isFinalSynthesizing
                      ? 'bg-violet-600 text-white'
                      : isCurrent
                        ? activeTheme.activeProgressNum
                        : isComplete
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600 border border-slate-300'
                  }`}
                >
                  {isFinalSynthesizing ? (
                    <div
                      className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                      aria-hidden="true"
                    />
                  ) : isComplete ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    s.num
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider font-semibold opacity-70">
                    Step {s.num}
                  </p>
                  <p className="text-xs sm:text-sm font-bold truncate text-slate-900">
                    {s.label}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Main Form Container with Dynamic Event-Based Adaptive Theming */}
      <div
        className={`rounded-2xl border ${activeTheme.cardBorder} ${activeTheme.bgGradient} shadow-xl shadow-slate-200/50 p-6 sm:p-10 transition-all duration-300`}
      >
        {/* Top Header Row: Adaptive Badge + Quick Demo Presets */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${activeTheme.badgeClass}`}
            >
              {activeTheme.subheadingBadge}
            </span>
          </div>

          {/* Quick Demo Scenarios Bar for Hackathon Judges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
              <span>⚡ Quick Demo Scenarios:</span>
            </span>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Quick Demo Scenarios for Judges">
              {DEMO_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-violet-700 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 transition-all shadow-xs"
                  title={`Quick Fill: ${preset.name}`}
                  aria-label={`Load demo preset: ${preset.name}`}
                >
                  {preset.badgeLabel}
                </button>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* ========================================================= */}
          {/* STEP 1: Celebration Archetype                             */}
          {/* ========================================================= */}
          {step === 1 && (
            <fieldset className="space-y-6">
              <legend className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Select Your Celebration Archetype
              </legend>
              <p className="text-sm text-slate-600">
                Choose the archetype that matches your vision. EventCraft uses domain-specific allocation algorithms tailored to each celebration type.
              </p>

              <div
                role="radiogroup"
                aria-label="Event Type Selection"
                className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2"
              >
                {EVENT_ARCHETYPES.map((arch) => {
                  const isSelected = eventType === arch.type;
                  return (
                    <div
                      key={arch.type}
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onClick={() => handleSelectEventType(arch.type)}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          handleSelectEventType(arch.type);
                        }
                      }}
                      className={`relative flex flex-col justify-between p-5 rounded-xl border-2 cursor-pointer transition-all focus:outline-none focus-visible:ring-2 ${activeTheme.accentRing} focus-visible:ring-offset-2 ${
                        isSelected
                          ? `border-violet-600 bg-white/90 shadow-md shadow-violet-100 ring-1 ring-violet-600/30`
                          : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className={`p-2.5 rounded-lg border ${
                              isSelected
                                ? 'bg-violet-100/90 border-violet-200'
                                : 'bg-slate-100 border-slate-200'
                            }`}
                          >
                            {arch.icon}
                          </div>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                              isSelected
                                ? 'bg-violet-100 text-violet-800 border-violet-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {arch.badge}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-2">
                          {arch.title}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {arch.description}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-500">Benchmark Model</span>
                        <span
                          className={`font-mono font-bold ${
                            isSelected ? activeTheme.accentText : 'text-slate-700'
                          }`}
                        >
                          ${arch.defaultBudget.toLocaleString()} • {arch.defaultGuests} guests
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {errors.eventType && (
                <p className="text-sm font-semibold text-rose-600 flex items-center gap-1.5" role="alert">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {errors.eventType}
                </p>
              )}

              <div className="pt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm focus:outline-none focus-visible:ring-2 ${activeTheme.accentRing} focus-visible:ring-offset-2 shadow-sm transition-all ${activeTheme.primaryBtn}`}
                >
                  Configure Parameters
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </fieldset>
          )}

          {/* ========================================================= */}
          {/* STEP 2: Scale, Budget & Schedule                          */}
          {/* ========================================================= */}
          {step === 2 && (
            <fieldset className="space-y-6">
              <legend className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Scale, Budget & Schedule
              </legend>
              <p className="text-sm text-slate-600">
                Define the financial envelope and headcount for your {activeArchetype.title.toLowerCase()}.
              </p>

              <div className="space-y-5 pt-2">
                {/* Celebration Name with Suggest Name Button */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="event-title" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Celebration Name <span className="text-rose-600">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleSuggestName}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 transition-colors shadow-xs"
                      aria-label="Suggest realistic event title"
                      title="Generate realistic event name based on archetype"
                    >
                      <Shuffle className="w-3.5 h-3.5 text-violet-600" aria-hidden="true" />
                      <span>Suggest Name</span>
                    </button>
                  </div>
                  <input
                    id="event-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Avery & Jordan Wedding Celebration"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-500/20 text-sm font-medium"
                    aria-invalid={!!errors.title}
                    aria-describedby={errors.title ? 'title-error' : undefined}
                  />
                  {errors.title && (
                    <p id="title-error" className="mt-1.5 text-xs font-semibold text-rose-600 flex items-center gap-1" role="alert">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* 3-Column Inputs: Date, Guests, Budget */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Date Picker with Timeline Feasibility Badge */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="event-date" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Event Date <span className="text-rose-600">*</span>
                      </label>
                      {date && (
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                            getDaysRemainingBadge(date).includes('⚠️')
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-white text-slate-700 border-slate-200 shadow-xs'
                          }`}
                        >
                          {getDaysRemainingBadge(date)}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <input
                        id="event-date"
                        type="date"
                        value={date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-500/20 text-sm font-medium"
                        aria-invalid={!!errors.date}
                        aria-describedby={errors.date ? 'date-error' : undefined}
                      />
                    </div>
                    {errors.date && (
                      <p id="date-error" className="mt-1.5 text-xs font-semibold text-rose-600 flex items-center gap-1" role="alert">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.date}
                      </p>
                    )}
                  </div>

                  {/* Guests */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="event-guests" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Guest Count <span className="text-rose-600">*</span>
                      </label>
                      <span className="text-[11px] font-semibold text-slate-500">Headcount</span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Users className="w-4 h-4" />
                      </div>
                      <input
                        id="event-guests"
                        type="number"
                        min={1}
                        max={100000}
                        value={guestCount}
                        onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-500/20 text-sm font-medium"
                        aria-invalid={!!errors.guestCount}
                        aria-describedby={errors.guestCount ? 'guests-error' : undefined}
                      />
                    </div>
                    {errors.guestCount && (
                      <p id="guests-error" className="mt-1.5 text-xs font-semibold text-rose-600 flex items-center gap-1" role="alert">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.guestCount}
                      </p>
                    )}
                  </div>

                  {/* Budget with Thousand-Separator Auto-Formatting on Blur */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="event-budget" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Budget Limit <span className="text-rose-600">*</span>
                      </label>
                      <div className="flex items-center gap-1" role="group" aria-label="Select Currency">
                        {CURRENCIES.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => setCurrency(c.code)}
                            className={`px-1.5 py-0.5 rounded text-[11px] font-bold border transition-colors ${
                              currency === c.code
                                ? `${activeTheme.accentBg} text-white border-transparent`
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                            aria-pressed={currency === c.code}
                          >
                            {c.symbol}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-sm">
                        {CURRENCIES.find((c) => c.code === currency)?.symbol || '$'}
                      </div>
                      <input
                        id="event-budget"
                        type="text"
                        inputMode="numeric"
                        value={
                          isBudgetFocused
                            ? budgetInputDisplay
                            : budgetLimit > 0
                              ? budgetLimit.toLocaleString()
                              : ''
                        }
                        onFocus={handleBudgetFocus}
                        onBlur={handleBudgetBlur}
                        onChange={handleBudgetChange}
                        placeholder="e.g. 35,000"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-500/20 text-sm font-medium font-mono"
                        aria-invalid={!!errors.budgetLimit}
                        aria-describedby={errors.budgetLimit ? 'budget-error' : undefined}
                      />
                    </div>
                    {errors.budgetLimit && (
                      <p id="budget-error" className="mt-1.5 text-xs font-semibold text-rose-600 flex items-center gap-1" role="alert">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.budgetLimit}
                      </p>
                    )}
                  </div>
                </div>

                {/* 3. Upgraded Interactive Mini-Analytics Banner with Live Per-Guest Metric */}
                {budgetLimit > 0 && guestCount > 0 && (
                  <div
                    className="p-4 sm:p-5 rounded-2xl bg-white/80 border border-slate-200/90 shadow-xs space-y-4 transition-all"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {/* Top Row: Metric & Benchmark Health Tag */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                          Calculated Per-Guest Allocation
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                            {currency} {perGuestAllocation.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">/ guest</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end gap-1">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${benchmark.badgeClass}`}
                        >
                          {benchmark.icon}
                          <span>{benchmark.tag}</span>
                        </span>
                        <p className="text-[11px] text-slate-600 max-w-xs sm:text-right font-medium">
                          {benchmark.note}
                        </p>
                      </div>
                    </div>

                    {/* Mini Projected Industry Distribution Bar */}
                    <div className="space-y-2 pt-3 border-t border-slate-200/80">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                        <span className="uppercase tracking-wider">Projected Industry Budget Distribution</span>
                        <span className="text-slate-500 font-normal">Automated Allocation Split</span>
                      </div>

                      <div
                        className="h-3 w-full rounded-full overflow-hidden flex bg-slate-200 shadow-inner"
                        role="img"
                        aria-label="Projected industry budget distribution: 45% Venue & Food, 15% Photo & Video, 20% Decor & Audio, 20% Buffer & Contingency"
                      >
                        <div
                          style={{ width: '45%' }}
                          className="bg-violet-600 h-full transition-all duration-300"
                          title="Venue & Food: ~45%"
                        />
                        <div
                          style={{ width: '15%' }}
                          className="bg-sky-500 h-full transition-all duration-300"
                          title="Photo & Video: ~15%"
                        />
                        <div
                          style={{ width: '20%' }}
                          className="bg-amber-500 h-full transition-all duration-300"
                          title="Decor & Audio: ~20%"
                        />
                        <div
                          style={{ width: '20%' }}
                          className="bg-emerald-500 h-full transition-all duration-300"
                          title="Buffer & Contingency: ~20%"
                        />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-slate-200 shadow-xs">
                          <span className="w-2.5 h-2.5 rounded-sm bg-violet-600 shrink-0" aria-hidden="true" />
                          <div className="min-w-0">
                            <span className="block text-[10px] text-slate-500 uppercase font-semibold">
                              Venue & Food (~45%)
                            </span>
                            <span className="font-bold text-slate-900 font-mono text-xs">
                              {currency} {Math.round(budgetLimit * 0.45).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-slate-200 shadow-xs">
                          <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 shrink-0" aria-hidden="true" />
                          <div className="min-w-0">
                            <span className="block text-[10px] text-slate-500 uppercase font-semibold">
                              Photo & Video (~15%)
                            </span>
                            <span className="font-bold text-slate-900 font-mono text-xs">
                              {currency} {Math.round(budgetLimit * 0.15).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-slate-200 shadow-xs">
                          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 shrink-0" aria-hidden="true" />
                          <div className="min-w-0">
                            <span className="block text-[10px] text-slate-500 uppercase font-semibold">
                              Decor & Audio (~20%)
                            </span>
                            <span className="font-bold text-slate-900 font-mono text-xs">
                              {currency} {Math.round(budgetLimit * 0.20).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-slate-200 shadow-xs">
                          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shrink-0" aria-hidden="true" />
                          <div className="min-w-0">
                            <span className="block text-[10px] text-slate-500 uppercase font-semibold">
                              Buffer (~20%)
                            </span>
                            <span className="font-bold text-slate-900 font-mono text-xs">
                              {currency} {Math.round(budgetLimit * 0.20).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 flex items-center justify-between border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 transition-all shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm focus:outline-none focus-visible:ring-2 ${activeTheme.accentRing} focus-visible:ring-offset-2 shadow-sm transition-all ${activeTheme.primaryBtn}`}
                >
                  Customize Vibe & Themes
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </fieldset>
          )}

          {/* ========================================================= */}
          {/* STEP 3: Vibe & Aesthetic Preferences                      */}
          {/* ========================================================= */}
          {step === 3 && (
            <fieldset className="space-y-6">
              <legend className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Vibe, Aesthetics & Cultural Nuance
              </legend>
              <p className="text-sm text-slate-600">
                Select visual tags and provide cultural details so Google Gemini can generate contextually personalized recommendations.
              </p>

              {/* Multiselect Aesthetic Pills */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-violet-600" />
                  Aesthetic Style Tags (Multiselect)
                </label>
                <div className="flex flex-wrap gap-2 pt-1" role="group" aria-label="Aesthetic theme pills">
                  {[
                    ...activeArchetype.curatedPills,
                    'Rustic Boho',
                    'Tech Neon',
                    'Charity Gala',
                    'Minimalist Chic',
                    'Cultural Heritage',
                    'Eco Friendly',
                    'Golden Glamour',
                  ]
                    .filter((val, idx, arr) => arr.indexOf(val) === idx)
                    .map((pill) => {
                      const isSelected = selectedPills.includes(pill);
                      return (
                        <button
                          key={pill}
                          type="button"
                          onClick={() => togglePill(pill)}
                          aria-pressed={isSelected}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all focus:outline-none focus-visible:ring-2 ${activeTheme.accentRing} focus-visible:ring-offset-2 ${
                            isSelected
                              ? `${activeTheme.accentBg} text-white border-transparent shadow-sm`
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 inline mr-1 stroke-[3]" />}
                          {pill}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Cultural Context / Special Notes */}
              <div>
                <label htmlFor="cultural-context" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Cultural Context, Traditions or Special Requests (Optional)
                </label>
                <textarea
                  id="cultural-context"
                  rows={3}
                  value={culturalContext}
                  onChange={(e) => setCulturalContext(e.target.value)}
                  placeholder="e.g. Mediterranean vineyard dining with acoustic Italian folk music, or interactive zero-waste recycling stations."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-500/20 text-sm font-medium"
                />
              </div>

              {/* Summary Review Card */}
              <div className="p-4 rounded-xl bg-white/90 border border-slate-200/90 shadow-xs space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                  Ready to Orchestrate Masterplan:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block">Archetype:</span>
                    <strong className="text-slate-900 capitalize">{eventType}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Guests:</span>
                    <strong className="text-slate-900">{guestCount} attendees</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Target Budget:</span>
                    <strong className="text-slate-900 font-mono">
                      {currency} {budgetLimit.toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Date:</span>
                    <strong className="text-slate-900">{date}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex items-center justify-between border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 disabled:opacity-50 transition-all shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm focus:outline-none focus-visible:ring-2 ${activeTheme.accentRing} focus-visible:ring-offset-2 shadow-lg disabled:opacity-75 transition-all ${activeTheme.primaryBtn}`}
                >
                  {isLoading ? (
                    <>
                      <div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                        aria-hidden="true"
                      />
                      <span>Synthesizing Masterplan with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Event Masterplan</span>
                    </>
                  )}
                </button>
              </div>
            </fieldset>
          )}
        </form>
      </div>
    </div>
  );
}
