# Scale-onramp round 0215Z — Loop A, axis scale-onramp

**Run:** fleshout-20261120T0215Z · **Master at closeout:** `0edff1f59` (bowknow merge; searsupply merged first as `55770a359`, sibling Lane A journey-deepening r245 adoption landed `ae33e03b3` on top in between, zero overlap)
**Status: merged locally, pending ship.** Both arms verified from files/corpora (never from the workers' word), merged ff-only, gated (see below), findings updated, worktrees released, claim retired, lock deleted. No push, no version bump.

## What happened to the run

A host write flap ate the first ~40 min: lock + claim placed 02:18Z, then worktree registration failed twice on git ref writes (`Could not reset index file`, `couldn't write .git/refs/heads/*.lock`); `git update-ref` probes failed 02:21Z, 02:27Z, 02:37Z, 02:48Z and passed 02:58Z. Both trees registered after the clear (~13 min under load) and were heartbeated. A VM restart ~03:41Z (uptime 1 min at 03:42Z) SIGTERM-killed the first sweeps silently; both workers recovered from disk (re-ran only missing seeds) and heartbeats were re-stamped immediately after the restart. Loop B live on winnability chain all run (0130Z claim, arms sim-dmgsurvey-b + sim-deadtarget-gate-b, NOT touched). Both arms worked the two named next levers from the 2215Z round, on one shared fresh band 107051–107058.

## Arm 1 — sim-searsupply-a: HALTED, no verdict (pilot 3/16 seeds)

Lever SEARSUPPLY=1 (default OFF) built, proven, committed, merged — the pilot was cut short by the run's closeout, not by a verdict. Evidence: `evidence/2026-11-19/sim-searsupply-a.md` (branch tip `55770a359`).

- Design (frozen prereg `5142585fc`, band 107051–107058): contest-prize searcaster grants bundle +2 fusion cells; searcaster/cell prizes won by the player redirect to the village's most fight-proven living villager (deed-weighted, own eligibility, not `contestEligible`); tier-4 contest cell weight 1/15 → 4/18. Draw-neutral BY CONSTRUCTION — zero new `Math.random()` draws on either leg (proof asserts exact draw counts), the direct answer to the fusioncell-fix-a exposure confound. No village craft for cells (alien tech); ruin salvage not built (villagers almost never search ruins — documented as the follow-up lever).
- Proofs: `scripts/test-searsupply-a.js` 32/32, analyzer selftest 45/45.
- Pilot: 3/16 seeds (ctl 107051; arm 107051 smoke + 107052). Signal, NOT a verdict: arm holder-days 22 (ella_johnson, 22d, max 2 cells), armed entries 4, volleys 0; ctl 0 everywhere. Yield is lumpy (loaded gun on 107051, nothing on 107052). The armed holder never leads (0 armed leads) — the deed-based redirect does not select for expedition holders, who are the leads; the metric review names lead-weighted recipient as the revision if bar 3 fails with bars 1–2 passing.
- Wall (3-seed partial): national 0/3, wins 0/3, wave 5 2/3, all survived 150d.
- NEXT RUN resumes the pilot from the arm's §7 (driver refuses to overwrite finished seeds: ctl 107052–107058, arm 107053–107058), then judges against the four frozen bars. #2599 stays answered; its next lever is now built and mid-pilot.

## Arm 2 — sim-bowknow-a: NO-GO, killed cleanly (#2590 stays open on the serve half)

Mentoring does not serve. Evidence: `evidence/2026-11-19/sim-bowknow-a.md` (branch tip `0edff1f59` after two clean rebases; proofs re-run green after each).

- Design (frozen prereg `8e1cd3843`, mechanism corrected pre-sim: mentoring, not pack-seeing): BOWKNOW=1 in `villagerWeaponCraftDay` (`src/js/villager-build.js`) — a bow-knower at home teaches one spear-holder per duty day; learner still needs materials and faces the blind 35% craft roll. Default OFF. Canon: no canon doc covers launch gear-up or knowledge seeding — said in the evidence, not invented; mentoring is canon-consistent (skills are teachable villager-to-villager).
- Proofs: `scripts/test-bowknow-a.js` 19/19, analyzer selftest 49/49 (partition noSource formula, gate-on-both-legs judge). Landed proofs re-run on the rebased tip before merge: spearstage 26/26, speargate 31/31, bowcraft 58/58 — the worker's owed re-runs, done by the coordinator.
- Pilot (8 seeds × 2 legs, band 107051–107058, SPEARGATE=1 both legs): gate replicates perfectly (108/108 passed both legs, pool 10× floor); SERVED 0 (bar ≥ 3), volley-rate rise +0.030 (bar ≥ +0.10), consistency deltas +4/+4 (bars ±3, miss by 1 over tolerance); all cost bars pass trivially because nothing changed. FromStash 0, fromArmory 0, crafted 0 on both legs — 108 passed spear-holders, 0 bows in their hands. Panel `review_required`, no material signal (won 0→0, national 0→0, deaths 106.75→106.5).
- Why: the proof proves a knower CAN teach; live play cannot distinguish "never taught" from "taught but no materials / failed roll" — the instrument gap is named (lv[bow] reach unrecorded). The consistency deltas are an RNG-divergence story (mentoring changes which craft attempts fire, consuming `Math.random` differently; +9 departures arm-side), not a second failure — the verdict does not turn on them. Metric review owed for future knowledge/RNG-consuming levers: rate-based or departure-normalized consistency bars.
- #2590 stays OPEN on the serve half (gate half confirmed twice over: 49/49 spearstage, 108/108 here, both legs). Next lever named: departure-site seeing (a party-mate's bow visible while gearing up, seeding exactly at the craft attempt) — or lv[bow]-reach instrumentation first. The lever leaves no live trace (default OFF, no turn-on).

## Gate

`node scripts/check.js --quick` re-run FRESH by the adoption (the coordinator's run was SIGTERM-killed mid-flight; its partial log held only the header + dots). **339 passed, 5 failed in 581s — 0 attributable.** The 5 failures are the known standing set: the measurement-proof staleness pair (`test-measurement-proof-update.js`, `test-measurement-workflow.js`), the phone-frame stale receipt (`test-phone-frame-proof.js`, 3 assertions: retained browser inputs, boot-input coverage, phone evidence stale/missing), and 2 deed-attainment 120s timeouts (`test-living-garden-deed-attainment.js`, `test-one-person-army-deed-attainment.js`). Log `evidence/2026-11-19/check-quick-round-0215.log` (adoption re-run, 04:25–04:35Z).

## Wall numbers (this round's judged corpora)

- Searsupply partial (3 seeds): national 0/3, wins 0/3, wave 5 2/3, median 150d.
- Bowknow full band (16 configs): national 0/16, wins 0/16, wave 4 8/8 both legs, wave 5 4/8 both, median 150d both, community lost 2/8 both, deaths 854 ctl / 852 arm.
- Scale-onramp stays converging (NOT converged): the searcaster-supply lever is built and mid-pilot; the bow-knowledge lever is killed cleanly; nothing reached national or the table on either band.

## Telemetry deviation check

Not runnable: `hidden_files/telemetry-baselines/` does not exist in the main tree (no scale-wall.json anywhere); the baseline was never rolled, so no telemetry check could run against it. No LOUD lines. (Same standing note as rounds 1815Z/2215Z.)

## Infrastructure

- Write flap 02:18–02:58Z (~40 min) blocked registration; probes failed 4× then passed. No ref surgery during the flap; waited it out per the flap skill.
- VM restart ~03:41Z killed first sweeps silently (uptime 1 min); both workers recovered from disk, re-ran only missing seeds; coordinator re-stamped heartbeats first.
- Safe-commit index clobber hit both workers' commits (searsupply) and the bowknow interim commit — repaired via the `git ls-tree -r HEAD | git update-index --add --index-info` pipe each time; every commit verified correct.
- Master moved once under the run (sibling Lane A journey-deepening r245 adoption, 4 evidence-only commits, zero overlap); bowknow rebased twice clean, proofs green after every rebase.
- Main tree at closeout: clean except Loop B's untracked `evidence/2026-11-20/sim-winnability-round-0130.md` (not this run's — left alone).
- Both arms used fresh band 107051–107058 (freshness verified in both preregs across all preregs/evidence/findings/tracker/claims). The two arms ran in separate worktrees on separate branches; no shared state — the shared band number is a seed choice, not contamination.
