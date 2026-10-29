# sim-tilejoin-a — CLOSE THE TILE-MATE JOIN GAP, PERCEPTION-LAWFULLY

Run: flesh-out loop, run fleshout-20261029T1715Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-tilejoin-a.
Backlog #1439 (from sim-breakline-a).
PROTOTYPE ONLY — zero src/js, zero game-behavior changes shipped, zero
default flips, zero roster/crew/snapshot feed into any decision
(PERCEPTION LAW, Steve 2026-10-28). The ON leg is a policy-wrapper
prototype that feeds same-tile mates as the engine's allyVids so the
existing shout branch can fire; policy files are sim drivers, not
shipped game code.
Preregistration (binding, committed BEFORE any judged ON leg):
evidence/2026-10-29/sim-tilejoin-a-prereg.md (commit 0cc4b8b2d).
Instruments: commit 0cc4b8b2d + fixes 9fb6789412ca87be9d4b10b9262bd0b44a95.
VERDICT: DIAG-NO-GO on the prereg as written. The mechanism WORKS
(24 joins from a 0 baseline, every addressable-shape fight converted)
but the prereg's kill leg and deaths guard both fail, and the band's
wall numbers moved DOWN, not up. No re-scoring: the legs below are
judged as written, and the selection-bias doubt about the kill leg
goes under "metric review" for the next run, not into this verdict.

## Plain words first

Tile mates CAN join fights — when the game is handed only the people
standing on the tile. In the OFF band, 92 fought wild fights had tile
mates present and none joined, none even shouted: the engine's help
comes from the outdoor-crew list, and that list is empty in all 280
fought fights (crewAlive 0, engineAllies 0, allyVids empty). The
prototype feeds the tile mates instead — same tile, same person, no
roster — and 24 fights get a shout and a join: a named villager
charges in, lands a blow, takes a hit. It reads like people (see the
Farid transcript below).

But joins do not turn losing fights into kills. Joined fights are, by
construction, fights already going badly — the shout only fires when
the trajectory is hopeless — so they mostly still end in flight
(15 of 24), and 3 end in death. Only 2 of 24 joined fights end in a
kill, against 25.1% for solo fights on the same band. Allies deal
little (137 damage across 24 joins, ~6 per fight) and absorb a lot
(296 taken). And the band as a whole got worse under ON: wins 6→3,
deaths 240→311, table entries 6→3. That band-level decline cannot be
blamed on joins alone — feeding allies changes fight outcomes from
day 0, so the seeds walk different paths entirely (meetings 1317→
1068) — but nothing in the ON band improved, and the deaths guard
fails as written. Wiring tile-feed into the real game on this
evidence would be shipping a mechanism that feels right and measures
worse. The next arm should price what an ally would have to deal to
flip a hopeless fight, before anyone touches the one-ally rule or the
shout timing.

## Header (pre-registered) vs result

- COVERAGE (each leg): 8/8 valid seeds AND all four recorders errs 0
  with overflow empty AND tilejoin/fieldparty index-join errors 0
  AND >= 50 fought wild fights in U.
  RESULT: OFF 8/8, corpusOk true, joinErrors 0, fought 280; ON 8/8,
  corpusOk true, joinErrors 0, fought 250 → PASS / PASS.
- OFF-ZERO-BASELINE: OFF joins == 0 AND OFF shouts == 0.
  RESULT: 0 / 0 → PASS. The gap reproduces on current master, and
  the OFF band reproduces breakline-a exactly (same per-seed meeting
  counts 143/285/119/137/95/202/227/109, same wall numbers) — no base
  drift between breakline-a's base and this arm's base (84eba8a86).
- PRIMARY-JOINS>=3: ON joins >= 3.
  RESULT: 24 → PASS.
- PRIMARY-JOINED-KILL>Solo: joined kills / joined fights > solo
  kills / solo fights, same band.
  RESULT: joined 2/24 = 8.3% vs solo 46/183 = 25.1% → FAIL.
