# SIM-ROTPATHDIAG-B — call-path rot attribution diagnostic (loop B, food-economy)

Date: 2026-10-20 · Loop: oversight-flesh-out-loop-b · Worker tree: ~/workspace/worktrees/sim-rotpathdiag-b
Run: fleshout-loop-b-20261021T0430Z · Axis: food-economy (scale-wall lens)
Base SHA: e39108e3 (worktree tip; paired same-commit runs only — hot-tree rule).

## Context

The retagrot story across three seed sets with the same core mechanic:
- b3 pilot (seeds 5403–5410): pooled fast-rot **0.28x** — "arrivals eaten, not stored."
- confirm-b (seeds 5411–5426): **0.56x** — primary GO, but the re-tag intercepted the engine's crisis share (survival cost: median −20d) → killed.
- b4 (seeds 5427–5434, +starvation bypass): **1.00x** — NO-GO. Per-policy: lead-armed **1.32x** (rot WORSE), belong-armed **0.55x**. The bypass neutralized the survival cost (proven, proof 17/17) but the ROT benefit did not survive it.

b4's open questions (this arm's brief):
- **(a)** what in the `Game.stockPantry` path rots faster than the engine's `stockSurplus` path (cap binding? piece size? pantry draw order? dawn-sweep behavior?)
- **(b)** why the benefit concentrates where the crisis-bypass binds.

The b4 layer was killed zero-trace per kill protocol; the starvation-bypass gate's proof (17/17) stands as established mechanism and is reused as a read-only sensor condition — this instrument changes NO behavior.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14–15 — binding, written BEFORE any sims)

