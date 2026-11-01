# sim-stay-a — PREREGISTRATION (binding, committed BEFORE any judged sim)

Run: flesh-out loop (loop A), run fleshout-loop-a-20261101T1555Z
(coordinator-assigned). Axis: scale-onramp (blocking axis, NOT
converged). Worker: sim-stay-a. Task: staying/morale + free-damage
ceiling (1415Z next blank 1, sharpened).
DIAG ONLY: zero src/js changes, zero policy-default flips, zero
game-code interaction. Deliverable: a measurement + a policy
instrument + proof tests, not a landing.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law; wave-4 band
damage 35–95, HP 850–1500, pierce 0.2–0.5; wave-4 gate standing >= 100)
and docs/PARTY.md (party concept: people follow or don't, based on
trust and their own goals; no trust gate on invites; party members
auto-join fights). No canon doc covers staying/morale or flee
mechanics — the mechanism below is read from code (fieldFights.js,
game.js), stated exactly so it can be checked, NOT invented canon:
- fieldFight flee is ENGINE MORALE, not a player choice: fleeAt =
  vBreak (bravery + temperament), hopeless trajectory from round >= 2
  (rounds-to-kill vs rounds-to-die, 0.85 factor), learn-intent
  withdrawal at round >= 3 when not winning, HP-floor flee, and the
  committed-finish 40% floor (set inside fieldFight itself, never by
  a caller). opts.noFlee seals CONTEST ARENAS ONLY (contestEngine);
  no wild/sortie/aid caller passes it, and no policy can set it
  without wrapping Game.fieldFight and mutating opts — which would
  be a game-code change smuggled through a wrapper, FORBIDDEN here.
- Allies in fieldFight come from ONE engine input: the caller's
  opts.allies/allyVids, built by resolvePatrol /
  resolveWildMonsterEncounter / aidFight / lingererSortie SOLELY from
  Game._outdoorCrew (resolveAssignments snapshot of assignments with
  task patrol/scout/hunt/forage), trust-sorted, allyVids capped at 2.
  The engine NEVER reads npcsOnNode(tile) for party-up
  (fieldparty-form-diag, 2026-10-28). At most ONE ally ever joins a
  fight (shout once, or allyFromStart via aidFight only).
  Intent is 'engage' iff trick known OR allies > 0, else 'learn'.
- The volley fires from the fighter's CARRIED ammo only.
  villagerPocketAmmo runs ONLY at departure sites (patrol,
  expedition) after gear-up, and returns early for the scholar
  (player pockets/crafts through the UI). sim-ammo-a (2026-10-31,
  DIAG-GO + lever NO-GO, reverted) proved: no scholar policy can
  express NPC pack management; the dawn at-home top-up game-code
  lever was tried and KILLED (0 ranged wave-4 fights on its corpus,
  primary unmet). This arm does NOT re-litigate it.
- PARTY.md's "party members auto-join fights" is the PLAYER'S party
  (post-System invites), a different system from fieldFight crew
  allies. The two are never conflated here.

## Mechanism verdict BEFORE the pilot (what the policy can honestly do)

The 1415Z corpus (sim-wave4leth-a, 67 offered / 65 fought wave-4
fights, seeds 75101–75108) contains ZERO scholar-led fights: every
leader is a villager. A daily policy drives ONLY the scholar, so:
- (a) "never voluntarily flees": NO honest policy mechanism exists.
  There is no mid-fight player flee choice to refuse, and the engine
  morale inputs (vBreak, hopeless trajectory, learn intent) are not
  policy-settable. Any policy claiming to hold the line by mutating
  fieldFight opts would be a game-code change, not a policy.
