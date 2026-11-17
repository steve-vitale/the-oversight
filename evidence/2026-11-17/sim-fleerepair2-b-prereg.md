# Pre-registration — sim-fleerepair2-b (Loop B run fleshout-loop-b-20261117T1643Z, axis: winnability chain)

Committed BEFORE any judged sweep. Judge strictly against this file; a miss
is NO-GO, never re-scored against a friendlier metric mid-run. Metric doubts
go under "metric review" in the evidence file, for the NEXT run.

## Canon (read first)

- docs/CANON.md: no canon doc covers TB flee or field-fight flee (grep
  flee/barrier returns nothing — same finding as the fleerepair-a prereg).
  What covers this arm instead, in code + data:
  - src/data/monsters.json, suburb entry: weaknesses "you can't kill it —
    LEAVE. Navigation is victory; the fight is a timer" and slain text
    "You don't kill a suburb; you ESCAPE it — the win condition is
    leaving, the fight is a timer."
  - src/js/fieldFights.js villagerTrickAction: `mid === 'suburb' &&
    fctx.round === 1` returns `{type:'leave', why:'suburb-leave'}` when
    the village knows the trick; the trick branch sets
    `rec.outcome='vFlee'; rec.fleeWise=true` with the line "you can't
    kill a suburb. They walk out. (Navigation is victory.)"
  - docs/MONSTER-WAVES.md: fleeing counts as "faced" for the retired
    exposure bar; the live readiness bars require kills, not faces.
- The 'leave' itself is CORRECT counterplay per canon. This arm does NOT
  touch it, does NOT touch monster stats, does NOT touch gates/prices/deeds.

## Diagnosis — #2500 is NOT the already-fixed path (verified, not assumed)

The prior flee-repair (Loop A, commit c283f801c, pilot GO + confirm GO,
adoption MOOT 90f5d8298) fixed the PLAYER (scholar) TB flee in
scripts/policies/competent.js fight()/flee(): directional walk-failure
fallthrough, consumed-push unfleeable, stuck resolution. Policy-side,
default-OFF (COMPETENT_FLEE_REPAIR). #2500 is a different path on every
axis:

| | Prior repair | #2500 |
|---|---|---|
| Actor | scholar (competent bot policy) | NPC villagers |
| Engine | turn-based fight (TB) | FIELD fight (fieldFight) |
| Entry | policy flee() | resolveWildMonsterEncounter <- villagerMonsterTick (origin world-tick) |
| Mechanism | flee() fallthrough after failed moves | trick 'leave' on round 1 when the counter is known |

Mechanism (code-read, this tree): a launched party stands on the
monster's tile; villagerMonsterTick rolls the encounter (50%/tick);
fieldFight opens; the village knows the Suburb trick
(state.villagerTricks['suburb'], learned via two trick observations);
villagerTrickAction returns 'leave' on round 1; the fight ends
vFlee / fleeWise, rounds 1, mDealt 0, monster HP unmoved. A plain
strike cannot miss in the field model (lroll([4+wb, 8+wb]), no hit
roll), so 0 damage in round 1 PROVES the round-1 action was the
trick, not a strike.

