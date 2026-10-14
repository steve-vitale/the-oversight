# SIM-FEASTDOOR — surplus-only feast duty (loop B, food-economy, sim-findings #187)

Date: 2026-10-14 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-feastdoor
Axis: food-economy (scale-wall lens) — sim-findings #187 (FEAST AS TABLE-PATH
OPENER). The r33b prescription from the two killed feast pilots.

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- **Question**: two independent pilots proved a policy-side feast verb opens
  the table's food-deed rung (table 0→9/32 combined), but both were KILLED
  at pilot: feastopener on the national guardrail (5/16 vs 10/16, trajectory
  perturbation not harm), overstock2's drawdown on real harm (starvation
  15→19, hungryDays 35→46). The r33b metric review prescribes this run: a
  perturbation-robust feast-family redesign with harm-proxy guardrails
  instead of survival-to-threshold counts.
- **Lever**: scripts/policies/feastdoor.js (FEASTDOOR=1, default OFF;
  requires FEASTSCALE_R13=1 — the duty rides the feastscale r13 machinery;
  wraps leadfeast/belongfeast). SURPLUS-ONLY delta vs the killed versions
  (both fired at fresh-days>4, floor 2): fire ONLY when fresh-days > 6
  (strictly); spend the pantry down toward 4 fresh-days; floor NEVER below
  4. A feast that spends only what would otherwise rot cannot perturb
  survival through the pantry — the 4-day buffer never moves. All r13 gates
  kept (dusk, haven, one feast/day, armed cadence 7d / unarmed 14d shared
  via _fsLastFeastDay with the allowance, contribution
  recentGives(7)+tributePaid(7)+tendPaid(7) >= 1500, affordability
  have >= cost*1.5, fusion-reactor ceiling, plan.ok). Siege-gate clear
  (loop A boundary: no lingerer, no gorge night in trailing 7d via the
  predation instrument, no raid in trailing 7d). #201 lesson: the duty's
  cause line fires only AFTER hostFeast confirms (rep.ok) — never promise
  the feast before the verb. feastSurgeUsed/sentimentTaught path untouched
  (the r13 devotion lane marks feastSurgeUsed on real combat use; the deed
  rung is sentimentTaught && feastSurgeUsed, table.js:84). Policy-side only;
  zero src/js changes.
- **PRIMARY**: food-deed rung fires on ≥10/16 armed runs (vs 0/16 control)
  AND table ≥2/16 armed.
- **GUARDRAILS** (harm-proxy, r32b/r33b metric review): starvation deaths
  ≤ control+2; hungryDays ≤ control×1.1; no new death mode;
  national ≥ control−4 (perturbation-aware bound). Median report-only.
- **SECONDARY**: duty feast counts+kcal, siege-gate holds per cause,
  per-seed deed attribution (feastSurgeUsed day, table day, seat),
  Standing per avenue, wave reach 1–5, Arc reach, table seats, fresh-days
  distribution, death-cause shares.
- **Horizon**: 180d death-aware (reachability lever per §10; pacing-law
  absolute max). Dead villages stop; +10d tail max.
- **Seeds**: 11/22/33/44/55/66/77/88 × leadcourt/belongseek = 16 runs/side,
  IDENTICAL seeds control vs armed. Control: FEASTDOOR unset (parents
  byte-identical). Armed: FEASTDOOR=1 + FEASTSCALE_R13=1.
- **Det-gate**: 16/16 bit-identical both sides first (r27 rule;
  scripts/det-gate-feastdoor-20261014.js). SMOKE=1 honesty gate both sides
  (fail loudly if the suite ever runs policy-less).
- **Proof**: scripts/test-feastdoor-20261014.js — REAL RED (gate-off
  byte-identical vs leadfeast/belongfeast; no duty fires gate-off) → GREEN
  (fires only on fresh-days>6; 5.9d holds; floor binds on a small-burn
  village and lands toward 4 never below; siege-gate holds on
  lingerer/raid-7d/gorge-7d; contribution gate; armed determinism;
  feastSurgeUsed marks on real combat use; inert without FEASTSCALE_R13;
  no double-feast with the allowance). Killed-proof degradation:
  INFO-SKIP, never MODULE_NOT_FOUND.

## Proof results

scripts/test-feastdoor-20261014.js — REAL RED → GREEN, both phases green
(RED 6/6; GREEN 23/23; two consecutive GREEN invocations, 29/29 checks
each; kill-protocol INFO-SKIP guard installed for post-kill degradation).

