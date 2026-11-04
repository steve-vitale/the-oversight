# Veterans-production diag — PRE-REGISTRATION (arm sim-vetprod-b)

Run: fleshout-loop-b-20261104T2015Z. Loop B re-point queue, tracker
next blank #2 (sharpened 1830Z as "the real 199-hold cause").
Committed BEFORE any judged sim. DIAG ONLY, zero src/js — a
recorder/instrument, no game change. Gates, prices, deeds, and
readyDemand stay UNTOUCHED. No balanced-panel comparison exists
for a pure diagnostic (§15) — stated, not fabricated, not omitted
silently.

## Canon read before this prereg

- `docs/CANON.md` (manifest) + `docs/MONSTER-WAVES.md` §§Wave 4/5
  and "Combat readiness gates the standing unlock": "Standing
  opens the wave door; combat readiness decides whether the
  village walks through." No canon invented here.
- Code-read (not canon, stated with file/function names):
  `src/js/standing.js` `waveCombatReadiness(w)` counts VETERANS as
  DISTINCT killer vids with a wave-(w-1)+ kill in
  `state.waveKillLog`, LIVING only by default (the default-OFF
  `VETSHAPE=1` instrument counts living-OR-DEAD; NOT flipped
  here). For wave 5 the demand is 2 living villagers with
  wave-4+ kills. `src/js/game.js` `recordWaveKill(monsterId,
  killerVid, via, detail)` is the per-kill choke point; every
  real kill (player TB, villager field fight, contest) flows
  through it and appends `{d, mid, w, by, via, trick}` to
  `state.waveKillLog` (dedupe on exact day/monster/killer/via/
  trick; 1000-entry cap). `src/js/game.js` `waveEngaged(w)`
  reads the deed feed `deedState().wavesFaced`, fed by real
  `startCombat` / `fieldFight` / `recordWaveKill` only — fleeing
  counts as faced, pre-combat evades and dead villagers record
  nothing.
- The monster-veteran distinction (code-read, standing.js +
  game.js): a MONSTER veteran is a hardened older-wave monster
  (spawn-flagged, +HP/damage/speed); killing one counts toward
  the readiness bar as its BASE wave only. The VILLAGER
  veterans bar counts living villagers with wave-(w-1)+ kills
  in the log. The two "veteran" concepts are separate; this arm
  measures the villager bar only, and names monster-veteran
  kills as base-wave kills wherever they appear.

## Prior evidence read (not re-run)

- `evidence/2026-11-04/sim-standaccum-b.md` + prereg: the finding
  being explained. Gearbar band 99101–99108, competent verbatim,
  150d death-aware: peak raw standing 355 / 215 / 180 / 225 /
  140 / 150 / 50 / 20; three seeds clear 200 raw and hold at
  gated 199 with veterans the ONLY short readiness-5 bar at
  peak (0 of 2 on all three); max living wave-4 killers
  1 / 0 / 1 / 1 / 1 / 0 / 0 / 0 vs demand 2; wave-4 faced on
  4/8 seeds (99101, 99103, 99104, 99105); wave-5 faced 0/8;
  readiness-5-ready days 0/8. Those are this arm's baseline
  observations, not numbers this arm re-derives from scratch —
  this arm re-measures the same band with a kill-level recorder
  and classifies WHY the bar stays short.
- `evidence/2026-10-24/sim-vetkill-a.md` (arm sim-vetkill-a):
  classification precedent NEVER-KILLED vs KILLED-DEAD-KILLER
  vs killed-living; the waveKillLog recorder; the
  killer-death-in-arena finding; the intraday lesson (daily
  samples MISS a kill-then-die-same-day veteran — the log is
  authoritative for "did a kill happen"); and the fallen-map
  lesson (first-entry-wins per vid is NOT credible for killer
  timing — this arm records the FULL fallen list and uses the
  earliest fallen entry with day >= kill day, flagging any
  death-day-before-kill-day anomaly instead of timing from it).
- Fight-interior arms' verdicts (read as context, NOT rebuilt
  here): finishing, not just damage or staying, binds wave-4
  kills. This arm does NOT re-decompose fights; it attributes
  the veteran shortfall per seed on the gearbar band.

## Primary question

On the gearbar band seeds 99101–99108 under competent play
verbatim, why do villages hold 0 of 2 living wave-4 veterans
at peak — is it no wave-4 encounter, encounters without kills,
kills whose killers die, or kills whose killers live but never
reach 2 at once?

## DIAG-GO bar (binding — judge only against this)

DIAG-GO iff ALL of:
1. All 8 seeds classified into exactly one per-seed class below
   (OTHER only with a named cause in words; a forced fit is a
   misclassification, not a classification).
2. One dominant class, OR one pre-named two-class split below,
   accounts for the shortfall on at least 5 of 8 seeds.
