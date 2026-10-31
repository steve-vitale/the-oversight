# sim-sicktele-b (re-run) — PREREGISTRATION (written BEFORE any judged sweep)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T0007Z, arm sim-sicktele-b.
Parent: loop-B arm sim-starveplenty-b (run fleshout-loop-b-20261030T1030Z),
evidence/2026-10-30/sim-starveplenty-b.md observation 1; sim-findings #1514.
Backlog #1514 (sickness death-tele gap): starveplenty-b found elif_demir,
seed 9983, day 32: a sickness hurt row with died=true, living count 8→7
across day 32, elif absent from day-32+ meals — but NO death tele in
either instrument's death list (both list 14 deaths, neither includes
elif). This run's job: the living-count-delta vs tele-death cross-check.

PRIOR-RUN NOTE (read before judging): this worktree/branch already holds
a completed run of this same arm (run fleshout-loop-b-20261030T1332Z,
prereg evidence/2026-10-30/sim-sicktele-b-prereg.md, evidence
evidence/2026-10-30/sim-sicktele-b.md, commit e3491697c). That run
answered #1514: elif died in a contest via _cxKillContestant, which
never calls registerDeath — 2 gaps on 9983 (elif + marcus_webb), 0 gaps
on its 8-seed pilot band 10201-10208 — and was DIAG-NO-GO on ITS OWN
header (its clause (d) required a fresh-seed elif-class gap or a
non-death-exit refutation, neither of which held). This re-run does
NOT overwrite that run's files: all files below carry the
-20261031T0007Z suffix, and the prior prereg/evidence stay intact.
This re-run judges itself ONLY against the GO threshold in this file
(the brief's threshold, which differs from the prior run's header),
on a FRESH census band the prior run never swept, plus a 9983
reproduction at the CURRENT head. If the current head has moved the
9983 trajectory, the divergence is reported, not hidden, and the
gap verdict rests on the current-head traces (precedent:
docs/SIM-INSTRUMENTS.md rule 248 — controls live inside the sweep;
old trajectories are perishable).

Base pin (full HEAD hash at prereg time): f52f08600550b0da8159849ffcfd5665c75e04f0
Branch: sim-sicktele-b (worktree ~/workspace/worktrees/sim-sicktele-b).
Policy: competent (scripts/policies/competent.js), same as the parent arms.
Horizon: 180d death-aware (run ends early on village-lost / over; dead
villages stop simulating). Never a fixed 200d. Same substrate/horizon
as starveplenty-b (180d death-aware, competent).

## Instrument (zero src/js; recorder/analyzer only — reused, not rewritten)

scripts/trace-sicktele-b.js (committed by the prior run; reused verbatim):
record-only wrappers on Game.tele (death teles), Game.registerDeath,
Game.removeVillager, Game.hurtVillager (THREE separate post-hit death
signals — healthAfter, getPerson.dead, vpOf.dead — plus roster
membership; never collapsed into one `died` flag), Game.villageEats
(daily entry snapshots), Game.say (filtered lines). No RNG rolls, no
state initialization, no healing, no damage changes inside wrappers.
Usage: node scripts/trace-sicktele-b.js <seed> 180 <out.json>, one
process per seed, sequential.
scripts/analyze-sicktele-b.js: classifies every roster exit into
exactly one bucket — TELE-DEATH | REGISTER-NO-TELE |
REMOVAL-NO-REGISTER | NON-DEATH-EXIT | UNEXPLAINED-DELTA. A
"delta-death" is an exit in the first three buckets where the person
is dead by end of run (fallen entry, lethal hurt row healthAfter 0,
or a removal with how killed/ambushed). An "unmatched living-count
death" is a delta-death with no matching death tele (gap=true):
buckets REGISTER-NO-TELE, REMOVAL-NO-REGISTER, or UNEXPLAINED-DELTA
with a dead person.

## Primary metric (pre-registered, binds this run)

Per seed, over the full run: D = number of delta-deaths; T = number
of delta-deaths with a matching tele death. Gap rate = (D - T) / D,
reported only when D >= 1. Classification coverage = exits placed in
a named bucket / all roster exits. Every exit must land in a bucket;
an exit that cannot be bucketed is UNEXPLAINED-DELTA, never dropped.
The census table reports, per seed: days, end, exits, named,
delta-deaths, gaps (with vid, bucket, mechanism per gap), gap rate,
phantom-lethal count.

## DIAG-GO bar (binding — use exactly this)

DIAG-GO iff the 9983 elif gap reproduces on re-run AND the census
finds >=1 unmatched living-count death on at least one further seed
with a named distinguishing pattern (cause, phase, or instrument
path); otherwise DIAG-NO-GO with the census table as the answer.
"Reproduces" means, on the current-head 9983 re-run: elif_demir
classifies as a delta-death with no matching death tele (gap=true)
with its firing wrapper record quoted (which wrapper, which
how/cause, which day). A miss is NO-GO — never re-score against a
friendlier metric mid-run; metric doubts go under "metric review"
in the evidence file and apply to the NEXT run only.

## Legs (fixed up front, never re-screened)

1. REPRODUCTION: seed 9983, competent, 180d death-aware. Fidelity
   check against the prior 9983 trace (39 days, village-lost, same
   14 tele deaths) reported explicitly; divergence, if any, is
   reported and the gap verdict rests on the current-head trace.
2. PILOT CENSUS: 8 fresh seeds (10211-10218), competent, 180d
   death-aware, BEFORE any confirm spend. These seeds were never
   swept by the prior run (its pilot was 10201-10208; its prereg
   named 10211-10226 only as an unspent confirm range).
3. CONFIRM: none pre-planned. This brief's bar needs only the pilot
   8; a confirm would be spent only if the pilot band itself were
   unclassifiable (coverage < 90% pooled), in which case the reason
   and the added seeds are recorded before sweeping them. Pilot 8
   is never below 8 seeds.

## Balanced panel (§15) — explicit applicability statement

NOT APPLICABLE to this DIAG instrument, with reason: §15 governs
before/after comparisons of a lever (candidate vs baseline through
the balanced panel). This arm has no lever, no candidate root, and
no game change — it cross-checks two instruments (living-count
deltas vs tele deaths) inside single runs. No paired compare is
expressible, so no compare .md is attached. Precedent: prior DIAG
arms declared §15 non-applicable with reason on the same grounds.
If a future follow-up lands a src/js fix for the gap, THAT arm's
before/after re-run of this cross-check is the panel-eligible
comparison, not this one.

## Sense test (SENSE-TESTING LAW)

Read the say lines + removal/tele records around every gap event,
including the death narration/transcript around elif day 32, and
judge whether a player would know she died — not just counts. A gap
where the village never registered anything is a departure or a
phantom, not a missing tele; a gap where the story says the name
but the books hold no grave is a record gap, and is reported as such.

## Canon

docs/CANON.md read first; docs/DISEASES.md for sickness systems (two
pools, never mix; villageSicknessTick is the only 'sickness' hurt
caller). No canon doc covers tele/death-registration plumbing; that
absence is stated here, not filled by invention. The mechanism
answer comes from the wrapper records + the code paths they name.

## Out of scope (do not touch)

Zero src/js changes, zero policy-default flips, zero game changes.
If the tele gap's cause is found in code, document it precisely; do
not land a game fix in this arm. No merges, no rebases, no pushes,
no version bumps, no live verification — the coordinator lands.
No concurrent jest; only this arm's own node proof test is run
(sibling Loop A is live — avoid contention).

## Metric review (placeholder — filled at run end, §14)

Filled in the evidence file at run end. No revisions apply to this
run's numbers.
