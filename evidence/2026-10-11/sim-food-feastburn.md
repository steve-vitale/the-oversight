# Long-run sim — food economy follow-up: feasts & the yield side (2026-10-11)

Lever 0: **food economy**. Follow-up to `sim-food.md`, which left two blanks:
(1) FEASTBURN CONVERSIONS — reachable in code, 0 events in 20 runs; does the
food→damage loop ever matter? (2) YIELDS/SPOILAGE — garden harvest 41% of rot,
fish 16%; is the smoke technique enough or does the yield side need a move?

## Blank 1: the feast→damage loop was BROKEN in game code — fixed

**The find.** `hostFeast` (game.js) cleared `scholar.prog.feastSurge` and marked
`feastSurgeUsed = true` *before* calling `grantFeastBuff` — whose devotion
gate then refused every armed feast. An armed player who feasted got two
contradictory lines in one evening:

- "The channeled keepsake burns with the feast — the feast was the weapon. (FEAST SURGE ×1.5 spent)"
- "The feast is warm and good — full bellies, loud laughter — but no keepsake was channeled. The surge must be armed before a feast can carry it: hold a keepsake and channel first. (Feast buff refused: devotion gate.)"

…and never the damage buff. The food→damage loop could not fire through the
only player path. Three canon sources agree on the intended contract
(progression.js ×2 comments, feastBuff.js `noteFeastedCombatUse`): *the feast
carries the arming; consumption happens on first real combat use; a feast that
warms no blades spends no devotion.* Worker A's ritual test had encoded the
contradiction ("spent BY the feast") without ever asserting a buff granted.

**The fix (exact):**
- `game.js` `hostFeast`: no longer disarms/marks pre-grant. The feast object
  now carries `surge` (the armed value, 0 when none) into `grantFeastBuff`.
- `feastBuff.js` `grantFeastBuff`: the devotion gate reads
  `(s.prog||{}).feastSurge || feast.surge`. Spend/mark still happens only in
  `noteFeastedCombatUse` (unchanged). Contract comment + ontology rule updated.
- `app.js` copy: plan view now says the feast "will carry it into the fight …
  first real combat use spends it"; result view matches.
- `scripts/test-feast-ritual-proof.js` group 5 rewritten to the carried
  semantics (it encoded the bug); contract-shape check now includes `surge`.

**Proof:** `scripts/test-feastburn-20261011.js` — **18/18 × 2 seeds**: armed
feast grants (mult math exact: uplift(quality) × surge, e.g. q2 × 2.0 = 3.0),
unarmed feast honestly refused (social engine still works), arming carried not
spent at feast time, first real combat use spends it (strike line states the
uplifted number, `FEASTED ×3` stated, `tbDamage(10)` → exactly 30), feast with
no combat leaves devotion armed past dawn. Regressions: ritual proof 21/21,
`test-feast-buff.js` 67/67, ontology 72/72. **[needs-eyes]** — combat numbers
change: the buff now actually grants.

## Blank 1, measured: does the loop matter? (20 seeds × 200d, identical seeds)

New policy `scripts/policies/feastseek.js` (competent + devotion engine:
channels a keepsake daily once taught, fights with ability actions, feasts at
dusk at the haven when the surge is armed and the pantry can carry it).
Harness: `scripts/sweep-feastburn-20261011.js` (also fixed a `sim-harness.js`
`driveFights` null-deref exposed by ability-using policies).

| | competent | feastseek |
|---|---|---|
| median survival | 71d | 70d |
| wins | 0/20 | 0/20 |
| feasts hosted | 0 | **305** |
| buff grants | 0 | **305 (100% grant rate)** |
| runs with ≥1 grant | 0/20 | 8/20 |
| runs armed ≥once | 0/20 | 17/20 |
| `feastSurgeUsed` (real combat use) | 0/20 | **3/20** |
| sentiment taught | 18/20 | 18/20 |
| feasted extra damage (total, 20 runs) | 0 | **~96 kcal** |
| ability uses in combat | 0 | 796 |
| spoilage waste | 5,005k kcal | **3,595k kcal (−28%)** |
| starvation deaths | 24 | 26 |

**Verdict: REACHABLE, marginal as damage, real as a waste valve.** The chain
works end-to-end now (arm → feast → grant → combat use, all instrumented),
but in competent play the damage is ~96 extra kcal across 20 runs: the buff
window (dusk→dawn) rarely coincides with a real player fight — a competent
player flees bad fights, and night haven defenses are mostly villager
business. The feast's lever-0 value is elsewhere: it **ate 1.4M kcal of
would-be-rot** (−28% spoilage) while feeding the trust engine. No survival
delta (71d vs 70d), no starvation delta — the 1.5× pantry gate keeps feasts
honest. A feast is a consumption sink for the structural surplus, not a
win-condition.

## Blank 2: the yield side — the smoke technique needed one more move

Waste-by-name, 20 seeds, competent, current master (smoke technique active):

- `pantry|Foraged food` 44.0% (2,202k) — fresh, still rotting
- `pantry|Foraged food (dried)` 18.4% (921k) — **the smoke technique's own output, rotting**
- `pantry|Garden harvest` 15.2% + `(dried)` 5.5%
- `pantry|Fish catch` 10.3% + `(smoked)` 3.8%

**28% of all waste was preserved food the village never got to.** The village
eats ~125 kcal/person/day from the pantry and eats fresh-first; a preserved
stockpile beyond (own shelf × daily draw) rots on the racks. The cook was
converting fresh rot into preserved rot.

