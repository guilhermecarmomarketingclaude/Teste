import React from "react";

type P = { size?: number; color?: string; stroke?: number; style?: React.CSSProperties };

const Svg: React.FC<P & { children: React.ReactNode }> = ({ size = 40, color = "currentColor", stroke = 2.2, style, children }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    {children}
  </svg>
);

export const ISnow: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M12 2v20M4.2 6.5l15.6 11M19.8 6.5L4.2 17.5" />
    <path d="M9.5 3.8L12 6l2.5-2.2M9.5 20.2L12 18l2.5 2.2" />
  </Svg>
);
export const ISun: React.FC<P> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
  </Svg>
);
export const IFlag: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M6 21V3l11 4-11 4" />
    <ellipse cx="9" cy="21" rx="6" ry="1.2" />
  </Svg>
);
export const ILaptop: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="4" y="5" width="16" height="11" rx="1.5" />
    <path d="M2 19h20" />
  </Svg>
);
export const IBox: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z" />
    <path d="M3.5 7.5L12 12l8.5-4.5M12 12v9" />
  </Svg>
);
export const ICap: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M2 9l10-5 10 5-10 5z" />
    <path d="M6 11v5c3 2.5 9 2.5 12 0v-5M22 9v6" />
  </Svg>
);
export const IHourglass: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M6 2.5h12M6 21.5h12M7 2.5c0 5 10 5 10 9.5S7 16.5 7 21.5M17 2.5c0 5-10 5-10 9.5s10 4.5 10 9.5" />
  </Svg>
);
export const ICalendar: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" />
    <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
  </Svg>
);
export const IKey: React.FC<P> = (p) => (
  <Svg {...p}>
    <circle cx="7.5" cy="14.5" r="4.5" />
    <path d="M10.7 11.3L20 2M16 6l3 3M14 8l2 2" />
  </Svg>
);
export const IWifi: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M2 8.5a15 15 0 0 1 20 0M5 12a10.5 10.5 0 0 1 14 0M8.5 15.5a5.5 5.5 0 0 1 7 0" />
    <circle cx="12" cy="19" r="0.6" fill="currentColor" />
  </Svg>
);
export const IChat: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.1A8.5 8.5 0 1 1 21 12z" />
  </Svg>
);
export const ICheck: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M4.5 12.5l5 5 10-11" />
  </Svg>
);
export const IArrow: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </Svg>
);
export const IPin: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M12 21.5s7-6.2 7-11.5a7 7 0 0 0-14 0c0 5.3 7 11.5 7 11.5z" />
    <circle cx="12" cy="10" r="2.6" />
  </Svg>
);
export const IMoon: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" />
  </Svg>
);
export const IHome: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M3 11l9-7 9 7v9.5a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
  </Svg>
);
export const IHeadset: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
    <rect x="3" y="13.5" width="4" height="6" rx="1.5" />
    <rect x="17" y="13.5" width="4" height="6" rx="1.5" />
    <path d="M19 19.5c0 1.5-2 2.5-5 2.5" />
  </Svg>
);
export const ISofa: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M4 11V8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3" />
    <path d="M2.5 12.5a2 2 0 0 1 4 0V15h11v-2.5a2 2 0 0 1 4 0V18h-19z" />
    <path d="M5 18v2M19 18v2" />
  </Svg>
);
export const IPercent: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M19 5L5 19" />
    <circle cx="7" cy="7" r="2.5" />
    <circle cx="17" cy="17" r="2.5" />
  </Svg>
);
export const ISuitcase: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="4" y="7" width="16" height="13" rx="2" />
    <path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2M9 11v5M15 11v5" />
  </Svg>
);
