# sim-scale-onramp-round-0215 — coordinator evidence (axis scale-onramp)

Run: flesh-out loop A, 2026-10-26, run fleshout-20261026T0215Z.
Loop B live on food-economy for the whole run (claim
fleshout-loop-b-20261026T0130Z, arms sim-stafffallback-b + sim-d2fix-b)
— NOT touched. This run worked scale-onramp (converging), taking the
0126Z run's named next blanks (1) drive-off confound cleanup and (2)
refresh-branch arm, in order, on one shared band (seeds 73671–73678,
180d death-aware, baseline tableseat-nowait on identical seeds,
scalemetric cost bar). Both arms' own control sides reproduce the
0126Z authoritative rebaseline table EXACTLY on all 8 seeds — no table
revision needed, no prior corpus re-judged.

## Arm 1 — sim-driveoff-clean-a: NO-GO (funnel priced, patrol separated)

Commit bdabb563d (worker 4b6b6810, rebased onto journey tip 5a9dde95f
in its own worktree, proof 29/29 re-run green post-rebase and on merged
master). Policy-side only, zero src/js, no [needs-eyes].

The clean hook intercepts Game.faceFeastDraw from upkeep: when
feastFightRoad calls face with a live draw, the intercept calls
Game.driveOffFeastDraw() live, records a post-check, and returns the
driveoff result — the draw is driven off at the exact moment it would
have been faced, with SEEK_FIGHTS left ON and no other competent.upkeep
step moved. All 10 driven-off draws went through the intercept
(fdCleanIntercept 10, phantom 0, fallback 0). Rejected alternatives in
pre-registration: splitting competent.upkeep (unexported helpers would
diverge) and creation-choke (suppression is not drive-off — no
narration, no watcher memory).

| arm | won | median | natEver | natFinal | table | entered | wave4 | wave5 | Arc IV | starv | deaths |
|---|---|---|---|---|---|---|---|---|---|---|---|
| control (always-face) | 4/8 | 143d | 6/8 | 5/8 | 4/8 | 4/8 | 5/8 | 0/8 | 4/8 | 9 | 260 |
| clean drive-off (patrol on) | 0/8 | 180d | 5/8 | 3/8 | 1/8 | 0/8 | 6/8 | 0/8 | 1/8 | 11 | 295 |
| old drive-off (patrol off, context) | 0/8 | 180d | 5/8 | 2/8 | 0/8 | 0/8 | 6/8 | 0/8 | — | 9 | 307 |

| arm | grants (fresh/refreshed/refused) | draws | faced | driven-off | draw kills | wave-4 draws | patrol sweeps |
|---|---|---|---|---|---|---|---|
| control | 12 (5/0/7) | 5 | 5 | 0 | 4 | 1 | 0 |
| clean | 22 (10/0/12) | 10 | 0 | 10 | 0 | 4 | 30 |

Cost bar: starvation 11 ≤ 9+2 PASS; per-seed excess max +2 PASS;
median 180d ≥ 0.8×143d PASS; national-ever 5 ≥ 6−1 PASS; wins 0 <
4−1 FAIL → NO-GO. Funnel legs (a)–(f) all met, including the patrol
leg (clean 30 sweeps, all 4 driven-off seeds patrolled; control patrols
0 because its faced fights mark the buff used).

The patrol component, priced: old (patrol off) vs clean (patrol on),
both driving off every draw — deaths 307 → 295 (−12), starvation
9 → 11 (+2), national-final 2/8 → 3/8, table invited 0/8 → 1/8, wins
0 → 0. Patrol buys survival days and a little rank at a small
combat cost — but no win, no table entry, no Arc IV. The old arm's
4-win gap was never the patrol. The clean wall delta (wins 0 vs 4,
deaths 295 vs 260) may now be cited as the pure drive-off price;
backlog #1064 marked fixed with this citation.

Sharpest case: 73678 drove off the Strike on day 115, met the same
Strike in the world on day 120 and killed it with the same killer, yet
never reached Arc IV, never sat at the table, and lost on day 145.
Killing the beast is not the deed — the faced draw fight itself is
what the village loses when it declines. (Next blank: the Arc IV deed
test.)

## Arm 2 — sim-feastrefresh-a: DIAG-GO (refresh branch exercised)

Commit e5c381f8e (worker 08b9e3b36, rebased onto bdabb563d in its own
worktree, proof 29/29 re-run green post-rebase and on merged master).
Policy-side only, zero src/js, no [needs-eyes].

