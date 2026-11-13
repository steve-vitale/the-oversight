# sim-proofrefresh-b10 round — Loop B 0530Z (winnability chain, 1 arm LANDED, merged locally pending ship)

## Run

- Run: fleshout-loop-b-20261113T0530Z (scheduled 2330 CST). Axis: winnability chain.
- STALE-LOCK RECOVERY at start: deleted the dead 0330Z lock (119 min old, past the
  90-min fallback); sim-proofrefresh-b10 tree heartbeat 05:11:32Z, 23 min stale
  (>15-min guard); no live subagents (b10 worker 5f765f62 cancelled, no final
  report; voiceless worker 268cfc0f done). The 0330Z claim retired to .DEAD with
  a note. Its arm 2 (voiceless-a adopt) had already LANDED on master f06c8e4e7
  (branch deleted, verified); its arm 1 (b10 adopt-finish) was NOT landed —
  this run's arm 1.
- Loop A idle at run start (0455Z closed, no lock/claim). Gap-diag arms 2/3 stay
  Loop A's (0455Z next blanks) — NOT claimed here. No new food-economy arm
  (parked). Headcount-ceiling + Reunion wild pack are Steve-calls, not claimed.
- Pre-flight: main tree clean (git status empty, twice — once slow at 23 min
  under load, once fast at closeout), disk 35–37%, master tip dc95859a8 at
  run start.

## Host write flap

- New episode started 05:22:25Z killed the 0330Z run's regen5b at 15 dots
  (EPERM at balance-panel.js:328). Probes 05:37–05:40Z 4/4 OK (atomic + git-ref
  + node, 3x spaced); flap-watch ALL-OK continuously from 05:29:46Z through
  the run. Flap stayed CLEAR the whole run — no EPERM anywhere after 05:29Z.

## Arm 1 — sim-proofrefresh-b10 adopt-finish: LANDED 7b0abd464 (GO)

- Worker 8c0d41fd, existing tree sim-proofrefresh-b10 (no new registration —
  avoids the flap-vulnerable worktree add). Heartbeat first 05:45Z, again
  06:25Z and 06:47Z.
- Rebased clean onto explicit master dc95859a8 (never `git rebase master`),
  new tip 33d3df30f; no sequencer-quirk stop. Regen5c under setsid
  05:56:24–06:34:42Z, PANEL_EXIT 0, 68 dots, 64 cases, ~38 min wall.
  Panel copied to evidence/2026-11-12/neutral-proofrefresh-b10.json.gz
  (sha256 3f974193335fbbbf3b35bcd3b86989b5a4ae72f67f09802713aef4413ab7f926),
  re-pointed with balance-proof-update.js (exit 0).
- GO legs on the rebased tip: (a) proof-update 9/9 exit 0; (b) workflow 9/9;
  (c) cache-flags 4/4 OUTRIGHT — the spawn-timeout load artifact did not bite,
  no manual replication needed, 30s cap untouched; (d) neutrality reproduces
  b9 AND b8, match on every proof case, warnings 0; (e) test-proofrefresh-b10.js
  12/12, incl. stale-input negatives (b9 and b8 panels fail validate on the
  new tip); (f) ontology exit 0, 138 systems, ONTOLOGY.md verified 2198 lines,
  no diff vs HEAD. Staleness: b10-new 0 keys, b9 11, b8 12 (of 526).
- Coordinator re-verified leg (a) on the branch tip before merging (9/9, exit 0).
- Commit 7b0abd464: fresh real neutral panel (regen5c on dc95859a8) + proof
  re-point + evidence — GO 12/12. 5 files: panel .gz, prereg, arm evidence,
  balance-proof.json re-point, test-proofrefresh-b10.js. Safe-commit index
  clobber hit the worker commit (files staged-as-deleted, MM on
  balance-proof.json) — commit verified correct first (blobs match worktree
  hashes), then repaired via ls-tree -r pipe; status empty + diff HEAD empty.
