# sim-pantrystarve-b — full-pantry individual starvation DIAG (measurement only)

Run: oversight-flesh-out-loop-b-20261024T1830Z (cron), axis food-economy.
Worker tree: ~/workspace/worktrees/sim-pantrystarve-b.
DIAG arm: findings-backlog #910, from sim-belongcost-adopt-b
(evidence/2026-10-24/sim-belongcost-b.md). ZERO src/js game changes.
Instruments + evidence + proof only.

## Canon

READ docs/CANON.md first, then docs/PRESERVATION.md (the food ladder)
and docs/BALANCING.md (2,000 kcal/day adult need; pantry start ~47,250
kcal; tier-1 food bar 8,000 kcal). The mechanism under test is game
code, not canon: villagerMealDay (src/js/game.js) feeds at-haven
villagers from the pantry (pantryDraw) and away villagers ONLY from
their pack (packMeal — "On the move, people eat what they carry";
the dawn ration is drawn from the pantry by packKcal, ~200–1,450 kcal
by the formula, roughly a day of food at the low end, not a full
need). No canon doc covers away-ration sizing or a haven
distribution rule — if the measurement names one, it is a finding,
not canon. No canon doc is invented here.

## The question (backlog #910)

Belongcost-adopt-b found villagers starving with 21–42k kcal + 8–17
fresh days in the pantry, hungry count 0, often while camping wild
("You camp wild tonight — no pantry meal") as the haven talks over
full shelves — in BOTH PD arms (Pavel d31, Sidney d13, Luna d19 under
PD=1; Norman d23, Sam d61 under PD=0). Question: is this an
away-from-haven eating gap, a haven distribution failure, or
something else? Policy is NOT the discriminator (the gap appeared
under both PD=0 and PD=1), so this pilot runs ONE policy
(competent) and discriminates on location/distribution records.

## PRE-REGISTRATION (bound per §14 — a miss is NO-GO, never re-scored)

