# sim-knowfood-a — preregistration (Knowledge FOOD, VILLAGER-SIDE rate revision — coverage program Tier 1 #3, B-review next blank #4)

- Run: `fleshout-loop-a-20261110T2215Z`, Loop A, arm `sim-knowfood-a`,
  worktree `~/workspace/worktrees/sim-knowfood-a`, branch `sim-knowfood-a`.
- Base: master `3daa1a9b6` (verified `git log --oneline -1` in the worktree at
  spawn; if master moves before landing, rebase onto the explicit master SHA
  read immediately before rebasing and re-run proof green).
- Band: **170225–170232** (8 seeds, pilot). Seed-band freshness verified
  before this prereg was written (see "Seed-freshness record" below).
- Horizon: **100d max, death-aware** (run until game over / win; villages
  that die stop simulating, +10d tail max). Why 100d: same as knowledge-b —
  the food-knowledge question is week-scale (the experiment beat fires
  daily, plant learning and pantry draws accumulate from day 1), 100d
  holds ~800 village-days, and the SAME horizon shape makes the
  villager-side rate directly comparable to the scholar-side 99.9% on
  band 170217–170224. The question is not a reachability question, so the
  150–200d reachability band does not apply.
- Policy: `scripts/policies/competent` (verbatim, NOT modified) via the new
  `scripts/knowfood-a-driver-20261110.js` with `KNOWFOOD_A_MODE=on`
  (instrument) and `KNOWFOOD_A_MODE=off` (neutrality leg, wall numbers
  only). No new policy. No game-code change — MEASUREMENT ONLY. No
  gate/price/deed/readiness change. Zero `src/js` expected.
- Canon: docs/CANON.md read first; docs/KNOWLEDGE.md read (stores table,
  "If you don't know, it doesn't show", experiment-before-identification,
  villager plant knowledge is binary, sharedKnowledge + tested verdicts);
  docs/PRESERVATION.md + docs/BEAR.md read (food ladder, butchering,
  monster-meat handling). Coverage audit read (Tier 1 #3, knowledge-b
  evidence `evidence/2026-11-10/sim-knowledge-b.md` — this arm is the
  revision its Metric review orders).

## Steve's order (scope)

Steve 2026-11-10 11:11 CST: "Measure all so we can improve on all gaps."
Steve 2026-11-10 11:14 CST correction: knowledge means MORE THAN COMBAT —
food, looting, people, foraging, exploring. Knowledge-b measured all five
domains; its FOOD rate was the SCHOLAR-known rate (1,372 pantry draws,
99.9% known-edible) because its check, `pantryItemKnown`, gates monster
meat on NAMING and plants on the scholar's codex. This arm is the owed
revision: the same draws judged by the EATER's knowledge, plus what
villagers do with food they do not know is edible (eat / test / cook /
ignore), and whether unknown flesh still draws 0 kcal villager-side.

## What this arm is (and is not)

- A MEASUREMENT revision, not a tuning lever: it re-judges the knowledge-b
  FOOD domain with a villager-side check and adds the unknown-food
  encounter table knowledge-b did not count. It changes no lever and
  re-judges no earlier arm's verdict. The knowledge-b numbers stand as
  the scholar-side rate; this arm reports the villager-side rate beside
  them on a fresh band.
- The other four knowledge-b domains (looting, people, foraging,
  exploring) are NOT re-measured.

## Code facts verified before this prereg (all read 2026-11-10)

### The scholar-side check (what knowledge-b used)

- `pantryItemKnown(p)` (`src/js/game.js:48516`): plants gate on
  `plantKnown(pid)` = scholar/codex `canShow('plant', pid, 'name')`;
  monster meat (`meat_<mid>`) gates on NAMING (`codex.monsters[mid]
  .villageName` or `systemArrived`); items with no plantId (staples,
  generics) and non-plant plantIds always known. Comment at :48516:
  "Villager knowledge alone does NOT reveal."
