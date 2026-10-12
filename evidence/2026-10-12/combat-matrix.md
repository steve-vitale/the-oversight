# Combat matrix — waves 1–5 × equipment tiers (2026-10-12)

**Purpose:** prove monster fights are mechanically SENSICAL at different equipment levels — not just that they run, but that the difficulty ladder reads coherently and every signature mechanic actually fires and matters.

**Method:** `scripts/test-combat-matrix-20261012.js` — node harness (full `src/js/*.js` in index.html order minus DOM-only modules; seeded RNG installed before eval; `window` deleted after eval for the sync combat path; movement on interior tiles 1..7; `endTurn()` only when still the player's turn; never after `tbPlayerWait()`). A `competent` policy (`scripts/policies/competent.js`): approach → strike when in range, wait to lure close-ranged monsters, brace under telegraphs (block), flee-by-barrier NOT used (the matrix measures W/L, never flees — see the one stall below).

- 12 non-titan monsters × 4 tiers × 5 seeds (seeds 11/22/33/44/55) = 240 fights, plus titan solo-gate checks (eater, nielsen × 5 seeds each) and armor-model discriminators.
- Tiers: **(a)** naked — bare hands, P=0; **(b)** stone knife +12, P=0; **(c)** fire-hardened spear +15, hide armor P=20; **(d)** godslayer spear +85, alien set P=138.

## Bugs found and fixed (all with before/after proof tests)

### 1. titans.js load-time ReferenceError — the titan system never attached (SHIP-BLOCKING)

**Symptom:** `scripts/test-titan-load-20261012.js` failed 6/6 — `Game.isTitan`, `titanMusterReady`, `startCombat` gate, pool filter, coalition injection all undefined/missing.

**Root cause:** `src/js/titans.js` referenced bare `Game` at IIFE load time (`Object.assign(Game, methods)`). But `game.js` declares `const Game` inside its IIFE — it is never a global. Every other late module binds `const Game = (globalThis.Scattering || {}).Game` (the pods.js convention); titans.js was the only one that didn't. The IIFE **threw at load**, so the ENTIRE titan system — solo hard-gate, omens, coalition warfare, wave-pool filter — silently never attached. In node AND in the browser (the old proof test's `global.Game` workaround was wrong about browser behavior — the browser has no global `Game` either).

**Fix (1 line):** `const Game = (globalThis.Scattering || {}).Game;` at the titans IIFE top.

**Before/after:** `node scripts/test-titan-load-20261012.js` — 6 failures before, all pass after. Verified: solo eater/nielsen refused aloud ("This is not courage. This is arithmetic."), titans excluded from the wave pool, a mustered coalition injects named allied fighters.

### 2. gearUp spear-slot routing — sim fought bare-fisted with spears in the pack

**Symptom:** `scripts/test-gearup-spear-slot-20261012.js` — gearUp reported the spear "geared" but `equipped.melee` stayed empty; 3 failures.

**Root cause:** `scripts/policies/competent.js` routed weapons by `w.type === 'ranged'`, but `equipment.js isRangedWeapon` (range > 1) puts ALL range-2 weapons — including every spear — in the RANGED slot, and `equip()` refuses a spear in 'melee'. So the sim policy silently fought bare-fisted while spears sat in the pack, and `ctx.geared` counted the failed equip as success. Every long-run sim combat measurement since the ammo-aware gearUp landed (2026-10-11) under-measured equipped fighting.

**Fix:** route via `isRangedWeapon` exactly like the inventory UI (`app.js` data-equip-w), with a `gearUp._equipped` probe so `ctx.geared` can't lie again.

**Before/after:** 3 failures before, all pass after.

### 3. patternCells missing 'single' case — wave 4–5 monsters telegraphed at empty cells and dealt zero damage

**Symptom:** `scripts/test-single-pattern-20261012.js` — `patternCells('single')` returned `[]`; a 30-turn instrumented fight vs the Cancellation landed 0 hits (player untouched).

