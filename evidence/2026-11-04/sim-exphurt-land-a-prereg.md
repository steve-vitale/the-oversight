# sim-exphurt-land-a — PREREG (binding, MEASUREMENT.md §14)

Run: oversight-flesh-out-loop, run fleshout-20261104T1933Z (Loop A).
Worker tree: ~/workspace/worktrees/sim-exphurt-land-a. Axis: food-economy.
Arm: EXPHURT LAND — land the drafted hurt-clause hook for expedition
homecomings and prove it on matched seeds. This arm touches NO sibling
worktree, NO hidden_files file, NO main tree, NO scale-onramp axis,
NO Loop B arm (Loop B is LIVE on scale-onramp: tendbelow-confirm-b,
standaccum-b — untouched).

Committed BEFORE any hook-armed sim. The verdict is judged against
this header, never re-scored against a friendlier metric mid-run.

## CANON

docs/CANON.md read first. No canon doc covers away-return timing or
hurt-return narration (established by three prior arms) — the
mechanism is code-read, not invented canon. The hook below changes
narration text only; it invents no system, no number, no gate.

## STEP 0 — THE BILL s99946 CASE, RESOLVED BEFORE THIS PREREG

The 24-a evidence reported Bill s99946 as a returned-hurt
expedition case (hp 2, closed 1 part later) with ZERO closing-part
lines despite playerAtHavenAtClose=true, hypothesized as capture
gap vs real silence. VERIFIED INDEPENDENTLY from the corpus
transcript (evidence/2026-11-04/perseed-exphurt-24-a/
exphurt-24-a-competent-s99946.json, NOT taken on the coordinator's
word): the closing part (day 4, part 2) DOES contain both lines,
rendered DESCRIPTIVELY because Bill was not yet known to the
player:

- "🧭 A man, maybe 40s, with a limp returns from the wilds hurt
  (health 2/100) — the trip cut short."
- "🧭 A man, maybe 40s, with a limp is back from far past the west
  (strange meat (unknown flesh — test it cautiously), 4 stories,
  a new scar) (Ask them what they saw.)"

The old capture matched on the villager NAME ("Bill") while the
lines use his not-yet-known description form — a capture gap, NOT
a real silence branch. The case is an announced return whose
homecoming line (as usual) does NOT mention hurt: it supports the
blank. This arm's instrument fixes the capture (see INSTRUMENT),
and the proof test shows the s99946 day-4-part-2 pair now captured
as announced. Had verification contradicted the capture-gap
reading, this arm would have stopped here with INSUFFICIENT-DATA
and landed nothing. It did not: the gap is real, the fix is
specified, the run proceeds.

## RE-JUDGED BASELINE (fixed capture, NO new sims)

The existing 24-a corpus re-judged with the fixed capture changes
EXACTLY ONE case in all 24 seeds (Bill s99946, 0 lines → 2 lines);
no other case changes, zero ambiguous attributions, no part with
more than one returned-hurt expedition close. Re-judged baseline:

- M1 0/17, M1-all 0/17, M2 17/17, M3 17/17, D-last 20 (3 disconnected),
  median daysAlive 88, instrument errors 0, unclassified 0.
- The pre-fix numbers (M1 0/16, M1-all 0/17, M2 16/17, M3 16/17)
  are superseded by these for the LAND comparison. The blank
  persists under either capture: 0 announced homecomings mention
  hurt either way. The re-judge is reported loudly, not silently
  re-scored: the LAND judgment below stands on the re-run numbers
  against this re-judged baseline.

## DESIGN (pinned)

- Policy: competent (scripts/policies/competent.js), unchanged.
- Horizon: 100d death-aware cap (comparability with the 24-a band;
  dead villages stop simulating).
- Env: PLENTYDEPRI=1, DEPOSITGATE=1 (shipped defaults, explicit).
- Seeds: MATCHED-SEED re-run band 99933–99956 (24 seeds) — the
  24-a SPEC-READY band. NOT the confirm band 99917–99932: its
  HALF 2 never ran and its HALF 1 baseline is only 2 cases, too
  thin to judge M1 >= 0.80. Stated explicitly so the band choice
  is a decision, not a drift.
- Hook (final wording; requirements binding): write site
  src/js/villager-agency.js, expeditionReturn(vid, playerAtHaven),
  the playerAtHaven line block (bits/suffix/pick(dirs)/this.say
  block). Predicate: returnee hp at expeditionReturn time in
  1..7 — the same gate as shouldHurtReturn, read as
  (this.state.village.health||{})[vid]. Do NOT use
  encounters-includes-'hurt' as predicate. Effect: the SAME
  expeditionReturn line, with a hurt clause appended to its
  suffix when the predicate holds — requirement: the word "hurt"
  in the line, so the M1 classifier and a skimming player both
  see it. Healthy returns keep the template byte-identical.
  pick(dirs) still drawn exactly once, unconditionally. The
  landed hurthome line in src/js/game.js npcNodeTravel stays
  intact and still fires first. No change to survival, pantry,
  trust, deeds, haul, gates, prices, deed bars, or win prices.
  No clock write-back. No RNG-draw change. The playerAtHaven gate
  is unchanged: the hook fires only where the line already fires.
- STOP conditions (SPEC-READY, no trace): if the hook would touch
  the hurthome rule, survival, pantry logic, or need to reorder
  npcNodeTravel/agencyTick, STOP, say so, NO-GO, no game-code
  trace. A miss on any LAND leg below is NO-GO: revert the hook,
  leave no game-code trace. Instrument failure is
  INSUFFICIENT-DATA, reported loudly, not scored.

