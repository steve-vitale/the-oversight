# Loop B run fleshout-loop-b-20261105T0830Z — coordinator evidence (winnability chain)

Axis: winnability chain (wild ally-join → wave-4 kills → veterans → readiness-5 release → wave-5 facing → full seat).
Arms: sim-finishhold-b (BUILD probe, NO-GO, lever reverted) + sim-standaccum3-b (DIAG, DIAG-GO).
Merged locally, pending ship. No push, no bump, no live verification (ship loop owns deploys).

## Run start — stale-lock recovery of the 0618Z run

Lock fleshout-loop-b-20261105T0618Z was 2h11m old at run start (created
06:18Z, checked 08:29Z). Recovery followed the LOCK-READ-BEFORE-DELETE
rule: the lock was `cat`-read first (run_id confirmed as the run being
closed out), the registry trees list was parsed per slug, and both
workers were checked in the subagent listing before anything was
deleted. Findings: postblood worker done and its arm already merged to
master by the 0618Z coordinator (fa1bf8490, ancestor of master);
finishhold worker done with "STOPPED BY TIMEOUT, NOT COMPLETE"
(completed 08:18:58Z, last worktree writes 08:16–08:17Z, heartbeat
07:54:59Z, 34min stale). No live worker, no live coordinator process.
Claim retired to `.DEAD` with a note; lock deleted per the >90min
fallback; this run's lock + claim created (0830Z). Loop A live on
food-economy (0815Z pantrymealword + bankadded) throughout — NOT
touched; its lock/claim/trees were never read for deletion, only
observed. Loop A closed out during this run (its lock and claim are
gone by closeout; bankadded evidence landed as 11d6789c1).
Flee-repair held by Loop A (sim-fleerepair-a) — NOT touched.
Arm-2 toggle NOT claimed (overlaps finishhold's fieldFights.js; per
arm-independence it needs its own run).

## Arm 1 — sim-finishhold-b: NO-GO, lever reverted (adoption of the timed-out 0618Z arm)

Worker commits (rebased twice onto current master, proof 26/26 green
after each rebase and on merged master, merged ff-only): prereg
db26d669d, instrument fix 693fff5fc, lever 5508069e4, evidence+revert
be81a1517. Arm evidence: evidence/2026-11-05/sim-finishhold-b.md (+
prereg sim-finishhold-b-prereg.md). Corpus:
evidence/2026-11-05/perseed-finishhold-b/ (16 files, 0 instrument
errors, 0 unmatched kills). Proof: scripts/test-finishhold-20261105.js
26/26 PASS on merged master.

What the 0618Z worker left: prereg + instrument committed, baseline
sweep complete (8/8 files, seeds 99161–99168), FOCUSFIRE lever
implemented but uncommitted in src/js/fieldFights.js. This run's
worker verified the lever line-by-line against prereg spec (c),
added the gate fixtures (35/35 with the lever in), ran the armed
sweep on identical seeds, judged, reverted, and wrote the evidence.
Anomaly, disclosed in the worker report: the main session committed
the lever (1b3f04280), ran the armed pilot, judged NO-GO, reverted,
and committed evidence + corpora (f582e880b) in parallel in the same
worktree while the adoption worker was mid-flight — the worker
verified rather than re-ran (all verdict numbers independently
re-confirmed from the corpus with the analyzer plus raw counts).
One mid-run proof run showed 3 gate-fixture failures because the
main session reverted fieldFights.js under the running proof process;
the main session's own 35/35 (lever in) stands as the record and the
final 26/26 (lever out) is green. The parallel-write hazard is real
and is recorded here, not hidden: two agents must not share one
worktree.

Verdict (judged strictly against the prereg): NO-GO. Focus fire
(mustered ally joins wild wave-3+ fights from round 1) failed the
kill bar AND tripped the survival guardrail.

| | Baseline | Armed | Bar |
|---|---|---|---|
| Wave-4 kill rate (matched kills / wild wave-4 fights) | 11/132 = 8.3% | 3/86 = 3.5% | armed >= 15% AND >= 3 kills — failed on rate (count of 3 met) |
| Median survival | 121d | 73d | not worse by > 10d — FAILED (−48d) |
| Field-fight party deaths (vDie) | 22 | 6 | not up by > 25% — passed |
| Field damage fraction (median) | 2.1% | 9.9% | secondary — lever worked mechanically, 0 kills in 37 focus-fire fights |
| Wall: wins / national / table | 0 / 0 / 0 | 0 / 0 / 0 | — |
| Wall: wave-4 unlocks / faced | 8/8 / 7/8 | 7/8 / 7/8 | — |
| Wall: wave-5 unlocks / faced | 0 / 0 | 0 / 0 | — |

