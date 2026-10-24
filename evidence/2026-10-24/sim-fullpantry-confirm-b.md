# sim-fullpantry-confirm-b — full-pantry starvation CONFIRM on fresh seeds (measurement only)

Run: oversight-flesh-out-loop-b (second axis), worker tree
~/workspace/worktrees/sim-fullpantry-confirm-b. DIAG/CONFIRM ONLY:
zero src/js game changes. No away-ration fix is landed here; that is
a later arm (confirm-first rule, backlog #942).

## Canon

READ docs/CANON.md first, then docs/PRESERVATION.md (the food
ladder: cleaned < cooked < smoked < rendered < pemmican; pack food
travels only what fits in the actual pack) and docs/BALANCING.md
(2,000 kcal/day adult need; pantry start ~47,250 kcal; tier-1 food
bar 8,000 kcal). The mechanism under test is game code, not canon:
villagerMealDay (src/js/game.js) feeds at-haven villagers from the
pantry (pantryDraw) and away villagers ONLY from their pack
(packMeal — "On the move, people eat what they carry"; the dawn
ration is drawn from the pantry by packKcal). No canon doc covers
away-ration sizing or a haven distribution rule — if the
measurement names one, it is a finding, not canon. No canon doc is
invented here.

## The question (backlog #938/#942, fresh-seed CONFIRM of sim-fullpantry-diag-b)

Sim-fullpantry-diag-b (evidence/2026-10-24/sim-fullpantry-diag-b.md,
seeds 94401–94416, competent, 150d) found 3/3 full-pantry
starvation deaths class A away-ration (DIAG-GO, GO-small-sample,
n=3); pooled with pantrystarve-b, 8/8 away, 0 haven. That claim is
thin (n=3: one contrary case would move the share to 0.750). This
run confirms or breaks it on FRESH seeds, with its own binding
pre-registration below. Pooled-with-prior-runs numbers are context
ONLY, never the verdict.

## PRE-REGISTRATION (binding per MEASUREMENT.md §14 — a miss is NO-GO, never re-scored)

- Substrate: branch sim-fullpantry-confirm-b (current master at run
  start). Policy: competent ONLY (scripts/policies/competent.js,
  UNMODIFIED). Env (explicit, = shipped defaults): PLENTYDEPRI=1,
  DEPOSITGATE=1. Horizon: 150d death-aware cap (dead villages
  stop; runDays endReason recorded per seed; no fixed-200d run,
  no tail padding beyond the harness's own stop).
- Seeds: PILOT 94421–94428 (8 fresh seeds). PRE-REGISTERED
  EXTENSION: if the pilot yields < 8 full-pantry villager
  starvation deaths, run band 94429–94436 (8 more seeds, same
  pre-reg) and judge the verdict on the POOLED sample from THIS
  RUN ONLY, with pilot and extension strata reported separately.
  If the pilot already yields >= 8, the extension NEVER runs.
  The sweep mechanically refuses any seed list other than exactly
  PILOT, exactly EXT, or exactly PILOT+EXT; the runner refuses to
  run once a line-start verdict line exists in this file
  (anchored guard: pre-reg prose mentioning the token does not
  trip it).
- Freshness (verified BEFORE sims, 2026-10-24): bands 94421–94436
  verified absent as exact "seed" fields from ALL per-seed
  corpora under evidence/2026-10-24 (python scan over every
  *-corpus dir, sweep-* files excluded): zero hits. The suggested
  bands were used unchanged. The analyzer re-asserts this C1 gate
  over every *-corpus dir except its own, and aborts on a hit.
- Sample: starvation deaths (cause canon 'starvation') across the
  runs. Player starvation deaths are excluded from the sample
  (recorded separately if any, including any meeting the
  full-pantry gate); the sample is villagers only.
- FULL-PANTRY definition (fixed before sims, same as diag-b): at
  death, pantryKcalLive >= 8,000 kcal AND pantryFreshDays >=
  3.0 days. Deaths meeting the kcal gate but missing the fresh
  gate are counted separately as kcal-only context, never in the
  verdict denominator.
- Per-death fields, meal record, and mechanism classes: exactly as
  defined in the diag-b evidence (analyzer applies classes from
  the deceased's OWN meal/away records + death ctx only — never
  from window words): A AWAY-RATION (away at death OR
  away-share of window meal-days [deathDay-7, deathDay] >= 0.5);
  B HAVEN-DISTRIBUTION (not A AND a haven meal-day in the window
  with drawn < 0.25 * needEst AND ate < 0.6 * needEst); C OTHER
  (neither, with a sub-reason from the record). Meal-row dedupe:
  one row per (vid,day). One quoted case per named mechanism.
- Primary metric: attribution shares over FULL-PANTRY starvation
  deaths only (shareA, shareB, shareC; denominator = count of
  full-pantry starvation deaths, NOT all starvation deaths).
- CONFIRM-GO (binding) iff pooled pilot+extension deaths from
  THIS RUN ONLY meet: n >= 8 full-pantry villager starvation
  deaths AND share A (away-ration) >= 0.80 AND every named
  mechanism with count > 0 has count >= 2 and >= 1 quoted case.
  If pooled n < 8 after the extension, the verdict is NO-GO on
  sample even if share A is 1.00. A miss is NO-GO, never
  re-scored against a friendlier metric mid-run.
- WATCH (report-only): win rate, vesting/national reach, Arc
  reach, wave reach (1–5), median/max survival, death-cause
  shares, wall numbers (national / table / wins, wave 4–5
  unlocks, median survival), total starvation deaths and
  full-pantry subset, days-since-adequate-meal distribution,
  haven vs away meal adequacy rates, villager behavior
  (SENSE-TESTING LAW: transcripts read, beats quoted — never
  just counts). Competent-only runs are expected to show 0
  national/table — report it, do not chase it.
- Instruments: scripts/sweep-fullpantry-confirm-b.js,
  scripts/analyze-fullpantry-confirm-b.js,
  scripts/test-fullpantry-confirm-b.js,
  scripts/run-fullpantry-confirm-b.sh — all DERIVED from the
  -diag-b versions; the -diag-b scripts are NOT modified.
- Balanced panel per §15: NOT APPLICABLE — this is a
  single-policy DIAG with no before/after comparison arm, so
  there is no compare to run through the panel. Stated here
  explicitly, not silently skipped: if a later run adds a
  comparison arm, it runs through the panel then.
- Metric review (pre-sims): same as diag-b (registerDeath
  call-through keeps game behavior intact; death-day pantry read
  is a post-meal lower bound, so the full-pantry gate is
  conservative; v.away is a travel-state record, exactly the
  state routing meals through packMeal; player "camp wild" lines
  never classify a villager). New in this run: the diag
  GO-small-sample qualifier does NOT carry over — n >= 8 is a
  hard gate in the verdict here, and the analyzer's verdict
  computation was changed accordingly (see Deltas).

## Deltas vs -diag-b (declared, verified by test-fullpantry-confirm-b.js)

1. Names/paths: fullpantry-confirm-b-*, corpus
   evidence/2026-10-24/fullpantry-confirm-b-corpus/.
2. Seeds: PILOT 94421–94428 + EXT 94429–94436 (sweep accepts
   exactly PILOT, exactly EXT, or exactly FULL; runner runs EXT
   only when the pilot yields < 8 full-pantry deaths).
3. Analyzer verdict rule (the ONLY semantic change): CONFIRM-GO
   requires n >= 8 AND shareA >= 0.80 AND every named mechanism
   (A/B) with count > 0 has count >= 2 and >= 1 quoted case.
   The diag rule (classified (A+B)/n >= 0.80 with a
   GO-small-sample strength qualifier) is NOT reused: a thin
   unanimous sample is NO-GO on sample here by design.
4. Test determinism leg seed: 94421 (confirm pilot) instead of
   94401 (diag pilot); test adds legs C0b/C0c proving the
   CONFIRM-GO rule text and verdict print.
5. Everything else identical in behavior: competent FIXED, env
   FATAL asserts, registerDeath CALLS THROUGH, meal wrapper
   (reads only, no RNG), extended death ctx, meal-row dedupe
   (replace, last call wins, mealDupCount), writeRobust (300
   attempts, 2s backoff), stdout to the caller's pipe, never
   redirected to a file.

## Results

COMPLETE CORPUS (16 seeds: pilot 94421–94428 + pre-registered
extension 94429–94436, 1 config, competent, 150d death-aware,
PLENTYDEPRI=1/DEPOSITGATE=1, attempt 1 — no EPERM failure, no
retries needed). The pilot yielded 1 full-pantry death (< 8), so
the extension ran exactly as pre-registered; the pilot alone
never ran a verdict. Full analyzer output: run
`node scripts/analyze-fullpantry-confirm-b.js` in this tree
(corpus: evidence/2026-10-24/fullpantry-confirm-b-corpus/).
Per-seed wall (analyzer + sweep summary):

| seed | stratum | days | end | wave | arc | deaths |
|---|---|---|---|---|---|---|
| 94421 | pilot | 150 | survived | 2 | III | 4 |
| 94422 | pilot | 150 | survived | 2 | III | 4 |
| 94423 | pilot | 150 | survived | 3 | III | 3 |
| 94424 | pilot | 150 | survived | 4 | III | 11 |
| 94425 | pilot | 150 | survived | 3 | III | 9 |
| 94426 | pilot | 149 | village-lost | 3 | III | 19 |
| 94427 | pilot | 150 | survived | 3 | III | 2 |
| 94428 | pilot | 135 | village-lost | 4 | III | 15 |
| 94429 | ext | 150 | survived | 4 | III | 9 |
| 94430 | ext | 117 | village-lost | 4 | III | 21 |
| 94431 | ext | 150 | survived | 3 | III | 8 |
| 94432 | ext | 150 | survived | 3 | III | 4 |
| 94433 | ext | 31 | village-lost | 2 | III | 6 |
| 94434 | ext | 150 | survived | 3 | III | 8 |
| 94435 | ext | 150 | survived | 3 | III | 6 |
| 94436 | ext | 150 | survived | 3 | III | 3 |

Median survival 150d (capped), max 150d, national 0/16,
table/wins 0/16 (competent alone carries no scale push —
expected, not chased, same as diag-b and pantrystarve),
wave 4 on 4/16, wave 5 on 0/16, Arc III on 16/16, scale rank
village on 16/16. Wave reach: wave 1 16/16, wave 2 16/16,
wave 3 13/16, wave 4 4/16, wave 5 0/16. No separate vesting
field exists in this instrument, so no vesting number is
invented here: rank/national/win above are the reach numbers
recorded, and vesting instrumentation is a documented gap,
not a chased item.
Pooled death-cause shares (132 deaths): the arena 47,
monster 24, sickness 20, ambush 10, a wound that wouldn't
close 6, contest 5, starvation 5, choir toad 2, dehydration 2,
the expedition 2, combat 2, the humming in the grass 1,
spool 1, the redactor 1, the night 1, bulldozer 1,
experiment 1, bad belly 1.

STARVATION SAMPLE: 5 starvation death rows = 4 villagers + 1
player. Player excluded per pre-reg (Togzhan d116 s94430,
pantry 0 kcal — ordinary shortfall in a dying village, not
full-pantry). Villager starvation deaths = 4, of which
FULL-PANTRY (>= 8,000 kcal AND >= 3.0 fresh days at death) = 1.
The other 3 villager starvations are all pantry-0 famine in
collapsing villages (Hulya d145 s94426, Kavira d145 s94426,
Theo d29 s94433) — ordinary famine, reported as context,
never in the verdict denominator. Kcal-only context = 0.

FULL-PANTRY ATTRIBUTION (pre-registered classes, denominator 1,
THIS RUN ONLY):

| seed | day | villager | pantry | fresh | pop/hungry | away@death | class | sinceAdequate |
|---|---|---|---|---|---|---|---|---|
| 94425 | 139 | David | 16,744 | 3.7d | 10/0 | true | A away-at-death | 1d |

Shares: A = 1/1 (1.000), B = 0/1, C = 0/1. Pilot stratum
alone: A = 1/1; extension added 0 full-pantry deaths.
The single case meets the share bar but fails BOTH hard
gates: n = 1 < 8, and the only named mechanism (A) has
count 1 < 2. Per the binding pre-reg, pooled n < 8 after
the extension is NO-GO on sample even with share A 1.000.

WHAT THE ONE CASE ACTUALLY SHOWS (beyond the class label):

- David is the LOW-HEALTH + SHORT AWAY MEAL shape for a
  third run in a row (Stan and Misky in diag-b, and the
  pantrystarve 4-of-5 shape before them): 7 adequate meals
  in the window (2,076–2,398 kcal, haven and away mixed),
  health 60 at d138, then 8 at the d139 away meal, where a
  996 kcal pack meal finished him. The death-day tele
  window carries the cause of the collapse: an
  outmatched_escape from a "landlord" monster the same day
  (godpath_deed, via vFlee, field scene). He did not
  decline over days away — he fled a fight at low health
  and the short away meal was the trigger, not the whole
  cause. No prolonged-away-decline case occurred in this
  run at all.
- Meals are adequate ~99% of the time (haven 13,168/13,327,
  away 5,905/5,947; 19,274 deduped meal rows). Full-pantry
  starvation is a rare tail event here (1 of 132 deaths),
  not a broad distribution failure: no haven villager
  starved with a full pantry. The 3 other villager
  starvations did happen at haven — but with pantry 0 in
  villages whose shelves were already empty, which is
  famine, not distribution failure.
- The dedupe fix held: 33 duplicate (vid,day) meal calls
  were replaced, stored rows are one per (vid,day)
  (analyzer audit passes). The second caller is still
  unidentified — a standing instrument note, not a verdict
  threat, since classification uses awayAtDeath here.

SENSITIVITY (watch-only, NOT the verdict): the confirm
does not replicate diag-b's sample size, and that is the
finding. Diag-b found 3 full-pantry deaths in 16 seeds;
this run found 1 in 16 fresh seeds, with the same policy,
instrument family, and horizon. The rate itself varies
seed band to seed band (3/16 vs 1/16 villages yielding a
case), so the pooled-with-prior-runs 9/9 away figure
(diag 3 + pantrystarve 5 + confirm 1, all class A) is
context only: it says every full-pantry case seen so far
is away, but it does NOT close the confirm, because this
run's own pre-reg — the judge — demands n >= 8 from this
run alone and got n = 1. A confirm that needs 8 cases
would need a much larger seed band at this event rate
(roughly 8x the 16-seed yield, i.e. on the order of 100+
seeds, before any fix is priced on it) — that sizing is a
proposal for the NEXT run's pre-reg, not a re-score here.

## Metric review (post-run)

- Pre-registered metrics bound the run and were NOT
  re-scored. The verdict is the analyzer's CONFIRM-GO rule on
  the pre-registered denominator (full-pantry = kcal AND
  fresh, this run only). The share-A headline (1.000) is
  reported alongside the NO-GO, not instead of it: with
  n = 1, the share carries no weight, and the count rule
  (A >= 2) fails independently of the sample gate.
- The event rate, not the mechanism, is what broke the
  confirm: full-pantry starvation occurred in 1/16 villages
  here vs 3/16 in diag-b. A future confirm pre-reg should
  size the seed band from the observed rate (or pre-register
  a case-count stopping rule) instead of assuming 16 seeds
  yield 8 cases — that revision belongs to the NEXT run.
- Quote-picker note (instrument, not verdict): the
  analyzer's pickQuote prefers a line naming the deceased
  (+3) over a STARVING/spiral line (+2), so David's quoted
  case is the barter line ("David traded something with
  someone for something else.") while the meaningful
  pairing — "WARNING: reserves critical. Eat tomorrow or
  the spiral begins." plus the same day's "Village meal:
  +2673 kcal … from the communal pantry." — sits unquoted
  in the window dump. The quote rule did not change any
  classification (quotes are corroboration only), but a
  future run should consider scoring the spiral warning
  above a name-only barter beat. Proposed for the next
  run's pre-reg, not changed here post-hoc.
- Pantry kcal at death is a post-meal read (lower bound
  on what the shelves held at draw time) — the
  full-pantry gate is conservative, as stated pre-run.
- "The arena" (47/132 deaths) remains the largest cause
  family and is NOT investigated here (out of axis scope).
  It does not touch the starvation sample.
- Balanced panel §15: N/A as stated pre-run (single policy,
  no comparison arm). No panel compare is attached, by
  design.

## Sense (SENSE-TESTING LAW)

David's full-pantry death transcript (say + tele windows)
read in full, judged for meaning, not counts:

- DAVID d139 (class A): the window stages the gap, but
  quietly. The spiral warning fires ("WARNING: reserves
  critical. Eat tomorrow or the spiral begins.") on the
  same day the haven serves its own meal ("Village meal:
  +2673 kcal, +1L water from the communal pantry.") while
  David, away after fleeing the landlord fight, takes his
  last short pack meal. The contradiction IS the story
  again — the village eats, the traveler dies — but
  unlike Antwi (diag-b) there is no prolonged decline to
  narrate: David's collapse happens between two meals,
  off-screen, in a fight the window records only as a
  deed line (outmatched_escape). Sense verdict: the
  mechanism is real but, for David, nearly invisible in
  narration — the away-hunger invisibility finding, fourth
  sighting (pantrystarve, diag-b Stan, and now David).
  The village never says David is hungry away; it says
  its own reserves are critical while serving itself.
- ROBOTIC NOTE (minor, documented not chased): the
  "David traded something with someone for something
  else. The barter economy stirs." beat — chosen as the
  analyzer quote only because it names him — reads as
  filler on the day he dies. It is honest (a trade did
  happen in the log's vicinity) but it says nothing about
  his hunger, which is why the quote-picker note in
  Metric review matters: the narration that matters here
  is the warning-plus-communal-meal pairing, not the
  name-bearing beat.
- The other starvation deaths read as honest famine, not
  distribution failure: Hulya and Kavira die on the same
  day (d145, s94426) in a village down to 3–4 people with
  an empty pantry, and Theo (d29, s94433) dies in a
  village that collapsed by day 31. No shelves, no
  contradiction — the pantry-0 deaths stage scarcity
  plainly, which is the correct story for those villages.

## Village assessment in plain words

Sixteen competent villages, 150 days each, and the picture
is sturdier than the starvation scare suggested: twelve
villages live to the horizon, wave 4 reached on four of
them, and starvation itself is a tiny share (5 of 132
deaths). The villages that die, die recognizably: the
combat bloodbath (s94430, 21 deaths by day 117; s94426,
19 deaths and gone by day 149) and the fast collapse
(s94433, gone by day 31 with 6 deaths). The pantry is not
the problem in the villages that live — and in the one
village where a full pantry coincided with a starvation
death, it was one traveler at a time again: David, fleeing
a fight he could not win, eating a short pack meal at 8
health while the village ate from full shelves at home.
The village is not starving; one traveler at a time is —
and this time, the traveler was not even starving slowly.
He was hurt, away, and out of reach, and the game still
never says so out loud. The honest headline of this run
is not the mechanism (still 100% away, on one case) but
the rarity: a confirm built to collect 8 cases collected
1, because full-pantry starvation is rarer than the
diag run's band suggested. That rarity is itself
evidence about where the fix belongs in the queue —
behind problems that actually kill villages, like the
arena bloodbath — and about how big the next confirm
must be before anyone prices a ration fix on it.

## Blanks filled or documented

- FILLED (measurement): the diag-b claim was put to a
  fresh-seed confirm with a hard sample gate — and the
  confirm FAILED on sample (n = 1 < 8), which is a result,
  not a null: the claim is neither confirmed nor refuted,
  and the event rate (1/16 villages here vs 3/16 in
  diag-b) is now measured across two independent bands.
- FILLED (instrument): meal-row dedupe (33 replaced
  duplicates, stored rows unique per (vid,day)) and the
  CONFIRM-GO verdict rule (n >= 8 + shareA >= 0.80, no
  small-sample qualifier) are landed in the reusable
  instrument, with proof 31/31 including a live 150d
  determinism re-run of seed 94421 matching the pilot
  corpus exactly.
- FILLED (causal, within sample): the single full-pantry
  case is class A away-ration, and it is the low-health +
  short away meal half (David), not prolonged away
  decline — the prolonged half did not occur in this run.
  Haven-distribution remains 0 across all three runs
  (pantrystarve, diag-b, confirm: 0 haven cases in 9
  full-pantry deaths pooled as context).
- DOCUMENTED (not chased, per backlog discipline): (a)
  the away-hunger invisibility — David's collapse exists
  only in the meal log + a deed line, fourth sighting;
  (b) the quote-picker name-over-spiral preference —
  David's quoted case is a barter beat, not the warning;
  proposed scoring change for the next run's pre-reg;
  (c) the unidentified second villagerMealDay caller —
  dedupe contains it (33 replaced duplicates), caller
  still unnamed; (d) "the arena" as the largest cause
  family (47/132) — out of this arm's scope; (e) the
  NO-GO-on-sample itself — a future confirm needs a
  case-count-sized seed band (order ~100+ seeds at this
  event rate) before pricing any away-ration fix;
  (f) vesting has no field in this instrument — no
  number invented for it.
- NOTHING ELSE CHANGED: zero src/js changes (measurement
  arm), no lever re-priced, no diag-b or pantrystarve
  verdict re-litigated, no away-ration fix landed
  (confirm-first rule, backlog #942).

## Findings for the backlog (coordinator appends — this worker does NOT edit sim-findings.md)

- [open] 2026-10-24 — full-pantry starvation confirm NO-GO on sample — fresh-seed confirm of diag-b collected only 1 full-pantry starvation death in 16 seeds (pilot 1, extension 0), class A away-ration (David d139 s94425, pantry 16,744 kcal, 3.7 fresh days), vs the pre-registered bar n >= 8 + shareA >= 0.80 + every named mechanism >= 2 cases; share A is 1.000 but the sample gate and count rule both fail, so the diag-b claim is neither confirmed nor refuted; pooled context across three runs is 9/9 away, 0 haven (sim-fullpantry-confirm-b, evidence/2026-10-24/sim-fullpantry-confirm-b.md).
- [open] 2026-10-24 — full-pantry starvation event rate varies by seed band — 1/16 villages yielded a case here vs 3/16 in diag-b (same policy/instrument/horizon); a future confirm needs a case-count-sized band (order ~100+ seeds at this rate) or a pre-registered stopping rule before pricing any away-ration fix (sim-fullpantry-confirm-b).
- [open] 2026-10-24 — away-hunger invisibility, fourth sighting — David's collapse exists only in the meal log plus an outmatched_escape deed line; the village voices its own reserves warning while serving its own meal, never David's away hunger (sim-fullpantry-confirm-b).
- [open] 2026-10-24 — analyzer quote-picker prefers name-bearing beats over spiral warnings — David's quoted case is a barter line naming him, while the meaningful WARNING + Village-meal pairing sits unquoted; consider scoring spiral warnings above name-only beats in the next run's pre-reg (sim-fullpantry-confirm-b).
- [open] 2026-10-24 — villagerMealDay second caller still unidentified — dedupe now contains it (33 replaced duplicates this run, stored rows unique), but which second caller fires is still unknown (sim-fullpantry-confirm-b).

VERDICT-RENDERED: NO-GO (NO-GO-on-sample) — pooled deaths from THIS RUN ONLY: n = 1 full-pantry villager starvation death (pilot 1, extension 0), share A = 1.000, but n < 8 and the only named mechanism (A) has count 1 < 2; CONFIRM-GO requires n >= 8 AND shareA >= 0.80 AND every named mechanism >= 2 cases + quoted. The diag-b claim (3/3 away, GO-small-sample) is neither confirmed nor refuted. Pooled-with-prior-runs 9/9 away is context only.
