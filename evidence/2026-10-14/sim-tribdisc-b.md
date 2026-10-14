# SIM-TRIBDISC — healthy-pantry early pull-forward as tribute-discipline lever (loop B, food-economy)

Date: 2026-10-14 · Loop: oversight-flesh-out-loop-b · Run: fleshout-b-2026-10-14-2230
Worker tree: sim-tribdisc · Axis: food-economy (scale-wall lens) — tribute discipline.
Claims sim-findings item: EARLY PULL-FORWARD IMPROVES HEALTHY-PANTRY TRIBUTE (claimed 2026-10-14).

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- PRIMARY: armed tribute arrears notes <= control x 0.5 AND armed (missed+thin) weeks <= control x 0.7 (identical seeds).
- GUARDRAILS: starvation <= control+2; hungryDays <= control x 1.335 (noise bound); national >= control-2; median >= control-10d; no new death mode.
- Pilot gate: 8 runs/side (seeds 11/22/33/44 x leadfeast/belongfeast, FEASTSCALE_R13=1 substrate both sides), 180d death-aware, identical seeds.
  Control RE-MEASURED on current tip — tribgate-b's numbers (full 105/thin 14/missed 42/arrears 31/starvation 15/hungryDays 35,
  leadcourt/belongseek, different substrate) are SANITY CHECK ONLY, never the control.
  SMOKE=1 instrument-honesty gate; det-gate 16/16 both modes; proof scripts/test-tribdisc-20261014.js RED->GREEN before the sweep.
  Confirm 12-16 runs/side only if the pilot meets GO per §9.
- GO -> land as its own commit; primary miss or guardrail breach -> KILL per §14 (layer deleted, evidence + proof + sweep + det-gate kept).

## The arm

The tribgate arm (evidence/2026-10-14/sim-tribgate-b.md) was KILLED on the median guardrail, but its kill-side finding was clean:
early-in-full pull-forward on HEALTHY pantries improved tribute discipline (full weeks 105->118, thin 14->3, missed 42->21,
arrears notes 31->7) with zero starvation harm. That effect rode inside the killed fragility-gate arm. This arm builds ONLY the
healthy-pantry early pull-forward as a tribute-discipline lever, measured on tribute/standing primaries, not hunger.

