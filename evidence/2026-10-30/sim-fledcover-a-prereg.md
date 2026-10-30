# sim-fledcover-a — PREREGISTRATION (committed BEFORE any judged analysis)

Run: flesh-out loop, run fleshout-20261030T1215Z, worker
sim-fledcover-a, axis scale-onramp (blocking axis, converging,
NOT converged). DIAG ONLY — no game changes, no default flip,
no gate move, no deed-bar move. No [needs-eyes]: this arm
changes no feel, combat, or UI — it only measures, using
existing recorder fields plus a scripted scenario harness
that plays real fights through the engine. A measurement
policy/scenario that induces fleeing is an instrument and
must not change any default.

## The question (ranked-next #2 from the 1122Z run)

On band seeds 75101-75116 (180d death-aware horizon,
tableseat-nowait policy/env), the fled half of
linger-keeps is UNOBSERVED: 0 tbend 'fled' events on all
16 seeds (blockedrestore-a, dissolve-a, both published),
and dissolved rows cannot supply fled observations by
construction (different result value). That is an EMPTY
POPULATION, not a zero rate: no fled-rate claim may be
made in either direction. The lost half is measured:
13/24 losses blocked (54.2%), all 13 blockers fellow
besiegers at (4,4). Open question: when the scholar
FLEES a lingerer fight, does the restore block the same
way as a lost restore (fellow besieger still on the
tile), or not?

## Mechanism, read from code before judging (not a finding)

`tbEnd` (game.js): `lingerKept = isLingerer &&
(result === 'fled' || result === 'lost')`, where
`isLingerer = o.lingering && !o.titan` on
`f.worldOrigin`. When kept, the restore is attempted
only if the fighter copy still stands, the origin is
not already in the world list, and
`monsterAt(origin.tx, origin.ty)` is empty. The guard
is TEXTUALLY IDENTICAL for 'fled' and 'lost' — same
branch, same occupancy check, the only fled-specific
line being the say text ("It didn't leave — you did.").
So the code predicts fled restores block exactly like
lost restores. This arm's job is to OBSERVE that
prediction, not to restate it: a code reading is not a
measurement, and if observation contradicts the code
reading, observation wins and the discrepancy is
reported loudly.

Canon note (stated, not invented): no canon doc covers
fled/restore rules. docs/MONSTER-WAVES.md covers wave
law and the readiness gates; the lingerer-keeps rule
lives in game.js comments (journey crisis r38) only.
Nothing in this arm invents canon from that gap.

## Population definition (fixed here, never re-scored)

A FLED LINGERER FIGHT is a scholar TB fight whose
tbEnd result is 'fled' AND whose origin is a lingerer:
- tbend-event legs: the draftflag recorder's tbend
  origin snapshot with `lingering === true &&
  titan === false` (blockedrestore's isLingerer,
  verbatim). `worldOrigin` is available on tbend rows;
  the dissolve warning (worldOrigin null on dissolved
  rows) does NOT apply here — dissolved rows are a
  different population and are never counted as fled.
- Scripted-scenario leg: `tbfight.worldOrigin` at
  fight start with `lingering === true &&
  titan === false`, recorded in the scenario snapshot
  before any fight action.
A fled fight with NO worldOrigin (wild monster, or a
bystander hold) is counted separately as fled-non-origin
and never folded into the lingerer population.
A dissolved row is never a fled observation, in any leg.

RESTORE CLASSIFICATION (same rule as blockedrestore,
applied to fled rows): RESTORED = origin object back
in the world list after tbEnd (at its origin tile, HP
capped at pre-fight world HP); BLOCKED = origin absent
after tbEnd AND a named occupant stands on the origin
tile at tbEnd (blocker uid/id/hp/wave/tile recorded);
otherwise UNCLASSIFIED (with the missing hook named,
never silently folded into either class).

## Search plan (in order; stop at first leg that yields
a classified fled lingerer fight, but run all of Leg S
once started so the clear/blocked contrast is judged)

Leg N — NATURAL FRESH BAND (pilot 8, then confirm only
if the pilot yields a fled lingerer fight): seeds
75201-75208, 180d death-aware horizon, tableseat-nowait
policy/env verbatim via scripts/sweep-draftflag-a.js
unchanged (SEEDS env + EVID env to
evidence/2026-10-30/perseed-fledcover-a/), reusing its
existing draftflag tbend recorder + scholarmelt recorder
fields only. No new recorder field is built for this
leg; if a new field proves necessary it must be minimal,
non-overlapping with the parallel sim-dissolvecause-a
arm's recorder, and flagged prominently. Judged from
the tbend events + scholarmelt meetings in that corpus.
Expected outcome, stated in advance: 0 fled lingerer
fights (the prior band and the policy's fight behavior
predict it) — an expectation is not a verdict, and a
nonzero pilot result would be judged on its own counts.

