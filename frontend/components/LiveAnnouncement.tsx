'use client';

import React from 'react';

interface LiveAnnouncementProps {
  message: string;
}

/**
 * Screen Reader Live Region component (WCAG 2.1 AA Compliance)
 * Ensures assistive technology users receive real-time notifications for:
 * - Dynamic AI generation states
 * - Milestone checklist status changes
 * - Budget updates and over-limit warnings
 */
export function LiveAnnouncement({ message }: LiveAnnouncementProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}
