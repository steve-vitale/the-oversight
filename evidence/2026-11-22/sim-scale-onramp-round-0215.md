# sim-scale-onramp-round-0215 — COORDINATOR RECORD (Loop A fleshout-20261123T0215Z)

**Run:** fleshout-20261123T0215Z · **Axis:** scale-onramp (converging, NOT converged)
**Base master at start:** `a4603add1` · **Master at closeout:** `3fd09decc`
**Claim:** arms sim-dawnchoke-rejudge-a, sim-homebody-rejudge-a, sim-wornstack-a.
Loop B live on winnability-chain (0030Z gateavoid + launchfield-horizon, NOT touched;
that run timed out ~02:29Z with no commits; a separate adoption coordinator handles it).

This run took the 2115Z tracker's next blanks in order: (1) dawnchoke re-judge with a
corrected det-gate bound + total-deaths guardrail; (2) homebody re-judge on a wider band
with base-rate bars + solo-vs-party split; (3) worn-stack collapse fix #2698.
All three arms landed (merged locally, pending ship). No push, no version bump.

## Arm 1 — sim-dawnchoke-rejudge-a: NO-GO (bars 2 + 8) — lever parked

Merged `30c490779` (prereg + corrected analyzer) + `895f7a6ee` (evidence).
Re-judge reproduces the 2115Z arm exactly on identical seeds/substrate (band 107423–107430,
8 seeds, 150d, competent verbatim): attempts 12 → 57 (+45), launches 4 → 36,
2 of 3 stuck plans departed, choke 0.863 → 0.792, starvation 5 → 6, median 141 → 131.
Instrument validity passed (needwave proof 26/26, dawnchoke proof 22/22, analyzer
selftest 36/36 — re-run 36/36 on the rebased tip before merging; 0 instrument errors).
Two independent frozen bars fail:
- **Bar 8 (new total-deaths guardrail): FAIL** — armed mean total village deaths
  102.625 vs 91.875 = +10.75/run (bar ≤ +5); 2.69 deaths per extra launch.
  The §15 panel agrees (review_required, regression_signal).
- **Bar 2 (corrected det-gate): FAIL on 2/8 seeds** — anchors now genuinely verified
  (all 6 checks checked:true, pass:true; the vacuous checked:false defect is fixed)
  and the bound fires on every diverging seed, but on 107423 d99 and 107429 d146 the
  lever's first observable effect is re-ordering a departure that happens on BOTH legs
  (same holder/day/target/members, companion order swapped), days before the first
  extra depart call. Recording-order artifact, not non-determinism.
Lever REVERTED zero-trace (stays only on held branch sim-dawnchoke-a `4ac23b12f`).
Evidence: evidence/2026-11-22/sim-dawnchoke-rejudge-a.md (+ prereg, judgment/diag JSONs,
panel, per-seed corpora, driver logs).

## Arm 2 — sim-homebody-rejudge-a: NO-GO (§14a METRIC-BROKEN) — lever parked

Merged `3fd09decc` (single commit: prereg + evidence + analysis + panel + both 16-seed
corpora + leg logs, 43 files, evidence only, no src/scripts/docs changes).
Fresh band 107431–107446 (16 seeds, verified fresh), 150d, competent verbatim.
Control 51 launches vs armed 56 (+5, +9.8%); trio launches 39 → 43;
**Dale-class conversions 0 → 2, both WITH parties** (trio + pair; 0 solo — the 2115Z
solo-conversion caveat is closed); homebody holds 36 → 0; starvation 7 → 6;
median survival 150.5 → 151d. Det-gate PASS, anchors PASS, proof test 38/38,
analyzer selftest 28/28 (re-run 28/28 on the rebased tip before merging).
Frozen bar 3 (PRIMARY, relative: armed ≥ ceil(1.5 × 51) = 77) FAILS by 21.
The bar was calibrated to an expected base of ~8 launches (2115Z rate 0.5/seed);
the actual control base was 51 (3.2/seed, 6.4× livelier), so it demanded +26 —
nearly all walker launches the lever cannot touch. The lever's addressable pool
is 2 (79 handoff calls: 2 launches, 77 skips, 0 holds — every convertible range-0
hold converted, 2/2). The analyzer's own verdict under the OLD 2115Z bars is GO
(+5 passes +4; 2 conversions pass ≥1) — the divergence is the bar, not the numbers.
Proposed revised metric (evidence § metric review): primary = party-conversion bar
+ converted launches as a share of the convertible-hold pool; launch-count delta
reported, never judged. Findings #2498/#2568 stay OPEN.
Lever REVERTED zero-trace (stays only on held branch sim-homebody-a `e62603af0`).
Evidence: evidence/2026-11-22/sim-homebody-rejudge-a.md (+ prereg, analysis, panel,
per-seed corpora, leg logs).