- The single knowledge-b exception proves the split: seed 170217 day 6, a
  villager drew cooked `meat_hushwolf` while `pantryItemKnown` said
  unknown — the meat was village-known-safe but the monster was not yet
  NAMED.

### The villager-side check (this arm's revision)

- PLANTS — per-eater: `plantKnownBy(vid, pid)` (`src/js/game.js:48768`)
  is the union of `v.familiar[vid]` (home-region background),
  `v.taught[vid]` (learned in-run) and `v.plantKnowledge[vid]`
  (occupation background). Villager plant knowledge is BINARY.
- MONSTER MEAT — village verdict, not per-eater: `monsterFoodSafe(mid)`
  (`src/js/game.js:48532`) reads `state.codex.monsters[mid].foodSafe`,
  the village-level safety verdict written by cautious testing
  (`markMonsterFoodSafe`). There is NO per-villager monster-food-safety
  store (knowledge-b prereg confirmed: no `monsterKnowledge` /
  `knownMonsters` in `src/js/`). So the meat leg of the villager-side
  check is the village verdict — the revision vs scholar-side is
  naming-gate → safety-verdict, not scholar → eater. Recorded honestly,
  not fudged into a per-eater claim.
- ANIMAL MEAT — always known: `mapmemFoodKnown`
  (`src/js/villager-mapmem.js:164-172`): "Animals are known food (no gate
  on animal meat — carcassToMeat only gates monster flesh). Monster meat
  needs the village to have marked it food-safe."
- `belltoad_legs` is a gated monster part (`monsterMeatGated`,
  game.js:46524 note): judged via `monsterFoodSafe('belltoad_legs')`.