- **Question (a)**: on the standard substrate, does the `Game.stockPantry` path rot faster per kcal than the engine's `stockSurplus` path, and through which channel — cap binding, piece size, draw order, or dawn-sweep asymmetry?
- **Question (b)**: split engine `stockSurplus` writes by the crisis condition (pantryKcal < 5000, the engine's own gate, sensed read-only) — does crisis-gate food rot less per kcal than non-crisis food, explaining why the b4 benefit concentrated on belong (bypass deferred 387,757 kcal there vs 122,724 on lead)?
- **Instrument**: scripts/rotpathdiag-lib.js — harness-level wraps (call through, count only) on `Game.stockPantry` / `Game.stockSurplus` / `Game.depositPantryPieces` / `Game.sweepSpoiled` / `Game.pantryDraw` / `Game.sleep`. Identity tags (`_diagP`, a stacksMatch-ignored field — glutprobe precedent) attribute every pantry arrival to its call-path: SP / SS / DPP / INIT / UN. ZERO src/js changes.
- **Method**: SINGLE side (no lever — the layer is dead; the re-tag's path IS `Game.stockPantry`, behaviorally identical to any stockPantry write). Seeds 5427–5434 × {leadfeast, belongfeast} = 16 configs — the b4 set, DELIBERATE reuse so the numbers speak directly to the b4 puzzle. No fresh-seed claim; the sweep asserts the provenance inline.
- **Substrate**: FEASTSCALE_R13=1 + SEATDRIVE=0 + SURPLUSFEED unset (asserted; sweep exits on mismatch). **Horizon**: 180d death-aware.
- **PRIMARY (binding, killdisc-style DIAG-GO)**: fast-rot attribution completeness ≥ **15/16 runs fully attributed** (≥0.99 tagged fresh-rot / total fresh-rot per run), **0 unexplained**. Runs with <2000 kcal total fresh rot are under-powered and excluded from the denominator (reported, not counted).
- **SECONDARY (binding)**: name the mechanism (cap binding / piece size / draw order / dawn-sweep asymmetry / other) WITH numbers: fast-rot per 1000 kcal inflow by path; SP over-cap vs normal; SS crisis vs non-crisis.
- **Staged**: proof test (RED/ENGAGE/DET — DET = instrumented vs pristine byte-identical) BEFORE any sweep; PILOT 8 configs (seeds 5427–5430 × 2 policies) first — pilot bar ≥7/8 configs ≥0.99 complete; full 16-config corpus only if the pilot passes.
- **Panel (§15)**: not applicable — diagnostic, no lever, no before/after. The pre-registered DIAG-GO binds regardless.
- **Verdict form**: DIAG-GO → mechanism named with numbers; the next funnel-lever arm pre-registers against it. DIAG-NO-GO → blockage named, instruments + evidence committed, no deletion of the attempt.

## Canon

- docs/CANON.md + docs/PRESERVATION.md read first. Instrument-only: no game code touched, no policy layers built. "Rot can't be smoked back into food" untouched.
- Engine facts established by code-reading (this run, before sims):
  - `Game.stockPantry` (game.js:8064): splits into ≤500-kcal pieces, spoilDay = day+3, merges via stacksMatch — **NO pantry-cap check**.
  - `Game.stockSurplus` (game.js:28162): 200-kcal units, spoilDay = v.day+3 — **cap-bound** (room ≤ 0 → returns 0; refused shares stay with the villager / are eaten at the fire only when CAPDOOR=1).
  - `pantryAdd` (food.js:2824): the capped door for finished food.
  - `pantryDraw` (game.js:~27855): **FRESH-FIRST** — spoilDay asc, then kcalEach asc, slabs >2000 kcal last. **No DRAWCOARSE exists** in src/js, docs, or scripts (grep-verified) — the brief's "coarse-first" parenthetical was a hypothesis, not a fact.
  - Crisis gate (game.js villagerMealDay): pantryKcal < 5000 → trustFactor doubled (up to 1.0).
  - `sweepSpoiled` (food.js:2582): the dawn sweep; `isSpoiled` = spoilDay ≤ day.

## Design calls (numbered, overrulable)

- **D1**: single-side diagnostic on the b4 seed set — the re-tag's write path (`Game.stockPantry(give, 'Foraged food')`, ≤500-kcal pieces) is behaviorally identical to any stockPantry write, so the SP-vs-SS contrast on the control substrate IS the b4 question's contrast. No lever rebuild (kill protocol stands; instrument must not change behavior).
- **D2**: crisis flag sensed read-only on every SS write (pantryKcal < 5000 before the write) — reuses the b4 gate's proven semantics without re-implementing the layer.
- **D3**: merge-mix measured (kcal merged into differently-tagged stacks) — tag inheritance is the known attribution diluent; the analyzer reports it as a number, not an assumption.
- **D4**: fast-rot = fresh rot within 3 days of the arrival tag — the retagrot primary's own definition, so the numbers are directly comparable to b4's control totals.
- **D5**: seed provenance asserted inline (subset of {5427..5434}); no banned-list freshness claim — this diagnostic answers a question ABOUT that seed set.

## Proof (step 1)

`FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-rotpathdiag-b.js` (Usage header
read FIRST per the ENV TRAP lesson) — **15/15 GREEN**, base e39108e3, proof
seeds 5435/5436 (proof-only, adjacent to the b4 set, unused by any judged run):
- RED: pristine runs write no `_diagP` tags.
- ENGAGE (40d × 2 seeds): SP and SS choke paths both fire; fast-rot
  attribution ≥ 0.99 on both; fast-rot observed; crisis sensor engages
  (ssCrisisKcal + ssNonCrisisKcal > 0); cap-refusal sensor engages
  (ssRefused ≈ 10k per 40d run).
- DET: 40d × 2 seeds, instrumented vs pristine byte-identical canonical
  projection (tags touch only stacksMatch-ignored fields — glutprobe precedent).

Proof fix log: the first GREEN flagged a double-count — the crisis/overcap
sub-buckets lived inside `rotByPathFast`, so summing it double-counted. Fixed
by moving sub-buckets to `W.rotByPathFastSub` (lib + sweep + analyzer);
proof re-run 15/15 GREEN on the final instrument before any sweep.

## Pilot (step 2)

8 configs (seeds 5427–5430 × leadfeast/belongfeast), 180d death-aware.
Completeness with the first instrument: 97.77–100.00% — 4/8 below the 0.99
bar (untagged 1–4k fresh rot per run). Root cause identified same-run: the
9–21d-clock writers the instrument didn't wrap (contest winner's share day+9,
route tariff day+21, league granary draw day+14, raid spoils day+14, tribute
day+14, favor repaid day+21, away-party unknown-flesh splits). Fix: six
call-through `OTHER` wraps (tradeTick, drawLeaguePool, answerRaid,
answerSuccession, awayPartiesReturnTick, _cxWinnerShare) that tag only new
pantry items — inner choke tags land first, so SP/SS/DPP attribution is never
stolen. Proof re-run 15/15 GREEN (DET holds). **The pilot did its job: it
caught the attribution gap before the full spend.** The full 16-config corpus
below was run with the final single instrument (pilot JSONs overwritten).

## Full sweep (step 3)

16 configs (seeds 5427–5434 × leadfeast/belongfeast), 180d death-aware,
FEASTSCALE_R13=1/SEATDRIVE=0/SURPLUSFEED unset, seed provenance asserted
inline (b4 set, deliberate reuse — no fresh-seed claim). Per-seed JSONs:
evidence/2026-10-20/perseed-rotpathdiag-b/{leadfeast,belongfeast}.json.
Analysis: scripts/analyze-rotpathdiag-b.js →
evidence/2026-10-20/perseed-rotpathdiag-b/rotpathdiag-b-analysis.json.

**PRIMARY (DIAG-GO): 15/15 judged runs at 100.00% completeness** (1 run,
belong/s5428, excluded as under-powered: <2k fresh rot; reported, not
counted). Bar was ≥15/16 → **DIAG-GO**. Untagged fresh rot: 0 kcal on all
16 runs. Merge-mix (kcal merged into differently-tagged stacks): **0 kcal**
— attribution is exact, not approximate (stacksMatch's kcalEach gate keeps
the 200u SS units and ≤500pc SP pieces from ever merging).

## Results — the attribution table (pooled, 2089 run-days)

| path | inflow (kcal) | fast-rot (kcal) | fast-rot / 1000 inflow |
|---|---|---|---|
| SP (Game.stockPantry) | 1,998,388 | 207,953 | **104.1** |
| SS (engine stockSurplus) | 7,449,000 | 1,349,600 | **181.2** |
| DPP (depositPantryPieces) | 1,065,871 | 13,945 | 13.1 |
| OTHER (9–21d clocks) | n/a | 0 | n/a (never fast-rot, as designed) |
| INIT | n/a | 0 | n/a |

Total fast-rot: 1,571,498 kcal / 2089d = 75,227/100d. (b4 control sanity:
2,132,972 / 2239d = 95,264/100d — same order; the 21% delta is 54 commits
of base drift between 65b460256 and e39108e3, including the killed
coarse-first draw lever. The path contrast is measured on one base.)

Per-policy: leadfeast SP 66.8/1k vs SS 152.7/1k; belongfeast SP 139.4/1k vs
SS 205.4/1k. **On both policies the engine's SS path rots faster per kcal.**

### (a) The cap-binding / piece-size / draw-order channels — all falsified

- **Cap binding**: SP over-cap writes = **0 kcal** (0 events) — the over-cap
  channel NEVER FIRES on these seeds (dawn over-cap days: 0/2087). The cap
  binds **SS, not SP**: 399,106 kcal refused of 7,450,314 give (**5.4%**,
  6250 events; lead 5.8%, belong 5.0%). The asymmetry is real but operates
  in reverse: the re-tag's SP path EVADES the cap, so the 5.4% of shares the
  engine refuses (which vanish on the control substrate — see below) would
  enter the pantry on an armed side.
- **Piece size**: SS = 200-kcal units (100%); SP = ≤500-kcal pieces (72% in
  401–500). SS rots MORE per kcal despite SMALLER pieces — piece size does
  not explain the contrast.
- **Draw order**: FRESH-FIRST in code (spoilDay asc, kcalEach asc, slabs
  >2000 last). **No DRAWCOARSE exists** anywhere in src/js, docs, or scripts
  (grep-verified) — the brief's "coarse-first" parenthetical was a hypothesis
  about a KILLED lever (sim-draworder-b, reverted zero-trace), not current
  code. Both paths write 3-day clocks, so draw order does not discriminate
  between them. Measured: pantryDraw takes 6,938k kcal at mean 10.6
  days-to-spoil; rotted SP sat 5.25d, SS 3.77d, DPP 21.3d.
- **Dawn-sweep behavior**: the sweep is symmetric — it collects whatever
  rotted. No path asymmetry there.

**Named mechanism for (a): there is none in the SP path — the question's
premise is INVERTED.** The engine's stockSurplus path rots **1.74x faster
per kcal** than Game.stockPantry (181.2 vs 104.1). None of the four
hypothesized SP-side channels fires or explains it. The SS path's extra rot
concentrates in non-crisis shares (see (b)); a standing hypothesis for the
residual: SS shares are written inside villagerMealDay AFTER the day's
pantryDraw meals, so they face the dawn sweep with one fewer meal-draw
opportunity than morning harvest arrivals — an intra-day timing asymmetry
this instrument does not timestamp (named for the next arm, not proven here).

Path mix predicts rot: Pearson(SS share of inflow, fast-rot/1k) = **+0.61**
across the 16 runs (fresh-days +0.55, pantry kcal only +0.17). Rot by name
is 'Foraged food' 2.11M of 2.5M total fresh rot — the share/harvest staple.

### (b) The crisis split — why the benefit concentrates where the bypass binds

| SS write | kcal in | fast-rot | per 1000 |
|---|---|---|---|
| crisis (pantry < 5000) | 760,785 | 5,600 | **7.4** |
| non-crisis | 6,689,529 | 1,344,000 | **200.9** |

Per-policy: lead crisis 115k → **0** fast-rot (0.0/1k); belong crisis 646k →
5.6k (8.7/1k). Crisis-gate shares rot **27x less** per kcal — the pantry is
nearly empty, so the food is eaten, not stored.

This is the belong story: the b4 bypass deferred 387,757 kcal of crisis
shares to the engine's direct-feeding path (vs 122,724 kcal on lead). Those
shares rot at ~7/1000 instead of being re-tagged or stored. **The 0.55x on
belong is the BYPASS's benefit (crisis food fed directly), not the re-tag's.**
On lead, where the crisis gate rarely opens, the re-tag's own quantity
effect dominates (see below).

### What the re-tag actually changes (synthesis for the next lever arm)

1. **Path effect (favorable, small)**: moving a non-crisis share from SS
   (200.9/1k) to SP (104.1/1k) saves ~97 rot-kcal per 1000 re-tagged.
2. **Refused-capture effect (unfavorable)**: the engine's SS refuses 5.4% of
   give at the cap; on the control substrate (CAPDOOR unset) refused shares
   VANISH — never stored, never eaten, never rotted (a conservation hole the
   landed-but-OFF CAPDOOR lever addresses). The re-tag's capless SP path
   would admit them into a ~22-fresh-day pantry where marginal 3-day
   arrivals are overwhelmingly doomed.
3. **Trajectory-composition effect (dominant in the pooled ratio)**: b4's
   per-seed armed/control fast-rot ratios are 0.04x–298x. Seed s5429: control
   died at 54d/45d (1,700 rot) while armed survived to 180d/175d (506k/216k
   rot) — the armed village lived 3x longer into deep glut. My control-side
   corpus shows the same shape without any lever (s5430: 174–180d,
   500–750k rot). **Rot is so state-dependent (0 to 500/1000 across runs)
   that the pooled 1.00x reflects which villages lived long, not the write
   path.** The b3 "mechanism story" (arrivals eaten, not stored) was a
   pantry-state story wearing a path costume.

## Village assessment

Sixteen villages on the b4 seed set, living the familiar modal story: climb
to regional/national, reach wave 4, die between day 45 and day 180 to raids
and monsters. Nobody won (0/16); wave 5 never opened (0/16). The glut is
structural here too — mean 22 fresh-days at dawn, the dawn sweep throwing
out 'Foraged food' by the hundred-kcal daily. The two s5430 villages are the
purest glut specimens (40–50 fresh-days, 384–499 fast-rot per 1000 inflow):
pantries the village cannot eat down, rotting faster than the fire can take.

Who thrived: the long-lived glut villages (s5430 both policies, 174–180d)
— they "thrive" in the sense of surviving, while throwing away half a
million kcal of rot. Who died and why: early deaths on harsh seeds (s5428
45d/111d, s5429-lead 103d); the modal mid-game death is combat/raids. The
villagers act like people in the economic trace — the fresh-first draw
eats today's-expiring food first, the crisis shares flow to empty pantries
and get eaten the same day. SENSE-OK on the instrumented paths (no new
voice, no behavior change — DET-pinned).

## Blanks filled / documented

- **FILLED (finding)**: call-path rot attribution at 100.00% on 15/15 judged
  runs (scripts/rotpathdiag-lib.js — reusable; proof 15/15 GREEN + DET
  byte-identical). The OTHER-wraps pattern closes the 9–21d writer gap the
  pilot caught.
- **FILLED (finding)**: (a) answered with numbers — the SP path does NOT rot
  faster; SS rots 1.74x faster per kcal (181.2 vs 104.1). Cap binding, piece
  size, and draw order are falsified as SP-side drivers; the cap binds SS
  (5.4% refused) and the re-tag's SP path evades it.
- **FILLED (finding)**: (b) answered with numbers — SS crisis shares rot
  27x less per kcal (7.4 vs 200.9); the b4 belong benefit is the bypass's
  direct feeding, not the re-tag.
- **DOCUMENTED (design blank)**: the funnel re-tag's rot effect is
  pantry-state-dependent, not path-driven. Any future funnel lever must
  pre-register against (i) the SS/SP path contrast (181/104 per 1000),
  (ii) the crisis split (7.4/200.9), (iii) cap-respecting writes (the 5.4%
  refused-capture), and (iv) survival-stratified judging (the pooled /100d
  ratio is compositional when the lever moves survival — s5429's 298x).
- **DOCUMENTED (instrument note)**: no DRAWCOARSE exists — pantry draw is
  FRESH-FIRST (blitz-eatlast 2026-10-13). The brief's parenthetical referred
  to the killed sim-draworder-b lever.

## Metric review (mandatory — docs/MEASUREMENT.md §14)

1. **The pilot bar (≥7/8 at ≥0.99) caught a real gap** — 4/8 below bar from
   the six unwrapped 9–21d writers. Fixed with the OTHER wraps (10 lines),
   proof re-run, full corpus on the final instrument. The staged method
   worked as designed; the pilot JSONs were overwritten by the final
   single-instrument corpus (documented, not hidden).
2. **The DIAG-GO bar is met without re-scoring**: 15/15 judged runs at
   100.00%, 0 untagged kcal, 0 merge-mix kcal. The one excluded run
   (belong/s5428, <2k fresh rot) was pre-registered as excludable.
3. **The b4 sanity check (75,227 vs 95,264/100d) is a cross-base comparison**,
   not a gate — 54 commits of drift separate the bases (including the killed
   draw-order lever). Noted, not judged.
4. **No metric was re-scored.** The DIAG-GO verdict uses the pre-registered
   bar exactly as written before any sims.

## Wall numbers (national / table / wins, wave reach)

Pooled over the 16 diagnostic runs (control substrate, no lever):
- won 0/16, national 8/16, table 14/16, wave4 14/16, wave5 0/16
- median survival 125d, max 180d, min 45d
- The wave-5 door remains the binding wall (0/16). (Table 14/16 vs b4's 0/32
  is base drift across 54 commits, not a lever effect — this diagnostic has
  no armed side.)

## Named nexts (for the food-economy axis)

1. **sim-funnelstate-b** (diagnostic or lever): the re-tag's effect is
   pantry-state-dependent. Pre-register a state-stratified judge: split
   seeds/days by dawn fresh-days (lean ≤2 / mid / glut ≥7) and judge the
   funnel re-tag's rot ratio WITHIN strata. If the re-tag helps lean and
   hurts glut, the lever becomes a state-gated valve (re-tag only when
   fresh-days < N), not an always-on funnel.
2. **Cap-respecting re-tag** (lever): any future re-tag must write through a
   cap-respecting door (or explicitly voice + eat the refused share,
   CAPDOOR-style) — the 5.4% refused-capture is pure glut feed.
3. **Intra-day timing probe** (diagnostic): timestamp share writes vs
   pantryDraw meals vs the dawn sweep to test the standing hypothesis that
   SS shares lose a meal-draw opportunity by arriving post-meal.
4. **Crisis-bypass as a standalone lever**: the bypass (defer to direct
   feeding when pantry < 5000) is proven safe (b4 guardrails) and carries
   the entire belong benefit (7.4/1000). Judge it ALONE, without the re-tag.

## Convergence state

**DIAG-GO.** The retagrot-b4 open questions are answered with full
attribution: (a) the Game.stockPantry path does not rot faster — the
engine's stockSurplus path rots 1.74x faster per kcal, and cap/piece-size/
draw-order are falsified as SP-side drivers; (b) the benefit concentrates
where the bypass binds because crisis-gate shares rot 27x less per kcal
(direct feeding), which is the bypass's doing, not the re-tag's. The pooled
1.00x is a trajectory-composition artifact over a state-dependent
mechanism, not a path effect. food-economy stays converging; the funnel
re-tag line is closed pending a state-gated redesign (named next #1).

## Run notes

- Base e39108e3 (worktree tip); all 16 runs + proof on the same commit
  (hot-tree rule: paired same-commit runs only).
- Proof 15/15 GREEN (FEASTSCALE_R13=1 per the Usage header — the ENV TRAP
  lesson). Pilot 8 configs → caught the OTHER-writer gap → fixed → proof
  re-run → full 16-config sweep on the final instrument.
- Box contention: load 11–17 during the full sweep (sibling sims); 16
  configs ≈ 36 min wall, no hangs, no /tmp dependence.
- Zero src/js changes. Zero file overlap with loop A's live arms
  (vgearconfirm*, killdisc*, belongbonds* — different systems, different
  filenames). The b4 layer was NOT rebuilt (kill protocol stands).
- Telemetry deviation check: not applicable — diagnostic with no lever and
  no armed side; wall numbers reported above instead.
- Main tree untouched (this worker never leaves its worktree).
