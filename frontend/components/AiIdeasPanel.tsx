'use client';

import React, { useState } from 'react';
import type { ThemeIdea } from '../lib/types';
import { SparklesIcon, RefreshIcon } from './ui/Icons';

interface AiIdeasPanelProps {
  themeIdeas: ThemeIdea[];
  onRegenerate: () => Promise<void>;
  isRegenerating: boolean;
  onAnnounce: (msg: string) => void;
}

export function AiIdeasPanel({
  themeIdeas,
  onRegenerate,
  isRegenerating,
  onAnnounce,
}: AiIdeasPanelProps) {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    onAnnounce(`Copied color code ${hex} to clipboard.`);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <section
      aria-labelledby="ai-ideas-heading"
      className="bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-glass p-6 text-slate-100 transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
            <SparklesIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 id="ai-ideas-heading" className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <span>Gemini AI Theme Inspirations</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                AI Curated
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Personalized color palettes, sensory aesthetics, and decor concepts.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRegenerate}
          disabled={isRegenerating}
          aria-label="Regenerate themes using Gemini AI"
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-semibold text-xs shadow-glow flex items-center space-x-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-50"
        >
          <RefreshIcon className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
          <span>{isRegenerating ? 'Generating...' : 'Refresh AI Themes'}</span>
        </button>
      </div>

      {/* Theme Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        {themeIdeas.length === 0 ? (
          <p className="text-xs text-slate-500 py-8 text-center italic col-span-2">
            No theme ideas generated yet. Click refresh to query Gemini!
          </p>
        ) : (
          themeIdeas.map((theme, idx) => (
            <div
              key={theme.id || idx}
              className="p-5 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-slate-100">{theme.title}</h3>
                  <span className="text-[11px] font-mono text-slate-500">Theme #{idx + 1}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {theme.description}
                </p>

                {/* Color Palette Swatches */}
                <div className="mb-4">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-2 uppercase tracking-wider">
                    Curated Color Palette (Click to Copy):
                  </span>
                  <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                    {theme.colorPalette.map((color, colorIdx) => (
                      <button
                        key={colorIdx}
                        type="button"
                        onClick={() => handleCopyColor(color)}
                        aria-label={`Copy color ${color} to clipboard`}
                        className="group relative flex items-center space-x-1.5 px-2 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-600 transition text-[11px] font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-slate-300 group-hover:text-amber-300">
                          {copiedHex === color ? 'Copied!' : color}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Decoration Suggestions */}
                <div className="mb-4">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
                    Signature Installations:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {theme.decorationSuggestions.map((item, dIdx) => (
                      <li key={dIdx} className="flex items-start space-x-2">
                        <span className="text-amber-400 text-xs mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Vibe Keywords */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center space-x-1.5 flex-wrap gap-y-1.5">
                {theme.vibeKeywords.map((vibe, vIdx) => (
                  <span
                    key={vIdx}
                    className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700"
                  >
                    #{vibe}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
