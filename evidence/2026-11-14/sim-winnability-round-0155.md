# sim-winnability-round-0155 — Loop B coordinator evidence

Run: fleshout-loop-b-20261115T0155Z (Loop B), axis winnability chain.
ADOPTION RUN — stale-lock recovery of the dead run
fleshout-loop-b-20261114T2345Z, both its arms adopted and closed. No new
arm started. Loop A live on scale-onramp throughout (2315Z claim,
sim-ove48-conv-a + sim-transplant8b-a; both landed mid-run as
cec39a279 + 539034e74, NOT touched) — plus journey-establishment r139
(spotter wiring in src/js/game.js, 93f88819c) and a Loop A coordinator
evidence commit (5d7376c33) under this run. Master at run start
910bff7f4; at closeout 0054751ad (succpolity f1400295b + holdbuild
0054751ad, both merged ff-only, pending ship).

## Stale-lock recovery

The 2345Z lock was 2h03m old and both its trees' heartbeats were 17–22
min stale (past the 15-min guard); all its workers showed done, and no
coordinator closeout existed in the main tree (latest round file was
2230Z). Per the guard the run was DEAD: lock deleted, claim retired to
`.DEAD`, both stranded trees heartbeated immediately so the reaper
would not touch them, new lock + claim written. Its third item, proof
refresh round 19, had no tree/branch (registration failed 4× in the
dead run, nothing committed) — nothing to adopt; round 19 stays owed
(see below).

## Arm 1 — sim-succpolity-b (MEASUREMENT): all three legs KILLED AT PILOT

Branch sim-succpolity-b, tip f1400295b (rebased twice onto the moving
master, proofs re-run green after every rebase). Evidence:
evidence/2026-11-14/sim-succpolity-b.md (+ prereg, analysis JSON,
pilot panels a/b/c). Zero src/js changes (G3 holds).

- **Coordinator decision (this run, recorded in the arm evidence):**
  re-baseline the single drifted repro cell (100201 scaleclimb, days
  124 corpus vs 143 repro — one day-97 wild fight downstream of a
  day-95 arena fight, moved by the Steve-ordered Reunion arena
  balance) on current master and proceed with pilot legs against the
  armed corpus leg. The armed leg — the G2 judge's baseline —
  reproduced 3/3; the drifted cell is a baseline-policy cell used for
  wall numbers only. Guard executed verbatim: after rebasing onto
  3321c6546, all 6 repro cells re-run on the new tip, all 3 ARMED
  cells reproduce field-for-field (gate did not re-arm); the drifted
  cell is stable on the new tip (143d) and re-baselined as a labeled
  file, wall numbers only, that cell only.
- **Pilot verdicts** (8 seeds 100201–100208, 150d, per leg vs the
  corpus armed leg; pilot gate ≤2 of 4 dissolution seeds):
  (a) SUCCPOLITY=1 only — 4 events / 3 seeds (100203 d105, 100206
  d135, 100208 d106+d142), gate FAILS, cost clean (starv 2, median
  138.5d). (b) SUCCGRACE=1 only — 4 events / 4 seeds, gate FAILS,
  cost clean (starv 5, median 140.5d). (c) Both on — 4 events / 3
  seeds, gate FAILS, cost clean (starv 2, median 138.5d). No confirm
  ran for any leg, per the binding pilot gate. No 100203/100212
  re-climb in any leg.
- **What the levers did:** SUCCPOLITY delays the verdict (100203
  d90→d105, +15d; 100204 held — village died d140 still national);
  SUCCGRACE gifts buy ~5 days each (6 beats staged in leg (b), 6
  answered with the gift, 0 lapsed). Neither holds a realm: the hold
  is a three-link problem and both levers repair at most one link per
  funeral while the other two keep eroding. Leg (c) is behaviorally
  identical to (a) on all 8 seeds — with SUCCPOLITY's window holding
  the polity, no succgrace beat ever stages, so the levers don't
  stack. One gift was toothless: 100204's d139 gift cost 0 kcal
  (pantry empty) and moved trust 0 — the poverty trap in miniature.
- **G1 false positive (leg b, instrument note, kill unaffected):**
  the analyzer's `youngAnswers=6` is wrong — the policy answers at
  the start of daily, before the snapshot roll records the link roll,
  so a same-day-answered succgrace beat never appears as `prSg=1`
  and the join mislabels it young. Policy stats settle it
  (`succgraceAnswers` == `succgraceBeatsSeen`, zero
  `answerRenegotiation` on any link the policy logged young).
  Proposed join fix recorded in the arm evidence for the next run;
  the kill stands on dissolutions regardless.
- **Sense-testing:** the renegotiation beat reads as a played
  negotiation — named speaker, named options, 7-day deadline, voiced
  gift answer, voiced dissolution. What's not played: the other two
  links sliding — the player does everything asked and the realm dies
  anyway with no line saying why. A held realm's villagers say
  nothing different from a dissolving one's. The proving window is
  entirely silent.
