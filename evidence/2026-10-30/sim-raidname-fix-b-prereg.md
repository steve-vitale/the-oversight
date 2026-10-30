# sim-raidname-fix-b — PRE-REGISTRATION (committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-raidname-fix-b
(run fleshout-loop-b-20261030T0230Z, axis food-economy).
Builds the raidname provenance-gate fix for findings-backlog
#1451 residual (2), whose misfire is LIVE-PROVEN by
sim-raidname-b1-b (evidence/2026-10-29/sim-raidname-b1-b.md,
landed e19534e56): 9/9 staged B1 configs misfired.
Fix recommendation source: evidence/2026-10-29/
sim-raidname-collision-b.md (documented, never built).
This arm BUILDS it; the coordinator marks the backlog —
this arm does not edit the backlog file.

## Canon status (stated, not invented)

READ docs/CANON.md first: no canon doc covers raids or
palisade sleep (same finding as sim-raidname-b,
sim-raidguard-b, sim-raidname-collision-b, sim-raidname-
b1-b). The raid rule lives only in a havenGrowth.js
header comment (reactive raids: 3+ world monsters,
3k+ pantry kcal, 7-day cooldown, 18% roll; raiders
linger at the treeline). This arm invents no canon:
it gates existing narration on provenance.

## Base commit (pinned)

Worktree HEAD at arm start: ff6bf0e04 (branch
sim-raidnamefix-b). Later than the b1 arm's base
(d6723d3f3); the audit below was verified against
THIS base, including the later shoutrec / joinendlines
/ soloendlines landings, which touch no raid-naming
or pending-clear site. If the base moves, the before
leg is re-run and this prereg amended BEFORE judging.

## Code audit (verified against the pinned base)

- Shadow write sites: SET only in havenRaidTick
  (havenGrowth.js, alongside the raid pending).
  NOT persisted in saves (no save/load site reads or
  writes raidPendingMonsterId): a save/load already
  drops the shadow, losing the line, never misfiring.
- Shadow consume: ONLY on pending match in
  startCombat's raid-naming block (game.js). The
  consume sits INSIDE the line-fired branch, so a
  non-matching fight leaves the shadow live.
- Shadow clears on overwrite: all 6 non-raid pending
  overwrites (wanderer 1, tent breach 4, feast draw 1)
  clear it — verified, unchanged by this fix.
- Pending-clear sites that KEEP the shadow (the
  orphan routes): startCombat's own pending clear
  (game.js, A1); exilePlayer (betrayal.js, A2-class);
  playerDeath succession clear (ledger.js, A3-class).
  Also found in audit, same class: newGame reset
  (game.js — a stale shadow could survive onto a
  fresh run on the same Game object) and the
  load-validation phantom clear (game.js — pending
  cleared for a missing def; its shadow id is
  unmatchable, so clearing it changes nothing, but
  uniformity beats a second orphan shape).
- Deliberately NOT touched, with reasons:
  (a) startAlienCombat (encounters.js) clears
  pendingEncounter but keeps pendingMonsterId — a
  half-clear. It is not a startCombat call, so the
  entry rule below already neutralizes it for the
  raid line (next monster startCombat sees no live
  pending and clears the shadow). The stale
  pendingMonsterId itself is a separate pre-existing
  blank, documented in the evidence file, not fixed
  here. (b) Coalition arena (titans.js): its flag
  is set on the tbfight AFTER startCombat creates
  it, so no pre-start flag exists to gate on; the
  contest gate covers _contestArena, the named
  contest path. Coalition-arena + same-species
  raidBorn tile entity stays a theoretical residual,
  documented, not chased. (c) The staged fight's
  tile-entity removal (startCombat lifts the
  species-matched tile entity): pre-existing world
  behavior, not narration; changing it would alter
  combat/world state and is out of this arm's scope.
  (d) Browser-ordering residual (3) stays OPEN and
  is NOT this arm.

## The fix (narration only — no spawn, damage, or economy value)

1. Provenance-gate path (b) in startCombat's
   raid-naming block. Capture at startCombat entry,
   before the pending clear: pending live?
   pending id? contest arena live
   (state.arenaContest, set by _contestArena before
   startCombat)? Path (b) (tile entity raidBorn)
   fires ONLY when the fight is NOT pending-resolved
   (pending live at entry AND mid === pending id
   at entry) AND NOT a contest-arena fight AND NOT
   a table trial (existing). Rationale: a
   pending-resolved fight is instantiated by
   species id, not lifted from the tile entity, so
   the tile entity's flag is not this fight's
   provenance; a contest fight's beast is the
   arena's own. A bump-with-live-pending fight
   whose mid differs from the pending id is NOT
   pending-resolved, so a genuine direct fight
   against a raidBorn bumper still names itself.
   Path (a) keeps its definition (mid === shadow,
   non-table-trial) and is additionally gated on
   NOT-contest: an arena beast is never the raid
   pending's fighter, even on a species coincidence.
2. Consume-or-clear on ANY startCombat pending
   clear. At startCombat's pending-clear site:
   keep the shadow ONLY when a pending was live
   at entry AND mid === shadow (the fight IS the
   shadow's own pending resolution; the naming
   block then consumes it on match, as before).
   Every other startCombat clears the shadow:
   mismatch fights (A1), fights with no live
   pending but a live orphan shadow, table trials.
   A live shadow with no live pending is by
   definition an orphan — its pending died earlier
   — so clearing it can never remove a genuine
   line: the shadow's only legitimate consumer is
   its own pending's fight.
