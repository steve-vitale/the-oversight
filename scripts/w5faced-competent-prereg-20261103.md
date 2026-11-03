# Wave-5-fought wall, competent-policy population diagnostic — pre-registration
(run fleshout-20261103T0940Z, Loop A, axis scale-onramp, arm sim-w5faced-a,
0815Z next blank 3)

Committed BEFORE any judged sim. Measurement only: zero `src/js` changes,
zero policy changes, zero default flips. New files only (instrument +
driver + analyzer + proof test + per-seed corpus + this prereg + evidence).
The sibling arm sim-sortietarget-a owns `src/js/havenGrowth.js` and
`src/js/app.js` this run; this arm touches neither, and no file it writes
overlaps a sibling arm's files.

## What the 0316Z arm already proved — NOT re-run here

`evidence/2026-11-03/sim-w5faced-a.md` (run fleshout-20261103T0203Z,
closecommit policy stack, 5 legs, 4 wave-5-unlocked seeds) separated the
bottleneck on SELECTED unlocked seeds: the wave-5 pool is full from unlock
day (6 kinds), spawn opportunity is scarce inside a post-unlock window the
lesser-seat win truncates (~1 faced kind per 25–30 unlocked days; no seed
reached the 2 distinct kinds the full seat needs), cast/trigger are zero
everywhere, and `finale_crew` (campaignOnly) inflates raw spawn counts.
Open from that arm, carried here as premises to test — not re-proved:
(a) the Rerun spawns on the player's tile and never engages (mechanism
unknown — needs a villager/world-monster behavior instrument, not this
spawn-stage one); (b) the analyzer must split campaignOnly spawns out of
fight-candidate spawns; (c) the readiness-hold premise is DEAD — the
0316Z closeout measured standing-only gating (`unlockedWave()` reads
standing t5 = 200 plus wave-4 faced; readiness bars are display/endGate
fields, not the pool gate). This prereg uses the corrected gate story.
No seed, policy stack, or corpus from 0316Z is re-judged here.

## Questions (two legs, one diagnostic)

(a) SPAWN SCARCITY, population rate: in UNSELECTED competent-policy long
runs — not seeds chosen because they unlocked wave 5 — how often does a
wave-5 monster spawn (fight-candidate), get faced in the wild in normal
play, or get fought at all? Quoted as rates per seed-run with denominators,
not vibes and not conditional-on-unlocked rates alone.
(b) THIN CONVERSION, chain: of wave-5 facings in those runs, how many
convert to kills, to deed progress, or to wave-5 unlock progress — and
where does the chain thin out (spawn -> face -> fight -> kill -> deed ->
unlock)? The chain is reported per seed and in aggregate, with the
campaignOnly split applied at the spawn stage.

## Canon read first

- docs/CANON.md, then docs/MONSTER-WAVES.md: wave 5 = The Producers
  (cancellation, editor, rerun, spoiler, timeslot, nielsen, finale,
  network_note, plus campaignOnly finale_crew / finale_opening); gate =
  village standing >= 200 AND wave-4 faced (flexible-route call,
  2026-10-13); spawn ratios w5: 55/20/12/8/5; deed gate needs 2 DISTINCT
  wave-5 kinds faced (5/5/4/3/2 per waves 1–5, `deedGateReady()`).
- docs/SCALE.md / docs/SCALE-DISCOVERY.md: village -> regional -> national
  -> global ladder, one rung per season; national is the scale context in
  which wave 5 becomes reachable, not a metric this arm judges.
- docs/MEASUREMENT.md §§9–12, 14–15 (staged, pre-registered, death-aware,
  metric binding, balanced panel). No canon doc covers this
  recorder/instrument; the 0316Z instrument + prereg are the governing
  docs for the stage order, corrected as noted above. No canon invented.

## Stages (per seed, wave 5 only; same stage order as 0316Z, plus kills)

0. Gate: first day `unlockedWave() >= 5`; days unlocked (unlock day ->
   run end); standing at unlock and at end; wave-4 faced count at unlock.
1. Pool / target: `monsterWavePool()` wave-5 entries at unlock and daily
   after; `spawnWaveTarget()` calls returning 5, with total calls in the
   post-unlock window as denominator.
2. Placed: `spawnWorldMonster()` wave-5 rows, SPLIT into fight-candidate
   (def `campaignOnly` false) vs campaignOnly (`finale_crew`,
   `finale_opening`); tile, distance to player/home, caller.
3. Offered: `castMonster()` wave-5 returns, `triggerEncounter()` wave-5
   calls, wanderer wave-5 days.
4. Fought / ended: `startCombat()` wave-5 starts (identity captured at
   fight START, before the call — never a post-return `tbfight.id` read,
   per the 0815Z metric review); `fieldFight()` wave-5 rows by outcome;
   `tbEnd()` rows captured BEFORE the original call runs, carrying the
   pre-call monster-fighter list (ids, alive, hp) so a player-TB kill can
   be joined to its fight-start row; authoritative deed count =
   `deedState().wavesFaced` distinct wave-5 kinds at run end.
5. Killed / deed / unlock progress: player-TB kills = tbEnd result
   `won`/`routed` joined to a preceding w5 start row where a monster
   fighter of that id is dead at tbEnd capture (join quality reported:
   joined / unjoined tbEnd rows, monsterId readability rate);
   field kills = fieldFight outcomes `vKill`; deed progress =
   endGate w5 (distinct faced) and distance to 2; unlock progress =
   maxWave and endGate w5 at run end.
