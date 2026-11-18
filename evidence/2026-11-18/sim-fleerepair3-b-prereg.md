# Pre-registration — sim-fleerepair3-b (Loop B run fleshout-loop-b-20261118T1030Z, axis: winnability chain)

Committed BEFORE any judged sweep. Judge strictly against this file; a miss
is NO-GO, never re-scored against a friendlier metric mid-run. Metric doubts
go under "metric review" in the evidence file, for the NEXT run.

## Canon (read first)

- docs/CANON.md: no canon doc covers TB flee or field-fight flee (same
  finding as the fleerepair2-b prereg).
- src/data/monsters.json, suburb entry: weaknesses "you can't kill it —
  LEAVE. Navigation is victory; the fight is a timer" and slain text
  "You don't kill a suburb; you ESCAPE it — the win condition is
  leaving, the fight is a timer."
- docs/MONSTER-WAVES.md (Wave 4): "The Suburb (comfort as a trap —
  you don't kill it, you ESCAPE it)".
- src/js/fieldFights.js villagerTrickAction: `mid === 'suburb' &&
  fctx.round === 1` returns `{type:'leave', why:'suburb-leave'}` when
  the village knows the trick; the trick branch sets
  `rec.outcome='vFlee'; rec.fleeWise=true` with the line "you can't
  kill a suburb. They walk out. (Navigation is victory.)"
- The 'leave' itself is CORRECT counterplay per canon. This arm does NOT
  change the counter, the trigger, monster stats, gates, prices, or deeds.
  It changes only what happens AFTER the leave is performed: the fight
  must actually end.

## Diagnosis — which mechanism fires in the 6 meetings (finding #2500)

The mechanism is the **leave-counter** — NOT fear/morale, NOT the
outmatched rule, NOT an evade, NOT the tbfinish/TB path:

| Candidate | Ruled out because |
|---|---|
| Evade (pre-fight awareness) | All 6 rows are rounds 1 with a fight record (outcome vFlee/vDie, fleeWise); evades are rounds 0, correctly null |
| Morale / situational flee | Morale reads at round >= 2 (fieldFights.js); all 6 are round 1 |
| Outmatched rule | No outmatched flee exists in fieldFight; the outmatched concept gates ability use (foodPower.js, game.js TB path) and pre-fight help (villager-agency.js:641) — neither fires here |
| Fear | No fear-driven flee in field fights; the only fear line is the Stare Down ability text |
| tbfinish / TB flee | The 6 rows are field fights (origin world-tick, fieldFight records); the TB path is the player's grid fight, a different engine |
| Leave-counter (suburb-leave) | **FIRES in all 6**: `trickBefore: true`, rounds 1, mDealt 0, `fleeWise: true`, log line "reads the sterile streets — you can't kill a suburb. They walk out." |

Corpus proof (held tree, read-only:
`~/workspace/worktrees/sim-partysize-b/evidence/2026-11-17/perseed-partysize-allycap-b-ctl/partysize-b-s103602-partysize-b-arm.json`,
seed 103602, days 90–93 — the #2500 instance; trio launched day 90 by
app_mgpspjz6533 with ruby_callaghan + james_okonkwo, target suburb):

- 6 meetings, ALL with the leave line FIRST in the log and a monster hit
  line AFTER it: d90 Miles (26 taken), d90 Ruby (12), d91 Miles (22,
  **vDie**), d92 Ruby (9), d93 Ruby (9), d93 Ruby (10). Monster HP
  unmoved at 581 throughout. Total parting damage 88 across the six.
- CORRECTION to the fleerepair2-b prereg's reading of the day-91 death:
  it said "the monster acted first and killed a wounded re-meeter
  before the round-1 leave could fire". The row's log order is the
  opposite: the leave line is first, then "Property Tax hits Miles
  for 22 (0 left)". Miles won initiative, walked out, and was hit
  anyway. The monster-first-kill shape DOES exist (staged below, seed
  10), but the corpus death is a parting hit, not one.

