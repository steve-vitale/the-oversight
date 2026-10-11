# Ability Evolution — Evidence (2026-10-11)

Steve greenlit: at L3 mastery, an ability EVOLVES — the player chooses what it becomes.
Scope: 13 families × 2 divergent paths = 26 evolutions. Human skills evolve
human-deeper; alien abilities evolve stranger. Every evolution moves a real needle.

## Design decisions (Steve: "figure it out yourself")

- **Family-level, not per-ability.** 13 families × 2 = 26 evolutions. Per-ability
  (94×2) would be content theater; families share a mechanical theme and the
  choice is about *direction*, not the specific ability.
- **XP retune (measured, not guessed).** Real XP rates: 0.07–0.13 xp/day at
  1 XP/activation. L3 needed 35 total XP → unreachable (~280 days). Retuned:
  thresholds 10/25 → 6/12, real activations grant 2 XP. Focused abilities now
  earn 0.5–1.4 xp/day → L3 in 13–36 days. Sim-verified: tracker/mediator hit L3
  by day 52 (seed 3, 120-day run).
- **Retune-first, never cut.** 10 evolutions tested weak on the needle test;
  all retuned (op corrections, value bumps) until green. 0 cut.
- **eagle_eye was dead.** Its modifier targeted `forage.rake_find_chance`,
  which no code resolves. Retuned to `ruin.find_mult` (live). Base audit:
  0 dead modifiers across all 94.

## Proof results

- `scripts/test-ability-evolution.js`: **26/26 GREEN** (RED verified on pristine
  master — crashes, no evolutions data).
  - (a) L3 stages a CHOICE (2 options, deferral works, nothing auto-granted).
  - (b) All 26 qualitative (verbs, no number-spoilers) AND impactful (live targets).
  - (c) Synergy legs resolve through `evolvedFrom` lineage.
  - (d) L3 reachable: 18 total XP, focused use hits it in 13–36 days.
  - (e) Lane separation: alien evolutions carry System voice; human don't.
  - (f) All 94 abilities have L2/L3 deepening text; 0 dead modifiers.
- `scripts/test-evolution-needles.js`: **32/32 GREEN**. Every evolution measured
  through the real pipeline (modTarget / real code paths) vs L3 base.
  - Example deltas: `fieldcraft__bloodline` hunt.success +0.15; `combat__red_mist`
    combat.dodge_chance +0.15 + counter-on-miss; `care__surgeon` treatment costs 0.
- Ontology: new data file `src/data/evolutions.json` registered in data loader.

## Evolution moments (sense-read aloud)

### 1. Tracker → Bloodline (human-deep, hunt family)

> 🔥 MASTERY. Tracker has carried you through three seasons of sign and spoor —
> and it is STRAINING at its edges, hungry to become something new.
>
> The System is quiet. This one is yours, not theirs. What does the hunt become?
>
> 1. **Bloodline** — "The trail doesn't end at the kill. It runs backward, into
>    the herd's memory — you start knowing where they *will* be."
> 2. **Herd Dream** — "You stop tracking animals and start tracking the herd
>    itself — its moods, its fears. The forest tells you where the meat walks."
> 3. (defer) "Not yet. Let it strain a little longer."

*Reads:* The "straining at its edges" lands — it feels like the ability is
outgrowing its skin. "The System is quiet. This one is yours" is the lane
marker: human skill, human choice. The two options hint without spoiling:
Bloodline = predictive (find_chance), Herd Dream = herd-level (success).
"Not yet" respects the player's timing.

### 2. Rage → Red Mist (alien, combat family)

> 🌀 EVOLUTION. Rage has burned through you a hundred times — and something in
> the burn has LEARNED. The System leans in, delighted: "OH. Oh, it's doing the
> thing. It's doing the thing AGAIN."
>
> Your fury is becoming something with opinions. Choose its shape:
>
> 1. **Red Mist** — "The rage stops being yours. It becomes a weather system
>    that fights beside you — and it HATES missing."
> 2. **Iron Warden** — "The fury turns inward and hardens. You become the wall
>    between the blow and the people you love."

*Reads:* "The System leans in, delighted" — alien lane, System voice, and it's
funny in the Claptrap register Steve wants. "Something with opinions" is
stranger — the ability is becoming *other*. Red Mist's "HATES missing" hints at
the counter-on-miss without saying "counterattack on dodge." Iron Warden's
"the wall between the blow and the people you love" is the intercept fantasy.

### 3. Field Medicine → Surgeon (human-deep, care family)

> 🔥 MASTERY. Field Medicine has held lives together in the dirt and the rain —
> and your hands know things your head hasn't caught up with yet.
>
> No System fanfare. Just the quiet certainty of someone who has done this
> a hundred times. What do your hands become?
>
> 1. **Surgeon** — "Your hands stop shaking. Treatment becomes reflex —
>    fast, clean, and it costs you nothing but focus."
> 2. **Warden** — "You stop just healing the sick. You start keeping the
>    healthy *well* — your camp becomes a place sickness doesn't enter."

*Reads:* "No System fanfare" — the absence IS the lane marker. Human skill,
human-deep. "Costs you nothing but focus" hints at the free treatment without
saying "0 kcal." Warden's "a place sickness doesn't enter" is the ward fantasy.

## Files

- `src/data/evolutions.json` (new): 26 evolutions, 13 families × 2.
- `src/data/abilities.json`: all 94 now have `deepening` L2/L3 text.
- `src/js/game.js`: gainAbilityXP (2 XP, thresholds 6/12), L3 evolution beat,
  chooseEvolution, hasEvoFlag, applyEvolutionFlags, 5 flag wirings.
- `src/js/engine/modifiers.js`: hasAbility/collectModifiers respect lineage.
- `src/js/abilityActions.js`: treatment cost waived for Surgeon.
- `src/js/food.js`: smoke_never_fails.
- `scripts/test-ability-evolution.js`, `scripts/test-evolution-needles.js`.
- `scripts/audit-ability-needles.js`, `scripts/measure-xp-rates.js` (tooling).
