// Replace with the deployed assessment app URL when available.
export const APP_URL = "#demo";
export const ACCU_SCHEME_URL =
  "https://cer.gov.au/schemes/australian-carbon-credit-unit-scheme";
export const COP31_SOURCE_URL =
  "https://minister.dcceew.gov.au/bowen/transcripts/press-conference-un-climate-meetings-sb64-bonn-germany";

// Snapshot computed with the latest app's demoInput + calculateAssessment.
// Source commit: 761f1f1bac4cafcd4c16e67f5df4bb3b809cbad0.
// Recompute when the app's calculation engine or demonstration inputs change.
export const DEMO = {
  farm: "Green Valley Dairy",
  abatement: 1096.91776,
  potentialAccus: 1096,
  price: 35,
  grossValue: 38392.1216,
  readiness: 50,
  eligibility: "Likely compatible",
  preparation: "Evidence needed",
  viability: "Potentially attractive",
  calculation: "Projected",
  phases: [
    { label: "Explore", complete: 5, total: 5, progress: 100 },
    { label: "Before application", complete: 4, total: 6, progress: 67 },
    { label: "Before first report", complete: 0, total: 7, progress: 0 },
  ],
};

export const formatNumber = (value: number, decimals = 0) =>
  new Intl.NumberFormat("en-AU", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
export const formatMoney = (value: number) => `A$${formatNumber(value)}`;
