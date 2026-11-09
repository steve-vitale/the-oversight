# sim-radsnap-a — prereg (scholar radiation-snapshot instrument fix)

Run: fleshout-20261109T1815Z, Loop A, axis food-economy. Arm: sim-radsnap-a.
Branch: sim-radsnap-a. Base: 91869f106.
Date: 2026-11-09. Author: radsnap-a worker.

## The gap (backlog 2026-11-09, scholar radiation-snapshot G3 gap)

The feveranat sweep's `DISEASE_IDS` roster lacks `radiation_sickness`, so
scholar radiation onsets never appear in daily `scholarSick` snapshots and
the feveranat G3 corpus check fails on the sametick corpus (s96301: 8 onsets,
s96302: 10 onsets, unaccounted). The old corpus failed G3 the same class.
Documented in evidence/2026-11-09/sim-sametick-a.md ("G3 CORPUS: FAIL —
s96301 + s96302 scholar radiation_sickness onsets unaccounted", "G4: 18
honestly unattributed (scholar radiation onsets with no source string)").

## Root cause (verified from the files before this prereg, no judged legs run)

- `scripts/sweep-feveranat-a.js:88-92` — `DISEASE_IDS` is the 16-id set
  (`disease, wound_fever, gutrot, lockjaw, trichinosis, trembles, howlbelly,
  gristlefit, croakbelly, shellgut, witness_maw, flockmind, eurika,
  east_nile, lemons, tick_attached`); `MUNDANE_IDS` (lines 91-92) is the 6
  mundane ids. Comment cites "docs/DISEASES.md (mundane 6 + alien 9)".
- `scripts/sweep-feveranat-a.js:204` (`scholarDiseaseList`) skips every
  `seList('scholar')` entry whose id is not in `DISEASE_IDS` — the daily
  snapshot's `scholarSick` can never contain `radiation_sickness`.
- The `contractDisease` wrapper (~line 600) records EVERY scholar onset into
  `sickOnsets` with NO roster filter — so radiation onsets ARE recorded
  (verified in the recorded corpus: s96301 8, s96302 10 radiation onsets,
  0 `scholarSick` rows containing radiation on either seed).
- The `applyStatus` wrapper (~line 640) also gates on `DISEASE_IDS`, so a
  radiation onset via direct `applyStatus` would be missed the same way.
- `scripts/analyze-feveranat-a.js` G3 (~lines 600-630) requires every
  recorded onset to appear in a later snapshot (or end within a day). A
  recorded-but-never-snapshotted onset is unaccounted → G3 FAIL. The
  analyzer carries NO disease roster of its own — it reads recorded
  snapshots — so the fix belongs to the sweep, not the analyzer.
- `MUNDANE_IDS` gates the `cureStatus` / `seRemove` wrappers (~lines 881,
  899): scholar sickEnds (cured / recovered-expired) are recorded only for
  ids in it. Without radiation there, radiation episodes would be
  onset-only with no end record.
- `scripts/sweep-sicknessdiag-b.js:77-81` carries a PARALLEL roster with the
  identical shape and the identical gap (same 16 ids, same 6 mundane), and
  the same wrapper structure (lines ~639, ~654).
- `src/data/statusEffects.json`: `radiation_sickness` exists — pool
  `mundane`, class `radiation`, cure antibiotics `no` / antiparasitic `no` /
  field_medicine `cure` / triage `cure`. "No pill touches it — skilled
  hands clear it, rest sheds it slowly." (Pellet radiation cost, Steve-ruled
  2026-11-08; cure behavior is NOT touched by this arm.)
- `docs/DISEASES.md` is STALE on this point: it lists the mundane pool as 6
  and never mentions radiation_sickness (it predates the 2026-11-08 pellet
  radiation build). The sweep roster comment cites DISEASES.md as its
  source, so the doc must name the 7th mundane disease or the next worker
  will "fix" the roster back.

## Scope decision (from the code)

- (a) feveranat roster — YES. This is where the G3 failure lives.
  Add `radiation_sickness` to `DISEASE_IDS` AND to `MUNDANE_IDS`
  (it is pool mundane in the data; the end-recording wrappers need it so
  radiation episodes close instead of staying onset-only).
