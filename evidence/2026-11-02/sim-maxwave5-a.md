# sim-maxwave5-a — WHAT A maxWave=5 ROW RECORDS (Loop A 20261102T0815Z, axis scale-onramp)

Run: fleshout-loop-a-20261102T0815Z, arm sim-maxwave5-a, axis
scale-onramp. Worktree branch: sim-maxwave5-a, base 0b2d2a3b8
(one commit behind master at spawn — NOT rebased, NOT merged
by this worker; coordinator lands). POLICY/INSTRUMENT-SIDE
ONLY — zero `src/js` changes. Prereg committed BEFORE any
judged sim (5eb3ed43); instrument committed before the replay
(2c6fcfbb). Sibling Loop B trees/branches NOT touched. No
titan canon doc exists in docs/ — stated, none invented
(same finding as prior rounds; in-code source is
`src/js/titans.js` + `src/js/hierarchy.js`).

## Verdict: UNLOCK ONLY — not a spawn, not a fight, not an artifact

Seed 97309's maxWave=5 row records that wave 5 UNLOCKED on
day 76 — the Producers entered the spawn pool — and nothing
more. No wave-5 monster ever spawned, no wave-5 fight ever
happened, no wave-5 kill exists. The village was lost the
next day (day 77), still fighting wave-4 monsters, before
any Producer could appear.

## The answer in plain words (what future runs may and may not claim)

A maxWave=5 row means: "the village earned standing 200,
had faced wave 4, and the System announced the Producers."
It does NOT mean a Producer was ever seen, met, fought, or
killed. Future runs must say "wave 5 unlocked" for such a
row, never "wave 5 reached" and never "wave 5 fought" —
unless a separate spawn or fight trace proves the stronger
claim. The standing wall language is therefore REFINED, not
overturned: on the arrearsscreen band the correct reading
is "wave 5 unlocked 1/24, wave 5 fought 0/24" — the
"wave 5 fought 0 in normal play" half stands exactly, and
the one W5 row that looked like a possible counterexample
is now proven to be unlock-only. The full seat 0 half is
untouched by this arm (this seed sat the table — Table 1 —
without national, which is not an error: the deed gate
dropped its scale rung on 2026-10-13, so table-without-
national is legal play, not a recorder artifact).

## Code audit (what the recorder actually measures)

- `scripts/sim-harness.js`, `runDays` return block: the
  field is named `maxWaveUnlocked`, but it is computed from
  ONE end-state call — `Game.unlockedWave()` after the run
  ends — not from a max-over-run sample. The name
  over-promises; the value is an end-state unlock snapshot.
- `scripts/arrearsscreen-replay-20261102.js`: copies that
  value verbatim (`maxWave = result.maxWaveUnlocked || 1`)
  and derives `wave5 = maxWave >= 5 ? 1 : 0`. Its `w5Day`
  comes from the herald instrument's sleep census
  (`scripts/herald-instrument-20261030.js`, `Game.sleep`
  wrap pushing `{day, uw, rank}`): the first sleep at which
  `unlockedWave()` reads >= 5. So the arrearsscreen row's
  two wave-5 fields are, respectively, an end-state unlock
  snapshot and a first-observed-unlock day. Neither field
  touches spawns or fights anywhere in its code path.
- `src/js/game.js`, `unlockedWave()`: wave 5 requires the
  wave-3 rung (day 25+ AND 4 wave-2 ledger points, kills
  only) AND `villageStandingTotal() >= t5 (200)` AND
  `waveEngaged(4) > 0` (at least one wave-4 type faced
  blow-by-blow). `monsterWavePool()` then filters
  `data.monsters` to `wave <= unlockedWave()` — unlock
  only ADDS wave-5 defs to the pool.
- `src/js/game.js`, `spawnWaveTarget(pool)`: at top wave 5
  the draw is 55% wave 5 / 20% wave 4 / 12% wave 3 / 8%
  wave 2 / 5% wave 1 — per spawn event, not per day. A
  spawn still has to happen (tile entry, wanderer cast, or
  background spawn via `spawnWorldMonster`), and the
  monster then has to be met for a fight.
