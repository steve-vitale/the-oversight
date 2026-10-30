# Journey social r74 — RUN NOTE (lane B, 2026-10-30)

Leg 5 (social life), seeds 6401–6404, 140d death-aware, competent
policy, all linger, seeded-speaker steering ON. Base master 6cec51d44
(r73 landed by this run first, see Recovery below).
Rotation-b read 5 at run start, advanced 5 -> 6 at closeout.
Driver: scripts/journey-social-r74-20261030.js (r73 verbatim except
the r74 wedge + funnel additions). Wedge:
scripts/journey-social-r74-outing-wedge.js (r73 fork; DRIVER-POLICY
changes only: raw kept, d=1 walk fallback, stuck escalation,
barrenKind, position history). Proof test
scripts/test-journey-social-r74-outing-wedge.js 26/26 on SEED=42 and
SEED=7 BEFORE seeds ran. Smoke 6405 (30d) PASS. Zero src/js changes.

## Recovery performed by this run (before r74 played)

- Stale-lock recovery: the lock file held run_id 2026-10-30T06:58:23Z
  with NO registered worktree and no heartbeat in REGISTRY.json — the
  previous run is dead by the body's rule no matter how fresh the lock
  looks. Lock deleted, this run's lock created.
- r73 orphan landing: the previous Lane B social run had committed
  r73 (cb1c22c6a) to branch journey2-social but never merged it, and
  its rotation write never stuck (r73's note claims "advanced 5 -> 6"
  but the file still read 5). This run rebased that branch onto master
  (zero file overlap with adafed935, zero src/js) and merged it
  --ff-only as 6cec51d44, merged locally pending ship. r74 then played
  leg 5 because the rotation file still said 5 — the file is the
  authority, not the orphan note's claim.

## Pre-registration

See `prereg.md` in this directory (written before any seed ran).
Bindings judged as written; no metric re-scored.

## Pooled funnel (event-level truth, not the snapshot)

| seed | days | alive | offers | forageOffers | accepts | starts | startBlocked | forages | talks | delivers | deliver kcal |
|------|------|-------|--------|--------------|---------|--------|--------------|---------|-------|----------|--------------|
| 6401 | 140 | 8 | 40 | 17 | 17 | 7 | 18 | 6 | 6 | 6 | 2,285 |
| 6402 | 125 (village lost) | 0 | 27 | 9 | 9 | 4 | 12 | 4 | 4 | 2 | 2,070 |
| 6403 | 141 | 9 | 39 | 3 | 3 | 1 | 3 | 0 | 0 | 0 | 0 |
| 6404 | 91 (village lost) | 0 | 34 | 6 | 6 | 4 | 3 | 4 | 4 | 4 | 1,980 |
| POOLED | | 17 | 140 | 35 | 35 | 16 | 36 | 14 | 14 | 12 | 6,335 |

Start rate 16/35 accepts (45.7%), vs r73's 41% — same band, no
mechanism claim. Delivers 12/16 starts (75%).

## Verdicts (§14)

- B1 (travel + escalation): PASS as a measurement binding, NO-GO as
  a remedy. 35/35 forage-travel-blocked entries carry walkAttempted,
  pathFound, and a blockage read. Escalation coverage is complete:
  Jorge (6403) ended at exactly stuckDays 7; Elena (6402) end-blocked
  at 7 and 14. BUT the walk itself arrived 0/35 (see Q1) — the d=1
  walk as built does NOT dissolve the wall.
- B2 (kept raw): PASS. Zero deliver entries where the game line says
  the promise was missed while the recorded kept value reads true
  (the r73 Jesse contradiction is gone: missed delivers now record
  kept='broken'). keptMatched == keptMatchedStrict on all seeds;
  raw values 'broken' and 'released' surface as themselves.
- B3 (completes): PASS. Event completes 12 >= snapshot completes 2
  (per-seed: 6>=0, 2>=0, 0>=0, 4>=2). The snapshot undercounts by
  10; the event count is the true one.
