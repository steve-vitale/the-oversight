# Long-run sim — lever 1 r1: the scale wall's combat face (2026-10-12)

## PRE-REGISTRATION (docs/MEASUREMENT.md §§9–12)
- **Primary metric:** village survival days (median across seeds) AND the
  scale-wall numbers: national reached / table reached / wins, wave 4–5
  unlocks. Combat death-share is the diagnostic, not the goal.
- **GO threshold (pilot → confirm):** after-run median survival ≥ 85d OR
  national reached on ≥1/8 runs OR a wave-4 organic unlock — with no
  starvation-collapse (starvation share of deaths must not rise above
  baseline +10 points). A change that moves none of these is killed at pilot.
- **Horizon:** 150d cap, death-aware. Sim stops at Game.over / village
  extinction (pop 0) — harness-enforced. Rationale: the wall window is
  days 30–90 (villages die before the day-76/90 rung gates per the
  2026-10-12 run); 150d covers the window plus margin without simulating
  corpses. Never a fixed 200d.
- **Seeds:** 11, 22, 33, 44 (subset of the r8 seed set — cross-referenceable).
- **Policies:** competent + winseek (8 runs: 4 seeds × 2 policies). winseek
  actively courts scale and the table; competent plays survival.
- **Lever:** ONE combat lever, chosen AFTER the baseline diagnosis reads
  the transcripts (SENSE-TESTING LAW). Before/after on IDENTICAL seeds.
- **Convergence judged at end:** converging | converged | parked |
  killed-at-pilot.

## Canon read
- docs/CANON.md (monster encounters fought not rolled; contests played not
  RNG; "If you don't know, it doesn't show"; monster tiers ≠ loot tiers).
- docs/MONSTER-WAVES.md (wave law; villager kills score the ledger like the
  player's; counters wave 1–2; wave 3+ deliberately counter-less — signature
  mechanics instead; anchored bands).
- docs/DISEASES.md (two pools — checked: no disease vector changes in this
  run's scope; wounds "wouldn't close" are mundane).
- r8 baseline (2026-10-12): 12 seeds × 200d competent: median 69–72d,
  11/12 village-lost; player deaths 83% combat; villager deaths 63%
  field-combat (+13% wounds); field fights: vFlee 43%, vDie 6.1%;
  wave-3 player fights 11 deaths / 21 (52%); national 0/12.

## Baseline (measured this run, 8 runs, current master)
Probe: scripts/probe-combat-r1-20261012.js (POLICY × SEEDS × DAYS=150,
death-aware). Raw JSON in /tmp (competent/winseek), analysis below.

| seed | policy | days | end | scaleMax | maxWave | pDeaths | vDeaths |
|---|---|---|---|---|---|---|---|
| 11 | competent | 69 | village-lost | village | 3 | 3 | 8 |
| 22 | competent | 150 | survived | village | 3 | 6 | 4 |
| 33 | competent | 14 | village-lost | village | 1 | 2 | 3 |
| 44 | competent | 90 | village-lost | village | 3 | 4 | 5 |
| 11 | winseek | 32 | village-lost | regional | 2 | 4 | 7 |
| 22 | winseek | 124 | village-lost | regional | 3 | 4 | 7 |
| 33 | winseek | 15 | village-lost | village | 1 | 2 | 7 |
| 44 | winseek | 34 | village-lost | regional | 1 | 5 | 7 |

Wall numbers: **national 0/8, table 0/8, wins 0/8, wave 4–5 unlocks 0/8.**
Median survival: **51.5d** (days sorted: 14, 15, 32, 34, 69, 90, 124, 150).

Death causes (8 runs):
- Player (30): 25 combat (83%) — 20 wild wave-1, 3 wild wave-2, 2 wild
  wave-3; 5 starvation (17%).
- Villager (48): 29 monster (60%) — 26 wave-1 field, 3 wave-2 field;
  7 starvation (15%), 6 sickness, 4 "wound that wouldn't close", 2 thirst.
- Fights: 66 wave-1 field kills, 18 wave-1 wild, 13 wave-2 field, 9 wave-2
  wild, 1 wave-2 contest, 1 wave-2 feast-draw.

**The key baseline finding (transcript-verified): the player fights
bare-handed.** Day-12 diagnostic (seed 22): equipped {}, pack [], weapon
"your hands". The policy's GEAR UP (2026-10-11) only equips what the world
gives; the player must CRAFT, and never does. Meanwhile villagers DO arm
themselves — the game's whittle system works (8/10 villagers armed-ish at
day 25, village wood 0 from consumption). Player deaths: gallowdeer 7,
hushwolf 5, belltoad/nightcourt 2 each — all wave-1 wild ambushes vs a
~2-damage/round bare-handed fighter taking 11–30/round undodgeable.

