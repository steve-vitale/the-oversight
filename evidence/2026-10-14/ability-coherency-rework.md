# Ability Coherency Rework — Design (Steve 2026-10-14)

Steve's directive: *"Be careful as obviously this is a load bearing system but it's the most important one in the game. This is what makes things fun. Include all the mechanics and sound effects and visuals and gear tie ins, semantic gear tie ins, synergy tie ins required. Make sure you understand entirety of current system and propose thorough rework."*

External research: `evidence/2026-10-14/ability-theory-research.md` (7 tested patterns).

## Current system (mapped 2026-10-14)

- **108 abilities**, 39 with verbs (actions), 69 passive-only, 33 with neither actions nor modifiers (ID-keyed behaviors scattered in code).
- **10 paths**: brawler 14, hunter 11, survivalist 9, shieldbearer 7, caregiver 6, drifter 6, explorer 6, socialite 5, miser 2, forager 1.
- **57 synergies**: overwhelmingly stat modifiers (`+15% find chance`). After-effects, not build-definers.
- **5/108 abilities have synergyHints.** Diegetic discovery is absent.
- **0 items reference abilities.** Gear never touches the ability system (except 4 brand-new weapon-ability synergies).
- **6 slots**: earned via neural integration (20→2, 35→3, 50→4, 65→5, 80→6). Generic — no roles.
- **Offers**: System offers weighted by week-1 actions + friction (translator/purify). No steering toward held paths.
- **Execution**: `abilityActions.js` (useAbility single entry, costs paid first, never silent). Food-powered (kcal costs, eat-first gate at <500, Overcharge at ≥75%).
- **Audio**: `audioEvent('knowledgeReveal')` exists for integration; no ability-use audio hooks.
- **Visuals**: ability bar buttons are generic ⚡ with no path identity.

## The core diagnosis

Every path is **all enabler, zero payoff**. Brawler has blinds, stuns, and a haymaker — but nothing that rewards the blind→strike sequence. Shieldbearer has taunts and control — but nothing that detonates off absorbed damage. Hunter has tracking and ambush — but nothing that rewards the track→stalk→kill chain. 108 enablers, ~0 payoffs. That's why it feels like after-effects: there is no "there" there.

## The rework: THE BUILD ENGINE

### 1. Role classification (data)

Every ability gets `role`: `enabler` (the verb — creates the setup), `payoff` (the reward — detonates off the setup), `support` (sustain/assembly — lets the build survive). Target per path: ~40% enabler, ~25% payoff, ~35% support. This is data-only and non-breaking.

### 2. One build-around per path (mechanics)

Each path gets a build-around: weak alone, run-defining with 2+ same-path abilities. These are the cards players tell stories about. Rare, high-investment, never common.

| Path | Build-around | Alone | With 2+ path abilities |
|---|---|---|---|
| brawler | **Blood Frenzy** | +10% dmg per consecutive hit, resets on miss | chains to +80%, multi-hit enablers feed it |
| shieldbearer | **Retribution** | stores blocked damage, release as shockwave | control buys time to charge it |
| hunter | **Trophy Room** | mark one monster type per day | track→stalk→kill marks compound |
| survivalist | **Feast Engine** | overheal → small damage buff | food surplus becomes weapon |
| caregiver | **Triage** | heal 3x → target gains a free action | sustain becomes tempo |
| drifter | **Nowhere Man** | +dodge per tile moved unhit | mobility becomes armor |
| explorer | **Cartographer's Eye** | revealed tiles grant combat edge | knowledge becomes power |
| socialite | **Crowd Favorite** | fans multiply social effects | audience becomes amplifier |
| miser | **Hoarder's Interest** | stored goods trickle income | patience becomes engine |
| forager | **Cornucopia** | forage streaks multiply yields | streaks become avalanches |

### 3. Named slot roles (UI)

The 6 slots get Hades-style roles: **Opener / Control / Nuke / Sustain / Mobility / Wildcard**. Each ability declares a `slotRole` affinity. The ability bar shows the role. A "complete" build fills all roles — coherence becomes visible, not just mathematical. Cross-role synergies get named announcements ("SHIELDBEARER × BRAWLER: JUGGERNAUT").

### 4. Gear rewrites verbs (mechanics)

New `abilityHooks` on items, three tiers (PoE support-gem pattern):
- **trigger**: "when you block 30+ in a fight, auto-cast Shield Wall"
- **rewrite**: "your Shove pulls instead of pushes" / "your Hogtie costs no rope"
- **unlock**: "extra ability slot, shieldbearer abilities only"

Semantic tie-in: sentimental items' `bondThresholds` can offer ability-enhancing evolutions (the item remembers what you did with it — a knife that's drawn blood with Pocket Sand learns Shattering Blow). This is the CANON semantic-item system (items evolve through use + resonance) finally touching abilities.

### 5. Offer weighting (Spire's quiet steering)

System offers weight toward the player's held paths. The path of least resistance becomes a build, not a pile. Friction offers (translator/purify) keep priority — need beats steering.

### 6. Path color language (Dead Cells)

One color per path, applied to ability buttons, synergy announcements, Codex entries, gear tags. The player feels "the red thing" before understanding it.

### 7. Diegetic discovery (Isaac's regret, fixed)

- `synergyHints` on every ability ("combines with: control effects")
- Codex records **witnessed** synergies ("you saw Shove + Machete halve armor — recorded")
- Synergy announcements name the path pair

### 8. Audio & visuals

- `audioEvent('abilityUse', {path, role})` — path-flavored activation sounds
- `audioEvent('synergy', {paths})` — the fanfare when a named pair fires
- `audioEvent('buildaround', {path})` — the build-around coming online
- Ability buttons: path color border + role icon
- Synergy announcement: full-width banner with both path colors

### 9. Balance posture (genre consensus)

Nerf only what's strong **without assembly**. Any combo requiring 2+ path abilities + gear + knowledge is working as intended, no matter how explosive. Steve's "broken builds welcome" is the tested posture.

## Implementation order (load-bearing caution)

1. Data: `role` + `slotRole` + `synergyHints` on all 108 (non-breaking)
2. Mechanics: 10 build-arounds (new abilities, gated behind practice/unlock)
3. Slots: named roles in UI (additive)
4. Gear: `abilityHooks` system + 6 seed items (3 trigger, 2 rewrite, 1 unlock)
5. Semantic: sentimental bond → ability evolution (2 seed items)
6. Offers: path-weighted offers (additive to existing friction logic)
7. Discovery: Codex witnessed synergies + synergy announcements
8. Audio/visual: path colors, audio hooks, banners

Each phase ships with proof tests. No phase removes anything.
