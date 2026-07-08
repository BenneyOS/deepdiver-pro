// "Ace" — the Diagnostic Grand Prix race engineer / pit-crew strategist.
// Original character (no Nintendo/animal likeness): a bold racing helmet with
// a headset mic. Keeps the dry-expert peer voice of the old mascot. The export
// name stays `Ada`/`AdaExpression` so callers don't churn; only the art +
// label change. Five expression states map to the PRD's idle / pleased /
// thinking / impressed / encouraging-after-miss.
export type AdaExpression = "neutral" | "pleased" | "thinking" | "impressed" | "unbothered";

interface AdaProps {
  expression: AdaExpression;
  size?: number;
}

export function Ada({ expression, size = 48 }: AdaProps) {
  // Shell color leans gold when things are going well, race-red otherwise.
  const shell =
    expression === "pleased" || expression === "impressed"
      ? "var(--turbo-gold)"
      : "var(--race-red)";

  return (
    <div
      className={`inline-flex items-center justify-center ${expression === "impressed" ? "animate-streak-pop" : ""}`}
      role="img"
      aria-label={`Ace the race engineer — ${expression}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Headset earcup + mic boom (behind the helmet) */}
        <path
          d="M14 34 Q10 34 10 40 L10 44"
          stroke="var(--ink)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="12" cy="46" r="3" fill="var(--ink)" />

        {/* Helmet shell */}
        <path
          d="M32 10 C20 10 13 19 13 31 L13 40 C13 42 15 44 17 44 L47 44 C49 44 51 42 51 40 L51 31 C51 19 44 10 32 10 Z"
          fill={shell}
          stroke="var(--ink)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Racing stripe over the crown */}
        <path
          d="M30 10.4 L30 27 L34 27 L34 10.4 Q32 10 30 10.4 Z"
          fill="var(--ink)"
          opacity="0.85"
        />

        {/* Visor housing */}
        <path
          d="M17 27 L47 27 L47 37 C47 39 45 41 42 41 L22 41 C19 41 17 39 17 37 Z"
          fill="var(--card)"
          stroke="var(--ink)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Visor glass / eyes — expression-driven */}
        {expression === "thinking" ? (
          <>
            <rect x="20" y="30" width="24" height="8" rx="4" fill="var(--ink)" opacity="0.12" />
            <circle cx="28" cy="34" r="2.4" fill="var(--ink)">
              <animateTransform attributeName="transform" type="translate" values="0,0;3,0;0,0" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="38" cy="34" r="2.4" fill="var(--ink)">
              <animateTransform attributeName="transform" type="translate" values="0,0;3,0;0,0" dur="2s" repeatCount="indefinite" />
            </circle>
          </>
        ) : expression === "pleased" || expression === "impressed" ? (
          <>
            <rect x="20" y="30" width="24" height="8" rx="4" fill="var(--track-green)" opacity="0.55" />
            <path d="M25 35 Q28 31 31 35" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M35 35 Q38 31 41 35" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          </>
        ) : expression === "unbothered" ? (
          <>
            <rect x="20" y="30" width="24" height="8" rx="4" fill="var(--ink)" opacity="0.12" />
            <line x1="24" y1="34" x2="31" y2="34" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" />
            <line x1="35" y1="34" x2="42" y2="34" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" />
          </>
        ) : (
          <>
            <rect x="20" y="30" width="24" height="8" rx="4" fill="var(--ink)" opacity="0.12" />
            <circle cx="28" cy="34" r="2.6" fill="var(--ink)" />
            <circle cx="38" cy="34" r="2.6" fill="var(--ink)" />
          </>
        )}

        {/* Mic in front of the chin bar */}
        <line x1="12" y1="46" x2="26" y2="43" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="27" cy="43" r="2.4" fill="var(--race-red)" stroke="var(--ink)" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
