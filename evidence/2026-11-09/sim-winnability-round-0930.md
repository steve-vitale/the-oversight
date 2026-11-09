# Loop B 0930Z round evidence — winseek sit drive adopted, held at the landing gate, re-baselined, LANDED

**Run:** fleshout-loop-b-20261109T0930Z · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Base master at closeout:** b5d1eb923 (merged tip) · **Claim:** hidden_files/lever-claims/fleshout-loop-b-20261109T0930Z.json (deleted at closeout) · **Lock:** fleshout-loop-b.lock (deleted at closeout)

## Stale-lock recovery at run start

The 0630Z Loop B run was dead: lock 3h old, tree `sim-sitdrive-winseek-b` heartbeat 68 min stale, no processes, last tree write 08:30:18Z. Lock deleted, its claim retired to `.DEAD` with a note. Its arms pricedseat-b and fightblend-53007-b had already landed on master (9d6ebf59c, 4996fb0d1) — untouched. Only sim-sitdrive-winseek-b was stranded, mid-confirm. Loop A live on food-economy (0715Z adoption, `sim-medheadcount-a` heartbeat fresh) — NOT touched; Loop A later landed medheadcount-a as 8cee6a8d2 during this run (DIAG-GO evidence, lever held on gate attribution) — NOT touched.

## Arm 1 — sim-sitdrive-winseek-b adoption (worker 1)

Adopted the stranded arm in its existing tree (3 prereg commits intact; uncommitted sweep-compare.js +7, policy/analyzer/driver/test, pilot corpora 8+8+2, three panel dirs, invalid compare). The worker verified the branch commits and corpora (no sweep re-run), re-ran the proof, repaired the panel compare per Correction 2 (before panel = winseek-sitdrive-b gate-off, identical policy ids, SITDRIVE_B declared as intervention flag), and committed 59184bc2c (29 files).

**PILOT GO — all 6 prereg bars pass** (frozen band 53001–53008, 150d, before vs after on identical seeds, one master 514e4fa6e): armed sits 2/2 reachable — 53003 lesser d90, 53006 lesser d92, exactly the before leg's offered-not-taken seeds; offered-not-taken 0/8; starvation 6 vs 7 control (sat seeds 5 vs 6); true median 75d vs 75d, ratio 1.00; G1 det-gate (proof 72/72), G2 recorder neutrality, G3 corpus integrity 8/8 both legs, gate-off neutrality byte-identical to plain winseek on 53003. Both sat seeds went on to WIN via the pre-existing `tableRoad` first-option Feared play (see Findings — Steve-call).

**CONFIRM GO — all 3 prereg bars pass** (fresh band 54209–54224, 16 seeds, balanced panel): panel `table` (sittings, ruling 665) 0/16 → 3/16 (54212, 54217, 54218 — exactly the 3 seeds alive at day 90 on the before leg, all 3 won); village deaths 70.1 → 67.9/run, player deaths 10.5 → 9.3, survival30 5/16 both, survival60 1/16 both; validity: identical sourceDigest across all three panels, sources stable, neutrality proofs match, 0 warnings, compare errors []. Repaired compare decision `review_required` (win-rate `change_watch` = the intended effect; the one `regression_watch`, village deaths per 100 days, is denominator shrinkage from runs ending at day 90 on a win — investigated, not smoothed over).

**Wall (judged legs, master 514e4fa6e):** pilot — national 0/8, sits 2/8, wins 2/8, wave-4 unlocks 6/8, wave-5 0/8, median 75d. Confirm — national 0/16, sits 0→3/16, wins 0→3/16, wave-4 16/16, wave-5 0/16, median 69.5d (last-sample-day proxy) both legs.

Evidence: evidence/2026-11-09/sim-sitdrive-winseek-b.md (in the landed branch). Backlog #1968 (WINSEEK HAS NO SIT DRIVE) marked fixed by this arm.

## The landing gate held — proof 67/72 on the rebase

The coordinator rebased the branch onto fresh master 60eb9a5bb (zero file overlap) and re-ran the proof: **67 passed, 5 failed**. All 5 failures are REAL-sim legs on seed 53003: armed 53003 no longer sits (seatTaken=0, classifies never-offered) and gate-off 53003 classifies never-offered instead of offered-not-taken. Gate-off == plain winseek byte-identical still PASSES; all corpus/fixture legs pass. The drive is not broken — the demonstration seed's trajectory moved with master (journey src changes between 514e4fa6e and 60eb9a5bb) and 53003 never reaches a ready seat on the new master. Per the loop's own rules the arm was NOT merged over a red proof: HOLD, not a kill. This is the frozen-band-roots-move class (backlog: FROZEN-BAND ROOTS MUST BE RE-VERIFIED ON CURRENT MASTER) — the third distinct reachable set in three masters for this band.

## Arm 2 — sim-sitdrive-rebaseline-b (worker 2, same branch)

