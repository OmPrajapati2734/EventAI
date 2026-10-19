'use client';

import React, { useState } from 'react';
import type { TimelineMilestone } from '../lib/types';
import { ClockIcon, CheckCircleIcon } from './ui/Icons';

interface TimelineViewProps {
  milestones: TimelineMilestone[];
  onToggleMilestone: (id: string) => void;
  onAnnounce: (msg: string) => void;
}

export function TimelineView({
  milestones,
  onToggleMilestone,
  onAnnounce,
}: TimelineViewProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredMilestones = milestones.filter((m) => {
    if (filter === 'completed') return m.isCompleted;
    if (filter === 'pending') return !m.isCompleted;
    return true;
  });

  const completedCount = milestones.filter((m) => m.isCompleted).length;
  const progressPercent = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  const handleToggle = (milestone: TimelineMilestone) => {
    onToggleMilestone(milestone.id);
    const nextState = !milestone.isCompleted ? 'completed' : 'pending';
    onAnnounce(`Marked milestone "${milestone.title}" as ${nextState}.`);
  };

  return (
    <section
      aria-labelledby="timeline-heading"
      className="bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-glass p-6 text-slate-100 transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400">
            <ClockIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 id="timeline-heading" className="text-lg font-bold text-slate-100">
              Day-of-Event Timeline
            </h2>
            <p className="text-xs text-slate-400">
              Chronologically ordered milestones and logistical execution schedule.
            </p>
          </div>
        </div>

        {/* Milestone Filters */}
        <div
          role="tablist"
          aria-label="Milestone Completion Filters"
          className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs self-start sm:self-auto"
        >
          {(['all', 'pending', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={filter === tab}
              onClick={() => {
                setFilter(tab);
                onAnnounce(`Showing ${tab} milestones.`);
              }}
              className={`px-3 py-1 rounded-md font-medium capitalize transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 ${
                filter === tab
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Completion Progress Bar */}
      <div className="my-5 p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">
          Schedule Progress: <strong className="text-slate-200">{completedCount} of {milestones.length}</strong> Completed
        </span>
        <div className="flex items-center space-x-3 w-40">
          <div
            role="progressbar"
            aria-label="Milestones completion progress"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-sky-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-sky-400">{progressPercent}%</span>
        </div>
      </div>

      {/* Milestones List */}
      <div className="space-y-3 relative before:absolute before:top-3 before:bottom-3 before:left-5 before:w-0.5 before:bg-slate-800">
        {filteredMilestones.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center italic">
            No milestones found matching current filter.
          </p>
        ) : (
          filteredMilestones.map((milestone) => (
            <div
              key={milestone.id}
              className={`relative flex items-start space-x-4 p-3.5 rounded-xl border transition-all duration-200 ${
                milestone.isCompleted
                  ? 'bg-slate-950/40 border-slate-800/80 opacity-80'
                  : 'bg-slate-900/90 border-slate-700/60 hover:border-slate-600'
              }`}
            >
              {/* Checkbox Button (Keyboard Accessible) */}
              <button
                type="button"
                role="checkbox"
                aria-checked={milestone.isCompleted}
                aria-label={`Mark "${milestone.title}" as ${milestone.isCompleted ? 'incomplete' : 'complete'}`}
                onClick={() => handleToggle(milestone)}
                className={`relative z-10 w-6 h-6 mt-0.5 rounded-md flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  milestone.isCompleted
                    ? 'bg-emerald-600 text-white'
                    : 'border-2 border-slate-600 hover:border-amber-400 bg-slate-950'
                }`}
              >
                {milestone.isCompleted && <CheckCircleIcon className="w-4 h-4" />}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-sky-950/60 text-sky-300 border border-sky-500/20">
                    {milestone.time}
                  </span>
                  <h3
                    className={`text-sm font-semibold truncate ${
                      milestone.isCompleted ? 'line-through text-slate-400' : 'text-slate-100'
                    }`}
                  >
                    {milestone.title}
                  </h3>
                </div>
                {milestone.description && (
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {milestone.description}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
