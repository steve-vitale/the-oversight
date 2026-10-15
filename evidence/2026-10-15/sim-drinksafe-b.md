# sim-drinksafe-b — drinkSafe wetland-fill alignment (ARM 1, loop B fleshout-b-20261015T1010Z)

**Run:** fleshout-b-20261015T1010Z · ARM 1 · sim-findings **#306** (claimed 2026-10-15; DRINKSAFE NEVER FILLS ON WETLANDS)
**Date:** 2026-10-15 · repo `~/workspace/the-scattering`, worktree `~/workspace/worktrees/sim-drinksafe` (branch `sim-drinksafe`)

## Canon note

docs/CANON.md read first. **There is no water/thirst canon doc** (stated per the canon rule, not invented). docs/PRESERVATION.md (food ladder) and docs/STORAGE.md (tools/stashes/caches) read — neither covers water. All water mechanics read from `src/js/game.js` as-is: `Game.fillWater()` (haven well draws 1L clean from the finite cistern; wild creek/wetland/pond free but risky — 10 kcal + 1 tick per liter, 1L = 1kg carry), `Game.boilWater()`, `Game.drinkWater()` (+hydration), `Game.pourWater()`; cistern 40L; `villageDrinks`; village water duties.

## The lever

sim-findings #306: the competent-family `drinkSafe` (scripts/policies/competent.js:169) fills opportunistically only when the tile type matches `/creek|well|spring|river|pond|haven/i`, but the engine's fillable wild set in `Game.fillWater()` (game.js:12304) is exactly `{creek, wetland, pond}`. `well`/`spring`/`river` are not tile types at all, and `wetland` — the most common wild water — is missed by the policy regex. So the whole competent family never opportunistically fills on wetlands even though the engine would (measured sim-rangerefill-b: control wild water-tile visits 497, filled 9 = 1.8%; true-wild 13.4%).

**Lever:** align the regex to the engine-exact set → `/creek|wetland|pond|haven/i`. One-line-class change in scripts/policies/competent.js, policy-side, zero src/js changes.

## Pre-registration (§§9–12, 14 — binding; written 2026-10-15 BEFORE any sims)