## Arm 3 — sim-wornstack-a: FIXED (#2698) — landed

Merged `ff17699c7` (fix + proof test + evidence, 3 files, +255 lines).
mantleBecome now carries the source stack's `units` onto the worn copy when > 1
(single units stay bare, matching every other worn copy); a 2-cell stack worn as
one accessory no longer collapses to 1 on succession. Proof test
scripts/test-wornstack-mantle-a.js 13/13 on merged master (11/13 on old code —
exactly the two stack assertions fail); gunloss regression 42/42 green.
No player-visible behavior change, no [needs-eyes].
Evidence: evidence/2026-11-22/sim-wornstack-a.md. Finding #2698 marked [fixed].
Sibling collapse found while auditing and NOT fixed (out of the arm's file):
game.js equipItem seats a units-less worn entry and unequip() pushes units:1 —
filed as a new open finding; Omar's corpse thread (searcaster + worn cell, day 136,
seed 107369, never looted) still open.

## Wall (this run's judged corpora)

| | dawnchoke ctl → arm | homebody ctl → arm |
|---|---|---|
| Wins | 0 / 0 | 0 / 0 |
| National | 0 / 0 | 0 / 0 |
| Table | 0 / 0 | 0 / 0 |
| Wave 5 reached | 2 → 1 | 6 / 6 |
| Wave 4 reached | 8 / 8 | 16 / 16 |
| Median survival | 141 → 131 | 150.5 → 151 |
| Villages lost | 4 → 6 | 6 → 5 |

scale-onramp stays converging (NOT converged): both launch-funnel levers are now
parked on measurement grounds, not on mechanism failure — the forager-companion lift
moves departures but buys them with lives, and the homebody handoff converts every
convertible hold it sees but the funnel's launch count is dominated by walkers.
The wall is upstream of both arms: departures cost lives, and launch volume is not
the handoff's to move.

## Telemetry deviation check (coordinator, on merged master)

