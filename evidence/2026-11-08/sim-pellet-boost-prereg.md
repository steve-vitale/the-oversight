# Pellet boost + cost — PRE-REGISTRATION (written BEFORE any build)

Build: pellet boost + cost mechanic + Q4 fix (Steve's reframe,
2026-11-08 07:03 CST). Brief:
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/pellet-boost-cost-build-brief.md`.
Coordinator: parent (coord-pellet-boost). One leg (boost mechanic +
Q4 fix) plus its proof panel is the expected shape; split only if
the work demands it.

## Sequencing gate — SATISFIED, not re-litigated

Loop B sim-pelletpass-alone-b landed AMBIGUOUS on master
(`204bc55bb`, verified in `git log` at build start): the pellet
pass alone does NOT heal the frozen band (median 82d, sits 3/8);
the minimal flipping set is {#15, #16} as a pair, not #16 alone.
The pass rule stands unchanged. This build is the boost+cost
mechanic + Q4 fix on top of the pass, not a re-run of that
counterfactual.

## Base

- Master at build start: `a111b57fa1592bd6fe5cfd0c3d0e0f9cd9db7813`
  (verified `cat .git/refs/heads/master` in
  `~/workspace/the-scattering` AND `git rev-parse HEAD` +
  `git log -1` in the worktree — they AGREE).
- Worktree: slug `build-pellet-boost`, owner `coord-pellet-boost`,
  branch `build-pellet-boost`,
  `~/workspace/worktrees/build-pellet-boost` at `a111b57f`.
  Registration was slow (registry-lock contention; the register
  script was still running when the worktree was verified usable).
  NOTE (transient index artifact, 2026-11-08 ~14:48Z): a
  `git status` taken while the checkout/restat was still settling
  showed staged deletions (`D .nojekyll` etc.) for files that exist
  on disk byte-identical to HEAD; a re-read minutes later showed
  status clean (0 lines) with `git ls-files --stage` matching HEAD
  blobs. Do not trust a status taken mid-checkout; re-read after
  the tree settles. No repair was needed.
- Main tree at build start carries one untracked file from a sibling
  loop (`evidence/2026-11-08/sim-food-adoption-round-1315.md`, Loop
  A 1315Z adoption in flight) — not mine, not touched.

## Verified code map (current master a111b57f — re-verified at build start)

Corrections to the brief's map (the brief was written on 4fe571095;
the substrate moved since):

- Pellet item: `fusion_pellet` (`src/data/items.json:1251`).
  Holder: `state.fusionReactorHolder` (game.js:25656, 25673, 25708,
  45954, 45986, 46960, 46970). Install consumes the pellet
  (game.js:25668-25673); one reactor per world, never comes out.
- Feeding without food: `src/js/engine/calories.js` (NOT
  `src/js/calories.js` — the brief's shorthand was wrong):
  `dailyNeed()` returns 0 for an installed online reactor
  (calories.js:46-60). `resolveDay` subtracts need 0, so the
  bearer's kcal does not drain from metabolism.
- Pass: `maybePassPellet()` (progression.js:1056+, amended trigger
  v2 — single-dawn read, N=3 living present villagers above
  hunger 70, 30-day cooldown, no streak;
  `evidence/2026-11-07/sim-pelletpass-prereg-amendment-1.md`).
  NOT touched by this build.
- Feast surge: `src/js/feastBuff.js` — `grantFeastBuff`,
  `feastedActive`, `feastedMult`, `_spendFeastedPower` (line 405),
  `noteFeastedCombatUse`, `applyFeastedForm`, `_feastHealBonus`.
  `grantFeastBuff` REFUSES while the reactor is online
  ("the reactor is a ceiling as well as a floor").
  `feastSurgeUsed` no longer gates anything (ladder leg 2,
  progression.js:690); `foodDeeds` is `sentimentTaught` alone.
  `feastSurgeBy` has NO readers outside feastBuff.js.
- **feastburn is RETIRED** (feast-surge rework 2026-10-10;
  food.js:2374-2381, game.js:37320, progression.js:1318). The
  brief's "feastburn-style conversions" line is stale: the live
  conversion family is the feast-surge buff (timed window, strikes
  + ability resolutions read the multiplier; `_spendFeastedPower`
  marks real combat use or landed bonus healing). The boost is built
  on the LIVE family, not the retired trigger.
- **THE FLOOR FINDING (code-verified, drives the design):**
  `feastedMult()` returns a 1.25x floor when the reactor is online
  (feastBuff.js), and the status line promises it
  ("REACTOR · damage ×1.25 · ability bonuses · always active",
  `feastedLine`). But EVERY live call site gates on
  `feastedActive()` — `abilityPowerMult()` (foodPower.js:97),
  the tbDamage villager branch (game.js:38849), `overchargeLine`
  (foodPower.js:108) — and `feastedActive()` is false whenever
  the reactor is online, because `grantFeastBuff` refuses. So the
  promised steady 1.25x NEVER reaches a strike today. The scholar
  bearer gets 1.25x only incidentally via the overcharge path
  (kcal ≥ 75% of cap, foodPower.js:89-92), which the pellet does
  not guarantee (it stops the drain; it does not top kcal up).
  Villager bearers get nothing from the reactor in combat. This
  build delivers the floor honestly as its no-cost base, then the
  paid boost above it.
- **The strike funnel** (game.js:38840-38875, the tbDamage hook):
  `_ps` = scholar source, `_vs` = villager fighter source
  (kind 'villager' with villagerId). Scholar: `_pm =
  abilityPowerMult()`; villager: `_pm = 1`, then feasted →
  `feastedMult()`, then max with godpath `villagerPowerMult`
  (well-fed). If `_pm > 1`: damage multiplied, a line said, and
  if feasted → `_feastUseSource` set + `noteFeastedCombatUse()`.
  Kind 'ally' stays out. The hook is the single insertion point
  for the boost (both bodies, one choke point).
- **Healing channel:** `applyFeastedForm` is called after a
  successful ability resolution from `useAbility` +
  `activateAbility` (abilityActions.js:114-115, 339-340) with NO
  feastedActive gate at the call sites — the gate is inside
  `applyFeastedForm` itself. So the healing boost needs only the
  feastBuff.js change. Twist config lives in
  `src/data/feast-surge.json` (`heal_bonus`, `status_extend`).
  Scope note: this covers the SCHOLAR bearer's own healing
  abilities (the useAbility path). NPC bearer healing via godpath
  kits has no such hook — out of scope for this leg, noted not
  built.
- **Q4 / exile shape (code-verified):** `grantFeastBuff` is called
  ONLY from `hostFeast` (game.js:32187); `feastPlan` refuses
  when exiled. No villager feast path exists. So an exiled scholar
  has NO live feast-surge spend to count — there is no spend, not
  a blocked marking. The seat is already unblocked for the exile
  shape by leg 2 (foodDeeds = sentimentTaught alone). The Q4 fix's
  live shape is therefore the BEARER shape only: a reactor-powered
  spend marks the deed. The exile finding is recorded here, not
  built around.
- **Pantry payment pattern** (the template, from the leg-2
  buy-out, game.js:31805-31838): check `pantryKcalLive(v)` ≥
  COST, draw with `pantryDraw(v, COST, {})` (real items,
  fresh-first), record `spent`. The boost uses the same pattern
  per strike.
- **Data list:** game.js:294-296 loads `ladder-capstones.json`
  into `this.data` — the new `pellet-boost.json` joins the same
  list (destructuring + file list + data object).

## Design (pinned — Muse calls, Steve can overrule)

- **Sustenance stays free.** The pellet feeds its carrier without
  real food; the pass rule stands (progression.js untouched).
- **The reactor burn (the boost).** While the reactor is online,
  the BEARER's own strikes may burn pantry kcal for power:
  - FREE FLOOR (no cost, delivered honestly now): the bearer's
    strikes get ×1.25 (the promised reactor floor).
  - PAID BOOST: each boosted strike draws COST kcal from the
    pantry (real `pantryDraw`) to lift that strike to ×1.5
    (legendary-feast level — the ceiling the reactor currently
    denies). The pellet never refuses; the pantry is the limit.
    Pantry < COST → floor only, with an honest line naming the
    empty pantry. The bearer still doesn't hunger.
  - BEARER-ONLY (parity): the power is the bearer's, not the
    village's. Scholar-bearer: scholar strikes (`_ps`).
    Villager-bearer: that villager's strikes
    (`_vs.villagerId === holder.vid`). Party members get nothing.
    Same rule for player and villager bodies.
  - COST = 50 kcal per boosted strike; BOOST = ×1.5; FLOOR =
    ×1.25. Rationale: a feast (≥1500 kcal) buys 1.35–1.5x for
    ~2 dawns (dozens of strikes); at 50 kcal/strike a 10-strike
    fight costs 500 kcal — a real price, a third of a feast, for
    legendary-level power in every fight while the pantry holds.
    The number lives in data (see below) and is tunable by a
    prereg amendment if the panel shows it off — not silently.
- **Healing boost (same spend).** When the bearer resolves a
  healing ability while reactor online, the feasted-form bonus
  (heal_bonus twist, +50% of the landed heal) fires as a paid
  boost: each bonus heal draws COST kcal. Pantry short → the base
  heal lands, the bonus doesn't (the bonus is the spend).
- **Q4 fix.** `_spendFeastedPower` gains a `kind === 'reactor'`
  path: a PAID reactor boost marks `feastSurgeUsed = true` +
  `feastSurgeBy` = striker ('p' or 'v:<id>'), bypassing the
  `feastedActive()` gate (that gate IS the block: the bearer can
  never be feasted). The free floor does NOT mark — it costs
  nothing, so it is not a spend. The reactor path leaves the
  `feastSurge` arming alone (it belongs to a future feast, not
  to the reactor spend) and is idempotent (already-true → no-op).
  The spend is the deed; the eating is not the deed.
- **Ledger.** `state.pelletBoost = { spent, boosts, floors,
  lastBoostDay }` (kcal spent, paid boosts, floor-only strikes,
  day of the last paid boost). World state, survives the mantle
  like `state.pelletPass`. The ledger + the pantry draw together
  prove no free power: `spent` must equal `boosts × COST`
  exactly, and the pantry must be lighter by that amount.
- **Voicing (plain, honest).** Boosted strike:
  "REACTOR ×1.5 — the pellet burns 50 kcal of pantry stores."
  Floor strike: "REACTOR ×1.25 — the pellet hums." Empty pantry:
  the floor line names it ("the pantry is empty, no burn to
  spend"). `feastedLine()`: when the bearer boosted today
  (`lastBoostDay === day`) the reactor line reads ×1.5
  ("burning pantry stores"), else ×1.25. Per-strike lines follow
  the existing feasted precedent; a human playtest
  ([needs-eyes] on the landing) judges whether they read spammy.
- **Data lever.** NEW `src/data/pellet-boost.json`:
  `{ costKcalPerStrike: 50, boostMult: 1.5, floorMult: 1.25 }`
  + `_doc`. Read by `pelletBoostCfg()` in feastBuff.js with
  defensive defaults matching the JSON (same pattern as
  `feastSurgeCfg()`). Data over code.
- **Where the code lives.** `feastBuff.js`: `pelletBoostCfg()`,
  `pelletBurn(striker)` (bearer check, floor/boost decision,
  pantry draw, ledger, line, Q4 marking call), the `reactor`
  path in `_spendFeastedPower`, the `applyFeastedForm`
  eligibility for the reactor bearer + pantry draw in
  `_feastHealBonus`, the `feastedLine()` note. `game.js`: the
  tbDamage hook calls `pelletBurn()` for `_ps`/`_vs` and takes
  max with the existing `_pm` (never lowers it); `init()` adds
  `pellet-boost.json` to the data list. Ontology header of
  feastBuff.js updated (provides/consumes); offline assets
  regenerated.
- **NOT touched:** progression.js (pass untouched), table.js,
  ladder.js, app.js, overtime.js, standing.js, abilityActions.js
  (no gate change needed there), foodPower.js (the reactor floor
  is NOT folded into abilityPowerMult — it is a separate source
  and must read as such in the hook), engine/calories.js,
  mirror-cap / alien files, loop arms, journey rotation files,
  loop locks.

## Proof plan (prereg-bound, before any build)

Rig: the reactor is rare alien loot, so bearer panels RIG the
reactor onto the scholar at day 1 (harness post-load state
mutation: grant `fusion_reactor` + `scholar.fusionReactor =
{installed:true, online:true}` + `state.fusionReactorHolder =
{who:'player', vid, day:1}`) — documented, same rig for before
and after. Before/after comparisons run the same rig on the
pre-build root (stash the rig driver, run on master) and the
branch.

- P1 — boosts fire: rigged-bearer panel, 8 seeds (standard
  screening set 7,42,99,1234,555,777,2026,31337), capable,
  150d, env standard (below). Bar: the bearer spends ≥1 paid
  boost on ≥4/8 seeds; on EVERY seed, `ledger.spent ==
  boosts × 50` exactly and the pantry accounting matches (no
  free power — any boost with a mismatched draw is a FAIL).
- P2 — cost binds: pantry-starved rigged seed (pantry emptied
  at rig, no resupply): 0 paid boosts across the run; the
  bearer still doesn't hunger (`dailyNeed` 0, no starvation
  death); floor strikes still fire (`floors > 0`).
- P3 — Q4: rigged unit + live seed. Unit: a paid boost marks
  `feastSurgeUsed` + `feastSurgeBy` ('p' for the scholar,
  'v:<id>' for a villager bearer); the free floor alone does
  NOT mark; the reactor path leaves `feastSurge` arming alone.
  Live: on the P1 panel, `feastSurgeUsed` marks on ≥1 seed via
  a paid reactor boost (By recorded). The exile shape has no
  live spend (verified above) — recorded, not panelled.
- P4 — pass untouched: the pass is behavior-identical. Extract
  the pass firing days from the pre-build pelletpass evidence
  (`evidence/2026-11-07/sim-pelletpass-panel.jsonl` + the
  pelletpass-alone evidence) and assert the branch's panel
  fires the pass on the SAME seeds/days. Bar: exact equality
  on pass days. (If the baseline is not extractable, fall back
  to "pass fires ≥1 time on the 99767 shape where the trigger
  holds" and say so in the run note — no silent fallback.)
- P5 — no regression: balanced panel before/after (standard
  neutral shape: seed 7 × 4 policies × 150d) + deaths/day
  comparison. Bar: deaths/day must not drop >~15% (difficulty
  law: survivor strength, never fewer deaths; a fix dropping
  the death rate that far is probably just a buff). Wins /
  national moving beyond noise is investigated, not auto-passed.
- P6 — proof refresh: the change alters what the game reads
  (feastBuff.js, game.js, new data file), so the neutral proof
  is refreshed the leg-1 way (fresh panel seed 7 × 4 policies ×
  150d + `scripts/balance-proof-update.js`) in its own commit.
  `check.js --quick` in a free gate slot (never concurrent
  with another gate); no NEW failure attributable to the change.
  The phone-frame-proof test stays red until a browser-capable
  agent refreshes receipts (known owed item — do not chase it,
  do not hand-edit proof hashes). Pre-existing failures
  (mobile-combat-cadence, occupation-panels,
  establishment-r20-fixes, per leg 1) are carried as known.

## Bars (metric binding — MEASUREMENT.md §14: a miss is NO-GO, never re-scored)

- PB-1-unit: every `scripts/test-pellet-boost-*.js` +
  `scripts/test-pellet-q4-*.js` proof passes (rigged states):
  floor ×1.25 free on bearer strikes (scholar AND villager
  bearer); boost ×1.5 when pantry ≥ 50, pantry lighter by
  exactly 50 per boost, ledger matches; 0 boosts + floor only
  when pantry < 50, bearer still doesn't hunger; non-bearer
  party strikes get nothing; boost line names the cost; Q4:
  paid boost marks Used + By (p and v:<id>), floor alone does
  not mark, arming untouched; healing: bonus heal draws 50,
  base heal lands without the bonus when pantry short.
- PB-2-panel (P1): rigged-bearer panel bar as above (≥1 boost
  on ≥4/8 seeds; ledger exact on every seed).
- PB-3-starved (P2): pantry-starved rigged seed bar as above
  (0 boosts; no hunger; floors > 0).
- PB-4-q4-live (P3): `feastSurgeUsed` marks on ≥1 P1-panel
  seed via a paid reactor boost.
- PB-5-pass (P4): pass days equal to the pre-build baseline.
- PB-6-noregress (P5): deaths/day drop ≤15% on the balanced
  panel; no unexplained win/national movement.
- PB-7-proof: neutral proof refreshed in its own commit;
  `check.js --quick` green except pre-existing + phone-frame
  (known owed).
- PB-8-wired: `node scripts/check-wired.js` on feastBuff.js and
  game.js shows nothing unwired (no new leg entry points are
  added — the hook is a call-in, not an entry point).
  `node scripts/validate-ontology.js` passes (feastBuff.js
  provides updated); offline assets regenerated
  (`node scripts/build-offline-assets.js`).
- PB-9-scope: `git show --stat` for every leg commit touches
  no `src/js` file outside feastBuff.js and game.js, no
  `src/data` file outside pellet-boost.json, and no
  progression.js / table.js / ladder.js / app.js / overtime.js /
  abilityActions.js / foodPower.js / engine/calories.js.

## Env

- Unit proofs: none (shared harness, fixed seeds, rigged
  states).
- Panels (P1/P2/P4/P5): the standard competent-panel env
  (per the gating brief):
  `COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
  POLICY=nighttravel WOODCARRY=1 WOODWARM=0 BANKFOOD=1
  STRANDNARR=1`.
- No fresh seed band needed: unit proofs use rigged states;
  panels use the standard screening set + the 99767 shape +
  the existing neutral-panel seeds. No freshness check owed.