**The lever move (exact, `game.js` cook duty):** the racks stay shut when the
pantry's preserved stores exceed what the haven can eat before this cook's
shelf expires — `rackCap = 125 × roster × (ownShelf − 2)` (~19.5k for 12 with
an unskilled cook's 15d shelf; skill-aware: a preserver's 30–45d shelf holds
proportionally more). The cook says so honestly: *"The racks are already full
(24,500 kcal kept — more than the haven can eat before it turns), so Lena left
the fresh pile for tonight's dinner instead of smoking it onto the rot pile."*
Only binds in overproducing villages — lean villages never see the cap.

**Before/after, 20 identical seeds, competent:**
- preserved-rot: **1,424k (28.4%) → 279k (6.5%)**
- total waste: 5,005k → 4,324k (−14%; the unsmoked fresh rots fresh instead)
- median survival 71d → 71d; paired: 9 up / 6 down / 5 same (noise)
- starvation deaths 24 → 30 — mechanism-checked as noise: the cap only binds
  when the pantry already holds >13 days of preserved food; a village with 13
  days of preserved food is not starving, and preserving resumes as the pile
  is eaten (no lock-in).

**Proof:** `scripts/test-village-smoke-20261011.js` 21/21 (4 new rack-full
assertions: unskilled cook stops above the cap and says so; skilled cook's
higher cap still preserves).

**Yield verdict:** no yield cuts. The village overproduces ~2–3× what it eats,
but starvation is rare and combat binds — cutting forage/garden/fish yields
would risk lean-village starvation for a cosmetic waste number. The honest
moves were: the cook's racks (shipped), the racks-full cap (shipped), and the
feast as a consumption sink (measured, policy-side). The remaining fresh rot
is the village eating what it wants and leaving the rest — sensical.

## Village assessment (plain words)

The village lives about 70 days and dies in combat — every run ended
`village-lost`, combat deaths outnumber everything else 4:1. Breadth-60 (the
sentiment lesson) is reachable in 18/20 runs, so the devotion lane is live by
mid-game; but without a player who channels keepsakes and uses abilities, the
surge never arms (competent: 0/20 armed; feastseek: 17/20). The villagers who
thrive are the ones with jobs that match the surplus — fishers and foragers
fill the pantry; cooks (newly honest) work the racks; the village that feasts
turns rot into an evening that matters. Nobody starves while the pantry
overflows. The missing capability is on the player side: the devotion engine
needs a human who actually holds a keepsake and thinks about someone.

## Sense-testing (transcripts read, not counts)

- Lena Espinoza, rancher, day 1: *"We're eating through stores faster than we
  replace them. Forage with me tomorrow? I know the east treeline."* —
  scarcity-aware, concrete, an invitation. Sensical.
- Carmela McGrath, welder, day 3: *"Heh. The pantry's nearly bare. Forage
  with me tomorrow? I know the east treeline."* — same treeline line twice
  across villagers is a generator-repetition wrinkle worth noting, but each
  delivery fits its speaker.
- Teaching: *"You show them American Hazelnut — where it grows, how to tell
  it apart. Their eyes widen. 'I never knew that.'"* — the knowledge economy
  lands.
- Lena on monsters: *"I've decided the monsters are just wildlife with
  better PR. Don't quote me."* — voiced, wry, hers.
- Feast (armed, televised): *"🍖 FEAST 📺 — Joshua opens the pantry wide: 32×
  Dried beans. Tamika, Rocco, Logan, Abdallah and 7 more eat until the fire
  burns low. Somebody laughs so hard they cry. For one evening, nobody is
  surviving — they're just together. (−4,800 kcal from the pantry) The
  channeled keepsake feeds the feast — the feast was the weapon, and the
  surge rides the fire until dawn, spent only when the blades are warmed.
  (FEAST SURGE ×1.5 armed)"* — the cost is real, the payoff is stated, no
  contradictions anymore.
- Grant: *"🍖 FEASTED ×2.03 until dawn (4 parts left): a proper feast. A
  channeled keepsake feeds the flames (devotion ×1.5). Strikes and abilities
  hit with the feast behind them."* — true number, stated plainly.

## Blanks: filled / documented

- FILLED: the feast→damage chain (hostFeast/grantFeastBuff contract bug) —
  food→damage is reachable end-to-end for the first time.
- FILLED: racks-full cap — the smoke technique stops manufacturing preserved
  rot (28% → 6.5% of waste).
- FILLED (tooling): `sim-harness.js` `driveFights` null-guard for
  ability-using policies.
- DOCUMENTED: the feast's real lever-0 role is a consumption sink + trust
  engine, not a damage win-condition — ~96 extra damage per 20 runs in
  competent play. If Steve wants the damage loop to matter more, the binding
  constraints are (a) the buff window vs fight timing and (b) the competent
  instinct to flee — that's lever-1 (combat) territory, not a food-economy
  number.
- DOCUMENTED: no yield-side cuts — justified above.

## Design calls for Steve's overrule

1. Feast carries (not spends) the armed surge; spend/mark on first real
   combat use. (Adopts the contract already stated in progression.js and
   feastBuff.js.)
2. Racks-full cap: 125 kcal/person/day × roster × (own shelf − 2).
3. Feasts gated on armed-only in the feastseek policy (the social feast is
   lever-5's call, not measured here).
