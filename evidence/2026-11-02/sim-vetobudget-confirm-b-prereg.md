# sim-vetobudget-confirm-b — PREREG (committed BEFORE any judged sim)

Run: oversight-flesh-out-loop-b, arm sim-vetobudget-confirm-b (Loop B,
food-economy axis, run fleshout-loop-b-20261102T1345Z).
Worktree sim-vetobudget-confirm-b, branch sim-vetobudget-confirm-b.
Coordinator task brief, 2026-11-02. This worker does NOT push, bump,
verify live, merge, or rebase; the coordinator lands the branch.
Status to coordinator: committed on branch, pending coordinator merge.

## Canon note (read first)

docs/CANON.md read first, then docs/MAP.md (way-home travel pipeline:
home board, beyond tiles, one continuous map; walk-home walks the
same travelTo pipeline step by step, no teleport). No canon doc
covers the pocket guard itself — it is a policy-side sim
instrument, not a game system — so no canon is invented from it
here, exactly as the pilot stated. The veto budget is likewise a
policy-side instrument wrapping that guard, not a game system.

## Predecessor (read-only, NOT re-judged here)

evidence/2026-11-02/sim-vetobudget-b.md (pilot, 1233Z, band
62801-62808, 30d): PILOT GO. N = 3 silent vetoes per expedition,
run-scoped permanent abandonment. Two repetition seeds (62807:
17 silent / 6 days; 62808: 65 silent / 22 days); armed legs
killed both patterns (max 3 total silent per step, 2 days max)
with every no-harm bar at 1.00x. The pilot's metric review
names the two debts this confirm pays: (1) P1 (per-day <= 3)
is weak because baseline per-day was already 3, so P2+P3 must
carry the verdict; (2) the analyzer's identity check covered
day snapshots + forage counts only, so this confirm adds
pantry + roster snapshots; (3) the reopened-route risk was
untested (nothing reopened on the pilot band) — this confirm
measures it on a longer horizon.

## Question

Does the 3-silent-vetoes-per-expedition budget, on a FRESH
16-seed band over a LONGER 60-day horizon, still eliminate
same-step silent-veto repetition on every repetition seed,
without harm — and what does permanent abandonment cost when
a budgeted route later reopens?

## Confirm design (decided up front, before any judged sim)

### Band (fresh, verified before choosing)

16 seeds: 66001-66016. Verified fresh by grepping
evidence/2026-11-02/ before writing this prereg: no mention
of any 660xx seed; not 62801-62808 (pilot band); not any band
start named in today's evidence and not the homeveto prereg's
banned bands (62001-62016, 61901-61916, 62301, 62401, 62501,
62601, 62701 starts) nor its screened series 64001-64701.
If this band carries NO repetition seed at baseline, the
primary is unjudgeable and the verdict is DIAG (never a GO
on an unjudgeable primary) — the analyzer exits 2 in that
case, exactly as the pilot analyzer did.

### Horizon (death-aware, never a fixed 200d)

60 loop-days max per seed. Dead villages stop simulating:
the driver's runDays loop breaks on Game.over, so no
loop-day is simulated after death (tail = at most the
in-progress day completing, well under the +10d tail cap).
Horizon reason: the pilot's repetition window was days 9-30;
60 days doubles the window so a budgeted route has real
time to reopen (rubble cleared, ground changed) and so
late-window repetition (days 31-60) is also judged. The
60d pre-seat profile (national / table / wins 0) is
expected, not a regression — same reasoning as the pilot's
30d profile, one window longer.

### Substrate (identical to the pilot)

Competent lineage; DEPOSITGATE=0, COMPETENT_FEAST=0,
SEATDRIVE=0, PLENTYDEPRI=0, and the packcomp * =1 flags
must NOT be 1 (same fatal env gate as the pilot driver).
Identical seeds both legs; fresh runs both legs with this
run's own confirm driver — NO reuse of the pilot's JSONL.

### Legs

- BASELINE leg: 'competent-homewardstep-b' (guard only —
  the leg that SHOWED the repetition).
- BUDGETED leg: 'competent-vetobudget-b' (guard + budget).
A plain-competent leg would show zero vetoes by construction
(no guard) and cannot be the repetition baseline.

### Instrument change vs the pilot (minimal, stated now)

