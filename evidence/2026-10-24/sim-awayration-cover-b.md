# sim-awayration-cover-b — RE-REGISTERED pack-draw-day coverage (measurement only)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261025T0030Z,
arm sim-awayration-cover-b, axis food-economy.
Worker tree: ~/workspace/worktrees/sim-awayration-cover-b.
MEASUREMENT RE-REGISTRATION ONLY: ZERO src/js game changes, no lever
re-pricing, no away-ration fix landed. This arm answers the single named
blank from the 2330Z size arm: re-register pack coverage on pack-draw
days before any re-judgment, because the size arm's literal bar
(531/3,336 = 0.159) conflated self-fed away days (no pack drawn, by
design) with pack-draw days (a pack exists on every one, 529/529).

## Canon

READ docs/CANON.md first, then docs/PRESERVATION.md (the food ladder;
pack food moves only what fits in the actual pack). The mechanism under
test is game code, verified in src/js/game.js (not taken on faith):
packKcal reseeds at dawn — base 800 + Math.random()*500 − hunger*3 +
(bold ? 150 : 0), clamped >= 200, drawn as real items from the pantry
by pantryDraw — while a villager's daily need is ~2,000 kcal. Away
villagers eat via packMeal, which calls packKcal and takes
min(pool, dayWant); villagerMealDay returns drawn = pile.taken. No canon
doc covers away-ration sizing — if the measurement names a size, it
is a finding, not canon. No canon doc is invented here.

## PRE-REGISTRATION (bound per MEASUREMENT.md §14 — a miss is NO-GO, never re-scored)

