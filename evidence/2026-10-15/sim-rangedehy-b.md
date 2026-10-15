# sim-rangedehy-b — RANGING-DEHYDRATION instrument (ARM 3, loop B 2026-10-15)

**Run:** fleshout-b-20261015T0805Z · ARM 3 of 3 · sim-findings **#290** (claims #290; SCHOLAR DEHYDRATION DEATHS WHILE RANGING — instrument-only diagnostic)
**Date:** 2026-10-15 · repo `~/workspace/the-scattering`, worktree `~/workspace/worktrees/sim-rangedehy`

## Canon note

docs/CANON.md read first. **There is no water/thirst canon doc** — per the canon rule this is stated, not invented. All water mechanics observed here are read from `src/js/game.js` + `src/js/engine/calories.js` as-is:
- The scholar NEVER draws from the cistern directly ("you drink your own bottles" — `villageDrinks` skips the player). Scholar water comes ONLY through `Game.fillWater()` (haven well draws 1L clean from the cistern per bottle; wild creek/wetland/pond sources free but risky), `Game.addWater` (storm/ability events), `Game.boilWater()` (risky→clean at a fire), and leaves through `Game.drinkWater()` (+50 hydration, 1 tick) or `Game.pourWater()`.
- Overnight: `resolveDay` subtracts `hydrationBurn` (night 30 + day 12 base; clear 1.5x, cold 0.75x; exertion ~1/32 ticks); hydration ≤ 0 → −12 health, −30 energy, telegraph `DEHYDRATED: find and treat water today.`; 0 health → `killedBy = 'dehydration'` (honest-cause change, player-survivability 2026-10-14).
- Taxonomy (sim-thirstinst-b): `thirst` = villager cistern death via `villageDrinks`; `dehydration` = the SCHOLAR's own overnight death. This instrument attributes ONLY the latter (`player:true`).
- `drinkSafe` is a POLICY-side helper (`scripts/policies/competent.js`), not a game verb — it calls `doAction('drink')` → `Game.drinkWater()`. The instrument wraps the four game verbs, which covers it.
- At-haven for a ranging scholar: `playerAtHaven()` = Manhattan distance from `(map.px,map.py)` to the haven tile ≤ 1. Distance-from-haven = that Manhattan distance.
- `Game.dayPart` is a NUMERIC index 0–3 (dawn/midday/dusk/night); `advancePart` increments to **4** then calls `endDay` — so the overnight metabolic death always lands at dayPart 4, which the instrument maps to `'night'` (found during this run; see metric review §3).

## Pre-registration (§11 — written before sims ran)

