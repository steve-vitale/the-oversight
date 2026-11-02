# Loop B 1505Z coordinator evidence — axis food-economy (1 GO confirmed + 1 NO-GO)

Run fleshout-loop-b-20261102T1505Z, axis food-economy (second
non-converged axis; scale-onramp is Loop A's lane). Claim written
before any sims; deleted at closeout. Lock fleshout-loop-b.lock
written at run start, deleted at closeout.

Pre-flight: main tree clean at 3ac7c1010, disk 21%, reaper removed
nothing sibling-owned (all active/dirty trees correctly refused).
Sibling Loop A NOT live at run start (no fleshout-loop.lock, no live
claim); Loop A 1515Z (scale-onramp: deadid + laircontact) started
mid-run and stayed live through closeout — NOT touched. Master moved
under this run twice before landing (sibling journey landing r72
c0cf1d401, then this run's own vetobudget merge); both worker
branches rebased clean in their own worktrees onto the new tip
before merging (no rebase quirk either time). Both arm proof suites
re-run green on rebased tips AND on merged master content (see
below). Zero src/js changes in either arm.

## Arm sim-vetobudget-qual-b: GO — pilot GO now CONFIRMED on a qualified band

Commits (rebased hashes): prereg 334dec90e, results e01308f9e.
Proofs re-run green on rebased tip: vetobudget-qual 11/11,
vetobudget 27/27, vetobudget-confirm 14/14. Merged --ff-only,
verified via `git branch --merged master` before release; tree
released done-merged, branch deleted.

Step A — qualify first (the 1345Z lesson applied): band 1 of the
preregged series qualified immediately, 8 screen seeds spent, not
48. Band 67501–67508, guard-only, 60d: 40 vetoes total, 34 silent,
all on one seed. Seed 67502 carried a real repetition pattern
(step 4,4→4,1: 32 silent vetoes over 11 days); the other 7 seeds had
at most a 1-silent flicker. The band qualified via the would-abandon
gate (>=1 step at N=3) AND carried 1 repetition seed, so the confirm
analyzer's judgeability gate was also met — no repeat of the 1345Z
vacuous pass.

Step B — confirm (67501–67512, 12 seeds, guard vs guard+budget, 60d,
identical seeds, 1345Z P2/P3 bars verbatim):
- P2 (steps with silent vetoes on >3 seed-days): rep seed 11 days
  → max 2 days — PASS.
- P3 (total same-step silent vetoes >3): max 32 → max 3 — PASS.
- No-harm B1–B8: median 60d, deaths 404, player deaths 29,
  failed-trip 0.345, haul 355.2, away 27, forageTrips 1520 —
  identical at 1.00x on every bar — PASS.
- Identity (pantry + roster, 720 day-records): 0 divergences.

The kill, in detail: baseline 67502 took 1 spoken + 2 silent vetoes
on 4,4→4,1 on day 28 (one short of budget), then nothing for 23 days,
then 3 silent refusals/day on days 51–60. Armed: day 28's 2 silent
carried across the gap (the run-scoped, non-resetting counter
vindicated — a per-day budget would never have fired), day 51's
first silent was the 3rd → abandonment, 29 suppressions total, armed
step total 3 silent over 2 days. Route-reopen measured, not feared:
baseline twin passed the abandoned step 0 times after day 51 (27 more
vetoes, 0 passes), armed later-day hops 0, cost in-window zero.
Residual, stated plainly: a route opening after day 60 would still
stay abandoned — a documented residual, not an unmeasured fear.

Sense-testing: sayLines byte-identical between legs on 67502 (5,295
lines); the scholar ends every night home, fed, pantry 100k+ kcal,
foraging near home instead. Day 12 brings a real learned Static
counter; nothing robotic flagged. The one gap is the known,
prereg-excluded one: the abandonment itself is never spoken (a
later arm's narration question).

Wall (60d, in-window only): national / table / wins 0 both legs
(expected pre-seat profile); median survival 60d both; wave 4
unlocked on 1 seed (67503, both legs, unchanged), wave 5 unlocked 0,
full seat 0. No wall movement claimed.

Panel (§15, context never verdict): combined campaign, 24 cases,
per-seed rows identical between legs on all 12 seeds
(won/national/table 0). Same substrate caveat class as 1345Z (panel
survival/death counts differ from the judged driver's — this run:
67502 panel villageDeaths 41 vs driver 31; panel survival60 0 where
the driver survives 60d) — panel rows must not be pooled with
driver bars. Backlog line appended by the coordinator for this
instance (see Findings).

Verdict GO, and the worker's recommendation stands: the veto-budget
lever needs no further confirm spend. Remaining threads are new arms,
not re-runs: abandonment narration (spoken line?) and, if ever
wanted, a longer-window reopen probe.

Evidence: evidence/2026-11-02/sim-vetobudget-qual-b.md (+ prereg,
screen + confirm JSONL/logs, panel archive).

## Arm sim-homeward-shapes-b: NO-GO (DIAG-NO-CANDIDATE)

Commits (rebased hashes): prereg cda6dbeb9, results 3b2261b88.
Proofs re-run green on rebased tip: homeward-shapes 10/10,
homeward-substrate 11/11, homext 21/21, homeveto-screen 10/10.
Merged --ff-only, verified via `git branch --merged master`
before release; tree released done-merged, branch deleted.

Prototype reproduction — DIVERGES on both shapes (definitions not
re-tuned, pilot judged as preregistered):
- Shape A, seed 67105: does NOT reproduce. Stored 1345Z: shadow day
  5 walks out (4,4)→(6,4)→(7,4)→(7,2)→(7,1) all hop-time-passing,
  day-end fails days 5–9 at (7,1); armed vetoes (7,1)→(6,1) day 5 and
  (7,2)→(6,2) days 6–8, ends passing. Fresh: scholar sleeps home
  every night days 5–9 (end (4,4), day-end true), 0 homeward vetoes.
  (It does still travel far later: armed away-end days 20–27, 17
  total vetoes, 0 homeward, 2 spoken veto lines days 22–23.)
- Shape C, seed 68001 day 8: does NOT reproduce. Stored: armed starts
  (2,8), 4 homeward vetoes, originPass 4/0, ends (2,8) passing.
  Fresh: armed day 8 starts (4,3), ends (4,3) passing, 0 vetoes of
  any kind either leg.
- Divergence anatomy: days 1–2 identical (kcal 2400→2370, no hops)
  so seeding/harness agree; first divergence is 67105 day 3 (stored
  (4,4)→(4,3)→(4,4), kcal 1050; fresh (4,4)→(4,3)→(3,4)→(5,4)→(4,4),
  kcal 1010), then full chaotic separation. The only src delta
  between the 1345Z results commit (6e4ba33e9) and this branch is
  journey landing r72 (c0cf1d401: door ensureVillagerPositions +
  away-commit guard + failed-commit line surfacing); no src change
  sits between the substrate branch base and its results commit. So
  the re-routing is bounded to the r72 delta as a whole (which file
  moved the day-3 decision was not isolated — recorded as a backlog
  note, not chased). This is not a claim r72 is a bug.

Pilot bands — 0 candidate episodes, 16 seeds (30d):
- 69301–69308: base away-end days 12, armed 7, armed vetoes 63 (all
  69307), armed homeV 9 (all 69307), episodes A/C 0/0.
- 69401–69408: 0 away-end days both legs, 0 vetoes, episodes 0/0.

Primary metric (prereg): 0 episodes → NO-GO (>=2 would have been
DIAG-GO for a follow-up build; 1 would have been DIAG-ONE). No
re-scoring applied.

Near-miss 69307, named shape D (A-entry, no rescue) — non-candidate,
not re-scored: armed day 5 walks the identical 67105 walk-out
(4,4)→(6,4)→(7,4)→(7,2)→(7,1), all hop-time-passing, ends (7,1) with
day-end failing — the entry-tile E-divergence reproduces exactly.
But unlike 67105-armed, it never attempts the passing (7,1)→(7,2)
step; every step out is vetoed and it strands at (7,1) days 5–10,
kcal 0, day-end failing. So it fails the A clause requiring an armed
passing day-end — the clause is load-bearing: vetoes alone don't
rescue. (Also of note: armed day 4 outward-vetoes the (1,4)→(1,2)
approach, so the shadow's (1,1) pocket never forms; shadow's
successor then camps (5,0) days 11–14.)

E-divergence report (every pilot homeward veto): 9 vetoes total, all
69307 days 5–10, all (7,1)→(4,1)/(6,1), all originSimOk=false:
disagree 0, hop-explains-better 0, agree-fail 9, agree-pass 0. On
fresh bands hop-time E adds nothing over day-end E (both fail) — the
opposite of the prototype pattern. C-LOOSE days: 0.

Wall (30d): median survival 30d every leg; survived 8/8 every leg;
maxWave <=3 (band 1: wave 3 on 6/8 both legs; band 2: wave 3 on 3/8
both legs); wave 4–5 unlocks 0; national/table/wins 0. Panel combined
campaign on band 1: 16 cases, 0 reused, sourcesStable true,
neutrality matched, 0 warnings; survived 16/16, national/table/won 0.
No split-panel compare claimed (invalid by design).

Sense-testing: 69307-armed shows 63 vetoes but only 6 spoken lines
(day 4 x1, day 5 x5), then silence days 6–10 through a kcal-0
stranding — the carried narration question, at its sharpest. Fresh
prototype legs contain no pocket story and nothing robotic. No
rescued-trip veto line exists anywhere in this run.

Metric review (in evidence, for the next run): keep the A
armed-day-end-passing clause (69307 proves dropping it counts
stranded vetoes as candidates); budget for prototype loss
(constructed-trip substrate is now the surest route to a judged A/C
pilot); keep recording hop-time and day-end E both, since their
disagreement is itself the signal when it appears.

Evidence: evidence/2026-11-02/sim-homeward-shapes-b.md (+ prereg,
repro/pilot/panel corpora).

## Telemetry deviation check

Coordinator invocation PARSE REFUSAL on both corpora (same class as
1030Z/1135Z/1155Z/1233Z/1345Z: whole-file JSON parse vs
one-object-per-line driver rows):
- vetobudget-qual confirm-armed.jsonl: "Unexpected non-whitespace
  character after JSON at position 824363 (line 2 column 1)".
- homeward-shapes pilot1-armed.jsonl: same class, position 471779.
No LOUD deviation lines produced by the coordinator invocation;
baseline NOT rolled. Worker-reported LOUD lines (vetobudget) were
investigated in arm evidence as the winseat-regime artifact.

## Village assessment, in plain words

Twelve villages fighting constantly on the vetobudget band: 67502 is
rich with a shut door (pantry 42k→96k, stops hammering, loses
nothing); 67508 dies day 44 (pantry→0, combat/wound deaths, identical
both legs); 67510 scrapes by on 39.9 kcal/day haul with 30
mostly-combat deaths and still survives. On the homeward bands, the
villages mostly stay home — the far-travel substrate that made the
1345Z shapes visible has moved under r72, and the one scholar who
does walk out (69307) gets fenced in by the very guard meant to
bring her home, starving in silence. The veto budget, by contrast,
does exactly what its card says on a band where repetition actually
happens: it stops the hammering, costs nothing in-window, and the
village is otherwise untouched (byte-identical speech, identical
pantries and rosters day by day).

## Infrastructure

- Registry-lock queue delayed registrations and heartbeats
  throughout (reap ~2 min, registrations ~2.5 min, heartbeats
  ~7 min) — contention only, no loss.
- Safe-commit index clobber hit worker commits on both arms
  (staged-deletion variant); workers repaired via HEAD-blob
  cacheinfo, commits verified correct, worktrees clean.
- Coordinator lesson restated and followed: the merge command's exit
  line is not verification — `git branch --merged master` naming the
  branch is, and release happens after that check, never in the same
  chain as the merge.
- check.js --quick NOT re-run by the coordinator (zero src/js in
  either arm; arm proofs green on merged master; prior runs' hanging
  -under-load class noted, not re-proven).
- Main tree clean at closeout (3b2261b88). No stray trees of this
  run remain; Loop A trees (deadid, laircontact) active, untouched.

## Findings appended (coordinator)

4 lines appended to hidden_files/sim-findings.md (worker-supplied,
not chased): panel-vs-driver instance on 67502; shape D named;
r72 re-routes stored prototypes; silent-repetition narration
sharpening.

food-economy stays converging (NOT converged): the veto budget is
now CONFIRMED on a qualified band (no further confirm spend owed),
while the homeward extension is still unjudged (prototypes lost to a
substrate move, pilot empty, shapes A/C still unnamed in judged
form except as the shape-D near-miss) — and no guard default has
flipped. scale-onramp untouched (sibling Loop A lane).
Next blanks, in order: (1) abandonment narration (spoken line?)
and, if ever wanted, a longer-window reopen probe — new arms, not
re-runs; (2) homeward A/C judged pilot via a constructed-trip
substrate (prototype loss budgeted) + shape D design question
(Steve-call: should the guard offer an escape when it can only say
no), A clause kept; (3) panel/driver substrate divergence isolation
(backlog, now with a second instance); (4) Haven-breach intent
(steve-call candidate) + place-in-record design question; (5)
60501-shape roadwork-credit band (still owed); (6) guard +
return-capability pairing OR a second veto-budget shape, decided up
front; (7) sensor non-pantry collapse signal; (8) gatediseng confirm
band 76701-76712; (9) pantry-cap-as-garden-bottleneck (74007); (10)
standing-load remainder; (11) pack-full refusal narration; (12)
HUNGER WINTER relief passivity (steve-call candidate); (13) shelling
default-flip call; (14) P3 reset follow-ups; (15) patrol-departure
narration; (16) garden/fish/traps early path; (17) creek clearance
wood-bound (evening wood-carrying first; Loop A creekwood arm landed
this cycle — read it before re-screening); (18) rubble
daytime-clearing habit; (19) washed_out scramble narration; (20)
96-tick bridge edge; (21) 120d window only on a new horizon-cut
episode.
1345Z blank 1 (vetobudget confirm) is now ANSWERED as GO-confirmed;
1345Z blank 2 (homeward shapes A/C) is now ANSWERED as
DIAG-NO-CANDIDATE with prototypes non-reproducing and shape D named.
Claim deleted; lock deleted.
Merged locally, pending ship (both arms: GO + NO-GO).