- Substrate: branch sim-pantrystarve-b, base 69e7cd49a. Policy:
  competent ONLY (scripts/policies/competent.js, unmodified).
  Env (explicit, = shipped defaults): PLENTYDEPRI=1, DEPOSITGATE=1.
  Horizon: 150d death-aware cap (dead villages stop; runDays
  endReason recorded per seed; no fixed-200d run, no tail padding
  beyond the harness's own stop).
- Seeds: PILOT ONLY 94301–94308 (8 fresh seeds). 1 config
  (competent) = 8 seed-runs. The runner mechanically refuses any
  other seed list and refuses to run when a verdict section exists
  in this evidence file. Freshness: band 94301–94308 verified absent
  as exact `"seed": 9430x` fields from the belongcost/pdvalue
  corpora in this worktree (substring hits in old viewership
  decimals are not seeds); the analyzer re-asserts it and aborts
  on any hit.
- Sample: starvation deaths (cause canon 'starvation' — the
  hurtFromStarvation path, both the per-meal -8 and the famine -4)
  across the 8 pilot runs. Player starvation deaths are excluded
  from the sample (recorded separately if any); the sample is
  villagers only.
- FULL-PANTRY definition (fixed before sims): at death,
  pantryKcalLive >= 8,000 kcal (the tier-1 food bar / win pantry
  bar — a conservative floor under the observed 21–42k cases).
  Fresh days at death are recorded alongside but are NOT a gate
  (kcal is the food; spoiled/unknown stock carries kcalEach 0 and
  does not inflate pantryKcalLive).
- Per-death fields recorded (instrument, see below): villager id +
  name, day, pantry kcal + fresh days + fresh kcal + spoiled kcal
  + pantry item count at death, away-at-death flag (v.away[vid]
  present at capture), location class from meal history, days
  since last adequate meal, days since any meal, hungry count at
  death, and the deceased's own meal rows for the 7 days up to
  and including the death day.
- Meal record (per villager per day, from the villagerMealDay
  wrapper): day, away flag, ate kcal, drawn kcal (pantry draw at
  haven, pack-ration draw away), fasting flag, hunger
  before/after, health before/after, needEst (person.kcalPerDay
  || 2000). Adequate meal = ate >= 0.6 * needEst (the game's own
  60%-of-need starvation line in villagerMealDay/villageEats).
- MECHANISM CLASSES (defined before sims; the analyzer applies
  them from the deceased's OWN meal/away records + death ctx
  only — never from window words, per #911: a window line about
  another villager, or about "that thing", attributes nothing):
  - A AWAY-RATION: full-pantry starvation death AND (away at
    death OR away-share of the deceased's meal-days in the
    window [deathDay-7, deathDay] >= 0.5). Rationale: away
    villagers never draw the pantry (packMeal only), so a full
    pantry cannot feed them; the failure is the ration, not
    the shelves.
  - B HAVEN-DISTRIBUTION: full-pantry starvation death AND NOT A
    AND at least one haven meal-day in the window with
    drawn < 0.25 * needEst (a short haven draw while the
    pantry was full at death — the shelves held food the
    eater did not get).
  - C OTHER: full-pantry starvation death matching neither A
    nor B, reported with a sub-reason from the record
    (mixed-away below 0.5 with no short haven draw;
    no meal rows in the window; low-health carryover where
    health was already < 30 at the window's start for
    non-starvation reasons; or unknown).
- Primary metric: attribution shares over FULL-PANTRY starvation
  deaths only (shareA, shareB, shareC; denominator = count of
  full-pantry starvation deaths, NOT all starvation deaths —
  pantry-empty famine deaths are ordinary famine and are
  reported as context, not attributed).
- DIAG-GO iff (full-pantry starvation deaths >= 8) AND
  (max(shareA, shareB) >= 0.70) — one mechanism class holds at
  least 70% of the full-pantry sample. DIAG-NO-GO iff fewer than
  8 full-pantry starvation deaths, OR no class reaches 0.70, OR
  the corpus is blind (missing meal rows / death ctx). A miss is
  NO-GO, never re-scored against a friendlier denominator or
  class rule mid-run. If the pilot GOes AND a second class holds
  >= 0.20 share (mechanism ambiguous on a second class), a
  12–16 seed confirm on this same pre-reg is allowed; never run
  confirms on a NO-GO pilot.
- WATCH (report-only): wall numbers (national / table+wins /
  wave reach / median / max survival), total starvation deaths
  and full-pantry subset, death-cause shares, per-death table,
  days-since-adequate-meal distribution, haven vs away meal
  adequacy rates, villager behavior (SENSE-TESTING LAW:
  transcripts read, beats quoted — never just counts).
- Instruments: scripts/sweep-pantrystarve-b.js (derived from
  scripts/sweep-belongcost-b.js with the declared deltas below),
  scripts/analyze-pantrystarve-b.js (attribution analyzer;
  C1 seed-freshness gate, class rules, per-death table),
  scripts/test-pantrystarve-b.js (proof: derivation deltas,
  determinism leg, schema legs, analyzer class-rule legs,
  runner pilot-only refusal), scripts/run-pantrystarve-b.sh
  (pilot-only runner, missing-seeds-only retries).
- Declared deltas vs sweep-belongcost-b.js:
  1. Policy competent (fixed; no POLICY env override, no
     FEASTSCALE/SEATDRIVE/PD/DG cell matrix — one config).
  2. Seeds 94301–94308, days 150 (runner refuses anything else).
  3. registerDeath wrapper CALLS THROUGH (belongcost's
     no-call-through suppressed corpse/deed/grief side-effects
     in both arms; this DIAG has no comparison arm, so the
     honest instrument keeps game behavior intact and absolute
     rates comparable to call-through runs). Capture happens
     BEFORE the call-through, so the row is recorded even if
     the original throws.
  4. villagerMealDay wrapper (new): per-villager per-day meal
     rows as defined above; reads state only, consumes no RNG.
  5. Death ctx extended: pantryFreshKcal, pantrySpoiledKcal,
     pantryItemCount, unknownKcal0Count, awayAtDeath,
     isPlayer flag; daySeries kept as in belongcost.
  6. writeRobust retained (300 attempts, 2s real-time backoff
     via performance.now); sweep stdout streams to the
     caller's pipe, never redirected to a file; runner retries
     missing seeds only with fresh processes (EPERM lesson
     #904: never force ref surgery, never truncate-rewrite a
     script during a flap).
- Balanced panel per §15: NOT APPLICABLE to a verdict here —
  this DIAG has a single policy and no before/after comparison
  arm, so there is no compare to run through the panel. The
  verdict is judged on the analyzer's pre-registered class
  shares. Stated here, not silently skipped: if a later run
  adds a comparison arm, it runs through the panel then.
- Metric review (pre-sims):
  - The registerDeath call-through changes death-side-effect
    behavior vs belongcost (grief/corpse bookkeeping now
    runs). That is a deliberate declared delta, not a
    confound: there is no paired arm here for it to unbalance,
    and it makes absolute starvation rates honest.
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

## Results

COMPLETE PILOT (8 fresh seeds 94301–94308, 1 config, competent,
150d death-aware, PLENTYDEPRI=1/DEPOSITGATE=1, attempt 1 — no EPERM
failure, no retries needed). Full analyzer output: run
`node scripts/analyze-pantrystarve-b.js` in this tree (corpus:
evidence/2026-10-24/pantrystarve-b-corpus/). Per-seed wall:

| seed | days | end | rank | wave | deaths |
|---|---|---|---|---|---|
| 94301 | 150 | survived | village | 4 | 11 |
| 94302 | 150 | survived | village | 4 | 8 |
| 94303 | 150 | survived | village | 3 | 6 |
| 94304 | 89 | village-lost | village | 3 | 20 |
| 94305 | 150 | survived | village | 4 | 11 |
| 94306 | 116 | village-lost | village | 3 | 15 |
| 94307 | 150 | survived | village | 3 | 6 |
| 94308 | 150 | survived | village | 4 | 13 |

Median survival 150d (capped), max 150d, national 0/8, table/wins
0/8 (competent alone carries no scale push — expected, not chased),
wave 4 on 4/8, wave 5 on 0/8. Pooled death-cause shares (90 deaths):
the arena 38, starvation 12, monster 12, contest 5, ambush 5,
sickness 4, a wound that wouldn't close 4, the night 2, alien 2,
dehydration 2, the influencer 1, big-eyes 1, lockjaw 1,
stripes flowing where no wind bl 1. ("The arena" is the
gap-W4-narr arena cause-split also noted in belongcost's landing
addendum — a cause-label family, watch-only here.)

STARVATION SAMPLE: 12 starvation death rows total = 10 villagers +
2 players. Players are excluded from the sample per pre-reg
(recorded: Tyrone d15 s94301 with pantry 27,309 kcal — the scholar
starving with a full pantry is the same away-gap shape in player
form, noted as a finding below, not counted; Miguel d99 s94306
with pantry 1,800 kcal — ordinary shortfall). Villager starvation
deaths = 10, of which FULL-PANTRY (>= 8,000 kcal at death) = 5.
The other 5 are ordinary pantry-empty famine (all haven,
pantry 0 kcal: Malik d116 s94306, Dale d34, Elif d38, Luz d41,
Hassan d43, all s94308/s94306 village-collapse runs — their meal
histories show the honest decline of a village eating its last
stores, not a gap).

FULL-PANTRY ATTRIBUTION (pre-registered classes, denominator 5):

| seed | day | villager | pantry | fresh | pop/hungry | away@death | class | sinceAdequate |
|---|---|---|---|---|---|---|---|---|
| 94301 | 13 | Renata | 20,192 | 14.8d | 12/0 | true | A away-at-death | 4d |
| 94301 | 20 | Mason | 15,500 | 7.4d | 9/1 | true | A away-at-death | 1d |
| 94302 | 144 | Liam | 9,504 | 4.2d | 8/0 | true | A away-at-death | 1d |
| 94305 | 55 | Kartik | 24,722 | 3.9d | 10/4 | true | A away-at-death | 1d |
| 94305 | 148 | Owen | 78,373 | 15.7d | 8/1 | true | A away-at-death | 1d |

Shares: A = 5/5 (1.000), B = 0/5, C = 0/5. The mechanism is
UNANIMOUS — every full-pantry starvation death in the pilot is an
away villager — but the sample is 5, below the pre-registered
minimum of 8. The verdict rule therefore fires NO-GO on sample
size, not on mechanism split. No confirm is run: the brief allows
confirms only on a GO pilot, never on a NO-GO pilot.

WHAT THE MEAL HISTORIES ACTUALLY SHOW (beyond the class label —
read before trusting "away did it" as a complete story):

- Meals are adequate 99% of the time (haven 6,083/6,142 adequate,
  away 2,521/2,543 adequate; 9,760 villager-days, 8,685 meal rows).
  Full-pantry starvation is a rare tail event, not a broad
  distribution failure: no haven-distribution (B) death occurred
  at all, and no haven villager starved with a full pantry.
- Renata is the only prolonged away-starvation: 8 straight away
  days, production collapsing (own-eat ~1,600 → ~70 kcal) while
  her pack ration rose 366 → 1,100 kcal — the ration alone could
  not cover need, and her health fell 56 → 2 across the week
  before the death-day meal (866 kcal) finished her. That is the
  away gap in its cleanest form: injured/sick away, production
  gone, ration capped, pantry unreachable.
- The other four are LOW-HEALTH + SHORT AWAY MEAL, not prolonged
  starvation: each entered the death day at 1–5 HP (Mason: a fall,
  "health 4/100" in his window; Kartik 65 → 5, Owen 95 → 2, Liam
  86 → 1 between the previous meal and the death-day meal —
  non-meal damage), then took one short away meal (729–848 kcal,
  below the 60% line) and the -8 hungry tick killed them. At
  haven that day's meal would have drawn the full need from the
  pantry and no hungry tick would have fired — so away still
  discriminates — but the deaths are overdetermined: the
  vulnerability is the near-dead body, and the away meal is the
  trigger, not the whole cause. A fix aimed only at rations
  would not have saved these four without also addressing why
  they were at 1–5 HP; a fix aimed only at health would not
  have saved Renata. Both halves belong in the finding.
- Away-share nuance: Mason (0.44) and Liam (0.13) were away at
  death but mostly at haven across the window — recently
  departed, then dead within days. The class rule fires on
  away-at-death, which is correct for the routing question (the
  death-day meal was a pack meal), but "long-away villager"
  would misdescribe them: they are newly-away villagers.
- The non-full famine deaths are the control story: same
  villages, haven villagers, pantry 0 — starvation there is
  honest scarcity, and it looks completely different in the
  meal log (gradual decline, not a cliff).

## Metric review (post-run)

- Pre-registered metrics bound the run and were NOT re-scored.
  The verdict is the analyzer's class shares on the
  pre-registered denominator (full-pantry starvation deaths).
  The unanimous A share (1.000) does NOT override the n>=8
  requirement: with n=5, one more death in another class would
  move the share to 0.833, two to 0.714 — the sample is too
  small to carry a 70% claim, and the rule says so. Reporting
  "A wins 5/5" as the headline without the NO-GO would be
  exactly the re-scoring §14 forbids.
- B-RULE WEAKNESS (found by the causal read, proposed revision
  for the NEXT run only, not applied retroactively): class B as
  written flags any haven meal-day with drawn < 0.25*needEst —
  but a self-fed villager (own production covering need)
  legitimately draws 0. A self-fed haven day would false-flag
  as a short draw. No B classification occurred in this pilot,
  so the weakness contaminates nothing here, but the next
  run's B rule must add "AND ate < 0.6*needEst" (a genuinely
  short meal, not just a small draw).
