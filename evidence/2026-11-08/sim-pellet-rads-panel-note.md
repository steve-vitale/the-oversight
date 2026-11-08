# Pellet radiation rework — panel run note (P1–P5)

Prereg amendment: `evidence/2026-11-08/sim-pellet-rads-prereg.md` (+ A1 cure
ruling, A1a cure proof). Branch `build-pellet-rads`, base `6680d7924`
(pellet boost + cost, pantry version — landed, NOT shipped). Build
commits: `8dfd46eac` prereg, `c08e83abf` RED tests, `5cc06ebfd` A1,
`da51b5f29` data levers, `79d2bd137` feastBuff cost leg,
`1b9e88cd9` cure hooks + endDay tick, `ae7f0b5cf` boost/Q4 test updates,
`2c13c73c0` panel driver + analyzer, `fc2846157` A1a + §14,
`91751aad1` cure-heuristic fix, `33ecfb134` panel evidence,
`0e2f5276e` neutral proof refresh. [needs-eyes] on the build commits
(combat mechanic).

## What the build is (one paragraph)

Steve's correction (2026-11-08 11:54 CST): the pellet's cost is HEALTH,
not pantry food. Each paid boost adds 2 radiation exposure to the
BEARER (the person, not the pellet); the boost keeps working — power
never cuts off — but at exposure ≥ 10 the bearer sickens Fallout-style
(tier 1: 3 HP/day, tier 2: 5, tier 3: 7, via the existing sickness
engine; scholar tick flat 2 HP/dayPart via the `radiation_sickness`
status). Exposure decays 1/day on non-boost days; a real cure drops it
by 10 (Steve 2026-11-08 13:12 CST: "There must be a cure for the
radiation, not just handing the pellet off"). The pass does not transfer
exposure. The pantry is never touched by a boost. Free floor ×1.25,
Q4 surge marking, and the pass rule are untouched.

## P1 — rigged-bearer panel (RB-2)

Driver `scripts/pellet-boost-panel-20261108.js` (`--panel bearer`),
analyzer `scripts/analyze-pellet-boost-panel-20261108.js`.
8 standard seeds (7, 42, 99, 1234, 555, 777, 2026, 31337), capable
policy, 150d target (all villages ended 82–90d: over-other /
village-lost — the known winnability picture, not this build),
standard competent-panel env. Rig: the scholar is the bearer from
day 0, rich mixed pantry (60×50 + 30×100 + 20×500 = 16,000 kcal).
Results in `evidence/2026-11-08/sim-pellet-rads-panel.jsonl`.

| seed | days | boosts | rads | max/day | maxExp | sick | surge | by |
|------|------|--------|------|---------|--------|------|-------|----|
| 7 | 88 | 0 | 0 | 0 | 0 | no | no | — |
| 42 | 82 | 0 | 0 | 0 | 0 | no | no | — |
| 99 | 89 | 10 | 20 | 8 | 16 | yes | yes | v:gen_pqmcy2n |
| 1234 | 90 | 0 | 0 | 0 | 0 | no | no | — |
| 555 | 90 | 0 | 0 | 0 | 0 | no | no | — |
| 777 | 89 | 4 | 8 | 4 | 8 | no | yes | v:nadia_khoury |
| 2026 | 89 | 3 | 6 | 3 | 6 | no | yes | p |
| 31337 | 90 | 0 | 0 | 0 | 0 | no | no | — |

- **P1a FAIL (3/8, bar ≥4/8).** Same result and same diagnosed root
  cause as the pantry build's PB-2a (also 3/8): the pass (landed,
  Steve-ruled) moves the pellet off the fighting scholar onto the
  hungriest villager on day 1 — on every seed the holder was a
  villager within the first days, and the boost fires only when the
  bearer actually strikes. Not a mechanism defect: the boost fires
  whenever the bearer strikes (17 boosts on 3 seeds), and the
  boost-count pattern matches the pantry panel seed-for-seed
  (0,0,8→10,0,0,4,4→3,0 — the two deltas are the pantry gate
  disappearing: seed 99 gains 2 strikes that would have floored,
  seed 2026 loses 1 to ordinary fight variance). Design question
  for Steve (not a code defect): should the pass prefer a fighter,
  or should the pellet stay with the scholar longer? Unchanged
  from the pantry build's landing recommendation.
- **P1b PASS.** `ledger.rads` equals the sum of observed boost rads
  on all 8 seeds (the driver wraps `pelletBurn` and logs every burn).
- **P1c PASS.** Every paid burn costs exactly `radsPerBoost` (2).
- **P1d PASS.** No burn moves the pantry (pre == post at the burn),
  on all 8 seeds.
- **P1e PASS.** Per-bearer burn rads match per-bearer boost counts
  on all 8 seeds.
- Floors: 0 on all 8 seeds. Expected under the rework: the floor now
  fires only through the `currentMult` guard (a bigger live mult),
  and in the wild the boost applies on every bearer strike (no
  pantry gate). The floor is proven at unit level (RB-1 §3).

## P2 — cost binds (RB-3)

