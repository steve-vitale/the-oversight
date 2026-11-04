# sim-approachbranch-a — TRUE-approach fallback firing replay + 8-seed pilot panel (Loop B run fleshout-20261104T1326Z, axis scale-onramp)

## Verdict

**NO-GO overall (guardrail breach) — with the firing itself PROVEN.**
Read both halves; neither alone is the verdict.

- FIRING (prereg bars (a)-(e)): PASS, cleanly. On a TRUE-approach
  geometry replayed through the REAL armed policy, the fallback
  fires (approachFallbackMarks 1 at turn 3), re-picks a reachable
  tile (turn 4: step to (4,5)), and the fighter strikes on turns
  5-8 with post-firing blocked run 0. The baseline gate reproduces
  the corpus shape exactly on judged turns 1-7. Repeat replays are
  byte-identical. Zero policy/src behavior change. This is the
  live-geometry firing the pilot, the confirm, and the approachfire
  arm all failed to produce — now on record, with a direct counter,
  not the confounded proxy.
- GUARDRAIL (prereg bar (f)): FAIL. The 8-seed pilot panel's
  starvation totals are armed 7 vs baseline 2, against the bar
  armed <= baseline + 2 = 4. The other two guardrail halves pass
  (player-flagged starvation 1 <= 2; median survival 83d >= 0.8 x
  93.5d = 74.8d), but §14 binds guardrails as metrics: a GO met
  with a guardrail breached is NO-GO.
- Overall: NO-GO. The variant as piloted is NOT landable on this
  pilot. This is NOT a kill of the fallback mechanism (§14a — see
  Verdict taxonomy below): the mechanism fired and broke the loop
  in replay, and the panel's starvation excess cannot be attributed
  to the fallback specifically (the panel variant carries all four
  gates, and trajectories diverge chaotically seed by seed). What
  is blocked is landing the combined variant on an 8-seed pilot
  whose totals half breached by 3. Confirm (12-16 seeds) is NOT
  spent in this arm, per the prereg; the next run's job is a
  12-seed guardrail re-test on the confirm band before any
  land/kill decision on the variant (see Metric review).

Convergence state: killed-at-pilot (guardrail breach; firing
proven, variant blocked pending re-test).

## Verdict taxonomy (§14a)

NOT CONCEPT-DEAD: the mechanism was staged on a genuine substrate
and fired on its merits (mark -> re-pick -> strikes). NOT
SUBSTRATE-MISSING: the screen found true-approach loops with
post-mark turns before any replay was run. NOT METRIC-BROKEN: the
guardrail bar was pre-registered, the panel measured it fairly
with the confirm's own counting rule, and the breach is 7 real
late-game starvation tele records, not a counting artifact. §14a
has no guardrail-only class, so this verdict is recorded as
NO-GO (guardrail breach) — mechanism alive, variant blocked —
rather than forced into a kill class it does not fit.

## Design (from the prereg, committed before any judged replay)

- Prereg: evidence/2026-11-04/sim-approachbranch-a-prereg.md
  (commit 7c0d6a8a1, before any judged replay). Harness: scripts/
  probe-approachbranch-a-20261104.js. Proofs: scripts/
  test-approachbranch-20261104.js (split) and scripts/
  test-approachbranch-replay-20261104.js (replay), both ALL PASS.
- Step 1 (committed first, 874abfc84): the branch split of the
  approachconf APPROACH-STEP class + a dated CORRECTION appendix
  to sim-approachconf-b.md (original text intact).
- Replay, not a band screen, for the firing claim: the fleerepair
  99601 seq-4 geometry driven turn by turn through the REAL
  policy, require()d verbatim — baseline = competent.js with all
  gates cleared; armed = scripts/policies/
  competent-approachfall-b.js required verbatim (four gates,
  DPS_RACE off). No hand-edited policy copy exists.
- DIRECT COUNTER (not the confounded proxy): after every turn the
  harness reads the policy's OWN ctx counters —
  approachFallbackMarks, approachFallbackWaits, approachRepickSteps,
  approachStuckTurns. Only the fallback code writes them. The
  counter reads ctx only and alters no decision.