3. Instrument errors 0 on all judged seeds (wrap errors,
   snapshot errors, log-copy errors, and unresolvable killer
   fates all count; a flagged chronology anomaly with a
   credible alternate timing source does NOT count if the
   seed's class does not depend on it — stated per seed).
A miss on any clause is DIAG-NO-CANDIDATE, never re-scored
against a friendlier metric mid-run. INSUFFICIENT-DATA only if
more than 2 seeds carry instrument errors. Metric problems go
under "metric review" for the NEXT run.

Pre-named two-class splits (stated here, before any judged sim;
either may carry clause 2 if it reaches 5/8):
- Split S1 "kills don't stick": KILLED-DEAD-KILLER +
  KILLED-LIVING-SHORT (kills happen; the bar fails on
  survivorship or simultaneity, not on opportunity).
- Split S2 "no kill opportunity": NEVER-FACED-WAVE4 +
  FACED-NO-KILL (no wave-4 kill exists for any bar to count).

## Per-seed classes (assigned by the analyzer, in this precedence order)

1. `NEVER-FACED-WAVE4` — no wave-4+ fight-start event captured
   (player-TB or field), no wave-4+ entry in the deed faced
   feed, and no wave-4+ kill. (A seed that never met wave 4
   cannot have a wave-4 killer.)
2. `FACED-NO-KILL` — wave-4+ faced (event or deed feed) but zero
   wave-4+ kills in the log.
3. `KILLED-DEAD-KILLER` — wave-4+ kills exist, and ZERO wave-4
   killers are alive at end of run (all killers dead; death
   days from the full fallen list).
4. `KILLED-LIVING-SHORT` — wave-4+ kills exist, at least one
   wave-4 killer is alive at end of run, but the reconstructed
   maximum simultaneous living wave-4 killers (see method) is
   < 2 — kills happened, killers live, but never 2 at once.
5. `OTHER` — named cause in words. Covers, among others: a
   reconstructed maximum simultaneous living wave-4 killers
   >= 2 at some point while the peak-gated-standing snapshot's
   vet bar is still short (a timing/peak mismatch, not a
   production failure — the bar was met, just not at peak);
   a seed whose class genuinely depends on an unresolvable
   killer fate (then the instrument-error clause also fires).

Precedence note: a seed with 1 living + 1 dead killer and max
simultaneous living 1 is KILLED-LIVING-SHORT (killers live,
fewer than 2 at once), not KILLED-DEAD-KILLER — class 3
requires ZERO living killers at end. A seed with kills only
via monster-veteran (hardened older-wave) monsters counts
those kills at their base wave: a wave-3-base hardened kill
is NOT a wave-4 kill and cannot move a seed out of
FACED-NO-KILL.

## Method

- Policy: `scripts/policies/competent.js` `{competent}` verbatim,
  default env. No policy variants — diag, not lever.
- Seeds: 99101–99108, the gearbar band re-run on CURRENT
  master. Trajectories WILL drift with base moves since
  standaccum; cite only this run's numbers. Band-level
  pairing with standaccum, not trajectory-identical pairing.
- Horizon: 150 days, death-aware (dead villages stop
  simulating; +10d tail max via the harness's runDays death
  handling). This diag IS the 8-seed pilot-scale run; no
  confirm follows in this run (per brief).
- Instrument (`scripts/vetprod-instrument-20261104.js`,
  `scripts/vetprod-driver-20261104.js`,
  `scripts/vetprod-analyze-20261104.js`): pure-read wrappers
  plus daily snapshots, zero src/js, zero game-state writes,
  zero RNG draws:
  - Fight-start events: wrap `Game.startCombat` (player TB
    fights) and `Game.fieldFight` (villager fights: wild,
    patrol, sortie, aid, and contest blood/hide/beastmaster
    fights — the engine does NOT tag contest vs wild
    separately at the fieldFight call site, so the faced
    split reported is player-TB vs field, with the
    fieldFight opts fingerprint recorded; contest share of
    KILLS is exact via recordWaveKill `via='contest'`).
    Monster wave from `Game.data.monsters` by id (fallback:
    mdef.wave when the call site passes a def).
  - Kill log: post-run copy of `state.waveKillLog` (append-only,
    survives killer death) + per-kill via channel; monster
    wave from the log's own `w` field, cross-checked against
    `Game.data.monsters`.
  - Killer fate: FULL `state.village.fallen` list (all entries
    per vid, not first-wins) + end-of-run living check
    (vid == current scholar id, or `Game.getPerson(vid)` not
    dead). Days kill→death = earliest fallen entry for that
    vid with day >= kill day, minus kill day; a killer with no
    such entry counts alive. Any fallen entry with day <
    kill day for that vid is flagged as a chronology anomaly
    (vetkill's ethan_hunt lesson) and never used for timing.
  - Daily snapshots (policy.daily wrapper, same pattern as
    standaccum): day, roster/living, gated + raw standing,
    `waveCombatReadiness(5)` (engine vet bar), cumulative
    distinct wave-4+ killers so far, cumulative wave-4+
    kills, `waveEngaged(4)` distinct types faced, unlocked
    wave. Reconstructed max simultaneous living wave-4
    killers: from the log + fallen timing, a killer counts
    living on days [killDay, deathDay) — a same-day
    kill-and-die contributes to NO day (fleeting, as the
    engine's end-of-day bar would also miss it) — cross-
    checked against the daily engine vet-bar maximum.
  - Peak-gated-standing snapshot: the first daily snapshot at
    the run's maximum gated standing, with its readiness-5
    vet bar recorded verbatim.
  - Sense-test: fight/kill-related say-lines sampled (cap)
    for coherence against the numbers; the standing hold
    line is quoted where it names the vet bar.
  - Scale-wall numbers every run: national / table / wins,
    wave 4–5 unlocks and facings, median survival (scaleRank,
    unlockedWave, runDays result, won/over flags) — baseline
    observations by this corpus, not wall-movement claims.
- Neutrality leg (proof test, NOT judged): one short off/on
  driver comparison (same seed, 30d) must show identical days,
  endReason, and waveKillLog length with the instrument on
  vs off — the wrappers are pure reads.
- Staging per docs/MEASUREMENT.md §§9–12, 14–15: pilot gate
  (this 8-seed run), death-aware horizons, pre-registration
  (this file), metric binding (§14), balanced panel (§15 —
  inapplicable for a pure diagnostic; stated above).

## Metric review (placeholder — filled in the evidence file, §14)

- To be written after the run: whether the faced split
  (player-TB vs field), the reconstructed simultaneity, and
  the precedence order held up; whether any seed needed OTHER.
