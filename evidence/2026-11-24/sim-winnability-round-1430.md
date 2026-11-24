# Loop B winnability round 1430Z — adoption closeout (run fleshout-loop-b-20261124T1630Z)

Axis: winnability-chain. The 1430Z coordinator ran all three arms to
completion on their branches but timed out at the 7200s execution limit
before closeout (no round record, no telemetry check; claim and B lock
left live, with an adoption-state note in the claim). This run is the
adoption: stale-lock recovery on the B lock (cat + delete in the same
call; both 1430Z workers confirmed done via subagent listing, no live
coordinator/worker processes, heartbeats 15:02/15:27 stale), then
finish + land. Loop A live on scale-onramp all run (1515Z claim, then
the 1715Z round record fb5dd00a0) — NOT touched. Master moved twice
under the adoption (Loop A fightcap-recheck + bowopen-recheck +
round record); both adopted arms rebased cleanly onto the moving tip.

## Arm 1 — sim-w5lateface-b (DIAG-GO, merged 9810670a0 by the 1430Z coordinator)

Late unlocks face 1/2: 109311 (door d117) FACED — first contact d126,
0 kills in 7 contacts, ends with 2 living; 109314 NO-SPAWN — 0 wave-5
contacts in 12d on a spent village. Late frozen as door day > 100.
Verified on master at adoption start (merge-base ancestor check).
No further work this run.

## Arm 2 — sim-ragecarry-b (pilot GO, confirm NO-GO powered; evidence-only landed 8eb83b40c, lever HELD on branch sim-ragecarry-b @ c3a27103e)

The #2544-prescribed stacked damage-multiplier carrier in launched
parties (FIELDCAPDMG + RAGEFREE + FREESTRIKE, env-gated, SENSEEXPED
substrate, competent verbatim, 150d death-aware).

Pilot (fresh band 107801–107808, 8 seeds): GO on the frozen bars —
kill share arm 1/2 (0.50) vs ctl 0/10 (bar ≥ 0.25); damage/round arm
123.4 vs ctl 31.4 (bar ≥ 70); mechanism Rage-family fire 2/2;
cost bars pass with ZERO margin on community loss (0.500 vs 0.500
ceiling); §15 panel review_required (village deaths +4.9/run,
community loss +0.125, regression_watch). The GO rested on ONE kill
(Diana vs The Algorithm, seed 107804 day 115, 1116 damage in 8
rounds). Proof 63/63. The coordinator held the landing and ordered a
12-seed confirm before any game-code merge.

Confirm (fresh band 107901–107912, 12 seeds, same frozen bars):
NO-GO, powered not thin-pool. Kill share arm 0.000 (0/12) vs ctl
0.077 (1/13), bar ≥ 0.25; damage/round arm 51.3 vs ctl 47.8, bar
≥ 70; arm pool n = 12, ctl pool floor met (13 ≥ 10). Mechanism
Rage-family fire on 10/12 arm meetings (0.83) — 10 carrier fires,
7 in the judged population, 0/7 kills on the carrier-fire cut. The
carrier stages, fires, and does not turn launched parties into
winners: a capability NO-GO, not a staging null. Cost bars pass
(community loss 7/12 both, full 0.125 margin; starvation 4 vs 3
total, 2 vs 2 villager-only; median 148d vs 130.5d). Panel
review_required, no regression_watch (village deaths −3.6/run,
no_material_signal). The control leg's single kill (Valeria vs
Algorithm, 1245 dmg, strikes of 144–150/round, no Rage at all)
shows base damage, not the multiplier, is what kills wave-4
monsters. Proof 63/63 on the rebased tip.

Landing: evidence-only, per the held-lever precedent
(fieldcarrier/freestrike): prereg + pilot/confirm evidence, analyses,
panels, and all four perseed corpora landed as 8eb83b40c (53 files,
zero src/js, zero scripts/). The implementation (godpath.js +
fieldFights.js carrier stack + proof test + driver/analyzer) stays
HELD on branch sim-ragecarry-b (c3a27103e), worktree removed. Per the
prereg, the carrier family is exhausted as a kill-share lever on
this evidence; the next arm is the base-damage question
carriersetup-b named (what lifts ~38/round toward ~111), not
another carrier variant. Watch items (in confirm evidence §10, not
verdict-changers): arm pair vDie 4/12 vs ctl 1/13; parties launch
members at ~14 HP with unloaded weapons; the gate still never
avoids (0/24 losses). Metric review: the pilot's proposed arm-pool
floor (n≥5 for GO) is moot on the powered confirm; recorded for
the next run.

## Arm 3 — sim-tbrefuse-b (DIAG-GO, merged 095bd33c3)

