# Long-run sim — food economy ROUND 2: the surplus at scale (2026-10-11)

Lever 0: **food economy** — round 2. Territory: (1) the surplus economy at
scale (day-40+ calorie ledger: production by source, pantry flow, spoilage,
nightly draw — where does it break?), (2) feasts/feastburn + askSpecialist
reachability, (3) villager agency around food (transcripts, SENSE-TESTING LAW).

Round 1 (sim-food.md) shipped the village smoke technique. The feastburn
follow-up (sim-food-feastburn.md) fixed the feast→damage chain and added the
racks-full cap. This run does NOT redo those.

## The lever: the league granary opens in famine (game code)

**The blank.** The covenant's headline promise — "draw on it in famine; every
draw is written in the council's book" — never fired in play. Nothing in the
engine draws; no policy ever did. Measured: seed 33 reached NATIONAL at day 25,
held it 59 days, and died village-lost at day 84 with **pantry 0 kcal and
17,330 kcal sitting in the league granary**. The insurance never paid out.

**The change (exact, `src/js/game.js` `villageEats`).** At the day's start,
before the meal loop: if the pantry is bare (`<= 0 kcal`) and the league pool
holds food, the granary opens automatically — draw the village's measured daily
burn (7-day rolling `burnHistory` honest net; fallback `roster × 1000` kcal),
via the existing `drawLeaguePool` (real items, council's book, narrated).
A `_granaryFedDay` flag stands the famine machinery down for the fed day: the
end-of-day famine block (`-4 health`, `hungryDays` → scattering) must not
mistake an eaten draw for a famine — the pantry is bare again after the meals,
but nobody went hungry. When the pool is empty, the famine is honest
(unchanged). When the pantry isn't bare, the granary stays shut (unchanged).

Design call (Steve 2026-10-07: make the call, document it): automatic, not a
player verb — the player already opted in at the Founding Council ("found the
shared POOL"), and the tier-3 granary's reserve bins already open automatically.
The amount is the measured burn (insurance, not a subsidy); it never draws more
than the village actually eats.

**Proof:** `scripts/test-granary-famine-draw-20261011.js` — **12/12 green**:
bare+pool draws the burn estimate (not the whole pool), says the famine line,
sets the fed-day flag; empty pool = honest famine; non-bare pantry = granary
stays shut; drawn food is eaten (no starvation drain); no-history fallback is
roster×1000. Regressions: village-smoke 21/21, feast-ritual 21/21, feast-buff
67/67, feastburn 18/18, ontology 74/74.

**Before/after, 24 identical seeds × 200d (scalecourt policy):**

| | before | after |
|---|---|---|
| pool kcal ever drawn | 0 | **9,708** |
| seed 33 (the national run) | d84, pool 17.3k untouched | **d91 (+7), pool drawn to 9.5k** |
| median survival | 60d | 60d |
| starvation deaths | 69 | 69 |

Honest scope: only 1/24 runs reaches covenant-national (the pool's only
source), so the aggregate is small — the lever fires exactly where the blank
was. No survival regression, no behavior change for non-covenant runs.

## The policy fix: eat the day's haul (tooling, not the lever)

**The find.** 69 "starvation" deaths in the baseline — but the probe proved
they're **player deaths, not villager deaths**: `playerDeath('starvation')`
records `kind: 'villager'`, indistinguishable from famine-block deaths in the
telemetry. The player was starving **away from haven with foraged food in the
pack** (d45: 540 kcal of Muscadine Grapes held, kcal=0, died). Root cause: the
harness runs `policy.daily` (which forages) AFTER the last `upkeep` (which
eats), then sleeps — the day's haul was never eaten before the overnight
spiral. Round 1's "3 starvation deaths" vs this run's 69 is the **cause rename
today** ('the night' → 'starvation' for the overnight spiral; round 1 counted
39 'the night' deaths separately).

**The fix (policy tooling, `scripts/policies/competent.js`).** `competentEat`
at the end of `daily`, after foraging/sorting/donating — eat the haul before
the harness sleeps. Seed 11 targeted: 5 player starvations → 1, village-lost
→ survived.

**Measured (24 seeds; policy change diverges RNG, so directional):**
starvation deaths 69 → 56; national reach 1/24 → **5/24**; wave-3 reach 2 →
4. The competent player now lives long enough to reach the scale content —
where combat binds (combat deaths 220 → 251). Reachability verdict: national
is reachable by competent play, and more often when the player eats.

## Village assessment: the day-40+ calorie ledger (plain words)

New harness `scripts/sweep-scale-food-20261011.js` + policy
`scripts/policies/scalecourt.js` (competent + covenant-road courtship). Full
IN/OUT ledger per run: duty production by source, tribute/tariff/pool flows,
meals/rations/feasts/pours, spoilage, daily pantry/roster/rank/pool state.

24 seeds × 200d, before:
- The village **overproduces**: IN ~3.5M kcal (Garden 1.47M, Fish 1.45M,
  Foraged 614k, + cook transforms 785k) vs meals+rations ~2.4M. Spoilage
  4.7M total (3,430 kcal/run-day) — the smoke technique + racks cap manage
  it, but the surplus is structural.
- **Starvation is a player problem, not a village problem.** The pantry is
  routinely 40–80k while the player starves on expedition (policy, fixed
  above). Villager famine deaths are rare; the village eats.
- **At scale, the break is the undrawn granary** (seed 33, above). Tribute
  flows are small (5k out, 17k league-pour across 24 runs); the scale economy
  doesn't starve — it just never uses its insurance.
- Median 60d, max 84d (91d after lever). Wins 0/24. Arc III 23/24. Wave 2 is
  the mode; wave 3 reached in 2–4 runs. Combat binds everywhere.

## Reachability verdicts (food content)

- **Preservation ladder**: reached (cook duty + racks cap, round 1). ✓
- **Feasts/feastburn**: reachable end-to-end (feastburn follow-up); the
  feastseek policy hosts 305 feasts/20 runs. As damage it's marginal (~96
  kcal/20 runs); as a waste valve it's real (−28% spoilage). ✓
- **League granary**: was decoration in famine — **now opens** (this run). ✓
- **askSpecialist**: game-code sound (verified: whoOptions honest,
  "Clean it yourself (needs a knife)" vs "Ask {name}"; specialist cleaned a
  turkey carcass to 520 kcal; two watches teach). **Unreached by policy** —
  the competent policy never hunts and its traps don't catch, so it never
  holds a carcass. For a human hunter it's discoverable (contextual buttons
  on the carcass card). Documented, not changed — the policy's hunting
  stance is a bigger question than this lever.