3. Exile/succession pending clears clear the
   shadow with the pending: exilePlayer
   (betrayal.js) and playerDeath (ledger.js).
   Plus the two audit-found same-class sites:
   newGame reset and load-validation phantom
   clear (both game.js). havenGrowth.js's
   raid-naming comment is updated to describe the
   new clears; no other comment or wording changes.
   The raid line text itself is UNCHANGED.
   Commit message carries [needs-eyes] (the raid
   line is player-visible narration).

## Substrate (asserted FATAL by the driver)

COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
DEPOSITGATE=1, POLICY=insideevening, DAYS=30
loop-days, death-aware horizon (same as the b1
arm, so before/after legs stay comparable).
Seeds: pilot 10710–10717, confirm extension in
band order to 10725 (16 seeds). Budget to 10749
(40 seeds) only if 8 staged configs are not
reached on 16 seeds. Instrument: reuse
scripts/stage-raidname-b1-b.js +
scripts/analyze-raidname-b1-b.js UNCHANGED
(the b1 arm's regression instrument, per the
brief); proof script scripts/test-raidname-fix-b.js
is new (fixture-level harness probes + corpus
judgement). Before leg = clean pinned base;
after leg = fix only (plus proof script and
evidence, which touch no game code).

## Primary metric + pre-registered bars (judge ONLY against this header)

Primary metric: STAGED-B1 MISFIRES on the AFTER
leg, classified by scripts/analyze-raidname-b1-b.js
from the staged corpus on identical seeds
(misfire-b = raid line fired, pendingMatch false,
entityMatchCandidate true).

- BEFORE-LEG REPRODUCTION GATE (must pass or the
  run stops as INSUFFICIENT-DATA, never judged):
  before leg, >= 8 staged configurations,
  0 unclassified staged fights, pre-staging
  determinism identical on every staged seed,
  AND misfire rate >= 0.75 (the b1 rate was 9/9).
- GO: after leg, >= 8 staged configurations,
  0 unclassified staged fights, pre-staging
  determinism identical on every staged seed
  (ON-vs-OFF within the after leg, same rule as
  b1), AND misfires = 0, AND the neutrality gate
  AND the sense bar below all pass.
- NO-GO: any of the above fails. A miss is NO-GO,
  never re-scored against a friendlier metric;
  metric doubts go under "metric review" for the
  next run.

## Neutrality gate (blind band 10710–10725, 30d, OFF leg, no staging)

- Genuine raid lines still fire: OFF-leg fight
  sequences (kind / species / raidLineFired) and
  total raid-line counts identical before vs
  after. The fix changes no RNG, spawn, damage,
  or economy value, and the blind band produced
  0 B1 opportunities in collision-b, so identity
  is the expected outcome.
- Any per-fight diff is investigated line by line
  and must classify as a REMOVED STALE LINE (a
  before-leg line on a fight that was neither
  its shadow's own pending resolution nor a
  direct tile fight). A removed genuine line, an
  added line, or any other diff FAILS neutrality.
- 0 unclassified staged fights on both legs
  (analyzer count). No new say-line regressions:
  the OFF fight-record diff above is the check.

## Sense bar (SENSE-TESTING LAW)

At least one full post-fix staged fight tail is
read end to end (stagedSayFull from the after-leg
ON corpus). Bar: the fight carries NO false raid
origin — the raid line is absent — and the rest
of the tail still reads coherently as a wanderer
fight (the fix must remove a lie, not add a
confusion). A post-fix tail that still carries
the line FAILS the sense bar outright.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

No balance-panel compare .md is produced, by the
same pre-registered analogy as raidname-b,
collision-b, and raidname-b1-b: this leg is a
narration regression on 30-day instances, and
panel metrics (national / table / wins, wave
reach) cannot move — and cannot even be observed
— inside 30-day instances. The judged instrument
is the staged corpus on identical seeds, and the
bars above are the judge.

## Checks around the fix

- node --check on every changed/added script.
- node scripts/check.js --quick on the clean base
  (recorded, not judged) and after the fix (no NEW
  failures vs base; pre-existing failures must
  match the base set exactly).
- node scripts/test-raidname-fix-b.js green on
  the after leg (fixture probes + corpus
  judgement). Proof probes, all in one harness
  process per case via scripts/sim-harness.js
  (never copied eval boilerplate): genuine raid
  pending -> line fires + shadow consumed;
  staged-B1 shape (raidBorn tile entity +
  non-raid pending, same species) -> line absent;
  direct tile fight vs raidBorn entity, no
  pending -> line fires; orphan shadow + no
  pending -> line absent + shadow cleared;
  contest-arena fight vs same-species raidBorn
  tile entity -> line absent; exile with live
  pending+shadow -> shadow null; succession
  (playerDeath) with live pending+shadow ->
  shadow null.

## Metric review (MEASUREMENT.md §14 — filled in the evidence file, not here)

No band, substrate, threshold, staging clause, or
classification rule changes after this commit. If
the before leg fails to reproduce (base drift
since b1), the run stops and the evidence file
says so; the bar is NOT lowered to fit a weaker
before leg.
