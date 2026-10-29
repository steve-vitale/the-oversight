# sim-lackingline2-b — PREREGISTRATION (written BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261029T1930Z,
arm sim-lackingline2-b, axis food-economy (woodcarry lacking-line
measurement, banking-first). Worktree sim-lackingline2-b.
MEASUREMENT ONLY: zero src/js changes, zero policy retunes —
scripts/policies/woodcarry.js is NOT touched by this arm (it
measures the line as landed by sim-woodcarry3-b). This worker
does NOT merge to master — coordinator merges.

## Background (read before judging — verdicts NOT re-litigated)

- evidence/2026-10-29/sim-woodcarry3-b.md +
  sim-woodcarry3-b-prereg.md (GO, lever lands default-OFF):
  8/8 episodes rescued on a properly-banked band (seeds 13025,
  13067, 13268, 13276; horizon 30d; stripped driver, no thief
  grant, no taps). Carry behavior: 11 acted carries, 0 kcal
  skips, 0 ticks skips. The lacking-line was NEVER exercised
  in a played tail (0 still-refused ON creek evenings).
- evidence/2026-10-29/sim-lackingline-b.md +
  sim-lackingline-b-prereg.md (1730Z run, INSUFFICIENT-DATA):
  sequential-ON screen, 60 seeds (13300–13359), 1,797 evenings,
  14 travel-refused, 3 ON creek evenings, 0 still-refused.
  All 3 creek evenings rescued with huge margins (wood exactly
  4, kcal 2246–2390 against a 60 floor, ticks 127–239 against
  a 96 floor). Fourth consecutive run with the honesty guard
  having nothing to guard.
- Backlog #1450 (claimed by this arm): the lacking-line is
  unit-proven but still unplayed after FOUR runs. The 1730Z
  next-run note prescribes THIS run's method, which is
  MANDATORY here: bank OFF-leg creek episodes FIRST (the
  blockscreen2 method), then run the judged ON leg against
  those banked episodes. Sequential-ON screening is RETIRED
  and is NOT repeated. The minimum-n bar is NOT lowered.
- Canon: docs/CANON.md (manifest) + docs/ABILITY-REFUSALS.md
  (no silent actions — every action narrates honestly,
  including failures) + docs/MAP.md §1 (creeks run
  top-to-bottom, ~35% of creek tiles need a bridge or a
  swimmer) and §6 (the way home: node travel is free, no
  teleport). The lacking-line is the woodcarry lever's
  instance of that honesty law: on a still-refused creek
  evening it must say ONE line naming what is lacking.

## The line under measurement (as landed, NOT re-specified)

scripts/policies/woodcarry.js, function lackingLine(skip,
info), fires ONLY on the ON leg (WOODCARRY=1), ONLY on a
travel-refused evening classified creek, ONLY when the
evening is STILL refused after any bridge attempt (or no
attempt was made) — i.e. the player is not at the haven node
after the attempt. Lines:

- wood-short: "No bridge tonight — the pack holds <N> log(s),
  and a bridge needs 4."
- kcal-short: "No bridge tonight — <N> kcal in hand, and the
  lashing takes 60."
- ticks-short: "No bridge tonight — <N> ticks left in the day,
  and a bridge takes 96 ticks."
- build-refused / retry-refused / other skips: named lines
  (see the policy file); a still-refused evening whose skip
  is build-refused or retry-refused counts as a staged
  evening, but the PRIMARY judged case is a gate-skip line
  (wood/kcal/ticks) naming a live number, because only those
  name a measurable lack. A build/retry-refused line is
  reported as secondary evidence, never as the primary.

## Honest staging rules (fixed here — a refusal counts ONLY if all hold)

1. SAME DRIVER FAMILY as woodcarry3: scripts/
   woodcarry3-trace-b.js, stripped (no thief grant, no taps),
   detour OFF, clearhabit absent, all separation gates unset/
   0, substrate COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
   DEPOSITGATE=1, DAYS=30, POLICY=nighttravel, WOODCARRY=0
   for the banking OFF legs and 1 for the judged ON legs.
2. NO hand-edited narration strings, NO save edits, NO
   kcal/health top-ups, NO direct position/state writes, NO
   travelTo in the driver, NO steering of competent.daily.
   The ONLY staging instruments are (a) OFF-leg banking
   under the judged driver (below) and (b) seed order
   within the banking screen. No state is ever edited to
   manufacture a shortfall.