- Panel (guardrails only, after replay bars held): scripts/
  approachbranch-driver-20261104.js (copy of the confirm driver,
  new corpus dir so no confirm file is overwritten) + scripts/
  approachbranch-summarize-20261104.js (branch split + confirm
  scale fields), 140d death-aware horizon, seeds 99601-99608,
  baseline competent verbatim vs armed approachfall variant
  verbatim. A balance-panel.js compare is NOT run (registry-policy
  panels only; the variant is not a registry policy — the same
  reason the pilot and the confirm documented). Per the prereg's
  up-front note: the balanced panel returns review_required on
  zero-delta pilots — a known rule, not a verdict override (§15:
  the panel is the instrument, never the judge); the guardrails
  above are the panel judge and the replay counter is the firing
  judge. This panel is not zero-delta on its guardrail metric
  (starvation totals move), so the note is carried, not invoked.
- No gate/price/deed/standing change. No src/js change. No policy
  behavior change: `git diff HEAD` for scripts/policies/
  competent.js and competent-approachfall-b.js is empty (proven in
  the replay proof test). Landing remains the coordinator's
  --ff-only merge, pending ship. No push, no version bump, no live
  verification.

## Step 1 — the branch split + CORRECTION (committed 874abfc84)

The split (scripts/approachbranch-analyze-20261104.js) classifies
every old APPROACH-STEP turn by issuing branch, reconstructed from
policy precedence + the recorded turn (HP, round, target, weakest
distance, exposure monster waves):

- Gate-off corpus: HP < 0.35 -> flee (the mid-fight flee line
  pre-empts CLOSE THE DISTANCE every turn, and gate-off legacy
  flee() always returns true); round-1 + outmatched -> flee (the
  fight-start assessment runs only on the first fight() call);
  otherwise -> approach.
- Gated corpus: HP < 0.35, or round-1 + outmatched -> 'other'
  (gated flee() may hold at haven / repair-fallthrough to approach
  in the same turn; the corpus records no map node or repair state
  to tell — 'other' is the honest bucket, not a third mechanism);
  otherwise -> approach.
- Caveat (stated in the analyzer, not hidden): a lone approach turn
  could in principle be a beast-trick move (tricks run before CLOSE
  THE DISTANCE and move the player), but tricks are one-shot per
  monster per fight (move_x2 at most 2 consecutive rounds), so a
  run of >= 3 same-target approach turns cannot be trick-issued.
  Loop-relevant runs are robust; the PRIMARY geometry's run is 7.

Screen results (corrected analyzer):

| corpus | files | old | flee | approach | other | old loops | true loops |
|--------|-------|-----|------|----------|-------|-----------|------------|
| confirm 99601-99612 | 24 | 24 | 15 | 9 | 0 | 1 | 0 |
| pilot 99801-99808 | 16 | 0 | 0 | 0 | 0 | 0 | 0 |
| fleerepair 99101-99108 + 99601-99608 | 40 | 38 | 1 | 29 | 8 | 5 | 4 |

CORRECTION (appended to sim-approachconf-b.md, original text
intact): the confirm's one baseline "approach-loop fight", 99605
seq 2, splits flee 14 / approach 0 — it is a FLEE loop, and true
loops in the confirm corpus number 0, not 1. The confirm's bar (b)
("baseline approach-loop fights >= 1: PASS, exactly 1") does NOT
pass under the corrected taxonomy: the confirm never put a true
approach loop in front of the armed policy. Its other numbers
stand (armed loops 0 under either taxonomy; cost bar as measured)
and its THIN qualification stands, but its headline must now read
as a no-harm result on a band whose only old-class loop was a flee
loop. This aligns the confirm with sim-approachfire-b.md, which
had already classified 99605 seq 2 as a flee loop. Baseline old 18
-> flee 15, approach 3; armed old 6 -> approach 6. The 99604 seq 5
proxy event (3 approach steps, then a zero-tile move to edge tile
(0,7)) splits into approach 3 + flee 1 (HP 0.24) — a flee-branch
target change, strengthening the proxy-confound warning.

## Substrate check (§14b) — passed before any judged replay

