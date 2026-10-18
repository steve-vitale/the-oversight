# sim-readinessfix — readiness bar recalibration (2026-10-18)

Axis: scale-onramp (the blocking axis). Steve's direct order: "fix readiness bar.
Go with your gut on all design calls. List them all with your decision. I will
correct any that need it."

## The problem (established, not re-argued)

sim-rebuildaudit (2026-10-18, landed 290debe8) pinned the wave-4 unlock collapse
(14/16 -> 0/16 on the named seeds [975-982]) to the 2026-10-16 dc4-readiness
design call — NOT the history rebuild. The exact diff: `standing.js`
`waveUnlockReady(4)` — the faced-experience bar (3 distinct w3 types faced,
fleeing counted) was replaced by the combat-readiness bar (4 armored P>=15,
5 armed, 3 tricks, 2 living veterans).

The 2026-10-16 demands were explicitly "sim starting points, not canon; Steve
can overrule" (designcalls/04-readiness.md). The evidence now overrules them:

- **Veterans bind 98.5-100% of deferral days** on all three substrates
  (defercensus2b/3). Median village maxes at 1 living wave-3 killer vs demand 2
  (range 0..2). 7 of 8 observed unlocks released cleanly the day veterans went
  1->2 — the second veteran is the hump.
- **Armor co-binds ~60%** (down from 90.5%). Median 2 @ P>=15 on courtship vs
  demand 4. Armor is mortality-selected: 34/47 armored villagers died in the
  draft they unlocked (sim-armorbreak).
- Weapons/tricks structurally non-binding (tricks satisfied 5-8x over).
- Four consecutive veteran-lever misses at the wave-4 gate (vetdemand,
  armorbreak's mortality finding, vetsurvive, compvet).

## Design calls (mine — Steve corrects what needs it)

1. **Keep the combat-readiness shape; do NOT revert to faced-experience.**
   Steve's intent stands: fleeing your way into wave 4 is wrong (his 2026-10-10
   reversal said engagements don't unlock waves), and the bread road (5 feasts
   -> standing 100) must not open a war draft. The fix is recalibration of the
   numbers, not repeal of the call.
2. **Wave-4 veterans: 2 -> 1.** One living wave-3 killer = "someone in this
   village has done this and lived." The single structural bind; the median
   village already sits at 1. Two demands a veteran-production pipeline the
   game demonstrably cannot sustain (four dead levers).
3. **Wave-4 armor: 4 @ P>=15 -> 3 @ P>=10.** P=10 is the design doc's own
   "medium" tier anchor (medium >=10, heavy >=25). Three fighters in real
   armor is a meaningful capability signal without demanding a forge economy
   the game can't produce — and armor is mortality-selected anyway (it helps,
   it doesn't save).
4. **Wave-4 armed: 5 -> 5 (unchanged).** Non-binding; already the achievable
   bar. Left alone.
5. **Wave-4 tricks: 3 -> 3 (unchanged).** Satisfied 5-8x over; it's the
   learning signal, working as intended.
6. **Wave 5: {6@P20, 7, 4, 3} -> {4@P15, 6, 3, 2}.** Same philosophy, one step
   up. Wave 5 stays genuinely hard (2 living wave-4 killers is a real demand)
   but not impossible.
7. **Veterans stay living-only.** A dead veteran is memory, not capability.
   VETSHAPE stays default-OFF. (Steve's death-hits-hard rule: the bar must
   measure fighters who can actually walk through the door.)
8. **No faced-experience alternate path.** An OR-condition would reintroduce
   the flee-to-unlock exploit the original call deliberately killed.
9. **Hold beats / standing line: no copy changes.** They read demands
   dynamically ("X of Y"), so the fiction updates itself. The demand table in
   docs/MONSTER-WAVES.md is updated to the new numbers.
10. **Peak ratchet, plenty cap, waves 1-3 ungated: untouched.**

## The change

`src/js/standing.js` `standingCfg().readyDemand`:
- 4: { armored: 4, armorP: 15, armed: 5, tricks: 3, veterans: 2 }
  -> { armored: 3, armorP: 10, armed: 5, tricks: 3, veterans: 1 }
- 5: { armored: 6, armorP: 20, armed: 7, tricks: 4, veterans: 3 }
  -> { armored: 4, armorP: 15, armed: 6, tricks: 3, veterans: 2 }

`docs/MONSTER-WAVES.md` demand table + hold-beat example updated to match.
`evidence/2026-10-16/designcalls/04-readiness.md` left untouched (historical
record of the original call).

## Measurement

Instrument: the rebuildaudit sweep (scripts/test-rebuildaudit-sweep.js) on the
named seeds [975-982] x {leadfeast, belongfeast} (16 runs), 180d death-aware,
exact round-1 env — the same instrument that measured the collapse.

BEFORE (established by sim-rebuildaudit anchor (b), 26b3b226, pre-rebuild tip):
0/16 wave-4.

AFTER (this run, recalibrated demands): **13/16 wave-4** on the identical
instrument. The 3 non-unlockers: s975/belongfeast died at d140 (wave 3);
s976/belongfeast and s981/leadfeast survived to d180 WITHOUT unlocking —
the bar still bites. It is not a free pass.

The rate (13/16) is close to the pre-dc4 14/16, but the composition is
different: the old bar measured exposure (fleeing counted); the new bar
measures capability (3 armored + 5 armed + 3 tricks + 1 living wave-3 killer).
The bread-road discriminator still works (test-readiness-20261016.js: 29/29
PASS — a feast-standing village that fled wave-3 is still DEFERRED, "not
fled-through"). Combat-invested villages earn the draft; non-combat villages
don't. That is the bar working as Steve intended.

## Metric review

No pre-registered §14 metrics for this run — this is a direct Steve-ordered
design fix, not a loop sim. The honest success criterion was the before/after
clear rate on the named seeds plus the bread-road discriminator:

- Clear rate: 0/16 -> 13/16 on combat-invested policies. The bar is clearable
  by real villages again.
- Discriminator: the feast-standing flee-through village is STILL held
  (test-readiness-20261016.js 29/29). The exploit the original call closed
  stays closed.
- The bar still bites: 2/16 survived to d180 without unlocking.

Residual risk (honest): the sweep used combat-invested policies (tribfloor).
A bread-road policy sweep would further confirm the discriminator at scale —
named next for the loops, not blocking this fix.
