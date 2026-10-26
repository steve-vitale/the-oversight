# sim-drawwave-a — unlockedWave at draw time (axis scale-onramp)

Run: fleshout loop A, 2026-10-26, arm sim-drawwave-a.
DIAG ONLY — zero src/js changes, zero default flips, new files only.
This arm designs and lands NO game fix. The per-draw appropriateness
table IS the deliverable.

## PRE-REGISTRATION (binding, written BEFORE any sweep, judged only against this)

- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave law;
  wave 4 = the Mirror Draft, gate village standing >= 100 with the
  combat-readiness hold; wave 5 = standing >= 200 AND wave-4 faced;
  earlier waves never leave the pool; castMonster is wave-gated on
  unlockedWave — never over-leveled, never stuck on wave 1),
  src/js/feastBuff.js header + drawFeastScavenger (fresh armed grant
  only, one draw per buff; the smoke draws a wave-appropriate
  scavenger via castMonster as a pending encounter the player faces
  via faceFeastDraw or declines via driveOffFeastDraw; the draw dies
  with the buff).
- Context read first: evidence/2026-10-26/sim-feastdraw-a.md (0017Z:
  feast-draw wave-appropriateness proven only by DISTRIBUTION —
  w1 1, w2 2, w3 1, w4 1 — not per draw; its recorder records the
  draw's wave but NOT unlockedWave at draw time, so
  wave-appropriateness is unproven per draw; its next-arm sketch
  leg (1) is exactly this arm: record unlockedWave, or the
  castMonster wave pool, at every draw) and
  evidence/2026-10-26/sim-rebaseline-a.md (the authoritative
  control table, base 8ea64d848). The drive-off-policy variant
  from that sketch is ALREADY DONE (driveoff-clean-a, 0215Z) — this
  arm is the recorder leg ONLY, not the lever sketch and not
  feast-frequency.
- Base recorder reused verbatim: scripts/policies/feastdraw-diag.js
  (FEASTDRAW=1). New this run, policy-side only, in a NEW file
  only: scripts/policies/drawwave-diag.js (DRAWWAVE=1). It wraps
  drawFeastScavenger ONLY and records, BEFORE delegating: the
  engine's unlockedWave() at draw time, the monsterWavePool()
  wave-count distribution at draw time (the cast pool the draw
  is drawn from), and the raw standing components via
  villageStanding() where available; and AFTER delegating: the
  draw result (drawn, monsterId, veteran), the drawn monster's
  def wave (pure read), the post-call unlockedWave() (stability
  check — the draw itself must not move the gate), and whether
  the drawn id was in the pre-call pool. It wraps NO other
  function, writes nothing to game state (store arrays only),
  draws no RNG, never throws into the engine (recording errors
  are counted; an engine throw is recorded and rethrown
  unchanged), and returns the original value untouched. Pure
  reads only: it NEVER calls feastedActive() or feastDrawPending()
  (both can clear state); it reads s.feastDraw directly only
  where needed for the join key.
- UNLOCKEDWAVE READ SAFETY (read from code before writing the
  recorder, not assumed): unlockedWave() reads
  villageStandingTotal(), which can set the one-way standing
  peak and fire the release/hold beats — but both are
  day-throttled and idempotent (hold beats fire at most once
  per 7 days per wave; the release beat fires once when the
  peak is set, then the peak test blocks repeats), and the
  engine itself calls unlockedWave() many times per day (pool,
  spawns, loot). The extra pre-draw call therefore cannot move
  a beat to a different day than the engine's own calls would
  — and the neutrality pair below is the proof, not this
  paragraph: if the pair fails, the recorder is fixed and
  everything re-run, never cited pre-fix.
- Shared band, trajectory for trajectory: seeds 73671–73678,
  tableseat-nowait substrate (LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1), 180d death-aware horizon (runDays stops on
  death/win; 180 is the cap, not a fixed horizon).
- Fresh sweep only for the verdict — never judge a copied
  sibling corpus.
