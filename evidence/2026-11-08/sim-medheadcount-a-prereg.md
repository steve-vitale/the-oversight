# sim-medheadcount-a — PRE-REGISTRATION (binding)

Run: oversight-flesh-out-loop, run fleshout-20261109T0415Z (Loop A).
Axis: food-economy (converging, NOT converged). Backlog #1920 (claimed by
this run). Worker tree: ~/workspace/worktrees/sim-medheadcount-a, branch
sim-medheadcount-a. Base master: 55b5e5aae (Haven Medic Duty LANDED,
d910dc6da). Policy: competent ONLY (scripts/policies/competent.js,
UNMODIFIED). Env: PLENTYDEPRI=1, DEPOSITGATE=1. Horizon: 150d death-aware
cap. Seeds: 96301–96308 (the medicduty / medicdiag band, deliberate reuse).

## Context (from evidence, not re-measured here)

- medicduty-a (2026-11-08): Haven Medic Duty works where a roster medic
  exists (33 cures, villages +22d median survival) but is vacuous on 4 of
  8 seeds (96302, 96305, 96306, 96308) that have NO roster medic at all.
- medicdiag-a §C4 (2026-11-07): 43.7% of days have zero roster medics.
  Second shape named: MEDIC HEADCOUNT — grow the roster of
  medical-occupation villagers (recruit/retain/teach via the craft track,
  whose skill lane already grants triage to 12/12 medics).
- Recomputed from the medicdiag-a corpus (evidence/2026-11-07/
  medicdiag-a-corpus/, competent, 8 seeds, 821 village-days):
  medic-present days 460/821 = **56.0%**; seeds with a spawn medic 4/8
  (96301 Lena ER nurse; 96303 Antonio Pharmacist; 96304 Oliver
  Veterinarian; 96307 Daniyar paramedic + Maya ER nurse); seeds 96302,
  96306, 96308 never have a medic all run; 96305 gains two mid-run
  (Dorothy nurse d58, Clarisse Pharmacist d112 — recruitment works, late).

## DIAG (measured before any lever is chosen; code citations, file + function)

- SPAWN: genCharacter (game.js) draws the occupation uniformly at random
  from 78 characterGen occupations (usedOccs dedup within a cast, so at
  most one of each). Medical occupations matching the duty regex
  (nurse|medic|doctor|paramedic|midwife|veterinarian|pharmacist|
  herbalist|dentist): 7 of 78 (er_nurse, paramedic, army_medic, midwife,
  dentist, pharmacist, veterinarian — plus herbalist only if an
  occupation NAME matches; no `herbalist` occupation id exists in
  characterGen.json). P(a given villager is a medic) ≈ 7/78 ≈ 9.0%;
  with ~10 villagers P(zero medics at spawn) ≈ 40% — matches 4/8.
  No spawn guarantee exists.
- DUTY DEFINITION: medicDutyTick / medicDutyHolder (game.js ~33037)
  define "medic" ONLY by formerOccupation regex. A villager taught
  wound_care, or holding triage/herbal_remedy/field_medicine, does NOT
  count — the duty cannot see a trained medic. npcHasAbility('triage')
  is used only to PREFER among occupation-medics.
- TEACH: skill-teaching.js — villagerSkillLessonsDay() runs daily via
  villagerBuildDay(); a medic CAN teach wound_care (knowledge skill,
  backgrounds nurse/doctor/paramedic/...; carries skill-lane abilities
  triage + field_medicine, so skillFit can reach FIT_MIN=1 when craft is
  the learner's need/top track) and herbal_medicine (backgrounds
  herbalist/nurse/botanist/midwife/...; carries herbal_remedy). Gates:
  15%/day per learner, teacher at home, one lesson/learner/day, shared
  language. npcSeedSkills seeds wound_care/herbal_medicine from
  occupation backgrounds at first read. Teaching rate in live sims:
  UNKNOWN — the recorder below measures it (this is the DIAG's open
  question).
- TRACK: tracks.json craft skills = [triage, steady_hands,
  preservation_instinct, herbal_remedy, camp_cook], skillLevels [2,4]:
  a villager levelling craft to 2 learns triage (first unknown craft
  skill) WITHOUT being an occupation medic — but again, the duty does
  not count them. Craft-XP grant rate in live sims: UNKNOWN — recorder
  measures triage holders who are not occupation-medics.
- RECRUIT: visitors (fleeing/curious) can be invited to join
  (betrayal.js visitor invite → ensureRosterPerson → genCharacter,
  uniform occupation draw again); membership applications auto-recruit
  (membership.js ~549). Corpus shows it works but LATE (first medic
  join d52–d58) and unreliably (2 of 4 medic-less seeds ever gain one).
- RETAIN: medics die like anyone else (corpus: Oliver d56, Daniyar d46,
  Maya d61, Lena d108). No retention mechanism exists beyond the duty
  itself (duty holder stays home, which is also protection).

## Lever candidates (ONE will be built, chosen on the DIAG numbers)

