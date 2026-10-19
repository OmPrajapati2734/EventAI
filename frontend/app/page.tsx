'use client';

import React, { useState } from 'react';
import { Navigation } from '../components/Navigation';
import { LiveAnnouncement } from '../components/LiveAnnouncement';
import { EventWizard } from '../components/EventWizard';
import { HeaderBar } from '../components/HeaderBar';
import { BudgetTracker } from '../components/BudgetTracker';
import { TimelineSection } from '../components/TimelineSection';
import { VendorChecklist } from '../components/VendorChecklist';
import { ThemeIdeasGrid } from '../components/ThemeIdeasGrid';
import { useEventPlanner } from '../hooks/useEventPlanner';
import {
  DollarSign,
  Clock,
  Users,
  Sparkles,
  Layers,
  Heart,
  PartyPopper,
  Building2,
  Shield,
} from '../components/ui/Icons';

type DashboardView = 'all' | 'budget' | 'timeline' | 'vendors' | 'themes';

export default function HomePage() {
  const {
    eventPlan,
    isLoading,
    isRegeneratingThemes,
    announcement,
    announce,
    createPlan,
    toggleMilestone,
    addBudgetItem,
    updateVendorStatus,
    addIdeaToPlan,
    regenerateThemes,
    resetPlan,
  } = useEventPlanner();

  const [activeTab, setActiveTab] = useState<DashboardView>('all');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-violet-100 selection:text-violet-900">
      {/* Accessible Skip Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Live Region for Screen Readers */}
      <LiveAnnouncement message={announcement} />

      {/* Global Navigation Header */}
      <Navigation
        currentPlanTitle={eventPlan?.event.title}
        eventType={eventPlan?.event.eventType}
        onReset={resetPlan}
      />

      {/* Main Content Landmark */}
      <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {!eventPlan ? (
          /* ========================================================= */
          /* STAGE A: PLANNING SETUP WIZARD (NO PLAN LOADED)           */
          /* ========================================================= */
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Executive Hero Banner */}
            <header className="text-center max-w-3xl mx-auto space-y-4 pt-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100 border border-violet-200 text-violet-800 text-xs font-bold shadow-sm">
                <Sparkles className="w-4 h-4 text-violet-600" />
                <span>Autonomous Celebration Architect • Powered by Google Gemini</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Design Extraordinary Celebrations with{' '}
                <span className="text-violet-600 underline decoration-violet-300 decoration-wavy decoration-2">
                  Precision AI
                </span>
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
                Orchestrate Weddings, Milestone Birthdays, and Community Gatherings with automated financial allocations, chronologically phased milestones, vendor directories, and bespoke themes.
              </p>
            </header>

            {/* Setup Stepper Wizard Component */}
            <EventWizard
              onSubmit={createPlan}
              isLoading={isLoading}
              onAnnounce={announce}
            />
          </div>
        ) : (
          /* ========================================================= */
          /* STAGE B: MASTERPLAN DASHBOARD (PLAN LOADED)               */
          /* ========================================================= */
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Top Header Bar with Countdown & Meters */}
            <HeaderBar
              plan={eventPlan}
              onReset={resetPlan}
              onAnnounce={announce}
            />

            {/* Quadrant Navigation Bar */}
            <nav
              aria-label="Masterplan Quadrant View Switcher"
              className="flex items-center justify-between gap-3 flex-wrap bg-white p-2 rounded-2xl border border-slate-200 shadow-sm"
            >
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto" role="tablist">
                {[
                  { id: 'all', label: 'All Quadrants Grid', icon: <Layers className="w-4 h-4" /> },
                  { id: 'budget', label: 'Budget Tracker', icon: <DollarSign className="w-4 h-4" /> },
                  { id: 'timeline', label: 'Milestone Timeline', icon: <Clock className="w-4 h-4" /> },
                  { id: 'vendors', label: 'Vendor Management', icon: <Users className="w-4 h-4" /> },
                  { id: 'themes', label: 'AI Theme Deck', icon: <Sparkles className="w-4 h-4" /> },
                ].map((tab) => {
                  const isSelected = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => {
                        setActiveTab(tab.id as DashboardView);
                        announce(`Switched dashboard view to ${tab.label}.`);
                      }}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 ${
                        isSelected
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-medium px-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Deterministic Invariants Enforced</span>
              </div>
            </nav>

            {/* 4-Quadrant Tabbed / Grid Layout */}
            <div className="space-y-8">
              {/* QUADRANT 1: Budget Allocation Tracker */}
              {(activeTab === 'all' || activeTab === 'budget') && (
                <div id="quadrant-budget">
                  <BudgetTracker
                    plan={eventPlan}
                    onAddBudgetItem={addBudgetItem}
                    onAnnounce={announce}
                  />
                </div>
              )}

              {/* 2-Column Split for Quadrants 2 & 3 in Grid View */}
              {activeTab === 'all' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* QUADRANT 2: Milestone Timeline */}
                  <div id="quadrant-timeline">
                    <TimelineSection
                      milestones={eventPlan.milestones}
                      onToggleMilestone={toggleMilestone}
                      onAnnounce={announce}
                    />
                  </div>

                  {/* QUADRANT 3: Vendor Checklist */}
                  <div id="quadrant-vendors">
                    <VendorChecklist
                      vendors={eventPlan.vendorChecklists}
                      currency={eventPlan.event.currency}
                      onUpdateStatus={updateVendorStatus}
                      onAnnounce={announce}
                    />
                  </div>
                </div>
              ) : (
                <>
                  {activeTab === 'timeline' && (
                    <div id="quadrant-timeline">
                      <TimelineSection
                        milestones={eventPlan.milestones}
                        onToggleMilestone={toggleMilestone}
                        onAnnounce={announce}
                      />
                    </div>
                  )}

                  {activeTab === 'vendors' && (
                    <div id="quadrant-vendors">
                      <VendorChecklist
                        vendors={eventPlan.vendorChecklists}
                        currency={eventPlan.event.currency}
                        onUpdateStatus={updateVendorStatus}
                        onAnnounce={announce}
                      />
                    </div>
                  )}
                </>
              )}

              {/* QUADRANT 4: AI Theme & Personalized Concepts Deck */}
              {(activeTab === 'all' || activeTab === 'themes') && (
                <div id="quadrant-themes">
                  <ThemeIdeasGrid
                    themeIdeas={eventPlan.themeIdeas}
                    onAddIdeaToPlan={addIdeaToPlan}
                    onRegenerateThemes={regenerateThemes}
                    isRegenerating={isRegeneratingThemes}
                    onAnnounce={announce}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Accessible Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">EventCraft AI</span>
            <span>•</span>
            <span>Clean Architecture & WCAG 2.1 AA Compliant</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              Verified Accessible Color Contrast (4.5:1+)
            </span>
            <span>•</span>
            <span>Gemini 1.5 Pro / Flash Structured Outputs</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
