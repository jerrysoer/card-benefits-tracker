interface StampProps {
  type?: "circle" | "rect" | "postmark";
  text?: string;
  opacity?: number;
  className?: string;
  size?: number;
}

export default function Stamp({
  type = "circle",
  text,
  opacity = 0.08,
  className = "",
  size = 80,
}: StampProps) {
  if (type === "circle") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        className={className}
        style={{ opacity }}
        aria-hidden="true"
      >
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="var(--color-border-strong)"
          strokeWidth="2.5"
          strokeDasharray="4 2"
        />
        <circle
          cx="40"
          cy="40"
          r="30"
          fill="none"
          stroke="var(--color-border-strong)"
          strokeWidth="1"
        />
        {text && (
          <text
            x="40"
            y="42"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--color-border-strong)"
            fontSize="9"
            fontFamily="'DM Sans', sans-serif"
            fontWeight="700"
            letterSpacing="0.08em"
          >
            {text}
          </text>
        )}
      </svg>
    );
  }

  if (type === "rect") {
    return (
      <svg
        width={size * 1.5}
        height={size * 0.6}
        viewBox="0 0 120 48"
        className={className}
        style={{ opacity }}
        aria-hidden="true"
      >
        <rect
          x="2"
          y="2"
          width="116"
          height="44"
          fill="none"
          stroke="var(--color-border-strong)"
          strokeWidth="2"
          rx="3"
        />
        <rect
          x="6"
          y="6"
          width="108"
          height="36"
          fill="none"
          stroke="var(--color-border-strong)"
          strokeWidth="0.5"
          rx="2"
        />
        {text && (
          <text
            x="60"
            y="26"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--color-border-strong)"
            fontSize="10"
            fontFamily="'DM Sans', sans-serif"
            fontWeight="700"
            letterSpacing="0.1em"
          >
            {text}
          </text>
        )}
      </svg>
    );
  }

  // postmark
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      className={className}
      style={{ opacity, transform: "rotate(-12deg)" }}
      aria-hidden="true"
    >
      <circle
        cx="40"
        cy="40"
        r="36"
        fill="none"
        stroke="var(--color-border-strong)"
        strokeWidth="2"
      />
      <line
        x1="4"
        y1="28"
        x2="76"
        y2="28"
        stroke="var(--color-border-strong)"
        strokeWidth="1"
      />
      <line
        x1="4"
        y1="38"
        x2="76"
        y2="38"
        stroke="var(--color-border-strong)"
        strokeWidth="1"
      />
      <line
        x1="4"
        y1="48"
        x2="76"
        y2="48"
        stroke="var(--color-border-strong)"
        strokeWidth="1"
      />
      {text && (
        <text
          x="40"
          y="62"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--color-border-strong)"
          fontSize="8"
          fontFamily="'DM Sans', sans-serif"
          fontWeight="700"
          letterSpacing="0.05em"
        >
          {text}
        </text>
      )}
    </svg>
  );
}
