'use client';

import React, { useState } from 'react';
import type { TimelineMilestone, MilestonePhase } from '../lib/types';
import {
  Clock,
  CheckCircle2,
  Calendar,
  Filter,
  Check,
  Sparkles,
} from './ui/Icons';

interface TimelineSectionProps {
  milestones: TimelineMilestone[];
  onToggleMilestone: (id: string) => void;
  onAnnounce?: (msg: string) => void;
}

export function TimelineSection({
  milestones,
  onToggleMilestone,
  onAnnounce,
}: TimelineSectionProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | MilestonePhase>('all');

  const totalCount = milestones.length;
  const completedCount = milestones.filter((m) => m.isCompleted).length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Group milestones by inferred or explicit phase
  const getPhaseForMilestone = (m: TimelineMilestone): MilestonePhase => {
    if (m.phase) return m.phase;
    const lower = `${m.time} ${m.title}`.toLowerCase();
    if (lower.includes('month') || lower.includes('permit') || lower.includes('reserve') || lower.includes('lock')) {
      return 'planning';
    }
    if (lower.includes('week') || lower.includes('tasting') || lower.includes('fitting') || lower.includes('briefing')) {
      return 'final_prep';
    }
    return 'event_day';
  };

  const filteredMilestones = milestones.filter((m) => {
    if (activeFilter === 'all') return true;
    return getPhaseForMilestone(m) === activeFilter;
  });

  const phases: Array<{ key: 'all' | MilestonePhase; label: string; badge: string }> = [
    { key: 'all', label: 'All Phases', badge: `${completedCount}/${totalCount}` },
    {
      key: 'planning',
      label: 'Planning & Procurement',
      badge: `${milestones.filter((m) => getPhaseForMilestone(m) === 'planning' && m.isCompleted).length}/${milestones.filter((m) => getPhaseForMilestone(m) === 'planning').length}`,
    },
    {
      key: 'final_prep',
      label: 'Final Preparations',
      badge: `${milestones.filter((m) => getPhaseForMilestone(m) === 'final_prep' && m.isCompleted).length}/${milestones.filter((m) => getPhaseForMilestone(m) === 'final_prep').length}`,
    },
    {
      key: 'event_day',
      label: 'Event Day Execution',
      badge: `${milestones.filter((m) => getPhaseForMilestone(m) === 'event_day' && m.isCompleted).length}/${milestones.filter((m) => getPhaseForMilestone(m) === 'event_day').length}`,
    },
  ];

  const handleToggle = (id: string, title: string, currentState: boolean) => {
    onToggleMilestone(id);
    onAnnounce?.(`Milestone "${title}" marked as ${!currentState ? 'complete' : 'incomplete'}.`);
  };

  return (
    <section aria-labelledby="timeline-heading" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
      {/* Header & Master Progress Meter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-violet-100 text-violet-700">
              <Clock className="w-5 h-5" />
            </div>
            <h2 id="timeline-heading" className="text-xl font-extrabold text-slate-900 tracking-tight">
              Milestone & Schedule Timeline
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Chronological roadmap tracking procurement, dress rehearsals, and day-of cues.
          </p>
        </div>

        {/* Master Milestone Progress */}
        <div className="flex items-center gap-3 bg-violet-50/70 border border-violet-200/80 px-4 py-2.5 rounded-xl self-start sm:self-auto">
          <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
            {/* Lightweight SVG Circular Progress Ring */}
            <svg className="w-9 h-9 transform -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
              <path
                className="text-violet-200"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-violet-600 transition-all duration-500 stroke-current"
                strokeDasharray={`${progressPercentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-black text-violet-950 font-mono">
              {progressPercentage}%
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-900/70 block">
              Roadmap Progress
            </span>
            <span className="text-xs font-bold text-violet-950">
              {completedCount} of {totalCount} Completed
            </span>
          </div>
        </div>
      </div>

      {/* Phase Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none border-b border-slate-100" role="tablist" aria-label="Milestone Phase Filters">
        <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" aria-hidden="true" />
        {phases.map((p) => {
          const isSelected = activeFilter === p.key;
          return (
            <button
              key={p.key}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => {
                setActiveFilter(p.key);
                onAnnounce?.(`Showing ${p.label}`);
              }}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 ${
                isSelected
                  ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <span>{p.label}</span>
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-violet-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {p.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Chronological Milestone List */}
      <div className="pt-6">
        <ol className="relative border-l-2 border-violet-200 ml-4 space-y-6">
          {filteredMilestones.map((milestone) => {
            const phase = getPhaseForMilestone(milestone);
            const phaseBadge =
              phase === 'planning'
                ? { label: 'Procurement', class: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
                : phase === 'final_prep'
                  ? { label: 'Final Prep', class: 'bg-amber-50 text-amber-800 border-amber-200' }
                  : { label: 'Event Day', class: 'bg-emerald-50 text-emerald-800 border-emerald-200' };

            return (
              <li key={milestone.id} className="relative pl-7 group">
                {/* Node Anchor Button */}
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={milestone.isCompleted}
                  onClick={() => handleToggle(milestone.id, milestone.title, milestone.isCompleted)}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      handleToggle(milestone.id, milestone.title, milestone.isCompleted);
                    }
                  }}
                  className={`absolute -left-[17px] top-1.5 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 ${
                    milestone.isCompleted
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                      : 'bg-white border-violet-400 hover:border-violet-600 text-transparent hover:text-violet-400'
                  }`}
                  aria-label={`Mark milestone "${milestone.title}" as ${milestone.isCompleted ? 'incomplete' : 'complete'}`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </button>

                {/* Milestone Content Card */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    milestone.isCompleted
                      ? 'bg-slate-50/70 border-slate-200 opacity-80'
                      : 'bg-white border-slate-200 shadow-sm hover:border-violet-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-200/60">
                        {milestone.time}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${phaseBadge.class}`}>
                        {phaseBadge.label}
                      </span>
                    </div>

                    <span
                      className={`text-[11px] font-bold flex items-center gap-1 ${
                        milestone.isCompleted ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      {milestone.isCompleted ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Complete
                        </>
                      ) : (
                        'Pending Action'
                      )}
                    </span>
                  </div>

                  <h3
                    className={`text-sm font-bold ${
                      milestone.isCompleted ? 'text-slate-600 line-through' : 'text-slate-900'
                    }`}
                  >
                    {milestone.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {milestone.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        {filteredMilestones.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-xs">
            No milestones found matching the selected phase filter.
          </div>
        )}
      </div>
    </section>
  );
}