- (b) sicknessdiag roster — YES, same gap, same fix. Parallel recorder,
  parallel roster, parallel wrappers; a radiation onset recorded by that
  sweep would fail its snapshot accounting identically. Both sets, both
  files.
- (c) analyzer roster — NONE EXISTS. `analyze-feveranat-a.js` has no
  disease list; it joins recorded onsets to recorded snapshots. No change.
- docs/DISEASES.md — YES, docs-only: add a `radiation_sickness` row to the
  mundane-pool table (pool now 7), plus a change-log line. No canon is
  invented: every fact comes from `src/data/statusEffects.json` and the
  2026-11-08 pellet ruling already recorded in MEMORY.
- NOT in scope: the unattributed-vector gap (radiation onsets carry no
  source string — `contractDisease('radiation_sickness', {})` from
  `src/js/feastBuff.js:389` — so the analyzer honestly reports them
  unattributed under G4). The roster fix does not change that, and changing
  the vector mapping would widen this arm. Logged as a follow-up finding,
  not fixed here.
- NOT in scope: any `src/js` change, any cure behavior, any game balance.
  Zero `src/js` changes. Instrument-only; no `[needs-eyes]` (no feel,
  combat, or UI change).

## G3 re-verification plan

The recorded sametick corpus CANNOT be re-analyzed into passing: its
snapshots are baked in without radiation rows, and (per the sametick arm's
own structural finding) no analyzer can recover what the recorder never
persisted. The re-verification target is therefore a FRESH sweep with the
fixed recorder on the identical band:

- BEFORE (baseline, run after this prereg commits): `node
  scripts/analyze-feveranat-a.js evidence/2026-11-09/sametick-a-corpus` —
  expect G3 FAIL, s96301 8 + s96302 10 unaccounted (as the sametick evidence
  records), G2 PASS, bare 8/8.
- FIXED SWEEP: `SEEDS=96301,96302,96303,96304,96305,96306,96307,96308
  DAYS=150 PLENTYDEPRI=1 DEPOSITGATE=1 node scripts/sweep-feveranat-a.js`
  with `OUT=evidence/2026-11-09/radsnap-a-corpus/feveranat-a-summary.json`
  and `PERSEED_DIR=evidence/2026-11-09/radsnap-a-corpus` (the sweep FATALs
  unless seeds/days/env match exactly). Competent policy, same as sametick.
- AFTER: `node scripts/analyze-feveranat-a.js
  evidence/2026-11-09/radsnap-a-corpus` — the bar is G3 PASS with the
  radiation onsets accounted, and no previously-passing G3 leg regressed
  (G2 recorded==bare PASS, bare fingerprints 8/8, orphan ends 0).
- Fresh corpus files are committed as evidence alongside the fix
  (8 competent + 8 bare + summary, same shape as the sametick corpus).

## Neutrality argument

The recorder is pure-read: the wrappers never write Game state and never
consume RNG, so the fixed sweep on identical seeds/policy/env must
reproduce the sametick trajectories. The roster addition admits exactly one
more id through existing filters; it cannot change any non-radiation
classification or judged output. Proof: diff the fresh per-seed JSONs
against the sametick per-seed JSONs seed by seed and show the diff is
confined to radiation rows (new `scholarSick` snapshot entries, radiation
`sickEnds`, radiation `sickRest` treatEvents) with every non-radiation
count unmoved. If any non-radiation field moves, that is a same-run
investigation item, not a pass. The analyzer's G2 (recorded == bare) on the
fresh corpus is a second, independent neutrality check.

## Pre-registered GO bars (binding)

- G1 det-gate: `scripts/test-radsnap-a.js` green — roster includes
  `radiation_sickness` in every set changed (both files, both sets);
  synthetic scholar radiation onset appears in the snapshot filter; G3
  passes on the fresh corpus; previously-passing G3 legs still pass.
- G2 neutrality: non-radiation judged outputs byte-identical before/after
  on the same band (fresh vs sametick per-seed diff confined to radiation
  rows; exact comparison recorded in the evidence file). G2 recorded==bare
  PASS on the fresh corpus.
- G3 corpus integrity: the fresh corpus passes its integrity legs (daily
  rows, no unreported gaps, 0 instrument errors beyond the ones this
  prereg names).
- G4 proof test green on the branch AND after any rebase.

## Metric review

(To be filled at run end. A miss is NO-GO, never re-scored mid-run.)
