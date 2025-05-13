import type { SVGProps } from 'react';

export function FrameMapperLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="FrameMapper Logo"
      {...props}
    >
      {/* Simple abstract representation of two connected frames */}
      <rect x="15" y="15" width="40" height="70" rx="5" className="text-primary" />
      <rect x="45" y="15" width="40" height="70" rx="5" className="text-accent" />
      <line x1="40" y1="45" x2="60" y2="55" className="stroke-foreground" strokeWidth="6" />
      <line x1="40" y1="55" x2="60" y2="45" className="stroke-foreground" strokeWidth="6" />
    </svg>
  );
}