The fleerepair leg ran with the approach fallback OFF, so its
true-approach loops persisted unbroken — exactly the geometry the
fallback was built for. Candidates with post-mark true-approach
turns at HP >= 0.35: 99601 seq 4 (7 true-approach turns, 4
post-mark), seq 5 (7, 4), seq 6 (5, 2), 99606 seq 10 (4, 1). This
arm is NOT a SUBSTRATE-MISSING report.

## PRIMARY geometry reconstruction (corpus facts vs approximations)

CORPUS FACTS (evidence/2026-11-04/perseed-fleerepair-a/
fleerepair-s99601-confirm-fleerepair.json, exposure seq 4,
influencer, day 100, fleerepair leg): player (4,4), Machete range
1, speed 3 (moveLeft 3), HP 100 (rounds 2-4) then 56 (rounds 5-8)
then 25 (round 9); monster influencer (4,6), HP 322/850, NEVER
moves; Chebyshev distance 2 (out of range) every turn; single
monster, so weakest == only monster; 8 player turns, rounds 2-9,
every move tbPlayerMove(3,5) -> "No path there.", 0 strikes, 0
waits, fighter died (HP -7); ally ivy_wang FLED in round 1 (npcTurn
pre (6,5) -> post (3,2) fled), before the first recorded player
turn. Branch split: rounds 2-8 TRUE-APPROACH; round 9 (HP 0.25)
'other' under gated rules.

APPROXIMATIONS (stated in the prereg, kept here):

- TERRAIN: the corpus records no terrain. PRIMARY blocks (3,5)
  only. The negative controls below turn this from "minimal" into
  "forced": with (3,5) open, the engine's findPath always admits a
  route (direct, or a detour, or through the monster tile — the
  engine checks destination occupancy only, never intermediate
  tiles), so no (3,5)-open board reproduces 7x "No path there.".
  The live board blocks (3,5) itself.
- ALLIES: none in the replay (ivy fled round 1, before the first
  recorded player turn; no ally occupies any approach candidate
  during judged turns).
- MONSTER DAMAGE: not simulated. Player HP follows the corpus
  trajectory; the monster is held static at (4,6), HP 322. Armed
  strikes are decision-only, never kill claims.
- MAP NODE: not in the corpus. Flee never runs during judged turns
  1-7 (HP >= 0.35, DPS race off, fight-assess off), so PRIMARY uses
  haven (4,4) and node (4,2) runs as a sensitivity for turn 8 only.
- FIGHT-START PRIMING: ctx._fightObj is set to the fight object
  before replay turn 1, because the fight-start assessment runs
  only on the first fight() call and every recorded corpus turn
  begins at round >= 2. The UNPRIMED sensitivities show the
  assessment's turn-1 behavior so the priming is demonstrated, not
  assumed. (The task's "not outmatched at fight start" is satisfied
  in substance for rounds >= 2 for exactly this reason: the
  assessment cannot fire on a judged turn.)

## Judged replays (PRIMARY scenario: map (4,4), blocked (3,5))

BASELINE leg (verbatim competent, gates off) — BASELINE GATE
PASSES on judged turns 1-7: every move tbPlayerMove(3,5), every
line "No path there.", 0 strikes, 0 waits, direct counters marks
0 / waits 0 / repicks 0 / stuckTurns 0. Turn 8 (HP 0.25) is a
legacy-flee turn (tbPlayerMove(0,4) -> "Too far — 3 squares left.")
and is NOT gated by the prereg. Full transcript:
perseed-approachbranch-a/approachbranch-primary-baseline.txt
(JSON alongside).

ARMED leg (variant file verbatim) — FIRING + LOOP BREAK:

| turn | round | HP | move / action | branch | counters after (m/w/r/s) |
|------|-------|----|---------------|--------|--------------------------|
| 1 | 2 | 100 | tbPlayerMove(3,5) "No path there." | approach | 0/0/0/1 |
| 2 | 3 | 100 | tbPlayerMove(3,5) "No path there." | approach | 0/0/0/2 |
| 3 | 4 | 100 | tbPlayerMove(3,5) "No path there." | approach | 1/0/0/3 |
| 4 | 5 | 56 | tbPlayerMove(4,5), lands (4,5) | approach-repick | 1/0/1/3 |
| 5 | 6 | 56 | tbPlayerStrike(m_0) | strike | 1/0/1/3 |
| 6 | 7 | 56 | tbPlayerStrike(m_0) | strike | 1/0/1/3 |
| 7 | 8 | 56 | tbPlayerStrike(m_0) | strike | 1/0/1/3 |
| 8 | 9 | 25 | tbPlayerStrike(m_0) (flee holds at haven, falls through) | strike | 1/0/1/3 |

(m/w/r/s = marks/waits/repickSteps/stuckTurns.) Max same-target
blocked run 3 (pre-firing only); post-firing max run 0; strikes 4;
barrier exits 0. Full transcript: perseed-approachbranch-a/
approachbranch-primary-armed.txt.

PREREG JUDGEMENT, bars (a)-(e): (a) baseline gate passes. (b)
PASSES — marks 1. (c) PASSES — post-firing run 0. (d) repeat
replay byte-identical (proof test). (e) zero policy change
(proof test). The firing claim on a true-approach geometry is
PROVEN. Bar (f) (panel guardrails) is judged separately below and
is what makes the OVERALL verdict NO-GO.

## Sensitivities (reported, never judged, never substituted)

- seq5 board (same positions, HP 100 x5 then 0.63 x2, 4 post-mark
  turns): marks 1, repick to (4,5) turn 4, strikes turns 5-9,
  post-firing run 0. Same shape as primary — the firing is not a
  one-trajectory accident.
- cornercut board (block (4,5) alone, (3,5) open): turn 1 steps
  AROUND via (3,4) and lands (3,5), then strikes; marks 0. This
  board does NOT reproduce the corpus line — a single blocked
  orthogonal side is walked around.
- bothsides board (block (4,5) + (3,4), (3,5) open) — ADDED during
  the run when the cornercut result reframed the board question
  (sensitivity, not a judged leg): turn 1 steps along the detour
  path to (2,3) (the policy's step-as-far-as-moveLeft-allows rule
  on the 6-tile path), turn 2 lands (3,5), then strikes; marks 0.
  Together the two negative controls prove the live board blocks
  (3,5) itself: every (3,5)-open board admits a route under the
  engine's findPath + destination-only occupancy check.
- unprimed + haven (fresh ctx, map (4,4)): turn-for-turn identical
  to the primed primary (haven hold falls through to approach).
  Priming is outcome-irrelevant at haven.
