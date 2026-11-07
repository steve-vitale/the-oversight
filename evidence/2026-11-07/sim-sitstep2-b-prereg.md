# sim-sitstep2-b — the sit step, once a seat exists: why a village that earned a lesser seat never sits — PRE-REGISTRATION (arm sim-sitstep2-b)

Run: fleshout-loop-b-20261107T1230Z (Loop B). Axis: scale-onramp /
winnability chain (wild ally-join → wave-4 kills → veterans →
readiness-5 release → wave-5 facing → full seat). Committed BEFORE any
judged sim. DIAG ONLY, zero src/js, zero default flips, no changes to
any existing policy file: replay the FROZEN linkdrive substrate
(`scripts/policies/competent-linkdrive-b.js`, unmodified, composing
onto the frozen staged substrate) on band 53001–53008 with a sit
recorder. No lever is changed, no gate/price/deed/readyDemand is
touched.

## Canon read before this prereg

- `docs/CANON.md` (manifest) + `docs/TABLE.md` (the design contract
  for `src/js/table.js`): "the table prices the run, never gates on
  godhood; reachable by competent non-god play" (TABLE.md:62). The
  LESSER seat is the reachable bar: waves faced 4/4/3 distinct
  (w1/w2/w3), 2+ contests survived, 2+ crises weathered, scale ≥
  regional, integration stage ≥ 2, food-thesis deeds (sentimentTaught
  + feastSurgeUsed). The FULL seat (`deedGateReady()`) keeps the
  national/global bar plus all wave bars 5/5/4/3/2, 3 contests,
  3 crises.
- The sit chain, read from `src/js/table.js` (not invented):
  1. SEAT — `tableSeat()` returns lesser or full (live pricing).
  2. ANNOUNCE — `tableAnnounce()` announces once, but ONLY once
     `winDayFloorOk()` (day ≥ 90) — before day 90 the table "does
     not exist for the player" (no spoilers).
  3. PREVIEW — `tablePreview()` is null unless `tableWaiting`
     (Arc IV fired) AND a live seat AND day ≥ 90; `ready` = no
     `tableEntryBlock()`.
  4. ENTRY — `tableEntryBlock()`: run over/won, active contest,
     in combat / scholar.monster ("Finish the current encounter
     before taking your seat."), Haven stores access 'none'
     ("Return to Haven to take your seat.").
  5. ACTION — the sit verbs `tableTakeSeat()` /
     `tableOfferSeatTaker()` (Haven seat button → seat-taker choice
     → `tableScene()`), both gated on preview + entry block.
  6. SIT — `tableDone` set (the sitting locked; the table modal
     then plays a path via `chooseTableOption`).
- STICKY OFFER (Steve 2026-11-06, `table.js` `tableAnnounce` /
  `tableScene`): once announced, a dipped bar never withdraws the
  offer — the table holds (once per dip, `tableHoldingTold`) and
  re-fires when the case is whole again; `tableWaiting` stays true
  so the Haven offer returns on recovery. **There is no offer-expiry
  mechanism in the code.** "Offer expired before the scholar could
  answer" is therefore a hypothesis to CHECK (dip-while-announced
  days are recorded), not a mechanism the code provides.
- Only the player chooses the village's path and who takes the seat
  (Steve 2026-10-26). No canon invented here. If the recorder finds
  a gate the canon docs do not name, the evidence file says so
  instead of inventing canon.

## Prior evidence read (not re-run, not re-proved) — the bar is set from this

- `evidence/2026-11-07/sim-linkdrive-b.md` + panel + corpus
  `evidence/2026-11-07/perseed-linkdrive-b/` (16 files, base
  7100412b8): linkdrive-armed leg, band 53001–53008, 150d —
  regional 8/8, lesser seats 4/8 (53003 d108, 53004 d37, 53005 d83,
  53006 d64), median survival 128.5d, wave-5 unlocks 4/8.
  Per-seed seat windows read from the corpus (NOT judged here, the
  basis for the bar):
  - 53003: seat lesser d108–153 (45 days), preview 44 days, ready
    25, scholar at Haven on 25/25 ready days, entry-blocked 19 by
    "Finish the current encounter…", sit attempts 0, tableDone never.
  - 53004: seat lesser d37–138 (103 days), preview 50 days, ready
    26, scholar at Haven 26/26, entry-blocked 23 encounter + 1
    "expedition has ended", sit attempts 0, tableDone never. The
    53 seat days with no preview are exactly the pre-90 window
    (seat d37 → floor d90).
  - 53005: seat lesser d83–118 (36 days), preview 29, ready 24,
    scholar at Haven 24/24, entry-blocked 4 encounter + 1 ended,
    sit attempts 0, tableDone never.
  - 53006: seat lesser d64–88 (25 days), preview 0 days, ready 0,
    tableWaiting 24 days, village died d89 — the whole seat window
    sits below the day-90 floor, so the offer never surfaced.
  - 53001/53002/53007/53008: no seat earned (final detail
    `foodDeeds: false` on all four; scale regional but the
    food-thesis deeds unbanked).
  - So on the old corpus the shape is: three seeds with a live,
    ready, scholar-present offer the policy never takes, and one
    seed whose offer never surfaces because the village dies
    before day 90. The bar below is frozen against the REPLAY on
    the current master, not against these old-corpus numbers.
