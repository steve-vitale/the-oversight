# sim-lackingline4-b — PREREGISTRATION (base-pinning amendment, written BEFORE any judged leg and BEFORE any judged analysis)

Run: oversight-flesh-out-loop-b, seventh lacking-line run,
arm sim-lackingline4-b, axis food-economy (woodcarry
lacking-line re-judgment on current master, backlog
#1450/#1455). Worktree sim-lackingline4-b.
MEASUREMENT ONLY: zero src/js changes, zero policy
changes — scripts/policies/woodcarry.js is NOT touched
by this arm (it measures the line as landed by
sim-woodcarry3-b). This worker does NOT merge to
master — coordinator merges.

## Why this run exists (not re-litigated)

- evidence on branch sim-lackingline3-b (commit
  bde92b27a, evidence
  evidence/2026-10-29/sim-lackingline3-b.md, prereg
  d401cd489): DIAG-GO on ITS base — combined bank
  13, judged ON 18 creek evenings / 10 still-refused,
  staged seed 13421 day 18 ticks-short ("No bridge
  tonight — 95 ticks left in the day, and a bridge
  takes 96 ticks.").
- Coordinator landing gate FAILED on base drift: after
  rebase onto master 2192ff080, the determinism leg
  diverged from day 3; trajectories deterministic per
  base, different across bases. The branch was HELD
  unmerged, verdict NOT re-scored, and re-judgment on
  current master was explicitly assigned to this run
  (backlog #1455).
- The staged line is NOT quoted as current-master
  behavior unless it re-plays on current master.
  This prereg is the instrument that prevents a
  re-score: everything below is judged on the
  current-master corpus only.

## Base pin (binding)

- PINNED BASE: worktree HEAD at prereg writing time,
  full hash 60cfe8fe1ed5d5dc53e75163a5a17e2c8c003479
  ("journey establishment r60: panel driver +
  analyzer (hide present, vine-gated bark craft, 239
  villageLost; measurement only, zero src/js)").
  This base is AFTER the 2192ff080 rebase target that
  diverged, so drift between 2192ff080 and this base
  is itself part of what the fresh legs measure.
- This prereg commit itself adds ONLY this file (no
  code, no policy, no driver change), so the legs run
  on pinned-base game code verbatim. The evidence
  file will verify with git diff that pinned base →
  final tree differs in game code by nothing (only
  measurement scripts + evidence + corpora).
- If the coordinator later rebases this branch, the
  verdict does NOT travel with it: re-judgment would
  need a fresh base-pinning prereg, exactly as this
  run does for lackingline3.

## Canon (read before judging)

- docs/CANON.md read first. No canon doc covers the
  creek/bridge lacking-line narration itself — that
  is stated here instead of inventing canon. The
  closest grounded canon: docs/TIME-ECONOMY.md (bridge
  build = 96 ticks, 60 kcal — the exact thresholds
  the line names), docs/MAP.md (creeks block travel;
  ~35% of creek tiles need a bridge or a swimmer),
  docs/ABILITY-REFUSALS.md (refusals must be honest
  about why). The line under measurement is the
  landed woodcarry.js lackingLine, NOT re-specified
  here.

## Bank (fixed, no fresh screen, no re-selection)

- Combined bank, in order, taken WHOLE from the
  published lackingline3 bank (prior 7 + fresh 6):
  13421, 13473, 13480, 13556, 13592, 13703, 13714,
  13869, 13899, 14041, 14089, 14125, 14137 (13 seeds).
- No fresh banking screen is run: banking is already
  done and the 8-seed floor is already met (13 ≥ 8).
  No subset is taken, no seed is added, no seed is
  dropped — any of those would be a new selection.
  The prior run's OFF/ON corpora are old-base
  evidence and are NOT reused as current-master
  evidence; they are referenced only for
  before/after comparison in the evidence file.
- Primary hunted line, carried over unchanged:
  ticks-short — the one gate the lever does not fix.
  Wood-short is not expected to bind ON (morning
  carry tops the pack to 4 logs); kcal-short binds
  only as a follow-on to a stranding, per
  lackingline3. Both are reported, neither is
  substituted for the primary.

## Phases (fixed here, before any leg)

- PHASE 1 — FRESH OFF LEGS (WOODCARRY=0): all 13
  banked seeds, 30 loop-days each, same driver
  (scripts/woodcarry3-trace-b.js, UNCHANGED),
  same env (POLICY=nighttravel, COMPETENT_FEAST=0,
  SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
  DAYS=30), into
  evidence/2026-10-29/sim-lackingline4-b-corpus-off/.
  These are the new-base OFF guard legs (bar (f))
  AND the new-base OFF census for the ticks-short
  sub-table. No thief grant, no taps, no state edits.
- PHASE 2 — FRESH ON LEGS (WOODCARRY=1): all 13
  banked seeds, 30 loop-days each, same driver and
  env, into
  evidence/2026-10-29/sim-lackingline4-b-corpus-on/.
  The ON legs run for ALL banked seeds even if an
  early seed stages.
- PHASE 3 — FULL ON CENSUS FIRST: the analyzer
  (scripts/analyze-lackingline4-on-b.js, adapted
  from the held arm's analyzer) computes the ON
  census over the full bank IN BANK ORDER before
  any staged seed is named. The staged seed is
  re-determined AFTER the census: the FIRST banked
  seed, in combined bank order, with ≥ 1
  still-refused ON creek evening whose skip is a
  gate-skip (wood/kcal/ticks). Later still-refused
  evenings on the same seed are secondary evidence,
  never replacements. Sequential-ON screening is
  RETIRED and is not repeated for any reason.
- PHASE 4 — STAGED LEGS (only if ≥ 1 staged
  evening exists): full-tail leg
  scripts/lackingline4-trace-b.js (created in this
  phase only: identical setup to
  woodcarry3-trace-b.js, plus eveningSayFull = ALL
  say lines of the loop-day) runs the staged seed
  ON, 30 loop-days. Its evening rows (excluding
  the say tail itself) must match the judged ON
  corpus rows exactly — if they differ, the tail
  leg is NOT the judged tail and the run stops for
  diagnosis. If no staged evening exists, this
  driver is NOT built (dead code is not landed)
  and no sense-test is claimed.
- DETERMINISM GUARD (regardless of staging,
  conditioned on a judged band existing): re-run
  the FIRST banked seed ON (13421, same driver,
  same env) and require byte-identical corpus JSON.
  A determinism failure is an instrument failure,
  reported as such, and blocks any GO. The re-run
  goes to a worktree staging dir (deleted after
  comparison, never committed).

## Honest staging rules (carried over unchanged)

1. SAME DRIVER FAMILY as woodcarry3/lackingline3:
   scripts/woodcarry3-trace-b.js, stripped (no
   thief grant, no taps), detour OFF, clearhabit
   absent, all separation gates unset/0, substrate
   as above, DAYS=30.
2. NO hand-edited narration strings, NO save edits,
   NO kcal/health top-ups, NO direct position/state
   writes, NO travelTo in the driver, NO steering of
   competent.daily. The ONLY staging instruments are
   (a) the fixed 13-seed bank and (b) seed order
   within it. No state is ever edited to manufacture
   a shortfall.
3. The refusal must come from REAL game state: the
   evening is travel-refused with hopReturnKind
   block:creek, the recorder probe classifies it
   creek (blockType creek, no probe/route error),
   and the bridgeDecision skip reason matches the
   classification's live numbers — wood-short iff
   woodPlayer < 4, kcal-short iff kcalLive < 60,
   ticks-short iff ticksToDayEnd < 96.
   build-refused iff a bridge attempt was made and
   the engine refused it, retry-refused iff a bridge
   was built and the retry hop did not arrive at
   haven. A line whose named number does not equal
   the classification's live number for that evening
   is a WRONG line, not a pass.
4. DO NOT stage by weakening the lever or editing
   kcal/wood. DO NOT re-bank or re-judge the
   woodcarry3 band (13025, 13067, 13268, 13276).

## Primary metric, verdict bars (judge ONLY against these, on the current-master corpus)

PRIMARY: the lacking-line appears in the played tail
for a genuinely still-refused ON creek evening AND
names what is actually lacking for that evening —
the named number equals the classification's live
number, and the skip reason matches the gate that
actually bound.

- DIAG-GO requires ALL of:
  (a) ≥ 1 staged still-refused ON creek evening
      under the staging rules above (minimum-n 1,
      judged evening = the staged seed's first such
      evening, gate-skip primary);
  (b) the judged evening's full day of say lines
      (full-tail leg) contains the lacking-line for
      the actual skip reason, with the named number
      equal to the live classification number
      (woodPlayer / kcalLive / ticksToDayEnd);
  (c) no OTHER lever line appears in that day's tail
      that contradicts the classification (exactly
      one lacking line for the judged evening; the
      engine's own creek refusal line may also
      appear — it is the engine's voice, not a
      contradiction);
  (d) recorder/classifier errs == 0 on the staged
      seed's ON leg, and the judged evening is
      classified creek with no probe/route error
      (unclassified == 0 for the judged evening);
  (e) determinism re-run of the first banked seed ON
      (13421) is byte-identical on the pinned base
      (the re-run JSON must equal the judged corpus
      JSON);
  (f) fresh OFF guard legs for the combined bank on
      the pinned base contain NO lever lacking-line
      on any evening (checked over the corpora's
      evening say tails);
  (g) sense-test passes (below): the tail reads as
      a person lacking something, not a debug string.
- DIAG-NO-GO: a staged still-refused ON creek
  evening exists, but (b) or (c) fails — the line is
  absent, names the wrong lack, or names the wrong
  number. The evidence file reports the exact
  file/line (scripts/policies/woodcarry.js
  lackingLine + its call site), the tail as played,
  and a concrete fix proposal. This arm does NOT
  rewrite game text: a follow-up wording arm lands
  any fix.
- INSUFFICIENT-DATA: the judged band yields 0
  still-refused ON creek evenings, OR the band
  yields ONLY build/retry-refused evenings (the
  primary gate-skip claim is unproven; build/retry
  evenings are secondary evidence, never a GO by
  substitution), OR a guard (d)/(e)/(f) fails on
  instrument grounds. The evidence file diagnoses
  WHY with the gate distributions across banked ON
  creek evenings (how many ON creek evenings
  occurred, which gates bound or never bound, with
  margins to each floor) and the ticks-short
  sub-table (new-base OFF ticks-short evenings vs
  their new-base ON outcomes). The bar is NEVER
  lowered and a refusal is NEVER faked. If NO
  staged evening appears on the new base, the
  verdict is INSUFFICIENT-DATA on the new base
  with the gate distributions as the diagnosis —
  that is a complete result, not a worker failure,
  and never a reason to lower the bar, repeat
  sequential-ON screening, or re-score against a
  friendlier metric.
- A miss is NO-GO, never re-scored against a
  friendlier metric mid-run; metric doubts go under
  "metric review" for the NEXT run. Every evidence
  file carries a "metric review" section.

## Secondary (reported, never judged)

- New-base ON census: ON creek evenings,
  still-refused count, skip-reason breakdown,
  wood/kcal/ticks distributions AND margins to
  floors on banked ON creek evenings, rescue rate
  on the banked band, per-seed survival and wave
  reach.
- New-base OFF census: OFF creek evenings, ticks-
  short detail, funnel/outcome distribution.
- Ticks-short sub-table: every banked seed with a
  new-base OFF creek evening at ticksToDayEnd < 96
  (seed, loop-day, OFF ticks/kcal/wood,
  first-episode or later), and that seed's new-base
  ON outcome on the corresponding loop-days.
- The staged seed's morning carry record for the
  judged loop-day (why the pack held what it held),
  if staged.
- Wall numbers: NOT OBSERVABLE on 30-day evening
  legs (pre-seat, no field). National / table /
  wins are reported as NOT OBSERVABLE, never as
  zeros.
- Balanced panel (MEASUREMENT.md §15 — explicit,
  not a fake): NO balance-panel compare .md is
  produced, as pre-registered here before judging:
  this leg is a 30-day position measurement of a
  POLICY-SIDE lever — zero src/js changes, so there
  is no game-root delta for a panel to compare, and
  the panel's registry policies do not include the
  nighttravel trace policy. The determinism re-run
  is the instrument-perturbation proof, and the
  pre-registered bars above are the judge.

## Horizon + why (death-aware, never a fixed 200d)

30 loop-days, same as the creekremedy / woodcarry /
lackingline3 legs: the refused pattern is visible
inside 30 days (banked episodes run 1–10 evenings
within 30 days). Dead villages stop simulating
(runDays endReason); the +10d tail is a cap, not a
target. If a banked seed's village dies before a
judged evening, that evening does not exist and the
next banked seed is considered — a dead village's
missing evening is never staged post-hoc. A
qualifier whose village dies still counts as a
banked seed; its ON leg is still run.

## Sense-testing (mandatory, in the evidence file)

If a staged evening exists, read the judged
evening's FULL day of say lines end to end from
the full-tail leg and judge meaning: does it read
as a person lacking something (a named lack, a
named number, a named consequence — no bridge
tonight), not a debug string (no variable names,
no "skip:", no nulls)? Also judge the arc: does
the day's play explain HOW the lack came about
(morning carry skipped or spent, day's foraging,
evening refusal)? Judge coherence, not just string
presence. If the line is present but reads as a
debug string, that is recorded under sense-testing
and counts against (g) — a present but incoherent
line is NOT a DIAG-GO. If NO staged evening
exists, NO sense-test on a played still-refused
tail is performed or claimed: the evidence file
records it as NOT PERFORMED, and a rescued-evening
tail read (if any) is labeled context only, never a
sense pass for the lacking-line.

## Village assessment (mandatory, in the evidence file)

Plain words: what the banked villages looked like,
who thrived and who died and why, what
knowledge/capabilities were missing, which blank
was filled (this measurement, if DIAG-GO) or
documented. Plus wall numbers (NOT OBSERVABLE —
stated, not claimed).

## Metric review (prereg — doubts carried into the run)

- MINIMUM-N 1, KEPT: one honestly-staged evening
  is still the right unit for an existence proof.
- BASE DRIFT IS THE KNOWN RISK, PINNED NOT
  WISHED AWAY: the lackingline3 gate failure proves
  trajectories move across bases. This run does
  not assume the old staged evening survives; it
  re-derives staging from the new-base census.
  If the new base yields no staged evening, the
  finding is drift-killed staging, reported with
  gate margins — not a reason to import the old
  staged evening.
- CARRY-COST CORRECTION, CARRIED (lackingline3
  metric review): when predicting ON ticks from OFF
  ticks, condition on the morning carry record —
  already-carrying mornings preserve the OFF ticks
  number exactly; taking mornings subtract the
  carry cost. This run's ticks-short sub-table
  reports the carry record per evening.
- WOOD-SHORT REMAINS UNPLAYED BY CONSTRUCTION
  (lackingline3 metric review): the morning carry
  structurally prevents wood-short on creek evenings
  (pack 4 on all prior ON creek evenings). This run
  does not weaken the carry to stage it; if
  wood-short again never binds, that sub-claim
  stays open for a future prereg naming an honest
  route (e.g. a pile-floor morning) or closing it
  as unplayable-by-construction.
- If the metric proves wrong, write it under
  "metric review" in the evidence file and propose
  the revision for the NEXT run — never re-score
  mid-run.

## Landing rule

- DIAG-GO: the #1450 blank is closed BY
  MEASUREMENT on current master (the line is
  proven in play on the pinned base). Land prereg +
  evidence + new-base ON census + fresh OFF/ON
  band corpora + tail corpus (if staged) +
  tail-capture driver (if built) + analyzer + proof.
  NO policy change, NO src/js change.
- DIAG-NO-GO: land prereg + evidence + corpora +
  proof with the exact file/line, the tail as
  played, and a concrete fix proposal. NO text
  rewrite in this arm.
- INSUFFICIENT-DATA: land prereg + evidence +
  new-base ON census + fresh OFF/ON band corpora +
  proof. NO post-hoc seeds added after the stop
  rule; extension candidates go in the evidence as
  a next-run note only.
- This worker does NOT merge to master —
  coordinator merges. Report 'committed, pending
  coordinator merge' with the verdict, the staged
  seed/evening (if any), and the evidence paths.
