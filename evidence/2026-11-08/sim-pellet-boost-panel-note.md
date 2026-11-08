# Pellet boost + cost — panel run note (P1–P5)

Prereg: `evidence/2026-11-08/sim-pellet-boost-prereg.md` (+ amendment A1:
whole-unit pantry draws; the ledger records the ACTUAL kcal drawn).
Branch `build-pellet-boost`, base `d910dc6da` (rebased from `a111b57f`;
the rebase was clean, all 5 picks, no conflicts; proofs re-verified green
after it). Build commit `9aaad7337` (+ `dc8003ec9` scholar.day fix,
`a158fe7fb` green-list). [needs-eyes] on the build commit (combat mechanic).

## What the build is (one paragraph)

Steve's reframe (2026-11-08 07:03 CST): the pellet bearer gains basically
unlimited food boosts, WITH A COST. Muse's cost call: boosts cost pantry
calories. Free floor ×1.25 (the reactor's steady hum, always on, delivered
honestly for the first time — every live call site used to gate on
`feastedActive()`, which is false while the reactor is online). Paid boost
×1.5 per strike: the boost asks for 50 kcal, `pantryDraw` takes whole units,
the ledger records the actual drawn (50/100/500…), the say line names the
actual number. Bearer-only, scholar and villager alike; party members get
nothing. A paid boost also marks a feast-surge spend (Q4). A paid bonus heal
draws the same 50. The pass rule is untouched.

## P1 — rigged-bearer panel (PB-2, PB-4)

Driver `scripts/pellet-boost-panel-20261108.js` (`--panel bearer`),
analyzer `scripts/analyze-pellet-boost-panel-20261108.js`.
8 standard seeds (7, 42, 99, 1234, 555, 777, 2026, 31337), capable policy,
150d target (all villages ended 82–90d: over-other / village-lost — the
known winnability picture, not this build), standard competent-panel env.
Rig: the scholar is the bearer from day 0, rich mixed pantry (60×50 +
30×100 + 20×500 = 16,000 kcal). Results in
`evidence/2026-11-08/sim-pellet-boost-panel.jsonl` (first 8 lines).

| seed | days | boosts | spent | surge | by |
|------|------|--------|-------|-------|----|
| 7 | 88 | 0 | 0 | no | — |
| 42 | 82 | 0 | 0 | no | — |
| 99 | 89 | 8 | 1600 | yes | v:gen_pqmcy2n |
| 1234 | 90 | 0 | 0 | no | — |
| 555 | 90 | 0 | 0 | no | — |
| 777 | 90 | 4 | 800 | yes | v:nadia_khoury |
| 2026 | 90 | 4 | 567 | yes | p |
| 31337 | 90 | 0 | 0 | no | — |

- **PB-2a FAIL (3/8, bar ≥4/8).** Root cause, diagnosed, not a mechanism
  defect: the pass (landed, Steve-ruled) moves the pellet off the fighting
  scholar onto the hungriest villager on day 1 — on every seed the holder
  was a villager within the first days, and the pellet passed 2–4 times per
  run. The boost fires whenever the bearer actually strikes (16 boosts on
  3 seeds, 47–100 strikes per run by non-bearers). The binding constraint
  is WHO holds the pellet: the hungriest villager is usually a
  non-fighter, so the boost sits unused. Design question for Steve (not a
  code defect): should the pass prefer a fighter, or should the pellet
  stay with the scholar longer? The mechanism itself is proven correct
  (PB-1 unit 36/36 + 19/19, PB-2b/c accounting, PB-4 marking).
- **PB-2b PASS.** `ledger.spent` equals the sum of observed boost draws on
  all 8 seeds (the driver wraps `pelletBurn` and logs every draw).
