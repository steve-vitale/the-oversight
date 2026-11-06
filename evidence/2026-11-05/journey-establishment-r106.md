# Journey leg ESTABLISHMENT — r106 run note (2026-11-05, Lane A)

## Prereg
`evidence/2026-11-05/journey-establishment-r106-prereg.md` (committed
c1bb6cac6 BEFORE any scored seed; driver + analyzer + proof committed
0a891beba BEFORE any scored seed; rebased onto fd2d0c5ef after Lane B
r144 landed, hashes updated here). Driver
`scripts/journey-establishment-r106-20261105.js` (r105 driver clone +
`withHuntStaff(competent, 'competent-hunt')` always wrapped; HUNTSTAFF=1
arms the layer, unset = gate-off), analyzer
`scripts/analyze-journey-establishment-r106-20261105.py`, proof
`scripts/test-journey-establishment-r106-huntwire.js`. Seeds 1501–1504
(IDENTICAL to r102/r103/r104/r105 — matched control/arm panel by design,
see prereg seed-band check), competent policy, 42-iteration horizon,
death-aware tail. Base: master a98dd9165 at branch time. Control: r105
driver unmodified, re-run on a98dd9165 (files in goal hidden_files
`evidence-2026-11-05-control-r106/`).

## Leg question
r105 proved the hunt duty is never staffed in-window (0 hunt calls on all
four seeds) so field_dressing — held by 6, mechanism proven — can never
fire. This run asked whether staffing hunts, via the existing landed
default-OFF huntstaff layer (b4 + refusestaff repair), changes the
establishment funnel (pantry, survival, field_dressing fires) on identical
seeds 1501–1504.

## Panel verdict (BINDING metrics)
- M0 INSTRUMENT-NEUTRALITY: **PASS (pilot seed 1501).** r106 driver with
  HUNTSTAFF unset reproduces the same-base control EXACTLY (endDay 24,
  aliveEnd 8, pantryKcalEnd 0, 15 lessons, zero diff). Proof test P2
  (5d, 3 legs) also identical incl. control-vs-control. The wrapper
  changes nothing when off. The control itself reproduces the committed
  r105 panel EXACTLY on all four seeds (fields + lesson sets, zero diff)
  — the base move (r108 landing, r143 Ruth fix, r102 scale) changed
  nothing on this panel.
- M1 HUNT-STAFFING: **HUNT-HURTS** (pantryUp=[] survUp=[1504]
  survDown=[1501, 1502] fieldDressingFires=11). Per-seed arm vs control:
  - 1501: endDay 40 vs 24 | alive 4 vs 8 | pantry 0 vs 0 | over True vs
    True. 9 assignments, 9 kills, 30,355 kcal (incl. a 21,840-kcal deer).
    The village lived 16 days longer and still lost (village_lost d40,
    pantry 0) with 26 deaths vs 15.
  - 1502: endDay 41 vs 44 | alive 8 vs 9 | pantry 0 vs 20,582 |
    over True vs False. 3 assignments, 3 kills, 5,176 kcal. The village
    LOST (village_lost d41, pantry 0) where the control survived.
  - 1503: IDENTICAL to control on every field (endDay 43, alive 8,
    pantry 5,186, lessons diff none). 0 assignments — the roster holds
    NO hunter-substrate villager at all (fisherman, locksmith, bartender,
    dispatcher, plumber, paramedic, farmer, taxi driver), so the layer
    could never fire.
  - 1504: endDay 43 vs 43 | alive 7 vs 6 | pantry 0 vs 51,208 |
    over False vs False. 5 assignments, 2 kills (3 misses), 1,848 kcal.
    One more villager alive, pantry collapsed to zero.
  - Panel: assignments 17, hunt calls 17 vs 0, kills 14 vs 0, kcal
    37,379 vs 0. Field_dressing fires 11 (Leo 9, Ethan 2) — the FIRST
    field_dressing uses in the establishment window. Triage fires 5
    (all Chen, 1502) vs r105's 1.
- M2 CARE-VISIBILITY: careTicks 166, tends 46, medics seen 10 distinct.
  healerRounds 19, treatTicks 166, treatChanged 3 (Maureen, Chen, one
  unnamed). Care runs on occupation as before; the arm's trajectory
  changed WHO tends (Chen 5 reach-2 uses on 1502) but not the mechanism.
