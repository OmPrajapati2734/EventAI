'use client';

import React from 'react';
import type { EventType } from '../lib/types';
import { Sparkles, Heart, PartyPopper, Building2, Shield } from './ui/Icons';

interface NavigationProps {
  currentPlanTitle?: string;
  eventType?: EventType;
  onReset: () => void;
}

export function Navigation({
  currentPlanTitle,
  eventType,
  onReset,
}: NavigationProps) {
  const getBadge = () => {
    switch (eventType) {
      case 'wedding':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-800 border border-violet-200">
            <Heart className="w-3.5 h-3.5 text-violet-600" />
            <span>Wedding</span>
          </span>
        );
      case 'birthday':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
            <PartyPopper className="w-3.5 h-3.5 text-sky-600" />
            <span>Birthday</span>
          </span>
        );
      case 'community':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Community</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-md shadow-violet-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 block">
              EventCraft <span className="text-violet-600 font-black">AI</span>
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">
              FestivaAI Celebration Planner
            </span>
          </div>
        </div>

        {/* Center Active Plan Title & Badge */}
        {currentPlanTitle && (
          <div className="hidden md:flex items-center space-x-3">
            <span className="text-sm font-bold text-slate-800 max-w-sm truncate">
              {currentPlanTitle}
            </span>
            {getBadge()}
          </div>
        )}

        {/* Right Actions & Status */}
        <nav aria-label="Main Navigation" className="flex items-center space-x-3">
          {currentPlanTitle && (
            <button
              type="button"
              onClick={onReset}
              className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600"
            >
              + New Celebration Plan
            </button>
          )}

          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] text-slate-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            <span className="font-semibold">Gemini 1.5 Active</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">WCAG 2.1 AA</span>
          </div>
        </nav>
      </div>
    </header>
  );
}
