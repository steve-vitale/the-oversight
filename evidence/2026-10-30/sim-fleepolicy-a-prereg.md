# sim-fleepolicy-a — PREREGISTRATION (committed BEFORE any judged analysis)

Run: flesh-out loop, run fleshout-20261030T1315Z, worker
sim-fleepolicy-a, axis scale-onramp (blocking axis, converging,
NOT converged). POLICY-SIDE MEASUREMENT ONLY — no game change,
no default flip, no gate move, no deed-bar move. No [needs-eyes]:
this arm changes no feel, combat, or UI — it only measures
through a non-default policy. The flee policy is an instrument
and must not change any default.

## The question (ranked-next #1 from sim-fledcover-a)

sim-fledcover-a proved the fled-restore MECHANISM via 3 scripted
scenarios (clear-tile fled restores, blocked-tile fled melts
against a named fellow besieger, chase fled restores after
pursuit exhausts). But the NATURAL fled population is empty:
0 fled tbend events on 24 seeds across two bands (75101-75116
and 75201-75208) under competent play. The unbuilt prereg Leg C
from fledcover-a: a policy that chooses to run from a lingerer
fight, to produce natural fled observations. This arm builds
that policy (policy-side only, under scripts/policies/) and
runs a natural band with it, classifying each fled lingerer
fight by origin + restore outcome using the existing recorder
fields (draftflag + scholarmelt verbatim). No new recorder
field is built.

Canon note (stated, not invented): no canon doc covers
fled/restore rules. docs/MONSTER-WAVES.md covers wave law
only; the rule lives in game.js comments (journey crisis
r38). Nothing in this arm invents canon from that gap.

## The instrument (scripts/policies/fleepolicy-a.js)

`fleepolicyNowait` = tableseat-nowait (the fledcover-a stack:
leanlinkrescue courtship + seat legs, NO wait leg) with its
`fight` method overridden, gated on FLEEPOLICY=1. Gate off:
fight delegates to the base fight untouched (byte-identical
behavior to the fledcover-a stack; the off-path is pinned by
a fixture in scripts/test-fleepolicy-a.js).

When a live scholar TB fight has a lingerer origin
(`tbfight.worldOrigin.lingering === true &&
tbfight.worldOrigin.titan === false`), the override takes
over from turn 1 — it does NOT delegate strike turns to the
base fight, so every fled outcome on a lingerer fight in
this band is attributable to the instrument (the base fight
never gets a turn on a lingerer fight; non-lingerer fights
delegate to the base fight untouched):

