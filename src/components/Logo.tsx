import { useId } from "react";
import { Link } from "react-router-dom";

interface LogoProps {
  size?: "sm" | "lg";
  ariaLabel?: string;
}

export function Logo({ size = "sm", ariaLabel = "BID — inicio" }: LogoProps) {
  const gradientId = `bid-logo-gradient-${useId().replace(/:/g, "")}`;
  const dimension = size === "lg" ? 44 : 30;

  return (
    <Link to="/" className={`logo${size === "lg" ? " logo-lg" : ""}`} aria-label={ariaLabel}>
      <svg
        className="logo-icon"
        width={dimension}
        height={dimension}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7c3aed" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <rect
          x="8"
          y="8"
          width="16"
          height="16"
          rx="4"
          transform="rotate(45 16 16)"
          fill={`url(#${gradientId})`}
        />
      </svg>
      <span className="logo-text">BID</span>
    </Link>
  );
}
