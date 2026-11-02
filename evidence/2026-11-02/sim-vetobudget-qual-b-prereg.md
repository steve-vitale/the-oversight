# sim-vetobudget-qual-b — PREREG (committed BEFORE any judged sim)

Run: oversight-flesh-out-loop-b, arm sim-vetobudget-qual-b (Loop B,
food-economy axis, run fleshout-loop-b-20261102T1505Z).
Worktree sim-vetobudget-qual-b, branch sim-vetobudget-qual-b.
Coordinator task brief, 2026-11-02. This worker does NOT push, bump,
verify live, merge, or rebase; the coordinator lands the branch.
Status to coordinator: committed on branch, pending coordinator merge.

## Canon note (read first)

docs/CANON.md read first. No canon doc covers the pocket guard or
the veto budget themselves — both are policy-side sim
instruments, not game systems — so no canon is invented from
them here, exactly as the pilot and the 1345Z confirm stated.
docs/MAP.md (way-home travel pipeline) is the canon background
for what a vetoed step is: walk-home walks the same travelTo
pipeline step by step, no teleport.

## Predecessor (read-only, NOT re-judged here)

evidence/2026-11-02/sim-vetobudget-confirm-b.md (1345Z, Loop B):
the pilot GO (band 62801-62808, 30d — two repetition seeds,
budget killed both patterns with zero harm) stands UNCONFIRMED
because the 1345Z confirm spent itself on an unqualified fresh
band (66001-66016, 60d: baseline vetoes 3 total, all on one
seed, 0 repetition seeds, so 0 abandonments, 0 suppressions,
P2/P3 passed vacuously). This run does NOT repeat that spend:
it qualifies FIRST with a guard-only screen, and runs the
armed leg ONLY on a qualified band.

## Question

Can a fresh band carrying real veto repetition be found within
a guard-only screening budget, and — only then — does the
3-silent-vetoes-per-expedition budget still eliminate
same-step silent-veto repetition on that band over 60 days,
with the P2/P3 primary bars reused VERBATIM from the 1345Z
confirm, and with route-reopen measured where abandonment
actually happens?

## Step A — QUALIFY FIRST (guard-only screen)

Screen fresh bands, 8 seeds each, guard-only policy
('competent-homewardstep-b' via scripts/vetobudget-confirm-b-driver.js,
DAYS=60, same fatal env gates as the 1345Z confirm:
COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=0,
packcomp * =1 flags not 1), up to 6 bands (48 seeds) maximum
screening budget. Bands screened in order; screening STOPS at
the first qualifying band; every screened band and its veto
counts are recorded in the evidence file either way.

