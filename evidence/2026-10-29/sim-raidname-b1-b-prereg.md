# sim-raidname-b1-b — PRE-REGISTRATION (committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-raidname-b1-b
(run fleshout-loop-b-20261030T0130Z, backlog #1454 next step).
Claims the standing next step of findings-backlog #1451
residual (2) ONLY (the coordinator marks the backlog — this
arm does not edit the backlog file). This arm is DIAG ONLY:
zero src/js changes, zero default flips, zero game-mechanism
changes. A fix, if the diagnosis warrants one, is a
documented recommendation for a later arm, never a mid-run
code change.

## Canon status (stated, not invented)

READ docs/CANON.md first: no canon doc covers raids or
palisade sleep (same finding as sim-raidname-b,
sim-raidguard-b, sim-raidname-collision-b). The raid rule
lives only in a havenGrowth.js header comment. This arm
invents no canon: it measures whether existing narration
can misattribute a fight's origin, given a staged
configuration, in live sims.

## Background (read first)

evidence/2026-10-29/sim-raidname-b.md,
evidence/2026-10-29/sim-raidname-collision-b.md, and
evidence/2026-10-29/sim-raidname-collision-b-prereg.md.
The raid-naming line (pending shadow + raidBorn flag
union) is GO and landed. Residual (2) stands
MECHANISM-PROVEN / FREQUENCY-OPEN:

- Fixture-proven B1: a non-raid pending resolving while a
  raidBorn tile lingerer of the same species sits on the
  player tile says the raid line, although the fought
  monster is a fresh instantiation, not the tile entity.
  (Fixture T-B1, proof 33 pass in collision-b.)
- Blind band: 40 seeds, 134 fights, 95 raid lines, 61
  dawn-raid mornings, opportunities 0, shadows 65/65
  consumed. The risky configuration never arose
  naturally in insideevening play.
- Standing next step, twice recorded: a TARGETED
  staged-B1 leg in live sims, NEVER more blind seeds.

## Base commit (pinned)

Worktree HEAD at arm start: d6723d3f3 (branch
sim-raidname-b1-b). All judged legs run on this base.
If the base moves, the bank is re-derived and the prereg
amended BEFORE judging (the lackingline3 lesson: never
quote a staged result across a drifted base).

## Substrate (asserted FATAL by the driver)

COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
DEPOSITGATE=1, POLICY=insideevening, DAYS=30 loop-days,
death-aware horizon (dead villages stop; runDays
handles it — never a fixed 200d, and 30 loop-days is
the collision band's horizon, kept so opportunity
counts stay comparable). Seeds: pilot 10710–10717,
confirm extension in band order 10718–10749 (40-seed
budget total, pilot included).

## Staging definition — the ONLY intervention

The driver (scripts/stage-raidname-b1-b.js) wraps
policy.upkeep. AFTER the original upkeep returns, once
per seed at most, it checks the B1 precondition and,
only if every clause holds, injects exactly one
wanderer-style pending:

1. No live fight, no pending encounter, player alive,
   game not over.
2. The player-tile world monster (Game.playerMonster(),
   i.e. monsterAt(map.px, map.py)) exists, is alive,
   and carries raidBorn = true. The lingerer itself
   is NEVER created, moved, or edited by the driver —
   it must have arisen naturally from a real raid in
   the live trajectory. One-monster-per-tile means
   this is the tile monster startCombat will read as
   _origin; no bystander ambiguity is possible in a
   live sim (unlike the fixture's tile-clearing note).
3. Game.raidPendingMonsterId is NULL at check time.
   This isolates path (b): the staged fight cannot
   match path (a), and the driver never clears or
   writes a live shadow (zero shadow perturbation).
   If a shadow is live, the window is recorded as
   skipped-shadow and no staging happens.
4. The injected pending is exactly what the wanderer
   code path writes (game.js wanderer branch): 
   pendingEncounter = true,
   pendingMonsterId = <tile monster species id>,
   pendingInTent = false, raidPendingMonsterId = null
   (already null per clause 3 — the assignment is the
   wanderer path's own shadow-clear, not a new write).
   The pending is NON-RAID by provenance: it was
   written by the driver mimicking the wanderer route,
   never by havenRaidTick.

The harness pending block (sim-harness driveContests,
which runs immediately after upkeep in the same day
iteration) then resolves the pending via
startCombat(mid) exactly as it resolves a natural
wanderer pending. No other game state is written by
the driver at any point; the startCombat wrapper and
the say capture are read-only.

A STAGED CONFIGURATION is counted only when the
staged fight's startCombat entry snapshot verifies
all of: shadowAtEntry != injected species (null per
clause 3, re-checked at entry), originAtEntry exists
with raidBorn true and originAtEntry.id == injected
species, and the fight is the first startCombat call
after the staged event in the same loop-day. If the
entry snapshot fails (linger moved, fight refused,
pending cleared elsewhere), the event is a STAGING
MISS — counted separately, never as a misfire and
never as a non-misfire.

## Classification (analyzer: scripts/analyze-raidname-b1-b.js)

For each staged configuration, the staged fight is
classified from its startCombat record (creation or
ended-inside attempt, per the collision-b amendment —
attempts ARE fights):

- MISFIRE-B: raidLineFired true AND pendingMatch
  false AND entityMatchCandidate true. (pendingMatch
  is false by construction — shadow null at entry —
  but it is checked, not assumed.)
- NON-MISFIRE: raidLineFired false (the (b) path did
  not fire despite a verified B1 entry snapshot), OR
  raidLineFired true with pendingMatch true (cannot
  happen under clause 3; if it ever does, the config
  is UNCLASSIFIED and the leg stops — a shadow
  appeared between check and entry, breaking the
  isolation).
- UNCLASSIFIED: any staged fight whose record lacks
  an entry snapshot, a say tail, or a linkable
  staged event. Any UNCLASSIFIED staged fight voids
  DIAG-GO (see bars).

OFF leg: the same driver with STAGE_B1=0 on identical
seeds. No injection, same recording. The OFF leg
serves two purposes: (a) pre-staging determinism —
the fight-record sequence (species, loop-day, raid
line) before the staged fight's ordinal must be
identical OFF vs ON per seed, proving the driver
did not perturb the trajectory before staging;
(b) natural opportunity windows — post-upkeep
checks where clause 2 holds (raidBorn on tile, no
pending/fight), counted per seed, showing how often
the lingerer half of the configuration arises
naturally (the pending half is what never coincides).

## Primary metric + pre-registered bars (judge ONLY against this header)

Primary metric: MISFIRE RATE = misfires / staged
configurations, on staged configurations only.
Minimum-n: at least 8 staged configurations.
Pilot: 8 seeds (10710–10717) OFF/ON before ANY
confirm spend (MEASUREMENT.md §9). Confirm: extend
in band order to at most 40 seeds total (10749) until
8 staged configurations are reached.

- DIAG-GO: >= 8 staged configurations, 0
  unclassified staged fights, pre-staging
  determinism identical on every staged seed, AND
  misfire rate >= 0.75 (the fixture proved the
  mechanism deterministic given the configuration;
  a live rate at or above 0.75 reproduces it).
- DIAG-NO-GO: >= 8 staged configurations, 0
  unclassified, determinism identical, AND misfire
  rate < 0.75 (live sims diverge from the fixture —
  the entry snapshot then says exactly which clause
  failed: origin moved, _originIsFighter false, line
  suppressed, or fight refused).
- INSUFFICIENT-DATA: < 8 staged configurations after
  the full 40-seed budget, OR any staged fight
  unclassified, OR any pre-staging determinism
  mismatch. In this case the finding is the staging
  failure itself: the evidence names the exact
  precondition that failed (no natural raidBorn-on-
  tile windows, windows always shadow-blocked,
  staging misses, or determinism break) and what
  instrument would be needed. Blind seeds are NOT
  substituted, and the bar is NOT lowered.

Wall numbers (national / table / wins, wave 4–5
unlocks, median survival) are REPORT-ONLY on the
corpus; the arm is never judged on them (30-day
instances cannot observe national/table/wins —
reported as not claimed, never as zeros, per the
collision-b precedent).

## Sense test (SENSE-TESTING LAW)

At least one full staged fight tail is read end to
end (captured from startCombat entry through fight
end via the policy.fight wrapper) and judged on
whether the raid naming reads sensibly to a player
given the fight was in fact a staged wanderer
pending — i.e. whether a misfire reads smoothly
(invisible misattribution, as the collision-b sense
note predicts) or betrays itself.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

No balance-panel compare .md is produced, by the
same pre-registered analogy as raidname-b and
collision-b: this leg is a diagnosis on 30-day
instances, and panel metrics (national / table /
wins, wave reach) cannot move — and cannot even be
observed — inside 30-day instances. The judged
instrument is the staged corpus on identical seeds,
and the pre-registered DIAG bars above are the
judge.

## Metric review (MEASUREMENT.md §14 — filled in the evidence file, not here)

No band, substrate, threshold, staging clause, or
classification rule changes after this commit without
a prereg amendment committed BEFORE the judged leg
it governs. A miss is NO-GO, never re-scored
mid-run. If the metric proves wrong, it is written
under "metric review" in the evidence file and
proposed for the NEXT run.