- **Win flag / table**: 0/24 wins, 0 table reaches. Out of lever-0 scope.

## Sense-testing: villagers around food (transcripts read)

**Human:**
- "🍲 Lena cooked for the haven — meals stretched. Lena worked the smoke
  racks too — 5 batches preserved (~3125 kcal, keeps a couple of weeks)." —
  the cook duty is honest now (round 1's fix, working).
- "A man, maybe 40s, with tattooed arms spends the afternoon with the tree
  with lobed leaves and oval nuts in scaly caps — look, smell, the smallest
  taste, then waiting." + "The Journal notes it: White Oak Acorns — cook it,
  or else." — curiosity and earned knowledge, attributed.
- "◈ CRISIS — THE HUNGER WINTER… 'The bins are echoing. We vote half
  rations — three days, everyone, no exceptions — or the hunters go out
  hungry and bring back more than hunger.'" — the crisis is voiced, the
  choice is real.

**Robotic (documented blanks, not this lever):**
- "X is working the cookpot, tasting, adjusting." — identical line, only the
  name swapped (Deirdre, Rosa, Carmela, Sujon, David…). Ambient, but
  template-repeated.
- "Should've smoked that. Fresh stuff keeps a day or two on the shelf — the
  smoke rack is right there." — **verbatim from 9+ villagers** (Sujon,
  Sofia, Carmela, David, Marcus, Marta, Lena, Tariqul, Henry). The spoilage
  mutter needs voice variation or a no-repeat ledger. Flagged for the
  agency/dialogue loop.

## Blanks: filled / documented

- FILLED (game): league granary famine auto-draw — the covenant's insurance
  pays out. Proof 12/12, measured on identical seeds.
- FILLED (tooling): competent policy eats the day's haul — 5→1 player
  starvations on seed 11; national reach 1→5/24.
- FILLED (tooling): `scripts/sweep-scale-food-20261011.js` — full calorie
  ledger harness (IN by source, OUT by sink, daily state); `scripts/policies/
  scalecourt.js` — covenant-road courtship policy.
- DOCUMENTED: askSpecialist sound but policy-unreached (no hunting).
- DOCUMENTED: dialogue repetition ("cookpot, tasting, adjusting";
  "Should've smoked that" ×9) — agency/dialogue loop's blank.
- DOCUMENTED: playerDeath('starvation') records kind='villager' — the
  telemetry cannot distinguish player starvation from villager famine.
  (Measurement note for all loops.)

## Design calls for Steve's overrule

1. Granary opens automatically in famine (opt-in at Founding Council;
   precedent: tier-3 reserve bins). Amount = measured daily burn, never more
   than the day's need.
2. Fed-day flag stands down the famine machinery (no health drain, no hungry
   day) when the granary fed the village.
3. Policy eats after the day's foraging (tooling, not game feel).

No `[needs-eyes]`: no feel/combat/UI change — the granary draw is narrated
famine relief, the policy fix is sim-only.