- **(a/b) rigged units PASS** (RB-1 §5–§8): heavy-use rig sickens
  at the threshold tier with damage moving (villager HP falls over
  the episode; scholar −2 HP/dayPart tick); a boosted strike at
  exposure ≥ 40 still returns ×1.5; light-use rig stays clean.
- **(c) panel PASS — the cost binds in the wild.** Seed 99 is the
  whole story: day 43 the villager bearer gen_pqmcy2n boosts 8
  times in ONE day (heavy-use day, bar ≥5) → exposure 16. Days
  44–51 the bearer is observed sick with radiation sickness
  (health 88–93, damage moving, tended); exposure decays 16 → 8
  at 1/day and the record clears by expiry. Light-use days show
  neither sickness nor threshold exposure (777: max 8, 2026: max 6,
  both clean).
- **(d) Cure observation (recorded, not a bar — A1): NO CURE FIRED
  IN THE WILD on this panel — flagged finding.** Corrected
  0/8 seeds show a genuine cure (an exposure drop > the 1/day
  decay across same-holder days). The first analyzer run flagged
  seed 99, but that was a HEURISTIC BUG, not a cure: the
  exposure series compared across the day-53 holder change, where
  the key swaps ('p' vs a villager id) and reads 8 → 0. Fixed in
  `91751aad1` (same-holder guard in driver + analyzer); the
  re-run reads 0/8. The seed-99 sickness cleared by decay +
  daysLeft expiry, not by a cure. The ability-cure channels are
  proven at unit level (§9 duty ability, §10 scholar treatDisease,
  §14 treatVillager — 63/63), but on these 8 seeds no bearer who
  sickened ever met a medic holding a healing ability in the wild.
  This is the A1-flagged finding, not hidden: if bearers sicken
  with no cure ever firing, the cure's reach in the wild needs a
  decision (roster-medic coverage is 4/8 seeds per medicduty).
  The medicine half is verified closed (A1a): no medicine in the
  game can cure radiation; a RadAway-style item is a Steve content
  decision.

## P3 — Q4 (RB-4)

**PASS.** `feastSurgeUsed` marks on 3/8 seeds via a paid reactor
boost (777 v:nadia_khoury, 2026 p, 99 v:gen_pqmcy2n). Same 3 seeds
as the pantry build. The isolated unit tests are the rigorous Q4
proof (19/19); the panel is corroboration.

## P4 — pass untouched (RB-5)

- **Panel comparison: 5/8 exact, 3 diffs.** Pass days (holder-change
  days in the daily series), old pantry panel vs this panel:
  7:[17]=[17], 42:[32,63]=[32,63], 1234:[33]=[33], 555:[84]=[84],
  31337:[38,74]=[38,74] — identical. Diffs: 99 old [35,73] new
  [35,53]; 777 old [36,76,82] new [36]; 2026 old [78] new [80].
  Diagnosis, not a pass change: `git diff 6680d7924..HEAD` shows
  ZERO lines in progression.js (and table/ladder/app/overtime/
  abilityActions/foodPower/calories) — the pass code is
  byte-identical. The diffs are second-order state divergence:
  radiation sickness changes the hunger state the pass reads
  (seed 99: the bearer sickens days 44–51, the pass fires day 53
  instead of 73), and any code change shifts the RNG stream, so
  later pass days drift. The panel comparison conflates "pass rule
  identical" with "whole-simulation RNG alignment", which no code
  change can guarantee.
- **Controlled driver: PASS 24/24.** Re-ran
  `scripts/panel-pellet-pass-20261107.js` (8 seeds × armed-hungry /
  baseline-hungry / armed-fed) into
  `evidence/2026-11-08/sim-pellet-rads-pass.jsonl`, diffed against
  `evidence/2026-11-07/sim-pelletpass-panel.jsonl`: **passDay
  24/24 identical, holder 24/24 identical**, feast/surge identical
  on all 24. The pass rule is behavior-identical. Seat reads differ
  on 14/24 rows — the KNOWN legs 2–3 base drift, identical in
  pattern to the pantry build's own re-run (armed: 'full' → 'lesser'
  on 6 seeds, 'none' on 99767/7; baseline: 'none' → 'lesser' on 6):
  the seat rules changed under the constructed shape, and this
  build touches no seat/table/ladder code. The analyzer's NO-GO on
  the controlled panel is that pre-existing drifted seat bar, not a
  rework effect.
- **P4 verdict: PASS on the controlled instrument; panel diffs
  diagnosed as second-order.** The prereg's panel-comparison bar
  reads 5/8; the substance (pass behavior-identical) is proven
  24/24.

## P5 + RB-7 — balanced panel before/after + neutral proof refresh

- Before-side: retained pellet-boost neutral panel
  (`evidence/2026-11-08/neutral-pellet-boost-20261108.json.gz`,
  seed 7 × 4 policies × 150d — the master state, since the gate-log
  commit after it touches no manifest input).
