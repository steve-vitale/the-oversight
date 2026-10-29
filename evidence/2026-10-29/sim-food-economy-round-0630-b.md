# sim-food-economy-round-0630-b — coordinator evidence (Loop B, axis food-economy)

Run: fleshout-loop-b-20261029T0630Z (scheduled 01:30 CDT). Loop A live on
scale-onramp throughout (0415Z claim, arms sim-w4dpr2-finish + sim-lottery-a,
NOT touched) -> B worked food-economy (converging), the second axis.
Both arms policy-side or measurement-only; zero src/js in this run.

## Arm 1 — sim-blockedpath-diag-b: DIAG-GO, LANDED d32002dcf

Measurement only (zero src/js, zero policy change). Decomposes the 115
haven-offered but hop-refused evenings from the nighttravel verdict's
pooled 36-seed policy leg (176 away evenings: 22 within reach, 19
converted; 115 refused on a blockage; 20 too far; 19 combat/tent).

- Classification 115/115: washed_out 41 (35.7%), fallen_tree 33 (28.7%),
  rubble 24 (20.9%), creek 17 (14.8%). 22 distinct blocked sites, 25
  consecutive-day episodes (mean 4.6 evenings) — villagers spend most of
  a week refused by the SAME tile, usually on the haven ring
  ((3,4)/(4,3)/(5,4) dominate). All 115 intermediate-leg (0 stopped AT
  the haven tile); distance 2: 76, distance 3: 39. Refusal integrity
  holds on all 115 (arrival == departure, 0 kcal hop cost).
- Clearability (live-engine traces, proof T9): rubble clearable (40 kcal,
  +stone), fallen_tree clearable (60 kcal, +wood), washed_out clearable /
  scrambable (80 kcal scramble, or 4-wood bridge), creek NOT hand-clearable
  (bridge 4 wood or swim only). The day's bot clears rubble only, for
  stone, nearest-first, never homeward — so no bot path clears trees,
  scrambles gaps, or builds bridges.
- Route-around: 115/115 route-around-able under Arm B's orthogonal BFS
  detour logic (path lengths 2–5). ZERO of the 115 is stuck with no lawful
  in-fiction remedy. The stuck-ness is policy-side: the evening hop tries
  exactly one direct hop and never detours, and the day's bot never clears
  the homeward blockage. Evening clearing is the wrong remedy on
  affordability: evening kcal was 0 on several stranded evenings per type,
  and clearing costs a day-part the evening does not have; detour steps
  are free node travel by engine law.
- 10752 disagreement DETERMINED (different tile, not a stale flag, not a
  second blockage): day 12's only clearBlockage call cleared rubble at
  (1,3); the evening hop was refused by rubble at (2,4), present every
  day 1–14, never cleared. clearRubbleForStone takes nearest rubble in
  travel reach with no homeward preference, and travelTargets order puts
  (1,3) first. The game never names tiles in either line, so the
  disagreement is a narration omission, not an engine contradiction.
