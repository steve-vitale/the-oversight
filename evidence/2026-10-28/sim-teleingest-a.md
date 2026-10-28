# sim-teleingest-a — telemetry-check schema-aligned ingest (tooling arm, GO)

Run: fleshout-20261028T0836Z, arm sim-teleingest-a, axis scale-onramp.
Worktree: `~/workspace/worktrees/sim-teleingest-a` (branch
sim-teleingest-a). Commits: prereg e30494f423be9b802d971b3c00775896527d00d7,
implementation + proof test cef6383c929d51b33935946b109993311a4771f0,
this evidence (coordinator merges; NOT pushed, NOT bumped, live NOT
verified — ship-loop line, not this arm's).

Canon note (per task): no game canon doc governs telemetry-check.js.
docs/CANON.md was read first; this arm invents no canon. The blank is a
tooling blank from run fleshout-20261028T0634Z
(evidence/2026-10-28/sim-scale-onramp-round-0634.md, "Telemetry
deviation check" + backlog item 5), not a game-design claim.

## Plain words first

The checker's old habit was reading the wrong labels and counting the
wrong pile. It asked each seed row for "national" and "wins", but the
rows file those answers under "nationalEver" and "won" — so it reported
both as zero, which is not a village collapsing, it is a misread label.
And when it was handed a whole corpus folder, it counted the folder's
summary and analysis files as if they were seeds, so 8 seeds became 9
or 10. The new `--sweep-rows` mode reads the labels the rows actually
carry and counts only real seed rows, so the same corpus now reports
the worker's own wall numbers back exactly, and the two false alarms
are gone. What is left against the old winseat baseline is two honest
regime differences (this tableseat band sits and wins less than a
~100%-win suite by construction) — the baseline's own note already
forbids that comparison, so those lines are reported as regime, not
as a regression, and the baseline is untouched.

## Pre-registration (binding, committed BEFORE any judged check)

evidence/2026-10-28/sim-teleingest-a-prereg.md (commit e30494f4).
It fixes: the mapping table below, the seed-row rule, the proof bar
(exact wall reproduction + zero artifact LOUD lines), the backward-
compatibility bar, and the definition of "artifact LOUD line" (a LOUD
line whose CURRENT value is wrong because of field-name mismatch or
inflated file count). A LOUD line whose current value is CORRECT but
whose baseline sits in a different regime is a REGIME line, not an
artifact. That definition was fixed in the prereg, not adjusted after
seeing the outputs.

## The change (scripts/telemetry-check.js only, plus proof test)

New opt-in flag `--sweep-rows`. Without it, behavior is byte-identical
to before (proved below). With it:

- Seed-row rule: a glob-matched file counts iff its JSON is an object
  with a finite numeric `seed` property. summary.json / analysis.json
  carry a `seeds` ARRAY and no scalar `seed`, so they are skipped and
  the output reports the skip count (`2 non-row files skipped`), never
  silently. n reported = seed rows (8 here). Duplicate seed values
  print a warning instead of silently collapsing.
- Aliases (row lacking the alias target falls back to the literal
  requested name, so old-schema rows keep working):
  national -> nationalEver, wins -> won; table, entered, nationalEver,
  nationalFinal, exiled are already row fields (exiled absent = 0).
  Any other metric uses the existing path lookup unchanged.
- Wall line: when any wall metric is requested, one line prints all
  five wall counts from the same rows (fields absent from every row
  are omitted, not shown as 0).
- Deviation rules, exit codes, and the quiet line are unchanged.
- `--update-baseline` now also carries underscore-prefixed input-
  baseline keys (e.g. `_regime`) over unchanged, so a baseline re-write
  cannot silently strip its regime label. (The scale-wall baseline's
  own note claimed this preservation already; the code did not do it
  until now. No baseline was re-written by this arm, so this is a
  forward fix only, proved by a test assertion — not a baseline change.)

## Mapping table

| requested metric | row field read | tbovertime aggregate |
|---|---|---|
| national | nationalEver | 7/8 |
| nationalEver | nationalEver | 7/8 |
| nationalFinal | nationalFinal | 6/8 |
| table | table (invited) | 4/8 |
| entered | entered | 3/8 |
| wins | won | 3/8 |
| won | won | 3/8 |
| exiled | exiled (absent = 0) | 0/8 |

## BEFORE (old mode, real scale-wall baseline, judged corpus)

Command: `node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-10-28/perseed-tbovertime-a/*.json' --metrics
national,table,wins,exiled` — exit 1:

```
LOUD: national disappeared: baseline 12 -> current 0 (n=10 files)
LOUD: table swung -75%: baseline 16 -> current 4 (n=10 files)
LOUD: wins disappeared: baseline 16 -> current 0 (n=10 files)
```

The `s*.json` variant gives the same 3 lines at n=9 files. The
national-disappeared and wins-disappeared lines are ARTIFACTS (current
values 0 are wrong: the rows sum to 7 and 3). The table line is
correct-valued (the row field `table` exists and sums to 4) — a regime
line, not an artifact, even before the fix.

## AFTER (new mode, same real baseline, same corpus)

Alias form (the coordinator's actual invocation, now schema-aligned),
`--sweep-rows --metrics national,table,wins,exiled` — exit 1:

```
wall: nationalEver=7/8 nationalFinal=6/8 table=4/8 entered=3/8 won=3/8 (8 seeds, 2 non-row files skipped)
LOUD: table swung -75%: baseline 16 -> current 4 (n=8 seed rows)
LOUD: wins swung -81%: baseline 16 -> current 3 (n=8 seed rows)
```

- Wall reproduction: EXACT — national ever/final 7/8 / 6/8, table
  invited/entered 4/8 / 3/8, wins 3/8, matching the tbovertime worker's
  wall numbers.
- Artifact LOUD lines: ZERO. No disappeared-to-0 line remains; n is 8
  seeds, not 9 or 10 files.
- Remaining LOUD lines: 2 REGIME lines, both correct-valued. The
  scale-wall baseline is a ~100%-win winseat suite (national 12/16,
  table 16/16, wins 16/16); this corpus is a tableseat-nowait census
  substrate. The baseline's own `_regime` note forbids this comparison.
  Verdict, same as the tbovertime worker and the 0634Z coordinator:
  explained regime difference, NO investigation, baseline NOT rolled.

Explicit form (`--sweep-rows --metrics
nationalEver,nationalFinal,table,entered,won`) prints the identical
wall line and aggregates, but its LOUD lines compare against baseline
keys that do not exist in scale-wall.json (baseline 0 -> "newly
appeared"). That form is the REPRODUCTION run, not the judgment run:
its current values are correct; it cannot judge against a baseline
that never carried those keys. The judgment run is the alias form
above, plus the self-check below.

Self-check (corpus as its own baseline, written to /tmp only — the
scale-wall file was never written): `--sweep-rows` against the
self-baseline prints the same wall line and

```
telemetry-check: quiet (8 seed rows, 2 non-row files skipped, 5 metrics, no large deviations)
```

exit 0 — proving no artifact LOUD fires when the baseline schema
matches the corpus.

## Backward compatibility (bar met, no exceptions)

- `node scripts/test-telemetry-check.js` (UNMODIFIED): 12 passed,
  0 failed — every pre-existing assertion still holds, including
  missing-path-disappears, nested paths, and --update-baseline writes.
- `node scripts/test-teleingest.js` (NEW, 21 assertions): 21 passed,
  0 failed. Covers: tbovertime reproduction (aggregates + wall line +
  n=8 + skipped=2 + zero artifact LOUDs); alias form; a synthetic
  sweep-row corpus in /tmp with summary.json + analysis.json decoys
  (aliases, alias fallback to a literal `national` on an old-schema
  row, decoy skipping); old-mode-on-synthetic-corpus (still counts
  every file, still reads bare names literally — the old 3-file
  disappeared output reproduced); --update-baseline `_regime`
  preservation; --sweep-rows with no seed rows LOUDs and exits 1
  instead of silently reporting zero.
- Old invocation without `--sweep-rows` on the tbovertime corpus
  still produces the BEFORE output verbatim (3 LOUD, n=10) — the
  default path was not silently altered.
- `node scripts/check.js --only telemetry`: 2 passed, 0 failed
  (55s; slowest script proof-telemetry-20261013.js). No src/js
  changed, so no game test suite is in scope for this tooling arm;
  no jest run (nothing in src/ to test, per the census-family
  precedent for tooling-only arms).
- `node --check` clean on both changed/new files.

## What was NOT done (held, with reason)

- Scale-wall baseline: NOT rolled, NOT changed, NOT regenerated.
  Verified untouched: mtime still 2026-10-25, md5
  f2cb67fe15ce24efa3074fb3ecedf038 (read-only check; the file lives
  outside the repo in goal hidden_files). The baseline question
  (regime-segregated baselines) belongs to a later run, per the task.
- No arm re-judged, no corpus re-scored, no game code touched,
  docs/TABLE.md untouched, sibling-loop files untouched.
- The balanced-panel corpus-ingest exception is NOT closed by this
  arm — this fixes telemetry-check ingest only, as tasked.

## Metric review (§14 — binding, no mid-run re-scores)

No threshold was moved mid-run. The prereg's proof bar was judged
exactly as written, including its fixed artifact definition. Two
disclosures, neither a re-score:

1. The explicit-metrics form's "newly appeared" lines are a
   baseline-key absence, not a corpus finding: scale-wall.json has no
   nationalEver/nationalFinal/entered/won keys, so those metrics
   compare against 0. The evidence therefore judges the alias form
   (whose baseline keys exist) and treats the explicit form as
   reproduction only. The prereg's bar 1 (exact reproduction) is met
   by both forms via the wall line; bar 2 (zero artifact LOUDs) is
   met by the alias form under the prereg's definition.
2. A test bug, fixed in the open, not hidden: the first proof-test
   run failed 4 assertions because the test wrote its baseline INTO
   the synthetic corpus dir (so the `*.json` glob swept the baseline
   in as a third non-row file) and because a 0 -> 3 current was
   expected to stay quiet (the unchanged rules LOUD it as a new
   appearance). Both were test errors, not checker errors: the
   baseline moved to its own dir, the quiet-run baseline set to the
   current value, and the re-run passes 21/21. The checker code was
   not changed to accommodate the test.

## Infrastructure notes

- Safe-commit index clobber hit BOTH commits in this arm (prereg:
  staged-deletion + untracked duplicate; implementation: staged
  modification + staged deletion + untracked duplicates). In every
  case the commit itself was correct (verified by `git show --stat`
  HEAD) and the worktree files were byte-identical to HEAD (verified
  by `git hash-object` vs `git rev-parse HEAD:<path>`); repaired via
  `git update-index --add --cacheinfo` with the HEAD blob, then
  verified `git status --short` empty + `git diff HEAD` empty before
  proceeding. Same check runs after every safe-commit in this run.
- Worktree at closeout must contain only committed work (verified
  before the coordinator merges; this evidence commit is the last
  file). No push, no bump, no live verification.

## Findings for the coordinator (NOT appended by this worker)

- [open] 2026-10-28 — telemetry-check sweep-rows ingest — the
  schema-aligned ingest is built (`--sweep-rows`): seed rows counted
  by numeric `seed`, summary/analysis skipped and reported, bare
  wall names aliased (national -> nationalEver, wins -> won), wall
  line printed. Tbovertime reproduction exact with zero artifact
  LOUD lines; default mode byte-identical. Baseline NOT rolled.
