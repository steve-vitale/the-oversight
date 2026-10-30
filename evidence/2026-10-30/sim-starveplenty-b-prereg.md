# sim-starveplenty-b — PREREGISTRATION (written BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T1030Z.
Axis: food-economy. Arm: sim-starveplenty-b — DIAG ONLY, measurement.
Zero src/js changes, zero policy-default changes, zero game-code changes,
zero default flips. Backlog item #1492 (sim-findings.md, 2026-10-30,
loop-B arm sim-wall-b): STARVATION AFTER PLENTY — seed 9983 starves
day 39 nine days after an 8,940 kcal pantry reading at day 30.

Base pin (full HEAD hash at prereg time): 56b4cbe74aca227a354cdb2db5440a3514253876
Branch: sim-starveplenty-b (worktree ~/workspace/worktrees/sim-starveplenty-b).
NOTE — base moved since the wall snapshot: wall base pin was
70ae4c83cd2f336ade00f5a2b8521f2003d0c952. Per docs/SIM-INSTRUMENTS.md
rule 248 (controls live inside the sweep; old trajectories are
perishable), the trace run below is FIRST checked for fidelity against
the wall corpus (same death sequence, same starvation day/villager).
If it diverges, the divergence is reported, not hidden, and the
mechanism verdict rests on the current-HEAD trace + the fresh census.

## Primary question (the only judged question)

What mechanism starved seed 9983's villager on day 39, nine days after
a day-30 pantry reading of 8,940 kcal — and is it a pattern or a
one-off? Classification taxonomy (pre-registered, applied identically
to the trace and to every census starvation death):

- away-from-haven: the starving villager's meal days in the final 7
  days ran the packMeal path (v.away[vid] set), so the haven pantry
  was unreachable whatever it held. (Precedent: sim-rotsensor-b
  resolved a drawn=0 death this way.)
- knowledge: at-haven, but the pantry at the villager's own meal turn
  held no fresh edible candidates (kcalEach>0, unspoiled) — the total
  was unknown flesh (kcalEach 0, never reaches pantryDraw) and/or
  spoiled stock — while the headline total looked plentiful.
