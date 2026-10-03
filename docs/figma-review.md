# Figma implementation review

Design: https://www.figma.com/design/uBbJjAa6wEX1ONHkmp8cql

Reference viewport: 402 × 874. The shared layout uses 20-pixel side margins, 18-pixel gaps and the supplied colours, text sizes, line heights, card borders, option rows and button geometry. Text containers retain reference minimum heights and expand for validation messages or different content. Desktop content remains centred; narrow screens wrap options.

Original exports are stored in `assets/figma`. `sources.json` records their originating screen or node, SHA-256, export scale and natural dimensions. Original SVG bytes are preserved. The farm illustrations and readiness artwork use unchanged PNG exports of their original Figma nodes, avoiding differences in the initial SVG serialization. The active Assess tab uses its own original SVG. The existing logo is byte-identical to Figma's logo export. Fonts use DM Sans optical size 14, with the licence and source recorded in `assets/fonts`.

## Product behaviour

The existing calculations, eligibility rules, readiness weights, saved snapshots and local/cloud repository are preserved. All choices, price updates, estimator modes, editing, duplication, save and confirmed delete remain interactive. Login and account controls on Welcome and Profile are retained at the user's explicit request, so these two screens intentionally contain additional controls. The user also requested that the two-line Refresh assessments label be vertically centred in its button; it uses natural text height instead of the reference's overflowing 20-pixel text box.

Direct assessment links remain mounted during storage hydration. Form data and profile defaults restore after hydration; result-price inputs initialise from the restored draft. Numeric inputs preserve unfinished decimals while a user types. Web radio/checkbox and tab selection states are exposed to assistive technology.

## Verified locally

- TypeScript and lint checks.
- 73 tests, including preservation of direct assessment routes during hydration.
- Production web export.
- All 25 Figma variants in the interactive comparison, with matching example data.
- All seven monitoring options fit on one line, including None; selecting None clears other equipment.
- Saved-load retry and failed-save retry use the actual app actions. Failures are simulated only by the comparison harness.
- Error-card layouts, confirmation order, volume mode and field-validation wording match the additional references.
- Browser flow: welcome/login/signup navigation, validation, farm → project → results, decimal typing, price changes and reload, action plan and save, refresh, saved-detail reload, edit, duplicate, cancellation and confirmed delete, profile defaults and reload, estimator/volume modes, Learn/About and logout persistence.
- Phone width 320 and desktop width 1280: no horizontal page overflow.
- No browser JavaScript or React Native render errors during the complete flow.

Live account authentication and email delivery require the user's Supabase configuration. Native rendering and mobile keyboard behaviour require testing on a device or simulator.

## Final review

The replacement Figma connection provided all 25 full references. The initial missing-screen limitation has been resolved. The readiness helper uses DM Sans Regular at 15/23 px; its original four-segment illustration is now used. Monitoring options retain their Figma widths; right padding accounts for the border, leaving enough room for None. Saved and delete confirmation cards follow the disclaimer; farm-default confirmation follows its save button.

Browser font rasterisation and some subscript glyph metrics differ from the Figma screenshot. This review version is not claimed to have zero visual differences. Native iOS/Android appearance has not been checked on a device.

The final review on 3 October 2026 covered all 25 states, the complete browser flow and 73 tests. It caught and corrected the missing red border on an invalid animal-count field; the border returns to normal after valid input.

The interactive local preview remains available at http://localhost:8082/review/ while its local server is running. Interactief permits clicking and scrolling. Screenshot and Overlay compare each captured state with Figma. The separate app at http://localhost:8081/onboarding permits a continuous test flow without the comparison selector replacing its data.
