# sim-wideduty-a — PRE-REGISTRATION (binding)

Run: oversight-flesh-out-loop, run fleshout-20261109T1015Z (Loop A).
Axis: food-economy (converging, NOT converged). Food-economy blank #2
from sim-medheadcount-a (WIDEN THE DUTY). Worker tree:
~/workspace/worktrees/sim-wideduty-a, branch sim-wideduty-a. Base
master: 8cee6a8d2. Policy: competent ONLY
(scripts/policies/competent.js, UNMODIFIED). Env: PLENTYDEPRI=1,
DEPOSITGATE=1. Horizon: 150d death-aware cap. Seeds: 96301–96308 (the
medicduty / medicdiag / medheadcount band, deliberate reuse).

## Context (from evidence, not re-measured here)

- sim-medheadcount-a (evidence/2026-11-08/sim-medheadcount-a.md):
  medic-present share 56.1% (543/968) on its fixed-recorder before leg,
  2/8 seeds never seeing a medic; the spawn-guarantee lever lifted it to
  82.3% but was HELD on gate attribution (10 lever-attributable test
  failures) — the lever is NOT in this base (zero src/js diff vs its
  base). The trained population the duty ignores is the named next
  blank: triage-non-medic days 664/968, wound_care-holder days 706,
  herbal_medicine-holder days 580, 40 medical lessons on the before leg.
- The sibling arm in this run is the medheadcount SUITE UPDATE (update
  the 10 failing tests with per-test justification, then land the
  spawn guarantee). This arm touches ONLY medicDutyHolder eligibility
  in game.js — no genRoster/genCharacter code. If both GO, this arm
  lands AFTER the sibling suite arm; the coordinator rebases as needed.

## DIAG (measured before any lever is chosen; code citations)

- DUTY DEFINITION: medicDutyTick / medicDutyHolder (game.js ~33037)
  define "medic" ONLY by formerOccupation regex
  (nurse|medic|doctor|paramedic|midwife|veterinarian|pharmacist|
  herbalist|dentist). A villager taught wound_care, or holding
  triage/herbal_remedy/field_medicine, does NOT count — the duty cannot
  see a trained medic. npcHasAbility('triage') is used only to PREFER
  among occupation-medics.
- SKILL ↔ ABILITY MAPPING (verified in data, not assumed): triage and
  field_medicine are skill-lane abilities carried by wound_care;
  herbal_remedy is carried by herbal_medicine
  (src/data/abilities.json: triage lane=skill skillId=wound_care;
  field_medicine lane=skill skillId=wound_care; herbal_remedy
  lane=skill skillId=herbal_medicine). So npcHasAbility('triage') is
  already true for a wound_care holder via the skill lane — the ability
  check subsumes the skill check in practice. The predicate below
  checks BOTH anyway (explicit, robust to data changes).
- PURE READS: npcKnowsSkill (tracks.js:220) reads the npcSkills store
  only; npcHasAbility (game.js:47123) reads npcAbilities + the skill
  lane only. Neither seeds. The recorder reads the same stores — the
  medheadcount skillsKnownBy contamination trap is avoided by
  construction (recorder neutrality is proven by the bare fingerprints,
  L4 of the proof test; see "Before leg" below).
- DUTY EFFECTS FLOW (why eligibility-only is enough, and where the
  holder must be seen): stay-home is enforced through medicDutyHolder()
  in villager-agency.js:270 and villager-objectives.js:919,1132 — a
  widened holder automatically stays home. BUT two downstream gates
  re-impose the occupation regex on the holder specifically:
  (a) villagerCareTick (game.js ~33210) builds its tenders list from
  occupation medics only, so a trained holder would never tend or
  attempt a cure (medicDutyCureAttempt fires only for mid === duty
  inside that loop); (b) campHealerId (game.js:14289) is occupation
  only, so healerRounds and villageSicknessTick's healerFor would not
  see a trained holder — the duty comment's claim ("a holder at Haven
  is the camp healer, so healerRounds ... all see them") is only true
  for occupation medics today. The lever therefore wires the HOLDER
  through both gates (holder joins the tenders list; campHealerId
  returns the duty holder when present at that camp) — still "who
  counts", not new behavior. villagerTreatTick / villagerDiagnosisTick
  (treat/diagnose the PLAYER) stay occupation-only: they are not the
  duty's behavior.
- TEACH: teaching already spreads wound_care (before leg below: 33
  lessons) and the craft track grants triage to non-medics — the
  trained population exists; the duty ignores it.

## Before leg (MEASURED on current master, this recorder, before any lever)

Analyzer: `node scripts/analyze-wideduty-a.js --leg
evidence/2026-11-09/wideduty-a-corpus` (competent rows, run
2026-11-09; the 8 bare rows are still running at prereg time —
recorder neutrality L4 is pending and MUST pass before the after leg
runs):

