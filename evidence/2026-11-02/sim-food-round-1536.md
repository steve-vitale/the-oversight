# Loop B 1536Z coordinator evidence — axis food-economy (1 GO pilot + 1 DIAG-GO)

Run fleshout-loop-b-20261102T153648Z, axis food-economy (second
non-converged axis; scale-onramp is Loop A's lane). Claim written
before any sims; retired to .DEAD at closeout; lock deleted.
Pre-flight: main tree clean at c9b20ac2a, disk 23%, reaper removed
nothing sibling-owned. Loop A 1515Z (scale-onramp: deadid +
laircontact) live at run start and through most of the run — NOT
touched; it closed out mid-run (coordinator evidence ebfa42826)
and a new Loop A tree (sim-heralddepart-a) appeared at closeout —
NOT touched. Master moved under this run repeatedly before landing
(journey r111 846b099f0, build landings through 29aab51d4, Loop A
deadid d7fa67ee6, Loop A closeout ebfa42826); both worker branches
rebased clean onto the current tip before merging (no rebase quirk
either time). Both arm proof suites re-run green on merged master
(see below). Zero src/js changes in either arm.

## Arm sim-abandonspeak-b: GO (pilot, no confirm owed)

Commits: prereg d0f9c3177 (before any judged sim), results
965b46743 [needs-eyes] (player-visible line). Merged --ff-only,
verified via `git branch --merged master` before release; tree
released done-merged, branch deleted. Proofs re-run green on merged
master: abandonspeak 15/15, vetobudget 27/27, vetobudget-qual 11/11,
vetobudget-confirm 14/14.

What was built: in scripts/policies/competent-vetobudget-b.js only
(+22/-2 lines), at the single site where a step is marked
abandoned, the budget now calls Game.say once: "You stop trying
that way — it has turned you back again and again, and you will not
spend another day on a road that will not open." N stays 3, no guard
default flipped, no new guard behavior, suppressions stay silent,
say call try/catch-wrapped. The budget is policy-side, but Game.say
is the game's own narration hook — the same hook the guard uses for
its veto line — so this is the speakable form, not a harness print.
If the budget ever ports into src/js, the call site ports verbatim.

Pilot band 67501–67508, 60d death-aware, identical seeds,
fresh-baseline vs narration leg:
- Primary: 1/1 abandonment events spoken = 100% — seed 67505, step
  1,3→1,2, day 15 (3 silent vetoes days 13–15 after a spoken first
  veto day 9; line at say seq 1347, day-matched; day 16 brings one
  silent suppression, no second line).
- No-harm, all 1.000x: median survival 60→60d, deaths 269→269, mean
  daily haul 1879.7→1879.7, away 26→26, forageTrips 943→943.
- SayLines diff confined on all 8 seeds: narration sequence =
  baseline sequence + only the one abandonment line (67505:
  5532→5533 lines; all other seeds byte-identical counts).
- Identity: 0 divergent per-seed per-loopDay snapshots (pos, kcal,
  pantry, roster) on all seeds.
- Wall (in-window only): national/table/wins 0 both legs; median
  survival 60d; wave 4 on 67501 both legs; wave 5 unlocked/fought 0;
  full seat 0. No wall movement claimed.
- Panel (context only, never pooled): combined campaign 16 cases,
  per-seed rows identical between legs; same known panel/driver
  death-count divergence class (67501: panel 36 vs driver 44).

One prereg deviation, thresholds unchanged: the prereg's reused
1505Z baseline leg did NOT reproduce on this tip — day-1 pantry
divergence (67501: 38,630→39,540) before any veto could occur, and
67501 has zero abandonments on either leg yet still diverges,
proving substrate, not narration. The worker replaced it with a
fresh baseline leg on the current tree (policy stashed to pristine,
same driver/env/seeds); all judged numbers above are fresh-baseline
vs narration. The 1505Z leg contributes no judged number. Lesson
for future preregs: default to fresh both legs when the baseline
predates a branch rebase, and check day-1 identity first. Backlog
line appended.

Sense-testing: the line reads as a decision, not a rescue — the
scholar stays away day 16 on 13 kcal and walks home day 17 while
the pantry climbs; it names the repeated refusal and the choice to
stop, in the guard veto line's second-person voice, with no
mechanism words or coordinates. Per the prereg, no confirm owed:
the pilot band already carries the judged abandonment and the
effect is one inserted line with zero trajectory change; a confirm
would re-prove identity, not narration. The extra screening band
(67601–67608) was not spent.

Evidence: evidence/2026-11-02/sim-abandonspeak-b.md (+ prereg,
pilot JSONL/logs, panel archive).

## Arm sim-reopen120-b: DIAG-GO (0 reopens in 120 days)

Commits: prereg 32612a28a (before any judged sim), instruments
8c77a5282, results 203e85300. Merged --ff-only, verified via `git
branch --merged master` before release; tree released done-merged,
branch deleted. Proofs re-run green on merged master: reopen120
15/15, vetobudget 27/27, vetobudget-confirm 14/14, vetobudget-qual
11/11. Zero src/js changes, zero policy changes, N still 3.

Qualified band 67501–67512, guard-only vs guard+budget, 120d
death-aware, identical seeds:
- Abandonments: 67502 day 88 (step 4,4→4,1, 17 suppressions) and
  67505 day 15 (step 1,3→1,2, 1 suppression); other 10 seeds 0.
- Post-abandonment: 67502 — 0 passes, 15 vetoes after (3/day days
  89–92, plus day 111), 32-day window, rate 0 (strong row). 67505 —
  0 passes, 1 veto after (day 16, then no further attempts),
  105-day window, rate 0 (thin row — the route stopped presenting,
  so report it as 0 passes in 16 observations, not 0 passes in 137
  days of hammering). Band reopen rate 0.
- No-harm bars all pass at exactly 1.00x: median survival 120d
  both, deaths 635 = 635 (player-flagged 93 = 93, identical modes),
  failed-trip share 0.363 = 0.363, mean daily haul 338.4 = 338.4,
  away day-ends 53 = 53, forageTrips 2469 = 2469, 0 veto-created
  pockets, 0 divergent day-records (pantry + roster, 1440
  compared), 0 armed later-day hops for abandoned steps.
- Wall (120d, in-window only): national/table/wins 0 both legs;
  median survival 120d; wave 4 unlocked on 8 seeds both legs, wave
  5 unlocked 0, full seat 0. No wall movement claimed.
- Sense-testing: sayLines byte-identical between legs on both
  abandonment seeds (67502: 10559 lines each; 67505: 11232 each).
  Silence persists past day 60 — the keyword-matching lines past
  day 60 are all generic road flavor; the abandoned routes simply
  vanish from the story. The day-120 silent veto on 67505 is a
  different step (4,1→5,0), identical on both legs, not a reopen.
- Panel (context only, never pooled): combined campaign 24 cases,
  per-seed rows identical between legs on 11/12 seeds; 67502 differs
  (villageDeaths 58 base vs 60 armed) on the panel substrate only —
  judged driver deaths there are 69 = 69. Panel survival also
  diverges from the driver (loses 67501 day 74 / 67509 day 95 /
  67511 day 66 where the driver survives 120d; keeps 67512 to day
  118 where the driver loses it day 84). Panel rows were not pooled
  with driver bars. Telemetry LOUD lines (national/table/wins
  disappeared) are the documented winseat-regime artifact,
  investigated, not a deviation; exiled 0, no LOUD line.

Substrate drift — important, not a verdict change: this run is NOT
a horizon extension of the 60d run. Day-1 start snapshots match the
60d confirm, but day-1 end pantry already differs by 630 kcal
(41710 vs 42340 on 67502-armed), and the veto pattern moved (days
28/51 → 87/88). The only src/js change between the 1505Z qual
results and this branch's base is journey-crisis r111
(membership.js dead-identity fix), so the re-routing is bounded to
the r111 delta as a whole (line not isolated, not chased). The 60d
day-51 abandonment no longer exists on current master; this run's
abandonments are fresh on current master, and the 120d measurement
stands on its own two legs. Future horizon comparisons must
re-baseline after landings — and the day-1 pantry check is a cheap
drift detector worth keeping. Backlog lines appended (panel
instance + drift instance).

Recommendation (worker's, kept): the longer-window reopen question
is answered for abandonment shapes that keep presenting (67502's).
No further reopen spend is owed unless a new abandonment shape
appears. The remaining thread on this line is narration — the
silence past day 60 is now measured on two bands, not just
asserted. Note for the next run: the abandonspeak arm speaks at
abandonment only; suppressions stay silent by design, so the
post-abandonment silence the reopen arm measured is the expected
shape of that design, not a contradiction.

Evidence: evidence/2026-11-02/sim-reopen120-b.md (+ prereg,
pilot/extension/full-band JSONL/logs, panel archive).

## Telemetry deviation check

Coordinator invocation PARSE REFUSAL on the reopen corpus (same
whole-file-JSON vs one-object-per-line class as prior runs):
sim-reopen120-b-armed.jsonl, "Unexpected non-whitespace character
after JSON at position 1474151 (line 2 column 1)". No LOUD
deviation lines, baseline NOT rolled.

## Village assessment, in plain words

Two bands of villages, same story told twice. On the 60d pilot the
villages are steady — one scholar on 67505 hammers a shut road for
a week, then says out loud that she is done with it, and the
village carries on exactly as before: same food, same deaths, same
nights home, one new honest sentence. On the 120d band the villages
live a full season and the shut roads simply disappear from their
lives: one road is refused fifteen more times after it is given up
on, the other is never tried again, and neither ever opens. Nothing
in either band reaches national, the table, or a win — that wall
was never this run's question, and it did not move. The blanks
filled: abandonment now has a voice, and permanent abandonment now
has a measured price over four months, which is zero in-window and
zero in the longer window on the shapes that keep presenting.

## Infrastructure

- Registry-lock queue delayed registrations/heartbeats throughout
  (registrations ~5 min each, one heartbeat ~10 min) — contention
  only, no loss.
- Safe-commit index clobber (staged-deletion variant) hit the
  abandonspeak worker's commits; repaired via HEAD-blob cacheinfo,
  commits verified correct, worktrees clean.
- Merge verification followed the 1505Z lesson: `git branch
  --merged master` naming the branch is the check, and release
  happens after that check, never in the same chain as the merge.
- check.js --quick NOT re-run (zero src/js in either arm; arm proofs
  green on merged master).
- Origin/master verified as an ancestor of local master after
  merging (no divergence, no stale-base risk). Main tree clean at
  closeout (203e85300). No stray trees of this run remain; Loop A
  trees active at closeout, untouched.

## Findings appended (coordinator)

3 lines appended to hidden_files/sim-findings.md (worker-supplied,
not chased): reused-baseline substrate non-reproduction; 120d
panel-vs-driver instance; r111 substrate drift instance.

food-economy stays converging (NOT converged): 1505Z blank 1 is now
ANSWERED on both halves — abandonment narration is GO (one spoken
line, zero trajectory change) and the longer-window reopen probe is
DIAG-GO (0 reopens in 120d, 16 observations) — and no guard default
has flipped. scale-onramp untouched (sibling Loop A lane).
Next blanks, in order: (1) homeward A/C judged pilot via a
constructed-trip substrate (prototype loss budgeted) + shape D
design question (Steve-call: should the guard offer an escape when
it can only say no), A clause kept; (2) panel/driver substrate
divergence isolation (backlog, now with 120d + 60d instances);
(3) Haven-breach intent (steve-call candidate) + place-in-record
design question; (4) 60501-shape roadwork-credit band (still owed);
(5) guard + return-capability pairing OR a second veto-budget shape,
decided up front; (6) sensor non-pantry collapse signal;
(7) gatediseng confirm band 76701-76712; (8) pantry-cap-as-garden-
bottleneck (74007); (9) standing-load remainder; (10) pack-full
refusal narration; (11) HUNGER WINTER relief passivity (steve-call
candidate); (12) shelling default-flip call; (13) P3 reset
follow-ups; (14) patrol-departure narration; (15) garden/fish/traps
early path; (16) creek clearance wood-bound (evening wood-carrying
first; Loop A creekwood arm landed this cycle — read it before
re-screening); (17) rubble daytime-clearing habit; (18) washed_out
scramble narration; (19) 96-tick bridge edge; (20) 120d window only
on a new horizon-cut episode. Standing prereg guidance from this
run: fresh both legs after any landing, day-1 pantry identity check
first, bands re-qualified on current master rather than reused.
Claim retired to .DEAD; lock deleted.
Merged locally, pending ship (both arms: GO + DIAG-GO).