- DIAG-GO requires ALL legs, no partial credit:
  (a) every feast draw on the band carries unlockedWave at
  grant/face time, 0 unclassified draws;
  (b) a per-draw appropriateness table (draw wave vs
  unlockedWave at draw time — appropriate / early / impossible),
  NOT distribution-only;
  (c) the control side reproduces the 0126Z rebaseline table
  (deaths 260, national-ever 6/8, national-final 5/8, table 4/8,
  wins 4/8 lesser seat only, wave-5 0/8, median 143d) or any
  deviation is reported plainly with a recorder-neutrality
  proof.
- WRAPPER DISCIPLINE (fishstaff lesson, mandatory): the
  instrument wraps engine calls — prove delegation on a
  neutrality pair FIRST (armed-recorder vs bare-policy
  trajectories identical on the pair) before any number from it
  is judged. A wrapper that counts but never delegates perturbs
  every trajectory and invalidates the run; if the neutrality
  pair fails, fix the wrapper and re-run everything — never
  cite pre-fix numbers. Neutrality pair for this run: armed
  (full recorder composition incl. drawwave) vs plain
  (tableseat-nowait, no recorders) on seeds 73672 and 73678
  (both draw-bearing; 73678 carries the band's wave-4 kill),
  compared on days, gameDays, endReason, won, waveReach,
  maxArc, finalRank, maxRank, nationalEver, nationalFinal,
  table, entered, deathTotal, starvationDeaths, ts counters,
  faced map, and kill log — plus detgate on seed 73671
  (recorders OFF = baseline, no diag surface, no wraps
  installed).
- Definitions (fixed before sweeping, analyzer header repeats
  them): DRAW = one drawFeastScavenger call recorded by
  drawwave-diag. SPAWNED = drawn true. UNLOCKEDWAVE AT DRAW =
  the pre-delegation unlockedWave() value on that call.
  POOL = the pre-delegation monsterWavePool() wave-count
  distribution on that call. APPROPRIATE = spawned, wave !=
  null, unlockedWave != null, draw wave <= unlockedWave.
  EARLY = spawned, draw wave > unlockedWave (the cast drew
  ahead of the unlocked gate — the finding this arm hunts).
  IMPOSSIBLE = spawned, drawn id NOT in the pre-call pool
  (counted separately from EARLY; the two coincide when the
  pool is exactly waves <= unlockedWave, and any divergence
  between them is itself reported). UNCLASSIFIED = spawned
  with unlockedWave null, or draw wave null, or no joined
  feastdraw draw row (monsterId + day) — counted, never
  hidden. Not-spawned draw calls (drawn false) are reported
  with their unlockedWave but are NOT in the appropriateness
  denominator. Face/decline/fight outcomes come from the
  feastdraw + nonworldkill joins exactly as in sim-feastdraw-a.
- SENSE plan: one draw's story in plain words (what wave the
  village was on, what beast the feast drew, whether the draw
  was fair) + a villager-behavior spot check from the corpus.
  Numbers plus meaning, not counts alone.
- METRIC REVIEW section below is mandatory (docs/MEASUREMENT.md
  §14): pre-registered metrics bind the run — a miss is NO-GO,
  never re-scored against a friendlier metric mid-run.
- Balanced-panel note: scripts/balance-panel.js cannot ingest
  per-seed recorder corpora (known limitation, carried) — the
  sweep-compare table + analyzer output are attached instead;
  do NOT run telemetry-check on recorder rows (its counts are
  wrong on recorder rows — standing instruction).
- Wall numbers reported every run: national / table / wins,
  wave 4–5 unlocks, median survival.

## RESULTS (written after the sweep; the pre-registration above was written before it)

## VERDICT: DIAG-GO (appropriateness legs) — CONTROL DEVIATED (base drift, recorder neutral)

- (a) Every feast draw on the band carries unlockedWave at draw
  time: 28 draw calls, 28 spawned, 28 with a pre-delegation
  unlockedWave, 0 unclassified draws, 0 pool-unknown draws,
  0 gate-moved draws (post-call unlockedWave equals pre-call
  on all 28). Corpus PASS, recorder errors 0 on all seven
  recorders on all 8 seeds, no overflow.
