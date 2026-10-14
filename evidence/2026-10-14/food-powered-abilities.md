# Food-powered abilities — evidence (2026-10-14)

Steve: "Abilities should be stronger, and they were always meant to be powered by food. So very food secure groups got a lot more uses of their abilities, or much more impact."

## What was built (src/js/foodPower.js, new module; 1 surgical tbDamage edit)

**1. Every ability burns kcal.** Data-declared `cost.kcal` wins (21/46 actions already had tuned costs, 15–100). Everything else gets a tier-table cost injected at `payActionCost` time (common 25 → body_horror 150, default 40). The 4 legacy hardcoded branches (blood_magic, time_skip, dowsing, echo_location) are hunger-gated; blood_magic is exempt from the burn (it's the kcal *source* — its price is HP).

**2. Overcharge.** kcal ≥ 75% of cap → abilities (and strikes, mirroring the feasted hook) deal ×1.25, labeled `OVERCHARGED ×1.25 (well-fed): food is fuel.` Takes the max with the feast buff — never stacks. Visible on every ability button before use.

**3. Group-level: village food tiers.** Pantry days-of-food at measured burn → starving (<1d): villagers don't cast · tight (1–3d): cast only when outmatched · secure (3–7d): normal · abundant (≥7d): +1 bonus cast per fight per villager.

**4. Stronger ceilings, gated.** Overcharge is the raised ceiling (+25%); base numbers untouched. No general difficulty change.

**5. The tradeoff bites.** Costs are deducted from the ONE kcal economy; hunger-gate at 500 refuses everything with "eat first."

## Proof (RED→GREEN)

`scripts/test-foodpower-20261014.js`: RED 0/1 (module excluded) → GREEN 30/30. Covers: data-cost-wins, tier injection, burn deduction + narration, hunger gate (refusal deducts nothing, button shows "eat first"), overcharge trigger/label, feasted-max-no-stack, all four village tiers, villager cast gating (starving 0, abundant bonus = exactly 1/fight), button cost/overcharge display, ontology green.

Regressions: `test-ability-gaps.js` 16/16 (also fixed its hardcoded dead worktree path), `test-spawn-knack.js` 36/36.

## Playtests (scripts/playtest-foodpower-20261014.js)

**(a) Villager casts by tier** (2 villagers × 6 mock rounds, 2 monsters): starving **0** · tight **5** · secure **5** · abundant **7**. (tight==secure here by design — 2 monsters = outmatched, so tight casts; in a 1-monster fight tight casts nothing.)

**(b) Tradeoff**: real hushwolf fight, pocket_sand every other round: 4 casts burned **160 kcal** over 7 rounds. A few fights of ability spam = a real meal. The engine's arc holds: spam without income goes hungry.

**(c) Overcharge impact** (6 seeds/arm, fixed 120-HP target): base **6.2 rounds / 48 HP kept** → overcharged **5.2 rounds / 56 HP kept**. A full round shaved, 8 HP kept — the ×1.25 is narrated per hit (`OVERCHARGED ×1.25 (well-fed): food is fuel.`).

## Metric review (anti-drift)

- Pre-registered GO metrics (cost deduction, hunger-gating, overcharge trigger, group uses multiplier): all measured GREEN on identical seeds. No re-scoring.
- **Caveats, stated plainly:**
  - Overcharge also uplifts *strikes*, not just abilities — mirrors the existing feasted hook; flagged, not hidden. A 25% strike bump at full belly is the "food is humanity's superpower" thesis, but it does touch wave 1–2 pacing slightly.
  - New games start at 2200/2400 kcal = overcharged on day 1. This teaches the mechanic immediately and decays within a day of real play; judged acceptable, not a buff.
  - Non-damage ability effects (utility durations etc.) are NOT uplifted by overcharge — only damage via the tbDamage hook. "More impact" is damage-shaped.
  - Villagers have no individual kcal pools; their food link is the village tier gate, not personal burns. "Eat before casting" is enforced at group level.
  - Long-sim food-economy effects (does ability spam move the village wall?) NOT measured — needs the sim loops against this build.
  - The controltact worker is concurrently editing combat/control code; I touched one tbDamage block and wrapped tbVillagerAbility/useAbility defensively. Rebase will tell.
