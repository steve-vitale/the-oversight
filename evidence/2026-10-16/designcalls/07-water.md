# Design call 7 — WATER TRIGGER: villagers adapt duties to thirst themselves
`evidence/2026-10-16/designcalls/07-water.md`

## Call
"When the village becomes thirsty, villagers should adapt duties (fetch water,
ration, seek sources) without the player micromanaging each one."

## Canon consulted (no invention)
- `docs/DESIGN.md:9-10` — 4 day-parts; evening: eat, spoilage tick, water check. Hunger/water are the primary pressures.
- `docs/BALANCING.md:43` — hydration burn ~55/day (player), dehydration -12; attrition numbers.
- `docs/TIME-ECONOMY.md:64-67` — fill bottle 1 tick; boil 32 ticks + 50 kcal.
- `docs/DIRECTIVES.md` — "Decisions, not chores." The fix makes thirst a legible
  decision surface (the village announces rationing; fetchers visibly walk out),
  not a chore treadmill (no per-villager micromanagement, no new need stat).

## Current mechanism (files + functions)
- Thirst signal: `Game.state.village.water = {clean, dirty}` liters (game.js:2279,
  start 20L clean). `Game.villageDrinks()` (game.js:28252) — every villager draws
  ~2L/day, clean first then dirty; no water at all → -5 health each, thirst kills
  through the real death pipeline (game.js:28273).
- Duty assignment: `Game.objPick(vid, hx, hy)` (villager-objectives.js:187) — dawn
  re-pick from weighted candidates. The WATER duty exists: line 282
  `if (water < 3) cands.push({ kind: 'WATER', w: 3.5 })`, and `objReturnEffect`
  (villager-objectives.js:1007) restocks +2–4L clean per water return.
- Per-villager needs: `npcNeeds()` (game.js:15106) = {hunger, fear, social, energy}
  — no hydration dimension. The village shares one cistern, so the village-level
  supply-vs-demand signal is the honest one; no new needs system is warranted.

## Root cause (measured, seed 7)
The thirst signal exists and is consumed honestly — but duty assignment reads it
as a **binary cliff blind to demand**: `< 3L clean` against a 24L/day drain
(12 villagers × 2L) = ~3 hours of village supply.

- RED measurement (`/tmp/water-red.js`, sim-harness, seed 7): at 10L clean — less
  than HALF a day's supply for the village — dawn duty picks are identical to 30L
  (HAVEN_CHORE/VISIT only, **zero WATER picks**). The village drinks itself dry at
  full 2L/head with no adaptation until the cliff.
- At the cliff (<3L) only ~50% pick WATER (7/12 at 2L, 5/12 at 0L); returns
  (+2–4L each) don't cover the 24L/day drain.
- Unmitigated: 20L start cistern dry by end of day 1; everyone -5 health/day;
  first thirst death ~day 20.
- Competition is wrong: max FORAGE weight 5.5 (pantry<2000 + 'feed' goal) beats
  WATER 3.5, so a hungry+thirsty village forages while thirst kills faster than
  hunger (dehydration -12/day vs famine -4/day, BALANCING.md:43).
- **Rationing does not exist anywhere** (grep "ration" hits only unrelated words):
  between cliff-crossings everyone drinks full rations.

So: the signal is present, the response is a wrong-threshold cliff + no rationing
+ wrong competition. Not a missing system — a misread signal.

## The call made
1. **Fetch water — demand-aware gradient, not a cliff** (objPick): measure cistern
   supply (clean+dirty) in days-of-village-supply (`supply / (2L × living)`).
   WATER candidate appears when < 2 days of supply; weight ramps 3.5 → 6 → 8.5 as
   supply → 0, and ≥ 7 (beats any FORAGE) when the cistern can't cover today's
   drinks. Thirst kills faster than hunger, so it wins the competition at crisis.
2. **Ration** — `villageDrinks()`: when supply can't cover a full 2L ration for
   every living villager, the village rations itself to 1L/head — automatically,
   announced once per transition (at haven: said; away: awayNews), lifted with a
   second line when the cistern recovers. No player micromanagement; doubles the
   survival window for water runs to restock.
3. **Seek sources** — already exists (WATER objective walks out). Extended: when
   supply < half a day, the water run ranges farther (up to the villager's maxD —
   "the near creek is picked over") instead of the fixed 1–2 node errand.

Not built: per-villager hydration need (village shares one cistern; the signal is
village-level), player rationing (the player drinks own bottles), a new duties UI.

## Metric review
No new metrics invented; pre-existing green list must stay green. Proof test
asserts the three behaviors above fail-before/pass-after.
