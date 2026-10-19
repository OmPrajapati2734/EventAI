import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EventAI - GenAI Celebration & Event Planner',
  description:
    'AI-powered celebration planner for Weddings, Birthdays, and Community Gatherings with real-time budgets, timelines, and vendor checklists.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
        {/* WCAG Skip to Main Content Navigation Anchor */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
