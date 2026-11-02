# sim-reopen120-b — PREREG (committed BEFORE any judged sim)

Run: oversight-flesh-out-loop-b, arm sim-reopen120-b (Loop B,
food-economy axis, run fleshout-loop-b-20261102T153648Z).
Worktree sim-reopen120-b, branch sim-reopen120-b.
Coordinator task brief, 2026-11-02. This worker does NOT push,
bump, verify live, or merge; the coordinator lands the branch.
Status to coordinator: committed on branch, pending coordinator
merge.

## Canon note (read first)

docs/CANON.md read first. No canon doc covers the veto budget
itself — it is a policy-side sim instrument, not a game system —
so no canon is invented from it here, exactly as the pilot,
1345Z confirm, and 1505Z qual arms stated. docs/MAP.md (way-home
travel pipeline) is the canon background for what a vetoed step
is: walk-home walks the same travelTo pipeline step by step, no
teleport.

## Predecessor (read-only, NOT re-judged here)

evidence/2026-11-02/sim-vetobudget-qual-b.md (1505Z, Loop B):
the veto budget is CONFIRMED GO on qualified band 67501-67512
(60d). Seed 67502 abandoned step 4,4->4,1 on day 51 (29
suppressions); route-reopen measured in-window: the baseline
twin passed the abandoned step 0 times after day 51 (27 more
vetoes, 0 passes), armed later-day hops 0, cost in-window
zero. Stated residual, never measured past the window: a
route opening after day 60 would still stay abandoned —
permanent-abandonment risk is unmeasured, not feared. This
arm measures exactly that residual. It does NOT re-judge the
budget lever (already GO-confirmed); it is a DIAG measurement
of the longer-window reopen rate.

## Question

Over a 120-day death-aware horizon on the already-qualified
band 67501-67512, does any abandoned step ever reopen at its
baseline twin — i.e. does the baseline twin PASS a step after
the armed leg abandoned it — and if so, how often, and with
what cost? A 0 reopen rate over the longer window is a
JUDGED result, not a failure, provided abandonments occur.

## Design (DIAG measurement ONLY — no game or policy change)

- Legs: guard-only ('competent-homewardstep-b') vs guard+budget
  ('competent-vetobudget-b'), identical seeds, DEPOSITGATE=0,
  same fatal env gates as the 1505Z qual arm
  (COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=0,
  packcomp * =1 flags not 1) plus the horizon gate below.
- Instrument: a derived 120d driver
  (scripts/vetobudget-reopen120-b-driver.js) with exactly one
  change vs the 60d confirm driver — the DAYS gate is 120
  (DAYS=60 fatal, DAYS=121 fatal, all other gates identical)
  — and a derived analyzer
  (scripts/analyze-vetobudget-reopen120-b.js) that judges the
  DIAG verdict below. ZERO src/js changes, ZERO policy
  changes, ZERO policy-default flips, N still 3.
- Seeds: the qualified band 67501-67512 (12 seeds). No new
  screening: the band already carries a repetition seed
  (67502) and an in-window abandonment (day 51) at 60d.
- Horizon + why: 120 loop-days maximum, DEATH-AWARE — dead
  villages stop simulating (+10d tail max), never a fixed
  200d. Why 120: it doubles the 60d window that measured
  0 passes, giving any route that reopens in the second
  60 days a full window to do so, while staying inside the
  pre-seat profile (no national/table/wins expected, so the
  wall numbers stay readable rather than censored by a
  longer arc).

## PILOT GATE (binding, before the remaining 4 seeds)

Run seeds 67501-67508 first, both legs, 120d. If the pilot
shows 0 abandonments on the armed leg, STOP and report
DIAG-NO-BAND (substrate drift — the 60d abandonment did not
survive the horizon extension) rather than burning the full
band. The pilot legs, when they pass the gate, ARE the full
band's first 8 seeds (same driver, same seeds — no re-run).

## Primary metric (binding)

Post-abandonment passes of abandoned steps: for each armed
abandonment (seed, step, abandonment loopDay), count the
baseline twin's hops for the same step on LATER loopDays
with vetoed === false (a pass), and the baseline twin's
vetoes for the step on later loopDays (still refused).
Report per seed and per abandoned step:
- passes after abandonment, vetoes after abandonment,
- reopen rate = passes / (passes + vetoes-after) where the
  denominator is > 0, else "unobserved" (never assumed),
- post-abandonment window = baseline loopDays alive after
  the abandonment day (the window in which a pass COULD
  have been observed; a village that dies the day after
  abandonment contributes a 1-day window, stated, not
  hidden),
- armed later-day hops for abandoned steps (structural:
  must be 0 — the guard was never invoked after
  abandonment; same-day armed hops reported separately,
  they may be pre-abandonment attempts).
Also reported per seed: abandonment count, suppression
count, total/silent vetoes both legs.

## Verdict rule (binding, decided up front)