- (b) Per-draw appropriateness table (below, not distribution
  only): 28 appropriate, 0 early, 0 impossible. Every drawn
  monster was inside its pre-call cast pool, and every draw
  wave was at or below the unlocked wave at draw time.
- (c) Control reproduction: NOT reproduced — the armed band
  deviates from the 0126Z rebaseline table (below). The
  deviation is PROVEN to be base drift, not recorder effect:
  the neutrality pair (plus a third seed) reproduces exactly
  armed == plain on every trajectory field, and the detgate
  passes. The census legs above are therefore judged on the
  current-base corpus, and the 0126Z table must NOT be carried
  forward as current (see Control Gate). This verdict pattern
  follows sim-feastdraw-a exactly: DIAG-GO on the question,
  CONTROL DEVIATED as a separate flag.
- Proof: scripts/test-drawwave-a.js 35/35 (unit + fake-Game
  integration: delegation, gate capture, pool membership,
  analyzer classification, engine-throw rethrow, OFF mode,
  uninstall restore).

## NEUTRALITY PAIR (wrapper discipline — proven BEFORE any number was judged)

- Detgate, seed 73671: baseline days 160 / gameDays 160 /
  tsNationalDay 77 = wrapped-with-recorders-OFF, no diag
  surface, no wraps installed. PASS. (Note the 160, not the
  rebaseline 180 — that is the base drift documented below,
  present in BOTH arms of the detgate, not a recorder effect.)
- Pair seed 73672 (draw-bearing): armed == plain on EVERY
  compared field — days 180, gameDays 181, end survived, won 0,
  wave 3, arc 3, finalRank global, maxRank global,
  nationalEver 1, nationalFinal 1, table 0, entered 0,
  deathTotal 24, starvation 0, ts {tsNationalDay 77}, faced
  map, kill log, deaths map. IDENTICAL.
- Pair seed 73678 (the old wave-4-kill seed, now draw-less):
  armed == plain on every compared field — days 173,
  gameDays 173, end village-lost, won 0, wave 4, arc 3,
  finalRank regional, maxRank national, nationalEver 1,
  nationalFinal 0, table 0, entered 0, deathTotal 58,
  starvation 2, ts {tsNationalDay 88}, faced map, kill log,
  deaths map. IDENTICAL.
- Third seed 73677 (checked because its death count differed
  from rebaseline): armed == plain on every compared field —
  days 143, village-lost, wave 4, deaths 45, ts
  {tsNationalDay 77}, faced map, kill log, deaths map.
  IDENTICAL. The 45 (vs rebaseline 43) is the current-base
  value on both sides.
- Conclusion: the drawwave wrapper (and the full recorder
  composition) does not move trajectories. Any band deviation
  from rebaseline is base-side.

## CONTROL GATE — DEVIATED BY BASE DRIFT (not by the recorder)

Armed band (current base 72cf7a672) vs 0126Z rebaseline table
(base 8ea64d848): wins 4 = 4, national-final 5 = 5, table 4 = 4,
entered 4 = 4, wave-4 5 = 5, wave-5 0 = 0, median 143d = 143d —
but deaths 301 (rebaseline 260, +41), national-ever 8/8
(rebaseline 6/8, +2), starvation 2 (rebaseline 9, −7),
raids 91 (85, +6), raiders 404 (352, +52), pool 1,346
(1,527, −181), pool wave-3+ 130 (132, −2).
- Per-seed drift (rebaseline → now): 73671 180 survived/31
  deaths → 160 village-lost/50 deaths; 73672 97 won/25 →
  180 survived/24; 73673 124 won/28 → 90 won/26; 73674 163
  won/30 → 139 won/35; 73675 180 survived/38 → 132 won/30;
  73676 70 village-lost/31 → 124 won/33; 73677 143
  village-lost/43 → 143 village-lost/45; 73678 116 won/34 →
  173 village-lost/58. Every seed moved on at least one
  field; no seed reproduces its rebaseline row.
