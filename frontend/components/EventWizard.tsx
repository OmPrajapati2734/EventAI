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
} from './ui/Icons';

interface EventWizardProps {
  onSubmit: (data: SetupWizardData) => Promise<void>;
  isLoading: boolean;
  onAnnounce?: (msg: string) => void;
}

const EVENT_ARCHETYPES: Array<{
  type: EventType;
  title: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
  defaultTitle: string;
  defaultBudget: number;
  defaultGuests: number;
  curatedPills: string[];
}> = [
  {
    type: 'wedding',
    title: 'Dream Wedding',
    badge: 'Ceremonial & Reception',
    description:
      'Full orchestration of ceremony vows, catering banquet, floral styling, photo/video coverage, and evening reception.',
    icon: <Heart className="w-6 h-6 text-violet-600" aria-hidden="true" />,
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
    icon: <Building2 className="w-6 h-6 text-violet-600" aria-hidden="true" />,
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

export function EventWizard({ onSubmit, isLoading, onAnnounce }: EventWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [title, setTitle] = useState(EVENT_ARCHETYPES[0].defaultTitle);
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 4);
    return d.toISOString().split('T')[0];
  });
  const [guestCount, setGuestCount] = useState<number>(EVENT_ARCHETYPES[0].defaultGuests);
  const [budgetLimit, setBudgetLimit] = useState<number>(EVENT_ARCHETYPES[0].defaultBudget);
  const [currency, setCurrency] = useState<string>('USD');
  const [selectedPills, setSelectedPills] = useState<string[]>(['Garden Romance', 'Modern Minimalist']);
  const [culturalContext, setCulturalContext] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeArchetype = EVENT_ARCHETYPES.find((a) => a.type === eventType) || EVENT_ARCHETYPES[0];

  const handleSelectEventType = (type: EventType) => {
    setEventType(type);
    const arch = EVENT_ARCHETYPES.find((a) => a.type === type);
    if (arch) {
      setTitle(arch.defaultTitle);
      setBudgetLimit(arch.defaultBudget);
      setGuestCount(arch.defaultGuests);
      setSelectedPills(arch.curatedPills.slice(0, 2));
      onAnnounce?.(`Selected ${arch.title}.`);
    }
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
        const selectedDate = new Date(date);
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

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Accessible Stepper Header */}
      <nav aria-label="Setup Wizard Progress" className="mb-8">
        <ol className="grid grid-cols-3 gap-3 md:gap-6">
          {[
            { num: 1, label: 'Celebration Type', desc: 'Select Archetype' },
            { num: 2, label: 'Parameters', desc: 'Scale & Budget' },
            { num: 3, label: 'Theme & Vibe', desc: 'Aesthetic Styling' },
          ].map((s) => {
            const isCurrent = step === s.num;
            const isComplete = step > s.num;
            return (
              <li
                key={s.num}
                className={`relative flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-violet-50/80 border-violet-400 text-violet-950 shadow-sm ring-1 ring-violet-400'
                    : isComplete
                      ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                      : 'bg-white border-slate-200 text-slate-500'
                }`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    isCurrent
                      ? 'bg-violet-600 text-white'
                      : isComplete
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 border border-slate-300'
                  }`}
                >
                  {isComplete ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider font-semibold opacity-70">
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

      {/* Main Form Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-10 transition-all">
        <form onSubmit={handleSubmit} noValidate>
          {/* STEP 1: Celebration Archetype */}
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
                      className={`relative flex flex-col justify-between p-5 rounded-xl border-2 cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 ${
                        isSelected
                          ? 'border-violet-600 bg-violet-50/60 shadow-md shadow-violet-100'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className={`p-2.5 rounded-lg border ${
                              isSelected
                                ? 'bg-violet-100 border-violet-200'
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
                            isSelected ? 'text-violet-700' : 'text-slate-700'
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
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 shadow-sm transition-all"
                >
                  Configure Parameters
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </fieldset>
          )}

          {/* STEP 2: Core Parameters */}
          {step === 2 && (
            <fieldset className="space-y-6">
              <legend className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Scale, Budget & Schedule
              </legend>
              <p className="text-sm text-slate-600">
                Define the financial envelope and headcount for your {activeArchetype.title.toLowerCase()}.
              </p>

              <div className="space-y-5 pt-2">
                {/* Title */}
                <div>
                  <label htmlFor="event-title" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Celebration Name <span className="text-rose-600">*</span>
                  </label>
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
                  {/* Date */}
                  <div>
                    <label htmlFor="event-date" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Event Date <span className="text-rose-600">*</span>
                    </label>
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
                    <label htmlFor="event-guests" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Guest Count <span className="text-rose-600">*</span>
                    </label>
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

                  {/* Currency & Budget */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="event-budget" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Total Budget Limit <span className="text-rose-600">*</span>
                      </label>
                      <div className="flex items-center gap-1" role="group" aria-label="Select Currency">
                        {CURRENCIES.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => setCurrency(c.code)}
                            className={`px-1.5 py-0.5 rounded text-[11px] font-bold border transition-colors ${
                              currency === c.code
                                ? 'bg-violet-600 text-white border-violet-600'
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
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
                        type="number"
                        min={100}
                        step={100}
                        value={budgetLimit}
                        onChange={(e) => setBudgetLimit(Math.max(1, parseInt(e.target.value, 10) || 0))}
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

                {/* Per-Guest Benchmark Calculation */}
                {budgetLimit > 0 && guestCount > 0 && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                    <span className="font-medium flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-violet-600" />
                      Calculated Per-Guest Allocation:
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {currency} {Math.round(budgetLimit / guestCount).toLocaleString()} / guest
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-6 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 shadow-sm transition-all"
                >
                  Customize Vibe & Themes
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </fieldset>
          )}

          {/* STEP 3: Vibe & Aesthetic Preferences */}
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
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 ${
                            isSelected
                              ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
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
              <div className="p-4 rounded-xl bg-violet-50/70 border border-violet-200 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-violet-900">
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

              <div className="pt-6 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 disabled:opacity-50 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 shadow-lg shadow-violet-600/25 disabled:opacity-75 transition-all"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
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
