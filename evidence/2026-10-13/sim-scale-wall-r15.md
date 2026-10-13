# Long-run sim — scale-wall r15: ARMOR UPTAKE (2026-10-13)

Lever 1 (combat) as a lens on the wall. Standing context: scale-onramp is the
blocking axis. r14's static audit found wave-2's top end kills an UNARMORED
100-HP scholar in ~3 landed hits, but P=20 (craftable hide armor) takes those
fights to 5.9–6.7. The r15 question: do day-7+ scholars actually wear P≥20
in sims, or does wave 2 meet them naked?

## Pre-registration (docs/MEASUREMENT.md §11 — written BEFORE any run)

- **Primary metric:** median survival, before/after on identical seeds.
- **Secondary:** hide-armor uptake (runs with a scholar wearing P≥20 by d25),
  national reach.
- **Horizon:** 150d, death-aware (dead villages stop; ≤10d tail). The
  P≥20-by-d25 bar matches the wave-2 gate (day 8 + 5 wave-1 ledger points).
- **Seeds:** 11, 22, 33, 44 (the wall suite). **Policies:** baseline
  belongseek/leadcourt; pilot belonghide/leadhide (withHide layer,
  HIDE_R15=1, default-OFF pure delegation).
- **GO for confirm:** ≥4/8 pilot runs have hide armor worn by d25 AND median
  survival ≥ baseline + 10d → confirm 24 runs. **KILL AT PILOT:** uptake
  <3/8 (mechanism doesn't move — e.g. hides never drop, L3 never reachable
  in sim time) or median worsens by ≥10d.
- **Convergence state:** armor-uptake axis → killed-at-pilot.

## The find (STEP 1 — baseline, no lever)

8 runs, current tip ed6852d7, no env gates. The answer to the r14 question:

**Wave 2 meets them naked. P≥20 at D25: 0/8.** Scholar-days at P≥20 across
all 8 runs: 19 total — every one from *found* gear (alien_carapace P=40,
alien_greaves), never from crafted armor. Bark crafts: 0/8. Hide crafts:
0/8. Hide recipe ever learned: 0/8 (L0 all runs). Hides taken into the pack:
0/8. Two villagers owned bark_armor in 2/8 runs (found, never crafted —
NPCs never craft armor).

The recipe is **unlearnable by design** — a complete chicken-and-egg,
verified in code:
- L1 ("You've seen one") comes only from *handling* a hide_armor piece
  (noteGearHandled: equip or loot from a corpse).
- But no hide_armor piece can exist: it is not `findable` (items.json),
  no NPC owns one at gen, **no NPC crafts armor — only `Game.craft`
  (the player) ever makes one**, and crafting needs L1+.
- L1→L2 is the blind craft (35%, materials at risk). L2→L3 has NO engine
  path in sim time: no book teaches hide_armor, no village codex carries
  armor recipes, villager teachings are plants/skills only. L2 (85%) is the
  honest ceiling — and even L1 is unreachable.
- Hides: the ONLY source is looting an animal corpse (Hide material on
  corpse loot). `cleanCarcass` (trap catches) never grants one, and the
  scholar's kills are monsters, not animals. 0 hides in 8 runs.

**Blank #3 (r14): gallowdeer beam honesty.** Instrumented per-fire-turn:
Ocular Discharge fire turns landed on the policy scholar **15/18 = 83%**
(3 attacks across 8 runs). The "stay out of the beam" design does not dodge
most fire turns — sweepRate 0.18 tracks the competent policy's movement
well. The r14 table's 4.0/7.7-hits numbers assume standing in the beam;
measured, the beam mostly finds you anyway.

## The lever (STEP 2 — policy-side only)