## INSTRUMENT

- Libs UNCHANGED: scripts/hurthome-b-lib.js,
  scripts/exphurt-a-lib.js, scripts/exphurt-confirm-a-lib.js.
  Byte-identical reuse; the judged numbers come from them.
- NEW scripts/exphurt-land-a-lib.js (pure, proof-tested):
  fixed closing-part capture + LAND judgment. Fixed capture, per
  seed: (1) keep name-matched lines wherever they exist;
  (2) for a RETURNED case with no name-matched line in its
  closing part, fall back to that part's unclaimed 🧭 return
  lines, but only when they form a coherent hurt-return pair
  (>= 1 hurthome line AND >= 1 expeditionReturn line) and this
  is the only unmatched returned case closing in that part —
  otherwise the case stays silent and is flagged ambiguous,
  never guessed. Non-returned cases (healed-away/died/censored)
  get no closing lines by definition: their close part is a
  scan tick, not a return tick. The analyzer applies the fixed
  capture to BOTH corpora (24-a re-judge and land re-run) so the
  comparison is apples-to-apples; the sweep additionally applies
  it before writing per-seed JSONs so the new corpus stores
  fixed lines directly.
- NEW scripts/sweep-exphurt-land-a.js: same harness/policy/
  runDays/env-gate pattern as sweep-exphurt-24-a.js (read, not
  guessed), writing corpus evidence/2026-11-04/
  perseed-exphurt-land-a/. Refuses any seed list other than
  exactly 99933–99956.
- NEW scripts/analyze-exphurt-land-a.js: same metrics as the
  24-a analyzer, fixed capture only.
- NEW scripts/test-exphurt-land-a.js: hook proof (hurt clause
  present + word "hurt" when hp 1..7; absent and template
  byte-identical when healthy; pick(dirs) drawn exactly once
  unconditionally) + capture proof (description-rendered
  s99946 pair captured as announced; exactly one case changes
  across the 24-a corpus re-judge) + seed-band refusal (sweep
  accepts exactly 99933–99956). Proof test MUST be green BEFORE
  the judged re-run.

## PRE-REGISTERED METRICS (judged exactly against this header, §14)

Unit: one event case (hurthome-b-lib). Metrics computed on fixed
capture for both corpora.

- M1 (PRIMARY): among announced expedition returns (returned-hurt
  expedition cases WITH an expeditionReturn line in the closing
  part), the share whose expeditionReturn line mentions hurt.
- M1-all: among ALL returned-hurt expedition cases, the share
  whose expeditionReturn line mentions hurt (silent returns count
  as misses).
- M2: among ALL returned-hurt expedition cases, the share with
  ANY closing-part return line mentioning hurt (hurthome line
  counts).
- M3: among returned-hurt expedition cases, the share with >= 1
  closing-part return line at all.
- D-last (descriptive): share of expedition cases with BOTH
  durations present at last hurt whose gap >= 2.
- Instrument health: 24/24 seeds complete, errors 0,
  unclassified cases 0.
- Median daysAlive delta (matched seeds, post-hook minus
  pre-hook) vs the 24-a baseline median 88d.
- SENSE: return-line pairs quoted and judged for meaning (does
  the homecoming now read as hurt?), at least 5 if more than 5
  exist.
- Wall numbers: reported descriptively from the diag corpus only
  (survived, median daysAlive, wave reach, national/table/wins
  — expect 0 on the last three; no scale verdicts claimed).

## PRE-REGISTERED JUDGMENT (exhaustive)

LAND GO iff ALL of:
  (a) re-run M1 >= 0.80 among announced expedition returns,
  (b) median daysAlive delta (matched seeds, post-hook minus
      pre-hook) >= -5d,
  (c) instrument errors 0,
  (d) node scripts/check.js --quick green after the change,
  (e) hook diff touches ONLY expeditionReturn's line block in
      src/js/villager-agency.js,
  (f) healthy returns byte-identical (proof test).
A miss on any leg is NO-GO for LAND: revert the hook, leave no
game-code trace. Instrument failure (errors > 0, incomplete
corpus, unclassified cases) → INSUFFICIENT-DATA, reported
loudly, not scored. A miss is never re-scored against a
friendlier metric mid-run; a wrong metric goes under "metric
review" for the NEXT run.

## §15 BALANCED PANEL — DECLARED INAPPLICABLE (in advance)

No panel compare file is attached, deliberately, for the same
reason as the three prior arms: scripts/balance-panel.js cannot
ingest event-case corpora; it measures scale/cohort metrics, not
return-line text. The matched-seed event-instrument re-run IS the
before/after comparison. Declared here BEFORE the sims.

## WHAT LANDS, WHAT DOES NOT

- LANDS (coordinator merges; worker does not push, bump, or
  verify live): this prereg; land instrument + proof test;
  land corpus (24 per-seed JSONs + sweep summary); evidence
  file; and, ONLY on a LAND verdict, the hook + its proof test.
  Player-facing narration change: the hook commit message
  carries [needs-eyes].
- DOES NOT LAND: no hurthome-rule change, no gate/price/deed
  change, no clock write-back, no sibling files, no other lane's
  files. Killed arms leave no trace: policy files deleted,
  game-code reverted before the final commit.