- unprimed + node (4,2) (fresh ctx): turn 1 is a directional flee
  walk to (4,5), then strikes; marks 0. The fight-start assessment
  fires on turn 1 only and MOVES the fighter on a non-haven node —
  so the corpus round-2 position (4,4) rules out a successful
  round-1 flee walk there, and priming is what keeps the replay on
  the recorded round-2+ trajectory. This sensitivity also exposed
  a labeling fix in the harness: the first branch heuristic (move
  target adjacent to monster = approach) mislabeled both the
  detour step (2,3) and the node-42 flee step (4,5); the harness
  now labels by path membership (target on the findPath route to
  the policy's chosen adjacent tile), and the proof pins both
  corrected labels.
- map node (4,2), primed: identical to primary through turn 7;
  turn 8 is a flee-fallthrough-strike (directional step onto the
  monster tile (4,6) refused, in-range fallthrough to strike).
  Post-firing run 1 (the single failed flee move), never >= 3.
- approach-only gates (only COMPETENT_APPROACH_FALLBACK=1):
  marks 1, repick to (4,5) turn 4, strikes turns 5-7, turn 8 legacy
  flee ("Too far"). The firing isolates to the fallback gate, not
  to the other three variant gates (which are inert on approach
  turns at HP >= 0.35 anyway).

## Sense-test (SENSE-TESTING LAW): read end to end

Baseline transcript (replay, judged turns): seven identical turns
— move toward (3,5), "No path there.", no strike, no wait, no
re-pick — the broken robot, exactly as the corpus reads. The
replay adds the branch the corpus instrument never recorded: all
seven are CLOSE THE DISTANCE turns (HP >= 0.35, rounds 2-8), not
flee walks. This loop is real, it is an approach loop, and it
reads as wrong.

Armed primary transcript: bump, bump, bump into the same blocked
tile, then step to the next tile in ((4,5)), then fight. That
reads as a person: three failed tries is already patient, the
fourth turn tries another way in instead of hammering the wall,
and once adjacent the fighter fights every turn — including at
HP 25 on turn 8, where the haven hold falls through to a strike
rather than a doomed walk. No sense veto fires. The wait branch
never runs here (a reachable tile exists), so the frozen-geometry
wait-cycle caution from approachfire remains untested in live
shape — it is still an open design question, not a veto on this
firing.

## Pilot panel (8 seeds, 99601-99608, 140d death-aware)

New measurement on the CURRENT tree (anchor at run time differs
from the confirm's 4a3b7d273: journey r94 and other merges landed
since, and this arm's tooling touches no game code). Trajectories
therefore diverge from the confirm's legs (e.g. panel baseline
99605 dies day 44 vs confirm baseline surviving to 140d) — the
panel is judged against its own baseline, never against the
confirm's numbers. 0 instrument errors on all 16 legs; scale
fields measured 8/8 both legs. Corpus: perseed-approachbranch-a/
approachbranch-s996*-{baseline,armed}.json (16 files); summaries:
approachbranch-panel-baseline.json, approachbranch-panel-armed.json.

Baseline leg (competent verbatim):

| seed | days | end | TB exp | old | flee | appr | other | oldLoops | trueLoops | starv | starvP | maxW | standing |
|------|------|-----|--------|-----|------|------|-------|----------|-----------|-------|--------|------|----------|
| 99601 | 116 | lost | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 4 | 125 |
| 99602 | 73 | lost | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 120 |
| 99603 | 108 | lost | 11 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 200 |
| 99604 | 109 | lost | 14 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 5 | 225 |
| 99605 | 44 | lost | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 3 | 50 |
| 99606 | 132 | lost | 9 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 5 | 335 |
| 99607 | 79 | lost | 8 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 200 |
| 99608 | 67 | lost | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 100 |

Armed leg (approachfall variant):

| seed | days | end | TB exp | old | flee | appr | other | oldLoops | trueLoops | starv | starvP | maxW | standing |
|------|------|-----|--------|-----|------|------|-------|----------|-----------|-------|--------|------|----------|
| 99601 | 79 | lost | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 170 |
| 99602 | 60 | lost | 7 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 150 |
| 99603 | 104 | lost | 9 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 4 | 225 |
| 99604 | 87 | lost | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 1 | 4 | 175 |
| 99605 | 45 | lost | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 75 |
| 99606 | 113 | lost | 8 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 4 | 240 |
| 99607 | 130 | lost | 14 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 4 | 375 |
| 99608 | 67 | lost | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 100 |

(old/flee/appr/other = split counts over instrument-attached
exposures only; two legs per side have zero attached exposures
despite startCombat calls, the same instrument shape the confirm
reported. starv = starvation deaths by the confirm's counting rule
(cause containing 'starv'); starvP = player-flagged subset.)

GUARDRAIL JUDGEMENT (bar (f)):

- Starvation totals: armed 7 <= baseline 2 + 2 = 4? NO — 7 > 4.
  FAIL by 3. The 7 are real late-game tele records (armed 99603
  day 103; 99604 days 85, 86 (one player-flagged); 99606 days 105,
  111; 99607 days 128, 130), not a counting artifact.
- Starvation, arm-only: armed 1 <= baseline 0 + 2 = 2? YES.
- Median survival: armed 83d (sorted 45, 60, 67, 79, 87, 104, 113,
  130) >= 0.8 x baseline 93.5d (44, 67, 73, 79, 108, 109, 116,
  132) = 74.8d? YES.
- Bar (f) FAILS on its totals half. Per §14 and the prereg, the
  overall verdict is NO-GO.

Panel limitations, stated plainly:

- The panel contributes NO firing evidence: old approach steps
  are 0 on BOTH legs (no instrument-attached blocked approach
  turn in 16 legs). The firing claim rests on the replay, per the
  prereg's design; the panel judges guardrails only.
- The panel variant is the COMBINED four-gate variant, not the
  fallback alone. The starvation excess cannot be attributed to
  the fallback specifically — directional flee, exit-verified
  flee, and flee repair ride along, and per-seed trajectories
  diverge chaotically (99601: 116d -> 79d; 99607: 79d -> 130d).
  The breach blocks landing the variant; it does not impugn the
  fallback mechanism, which fired cleanly in replay.
- Wave-5 note: baseline unlocks wave 5 on 2 seeds (99604, 99606),
  armed on 0 — the reverse of the confirm's split, on diverged
  trajectories. Wave-5 kills are 0 on both legs (all killRows wave
  4; linked wave-4 kills 7 baseline / 9 armed, raw 9 / 11). The
  unlock flip is reported, not judged: the panel is a guardrail
  instrument, not a wall instrument, at n=8.

## Scale-wall numbers (panel, fresh — REPORTED, not judged)

| metric | baseline (8) | armed (8) |
|--------|--------------|-----------|
| wins | 0 | 0 |
| national reached | 0 | 0 |
| table reached (sat, end-state tableDone) | 0 | 0 |
| table invited (end-state tableWaiting) | 0 | 0 |
| wave-5 UNLOCKED (seeds with maxWave >= 5) | 2 (99604, 99606) | 0 |
| wave-5 kills | 0 | 0 |
| wave-4 linked kills | 7 | 9 |
| median survival (days) | 93.5 | 83 |
| median standing (final) | 162.5 | 172.5 |
| rank at end | village, all 8 | village, all 8 |

Rank stayed 'village' on ALL 16 legs despite standing up to 335
(baseline 99606) and 375 (armed 99607) — the same
standing-without-rank pattern the pilot and the confirm reported.
The scale wall is unchanged by this arm (as expected — a fallback
firing in one replay was never going to move the wall). Full seat
still unwon, wave-5 kills still 0.

## Village assessment (plain words)

Nothing about the village's arc changes in this arm's panel: all
16 villages are lost, combat deaths dominate, no win, no national,
no table. What changes is narrow and honestly bounded, and it is
the thing three runs in a row were owed: a fighter who really was
stuck trying to reach the beast — at full health, then at 56%,
repeating "No path there." seven times while the beast sat still
— now, under the armed policy, tries the next tile in on the
fourth turn and fights. That is the approach fallback doing
exactly what its card says, on a geometry a real sim actually
produced, proven by its own counter rather than by a proxy shape.
What did NOT change is the price of the combined variant on this
small pilot: armed villages starved more (7 vs 2 deaths, late in
the run, mostly villagers rather than the scholar), enough to
breach the pre-registered totals bar even though the scholar's own
starvation count and the median lifespan both pass. Whether that
excess is the variant's real cost or an 8-seed draw on chaotically
diverging trajectories is exactly what a 12-seed re-test has to
answer — this arm does not guess. The blank filled is the live
firing (replay-proven). The blank documented is the live SIM
firing (the panel produced zero approach steps to fire on) and
the variant's cost (breach on a pilot, re-test owed).

## Metric review (for the NEXT run, not a re-score of this one)

- The branch split held: it re-classified the confirm corpus
  without touching a line of the old analyzer (the split builds on
  analyzeConfirm's own move-only class — an early prototype that
  re-derived the class from raw actions over-counted 36 vs 24,
  because the instrument already classes edge walks as
  'flee-attempt'; the shipped analyzer builds on the analyzer's
  class, and the proof pins the 24). Future loop claims must use
  the split, never the unsplit class.
- Summarizer filter bug, found and fixed in this run: the first
  panel summary matched files by prefix 'approachbranch-s', which
  swept the replay corpus file approachbranch-seq5-armed.json into
  the panel (9 files, median polluted with a null day). The
  shipped summarizer matches /^approachbranch-s\d+-.*\.json$/ only;
  both panel summaries were regenerated after the fix, and the
  guardrail numbers above come from the fixed summaries. The
  starvation breach survives the fix (the replay file carries no
  deaths) — the fix changes the median from 87 to 83, which still
  passes its bar.
- The 8-seed starvation totals bar is a noisy guardrail: baseline
  2 is a low draw (the confirm's 12-seed baseline was 6), armed 7
  breaches a bar of 4, and the player-flagged + median halves both
  pass. PROPOSAL FOR THE NEXT RUN (not a re-score): re-test the
  guardrail on the 12-seed confirm band (99601-99612) before any
  land/kill decision on the variant, and pre-register whether the
  totals half is judged on totals alone or alongside the
  player-flagged half. Do not soften this run's verdict to
  accommodate it.
- The panel compare was not run and must not be fabricated:
  balance-panel.js compare takes registry-policy panels, and the
  variant is not a registry policy. The prereg's review_required
  note is carried, not invoked (the panel is not zero-delta on its
  guardrail metric).
- The wait branch's frozen-geometry cycle (5 waits -> re-probe ->
  5 waits, unbounded while the monster sits still) is still
  untested in live shape: every replay firing here re-picked a
  reachable tile, so no wait ever ran. A future true-approach test
  on an all-adjacent-blocked board (the approachfire
  blocked-adjacent shape, now re-framed as a true-approach board
  only if its fighter is HP >= 0.35 and post-mark turns exist)
  should pre-register a bound on frozen waits before calling a
  wait cycle a break.
- Engine observation (not chased): tbPlayerMove checks destination
  occupancy only — a path may walk THROUGH a monster tile (the
  bothsides detour routes via (4,6) in BFS, though the policy's
  step rule lands elsewhere). Pathing-through-monsters is existing
  engine behavior, noted for a future engine look, not fixed here
  (out of this arm's policy-side scope).
- TELEMETRY DEVIATION CHECK (run-book step 10): scripts/
  telemetry-check.js was NOT run against this corpus — same tool-
  shape refusal as the pilot/confirm (sweep-recorder rows carry
  top-level anchorCommit and are compared with sweep-compare
  tables, never against the run-shaped scale-wall baseline).
  --allow-recorder-corpus was not forced. The wall numbers above
  are reported directly from the measured per-seed scale fields
  (scaleMeasured 8/8 both legs).
- check.js --quick was NOT run for this arm: it adds no src/js,
  policy-default, or game-code change (new scripts + evidence
  only), and the base's check profile is the coordinator/ship
  loop's, per the confirm's precedent. The relevant proofs are
  green (below).

## Findings for the coordinator (do NOT edit hidden_files from this arm)

1. NEXT BLANK (firing, now narrowed): the fallback firing is
   REPLAY-PROVEN on a true-approach geometry. What remains open
   is a LIVE SIM firing: the pilot panel produced zero approach
   steps on either leg, so no sim has yet shown the counter move.
   The known substrate is the fleerepair band's 99601 fights
   (seq 4/5/6: true-approach loops under a fallback-OFF leg). The
   next arm should either (a) add a direct-counter instrument to
   the sim driver (policy ctx counts surfaced per fight — the
   replay harness already proves ctx reads cleanly) and re-run
   the fleerepair band with the fallback ON, or (b) screen wider
   bands for true-approach loops and replay the best candidate
   the way this arm did. Another unsplit-class band screen is NOT
   the next blank.
2. GUARDRAIL RE-TEST (blocking for any variant landing): the
   8-seed pilot breaches starvation totals (7 vs bar 4) while
   passing player-flagged (1 vs 2) and median (83 vs 74.8). A
   12-seed confirm-band guardrail re-test is owed before the
   variant is landed or killed; the breach must not be read as a
   fallback-mechanism kill (combined variant, chaotic divergence).
3. CORRECTION CARRIED: sim-approachconf-b.md now carries the
   2026-11-04 CORRECTION appendix (99605 seq 2 = flee loop; true
   loops 0). Any future citation of the confirm's "baseline loop
   fight" must use the corrected label.
4. BOARD-FORCING FINDING: on the seq-4 geometry, only blocking
   (3,5) itself reproduces the corpus line — detour boards walk
   around. Future replay boards for this fight need no terrain
   search; (3,5)-blocked is the board.
5. ENGINE NOTE (observation only): tbPlayerMove walks path tiles
   with no intermediate-occupancy check; a path may route through
   a monster tile. Worth an engine look someday; not this arm's
   scope.
6. Index-clobber phantoms (routine, repaired three times this
   run): after each safe-commit.sh commit, the main index showed
   the just-committed files as staged-deleted while the worktree
   files existed untracked. Repaired each time via HEAD-blob
   update-index --cacheinfo; every commit verified correct with
   `git show --stat` + empty `git status` + empty `git diff HEAD`
   before proceeding. The commits themselves were never wrong;
   only the main index lied.

## Proof

`node scripts/test-approachbranch-20261104.js` — ALL PASS (exit
0). Coverage: 99605 seq-2 split (flee 14 / approach 0, old loop
true -> true loop false); 99604 seq-5 split (approach 3 / flee 1,
max true run 3); confirm totals (old 24 -> flee 15, approach 9,
other 0; true loops 0); fleerepair candidate (seq 4: approach 7,
max true 7, post-mark 4 at HP >= 0.35; seq 5: 7/7/4; seq 6: 5/5/2);
fight-start outmatched unit rule (round 1 true, round 2 false);
gated ambiguity (99605 turns -> other 14); determinism.

`node scripts/test-approachbranch-replay-20261104.js` — ALL PASS
(exit 0). Coverage: policy files unmodified vs HEAD; baseline gate
(turns 1-7 all (3,5) No-path approach steps, counters 0); armed
primary (marks 1 at turn 3, repick (4,5) turn 4, strikes turns 5-8,
post-firing run 0); repeat determinism (both primary legs
byte-identical); seq5 (marks 1, repick turn 4); approach-only
(marks 1, repick turn 4); negative controls (cornercut lands
(3,5) turn 1, bothsides detours (2,3) then (3,5), marks 0 both);
priming (unprimed+haven identical to primary; unprimed+node42
flee walk turn 1, marks 0).

Sibling proofs, no regression (this arm changes no policy or src
file, but all three were re-run): `node scripts/
test-approachconf-20261104.js` — ALL PASS; `node scripts/
test-approachfall-20261104.js` — ALL PASS; `node scripts/
test-approachfire-b-20261104.js` — ALL PASS.

Panel proof: 16 legs, 0 instrument errors, scaleMeasured 8/8 both
legs; per-seed tables above are the summarizer's output on the
fixed filter (see Metric review).

## Files

- Evidence (this file): evidence/2026-11-04/sim-approachbranch-a.md
- Prereg: evidence/2026-11-04/sim-approachbranch-a-prereg.md
- Correction appendix: evidence/2026-11-04/sim-approachconf-b.md
  (CORRECTION section, 2026-11-04)
- Branch analyzer + screen + proof: scripts/
  approachbranch-analyze-20261104.js, scripts/
  approachbranch-screen-20261104.js, scripts/
  test-approachbranch-20261104.js
- Replay harness + proof: scripts/
  probe-approachbranch-a-20261104.js, scripts/
  test-approachbranch-replay-20261104.js
- Replay corpus (18 files): evidence/2026-11-04/
  perseed-approachbranch-a/approachbranch-{primary-baseline,
  primary-armed, primary-armed-approach-only, seq5-armed,
  cornercut-armed, bothsides-armed, unprimed-armed,
  unprimed-node42-armed, mapnode42-armed}.{json,txt}
- Panel driver + summarizer: scripts/
  approachbranch-driver-20261104.js, scripts/
  approachbranch-summarize-20261104.js
- Panel corpus (16 files): evidence/2026-11-04/
  perseed-approachbranch-a/approachbranch-s996*-{baseline,armed}.json
- Panel summaries: evidence/2026-11-04/
  approachbranch-panel-baseline.json,
  approachbranch-panel-armed.json
- Variant used verbatim (untouched by this arm): scripts/policies/
  competent-approachfall-b.js, scripts/policies/competent.js
