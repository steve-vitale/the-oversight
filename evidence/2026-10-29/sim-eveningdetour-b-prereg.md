# sim-eveningdetour-b — PREREGISTRATION (written BEFORE any judged after-leg)

Run: oversight-flesh-out-loop-b, arm sim-eveningdetour-b, axis
food-economy (evening-detour lever). Worktree sim-eveningdetour-b.
This file was committed BEFORE any judged after-leg was run.

## Canon read before judging

- docs/CANON.md (manifest) — read first.
- docs/MAP.md §6 (the way home): node travel is free; the lodge
  detail walk bills walkStepKcal() per landed square plus 1 tick
  per step; a human taps "Go around". No walk-home tax exists.
- No canon doc covers evening-hop refusals specifically; the
  authority is the engine itself (travelTargets()/travelTo()/
  travelBlockage()) plus evidence/2026-10-29/
  sim-blockedpath-diag-b.md, whose §5 designs this lever and
  whose §5 draft prereg this file adopts, with the additions
  below (BFS-as-judge statement, detour-record fields, streak
  definition). Nothing new is invented here: the detour is the
  policy the game already offers humans via "Go around", applied
  at evening by the bot.

## Perception law (Steve 2026-10-28, binding)

The detour's "home" is the villager's OWN haven:
state.village.px/py (engine default 4,4), lived-in knowledge.
Every detour step is an engine-offered adjacent step
(Game.travelTo to an orthogonal neighbour, travelBlockage-clean
from the step's origin) — never a roster, crew list, snapshot,
teleport, or forced move. No list-fed wiring exists in this arm.

## Policy (policy-side ONLY — no src/js, no default flips)

scripts/policies/nighttravel.js gains a default-OFF gate
(COMPETENT_EVENING_DETOUR=1): on a travel-refused evening
(haven offered, hop refused, not in combat, not in a tent),
walk the BFS route-around path home — orthogonal travelTo
steps, each travelBlockage-clean, exactly Arm B's routeAround
mechanics (competent.js routeAround, mirrored, not imported:
competent.js is NOT touched — a sibling worker owns it this
run) — then run the insideevening entry leg unchanged. No
clearing, no force, no bridge-building, no detour narration
("going around" line is a separate named blank, noted in the
sense-test only, not built here). If any detour step refuses
(position unchanged) or combat starts mid-detour, stop honestly
where you stand, sleep away, and count the evening NOT
rescued. If the detour reaches haven, the lodge walk bills as
today's converted evenings already bill.

The driver is scripts/eveningdetour-trace-b.js (a copy of
scripts/nighttravel-trace-b.js extended only to record the
detour record: path, steps walked, per-step from/to, per-step
combat flag, stopped reason). Substrate, asserted FATAL in the
driver: COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
DEPOSITGATE=1. Horizon 30 loop-days, tap days = last 5
loop-days, same as the nighttravel verdict leg. The BFS
(orthogonal) is the judge, not hop-path equality: a detour
exists iff the orthogonal BFS finds a travelBlockage-clean
path; a diagonal-only passage with no orthogonal path counts
as NO detour, honestly unrescued (see diag §5 metric review).

## Primary metric, GO threshold, minimum-n, guards (judge ONLY against these)

An evening is REFUSED iff the evening hop was offered and
refused (before leg: eveningOutcome 'travel-refused'; after
leg: the initial hop refused, i.e. a detour was attempted OR
the evening ends 'travel-refused' with no detour path).
Evenings with eveningOutcome 'game-over' are excluded from
every count. The scope is stated with every quote: the rate
is "among refused evenings on refused-prone seeds", NEVER a
blind-band rate.

PRIMARY (rescue rate, after leg only): (refused evenings
ending inside at haven: inside === true AND tile ===
'haven' at evening position) / (all refused evenings on the
after leg). A detour evening that stops mid-detour, enters
combat, or dies counts in the denominator, never in the
numerator. A still-refused evening whose arrival differs
from its departure is a G3 violation, not a rescue.

- GO (pilot) requires refused-evening n >= 8 AND rescue
  rate >= 0.50 AND guards G1 AND G2 AND G3 all hold on the
  pilot band.
- G1 (survival): median daysAlive on the after leg >=
  before-leg (gate-OFF) median - 2.
- G2 (starvation): starvation-caused deaths (analyzer
  telemetry-cause match, as in the nighttravel analyzer)
  on the after leg <= before leg + 2.
- G3 (honesty, zero-tolerance): 0 detour evenings landing
  off-haven while counted rescued; 0 detour steps that
  teleport (every recorded detour step must move exactly
  one orthogonal tile, Manhattan distance 1, via travelTo);
  0 detour evenings that enter combat and then claim
  inside (rescued evenings must have inCombat false at
  evening position); 0 still-refused evenings with
  arrival != departure.
- Minimum-n: if after-leg refused n < 8, the verdict is
  INSUFFICIENT-DATA — not GO and not NO-GO, no confirm.
- NO-GO / KILL: pilot rescue rate < 0.50 with n >= 8, or
  any G3 violation, KILLS the lever at pilot — no confirm
  spend, no re-score against a friendlier metric
  (cleared-evenings, within-reach conversion, or any other
  denominator). On kill: revert the policy gate (leave no
  policy trace), commit only evidence + scripts + prereg,
  and report the kill with its numbers.

## Secondary (reported, never judged)

- Refused-evening streak length before vs after: maximal
  runs of consecutive loop-days ending unrescued-refused
  (before leg: travel-refused evenings; after leg: refused
  evenings not ending inside at haven), mean and max.
- Detour path lengths actually walked (BFS path length vs
  steps walked per rescued evening).
- Encounter rate on detour steps: detour steps after which
  combat is live, per step and per detour evening.

## Staged gates

- PILOT GATE: both legs present for all 8 pilot seeds,
  partition sums hold on every seed, no unresolved
  unclassified investigation. If pilot refused n >= 8 AND
  rescue rate < 0.50, pilot FAILS conclusively — KILL,
  no confirm. If pilot passes all guards, confirm MAY be
  spent (12–16 seeds) only if time remains in this run.
- CONFIRM (only if pilot passes): 12–16 seeds (the
  remaining refused seeds from the diag §5 episode table
  plus, if needed, fresh refused-prone seeds from a new
  scan — never re-using pilot seeds as confirm). The
  confirm verdict uses the same primary metric, bar,
  and guards pooled over the confirm band; the pilot
  rate is a staging diagnostic, never pooled into a
  confirm verdict after the fact.

## Before / after legs and seed declaration

- Before leg: POLICY=nighttravel, gate OFF
  (COMPETENT_EVENING_DETOUR unset / 0), fresh run into
  evidence/2026-10-29/sim-eveningdetour-b-corpus-before/.
  The verdict pooled-36 nighttravel corpus is NOT
  overwritten; it is used only as a cross-check (refused
  counts per pilot seed should be near-identical under
  the same driver/substrate — any large divergence is
  investigated before judging, never papered over).
- After leg: POLICY=nighttravel, gate ON
  (COMPETENT_EVENING_DETOUR=1), everything else
  identical, fresh run into
  evidence/2026-10-29/sim-eveningdetour-b-corpus-after/.
- Pilot seeds (declared now, exact 8, chosen from the 18
  refused seeds in the diag §5 episode table, preferring
  high-refusal seeds): 11149, 11031, 11360, 11384, 11390,
  11439, 11077, 11299.
  (Diag refused-evening counts: 11149: 18, 11031: 17,
  11360: 8, 11384: 8, 11390: 10, 11439: 10, 11077: 7,
  11299: 6 — 84 refused evenings in the verdict corpus.)
- Control for guards: the before leg (gate OFF) on the
  same seeds, same driver, same substrate. NOT the
  insideevening control: the question is the detour's
  effect on top of nighttravel, so the gate-OFF
  nighttravel leg is the control.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

NO balance-panel compare .md is produced, as
pre-registered here before judging: this leg is a 30-day
position/reachability measurement of a POLICY-SIDE arm —
zero src/js changes, so there is no game-root delta for a
panel to compare, and the panel's registry policies do not
include the trace policies this arm measures. The
before/after instrument is the custom driver on identical
seeds, and the pre-registered thresholds above are the
judge. If this lever ever becomes a game change, a panel
compare is run at that point; a policy-side trace cannot
fake one now.

## Horizon + why (death-aware, never a fixed 200d)

30 loop-days, same as the verdict leg: the question is
evening rescue, and the refused pattern is visible inside
30 days (diag episodes run 1–9 evenings within 30 days).
Dead villages stop simulating (runDays endReason); the
+10d tail is a cap, not a target — no village is simulated
past its death + 10 days.

## Landing rule

- GO (pilot, and confirm if spent): lands the
  default-OFF policy instrument ONLY
  (scripts/policies/nighttravel.js gate + trace/analyzer/
  proof instruments, as a policy file no driver adopts by
  default). NO driver adopts it, NO default flip, NO
  src/js change, NO competent.js / insideevening.js
  change. This worker does NOT merge to master —
  coordinator merges.
- KILLED at pilot: the policy gate is reverted (no
  policy trace left), and only evidence + scripts +
  prereg commit. The kill record is the evidence file.
- INSUFFICIENT-DATA: the branch stays HELD, unmerged as
  a landed lever, with corpora committed for the next run.

## Sense-testing (mandatory, in the evidence file)

Read transcripts end-to-end for at least: one rescued
detour evening (does the walk + entry read as a sensible
played evening — what did the player pay, what did the
arrival narration say, is the missing "going around" line
felt?); one unrescued detour evening (does stopping where
you stand read honestly?); one still-refused evening with
no detour path if any occur (does the refusal read
honestly?). Judge meaning, not counts: a rescued evening
that reads as a teleport is a failure of the lever even
if the rate passes.

## Village assessment (mandatory, in the evidence file)

Plain words: what the village looked like, who thrived and
who died and why, what knowledge/capabilities were missing,
which blank was filled (fix) or documented (evidence).
Plus wall numbers (national / table / wins, wave 4–5
reach, median survival) even if NOT OBSERVABLE in a
30-day leg — never claimed as movement unless measured.

## Metric review (mandatory section in every evidence file)

Judged ONLY against this preregistration. No mid-run
re-scoring: the denominator stays refused evenings on
refused-prone seeds; a thin denominator does not rescue or
sink anything beyond the minimum-n rule stated above. If
the metric proves wrong (e.g. the BFS judge vs hop-path
distinction bites on a judged seed, or the before leg
diverges from the verdict corpus), write it under "metric
review" and propose the revision for the NEXT run.
