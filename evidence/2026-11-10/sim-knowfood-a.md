# sim-knowfood-a — Knowledge FOOD, VILLAGER-SIDE rate revision (coverage program Tier 1 #3, B-review next blank #4)

- Run: `fleshout-loop-a-20261110T2215Z`, Loop A, arm `sim-knowfood-a`,
  worktree `~/workspace/worktrees/sim-knowfood-a`, branch `sim-knowfood-a`.
- Base: master `3daa1a9b6`. Prereg:
  `evidence/2026-11-10/sim-knowfood-a-prereg.md` (written BEFORE any judged
  sims). Band **170225–170232** (8 seeds, fresh — see prereg seed-freshness
  record; the 10 hidden-files hits were decimal-substring false positives
  in old panel JSONs, verified by match context). Horizon **100d max,
  death-aware**. Policy: `scripts/policies/competent` verbatim. No
  game-code change — MEASUREMENT ONLY. Zero `src/js`.
- Instrument: `scripts/knowfood-a-instrument-20261110.js` (method wraps,
  daily snapshots, before/after diff attribution for the experiment beat
  and the desperation draw). Driver:
  `scripts/knowfood-a-driver-20261110.js`. Analyzer:
  `scripts/knowfood-a-analyze-20261110.js` (pure, deterministic).
  Proof: `scripts/test-knowfood-a.js` — **62/62 PASS** (known-check
  fixtures per item class, recorder-validity fixtures incl. swapped-label
  and dropped-event fixtures, determinism + neutrality sim legs on seeds
  170225–170227, 30d).
- Corpus: `evidence/2026-11-10/perseed-knowfood-a/` —
  `knowfood-a-s<seed>-knowfood-a-pilot-on.json` (8 pilot files) plus
  `knowfood-a-proof-*` files (determinism/neutrality legs) and one smoke
  file (`knowfood-a-smoke`, seed 170225, 30d).

## Verdict: GO (on instrument validity + a valid villager-side rate)

Judged STRICTLY against the prereg GO bar (M-values reported, never gated):

1. Instrument ran to completion on every pilot seed: **8/8 per-seed JSONs**,
   no seed crash, no missing section (food, experiment, spoiled, pack,
   snapshot-unknown, wall). PASS.
2. **0 instrument errors** across all 8 seeds. PASS.
3. Capture completeness: every metric has a counted table; the one
   unmeasurable (own-production identity) is marked
   UNMEASURABLE-BY-CONSTRUCTION with its reason (production is a scalar
   kcal — no plant identity exists anywhere in the chain). PASS.
4. Neutrality leg: MODE=on vs MODE=off end-state digests identical on all
   3 proof seeds. PASS.
5. Determinism leg: MODE=on repeat runs identical on all 3 proof seeds
   (modulo the run label, which differs by construction). PASS.
6. Proof test green: `scripts/test-knowfood-a.js` 62/62. PASS.
7. **Valid villager-side rate**: every drawn item in a villager meal
   carries a villager-side known boolean — `itemsErrV === 0` on all 8
   pilot seeds (and `itemsErrS === 0` scholar-side). PASS.

**GO.** The villager-side numbers below are the deliverable. Convergence
state: this is a measurement arm, not a tuning lever — no convergence line
applies; Tier 1 #3 FOOD is now measured villager-side, pending the
follow-up items in Metric review.

## The headline, in plain words

Villagers eat what the village serves, and the village serves what the
scholar knows — not what the eater knows. On the same 1,617 drawn items,
the scholar-side rate is 100% and the villager-side rate is 96.7%: 54
items went to eaters who did not know the plant they were eating. The
whole gap is plants, never meat — unknown meat still cannot be eaten,
because it carries no calories at all, and it never reaches a mouth even
when the village is desperate. What villagers DO with food they don't
know is test it, once, at the fire, in front of everyone — and mostly
there is nothing left to test, because the testing happens early and the
unknowns run out. The village is careful with meat and casual with
plants: a man can eat burdock he has never heard of for six days running
and never once learn its name from eating it.

## Per-metric numbers (8 seeds, 100d, competent, band 170225–170232)

### M1 — villager-side known-edible rate (PRIMARY): 96.7%, scholar-side 100% on the same draws

