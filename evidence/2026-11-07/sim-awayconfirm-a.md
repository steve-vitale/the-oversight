# sim-awayconfirm-a — CASE-COUNT-SIZED CONFIRM for away-ration harm (measurement only)

Run: oversight-flesh-out-loop, adoption run fleshout-20261107T1415Z (adopted
from run fleshout-20261107T1205Z, which timed out), arm sim-awayconfirm-a,
axis food-economy. Worker tree: ~/workspace/worktrees/sim-awayconfirm-a,
branch sim-awayconfirm-a, base c92a873f4 (see substrate note in the prereg —
two commits behind master tip 794adcb8a, evidence + instruments only, zero
src/js; the coordinator rebases at landing; sim behavior identical on either
base). DIAG/CONFIRM ONLY: zero src/js game changes. No away-ration fix is
built here; that is a LATER run's arm (confirm-first rule, backlog #953/#961,
tracker prerequisite (1)). This run MEASURES the harm; it does not build the
fix. The away-voice blank stays open pending this confirm.

Preregistration (binding per MEASUREMENT.md §14):
evidence/2026-11-07/sim-awayconfirm-a-prereg.md — competent policy only,
150d death-aware, fresh seed band 98000–98099 in 25-seed batches
B1 98000–98024 / B2 98025–98049 / B3 98050–98074 / B4 98075–98099, stop at
the first batch boundary with cumulative n >= 8 full-pantry villager
starvation deaths (pantryKcal >= 8000 AND freshDays >= 3.0), hard cap 100
seeds. CONFIRM-GO iff n >= 8 AND shareA >= 0.80 AND every named mechanism
with count > 0 has count >= 2 and >= 1 quoted case; n < 8 at the cap is
NO-GO-on-sample.

Adoption note: the cancelled worker left B1 fully swept (25 per-seed files)
and B2 partially (seeds 98025–98027), plus the prereg, the four instrument
scripts, and the corpus dir, all uncommitted. This worker verified all 28
existing per-seed files against the runner's own check logic (seed/policy/
env/daysAlive/rows/dedupe — all passed, cumulative n = 0 at adoption), then
ran `bash scripts/run-awayconfirm-a.sh`, which re-runs a full batch on retry
by design (the harness is deterministic; re-running completed seeds cannot
change the corpus — leg E proves it). B1 re-ran clean, B2–B4 ran to
completion, every batch VERIFY OK on attempt 1. Total sweep wall time
~44.7 min (100 seeds, ~2.5s sim each plus harness load).

## Results

VERDICT-RENDERED: NO-GO (NO-GO-on-sample) — pooled deaths from THIS RUN ONLY: n = 0 full-pantry villager starvation deaths on 100 fresh seeds (B1 0, B2 0, B3 0, B4 0); the stopping rule (n >= 8 at a batch boundary) never fired and the run went to the 100-seed hard cap. CONFIRM-GO requires n >= 8 AND shareA >= 0.80 AND every named mechanism >= 2 cases + quoted; with n = 0 there is no share to judge. The diag-b claim (3/3 away, GO-small-sample) and the casecount claim (8/8 away) are neither confirmed nor refuted by this run — the harm, if it exists at all, is too rare at this scale to price a fix on. This is the honest answer the prereg anticipated: at the casecount rate (~1 case per 8 seeds) 100 seeds should have yielded ~12 cases; it yielded zero.

Judged numbers (this run only, competent, 150d, seeds 98000–98099):

| Metric | Value |
|---|---|
| Full-pantry villager starvation deaths n | 0 / 100 seeds (B1 0, B2 0, B3 0, B4 0) |
| Attribution A / B / C | 0 / 0 / 0 (denominator 0; shareA n/a) |
| kcal-only context (kcal gate met, fresh missed) | 0 |
| Total villager starvation deaths | 35 (all with pantryKcal = 0, freshDays = 0) |
| Player starvation deaths | 3 (2 empty-pantry; 1 full-pantry, see Sense) |
| Meal adequacy (ate >= 0.6 * need) | haven 48,533/49,336 (0.984); away 28,546/28,674 (0.996) |
| Meal-row dedupe (replaced duplicates) | 141 across 100 seeds |
| Median survival | 92d; max 150d |
| Wave reach | wave 3: 6, wave 4: 85, wave 5: 9 |
| National / table / wins | 0 / 0 / 0 (of 100; competent-only, expected) |
| C1 freshness scan | 43,058 JSON files, 0 collisions |
| Proof test | scripts/test-awayconfirm-a.js PASS 43 legs (incl. live leg E) |