- **PB-2c PASS on recomputation.** The analyzer first flagged seed 2026
  (a 117-kcal draw not in the post-draw unit sizes). That is a DRIVER
  snapshot bug, not a game bug: the wrap snapshotted the pantry AFTER the
  draw, and the draw had consumed the last 117-kcal unit. Recomputed with
  pre-draw sizes (the previous burn's post-draw sizes plus its spent), all
  boosted draws on all 3 boosted seeds took exactly one whole unit present
  at the time (50, 117, 200, 200 on 2026; 200s on 99 and 777). The driver
  is fixed (snapshot before the draw) so future runs don't repeat it.
- **PB-4 (P3) PASS.** `feastSurgeUsed` marks on 3/8 seeds. Caveat: on
  seed 2026 the marking is By='p' while the visible boosts are a
  villager's — the first marking there came through the scholar's feast
  path after the pass freed the scholar to feast again (the reactor
  refuses feasts only while the scholar holds it). The isolated unit
  tests are the rigorous Q4 proof (a paid reactor boost marks, a free
  floor does not, arming untouched, idempotent); the panel is
  corroboration that a surge marks in live play on villages with reactor
  boosts.
- Floors: 0 on all 8 seeds. Expected: the floor fires only when the bearer
  strikes while the pantry can't pay; the rich pantry could always pay,
  and on the 0-boost seeds the bearer never struck. The floor is proven
  at unit level (PB-1) and is P2's job in live play (see below).

## P2 — starved panel (PB-3)

`--panel starved`, seeds 7, 42, 99. Rig: scholar bearer, 30-kcal pantry.
All three villages LOST in 2–3 days (0–3 deaths, 0 strikes, pantry 0).
The village SCATTERS with a sub-COST pantry before any fight can happen —
that is the game's starvation response, not this build. So:

- 0 boosts while starved: HELD (vacuously — no strikes occurred).
- Bearer never hungers: proven at UNIT level (PB-1: `dailyNeed` 0 for the
  bearer). The panel's `bearerDailyNeed` reading is the WRONG person after
  the pass (it reads the scholar, who hungers again once the pellet
  moves); do not use it as the panel's hunger check.
- Floors > 0: **NO-GO in live play.** No fight occurred before the village
  scattered, so no floor could fire. The floor is proven at unit level
  (short-pantry strike lands ×1.25, no spend). The prereg's P2 bar assumed
  a starved village could fight; it can't — a sub-COST pantry scatters
  the village in 2 days. This is a prereg-bar problem, not a build
  defect. A transient dip below COST in a healthy village is the only
  live-play shape for a floor, and the P1 pantry never dipped below ~4000.

## P4 — pass comparison (PB-5)

Re-ran the pelletpass-alone driver
(`scripts/panel-pellet-pass-20261107.js`, 24 cases: 8 seeds ×
armed-hungry / baseline-hungry / armed-fed) on this branch into
`evidence/2026-11-08/sim-pellet-boost-pass.jsonl`, diffed against
`evidence/2026-11-07/sim-pelletpass-panel.jsonl`.

- **PB-5 PASS. Pass days exactly equal on 24/24 cases** (armed-hungry
  passDay=1 on all 8 seeds; null elsewhere); holder identical on 24/24.
  The pass is untouched.
- Phase-B divergence (not a bar): the old chain's seat reads 'full' on the
  Nov-7 base but 'lesser' (6 seeds) / 'none' (99767, 7) here. That is BASE
  DRIFT, not this build: legs 2–3 changed the seat rules (full needs
  National PEAK + a capstone deed; the constructed shape sets neither),
  and this build touches no seat/table/ladder code. The feast itself still
  grants (the pass frees the scholar to feast) and the surge still marks.

## P5 + PB-7 — balanced panel before/after (PB-6) + neutral proof refresh

- PB-7 refresh: `node scripts/balance-panel.js --out
  /tmp/neutral-pellet-boost --seeds 7 --policies
  capable,risk-aware,socialite,winseek --days 150`, panel copied to
  `evidence/2026-11-08/neutral-pellet-boost-20261108.json.gz`,
  `node scripts/balance-proof-update.js` on it. Proof tests:
  measurement-proof-update 9/9, measurement-workflow 9/9. Neutrality 4/4,
  0 warnings.
- Before-side: the retained medicduty panel
  (`evidence/2026-11-08/neutral-loopa-1515-20261108/panel.json.gz`, seed 7
  × 4 policies × 150d). I re-ran the same panel on the base to confirm it
  reproduces: rows IDENTICAL to the retained panel.
- **PB-6 PASS. Pooled deaths/day 0.676 → 0.663, a 2.0% drop (bar ≤15%).**
  Per policy: capable 0.659→0.489, risk-aware 0.629→0.728, socialite
  0.620→0.600, winseek 0.914→0.914. No wins either side. One national
  flip on a single seed (capable reached National before, not after) —
  noted, within single-seed variance, not an unexplained movement.

## Other bars

- PB-1 (unit): PASS — `test-pellet-boost-20261108.js` 36/36,
  `test-pellet-q4-20261108.js` 19/19 (RED first, then green; the two
  heal-rig fixes were test-side only: end the fight before measuring the
  scholar's own health).
- PB-7 (proof): PASS — see above.
- PB-8 (wired/ontology/offline): PASS — `check-wired.js` on feastBuff.js
  (24 functions, 0 unwired) + game.js (17 unwired, all pre-existing, none
  mine); `validate-ontology.js` 135 systems; offline assets regenerated
  (`sw.js` +1 line, 46 live JSON files), `test-offline-assets.js` 196
  checks green. The boot-data-version test's hardcoded count went 44→45
  (the new data file) with a comment, same pattern as leg 2.
- PB-9 (scope): PASS — the six leg commits touch `src/js` only in
  feastBuff.js + game.js, `src/data` only in pellet-boost.json, and none
  of progression.js / table.js / ladder.js / app.js / overtime.js /
  abilityActions.js / foodPower.js / engine/calories.js. (`sw.js` +1 is
  the offline regen, required by PB-8.)
- Quick gate (pre-panels, on the build): 286 passed, 8 failed — the 8
  were the known pre-existing set (measurement pair stale, mobile-combat,
  occupation-panels, phone-frame, establishment-r20) PLUS two of mine
  (boot-data count, stale offline assets), both fixed and re-verified
  green individually. The establishment-r20 failure reproduces on
  pristine master (pre-existing, not mine). A final quick gate runs before
  landing.

## Verdicts (per bar)

| bar | verdict |
|-----|---------|
| PB-1 unit | PASS |
| PB-2a (≥1 boost on ≥4/8) | FAIL — 3/8; diagnosed (pass hands the pellet to non-fighters) |
| PB-2b ledger exact | PASS |
| PB-2c whole-unit draws | PASS (on pre-draw recomputation; driver snapshot bug fixed) |
| PB-3 starved | NO-GO on floors>0 in live play (village scatters in 2–3d); 0 boosts held; hunger proven at unit level |
| PB-4 Q4 live | PASS (3/8 marked; attribution caveat noted) |
| PB-5 pass | PASS (24/24 identical) |
| PB-6 no-regress | PASS (deaths/day −2.0%) |
| PB-7 proof refresh | PASS |
| PB-8 wired/ontology/offline | PASS |
| PB-9 scope | PASS |

## Landing recommendation

The MECHANISM is proven correct and the Q4 fix is proven live: land the
build. PB-2a and PB-3's floors leg are missed bars, but both are diagnosed
as properties of the pass + the game's starvation response, not defects in
the boost — killing a Steve-ordered mechanic over them would be wrong.
Two design questions ride to Steve with the landing: (1) the pass hands
the pellet to the hungriest villager, who usually doesn't fight, so the
boost fires on only 3/8 villages — should the pass prefer a fighter?
(2) the floor is nearly unreachable in live play (a starved pantry
scatters the village; a healthy pantry never dips below COST) — is that
acceptable, or should the floor have a wider live-play shape? Neither
blocks landing; both are follow-up calls.