Corpus proof (held tree, read-only:
evidence/2026-11-17/partysize-allycap-b-analysis.json, ctl leg,
seed 103602 — the #2500 instance):

- Day 89: dmitri_sokolov + app_mgpspjz6533 flee The Suburb (world-tick)
  -> v4seeds rows target 'suburb', stageAfter 'party'
  (winPlanSeedFromFight, path world-tick).
- Day 90: app_mgpspjz6533 LAUNCHES a trio (ruby_callaghan,
  james_okonkwo; partySize 3, stage 'hunt', target 'suburb').
- Days 90-93: 6 launched meetings vs The Suburb (mHpStart 581 every
  time): rounds 1, mDealt 0, outcomes vFlee x5 + vDie x1. Launched
  mean share on that leg 0.0185 (n=9); these six are exactly 0.
- Day 91 vDie (same villager, rounds 1, 0 dealt): the monster acted
  first and killed a wounded re-meeter before the round-1 leave could
  fire. Secondary consequence, not the primary metric; the
  reproduction driver records entry HP / initiative only as a
  diagnostic (see "Reproduction" below).

## The defect (upstream of the fight)

winPlanSeedFromFight (src/js/win-plan.js) seeds a kill-hunt plan with
`plan.target = mdef.id` for ANY wave>=3 monster on 'fled' / 'evaded' /
'avoided' — all four call sites funnel through it (game.js
resolveWildMonsterEncounter, villager-agency.js expeditionMonster x2,
win-plan.js winPlanFightGate) and none checks killability. A hunt
plan against a leave-counter species can never advance: the launched
party meets it, correctly leaves in round 1, and re-meets it daily
(post-flee rest only fires at <=25% HP, and a wise leave takes no
wounds — so nothing stops the next day's meeting). The launch is
wasted and the re-meetings can kill (day-91 vDie). The fix belongs at
the seed, not in the fight: never seed (or retarget) a kill-hunt plan
onto a leave-counter species.

Scope note: the Suburb is the ONLY species whose counter is 'leave'
(checked all 72 monsters.json entries for a leave counter; focus_group
"lose interest and LEAVE" is the MONSTER leaving, a different shape).
The Suburb carries no `counter` field in monsters.json — the
leave-counter fact lives in the hardcoded `mid === 'suburb'` branch
in fieldFights.js — so the gate hardcodes the same id with a citation,
matching the codebase's existing convention. Out of scope, noted for
the findings backlog: the winPlanFightGate SEEK clause walks a
standing-stage party into ANY wave-3+ beast (including a suburb) once
the trick is known; the cousin evade shape (2/3 size-4 launched
meetings never engaged — pre-fight awareness evades, rounds 0) is a
different mechanism; finding #2292 (arena party member flees before
turn 1) is TB/arena, not this field path, and this fix does not cover
it.

## The arm (game-code, env-gated)

src/js/win-plan.js, winPlanSeedFromFight, gated by a new flag
FLEEREPAIR2=1 (default OFF — same helper pattern as vetreengageOn /
planfixOn in the same file; `process` undefined in the browser, so
the lever is off there):

- If mdef.id is a leave-counter species (suburb), return null WITHOUT
  creating or retargeting any plan. The existing plan, if any, is left
  untouched (mid-expedition safety: a plan seeded pre-fix keeps its
  launch; stated limitation, not silently fixed).
- Gate placement: after the wave>=3 check, before any plan creation /
  target assignment, so all four call sites are covered by the one
  choke point.
- No other code change. No default flip. The 'leave' trick, the TB
  flee repair, monster stats, and launch gates are untouched.

Env-gate justification (per the brief): the fix changes launch
behavior game-wide (fewer suburb hunts), and the win-plan levers are
env-gated by precedent (VETREENGAGE, PLANFIX, FIGHTALLY2,
PARTYSIZE4). The flag also supplies the clean before/after contrast
on identical seeds. If this arm GOes, flipping the default is a
coordinator/Steve landing call, never made here.

## Pre-registered metrics

- PRIMARY B1: launched meetings vs a leave-counter species (suburb)
  per 8-seed panel — COUNT. GO iff 0 on the armed leg. A launched
  meeting is the analyzer's join (encounter day within launch day
  +21, mid == launch target, vid in launch party).
- B2 (no-kill-loss): wave-4 kills (meetings outcome vKill, wave 4)
  armed >= control. Suburb kills are impossible (1300-1500 HP vs
  ~15-round field cap), so the lever must not cost kills anywhere.
- B3 (guardrail, as partysize B3): expedition deaths armed <= control
  x 1.10 AND total deaths armed <= control x 1.10.
- B4: proof green — scripts/test-fleerepair2-b.js on the final tip.
- B5: balanced panel (§15) — scripts/balance-panel.js compare on the
  panel corpora, .md attached to the evidence file; no uninvestigated
  regression.