The zero is not a thin zero. The full-pantry state was the COMMON state:
across 10,035 village-days, the pantry held >= 8,000 kcal on 75.4% of days
and met the full-pantry gate (kcal + fresh) on 71.1% (7,130 days). Villages
spent most of their lives with a full, fresh pantry — and in all that time,
not one villager starved with one. And every one of the 35 villager
starvation deaths happened with the pantry at EXACTLY zero kcal and zero
fresh days (median 0, max 0). Starvation in this corpus is genuine
scarcity, not mis-distribution: there was nothing to distribute.

Death-cause shares, pooled (1,478 deaths): the wild 812, monster 277,
sickness 58, a wound that wouldn't close 57, the arena 47, starvation 38
(35 villager + 3 player), ambush 32, a stranger 29, combat 23, contest 23,
dehydration 18, the night 12, alien 9, gavel 7, buffering 3, the rest 1–2
each. Starvation is 2.6% of deaths; the wild and monsters are 73.7%.

### Balanced panel per §15 (attempted, known failure class)

`node scripts/balance-panel.js compare --before/--after <sweep-corpus
summary> --out /tmp/awayconfirm-panel` returns `invalid`: the panel
ingests panel.json.gz before/after outputs, not per-seed sweep corpora,
and this single-policy DIAG has no before/after comparison arm — the
recorder-row ingestion failure class, fourth sighting (incl. cover-b and
the 0630Z round). No compare .md exists to attach. Per the prereg §15
fallback, the analyzer's sweep-compare replication table below stands in
its place. A tooling failure never blocks or re-scores the verdict.

Sweep-compare replication table (this run vs the prior full-pantry runs):

| Run | Seeds | n (full-pantry) | shareA | Median survival | Wave 5 | National / wins |
|---|---|---|---|---|---|---|
| diag-b (2026-10-24) | 16 | 3 | 3/3 = 1.000 | 150d (capped) | 0 | 0 / 0 |
| confirm-b (2026-10-24) | 16 | 1 | 1/1 = 1.000 | 150d (capped) | — | 0 / 0 |
| casecount (2026-10-24) | 64 | 8 | 8/8 = 1.000 | — | 0/64 | 0 / 0 |
| **awayconfirm-a (this run)** | **100** | **0** | **n/a** | **92d** | **9/100** | **0 / 0** |

Pooled-with-prior-runs context ONLY (never the verdict): 12 full-pantry
deaths across diag-b + confirm-b + casecount, all 12 class A away-ration.
This run adds 0 cases on 100 fresh seeds — a rate break from ~1 case per
8 seeds (casecount) to 0 per 100. The prior signal has not replicated at
case-count scale on fresh seeds.

### Telemetry deviation check (loop-body step 10)

Ran `node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-07/awayconfirm-a-corpus/awayconfirm-a-competent-s*.json'
--metrics national,table,wins,exiled`. Three LOUD lines: national 12 -> 0,
table 16 -> 0, wins 16 -> 0 (n=100 files). VERDICT: EXPLAINED, regime
artifact — NOT a real bug, and the baseline was NOT rolled forward. The
baseline's own `_regime` note says it is the "winseat — full win-side win
stack, ~100%-win suite" (national 12/16, table 16/16, wins 16/16, with
FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
WINDEFER=1 SEATDRIVE=1, 180d) and warns: "DO NOT compare pre-seat /
courtship / readiness substrates against this baseline — wins are
structurally ~0 there and telemetry-check will fire a spurious LOUD 'wins
disappeared'." This run is a competent-only, PLENTYDEPRI=1 DEPOSITGATE=1,
150d diag with no win-stack flags — a pre-seat substrate by definition —
and the prereg's own WATCH section says competent-only runs are expected
to show 0 national/table. The casecount run hit the identical three LOUD
lines and reached the same verdict. Rolling this baseline forward would
overwrite a winseat regime baseline with a pre-seat diag reading.

