# sim-scale-onramp-round-1332 — coordinator evidence (run fleshout-20261025T1332Z)

Axis: scale-onramp (converging). Loop B live on food-economy (1329Z claim,
arms sim-packtail-adopt-b + sim-awayvoice-adopt-b) — NOT touched; B's
landing (2870c771c + journey r46 c92af1f47) moved master under this run
mid-flight and both arms rebased clean onto it (belltoad: no overlap;
threshold: game.js overlap resolved by clean rebase, arm diff verified
byte-identical to the worker commit).

Backlog items claimed by this run and now FIXED:
- BELLTOAD SHOUT FIX ARM (sim-belltoad-a candidate 1) — fixed by
  sim-belltoad-fix-a.
- POST-FLEE EXACTLY-25% THRESHOLD (sim-postflee-retest-a next blank 2)
  — fixed by sim-postflee-threshold-a.

## Arm 1 — sim-belltoad-fix-a: GO, LANDED 818361b41 [needs-eyes]

Lever: candidate 1 only — src/js/fieldFights.js trickDisrupt is no
longer cleared after the first pack member's attack; it clears once
after the full monster phase, so the shout halves every pack member's
next attack. Morale rule and 2-shout cap untouched. 9 insertions,
2 deletions, one file.

Before/after, identical seeds 73671–73678, 180d death-aware,
tableseat-nowait + deathcensus recorder:

| Metric | Control | Armed |
|---|---|---|
| PRIMARY: belltoad engage-intent deaths | 2 (73677 d67 nora_wilson 3r 0/105; d68 gen_ed0l37r 2r 0/76, reproduced exactly) | 0 |
| Other 0-dealt multi-round rows (deaths) | 34 (3) | 32 (3, identical rows) |
| Total villager deaths | 249 | 238 |
| National-ever | 7/8 | 7/8 |
| Table invited / wins | 6/8 / 4/8 | 6/8 / 4/8 |
| Wave 4 / wave 5 | 5/8 / 0/8 | 5/8 / 0/8 |
| Median days / wins-excluded median | 145 / 180 | 144 / 180 |

Sense (armed transcript, on-trajectory): D67 Nora, who died at 0 HP
mid-round-3 in control, now survives — round 2 shows all four pack
attacks halved in sequence (14→7, 12→6, 11→5, 9→4), she binds her
wound in round 3 and flees alive at 28 HP. The chorus actually
breaks. D66 James is identical to control (shout fired, no disrupted
phase followed — correct, bounds the fix).

GUARD CAVEAT, stated plainly (coordinator verdict below): guard G1's
literal parenthetical "(all survive, as in control)" fails — but it
fails IN THE CONTROL ITSELF (3 other-row deaths: focus_group d125,
eulogy d86/d87, all field-context), under a filter broader than
sim-belltoad-a's field-only filter, and even that filter fails on
current code because band trajectories moved since the old corpus.
A guard no arm — including the control — can pass cannot gate an
arm. The guard's substantive requirement, survival UNCHANGED, passes
exactly: the armed death set in that class is identical to control's,
zero new deaths, zero removed. This is not a mid-run re-score of the
arm's outcome (PRIMARY 2→0 and every other leg stand as
pre-registered); it is a correction to the guard's wording, recorded
here for the NEXT run: future belltoad guards must pre-register
"death set in the class identical to control", not "all survive".

Post-rebase proof on merged master: test-belltoad-fix-a.js
--analyze → ANALYZE-DONE fail=0 → GO. check.js --quick (worker):
279 passed, 8 failed, all 8 proven pre-existing on a pristine HEAD
tree (stale measurement/phone-frame proofs, hide-discovery, parity
gear, etc.) — none attributable to this change.

## Arm 2 — sim-postflee-threshold-a: GO, LANDED d39228b3e [needs-eyes]

