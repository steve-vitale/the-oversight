# sim-teleingest-a — PRE-REGISTRATION (binding, written BEFORE any judged check with the new mode)

Run: fleshout-20261028T0836Z, arm sim-teleingest-a, axis scale-onramp.
Tooling arm only. No game canon doc governs telemetry-check.js — per the
task, that is stated here and in the evidence file rather than invented.
No game code touched, no baseline rolled/changed/regenerated, no arm
re-judged, no corpus re-scored, docs/TABLE.md and sibling-loop files
(sim-calmbeast-b / sim-wave4flip-b) untouched.

## The blank (from run fleshout-20261028T0634Z, evidence
## evidence/2026-10-28/sim-scale-onramp-round-0634.md, "Telemetry deviation check")

Old invocation on the tbovertime corpus (measured before this prereg,
UNJUDGED baseline documentation, old mode only):

- `*.json` glob: LOUD national 12 -> 0, LOUD table -75% 16 -> 4,
  LOUD wins 16 -> 0, n=10 files.
- `s*.json` glob: same 3 LOUD lines, n=9 files.
- True row values (counted by hand from the 8 per-seed rows):
  nationalEver 7/8, nationalFinal 6/8, table 4/8, entered 3/8, won 3/8.

Two independent defects: (a) bare metric names do not match sweep-row
fields (nationalEver/nationalFinal/won/entered vs national/wins/table);
(b) the glob sweeps summary.json (+ analysis.json on `*.json`) into the
file count, so n is 9 or 10 for 8 seeds.

## Mapping to implement (new opt-in flag `--sweep-rows`, default mode untouched)

A glob-matched file counts as a seed row IFF its parsed JSON is an
object with a finite numeric `seed` property. summary.json and
analysis.json carry a `seeds` ARRAY and no scalar `seed`, so they are
skipped; the output reports `skipped N non-row files` so the skip is
visible, never silent. n reported = number of seed-row files (8 here);
if distinct seed values differ from the row-file count, a warning line
is printed (duplicate-seed corpora are not silently collapsed).

Metric resolution in `--sweep-rows` mode only (requested name -> row field):

| requested | row field | meaning |
|---|---|---|
| national | nationalEver | ever reached national (wall headline) |
| nationalEver | nationalEver | ever reached national |
| nationalFinal | nationalFinal | national at run end |
| table | table | table invited/offered (row field is literally `table`) |
| entered | entered | entered the table |
| wins | won | won (any seat) |
| won | won | won (any seat) |
| exiled | exiled | exiled (absent in these rows = 0) |
| anything else | existing metricValue path lookup, unchanged | e.g. waveReach, deaths |

When any wall metric is requested in `--sweep-rows` mode, the output
also prints one wall line with all five wall counts
(nationalEver/nationalFinal/table/entered/won over n seeds) computed
from the same rows, so the reproduction is visible in one place.

Deviation rules, exit codes, and the quiet line are UNCHANGED. The
judgment still compares the mapped aggregates against the baseline
under the requested metric names. `--update-baseline` in either mode
writes the aggregates under the requested names; underscore-prefixed
keys from the input baseline (e.g. `_regime`) are carried over
unchanged so a baseline re-write cannot silently strip its regime label
(existing test 8 has no underscore keys, so it is unaffected).

## Proof bar (judged, after implementation)

1. Tbovertime reproduction: `node scripts/telemetry-check.js --sweep-rows
   --baseline <scale-wall.json> --current
   'evidence/2026-10-28/perseed-tbovertime-a/*.json' --metrics
   nationalEver,nationalFinal,table,entered,won` (and the old coordinator
   form `--metrics national,table,wins,exiled`) prints aggregates
   nationalEver 7, nationalFinal 6, table 4, entered 3, won 3 with
   n=8 rows and skipped=2 non-row files — EXACTLY the worker wall
   numbers (national ever/final 7/8 / 6/8, table invited/entered 4/8 /
   3/8, wins 3/8).
2. ZERO artifact LOUD lines on that run. Definition (fixed here, not
   moved later): an artifact LOUD line is one whose current value is
   wrong because of field-name mismatch or inflated file count — i.e.
   the old national-disappeared (12 -> 0) and wins-disappeared (16 -> 0)
   lines. A LOUD line whose current value is CORRECT but whose baseline
   sits in a different regime is a REGIME line, not an artifact: the
   scale-wall baseline's own `_regime` note forbids comparing this
   tableseat-nowait substrate against its ~100%-win winseat suite, so
   table/wins regime LOUDs against that baseline are expected, are
   reported as regime (not regression), and do NOT fail this bar. The
   baseline is NOT rolled in this arm.
3. Backward compatibility: `node scripts/test-telemetry-check.js`
   passes UNCHANGED, and the old invocation without `--sweep-rows`
   still produces the old 3-LOUD / n=10 output (proving the default
   path was not silently altered).

## Proof tests (new file scripts/test-teleingest.js, NOT the old test)

- Tbovertime reproduction against the real corpus (aggregates + n=8 +
  skipped=2 + zero artifact LOUD lines, where artifact = a LOUD line
  naming national/wins with current 0).
- Synthetic sweep-row corpus in /tmp (NOT in evidence/): rows with a
  known mix of nationalEver/nationalFinal/table/entered/won, plus a
  summary.json and analysis.json decoy, proving the mode counts rows
  only and maps every alias in the table above.
- Backward compatibility: old-mode invocation on the synthetic corpus
  still counts every file and still reads bare names literally; the
  existing test-telemetry-check.js suite passes unchanged.

## Held / out of scope

- Baseline rolling, regime-segregated baselines, and any re-judgment of
  the tbovertime arm are NOT this arm (coordinator/later run).
- The balanced-panel corpus-ingest exception is NOT closed by this arm;
  this fixes telemetry-check ingest only.