- Substrate: branch sim-awayration-cover-b (current master at run
  start). Policy: competent ONLY (scripts/policies/competent.js,
  unmodified). Env (explicit, = shipped defaults): PLENTYDEPRI=1,
  DEPOSITGATE=1. Horizon: 150d death-aware cap (dead villages
  stop; runDays endReason recorded per seed; no fixed-200d run,
  no tail padding beyond the harness's own stop).
- Seeds: FRESH BAND 94701–94732 (32 seeds, single band, no pilot/ext
  split). Freshness verified BEFORE sweeping against
  evidence/2026-10-24/*.md files AND per-seed corpus filenames in
  evidence/2026-10-24/ (runner freshness pre-check: exact "seed"
  fields in every other *-corpus dir + corpus filenames — zero hits,
  printed "FRESHNESS OK"; the analyzer re-asserts the C1 gate over
  every other *-corpus dir and aborts on a hit). No collision, so no
  shift was needed; the runner fails loudly on any collision rather
  than silently shifting (the pre-registered band binds the analyzer
  constants). Never reused a seed band from any prior run; the
  sibling casecount arm's outputs were not consumed.
- Instrument (new files, -cover-b suffix, no prior -diag-b/-confirm-b/
  -size-b file overwritten): scripts/sweep-awayration-cover-b.js,
  scripts/analyze-awayration-cover-b.js,
  scripts/test-awayration-cover-b.js,
  scripts/run-awayration-cover-b.sh. The sweep is the size-b capture
  unchanged (villagerMealDay wrapper, meal-row last-wins dedupe,
  packKcal reseed-only first-wins capture); only names, the seed
  band, and the corpus dir changed.
- Definitions (fixed before sims — DENOMINATOR STATED EXPLICITLY so
  the next run cannot re-misspecify it):
  - Away villager-day = a deduped meal row with away === true.
  - Pack-draw day = an away meal row with drawn > 0 (packMeal
    actually took food from the pack). drawn comes from the
    villagerMealDay result; pack rows come from the independent
    packKcal wrapper — two different captures, so the coverage
    ratio is a capture-completeness test, not a tautology.
  - Self-fed away day = an away meal row with drawn === 0. Self-fed
    days are NOT in the denominator, by design: no pack is drawn,
    so no pack row can exist for them, and forcing a dawn packKcal
    call for them would draw pantry food they do not need and
    change the thing being measured (size-b metric review).
  - Pack-draw-day coverage = pack-draw days with a joined pack row
    (packDay === day) / all pack-draw days.
  - Meal adequacy = ate >= 0.6 * needEst (needEst = kcalPerDay ||
    2000), as in size-b.
  - Pack/need ratio = packKcal / needEst on the joined day.
  - Pack rows with no draw-day meal (e.g. steal/intimidate reseeds)
    are context only — never numerator, never denominator.
- Primary metric: pack-draw-day coverage (above).
- GO threshold: coverage >= 0.90 (expected ~1.000 per the 2330Z
  finding). GO additionally requires: all 32 seeds complete, 0
  misaligned pack rows, 0 duplicate pack rows, and all primary +
  diagnostic numbers printed. A miss on any of these is NO-GO.
- Diagnostics (do NOT overturn the primary): pack/need median,
  median pack kcal, pantry-at-draw median, count of packs drawn
  under 5,000 kcal pantry — replicated against the 2330Z size numbers
  (pack/need median 0.432, median pack 880 kcal) as a replication
  check; any drift is reported, not hidden.
- WATCH (report-only): wall numbers (national / table+wins / wave
  reach / median / max survival), death-cause shares, haven vs away
  meal adequacy, per-death linkage table with quotes, villager
  behavior (SENSE-TESTING LAW: transcripts read, beats quoted —
  never just counts).
- Balanced panel per §15: ATTEMPTED, then fallback, stated
  explicitly, not silently skipped — `node scripts/balance-panel.js
  compare` on the two sweep corpora throws
  `TypeError: Cannot read properties of undefined (reading 'days')`
  in balance-scorecard.js comparePanels: the panel ingests
  panel.json.gz outputs, not per-seed sweep corpora (same finding
  as prior arms). This arm is single-policy with no comparison arm
  and no game change, so there is no before/after panel to run;
  the comparison below is a sweep-compare table (cover vs size
  replication diagnostics) instead.
- Metric review (pre-sims):
  - The 2330Z literal coverage (0.159) is reported below as context
    only. It is NOT the verdict and does NOT overturn GO/NO-GO.
  - A pack row with packKcal 0 (empty-pantry reseed) counts as a
    pack row for coverage only when its day is a draw day
    (drawn > 0); a 0-kcal pack can never produce drawn > 0, so such
    rows land in the without-draw-day context count, correctly.
  - The code's internal need is (kcalPerDay)*(0.7+0.3*healthFactor)
    (haven hearth stretch aside); the instrument's needEst is
    kcalPerDay || 2000, matching size-b, so ratios are comparable
    across runs even though they are not the code's internal need.

## Results

COMPLETE CORPUS (32 seeds: 94701–94732, 1 config, competent, 150d
death-aware, PLENTYDEPRI=1/DEPOSITGATE=1). Attempt history, stated
honestly: the first runner attempt died after seed 94709 with no
summary written (background session lost; per-seed files intact).
Attempt 2 re-ran the whole band deterministically (per-seed files
overwritten; the determinism leg below proves seed 94701 re-runs
byte-identical) and completed all 32 seeds + summary + analyzer.
No verdict was rendered before the completed run, so no re-run
followed a verdict.
Full analyzer output: run
`node scripts/analyze-awayration-cover-b.js` in this tree (corpus:
evidence/2026-10-24/awayration-cover-b-corpus/). Proof:
`node scripts/test-awayration-cover-b.js` — 37/37 legs including
the live byte-identical determinism re-run of seed 94701.
Analyzer bug found and fixed BEFORE any verdict: the first analyzer
run crashed with `packNeedStats(undefined)` on a leftover
joinedByStratum.pilot key (stratum renamed to band, one reference
missed). Fixed to joinedByStratum.band, re-ran; no number changed
(the crash printed nothing, so nothing was published from it).

Per-seed wall (runner numbers: meals = mealRows, packs = packRows):

| seed | days | end | wave | deaths | meals | packs |
|---|---|---|---|---|---|---|
| 94701 | 150 | survived | 4 | 6 | 1,462 | 147 |
| 94702 | 150 | survived | 3 | 4 | 1,220 | 127 |
| 94703 | 150 | survived | 4 | 3 | 1,593 | 65 |
| 94704 | 150 | survived | 3 | 7 | 1,132 | 89 |
| 94705 | 150 | survived | 3 | 7 | 1,288 | 68 |
| 94706 | 150 | survived | 3 | 12 | 882 | 64 |
| 94707 | 117 | village-lost | 3 | 19 | 886 | 46 |
| 94708 | 150 | survived | 3 | 10 | 1,098 | 77 |
| 94709 | 150 | survived | 3 | 7 | 1,271 | 44 |
| 94710 | 150 | survived | 3 | 6 | 1,308 | 110 |
| 94711 | 150 | survived | 3 | 5 | 1,389 | 58 |
| 94712 | 150 | survived | 3 | 5 | 1,139 | 40 |
| 94713 | 26 | village-lost | 1 | 9 | 259 | 17 |
| 94714 | 126 | village-lost | 4 | 17 | 974 | 55 |
| 94715 | 139 | village-lost | 4 | 23 | 1,087 | 66 |
| 94716 | 150 | survived | 4 | 7 | 1,409 | 66 |
| 94717 | 107 | village-lost | 4 | 17 | 953 | 77 |
| 94718 | 150 | survived | 3 | 10 | 1,132 | 85 |
| 94719 | 150 | survived | 3 | 5 | 1,297 | 110 |
| 94720 | 150 | survived | 4 | 4 | 1,259 | 57 |
| 94721 | 150 | survived | 3 | 4 | 1,402 | 76 |
| 94722 | 150 | survived | 2 | 4 | 1,165 | 102 |
| 94723 | 146 | village-lost | 4 | 14 | 996 | 83 |
| 94724 | 150 | survived | 3 | 1 | 1,635 | 89 |
| 94725 | 123 | village-lost | 4 | 15 | 1,067 | 96 |
| 94726 | 150 | survived | 4 | 12 | 1,240 | 33 |
| 94727 | 140 | village-lost | 4 | 16 | 1,133 | 69 |
| 94728 | 150 | survived | 3 | 4 | 1,256 | 18 |
| 94729 | 98 | village-lost | 3 | 12 | 591 | 72 |
| 94730 | 147 | village-lost | 4 | 17 | 1,118 | 58 |
| 94731 | 150 | survived | 3 | 12 | 1,218 | 74 |
| 94732 | 150 | survived | 3 | 13 | 1,150 | 98 |

Median survival 150d (capped), max 150d, national 0/32,
table/wins 0/32 (competent alone carries no scale push —
expected, not chased), wave 4 on 12/32, wave 5 on 0/32, Arc III
on 32/32, rank village on 32/32. Pooled death-cause shares (307
deaths): the arena 156, monster 45, sickness 23, a wound that
wouldn't close 16, contest 13, ambush 11, dehydration 11,
starvation 7, alien 3, gavel 2, the night 2, the union rep 2,
combat 2, and 14 singles. Starvation deaths total 7: the 6
villagers in the linkage below plus 1 player death in the s94713
collapse (Addison, excluded from the villager linkage by
construction, recorded in the corpus).

PRIMARY METRIC (pre-registered, binds the verdict):

- Pack-draw-day coverage: 2,320 / 2,320 = 1.000 — GO (>= 0.90).
  Per-seed coverage is 1.000 on ALL 32 seeds (no seed below 1.000,
  no seed with zero draw days; smallest draw-day count is 17 on
  s94713, largest 147 on s94701).
- Away villager-days: 11,649 (self-fed 9,329 + draw days 2,320).
- Pack rows total: 2,336; pack rows without a draw-day meal: 16
  (steal/intimidate reseeds and empty-pantry 0-kcal reseeds —
  context only). 0 misaligned pack rows, 0 duplicate pack rows,
  meal-dup total 94 (last-wins dedupe, as in size-b), packSkip
  total 7.
- Literal coverage, context only (NOT the verdict): 2,336/11,649
  = 0.201 — higher than size-b's 0.159 because the draw-day share
  is higher here (2,320/11,649 = 19.9% vs 15.9%), not because
  capture changed.

REPLICATION DIAGNOSTICS (cover vs 2330Z size-b — sweep-compare
table in place of the panel compare, per §15 note above):

| diagnostic | size-b (2330Z) | cover-b (this run) | drift |
|---|---|---|---|
| pack/need median, draw days | 0.429 (n=529) | 0.431 (n=2,320) | +0.002, negligible |
| pack/need median, all joined | 0.432 (n=531) | 0.430 (n=2,336) | −0.002, negligible |
| pack/need Q1 / Q3, draw days | 0.366 / 0.497 | 0.364 / 0.502 | negligible |
| share pack/need < 0.6, draw days | 0.949 | 0.944 | −0.005 |
| median pack kcal, draw days | 880 (range 510–1,400, joined) | 900 | +20, within seed variation |
| median pantry at draw | 32,133 kcal | 23,210 kcal | −8,923; see below |
| packs drawn with pantry < 5,000 kcal | 4/531 = 0.8% | 91/2,320 = 3.9% | higher, see below |
| away meal adequacy | 0.993 | 0.995 | +0.002 |
| draw-day adequacy | 0.955 (505/529) | 0.975 (2,263/2,320) | +0.020 |
| self-fed adequacy | 0.999 (2,806/2,807) | 0.999 (9,322/9,329) | identical |
| starvation deaths preceded by >= 3 inadequate away days | 0/4 | 0/6 | same zero |

Pantry drift, judged honestly: the pantry-at-draw median fell and
the sub-5,000 share rose, but the pantry is still not the limiter
for 96.1% of draws, and the pack/need median did not move — the
formula ceiling, not the shelves, still caps the ration. The
difference is plausibly sample composition: this 32-seed band
includes early-collapse villages (s94713 dies at day 26 with an
empty pantry; s94729/s94725 lose villages with pantry 0 at
death) that the 8-seed size pilot barely sampled. It is reported
as a composition note, not as a pantry-limit finding: on draw
days the pack still cannot reach need even when the pantry is
full (Leo's pack 720 kcal drawn from a 106,895-kcal pantry at draw
time, below).

OTHER PRIMARY-SET NUMBERS:

- Away meal-day adequacy (ate >= 0.6*need): 11,585/11,649 = 0.995.
  Haven adequacy: 25,151/25,360 = 0.992.
- Streaks (consecutive inadequate away days): median of
  per-villager max streaks = 0, global max = 3, villagers counted
  = 469, villagers with max >= 3: 2.
- Villager starvation deaths: 6; share preceded by >= 3
  inadequate away days: 0/6 = 0.000 (trailing streaks 0, 0, 0, 1,
  1, 2 — see table).

STARVATION DEATH LINKAGE (all 6 villager deaths, meal history + pack):

| seed | day | villager | pantry | fresh | pack | ate/need | hp@meal | trail | sinceAdeq | away? |
|---|---|---|---|---|---|---|---|---|---|---|
| 94713 | 25 | Arsen | 0 | 0d | — (haven, drawn 500) | 576/2,400 | 3 | 0 | 1 | no |
| 94713 | 25 | Helga | 0 | 0d | — (haven, drawn 1,150) | 1,265/2,293 | 4 | 0 | 3 | no |
| 94713 | 25 | Nina | 0 | 0d | — (haven, drawn 0) | 121/2,000 | 5 | 0 | 4 | no |
| 94723 | 141 | María | 3,000 | 1.2d | 600 | 652/2,412 | 2 | 1 | 1 | yes |
| 94725 | 47 | Leo | 106,175 | 38.3d | 720 | 871/2,400 | 5 | 1 | 1 | yes |
| 94729 | 98 | Ingrid | 0 | 0d | 0 | 245/2,000 | 10→2 | 2 | 2 | yes |

The s94713 trio is a village-collapse shape, not an away-ration
shape: the whole village starves on day 25 with an empty pantry
("No food in the pantry. The village is hungry."), and the three
deaths share one day. The three away-at-death cases split two
ways: María and Leo are the size-b shape exactly — low health
(2 and 5 HP) + a short pack meal (600 and 720 kcal, ratios 0.249
and 0.300) on a full-enough pantry — while Ingrid is the
empty-pantry variant — pack 0 kcal because the pantry is empty,
own production collapsing across d96–98 (hp 49 → 22 → 10 → 2),
death-day meal drawn 0 (self-fed away day, so NOT a draw-day
death; her 0-kcal pack rows sit in the 16 without-draw-day
context rows). Prolonged away streaks still do not explain any
starvation death here (0/6 at >= 3, third run in a row counting
fullpantry + size-b).

## Metric review (post-run)

- PRE-REGISTERED METRICS BOUND THE RUN AND WERE NOT RE-SCORED.
  The verdict below is GO on the re-registered draw-day bar
  (1.000 >= 0.90), with all completeness gates passing (32/32
  seeds, 0 misaligned, 0 duplicate pack rows). The literal
  coverage (0.201) is context, not a second verdict — applying it
  as a bar would repeat the exact misspecification this run was
  commissioned to retire.
- The draw-day denominator is now proven non-circular: drawn
  comes from the meal result, pack rows from the packKcal
  wrapper, and the two agree on 2,320/2,320 days across 32 seeds
  with per-seed coverage 1.000 throughout. A capture failure
  would have shown up as a draw day with no pack row; none did.
- The 16 pack rows without a draw-day meal are NOT a coverage
  miss: a pack row exists because packKcal was called (theft,
  intimidation, or an empty-pantry reseed), not because a pack
  was drawn for a meal. Counting them as misses would
  re-introduce the same denominator error in the other direction.
- Pantry drift (median 23,210 vs 32,133; sub-5,000 share 3.9% vs
  0.8%) is a metric-review note for the NEXT run, not a verdict
  change: if a future arm wants a pantry-limit claim, it should
  pre-register a pantry-stratified pack/need split (draw days with
  pantry >= 5,000 vs < 5,000) rather than comparing pooled
  medians across different seed compositions.
- "The arena" (156/307 deaths) remains the largest cause family
  and is NOT investigated here (out of axis scope). It does not
  touch the away-ration measurement.
- Balanced panel §15: fallback stated above (panel compare throws
  on sweep corpora; sweep-compare table used instead). No panel
  compare .md is attached, by that finding, not by omission.

## SENSE (SENSE-TESTING LAW)

Six starvation-death transcripts read in full (say + tele
windows), judged for meaning, not counts, plus a corpus-wide
pack/ration line census (307 deaths, 2,456 say + 2,456 tele
lines; 191 pack-mention lines, 37 ration-mention lines):

- MARÍA d141 (s94723, away): the window stages the contradiction
  cleanly — she feeds the village ("María worked the creek — 2
  fish, +360 kcal to the pantry"), the muster warns the treeline
  is beyond them, the reserves warning fires, the haven eats
  ("Village meal: +2340 kcal"), and she dies away at 2 HP on a
  600-kcal pack. Her own away hunger is never voiced: no line
  says she ate from her pack, or that her pack was short. The
  story the game tells is "she fed others and died out there";
  the ration that failed her is invisible in it.
- LEO d47 (s94725, away): the exception that proves the narration
  CAN name the dying villager — "Leo is hurt — a fall, a thorn,
  a bad step. (health 5/100)" fires the same day, alongside the
  STARVING spiral warning and the haven's meal ("Village meal:
  +2250 kcal"). But again no pack line: he dies away at 5 HP on
  a 720-kcal pack drawn from a 106,895-kcal pantry, and the game
  never says the pack was the shortfall. The hurt is narrated;
  the ration is not.
- INGRID d98 (s94729, away): the same shape from the other side —
  she feeds the village ("Ingrid worked the creek — 5 fish,
  +1020 kcal to the pantry"), the reserves warning fires, the
  haven eats ("Village meal: +2395 kcal"), and she dies away
  with a 0-kcal pack because the pantry is empty. The game
  shows her feeding others while starving; it never says her
  pack was empty.
- ARSEN / HELGA / NINA d25 (s94713, haven collapse): the window
  is honest about the collapse — "No food in the pantry. The
  village is hungry.", the STARVING spiral, the half-ration
  haven meal ("Village meal: +1143 kcal… (Half ration — they
  don't trust you yet.)"), and then the Codex closing entries
  ("Arsen starved. Slowly. Somebody's sleeping-roll stays rolled
  out. Nobody puts it away."). Coherent and consequential; this
  is a village that ran out of food, not a traveler who ran out
  of pack.
- PACK-LINE CENSUS (the sense verdict): the 191 pack-mention
  lines in death windows are overwhelmingly NOT villager pack
  draws — combat telemetry ("combat_start … \"pack\":1" = party
  size), the PLAYER's own pack ("You camp wild tonight — no
  pantry meal. Eat from your pack.", "Your pack is full."), and
  monster-pack counters ("Wound the lead and the pack breaks.").
  No line in the corpus names a villager drawing, eating, or
  running short of their away pack. So: pack draws are
  mechanically complete (1.000) and narratively invisible for
  villagers. The blank is voice, not capture — the same voice
  gap size-b flagged for low-health travelers, now confirmed on
  32 seeds: the game never says, out loud, that a traveler's
  pack ran short or was empty.

## Village assessment in plain words

Thirty-two competent villages, 150 days each, and the picture is
the sturdier, wider version of the size-b picture: twenty-two
villages live to the horizon, ten are lost (one as early as
day 26, in a village that simply ran out of food), wave 4 is
reached on twelve of them, and nobody gets near national or the
table on competent play alone — expected, not chased. Away
villagers mostly feed themselves — four in five away days need no
pack at all, and those self-fed days are adequate 99.9% of the
time. The pack only shows up on the bad days, when a villager's
own work falls short, and then it covers about two-fifths of a
day's need: enough, with what they caught, to stay over the
hunger line 97.5% of the time, but never enough on its own. The
capture question that commissioned this run is now closed: every
single pack-draw day in 32 villages carries its pack record —
2,320 out of 2,320, on every seed. Starvation itself is rare (7
of 307 deaths, 6 villagers in the linkage), and the deaths split
into a village that ran out of food and travelers who were
already hurt when a short pack meal found them. The village is
not starving; hurt travelers are — and the game still never says
so out loud.

## Blanks filled or documented

- FILLED (measurement, the commissioned blank): pack-draw-day
  coverage is now RE-REGISTERED and measured — 2,320/2,320 =
  1.000, per-seed 1.000 on all 32 seeds, with the denominator
  stated explicitly (drawn > 0 away meal-days; self-fed days
  excluded by design). The size-b DIAG-NO-GO verdict is NOT
  revised by this run (it stands on its own pre-registration);
  this run's GO is a new verdict on the corrected bar, and the
  next run should cite the draw-day denominator, not the literal
  one.
- FILLED (replication): the 2330Z size numbers replicate on 4×
  the seeds — pack/need median 0.431 vs 0.429 on draw days,
  median pack 900 vs 880 kcal, draw-day adequacy 0.975 vs 0.955,
  starvation >= 3 share 0/6 vs 0/4. The ration is still ~43% of
  need by construction; nothing in the larger sample moves it.
- FILLED (instrument): dawn-pack capture proven at scale — 0
  misaligned rows, 0 duplicate pack rows, meal-dup 94,
  packSkip 7, byte-identical determinism re-run of seed 94701
  (proof 37/37). The instrument is reusable; its coverage
  denominator is now the draw-day one.
- FILLED (causal, within sample): prolonged away streaks do NOT
  explain starvation deaths here either (0/6; longest streak 3
  days, and the two >= 3-streak villagers are not the deaths).
  The operative mechanisms are low-health + short away meal
  (María, Leo) and empty-pantry + collapsing own production
  (Ingrid), plus whole-village pantry exhaustion (s94713 trio).
- DOCUMENTED (not chased, per backlog discipline): (a) villager
  pack draws have no named narration — mechanically complete,
  narratively invisible (sense census above); (b) pantry-at-draw
  median drift + sub-5,000 share rise as a composition note with
  a pre-registration proposal for the next run (pantry-stratified
  split); (c) "the arena" as the largest cause family (156/307)
  — out of this arm's scope; (d) the 16 without-draw-day pack
  rows (theft/intimidate/empty-pantry reseeds) as context, not
  misses.
- FIX CANDIDATES (for a later arm, confirm-first rule, carried
  from size-b, none implemented here): (1) size the away pack to
  the day's actual shortfall instead of the fixed formula; (2)
  drop or floor the hunger penalty on pack draws; (3) voice away
  hunger for low-health travelers (now the confirmed narration
  blank, not just a death-shape note); (4) cite the draw-day
  denominator in any fix arm's pre-registration. None is landed
  here.
- NOTHING ELSE CHANGED: zero src/js changes (measurement arm),
  no lever re-priced, no size-b verdict re-litigated.

## Findings for the backlog (coordinator appends — this worker does NOT edit sim-findings.md)

- [open] 2026-10-24 — away-ration coverage re-registered on pack-draw days (GO) — 2,320/2,320 = 1.000, per-seed 1.000 on all 32 seeds (94701–94732); self-fed days (9,329) excluded from the denominator by design; literal coverage 0.201 is context only (sim-awayration-cover-b, evidence/2026-10-24/sim-awayration-cover-b.md).
- [open] 2026-10-24 — away-ration size replicates on 32 seeds — pack/need median 0.431 on draw days (size-b 0.429), median pack 900 kcal (size-b 880), 94.4% of draw days below 0.6 of need; formula ceiling, not pantry, still caps the ration (sim-awayration-cover-b).
- [open] 2026-10-24 — villager pack draws narratively invisible — 0 lines in 307 death windows name a villager drawing/eating/running short of their away pack; pack mentions are combat telemetry, the player's own pack, or monster-pack counters; the game never voices a traveler's short/empty pack (sim-awayration-cover-b).
- [open] 2026-10-24 — pantry-at-draw drift as composition note — median pantry at draw 23,210 kcal (size-b 32,133), sub-5,000 share 3.9% (size-b 0.8%); next run should pre-register a pantry-stratified pack/need split before claiming a pantry-limit effect (sim-awayration-cover-b).
- [open] 2026-10-24 — prolonged away streaks still do not explain starvation deaths — 0/6 preceded by >= 3 inadequate away days; operative shapes are low-health + short pack meal (María 600 kcal at 2 HP, Leo 720 kcal at 5 HP) and empty-pantry collapse (Ingrid pack 0, s94713 trio) (sim-awayration-cover-b).

## Verdict

VERDICT-RENDERED: GO — seeds 32/32 complete and pack-draw-day coverage 2,320/2,320 = 1.000 >= 0.90, with 0 misaligned and 0 duplicate pack rows and all primary + diagnostic numbers reported, so the pre-registered bar passes and the verdict is GO, never re-scored. The replication holds (pack/need median 0.431 vs 0.429, median pack 900 vs 880 kcal), the starvation >= 3 share stays 0/6, and the remaining blank is voice, not capture: the game never narrates a villager's short or empty pack.