- **Substrate:** 8 seeds (11/22/33/44/55/66/77/88) × {leadcourt, belongseek} × {control, armed} = 32 runs, 180d death-aware (harness stops on Game.over; +10d tail after livingNPCs hits 0). Identical seeds both sides. OWN control in the SAME sweep (CONTROL BASELINE DRIFT #247 — never inherited). Control = HEAD bytes of competent.js (pre-fix regex); armed = worktree fixed bytes; A/B integrity asserted at sweep start (diff = the one regex line only).
- **Instruments:** scripts/routetile-lib-20261015.js (route tile-type instrument) + scripts/rangedehy-lib-20261015.js (ranging-dehydration attribution). Trajectory-neutrality proven by det-gate (instrumented vs pristine byte-identical per-day hashes, 40d × seeds 11/22 × both sides) + SMOKE=1 sweep gate (1 seed × 2 policies × 2 sides × 15d) before any sim spend.
- **MECHANISM GO:** true-wild (Manhattan dist from haven > 1) water-tile fill share armed ≥ 2× control true-wild fill share.
- **CO-PRIMARY:** ranging-dehydration deaths (scholar dehydration death with atHaven=false at the death beat) armed ≤ control.
- **GUARDRAILS:** median survival ≥ control−10d; national ≥ control−2/16; no new death mode (n≥3) absent on control.
- **MISS →** revert competent.js byte-clean (`git checkout HEAD -- scripts/policies/competent.js`), evidence-only landing. **GO →** pilot qualifies for a 12–16 seed confirm; both reported to the coordinator.
- **SENSE-TEST (Steve's law):** read real fill-beat transcripts on 1–2 seeds; judge as a person deciding, not a dispenser; include 2–3 excerpts below.

## Results

### Proof tests — GREEN (scripts/test-drinksafe-20261015.js)
- **PART A fixtures (REAL RED → GREEN):** teleport scholar onto wetland/creek/pond/haven/dry tiles, empty pack, one `competent.upkeep` (drinkSafe is the only fillWater caller in the family). RED=1 run pre-fix: ALL PASS in the buggy world (wetland 0 calls/0 fills; creek/pond/haven 1; dry 0). GREEN-expectation run pre-fix: exactly the 2 wetland assertions failed — the test detects the bug and nothing else. Post-fix: ALL 21 PASS (wetland 1 call/1 gained fill; creek/pond/haven still 1; dry still 0; scholar never moved during upkeep). (Ponds do not generate on seeds 1–40 — the pond case shims `tileAt` to report a real dry tile as `'pond'`, testing the full regex→fillWater chain with only the reported type controlled.)
- **PART B det-gate:** 40d × seeds {11,22} × sides {control,armed}: instrumented (routetile + rangedehy) vs pristine per-day state hashes BYTE-IDENTICAL 4/4 (35d/41d death-aware). A/B integrity asserted: control bytes pinned from HEAD `596bc4c9de48`, diff vs worktree = exactly the one regex line. Positive load check: each side provably `require`d its own competent.js.
- **SMOKE=1 gate:** 1 seed × 2 policies × 2 sides × 15d — A/B integrity OK, A/A byte-identical, 4/4 runs loaded the right competent.js. Gate passed before the full spend.

### Sweeps (16 control + 16 armed, 180d death-aware, identical seeds, own control)

| side | water-tile visits | filled | fill share | true-wild visits | true-wild filled | true-wild share |
|---|---|---|---|---|---|---|
| control | 497 | 9 | 1.8% | 67 | 9 | 13.4% |
| armed | 497 | 9 | 1.8% | 67 | 9 | 13.4% |

Control reproduces the #292 measurement to the digit (497/9 = 1.8%; true-wild 13.4%). **Armed is byte-identical — every run, every day, every visit.** havenFills 608, wildFills 17, refused 214, instrument errors 0, row-cap hits 0 — all identical both sides.

**Wetland visits: 433 per side, 0 filled on BOTH sides.** Creek visits 64 per side (the 9 fills). Pond visits 0 (no ponds on these maps).

### GO verdict: MISS (§14 — not re-scored)

| check | result | verdict |
|---|---|---|
| MECHANISM: armed true-wild share ≥ 2× control | 0.1343 vs 0.2687 bar | **MISS** |
| CO-PRIMARY: ranging-dehydration armed ≤ control | 3 vs 3 (same 3 events: belongseek-s22 d102 Theo Lindqvist; belongseek-s55 d12 Violet Pang; leadcourt-s55 d12 Violet Pang) | HOLD |
| (d) median ≥ control−10d | 147d vs 147d | HOLD |
| (e) national ≥ control−2/16 | 5/16 vs 5/16 | HOLD |
| (f) no new death mode (n≥3) | none (death tables byte-identical) | HOLD |

### Why the mechanism never fired (the diagnosis)

The regex was genuinely misaligned (fixtures prove it), but `drinkSafe`'s fill is evaluated **at upkeep time** — 3×/day at day-part boundaries, wherever the scholar happens to stand. A diagnostic probe (armed leadcourt s22, 182d): **441 upkeep calls, 0 on a wetland.** Scholars pass *through* wetlands mid-route (121 travelTo arrivals on s22 alone) but are never standing on one when upkeep fires. Two compounding facts:
1. **Packs stay full:** 397/433 wetland arrivals had pack ≥3 — drinkSafe's `pack < 3` gate wouldn't fire anyway.
2. **Upkeep timing:** the 36 pack<3 wetland arrivals all moved on before the next upkeep. The fills that DO happen are haven fills (atHaven) and the occasional upkeep-on-creek (d16 s55: three creek fills in one ranging day — the creek half of the mechanism works; the wetland half never gets the chance).

So the one-line fix is **correct but behaviorally inert**: it repairs a state (upkeep-on-wetland-with-room) that does not occur in 32×180d of competent-family ranging. The #292 gap needs an en-route trigger (the killed rangerefill layer's travelTo wrap moved true-wild share 13%→40%), not a regex tweak. competent.js reverted byte-clean per the kill protocol; proof/sweep/evidence retained.

### Sense-test (SENSE-TESTING LAW)

Real beats, armed leadcourt s55 (the Violet Pang trajectory). The fills that happen read as a person being careful — the wild-fill half that works:

> d16 [creek] Filled 1L (risky — Creek source (unknown)). 2L carried (2kg). (-10 kcal hauling, 1 tick.)
> d16 [creek] Filled 1L (risky — Creek source (unknown)). 2L carried (2kg). (-10 kcal hauling, 1 tick.)
> d16 [creek] Filled 1L (risky — Creek source (unknown)). 3L carried (3kg). (-10 kcal hauling, 1 tick.)

Three upkeep beats in one ranging day, each naming the cost (10 kcal, 1 tick, 1kg) and the risk ("unknown"). Not a dispenser — a deliberate top-up with honest accounting.

The haven economy around the scholar is alive — the cistern visibly breathes:

> d7 [haven] Filled 1L (clean — Haven well). 3L carried (3kg). (-10 kcal hauling, 1 tick.) Cistern: 3L left.
> d14 [haven] Filled 1L (clean — Haven well). 1L carried (1kg). (-10 kcal hauling, 1 tick.) Cistern: 6L left.

And the village hauls its own water while the scholar ranges ("💧 Jesse returns with 7L of creek water. Risky until the hearth boils it." / "The well won't fill itself.") — the scholar is not the village's water system, which is why the scholar-side lever couldn't move village outcomes either.

### Wall numbers (the standing scale-wall report)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control | 5/16 | 1/16 | 0/16 | 4/16 | 0/16 | 147d | 182d |
| armed | 5/16 | 1/16 | 0/16 | 4/16 | 0/16 | 147d | 182d |

No wins, no w5 — the wall stands, untouched by this arm (byte-identical sides).

### Death-cause shares (byte-identical both sides)

monster:combat 38 | villager:combat 32 | monster:villager combat 22 | villager:monster 18 | villager:starvation 16 | villager:a wound that wouldn't close 14 | villager:sickness 10 | villager:contest 7 | villager:lockjaw 2 | villager:Nevermore 2 | person:combat 2 | monster:expedition 1. Ranging-dehydration (scholar, away at the beat): 3 per side — the same three events (s55 Violet Pang ×2 policies, s22 Theo Lindqvist). No `thirst`. No new death mode.

## Village assessment (plain words)

Thirty-two villages lived and the instruments touched nothing — the two sides are the same thirty-two lives down to the day. Scholars range, pass through wetlands constantly (433 visits), and never fill there not because the policy forbids it (it did, before the fix) but because they're never *there* when the decision comes up: upkeep fires at part boundaries, the scholar fills at haven before leaving and tops up on creeks when the moment aligns. Packs ride full — 397 of 433 wetland arrivals at 3 bottles — because the competent family already drinks and refills on a tight loop. The three ranging-dehydration deaths are the same three the #292 arm measured: Violet Pang twice on seed 55, Theo Lindqvist on seed 22 — scholars who ranged past water with room in no bottle and no upkeep to catch them.

The village that loses a ranger to thirst keeps hauling its own water ("The well won't fill itself") — the scholar's bottles are personal, the cistern is communal, and no scholar-side regex moves the communal outcome. That was the #291 lesson restated: without an en-route fill verb, wild water stays decoration.

## Blanks filled / documented

- **DOCUMENTED (measurement): the #306 fix is correct but inert** — fixtures prove the regex was misaligned and the fix repairs it; 32×180d proves the repaired state never occurs (0 on-wetland upkeeps in 441; 433 wetland arrivals, all mid-route). The blank needs an en-route trigger, not a regex tweak.
- **DOCUMENTED (method): per-run A/B load honesty** — every sweep child records which competent.js it actually loaded (`competentPath` in each run JSON); the sweep asserts 32/32. The Module._resolveFilename hook + HEAD-pinned control bytes pattern is reusable for any policy-file A/B.
- **DOCUMENTED (correction): pond rarity** — no `pond` tiles generate on seeds 1–40 (scanned). The engine's fillable set names ponds, but the competent family's maps never offer one; the pond fixture shims `tileAt`.
- **KILLED: the drinksafe regex fix** — reverted byte-clean per the kill protocol (MISS on the pre-registered mechanism GO); proof degrades to documenting the misalignment. #306 stays open with the new prescription: en-route fill trigger.

## Metric review (§14 — mandatory)

1. **The mechanism GO was honest and the miss is on the merits.** Armed true-wild share == control share (1.0×, bar 2×) because trajectories are byte-identical — the fix never fires. Not re-scored: the "correct but inert" consolation does not move the bar.
2. **The fixture suite and the sweep measure different things, and both were needed.** Fixtures prove the regex was wrong (unit truth); the sweep proves the wrongness doesn't matter in practice (behavioral truth). A fixtures-only arm would have landed an inert change claiming a fix; a sweep-only arm couldn't have distinguished "regex fine" from "regex broken but unreachable." Keep both.
3. **The co-primary mapping bug (deathBeat vs flat record) was caught by reading the lib, not by a test failure.** The first analyzer run reported ranging=0/0 — a silent wrong number, not a crash. Any future consumer of rangedehy-lib should assert the record shape (e.g. `deaths[0].ranging !== undefined` when nDehydration > 0) rather than trusting the header comment's field paths.
4. **Upkeep-time vs en-route is the general lesson for policy fill verbs.** Any future "fill opportunistically" lever must trigger on arrival (travelTo wrap, like the killed rangerefill layer) — upkeep-time evaluation only sees where the scholar *lingers*, and scholars don't linger on wetlands.

## Convergence state

**KILLED AT PILOT (MISS on the pre-registered mechanism GO, §14).** The drinkSafe/wetland regex misalignment (#306) is real at the unit level but behaviorally inert across 32×180d: 0 on-wetland upkeeps in 441, 433 wetland arrivals all mid-route, packs full at 397/433 arrivals. competent.js reverted byte-clean; evidence, proof (21/21 GREEN + 4/4 det-gate), sweep (32 runs + A/A), and sense transcripts retained. #306 stays open: next arm needs an en-route fill trigger, not a regex tweak.