## The defect (in the fight, not upstream)

The 'leave' trick branch (fieldFights.js, ~line 2051) sets
`rec.outcome = 'vFlee'` and logs the exit — but does NOT `break` out of
the phase loop (`for (var ai = 0; ai < 2; ai++)`, monster and villager
phases in initiative order). The loop condition checks `!rec.outcome`
only at the TOP of the next round, and the monster phase has no
`rec.outcome` guard, so when the villager wins initiative and leaves,
the monster's phase still runs in the same round and lands a hit on a
villager who has already walked out. The sibling exits that end a fight
immediately — offer_food (mFlee) and poison (mFlee) — both `break`;
the leave is the inconsistent one. A villager doing the correct counter
can die on the way out: "Navigation is victory" narrates an exit the
engine does not honor.

Staged proof on the CURRENT tip (scratch /tmp/diag-fleerepair3.js,
flag OFF, 12 seeds × 4 healthy + 1 wounded villager, suburb trick
known — diagnostic, not a judged sim):

- 55 wise leaves; 52 leave-first (villager won initiative), 3
  monster-first.
- **52/52 leave-first wise leaves took a parting hit** (vTaken 9–54,
  total 1372). The parting hit is not occasional — it fires every time
  the villager wins initiative and leaves.
- 4 wise-leave deaths (vDie with fleeWise, leave-first) among the
  wounded cases (seeds 2, 3, 11, 12) — villagers who did the correct
  thing and died walking out.
- 3 monster-first cases: the hit lands BEFORE the leave line — a
  legitimate hit, preserved by the fix.
- 1 monster-first kill (seed 10, 20 HP): vDie with fleeWise false, the
  leave never fired — the shape the fleerepair2 prereg described;
  the fix does not and cannot change it.

## The arm (game-code, env-gated, ONE fix)

src/js/fieldFights.js, the 'leave' trick branch only, gated by a new
flag FLEEREPAIR3=1 (default OFF — same inline
`typeof process !== 'undefined' && process.env...` pattern as the
FIGHTOPEN check in the same file; `process` is undefined in the
browser, so the lever is off there):

- After the leave log line, `if (fleerepair3On()) break;` — the fight
  ends here, the monster phase never runs, no parting hit. Exactly the
  offer_food/poison shape.
- Preserved by construction: monster-first rounds (the hit already
  landed before the leave); the learning path (trick unknown → the
  villager fights 3–4 rounds and flees wounded); every other trick
  exit (redactor starve-out, focus bore-out, terms loophole — same
  missing-break class, different arm territory, noted in findings);
  monster stats, launch gates, plan seeding (FLEEREPAIR2's territory,
  untouched).

Env-gate justification: the fix changes fight outcomes game-wide
(villagers stop taking a free hit on a correct exit), and the
field-fight levers are env-gated by precedent (FIGHTOPEN, FLEEREPAIR2).
The flag also supplies the clean before/after contrast on identical
seeds. If this arm GOes, flipping the default is a coordinator/Steve
landing call, never made here.

## Pre-registered metrics

- PRIMARY B1: **parting hits on round-1 wise-leave meetings** — a
  meeting counts iff mid is 'suburb', fleeWise, rounds == 1, the leave
  line precedes the first monster-hit line in the row log (or no hit
  line exists), AND vTaken > 0. GO iff the armed leg has **0** parting
  hits. Reported alongside: leave-first meeting count, mean vTaken on
  leave-first meetings, wise-leave deaths (fleeWise && outcome vDie)
  per leg, launched suburb meetings (continuity with fleerepair2).
  **Calibration gate (frozen): the control leg must show >= 1 parting
  hit; if 0, B1 is UNJUDGEABLE (not a GO)** — the fleerepair2 panel
  lesson, applied here.
- B2 (no-kill-loss): wave-4 kills (meetings outcome vKill, wave 4)
  armed >= control.
- B3 (guardrail, as fleerepair2 B3): expedition deaths armed <= control
  x 1.10 AND total deaths armed <= control x 1.10.
