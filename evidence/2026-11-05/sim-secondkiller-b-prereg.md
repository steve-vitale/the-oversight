# Second-killer production — PRE-REGISTRATION (arm sim-secondkiller-b)

Run: fleshout-loop-b-20261105T0430Z. Axis: scale-onramp, winnability chain
(wild ally-join → wave-4 kills → veterans → readiness-5 release → wave-5
facing → full seat). Committed BEFORE any judged sim. Instrument-only;
ZERO src/js changes, no game-code lever, no policy probe variant. NO
gate/price/deed/readyDemand/VETSHAPE-default change. If this instrument
points at a build, that build is a NEXT run's arm, not a silent addition
here.

## Canon read before this prereg

- `docs/CANON.md` (manifest) + `docs/MONSTER-WAVES.md` §§Wave 4/5 and
  "Combat readiness gates the standing unlock": "Standing opens the wave
  door; combat readiness decides whether the village walks through." Wave 5
  demands 2 LIVING villagers with wave-4+ kills. Wave-4 bands (anchored):
  damage 35–95, HP 850–1500, pierce 0.2–0.5 — a 4–6 round fight for a
  godhood build (~220 dmg/round), so a normal party is far below that bar.
  No canon invented here.
- Code-read (not canon, stated with file/function names):
  `src/js/standing.js` `waveCombatReadiness(5)` counts VETERANS as DISTINCT
  killer vids with a wave-(w-1)+ kill in `state.waveKillLog`, LIVING only.
  `src/js/game.js` `recordWaveKill(monsterId, killerVid, via, detail)` is
  the per-kill choke point. `src/js/fieldFights.js` `fieldFight(vid, mdef,
  m, opts)` returns a record with `outcome` (vKill/mFlee/vFlee/vDie/evade/
  alreadyDead), `rounds`, `mDealt` (damage to the monster), `allyDealt`,
  `vTaken`, `mHpLeft`, `partySize` (= opts.allies + 1), `allyVid`,
  `intent`/`intentWhy` (learn-first vs engage), and trick fields; the
  lead IS the world-monster entity, so entry HP (m.hp at call time) +
  dealt damage reconstruct the damage fraction. Turn-based (player)
  fights end through `src/js/game.js` `tbEnd(result)` with the live
  `tbfight` fighters still readable before it runs; player strikes flow
  through `tbPlayerStrike`, ability uses through `useAbility` when
  present. Competent policy (`scripts/policies/competent.js`) drives the
  SCHOLAR only; NPC villagers act through engine agency (expeditions,
  field fights). The instrument wraps engine methods with pure reads and
  never throws into game code (killerdeath pattern).

## Prior evidence read (not re-run, not re-proved)

- Bands 99101–99108, 99111–99126, 99131–99138, 99141–99148 (per the
  brief): wave-4 kills are rare and two living wave-4 killers essentially
  never coexist.
- `evidence/2026-11-05/sim-killerdeath-b.md` (band 99131–99138,
  retention probe): killer retention kept killers alive longer yet
  produced 0/8 living pairs because the second killer was never blooded.
  The next blank, in order, is second-killer PRODUCTION: why, while a
  first killer lives, is a second killer almost never blooded?

## Question

While a first wave-4 killer lives, why is a second killer almost never
blooded — is it production (second candidates never reach a wild wave-4
fight), finishing (they reach fights but the party cannot convert damage
into a kill), or exposure/rotation (kills happen only when no first
killer is alive to lead, so the village never overlaps two killers)?

## Design (staged per docs/MEASUREMENT.md §§9–12, 14–15)

- Fresh band 99151–99158: verified free — no `99151`…`99158` token in
  `evidence/2026-11-05/*.md`, `evidence/2026-11-04/sim-*.md`, or any
  `perseed-*` filename in `evidence/2026-11-05/` at prereg time. (99149–
  99150 are also unused; the brief's band is kept verbatim, the gap is
  simply skipped, not claimed.)
- Competent policy verbatim (`scripts/policies/competent.js`,
  `competent` export, no wrapper, no env probe), 150d death-aware horizon
  (dead villages stop simulating, +10d tail max via runDays).
- 8 seeds only (pilot; this is a DIAG instrument run, no confirm owed).
- Stage 0 smoke (1 seed, 99151, to /tmp, NOT judged): instrument fires —
  per-fight records present, 0 instrument errors, field + TB wrappers
  restore cleanly (off/on neutrality leg, see Proof).
- Corpus to `evidence/2026-11-05/perseed-secondkiller-b/` (one file per
  seed, `instrumentErrors` 0 required; any instrument error is a loud
  failure to fix, not to paper over).

## Per-fight record (what the instrument captures)

For EVERY wave-4+ fight (field + player TB), and for wave 1–3 fights only
as counts (to keep corpus size sane, full records are wave-4+ only):
day, channel (field / player-tb), fighter vid, monster id, wave,
monster entry HP, damage dealt (field: mDealt + allyDealt; TB: monster
HP lost across the fight as read at tbEnd), damage fraction of entry HP,
rounds, swings attempted (field: rounds as the leader-strike proxy,
stated — one leader strike per round minus medicine/trick rounds, ally
strikes tracked separately via allyDealt/allyVid; TB: tbPlayerStrike
calls counted while the fight is open), party size present (field:
rec.partySize + allyVid; TB: human fighters alive at tbEnd), party
member vids where the engine exposes them (field allyVid; TB human
fighter vids), gear tier of fighters (equipped weapon id + bonus,
equipped armor id + protection, captured pre-fight, best-effort with
nulls — null is "not readable", never zero), abilities actually used
(TB: useAbility calls while the fight is open; field: rec trick fields
+ trickLog where present), fight ending mapped to kill / flee / death /
other (field vKill → kill, mFlee/vFlee → flee, vDie → death, evade/
alreadyDead/judges → other; TB won → kill-or-rout, fled → flee,
lost → death, other results → other — TB "won" is NOT counted as a
kill unless a recordWaveKill row for the same day/monster/killer
exists; the kill log is authoritative for kills), killer identity and
whether it was their first wave-4 kill (from the waveKillLog +
killsLive join, as in killerdeath), days since the village's first
blood (first wave-4 kill day in the log, or null if none yet), and
whether the first killer (if living at fight start — living judged by
the fallen roll + deadMap rule from killerdeath) was in the fight
(field: fighter vid or allyVid equals the first killer; TB: scholar
is the first killer or a human fighter vid equals it).

