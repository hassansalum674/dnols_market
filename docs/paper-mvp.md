# Paper MVP — 10 Kariakoo shops (hide-pin + handover)

Run this **before treating the PWA as the source of truth**. The live catalog is also seeded in `api/src/seed.ts` (24 SKUs). This sheet is the WhatsApp / Google Form version: a buyer asks “do you have X?”, you reply with **distance only**, they “pay” (tick), then you send the stall name.

## Flow (manual)

1. Buyer searches the sheet (or a WhatsApp catalog).
2. Operator replies: title, price TSh, **~Nm, Kariakoo** — never street or stall.
3. Buyer confirms pay (mobile money to a holding number).
4. Operator sends shop name + pin + pickup code.
5. Buyer walks; both confirm handover; operator releases funds.

Measure: search → pay intent → walk-in. If pay intent is near zero, do not scale software.

## Catalog (10 shops)

See [`paper-catalog.csv`](paper-catalog.csv). Categories: fashion + electronics only. Place: `place_kariakoo_dsm`.

## WhatsApp copy

> Dnols — item is in Kariakoo, about **{distance}m** from the market gate. Pay to reserve. We send the stall after pay. You may refuse at the counter if it is not as listed; money stays held until you confirm.

## Google Form fields (shop restock)

Shop name, TIN/licence (optional), category, SKU title, price TSh, photo, in stock Y/N, sizes or brand, **do not publish street on the buyer sheet**.