- MEAL-ROW DUPLICATES (instrument note, not a verdict threat):
  23 duplicate (vid,day) meal rows in 8,685 (0.26%): s94301: 14,
  s94306: 5, s94308: 4 — a second villagerMealDay caller fires
  on some days (Mason's window shows 9 rows for 8 days, d15
  twice). Classification uses awayAtDeath for all 5 A deaths,
  so duplicates cannot move any class here; window meal counts
  (winMeals) are row counts, not day counts, and are labeled
  as such in the analyzer. A future instrument should dedupe
  by (vid,day) keeping the last row, or identify the second
  caller.
- The registerDeath call-through delta worked as designed:
  death rows carry full ctx + windows AND the game proceeded
  normally (corpses/grief intact; villages survived to 150d on
  6/8 seeds). Absolute rates here are comparable to
  call-through runs, unlike belongcost's no-call-through corpus.
- Pantry kcal at death is a post-meal read (deaths fire during/
  after the meal loop), so it is a lower bound on what the
  shelves held at draw time — the full-pantry gate is
  conservative, as stated pre-run.
- "The arena" (38/90 deaths) is the largest cause family and is
  NOT investigated here (out of axis scope; it is the
  gap-W4-narr cause-split family already noted in belongcost's
  landing addendum). It does not touch the starvation sample.
