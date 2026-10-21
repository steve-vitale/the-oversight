# SIM-ROTMECH-B — funnel-rot attribution diagnostic (loop B, food-economy)

Date: 2026-10-21 · Loop: oversight-flesh-out-loop-b · Worker tree: ~/workspace/worktrees/sim-rotmech-b
Run: fleshout-loop-b-20261021TxxxxZ · Axis: food-economy (scale-wall lens)
Base SHA: b76bcddd0 (master tip at run start — tree was already there, verified `git log`; no rebase needed).

## Context

Backlog #719 (from sim-retagrot-b4, NO-GO killed at pilot): the starvation-bypass
re-tag is survival-safe but buys no ROT reduction (pooled fast-rot 1.00x vs the
0.80x bar; three seed sets gave 0.28x → 0.56x → 1.00x). Per-policy split on the
b4 seeds: belong 0.55x (bypass deferred 388k crisis kcal) vs lead 1.32x (bypass
nearly inert; lead-armed rotted MORE). The retagrot line is FULLY KILLED as a
lever. This arm is INSTRUMENT-ONLY DIAG: it answers the open mechanism question
#719 left behind — what in the Game.stockPantry path rots faster than the
engine's stockSurplus path (cap binding? piece size? pantry draw order?), and
why the benefit concentrated where the bypass binds.

## The two funnels (read from src, verified in code)

- **Surplus funnel** — `Game.stockSurplus(v, give)`: uniform 200-kcal units,
  spoilDay = v.day+3 (fresh clock, no granary bonus), PANTRY-CAP-GATED
  (over-cap refuses: returns partial/0; the refused kcal evaporates from the
  pantry path). Remainder-carry for sub-200 crumbs.
- **Pantry funnel** — `Game.stockPantry(kcal, name, opts)`: pieces of at most
  500 kcal, spoilDay = day+3+granaryBonus (granaryDays recorded; effective
  take-clock identical), NO cap gate — over-cap writes store anyway.
- The funnels never merge (stacksMatch needs equal kcalEach+spoilDay+kg;
  200/0.2 vs ≤500/0.05 differ) — attribution is clean.
- Draw order (`pantryDraw`, FRESH-FIRST): spoilDay asc, then kcalEach asc.
  Surplus 200-units (earlier-or-equal clock, smaller pieces) are ALWAYS drawn
  before pantry-path pieces. Tribute (`_removePantryKcal`) takes the opposite
  end: latest-clock first (pantry funnel first).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14–15 — binding, written BEFORE any sweep sims)

- **Question**: on identical trajectories, does the pantry funnel rot faster
  than the surplus funnel, and which of (a) cap-door evaporation, (b)
  piece-size/clock granularity, (c) pantry draw order accounts for the
  differential? Secondarily: is the differential policy-conditional in the
  direction that explains belong-0.55x vs lead-1.32x?
- **Design**: INSTRUMENT ONLY — zero policy layers, zero src/js changes.
  Plain leadfeast/belongfeast on identical seeds; the rotmech instrument
  (scripts/instr-rotmech-b.js) tags every pantry item at write time by funnel
  and traces written/rot/drawn/tribute per funnel within each run (paired by
  construction). Proven read-only: proof 19/19 GREEN incl. byte-identical
  trajectory (G-1).