- Strike phase (2 damaging strikes, mirroring the fledcover
  scenarios' >= 2 strikes): strike the weakest alive monster;
  if out of weapon range, step toward an adjacent tile
  (step-limited to moveLeft, as in the fledcover harness);
  end the turn exactly as competent does (moveLeft=0,
  acted=true, tbAfterPlayerAction). A strike that deals 0
  (out of range, miss) does not count toward the 2.
- Flee phase (from the turn after the 2nd damaging strike):
  if the scholar is inside Haven (`state.scholar.insideHaven
  !== false`), walk to the Haven door tile (4,6) via
  findPath, step-limited to moveLeft — stepping onto the
  door tile ends the fight through the engine's own door
  branch, as in fledcover S-clear/S-blocked. Otherwise walk
  to the nearest grid edge and push through with
  tbBarrierExit, repeating crossings for chasers, as in
  fledcover S-chase. If the chosen exit path makes no
  progress for 3 consecutive flee turns, switch to the
  other exit path (door <-> edge); if neither path ends
  the fight within 30 flee turns, abandon the flee and
  delegate to the base fight for the remainder of that
  fight (counted as flee-abandoned, never as fled).
- Counters on ctx (per-run, never serialized into game
  state): fpLingererFights (distinct lingerer-origin fight
  objects seen), fpStrikeTurns, fpFleePhaseFights
  (distinct fights entering the flee phase), fpFleeTurns,
  fpFleeAbandoned, fpDoorFlees, fpEdgeFlees (flee-phase
  turns by path). The sweep copy adds these to the row as
  an additive `fleepolicy` field (a sweep-row field, NOT a
  recorder field — the draftflag/scholarmelt recorders are
  reused verbatim).

Trigger proof (instrument validity, judged BEFORE any fled
count is claimed): fpFleePhaseFights > 0 AND at least one
flee-phase fight ends with a tbend row. A policy that never
enters its flee phase is a FAILED INSTRUMENT, not a 0
result — if fpFleePhaseFights == 0 the verdict is
INSTRUMENT-FAIL, never NO-GO, and the run reports why
(no lingerer fight was ever seen, or the override never
fired, distinguished by fpLingererFights).

## Population definition (fixed here, never re-scored)

A FLED LINGERER FIGHT is a scholar TB fight whose draftflag
tbend event has result 'fled' AND whose origin snapshot
satisfies `lingering === true && titan === false`
(blockedrestore's isLingerer, verbatim, as in fledcover-a).
Scholarmelt meetings are censused separately (their result
field carries fled for scholar TB fights, including any
whose tbend event lacks a worldOrigin); a scholarmelt fled
meeting is NEVER folded into the tbend lingerer count.

RESTORE CLASSIFICATION (draftflag fields verbatim, same rule
as fledcover-a/blockedrestore): RESTORED = tbend
`restored === true` (origin back in the world list after
tbEnd); BLOCKED = `restored === false` AND `occupantAfter`
non-null (blocker id/hp/wave/tile recorded); otherwise
UNCLASSIFIED (with the missing hook named, never silently
folded into either class).

## Search plan

Policy/env stack: tableseat-nowait policy/env verbatim from
fledcover-a (LEANLINKRESCUE=1, TABLESEATNOWAIT=1,
FIELDPARTY=1, W4DPR=1, BREAKLINE=1, TILEJOIN=1, SHOUTREC=1,
JOINENDLINES=1, REMOVAL=1, SCHOLARMELT=1, DRAFTFLAG=1)
PLUS FLEEPOLICY=1, via a sweep copy
(scripts/sweep-fleepolicy-a.js, a copy of
scripts/sweep-draftflag-a.js with exactly the deltas:
policy = fleepolicyNowait, EVID default
evidence/2026-10-30/perseed-fleepolicy-a/, SEEDS default
75301-75308, additive `fleepolicy` row field from ctx).
No other delta: same recorders, same 180d death-aware
horizon, same census/summary gates.

- Pilot gate: fixtures in scripts/test-fleepolicy-a.js green
  (including gate-off delegation and the door + chase
  scenario proofs that the policy flees when intended);
  then 1 pilot seed (75301) runs clean with draftflag +
  scholarmelt recorders firing (tbend events present,
  errs 0) and the fleepolicy counters present on the row.
  Only then does the 8-seed confirm run proceed.
- Confirm: seeds 75301-75308, 180d death-aware horizon.
  Never below 8 seeds for any judged natural-band claim.
- Sense: read >= 2 fled chains end to end (tbend event +
  scholarmelt meeting + census snapshots around the day)
  and judge meaning, not just counts; if 0 fled, read >= 2
  nearest-miss lost chains instead and say why the flee
  phase did or did not produce a fled exit.

## Pre-registered GO / NO-GO (judge against this, never
re-scored mid-run)

GO: >= 1 natural fled lingerer fight observed (tbend
result 'fled' + lingerer origin) with restore outcome
classified (RESTORED or BLOCKED with blocker identity +
tile).
STRONGER GO: >= 3 natural fled lingerer fights covering
the clear-restored / blocked-blocked contrast (>= 1
RESTORED and >= 1 BLOCKED among them).
DIAG-GO requires additionally: pilot gate passed,
fixtures green before judged analysis, analyzer
determinism byte-identical, >= 2 fled chains sense-read
end to end (or nearest-miss sense read if the result is
NO-GO), wall numbers carried from the judged corpus
only and stated separately from every other band's
numbers, never mixed.
NO-GO (legitimate, reportable): the instrument fires
(fpFleePhaseFights > 0) but the confirm band yields 0
fled lingerer fights. Report coverage STILL EMPTY with
the flee-phase evidence (abandonments, losses, routes)
documented — never a rate, never a re-scored metric.
INSTRUMENT-FAIL (separate verdict, not NO-GO):
fpFleePhaseFights == 0 — the policy never triggered and
no fled conclusion of any kind may be drawn.

Population-definition discipline, binding on this arm: a
search yielding 0 fled means coverage-still-empty, NEVER
a fled rate. Scenario counts (fledcover-a's 3) and natural
counts (this band) are never blended into one rate, and
no rate is quoted from this band's handful even if GO is
met — a handful of instrument-induced flees is a
classification sample, not a population frequency.

## What is NOT judged here

Whether fleeing sieges is good play or good design (the
policy is an instrument, default OFF, not a proposal).
Any gate, deed-bar, or default move. Fled rates on any
band. The blocked-restore design question (steve-call,
carried from blockedrestore/fledcover-a) — this arm
supplies natural observations for it, it does not answer
it.

## Deliverables

- scripts/policies/fleepolicy-a.js (the instrument)
- scripts/test-fleepolicy-a.js (fixtures + door/chase
  scenario proofs; fixtures green BEFORE judged analysis)
- scripts/sweep-fleepolicy-a.js (sweep copy, deltas above)
- scripts/analyze-fleepolicy-a.js (pure analyzer over the
  corpus; determinism byte-identical, scratch removed)
- evidence/2026-10-30/sim-fleepolicy-a.md (verdict,
  judged counts, sense notes, wall numbers, ranked next,
  metric review)
- evidence/2026-10-30/sim-fleepolicy-a-analysis.json
- evidence/2026-10-30/perseed-fleepolicy-a/ (corpus:
  8 rows + 8 census files + summary.json)

## Metric review (to be completed in the evidence file)

Every evidence file carries this section. Anticipated
notes (not verdicts): (a) the tbend-origin definition
above must be restated wherever "linger-origin" is used;
(b) instrument-induced flees classify the restore rule
under natural siege composition, but they do not
estimate how often unmodified play flees — the 0/24
baseline stands as the unmodified-play statement;
(c) if the flee phase abandons often (allies in the
fight, sealed fights, door/edge path failures), the
abandonment breakdown is part of the verdict, not a
footnote.