- **Proofs:** test-succpolity-b-20261114.js 67/67 static + 16/16 game,
  green on the merged tip (re-run by the coordinator after the final
  rebase).

## Arm 2 — sim-holdbuild-b (BUILD): NO-GO at pilot, build reverted

Branch sim-holdbuild-b, tip 0054751ad (rebased onto the moving master,
proof re-run). Evidence: evidence/2026-11-14/sim-holdbuild-b.md
(+ prereg, pilot analyses, panel compare, check log). The build
(upkeep tending while national + representative fallback actor for
sub-40 re-climb links, src/js/win-plan.js) is REVERTED in the branch
— `src/js/win-plan.js` byte-identical to master; the branch carries
measurement + instruments + evidence only, no game change.

- **Pilot verdict** (8 seeds 100201–100208, armed policy, 150d,
  OFF vs ON on identical seeds): gate (i) mechanism fires PASS
  (wpUpkeep 6 + wpReclimb 17 = 23 > 0; upkeep-classified engine tends
  6, reclimb-classified 10); gate (ii) cost PASS (starvation pooled
  ON 2 ≤ OFF 3+2; median survival ON 128.5d ≥ 0.8 × OFF 134.5d);
  gate (iii) FAIL — 100203 never dissolved on the ON leg (reached
  national d62, held 36d, died d97 *while national*, so no re-climb
  was possible) and median national held-days ON 40 < 48 (OFF 43.5,
  reproducing the corpus exactly per-seed). No confirm spend, per
  the prereg. P1/P2/COST unjudged by design.
- **What happened:** the hold worked as a mechanism (dissolutions 3
  vs 4, re-climbs 2 vs 1 — both on 100205, d101/d109 — national-ever
  8/8 vs 7/8) but held-days fell because ON villages died in combat
  while national (100207: 5 held-days, lost d69; 100208: 14, lost
  d76). The pilot's binding constraint moved from tending to fighter
  survival.
- **Stage 0 + rebase check:** reproduction passed 3/3 before the
  pilot; after rebasing onto 3321c6546 the proof re-ran 9/9,
  tenddrive cross-check 4/4, and pilot OFF seed 100201 re-ran with
  zero field diffs — the r206 betrayal.js change moved nothing.
- **Sense-testing:** the re-climb is a played return at court level
  (First Court re-stages, feast paid aloud with trust named) but the
  tend itself is silent — no voiced line for the representative's
  tending. 100205's story: three deaths (Rafael d93, Nina d101,
  Zoltan d113), each −8 to all links; re-climbs twice, loses the
  realm twice to the next death.
- **Proofs / checks:** test-holdbuild-b.js is 5/9 on the reverted
  tree BY DESIGN (the four build legs fail; retained as
  specification, tenddrive-a precedent). `node scripts/check.js
  --quick`: 334 passed, 6 failed — two measurement-proof failures
  are caused by the branch (it adds policy files under
  `scripts/policies/`, which the proof manifest hashes — proof
  freshness, not behavior); the other four are pre-existing/load
  (cache-flags load artifact, stale phone-frame receipt on master,
  two 120s timeouts under sibling sweeps). The maintenance proof
  needs a refresh with a real neutral panel if this lands — see
  round 19 below.
- **Recorder incident (carried from the dead run, fixed):** the first
  pilot OFF leg diverged because the driver's snapshot read counters
  through `Game.winPlanStats()`, whose `stateOf()` creates
  `village.winPlan` and switched the at-home plan tick on days early.
  Fixed (counters read raw); verified by a dedicated repro script
  with zero field diffs. Lesson recorded in the arm evidence: a
  recorder must never call a game accessor that creates state.

## Wall numbers (this run's judged corpora, 40 configs)

Succpolity pilot, per leg (8 seeds): national ever 7/8, at end 4/8,
table 0, wins 0, wave-4 8/8, wave-5 4/8; medians (a) 138.5d /
(b) 140.5d / (c) 138.5d; starvation 2/5/2; deaths 608/628/608.
Holdbuild pilot OFF: national ever 7/8, end 4/8, table 0, wins 0,
wave-4 8/8, wave-5 4/8, median 134.5d. ON: national ever 8/8, end
7/8, table 0, wins 0, wave-4 8/8, wave-5 2/8, median 128.5d.
Pooled: table 0/40, wins 0/40. The scale wall did not move — national
is reachable, the table is not, nothing has won.

## Telemetry deviation check

Refused, same standing refusal as 2230Z and Loop A's 0148 round:
telemetry-check refuses recorder-corpus input (all 8 --current rows
carry top-level anchorCommit — sweep recorder rows, not runs).
Baseline NOT rolled, no LOUD lines, no new investigation item.