- Villager meal draws: **1,257** (1,617 drawn items).
- Items known-to-eater: **1,563** · unknown-to-eater: **54** · check
  errors: **0** → **96.7% known**.
- SAME draws judged scholar-side (`pantryItemKnown`): known **1,617** ·
  unknown **0** → **100%**.
- Draws containing an item unknown to the eater: **53 of 1,257 (4.2%)**.
- Per-seed villager-side rate: 91.2% (170225) · 96.7% (170226) · 100%
  (170227) · 93.1% (170228) · 99.6% (170229) · 93.8% (170230) · 100%
  (170231) · 100% (170232).
- Unknown-to-eater items drawn, by id (units): **burdock 206, blackberry
  64, purslane 8, muscadine 5** — all plants, zero meat. 15 distinct
  eaters drew unknown food; one eater drew it 12 times.
- Scholar-bucket draws excluded from the villager rate: **0** —
  `villagerMealDay` is never called for the scholar, so the guard never
  triggered (recorded, not assumed).

What the numbers mean: the 3.3-point gap is the whole revision. The
scholar-side 99.9% from knowledge-b understated the split in the other
direction — on this band the scholar knows everything drawn (100%) while
the eater does not. The gap is a PLANT gap only: meat is judged by the
village safety verdict, and any meat with calories in the pantry has
already been revealed, so no meat can ever be unknown-to-eater at the
draw. Plants are judged per eater, and the pantry fills with plants the
scholar identified (by testing, trade, or teaching) faster than the
village learns them — so the eater is served food whose name they never
learned. And eating teaches nothing: burdock was drawn unknown to the
same two eaters on seed 170225 for six straight days (d66–71, Tashi
Sherpa and Ivy Wang), blackberry the same way on other seeds — the meal
is not a learning channel. The unknown draws cluster LATE (days 62–98):
early on, familiar/taught covers the pantry; late, the pantry outruns
the village's learning.

### M2 — unknown flesh still draws 0 kcal villager-side: YES, confirmed

- Drawn items with 0 kcal: **0 of 1,617** — `pantryDraw` filters on
  `kcalEach > 0`, and the filter is knowledge-blind (it never asks what
  anyone knows), so it holds villager-side exactly as it held
  scholar-side.
- Unknown flesh present in the pantry at daily snapshot (never drawn):
  max 1–4 items per seed (up to 33 units on seed 170232); mean
  0.04–5.61 units per snapshot; 0–2 items still sitting there at the end
  of the run. It arrives, it waits, it is tested or it rots — it is
  never eaten.
- Thrown-out spoiled-stores say lines: **25** (first-month capped sample
  only — see Metric review; the count is a floor, not a total).

### M3 — unknown-food encounters: test / cook / eat / ignore

- **TEST — `villagerExperimentBeat`: 749 calls, 115 actual tests.**
  Outcomes: tested 115 · no-target 626 · not-present 8. By target kind:
  plant 34 · meat 81. By verdict: safe 103 · cook 7 · poison 3 · avoid 1
  · caution 1. Sick-tester say lines (first-month sample): 2.
  "It's food" safe verdicts voiced (first-month sample): 51.
- **COOK — 71 cooked draws, all known-to-eater, 0 unknown.** Unknown
  food never reaches the village cook transform (`pantryDraw` cook path)
  because it is never drawn; the batch cook path skips unknown monster
  meat by construction (food.js:3224, not re-measured — scholar-side).
- **EAT — the only villager eating of unknown food is the experiment
  beat's smallest taste.** No other eat verb takes unknown food: pantry
  draws filter on kcal, `drawSpoiled` filters on kcal, packs are seeded
  from pantry draws. The cautious taste is the single exception, and it
  is honest about the risk (10 HP for a bad plant, 15 HP for poison
  flesh).
- **DESPERATION — `drawSpoiled`: 19 calls, 0 candidates, 0 eaten.** The
  desperation path fired 19 times and found nothing to eat: no spoiled
  edible item existed at those moments. Desperation eating of unknown
  food is doubly impossible — unknown flesh has no calories to draw,
  and the spoiled shelf was empty when the village reached for it.
  Desperation say lines: 0.
