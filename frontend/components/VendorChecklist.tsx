'use client';

import React, { useState } from 'react';
import type { VendorChecklist as VendorItem, VendorStatus } from '../lib/types';
import {
  Users,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  DollarSign,
  Filter,
  Check,
  AlertCircle,
  Building2,
  Tag,
  Shield,
} from './ui/Icons';

interface VendorChecklistProps {
  vendors: VendorItem[];
  currency: string;
  onUpdateStatus?: (vendorId: string, status: VendorStatus) => void;
  onAnnounce?: (msg: string) => void;
}

export function VendorChecklist({
  vendors,
  currency,
  onUpdateStatus,
  onAnnounce,
}: VendorChecklistProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | VendorStatus>('all');

  const totalCommittedSpend = vendors.reduce((sum, v) => sum + (v.price || 0), 0);

  const getStatusBadge = (status: VendorStatus) => {
    switch (status) {
      case 'confirmed':
      case 'booked':
        return {
          label: 'Confirmed & Booked',
          className: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
        };
      case 'paid':
      case 'completed':
        return {
          label: 'Fully Paid & Cleared',
          className: 'bg-violet-50 text-violet-800 border-violet-300',
          icon: <Shield className="w-3.5 h-3.5 text-violet-600" />,
        };
      case 'contract_sent':
      case 'contacted':
        return {
          label: 'Contract In Review',
          className: 'bg-sky-50 text-sky-800 border-sky-300',
          icon: <Mail className="w-3.5 h-3.5 text-sky-600" />,
        };
      case 'pending':
      default:
        return {
          label: 'Pending Inquiry',
          className: 'bg-amber-50 text-amber-800 border-amber-300',
          icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
        };
    }
  };

  const filteredVendors = vendors.filter((v) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'confirmed') return v.status === 'confirmed' || v.status === 'booked';
    if (activeFilter === 'paid') return v.status === 'paid' || v.status === 'completed';
    if (activeFilter === 'contract_sent') return v.status === 'contract_sent' || v.status === 'contacted';
    return v.status === activeFilter;
  });

  const handleStatusChange = (vendorId: string, newStatus: VendorStatus) => {
    onUpdateStatus?.(vendorId, newStatus);
    onAnnounce?.(`Updated vendor status to ${newStatus}.`);
  };

  return (
    <section aria-labelledby="vendor-heading" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
      {/* Header & Committed Total */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-violet-100 text-violet-700">
              <Users className="w-5 h-5" />
            </div>
            <h2 id="vendor-heading" className="text-xl font-extrabold text-slate-900 tracking-tight">
              Vendor Management Checklist
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Contract lifecycle, contact directory, and committed procurement deliverables.
          </p>
        </div>

        {/* Total Committed Metric */}
        <div className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 self-start sm:self-auto">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Committed Contracts
            </span>
            <span className="text-sm font-extrabold text-slate-900 font-mono">
              {currency} {totalCommittedSpend.toLocaleString()}
            </span>
          </div>
          <span className="text-xs font-bold text-violet-800 bg-violet-100 px-2 py-0.5 rounded border border-violet-200">
            {vendors.length} Roles
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 border-b border-slate-100" role="tablist" aria-label="Vendor Status Filters">
        <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" aria-hidden="true" />
        {[
          { key: 'all', label: 'All Vendors', count: vendors.length },
          {
            key: 'confirmed',
            label: 'Confirmed',
            count: vendors.filter((v) => v.status === 'confirmed' || v.status === 'booked').length,
          },
          {
            key: 'contract_sent',
            label: 'In Review',
            count: vendors.filter((v) => v.status === 'contract_sent' || v.status === 'contacted').length,
          },
          {
            key: 'pending',
            label: 'Pending',
            count: vendors.filter((v) => v.status === 'pending').length,
          },
          {
            key: 'paid',
            label: 'Paid',
            count: vendors.filter((v) => v.status === 'paid' || v.status === 'completed').length,
          },
        ].map((tab) => {
          const isSelected = activeFilter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => {
                setActiveFilter(tab.key as any);
                onAnnounce?.(`Filtering vendors by ${tab.label}`);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 ${
                isSelected
                  ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-violet-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Responsive Cards / Table Grid */}
      <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVendors.map((vendor) => {
          const badge = getStatusBadge(vendor.status);

          return (
            <article
              key={vendor.id}
              className="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header: Role and Status Badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-200/60 inline-block mb-1">
                      {vendor.role}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {vendor.vendorName}
                    </h3>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border shrink-0 ${badge.className}`}
                  >
                    {badge.icon}
                    {badge.label}
                  </span>
                </div>

                {/* Contact and Pricing Details */}
                <div className="space-y-1.5 text-xs text-slate-600 mt-2">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate font-mono">{vendor.contact}</span>
                  </div>
                  {vendor.notes && (
                    <p className="text-[11px] text-slate-500 pt-1 line-clamp-2">
                      {vendor.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom: Cost & Status Select */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Agreed Cost
                  </span>
                  <span className="text-sm font-black font-mono text-slate-900">
                    {currency} {vendor.price.toLocaleString()}
                  </span>
                </div>

                {/* Accessible Status Dropdown */}
                <div>
                  <label htmlFor={`status-select-${vendor.id}`} className="sr-only">
                    Change Status for {vendor.vendorName}
                  </label>
                  <select
                    id={`status-select-${vendor.id}`}
                    value={vendor.status}
                    onChange={(e) => handleStatusChange(vendor.id, e.target.value as VendorStatus)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-white focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-500/20 cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="contract_sent">Contract Sent</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="paid">Paid & Cleared</option>
                  </select>
                </div>
              </div>
            </article>
          );
        })}

        {filteredVendors.length === 0 && (
          <div className="col-span-2 text-center py-8 text-slate-400 text-xs">
            No vendors match the selected status filter.
          </div>
        )}
      </div>
    </section>
  );
}
