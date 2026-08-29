# Dnols wedge strategy — how Alibaba/Amazon won, and where we beat everyone

**Status: plan only. No build work starts from this file until it is explicitly approved.**

## 1. What the giants actually run on

### Alibaba (Taobao/Tmall, 1688, AliExpress)

- **The founding wedge was escrow, not catalog.** In 2003 Chinese buyers would not pay strangers and sellers would not ship first. Alipay held the money until the package arrived. Solving that standoff made Taobao ~70% of the market by 2013. Lesson: *the company that sits inside the trust gap becomes the market.*
- **The profit engine today is advertising, not commissions.** Most China-retail revenue is "customer management" — sellers bidding for visibility (CPC/CPM/slots). Alibaba runs an auction for attention on a stage only it owns.
- **1688 vs Alibaba.com** shows the same catalog split by buyer: domestic wholesale (cheap, local payments, Chinese) vs export (English, escrow via Trade Assurance, higher price). Packaging trust and payments into the price is the product.

### Amazon

- **Flywheel of three businesses on shared infrastructure:** marketplace (~15% referral + FBA fees; 3P is ~60%+ of units, total take on an FBA sale often 40–50%), AWS (funds the stack), and ads ($50B+, ~60% margin, subsidizes prices).
- **Moat = logistics density.** FBA fills the same trucks and warehouses; density lowers per-package cost; faster delivery makes Prime stickier; Prime drives frequency. Competitors fail because they must build *all* nodes at once — the cold-start problem.
- Lesson: *do not fight Amazon on selection, price, or delivery speed. Fight where its flywheel has no wheels.*

### Temu / Shein (the current disruptors)

- Won on factory-direct price + paid social. **Weak where we live:** weeks-long delivery, returns near-impossible, quality complaints, and in 2026 a regulatory wall — South Africa and Nigeria forcing local offices, closing de-minimis tax loopholes, consumer-protection probes. Their model is *cheap and far*. It cannot do *now and near*.

### E-commerce in Africa (why the imported playbook keeps failing)

- **COD is 60–85% of transactions** because buyers refuse to prepay strangers — which creates failed deliveries, drivers carrying cash, and return rates historically up to 20–40% in some markets.
- **Last mile eats 35–55% of shipping cost** (vs ~28% globally) because addresses are landmark-based.
- **Returns cost 20–65% of item price**; >20% of shoppers never come back after one late delivery.
- The fixes the industry is converging on: pickup points/lockers (Pargo, Courier Guy), address verification (OkHi), prepay via mobile money. In other words: **the market is drifting toward exactly what Dnols is — pickup, prepay, verified location.**

## 2. The gap no giant covers

Put every player on two axes — **where the stock is** and **when you get it**:

| | Stock far away | Stock in your city |
| --- | --- | --- |
| **Days/weeks** | Amazon global, AliExpress, Temu/Shein | Jumia-style warehouse e-commerce |
| **Minutes/hours** | — (physically impossible) | **← the gap: Jiji/Facebook/WhatsApp live here, with zero trust rails** |

The bottom-right cell is enormous in Tanzania (Kariakoo alone) and is served today by classifieds + chat + cash — no escrow, no live stock, no reserved item, no verified handover. Amazon's flywheel *cannot* enter it: no warehouse, no FBA, no Prime is relevant when the item is 300 m away in a stall. Temu cannot enter it: their stock is in China. Jumia-style players need warehouses and delivery fleets — the two most expensive things in African e-commerce.

**Dnols's wedge, stated like Alipay's:** *the escrowed walk-up.* Buyer finds real stock nearby, pays into escrow, gets the pin, walks, inspects, confirms; the shop is paid on the spot. We insert ourselves into the exact standoff (buyer won't prepay / shop won't reserve) the same way Alipay did — but for physical proximity commerce, which the 2003 playbook never addressed.

## 3. Why this wedge defends itself

1. **It skips the two costs that kill African e-commerce.** No last mile (buyer walks — last mile cost = 0) and no COD (money is already in escrow — failed-delivery rate = 0 by construction). Every competitor built on delivery inherits 35–55% logistics cost and 20%+ return rates; we structurally do not.
2. **Supply is local and offline.** Kariakoo stalls will never be on Amazon; onboarding them (photos, price, stock, handover flow) creates a proprietary catalog nobody can scrape. That is our version of Amazon's density: **shop density per market, not warehouse density per country.**
3. **Trust rail compounds.** Every confirmed handover is a data point (shop reliability, buyer no-show rate). Alibaba turned escrow history into seller ratings and then into an ad auction; we can do the same per stall — later monetizing visibility inside a market the way Taobao does, without ever touching a warehouse.
4. **Regulation blows our way.** Regulators are punishing far-away platforms (local offices, taxes, consumer protection). A model where the goods are already inside the country, sold by licensed local shops, with money held by a BOT-licensed PSP, is the compliant shape of the future, not the target of it.

## 4. What we deliberately do NOT fight

| Their strength | Our answer |
| --- | --- |
| Amazon/Jumia selection + delivery | Don't ship. Walk-up only until escrow handover is proven. |
| Temu/Shein price | Don't price-match China. Sell *now, near, inspectable, refundable at the counter*. |
| Alibaba's ad auction | Not v1. Only after shops fight for buyer attention inside Dnols. |
| Jiji's national classifieds reach | Don't go national. Win one market cluster (Kariakoo) to >50% shop coverage first. |
| Facebook/WhatsApp chat | No chat-first negotiation. Structured price + reserve or nothing. |

## 5. Sequence (the flywheel we can actually start)

1. **One market, both catalogs** (fashion + electronics in Kariakoo — already seeded in the app).
2. **Escrowed walk-up loop works end-to-end** (pay → pin → PIN handover → instant shop payout). Success bar: shops re-list because money arrives same-day — beating Kariakoo Africa's ~48h payout.
3. **Trust ledger** — handover count and reject rate become the stall's public score. This is the Alipay→ratings move.
4. **Density before geography** — 30–80 shops in the cluster before a second market. Empty search kills marketplaces faster than competitors do.
5. **Only then** the Alibaba-style monetization ladder: featured placement inside a market → per-handover fee → (much later) same-catalog delivery, where the courier is an option, not the foundation.

## 6. Falsifiable bets (test in the field, not in code)

- Buyers will prepay full price into escrow **if** refusal at the counter is guaranteed → measured in the paper MVP (docs/paper-mvp.md).
- Shops value a *committed* buyer more than a hidden price → onboarding conversion when pitched "money is locked before they walk in."
- Hidden pin until pay is an incentive, not a blocker → compare scan→pay conversion vs a control group shown the address.

If bet 1 fails at full price, fall back to deposit-in-escrow + balance at counter — the model stays, the split changes.

---

**Summary in one line:** Alibaba won by owning the trust gap between strangers; Amazon won by owning delivery density; both are absent inside the 500-meter radius where most Tanzanian commerce actually happens — Dnols owns that radius with escrowed walk-up, zero last-mile cost, and a shop-density moat.

Next step after approval: field-test the three bets (docs/field-research.md, docs/paper-mvp.md) before building any new feature on top of the current app.
