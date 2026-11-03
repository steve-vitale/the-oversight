# sim-guarde-creekhop-b — PREREG (committed BEFORE any judged sim)

Run: oversight-flesh-out-loop-b, arm sim-guarde-creekhop-b
(coordinator brief 2026-11-02, run
fleshout-loop-b-20261103T013651Z, axis food-economy).
Worktree sim-guarde-creekhop-b, branch sim-guarde-creekhop-b.
Base commit (pinned before any judged leg): 90637bc7c
(journey-deepening r87 recovery). This worker does NOT
push, bump, verify live, merge, or rebase; the
coordinator lands the branch. Status to coordinator:
committed in worktree, pending coordinator merge.

## Canon note

docs/CANON.md read first; docs/MAP.md states the way
home as travel through the same travelTo pipeline. No
canon doc covers the pocket guard itself: it is a
policy-side sim instrument (a competent variant), not
a game system, so there is no canon to invent from —
the guard's E(D) model is inherited verbatim from the
predecessors (scripts/policies/competent-homewardstep-b.js,
installGuard/escapeCheck/checkHop, zero changes to
that file). This run is INSTRUMENT + JUDGED PILOT:
zero src/js changes, zero edits to
scripts/policies/competent.js, zero policy-default
flips, zero bundled fix. New files only (creek-hop
recorder, fidelity analyzer, proof test). If GO, it
is reported as DIAG-GO for a follow-up build naming
the fix — NOT a game-change verdict, NOT a landing.

## Predecessors (read, never re-litigated, never re-judged)

- evidence/2026-11-02/sim-homewardac-b.md (1636Z):
  the finding this run judges. On seed 69502 the
  forced adjacent hop (7,2)->(7,1) carries hop-time
  E PASS (simOk=true) yet the engine refuses it
  with a creek line (4 creek lines on day 5: the
  forced hop + 3 competent.daily jump retries
  through the same tile). The prior evidence's
  hypothesis: "the guard's checkHop passes the hop
  origin to travelBlockage; the engine's d=1 check
  does not take an origin. Creek blockage evidently
  depends on entry origin." This run TESTS that
  hypothesis against the engine code + fresh
  measurements; it does not assume it. Note what
  the engine code actually says (read before this
  prereg): travelTo's d=1 check calls
  travelBlockage(x, y) with NO fx/fy, which
  defaults the origin to the player's CURRENT tile
  — i.e. the engine DOES use the hop origin for
  d=1, it just takes it from live position rather
  than a parameter. A second, competing mechanism
  is visible in the guard code: installGuard
  evaluates ONLY escapeCheck(destination) — escape
  FROM the destination — and never checks entry
  INTO the destination. Under that mechanism the
  69502 disagreement needs no origin asymmetry at
  all: from (7,1) the scholar escapes home without
  re-entering (7,1), so E passes, while entering
  (7,1) from (7,2) is creek-blocked. The recorder
  below records BOTH models per hop (E, checkHop
  with explicit origin, engine travelBlockage with
  explicit origin) so the verdict can separate
  them: entry-blindness vs origin-asymmetry vs
  E-computation error.
- evidence/2026-11-02/sim-cband-b.md (2233Z): guard
  definitions (E(D): direct walkTo-faithful sim,
  else up to 4 lateral legs, one shared roadwork
  credit), outward-veto originSimOk null, shapes-C
  episode definition. Inherited verbatim.
- evidence/2026-11-02/sim-food-round-1830.md:
  tracker next blank (4) is this run — guard-E
  creek-hop fidelity (69502).

## Question

When the homeward guard ALLOWS a hop (E from the
hop destination passes), does the engine actually
let the scholar cross — and when it does not, what
exactly blocks the crossing? I.e. is guard-E a
faithful predictor of crossability on creek hops,
or does it pass hops the engine refuses?

## Instrument (recorder only, decided now)

scripts/creekhop-b-recorder.js — a standalone node
script (never writes files; prints one JSON line
per seed to stdout, caller redirects):

- Substrate identical to homewardac: competent,
  days 1-4 competent.daily exactly as the
  construct policy's non-construction days, env
  COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
  DEPOSITGATE=0, packcomp *=1 flags not 1
  (driver-enforced, FATAL otherwise).