- Merged --ff-only dc95859a8..7b0abd464 (no pipe, strict && chain); ancestry
  verified after (merge-base --is-ancestor); released as done-merged; branch
  deleted; worktree removed. Master moved under the closeout (journey-scale
  r134 landed a60da9ae3 on top, zero overlap); b10 merge verified an ancestor
  of current master. Main tree clean at closeout.
- Evidence: evidence/2026-11-12/sim-proofrefresh-b10.md (verdict GO, full
  adoption section, wall rows, final metric review). Run note in
  ~/memory/2026-11-13.md.
- Finding filed in the arm evidence (not chased): capable/7 won at d90 reaching
  wave 5 but at regional rank WITHOUT national (b9: won with national) — a win
  without national; the national step is the binding constraint on that row.

## Wall (regenerated b10 panel, 64 rows, 150d)

national 15/64, wins 16/64, entered 16/64 (all 16 wins capable 16/16), table
56/64, wave-5 13/64, wave-4 63/64 (sole miss winseek/42, d30 wave 3 — same row
as b8/b9), median survival 90d, max 150, end reasons village-lost 47 /
over-other 16 / survived 1, vests 26, vestsVillager 43. Per-policy: capable 16
wins / national 15 / wave-5 6 / med 90d; risk-aware 0/0/3/106d; socialite
0/0/4/88d; winseek 0/0/0/74d. 48/64 rows differ from b9. Against b9: won 15→16,
entered 15→16, national 14→15, wave-5 12→13 — the capable row that converted
from village-lost d46 to a win at d97 in the generated panel is now joined by
capable/7's win-without-national; carried, not judged (no lever played).

## Telemetry deviation check

REFUSED on the retained .gz panel — telemetry-check.js cannot parse it
("Unexpected token" on gzip bytes; expects per-seed JSON evidence). Confirmed
by the coordinator after the worker reported the same. No lever was played, so
no deviation to check; neutrality reproduction stands in its place. Baseline
NOT rolled. No LOUD line.

## Arm 2 — sim-mirrorcap-panel-b: NOT spawned

Conditional arm (spawn only if arm 1 landed with time to spare and the flap
stayed clear). Arm 1 closed at 06:47Z; the next Loop B run is 07:30Z — a
45–60 min panel plus legs would overrun the window and strand mid-flight.
Left unclaimed for the next B run. Mirror-cap branch state verified at run
start: build-mirror-cap at e5cb77420, NOT ancestor of master (cap 1 arena
mirror, prereg seeds 91002–91017).

## Infrastructure

- worktree-reap.sh at closeout: exit 0, active 10/16. Its LOUD lines are other
  owners' trees with uncommitted changes (sim-siegedialog-a, journey2-social,
  sim-gap-candidates-a, sim-tendexact-confirm-a) — NOT touched.
- git status in the main tree took 23 min at run start under sibling load
  (eventually clean, exit 0) and 3.4 s at closeout (clean). Load cleared as
  sibling sweeps finished.
- No merges, no pushes, no version bumps this run beyond the b10 landing.
  Ship loop owns deploys.

## Convergence

winnability chain stays converging (NOT converged): the measurement proof is
fresh again (round 10 GO, 0 stale keys) and the instrument is re-proved, but
no lever moved the wall numbers this run — wins still come only through the
capable policy on the neutral panel, national/table/wins are 0 on every
judged corpus outside it, and the +1 gap question (Loop A) and the
headcount-ceiling / Reunion-wild-pack Steve-calls are still open.
Next blanks, in order: (1) mirror-cap follow-up panel with its own prereg
(exec decision #8 — if still 0 wins, scaling goes to Steve); (2) headcount-
ceiling (Steve-call); (3) Reunion mirror pack in the wild (Steve design call);
(4) bisect round 11 / optb healthy-pole follow-through (Loop A owns the
+1-gap deciding test; do not pre-claim). Claim deleted; lock deleted.