- `src/js/game.js`, `spawnWorldMonster(mdef, tx, ty, opts)`:
  the single choke point for every ordinary spawn path
  (tile-entry `checkEncounter`, wanderer `castMonster`,
  background spawns, traps, flee re-placement). Titan and
  campaign spawns also pass through it with `opts.titan`
  set. The only other `worldMonsters().push` sites are a
  fight-end restore of an already-spawned monster and the
  player-monster alias adoption (debug/dev paths) — neither
  creates a new monster in a sim, and a restored monster
  must have fought first, which would leave a deed entry.
- `src/js/progression.js`, `recordDeedFight` + its wraps:
  the deed feed `wavesFaced` is fed exactly by player
  `startCombat` fights that actually start and by villager
  `fieldFight` counted outcomes (vKill / mFlee / vFlee),
  plus `recordWaveKill`. Fleeing counts (stood on the
  grid); evade, vDie, and alreadyDead record nothing. An
  empty wave-5 deed entry set is therefore independent
  backstop proof that no wave-5 fight occurred, even if a
  spawn wrap had missed something.
- `src/js/titans.js` (pool wrap): titans never wander —
  `monsterWavePool` excludes them; they arrive by omen
  only. The wave-5 titans are finale and nielsen, so a
  pool spawn could only ever have been one of the six
  non-titan Producers (cancellation, editor, rerun,
  spoiler, timeslot, network_note). None appeared.
- `src/js/standing.js`, `villageStandingTotal()`:
  readiness deferral holds the gated total at t5-1 while
  the wave-5 readiness bars are short, and the peak
  ratchet (`_standingPeakWave`) floors the total at a
  released wave's threshold forever. Consequence: once
  wave 5 releases, the end-state snapshot cannot fall
  back below 5 — so end-state 5 DOES prove "unlocked at
  some point," reliably, even though it is only sampled
  at the end. What it cannot prove is anything that
  happened after the unlock.

## Replay: exact reproduction, no drift

Frozen arrearsscreen stack, seed 97309, DAYS=180. The
replay reproduces the original row field for field, and
the dayHash streams agree on all 76 days — same RNG
stream, same run, not a lookalike:

| Field | Original (arrearsscreen) | Replay (this arm) |
|---|---|---|
| maxWave / W4 / W5 | 5 / 1 / 1 | 5 / 1 / 1 |
| w4Day / w5Day | 50 / 76 | 50 / 76 |
| National / Table / Won | 0 / 1 / 0 | 0 / 1 / 0 |
| Days / gameDays / End | 77 / 77 / village-lost | 77 / 77 / village-lost |
| End scale rank | regional | regional |
| dayHash stream | 76 entries | identical, 76/76 |

No drift statement is needed: there is no drift. The
verdict below is judged on the replayed run itself, and
because the streams agree, it transfers to the original
row directly.

## Day-by-day unlock trace (daily policy snapshot)

| Day | unlockedWave | Gated standing | Peak | Wave-4 faced | Ledger (w1/w2/w3/w4/w5 pts) | Faced counts by wave |
|---|---|---|---|---|---|---|
| 2 | 1 | 0 | 0 | 0 | 0/0/0/0/0 | — |
| 21 | 2 | 0 | 0 | 0 | 5/0/0/0/0 | w1: 9 |
| 37 | 3 | 40 | 0 | 0 | 9/4/0/0/0 | w1: 12, w2: 4 |
| 50 | 4 | 105 | 4 | 0 | 9/4/1/0/0 | w1: 12, w2: 5, w3: 4 |
| 75 | 4 | 199 | 4 | 2 | 15/5/2/2/0 | w1: 14, w2: 7, w3: 5, w4: 2 |
| 76 | 5 | 240 | 5 | 2 | 15/6/2/2/0 | w1: 14, w2: 7, w3: 5, w4: 2 |

How day 76 unlocked: the wave-3 rung was long met, two
wave-4 types had been faced (reunion, strike — the
`waveEngaged(4) > 0` condition), and gated standing jumped
199 → 240 across the t5=200 bar. Day 75's gated value of
exactly 199 is the t5-1 readiness-hold signature
(`standing.js` defer5 bound); on day 76 the hold released
and the peak ratchet recorded wave 5. (Which readiness
bar released is NOT traced by this instrument and is not
claimed — only the hold value and the release are
observed.) End-state standing breakdown: war 100,
diplomacy 0, plenty 140 (raw total 240; the plenty cap
counts at most 100 toward the t5 bar, and 200 already
clears it). The engine announced the unlock the same day:

> day 76: 📺 "You've gotten too big for the story. Ratings
> are GREAT, by the way — but you're threatening the
> narrative now. So the narrative is fighting back. Meet
> the PRODUCERS."

## Event classification (every wave-5-relevant event; zero UNCLASSIFIED)

| Event kind | Found | Class | Detail |
|---|---|---|---|
| Unlock transition | 1 | UNLOCK | day 76, uw 4 → 5 (daily trace + sleep census agree; PRODUCERS beat same day) |
| Wave-5 pool spawn | 0 | — (absence proven) | spawn wrap saw 32 spawns total (w1: 14, w2: 9, w3: 5, w4: 4), zero wave-5; zero spawns at all on days 76–77 |
| Wave-5 titan/campaign spawn | 0 | — (absence proven) | same wrap; the only titan spawn in the run was the wave-4 herald (day 64) |
| Wave-5 player fight | 0 | — (absence proven) | startCombat attempts with wave 5: none (all day 76–77 fights were wave-4 strike/reunion) |
| Wave-5 villager fight | 0 | — (absence proven) | fieldFights wave>=4 in the run: one, day 75, reunion (mFlee) — wave 4 |
| Wave-5 deed entry | 0 | — (absence proven) | end-state wavesFaced: w1: 14, w2: 7, w3: 5, w4: 2 (reunion, strike), w5: none |
| Wave-5 kill | 0 | — (absence proven) | kills wave>=4 in the run: 3, all wave-4 strike; waveKillLog w5: none; ledger w5 points: 0 |

Strongest class proven: UNLOCK. The verdict rule in the
prereg (NONE < UNLOCK < SPAWN < FIGHT < KILL) therefore
returns UNLOCK, and the classifier's verdict reproduced
from the corpus alone is UNLOCK (validator green).

Why no spawn in the unlock's lifetime: the unlock lived
about one day. Wave 5 entered the pool on day 76 and the
village was lost on day 77; in that window the spawn
paths drew nothing at all (no spawn events on days 76–
77, wave 5 or otherwise), so the 55% newest-wave draw
never even got rolled on a spawn event. A one-day-old
unlock is the thinnest possible window — the pool changed,
the world did not get a chance to use it.

## Sense-test (SENSE-TESTING LAW — scoped to this question)

The fiction is coherent about what happened, and honest
about what did not: the System announces the Producers on
day 76, and the village dies on day 77 still fighting the
Mirror Draft — its last recorded fights are reunion (day
77) and strike/reunion (day 76). No villager ever names,
sees, or fights a Producer, and no transcript line in the
run mentions one except the announcement itself. That is
the correct shape for an unlock-only row: a threat
announced, never arrived. No villager-dialogue verdict
beyond this question is claimed — this arm read the
unlock beat and the final-day fight record, not a full
dialogue sample, and the evidence does not pretend
otherwise.

## GO bars — judged as written

(a) REPRODUCTION-OR-DRIFT STATEMENT: PASS — reproduced
    exactly, dayHash streams identical 76/76, table above.
(b) EVERY WAVE-5-RELEVANT EVENT CLASSIFIED: PASS —
    classification table above covers unlock (1), spawns
    (0, absence proven by wrap + deed backstop), fights
    (0, same), kills (0, same). Zero UNCLASSIFIED.
(c) PROOF GREEN: PASS — classifier unit
    scripts/test-maxwave5-classify.js 13 checks green;
    corpus validator scripts/test-maxwave5-a.js green,
    reproducing verdict UNLOCK from the corpus alone.
(d) ZERO src/js CHANGES: PASS — branch commits touch
    only evidence/ + scripts/ (verified by commit file
    lists; no src/ path in any new commit).
(e) EVIDENCE + CORPUS: PASS — this file +
    evidence/2026-11-02/perseed-maxwave5-a/
    (replay-s97309.json, sweep.stdout, sweep.stderr).

