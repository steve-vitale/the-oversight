# Loop B round 0730Z — coordinator evidence (PARTIAL: endpos LANDED, h56 IN PROGRESS)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T0730Z,
axis food-economy (second axis; Loop A live on scale-onramp the whole
run so far, 0715Z claim: trajband + rd5daily, NOT touched). This file
records the endpos arm only. The h56 arm's coordinator closeout (merge
or block disposition, tracker review, claim/lock deletion) follows when
the h56 worker completes; this run's claim file and B lock stay in place
until then.

## Arm sim-endpos-b — GO, DIAG only, MERGED LOCALLY (pending ship)

Worker branch sim-endpos-b, merged --ff-only into master at
0f5822d7a (worker commits 19cd414a5 prereg, adbdc3475 analyzer +
proof 27/27 + census + evidence, 0f5822d7a EPERM-count correction).
Proof re-run by the coordinator on merged master: scripts/test-endpos-b.js
27/27 green. Diff guard clean: only 8 new files (prereg, evidence,
pooled census, 3 day dumps, new analyzer, new proof test); zero src/js,
zero edits to any existing script or policy file.

Verdict GO, judged exactly against the prereg's four bars (all met, no
re-scoring, fallback not invoked): instrument gate clean (240/240 legs
errs 0, 0 surprises, 0 haven-coordinate violations, totals reconcile);
tables on 7,178 evenings across 2 stacks (nighttravel 3,589 +
creekseek 3,589); dominant mechanism CREEK-BLOCKED 107/240 = 44.6% of
away d>=4 evenings (bar >= 30%); proof 27/27 + re-readable census.

Finding (0630Z closeout blank (1), FILLED): days almost never end far
from home at all — 6,860/7,178 evenings (95.6%) end at haven inside,
20 (0.3%) at haven outside, only 298 (4.2%) away: 58 within 3 tiles,
183 at 4-5, 57 at 6+. The far tail is 240 evenings at d>=4 (3.3%),
explained 87.9% by CREEK-BLOCKED 107 (44.6%) + CAMPED 104 (43.3%);
OUT-AND-NOT-BACK is only 24 (10.0%); ROAD 0, OTHER 0. The offer
table's mystery dissolves: Band A evenings are rare because AWAY
evenings are rare, and away evenings are rare because the daytime
itinerary brings the villager home or keeps her camped — not because
days routinely strand her far out. Per-stack contrast: creekseek
manufactures more far evenings than P1 (134 vs 106) and more
creek-blocked ones (65 vs 42), because the pre-step creek visit moves
the departure onto creek tiles where the crossing refusal strands it.
Day-bucket trend: far endings decline across the window (4.8% ->
3.5% -> 1.7%); H-OUT is a late-window class (18/20 in days 21-30).
Sense test PASS with the stuck-day silence stated (17588 day 26: one
blockage line x3, nothing else; silent offer-no night). Reachability
NOT re-measured by this per-evening census (offerygeo/awayeve numbers
stand); what it adds: the evening step's 3-tile net is almost never
the binding constraint in practice — future "why don't villagers come
home" work should start with creek crossings and camp placement, not
the offer radius (widening to d=4-5 would touch at most the 240 far
evenings, 211 of which are creek-blocked or camped days whose problem
is not distance). Full numbers, sense reads, village assessment, and
metric review: evidence/2026-11-01/sim-endpos-b.md.

Wall numbers (report-only, from these pre-seat legs): maxWaveUnlocked
wave 1: 47, wave 2: 177, wave 3: 16, wave 4: 0, wave 5: 0; endReason
survived 234, village-lost 6. Wall UNCHANGED (not measured by this
census): full seat 0 / wave 5 reached 0 stand as last measured
(Loop A lane; 0615Z recheck: won 1/8 lesser, national ever 5/8, table
3/8, wave 4 7/8, wave 5 0/8).

Telemetry deviation check on the endpos pooled census: 3 LOUD lines
(national 12 -> 0, table 16 -> 0, wins 16 -> 0), investigated as the
known missing-field artifact (a pre-seat evening census carries no
national/table/wins/exiled fields); baseline NOT rolled.

## Arm sim-h56-b — IN PROGRESS (not yet judged)

The 0630Z closeout blank (6), H5/H6 refusal cells still UNRUN: H5 =
17741-17748, H6 = 17751-17758, BARE 30d per the gate2hunt prereg.
Registration was blocked for ~1h40m by the container EPERM write flap
(see Infrastructure); the tree registered in the same down-gap as the
endpos merge, and the worker is now running. Its verdict, merge, and
disposition will be recorded in the final closeout for this run.
Nothing about h56 is claimed here.

## Infrastructure (this run)

- Container EPERM write flap, longest episode in the record: first hit
  ~07:31Z (worktree checkout writes), still up at 08:52Z probes (all of
  /tmp, .git/worktrees, worktrees dir, repo root failed), with one
  down-window ~08:20-08:21Z (endpos worker's commits) and a second
  down-gap ~09:15Z+ in which the endpos merge, heartbeat, proof re-run,
  and h56 registration all succeeded. ~40 registration/merge attempts
  failed across the episode; no .git ref was ever written by hand, no
  force used, no sibling tree touched.
- Worktree registration is the flap's hardest surface: a 66,729-file
  checkout needs a fully flap-free window, while single-file writes
  (worker commits, heartbeat) succeed in brief gaps. Future runs
  hitting this should space registration retries widely (5 min) and
  keep a tight merge-retry loop ready for the first gap.
- Safe-commit index clobber: NOT hit on the coordinator side this run
  (worker commits verified correct via git show --stat; coordinator
  evidence commit below verified the same way).
- Main tree clean at closeout of this partial record except the
  coordinator evidence file itself, committed below. No push, no bump:
  merged locally, pending ship (ship loop owns deploys).

## Next blanks (carried, in order)

(1) daytime end-position distribution — FILLED by sim-endpos-b (above).
(6) H5/H6 refusal cells — IN PROGRESS (sim-h56-b worker running).
Remaining 0630Z blanks carried unchanged: (2) intermediate-block
clearing in the evening step (design question); (3) HUNGER WINTER
relief passivity (steve-call candidate); (4) P3 reset follow-ups —
meal-loop gave vs pantry-walk discrepancy code read, night-22 +3,005
bridge decomposition, double endDays on vessel-death days; (5)
supply-leg lever on fresh seeds; (7) patrol-departure narration;
(8) a 120d window only if a new horizon-cut episode appears.
Plus endpos metric-review carried doubts: H-OUT late-window
concentration (20 rows); bridge/swim acquisition timing as the
creek-block lever; whether camped stretches end by choice or by
depletion (17549 days 9-12 arc suggests depletion, one arc is not a
rate).

Merged locally, pending ship. Tracker review + claim/lock deletion
follow at the h56 closeout.