Mechanism of failure (evidence file): the party-HP pool enters the
round-2 hopeless math from the start, so parties hold losing fights
they would have fled — joined-fight leader deaths 5 armed vs 0
baseline; focus fire converts flees into deaths without converting
any fight into a kill. The lever is reverted; `src/js/fieldFights.js`
is byte-identical to its pre-lever state (branch-vs-master diff shows
zero src/js change; the lever commit is kept in history so the killed
verdict is auditable). Do NOT re-run focus fire. Next blank:
damage-per-round or survivability-per-round, NOT the flee decision.

## Arm 2 — sim-standaccum3-b: DIAG-GO, flat-20 mechanism identified and reproduced

Worker commits (rebased once onto current master 52471f9ca, proof
23/23 green after the rebase and on merged master, merged ff-only):
prereg 3e2311767, instrument 1c0930d1a, evidence 7ff459001. Arm
evidence: evidence/2026-11-05/sim-standaccum3-b.md (+ prereg
sim-standaccum3-b-prereg.md). Corpus:
evidence/2026-11-05/perseed-standaccum3-b/ (9 files, 0 instrument
errors). Proof: scripts/test-standaccum3-20261105.js 23/23 PASS on
merged master. Zero src/js changes anywhere in this arm.

Verdict (judged strictly against the prereg): DIAG-GO. The anchor
reproduces exactly (99145 re-run: 68d, village-lost, 75 fights,
raw/gated 20) AND 1 of 8 fresh-band seeds (99196) is FLAT-20 with
the same decomposed shape. The other 7 fresh seeds track activity
(standing 75–245), so this is not a band-wide artifact.

The named mechanism (code citations in the arm evidence):
- WAR IS KILLS-ONLY, WAVE-3+-ONLY. `villageStanding()`
  (src/js/standing.js) sums `waveLedgerPoints(3,4,5) x 25`;
  `scoreLedgerKill()` (src/js/waveLedger.js) scores only via
  `recordWaveKill` — fights, flees, evasions score nothing — 1
  pt/kill (2 for a counter-kill), per-type cap 2. 99145: 18 wave-3
  fights, 0 kills → war 0. 99196: 12 wave-3 fights, 0 kills → war 0.
- DIPLOMACY IS STRUCTURALLY ABSENT UNDER COMPETENT PLAY.
  `hierarchyState()` is empty on all 9 seeds (0 links total), so the
  +34/seasoned-regional+-link source never fires — not "unseasoned,"
  never formed.
- PLENTY IS THE ONLY MOVING SOURCE ON A FLAT VILLAGE. +20 per major
  feast. 99145 hosted exactly one (quality 1, day 38) → raw exactly
  20 for its last 31 days; 99196 hosted none → raw 0 for its whole
  41-day run.
- NO GATE EXPLAINS IT. gated == raw on both flat seeds (defer4 needs
  raw >= 100) — the flatness is in the inputs, not the gate. No
  decay exists in the code.

Plain words: a village can fight 75 fights and sit at standing 20 —
or zero — because standing is earned by kills, bonds, and feasts,
and this village earned almost none of the three. Band-wide wave-3
kill rate 19% (29/149 fights); the two flat seeds are the only ones
with zero wave-3 kills.

Wall numbers (fresh band 99191–99198): wins 0/8, national 0/8, table
0/8, wave-4 unlocks 5/8, faced 5/8, kills 5, wave-5 unlocks/faced/
kills 0/8, readiness-5-ready days 0/8, median survival 102d.
Premise (separate line, standaccum2 lesson): 0/8 seeds ever hold two
living wave-4 killers — 99195/99198 each banked 2 sequentially,
maxLiving 1.