`telemetry-check.js` vs scale-wall baseline, metrics national,table,wins,exiled,
`--allow-recorder-corpus --sweep-rows`, on all four leg dirs (dawnchoke ctl/arm n=8,
homebody ctl/arm n=16): exactly the 3 LOUD regime lines on every dir
(national 12 → 0, table 16 → 0, wins 16 → 0), exiled quiet. EXPLAINED regime
artifact (pre-seat competent-policy substrate vs the WINSEAT-regime baseline;
the baseline's own `_regime` note predicts it). Baseline NOT rolled, no
investigation item. Same artifact as 0615Z/0815Z/0215Z/1115Z/1415Z/2115Z.

## Infrastructure

- Worktree registration took ~21 min for 3 trees (git reset --hard in D/R state
  under load ~6–8 with sibling sweeps running). Registration is the run's slowest
  step, not the sims.
- Registry-lock contention all run: heartbeats failed repeatedly (lock held >120s)
  — first by Loop B adoption's reaper (live, since 02:43Z), then by sibling
  journey-loop registrations (journey2-endgame, journey-landing). Lock never
  deleted (live holders). Last good heartbeat 02:41Z; trees were dirty, reaper-safe.
  The dawnchoke release was killed by the occurrence timeout (SIGTERM) and
  completed in closeout; the re-judge releases/removals are verified done here.
- Machine restart mid-run during the homebody armed leg (uptime 1 min); the
  detached arm process died with seed 107438 still simulating — 15 completed arm
  files verified intact, only 107438 re-run. No data lost. Write-flap blips hit
  the leg-log redirects (re-launched after probing the file into existence).
- Safe-commit index clobber struck on all worker commits + the wornstack commit
  (staged-as-deleted / MM) — repaired via the ls-tree -r pipe each time, commits
  verified correct (hash-object == HEAD blob). `git status` hung (60s+ timeouts)
  in the wornstack worktree — cleanliness verified via hash-object match instead.
- `check.js --quick` starved behind the homebody sims on the dawnchoke worker
  (load 19.4) and was stopped; the gate on the merged tip is recorded in the
  closeout section below (serialized, no other check.js running at launch).
- Master moved once under the run by this run's own merges only (a4603add1 →
  ff17699c7 → 895f7a6ee → 3fd09decc); both re-judge branches rebased clean onto
  the moving tip (no file overlap), proofs re-run green after every rebase.
  No sibling-lane master moves during this run's closeout.
- The occurrence timed out at its 3600s cap (~03:15Z) with the dawnchoke release
  in flight and homebody still running; this record + the homebody merge were
  completed in the resumed closeout. Do not re-run the arms from scratch.

## Gate (check.js --quick on merged master 3fd09decc)