## Sense-testing (transcripts read)
- **Player fights are sensical and rich.** The Understudy (wave 2) learns
  the player's moves across rounds, telegraphs honestly ("every round it
  watches, it learns"), armor absorbs, codex records Mirror Strike. The
  lockpick raccoon circles the pack (its fiction), Zuri harries then flees
  sensibly ("Zuri sees how this ends — and runs while running still
  works"). Deaths narrate ("The gamblers are very quiet").
- **A real policy-behavior find:** in the raccoon death the player stood
  11 rounds dealing ~1/round while taking 13–16/round. Instrumented replay
  shows the flee logic fires only below 30% HP — by then the player dies
  mid-retreat. The fight was unwinnable from round 1 (DPS race lost), but
  the policy doesn't evaluate the damage race, only HP thresholds.
- **Villager field fights are mechanical summaries** ("R1: Swarm Hum hits
  Sofia for 5... = outcome: vKill"), not narratives — acceptable for
  background sims, thin for a player-facing surface (not this run's scope).
- **Witness reactions fire** (seed 11: start 8, kill 5, hurt 5, flee 1;
  11 witness lines recorded). Villagers react to fights as people.
- **No disease-pool confusion observed** in this run's deaths.

## Lever played: ARM UP (policy-side, competent.js)
**Exact change:** new `armUp(Game, ctx)` in scripts/policies/competent.js,
called in `daily()` before `keepKnife`. When the equipped weapon is
unarmed ("your hands") and stone+vine are in the pack, craft
`stone_knife` (universal L3 knowledge, bonus-12 weapon, durable). The
existing `gearUp` (upkeep, 3×/day) equips it; `hasCuttingTool` counts an
equipped knife, so butchering doesn't regress. winseek inherits via
`winseek.daily → competent.daily`. No game-code change; no feel/combat/UI
change — policy fidelity only (a competent player arms before fighting).
Proof: scripts/test-armup-r1.js (mechanism green: crafts=1, everArmed=true;
observed upgrade stone_knife → found machete on seed 11).

**Why this lever:** the baseline's #1 player death stream (83% combat,
wave-1 wild) was measured on bare-handed fighters — the instrument was
measuring naked-fighter lethality, not the game's curve. Arming is what a
competent player does; the game already provides the path (universal
stone-knife recipe, villager whittle system proves the fiction).

## Before/after (identical seeds 11/22/33/44 × competent/winseek)

| seed | policy | before days | after days |
|---|---|---|---|
| 11 | competent | 69 | 104 |
| 22 | competent | 150 | 59 |
| 33 | competent | 14 | 15 |
| 44 | competent | 90 | 66 |
| 11 | winseek | 32 | 26 |
| 22 | winseek | 124 | 36 |
| 33 | winseek | 15 | 15 |
| 44 | winseek | 34 | 28 |

- Median survival: **51.5d → 32.0d** (GO needed ≥85d) ❌
- National: **0/8 → 0/8** (GO needed ≥1/8) ❌
- Table: 0/8 → 0/8. Wave-4 unlocks: 0/8 → 0/8 ❌
- Starvation share: 15% (12/78) → 4% (3/71) — guardrail NOT violated
  (well under baseline+10), but irrelevant: no GO metric moved.

**Death-profile shift (the lever did something real):** after-competent
player deaths moved from wave-1-dominated to wave-3-dominated (redactor 5,
ad_break 3, buffering 3, spool 1 = 12 wave-3 vs 7 wave-1). The armed player
survives early fights and reaches deeper content — then dies there. But
villages die FASTER overall. Winseek barely armed (no materials gathered —
it patrols instead of foraging; armedKnife never fired on seed 11 by day
30), so its worsening is RNG divergence, not a lever effect.

**VERDICT: KILLED AT PILOT.** Per docs/MEASUREMENT.md §§9–12, a change
that moves none of the GO metrics is killed — never spend 12–20 seeds on
an invisible effect.

## Why it failed (the honest diagnosis)
The scale wall's combat face is **not an equipment gap**. Arming the
player is necessary but nowhere near sufficient:
1. Even armed with a **machete (bonus 35)** — the best early weapon — the
   player died to a wave-1 **gallowdeer** (160 HP, Ocular Discharge
   20–30/round). It's a coin-flip fight the policy willingly engages
   (1.6× HP < the 2.5× "outmatched" bar). The policy doesn't evaluate the
   damage race, only HP ratios and HP thresholds.
2. Surviving wave-1 just promotes the player to wave-3 deaths (redactor,
   ad_break, buffering — signature mechanics, deliberately counter-less
   per MONSTER-WAVES.md). The wall moves up a wave; the village still dies
   before day-76.
3. Villager field deaths (60% monster, 26 wave-1 field) persist DESPITE
   villagers being armed (whittle works). Arming villagers didn't save
   them either — same conclusion from the other side.

The binding constraint is **fight selection and monster math**, not
equipment: who fights what, when to walk away, and whether wave-1/2
damage numbers are survivable for the intended "slow and risky" early
game. That is a game-side question (monster pressure / armor curve) or a
deeper policy question (DPS-race assessment, not HP-threshold fleeing) —
both are follow-up levers, not this one.

## Reachability verdict
- Waves 1–3: reached (maxWave 3 on 5/8 before, similar after). Waves 4–5:
  **0 organic unlocks** — still decoration in sims.
- Regional: reached (winseek 3/4 both before and after). National: **0/8**.
  Table: **0/8**. Wins: 0/8.
- The wall stands: villages die days 14–104 (median 32–51.5d), before the
  day-76/90 rung gates. Nothing in this run reached national.

## Village assessment (plain words)
Eight villages, eight funerals. The pattern barely varies: the first two
weeks are a meat grinder — wave-1 animals (hushwolves, gallowdeer,
belltoads) pick off foragers in the field and ambush the player in the
wild. Villagers who survive the first month die in the second to the same
animals, plus wounds that won't close and the occasional sickness. The
player respawns as a new villager 2–9 times per run, each life starting
bare-handed and re-learning the same lesson. Winseek villages push to
regional and then starve-or-bleed mid-ambition (days 26–36). Nobody sees
day 76. The village never feels like it's climbing toward something —
it's treading water against the treeline until the water wins.

Who thrived: villagers who stayed near Haven and got whittled sticks;
the seed-22 competent village that survived 150 days (before) by luck of
the draw more than design. Who died: foragers, the curious, the player —
repeatedly, in the wild, to animals.

## Blanks filled or documented
- **Filled (policy fidelity):** the competent player now arms (stone_knife
  → upgrades). The baseline's bare-handed measurement is retired; future
  runs measure an armed competent player. Proof test green.
- **Filled (diagnosis):** the wall is not an equipment gap — documented
  with before/after on identical seeds.
- **Documented (open):** fight-selection policy (DPS-race assessment vs
  HP-threshold fleeing) — the raccoon replay proves the current flee
  logic engages unwinnable fights for 8+ rounds. Game-side monster-math
  question: is a wave-1 gallowdeer coin-flip vs a machete-armed day-15
  player the intended "every animal might kill you," or overtuned?
  Villager field-fight survivability despite armament. All queued behind
  scale-onramp, not this run.

## Convergence state: KILLED-AT-PILOT
Lever 1 (combat) via the arm-up policy change: killed at pilot per the
pre-registered GO (median 51.5→32d, national 0/8, wave-4 0/8). The
scale-onramp axis stays the topmost non-converged axis; its state is
unchanged by this run (still converging per tracker — LEAD/BELONG roads
show nationals; the combat baseline does not). The policy change itself
is kept (fidelity fix, mechanism proven) — the LEVER is dead, not the fix.
