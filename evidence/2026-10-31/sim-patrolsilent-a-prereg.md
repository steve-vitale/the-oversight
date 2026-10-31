# sim-patrolsilent-a — PREREGISTRATION (written BEFORE any judged sims)

Arm: sim-patrolsilent-a, Loop A run fleshout-20261031T1415Z, axis
scale-onramp. DIAG ONLY: no game-code change, no policy-default flip,
no patrol-coverage fix landed. A fixable small lever, if found, is
documented as a next arm, not built here.

## Question (findings backlog B1, from sim-pocketdesign-a)

Seeds 85104 and 85107 record ZERO patrol assignTask attempts despite
nonzero deadfall hauls (5, 7) — the assignment never happened. Is the
binding constraint scholar-at-Haven upkeep presence, or combat-cred
availability? Census needed before any claim about patrol coverage:
scholar presence (at Haven? on upkeep? away?) and combat-cred
availability (who holds it, who lacks it) on patrol-silent seeds vs
patrol-active seeds, seed by seed, with the assignment call path
traced (where assignTask is invoked from, and what gates it before
the attempt counter ever increments).

## Call path (traced from code BEFORE sims; instrument verifies it live)

- The ONLY assignTask caller in sims is the delegate policy's
  delegateBeat (scripts/policies/delegate.js), hooked on
  policy.upkeep, which the harness calls 3x/day before each
  doAction('wait') (scripts/sim-harness.js runDays).
- delegateBeat gate 1: scholar at Haven — Game.playerAtHaven()
  (src/js/game.js playerAtHaven: Manhattan distance from the
  village node <= 1 on the 9x9 grid). If false, the whole beat
  is skipped: zero attempts for every villager that part.
- delegateBeat gate 2 (per villager): already has an assignment
  this part -> skipped, no call.
- pickTask order (delegate.js pickTask, the pre-attempt funnel):
  hp < 40 -> 'rest'; specialistSkill cook/preserver >= 2 -> 'cook';
  fisherman/sailor -> 'fish'; farmer/gardener/botanist/herbalist
  -> 'garden'; carpenter/mechanic/engineer/tailor/seamstress
  -> 'mend'; teacher-ish occupation + 50% roll -> 'teach'; THEN
  hp >= 60 AND combatCred -> 35% 'patrol' / 25% 'hunt'; else
  need-based (water/forage/wood/stone/scout).
- combatCred (delegate.js combatCred): agency monsterKills > 0 OR
  combat occupation (hunter|soldier|police|marine|ranger|
  security|firefighter|boxer|mma).
- assignTask engine gates AFTER the attempt (trust gate >= 20 for
  patrol, wounded < 40 HP outdoor refusal) are DOWNSTREAM of the
  attempt counter and cannot explain zero attempts; they are
  recorded for contrast but never counted as pre-attempt causes.
- Non-assignTask patrol paths (residual in pocketdesign): deal /
  appeal direct assignment writes (game.js:4491, 4577) and
  task-lead auto-resolution (game.js resolveAssignments, taskLeads
  loop) — a patrol task-lead resolves patrol every part with no
  assignTask call and no assignments entry. The census records
  beat-boundary assignment + taskLead sightings so a silent seed
  is proven silent on ALL paths, not just assignTask.

## Primary metric

Per-seed, per-upkeep-beat census on the IDENTICAL S-PATROL stack
as pocketdesign (leadfeast + windefer + seatdrive + fullseat +
delegate + deadfall; FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1
WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 DEADFALL_B=1):
- beats total, beats with scholar at Haven (upkeep presence);
- per villager-beat at at-Haven beats: already-assigned /
  fit-first (cook/fish/garden/mend/teach pick) / cred-eligible
  (hp >= 60 + combatCred) / no-cred / hp<60 / rest;
- patrol assignTask attempts (all-task wrapper, caller captured
  from the stack) and beat-boundary patrol-assignment / patrol-
  taskLead sightings.

## GO threshold (DIAG-GO, judged exactly)

