# journey-scale r39 — PRE-REGISTRATION (lane A, leg 3 SCALE, days 80–140 + post-national tail)

**Run id:** oversight-playtest-loop-20261026T1114Z. Rotation read 3 → leg 3 SCALE;
write 3→0 on completion. **Base:** master at run start (1204c06f5 —
journey-deepening r51, corpse-range falsy-0 fix). Rebase if a sibling lands
mid-run; proof re-run after any rebase.
**Arm:** r38's named next question (its metric review, verbatim in spirit):
the table approach after global — r38's 85003 reached GLOBAL at d99 and sat
at d180 with seat none, arc 3, no table seat voiced. The pilgrimage
break-off question is NOT this run's arm: it needs a Steve ruling before a
fix is measured, and r38 already measured the hunger window to 5/5.
**Driver:** `scripts/journey-scale-r39-20261026.js` — the r38 driver with ONLY
run label / EVIDIR / mode changed, PLUS one read-only daily instrument
(`tableWatch`: day, tableSeat() seat + detail, arc, tableWaiting,
tableAnnounced, tableDone, scaleRank, globalLive, overtimeTier — all reads,
no engine inputs change, no policy change, no new convo days). **Analyzer:**
`scripts/analyze-scale-r39-20261026.js` (r38 analyzer + TABLE section,
labels/EVIDIR only). **Policy:** `scripts/policies/scalecourt-nogate.js` —
UNCHANGED. Standing scalecourt.js untouched. Zero src/js change is
pre-planned: r39 is measurement.

## Leg question (from r38's own evidence, not invented)

r38's 85003: national d98, global d99, three covenants seasoned at trust
100/99/83, pantry 23,173, never hungry — and at d180 the census still reads
seat none, arc 3, tableWaiting false. TABLE.md says the table PRICES the run
and the lesser seat is the reachable bar for competent non-god play
(waves 4/4/3 distinct, 2+ contests, 2+ crises, regional+, stage ≥ 2,
food-thesis deeds). r39's question: **on a matched seed that reaches
global, which lesser-seat bars fail, does arc ever reach 4, does
tableWaiting/tableAnnounced ever set, and does the game ever voice the
table approach (announce / withdraw / audit lines) — or does the village
sit at global in silence?**

## Pre-registered metrics (BINDING — §14; a miss is NO-GO, never re-scored)

- **TABLE-DAILY (measurement-binding):** every seed's tableWatch is
  nonempty, covers the run to its final day, and every row carries seat,
  detail, arc, tableWaiting, tableAnnounced, scaleRank. An incomplete
  tableWatch is a NO-GO on the run's method.
- **PILOT CORRECTION to TABLE-DAILY (recorded before the full run, from
  the pilot itself):** the pilot's tableWatch maxDay is 180 while the
  census day is 181 — runDays plays loop-days 1..180 and the census
  reads the day after the last played day. The bar as first written
  (maxDay == census day) is therefore wrong, not the instrument. Corrected
  bar: rows ≥ maxDay (at least one row per played day; duplicate
  same-day rows allowed, as r38's proof correction established) AND
  maxDay ∈ {census day, census day − 1}. The proof test asserts the
  corrected bar.
- **SEAT-AT-GLOBAL (measurement-binding):** for EVERY seed reaching global,
  report seat + full detail on the global day and at end, with each
  failing lesser bar named (waves w1/w2/w3 vs 4/4/3, contests vs 2, crises
  vs 2, rank, stage vs 2, foodDeeds). The verdict on the GAME is judged,
  not passed/failed by existence: a silent global is a finding, not a
  re-score.
- **ARC4 (report-only):** first day arc reaches 4, if ever; max arc per
  seed. Progression.js sets tableWaiting only at arc ≥ 4 with a full or
  lesser seat, so arc 4 without a seat is itself a finding (the door
  stays shut on the seat, not the arc).
- **TABLE-WAITING (report-only):** first day tableWaiting sets, first day
  tableAnnounced sets, if ever; overtimeTier at end (overtime only ticks
  while the seat is announced and unseated — a tier > 0 proves the table
  existed for the player).
- **TABLE-VOICED (report-only):** count per seed of table-approach lines
  in the capture (announce / withdraw / audit / seat lines, same filter
  as r38's table-*.txt dump). Zero lines at global is the silence finding.
- **TABLE-PARITY (method; r38's proposed revision, adopted):** parity is
  judged against a SAME-BASE control, not r38's published numbers — the
  base moved (r51 corpse-range fix) since r38, so matched-seed numbers
  may legitimately move. Control: the r38 driver (EVIDIR path only
  changed, to a scratch dir — never r38's own dir) run on seed 85001 on
  THIS base; bar: r39 pilot 85001 outcome line == control outcome line
  (day, over, popAlive/popTotal, pantryKcal, pilgrimages, lead, seat,
  arc). Any diff is instrument contamination and a NO-GO on the method.
- **BOOK-TITAN (secondary, regression watch):** every titanEscalate −5
  still 100% booked (r36's fix must hold on the new base).
- **PICK-G (picker-cap guard, inherited):** max consecutive dlg:more/goon
  ≤ 1 on every transcript; post-deflect goon = 0. Any violation is a
  regression.
- **BONDS/NATIONAL (report-only):** third bond by d110, national by d140,
  lesser seat, wave 5 — same report as r38, no bar.

## Pilot gate

Seed 85001 runs first (after the control run). If it crashes or
pilgrimages == 0, STOP (same gate as r37/r38). Seeds matched to
r30–r38: 85001–85004. Horizon DAYCAP=180, death-aware stop.

## People check

Read r39's own transcripts in full (convo days 90/120, same driver): the
NPC wants something, options engage or deflect it, endings
resolve/plant/owe. No counts-only verdict.

## Metric review (standing notes carried into r39)

- r38: NO-NUMBER-CHANGE vs r37's published numbers MISSED with cause
  (cook-staffing fallback between bases) while same-base control parity
  held exactly. r39 adopts the revision: parity is judged vs the
  same-base control only.
- r38: telemetry-check against scale.json baseline is LOUD on
  panel-observer fields the journey census does not carry — EXPLAINED,
  not a game deviation. r39 runs the same-shape check (day, popAlive,
  pantryKcal on the same 4 files) and does NOT roll the panel baseline.
  A journey-shaped baseline is still owed by a future run.
- r38: BOOK-POOL-WILD stayed NOT-ENCOUNTERED (fourth run in a row). r39
  does not chase it; poolLive stays report-only via the analyzer's
  existing sections.
