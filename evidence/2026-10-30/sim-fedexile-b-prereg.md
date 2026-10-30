# sim-fedexile-b — PREREGISTRATION (written BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T2230Z,
arm sim-fedexile-b, axis food-economy (fed-exile question).
Worktree sim-fedexile-b. DIAG ONLY: measurement, zero src/js
changes, zero policy-default flips, zero new policy files, zero
edits to any existing policy file. The variant leg reuses
scripts/policies/pressb-diag.js VERBATIM (landed by the
1928Z closeout into this base); this arm adds no behavior.
Sibling trees (loop A sim-*-a, gapscomp-*, journey*), sibling
loop-B trees (sim-strandbank-b, sim-kcalshort-b), claims, and
branches are never touched. The main tree is never touched.
The strand set below is re-derived by THIS arm's own legs on
the pinned base; no sibling arm's output is used as input
(sim-strandbank-b runs in parallel and its results are not
this arm's input, by task order).

## The question (open finding from sim-pressb-b)

Loop-B arm sim-pressb-b (run fleshout-loop-b-20261030T1928Z,
evidence/2026-10-30/sim-pressb-b.md §§3–4) found the
morning-press behavior keeps the villager FED through a longer
exile: variant strand evenings 7–23 (17 still) vs control
7–16 (10 still), home day 24 vs day 17, wave 2 reached vs
wave 1, same bearer death ("the wild") delayed 6 days
(day 23 vs day 17). Open question, stated as a design question
for the landing decision, not a claim: is "fed but still
stuck" acceptable exile behavior, or should the routine
convert fed mornings into wood-seeking days? This arm answers
it with counts, not assumption: (1) the fed-vs-unfed strand
length delta, paired per stranded villager; (2) the
death-delay; (3) the wood-seeking conversion rate on fed
mornings — how many fed mornings are followed by a
wood-seeking day, and how many are not.

## Canon (read before judging)

- docs/CANON.md read first, then docs/PRESERVATION.md (food
  ladder; unknown food is not food until identified at camp)
  and docs/TIME-ECONOMY.md (forage 16 ticks + 60 kcal effort;
  fell a tree 96 ticks + 80 kcal; eat 1 tick + 0 kcal;
  metabolic burn ~2200 kcal/day). No canon doc covers
  exile behavior or wood-seeking conversion — the engine
  facts below are code reads, stated, not invented canon.
- Perception law (Steve 2026-10-28, binding): this arm adds
  no behavior and no fire gate, so no perception question
  arises; the wood-seeking scan reads only the day's own
  say lines (the villager's own narrated day), never a
  roster, snapshot, or whole-tile feed.

## Definitions (the judged quantities)

- STILL EVENING: an evening row whose woodcarry record has
  bucket 'creek' AND rescued false (the woodcarry
  classification's binding is reported per evening as
  wood-short / kcal-short / ticks-short, never assumed).
- STRAND: a maximal run of consecutive loop-days whose
  evening rows are all still evenings. STRAND LENGTH (in
  exile days) = the count of still evenings in the run.
  The strand's RETURN is the first non-still evening after
  the run (rescued crossing, haven evening, or run end).
- PAIRED STRAND: strands are paired per seed by order of
  appearance (1st control strand with 1st variant strand,
  etc.). A variant strand that starts on the same loop-day
  as its control counterpart is the SAME exile extended,
  not a new exile; a strand with no counterpart on the
  other leg is reported UNPAIRED, never force-paired.
- STRAND MORNING: the morning row (loopDay) of a
  still-evening loop-day, i.e. the morning that opens a day
  ending still. The paired morning table covers 100% of
  strand mornings on BOTH legs: every control-strand morning
  and every variant-strand morning, with variant-only
  mornings (mornings past the control strand's end)
  flagged VARIANT-ONLY, following pressb's coverage lesson
  (a strand-changing behavior creates mornings with no
  control counterpart; they are reported in full, not
  hidden and not counted as missing comparators).
- FED MORNING (primary denominator for the conversion
  rate): a variant-leg strand morning on which the pressb
  policy FIRED (a pressbStore attempt exists for that
  loopDay, i.e. the villager pressed forage on the wake
  tile and ate in that morning). SECONDARY split: all
  variant strand mornings, split fired vs skipped, each
  with its same-day wood-seeking verdict, so the reader
  can re-judge the conversion question under either
  denominator.
- WOOD-SEEKING DAY (same loop-day as the fed morning —
  the day that follows that morning): the day's fullDaySay
  lines contain at least one wood-GAIN line or
  wood-gain-attempt line, grounded in engine narration
  (src/js/game.js cutTree/clearBrush/clearBlockage):
  gain lines "comes down with a crack that echoes. +N
  wood." (fell), "You clear the brush. +1 wood
  (brushwood).", "You cut through the fallen tree. +2
  wood."; attempt lines "Nothing to cut there."
  (cutTree on a non-tree cell). EXCLUDED, never counted
  as seeking: creek refusal lines ("No bridge tonight —
  the pack holds N logs, and a bridge needs 4.",
  "the creek runs fast here"), warmth/fire lines
  (spending logs is not seeking wood: "The tinder
  catches.", "feed it branches or a log"), travel
  lines, and forage lines. Matched lines are reported
  verbatim per fed morning so the count is auditable.
  SECONDARY numeric check, reported alongside, never
  substituted: DAYTIME WOOD DELTA = the evening
  woodcarry classification's woodPlayer minus that
  morning's morningWood (positive = wood gained during
  the day, by whatever verb; zero/negative = none).
  A day counts as wood-seeking under the PRIMARY
  line-scan definition; the numeric delta is the
  cross-check (a positive delta with no gain line, or a
  gain line with no positive delta, is reported as a
  scan/delta disagreement, not reconciled silently).
- BEARER DEATH: a deaths-stream entry with player true.
  DEATH-DELAY (per seed) = variant bearer-death day minus
  control bearer-death day, where both legs have a bearer
  death; if either leg has none (survived), the delay is
  CENSORED (reported as such, never as 0 or as a number).
  ENDREASON PAIRING: control vs variant endReason per
  seed, plus bearer-death cause pairing (same cause?
  same who?), plus all-deaths counts (reported, not
  barred — pressb showed the stream mixes kills, villager
  deaths, and bearer deaths).
- WALL NUMBERS: national / table / wins, wave reach
  (1–5), median survival, per seed. Expected: structural
  zeros on national/table/wins — the 30-day evening legs
  contain no national/table/win content (pre-seat, no
  field) — reported as the window's structural value
  with that reason, not as a game verdict. Wave reach
  and median survival are real numbers on this window.

## Base pin (binding)

- PINNED BASE: worktree HEAD at prereg writing time, full
  hash 359a384cc3ff7516235c52777ef66bccd4c01f11 ("Loop B
  closeout: food-economy round 1928Z (3 arms landed,
  evidence only)"). The prereg commit adds ONLY this file,
  so all legs run on pinned-base game code verbatim. This
  base is NEWER than pressb's pin (c1b310c9), so NOTHING
  is quoted from pressb's censuses, strand days, or
  death-days as current-base behavior: control legs,
  variant legs, and all pairings are re-derived on the
  pinned base and judged against those fresh numbers.
  Divergence from pressb values is DRIFT to report
  (driver diff first, then base diff), never a failure
  to hide.
- Tracked diff guard: at evidence time, `git diff` of src/
  between pinned base and final tree must be EMPTY, and
  scripts/policies/ must be byte-identical to base (no
  new policy file, no edit). New files are measurement
  scripts only (scripts/analyze-fedexile-b.js,
  scripts/test-fedexile-b.js) plus evidence files.

## Implementation (reuse, no reinvention)

- VARIANT POLICY: scripts/policies/pressb-diag.js
  UNMODIFIED (PRESSB=1 arms it; PRESSB=0 delegates
  untouched — the control leg runs the same stack with
  PRESSB=0, so wrapper overhead is identical).
- DRIVER: scripts/pressb-trace-b.js UNMODIFIED (stack
  pressb(warmed(woodcarry(nighttravel)))); OUTDIR override
  only. Same env gates as pressb (COMPETENT_FEAST=0
  SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1 POLICY=nighttravel
  WOODCARRY=1 DAYS=30), plus PRESSB=0|1 (required,
  explicit) and WOODWARM=0|1 (required: 0 = guard, 1 = ON).
  The driver already records, per loop-day: morning row
  (wake tile/cell, kcal, morningWood, sweep), evening row
  (woodcarry record incl. classification binding +
  woodPlayer, warmth record, pressbAttempt/pressbSkip),
  fullDaySay on still-refused creek evenings AND on
  pressed mornings (the sense read and the wood-seeking
  scan both read these lines), deaths stream (day, kind,
  who, cause, player), daysAlive, endReason,
  maxWaveUnlocked. No driver change is needed; any
  driver edit voids the reuse claim and must be disclosed.
- ANALYZER: scripts/analyze-fedexile-b.js (new, pure
  reads): strand extraction per leg, per-seed pairing,
  strand-length deltas (median + per-seed), death-delay +
  endReason/bearer-death pairing, fed-morning table with
  wood-seeking line-scan + daytime wood delta, guardrail
  census (creek/still/rescued per leg, errs, stalls),
  wave reach, wall numbers, and the §15 paired compare
  .md (see Panel section). Analyzer output:
  evidence/2026-10-30/sim-fedexile-b-census.json,
  sim-fedexile-b-morning-table.json,
  sim-fedexile-b-compare.md.
- PROOF: scripts/test-fedexile-b.js — pure unit tests
  (strand extraction incl. rescued breaks and run-end
  strands; strand pairing incl. unpaired strands; median
  delta; wood-seeking scan positives incl. all three
  gain lines + the attempt line, and negatives incl.
  refusal lines, fire lines, travel lines, forage lines;
  bearer-death day extraction incl. censored case) PLUS
  corpus checks (corpora present for all 10 bank seeds
  on both ON legs; pressb errs 0 on judged legs; paired
  morning table covers 100% of strand mornings on both
  legs; determinism file byte-identical; src/ diff empty;
  scripts/policies/ byte-identical to base). Proof runs
  on the judged corpora; the pure tests run standalone.

## Legs (all on pinned base, 30 loop-days, bank order)

Bank (10 seeds, wakeforage/pressb order): 15003, 15009,
15091, 15211, 15215, 15220, 15221, 15337, 15376, 15439.
Horizon justification (30 loop-days, reused from
woodday/walktree/wakeforage/pressb, NOT a fixed 200d):
the strand cycle closes inside it (pressb ON strand
days 7–23, both < 30); longer horizons add no strand
information on this bank. Death-aware: the driver records
daysAlive / endReason per seed and stops at death; any
leg death is reported per seed, never averaged away.
No pilot/confirm split is pre-registered for this DIAG
census: the denominator is the fixed bank's strand set
itself (a population, not a sample), and the task's
DIAG-GO bars are census-completeness bars, not lever
bars — splitting the bank into pilot/confirm would
change the strand set under measurement. The full
10-seed paired legs ARE the judged legs.

- BAND-REPRODUCTION REPORT (not a bar): guard legs
  (WOODWARM=0) control + variant on all 10 bank seeds,
  census compared per-seed to pressb's guard census
  (12/3/9 on pressb's base). Base moved since pressb's
  pin, so drift is EXPECTED; the report names it. The
  judged set is the FRESH strand set, whatever it is
  (bank-composition clause, same standing as pressb's
  prereg: full coverage of the stranded mornings that
  exist satisfies the bar's intent; a seed that does
  not strand is a bank property, never a bar to lower).
- JUDGED LEGS: ON legs (WOODWARM=1) control (PRESSB=0)
  + variant (PRESSB=1) on all 10 bank seeds, into
  evidence/2026-10-30/sim-fedexile-b-corpus-on-control
  and -on-variant. Guard legs into
  sim-fedexile-b-corpus-guard-control and -guard-variant.
- DETERMINISM re-run: 15215 variant ON leg re-run
  (SEEDS=15215, same env) into
  evidence/2026-10-30/sim-fedexile-b-corpus-determinism,
  byte-compared to the judged 15215 variant file. A
  mismatch stops the run (instrument non-determinism,
  never re-scored).

## Bars (DIAG-GO, judged exactly as written; a miss is NO-GO, never re-scored)

- (a) PAIRED TABLE COMPLETE: the morning table contains
  a row for 100% of strand mornings on the current-master
  strand set, on BOTH legs (control-strand mornings +
  variant-strand mornings, variant-only flagged), each
  row carrying seed, loopDay, leg, wake tile/cell,
  morning kcal, morningWood, press fired?, press E,
  same-day evening outcome (bucket/rescued/binding),
  wood-seeking verdict + matched lines, daytime wood
  delta. Any strand morning missing from the table fails
  (a) outright.
- (b) DELTA QUANTIFIED: fed-vs-unfed strand-length delta
  reported as median across paired strands AND per-seed
  (per paired strand), with the per-seed still-evening
  day-ranges; death-delay quantified in days per seed
  (or CENSORED where a leg has no bearer death);
  endReason + bearer-death cause pairing reported per
  seed. Any of these three missing fails (b).
- (c) WOOD-SEEKING CONVERSION ANSWERED WITH COUNTS: the
  fed-morning conversion rate reported as N wood-seeking
  / M fed mornings (primary denominator = fired
  mornings), with the secondary fired-vs-skipped split
  and the numeric daytime-delta cross-check, and every
  matched line quoted. A qualitative answer without the
  counts fails (c); the counts themselves, whatever
  they are (including 0/M), satisfy (c) — the bar judges
  the measurement, not the behavior.
- (d) DETERMINISM + PROOF: at least one leg re-run
  byte-identical (15215 variant ON, above); proof test
  green on the judged corpora. Either failing fails (d).
- Otherwise DIAG-NO-GO: the arm reports NO-GO with the
  exact bar that failed; instrument scripts + evidence
  commit as a measurement record labeled NO-GO. On
  DIAG-GO the verdict is a MEASUREMENT verdict only:
  it certifies the fed-exile numbers, it does NOT land
  any behavior, flip any default, or rule the design
  question — the "fed but still stuck, acceptable or
  convert to wood-seeking?" decision stays with the
  coordinator / Steve, now with counts in hand.
- SECONDARY (reported, NO bar): per-seed creek/still/
  rescued variant-vs-control; evening binding mix on
  fed vs unfed strands (wood-short vs kcal-short);
  realized net kcal per press (from pressb attempts);
  wave reach (1–5) and wall numbers (see above);
  villager-behavior sample + one sense-read fed-exile
  story (below).
- SENSE-TEST: one fed-exile story read end to end on the
  variant corpus (a variant-only fed morning's full day
  lines from waking through the evening, plus the press
  + eat narration, judged for meaning: does it read as
  a fed person still stuck, or as a person working their
  way out?) plus a villager-behavior sample out of the
  sims (goals, routines, dialogue, reactions; anything
  robotic, static, or repeated is flagged, not chased
  mid-run — appended to sim-findings.md per loop rules).
- PANEL (§15): the official balance-panel driver cannot
  express this arm — its policies are sweep-compare
  registry policies, not the nighttravel+woodcarry+
  woodwarm strand stack, and the 23-metric contract has
  no strand-length / fed-morning / wood-seeking metrics
  (same standing as sim-pressb-b, sim-armorstock,
  sim-shellrevive-b). The §15 compare attached to the
  evidence is therefore the paired compare .md written
  by scripts/analyze-fedexile-b.js (per-seed paired
  control-vs-variant on the pre-registered metrics +
  guardrail metrics: survival, death causes, wave
  reach), with this deviation stated on its face.
  Running the official driver on a different stack/
  horizon would measure a different question and is NOT
  done as a substitute. This is a DIAG census with a
  paired comparison judged for completeness, not a
  before/after lever claim — the compare .md is attached
  because a paired comparison IS judged here (the
  census pairs control vs variant legs); it is never
  presented as an official panel run.

## Forbidden (violations void the run)

- Any src/js change; any edit to scripts/policies/* (or
  any new policy file); flipping any default; quoting
  pressb's old-base strand days, death-days, or wave
  reach as current without the fresh legs above; using
  any sibling arm's output (including sim-strandbank-b)
  as this arm's strand set; touching sibling trees,
  claims, branches, or the main tree; writing sweep
  outputs to /tmp (worktree evidence/ only).

## Metric review (for THIS run's evidence file, and the NEXT run)

- Doubts to answer in the evidence file: whether strand
  length in still evenings (vs days-to-return incl. the
  rescue day) is the right "exile days" unit (still
  evenings are the nights spent stuck; the return day is
  reported alongside so the reader can re-judge under
  either unit); whether pairing strands by order of
  appearance is safe on this bank (it is safe only if
  each leg has at most one strand per seed on the judged
  legs — if any seed shows two strands per leg, the
  pairing rule must be revisited in the evidence, not
  silently applied); whether the same-day definition of
  "followed by a wood-seeking day" is right (a fed
  morning's wood-seeking could in principle land the
  NEXT day, after the day's travel — the evidence must
  report next-day wood-seeking for fed mornings too, as
  a secondary count, so the primary same-day rate is
  not the only number); whether the line-scan misses
  wood-seeking that leaves no say line (e.g. a walk
  toward a tree that never acts — the numeric daytime
  delta and the morning sweep's adjacent-source counts
  bound this: a walk-to-tree day with no verb and no
  gain is invisible to both, and the evidence must say
  so as a limitation, not claim full coverage).
- If the verdict is DIAG-GO, the next step is the
  coordinator's design decision on the fed-exile question
  (accept fed-but-stuck, or commission a wood-seeking
  conversion behavior as a new measured arm), NOT another
  measurement of the same mornings. If DIAG-NO-GO, the
  next run must name the bar that failed and fix the
  instrument, not re-ask the question on the same legs.
