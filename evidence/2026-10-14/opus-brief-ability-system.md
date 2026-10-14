# System Design Brief: Ability/God-Path System for "The Oversight"

## The Game

**The Oversight** is a mobile-first PWA roguelite survival game. Gritty long-haul survival logistics (food, hunting, clean water) in a sci-fi setting where aliens ("The System") run a televised survival contest on a twisted Earth.

**Core thesis:** Food is power. The fullness bar is energy/stamina/mana. Abilities convert stored calories into effects. Early game is slow and risky; late game you're an engine.

**Win condition:** Progress village → regional → national → galactic table (around day 70+). Survive. The table evaluates your leadership vector (not just combat). Multiple valid paths to win.

**Key systems:**
- 12 villagers (unique people with backstories, not classes)
- Turn-based tactical combat on 9x9 grid
- 4 day parts, expedition clock (no wall-clock punishment)
- Knowledge system (per-item knowledge levels, diegetic discovery)
- Contests (televised, unavoidable, often deadly)
- 5 monster waves (escalating)
- Party system (villagers fight alongside you)

## Current Ability System (What Exists)

### Abilities: 118 total
- **10 paths:** brawler (15), hunter (12), survivalist (10), shieldbearer (8), caregiver (7), drifter (7), explorer (7), socialite (6), miser (3), forager (2)
- **Roles:** support (55), enabler (48), payoff (14), wildcard (1)
- **6 slots:** Players equip up to 6 abilities. Slots are generic (no fixed roles).
- **Source:** System-granted (alien magic), NOT innate. Distinct from human skills.
- **Cost:** Abilities cost kcal (food energy). One economy, no mana.
- **Acquisition:** Trials, discovery, mentorship, System milestones.

### Synergies: 57 total
- Combinations of abilities/items that produce enhanced effects
- Most are stat modifiers (+X% damage, etc.)
- 4 named weapon-ability synergies (Shattering Blow, Impaling Scream, Blood Iron, Static Edge) — these are action-level (specific moment + gear + ability = new outcome)

### Gear: 215 items
- Real objects with physical functions (machete cuts, shield blocks)
- Sentimental gear: items linked to owner's backstory, charge with resonance
- **Design rule:** Gear should grant contextual actions, NOT rewrite abilities. (A shield lets you block; it doesn't change how your magic works.)

### The Problem
The ability system is the game's build engine, but currently:
- 69 of 118 abilities are passive-only (no active decision)
- Only ~4 are clear "payoffs" (build-around pieces)
- Synergies are mostly incremental stat boosts, not interesting combos
- 6 slots don't feel like meaningful commitments
- No clear path from "has abilities" to "god-tier build"
- Fights are 2-4 turns; many abilities assume longer engagements

## Design Goals (From Steve, the designer)

1. **God paths are the end.** Each of the 10 paths should lead to a "god" state — a transformative power, not just bigger numbers.

2. **Game-breaking builds via luck + cleverness.** Players should be able to assemble overpowered combos through:
   - **Luck:** Which abilities/items you're offered (RNG)
   - **Cleverness:** How you combine them, what you commit to

3. **All systems are levers.** Abilities, synergies, gear, sentimental gear — all should contribute to god path progression. But each must exist for its own sake first (a sentimental knife is a story object, not "+15 god points").

4. **Mechanics first, story second.** Fiction should be a light coat, not a constraint. Don't nerf mechanics to serve narrative.

5. **Costs are a general principle, not a universal rule.** Some abilities should have costs (kcal, HP, tempo). Not everything needs one. Different paths have different cost structures.

6. **Consider all scales:** Solo combat, party (allies), contests (televised), titans (late-game big monsters), army fights.

7. **No cheap win conditions.** "Solo a titan" is an achievement, not a victory. God abilities should be transformative, but victory is still the table (survive, lead, progress).

8. **Use what exists when possible.** Don't invent new systems if current ones can be reworked.

## Structural Constraints (What You Can't Change)

- **6 ability slots.** Fixed. This is the commitment device.
- **Food economy.** One bar (fullness = energy/stamina/mana). No mana pool.
- **System vs human.** System abilities (magic) are distinct from human skills (teachable knowledge). Never confuse them.
- **Mobile-first.** 390x844. Moment-to-moment play never scrolls. Fights should be snappy (2-8 turns, not 20).
- **Turn-based grid combat.** 9x9, tactical positioning matters.
- **Knowledge gating.** UI reveals only what knowledge earns. "If you don't know, it doesn't show."
- **No victory before day 90.** Pacing floor.
- **Death is the leading failure.** Preserve danger.

## What Has Been Tried (And Rejected)

1. **Generic gear abilityHooks:** Gear that rewrites abilities (e.g., "knife makes pocket sand blind longer"). REJECTED — category confusion. Gear grants actions, doesn't rewrite magic.

2. **Fiction-first design:** Deep lore per ability. REJECTED — doesn't scale to 118 abilities, led to nerfing mechanics for story.

3. **Fusion system:** Combine 2 abilities → stronger ability. REJECTED — just more content on broken base.

4. **Points-based god meter:** 0-100 points from abilities/synergies/gear. REJECTED — turned everything into grind fuel, violated "exists for own sake."

5. **10 build-around abilities:** One per path, designed as "payoffs." PARTIALLY REJECTED — 7 are just passive stat boosts, not real build-arounds. Only 3 have mechanical depth.

## The Ask

Design a **synergized system** where:
- The 118 abilities, 57 synergies, 215 items, and sentimental gear all contribute to 10 god paths
- Each system maintains its own integrity (not just god-path fuel)
- Players can assemble game-breaking builds through luck (RNG offers) + cleverness (commitment choices)
- God abilities are transformative (change what you ARE, not just bigger numbers)
- The 6 slots force meaningful commitment (can't be everything)
- Works at all scales: solo, party, contests, titans, army
- Victory remains the table (godhood is HOW you win, not the win itself)

**Do NOT propose:**
- New currencies or meters (we have kcal, that's it)
- Win conditions tied to god abilities (those are achievements)
- Systems that require deleting the 118 abilities (rework, don't replace)
- Fiction-heavy solutions (mechanics first)

**DO consider:**
- How the 6 slots create commitment
- How luck (offers) + cleverness (choices) leads to broken builds
- How each path's fantasy translates to a god-tier transformation
- How party/contests/titans interact with god abilities
- What "meaningful decision" means in a 2-4 turn fight

The designer (Steve) will review your proposal. He values: feel over math, real decisions over chores, systems that reward thinking over grinding.
