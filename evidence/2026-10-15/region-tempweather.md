# Region temperature + heat/cold stress + weather expansion — 2026-10-15

## What was built

**`src/js/temperature.js`** (new, `Game.temperature`, strict-grammar ontology header).
Derives a daily °C from the region's climate calendar and gives the new
weather teeth — all through guarded wrap-once hooks, no game-loop rewrites.

- **Temperature model** (`tempC`): season `temp` label → mean °C
  (frozen −12 / cold 2 / cool 10 / mild 17 / warm 24 / hot 31), seasonal sine
  ±5 peaking mid-season, day-part swing (dawn −4, afternoon +4), weather
  modifier (heat +6, cold −6, storm −3, rain −2), clamped −40..48.
- **Sky naming** (`skyKind`): heatwave (rolled heat or ≥35°C), snow (rolled
  cold + subzero), frost (rolled cold + above freezing), storm. No
  regions.json changes needed — derived, so Codex's concurrent livelihood
  work is untouched.
- **Stress**: exposed player pays in kcal/hydration/energy per day part;
  heatstroke ≥40°C and frostbite <−10°C as mundane **conditions**
  (statusEffects.json — not diseases, never alien). Villagers lose health in
  extremes (`v.health`, −3/day).
- **Weather teeth** (via the `S.modifiers.collectModifiers` funnel, so engine
  forage, `walkStepKcal`, travel encounters all feel it):
  - snow: forage ×0.5, travel cost ×1.5
  - frost: forage ×0.8
  - heatwave: forage ×0.7, hydration burn ×1.75, mosquito pressure up
  - storm: travel encounters ×1.5, forage ×0.85, fire +16 ticks
  - heatwave also eases fire-starting (−8 ticks, tinder-dry fuel)
- **Knowledge gate**: numbers/forecast only after 7 observed days in the
  region, a living villager with the forecast lifeseed skill, or the forecast
  ability. Before that: felt lines ("The air bites on the way in.").
  `statusLine()` for app.js adoption.
- One-line game.js change: `makeFire` reads `modTarget('fire.ticks_add', 0)`.
- statusEffects.json: `heatstroke`, `frostbite` (mundane conditions).

## Design calls

1. **Derived sky, not new table rows.** regions.json weather tables keep
   their sums; heatwave/snow/frost come from tempC + the rolled kind. Zero
   conflict surface with Codex.
2. **No altitude term** — regions.json has no altitude data (verified). Noted
   as a data gap for highland regions later.
3. **No clothing system.** Relief is fire / shelter (tent, hall) / shade /
   water — all existing, knowledge-gated. Clothing is a real gap, flagged as
   follow-up rather than invented here.
4. **Ticks shelved below 4°C.** `diseaseVectorTick` skips the whole vector
   tick in hard freeze (biologically honest: ticks don't quest below ~4°C,
   mosquitoes dormant below ~10°C). Narrated once/day. Small canon bend,
   documented.
5. **Fire does not protect from heat** (it makes it worse); shade/hall does.
   Cold keeps the existing guard set (haven/shelter/fire/cold_blooded).
6. **No new currency.** Every cost is kcal, hydration, energy, or time.

## Proofs

`scripts/test-region-tempweather.js` (seeded, full harness, Math.random
seeded before eval): **34 passed, 0 failed.**
- (a) calendar curve: summer mean 35.2°C vs winter −0.2°C; afternoon > dawn.
- (b) freezing exposed morning: −12 kcal vs 0 on mild control.
- (c) heatwave mosquitoes: 21 bites vs 3 over 300 ticks (wetland, dusk).
- (d) snow forage ×0.5 / travel 3 vs 2 kcal per step; frost ×0.8; heatwave
  hydration 42→74; storm encounters ×1.5, fire +16 ticks; heatwave fire −8.
- (e) knowledge gate: no °C / no forecast before knowledge; both after.
- (f/g) villager health 100→97 on a deep-cold day; cold-snap transcript
  sense-read (layered, coherent — existing "cold snap" line, then the snow
  reading, the sky-reader's forecast, the village aching).
- RED-verified: module removed → harness fails to load.
- `validate-ontology.js`: 115/115 green. `validate-regions.js`: 20 regions,
  6 playable, 0 errors. `check-wired.js`: 0 unwired.

## Follow-ups (not this change)

- Clothing/insulation as a gear layer (relief gating is currently
  fire/shelter/shade/water only).
- app.js adoption of `Game.temperature.statusLine()` (DOM-only, untested here).
- Storm fire-starting is ticks-only; a gust-kill event would be spicier.
- Villager relief: no village-level mitigation yet (hall assumed, not modeled).
- Altitude data for highland regions (sa_andes, central_asia_highlands).