Leg S — SCRIPTED SCENARIO HARNESS (the primary
producer; scripts/test-fledcover-a.js): real fought
fights through the engine — never an outcome table,
never a direct tbEnd('fled') call. Each scenario:
seeded loadGame + setupGame, scholar placed on the
haven tile (village px,py), a lingering raidBorn world
monster spawned on that tile, startCombat on its id
(so tbfight.worldOrigin is the lingerer), >= 2 strike
rounds with real stats (scholar strikes, monster turns
advance via tbPlayerEndTurn), then flee through the
engine's own barrier exit (tbPlayerMove toward the grid
edge across turns, then tbBarrierExit on the edge tile;
chaser variant repeats crossings until pursuit gives
up). Origin snapshot pre-fight; post-tbEnd world-list
+ monsterAt classification; scholar HP path recorded.
Scenarios (all at seed 75102 for the judged run, plus
a byte-identical determinism re-run):
  S-clear: gallowdeer lingerer, follows:false (clean
    single-crossing fled), tile clear at tbEnd.
    Predicted: RESTORED.
  S-blocked: gallowdeer lingerer + a second fellow
    besieger (callback) spawned on the SAME tile before
    startCombat, so it still stands on the tile at
    tbEnd. Predicted: BLOCKED by the named blocker.
  S-chase: bulldozer lingerer, follows:true (chase
    plays out across barrier crossings until pursuit
    exhausts), tile clear at tbEnd. Predicted:
    RESTORED after the chase ends in 'fled'.
  A scenario counts only if the fight reaches tbEnd
  with result 'fled' through the barrier path; a
  scenario that ends 'lost'/'won'/'routed'/dissolved is
  a FAILED PRODUCTION (reported, not re-scored as fled).

Leg C — POLICY-VARIANT FLEE INDUCER (contingency
ONLY, if Leg S produces 0 fled tbend events): a
policy-side fight hook wrapping tableseat-nowait that,
on a lingerer-origin fight only, strikes N rounds then
walks to the edge and barrier-exits — documented as an
instrument, default OFF, no game-code change. If Leg C
is built, it gets its own prereg addendum committed
before its judged run; it is NOT pre-authorized to
re-score a Leg S failure.

## Pre-registered GO / NO-GO (judge against this, never
re-scored mid-run)

GO: >= 1 fled lingerer fight observed with origin
(lift.lingering definition above, never worldOrigin on
dissolved rows) AND restore outcome classified
(RESTORED or BLOCKED with blocker identity + tile).
STRONGER GO: >= 3, covering S-clear restored,
S-blocked blocked, and S-chase restored — the full
clear/blocked/chaser contrast.
DIAG-GO requires additionally: pilot gate passed,
fixtures green before judged analysis, analyzer
determinism byte-identical, >= 2 fled chains sense-read
end to end (or nearest-miss sense read if GO is met
only on Leg N with 1 fight — then 1 fled chain + the
nearest misses), wall numbers carried from the judged
corpus (Leg N) and stated separately from the carried
75101-75116 band numbers, never mixed.
NO-GO (legitimate, reportable): the preregistered
search (Leg N pilot + all of Leg S, plus Leg C if
invoked) yields 0 fled lingerer fights. Report
coverage STILL EMPTY with the search space exhausted
documented — never a rate, never a re-scored metric,
never a code-reading passed off as an observation.

## Pilot gate (before any confirm spend)

Fixtures in scripts/test-fledcover-a.js green; one
natural seed (75201) runs clean with draftflag +
scholarmelt recorders firing (tbend events present,
errs 0); one scripted scenario (S-clear) reaches
tbEnd('fled') through the barrier path with origin
classified. Only then do the full Leg N pilot (8
seeds) and the full Leg S judged run proceed. Never
below 8 seeds for any judged natural-band claim.

## What is NOT judged here

Dissolve cause (ranked-next #1, the parallel arm's
work — do not touch its recorder or its worktree).
Whether a blocked fled restore SHOULD displace/queue
(steve-call design question, carried from
blockedrestore). Any gate, deed-bar, or default move.
Fled rates on any band (empty-population discipline:
with 0 observations there is no rate; with a handful
of scripted observations there is still no band rate —
scripted scenarios classify the mechanism, they do not
estimate a population frequency).

## Deliverables

- scripts/test-fledcover-a.js (fixtures + scenario
  harness; fixtures green BEFORE judged analysis)
- scripts/analyze-fledcover-a.js (pure analyzer over
  the Leg N corpus + scenario JSON; determinism
  byte-identical, scratch removed)
- evidence/2026-10-30/sim-fledcover-a.md (verdict,
  search space, judged counts or the exhaustive
  empty-population statement, sense notes, wall
  numbers, ranked next, metric review)
- evidence/2026-10-30/sim-fledcover-a-analysis.json
- evidence/2026-10-30/perseed-fledcover-a/ (Leg N
  corpus, if the pilot runs; scratch outputs removed)

## Metric review (to be completed in the evidence file)

Every evidence file carries this section. Anticipated
notes (not verdicts): (a) the tbend-origin definition
above must be restated wherever "linger-origin" is
used, because the dissolved-row definition
(lift.lingering) and the tbend definition (origin
snapshot lingering) are different instruments for the
same concept and must never be conflated; (b) scripted
scenarios prove mechanism, not frequency — any future
arm that wants a fled RATE needs a natural band where
fleeing happens on its own, which this arm does not
claim to have found unless Leg N yields one.