## Findings for the coordinator (not chased mid-run)

1. RENAME THE WALL COLUMN AT THE SOURCE. The field's
   name (`maxWave`, and the derived `wave5` flag) invites
   exactly the misreading this arm just killed. Future
   screens should report it as `maxWaveUnlocked`, and
   any screen that wants to claim spawn or fight reach
   must carry a spawn wrap + deed end-state like this
   arm's instrument. The one-line fix is in recorder
   naming, not in game code.
2. THE WALL LANGUAGE CORRECTION IS NARROW AND FINAL
   FOR THIS ROW: arrearsscreen band reads "wave 5
   unlocked 1/24, wave 5 fought 0/24." Do not let the
   1/24 be quoted without the "unlocked" qualifier, and
   do not let it be pooled with any future fight-proven
   row as the same kind of reach.
3. ONE-DAY UNLOCKS ARE EXPECTED TO LOOK LIKE THIS. A
   village that unlocks wave 5 on its death day will
   always record maxWave=5 with zero Producers. Any
   future "wave 5 reached" claim needs an unlock day at
   least several days before the run's end, plus a spawn
   or fight trace — unlock day alone never suffices.
4. READINESS-HOLD SIGNATURE (observation, not a
   finding): day 75 gated standing sat at exactly 199
   (t5-1) before releasing day 76. A future arm that
   wants the release mechanism should trace the four
   readiness bars daily; this instrument did not, so the
   releasing bar is unknown, not assumed.

## Infrastructure notes (loud, per run discipline)

- Index clobber (known class) struck BOTH new commits
  (prereg 5eb3ed43, instrument 2c6fcfbb): after each
  correct commit the main index showed the committed
  files as deleted + untracked. Repaired both times via
  HEAD-blob `git update-index --add --cacheinfo`;
  `git status --short` empty + `git diff HEAD` empty
  verified before any sim ran (prereg) and before the
  replay (instrument).
- No EPERM flap on this run: the single-seed replay ran
  ~61s first try, stdout 38,997 bytes.
- check.js NOT run: zero `src/js` changes, new files are
  not on the green list, and concurrent jest is forbidden
  while sibling loops run. Proof rests on: syntax checks
  (4/4), classifier unit 13 checks, corpus validator on
  the replay corpus, and the exact dayHash reproduction
  of the original row.

## Metric review (for the NEXT run, never this verdict)

- The prereg's verdict rule (strongest class proven)
  worked as designed and needed no revision: the trace
  cleanly separated unlock from spawn from fight, and
  the empty kinds were absences proven by two
  independent instruments (spawn wrap + deed end-state),
  not missing data.
- The prereg's bar (b) wording is kept: "zero
  UNCLASSIFIED" held because the classifier assigns a
  class to every event found and the evidence table
  lists absences explicitly with their proof, rather
  than leaving kinds unmentioned.
- The arrearsscreen corpus shape (end-state maxWave +
  first-unlock sleep day, no spawn/fight trace) is now
  a known insufficient shape for reach claims — see
  finding 1. A future screen's prereg should require
  either the renamed column or a spawn+fight trace.
- No metric was re-scored mid-run. The verdict is
  UNLOCK, exactly as the prereg's rule computes from the
  trace — not upgraded toward SPAWN or FIGHT on the
  strength of the 55% pool ratio or the PRODUCERS beat.

## Convergence state

scale-onramp stays converging (NOT converged): this arm
answers a measurement question about the wall language, it
does not move the wall itself. The scale wall still
stands as: national reached on the arrearsscreen band but
the full seat unwon in the standing picture, and wave 5
now proven fought 0 on that band's one unlocked row.
(The coordinator owns the tracker update; this worker
does not touch the tracker or any claim file.)

## Commits (this worktree branch sim-maxwave5-a; coordinator merges)

- Prereg: 5eb3ed433dc8e45340f89153d3b315d0117734fe
- Instrument: 2c6fcfbb6469537f8fa92c4b7baedae274238645
- Evidence + corpus: this commit (hash recorded in the
  worker's final report to the coordinator)
- No src/js touched. No push, no bump, no live
  verification. Report: ready for coordinator merge,
  pending ship.
