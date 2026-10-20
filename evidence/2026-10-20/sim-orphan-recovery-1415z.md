# sim-orphan-recovery-1415z — stale-run recovery + same-owner collision stand-down

Run: fleshout-20261020T1415Z (oversight-flesh-out-loop), axis scale-onramp (blocking, STANDING DIRECTIVE).
No new sims were judged by this run — it is a recovery/coordination record. Pre-registered metrics: N/A (recovery only).

## What happened (UTC 2026-10-20)

- 14:43:53Z — Run started. Lock from run fleshout-20261020T1215Z present (created 12:42:46Z, run_id fleshout-20261020T1215Z).
  Registry: that run's tree sim-spearfund heartbeat 13:11:48Z (92min stale); the 1015Z run's trees
  sim-villagergear/sim-raidgarrison heartbeats 12:24:31/32Z (140min stale). Both runs DEAD per the 15-min rule.
- 14:43Z — Deleted the 1215Z lock (stale-lock recovery; also >90min fallback). Pre-flight: main tree clean,
  disk 21%, worktree-reap ran (6 active trees, none auto-removed — all dirty or live).
- 14:47:01Z — Created this run's lock. Read convergence tracker + lever claims (1015Z + 1215Z claims live but dead).
- 14:47Z — Wrote claim hidden_files/lever-claims/fleshout-20261020T1415Z.json (3 orphan-recovery arms), marked the
  two dead claims .DEAD, adopted the 3 orphan trees in REGISTRY.json (run_id + fresh heartbeat).
- ~14:48Z — Spawned 3 recovery workers (raidgarrison verify / villagergear finish-pilot+j judge / spearfund reconcile+judge).
- 14:52:25–14:53:19Z — A DUPLICATE instance of this same loop (owner oversight-flesh-out-loop, later identified via
  registry as run 2026-10-20T14:59:51+00:00, tree sim-villagergear-judge) merged all three orphan branches to master
  and removed the adopted trees WHILE this run's workers were active:
  - 431bca256 sim-spearfund INCOMPLETE (loop A timeout recovery): pilot unjudged — layer never fired in 2/8 armed
    seeds (looted=0, tries=0); baseline 7/7 spearEver via contest channel; proof 19/19; instruments + evidence kept.
  - 84818a64f sim-villagergear INCOMPLETE (loop A timeout recovery): pilot unjudged — 3/8 armed seeds hit GO bar
    (partial), control primary empty, guardrails green on partial; proof + instruments + partial corpus kept.
  - a64b88e3c sim-raidgarrison KILLED-AT-PILOT (the dead run's kill commit, ff-merged as-is).
  The duplicate deleted this run's lock and registered sim-villagergear-judge (heartbeat fresh — LIVE).
- 15:01:47Z — This run's raidgarrison worker completed its verification (see below). The other two workers were
  closed (their trees no longer exist — further work void).
- This run STANDS DOWN per the same-owner collision rule: the duplicate's run is live, its landings verified-good,
  and continuing would cause a worktree war. Lock NOT recreated. Claim renamed .COLLIDED (kept for audit).

## Arm dispositions (all three orphans now landed)

1. **sim-raidgarrison — KILLED-AT-PILOT, VERIFIED, landed a64b88e3c.** This run's worker independently verified:
   45 arm files byte-identical between the dead run's 0d93d075a and a64b88e3c; proof re-run on master green
   (KILLED-VERDICT, exit 0); spot-check primary 53/83=0.6386 → 38/59=0.6441 = 1.0086x vs GO ≤0.50x (miss confirmed);
   absolute 53→38 = −28.3% ✓; guardrails allHold; layer scripts/policies/raidgarrison.js absent, zero-trace
   (repo-wide grep hits only instruments + evidence). No [needs-eyes]. Backlog #692/#693 already filed by the
   dead run's worker (empty-draft diagnostic named next; muster-beat keying note).
2. **sim-villagergear — INCOMPLETE, landed 84818a64f** (by the duplicate). Verified sane: evidence + per-seed
   partial corpus + instruments; no src/js; policy file scripts/policies/villagergear.js present from the earlier
   layer commit 3628ccf71 but env-gated VGEAR=1 (default-OFF, inert on master). The duplicate's
   sim-villagergear-judge tree is now judging the partial pilot — not this run's work, not touched.
3. **sim-spearfund — INCOMPLETE, landed 431bca256** (by the duplicate). Verified sane: evidence + instruments;
   scripts/policies/spearfund.js present but env-gated SPEARFUND=1 (default-OFF, inert on master); no src/js.
   Backlog #698 (contest grantWeapon bypasses gear discovery — needs steve-call) stands as the mechanism verdict.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline hidden_files/telemetry-baselines/scale-wall-preseat.json
--current '/tmp/rg-telemetry/*.json' (32 symlinked per-seed raidgarrison files) --metrics national,table,won,exiled`
→ **quiet** (32 files, 4 metrics, no large deviations). Baseline NOT rolled.
(Note: script's expandGlob supports a single `*` in the basename only — staged via symlinks. The body's literal
`wins` metric key would fire the documented spurious "wins disappeared" LOUD; used `won` per the 1015Z review.)

## Metric review

No new sims judged by this run; nothing to re-score. The pre-registered thresholds of the three orphan arms
transfer to the duplicate's ongoing judge work (villagergear) and to the next run (spearfund's #698 steve-call).

## Collision analysis (for the guard)

The duplicate started inside the 14:43:53–14:47:01Z no-lock window (this run deleted the dead 1215Z lock at
14:43:53Z and created its own at 14:47:01Z — a ~3-minute gap). It never saw a live lock, so its guard passed.
It then deleted this run's lock (14:47:01Z vintage) and merged the adopted branches. Lesson: the delete-lock →
create-lock sequence is not atomic; a second instance starting in the gap sees no lock and proceeds. A safer
pattern is create-then-verify (write the new lock first, then re-check no other live lock/claim appeared), or
keeping the stale lock in place until the new lock is written (delete only after creating). Filed here; the
guard text itself is the coordinator's call to change, not this run's.

## Convergence

scale-onramp stays converging. The raid-posture avenue is now fully closed on this substrate (5/5 killed:
raidwall, scholarraid, shelteronly, raidstand, raidgarrison — the posture budget is spent; #692's empty-draft
diagnostic is the named next). The villager-fighter gear pilot is partially run and under judgment by the
duplicate run. The spearfund channel is parked on the #698 steve-call. The wave-5 door remains the binding wall.
Directive lift remains a Steve call.
