import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

const baseSvg = (
  path: React.ReactNode,
  className = 'w-5 h-5',
  props: IconProps = {}
) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    className={className}
    {...props}
  >
    {path}
  </svg>
);

export function Calendar({ className, ...props }: IconProps) {
  return baseSvg(
    <>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </>,
    className,
    props
  );
}

export function Users({ className, ...props }: IconProps) {
  return baseSvg(
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>,
    className,
    props
  );
}

export function DollarSign({ className, ...props }: IconProps) {
  return baseSvg(
    <>
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </>,
    className,
    props
  );
}

export function Sparkles({ className, ...props }: IconProps) {
  return baseSvg(
    <>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </>,
    className,
    props
  );
}

export function Clock({ className, ...props }: IconProps) {
  return baseSvg(
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </>,
    className,
    props
  );
}

export function CheckCircle2({ className, ...props }: IconProps) {
  return baseSvg(
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </>,
    className,
    props
  );
}

export function AlertTriangle({ className, ...props }: IconProps) {
  return baseSvg(
    <>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" x2="12" y1="9" y2="13" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
    </>,
    className,
    props
  );
}

export function AlertCircle({ className, ...props }: IconProps) {
  return baseSvg(
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </>,
    className,
    props
  );
}

export function ChevronRight({ className, ...props }: IconProps) {
  return baseSvg(<polyline points="9 18 15 12 9 6" />, className, props);
}

export function ChevronLeft({ className, ...props }: IconProps) {
  return baseSvg(<polyline points="15 18 9 12 15 6" />, className, props);
}

export function Plus({ className, ...props }: IconProps) {
  return baseSvg(
    <>
      <line x1="12" x2="12" y1="5" y2="19" />
      <line x1="5" x2="19" y1="12" y2="12" />
    </>,
    className,
    props
  );
}

export function Check({ className, ...props }: IconProps) {
  return baseSvg(<polyline points="20 6 9 17 4 12" />, className, props);
}

export function X({ className, ...props }: IconProps) {
  return baseSvg(
    <>
      <line x1="18" x2="6" y1="6" y2="18" />
      <line x1="6" x2="18" y1="6" y2="18" />
    </>,
    className,
    props
  );
}

export function ArrowRight({ className, ...props }: IconProps) {
  return baseSvg(
    <>
      <line x1="5" x2="19" y1="12" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </>,
    className,
    props
  );
}

export function ArrowLeft({ className, ...props }: IconProps) {
  return baseSvg(
    <>
      <line x1="19" x2="5" y1="12" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </>,
    className,
    props
  );
}

export function Heart({ className, ...props }: IconProps) {
  return baseSvg(
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />,
    className,
    props
  );
}

export function PartyPopper({ className, ...props }: IconProps) {
  return baseSvg(
    <>
      <path d="M5.8 11.3 2 22l10.7-3.79" />
      <path d="M4 3h.01" />
      <path d="M22 8h.01" />
      <path d="M15 2h.01" />
      <path d="M22 20h.01" />
      <path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.9 2.39l-.27 2.45a3.1 3.1 0 0 1-2.12 2.65L13 11l3 3 1.25-.47a3.1 3.1 0 0 1 2.65-2.12l2.45-.27a2.9 2.9 0 0 0 2.39-1.9L22 2Z" />
      <path d="m11 13-1.5 1.5" />
    </>,
    className,
    props
  );
}

export function Building2({ className, ...props }: IconProps) {
  return baseSvg(
    <>
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v8h4" />
      <path d="M18 9h2a2 2 0 0 1 2 2v11h-4" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </>,
    className,
    props
  );
}

export function Filter({ className, ...props }: IconProps) {
  return baseSvg(
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />,
    className,
    props
  );
}

export function Layers({ className, ...props }: IconProps) {
  return baseSvg(
    <>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </>,
    className,
    props
  );
}

export function RefreshCw({ className, ...props }: IconProps) {
  return baseSvg(
    <>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </>,
    className,
    props
  );
}

