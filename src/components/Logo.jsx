export default function Logo({ size = 28 }) {
  const fontStyle = { fontSize: size * 0.75, fontWeight: 800 };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size * 0.35,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="bid-logo-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        <rect
          x="8"
          y="8"
          width="16"
          height="16"
          rx="4"
          transform="rotate(45 16 16)"
          fill="url(#bid-logo-gradient)"
        />
      </svg>
      <span style={fontStyle}>BID</span>
    </span>
  );
}