- B4: proof green — scripts/test-fleerepair3-b.js on the final tip.
- B5: balanced panel (§15) — scripts/balance-panel.js compare on the
  panel corpora, .md attached to the evidence file; no uninvestigated
  regression.
- Instrument: 8/8 files both legs, 0 instrument errors, missingHp 0
  on fought non-kill rows (recMismatch diagnostic only, as
  fleerepair2), seed sets match.

**Verdict: GO iff B1 && B2 && B3 && B4 && instrument clean && B5 no
uninvestigated regression. UNJUDGEABLE iff the calibration gate fails.
A miss on ANY bar is NO-GO. No re-scoring.**

NOTE on the brief's suggested primary (launched-meeting mean damage
share): the diagnosis shows it is the WRONG metric for this fix — the
leave correctly deals 0 damage, so the share is 0 on both legs by
design; the fix changes damage TAKEN, not dealt. Launched mean share
is reported for continuity and never judged. The parting-hit count is
the honest primary: it is the only number the fix can move.

## Design (seeds, policy, horizon, instruments)

- Band: 103601–103608 (8 seeds, frozen per the brief — the shared band).
  This band IS the pilot; confirm (12–16 seeds) only on a pilot GO.
- Horizon: 150d death-aware. Policy: competent verbatim
  (scripts/policies/competent.js).
- Substrate (both legs): VETREENGAGE=1 PARTYSIZE4=1. FLEEREPAIR2
  unset BOTH legs (clean single-lever contrast for FLEEREPAIR3; the
  seed gate is a separate landed lever with its own verdict — with it
  on, suburb hunts would never launch and the launched subset would
  vanish). FIGHTALLY2 unset both legs. Armed leg adds FLEEREPAIR3=1.
- Instruments (new files, distinct names — never modify shared
  analyzers): scripts/fleerepair3-driver-b.js (fleerepair2 driver
  copy: same recorder — rows already carry log + vTaken + fleeWise;
  MODE/env validation for this contrast),
  scripts/analyze-fleerepair3-b.js (fleerepair2 analyzer copy + the
  parting-hit classifier reading row logs; judgeB1 with the frozen
  calibration gate; drift check when no leave fires on either leg),
  scripts/build-fleerepair3-b-panels.js (panel builder copy). Proof:
  scripts/test-fleerepair3-b.js.
- Reproduction (unit-level, in the proof test): staged suburb fight
  with a trick-knowing villager — flag OFF: leave-first + vTaken > 0
  (parting hit present); flag ON, SAME seed/villager: outcome still
  vFlee, fleeWise, rounds 1, mDealt 0, vTaken 0 (no parting hit);
  monster-first staged fight: vTaken > 0 on BOTH legs (hit before
  the leave preserved); trick-unknown villager: fights multi-round,
  deals damage, flag changes nothing; non-suburb wave-4 fight
  (strike): flag changes nothing; analyzer on synthetic legs:
  parting-hit counting + judgeB1 (pass at 0 armed with ctl >= 1,
  UNJUDGEABLE at ctl 0, fail at armed >= 1).
- BALANCED PANEL (§15): before/after through scripts/balance-panel.js
  compare on the panel corpora; the compare .md is attached to the
  evidence file.
- PILOT GATE: 8 seeds (this band) before ANY confirm spend.

## Sense-test (pre-registered)

Read the 'leave' lines and vetSays in both legs. Judge meaning: on the
armed leg a wise leave must read as a person walking out of a street
unharmed — the leave line with NO monster hit after it. A fixed run
whose leave lines still show a hit afterwards is a sense NO-GO even if
the numbers pass. Before the trick is known, the same villagers must
still stand and fight the Suburb for rounds and flee wounded (the
learning path), unchanged.

## Wall numbers (both legs, reported not judged)

Wins, national reached, table reached, wave-4 faced/kills, wave-5
faced, median survival — from the analysis JSON.
