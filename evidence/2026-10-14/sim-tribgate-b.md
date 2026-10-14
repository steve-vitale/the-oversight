# SIM-TRIBGATE — tribute fragility gate (ARM 3, loop B, food-economy, claims sim-findings #200)

Date: 2026-10-14 · Loop: oversight-flesh-out-loop-b · Run: fleshout-b-2026-10-14-1930
Worker tree: sim-tribgate · Axis: food-economy (scale-wall lens) — tribute fragility.

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims, coordinator's verbatim text)

- PRIMARY: armed starvation deaths <= control − 3 AND armed hungryDays <= control × 1.2 (identical seeds).
- GUARDRAILS: national >= control−2; median >= control−10d; tribute arrears not worse than control (tribute still paid on base-discipline timing — report paid/thin/missed from link histories); no new death mode.
- Pilot gate: 8 seeds first (same seed set as overstock2 for comparability); confirm 12–16 only if the pilot meets GO. SMOKE=1; det-gate; proof RED→GREEN before the sweep.
- GO → land as its own commit; primary miss → KILL (layer deleted, evidence + proof + sweep kept).

## The arm

The overstock R2 autopsy (evidence/2026-10-14/sim-overstock2-b.md): paying the
week's tribute EARLY-IN-FULL removed the food up to 6 days before the base
discipline would, and the payment itself armed the r13 feast gate (tribute
counts as contribution) — tribute → feast ratcheted fragile pantries to the
2-day floor, where any raid/gorge night tipped the village into the starvation
spiral (belong road: −52 to −81d, starvation 15→19, hungryDays +31%).