- (b) "engages allies actually present": the ONLY policy-reachable
  input is crew composition — Game.assignTask is the leader's core
  verb (in-person at Haven; obedience-gated; wounded < 40 HP refused
  outdoor work), and crew membership IS the engine's presence model
  ("villagers on outdoor tasks are out in the wild together this
  part"). Assigning free villagers to patrol enlarges the crew, which
  raises engage-intent (allies > 0) and shout availability. It does
  NOT change tile co-location (engine never reads it) and does NOT
  change the one-ally cap or the never-targeted-ally fact (0/65
  fights with allyTaken > 0 on 1415Z).
- (c) "pockets arrows": NO honest policy pocket moment exists for
  villagers (sim-ammo-a: departure-only pocketing cannot reach
  fighters who never depart; policies drive the scholar only; the
  scholar's own arrowCraft already lives in competent). The policy
  therefore adds NO pocketing. Arrow carriage is re-measured as the
  secondary census below (backlog #1718 ammo sub-blank).
So the policy instrument is ONE honest layer: crew enlargement via
assignTask to patrol, capped, free-villagers-only, after the base
daily (so base water/wood/garden/fish assignments keep priority).
If the pilot shows no staying signal, the verdict is NO-GO with the
mechanism finding — NOT a re-scored bar, NOT a smuggled engine tweak.

## The policy instrument (scripts/policies/holdline.js)

Wraps scripts/policies/tableseat-nowait.js. Env-gated HOLDLINE=1;
unset (or not '1') delegates to tableseat-nowait.daily EXACTLY
(det-gate in the proof test: one-seed trajectory identity vs the
baseline leg). When on, after the base daily:
- Only when Game.playerAtHaven() (assignTask in-person rule; away
  days attempt nothing and count as away, never forced).
- Only roster villagers who are alive, not the scholar, and NOT
  currently assigned (never steals a base assignment).
- At most 2 NEW patrol assignments per day (cap); assignTask
  refusals (obedience, fitness, away) counted, never retried same
  day, never overridden.
- No other behavior: no gear, no food, no movement, no fight
  interception, no fieldFight wrap, no opts mutation, no roster
  reads for decisions (roster is read ONLY to enumerate assignment
  candidates the player could face-to-face assign at Haven — the
  assignment itself is the player action; ally selection inside
  fights stays entirely engine-side via _outdoorCrew).
- Counts recorded on ctx (hlAttempts, hlAssigned, hlRefused,
  hlAwayDays) for the evidence file.

## Band (identical seeds, same substrate, current base)

Substrate VERBATIM from sim-wave4leth-a (sortiedpr PLAYED band):
scripts/policies/tableseat-nowait.js, LEANLINKRESCUE=1,
TABLESEATNOWAIT=1, 180d death-aware (runDays stops on death/win;
+10d tail max), scripts/policies/fieldparty-form-diag.js reused
VERBATIM, plus the sortie-driver layer living ONLY in the sweep
script (once per lingerer episode, when a gorge line has been seen,
call answerLingerer('sortie'); NO HP GATE). This arm's sweep
(scripts/sim-stay-a-sweep.js) is the wave4leth sweep with ONE
change: a POLICY switch (baseline | holdline-off | candidate) and
the read-only ammo-diag instrument (scripts/ammo-diag-20261031.js,
AMMODIAG discipline, det-gate proven 23/23) installed IDENTICALLY
in all legs for the secondary census. Symmetric instrumentation:
any perturbation applies equally to both judged legs.
- Seeds: PILOT 75101–75108 (8 seeds). Legs: baseline (tableseat-
  nowait) + candidate (holdline, HOLDLINE=1). Det-gate leg:
  holdline-off on seed 75101 only (must reproduce the baseline leg
  exactly: days, wave reach, wave-4 fight identity).
- BASELINE RE-REGISTRATION: the 1415Z corpus is on the 1415Z base;
  this run re-runs the baseline leg on the CURRENT base and judges
  the candidate against the FRESH baseline, never against stale-base
  numbers. If trajectories drift vs 1415Z, the drift is reported and
  the fresh baseline still governs.
- Policy statement: competent-player policy = tableseat-nowait
  (baseline) / holdline (candidate). What party/gear it fields is
  MEASURED, not assumed.

## Primary metric and bars (judge against this header; a miss is NO-GO)

Primary metric: candidate-vs-baseline wave-4 fought-fight
decomposition on identical seeds — end-state shares, rounds
distribution, median sustained DPR (rounds >= 1), >=91-HP conversion
count, component damage shares, per-role death rates. Baseline
yardstick from 1415Z (for the bar family, NOT the comparator — the
fresh baseline leg is): median DPR 11.0, rounds 0:2/1:35/2:24/3:4
(max round 3), healthy-beast slice 63 fights 0 kills, shares
leader 99.0% / ally 1.0% / volley 0.0%, FLED 66% / DIED 25% /
DRIVE-OFF 8% / KILL 1.5%.
- G1 CORPUS-VALIDITY: 8/8 pilot rows in BOTH legs, days > 0 each,
  fieldparty diag errs 0, overflow 0, wrapper errs 0, ammo-diag
  instrumentErrors 0. Det-gate leg reproduces baseline seed 75101
  exactly (days, wave reach, wave-4 fight count + identity).
- G2 STAYING SIGNAL (ANY one; a live signal, not the landing bar):
  (a) >= 1 fought wave-4 fight reaching round >= 4 with party
  survival (outcome !== vDie); OR (b) >= 1 >=91-HP fight converted
  by damage (vKill, or mFlee with mDealt >= 100 — Peacemaker
  0-damage drive-offs do NOT count); OR (c) candidate median
  sustained DPR >= 22 (2x the 1415Z 11.0).
- G3 DEATH GUARD (binding): candidate vDie share <= baseline vDie
  share + 5pp (fought fights). If G2 is met but G3 fails, verdict is
  NO-GO with the finding "flees converted to deaths, not wins" —
  fewer flees converting only to deaths is a finding, not a win.
- G4 SENSE LEG: >= 1 DIED + >= 1 FLED transcript read + quoted
  from the CANDIDATE corpus and judged (desperate vs silent
  arithmetic, Steve's hard rule: violence desperate and traumatic).
  Field-death narration (#1719) is OBSERVATION ONLY — not chased.
- PILOT-GO = G1 + G2 + G3 + G4. Anything less = NO-GO, no confirm
  spend. A pilot GO earns ONLY a confirm on a fresh band, never a
  landing (DIAG arm; no landing is proposed here).
- CONFIRM BARS (pre-registered now, run only if pilot GO): fresh
  seeds 75111–75122 (12 seeds), same band, same legs. GO requires
  ALL: round-4+ surviving fights on >= 2 seeds; >= 1 >=91-HP damage
  conversion; median sustained DPR >= 22; death guard (vDie share
  <= baseline + 5pp); corpus validity as G1. Else NO-GO.

## Secondary census (backlog #1718 ammo sub-blank; reported, not judged)

Arrow carriage at contact for every wave-4 fight in BOTH legs, via
the ammo-diag instrument: carried-needed distribution, share with
carriedNeeded > 0, volley shots/damage, pocket-call + departure
history for dry fighters (departed-before-fight vs never-departed),
pile materials at fight time. No GO bar: this is a census on the
current base, comparable to sim-ammo-a's Stage 1.

## Wall numbers per leg (reported, never claimed as movement)

Won, national ever/final, table invited/entered, wave 4-5 reach,
median survival, death-cause shares, starvation count.

## Sense-testing law (transcripts read + quoted)

S1: up to three candidate-corpus wave-4 fight transcripts, by
end-state priority: a DIED fight first, then a FLED fight, then a
round-4+ or converted fight if one exists. Each quoted with
end-state, rounds, damage shares, per-role survival, and judged:
desperate and traumatic, or silent arithmetic? SENSE VERDICT:
DESPERATE / MIXED / SILENT-ARITHMETIC. If no candidate wave-4 fight
exists to quote, the sense leg FAILS and the verdict is
INSUFFICIENT-DATA with the failing leg named.

## What this arm does NOT do

No src/js change, no policy change to any default, no default flip,
no fight routing, no roster-fed ally decision (ally selection stays
engine-side), no fieldFight wrap that mutates opts, no push, no
bump, no live verification. No use, import, or build on any sibling
arm's branch. No re-judgment of predecessor verdicts (sortiedpr
DIAG-GO, fieldability DIAG-GO, allycap CLAIM-CONFIRMED, sim-ammo-a
DIAG-GO + lever NO-GO all stand). No wall movement claimed from
measurement alone. No panel artifact (standing exception: the panel
has no census-ingest mode; identical-seed paired tables are the §15
substitute, as in prior rounds). Instruments:
scripts/policies/holdline.js (policy), scripts/sim-stay-a-sweep.js
(band + wrapper + ammo-diag install), scripts/sim-stay-a-analyze.js
(analyzer + judge), scripts/test-sim-stay-a-*.js (proof tests).
Each must pass `node --check`; analyzer must print its verdict
after every run. Never run concurrent jest; cache dir
/tmp/jest-cache-sim-stay-a (no jest expected — node scripts only;
the rule is recorded, not waived). Never touch docs/ONTOLOGY.md,
sibling trees/branches, the lever-claims directory, the convergence
tracker, or any lock file.

## Infrastructure note (process only — no bar changed)

- 2026-11-01, pre-commit delay: the container EPERM write flap blocked
  every commit attempt for ~1h+ (background retry loop run ~22 min, then
  stopped on coordinator order). Blessed scripts/safe-commit.sh fails at
  `git read-tree` (private index under /tmp): `fatal: sha1 file
  '/tmp/idx-safecommit-*.lock' write error: Operation not permitted`.
  Coordinator-approved scratch copy (IDX relocated to
  $HOME/workspace/idx-sim-stay-a-$$, mass-deletion guard intact, no
  --force-delete, cd adapted to the copy's worktree-root location)
  ALSO fails at the same step: `fatal: sha1 file
  '/home/hatch/workspace/idx-sim-stay-a-*.lock' write error: Operation
  not permitted`. The flap is active on git lock files on BOTH /tmp and
  ~/workspace at this time — not a /tmp-only problem. Scratch copy
  deleted after the failure; worktree contains only the intended files.
  NO judged sims were run before this prereg commit (prereg-before-
  judged still binds; the prereg commit itself is what is blocked).
  A 180d baseline smoke on scratch seed 99999 (not a pilot seed, output
  to /tmp, discarded) ran the full sim cleanly and failed only at its
  terminal corpus write — the sim engine path works; writes are the
  blocker. When the flap clears, recovery is mechanical: commit this
  prereg file first, then the instruments, then run the legs.

## Metric review (filled at judging time)

- (to be filled when the analyzer runs)
