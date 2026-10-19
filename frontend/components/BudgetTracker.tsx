'use client';

import React, { useState } from 'react';
import type { BudgetItem, EventPlan } from '../lib/types';
import {
  DollarSign,
  AlertTriangle,
  Plus,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  X,
  AlertCircle,
  Tag,
  Building2,
  Utensils,
  Camera,
  Music,
  Palette,
  Sparkles,
} from './ui/Icons';

interface BudgetTrackerProps {
  plan: EventPlan;
  onAddBudgetItem: (item: Omit<BudgetItem, 'id'>) => Promise<void>;
  onAnnounce?: (msg: string) => void;
}

export function BudgetTracker({ plan, onAddBudgetItem, onAnnounce }: BudgetTrackerProps) {
  const { event, budgetItems, totalAllocatedBudget, totalActualBudget, remainingBudget } = plan;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [allocatedAmount, setAllocatedAmount] = useState<number | ''>('');
  const [actualAmount, setActualAmount] = useState<number | ''>(0);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const budgetLimit = event.budgetLimit;
  const isOverAllocated = totalAllocatedBudget > budgetLimit;
  const isOverSpent = totalActualBudget > totalAllocatedBudget;

  const allocatedPercentage = Math.round((totalAllocatedBudget / budgetLimit) * 100);
  const spentPercentage = Math.round((totalActualBudget / budgetLimit) * 100);

  const getCategoryIcon = (catName: string) => {
    const lower = catName.toLowerCase();
    if (lower.includes('venue') || lower.includes('hall')) return <Building2 className="w-4 h-4 text-violet-600" />;
    if (lower.includes('cater') || lower.includes('beverage') || lower.includes('food') || lower.includes('cake')) return <Utensils className="w-4 h-4 text-amber-600" />;
    if (lower.includes('photo') || lower.includes('video') || lower.includes('cinema')) return <Camera className="w-4 h-4 text-sky-600" />;
    if (lower.includes('music') || lower.includes('dj') || lower.includes('entertain') || lower.includes('audio')) return <Music className="w-4 h-4 text-emerald-600" />;
    if (lower.includes('decor') || lower.includes('floral') || lower.includes('styling')) return <Palette className="w-4 h-4 text-fuchsia-600" />;
    return <Sparkles className="w-4 h-4 text-slate-500" />;
  };

  const handleOpenModal = () => {
    setCategory('');
    setAllocatedAmount('');
    setActualAmount(0);
    setNotes('');
    setFormError('');
    setIsModalOpen(true);
    onAnnounce?.('Add budget expense line item dialog opened.');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    onAnnounce?.('Add budget expense line item dialog closed.');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category.trim()) {
      setFormError('Category name is required.');
      return;
    }
    if (allocatedAmount === '' || Number(allocatedAmount) <= 0) {
      setFormError('Allocated amount must be greater than zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddBudgetItem({
        category: category.trim(),
        allocatedAmount: Number(allocatedAmount),
        actualAmount: Number(actualAmount) || 0,
        notes: notes.trim() || undefined,
      });
      handleCloseModal();
    } catch {
      setFormError('Failed to add budget line item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section aria-labelledby="budget-tracker-heading" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
      {/* Header & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-violet-100 text-violet-700">
              <DollarSign className="w-5 h-5" />
            </div>
            <h2 id="budget-tracker-heading" className="text-xl font-extrabold text-slate-900 tracking-tight">
              Budget Allocation Tracker
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time balance enforcement across planned allocations and actual payments.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs sm:text-sm font-bold shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 transition-colors self-start sm:self-auto"
          aria-haspopup="dialog"
          aria-expanded={isModalOpen}
        >
          <Plus className="w-4 h-4" />
          Add Expense Item
        </button>
      </div>

      {/* Warning Alert Banners */}
      {isOverAllocated && (
        <div
          role="alert"
          className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-900"
        >
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <strong className="font-bold">Over-Allocation Warning:</strong> Total allocated budget (
            <span className="font-mono font-bold">{event.currency} {totalAllocatedBudget.toLocaleString()}</span>
            ) exceeds your target financial ceiling by{' '}
            <span className="font-mono font-bold">{event.currency} {(totalAllocatedBudget - budgetLimit).toLocaleString()}</span>.
          </div>
        </div>
      )}

      {isOverSpent && (
        <div
          role="alert"
          className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-950"
        >
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <strong className="font-bold">Expenditure Notice:</strong> Actual paid spend (
            <span className="font-mono font-bold">{event.currency} {totalActualBudget.toLocaleString()}</span>
            ) has surpassed total allocated line items.
          </div>
        </div>
      )}

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        {/* Total Target Budget */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Target Budget Limit
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {event.currency} {budgetLimit.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-600 px-2 py-0.5 rounded bg-white border border-slate-200">
              100% Limit
            </span>
          </div>
        </div>

        {/* Total Allocated */}
        <div className={`p-4 rounded-xl border ${isOverAllocated ? 'bg-rose-50/50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Total Allocated Budget
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-2xl font-black font-mono ${isOverAllocated ? 'text-rose-700' : 'text-slate-900'}`}>
              {event.currency} {totalAllocatedBudget.toLocaleString()}
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded border ${
                isOverAllocated
                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                  : 'bg-violet-100 text-violet-800 border-violet-200'
              }`}
            >
              {allocatedPercentage}% Planned
            </span>
          </div>
        </div>

        {/* Actual Paid Spend */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Actual Paid Spend
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {event.currency} {totalActualBudget.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-800 px-2 py-0.5 rounded bg-emerald-100 border border-emerald-200">
              {spentPercentage}% Spent
            </span>
          </div>
        </div>
      </div>

      {/* Visual Multi-Segment Progress Meter */}
      <div className="space-y-2 mb-8">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-700">Financial Envelope Utilization</span>
          <span className="text-slate-500 font-mono">
            Remaining: <strong className={remainingBudget < 0 ? 'text-rose-600' : 'text-slate-900'}>{event.currency} {remainingBudget.toLocaleString()}</strong>
          </span>
        </div>

        <div
          role="progressbar"
          aria-label="Budget Allocation Progress"
          aria-valuenow={allocatedPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex border border-slate-200"
        >
          {/* Spent Portion */}
          <div
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{ width: `${Math.min(100, spentPercentage)}%` }}
            title={`Spent: ${spentPercentage}%`}
          />
          {/* Allocated Unspent Portion */}
          <div
            className={`h-full transition-all duration-500 ${
              isOverAllocated ? 'bg-rose-500' : 'bg-violet-500'
            }`}
            style={{ width: `${Math.max(0, Math.min(100 - spentPercentage, allocatedPercentage - spentPercentage))}%` }}
            title={`Allocated: ${allocatedPercentage}%`}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 text-[11px] text-slate-600 font-medium pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Spent ({spentPercentage}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block" />
            <span>Allocated Buffer</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block border border-slate-300" />
            <span>Unallocated Headroom</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown Cards */}
      <div>
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3">
          Category Allocations ({budgetItems.length} Line Items)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {budgetItems.map((item) => {
            const isCategoryOver = item.actualAmount > item.allocatedAmount;
            const variance = item.allocatedAmount - item.actualAmount;
            const itemShare = Math.round((item.allocatedAmount / budgetLimit) * 100);

            return (
              <article
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {item.category}
                      </h4>
                      {item.notes && (
                        <p className="text-[11px] text-slate-500 line-clamp-1">{item.notes}</p>
                      )}
                    </div>
                  </div>

                  <span className="text-[11px] font-mono font-bold text-slate-500 px-2 py-0.5 rounded bg-slate-50 border border-slate-200">
                    {itemShare}% of Total
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Allocated</span>
                    <span className="font-mono font-bold text-slate-900">
                      {event.currency} {item.allocatedAmount.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Actual Paid</span>
                    <span className="font-mono font-bold text-slate-900">
                      {event.currency} {item.actualAmount.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Variance</span>
                    <span
                      className={`font-mono font-bold flex items-center gap-0.5 ${
                        isCategoryOver ? 'text-rose-600' : 'text-emerald-700'
                      }`}
                    >
                      {isCategoryOver ? (
                        <>
                          <TrendingUp className="w-3 h-3 text-rose-600" />
                          +{event.currency} {Math.abs(variance).toLocaleString()}
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-3 h-3 text-emerald-600" />
                          {event.currency} {variance.toLocaleString()}
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {isCategoryOver && (
                  <div className="mt-2.5 pt-2 border-t border-rose-100 text-[11px] font-bold text-rose-700 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Exceeds category budget by {event.currency} {Math.abs(variance).toLocaleString()}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>

      {/* Accessible Add Line Item Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150"
            tabIndex={-1}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 id="modal-title" className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-violet-600" />
                Add Budget Line Item
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
              <div>
                <label htmlFor="item-category" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Category Name <span className="text-rose-600">*</span>
                </label>
                <input
                  id="item-category"
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Specialty Gelato Cart or Live Band"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-500/20 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="item-allocated" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Allocated ({event.currency}) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="item-allocated"
                    type="number"
                    min={1}
                    required
                    value={allocatedAmount}
                    onChange={(e) => setAllocatedAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="1000"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-500/20 text-sm font-mono"
                  />
                </div>

                <div>
                  <label htmlFor="item-actual" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Actual Spent ({event.currency})
                  </label>
                  <input
                    id="item-actual"
                    type="number"
                    min={0}
                    value={actualAmount}
                    onChange={(e) => setActualAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-500/20 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="item-notes" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Vendor Notes / Details (Optional)
                </label>
                <input
                  id="item-notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Includes setup, service fee, and cleanup"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-500/20 text-sm"
                />
              </div>

              {formError && (
                <p className="text-xs font-semibold text-rose-600 flex items-center gap-1" role="alert">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {formError}
                </p>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 shadow-sm"
                >
                  {isSubmitting ? 'Saving...' : 'Add Line Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
