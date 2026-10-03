import { useId } from "react";
import { APP_URL, DEMO } from "../config";

export function Brand() {
  return (
    <a className="brand" href="#top" aria-label="Burping Cows home">
      <img src="/app-logo.png" alt="" width="48" height="48" />
      <span>
        Burping Cows
        <span className="brand-caption">LESS METHANE. MORE POSSIBILITY.</span>
      </span>
    </a>
  );
}

export function AssessmentLink({
  children,
  secondary = false,
  className = "",
}: {
  children: React.ReactNode;
  secondary?: boolean;
  className?: string;
}) {
  return (
    <a
      className={`button ${secondary ? "button-secondary" : ""} ${className}`}
      href={APP_URL}
    >
      {children}
    </a>
  );
}

// Native disclosure supports keyboard, touch and click without hover-only content.
export function Info({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <details className="info">
      <summary aria-label={`About ${label}`} aria-controls={id}>
        ?
      </summary>
      <span id={id} className="info-content">
        {children}
      </span>
    </details>
  );
}

export function SectionHeading({
  title,
  children,
  center = false,
}: {
  title: string;
  children?: React.ReactNode;
  center?: boolean;
}) {
  return (
    <div className={`section-heading ${center ? "center" : ""}`}>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}

export function ReadinessRing({ small = false }: { small?: boolean }) {
  return (
    <div
      className={`readiness-ring ${small ? "small" : ""}`}
      role="img"
      aria-label={`Demo preparation progress: ${DEMO.readiness} percent`}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="42" className="ring-track" />
        <circle
          cx="50"
          cy="50"
          r="42"
          className="ring-value"
          pathLength="100"
          strokeDasharray={`${DEMO.readiness} 100`}
        />
      </svg>
      <div>
        <strong>
          {DEMO.readiness}
          <span>%</span>
        </strong>
        <span>prepared</span>
      </div>
    </div>
  );
}