- Balanced panel §15: N/A as stated pre-run (single policy, no
  comparison arm). No panel compare is attached, by design.

## SENSE (SENSE-TESTING LAW)

Three full-pantry death transcripts read in full (say + tele
windows), judged for meaning, not counts:

- RENATA d13 (class A): the window is mostly the scholar's day
  (a mentor unlock, neural creep, jujube identified) plus two
  lines that cohere — "STARVING: health and energy falling. The
  spiral has started." and "You camp wild tonight — no pantry
  meal." But neither line names Renata, and the camp-wild line
  is the SCHOLAR's state, not hers (per #911 it attributes
  nothing to her). Her own story — 8 away days, production
  collapse, ration shortfall — exists ONLY in the meal log, not
  in any line a player would read. Sense verdict: the mechanism
  is real but INVISIBLE in narration. A player watching this
  village would see a spiral warning and a camp-wild line and
  never learn that Renata, away for a week, was the one
  starving. That invisibility is itself a blank: away
  villagers' hunger has no voice.
- MASON d20 (class A): the most human window in the pilot.
  "Mason is hurt — a fall, a thorn, a bad step. (health 4/100)"
  + "Mason's stomach knots — something in their meal was off."
  + "WARNING: reserves critical." — and on the same day,
  "Village meal: +2215 kcal from the communal pantry." The
  haven ate; the hurt man away from it died. The gap is STAGED
  here, legibly: a full-pantry village meal served while its
  injured away member takes a short pack meal at 4 HP. This
  window earns the A classification in story terms, not just
  in flag terms.
