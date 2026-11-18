# sim-analyzer2513-b — fix for finding #2513 (fleerepair2 analyzer hard-codes 8 seeds)

Run: `sim-analyzer2513-b` · Loop B · 2026-11-18 · axis: winnability chain
Prereg: `evidence/2026-11-18/sim-analyzer2513-b-prereg.md` (frozen before the fix)
Finding: #2513 — `scripts/analyze-fleerepair2-b.js` lines 299–300 computed
`instrClean` with `ctlS.files === 8 && armS.files === 8`.

## Plain-words summary
The analyzer is the little program that reads a run's per-seed result files
and stamps a verdict (GO / NO-GO) on it. One of its health checks was
"are there exactly 8 result files on each side?" — written back when every
panel ran 8 seeds. The 16-seed re-judge ran 16 seeds, so all 16 files were
there, every fight recorded cleanly, and all three real bars passed — but
the analyzer still stamped NO-GO because 16 is not 8. It was judging the
size of the panel, not the health of the run. The fix makes the analyzer
count the files that are actually there and use the fuller side as the bar,
so an 8-seed panel is judged against 8 and a 16-seed panel against 16, and
a side that is genuinely short of its partner still fails.

## Canon
No canon doc covers the sim analyzer (see prereg). `docs/CANON.md` was read
first; the fix touches measurement tooling only, no game system, no `src/js`.

## The fix (`scripts/analyze-fleerepair2-b.js` only)
- New exported `judgeInstrument(ctlS, armS)`: `expectedFiles =
  max(ctl files, arm files)`; clean iff both legs equal it, both legs have
  0 instrument errors and missingHp 0, **and** the two legs' seed lists
  match (equal counts with different seeds would be a false clean).
- `summarize()` now also returns `seedList` (the seeds present, in order).
- The `instrument` bar in the analysis JSON now reports `expectedFiles`
  and `seedsMatch`, so the bar a run was judged against is visible.
- B1/B2/B3 judges, drift check, and all other logic untouched.

Known limit (stated in the prereg too): if BOTH legs lost the same seed
file, the corpus-derived bar cannot see it — both legs agree at the lower
count. That failure needs the driver's seed list, which lives outside the
analyzer. The check catches the real failure mode (one leg truncated) and
any leg mismatch.

## Verdict: GO — all four frozen prereg bars met
| Bar | Result |
|-----|--------|
| (a) Verdict field GO on 16-seed rejudge2 | **GO** (was NO-GO on the frozen analyzer) |
| (b) B1/B2/B3 numbers identical to evidence | **Identical** — ctl suburbLaunchedMeetings 3, w4kills 13, deaths 1448; arm 0, 13, 1417; B1 PASS, B2 PASS 13→13, B3 PASS |
| (c) Proof test green | **Green**, 11/11 (`scripts/test-analyzer2513-b.js`) |
| (d) No behavior change on 8-seed corpora | **Identical** on both pairs (below) |

## Before / after on the real frozen corpora
Outputs written with `FLEEREPAIR2_ANALYSIS_OUT` to scratch paths so the
frozen `evidence/2026-11-17/*.json` files were never clobbered. A field-by-field
diff of each new JSON against its frozen counterpart shows the ONLY changes
are the verdict/instrument flip on rejudge2 plus the three new reporting
fields (`seedList` on both legs, `expectedFiles`, `seedsMatch`).

| Pair | Before (frozen) | After (fixed analyzer) |
|------|-----------------|------------------------|
| 16-seed rejudge2: `perseed-fleerepair2-rejudge2-b-ctl` / `-arm` | NO-GO, instrument DIRTY (files 16≠8), B1/B2/B3 all PASS | **GO**, instrument CLEAN, expectedFiles 16, seedsMatch true; B1/B2/B3 numbers byte-identical |
| 8-seed original: `perseed-fleerepair2-b-ctl` / `-arm` | GO, B2 6→7, instrument CLEAN | **GO, B2 6→7, instrument CLEAN** — identical |
| 8-seed published NO-GO: `perseed-fleerepair2-b-diag` (ctl) / `perseed-fleerepair2-rejudge-b-arm` | NO-GO, B1 PASS, B2 FAIL 6→5, instrument CLEAN | **NO-GO, B1 PASS, B2 FAIL 6→5, instrument CLEAN** — identical, still NO-GO for the B2 reason, not an instrument reason |

Analysis JSONs (new, committed with this evidence):
- `evidence/2026-11-18/analyzer2513-rejudge2.json`
- `evidence/2026-11-18/analyzer2513-b-orig.json`
- `evidence/2026-11-18/analyzer2513-rejudge.json`

Scale-wall numbers on the rejudge2 band (unchanged by the fix, for the
record): ctl nationalStanding 5, nationalRank 0, table 0, wins 0, wave4 15,
wave5 5, median survival 151d; arm 6, 0, 0, 0, 15, 6, 151d.

## Naming correction to the brief (found while verifying, before the fix)
The brief named the 8-seed check as "perseed-fleerepair2-b-ctl and -arm"
with "B1 PASS, B2 6→5". That pair is actually GO, B2 6→7
(`fleerepair2-b-analysis.json`). The published NO-GO with B1 PASS, B2 6→5
is the re-judge pair (diag-ctl + rejudge-b-arm). Both pairs were checked,
so the no-behavior-change claim holds on the pair the brief named AND on
the pair its parenthetical describes. Coordinator: the brief's directory
names and its parenthetical pointed at two different runs; the prereg
records both.

## Proof test
`scripts/test-analyzer2513-b.js` (synthetic corpora under `os.tmpdir()`,
nothing writes into the repo): 11/11 green —
8-seed reads expectedFiles 8 and CLEAN; 16-seed reads expectedFiles 16 and
CLEAN; 7-of-8 reads expectedFiles 8 and DIRTY; same-count seed mismatch
reads DIRTY; instrument-error and missing-HP corpora still read DIRTY.

## Metric review
The frozen prereg metrics bound this run and all four were met — no
re-scoring happened. One metric note for the NEXT run, not a re-score
here: the seed-set equality check is stricter than the old count check in
one corner — a legitimate corpus whose two legs genuinely ran different
seed bands (a mis-paired invocation) now reads instrument DIRTY instead
of silently comparing mismatched seeds. That is the intended behavior,
but any future analyzer reuse across intentionally different bands would
need the check relaxed or the pairing documented.

## Village assessment
No sims were run and no game code changed, so there is no village to
assess this run. The blank filled is a measurement blank: the analyzer
can now judge panels of any size, so the next 16-seed (or larger) re-judge
gets a verdict field that agrees with its own bars instead of needing a
handwritten correction in the evidence file.
