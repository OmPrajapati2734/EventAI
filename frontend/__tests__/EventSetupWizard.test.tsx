import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventSetupWizard } from '../components/EventSetupWizard';

describe('EventSetupWizard (Accessibility & UX)', () => {
  it('renders with semantic fieldset, legend, and radiogroup attributes', () => {
    const onComplete = vi.fn();
    const onAnnounce = vi.fn();

    render(
      <EventSetupWizard
        onComplete={onComplete}
        isLoading={false}
        onAnnounce={onAnnounce}
      />
    );

    // 1. Semantic fieldset & legend
    const legend = screen.getByText(/What celebration are we orchestrating\?/i);
    expect(legend).toBeInTheDocument();

    // 2. Radiogroup landmark
    const radiogroup = screen.getByRole('radiogroup', { name: /Event Archetype Selection/i });
    expect(radiogroup).toBeInTheDocument();

    // 3. Archetype radio buttons with aria-checked
    const weddingRadio = screen.getByRole('radio', { name: /wedding/i });
    const birthdayRadio = screen.getByRole('radio', { name: /birthday/i });
    const communityRadio = screen.getByRole('radio', { name: /community/i });

    expect(weddingRadio).toHaveAttribute('aria-checked', 'true');
    expect(birthdayRadio).toHaveAttribute('aria-checked', 'false');
    expect(communityRadio).toHaveAttribute('aria-checked', 'false');
  });

  it('supports full keyboard navigation between steps using Tab and Enter', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const onAnnounce = vi.fn();

    render(
      <EventSetupWizard
        onComplete={onComplete}
        isLoading={false}
        onAnnounce={onAnnounce}
      />
    );

    // Select Birthday archetype using keyboard
    const birthdayRadio = screen.getByRole('radio', { name: /birthday/i });
    birthdayRadio.focus();
    expect(birthdayRadio).toHaveFocus();

    await user.keyboard(' ');
    expect(birthdayRadio).toHaveAttribute('aria-checked', 'true');
    expect(onAnnounce).toHaveBeenCalledWith('Selected birthday event archetype.');

    // Tab to Continue button and press Enter
    const continueBtn = screen.getByRole('button', { name: /continue/i });
    continueBtn.focus();
    expect(continueBtn).toHaveFocus();

    await user.keyboard('{Enter}');

    // Step 2 should now be visible
    expect(screen.getByText(/Event Details & Scope/i)).toBeInTheDocument();
    expect(onAnnounce).toHaveBeenCalledWith(
      'Navigated to Step 2: Set event date, budget, and guest count.'
    );
  });

  it('triggers validation errors and announces issues when required fields are empty', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const onAnnounce = vi.fn();

    render(
      <EventSetupWizard
        onComplete={onComplete}
        isLoading={false}
        onAnnounce={onAnnounce}
      />
    );

    // Navigate to step 2
    await user.click(screen.getByRole('button', { name: /continue/i }));

    // Clear event title
    const titleInput = screen.getByLabelText(/Event Title/i);
    await user.clear(titleInput);

    // Try to continue
    await user.click(screen.getByRole('button', { name: /continue/i }));

    // Error message displayed and aria-invalid set
    expect(screen.getByText(/Event title is required/i)).toBeInTheDocument();
    expect(titleInput).toHaveAttribute('aria-invalid', 'true');
    expect(onAnnounce).toHaveBeenCalledWith(
      'Please resolve the highlighted validation errors to proceed.'
    );
  });

  it('submits validated data on step 3 completion and triggers loading state', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn().mockResolvedValue(undefined);
    const onAnnounce = vi.fn();

    const { rerender } = render(
      <EventSetupWizard
        onComplete={onComplete}
        isLoading={false}
        onAnnounce={onAnnounce}
      />
    );

    // Step 1 -> Step 2
    await user.click(screen.getByRole('button', { name: /continue/i }));

    // Step 2: Fill Title
    const titleInput = screen.getByLabelText(/Event Title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Maya 30th Rooftop Gala');

    // Step 2 -> Step 3
    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByText(/Personalized AI Guidance/i)).toBeInTheDocument();

    // Step 3: Fill preferences
    const prefInput = screen.getByLabelText(/Aesthetic Vision & Special Requests/i);
    await user.type(prefInput, 'Cyberpunk neon glow and cocktail lounge');

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Orchestrate Plan with Gemini/i });
    await user.click(submitBtn);

    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Maya 30th Rooftop Gala',
        eventType: 'wedding',
        userPreferences: 'Cyberpunk neon glow and cocktail lounge',
      })
    );

    // Rerender in loading state
    rerender(
      <EventSetupWizard
        onComplete={onComplete}
        isLoading={true}
        onAnnounce={onAnnounce}
      />
    );

    expect(screen.getByText(/Synthesizing Plan\.\.\./i)).toBeInTheDocument();
  });
});