- (A) WIDEN THE DUTY: isMedic also accepts a villager who knows
  wound_care / herbal_medicine or holds triage / herbal_remedy /
  field_medicine. Only moves seeds where teaching or the craft track
  has already made a holder — dead letter on the 4 no-medic seeds
  unless paired with a teaching drive.
- (B) SPAWN GUARANTEE: genRoster ensures ≥1 medical occupation in the
  starting cast. Directly attacks the 4/8 no-medic seeds at day 0.
  Changes the opening cast composition — a design-visible change
  (Steve's "12 random people from all over the world"); needs [needs-eyes].
- (C) TEACHING DRIVE: when the village has no roster medic and someone
  is sick (the exact condition of the duty's no-medic say line), raise
  the lesson chance / fit for wound_care from a housemate medic — the
  village learns doctoring because it has to. Only helps seeds that
  HAVE a teacher; useless on the 4 no-medic seeds unless paired with (A).
- (D) RECRUITMENT LEAN: prefer medical visitors/applicants when the
  village has no medic (invite/accept a medic visitor first). Attacks
  the no-medic seeds mid-run (d52+ on current evidence) — slow.

## Lever chosen (2026-11-09, on the DIAG numbers — before any after-leg runs)

(B) SPAWN GUARANTEE — genRoster forces one of the two extra villagers
to a medical occupation when no medic has been drawn yet (game.js
genCharacter forceOccIds + genRoster). The four choice cards stay fully
random. Rationale: teaching already spreads wound_care (34 lessons,
chains, even on medic-less seeds) and 567/861 days already hold a
triage-holding non-medic — the trained population is NOT the binding
constraint, the spawn lottery is (4/8 seeds start with zero medics).
(A) WIDEN THE DUTY (let a wound_care/triage holder count as a medic)
is the named NEXT arm, not this one: it unlocks the 567 idle
triage-non-medic days but cannot move G1 as written (occupation-medic
share), so it needs its own prereg with a duty-eligible-share primary.
Its before-numbers are measured and banked in the evidence file.
(C) TEACHING DRIVE is dead on the DIAG numbers — teaching is already
alive at a good rate; there is nothing to drive. (D) RECRUITMENT LEAN
stays unbuilt: medic joins already happen (12 in the before leg) but
late (d52+); a lean would be slow and is not needed if the spawn
guarantee holds.

## Pre-registered header (judged bar)

- PRIMARY (G1): medic-present village-days share ≥ 70% (before-leg
  RE-ANCHORED 2026-11-09, per the re-anchor clause below: the recorder
  measured 51.6% (444/861) on current master, not the 56.0% from the
  older medicdiag corpus — the difference is the duty itself: villages
  now live a median 120d vs 73d, and the extra days are mostly no-medic
  days, the same survival-dilution confound medicduty-a documented.
  *** CONTAMINATION CORRECTION 2026-11-09 ~06:00Z: that 51.6% was
  measured with a NON-NEUTRAL recorder (skillsKnownBy seeded occupation
  skills daily for every roster member — bare != competent fingerprints,
  seed 96301 139d vs 150d). The number is DISCARDED. The recorder is
  fixed (pure read of the npcSkills store) and the before leg is being
  re-run; the baseline re-anchors to the fixed recorder's number BEFORE
  the after leg runs, per the same clause. The ≥70% bar is unchanged. ***)
  AND seeds with zero medic-days ≤ 1 of 8 (before: 3 of 8 — 96302,
  96306, 96308).
- GUARDRAILS (G2): median survival ≥ 0.8× before-leg control;
  starvation deaths ≤ before + 2; no new death-cause mode ≥ 2.
  (produced/need is NOT gated here: this recorder does not capture food
  flows — that number came from the feveranat corpus flowSeries — and
  the lever touches spawn/duty/teaching, not food production. Starvation
  deaths are the food-economy outcome guardrail. Amendment at prereg
  time, before any after-leg runs.)
- PANEL (G3): §15 balanced panels before/after, compare attached; any
  regression_signal investigated, unexplained regression blocks GO.
- PROOF (G4): scripts/test-medheadcount-a.js green (all legs).
- SECONDARY (reported, not gated): wound_care / herbal_medicine lessons
  per run; triage holders who are not occupation-medics; medic joins by
  source (visitor invite / application / spawn); medic deaths; wall
  numbers (national / table / wins, wave reach, median survival).
- GO: G1 + G2 + G3 + G4 all pass. A miss is NO-GO, never re-scored.
- TIME-COMPRESSION: registration lost ~65 min to a container write
  flap. If the pilot GOes, bank it — NO confirm band in this run. If
  time runs short, land the DIAG + the named lever design as DIAG-GO
  with evidence + instruments + proof test and NO game-code change.

## Seed-band note

Seeds 96301–96308 are the deliberate reuse band (feveranat /
tendsick / medicdiag / medicduty). No new band is consumed. Per the
seed-band freshness rule, reuse is declared here, not hidden.

## Metric review (placeholder — filled at end of run)

- (to be filled)