- **PACKS (away eating) — 580 pack meals, 257,503 kcal from packs;
  pack-seeded draws 97.0% known-to-eater** (754 known / 23 unknown /
  0 errors over 594 pack-seeded draw rows). Away eating inherits the
  pantry's knowledge profile: the pack is seeded from real pantry draws,
  so the same 3% plant gap rides along in the ration. The away meal
  itself has no item identity (the pack is a kcal scalar), so the
  seeding draws are the honest proxy — recorded as such, not fudged.
- **IGNORE — see M2.** Unknown flesh sits at 0 kcal until tested or
  thrown out. Own production: **13,240,673 kcal over 5,960
  villager-days** — scalar, no identity, UNMEASURABLE-BY-CONSTRUCTION
  (no known/unknown choice exists in the production chain).

### M4 — correction to a knowledge-b number (read before citing it)

Knowledge-b reported "`villagerExperimentBeat` fired 799 times". Its
instrument recorded one row per CALL, so 799 was calls, not tests. This
arm separates the two for the first time: **749 calls, 115 tests** on a
comparable corpus (8 seeds × ~94 days avg vs 8 × 100). The beat is
called once a day, every day, like clockwork — and it only actually
tests something on ~15% of days, because on the other 85% there is
nothing unknown left in the stash, pantry, or counter to test (626
no-target), or the scholar is away (8 not-present). The testing habit is
real but thin: the village runs out of unknowns fast, then the beat
idles. (The 749-vs-799 call difference is the shorter corpus — seed
170231's village died at day 55 — not a behavior change.)

## Sense-testing — four unknown-food moments, read as people

1. **The man who ate the wrong tree (s170225 d3).** "A man, maybe 40s,
   with a buzz cut spends the afternoon with the small tree with
   mitten-shaped leaves (three shapes), spicy root smell — look, smell,
   the smallest taste, then waiting. By evening a man, maybe 40s, with a
   buzz cut is thoroughly, educationally sick. 'NOT food,' they announce
   to the fire, pale. 'My body told me so.' The lesson is learned the
   hard way — and now the whole village knows it." Then the Journal
   writes it down: "Sassafras — NOT food. (A man, maybe 40s, with a
   buzz cut tested it.)" The protocol is honest end to end: the tester
   is named by description, never by a true name he hasn't earned; the
   sickness is the price; the verdict travels to the whole village the
   same day. This is the one avoid verdict in the corpus, and it reads
   like the system working exactly as designed.
2. **The poison that had a name (s170226 d11).** "Berna sets aside time
   with Choir Toad flesh. Look, smell, touch — then the smallest taste,
   and wait. Their tongue goes numb. Their stomach heaves. 'NOT food,'
   they gasp. 'Poison.' The Codex notes it in grim letters. You will not
   make this mistake twice — Berna already made it for you." One of
   three poison verdicts. The line does what the mechanic needs: the
   poison is now village knowledge, bought with one person's afternoon.
   Against it, the same day's other test: "Berna sets aside time with
   the something flesh" — the monster unnamed, so the flesh is "the
   something flesh". Awkward to read, honest about the state: the
   villager genuinely does not know what she is tasting, and the game
   refuses to pretend otherwise.
3. **The meat that comes home labeled (s170225 d9–d21).** "🥩 Devon is
   back with strange meat: unknown flesh in the pantry. 'Test it
   cautiously before anyone eats.'" Then Anthony, the same day: "sets
   aside time with Flashbulb Moth flesh... 'It's food,' Anthony tells
   the fire. 'You know it in your gut. Literally.'" The haul-to-test
   pipeline reads as a complete human story: someone brings home a
   thing nobody can name, someone else risks a taste, the village eats.
   The same shape repeats for Hummice and Hushpuppy flesh. The
   knowledge law holds in the prose, not just the code.
4. **The burdock eaters (s170225 d66–71).** No line announces it — that
   is the point. Tashi Sherpa and Ivy Wang eat burdock for six straight
   days, a plant neither of them knows, and nobody says a word, because
   nobody in the village knows they don't know it. The pantry serves
   what the scholar identified; the eater's ignorance is invisible to
   everyone including the eater. The numbers caught what the story
   cannot: a quiet, systematic gap where the village feeds people food
   they cannot name, and the meal teaches them nothing.