- **Primary metric:** attribution coverage = (ranging-dehydration deaths fully attributed) / (ranging-dehydration deaths). "Ranging-dehydration" = `cause === 'dehydration'` AND `player === true` AND scholar away from haven at the death beat (`!playerAtHaven()`). "Fully attributed" = every covariate slot present: death beat (day, day-part, location, atHaven, mapDist, vitals, scholar id/name) · pack water (liters, clean/risky, sources) · cistern at death · pantry/wood/roster/water-duty · 3-day thirst trajectory (dawn-state snapshots d−3..d−1: hydration, kcal, health, atHaven, mapDist, cistern, pack, weather, verbs) · water verbs called/refused in the 3d window + run totals · departure analysis (departDay, cistern at departure, daysAway; slot computed even when never-away) · sense-test beats (last 10 say lines + aftermath through next endDay).
- **GO threshold (DIAGNOSTIC GO):** coverage **≥ 80%** AND named separating factors between dehydrating and clean ranging runs (or honestly named **unconcentrated** per the separation rule). GO → land the instrument as this arm's commit (scripts + evidence only). MISS → evidence-only; the blank stays open with measured coverage.
- **Phenomenon-presence gate** (thirstinst metric-review lesson): the finding measured ~1 dehydration death per policy per 8 seeds; if the cohort produces 0 events the verdict is "phenomenon absent" (a finding, not a miss-on-the-merits).
- **Horizon + why:** 180 days, death-aware (§10 — reachability-style diagnostic; the deaths sit early but separation needs full ranging trajectories; dead villages stop simulating, +10d tail max).
- **Seeds:** 11, 22, 33, 44, 55, 66, 77, 88 — exact literals, identical everywhere.
- **Policies:** `leadcourt` + `belongseek` (the courtship substrate; the finding's deaths were measured there).
- **A/A sanity (binding):** armed = instrument wraps ON; pristine twin on leadcourt seeds 11/22 at the FULL horizon. Per-day state hashes (day, health, kcal, hydration, pack liters, cistern clean/dirty, roster, villagerId) armed-vs-pristine must be **byte-identical** (wraps are call-through; a divergence invalidates the attribution).
- **SMOKE=1 gate (instrument-honesty):** `policy.daily` fires ≥ 10× per run; at least one dehydration attribution observed in the fixture suite, or the instrument is measuring nothing.
- **Separation rule (pre-registered):** compare the per-death covariate rows vs clean ranging runs (ranged, i.e. maxMapDist > 1, but no dehydration death) from the same sweep. A factor "separates" if it concentrates on the dehydration event(s) and not on clean rangers. n=1 independent event expected (see results) → any named factor is **SUGGESTIVE-ONLY**. If no factor concentrates, report **unconcentrated** — do not invent a story.

## What was built (instrument only — zero src/js changes)

- `scripts/rangedehy-lib-20261015.js` — `installRangeDehy(Game)` / `finalizeRangeDehy(Game, track)`. Wraps: `Game.registerDeath` (full attribution record at the exact death beat — the dead scholar's state is still live, `s.water` intact, before succession), `Game.fillWater`/`drinkWater`/`boilWater`/`pourWater` (per-call {day, verb, refused} — refusals captured from say-beats: "The cistern is dry", "No water here", "Your pack is full", "Need a fire to boil water", "You're not thirsty"), `Game.say` (40-line ring for sense-testing + refusal capture + succession-aftermath capture through the next endDay), `Game.endDay` (post-resolution dawn-state snapshot: vitals, atHaven, mapDist, cistern, pack, water duty, pantry, verbs, weather). Departure analysis walks the snapshot sequence for the last at-haven→away transition. Follows the thirst-lib/trustdelta-lib call-through pattern; every wrap is try/catch-guarded; nothing consumes Math.random.
- `scripts/test-rangedehy-20261015.js` — fixture proof with REAL RED phases (patch-swap, never stash): Part A forced dehydration death AWAY (seed 11) → exactly-once, fully attributed, ranging, mapDist>1, departure computed; villager `thirst` registerDeath → no dehydration attribution (cause split). Part B forced death AT haven (seed 22) → not ranging, neverAway, fill/drink counted, one honestly-refused fill ("The cistern is dry"). Part C det-gate armed-vs-pristine byte-identical (seeds 11/22, 40d). Part D SMOKE. All green (36/36).
- `scripts/sweep-rangedehy-20261015.js` — 16 armed runs (8 seeds × {leadcourt, belongseek}, 180d death-aware) + 2 pristine A/A twins (leadcourt s11/s22). Raw JSON → `evidence/2026-10-15/perseed-rangedehy/`.
- RED verification: `~/workspace/rangedehy-red-20261015.patch` breaks the attribution gate (`'dehydration'` → `'dehydration_x'`); with it applied the fixture fails LOUD on attribution (5 failures, no crash); restored → 36/36 green. Green backup at `~/workspace/rangedehy-lib-20261015.js.green`.

## Results

### Proof tests (scripts/test-rangedehy-20261015.js) — GREEN 36/36
- **Part A (fixture, seed 11):** forced away-death attributed exactly once, fully attributed, `ranging=true`, mapDist 8, dayPart named, trajectory 3/3, departure computed (departDay 6, daysAway 1), pack/cistern/water-duty slots present, beats captured; villager `thirst` death → zero dehydration attribution, recorded in otherDeaths; zero instrument errors.
- **Part B (fixture, seed 22):** at-haven death fully attributed, `ranging=false`, `neverAway=true`, fill+drink counted, dry-cistern fill refused honestly ("The cistern is dry") and counted in refusedFills.
- **Part C (det-gate):** armed-vs-pristine **byte-identical** on seeds 11/22 (40d belongseek).
- **Part D (SMOKE):** policy.daily ≥ 10×, snapshots recorded, zero errors.

### Sweeps (16 armed × 180d death-aware + 2 pristine A/A twins)
- **A/A sanity: BYTE-IDENTICAL on both twins** (leadcourt s11: 34 days; leadcourt s22: 139 days) — the instrument is trajectory-neutral at full horizon.
- **Phenomenon reproduced:** 2 ranging-dehydration deaths — belongseek-s55 and leadcourt-s55, both **Violet Pang, day 12, night**, the same deterministic trajectory under both policies (n=1 independent event for separation).
- **Coverage: 2/2 = 100% ≥ 80%** — both fully attributed, zero instrument errors across all 16 runs.

### Attribution table (the two deaths — one deterministic event)

| slot | belongseek-s55 | leadcourt-s55 |
|---|---|---|
| scholar | Violet Pang (gen_f2mclqy) | same |
| death | day 12, night (dayPart 4), location 'village' | same |
| ranging | true, mapDist 6, 6 consecutive away nights | same |
| vitals at beat | hydration 0, kcal 0, health 0, energy 0 | same |
| pack water | 0 bottles (0 clean, 0 risky) | same |
| cistern at death | 0/0 clean/dirty | same |
| pantry | 39,194 kcal / 228 fresh days (food abundant) | same |
| water duty | 0 assignees | same |
| trajectory (dawn d10/d11/d12) | hyd 36→0→0; kcal 0/0/0; hp 73.7→32.5→14.5; away, dist 6; cistern 0/0; pack 0 | same |
| verbs, 3d window | day 9: 2× drinkWater (ok), 2× boilWater refused "Need a fire to boil water"; days 10–12: ZERO water verbs | same |
| verbs, run total | fill 3, drink 10, boil 10, pour 0 | same |
| refused fills | day 6: "The cistern is dry" (haven well) | same |
| departure | departDay 7, cistern at departure 0/0, daysAway 6 | same |
| fully attributed | true (all slots) | true (all slots) |

The mechanism, confirmed with full covariates: Violet tried to fill at the haven well on day 6 — cistern dry, refused. She departed on day 7 anyway with **zero pack water** into a 6-day range (mapDist 6). She drank twice on day 9 (boil attempts refused — no fire while ranging), then **no water verb at all for days 10–12**. Hydration hit 0; the −12/night dehydration cut landed on a body already at 14.5 HP (co-morbid starvation: kcal 0 throughout — the honest-cause engine attributed `dehydration` as the proximate killer). Food was abundant the whole time (39k kcal pantry). A pure water-MANAGEMENT death, exactly as #290 framed it.

### Separating factors (SUGGESTIVE-ONLY — n=1 independent event)
Clean ranging runs from the same sweep (ranged, no dehydration death): belongseek-s22 (3d away, dist 2, survived 182d), leadcourt-s33 (1d, dist 3, 139d), leadcourt-s44 (6d away, dist 4, survived 152d — the key comparator: a 6-day range at dist 4 with hydration 0 at three consecutive dawns, health 74–98 throughout, survived by returning).
- **SEPARATES (suggestive): departed with an empty pack while the cistern was dry.** Violet: 0 bottles + cistern 0/0 at departure (after a refused fill the day before). All three clean rangers departed WITH pack water (3 bottles at each stretch start; s44 drank its 3 down over the range and came home).
- **Does NOT separate:** away-stretch length (s44: 6d, survived), zero-hydration dawns (s44: 3), zero water verbs during the stretch (both zero), dry cistern at departure (s44's cistern also dried mid-stretch), starvation co-morbidity (s44 kcal 0 too).
- **Co-factor (suggestive): health buffer entering the dry spell.** Violet entered at 73 HP and falling (41 HP lost the night of d10→d11 — combat/wounds on top of metabolism; the instrument does not yet break down HP loss by source); s44 entered at 97. The −12/night cut is survivable with buffer, lethal without.
- Nothing else concentrated. Recorded as suggestive-only per the pre-registered rule, not as a law.

### Sense-test (SENSE-TESTING LAW)
- **Telegraph rule held:** "⚠ DEHYDRATED: find and treat water today." warned on the death run before the death (in the beats), same as the thirstinst read.
- **Succession aftermath reads as people:** "🕯️ Violet Pang is dead — dehydration. The village stops. Somebody screams. Somebody else starts digging." → "The Codex doesn't pause for grief. Elena blinks — and it's already there, overlaying everything, syncing." → the mantle passes to Elena Petrova (44, Baker); the successor walks back into Haven after 6 days gone and gets the away-news catch-up. Mourning: yes. Honest cause naming: yes.
- **Adaptation: NO.** Zero villagers assigned to water duty in the 40 days after the death (probed days 2–42 on the s55 trajectory); the cistern sat 0/0 for 16 days (days 2–17) and was refilled by **rain**, not by duty. The village grieves but does not change its water behavior. → new open finding (below).

### Wall numbers (the standing scale-wall report)
| policy | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| belongseek (armed, 8 seeds) | 1/8 | 0 | 0 | 2/8 | 0/8 | 107d | 182d |
| leadcourt (armed, 8 seeds) | 4/8 | 0 | 0 | 5/8 | 0/8 | 108d | 182d |
| **pooled** | **5/16** | **0/16** | **0/16** | **7/16** | **0/16** | **107d** | **182d** |
No table, no wins — the wall stands.

### Death-cause shares (armed, 16 runs)
combat 70 (monster) + 43 (villager) + 21 (monster:villager combat), monster 22, starvation 12, sickness 13, wound 7, contest 7, lockjaw 2, expedition 1, Buffering 1, alien 1, dehydration 2. Zero `thirst`.

## Village assessment (plain words)

Sixteen villages lived under the instrument's eye and the eye touched nothing (A/A byte-identical on both twins). Two of them — the same deterministic Violet Pang on seed 55 under both policies — died the water-management death #290 named: she tried the well on day 6, found it dry, ranged out on day 7 with empty bottles anyway, drank twice on day 9, then nothing for three days, and the night took her on day 12 with a full pantry back home. The villages that survived their own ranges all did one thing she didn't: they left Haven carrying water. The village that lost her grieved properly — screaming, digging, the Codex turning its own page — and then changed nothing: nobody was put on water duty, the cistern sat empty for over two weeks, and rain, not work, filled it again. The instrument itself is proven (36/36 fixture, REAL RED via patch-swap, full-horizon det-gate) and ready for the next water/ranging lever.

## Blanks filled / documented

- **FILLED (tooling, #290): the ranging-water instrument.** `installRangeDehy`/`finalizeRangeDehy` proven in fixture (away + at-haven attributions, cause split vs villager `thirst`, verb/refusal counting, departure analysis) and det-gated byte-identical at full horizon (2/2 twins). **GO met (coverage 100% ≥ 80%, separating factor named suggestive-only) → landing as its own commit (scripts + evidence only), zero src/js changes.**
- **DOCUMENTED (finding): the death's full covariate signature** (table above) — the named next step #290 asked for, delivered.
- **DOCUMENTED (finding): no village water adaptation.** 0 water-duty assignments across 40 days on the s55 trajectory despite a 16-day 0/0 cistern and a day-12 ranging-dehydration death; rain refilled the cistern. → appended to sim-findings as open.
- **DOCUMENTED (finding): ranging without wild fills.** Violet: 0 fills during the 6-day range; clean rangers likewise fill only at haven. The competent-family `drinkSafe` fills opportunistically only when the tile offers water — whether wild water tiles were on-route is unmeasured (instrument gap: no tile-type tracking on the route). → appended as open.

## Metric review (§14 — mandatory)

1. **The dayPart slot nearly sank the GO on a measurement artifact.** The pre-registered "day-part at death" slot assumed a named day part, but the engine's overnight resolution runs at `dayPart = 4` (past the 0–3 DAY_PARTS) — `advancePart` increments to 4 then calls `endDay`. First sweep: 0/2 fully attributed, missing only slot [1]. Fix was in the INSTRUMENT (map 4 → 'night', the honest reading), not the metric — the slot was right, the mapping was naive. Lesson for future instruments: probe `Game.dayPart` at the real beat in a live run before finalizing slot predicates; fixtures that call `endDay()` directly see a stale mid-day part and won't catch it.
2. **quietLog swallows probe prints — a false "flake" that wasn't.** Two early debug probes printed zero deaths because `console.log` inside `quietLog`'s window is a noop; the deaths had happened (instrument records proved it). Re-runs showed 6/6 determinism. Lesson: inside the quiet window, assert on returned data, never on console.
3. **n=1 independence must be stated, not implied.** The two attributed deaths are the same deterministic seed-55 trajectory under two policies. Coverage 2/2 is real (the instrument attributed both), but separation is n=1 — named suggestive-only per the pre-registered rule, not as a finding of law.
4. **Metrics held otherwise.** Identical seeds, death-aware horizons, A/A byte-identicality at full horizon, pre-registered coverage, REAL RED phases — all honored; the GO is met on the merits.

## Convergence state
**GO — instrument landed.** #290's named next step ("needs a ranging-water instrument before any lever touches it") is delivered: the instrument is committed (scripts + evidence, zero game-code changes), proven 36/36 with REAL RED and full-horizon det-gate, and has already produced its first two fully-attributed deaths plus one suggestive separating factor. The axis's next work: any lever touching ranging water re-runs this instrument; the two new open findings (no water-duty adaptation, no wild fills while ranging) are queued in sim-findings.
