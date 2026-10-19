'use client';

import React from 'react';
import type { EventPlan } from '../lib/types';
import {
  Heart,
  PartyPopper,
  Building2,
  Calendar,
  Users,
  Clock,
  RotateCcw,
  Printer,
  Sparkles,
} from './ui/Icons';

interface HeaderBarProps {
  plan: EventPlan;
  onReset: () => void;
  onAnnounce?: (msg: string) => void;
}

export function HeaderBar({ plan, onReset, onAnnounce }: HeaderBarProps) {
  const { event, totalAllocatedBudget, remainingBudget } = plan;

  // Calculate days remaining
  const eventDate = new Date(event.date);
  const now = new Date();
  const diffTime = eventDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const getArchetypeDetails = (type: string) => {
    switch (type) {
      case 'wedding':
        return {
          icon: <Heart className="w-4 h-4 text-violet-600" aria-hidden="true" />,
          label: 'Wedding Celebration',
          badgeClass: 'bg-violet-100 text-violet-800 border-violet-200',
        };
      case 'birthday':
        return {
          icon: <PartyPopper className="w-4 h-4 text-sky-600" aria-hidden="true" />,
          label: 'Milestone Birthday',
          badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
        };
      case 'community':
        return {
          icon: <Building2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />,
          label: 'Community Gathering',
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      default:
        return {
          icon: <Sparkles className="w-4 h-4 text-amber-600" aria-hidden="true" />,
          label: 'Celebration Event',
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
        };
    }
  };

  const archetype = getArchetypeDetails(event.eventType);

  const handlePrint = () => {
    onAnnounce?.('Opening print dialogue for event masterplan.');
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleResetConfirm = () => {
    if (confirm('Are you sure you want to start a new event plan? Your current masterplan will be cleared.')) {
      onReset();
    }
  };

  const percentAllocated = Math.min(100, Math.round((totalAllocatedBudget / event.budgetLimit) * 100));

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm print:shadow-none print:border-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left: Title & Metadata */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${archetype.badgeClass}`}
              >
                {archetype.icon}
                {archetype.label}
              </span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formattedDate}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {event.title}
            </h1>
          </div>

          {/* Center / Right: Metric Counters & Quick Actions */}
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
            {/* Countdown Badge */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet-50 border border-violet-200/80">
              <Clock className="w-4 h-4 text-violet-600 shrink-0" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-900/70 block">
                  Time Remaining
                </span>
                <span className="text-sm font-extrabold text-violet-950 font-mono">
                  {daysRemaining} {daysRemaining === 1 ? 'Day' : 'Days'} Out
                </span>
              </div>
            </div>

            {/* Guest Count */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200">
              <Users className="w-4 h-4 text-slate-500 shrink-0" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Headcount
                </span>
                <span className="text-sm font-extrabold text-slate-900 font-mono">
                  {event.guestCount} Guests
                </span>
              </div>
            </div>

            {/* Quick Budget Meter */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 min-w-[170px]">
              <div className="w-full">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  <span>Allocation</span>
                  <span className="font-mono text-slate-900">{percentAllocated}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      percentAllocated > 100 ? 'bg-rose-500' : 'bg-violet-600'
                    }`}
                    style={{ width: `${Math.min(100, percentAllocated)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono mt-1 text-slate-600">
                  <span>{event.currency} {totalAllocatedBudget.toLocaleString()}</span>
                  <span className={remainingBudget < 0 ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                    rem: {event.currency} {remainingBudget.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Print & Reset Buttons */}
            <div className="flex items-center gap-2 print:hidden">
              <button
                type="button"
                onClick={handlePrint}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 transition-colors"
                aria-label="Print event masterplan report"
                title="Print Event Masterplan"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleResetConfirm}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 transition-colors"
                aria-label="Create new plan or reset current masterplan"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">New Plan</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