- B4 (position history): PASS on classification, with a stated
  caveat. 12/12 no-micro-pos dawn blocks classify: ever-before 0,
  never-before 12, same-day-ambiguous 0. CAVEAT: "never" is relative
  to early-day snapshots (recordPosHistory runs in daily() before the
  day's movement); a mid-day position after the player moves is not
  captured by this instrument.
- B5 (people): PASS. 5 reads (below), 3 outing-related, 0
  fabricated-history flags, 0 weak endings. One repeated mechanical
  tell (double invite lines, r73 noted it too), not a break.
- Guardrails (report-only): pooled dry 407/1530 = 0.266, in band
  [0.20, 0.40] (per-seed 0.252 / 0.433 / 0.126 / 0.282; 6402 alone is
  above band, the guardrail is pooled as in r73). Convos ending on a
  dry line 2/1530. Moots convened 0 on all four seeds (watch item
  carried from r73: the driver policy never convenes a moot).
- NO-REGRESSION: check.js --quick 284 passed, 6 failed in 485s —
  the same six as r73, named: test-measurement-proof-update,
  test-measurement-workflow, test-mobile-combat-cadence,
  test-occupation-panels, test-phone-frame-proof,
  test-establishment-r20-fixes-20261020. Zero attributable: this run
  touches no src/js, and none of the six is in the social/outing area.

## Q1: does the d=1 walk dissolve the travel wall? NO — and why is now known

- 35 travel-blocked entries, geometric path found 35/35, arrivals 0.
  The walk's BFS ignored the travelTargets gate: travelTo returns
  null for any destination not in travelTargets(), and diagonal steps
  count as Manhattan d=2, so they are offered only when the tile is
  revealed. An unrevealed diagonal step refuses at step 0 (33 of 35
  entries read walkSteps 0). The 2 partial steps (Elena d27/d35)
  prove orthogonal d=1 steps DO work — the walk advances one square,
  then dies on a diagonal or guarded approach.
- Destination blockage reads null on all 35: the destination itself
  is never the refuser; the intermediate-blockage check inside
  travelTo is. A real player faces the same geometry — the fix is a
  TARGET-AWARE walk (step only onto tiles in travelTargets() from the
  current position, plus the approach-blockage probe), not a longer
  geometric path. That is r75's instrument, not a claim made here.
- Barren split (13 forage-barren days): node-barren 5, travel-blocked
  8, no-target 0. Node-barren days still split anchor-empty vs
  tile-barren as in r73 (targetCanForage true 9 / false 4 on
  node-barren entries); cell-blocked 45, of which 40 are the honest
  "Nothing left to take here today" line.

## Q2: does ending a stuck outing free the gate? ENDING CLOSES THE OUTING; POST-ENDING STARTS UNPROVEN, and a second wall stands beside it

- Jorge (6403): started d21, 7 travel-blocked barren days (d21–27),
  ended d28 via the game's own forage_end at home (0 kcal, promise
  honestly broken, forageRun.returned=true). The ending action works
  and closes the outing. BUT post-ending starts are NOT proven here:
  6403 has zero start attempts after d28 (no later forage favors),
  so "the gate is freed" is mechanism reasoning (the gate reads live
  companions; a returned outing is not live), not a measured
  post-ending start. Valeria's d23 attempt blocked on no-micro-pos
  while Jorge was still live — adjacency is checked before the gate,
  so it masks the gate rather than testing it. 6402's Ursula start
  on d65 likewise follows Elena's outing leaving the live set via
  ledger/bearer exit, not via an ending. r75 must arrange (or catch)
  a genuine post-ending start before claiming the gate is freed.
- Elena (6402): started d35, foraged, then stranded away from home:
  forage-no-home d37–43 (hopHome fails the same way the walk does —
  it picks by blockage probe only, and its hops get refused), then
  end-blocked 'no-home' at stuckDays 7 (d44) and 14 (d51). Counting
  continues silently on the throttle days (15–19, d52–56), then the
  outing leaves the live set (ledger/bearer exit) before day 21 comes
  due — no escalation is missed, the outing simply stops being live.
  hopHome needs the same target-aware fix as the walk.
- 6401's Leo outing ends the run at stuckDays 2 — mid-stall, not a
  missed escalation (threshold 7 never reached).

## Q3: what does position history say about no-micro-pos partners?

- All 12 blocks are the clean case: player at Haven, partner node at
  Haven, same door side, not away — yet no micro position, and none
  of the 12 partners held a position on any earlier early-day
  snapshot.
