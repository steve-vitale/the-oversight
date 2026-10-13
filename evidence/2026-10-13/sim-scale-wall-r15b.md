# Long-run sim — scale-wall r15b: BEAM-DODGE (2026-10-13)

Lever 1 (combat) as a lens on the wall. Standing context: scale-onramp is the
blocking axis. r15 killed the armor answer at pilot (hide_armor recipe
unlearnable by design — chicken-and-egg; documented for Steve). r15's other
find: the gallowdeer beam lands 15/18 = 83% of its fire turns, including a
d26 seed-11 moment where an unarmored scholar ate fire turns of 95 and 70.
The remaining honest survival lever vs the benchmark monster is the
scholar's feet: learn the telegraph, break the track.

Canon constraint (Steve, standing): "The Highbeam Deer (160 HP) is the
benchmark — don't question its stats." Nothing in this run touches the
deer's stats, beam damage, or tracking. The lever is PLAYER-SIDE only.

## Pre-registration (docs/MEASUREMENT.md §11 — written BEFORE any run)

- **Primary metric:** beam fire-turn land rate (r15 convention: fired
  includes the ignition tick; landed = scholar HP dropped across the tick),
  before/after on identical seeds.
- **Secondary:** median survival, national reach.
- **Baseline to beat:** land rate 83% (15/18, n=18), median 84d, national 4/8
  (r15 on tip b2d1cf1d).
