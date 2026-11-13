# Pre-registration — sim-namelessadm-b (finding #2309, NAMELESS ADMISSION LINE)

Arm: live-play verification of finding #2309 (sim-findings.md). When
`_vaAdmitPetitioners` (src/js/villageAgency.js:892) runs with zero housing
room, it still says "The fire makes room. — said aloud, so the village
learns the names." — with blank names, admitting nobody. Filed as a copy
wart to verify, not a defect claim: whether the moot can accept with room 0
in live play was unproven (the staged call bypassed the moot).

## Primary metric

Live-play reachability of a room-0 admission, decided with proof:
code trace of every gate upstream of `_vaAdmitPetitioners` (file:line for
each) PLUS a staged moot attempt driven honestly through
`conductPetitionMoot` → `answerPetition` (never `_vaAdmitPetitioners`
directly — that is the staged bypass being questioned).

## GO threshold

- Reachability decided with proof (code trace + staged moot attempt).
- If reachable in live play and a fix lands: after-leg blank-names line
  count is 0 AND the probe band's survival/wave numbers are byte-identical
  before/after the fix.
- If unreachable in live play: verdict ANSWERED (staged-call artifact),
  with proof, and NO fix is built.

## Horizon + why

150 days. Same band as voicejoins-b (the arm that filed the finding), so
the numbers compare directly. The fix, if any, is narration-only, so no
sim effect is expected — the after-leg exists to prove that, not to hunt
for one.

## Seeds

- Probe band: 190391–190398 (8 seeds, the voicejoins-b band).
- Staged moot drive: seeds searched from 1 upward until one yields a moot
  that accepts on the player's vote (votes are random; seed selection, not
  vote manipulation). The first accepting seed is the proof seed, named in
  the evidence file.

## Policies

Competent-player policy (scripts/policies/competent) for the probe band.
The staged moot drive uses no bot policy — it drives the moot by hand.

## Method

1. TRACE in code: `_vaAdmitPetitioners` callers, the moot accept path,
   every housing-room check upstream. Quote file:line for each gate.
2. DRIVE a real moot to accept at room 0 if reachable: stage a village
   with room 1 + a pending petition, hold the moot honestly, fill the
   last bed through a real game path (visitor invite / membership
   arrival), then vote accept honestly. If the moot cannot accept at
   room 0, prove that with the trace + a staged moot attempt that hits
   the gate.
3. JUDGE: reachable → narrow fix (the line must not claim room/names
   when nobody is admitted), proof test scripts/test-namelessadm-b.js
   (RED→GREEN), after-leg on identical seeds. Unreachable → ANSWERED,
   no fix.
4. Wall numbers every run: national / table / wins, wave 4–5 unlocks,
   median survival on the probe band.

## Metric review (filled at run end)

_To be filled in the evidence file._
