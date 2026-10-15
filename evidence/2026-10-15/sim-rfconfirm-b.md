# sim-rfconfirm-b — RANGEREFILL 12–16 seed CONFIRM (ARM 3, loop B)

**Run:** fleshout-b-20261015 (confirm arm) · sim-findings **#292** (named next)
**Date:** 2026-10-15 · worktree `~/workspace/worktrees/sim-rfconfirm`
**Layer under test:** `scripts/policies/rangerefill.js` (gate `RANGEREFILL=1`), landed as
commit **29b8bca8** (GO at pilot). **ZERO code changes this run** — the confirm
sweeps the landed layer read-only. Scripts changed: only the sweep/analyzer
(fresh seeds + new output dir + A/A-on-first-fresh-seed). The layer and every
policy file are untouched.

## Canon note

docs/CANON.md read first. **There is no water/thirst canon doc** (stated per the
canon rule in sim-rangedehy-b, sim-rangerefill-b, and sim-rangerefill2-b — not
invented). All water mechanics read from `src/js/game.js` as-is.

## Pre-registration (§11 — the verbatim honest bar from sim-rangerefill2-b.md §14)

Primary (conjunction, all must hold):
- (a) armed ranging-dehydration deaths == 0 ("ranging-dehydration death" = cause
  dehydration AND player AND scholar away from haven at the death beat);
- (b) pack-full departures ≥ 90% of FILLABLE armed departures (FILLABLE =
  cistern clean > 0 at the departure dawn);
- (c) true-wild fill share armed ≥ control true-wild fill share
  (Manhattan dist from haven > 1);
- (d) zero armed departures with empty pack + dry cistern.
Guardrails: (e) median survival ≥ control − 10d; (f) national ≥ control − 2/16;
(g) no new death mode (n ≥ 3) absent on control.

- **Horizon + why:** 180d death-aware (§10 — dead villages stop simulating;
  +10d tail max).
- **Seeds:** 101, 202, 303, 404, 505, 606, 707, 808 — FRESH, not the pilot's
  11/22/33/44/55/66/77/88 (seed-fitting guard). Identical both sides.