- timing/roster-drain: at-haven, fresh candidates existed at the
  day's start but were gone by this villager's meal turn (scholar's
  villageMeal + earlier roster eaters drained a thin pantry first;
  rotsensor-b's Ingrid case is the precedent shape).
- production-cliff: at-haven, pantry genuinely ~0 at the villager's
  turn AND own production ~0 (villagerDayProduction near zero), so
  the meal failed for lack of both channels — the "plenty" reading
  was days earlier and the pantry had since been eaten down.
- low-health-compounded: none of the above explains the meal failure
  alone, AND the villager entered its starving days at health < 50
  from wounds/sickness, so 8/day starvation hits (plus the 4/day
  famine block when the pantry is bare) finished an already-dying
  villager. Recorded as a compounding factor alongside any primary,
  never as a standalone primary when a food-access failure is present.
- other: none of the above fits; the exact missing instrument or
  unexplained event is named instead of forcing a class.

Precedence when several fit: away > knowledge > timing/roster-drain >
production-cliff; low-health-compounded is always reported alongside
the primary, never instead of it. A death counts as "starvation after
plenty" for the census iff the pantry held >= 5,000 kcal at some
villageEats-entry reading within the 7 days before the death day
(day-start pantry total, items summed, spoiled included — the same
headline number the wall snapshot quoted).

## DIAG-GO bar (binding)

DIAG-GO iff BOTH hold:
(a) 9983's starvation is traced to ONE named mechanism above with
    event-level evidence (dated meal rows, pantry readings, away
    flag, health trajectory, knowledge state for the starving
    villager), read end to end under the SENSE-TESTING LAW; and
(b) the fresh census below is classified (counts + share per
    mechanism, or explicit zero-recurrence with the census spec).
If the trace cannot name a mechanism, DIAG-NO-GO with the exact
missing instrument named. A census with zero starvation-after-plenty
deaths is a valid classified result (zero-recurrence), not a failure
to measure — it answers "one-off" directly.

## Legs (fixed up front, never re-screened)

Leg 1 — DEEP TRACE, seed 9983 only, competent defaults, 180d cap
death-aware (harness stops at Game.over; the wall run ended day 39).
Instrument: scripts/trace-starveplenty-b.js (shared sim-harness.js,
never copied eval boilerplate). It wraps, record-only, Game
methods villagerMealDay / villagerDayProduction / pantryDraw /
packMeal / villageMeal / villageEats / hurtFromStarvation and
records per-day, per-villager meal rows (produced, need inferred
from ate/drawn, drawn, away flag, hunger/health before/after from
plain state reads, pantry total + fresh/spoiled/unknown split at
each meal turn) plus daily villageEats-entry pantry, living-roster
count, hungryDays, and the starving villager's knowledge state
(codex plants count, village sharedKnowledge keys) and pack
contents when away. No wrapper calls a Game helper that rolls RNG
or initializes state; wrappers record arguments/returns and plain
state-field reads only. Fidelity check (not a judged metric, a
validity gate): the trace run's death sequence must match the wall
corpus seed-9983 death list (14 deaths, final villager starvation
day 39, gen_a29exbk) — if it diverges, the trace is still reported
but flagged DIVERGED, and the mechanism verdict leans on the census.

Leg 2 — FRESH-SEED CENSUS, seeds 9991–9998 (consecutive, never used
by the wall band 9981–9988; chosen here, before seeing any result),
competent defaults, 180d cap death-aware, same instrument (same
process-per-seed sequential pattern as the wall sweep; one node
process per seed to respect the never-two-harnesses rule). For each
seed: all villager starvation deaths, pantry-within-7-days test
(>= 5,000 kcal), mechanism classification per the taxonomy above,
plus census totals (villager starvation deaths, starvation-after-
plenty deaths, per-mechanism counts + shares).

Policies (exact, both legs): scripts/policies/competent.js,
defaults only, NO env flags (COMPETENT_WARM default ON, all
COMPETENT_* / VINEBANK / SNARETEACH defaults untouched; no
FEASTSCALE / WINPURSUIT / SEATDRIVE substrate). This matches the
wall spec exactly.

## Secondary sense note (NOT a judged leg, NOT chased as an arm)

Backlog #1495 (9983 end-state roster lists 7 vs village-lost flag):
the trace records, at the death day, per roster id: dead flag,
vpOf-identity match, health, away flag, and applicant vs member
status as far as plain state reads show it. Reported as what the
trace shows about the wrinkle; no separate instrument, no fix.

## Balanced panel (§15)

No panel compare .md is produced, for the wall precedent's reason:
a compare needs a before/after lever pair and this arm has no lever
pair — it is a diagnosis, not a lever. Comparing a single arm to
itself would be a fabricated artifact. The identical-seed trace
fidelity check (leg 1 vs wall corpus) and the fresh census (leg 2)
are the §15 substitutes for this diag, stated here per the prereg,
not hidden.

## Proof

scripts/test-starveplenty-b.js: prereg seeds present in outputs;
trace death sequence vs wall corpus reconciliation (match or
explicit DIVERGED flag); census per-seed rows reconcile to
classified totals; every classified starvation-after-plenty death
carries a named mechanism + its proving events; no src/js file
differs from HEAD (diag-only guard).

## Metric review (section required in every evidence file)

Pre-registered metrics bind this run (§14). No re-scoring: the
DIAG-GO bar above is judged as written. Any metric that proves
wrong (e.g. the >= 5,000 kcal / 7-day plenty window misclassifying
a death, or the pantry headline total proving to be a stale
day-10/20/30 snapshot number rather than a daily reading) is
written under "metric review" in the evidence with a revision
proposed for the NEXT run, not applied to this one.
