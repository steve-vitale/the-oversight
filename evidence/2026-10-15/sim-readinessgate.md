# sim-readinessgate — the Standing readiness gate (2026-10-15, scale-onramp, lever-2 lens)

Worktree: `~/workspace/worktrees/sim-readinessgate`. Run: oversight-flesh-out-loop, 2026-10-15.

## The named design space (#209/#210)
evidence/2026-10-14/sim-proposelayer-r33.md and sim-dutyalone-r15.md named the
pattern: Standing-gated wave unlocks do not check combat readiness — the
diplomacy/plenty roads unlock wars they can't fight (proposelayer: armed
villages unlock wave 4 at day ~57–62 via 3 seasoned links and die 40 median
days early; dutyalone: extra feasts buy plenty-Standing → 10/16 reach wave 5
vs 4/16 control, combat deaths 116 vs 62). The war road selects for
readiness; the diplomacy/plenty roads don't. This arm builds the readiness
gate in `src/js/standing.js` ONLY (no other src/js files): when Standing
crosses T4=100 or T5=200(+wave-4-faced), the unlock DEFERS — with an
in-fiction System beat (the System has noticed the village but holds
escalation: the village isn't ready) — until the readiness bar passes.

## Canon position
docs/MONSTER-WAVES.md has NO readiness concept — say so explicitly (done
here). The gate is engine design from measured evidence (#209/#210), not
canon. The canon doc updates only if the arm lands.

## The lever (game code, src/js/standing.js only)
- `standingCfg()` gains: `readyKillTypes: 2`, `readyCounters: 2`,
  `readyArmorP: 20`, `deferRemindDays: 7`. Sim starting points, not canon —
  Steve can overrule.
- `waveUnlockReady(w)` (w=4/5) measures readiness against the wave BELOW
  (w-1): >=1 channel suffices. (a) >=2 distinct wave-(w-1) ledger kill types
  (perType+perTypeX keys >0); (b) >=2 learned counters for wave-(w-1)
  monsters (villageKnowsTrick: monsterCounters / villagerTricks); (c) scholar
  armor P >= 20 via S.equipment.armorOf (P=20 halves on r=P/(P+20)).
- `standingDeferral(w)`: threshold crossed (+wave-4-faced for w=5) and not
  ready => deferred. Grandfathered: a wave whose monsters are already in the
  world (waveEngaged(w)>0) is never held. Waves 1-3 untouched.
- `villageStandingTotal()` returns the GATED effective total (capped t4-1 /
  t5-1 while deferred) — `unlockedWave()` (game.js) is its only reader, so
  the deferral needs no game.js change. The beat fires once per deferral
  engagement from the read path (the re-check is the read itself: when
  readiness passes, the total returns to raw and the normal wave beat fires),
  then a weekly reminder while held. `standingLine()` names the held wave —
  no silent holds.
- Balance calls (documented for Steve's overrule): P>=20 (the "halves" knee
  of the armor curve, not a bespoke number); >=2 kill types (breadth over one
  lucky ambush); >=2 counters (matches the ledger's per-type cap of 2 —
  breadth, not throughput); >=1 channel (the gate is a floor, not a
  checklist — the war road already passes it trivially).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING)
- **Axis**: scale-onramp (the wall), lever-2 lens. Same tree, identical seeds,
  in-script standing.js swap (pristine HEAD vs armed; no stash — the stash
  stack is repo-global).
- **Seeds**: 11/22/33/44/55/66/77/88 x leadfeast/belongfeast
  (= leadcourt/belongseek via FEASTSCALE_R13). **Horizon**: 180d death-aware.
- **PRIMARY**: 30d post-unlock holder rate among w4/5 Standing unlockers
  driven by diplomacy/plenty (war < threshold at the crossing: war alone
  could not have unlocked it) >= control x 1.25.
- **GUARDRAILS**: wave-4 unlock rate within 0.20-0.60 (deferral shifts timing
  by design — the 0.30-0.50 tune band is the review reference, NOT the kill
  bar); median survival >= control-10d; national >= control-2/8; no new
  death mode at the cause-FAMILY level (strip player:/villager: prefix,
  named-monster kills -> 'monster'; armed-only family with n>=3 = new mode).
- **Gates before spend**: proof scripts/test-readinessgate-20261015.js
  RED->GREEN; det-gate 16/16 identical both sides; SMOKE=1 instrument-honesty
  (named-export unwrap + the deferral mechanism reachable on scripted
  fixtures).
- **GO**: primary met at pilot -> confirm 12-16 seeds before calling GO.
  A miss is NO-GO, never re-scored mid-run.

## Draft-bar refinement (pre-registered final form)
The brief's draft said ">=3 villagers with a learned counter". Refined
BEFORE sims: `state.villageCounterObs` is per-MONSTER, not per-villager —
the village-level convention channel is `villageKnowsTrick()` (the ledger's
monsterCounters + villagerTricks). The final bar is >=2 distinct wave-(w-1)
monsters the village has a trick for (breadth, matching the ledger's
per-type cap of 2). The "villagers" framing is the same bar at the village
level: villager observations feed the shared bar (scholar parity included).

## Results (pilot, 8 seeds x leadfeast/belongfeast, 180d death-aware, identical seeds)

Gates before spend (all green): proof scripts/test-readinessgate-20261015.js
REAL RED (pristine: gate absent, unready village unlocks wave 4) -> GREEN
30/30 armed (deferral fires on pristine-unready inputs; each readiness
channel releases independently; grandfather holds; no-win-before-90
intact). Det-gate 16/16 identical on BOTH sides (armed and pristine).
SMOKE=1 instrument-honesty green both sides (named-export unwrap of
leadfeast/belongfeast; armed mechanism reachable on scripted fixtures).

| metric | control (pristine) | armed (gate) | pre-reg bar | verdict |
|---|---|---|---|---|
| PRIMARY: 30d holder rate, non-war-driven w4/5 unlockers | 0.778 (14/18) | 0.833 (5/6) | >= 0.9725 (=control x 1.25) | MISS |
| wave-4 unlock rate | 0.688 | 0.688 | within 0.20-0.60 | band missed BOTH sides |
| median survival | 109d | 180d | >= control-10d | HOLD (+71d) |
| national | 6/16 | 9/16 | >= control-2 | HOLD |
| new death mode (family, n>=3) | — | none | none | HOLD |
| wall: table / wins | 7 / 0 | 11 / 0 | — | — |
| deferral engaged (armed only) | — | 8/16 runs, median held 8d, max 49d | — | mechanism live |

Per-seed armed: deferral held wave 4 on 8 runs (21-49d holds all released:
s22 d79/31d, s33 d97/40d, s44 d76/21d, s66 d88/45d, s77 d76/27d,
belong-s22 d58/8d, belong-s44 d72/22d, belong-s77 d92/49d). Absolute 30d
post-unlock deaths: control 4 -> armed 1.

**VERDICT: KILLED AT PILOT — NO-GO on the pre-registered primary**
(0.833 < 0.9725). Per §14 the miss binds; the arm is not re-scored.
Kill protocol executed: `src/js/standing.js` reverted byte-clean
(`git checkout HEAD --`, no stash); proof degrades to INFO-SKIP exit 0;
det-gate, sweep, sense instruments and this evidence kept.

## Why it missed (honest diagnosis)
The gate works as designed — the metric measures the wrong population.
Two structural effects, both visible in the per-seed rows:
1. **Population collapse by construction.** The gate holds unlocks until
   readiness passes; the "non-war-driven unlocker" population shrinks from
   18 to 6. A rate on a population the mechanism itself shrinks cannot
   clear a x1.25 bar when the control rate is already 0.778 (bar = 0.9725,
   i.e. near-perfection on n=6).
2. **War-channel conversion.** The bar releases via kills: a diplomacy/
   plenty village becomes ready by killing wave-3 monsters, so at the
   crossing war >= 100 and it EXITS the non-war-driven population. The
   villages the gate helped most are counted on the other side of the
   ledger.

The absolute numbers tell the mechanism's story: 30d post-unlock deaths
4 -> 1, median survival 109 -> 180, national 6 -> 9, table 7 -> 11 — every
direction right, all guardrails HOLD. But the pre-registered primary is
the judge, and it missed. A future run should pre-register the absolute
count of 30d post-unlock deaths (or post-T4-crossing mortality regardless
of unlock) as the primary — a metric the gate cannot game by shrinking
the at-risk population.

## Metric review (§14 — for the NEXT run, not this one)
1. **The x1.25 rate bar on a mechanism-shrunk population is the wrong
   primary** (above). Next run: primary = absolute 30d post-unlock deaths
   among ALL Standing unlockers (control vs armed), or time-to-first-
   post-unlock-death survival analysis. The holder RATE is unusable when
   the gate moves villages between populations.
2. **The 0.20-0.60 wave-4 band is miscalibrated for this substrate**:
   BOTH sides measured 0.688 (leadfeast/belongfeast unlock wave 4 at
   11/16 regardless of the gate — deferral delays, never prevents).
   The band was tuned on a different substrate; on courtship roads the
   review reference needs re-basing before it can judge anything.
3. **Channel attribution was not instrumented**: the sweep records that
   readiness passed but not WHICH channel (a/b/c) released each hold.
   A confirm run must log the releasing channel per unlock — Steve's
   balance calls (P>=20, 2 types, 2 tricks) need per-channel evidence.
4. **Same-day reminder/release overlap** (sense, d115): the weekly
   reminder can fire on the release day itself (early-day read while the
   releasing kill hasn't landed yet). Same-day ordering artifact, not a
   logic bug — but the reminder should suppress when the unlock beat
   fired that day.
5. The `national >= control-2` guardrail was pre-registered per 8-seed
   suite; this run used 16 runs/side (2 roads). Applied as >= control-2
   on 16 (stricter) — held regardless (9 >= 4).

## SENSE-TESTING (armed leadfeast s33 — 40d held, wave-4 d97, survived 180)
- The deferral beat fires in the System's voice at the hold (d57) and
  names the bar honestly: "Prove you can meet the war — KILL what hunts
  you, LEARN its tricks, ARM YOURSELVES — and the Mirror Draft opens."
  Weekly reminders d64/71/78/85/92 keep the hold legible, never nagging.
- Release composes correctly: wave-5 deferral beat at d104 ("the fifth
  draft stays in the wings"), wave-5 unlock at d115, then the village
  kills The Congregation by village hands at d123. The village is never
  told it's ready — it becomes ready and the world responds.
- Post-release 30d window: no wave-4 combat deaths on this seed; the
  death lines are raids and contests ("Oscar of The Bloodied... walks
  back with nothing. They'll remember the silence." then the raid).
  Consequential, human, in-fiction.
- PASS on meaning and coherence. The one wart is the d115
  same-day reminder/release overlap (metric review #4).

## Village assessment (plain words)
The armed villages are the control villages with a held door — and the
door changes their fate the way the proposelayer's open door did, in
reverse. Control villages climb socially and get promoted into wars:
wave 4 at day 37-55 on the fast seeds, and the treeline collects its
tithe (median 109 days). Armed villages hit the same Standing numbers
and hear the System say *not yet* — and in the held weeks they do the
things the bar names: they kill, they learn, they armor. When the Mirror
Draft opens at day 76-97, it opens onto villages that have already been
fighting wave 3 for a month. Median survival 180, national 9/16, table
11/16. The gate doesn't make villages stronger; it stops promoting them
until they are.

## Blanks filled / documented
- FILLED (then killed): the readiness gate itself — built in
  `src/js/standing.js` only, proved RED->GREEN 30/30, det-gated 16/16 both
  sides, measured against its own paired control, killed per protocol.
  Reverted byte-clean; instruments kept.
- DOCUMENTED (sim-findings backlog): (1) the counter channel (b) is dark
  for wave-5 readiness — no wave-4+ def carries a `counter` field and
  villagerTrickDefs covers only 3 wave-3 signatures; until the copy-only
  monsters get real counterplay, wave-5 readiness rests on kills and
  armor. (2) docs/MONSTER-WAVES.md has no readiness concept — the canon
  doc updates only if a future run lands the gate. (3) The wave-4
  0.20-0.60 unlock band needs re-basing on the courtship substrate
  (both sides measured 0.688).
- DOCUMENTED: the pre-reg primary (holder rate x1.25) is unusable for a
  deferral mechanism — it measures a population the gate shrinks by
  construction. Next run: absolute 30d post-unlock deaths.

## Convergence
scale-onramp: CONVERGING (unchanged). The readiness gate is a real,
working answer to the #209/#210 lethal pattern (4 -> 1 post-unlock deaths,
median +71d, all guardrails hold), but it was killed on its pre-registered
primary — the metric, not the mechanism, failed. The axis does not move
until a confirm run with a population-honest primary lands a version of
this gate.

## Files
- `src/js/standing.js` — REVERTED byte-clean per kill protocol (no trace).
- `scripts/test-readinessgate-20261015.js` — proof, REAL RED -> GREEN 30/30;
  now INFO-SKIP exit 0 on pristine (kept).
- `scripts/det-gate-readinessgate-20261015.js` — det-gate 16/16 identical,
  both sides (kept).
- `scripts/sweep-readinessgate-20261015.js` — pilot sweep, SMOKE=1 gate,
  in-script pristine/armed swap with byte-verified restore (kept).
- `scripts/sense-readinessgate-20261015.js` — beat-capture sense replay
  (kept).
- `evidence/2026-10-15/sim-readinessgate.json` — full per-seed rows both
  sides (kept; telemetry-check inputs: national, table, wins, exiled
  per-row fields present — coordinator owns the baseline roll).
- `evidence/2026-10-15/sim-readinessgate.md` — this file.
