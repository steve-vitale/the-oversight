# sim-strandfix-morning-b — PREREG ADDENDUM (written after the pilot, BEFORE any confirm leg)

Pilot leg (first 8 bank seeds, ON-variant, STRANDFIX=1,
WOODWARM=1, corpus sim-strandfix-morning-b-corpus-pilot-on-variant):
8/8 files present, errs 0, strand seed 15215 present with
strand mornings recorded, strandfix gate reached (8 attempts
on 15215) — PILOT SNIFF TEST PASSES on instrument-function
grounds. No confirm leg has run at the time of this addendum.

## Pilot discovery: the tool gate (fourth gate, unanticipated)

The pilot variant strand runs 7–17 (11 still evenings on the
pilot leg alone; the control comparison is a confirm-leg
judgment, not a pilot claim). On strand mornings 10, 11, 13,
14, 15 the policy's cutTree verbs change no wood (3->3,
2->2, 2->2, 2->2, 1->1) and stop at 'verb-nochange'. The
day lines themselves name the cause, verbatim from the
engine: "Your Stone knife can't fell a giant — it takes
branches, not trunks. You need an axe." The villager's
best woodcutting tool on those mornings is a Stone knife
(whittle tier); felling needs axe tier (fell tier 4), and
pruning needs saw/axe tier (prune tier 3) — neither is
available to this villager on those mornings. Clearing
brush cannot substitute: the wake tile holds 0 bushes
(fullBush 0 on every strand morning). PruneBranches and
gatherFallen yield branch MATERIAL, not pack wood, so they
cannot fill the bridge pack either. On this tile, for this
villager, NO engine verb yields pack wood until an axe-tier
tool arrives — and one does arrive by day 17, when a single
fell yields +5 wood (0->5, pack-ready) with no bearer death
in between (player deaths [] on the pilot leg) and no
recorded acquisition event in this corpus: the mechanism by
which the axe arrives is UNRECORDED here and is stated as a
limitation, not guessed. Day 17 still ends still, on ticks
alone (ticks-only) — even with food and wood solved, time
binds that evening.

## What changes, and what does NOT change

- FROZEN (unchanged by this addendum): the policy file
  (scripts/policies/strandfix-morning-diag.js), the driver,
  the substrate env, the strand definitions, the GO bars
  (a) and (b), the det-gate, and the determinism rule. The
  policy is NOT edited to probe tool tier, to prune, or to
  gather — the pilot behavior stands exactly as run, and
  the confirm legs will run it verbatim. A policy edit now
  would void the pilot as a test of the pre-registered
  behavior.
- ANALYSIS ONLY (this addendum's sole change): the
  analyzer gains a pure-read tool-gate derivation —
  toolGateFromLines(dayLines) — which classifies a
  wood-unchanged cutTree verb as a TOOL refusal when the
  day's own already-recorded say lines carry the engine's
  axe hint. No new probe, no new leg, no behavior change.
  The evidence will report, per attempt: woodDelta,
  stopReason, and toolGate (true/false), so the tool gate
  is counted, not narrated. The proof suite gains one pure
  unit test for toolGateFromLines.
- The GO bars are judged exactly as written in the prereg.
  If the tool gate holds on the confirm legs, the expected
  outcome is NO-GO on bar (a) and/or (b) with the tool gate
  named as the binding reason — that is a measurement
  result, not a reason to move the bars. The design
  question that travels to the coordinator / Steve is
  therefore sharpened before the confirm spend: morning
  wood-seek needs an axe in hand (or a bush on the tile)
  before kcal or ticks matter at all — a fourth gate the
  priced strand (food, wood, ticks) did not name.
