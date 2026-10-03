# Deploy the landing page to Cloudflare Pages

The landing page is a standalone React + TypeScript + Vite site in `landing/`.
The existing Expo app remains in `src/`. The landing page has no backend,
authentication, database, Cloudflare Functions or external runtime services.

## Local preview and production build

Use Node.js 22.13+ as required by the existing repository.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. To build and preview the static output:

```sh
npm run build
npm run preview
```

`npm run build` checks the landing page's TypeScript and emits `dist/` at the
repository root. `dist/` contains only public static assets. It includes the
logo, existing farm illustration and bundled DM Sans fonts; it does not require
Google Fonts, Supabase or another network service to render.

## Cloudflare Pages

The existing **burping-cows** Pages project uses Direct Upload and the production
branch **`codex/landing-page`**. Its assigned address is
**https://burping-cows.pages.dev**. Only the nine public files in `dist/` are
uploaded. No billing changes, paid add-ons or Functions are configured.

For a future deployment with your authorized Cloudflare CLI session:

```sh
npm run build
npx wrangler pages deploy dist --project-name burping-cows --branch codex/landing-page
```

Pushing the GitHub branch does not automatically deploy this Direct Upload
project. Alternatively, create a separate Git-connected Pages project with the
repository root, build command **`npm run build`**, and output directory **`dist`**.
No environment variables or Functions are needed.

Use the build-time `NODE_VERSION` setting if necessary to select Node 22.13+
or Node 24. Do not configure the Expo `export:web` command for this landing page.

## Before linking the live assessment app

In `landing/src/config.ts`, change `APP_URL` from `#demo` to the deployed Expo
assessment app's URL. All assessment CTAs share this value. Until then, each
button leads to the clearly labeled example assessment on the page; the site
does not claim to perform a real assessment.

`DEMO` in `landing/src/config.ts` is a verified snapshot of the latest app’s
`demoInput` and `calculateAssessment` at commit
`32e61a0`. The example uses Green Valley Dairy
(500 dairy animals in NSW, liquid effluent, enclosed capture-and-flare route):

- Net abatement: **1,096.91776 t CO₂-e/year**, displayed as **1,096.92**.
- Indicative ACCU equivalent: **~1,096/year**, floored as in the app.
- Demo price: **A$35/ACCU**.
- Estimated gross carbon value: **A$38,392/year**, calculated from the unrounded
  annual equivalent, as in the app.
- Eligibility: **Likely compatible**; calculation: **Projected**.
- Financial scenario: **Potentially attractive**.
- Preparation: **Evidence needed**, **50%** progress.
- Explore: **5/5**, before application: **4/6**, before first report: **0/7**.

The landing-page example and selected checklist tasks follow the current app’s
results. Recompute this snapshot when the app’s inputs or engine change.
The interactive price assumption changes only illustrative gross carbon value;
it uses the unrounded annual equivalent and is not a market feed or net-profit
estimate. It does not change the fixed demo’s financial verdict.

The official ACCU Scheme and COP31 context links are also in `config.ts`.

## Public market examples

The market section links to primary sources for Rivalea's Corowa piggery biogas
project, Rio Tinto's Meldora offtake announcement, and the NSW Natural Resources
Commission's Tiwi Island credit purchase. Sources were checked on 3 October
2026. Rivalea's 97,000 figure is total abatement sold under a completed contract,
not annual output. The other projects use different methods from manure methane.
These examples are not customers, endorsements, farm-return comparisons or live
price data. The page does not claim to arrange sales or secure buyers.

## Branding

The page follows `src/config/theme.ts`: forest green `#176544`, deep teal
`#0B3735`, warm cream `#FAFBF5`, pale green `#EAF5E5`, leaf green `#70AB57`,
and the app's DM Sans typeface. The landing page uses open columns and dividing
lines, reserving rounded corners for the assessment preview. The optimized logo
comes from the latest app's `assets/branding/green-in-app-logo.png`;
`landing/public/farm.svg` reuses its Figma-exported `welcome-farm.svg` artwork.

The landing page intentionally has an independent TypeScript configuration.
Existing Expo commands, app source and application behavior remain available.