Screen series (verified fresh before writing this prereg by
grepping evidence/2026-11-02/*.md for each band start and for
every seed in the 675xx/676xx/678xx/679xx/693xx/694xx ranges —
zero mentions):
1. 67501-67508
2. 67601-67608
3. 67801-67808
4. 67901-67908
5. 69301-69308
6. 69401-69408

### Definitions (1345Z arm's, verbatim in effect)

- Silent veto: a hop-log entry with vetoed && silent, grouped
  by from->to step key and loopDay (same grouping as the
  1345Z analyzer).
- Repetition seed: a seed where some step accumulates >= 6
  total silent vetoes at baseline OR same-step silent vetoes
  on >= 4 distinct days.
- Would-abandon step (screen observable for "abandonment"):
  a step with >= 3 total silent vetoes at baseline — the
  budget's N=3 trigger. Actual abandonments CANNOT occur on
  a guard-only leg (the budget is not armed); would-abandon
  is the honest screen translation of the brief's ">= 1
  abandonment", stated here so the evidence never claims an
  abandonment the screen could not observe.
- Secondary column (brief's parenthetical): seeds with >= 2
  total vetoes of any kind are tabulated, but do NOT qualify
  a band on their own.

### QUALIFICATION RULE (brief-literal, binding)

A band QUALIFIES iff repetitionSeeds >= 2 OR wouldAbandonSteps
>= 1. If NO band qualifies within the 6-band budget, the
verdict is DIAG-NO-BAND: commit the screen evidence, stop,
do NOT run a confirm. The screen analyzer
(scripts/analyze-vetobudget-qual-b.js) prints QUALIFIED /
NOT-QUALIFIED per band; its verdict is in the text, never
the exit code.

## Step B — CONFIRM ONLY IF QUALIFIED

12 seeds: the qualifying band's 8 screened seeds PLUS the
next 4 seeds of the same band start (e.g. band 67501-67508
confirms on 67501-67512), guard vs guard+budget, identical
seeds, 60d horizon, same substrate and fatal env gates as
Step A. The 8 screened seeds' guard-only JSONL is REUSED as
the confirm baseline leg (it is the same policy, horizon,
and driver — re-running it would burn seeds for no new
information); the 4 extension seeds are run fresh on both
legs, and the armed leg is run fresh on all 12 seeds.
Primary bars P2/P3 VERBATIM from the 1345Z confirm prereg:

- P2: no step accumulates silent vetoes on more than 3
  distinct seed-days anywhere on the band (armed leg).
- P3: total same-step silent vetoes <= 3 on every step,
  every seed (armed leg).
- GO requires P2 AND P3 (the 1345Z primary, conjunction).
  P1 is REPORT ONLY (per the 1345Z metric review, P1 is
  redundant given P3 and is dropped as a bar, not merely
  reported — a correction adopted from that review, not a
  mid-run re-score: P1 still appears in the numbers table
  for continuity).

No-harm bars (1345Z, binding, same tolerances): B1 median
survival >= baseline; B2 deaths <= baseline band-wide, no
new death mode, player-flagged deaths <= baseline reported
separately; B3 failed-trip share <= baseline + 0.05; B4 mean
daily haul >= 0.95x pooled AND every seed >= 0.50x its own
baseline; B5 away day-ends <= baseline + 2; B6 forageTrips
>= 0.90x baseline; B7 suppressions > 0 on every repetition
seed; B8 veto-created pockets = 0. Route-reopen, where
abandonment actually happens: (a) structural — armed
post-abandonment hop-log entries for abandoned steps = 0;
(b) cost — abandoned steps whose baseline twin later PASSES
the step (vetoed === false hop on a later loopDay),
reported per step with any haul/away/survival/death
divergence tracing to it; verdict rule as 1345Z (if (b) > 0
AND any no-harm bar fails because of it => NO-GO; if (b) > 0
but all bars pass, the verdict stands on the bars and (b)
is a measured cost, never hidden).

Judgeability note (stated now, not a new gate): the 1345Z
analyzer returns DIAG when the band carries 0 repetition
seeds. A band qualifying ONLY via would-abandon with 0
repetition seeds would therefore still return DIAG from
the confirm analyzer — the evidence will say so plainly
rather than calling it a GO, and the qualification table
will show which gate each band passed through.

## Balanced panel (MEASUREMENT.md §15)

For Step B only (Step A is a single-policy screen, no
before/after to compare): run scripts/balance-panel.js as a
single combined campaign (both policies, same seeds/days)
as CONTEXT, never verdict, exactly as the 1345Z confirm
did; if the compare returns INVALID by design for
policy-split panels, record it as-is, do not override it.
The panel cannot express the guard+budget policy stack as
named registry policies beyond the combined campaign, and
no panel verdict is claimed either way.

## Sense-testing law

Read sayLines transcripts on the repetition / abandonment
seeds and day-end positions/kcal; judge meaning and
coherence, never just counts. The evidence file carries a
village assessment in plain words, wall numbers for the
judged band (national / table / wins, wave 4-5 unlocks,
median survival) with the 60d pre-seat profile stated as
expected, not a regression, blanks filled or documented,
and a metric review section.

## Census (proof, before judged sims)

- scripts/test-vetobudget-b.js re-run: 27/27 (pilot proof,
  unchanged wrapper).
- scripts/test-vetobudget-confirm-b.js re-run: 14/14
  (confirm driver + analyzer proof).
- scripts/test-vetobudget-qual-b.js (new): 11/11 — screen
  analyzer on synthetic records (repetition definition
  both branches, would-abandon boundary, flicker
  non-qualification, spoken-veto exclusion, step-key
  independence, band rule all three cases, CLI rejection
  of a non-guard leg).
Any proof failure is a loud failure: fix the instrument,
do not judge against a disagreeing instrument.

## Deliverable

Evidence file evidence/2026-11-02/sim-vetobudget-qual-b.md
(prereg header, screen table for every screened band, and
if qualified: confirm numbers before/after, veto-budget
verdict, village assessment in plain words, wall numbers,
metric review section), plus the screen analyzer + proof
test, all committed on branch sim-vetobudget-qual-b.
Report to coordinator: verdict (GO / NO-GO / DIAG-NO-BAND /
DIAG) with the qualified band or the screen table, judged
numbers, proof-test counts, and commit hashes.

## Explicitly excluded

No finish lever, no guard-default flip, no N change (N=3
stands), no narration added by this arm. No confirm spend
on an unqualified band. No chasing out-of-arm gaps mid-run;
they go to the findings backlog via the evidence file.