Daily-feast-cadence instrument (FEASTREFRESH=1) wrapping the committed
drive-off policy, so devotion stays armed and a re-feast inside the
2-dawn window can refresh. It clears only the policy's own 7-day
cadence markers; every game gate (dusk, haven, affordability,
recent-gives, feastPlan, one feast/day) still applies.

| arm | won | median | natEver | natFinal | table | entered | wave4 | wave5 | ArcIV | starv | deaths |
|---|---|---|---|---|---|---|---|---|---|---|---|
| control (always-face, 7d cadence) | 4/8 | 143d | 6/8 | 5/8 | 4/8 | 4/8 | 5/8 | 0/8 | 4/8 | 9 | 260 |
| refresh (daily cadence + drive-off) | 0/8 | 180d | 7/8 | 4/8 | 0/8 | 0/8 | 5/8 | 0/8 | 0/8 | 9 | 274 |

| arm | grants (fresh/refreshed/refused) | draws | faced | driven-off | kills | wave-4 draws |
|---|---|---|---|---|---|---|
| control | 12 (5/0/7) | 5 | 5 | 0 | 4 | 1 |
| refresh | 151 (10/14/127) | 10 | 0 | 10 | 0 | 0 |

Refresh-branch numbers (the deliverable): 14 refresh grants (73672: 3,
73673: 11), in 10 chains, longest 5 grants (73673: fresh d40 +
refreshes 41, 42, 43, 44). Draws on refresh: 0 — no draw row carries a
refresh grant's index. Window semantics 14/14: every refresh extended
untilDay by exactly 1 AND reset to grantDay+2 — no stacking, no
shortening. Circling draws at refresh: 0 in sims (draws are answered
at driveContests before the next dusk); the method proof in the test
file covers the code-level case (refresh returns no draw field, a
still-circling draw + pendingEncounter survive untouched, window
extends, better quality kept). Quality caveat: all 14 refreshes were
quality 1 / mult 2.03, identical to pre-buff values — "better quality
wins" held only trivially; a thin→legendary refresh step is still
unmeasured. Refusal census: reactor 127, devotion 0, other 0 — the
reactor check runs before the devotion gate, so the devotion gate is
never observed on this band. Chain-breakers: gap days with no feast
hosted (5×), the reactor ceiling (1×), village end (1×) — never a
devotion lapse, since driving off spends no devotion.

Guardrails (diagnostic only, pre-registered as non-verdict-flipping):
starvation total PASS (9 vs 9+2), non-won median PASS (180d vs 144d),
national-ever PASS (7 vs ≥5) — but per-seed starvation FAIL (73673:
4 vs control 0) and wins FAIL (0 vs ≥3). Flagged, not hidden.

COORDINATOR CAVEAT (composition, not a verdict change): the refresh
arm wraps the OLD feastdraw-driveoff policy (patrol-off posture),
because it was built before the clean hook merged. Its DIAG verdict
stands — refresh classification does not depend on patrol — but its
wall side effects (wins 0/8, deaths 274, Arc IV 0/8) mix daily-feasting
+ drive-off + no-patrol and are NOT a clean refresh-posture price. A
refresh-posture price with the clean hook is still open. Related
mechanism, read from code: hostFeast draws pantry food BEFORE calling
grantFeastBuff, so a refused feast still costs dinner — 73675 lost day
93 on refused attempts where its control self survived 180 days, and
73673 starved 4 on granted daily feasts. Any daily-feast policy must
price refused feasts, not just granted ones.

Village assessment (plain words): three villages never feasted under
either policy and lived identical lives. 73672 refreshed three times,
then pinged the reactor ceiling daily for 110 days, surviving at
global rank with a fat pantry and no seat. 73673 is the feast-village
that ate itself — eleven refreshes, six draws driven off, pantry run
to zero, lost day 159 where its control self won day 124. The refresh
branch itself is healthy; the posture that exercises it is expensive.
The refresh narration is honest ("stoked higher, not doubled") but
silent about why tonight's feast mattered — a telegraphing note, not
a bug.

## Wall (this run's judged corpora, 32 configs)

Controls (both arms, identical): national-ever 6/8, national-final 5/8,
table invited 4/8, entered 4/8, wins 4/8 (lesser seat only), wave-4 5/8,
wave-5 0/8, full seat 0/8, Arc IV 4/8, median 143d, deaths 260.
Armed: clean wins 0/8, refresh wins 0/8 (diagnostic posture), wave-5
0/16 armed, full seat 0/16 armed, entered 0/16 armed. The wall stands:
wins still come only through default-OFF courtship + seat instruments
and only through the lesser seat, the full seat is still unreached,
and wave 5 still has zero births.

## Metric review (§14 — binding, no mid-run re-scores)

