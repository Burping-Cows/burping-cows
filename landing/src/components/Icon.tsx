type IconName =
  | "leaf"
  | "farm"
  | "check"
  | "warning"
  | "rules"
  | "coin"
  | "clock"
  | "chart"
  | "clipboard"
  | "sprout"
  | "shield"
  | "menu"
  | "close"
  | "arrow"
  | "chevron";
const paths: Record<IconName, React.ReactNode> = {
  leaf: (
    <>
      <path d="M20 4c0 11-3 16-10 16a6 6 0 0 1-6-6C4 7 11 4 20 4Z" />
      <path d="m4 20 10-10" />
    </>
  ),
  farm: (
    <>
      <path d="m3 10 9-7 9 7v11H3Z" />
      <path d="M9 21v-8h6v8M5 10h14M10 8h4" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  warning: (
    <>
      <path d="m12 3 10 18H2Z" />
      <path d="M12 9v5m0 3v.1" />
    </>
  ),
  rules: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </>
  ),
  coin: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 8h-4a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4H9m3-10v12" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  chart: (
    <>
      <path d="M4 3v17h17M8 16v-4m5 4V8m5 8V5" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="5" width="14" height="16" rx="2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="m8 14 3 3 5-6" />
    </>
  ),
  sprout: (
    <>
      <path d="M12 21v-9M12 12C5 12 3 8 3 4c6 0 9 2 9 8Zm0 4c0-7 3-10 9-10 0 6-3 10-9 10Z" />
    </>
  ),
  shield: (
    <>
      <path d="m12 3 8 3v7c0 4-5 7-8 9-3-2-8-5-8-9V6Z" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  chevron: <path d="m8 5 7 7-7 7" />,
};
export default function Icon({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      className={`icon ${className}`}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
