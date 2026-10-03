# Burping Cows

A weekend MVP for Australian dairy and piggery farmers exploring methane-to-ACCU feasibility. Built with Expo SDK 57, React Native, TypeScript, Expo Router, React Hook Form, Zod, and Supabase. The green visual direction follows the supplied reference, with original Figma illustrations and local DM Sans fonts. The supplied transparent green cow silhouette logo in `assets/branding/green-in-app-logo.png` is used on the welcome, dashboard, and About screens, and as the app icon and web favicon. Its distinct asset filename refreshes Expo Go’s project loading image. Native icon changes require rebuilding the app; Expo Go retains its own launcher icon.

## Run locally

The current Figma review implementation and remaining visual checks are documented in [docs/figma-review.md](docs/figma-review.md). Original design assets live in `assets/figma`; local DM Sans instances use the reference's optical size 14. Welcome and Profile retain account controls as requested.

Use Node.js 22.13+ (Node 24 LTS recommended) and npm.

```sh
npm install
npx expo start
```

Press `w` for web, `i` for an available iOS simulator, or `a` for an Android emulator. For a physical device, use an Expo Go version supporting SDK 57 or create an SDK-compatible development build. `npm run web`, `npm run ios`, and `npm run android` are also available.

Without Supabase credentials the app runs fully in **local demo mode**. Drafts, farm defaults, onboarding state, device identity, and saved assessments persist in AsyncStorage (browser storage on web). The dashboard starts empty. **Explore demo farm** loads the supplied example into a labelled draft; saving it creates a labelled sample assessment.

## Supabase setup

1. Create a Supabase development project.
2. Enable **Authentication → Sign In / Providers → Email** for account login/signup, and **Anonymous Sign-Ins** for guest access. Keep email confirmation enabled for account signup.
3. Run `supabase/migrations/202610020001_initial.sql` in the SQL editor of the fresh project, or apply it through the Supabase CLI with `supabase db push` after linking the project. The migration creates tables, indexes, constraints, RLS policies, timestamp handling, and default app configuration.
4. Copy `.env.example` to `.env` and supply the project URL and public anon key:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

5. Restart Expo with `npx expo start --clear`.

Never put a service-role key in the client. Public environment variables are bundled into the app. Saved records are owned by the signed-in Supabase user (email/password account or guest session) and protected by `auth.uid() = owner_id` RLS policies. Every record query also filters the persistent device UUID. Device ID is metadata, not authentication. Anonymous accounts use Supabase’s authenticated database role.

Drafts and profile defaults stay local; only **Save assessment** writes a cloud assessment. With configured credentials, network/authentication/database failures display an error and retain the draft. There is no silent fallback to a successful local cloud save. Refresh retries record loading. Local demo assessments are not automatically uploaded when credentials are added; an existing local draft can be explicitly saved to the configured project.

`app_config` is publicly readable and client read-only. Default price, methodology note, and compliance ranges are validated before use. Invalid/unavailable configuration uses bundled defaults. Saved snapshots retain the actual configuration used.

## Login, signup, and email links

Onboarding and Profile link to `/login` and `/signup`. These screens use Supabase email/password authentication, show validation and server errors, and handle signup that requires email confirmation. `/forgot-password` sends a recovery link; `/auth/callback` accepts confirmation/recovery sessions and lets the user set a new password. Passwords are never saved in app storage. Supabase persists the session using its existing storage adapter.

Accounts require the `.env` credentials above. Without them, the forms clearly show local demo mode and disable account submission; guest exploration still works. This checkout contains no live Supabase credentials, so live signup/email delivery must be verified against your project.