- M3 SURVIVAL-42: **2/4 — FAIL** (need ≥3/4). Arm alive at 42: 1503,
  1504 only. Control: 3/4. §14c co-primary (villager combat deaths):
  arm 1501: 10 villager-combat + 3 combat; 1502: 40 deaths incl. 15
  villager-combat + 11 combat; no hunter died of a hunting wound (see below).
- M4 PANTRY-GUARDRAIL: **2/4 — FAIL** (need ≥3/4). Starvation/
  thirst/dehydration deaths: 1501 arm 3 (Liam, Ava, Yanis d38–40),
  1502 arm 1 (Aubrey dehydration d8, same as control). Control: 3/4
  (only 1502's Aubrey). Keywords now include 'dehydrat' (r105
  correction, applied).
- M5 PEOPLE: **PASS with the r105 skip rule.** 1501/1502 skipped (game
  over — correct per r81). 1503: Willie/Elie, byte-identical to r105's
  read (legacy thread, honest road constraint). 1504 (arm roster):
  Sari wants to laugh again properly ("Joy is a resource. I'm foraging
  for it."); Thabo asks the most useful lesson and ACCEPTS an invitation
  ("Okay. Yeah. I trust you."). All four read convos are coherent —
  NPCs want something, options engage/deflect, endings resolve/plant.
  The goon-first driver again picked betrayal:accept while sampling
  (r105 hygiene note, unchanged).

## The mechanism — why HURTS, and what it is not
The hunts are real meat (37,379 kcal in-panel, 14 kills) but the pantry
swings dwarf them: 1502 −20,582 and 1504 −51,208 against hunt intakes of
5,176 and 1,848 kcal. The harm is NOT "hunts eat the pantry." It is
trajectory re-roll: `villagerHuntResolve` draws `Math.random()` (animal
pick + stalk chance, game.js:6630+), so the FIRST hunt resolve shifts
every later draw — forage yields, fights, contests, lessons all re-roll
from that day. First divergence lands the day after the first hunt on
both seeds (1502 d28, 1504 d27). On 1501 the re-roll bought 16 extra days
(deer 21.8k) but more fight exposure (26 vs 15 deaths, mostly
villager-combat while the village lived longer in a wave-2 world). On
1502/1504 the re-rolled paths starved. On 1503 nothing re-rolled (no
substrate, no hunt) and the arm is byte-identical to control — the clean
negative control inside the panel. The verdict stands on the
pre-registered metric, but on n=4 the layer's effect cannot be separated
from re-roll luck: 2 of 3 firing seeds landed worse. A bigger matched
panel, or a hunt resolve that draws from a separate RNG stream so the
lever stops re-rolling the world, is what would separate the two — named
in metric review, not attempted here.

## Hunter fates (§14c)
- Leo Martin (1501, trail crew lead): 9 hunts, 9 kills, 0 wounds, died
  d39 of sickness — the hunt champion, used up by illness, not the hunt.
- Ethan Hunt (1502, trail crew lead): 3 hunts, 3 kills, wounded d32
  (13 dmg, 68 HP) → refused d33 by the wound ledger → died d34 to a
  MONSTER in a fight. No death carries cause 'hunting'; the wound is a
  contributing factor (he went into the fight at 68 HP), not the recorded
  cause. The refusestaff repair fired exactly as designed.
- Pavel Dubinin (1504, bush pilot): 5 hunts, 2 kills + 3 misses,
  wounded d26 (24 dmg, 76 HP) → refused d27/d28 → died d38 in combat,
  12 days after the wound. Not hunting-attributable.
- The layer picks the best-competence eligible hunter repeatedly (b4's
  "hunt champion"); all three champions are dead by the end of their
  runs — of sickness, monsters, and combat, respectively.

## Village assessment, in plain words
Four villages started with 12 people each. Three of the four armed
villages changed course the day their hunter first walked out; the fourth
never had a hunter to send. 1501 is the long goodbye: Leo's hunts —
owl, opossum, then a deer worth 21,840 kcal — kept the village fed 16
days past its control death, but the extra days were fight days, and the
village still lost on an empty pantry with only 4 alive. 1502 is the
caution: Ethan's three kills (snake, porcupine, squirrel) could not hold
the pantry, the village lost at day 41 where its twin survived, and
Ethan himself died to a monster two days after a hunting wound. 1503 is
the untouched twin: no hunter on the roster, no hunts, identical to its
control in every number. 1504 is the paradox: Pavel's five hunts mostly
missed, the pantry ran HIGHER than control for a month (49,860 at day
36), then crashed to zero in the last two days as joiners swelled the
roster to 7 — one more villager alive than control, nothing to eat.
Nobody starved on 1503/1504; 1501 starved at the end (3 deaths) and
1502 lost its village to the empty pantry. The care system kept working
through all of it (Chen tending two at a time, five times on 1502).

## The blank filled — and the one left open
FILLED: the r105 open question is answered with numbers, not a hunch.
Field_dressing now FIRES in the establishment window (11 kills by
holders) — the duty was never broken, only unstaffed. And staffing
hunts, on this panel, HURTS: the layer feeds lean villages (b4, 180d)
but in the 42-day establishment window its first hunt re-rolls the
village's whole path, and 2 of 3 re-rolls land worse. The wound ledger
works (3 refusals, 0 re-staffings through wounds).
LEFT OPEN: whether the harm is the lever or the re-roll. The panel
cannot say — the mechanism section names the two discriminating tests
(bigger matched panel; separate RNG stream for hunt resolves). Neither
was built here: both are design/instrumentation calls, not drive-by
fixes. The layer stays default-OFF (HUNTSTAFF=1 only in the arm); no
src/js changed; nothing about the layer itself was "fixed."

## Contests
Fired/ended per seed (arm): 6/5, 4/3, 4/2, 5/5. Under the r101 rule
(exclude fired within 2 days of run end): 1501's day-40 pit contest
(fired d40, endDay 40) is excluded — ZERO stuck contests on any seed.
Control: 3/1, 2/2, 4/2, 4/4 (same shape as r105).

## Telemetry deviation check (step 14)
Baseline: `telemetry-baselines/establishment.json` (r40 re-seed).
Command: `node scripts/telemetry-check.js --baseline
.../telemetry-baselines/establishment.json --current
'evidence/2026-11-05/journey-establishment-r106-seed*.json' --metrics
guardrails.deaths,guardrails.popAlive,guardrails.pantryKcal,c3.starvationDeaths`
- LOUD: `guardrails.deaths` 41 -> 130 (+217%). Same class as
  r85/r86/r99/r101/r102/r103/r104/r105 — the baseline counts an r40-era
  death regime; the current files count all death-tele records (119 on
  the control, 130 on the arm). Artifact, explained, not a bug.
- LOUD: `guardrails.pantryKcal` 77861 -> 5186 (−93%). REAL — the
  telemetry echo of the M1 finding: the arm panel's pantry totals
  collapsed (0+0+5186+0) vs control 76,976 (within 1% of baseline).
  Investigated in the mechanism section above; this is the measured
  lever effect, not a telemetry defect.
- Quiet: popAlive, starvationDeaths (1 -> 4 stays under the rule's
  baseline≥5 swing bar; M4's 2/4 already captures it).
- **Baseline NOT rolled forward.** The deaths line is the known regime
  artifact; the pantry line is a lever panel, not the new normal.
- NOTE (instrument gap, found while running step 14): the r106 driver
  did not write `guardrails`/`c3` summary keys, so the check first read
  0 on all metrics. The committed r105 files carry those keys but the
  r105 driver does not write them — they were added by an unrecorded
  post-processing step. This run derived and injected them
  deterministically (deaths=len, popAlive=aliveEnd,
  pantryKcal=pantryKcalEnd, starvationDeaths by the corrected keyword
  set) into the 4 arm files + 4 control files; verified the derivation
  reproduces r105's committed values exactly on all 4 seeds (except
  1502's c3, where the corrected keywords now count Aubrey's dehydration
  as 1 where r105's old keywords counted 0 — the documented correction).
  The driver should write these keys natively; see metric review.

## Metric review (for the NEXT run, not this one)
- The M1 verdict set needs a fifth label: HUNT-MOVED-ONE-SEED (the arm
  moves exactly one seed on pantry/survival). The prereg's four labels
  did not cover the 1-seed case; the analyzer adds it. It did not fire
  this run (movement was 0/2/0/1 seeds: pantry 0, survival 1 up + 2
  down), but the label should be pre-registered, not invented mid-run.
- The re-roll confound is the next run's design question: (a) a bigger
  matched panel (8+ seeds) to average out re-roll luck, or (b) a hunt
  resolve on a separate RNG stream so the lever's food effect separates
  from trajectory noise. (b) is a src/js change and a Steve-call — it
  changes what a hunt resolve draws from.
- The eligibility snapshot masks dead hunters: `isHunterSubstrate`
  returns false for dead villagers, so a hunter dead by the end vanishes
  from the snapshot (Ethan/Pavel both invisible at end). The assign/wound
  logs are authoritative; the snapshot should record substrate-ness
  independent of death, or the analyzer should join assignLog names.
- Driver should write `guardrails` + `c3` summary keys natively (see
  telemetry note above) so step 14 works without post-processing.
- Still standing, unchanged: scholar-day labels skip/repeat (all
  ordering uses telemetry sequence index); census `equipped` first-row
  duplication (r99); player codex start snapshot is missing (end
  snapshot only); armor lessons are not skill_lesson rows; `ability_used`
  double-emission (pre-existing, r104).
- The diplomat "incident" half remains unimplemented (r105); out of
  scope.

## Reachable / fun / winnable (establishment)
- Reachable: IMPROVED on one axis — field_dressing is now reachable as
  a USE (11 kills), not just a holding; triage fired 5×. The other four
  (diplomat, herbal_remedy, preserve_food, wound_care) stay held and
  structurally unreachable as villager tools (r105, unchanged).
- Fun: MIXED — watching Leo bring home a deer that feeds the village
  for two weeks IS the game working (a hunter with a name, a kill with a
  number, a village that eats because of him). But the villages that
  hunted died sooner or poorer than their twins, and a player who staffs
  a hunt and watches their pantry crash will feel betrayed by the lever,
  not challenged by it.
- Winnable: WORSE on this panel — survival 2/4 vs control 3/4, no seed
  improved its pantry, one village lost outright. The establishment risk
  is still food, and hunts as built do not fix it in-window.

## Infrastructure notes
- Registration slow (~12 min) under REGISTRY.lock contention; the
  register script itself was healthy, just queued. Heartbeat loop held
  throughout (600s loop, log:
  goal hidden_files/journey-establishment-r106-heartbeat.log).
- safe-commit index clobber hit BOTH commits this run (prereg: 1 file
  staged-as-deleted; tooling: 3 files staged-as-deleted + a stray
  `scripts/__pycache__/` from py_compile, removed not committed);
  repaired with `git update-index --cacheinfo` from HEAD blobs, verified
  clean `git status` + empty `git diff HEAD` and correct `git show
  --stat` each time.
- Proof tests: huntwire P1 4/4 + P2 3-leg det-gate identical (endDay 6,
  aliveEnd 12, pantryEnd 27450, 5 lessons, all three legs); b4 layer
  proof re-run ALL GREEN on this base (Part A 17/17, Part B det-gate
  4/4 clean-identical, Part C smoke).
- No EPERM flap this run.
- Rotation advanced 1 -> 2 (deepening next) by the main-session
  closeout — verified by read-back.

## Closeout (main-session closeout of the timed-out 19:45 run)
- Pre-rebase check.js --quick: **284 passed, 6 failed in 793s** — the
  standing r105 set, no new failures (proof-update, workflow,
  occupation-panels, mobile-combat-cadence, phone-frame-proof,
  establishment-r20-fixes). This run changed NO src/js (only new
  scripts/ + evidence/), so none of the 6 can be caused by it.
- Post-rebase check.js --quick (rebased onto fd2d0c5ef, log
  goal hidden_files/establishment-r106-checkquick-20261105.log):
  **278 passed, 12 failed in 1779s.** 5 timeouts at exactly the 120s
  cap (comfort-arc, solo-campaign-endings, trust-observer-neutrality,
  capable-bot, table-endings) — load flake on a heavily loaded box.
  7 assertion failures, all pre-existing on master and none in this
  branch's touched areas: proof-update (stale proof inputs), workflow
  (retained neutrality proof stale on current inputs), mobile-combat-
  cadence (same 2 sub-failures as r104/r105), occupation-panels (real
  CLI workflow), measurement-cache-flags (4 sub-failures — verified
  failing identically standalone on master fd2d0c5ef itself; the branch
  changes no src/js), phone-frame-proof (stale receipt),
  establishment-r20-fixes (racks-full next-day count, known since
  r103). Targeted proofs on the touched areas: huntwire P1 4/4 + P2
  det-gate identical; b4 layer proof ALL GREEN (17 pins + det-gate
  4/4 + smoke).
- Merge pending: rebase onto the current master + re-run of proofs and
  gate after the Loop A closeout lands; final numbers appended here
  before the merge. No bump/push/live-verify — ship loop owns those.
