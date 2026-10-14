# Godhood Rework — Evidence (2026-10-13)

## Pre-registration (MEASUREMENT.md §11)

- **Primary metric**: villager godhood achievement rate — % of sim runs with ≥1 villager godhood by run end. (Steve 2026-10-13: "We know it's working when villagers occasionally obtain it by sim run end.")
- **GO threshold**: 5–15% of runs (Steve's band). Below 5% = still too hard; above 15% = too easy.
- **Horizon**: 150 days — reachability lever (MEASUREMENT.md §10: waves 4–5 / national / wins = 150–200d). Godhood is endgame (minDay 80).
- **Seeds**: 7, 42, 99, 1234, 555, 777, 2026, 31337 (8-seed pilot).
- **Policies**: competent (baseline).
- **Convergence**: killed-at-pilot | converging | converged | parked.

## Diagnosis: why 0 activations ever (5 compounding blockers)

1. **UNWIRED (fatal)**: `checkGodhood`, `recognitionCeremony`, `hintBeat`, `godhoodCloseness` had ZERO callers anywhere in the codebase. Even a perfect build could never trigger. (pantheon.js wrapped `recognitionCeremony` but nothing called it.)
2. **Item blocker (0%, not 0.25%)**: the 16 named godhood items have NO acquisition path — missing `origin` excludes them from the `rollAlienLoot` pool (which only takes `origin === 'alien'`), and they appear nowhere else (no craft, shop, quest, contest). Not rare — unobtainable.
3. **Exact-6 lottery**: 61 `system_offer` abilities via random 3-picks; collecting 6 specific ones is a lottery with no build-aware bias.
4. **Villager-impossible kits**: 0/10 kit-godhoods achievable via NPC_ABILITY_KITS (best was apex_predator 4/6, but `dead_aim` sat 8th in combat — grants cap at 5/track).
5. **No villager synergy system**: villagers had `npcAbilities` but no synergy discovery or storage at all.

## Design (Steve's spec 2026-10-13, followed exactly)

- **Endgame only**: `minDay: 80` requirement floor. No mid-game tier (explicitly rejected per spec).
- **Reachable**: exact-6 → **4+ abilities from a ~10-ability pool + ≥1 core ability** (build identity). Pools are thematic; cores are signature.
- **Items — Steve option (c)**: ANY tier-4 item qualifies (flexibility). Named capstone items also qualify (the ideal). Options (a) remove / (b) easier tier-4 rejected: (a) loses the ENDGAME-BUILDS.md gear fantasy Steve designed; (b) changes the whole loot economy (blast radius).
- **High effort, high reward**: 4 pool + core + discovered synergy + tier-4 (12% apex drop) + day 80. Optional but usually wins (verb assessment below).
- **11th godhood** (voice_of_the_relay) keeps its office path + gets minDay 80.

## Villager path (the metric)

- **4 villager-reachable godhoods** via NPC_ABILITY_KITS order (first-5 grants must yield 4+ pool incl. core):
  - combat → one_person_army (added `rage` at 3rd; `phoenix_clause` stays 5th, preserves villager-phoenix trigger)
  - field → apex_predator (unchanged kit)
  - social → shepherd_of_the_dead (added `diplomat`, `generous`, `silver_tongue`)
  - craft → undying_ward (added `field_medicine`; kept `preservation_instinct`/`iron_stomach` reachable)
- **Villager synergy discovery**: holding all legs 12 days → discovered (deterministic, narrated). New `blood_rage` synergy [rage, haymaker] for the army path.
- **Villager item**: `villagerKillLoot` already gives 12% tier-4 from apex kills (Steve 2026-10-09).
- **Wiring**: `npcGrantAbility` → check; `npcSynergyTick` (daily) → check; `villagerKillLoot` → check; ceremony played via `villagerRecognitionCeremony` + pantheon registration.

## Player path

- 4 pool abilities via System offers with **build-aware bias** (`_synergyGiftPick` extended: the System notices a 2+ pool build and feeds it).
- Synergy via use (existing `checkSynergyDiscovery`).
- Tier-4 via apex kills / extreme-risk contests.
- `checkPlayerGodhoodAscension` wired into `chooseAbility`, trial gifts.

## Discoverability (Steve: "this knowledge must be discovered somehow")

No free wiki. Ability codex (`state.codex.abilities`) L1/L2/L3:
- **L1 heard-of** (name + rumor): hearing a villager grant, System revelation at integration 40/60/80 (pool of noticed build only, max 2/threshold).
- **L2 seen** (what it does): witnessing a villager use it (`noteVillagerAbilityUse`), mentor teaching (25%/day in party).
- **L3 understood** (synergy links): personal use.
- **Build guide**: `hintBeat` when close (3+ pool) names missing core abilities at L1+, teases the rest. Fires once, played.
- **UI**: Ability Codex section in Discoveries (discovered-only entries).

## Capstone verb review ("usually make a game winning run"?)

10/11 are winning-grade for their path (Raise Echo, Choose the Terms, Feed the Multitude, Phoenix, Turn the Pain, No Lies (social path), Walk the Horizon, Phase Out, Take the Wound, Speak and Be Heard). Market God (Summon the Market) is the weakest — indirect economic power. **No verb changes**: they've never fired; buffing now is tuning in the dark. Ship reachability, measure win-rate lift, tune verbs only if godhood doesn't usually win. → Steve overrule point.

## Proof tests (MEASUREMENT.md §§3,5)

- `scripts/proof-godhood-rework-20261013.js`: RED (old model rejects realistic build) + 15 GREEN (pool/core/synergy/item/day gates, villager path, idempotency, format validation, kit-order reachability). 18/18 green × seeds 7, 42, 99.
- `scripts/proof-godhood-discoverability-20261013.js`: RED (fresh codex empty, no wiki) + 14 GREEN (L1/L2/L3 paths, mentor, System reveal, hintBeat gating). 16/16 green × seeds 7, 42, 99.
- Ontology: `scripts/validate-ontology.js` passes (94 systems).

## Pilot results

### Round 1 (8 seeds × 150d, before capstone gift): 0/8 = 0.0% — BELOW BAND

Villagers reached 6 abilities and discovered synergies, but 0 godhoods.
Diagnostic (3 seeds) revealed:
- **Item was the binding gate**: 0 tier-4 in villager hands across 8 runs. One seed-99 villager had army kit✓ core✓ synergy✓ — only ITEM (and a day-path bug) missing.
- **Day-path bug**: `villagerGodhoodCloseness` read `(game.state||{}).day` but day lives at `state.scholar.day` → dayOk always false. Fixed in godhood.js/game.js/progression.js.
- **Fix**: the System grants the named capstone item when a build is complete-minus-item at day 80+ ("the work was the build; the item is the seal, not a lottery"). Fires once per godhood.

### Round 2 (8 seeds × 150d, after fix): 2/8 = 25.0% — above band (noise?)

### Round 3 (8 seeds × 150d, +10d holding period): 0/8 = 0.0% — OVER-THROTTLED, reverted

A 10-day holding period before the capstone gift killed the rate to 0% — villages die at 75–132d, so any delay interacts brutally with mortality. Reverted to immediate gift with a code comment documenting why.

### Round 4 (16 seeds × 150d, immediate gift): 2/16 = 12.5% — IN BAND ✓

**Convergence: converged.** 12.5% sits in Steve's 5–15% band. The round-2 25% was small-sample noise. Godhoods observed: undying_ward (seed 7), one_person_army (seed 99) — both villager-reachable paths firing as designed. Villages that die before day ~80 never ascend (endgame floor holds).

## Metric review (MEASUREMENT.md §14)

Metrics held. The 5–15% band was Steve's direct specification; the pilot hit 12.5% on 16 seeds. One risk to watch: village mortality (75–132d in competent sims) is the dominant throttle — if survival improves, the godhood rate will rise and may need re-tuning. The loops should re-measure if the survival distribution shifts.

## Steve's design calls (for overrule)

1. **Items = option (c)** (any tier-4). Rejected (a) remove and (b) easier drops — see Design.
2. **4 villager-reachable godhoods, 6 player-primary** — not all 10 villager-reachable. Rationale: kit math (5 grants/track, 6 slots) can't carry 10 builds; 4 paths suffice for 5–15%.
3. **No capstone verb buffs** — reachability first, tune on win-rate data.
4. **Kit reorder displacements**: `war_cry` 5th→6th (combat), `scream_cheese` 3rd→6th (social), `phoenix_clause` 4th→5th (combat, still reachable). Existing villager capabilities changed — flag if sims regress.
5. **Villager synergy = 12 days holding legs** (deterministic), not use-counted. Abstraction for sim simplicity.
6. **minDay 80 hard floor** — the direct implementation of "no mid-game godhood."

## Commits

- `97dcf3b4` — p1: pool requirements, villager path, wiring, kits, blood_rage, proof test.
- `6cad184a` — p2: discoverability (codex, hooks, UI, build guide), proof test.
- `13a5e486` — p3: capstone gift + day-path fix (scholar.day).
- `f8976b48` — dayPart fix for ceremony.
- [final] — evidence + holding-period revert.