Recovery gate run by fleshout-20261123T0515Z (log hidden_files/check-quick-0215.log; the 0215Z run's own gate attempt 04:10Z died mid-flight — partial 228-byte log superseded): 329 passed, 15 failed in 1293s, GATE-EXIT:1. 0 attributable to this run's arms: 5× 120s timeouts (living-garden, occupation-panels, one-person-army, trust-observer-neutrality, capable-bot — slow post-restart machine), 3× EPERM write/copy failures (deathcleanup-instrument, telemetry-check-recorder, sw-audio-cache — write flap), 2× pre-existing stale-proof pair (measurement-proof-update + workflow neutrality proof — tracker header documents the staleness), 1× phone-frame stale receipt (pre-existing), 4× unclassified but in no arm file (measurement-cache-flags 0/4, proof-text-identity, prepared-runner-custody 'unexpected end of file', foodpower ontology-validator leg) — all need a quiet-machine re-run to classify; none touches villager-build.js, the dawnchoke/homebody instruments, or any arm file. The wornstack proof test passes inside the gate (no FAIL line for it). docs/ONTOLOGY.md was intact at gate start (git status at 05:15Z showed only this file untracked) and was truncated to 0 bytes at 05:45:45Z, after the gate ended — same flap/sibling transient as the 2026-10-24 entries; left alone, never reset, per precedent.

[Adoption classification 2026-11-23 (fleshout-20261123T0215Z adoption, worktree sim-0215-adopt-a at tip 658d6c561): the 4 unclassified failures were re-run standalone, serialized, log hidden_files/rerun-0215.log (07:31–07:36Z) — all 12 re-runs passed, exit 0, so the gate adjudicates 0 attributable:
- 5× 120s timeouts (living-garden, occupation-panels, one-person-army, trust-observer-neutrality, capable-bot): all pass standalone — load flakes from the two concurrent gates 05:23–05:45 on a just-restarted box.
- 4× flap EPERM (proof-text-identity, telemetry-check-recorder, sw-audio-cache, deathcleanup-instrument): all pass standalone after the 05:34–07:27Z window (~113 min, cleared by machine replacement).
- prepared-runner-custody ('unexpected end of file' in gunzipSync): passes standalone (4 passed, 0 failed) — flap artifact.
- foodpower ontology leg: passes standalone (30 passed, 0 failed) with docs/ONTOLOGY.md restored byte-identical from HEAD (hash 6fdba43b, 2200 lines) by this adoption at 07:28Z. Timing note: this record dates the ONTOLOGY.md truncation to 05:45:45Z, after the gate ended, so the truncation itself may not be the proximate cause (the window's EPERM would equally have hit the validator's own writes); either way it does not reproduce on a quiet machine with intact files — flap artifact, not a game defect.
- Correction: the wornstack proof test does NOT run inside the gate (scripts/test-wornstack-mantle-a.js is not in scripts/green-list.txt, so check.js never enumerates it — the "passes inside the gate" line above is wrong). Re-ran standalone: WORNSTACK_PASSED 13/13, 0 fails — the fix stands on its own proof.
- Master moved after this record was written: r155 landed (78b6c54c4 + 658d6c561). The 3fd09decc → 658d6c561 diff adds only 4 files (3 evidence + panel driver scripts/journey-landing-r155-20261122.js, not a gate script), so the 329/15 result stands for the current tip as well.
- Telemetry: not re-run (per the 0515Z recovery's call). Verified the scale-wall.json baseline is unchanged since the coordinator's check (national 12, table 16, wins 16, _regime note intact — it predicts exactly this artifact); the 3 LOUD lines stand as explained, baseline NOT rolled.]

## Findings

- #2698 → [fixed] (wornstack, ff17699c7).
- anchorChecks vacuous check → [fixed] (dawnchoke re-judge analyzer).
- NEW open: scholar equip/unequip also collapse a worn stack (game.js).
- NEW open: det-gate bound fails on party-order permutations (order-insensitive
  comparison needed before any further dawnchoke re-judge).
- NEW open: departure beat names a companion by a physical description (sense-test).
- #2498/#2568 stay OPEN (homebody mechanism converts 2/2, effect unproven at scale).
- Death-cost finding carries the re-judge outcome (+10.75/run, 2.69/extra launch).

## Next blanks, in order

1. Pair departures with safety (gear/party composition on the way out) — the
   dawnchoke death cost (2.69 deaths per extra launch) is the binding wall now,
   not the companion gate.
2. Homebody handoff re-judge with the corrected metric (party-conversion bar +
   converted share of the convertible-hold pool; launch-count delta reported,
   never judged).
3. Order-insensitive det-gate bound (compare departures by day/vid/target/
   member-set) before any further dawnchoke re-judge.
4. game.js equipItem/unequip worn-stack collapse fix + Omar's corpse thread.
5. The 49-seed kill-loot searcaster arrival band (still unrun, deferred with
   rationale from 2115Z).

Claim deleted; lock deleted.

## Recovery closeout (fleshout-20261123T0515Z)

The 0215Z occurrence timed out at its 3600s cap (~03:15Z) and its resumed closeout merged the homebody arm but left this coordinator record uncommitted, the claim live, the lock in place, and the gate section unfilled. STALE-LOCK RECOVERY: lock fleshout-20261123T0215Z (created 02:15:45Z) was 3h old at 05:15Z with no registry tree carrying its run_id and no live coordinator process; recovered per the 90-min fallback. The lock file itself was flap-damaged during recovery (a `>` truncate succeeded, the write was refused EPERM, file left 0 bytes; a probe append then wrote 'probe2' into it) — restored from the known content after the flap cleared at the 05:23Z machine restart (probe refs/heads/probe-0515 + file probe both OK 05:23:15Z); recovery gate run 05:23:42Z. All three arm commits verified ancestors of master (ff17699c7, 30c490779, 895f7a6ee, 3fd09decc); arm evidence files committed on master; findings current (#2698 fixed, equip/unequip sibling filed). Telemetry check already run by the 0215Z run (3 LOUD regime lines, baseline NOT rolled) — not re-run. This recovery commits the record, retires the claim to .DEAD, deletes the lock, and appends the tracker entry. Correction to this record's closeout line above: the claim and lock were NOT deleted by the 0215Z run — this recovery did it.
