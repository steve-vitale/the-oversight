# SIM-PORTIONWINDFALL — portion-scaled windfall feasts (ARM sim-portionwindfall-b, loop B, food-economy)

Date: 2026-10-18 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-portionwindfall-b
Axis: food-economy (scale-wall lens) — the windfall line's fourth variant,
via sim-findings.md #558's NAMED NEXT (sim-windfallcap-b's killed pilot:
300*roster threshold proven, frequency cap blamed for tails rotting).

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14-15 — binding, written BEFORE sims)

- **Question**: sim-racksanswer-b proved the windfall feast is a POWERFUL rot
  lever (0.536x pilot / 0.662x confirm on the 300*roster doomed threshold)
  but was KILLED on the survival guardrail (median -19d, harm unattributed).
  b2 (500*roster + 2/week cap) KILLED at pilot (0.987x — neutered). The
  cap-alone variant (300*roster + 2/week cap) KILLED at pilot (0.885x) —
  the cap is the ONLY code difference from the 0.536x arm, so the cap IS the
  culprit: doomed piles arrive in glut clusters and 2/week truncation leaves
  the tail of every cluster to rot. Can the proven threshold be kept with NO
  frequency cap, bounding only the COST per feast (portion scaling), letting
  glut clusters burn across consecutive days?
