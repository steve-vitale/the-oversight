# sim-fullpantry-diag-b — full-pantry individual starvation DIAG, follow-up (measurement only)

Run: oversight-flesh-out-loop-b-20261024T2230Z (cron), axis food-economy.
Worker tree: ~/workspace/worktrees/sim-fullpantry-diag-b.
DIAG arm: findings-backlog #910 follow-up to sim-pantrystarve-b
(evidence/2026-10-24/sim-pantrystarve-b.md). ZERO src/js game changes.
Instruments + evidence + proof only. No lever re-priced, no PD=1 or
food-lever verdict re-litigated — diagnosis only, unless a root cause
proves trivial AND passes a before/after proof on identical seeds.

## Canon

READ docs/CANON.md first, then docs/PRESERVATION.md (the food ladder)
and docs/BALANCING.md (2,000 kcal/day adult need; pantry start
~47,250 kcal; tier-1 food bar 8,000 kcal). The mechanism under test
is game code, not canon: villagerMealDay (src/js/game.js) feeds
at-haven villagers from the pantry (pantryDraw) and away villagers
ONLY from their pack (packMeal — "On the move, people eat what
they carry"; the dawn ration is drawn from the pantry by packKcal).
No canon doc covers away-ration sizing or a haven distribution
rule — if the measurement names one, it is a finding, not canon.
No canon doc is invented here.

## The question (backlog #910, from sim-belongcost-adopt-b)

Belongcost found villagers starving with 21–42k kcal + 8–17 fresh
days in the pantry, hungry count 0, often while camping wild, in
BOTH PD arms. Pantrystarve-b (competent, seeds 94301–94308, 150d)
then found the mechanism unanimous but under-powered: 5/5
full-pantry starvation deaths were away villagers, 0 haven-
distribution deaths — but DIAG-NO-GO on sample size (n=5 < 8
required). This run is the powered follow-up: same competent
policy and instrument (with the two pantrystarve metric-review
fixes below), fresh seeds, and a pre-registered extension band
so the sample-size failure cannot recur by design.

## PRE-REGISTRATION (bound per §14 — a miss is NO-GO, never re-scored)

- Substrate: branch sim-fullpantry-diag-b (current master at run
  start). Policy: competent ONLY (scripts/policies/competent.js,
  unmodified). Env (explicit, = shipped defaults): PLENTYDEPRI=1,
  DEPOSITGATE=1. Horizon: 150d death-aware cap (dead villages
  stop; runDays endReason recorded per seed; no fixed-200d run,
  no tail padding beyond the harness's own stop).
- Seeds: PILOT 94401–94408 (8 fresh seeds). PRE-REGISTERED
  EXTENSION: if the pilot yields < 8 full-pantry villager
  starvation deaths, run band 94409–94416 (8 more seeds, same
  pre-reg) and judge the verdict on the POOLED sample, with
  pilot and extension strata reported separately. If the pilot
  already yields >= 8, the extension NEVER runs. The sweep
  mechanically refuses any seed list other than exactly PILOT,
  exactly EXT, or exactly PILOT+EXT; the runner refuses to run
  once a line-start "VERDICT-RENDERED:" verdict line exists in this file
  (anchored guard: pre-reg prose mentioning the token does not trip it).
- Freshness: bands 94401–94416 verified absent as exact "seed"
  fields from ALL other per-seed corpora under
  evidence/2026-10-24 (the analyzer re-asserts this C1 gate
  over every *-corpus dir except its own, and aborts on a hit).
- Sample: starvation deaths (cause canon 'starvation') across
  the runs. Player starvation deaths are excluded from the
  sample (recorded separately if any, including any meeting
  the full-pantry gate); the sample is villagers only.
- FULL-PANTRY definition (fixed before sims, per this run's
  brief): at death, pantryKcalLive >= 8,000 kcal AND
  pantryFreshDays >= 3.0 days. (Pantrystarve gated on kcal
  only; this run's brief requires ample kcal AND fresh days.)
  Deaths meeting the kcal gate but missing the fresh gate are
  counted separately as kcal-only context, never in the
  verdict denominator.
- Per-death fields recorded (instrument): villager id + name,
  day, pantry kcal + fresh days + fresh kcal + spoiled kcal +
  pantry item count at death, away-at-death flag
  (v.away[vid] present at capture), location class from meal
  history, days since last adequate meal, days since any meal,
  hungry count at death, and the deceased's own meal rows for
  the 7 days up to and including the death day, plus a
  transcript window (last 8 say + last 8 tele lines).
- Meal record (per villager per day, from the villagerMealDay
  wrapper, DEDUPED one row per (vid,day)): day, away flag, ate
  kcal, drawn kcal, fasting flag, hunger before/after, health
  before/after, needEst (person.kcalPerDay || 2000). Adequate
  meal = ate >= 0.6 * needEst (the game's own 60%-of-need
  starvation line).
- MECHANISM CLASSES (defined before sims; the analyzer applies
  them from the deceased's OWN meal/away records + death ctx
  only — never from window words, per #911):
  - A AWAY-RATION: full-pantry starvation death AND (away at
    death OR away-share of the deceased's meal-days in the
    window [deathDay-7, deathDay] >= 0.5).
  - B HAVEN-DISTRIBUTION: full-pantry starvation death AND NOT A
    AND at least one haven meal-day in the window with
    drawn < 0.25 * needEst AND ate < 0.6 * needEst (a genuinely
    short haven meal while the pantry was full at death — the
    shelves held food the eater did not get). The added
    ate condition is the pantrystarve metric-review fix: a
    self-fed villager legitimately draws ~0 while eating
    adequately from own production, and must not false-flag.
  - C OTHER: full-pantry starvation death matching neither A
    nor B, reported with a sub-reason from the record
    (mixed-away below 0.5 with no short haven draw; no meal
    rows in the window; low-health carryover where health
    was already < 30 at the window's start; or haven-adequate
    meals).
- TRANSCRIPT QUOTES: each full-pantry case carries one quoted
  window line (analyzer pickQuote: prefers a line naming the
  deceased, then a STARVING/spiral line, then a Village-meal
  line). A quote is CORROBORATION ONLY: classification never
  reads windows, a window line about another villager (or the
  scholar's own "camp wild" line) attributes nothing to the
  deceased, and a window contradicting the meal record is
  reported as a narration-vs-state tension, not a
  reclassification.
- Primary metric: attribution shares over FULL-PANTRY
  starvation deaths only (shareA, shareB, shareC; denominator
  = count of full-pantry starvation deaths, NOT all starvation
  deaths — pantry-empty famine deaths are ordinary famine and
  are reported as context, not attributed).
- DIAG-GO (this run's brief) iff classified share
  (A+B)/n >= 0.80 AND every named mechanism with count > 0 has
  count >= 2 AND every such mechanism has >= 1 quoted case.
  Strength qualifier (reporting only, not a re-score): n >= 8
  is GO-strong; n < 8 is GO-small-sample — the brief's bar met
  on a thin sample, and a confirm is recommended, not assumed.
  DIAG-NO-GO iff classified share < 0.80, OR any named
  mechanism has count 1, OR a named mechanism has no quoted
  case, OR the corpus is blind (missing meal rows / death
  ctx). A miss is NO-GO, never re-scored against a friendlier
  denominator or class rule mid-run.
- WATCH (report-only): wall numbers (national / table+wins /
  wave reach / median / max survival), total starvation deaths
  and full-pantry subset, death-cause shares, per-death table
  with meal histories and quotes, days-since-adequate-meal
  distribution, haven vs away meal adequacy rates, villager
  behavior (SENSE-TESTING LAW: transcripts read, beats quoted
  — never just counts).
- Instruments: scripts/sweep-fullpantry-diag-b.js (derived from
  scripts/sweep-pantrystarve-b.js with the declared deltas
  below), scripts/analyze-fullpantry-diag-b.js (attribution
  analyzer; C1 gate over all corpora, class rules, gate,
  quotes, pilot/full modes), scripts/test-fullpantry-diag-b.js
  (proof: derivation deltas, determinism leg, schema legs,
  analyzer class-rule legs incl. the self-fed B fix, runner
  guards), scripts/run-fullpantry-diag-b.sh (pilot +
  pre-registered extension runner, missing-seeds-only retries).
- Declared deltas vs sweep-pantrystarve-b.js:
  1. Names/paths: fullpantry-diag-b-*, corpus
     evidence/2026-10-24/fullpantry-diag-b-corpus/.
  2. Seeds: PILOT 94401–94408 + EXT 94409–94416 (sweep accepts
     exactly PILOT, exactly EXT, or exactly FULL; runner runs
     EXT only when the pilot yields < 8 full-pantry deaths).
  3. Meal-row DEDUPE: a duplicate (vid,day) key REPLACES the
     stored row (last call wins) and increments mealDupCount
     (pantrystarve: 23 duplicates / 8,685 rows from a second
     villagerMealDay caller). Stored mealRows are one row per
     (vid,day); window counts are day counts.
  4. Analyzer gate: kcal >= 8000 AND fresh >= 3.0 (pantrystarve:
     kcal only); analyzer B rule adds ate < 0.6*needEst;
     analyzer C1 covers all corpora; analyzer prints pilot and
     extension strata separately and attaches a quote per case.
  5. Everything else identical in behavior: competent FIXED,
     env FATAL asserts, registerDeath CALLS THROUGH (capture
     before call-through), meal wrapper (reads only, no RNG),
     extended death ctx, writeRobust (300 attempts, 2s
     real-time backoff), stdout to the caller's pipe, never
     redirected to a file.
- Balanced panel per §15: NOT APPLICABLE to a verdict here —
  this DIAG has a single policy and no before/after comparison
  arm, so there is no compare to run through the panel. The
  verdict is judged on the analyzer's pre-registered class
  shares. Stated here, not silently skipped: if a later run
  adds a comparison arm, it runs through the panel then.
- Metric review (pre-sims):
  - The registerDeath call-through keeps game behavior intact
    (grief/corpse bookkeeping runs); absolute rates here are
    comparable to call-through runs, unlike belongcost's
    no-call-through corpus. No paired arm exists for it to
    unbalance.
  - npcNeeds carries hunger/fear/social/energy only — no
    thirst field; irrelevant here (starvation sample only).
  - Death-day meal rows: a starvation death inside
    villagerMealDay is captured (registerDeath) BEFORE the
    meal wrapper records that day's row, but the analyzer
    joins death rows to the FULL retained meal log by vid,
    so the death-day meal is present in the join regardless
    of capture order. The window [d-7, d] is inclusive of
    the death day for exactly this reason.
  - v.away is a travel-state record (set by npcNodeTravel /
    objectives), not a map coordinate: "away" means the
    villager is out on a trip/assignment, which is exactly
    the state that routes meals through packMeal. Player
    "camp wild" lines are the scholar's own state and are
    never used to classify a villager (see #911).
  - Pantry kcal at death is measured AFTER that day's meals
    (deaths fire during/after the meal loop), so a death-day
    pantry read is a lower bound on what the shelves held
    when the day's meals were drawn. Class B's short-draw
    test therefore uses the death-day pantry only as the
    full-pantry gate, not as proof of that day's draw
    conditions — the short draw itself is the evidence.
  - Sample-size honesty, carried from pantrystarve: the
    GO-small-sample qualifier exists because a unanimous
    share on n=5 moved to 0.833 with a single contrary case.
    If this run GOes small-sample, the next run should
    confirm on fresh seeds rather than treating the claim
    as closed.

## Results

COMPLETE CORPUS (16 seeds: pilot 94401–94408 + pre-registered
extension 94409–94416, 1 config, competent, 150d death-aware,
PLENTYDEPRI=1/DEPOSITGATE=1, attempt 1 — no EPERM failure, no
retries needed). The pilot yielded 2 full-pantry deaths (< 8),
so the extension ran exactly as pre-registered; the pilot alone
never ran a verdict. Full analyzer output: run
`node scripts/analyze-fullpantry-diag-b.js` in this tree
(corpus: evidence/2026-10-24/fullpantry-diag-b-corpus/).
Per-seed wall:

| seed | stratum | days | end | wave | deaths |
|---|---|---|---|---|---|
| 94401 | pilot | 101 | village-lost | 4 | 15 |
| 94402 | pilot | 150 | survived | 3 | 4 |
| 94403 | pilot | 150 | survived | 3 | 5 |
| 94404 | pilot | 150 | survived | 3 | 5 |
| 94405 | pilot | 150 | survived | 3 | 6 |
| 94406 | pilot | 150 | survived | 3 | 16 |
| 94407 | pilot | 150 | survived | 4 | 8 |
| 94408 | pilot | 150 | survived | 3 | 6 |
| 94409 | ext | 123 | village-lost | 3 | 20 |
| 94410 | ext | 141 | village-lost | 4 | 10 |
| 94411 | ext | 150 | survived | 3 | 9 |
| 94412 | ext | 150 | survived | 4 | 5 |
| 94413 | ext | 150 | survived | 2 | 1 |
| 94414 | ext | 133 | village-lost | 4 | 15 |
| 94415 | ext | 150 | survived | 3 | 9 |
| 94416 | ext | 150 | survived | 3 | 11 |

Median survival 150d (capped), max 150d, national 0/16,
table/wins 0/16 (competent alone carries no scale push —
expected, not chased, same as pantrystarve), wave 4 on 5/16,
wave 5 on 0/16, Arc III on 16/16, rank village on 16/16.
Pooled death-cause shares (145 deaths): the arena 67,
monster 25, sickness 12, ambush 8, starvation 7, a wound that
wouldn't close 6, contest 4, choir toad 3, the night 3, the
expedition 2, alien 2, combat 2, night court 1, speedbump 1,
experiment 1, dehydration 1.

STARVATION SAMPLE: 7 starvation death rows = 6 villagers + 1
player. Player excluded per pre-reg (Catalina d138 s94410,
pantry 0 kcal — ordinary shortfall, not full-pantry).
Villager starvation deaths = 6, of which FULL-PANTRY
(>= 8,000 kcal AND >= 3.0 fresh days at death) = 3.

FULL-PANTRY ATTRIBUTION (pre-registered classes, denominator 3):

| seed | day | villager | pantry | fresh | pop/hungry | away@death | class | sinceAdequate |
|---|---|---|---|---|---|---|---|---|
| 94407 | 14 | Antwi | 25,533 | 14.9d | 11/2 | true | A away-at-death | 5d |
| 94408 | 120 | Stan | 21,583 | 3.5d | 8/0 | true | A away-at-death | 1d |
| 94416 | 143 | Misky | 9,198 | 3.7d | 8/0 | true | A away-at-death | 1d |

Shares: A = 3/3 (1.000), B = 0/3, C = 0/3. Classified
(A+B)/n = 1.000 ≥ 0.80; the only named mechanism (A) has
count 3 ≥ 2 and every A case carries a quoted window line
(see quotes below). Pilot stratum alone: A = 2/2; extension
added the third A case (Misky). No haven-distribution (B)
death occurred in either stratum.

WHAT THE MEAL HISTORIES ACTUALLY SHOW (beyond the class label):

- Antwi is the prolonged away-starvation case (the Renata
  shape, second sighting): 8 straight away days, ate
  declining 1,490 → 878 kcal while his pack ration fell
  1,096 → 600 kcal, health 23 → 5 across the week, 5 days
  since an adequate meal at death. The ration alone could
  not cover need, and the pantry — 25,533 kcal, 14.9 fresh
  days — could not reach him. Quote: "d14 STARVING: health
  and energy falling. The spiral has started." His window
  also serves the haven's own meal the same day ("Village
  meal: +1000 kcal, +1L water from the communal pantry.
  (Half ration — they don't trust you yet.)") while he
  dies away — the gap staged exactly as in pantrystarve.
- Stan and Misky are LOW-HEALTH + SHORT AWAY MEAL, not
  prolonged starvation (the pantrystarve 4-of-5 shape,
  again): Stan's health whipsawed 42 → 14 → 29 → 43 → 67 →
  41 → 3 across the window (non-meal damage between meals),
  then a 713 kcal away meal at 3 HP killed him; Misky's
  health stood at 94 the day before death and 2 at the
  death-day meal, then an 869 kcal away meal finished him.
  At haven either day's meal would have drawn the full
  need from the pantry and no hungry tick would have
  fired — so away still discriminates — but the deaths
  are overdetermined: the vulnerability is the near-dead
  body, and the away meal is the trigger, not the whole
  cause. A fix aimed only at rations would not have saved
  these two without also addressing why they were at 2–3
  HP; a fix aimed only at health would not have saved
  Antwi. Both halves belong in the finding, as before.
- Meals are adequate 99% of the time (haven 12,828/12,944,
  away 5,482/5,545; 18,489 deduped meal rows). Full-pantry
  starvation is a rare tail event, not a broad distribution
  failure: no haven villager starved with a full pantry.
- The dedupe fix worked as designed: 38 duplicate (vid,day)
  meal calls were replaced (all in extension seeds;
  pilot seeds had 0), stored rows are one per (vid,day)
  (analyzer audit passes), and window meal counts are day
  counts. The second caller is still unidentified — a
  standing instrument note, not a verdict threat, since
  classification uses awayAtDeath for all 3 A deaths.

SENSITIVITY (watch-only, NOT the verdict): the away result
does not depend on the gate. All 6 villager starvation
deaths in the corpus are awayAtDeath=true — including the
3 outside the full-pantry denominator: Desmond d70 s94411
(11,978 kcal but only 2.6 fresh days — the kcal-only
context case, away), Somchai d39 s94411 (5,428 kcal,
0.9 fresh days, away), Entong d103 s94416 (5,523 kcal,
6.1 fresh days, away). No villager starved at haven at
any pantry level in 16 villages. Pooling with
pantrystarve's 5 (same policy, same instrument family,
different fresh seeds): 8/8 full-pantry starvation deaths
are away, 0/8 haven-distribution — the mechanism
replicates across two independent seed bands, even though
neither run alone reaches n=8.

## Metric review (post-run)

- Pre-registered metrics bound the run and were NOT
  re-scored. The verdict is the analyzer's class shares on
  the pre-registered denominator (full-pantry = kcal AND
  fresh). The pooled n=3 is reported with its strength
  qualifier, not rounded up to a strong claim: with n=3,
  one contrary case would move the share to 0.750 and
  break GO. The GO-small-sample label is the honest
  headline, and a fresh-seed confirm is recommended before
  anyone prices a fix on this number alone. The
  cross-run 8/8 pooling above is context for that confirm,
  not a substitute verdict (different pre-regs: kcal-only
  vs kcal+fresh gates).
- B-RULE FIX VALIDATED IN PRINCIPLE, UNTESTED IN PRACTICE:
  no B classification occurred (B=0), so the self-fed
  ate<0.6*needEst guard changed no outcome here — but the
  test legs prove it blocks the false-flag (drawn-short +
  ate-adequate no longer classifies B), and the analyzer
  still reports short haven draws only when the meal was
  genuinely short. The fix is proven at the unit level,
  not exercised by a live B case.
- The registerDeath call-through delta worked as designed:
  death rows carry full ctx + windows AND the game
  proceeded normally (12/16 villages survived to 150d).
- Pantry kcal at death is a post-meal read (lower bound
  on what the shelves held at draw time) — the
  full-pantry gate is conservative, as stated pre-run.
- "The arena" (67/145 deaths) remains the largest cause
  family and is NOT investigated here (out of axis scope;
  the gap-W4-narr cause-split family). It does not touch
  the starvation sample.
- Balanced panel §15: N/A as stated pre-run (single policy,
  no comparison arm). No panel compare is attached, by
  design.

## SENSE (SENSE-TESTING LAW)

Three full-pantry death transcripts read in full (say + tele
windows), judged for meaning, not counts:

- ANTWI d14 (class A): the window stages the gap cleanly —
  the spiral warning fires the same day the haven serves
  its own meal ("Village meal: +1000 kcal… (Half ration —
  they don't trust you yet.)") while Antwi, 8 days away,
  takes his last short pack meal. The contradiction IS the
  story: a village feeding itself at half ration while its
  traveler starves out of reach. Coherent and consequential.
- STAN d120 (class A): the window is mostly other people's
  days — "Hunter is hurt — a fall, a thorn, a bad step.
  (health 71/100)" is Hunter, not Stan; the counter
  discovery names Stan ("counter_observed … vid:
  stan_kowalski") but narrates nothing about his hunger.
  Stan's own decline exists only in the meal log. Quote:
  "d120 WARNING: reserves critical. Eat tomorrow or the
  spiral begins." — a warning the village voices while
  serving its own meal ("Village meal: +2260 kcal…").
  Sense verdict: the mechanism is real but, for Stan,
  invisible in narration — the away-hunger invisibility
  finding from pantrystarve, third sighting.
- MISKY d143 (class A): the window carries the same
  narration-vs-state tension as pantrystarve's Owen:
  "Misky paces the hall, restless, then sits. Then paces."
  reads as Misky being AT the haven, while the engine
  records him away for the death-day meal (and away 5 of
  the last 8 meal-days, pack meals only). Per #911 the
  meal record wins: the line is a generic haven beat that
  happens to use his name, not a reclassification. But it
  is the second run in a row where a haven beat borrows
  an away villager's name on the day he dies away — worth
  a line in the conversation lane's backlog, not a DIAG
  dispute. Quote: "d143 Misky paces the hall, restless,
  then sits. Then paces." — quoted here precisely because
  it is the tension, not despite it.
- ROBOTIC NOTE (minor, documented not chased): the
  "Village meal: +N kcal from the communal pantry" beat
  fires on all three death days — accurate, and it reads
  lived rather than generated precisely because the
  contradiction (haven eats, traveler dies) is the story.

## Verdict

VERDICT-RENDERED: DIAG-GO (GO-small-sample) — classified
3/3 = 1.000 ≥ 0.80 bar, the only named mechanism (A
away-ration) has count 3 ≥ 2 with quoted cases, B = 0,
C = 0, pooled over pilot (2) + pre-registered extension
(1). Substantively: the away-ration mechanism replicates
pantrystarve's unanimous signal on fresh seeds (3/3 here,
8/8 pooled across both runs for full-pantry deaths, and
6/6 away across ALL villager starvation deaths in this
corpus at any pantry level), with the same two halves:
prolonged away decline (Antwi) and low-health + short
away meal (Stan, Misky). The sample is thin (n=3) — the
GO is explicitly small-sample, and a fresh-seed confirm
is recommended before pricing any fix. No fix is landed
here: no root cause meets the trivial-and-proofed bar
(away-ration sizing and away-hunger narration are design
decisions, not one-line fixes), so the mechanism split
is the deliverable and the fix is a named next arm.

## Village assessment in plain words

Sixteen competent villages, 150 days each, and the picture
is sturdier than the belongcost scare suggested: twelve
villages live to the horizon, wave 4 reached on five of
them, and the pantry is not the problem — it ends the
starvation-death days holding 9,200 to 25,500 kcal with
3.5 to 14.9 fresh days. The villages that die, die two
recognizable ways: the combat bloodbath (s94409, 20 deaths
by day 123; s94406, 16 deaths and still standing) and the
slow collapse (s94401, gone by day 101). Starvation itself
is a tiny share (7 of 145 deaths), and the full-pantry
kind is smaller still (3 of 145): one traveler at a time,
eating a short pack meal while the village eats from full
shelves. The village is not starving; one traveler at a
time is. The most human thing this run found, again, is
the staging: on the day Antwi, Stan, and Misky died, the
haven served a communal meal and talked about full
shelves, while the injured or long-away member took a
short ration and died. Nobody at home did anything wrong
— the food simply cannot reach a person who is not there,
and the game still never says so out loud.

## Blanks filled or documented

- FILLED (measurement): the pantrystarve under-power
  failure is now closed by design — the pre-registered
  extension band ran exactly when the pilot came in under
  8 (pilot n=2), the pooled corpus is 16/16 complete, and
  the analyzer renders strata separately so the extension
  can never masquerade as pilot data.
- FILLED (instrument): meal-row dedupe (38 replaced
  duplicates, stored rows unique per (vid,day)) and the
  B-rule self-fed guard (proven at unit level) are both
  landed in the reusable instrument, with proof 29/29
  including a live 150d determinism re-run of seed 94401
  matching the pilot corpus exactly.
- FILLED (causal, within sample): away-ration is the
  unanimous mechanism for full-pantry starvation in this
  run (3/3) and replicates pantrystarve (8/8 pooled);
  haven-distribution is 0/8 pooled — the shelves are not
  failing the people at home. The gap is an away problem
  with two halves: prolonged away decline and low-health
  + short away meal.
- DOCUMENTED (not chased, per backlog discipline): (a) the
  away-hunger invisibility — Stan's decline exists only
  in the meal log, third sighting; (b) the haven-beat
  name-borrowing tension — Misky's "paces the hall" line
  while away, second sighting (Owen in pantrystarve);
  (c) the unidentified second villagerMealDay caller —
  dedupe contains it, but the caller is still unnamed;
  (d) "the arena" as the largest cause family (67/145) —
  out of this arm's scope; (e) the GO-small-sample caveat
  itself — a fresh-seed confirm should precede any fix
  pricing.
- NOTHING ELSE CHANGED: zero src/js changes (measurement
  arm), no lever re-priced, no belongcost or pantrystarve
  verdict re-litigated.

## Findings to append to hidden_files/sim-findings.md (coordinator appends — this worker does NOT edit that file)

- [open] 2026-10-24 — full-pantry starvation mechanism (away-ration, GO-small-sample) — 3/3 full-pantry starvation deaths on fresh competent seeds are away villagers (pantry 9,198–25,533 kcal, fresh 3.5–14.9d), 0 haven-distribution; pooled with pantrystarve 8/8 away, 0/8 haven; all 6 villager starvation deaths in this corpus are away at any pantry level; verdict DIAG-GO small-sample (n=3), fresh-seed confirm recommended before pricing a fix (sim-fullpantry-diag-b, evidence/2026-10-24/sim-fullpantry-diag-b.md).
- [open] 2026-10-24 — away-hunger invisibility, third sighting — Stan's away decline exists only in the meal log while his death window narrates other villagers' days; away villagers' hunger still has no voice of its own (sim-fullpantry-diag-b).
- [open] 2026-10-24 — haven-beat name-borrowing, second sighting — Misky's "paces the hall" line on his death day reads as at-haven while the engine records him away; same tension class as Owen in pantrystarve; meal record wins per #911, but the line belongs in the conversation lane's backlog (sim-fullpantry-diag-b).
- [open] 2026-10-24 — villagerMealDay second caller still unidentified — dedupe now contains it (38 replaced duplicates across extension seeds, stored rows unique), but which second caller fires is still unknown (sim-fullpantry-diag-b).
- [open] 2026-10-24 — away-ration fix as named next arm — prolonged away decline (Antwi) + low-health + short away meal (Stan, Misky) are the two halves; sizing the away ration and voicing away hunger are design decisions for a fix arm, not a one-line change; confirm on fresh seeds first given GO-small-sample (sim-fullpantry-diag-b).

