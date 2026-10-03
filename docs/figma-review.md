# Figma UI update scope

This PR retains the Figma illustrations, tab icons, local DM Sans fonts, shared UI styling, authentication-screen presentation and missing-page presentation.

The conflicts with main were resolved by preserving its current six-step assessment workflow, current farm/profile inputs, current calculation and result fields, scheme guidance, account actions and persistence behavior. The shared UI retains six-step progress, input focus refs, all current selection choices, live preparation scores and the current disclaimer.

Omitted functional changes from the original PR:
- Draft hydration/reset and numeric input changes in `src/components/AssessmentForm.tsx`.
- Profile form restoration in `src/app/(tabs)/profile.tsx`.
- Protected-route guard changes in `src/app/_layout.tsx` (only font loading is retained).
- Project-route hydration guard and legacy form flow in `src/app/assessment/project.tsx`.
- Validation changes in `src/lib/validation.ts` and the associated navigation test addition in `tests/navigation.test.tsx`.

Conflicting legacy screen and result markup was omitted where it depended on replaced main-branch fields or workflows; those screens inherit the retained shared UI styling. Main's README and calculation documentation are preserved.

The PR is left open for manual merge. Native rendering and live Supabase authentication have not been validated in this update.
