# Loop B round — 2026-11-17 2230Z (axis: winnability chain)

Coordinator: fleshout-loop-b-20261117T2230Z. Pre-flight clean (main tree
clean, disk 43%, no live Loop A lock/claim at start, reaper run).
Loop A went live mid-run (2315Z claim: selblock-a + homebodyvoice-a,
scale-onramp) — NOT touched. Master moved twice under the run
(journey-establishment r233 x4, batch ship bump 5168f824d).

Re-point queue status at run start (per tracker 2030Z review): arm-2
toggle CLOSED 2026-11-06; flee-repair build is next blank #1 (finding
#2500); partysize B2 re-judgement needs a band/lever producing >=3
size-4 fought meetings (not yet available); Pack Hunt recorder fix
(#2497) is the prerequisite before any future damage bar. No new
food-economy arm (parked). Selected-blocked is Loop A's blank #1 — not
duplicated.

## Arm 1 — sim-fleerepair2-b: NO-GO (B1 UNJUDGEABLE), lever HELD, NOT merged

Branch sim-fleerepair2-b, tip 1725b9336 (prereg adb03c4c2, fix +
instruments + proof 26075585f). Worktree clean, heartbeated, KEPT for
the re-judgement arm. Proof re-run by the coordinator on the branch
tip: 29/29 ALL PASS.

Diagnosis (verified, not assumed): #2500 is NOT the already-fixed
path. The prior flee-repair (Loop A c283f801c, pilot GO + confirm GO)
fixed the SCHOLAR's TB flee in the competent policy. #2500 is NPC
villagers in FIELD fights: a launched party stands on the monster's
tile, villagerMonsterTick rolls the encounter, fieldFight opens, the
village knows the Suburb trick, villagerTrickAction returns 'leave' on
round 1 — vFlee/fleeWise, rounds 1, mDealt 0, monster HP unmoved. A
plain strike cannot miss in the field model, so 0 damage in round 1
PROVES the round-1 action was the trick. The defect is upstream of
the fight: winPlanSeedFromFight seeds a kill-hunt plan onto ANY
wave>=3 monster on fled/evaded/avoided, with no killability check.
The Suburb is the ONLY leave-counter species (all 72 monsters.json
entries checked); the 'leave' itself is CORRECT counterplay per canon
and untouched.

Fix: one gate in winPlanSeedFromFight (src/js/win-plan.js), default-OFF
FLEEREPAIR2=1 — a seed call naming a leave-counter species returns
null and creates/retargets no plan. Existing plans untouched (stated
limitation). No default flip.

Panel (fresh band 104001–104008, 8 seeds/leg, 150d, competent,
substrate VETREENGAGE=1 PARTYSIZE4=1 both legs):

| Metric | Control | Armed |
| --- | --- | --- |
| Launches (all size 2) | 7 | 8 |
| Suburb seeds / gate blocked | 3 / 0 | 3 / 3 |
| Suburb-hunt launches / launched suburb meetings | 0 / 0 | 0 / 0 |
| Wave-4 kills (B2) | 6 | 7 — PASS |
| Deaths total / expedition (B3) | 738 / 239 | 743 / 239 — PASS (cap 811.8) |
| Instrument | — | CLEAN (8/8 files, 0 errors, missingHp 0, recMismatch 0/0) |
| Balanced panel (B5) | — | review_required; one regression_watch (village deaths/run 92.25→92.875) investigated — single diverging seed 104001, expedition deaths flat |

Verdict per the frozen prereg: NO-GO — B1 UNJUDGEABLE. The control
leg launched zero suburb hunts, so the prereg's frozen PANEL
calibration ("fresh-band ctl leg must show >=1 suburb-hunt launch;
if 0, B1 is UNJUDGEABLE (not a GO)") stops the analyzer's vacuous
judgeB1 pass (0 launched suburb meetings both legs) from reading as
a GO. This is NOT a fix failure: the gate fired on all 3 suburb-seed
events on the armed leg, the diagnosis band (103601–103608) reproduces
the defect (suburb launches 9, launched suburb meetings 3, round-1-zero
2, wise leaves 3, all on seed 103602), and the proof is 29/29.

The one diverging seed (104001): control seeds a suburb plan d118,
loses Boris d123 and the village d125; armed blocks it, Boris launches
d147 vs a Reunion, village survives to 150. The suburb plan never
launched on control, so this is downstream plan-state divergence,
NOT a rescue from a suburb launch — not claimed as one.

Sense-test: the leave line reads as a decision ("Miles reads the
sterile streets — you can't kill a suburb. They walk out. (Navigation
is victory.)"); the gate itself is silent, and no vetSays line ever
voices a suburb plan — same silence family as #2493/#2495.

Wall (panel, both legs): national standing 2, national rank 0,
table 0, wins 0, wave 4 8/8, wave 5 2/8; median survival 150 → 151d.
Wall (diagnosis band, ctl): national standing 2, table 0, wins 0,
wave 4 7/8, wave 5 2/8, median 151d.

Coordinator decision — HOLD, not merge, not revert. B1 is unjudged,
not failed: per kill discipline a thin/unjudged sample is not a kill
of the lever, and the partysize precedent (B2-unjudged → held for
re-judgement) governs. Landing the default-OFF gate now would move
the src/ digest and leave 2 retained-proof staleness failures until
proof regeneration, for a lever whose primary is still unmeasured.
The next arm re-judges B1 on the launch-rich diagnosis band
(103601–103608, which launches suburb hunts) with the flag on — no
rebuild needed. Do NOT flip the FLEEREPAIR2 default on this evidence.

check.js --quick on the branch (3rd attempt): 334 passed, 6 failed
in 597s. The 2 measurement failures are retained-proof staleness
(B.manifest() walks src/, so any src change moves the digest;
regeneration is a landing-time step). The other 4 are 120s load
timeouts (x2), stale phone evidence, and the ladder ambient-raid
control. None references win-plan.js or sets FLEEREPAIR2, so with
the flag unset the change is dead code in all of them. No master
impact — branch held, not merged.

Write flap struck twice during the panel (first attempt rc=1, empty
logs; control seed 104001's file lost as a 0-byte .tmp, driver still
exited rc=0). Recovered with a deterministic single-seed re-run;
panel numbers use the recovered file.

Attribution slip (noted, not rewritten — the branch is held):
the worker's prereg header names run fleshout-loop-b-20261117T1643Z;
this run is 2230Z. The findings entries it appended cited run 2030Z;
the coordinator corrected the SEEK entry's run id to 2230Z when
numbering (see below).

## Arm 2 — sim-packhunt-rec-b: GO, LANDED 77a37fe91

Pack Hunt recorder fix (finding #2497), proof 48/48. The HP recovery
(recoverMHpStart in scripts/fightallycap-driver-20261117.js) assumed
rec.mDealt was all the damage a monster took; a Beastmaster's Pack
Hunt harries for 2–4/round as a side effect on the lead body
(src/js/godpath.js fieldStrike), counted in no dealt total. Fix folds
the parsed pack-harry total into the recovery
(mHpStart = mHpLeft + mDealt + packHarryTotal(rec)), via a new
exported packHarryTotal(rec), returns mPackDealt on every path,
stores row.mPackDealt on encounter rows, and corrects the wrong
"mDealt is lead-only and exact" comment. Analyzer verdict logic
untouched; src/ diff 0.

Frozen-corpus re-check (band 103601–103608, 320 rows): all 6 mismatch
rows reconcile exactly (diffs 7–12 = harry totals; e.g. 103604 ctl d95
vs Congregation 923+9=932; 103606 arm d136 vs Editor 1122+10=1132).
The 7th harry row (103605 arm d101, vKill, pack 10) correctly keeps
HP null. Analyzer re-run: baseline byte-identical to the frozen
partysize-allycap-b-analysis.json; corrected re-run differs in only
20 JSON paths, all accounted for — recMismatch 1/5 → 0/0, the 6 rows'
mHpStart corrected, per-meeting shares ticking down (e.g. 0.4894 →
0.4765). Nothing else moves: B1 PASS, B2 UNJUDGEABLE, B3 PASS,
instrument CLEAN, launched mean shares identical, wall numbers
identical. The analyzer prints GO on both re-runs (unjudged-B2 by
design, untouched); the run's reported NO-GO stands unchanged.
No past verdict moves.

Landing: rebased onto master 72581074d clean (journey-establishment
r233, zero overlap), proof re-run by the coordinator on the rebased
tip: PASS 0 failures; merged ff-only as 77a37fe91; tree released
done-merged, branch deleted, main tree clean. Commits: prereg
68502215, fix + proof 114aae85b, evidence 140e3489c (rebased:
88a48cd36 / a9afeb8a1 / 77a37fe91).

Follow-ups filed by the arm: #2501 Bird Strike (same side-effect
hole, zero lines on the band — not folded in unproven), #2502
killfail effectiveMhp (same hole). The unmerged partysize driver in
the held tree carries the byte-identical old recovery — it needs this
same patch if ever revived (not touched). Safe-commit index clobber
struck all three worker commits — repaired via the ls-tree -r pipe
each time, commits verified correct.

## Findings filed this run

- #2501 (open) Bird Strike damage is a second uncounted channel like
  Pack Hunt (packhunt-rec-b).
- #2502 (open) killfail effectiveMhp has the same Pack Hunt hole
  (packhunt-rec-b).
- #2503 (open) the SEEK clause still walks parties into a Suburb —
  the FLEEREPAIR2 seed gate blocks only seeding/retargeting; the
  winPlanFightGate SEEK clause walks a standing-stage party into ANY
  wave-3+ beast once the trick is known (fleerepair2-b; numbered by
  the coordinator — the worker appended it unnumbered).
- #2504 (open) the cousin evade: launched parties that never engage —
  2 of 3 size-4 launched meetings never engaged, pre-fight awareness
  evades, rounds 0 (fleerepair2-b; numbered by the coordinator).
- #2292 noted again (arena party member flees before turn 1) — TB/arena
  path, not covered by the FLEEREPAIR2 seed gate; still open.

## Telemetry deviation check

REFUSED recorder-corpus input (same documented refusal as 1729Z /
2025Z / 2030Z): the fleerepair2 corpora are sweep recorder rows
(all 8 ctl rows carry top-level anchorCommit), so the tool refuses
them against a run baseline by design. Baseline NOT rolled. (First
attempt with a directory-part glob failed on the tool's basename-only
glob quirk; the corrected per-directory invocation produced the
refusal above.)

## Infrastructure

- Worktree registration took ~5.7 min on registry-lock contention
  (completed clean, no retry); release of the packhunt tree queued
  ~18s. No EPERM flap. No rebase stop-at-pick quirk (1 clean rebase,
  3/3 picks).
- Master moved twice under the run (journey-establishment r233 x4,
  batch ship bump 5168f824d, version files only).
- Loop A live on scale-onramp the whole second half (2315Z claim:
  selblock-a + homebodyvoice-a) — NOT touched.
- The packhunt worker appended its run note to ~/memory/2026-11-17.md
  (daily log, allowed).

## Metric review

- The fleerepair2 PANEL calibration gate did its job: it prevented a
  vacuous GO on a band where the phenomenon never occurs on either
  leg. The analyzer's judgeB1 passes at 0/0 — the calibration gate,
  not the analyzer, is the judge. That gate stays.
- B2/B3 passing while B1 is unjudged does not make a GO: the verdict
  rule is conjunctive (GO iff B1 && B2 && B3 && B4 && instrument &&
  B5). The next arm must judge B1 on the diagnosis band, not
  re-run the fresh band hoping for suburb launches.
- The packhunt fix's frozen-corpus re-check is the right shape for
  instrument work: byte-identical baseline re-run + a 20-path
  accounted diff. The 6-row reconciliation is exact, not approximate.

## Convergence state

Winnability chain stays converging (NOT converged): the Pack Hunt
recorder hole is closed and no past verdict moves, the flee-repair
seed gate is built, proven, and firing — but no launched party has
killed a wave-4 beast on any band, the table is unreached, wins are
0 everywhere, and the fourth seat's damage question is still
unjudged. Scale-onramp stays converging (untouched; Loop A live).
Food-economy stays converging (parked). Next blanks, in order:
(1) fleerepair2 B1 re-judgement on the diagnosis band 103601–103608
(FLEEREPAIR2=1 armed leg vs ctl — the band launches suburb hunts);
(2) partysize B2 re-judgement on a band/lever producing >=3 size-4
fought meetings; (3) SEEK-clause fix (#2503) — the seed gate's
uncovered sibling; (4) selected-blocked classification is Loop A's
blank #1 — do NOT duplicate. Claim deleted; lock deleted.
Evidence: this file. Arm 2 merged locally, pending ship:
packhunt-rec-b (77a37fe91). Arm 1 HELD on branch sim-fleerepair2-b
(tip 1725b9336).