3. The refusal must come from REAL game state: the evening
   is travel-refused with hopReturnKind block:creek, the
   recorder probe classifies it creek (blockType creek on
   the same tile type, no probe/route error), and the
   bridgeDecision skip reason matches the classification's
   live numbers — wood-short iff woodPlayer < 4, kcal-short
   iff kcalLive < 60, ticks-short iff ticksToDayEnd < 96,
   build-refused iff a bridge attempt was made and the
   engine refused it, retry-refused iff a bridge was built
   and the retry hop did not arrive at haven. A line whose
   named number does not equal the classification's live
   number for that evening is a WRONG line, not a pass.
4. BANKING IS NOT CHERRY-PICKING, by construction: the bank
   is the FIRST qualifiers in screen order (below), taken
   without regard to their ON outcomes (which are unknown
   at banking time — banking runs OFF only) and without
   regard to episode length, margins, or prettiness. The
   staged seed is the FIRST banked seed, in bank order,
   with >= 1 still-refused ON creek evening, and its FIRST
   still-refused ON creek evening is the judged evening.
   Later still-refused evenings on the same seed are
   secondary evidence, never replacements for a failed
   judged evening. Selecting on the OFF trait (creek
   episodes exist) is the blockscreen2 method: it selects
   on the census's own conditioning variable, and the
   judged quantity (still-refused ON evenings) is a
   different variable from the banking trait.
5. A morning-carry skip is itself honest game state, not
   staging: e.g. a not-at-haven morning (player slept out
   after a prior refusal) legitimately leaves wood < 4 at
   the next evening, and a pile-floor morning legitimately
   leaves wood short. Both are reported with the carry
   record (ctx._wcCarry) for that loop-day, so the reader
   can see WHY the pack was short. What is forbidden is
   manufacturing the shortfall by editing state; a
   shortfall the engine + policy produced is legitimate.
6. DO NOT stage by weakening the lever (e.g. disabling
   the morning carry) or by editing kcal/wood: that would
   manufacture the shortfall instead of finding it, and
   the resulting tail would prove nothing about the
   shipped line.

## Phases (fixed here, before any leg)

- PHASE 0 — PILOT (driver health only): OFF legs for the
  first 8 screen seeds (13400–13407), run first and checked
  for driver health only (no crash, corpora load, errs == 0
  on all 8, evening records sane). If the pilot batch
  crashes, the run stops and the crash is reported, never
  worked around by changing the driver mid-screen. The
  pilot seeds count toward the banking screen (they are
  its first 8 seeds, not a separate sample).
- PHASE 1 — BANKING (OFF legs, WOODCARRY=0): screen seeds
  sequentially upward from 13400, 30 loop-days each. A
  seed QUALIFIES for the bank iff its OFF leg contains
  >= 1 creek evening (woodcarry record outcome
  travel-refused, bucket creek). Banking STOPS when the
  12th qualifier is found, or at seed 13799 (400 seeds
  screened: 13400–13799), whichever comes first. No
  post-hoc seeds are added after the stop rule fires.
  - If banking yields >= 8 qualifiers, the judged band
    is all qualifiers found (8–12 seeds, in screen order).
    A band of 8–11 (cap hit before the 12 target) is a
    reported shortfall against the target, NOT a verdict
    failure — the 8-seed floor is the binding minimum.
  - If banking yields < 8 qualifiers at the cap, NO
    judged ON leg is run as a confirm (the 8-seed floor
    binds), the verdict is INSUFFICIENT-DATA (banking
    shortfall), and the banked seeds are published for a
    follow-up. The banking census is still landed.
  - The woodcarry3 banked band (13025, 13067, 13268,
    13276) is NOT re-banked and NOT in the judged band:
    woodcarry3 already proved it yields 0 still-refused
    ON evenings. Banking starts fresh at 13400 so the
    judged band is a new observation.
- PHASE 2 — JUDGED ON LEGS (WOODCARRY=1): the banked
  band only, 30 loop-days each, same driver. The banking
  OFF legs double as the OFF guard legs (below).
- PHASE 3 — STAGED LEGS (only if >= 1 still-refused ON
  creek evening exists on the judged band): full-tail
  leg scripts/lackingline2-trace-b.js (this arm's
  tail-capture driver: identical setup, policy wrapping,
  and per-day records to woodcarry3-trace-b.js, except
  it captures ALL say lines per loop-day instead of the
  last 30) runs the staged seed ON, 30 loop-days. Its
  evening rows (excluding the say tail itself) must
  match the judged ON corpus rows exactly — if they
  differ, the tail leg is NOT the judged tail and the
  run stops for diagnosis. The judged evening's full
  day of say lines from this leg is the tail read end
  to end for sense-testing.