## Findings appended (sim-findings.md)

- The three 2230Z `[claimed]` hold items updated: upkeep-tending and
  poverty-trap items back to [open] with the holdbuild pilot NO-GO
  recorded; SUCCPOLITY/SUCCGRACE item back to [open] with the three
  pilot kills recorded.
- Policy-source-unrecoverable item marked [fixed]: the holdbuild arm
  recovered both policies byte-identical from ed6df749e (committed
  0a1282119).
- NEW: succpolity G1 analyzer join false positive (same-day answers
  mislabeled young; join fix proposed for the next run).
- NEW: holdbuild sense-test gap — the representative's re-climb tend
  has no voiced line (the re-climb is played at court level, the tend
  itself is silent).

## Infrastructure

- **Premature release (coordinator error, repaired):** after the
  first succpolity merge failed ff-only (Loop A had landed
  transplant8b mid-proof), the release steps ran anyway because they
  were chained with `;` instead of `&&` — the tree was released as
  "done-merged" and removed while the branch was NOT merged. No work
  lost (branch intact at 5c0af91b8). Repaired by re-registering the
  tree (script supports an existing branch with -f), rebasing,
  re-proving, and merging with `&&` chaining plus an explicit
  merge-base verification before any release step. Lesson (same as
  AGENTS.md): never chain release steps after a merge with `;`.
- Master moved 4 times under the run (Loop A ove48-conv,
  transplant8b, scale-onramp-round-0148 evidence, journey-establishment
  r139 spotter wiring in src/js/game.js); both arms rebased clean,
  proofs re-run green after every rebase. The r139 game.js change
  (foraging grants spotter XP; faster plant-ID threshold) landed
  after both pilots ran on base 3321c6546 — the pilots' ON-vs-OFF
  verdicts are unaffected (same-base comparisons, measurement-only
  arms now), but the next hold measurement runs on a foraging-changed
  base.
- Safe-commit index clobber struck the succpolity worker's commits
  twice and the holdbuild worker's 4× — repaired via the documented
  `ls-tree -r | update-index --add --index-info` pipe each time,
  commits verified correct. The holdbuild revert needed
  `--force-delete` after safe-commit refused the 79-line deletion —
  used under the prereg's explicit revert direction, recorded in the
  arm evidence.
- Write flap quiet this run (all probes OK, no truncated writes).
  Registry lock queue very slow (registrations ~5–11 min). Git gc
  unreachable-objects warning on both merges (housekeeping, not
  acted on).
- check.js --quick NOT re-run by the coordinator (zero src/js in
  either landed branch; holdbuild worker's 334/6 recorded above).

## Village assessment (plain words)

Two different ways to save a realm were tried, and both ran into the
same wall from opposite sides. The court's own safety nets — a
two-week grace period after a funeral, a chance to buy back a
shaken friendship with grain — do buy time: a realm lasts two weeks
longer here, a gift buys five days there. But a realm is three old
friendships, and a funeral wounds all three at once; patching one
while the other two slide is bailing with a cup. The other try did
the tending itself — the village kept tending its old bonds, and a
stand-in stepped up when nobody was home to tend — and the machinery
worked: realms stopped dissolving as often and climbed back twice.
But the villages holding those realms died fighting while they were
still nations, so the held-days count went down anyway. The hold is
no longer (only) a tending problem. It is a three-link problem and,
now, a staying-alive problem: the people who would hold the realm
have to survive wave 4 to do it.

## Convergence state

winnability chain stays converging (NOT converged): the hold is now
measured from both sides — the env-gated succession levers delay but
don't hold (all three legs killed at pilot), and the upkeep/re-climb
build fires cleanly but loses held-days to combat deaths while
national (NO-GO at pilot, reverted). No hold lever has landed; the
answercourt cost call is still with Steve / the main session; table
and wins remain 0. scale-onramp stays converging (untouched; sibling
Loop A). food-economy stays converging (untouched; parked).
Next blanks, in order: (1) proof refresh round 19 — OWED NOW: the
manifest changed under both merges (new policy files under
scripts/policies/); the dead run's b19 attempt failed registration
with nothing to adopt, so the next run takes it first; (2)
answercourt cost call (Steve / main session); (3) competent
seat-taking BUILD (Steve-call); (4) the hold, next lever — the
binding constraint on the pilot band is now combat deaths of
national villages + three-link erosion per funeral; a next hold arm
must repair more than one link per funeral or keep fighters alive
through wave 4 (coordinator observation, not a Steve call); (5)
veterans survivorship (design question); (6) succpolity G1 join fix
(instrument, next run); (7) phone-frame receipt refresh; (8)
only-lead-shape second band; (9) family 2b AMBIGUOUS (Loop A
suspect list). Claim deleted; lock deleted.
