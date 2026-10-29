# sim-tilejoin-a — PREREGISTRATION (binding, committed BEFORE any judged ON leg)

Run: flesh-out loop, run fleshout-20261029T1715Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-tilejoin-a.
Backlog #1439 (from run fleshout-20261029T1615Z arm sim-breakline-a,
evidence/2026-10-29/sim-breakline-a.md — read first).

Assignment: CLOSE THE TILE-MATE JOIN GAP, perception-lawfully.
Breakline-a measured: 92 fought wild fights with tile mates present,
0 joins, 0 shouts; kill rate no better with mates present (14% vs
17%). Decomposition of that corpus before this run: the engine's crew
input was EMPTY in all 280 fought wild fights (crewAlive 0,
engineAllies 0, allyVids empty) — patrol/resolve callers feed
_outdoorCrew and that snapshot is empty by fight time. Addressable
pool on that corpus: 11 fought fights with a tile mate present, a
hopeless trajectory, intent not learn, outcome vFlee. (15 more
tile-present hopeless flees were learn-intent and are NOT addressable:
the learn branch withdraws regardless and the shout branch excludes
learn intent.)

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law; wave-4 bands
damage 35–95, HP 850–1500, pierce 0.2–0.5; wave-4 gate standing >= 100
plus combat-readiness bars; waves 1–3 gates day/ledger). No
CANON-registered doc covers field-fight joins — the mechanism below
is derived from code, stated exactly so it can be checked
(src/js/fieldFights.js fieldFight; src/js/party-wiring.js
villagerFightAllies; src/js/game.js resolvePatrol /
resolveWildMonsterEncounter):

- The shout branch fires only at round >= 2 when the trajectory is
  hopeless, help has not been called, allies > 0, allyVids non-empty,
  and intent is not learn: the fighter shouts, one ally charges in
  (rec.calledHelp, rec.allyVid). A second shape, allyFromStart, joins
  from round 1 — NOT used by this prototype (see below).
- Patrol/resolve callers build allies from _outdoorCrew (trust-ordered,
  cap 2 vids). villagerFightAllies (agency encounters only) builds
  from live outdoor assignments + adjacent-node earshot with a trust
  floor of 15. Neither caller feeds the fight tile.
- PERCEPTION LAW (Steve 2026-10-28, binding): villagers know who's
  around only through their own senses. This prototype feeds ONLY
  villagers standing on the fight tile at fight start (pure nodePos
  read, the fieldparty tile list), trust-ordered like the existing
  callers, cap 2 like the engine. NO roster feed, NO crew feed, NO
  snapshot feed. Anything list-fed gets reverted — this arm builds
  none of it.

## Scope (binding)

Policy/instrumentation ONLY, zero src/js. The ON leg is a PROTOTYPE
measurement: a policy wrapper feeds tile mates as the engine's
allyVids so the existing shout branch can fire. Policy files are sim
drivers, not shipped game code — a GO here is a DIAG-GO (the tile-only
shout shape works and helps; the src/js wiring arm is the follow-up),
never a landed game change. If the prototype cannot produce joins, the
verdict is DIAG-NO-GO with the counts and the exact src/js shape the
next arm needs. That is a successful outcome, not a failure.

## Fresh band (this arm's own sweeps, base code)

- Base commit: 84eba8a86 (worktree HEAD at registration; note any move
  in the evidence file).
- Seeds 75101–75108 (8, the pilot band; the breakline-a / w4dpr2
  8-seed subset verbatim, so wall numbers are comparable),
  scripts/policies/tableseat-nowait.js VERBATIM, LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1, FIELDPARTY=1, W4DPR=1, BREAKLINE=1 (fieldparty /
  w4dpr / breakline recorders reused VERBATIM, never edited), PLUS
  the new tilejoin recorder/prototype
  (scripts/policies/tilejoin-diag.js).
- OFF leg: TILEJOIN unset — recorder only, never modifies opts.
  ON leg: TILEJOIN=1 — prototype feeds tile mates (gated, below).
  180d death-aware (runDays stops on death/win, as in predecessor
  sweeps), competent policy (tableseat-nowait wraps leanlinkrescue
  courtship).
- WHY 8 SEEDS: the assignment fixes the pilot band (pilot gate: 8
  seeds before any confirm spend). No 12–16 seed confirm is spent on
  an invisible effect; if the pilot is NO-GO or INSUFFICIENT-DATA,
  the run stops there.

## OFF re-baseline (step 1, unjudged — establishes the CURRENT
## tile-mate fight count on current master before any ON judgment)

