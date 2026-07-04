export type AdaExpression = "neutral" | "pleased" | "thinking" | "impressed" | "unbothered";

interface AdaProps {
  expression: AdaExpression;
  size?: number;
}

export function Ada({ expression, size = 48 }: AdaProps) {
  return (
    <div
      className={`inline-flex items-center justify-center ${expression === "impressed" ? "animate-streak-pop" : ""}`}
      role="img"
      aria-label={`Ada the owl — ${expression}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Body */}
        <ellipse cx="32" cy="38" rx="18" ry="20" fill="var(--card-2)" />

        {/* Head */}
        <circle cx="32" cy="22" r="16" fill="var(--card-2)" />

        {/* Ear tufts */}
        <path d="M18 12 L22 18 L16 18Z" fill="var(--accent)" />
        <path d="M46 12 L42 18 L48 18Z" fill="var(--accent)" />

        {/* Eye rings */}
        <circle cx="25" cy="22" r="7" fill="var(--card)" stroke="var(--accent)" strokeWidth="1.5" />
        <circle cx="39" cy="22" r="7" fill="var(--card)" stroke="var(--accent)" strokeWidth="1.5" />

        {/* Pupils — expression-driven */}
        {expression === "thinking" ? (
          <>
            <circle cx="25" cy="21" r="2.5" fill="var(--text-dim)">
              <animateTransform attributeName="transform" type="translate" values="0,0;2,0;0,0" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="39" cy="21" r="2.5" fill="var(--text-dim)">
              <animateTransform attributeName="transform" type="translate" values="0,0;2,0;0,0" dur="2s" repeatCount="indefinite" />
            </circle>
          </>
        ) : expression === "pleased" || expression === "impressed" ? (
          <>
            {/* Happy eyes — curved lines */}
            <path d="M22 22 Q25 19 28 22" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M36 22 Q39 19 42 22" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" fill="none" />
          </>
        ) : expression === "unbothered" ? (
          <>
            {/* Half-lidded */}
            <circle cx="25" cy="23" r="2" fill="var(--text-dim)" />
            <circle cx="39" cy="23" r="2" fill="var(--text-dim)" />
            <line x1="21" y1="20" x2="29" y2="20" stroke="var(--card-2)" strokeWidth="2.5" />
            <line x1="35" y1="20" x2="43" y2="20" stroke="var(--card-2)" strokeWidth="2.5" />
          </>
        ) : (
          <>
            {/* Neutral eyes */}
            <circle cx="25" cy="22" r="2.5" fill="var(--text)" />
            <circle cx="39" cy="22" r="2.5" fill="var(--text)" />
          </>
        )}

        {/* Beak */}
        <path d="M29 27 L32 31 L35 27Z" fill="var(--accent)" />

        {/* Belly */}
        <ellipse cx="32" cy="42" rx="10" ry="12" fill="var(--card)" />

        {/* Belly chevrons */}
        <path d="M28 36 L32 39 L36 36" stroke="var(--text-faint)" strokeWidth="1" fill="none" />
        <path d="M28 40 L32 43 L36 40" stroke="var(--text-faint)" strokeWidth="1" fill="none" />
        <path d="M28 44 L32 47 L36 44" stroke="var(--text-faint)" strokeWidth="1" fill="none" />

        {/* Feet */}
        <path d="M25 56 L22 60 M25 56 L25 60 M25 56 L28 60" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M39 56 L36 60 M39 56 L39 60 M39 56 L42 60" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}
