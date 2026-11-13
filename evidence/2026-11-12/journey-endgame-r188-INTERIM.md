# Journey endgame r188 — INTERIM (written 20:27Z, after the 20:21Z VM reboot; folds into the run note at closeout)

## VM reboot + resume

- VM rebooted ~20:21Z (uptime 1 min at 20:22:46Z). The measurement chain
  (pid 10741, started 20:13:03Z) was killed mid-seed-89705. Pass A seeds
  89701–89704 had already scored and their JSONs are complete and parse.
- Heartbeat loop (first instance, pid 8403): its 20:14 attempt never
  landed — worktree-heartbeat.sh blocks on REGISTRY.lock with no timeout
  and the reaper holds that lock 9–14 min per run, so the attempt was
  queued behind a reaper, then the reboot killed it. Registry heartbeat
  was 20:04:50Z at the reboot. Manual heartbeat re-established 20:23:47Z.
- Loop restarted 20:25Z with setsid + 5-min interval + timestamped
  attempt logging (journey2-endgame-hbloop-r188.sh, pid 2647, alive at
  launch). Flap-watch also died with the reboot (last entry 20:20:44Z);
  its watchdog cron owns the restart, not this run.
- Resume chain launched 20:25:44Z (pid 2683, setsid-detached):
  pass A seed 89705 only into the existing dir, then pass-A analyzer
  over the complete 5-seed dir, then passes B, C, C-wide + dark probe.

## PREREG CORRECTION — delta (l), recorded post-scoring (my miss, owned)

The committed prereg (2de4dde91) lists substrate deltas (a)–(i) from a
`git log -- src/js/` diff only. It MISSED a probe-policy delta because
scripts/policies/ was never diffed:

- (l) r128 LANDING (87f00547d, 2026-11-12 16:21Z — after the r185
  substrate a0039d484, before this run): scripts/policies/competent.js
  +185/-37 — beastFreeTiles (+125 lines), beastTrickPlay (several
  hunks), competent movement/flee/close fallbacks. "Scholar stops
  stepping nowhere (5 unchecked tbPlayerMove sites, flee/dodge/close
  fallbacks)". A BOT-POLICY change, same class as r185's (k). The same
  commit froze the pre-change policy as scripts/policies/competent-r127.js.
- The r188 probe uses the live competent.js, so pass A is "same seeds,
  same probe, game code + bot policy changed" — (l) is a named confound
  on every pass-A comparison, exactly as (k) was in r185.

Pass-A reshaping on the 4 scored seeds (vs r185 pass A):
- 89701: sat d90 (was d91), alive 9 (was 7), ladder 66 (was 65),
  w5:1 (same), uw 5 (same), peakVets 3 (was 2) — healthier.
- 89702: sat d97 (was d90), alive 7 (same), ladder 68 (was 75),
  deedGate NEVER ok (was first ok d81), w5:0 (was 4), uw 4 (was 5
  FACED), peakVets 1 (was 2) — wave 5 never unlocked.
- 89703: sat d105 (was d132), alive 5 (same), ladder 45 (was 65),
  w5:0 (same), uw 4 (same), peakVets 0 (same) — sat 27 days early.
- 89704 (forcedrift): VILLAGE-LOST d77, alive 0 (was sat d90, alive 9,
  ladder 81), ladder peak 3 counted 39 — one point short of the National
  threshold 40 at d40 peak; 14 deaths d17–d77 (alien d17, night d22,
  sickness d46, contest d54, thirst x2 d56, wound d58, contest d66,
  wild d66, sickness d69, monster d70, night d76, wild d77); uw 4
  (was 5), w5:0 (was 1), peakVets 1 (was 2).
- Prime suspect is (l): the scholar now actually closes/flees instead
  of stepping nowhere, which moves fight outcomes, deaths, and standing
  on every seed. Game-code deltas (d) preserver cap and (g) synergy
  discovery are secondary suspects, not excludable on this panel.
- Discrimination proposed for the NEXT run (not this one): pin
  competent.js to the frozen competent-r127.js copy for a matched A/B
  on the same 5 seeds. No mid-run re-score or re-run here; verdicts
  stand on the pre-registered bindings with (l) named as the confound.
