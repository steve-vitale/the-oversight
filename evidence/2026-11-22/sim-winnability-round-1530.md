# sim-winnability-round-1530 — Loop B adoption of the timed-out 1330Z round

- **Run:** fleshout-loop-b-20261122T1530Z, Loop B, axis winnability-chain. **Mode:** ADOPTION-ONLY, no fresh arms. The dead run timed out during closeout with both arms committed-but-unmerged; the adoption verified, rebased, re-proved, merged, and closed out.
- **Adopts:** fleshout-loop-b-20261122T1330Z (claim retired to .DEAD; lock deleted as stale — see below).
- **Base at adoption start:** master `4dc7cb454` (journey-landing r154). **Merged tip:** `b199d55c8`.
- **Loop A:** live on scale-onramp (1415Z claim: sim-needwave-a-adopt, sim-needwave-b, sim-gunloss-a) — NOT touched. Loop A's sim-needwave-a tree (512f86760, not on master) is Loop A's adoption; this run did not touch it.

## Stale-lock recovery

The 1330Z lock (run_id `fleshout-loop-b-20261122T1330Z`, created 2026-11-22T13:31:00Z) was ~2h old at adoption start. Registry heartbeats for its two trees were both stale past the 15-min guard (`sim-leaderhpgate-b` 13:35:41Z, `sim-launchfield-refreeze-b` 14:41:18Z), no coordinator process for the run existed in `ps`, and no live subagent owned it. Per the guard the run was DEAD: the lock was deleted (same-call read + delete, run_id matched) and its claim retired to `.DEAD`. Both workers' worktrees were intact and clean, each exactly 1 commit ahead of master, neither commit on master. This adoption's own lock (`fleshout-loop-b-20261122T1530Z`, 2026-11-22T15:35:00Z) and claim were created before any sim or merge work.