- DETERMINISM GUARD (regardless of staging): re-run
  the FIRST banked seed ON (same driver, same env) and
  require byte-identical corpus JSON. A determinism
  failure is an instrument failure, reported as such,
  and blocks any GO.

## Primary metric, verdict bars (judge ONLY against these)

PRIMARY: the lacking-line appears in the played tail for a
genuinely still-refused ON creek evening AND names what is
actually lacking (wood count / kcal / ticks) for that
evening — the named number equals the classification's
live number, and the skip reason matches the gate that
actually bound.

- DIAG-GO requires ALL of:
  (a) >= 1 staged still-refused ON creek evening under
      the staging rules above (minimum-n 1, judged
      evening = the staged seed's first such evening);
  (b) the judged evening's full day of say lines
      (full-tail leg) contains the lacking-line for the
      actual skip reason, with the named number equal
      to the live classification number (woodPlayer /
      kcalLive / ticksToDayEnd);
  (c) no OTHER lever line appears in that day's tail
      that contradicts the classification (exactly one
      lacking line for the judged evening; the engine's
      own creek refusal line may also appear — it is
      the engine's voice, not a contradiction);
  (d) recorder/classifier errs == 0 on the staged
      seed's ON leg, and the judged evening is
      classified creek with no probe/route error
      (unclassified == 0 for the judged evening);
  (e) determinism re-run of the first banked seed ON
      is byte-identical on evening rows (the re-run
      JSON must equal the judged corpus JSON);
  (f) OFF guard legs for the banked band contain NO
      lever lacking-line on any evening (checked over
      the corpora's evening say tails);
  (g) sense-test passes (below): the tail reads as a
      person lacking something, not a debug string.
- DIAG-NO-GO: a staged still-refused ON creek evening
  exists, but (b) or (c) fails — the line is absent,
  names the wrong lack, or names the wrong number. The
  evidence file reports the exact file/line (scripts/
  policies/woodcarry.js lackingLine + its call site),
  the tail as played, and a concrete fix proposal.
  This arm does NOT rewrite game text: a follow-up
  wording arm lands any fix.
- INSUFFICIENT-DATA: banking yields < 8 qualifiers at
  the cap (banking shortfall, no judged leg), OR the
  judged band yields 0 still-refused ON creek
  evenings, OR a guard (d)/(e)/(f) fails on instrument
  grounds. The evidence file diagnoses WHY (banking
  yield; gate distributions across banked ON creek
  evenings: how many ON creek evenings occurred, and
  which gates bound or never bound, with margins to
  each floor). The bar is NEVER lowered and a refusal
  is NEVER faked.
- A miss is NO-GO, never re-scored against a friendlier
  metric mid-run; metric doubts go under "metric
  review" for the NEXT run. Every evidence file carries
  a "metric review" section.

## Secondary (reported, never judged)

- Banking census: seeds screened, qualifiers in screen
  order, OFF creek evenings and episodes per banked
  seed, qualifier rate on the screened band (quoted
  ONLY as a banking yield on this band, never as a
  blind-band rate).
- Judged-band census: ON creek evenings, still-refused
  count, skip-reason breakdown, wood/kcal/ticks
  distributions AND margins to floors on banked ON
  creek evenings (the diagnosis material if
  INSUFFICIENT-DATA), rescue rate on the banked band.
- The staged seed's morning carry record for the judged
  loop-day (why the pack held what it held), if staged.
- Wall numbers: NOT OBSERVABLE on 30-day evening legs
  (pre-seat, no field). National / table / wins are
  reported as NOT OBSERVABLE, never as zeros.
- Balanced panel (MEASUREMENT.md §15 — explicit, not a
  fake): NO balance-panel compare .md is produced, as
  pre-registered here before judging: this leg is a
  30-day position measurement of a POLICY-SIDE lever —
  zero src/js changes, so there is no game-root delta
  for a panel to compare, and the panel's registry
  policies do not include the nighttravel trace policy.
  The divergence/equivalence audit + determinism
  re-run are the instrument-perturbation proofs, and
  the pre-registered bars above are the judge.

## Horizon + why (death-aware, never a fixed 200d)

30 loop-days, same as the creekremedy / woodcarry legs:
the refused pattern is visible inside 30 days (banked
episodes run 1–10 evenings within 30 days; woodcarry3
OFF episodes ran 2–23 evenings). Dead villages stop
simulating (runDays endReason); the +10d tail is a
cap, not a target. If a banked seed's village dies
before a judged evening, that evening does not exist
and the next banked seed is considered — a dead
village's missing evening is never staged post-hoc.
A qualifier whose village dies still counts as a
banked seed (the banking trait is OFF creek evenings
before death); its ON leg is still run.

## Sense-testing (mandatory, in the evidence file)

If a staged evening exists, read the judged evening's
FULL day of say lines end to end from the full-tail leg
and judge meaning: does it read as a person lacking
something (a named lack, a named number, a named
consequence — no bridge tonight), not a debug string
(no variable names, no "skip:", no nulls)? Also judge
the arc: does the day's play explain HOW the lack came
about (morning carry skipped or spent, day's foraging,
evening refusal)? Judge coherence, not just string
presence. If the line is present but reads as a debug
string, that is recorded under sense-testing and counts
against (g) — a present but incoherent line is NOT a
DIAG-GO. If NO staged evening exists, NO sense-test on
a played still-refused tail is performed or claimed:
the evidence file records it as NOT PERFORMED, and a
rescued-evening tail read (if any) is labeled context
only, never a sense pass for the lacking-line.

## Village assessment (mandatory, in the evidence file)

Plain words: what the banked villages looked like, who
thrived and who died and why, what knowledge/capabilities
were missing, which blank was filled (this measurement,
if DIAG-GO) or documented. Plus wall numbers (NOT
OBSERVABLE — stated, not claimed).

## Metric review (prereg — doubts carried into the run)

- MINIMUM-N 1, KEPT BUT WITH AN HONEST RECKONING:
  one honestly-staged evening is still the right unit
  for an existence proof. BUT the 1730Z diagnosis plus
  this run's brief must be reckoned with honestly:
  competent play keeps kcal near ~2400 and the pack
  stocked at 4, so the gates the line names almost
  never bind under competent play. If this banked
  band ALSO yields 0 still-refused evenings, that is
  a finding about the line's REACHABILITY under
  competent play — the line may be written for a
  state the shipped policy avoids — not a license to
  weaken the bar, manufacture a shortfall, or re-score
  on build/retry lines. The next-run question it
  raises (for the NEXT prereg, not this one) is
  whether the line's proof needs a non-competent
  policy (e.g. a starving or overloaded village) or
  whether the line is accepted as defense-in-depth
  narration that competent play rarely needs.
- BANKING-FIRST, NEW INSTRUMENT, KEPT HONEST: banking
  on OFF creek episodes multiplies creek-evening yield
  per seed versus sequential-ON screening (woodcarry3:
  4 banked seeds yielded 5 ON creek evenings against
  the 1730Z screen's 3 in 60 seeds), but banking does
  NOT change the gate-binding rate: ON creek evenings
  on banked seeds still held huge margins in every
  prior run. Yield is not the same as binding, and
  this prereg judges binding, not yield.
- GATE-SKIP PRIMARY, BUILD/RETRY SECONDARY (kept
  from 1730Z): a build-refused or retry-refused line
  proves a line fired, but not that a named lack was
  communicated. If the judged band yields ONLY
  build/retry-refused evenings, the verdict is
  INSUFFICIENT-DATA for the primary (gate-skip) claim,
  with the build/retry evenings reported as secondary
  evidence — not a DIAG-GO by substitution.
- BANK TARGET 12, FLOOR 8 (new): blockscreen2's 12-seed
  bar is the target; the 8-seed floor is the binding
  minimum for a confirm band. A cap-hit band of 8–11
  is judged, not extended post-hoc.
- If the metric proves wrong, write it under "metric
  review" in the evidence file and propose the revision
  for the NEXT run — never re-score mid-run.

## Landing rule

- DIAG-GO: the #1450 blank is closed BY MEASUREMENT
  (the line is proven in play). Land prereg + evidence
  + bank census + banked corpora (OFF + ON) + tail
  corpus + tail-capture driver + analyzers + proof.
  NO policy change, NO src/js change.
- DIAG-NO-GO: land prereg + evidence + corpora + proof
  with the exact file/line, the tail as played, and a
  concrete fix proposal. NO text rewrite in this arm.
- INSUFFICIENT-DATA: land prereg + evidence + banking
  census + banked corpora (if any judged band exists)
  + proof. NO post-hoc seeds added after the stop
  rule; extension candidates go in the evidence as a
  next-run note only.
- Screening corpora for NON-banked seeds are NOT
  committed (they contain no banked trait and are
  exactly reproducible from the documented driver +
  env + seed list, as the byte-identical determinism
  re-run proves); the banking census JSON is the
  committed record of the full screen.
- This worker does NOT merge to master — coordinator
  merges. Report 'committed, pending coordinator merge'
  with the verdict, the staged seed/evening (if any),
  and the evidence paths.