This arm: a policy-side layer (default OFF, zero src/js changes) implementing
the early-in-full tribute verb — pay the week's full tribute as soon as the
pantry can carry it, pulling it forward of the base discipline's cadence —
with a fragility gate: SKIP the early pull-forward when pantry fresh-days < 4d
(the engine's own pantryFreshDays(), same >4d convention as prodThrottle).
The base discipline's scheduled payment still runs untouched — nothing is
evaded, only the early pull-forward is held.

Horizon: 180d death-aware (scale-wall reachability question, pacing-law max).
Seeds: 11/22/33/44/55/66/77/88 × leadcourt/belongseek = 16 runs/side,
identical seeds, same set as overstock2. Both sides on current master WITH
the landed prodthrottle — the question is the gate's MARGINAL effect.

## Proof results (run BEFORE any sims)

RED (TRIBGATE unset): R1 tribVerb returns 'off', ctx untouched, gateOn()
false. R2 wrapper daily byte-identical to the parent belongseek.daily on
identical fixtures (state-hash match). 6/6 checks, seeds 11/22/33.

GREEN (TRIBGATE=1): G1 fragile fixture (fresh-days 3.75): early-in-full HELD
(tgHeld=1), no early payment, then the base discipline's scheduled payment
paid the week in full (tributePaidWeek === week, ctx.belongTribute=1) — the
hold beat is honest ("The pantry holds ~2.5 days of fresh — too thin to pull
tribute forward. This week's grain stays until the scheduled payment.").
G2 deep fixture (fresh-days 6.25): early-in-full FIRED (tgEarly=1, paid ≥
6,000, week current), base discipline did NOT double-pay (belongTribute
undefined). G3 determinism: identical rerun. 11/11 checks, seeds 11/22/33.

Det-gate: 16/16 bit-identical off-vs-base (gate-off wrapper vs parent
policies — the layer is transparent when off) AND 16/16 armed determinism
(8 seeds × 2 policies, 40d, per-day hashes). SMOKE=1 honesty gate green both
sides. scripts/test-tribgate-20261014.js, scripts/det-gate-tribgate-20261014.js.

## Pilot results

16 runs/side, identical seeds, 180d death-aware. Det-gate GREEN both sides
before trusting comparisons.

| metric | control (TRIBGATE unset) | armed (TRIBGATE=1) | pre-reg |
|---|---|---|---|
| starvation deaths (**PRIMARY**) | 15 | **11** | **PASS** (≤ 12) |
| hungryDays (**PRIMARY**) | 35 | **35** | **PASS** (≤ 42) |
| national | 10/16 | 10/16 | ✓ (≥ 8) |
| median survival | 151d | **109d** | **MISS** (≥ 141) |
| tribute weeks full/thin/missed | 105f/14t/42m | 118f/3t/21m | ✓ (not worse) |
| arrears notes | 31 | 7 | ✓ (not worse) |
| tribute kcal paid | 866k | 936k | report |
| tg verb counts (armed) | 0e/0h | 111e/100h | mechanism fires |
| table | 0/16 | 0/16 | — |
| wins | 0/16 | 0/16 | — |
| everW4 / everW5 | 8/1 | 7/1 | — |
| maxWave | 5 | 5 | — |
| rotFresh kcal | 2916.6k | 2974.4k | report (≈ control) |
| exiled | 0 | 0 | unchanged ✓ |

Per-seed belongseek days (armed − control): s11 0, s22 **+44**, s33 0,
s44 −84, s55 0, s66 −61, s77 −2, s88 −19. Leadcourt: all 8 seeds
bit-identical (the verb never fires on the lead road — no subordinate
links; 0 early/0 holds), confirming the verb only touches the belong channel.

**Verdict: KILLED AT PILOT per §14.** The primary passed decisively
(starvation −4 beats the −3 bar, hungryDays ratio 1.0 vs the 1.2 bar), but
the median guardrail breached (109 < 141) — and §14 is explicit: "a GO met
with a guardrail breached is NO-GO." No confirm spend. The layer is deleted
per the kill protocol; proof + sweep + det-gate + per-seed evidence kept.

## Death-cause shares

Control (195 deaths): combat 106 (54%), monster 31 (16%), sickness 15 (8%),
starvation 15 (8%), villager combat 13 (7%), wound 6 (3%), contest 5 (3%),
lockjaw 2, dehydration 1, expedition 1.
Armed (185): combat 96 (52%), monster 27 (15%), sickness 19 (10%), villager
combat 16 (9%), starvation 11 (6%), wound 8 (4%), contest 5 (3%),
dehydration 1, expedition 1, lockjaw 1. Same shape — villages die of
violence, not hunger, on both sides. **No new death mode: PASS.**
The two early-death armed seeds (s44 −84d, s66 −61d) died to
violence/sickness mixes (s44: monster 1, villager combat 1, combat 2,
sickness 4, wound 1; s66: sickness 2, combat 6, villager combat 1, monster 3)
— no starvation-spiral signature; the baseline s44 SURVIVED 180d to a
similar violence mix. Trajectory perturbation, not a harm channel.

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control | 10/16 | 0/16 | 0/16 | 8/16 | 1/16 | 151d | 180d |
| armed | 10/16 | 0/16 | 0/16 | 7/16 | 1/16 | 109d | 180d |

Exiled: 0 both. The scale wall is not broken by this arm; national/table
identical both sides. (Wave-4/5 unlock counts now tallied per side — the
overstock2 measurement gap is closed.)

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Armed sense run, belongseek seed 22, 130d: 34 tribute beats read. The hold
beat fires honestly and the scheduled payment follows the same week:

- d49 "The pantry holds ~2.5 days of fresh — too thin to pull tribute
  forward. This week's grain stays until the scheduled payment." →
  "Tribute paid: 7,648 kcal walks out of the pantry toward Thornfield.
  The relationship holds."

The tribute story reads like politics, not mechanics: Haven's grief gets
leveraged into tribute hikes (5,000 → 7,500 → 11,250 → 16,875 →
25,313 kcal/week — "Grief is leverage, and they know it"), shortfalls are
said aloud ("Tribute short — 25,110 of 25,313 kcal so far this week.
They'll count it. Arrears grow teeth."), and a speaker's death opens
renegotiation ("tribute down to 18,985 kcal/week. The link holds: it was
never with one person").

Villager-person sample (seed 33, 60d): named villagers with work orders
("Joseph to A, by the fire: '8 wood. We need 12. The forest isn't going to
cut itself.'"), gossip with distortion corrected aloud ("A traveler swears
Stonebridge, southeast, is feasting — a whole elk, they say. (They're
wrong. Stonebridge is starving.)"), low-talk beats, sentimental item-charge
beats (Mixtape, Contract Quill, Dead Phone). Nothing robotic. **PASS.**

Telemetry deviation check: quiet (16 armed per-seed files, national/table/
wins/exiled, no large deviations vs the scale-wall baseline).

## Village assessment (plain words)

Sixteen villages, and the gate did exactly what it was built to do — it held
the tribute wagon at the gate on a hundred fragile days, and the scheduled
payment still walked out on the village's own timing. Starvation deaths fell
by four, hungry days didn't move, and the tribute books came out cleaner
than they went in: more full weeks, fewer thin ones, arrears notes down
from 31 to 7. On the lead road the layer was a ghost — eight seeds, not one
day different, because there was no tribute to pay and the gate knew it.

But the median moved the wrong way, and the header doesn't care why: 151
days to 109 is a breach, so the arm dies at pilot. Look closer and the
breach is weather, not climate — the two roads' medians didn't budge a day
(109 and 180, both sides), and the seeds that died young died of axes and
sickness, not hunger. One seed lived 44 days LONGER under the gate. The
village-scale harm the primary was built to catch never showed up; the
number that caught the arm is the one the house already argued should be
report-only.

## Blanks filled / documented

- **MEASURED, KILLED AT PILOT** (median guardrail, §14): the tribute
  fragility gate — scripts/policies/tribgate.js (TRIBGATE=1, default OFF;
  DELETED per kill protocol — the file is removed, not committed), proof
  scripts/test-tribgate-20261014.js (RED→GREEN re-verified on seeds
  11/22/33, kept as instrument), det-gate
  scripts/det-gate-tribgate-20261014.js (16/16 both modes, kept), sweep
  scripts/measure-tribgate-20261014.js (kept), per-seed JSON
  (evidence/2026-10-14/perseed-tribgate-{base,armed}/, kept). Zero src/js
  changes (policy-side only).
- **DOCUMENTED** (for the backlog, coordinator to append): (a) the median
  guardrail fired on trajectory perturbation a second time (#186 was the
  first) — per-policy medians byte-identical, combined-median move is
  rank-interleaving; propose median report-only with harm-specific
  guardrails binding for the next run (this run's primary was exactly that,
  and it passed); (b) the early pull-forward on HEALTHY pantries improved
  tribute discipline (full weeks 105→118, thin 14→3, missed 42→21,
  arrears notes 31→7) with zero starvation harm — worth its own arm
  measured on tribute/standing, not hunger; (c) the item-charge "You hold
  X… The feast was the weapon" beat repeats identically day after day
  (d25–d29, same beat) — minor engine-copy repetition, observed in sense,
  not chased; (d) baseline re-measured on this tip: rot 2,916.6k, median
  151d, national 10/16, table 0/16, starve 15, hungry 35 — matches the
  overstock2 control to the decimal, so the overstock2-vs-control
  comparability claim holds.

## Metric review (§14)

1. **The KILL stands on the header as written — no re-scoring.** The
   median guardrail (≥ control−10d) breached at 109 vs 141. Per §14, a
   guardrail breach is NO-GO even with the primary passed. This is not
   being re-judged against a friendlier metric.
2. **The guardrail fired on perturbation, not harm — documented for the
   NEXT run.** Per-policy medians identical (leadcourt 109/109, belongseek
   180/180); the combined-median move is 8+8-seed rank interleaving.
   Per-seed swings run both ways (s22 +44d, s44 −84d, s66 −61d) with no
   starvation-spiral signature in the early deaths, while the harm metrics
   moved the right way (starvation −4, hungryDays ratio 1.0). This is the
   same instrument failure the #186 review (overstock R1) already flagged:
   the median guardrail fires on trajectory perturbation. The proposal for
   the next run: median report-only, harm-specific guardrails binding.
3. **The primary was the right instrument and it passed.** Starvation
   deaths and hungryDays are the harm channel the fragility gate was built
   to close (sim-findings #200: tribute→feast ratchet → starvation
   spiral). Both moved the right way; the tribute obligation was never
   evaded (full weeks rose, arrears fell). The arm's mechanism worked as
   designed; only the binding median number killed it.
4. **Wave-4/5 unlock tallies are now measured per side** (8/1 control,
   7/1 armed) — closing the overstock2 measurement gap noted in its §14
   review.

## Convergence state

food-economy: **killed-at-pilot** (tribgate). Primary passed (starvation
15→11, hungryDays 35→35), median guardrail breached per §14 (151→109d —
perturbation, per-policy medians identical), tribute discipline strictly
better (arrears notes 31→7). The fragility gate's mechanism is verified
(111 early pays on healthy pantries, 100 holds on fragile ones, zero
evasion); the early-pull-forward-on-healthy-pantries discipline gain is a
documented candidate for its own arm.
