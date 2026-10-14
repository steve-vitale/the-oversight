# sim-detfix-r26 — deterministic contest seeding (entropy-hunt follow-up, game-code fix)

## Pre-registered header (§§9–12, 14)
- **Primary metric:** `scripts/test-determinism-gate-20261014.js` exit code (GREEN = bit-identical trajectories, leadfeast s44, 180d, twice in-process).
- **GO threshold:** test exits 0 (GREEN) with no test changes — the test was landed RED-by-design in 85cfb0e7 precisely to flip on this fix.
- **Horizon/seeds:** leadfeast s44 (the named divergent seed), 180d death-aware.
- **Policy:** leadfeast (+FEASTSCALE_R13=1 as the test sets).
- **Guardrails:** ontology validator 94/94 green; `node --check` clean; no other behavior change (contest outcomes remain RNG draws from the same distribution — only the run-to-run reproducibility changes).

## Diagnosis (from sim-entropy-r26, landed 85cfb0e7)
Villager IDs embed `Date.now()` (`app_<ts36>_<rand>`, membership.js:376). `contestEngine.js` `_cxSeed` did `pids.slice().sort().join('+')` and `_cxDuelPartner` did `cands.sort()` — ID-string sorting, which gives the same participants a different order on every run of the same seed → different contest RNG seeds → the in-process divergence (s44 d161 vs d180). The code's own comment claimed "Same state in, same fate out" — false across runs.

## Fix (src/js/contestEngine.js, coordinator judgment call — Steve can overrule)
New `_cxSortIds(ids)`: sorts by roster index (canonical, stable for the same state); non-roster ids keep caller input order (also stable across runs). Used in `_cxSeed` (both sort sites) and `_cxDuelPartner`. Ontology ledger updated (`(code: _cxSeed, _cxWithSeed, _cxSortIds, ...)`). No API change; no feel/combat/UI change — contest outcomes are the same distribution of draws, now reproducible run-to-run.

## Proof
- `node scripts/test-determinism-gate-20261014.js` → **GREEN**: "seed 44: IDENTICAL (114 days, 114/village-lost vs 114/village-lost)", exit 0. (Was RED on 85cfb0e7 by design.)
- `node scripts/validate-ontology.js` → 94/94, "Ontology matches code. Release permitted."
- `node --check src/js/contestEngine.js` clean.

## Metric review (§14)
The pre-registered metric (test flips GREEN unmodified) is exactly what happened — no re-scoring. One caveat for future arms: the gate proves in-process determinism for the contest path; the s88 seed was not re-probed here (the entropy worker flagged it — run the gate on s88 before trusting s88 comparisons). Also: contest outcomes on RE-runs of old baselines will differ from pre-fix runs (different RNG streams) — before/after comparisons remain valid going forward only when both sides run on post-fix code.

## Verdict: GO — merged locally, pending ship.