`scripts/policies/hide.js` — one shared layer, two wrappers:
`belonghide` = belongseek + hide layer; `leadhide` = leadcourt + hide layer.
`HIDE_R15=1` enables; unset → pure delegation (proven parent-identical in
the proof test's RED phase).

The layer (all honest, no game-code changes):
1. **hideSweep** (upkeep, post-fight-drive, never mid-fight): takes ONLY
   `material === 'hide'` items off in-range corpses via corpseTakeItem
   (range ≤1 tile, canCarry — the engine's own gates). Skips
   person/villager corpses (their packs are competent's daily beat).
2. **hideUpkeep** (before the parent's upkeep, so gearUp equips the fresh
   piece the same part): L0 → no button (no free learning). L1+ with
   2 hide + 1 vine in the scholar's OWN inventory → one honest craft/day
   (blind 35% at L1, 85% at L2+; craft() enforces every gate; materials at
   real risk). Re-crafts when the piece is lost/destroyed. Never touches
   the pantry, a stash, or another person's gear (canon: theft punished).

Proof: `scripts/test-hide-r15.js` — 16/16 green, including a real RED
phase (gate off = legacy bark-only behavior, no craft, no learning),
blind-craft → L2 learning, gearUp equipping to P=20, re-craft, a real tb
fight vs review_drone (P=20 reduces damage taken live), and the hide sweep
on a planted kill. Competent's armor suite (test-armor-up-20261012) re-run
green (5/5).

## The verdict (STEP 4 — pilot on identical seeds)

Pilot ran byte-identical to baseline (same seeds → same RNG stream; the
layer drew no RNG and took no actions because it had nothing honest to do):

| metric | baseline (8) | pilot (8) |
|---|---|---|
| P≥20 @ D25 | 0/8 | 0/8 |
| hide crafts | 0 | 0 |
| hides taken | 0 | 0 |
| hide recipe ever | 0/8 | 0/8 |
| median survival | 84d | 84d |
| national / table / wins | 4/0/0 | 4/0/0 |
| wave-4 organic unlocks | 0/8 | 0/8 |

**KILLED AT PILOT** — uptake 0/8 < 3/8 kill threshold; median unchanged.
The mechanism is correct (16/16 proof green) but the world never supplies
its inputs. This is a design blank, not a policy failure: the hide-armor
recipe cannot be learned through any legitimate in-game channel (L1 is a
chicken-and-egg), and hides have no reachable source in sim play (animals
are trapped-and-cleaned, never left as lootable corpses; kills are
monsters). The armor half of the scale wall is upstream of crafting —
it's a *discovery* gap.

**Recommendation (for Steve's call, not this lever):** an honest L1
channel — e.g. a villager *wearing* hide armor (occupation-linked spawn),
a witness/teach beat like the snare's, or a "repair a torn hide armor"
verb — would unlock the whole chain. Policy-side can't do it without
inventing knowledge. Documented as a blank, not fixed.

## Village assessment (sense-testing)

No scholar ever chose to craft armor (nothing to choose — the recipe is
invisible). What the villages looked like instead:

**d26, seed 11 (baseline): the beam that lands.** The scholar meets a
Highbeam Deer unarmored. Transcript: "💥 Ocular Discharge! A ray of light
lances FROM ITS EYES — and it's swinging toward you. MOVE." … "The light
touches the ground where you were standing. It has not found you yet." …
"Highbeam Deer's Ocular Discharge hits you for **95**." … then **70**.
The ignition beat is honest (a free move), but the fire turns track: 83%
land. This is the fight the r14 math was about — at P=20 those 95/70
turns would have been ~48/35, survivable; naked, they're a two-turn
death sentence on a 100-HP scholar. Armor would have mattered here.

**d50, seed 11: armor working as designed.** A veteran "Captain
Bright-Eyes" deer: "Armor absorbs 25." / "Captain Bright-Eyes's Ocular
Discharge hits you for 50." / "🔥 the beam SITS on you! (50)". The
scholar wore ~P=10 (bark). 75-point beam turn → 25 absorbed, 50 taken.
The diminishing-returns curve does exactly what Steve's model says:
every point does something, nothing immunizes, the fight stays hard.

**The village around the fights.** d7: Sujon shows the scholar the snare —
the L1 witness-teaching path working exactly as designed ("Your hands
don't know it yet. Your eyes do."). d11: "🕯️ Word comes back with a torn
pack and no Priya. Highbeam Deer, out past the ridge. The fire is
quieter tonight." — a villager death lands with weight. d14: "You catch
Fatima telling the fire about Maya. 'Maya came back mauled by Performance
Review (3 rounds, 57 taken) and alive. A flinch at sudden movement now.'"
Gossip carries real consequences. Villagers act like people; the armor
system just never enters their hands.

## Reachability (8-run wall numbers, before = after)

- national 4/8 (belong road), table 0/8, wins 0/8
- wave-4/5 organic unlocks 0/8 (max wave seen: 2)
- median survival 84d, max 150d (leadcourt s22 survived; lost the village anyway)
- death-cause shares: combat 62, villager combat 10, monster 6,
  starvation 5, expedition 5, "a wound that wouldn't close" 2, contest 1,
  The Understudy 1, the expedition 1
- vests 0/8, exiled 0/8

The scale wall stands where it stood: villages reach national on the
belong road and die there (median 84d), the table never stages, wave 4
never unlocks organically. Armor uptake is not the binding constraint —
it is an *absent* constraint: the content (P=20 craftable armor) might
as well not exist.

## union_rep doc drift verdict (r14 blank #2 — recorded, NOT changed)

docs/MONSTER-WAVES.md: "The Union Rep 📋 | It does not fight, it organizes
— the picket line is the damage | direct (windup 2)". The kit: main attack
**"Grievance Filed" — 18–25 direct, psychic, windup 2** — a real fight
move; plus three organizing tactics (Solidarity Speech/rally, Call to
Action/summon, WALKOUT — none deal damage; WALKOUT is a buff: "every ally
hits like a truck"). The counter text says "It does not fight, it
ORGANIZES — kill the rep before WALKOUT."

Verdict: **the doc line looks wrong; the kit looks right.** "It does not
fight, it organizes" reads like the original design-doc pitch; the kit
kept the organizing theme for the three tactics but gave it a real direct
main attack — and the doc's own table column ("direct (windup 2)")
already admits it. The prose overstates; the kit is the coherent unit.
Fix direction would be doc-side (one line), but per instruction: no
change made — Steve's call.

## Files

- `scripts/sweep-armor-r15-20261013.js` — baseline+pilot driver (armor
  telemetry: daily P, crafts, hides, recipe levels, beam fire-turn honesty)
- `scripts/policies/hide.js` — the HIDE_R15=1 opt-in layer (killed at pilot)
- `scripts/test-hide-r15.js` — 16/16 proof (RED phase included)
- `evidence/2026-10-13/sim-scale-wall-r15-baseline.json` — 8 runs
- `evidence/2026-10-13/sim-scale-wall-r15-pilot.json` — 8 runs, identical seeds

## Convergence

- food-economy: converging (r13)
- scale-onramp: **blocking** (unchanged — national 4/8 but 0 table/wins,
  0 wave-4 unlocks; armor axis killed at pilot, wall numbers unchanged)
- armor-uptake: **killed-at-pilot** (recipe unlearnable by design; honest
  blank documented for Steve's design call)
