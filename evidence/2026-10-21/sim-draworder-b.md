# SIM-DRAWORDER-B — draw-order lever (loop B, food-economy, scale-wall lens)

Date: 2026-10-21 · Loop: oversight-flesh-out-loop-b · Worker tree: ~/workspace/worktrees/sim-draworder-b
Run: fleshout-loop-b-20261021T0146Z · Axis: food-economy · Arm: sim-draworder-b (GAME-CODE, env-gated)

## Filed premise

From evidence/2026-10-20/sim-rotdiff-b.md (landed a6a7bf857): the engine's two
fresh funnels rot at PARITY (0.99x pooled) — "funnel levers must win on
TIMING/PLACEMENT, not on funnel choice. The lever surface is the DRAW ORDER
(who gets eaten first), not the write path." Rotted pantry kcal was 72%
pantry-coarse (>200-kcal pieces, 3d clock) + 27% pantry-clock6 (granary +3d),
both with 0 meal draws — the fresh-first/best-fit draw never reaches them.

## The lever

Game.pantryDraw (src/js/game.js), env-gated `DRAWCOARSE=1`, DEFAULT OFF:
coarse pantry pieces (200 < kcalEach <= 2000) draw FIRST, ahead of the
fresh-first/best-fit order. Slabs (>2000) still ride last (anti-slab law
holds). Variant choice documented: coarse-by-size proxy, because the
rotdiff instruments proved stockPantry writes up-to-500-kcal pieces while
stockSurplus writes 200-kcal units, and "pantry-path pieces before surplus
units" is not directly expressible — the items carry no path tag. The
rotdiff cascade's pantry-coarse class IS this proxy (kcalEach > 200).
Diff: one conditional branch in pantryDraw's sort; nothing else touched.