**Root cause:** `src/js/engine/combat.js` `patternCells` handled beam/line/charge/burst/ambush but not `'single'`. 12 monsters use pattern type 'single'. The ones with bespoke declare paths (glasswing, sunbasker, nightcourt, alien_tick) worked, but strike, eulogy, cancellation, spoiler, suburb, terms_of_service, ad_break fell through the GENERIC declare → telegraphed forever against empty cells → the resolve found no cells → zero damage. The wave-5 Cancellation was an 1800-HP punching bag that never stamped (40-turn instrumented fight: 39 "Under Review!" telegraphs, 0 damage — a naked player could have plinked it to death over 600 rounds). The Strike's Walkout never landed either.

**Fix:** `'single'` resolves to the aim tile (`encWantRange` already treats 'single' like 'direct' for range purposes).

**Before/after:** cancellation 0 hits / player untouched / no stamp before → stamps for 70-100, kills a naked player in ~3 turns after.

## The one stall (investigated, documented — NOT fixed, needs Steve's call)

`editor/c/seed44` — 81 player turns. Perfect storm:
1. Player spear (~19/hit) vs editor's flat monster armor 18 → ~1 dmg/turn.
2. The editor's Cut was **permanently cover-blocked** by terrain ("The light shreds leaves and dies against the trees. Cover works." every round) → 0 dmg/turn back.
3. The matrix bot never flees → nobody can kill anybody.

A real player flees a hopeless fight. Fixing it means teaching beam/line monsters to reposition when their lane is fully blocked — monster-AI behavior with feel implications (it touches the deer too). Documented here; recommended as a follow-up for Steve's pick, not a silent change.

## Results (all assertions pass; 280 cells)

`W/L | t~median player turns | hp~median player-HP fraction on wins | sig telegraph/impact`

| monster | (a) naked | (b) knife | (c) spear+hide | (d) godslayer+alien set |
|---|---|---|---|---|
| w1 gallowdeer | W0/L5 t~6 | W5/L0 t~6 hp~0.31 | W5/L0 t~5 hp~0.71 | W5/L0 t~2 hp~0.96 |
| w1 hushwolf | W5/L0 t~4 hp~0.25 | W5/L0 t~2 hp~0.86 | W5/L0 t~2 hp~0.92 | W5/L0 t~1 hp~0.98 |
| w2 mirror_stag | W5/L0 t~8 hp~0.45 | W5/L0 t~4 hp~0.75 | W5/L0 t~3 hp~0.88 | W5/L0 t~1 hp~1.00 |
| w2 review_drone | W5/L0 t~13 hp~0.45 | W5/L0 t~4 hp~1.00 | W5/L0 t~3 hp~1.00 | W5/L0 t~1 hp~1.00 |
| w2 landlord | W4/L1 t~9 hp~0.18 | W5/L0 t~4 hp~0.74 | W5/L0 t~3 hp~1.00 | W5/L0 t~1 hp~1.00 |
| w3 gavel | W0/L5 t~7 | W0/L5 t~5 | W0/L5 t~8 | W5/L0 t~3 hp~1.00 |
| w3 redactor | W0/L5 t~4 | W0/L5 t~5 | W1/L4 t~8 hp~0.23 | W5/L0 t~4 hp~0.89 |
| w3 focus_group | W0/L5 t~5 | W0/L5 t~6 | W5/L0 t~9 | W5/L0 t~3 |
| w4 audit | W0/L5 t~3 | W0/L5 t~4 | W0/L5 t~4 | W5/L0 t~11 hp~0.27 |
| w4 strike | W0/L5 t~3 | W0/L5 t~3 | W0/L5 t~6 | W5/L0 t~9 hp~0.31 |
| w5 editor | W0/L5 t~3 | W0/L5 t~3 | W0/L4/O1 t~5 STALLx1 | W1/L4 t~6 hp~1.00 |
| w5 cancellation | W0/L5 t~3 | W0/L5 t~4 | W0/L5 t~4 | W0/L5 t~7 |

Signature telegraphs fired 5/5 in every wave 1–3 fight (deer beam sweep manifest sig5/5 at all tiers; gavel trial/verdict, redactor REDACT + murmur ratings, focus_group group-coming-apart all 5/5). Wave 4–5 telegraphs are copy-only on master — real mechanics live on the unmerged `wave35-mechanics` branch (NOT my scope to merge); documented, not asserted.