6. Removed without a fight: `removeWorldMonster()` wave-5 rows by
   caller/class, HP at removal, days alive — campaignOnly split applied.

## Primary metrics

Leg (a), per seed-run (denominator = all pilot+confirm runs, N = 20 if
confirm runs): unlockedW5 rate, fight-candidate spawnW5 rate, facedW5
rate (>= 1 distinct kind), foughtW5 rate (>= 1 start or field row),
spawnW5 per run, faced kinds per run. Conditional rates (unlocked seeds
only, faced seeds only) are reported SECONDARILY and labeled as such —
the headline is the population rate.
Leg (b), chain in aggregate and per seed: fight-candidate spawns ->
distinct faced kinds -> fights (starts + fields) -> kills (TB-joined +
field vKill) -> endGate w5 -> distance-to-2. The thinning stage is the
stage whose count collapses most sharply relative to its predecessor,
named with its counts. A bare "0 fought" restatement is NOT a pass.

## Horizon, seeds, policy — staged

- Horizon: 180 days, DEATH-AWARE (runDays ends on death/win; the 180d cap
  matches the 0316Z and 0815Z bands). Why not a fixed 200d: competent
  villages in prior bands end at median ~86–90d (death or lesser win);
  180d gives a post-unlock window room without simulating dead villages,
  and matches the band the 0316Z rates were measured on, so population
  rates here are comparable in horizon to the selected-seed rates there.
- Policy: `scripts/policies/competent.js` `{competent}` VERBATIM, default
  env (COMPETENT_WARM default ON; no other env flags set). This is the
  competent-player policy, not the 0316Z closecommit win-pursuit stack —
  that difference IS the new measurement: what an ordinary competent
  village meets, not what a seat-driving stack can force.
- Mode: `loadGame` mode string is manifest-only (sim-harness: mode feeds
  the manifest, nothing else); this arm uses mode `competent-w5faced`.
  One process per seed, seeds sequential (never two harnesses at once).
- Pilot: 8 fresh seeds 98901–98908. Freshness check at prereg time: no
  `s9890*` per-seed filename exists in evidence (checked 2026-11-03);
  the driver refuses to overwrite an existing per-seed file (it would
  abort rather than silently replace judged corpus — if a collision is
  found at run time, the band shifts and the shift is noted in evidence).
- Confirm: 12 fresh seeds 98911–98922, run IF AND ONLY IF the pilot
  instrument is clean (see diagnostic-complete below). If the pilot
  instrument is broken, NO confirm runs: the run reports the instrument
  failure loudly instead of publishing thin numbers.
- Wall numbers (descriptive only, never judged): national / table /
  wins, wave 4–5 unlocks, median survival, Arc reach, regional ->
  national, table waiting/done split (never the collapsed latch alone).
  They are context for the wall, not bars.

## Diagnostic-complete criteria (NOT GO/KILL bars)

Diagnostic verdicts are not GO/KILL bars (0815Z metric review). This run
is COMPLETE when ALL of the following hold; otherwise it reports
INCOMPLETE with the failing item named loudly:
1. Pilot 8 runs finish with `instrumentErrors` = 0 on every seed, and
   every wrapper's fire count is reported alongside any zero it is
   cited for (target/spawn wrappers must fire on every seed — total
   target calls and total spawns are denominators; a zero w5 count with
   a zero wrapper count is a broken instrument, not a finding).
2. Fight identity is captured at fight start on every start row
   (startWrapFires = startRows; tbEnd rows carry a pre-call fighter
   snapshot), and the tbEnd->start join rate is reported even if it is
   0 — no post-return `tbfight.id` wrap is used anywhere in this arm.
3. The analyzer reproduces the per-seed chain (gate -> pool -> target ->
   spawn split -> cast/trigger -> start/field -> tbEnd-join kills /
   field vKill -> faced -> endGate w5) for every pilot seed, and the
   aggregate reports both population rates (denominator = all runs)
   and conditional rates (labeled).
4. Confirm 12 runs finish under the same criteria (if triggered), for
   N = 20 total; if confirm is skipped under the rule above, the
   evidence states the skip reason and the pilot-only rates are labeled
   pilot-only, never presented as a 20-seed rate.
5. Sense read: the say transcript of the longest post-unlock stretch
   (or, if no seed unlocks wave 5, the longest run) is read and judged
   for meaning/coherence/consequences — including whether anything in
   the lines ever says a wave-5 fight matters for the full seat.
Panel note: no before/after comparison exists in this diagnostic arm
(no lever, no variant, one policy), so `scripts/balance-panel.js` has
nothing to compare — the analyzer output over the pilot+confirm corpus
is the instrument record, exactly as in 0316Z. No telemetry-baseline
roll-forward is claimed here; that is the coordinator's call (the
telemetry-check invocation refuses recorder corpora by design, as in
0316Z and 0815Z).

## Metric review (filled at closeout)

- (to be filled: whether the staged counts bound the run fairly, any
  revision proposed for the NEXT run only, and the precise next blank
  this diagnostic names — including, if kill attribution proves
  unjoinable without a game-code hook, that hook named as the blank
  instead of a fabricated kill count.)