No GO leg or cost-bar line was re-scored mid-run in either arm.
Driveoff-clean judged exactly against its pre-registered header
(wins guard FAIL → NO-GO, not softened). Feastrefresh judged exactly
against its DIAG header (refresh count 14 ≥ 10 bar → DIAG-GO; its
guardrail misses were pre-registered as diagnostic-only and are
reported as misses, not verdict-flipping). The 0126Z drive-off NO-GO
stands and is now patrol-separated; the refresh branch's
"unexercised" status is closed by measurement, not by re-judging an
old corpus. Two method notes for the NEXT run (not revisions here):
(1) future national-ever reads should pair tsNationalDay with maxRank
(clean 73673 reached national transiently but the dawn snap recorded
regional); (2) future refresh-posture arms must use the clean hook,
not the old patrol-off driveoff policy, or state the composition.

## Telemetry / balanced panel (standing exception, not an omission)

Telemetry deviation check NOT run, per the standing 1027Z instruction
(recorder rows are not panels; the checker reads top-level panel
paths the rows do not carry; WINSEAT baseline vs courtship substrate
regime warning) — baseline NOT rolled. Balanced panel NOT run as a
compare (panel cannot ingest recorder corpora — eighth sighting);
each arm's sweep-compare table + analyzer output, coordinator-noted
above, is the comparison of record. check.js --quick NOT re-run:
zero src/js in either arm, standing 279/8 pre-existing profile
attributed by the 1226Z addendum; both arm proofs green on merged
master (29/29 each, re-run by the coordinator).

## Infrastructure

Master moved twice under the run before the arm merges
(journey-crisis r55, journey-deepening r49, zero file overlap); both
branches rebased clean in their own worktrees (driveoff-clean once,
feastrefresh once), arm diffs verified identical, proofs green after
every rebase and on merged master, then merged --ff-only in order
(driveoff-clean bdabb563d, feastrefresh e5c381f8e). Safe-commit index
clobber hit both worker commits — repaired via cacheinfo each time,
commits verified correct. Both workers' first full-sweep background
sessions vanished after the control arm with no completion record
(same class as rebaseline-a's note) — no rows lost, clean arm and
refresh arm finished one seed per exec call with each row verified.
No EPERM flap blocked this run's ref writes; registrations ran slow
(~2–3.5 min each, known slowness class) and all succeeded. No
back-to-back second round: both arms resolved, elapsed >30 min, and
the next blanks need design, not ready arms. Main tree clean at
closeout; both trees released done-merged, branches deleted.

## Backlog updates (this run)

- #1064 DRIVE-OFF CONFOUND → fixed (clean-hook citation above).
- #1065 REFRESH UNEXERCISED → fixed by feastrefresh-a (worker-marked,
  verified by coordinator).
- New [open]: Arc IV deed test (faced draw vs world-bump kill);
  transient-national instrument note; patrol death cost;
  quality-step refresh (thin→legendary); devotion gate never
  observed (reactor-first check order); refused feasts still cost
  pantry food.

scale-onramp stays converging (NOT converged): the drive-off price is
now patrol-separated and the refresh branch is measured, but wins
still come only through default-OFF courtship + seat instruments on
the lesser seat, the full seat is still unreached, and wave 5 still
has zero births. The directive stands until the tracker records this
axis converged on measured evidence. Next blanks, in order: (1) Arc
IV deed test (faced draw vs world-bump kill, 73678 case); (2)
quality-step refresh (thin→legendary, DIAG, not a wall lever); (3)
devotion-gate observation (unarmed, reactor-free feast); (4)
refused-feast pantry pricing for any daily-feast policy; (5) drift
bisection acbc0c933→4f5f3b614 (carried); (6) unlockedWave at draw
time (carried); (7) fusion-reactor ceiling on feast grants (carried,
now 127 refusals measured on the refresh arm); (8) melt ruling for
Steve (carried); (9) wound-closure pricing paper, then Steve ruling
on met-below-line finishing (carried; defender-finish stays KILLED);
(10) still-gated old-core mechanism + defender-fight narration
boilerplate (carried); (11) transient-national instrument note
(pair tsNationalDay with maxRank); (12) patrol death cost pricing;
(13) refresh-posture price with the clean hook (composition caveat
above). food-economy stays converging (untouched; sibling loop B).
Rotation left at 3 (convergence work does not cycle it).
Claim deleted; lock deleted. Evidence: this file (coordinator) +
sim-driveoff-clean-a.md + perseed-sim-driveoff-clean-a/ (bdabb563d) +
sim-feastrefresh-a.md + perseed-sim-feastrefresh-a/ (e5c381f8e).
Merged locally, pending ship.