scripts/policies/tribdisc.js (TRIBDISC=1, default OFF; zero src/js changes):
the tribute verb only. Each day, BEFORE the parent policy's daily (so the early pay lands ahead of the base discipline's own tribute step):
- gate off -> pure delegation (byte-identical to the parent policy).
- no active Haven-subordinate link -> nothing.
- week already current (tributePaidWeek === week) -> nothing.
- pantry fresh-days < 4 (fragile) -> NOTHING (no hold beat, no payment — the base discipline's own timing stands untouched).
  The tribgate lesson (early-in-full on fragile pantries arms the tribute->feast ratchet) is load-bearing: the fragility gate is the arm's spine.
- pantry fresh-days >= 4 (healthy) AND pantry kcal >= the week's tribute -> pay the week's tribute early-in-full via Game.payTribute(link.id)
  (the engine's own verb; idempotent per-week, so the base discipline cannot double-pay), recorded into ctx._tribHist in trackTribute's
  shape so the r13 feast-contribution gate sees the early tribute exactly as it would the scheduled payment (feast-channel symmetry).
  One honest beat narrates the early timing: the pantry's depth, the council's choice.

No feast-gating changes, no aid changes; tribute verb only.

Canon read: docs/CANON.md, docs/PRESERVATION.md (the ladder the healthy pantry is built on), docs/SCALE.md via belongseek's BELONG road.
Horizon: 180d death-aware (scale-wall reachability question, pacing-law max).

## Proof results (run BEFORE any sims)

RED (TRIBDISC unset, FEASTSCALE_R13=1): R1 verb returns 'off', ctx untouched, gateOn() false; R2 tribbelong.daily byte-identical to
belongfeast.daily on identical fixtures; R3 triblead.daily byte-identical to leadfeast.daily. 6/6 on seeds 11/22/33.

GREEN (TRIBDISC=1): G1 fragile fixture (~3.75 fresh-days) — verdict 'fragile', no early pay (tdFragile=1), the hold is SILENT (no layer beat);
G1b the base discipline's own tribute step still pays the week after the hold (tributePaidWeek === week, belongTribute=1);
G2 deep fixture (~6.25) — verdict 'early', full week paid (tributePaidKcal >= 6000, week current), tdEarly=1 with real kcal,
the early beat names the pantry depth + the early timing;
G3 the early pay is recorded in ctx._tribHist in the trackTribute shape (r13 feast-gate symmetry);
G4 the base discipline does NOT double-pay after the early pay (week paid exactly once);
G5 deterministic rerun. 15/15 on seeds 11/22/33.

Det-gate: 16/16 bit-identical off-vs-base (gate-off wrapper vs parent policies) AND 16/16 armed determinism
(8 seeds x leadfeast/belongfeast, 40d, per-day hashes). SMOKE=1 honesty gate green.
scripts/test-tribdisc-20261014.js, scripts/det-gate-tribdisc-20261014.js.

## Pilot results

8 runs/side, identical seeds, 180d death-aware, FEASTSCALE_R13=1 substrate both sides. Det-gate GREEN both sides before trusting comparisons.

| metric | control (TRIBDISC unset) | armed (TRIBDISC=1) | pre-reg |
|---|---|---|---|
| arrears notes (**PRIMARY**) | 24 | **16** | **MISS** (<= 12) |
| (missed+thin) weeks (**PRIMARY**) | 38 | **29** | **MISS** (<= 26.6) |
| tribute weeks full/thin/missed | 42f/10t/28m | 44f/5t/24m | report |
| tribute kcal paid | 840k | 873k | report |
| starvation deaths (guardrail) | 0 | **2** | PASS (<= 2, at the boundary) |
| hungryDays (guardrail) | 15 | **18** | PASS (<= 20.0) |
| national (guardrail) | 3/8 | 2/8 | PASS (>= 1) |
| median survival (guardrail) | 128d | **103d** | **MISS** (>= 118) |
| td verb counts (armed) | 0e/0g | 40e/98g | mechanism fires |
| table | 3/8 | 3/8 | — |
| wins | 0/8 | 0/8 | — |
| everW4 / everW5 | 7/5 | 7/4 | — |
| maxWave | 5 | 5 | — |
| exiled | 0 | 0 | unchanged |

Per-seed days (armed − control): leadfeast s11 **−102** (170→68), s22 0, s33 0, s44 0;
belongfeast s11 +14, s22 −15, s33 0, s44 0.

**Verdict: KILLED AT PILOT per §14.** The primary missed on BOTH conditions (arrears 24→16 = 0.67x vs the 0.5x bar;
missed+thin 38→29 = 0.76x vs the 0.7x bar) — the discipline moved the right way but below the bar, so there is nothing to
re-score. The median guardrail breached a second time (128→103 < 118). No confirm spend. The layer is deleted per the kill
protocol; proof + sweep + det-gate + sense + per-seed evidence kept.

## The s11 harm (same-run investigation)

The armed leadfeast-s11 village collapsed at 68d (control: 170d) with the run's only 2 starvation deaths. The verb fired
7 times early on that seed (tdEarly=7) — on a TRANSIENT subordinate stint on the lead road (a courtship link, not the long
BELONG bond): the base discipline never paid it (control: 0 full weeks, 12 missed, 10 arrears notes), and the early verb
shipped ~36k kcal of tribute the control never sent.

The sense read is damning. The village was in a starvation spiral from DAY 1 ("STARVING: health and energy falling" beats
d1–d30+), and the verb still fired: d27 paid 5,000 kcal early while the village starved. Worse, the early beat narrates the
POST-payment pantry depth — d29: "The pantry holds ~0.4 days of fresh — deep enough to pull tribute forward" — the verb
checked >= 4 BEFORE paying, paid 5,300 kcal, then narrated the depth AFTER the debit. The beat reads as a lie.

Two load-bearing lessons:
1. **Pantry health ≠ village health.** pantryFreshDays() >= 4 is a pantry metric; the village can be starving while the
   pantry "holds 5.5 days of fresh" (uneatable/earmarked/stale-burn-history). The fragility gate as designed does not
   protect a starving village — the tribgate-b "zero starvation harm" claim does not transfer to this substrate/seed.
2. **The early-pull-forward is only safe on STABLE links.** On the belong road (the long bond) the verb fired 33 times
   with zero starvation harm and strictly better discipline (thin 10→5, arrears 14→10). On the lead road's transient
   courtship stint it drained a dying village. The gate needs a link-stability condition (link age, or no active
   starvation spiral), not just a pantry-depth one.

## Death-cause shares

Control (70 deaths): combat 47 (67%), monster 13 (19%), wound 6 (9%), sickness 9 (13%), villager combat 3 (4%), contest 2 (3%).
Armed (96): combat 56 (58%), monster 12 (13%), villager combat 8 (8%), sickness 8 (8%), contest 4 (4%), wound 5 (5%),
starvation 2 (2%), alien 1 (1%).
The single 'alien' death (belongfeast s22) is an engine alienPlayers.js kill — a rare engine event, no mechanism link to the
tribute verb. **No new death mode attributable to the lever: PASS (noted).**

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control | 3/8 | 3/8 | 0/8 | 7/8 | 5/8 | 128d | 180d |
| armed | 2/8 | 3/8 | 0/8 | 7/8 | 4/8 | 103d | 180d |

Exiled: 0 both. The scale wall is not broken by this arm; national/table identical within noise.

Telemetry deviation check: LOUD on national (baseline 8 -> current 2) and table (baseline 0 -> current 3) — investigated same-run:
the scale-wall baseline is a different seed/policy composition (stale); the PAIRED control re-measured on this tip shows
national 3/8, table 3/8 — the same levels as armed. The LOUD lines are baseline-composition artifacts, not lever effects.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Armed belongfeast s44, 120d: 27 tribute beats. The early-pay beat pairs honestly with the engine's payment beat —
the layer explains the timing ("The pantry holds ~9.4 days of fresh — deep enough to pull tribute forward. This week's
grain walks out early, not on the scheduled day; better to owe nothing than to wait."), the engine reports the politics
("Tribute paid: 5,100 kcal walks out of the pantry toward Emberhold. The relationship holds."). The tribute story stays
political: the grief-leverage hike climbs 5,000 → 7,812 → 11,369 kcal/week, the link moves to The Hungry Road and the hike
resumes 5,000 → 7,696 → 11,529 → 16,916 → 25,313 → 37,970 — and the village can't keep up: "You send 2,048 of 8,438 kcal —
all the pantry holds. They count the gap; the arrears grow teeth." / "Tribute short — 19,760 of 25,313 kcal so far this
week. They'll count it. Arrears grow teeth." The early pay improves discipline on payable weeks; it cannot outrun the hike.
**Coherence PASS** — except the s11 post-payment-depth narration bug (documented above; the beat must name the PRE-payment
depth that justified the decision).

## Village assessment (plain words)

Eight villages, and the lever did what it promised on the road it was built for: on the belong road the tribute books came
out cleaner — thin weeks halved (10→5), arrears notes down by a third (14→10), the weeks that could be paid were paid early
and in full, and the feast-contribution gate saw the early tribute exactly as it would the scheduled one. The median village
still starved nobody on that road.

But the lead road told the other half of the story. One seed courted a transient subordinate stint, the pantry read "healthy"
on the engine's own math while the village had been starving since day one, and the verb did exactly what it was told —
paid the week's grain early, seven times, ~36,000 kcal the base discipline would never have sent. The village that lived
170 days without paying died at 68 with two starvation deaths and cleaner books. A tribute lever that reads the pantry and
not the village is a lever that can kill the village to pay the tribute.

## Blanks filled / documented

- **MEASURED, KILLED AT PILOT** (primary missed both bars, median guardrail breached, §14): the healthy-pantry early
  pull-forward — scripts/policies/tribdisc.js (TRIBDISC=1, default OFF; DELETED per kill protocol), proof
  scripts/test-tribdisc-20261014.js (RED→GREEN re-verified on seeds 11/22/33, kept), det-gate
  scripts/det-gate-tribdisc-20261014.js (16/16 both modes, kept), sweep scripts/measure-tribdisc-20261014.js (kept),
  sense scripts/sense-tribdisc-20261014.js (kept), evidence + per-seed JSON
  (evidence/2026-10-14/tribdisc-{baseline,armed}.json + perseed-tribdisc-{base,armed}/, kept). Zero src/js changes.
- **DOCUMENTED** (appended to hidden_files/sim-findings.md): (a) PANTRY HEALTH ≠ VILLAGE HEALTH — the fragility gate needs a
  village-health / link-stability condition (steve-call: what counts as "healthy enough to pay early"?); (b) the early-pay
  beat narrates post-payment pantry depth — must name the pre-payment depth; (c) the lead-road transient-link early pay is
  a harm channel worth its own guardrail in any future tribute-timing arm.

## Metric review (§14)

1. **The KILL stands on the header as written — no re-scoring.** The primary required arrears <= 12 AND missed+thin <= 26.6;
   armed delivered 16 and 29. Both conditions miss. The discipline moved the right way (arrears −33%, missed+thin −24%) but
   below the bar — and §14 binds the run to its header, not to its direction.
2. **The median guardrail breached a third time in this arm family** (#186, tribgate, now tribdisc: 128→103 vs the 118 bar).
   Unlike tribgate's pure-perturbation breach, this one carries a legible harm mechanism on the moved seed (s11: early
   tribute payments on a starving village, 170→68d, 2 starvation deaths). The standing proposal from tribgate-b's review
   (median report-only, harm-specific guardrails binding) is STRENGTHENED: the starvation guardrail passed at its boundary
   (2 <= 0+2) while the trajectory was ugly — the binding harm guardrail for tribute-timing arms should be starvation <=
   control+0 or a village-health gate in the verb itself, not the median.
3. **The primary was the right instrument and it missed honestly.** Tribute/standing primaries were the correct lens for a
   discipline lever (not hunger); the bar (halve arrears, −30% missed+thin) was ambitious and the arm delivered −33%/−24%.
   A future arm with the village-health gate could re-try against a recalibrated bar — that is the NEXT run's call, not
   this one's.
4. **Baseline re-measured on current tip as required** (leadfeast/belongfeast, FEASTSCALE_R13=1): arrears 24, missed+thin 38,
   starvation 0, hungryDays 15, national 3/8, median 128d. The tribgate-b sanity numbers (31/56/15/35 on the older substrate)
   re-measure comparably per-run — the comparability claim holds loosely.

## Convergence state

food-economy: **killed-at-pilot** (tribdisc). Primary missed both bars (arrears 24→16 vs ≤12; missed+thin 38→29 vs ≤26.6),
median guardrail breached (128→103d vs ≥118) with a legible harm mechanism on the moved seed (s11 lead-road: early tribute
on a transient link while the village starved — pantry health ≠ village health). The mechanism fires as designed on the
belong road (33 early pays, 98 fragile holds, zero starvation harm, discipline strictly better); the fragility gate needs
a village-health / link-stability condition before any tribute-timing arm returns.
