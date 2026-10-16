# Haggle quotes, real payment and credited consideration

2026-10-15. Base `330db9f7389700494def2a9479f7ae8cb61b0414`,
codex/resume-claude. Codex's narrow commerce caller lane; no deployment.

## Decision and scope

Repair the existing Haggle contract before changing its availability. Its
trade.price_mult=0.75 already worked for river goods, but cart/resident
hawker transactions ignored it. betrayal.js now computes the current buyer's
effective quote without mutating cached stock. Cart display, spoken resident
offer, payment, refusal, overprice appraisal and scam receipt use that quote.
Existing confrontation discounts multiply it and now display honestly too.
Positive prices round once to whole kcal, minimum one; free wares stay free.

Also repair an adjacent paid-practice edge in the last published unit:
visitorBuyWare previously passed only the food remainder after store credit
to creditGoodsTrade. An entirely tab-funded purchase was therefore treated
like a gift for practice. Pass the whole settled quote, preserving captured
buyer identity, the shared one-XP/day cap and existing tab-first rollback.
This is a second commerce lever; do not attribute campaign changes solely
to Haggle. The frozen tests expose both edges.

No base ware price, ability magnitude, daily metabolism, route tariff,
sell appraisal, offer-kit position, offer window, XP threshold, class/god
gate, combat strength or regional/nomad system changes. Haggle's existing
30-kcal daily upkeep still matters. Resident sellers receive paid practice
through the existing shared helper, but their own held Haggle does not
discount the player's purchase. No autonomous NPC purchases are invented.

## Actual caller and payment evidence

`scripts/godpath/test-haggle-commerce.js`: 20/20 on candidate, 9 pass/11 fail
on the exact frozen base. Actual visitor/hawker purchases prove held-modifier
pricing, cached-stock stability, confrontation composition, normal buyers,
tab-first payment, full-tab practice, insufficient-food rollback, accurate
refusal, free gifts, equal resident/buyer practice and discounted scam receipt.
Actual talkTo -> convoTurn(hawker) -> convoTurn(hawker_yes) proves the spoken
600 quote and real six-unit payment/delivery. River's working discount is
preserved. Prior assertions are not loosened or quarantined.

Quick: 165/165; full: 937/937. Ontology: 111 systems. check-wired shows
goodsTradePrice has real source callers. It also reports the same pre-existing
unwired recentTrauma in both roots (150 -> 151 total functions); do not call
that scan entirely clean. Retained before/after wired logs distinguish it.

The prepared `haggle-food-units.cjs` scenarios run eight actual transactions
per root using the shared seeded harness, with source/probe hashes and Node
version. Each fresh person starts with ten identical portions and buys the
same 800-kcal stone knife. All sixteen purchases deliver the real item:

| Food portion | Preservation | Without Haggle, kcal consumed | Held Haggle before | Held Haggle after |
|---|---|---:|---:|---:|
| 100 kcal | cooked | 800 | 800 | 600 |
| 100 kcal | smoked | 600 | 600 | 400 |
| 500 kcal | cooked | 1,000 | 1,000 | 1,000 |
| 500 kcal | smoked | 1,000 | 1,000 | 500 |

Quote != physical food consumed: existing traderPay values preserved food at
1.5 and spends whole units. The ordinary 500-kcal portion case saves nothing
despite the corrected 600 quote. Keep this limit visible when evaluating
ability value; this unit does not change rounding, refunds or food splitting.
These prepared economic scenarios do not establish natural acquisition,
class viability or a campaign survival effect.

## Public mobile playtest

`haggle-phone-fixture.cjs` prepares a living bearer with held Haggle, 0 social
XP, ten cooked 100-kcal portions and an 800-price visitor knife. On a real
390 x 844 viewport, save -> reload -> public Continue shows the cart at 600.
Public Buy spends six portions, delivers the knife, marks it sold and credits
one social XP. Verified quote/paid screenshots and DOM are retained; the
banner explicitly labels preparation. No hidden browser state mutations.
The owned tab/server are closed and viewport restored. This is prepared
transaction proof, not an earned-Haggle playthrough or a release.

## Reproduction, identity and interpretation

Raw 16-seed screen, 64-seed confirmation and all 23 metrics are retained.
All 256 matched confirmation campaign rows and final gameplay hashes are
identical, as are all 23 metrics in every policy. The 64-case screen is also
identical. Confirmation totals (before -> after):

| Policy | Wins | Table entries | Player deaths | Community losses | Tier-3+ gear access |
|---|---:|---:|---:|---:|---:|
| capable | 55 -> 55 | 57 -> 57 | 90 -> 90 | 8 -> 8 | 64 -> 64 |
| maker | 21 -> 21 | 22 -> 22 | 52 -> 52 | 18 -> 18 | 64 -> 64 |
| merchant | 25 -> 25 | 25 -> 25 | 42 -> 42 | 14 -> 14 | 64 -> 64 |
| caregiver | 23 -> 23 | 25 -> 25 | 45 -> 45 | 18 -> 18 | 64 -> 64 |

This is no material signal in this sample, not equivalence or balance proof.
No independent holdout or natural affected-Haggle campaign claim. Earlier
Relay/challenge/community tradeoffs remain open. All 512 cache rows and
digests are verified, plus 16 seed-7 balanced observer-on/off jobs across
both roots. Panel source stability, observer/gear errors and warnings pass;
deed observers also retain two matched off controls.

The baseline is the exact prior published source; cached cases are validated
against their source identity and result digest. Source reconstruction starts
from `trade-progression-sources.json.gz` after arm and applies only the two
replacement files in `haggle-sources.json.gz`. Shared kit, observer and test
source are included. Both arms use identical policies, harness, observer,
contract, Node, seeds, origin, flags and 150-day cap. No collector/contract
change or instrumentation-baseline waiver. Commands:

```text
node scripts/balance-panel.js --root <frozen-base> --out <before> --n 64 --par 6
node scripts/balance-panel.js --root . --out <after> --n 16 --par 6
node scripts/balance-panel.js --root . --out <after> --n 64 --par 6
node scripts/balance-panel.js compare --before <before>/panel.json.gz --after <after>/panel.json.gz --out <report>
node scripts/godpath/test-haggle-commerce.js
node evidence/2026-10-15/haggle-food-units.cjs <root>
node scripts/godpath/deed-screen.js --root <root> --n 16 --policies merchant --par 4 --out <replay>
```

Sixteen merchant replays per arm match their balanced rows and full final
states exactly. Baseline replays are reused from the published paid-goods
after arm; their origin/source metadata is preserved. Separate merchant
seed-7 observer-off results match. Each arm observes one player Haggle offer,
zero player Haggle holders and 31 paid-trade credits. This sample cannot
clear affected-build balance. Standard mixed policies are not pacifists.

Policy limitation for the next experiment: livelihood.js trade still budgets
against cached base wares[idx].price, including its 1,200 meal reserve. It
does not yet use an effective discounted affordability quote. Keep that bot
choice separate from runtime pricing; do not compare a changed policy on
only one game arm. Acquisition/choice coverage, Miser's first two abilities,
class payoff and all eight remaining fitting deeds remain open.

Winning should remain difficult. Any future win movement is a challenge
investigation in either direction; no target win rate, automatic buff,
automatic revert or claim that net wins cancel paired community harms.
