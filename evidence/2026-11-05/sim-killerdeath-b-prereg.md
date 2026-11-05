# Wave-4 killer retention (simultaneity) — PRE-REGISTRATION (arm sim-killerdeath-b)

Run: fleshout-loop-b-20261105T0330Z. Axis: scale-onramp, winnability chain
(wild ally-join → wave-4 kills → veterans → readiness-5 release → wave-5
facing → full seat). Committed BEFORE any judged sim. Policy-side probe
only; zero src/js. NO gate/price/deed/readyDemand/VETSHAPE-default change.
If the probe GOes, the game-code build is a NEXT run's arm, not a silent
addition here.

## Canon read before this prereg

- `docs/CANON.md` (manifest) + `docs/MONSTER-WAVES.md` §§Wave 4/5 and
  "Combat readiness gates the standing unlock": "Standing opens the wave
  door; combat readiness decides whether the village walks through." Wave 5
  demands 2 LIVING villagers with wave-4+ kills. No canon invented here.
- Code-read (not canon, stated with file/function names):
  `src/js/standing.js` `waveCombatReadiness(5)` counts VETERANS as DISTINCT
  killer vids with a wave-(w-1)+ kill in `state.waveKillLog`, LIVING only.
  `src/js/game.js` `recordWaveKill(monsterId, killerVid, via, detail)` is
  the per-kill choke point (append-only log, survives the killer's death).
  `src/js/ledger.js` `playerDeath(cause)` is the scholar-death choke point;
  its fallen push defaults cause to 'the wild' when the caller passes none
  — so a fallen 'the wild' is a RESIDUAL, not a cause, until split by
  other evidence. `src/js/villager-agency.js` `expedDeath` threads
  monsterId/monsterName into its fallen push; `src/js/game.js`
  hurtVillager threads monsterId/monsterName via damageContext.
  Competent policy (`scripts/policies/competent.js`) drives the SCHOLAR
  only: daily outward legs (stoneRun, forageTripSeedFirst, counterPlay,
  vinebank blind band, workTrapline), upkeep (eat/drink/gear/feasts/aid),
  fights (fight hook). It defines NO pending() and NO contest() hook, and
  never answers lingerer beats (no answerLingerer call site) — so pending
  encounters (harness startCombat fallback), contests (harness
  contestChoose fallback), and lingerer sorties are outside BOTH arms
  equally. NPC villagers act through engine agency (expeditions, field
  fights); no policy hook holds an NPC back.

## Prior evidence read (not re-run, not re-proved)

- `evidence/2026-11-04/sim-vetprod-b.md`: band 99101–99108, competent
  verbatim, 150d: 4 NEVER-FACED-WAVE4, 3 KILLED-DEAD-KILLER, 1
  KILLED-LIVING-SHORT; killers die a median 3.5d after first blood and
  never overlap (max simultaneous living veterans 1 on every seed).
- standaccum2-b (briefed, held, fresh band 99111–99126): same pattern —
  two living killers NEVER coexist, kill-to-death median 11d, 13 wave-4
  kills in 131 fights, gated standing peaks at 199 with veterans the only
  short bar. The binding shortfall is killer SIMULTANEITY, upstream of
  standing. This arm does NOT reuse those bands and does NOT re-prove them.

## Question

How do wave-4 killers die, and would keeping a fresh killer out of harm's
way until a second is blooded create a living pair?

## Design (staged per docs/MEASUREMENT.md §§9–12, 14–15)

- Fresh band 99131–99138 (never used by prior arms), competent policy
  verbatim for the baseline, 150d death-aware horizon (reachability lever,
  §10; dead villages stop simulating, +10d tail max via runDays).
- Stage 0 smoke (2 seeds, 99131–99132, to /tmp, NOT judged): instrument
  fires — killer identity, first-blood day, death day + split cause,
  village state at death. Smoke result (not a judged number): 0
  instrument errors; 99131 died day 40 never-faced, 99132 died day 69
  faced-no-kill (1 wave-4 TB fight, 0 kills). Smoke HYPOTHESIS (judged
  data decides): all 3 smoke scholar deaths carry fallen cause 'the wild'
  with the playerDeath-wrap context at-haven TRUE, in-combat TRUE, map
  (4,4) — i.e. scholars dying IN COMBAT AT HAVEN, not out in the wilds.
  If judged killer deaths are likewise home-combat deaths, retention
  (which removes outward exposure only) cannot save them.
- Baseline: POLICY=baseline on 99131–99138. Probe: POLICY=retention on the
  SAME seeds (identical seeds, policy-side only).

## Retention probe — exact definition (the only probe; no mid-run improvisation)

Trigger: the current scholar (Game.villagerId) has a wave-4+ entry in
state.waveKillLog with 0 < (today − killDay) ≤ 30 (window restarts from the
latest such kill; a kill during retention extends it). Implemented in
`scripts/policies/competent-retention-killerdeath-b.js`.

On retention days, competent.daily is replaced by a haven day, each step
try/catch-guarded: walk home if away (walkHome to DIR_FLEE_HAVEN (4,4)),
sortHaul, armUp, keepKnife, donateHaul, talkRound, keepPromises,
competentEat. Skipped on retention days: stoneRun, forageTripSeedFirst,
counterPlay, vinebank blind band, workTrapline, lootCorpses, deepTalk,
teachRound, answerAidBeats, doorstepStep, goHomeStanding (subsumed by the
walk-home step). Haven chores (teach/talk/promises) are NOT all preserved:
teachRound and deepTalk are skipped (not exported by competent.js), talkRound
and keepPromises are kept — stated cost, not a hidden one.

Upkeep runs VERBATIM 3x/day on retention days (eat/drink/gear/feasts/aid —
hydration stays managed). The driver sets COMPETENT_SEEK_FIGHTS=0 during
probe runs, which makes feastFightRoad return immediately via its own env
gate — no feast patrol sweeps to far tiles. Facing a feast draw at the
haven's edge (faceFeastDraw) still runs: home defense, not an outing.

NOT changed by the probe (stated limits): fights (competent.fight verbatim
— a fight starting at home is fought normally; retention removes EXPOSURE,
not skill); pending encounters (no competent pending hook; harness
startCombat fallback faces them); contests (harness-driven, unavoidable by
design); lingerer sorties (competent never answers them in sims, both arms
equal); NPC killers (engine agency is autonomous — the probe covers
scholar-killers ONLY; an NPC fresh killer stays exposed, and that limit
bounds any GO claim to the scholar channel).

Probe application is observable in-corpus: daily snapshots carry
retentionActive, scholar map position, and scholarAtHaven (instrument pure
reads). runDays does not return the policy ctx, so per-step haven-day
errors are NOT counted in the corpus — stated limitation; application is
judged by the snapshot flags and positions, not by ctx counters.

## Primary metric (binding — judge only against this)

Seeds with ≥ 1 DAILY ENGINE snapshot day with readiness5.veterans ≥ 2
(the brief's literal "snapshot day"). Reconstructed maxSimultaneous ≥ 2
(log + fallen reconstruction) is a CROSS-CHECK only: a reconstructed pair
with no snapshot day is a fleeting pair, reported not scored.

GO iff retention ≥ 2/8 seeds with a living pair AND baseline 0/8 — or, if
baseline is nonzero, retention beats baseline by ≥ 2 seeds. Anything else
is NO-GO (miss is NO-GO, never re-scored against a friendlier metric).
Pilot 8 seeds only; confirm 12–16 on FRESH seeds, same design, ONLY on
pilot GO. If the probe is inexpressible or the pilot is NO-GO with a clean
diagnostic census, the verdict is DIAG-NO with the census as deliverable
(the brief's diagnostic fallback); the GO/NO-GO bar above still binds the
pilot itself.

## Secondary (reported, never re-scored)

- Kill-to-death median (first kill → death, dead killers only).
- Death-cause shares over DEAD wave-4 killers, by SPLIT category:
  monster:<name> (fallen monsterId/monsterName), scholar-death:<causeArg>:
  <at-haven|away>:<in-combat|pending-encounter|not-in-combat> (playerDeath
  wrap), contest, the arena, combat, a wound that wouldn't close, thirst,
  other literal causes, and 'the wild (unsplit residual)' as its OWN
  category — never cited as a cause, always reported with its count and
  with last-seen tracker context (is-scholar, at-haven, on-expedition,
  health on the last day before death).
- Wall numbers every run: wins, national, table, wave 4-5 unlocks, wave 4-5
  faced, median survival days.
- Per-killer trajectories for the closest seed. Closest seed = highest
  maxSimultaneous, tie-broken by longest killer survival (alive at end
  beats any death span; else max kill-to-death days).
- Killer channel mix (player vs NPC via kill-time scholar capture) and
  retention days actually applied (snapshot retentionActive days) on probe
  seeds.

## Metric review (per §14; filled at verdict time, not now)

- Whether the snapshot-day primary missed fleeting pairs that mattered.
- Whether the 30d window / haven-day scope was the right retention shape.
- Whether baseline killer scarcity (few killers at all) made the pair
  metric uninformative on this band.

## Balanced panel (§15)

INAPPLICABLE, stated not fabricated: there is no Game-root change to
compare — baseline vs probe differ ONLY in the policy (competent verbatim
vs competent + retention wrapper) on identical seeds with an identical
instrument. That policy A/B is the comparison; no balance-panel compare
exists for a policy-side probe, and none is attached.

## Sense-testing law

Read transcripts/dialogue for at least one killer's death (death-day say
lines in the corpus, plus the death context): judge meaning, coherence,
consequences — never just counts.

## Proof (committed with this prereg, before judged sims)

`scripts/test-killerdeath-20261105.js` — 14/14 PASS (11 fixture tests:
classification, monster split, scholar-death split, wild residual,
same-day fleeting, living-pair snapshot, recon-pair-not-scored,
deadMap override, anomaly timing, determinism, retention window; live
harness smoke 5d; off/on neutrality leg 10d seed 99131: identical days,
endReason, kill-log length, 0 instrument errors). Instrument:
`scripts/killerdeath-instrument-20261105.js` (vetprod base + recordWaveKill
wrap + playerDeath wrap + killer tracker + probe-observability snapshot
fields). Driver: `scripts/killerdeath-driver-20261105.js`. Analyzer:
`scripts/killerdeath-analyze-20261105.js`. Probe policy:
`scripts/policies/competent-retention-killerdeath-b.js`.
