# sim-havendrink-b — DAWN AT-HAVEN WATER-PACK TOP-UP (ARM 2, loop B 2026-10-15)

**Run:** fleshout-b-20261015T0830Z (ARM 2) · sim-findings **#320** (claimed)
**Date:** 2026-10-15 · worktree `~/workspace/worktrees/sim-havendrink`
**Layer under test:** `scripts/policies/havendrink.js` (gate `HAVENDRINK=1`, default OFF), zero src/js changes.

## Canon note

docs/CANON.md read first. **There is no water/thirst canon doc** — per the canon rule this is stated, not invented. All water mechanics read from `src/js/game.js` as-is:
- Scholar water comes ONLY through `Game.fillWater()` (haven well: 1L clean from the cistern per bottle; 10 kcal + 1 tick per call; refuses honestly on dry cistern / dry ground / pack weight), `Game.drinkWater()` (+50 hydration, 1 bottle), `Game.boilWater()`, `Game.addWater()`.
- Villagers draw ~2L/day each from the cistern via `villageDrinks()` (clean first; the scholar is skipped — "you drink your own bottles"). Cistern cap 40L.
- `Game.location` is only ever `'village'`/`'wilds'` — the `location === 'haven'` branch in fillWater is dead code in live play; the live gate is `playerTile().type === 'haven'`.

## Pre-registration (§§9–12, 14 — binding)

