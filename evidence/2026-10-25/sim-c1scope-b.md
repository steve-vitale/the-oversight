# sim-c1scope-b — casecount analyzer C1 scoped to actually-run seeds

Run: oversight-flesh-out-loop-b-20261025T0630Z, arm sim-c1scope-b,
axis food-economy. Tooling ONLY, zero src/js. Worktree:
`~/workspace/worktrees/sim-c1scope-b`, branch sim-c1scope-b.
Backlog item from run fleshout-loop-b-20261025T0335Z,
evidence/2026-10-24/sim-casecount-adopt-b.md ("Analyzer C1 note").

Canon: docs/CANON.md read first. No canon doc covers this target —
this is sim tooling (a freshness gate inside an analyzer), not a game
system, so no canon doc applies and none is invented here. The
analyzer's own published rules (full-pantry gate, A/B/C
classification, CASECOUNT-GO) are taken from
evidence/2026-10-24/sim-casecount-adopt-b.md, not reinvented.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §14)

- Substrate: branch sim-c1scope-b, current master at run start
  (tip acc3d6030, the landed casecount-adopt commit). TOOLING arm:
  no sims, no seeds, no policy. The "corpus" under test is the LANDED
  casecount corpus evidence/2026-10-24/fullpantry-casecount-b-corpus/
  — READ-ONLY, never written into, never overwritten.
- GO (ALL must pass; a miss on any leg is NO-GO, never re-scored):
  (1) OLD analyzer behavior reproduced on the landed corpus: C1
  exits 2 (flags the phantom B4/cover-b collision) — RED phase,
  bug proven before fixing; (2) NEW analyzer on the same untouched
  corpus: C1 exits 0, verdict identical to the published
  CASECOUNT-GO (n = 8 at the B2 boundary, shareA 8/8, all
  awayAtDeath) — the fix changes the gate, never the verdict;
  (3) synthetic negative control: a corpus doctored (worktree
  scratch / /tmp disposable copy, NEVER the landed corpus dir) to
  contain a REAL seed collision fails C1 loudly under the new
  analyzer; (4) synthetic planned-band case: a manifest/corpus
  planning B4 seeds that were never run passes C1 under the new
  analyzer.
- Scope guard: ONLY scripts/analyze-fullpantry-casecount-b.js is
  edited, plus the new proof test and this evidence file. No corpus
  files, no game code, no other analyzers. The string-sort display
  bug in scripts/analyze-leg2decide-b.js is a DIFFERENT analyzer and
  is NOT touched here (see "Remaining items").

## What C1 protects, in plain words

Seeds are the villages. If two different sim runs accidentally reuse
the same seed number, the second run's "new evidence" is just the
first run's villages counted twice — a finding could look confirmed
when it was only repeated. C1 is the guard that refuses to call a
corpus fresh when one of its seeds already appears in another
corpus. The bug: C1 checked the seeds the run PLANNED to use
(including batches B3/B4 that were never run because the stopping
rule fired at B2), so a seed another run legitimately used inside
that planned-but-unrun range looked like a collision. The fix: C1
checks only the seeds this corpus actually ran — read from the
corpus's own per-seed filenames — so a planned-but-unrun seed can
never fail C1, while a real collision (an actually-run seed in
another corpus) still fails loudly. What changes for the next run:
the analyzer stops crying wolf on stopped-early runs; nothing about
the verdict, the gate, or the classification changes.

## RED phase (old behavior, before any fix)

- `node scripts/analyze-fullpantry-casecount-b.js` on the landed
  corpus (unmodified analyzer, tip acc3d6030) exits 2:
  `ANALYZER FAIL: C1 hit: seed 94701 already in
  awayration-cover-b-corpus/awayration-cover-b-competent-s94701.json`
- Direct scan confirms the phantom: casecount actually ran
  94601–94664 (64 files); cover-b actually ran 94701–94732 (32
  files); the two run ranges do not overlap. The collision exists
  only between the PLANNED band (94601–94728, through unrun B4) and
  cover-b's band. Tool gap, not a verdict problem — exactly as the
  adoption evidence file diagnosed it.

## The fix

