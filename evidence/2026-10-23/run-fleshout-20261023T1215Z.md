# run fleshout-20261023T1215Z — axis scale-onramp (RECOVERED)

Coordinator timed out at the 7200s wall; recovered by main agent. Two arms
self-landed before the timeout; the third was evidence-only and uncommitted.
All landed on master; this file is the run closeout.

## Arms

- **sim-vetformation — GO** (`e7fc8824e` [needs-eyes]): companion kill-formation
  for wave-4 fights; 10 vs 6 distinct wave-4+ killer vids. Proof 38/38 GREEN.
  Evidence `sim-vetformation.md` + `vetformation-panel-primary.md` +
  `perseed-vetformation/` (32 per-seed JSONs).
- **sim-vetretention — NO-GO at pilot** (`4f4c0443a` + `c99bdf0d4`): bars missed,
  mechanism proven, environment-gated layer. Proof 49/49 GREEN. Nothing killed
  (pilot NO-GO, mechanism sound).
- **sim-defer4gate — DIAG-GO** (evidence-only, this recovery commit): offline
  diagnosis, 11/11 bindings attributed (defer4 = veterans 5/5, stand-raw =
  diplomatic layer absent 6/6). ZERO src/js, ZERO new sims. Names the next
  wall after defer5: defer4 (3/12) and stand-raw (4/12) surface.

## Wall numbers (formation arm)
national 4->5/16, table 7->6/16, wins 0/0, wave4 11/11, wave5 1->2/16,
median 125.5->125d. Scale wall stands.

## Metric review
Vetretention pilot bars were missed with a proven mechanism — the bars, not
the lever, may be wrong; next run re-stages with revised bars (metric review,
§14 — revision applies to the NEXT run, not this one).

## Infrastructure notes
Intermittent git EPERM flap caused ~1h worktree-registration delay (resolved).
safe-commit index clobber struck twice; repaired via --add --cacheinfo
(2026-10-22 lesson). Run evidence file written by main agent at recovery —
facts taken from the coordinator's timeout report; no new sims run.
