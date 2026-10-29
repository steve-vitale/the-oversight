# sim-lackingline-b — PREREGISTRATION (written BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261029T1730Z,
arm sim-lackingline-b, axis food-economy (woodcarry lacking-line
measurement). Worktree sim-lackingline-b. MEASUREMENT ONLY:
zero src/js changes, zero policy retunes — scripts/policies/
woodcarry.js is NOT touched by this arm (it measures the line
as landed by sim-woodcarry3-b). This worker does NOT merge to
master — coordinator merges.

## Background (read before judging — verdicts NOT re-litigated)

- evidence/2026-10-29/sim-woodcarry3-b.md +
  sim-woodcarry3-b-prereg.md (GO, lever lands default-OFF):
  8/8 episodes rescued on a properly-banked band (seeds 13025,
  13067, 13268, 13276; horizon 30d; stripped driver, no thief
  grant, no taps). Carry behavior: 11 acted carries, 0 kcal
  skips, 0 ticks skips. Bridge outcomes: 5 completed entries,
  all inside.
- The gap this arm closes (findings backlog #1424, #1444):
  the woodcarry lacking-line is unit-proven (test-woodcarry3-b
  T3: wood line names 4 logs, kcal line names 60, ticks line
  names 96) but has NEVER been exercised in a played tail
  across three runs — 0 still-refused ON creek evenings in
  sim-woodcarry-b, sim-woodcarry2-b, and sim-woodcarry3-b —
  so the honesty guard passed vacuously every time.
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
   DEPOSITGATE=1, DAYS=30, POLICY=nighttravel, WOODCARRY=1
   for the ON leg and 0 for the OFF guard leg.
2. NO hand-edited narration strings, NO save edits, NO
   kcal/health top-ups, NO direct position/state writes, NO
   travelTo in the driver, NO steering of competent.daily.
   The ONLY staging instrument is seed selection under the
   judged driver: a still-refused evening counts only if it
   arises from engine + policy play on that seed.
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
4. The staged seed's ON trajectory is NOT selected on its
   outcome beyond the staging rule: the first seed in
   screening order (below) with >= 1 still-refused ON creek
   evening becomes the staged seed, and its FIRST
   still-refused ON creek evening is the judged evening.
   Later still-refused evenings on the same seed are
   secondary evidence, never replacements for a failed
   judged evening.
5. A morning-carry skip is itself honest game state, not
   staging: e.g. a not-at-haven morning (player slept out
   after a prior refusal) legitimately leaves wood < 4 at
   the next evening, and a pile-floor morning legitimately
   leaves wood short. Both are reported with the carry
   record (ctx._wcCarry) for that loop-day, so the reader
   can see WHY the pack was short. What is forbidden is
   manufacturing the shortfall by editing state; a
   shortfall the engine + policy produced is legitimate.

## Screening rule (fixed here, before any leg)

- Screening runs the ON driver (WOODCARRY=1) over seeds
  sequentially upward from 13300, 30 loop-days each, until
  the first seed with >= 1 still-refused ON creek evening
  (outcome travel-refused, bucket creek, woodcarry.bridge
  attempted-or-skipped, narration non-null, final position
  NOT at haven). Screening is capped at 60 seeds.
- PILOT: the first 2 screening seeds are the pilot batch —
  run first and checked for driver health only (no crash,
  records sane, errs == 0); if the pilot batch crashes, the
  run stops and the crash is reported, never worked around
  by changing the driver mid-screen.
- If no still-refused ON creek evening appears in 60 seeds,
  the verdict is INSUFFICIENT-DATA (see below) and the
  diagnosis section must say WHY the game state prevents
  it (which gates never bound across the screened band:
  wood/kcal/ticks distributions on ON creek evenings).
- The banked band (13025, 13067, 13268, 13276) is NOT
  re-screened: woodcarry3 already proved it yields 0
  still-refused ON evenings. Screening starts fresh at
  13300 so the staged seed is a new observation, not a
  re-read of a known-rescued band.

## Judged legs (after staging, on the staged seed ONLY)

- ON leg: the screening run itself IS the judged ON leg
  (same driver, deterministic — no re-run needed for
  judging; a determinism re-run is still performed as a
  guard, see below).
- OFF guard leg: the same seed, same driver, WOODCARRY=0,
  30 loop-days. Its purpose is comparison: the OFF tail
  for the corresponding evening must NOT contain any lever
  line (the engine's own refusal line may appear), and the
  OFF episode pattern is reported for context. The OFF leg
  is NOT judged on rescue rate.
- FULL-TAIL leg: scripts/lackingline-trace-b.js (this arm's
  tail-capture driver: identical setup, policy wrapping,
  and per-day records to woodcarry3-trace-b.js, except it
  captures ALL say lines per loop-day instead of the last
  30) runs the staged seed ON, 30 loop-days. Its evening
  rows (excluding the say tail itself) must match the
  judged ON corpus rows exactly — if they differ, the
  tail leg is NOT the judged tail and the run stops for
  diagnosis. The judged evening's full day of say lines
  from this leg is the tail read end to end for
  sense-testing.

## Primary metric, verdict bars (judge ONLY against these)

PRIMARY: the lacking-line appears in the played tail for a
genuinely still-refused ON creek evening AND names what is
actually lacking (wood count / kcal / ticks) for that
evening — the named number equals the classification's
live number, and the skip reason matches the gate that
actually bound.

- DIAG-GO requires ALL of:
  (a) >= 1 staged still-refused ON creek evening under the
      staging rules above (minimum-n 1, judged evening =
      the staged seed's first such evening);
  (b) the judged evening's full day of say lines (full-tail
      leg) contains the lacking-line for the actual skip
      reason, with the named number equal to the live
      classification number (woodPlayer / kcalLive /
      ticksToDayEnd);
  (c) no OTHER lever line appears in that day's tail that
      contradicts the classification (exactly one lacking
      line for the judged evening; the engine's own creek
      refusal line may also appear — it is the engine's
      voice, not a contradiction);
  (d) recorder/classifier errs == 0 on the staged seed's ON
      leg, and the judged evening is classified creek with
      no probe/route error (unclassified == 0 for the
      judged evening);
  (e) determinism re-run of the staged seed ON is
      byte-identical on evening rows (excluding nothing —
      the re-run JSON must equal the judged corpus JSON);
  (f) OFF guard leg for the staged seed contains NO lever
      lacking-line on any evening;
  (g) sense-test passes (below): the tail reads as a person
      lacking something, not a debug string.
- DIAG-NO-GO: a staged still-refused ON creek evening
  exists, but (b) or (c) fails — the line is absent, names
  the wrong lack, or names the wrong number. The evidence
  file reports the exact file/line (scripts/policies/
  woodcarry.js lackingLine + its call site), the tail as
  played, and a concrete fix proposal. This arm does NOT
  rewrite game text: a follow-up wording arm lands any fix.
- INSUFFICIENT-DATA: no still-refused ON creek evening in
  the 60-seed screen, or a guard (d)/(e)/(f) fails on
  instrument grounds. The evidence file diagnoses WHY
  (gate distributions across screened ON creek evenings:
  how many ON creek evenings occurred, and which gates
  bound or never bound). The bar is NEVER lowered and a
  refusal is NEVER faked.
- A miss is NO-GO, never re-scored against a friendlier
  metric mid-run; metric doubts go under "metric review"
  for the NEXT run. Every evidence file carries a "metric
  review" section.

## Secondary (reported, never judged)

- Screening census: seeds screened, ON creek evenings
  found, still-refused count, skip-reason breakdown, and
  the wood/kcal/ticks distributions on screened ON creek
  evenings (the diagnosis material if INSUFFICIENT-DATA).
- The staged seed's morning carry record for the judged
  loop-day (why the pack held what it held).
- The staged seed's OFF-leg episode pattern vs ON-leg
  pattern (context only).
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
  The divergence/equivalence audit + determinism re-run
  are the instrument-perturbation proofs, and the
  pre-registered bars above are the judge.

## Horizon + why (death-aware, never a fixed 200d)

30 loop-days, same as the creekremedy / woodcarry legs:
the refused pattern is visible inside 30 days (census
episodes run 1–10 evenings within 30 days). Dead villages
stop simulating (runDays endReason); the +10d tail is a
cap, not a target. If the staged seed's village dies
before its judged evening, that evening does not exist
and screening continues to the next seed — a dead
village's missing evening is never staged post-hoc.

## Sense-testing (mandatory, in the evidence file)

Read the judged evening's FULL day of say lines end to
end from the full-tail leg and judge meaning: does it
read as a person lacking something (a named lack, a
named number, a named consequence — no bridge tonight),
not a debug string (no variable names, no "skip:",
no nulls)? Also judge the arc: does the day's play
explain HOW the lack came about (morning carry skipped
or spent, day's foraging, evening refusal)? Judge
coherence, not just string presence. If the line is
present but reads as a debug string, that is recorded
under sense-testing and counts against (g) — a present
but incoherent line is NOT a DIAG-GO.

## Village assessment (mandatory, in the evidence file)

Plain words: what the staged village looked like, who
thrived and who died and why, what knowledge/capabilities
were missing, which blank was filled (this measurement,
if DIAG-GO) or documented. Plus wall numbers (NOT
OBSERVABLE — stated, not claimed).

## Metric review (prereg — doubts carried into the run)

- MINIMUM-N 1, JUSTIFIED: this is an existence proof
  for a narration line, not an efficacy rate — one
  honestly-staged played evening with its full tail read
  is the unit. The 60-seed screen is the power guard
  against cherry-picking: the staged seed is the FIRST
  qualifying seed, not the prettiest.
- GATE-SKIP PRIMARY, BUILD/RETRY SECONDARY: a
  build-refused or retry-refused line proves a line
  fired, but not that a named lack was communicated —
  those lines name a failure, not a countable lack. If
  the screen yields ONLY build/retry-refused evenings,
  the verdict is INSUFFICIENT-DATA for the primary
  (gate-skip) claim, with the build/retry evenings
  reported as secondary evidence — not a DIAG-GO by
  substitution.
- TICKS GATE UNTESTED UNDER PRESSURE (carried from
  woodcarry3): all prior ON creek evenings held 96+
  ticks. If the screen's first still-refused evening is
  ticks-short, that also pressures-tests the 96-tick
  gate for the first time in play — reported as such.
- If the metric proves wrong, write it under "metric
  review" in the evidence file and propose the revision
  for the NEXT run — never re-score mid-run.

## Landing rule

- DIAG-GO: the #1424/#1444 blank is closed BY
  MEASUREMENT (the line is proven in play). Land prereg
  + evidence + corpora + tail-capture driver + analyzer
  + proof. NO policy change, NO src/js change.
- DIAG-NO-GO: land prereg + evidence + corpora + proof
  with the exact file/line, the tail as played, and a
  concrete fix proposal. NO text rewrite in this arm.
- INSUFFICIENT-DATA: land prereg + evidence + screening
  census + proof. NO post-hoc seeds added after the
  screen cap; extension candidates go in the evidence
  as a next-run note only.
- This worker does NOT merge to master — coordinator
  merges. Report 'committed, pending coordinator merge'
  with the verdict, the staged seed/evening, and the
  evidence paths.