- After-side: `node scripts/balance-panel.js --out
  /tmp/neutral-pellet-rads --seeds 7 --policies
  capable,risk-aware,socialite,winseek --days 150`, panel copied to
  `evidence/2026-11-08/neutral-pellet-rads-20261108.json.gz`.
- **P5 PASS. Pooled deaths/day 0.663 → 0.714, a 7.7% RISE (bar: drop
  ≤15%).** Per policy: capable 0.489→0.693, risk-aware 0.728→0.629,
  socialite 0.600→0.711, winseek 0.914→0.914. No win movement
  (capable 1→1, others 0); national 0 both sides; table 1 all.
  The rise is the cost working as designed (bearers sicken and
  sometimes die — capable deaths up), not a buff; it stays well
  inside the difficulty frame (deaths rising slightly because a new
  cost bites is expected).
- **RB-7 refresh: PASS** (`0e2f5276e`, own commit). Proof tests:
  measurement-proof-update 9/9, measurement-workflow 9/9.
  Neutrality 4/4, 0 warnings.

## Other bars

- RB-1 (unit): PASS — `test-pellet-rads-20261108.js` 63/63,
  `test-pellet-boost-20261108.js` 39/39,
  `test-pellet-q4-20261108.js` 19/19 (RED first for the rads file,
  then green; the test-side fixes were the daysLeft 2/day tend
  behavior and the `nm` third argument on the duty cure attempt).
- RB-8 (wired/ontology/offline): PASS — `check-wired.js` on
  feastBuff.js (28 functions, 0 unwired, incl. the 4 new pellet
  functions) + game.js (17 unwired, all pre-existing, none pellet/
  radiation) + statusEffects.js (0 unwired);
  `validate-ontology.js` 135 systems, "Ontology matches code.
  Release permitted." Offline assets regenerated — output
  byte-identical (no new data file, only content edits to two
  existing JSONs), nothing to commit.
- RB-9 (scope): PASS — the branch touches `src/js` only in
  feastBuff.js + game.js + statusEffects.js, `src/data` only in
  pellet-boost.json + statusEffects.json, and none of
  progression.js / table.js / ladder.js / app.js / overtime.js /
  abilityActions.js / foodPower.js / engine/calories.js. (The
  `sw.js` +1 from the pantry build does not recur: no new asset.)

## Observations (not bars)

1. **Respawn-exposure corner (seed 99, day 53+).** Exposure is keyed
   by fighter key ('p' for the scholar, villager id for villagers),
   and the daily holder-exposure read follows the holder's key. When
   the pellet passes to the scholar, the scholar's exposure reads
   from the 'p' entry (0) while the same person's villager-keyed
   exposure lives on separately (gen_pqmcy2n: 20 rads on the
   villager key; ledger exact, per-bearer accounting exact). The
   daily series therefore understates the scholar's true dose after
   a pass-to-scholar, and a scholar respawning as a previously
   exposed villager starts at 0 in the 'p' entry. No sickness was
   observed after day 53 and no death is attributable; the burns
   and ledger are the ground truth and they match. Design corner
   for the next decision (should exposure follow the person across
   respawn/pass?), not a landing blocker — the prereg keys exposure
   by bearer key by design.
2. **Cure heuristic bug, fixed.** The first cure-observation run
   read a holder change as a cure (see P2(d)). Fixed with a
   same-holder guard (`91751aad1`); the corrected reading is 0/8.

## Verdicts (per bar)

| bar | verdict |
|-----|---------|
| RB-1 unit | PASS (63/63 + 39/39 + 19/19) |
| RB-2 panel P1 | P1a FAIL 3/8 (diagnosed: pass hands pellet to non-fighters); P1b–e PASS all seeds |
| RB-3 cost binds P2 | PASS (heavy-use day + sickness in the wild on seed 99; units PASS) |
| RB-4 Q4 live P3 | PASS (3/8 marked) |
| RB-5 pass P4 | PASS on controlled instrument 24/24; panel comparison 5/8 with 3 diagnosed second-order diffs |
| RB-6 no-regress P5 | PASS (deaths/day +7.7%, rise not drop) |
| RB-7 proof refresh | PASS (9/9 + 9/9, neutrality 4/4) |
| RB-8 wired/ontology/offline | PASS |
| RB-9 scope | PASS |

## Landing recommendation

Land the build. P1a is the same diagnosed pass property the
pantry build landed with (3/8, mechanism proven, design question
to Steve unchanged). The P4 panel diffs are second-order state
divergence with the pass rule proven identical 24/24. Everything
else passes; the cost binds in the wild on seed 99 (heavy-use day
→ sickness → decay); the cure is proven at unit level on all three
choke points. Two design questions ride to Steve with the landing:
(1) the pass hands the pellet to the hungriest villager, who
usually doesn't fight, so the boost fires on only 3/8 villages —
should the pass prefer a fighter? (2) no cure fired in the wild on
this panel — is the ability-cure reach in the wild (roster-medic
coverage) acceptable, or does the cure need a wider shape (e.g. a
radiation medicine item)? Neither blocks landing; both are
follow-up calls. The pantry-cost version never goes live: this
rework replaces it on the branch before the ship.
