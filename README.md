# Burping Cows

From methane to money, minus the mystery.

A React Native / Expo / TypeScript hackathon app for preliminary Australian dairy and piggery animal-effluent project assessment. It supports one complete numerical pathway: captured biogas destroyed by an open or enclosed flare. Other routes receive screening and preparation guidance with no invented abatement figures.

## Run locally

```sh
npm install
npm start
```

Use `npm run ios`, `npm run android` or `npm run web` to launch your chosen platform. The project uses Expo SDK 57, Expo Router, React Hook Form, Zod and Supabase. The current logo is `assets/branding/green-in-app-logo.png`; the interface uses cream backgrounds and green accents.

With no Supabase environment variables, the app runs in local demo mode and saves assessments on the device. Local drafts persist across restarts. Existing login/signup/logout flows remain available when Supabase is configured.

## Assessment journey

Welcome → Farm & Baseline → Project Route → Scheme Screening → Technical Estimate → Financial Scenario → Results → Action Plan → Saved assessments.

Choose **Use demo farm** to populate the deterministic Green Valley Dairy scenario. You can view, edit, duplicate and delete saved assessments. Profile includes farm defaults and clearly labelled future integration previews for myMLA/NLIS, AgriWebb and CSV; these are not connected services.

Results keep four dimensions separate:

- Eligibility: likely compatible, needs review, potential route issue or outside MVP.
- Preparation: phase progress and evidence tasks, including visible high-priority gaps.
- Viability: insufficient data, potentially attractive, sensitive to assumptions or unfavorable.
- Calculation: incomplete, projected or measured and unverified. The app does not automatically claim independent review.

Unknown answers are stored as `unknown`, never false. Blank numerical fields are unknown; explicitly entered zero remains zero. Animal count is descriptive and never produces ACCUs. Missing gas, operation or project-emissions data keeps abatement incomplete; missing costs keeps viability unassessed. Route changes clear route-dependent technical and financial inputs.

## Calculation and assumptions

The pure engine lives in `src/lib/flare.ts`; eligibility, readiness, finance and orchestration live in separate TypeScript modules. Constants, metadata and market assumptions live in `src/config/assumptions.ts`.

For a stated period, the app applies the explicitly entered flare-operation fraction once to captured biogas, then calculates:

```text
Destroyed methane m³ = operating biogas m³ × methane fraction × destruction efficiency
Methane mass tonnes = destroyed methane m³ × 0.0006784
Gross abatement tCO₂-e = methane mass × 28
Raw net = gross abatement − project emissions for the same period
Net abatement = max(0, raw net)
Annual equivalent = net abatement × 12 / period months
Whole annual planning units = floor(annual equivalent)
```

All calculations retain decimal precision; rounding happens only for display. The raw negative diagnostic remains visible when project emissions exceed gross abatement. Composition and destruction planning defaults require an explicit button press and are labelled illustrative assumptions. Gas quantity, operation and emissions are never inferred.

Density source: [DCCEEW National Inventory Report 2022, Volume 1](https://www.dcceew.gov.au/sites/default/files/documents/national-inventory-report-2022-volume-1.pdf). Route context: [CER Animal Effluent Management method](https://cer.gov.au/schemes/australian-carbon-credit-unit-scheme/accu-scheme-methods/animal-effluent-management-method) and [CER method supplement](https://cer.gov.au/document/supplement-carbon-credits-carbon-farming-initiative-animal-effluent-management-methodology). This is a simplified planning calculation, not the complete regulatory method or an official CER calculator. Baseline, device, monitoring and reporting requirements need project-specific assessment.

Financial scenarios use the unrounded annual equivalent multiplied by editable low/base/high prices. Annual operating cash includes carbon revenue, energy savings and other revenue, less operations, compliance and fees. Payback uses CAPEX plus development cost and only exists for positive annual operating cash. NPV discounts annual cash flows at year end over the entered horizon.

Visible financial assumptions: steady annual operation, constant prices and costs, no tax, financing, inflation or residual asset value, and immediate annual ACCU sale. There is no live market feed. Base NPV above zero with low NPV at least zero is potentially attractive; a negative low NPV is sensitive; nonpositive base NPV or cash flow is unfavorable.

## Deterministic demo

Green Valley Dairy: Dairy, NSW, 500 animals, liquid effluent and anaerobic pond baseline, planning / obtaining quotes, enclosed flare. Biogas is an engineering estimate of 100,000 m³ over 12 months; methane fraction 0.60 and destruction efficiency 0.98 are disclosed planning defaults. Operation fraction 1 and project emissions of 20 tCO₂-e are explicit demo assumptions.

CAPEX A$150,000; development A$0; annual operations A$10,000 plus compliance A$5,000; energy savings, other revenue and fees explicitly zero. Base price A$35, low A$32, high A$42; horizon 15 years and discount 8%.

| Output | Expected value |
| --- | ---: |
| Methane destroyed | 58,800 m³ |
| Methane mass | 39.88992 t CH₄ |
| Gross abatement | 1,116.91776 tCO₂-e |
| Net annual abatement | 1,096.91776 tCO₂-e |
| Whole planning units | 1,096 |
| Gross annual carbon value | A$38,392.1216 |
| Annual operating cash | A$23,392.1216 |
| Simple payback | approximately 6.4124 years |
| NPV | approximately A$50,224 |

## Supabase setup

Copy `.env.example` to `.env` and configure your own Supabase URL and public key. Never put a service-role key in the client.

Apply migrations in order to your intended Supabase project:

1. `supabase/migrations/202610020001_initial.sql` creates assessments, app configuration, ownership and RLS.
2. `supabase/migrations/202610030002_flare_assessments.sql` adds the new input/result JSON fields and widens farm/state/count validation without removing old rows or policies.

For an existing project, apply only migrations not already recorded. The new migration is required before cloud saving this updated model. It has not been applied to a remote database during this implementation.

Enable Supabase email authentication and configure the `burpingcows://auth/callback` redirect for native auth callbacks. Configure the corresponding browser origin for web callbacks. Anonymous auth must be enabled if guests should save remotely. Permanent accounts use account-scoped drafts; the repository also filters by device ID and RLS enforces authenticated ownership. Failed cloud saves show an error and retain the draft; they do not silently claim success.

Each saved snapshot stores its input, four results, action plan, assumptions, version and timestamps. Version-two snapshots reload without recalculation. Legacy snapshots are retained in `legacySnapshot` while the editable input is upgraded for review; old herd-based estimates are never translated into new biogas estimates. Legacy drafts are backed up before normalization. Editing or duplicating a legacy record preserves its archived original evidence.

## Verification

```sh
npm test
npm run typecheck
npm run lint
npm run export:web
npx expo export --platform ios --output-dir /tmp/burping-cows-ios-export
```

Tests cover the F01 fixture, invalid and missing inputs, explicit zero, operation applied once, annualisation, eligibility precedence, unknown answers, unsupported routes, route invalidation, finance classifications, phase progress totals, snapshot preservation, incomplete save/reload, draft resume and account isolation.

For a manual check, launch the app, select Use demo farm, continue through the five input screens, inspect the four independent results and action plan, save, restart and reload. Repeat with blank gas/cost data and verify that numerical outputs remain incomplete. Integration previews must remain labelled future features.

Burping Cows provides preliminary decision support only. Results are indicative and do not constitute Clean Energy Regulator approval, professional advice, audit verification or a guarantee of Australian Carbon Credit Units.
