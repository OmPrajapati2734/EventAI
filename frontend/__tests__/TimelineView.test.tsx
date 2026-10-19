import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimelineView } from '../components/TimelineView';
import type { TimelineMilestone } from '../lib/types';

describe('TimelineView (Accessibility & Filtering)', () => {
  const mockMilestones: TimelineMilestone[] = [
    { id: 'm-1', time: '10:00 AM', title: 'Hair & Makeup Suite Opens', description: 'Prep and mimosas', isCompleted: true },
    { id: 'm-2', time: '02:00 PM', title: 'Ceremony Begins', description: 'Exchange of vows', isCompleted: false },
    { id: 'm-3', time: '06:00 PM', title: 'Dinner Reception', description: 'Plated service', isCompleted: false },
  ];

  it('renders milestones with accessible role="checkbox" and aria-checked', () => {
    const onToggle = vi.fn();
    const onAnnounce = vi.fn();

    render(
      <TimelineView
        milestones={mockMilestones}
        onToggleMilestone={onToggle}
        onAnnounce={onAnnounce}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(3);

    expect(checkboxes[0]).toHaveAttribute('aria-checked', 'true');
    expect(checkboxes[1]).toHaveAttribute('aria-checked', 'false');
    expect(checkboxes[2]).toHaveAttribute('aria-checked', 'false');
  });

  it('allows toggling milestones with click and keyboard Space', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const onAnnounce = vi.fn();

    render(
      <TimelineView
        milestones={mockMilestones}
        onToggleMilestone={onToggle}
        onAnnounce={onAnnounce}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');

    // Click to toggle
    await user.click(checkboxes[1]!);
    expect(onToggle).toHaveBeenCalledWith('m-2');
    expect(onAnnounce).toHaveBeenCalledWith(
      expect.stringContaining('Marked milestone "Ceremony Begins" as completed')
    );

    // Keyboard Space to toggle
    checkboxes[0]!.focus();
    expect(checkboxes[0]).toHaveFocus();
    await user.keyboard(' ');
    expect(onToggle).toHaveBeenCalledWith('m-1');
  });

  it('filters milestones by pending and completed tabs', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const onAnnounce = vi.fn();

    render(
      <TimelineView
        milestones={mockMilestones}
        onToggleMilestone={onToggle}
        onAnnounce={onAnnounce}
      />
    );

    // Filter to 'pending'
    const pendingTab = screen.getByRole('tab', { name: /pending/i });
    await user.click(pendingTab);

    expect(screen.queryByText(/Hair & Makeup Suite Opens/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Ceremony Begins/i)).toBeInTheDocument();
    expect(screen.getByText(/Dinner Reception/i)).toBeInTheDocument();

    // Filter to 'completed'
    const completedTab = screen.getByRole('tab', { name: /completed/i });
    await user.click(completedTab);

    expect(screen.getByText(/Hair & Makeup Suite Opens/i)).toBeInTheDocument();
    expect(screen.queryByText(/Ceremony Begins/i)).not.toBeInTheDocument();
  });
});
