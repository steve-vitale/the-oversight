# longsim scale-wall run r9 — FRELOAD CLOCK RATE BASIS (2026-10-13, flesh-out, lever 5)

## PRE-REGISTRATION (docs/MEASUREMENT.md §§9–12)
- **Axis:** scale-onramp (converging; standing directive — keep working the wall). `longsims-rotation.txt` stays 3.
- **Lever lens:** 5 (trust & social) on the scale wall — r8's documented open blank: the freeloader's clock (freeloaderTick, Route B of the exile foreclosure) still reads the cumulative GROSS takes ledger (`netDrain = takes - gave` vs fixed bars), even after r8 gave theftConfrontation (Route A) rate accounting.
- **Question:** does moving the freeload clock from cumulative gross to the fair-share NET rate (trailing-7d (takes−gives)/day vs the person's fair share) remove the remaining gross-ledger foreclosures without defanging the moot? Ordinary communal eating (~2000 kcal/day fair-share norm) must never advance the clock; sustained ≥2×-norm net takes must still trip it.
- **Primary metric:** Route-B exiles in the courtship window on the scale-push suite (belongseek + leadcourt).
- **GO threshold (pilot, 4 runs seeds 11/22 × belongseek/leadcourt, 150d death-aware, identical seeds):** courtship exiles ≤ before-side AND nationals ≥ before-side AND RED tests green AND no new failure mode (clock not dead: unit-proven staged ladder still fires for genuine drains).
- **Confirm (only if pilot GO):** full 8-run suite (seeds 11/22/33/44 × belongseek/leadcourt), identical seeds, before/after.
- **Horizon:** 150d death-aware (courtship window d20–90; r8 baseline exile days 45–64).
- **Policies:** belongseek + leadcourt (scripts/policies/).
- **Convergence state:** tbd (pilot).

## Canon check
READ docs/CANON.md first. No canon doc covers trust/social/the moot (same finding as r7/r8 — stated, not invented). Binding canon: THEFT IS ALLOWED, socially punished (theftConfrontation header); "kick out drains" (Steve 2026-10-09) is the freeload pipeline's design; Trust ≠ reputation; newcomers get 14-day probation at half shares (docs/DIRECTIVES.md); the fair-share norm is ~2000 kcal/day (Steve 2026-10-06).

## The design (my call, Steve 2026-10-07: make the call, document it)
One coherent mechanism: **the freeload clock judges the trailing-7-day NET rate** (`takeRate7 − giveRate7`, kcal/day) against the person's fair share — `max(2000, their own kcalPerDay)`. Eating your own day's food is never evidence; taking MORE than your share, sustained, is.

Changes (all in game.js unless noted):
1. **New `v.giveHist[vid]`** — dated `[{day, kcal}]` gives, mirror of r8's takeHist: `recordGiveHist` / `giveRate7` (same 7-day window, same prune). Hooked at both give-recording sites: `donateToPantry` (player donations) and `villagerMealDay`'s shared surplus (so NPCs get dated histories too — the clock judges the whole roster).
2. **`villagerMealDay` also records `takeHist`** for the NPC's daily meal draw (r8 only wired the player's voluntary takes). Design call: the NPC meal draw IS recorded (unlike the player's served meal, which r8 excluded) — because with the clock's bar AT the fair-share norm, a communal meal can never trip it. The norm absorbs it; only above-norm net takes are evidence.
3. **`freeloaderTick` (Route B)**: replaced `netDrain = takes − gave` (cumulative gross) with `netRate7 = takeRate7(vid) − giveRate7(vid)`; `drainBeyondCapacity = netRate7 > max(2000, kcalPerDay)`. The old `drainBeyondCapacity = netDrain > max(1500, totE*3)` is retired — low expected production no longer turns an ordinary appetite into a charge (that was r7's manufactured-evidence finding #3). The 5-day contrib warmup + staged 3/7/12-day ladder is the newcomer grace: ~17 days minimum before any vote.
4. **`ledger.js` playerDeath succession reset**: `v.giveHist[newId] = []` alongside the r8 takes/gives/takeHist reset (one line; same mechanism family).

Honesty notes: `draining` (the light gate feeding the dead-by-construction effort branch) kept its semantics as `netRate7 > 2000`. The `effort >= 0.7` clock-clear is untouched. The player's served meal (villageMeal) stays out of takeHist (r8's decision) — the village feeding you is never evidence.

## RED tests (scripts/test-fairshare-freeload-r9.js) — 26/26 GREEN on fixed code
- (a) 2000/day in meal draws × 20d: netRate7 ≈ 2000, fl.days stays 0, no vote, no warning — **ordinary communal eating never advances the clock**.
- (b) 4000/day net takes × 20d: fl.days advances, stage 3 reached, freeloadVote fires on the staged ladder — **genuine hoarding still trips it**.
- (c) 2000/day takes + 2000/day gives: silent. (d) 2000 takes + 3000 gives: silent.
- (e) giveHist bookkeeping: rate math + 7-day prune verified.
- (f) integration: donateToPantry records giveHist (1400 kcal); villagerMealDay records takeHist AND giveHist for the NPC (dated, positive).
- (g) succession: the new Bearer <redacted> a fresh giveHist book.
- **RED-verified on pristine code**: prereq checks fail (`recordGiveHist is not a function`) — real RED, not tautology.

## Results — PILOT (4 runs, seeds 11/22 × belongseek/leadcourt, 150d death-aware)
| side | national | table | wins | exiled | median | maxWave |
|---|---|---|---|---|---|---|
| before (r8 base) | 0/4 | 0/4 | 0/4 | 1/4 (belongseek s11 @60) | 81d | 3 |
| after (r9) | 0/4 | 0/4 | 0/4 | 0/4 | 74d | 3 |
Raw: evidence/2026-10-13/fairshare-rate-before.json / fairshare-rate-after.json (per-seed JSON for the coordinator's telemetry deviation check).

GO check: courtship exiles 0/4 ≤ 1/4 ✓; nationals 0/4 ≥ 0/4 ✓ (vacuous — neither side reached national on these seeds); RED 26/26 ✓; no new failure mode (starveDays/ateShare/maxWave unchanged) ✓; clock-alive proof in the unit tests ✓. **→ GO to confirm.**

## Results — CONFIRM (8 runs, seeds 11/22/33/44 × belongseek/leadcourt, identical seeds)
| side | national | table | wins | exiled | exile days | median | maxWave |
|---|---|---|---|---|---|---|---|
| before | 0/8 | 0/8 | 0/8 | **2/8** (belongseek s11 @60, s33 @51) | 51, 60 | 78d | 3 |
| after | 0/8 | 0/8 | 0/8 | **0/8** | — | 74.5d | 3 |

## Attribution probe (scripts/probe-freeload-r9.js, since deleted — findings)
Re-ran belongseek s11 (exiled @60 on the before-side) on the after-side with daily instrumentation: the scholar's trailing-7d net rate sat at 300–570 kcal/day (voluntary packs only; served meals are out of takeHist) across days 35–67, fl.days stayed 0, no vote. On the before side the same scholar accumulated ~69k cumulative takes over ~60d (~1150/day — BELOW the fair-share norm) with zero recorded gives → old `drainBeyondCapacity` tripped → vote @60.
Judgment call (documented, Steve can overrule): that exile was a gross-ledger artifact, not a genuine drain. The scholar ate below the fair-share norm while courting as subordinate and paying tribute — the village executing its courtier mid-courtship for eating is exactly the foreclosure the scale directive fights. Eating your own day's food is never evidence; taking more than your share, sustained, is. A villager packing 4000/day net (2× norm, test (b)) still gets the vote.

## Village assessment (confirm runs; sense-tested at the mechanism level)
- The scale-push villages look the same on both sides — the lever changed only the exile pipeline's sensitivity, not village life (ate shares 81–86% both sides, starveDays 0–3, same arc/maxWave reach). This is a sensitivity refinement, not a wall-mover.
- The two before-side exiles were both belongseek in the courtship window (d51, d60) — the foreclosure's last face on this suite. After-side: zero exiles, and villages kept courting (proposals 9–10, accepted 7–8, seasoned 5–7 across sides).
- Who thrived/died: unchanged — villages die village-lost (combat/sickness baseline), scale-pushers season links and stall at regional. The binding constraint is still survival-to-national, not the moot.

## SENSE-TESTING
- No freeload stage beats fired in any of the 16 runs' journal summaries (no "Hands:" lines in the per-seed JSON — the driver doesn't carry journal text, noted as a telemetry gap). The mechanism's fiction was sense-tested in the unit harness: gossip/warning/vote lines exist on the staged ladder (test (b) drives it through the real freeloaderTick).
- No fabricated-theft moots, no 'hoard' observations anywhere (Route A still dormant on this base, per r8).

## Blanks filled
1. **freeloaderTick rate basis** — r8's open blank closed: Route B now reads the trailing-7d net rate, not gross takes. 2/8 → 0/8 courtship exiles on identical seeds, pipeline proven alive for genuine drains (26/26).
2. **NPC dated histories** — takeHist/giveHist now recorded in villagerMealDay, so the whole roster has a fair-share book, not just the player.
3. **giveHist succession reset** — one line in ledger.js.

## Blanks documented (open)
- **`v.freeload[newId]` clock inheritance** (r8's blank, still open): the freeload clock (days/stage) is intentionally NOT reset on succession. Now that the ledger resets are complete, a known-drain successor keeps their clock — design question, unchanged by r9.
- **Journal-text telemetry gap**: the per-seed JSON carries no journal lines, so freeload stage-1/2 activity (gossip/warning) can't be measured from the suite output — only votes/exiles. The driver could attach a say-line capture.
- **The 1.5× vs 2× rate bar** (r8's blank): Steve can overrule the 3000/day theftConfrontation rate bar. Untouched by r9.
- **villageMeal vs takeHist asymmetry**: the player's served meal is excluded from takeHist while NPC meal draws are included. Both are safe under the norm-absorbed bar, but it's an asymmetry worth noting — deliberate (r8's "the village feeding you is never evidence" for the player).

## Reachability (wall numbers, confirm)
national 0/8 · table 0/8 · wins 0/8 · wave 4–5 unlocks: 0 (maxWave 3) · regional reached broadly · median survival 74.5d (78d before) · vests 0/8 · exiled 0/8 (2/8 before).

## Convergence state: **converging** (scale-onramp)
The moot-exile foreclosure's Route B gross-ledger face is closed (courtship exiles 2/8 → 0/8 on identical seeds; 62.5% → 12.5% → 0% across r8 pilot/confirm → r9). Nationals unchanged on these seeds (0/8 both sides; r8's 2/24 came from the wider confirm). Not `converged` — the axis target is national reached organically and reliably, and the binding constraint is now survival-to-national (combat/sickness baseline, median 74.5d on this confirm), not the moot.
