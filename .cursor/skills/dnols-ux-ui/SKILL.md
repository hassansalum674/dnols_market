---
name: dnols-ux-ui
description: Enforces Dnols marketplace UX/UI locks for the buyer PWA and shop chrome — wordmark vs favicon, splash and loaders, Playfair, dark theme, CSS tokens, product card, checkout, escrow, 404. Use when changing UI, UX, CSS, components, copy, icons, screens, PWA chrome, or any PR that touches visual or interaction work.
---

# Dnols UX/UI

Make sure every change done is aligned with being the best in UX and UI per implementations.

Applies to the buyer PWA, shop chrome, and seller app. Every PR or code change that touches UI must be checked against this skill before it is done.

Canonical rules: [ui-spec](../../../docs/ui-spec.md) · [wedge-strategy](../../../docs/wedge-strategy.md) · [payments-legal](../../../docs/payments-legal.md). Tokens live in `src/styles.css`.

## Workflow

Copy and track:

```
UX/UI gate:
- [ ] Wordmark / favicon lock
- [ ] Loaders (shimmer grids + wordmark pulse, no spinner)
- [ ] Type + color tokens
- [ ] Buyer chrome (4 tabs, search, hide on checkout)
- [ ] Elevation, opacity, 44px taps, 150–250ms motion
- [ ] Trust UI (escrow strip, distance, pickup code, refuse)
- [ ] Slow 3G (tiny first paint, font-display swap)
- [ ] Niche (Kariakoo, fashion + electronics)
- [ ] No COD; escrow mobile money
- [ ] Done only when
```

1. Read this skill and the linked docs before editing UI, CSS, or copy.
2. Implement against the locks — do not invent a parallel visual system.
3. Re-check **Done only when**. The change is not done until every box is true.

## Locks

### Wordmark vs favicon

| Surface | Asset |
| --- | --- |
| Everywhere in-app: splash, pulse loaders, headers, empty/error/offline | `logo6_dark.svg` **wordmark** |
| Favicon and PWA icons **only** | `logo5_favicon.svg` (blue **d**) |

Never restyle SVG text. Never put the monogram in chrome. Light/print marks (`logo1_primary.svg`, `logo3_wordmark.svg`) stay out of the dark app.

### Loaders

No spinners anywhere. Grids shimmer in the exact product card layout (`SkeletonGrid`). Non-grid routes pulse the wordmark (`RoutePulse`). Splash: wordmark at optical center on **canvas** `#0D0D0D`, 2.4s pulse, rotating one-liners, ≤ 1.6s when cached.

### Type, color, canvas

- Playfair Display 400/700, self-hosted, `font-display: swap`.
- Prices and distances: lining + tabular numerals (`.price`).
- Blue `#1A6FD4` (`--blue`) — primary action, focus, shimmer highlight only. No extra bright hues.
- **Canvas** `#0D0D0D` (`--black`) — never `#000`. Theme color matches.

### Chrome

- Buyer tabs: **Home Cart Orders You**. Search in the header. Hide tabs on checkout (and pickup). Shop: **Today Stock Orders Shop**.
- Product name **Dnols** on every screen (splash, tabs, 404, PWA).
- One primary action per screen; **sticky Pay** is that action on product/checkout (`--sticky-pay`, `.sticky-pay` / `.sticky-buy`).

### Elevation, text, motion

- Hierarchy from **elevation**, not shadows: lightened overlays `rgba(255,255,255,0.04–0.12)`.
- Text opacity: high-emphasis ~87–100% white; secondary `--muted` (~55%); disabled ~38%. Off-white for long text.
- Tap targets ≥ 44px; tab bar 56–64px + safe-area.
- Motion 150–250ms ease-out. Micro-feedback only (checkmark, fly-to-bag, shimmer). Nothing loops except loaders.
- Product cards: borderless, one photo, price + distance only. Generous spacing — not gradients or badges.
- Empty / 404 / offline: branded with the wordmark, one line, one CTA. Never a dead end.

### Trust UI (escrowed walk-up)

The wedge is the **escrowed walk-up**: nearby stock → pay into escrow → pin → walk → inspect → confirm; shop paid on handover.

- Escrow strip on checkout/pay. Copy (EN): *You pay now. Money is held. We then show the stall. You may refuse at the counter if it is not as listed. The shop is paid only when both of you confirm handover.*
- Distance is first-class (with price) on the product card and product page. Stall pin/address hidden until paid.
- Pickup code large after pay.
- Refuse is allowed: inspect-and-reject at the stall; `rejected_refund` full refund. Show refuse as a real action, not buried copy.
- Pickup window: 2 hours from pay.

### Slow 3G

Tiny first paint: HTML + CSS + inline SVG. `font-display: swap`. Images lazy. No Flutter Web. No heavy deps. This is a PWA, not a Flutter Web shell.

### Niche

Kariakoo shops, fashion + electronics. Not Amazon-everything: no national classifieds, no warehouse catalog, no chat-first negotiation. Walk-up only until escrow handover is proven.

### Payments

No COD. Full price in escrow via mobile money (STK push: M-Pesa, Mixx by Yas, Airtel Money). Cards secondary. Dnols does not issue e-money.

## Done only when

- [ ] Change matches wordmark / favicon lock
- [ ] No spinner introduced; loaders are shimmer grids or wordmark pulse
- [ ] Playfair 400/700, lining/tabular prices, blue `#1A6FD4`, canvas `#0D0D0D`
- [ ] Buyer chrome intact: 4 tabs, search in header, tabs hidden on checkout
- [ ] Elevation not shadows; opacity tiers; ≥44px taps; motion 150–250ms
- [ ] Trust UI: escrow strip, distance first-class, pickup code large, refuse allowed
- [ ] Slow 3G: tiny first paint, `font-display: swap`, no Flutter Web, no heavy deps
- [ ] Niche still Kariakoo fashion + electronics — not Amazon-everything
- [ ] No COD; escrow mobile money
- [ ] Empty/error/404 still branded with one CTA
- [ ] Tokens in `src/styles.css` reused, not duplicated ad-hoc
- [ ] This skill re-read against the diff before calling the work done