```
WALL: national=0/8 table=0 wins=0 waveReach={"1":8,"2":8,"3":8,"4":7,"5":2} medianSurvival=97d max=143d
PRIMARY: dutyHeld=342/786 share=43.5% dutyTrained=0/786 (0.0%) zeroDutySeeds=3/8
COVERAGE: eligibleDays=544/786 (69.2%) eligibleMax=6 medicPresent=363/786 (46.2%) zeroMedicSeeds=3/8 spawnMedics=5 spawnSeedsWithMedic=4/8
PATHS: medLessons=33 triageNonMedicDays=457 triageNonMedicMax=5 wcHolderDays=512 hmHolderDays=377 dutyCures ability=43 medicine=0
RECRUIT: joins=138 medicJoins=6 medicDeaths=6
GUARDRAILS: starvationDeaths=5 deathModes={"fight":94,"wound/sickness":18,"label:gavel":1,"starvation":5,"dehydration":1,"label:big big":1,"label:the focus group":1} deathCauses={"the wild":63,"contest":7,"monster":10,"the arena":6,"sickness":13,"combat":1,"a wound that wouldn't close":5,"ambush":5,"gavel":1,"starvation":5,"a stranger":2,"dehydration":1,"big big":1,"the focus group":1}
  seed 96301: days=143 dutyHeld=128/142 eligDays=139 medicPresent=129 cures=17 lessons=13 wave 1-5
  seed 96302: days=97  dutyHeld=0/97   eligDays=91  medicPresent=0   cures=0  lessons=11 wave 1-4
  seed 96303: days=81  dutyHeld=34/81 eligDays=75  medicPresent=51  cures=7  lessons=0  wave 1-4
  seed 96304: days=75  dutyHeld=66/75 eligDays=75  medicPresent=67  cures=1  lessons=3  wave 1-4
  seed 96305: days=81  dutyHeld=1/80  eligDays=30  medicPresent=2   cures=0  lessons=0  wave 1-4
  seed 96306: days=97  dutyHeld=0/97  eligDays=0   medicPresent=0   cures=0  lessons=0  wave 1-3
  seed 96307: days=134 dutyHeld=113/134 eligDays=134 medicPresent=114 cures=18 lessons=6 wave 1-5
  seed 96308: days=80  dutyHeld=0/80  eligDays=0   medicPresent=0   cures=0  lessons=0  wave 1-4
```

Reading: the duty sits EMPTY on 3/8 seeds, but the trained population
is present on 69.2% of village-days. Seed 96302 is the clean case:
91/97 days hold an eligible trained villager, duty held 0/97. Seeds
96306 and 96308 have NO eligible villager on any day (eligDays 0) —
widening cannot help them; they need a teacher or a medic, which is
the spawn arm's job, not this one's. The ceiling for this lever is
therefore ~(786 − 97 − 80)/786 ≈ 77.5% duty-held, not 100%.

BASELINE DIVERGENCE NOTE: this before leg's survival (median 97d)
and medic-present share (46.2%) are BELOW the medheadcount before leg
(median 128d, 56.1%) on the same seeds. The game code is NOT the same
base: src/js changed between 55b5e5aae and 8cee6a8d2 (conversation.js
+122, food.js 22 lines, villager-agency.js 15 lines — journey
r116/r120/r156/r161 work). No src/js/game.js diff. The medheadcount
numbers are context, not this arm's baseline: this arm judges
before/after on ITS OWN recorder on ITS OWN base, identical seeds.
Recorder neutrality (bare == competent fingerprints) is the check
that the divergence is base, not recorder — it MUST pass before the
after leg runs.

## Eligibility set (the exact set this arm implements)

A villager is duty-eligible iff, in order (first match wins):
1. formerOccupation matches the existing duty regex
   (nurse|medic|doctor|paramedic|midwife|veterinarian|pharmacist|
   herbalist|dentist), OR
2. npcKnowsSkill(wound_care) OR npcKnowsSkill(herbal_medicine), OR
3. npcHasAbility(triage) OR npcHasAbility(herbal_remedy) OR
   npcHasAbility(field_medicine).

All other duty gates UNCHANGED: alive, not the scholar, not away, not
sev-2 sick, physically at Haven, deterministic roster order. The
scholar is never the holder (existing rule). Preference order among
candidates: (0) holds a healing ability (can actually cure),
(1) occupation medic, (2) skill-only trained — stable roster order
within each tier. The "no medic at all" say-line condition becomes
"no ELIGIBLE villager on the roster" (a trained villager away from
Haven means the village DOES know doctoring — the line would be a
lie otherwise).

Justification from the DIAG: the duty's cure channels already read
exactly these abilities (medicDutyCureAttempt tries herbal_remedy /
field_medicine / triage); a wound_care holder carries triage +
field_medicine by the skill lane, an herbal_medicine holder carries
herbal_remedy. Eligibility = "can do the job the duty exists to do"
(tend + cure), not "holds the job title". No new skill, ability,
cure, or behavior is created.

## Lever built (after prereg; game.js only)

- New Game.isMedicDutyEligible(id): the predicate above (pure reads).
- medicDutyHolder(): occupation regex → isMedicDutyEligible(id).
- medicDutyTick(): isMedic → isMedicDutyEligible; anyMedic →
  roster-wide eligibility; candidate preference sort by the tiers
  above; "no medic" say-line gated on any-eligible.