Canon (PRESERVATION.md): spoiled items are still skipped by the isSpoiled
filter (draw order never resurrects rot — "Rot can't be smoked back into
food"); the sort moves kcal between mouths, never destroys it ("No
nonsensical calorie loss"). The pantryAdd/preserve path is untouched.

## Pre-registration (binding — docs/MEASUREMENT.md §§9-12, 14-15)

- **Primary**: pooled fast-rot kcal ratio (armed/control) <= 0.80x (the
  retagrot bar). fast-rot kcal = ALL rot kcal attributed to the engine's
  fresh funnels (rotdiff cascade classes pantry-coarse + pantry-base +
  pantry-clock6 + pantry-cap + surplus-3d). 'other-path' rot (hierarchy
  long-clock writers, pantryAdd finished goods) is excluded — the lever
  cannot touch it, by construction of the rotdiff instruments.
- **Seeds**: 23001-23008 (pilot; 8 fresh, verified unused: zero
  `"seed": N`/SEEDS hits in scripts/ and evidence/, not on the banned list —
  the numeric hits were pantry-kcal values like "pantryKcal": 23004, never
  seed fields). Full 16 (23009-23016, same verification) only if the pilot
  shows movement.
- **Policies**: plain leadfeast + belongfeast (scripts/policies/feastscale.js)
  — the rotdiff substrate.
- **Env**: FEASTSCALE_R13=1, SEATDRIVE=0, SURPLUSFEED unset; ARM=control (unset)
  vs ARM=armed (DRAWCOARSE=1, set inside the sweep, never inherited).
- **Horizon**: 180d death-aware (dead villages stop +10d tail max, sim-harness).
- **Guardrails (GO needs all)**: starvation deaths <= control+1; median
  survival >= control-10d; national >= control-2; no new death modes
  (death-cause vocabulary in armed ⊆ control).
- **Panel (§15)**: balanced-panel before/after compare on the same seeds ×
  policies (before = DRAWCOARSE unset, after = DRAWCOARSE=1) — the panel is
  the instrument, the pre-registered threshold is the judge. Primary rot
  metric comes from the rotdiff instruments (matched seeds); the panel covers
  guardrail/wall metrics with paired intervals.
- **GO**: primary met AND guardrails pass. **NO-GO**: kill protocol — revert
  game.js zero-trace (patch file → checkout HEAD), keep instruments + evidence.
- **Proof**: scripts/test-draworder-b.js — RED (unset ≡ pristine, byte-identical
  25d trajectories), GREEN (coarse drawn first armed; slab law; kcal conserved),
  DET (unset twice byte-identical). Proof env per its Usage header.

## Proof results

scripts/test-draworder-b.js (Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node
scripts/test-draworder-b.js --mode <red|green|det> [--tag X]):
- RED: 25d leadfeast seed 23101, DRAWCOARSE unset — digest with pristine
  HEAD game.js vs modified game.js: BYTE-IDENTICAL (cmp clean). Zero default
  behavior change proven.
- GREEN (all PASS): unset eats fine-first (pristine); DRAWCOARSE=1 eats the
  500-kcal coarse piece first even with a later clock; slab (>2000) still
  rides last armed and is untouched by a small draw; draw conserves kcal
  exactly (taken + remainder == before — no nonsensical calorie loss);
  isSpoiled-classified items still skipped (rot never resurrected).
- DET: two identical unset 25d runs byte-identical.

## Sweep results (pilot: 8 seeds × {leadfeast, belongfeast} × {control, armed})

Corpora: evidence/2026-10-21/perseed-draworder-b/{lead,belong}-{control,armed}.json
(16 runs/arm, 180d death-aware). Analyzer: scripts/analyze-draworder-b.js.

### Primary: pooled fast-rot kcal ratio (armed/control) — bar ≤ 0.80x

| policy | armed | control | ratio | median paired |
|---|---|---|---|---|
| leadfeast | 2062k | 1885k | **1.094** | 0.921 |
| belongfeast | 1237k | 1468k | **0.843** | 1.052 |
| POOLED | 3299k | 3352k | **0.984** | — |

PRIMARY MISSED (0.984x vs ≤ 0.80x). The lever does exactly what it was
designed to do — pantry-coarse rot collapses to ~0k on nearly every armed
seed (leadfeast armed: 0/0/2/0/1/0/0/0k vs control 24/22/8/34/15/11/12/49k)
— but the 200-kcal surplus units it de-prioritizes rot MORE: leadfeast
23008 armed surplus-3d 934k vs 129k control; 23004 369k vs 72k. Rot is
conserved, not reduced: saturation dominates (rotdiff theory #4 — inflow
outruns the draw; both funnels rot ~29% because the village over-produces).
Moving WHO gets eaten first just moves WHERE the rot lands.

### Guardrails

- starvation deaths: armed 11 vs control 13 — PASS (≤ control+1)
- median survival: armed 133d vs control 157d — **FAIL** (≥ control-10d)
- national: armed 9 vs control 7 — PASS (≥ control-2)
- death modes: no new modes. The naive cause-string guardrail fired on
  folk-name monster kills ('The Living Wire', 'Murkcap', ...); classified
  honestly, every armed cause KIND (combat, villager combat, monster,
  expedition, starvation, contest, sickness, dehydration, ambush, alien)
  exists in control — folk names vary per trajectory, not per lever.
  Armed villages die earlier on 10/16 seeds (the survival regression is
  real, not a cause artifact).

### VERDICT: NO-GO (primary missed, survival guardrail failed)

Kill at pilot — no 16-seed confirm. Kill protocol executed: game.js
reverted zero-trace (patch preserved at ~/workspace/draworder-b/
draworder-variant.patch); instruments + evidence kept. The lever's
mechanism is PROVEN (coarse rot → 0) but its effect is harmful (surplus
rot rises, survival drops). Fast kills are throughput.

## Panel (§15)

Not run. The pre-registered primary + guardrails decide NO-GO at pilot;
panel compute (~40 cases, ~20 min) is reserved for GO-bound arms. The
sweep IS the before/after instrument (matched seeds, rotdiff instruments,
balanced substrate); the panel would only corroborate a decision already
binding under §14. Documented, not skipped silently.

## Telemetry deviation check

- vs wrong-regime preseat baseline: 2 LOUD (national/table "disappeared") —
  regime artifact, same as rotdiff-b's documented note (that baseline used
  the full win-stack flags; this substrate lacks them).
- vs own control corpora (correct baseline): quiet, 4 metrics, no large
  deviations. The lever changes WHERE rot lands, not the wall.

## Sense check

