# Preservation access and the empty terrain-menu dead spot

Continuation of Steve's playstyle-viability audit. No new rewards or recipe
prices: first establish which public actions work and what natural runs reach.

## Findings that changed the next action

1. The preservation ladder works with prepared supplies: blind smoke teaches
   preserving (80% yield, 15-day shelf, 16 ticks); the next batch earns 95% and
   30 days. Blind rendering teaches rendering (65%, 90-day shelf, 12 ticks);
   subsequent rendering earns 90%. Pemmican still requires rendering knowledge,
   2 preserved meat + 1 rendered fat + 2 berries, about 97% calorie retention,
   20 ticks, and 120-day shelf. Counter and personal pack remain separate.
2. Pemmican treated an explicit zero-unit stack as a singleton. An empty fat
   stack, two empty meat stacks, or two empty berry stacks could each fund a
   batch and consume the other real ingredients. The three quantity reads in
   set counting, plan and consumption now use `units ?? 1`. Old singleton
   objects that omit units remain valid; zero stays empty. No yields changed.
3. Actual phone testing discovered a broader UI dead spot. `cellPopup` entered
   `else if (Game.corpseAt)` whenever that method existed, even if its result
   was empty. This swallowed the following villager/terrain branches: tapping
   the Haven fire showed a title and no actions, including no pemmican. The
   branch now additionally requires a body at that cell. Existing player,
   monster and animal priorities remain before it; actual body search remains
   before villager/terrain actions. This restores actions already implemented,
   rather than adding new powers or rewards.

## Regression and actual phone proof

- `test-preservation-access-20261015.js`: **14 pass**; identical pre-fix test
  **11 pass / 3 fail**, solely the three empty-ingredient cases. Shared harness,
  one seeded Game, actual generated fire and public processing verbs. Supplies
  and novice knowledge are explicit fixtures, not earned access claims.
- `test-cell-popup-dispatch-20261015.js`: **6 pass**, pre-fix **1 pass / 5 fail**.
  Executes the shipped UI function against the shared seeded Game, substituting
  only the DOM rendering seam and sheet navigation. It invokes the real bound
  pemmican action, checks person dispatch, keeps body search priority, and proves
  buried or other-world-tile bodies do not hide terrain. It is not a regex test
  that merely asserts the fix's condition text.
- 390×844 real browser: prepared novice with cooked meat, raw fat and berries,
  initially neither technique. Real Pack **Render** (12) then **Smoke** (16),
  actual fire tap, **Make pemmican (2 bars)** (20). Total **48 ticks**, both
  techniques learned, **2 bars / 1,310 kcal** from 1,350 post-preparation kcal
  (97.04%, rounding). Screenshot `preservation-ladder-phone.png` shows actual
  success narration, paid ticks and pack calorie total. Before dispatch repair
  this fire menu was empty. The local verification fixture used a fresh app
  script query after the browser initially retained the cached old script.
  Fixtures grant supplies, not HP, wins or combat rewards; this is public UI
  access proof, not a naturally earned noncombat pemmican run.

## Natural ingredient census

`gear-usage-audit.js` now observes `renderFat`/`cleanCarcass` calls and existing
pack/prep/pantry input stock at ordinary setup/upkeep/daily samples. The observer
never calls technique, fire, detail, pantry or modifier helpers: some of those
initialize state or consume RNG. Nominal freshness excludes expired stock without
applying spoilage bonuses; peak units and samples with stock describe snapshots,
not exact processing permission, separate runs' simultaneous supplies or a chance
of success. Stock acquired/used between samples can be missed. Access includes
successor bearers; it is not one person's learning rate.

16 fixed seeds each for capable and maker, standard 150-day driver:

| Policy | Table wins | Pack smokable meat runs | Prep smokable meat runs | Pack preserved meat runs | Any sampled fat | Any render knowledge | Pemmican calls |
|---|---:|---:|---:|---:|---:|---:|---:|
| capable | 14/16 | 9 | 8 | 0 | 0 | 0 | 0 |
| maker | 4/16 | 7 | 13 | 1 | 0 | 0 | 0 |

Capable made no preserve calls; maker made 3. Neither called render or pemmican.
No sampled raw or rendered fat in any pack, prep counter or pantry. Rendering
is not a random recipe unlock required before trial: the first actual render
teaches it. Zero fat is an upstream supply/coverage finding, not proof the ladder
is broken or worthless. The non-hunting maker also ignores its prep counter when
preserving, despite smokable meat there in 13/16 runs. Test that behavior next,
including reserves, actual ingredient access and success, before changing rewards.

Data: `gear-usage-preservation-access-16.{json,md}` and
`gear-usage-preservation-after-16.{json,md}`. All **32/32** observer-augmented
baseline state hashes match the preceding committed storage screen, and the
single maker seed-7 observed/unobserved control also matches. Thus the new access
observation does not perturb the measured trajectories.

The after screen isolates the food quantity repair in frozen source; UI menus
are excluded by the node harness and separately verified in the browser and UI
regression. An initial archive differed in competent.js line endings only; the
final comparison copies the exact unchanged policy bytes before running again.
Final manifest and hash comparison and suite results are recorded below.

Final natural comparison: source manifests differ only in `src/js/food.js`;
**32/32 final state hashes match**, observer errors zero. This is a regression
screen for the input-count repair, not evidence that the restored UI improves
node-bot wins (the node harness does not load app.js).

Validation: the food-only stage passed all 896 registered scripts. During the UI
edit an accidental whole-file line-ending conversion broke source-extraction
fixtures. The original app.js bytes were restored, with only the intended
condition changed; the coalition, audio mix, catfish audio and ending-screen
fixtures pass individually. Final quick suite: **125 scripts pass**, 29 seconds.
Final full suite follows below. No assertions were loosened or quarantined.

Final full suite: **897 scripts pass, 0 fail, 144 seconds**.
