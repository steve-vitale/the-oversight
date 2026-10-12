# Journey: crisis leg (6) r2 — 2026-10-11 (evening)

Worker: playtest-loop coordinator. Worktree: ~/workspace/worktrees/journey-crisis (branch journey-crisis).
Rotation: read 6 (crisis), played a fresh angle — the noon run covered the
crisis beats; this run chased the documented blank from the succession leg:
**"the village starved with 4854 kcal in the pantry"** (seed 105 note).

## Played

- Diagnostic sims on the fixed day-loop harness (`scripts/diag-pantry-starve-`,
  `diag-fasting-starve-`, `diag-starve-breakdown-20261011.js`, new): 6 seeds ×
  60 days as competent player (oracleV2), tracing every villager meal where
  `ate < 60%` of need against pantry state.
- Proof: `scripts/test-crisis-ration-famine-20261011.js` — 11/11 × 3 seeds,
  RED→GREEN verified by file-swap (4 red pre-fix).

## What was found

**F1. The relief safety net fired the famine crisis it exists to prevent.**
The rationing vote (safetynets.js) halves each villager's `kcalPerDay` inside
`villagerMealDay` — need halves, everyone eats their voted half. But
`villageEats` measured starvation against the FULL need, so every rationed
villager eating exactly their half-ration read as "starving" (0.5 < 0.6) and
fed the hunger-winter streak. Measured: **hunger-winter fired with 55,207 and
83,145 kcal pantries** — the "starved with food in the pantry" phenomenon,
reproduced and root-caused. After the fix, the same seeds fire hunger-winter
only with pantries ≤1,200 kcal (or not at all).

**F2. Voluntary gorge-fasts counted as starvation** — 17.9% of all starve
events. The -8 health "unfed fade" and the hunger-winter signal both fired on
fast days, contradicting the hunger-winter block's own design note ("Not
voluntary fasting: the signal is what they ate").

**F3. Longhouse hearth 10% meal stretch was dead code** — `away` was declared
AFTER its first use in `villagerMealDay` (TDZ ReferenceError swallowed by
try/catch), so the stretch never applied.

**F4. The entire TITAN CLASS was dead on arrival.** titans.js used a bare
`Game` at load (`Object.assign(Game, methods)`) — game.js only sets
`globalThis.Scattering.Game`, so it threw ReferenceError in browser and node
alike; no titan method ever attached, `titanDawnTick` undefined, guarded dawn
call silently skipped. The proof test masked it with a `global.Game`
workaround ("expose it like the browser does" — the browser does no such
thing). Fixed to the sanctioned pattern (`(globalThis.Scattering||{}).Game`;
betrayal.js, pods.js). It was the ONLY module with a top-level bare `Game`.

**F5. sim-harness silently dropped titans.js in EVERY sim.** `loadGame`'s
function-scope `const Game` TDZ-shadowed each eval; the failure was collected
into `loadFails` and never asserted. Fixed: order-preserving two-pass eval
(game.js in index.html position — its IIFE captures `const S =
global.Scattering` at load, so it must run after engine/*), then
`global.Game` exposure, and the shadowing local renamed. `loadFails: []`
verified.

## Fixes (worktree, proof-tested)

- `src/js/game.js` — `villageEats`: `anyStarving` now measures against the
  rationed need (`rationNow ? 0.5 : 1`, same clock as the safetynets wrapper)
  and skips fasting villagers. `villagerMealDay`: the unfed-fade -8 skips
  fasters; returns `fasting`; `away` declared before first use (hearth
  stretch live).
- `src/js/titans.js` — sanctioned attach pattern.
- `scripts/sim-harness.js` — two-pass eval, no silent module drops.

## Village assessment (plain words, post-fix sims)

Six villages, six dyings still — but the dyings are honest now. Seeds 1–2
ran to day 54 (was ~21–26 with the false crisis spiral); seeds 3–6 died days
18–22 to real causes (combat, genuine famine with bare pantries). The
rationing vote now does its job: villages vote half-rations, eat half, and
no phantom hunger-winter follows. Bearers still starve when the POLICY doesn't
feed itself (oracleV2 feeds the village, not the bearer — policy gap, noted
before, not an engine bug). Fasting villagers no longer take phantom health
hits for their rhythm. The hearth stretch means haven-tier-1 villages need
10% less — small, as designed.

## People check (SENSE-TESTING LAW) — famine transcript re-read

Transcript A re-run post-fix: the famine opening is still the strongest
crisis writing ("I hate to ask, but do you have anything to eat? ... I can't
keep going like this"), "Small meals. Slow. Pretend it's a choice." is
famine-colored and true, the favor seed plants honestly. PASS with the known
wart: `alive:thread:want`/`lately` re-offer verbatim after exhaustion ("I
just said — did you miss it?" twice) — flagged by the noon run as
social-life leg's territory; persists, not re-fixed here.

## Reachable / fun / winnable (crisis leg)

- **Reachable**: yes — hunger-winter, rationing votes, and relief paths all
  fire through real play; titans are now actually reachable (they were
  silently absent).
- **Fun**: the crisis beats remain the best writing; the rationing loop now
  reads as the village pulling together instead of a false-alarm spiral.
- **Winnable**: through crisis, yes — the mantle chain held; the false
  famine-crisis spiral was actively killing winnable runs and is gone.

## Regressions (sequential, worktree)

- New proof test-crisis-ration-famine: 11/11 ×3 seeds (4 red pre-fix).
- test-titan-class 31/31 · test-crisis-20261009 18/18 · test-sick-favor 17/17 ·
  test-favor-system 30/30 · test-break-food2 42/42 · test-break-food3 46/46 ·
  test-break-food-20261010d 16/16 · test-break-food-20261010e 21/21 ·
  ontology 80/80 ("Release permitted").
- Pre-existing (not mine, fail identically on pristine game.js):
  test-break-food-20261011 W2a (auto-haul spoiled), test-break-food-r3 W4b
  (field-dressing bank cap).

## Flags for other loops

- **Flesh-out / longsim loops**: every sim ever run through sim-harness ran
  WITHOUT titans.js (silent loadFail). Any titan-adjacent measurement from
  before this fix is suspect; titan pacing/reachability needs a fresh pass.
- **Break-it loop**: the `global.Game` workaround pattern in proof tests
  masks browser-load breakage — any test using it should be re-checked
  against the sanctioned attach pattern.
- The noon run's flagged items persist: `alive:thread:*` re-offer loop
  (social-life leg), near-universal `mood=lonely` in crisis timelines
  (feel pass), oracleV2 bearer self-starvation (policy owner).
