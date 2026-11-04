import type { ReactNode } from "react";

export const Arrow = () => (
  <svg className="arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const VMark = ({ size = 34 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden="true">
    <line x1="18" y1="40" x2="50" y2="104" stroke="#F2F4F8" strokeWidth="14" strokeLinecap="round" />
    <line x1="50" y1="104" x2="90" y2="33" stroke="#3DF2C6" strokeWidth="14" strokeLinecap="round" />
    <circle cx="102" cy="13" r="8" fill="#3DF2C6" />
  </svg>
);

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "ghost";
  href?: string;
  external?: boolean;
  arrow?: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

/** A pill wrapped in a magnet: the wrapper leans toward the cursor, the pill keeps its spring. */
export function Button({ children, variant = "primary", href, external, arrow, onClick }: ButtonProps) {
  const className = variant === "primary" ? "btn" : "btn btn--ghost";
  return (
    <span className="magnet" data-magnet>
      {href ? (
        <a className={className} href={href} onClick={onClick} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {children}
          {arrow && <Arrow />}
        </a>
      ) : (
        <button type="button" className={className} onClick={onClick}>
          {children}
          {arrow && <Arrow />}
        </button>
      )}
    </span>
  );
}
