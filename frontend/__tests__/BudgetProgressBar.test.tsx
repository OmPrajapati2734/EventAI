import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BudgetProgressBar } from '../components/BudgetProgressBar';
import type { BudgetItem } from '../lib/types';

describe('BudgetProgressBar (Accessibility & Calculations)', () => {
  const mockBudgetItems: BudgetItem[] = [
    { id: 'b-1', category: 'Venue', allocatedAmount: 5000, actualAmount: 4800, notes: 'Main hall' },
    { id: 'b-2', category: 'Catering', allocatedAmount: 4000, actualAmount: 4200, notes: 'Plated dinner' },
  ];

  it('renders progress bar with correct ARIA attributes', () => {
    const onAdd = vi.fn();
    const onAnnounce = vi.fn();

    render(
      <BudgetProgressBar
        totalBudgetLimit={10000}
        currency="USD"
        budgetItems={mockBudgetItems}
        onAddBudgetItem={onAdd}
        onAnnounce={onAnnounce}
      />
    );

    const progressBar = screen.getByRole('progressbar', { name: /Planned budget allocation progress/i });
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '9000'); // 5000 + 4000
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '10000');
  });

  it('displays role="alert" when budget allocations exceed budget limit', () => {
    const onAdd = vi.fn();
    const onAnnounce = vi.fn();

    const overLimitItems: BudgetItem[] = [
      { id: 'b-1', category: 'Venue', allocatedAmount: 7000, actualAmount: 7000 },
      { id: 'b-2', category: 'Catering', allocatedAmount: 5000, actualAmount: 5000 },
    ];

    render(
      <BudgetProgressBar
        totalBudgetLimit={10000} // Total allocated is 12000 > 10000
        currency="USD"
        budgetItems={overLimitItems}
        onAddBudgetItem={onAdd}
        onAnnounce={onAnnounce}
      />
    );

    const alertBox = screen.getByRole('alert');
    expect(alertBox).toBeInTheDocument();
    expect(alertBox).toHaveTextContent(/Budget Ceiling Warning Exceeded/i);
    expect(alertBox).toHaveTextContent(/USD 2,000/i);
  });

  it('allows expanding and adding a new budget line item', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn().mockResolvedValue(undefined);
    const onAnnounce = vi.fn();

    render(
      <BudgetProgressBar
        totalBudgetLimit={15000}
        currency="USD"
        budgetItems={mockBudgetItems}
        onAddBudgetItem={onAdd}
        onAnnounce={onAnnounce}
      />
    );

    // Expand add line item form
    const toggleBtn = screen.getByRole('button', { name: /\+ Add Line Item/i });
    await user.click(toggleBtn);

    expect(screen.getByText(/Add New Expense Line Item/i)).toBeInTheDocument();

    // Fill form
    await user.type(screen.getByLabelText(/^Category$/i), 'Floral Styling');
    await user.type(screen.getByLabelText(/^Allocated/i), '1500');
    await user.type(screen.getByLabelText(/^Actual Spent/i), '1400');

    // Submit
    await user.click(screen.getByRole('button', { name: /Save Line Item/i }));

    expect(onAdd).toHaveBeenCalledWith({
      category: 'Floral Styling',
      allocatedAmount: 1500,
      actualAmount: 1400,
      notes: '',
    });
    expect(onAnnounce).toHaveBeenCalledWith(
      expect.stringContaining('Appended budget item Floral Styling')
    );
  });
});