One more voice worth recording, because it shows the seam: the
scholar's own foraging — "A shot in the dark — you take what's green:
4× unknown nuts, 4× unknown shoots, 3× unknown roots. Into the bag,
unnamed. (Not food until identified — sort them at camp.)" The player
is told, plainly, that unknown is not food until identified. The
villager eating burdock gets no such warning, because the pantry has
already decided for them.

## Village assessment (plain words)

Eight villages, seven lived the full hundred days. Nobody won, nobody
reached national, nobody sat at the table — the scale wall stands
exactly where the last runs left it (see Wall numbers). No seed unlocked
wave 5 this time (knowledge-b had 2/8); all eight stopped at wave 4.
People died mostly out in the wild (57 of 86 deaths) and to monsters
(12) — the village itself held, and the pantry held: seed 170231's
village died with 57,000 kcal in the pantry.

What these villages looked like, through the food-knowledge lens: they
are careful about meat and casual about plants. Unknown meat is handled
with real discipline — hauled home labeled, tested once by one person
at the fire, eaten only after the verdict, thrown out when it rots.
Unknown plants get no such ceremony: the pantry serves them to whoever
is hungry, the eater never learns the name, and the gap persists for
weeks. The village knows its food at the level of the scholar, not at
the level of the person eating it — 96.7% at the eater's hands against
100% at the scholar's. The blank this run fills is the revision itself:
the villager-side rate, the encounter table, and the correction that the
experiment beat tests on ~15% of days, not every day.

Seed 170231 deserves its own line: the village lost at day 55 with a
full pantry (57,099 kcal) and a roster that collapsed 12 → 0 in four
days, eight of the deaths "the wild" on days 52–55. It did not starve;
it bled out outside. Food knowledge was not its problem — going outside
was.

## Wall numbers (every run)

- Won: **0/8** · national: **0** · table: **0** · max wave reached: **4**
  (0 seeds unlocked wave 5; all 8 stopped at wave 4).
- Survival: median **100d**, max **101d** — 7/8 villages alive at the
  100d horizon (median = horizon cap, not a death distribution); seed
  170231 lost at day 55.
- Standing at day 100: **199 on six seeds** (170225–170230) — the same
  plateau knowledge-b saw on 5/8 seeds, repeated STRONGER on a fresh band
  (6/8); then 175 (170231, lost), 150 (170232). The 199 plateau is now
  a twice-observed pattern, not a one-band coincidence.
- Deaths: **86 total** — the wild 57 (66.3%), monster 12 (14.0%), Gavel
  3, a wound that wouldn't close 3, the arena 2, ambush 2, contest 1,
  sickness 1, Big Big 1, a stranger 1, dehydration 1, Loud-Eyes 1,
  combat 1.
- Wave reach 1–5: W1–W4 on all 8 seeds; W5 unlocked on 0/8.

Per-seed table (from the analyzer):

| seed | days | end | wave | standing | villager known% | scholar known% | draws | beats fired | spoiled eaten | pack kcal | errors |
|---:|---:|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 170225 | 100 | survived | 4 | 199 | 91.2 | 100 | 211 | 13 | 0 | 45100 | 0 |
| 170226 | 100 | survived | 4 | 199 | 96.7 | 100 | 185 | 17 | 0 | 43987 | 0 |
| 170227 | 100 | survived | 4 | 199 | 100 | 100 | 152 | 19 | 0 | 32521 | 0 |
| 170228 | 101 | survived | 4 | 199 | 93.1 | 100 | 92 | 12 | 0 | 21447 | 0 |
| 170229 | 101 | survived | 4 | 199 | 99.6 | 100 | 174 | 15 | 0 | 37453 | 0 |
| 170230 | 100 | survived | 4 | 199 | 93.8 | 100 | 167 | 16 | 0 | 37764 | 0 |
| 170231 | 55 | village-lost | 4 | 175 | 100 | 100 | 141 | 8 | 0 | 11358 | 0 |
| 170232 | 100 | survived | 4 | 150 | 100 | 100 | 135 | 15 | 0 | 27871 | 0 |

## Metric review

