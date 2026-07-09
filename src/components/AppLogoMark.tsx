import type { SVGProps } from "react";

export function AppLogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" {...props}>
      <rect width="32" height="32" rx="8" fill="#0f0f0f" />
      <circle cx="16" cy="15.5" r="9.25" fill="url(#lumenGlow)" />
      <path d="M13.25 11.5v9l6.75-4.5-6.75-4.5z" fill="#ffffff" />
      <defs>
        <radialGradient
          id="lumenGlow"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="translate(16 15.5) scale(9.25)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ff4e45" />
          <stop offset="0.55" stopColor="#ff0000" />
          <stop offset="1" stopColor="#cc0000" />
        </radialGradient>
      </defs>
    </svg>
  );
}