## Metric review (post-run)

- The metric was the right one and it was judged as pre-registered: n >= 8
  AND shareA >= 0.80 AND every named mechanism >= 2 + quoted. No
  re-scoring happened; with n = 0 there was nothing to re-score against.
- The gate is conservative by design (death-day pantry read is a post-meal
  lower bound), which makes the zero stronger, not weaker: even with a
  conservative gate, the full-pantry state was present on 71% of
  village-days and produced zero deaths.
- The sample-size story flipped vs the prereg's expectation. The prereg
  sized 100 seeds expecting ~6–12 cases at the casecount rate; the observed
  rate is 0/100. Either the casecount rate was a hot streak on its band
  (94601–94664), or the rate is genuinely this low and the earlier
  12-case pooled signal is a small-sample artifact of bands that happened
  to produce away deaths. A future confirm, if one is ever ordered, needs a
  different instrument (e.g. a targeted away-trip stressor) rather than
  more fresh seeds at this rate — 100 more seeds at 0/100 would still say
  nothing new. Proposed revision for the NEXT run, not this one: do not
  re-run this confirm shape.
- Away meal adequacy (0.996) EXCEEDS haven adequacy (0.984) across 78,010
  meal rows. Whatever is killing villagers away from home, it is not
  systematically short rations while food exists: when the pack has food,
  away villagers eat. The away-ration mechanism, as named, has no support
  at this scale.
- The one full-pantry starvation in the corpus is the PLAYER's (Harold,
  s98079 d12 — see Sense), which the prereg excludes from the sample. It
  shows the mechanism exists in the player's camp-wild path, but one
  out-of-sample player case cannot carry a villager fix.
- Meal-row dedupe fired 141 times across 100 seeds (replaced duplicates,
  last call wins). The instrument handled them and the analyzer's dedupe
  audit passed, but a second caller of villagerMealDay is worth a look
  (see Findings).
- Analyzer runtime note: the C1 scan took ~20 min (43,058 JSON files in a
  9.2G evidence tree). Future runs on this instrument should expect that;
  it is not a defect.

## Sense (SENSE-TESTING LAW)

Transcripts read, beats quoted — never just counts. No full-pantry villager
death exists to quote, so the sense work is on the deaths that DID happen:
the 35 empty-pantry starvations and the one full-pantry player starvation.
The narration and the meal records agree in every sampled case: people
starve when the food is gone, and the game says so plainly.

**Harold, the player, s98079 d12 — the only full-pantry starvation in the
corpus (out of sample, player excluded).** The village is fine: pantry
24,650 kcal, 44.5 fresh days, 4 items, 12 people, nobody hungry. Harold
starves anyway, on day 12. The day's narration gives the reason in one
line: *"You camp wild tonight — no pantry meal. Eat from your pack."*
alongside *"⚠ STARVING: health and energy falling. The spiral has
started."* and *"The System's gifts are hungry: -60 kcal metabolic
cost. Feed the power or lose it."* The player was out in the wild with an
empty pack while a full pantry sat at home — the away-ration harm in its
purest form, but in the PLAYER on day 12, not in a villager, and the death
ctx still records awayAtDeath=false (the ctx flag is a villager
travel-state record; the player's camp-wild night is not the same state).
Harold has no meal rows in the corpus at all — the meal wrapper records
villagerMealDay only, so the player's meals are invisible to this
instrument. Coherent, and a real gap in the instrument's coverage of the
player.

**Ivy, s98016 d82 — away villager starvation, pantry 0.** Ten days away,
eating 1,300–1,700 kcal a day from her pack against a 1,900 need, health
sliding 65 → 1, then d81 she eats 299 kcal, d82 she eats 20 and dies. The
game narrates it honestly: *"Ivy is away from the haven, hurt (health
1/100), and their pack is empty — nothing to eat out here. They walked
away from Haven and haven't come back."* The pack ran dry on a long trip
while the pantry was also empty — no ration rule could have saved her,
because there was nothing to ration.