Titan solo-gate: eater and nielsen refused 5/5, said aloud 5/5, named the muster 5/5. (Titans are excluded from the 1v1 matrix by canon — solo fights are hard-refused; coalition fights are covered by `test-titan-class.js`, 31/31.)

Armor model: hit-1 clamp holds across all absorbing samples (277); DR-vs-flat discriminator passes — P=138 vs small hits lets a median ~2–3 through, not 0–1.

## SENSICAL verdicts per wave

- **Wave 1 — scary-but-beatable: YES.** The Highbeam Deer is the wall: naked loses 5/5 in ~6 turns, a stone knife turns it (W5, but costly — hp~0.31), better gear opens the margin (hp 0.71 → 0.96). Beam telegraph → sweep manifest fires every fight; the disrupt/counterplay geometry works. Hushwolf is the soft entry — beatable naked (W5 but hp~0.25, close), trivial with gear; wolves flee at higher tiers (canon).
- **Wave 2 — the difficulty dips: FLAGGED.** mirror_stag/review_drone/landlord are beatable even naked (W4–5), and stomp with gear. This is easier than the wave-1 deer — which is defensible (the deer is the 160-HP benchmark; wave 2's threat is conceptual/system mechanics, not stats), but worth Steve's eye: if wave 2 should read as "a genuine step up," its stat floor may need a look. Signatures (charge, beam grading, lease signs) all fire 5/5.
- **Wave 3 — the wall: YES.** gavel/redactor kill tiers a–c 5/5, fall to godslayer-tier in 3–4 turns. focus_group: 10 lost / 10 routed — the group comes apart or flees at higher tiers, which reads as designed. Trial/verdict, REDACT, murmur ratings all fire and matter.
- **Wave 4 — the gear check: YES.** audit/strike kill tiers a–c, fall to tier d in ~10 turns — and even then costly (hp~0.27–0.31 on wins). A godslayer-tier fighter earns the win but bleeds for it. (Real signature mechanics pending `wave35-mechanics` merge.)
- **Wave 5 — terrifying: YES.** editor/cancellation kill everything; even tier d loses 4/5 and 5/5. This is sensical per MONSTER-WAVES.md: apex is a 7–10 round fight for a *godhood build* — gear alone shouldn't win it. The cancellation's stamp now lands for 70–100 (it dealt literally zero before the 'single' fix).

## Judgment calls (documented for Steve's overrule)

1. Deer beam missing at zero range is DESIGN, not bug: shared-tile target gives `along=0`, failing the `along > 0` onBeam check. This is the "close in and break its aim" counterplay — closing in enables the 25–50% disrupt ("the beam stutters and dies!") while antlers (12–16/turn) punish it. Verified beam geometry, disrupt, and sweep narration all function.
2. Wave-5 apex beating top gear without godhood is intended (godhood builds are the wave-5 answer).
3. The editor stall is documented-not-fixed (see above) — AI repositioning is Steve's call.
4. Wave-2-vs-deer difficulty inversion flagged for Steve's eye, not changed.

## Proof-test inventory

- `scripts/test-combat-matrix-20261012.js` — the matrix (ALL ASSERTIONS PASS).
- `scripts/test-titan-load-20261012.js` — titans.js fix (6 failures before → pass after).
- `scripts/test-gearup-spear-slot-20261012.js` — gearUp fix (3 failures before → pass after).
- `scripts/test-single-pattern-20261012.js` — patternCells fix (4 failures before → pass after).
- `scripts/test-wave3-5-20261010.js` — updated to titan canon (215/215; was 210/5 on stale expectations).
- `scripts/test-titan-class.js` — 31/31 (regression-clean with the fix).
- `scripts/test-wave2.js` — 167/3, the 3 failures pre-existing on pristine HEAD (verified).

## Gaps

- Wave 4–5 REAL signature mechanics (audit taxation, strike demands, eater growth, editor cutting) live on the unmerged `wave35-mechanics` branch — matrix asserts telegraphs only for those.
- The matrix bot never flees and uses one policy; multi-policy (risk-aware etc.) coverage is the measurement loop's territory.
- Wall-clock-per-round telemetry not captured (headless sim).