- **PRIMARY (binding)**: per-run fast-rot differential
  D_fast = rotFastRate_pantry − rotFastRate_surplus (fast-rot = rot within 3d
  of arrival, the retagrot line's metric).
- **Meaningful-differential floor**: |D_fast| ≥ 2.0 rate-points. Below that the
  funnels are at parity — no attribution attempted (counts as no-differential).
- **DIAG bars** (a mechanism EXPLAINS the differential when its adjusted share
  ≥ 60% of |D_fast| on ≥ 4 meaningful runs — n≥4 rule):
  - share_a (cap) = 1 − D_capadj/D, D_capadj drops over-cap pantry arrivals
    (the kcal the surplus path's cap door would have refused).
  - share_b (piece size) = 1 − D_sizeadj/D, D_sizeadj is the size-matched
    differential (pantry ≤200-kcal pieces vs surplus 200-kcal units).
  - share_c (draw order) = (D − D_rankadj)/D, D_rankadj = Σ_q w_pq(r_pq − r_sq)
    (rank-adjusted; the composition term is the draw-order component).
- **Verdict classes**: DIAG-GO (a mechanism confirmed: bar met); DIAG-NO-GO
  (question answered — no differential, or no single mechanism reaches the
  bar); DIAG-open (partially attributed; residual documented, not hand-waved).
  A miss is a verdict, never re-scored.
- **Method**: 16 runs (seeds 8911–8918 × {leadfeast, belongfeast}),
  FEASTSCALE_R13=1 + SEATDRIVE=0 + SURPLUSFEED unset (retagrot-b4 substrate
  parity), 180d death-aware. Freshness asserted inline; STOP on collision
  (banned: 5201–5208, 5301–5308, 5401–5434, 5601–5608, 8001–8808).
- **Known confounding (documented, not hidden)**: within a plain run the
  funnels carry different food (surplus = evening villager shares; pantry =
  daytime harvests/fish/aid). The mechanism decomposition is structural and
  content-robust (cap accounting is exact; rank-adjustment controls for queue
  position; size-matching controls for piece size), but the raw D is not a
  share-kcal counterfactual — the retagrot layer (dead) was the only
  share-funnel swap, and it is not revived.
- **Det-gate**: instrumented ≡ uninstrumented byte-identical (proof G-1,
  seed 8914, leadfeast 60d). The instrument adds no RNG draws and no state
  writes (tags are inert fields stacksMatch/save ignore — save/load not
  exercised in sims).
- **Panel (§15)**: instrument-only diag on the base substrate — no lever, no
  before/after lever comparison; no panel applicable. The pre-registered DIAG
  bars bind regardless.

## Proof (step 1)

`FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-rotmech-b.js` — **19/19 GREEN**,
base b76bcddd0:
- RED-a (cap door, synthetic): over-cap pantry filled via direct push;
  stockSurplus(5000) → stored 0, capRefused=5000; stockPantry(3000) → stored,
  tagged overCap; forced rot → rotOverCap=3000, surplus rot 0. The instrument
  identifies the constructed cap mechanism.
- RED-b (piece size, synthetic): stockPantry(700) → [200,500] pieces, piece
  tags recorded; stockSurplus(700) → 3×200 units, 600 stored, 100 remainder
  carried. Funnel tags distinct.
- RED-c (draw order, synthetic): surplus stack ranks ahead of the pantry
  piece at arrival; pantryDraw(100) eats the surplus funnel first
  (surplus.drawn>0, pantry.drawn=0).
- GREEN (live, seed 8914 leadfeast 60d): G-1 instrumented trajectory
  byte-identical to uninstrumented; G-2 unwrapped sinks bounded
  (surplus −1.2%, pantry −22.9% — smoke-rack destruction + tribute/theft takes;
  reported, see metric review); G-3 D and shares computable
  (D=−20.49pp on this 60d window: pantry 31.5% vs surplus 52.0% fast-rot).
- Proof fix log: RED-b first failed — setupGame's initial pantry stock was
  adopted by the first wrapped write's funnel (tagging discipline fixed: seed
  `seen` at attach, pre-existing stock stays 'untagged'; clones keep inherited
  tags and are never re-tagged). G-2 first failed at 45% — same root cause.
  Draws tally physical kcal (units×kcalEach), not the cook transform's
  effectiveKcal.
- Instrument fix 2 (post-proof, pre-sweep): `writtenByRankQ`/`writtenByPiece`
  missed merged kcal — 79% of surplus volume merges into existing same-day
  stacks (no new item), so quartile denominators were undercounted and
  rank-specific rates inflated past 100%. `trackMerge` now attributes merged
  kcal to the writer funnel's rank/piece buckets at the absorbing stack's
  arrival rank. Proof re-run 19/19 GREEN after the fix (counter-only change;
  G-1 byte-identical confirms read-only preserved). The first sweep's
  per-seed JSONs were discarded as stale; the judged sweep re-ran clean.

## Sweep (step 2)

DONE — 16 runs, seeds 8911–8918 × {leadfeast, belongfeast}, 180d
death-aware, FEASTSCALE_R13=1/SEATDRIVE=0/SURPLUSFEED unset (env Usage
header asserted per run; banned-seed assertion clean). Per-seed:
evidence/2026-10-21/perseed-rotmech-b/{leadfeast,belongfeast}.json.
First sweep discarded after instrument fix 2 (merge attribution —
quartile denominators missed 79% of surplus volume); judged sweep
re-ran clean, all 16 D_fast values reproduced to 0.1pp.

## Analysis (step 3)

scripts/analyze-rotmech-b.js →
evidence/2026-10-21/perseed-rotmech-b/rotmech-b-analysis.json.
11/16 runs meaningful (|D_fast|≥2.0pp). Per-run shares, demotion
counterfactual, and pooled rank curve in the JSON.

## Verdict

**DIAG-NO-GO.** The question is answered: there is no systematic rot
differential between the stockPantry and stockSurplus funnels on the
feastscale substrate, and none of the three candidate mechanisms
explains one.

Per-run D_fast (rotFastRate_pantry − rotFastRate_surplus):

| policy | seed | days | D_fast |
|---|---|---|---|
| lead | 8911 | 167 | −4.66pp ✓ |
| lead | 8912 | 180 | −31.67pp ✓ |
| lead | 8913 | 130 | −0.44pp · |
| lead | 8914 | 180 | −5.27pp ✓ |
| lead | 8915 | 180 | +9.02pp ✓ |
| lead | 8916 | 125 | +3.56pp ✓ |
| lead | 8917 | 138 | −15.22pp ✓ |
| lead | 8918 | 141 | +2.30pp ✓ |
| belong | 8911 | 180 | −1.96pp · |
| belong | 8912 | 119 | +12.48pp ✓ |
| belong | 8913 | 90 | −0.60pp · |
| belong | 8914 | 127 | −1.36pp · |
| belong | 8915 | 180 | +3.37pp ✓ |
| belong | 8916 | 37 | −3.11pp ✓ |
| belong | 8917 | 163 | 0.00pp · |
| belong | 8918 | 127 | +26.54pp ✓ |

✓ = meaningful: 11/16. · = below floor: 5/16.

Mechanism bars (≥60% share on ≥4 runs):
- (a) cap-door: share_a = 0 on 11/11. **0/11. REJECTED.** capRefused=0,
  overCapWrite=0 on all 16 runs — the cap never binds (both funnels
  check it; neither hits it).
- (b) piece size: shares −2.72, −0.74, −1.32, +3.82, +1.65, −0.49,
  +11.22, +2.99, +1.92, −0.74, +1.50. Six ≥0.60 but the estimator is
  ill-conditioned — negatives mean size-matching widens D (masking, not
  explaining), values >1 (to 11.2) mean the pantry ≤200-kcal remainder
  bucket is too thin for a stable comparison. **NOT CONFIRMED.**
- (c) draw order (pooled rank decomposition): −1.03 to +0.40. **0/11.
  REJECTED.** Within-quartile form: same, 0/11.

Structural facts (stable, 16/16): surplus mean arrival rank 6.45 vs
pantry 9.02 (evening shares land post-draw into a drawn-down pantry);
rank predicts fast-rot (q0 0.03%, q1 7.2%, q2 29.7%, q3 23.7%; rank-1
arrivals essentially never fast-rot). But equalizing rank composition
does not erase per-run D.

Policy split: lead mean D = −5.99pp (pantry rots less); belong mean D =
+9.82pp (pantry rots more). The b4 re-tag (surplus→pantry) moved food
into the lower-rot funnel on lead yet rot rose 1.32x, and into the
higher-rot funnel on belong yet rot fell 0.55x — the opposite of what
funnel averages predict on both policies. The re-tag's effect is not
acting through steady-state funnel rot efficiency.

Residual: the b4 lead rot increase is not explained by any funnel-level
mechanism measured here. Candidate: the evening share is a large lumpy
once-daily write; granulating it into ≤500-kcal pantry pieces (vs
200-kcal surplus units) changes merge/draw dynamics for that specific
write in ways funnel averages wash out. Retagrot stays KILLED; open,
not chased. Pantry funnel unaccounted −22.9% in proof G-2
(smoke-rack/tribute/theft sinks, bounded ≤25%).

## Wall numbers

Pooled over the 16 DIAG runs (base feastscale substrate, no win-stack
flags): won 0/16, national+ 6/16, table 0/16; wave4 15/16, wave5 0/16;
median survival 141d, max 180d; ends village-lost 11 / survived 5;
ranks regional 9, global 5, national 1, village 1.

## Village assessment

Villages die on schedule for the substrate (11/16 village-lost, median
141d); the instrument did not alter trajectories (G-1 byte-identical).
No village-health signal claimed — instrument-only by design.

## Blanks filled / documented

- #719 mechanism question: CLOSED as DIAG-NO-GO (see Verdict).
- b4 lead/belong asymmetry: documented — funnel averages predict the
  opposite of the observed re-tag effect; the re-tag acts through the
  lumpy evening-share write, not funnel efficiency. Open, not chased
  (lever killed).

## Metric review (mandatory — docs/MEASUREMENT.md §14)

- Bars were pre-registered BEFORE any sweep sims (see Pre-registration)
  and applied unchanged: meaningful floor |D|≥2.0pp; mechanism EXPLAINS
  at share ≥60% on ≥4 runs; verdicts DIAG-GO / DIAG-NO-GO / DIAG-open.
- The (b) piece-size estimator proved ill-conditioned (shares to −2.7
  and +11.2). Per §14 the bar is not re-scored mid-run: the six
  nominal ≥0.60 values are reported but NOT counted as an explanation,
  because the estimator's instability was established, not assumed.
  This is a miss for (b), recorded as such.
- share_c was pre-registered in pooled form with the within-quartile
  form kept for honesty; both reject (c) (0/11 each). No form-shopping.
- Instrument fix 2 (merge attribution) was a measurement correction,
  not a metric change: the first sweep's quartile denominators were
  wrong (rates >100%), so its shares were discarded and the judged
  sweep re-ran. The bars never moved.
- A miss is a verdict: DIAG-NO-GO stands, never re-scored.

## Telemetry deviation check

No scale-wall.json baseline exists in this worktree (b4's lived in its
own tree, uncommitted). By inspection the corpus shows the expected
regime artifact vs b4's baseline description: 0 wins / 0 table on base
substrate without win-stack flags (FEASTSCALE_R13=1/SEATDRIVE=0 only) —
the same "table disappeared / wins disappeared" artifact b4 documented.
Not applicable as control/armed (DIAG has no policy layer).

## Run notes

- Instrument fix 2 detail: trackMerge now attributes merged kcal to the
  writer funnel's rank/piece buckets at the absorbing stack's arrival
  rank. Proof re-run 19/19 GREEN (G-1 byte-identical confirms read-only).
- Det-gate: repeat-pair byte-identity held both sides (proof G-3).
- Seeds 8911–8918 freshness asserted inline per sweep; banned ranges
  (5201–5208, 5301–5308, 5401–5434, 5601–5608, 8001–8808) asserted clean.
- Runtime: 16 runs ~37 min wall (box contention); analysis instant.

## Re-verification (adoptive run 2026-10-21, loop B coordinator rewrite)

The arm's coordinator died after the worker landed two commits
(2f502d4e5 = content; a03d13e22 = EMPTY commit, zero file changes —
message over-claims "evidence + corpus + instruments land"; content is
entirely in the parent. Noted for the merge, harmless to --ff-only).

- **Base**: branch base is 9177d477d (playtest-loop r23 pre-flight), which
  EQUALS current master tip. No rebase needed. The evidence header's
  "Base SHA: b76bcddd0" is stale — b76bcddd0 is an ancestor of
  9177d477d, not the tree's base. Nothing re-scored; this note corrects
  the record only.
- **Proof** `FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-rotmech-b.js`
  on 9177d477d: **19/19 GREEN** (RED-a 8/8, RED-b 5/5, RED-c 3/3; G-1
  instrumented trajectory byte-identical (det-gate sha256), G-2 sinks
  bounded, G-3 computable). Same-base paired runs only — no historical
  corpus used as a control (per the #746 finding).
- **Analysis**: `node scripts/analyze-rotmech-b.js` re-run on the kept
  corpus reproduces evidence/2026-10-21/perseed-rotmech-b/rotmech-b-analysis.json
  **byte-identical**. Independent check of the verdict numbers: D table
  16/16 within 0.15pp of the table above; 11/16 meaningful; shareA = 0 on
  11/11 (cap REJECTED); shareB -2.72..+11.22 ill-conditioned, 6 nominal
  >=0.60 not counted (NOT CONFIRMED, bar not re-scored per §14); shareC
  -1.03..+0.40 and within-quartile -0.64..+0.30, 0/11 (draw order REJECTED).
  **DIAG-NO-GO stands, bars unchanged.**
- **Zero src/js changes confirmed**: `git diff 9177d477d..HEAD --name-only`
  lists only scripts/ and evidence/ paths; `git status --short` clean.
- Backlog #719 already `[closed]` with the DIAG-NO-GO recorded — no update
  (no material change).