- **Horizon:** 150d, death-aware (dead villages stop; ≤10d tail).
- **Seeds:** 11, 22, 33, 44 (the wall suite). **Policies:** belongdodge /
  leaddodge = withBeamDodge(belongseek / leadcourt); before = BEAMDODGE_R15B
  unset (pure delegation, proven parent-identical in the proof's RED phase);
  after = BEAMDODGE_R15B=1.
- **GO for confirm:** land rate ≤ 50% on ≥ 20 measured fire turns AND median
  survival ≥ baseline + 10d (≥94d) → confirm 24 runs (12 seeds × 2 policies).
- **KILL AT PILOT:** land rate ≥ 70% (the dodge doesn't beat the track) OR
  median survival ≤ 74d (baseline − 10d).
- **Convergence state:** TBD at verdict.

## STEP 1 — the beam mechanics (engine truth, game.js, read 2026-10-13)

Ocular Discharge (monsters.json gallowdeer): beam, length 9, width 1,
windup 2, sweep true, fireTurns 6, sweepRate 0.18, cooldownTurns 2,
damage [20,30] psychic.

What the engine actually does (tbBeamSweepTick, tbBeamActionTick,
encDeclareBeam, tbBeamLaneCells):

1. **What it tracks:** the beam is a ray EMANATING FROM THE DEER that rotates
   toward the player's CURRENT tile (tgt.mx/my) — not position history, not
   velocity. Aim follows the FIFO queue head relentlessly ("walking away
   doesn't lose it"). Angular budget 0.18 rad/tick (pattern.sweepRate).
2. **Tick structure:** every PLAYER TILE MOVED triggers a visual-only sweep
   tick (tracks, no damage); tbAfterPlayerAction triggers one more per
   action; the DEER's own turns deal the damage ticks — ROTATE FIRST (up to
   0.18 toward the player's current tile), THEN damage. Ignition (first of
   the 6 fire turns) is the free "MOVE NOW" beat (no damage).
3. **Damage:** in-lane = rake x1; on-ray (perp < 0.75 tiles) = x(2.5+dwell),
   where dwell = unspent track budget (stand still → dwell ~1 → the beam
   parks); trapped (on-ray AND tbHasEscape false — no one-turn path out of
   the lane) = x3.5. The r15 "95 and 70" turns were trapped 3.5x hits.
4. **What breaks/degrades tracking:** NOTHING breaks the lock except killing
   the deer or the DISRUPT (a solid strike while the beam burns: 25%, 50%
   at d≥20 — "Your strike bites DEEP — the beam stutters and dies!"). Distance
   does not degrade it. Cover (wall/tent/door/fire) truncates the lane, but
   there is rarely cover in se_woodlands. Only angular displacement faster
   than 0.18 rad/tick defeats it.
5. **Telegraph legibility:** the freeze is narrated ("It freezes. Like a deer
   in headlights. Light gathers behind its eyes."), escalating ("The light
   behind its eyes swells to a painful glare."). The windup LANE is
   codex-gated (tbBeamLaneCells): an unknowing scholar sees only the freeze,
   not the lane. Once firing, the live beam is visible to everyone ("The beam
   carves a bright arc across the ground, swinging after its target").
   The policy reads exactly this: m.telegraph (freeze/live), tg.cells (lane
   only when the engine's own encTelegraphKnown says the pattern is learned,
   or while firing), tg.firing, tg.aimKey.

**Dodge math (why the arc can work):** per player turn (~3 tiles) the beam
consumes 0.18×3 (tile ticks) + 0.18 (action tick) + 0.18 (damage tick) ≈
0.90 rad of track budget. Three lateral tiles at Chebyshev 2 from the deer
displace ~1.3 rad around it — the scholar outruns the sweep. At Chebyshev 3
it's marginal (~0.95 vs ~1.07 needed); at 4+ the beam wins. The arc band is
d2–3, which is also exactly outside antler-thrash and recharge-paw range
(both need Chebyshev ≤ 1). The geometry and the safety band coincide — the
codex was right: "outrun it sideways (never down the lane)".

## STEP 2 — the lever (policy-side only)

`scripts/policies/beamdodge.js` — `withBeamDodge(base, id)`; arms
`belongdodge` (BELONG road) and `leaddodge` (LEAD road).
`BEAMDODGE_R15B=1` enables; unset → pure delegation.

Diegetic rules (a real player could do exactly this):
- UNKNOWN scholar: reacts to the visible freeze by moving (the fear
  reaction) — this IS the move_windup trick and teaches the counter (the
  honest learning curve: first encounter moves, counter discovered,
  subsequent encounters dodge properly). No precise pre-dodge (the lane is
  invisible), no arc-band optimization. During firing the beam is visible:
  step off the live lane.
- KNOWN scholar (counter discovered or codex 'slain'): pre-dodges during
  windup (arc setup at Chebyshev 2–3, off the warned lane); strikes the
  frozen deer when adjacent (free damage — the deer can't move, and d=1 is a
  perfect arc start); arcs around the deer every firing turn (maximize signed
  angular displacement along the path, stay in the d2–3 band, never end in
  the live lane). Never strikes into the burn (striking stands still → dwell
  ~1 → the full 3.5x).
- Never overrides flee: scholar HP < 35% or no move possible delegates to the
  parent (DPS-race/flee assessment). Never stalls a won fight: deer ≤ 20 HP
  delegates (finish it).
- Deterministic: no RNG draws in the layer.

Proof: `scripts/test-beamdodge-r15b.js` — 11/11 green, including a real RED
phase (gate off = wrapper parent-identical: per-round state signature
matches the raw parent exactly on the same seed; no bd* ctx keys; same beam
telemetry). GREEN (10 scripted beams/arm over 10 seeds, declared through the
engine's own encDeclareBeam): gate off 29/29 damaging ticks landed (100%;
the parent's strikes also break some beams via the honest DISRUPT — 29
measured of 60 declared); gate on 0/60 ticks caused HP loss (0% — the arc
dodged every damaging tick and every ignition; no antler thrash either
since the scholar stays at d2–3). The move_windup trick taught the counter
mid-fight in 10/10 dodge runs; the adjacent-windup strike branch verified
separately (2 free strikes, 24 damage, then 5 clean dodges).

Driver: `scripts/sweep-beamdodge-r15b-20261013.js` (reuses the r15 beam
instrument — hooks intact on this tip — plus scale + food-coupling rows).

## STEP 4 — pilot on identical seeds (completed 2026-10-13, arm A r16)

Rebase note: tree rebased b2d1cf1d → 5016b35d before any sims (the two
intervening commits: MEASUREMENT.md pilot-8-seeds + journey-landing r11).
Proof test re-run on the new tip: 11/11 green (RED parent-identical phase
intact). Baseline re-run on the new tip reproduced r15's numbers EXACTLY —
the rebase changed nothing behavioral: beam 15/18 = 83.3%, median 84d,
national 4/8. The "before" side below is the fresh re-run, not the orphaned
baseline.json (per arm-A brief).

**BASELINE (gate off)** — 8 runs, seeds 11/22/33/44 × belongdodge/leaddodge,
150d death-aware, tip 5016b35d:

| run | days | end | beam landed/fired | rank | natHeld |
|---|---|---|---|---|---|
| belongdodge s11 | 71 | village-lost | 6/7 | regional | 0 |
| belongdodge s22 | 81 | village-lost | 0/0 | global | 10 |
| belongdodge s33 | 87 | village-lost | 0/0 | regional | 0 |
| belongdodge s44 | 55 | village-lost | 4/4 | regional | 0 |
| leaddodge s11 | 74 | village-lost | 0/0 | regional | 0 |
| leaddodge s22 | 150 | survived | 2/2 | national | 74 |
| leaddodge s33 | 150 | village-lost | 0/0 | global | 74 |
| leaddodge s44 | 84 | village-lost | 3/5 | regional | 5 |

national 4/8, table 0/8, won 0/8, wave4 0/8, median 84d, vests 0.

**PILOT (gate on, BEAMDODGE_R15B=1)** — identical seeds/policies:

| run | days | end | beam landed/fired | dodge moves | rank | natHeld |
|---|---|---|---|---|---|---|
| belongdodge s11 | 83 | village-lost | 2/9051 ⚠ | 5 | regional | 0 |
| belongdodge s22 | 81 | village-lost | 0/0 | 0 | global | 10 |
| belongdodge s33 | 87 | village-lost | 0/0 | 0 | regional | 0 |
| belongdodge s44 | 47 | village-lost | 3/6 | 2 | regional | 0 |
| leaddodge s11 | 74 | village-lost | 0/0 | 0 | regional | 0 |
| leaddodge s22 | 103 | village-lost | 2/6 | 4 | national | 27 |
| leaddodge s33 | 150 | village-lost | 0/0 | 0 | global | 74 |
| leaddodge s44 | 123 | village-lost | 1/2 | 3 | regional | 0 |

national 3/8, table 0/8, won 0/8, wave4 0/8, median 87d, vests 0.

⚠ s11 (belongdodge) is a STALEMATE ARTIFACT, not 9,051 real beams in the
r15 sense. The layer's own counters agree with the instrument (4,526 windup
sightings, 7,542 firing sightings — two independent measures). What
happened: the KNOWN scholar camps the d2–3 arc band and never closes; the
gallowdeer AI re-declares Ocular Discharge essentially every cooldown cycle
(~1,500–2,300 declarations over the run — estimated from 9,051 damage ticks
÷ 6/beam and 4,526 windup sightings ÷ 2/beam; a declaration-hook diagnostic
missed interception so the exact count is unmeasured, but the two
independent counters agree on the scale); the scholar's HP stays high so the
never-flee rule (HP < 35%) never fires; the fight(s) eat the calendar while
the village dies around the scholar (village-lost d83, death causes: combat
6, villager combat 3, monster 1, contest 1 — the beam killed nobody). The
dodge beats the track and loses the war.

Clean land rate excluding s11: 6/14 = 42.9% — directionally the dodge halves
the land rate (proof test said 0/60 damaging ticks with the layer on vs
29/29 with it off), but n=14 is below the pre-registered ≥20-turn minimum,
so the land-rate criterion is NOT certifiable at pilot.

## Verdict — KILL AT PILOT (2026-10-13, arm A r16)

Pre-registered GO: land rate ≤ 50% on ≥ 20 fire turns AND median ≥ 94d.
Measured: 42.9% on 14 clean turns (below the sample minimum; 0.1% raw is
the s11 artifact) and median 87d (+3d, need +10d). GO FAILS on both legs.

Pre-registered KILL (land rate ≥ 70% OR median ≤ 74d) did not fire either —
this is the third outcome the pre-registration didn't name. Judgment call,
per the body's fast-kill discipline ("never run 12–16 seeds on an invisible
effect"): the effect on the AXIS is invisible. National 4/8 → 3/8, table
0/8 → 0/8, wins 0/8 → 0/8, wave4 0/8 → 0/8, median +3d. The mechanism works
(the beam lands far less) but the wall doesn't move — because the beam is a
scholar-killer and villages die of everything else. r15 aimed lever 1
(combat) at the wrong end of the telescope: scholar survivability vs the
benchmark monster is not the binding constraint on village survival. And
the lever introduces a degenerate mode (the s11 beam-spam stalemate) that a
confirm would only multiply.

Killed cleanly: policy layer + test + sweep driver + sense scripts deleted
(game-code-free kill — nothing ever touched src/). Evidence stays, marked
killed. Backlog item appended for the beam-spam stalemate (deer AI has no
beam-fatigue vs a non-closing dodger — a real game-design question if any
player does this by hand).

## Village assessment (sense-testing)

Read the fight, not the counts. Seed-11 scripted beam fight (UNKNOWN
scholar, learns mid-fight), transcript excerpts:

- The freeze is legible and the learning beat fires honestly: "💡 COUNTER
  LEARNED — the thing with headlights for eyes, standing too still: MOVE,
  don't stare. When it goes still, the beam is coming — MOVE, don't stare
  at the light. Anything beats standing there: the freeze means it is
  already aiming. (You did the thing — and it worked.)"
- The dodge reads: "💥 A ray of light lances FROM ITS EYES — and it's
  swinging toward you. MOVE." → "The light touches the ground where you
  were standing. It has not found you yet." → "The beam holds its line,
  burning where you were. It did not have to move at all."
- The punishment for striking into the burn is dramatic and legible:
  "The attack hits you for 102. 🔥 the beam doesn't need to sweep — it
  SITS on you! (102)" — the Undertale lesson lands: move and it chases,
  stand still and it parks.
- The steady tax is the antlers (13/12/15/13 per thrash) — closing has a
  price, and the windup strike window ("You STRIKE ... for 12" twice
  during the freeze) is the honest reward for reading the telegraph.
- The deer died in 15 rounds; the scholar ended at 181/500. A real fight
  with real costs — nothing robotic, nothing free.

The sweep's villages read the same as r15's: competent, busy, dying of
attrition. belongdodge s22 reached global (natHeld 10) and died d81;
leaddodge s22 held national 27–74 days across runs. Nobody reached the
table; wave 3 appeared (2 runs) but wave 4 never did. The dodge layer made
scholars better duelists and not better villagers — in s11 it made the
scholar a worse one, dancing through 9,051 beam ticks while the village
lost around it. That image is the verdict in one frame: the lever
optimizes the wrong protagonist. (Steve 2026-10-10: "The village is the
protagonist.")

## Reachability (wall numbers)

| | baseline (off) | pilot (on) |
|---|---|---|
| national | 4/8 | 3/8 |
| table | 0/8 | 0/8 |
| wins | 0/8 | 0/8 |
| wave 4 unlocks | 0/8 | 0/8 |
| wave 5 unlocks | 0/8 | 0/8 |
| median survival | 84d | 87d |
| max survival | 150d | 150d |

The wall stands. No run in either arm reached the table, won, or unlocked
wave 4. The scale on-ramp remains the blocking axis.

## Files

- `scripts/policies/beamdodge.js` — DELETED (killed at pilot)
- `scripts/test-beamdodge-r15b.js` — DELETED (killed at pilot)
- `scripts/sweep-beamdodge-r15b-20261013.js` — DELETED (killed at pilot)
- `scripts/sense-beamdodge-r15b.js` — DELETED (killed at pilot)
- `evidence/2026-10-13/sim-scale-wall-r15b.md` — this file (kept, killed)
- `evidence/2026-10-13/sim-scale-wall-r15b-baseline.json` — 8 runs, gate off
- `evidence/2026-10-13/sim-scale-wall-r15b-pilot.json` — 8 runs, gate on

## Convergence — killed-at-pilot