The pilot driver hardcodes DAYS=30 (fatal if DAYS != 30),
so a 60-day confirm CANNOT run on it unchanged. The confirm
therefore uses a NEW driver file,
scripts/vetobudget-confirm-b-driver.js, derived from the
pilot driver with exactly two changes: (a) the horizon is
the DAYS env value with the fatal gate requiring DAYS=60
for this confirm (all other fatal env gates identical);
(b) the day snapshot gains pantry + roster fields (see
"Stronger identity check" below). ZERO changes to the
policies (competent-vetobudget-b.js, competent-homewardstep-b.js
read-only), ZERO src/js changes, ZERO policy-default flips,
ZERO changes to the guard's counting or the budget's N=3.
The new driver ships with its own proof test
(scripts/test-vetobudget-confirm-b.js) covering the env
gate, the snapshot fields, and the analyzer's new
route-reopen + identity computations on synthetic driver
records (no game boot needed for those checks). The pilot
proof test (scripts/test-vetobudget-b.js, 27/27) is re-run
before any judged sim.

### Definitions (kept from the pilot unless stated)

- Away day-end: post-daily snapshot position != haven tile.
- Failed-trip day: >= 1 forage attempt, 0 successes.
- Mean daily haul: band mean of seed mean-daily forage kcal
  (pilot analyzer valuation, unchanged).
- Repetition seed (baseline): a seed where some step
  accumulates >= 6 total silent vetoes at baseline OR
  same-step silent vetoes on >= 4 distinct days.
- Same-step silent vetoes per seed-day: from the driver's
  per-day hop-log slices (vetoed && silent), grouped by
  from->to step key and loopDay. Budgeted-leg silent vetoes
  are guard vetoes only; suppressions are counted
  separately and are NEVER vetoes.
- Suppression: a budgeted-leg travelTo attempt of an
  abandoned step that returns the veto block WITHOUT
  invoking the guard.
- Player-flagged death: a deaths[] entry with player === true
  (the harness's own flag; the pilot's band total was 6).
- Pocket episode: pilot definition, unchanged (maximal run
  of consecutive away day-ends containing >= 1 failing
  day-end return sim, lasting >= 2 day-ends OR
  strand-linked death).

### PRIMARY METRIC (binding — GO requires P2 AND P3 on every repetition seed)

- P2: no step accumulates silent vetoes on more than 3
  distinct seed-days anywhere on the band (armed leg).
- P3: total same-step silent vetoes <= 3 on every step,
  every seed (armed leg).
- P1 (REPORT ONLY, never carries the verdict alone): on
  every repetition seed, max same-step silent vetoes per
  seed-day <= 3 (armed leg). P1 is weak because baseline
  per-day was already 3 in the pilot; reporting it without
  letting it carry the verdict is the pilot metric review's
  own prescription, adopted here.

### NO-HARM BARS (all binding)

- B1 median survival: armed median daysAlive >= baseline
  median.
- B2 deaths: armed death count <= baseline death count
  band-wide, AND no death cause (pilot deathMode mapping,
  unchanged) in the armed leg absent from the baseline leg,
  AND player-flagged deaths armed <= baseline, reported
  separately (pilot: 6 -> 6).