- Mechanism, read in source (game.js ensureVillagerPositions): grid
  positions are per-node and assigned only when the player moves
  within a node, arrives at a node, or starts a fight — never at
  dawn. npcSetNode and door-side flips DELETE positions. So a partner
  who arrives at Haven overnight, or flips door side overnight, has
  no square at dawn until the player steps. The dawn wedge attempts
  starts before any step that day, so it meets the positionless state
  head-on. r75's test: a dawn step-first retry (one micro-step to
  trigger ensure, walk adjacent if needed, retry the start inside
  dayPart 0). No fix is proposed here beyond that test — per r73's
  rule, the instrument comes before the fix.
- Dawn-block decomposition (36 blocked): no-micro-pos 12 (33%),
  away 12 (33%), node-elsewhere 10 (28%), non-adjacency 1, micro-far 1.
  Door-side 0 again. Partner-away and no-micro-pos are now tied as
  the dominant blocks.

## Q4: the true kept/deliver picture with raw kept

- 12 delivers / 16 starts (75%), 6,335 kcal into pantries, all 12
  with same-day talk beats. Snapshot kept counts only favors that
  survive into the end ledger (6404: 2); delivered favors drop out
  of the snapshot, so snapshot kept is not a kept count at all.
- Broken promises read 'broken' (e.g. Priya 6401, Victor 6401,
  Kavya 6402, Amal 6404); one 'released' (Ursula 6402-64-18: the
  partner left the village, so the promise is released, not broken
  — betrayal.js promise-release on removal). Raw recording is what
  makes that distinction visible.

## Village assessment (plain words)

- 6401 (140d, 8 alive): the social village. 33 deep bonds, avg trust
  81. Ivy and Ursula are repeat partners; 6 delivers, 2,285 kcal.
  Deaths are the wild and monsters, as usual.
- 6402 (125d, village lost, 0 alive): the short village with the
  biggest single haul — Elena's 1,170 kcal day. Kavya never starts
  (no-micro-pos, then away). The social instrument dies with the
  village, as it should.
- 6403 (141d, 9 alive): the steady village, thinnest forage offers
  (3 all run). Jorge's stuck-then-ended outing is the whole outing
  story; 28 deep bonds, trust 75. The village is bonded and
  organized at the horizon despite almost no outings.
- 6404 (91d, village lost, 0 alive): the clean village. Chloe and
  Pavel outings start, forage, talk, and deliver the same day
  (4 delivers, 1,980 kcal); the snapshot kept count works here only
  because two favors survive into it.
- Invitations still sometimes taken, as ruled: party 41/80 (51%),
  lure 10/22 (45%).

## People check (sense reads, full transcripts)

- Ivy, 6401 d6 (favor ask, outing-related): "The meadow edge, west of
  the creek, dawn. Bring a pack." Concrete plan, closes on the plan
  ("First light. The pantry's counting on us."). Real.
