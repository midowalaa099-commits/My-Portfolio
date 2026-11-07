interface BrandLogoProps {
  compact?: boolean
  size?: number
}

export default function BrandLogo({
  compact = false,
  size = 42,
}: BrandLogoProps) {
  return (
    <div className="brand-lockup" aria-label="Order App">
      <svg
        aria-hidden="true"
        className="brand-mark"
        viewBox="0 0 64 64"
        width={size}
        height={size}
      >
        <defs>
          <linearGradient
            id="order-app-gradient"
            x1="8"
            y1="8"
            x2="56"
            y2="58"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#ff9b52" />
            <stop offset="0.5" stopColor="#ff6738" />
            <stop offset="1" stopColor="#f0442e" />
          </linearGradient>
        </defs>
        <path
          d="M32 3C17.1 3 7 13.8 7 27.2c0 17.4 19.8 31.2 23.7 33.7a2.4 2.4 0 0 0 2.6 0C37.2 58.4 57 44.6 57 27.2 57 13.8 46.9 3 32 3Z"
          fill="url(#order-app-gradient)"
        />
        <path d="M19 30.5h26c-.8 8.1-6 13-13 13s-12.2-4.9-13-13Z" fill="#fff" />
        <path
          d="M17.5 27.5h29M24 24.5c1.1-4.2 4-6.5 8-6.5s6.9 2.3 8 6.5"
          stroke="#fff"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="32" cy="15.5" r="2.2" fill="#fff" />
      </svg>
      {!compact && (
        <div className="brand-copy">
          <span className="brand-name">
            Order <strong>App</strong>
          </span>
          <span className="brand-tagline">Good food, right on time.</span>
        </div>
      )}
    </div>
  )
}
