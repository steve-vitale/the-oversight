# sim-land-b (2026-10-14, loop B) — stale-lock recovery landing of run fleshout-b-2026-10-14-1930's arms

## Pre-registration (§§9–12, 14)
- PRIMARY: land the previous run's two arms with integrity — GO arm (sim-allowgate2) lands as own commit; KILLED arm (sim-overdraw3) lands instruments/evidence only per the landed-tree-guard convention. GO threshold: proofs re-verified green on the new base, branch rebased cleanly, files in-scope (scripts + evidence only, zero src/js).
- Metric: both branches verified clean in-tree (status empty), commits verified via git log (never on a worker's word).
- Stale-lock recovery: lock fleshout-b-2026-10-14-1930 created 2026-10-14T19:51:00Z; worker heartbeats 21:18:22Z (72m stale, >15m); no live subagents (subagent.list empty). Per the concurrency guard the previous run is DEAD. Lock deleted, replaced with fleshout-b-2026-10-14-2230; noted here per protocol.

## What the previous run left (verified in-tree, not trusted from claims)
- sim-allowgate3: commit 3a915705 — sim-allowgate2 (loop B, food-economy #187): re-arm r14's 4-day-floor gate as separate layer with candidate-only hold telemetry. GO at pilot (starvation 21->16, hungryDays 44<=67.6, national 7->8, table 4->5, median 92->101d; proof RED->GREEN, det-gate 16/16 both sides, SMOKE green). Files: scripts/policies/allowgate2.js (130 lines, ALLOWGATE2=1 default OFF) + proof + det-gate + sweep + sense + evidence. Zero game-code changes.
- sim-overdraw3: commit 878cc7c5 — KILLED AT PILOT per §14. Primary passed decisively (0.517 absolute / 0.567 per-day-alive) but median guardrail missed (179->123d) with real belong-road harm (early-full tribute + tribute-armed feasts starved 2 villages 88-122d early; starvation 0->3 on belong). Layer scripts/policies/overdraw3.js DELETED per kill protocol. Kept as instruments: proof (RED->GREEN incl G10 fresh-first ordering + R3 naive-RED foil) + sweep + det-gate (landed-tree-guard INFO-SKIP pattern) + sense + evidence + per-seed data. Zero src/js changes.
- sim-tribgate: already landed by the previous coordinator (commit 6382bfc7 on master): KILLED AT PILOT, instruments + evidence landed.

## Landing steps (coordinator)
- [x] Verified both worker trees clean (git status --short empty) and commits real (git log in-tree).
- [x] Rebases onto master (master had moved under the workers: journey-social r14 + loop-A landings): both clean, one commit each -> e05283c1 (allowgate2), f9c3cbc7 (overdraw3).
- [ ] Proof re-run green on new base: allowgate2 proof + det-gate (running); overdraw3 proof + det-gate INFO-SKIP (verified).
- [ ] git merge --ff-only sim-allowgate3 / sim-overdraw3 from the main tree.
- [ ] Verify git log --oneline; worktree-release.sh <slug> merged; git worktree remove; git branch -d; worktree-reap.sh; git status --short empty.

## Wall numbers (this landing batch)
Landing carries no new measurements; wall numbers from the landed arms' evidence: national 7-8/16 (allowgate2), table 4-5/16, wins 0, wave 4-5 unlocks per overdraw3 sweep (wave-4/5 per-side tallies), median 92-101d.

## Metric review (§14)
- Landing a GO-at-pilot arm without a confirm: the pre-registered GO header for allowgate2 said "GO -> land as own commit" with no confirm requirement (policy-side, default-OFF, zero game-code changes). A killed arm landing its instruments is the established convention (bbe1e756 / 2b8c0f74 / 6382bfc7).
- The previous run's claim file fleshout-b-2026-10-14-1930.json was deleted without its own run deleting it — stale-lock recovery noted. Its sim-findings items were already appended by that run (not re-appended here); the three new arms re-claim #199 (re-claimed), #221 (claimed), and the new feast-table item (appended).

## Convergence state
food-economy: converging. The allowgate2 lever (feast candidate gating via the r13 allowance) is the second food-economy lever to GO (after prodthrottle); overdraw3's kill sharpens the fresh-first doctrine (tribute timing is the remaining harm channel) — picked up directly by this run's sim-overdraw4 arm.