What happens to a refused TB start (bloodcluster finding line 2746).
Judged band RUN tbrefuse-b-v2, 16 seeds 109310–109325, 150d,
competent verbatim: 91 non-building `startCombat` calls — 76
titan-refusal (all `herald`, 6 distinct heralds; "muster 10 allied
blades (you have 0)"), 15 instant-resolve (14 fled-in-opening, 1
killed-in-opening), 0 guard-refusal, 0 noop-unexplained, 0
caller-unknown, 0 instrument errors, 0 unlinked kills. The pilot's
premise correction stands at full power: the guard never fires.
Callers: monsterTurn 81, feast-draw 5, contest-arena 4,
other-driveContestsImpl 1. Visibility: 43 rows carried lines, 48
silent (same-day titan repeats after the once-per-day line; 0
dedup violations across 28 titan/day groups). Bloodcluster base
rebuilt-false 91 = instrument 91, mismatch 0. Kill accounting
(never collapsed): 3 distinct heralds delayed — killed later in
the field, never in TB (109317 d130, 109318 d144, 109321 d91, the
last costing villager visjoin_85's life on d88); 3 distinct heralds
not-killed-in-window, still waiting at day 150 (48 rows); 1 instant
kill died in the opening round (suburb, 109311 d100, killed by
mara_vasquez via companion); 14 instant fled. 0 re-engaged-tb.
Pilot glasswing ambiguity settled: instant-resolve,
fled-in-opening. Determinism: seed 109312 replay identical. Zero
src/js changes, ever. Proof 12/12 on merged master. Finding line
2746 marked [answered] in sim-findings.md. Next blank (named in
evidence): the titan muster — can any village ever assemble the 10
allied blades the herald gate demands? 3 of 6 heralds were never
faced at all. Also noted (DIAG only, no fix): the feast-draw path
reports `{ok: true}` and consumes the draw even when the start
no-ops.

## Wall (this round's judged corpora)

- tbrefuse band (16 seeds): wins 0/16, national 0/16, table 0/16;
  wave-5 unlocked 6/16, faced 5/16, 7 wave-5 kills; wave-4 kills 44
  (log entries); median survival 150d; survived 11/16; 29 villagers
  hold a wave kill (19 dead / 10 alive at end).
- ragecarry confirm (12 seeds/leg): national 0/12, wins 0/12, wave-5
  4/12 ctl vs 2/12 arm; standing-199 stall on both legs.
- ragecarry pilot (8 seeds/leg): national 0/8, wins 0/8, table null;
  wave-4 7/8 ctl / 8/8 arm; wave-5 3/8 ctl / 2/8 arm; median 150d
  ctl / 139d arm.
- w5lateface (2 late unlocks): faced 1/2.
The scale wall stands on every judged band: villages reach wave 5,
survive, and never reach national or win.

## Telemetry deviation check

- tbrefuse corpus: checker refuses recorder-corpus input (all 25
  rows carry anchorCommit) — same documented outcome as recent
  runs; no LOUD lines; baseline NOT rolled.
- ragecarry confirm corpora (with --allow-recorder-corpus): 3 LOUD
  lines per leg (national 12→0, table 16→0, wins 16→0) — all
  REGIME artifacts (WINSEAT baseline vs pre-seat competent
  substrate); baseline NOT rolled, no investigation item. The §15
  panel is the correct instrument here, as in the pilot.

## Infrastructure

- Stale-lock recovery at run start (1430Z lock, heartbeats stale,
  workers done); adoption-state note in the 1430Z claim.
- docs/ONTOLOGY.md 0-byte flap debris in the ragecarry tree,
  restored from HEAD by the coordinator before adoption (worker
  never touched it; 2200 lines, verified absent from status after).
- Write flap: cleared 16:31Z per the tbrefuse worker's probe; did
  NOT recur during this adoption (not claimed solved). Registry
  lock jammed most of the run (heartbeats failed twice on
  >120s lock waits; both landed 16:43Z on retry with readback).
- Safe-commit index clobber struck 3× (ragecarry pilot worker), 3×
  (tbrefuse worker), 2× (ragecarry confirm worker) — every commit
  correct, repaired via `git ls-tree HEAD -r | git update-index
  --add --index-info`, verified with completed status + empty diff.
- Rebase stop-at-pick quirk struck once (ragecarry implementation
  pick); recovered with `git rebase --continue` per AGENTS.md.
- VM/service restart ~17:33Z (uptime 23 min at 17:56Z) killed one
  of the confirm worker's unscoped greps; no work lost (scoped
  freshness checks cover the skill's required scope). Earlier VM
  restart ~15:26Z noted in the 1430Z claim.
- First ff-only merge of the ragecarry record branch refused
  (master moved under it — Loop A round record fb5dd00a0); rebased
  cleanly, merged second attempt.
- No full-repo gate run this closeout: both landed arms are
  evidence-only / zero-src, proofs green on merged master (tbrefuse
  12/12) and on the rebased tip (ragecarry 63/63, pre-merge of the
  evidence-only commit, which touches no code).

## What merged (all ff-only, each in its own exec call, exit codes verified)

- 9810670a0 sim-w5lateface-b (DIAG-GO; merged by the 1430Z
  coordinator before timeout, verified ancestor at adoption)
- 095bd33c3 sim-tbrefuse-b (DIAG-GO; 4 commits, zero src/js)
- 8eb83b40c sim-ragecarry-b evidence-only (NO-GO; 53 files, zero
  src/js, zero scripts/ — lever HELD on branch sim-ragecarry-b @
  c3a27103e, worktree removed)

Merged locally, pending ship. No push, no version bump, no live
verification. Claim files (1430Z + 1630Z) and B lock deleted at
closeout.

winnability-chain stays converging (NOT converged): the carrier —
the best-measured kill-share lever on the winnability chain — is
now exhausted on powered evidence, and the TB-refusal question is
answered (the guard never fires; the herald gate is the thing
refusing). But villages still reach wave 5, survive, and never
reach national or win. Next blanks, in order: (1) the base-damage
question — what lifts a launched party from ~38–51/round toward
~111 (carriersetup-b's named next arm; NOT another carrier
variant); (2) the titan muster — can any village assemble 10
allied blades (tbrefuse §next blank); (3) the wave-4 fight itself
(#2538 — Loop A's fightcap-recheck just re-measured it DIAG-NO-GO
thin-pool on current master; its confirm is Loop A's blank).
scale-onramp stays converging (untouched; sibling loop A).