Disclosures (both in the arm evidence): (1) the analyzer as first
written computed DIAG-NO because `anchorReproduces` wrongly required
`anchor.flat20`; corrected to the prereg's letter (anchor reproduction
= decomposition, not clause C) → DIAG-GO. Judged numbers identical
under both computations; proof extended with fixture 13 for the exact
anchor-step shape. Clause C's 50-day window is itself flawed — it
catches the anchor's single feast step (band 20), so the anchor fails
its own flatness rule; a 30-day window is proposed for the next run,
with no re-scoring here. (2) Sense-test flag: hold beats' day-stamps
advance (99192: `{"4":61}`) but no spoken hold line reaches any
captured transcript on any seed, though other SYSTEM lines are
captured — cause not established, recorded as an open probe item, not
a verdict input. Appended to the findings backlog by this run.

## Scale-wall numbers (this run, both arms' judged corpora)

Wins 0/16, national 0/16, table 0/16 across both arms' fresh bands.
Wave-4 unlocks 12/16 (finishhold 7/8 armed + standaccum3 5/8),
wave-4 faced 12/16, wave-5 unlocks 0/16, wave-5 faced 0/16, wave-5
kills 0. Median survival 73d (finishhold armed) / 102d (standaccum3
fresh band). The wall has not moved: the full seat stays unwon, no
wave-5 kill anywhere. What moved is the diagnosis: focus fire is
killed as a lever (it trades flees for deaths), and the flat-20
standing shape is now a solved mechanism (kills/bonds/feasts inputs,
not a gate) — the standing question is answered for villages that
never kill wave 3; the open part is what makes villages kill wave 3
at all, which is the finishing gap again.

## Telemetry deviation check (loop-body step 10)

Attempted by the coordinator on the finishhold corpus:
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json --current 'evidence/2026-11-05/perseed-finishhold-b/*.json' --metrics national,table,wins,exiled` REFUSES recorder corpora by design (exit 2, "all 16 --current rows carry top-level anchorCommit"). Both workers hit the same refusal on their corpora. No LOUD line exists to investigate; wall numbers are reported directly above instead of via a forced flag. Baseline NOT rolled.

## Infrastructure

- No EPERM flap this run. Worktree registration of standaccum3-b was
  slow (~2 min, registry lock contention with sibling loops) but
  landed; both heartbeats confirmed by readback.
- Safe-commit index clobber hit the standaccum3 worker's commits (all
  three, repaired via HEAD-blob cacheinfo each time) and the
  finishhold worktree after the main session's parallel commit
  (repaired the same way); commits always verified correct.
- Reaper at run start: 13/16 active, finishhold correctly spared as
  dirty; sim-awayrationfix-b removal failed (locked working tree,
  "initializing") — stale lock from an older Loop B run, left alone.
- Master moved 3 times under the run (journey r136, finishhold merge,
  journey r104); standaccum3 rebased once clean, proof re-run green.
- Main tree clean at closeout; both branches deleted; both trees
  released done-merged.

## Findings backlog

- FLAT-20 item (encounterprod-b, 0330Z) marked FIXED by this run
  (mechanism identified + reproduced, see arm 2).
- Appended: hold-beat spoken lines never reach transcripts
  (standaccum3 sense-test probe item).
- Carried, not chased: Strike SHUTDOWN-beat verbatim repetition
  (already open, secondkiller-b); veteran-word collision (already
  open, fifth reproduction in standaccum3-b).

## Next blanks, in order

(1) Damage-per-round or survivability-per-round in wild wave-4
fights — the finishhold metric review's named next lever family
(focus fire proved the flee decision is not the binding lever).
(2) The arm-2 damage+staying toggle (tracker blank #4, pinned-base
re-run) — now the top unclaimed lever in the re-point queue, on its
own run (it overlaps fieldFights.js with the killed focus-fire work
only in history, not in live code — the file is back to pre-lever
state).
(3) Killer simultaneity / first-killer survival after banking
(median 11d on standaccum2, 9d on postblood) — the precondition for
any release test; postblood's 99179 showed the pair CAN release, so
the question is keeping the first killer alive until the second is
blooded.
(4) Carried: veteran-word collision naming; wave5faced label rename;
hold-beat spoken-line probe (new).
No gate/price/deed arm follows. scale-onramp stays converging (NOT
converged): full seat still unwon, wave-5 kills still 0, readiness-5
release still 0 ready days outside postblood's single 99179 instance.

Merged locally, pending ship. Claim deleted; lock deleted at closeout.
