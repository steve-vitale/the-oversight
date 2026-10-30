# sim-starveplenty-b — STARVATION AFTER PLENTY, traced (Loop B, 2026-10-30)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T1030Z.
Axis: food-economy. Arm: sim-starveplenty-b — DIAG ONLY, measurement.
Zero src/js changes, zero policy-default changes, zero game-code changes,
zero default flips. Answers backlog item #1492 (sim-findings.md,
2026-10-30, loop-B arm sim-wall-b).

Base pin (HEAD at prereg time): 56b4cbe74aca227a354cdb2db5440a3514253876
Branch: sim-starveplenty-b (worktree ~/workspace/worktrees/sim-starveplenty-b).
Prereg (committed BEFORE any judged leg): evidence/2026-10-30/sim-starveplenty-b-prereg.md
(commit e2759794f).

## Verdict: DIAG-GO

Both pre-registered clauses hold:
(a) Seed 9983's starvation is traced to a named mechanism with
    event-level evidence (below — timing/scholar-first sweep +
    production-cliff, with low-health compounding).
(b) The fresh census (9991–9998) is classified: 5 villager starvation
    deaths, counts + shares per mechanism below; exactly 1 passes the
    pre-registered plenty test.

## Plain-words answer first

The village did NOT let food sit uneaten while someone starved, and
the starving villager did NOT lack knowledge of the food, and was NOT
away from home. What happened on 9983 — and, in the same shape, in
the census — is a rundown with a cruel order of eating:

1. The pantry really was plentiful at day 30 (8,940 kcal, all fresh,
   all edible) and then the whole village ate it down over six days,
   because eight mouths burn more than a sick, shrinking village
   produces.
2. Every night the scholar (the player character) eats FIRST, before
   any villager meal, taking roughly 2,000–2,500 kcal. On thin days
   that first draw takes literally everything left — days 36–39 the
   scholar swept 1,466 / 948 / 1,254 / 1,026 kcal to zero, so the
   villagers' nightly meal opened on an empty pantry every day.
3. Villagers then live on what they produce themselves plus surplus
   shared mid-meal by later eaters. The starving villager ate FIRST
   among villagers, so he never saw those mid-meal shares — later
   eaters drew 200–600 kcal from deposits he could not reach.
4. His own production had collapsed with his health: a monster wound
   (40 damage, day 32) on top of a lingering sickness cut him from
   health 79 to 36, and production tracks health, so his daily catch
   fell from ~2,300 to ~1,000, then 885, 512, and finally 50 kcal.
   Eating 885 kcal against a ~1,600 need is a shortfall; three such
   days at −8 (short meal) −4 (bare-pantry famine) −5 (sickness)
   killed him on day 39.
5. The same day, the village scattered (third hungry day) — with
   seven living members still on the roster. The village did not die
   out; it walked away.