Re-baseline on current master 8cee6a8d2 (Loop A's medheadcount-a landing; zero src/js, zero overlap; branch re-rebased clean onto it). Addendum prereg committed BEFORE any judged computation (b2cc33eda): same 6+3 bars, reachable set re-derived from the new before leg, confirm re-run on the SAME band 54209–54224 (re-use is the control — the question is whether the verdict survives the master move), proof REAL legs re-pointed at the new demonstration seed.

**PILOT GO — all 6 bars pass** (master 8cee6a8d2): reachable set re-derived to **{53005}** (53003 dies d30, never-offered). Armed 53005 sat lesser d90 and won; offered-not-taken 0/8; starvation 6 vs 6 (sat seed 0 vs 0); true median 76.5d both legs, ratio 1.00; G2/G3 pass; gate-off == plain winseek byte-identical on 53005.

**CONFIRM GO — all 3 bars pass** (same band 54209–54224): panel table **0/16 → 2/16** (54209 d92, 54223 d91 — exactly the 2 seeds that lived to day 90 on the before leg, both won); village deaths/run 70.1 → 68.5, player deaths 10.5 → 9.9; compare `review_required`, errors [], same sourceDigest both panels, neutrality match 0 warnings. Both `regression_watch` rows investigated per seed as early-ending artifacts of winning.

**Proof: 72/72 green** on the new base, re-pointed 53003 → 53005, no assertion weakened, RED-phase legs kept. Coordinator re-ran it on the branch tip (72/72, exit 0) and again on merged master (72/72, exit 0).

**Wall (re-baseline legs, master 8cee6a8d2):** pilot — national 0/8, table 1/8, wins 1/8, wave-4 6/8, wave-5 0/8, median 76.5d. Confirm — national 0/16, table 0→2/16, wins 0→2/16, wave-4 15/16, wave-5 0/16, median 67d. Day-90-floor survival is thinner than on 514e4fa6e (1/8 pilot, 2/16 confirm) — still the binding half.

Evidence: evidence/2026-11-09/sim-sitdrive-rebaseline-b.md + sim-sitdrive-rebaseline-b-prereg.md (in the landed branch). No policy or src/js change in the re-baseline — the drive needed no fix, only the demonstration seed moved.

## Landing

Merged --ff-only into master after re-verifying master was still 8cee6a8d2 immediately before merging. Tip b5d1eb923 (7 commits: 3 prereg + work + 3 re-baseline). Worktree released done-merged, branch deleted, main tree clean. **Merged locally, pending ship.** No push, no version bump by this run.

## Telemetry deviation check

`telemetry-check.js` refuses recorder-corpus input by design (all rows carry top-level anchorCommit — sweep recorder rows, not runs), and the scale-wall baseline's own regime note forbids comparing pre-seat substrates against it. No deviation signal exists for these corpora; the §15 panel compare is the instrument covering national/table/wins. Baseline NOT rolled. (Same refusal as the 0330Z round.)

## Village assessment (plain words)

Short, hard lives, same shape on both masters: the median village lasts ~70–76 days, the table knocks on nearly every door by day 35–55, and most villages are already gone before the day-90 floor — 15/16 fresh-band villages were invited and died before it on the old master, 14/16 on the new one. The sit drive does exactly one thing: it answers an invitation that is already there, on the first day it can be answered. Every village that lived to the floor sat, and every sitting became a win through first-option door play — the win is real but unearned-by-choice, and the survival half is the work that remains. The reachable seed moves with every master (three different sets in three masters), so the next master will move it again; that is a re-baseline, not a failure.

## Findings for the backlog

Filed by the workers (see sim-findings.md): day-90-floor survival still the binding half, thinner on the new master (1/8, 2/16); a sit becomes a win through first-option door play (Steve-call, recurs on the new master — every sat seed won 2/2, 3/3, 1/1, 2/2 across the four judged legs); System deepening line repeats back-to-back on 53005 d11. Backlog #1968 marked fixed.

## Infrastructure

- Safe-commit index clobber struck on the adoption commit and on all three re-baseline commits — repaired per the documented pipe (`git ls-tree -r HEAD` + `update-index --add --index-info`), commits verified correct (hashes match worktree files), status empty + diff empty after each repair.
- One safe-commit exec session was lost mid-run with no commit made; retried cleanly. No EPERM flap this run.
- Master moved twice under the run (60eb9a5bb journey r121, then 8cee6a8d2 medheadcount-a landing); both branches rebased onto explicit SHAs, zero file overlap, proofs re-run green after every rebase that mattered (the one red proof was the 53003 seed move, judged and re-baselined, not forced).
- Orphaned locked tree `sim-ctraj-b` (Nov 3, no registry entry, worktree files deleted) still present — left untouched, not this run's to remove; flag for the main session.
- Loop A active at closeout with three new trees (sim-medheadcount-suite-a, sim-wideduty-a, sim-sametick-a) — not touched.

## Metric review

The honest bar (sits all reachable seeds, not 5/8) held across both legs and both masters: the reachable set is re-derived from each master's own before leg, never assumed. The pilot's primary metric is judged on recorder corpora; the confirm's on the §15 panel. The panel contract carries no `gameDays`/starvation series, so the confirm cost bars are judged on the death/survival series the panel does carry plus the recorder corpora — stated in both evidence files, not smoothed. The `review_required` compare decisions are the intended win effect plus investigated denominator artifacts, not re-score licenses.

## Convergence state

scale-onramp stays converging (NOT converged): winseek now sits every village that reaches the floor alive, on two masters, and sittings convert to wins — but national is 0/16, wave-5 is 0/16, the full seat is still 0 everywhere, and only 1/8–3/16 villages even reach the day-90 floor. Next blanks, in order: (1) survival to the day-90 floor (the binding half — the drive cannot touch deaths before the floor); (2) the sit-becomes-win Steve-call (first-option door play after a sit); (3) sweep table contract question (Steve-call, unchanged); (4) capstone readiness (veterans die / links don't season); (5) trial-by-combat staging (Steve-call); (6) Binding-never-fires follow-up; (7) gating leg-4 recalibration (decision owed). food-economy stays converging (untouched; sibling Loop A).
