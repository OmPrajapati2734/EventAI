'use client';

import React, { useState } from 'react';
import type { VendorChecklist, VendorStatus } from '../lib/types';
import { UsersIcon } from './ui/Icons';

interface VendorChecklistViewProps {
  vendors: VendorChecklist[];
  currency: string;
  onAnnounce: (msg: string) => void;
}

export function VendorChecklistView({
  vendors,
  currency,
  onAnnounce,
}: VendorChecklistViewProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | VendorStatus>('all');

  const filteredVendors = vendors.filter((v) => {
    if (statusFilter === 'all') return true;
    return v.status === statusFilter;
  });

  const totalCommitted = vendors
    .filter((v) => v.status === 'booked' || v.status === 'completed')
    .reduce((sum, v) => sum + v.price, 0);

  const getStatusBadge = (status: VendorStatus) => {
    switch (status) {
      case 'booked':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30';
      case 'contacted':
        return 'bg-sky-950/60 text-sky-300 border-sky-500/30';
      case 'completed':
        return 'bg-indigo-950/60 text-indigo-300 border-indigo-500/30';
      case 'rejected':
        return 'bg-rose-950/60 text-rose-300 border-rose-500/30';
      default:
        return 'bg-amber-950/60 text-amber-300 border-amber-500/30';
    }
  };

  return (
    <section
      aria-labelledby="vendors-heading"
      className="bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-glass p-6 text-slate-100 transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <UsersIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 id="vendors-heading" className="text-lg font-bold text-slate-100">
              Vendor Procurement Checklist
            </h2>
            <p className="text-xs text-slate-400">
              Track vendor proposals, contracts, statuses, and estimated fees.
            </p>
          </div>
        </div>

        {/* Filter Badges */}
        <div
          role="tablist"
          aria-label="Vendor Status Filters"
          className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs self-start sm:self-auto overflow-x-auto max-w-full"
        >
          {(['all', 'pending', 'contacted', 'booked', 'completed'] as const).map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={statusFilter === s}
              onClick={() => {
                setStatusFilter(s);
                onAnnounce(`Filtering vendors by ${s} status.`);
              }}
              className={`px-2.5 py-1 rounded-md font-medium capitalize transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 whitespace-nowrap ${
                statusFilter === s
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Committed Spend summary badge */}
      <div className="my-5 p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium">
          Committed & Booked Contracts:
        </span>
        <span className="font-bold text-emerald-400 font-mono text-sm">
          {currency} {totalCommitted.toLocaleString()}
        </span>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredVendors.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center italic col-span-2">
            No vendors found for the current filter.
          </p>
        ) : (
          filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-amber-400 tracking-wide uppercase">
                    {vendor.role}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                      vendor.status
                    )}`}
                  >
                    {vendor.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-100">{vendor.vendorName}</h3>
                <p className="text-xs text-slate-400 mt-1 truncate">
                  <span className="text-slate-500">Contact:</span> {vendor.contact}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Estimated Fee</span>
                <span className="font-mono font-bold text-slate-200">
                  {currency} {vendor.price.toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
