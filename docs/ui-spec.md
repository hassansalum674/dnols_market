# Dnols UI spec — professional dark marketplace

Research-backed rules for how the app looks and feels. Applies to the buyer PWA, shop chrome, and the seller app.

## Brand mark usage (decided)

| Surface | Asset | Why |
| --- | --- | --- |
| Splash / cold start | `logo6_dark.svg` — full **dnols** wordmark on `#0D0D0D` | The name, not an initial, is what launch must teach. |
| Route / data loaders | `logo6_dark.svg`, small, pulsing | Same identity at every wait; no anonymous "d". |
| Header (buyer + shop) | `logo6_dark.svg` at header height | Wordmark reads as a masthead; professional apps put the name, not a monogram, in chrome. |
| Empty / error / offline states | `logo6_dark.svg` | Consistent brand even on failure screens. |
| **Favicon and app icons only** | `logo5_favicon.svg` (the blue **d**) | The one place a square monogram beats a wide wordmark: 16–512 px tiles. |
| Light/print material | `logo1_primary.svg`, `logo3_wordmark.svg` | Not used in-app (app is dark). |

Never redraw or restyle the SVG text. The wordmark ships as-is.

## Canvas and elevation (dark-UI research, 2026)

- Canvas stays the brand token `#0D0D0D` (already a near-black gray, not `#000000` — avoids OLED halation/smearing that pure black causes).
- Hierarchy comes from **surface elevation, not shadows**: cards and sheets are lightened overlays (`rgba(255,255,255,0.04–0.12)`), each raised layer slightly brighter.
- Text opacity tiers: high-emphasis ~87–100% white, secondary ~55–60% (`--muted`), disabled ~38%. Never pure white walls of text.
- Accent `#1A6FD4` is used sparingly (primary action, focus, shimmer highlight); saturated colors read neon on dark, so no additional bright hues.
- Contrast: body text ≥ 4.5:1 against its **actual surface**, large text/controls ≥ 3:1 (WCAG 2.2). Focus rings must be visible on every elevation tier.

## Typography on dark

- Playfair Display 400/700 stays (brand lock). Because it is a high-contrast serif, dark-mode legibility rules matter more:
  - body ≥ 15–16px, tab labels ≥ 12px, prices bold 700;
  - line-height ~1.5; letter-spacing +0.02em on small or all-caps labels;
  - lining + tabular numerals for every TSh figure and distance.
- Off-white (`#FFFFFF` at 87–92%) over pure white for long text to stop letter "bleed" on OLED.

## Launch and loading (professional feel)

- Splash: wordmark centered at the optical center (slightly above geometric center), gentle 2.4s pulse, rotating one-liners underneath, whole thing ≤ 1.6s when cached. Platform guidance (Android 12 splash API) also centers a single mark on a flat brand color — we mirror that so a later Play Store wrapper feels identical.
- Never a spinner anywhere. Grids shimmer in the exact card layout; non-grid routes pulse the wordmark.
- First paint is HTML + CSS + inline SVG; fonts `swap`; images lazy.

## Attractive without noise

- Borderless product cards, one photo, price + distance only; generous spacing is the "premium" signal on dark, not gradients or badges.
- One primary action per screen; the sticky Pay bar is that action on product/checkout.
- Motion: only micro-feedback (add-to-cart checkmark, fly-to-bag dot, shimmer). 150–250ms, ease-out; nothing loops except loaders.
- Photography discipline: product photos on neutral background where possible — the dark canvas makes mixed-quality stall photos look intentional inside consistent 1:1 frames.
- Empty/404/offline are branded screens with one line and one CTA — never a dead end.

## Accessibility checklist per release

- Tap targets ≥ 44px; tab bar 56–64px + safe-area inset.
- Test on a cheap Android (Tecno/Itel class) and on OLED + LCD.
- Keyboard focus visible; sheet dismisses on Escape/backdrop.
- Contrast re-checked whenever a new surface tier is added.