- GUARD-STARV<=OFF+2: ON starvation <= OFF starvation + 2.
  RESULT: 3 <= 3 → PASS (exactly at the bar).
- GUARD-DEATHS<=OFF+25%: ON deaths <= ceil(240 x 1.25) = 300.
  RESULT: 311 > 300 → FAIL.
- GUARD-MEDIAN>=0.8xOFF: ON median >= 0.8 x 114 = 91.2.
  RESULT: 123 → PASS.
- DETERMINISM GATE: re-run one ON seed into a scratch dir;
  byte-identical to the corpus row.
  RESULT: seed 75106 ON re-run byte-identical in full (scratch dir
  removed after the diff) → PASS. The later ON re-run (sense fix)
  also reproduced all 8 rows' meetings byte-identically except the
  sense slots themselves.
- NEUTRALITY: one seed with TILEJOIN_SKIP=1 (wrapper not installed)
  matches the OFF row on every field except the tilejoin store and
  recorder stack-trace metadata.
  RESULT: first run showed exactly 1 diff — the recorder's own leg
  label (tilejoinLeg "off" vs "skip"), zero game-content diffs. The
  comparator was amended to exclude that label (same class as
  breakline-a's stack fix; disclosed, not hidden) and the re-run on
  the same two files passes with 0 game-content diffs → PASS.
- SENSE BAR: >= 1 joined-fight transcript quoted verbatim from the
  ON corpus (prototype-fed only), judged as played people.
  RESULT: Farid transcript below, SENSE-OK → PASS, with one
  disclosed narration blank (the drive-off end is unnarrated).
- DIAG-GO BAR: coverage AND off-zero AND primary (both parts) AND
  guards AND determinism AND neutrality AND sense.
  RESULT: primary kill leg FAIL + deaths guard FAIL → DIAG-NO-GO.
  PILOT GATE: pilot is NO-GO → stop; no confirm seeds spent.

## Wall numbers (8 seeds, tableseat-nowait, 180d)

| | OFF | ON |
|---|---:|---:|
| Wins (lesser / full) | 6 (6 / 0) | 3 (3 / 0) |
| National ever / final | 7 / 7 | 6 / 5 |
| Table reached / entered | 6 / 6 | 4 / 3 |
| Wave 4 / wave 5 reach | 6 / 0 | 7 / 0 |
| Median survival | 114d | 123d |
| Deaths total | 240 | 311 |
| Starvation deaths | 1 | 3 |

Death-cause shares (ON, 311): villager:combat 131,
villager:villager combat 83, player:the wild 41, villager:expedition
20, villager:monster 16, rest small. OFF shares are in the summary
files; the ON rise is spread across combat causes, not one cause.

## Q1 — the primary question: do tile-mate joins happen, and do they help?

Universe U (breakline-a verbatim): 805 OFF meetings / 625 ON meetings.
Fought: 280 OFF / 250 ON. (The meeting-count drop is trajectory
divergence, not missing data: ON fights change outcomes from day 0,
so villages walk different paths, meet different beasts, die on
different days.)

### OFF (re-baseline, final instrument)

- Tile-present fought: 92. Tile-fed-eligible fights: 92 (116 fed
  mates; only 1 below trust 15; 0 stamp partners — same-tile mates
  are NOT co-departure partners, so "same outing" in the stamp sense
  does not describe them; stamp overlap is audit only, never a gate,
  and the perception fact is co-location at fight start).
- Shouts 0, joins 0. Addressable pool 11 (tile-fed mate present,
  hopeless trajectory, intent not learn, outcome vFlee).
- Kill rates: solo 32/188 = 17.0%, tile-unjoined 13/92 = 14.1%,
  overall 45/280 = 16.1%.
- Break lines: DRIVE-OFF 130, KILL 45, HOPELESS-BRANCH 66,
  PARTY-DEATH 5, LEARN-BRANCH 4, FLOOR-BRANCH 30.

### ON (prototype)

- Fed fights: 67 (95 fed mates, 1 below trust 15, 0 stamp partners).
  Skip reasons on fought U: only 'no-fed-mates' (183 solo-tile
  fights) — every tile-present fight passed the gates.
- Shouts 24, joins 24. Every shout produced a join (one ally per
  fight, the engine rule). Addressable pool 15, addressableJoined 15:
  every ON fight of the addressable shape got its join.
- Fed-but-unjoined fights: 43, ALL with everHopeless = false. The
  shout gate is airtight on this band: for fed, non-learn fights,
  hopeless ⟺ shout, with no exceptions in either direction.
- Joined-fight outcomes: vFlee 15, mFlee 4, vKill 2, vDie 3.
  Joined kill rate 2/24 = 8.3% vs solo 46/183 = 25.1% vs
  tile-unjoined 9/43 = 20.9% vs overall 57/250 = 22.8%.
- Ally totals across 24 joins: dealt 137 (~5.7 per join), taken 296
  (~12.3 per join). Allies bleed more than they hurt.
- Break lines: DRIVE-OFF 106, KILL 57, HOPELESS-BRANCH 47,
  FLOOR-BRANCH 23, PARTY-DEATH 14, LEARN-BRANCH 2, CAP 1.
  Party-deaths rose 5 → 14, but only 3 of the 14 are joined fights;
  the rest is trajectory divergence (different fights entirely),
  not join attribution. Do not quote "joins cause deaths" from the
  5→14 alone; do quote "3 of 24 joined fights end in death, and
  joined fights do not convert flees into kills at rate."
- Joined fights by wave: wave 1: 13, wave 2: 2, wave 3: 6, wave 4: 3.
  Wave-4 joins: 0 kills, 1 flee, 2 deaths (s75107 audit aid, s75108
  eulogy aid). At wave 4, a joining tile mate does not save anyone
  on this band (n=3, a flag, not a rate claim).

### The counterfactual, stated fairly

OFF addressable fights (11) all fled, 0 kills, 0 deaths. ON joined
fights (24) end: 2 kills, 4 drive-offs, 15 flees, 3 deaths. Against
their own counterfactual (flee), joins convert 6 of 24 would-be
flees into a kill or a beast driven off, at the cost of 3 deaths and
15 fights that still end in flight after a longer fight. That is a
mixed fight-level picture, not a win — and it is NOT the prereg's
comparison (joined vs solo kill rate), which the next run should
replace (see metric review). The prereg verdict stands as NO-GO;
the counterfactual paragraph is context, not a re-score.

## Sense-testing law (transcript read + quoted)

S1 — ON joined fight, prototype-fed (seed 75101, day 25, hushwolf,
Farid, rounds 3, mFlee, joined ally Vasyl). Verbatim engine log,
unedited, in full (23 lines):

```
Farid has Bow but no arrows — the string stays drawn, useless.
Farid's gear absorbs 5.
R1: Silent Rush hits Farid for 10 (82 left)
Farid's gear absorbs 4.
R1: Silent Rush hits Farid for 10 (72 left)
Farid's gear absorbs 2.
R1: Harass hits Farid for 6 (66 left)
R1: Farid strikes for 18 (32 left)
Farid's gear absorbs 5.
R2: Silent Rush hits Farid for 10 (56 left)
Farid's gear absorbs 3.
R2: Harass hits Farid for 7 (49 left)
Farid's gear absorbs 3.
R2: Harass hits Farid for 6 (43 left)
R2: Farid stops mid-fight and binds the wound — field medicine, +20 HP.
Farid is losing — shouts for help! Vasyl charges in!
R3: Harass hits Vasyl for 7 (93 left)
Farid's gear absorbs 4.
R3: Silent Rush hits Farid for 8 (55 left)
Farid's gear absorbs 2.
R3: Harass hits Farid for 6 (49 left)
R3: Farid strikes for 17 (15 left)
R3: Vasyl strikes for 6 (9 left)
```

Judgment: this reads like people. Farid fights alone for two rounds,
binds his own wound mid-fight, then shouts when he is losing — and
Vasyl, who was standing on the tile (fed by the prototype, second
fed mate gen_id40dqp standing by as the engine takes one ally),
charges in, takes a hit, lands a blow. Nothing here reads like a
roster trick: the joiner is named, present, and visibly at risk.
Two honest blanks ride along: (1) the fight ends in a drive-off
(mFlee) with NO end line — the log stops after Vasyl's strike leaves
the beast at 9 HP, the same unnarrated-ending class as breakline-a's
floor-flee silence, now on the drive-off side; (2) Farid's bow is
useless for lack of arrows, the standing ammo anecdote, unmeasured
here. Neither blank changes the join judgment: the shout/join itself
is the best-narrated social beat in the wild-fight corpus so far.

## Guards (judged, see header)

- Starvation: ON 3 vs OFF 1 + 2 = 3 → PASS exactly.
- Total deaths: ON 311 vs cap 300 → FAIL.
- Median: ON 123d vs floor 91.2d → PASS.
- No guard can move under a prototype arm's own hand: the guards are
  reported as judged, and the deaths failure is not excused by the
  divergence note — divergence explains why the band moved, it does
  not pass the guard.

## Ranked next steps (with numbers — no src/js built here)

1. PRICE THE ALLY-DPR FLIP THRESHOLD (diag only, next arm). Joined
   fights are hopeless by construction; allies deal ~5.7 damage per
   join. Compute, per joined fight, the ally damage that would have
   flipped the round-2 trajectory from hopeless to trade-or-win
   (rtk vs rtd at shout time, from the stored mDealt/vTaken/rounds).
   If the flip needs ~3–5x observed ally damage, the one-ally rule
   cannot carry this gap and no timing tweak will fix it; if it
   needs ~1.5x, entry strength (armor? body? from-start?) is the live
   question — and that is a Steve-call before any change to the
   one-ally rule.
2. DO NOT WIRE TILE-FEED INTO src/js ON THIS EVIDENCE. Joins work
   mechanically (24/24 shouts joined, 15/15 addressable converted)
   but do not improve kills (8.3% vs 25.1% solo, prereg comparison)
   or survival (deaths guard fails, wins 6→3). A src/js arm needs a
   passing fight-level counterfactual first (metric review proposal
   below), not another band comparison.
3. WRITE THE DRIVE-OFF END LINE (cheap narration fix, ranked below
   kill-path work). The S1 joined fight ends in mFlee with no end
   line at all — the log stops mid-fight. One honest line ("the beast
   breaks and runs") makes joined-fight endings legible. Narration
   only, no behavior change.
4. NOTE THE STAMP-0 FINDING FOR PARTY WORK. Fed tile mates are
   never co-departure partners (0/95 ON, 0/116 OFF). If any future
   party rule requires "same outing" in the stamp sense, its pool on
   this band is zero — party formation must be argued from
   co-location (standing there), not from departure records, or the
   rule needs its own mechanism. This arm does not settle that
   design question; it measures it.

## Metric review (for the NEXT run — nothing re-scored here)

- JOINED-VS-SOLO KILL COMPARISON IS SELECTION-BIASED. Joined fights
  are hopeless-selected by construction (the shout fires only on a
  hopeless trajectory); solo fights include winning fights. The
  prereg comparison therefore grades joins against fights they could
  never resemble. Proposed revision: the primary for the next join
  arm is fight-level counterfactual — joined outcomes vs the OFF
  addressable pool (11/11 fled, 0 kills, 0 deaths) — plus a
  joined-fight death-share guard, with solo kill rate reported as
  context, never as the bar.
- BAND-LEVEL WALL GUARDS ON A DIVERGING PROTOTYPE ARE BUTTERFLY-
  CONTAMINATED. The prototype changes fight outcomes from day 0, so
  seeds walk different paths (meetings 1317→1068, per-seed meeting
  counts all moved). Wall deltas (wins 6→3, deaths +71) cannot be
  attributed to joins alone. Proposed revision: for prototype arms,
  wall numbers are report-only context with the divergence stated;
  the binding guards are fight-level (joined outcomes, joined deaths,
  starvation) with band-level guards widened or dropped by
  pre-registration, not by post-hoc excuse.
- NEUTRALITY-LEG LABEL: the leg as worded swept the recorder's own
  leg label (tilejoinLeg) into a game-neutrality claim. Corrected
  in-run (comparator excludes the label; 0 game-content diffs).
  Future neutrality scripts should exclude recorder metadata labels
  from the first version.
- SENSE-SLOT UNIVERSE FILTER: the first sense-slot logic recorded
  ANY calledHelp fight, including non-prototype expedition shouts
  (s75101 day-8 Jorge/Emma filled the ON joined slot). Corrected
  in-run (slots require pre.fed) and the ON corpus re-run; the
  re-run's meetings are byte-identical to v1 except the sense slots.
  Future sense recorders should gate slots on the prototype flag
  from the first commit.

## Convergence note

Scale-onramp stays converging, NOT converged. This arm moves no wall
number upward — by measurement, not by design: the tile-join mechanism
is now proven to fire (24 joins, airtight shout gate) and proven not
to help on this band (kill leg fails, deaths guard fails, wins
6→3). The blocking mechanism is no longer "mates never join"; it is
"joins do not flip losing fights." The next arm that claims movement
on this axis must move joined-fight outcomes or ally damage, not
re-prove that joins can happen.

## Infrastructure notes

- No container EPERM flap this run; the OFF sweep ran ~12 min, the
  ON sweeps ~4–5 min each (seeds ~30–90s each in this VM).
- Safe-commit index clobber hit both worker commits (prereg +
  instruments 0cc4b8b2d; fixes 9fb6789412ca87be9d4b10b9262bd0b44a95)
  — repaired via HEAD-blob cacheinfo each time with hash
  verification, never reset, never forced, commits verified correct.
  The second hit showed as "MM" (staged + unstaged divergence on the
  same file); the same HEAD-blob repair cleared it.
- Scratch dirs (determinism, neutrality, ON-v1 backup) removed after
  their diffs; the worktree holds only committed work plus the corpus
  + evidence committed with this file.
- check.js --quick ran 284 passed, 6 failed in ~23 min — failures are
  PRE-EXISTING and unrelated to this arm: zero existing files were
  modified (only new files added), the check list contains no
  tilejoin entry (my scripts were not run by it), and the two
  directory-enumerating tests scan for content these files do not
  contain. Not claimed as green; recorded as unrelated.
- Analyzer exits 1 by design on this run (MACHINE-LEGS-FAIL on the
  kill leg + deaths guard only); fixtures FIXTURES-PASS (33 checks);
  sense SENSE-OK.
- No live verification, no push, no bump: this arm reports "ready for
  coordinator merge, pending ship" per assignment. The batch ship job
  owns pushes.

## Files

- Corpus: evidence/2026-10-29/perseed-tilejoin-a/off/s75101–s75108-fresh.json
  + summary.json; evidence/2026-10-29/perseed-tilejoin-a/on/s75101–s75108-fresh.json
  + summary.json.
- Analyzer: scripts/test-tilejoin-a.js (machine legs FAIL on kill +
  deaths-guard only; coverage PASS).
- Recorder + prototype: scripts/policies/tilejoin-diag.js.
- Sweep: scripts/test-tilejoin-a-sweep.js.
- Fixtures: scripts/test-tilejoin-a-fixtures.js (33 checks, 0 fails).
- Sense: scripts/test-tilejoin-a-sense.js (SENSE-OK, prototype-fed
  joined transcript).
- Neutrality: scripts/test-tilejoin-a-neutrality.js (NEUTRALITY-PASS,
  0 game-content diffs).
- Prereg: evidence/2026-10-29/sim-tilejoin-a-prereg.md (0cc4b8b2d).