- scripts/analyze-fullpantry-casecount-b.js, C1 block only:
  (a) the actually-run seeds are derived FIRST from the corpus
  dir's own per-seed filenames
  (`fullpantry-casecount-b-competent-s<seed>.json`), sorted;
  (b) C1 checks exactly that list against every other `*-corpus`
  dir under evidence/2026-10-24 (exact `seed` field match, as
  before); the planned ALLBATCH band is no longer consulted by C1
  (BATCHES/B1–B4 exports are kept for the batch-boundary
  validation and for existing proof tests, untouched in meaning).
  (c) The per-seed filename scan later in main() now reuses the
  same list instead of re-scanning, so C1 and the corpus
  validation can never disagree about which seeds ran.
- The evidence-dir root for C1 is overridable ONLY via the
  `C1_EVIDENCE_DIR` env var, defaulting to evidence/2026-10-24.
  Production behavior is unchanged; the override exists so the
  proof test can stage doctored corpora in scratch without ever
  writing into the real evidence tree.
- No other analyzer behavior changes: gate, classification,
  batch-boundary rule, verdict rule, and exports are byte-identical
  in meaning (verified by the GREEN verdict-identity check below).

## GREEN phase (new behavior, same untouched corpus)

- `node scripts/analyze-fullpantry-casecount-b.js` on the landed
  corpus (fixed analyzer) exits 0. Verdict identical to the
  published CASECOUNT-GO: n = 8 at the B2 boundary (by-batch
  B1 = 5, B2 = 3), shareA = 8/8 = 1.000, class B = 0, class C = 0.
  All 8 death lines class A, sub away-at-death, awayAtDeath =
  true, seeds 94605, 94617, 94629 (x2), 94632, 94633, 94635,
  94644 — the published table, unchanged. The fix changed the
  gate, never the verdict. GO leg (2) PASS.
- GO leg (1) RED PASS (see RED phase above: old analyzer exit 2,
  seed 94701). GO leg (3) negative control PASS: doctored
  other-corpus holding actually-run seed 94605 fails C1 loudly
  under the new analyzer (exit 2, `C1 hit: seed 94605`). GO leg
  (4) planned-band case PASS: doctored other-corpus holding ONLY
  the planned-but-unrun B4 band (94697–94728) passes C1 (exit 0)
  and still renders CASECOUNT-GO.
- VERDICT: GO — all four pre-registered legs pass. No leg was
  re-scored, softened, or swapped.

## Metric review

- The pre-registered legs were the right instrument: the RED
  reconstruction (planned band hits cover-b, run seeds hit nothing)
  proves the phantom without needing the old binary, and the
  verdict-identity check (n, shareA, death seeds) proves the gate
  change did not move the verdict. No metric revision proposed
  for the next run.
- One design note for the next analyzer touch: C1 reads run seeds
  from per-seed FILENAMES and re-validates each file's seed field
  later in the run; a corpus whose filenames and seed fields
  disagreed would fail at the seed-mismatch check, not silently
  pass C1 on the wrong list. That ordering is load-bearing and
  should be kept.
- No sims were run, so no wall numbers, survival, or village
  assessment arise from this arm — it is tooling, and claiming
  wall numbers from it would be fabrication. The substrate facts
  from the adoption run stand as published in its evidence file.

## Remaining items

- scripts/analyze-leg2decide-b.js string-sort display bug: NOT
  touched (different analyzer; noted in the adoption evidence as
  "fix on the next analyzer touch" — that touch is not this arm).
- No other items opened by this arm.

## Proof

- scripts/test-fullpantry-casecount-c1scope-b.js: PASS 16 legs
  (R1a–d, R5a–d, R2a–d, R3a–b, R4a–b). Doctored corpora lived
  only in a mkdtemp scratch dir, removed after the run.
- Regression: scripts/test-fullpantry-casecount-b.js still PASS
  35 legs (PLENTYDEPRI=1 DEPOSITGATE=1, B1 seeds, 150d, incl. live
  determinism leg E vs the landed corpus file for seed 94601).
- `node --check` clean on both the analyzer and the proof test.
- Landed corpus untouched: `git status` shows no changes under
  evidence/2026-10-24/fullpantry-casecount-b-corpus/ (all 64
  per-seed files + sweep summary byte-identical to HEAD).
- Commit (this arm only): scripts/analyze-fullpantry-casecount-b.js
  (C1 block only), scripts/test-fullpantry-casecount-c1scope-b.js
  (new), evidence/2026-10-25/sim-c1scope-b.md (this file).
  No src/js, no corpus files, no other analyzers.
