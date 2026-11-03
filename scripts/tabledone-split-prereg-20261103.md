# Pre-registration — tableDone recorder split (fleshout-20261103T0115Z, axis scale-onramp)

Instrument ONLY. Zero game-code change, zero policy change. The split changes
how the recorder separates two states the game already distinguishes; it must
not change what the game records as having happened.

## Background (from evidence/2026-11-02/sim-scale-onramp-round-0011.md)

The landed recorder's driver (`scripts/fightoutcome-driver-20261102.js:142`)
collapses the end-of-run table latch into one field:

```js
if (pg.tableWaiting || pg.tableDone) table = 1;
```

so `tableDone` cannot be reported as a distinct flag from any corpus the
driver wrote. The next screen needing `tableDone` must split the field first.
This arm is that split.

## Source-data check (done at scoping, before any judged verification)

The game DOES distinguish the two states at record time — no inference is
needed, so the split is fillable, not blocked:

- `src/js/progression.js:705,820` and `src/js/table.js:638` set
  `pg.tableWaiting = true` (invitation pending / seat offered, not yet sat).
- `src/js/table.js:713-714` (win-day-floor re-offer) and `:728` (sitting)
  set `pg.tableDone = true` AND `pg.tableWaiting = false` (seat taken).
- `src/js/table.js:639` (re-open) resets `tableDone = false` with
  `tableWaiting = true` — the two booleans move independently in code even
  though the engine normally holds them mutually exclusive.

`Game.progState()` returns the live progression object carrying both
booleans, so the driver can read both at the same end-snapshot where it
already reads the collapsed latch. Nothing is inferred from the latch, from
`won`, or from any transcript line.

## Primary metric

On corpora / fixtures containing (a) tableWaiting-only runs, (b) tableDone
runs, and (c) neither, the recorder emits distinct `tableWaiting` and
`tableDone` flags correctly for every run.

## GO threshold

100% correct classification on all available real-corpus runs in those
classes, PLUS 100% on the proof fixtures. Judged as follows:

- Real corpora in recorder format: `evidence/2026-11-02/perseed-heraldband-widen`
  (8 seeds, fo-closecommit r1 files) and `evidence/2026-11-02/perseed-fightoutcome-a`
  (same driver family). These corpora were written with the collapsed field
  ONLY — no `tableWaiting`/`tableDone` keys exist in any per-seed file (checked
  by grep at scoping). Therefore they CANNOT supply classes (a) or (b) as
  distinct real-corpus results: a collapsed `table=1` cannot be un-split
  without inference, and this arm refuses to infer. For these corpora the
  verdict is backward-compatibility only (see below), and the absence of a
  real tableDone corpus in recorder format is stated plainly, not papered over.
- Proof fixtures (clearly labeled FIXTURE, not real corpus results): synthetic
  per-seed records built from the real corpus shape, with the split fields set
  to (waiting=1, done=0), (waiting=0, done=1), (waiting=0, done=0), and the
  legacy-only shapes (table=1 with no split fields → both UNKNOWN, never
  guessed; table=0 with no split fields → both 0). The shared extraction
  helper is also unit-tested directly against synthetic `progState()` objects
  in all four boolean combinations.
- A real tableDone corpus in recorder format does NOT exist at the time of
  this pre-registration. The first future screen that runs the NEW driver
  will produce one; until then, class (b) is proven by fixture + by the
  code-level source check above (the driver reads the same two booleans the
  engine sets), not claimed as a real-corpus result.

## Backward compatibility (required, part of GO)

- The driver keeps emitting the legacy collapsed `table` field
  (`table = tableWaiting || tableDone`) alongside the two new fields, so
  existing screens and the analyzer's existing `wall.table` number are
  unchanged.
- The analyzer keeps every existing field and leg identical. It ADDS
  `wall.tableWaiting`, `wall.tableDone`, and `wall.tableUnknown` (legacy-only
  `table=1` runs whose split is unknowable). Old corpora analyzed with the
  new analyzer must produce identical values for all pre-existing fields;
  only the three new wall fields may differ (they are new, not changed).
- Old corpora must NEVER be re-labeled: a legacy `table=1` run reports
  `tableWaiting=null, tableDone=null` per-seed (unknown), never a guessed 0/1.

## Method

1. Add `scripts/fightoutcome-tableflags.js`: `tableFlags(pg)` →
   `{ tableWaiting, tableDone, table }` (0/1 ints, from the two booleans
   only; missing/non-object pg → all 0 with no throw) and
   `splitFromLegacy(rec)` → per-record split resolution honoring the
   unknown rule above. Pure functions, no game import.
2. Driver: replace the collapsed-only computation with `tableFlags(pg)` and
   emit `tableWaiting`, `tableDone`, and legacy `table` in the per-seed JSON
   and the stdout summary line. No other driver change.
3. Analyzer: use `splitFromLegacy` for wall sums; add the three new wall
   fields and per-seed split fields to `analysis.json`; no existing leg,
   floor, or determinism logic touched.
4. Proof: `scripts/test-tabledone-split-20261103.js` — helper unit cases
   (all four boolean combos + missing pg), fixture-corpus analyzer cases
   (waiting-only, done, neither, legacy-unknown, legacy-zero), and a replay
   comparison: copy the real `perseed-heraldband-widen` corpus to /tmp
   (analyzer writes analysis.json into the dir, so never run it in place),
   run old analyzer vs new analyzer, diff all pre-existing fields.
5. Sense check: read at least one real record/transcript snippet and confirm
   the split semantics match what the game meant (table.js sitting lines
   above; round-0011 transcript: "Road inactive, tablePhase done — a table
   ..." describes a sat table, i.e. the done class).

## What future screens should use (to be confirmed by the proof)

- `tableDone` (new): the seat-taken flag — use this for "table reached and
  sat" screens. `tableDone=1` means the table sequence sat, regardless of
  `won`.
- `tableWaiting` (new): invitation pending, seat not yet taken — use this
  for "table offered but not sat" screens. Never read it as reach.
- `table` (legacy): the old latch (`waiting OR done`) — kept only so old
  screens and old corpora keep working. New screens must NOT use it where
  the waiting/done distinction matters; it over-counts reach.
- Per-seed `tableWaiting=null` / `tableDone=null` in analyzer output means
  UNKNOWN (legacy corpus, `table=1`, split unrecoverable) — exclude from
  both numerators, count in `wall.tableUnknown`, never treat as 0.

## NO-GO / BLOCKED conditions

- If the source data at record time truly did not distinguish the two
  states, report BLOCKED with that evidence and do NOT fabricate a split.
  (Scoping already shows it does distinguish — this condition is not met.)
- If the replay comparison changes any pre-existing analyzer field, NO-GO
  until the analyzer change is narrowed to additive-only.

## Horizon / seeds / policies

Not applicable: instrument-only arm, no sims run, no policy touched. Replay
uses the existing 8-seed heraldband-widen corpus as-is; no re-simulation.
