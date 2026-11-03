# TB-HOLD: player decisions inside turn-based wave-4 fights — prereg (Loop A, run fleshout-20261103T1945Z, arm sim-tbpolicy-a)

Committed BEFORE any judged variant leg. Policy-side arm ONLY:
zero src/js changes (scripts/policies + scripts + evidence only).
No gate/price/readyDemand change, no field-fight change, no
ally-join change, no gear change.

## Grounding (read, not assumed)

- `docs/CANON.md` + `docs/MONSTER-WAVES.md` (readiness section:
  wave-4 monsters damage 35–95, HP 850–1500, pierce 0.2–0.5;
  veterans = living roster with a wave-(w-1)+ kill; wave 5 needs
  2 wave-4+ veterans) + `docs/BALANCING.md` (numbers).
- `evidence/2026-11-03/sim-w4convert-a.md` + its prereg: the
  prior anchor's split (23 TB starts, 2 kills, TB 2/23).
- `scripts/policies/competent.js` `fight()` read in full (this
  arm's step 1): inside a TB fight the competent bot decides,
  in order — (a) start-of-fight walk-away when outmatched
  (totalMhp > 2.5*pmax, or wave>=2 with HP<70%, or HP<50%);
  (b) mid-fight eject at HP<35% (12% for a committed hunt);
  (c) combat-ability press (gap-audit leg 1 cascade);
  (d) beast trick for KNOWN counters only; (e) strike weakest
  (closing distance first). Flee = walk to the nearest x-edge
  and, in the DEFAULT env, never push through the barrier: the
  push branch is gated on COMPETENT_DPS_RACE (off by default).

## Baseline leg (measured, this worktree HEAD — NOT the w4convert anchor)

Policy `scripts/policies/competent.js` VERBATIM (decision-neutral
counting wrappers only: fight-turn counts, barrier-push counts,
ctx-counter deltas; no decision changed, no RNG consumed).
Seeds 99101–99108, 140d death-aware, default env, driver
`scripts/tbpolicy-driver-20261103.js` (RUN=tbpolicy-base,
reproduced exactly by RUN=tbpolicy-base2: same days/endReason/
kills on all 8 seeds, proving the instrument trajectory-neutral).

ANCHOR DIVERGENCE, stated plainly: this worktree HEAD sits on
77ff4a807 PLUS three gap-audit commits (leg 1: competent presses
combat buttons; leg 7: equipment/weapon-profile paths; plus
game.js lines) — so this baseline does NOT reproduce w4convert's
band (35 spawns / 23 TB / 5 field / 2 kills / 8 lost / median
90d). Seeds 99107 and 99108 still MATCH w4convert exactly, which
proves the driver/instrument neutral; the other six diverge
because the game/policy moved, not because of this arm's
instrument. All comparisons in this arm are therefore
WITHIN-WORKTREE (baseline vs variant, same HEAD, identical
seeds) — the w4convert numbers are a prior-anchor reference,
never this arm's baseline. No anchor-file-swap control was run:
the MATCH seeds plus the anchor diff establish the cause, and
swapping game files mid-run risked worktree cleanliness for no
decision-relevant gain.

Baseline pooled (8 seeds, TB fights only unless noted):
- TB started 26 (spawns 55, field fights 22, total exposures 48)
- TB kills 7, killing exposures 7 → kills per TB exposure 0.2692
- Median % of wave-4 monster HP dealt per TB fight: 23.8
- Median player turns per TB fight: 7
- Flee share (tbEnd 'fled' / TB started): 0.000 (0 fled outcomes)
- Barrier pushes in wave-4 TB fights: 0
- Villages lost 7/8, survived 1/8 (99104), median survival 118.5d

Per-fight decision anatomy (the finding that selects the variant):
- Player turns in wave-4 TB fights: 224 total = 123 strikes +
  71 flee turns (ctx.fled, 31.7%) + 29 close-distance moves +
  5 ability presses + 0 beast tricks.
- EVERY substantive fight (25/26; the 26th is a 1-turn mop-up of
  a 15-HP monster) opens with the start walk-away (fledBad = 1).
- Beast tricks = 0 because wave-4 monster defs carry NO counter
  field (verified in src/data/monsters.json) — the trick lever
  is vacuous for wave 4 and is NOT chased.
- Target selection is vacuous too: all 26 TB fights are
  single-monster, so "strike weakest" = "strike the only one".
- Four audit fights end with ZERO strikes landed (turns spent
  flee-walking and closing distance in oscillation) and 0–1.4%
  HP dealt. Fleeing never exits (0 fled, 0 pushes) yet eats a
  third of all fighting turns.

## The ONE variant: TB-HOLD

New file `scripts/policies/tbhold.js`, export `{ tbhold }`:
competent verbatim by object spread for everything except
`fight()`, and inside `fight()` competent verbatim for every
fight WITHOUT a wave-4+ monster (including its flee branches).
For a TB fight containing a wave-4+ monster, HOLD replaces the
turn logic with: combat-ability press (same cascade order and
guards as competent's abilityPressPlay, same dinner reserve,
counted into the shared ctx.abilityPresses counter), then
strike the weakest live monster via competent's exported
beastStrikeTarget (interior tiles only — never steps onto a
flee-by-barrier edge). There is NO flee branch on the HOLD path:
no start walk-away, no 35% eject, at any HP.

Why this is a TB-decision lever and not a sibling lane's:
- It changes PLAYER DECISIONS inside TB fights only, via a
  policy file. It does not touch field-fight damage/staying
  (win-fielddmg), who joins a fight (win-allyjoin), gear
  worn/carried (gearbar, settled), gates, prices, or game code.
- It does not invent knowledge: no tricks are played for
  unknown counters (wave-4 has none); ability presses use the
  same availability + dinner-reserve guards as competent.
- It does not change what the fighter CAN do — only whether
  the fighter spends the turn walking away or striking.

## Primary metric, GO threshold (fixed now, not moved later)

- Primary: kills per TB exposure = linked kill rows on TB
  exposures / TB started, variant leg vs baseline leg on
  IDENTICAL seeds (99101–99108) and horizon (140d death-aware).
- Secondary: median % of wave-4 monster HP dealt per TB fight.
- PILOT GO (8-seed band) iff BOTH hold:
  kills per TB exposure ≥ 0.50 (baseline 0.2692; +86%, i.e.
  near-double — justified by removing ~32% wasted turns) AND
  median HP dealt ≥ 38.8 (baseline 23.8; +15 points).
- A miss on either is NO-GO, never re-scored against a
  friendlier metric mid-run. Metric problems go under "metric
  review" for the next run.
- Pilot gate: the 8-seed band IS the pilot. If pilot GO passes,
  a paired confirm runs in the same run on FRESH seeds
  99109–99120 (competent leg + tbhold leg, same horizon):
  CONFIRM-GO iff tbhold kills/TB ≥ competent kills/TB + 0.15
  AND tbhold median HP ≥ competent median HP + 10 on that
  band. Overall GO requires pilot GO + confirm GO. If pilot
  GO passes but confirm fails, the verdict is KILLED with the
  pilot signal reported, and nothing lands. If pilot fails, NO
  confirm is spent and the variant file is deleted before the
  final commit (a killed arm leaves no trace).

## Secondary reporting (reported, never judged)

Flee share, median player turns, flee-turn share, villages
lost, median survival, field-fight counts (context only —
field behavior is untouched by construction), party split
(solo vs +ally, descriptive only).

## Balanced panel (§15)

INAPPLICABLE to this comparison, stated exactly: the panel
(`scripts/balance-panel.js`) compares full-run scorecard
metrics over policies registered in sweep-compare's
POLICY_REGISTRY with its own observer contract; it has no
TB-exposure instrument (no kills-per-TB-exposure, no per-fight
HP-dealt, no flee-turn counts) and tbhold is not a registry
policy. Registering it there would touch a shared file for no
measurement gain. The comparison used instead is strictly
stronger for this question: identical seeds, identical horizon,
identical driver, only the policy differs (paired comparison).

## Proof test (green before the judged variant leg)

`scripts/test-tbhold-20261103.js`: 10/10 — fresh wave-4 fight
takes a fighting turn with zero flee turns; 20% HP wave-4 fight
still never flees; non-wave-4 fights delegate (war_cry pressed
when committed-losing; walk-away preserved when fresh-losing);
full driveFights drive of a wave-4 fight progresses with zero
flee turns; non-fight methods delegate by reference; analyzer
math verified on synthetic JSON.

## Verdict classes

- GO iff pilot GO + confirm GO (see above). On GO the variant
  lands as its own commit (policy file + proof test + evidence
  section) and the coordinator merges; the ship loop owns
  pushes/version bumps/live verification.
- KILLED otherwise: evidence reports baseline vs variant tables
  with the miss named, the variant policy file is deleted from
  the worktree before the final commit, and prereg,
  instruments, test, and evidence remain.

## Hard limits (binding, honored)

- NO src/js changes. NO readyDemand, t4/t5, or plentyCap
  change. NO win-price or deed-gate change. NO field-fight
  code. NO ally-join code. NO gear/equipment code. NO Loop B
  food-economy code. NO sibling worktree touched. NO push, NO
  version bump, NO live verification, NO merge (coordinator
  merges). No `[needs-eyes]` commit: a policy-only sim arm
  with no feel/combat/UI change to the shipped game (the
  variant only lands if it GOes, and landing is a policy file
  the ship loop can hold for eyes if it wishes — flagged in
  the evidence, not the commit).

## Metric review (pre-run doubts, for the NEXT run)

- Exposure counts will drift between legs (trajectories
  diverge after the first wave-4 fight): kills/TB is a rate
  and survives drift, but a variant leg with far fewer TB
  exposures would be weaker evidence — exposure counts are
  reported alongside every rate, and a collapse (e.g. under
  15 TB fights) would be named as a caveat, not hidden.
- HP-dealt % uses start-HP sums from the instrument snapshot;
  a monster pre-damaged before TB start (e.g. the 15-HP
  influencer mop-up) reads 100% on a 1-turn fight. That fight
  is included in both legs' medians by the same rule, so the
  comparison is fair, but medians must be read with the
  per-fight table, not alone.
- ctx.fled counts flee() CALLS (walk turns), not exits: the
  baseline's 71 flee turns vs 0 fled outcomes is the gap
  between "tried to flee" and "fled". The variant leg's flee
  share is 0 by construction for wave-4 fights; the honest
  check is whether kills/HP move, not whether flee counts fall.
