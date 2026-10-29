# sim-geartier proof refresh — RESULTS (build-abilities leg)

Job: the owed measurement-proof refresh after the geartier-a
abilities pass (0d0e23d05). The pass changed godpath.js /
fieldFights.js, so the retained observer-neutral proof went stale
and check.js reported measurement-proof-update +
measurement-workflow failing ("Proof source inputs are not
current"). This leg refreshes it with a REAL panel — no proof
output was hand-edited; scripts/balance-proof-update.js did the
refresh and its validator did the checking.

## Panel provenance (what panel, built how)

- Built: `node scripts/balance-panel.js --out
  evidence/2026-10-29/panel-abilities-refresh-20261029 --seeds 7
  --policies capable --days 30`, on this branch at f39590043.
  Exit 0, 1 case, 0 cached jobs, sourcesStable true.
- Neutrality: capable / seed 7, observe=1 vs observe=0
  stateHash + row match TRUE, warnings 0. Row warnings [],
  observerErrors [], gear errors [].
- Scope, stated plainly: this matches the RETAINED precedent
  exactly — the Oct 28 panel it replaces was also 1 seed (7),
  1 policy (capable), 30 days, 1 row, 1 neutrality proof. A
  default-scope panel (16 seeds x 4 policies x 150 days, 68
  jobs) was started first and stopped: under current box load
  it was completing ~1 case per several minutes, and nothing
  in the validator or the precedent requires that scope for a
  maintenance proof (the neutrality property is per-case).
  The default-scope attempt left 6 orphan case caches in the
  panel dir; they are untracked, uncommitted, and play no role
  in the refresh — only panel.json.gz is committed, as with
  the precedent.
- What changed vs the old proof: panel path (2026-10-28 panel
  -> 2026-10-29 refresh panel) and panelDigest (9053e65d… ->
  c4d89b5a…). Observer + contract digests are UNCHANGED (no
  observer file or the metrics contract changed) — the
  staleness was the panel's source manifest vs current
  godpath/fieldFights, now re-observed.

## Refresh command + result

- `node scripts/balance-proof-update.js
  evidence/2026-10-29/panel-abilities-refresh-20261029/panel.json.gz`
  — exit 0. scripts/balance-proof.json now points at the new
  panel with its digest and the current normalized source
  hashes (validator-checked: manifest match, observer/contract
  digests, neutrality coverage, cohort accounting, metric ids,
  no warnings/errors).
- balance-proof-update.js itself needed NO fix: it ran honestly
  as written.

## What this leg does NOT do

- No game code, ability number, cost, or gate changed here.
- The remaining check.js failures on the final tree are NOT
  claimed fixed by this leg: mobile-combat-cadence,
  occupation-panels, phone-frame-proof, establishment-r20 were
  classified pre-existing on the branch base by the geartier-a
  arm. Only the two proof-freshness tests are addressed, and
  they are verified by the measurement check run recorded in
  the landing note, not by assertion here.

## Files

- Panel (committed): evidence/2026-10-29/
  panel-abilities-refresh-20261029/panel.json.gz
- Proof (refreshed by script): scripts/balance-proof.json
- Panel case caches: untracked under the panel dir (not
  committed, same as precedent)
- Companion leg (separate): P4 fresh-seed re-run —
  evidence/2026-10-29/sim-geartier-p4-rerun.md