Pre-flight: main tree clean (`git status --short` empty), disk 47%, `worktree-reap.sh` SKIPPED (registry lock held by another reaper run — Loop A's registration was in flight; no cleanup this run, retried at closeout — see below). Origin/master (`503d048a8`, batch-ship version bump) is an ANCESTOR of local HEAD — local is ahead in the normal loop state; the ship loop owns the push. No divergence.

## Arm 1 — sim-leaderhpgate-b: NO-GO kind CONCEPT-DEAD (subsumed), merged d9d98bf8f

Evidence: `evidence/2026-11-22/sim-leaderhpgate-b.md` (prereg `sim-leaderhpgate-b-prereg.md`, frozen 2026-11-22 ~14:46 UTC on base `bda6ff495`). The named next lever from the hpgate NO-GO: price a leader-only HP floor alongside the whole-party floor, door by door.

**Adoption verification (independent of the worker's word):** the `src/js/villager-agency.js` diff is env-gated (`process.env.LEADERHPGATE === '1'`, placed AFTER the HPGATE block, no RNG drawn, off-mode byte-identical). The committed analysis JSON was re-read: control == armed exactly on all 8 seeds (6 fought doors, 3 vKill, 2 vFlee, 1 vDie, dealt 4959, leaderSub25 0, projBands dead2 1 / collapse2 3 / safe 2); `controlGateFires` 3 = `armedGateFires` 3, `controlLeaderFires` 0 = `armedLeaderFires` 0, gate notes identical (1 hold, 0 lead). Bars: D1 FAIL (leader-sub-25 pool empty both legs), D4 FAIL (0 marginal fires), D2/D3/D5 pass, M5 pass. Corpora 8+8+8 files as claimed.

**Rebase + proofs on the rebased tip:** rebased clean onto `4dc7cb454` (no src/js overlap — the only src change since `bda6ff495` is `convo-beats.js` from journey r154); the full proof set re-ran green on the rebased tip: allyslot3 18/18, pinquaddoor 35/35, pinquaddoor-wide 16/16, dmgpin 29/29, doorflee2 49/49, downedtwice 25/25, hypofloor 48/48, hpgate 43/43, leaderhpgate 50/50, analyzer selftest 24/24. Merged ff-only `4dc7cb454..d9d98bf8f`, tree clean. Worktree released done-merged, branch deleted.

**Verdict stands: NO-GO, kind CONCEPT-DEAD (subsumed).** The leader gate never fired once on the armed leg — its condition is a strict subset of HPGATE's on the same leg, and HPGATE refuses every door the leader gate could refuse first. Both legs trajectory-identical on all 8 seeds. The mechanism is staged and works in isolation (proof §1a); the concept as a separate lever fails on its merits. Do not retry a leader-HP floor without a new mechanism.

**Named next lever (from the arm, §9): the leader-PROJECTION gate.** Refuse a wave-4+ door when the leader is projected at or below the floor within 2 rounds of focused wave-4 damage (~25 HP/round), not when they are already below it. S10 says it would have touched 4 of the 6 fought doors (dead2 1 + collapse2 3) — including the d108 leader death, where Petra entered at 64 HP and died in round 7 with the monster at 44 HP. The before-placement attribution variant (leader gate first, attributing the leader-driven share of HPGATE fires) also remains available.

## Arm 2 — sim-launchfield-refreeze-b: DIAG-NO-GO on supply, merged b199d55c8

Evidence: `evidence/2026-11-22/sim-launchfield-refreeze-b.md` (prereg `sim-launchfield-refreeze-b-prereg.md`, frozen 2026-11-22 ~13:51 UTC on base `bda6ff495`). Fresh-band re-judge of the held launchfield DIAG-GO on band 107383–107390. Instrument only (`scripts/` + `evidence/`), no `src/js` change.

**Adoption verification:** the committed analysis JSON was re-read: 8 files, 0 errors, instances opened 7 (launched 3, target-killed 1, selected-blocked 1, plan-churned 2, candidate-not-bid 0, unknown 0); Leg S ledger 16 parts, scored 0, explained 16, unexplained 0; whyNot away 9 / dead 4 / seed-day 3 / field-encounter 0; Leg R reproduction 10/10 exact; mechanism UNTESTED. Corpus 8 files as claimed.

**Rebase + proofs on the rebased tip:** rebased clean onto `d9d98bf8f` (post-leaderhpgate master). Proof test re-ran **50/52** on the rebased tip — the 2 failures are exactly the §1 anchor checks BY DESIGN (merge-base `d9d98bf8f` ≠ frozen `bda6ff495`; `src/js` differs from the frozen base by the journey-r154 `convo-beats.js` change). This is the 0930Z precedent exactly: the anchor test cannot pass on a rebased tip by construction once master moves. The §6/§6b anchor-pin checks PASS (driver still records the frozen literal; the tripwire still fires), live-driver legs pass, analyzer selftest 71/71 green. The instrument reproduces on the new tip. Merged ff-only `d9d98bf8f..b199d55c8`, tree clean. Worktree released done-merged, branch deleted.

**Verdict stands: DIAG-NO-GO on supply.** Completeness (0 unexplained of 16) and reproduction (10/10) hold, but the field-encounter fallback fired 0 times on the fresh band — exactly as on the held band — so the held DIAG-GO is NOT re-asserted. Two consecutive 8-seed bands have now supplied zero field-encounter parts. The next judgment needs a band that actually supplies a not-bid holder-day with a Haven part and a same-day encounter, or a different instrument question — do not re-run the same band shape.

## Wall numbers (this run's judged corpora)

Leaderhpgate band 107375–107382 (identical both legs): wins 0/8; national by standing ≥200: 5/8; national by scaleRank: 0/8; table 0/8; wave-4 unlocked 8/8; wave-5 unlocked 5/8; median survival 140d; survived 3/8; deaths 758 (94.75/run); starvation-caused 3.

Launchfield-refreeze band 107383–107390: wins 0/8; national by scaleRank: 0/8; national by standing ≥200: 2/8 (107383 standing 250, 107385 standing 600 — both still regional rank); table 0/8; wave-4 unlocked 8/8; wave-5 unlocked 2/8; median survival 135.5d; survived 1/8 by the analyzer's `gameDays >= 150` definition (2 by the driver's `endReason` — see the gameDays/days drift finding, already in the backlog); deaths 734; starvation deaths 3; standing-199 stall 4/8.

In plain words: villages reach wave 4 everywhere and wave 5 sometimes, standing piles up past 200 without ever leaving regional rank, and nothing wins — the same wall as the held bands, and on the refreeze band the launch gate was never even asked (0 assessed days).

## Telemetry deviation check

Leaderhpgate, re-run by the adoption per leg with `--allow-recorder-corpus`: exactly the 3 LOUD regime lines on BOTH legs (national 12 → 0, table 16 → 0, wins 16 → 0), exit 1. Identical on control and armed — no arm effect. Baseline NOT rolled; the baseline file itself forbids comparing pre-seat substrates against it.

Launchfield-refreeze, re-run by the adoption: the designed recorder-corpus refusal (exit 2), no LOUD lines — same as launchfield-b.

## Round gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-1530Z-round` on the merged tip `b199d55c8` (log `hidden_files/check-quick-1530Z-round.log`, launched detached via setsid nohup, serialized after the journey r266 gate cleared): **339 passed, 5 failed in 605s, 0 attributable.** The 5 are exactly the standing set from 1115Z: measurement-proof staleness pair (`test-measurement-proof-update.js` "Proof source inputs are not current", `test-measurement-workflow.js` retained neutrality proof), phone-frame stale receipt (`test-phone-frame-proof.js`, retained browser inputs vs current source), and 2 × 120s deed-attainment timeouts (`test-living-garden-deed-attainment.js`, `test-one-person-army-deed-attainment.js`). Master did not move during the gate (still `b199d55c8` at gate end, 16:05Z), so the numbers describe the merged tip exactly. No load flakes this run.

## Infrastructure

- Heartbeat stall: the first adoption heartbeat attempt blocked ~90s+ on the registry lock (Loop A's sim-needwave-b registration held it for its ~25-min checkout, per the 0930Z precedent); the command was killed before the rebase started (no rebase state, tree verified clean) and the rebase re-run without the heartbeat prefix. Both adoption heartbeats were refreshed via `worktree-release.sh` at closeout instead.
- No write-flap window observed during the adoption (writes first-attempt throughout); uptime 4:09 at 15:41Z (machine came up ~11:31Z).
- Safe-commit index clobber: NOT struck on either adoption merge (both were ff-only merges, no commits by the coordinator except this record — see below).
- Proof staleness on the base: the retained neutrality proof and phone-frame proof fail on the frozen base without either arm's changes (leaderhpgate §3). A refresh is already owed to the loop in the backlog (lines 1983/2084/2104) — not re-filed.
- Findings: the 1330Z run's workers had already filed the refreeze-band items (gameDays drift, standing-199 stall, seed 107390, zero field-encounter parts, FINALES NEED A NATION line). This adoption filed ONE new item: the "Committed" line naming Loud-Eyes during a Reunion fight (leaderhpgate-b §5).

## winnability-chain state

Stays converging (NOT converged): the recorder is complete, the HP gate fires correctly, and the leader-HP gate is now priced and killed as subsumed — but kills still don't convert (doors fought and fled, wins 0 everywhere, national 0 everywhere on the scaleRank definition). Next blanks, in order: (1) the leader-PROJECTION gate (leaderhpgate §9); (2) the launchfield re-judgment question — a band that supplies a not-bid holder-day, or a different instrument question; (3) the re-point queue items (arm-2 field-fight damage+staying toggle, flee-repair build, standing accumulation on gear-ready seeds) remain unclaimed. scale-onramp stays converging (untouched; sibling loop A). food-economy stays converging (parked per the re-point).

Merged `d9d98bf8f` (leaderhpgate) + `b199d55c8` (launchfield-refreeze) + this record (`evidence/2026-11-22/sim-winnability-round-1530.md`, committed at closeout; hash in the tracker review).
Claim deleted by this adoption; lock deleted LAST by this adoption (run_id matched per-line).