- Revised check, per drawn item for eater `vid`:
  - no `plantId` → known (staple/generic).
  - `meat_<mid>` where `mid` is in `data.monsters` or `mid ===
    'belltoad_legs'` → known iff `monsterFoodSafe(mid)`.
  - `meat_<aid>` where `aid` is an animal (in `data.animals`, not a
    monster) → known.
  - `meat_unknown` (hauled flesh from a corpse with no monsterId,
    `villager-mapmem.js:514`) → known = false — it is definitionally
    unknown flesh, with no identity a verdict could attach to.
  - Any other `meat_<mid>` matching neither `data.monsters` nor
    `data.animals` (e.g. `meat_human`, `corruption.js:199`) → known iff
    `monsterFoodSafe(mid)` (false when the village holds no safety
    verdict for it).
  - `plantId` in `data.plants` → known iff `plantKnownBy(vid, pid)`.
  - `plantId` not in `data.plants` (tools, keepsakes) → known.
  - Any check throwing, or a needed function missing → `'error'` (counts
    against GO bar item 7, never silently treated as known).
  - Draws outside a villager meal have no eater (`pantryDraw` called for
    the scholar's own meals, feast draws, theft): the villager-side check
    is not called for them and `knownVillager` is `null` (not applicable),
    never `'error'`. Only villager-meal draws enter the rate.

### The meal paths (where a villager can meet unknown food)

- `villagerMealDay(vid, ...)` (`src/js/game.js:31498`): one villager's
  whole day of eating. Own production first (`villagerDayProduction`,
  `src/js/game.js:30832` — a SCALAR kcal, no plant identity, no
  known/unknown choice possible), then stores: at home `pantryDraw(v,
  dayWant, {cook:true, exposure, round:'floor1'})`; away `packMeal(vid,
  dayWant, exposure)`. Desperation: if the fresh draw falls short,
  `drawSpoiled` (see below).
- `pantryDraw(v, want, opts)` (`src/js/game.js:30256`): fresh-first /
  best-fit over items with `kcalEach > 0`. "Knowledge gating untouched:
  unknown flesh (kcalEach 0) never reaches this sort" (header comment).
  `opts.cook` applies the village cooking abstraction (rawKcal transform;
  cleaned meat valued at cleaned kcal; monster-gated meat flipped
  `cooked=true`). Returns `{taken, items:[{item, units, effectiveKcal,
  cooked}]}`.
- `drawSpoiled(v, want, exposure)` (`src/js/game.js:30531`): desperation
  — spoiled stacks eaten rather than starve. Draws ONLY items with
  `kcalEach > 0` AND `isSpoiled(item)` (`ke <= 0` skipped). Unknown
  flesh (kcalEach 0) can NEVER be drawn even in desperation — by
  construction, to be confirmed by count.
- `packMeal(vid, want, exposure)` (`src/js/game.js:30551`): away villagers
  eat from their packs. The pack is a kcal scalar (`p.kcal`), seeded at
  dawn from REAL pantry items via `packKcal` (`src/js/game.js:4195`,
  which calls `pantryDraw(v, want, {cook:false, exposure:risks})`), plus
  a meal-time top-up that is itself a `pantryDraw`. So away eating is
  traceable to pantry draws (the pack-seeding draws), but the away meal
  itself has no item identity — the instrument flags pack-seeding draws
  (`packSeed`) and counts away-meal kcal separately.
- Own production → pantry surplus (`stockSurplus`, scalar kcal): no
  identity anywhere in the production chain. UNMEASURABLE-BY-CONSTRUCTION
  (no known/unknown choice exists to count) — recorded with this reason,
  never proxied.

### Unknown-food encounters — the behaviors that exist

- TEST — `villagerExperimentBeat(present)` (`src/js/game.js:19321`):
  once per day, presence-gated (`if (!present) return` — "the story waits
  until you're there to witness it"; called from `villageLives`,
  game.js:28844, with `present = playerAtHaven()`). Target: an unknown
  plant lump in the camp stash (scholar-unknown per `plantKnown`), else
  unknown raw meat — inventory first, then pantry, then the prep counter
  (cleaned/cooked monster flesh only). Meat urgency: flesh spoiling by
  tomorrow jumps the plant queue. Tester: someone at haven with food in
  their background, else anyone. Plant verdicts: safe / cook / caution /
  avoid (avoid hurts the tester 10 HP, `hurtVillager(tester, 10,
  'experiment')`); meat verdicts: toxic → poison verdict + 15 HP hurt,
  else `markMonsterFoodSafe(mid, 'tested')`. Verdicts land in
  `sharedKnowledge[pid].tested` (+ `testedBy`) and
  `codex.monsters[mid].foodTested` / `foodSafe` (+ `foodTestedBy`).
  Known-poison flesh is skipped (`monsterFoodPoisoned`).
- COOK — the village cooking abstraction inside `pantryDraw` (cook
  transform on drawn items) and the batch cook path
  (`src/js/food.js:3224`, skips unknown monster meat). Unknown flesh
  never reaches either: it is never drawn, and the batch path skips it.
  The instrument records the `cooked` flag on drawn items.
- EAT — the only villager eating of unknown food is the experiment
  beat's cautious taste (a smallest taste, honest risk). No other
  villager eat verb takes unknown food: pantry draws filter on kcal,
  `drawSpoiled` filters on kcal, packs are seeded from pantry draws.
- IGNORE — unknown flesh sits in the pantry at 0 kcal until it spoils
  and is thrown out (knowledge-b evidence: "The village threw out
  spoiled stores: Unknown flesh."). The instrument counts unknown-flesh
  items present at the daily snapshot and thrown-out say lines.
- HAUL (context, not re-measured) — unrevealed flesh is hauled home as
  0-kcal testable items (`expeditionReturn`, villager-agency.js:673):
  transport, not consumption.

## Legs (all on band 170225–170232, competent, 100d max, death-aware)

- **Leg 0 — smoke (1 seed, 30d, MODE=on).** Instrument installs, no crash,
  per-seed JSON written with all sections present.
- **Leg 1 — pilot (8 seeds, 100d, MODE=on).** The villager-side capture.
- **Leg 2 — neutrality (3 proof seeds 170225–170227, 30d, MODE=on vs
  MODE=off).** End-state digest (day, roster alive, pantry kcal,
  standing, wave unlocked, won/over) byte-identical with the instrument
  on vs off — the instrument observes, it does not steer. Run inside the
  proof test, not as a judged sweep.
- **Leg 3 — determinism (same 3 proof seeds, 30d, MODE=on twice).**
  Per-seed event tables byte-identical across repeat runs (modulo the
  run label, which differs by construction — see Metric review).

## Binding metrics (reported, not gated — M-values are findings)

- M1 (primary): villager-side known-edible share of drawn pantry items
  in villager meals (home draws + pack-seeding draws + top-up draws),
  judged by the revised check above; scholar-side rate
  (`pantryItemKnown`) computed on the SAME draws for the direct delta.
  Draws where `vid === Game.villagerId` (the scholar, if any reach
  `villagerMealDay`) are excluded from the villager rate and counted in a
  separate scholar bucket.
- M2: unknown flesh draws 0 kcal villager-side — count of drawn items
  with `effectiveKcal <= 0` (expect 0); count of unknown-flesh items
  present in the pantry at daily snapshot, never drawn.
- M3 (encounters): `villagerExperimentBeat` fires per seed, split by
  target kind (plant lump / meat) and verdict (safe / cook / caution /
  avoid / poison), with tester-hurt evidence from say lines;
  `drawSpoiled` desperation draws (count + villager-side known-status of
  drawn spoiled items); `packMeal` away meals (count + kcal eaten from
  packs) with their pack-seeding draws judged villager-side; `cooked`
  flag on drawn items (cooked-known vs cooked-unknown); thrown-out
  spoiled-stores say lines; own production kcal total (context, identity
  unmeasurable — see above).
- M4 (wall, every run): national / table / wins, wave reach 1–5, median
  + max survival, death-cause shares (`state.village.fallen`).

## GO bar (instrument validity + a valid villager-side rate)

**GO** iff ALL of the following hold:

1. The instrument runs to completion on every pilot seed (8/8 per-seed
   JSONs written, no seed crash, no missing section — food, experiment,
   spoiled, pack, snapshot-unknown, wall).
2. **0 instrument errors** across all 8 seeds
   (`instrumentErrors.length === 0` in every per-seed file).
3. **Capture completeness**: every metric has a counted table OR an
   explicit `unmeasurable` marking WITH its reason (own-production
   identity). No metric is silently absent.
4. **Neutrality leg pass**: MODE=on vs MODE=off end-state digests
   identical on all 3 proof seeds.
5. **Determinism leg pass**: MODE=on repeat runs byte-identical on all 3
   proof seeds (modulo the run label).
6. **Proof test green**: `scripts/test-knowfood-a.js` passes, including
   recorder-validity fixtures that FAIL on broken fixtures (swapped
   known/unknown labels, dropped events) and ≥3 seeds per MEASUREMENT §5.
7. **Valid villager-side rate**: every drawn item in a villager meal
   carries a villager-side known boolean — `itemsErr === 0` on all 8
   pilot seeds (no `'error'` check results).

**NO-GO** if any of 1–7 fails. A NO-GO still publishes the partial capture
with the unmeasurable cells named — the blank is documented, not hidden.
M-values themselves are reported, never gated: a villager-side rate below
the scholar-side 99.9% is the finding (the eater knows less than the
scholar), not a failed bar.

## Seed-freshness record

- Chosen band 170225–170232 checked 2026-11-10 before this prereg:
  - `grep -rn -E '17022[5-9]|17023[0-2]' evidence/ --include='*prereg.md'`
    — NO hits (all dated preregs searched, per the skill).
  - `grep -rnw -E '17022[5-9]|17023[0-2]' evidence/ --include='*.md'`
    — NO hits (all dated evidence markdown searched).
  - `grep -rn '170225|...|170232'`
    `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/convergence-tracker.md`
    + `sim-findings.md` — NO hits.
  - `grep -rl -E '17022[5-9]|17023[0-2]'` over hidden_files: 10 hits,
    ALL false positives — decimal substrings inside long floats in old
    panel JSONs (e.g. `810.4191702259639` in
    `hidden_files/evidence/2026-11-08/medheadcount-a/.../cfb7111b....json`;
    `625.6115170227795` in
    `hidden_files/evidence/2026-10-30/journey-establishment-r63-seed331.json`),
    none of them a seed-band naming. Verified by printing match context
    (`grep -o -E '.{0,40}17022[5-9].{0,40}'`) on the hit files.
  - Forbidden bands avoided (named in the knowledge-b prereg and task
    brief): 160209–160216 (medcure), 170201–170208 (spawncensus/diplo),
    99101–99108 (secondlink), 96301–96308 (medicdiag/medicduty),
    58201–58208 (sicknessdiag), 95205–95208 (medchannel), 99201–99208
    (standacc), 170209–170216 (diplo confirm, named-not-spent),
    170217–170224 (knowledge-b pilot).
- Conclusion: **170225–170232 is fresh.** The 10 false-positive files are
  recorded here so the next worker does not re-litigate them.

## Comparison context (not judge)

- `sim-knowledge-b` (2026-11-10, band 170217–170224, GO on instrument
  validity): scholar-side FOOD rate 99.9% known-edible (1,698/1,699
  items); 1,372 villager pantry draws; `villagerExperimentBeat` 799
  fires; village plant knowledge 23–36 plants at day 100; tested
  verdicts 1–5 per village. The driver/instrument pattern this arm
  reuses (`scripts/knowledge-b-driver-20261110.js`,
  `scripts/knowledge-b-instrument-20261110.js`, `scripts/sim-harness.js`
  `loadGame`/`setupGame`/`runDays`, competent verbatim).

## Metric review note (pre-registered, for the evidence file)

- The GO bar deliberately gates on instrument validity + a VALID rate
  (item 7), not on the rate's VALUE: this is a FIRST-NUMBERS revision,
  and a villager-side rate below the scholar-side 99.9% is the finding
  Steve asked for, not a miss. If the pilot shows the revised check
  cannot separate known from unknown for some item class (e.g. a pantry
  item whose `plantId` matches neither `data.plants` nor `data.monsters`
  nor `data.animals`), that is recorded under "metric review" and the
  check is revised for the NEXT run — never re-scored within this run.
- Risk noted in advance: the meat leg of the villager-side check is a
  VILLAGE verdict (`monsterFoodSafe`), not a per-eater one — there is no
  per-villager monster-food-safety store to read. If the pilot shows meat
  dominating the unknown share, the split (plant per-eater vs meat
  village-verdict) is reported separately, not blended into one number.
- Risk noted in advance: `pantryDraw` is also called for the scholar's
  own meals, feast draws, theft, and pack seeding outside
  `villagerMealDay`. The instrument tags villager-meal draws by wrapping
  `villagerMealDay` with a reentrancy flag (and `packMeal` with a
  sub-flag for pack-seeding draws); draws outside a villager meal go in
  the `otherDraws` bucket and are excluded from the FOOD rate. Draws
  whose eater is the scholar (`vid === Game.villagerId`) are excluded
  into a scholar bucket even inside the flag. If the flag proves
  unreliable (e.g. a villager meal path that bypasses `villagerMealDay`),
  the FOOD rate is reported with the attribution caveat, not silently
  merged.
- Risk noted in advance: the experiment beat is presence-gated — it only
  fires when the scholar is at haven. Under the competent policy the
  scholar travels, so fires per seed may be far below knowledge-b's 799
  (which was measured the same way, so the comparison is apples-to-
  apples on the same driver shape). A low fire count is data about the
  presence gate, not an instrument failure.
- Determinism wording: repeat runs are "byte-identical" modulo the run
  label itself, which differs by construction between the two legs (as
  in knowledge-b). The proof test compares modulo the run label.