**Leo, s98026 d77 — away villager starvation, pantry 0.** He eats well
away (1,635–2,378 kcal) until the last day, when the pack hits zero and he
eats 62 kcal at health 3: *"Leo is away from the haven, hurt (health
3/100), and their pack is empty — nothing to eat out here. They're still
out foraging — the trip isn't over yet."* The same day he discovers the
"buffering" counter and flees a monster outmatched
(`godpath_deed outmatched_escape`, monster "buffering", via vFlee) — a
wounded, hungry villager fleeing a fight he cannot win, then starving on
the same trip. The beats cohere: wound + empty pack + long trip.

**James, s98003 d80 — haven villager starvation, pantry 0.** The village
says it outright: *"No food in the pantry. The village is hungry. You
still get your 1L water."* and *"⚠ WARNING: reserves critical. Eat
tomorrow or the spiral begins."* His last meal is 286 kcal against a 2,100
need, health 5. The pantry held 3 items, all unknown-kcal-0 — food the
village could not even value. Nothing robotic here: the village knew it
was starving and said so.

What the transcripts do NOT show, anywhere in the sampled deaths: a
villager going hungry while food sits in the pantry. The haven-distribution
story (mechanism B) has no beat in this corpus at all.

## Village assessment in plain words

A hundred villages, all played by the same steady hand, lived a median of
92 days and died mostly the way villages die here: something in the wild
killed them (812 deaths), or a monster (277). Nine villages even reached
wave 5 — the deepest these competent runs have gone — but none got near
national standing, let alone the table or a win, which is exactly what
this kind of run is expected to show.

The food story is the blunt one. The pantries were usually full — seven
days in ten, the shelves held more than 8,000 calories of fresh food. And
yet 35 villagers starved. Every single one starved on a day the pantry
was bone-empty: zero calories, zero fresh days. They didn't starve because
the food was hoarded, or badly shared, or stuck in the wrong place. They
starved because the village had run out of food, full stop — after a bad
stretch, after the stores were eaten down to nothing, and then there was
nothing left to eat. The away-ration worry that started this run — that
villagers out on trips get short rations while the pantry sits full — did
not show up once in a hundred villages. When villagers were away and food
existed, they ate slightly better than the folks at home.

The one exception is the player himself: one man, Harold, starved on day
12 camped out in the wild with a full pantry back home, because out there
you eat what you carry and his pack was empty. That's a real thing the
game does to the player, and it's worth a look — but it's one man, not a
village pattern, and this run was measuring villagers.

So the village's blank is not "food is shared wrong." It's "food runs
out." The fix, if anyone builds one, is about making food — more of it,
kept longer — not about re-slicing the ration.

## Blanks filled or documented

- FILLED (measured): the away-ration harm does NOT confirm at case-count
  scale. n = 0 on 100 fresh seeds, with the full-pantry state present on
  71% of village-days. No fix is priced, no fix is built (confirm-first
  rule honored). The away-ration fix stays unbuilt; the away-voice blank
  stays open.
- DOCUMENTED: all 35 villager starvation deaths are empty-pantry deaths
  (pantry exactly 0). The binding food constraint in this corpus is
  production/storage shortfall, not distribution or ration sizing.
- DOCUMENTED: away meal adequacy (0.996) exceeds haven adequacy (0.984)
  over 78,010 meal rows — the away-ration mechanism has no support at
  this scale.
- DOCUMENTED: one player full-pantry starvation (Harold, s98079 d12,
  camp-wild with empty pack, pantry 24,650 kcal) — out of sample, but the
  mechanism is visible in the player's path; needs a design look, not a
  villager fix.
- DOCUMENTED: meal-row dedupe fired 141 times (a second villagerMealDay
  caller exists somewhere); the instrument handled it, the analyzer audit
  passed.
- DOCUMENTED: analyzer C1 scan cost ~20 min on the 43k-file evidence
  tree — expected cost for future runs on this instrument, not a defect.
- Instrument state: scripts/sweep-awayconfirm-a.js,
  scripts/analyze-awayconfirm-a.js, scripts/test-awayconfirm-a.js (PASS 43
  legs incl. live leg E), scripts/run-awayconfirm-a.sh — all committed
  with the prereg, the evidence file, and the 100-seed corpus (100
  per-seed JSONs + sweep-competent.json). Zero src/js changes; this arm
  needs no [needs-eyes] (measurement only, nothing for Steve to playtest).