- Day 5: the homewardac shape-A forced walk-out,
  adjacent steps, from haven (4,4):
  5,4 -> 6,4 -> 7,4 -> 7,3 -> 7,2 -> 7,1,
  through the engine's OWN travelTo, stopping at
  the first refusal (mirror of the construct
  policy's break). NO guard installed on the
  recorder leg: the guard in shadow mode cannot
  change a trajectory (it never vetoes, never
  says), and the recorder computes the guard's
  numbers directly instead — so the recorder leg
  is trajectory-identical to the homewardac
  shadow leg while recording strictly more per
  hop. (Guard functions are imported verbatim:
  escapeCheck + checkHop from
  competent-homewardstep-b.js, zero changes.)
- Per forced hop, recorded BEFORE the travelTo
  call, from live state at that moment:
  (a) E = escapeCheck(Game, dest) — ok, via,
  directOk, legs, creditUsed;
  (b) entry = checkHop(Game, origin, dest) —
  blockers (tile + blockType each) as the guard's
  own hop model computes them, with the hop
  origin passed explicitly;
  (c) engineBlock = Game.travelBlockage(dest,
  origin) — the engine's own destination check
  with the same explicit origin;
  (d) destination tile at hop time: type,
  needsBridge, bridged, blockFrom (or null);
  (e) swimmer = Game.hasAbility('swimmer').
  AFTER the call: moved (pos == dest), plus the
  say lines spoken during the call (for the
  sense-test transcript).
- Day-5 say lines for the whole day-5 window are
  captured (Game.say wrapper, as the homewardac
  driver does) so the sense-test can quote the
  creek refusal in context.
- The recorder stops after the day-5 walk-out
  (no competent.daily after it): nothing after
  the walk-out can change a forced-hop record,
  and stopping keeps the pilot fast and the
  output small.

## Control gate: base equality (STOP condition, before any judged number)

Seeded trajectories are base-pinned. BEFORE the
pilot numbers are judged, the recorder's 69502
leg AND the full pilot band must reproduce the
prior homewardac shadow legs on the new base:

- Day-5 start == (4,4) on all 8 pilot seeds.
- Forced moved-pattern identical to the prior
  corpus (evidence/2026-11-02/sim-homewardac-b-
  pilotA-shadow.jsonl, day-5 construct steps) on
  all 8 seeds, hop for hop.
- 69502 hop (7,2)->(7,1): E pass (simOk true)
  AND moved false, as in the prior corpus.

If ANY of these fail: STOP, report substrate
drift with the diverging seed/field, do NOT
judge fidelity. (Expected to hold exactly: the
guard policy's re-port commit states logic
unchanged, and days 1-4 are pure competent.)

## Pilot band (freshness: 69501-69508 are the
homewardac A band — RE-RUN here, never re-used:
every number below comes from the fresh recorder
legs on base 90637bc7c, not from the prior
corpus. The prior corpus is used ONLY for the
control-gate comparison and for setting the
thresholds below.)

- Seeds: 69501-69508 (8 recorder legs, shape-A
  route above). No other seeds are judged.
- Legs that never reach a day-5 haven start
  (dead scholar, Game.over) are EXCLUDED from
  the fidelity denominator and reported as leg
  failures. (Prior band: 8/8 reached haven.)

## Primary metric, GO thresholds, verdicts (decided now)

Unit: one forced hop on a recorder leg. The
guard's decision-relevant prediction is its
ALLOW: E(dest) passes. (E(dest) is NOT a
prediction of engine movement in general — an
E-fail hop the engine allows is a pocket entry
the guard would fence, which is the guard
working as designed, not infidelity. Those hops
are counted separately, never folded into the
fidelity denominator.)

Primary metric: E-pass fidelity = moved / E-pass
forced hops across the 8 pilot legs, where
moved = the engine's travelTo landed on the
destination.

- FIDELITY-GO: E-pass fidelity >= 95% AND zero
  unclassified disagreements. Means 69502 was a
  rare artifact and E-pass hops are crossable in
  practice. (Prior-corpus expectation: 24/28 =
  85.7% E-pass moved, 4 disagreements — so GO is
  NOT the expected verdict; it is stated so a
  surprise pass is recognizable, not so the bar
  can be moved.)