- Candidate cause, stated as candidate NOT proven (bisection
  belongs to the coordinator, not this DIAG arm): the ONLY
  src/js delta between the rebaseline base and this base is
  journey-landing r54 (de87ffe79: the winddown grace beat in
  conversation.js — a winddown-menu pick's line is now
  returned as the closing line instead of a quiet close) plus
  the version stamp in build.js. No policy file, no harness
  file, and no other src file changed in that range
  (verified with git diff --stat). A one-line conversation
  return change rerouting all eight trajectories is the
  standing hypothesis — chaotic sims amplify one dialogue
  branch into different RNG consumption downstream — but
  this arm does NOT prove it; a bisect arm must confirm or
  kill it before anyone tunes against this band.
- Consequence, stated plainly: the 0126Z table is stale on
  current master for the second time in two days (the same
  class of drift feastdraw-a reported at 0017Z). Any arm
  that judges against it without re-baselining will chase
  base drift as if it were a lever effect. The current-base
  band in this file IS the re-baseline candidate (same
  seeds, same policy, same horizon, recorder-neutral).

## THE ANSWER, FIRST (plain words)

The feast draw is fair — every single time, on this band.
Twenty-eight feasts drew twenty-eight beasts, and not one
beast was above the wave the village had actually earned
when the smoke drew it. No early draws, no impossible
draws, no draws from outside the unlocked pool. The
distribution from 0017Z (mostly low waves, one wave-4 in
five) was not a targeting failure hiding in the averages:
it was the villages themselves, mostly still on waves 1–2
when they feasted, drawing exactly what their wave allowed.
When a village HAD earned wave 4, the smoke drew wave-4
beasts — three of them, all on one village, all fair — and
two of them died. The targeting question is closed: the
draw never cheats upward. What the draw does NOT do is
save villages: the one village that drew wave-4 beasts
twice and killed them both still died on day 160. Fair
draws are not a ladder; they are a mirror of where the
village already stands.

## PER-DRAW APPROPRIATENESS TABLE (draw wave vs unlockedWave at draw time)

Verdict key: APPROPRIATE = draw wave <= unlockedWave AND drawn
id inside the pre-call pool. EARLY = draw wave > unlockedWave.
IMPOSSIBLE = drawn id outside the pre-call pool. All 28 draws
are APPROPRIATE; the table below is the proof, not a summary
of it. Pool = monsterWavePool() wave counts at draw time
(recorded, not inferred): uw1 → 25 (w1 only); uw2 → 40
(25 w1 + 15 w2); uw3 → 49 (+9 w3); uw4 → 58 (+9 w4). Standing
= raw villageStanding() total at draw time (war/diplomacy/
plenty components in the corpus rows). Outcome/kill from the
feastdraw + nonworldkill joins (all 28 faced-face, same day).