- Sense-test: refusal lines name the block honestly ("The path is washed
  out.", "Rubble chokes the path.", creek line names bridge/swim) but
  never name the tile, never name the way around, and never mark the
  night itself ("you bed down out here" absent). Creek evenings are the
  sharpest gap: the game lists unusable remedies and omits the usable
  2-step detour.
- Designed next lever (NOT BUILT, draft prereg in the arm evidence §5):
  evening detour — on a travel-refused evening, walk the BFS route-around
  path home, then run the insideevening entry leg unchanged. Draft bar:
  rescue rate >= 0.50 with minimum-n 8 refused evenings; G3
  zero-tolerance honesty guards. Alternative sketched, not preregistered:
  homeward clearing habit (clear THAT tile, kcal floor 200 after clearing).
- Proof: scripts/test-blockedpath-diag-b.js T1–T9 PROOF-GREEN on the worker
  branch, re-run green by the coordinator after rebase onto moved master.
  Evidence: evidence/2026-10-29/sim-blockedpath-diag-b.md + replay JSON +
  10752 before/after traces.

## Arm 2 — sim-standinghome-retry-b: GO (pilot + pooled confirm), LANDED d122dcdda

Policy-side only, default-OFF instrument (scripts/policies/competent.js
gate COMPETENT_STANDING_HOME + helper + daily() call + exports;
scripts/creekpath-trace-b.js census fields). No src/js, no default flip —
NOT a game change. Retries the killed creekpath Arm C under a NEW prereg
written before any judged after-leg; the killed verdict STANDS and was
never re-scored (§14: revisions apply to the next run).

- New prereg's only guard change: G1-REVISED counts a starvation death
  against the arm ONLY if it falls within 7 days after a standing-home
  step fired for that seed (causal window). Pooled TOTAL starvation deaths
  are reported in full but NOT judged. Window disclosure: no starvation
  death in either band falls days 1–7 after a step, so the verdict is
  insensitive to any window from 0 to 12 days; a 13+ day window would flip
  the pilot — a future prereg cannot silently move it.
- Rebuild verified: the fresh after-pilot corpus is BYTE-IDENTICAL to the
  killed run's after-pilot corpus on all 8 files. The new verdict comes
  only from the new prereg, not from any behavior change.
- Pilot (10750–10757) GO: stranded 3→0 (bar ≤1), no-move 2→0 (bar ≤1),
  strand guard PASS, G1 causal 0 HOLD (step day 12, window days 12–19,
  the four deaths fall days 25–26, outside it), pooled total starvation
  0→4 REPORTED-NOT-JUDGED (player 0→0), G2 0 HOLD, median 30→30.
- Confirm (10758–10773) + POOLED (24 seeds) GO: confirm stranded 4→0,
  no-move 3→0, strand guard PASS, G1 causal 0 HOLD, confirm total
  starvation 7→7 (player 1→1, the 10772 day-11 death byte-identical in
  both legs), G2 0 HOLD. Pooled: refused 7→0 (bar ≤3), no-move 5→0
  (bar ≤2), G1 causal 0, pooled total starvation 7→11
  REPORTED-NOT-JUDGED (the +4 is entirely the pilot's 10752 cluster),
  G2 0. Verdict computed by the proof script (verdict mode), not
  hand-counted.
- Confirm-leg findings: 10762 standing step (day 13) clears the 4-evening
  strand and, by trajectory divergence, the 5 hop-clear evenings never
  occur (deaths 14→9, no starvation either leg). 10770 new class: the step
  fires day 5 on an OUT-OF-REACH evening (guard is board-presence, not
  travel-offered), and the after leg ends every evening at home.
- DOCUMENTED blind spot (not built — changing a guard mid-run would break
  preregistration): ADJACENT-TILE. On 10772 days 10–11 the player stands
  at trail_edge (4,3), one hop from haven with a CLEAR hop, and the step
  never fires. Cause: Game.playerAtHaven() counts Manhattan distance ≤ 1
  as "at haven" (a narration-presence gate), while the step's guard treats
  it as already home. A future prereg should use the tile check alone
  (map px/py == haven px/py) and re-measure 10772; expected effect is
  those 2 hop-clear evenings → at-home and the day-11 player starvation
  death avoided or displaced.
- Sense-test: 10752 day-12 rescue reads as a real day ("Rubble chokes the
  path." twice, then "Travel 3 tiles to Haven." / "You walk back into
  Haven."); the KNOWN detour-narration blank reproduces (no "going around"
  line) and is documented, not built, in this policy-only arm.
- Proof: scripts/test-standinghome-retry-b.js PROOF-GREEN on the worker
  branch (placement + neutrality + verdict computation), re-run green by
  the coordinator after rebase onto moved master. Panel limitation as in
  Arm C: balance-panel.js has no stranded-evening metric; guard metrics
  are reported from the corpora instead.
- Evidence: evidence/2026-10-29/sim-standinghome-retry-b-prereg.md (new
  prereg) + sim-standinghome-retry-b.md + after-pilot/after-confirm corpora.

## Wall numbers (every run)

National / table / wins: NOT OBSERVABLE in 30-day position traces —
reported, not claimed. Wave 4–5 unlocks: 0 in both arms' legs (max wave 3
on 1/36 verdict seeds; confirm band max wave 3, both legs identical).
Median survival: 30 days in all legs. No wall movement is claimed or
implied by this run; both arms are travel-economy instruments, not
scale-onramp work.

## Telemetry deviation check

On the standinghome after-pilot (n=8), after-confirm (n=16), and the
nighttravel pooled-36 corpora vs scale-wall.json: 3 LOUD lines each
(national 12→0, table 16→0, wins 16→0) — all the KNOWN field-shape +
regime artifact class (30-day pre-seat corpora carry no national/table/
wins fields; the baseline is a WINSEAT corpus). Baseline NOT rolled, no
investigation item. Same class as the 0530Z run.

## Infrastructure

- Master moved under the run (journey-deepening r63, journey succession
  r64, geartier-a, gaps-grudge landings — zero file overlap with either
  arm). Both branches rebased clean in their own worktrees; proofs re-ran
  green after every rebase and on merged master.
- Safe-commit index clobber hit the blockedpath worker commit (repaired by
  the worker, commit verified correct); no clobber on either coordinator
  merge. No EPERM flap blocked this run.
- check.js --quick NOT re-run at coordinator level: zero src/js, zero
  green-list files; standing 280/7 pre-existing profile last recorded by
  the 2215Z/2315Z rounds.
- Loop A untouched throughout (scale-onramp 0415Z claim still live at
  closeout; its sim-lottery-a tree was never entered).

## Backlog maintenance (sim-findings.md, this run)

Appended [open] adjacent-tile blind spot (playerAtHaven ≤1 gate), [open]
evening-detour lever design (blockedpath §5 draft prereg), [open]
10752-disagreement resolution note is recorded in the arm evidence; the
standing-rule killed line is superseded by this run's retry GO (landed as
a default-OFF instrument, not a game change).

food-economy stays converging (NOT converged): the standing go-home rule
now passes a staged pilot + confirm as a default-OFF instrument, and the
blocked-path population is fully decomposed with a designed next lever —
but neither is a game change, the evening detour is unbuilt, the
adjacent-tile blind spot is unmeasured, and no food-economy fix has landed
as game code. scale-onramp stays converging (untouched; sibling loop A
lane). Claim deleted; lock deleted.

Evidence: this file (coordinator) + sim-blockedpath-diag-b.md (on master,
d32002dcf) + sim-standinghome-retry-b-prereg.md + sim-standinghome-retry-b.md
(on master, d122dcdda).
