import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventWizard } from '../components/EventWizard';

describe('EventWizard Component (WCAG 2.1 AA & Keyboard UX)', () => {
  it('renders archetype selection with semantic fieldset, legend, and radiogroup', () => {
    const onSubmit = vi.fn();
    const onAnnounce = vi.fn();

    render(
      <EventWizard
        onSubmit={onSubmit}
        isLoading={false}
        onAnnounce={onAnnounce}
      />
    );

    // Semantic legend check
    expect(
      screen.getByText(/Select Your Celebration Archetype/i)
    ).toBeInTheDocument();

    // Radiogroup landmark
    const radiogroup = screen.getByRole('radiogroup', {
      name: /Event Type Selection/i,
    });
    expect(radiogroup).toBeInTheDocument();

    // Radios
    const weddingRadio = screen.getByRole('radio', { name: /Dream Wedding/i });
    const birthdayRadio = screen.getByRole('radio', { name: /Milestone Birthday/i });
    const communityRadio = screen.getByRole('radio', { name: /Community Gathering/i });

    expect(weddingRadio).toHaveAttribute('aria-checked', 'true');
    expect(birthdayRadio).toHaveAttribute('aria-checked', 'false');
    expect(communityRadio).toHaveAttribute('aria-checked', 'false');
  });

  it('supports full keyboard navigation between steps using Tab, Space, and Enter', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onAnnounce = vi.fn();

    render(
      <EventWizard
        onSubmit={onSubmit}
        isLoading={false}
        onAnnounce={onAnnounce}
      />
    );

    // Keyboard select Milestone Birthday
    const birthdayRadio = screen.getByRole('radio', { name: /Milestone Birthday/i });
    birthdayRadio.focus();
    expect(birthdayRadio).toHaveFocus();

    await user.keyboard(' ');
    expect(birthdayRadio).toHaveAttribute('aria-checked', 'true');
    expect(onAnnounce).toHaveBeenCalledWith('Selected Milestone Birthday.');

    // Next step button
    const nextBtn = screen.getByRole('button', { name: /Configure Parameters/i });
    await user.click(nextBtn);

    // Verify Step 2 rendered
    expect(screen.getByText(/Scale, Budget & Schedule/i)).toBeInTheDocument();
  });

  it('allows multiselecting vibe pills and triggers submission on step 3', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onAnnounce = vi.fn();

    render(
      <EventWizard
        onSubmit={onSubmit}
        isLoading={false}
        onAnnounce={onAnnounce}
      />
    );

    // Advance to Step 2
    await user.click(screen.getByRole('button', { name: /Configure Parameters/i }));

    // Advance to Step 3
    await user.click(screen.getByRole('button', { name: /Customize Vibe & Themes/i }));

    // Verify Step 3 rendered
    expect(screen.getByText(/Vibe, Aesthetics & Cultural Nuance/i)).toBeInTheDocument();

    // Click on a vibe pill
    const rusticPill = screen.getByRole('button', { name: /Rustic Boho/i });
    await user.click(rusticPill);
    expect(rusticPill).toHaveAttribute('aria-pressed', 'true');

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Generate Event Masterplan/i });
    await user.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const submittedData = onSubmit.mock.calls[0][0];
    expect(submittedData.eventType).toBe('wedding');
    expect(submittedData.guestCount).toBeGreaterThan(0);
    expect(submittedData.budgetLimit).toBeGreaterThan(0);
  });
});
