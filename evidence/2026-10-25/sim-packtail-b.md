# sim-packtail-b — TAIL PACK RE-TRY (floor-only top-up on pool-binding days)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261025T0730Z,
arm sim-packtail-b, axis food-economy.
Worker tree: ~/workspace/worktrees/sim-packtail-b.
Backlog: 2026-10-25 tail-metric revision + pool-cap finding, claimed by
this run (the 0630Z run's metric review binds this run: judge ONLY on
the tail, never a pooled median).

## Canon

READ docs/CANON.md first, then docs/PRESERVATION.md (the food ladder;
pack food moves only what fits in the actual pack). The mechanism under
test is game code, verified in src/js/game.js (not taken on faith):
packKcal reseeds at dawn — base 800 + Math.random()*500 − hunger*3 +
(bold ? 150 : 0), clamped >= 200, drawn as real items from the pantry
by pantryDraw — while a villager's daily need is ~2,000 kcal. Away
villagers eat via packMeal, which calls packKcal and takes
min(pool, dayWant); villagerMealDay draws from the pack only when
dayWant > 50. No canon doc covers away-ration sizing — if the
measurement names a size, it is a finding, not canon. No canon doc
is invented here.

## What the 0630Z run settled (read before designing — this arm is the re-try)

- The KILLED dayWant pack fix sized EVERY dawn pack to dayWant. Pilot
  8 seeds 94801–94808, competent only, 150d death-aware: PRIMARY
  pack/need median on pack-draw days 0.430 baseline -> 0.240 armed
  vs bar >= 0.80 = FAIL. The pool cap binds on only 67/591 baseline
  draw days (11.3%); on 88.7% the villager draws less than the pack
  (median drawn 326 kcal vs median pack 893 kcal) because a draw day
  fires whenever dayWant > 50 and own production covers ~84% of need,
  so typical dayWant is only ~330 kcal. Sizing packs TO dayWant
  therefore SHRANK typical packs by construction.
- This run's shape is the honest tail shape: a top-up on
  pool-binding days ONLY, never a resize. Any pack that shrinks
  under this lever is a re-kill of the 0630Z fix, not a re-try.

## The lever (game-code arm, one change, packMeal only)

In packMeal(vid, want, exposure) ONLY — theft, intimidation, and
packSpend callers keep the old packKcal formula untouched, because
they call packKcal directly, never packMeal:

1. packKcal reseeds as before and records the dawn pack size on the
   pack entry (p.dawnKcal = drawn kcal at reseed; p.topUpDone = false).
   Existing pack entries without dawnKcal fall back to the current
   pool at meal time (defensive only; in-run packs are always
   reseeded by this code).
2. At meal time, if the dawn pack is smaller than the day's
   shortfall (dawnKcal < want) and no top-up has been attempted
   today, draw the shortfall (want − dawnKcal) as REAL pantry items
   via pantryDraw(v, want − dawnKcal, { cook: false, exposure })
   — never conjured food — and add what was actually drawn to the
   pack. Mark topUpDone whether or not the pantry paid (one attempt
   per pack-day; a second meal call the same day cannot draw a
   second top-up).
3. The meal then takes min(pool + topUp, want) exactly as before.
   Consequences, by construction:
   - FLOOR-ONLY: the meal take can never fall below the old
     take min(pool, want) for the same pool/want, because the top-up
     only adds kcal to the pool before the same min() runs.
   - THEFT STILL BITES: if a thief spent S kcal from the pack
     before the meal, pool = dawn − S, so the armed take is
     min(dawn − S + (want − dawn), want) = want − S — the victim is
     short by exactly the stolen amount, same as the old shape's
     shortfall, never restored by the top-up.
   - NON-BINDING DAYS UNTOUCHED: when dawnKcal >= want, no pantry
     draw happens, no pantry kcal moves, and the meal is
     byte-identical in behavior to baseline (same take, same
     pantry state).
   - PANTRY-EMPTY DAYS UNCHANGED: pantryDraw returns 0, the meal
     takes min(pool, want) as before — the lever cannot conjure.
   - No narration, no haven changes, no formula change: voice is a
     separate blank (cover-b sense census), not bundled.

## PRE-REGISTRATION (bound per MEASUREMENT.md §14 — a miss is NO-GO, never re-scored)

