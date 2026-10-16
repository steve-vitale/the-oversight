# Run fleshout-20261016T2116Z — run summary (flesh-out loop, axis scale-onramp)

**Run:** fleshout-20261016T2116Z (2026-10-16 21:16–22:45 UTC). **Axis:** scale-onramp (blocking).
**Claim:** hidden_files/lever-claims/fleshout-20261016T2116Z.json (filed 21:22Z, deleted on completion).
**Loop B:** held the live claim on food-economy all run (fleshout-loop-b-20261016T1930Z) — zero file overlap.
**Lock:** stale-lock recovery at run start (prior run fleshout-20261016T1715Z, heartbeat 67 min stale, lock 3.5h old — dead per guard; lock deleted, mine created).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written in the claim before any sims)

**Question:** on the pre-seat courtship substrate, (a) does the fightopen "mattering" arm move trick resolutions — selective round-1 openers (keep congregation's beam-prevention, drop reunion's strike-cost suspect); (b) WHY does resolvePatrol never fire (dead-code blank).
**Substrate:** pre-seat courtship — SEATDRIVE=0 explicit, FEASTSCALE_R13=1, NODEWITNESS=1 (+ TRIBFLOOR/SUCCGRACE/RAIDDENSITY/WINPURSUIT/WINDEFER for patrolblank). Policies leadfeast/belongfeast. 180d death-aware. 8 fresh seeds per arm (patrolblank: 301–308; trickmatter: 990, 992–1002, zero prior hits verified).
**Arm sim-trickmatter PRIMARY (binding):** GO iff (a) beam-prevention resolutions ≥2 on 8 fresh seeds AND (b) treatment median survival ≥ control median −5d (control = full-opener FIGHTOPEN=1, identical seeds). SECONDARY: conditions-never-met ≤40%. Guardrails: national ≥ control−2, no new death mode, wave reach not worse.
**Arm sim-patrolblank (diagnostic):** GO iff 100% attribution of patrol-resolution outcomes over 16 runs + named fix.
**Recovery:** dead run 1715Z's sim-helpcall branch (diagnostic-GO, lever null) — verify proof in its own tree, rebase, re-run proof, merge.

## Arms

**sim-helpcall RECOVERY — LANDED b3dd1514.** Dead run's diagnostic instrument (scripts/policies/helpcall.js, HELPCALL=1 default OFF, zero src/js — the first aid-engaging policy on the sweep substrate; lever verdict was null: raid deaths 58 vs 60). Proof 20/20 green on the rebased base (unit + engine-true + det-gate byte-identical). Verified in-scope (70 files: helpcall scripts + beats + perseed + evidence only), rebased clean, merged --ff-only. Same-loop recovery precedent (B 0955Z); also covered by Steve's new standing rule ("Take responsibility for those left alone trees. Finish work if relevant").