Lever: post-flee rest flag condition <0.25 → <=0.25 at BOTH live
sites (src/js/game.js wild router, src/js/villager-agency.js
expedition branch). Nothing else: no morale, no rest-duration, no
flag-scope change. This is an open threshold question, NOT a
correction to the sim-postflee-retest-a GO verdict, which stands on
its own <25% bar.

Before/after, identical seeds, tableseat-nowait, DEATHCENSUS=1,
180d death-aware. Pilot 73679–73686, confirm 73687–73690:

| Leg | Bar | Control (landed <25%) | Armed (≤25%) |
|---|---|---|---|
| PRIMARY: exactly-25% same-day post-flee deaths | 0 | 1 (73679 d109 carlos_diaz, fled 74→25 HP, same entity) | 0 |
| PRIMARY: exactly-25% fleer flagged-and-rested | ≥1 | — | 2/2 rested, incl. carlos (1 later same-day fight row in control → 0 rows armed) |
| COST: starvation+sickness / 100 village-days | ≤ 0.719 | 0.575 (5/870d) | 0.579 (5/864d) |
| Wins-excluded median | ≥ 144d | 180d | 180d |
| National-ever | ≥ 4/8 | 6/8 | 6/8 |
| Wave-4-or-win | ≥ 3/8 | 5/8 | 5/8 |
| Raid villager deaths | ≤ 1 | 0 | 0 |
| Negative control: 26%/27% deaths | identical to control | 1 + 1 | 1 + 1, byte-identical cases (73680 d17 26 HP, 73683 d162 27 HP) |
| Directed probe (seed 73671) | PASS | — | PASS |

Confirm band 73687–73690: control and armed IDENTICAL on every
headline outcome — no exactly-25% cases exist there, so the change
is inert there, as expected. Full 12-seed totals: won 7/12 both,
national-ever 10/12 both, entered 7/12 both, wave-4 4/12 both,
wave-5 0/12 both, villager deaths 29→28, field deaths 10→9, cost
rate 0.488→0.490/100vd. The only headline difference in all 24 runs
is seed 73679: carlos survives day 109 and his village wins 6 days
earlier (119→113d).

Control replication: this run's control IS the landed <25% code and
replicates the retest armed pilot exactly (identical per-seed days
and totals). No unexplained gap.

Probe: Ursula_weber fled a suburb at entry 100 HP, ended exactly
25 HP — flag set, tick skipped, raid proceeded, arena never
flagged, scholar refused, expedition fought nothing, flag expired
next day. Probe-harness artifact found and fixed mid-run by the
worker (awayNews 8-entry cap filled by the wide grid faked failures
on the first attempt; fixed by draining awayNews between attempts
and reserving one villager — the cap is pre-existing behavior,
noted in the arm evidence side-findings).

Sense (probe): "…mauled Ursula (-75 health) over 1 round. They're
lucky to be breathing. — staying out of sight for the rest of the
day — too hurt to meet it again." A person at a quarter of their
health hiding reads sensibly; the 26/27% fleers walking out and
dying the same day are the line's honest edge.

Post-merge proof on merged master: test-postflee-threshold-sweep.js
--summarize reproduces the corpus (negatives 26/27 present, medians
as reported), tree clean; check.js --only fieldfight: 2 passed,
0 failed.

## Wall numbers (this run's judged corpora, armed)

- Belltoad band (8 seeds): national-ever 7/8, wins 4/8 (lesser seat
  only), wave-4 5/8, wave-5 0/8, full seat 0/8.
- Threshold band (12 seeds): national-ever 10/12, wins 7/12 (lesser
  seat only), wave-4 4/12, wave-5 0/12, full seat 0/12.
- Pooled: national-ever 17/20, wins 11/20, wave-5 0/20, full seat
  0/20, wins-excluded median 180d in both bands.
- The scale wall above national/table is untouched by either fix,
  as it should be: a one-point threshold and a chorus-wide shout
  are death-class fixes, not scale levers. Wins still come only
  through default-OFF courtship + seat instruments on the lesser
  seat; the full seat still requires the wave-5 deed bar and wave 5
  is still 0 everywhere.