- **Policies:** `leadcourt` + `belongseek`. One side per process invocation
  (RANGEREFILL gate is process-wide env); same script, same code, own control
  in the SAME sweep (CONTROL BASELINE DRIFT #247 — never inherited).
- **SMOKE=1 + #69 unwrap guard before any sim spend** (smoke files kept in a
  `smoke/` subdir so they can't pollute the 16-run per-seed set).
- **A/A instrument check:** leadcourt s101 pristine twin, full 182d —
  BYTE-IDENTICAL (instruments trajectory-neutral on fresh seeds too).

**PASS →** confirm-pass report, the landed layer stands on independent seeds.
**MISS →** §14 metric review + honest report; no re-score, no layer edits.

## Results — GO VERDICT: MISS

| conjunct | result | verdict |
|---|---|---|
| (a) armed ranging-dehydration deaths == 0 | 2 (strict instrument count 3 incl. 1 at-haven; control 3) | **MISS** |
| (b) pack-full departures ≥ 90% of FILLABLE | 15/15 = 100.0% (control fillable n/a — no layer; 0 non-fillable excluded this time) | HOLD |
| (c) true-wild fill share armed ≥ control | 24.2% (29/120) vs 16.6% (24/145) | HOLD |
| (d) empty-pack+dry-cistern departures | 0 (control 0) | HOLD |
| (e) median ≥ control−10d | 160d vs 181d (need ≥ 171d) | **MISS** |
| (f) national ≥ control−2/16 | 9/16 vs 5/16 | HOLD |
| (g) no new death mode (n≥3) | none | HOLD |

Instrument errors: 0 on all 32 runs. Instrument-honesty A/A: BYTE-IDENTICAL.

### The (a) misses, per-seed (ranging-dehy attribution)

- **leadcourt s505 d9** — Hazel Hoffmann, ranging=true, dist=4, pack empty at
  death, cistern {clean 22}. Deterministic: the CONTROL side kills the same
  scholar on the same trajectory (leadcourt s505 d9). Day-6 dawn departure with
  pack=3 (layer dawn-filled; 3 bottles is the armed cap), cistern=5. Died 3
  days out. **The run recorded ZERO wild-water-tile visits on s505** — the
  scholar's ranging path crossed no creek/wetland/pond at all, so en-route
  fills had nothing to act on. The layer did everything in its scope
  (pack-full departure, 3/3 dawn fills) and the scholar still died: this is a
  scope-boundary miss, not a mechanism failure.
- **belongseek s505 d9** — same Hazel Hoffmann, same day-9 death, same story
  (control belongseek s505 d9 also dead). Both policies, both sides: one
  deterministic waterless trajectory, 4 of the 6 dehy deaths in the sweep.
- **The 3rd armed count is NOT ranging:** belongseek s606 d51 — Nathan Costa,
  ranging=false, `neverAway=true`, dist=1, pack=0, cistern={clean 20}. A
  dehydration death AT HAVEN with 20L clean in the cistern and an empty pack.
  Filed as a finding below — a separate phenomenon (at-haven hydration
  management), not a ranging death.

### The (e) miss (median survival 160d vs 181d)

Armed run-days (16): 55, 134, 135, 140, 146, 148, 155, 159, 160, 171, 179,
182×5. Control run-days (16): 82, 139, 140, 144, 151, 152×2, 170, 181, 182×7.
The armed median sits 21d below control — past the 10d guardrail. Death-cause
shape is familiar on both sides (monster:combat armed 68 vs control 53;
villager:monster 36 vs 37; no new mode), but armed scholars ranged more
(filledDawn 48 dawn fills kept packs full) and met more combat (68 vs 53).
Whether the median drop is noise at n=16 or a real exposure cost is
unresolved; the bar as written is missed either way.

### What held on fresh seeds

- **(b) 15/15 = 100%** fillable departures pack-full; **(d) 0 violations** —
  the departure precondition is airtight on independent seeds.
- **(c) 24.2% vs 16.6%** — the en-route mechanism reproduces (margin narrower
  than the pilot's 41.0% vs 13.4%; waterless trajectories dilute it).
- **(f) national 9/16 vs 5/16** — guardrail held with margin (observation,
  not claimed).
- Layer counters: gateTrips 0 (no dry-cistern+empty-pack states arose on fresh
  seeds), filledDawn 48, filledEnroute 17, filledGatehaul 0, gateUnresolvable 0.
- Wall otherwise: w5 1/16 both sides; table 1/16 control, 0/16 armed; wins 0
  both. The wall stands.

## Per-seed numbers

| side | seed | policy | days | rangedehy deaths | departures | pack-full |
|---|---|---|---|---|---|---|
| control | 101 | leadcourt | 182 | 0 | 0 | n/a |
| control | 101 | belongseek | 181 | 0 | 0 | n/a |
| control | 202 | leadcourt | 170 | 0 | 1 | 1/1 |
| control | 202 | belongseek | 182 | 0 | 1 | 1/1 |
| control | 303 | leadcourt | 139 | 0 | 1 | 1/1 |
| control | 303 | belongseek | 140 | 0 | 0 | n/a |
| control | 404 | leadcourt | 152 | 0 | 2 | 2/2 |
| control | 404 | belongseek | 182 | 0 | 0 | n/a |
| control | 505 | leadcourt | 152 | 1 (Hazel Hoffmann d9, ranging) | 2 | 2/2 |
| control | 505 | belongseek | 82 | 1 (Hazel Hoffmann d9, ranging) | 1 | 1/1 |
| control | 606 | leadcourt | 182 | 0 | 2 | 2/2 |
| control | 606 | belongseek | 182 | 1 (Ezra Fuchs d46, ranging) | 1 | 1/1 |
| control | 707 | leadcourt | 151 | 0 | 1 | 1/1 |
| control | 707 | belongseek | 144 | 0 | 1 | 1/1 |
| control | 808 | leadcourt | 182 | 0 | 1 | 1/1 |
| control | 808 | belongseek | 182 | 0 | 0 | n/a |
| armed | 101 | leadcourt | 182 (A/A twin byte-identical) | 0 | 0 | n/a |
| armed | 101 | belongseek | 148 | 0 | 0 | n/a |
| armed | 202 | leadcourt | 182 | 0 | 0 | n/a |
| armed | 202 | belongseek | 171 | 0 | 1 | 1/1 |
| armed | 303 | leadcourt | 159 | 0 | 1 | 1/1 |
| armed | 303 | belongseek | 182 | 0 | 0 | n/a |
| armed | 404 | leadcourt | 134 | 0 | 1 | 1/1 |
| armed | 404 | belongseek | 179 | 0 | 1 | 1/1 |
| armed | 505 | leadcourt | 160 | 1 (Hazel Hoffmann d9, ranging) | 4 | 4/4 |
| armed | 505 | belongseek | 155 | 1 (Hazel Hoffmann d9, ranging) | 2 | 2/2 |
| armed | 606 | leadcourt | 182 | 0 | 1 | 1/1 |
| armed | 606 | belongseek | 182 | 1 (Nathan Costa d51, AT HAVEN — not ranging) | 1 | 1/1 |
| armed | 707 | leadcourt | 140 | 0 | 1 | 1/1 |
| armed | 707 | belongseek | 135 | 0 | 1 | 1/1 |
| armed | 808 | leadcourt | 146 | 0 | 0 | n/a |
| armed | 808 | belongseek | 182 | 0 | 0 | n/a |

(Departure counts are dawn-departure transitions; "pack-full" = ≥3 bottles.
Control pack snapshots can read 4 — armed departures are capped at 3 by the
layer's dawn top-up.)

## Wall numbers (the standing scale-wall report)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control | 5/16 | 1/16 | 0/16 | 7/16 | 0/16 | 181d | 182d |
| armed | 9/16 | 0/16 | 0/16 | 9/16 | 0/16 | 160d | 182d |

No wins, w5 1/16 both sides — the wall stands.

## Death-cause shares

| cause | control | armed |
|---|---|---|
| monster:combat | 53 | 68 |
| villager:combat | 32 | 20 |
| monster:villager combat | 21 | 20 |
| villager:monster | 37 | 36 |
| villager:starvation | 5 | 8 |
| villager:a wound that wouldn't close | 2 | 7 |
| villager:contest | 6 | 4 |
| villager:sickness | 2 | 1 |
| villager:lockjaw | 1 | 3 |
| villager:wound_fever | 0 | 1 |
| villager:The Focus Group | 2 | 0 |
| monster:expedition | 3 | 0 |
| person:combat | 1 | 0 |

Ranging-dehydration (rangedehy attribution): control 3, armed 2 (+1 at-haven).
No new death mode ≥3 on armed.

## Village assessment (plain words)

Thirty-two villages on fresh seeds, and the pilot's story got both halves of
an honest answer. On the mechanism half, the layer reproduces cleanly: every
armed departure left with a full pack (15/15), scholars filled at creeks and
wetlands as they passed (filledDawn 48, filledEnroute 17), and the true-wild
fill share moved 16.6%→24.2%.

On the deaths half, the fresh seeds found the trajectory the pilot never saw:
a scholar who departs with a FULL pack, walks a waterless route for three
days, and dies anyway. Hazel Hoffmann died on day 9 on both policies and both
sides — deterministic, four of the sweep's six ranging-dehydration deaths in
one trajectory. The layer has no answer for her: its three mechanisms are
(fill at departure, fill on water-tile arrival, haul when dry at dawn), and
none fires when the water simply isn't on the route. That's a scope boundary
worth naming, not a bug: a fill-opportunism layer cannot beat a waterless
range.

The median miss sits beside it: armed scholars ranged a little longer and met
more combat (68 vs 53 monster:combat kills), and the median slipped 21 days
below control. At n=16 that could be noise — but the guardrail exists for
exactly this signal, and it fired.

## Blanks filled / documented

- **CONFIRMED (mechanism):** the en-route fill mechanism reproduces on fresh
  seeds — (b), (c), (d) all hold; 15/15 pack-full departures, 0 violations.
- **DOCUMENTED (scope boundary):** the layer cannot prevent deaths on waterless
  ranges — the s505 Hazel Hoffmann trajectory (full-pack departure, 0 wild
  water tiles, dead day 9 on both sides) is the residual. Any future arm must
  teach the policy to RANGE WITHIN WATER KNOWLEDGE (route-choice, not
  fill-opportunism) — that is #292's next arm, not this layer's.
- **DOCUMENTED (finding — at-haven dehydration):** armed belongseek s606 d51,
  Nathan Costa died of dehydration AT HAVEN (neverAway, dist 1) with pack=0
  and cistern={clean 20}. Filed to sim-findings.md (below). This is an
  at-haven hydration-management phenomenon the rangedehy instrument caught in
  passing — outside this arm's axis, not chased.
- **METHOD HYGIENE:** smoke outputs now live in `smoke/` subdirs per side, not
  beside the 16-run per-seed set (the A/A pristine twin is excluded from the
  analyzer by name, as before).
- **DISPOSITION:** MISS per the pre-registered conjunction — the layer is NOT
  deleted by this worker (assignment: "MISS → §14 metric review + honest
  report; no re-score, no layer edits"). The landed commit 29b8bca8 stands for
  the coordinator's kill/keep call per the kill protocol.

## Metric review (§14 — mandatory)

1. **(a) was the binding conjunct and it failed on a deterministic trajectory.**
   2 armed ranging-dehydration deaths vs the pre-registered 0 (instrument
   strict count 3, including one at-haven death). The deaths are NOT mechanism
   failures — they are scope-boundary failures: pack-full departures onto a
   waterless range. The bar as written ("0 ranging-dehydration deaths") treats
   both identically; it did its job — it said no.
2. **The (a) zero-bar is brittler than the (b)/(c)/(d) mechanism bars.** On
   water-bearing trajectories the layer is airtight (15/15, 0 violations);
   the bar punishes it for trajectories no fill-opportunism layer can touch.
   Honest revision for the NEXT arm's pre-registration: keep the zero-bar for
   the *fillable* scope (deaths after a pack-full departure onto a range with
   ≥1 visited water tile), and separately track the waterless-range residual
   as the next arm's target metric. NOT applied here — no re-scoring.
3. **The (e) median guardrail fired (160d vs 181d).** The layer may buy ranging
   exposure (armed monster:combat 68 vs 53) — full packs enable longer ranges,
   longer ranges meet more teeth. A next run should watch whether that exposure
   cost is real (bigger n, or an exposure-normalized survival metric). Until
   then, the guardrail verdict stands.
4. **The (c) mechanism margin narrowed** (24.2% vs 16.6%, against the pilot's
   41.0% vs 13.4%) — waterless trajectories dilute the share. The direction
   still holds on fresh seeds, so the mechanism is real, but the pilot's margin
   was partly trajectory luck.
5. **Method held:** fresh seeds (seed-fitting guard), own same-sweep control,
   A/A byte-identical on a fresh seed, #69 unwrap, 0 instrument errors, death-
   aware horizons, pre-registered conjunction judged as written. The MISS is on
   the merits of the bar as written.

## Convergence state

**MISS (confirm) — reported back to the coordinator.** The RANGEREFILL layer
fails the confirm's pre-registered conjunction: 2 armed ranging-dehydration
deaths on the s505 waterless trajectory and a median-survival guardrail miss
(160d vs 181d). The fill-opportunism mechanism itself holds on independent
seeds (15/15 pack-full departures, true-wild fill 16.6%→24.2%, 0 violations),
but the zero-death bar and the median guardrail do not. #292's residual is now
precise: waterless-range ranging, not fill-opportunism. Kill/keep of commit
29b8bca8 per the kill protocol is the coordinator's call.
