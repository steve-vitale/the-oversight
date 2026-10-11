# Wave 3–5 Signature Mechanics — Proof (2026-10-11)

**Scope correction:** Wave 3's 9 monsters already had real mechanics (sigW3a/b/c). The debt was **waves 4+5 only = 17 monsters**. Wave 4 ("The Mirror Draft") is done here; wave 5 ("The Producers") by a sibling worker, merged separately.

## What was built

`src/js/sigW4.js` (~48KB) — 9 signature mechanics, all registered into `MonsterBehaviorHooks`, wired via `monsterBehaviors.json` preTurnHooks, combat buttons in app.js, villager field-fight layer in fieldFights.js.

| Monster | Signature | Counter |
|---|---|---|
| congregation | invite→absolve liturgy; accept = heal 40 + 2-round geas (kneel/give compulsions) | refuse (it must ask first), heresy (25 dmg, breaks geas) |
| strike | posts readable demands, then 2-round total shutdown | meet a demand (non-violent resolve), scab at half strength |
| influencer | recruits literal follower adds; Ratio sharpens, favor drains | kill followers, out-entertain (steal them) |
| audit | scheduled every-3-rounds audit taxes most-used verb; 500 kcal or 20 HP "fees" | read the clipboard (exact data), deliberate jank |
| reunion | mirrors most-used verb (2+ uses, 3-round cooldown); repeats weaken | novelty — never repeat yourself |
| suburb | rest heals 30 but +1 complacency (5 = move in, routed) | walk out (2–3 moves), bring something alive |
| eulogy | 5-verse doom narration, each verse weighted | contradict verses (3 unlocks kind rewrite → dismissed) |
| algorithm | thumbnail previews; repeats countered ×1.5 | be unpredictable, tank on purpose (poisons its data) |
| eater (Steve's) | eats grid food, +15 dmg per 1000 kcal; snacks packs when adjacent | poison the meal (2-round vomit), starve the field |

## Proof

`scripts/test-wave35-mechanics.js` — 40 assertions per seed, green SEED=1,2,3. MECHANIC=off → RED (5 gates fail, behavior checks skip). Every assertion: (a) mechanic fires in a real headless fight, (b) telegraph text matches engine behavior, (c) counterplay resolves, (d) blow-by-blow via sim-harness (no outcome tables).

Bugs caught by the proof (fixed):
- Heal clamp `Math.min(p.maxHp, ...)` *reduced* overhealed fighters — now preserves overheal.
- Strike demands were nulled at shutdown, making "meet a demand" unusable during the shutdown it was meant to end — demands persist until met.
- Eulogy contradiction math was muddled (net-zero) — now cleanly erases one verse.

## Fight transcripts (sense-read)

### Eulogy — contradict ×3, rewrite (SEED 7)
The Eulogy narrates its first verse ("and then they stood their ground, poor brave fools"). Each contradiction visibly crosses the line out; the verse counter holds at 5 because the player keeps erasing the verse just narrated. After 3 contradictions the rewrite option unlocks: "You give it a better ending: '...and then they walked out of the story, and it had to find someone else to end.'" The Eulogy closes — dismissed, not killed. Reads as a genuine Undertale-style spare. The doom path (5 uninterrupted verses → maybeCheatDeath) was verified in the unit assertions.

### Eater — poison the meal (SEED 7)
"👄 SMACKING — audible chewing from a mile off. It eats forage (300 kcal). The belly swells." Damage grows as it eats. The poison offer: "You offer the meal — rich, steaming, wrong. It SMACKS it down whole. Then the belly sloshes wrong." Two rounds of vomiting, can't gorge. The telegraph (smacking) is honest about the mechanic (it eats, it grows).

### Audit — read the clipboard (SEED 7)
Abacus clicks telegraph the audit a round early ("Audit tomorrow"). The audit fires: "The clipboard flips to YOUR sheet: 'strike' flagged INEFFICIENT. Taxed: half stre[ngth]... Plus the bill: 500 kcal, or 20 HP in 'processing fees.'" Reading the clipboard shows exact data: most-used verb, count, next audit round. The player can see it coming and switch verbs — the counter is legible.

## Wave-5 titan nominations (for the titan worker)

1. **finale** — the obvious inaugural titan. It's the season's closing act; a titan-class season finale that the whole village must survive is the natural capstone.
2. **cancellation** — a titan that can end *other* things (fights, buffs, maybe the run's momentum) fits the titan scale: a threat you organize the village around, not solo.
3. **network_note** — the show's immune system made manifest; as a titan it becomes the season's recurring antagonist force rather than a single fight.