| seed day | beast | draw wave | unlocked | pool | standing | outcome | kill |
|---|---|---|---|---|---|---|---|
| 73671 d83 | callback | w3 | 3 | 25/15/9 | 102 | faced, won | callback w3 |
| 73671 d90 | congregation | w4 | 4 | 25/15/9/9 | 147 | faced, won | congregation w4 |
| 73671 d97 | strike | w4 | 4 | 25/15/9/9 | 192 | faced, won | strike w4 |
| 73671 d104 | suburb | w4 | 4 | 25/15/9/9 | 262 | faced, lost | — |
| 73672 d27 | sunback | w1 | 1 | 25 | 0 | faced, won | sunback w1 |
| 73673 d66 | sunbasker | w1 | 3 | 25/15/9 | 102 | faced, won | sunbasker w1 |
| 73673 d77 | alien_tick | w2 | 3 | 25/15/9 | 122 | faced, won | alien_tick w2 |
| 73673 d84 | callback | w3 | 3 | 25/15/9 | 142 | faced, won | callback w3 |
| 73674 d75 | review_drone | w2 | 2 | 25/15 | 0 | faced, won | review_drone w2 |
| 73674 d82 | anaconda_empress | w1 | 2 | 25/15 | 20 | faced, won | anaconda_empress w1 |
| 73674 d89 | warranty_caller | w2 | 2 | 25/15 | 40 | faced, won | warranty_caller w2 |
| 73674 d96 | glasswing | w1 | 2 | 25/15 | 60 | faced, won | glasswing w1 |
| 73674 d103 | sanjun | w1 | 2 | 25/15 | 80 | faced, won | sanjun w1 |
| 73674 d110 | paparazzo | w2 | 3 | 25/15/9 | 100 | faced, lost | paparazzo w2 |
| 73674 d138 | terms_of_service | w3 | 3 | 25/15/9 | 222 | faced, won | terms_of_service w3 |
| 73675 d26 | warranty_caller | w2 | 2 | 25/15 | 0 | faced, won | warranty_caller w2 |
| 73675 d33 | hummice | w1 | 2 | 25/15 | 20 | faced, routed | hummice w1 |
| 73676 d45 | sunback | w1 | 1 | 25 | 0 | faced, won | sunback w1 |
| 73676 d52 | review_drone | w2 | 2 | 25/15 | 20 | faced, won | review_drone w2 |
| 73676 d59 | sweeps_week | w1 | 2 | 25/15 | 40 | faced, routed | sweeps_week w1 |
| 73676 d66 | mirror_stag | w2 | 2 | 25/15 | 162 | faced, won | mirror_stag w2 |
| 73676 d73 | belltoad | w1 | 2 | 25/15 | 182 | faced, won | belltoad w1 |
| 73676 d80 | sunbasker | w1 | 2 | 25/15 | 202 | faced, won | sunbasker w1 |
| 73676 d87 | heckler | w2 | 2 | 25/15 | 222 | faced, won | heckler w2 |
| 73676 d94 | sunback | w1 | 2 | 25/15 | 242 | faced, won | sunback w1 |
| 73676 d101 | murkcap | w1 | 2 | 25/15 | 262 | faced, won | murkcap w1 |
| 73676 d108 | landlord | w2 | 2 | 25/15 | 282 | faced, won | landlord w2 |
| 73676 d115 | redactor | w3 | 3 | 25/15/9 | 302 | faced, lost | — |

Totals: appropriate 28, early 0, impossible 0, unclassified 0.
Draw-wave distribution: w1 12, w2 9, w3 4, w4 3. Faced rate
28/28 = 1.0 (all faced-face under this policy; drive-off and
harness doors again unexercised). Kill rate 26/28 faced draws
with >= 1 kill (the two kill-less draws are both losses:
suburb, redactor; paparazzo lost but still killed). Wave-4
draws 3, wave-4 kills 2, veterans per draw 2/28 = 0.071.
Cast-veteran draws 12 (a cast variant flag, not a produced
veteran — same distinction as 0017Z; none of the 12 produced
a wave-4 kill).

## CENSUS — DRAWWAVE ROWS (what the recorder itself proves)

- Calls 28, spawned 28, not-spawned 0: on this base, every
  drawFeastScavenger call drew. The 'already pending',
  'smoke carried clear', 'no cast', and 'unknown id' branches
  were never exercised — the one-draw-per-buff rule and the
  1.0 smoke chance held exactly as in 0017Z, now on 28
  draws instead of 5.
- Gate stability: post-call unlockedWave equals pre-call on
  28/28. The draw itself never moves the gate (as expected:
  casting draws no ledger point, spends no standing).
