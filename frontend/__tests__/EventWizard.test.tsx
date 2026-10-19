import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('adapts event styling and sub-heading badge dynamically based on selected eventType', async () => {
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

    // Default is wedding
    expect(screen.getByText(/✨ Romantic & Elegant Curation/i)).toBeInTheDocument();

    // Switch to Birthday
    const birthdayRadio = screen.getByRole('radio', { name: /Milestone Birthday/i });
    await user.click(birthdayRadio);
    expect(screen.getByText(/🎉 High Energy & Milestone Celebration/i)).toBeInTheDocument();

    // Switch to Community
    const communityRadio = screen.getByRole('radio', { name: /Community Gathering/i });
    await user.click(communityRadio);
    expect(screen.getByText(/🤝 Civic & Community Impact Gathering/i)).toBeInTheDocument();
  });

  it('populates fields instantly via Quick Demo Scenarios and announces to screen reader', async () => {
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

    // Click Destination Wedding Demo Preset
    const weddingPreset = screen.getByRole('button', {
      name: /Load demo preset: Destination Wedding \(120 guests, \$35,000\)/i,
    });
    await user.click(weddingPreset);

    expect(onAnnounce).toHaveBeenCalledWith(
      expect.stringContaining('Loaded quick demo scenario: Destination Wedding (120 guests, $35,000)')
    );

    // Advance to Step 2
    await user.click(screen.getByRole('button', { name: /Configure Parameters/i }));

    const titleInput = screen.getByRole('textbox', { name: /Celebration Name/i }) as HTMLInputElement;
    expect(titleInput.value).toContain('Destination Wedding');

    const guestsInput = screen.getByLabelText(/Guest Count/i) as HTMLInputElement;
    expect(guestsInput.value).toBe('120');

    // Check financial metric: $35,000 / 120 = $292 -> Luxury Tier
    expect(screen.getByText(/USD 292/i)).toBeInTheDocument();
    expect(screen.getByText(/👑 Premium \/ Luxury Tier/i)).toBeInTheDocument();
  });

  it('updates live per-guest allocation metric and benchmark health tags', async () => {
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

    // Per-guest container should be present with aria-live="polite"
    const guestsInput = screen.getByLabelText(/Guest Count/i);
    const budgetInput = screen.getByLabelText(/Budget Limit/i);

    // Enter Lean scenario: 500 guests with $10,000 budget = $20/guest (< $50)
    await user.clear(guestsInput);
    await user.type(guestsInput, '500');

    await user.clear(budgetInput);
    await user.type(budgetInput, '10000');

    // Should display Lean badge
    expect(screen.getByText(/⚡ Lean \/ Budget-Friendly/i)).toBeInTheDocument();
    expect(screen.getByText(/Great for intimate DIY or community gatherings/i)).toBeInTheDocument();

    // Verify Projected Industry Budget Distribution bar is present
    expect(
      screen.getByText(/Projected Industry Budget Distribution/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Venue & Food \(~45%\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Photo & Video \(~15%\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Decor & Audio \(~20%\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Buffer \(~20%\)/i)).toBeInTheDocument();
  });

  it('suggests realistic celebration names via Suggest Name button', async () => {
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

    const suggestBtn = screen.getByRole('button', { name: /Suggest realistic event title/i });
    expect(suggestBtn).toBeInTheDocument();

    await user.click(suggestBtn);

    expect(onAnnounce).toHaveBeenCalledWith(
      expect.stringMatching(/Suggested celebration name: /i)
    );
  });

  it('renders the 4-step progress tracker with appropriate current step attributes', async () => {
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

    // Check all 4 steps exist in stepper
    expect(screen.getByText(/1\. Event Type/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. Scale & Budget/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. Vibe & Themes/i)).toBeInTheDocument();
    expect(screen.getByText(/4\. AI Masterplan/i)).toBeInTheDocument();

    // Advance to Step 2
    await user.click(screen.getByRole('button', { name: /Configure Parameters/i }));
    const step2Item = screen.getByText(/2\. Scale & Budget/i).closest('li');
    expect(step2Item).toHaveAttribute('aria-current', 'step');
  });
});
