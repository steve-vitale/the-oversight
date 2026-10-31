# sim-reactorgate-a — PREREGISTRATION (binding; committed BEFORE any judged leg)

Run: oversight-flesh-out-loop, Loop A run fleshout-20261031T0643Z,
arm sim-reactorgate-a, axis food-economy, backlog #1582 class
(sim-tickbudget-b observation, 2026-10-30). Worktree
sim-reactorgate-a. DIAG ONLY: verdict + fix spec, NO game
change either way — a later build arm (or Steve) owns the
decision. No balanced-panel compare is claimed: zero
game-root changes, so there is no before/after game delta
for scripts/balance-panel.js to compare. Stated here, not
hidden.

## Question (from the brief, verbatim in substance)

On seed 15215's ON leg, at the day-13 evening bridge
decision, what exactly does the kcal gate read — kcal in
hand, reactor coverage, or something else — and is the
observed kcal-gating correct-as-wired?

## Substrate (confirmed from prior evidence, deviation stated)

Prior evidence (sim-lackingline-a, sim-tickbudget-b) pins
the strand-round substrate as: POLICY=nighttravel,
COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1, WOODCARRY=1, DAYS=30, seed bank incl.
15215. DEVIATION, stated up front: the reactor evening
(the day-13 plus-both evening where the Fusion Reactor
installs, per sim-tickbudget-b §5 / §"Out-of-scope") sits
on the ON-VARIANT leg (PRESSB=1, WOODWARM=1), not the ON
control leg (PRESSB=0, WOODWARM=1). The judged set
therefore runs BOTH warmth-live legs on seed 15215:

- leg ON (control): PRESSB=0, WOODWARM=1 — the brief's
  "ON leg" read literally; contrast trajectory.
- leg ON-variant: PRESSB=1, WOODWARM=1 — the leg
  carrying the observed reactor evening; primary leg
  for the day-13 verdict.

Guard legs (WOODWARM=0) are NOT run: the reactor evening
is warmth-live, and guard legs cannot carry it. Both
judged legs share every other substrate gate; the only
delta between them is PRESSB, exactly as in
sim-tickbudget-b. Horizon: DAYS=30 (death-aware: dead
villages stop; the 15215 bearer survives the window on
both prior legs, so the window is a ceiling, stated).

Pinned base: 3c03d468bbd6f752a35da27aaa535601538a1d15
(branch sim-reactorgate-a at prereg time). All legs run
on pinned-base game/policy code verbatim. Tracked-diff
guard at the end: src/ + scripts/policies/ diff vs the
pinned base must be EMPTY (new driver/analyzer/proof
files only, never edits to existing files).

## Primary metric (the judged record)

For the day-13 evening bridge decision on EACH judged
leg, the exact record:

- reactor state at the decision: scholar.fusionReactor
  (installed/online/sinceDay), fusionReactorOnline(),
  hasAbility('fusion_reactor'), state.fusionReactorHolder,
  and whether the day's lines contain the install line
  ("FUSION REACTOR: the pellet goes in").
- kcal in hand: cls.kcalLive AND cls.kcal from the
  classification record (both, never one alone).
- each gate input: woodPlayer, kcal (the gate's read),
  ticksToDayEnd, plus the bridge skip and the refusal
  line verbatim.
- day 14+ persistence: the same record for every still
  evening after day 13 on each leg while the reactor
  stands (does the gate keep reading hand kcal, and
  does the reactor stay installed/online?).

## GO threshold (judged EXACTLY as written in the brief)

GO iff the evidence contains a verdict with the exact
gate inputs at the day-13 bridge decision (reactor
state, kcal in hand, gate read) plus a reasoned ruling:
either "correct-as-wired (bridge cost is effort,
reactor covers metabolism, gate reads hand kcal
correctly)" with the code path cited, or "bug +
minimal fix spec" with the exact lines and the
corrected read. A verdict without exact gate inputs is
NO-GO. No other bar. A verdict that names the gate
read without the reactor state, or the reactor state
without the gate inputs, fails the bar as written.

## Instruments (new files only)

- Driver: scripts/reactorgate-trace-a.js — adapted from
  scripts/tickbudget-trace-b.js with ONLY these
  disclosed changes: (1) a reactor probe, pure reads at
  evening-row time (scholar.fusionReactor,
  fusionReactorOnline(), hasAbility('fusion_reactor'),
  state.fusionReactorHolder, scholar.kcal at row time);
  (2) a per-loop-day flag for the reactor install line
  in that day's say lines; (3) OUTDIR default to this
  arm's corpus dirs. Same stack
  (pressb(warmed(woodcarry(nighttravel)))), same env
  gates, same seed order, same write transport, same
  morning/evening recording otherwise. The probe draws
  no RNG, edits no state, passes ctx through untouched
  — so the trajectories are identical to the
  tickbudget legs (cross-checked: day-13 gate inputs
  must match sim-tickbudget-b / sim-lackingline-a
  numbers on the overlapping leg where the substrate
  matches, or the mismatch is disclosed, never hidden).
- Analyzer: scripts/analyze-reactorgate-a.js (pure
  reads): day-13 gate-input extraction, reactor-state
  table, day 14+ persistence table, narration verbatim
  capture, determinism comparison.
- Proof: scripts/test-reactorgate-a.js — gate-input
  capture unit cases, corpus completeness, narration ==
  lackingLine template, determinism, tracked-diff guard.
- Determinism: one judged leg re-run byte-identical.

## Canon

docs/CANON.md read. No canon doc covers the bridge /
reactor-gate interaction itself: docs/ABILITY-REFUSALS.md
covers ability-action refusals, not the woodcarry bridge
refusal; the reactor's own description (src/data/
abilities.json, fusion_reactor) says "the pellet covers
your metabolism" and its metabolic block is {daily: 0}.
The code read before any leg (game.js buildBridge,
woodcarry.js bridgeDecision, creekremedy-diag.js
classification) is part of the verdict's citation, not
a substitute for the replay: the replay must show what
the gate actually read on the live trajectory.

## Sense-test

SENSE-TESTING LAW applies: the day-13 transcript is read
end to end for meaning — what the villager did that day,
what the install line promises ("You will never be
hungry again"), and what the refusal line then says —
and the verdict judges whether those two sentences can
both be true for the same villager on the same evening.