In **Authentication → URL Configuration**, allow `burping-cows://auth/callback` and `burping-cows://auth/callback?intent=recovery` for native development/production builds. For Expo Go, allow the exact callback URL produced by `Linking.createURL('/auth/callback')` (including `/--/`), with the recovery query variant. For web, allow your deployed `/auth/callback` URL and its recovery query variant; add localhost equivalents during development. Configure your Site URL and SMTP/email delivery. The default confirmation and recovery templates must retain their `{{ .ConfirmationURL }}` links. See [Supabase mobile deep linking](https://supabase.com/docs/guides/auth/native-mobile-deep-linking) and [password authentication](https://supabase.com/docs/guides/auth/passwords).

Account drafts and farm defaults are stored locally under the account ID. Logging out signs out the current permanent account, hides its cached assessments, and returns to onboarding. Guest logout returns to onboarding while preserving the anonymous session and saved work on that device. Guest assessments are separate from account assessments; signup/login does not migrate guest cloud records. Create an account before saving work you want associated with it.

## Calculations and product rules

All business logic is in `src/lib`; configurable demonstration assumptions are in `src/config/assumptions.ts`.

- GWP: **28**; methane density: **0.716 kg/m³**; initial ACCU price assumption: **A$37**, editable on results. No live price feed.
- Supplied tonnes: multiply by 28. Supplied volume: multiply by 0.716, divide by 1,000, then multiply by 28. Direct inputs already represent methane captured/reduced and are not multiplied by capture efficiency again.
- Animal estimator: dairy **25 kg CH₄/animal/year**, piggery **12 kg**, multiplied by animals and capture efficiency. Only anaerobic baselines support this demonstration estimator. It excludes enteric methane.
- **These factors are simplified demonstration assumptions and are NOT official Clean Energy Regulator methodology values.**
- Estimated ACCUs = floor(CO₂-e). Gross annual value = estimated ACCUs × price; cumulative five-year value = annual gross × 5, with constant volume and price. The chart illustrates cumulative gross value, not a forecast.
- Indicative gross-revenue payback = (implementation cost + midpoint compliance cost) ÷ annual gross value. Missing implementation cost or zero gross value gives “Not available.” Operating costs are shown separately and excluded, along with financing, tax, energy revenue, deductions, and method-specific issuance rules.
- Readiness weights: pathway 20, timing 15, site control 10, flow monitoring 15, gas monitoring 15, electricity/fuel evidence 10, QA plan **and** calibration records 10, positive implementation cost 5. Unknown/partial evidence earns no points. “Strongly prepared” is not audit certification.
- Explicitly unsupported systems, absent site control, or effluent improvement alone are Unlikely under this pathway. Existing capture infrastructure, started projects, missing/uncertain information, and unknown projects require review. Planning only counts as not started. These are demonstration rules, not regulatory decisions.
- High burden: started projects, biomethane, or no meaningful monitoring and no records. Low: flow and gas monitoring, energy/fuel evidence, QA and calibration evidence, and confirmed site control. Remaining cases are Medium. These rules intentionally preserve the demo’s Medium category despite missing sensors.
- Indicative compliance ranges: Low **A$40k–70k**; Medium **A$70k–120k**; High **A$120k–200k+**. Midpoints: A$55k/A$95k/A$160k; the High range has an open upper tail.

The optional sample has 450 dairy animals in VIC, 82 tonnes CH₄/year, a covered-pond project, A$180,000 implementation cost, 10-year illustrative lifetime, confirmed site control, electricity/fuel evidence, and no flow/gas sensors or QA/calibration evidence. Operating cost is unspecified. Expected results: **2,296 tCO₂-e / 2,296 ACCUs / A$84,952 per year / A$424,760 over five years / 60% readiness / Medium burden / ~3.2-year gross payback**.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npx expo install --check
npm run export:web
```

Tests cover calculations, validation, eligibility precedence, readiness evidence, compliance, local persistence, snapshot mapping, draft restoration, duplication, and failure handling.

To verify deployed row-level security, use a **disposable development Supabase project** with the migration applied and `.env` configured:

```sh
node --env-file=.env scripts/verify-supabase.mjs
```

This creates two anonymous accounts and cleans up its test assessment row. It checks ownership, cross-user reads/updates/deletes, forged ownership, owner transfer, unauthenticated access, and read-only configuration. It does not delete the anonymous auth users; remove them through Supabase admin tooling if desired. Live cloud security validation requires actual credentials and is separate from the local test suite.

Manual acceptance flow: welcome → empty home → farm profile → project → results → change price → action plan → save → saved details → edit → duplicate → confirmed delete. Also check invalid/zero inputs, unsupported estimator baselines, draft restoration after reload, loading/error recovery, mobile keyboard behavior, and accessibility text sizing.

## Known limitations

This MVP does not submit official ACCU applications, replace auditors, certify compliance, integrate with CER, calculate official net abatement, provide market prices, or guarantee eligibility or credits. No payments, IoT, reports, admin panel, or complex AI.

Guest accounts have no recovery: clearing browser/app storage, uninstalling, or losing the anonymous session can make guest cloud records inaccessible. Email/password accounts support login and password recovery. Assessment queries remain scoped to the current device as well as account ownership. Anonymous sign-in is safer than device-ID-only filtering but still needs abuse controls and account recovery design before production. Supabase’s anonymous sign-in rate limits apply; configure suitable anti-abuse measures before a public launch. Records use last-write-wins editing and are not a live multi-user workflow.

Drafts save locally as fields change; saved assessment writes are explicit. One draft is active at a time; starting another replaces it. Delete has an in-app confirmation and no undo. The five-year illustration remains five years even if the entered lifetime is shorter; lifetime affects the verdict and is displayed beside the chart.

**Indicative estimate only.** Actual ACCU eligibility, calculation, issuance and project requirements depend on the applicable Clean Energy Regulator method and professional verification. Burping Cows does not replace a registered auditor, financial adviser, legal adviser, or carbon project developer.