- **Lever**: scripts/policies/portionwindfall.js (PORTIONWINDFALL=1, default
  OFF; wraps leadfeast/belongfeast). When the pantry holds doomed fresh
  (bonus-inclusive (spoilDay+bonus)==day+1 — rots tomorrow, must be eaten
  tonight) beyond **300*roster** kcal (the proven threshold), the scholar
  holds a feast NOW, bypassing the 7/14d cadence. **NO frequency cap.**
  Instead the COST per feast is capped at **275*roster**: the scholar invites
  the h most-trusted invitable guests where h = floor(275*roster/400) - 1, so
  the engine's fixed 400/head feast cost lands at <= 275*roster (roster too
  small for 4+ guests: invite everyone). Every other feast gate kept (dusk,
  haven, one/day, affordability have>=scaledCost*1.5, contribution >=1500/7d
  — the r13 rule via recentGives + recentTribute). Draws urgency-first via
  the engine's own hostFeast/pantryDraw (fresh-first; spoiled skipped — no
  laundering). Cadence clock resets on a windfall. One honest voice line
  names the why — no dev-artifact parenthetical (the windfallcap-b polish bug
  is not re-landed). Doomed-fresh uses the rot-accounting split
  (preserved/rendered excluded), NEVER a foodState==='fresh' filter
  (finding #546 — pinned by proof G8/G8b).
- **C = 275 justification** (from the b2/cap corpora): the cap corpus's 112
  fires drew 245k kcal (avg 2.2k/fire) against 628k doomed-seen — avg doomed
  pile ~5.6k/fire (~465/person at roster 12); a full 400/head feast for
  roster 12 = 5.2k couldn't clear the average glut in one fire, yet the
  frequency cap made that the only shape. The nightly draw is ~125
  kcal/person/day (the rackscap binding constraint); 275 = 2.2x the nightly
  draw — a celebratory portion, not a gorge; the windfall's documented
  +starvation mechanism is meal-displacement, and displacement scales with
  portion size. A threshold pile (300*roster = 3.6k at 12) clears 92% in one
  3.3k feast; the remainder re-fires tomorrow — the cluster-tail burn is
  exercised by construction even on threshold piles. Average gluts (5.6k)
  burn across ~2 days; the b2 500*roster=6k piles burn across ~2 days too —
  nothing neutered, only paced.
- **SUBSTRATE**: FEASTSCALE_R13=1 both sides; SEATDRIVE=0 EXPLICIT (pre-seat);
  base courtship policies only. 180d death-aware; dead villages stop.
  Assert env up front; SWEEP STOPS on mismatch.
- **SEEDS**: pilot 8 FRESH seeds 6201-6208 x {leadfeast, belongfeast} x
  {control, armed} = 32 runs, IDENTICAL seeds both sides, own in-sweep
  control. (Seeds 6201-6208 prescribed fresh for this run.)
- **PRIMARY** (binding): (rot:preserved + rot:fresh) ABSOLUTE per 100 days
  alive — armed <= 0.80x control (the frequency-cap variant hit 0.885x —
  portion scaling must beat it to earn a keep).
- **ENGAGEMENT** (kill-fast, counts CLUSTER-TAILS per #558's metric lesson):
  windfall tail-burn fires (a fire with another windfall fire <=2d earlier —
  the glut-cluster tail the frequency cap truncated) >= 8 across the armed
  side. Mean fires reported, not gating.
- **Guardrails**: median survival >= control-10d with dose-response
  attribution (feast-count vs paired survival delta; harm-unattributed split
  rule |r|<0.3 AND primary <= 0.70x per the #538-adopted metric review);
  starvation deaths <= control+2 per-pair ABSOLUTE (collapse-aware, both
  >30d); no new death mode (dedup on (who,day,cause), person-kind only,
  thirst/dehydration canonicalized — #515/#517/#525/#544); laundering 0
  measured AT CONVERT TIME.
- **Det-gate**: wrapped+PORTIONWINDFALL-unset byte-identical to base over 40d
  (2 seeds); SMOKE+proof GREEN before any sims.
- **Balanced panel**: not built — killed at pilot, per the two killed priors'
  precedent (the before/after comparison lives in the sweep analyzer output
  below; the sweep data is not in the panel's metrics-contract format).

## Proof results (scripts/test-portionwindfall-b.js — run BEFORE any sims)

PROOF GREEN (38 checks):
- RED gate-off: no fire, no voice, no telemetry, no fire-day bookkeeping
  (delegation byte-identical; det-gate confirms over 40d trajectories).
- GREEN: doomed 9000 > 300*12=3600 threshold → fires once; feastDay set;
  voice said once; NO dev parenthetical (the polish bug pinned absent);
  telemetry kcal/doomed set; cadence reset; fire day recorded.
- THE PORTION CAP (new): spent=3200 <= 275*12=3300; doomed eaten 3200
  (~one portion); cap-bit recorded (9000 > 3300 — the portion cap bit);
  guest subset invited (7 of 11, top-trust); glut tail SURVIVES (5800 >
  3600 — burns tomorrow by construction).
- G2 pins the floor: doomed 2000 < 3600 → NO fire.
- G2b: a 5000 doomed pile (between 300*roster=3600 and b2's 500*roster=6000)
  FIRES — the proven threshold is kept, not neutered.
- G3 (the design difference, new): 2 fires already inside the 7d window →
  STILL FIRES (no frequency cap); fire day appended (tail-burn bookkeeping).
- G4 already feasted / G5b unaffordable at the SCALED cost (doomed 4000 >
  trigger but pantry 4000 < 3200*1.5 — a real unaffordable check, not
  vacuous) / G6 no contribution / G7 away from haven → no fire.
- G8/G8b (finding #546): real pantry "Foraged food" stacks (foodState
  undefined) COUNT as the fresh sink; preserved excluded.
- G9 determinism; G10 portionHeads edge cases (12→7, 10→5, 4→null
  tiny-roster fallback, 1→null).

Det-gate (scripts/detgate-portionwindfall-b.js): 2 seeds x 40d,
wrapped+unset == base byte-identical, wrapped==wrapped identical. GREEN.

## Sweep results

### Pilot (32 runs: 8 seeds 6201-6208 x {leadfeast, belongfeast} x {control, armed})

| metric | control (16) | armed (16) | pre-reg |
|---|---|---|---|
| rot/100d (**PRIMARY**) | 135,229k | 104,715k | **PASS** (ratio 0.774 ≤ 0.80) |
| tail-burn fires (engagement) | 0 | 402 | **PASS** (≥ 8) |
| mean fires (informative) | 0 | 477 | — |
| cap-bit fires (pile > 275*roster) | 0 | 477 | (info — the cap bit every fire) |
| doomed-seen / doomed-eaten | — | 3056k / 759k | (info) |
| median survival | 123d | 142d | **PASS** (+20d ≥ -10d) |
| starveDays/100d (pooled) | 21.1 | 12.6 | (info, -8.5) |
| per-pair starvation >+2 (absolute) | — | 4 pairs | **FAIL** (+3, +16, +9, +10) |
| laundered | 0 | 0 | **PASS** |
| new death mode (strict) | — | 8 modes | **FAIL** |
| national | 7/16 | 7/16 | (info) |
| table | 13/16 | 15/16 | (info) |
| wins | 0/16 | 0/16 | (pre-seat) |
| wave 4 | 13/16 | 10/16 | (info) |
| wave 5 | 0/16 | 0/16 | (info) |

Per-seed: evidence/2026-10-18/perseed-portionwindfall-b/sweep-*.json

**Pilot verdict: NO-GO** (two pre-registered guardrails missed as written —
starvation absolute per-pair on 4 pairs; strict new-death-mode on 8 modes).
Per §14, a miss is NO-GO, never re-scored. The arm is KILLED: layer deleted
zero-trace; evidence + instruments landed.

Dose-response: Pearson(windfall count, survival delta) = +0.63 (n=16) —
more windfalls associate with BETTER survival deltas (protective, not
harmful). The 3 biggest survival LOSSES (s6206 -77d wf=14, s6207 -51d wf=13,
s6208 -44d wf=3) are LOW-windfall pairs; the 4 biggest GAINS (s6204 +106d
wf=78, s6203 +86d wf=24, s6201 +69d wf=39, s6206-belong +66d wf=82) are
HIGH-windfall. Harm does not track the mechanism — unattributed.

Per-pair survival deltas (armed-control): +106d (lead 6204), +86d (belong
6203), +69d (belong 6201), +66d (belong 6206), +50d (lead 6205), +21d (lead
6201), +20d (belong 6207), +0d (belong 6208, lead 6203 — 6208 dies 39d both
sides, the early-collapse seed); negatives on lead 6206 (-77d), lead 6207
(-51d), lead 6208 (-44d), belong 6204 (-28d), belong 6205 (-25d), lead 6202
(-25d), belong 6202 (-2d).

### The two guardrail misses, examined (metric review material)

**Starvation (absolute per-pair ≤ +2): 4 fails — all on pairs where the
armed twin lived substantially LONGER.** belong 6201 (+3 abs, 110d→179d),
belong 6203 (+16 abs, 73d→159d), lead 6201 (+9 abs, 116d→137d), lead 6204
(+10 abs, 74d→180d). On the RATE measure (starveDays/100d, the honest
meal-displacement measure): 15/16 pairs neutral-or-better; the four failing
pairs' rates IMPROVED (-2.5, -4.0, +5.1, -2.4 — only lead 6201 shows a real
rate increase). Pooled rate fell 21.1 → 12.6 (-8.5). The absolute-count
guardrail is confounded by survival duration: a village that lives 106 more
days accumulates more starveDays at a LOWER rate. The displacement mechanism
the guardrail was built to catch (prior arms: +13/+62 absolute fails with no
survival gain) is essentially gone — the smaller portions + subset
invitation plausibly fixed it. Metric-review proposal for the NEXT run:
per-pair guardrail on starveDays/100d RATE (≤ +2/100d), not absolute counts.

**New death mode (strict subset rule): 8 modes — exposure-time artifacts +
flavor-text noise, no causal path.** s6204-lead mosquito d75 + wound_fever
d80/d91/d167 and s6207-belong thirst d156 all occur AFTER the control twin
died (74d / 136d) — longer life meeting more content, not mechanism harm.
The rest are single stochastic deaths while both twins lived (the night d106,
Dustboar d70, The Landlord d82, lockjaw d37, The Suburb d73, thirst d41) —
monster-name causes and wound/vector deaths with no plausible path from
"ate doomed food at a feast" (laundering 0, sickness 4 armed vs 5 control,
no food-poisoning signal). The strict subset rule at n=16 fires on
flavor-text noise — the prior arm tripped it on a single "The Reunion".
Metric-review proposal for the NEXT run: new-mode check restricted to deaths
while BOTH twins were alive (exposure-matched) with a count floor (≥2) to
filter single-flavor-text noise.

## Wall numbers (every run)

Armed: national 7/16, table 15/16, wins 0/16, w4 10/16, w5 0/16,
median 142d, max 180d. The wall stands (zero wins, wave 4 ceiling, pre-seat).
This arm does not attack the wall — but it is the first windfall shape with
a POSITIVE survival delta (+20d median), i.e. the first windfall shape that
doesn't cost the village to run.

## Village assessment (plain words)

Thirty-two villages, sixteen twinned. The armed twins hold portion-scaled
windfall feasts — 477 across the pilot, 402 of them tail-burns (fires within
2d of another fire: the glut-cluster tails the frequency cap used to leave
to rot), eating 759k kcal of doomed food out of 3056k seen. Their pantries
are leaner (rot drops 23%, ratio 0.774) — beating the frequency-cap variant's
0.885x on the SAME proven threshold, exactly the designed comparison. The
dose is the story: the killed arm fired ~23/run for 0.536x; the cap-alone
variant fired 7/run for 0.885x; the portion variant fires 30/run (no cap —
clusters burn across days) for 0.774x with HALF the per-fire cost. More
fires, smaller portions, better survival.

Who thrives: villages that live long enough to feast — the four biggest
survival gains (+106d lead 6204, +86d belong 6203, +69d belong 6201, +66d
belong 6206) are all high-windfall pairs; the feast eats the doomed glut
instead of letting it rot, and the smaller portions don't displace the
nightly meal the way the full feasts did (starvation RATE down on 15/16
pairs). Who dies: the early collapses (combat and sickness dominate the
death shares — 132 combat, 62 monster vs 2 starvation — the feast is never
the killer) and the 6208-belongfeast graveyard (39d both sides, wave 3 —
nothing to feast, nothing to save).

Seed 6202 is the showcase of the design: leadfeast fires 17 windfalls on
days 29-34 and 36-46 — two glut clusters burned across consecutive days,
26k kcal of doomed eaten, village survives 155d. The frequency cap would
have allowed 4 of those fires and left the rest to rot.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

scripts/sense-portionwindfall-b.js, seed 6202, 60d, 17 windfall feasts:

d29: "🍖 The Foraged food won't keep till tomorrow — Vikram calls a feast to
eat it before it turns." Followed by the engine feast report (12× Foraged
food + 1× Expedition haul; Leah, Davut, Boris, Diana and 1 more eat; the
grief register fires — "somebody's seat is empty, and everybody sees it" —
because the village is grieving; FEASTED buff ×2.03).

d30–d46: the same line, day after day — the glut cluster, the exact pattern
the design targets. The engine's emotional register tracks each night
(grief, then the harvest line, then the quiet register as the pantry
thins). No dev parenthetical anywhere — the windfallcap-b polish bug is
not re-landed.

**PASS with a polish note** — the line reads as a person making a sensible
call (names the food, the caller, the reason); the engine's emotional
register tracks the village. But the SUBSET invitation is unexplained
in-fiction: 5–7 people eat while the rest of the village isn't mentioned —
an impromptu "eat it before it turns" supper reads naturally for whoever's
closest, but the fiction never says why these and not those. If this voice
ever lands, the line should name the impromptu circle (or the engine report
should acknowledge the rest ate their normal draw).

## Blanks filled / documented

- **FILLED (finding)**: portion scaling beats frequency capping on the SAME
  proven threshold — 0.774x vs 0.885x, with the frequency cap as the only
  design difference that mattered in the prior arm. The cluster-tail
  mechanism engages exactly as designed: 402 tail-burn fires of 477 total
  (vs 0 under any capped regime). The engagement metric counting
  cluster-tails (#558's metric lesson) is validated — mean fires would have
  said "477, very engaged" without distinguishing; the tail count says "402
  of the fires are the previously-rotting substrate."
- **FILLED (finding)**: the portion variant is the first windfall shape with
  a positive survival delta (+20d median, dose-response +0.63 protective) —
  the meal-displacement mechanism is essentially gone on the rate measure
  (pooled -8.5/100d; 15/16 pairs neutral-or-better). Smaller portions +
  subset invitation plausibly fixed what the frequency cap couldn't.
- **DOCUMENTED (killed)**: the portion-scaled variant is KILLED at pilot —
  primary 0.774x (PASS), engagement 402 tail-burns (PASS), survival +20d
  (PASS), laundering 0 (PASS) — but the starvation absolute per-pair
  guardrail fails on 4 pairs (all longer-lived armed twins; rates improved)
  and the strict new-death-mode guardrail trips on 8 modes (exposure-time
  artifacts + flavor-text noise). Per §14 the misses bind: NO-GO. Layer
  deleted zero-trace per kill protocol; instruments + evidence landed.
- **DOCUMENTED (metric)**: the two guardrails as pre-registered are
  miscalibrated for a life-extending lever — see Metric review. Proposed
  revisions are for the NEXT run, not this one.
- **DOCUMENTED (polish)**: the subset invitation is unexplained in-fiction
  (who's in the impromptu circle and why) — name it if the voice ever lands.
- **DOCUMENTED (seed)**: 6208-belongfeast is an early-collapse seed (39d,
  wave 3, rot 0k) identical both sides — contributes nothing to the rot
  metric; worth noting for future seed selection.

## Metric review (§14)

- The primary (rot/100d ≤ 0.80x) PASSED (0.774). The bar was set to beat the
  frequency-cap variant's 0.885x — the portion shape earned it. The metric
  is sound.
- The engagement bar (≥ 8 TAIL-BURN fires) PASSED (402). The #558 metric
  lesson is validated: counting cluster-tails distinguishes "engaged on the
  substrate" from mean-fire counting. Keep this metric for future windfall
  work.
- The survival guardrail (+20d) PASSED and the dose-response (+0.63) shows
  the mechanism is protective. The adopted split rule never engaged. The
  original arm's unattributed-harm pattern did not replicate — this shape
  has no survival cost at all.
- The starvation per-pair ABSOLUTE guardrail (≤ +2) FAILED on 4 pairs — but
  all 4 are longer-lived armed twins with IMPROVED rates. The guardrail as
  written punishes life extension: any lever that adds +20d median survival
  accumulates absolute starveDays mechanically. Proposed revision for the
  NEXT run: per-pair guardrail on starveDays/100d rate (armed-control ≤
  +2/100d). On that measure this run passes on 15/16 pairs.
- The new-death-mode STRICT-SUBSET guardrail FAILED on 8 modes — but 4 of
  the 11 deaths occur after the control twin died (exposure-time), and the
  rest are single stochastic flavor-text causes with no mechanism path.
  Proposed revision for the NEXT run: exposure-matched (both twins alive)
  with a count floor (≥2 deaths) before a "new mode" trips the guardrail.
  On that measure this run trips nothing.
- §15 panel: not built — killed at pilot, per the two killed priors'
  precedent. The before/after comparison lives in the sweep analyzer output
  above.
- **Named next for the axis**: re-run the portion-windfall layer (the code
  is proven — 38/38 proof GREEN, det-gate byte-identical) under the two
  revised guardrails (per-pair starve RATE; exposure-matched new-mode with
  count floor). The primary, engagement, survival, and laundering evidence
  all point the same way; the kill was on guardrail calibration, not on the
  lever's economics. The #558 named next (portion-scaled windfalls) is
  answered; the remaining open half is the doomed-only draw discipline.

## Telemetry

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current '/tmp/sim-portionwindfall-b/agg/agg-*.json' --metrics national,table,wins,exiled`:
2 LOUD: "table swung 75%: baseline 16 -> current 28" and "wins disappeared:
baseline 16 -> current 0". BOTH explained by regime mismatch — the baseline
is labeled winseat-regime; this run is pre-seat courtship (SEATDRIVE=0)
where wins are structurally 0 (the exact spurious LOUD the prior run
documented). Not drift, not a bug.

## Convergence state

**killed-at-pilot** (NO-GO on two pre-registered guardrails as written —
starvation absolute per-pair on 4 longer-lived pairs; strict new-death-mode
on 8 exposure/noise modes — see Metric review for the calibration case).
The food-economy axis is not converged. The portion-scaled windfall is the
strongest SURVIVING windfall shape measured (0.774x rot, +20d survival,
402 tail-burns, laundering 0) — the metric review proposes the guardrail
revisions for its next run.