- Instrument: 8/8 files both legs, 0 instrument errors, missingHp 0
  on fought non-kill rows (recMismatch diagnostic only, as partysize).

**Verdict: GO iff B1 && B2 && B3 && B4 && instrument clean && B5 no
uninvestigated regression.** A miss on ANY leg is NO-GO. No re-scoring.

## Calibration gates (run FIRST, as the baseline legs)

- DIAGNOSIS gate (frozen band 103601-103608, ctl env only): the
  baseline rerun must reproduce the defect — >=1 suburb-hunt launch
  AND >=1 launched suburb meeting with rounds 1 / mDealt 0 / vFlee
  on the band. If 0, the gate FAILS: investigate drift (env mismatch?
  rebase drift — the partysize evidence already records rebase drift
  on this band) and re-baseline; do NOT cite the held corpus as the
  baseline for the panel.
- PANEL calibration: the fresh-band ctl leg must show >=1 suburb-hunt
  launch; if 0, B1 is UNJUDGEABLE (not a GO) and the run reports that.

## Design (seeds, policy, horizon, instruments)

- Diagnosis band: 103601-103608 (8 seeds, frozen per the brief — the
  partysize band, reused for diagnosis ONLY, never as the panel).
- Panel band: 104001-104008 (8 seeds, FRESH — verified 2026-11-17:
  no prereg in evidence/*/sim-*-prereg.md or
  evidence/*/sim-*-prereg-addendum.md names 104001-104008; bands
  named elsewhere include 103601-103608, 103801-103812, 102001-102008,
  99101-99108, 99601-99612, 103101, 103411, 103418).
- Horizon: 150d death-aware. Policy: competent verbatim
  (scripts/policies/competent.js).
- Substrate (both legs, reproduces the allycap ctl leg exactly):
  VETREENGAGE=1 PARTYSIZE4=1. FIGHTALLY2 unset both legs
  (single-lever contrast). Armed leg adds FLEEREPAIR2=1.
- Instruments (new files, distinct names — never modify shared
  analyzers): scripts/fleerepair2-driver-b.js (partysize driver copy:
  same recorder; MODE/env validation for this contrast; encounter
  rows add fleeWise/fleeLearn from the fight record),
  scripts/analyze-fleerepair2-b.js (partysize analyzer copy: same
  launch join; meetings carry fleeWise; aggregates for suburb seeds,
  suburb launches, launched suburb meetings, round-1 zero-damage
  wise leaves; wall numbers), scripts/build-fleerepair2-b-panels.js
  (panel builder copy). Proof: scripts/test-fleerepair2-b.js.
- Reproduction (unit-level, in the proof test): fieldFight with a
  villager who knows the suburb trick vs a suburb instance ->
  vFlee, fleeWise, rounds 1, mDealt 0; winPlanSeedFromFight with a
  suburb def + FLEEREPAIR2=1 -> null, no plan created; same call
  flag-off -> plan seeded with target 'suburb'; a non-leave wave-4
  def (strike) seeds normally with the flag on.
- BALANCED PANEL (§15): before/after through scripts/balance-panel.js
  compare on the panel corpora; the compare .md is attached to the
  evidence file.
- PILOT GATE: 8 seeds (the diagnosis band) before ANY panel spend.
  The panel IS the confirm (8 fresh seeds, both legs).

## Sense-test (pre-registered)

Read the 'leave' lines and vetSays in both legs. Judge meaning: a
wise leave must read as a person walking away from a street that
cannot be killed, not a robot skipping a turn; a fixed run must read
as parties simply never being sent at the unkillable one. A repaired
run whose parties still march at suburbs is a sense NO-GO even if
the numbers pass.

## Wall numbers (both legs, reported not judged)

Wins, national reached, table reached, wave-4 faced/kills, wave-5
faced, median survival — from the analysis JSON.
