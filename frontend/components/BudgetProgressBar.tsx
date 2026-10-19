'use client';

import React, { useState } from 'react';
import type { BudgetItem } from '../lib/types';
import { WalletIcon, AlertTriangleIcon, CheckCircleIcon } from './ui/Icons';

interface BudgetProgressBarProps {
  totalBudgetLimit: number;
  currency: string;
  budgetItems: BudgetItem[];
  onAddBudgetItem: (item: Omit<BudgetItem, 'id'>) => Promise<void>;
  onAnnounce: (msg: string) => void;
}

export function BudgetProgressBar({
  totalBudgetLimit,
  currency,
  budgetItems,
  onAddBudgetItem,
  onAnnounce,
}: BudgetProgressBarProps) {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newAllocated, setNewAllocated] = useState('');
  const [newActual, setNewActual] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const totalAllocated = budgetItems.reduce((acc, b) => acc + b.allocatedAmount, 0);
  const totalActual = budgetItems.reduce((acc, b) => acc + b.actualAmount, 0);
  const remainingBudget = totalBudgetLimit - totalAllocated;

  const allocatedPercent = Math.min(
    100,
    Math.round((totalAllocated / totalBudgetLimit) * 100) || 0
  );
  const actualPercent = Math.min(
    100,
    Math.round((totalActual / totalBudgetLimit) * 100) || 0
  );

  const isOverAllocated = totalAllocated > totalBudgetLimit;
  const isOverSpent = totalActual > totalBudgetLimit;

  const handleCreateBudgetItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) {
      setErrorMsg('Category name is required.');
      return;
    }
    const alloc = parseFloat(newAllocated);
    if (isNaN(alloc) || alloc <= 0) {
      setErrorMsg('Allocated amount must be a positive number.');
      return;
    }

    try {
      await onAddBudgetItem({
        category: newCategory.trim(),
        allocatedAmount: alloc,
        actualAmount: parseFloat(newActual) || 0,
        notes: newNotes.trim(),
      });
      onAnnounce(`Appended budget item ${newCategory} for ${currency} ${alloc}.`);
      setNewCategory('');
      setNewAllocated('');
      setNewActual('');
      setNewNotes('');
      setErrorMsg('');
      setIsAddingItem(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add budget line item.');
    }
  };

  return (
    <section
      aria-labelledby="budget-dashboard-heading"
      className="bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-glass p-6 text-slate-100 transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
            <WalletIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 id="budget-dashboard-heading" className="text-lg font-bold text-slate-100">
              Budget Health & Financial Progress
            </h2>
            <p className="text-xs text-slate-400">
              Real-time monitoring of planned allocations vs. actual expenditures.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingItem(!isAddingItem)}
          aria-expanded={isAddingItem}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          {isAddingItem ? 'Cancel Line Item' : '+ Add Line Item'}
        </button>
      </div>

      {/* Over-Budget Alert Warning */}
      {(isOverAllocated || isOverSpent) && (
        <div
          role="alert"
          className="mt-4 p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 flex items-start space-x-3 animate-fade-in"
        >
          <AlertTriangleIcon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold text-rose-300 block text-sm mb-0.5">
              Budget Ceiling Warning Exceeded
            </span>
            {isOverAllocated && (
              <p>
                Total allocations ({currency} {totalAllocated.toLocaleString()}) exceed the target limit of{' '}
                {currency} {totalBudgetLimit.toLocaleString()} by{' '}
                <strong className="text-rose-100">
                  {currency} {(totalAllocated - totalBudgetLimit).toLocaleString()}
                </strong>
                .
              </p>
            )}
            {isOverSpent && (
              <p>
                Actual expenditures ({currency} {totalActual.toLocaleString()}) surpass the total event budget.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Key Financial Metric Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-5">
        <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/80">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Budget Ceiling
          </span>
          <span className="text-base md:text-lg font-bold text-slate-100">
            {currency} {totalBudgetLimit.toLocaleString()}
          </span>
        </div>

        <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/80">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Allocated Planned
          </span>
          <span
            className={`text-base md:text-lg font-bold ${
              isOverAllocated ? 'text-rose-400' : 'text-amber-400'
            }`}
          >
            {currency} {totalAllocated.toLocaleString()}
          </span>
        </div>

        <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/80">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Actual Spent
          </span>
          <span
            className={`text-base md:text-lg font-bold ${
              isOverSpent ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {currency} {totalActual.toLocaleString()}
          </span>
        </div>

        <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/80">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Remaining Buffer
          </span>
          <span
            className={`text-base md:text-lg font-bold ${
              remainingBudget < 0 ? 'text-rose-400' : 'text-slate-200'
            }`}
          >
            {currency} {remainingBudget.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Accessible Progress Bar (WCAG 2.1 AA) */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-xs text-slate-400 font-medium">
          <span>Allocation Progress ({allocatedPercent}%)</span>
          <span>Actual Spend ({actualPercent}%)</span>
        </div>

        <div
          role="progressbar"
          aria-label="Planned budget allocation progress"
          aria-valuenow={totalAllocated}
          aria-valuemin={0}
          aria-valuemax={totalBudgetLimit}
          className="relative w-full h-4 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/60"
        >
          {/* Allocated Bar */}
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOverAllocated
                ? 'bg-gradient-to-r from-rose-600 to-rose-500'
                : 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-glow'
            }`}
            style={{ width: `${allocatedPercent}%` }}
          />

          {/* Actual spent marker overlay */}
          <div
            aria-label="Actual spend overlay indicator"
            className="absolute top-0 bottom-0 bg-emerald-400/80 rounded-full transition-all duration-500"
            style={{ width: `${actualPercent}%`, opacity: 0.7 }}
          />
        </div>
      </div>

      {/* Inline Add Item Form */}
      {isAddingItem && (
        <form
          onSubmit={handleCreateBudgetItem}
          className="mb-6 p-4 rounded-xl bg-slate-950/70 border border-amber-500/30 animate-slide-up"
        >
          <h3 className="text-sm font-semibold text-amber-300 mb-3">
            Add New Expense Line Item
          </h3>
          {errorMsg && (
            <p className="text-rose-400 text-xs mb-3 font-medium">{errorMsg}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label htmlFor="item-category" className="block text-[11px] font-medium text-slate-300 mb-1">
                Category
              </label>
              <input
                id="item-category"
                type="text"
                required
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g. Late Night Snack Bar"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>
            <div>
              <label htmlFor="item-allocated" className="block text-[11px] font-medium text-slate-300 mb-1">
                Allocated ({currency})
              </label>
              <input
                id="item-allocated"
                type="number"
                min="0"
                step="50"
                required
                value={newAllocated}
                onChange={(e) => setNewAllocated(e.target.value)}
                placeholder="750"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>
            <div>
              <label htmlFor="item-actual" className="block text-[11px] font-medium text-slate-300 mb-1">
                Actual Spent ({currency})
              </label>
              <input
                id="item-actual"
                type="number"
                min="0"
                step="50"
                value={newActual}
                onChange={(e) => setNewActual(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="item-notes" className="block text-[11px] font-medium text-slate-300 mb-1">
              Notes & Contract Terms
            </label>
            <input
              id="item-notes"
              type="text"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="e.g. Deposit paid on contract signing"
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAddingItem(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs shadow-glow"
            >
              Save Line Item
            </button>
          </div>
        </form>
      )}

      {/* Granular Line Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <caption className="sr-only">Detailed event budget itemization breakdown</caption>
          <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/40 border-b border-slate-800">
            <tr>
              <th scope="col" className="py-2.5 px-3">Category</th>
              <th scope="col" className="py-2.5 px-3 text-right">Planned</th>
              <th scope="col" className="py-2.5 px-3 text-right">Spent</th>
              <th scope="col" className="py-2.5 px-3 text-right">Variance</th>
              <th scope="col" className="py-2.5 px-3 hidden md:table-cell">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {budgetItems.map((item) => {
              const variance = item.allocatedAmount - item.actualAmount;
              const isUnder = variance >= 0;
              return (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-slate-200">{item.category}</td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    {currency} {item.allocatedAmount.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-100">
                    {currency} {item.actualAmount.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        isUnder
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-950/40 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {isUnder ? `+${currency} ${variance.toLocaleString()}` : `-${currency} ${Math.abs(variance).toLocaleString()}`}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px] hidden md:table-cell truncate max-w-xs">
                    {item.notes || '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
