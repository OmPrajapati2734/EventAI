import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BudgetTracker } from '../components/BudgetTracker';
import type { EventPlan } from '../lib/types';

const mockPlan: EventPlan = {
  id: 'plan-test-1',
  event: {
    id: 'evt-test-1',
    title: 'Avery & Jordan Wedding Celebration',
    eventType: 'wedding',
    date: '2026-10-15T16:00:00.000Z',
    guestCount: 120,
    budgetLimit: 30000,
    currency: 'USD',
  },
  budgetItems: [
    {
      id: 'b-1',
      category: 'Venue & Banquets',
      allocatedAmount: 12000,
      actualAmount: 11500,
      notes: 'Ballroom and catering',
    },
    {
      id: 'b-2',
      category: 'Floral & Decor',
      allocatedAmount: 4000,
      actualAmount: 4500, // over by 500
      notes: 'Arch and table runners',
    },
  ],
  milestones: [],
  vendorChecklists: [],
  themeIdeas: [],
  totalAllocatedBudget: 16000,
  totalActualBudget: 16000,
  remainingBudget: 14000,
  milestoneCompletionPercentage: 50,
};

describe('BudgetTracker Component (Accessibility & Financial Logic)', () => {
  it('renders progress bar with correct ARIA attributes and category cards', () => {
    const onAdd = vi.fn();
    const onAnnounce = vi.fn();

    render(
      <BudgetTracker
        plan={mockPlan}
        onAddBudgetItem={onAdd}
        onAnnounce={onAnnounce}
      />
    );

    // Section heading
    expect(screen.getByRole('heading', { name: /Budget Allocation Tracker/i })).toBeInTheDocument();

    // Progress bar
    const progressbar = screen.getByRole('progressbar', { name: /Budget Allocation Progress/i });
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute('aria-valuenow', '53'); // 16000 / 30000 = 53%

    // Category cards
    expect(screen.getByText('Venue & Banquets')).toBeInTheDocument();
    expect(screen.getByText('Floral & Decor')).toBeInTheDocument();

    // Category over warning check for Floral & Decor
    expect(screen.getByText(/Exceeds category budget by USD 500/i)).toBeInTheDocument();
  });

  it('allows opening the Add Expense Item modal and submitting a new line item', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn().mockResolvedValue(undefined);
    const onAnnounce = vi.fn();

    render(
      <BudgetTracker
        plan={mockPlan}
        onAddBudgetItem={onAdd}
        onAnnounce={onAnnounce}
      />
    );

    // Click Add Expense Item button
    const addBtn = screen.getByRole('button', { name: /Add Expense Item/i });
    await user.click(addBtn);

    // Dialog should appear
    expect(screen.getByRole('dialog', { name: /Add Budget Line Item/i })).toBeInTheDocument();

    // Fill form
    const categoryInput = screen.getByLabelText(/Category Name/i);
    await user.type(categoryInput, 'Cinematic Videography');

    const allocatedInput = screen.getByLabelText(/Allocated \(USD\)/i);
    await user.type(allocatedInput, '2500');

    // Submit
    const saveBtn = screen.getByRole('button', { name: /Add Line Item/i });
    await user.click(saveBtn);

    expect(onAdd).toHaveBeenCalledWith({
      category: 'Cinematic Videography',
      allocatedAmount: 2500,
      actualAmount: 0,
      notes: undefined,
    });
  });
});