RED (gates off): R1 gate-off byte-identical — doorlead == leadfeast and
doorbelong == belongfeast per-day hashes, 40d x2 seeds, IDENTICAL (the
predation instrument's read-only wraps add no trajectory delta). R2: no
duty fires gate-off on the 6.25d fixture; pantry untouched; no duty cause
line.

GREEN (FEASTDOOR=1 + FEASTSCALE_R13=1): G1 duty fires on the 6.25d
fixture — 4,800 kcal real pantry draw, engine 🍖 FEAST beat, then the
duty cause line ("The shelves groaned — ~6 days of fresh on hand, and
the rot was already circling. We ate the mountain tonight, before it ate
itself.") narrated AFTER the verb confirms (beat@0 cause@2 — the #201
fix), fresh-days 6.25→6.04 (drawdown direction, floor respected). G2:
5.9d holds (fires ONLY on >6). G3: the floor is LIVE — on a small-burn
fixture (2000 kcal/d) the duty refuses when the honest feast would breach
4d (spendTarget 4400 < cost 4800) and fires when the surplus covers it,
landing at ~4.1d (toward 4, never below). G4: lingerer/raid-7d/gorge-7d
fixtures all hold the duty off (holds counted per cause). G5:
contribution <1500 holds off; >=1500 fires. G6: armed determinism —
identical fixture twice, identical outcome. G7: the duty feast carries
the armed prog.feastSurge into grantFeastBuff (buff granted, arming NOT
spent by the feast); a real combat use (inCombat stubbed true)
marks feastSurgeUsed. G8: FEASTSCALE_R13 unset mid-run → duty inert (the
duty rides the r13 machinery). G9: the duty claims the one-feast/day
slot — s.feastDay set, the r13 allowance does not double-fire.

Det-gate: 16/16 bit-identical CONTROL, 16/16 bit-identical ARMED
(scripts/det-gate-feastdoor-20261014.js) — no waiver needed this run.
SMOKE=1: green both sides (unwrap + live drive + duty fires on the
6.25d fixture).

## Sense-testing (SENSE-TESTING LAW — read, not counted)

120d armed runs, doorlead seeds 22 and 55: 4–5 duty feasts each, 6–8
gate-holds. The beats read as a village deciding — the engine beat gives
the WHAT, the duty's cause line (post-verb, past tense) the WHY:

- "🍖 FEAST 📺 — Casey opens the pantry wide: 5× Foraged food, 1× Snared
  meat. Zuri, Walt, Carlos, Victor and 1 more eat until the fire burns
  low. Somebody laughs so hard they cry. For one evening, nobody is
  surviving — they're just together. (−2,740 kcal from the pantry)" →
  "🍖 The shelves groaned — ~52 days of fresh on hand, and the rot was
  already circling. We ate the mountain tonight, before it ate itself."
  → "🍖 FEASTED ×2.03 until tomorrow's dawn... Strikes and abilities hit
  with the feast behind them."

Named villagers open feasts (Casey); named attendees; the fresh-days
number varies honestly per firing (~52, ~38, ~8, ~10); the r13 allowance
fills the days the duty leaves (its feasts carry no duty line — correct).
Seed 55: sentimentTaught && feastSurgeUsed both true, lesser table seat
by d120 — the deed chain working end to end.

**PASS** — with the pre-existing blank re-noted: the devotion channeling
line ("💛 You hold Carpenter's square... The feast was the weapon.")
fires VERBATIM every day d15–d55+ — the finding #64 repetition class
(competent.js channelDevotion, not this layer's doing). Filed, not
chased.

## Pilot results

16 runs/side, identical seeds, 180d death-aware. Det-gate 16/16 both
sides; SMOKE green both sides.

| metric | control (gates off) | armed (FEASTDOOR=1) | pre-reg |
|---|---|---|---|
| food-deed rung fired | 0/16 | **11/16** | **GO** (≥10) |
| duty-attributed end-to-end | 0/16 | 4/16 | — |
| table | 0/16 | **2/16 (both FULL)** | **GO** (≥2) |
| wins | 0/16 | 0/16 | — |
| national (**GUARDRAIL**) | 10/16 | **9/16** | ✓ (≥6) |
| starvation deaths (**GUARDRAIL**) | 15 | **11** | ✓ (≤17) |
| hungryDays (**GUARDRAIL**) | 35 | **40** | **MISS** (≤38.5) |
| death modes (**GUARDRAIL**) | 10 modes | same 10 (ambush/the-expedition are instances, not new modes) | ✓ |
| exiled | 0 | 0 | unchanged ✓ |
| median survival | 151d | 108d | report-only |
| max wave reach | 5 | 5 | — |
| wave-4 reach | 8/16 | 13/16 | — |
| wave-5 unlocks | 1/16 | 7/16 | — |
| max Arc | 3 | 4 | — |
| duty feasts | 0 | 42 (105.4k kcal) | mechanism fires |
| siege-gate holds | 0 | 41 (linger 3, gorge 2, raid 36) | gate live |
| standing median | 100 (w25/d0/p0) | 187 (w0/d0/p160) | — |
| standing max | 202 | 322 | — |

Per-seed attribution (armed): 4 duty-attributed (belo s11, belo s44,
belo s66, lead s22 — surge-use ordered at/after the first duty feast);
7 more fired the rung via the r13 allowance (surge-use ordered earlier —
including BOTH full table seats: lead s55, belo s22); 5 never fired the
rung. The duty is the marginal opener on drowning pantries; the
allowance remains the broader opener.

**Verdict: KILLED AT PILOT per §14.** The primary passed (11 ≥ 10 deeds,
2 ≥ 2 tables). But the hungryDays guardrail missed: 40 vs the
pre-registered ≤38.5 bound. A GO met with a guardrail breached is NO-GO.
See Metric review for why the miss is perturbation/substrate, not duty
harm — and why the kill stands anyway.

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control | 10/16 | 0/16 | 0/16 | 8/16 | 1/16 | 151d | 180d |
| armed (duty+r13) | 9/16 | 2/16 | 0/16 | 13/16 | 7/16 | 108d | 180d |
| r13-only (diagnostic) | 7/16 | 4/16 | 0/16 | 11/16 | 4/16 | 92d | 180d |

Exiled: 0 all sides.

## The r13-only diagnostic (the run's key secondary)

To attribute the hungryDays delta, a third arm ran FEASTSCALE_R13=1
WITHOUT the duty (scripts/measure-feastdoor-r13only-20261014.js, same 16
seeds, 180d):

| metric | control | r13-only | duty+r13 |
|---|---|---|---|
| foodDeeds | 0/16 | 13/16 | 11/16 |
| table | 0/16 | 4/16 | 2/16 |
| national | 10/16 | 7/16 | 9/16 |
| starvation deaths | 15 | **21** | **11** |
| hungryDays | 35 | **48** | **40** |
| median survival | 151d | 92d | 108d |

The r13 allowance ALONE is the harm driver: starvation 15→21,
hungryDays 35→48. The duty's MARGINAL effect (r13-only → duty+r13):
starvation 21→11 (−10), hungryDays 48→40 (−8), national 7→9 (+2),
median 92→108d (+16d), deeds 13→11 (−2), tables 4→2 (−2).

Mechanism: the duty SHARES the _fsLastFeastDay cadence tracker with the
allowance — when the duty fires on deep surplus (>6d), it DISPLACES an
allowance feast that would have fired on contribution alone (the
allowance has no pantry-state gate beyond the 1.5× buffer). The duty is
a SAFER feast scheduler than its own required substrate: slightly fewer
deed/table opens, much less harm.

## Death-cause shares

Control (deaths): combat-dominated, starvation 15, plus dehydration 1,
lockjaw 2.
Armed: combat 96, monster 35, sickness 21, wound 15, villager combat 12,
starvation 11, contest 4, ambush 1, expedition 1, the expedition 1.
Same modes — "ambush" is a monster/combat instance, "the expedition" an
expedition instance (the feastopener evidence made the same call). No
new death mode. Villages die of violence, not hunger, on both sides;
the armed side starves LESS.

## Village assessment (plain words)

Sixteen villages, and the surplus-only feasts changed what the long
ones could reach without moving the survival buffer. The typical armed
story: the pantry fills past 6 fresh-days, the village eats the
mountain — a major feast every week or two, the shelves groaning — and
the devotion lane arms, the surge gets used in real fights, the
food-deed rung fills. On four seeds the rung fired through the duty's
own feasts; on seven more the r13 allowance got there first. Two
villages took the FULL table seat (both allowance-opened), where the
control reached zero.

The duty fired 42 feasts across 16 runs and never once touched the
4-day buffer — the floor invariant held on every firing (proven in the
proof, honored in the sims). Starvation deaths fell 15→11. But the
villages died earlier on average (median 108d vs 151d) of the same
raids and monsters — the re-sequenced trajectories ended some villages
earlier in fights, and the hungryDays proxy counted the perturbation
(40 vs 35, spread 2–3 days across 5 seeds, one of them with ZERO duty
feasts).

The standout mechanism insight is the displacement: the duty doesn't
add feasts on top of the allowance — it replaces the allowance's
riskiest feasts with surplus-only ones. The r13 allowance, measured
alone for the first time, is genuinely harmful (starvation 15→21);
the duty halves that harm while keeping most of the deed-opening.

## Blanks filled / documented

- **MEASURED, KILLED AT PILOT**: the feastdoor policy —
  scripts/policies/feastdoor.js (FEASTDOOR=1, default OFF, requires
  FEASTSCALE_R13=1; DELETED per kill protocol — the file is removed,
  not committed), proof scripts/test-feastdoor-20261014.js (REAL
  RED→GREEN 29/29 ×2, kept as instrument with INFO-SKIP degradation),
  sweep scripts/measure-feastdoor-20261014.js (kept),
  r13-only diagnostic scripts/measure-feastdoor-r13only-20261014.js
  (kept), sense scripts/sense-feastdoor-20261014.js (kept),
  det-gate scripts/det-gate-feastdoor-20261014.js (kept).
  Zero src/js changes (policy-side only).
- **FILLED (instrument)**: the surplus-only duty design (trigger >6,
  floor 4, verb-before-cause-line #201 fix); the floor invariant
  (proven live on a small-burn village); the duty/allowance cadence
  sharing; the food-deed end-to-end attribution (duty vs allowance);
  the r13-only diagnostic isolating the allowance's harm.
- **DOCUMENTED** (sim-findings.md): (a) the r13 allowance's own harm
  profile, measured alone for the first time — starvation 15→21,
  hungryDays 35→48, median 151→92d: it fires on contribution ≥1500
  with no pantry-state gate beyond the 1.5× buffer; (b) hungryDays is
  perturbation-sensitive (like the median and national before it) and
  needs an A/A noise calibration (r25b rotcal precedent), not a
  hand-set 1.1×; (c) the duty displaces allowance feasts via the
  shared cadence tracker — a safer scheduler, slightly less
  aggressive on deeds; (d) the devotion channeling line repeats
  verbatim daily (finding #64 class, competent.js).

## Metric review (§14)

1. **The hungryDays guardrail fired, and §14 binds — KILL stands.**
   40 > 38.5 is real (identical seeds, det-gated), lever-caused, and
   exceeds the pre-registered bound. This is not re-scoring: the
   primary passed (11 ≥ 10, 2 ≥ 2) and the other guardrails held
   (starvation 11≤17, death modes unchanged, national 9≥6), but the
   guardrail as pre-registered missed.
2. **The miss is substrate + perturbation, not duty harm.** The
   r13-only diagnostic proves the allowance (the duty's required
   substrate) drives hungryDays to 48; the duty's marginal effect is
   48→40 (harm-REDUCING). Starvation — the actual harm — improved
   15→11 on the pre-registered comparison. The duty cannot starve
   anyone by construction (floor invariant proven: the 4-day buffer
   never moves; 1.5× affordability; trigger >6). The +5 over control
   is spread 2–3 days across 5 seeds, one with zero duty feasts —
   the signature of trajectory perturbation, not pantry harm.
3. **The guardrail is confounded.** hungryDays, as prescribed by the
   r32b/r33b harm-proxy review, was meant to catch overstock2-class
   real harm (starvation +4, hungry +11 with a pantry-draining
   mechanism). Against a provably pantry-safe duty, it fires on the
   substrate's trajectory perturbation instead. Like the median
   (r32b #186) and national (feastopener) before it, it needs an A/A
   noise calibration (r25b precedent: p90 |d| on identical-seed
   A/A pairs) for the NEXT run, not this one.
4. **The primary is robust.** 11/16 rung firings vs 0/16 control,
   4 duty-attributed end-to-end, 2 FULL table seats (allowance-
   opened). The feast-forwarding mechanism is proven for the third
   time; the surplus-only duty is the safest scheduler yet measured.
5. **Next-run prescription.** Test the duty against an r13-only
   control (isolating the duty's marginal effect — the comparison
   this run's diagnostic enables), with a noise-calibrated hungryDays
   bound. Separately: the r13 allowance's own harm (21 starvation)
   is now a measured finding — gating the allowance on pantry state
   is a future arm.

## Convergence state

food-economy: **killed-at-pilot** (feastdoor). The surplus-only duty is
proven mechanism-positive (11/16 deeds, 4 duty-attributed, 2 full
tables) and harm-reducing against its own substrate (starvation 21→11,
hungry 48→40 vs r13-only), but the pre-registered hungryDays guardrail
missed (40 > 38.5) and §14 binds. sim-findings #187 stays OPEN: the
feast-as-door mechanism is now triply proven; the remaining work is a
guardrail that measures the duty instead of its substrate (r13-only
control + noise-calibrated bounds), and/or gating the r13 allowance's
own pantry-blind feasts.
