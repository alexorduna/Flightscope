import "./FlightScopeLogo.css";

interface FlightScopeLogoProps {
  showWordmark?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function FlightScopeLogo({ showWordmark = true, size = "md", className = "" }: FlightScopeLogoProps) {
  const rootClass = ["flightscope-logo", `flightscope-logo--${size}`, className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      <svg
        className="flightscope-logo__mark"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden={showWordmark}
        role={showWordmark ? undefined : "img"}
        aria-label={showWordmark ? undefined : "FlightScope"}
      >
        <rect className="flightscope-logo__plate" width="40" height="40" rx="11" />
        <path
          className="flightscope-logo__arc"
          d="M7 27.5a13 13 0 0 1 26 0"
          strokeWidth="2.25"
          strokeLinecap="round"
        />
        <path
          className="flightscope-logo__path"
          d="M9.5 25.5c5.5-9.5 11-11.5 17.5-7.5"
          strokeWidth="2.25"
          strokeLinecap="round"
        />
        <circle className="flightscope-logo__node" cx="27" cy="18" r="2.75" />
      </svg>

      {showWordmark && (
        <div className="flightscope-logo__text">
          <span className="flightscope-logo__name">FlightScope</span>
          <span className="flightscope-logo__descriptor">Flight search</span>
        </div>
      )}
    </div>
  );
}