- DIAG (mechanism named — the expected verdict
  family): E-pass fidelity < 95% AND every
  E-pass + refused disagreement carries a
  non-null entry blocker (checkHop blockers
  and/or engineBlock) whose blockType names the
  cause. Verdict names the mechanism precisely:
  entry-blindness (E never checks entry into
  the destination) if checkHop and engineBlock
  AGREE on the blocker; origin-asymmetry if
  checkHop (explicit origin) passes while
  engineBlock (explicit origin) blocks, or vice
  versa. A DIAG verdict is a complete result:
  it isolates the exact fix shape for a
  follow-up (e.g. the guard checking entry
  before allowing) without landing any fix here.
- DIAG-ERROR (E-computation fault, worse than
  scope): ANY E-pass + refused disagreement
  where checkHop reports NO blocker AND
  engineBlock is null (engine refused with no
  entry blocker either model can see), OR any
  hop where checkHop's prediction (blockers
  empty => engine allows) contradicts the
  engine outcome while E agrees with the engine
  — i.e. the guard's hop model itself, not its
  scope, is wrong. Report as a fault, not a
  scope gap.
- SUBSTRATE-FAIL (DIAG, NOT a fidelity verdict):
  control gate fails, or E-pass hops = 0, or
  < 4 legs reach day-5 haven start.

Judge the run against this header. A miss is
the verdict it defines, never re-scored against
a friendlier metric mid-run (MEASUREMENT.md
§14). Metric doubts go under "metric review"
for the NEXT run. Every evidence file carries a
"metric review" section.

Secondary (reported, never the verdict):
- BlockType census of all E-pass + refused
  disagreements (creek / fallen_tree /
  washed_out / rubble / other).
- E-fail + moved hops (pocket entries the
  guard would fence): count + seeds.
- E-fail + refused hops: count (both models
  agree the hop is bad — the uninteresting cell).
- Tile census of refused destinations (type /
  needsBridge / bridged / blockFrom / swimmer).

## Balanced panel (§15)

VACUOUS by design, as in cband: the panel
expresses guard policies on natural campaigns;
this run's before/after IS the recorder leg vs
the prior shadow leg on identical seeds (the
control gate). No compare file is fabricated.

## Sense-testing law

Read the day-5 say transcript around a creek-hop
refusal (69502 at minimum) and judge whether
the refusal reads sensibly to a player: does the
player learn WHY the step failed, and does the
guard's silence (shadow mode: no veto line,
engine line only) leave the player misled about
what the guard allowed? Quote the transcript
sample in the evidence file. The evidence file
carries a village assessment in plain words,
wall numbers for the pilot band stated as
in-window construction-substrate numbers (30d
window NOT run here — recorder stops day 5, so
no wall numbers beyond day-5 survival are
claimed), and a "metric review" section.

## Census (proof, not judged evidence)

BEFORE pilot legs are judged, the proof test
scripts/test-guarde-creekhop-b.js must show:
(a) recorder imports escapeCheck/checkHop
verbatim (guard file unmodified in this
worktree — git check); (b) on seed 69502 the
recorder reproduces the prior corpus exactly
(day-5 start haven, forced moved-pattern
5 ok + 1 refused, hop (7,2)->(7,1) E pass +
moved false); (c) the 69502 disagreement
classifies as a destination-entry blocker with
a named blockType from BOTH checkHop and
engineBlock (or records the exact asymmetry if
they differ); (d) destination tile attributes
at hop time are captured (type/needsBridge/
bridged/blockFrom/swimmer); (e) the pilot band
seeds are exactly 69501-69508. Any proof
failure is a proof failure: fix the instrument,
do not judge legs against a failing one.

## Deliverable

Evidence file evidence/2026-11-02/sim-guarde-creekhop-b.md
(prereg header, control-gate result, per-hop
fidelity table for the 8 pilot legs, verdict
against the header above, blockType census,
sense-test transcript sample + judgement,
village assessment in plain words, metric
review section, out-of-scope findings list for
the coordinator's backlog), plus the recorder +
proof test, all committed on branch
sim-guarde-creekhop-b. Report to coordinator:
verdict (FIDELITY-GO / DIAG / DIAG-ERROR /
SUBSTRATE-FAIL with the pre-registered
threshold), fidelity numbers, control-gate
result, 69502 reproduction result, sense-test
finding, commit hashes, proof-test result,
anything left uncommitted or failed.

## Explicitly excluded

No src/js changes; no edits to competent.js,
the guard policy, the homeconstruct policy/driver,
or the shapes analyzer; no default flip; no
bundled fix; no guard-allow rule change (the
DIAG fix shape is named, not landed); no seeds
outside 69501-69508 judged; no push, bump, live
verification, merge, or rebase.