Derived per fight (analyzer, never hand-scored):
- firstKillerAliveAtStart: yes / no / no-first-killer-yet.
- secondCandidatePresent: a fighter (leader or ally) who is NOT the
  first killer and has no wave-4 kill yet at fight start.
- partyBucket: solo / leader+1 / larger (partySize 1 / 2 / 3+).
- killBy: killer vid or null; firstWave4Kill: yes/no for that killer.

## Primary metric (binding — judge only against this)

Wave-4 kill rate per wild wave-4 fight, split three ways (all splits
computed by the analyzer from the corpus, never re-derived by hand):
(a) first killer alive at fight start vs none alive (and vs no first
killer yet, reported separately — it must not be folded into "none
alive");
(b) party size present (solo / leader+1 / larger);
(c) a would-be second killer present in the fight vs absent.
Plus the supporting per-fight fields above (gear, abilities, swings,
damage fraction, ending, killer identity/first-kill flag, days since
first blood, first-killer-in-fight flag).

## DIAG verdict rule (pre-registered — the verdict is a ranked cause table, NOT a GO/NO-GO)

The verdict ranks three causes — PRODUCTION, FINISHING, EXPOSURE/
ROTATION — by which split pattern the corpus shows. Each cause has its
implicating pattern stated IN ADVANCE; a pattern that does not appear
cannot be claimed, and the ranking follows the patterns, not a
friendlier re-read:

- PRODUCTION (party/presence problem) is implicated FIRST if second
  candidates are rarely present in wild wave-4 fights at all — i.e.
  secondCandidatePresent fights are a small minority of wild wave-4
  fights while first killers live, regardless of what happens inside
  those fights. Supporting pattern: most wild wave-4 fights are solo
  or first-killer-led with no fresh face in them.
- FINISHING (damage/conversion problem) is implicated FIRST if second
  candidates ARE present in a substantial share of wild wave-4 fights
  yet kills stay near-zero AND damage dealt is a small fraction of
  monster entry HP (median fraction well under half) in those fights.
  Supporting pattern: fights end by flee/death with the monster still
  holding most of its HP, across party sizes.
- EXPOSURE/ROTATION is implicated FIRST if kills concentrate in fights
  where no first killer lives (or before any first blood) while fights
  with a living first killer produce kills at a much lower rate — i.e.
  the village bloods killers one at a time and never overlaps them,
  because the first killer's presence crowds out (or out-survives)
  fresh blood. Supporting pattern: kill rate with a living first
  killer ≪ kill rate with none alive, on comparable party sizes.
- If two patterns both appear, the verdict ranks by the sharper
  contrast (the split with the larger rate gap / the scarcer
  precondition) and says so; if no pattern appears cleanly (e.g. too
  few wild wave-4 fights to split at all), the verdict is INCONCLUSIVE
  with the exact instrument gap named — never a forced ranking.
- A miss is NO-GO on re-scoring: the verdict is judged strictly against
  this prereg. A split that was not pre-registered here may be reported
  as an observation, never as the verdict's basis.

## Secondary (reported, never re-scored)

- Wall numbers every run: wins, national, table, wave 4-5 unlocks,
  wave 4-5 faced, median survival days.
- Per-seed table: days, end reason, wave-4 fights, wave-4 kills,
  killers ever, living killers at end, living-pair snapshot days
  (readiness5.veterans ≥ 2, cross-check only — not the verdict).
- Village assessment in plain words (what the village looked like,
  who thrived/died and why, what was missing) and the named next blank.
- Sense-testing law: read at least one fight's transcript/log for
  coherence (death-day say lines + one field-fight log), judged for
  meaning, not just counts.

## Metric review (per §14; filled at verdict time, not now)

- Whether the field-rounds swing proxy understated or overstated
  attempted damage, and whether TB "won" without a kill-log row
  distorted the kill rate.
- Whether gear capture nulls (unreadable gear) biased any gear split.
- Whether 8 seeds / 150d gave enough wild wave-4 fights to split three
  ways, or the band was too thin for the question.

## Balanced panel (§15)

INAPPLICABLE, stated not fabricated: there is no Game-root change and
no policy variant to compare — one instrumented baseline corpus on
identical seeds to nothing. No balance-panel compare exists for a
single-arm instrument run, and none is attached.

## Proof (committed with this prereg, before judged sims)

`scripts/test-secondkiller-20261105.js` — fixture tests (split
computation, first-killer-alive rule, second-candidate rule, TB-won-
without-kill-log rule, damage-fraction rule, determinism) + a live
harness smoke (5d) + an off/on neutrality leg (10d, seed 99151:
identical days, endReason, kill-log length, 0 instrument errors).
Instrument: `scripts/secondkiller-instrument-20261105.js` (killerdeath
base extended to per-fight party/damage/swing records; field + TB
wrappers). Driver: `scripts/secondkiller-driver-20261105.js`. Analyzer:
`scripts/secondkiller-analyze-20261105.js`.