**sim-patrolblank — DIAGNOSTIC GO, LANDED 3a71bab2.** 16 runs, 2,541 sampled days: resolvePatrol fires 0, assignTask('patrol') attempts 0, taskLeads.patrol observations 0. Opportunity universe = 0 → 100% NEVER-SCHEDULED. Substrate property, not a gate bug: Game.assignTask is called in-engine nowhere (only caller is the app.js talk-menu UI); the courtship policies pass only water/wood/fish/garden/forage/cook to assignTask, never 'patrol'; taskLeads.patrol needs a patrol-domain delegation that never exists. The router itself is live (sim-patrolassign proved 3,655 fires with a policy layer). Named fix (NOT applied — diagnostic only): policy-side watchTreeline in competent.js upkeep — when a world monster is within ~2 tiles of Haven and nobody is on patrol, assignBest(Game, 'patrol', ['soldier','police','hunter','fighter']) via the honest in-person verb with the proven gates (trust≥20, competence≥1.0, HP≥60). NOT engine-side auto-assignment (would bypass assignTask, the leader's core verb — contradicts the DRIFTER gating). Det-gate PASS (byte-identical digests). Sense-read: the only patrol-matched beats are the System's raid alarm "Perimeter violated! …Checking. Yes. Unprecedented." — byte-identical across all 16 runs; filed to sim-findings as a narration observation. Villages die of combat not hunger; the treeline is never watched despite near-daily threats — scheduling blank, not resolution blank. Zero src/js, zero policy changes. Proof re-run green on rebased base (mid-run master movement: helpcall recovery + loop B's stackcensus-b landed — rebase-then-merge per protocol).

**sim-trickmatter — KILLED AT PILOT, evidence+instruments LANDED 8f1f1c1d.** Selective opener built (FIGHTOPEN_SELECTIVE=1: congregation opens, reunion does not), proven 35/35 RED→GREEN (det-gate byte-identical, SMOKE), then reverted zero-trace per kill protocol (patch preserved at ~/workspace/trickmatter-backup/fieldFights-selective-final.patch). 48 runs (12 fresh seeds × 2 policies × 2 arms, identical-seed paired): ZERO congregation fights on either arm — PRIMARY(a) unmeasurable on an empty pool. PRIMARY(b) 138d ≥ 133d holds on the letter but is substantively vacuous — neither arm ever fought a wild wave-4 reunion, so the reunion strike-cost hypothesis stands UNTESTED. Guardrails OK (national 11/24 both, table 20/24 both, no treatment-only death modes). SECONDARY no pool. **Structural blocker:** commit ebcdf397 (combat readiness gates wave unlocks, Steve's design call #4, landed 19:52 UTC) replaced the faced-experience bar with waveCombatReadiness() — 4 fighters armored P≥15, 5 armed, 3 counters known, veterans with wave-3 kills. 0/48 runs on the pre-seat courtship substrate met the bar (maxWave ≤3 everywhere; villages reached national 11/24 but never armed). The ENTIRE w4/5 trick-execution game is currently UNMEASURABLE on this substrate — sim-fightopen's round-2 seeds (983–986) DID unlock wave 4 under the same gate, so reachability is seed-conditional. Logged as a steve-call candidate in sim-findings: is 0/48 the intended selectivity, or is the gate too tight? Don't re-run trick sweeps on the pre-seat courtship substrate until wave-4 unlocks are demonstrated on it.

## Metric review
- Trickmatter PRIMARY(a): the ≥2-resolutions bar was unmeasurable, not missed — the substrate (not the lever) denied the pool. Correct revision for the NEXT run: gate the primary on a readiness-satisfying substrate (a policy that arms fighters and banks wave-3 kills) or pre-screen seeds for wave-4 unlock before enrolling them in the sweep.
- PRIMARY(b): median-survival comparisons are vacuous when neither arm enters the measured fight class. Reported as UNTESTED, not GO — no re-scoring.
- Telemetry schema: trickmatter per-seed JSONs carry `won`; telemetry-check reads `wins` (the recurring drift class). Manually triaged below.

## Telemetry deviation check (Steve 2026-10-13)
`telemetry-check.js --baseline hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-10-16/perseed-trickmatter/*.json' --metrics national,table,wins,exiled` fired 3 LOUD — ALL EXPLAINED, no baseline roll:
1. `national 12 → 22 (n=48)`: n-mismatch (baseline 16 runs vs 48 files) + substrate moved under ebcdf397 (0/48 wave-4 unlocks); own control 11/24 = armed 11/24.
2. `table 16 → 40 (n=48)`: n-mismatch; 40/48 = 83% vs 16/16.
3. `wins 16 → 0`: substrate-mismatch by design (pre-seat, SEATDRIVE=0); own control 0=0.
Baseline kept (national 12, table 16, wins 16, exiled 0).

## Village assessment
The villages that never armed never fought the war they were built for. Twelve fresh villages reached national 11/24, sat at tables 20/24, buried their dead of ordinary combat — and not one ever faced a wave-4 trick-fight, because the readiness bar (armor P≥15 ×4, 5 armed, counters, veterans) sat above every village's head. The treeline stayed unwatched all the while: world monsters within 2 tiles of Haven on 96.7% of sampled days, and not one patrol ever walked it — the assignment verb exists in the UI, but no policy speaks it. The ceiling moved from wave unlocks to arming while the loops were watching the old ladder.

## Convergence state
scale-onramp: **converging**. Wall on the pre-seat substrate this run: national 9–11/16-equivalent, table 13–20/24, wins 0/16 (by design), wave-4 0/48 (readiness-gated — the new load-bearing blocker), wave-5 unmeasured, median ~133–138d. Landed: helpcall aid-engagement instrument (recovery), patrol-blank diagnostic + named fix, trickmatter kill with the readiness-gate steve-call filed. The durable lesson: every w4/5 arm on this axis now needs a readiness-satisfying substrate first — arming is the on-ramp's new floor. Directive lift remains a Steve call.

## Infrastructure
- Stale-lock recovery (documented above); all worker trees registered with WT_RUN_ID matching the lock's run_id — the 0215Z lesson held, no guard incidents.
- Mid-run master movement: helpcall recovery (b3dd1514) + loop B stackcensus-b (77b36604) + loop B thirstcause-b (d13d58f1) landed during the run; both worker landings needed rebase-then-merge (proofs re-run green on new bases). Merge exits captured unpiped (no PIPE MASKS MERGE EXIT repeat).
- Pre-existing: scripts/check.js --quick shows 94 pass / 3 fail in test-table-trial-fire-20261012.js — verified failing on pristine HEAD, unrelated to this run.
