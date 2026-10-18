# SIM-WINDFALLCAP — the cap-alone windfall feast (ARM sim-windfallcap-b, loop B, food-economy)

Date: 2026-10-18 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-windfallcap-b
Axis: food-economy (scale-wall lens) — the racks-full binding answer, third variant,
via sim-racksanswer-b's killed confirm and sim-racksanswer-b2's killed pilot
(finding #546's NAMED NEXT: cap-alone variant — 300*roster + 2/week cap).

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14-15 — binding, written BEFORE sims)

- **Question**: sim-racksanswer-b proved the windfall feast is a POWERFUL rot
  lever (0.536x pilot / 0.662x confirm on the 300*roster doomed threshold)
  but was KILLED at confirm on the survival guardrail (median -19d, harm
  unattributed). sim-racksanswer-b2 tried a survival-safe shape (500*roster +
  2/week cap) and was KILLED at pilot (0.987x — the raised threshold targets
  gluts a feast can't clear; meal displacement, not rot prevention). Can the
  PROVEN threshold be kept while the frequency cap (2/week) bounds only the
  glut-cluster compounding?
- **Lever**: scripts/policies/windfallcapb.js (WINDFALLCAP_B=1, default OFF;
  wraps leadfeast/belongfeast). When the pantry holds doomed fresh
  (bonus-inclusive (spoilDay+bonus)==day+1 — rots tomorrow, must be eaten
  tonight) beyond **300*roster** kcal (the proven threshold), the scholar
  holds a feast NOW, bypassing the 7/14d cadence. **Frequency cap: max 2
  windfall feasts in any 7-day window** (the only change vs the killed arm).
  Every other feast gate kept (dusk, haven, one/day, affordability
  have>=cost*1.5, contribution >=1500/7d — the r13 rule via recentGives +
  recentTribute). Draws urgency-first via the engine's own
  hostFeast/pantryDraw (fresh-first; spoiled skipped — no laundering).
  Cadence clock resets on a windfall. One honest voice line names the why.
  Doomed-fresh uses the rot-accounting split (preserved/rendered excluded),
  NEVER a foodState==='fresh' filter (finding #546 — the 0-fire pilot that
  caught the filter bug; pinned by proof G8/G8b).
- **SUBSTRATE**: FEASTSCALE_R13=1 both sides; SEATDRIVE=0 EXPLICIT (pre-seat);
  base courtship policies only. 180d death-aware; dead villages stop.
  Assert env up front; SWEEP STOPS on mismatch.
- **SEEDS**: pilot 8 FRESH seeds 5601-5608 x {leadfeast, belongfeast} x
  {control, armed} = 32 runs, IDENTICAL seeds both sides, own in-sweep
  control. Banned/used before this run: 4201–4208, 4301–4308, 4401–4408,
  4501–4508, 4601–4608, 17011–17018, 4801–4808, 4811–4822, 4901–4908,
  7001–7008, 7601–7608, 9292–9295, 99101–99108, 9921–9928, 105101–105104.
- **PRIMARY** (binding): (rot:preserved + rot:fresh) ABSOLUTE per 100 days
  alive — armed <= 0.75x control.
- **ENGAGEMENT** (kill-fast): windfall feasts >= 8 across the armed side.
  If the mechanism never engages, KILL at pilot.
- **Guardrails**: median survival >= control-10d OR (harm unattributed
  |r|<0.3 AND primary <= 0.70x) — the killed arm's adopted metric review;
  starvation deaths armed <= control+2 per-pair (collapse-aware, both >30d);
  no new death mode; laundering 0 measured AT CONVERT TIME.
- **Det-gate**: wrapped+WINDFALLCAP_B-unset byte-identical to base over 40d
  (2 seeds); SMOKE+proof GREEN before any sims.
- **Balanced panel**: scripts/balance-panel.js before/after per §15 (if the
  arm survives the pilot — the two killed priors could not complete it).

## Proof results (scripts/test-windfallcap-b.js — run BEFORE any sims)

PROOF GREEN (31 checks):
- RED gate-off: no fire, no voice, no telemetry, no fire-day bookkeeping
  (delegation byte-identical; det-gate confirms over 40d trajectories).
- GREEN: doomed 9000 > 300*12=3600 threshold → fires once; feastDay set;
  voice said once; telemetry (kcal via hostFeast rep.spent, doomed, fire-day);
  cadence reset; doomed pile drawn down (9000 → 4200).
- G2 pins the floor: doomed 2000 < 3600 → NO fire.
- G2b pins the key behavioral difference from the killed b2 arm: a doomed
  pile of 5000 (between old 300*roster=3600 and b2's 500*roster=6000) FIRES
  — the cap-alone variant keeps the proven threshold.
- G3/G3b: frequency cap — 2 fires in 7d window blocks; aged-out window fires
  (window trimmed, new day recorded).
- G4 already feasted / G5 unaffordable (vacuous on this roster) / G6 no
  contribution / G7 away from haven → no fire.
- G8/G8b (finding #546, pinned from the first proof — no 0-fire pilot this
  time): real pantry "Foraged food" stacks (foodState undefined) COUNT as
  the fresh sink; preserved excluded.
- G9 determinism.

Det-gate (scripts/detgate-windfallcap-b.js): 2 seeds x 40d, wrapped+unset ==
base byte-identical, wrapped==wrapped identical. GREEN.

## Sweep results

### Pilot (32 runs: 8 seeds 5601-5608 x {leadfeast, belongfeast} x {control, armed})

| metric | control (16) | armed (16) | pre-reg |
|---|---|---|---|
| rot/100d (**PRIMARY**) | 106,436k | 94,183k | **FAIL** (ratio 0.885 > 0.75) |
| windfall feasts (engagement) | 0 | 112 | **PASS** (≥ 8) |
| windfall kcal saved | — | 245k | (info) |
| windfall doomed-seen | — | 628k | (info) |
| median survival | 102d | 101d | **PASS** (-1d ≥ -10d) |
| starveDays/100d (pooled) | 16.7 | 14.6 | (info, -2.1) |
| per-pair starvation >+2 | — | 5 pairs | **FAIL** (+5, +6, +13, +3, +6) |
| laundered | 0 | 0 | **PASS** |
| new death mode | — | "The Reunion" x1 | **FAIL** (strict) |
| national | 8/16 | 9/16 | (info) |
| table | 13/16 | 11/16 | (info) |
| wins | 0/16 | 0/16 | (pre-seat) |
| wave 4 | 9/16 | 6/16 | (info) |
| wave 5 | 0/16 | 0/16 | (info) |

Per-seed: evidence/2026-10-18/perseed-windfallcap-b/sweep-*.json

**Pilot verdict: NO-GO** (primary 0.885x vs 0.75x bar). No confirm spend.
Per §14, a miss is NO-GO, never re-scored. The arm is KILLED: layer deleted
zero-trace; evidence + instruments landed.

Dose-response: Pearson(windfall count, survival delta) = +0.46 (n=16) —
more windfalls associate with BETTER survival deltas (protective, not
harmful). No attribution anywhere.

Per-pair survival deltas (armed-control): big positives on belong 5606
(+90d), lead 5607 (+56d), lead 5603 (+41d); negatives on lead 5602 (-30d),
belong 5608 (-29d); 5 pairs tied (5601/5603/5605/5608 died identically both
sides — wf=0 there). Seed 5601 collapses at 32d both sides (wave 1, rot 0k)
— an early-collapse seed where the mechanism never engages.

## Wall numbers (every run)

Armed: national 9/16, table 11/16, wins 0/16, w4 6/16, w5 0/16,
median 101d, max 180d. The wall stands (zero wins, wave 4 ceiling, pre-seat).
This arm does not attack the wall.

## Village assessment (plain words)

Thirty-two villages, sixteen twinned. The armed twins hold windfall feasts —
112 across the pilot, eating 245k kcal of doomed food (628k seen). Their
pantries are a little leaner (rot drops 11.5%, ratio 0.885) but nowhere near
the killed arm's third. The rot reduction lives in the mechanism's DOSE: the
killed arm fired ~23 windfalls/run at pilot with 0.536x; the cap-alone
variant fires 7/run with 0.885x. The cap is the ONLY code difference —
**the frequency cap IS the culprit**, contradicting b2's conclusion that it
wasn't. Glut clusters are the lever's whole substrate: doomed piles arrive
in clusters, and 2/week truncation leaves the tail of every cluster to rot.
B2 read the prior arm's 0.8/week average; averages hide clusters.

The mechanism is protective where it fires (dose-response +0.46 — more
windfalls, better survival deltas), but it meal-displaces like the b2
variant: starvation ticks up on exactly 5 pairs again (worst +13 here,
+62 on b2). The feast fills the village for a day and the nightly draws
slip behind — same failure shape, smaller magnitude.

Seed 5601 is a graveyard: all four runs collapse at 32d, wave 1, rot 0k —
the village dies before any lever can engage. Seeds 5606/5607 are the
showcases: belong 5606 survives the full 180d armed (died 90d control),
lead 5607 survives 180d armed (died 124d control). Who thrives: villages
that live long enough to feast. Who dies: the early collapses (combat and
sickness dominate the death shares — 130 combat, 34 sickness vs 39
starvation — the feast is never the killer; it just can't save the doomed).

## Sense-testing (SENSE-TESTING LAW — read, not counted)

scripts/sense-windfallcap-b.js, seed 5607, 60d, 2 windfall feasts:

d28: "🍖 The Foraged food won't keep till tomorrow — Irving calls a feast to
eat it before it turns." Followed by the engine feast report (10× Foraged
food (dried) served, the laughter line, FEASTED buff ×2.03).

d30: same line, two days later — the glut cluster, the exact pattern the cap
is supposed to bound (2 fires in 7d allowed; a 3rd would be blocked).

**PASS with a polish note** — the line reads as a person making a sensible
call (names the food, the caller, the reason); the engine's emotional
register tracks the village. But the parenthetical "(windfallcapb: windfall
feast — doomed fresh beyond 300/roster, 7d frequency cap)" leaks the lever
name into the player-facing voice — a dev artifact that must be stripped
before this voice line ever lands. The sense is fine; the economics aren't.

## Blanks filled / documented

- **FILLED (finding)**: the frequency cap truncates the windfall lever
  (fires 7/run vs ~23/run on the identical threshold; 0.885x vs 0.536x).
  The cap is the ONLY code difference from the killed arm, so the cap IS
  the culprit — contradicting b2's "the cap is not the culprit" (which read
  the 0.8/week average; averages hide the clusters). Glut clusters are the
  lever's substrate: truncating them truncates the rot reduction.