- OWEN d148 (class A, the extreme pantry: 78,373 kcal): the
  window again serves the haven meal ("Village meal: +2351 kcal
  from the communal pantry") while Owen dies away — the same
  staging as Mason's — but it also carries a tension: "Quiet
  mending sounds from the bunks — Owen fixing something"
  reads as Owen being AT the haven, while the engine records
  him away for 5 straight days. Either the line is a generic
  haven beat that happens to use his name, or the away flag
  lags a return. The meal rows (away all 5 days, pack meals
  only) support the engine's routing; the line is noted as a
  narration-vs-state tension, not a reclassification — window
  words do not override the routing record (see #911), and the
  tele window's hushwolf death belongs to another fight
  entirely, which is why windows are never used to classify.
- ROBOTIC NOTE (minor, documented not chased): the "Village
  meal: +N kcal from the communal pantry" beat fires on the
  death day in both Mason's and Owen's windows — accurate, but
  it is the haven congratulating itself while a member starves
  away, which is precisely the gap's dramatic shape. It reads
  lived, not generated, because the contradiction is the story.

## Verdict

VERDICT-RENDERED: DIAG-NO-GO — full-pantry starvation deaths n=5
(< 8 required), class shares A=5/5 (1.000), B=0/5, C=0/5.
Substantively: the mechanism points unanimously at AWAY-RATION
— every full-pantry starvation death is an away villager, and no
haven villager starved with a full pantry — but the pilot is
under-powered by the pre-registered rule, so the claim "away is
the mechanism" is reported as a 5/5 signal, NOT as a GO verdict.
No confirm is run (brief: never on a NO-GO pilot). The
unanimous-but-small result is the honest outcome: a strong lead
for the next run's hypothesis (away rations + low-health
trigger), not a closed case. The next run should either widen
the seed band (the brief's 12–16 confirm shape, on a fresh
pre-reg that keeps the n>=8 bar) or enrich the sample another
way — that choice is the coordinator's/Steve's, not a mid-run
re-score.

## Village assessment in plain words

Eight competent villages, 150 days each, and the picture is
sturdier than the belongcost scare suggested: six villages live
to the horizon, wave 4 reached on four of them, and the pantry
is not the problem — it ends the runs holding 9,500 to 78,000
kcal on the starvation-death days. The villages that die, die
two recognizable ways: the slow pantry-empty collapse (s94308
and s94306, where the last villagers eat 100–500 kcal meals
while the shelves stand bare — honest famine, narrated by the
declining meal log) and the combat bloodbath (s94304, 20 deaths
by day 89). Starvation itself is a small share (12 of 90
deaths), and the full-pantry kind is smaller still (5 of 90):
one person, away from home, eating a short pack meal while the
village eats from full shelves. The village is not starving;
one traveler at a time is. The most human thing this pilot
found is the staging: on the day Mason and Owen died, the haven
served a communal meal and talked about full shelves, while
the injured man out on the road took a short ration and died.
Nobody at home did anything wrong — the food simply cannot
reach a person who is not there, and the game never says so
out loud.

## Blanks filled or documented

- FILLED (measurement): the #910 question now has an
  instrument that answers it directly — per-villager meal rows
  (away flag, ate, drawn, hunger, health) joined to death rows
  by villager id, with classification from the deceased's own
  records, never from window words. The instrument is proven
  (test 21/21, including a live 150d determinism re-run of
  seed 94301 matching the pilot corpus exactly) and reusable
  for the follow-up run.
- FILLED (causal, within sample): away-ration is the unanimous
  mechanism for full-pantry starvation in this pilot (5/5), and
  haven-distribution is 0/5 — the shelves are not failing the
  people at home. The gap is an away problem, with the
  low-health trigger as its second half (4 of 5 deaths are a
  near-dead villager taking one short away meal).
- DOCUMENTED (not chased, per backlog discipline): (a) the
  away-hunger invisibility — Renata's 8-day away starvation
  has no narrated line of its own; away villagers' hunger has
  no voice (see SENSE); (b) the player-form gap — scholar
  Tyrone starved d15 s94301 with 27,309 kcal in the pantry
  (same away shape, player excluded from the sample by
  pre-reg); (c) the B-rule self-fed false-flag weakness and
  the meal-row duplicate caller (see Metric review) — both
  proposed as next-run revisions, not applied retroactively;
  (d) the Owen "mending in the bunks" narration-vs-away-flag
  tension; (e) "the arena" as the largest cause family (38/90)
  — out of this arm's scope, already noted in belongcost's
  landing addendum.
- NOTHING ELSE CHANGED: zero src/js changes (measurement arm),
  no lever re-priced, no belongcost verdict re-litigated.

## Findings to append to hidden_files/sim-findings.md (coordinator appends — this worker does NOT edit that file)

- [open] 2026-10-24 — full-pantry starvation mechanism (away-ration signal, under-powered) — 5/5 full-pantry starvation deaths on fresh competent seeds are away villagers (pantry 9,504–78,373 kcal), 0 haven-distribution deaths; pilot DIAG-NO-GO on sample size (n=5 < 8 required) despite unanimous A share; 4 of 5 are low-health (1–5 HP) + one short away meal, Renata is the prolonged away-starvation case (sim-pantrystarve-b, evidence/2026-10-24/sim-pantrystarve-b.md).
- [open] 2026-10-24 — away-hunger invisibility — an away villager's multi-day starvation has no narrated line of its own; Renata's 8-day away decline exists only in the meal log while her death window narrates the scholar's day (sim-pantrystarve-b).
- [open] 2026-10-24 — player-form full-pantry starvation — scholar Tyrone starved d15 s94301 with 27,309 kcal in the pantry, the same away-gap shape in player form (player deaths excluded from the #910 sample by pre-reg) (sim-pantrystarve-b).
- [open] 2026-10-24 — DIAG B-rule self-fed false-flag — a haven meal-day with drawn < 0.25*needEst can be a self-fed villager (own production covering need, draw 0), not a short draw; next run's B rule must add ate < 0.6*needEst (sim-pantrystarve-b).
- [open] 2026-10-24 — villagerMealDay second caller — 23 duplicate (vid,day) meal rows in 8,685 (s94301: 14, s94306: 5, s94308: 4); instrument should dedupe or identify the caller (sim-pantrystarve-b).