The breakline band no longer reproduces on current master (build-armor
drift, backlog item). The OFF leg below IS the re-baseline; its numbers
are reported as baseline context, never used to tune the thresholds
in this prereg (thresholds are fixed by the assignment brief).

- OFF baseline (filled after the OFF sweep, before the ON leg;
  final instrument, fixed fed rule — see amendment note above):
  U meetings 805, fought 280, tile-present 92, tile-fed-eligible
  fights 92 (116 fed mates, only 1 below trust 15, 0 stamp partners
  — same-tile mates are NOT co-departure partners; stamp overlap is
  audit only, never a gate), shouts 0, joins 0, kills 45 (solo
  32/188 = 17.0%, tile-unjoined 13/92 = 14.1%), addressable pool 11,
  break lines DRIVE-OFF 130 / KILL 45 / HOPELESS-BRANCH 66 /
  PARTY-DEATH 5 / LEARN-BRANCH 4 / FLOOR-BRANCH 30. Wall: won 6/8
  (full 0), national ever/final 7/8, table 6/8, entered 6/8, wave 4
  in 6/8, wave 5 in 0/8, median 114d, starvation 1, deaths 240.
  The OFF band reproduces breakline-a exactly (same per-seed meeting
  counts 143/285/119/137/95/202/227/109 and same wall numbers), so
  no base drift between breakline-a's base and this arm's base
  (84eba8a86) on this band.

## Prototype feed gates (fixed before judging)

A fight is FED only when ALL hold (scripts/policies/tilejoin-diag.js
shouldFeed; anything else records a skip reason and delegates the
original opts untouched):

- Caller in {resolve, patrol, aid} (stack classifier, same as
  fieldparty-form-diag), channel field (not raid, not expedition).
- Wave 1..4, monster tile known (live tx/ty present).
- Fighter is NOT the scholar (vid !== villagerId, vid !== 'player').
- NOT cornered, NOT allyFromStart (muster/aid paths keep their own
  ally logic; the prototype never overrides a working ally feed).
- Original allyVids EMPTY (never clobbers crew-fed allies).
- At least one fed-eligible tile mate: roster member, not the
  fighter, nodePos exactly equals the monster tile, NOT known dead
  (deadKnown !== true; known-dead entries are recorded but never
  fed). AMENDMENT NOTE (instrument correction, made BEFORE this
  prereg was committed and before any ON leg): the first draft
  required deadKnown === false, but the OFF re-baseline showed the
  dead-status lookup resolves to false for only 11/149 tile entries
  while 57/57 distinct null-deadKnown tile mates fight elsewhere in
  their seed — null is the normal living case (vp objects carry no
  `dead` property while living), not a corpse signal. The !== true
  rule matches breakline-a's tile-present definition and the engine
  callers' own liveness test (roster membership). With the strict
  rule the addressable pool would have been 1 fight, an artifact of
  the lookup, not of the game.
- Fed mates are trust-ordered (village trust desc, default 10),
  cap 2. NO trust floor in the prototype, deliberately: the measured
  question is "does feeding tile mates produce joins/kills"; each fed
  mate's trust is recorded so the next arm can price a floor
  (party-wiring answer_floor is 15) from the fed set.
- NO allyFromStart: the legitimate shape is the round>=2 hopeless
  shout, not a round-1 muster join.
- DISCLOSED SIDE EFFECT: opts.allies also feeds the engine's
  holdBonus (+0.04 per ally, cap 0.12 on vBreak) — ON both enables
  shouts AND steadies the flee floor slightly. The analyzer reports
  joins as the primary effect; holdBonus is a confound of at most
  0.12, never hidden.
- The opts object passed to the engine is a CLONE; the caller's opts
  is never mutated. No RNG draws, no game writes outside the fight
  the engine itself resolves.

## Universe and metrics (fixed before judging)

- UNIVERSE U: breakline-a verbatim — fieldparty channel == 'field',
  caller in {resolve, patrol, aid}, wave 1..4, leader NOT the scholar.
  FOUGHT = rounds >= 1. Tile-present = tilejoin tileAll length >= 1
  (breakline def: nodePos == monster tile, deadKnown !== true).
  Solo = fought U with tileAll empty. Joined = tilejoin
  joinedAllyVid non-null.
- PRIMARY METRIC: tile-mate joins across the pilot band (ON leg).
  GO: joins >= 3 AND joined-fight kill rate above solo-fight kill
  rate on the same band (joined kills / joined fights > solo kills /
  solo fights).
