"use client";

import { useState } from "react";

/**
 * One-sentence pipeline description shown on hover/tap.
 */
export function PipelineTooltip({
  name,
  description,
  children,
}: {
  name: string;
  description: string;
  children: React.ReactNode;
}) {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline-flex items-center gap-1 cursor-help"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      tabIndex={0}
      role="button"
      aria-label={`${name}: ${description}`}
    >
      {children}
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        className="text-text-secondary/50 shrink-0"
      >
        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1" />
        <text
          x="7"
          y="10.5"
          textAnchor="middle"
          fill="currentColor"
          fontSize="9"
          fontFamily="inherit"
        >
          ?
        </text>
      </svg>

      {show && (
        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-text-primary text-white text-xs rounded-lg whitespace-nowrap shadow-lg z-50 pointer-events-none">
          {description}
          <span className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-text-primary rotate-45 -mt-1" />
        </span>
      )}
    </span>
  );
}