DIAG-GO iff ALL of:
1. Pilot (8 seeds, 85101-85108) completes with instrument errors
   0 on every seed AND instrument-neutrality proven ON THIS BASE:
   paired with-instrument / without-instrument runs (same seed,
   same stack, full horizon, instrument output to /tmp only for
   the without leg) give IDENTICAL dayHash sequences on seeds
   85104 (silent) and 85108 (active). Any hash mismatch = NO-GO,
   investigate, never re-scored.
   AMENDMENT (pre-sims, 2026-10-31T14:47Z): the pocketdesign
   corpus anchor is 003a9c2f391e while this worktree's HEAD is
   19b3e1ae0 — the base moved since pocketdesign, so a hash
   match vs that corpus cannot be the neutrality gate (a
   mismatch would confound base drift with instrument effect).
   The pocketdesign corpus is instead a CROSS-BASE check
   (patrol attempts, deadfall hauls, days, wall flags compared
   with the base difference disclosed, never a hash gate), and
   the silent-seed fact itself is re-established on this base
   in the pilot: if 85104/85107 are NOT silent here, the
   verdict reports that the phenomenon did not reproduce on
   the current base, with the numbers, instead of answering
   a question about a vanished fact.
2. Silent seeds 85104 + 85107 each receive exactly one named
   binding constraint, supported by the census:
   - PRESENCE: at-Haven upkeep beats = 0 (or < 5% of beats), OR
   - CRED: cred-eligible villager-beats at at-Haven beats = 0, OR
   - FIT-FIRST: >= 90% of cred-eligible villager-beats consumed
     by a fit-first pick (a cred villager who is also a
     specialist/fisher/farmer/mender/teacher never reaches the
     danger branch), OR
   - MIXED: none of the above alone explains it — reported with
     the exact split, never forced into a single cause.
3. Contrast: >= 2 patrol-active seeds show the same table with
   nonzero patrol attempts, so the silent/active difference is
   visible in the same units.
4. Call path verified live: every patrol assignTask row's stack
   caller is delegateBeat (or the exception is named), and every
   non-assignTask patrol sighting (if any) is attributed to
   deal/appeal/taskLead.

A miss on any clause is NO-GO (DIAG-NO-GO), never re-scored
against a friendlier metric mid-run. Metric doubts go under
"metric review" for the NEXT run.

## Horizon + why

Death-aware, never fixed 200d: DAYS=200 cap, runDays early-ends
on over / village-lost / won exactly as the pocketdesign sweep
did, so trajectories are comparable seed-for-seed. The question
is about assignment over a village's life, not a fixed window;
a fixed 200d would over-count dead villages' silent tails.

## Seeds

- Pilot: 85101-85108 (contains BOTH silent seeds 85104, 85107
  plus active contrasts 85101, 85102, 85103, 85105, 85106, 85108).
- Confirm: full pocketdesign band 85101-85116 (16 seeds) if the
  pilot passes; never below 8.
- Policies: S-PATROL stack verbatim (see Primary metric). No
  other policy layer, no game change.

## What is NOT judged

- No before/after: this is a DIAG census on one base, not a
  lever arm. Stated honestly; no panel comparison is fabricated.
- Wall numbers (national/table/wins, wave reach) are reported
  where observable on this substrate (the sweep records them),
  never as 0s where unobservable.
- The adjacent pocketdesign parity note (patrols don't screen
  sickness while expeditions do) is NOT chased here; it is
  logged as a finding if the census touches it, nothing more.
- Sense-testing scope: this corpus records state, not
  narration; the people-read is scholar positions + assignment
  patterns (where the leader was instead of Haven, who got
  asked to do what). No transcript claim is fabricated.

## Panel (section 15)

NOT APPLICABLE, none fabricated — single-base DIAG measurement
on the pocketdesign band, not a before/after lever comparison
(same declaration as pocketdesign-a). A later lever arm reusing
this corpus as its baseline runs the panel then.

## Metric review

(To be filled at end of run; never a re-score of this run.)