- **FILLED (finding)**: the cap-alone variant still meal-displaces — 5
  per-pair starvation fails (worst +13), the same failure shape as b2 (5
  pairs, worst +62). The windfall feast reliably displaces nightly draws
  wherever it fires.
- **DOCUMENTED (killed)**: the cap-alone variant is KILLED at pilot —
  primary 0.885x (bar 0.75x), survival guardrail passes (-1d, protective
  dose-response +0.46), starvation guardrail fails on 5 pairs, 1 "The
  Reunion" death trips the strict new-death-mode guardrail. Layer deleted
  zero-trace per kill protocol.
- **DOCUMENTED (polish)**: the windfall voice line's parenthetical leaks
  the lever name into player-facing text — strip before any landing of this
  voice.
- **DOCUMENTED (seed)**: 5601 is an early-collapse seed (32d, wave 1, rot
  0k) identical both sides — the mechanism can't engage; worth noting for
  future seed selection (a seed where both sides die at 32d contributes
  nothing to the rot metric).

## Metric review (§14)

- The primary (rot/100d ≤ 0.75x) FAILED (0.885). The metric is sound; the
  lever as shaped does not move it enough. The engagement bar (112 ≥ 8)
  proves this is ineffectiveness, not invisibility — the engagement-gate
  design is validated again: it distinguishes "engaged but weak" from "0-fire".