- `evidence/2026-11-07/sim-sitstep-b.md` (0530Z): on the staged
  substrate the seat was never earned — 42/42 pair days `no-seat`
  on scale + feast surge. This arm is tracker blank (3) from the
  0930Z round: the sit action, once a seat exists. The seat IS
  earned on this band now (linkdrive), so the sit verb itself can
  finally be measured.
- Master moved since linkdrive (7100412b8 → current tip): one
  src/js change, `sim-finishersize-a` 8a4ce0eab (committed finish
  for beasts met below their break line — touches field fights),
  plus evidence/tooling landings and a version bump. Trajectories
  may shift (trajfrag shape). The replay is therefore JUDGED
  against its own seat days, with the substrate guard below
  verifying the linkdrive headline reproduces rather than assuming
  it.

## The question, as a chain (read from code, to be measured per day)

Sitting requires every link in order. The recorder classifies each
seat-earning seed's days by the FIRST failing link, and the analyzer
names the per-seed first-blocking mechanism — first in TIME order
over the seat window, with the dominant gate over the post-floor
seat window stated alongside:

1. SEAT — `tableSeat()` lesser/full; missing bars named
   individually from `seatDetail` (w1<4 / w2<4 / w3<3, contests<2,
   crises<2, scale below regional, stage<2, food-thesis deeds split
   sentimentTaught / feastSurgeUsed).
2. FLOOR — seat earned but preview null while day < 90
   (`winDayFloorOk()` false; announce suppressed, no spoilers).
3. PREVIEW — seat earned, day ≥ 90, preview null:
   `tableWaiting` false (Arc IV never fired) vs true (unknown).
4. ENTRY — preview non-null but not ready: the `tableEntryBlock()`
   `why` string, tallied (encounter / contest / ended / away).
5. SCHOLAR — on preview-ready days: scholar at Haven
   (`playerAtHaven()`), scholar alive, seat-taker options present.
6. ACTION — the policy calls `tableTakeSeat()` /
   `tableOfferSeatTaker()` (wrapped and counted, msg recorded; the
   linkdrive policy is READ, not modified — grep shows no sit-verb
   call in `competent-stageally-a.js` or
   `competent-linkdrive-b.js`. If the count stays 0 on a ready day,
   that IS the finding, measured not assumed).
7. SIT — `tableDone` set (the sitting locked; `chooseTableOption`
   calls counted too).

Candidate mechanisms per the brief, mapped to the chain so none is
assumed: seat never offered = 1/2/3; offer expired = NO code
mechanism (sticky offer) — checked as dip-while-announced days;
scholar absent/unavailable = 5; sit verb never called = 6; gate
unmet = 1/4, which gate named from `seatDetail` / `why`.

## Method

- Replay band 53001–53008 linkdrive-armed ONLY, 150d death-aware,
  same driver shape as linkdrive (daily snapshot in the wrapped
  `policy.daily`, recorder on the same instrument chain).
  Band 53001–53008 is DELIBERATELY REUSED (a re-run, not a fresh
  band) — document the reuse; the 8-seed corpus is the pilot size
  and the only spend (DIAG arms take no confirm spend beyond the
  replay itself).
- Legs: EIGHT files — the linkdrive-armed replay only. The
  existing linkdrive corpus IS the comparison baseline (its armed
  leg on base 7100412b8); the staged baseline is NOT re-run —
  staged earns no seats (sitstep-b measured it twice), so it adds
  nothing to the sit question. The substrate guard below verifies
  the armed headline reproduces on the current master rather than
  assuming it.