## Findings for the backlog (coordinator appends — this worker does NOT edit sim-findings.md)

- [open] 2026-11-07 — food economy / away-ration — player starves camping wild with a full pantry (Harold, s98079 d12, pantry 24,650 kcal / 44.5 fresh days, "You camp wild tonight — no pantry meal. Eat from your pack."): the away-ration mechanism is visible in the player's camp-wild path while the villager confirm came back n=0/100. Out of sample (player excluded by prereg). Needs a design look: is the player meant to starve out in the wild with a full pantry at home, or should camp-wild draw a ration? (sim-awayconfirm-a, evidence/2026-11-07/sim-awayconfirm-a.md).
- [open] 2026-11-07 — food economy / starvation — all 35 villager starvation deaths on 100 fresh seeds happened with pantryKcal exactly 0 and freshDays exactly 0; starvation here is genuine scarcity, not distribution. The binding constraint is food production/storage shortfall, not ration sizing; any future food arm should attack production, not the ration. (sim-awayconfirm-a, evidence/2026-11-07/sim-awayconfirm-a.md).
- [open] 2026-11-07 — food economy / meal instrument — meal-row dedupe fired 141 times across 100 seeds (a second villagerMealDay caller replaces rows, last call wins); the instrument handled it and the analyzer audit passed, but the second caller is unidentified and worth a look. (sim-awayconfirm-a, evidence/2026-11-07/sim-awayconfirm-a.md).
- [open] 2026-11-07 — food economy / away-ration — away meal adequacy 0.996 exceeds haven 0.984 over 78,010 meal rows; the away-ration harm story has no support at this scale, and a future fix would need a different mechanism story than "away villagers get short rations while food exists." (sim-awayconfirm-a, evidence/2026-11-07/sim-awayconfirm-a.md).
- [open] 2026-11-07 — scale wall — competent-only 100-seed panel: wave 5 reached on 9/100 seeds, wave 4 on 85/100, median survival 92d, national/table/wins 0/100. Wave-5 reach is the deepest competent-only showing in the full-pantry family; scale-wall numbers for the tracker. (sim-awayconfirm-a, evidence/2026-11-07/sim-awayconfirm-a.md).

## Landing note (coordinator, post-rebase, run fleshout-20261107T1415Z)

- Proof on the measurement base c92a873f4 (worker run): scripts/test-awayconfirm-a.js PASS 43 legs, including live leg E.
- After rebase onto master 9aa2698fc (explicit SHA, read in the main tree immediately before rebasing), the proof reads 42/43: leg E fails, "E deathRowCount mismatch vs corpus — 17 !== 10" (seed 98000 live re-run vs the corpus file). All 42 static legs (A–D, F, G) still pass.
- Attribution (bisected, not guessed): 5 commits changed src/js between the measurement base and the landing base — xp-gear patrol deed / synergy bonus / healing deed / gear protection retune (src/js/game.js, fieldFights.js, abilityActions.js, tracks.js, …) plus journey bond/convo work. The arm itself touches zero src/js and its 107 files are byte-identical through the rebase. The live re-run's 17 deaths are ordinary game deaths on the new base; the corpus file is the faithful record of the measurement base. This is the known master-sensitivity class for proofs pinning absolute trajectory values (tracker, 0530Z re-pin story).
- The verdict does NOT depend on leg E: leg E is a determinism guard for the instrument, proven on its measurement base; the verdict (n = 0, NO-GO-on-sample) is judged on the corpus as measured on c92a873f4, and the corpus + verdict stand as measured. No re-sweep was run: a re-sweep on the new base would be a new measurement needing its own prereg, and the prereg binds this arm to its measurement base.
- Next proof refresh for this instrument (not this run): re-pin leg E — re-run the corpus on the then-current base and update the pinned values — rather than treating a leg E failure after master movement as a regression.
- Landing also restores the exec bit on scripts/run-awayconfirm-a.sh (commit 1535afa8e, mode-only, matches parent run-fullpantry-casecount-b.sh 100755).
