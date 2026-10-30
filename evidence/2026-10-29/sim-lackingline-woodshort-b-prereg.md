# sim-lackingline-woodshort-b — PREREGISTRATION (written BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-lackingline-woodshort-b,
run fleshout-loop-b-20261030T0130Z, axis food-economy
(wood-short lacking-line, backlog #1456 still-open sub-item).
Worktree sim-lackingline-woodshort-b.
MEASUREMENT ONLY: zero src/js changes, zero policy changes —
scripts/policies/woodcarry.js is NOT touched by this arm
(it measures the line as landed by sim-woodcarry3-b).
This worker does NOT merge to master — coordinator merges.

## Why this run exists (not re-litigated)

- lackingline4 (evidence/2026-10-29/sim-lackingline4-b.md,
  DIAG-GO, landed 6643834d6) closed #1450/#1455: the
  ticks-short lacking-line played on current master
  (13480 day 4, 45 ticks). Still open WITHIN that
  verdict, explicitly: WOOD-SHORT was never played on
  any band — every OFF creek evening held wood 0, but
  the ON (woodcarry) leg always rescued by carrying,
  so no still-refused ON evening ever named a wood
  lack. On lackingline4's pinned base: 14 ON creek
  evenings, woodPlayer = 4 on ALL 14 (margin 0,
  never below), skip breakdown ticks 2 / kcal 6 /
  wood 0. The wood-short line text
  ("No bridge tonight — the pack holds N logs, and
  a bridge needs 4.") is unit-proven only
  (test-woodcarry3-b.js T3).
- This arm hunts ONLY the wood-short line. It does
  not re-judge ticks-short or kcal-short, does not
  weaken the carry, does not lower any bar, and does
  not repeat sequential-ON screening.

## Base pin (binding)

- PINNED BASE: worktree HEAD at prereg writing time,
  full hash d6723d3f39495b26cedcfd518997a99df98ec5fc
  ("journey deepening r67: canTeach-why census driver
  + analyzer + proof (measurement only, zero src/js)").
  The prereg
  commit adds ONLY this file (no code, no policy,
  no driver change), so the legs run on pinned-base
  game code verbatim. The evidence file will verify
  with git diff that pinned base → final tree
  differs in game code by nothing (only measurement
  scripts + evidence + corpora).
- If the coordinator later rebases this branch, the
  verdict does NOT travel with it: re-judgment would
  need a fresh base-pinning prereg, exactly as
  lackingline4 did for lackingline3.

## Canon (read before judging)

- docs/CANON.md read first. No canon doc covers the
  creek/bridge lacking-line narration itself — that
  is stated here instead of inventing canon. The
  closest grounded canon: docs/TIME-ECONOMY.md
  (bridge build = 96 ticks, 60 kcal — the exact
  thresholds the line family names), docs/MAP.md
  (creeks block travel), docs/ABILITY-REFUSALS.md
  (refusals must be honest about why). The line
  under measurement is the landed woodcarry.js
  lackingLine, wood-short branch, NOT re-specified
  here.

## Trait reasoning (derived BEFORE this prereg from COMMITTED evidence only)

No new leg was run before this prereg. The reasoning
below comes from re-reading the committed
lackingline4 corpora (13 seeds, pinned base
60cfe8fe) — prior evidence, not judged legs:

- Morning carry gate (scripts/policies/woodcarry.js
  carryDecision): carry acts only when wood < 4 AND
  pile − deficit ≥ 8 (PILE_FLOOR) AND morning kcal
  ≥ 60 AND canCarry(deficit × 2 kg). Skips:
  already-carrying (wood ≥ 4), pile-floor, kcal-floor,
  cannot-carry, not-at-haven, lever-off.
- Evening bridge gate (bridgeDecision, order
  matters): wood-short is checked FIRST, before
  kcal-short and ticks-short. So a wood-short
  evening names wood even if kcal or ticks are ALSO
  short — co-shortfalls are reported honestly, they
  do not change the skip.
- Committed ON census (390 mornings): acted 28,
  already-carrying 342, pile-floor 13, not-at-haven
  7, kcal-floor 0, cannot-carry 0. All 13
  pile-floor mornings are loop-day 1: woodBefore 0,
  pileBefore 10 on EVERY seed (10 − 4 = 6 < 8).
  Day 2 mornings already carry (pile 12–16, pack 0
  → take 4). No pile-floor morning after day 1
  exists in the bank — the pile only grows
  (day-1 10 → hundreds by day 30).
- Return-home mornings with pack 0 DO occur
  (e.g. 13480 day 11 after stranded days 5–10:
  woodBefore 0, pile 25 → acted, took 4). So pack
  < 4 at a haven morning is not confined to day 1;
  it recurs whenever the player comes home empty.
  A wood-short evening therefore needs, on the
  SAME day: a haven morning that leaves the pack
  below 4 (pile-floor, kcal-floor, cannot-carry,
  or a not-at-haven morning with a spent pack)
  AND a creek-refused evening that day.
- Day-1 evenings are inside on all 13 banked seeds,
  and the earliest first-outside evening in the
  bank is day 4 — so the day-1 pile-floor window
  (universal, but only one morning) is a LONG
  SHOT, not a plan: a day-1 creek evening may be
  structurally rare or absent. This run does NOT
  bank on day 1 alone; it banks on OFF-leg creek
  episodes generally and hunts wood-short across
  ALL routes in the ON census (carry-skip census
  below diagnoses which route, if any, fired).
- Why OFF-first banking (blocksreen2 method, NOT
  sequential-ON screening): OFF legs have the
  lever off, so OFF creek episodes are a
  lever-neutral trait. ON legs are then run on
  the banked qualifiers ONLY, and judged on ON
  outcomes (ON evenings are not a subset of OFF
  evenings — lackingline4 proved ON-only evenings
  exist — so the census judges ON outcomes, never
  OFF presence).

## Bank (fixed procedure, no re-selection)

- SCREEN BAND (fixed, fresh, never before used by
  a lacking-line arm): seeds 15000–15499 inclusive
  (500 seeds). No overlap with the 13000–14137
  lacking-line/woodcarry bands.
- PHASE 0 — PILOT (MEASUREMENT.md pilot gate):
  the first 8 screen seeds (15000–15007), OFF legs,
  30 loop-days, same driver and env as below.
  Pilot validates the instrument (errs == 0,
  corpora shape, creek classification present);
  it is part of the screen band, not a separate
  selection, and it is NOT a kill gate for this
  existence hunt (a quiet pilot does not prove
  the trait absent — that is what the 500-seed
  screen measures). If the instrument itself
  breaks (errs > 0, driver crash), the run stops
  for diagnosis.
- PHASE 1 — SCREEN (OFF legs, WOODCARRY=0): all
  500 screen seeds, 30 loop-days each, driver
  scripts/woodcarry3-trace-b.js UNCHANGED, env
  POLICY=nighttravel, COMPETENT_FEAST=0,
  SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
  DAYS=30, into
  evidence/2026-10-29/sim-lackingline-woodshort-b-corpus-screen-off/.
  No thief grant, no taps, no state edits.
- QUALIFIER (fixed before screening): a screen
  seed with ≥ 1 OFF creek evening (travel-refused,
  bucket creek, classified creek, no probe/route
  error). ALL qualifiers become the judged bank —
  no cap, no subset, no seed added after the
  screen, no seed dropped. Expected yield from
  the lackingline2 rate (1.75% of seeds qualify):
  ~9 qualifiers from 500 seeds; the actual count
  is reported honestly whatever it is, including
  below the 8-seed floor (the floor governed the
  rescue-rate estimate in lackingline2, not this
  existence hunt — see minimum-n below).
- PHASE 2 — JUDGED ON LEGS (WOODCARRY=1): all
  qualifier seeds, 30 loop-days each, same driver
  and env, into
  evidence/2026-10-29/sim-lackingline-woodshort-b-corpus-on/.
  The ON legs run for ALL qualifiers even if an
  early qualifier stages.
- PHASE 3 — FULL ON CENSUS FIRST: the analyzer
  (scripts/analyze-lackingline-woodshort-b.js,
  created in this phase) computes the ON census
  over the full qualifier bank IN SCREEN ORDER
  before any staged seed is named. The staged
  seed is re-determined AFTER the census: the
  FIRST qualifier, in screen order, with ≥ 1
  still-refused ON creek evening whose skip is
  wood-short. Judged evening = that seed's FIRST
  such evening. Later wood-short evenings on the
  same seed are secondary evidence, never
  replacements. Ticks/kcal still-refused evenings
  are reported, never substituted for wood-short.
- PHASE 4 — STAGED LEGS (only if ≥ 1 staged
  evening exists): full-tail leg
  scripts/lackingline-woodshort-trace-b.js
  (created in this phase only: identical setup
  to woodcarry3-trace-b.js, plus eveningSayFull
  = ALL say lines of the loop-day) runs the
  staged seed ON, 30 loop-days. Its evening rows
  (excluding the say tail itself) must match the
  judged ON corpus rows exactly — if they
  differ, the tail leg is NOT the judged tail
  and the run stops for diagnosis. If no staged
  evening exists, this driver is NOT built (dead
  code is not landed) and no sense-test is
  claimed.
- DETERMINISM GUARD (regardless of staging,
  conditioned on a judged bank existing): re-run
  the FIRST qualifier seed ON (same driver, same
  env) and require byte-identical corpus JSON.
  A determinism failure is an instrument failure,
  reported as such, and blocks any GO. The
  re-run goes to a worktree staging dir (deleted
  after comparison, never committed).

## Honest staging rules (carried over unchanged)

1. SAME DRIVER FAMILY as woodcarry3/lackingline4:
   scripts/woodcarry3-trace-b.js, stripped (no
   thief grant, no taps), detour OFF, clearhabit
   absent, all separation gates unset/0, substrate
   as above, DAYS=30.
2. NO hand-edited narration strings, NO save edits,
   NO kcal/health top-ups, NO direct position/state
   writes, NO travelTo in the driver, NO steering
   of competent.daily. The ONLY staging instruments
   are (a) the fixed 500-seed screen band and (b)
   seed order within it. No state is ever edited
   to manufacture a shortfall. The carry is NOT
   weakened, the pile is NOT drained, kcal is NOT
   starved by hand — any wood-short evening must
   come from real game state.
3. The refusal must come from REAL game state: the
   evening is travel-refused with hopReturnKind
   block:creek, the recorder probe classifies it
   creek (blockType creek, no probe/route error),
   and the bridgeDecision skip reason matches the
   classification's live numbers — wood-short iff
   woodPlayer < 4 (checked first). A line whose
   named number does not equal the classification's
   live woodPlayer for that evening is a WRONG
   line, not a pass.
4. DO NOT re-bank or re-judge the woodcarry3 band
   (13025, 13067, 13268, 13276) or the
   lackingline4 bank (13 seeds) as judged evidence
   for this arm — those corpora are prior evidence
   cited for trait reasoning only. If the screen
   yields 0 qualifiers, the verdict is
   INSUFFICIENT-DATA on the new band, never a
   reason to import an old bank.

## Primary metric, verdict bars (judge ONLY against these, on the current-master corpus)

PRIMARY: a wood-short lacking-line appears in the
played tail for a genuinely still-refused ON creek
evening AND names what is actually lacking — the
named number equals the classification's live
woodPlayer for that evening.

- DIAG-GO requires ALL of:
  (a) ≥ 1 staged wood-short still-refused ON creek
      evening under the staging rules above
      (minimum-n 1 for this EXISTENCE hunt: one
      honestly-staged evening plus its full tail
      sense-test is the unit of proof, with the
      count reported honestly — see minimum-n
      below; judged evening = the staged seed's
      first such evening);
  (b) the judged evening's full day of say lines
      (full-tail leg) contains the wood-short
      lacking-line, with the named number equal
      to the live classification woodPlayer
      ("the pack holds N logs, and a bridge
      needs 4", N = woodPlayer);
  (c) no OTHER lever line appears in that day's
      tail that contradicts the classification
      (exactly one lacking line for the judged
      evening; the engine's own creek refusal
      line may also appear — it is the engine's
      voice, not a contradiction);
  (d) recorder/classifier errs == 0 on the staged
      seed's ON leg, and the judged evening is
      classified creek with no probe/route error
      (unclassified == 0 for the judged evening);
  (e) determinism re-run of the first qualifier
      seed ON is byte-identical on the pinned
      base (the re-run JSON must equal the judged
      corpus JSON);
  (f) fresh OFF guard legs for the qualifier bank
      on the pinned base contain NO lever
      lacking-line on any evening (checked over
      the corpora's evening say tails; the
      screen OFF legs double as the guard legs
      for banked seeds — same files, same base);
  (g) sense-test passes (below): the tail reads
      as a person lacking something, not a debug
      string, AND the day's play explains HOW the
      lack came about (which morning left the
      pack below 4, and why — pile-floor /
      kcal-floor / cannot-carry / not-at-haven /
      post-rescue return, from the morning carry
      record for the judged loop-day).
- DIAG-NO-GO: a staged wood-short still-refused
  ON creek evening exists, but (b) or (c) fails —
  the line is absent, names the wrong lack, or
  names the wrong number. The evidence file
  reports the exact file/line
  (scripts/policies/woodcarry.js lackingLine +
  its call site), the tail as played, and a
  concrete fix proposal. This arm does NOT
  rewrite game text: a follow-up wording arm
  lands any fix.
- INSUFFICIENT-DATA: the judged bank yields 0
  wood-short still-refused ON creek evenings, OR
  the screen yields 0 qualifiers, OR a guard
  (d)/(e)/(f) fails on instrument grounds. The
  evidence file diagnoses WHY with: the screen
  yield (seeds screened, OFF creek evenings,
  qualifiers); the ON census (ON creek evenings,
  still-refused count, skip breakdown); gate
  distributions AND margins to floors on banked
  ON creek evenings (wood values: how many below
  4, next-above-floor value); the morning
  carry-skip census on banked ON legs
  (pile-floor / kcal-floor / cannot-carry /
  not-at-haven counts, with loop-days, and
  whether any such morning was followed by a
  creek evening the same day); and the day-1
  sub-table (screen seeds with a day-1 creek
  evening: count, or 0 with the day-1 evening
  outcome distribution). The bar is NEVER
  lowered and a refusal is NEVER faked. If NO
  staged evening appears, the verdict is
  INSUFFICIENT-DATA with the gate distributions
  as the diagnosis — that is a complete result,
  not a worker failure, and never a reason to
  lower the bar, repeat sequential-ON screening,
  or re-score against a friendlier metric.
- A miss is NO-GO, never re-scored against a
  friendlier metric mid-run; metric doubts go
  under "metric review" for the NEXT run. Every
  evidence file carries a "metric review" section.

## Secondary (reported, never judged)

- Screen census: seeds screened, OFF creek
  evenings, qualifier count and seed list,
  day-1 creek evenings, errs/unclassified totals.
- ON census: ON creek evenings, still-refused
  count, skip-reason breakdown, wood/kcal/ticks
  distributions AND margins to floors on banked
  ON creek evenings, rescue rate on the banked
  band, per-seed survival and wave reach.
- Morning carry-skip census (banked ON legs):
  counts by skip reason, loop-days, woodBefore /
  pileBefore / kcal for pile-floor and kcal-floor
  mornings, and same-day creek-evening follow-up
  for each carry-skip morning.
- The staged seed's morning carry record for the
  judged loop-day (why the pack held what it
  held), if staged.
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
lackingline4 legs: the refused pattern is visible
inside 30 days (banked episodes run 1–10 evenings
within 30 days). Dead villages stop simulating
(runDays endReason); the +10d tail is a cap, not
a target. If a banked seed's village dies before
a judged evening, that evening does not exist and
the next qualifier is considered — a dead village's
missing evening is never staged post-hoc. A
qualifier whose village dies still counts as a
banked seed; its ON leg is still run.

## Sense-testing (mandatory, in the evidence file)

If a staged evening exists, read the judged
evening's FULL day of say lines end to end from
the full-tail leg and judge meaning: does it read
as a person lacking something (a named lack — the
pack's log count, a named threshold — 4 logs, a
named consequence — no bridge tonight), not a
debug string (no variable names, no "skip:", no
nulls)? Also judge the arc: does the day's play
explain HOW the lack came about (morning carry
record, day's foraging/travel, evening refusal)?
Judge coherence, not just string presence. If the
line is present but reads as a debug string, that
is recorded under sense-testing and counts
against (g) — a present but incoherent line is NOT
a DIAG-GO. If NO staged evening exists, NO
sense-test on a played still-refused tail is
performed or claimed: the evidence file records it
as NOT PERFORMED, and a rescued-evening tail read
(if any) is labeled context only, never a sense
pass for the lacking-line.

## Village assessment (mandatory, in the evidence file)

Plain words: what the banked villages looked like,
who thrived and who died and why, what
knowledge/capabilities were missing, which blank
was filled (this measurement, if DIAG-GO) or
documented. Plus wall numbers (NOT OBSERVABLE —
stated, not claimed).

## Metric review (prereg — doubts carried into the run)

- MINIMUM-N 1, FOR EXISTENCE, STATED PLAINLY:
  one honestly-staged wood-short evening is the
  right unit for an existence proof of a line
  variant, exactly as one staged evening proved
  the ticks-short variant in lackingline4. It is
  NOT a rate claim: no rescue rate, no
  wood-short frequency, no "wood-short is common"
  claim follows from a single evening. Any rate
  claim would need a fresh prereg with a rate
  bar and a sized bank. The count (staged
  evenings found, ON creek evenings, qualifiers,
  seeds screened) is reported honestly alongside
  the verdict so the reader can weigh it.
- QUALIFIER FLOOR, NOT RE-LITIGATED: lackingline2's
  8-seed floor governed a rescue-rate estimate.
  This hunt's bank is whatever the fixed 500-seed
  screen yields; if it yields fewer than 8
  qualifiers, the ON legs still run on all of
  them and the existence bar stands — adding
  seeds after seeing a low yield would be a new
  selection, and dropping to a smaller screen to
  "meet" a floor would be bar-lowering by other
  means. Both are refused here, in advance.
- BASE DRIFT, PINNED NOT WISHED AWAY: trajectories
  move across bases (lackingline3 → lackingline4).
  This run does not assume any old staged evening
  survives; it re-derives staging from the new
  screen on the pinned base. A verdict must never
  be rebased onto a new base without fresh legs.
- CARRY-COST CORRECTION, CARRIED (lackingline3/4
  metric review): when predicting ON ticks from
  OFF ticks, condition on the morning carry record
  — already-carrying mornings preserve the OFF
  ticks number exactly; taking mornings subtract
  the carry cost. Day-1 pile-floor mornings cost
  0 ticks (no take), so a day-1 OFF creek evening
  predicts a day-1 ON wood-short evening exactly
  — IF one occurs. Later carry-skip mornings
  likewise cost 0 ticks.
- WOOD-SHORT MAY BE UNPLAYABLE-BY-CONSTRUCTION
  UNDER THE SHIPPED CARRY: if the screen + ON
  census show wood 4 on every ON creek evening
  AND no carry-skip morning ever precedes a creek
  evening, the next prereg should either name a
  new honest route found in the carry-skip census
  or record wood-short as unplayable-by-
  construction under the shipped carry and close
  that sub-claim on those grounds. Do not weaken
  the carry to stage it.
- If the metric proves wrong, write it under
  "metric review" in the evidence file and propose
  the revision for the NEXT run — never re-score
  mid-run.

## Landing rule

- DIAG-GO: the #1456 wood-short sub-blank is
  closed BY MEASUREMENT on current master (the
  wood-short line is proven in play on the pinned
  base). Land prereg + evidence + screen OFF
  corpora + ON band corpora + tail corpus (if
  staged) + tail-capture driver (if built) +
  analyzer + proof. NO policy change, NO src/js
  change.
- DIAG-NO-GO: land prereg + evidence + corpora +
  proof with the exact file/line, the tail as
  played, and a concrete fix proposal. NO text
  rewrite in this arm.
- INSUFFICIENT-DATA: land prereg + evidence +
  screen OFF corpora + ON band corpora + proof.
  NO post-hoc seeds added after the stop rule;
  extension candidates go in the evidence as a
  next-run note only.
- This worker does NOT merge to master —
  coordinator merges. Report 'committed, pending
  coordinator merge' with the verdict, the staged
  seed/evening (if any), and the evidence paths.