export function RotateCcw({ className, ...props }: IconProps) {
  return baseSvg(
    <>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </>,
    className,
    props
  );
}

export function Copy({ className, ...props }: IconProps) {
  return baseSvg(
    <>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </>,
    className,
    props
  );
}

export function CheckCheck({ className, ...props }: IconProps) {
  return baseSvg(
    <>
      <path d="M18 6 7 17l-5-5" />
      <path d="m22 10-7.5 7.5L13 16" />
    </>,
    className,
    props
  );
}

export function Shield({ className, ...props }: IconProps) {
  return baseSvg(
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />,
    className,
    props
  );
}

export function Tag({ className, ...props }: IconProps) {
  return baseSvg(
    <>
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </>,
    className,
    props
  );
}

export function Palette({ className, ...props }: IconProps) {
  return baseSvg(
    <>
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </>,
    className,
    props
  );
}

export function Music({ className, ...props }: IconProps) {
  return baseSvg(
    <>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </>,
    className,
    props
  );
}

export function Camera({ className, ...props }: IconProps) {
  return baseSvg(
    <>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </>,
    className,
    props
  );
}

export function Utensils({ className, ...props }: IconProps) {
  return baseSvg(
    <>
      <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2" />
      <path d="M15 11v11" />
      <path d="M5 2v20" />
      <path d="M2 2h6v5a3 3 0 0 1-6 0V2z" />
    </>,
    className,
    props
  );
}

export function MapPin({ className, ...props }: IconProps) {
  return baseSvg(
    <>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>,
    className,
    props
  );
}

export function Mail({ className, ...props }: IconProps) {
  return baseSvg(
    <>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </>,
    className,
    props
  );
}

export function Phone({ className, ...props }: IconProps) {
  return baseSvg(
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />,
    className,
    props
  );
}

export function Printer({ className, ...props }: IconProps) {
  return baseSvg(
    <>
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect width="12" height="8" x="6" y="14" />
    </>,
    className,
    props
  );
}

export function SlidersHorizontal({ className, ...props }: IconProps) {
  return baseSvg(
    <>
      <line x1="21" x2="14" y1="4" y2="4" />
      <line x1="10" x2="3" y1="4" y2="4" />
      <line x1="21" x2="12" y1="12" y2="12" />
      <line x1="8" x2="3" y1="12" y2="12" />
      <line x1="21" x2="16" y1="20" y2="20" />
      <line x1="12" x2="3" y1="20" y2="20" />
      <line x1="14" x2="14" y1="2" y2="6" />
      <line x1="8" x2="8" y1="10" y2="14" />
      <line x1="16" x2="16" y1="18" y2="22" />
    </>,
    className,
    props
  );
}

export function Search({ className, ...props }: IconProps) {
  return baseSvg(
    <>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" x2="16.65" y1="21" y2="16.65" />
    </>,
    className,
    props
  );
}

export function TrendingUp({ className, ...props }: IconProps) {
  return baseSvg(
    <>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </>,
    className,
    props
  );
}

export function TrendingDown({ className, ...props }: IconProps) {
  return baseSvg(
    <>
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </>,
    className,
    props
  );
}

export function Compass({ className, ...props }: IconProps) {
  return baseSvg(
    <>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </>,
    className,
    props
  );
}

export function Gift({ className, ...props }: IconProps) {
  return baseSvg(
    <>
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect width="20" height="5" x="2" y="7" />
      <line x1="12" x2="12" y1="22" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </>,
    className,
    props
  );
}

// Backwards-compatible aliases for existing files
export const SparklesIcon = Sparkles;
export const CalendarIcon = Calendar;
export const UsersIcon = Users;
export const WalletIcon = DollarSign;
export const CheckCircleIcon = CheckCircle2;
export const AlertTriangleIcon = AlertTriangle;
export const ClockIcon = Clock;
export const RingIcon = Heart;
export const CakeIcon = PartyPopper;
export const FlagIcon = Building2;
export const RefreshIcon = RefreshCw;
export const ChevronRightIcon = ChevronRight;
export const ArrowLeftIcon = ArrowLeft;