- Two rows that teach the gate's shape (read from the corpus,
  not invented):
  - 73674 d138: standing 222 (war 0, diplomacy 102, plenty
    120) yet unlockedWave 3. Raw standing above the wave-5
    bar did NOT open wave 4: the readiness hold (and the
    wave-3 rung's own terms) gated the total below t4, so
    the smoke drew a wave-3 Terms of Service, fairly. A
    reader who only looked at standing would call this draw
    "too low"; the gate says it is exactly right.
  - 73676 d80–d108: standing 202 → 282 yet unlockedWave 2
    throughout. Standing does not unlock wave 3 at all (wave
    3's gate is day 25 + wave-2 ledger points); bread-heavy
    standing sat above the wave-4 bar while the village was
    still, by the ledger, a wave-2 village — and the smoke
    drew wave-1/2 beasts accordingly. Only at d115, once
    the wave-3 rung was met, did unlockedWave reach 3 and
    the draw become a wave-3 Redactor.
- Grants census (feastdraw, for context): 43 grants, 28
  fresh, 0 refreshed, 15 refused. Draws per fresh grant
  28/28 = 1.0. The 0017Z band's 5-draw sample is superseded
  by this 28-draw sample on current base — but the two
  samples are NOT comparable as a trend (different bases,
  different trajectories); this file's numbers stand on
  this base only.

## SENSE-TESTING READ (one draw's story + villager spot check)

The sense moment: 73671, day 90. The village has been
climbing — standing 147, past the wave-4 bar of 100, the
Mirror Draft open. It feasts, and the smoke draws a
Congregation: faith as a weapon, a house-sized
congregation-monster at the haven's edge. The scholar
walks out alone at full health, 100/100, against 1,099
health of Congregation — and wins, killing it, the log
naming the scholar via 'player'. Seven days later the same
village draws a Strike at standing 192 and kills that too.
Seven days after that it draws a Suburb at standing 262,
the scholar bleeding at 66 health, and loses. The sequence
reads as fair in both directions: the village earned
wave-4 beasts and got wave-4 beasts; it was not handed a
wave-5 beast it had not earned, and it was not protected
from a wave-4 beast it could not beat at 66 health. Then
the village dies anyway on day 160, village-lost, with 6
people and 8,484 kcal left — two wave-4 kills did not buy
survival. The draw is a mirror, not a rescue: it shows
the village what it has earned, including the fight it
cannot win.
Villager-behavior spot check: draw fights are still
overwhelmingly the scholar's alone (26 of 28 kills via
'player'; the exceptions are a companion kill — hummice,
73675 d33, via companion with a shout x5 trick — and one
named-villager kill — nadia_khoury, terms_of_service,
73674 d138). Villagers appear beside the scholar in
almost no draw fight; the policy faces immediately while
feasted regardless of health, as in 0017Z. Nothing new
reads robotic here — but nothing new reads social either:
the feast's own villagers, whose feast drew the beast,
are absent from the fight it caused. That absence is a
standing blank (carried, not chased here), not a new
finding of this arm.

## VILLAGE ASSESSMENT (plain words)

These are not the villages the 0126Z table remembers — all
eight moved. Four won (73673, 73674, 73675, 73676), table 4/8,
entered 4/8, three were lost (73671, 73677, 73678), one
survived to day 180 without winning (73672). (Seat kind
was not measured on this band — no lesser-seat claim is
made here, unlike the rebaseline table.) Feasts are
no longer rare on this base: 43 grant attempts, 28
successful, against 12/5 at 0017Z — the villages feast
often, and every feast draws. The feast draw is now a
regular feature of village life, not a rarity: 28 draws
across 8 seeds, 3.5 per seed, against 0.6 per seed before.
But the wall numbers moved sideways, not forward:
national-ever rose to 8/8 (every village touched
national) while wins stayed 4/8, wave-5 stayed 0/8, and
deaths rose to 301. Villages reach further and die more:
the wall is not "villages never scale" on this base, it
is "villages scale and still die" — a different shape of
the same wall, and one the next arm should name before
tuning anything.

## WALL NUMBERS (current-base band, judged corpus)

National-ever 8/8, national-final 5/8, table invited 4/8,
entered 4/8, wins 4/8, wave-4 5/8, wave-5 0/8, Arc IV 4/8,
median survival 143d (days sorted: 90, 124, 132, 139, 143,
160, 173, 180), max 180d, deaths 301, starvation 2.
Death-cause shares (of 301): villager combat 198 (65.8%
— 'villager combat' 70 + 'combat' 128), player arena 47
(15.6%), expedition 19, villager monster 9, ambush 5,
thirst 4, dehydration 1, starvation 2 (1 player + 1
villager, per the sweep's starvationDeaths field),
wound-that-wouldn't-close 3, player contest 3,
villager sickness 6, player sickness 1, and 1 each for
Performance Review, villager alien, player lockjaw. The
wall stands: wave-5 0/8 — but national-ever 8/8 means the on-ramp's first
rung is no longer the binding constraint on this base.

## BLANKS FILLED OR DOCUMENTED

- FILLED (the arm's question, with numbers): per-draw
  wave-appropriateness — 28/28 appropriate, 0 early,
  0 impossible, 0 unclassified, with the unlocked wave
  and cast pool recorded at every draw. The 0017Z
  distribution-only gap is closed.
- FILLED (mechanism, read from code + corpus): the pool
  sizes at each unlocked wave (25/40/49/58); the gate
  stability across the draw (28/28 unchanged); the two
  gate-shape cases (standing above the bar yet wave held
  by readiness/ledger — 73674 d138, 73676 d80–d108).
- FILLED (method): the drawwave recorder pattern (wrap
  one engine call, pre/post gate snapshots, pure reads
  only) with a 35/35 proof test and a 3-seed + detgate
  neutrality proof.
- DOCUMENTED, NOT FIXED (named next blanks): the control
  drift (all 8 seeds moved since 0126Z; candidate cause
  the r54 winddown grace beat, UNBISECTED — a bisect arm
  must confirm or kill it); the drive-off/harness/unmet
  branches still unexercised (0/28 under always-face
  policy — the driveoff-clean arm priced the choice
  separately); the absent-villager texture of draw fights
  (feast's villagers absent from the fight their feast
  drew); the new wall shape (national-ever 8/8 with wins
  still 4/8 — scale-and-die, not fail-to-scale).
- CARRIED (not chased here): the empty nonat x w4 class
  (w5chain-a); the melt fiction-vs-mechanics gap (1815Z,
  Steve rulings pending); the 23% pool wave-3+ bar
  re-derivation (tileentry question, still open).

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

No pre-registered leg was re-scored mid-run. The run was
judged exactly against its three legs: (a) every draw
carries unlockedWave at draw time, 0 unclassified
(achieved: 28/28, 0 unclassified, 0 pool-unknown);
(b) a per-draw appropriateness table, not distribution-only
(achieved: the table above, 28 appropriate / 0 early /
0 impossible); (c) control reproduction OR deviation
reported plainly with a recorder-neutrality proof
(achieved via the second branch: deviation reported in
full above — band and per-seed deltas, candidate cause
named as unproven — with the neutrality proof: detgate
PASS + armed == plain on 73672, 73678, and 73677 on every
trajectory field). One method note, neither a revision
nor a re-score: two backgrounded sweep exec sessions
returned empty stdout with automatic-delivery completion;
both rows were verified on disk (file present, fields
read) before being cited — no row in this file rests on
an unverified session. The telemetry-check and balanced
panel were NOT run, per the standing exception for
recorder rows (panel cannot ingest per-seed recorder
corpora; checker counts are wrong on recorder rows). The
sweep summary + this evidence file are the comparison of
record. No game code changed; no [needs-eyes] flag
applies (DIAG-only, no narration or behavior added).

## Infrastructure notes

- Sweep: scripts/test-drawwave-diag-sweep.js (the feastdraw
  sweep copied with ONE recorder added: drawwave-diag,
  OUTERMOST in the policy chain, wrapping
  drawFeastScavenger only; feastdraw reused verbatim).
  Corpus: evidence/2026-10-26/perseed-sim-drawwave-a/
  (8 armed rows + 3 plain rows + summary.json). Analyzer:
  analyzeDrawwave in scripts/policies/drawwave-diag.js
  (joined to analyzeFeastdraw). Recorder:
  scripts/policies/drawwave-diag.js (DRAWWAVE=1). Unit
  proof: scripts/test-drawwave-a.js (35/35).
- Neutrality: detgate PASS (seed 73671, recorders OFF =
  baseline, days 160/160); armed == plain on 73672, 73678,
  73677 (all trajectory fields + faced map + kill log +
  deaths map).
- Base: worktree HEAD 72cf7a672 (rebaseline base 8ea64d848
  is an ancestor; the only src/js delta in between is
  conversation.js r54 + the build stamp).
- Commit: sim-drawwave-a, DIAG-GO (appropriateness legs)
  with CONTROL DEVIATED flag, zero src/js diff. Ready for
  coordinator merge; NOT pushed, NOT bumped, live NOT
  verified (coordinator/ship-loop line, not this arm's).