- SECONDARY: shouts (ON), addressable-pool conversion (of the OFF
  addressable shape — tile-fed mate present, hopeless trajectory,
  intent not learn, outcome vFlee — how many shout/join under ON),
  tile-unjoined kill rate, overall kill rate, break-line shift
  (breakline store), fed-mate trust distribution (how many fed mates
  below 15), fed stamp-partner overlap (audit: same-outing signal),
  skip-reason counts (which gate bites most).
- WALL NUMBERS (both legs): wins lesser/full, national ever/final,
  table reached/entered, wave 4/5 reach, median survival, death-cause
  shares.
- GUARDS (relative, declared before judging — the old 120d absolute
  bar is unpassable on win-ending bands and is NOT used):
  - G1 starvation: ON starvation deaths <= OFF starvation + 2.
  - G2 deaths: ON total deaths <= ceil(OFF total deaths x 1.25).
  - G3 median: ON median survival >= 0.8 x OFF median survival.
  Any guard missed -> NO-GO even if the primary passes.
  NOTE on the brief's "arm-only deaths" phrase: no death cause tags
  tilejoin fights, so there is no operational arm-only death count on
  this band; G2 (total deaths) is the operational guard, and
  death-cause shares are reported for inspection.
- DETERMINISM GATE: re-run one ON seed into a scratch dir; its row
  JSON must be byte-identical to the corpus row. Scratch dir removed
  after the diff.
- NEUTRALITY (recorder-only mode changes no game state): one seed run
  with TILEJOIN_SKIP=1 (wrapper not installed) must match the OFF
  corpus row on every field except the tilejoin store itself and
  recorder stack-trace metadata (V8 stack strings vary with wrapper
  depth by construction — breakline-a metric review). Any
  game-content diff is an instrument failure.
- SENSE BAR: at least ONE joined-fight transcript quoted VERBATIM
  from the ON corpus if any join occurred (judged: does the shout /
  join read like people, or like a roster trick?); if zero joins,
  at least ONE ON tile-present hopeless flee (the attempted-join
  shape) quoted verbatim and judged the same way. At least one
  transcript quoted in total, always.

## Bars (judge against this header; a miss is NO-GO, never re-scored)

- COVERAGE (each leg): 8/8 valid seeds AND all four recorders errs 0
  with overflow empty AND tilejoin/fieldparty index-join errors 0
  AND >= 50 fought wild fights in U.
- OFF-ZERO-BASELINE: OFF joins == 0 AND OFF shouts == 0 (the gap
  reproduces on current master; if OFF already shows joins, the gap
  is not what breakline-a measured and the verdict must say so).
- PRIMARY-GO: joins >= 3 AND joined kill rate > solo kill rate.
- GUARDS: G1 AND G2 AND G3.
- DETERMINISM + NEUTRALITY + SENSE legs as above.
- DIAG-GO BAR: coverage AND off-zero AND primary AND guards AND
  determinism AND neutrality AND sense. Any leg missed ->
  DIAG-NO-GO (or INSUFFICIENT-DATA if U fought < 50 on either leg).
  PILOT GATE: if the pilot is NO-GO or INSUFFICIENT-DATA, stop —
  do not spend confirm seeds. No re-scoring against a friendlier
  metric mid-run; metric doubts go under "metric review" in the
  evidence file.

## What this arm does NOT do

No src/js change, no policy change to the competent driver (tableseat-
nowait verbatim), no default flip, no fight routing change, no feed
beyond the tile, no roster read into any decision, no narration fix,
no push, no bump, no live verification. No re-judgment of predecessor
verdicts (breakline-a DIAG-NO-GO on its neutrality wordings stands;
its census stands). No panel artifact (standing exception: the panel
has no census-ingest mode; identical-seed corpora are the §15
substitute, as in prior rounds). Instruments:
scripts/policies/tilejoin-diag.js (recorder + prototype),
scripts/test-tilejoin-a-sweep.js (pilot band),
scripts/test-tilejoin-a.js (analyzer + judge),
scripts/test-tilejoin-a-fixtures.js (pure-function fixtures),
scripts/test-tilejoin-a-sense.js (corpus trace reading),
scripts/test-tilejoin-a-neutrality.js (OFF/ON instrument check).
Each passes `node --check`; fixtures print FIXTURES-PASS; analyzer
prints MACHINE-LEGS-PASS/FAIL. Never run concurrent jest; cache dir
/tmp/jest-cache-sim-tilejoin-a (no jest expected — node scripts only;
the rule is recorded, not waived). Never touch docs/ONTOLOGY.md. Never
touch any other worktree, registry entry, loop-B tree, or build lane.
Never touch the main tree.

## Metric review (filled at judging time)

- (to be filled when the analyzer runs)