- The survival guardrail (-10d) PASSED (-1d) and the dose-response (+0.46)
  shows the mechanism is protective. The adopted split rule never engaged.
  The killed arm's unattributed-harm pattern did not replicate as harm —
  this arm has no survival cost at all.
- The starvation per-pair guardrail (≤ +2) FAILED on 5 pairs. Across b2 and
  this variant (10 pairs total, same failure shape), the windfall feast's
  meal-displacement is now a documented property of the mechanism, not a
  seed artifact.
- The new-death-mode guardrail tripped on a single "The Reunion" kill —
  noise-level (n=1), strict by design, noted not investigated.
- §15 panel: not built — killed at pilot, per the two killed priors'
  precedent. The before/after comparison lives in the sweep analyzer output
  above.
- Metric-review note for the NEXT run on this axis: the 300*roster windfall
  feast is a proven 34% rot lever that meal-displaces (+starvation) and
  needed a safety shape; the safety shape that preserves it is still open —
  the frequency cap was the wrong shape (it truncated the substrate). A
  candidate for the findings backlog: portion-scaled windfall feasts (fire
  on the proven threshold but cap COST/head instead of frequency), or a
  draw-discipline that eats doomed without displacing the nightly meal.

## Telemetry

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current '/tmp/sim-windfallcap-b/agg/agg-*.json' --metrics national,table,wins,exiled`:
1 LOUD: "wins disappeared: baseline 16 -> current 0". EXPLAINED by regime
mismatch — the baseline is labeled winseat-regime; this run is pre-seat
courtship (SEATDRIVE=0) where wins are structurally 0. This is the exact
spurious LOUD the task brief predicted. Not drift, not a bug.

## Convergence state

**killed-at-pilot** (NO-GO on the primary — 0.885x vs the 0.75x bar; the
frequency cap truncates the proven lever's substrate, and meal-displacement
replicates across both variants). The food-economy axis is not converged.
The 300*roster windfall feast remains the strongest measured rot lever
(0.662x) — the safety shape that preserves it is still open; the findings
backlog should carry: portion-scaled windfalls (cap cost/head, not
frequency) or a doomed-only draw discipline.