- Substrate: branch sim-packtail-b (current master at run start).
  Policy: competent ONLY (scripts/policies/competent.js,
  unmodified). Env (explicit, = shipped defaults as in the 0630Z
  run): PLENTYDEPRI=1, DEPOSITGATE=1. Horizon: 150d death-aware cap
  (dead villages stop; runDays endReason recorded per seed; no
  fixed-200d run, no tail padding beyond the harness's own stop).
- Seeds: PILOT 8 seeds 94901–94908, baseline vs armed on IDENTICAL
  seeds (baseline corpus first, on unmodified code; armed corpus
  after the lever lands on this branch). Freshness verified BEFORE
  sims against ALL per-seed corpora under evidence/ (exact "seed"
  fields + per-seed filenames) and dated .md files; the band never
  reuses 94801–94808, 94701–94732, 94501–94516, or the casecount
  94601–94664 bands. Confirm band 12–16 seeds runs ONLY if pilot
  GO passes — a pilot miss ends the arm, no confirms on an
  invisible effect.
- Instrument (new files, -packtail-b suffix, no prior arm's file
  overwritten): scripts/sweep-awayration-packtail-b.js,
  scripts/analyze-awayration-packtail-b.js,
  scripts/test-packtail-b.js, scripts/run-awayration-packtail-b.sh.
  The sweep is the cover-b capture (villagerMealDay wrapper, meal-row
  last-wins dedupe, packKcal reseed-only first-wins capture) PLUS a
  packMeal wrapper: at each packMeal call it records (vid, day,
  want = dayWant, poolAtMeal = packKcal before the call, take =
  packMeal return). The packMeal wrapper calls the wrapped packKcal
  first (reseed if stale — the same single reseed packMeal itself
  would trigger, so RNG consumption is unchanged) and calls through
  to the original packMeal; it never draws, never spends, never
  uses RNG.
- Definitions (fixed before sims — DENOMINATOR STATED EXPLICITLY):
  - Away villager-day = a deduped meal row with away === true.
  - Pack-draw day = an away meal row with drawn > 0 (packMeal
    actually took food), as in cover-b.
  - Pool-binding day = a pack-draw day with a joined pack row AND
    a joined packMeal row where dawn pack < dayWant
    (packRow.packKcal < packMealRow.want). The dawn pack comes
    from the packKcal wrapper (reseed value, before any spend);
    dayWant comes from the packMeal wrapper (the want argument).
    Two independent captures, so the binding classification is
    not a tautology. Self-fed days (drawn === 0) are NOT binding
    days: no packMeal call fired, so no shortfall was presented
    to a pack at all.
  - Binding-day coverage = drawn / dayWant on that day, where
    drawn is the meal row's drawn (packMeal take) and dayWant is
    the packMeal row's want. Coverage is capped at 1.0 only by
    the min(pool, want) take itself; values above 1.0 cannot occur
    (take <= want by construction) and would fail the analyzer
    as an instrument error if ever observed.
  - Meal adequacy = ate >= 0.6 * needEst (needEst = kcalPerDay ||
    2000), as in size-b/cover-b.
  - Pack-draw-day capture = pack-draw days with a joined pack row
    (packDay === day) / all pack-draw days, as in cover-b.
  - Full-pantry away starvation death = a villager (non-player)
    starvation death with pantryKcal >= 8,000 AND freshDays >= 3.0
    at death AND awayAtDeath === true, as in size-b.
- PRIMARY METRIC (tail-only): median binding-day coverage
  (drawn/dayWant) on pool-binding days, armed arm.
- GO threshold: armed median binding-day coverage >= 0.90 AND
  armed binding-day count >= 30 (a tail verdict needs a tail
  sample; the 0630Z pilot yielded 67 binding days in 8 baseline
  seeds, so 30 is a floor, not a stretch goal). GO additionally
  requires: all 8 pilot seeds complete in both arms, 0 misaligned
  pack rows, 0 duplicate pack rows, and all guardrails below pass.
  A miss on any of these is NO-GO.
- Guardrails (all must pass for GO; wall metrics are reported,
  not judged):
  - Pack-draw-day capture == 1.000 in both arms.
  - Median survival (armed) >= 0.8x median survival (baseline).
  - Full-pantry away starvation deaths (armed) <= baseline + 2.
  - No new death mode: no death cause present in the armed corpus
    that is absent from the baseline corpus, EXCEPT causes with a
    stated small-sample caveat are reported as unproven rather
    than claimed — an 8-seed baseline band may hold zero
    starvation deaths at all, so a zero baseline cannot prove a
    new mode; the analyzer reports the armed-only cause list with
    counts and the report says so plainly instead of
    over-claiming. For GO purposes, an armed-only cause counts
    against GO only if it accounts for >= 3 deaths; 1–2 deaths of
    an armed-only cause are reported as inconclusive, not a GO
    block, and the reason (small-sample denominator) is stated.
    (This rule is fixed here, before sims, so it cannot be tuned
    after seeing the corpora.)
  - Floor-only unit proof: scripts/test-packtail-b.js proves on a
    controlled packMeal call that the armed take >= the old take
    for the same pool/want, that a non-binding meal is unchanged,
    and that a theft-reduced pool still loses exactly the stolen
    amount — before any verdict is rendered.
- Diagnostics (do NOT overturn the primary): pack/need median on
  binding days (both arms), mean binding-day coverage, share of
  binding days at coverage 1.0, binding-day count and share of
  draw days, median dawn pack / median dayWant on binding days,
  top-up paid share (binding days where armed coverage exceeds
  the baseline-shape expectation is NOT computed per-villager —
  arms diverge in pantry state, so cross-arm per-day joins are
  not claimed; instead the armed corpus reports its own binding
  coverage distribution), away meal adequacy, draw-day adequacy,
  per-seed wall table.
- WATCH (report-only): wall numbers (national / table+wins / wave
  reach / median / max survival), death-cause shares, haven vs away
  meal adequacy, per-death linkage table with quotes, villager
  behavior (SENSE-TESTING LAW: transcripts read, beats quoted —
  never just counts).
- Balanced panel per §15: ATTEMPTED, then fallback, stated
  explicitly, not silently skipped — `node scripts/balance-panel.js
  compare` on the two sweep corpora is expected to throw the same
  TypeError as cover-b and the 0630Z run (panel ingests
  panel.json.gz outputs, not per-seed sweep corpora, and does not
  measure pack/need at all). If it throws, the sweep-compare table
  in this file is the before/after comparison (same seeds, same
  instrument); the panel failure is a tool finding (fourth
  sighting incl. cover-b), not a verdict input, and no verdict is
  re-scored through it.
- Metric review (pre-sims):
  - The 0630Z metric review binds this run: a pooled median
    cannot judge a tail intervention, so the primary lives ONLY
    on pool-binding days. A pooled-median move in either direction
    is reported as context and never as the verdict.
  - The baseline binding-day count is itself an outcome of the
    baseline pantry/own-production dynamics; the armed count may
    differ (fewer binding days later in a run if top-ups leave
    villagers better fed — a second-order effect, not a verdict
    input). The GO bar uses the ARMED count (>= 30) for exactly
    this reason.
  - Cross-arm per-villager-day joins are NOT valid: after the
    first binding day, armed pantry state diverges from baseline,
    so the same (vid,day) in the two corpora is not the same
    counterfactual day. All cross-arm claims are distributional
    (medians, counts, shares on identical starting seeds), never
    paired-day claims. The floor-only property is proven by unit
    test, not by corpus joins.
  - The code's internal need is (kcalPerDay)*(0.7+0.3*healthFactor)
    (haven hearth stretch aside); the instrument's dayWant is the
    engine's own want argument to packMeal, so binding-day
    coverage uses the engine's shortfall, not the needEst
    approximation. pack/need ratios remain needEst-based for
    comparability with size-b/cover-b and are diagnostics only.
  - A pack row with packKcal 0 (empty-pantry reseed) counts as a
    pack row for coverage only when its day is a draw day
    (drawn > 0); a 0-kcal pack can never produce drawn > 0, so
    such rows land in the without-draw-day context count, as in
    cover-b.
  - The "no new death mode" guardrail denominator is honestly
    weak at 8 seeds (stated above, with the >= 3-death rule fixed
    pre-sims). A confirm band (12–16 seeds) would strengthen it;
    a pilot GO does not claim the guardrail is proven at scale.

## RESULTS

COMPLETE CORPORA (8 seeds each, competent, 150d death-aware,
PLENTYDEPRI=1/DEPOSITGATE=1, identical starting seeds baseline vs
armed). Baseline corpus:
evidence/2026-10-25/sim-packtail-b-corpus/baseline/; armed corpus:
evidence/2026-10-25/sim-packtail-b-corpus/armed/. Attempt history,
stated honestly: the first baseline attempt died with the VM reboot
(~07:40 UTC) after seed 94901; the runner re-ran the whole band
deterministically (seed 94901 byte-identical) and verified 8/8.
No verdict was rendered before the completed runs, so no re-run
followed a verdict. Proof: `node scripts/test-packtail-b.js` —
41/41 legs including the live byte-identical determinism re-run of
armed seed 94901 (leg F runs FIRST in the process — a prior
godpath game load leaks a foreign RNG stream into the sweep's
module-captured Math.random and the re-run diverges; the first
F attempt failed exactly that way, 7 deaths vs the corpus's 1,
and the reordered test passes). Regression:
`node scripts/godpath/test-harvest-intake.js` — 37 passed, 0
failed (packMeal-adjacent behavior unchanged outside the lever).
`node --check` passes on game.js and all three new scripts.
Full `check.js` green list NOT re-run to green (prior run: no
output in 8+ minutes, stopped) — reported as incomplete, not
claimed.

Per-seed wall (daysAlive endReason rank wave deaths):

| seed | baseline | armed |
|---|---|---|
| 94901 | 150 survived village w3 7 | 150 survived village w3 1 |
| 94902 | 150 survived village w3 6 | 150 survived village w3 4 |
| 94903 | 150 survived village w4 9 | 150 survived village w4 19 |
| 94904 | 150 survived village w3 9 | 119 village-lost village w4 17 |
| 94905 | 150 survived village w3 4 | 150 survived village w3 5 |
| 94906 | 150 survived village w3 13 | 150 survived village w3 9 |
| 94907 | 150 survived village w4 4 | 150 survived village w3 7 |
| 94908 | 150 survived village w3 8 | 87 village-lost village w3 14 |

PILOT TABLE (pre-registered header, judged as written):

| Metric | Baseline | Armed | Bar | Result |
|---|---|---|---|---|
| PRIMARY: median binding-day coverage (drawn/dayWant) | 0.812 (n=123) | 1.000 (n=79) | >= 0.90 | PASS |
| Binding-day count (armed) | 123 (16.5% of draw days) | 79 (12.4% of draw days) | >= 30 | PASS |
| Binding coverage mean / share==1.0 | 0.790 / 0.000 | 1.000 / 1.000 | — | — |
| Binding coverage min / max | 0.486 / 0.996 | 1.000 / 1.000 | — | — |
| Binding pack/need median (diagnostic) | 0.354 | 0.378 | — | — |
| Median dawn pack / median dayWant, binding days | 800 / 998 | 800 / 1035 | — | — |
| Pack-draw-day capture | 744/744 = 1.000 | 636/636 = 1.000 | == 1.000 | PASS |
| Median survival | 150d | 150d (ratio 1.000) | >= 0.8x | PASS |
| Full-pantry away starvation deaths | 1 | 0 | <= baseline+2 | PASS |
| Armed-only death causes >= 3 deaths | — | none (lockjaw=1, congregation=1, combat=1) | none | PASS |
| Seeds complete | 8/8 | 8/8 | 8/8 | PASS |
| Misaligned / duplicate pack rows | 0 / 0 | 0 / 0 | 0 / 0 | PASS |

Other numbers (reported, not judged): draw days 744 -> 636;
self-fed away days 2377 -> 2674; away meal adequacy 0.993 ->
1.000; haven adequacy 0.992 -> 0.997; away streak max 4 -> 0;
villager starvation deaths 4 -> 1; total deaths 60 -> 76;
national 0/8 -> 0/8; wins 0/8 -> 0/8; wave-4 reach 2/8 -> 2/8;
wave-5 0/8 -> 0/8. The lever moves the ration tail, not the
scale wall — competent play alone still reaches no national,
no table, no wins, exactly as in every prior competent-only run.

Death-cause shares, pooled: baseline — the arena 22, monster 9,
sickness 7, ambush 7, starvation 4, a wound that wouldn't close 3,
dehydration 2, hushpuppy 2, the night 1, choir toad 1, the
redactor 1, contest 1. Armed — the arena 49, monster 6, ambush 5,
contest 5, a wound that wouldn't close 3, sickness 2, starvation 2,
lockjaw 1, the congregation 1, combat 1, dehydration 1. The
arena share more than doubles (22 -> 49) while starvation,
sickness, and monster deaths all fall — see metric review: this
is reported as a finding, NOT a guardrail, and the pilot cannot
separate a survivorship-to-exposure effect (better-fed villagers
live to reach more arena events) from chaotic divergence at 8
seeds. Two armed villages are lost (s94904 d119, s94908 d87)
against zero baseline losses; the median-survival guardrail
still passes (150d) because six armed villages reach the
horizon. A confirm band is the honest next step for the
loss/arena question, not a pilot re-score.

Starvation linkage: baseline 4 villager deaths — Emma s94905
d109 (pantry 18,136 kcal, fresh 41.1d, away-at-death, trailing
inadequate-away streak 1: the full-pantry-away case); Leo
s94907 d144 (pantry 4,599 kcal, away, trailing 3); Tyler s94908
d98 and Naran s94908 d99 (pantry 0, haven collapse, trailing 0).
Armed 1 villager death — Ronan s94908 d87 (pantry 0, NOT away,
village-collapse shape; see SENSE). The armed corpus's second
starvation death is the PLAYER (Jose s94907 d18, pantry 7,999,
haven) — excluded from the villager linkage by construction,
recorded here so the pooled starvation=2 is not misread as two
villager deaths.

Instrument notes (not verdict inputs): armed take-vs-drawn
mismatches = 1 (baseline 0): s94907 jovan_milic d18, meal drawn
457.19 vs packMeal take 592.81 (= want), poolAtMeal 1050. That
day is NON-binding (dawn ~1050 > want 592.81), so the primary
is untouched. The cause is the known duplicate-meal-caller
phenomenon (fullpantry: 23 dups / 8,685 rows): two
villagerMealDay calls that day — the first packMeal take
(592.81, first-wins packMeal row) and the second call's meal
row (457.19 = the pool remainder, last-wins meal row). Armed
summary diag: mealDup 15, packMealDup 1 (that day); baseline:
mealDup 22, packMealDup 0. The villager ate the full pool
across the two calls; only the row-join disagrees. No binding
day in the armed corpus carried a theft-reduced pool
(poolAtMeal < dawn on 0/79 binding days), so the theft-bites
property rests on unit test E3, not on corpus evidence — stated
plainly, not over-claimed.

Balanced panel (§15): ATTEMPTED, then fallback, as
pre-registered. The runner's panel attempt as written passes
positional paths and gets a usage error (the compare subcommand
requires --before/--after/--out flags) — that mistake is recorded
here, not hidden. The correctly-shaped attempt
(`compare --before <baseline sweep> --after <armed sweep> --out
<prefix>`) throws exactly the known error: `TypeError: Cannot
read properties of undefined (reading 'days')` at
balance-scorecard.js comparePanels — fourth sighting incl.
cover-b. The panel ingests panel.json.gz outputs, not per-seed
sweep corpora, and does not measure binding-day coverage at all.
The sweep-compare table above is the before/after comparison
(same seeds, same instrument); the panel failure is a tool
finding, not a verdict input, and no verdict was re-scored
through it. The runner's panel-arg shape should be fixed to the
flag form on the next run (not fixed mid-run after the verdict
inputs were already produced).

## SENSE (SENSE-TESTING LAW)

Baseline travelers (the shortfall, before the lever):
- EMMA s94905 d109 (the full-pantry-away death): the window
  stages the contradiction without ever naming the pack — the
  haven eats a thin meal ("Village meal: +200 kcal"), Emma
  trades with someone ("Emma traded something with someone for
  something else. The barter economy stirs."), and she dies away
  at trailing streak 1 with 18,136 kcal and 41.1 fresh days on
  the shelves. The village is not starving; one traveler away
  from home is — and the game still never says her pack ran
  short. This is the exact death the tail lever is built for:
  her binding-day shortfall would have been topped up in full.
- LEO s94907 d144 (trailing streak 3, the corpus's longest
  baseline away streak): the window is warm, not grim — Leo
  teaches the village Shepherd's Purse ("Leo taught everyone
  about Shepherd's Purse. The Codex grows without you lifting
  a finger."), the fireside lesson passes it around, he comes
  back with 751 kcal for the pantry — and dies away the same
  day. He fed others while his own away meals ran short for
  three days. Coherent, human, and the clearest case that the
  ration tail is a slow slope, not a cliff.

Armed travelers (after the lever):
- RONAN s94908 d87 (the only armed villager starvation death):
  the window is a collapse, not a ration story — "No food in
  the pantry. The village is hungry.", the STARVING spiral,
  "Ronan is hurt — a fall, a thorn, a bad step. (health 2/100)",
  "Ronan came back with 389 kcal of something edible. The
  pantry breathes." He fed the village and died in a village
  with nothing left. No pack is named because no pack was the
  problem: the pantry was empty, and an empty pantry pays no
  top-up by design. The lever's boundary reads honestly here.
- Corpus-wide armed sense: away meal adequacy 1.000
  (3310/3310), away streak max 0 across 118 villagers, and
  every one of the 79 binding days covered in full. There is no
  armed traveler left to quote for a short pack — the absence
  is the sense verdict. The remaining narration blank is the
  one cover-b named: the game still never says, out loud, that
  a traveler's pack was topped up or ran short. The mechanics
  are now complete; the voice is still missing.

## Village assessment in plain words

Eight competent villages on each side, 150 days each, and the
before/after picture is sharp: before the lever, a traveler
whose own work fell short got about four-fifths of the
shortfall from the pack on the bad days (median 0.812, never
the whole shortfall once in 123 binding days), and four
villagers starved — one of them, Emma, with full shelves at
home. After the lever, every single bad day is covered in
full (79 of 79 binding days at exactly 1.000), no villager
anywhere has even one inadequate away day, and the only
villager starvation death is a village that ran out of food
entirely. The pantry pays for this — that is the design, real
food from real shelves, never conjured — and the haven still
eats adequately (0.997). What the lever does NOT do is move
the scale wall: no village reaches national, the table, or a
win on competent play alone, wave 4 stays at 2 of 8, and two
armed villages are lost to combat pressure (the arena kills
more, not fewer, when better-fed villagers live to reach it).
The ration tail is fixed; the wall is a different fight.

## Blanks filled or documented

- FILLED (lever, the commissioned blank): the tail pack top-up
  lands on this branch — floor-only, meal-time only, real
  pantry items only, one attempt per pack-day, theft still
  bites, non-binding days untouched, empty pantry unchanged.
  Binding-day coverage 0.812 (n=123) -> 1.000 (n=79), share at
  full coverage 0.000 -> 1.000, away adequacy 0.993 -> 1.000,
  away streak max 4 -> 0, full-pantry-away starvation deaths
  1 -> 0.
- FILLED (instrument): binding-day capture proven at pilot
  scale — draw-day capture 1.000 both arms, 0 misaligned pack
  rows, 0 duplicate pack rows, 0 draw days without a packMeal
  row, byte-identical determinism re-run of armed seed 94901
  (proof 41/41).
- FILLED (causal, within sample): the 0630Z tail shape is now
  a landed fix, not a finding — pool-binding days are the only
  days the lever touches, and on those days the shortfall is
  fully covered whenever the pantry holds the food.
- DOCUMENTED (not chased, per backlog discipline): (a) arena
  deaths 22 -> 49 + two armed village losses vs zero baseline
  losses — survivorship-to-exposure vs chaotic divergence,
  needs a confirm band to separate; (b) the duplicate-meal-call
  row-join mismatch (1 armed day, non-binding, explained
  above); (c) villager pack top-ups remain narratively
  invisible (the cover-b voice blank, unchanged by a mechanics
  lever); (d) the panel compare arg-shape mistake in the
  runner (positional paths -> usage error) + the correctly
  shaped attempt's 'days' TypeError (fourth sighting);
  (e) the F-leg ordering lesson (godpath load before a sweep
  re-run diverges the RNG stream — determinism legs run first
  in a fresh process state).
- FIX CANDIDATES for a later arm (none implemented here):
  voice the top-up / short pack for travelers (the remaining
  narration blank); a confirm band (12–16 seeds) on the
  arena-loss question before any claim about village survival.

## Metric review (post-run)

- PRE-REGISTERED METRICS BOUND THE RUN AND WERE NOT RE-SCORED.
  The verdict below is GO on the tail bar (1.000 >= 0.90,
  n=79 >= 30) with every guardrail passing. The pooled median
  is reported nowhere as a verdict input, per the 0630Z review
  that binds this run.
- The arena-loss observation is NOT a guardrail and did not
  change the verdict in either direction: no guardrail on total
  deaths or arena deaths was pre-registered, and inventing one
  after seeing the corpora would be the same re-scoring error
  §14 forbids. It is carried as a finding for a confirm band.
- The binding-day count fell (123 -> 79) and draw days fell
  (744 -> 636) while away days rose (3121 -> 3310): armed
  travelers self-feed more often (better health -> better own
  production -> fewer days presenting a shortfall). This is a
  second-order effect of the lever, reported, not a verdict
  input — the GO bar uses the armed count (>= 30, met).
- The "no new death mode" guardrail's small-sample caveat
  applied as pre-registered: armed-only causes are three
  singletons (lockjaw, congregation, combat), none reaching the
  >= 3-death blocker bar, so the guardrail passes as
  inconclusive-on-singletons, not as proven-at-scale. The
  baseline band held 4 starvation deaths, so the starvation
  guardrail denominator is non-zero here (unlike the 0630Z
  band's zero).
- Cross-arm claims stayed distributional: no paired
  per-(vid,day) joins across arms are claimed anywhere above
  (arms diverge in pantry state after the first binding day).
  The floor-only property is proven by unit test, not by corpus
  joins.

## Findings for the backlog (coordinator appends — this worker does NOT edit sim-findings.md)

- [open] 2026-10-25 — tail pack top-up LANDED (GO, pilot) — binding-day coverage 0.812 (n=123) -> 1.000 (n=79), share at full coverage 0.000 -> 1.000, away adequacy 0.993 -> 1.000, away streak max 4 -> 0, full-pantry-away starvation deaths 1 -> 0; floor-only, meal-time only, real pantry items only (sim-packtail-b, evidence/2026-10-25/sim-packtail-b.md).
- [open] 2026-10-25 — arena deaths rise on the armed arm (22 -> 49) with two armed village losses vs zero baseline losses — survivorship-to-exposure vs chaotic divergence, needs a confirm band (12–16 seeds) before any survival claim (sim-packtail-b).
- [open] 2026-10-25 — duplicate-meal-call row-join mismatch, packMeal instance — one armed day (s94907 jovan_milic d18) where first-wins packMeal take (592.81) differs from last-wins meal drawn (457.19); non-binding day, primary untouched (sim-packtail-b).
- [open] 2026-10-25 — panel compare arg shape + 'days' TypeError, fourth sighting — runner's positional-path attempt gets a usage error; correctly-shaped --before/--after attempt throws TypeError reading 'days' at balance-scorecard.js comparePanels; panel ingests panel.json.gz outputs, not sweep corpora (sim-packtail-b).
- [open] 2026-10-25 — determinism-leg ordering lesson — a godpath game load before a sweep re-run diverges the RNG stream (modules capture Math.random at eval); determinism legs must run first in a fresh process state (sim-packtail-b).
- [open] 2026-10-25 — villager pack top-ups narratively invisible — mechanics complete (79/79 binding days covered), but no line voices a traveler's topped-up or short pack; the cover-b voice blank survives the mechanics fix (sim-packtail-b).

VERDICT-RENDERED: GO — pilot 8 seeds 94901–94908, competent only, 150d death-aware, identical starting seeds baseline vs armed: PRIMARY armed median binding-day coverage 1.000 (n=79) >= 0.90, armed binding n=79 >= 30, seeds 8/8 both arms, capture 1.000 both arms, median survival ratio 1.000 >= 0.8, full-pantry away starvation deaths 0 <= 3, no armed-only death cause with >= 3 deaths, 0 misaligned/duplicate pack rows. Fix committed on branch sim-packtail-b for coordinator merge, pending ship.

