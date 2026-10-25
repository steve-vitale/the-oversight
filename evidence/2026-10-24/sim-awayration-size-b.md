# sim-awayration-size-b — HOW BIG is the away-ration shortfall (DIAG, measurement only)

Run: oversight-flesh-out-loop-b (cron), axis food-economy.
Worker tree: ~/workspace/worktrees/sim-awayration-size-b.
DIAG arm: backlog #942, follow-up to sim-fullpantry-diag-b
(evidence/2026-10-24/sim-fullpantry-diag-b.md), which classified 3/3
full-pantry starvation deaths as away-ration but never quantified the
ration itself. THIS ARM IS DIAG ONLY: ZERO src/js game changes, no
lever re-pricing, no away-ration fix landed. Fix candidates with
numbers are reported as findings for a later arm (confirm-first rule,
backlog #942); none are implemented here.

## Canon

READ docs/CANON.md first, then docs/PRESERVATION.md (the food ladder;
pack food moves only what fits in the actual pack) and docs/BALANCING.md
(2,000 kcal/day adult need; villager need 1,600 kids / 1,700 elders /
2,000 adults; pantry start ~47,250 kcal). The mechanism under test is
game code, verified in src/js/game.js (not taken on faith): packKcal
reseeds at dawn — base 800 + Math.random()*500 − hunger*3 + (bold ?
150 : 0), clamped >= 200, drawn as real items from the pantry by
pantryDraw — while a villager's daily need is ~2,000 kcal. No canon
doc covers away-ration sizing — if the measurement names a size, it
is a finding, not canon. No canon doc is invented here.

## The question (backlog #942)

Fullpantry proved the mechanism (away, not haven) on a thin sample
but not the magnitude: is the dawn ration systematically short of
need, by how much, on how many away days, and does the shortfall
compound into the streaks that precede starvation deaths? This run
MEASURES, not assumes, whether away days are systematically short.

## PRE-REGISTRATION (bound per MEASUREMENT.md §14 — a miss is NO-GO, never re-scored)

- Substrate: branch sim-awayration-size-b (current master at run
  start). Policy: competent ONLY (scripts/policies/competent.js,
  unmodified). Env (explicit, = shipped defaults): PLENTYDEPRI=1,
  DEPOSITGATE=1. Horizon: 150d death-aware cap (dead villages
  stop; runDays endReason recorded per seed; no fixed-200d run,
  no tail padding beyond the harness's own stop).
- Seeds: PILOT 94501–94508 (8 seeds). PRE-REGISTERED EXTENSION:
  if total away villager-days across the pilot is < 200, run band
  94509–94516 (8 more seeds, same pre-reg) and judge the verdict
  on the POOLED sample, with pilot and extension strata reported
  separately. If the pilot already yields >= 200 away villager-days,
  the extension NEVER runs. The sweep mechanically refuses any
  seed list other than exactly PILOT, exactly EXT, or exactly
  PILOT+EXT; the runner refuses to run once a line-start verdict
  line exists in this file (anchored guard: pre-reg prose
  mentioning the token does not trip it).
- Freshness: bands 94501–94516 verified absent as exact "seed"
  fields from ALL per-seed corpora under evidence/ before sims
  (full-evidence grep for "seed": 94501–94516 returned zero hits;
  the analyzer re-asserts this C1 gate over every *-corpus dir
  under evidence/2026-10-24 except its own, and aborts on a hit).
  If any band had collided, the next clean band of 8 would have
  been picked and the reason recorded — none did, so the
  suggested bands stand as written.
- Instrument (new files, no existing instrument modified):
  scripts/sweep-awayration-size-b.js, scripts/analyze-awayration-size-b.js,
  scripts/test-awayration-size-b.js, scripts/run-awayration-size-b.sh.
  The sweep wraps villagerMealDay read-only (meal rows deduped one
  row per (vid,day), last call wins, as in fullpantry) AND wraps
  packKcal read-only: a pack row is recorded ONLY at a reseed
  (pre-call pack entry absent or stale-day), so the recorded value
  is the dawn-drawn kcal before any packSpend, with packDay =
  v.pack[vid].day at record time. First-wins dedupe for pack rows
  (a later same-day packKcal call returns the post-spend remainder
  and must never overwrite the dawn value). Pack row fields: vid,
  day, packKcal (dawn drawn), packDay, needEst (person.kcalPerDay
  || 2000), hungerAtPack, temper, pantryKcalAtPack.
- Definitions (fixed before sims):
  - Away villager-day = a deduped meal row with away === true.
  - Meal adequacy = ate >= 0.6 * needEst (the fullpantry
    instrument's definition; needEst = person.kcalPerDay || 2000).
  - Pack/need ratio = packKcal / needEst on the joined away day
    (pack row joined to the meal row by (vid,day)).
  - Pack coverage = away meal-days with a pack row / all away
    meal-days. A pack row is publishable only if packDay === day
    for every row; the analyzer hard-fails (exit 2, no ratios
    published) on any misaligned row.
  - Consecutive-inadequate-away-day streak: per villager, meal
    rows sorted by day; the streak increments on an away row
    with ate < 0.6*needEst and resets on an adequate row, on a
    haven row, or on a calendar gap in that villager's rows.
    Reported: median of per-villager max streaks + global max.
  - Death linkage: for each villager starvation death, trailing
    inadequate-away streak = consecutive away-inadequate meal
    days ending on the death day (walking back from the death
    day while away && !adequate), and days since last adequate
    meal = deathDay minus the last adequate meal day <= deathDay
    (any location; null if none). Share preceded by >= 3
    inadequate away days = deaths with trailing streak >= 3 /
    all villager starvation deaths.
- Primary metric set (all required for GO): away meal-day
  adequacy rate; pack/need ratio distribution (median, quartiles,
  share < 0.6); median + max consecutive-inadequate away streak;
  share of villager starvation deaths preceded by >= 3 inadequate
  away days; plus sense quotes from transcripts.
- DIAG-GO iff ALL of: >= 8 seeds complete AND >= 200 away
  villager-days captured AND pack/need recorded on >= 90% of
  away days AND the report gives all of the primary metric set
  above. If any threshold misses, the verdict is DIAG-NO-GO
  (measurement failed) — never re-scored on a friendlier
  denominator. Quartiles use nearest-rank on the sorted joined
  pack/need ratios (documented in the analyzer header).
- WATCH (report-only): wall numbers (national / table+wins /
  wave reach / median / max survival), death-cause shares,
  haven vs away meal adequacy, per-death linkage table with
  quotes, villager behavior (SENSE-TESTING LAW: transcripts read,
  beats quoted — never just counts).
- Balanced panel per §15: N/A, stated explicitly, not silently
  skipped — this DIAG has a single policy and no before/after
  comparison arm, so there is no compare to run through the
  panel. The verdict is judged on the analyzer's pre-registered
  thresholds. If a later run adds a comparison arm, it runs
  through the panel then.
- Metric review (pre-sims):
  - Meal ate includes own production (ownEat + pack draw), so an
    away day can be adequate even when the pack alone is short
    — the pack/need ratio and the meal adequacy rate are
    different quantities and both are reported; neither is
    substituted for the other.
  - The code's internal need is (kcalPerDay)*(0.7+0.3*healthFactor)
    (haven hearth stretch aside); the instrument's needEst is
    kcalPerDay || 2000, matching fullpantry, so adequacy rates
    are comparable across runs even though they are not the
    code's internal need.
  - Pack draws are pantry-limited: pantryDraw returns what the
    pantry holds, so a low pack on a low-pantry day is a pantry
    story, not a formula story. pantryKcalAtPack is recorded on
    every pack row so the two can be separated in the report.
  - A villager who never triggers packKcal on a day has no pack
    row; away villagers eat via packMeal, which calls packKcal,
    so away-day coverage should be near-complete — the >= 90%
    bar tests exactly that, and a miss is a measurement failure,
    not a reason to impute packs.
  - Hunger at pack time enters the formula (-3/hunger point), so
    a hungry villager's next ration is smaller by construction —
    a compounding channel the streak analysis must keep visible
    (hungerAtPack is recorded, not averaged away).

## Results

COMPLETE CORPUS (8 seeds: pilot 94501–94508, 1 config, competent,
150d death-aware, PLENTYDEPRI=1/DEPOSITGATE=1, attempt 1 — no EPERM
failure, no retries needed). The pilot yielded 3,336 away
villager-days (>> 200), so the pre-registered extension NEVER ran,
exactly as pre-registered. Full analyzer output: run
`node scripts/analyze-awayration-size-b.js` in this tree (corpus:
evidence/2026-10-24/awayration-size-b-corpus/). Proof:
`node scripts/test-awayration-size-b.js` — 37/37 legs including the
live byte-identical determinism re-run of seed 94501.

Per-seed wall:

| seed | days | end | wave | arc | deaths | meals | packs |
|---|---|---|---|---|---|---|---|
| 94501 | 150 | survived | 2 | III | 4 | 1,150 | 33 |
| 94502 | 128 | village-lost | 4 | III | 19 | 1,053 | 48 |
| 94503 | 150 | survived | 4 | III | 9 | 1,141 | 111 |
| 94504 | 150 | survived | 3 | III | 7 | 1,113 | 17 |
| 94505 | 150 | survived | 4 | III | 12 | 1,140 | 46 |
| 94506 | 150 | survived | 3 | III | 5 | 1,525 | 53 |
| 94507 | 150 | survived | 4 | III | 10 | 1,316 | 138 |
| 94508 | 150 | survived | 4 | III | 13 | 1,272 | 85 |

Median survival 150d (capped), max 150d, national 0/8,
table/wins 0/8 (competent alone carries no scale push —
expected, not chased), wave 4 on 5/8, wave 5 on 0/8, Arc III
on 8/8, rank village on 8/8. Pooled death-cause shares (79
deaths): the arena 47, monster 7, starvation 4, sickness 4,
dehydration 3, ambush 3, the night 2, combat 2, contest 2,
and 5 singles (stripes resolving out of the bam, a crow that
watches too long, the expedition, a wound that wouldn't
close, grief counselor). Player starvation deaths: 0.

PRIMARY METRICS (pre-registered set, all reported):

- Away villager-days: 3,336 (pilot only; extension not run).
  Meal rows total 9,710 (haven 6,374 + away 3,336).
- Away meal-day adequacy (ate >= 0.6*needEst): 3,311/3,336 =
  0.993. Haven adequacy: 6,367/6,374 = 0.999.
- Pack coverage, literal pre-registered definition (away
  meal-days with a pack row / all away meal-days): 531/3,336
  = 0.159 — FAILS the >= 0.90 bar (see metric review: the
  denominator is misspecified, not the capture).
- Pack/need ratio, joined away days (n=531): median 0.432,
  Q1 0.366, Q3 0.500, share < 0.6 = 0.949, min 0.222,
  max 0.800. On pack-draw days only (n=529): median 0.429,
  Q1 0.366, Q3 0.497, share < 0.6 = 0.949.
- Streaks (consecutive inadequate away days): median of
  per-villager max streaks = 0, global max = 4, villagers
  counted = 129, villagers with max >= 3: 1 (lena_ruiz,
  s94507, d27–30 — see SENSE).
- Villager starvation deaths: 4, all full-pantry
  (pantry >= 8,000 kcal AND fresh >= 3.0d at death) and all
  class A away-at-death. Trailing inadequate-away streak =
  1 for all 4; days since last adequate meal = 1 for all 4.
  Share preceded by >= 3 inadequate away days: 0/4 = 0.000.
- Sense quotes: carried per death below (analyzer quotes +
  windows read in full).

THE SIZE ANSWER (what the ration actually is):

- The dawn pack is drawn ONLY when the away villager's own
  production falls short of need (dayWant > 50): 529 of
  3,336 away days (15.9%) draw from the pack at all. The
  other 2,807 away days are self-fed (drawn = 0) and adequate
  2,806/2,807 times. The pack is a top-up for bad days, not
  a daily ration — and on the days it fires, it is small:
  median pack 880 kcal against needs around 2,000 kcal
  (range 510–1,400 kcal; the formula's own ceiling is
  800+500+150 = 1,450 before the hunger penalty, so the
  pack CANNOT reach a 2,000-kcal need even at its best).
- The shortfall is the formula, not empty shelves: pantry
  kcal at pack time median 32,133 kcal, and only 4 of 531
  packs were drawn with the pantry under 5,000 kcal.
- The hunger penalty compounds: hunger at pack time median
  98 (91.3% of packs drawn at hunger >= 70), so the −3/point
  penalty is nearly always near its maximum (~300 kcal off)
  exactly on the days the villager is already hungry.
- Inadequacy concentrates exactly on pack days: 24 of the
  25 inadequate away days are pack-draw days (draw-day
  adequacy 505/529 = 0.955; self-fed adequacy 2,806/2,807).
  Own production + a 43%-of-need pack usually still clears
  the 60% adequacy line — until health collapses (see deaths).
- Capture completeness where it matters: 529/529 pack-draw
  days carry a pack row (coverage 1.000 on draw days), 0
  misaligned pack rows (packDay === day on all 531 rows),
  0 duplicate pack rows, meal-dup total 47 (last-wins
  dedupe, as in fullpantry), packSkip total 1 (one later
  same-day packKcal call correctly refused the dawn value).

STARVATION DEATH LINKAGE (all 4, meal history + pack):

| seed | day | villager | pantry | fresh | pack | ate/need | hp@meal | trail | sinceAdeq |
|---|---|---|---|---|---|---|---|---|---|
| 94503 | 17 | Charlotte | 8,500 | 3.2d | 600 | 670/2,064 | 4 | 1 | 1 |
| 94507 | 109 | Pablo | 26,820 | 5.8d | 832 | 902/2,290 | 4 | 1 | 1 |
| 94508 | 17 | Salvatore | 25,145 | 22.4d | 600 | 785/2,003 | 7 | 1 | 1 |
| 94508 | 79 | Desmond | 25,104 | 4.7d | 640 | 727/2,200 | 3 | 1 | 1 |

All four are the fullpantry low-health + short away meal
shape, third run in a row: the death-day meal is short
because the body is already at 3–7 HP and the pack (600–
832 kcal) plus token own production cannot clear 60% of
need — not because of a multi-day away streak (trailing
streak 1 in every case; the longest away streak in the
whole corpus, 4 days, did NOT kill its villager). A fix
aimed only at ration size would not have saved these four
without also addressing why they were at 3–7 HP; a fix
aimed only at health would not change the ration's 43%
ceiling. Both halves belong in the finding, as before.

## Metric review (post-run)

- PRE-REGISTERED METRICS BOUND THE RUN AND WERE NOT
  RE-SCORED. The verdict below is DIAG-NO-GO on the literal
  coverage bar (0.159 < 0.90), even though the size answer
  itself is fully measured. The coverage denominator was
  misspecified, and the misspecification is recorded here
  as a metric revision for the NEXT run, not applied to
  this one: "away days" conflates two different populations
  — self-fed away days (2,807, no pack exists because no
  pack is drawn) and pack-draw days (529, a pack exists on
  every one). The correct denominator for a capture-
  completeness bar is pack-draw days (drawn > 0 or a pack
  row present), on which this run scores 529/529 = 1.000.
  A future run should pre-register coverage on draw days
  and report self-fed share as context; it should NOT
  re-judge this run's verdict on the revised denominator.
- Forcing a packKcal call at dawn for self-fed villagers
  would NOT fix the denominator honestly: it would draw
  pantry food for people who do not need it, changing the
  pantry, the meals, and the very thing being measured.
  The read-only wrapper is the correct instrument; the
  denominator was the error, not the capture.
- The starvation-death >= 3 share (0/4) is a real zero,
  not a small-sample artifact in the same way as
  fullpantry's n=3: the deaths exist (n=4) and none has a
  trailing streak above 1. The prolonged-streak mechanism
  for starvation deaths is not supported by this corpus;
  the low-health + short-meal mechanism is supported 4/4.
- "The arena" (47/79 deaths) remains the largest cause
  family and is NOT investigated here (out of axis scope).
  It does not touch the away-ration measurement.
- Balanced panel §15: N/A as stated pre-run (single policy,
  no comparison arm). No panel compare is attached, by
  design.

## SENSE (SENSE-TESTING LAW)

Four starvation-death transcripts read in full (say + tele
windows), judged for meaning, not counts:

- CHARLOTTE d17 (s94503): the window stages the gap
  honestly — the moot, the STARVING spiral warning, and
  the haven's own meal ("Village meal: +2020 kcal…")
  on the day she dies away at 4 HP on a 600-kcal pack.
  Her history shows the shape: hp 20 → 8 across d12–13
  (non-meal damage), haven recovery to 59, then away at
  4 HP. Coherent and consequential.
- PABLO d109 (s94507): the window carries the
  narration-vs-state tension again — "Quiet mending
  sounds from the bunks — Pablo fixing something" reads
  as Pablo being AT the haven, while the engine records
  him away for the death-day meal (pack 832, hp 4). Per
  #911 the meal record wins; the line is a generic haven
  beat borrowing an away villager's name, fourth sighting
  across runs (Owen, Misky, now Pablo). Quote kept
  precisely because it is the tension, not despite it.
- SALVATORE d17 (s94508): the cleanest staging — the
  STARVING warning and the haven's half-ration meal
  ("Village meal: +1000 kcal… (Half ration — they don't
  trust you yet.)") on the day he dies away at 7 HP on
  a 600-kcal pack. The contradiction IS the story, as in
  fullpantry's Antwi.
- DESMOND d79 (s94508): the exception that proves the
  narration CAN name the dying villager — "Desmond is
  hurt — a fall, a thorn, a bad step. (health 3/100)"
  fires the same day, alongside the haven's thin meal
  ("Village meal: +116 kcal…") and his own return with
  food ("Desmond came back with an armful of something
  edible, unprompted. (+100 kcal pantry)"). He fed the
  village and died away at 3 HP. Coherent, and the most
  human beat in the run.
- LENA d27–30 (s94507, the corpus's only >= 3 streak):
  four straight inadequate away days (ate 1,231 → 1,043
  vs need 2,100; packs 800/800/800/600) at 17 HP — then
  adequate again from d31 (ate 1,341, pack 896) and alive
  at d40. The streak that did not kill: a pack at 600–
  800 plus thin own production hovers just under the
  60% line (1,260) for days without tipping into death
  while health holds at 17. The 60% line is a slope, not
  a cliff — until health is already gone.

## Village assessment in plain words

Eight competent villages, 150 days each, and the picture
is sturdier than the starvation scare suggested: seven
villages live to the horizon, one (s94502) is lost by
day 128 under combat pressure (19 deaths), wave 4 is
reached on five of them, and nobody gets near national
or the table on competent play alone — expected, not
chased. The pantry is not the problem: when packs are
drawn, the shelves hold a median 32,000 kcal. Away
villagers mostly feed themselves — nine in ten away days
need no pack at all. The ration only shows up on the bad
days, when a villager's own work falls short, and then
it covers about two-fifths of a day's need: enough, with
what they caught, to stay over the hunger line most of
the time, but never enough on its own. Starvation itself
is rare (4 of 79 deaths), and every one of the four is
the same story: a villager already down to 3–7 health
takes one short pack meal away from home and dies, while
the village eats from full shelves. The village is not
starving; one injured traveler at a time is — and the
game still never says, out loud, that the ration cannot
cover a hurt person away from home.

## Blanks filled or documented

- FILLED (measurement): the away-ration shortfall is now
  QUANTIFIED, not just classified — median pack/need
  0.432 (Q1 0.366, Q3 0.500, 94.9% below 0.6) on joined
  away days; median pack 880 kcal vs ~2,000-kcal needs;
  formula ceiling 1,450 kcal, so the pack cannot reach
  need by construction; hunger penalty near-max on 91%
  of pack days; pantry NOT the limiter (median 32,133
  kcal at draw).
- FILLED (instrument): dawn-pack capture proven — 0
  misaligned rows, 0 duplicate pack rows, 529/529 draw
  days captured, byte-identical determinism re-run of
  seed 94501 (proof 37/37). The instrument is reusable;
  only its coverage denominator needs re-registration.
- FILLED (causal, within sample): prolonged away streaks
  do NOT explain starvation deaths here (0/4 preceded by
  >= 3 inadequate away days; longest streak 4 days did not
  kill). The operative mechanism is low-health + short
  away meal, 4/4 — same shape as fullpantry, now with the
  ration size attached to each death (600–832 kcal).
- DOCUMENTED (not chased, per backlog discipline): (a)
  the coverage-denominator misspecification + the
  draw-day revision for the next run (metric review
  above); (b) fix candidates below — reported with
  numbers, NOT implemented (this arm is DIAG ONLY);
  (c) haven-beat name-borrowing, fourth sighting
  (Pablo); (d) "the arena" as the largest cause family
  (47/79) — out of this arm's scope.
- FIX CANDIDATES (for a later arm, confirm-first rule):
  (1) Size the away pack to the day's actual shortfall
  (dayWant = need − own production) instead of the fixed
  800–1,300 formula — on draw days the pack would need
  roughly 2.3× its current size to reach need alone, or
  ~1.4× to clear the 60% line after typical own
  production; (2) drop or floor the hunger penalty on
  pack draws (hungry villagers currently get the smallest
  packs — the compounding channel); (3) voice away hunger
  for low-health travelers (all 4 deaths were at 3–7 HP
  with no away-hunger line of their own); (4) re-register
  the coverage bar on pack-draw days before any fix arm
  judges itself. None of these is landed here.
- NOTHING ELSE CHANGED: zero src/js changes (measurement
  arm), no lever re-priced, no fullpantry verdict
  re-litigated.

## Findings for the backlog (coordinator appends — this worker does NOT edit sim-findings.md)

- [open] 2026-10-24 — away-ration size quantified (DIAG-NO-GO on a misspecified coverage bar, size answer complete) — median pack/need 0.432 (Q1 0.366, Q3 0.500, 94.9% < 0.6) on 531 joined away days; median pack 880 kcal vs ~2,000-kcal needs; formula ceiling 1,450 kcal so the pack cannot reach need by construction; pantry NOT the limiter (median 32,133 kcal at draw); hunger penalty near-max on 91% of pack days (sim-awayration-size-b, evidence/2026-10-24/sim-awayration-size-b.md).
- [open] 2026-10-24 — coverage denominator misspecification (metric revision for next run) — literal coverage 531/3,336 = 0.159 because 2,807 away days are self-fed with no pack drawn; capture on pack-draw days is 529/529 = 1.000; next run should pre-register coverage on draw days (sim-awayration-size-b).
- [open] 2026-10-24 — prolonged away streaks do NOT explain starvation deaths — 0/4 deaths preceded by >= 3 inadequate away days (all trailing streak 1); operative mechanism is low-health (3–7 HP) + short away meal, 4/4; longest streak (4 days, lena_ruiz s94507) did not kill (sim-awayration-size-b).
- [open] 2026-10-24 — haven-beat name-borrowing, fourth sighting — Pablo's "mending sounds from the bunks" line on his away death day reads as at-haven while the engine records him away; meal record wins per #911 (sim-awayration-size-b).
- [open] 2026-10-24 — away-ration fix candidates (DIAG ONLY, not implemented) — size pack to dayWant instead of fixed formula; drop/floor the hunger penalty on pack draws; voice away hunger for low-health travelers; re-register coverage on draw days first (sim-awayration-size-b).

## Verdict

VERDICT-RENDERED: DIAG-NO-GO — seeds 8/8 complete and away days 3,336 >= 200 and all primary metrics reported, but literal pack coverage 531/3,336 = 0.159 < 0.90, so the pre-registered bar misses and the verdict is NO-GO, never re-scored. The miss is a denominator misspecification, not a capture failure: coverage on pack-draw days is 529/529 = 1.000, pack-day alignment is proven (0 misaligned rows), and the size answer stands — median pack/need 0.432, 94.9% of joined away days below 0.6, starvation-death >= 3 share 0/4. The next run should re-register coverage on draw days; this run's verdict is not revised on that basis.
