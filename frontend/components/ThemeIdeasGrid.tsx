'use client';

import React, { useState } from 'react';
import type { ThemeIdea } from '../lib/types';
import {
  Sparkles,
  Palette,
  Copy,
  Check,
  Plus,
  RefreshCw,
  Gift,
  Compass,
  PartyPopper,
} from './ui/Icons';

interface ThemeIdeasGridProps {
  themeIdeas: ThemeIdea[];
  onAddIdeaToPlan?: (ideaTitle: string, category: string) => void;
  onRegenerateThemes?: (preferences?: string) => Promise<void>;
  isRegenerating?: boolean;
  onAnnounce?: (msg: string) => void;
}

export function ThemeIdeasGrid({
  themeIdeas,
  onAddIdeaToPlan,
  onRegenerateThemes,
  isRegenerating = false,
  onAnnounce,
}: ThemeIdeasGridProps) {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [promptInput, setPromptInput] = useState('');
  const [showRegenerateInput, setShowRegenerateInput] = useState(false);
  const [addedItems, setAddedItems] = useState<string[]>([]);

  const handleCopyHex = (hex: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(hex).catch(() => {});
    }
    setCopiedHex(hex);
    onAnnounce?.(`Copied hex color code ${hex} to clipboard.`);
    setTimeout(() => {
      setCopiedHex(null);
    }, 2000);
  };

  const handleQuickAdd = (title: string, category: string) => {
    onAddIdeaToPlan?.(title, category);
    setAddedItems((prev) => [...prev, title]);
    onAnnounce?.(`Added "${title}" to your planning checklist.`);
  };

  const handleRegenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onRegenerateThemes) {
      await onRegenerateThemes(promptInput.trim() || undefined);
      setPromptInput('');
      setShowRegenerateInput(false);
    }
  };

  return (
    <section aria-labelledby="themes-heading" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
      {/* Header & Regenerate Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-violet-100 text-violet-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 id="themes-heading" className="text-xl font-extrabold text-slate-900 tracking-tight">
              AI Idea & Personalized Concepts Deck
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Personalized themes, decor installations, entertainment cues, and interactive activities.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowRegenerateInput((prev) => !prev)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-violet-200 bg-violet-50 text-violet-800 text-xs sm:text-sm font-bold hover:bg-violet-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 transition-colors self-start sm:self-auto"
          aria-expanded={showRegenerateInput}
        >
          <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
          {isRegenerating ? 'Consulting Gemini...' : 'Regenerate Concepts'}
        </button>
      </div>

      {/* Optional Refinement Input */}
      {showRegenerateInput && (
        <form onSubmit={handleRegenerate} className="my-5 p-4 rounded-xl bg-violet-50/60 border border-violet-200 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="e.g. Add more rustic wooden details or acoustic jazz elements"
            className="flex-1 px-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-500/20"
          />
          <button
            type="submit"
            disabled={isRegenerating}
            className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs sm:text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 shadow-sm shrink-0 disabled:opacity-50"
          >
            {isRegenerating ? 'Updating...' : 'Generate New Variations'}
          </button>
        </form>
      )}

      {/* Grid of Concept Cards */}
      <div className="pt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {themeIdeas.map((idea) => {
          return (
            <article
              key={idea.id}
              className="p-6 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/50 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Title & Vibe Pills */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {idea.vibeKeywords.map((vibe) => (
                      <span
                        key={vibe}
                        className="text-[10px] font-bold uppercase tracking-wider text-violet-800 bg-violet-100/70 px-2 py-0.5 rounded-full border border-violet-200/60"
                      >
                        {vibe}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    {idea.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {idea.description}
                  </p>
                </div>

                {/* Color Palette Swatches (Click-to-Copy) */}
                <div className="space-y-2 py-3 border-y border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-violet-600" />
                      Color Palette (Click to Copy)
                    </span>
                    {copiedHex && (
                      <span className="text-emerald-700 font-bold lowercase text-[10px] flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" /> Copied {copiedHex}!
                      </span>
                    )}
                  </span>

                  <div className="flex items-center gap-2 pt-1">
                    {idea.colorPalette.map((hex) => {
                      const isCopied = copiedHex === hex;
                      return (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => handleCopyHex(hex)}
                          className="group relative flex flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 rounded-lg p-1 hover:bg-slate-100 transition-colors"
                          aria-label={`Copy hex color code ${hex}`}
                        >
                          <div
                            className="w-8 h-8 rounded-lg shadow-sm border border-black/10 group-hover:scale-105 transition-transform flex items-center justify-center"
                            style={{ backgroundColor: hex }}
                          >
                            {isCopied && <Check className="w-4 h-4 text-white drop-shadow stroke-[3]" />}
                          </div>
                          <span className="text-[10px] font-mono font-bold text-slate-600 mt-1 uppercase">
                            {hex}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Decor & Floral Installations */}
                <div className="py-4 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-violet-600" />
                    Signature Decor & Installations
                  </h4>
                  <ul className="space-y-2">
                    {idea.decorationSuggestions.map((decor, idx) => {
                      const isAdded = addedItems.includes(decor);
                      return (
                        <li
                          key={idx}
                          className="flex items-start justify-between gap-3 text-xs text-slate-700 p-2 rounded-lg bg-white border border-slate-200/80"
                        >
                          <span className="leading-snug">{decor}</span>
                          <button
                            type="button"
                            onClick={() => handleQuickAdd(decor, 'Signature Decor')}
                            disabled={isAdded}
                            className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold border transition-colors ${
                              isAdded
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200'
                            }`}
                            aria-label={`Add decor "${decor}" to plan`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3 h-3 stroke-[3]" /> Added
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" /> Add to Plan
                              </>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Entertainment & Icebreaker Concepts */}
                {((idea.entertainmentIdeas && idea.entertainmentIdeas.length > 0) ||
                  (idea.activityIdeas && idea.activityIdeas.length > 0)) && (
                  <div className="pt-2 space-y-2 border-t border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <PartyPopper className="w-3.5 h-3.5 text-violet-600" />
                      Entertainment & Guest Activities
                    </h4>
                    <ul className="space-y-1.5">
                      {[
                        ...(idea.entertainmentIdeas || []),
                        ...(idea.activityIdeas || []),
                      ].slice(0, 3).map((act, idx) => {
                        const isAdded = addedItems.includes(act);
                        return (
                          <li
                            key={idx}
                            className="flex items-center justify-between gap-2 text-xs text-slate-700 py-1"
                          >
                            <span className="truncate">{act}</span>
                            <button
                              type="button"
                              onClick={() => handleQuickAdd(act, 'Entertainment')}
                              disabled={isAdded}
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                isAdded
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'text-violet-700 hover:bg-violet-50 border-violet-200'
                              }`}
                            >
                              {isAdded ? 'Added' : '+ Add'}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