## Telemetry deviation check

SKIPPED on purpose per the standing 1027Z/1146Z/1226Z instruction:
telemetry-check reads 0 wins/national on per-seed recorder rows
whose analyzer-proven counts are wins 4/8–7/12 and national-ever
7/8–10/12, and the scale-wall baseline itself warns against
comparing courtship substrates to its WINSEAT regime. Baseline NOT
rolled. Do not re-run telemetry-check on recorder rows without a
counting fix or a regime-segregated baseline.

## Balanced panel

No compare .md attached: balance-panel.js is a live-sim observer
instrument with no corpus input and cannot compare recorder corpora
(sixth sighting of the known ingestion class). Each arm's
pre-registered analyzer, coordinator-reproduced post-merge, is this
run's comparison.

## Infrastructure notes (coordinator, read before the next run)

- COORDINATOR ACCIDENT, repeated from 1226Z: probing a sweep script
  with --help RAN a sweep (this script treats unknown flags as the
  default sweep mode) and touched two committed corpus files
  (s73679-control, s73680-control). Caught via git status, restored
  from HEAD with `git checkout HEAD -- <files>`, tree re-verified
  clean before merge. Rule restated: NEVER probe a sweep script
  with --help; read its argv handling first (grep process.argv)
  and use only documented read-only modes (--summarize here,
  --analyze for the belltoad script).
- Safe-commit index clobber hit BOTH worker commits (bogus staged
  deletions) — repaired via cacheinfo each time, commits verified
  correct. No clobber on the coordinator merge or evidence commit.
- No EPERM ref-write flap blocked this run's ref writes; both
  registrations ran slow (~2.2 min) under sibling load and
  succeeded. Master moved once under the run (sibling B landing +
  journey r46); both arms rebased clean, zero file overlap except
  game.js (threshold vs B), resolved by clean rebase with arm diff
  verified identical.
- No back-to-back second round: both arms landed, so the fallback
  clause (second round only when every arm is killed fast) does not
  apply.

## Metric review

- Belltoad G1 wording corrected for the NEXT run (see guard caveat
  above): "death set in the class identical to control", not "all
  survive". No metric was swapped mid-run; PRIMARY and all other
  legs were judged as pre-registered.
- Threshold arm: pilot GO threshold honored — confirm ran only
  because the pilot passed; the confirm band's inertness is a
  finding (the threshold only matters where exactly-25% flees
  occur), not a reason to re-judge the pilot.
- Both arms' pre-registrations were written before their armed
  sweeps (worker evidence headers); coordinator verified the
  corpora post-merge rather than re-running verdict sweeps on new
  bases, except where noted (belltoad --analyze post-rebase and
  post-merge both GO).

scale-onramp stays converging (NOT converged): two real death
classes are now fixed in game code, but wins still come only
through courtship + seat instruments on the lesser seat, the full
seat is still unreached, and wave 5 is still 0. The directive stands
until the tracker records this axis converged on measured evidence.
Next blanks, in order: (1) belltoad candidates 2/3 (morale hold on
non-progressing tricks; strike-or-flee fallback after the 2-shout
cap) — now measurable against the fixed candidate-1 baseline;
(2) pool-presence lever for raid draft (0644Z blank 2, still
untested); (3) defender-fight wound manufacture (0644Z blank 3,
still undecided); (4) field-kill / field-save narration beat +
bought-flee awayNews tap gap (carried).
food-economy stays converging (untouched; sibling B loop).
Rotation left at 3 (convergence work does not cycle it).
Claim deleted; lock deleted. Merged locally, pending ship.
Evidence: this file (coordinator) + sim-belltoad-fix-a.md +
perseed-sim-belltoad-fix-a/ (commit 818361b41) +
sim-postflee-threshold-a.md + perseed-sim-postflee-threshold-a/
(commit d39228b3e).
