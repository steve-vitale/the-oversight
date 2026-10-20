# SIM-PANTRYGUARD-B2 — pantry-guard lever pilot (loop B, food-economy)

Date: 2026-10-20 · Loop: oversight-flesh-out-loop-b · Run: fleshout-loop-b-20261020T0128Z · Worker tree: sim-pantryguard-b2
Axis: food-economy (scale-wall lens) — the named next of the belonghunger DIAG-GO (evidence/2026-10-19/sim-belonghunger-b.md).
Base SHA: 09123a8549903431c3607f6cd03af0ad4f5c6641 (master tip; paired control re-measured on this tip — substrate drift was observed 2026-10-20 ~00:20Z, so no corpus control was inherited).

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14-15 — binding, written BEFORE the pilot sims)

- **Question**: the belonghunger DIAG attributed belong-road hunger to INFLOW COLLAPSE (production tags vanish in every hunger window; feast/tribute/tend exonerated) and named the leverable behavior: the scholar donates nothing while drawing full 1.5–1.8k pantry meals as reserves go critical. Does a fragile-pantry guard (donate deep + meal discipline + forage-first) cut hungry days?
- **Lever**: PANTRY-GUARD (policy-side, scripts/policies/pantryguard.js, ZERO src/js changes). Wraps leadfeast/belongfeast. PANTRYGUARD=1 default OFF; requires FEASTSCALE_R13=1. When fragile (fresh-days < 3 OR pantry < 5× the village's 7-day mean burn): (1) Donate deep — the dawn haul is donated down to a half-day pack buffer (walks into the hall like a real donor); (2) Meal discipline — the scholar's villageMeal draws at most half the normal want from the pantry; takeFromPantry takes deferred while fragile; (3) Forage-first — the day's first work block is a haul trip until the pantry clears fragile.
- **Method**: paired before/after on identical seeds, pooled over lead+belong. Control: PANTRYGUARD unset. Armed: PANTRYGUARD=1. Both sides on leadfeast/belongfeast + FEASTSCALE_R13=1.
- **PRIMARY**: hungry-days armed ≤ 0.5× control (paired identical seeds, pooled over lead+belong). Co-primary: starvation deaths armed < control if any occur.
- **GUARDRAILS**: median survival ≥ control−10d; scholar starvation/death NOT increased (scholar kcal/health tracked — the half-buffer is the risk); national ≥ control−2; table ≥ control−2; no new death mode; rot pooled/100d ≤ 1.15× control; laundering 0.
- **Horizon**: 180d death-aware (dead villages stop +10d tail).
- **Seeds**: 4801–4808 × leadfeast/belongfeast = 16 configs (fresh seeds — the pre-registered 11/22/33/44+55/66/77/88 are on the repo's banned-seed list, 11–88 banned; see metric review).
- **Det-gate**: 16/16 bit-identical pairs on BOTH sides before trusting (r27 rule); SMOKE=1 honesty gate in the proof.
- **Panel (§15)**: balanced panels via scripts/balance-panel.js — the panel is the instrument, the pre-registered threshold is the judge.
- **Verdict form**: GO (pilot meets PRIMARY + guardrails → confirm 12–16 seeds) / NO-GO (kill fast at pilot — layer deleted zero-trace per kill protocol, instruments + evidence kept).

## Proof results (run BEFORE any pilot sims)

scripts/test-pantryguard-b2.js — 28/28 checks passed (FEASTSCALE_R13=1, base 09123a854):
- RED R0/R1: PANTRYGUARD unset → armed policy ≡ base policy, bit-identical outcome vectors (2 seeds × 2 policies, 40d).
- GREEN G0–G6: layer reports on; fragile trigger fires (emptied pantry → fragile; stocked pantry → not); forced-fragile live run counts fragile days + forced hauls; meal want halved at the pantryDraw choke point (want 1000 → 500, taken 1000 → 600); takeFromPantry deferred while fragile (null, pantry untouched, counted) and delegates when not fragile; donateDeep donates to the half-day buffer (pack 2400 → 1200, counted); armed side deterministic (40d identical).
- SMOKE=1: 12d live runs on 2 seeds × 2 policies with a mid-run pantry drain — fragile days, forced hauls, and half-meals all fired on all 4 runs (the layer is LIVE, not silently gated).

Substrate facts discovered by the proof (design-relevant):
- The game-start pantry sits at ~2 fresh-days, so the guard fires from day 1 until the pantry is built — the lever defends thin pantries, including new ones (kept as specified).
- The parent's donateHaul NEVER fires in practice (0 donates in 12 base-policy days): havenStoresAccess() is 'none' unless the scholar is INSIDE the hall, and the scholar is never inside when donateHaul runs. The DIAG's "nothing extra for the pantry" is structural, not stinginess — hence the guard's hall walk (D9).
- Emptying the pantry to absolute zero collapses the village in ~2d (real engine behavior) — test drains are partial (to ~10%).

## Design calls (Steve: "figure it out yourself" — numbered, overrulable)

- **D1**: Fragile = fresh-days < 3 OR pantry < 5× 7-day mean burn. Burn = mean of positive day-to-day pantry-kcal decreases over the trailing ≤7 dawn snapshots (net-inflow days contribute 0 — a pantry that isn't net-draining isn't fragile on the burn leg). Day 1: only the fresh-days leg can fire (no history).
- **D2**: Meal discipline halves the WANT at the pantryDraw choke point (Math.ceil(want/2)) — the engine's own draw math (trust-scaled share, best-fit, cook abstraction, indivisible pieces) is untouched. Taken ceils per the engine's indivisibility rule (1000 → 600 on 200-kcal pieces), so "at most half the want" is exact and "about half the taken" is honest.
- **D3**: takeFromPantryBulk is NOT wrapped — the spec names takeFromPantry takes; the base policies' take paths use the singular verb.
- **D4**: The forced morning haul may double with the parent's own needTrip haul on fragile days (the scholar hauls all day while fragile) — documented, honest, measured.
- **D5**: The module throws a loud STOP when PANTRYGUARD=1 but FEASTSCALE_R13≠1 — the arm can never silently run on the wrong substrate.
- **D6**: Seeds 4801–4808 (fresh) replace the pre-registered 11/22/33/44+55/66/77/88 (all banned, 11–88). Paired control re-measured on tip 09123a854.
- **D7**: Laundering proxy = spoiled-at-draw + monster-flagged items in scholar pantry draws (pantryDraw wrap, both sides). The lever performs no conversion/cook-state change, so the guardrail is satisfied by construction + measured 0.
- **D8**: Fragile is evaluated ONCE at dawn and sets the day's whole posture (forage-first + donate-deep). Per-decision-point evaluation let the morning haul clear fragile before the evening donation, so donateDeep — the lever's #1 mechanism — never fired. Meal/take wraps evaluate live at call time (they fire at endDay).
- **D9**: donateDeep walks into the hall (enterBuilding/exitBuilding, engine-guarded) before donating — the parent's donateHaul never fires because the scholar is never inside; a real donor walks in.
- **D10**: donateDeep runs at dawn after sortHaul (the forced haul is unsorted unknowns with kcalEach 0 until sorted — undonatable). The mid-day haul (if the parent's needTrip fires) follows base rules.

## Det-gate

scripts/det-gate-pantryguard-b2.js — 16 configs (seeds 4801–4808 × leadfeast/belongfeast) × 2 runs on BOTH sides at the full 180d death-aware horizon, via checkDeterminism (per-day state hashes):

**GREEN: 32/32 pairs bit-identical — 16/16 control + 16/16 armed.** Before/after comparisons trustworthy. (Full log: ~/workspace/pg-detgate.log.)

## Pilot results

scripts/measure-pantryguard-b2.js → evidence/2026-10-20/perseed-pantryguard-b2/ (32 per-seed JSONs, top-level wall keys) + pantryguard-b2.json (aggregate + paired summary). 16 configs × 2 sides, 180d death-aware, base 09123a854.

**Verdict: NO-GO at pilot — kill the lever.** Three independent pre-registered misses:

| Criterion | Pre-registered bar | Measured | Verdict |
|---|---|---|---|
| PRIMARY: hungry-days armed ≤ 0.5× control | ≤ 0.5 | 29/47 = **0.617** | MISS |
| Co-primary: starvation deaths armed < control | < 9 | **10** (armed) vs 9 (control) | MISS |
| Guardrail: scholar starvation/death not increased | ≤ control | scholar starved **6 vs 1** | VIOLATED |
| Guardrail: rot pooled/100d ≤ 1.15× control | ≤ 1.15× | **1.62×** (151k vs 93k) | VIOLATED |
| Guardrail: median survival ≥ control−10d | ≥ 121 | 139 vs 131 | pass |
| Guardrail: national ≥ control−2 | ≥ 10 | 13 vs 12 | pass |
| Guardrail: table ≥ control−2 | ≥ 13 | 13 vs 15 | pass |
| Guardrail: laundering 0 | 0 | 0 / 0 | pass |
| Guardrail: no new death mode | — | no systematic new mode ('alien' 3v0 / 'The Living Wire' 3v0 — noise-scale) | pass |

Paired hungry-days (control/armed): 7 configs improved (3/0, 5/0, 3/0, 3/0, 5/0, 5/0, 3/0), 3 worsened (0/5, 0/3, 0/3), 6 tied. The lever DOES cut hunger where hunger exists — but the scholar pays: armed introduced starvation where control had none (lead s4803: 0→1, belong s4802: 0→1, belong s4803: 0→2, belong s4807: 0→1), including **day-14 bearer starvations** (belong s4803, lead s4803) — the guard fires from day 1 (game-start pantry ≈2 fresh-days), halves the new bearer's meals and defers their takes, and the bearer starves in the first fortnight. Scholar end-kcal median 335 (armed) vs 450 (control). The "shared sacrifice" is borne by the scholar, who dies.

The guard's mechanisms all fired (pooled armed counters): 611 fragile-days, 611 forced hauls, 653 half-meals, 31,366 deferred takes, 28 deep donations. The take-deferral is the dominant channel (31k) — the scholar is refused the pantry 31k times and eats from a half-kept pack instead. Donate-deep barely bound (28): fragile-period hauls rarely exceed the half-day keep — the scholar is genuinely short, so there is nothing to donate.

Rot 1.62×: the lever keeps more food in the pantry (deferred takes + donations + forced hauls) and it rots there — 151k vs 93k kcal/100d pooled.

Wall numbers (this run, pooled 16+16): national 12→13, table 15→13, wins 0→0, exiled 0→0, wave-4 reach 13/16 both sides, wave 5: 0. Median survival 131→139d. No village won on either side.

## Balanced panel (§15)

**Instrument limitation — panel not buildable validly for this arm (recovery finding).** The worker's in-flight panel build (pg-panel-before/, pg-panel-after/) was methodologically broken: it passed `--policies leadfeast,belongfeast` (the BASE policies) with PANTRYGUARD=1 in env, but the panel child (`balance-panel.js --child`) resolves policies through `sweep-compare.js`'s POLICY_REGISTRY, which never requires `scripts/policies/pantryguard.js` — the layer is never loaded, so PANTRYGUARD=1 was inert. Verified: the 13 completed after-cases are byte-identical to their before counterparts (leadfeast/s4801: identical rows, identical death histograms). The bogus panel artifacts were deleted in recovery, not shipped.

A correct panel is impossible for this arm as designed: the treatment is the PANTRYGUARD env flag, and `simulation-flags.discover()` source-discovers `process.env.PANTRYGUARD` from the layer file, so the after panel records the flag and `comparePanels` correctly invalidates on "Unmatched flags" (the fragilityfeast precedent, evidence/2026-10-19/sim-fragilityfeast-b.md, documents this exact gate: "putting it there correctly invalidates"). The treatment cannot be expressed through policies without renaming (which breaks case pairing). Per §14, the pre-registered verdict binds: the primary and guardrails above are the judge, the 32/32 det-gate and 28/28 proof are the instrument. The panel is recorded here as unbuildable, not as evidence.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

scripts/sense-pantryguard-b2.js — transcript capture on armed/belongfeast/s4803 (the day-14 bearer-starvation config), days 1–20.

**The guard's fiction reads coherently.** On fragile dawns: "You eat light — half a share. The pantry cannot spare more tonight." The scholar's pantry meals are visibly smaller on fragile days (506/757 kcal vs 1000–1200 on non-fragile days). The deferral line ("The pantry stays shut — what is there is the village's. Eat from your pack.") fires once per day, never spams. A reader can see the sacrifice happening and understand why. PASS on coherence.

**The starvation arc reads as tragedy, not robbery.** Day 12–14 (cold snap): "Your stomach is a fist. Eat — anything real, now." / "Hunger gnaws. The pack is thin — work the green, haul it back, get it named at camp. That's the whole game." / "Dawn. You wake wrung out and unrepaired. (-6 health, wrung-out morning. You ran on empty — no water, no food, no real recovery. The body keeps score.)" The bearer (a successor, gen_ya9nwhf — the original scholar was already gone) forages unknown nuts that aren't food yet, gets robbed by a Lockpick, drinks risky creek water and gets gut cramps, and starves on day 14 while the village around them thrives (Meera's 1264-kcal day, synergy discoveries, "Enrique came back with 446 kcal... The pantry breathes."). The village is EATING — the bearer is not. The fiction is honest about what the lever does: it doesn't read as a bug, it reads as a policy choice with a body count. That is exactly why the guardrail fired.

**Villagers act like people.** Water runs ("The well won't fill itself."), gossip chains that mutate in retelling ("Three retellings in, nobody remembers what actually happened — but everyone has opinions."), a trader arriving on rumor of food, skill synergies discovered by named villagers (Grace's Peacemaker's Voice, Raj's Field Pharmacy), grief at the fire. No robotic repetition beyond the engine's normal water-line chorus. PASS.

## Village assessment (plain words)

Sixteen villages (8 fresh seeds x leadfeast/belongfeast, 180d death-aware). The guard's fiction reads as a coherent shared-sacrifice policy — fragile dawns announce half-shares, the deferral line fires once daily without spam, and a reader can watch the sacrifice happen. But the sacrifice is not shared: it is borne entirely by the scholar.

Who thrived: the village around the bearer. On belong s4803 the village eats — Meera's 1264-kcal day, synergy discoveries, "Enrique came back with 446 kcal... The pantry breathes" — while the bearer starves. The mechanism works as designed on the pantry side: 611 fragile-days defended, 31,366 deferred takes kept food in the pantry.

Who died and why: the scholar, of the guard itself. The guard fires from day 1 (game-start pantry sits at ~2 fresh-days), halves the new bearer's meals and defers their takes before the village has any pantry worth defending, and the bearer starves in the first fortnight — day-14 starvation on both s4803 configs (lead and belong). Armed introduced scholar starvation on 4 configs where control had none (lead s4803, belong s4802/s4803/s4807). Scholar end-kcal median 335 vs 450 control. The tragedy reads honestly in the transcript: the bearer forages unknown nuts that aren't food yet, gets robbed by a Lockpick, drinks risky creek water, starves while the village thrives — "The pantry breathes" while the bearer doesn't.

What knowledge/capabilities were missing: nothing knowledge-side — this was a policy choice, not a knowledge gap. The missing capability is on the lever's side: the guard has no way to distinguish the village's food from the scholar's mouth. The take-deferral (31,366 fires, the dominant channel) refuses the scholar the pantry 31k times and expects them to eat from a half-kept pack; donate-deep (28 fires) barely binds because the scholar is genuinely short — there is nothing to donate. The kept food rotted at 1.62x.

Which blank filled or documented: documented, with teeth — the belonghunger DIAG named a guard against inflow collapse; the guard is measured and killed. The named next (this run's arm 2, sim-inflowguard-b): an inflow-only, scholar-exempt guard — forced haul + donate-deep on fragile days, no take deferral, no meal halving. The scholar's mouth is not a lever.

## Metric review (§14)

1. **Seed substitution (D6).** The pre-registered seeds (11/22/33/44 + 55/66/77/88) are all on the repo's banned-seed list (11–88 banned). Per the task's explicit instruction ("use fresh seeds if any are banned"), the pilot ran 4801–4808. The paired control was re-measured on the same fresh seeds on tip 09123a854 — the comparison is still paired-identical-seed, so the PRIMARY metric's meaning is unchanged. Proposed for the record: the ban list should be consulted at pre-registration time, not run time.
2. **Pooled ratio vs paired wins.** The PRIMARY (pooled hungry-days armed <= 0.5x control) conflates two different behaviors: on 7 configs the lever cut hunger to zero where control had 3-5 hungry days; on 3 configs it created hunger (0->3-5) where control had none; 6 tied. The pooled 0.617 ratio misses this structure. For the named-next arm (sim-inflowguard-b), keep the pooled primary but add a paired improvement/worsening count as a co-primary — a lever that helps 7 and harms 3 is not the same as one that helps 10 and harms 0, even at the same pooled ratio. The scholar-starvation guardrail (<= control) proved to be the binding constraint — it fired where the pooled primary was ambiguous. Any future pantry-restriction lever should carry it as a hard guardrail from the start.

## Convergence state

food-economy: **killed-at-pilot** (pantryguard-b2). The belonghunger named next is measured and dead: the guard's mechanisms all fired but the cost landed on the scholar (6 vs 1 scholar starvations, rot 1.62x). The inflow-collapse diagnosis stands; the named next is a scholar-exempt inflow-only guard (sim-inflowguard-b, this run's arm 2). No scale-wall movement (wins 0/32, wave-5 0/32 — pre-seat substrate by construction).

## Findings backlog additions

- [killed] appended to hidden_files/sim-findings.md (pantryguard-b2 kill + the scholar-exempt inflow-only named next, claimed by this run's arm 2 sim-inflowguard-b).
