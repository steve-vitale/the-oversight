# sim-radsource-a — prereg (instrument arm, DIAG/measurement)

Run: fleshout-loop, Loop A, axis scale-onramp (instrument arm on the
feveranat diagnosis instrument). Arm: sim-radsource-a.
Branch: sim-radsource-a. Base (worktree HEAD at prereg time): 17777346b.
Corpus under test: the RECORDED radsnap corpus,
`evidence/2026-11-09/radsnap-a-corpus/` (8 competent + 8 bare +
`feveranat-a-summary.json`), recorded by the radsnap arm on base
91869f106, seeds 96301–96308, competent policy, 150d,
PLENTYDEPRI=1/DEPOSITGATE=1. No fresh sweep: the judged corpus is the
recorded one — the attribution fix is instrument-side (recorder +
analyzer), and a recorder change cannot alter already-recorded data.
The recorder half is proven live in the proof test instead (see below).

## The gap (from sim-radsnap-a evidence, verified by reading, not trust)

Scholar `radiation_sickness` onsets arrive via
`contractDisease('radiation_sickness', {})` with NO source string —
the sole scholar contraction site is `src/js/feastBuff.js:389` (pellet
boost; verified by grep: no other scholar `contractDisease` call for
this id exists in `src/js/`). The sweep's `vectorForScholarSource`
maps the source STRING only, so all 13 radiation onsets on the radsnap
band (all on s96301) land as `vector: 'unattributed'`, and the
feveranat analyzer honestly reports them unattributed under G4 (13/13).
Backlog line: `hidden_files/sim-findings.md` (2026-11-09, RADIATION
ONSETS CARRY NO SOURCE STRING).

Canon ground (docs/DISEASES.md, mundane-pool table, added 2026-11-09):
radiation's vector is "the pellet's invisible fire, taken in a boost at
a time — NOT a germ". The disease id itself is the source evidence:
there is exactly one vector, so attribution from the id is sound, not
a guess. No canon is invented here.

## Fix design (instrument only — ZERO src/js changes)

Two layers, both in `scripts/`:

1. RECORDER — `scripts/sweep-feveranat-a.js`: `vectorForScholarSource`
   gains the disease id as a second argument; a `radiation_sickness`
   id returns vector `"the pellet's invisible fire"` BEFORE the source
   map is consulted (the source is empty for this id, so the map can
   never answer). Same id rule applied in the `applyStatus`-direct
   mundane branch, via one shared helper, so a radiation onset arriving
   without `contractDisease` is attributed the same way. No other id
   is touched by the rule.
2. ANALYZER — `scripts/analyze-feveranat-a.js`: in `finish()`, an
   episode whose `diseaseId` is `radiation_sickness` and whose recorded
   vector is missing/`'unattributed'` is re-derived to `"the pellet's
   invisible fire"`, with `vectorSource` marked as the disease-id
   re-derivation (transparent in the output, never silent). Recorded
   non-unattributed vectors are never overridden. This layer is what
   fixes the RECORDED radsnap corpus on re-run; the recorder layer is
   what fixes future sweeps at record time. The two agree by
   construction (same vector string, same canon ground).

Out of scope (filed, not chased): the parallel
`sweep-sicknessdiag-b.js` carries the same `vectorForScholarSource`
shape and the same gap — a future arm applies the identical id rule
there; this arm's GO bar is measured on the feveranat corpus only.

## Primary metric

Share of `radiation_sickness` onsets attributed on the radsnap corpus
(13 onsets, all scholar, all s96301).

## GO bar

- 13/13 radiation onsets attributed with vector
  `"the pellet's invisible fire"` on the analyzer re-run of the
  recorded radsnap corpus; `unattributed=0`.
- Exact F3 by-vector map after the fix:
  `{"tick":123,"wound":27,"unsafe food":6,"food":2,"dirty water":3,
  "raw food":1,"the pellet's invisible fire":13}` (total 175
  episodes — the radsnap F3 map with the 13 unattributed moved to the
  pellet vector and nothing else moved).
- ZERO other analyzer numbers move on the same corpus: the stdout
  diff between the pre-fix and post-fix analyzer runs on the recorded
  corpus is confined to F3/G4 attribution lines (the F3 by-vector
  line, the attributed/unattributed counts, the UNATTRIBUTED listing
  lines disappearing, the scholar-by-vector corroboration line, the
  G4 verdict line). G3 stays PASS, G2 stays PASS, F1/F2/F4/F5/F6
  identical.
- Proof test `scripts/test-radsource-a.js` green, including:
  (a) live-game leg — the sweep's ACTUAL `vectorForScholarSource`
  (extracted from the file) returns the pellet vector for
  `('' , 'radiation_sickness')` and for `(null, 'radiation_sickness')`;
  (b) CONTROL — non-radiation onsets unchanged: source-mapped cases
  still map (`'the creek water'` → `'dirty water'`,
  `'a tick bite'` → `'tick (ambient)'`, `'a cut gone wrong'` →
  `'wound'`, `'the <food>'` → `'food'`), and an empty source for a
  non-radiation id stays `'unattributed'`; (c) analyzer leg — the
  post-fix analyzer output on the recorded corpus matches the exact
  F3 map above and `unattributed=0`; (d) baseline leg — the pre-fix
  analyzer output on the same corpus shows `unattributed=13`, all 13
  UNATTRIBUTED lines naming `radiation_sickness` (reproduces the
  radsnap G4 finding; run from the pre-fix code before the fix lands,
  or equivalently from the committed pre-fix analyzer).

## Horizon / seeds

The radsnap band as-is: seeds 96301–96308, competent, 150d. The
judged measurement is the analyzer re-run on the recorded corpus
(analyzer is pure analysis — reads JSON, no game code — so base drift
between the recording base 91869f106 and this base does not affect
it). The recorder half is judged by the live proof-test leg, not by a
fresh sweep.

## Metric review (to be filled at run end)

- Whether the GO bar was met as written, or re-scoped, and why.
- Whether the exact F3 map held (any drift = investigate, not
  re-score).
- Whether the two-layer design stayed necessary, or one layer proved
  redundant.