- villagerCareTick(): the current duty holder joins the tenders list
  (tends first, cure attempt as today) — the holder must be able to
  do the duty's job.
- campHealerId(place): returns the duty holder when present at that
  camp (before the occupation find) — the holder must be visible to
  healerRounds / healerFor.
- NOT touched: genRoster / genCharacter (sibling arm's area),
  villagerTreatTick, villagerDiagnosisTick, cure channels, stay-home
  enforcement, the duty say-lines' wording (a trained holder triggers
  the existing "staying at Haven as the camp healer" line — note for
  [needs-eyes] if Steve should hear a trained villager take the job).
- [needs-eyes]: the camp-healer announcement now fires for trained
  villagers — Steve should hear whether that reads right.

## Pre-registered header (judged bar)

- PRIMARY (G1): duty-held village-days share ≥ 60% (before-leg
  43.5% — a +16.5pp lift; the 70% absolute bar is unreachable on
  this band because 2/8 seeds have zero eligible villagers on any
  day, capping the lever at ~77.5%, and the duty still needs the
  holder at Haven, not merely present) AND seeds with zero duty-held
  days ≤ 2 of 8 (before: 3 of 8 — 96302 must gain a holder; 96306 and
  96308 cannot, eligDays 0).
- SECONDARY, MECHANISM (reported, gated as part of G1's story, not a
  separate pass/fail): duty-held-by-trained days > 0 — the lift must
  come from trained holders in the chair, not from occupation medics
  behaving differently. (If dutyHeld rises with dutyTrained = 0, the
  lever did nothing and the verdict is NO-GO regardless of G1.)
- GUARDRAILS (G2): median survival ≥ 0.8× before-leg control
  (97d → ≥ 78d); starvation deaths ≤ before + 2 (5 + 2 = 7); no new
  death-cause mode ≥ 2 — WIRED into scripts/analyze-wideduty-a.js
  (causeMode groups labels by how the villager died; the medheadcount
  hand-judgment is not repeated).
- PANEL (G3): §15 balanced panels before/after, compare attached; any
  regression_signal investigated, unexplained regression blocks a GO
  claim.
- PROOF (G4): scripts/test-wideduty-a.js green (all legs).
- GO: G1 + G2 + G3 + G4 all pass, with the mechanism check satisfied.
  A miss is NO-GO, never re-scored.
- CONFIRM BAND (if pilot GO): 12 fresh seeds 96901–96912, 150d,
  competent only, before/after on identical seeds.
  AMENDMENT (adoption, 2026-11-09, main session): the prereg's
  original band 96401–96412 is NOT fresh — 96401–96404 are used by
  journey-deepening r116 (evidence/2026-11-07/journey-deepening-r116-prereg.md;
  the worker's grep covered sim-*-prereg.md only and missed it; the
  collision was already recorded in sim-medheadcount-suite-a.md
  §Confirm). Freshness of 96901–96912 verified by the adopter:
  zero hits in any .md under evidence/, docs/, or goal hidden_files/;
  zero hits in any committed *prereg.md (git grep, 153 used numbers
  in 96000–98000 listed); zero hits in any *prereg.md under
  ~/workspace/worktrees/ (live arms included). The 969xx range
  appears nowhere as a seed band. 96009–96024 was NOT reused — it is
  the medheadcount-suite arm's verified-fresh owed confirm band.
  The confirm band is recorded here so the next worker does not
  reuse it.
- TIME-COMPRESSION: if the pilot GOes but time runs short, bank the
  pilot + lever + instruments as GO-pilot with the confirm band owed
  (named above), rather than landing an unconfirmed number.

## Metric review (filled at end of run, main-session adoption 2026-11-09)

- **G1 PRIMARY: PASS.** dutyHeld 88.3% (bar ≥60%, before 61.0%);
  zeroDutySeeds 0/12 (bar ≤2, before 2). Trained holders 51.8% of duty
  days (before 0%) — the lever's whole point, measured directly.
- **G2 GUARDRAILS: PASS.** Median survival 122d (bar ≥100 = 0.8×125);
  starvation 1 (bar ≤4); no new death mode ≥2.
- **G3 PANEL: PASS.** §15 compare `review_required`, NO
  `regression_signal` (1 paired case per policy — every metric
  `insufficient`, as expected for a screen; deltas mixed both ways,
  single-seed noise + a denominator artifact on deaths/100d).
- **G4 PROOF: PASS.** test-wideduty-a.js 7/7 on the levered tree.
- **VERDICT: GO.** No re-scoring anywhere: the confirm was judged on the
  substituted fresh band 96901–96912 exactly as amended, and the panel
  before-leg was rebuilt on the adopt base rather than blessed.
- **Metric notes for the next run:** (1) the confirm band substitution is
  the second freshness miss this week (the worker's grep covered
  sim-*-prereg.md only) — freshness checks must grep ALL dated preregs
  plus journey preregs; (2) deaths/100d on 1-seed panels flips sign
  against deaths/run whenever the legs live different lengths — judge
  panels on absolute deaths + survival together, never the rate alone;
  (3) the medicine cure channel is still 0 everywhere (pharmacy empty)
  — the cure metric cannot be judged until a seeded-stash run exists.
