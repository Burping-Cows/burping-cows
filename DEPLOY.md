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

1. Push this repository to GitHub.
2. Open the Cloudflare dashboard.
3. Create a **Pages** project and connect the GitHub repository.
4. Choose the **Vite** framework preset.
5. Leave the root directory as the repository root.
6. Set the build command to **`npm run build`**.
7. Set the build output directory to **`dist`**.
8. Deploy. No environment variables or Functions are needed.

Use the build-time `NODE_VERSION` setting if necessary to select Node 22.13+
or Node 24. Do not configure the Expo `export:web` command for this landing page.

## Before linking the live assessment app

In `landing/src/config.ts`, change `APP_URL` from `#demo` to the deployed Expo
assessment app's URL. All assessment CTAs share this value. Until then, each
button leads to the clearly labeled example assessment on the page; the site
does not claim to perform a real assessment.

`DEMO` in `landing/src/config.ts` is a verified snapshot of the latest app’s
`demoInput` and `calculateAssessment` at commit
`761f1f1bac4cafcd4c16e67f5df4bb3b809cbad0`. The example uses Green Valley Dairy
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

## Branding

The page follows `src/config/theme.ts`: forest green `#176544`, deep teal
`#0B3735`, warm cream `#FAFBF5`, pale green `#EAF5E5`, leaf green `#70AB57`,
and the app's DM Sans typeface. The landing page uses open columns and dividing
lines, reserving rounded corners for the assessment preview. The optimized logo
comes from the latest app's `assets/branding/green-in-app-logo.png`;
`landing/public/farm.svg` reuses its Figma-exported `welcome-farm.svg` artwork.

The landing page intentionally has an independent TypeScript configuration.
Existing Expo commands, app source and application behavior remain available.
