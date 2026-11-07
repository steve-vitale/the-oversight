# sim-sitstep-b — the sit step: why a village that banks a living pair never sits — PRE-REGISTRATION (arm sim-sitstep-b)

Run: fleshout-loop-b-20261107T0530Z (Loop B). Axis: scale-onramp /
winnability chain (wild ally-join → wave-4 kills → veterans →
readiness-5 release → wave-5 facing → full seat). Committed BEFORE any
judged sim. DIAG only, zero src/js, zero policy edits: replay the frozen
policy `scripts/policies/competent-stageally-a.js` (unmodified) with a
seat-gate recorder that reads live gate state every day. No lever is
changed, no gate/price/deed/readyDemand is touched.

## Canon read before this prereg

- `docs/CANON.md` (manifest) + `docs/TABLE.md` (the design contract for
  `src/js/table.js`): "the table prices the run, never gates on godhood;
  reachable by competent non-god play" (TABLE.md:62). The LESSER seat is
  the reachable bar: waves faced 4/4/3 distinct (w1/w2/w3), 2+ contests
  survived, 2+ crises weathered, scale ≥ regional, integration stage ≥ 2,
  food-thesis deeds (sentimentTaught + feastSurgeUsed). Below it the
  table does not come. The FULL seat (`deedGateReady()`) keeps the
  national/global bar plus all wave bars 5/5/4/3/2, 3 contests, 3 crises.
- The sit chain, read from code (not invented): Arc IV fires when
  `checkArc()` sees want ≥ 3 AND `tableSeat()` is lesser/full
  (`progression.js`); the seat can be taken only from day 90
  (`winDayFloorOk()`); the table is announced at dawn by
  `tableAnnounce()` when `tableWaiting` holds (`ledger.js`); the
  preview (`tablePreview()`) is null until `tableWaiting` AND a live
  seat AND day ≥ 90; the sit itself is a player decision —
  `tableTakeSeat()` from the Haven seat button (`tableOfferSeatTaker`
  → seat-taker choice → `tableScene()`). Only the player chooses the
  village's path and who takes the seat (Steve 2026-10-26).
- STICKY OFFER (Steve 2026-11-06, `table.js` `tableAnnounce`): once
  announced, a dipped bar never withdraws the offer — the table holds
  and re-fires when the case is whole again; sitting stays gated on
  the LIVE seat. So a village that once earned a seat cannot lose the
  offer by dipping — only by never earning it, or by never sitting
  while it holds.
- No canon invented here. If the recorder finds a gate the canon docs
  do not name, the evidence file says so instead of inventing canon.

## Prior evidence read (not re-run, not re-proved)

- `evidence/2026-11-07/sim-stageally-confirm2-b.md` (+ prereg,
  committed 74059c4d): seed 53006 staged held a living pair from day
  89, 42 pair days, max 3 simultaneous veterans, standing 440 at end,
  wave 5 unlocked day 98 (raw standing 290, 2 veterans), readiness-5
  ready 42 days, survived 150d — and NEVER sat: no table, no win.
  Seed 53007 is the contrast: pair day 141, 11 pair days, standing
  199, one short of the wave-5 door (200). The 53006 staged leg
  reproduces the trajfrag unperturbed leg exactly (150d, standing 440,
  11 kills, wave 5, 2 living veterans) — deterministic on this master.
- `evidence/2026-11-07/sim-winnability-round-0420.md` (Loop B 0420Z
  coordinator evidence): this is the tracker's topmost unclaimed blank
  (0420Z blank 1) — the release-to-seat link after the pair.
- `evidence/2026-11-07/sim-trajfrag-b.md`: the staged trajectory is
  fragile (one extra RNG draw flips 3 of 4 seeds), so the recorder
  must read LIVE state every day rather than inferring gates from
  end-state numbers.

## The question, as a chain (read from code, to be measured per day)

Sitting requires every link in order — the recorder classifies each
day by the FIRST failing link, so the verdict is a named gate, not a
post-hoc label:

1. SEAT — `tableSeat()` returns lesser or full. Missing bars named
   individually (w1<4 / w2<4 / w3<3 distinct faced, contests<2,
   crises<2, scale below regional, stage<2, food-thesis deeds split
   into sentimentTaught / feastSurgeUsed).
2. PREVIEW — `tablePreview()` non-null: needs `tableWaiting` (Arc IV
   fired) AND a live seat AND day ≥ 90.