So "starvation after plenty" is real but it is a slow rundown, not a
same-day distribution failure: plenty six days earlier, an empty
pantry at the end, and the sickest villager's self-production gone.
The exotic explanations are all falsified for 9983: away (he was
home all 10 days), knowledge (every pantry kcal at every turn was
fresh and edible; unknown = 0, spoiled = 0 throughout), and
same-day peer drain (the pantry was already 0 before the first
villager meal — the drainer was the scholar's earlier draw).

## Leg 1 — DEEP TRACE, seed 9983, days 30–39

Instrument: scripts/trace-starveplenty-b.js (shared sim-harness.js;
record-only wrappers; no RNG-rolling or state-initializing helper
calls inside wrappers, except the pure predicates isSpoiled and
plantsKnownBy documented in the script header).
FIDELITY: the trace reproduces the wall corpus EXACTLY — 39 days,
village-lost, all 14 deaths identical (day, kind, who, cause, player
flag) to evidence/2026-10-30/sim-wall-b-sense-9983.json. The base
moved since the wall pin, but this trajectory did not. The trace is
a faithful re-observation, not a new draw.

The starving villager: gen_a29exbk — taxi driver, forager profile,
abilities the_touch + echo_location. Present at the day-30 snapshot,
dead day 39 of starvation (the wall corpus's single starvation
death).

### Pantry, day by day (villageEats entry → exit; scholar meal precedes entry)

| day | entry kcal | exit kcal | scholar took (that morning) | living |
|-----|-----------|-----------|------------------------------|--------|
| 30 | 9,640 | 8,940 | 2,100 (of 11,740) | 7 |
| 31 | 7,840 | 7,168 | 2,120 (of 9,960) | 8 |
| 32 | 6,041 | 4,353 | 2,027 (of 8,068) | 7 |
| 33 | 5,431 | 4,353 | 2,380 (of 7,233) | 8 |
| 34 | 3,969 | 2,404 | 2,238 (of 6,207) | 8 |
| 35 | 2,904 | 500 | 2,267 (of 5,171) | 8 |
| 36 | 0 | 200 | 1,466 (of 1,466 — ALL) | 8 |
| 37 | 0 | 0 | 948 (of 948 — ALL) | 8 |
| 38 | 216 | 0 | 1,254 (of 1,254 — ALL) | 8 |
| 39 | 0 | 0 | 1,026 (of 1,026 — ALL) | 8 → 7 |

Every pantry reading in the window: fresh = total, spoiled = 0,
unknown = 0. The day-30 wall number (8,940) is the villageEats-exit
reading — reproduced exactly. The "nine days after plenty" is really
six days of rundown (8,940 → 500 by day 35) plus three empty days
(36–39, with only 216 kcal ever reaching a villager meal turn).

### The starving villager's meals, days 30–39 (all at haven, away = false)

| day | produced | ate | drawn | pantry at his turn | health | hit |
|-----|----------|-----|-------|--------------------|--------|-----|
| 30 | 1,985 | 1,888 | 0 | 9,640 | 79 | — |
| 31 | 2,340 | 1,888 | 0 | 7,840 | 79 | — |
| 32 | 1,048 | 1,608 | 560 | 6,041 | 79→39 | — |
| 33 | 1,090 | 1,168 | 78 | 5,431 | 39 | — |
| 34 | 1,027 | 1,411 | 384 | 3,969 | 36 | — |
| 35 | 996 | 1,496 | 500 | 2,904 | 36 | — |
| 36 | 1,005 | 1,005 | 0 | 0 | 36 | — |
| 37 | 885 | 885 | 0 | 0 | 36→28 | −8 meal, −4 famine |
| 38 | 512 | 728 | 216 | 216 | 19→11 | −8 meal, −4 famine |
| 39 | 50 | 50 | 0 | 0 | 2→0 | −8 meal, DIED |

Production tracks health almost linearly here (~27 kcal per health
point: 2,340 at 79; ~1,000 at 36–39; 512 at 19; 50 at 2). Need is also
health-scaled (need = kcalPerDay × (0.7 + 0.3 × health/100)), so at
health 36 his need was ~1,616: eating 885 is 55% of need, under the
60% shortfall line — the −8 hit. At health 19, need ~1,514, eating
728 is 48% — another −8.

### Health attribution (wound probe, scripts/trace-starveplenty-b-wounds.js)

Same seed/policy/horizon, record-only hurtVillager wrapper; death
sequence still matches the wall corpus exactly, so the probe did not
perturb the trajectory. For gen_a29exbk:

- Days 30–31: sickness ticks −3/day, offset by the +3/day recovery
  (recovery runs only when nobody is starving) — net flat at 79.
- Day 32: MONSTER hit −40 (79 → 39) in villager combat — the day-32
  hushwolf kill in villager combat; he fought it and took 40.
  Followed the same day by a sickness tick −3 (42 → 39 after the
  +3 recovery). This −40 step is the trigger: production halves.
- Days 33–35: sickness −3/day, recovery +3/day — net flat at 36.
- Day 37: meal −8 (36 → 28), famine −4 (28 → 24), sickness −5
  (24 → 19). Day 38: meal −8 (19 → 11), famine −4 (11 → 7),
  sickness −5 (7 → 2). Day 39: meal −8 (2 → 0, died).
  The sickness tick steps up from −3 to −5 in the starving phase
  (cause label 'sickness' both phases; the step-up coincides with
  starvation and is reported as observed, not explained further).
- The −5/day background steps between meals on days 37→38 and
  38→39 are these same sickness ticks, not a separate wound clock.

### Order-of-eating evidence (the distribution fact)

Roster order at villageEats days 36–39: scholar (skipped — already
ate), gen_a29exbk FIRST, then gen_7cclmvb, gen_925shtf,
mateo_alvarez, henry_zhang, app_mgpsphht302, app_mgpsphh1583.
Mid-loop surplus deposits on those days came from later eaters
(gen_925shtf gave 444/449/426, mateo_alvarez gave 635/734/302);
later eaters then drew 200 (henry) / 400–600 (applicants) from
those deposits. Gen, eating first, drew 0 on days 36, 37, 39 and
only the 216 kcal present at his turn on day 38. First-eater
position on empty-pantry days is a real, measured disadvantage —
but it is second-order: even with a deposit share, a villager at
health 2 producing 50 kcal/day was not going to survive on shares
alone. The first-order facts are the empty pantry and the collapsed
production.

### Knowledge state

Village sharedKnowledge 13 keys at day 30, codex plants 20 — rising
to 22 by day 32 and flat after. At every meal turn in the window the
pantry split was fresh = total, unknown = 0: there was no unknown
flesh in the pantry at any point, so no knowledge gate stood between
this villager and any pantry kcal. Knowledge gap: FALSIFIED.

### Sense read (SENSE-TESTING LAW — the villager's days end to end)

Read as a person, not a counter, gen_a29exbk's arc is coherent and
tragic, not robotic: a taxi driver turned forager who worked every
day (production 1,315–2,859 through day 31, including away trips
days 3, 9, 11, 19–21 with pack meals), fought the hushwolf on day 32
and took the wound that halved his working strength, nursed a
lingering sickness through the whole final stretch, kept eating
from the pantry while it lasted (drawing 560/384/500 on days 32–35),
and then spent three days eating only what his failing body could
still gather while the scholar ate the last of each morning's food
and his neighbours shared meals he never sat down to, because his
turn came first. He died the day the village scattered. Nothing in
his meal rows reads as static, repeated, or non-person-like; the
blank is structural (meal order + health-linked production), not a
behavior bug. No [needs-eyes] item: nothing here changes feel, copy,
or UI.

## Leg 2 — FRESH-SEED CENSUS, seeds 9991–9998, competent, 180d death-aware

Same instrument, one process per seed, sequential. Pre-registered
plenty test: villageEats-entry pantry ≥ 5,000 kcal within 7 days
before the death day.

| seed | days | end | villager starvation deaths | starve hits (all vids) |
|------|------|-----|----------------------------|------------------------|
| 9991 | 180 (cap) | survived | 0 | 4 |
| 9992 | 180 (cap) | survived | 0 | 0 |
| 9993 | 68 | village-lost, SCATTERED (hungryDays 5) | 0 | 29 |
| 9994 | 59 | village-lost, SCATTERED (hungryDays 5) | 2 | 61 |
| 9995 | 39 | village-lost, SCATTERED (hungryDays 3) | 3 | 35 |
| 9996 | 145 | village-lost, SCATTERED (hungryDays 5) | 0 | 14 |
| 9997 | 180 (cap) | survived | 0 | 0 |
| 9998 | 163 | village-lost, SCHOLAR-DEATH CHAIN (pantry 38,853 full) | 0 | 0 |
| TOTAL | — | 4 scattered / 1 chain / 3 survived | 5 of 285 deaths | 143 |

### The five deaths, classified (taxonomy from the prereg)

| death | plenty test | away on hit days | unknown/spoiled turns | first −8 health | primary mechanism (+ compounding) |
|-------|-------------|------------------|------------------------|-----------------|-------------------------------------|
| 9994 adaeze_nwosu d51 | PASS (13,585 @ d44) | 0 | 0 / 0 | 10 | production-cliff + low-health; scholar-sweep present (scholar took 15,544 kcal in the 7d window; d50 swept 2,457 → 0) |
| 9994 luis_fernandez d58 | FAIL (max 996) | 0 (away once, d55, a non-hit day) | 0 / 0 | 21 | production-cliff + low-health; sudden health collapse 88 → 21 between d56 and d57 meals (cause unattributed by the meal trace — see below) |
| 9995 gen_k1gx1tz d31 | FAIL (max 4,015 @ d25) | 0 | 0 / 0 | 12 | production-cliff + low-health; scholar swept 2,344 → 0 on d31 |
| 9995 gen_2o2a6ve d31 | FAIL (max 4,015 @ d25) | 0 | 0 / 0 | 10 | production-cliff + low-health; scholar swept 2,344 → 0 on d31 |
| 9995 owen_smith d32 | FAIL (max 4,015 @ d25) | 0 | 0 / 0 | 17 | production-cliff + low-health; scholar swept 1,110 → 0 on d32 |

Mechanism shares across the 5 deaths: away-from-haven 0/5 (0%);
knowledge 0/5 (0%); timing/scholar-first-sweep present as a
contributing order effect 5/5 (100%); production-cliff 5/5 (100%);
low-health-compounded 5/5 (100% — first −8 hit at health 36 or
below in every case: 10, 21, 12, 10, 17, plus 9983's 36).
Plenty-test subset (n = 1): adaeze_nwosu — same mechanism as 9983.

Detail that matters for adaeze (the only plenty-test pass): at
health 7–13 for a full week (days 44–49) she ate WELL — 1,066–1,238
kcal/day, drawing 820–1,050 from a pantry holding 13,287 → 1,250
kcal at her turns — while her health never recovered (drain beat
the +3 recovery). Her production sat at 103–250 kcal/day. When the
pantry hit 0 at her turn on day 50 she ate 164 and took −8 (10 → 2);
day 51 she drew 500 and ate 545, still short, −8 → dead. The plenty
was real and a week old; the death came after the rundown, exactly
as on 9983.

The 9995 trio shares adaeze's mechanism exactly but fails the
pre-registered line: their 7-day max entry reading is 4,015 kcal
(day 25, deaths days 31–32), just under 5,000. They are counted as
mechanism recurrence, NOT as plenty-test passes — the line is not
moved post-hoc (see metric review).

Luis_fernandez is the one partial exception in shape: healthy
(health 96 → 88) through day 56, eating 1,553–2,196/day, then a
−67 health collapse between the day-56 and day-57 meals (88 → 21
before the day-57 meal hit), production 1,944 → 473 → 226, dead day
58 (−8 to 1, famine −4). The meal trace cannot attribute that
between-meals collapse (no wound probe was run for 9994); it is
reported as unattributed, NOT assigned to a cause. His plenty
window was long past (max 996), so he is not a plenty case under
any reading.

### Non-fatal starvation stretches (context, not classified deaths)

- 9993 (scattered day 68): 5 villagers × 5 days of −4 famine hits
  (days 64–68) plus −8 meal hits on 2 villagers days 67–68; nobody
  starved to death before the scatter. Whole-village hunger, not an
  individual distribution failure.
- 9996 (scattered day 145): 2 villagers, hits days 141–145; same
  whole-village stretch, no death before scatter.
- 9991 (survived to cap): a single bare-pantry day 161, −4 hits on
  4 healthy villagers (health 75–85 → 71–81), recovered, no death.
- 9992, 9997, 9998: zero starvation hits. 9998's loss is a
  scholar-death chain in the wild (successive scholars dying days
  162–163, last bearer dies day 163) with the pantry full at
  38,853 kcal — the control case proving village-lost ≠ starvation.

### Is 9983 a pattern or a one-off?

A PATTERN in mechanism, RARE in the headline form. The mechanism
chain (village rundown → scholar-first sweep on thin days →
health-linked production collapse → shortfall hits on an already
sick/wounded villager) recurs in 4 of the 5 census deaths outright
and is present in structure in the fifth. But a starvation death
within 7 days of a ≥5,000 kcal pantry reading is rare: 1/8 census
seeds (and 1/8 wall seeds). Most villages that run out of food
scatter first (4/8 census seeds scattered, 2 of them with heavy
starvation-hit stretches but zero starvation deaths) or survive.
The village-lost flag in this census is, in 4 of 5 losses, the
scattering — not extinction, not starvation death.

## Secondary sense note — backlog #1495 (roster vs loss-flag wrinkle)

RESOLVED by the trace, and the wall evidence's guess was wrong.
9983's loss is the SCATTERING: day-39 exit scattered = true,
extinct = false, hungryDays = 3 (the third hungry day). The final
roster lists 7 people because scattering ends the run WITHOUT
killing anyone: all 7 are members (isMember true), none dead,
health 18–87 (scholar gen_8hvtc45 at 76, who is exempt from the
villageEats loop by parity — which is why he takes no famine hit).
The roster snapshot and the village-lost flag tell the SAME story
once the loss mode is named: the people walked away; they are not
dead, and the roster is not stale. Contrast 9998: a scholar-death
chain loss leaves the final roster EMPTY. No fix needed; the
wrinkle was a missing loss-mode label, and this trace supplies it.
(Coordinator: #1495 can be closed on this evidence; #1492 is
answered by this arm — see verdict above.)

## Other observations (LISTED, NOT chased)

1. elif_demir, seed 9983, day 32: a sickness hurt row with
   died = true, living count 8 → 7 across day 32, and elif absent
   from day-32+ meals — but NO death tele in either instrument's
   death list (both list 14 deaths, neither includes elif). A
   death-tele gap for at least one sickness path, in the same family
   as #1495's reporting wrinkles. Observed, not chased; see metric
   review item 4.
2. Scholar-meal size: the scholar's nightly draw runs 2,000–2,500
   kcal (want 2,000, ceiled to whole items, trust-scaled) and runs
   BEFORE villageEats every night. Whether that first draw should
   be capped, shared, or ordered differently on thin days is a
   DESIGN question for Steve/coordinator, not a verdict of this
   diag — this arm changes no defaults and proposes no lever.
3. Sickness tick step-up (−3/day to −5/day) in the starving phase
   on 9983, observed in the wound probe, unexplained by the meal
   trace. Noted for a future sickness-attribution read, not chased.

## Convergence state

converging (diag, not a lever). #1492 answered with a named
mechanism + census; no lever lands from this arm (DIAG ONLY by
brief). The next food-economy question this evidence actually
supports is a design call, not another measurement: what, if
anything, should change about the scholar-first meal order or the
health→production link on thin days. Until that call, further
starvation censuses would re-measure the same chain.

## Proof

scripts/test-starveplenty-b.js: 36/36 GREEN — trace deaths equal
the wall sense deaths exactly; all 8 census seeds present; census
starvation deaths reconcile to the expected five; plenty-test
passes exactly 1 (adaeze); every classified death has zero away
days on hit days, zero unknown/spoiled pantry turns, and a first
−8 hit below health 50; no src/js file differs from HEAD
(diag-only guard). No concurrent jest was run; this proof is a node
script, not a jest suite.

## Files

- Prereg: evidence/2026-10-30/sim-starveplenty-b-prereg.md
- Trace instrument: scripts/trace-starveplenty-b.js
- Wound probe: scripts/trace-starveplenty-b-wounds.js
- Census analyzer: scripts/analyze-starveplenty-b.js
- Proof: scripts/test-starveplenty-b.js
- Trace: evidence/2026-10-30/sim-starveplenty-b-trace-9983.json
- Wound probe output: evidence/2026-10-30/sim-starveplenty-b-wounds-9983.json
- Census: evidence/2026-10-30/sim-starveplenty-b-census-9991.json
  … through …-9998.json (8 files)
- Wall corpus referenced (not copied): evidence/2026-10-30/sim-wall-b-corpus/seed-9983.json
  + evidence/2026-10-30/sim-wall-b-sense-9983.json

## Metric review (§14 — required section)

- Pre-registered metrics bind this run; no re-scoring occurred.
  The plenty test was judged exactly as pre-registered
  (villageEats-entry ≥ 5,000 within 7 days); the 9995 trio at 4,015
  is reported as mechanism recurrence, NOT re-scored as plenty
  passes.
- Metric issue 1 (plenty line is blunt): 4,015 vs 5,000 is not a
  mechanism difference — the trio's chain is adaeze's chain. The
  5,000/7-day line is a screening device, not a natural kind.
  Proposed revision for the NEXT run: report mechanism counts AND
  plenty-test counts side by side (as this file does), and consider
  a graded plenty scale (≥5,000 vs 2,500–5,000) instead of a single
  line. Do not move the line on this run's data.
- Metric issue 2 (entry understates the morning's food): the
  scholar's meal runs BEFORE villageEats, so villageEats-entry
  readings miss the scholar's take (up to ~2,500 kcal). On 9983
  days 36–39 the true morning food was 1,466/948/1,254/1,026 while
  entry read 0/0/216/0. Proposed revision for the NEXT run: use
  the pre-scholar-meal pantry (scholarMeals pantryBefore) as the
  morning's food and entry as the villagers'-turn food, reported
  as a pair. Not applied here (prereg bound the test to entry).
- Metric issue 3 (timing class assumed roster peers): the observed
  drainer on empty-pantry days is the scholar's pre-loop meal, not
  earlier roster eaters. Proposed taxonomy refinement for the NEXT
  run: split timing into scholar-first-sweep vs peer-drain vs
  first-eater-deposit-trap. 9983 still classifies under timing as
  written ("gone by this villager's meal turn").
- Metric issue 4 (death-tele gap): elif_demir day 32 (see
  observation 1) shows a died-flagged sickness hit + living-count
  drop + meal absence with no death tele. Proposed revision for
  the NEXT run: cross-check living-count deltas against tele
  deaths in every census (this trace's daily living counts make
  that check possible).
- Metric issue 5 (health None ≠ 100): healthBefore is null before
  a villager's first recorded damage (health map uninitialized).
  Null was never read as full health in this analysis; the proof
  asserts only on hit days where health is set.
- No metric revision is applied to this run's numbers. All
  revisions above are proposals for the NEXT run.