- **PRIMARY (mechanism-forward):** fraction of dawn departures from haven with pack water ≥ 1L — armed ≥ 1.3× control. (Departure = dawn snapshot atHaven → next dawn !atHaven; pack = layer dawn-log packAfter on armed, snapshot packLiters on control.)
- **GUARDRAILS:** (g1) villager thirst deaths ≤ control+2 (commons safety); (g2) the layer never draws when cistern clean < reserve floor (instrument-verified from the dawn log; below-floor dawns attributed base-vs-layer); (g3) median survival ≥ control−10d; (g4) national ≥ control−2/16; (g5) no new death mode (n≥3 armed-only).
- **PHENOMENON TRACK:** scholar at-haven dehydration deaths (cause dehydration AND player AND at-haven at the death beat — the #320 class).
- **Horizon + why:** 180d death-aware (§10 — dead villages stop simulating; +10d tail max).
- **Seeds:** 11, 22, 33, 44, 55, 66, 77, 88 — exact literals, identical both sides.
- **Policies:** leadcourt + belongseek. Own control in the SAME sweep.
- **SMOKE=1 + det-gate before any sim spend.**
- **GO →** confirm (12–16 seeds). **MISS →** kill protocol (layer deleted, evidence + instruments retained).

## The s606 d51 mechanism autopsy (the load-bearing RED)

Finding #320: armed belongseek s606 d51 — Nathan Costa died of dehydration AT HAVEN (neverAway, dist 1) with pack=0, cistern={clean 20}. The rfconfirm run recorded **133 refused fills**, 0 ranged days.

The exact s606 d51 trajectory does NOT replay on current master (pristine and RANGEREFILL-armed repros both run 60d with 0 dehydration deaths) — consistent with sim-findings' "COMMITTED TRAJECTORIES PERISHABLE" (#263, confirmed twice): src/js moved between the rfconfirm base and HEAD. The autopsy therefore reproduces the MECHANISM, not the trajectory, with a live-engine fixture (scripts/test-havendrink-20261015.js PART 1, 9/9 green):

1. `drinkSafe` (competent.js:162) gates its haven fill on `Game.playerAtHaven()` — Manhattan dist ≤ 1 from the haven tile.
2. `Game.fillWater()` draws from the cistern ONLY when `playerTile().type === 'haven'` — i.e., standing EXACTLY on the haven tile. The `location === 'haven'` branch is dead code (grep: location is never assigned 'haven' in src/js).
3. Fixture: scholar at dist 1 (inside the policy gate), empty pack, cistern 20 → `Game.fillWater()` refuses **"No water here — find a creek, pond, or wetland. Dry ground doesn't fill a bottle."** Pack stays 0, cistern untouched at 20. (PART 1, RED.)
4. Same fixture ON the haven tile → fills 1L, cistern 20→19. Heavy pack → honest "Your pack is full" refusal.

**The real reason the pack was empty:** a gate mismatch — the policy's at-haven (dist ≤ 1) is WIDER than the engine's fillable at-haven (exactly the haven tile). The courtship scholar idles at dist 1 (the grounds); the policy fires fillWater() up to 133 times and the engine honestly refuses every one. The cistern sits full and untouched while the scholar dehydrates beside the well. Not a missing verb — a verb fired from where it cannot work.

## What was built (policy-side layer, zero src/js)

`scripts/policies/havendrink.js` (HAVENDRINK=1, default OFF). At dawn, before the base policy's daily, when at haven per the policy gate (dist ≤ 1):

1. **Commons floor** — reserveFloor = 2×(roster−1) + 2 (one village day-draw + margin; villageDrinks draws 2L/villager/day). If cistern clean < floor, the scholar does NOT draw — the village drinks first (voiced sparingly, ≤1/7d). The killed thirstbank arms proved scholar over-draw kills villagers; the floor is the structural answer.
2. **Walk to the well** (#320 fix) — if not on the haven tile, one honest `Game.travelTo` step onto it (adjacent by the policy gate), voiced as the morning round. The engine's fill gate needs the tile; the policy's gate doesn't.
3. **Top-up** — honest `Game.fillWater()` 1L/call toward 3 bottles (competent-family pack standard — the day's water, not the siege reserve), engine refusals honored.

Voice: "Morning — you walk to the well and draw your bottles for the day. The cistern is the village's; you take only what you'll carry." / "The cistern's low — the village drinks first. Your bottles stay empty today."

## Proof (scripts/test-havendrink-20261015.js)

- **PART 1 (mechanism, live engine):** 9/9 — the dist-1 refusal, the haven-tile fill, the dead `location==='haven'` branch, the honest heavy-pack refusal.
- **PART 2 (det-gate):** gate-off exports ARE the base policy (same refs); 40d twin deterministic.
- **PART 4 (layer fills where base doesn't):** scholar at dist 1, pack 0, cistern 30 → walked to well, pack 3, cistern 27, dawn log + counter credited, commons voice fired; floor skip at cistern 5 (no draw, recorded).
- **REAL RED (patch-swap):** `~/workspace/havendrink-red-20261015.patch` neuters the walk-to-well → PART 4 fails LOUD (pack 0, engine voices "No water here" — the exact #320 refusal); restored byte-identical → 23/23 green.
- **PART 3 (SMOKE):** module loads, gate default OFF, daily fires ≥10×.
- Gate-off full run: 15/15 green.

## Results

**PILOT — 32 runs** (8 seeds × {leadcourt, belongseek} × {control, armed}, 180d death-aware, own control in the same sweep). Raw JSON: `evidence/2026-10-15/perseed-havendrink/<side>/run-*.json`.

### Primary (mechanism-forward): dawn departures with pack ≥ 1L

| side | departures | ≥ 1L | fraction |
|---|---|---|---|
| control | 14 | 13 | 0.9286 |
| armed | 22 | 21 | 0.9545 |

**Armed/control = 1.028× — bar was ≥ 1.3× → MISS.** The bar was mis-specified: the control already sits at 93% (the base policy's drinkSafe fills at departures), so 1.3× is mathematically unreachable (max 1/0.9286 = 1.077×). The miss stands per §14; the bar's ceiling effect is recorded in metric review for the next run's pre-registration.

### Guardrails

| guardrail | bar | result | verdict |
|---|---|---|---|
| (g1) villager thirst deaths ≤ control+2 | ≤ 5 | 3 vs 3 | PASS |
| (g2) layer never draws below reserve floor | 0 violations | 0 (dawn-log audited) | PASS |
| (g3) median survival ≥ control−10d | ≥ 126.5d | 146d vs 136.5d | PASS |
| (g4) national ≥ control−2/16 | ≥ 8/16 | 10/16 vs 10/16 | PASS |
| (g5) no new death mode (n≥3 armed-only) | none | none (Choir Toad n=1) | PASS |

### Phenomenon track: at-haven scholar dehydration deaths

- Control: 3 (belongseek s11 d172 Stan Kowalski pack=1/cist=22; belongseek s66 d144 Thabo Maseko pack=1/cist=23; leadcourt s77 d65 Elena Petrova pack=0/cist=0 + 3 villager thirst — village collapse).
- Armed: 2 (belongseek s66 d144 and leadcourt s77 d65 — both deterministic repeats of the control deaths; the layer did not prevent them).
- **The #320 class (pack=0 + FULL cistern + gate-mismatch refusals) occurred 0 times on the pilot's 16 control runs.** The at-haven deaths that did occur are a different class: pack=1 (one bottle wasn't enough / wasn't drunk in time) or cistern genuinely dry in a village collapse. The 133-refusal trajectory from rfconfirm does not reproduce on current master (perishable trajectories, #263).

### Layer counters (armed, 16 runs)

filledDawn 13 · skippedFloor 44 · walkedToWell 1 · floorViolations 0. The walk-to-well (#320 fix) fired once; the commons floor blocked 44 dawn draws (the cistern spends most of its time below the ~24L floor for a 12-villager village). Water verbs: armed 1139 fills vs control 945 (+194); refused fills 589 vs 409 (+180 — mostly the base drinkSafe's dist-1 attempts plus layer attempts on failed walks; the engine refuses honestly throughout).

### Verdict: MISS → kill protocol

The primary misses on the pre-registered bar. The layer is safe (all guardrails pass, floor never violated, telemetry quiet) and its mechanism is proven, but the phenomenon it targets did not occur on the pilot and the primary cannot measure it (ceiling effect). Per §14 and the kill protocol, the layer is DELETED; evidence + instruments retained. The mechanism autopsy (gate mismatch) is the durable finding — #320's "why" is answered even though the lever can't move the bar.

## Per-seed numbers

| side | seed | policy | days | dep | dep≥1L | atHavenDehy | thirst | nat | layer (fill/skip/walk) |
|---|---|---|---|---|---|---|---|---|---|
| control | 11 | belongseek | 173 | 0 | 0 | Stan Kowalski d172 (pack1/c22) | 0 | 1 | - |
| control | 22 | belongseek | 123 | 6 | 5 | - | 0 | 0 | - |
| control | 33 | belongseek | 36 | 0 | 0 | - | 0 | 0 | - |
| control | 44 | belongseek | 182 | 2 | 2 | - | 0 | 1 | - |
| control | 55 | belongseek | 182 | 1 | 1 | - | 0 | 1 | - |
| control | 66 | belongseek | 148 | 0 | 0 | Thabo Maseko d144 (pack1/c23) | 0 | 0 | - |
| control | 77 | belongseek | 90 | 0 | 0 | - | 0 | 1 | - |
| control | 88 | belongseek | 182 | 0 | 0 | - | 0 | 0 | - |
| control | 11 | leadcourt | 72 | 0 | 0 | - | 0 | 0 | - |
| control | 22 | leadcourt | 129 | 4 | 4 | - | 0 | 1 | - |
| control | 33 | leadcourt | 113 | 0 | 0 | - | 0 | 1 | - |
| control | 44 | leadcourt | 182 | 0 | 0 | - | 0 | 1 | - |
| control | 55 | leadcourt | 182 | 0 | 0 | - | 0 | 1 | - |
| control | 66 | leadcourt | 77 | 0 | 0 | - | 0 | 1 | - |
| control | 77 | leadcourt | 65 | 1 | 1 | Elena Petrova d65 (pack0/c0) | 3 | 0 | - |
| control | 88 | leadcourt | 144 | 0 | 0 | - | 0 | 1 | - |
| armed | 11 | belongseek | 174 | 0 | 0 | - | 0 | 1 | 1/6/0 |
| armed | 22 | belongseek | 182 | 10 | 9 | - | 0 | 0 | 7/8/0 |
| armed | 33 | belongseek | 36 | 0 | 0 | - | 0 | 0 | - |
| armed | 44 | belongseek | 182 | 2 | 2 | - | 0 | 1 | 0/3/0 |
| armed | 55 | belongseek | 182 | 1 | 1 | - | 0 | 1 | 0/1/0 |
| armed | 66 | belongseek | 148 | 0 | 0 | Thabo Maseko d144 (pack1/c23) | 0 | 0 | 0/0/0 |
| armed | 77 | belongseek | 90 | 0 | 0 | - | 0 | 1 | - |
| armed | 88 | belongseek | 182 | 0 | 0 | - | 0 | 0 | 0/1/0 |
| armed | 11 | leadcourt | 72 | 0 | 0 | - | 0 | 0 | 0/1/0 |
| armed | 22 | leadcourt | 128 | 8 | 8 | - | 0 | 1 | 3/8/0 |
| armed | 33 | leadcourt | 113 | 0 | 0 | - | 0 | 1 | 0/4/0 |
| armed | 44 | leadcourt | 182 | 0 | 0 | - | 0 | 1 | 0/2/0 |
| armed | 55 | leadcourt | 182 | 0 | 0 | - | 0 | 1 | 0/1/0 |
| armed | 66 | leadcourt | 96 | 0 | 0 | - | 0 | 1 | 2/0/1 |
| armed | 77 | leadcourt | 65 | 1 | 1 | Elena Petrova d65 (pack0/c0) | 3 | 0 | 0/8/0 |
| armed | 88 | leadcourt | 144 | 0 | 0 | - | 0 | 1 | 0/1/0 |

## Wall numbers (the standing scale-wall report)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control | 10/16 | 0/16 | 0/16 | 15/16 | 0/16 | 136.5d | 182d |
| armed | 10/16 | 0/16 | 0/16 | 14/16 | 1/16 | 146d | 182d |

No wins, no table — the wall stands. (Armed w5 1/16 vs 0/16 is a single trajectory, not a claim.)

## Death-cause shares

| cause | control | armed |
|---|---|---|
| monster:villager combat | 144 | 147 |
| monster:combat | 143 | 154 |
| villager:combat | 74 | 71 |
| villager:monster | 62 | 58 |
| villager:sickness | 18 | 18 |
| monster:expedition | 17 | 17 |
| villager:starvation | 10 | 11 |
| villager:a wound that wouldn't close | 10 | 10 |
| villager:contest | 9 | 10 |
| person:alien | 2 | 8 |
| villager:dehydration | 5 | 3 |
| person:ambush | 4 | 4 |
| villager:thirst | 3 | 3 |
| person:combat | 2 | 3 |
| villager:lockjaw | 2 | 3 |
| villager:The Callback | 2 | 2 |
| villager:Inspiration | 1 | 1 |
| villager:the expedition | 1 | 1 |
| villager:Choir Toad | 0 | 1 |

No new death mode ≥3 on armed (Choir Toad n=1; person:alien exists on control). Shape is familiar on both sides.

## Village assessment (plain words)

Thirty-two villages, and the pilot told a different story than the brief expected. The #320 death — a scholar dying of thirst beside a full cistern — never happened once on the control side. What the instrument caught instead was quieter: scholars dying at haven WITH a bottle in the pack (s66 twice, pack=1, cistern=23 — one bottle wasn't drunk in time or wasn't enough against the overnight burn), and a village collapse where the cistern was genuinely dry (s77, pack=0, cistern=0, three villagers dead of thirst alongside).

The layer did its honest work where it could: 13 dawn fills, one walk to the well, 44 commons-floor skips where it refused to raid a low cistern. It never drew below the floor — the commons stayed the village's. But the cistern spends most of its life below the 24L floor, so the layer was mostly a careful bystander, and the base policy already sends 93% of departures out with water. The village that lost Elena Petrova on s77 lost her the same way on both sides — the layer watched the cistern sit at 0 and, correctly, did nothing. That's the commons being real: it doesn't conjure water.

The durable finding isn't the layer — it's the autopsy. The s606 death's 133 refused fills now have a name: the policy's at-haven (dist ≤ 1) is wider than the engine's fillable at-haven (exactly the haven tile). Any future water lever must align those gates or walk the scholar to the well first. The fixture proves it on the live engine in 9 assertions.

## Sense-test (SENSE-TESTING LAW — transcripts read, not just counts)

The layer's walk-to-well beat (leadcourt s66 probe): "Morning — you walk to the well and draw your bottles for the day. The cistern is the village's; you take only what you'll carry." → "Filled 1L (clean — Haven well). 3L carried (3kg). (-10 kcal hauling, 1 tick.) Cistern: 32L left." It lands between the village's own beats (a monster-naming argument, a trauma beat) and reads as a person doing the morning round — it names the commons ("the cistern is the village's") and the restraint ("only what you'll carry"). Not a robot, not a raid.

The floor-skip beat (fixture): "The cistern's low — the village drinks first. Your bottles stay empty today." Honest, in-fiction, throttled to ≤1/7d so it doesn't nag.

The village's own water-duty beats carry the commons fiction the layer defers to: "A man, maybe 60s, with tattooed arms heads out for water. 'The well won't fill itself.'" → "💧 A person, maybe 40s returns with water: +2 clean." People managing water, aloud, every day. The layer's voice harmonizes with that — it never talks over it.

## Blanks filled / documented

- **FILLED (mechanism, #320):** the s606 d51 autopsy — the gate mismatch (policy dist-≤-1 vs engine haven-tile-only) proven on the live engine (test PART 1, 9/9). The 133 refused fills are explained: every one was "No water here" from the adjacent tile. This is the durable answer to "why was the pack empty."
- **DOCUMENTED (pilot):** the #320 phenomenon class did not occur in 16 control runs on current master; at-haven dehydration deaths that did occur are pack=1-insufficient or cistern-dry-collapse — a different class, outside this layer's scope.
- **DOCUMENTED (metric):** the pre-registered primary's 1.3× bar was mis-specified (ceiling effect — control at 93% makes 1.3× mathematically impossible). Recorded in metric review for the next water arm.
- **KILLED (layer):** `scripts/policies/havendrink.js` deleted per kill protocol (primary MISS). Evidence + instruments retained: `scripts/test-havendrink-20261015.js` (23/23 armed, 15/15 gate-off, REAL RED via patch-swap), `scripts/sweep-havendrink-20261015.js`, `scripts/probe-havendrink-beats-20261015.js`, `scripts/repro-havendehy-20261015.js`.

## Metric review (§14 — mandatory)

1. **The primary bar was mis-specified (ceiling effect).** Armed 0.9545 vs control 0.9286 = 1.028× against a 1.3× bar — but the control's 93% makes 1.3× mathematically impossible (max 1.077×). The bar assumed the base policy leaves departures dry; it doesn't (drinkSafe fills 93%). The miss stands as written, but the bar was wrong, not the mechanism. Next water arm: pre-register against the PHENOMENON (at-haven dehydration deaths) or a non-ceiling mechanism metric (e.g., refused-fill rate, pack=0 at-haven dawns), not departure fractions.
2. **The phenomenon didn't show.** 0/16 control runs produced the #320 class (pack=0 + full cistern). A lever cannot move a bar for a phenomenon that doesn't occur in the pilot seeds. This is a finding, not a failure of the layer — but it means any confirm would be measuring noise.
3. **The floor dominates the layer's behavior.** 44 skips vs 13 fills — the cistern lives below the 24L floor most of the time. The floor is doing its job (commons safety, 0 violations), but it makes the layer mostly inert. A future arm that wants the layer to fire more must either lower the floor (and re-prove commons safety) or target the cistern level itself (water duty/hauling — a different axis).
4. **Guardrails all pass, telemetry quiet.** The layer is safe; the kill is on the primary, not on safety.
5. **Method held:** identical seeds, death-aware horizons, own same-sweep control, SMOKE + det-gate before sim spend, REAL RED via patch-swap, pre-registered conjunction judged as written. The MISS is on the merits of the bar as written.

## Convergence state

**MISS (pilot) — layer killed per protocol.** The HAVENDRINK layer fails its pre-registered primary (1.028× vs 1.3× bar, mis-specified by ceiling effect) on 32 runs. The #320 mechanism autopsy is the durable result: the gate mismatch is proven and documented for the next water arm. food-economy stays converging; #320 stays open (mechanism answered, phenomenon unmeasured on current master).