- **The villager-side rate is 96.7%, not 99.9%.** The knowledge-b 99.9%
  was the scholar-known rate on a different band; on this band the
  scholar-side rate on the same draws is 100% and the villager-side
  rate is 96.7%. The two numbers answer different questions (what the
  scholar knows vs what the eater knows) and must not be quoted
  interchangeably. No metric was moved mid-run: the prereg's revised
  check is exactly what ran.
- **Meat leg is a village verdict, not a per-eater one.** There is no
  per-villager monster-food-safety store to read, so the meat leg of the
  villager-side check is `monsterFoodSafe` (village verdict). In
  practice the distinction did not matter for the rate: zero meat items
  were unknown-to-eater, because any meat with calories in the pantry
  has already been revealed. The plant leg is genuinely per-eater and
  carries the whole 3.3-point gap. If a future run finds meat dominating
  the unknown share, the split must be reported separately, not blended.
- **Say-line counts are first-month floors, not corpus totals.** The
  driver's say-line capture caps at 400 kept lines per seed, and the
  cap fills by day ~25–31 (sayCount 6,556–12,546 per seed vs 400 kept).
  Counts derived from kept lines (thrown-out 25, sick-tester 2, "It's
  food" 51, desperation 0) cover only the first month and undercount the
  100-day run. The instrument event counts (draws, beats, spoiled,
  pack meals) are NOT capped and are the true totals. A later run that
  wants voice totals needs a per-kind counter in the instrument, not a
  bigger cap.
- **Duplicated say lines in extraction were my script, not the game.**
  An early extraction printed identical experiment lines 2–3× because
  the line matched several regexes at once; the per-seed files hold each
  line once, and the instrument's beat record confirms one test per day.
  The one real repetition in the corpus — "This patch is worked out —
  step to another green patch and forage again." appearing twice on the
  same day, every few days — is the game saying the line twice (two
  foragers, or one action narrated twice) and goes to the backlog as an
  observation.
- **"Draws" vs "items".** The 1,257 draws hold 1,617 items; the rate is
  computed over items (a draw of a 9-unit burdock stack is 9 units of
  unknown food, not one). The per-seed table's "draws" column counts
  draw rows. Pack-seeded draws (594 rows) are a subset of the 1,257,
  not additional draws.
- **"No-target" dominates the beat.** 626 of 749 beat calls found
  nothing unknown to test. That is not an instrument failure — the beat
  scans stash, inventory, pantry, and counter for unknown items, and
  most days there simply are none. The village tests its unknowns early
  and then the beat idles; the 115 tests cluster in the first weeks.
- **The 199 standing plateau repeats, stronger.** Six seeds at exactly
  199 at day 100, on a fresh band, after knowledge-b saw 5/8. It smells
  like a stage boundary, not a coincidence — carried forward as a
  backlog observation, not a claim.
- **No metric was moved mid-run.** The GO bar was judged exactly as
  pre-registered. One instrument fix landed between the first proof run
  and the pilot (see below) — it changed error attribution, not any
  metric: draws outside a villager meal have no eater, so their
  villager-side check is `null` (not applicable) instead of `'error'`.
  The prereg was amended with that rule before any judged sim ran (the
  proof legs are not judged), and the proof test was re-run green
  (62/62) after the fix. The fix is recorded here, not hidden.

## Findings for the backlog (appended to sim-findings.md separately)

- Standing plateau at exactly 199 on 6/8 seeds at day 100 — repeated on
  a fresh band after knowledge-b saw 5/8 (stage boundary or cap worth a
  look).
- Eating teaches nothing: villagers draw the same unknown plant for
  days (burdock 6 straight days, two eaters, seed 170225) and never learn
  it from the meal — the pantry serves scholar-known food to eaters who
  don't know it, and no learning channel fires on eating.
- The experiment beat's plant scan is scholar-gated (`plantKnown`):
  plants the scholar knows but villagers don't are never tested by the
  beat — the beat can only teach what the scholar hasn't identified.
- "This patch is worked out" say line repeats twice on the same day,
  every few days (two foragers or one action narrated twice).
- Seed 170231: village lost at day 55 with 57,099 kcal in the pantry —
  roster collapsed 12 → 0 in four days, eight deaths "the wild". A
  village that starves of people, not food.
- Knowledge-b correction: its "799 experiment-beat fires" were calls,
  not tests — actual tests were never counted before this run (115 of
  749 calls here).
