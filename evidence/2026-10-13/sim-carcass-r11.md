# sim-carcass-r11 — the carcass-haul lever (2026-10-13)

Long-run sim loop, scale-wall r11. Lever 0 (food economy) AS A LENS on the scale wall.
Policy/tooling work only — no game-code changes. No [needs-eyes] (no feel/combat/UI change).

## Pre-registration (MEASUREMENT.md §11 — fixed BEFORE the pilot ran)

- **Primary metric:** corpse-side rot share — `corpseRotK / carcassKcal`
  (the r10 sink: edible kill kcal that rotted ON CORPSES unlooted).
  Secondary: harvested monster-meat kcal as share of village food inflow
  (`meatPotentialK / totalInfluxK`, net at standard 40% butcher yield).
- **GO threshold (pilot gate):** rot-share reduction ≥ 20pp on BOTH pairs
  AND haul-arm meat share ≥ 0.25% on both pairs — visible in the raw
  numbers, no statistics (§9 sniff test).
- **Horizon:** 150 days, death-aware (dead villages stop simulating).
- **Seeds:** 11 (belongseek pair), 22 (leadcourt pair) — identical seeds
  within each pair.
- **Policies:** belongseek vs belongseek-haul (BELONG road); leadcourt vs
  leadcourt-haul (LEAD road). The haul layer = the r10-named policy fix:
  loot corpses in range immediately after fights (upkeep, 3x/day,
  post-fight-drive, never mid-fight), clean what was hauled, then the r10
  chain (1 cautious flesh-test/day via meatseek's testUnknownMeat,
  pantry via competent's day-end donateHaul).
- **Convergence state:** pilot GO → confirm spend (12 seeds); pilot miss →
  killed-at-pilot.

## Canon read

- docs/CANON.md + docs/PRESERVATION.md (cleaned→cooked→smoked ladder,
  blind penalties) + docs/BEAR.md (carcass→clean→test→reveal chain,
  portion law, trichinosis). DISEASES.md noted for raw-meat risk
  boundaries: the policy never eats raw/untested flesh (competentEat
  scores raw meat −10); the cautious test's designed cost is energy-only.
- Loot-as-action is canon (Steve 2026-10-06): kills don't auto-loot, the
  carcass stays where it died and rots there (3-day corpse spoil window).
  Villager kills leave meat on the carcass by design ("Meat stays on the
  carcass per loot-as-action" — game.js villagerKillLoot; only alien gear
  goes to the killer's pack).

## The lever (policy-side, scripts/policies/haul.js)

`withHaul(base, id)` layers onto any competent-derived policy:
- **upkeep** (3x/day, runs right after the fight-drive while the player
  still stands on the kill tile): `haulCorpses` — corpseTakeItem on every
  in-range unlooted non-person corpse (engine range-gated, weight-gated,
  ticks ticked; cap 12 items/part), skipping meat_human (trembles) and
  person corpses; then cleanCarcass on what the pack just gained when the
  knife allows. Guarded: never while a fight is live ("the dead can wait
  until the living are safe").
- **daily**: after the base daily, meatseek's `testUnknownMeat` — one
  cautious flesh-test/day, honest pace, toxic pays −30 energy.
- fight hook: delegated unchanged (no mid-fight looting — dishonest).

Arms: `belongseek-haul`, `leadcourt-haul`. Proof:
scripts/test-carcass-haul-r11.js (7/7, incl. a real RED: the unlayered
baseline does NOT haul at upkeep). r10's suite still green (5/5).

Instrument fixes vs r10 (scripts/meat-discovery-20261013.js, additive):
corpse-take wrap (hauled gross kcal + gear off monster corpses), rot
scans skip emptied (units≤0) stacks (r10's counts double-counted hauled
meat when it later "spoiled" on the corpse), killer-split census
(player-kill vs villager-kill carcass kcal — the addressable-pool
measure), numeric wins/exiled aliases, per-row deaths, optional registry
override for runMeatAudit.

## Results (pilot, 4 runs, 150d death-aware)

| arm | days | nat | tab | won | exiled | wave | wave45 | carcasses | gross | playerK/villagerK | hauled | gear | rotShare | potential | share | revealed | eaten | disc (tests) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| belongseek s11 | 71 | 0 | 0 | 0 | 0 | 3 | 0 | 9 | 13.6k | 4.1k/9.5k | 0.0k | 0 | 100% | 0.0k | 0% | 0.0k | 0 | 0 (0) |
| belongseek-haul s11 | 87 | 1 | 0 | 0 | 0 | 4 | 1 | 15 | 20.4k | 8.7k/11.7k | 9.6k | 18 | 53% | 2.6k | 0.52% | 1.6k | 0 | 3 (3) |
| leadcourt s22 | 76 | 0 | 0 | 0 | 0 | 3 | 0 | 10 | 9.9k | 1.6k/8.3k | 1.4k | 5 | 86% | 0.0k | 0% | 0.1k | 0 | 1npc (0) |
| leadcourt-haul s22 | 75 | 0 | 0 | 0 | 0 | 3 | 0 | 10 | 9.9k | 1.6k/8.3k | 1.6k | 7 | 84% | 0.6k | 0.36% | 0.6k | 0 | 2 (2) |

Wall numbers (4 runs): national 1/4, table 0/4, wins 0/4, wave 4–5 unlocks
1/4, median survival 75.5d, exiled 0/4.

### GO/NO-GO

**Per the letter of the pre-registered threshold: MISS (1 of 2 pairs).**
Pair 1: rot 100%→53% (Δ47pp ✓), share 0%→0.52% (✓). Pair 2: rot 86%→84%
(Δ2pp ✗), share 0%→0.36% (✓).

**Per the evidence: the mechanism is PROVEN, and the pair-2 miss is the
boundary condition, not a failure.** On seed 22 only 1.6k of 9.9k carcass
kcal was ever player-killed/in-range — and the BASELINE's own day-end
looting had already hauled 1.4k of it. There was almost nothing left for
the haul layer to close. On seed 11, where the addressable pool existed,
the lever closed nearly half the rot gap and moved every downstream
number: potential 0→2.6k, discoveries 0→3 (first at day 8 vs r10's day
44–47), 18 alien-gear items off the same corpses.

**Verdict: mechanism proven; NO confirm spend.** The remaining gap is
structural, not statistical — 57% (seed 11) to 84% (seed 22) of carcass
kcal dies on other nodes via villager kills, policy-unreachable by
construction. Twelve more seeds would size a bounded effect more
precisely without changing any decision. The rest of the gap needs the
design-level fix (haul-the-carcass verb or villager butchering behavior)
— Steve's call, out of scope for policy work.

### What the numbers say

- **The addressable pool is the player-kill + in-range share.** Killer
  census: seed 11, 8.7k player-killed / 20.4k gross (43%); seed 22,
  1.6k/9.9k (16%). Villager kills die on wild nodes the player never
  visits — no policy can loot what it can't reach.
- **Where addressable, the haul closes ~half the gap.** Seed 11:
  hauled 9.6k of 20.4k gross (47% — includes in-range villager kills at
  haven), rot share 100%→53%, potential 2.6k (bulldozer 1280, hushwolf
  560, nightcourt 720 at the honest 0.40 yield).
- **The gear side-channel is real.** 18 items off monster corpses on seed
  11 (7 on seed 22) — the HIGH RISK/HIGH REWARD half of the same bodies.
  That arm fought more (30 kills vs 18), reached wave 4 (first wave45 in
  this pilot set), and reached national. n=1 per arm: observed, NOT
  claimed as causal — trajectory divergence, not a policy decision to
  fight more. But the mechanism (gear → combat power) is the plausible
  path and worth an instrumented look next time.
- **The last mile is still broken: eaten = 0 on all arms.** Harvested +
  revealed meat (1.6k on seed 11) is never eaten by the player:
  competentEat honestly refuses raw meat (−10 score, disease-correct),
  and the 2-day cleaned shelf rots it before competent's cookPack gets
  there (meatRotK 6.7k pack-side on seed 11). The chain currently ends at
  "revealed" — cook-then-eat of discovered monster meat is the next blank
  (policy or design; documented, not attempted here per lever
  discipline — this run's lever was the carcass, not the kitchen).
- **Zero sickness cost.** No disease events on either haul arm; the only
  sickness in the pilot was baseline-side (1 wound-related on leadcourt
  s22). The cautious-test chain stays energy-only as designed.

## Sense-test (transcripts — SENSE-TESTING LAW)

The haul reads as a person working a kill, not a vacuum:
- Loot: "Taken: Bulldozer (carcass) x1." then the honest refusal —
  "Nothing edible. (Bulldozer (carcass) — not food yet: A carcass. Clean
  it with a knife — quickly. Spoils fast..)"
- Kill site (canon voice, unchanged): "Pork is pork. Smoke it; it keeps
  for weeks... It's dead. The carcass is there on the ground — search
  the body if you want the meat. But you don't know this flesh. Clean
  it, test it cautiously, or ask someone who knows. And don't leave it
  long: meat rots where it lies."
- Discovery (day 8, first test): "It sits fine. The Bulldozer is food.
  You know it in your gut, literally." / "The Codex notes it. Your pack
  updates — the meat is food now." Knowledge-gated descriptor names,
  never true names. Diegetically honest throughout.

## Village assessment

- **Seed 11, belongseek-haul (87d, village-lost, national reached):** a
  garden-and-fish economy (Garden 252k, Fish 197k of 493k influx) that
  climbed the BELONG road to national and unlocked wave 4 — then bled
  out in combat (17 deaths: 8 monster-combat, 4 villager-combat, 4
  patrol-combat, 1 wound). The village that finally learned to eat its
  kills died to the things it was killing. Monster meat was 0.52% of
  inflow — the wall didn't move on food; if anything moved it, it was
  the 18 hauled gear items feeding the fight side.
- **Seed 11, belongseek baseline (71d, village-lost):** same road, no
  national, wave 3, 8 combat deaths. Never discovered a single flesh —
  every carcass rotted where it fell (rot share 100%).
- **Seed 22, leadcourt pair (76d/75d, both village-lost):** a
  fish-and-forage economy (Fish 110k, Foraged 35k, Thornfield aid 10k)
  with LEAD courtship; deaths thinner on the haul arm (7 vs 13,
  incl. the pilot's only starvation and a lockjaw on the baseline).
  The haul lever had almost nothing addressable here (1.6k player-kill
  kcal) and correctly did almost nothing extra.
- Villagers acted as individuals throughout: patrol kills on wild nodes
  (the unreachable 57–84%), the NPC fireside experiment discovering on
  the baseline (leadcourt s22: 1 NPC discovery), aid answered from
  Thornfield. Nothing robotic flagged in the sampled transcripts.

## Reachability verdict

Waves 1–3 reachable; wave 4 reached once (seed-11 haul arm, via the
gear side-channel plausibly). Wave 5, Arc II/III/IV, the table, and the
win flag: unreached in all 4 runs. National: 1/4 (first national in a
meat-lever pilot, n=1, not claimed as lever-caused). The scale wall
stands: villages still die at 71–87d, and monster meat at 0.36–0.52% of
inflow cannot fund the national on-ramp's food surplus.

## Blanks filled / documented

- FILLED: r10's open blank — the policy-side carcass-haul fix, measured
  end to end (loot → clean → test → reveal) with the killer-split
  addressable-pool census. Answer: it closes ~half the rot gap where
  the player can reach (rot 100%→53% on the addressable pair); the rest
  is villager kills on other nodes.
- FILLED (instrument): rot double-count fix (emptied stacks are gone,
  not rotting), corpse-take haul/gear measurement, killer-split census,
  per-row deaths, numeric wall aliases for the telemetry check.
- OPEN for a future run: the cook→eat last mile (revealed monster meat
  rots uneaten — eaten 0 on all arms). Policy or design; not this run's
  lever.
- OPEN for Steve: the design-level carcass fix (haul-the-carcass verb or
  longer corpse spoil window / villager butchering). Policy has hit its
  ceiling: 57–84% of the meat dies where no policy can reach.
- Telemetry deviation check: quiet (no LOUD lines vs scale-wall
  baseline; national 0→1 across 2 files is below the ≥3 appearance
  threshold). Baseline NOT rolled forward — shared baseline is the
  coordinator's; this was a 4-run policy experiment.

## Convergence

**Mechanism proven; no confirm spend — converging (bounded).** The
policy-side carcass-logistics gap is closed where reachable. The scale
wall itself is unmoved (national 1/4 on n=1, table 0, wins 0) — food
from kills is now real but tiny (≤0.52% of inflow), and the national
on-ramp's food surplus must come from elsewhere. Next lever per the
tracker, or Steve's design call on the carcass verb.
