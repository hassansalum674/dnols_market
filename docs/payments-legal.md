# Payments, escrow, and pickup rules (v1)

## PSP choice (licensed aggregator — do not issue e-money)

Dnols holds buyer funds only through a **Bank of Tanzania–licensed payment service provider / aggregator**, then splits to the shop’s mobile money after handover.

**Preferred order for Tanzania v1:**

1. **Selcom Paytech** — local acquiring, mobile money, TANQR-adjacent rails.
2. **Pesapal** — TZ merchant + mobile money.
3. **Flutterwave** (or equivalent) if Selcom/Pesapal escrow/split is slower to contract.

**Rails:** M-Pesa, Mixx by Yas, Airtel Money. Cards secondary. **STK push** (this repo: `POST /payments/stk-push`) is the buyer UX; the live PSP supplies the actual prompt.

**Escrow model:** merchant account + split settlement. Trust-account style holding at the PSP/bank. Dnols must **not** run a customer wallet that looks like issuing electronic money.

**Settlement:** target T+0 to T+1 after both-side handover confirm. Mock API: instant `handed_over`.

TANQR is a **pay** QR. Market-gate QR is **discovery** (`placeId`). Keep them separate.

## Inspect-and-reject (buyer)

v1 is **full price in escrow**, not a keep-the-deposit model.

- Buyer may **refuse at the stall** if the item is not as listed (wrong size/fabric, dead phone, IMEI mismatch, bait-and-switch).
- Shop confirms reject in the app → status `rejected_refund` → funds return to buyer (PSP refund).
- Fashion: size/condition checklist at handover.
- Electronics: power-on + optional IMEI photo.
- Partial refunds are a later PSP feature; v1 is full refund on reject.

## No-show

- Pickup window: **2 hours** from pay (SLA so shops do not freeze stock overnight).
- Buyer no-show after SLA: shop may release the hold back to stock; funds refunded to buyer unless the contract later adds a small no-show fee (not in v1).
- Shop no-show: auto refund; shop frozen in admin.

## Counterfeit / phones

- Shops should provide business licence / TIN when onboarded.
- Buyer identity: phone + PIN.
- Disputes: pickup code, timestamps, photos. Dnols is not a court; PSP + documented handover is the evidence pack.

## Copy for checkout (EN)

You pay now. Money is held. We then show the stall. You may refuse at the counter if it is not as listed. The shop is paid only when both of you confirm handover.