- DIAG-GO (judged): >= 1 abandonment occurs on the armed
  leg AND every post-abandonment window is counted (passes
  counted, never assumed). A 0 reopen rate under this rule
  is a JUDGED result — it means no abandoned route reopened
  in 120 days — not a failure, and not a lever verdict.
- DIAG-NO-BAND (substrate drift, never GO): 0 abandonments
  on all 12 seeds (or on the pilot, per the pilot gate).
  The band no longer carries the phenomenon at this
  horizon, and no reopen rate can be judged from it.
- FAIL (instrument, not a judged result): any armed
  later-day hop for an abandoned step (structural
  violation), or any analyzer/divergence error that leaves
  a post-abandonment window uncounted. Investigate, do not
  re-score.
The analyzer exits 0 for DIAG-GO, 2 for DIAG-NO-BAND,
1 for FAIL. The verdict is a measurement verdict, not a
lever verdict: it never overturns or re-confirms the
1505Z GO.

## No-harm bars at 120d (reported, 1345Z/1505Z style)

Same bars and tolerances as the 1505Z qual arm, computed
at 120d: B1 median survival >= baseline; B2 deaths <=
baseline band-wide, no new death mode, player-flagged
deaths <= baseline reported separately; B3 failed-trip
share <= baseline + 0.05; B4 mean daily haul >= 0.95x
pooled AND every seed >= 0.50x its own baseline; B5 away
day-ends <= baseline + 2; B6 forageTrips >= 0.90x
baseline; B7 suppressions > 0 on every repetition seed;
B8 veto-created pockets = 0. Identity check (pantry +
roster, per-seed per-loopDay) reported as in the qual arm.
These bars are REPORTED, not verdict gates for this DIAG
arm: a bar failure traced to a reopen is a measured cost
of permanent abandonment, stated in the evidence, never
hidden and never re-scored away. A bar failure NOT traced
to a reopen is flagged as an investigation item.

## Balanced panel (MEASUREMENT.md §15)

Run scripts/balance-panel.js as a single combined campaign
(both policies, same seeds, 120d) as CONTEXT, never verdict,
exactly as the 1345Z/1505Z arms did; if the compare returns
INVALID by design for policy-split panels, record it as-is,
do not override it. Panel rows must NEVER be pooled with
driver bars (known panel/driver substrate divergence class
— report them separately, and note any divergence instance
for the backlog). No panel verdict is claimed either way.

## Sense-testing law

Read sayLines transcripts on the abandonment seeds and
report whether silence persists past day 60 — the
abandonment itself adds no narration by design, so the
question is whether the scholar's story past day 60 ever
mentions the abandoned route, a veto, or a reopened road,
or whether the route simply vanishes from the story. Judge
meaning and coherence, never just counts. The evidence file
carries a village assessment in plain words, wall numbers
for the judged band (national / table / wins, wave 4-5
unlocks, median survival at 120d) with the pre-seat profile
stated as expected, not a regression, blanks filled or
documented, and a metric review section.

## Census (proof, before judged sims)

- scripts/test-vetobudget-b.js re-run: 27/27 (pilot proof,
  unchanged wrapper).
- scripts/test-vetobudget-confirm-b.js re-run: 14/14
  (confirm driver + analyzer proof).
- scripts/test-vetobudget-qual-b.js re-run: 11/11 (screen
  analyzer proof).
- scripts/test-vetobudget-reopen120-b.js (new): driver env
  gate (DAYS=60 fatal, DAYS=121 fatal, DAYS=120 passes the
  gate check — gate only, no game boot), snapshot fields
  carried over, analyzer on synthetic records (child
  processes, temp files under os.tmpdir — never the repo):
  DIAG-GO case with one abandonment + baseline passes
  after (reopen rate counted, window counted) => exit 0;
  DIAG-GO zero-reopen case (abandonment, 0 passes, full
  window counted) => exit 0; DIAG-NO-BAND case (0
  abandonments) => exit 2; structural case (armed
  later-day hop) => exit 1.
Any proof failure is a loud failure: fix the instrument,
do not judge against a disagreeing instrument.

## Deliverable

Evidence file evidence/2026-11-02/sim-reopen120-b.md
(prereg header, pilot gate result, per-seed abandonment /
reopen table, no-harm bars at 120d, sense-testing notes,
village assessment in plain words, wall numbers, metric
review section), plus the 120d driver + analyzer + proof
test, all committed on branch sim-reopen120-b.
Report to coordinator: verdict (DIAG-GO / DIAG-NO-BAND /
FAIL) with the reopen rate per abandoned step, judged
numbers, proof-test counts, and commit hashes.

## Explicitly excluded

No game change, no policy change, no N change (N=3
stands), no narration added by this arm, no guard-default
flip, no re-judging the 1505Z GO. No chasing out-of-arm
gaps mid-run; they go to the findings backlog via the
evidence file.