- Chloe, 6404 d13 (favor ask, outing-related): "I asked Austin about
  the pantry run — Austin's gone. Still need hands. Are you in?"
  The ask survives a death and says so. The double invite lines
  ("Want to come with us?" / "Want to come with me?") read slightly
  mechanical, as in r73, but the answer is characterful ("Someone
  should watch your back. Might as well be me."). Real.
- Jorge, 6403 d20 (favor ask, outing-related): "The south slope
  below the meadow, before the dew dries. Pack and knife. We travel
  light." Lonely mood, own place, roles menu handled as the game's
  role UI. Real — and this is the outing that later sticks and gets
  ended, so the ask's promise and its ending are one story.
- Ursula / Priya / Teo deliver beats, 6401 (outing-related): exact
  split hauls ("180 kcal from you, 180 kcal from Ursula — 360 kcal
  into the pantry"), and the missed-promise lines are honest
  ("The promise was missed; unloading does not earn kept-promise
  credit."). The game line and the raw instrument now agree.
- Elena, 6402 d27 (outing-related): "This is the part I like. Just us
  and the green." / 1,170 kcal unload. The big haul lands as a
  moment, not a number.
- 0 fabricated-history flags, 0 weak endings. PEOPLE PASS.

## Reachable / fun / winnable (leg 5)

- REACHABLE: yes — starts 46% of accepts, delivers 75% of starts.
  The remaining walls are partner-away at dawn, the dawn
  no-micro-pos gate (now with a named test), and travel/hopHome
  refusals (now with a named instrument fix). Ending a stuck outing
  is reachable and closes it; whether the next outing then starts is
  still unproven (see Q2) and is r75's to catch.
- FUN: yes, with the honesty caveat — the favor ask, dawn start,
  trail talk, and split-haul deliver form a complete little story
  that pays in food. The miserable loop is the 7 wasted days before
  an ending (Jorge) and the stranded-away loop (Elena); a player who
  knows to step at dawn and end at home avoids both, which is why
  those two moves are the next measurements, not complaints.
- WINNABLE: not this leg's question to close — social life feeds the
  win (86 deep-2 bonds pooled, invitations ~50%, 6,335 kcal of
  outing food) and two of four villages were alive, bonded, and
  organized at the horizon.

## Telemetry deviation check (step 14)

Ran `node scripts/telemetry-check.js` against
`telemetry-baselines/social.json` over the four per-seed JSONs
(metrics l3.bonds, l3.deepBonds, dryRate, l3.mootsConvened, alive).
- LOUD `l3.deepBonds disappeared: baseline 168 -> current 0`:
  NAME ARTIFACT (same as r73) — current field is l3.deep2 (pooled
  86), not deepBonds. Not a bug.
- LOUD `l3.mootsConvened disappeared: baseline 7 -> current 0`:
  PATH ARTIFACT (same as r73) — current field is top-level
  mootsConvened (0 on all four seeds, itself a watch item above).
  Not a bug.
- LOUD `alive newly appeared: baseline 0 -> current 17`:
  BASELINE-SHAPE ARTIFACT (same as r73) — pooled alive 17 =
  8+0+9+0. Not a bug.
- l3.bonds and dryRate: quiet.
- Baseline NOT rolled forward: the stored baseline is a
  different-era shape, and rolling it would launder the artifacts
  into the baseline.

## Metric review

- The pre-registered B1–B5 verdicts all held as written; no metric
  was re-scored. B1's split verdict (measurement PASS, remedy NO-GO)
  is the run's main discipline point: the escalation binding passed
  while the walk remedy failed, and the two must not be conflated.
- Revisions proposed for the NEXT run (r75), not applied
  retroactively:
  1. Target-aware walk: BFS steps only onto tiles in travelTargets()
     from the current position, plus the approach-blockage probe.
     Same fix for hopHome (its hops are refused the same way).
  2. Dawn step-first retry: on a no-micro-pos dawn block, one
     micro-step (trigger ensureVillagerPositions), walk adjacent if
     a position appears, retry the start inside dayPart 0; log
     whether the step assigned a position and whether the retry
     started.
  3. Position-history snapshots stay early-day by design; r75 must
     label ever/never as snapshot-relative, or add a mid-day
     snapshot after the player's first move.
  4. Moots stay a watch item: 0 on all r73+r74 seeds combined.
  5. The 7-day end-blocked log throttle is kept; r75's analyzer
     must account for silent counting days (Elena d52–56) when
     judging escalation coverage.
  6. Catch a genuine post-ending start: r74 proves the ending
     closes an outing but never measures the next outing starting
     after one — r75 must not claim gate-freeing without it.

## Files

- Driver: scripts/journey-social-r74-20261030.js (r73 verbatim +
  r74 wedge + funnel additions; zero game-behavior change in src).
- Wedge: scripts/journey-social-r74-outing-wedge.js (raw kept, d=1
  walk fallback, stuck escalation, barrenKind, position history).
- Proof test: scripts/test-journey-social-r74-outing-wedge.js
  (26/26, SEED=42 and SEED=7, before seeds ran).
- Analyzer: scripts/analyze-journey-social-r74-outing-20261030.js.
- Evidence: evidence/2026-10-30/r74/ (prereg.md, this note,
  per-seed JSONs, transcripts/, summaries/,
  r74-analysis.txt, r74-verdicts.json).
- No src/js changes. No [needs-eyes] (no feel/combat/UI change for
  Steve to playtest; the findings are measurement + instrument
  corrections, as in r73).