Spoil beats fire daily and read honest on armed seeds: "The village threw
out spoiled stores: Foraged food. Christian mutters: 'Should've smoked
that. Fresh stuff keeps a day or two on the shelf — the smoke rack is right
there.'" SENSE-OK — the village names the correct fix while the lever
eats coarse-first around it. Sample lines in the per-seed corpus
(end.spoilLines).

## Village assessment

Thirty-two villages on seeds 23001-23008, lead and belong. The modal story:
a competent village climbs to regional/global, reaches wave 4, and dies
between day 67 and day 180 — village-lost to the mid-game grind. Nobody won
(0/32); nobody reached the table (0/32 — bare substrate); wave 5 never
unlocked (0/32).

The armed villages tell one story: eating the pantry's coarse pieces first
starves the draw of its urgency ordering. The 200-kcal surplus units — the
food the village SHARES — pile up uneaten and rot in their place (leadfeast
23008: 934k surplus rot, the worst single-seed number in the corpus).
Villagers kept sharing anyway: surplus inflow stays 4-5x pantry inflow on
both arms. Who thrived: belongfeast 23002/23005/23007 survived 180d on BOTH
arms — the sturdiest villages don't care about draw order. Who died and why:
armed 23006 (67d, wave 2) and leadfeast 23001/23002 (96d/81d) — the lever
pulls the rug from under villages that were surviving on the fresh-first
draw's urgency discipline.

The villagers act like people throughout: they throw out rot daily, mutter
about the smoke rack, and keep sharing into the surplus funnel even as rot
mounts. SENSE-OK.

## Blanks filled / documented

- ANSWERED (the filed question): the draw-order lever surface is real —
  coarse-first draw eliminates pantry-coarse rot (~0k armed vs ~200k
  control pooled) — but the lever is HARMFUL: pooled fast-rot 0.984x
  (bar ≤ 0.80x) and median survival −24d. The rotdiff theory holds up:
  funnel levers must win on timing/placement, and THIS draw-order variant
  picks the wrong timing — it de-prioritizes the fresh fine units the
  village actually eats in time. A future draw-order arm should try the
  opposite within-cohort ordering (coarse before fine WITHIN the same
  spoilDay cohort, urgency-first preserved) — that variant would attack
  pantry-coarse rot without de-prioritizing urgent fine units. NOTED, not
  started (this run's axis budget is spent on the kill).
- DOCUMENTED (guardrail honesty): folk-name monster kills vary per
  trajectory; a naive string-set "new death modes" check false-fires on any
  real lever. Compare cause KINDS, not strings.
- DOCUMENTED (kill): 40-line game.js variant patch preserved at
  ~/workspace/draworder-b/draworder-variant.patch for any future revival.

## Metric review (mandatory — docs/MEASUREMENT.md §14)

1. The pre-registered GO bar (≤ 0.80x pooled fast-rot) was the retagrot bar,
   applied honestly. Measured 0.984x — NO-GO, not re-scored. The lever's
   mechanism worked (coarse rot → 0) while the metric failed — that IS the
   answer (mechanism ≠ outcome; saturation conserves rot). No mid-run
   re-scoring occurred.
2. Survival guardrail (≥ control−10d): measured −24d median. A real
   regression, not a metric artifact — armed villages die earlier on
   10/16 seeds. No revision proposed; the bound did its job.
3. Death-mode guardrail: the string-set check false-fired on folk-name
   monster kills (design-honest revision: compare cause kinds). This
   revision applies to the NEXT run's guardrail, not this one — the
   verdict does not depend on it (primary + survival already decide).
4. fast-rot kcal definition (pantry-coarse + pantry-base + pantry-clock6 +
   pantry-cap + surplus-3d, other-path excluded) held up: the lever moved
   kcal between the named classes exactly as theorized. No revision needed.
5. Panel (§15): not expressible-as-shipped for a killed lever — documented
   above rather than silently skipped. The §14 pre-registration remains the
   judge; the panel is the instrument for GO-bound comparisons.
6. Seeds: 23001–23008 verified fresh (numeric hits in evidence/ were
   pantry-kcal values like "pantryKcal": 23004, never seed fields;
   cross-checked against the coordinator's banned list — clean).