3. ENTRY — preview `ready` (no `tableEntryBlock()` block: run not
   over/won, no active contest, not in combat, Haven stores access).
4. ACTION — the policy calls `tableTakeSeat()` (wrapped and counted;
   the competent policy is READ, not modified — the grep shows no
   `tableTakeSeat` call in `competent.js` or
   `competent-stageally-a.js`, and none in `sim-harness.js` or
   `sweep-compare.js`. If the count stays 0 on a ready day, that IS
   the finding, measured not assumed).
5. SIT — `tableDone` set (the sitting actually locked; the table
   modal then plays a path — the policy answers `tableChoices` only
   if it ever sees one; the count of `chooseTableOption` calls is
   recorded too).

## Method

- Replay band 53001–53008 staged with the frozen policy, 150d
  death-aware, same driver shape as the stageally confirm (daily
  snapshot in the wrapped `policy.daily`, recorder installed on the
  same instrument chain). Band 53001–53008 is DELIBERATELY REUSED
  (a re-run, not a fresh band) — document the reuse; the 8-seed
  corpus is the pilot size and the only spend (DIAG arms take no
  confirm spend beyond the replay itself).
- Recorder `scripts/sitstep-instrument-20261107.js`: reuses the
  stageally instrument (require, not a copy) and adds per-day
  seat-gate fields — seat + full-seat detail, food-deed split, arc,
  tableWaiting / tableAnnounced / tableDone / holding flags, preview
  (seat/doors/ready/why/overtime), entry block, winDayFloorOk,
  scale rank, readiness-5 bars, living veterans + ids (distinct
  living wave-4+ killers from `waveKillLog`), pair-day flag, scholar
  identity, seat-taker options count + best ascension score,
  tableChoices surfaced, and wrapped counts of `tableTakeSeat` /
  `tableOfferSeatTaker` / `chooseTableOption` calls with results.
  Pure reads + counting wraps only; zero game-state writes, zero RNG
  draws; a recording failure is counted in `instrumentErrors` and
  the original call's result is returned untouched.
- Analyzer `scripts/sitstep-analyze-20261107.js`: per-seed pair days,
  per-day gate classification (first failing link), the share of
  53006's pair days each gate explains, the 53007 contrast table,
  wall numbers (national / table / wins, wave 4–5 unlocks, median
  survival).
- Proof `scripts/test-sitstep-20261107.js`: fixture tests for the
  gate classifier (every link in the chain, plus edge cases) and a
  live smoke leg (53006 staged, 150d, /tmp) asserting the recorder
  runs, pair days reproduce (42), sit attempts are counted, and
  instrument errors are 0. Green BEFORE the judged run and after
  every rebase.

## Pre-registered metric (binds the run)

- PRIMARY: classify the blocking gate(s) on ≥ 80% of 53006's 42 pair
  days. DIAG-GO iff a single named gate (or a named ordered set of
  gates) explains the no-sit on ≥ 80% of pair days, with per-day
  gate state shown in the corpus (not a post-hoc label). Name the
  lever that would open it, or flag Steve-call if it is a design
  decision (e.g. the sit being a player-only action the competent
  bot never takes).
- SECONDARY: the 53007 contrast table (same classification on its 11
  pair days — same gate, or a different one?).
- GUARD: instrument errors 0; judged legs reproduce the confirm2
  staged headlines on 53006 (150d, standing 440, 11 wave-4+ kills,
  wave 5 unlocked) — if the replay diverges, the run stops and the
  divergence is the finding, not a number to re-cut.
- A miss is NO-GO, never re-scored against a friendlier metric
  mid-run. If the metric proves wrong, write it under "metric
  review" in the evidence file and propose the revision for the next
  run. Every evidence file carries a "metric review" section.

## Balanced panel (§15)

DIAG arms take no panel — the comparison here is per-day gate state
inside one replayed leg, not a before/after lever comparison. No
compare `.md` is fabricated; say so honestly in the evidence file,
as prior DIAG arms did.

## Corpus

`evidence/2026-11-07/perseed-sitstep-b/` (8 staged files, seeds
53001–53008). Evidence: `evidence/2026-11-07/sim-sitstep-b.md`
(lever played, before/after numbers — replay vs confirm2 staged
headlines — reachability verdict, village assessment in plain words,
blanks filled or documented, metric review, wall numbers).
