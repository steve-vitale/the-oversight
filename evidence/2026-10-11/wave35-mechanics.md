# Wave 3–5 Signature Mechanics — Proof (2026-10-11)

**Scope correction:** Wave 3's 9 monsters already had real mechanics (sigW3a/b/c). The debt was **waves 4+5 only = 17 monsters**.

## Wave 4: "The Mirror Draft" (done)

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

**Proof:** `scripts/test-wave35-mechanics.js` — 40 assertions, green SEED=1,2,3. MECHANIC=off → RED.

## Wave 5: "The Producers" (done)

`src/js/sigW5.js` (1517 lines) — 8 signature mechanics by sibling worker, integrated with shared wiring (monsterBehaviors.json, index.html, app.js, fieldFights.js).

| Monster | Signature | Counter |
|---|---|---|
| cancellation | stamp descends 3 turns, un-teaches 2 System abilities, silences favor | go off-script, spend favor |
| editor | cuts every 3rd turn (turn/position/ally), telegraphed; cut things go to floor tile | retrieve them, contradict to jam |
| rerun | resets positions+HP every 5 rounds, +10% adaptation | margin messages persist, win fast |
| spoiler | truthful prophecies gain weight; Leaked Ending manifests through hook | fulfill cheaply (5 dmg), binding question |
| timeslot | 3-turn venues, strictly worsening, highlighted ahead | own the venue, don't be boring |
| nielsen | ratings 0-100; gaze scales, undodgeable; at 0: 2-round sign-off | fight boring to starve it |
| finale | declares at 50% HP or round 4; 3-round countdown to [150,200] title card | sacrifice (item/kcal), end it first |
| network_note | announce-then-apply memos; fragile by design | feed bad notes (applied then reverted), kill first |

**Proof:** `scripts/test-sigW5.js` — 144 assertions, green SEED=1,2,3. MECHANIC=off → RED.

**Integration fixes:** The worker's test had 4 brittle exact-number assertions (damage probes assumed no stacking; nielsen double-ended the turn). Fixed: probes now use ratio/baseline isolation, nielsen asserts against HP-difference (what the hook reads). Mechanics were correct — 156 for buff+vuln stacking is the honest answer.

## Fight transcripts (sense-read)

### Eulogy — contradict ×3, rewrite (SEED 7)
The Eulogy narrates its first verse ("and then they stood their ground, poor brave fools"). Each contradiction visibly crosses the line out; the verse counter holds at 5 because the player keeps erasing the verse just narrated. After 3 contradictions the rewrite option unlocks: "You give it a better ending: '...and then they walked out of the story, and it had to find someone else to end.'" The Eulogy closes — dismissed, not killed. Genuine Undertale-style spare.

### Eater — poison the meal (SEED 7)
"👄 SMACKING — audible chewing from a mile off. It eats forage (300 kcal). The belly swells." Damage grows as it eats. The poison offer: "You offer the meal — rich, steaming, wrong. It SMACKS it down whole. Then the belly sloshes wrong." Two rounds of vomiting, can't gorge. Telegraph honest.

### Audit — read the clipboard (SEED 7)
Abacus clicks telegraph the audit a round early ("Audit tomorrow"). The audit fires: "The clipboard flips to YOUR sheet: 'strike' flagged INEFFICIENT. Taxed: half stre[ngth]... Plus the bill: 500 kcal, or 20 HP in 'processing fees.'" Reading the clipboard shows exact data: most-used verb, count, next audit round.

## Wave-5 titan nominations (for the titan worker)

1. **finale** — the obvious inaugural titan. Countdown-to-doom scales to raid coordination.
2. **nielsen** — raid-wide ratings meter; "everyone fight boring" vs "burst during sign-off" is a real raid decision.
3. **editor** — cut-a-player's-turn at raid scale, with contradiction as interrupt rotation.
4. **cancellation** — can end *other* things (fights, buffs); a threat you organize the village around.