- B3 failed-trip share: armed <= baseline + 0.05 (this
  arm's own tolerance, kept from the pilot).
- B4 mean daily haul: armed >= 0.95x baseline (pooled),
  AND per-seed floor: every seed >= 0.50x its own
  baseline haul. BOTH bind.
- B5 away day-ends: armed <= baseline + 2 band-wide.
- B6 forageTrips: armed >= 0.90x baseline.
- B7 suppression engagement: suppressions > 0 on every
  repetition seed.
- B8 veto-created pockets: ZERO — no armed seed with >= 1
  pocket-entry episode where the baseline seed had none.

### ROUTE-REOPEN RATE (the confirm's new question, defined before judging)

For every armed abandonment (step S abandoned on loopDay D
of seed X), inspect the BASELINE twin's hop log for the
same step S on loopDays > D:

- (a) STRUCTURAL: suppressed attempts that actually execute
  must be 0. Operationalized two ways, both required:
  (a1) armed post-abandonment hop-log entries for S = 0
  (the guard was never invoked for S after abandonment, so
  no guarded hop exists); (a2) the pilot proof test's
  suppressed-attempts-never-move check (re-run 27/27) is
  the movement proof for the wrapper itself. Any (a1)
  violation is a NO-GO on its own (it would mean
  suppression leaks into real movement).
- (b) COST: count abandoned steps whose baseline twin later
  PASSES the step after D — i.e. a baseline hop-log entry
  for S on a loopDay > D with vetoed === false (the guard
  passed it, so the step was actually taken / its escape
  check passed). Report per step: seed, step, abandonment
  day, first baseline pass day (if any), and whether ANY
  haul, away, survival, or death divergence traces to it
  (divergent day-records between legs on/after that day,
  per the identity check below). Verdict rule, decided
  now: if (b) > 0 AND any no-harm bar fails because of
  it, the verdict is NO-GO; if (b) > 0 but ALL bars
  pass, the verdict stands on the bars and (b) is reported
  as a measured cost, never hidden. If (b) = 0, the
  permanent-abandonment risk is again untested on this
  band, and the evidence says so plainly.

### Stronger identity check (pilot metric review, adopted)

Beyond the pilot's day snapshots (position/kcal/hydration)
+ forage counts, the confirm driver records at every
day-end: village pantry kcal (sum of kcalEach x units
over state.village.pantry, the harness's own formula)
and the village roster (roster count + sorted roster ids).
The confirm analyzer compares, per seed, per loopDay:
start/end positions, scholar kcal, pantry kcal, roster
count + roster id set, and forage attempt/success counts.
It reports: total divergent day-records per seed and
band-wide, the first divergent day per seed (if any),
and whether any divergence falls on/after a route-reopen
day for that seed. SCOPE STATEMENT (honest limit): this
is still a snapshot comparison, not full game-state
equality — codex, trust, inventory composition, and
monster state are not compared. The evidence states this
scope; it does not claim trajectory identity beyond it.

### BALANCED PANEL (§15, context never verdict)

Run scripts/balance-panel.js as a single combined
campaign (both policies, same seeds/days: 66001-66016,
60 days) as CONTEXT, never verdict. Attach the compare
summary to the evidence file; if it returns INVALID by
design for policy-split panels, record it as-is, do not
override it (same structural refusal class as the pilot).

### SENSE-TESTING LAW

Read the sayLines transcripts on the repetition seeds
(veto lines, post-abort days) and the day-end
positions/kcal; judge meaning and coherence, never just
counts. The evidence file carries a village assessment
in plain words (what the village looked like, who
thrived / died and why, what was missing), post-abort
day-shape notes, plus wall numbers for the judged band
(national / table / wins, wave 4-5 unlocks, median
survival) with the 60d pre-seat profile stated as
expected, not a regression.

### METRIC REVIEW (in the evidence file, never a re-score)

Metric doubts go here and propose revisions for the NEXT
run only.

## Census (proof, before judged sims)

- scripts/test-vetobudget-b.js re-run: must be 27/27
  (pilot proof, unchanged wrapper).
- scripts/test-vetobudget-confirm-b.js (new): env gate
  (DAYS=60 required, other values fatal; substrate flags
  fatal), snapshot fields present (pantryKcal number,
  roster count + ids), analyzer route-reopen computation
  on synthetic records (pass-after-abandonment counted,
  veto-after-abandonment not counted, armed post-abandonment
  hops flagged), identity comparison on synthetic records
  (identical records 0 divergences; a pantry-only change
  counted as exactly 1 divergent day-record).
Any proof failure is a loud failure: fix the instrument,
do not judge against a disagreeing instrument.

## Deliverable

Evidence file evidence/2026-11-02/sim-vetobudget-confirm-b.md
(prereg header, census numbers, confirm numbers
before/after, veto-budget verdict, village assessment in
plain words, wall numbers, metric review section), plus
the confirm driver + analyzer + proof test, all committed
on branch sim-vetobudget-confirm-b. Report to coordinator:
GO / NO-GO / DIAG verdict with judged numbers, commit
hashes, and proof-test result.

## Explicitly excluded

No finish lever, no guard-default flip, no N change (N=3
stands), no narration added by this arm. This is a
behavior instrument, judged on its own prereg. No pairing
with any other arm's confirm.
