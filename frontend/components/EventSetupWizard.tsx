'use client';

import React, { useState } from 'react';
import type { SetupWizardData, EventType } from '../lib/types';
import {
  RingIcon,
  CakeIcon,
  FlagIcon,
  CalendarIcon,
  UsersIcon,
  WalletIcon,
  SparklesIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
} from './ui/Icons';

interface EventSetupWizardProps {
  onComplete: (data: SetupWizardData) => Promise<void>;
  isLoading: boolean;
  onAnnounce: (msg: string) => void;
}

export function EventSetupWizard({
  onComplete,
  isLoading,
  onAnnounce,
}: EventSetupWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [formData, setFormData] = useState<SetupWizardData>({
    title: '',
    eventType: 'wedding',
    date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ?? '',
    guestCount: 100,
    budgetLimit: 20000,
    currency: 'USD',
    culturalContext: '',
    userPreferences: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleEventTypeSelect = (type: EventType) => {
    setFormData((prev) => ({
      ...prev,
      eventType: type,
      title: prev.title.trim().length === 0
        ? type === 'wedding'
          ? 'Summer Garden Wedding'
          : type === 'birthday'
            ? 'Milestone Birthday Gala'
            : 'Neighborhood Harvest Festival'
        : prev.title,
    }));
    onAnnounce(`Selected ${type} event archetype.`);
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors['title'] = 'Event title is required.';
    }
    if (!formData.date) {
      newErrors['date'] = 'Please select a valid event date.';
    }
    if (formData.guestCount <= 0 || !Number.isInteger(formData.guestCount)) {
      newErrors['guestCount'] = 'Guest count must be at least 1 person.';
    }
    if (formData.budgetLimit <= 0) {
      newErrors['budgetLimit'] = 'Budget must be greater than zero.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (step === 1) {
      setStep(2);
      onAnnounce('Navigated to Step 2: Set event date, budget, and guest count.');
    } else if (step === 2) {
      if (validateStep2()) {
        setStep(3);
        onAnnounce('Navigated to Step 3: Provide creative themes and cultural context.');
      } else {
        onAnnounce('Please resolve the highlighted validation errors to proceed.');
      }
    }
  };

  const prevStep = () => {
    if (step > 1) {
      const nextStepNum = (step - 1) as 1 | 2;
      setStep(nextStepNum);
      onAnnounce(`Returned to Step ${nextStepNum}.`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) {
      setStep(2);
      return;
    }
    onAnnounce('Engaging Gemini GenAI to design your customized celebration plan...');
    await onComplete(formData);
  };

  const perGuestEstimate =
    formData.guestCount > 0 ? Math.round(formData.budgetLimit / formData.guestCount) : 0;

  return (
    <div className="w-full max-w-3xl mx-auto bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-glass p-6 md:p-8 text-slate-100 transition-all duration-300">
      {/* Accessible Step Progress Indicator */}
      <nav aria-label="Setup Wizard Steps Progress" className="mb-8">
        <ol className="flex items-center justify-between w-full">
          {[
            { num: 1, label: 'Archetype' },
            { num: 2, label: 'Budget & Date' },
            { num: 3, label: 'AI Inspiration' },
          ].map((s, idx) => (
            <li
              key={s.num}
              className={`flex items-center ${idx < 2 ? 'w-full' : ''}`}
              aria-current={step === s.num ? 'step' : undefined}
            >
              <div className="flex items-center space-x-3">
                <span
                  className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold transition-colors duration-200 ${
                    step === s.num
                      ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20 shadow-glow'
                      : step > s.num
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {step > s.num ? '✓' : s.num}
                </span>
                <span
                  className={`text-sm font-medium hidden sm:inline ${
                    step === s.num ? 'text-amber-400 font-semibold' : 'text-slate-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < 2 && (
                <div
                  className={`flex-1 h-0.5 mx-4 transition-colors duration-300 ${
                    step > s.num ? 'bg-emerald-600' : 'bg-slate-800'
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Main Wizard Form */}
      <form onSubmit={handleSubmit} noValidate>
        {/* STEP 1: EVENT TYPE SELECTION */}
        {step === 1 && (
          <fieldset className="space-y-6 animate-fade-in border-none p-0 m-0">
            <legend className="text-xl md:text-2xl font-bold text-slate-50 mb-1">
              What celebration are we orchestrating?
            </legend>
            <p className="text-slate-400 text-sm mb-6">
              Select your event archetype so our Gemini AI can tailor budget ratios, logistical milestones, and aesthetic themes.
            </p>

            <div
              role="radiogroup"
              aria-label="Event Archetype Selection"
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {/* Wedding Card */}
              <button
                type="button"
                id="archetype-wedding"
                role="radio"
                aria-checked={formData.eventType === 'wedding'}
                onClick={() => handleEventTypeSelect('wedding')}
                className={`p-5 rounded-xl border text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 group ${
                  formData.eventType === 'wedding'
                    ? 'border-fuchsia-500 bg-fuchsia-950/20 shadow-lg ring-1 ring-fuchsia-500/50'
                    : 'border-slate-800 bg-slate-800/40 hover:border-slate-700 hover:bg-slate-800/80'
                }`}
              >
                <div className="w-12 h-12 rounded-lg bg-fuchsia-500/10 text-fuchsia-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <RingIcon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg text-slate-100 mb-1">Wedding</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ceremonies, receptions, formal timelines, catering banquets, and floral aesthetics.
                </p>
              </button>

              {/* Birthday Card */}
              <button
                type="button"
                id="archetype-birthday"
                role="radio"
                aria-checked={formData.eventType === 'birthday'}
                onClick={() => handleEventTypeSelect('birthday')}
                className={`p-5 rounded-xl border text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 group ${
                  formData.eventType === 'birthday'
                    ? 'border-sky-500 bg-sky-950/20 shadow-lg ring-1 ring-sky-500/50'
                    : 'border-slate-800 bg-slate-800/40 hover:border-slate-700 hover:bg-slate-800/80'
                }`}
              >
                <div className="w-12 h-12 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <CakeIcon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg text-slate-100 mb-1">Birthday</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Milestone bashes, immersive entertainment, specialty cakes, activities, and party favors.
                </p>
              </button>

              {/* Community Gathering Card */}
              <button
                type="button"
                id="archetype-community"
                role="radio"
                aria-checked={formData.eventType === 'community'}
                onClick={() => handleEventTypeSelect('community')}
                className={`p-5 rounded-xl border text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 group ${
                  formData.eventType === 'community'
                    ? 'border-emerald-500 bg-emerald-950/20 shadow-lg ring-1 ring-emerald-500/50'
                    : 'border-slate-800 bg-slate-800/40 hover:border-slate-700 hover:bg-slate-800/80'
                }`}
              >
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <FlagIcon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg text-slate-100 mb-1">Community</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Neighborhood fests, volunteer schedules, stage audio/visual, civic safety, and food stalls.
                </p>
              </button>
            </div>
          </fieldset>
        )}

        {/* STEP 2: DETAILS, DATE, BUDGET & GUESTS */}
        {step === 2 && (
          <fieldset className="space-y-5 animate-fade-in border-none p-0 m-0">
            <legend className="text-xl md:text-2xl font-bold text-slate-50 mb-1">
              Event Details & Scope
            </legend>
            <p className="text-slate-400 text-sm mb-4">
              Specify your expected guest volume, timeline date, and target budget ceiling.
            </p>

            {/* Event Title */}
            <div>
              <label htmlFor="wizard-title" className="block text-sm font-medium text-slate-200 mb-1.5">
                Event Title <span className="text-amber-400">*</span>
              </label>
              <input
                id="wizard-title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Liam & Clara Sunset Vineyard Wedding"
                aria-invalid={Boolean(errors['title'])}
                aria-describedby={errors['title'] ? 'title-error' : undefined}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-950/60 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
              />
              {errors['title'] && (
                <p id="title-error" className="text-rose-400 text-xs mt-1.5 font-medium">
                  {errors['title']}
                </p>
              )}
            </div>

            {/* Date & Currency Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="wizard-date" className="block text-sm font-medium text-slate-200 mb-1.5">
                  Celebration Date <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="wizard-date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                    aria-invalid={Boolean(errors['date'])}
                    aria-describedby={errors['date'] ? 'date-error' : undefined}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-950/60 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                  />
                </div>
                {errors['date'] && (
                  <p id="date-error" className="text-rose-400 text-xs mt-1.5 font-medium">
                    {errors['date']}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="wizard-currency" className="block text-sm font-medium text-slate-200 mb-1.5">
                  Currency Code
                </label>
                <select
                  id="wizard-currency"
                  value={formData.currency}
                  onChange={(e) => setFormData((p) => ({ ...p, currency: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950/60 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                >
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                  <option value="CAD">CAD ($ - Canadian Dollar)</option>
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                </select>
              </div>
            </div>

            {/* Guest Count & Budget Limit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="wizard-guests" className="block text-sm font-medium text-slate-200 mb-1.5">
                  Expected Guests <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UsersIcon className="w-4 h-4" />
                  </span>
                  <input
                    id="wizard-guests"
                    type="number"
                    min="1"
                    max="50000"
                    value={formData.guestCount}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, guestCount: parseInt(e.target.value) || 0 }))
                    }
                    aria-invalid={Boolean(errors['guestCount'])}
                    aria-describedby={errors['guestCount'] ? 'guest-error' : undefined}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-950/60 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                  />
                </div>
                {errors['guestCount'] && (
                  <p id="guest-error" className="text-rose-400 text-xs mt-1.5 font-medium">
                    {errors['guestCount']}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="wizard-budget" className="block text-sm font-medium text-slate-200 mb-1.5">
                  Total Budget Limit ({formData.currency}) <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <WalletIcon className="w-4 h-4" />
                  </span>
                  <input
                    id="wizard-budget"
                    type="number"
                    min="100"
                    step="100"
                    value={formData.budgetLimit}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, budgetLimit: parseFloat(e.target.value) || 0 }))
                    }
                    aria-invalid={Boolean(errors['budgetLimit'])}
                    aria-describedby={errors['budgetLimit'] ? 'budget-error' : undefined}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-950/60 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                  />
                </div>
                {errors['budgetLimit'] && (
                  <p id="budget-error" className="text-rose-400 text-xs mt-1.5 font-medium">
                    {errors['budgetLimit']}
                  </p>
                )}
              </div>
            </div>

            {/* Real-time Per-Head Financial Helper */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-between text-xs text-amber-200">
              <span>Financial Allocation Metric:</span>
              <span className="font-semibold text-amber-300">
                ~{formData.currency} {perGuestEstimate.toLocaleString()} per guest
              </span>
            </div>
          </fieldset>
        )}

        {/* STEP 3: CREATIVE THEMES & CULTURAL CONTEXT */}
        {step === 3 && (
          <fieldset className="space-y-5 animate-fade-in border-none p-0 m-0">
            <legend className="text-xl md:text-2xl font-bold text-slate-50 mb-1">
              Personalized AI Guidance
            </legend>
            <p className="text-slate-400 text-sm mb-4">
              Guide Google Gemini to incorporate your cultural customs, color aesthetics, and special wishes.
            </p>

            <div>
              <label htmlFor="wizard-culture" className="block text-sm font-medium text-slate-200 mb-1.5">
                Cultural Heritage / Celebration Traditions (Optional)
              </label>
              <input
                id="wizard-culture"
                type="text"
                value={formData.culturalContext}
                onChange={(e) => setFormData((p) => ({ ...p, culturalContext: e.target.value }))}
                placeholder="e.g. Traditional Indian Sangeet, Greek Orthodox, Hispanic Quinceañera, or Midsummer"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-950/60 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="wizard-preferences" className="block text-sm font-medium text-slate-200 mb-1.5">
                Aesthetic Vision & Special Requests (Optional)
              </label>
              <textarea
                id="wizard-preferences"
                rows={3}
                value={formData.userPreferences}
                onChange={(e) => setFormData((p) => ({ ...p, userPreferences: e.target.value }))}
                placeholder="e.g. Fairy light canopy ceiling, earthy botanical color palettes, acoustic jazz trio, zero single-use plastics"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-950/60 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition resize-none"
              />
            </div>

            <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-400">
              <div className="flex items-center space-x-2 text-amber-400 font-semibold">
                <SparklesIcon className="w-4 h-4" />
                <span>What Gemini Will Synthesize For You:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li>Mathematically proportional budget line items across venue, dining, and decor</li>
                <li>Chronological day-of-event schedule from morning prep to farewell</li>
                <li>Customized vendor procurement checklist with price allocations</li>
                <li>Two culturally resonant theme palettes with decor installations and vibe keywords</li>
              </ul>
            </div>
          </fieldset>
        )}

        {/* Wizard Controls */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 font-medium text-sm flex items-center space-x-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm flex items-center space-x-2 transition shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <span>Continue</span>
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm flex items-center space-x-2 transition shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Plan...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4 text-slate-950" />
                  <span>Orchestrate Plan with Gemini</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