- Recorder: `scripts/sitstep-instrument-20261107.js` reused VERBATIM
  (require, not a copy — seat + full-seat detail, food-deed split,
  arc, tableWaiting / tableAnnounced / tableDone / holding flags,
  preview, entry block, winDayFloorOk, scale rank, readiness-5
  bars, living veterans, pair-day flag, seat-taker options,
  tableChoices surfaced, wrapped sit-verb counts). Driver-side
  snapshot extensions only (the linkdrive-driver pattern, no
  instrument edit): scholar at Haven (`playerAtHaven()`),
  scholar alive, seat-window tracking (first seat day, seat days,
  dip-while-announced days, last seat day), and a sit-verb msg
  wrap outside the instrument wrap (records the returned `msg`;
  returns the original result untouched, never throws into game
  code).
- Driver `scripts/sitstep2-driver-20261107.js`: LINKDRIVE policy,
  sitstep instrument, OUTDIR/RUN env, refuses to overwrite.
- Analyzer `scripts/sitstep2-analyze-20261107.js`: per-seed seat
  window, per-day gate classification (extended classifyGate:
  `sat | no-seat | floor-day90 | no-preview-waiting |
  no-preview-unknown | entry-blocked | offer-not-taken |
  sit-refused | sit-called`), the first-blocking mechanism per
  seat-earning seed (time order + post-floor dominant gate),
  scholar-at-Haven share on ready days, wall numbers (national /
  table / wins, wave 4–5 unlocks, median survival), linkdrive
  headline reproduction table.
- Proof `scripts/test-sitstep2-20261107.js`: fixture tests for the
  extended classifier (every gate in the chain, plus edge cases:
  pre-90 seat window, dip-while-announced, ready-but-absent
  scholar, refused sit verb) and a live 1-seed smoke leg (53004
  linkdrive, 150d, /tmp) asserting STRUCTURAL invariants only
  (run completes, daily rows present, instrument errors 0,
  preview non-null ⇒ seat ≠ none and day ≥ 90, sit attempts an
  array). Green BEFORE the judged run.

## Pre-registered metric (binds the run)

- PRIMARY (DIAG-GO) iff ALL of:
  (a) the first-blocking sit mechanism is named, with per-day gate
      state in the corpus, on EVERY seed that earns a seat offer in
      the replay; AND at least 3 seeds earn a seat offer (fewer
      than 3 = under-powered question, verdict DIAG-NO-GO with the
      naming still reported in full).
  (b) SUBSTRATE GUARD: the replay reproduces the linkdrive armed
      headline — regional 8/8 AND lesser seats ≥ 3/8 AND median
      survival within ±20d of linkdrive's 128.5d (108.5–148.5d).
      If the guard fails, the substrate moved on the new master:
      verdict DIAG-NO-GO (substrate moved), the mechanism naming
      is still reported in full, and the divergence — not a
      re-cut number — is the finding.
  (c) INSTRUMENT: 0 instrument errors on the judged corpus.
- SECONDARY (reported, not gated): every no-seat seed's missing
  bars named from live `seatDetail`; scholar-at-Haven share on
  preview-ready days; sit-verb call count (expected 0 — the
  policy has no sit drive; if it ever calls, the `ok`/`msg` is
  the finding).
- A miss is NO-GO, never re-scored against a friendlier metric
  mid-run. If the metric proves wrong, write it under "metric
  review" in the evidence file and propose the revision for the
  next run. Every evidence file carries a "metric review" section.

## Balanced panel (§15)

DIAG arms take no panel — the comparison here is per-day gate
state inside one replayed leg, not a before/after lever
comparison. No compare `.md` is fabricated; say so honestly in
the evidence file, as prior DIAG arms did.

## Neutrality / cost guards

- Zero src/js changes, zero policy-file changes, zero default
  flips. The recorder is pure reads + counting wraps; a recording
  failure is counted in `instrumentErrors` and the original call's
  result is returned untouched. The msg wrap is outside the
  instrument wrap and likewise never throws into game code.
- The driver refuses to overwrite existing corpus files.
- Telemetry deviation check: run if `scripts/telemetry-check.js`
  exists (baseline `scale-wall.json`, metrics national, table,
  wins, exiled); a LOUD line is a same-run investigation item, and
  the recorder corpus is not Game telemetry — report the refusal
  honestly if the script declines it, as prior arms did.

## Corpus

`evidence/2026-11-07/perseed-sitstep2-b/` (8 linkdrive-armed files,
seeds 53001–53008). Evidence: `evidence/2026-11-07/sim-sitstep2-b.md`
(lever played, before/after numbers — replay vs linkdrive armed
headlines — reachability verdict, village assessment in plain
words, blanks filled or documented, metric review, wall numbers).
