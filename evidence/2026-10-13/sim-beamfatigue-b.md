# sim-beamfatigue-b — gallowdeer beam-fatigue / tactic-switch (lever)

**Run:** 2026-10-13T21:32:00Z | **Axis:** combat-balance | **ARM 2 of 2**
**Worktree:** `~/workspace/worktrees/sim-beamfatigue-b`

## The blank

From `evidence/2026-10-13/sim-scale-wall-r15b.md` (arm A, killed at pilot): the r16
beam-dodge pilot produced an s11 stalemate — the gallowdeer re-declared Ocular
Discharge ~2,263 times over ~9,051 damage ticks with 2 landed. The fight ate the
calendar while the village died around the scholar (village-lost d83). A real
player doing this by hand hits the same loop: the deer has no response to a
non-closing dodger.

## Design decision

After **3 consecutive sterile Ocular Discharges**, the deer **HUNTS**.

A hunt is a *mode*, not a turn: every deer turn advances at full speed toward
the FIFO target and declares nothing, until:
- **Contact:** antler range (d≤1 at turn start) → mode ends, normal AI resumes
  (Antler Sweep is the only legal move there); or
- **Trail cold:** 10 hunt turns → beam resumes, streak restarts from zero.

**Sterility** is judged per completed beam in `tbBeamEndFiring`:
- no blood drawn (`m.beamDrewBlood`, set in `tbBeamSweepTick`),
- the target never closed distance during the beam,
- the target never changed (FIFO target key recorded at declare).

**Why HUNT (close), not bait/change-range/leave:**
- Steve's law: "monsters were sent to fight." Leaving or disengaging is not a
  tactic, it's abdication. The deer was sent to kill the scholar.
- The codex already prescribes the player's counter: "close in and break its
  aim — mind the antlers." The hunt is the deer *answering* the dodge with the
  exact thing the codex warns about.
- Antlers are permanent equipment (visual-mechanical coherence): the aggro form
  (head lowered, antlers first) justifies the melee that follows.
- Highbeam Deer stats untouched (160 HP benchmark not in question).

## Implementation

**`src/js/game.js`:**
- `beamFatigueOn()` gate (default ON; `BEAM_FATIGUE=0` disables for before/after).
- Declare-distance/target-key recording in `tbChooseMove` (skips cooldown re-picks).
- Sterility judgment in `tbBeamEndFiring` (sets `m.beamStreak`, `m.beamStreakMax`,
  `m.beamHuntArmed`); blood flag cleared per beam.

**`src/js/monsterBehaviors.js`:**
- New `beamFatigueHunt` pre-turn hook: trigger branch (3 sterile → hunt begins,
  narration), contact branch (d≤1 → melee resumes), trail-cold branch (10 turns
  → beam resumes), hunt-step branch (`tbStepToward` at full speed, declares nothing).

**`src/data/monsterBehaviors.json`:**
- Gallowdeer `preTurnHooks`: `["antlerThrash", "beamFatigueHunt"]`.

## Proof test (`scripts/test-beamfatigue-b.js`)

Rebuilt s11 camper: true-perpendicular arc-band dodge (brute-force maximize
angular separation from the beam), 35%-HP barrier-exit flee, runs when hunted.

**Lever ON (11 passed, 0 failed):**
- A: dodger duel resolves in 37 deer turns (not 200+). Hunt fired once.
  Max sterile streak reached 3 (the trigger). Declarations bounded (3).
- C2: stander takes blood → streak stays 0 (blood resets).
- C3: adjacent deer picks Antler Sweep (not beam); streak resets to 0.
- D: narration captured:
  - "The light dies in its eyes — embers, then nothing. It stops waiting for
    you to stand still. It lowers its head, antlers first, and COMES."
  - "It is ON you — antlers first. No more aiming. No more waiting."
  - Reads as a monster hunting, not an engine trick.

**Lever OFF (RED phase, 3 passed):**
- B: stalemate recurs — fight NOT resolved in 250 deer turns (cap hit).
  26 declarations, 25 completed beams, 0 hunts. Scholar unhurt (php=100)
  but the fight never ends. This is the r15b s11 loop.

## Pilot (`scripts/sweep-beamfatigue-b.js`)

8 seeds (11/22/33/44/55/66/77/88), 150d death-aware, identical-seed
before/after, competent policy.

**BEFORE (BEAM_FATIGUE=0):**
- 0/8 scholar deaths. Max gallowdeer-fight deer-turns: 10.
- Gallowdeer fights are rare under competent play (0-1 per 150d).

**AFTER (lever ON):**
- 0/8 scholar deaths. Max gallowdeer-fight deer-turns: 10.
- Identical.

**GO verdict:**
1. ✅ Stalemate never recurs: scripted duel goes 250 turns (OFF) → 37 turns (ON).
   No gallowdeer beam-fight reaches 200 deer turns with the lever on.
2. ✅ Wave-1 player death share no worse than baseline: 0/8 → 0/8.

**Lever PASSES pilot. Recommend landing.**

## Sense-test notes

The hunt narration was sense-tested (D): two lines, both read as the deer
making a decision ("It stops waiting for you to stand still"), not as a
mechanical state change. The "antlers first" image ties the tactic-switch to
the deer's permanent anatomy (visual-mechanical coherence).

The dodger's behavior during the hunt (run directly away, sidestep if pinned)
is honest: a scholar who has been dodging beams for 3 cycles and sees the deer
lower its head would run.

## Files

- `src/js/game.js` — gate, declare recording, sterility judgment
- `src/js/monsterBehaviors.js` — `beamFatigueHunt` hook
- `src/data/monsterBehaviors.json` — hook registration
- `scripts/test-beamfatigue-b.js` — proof test (ON: 11 pass; OFF: 3 pass RED)
- `scripts/sweep-beamfatigue-b.js` — 8-seed pilot
- `evidence/2026-10-13/sim-beamfatigue-b.md` — this file

## What I couldn't do

No gallowdeer-specific design doc exists in `docs/` (MONSTER-WAVES.md covers
waves generally; the deer's beam mechanics are code-only). The "3 sterile
beams" threshold is a judgment call (documented above), not canon. Steve can
overrule the number.

The 150d pilot generates few natural gallowdeer fights under competent play,
so the "no worse deaths" leg is a weak signal (0 vs 0). The strong signal is
the scripted duel (stalemate → resolution).
