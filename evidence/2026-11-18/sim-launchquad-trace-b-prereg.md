# sim-launchquad-trace-b — PREREG (diagnostic for finding #2511)

**Arm:** sim-launchquad-trace-b · **Loop B run:** fleshout-loop-b-20261118T0330Z
**Type:** DIAGNOSTIC — no new sims unless the frozen corpus lacks the rows
to trace with; no game-code change (`src/js` untouched). If the trace shows
a game-code defect with a clear fix, document it as a finding — do NOT
build the fix in this arm.
**Frozen:** 2026-11-18 04:28 UTC, BEFORE any judged analysis (rows already
read for orientation only: the three evade rows and their launch rows as
quoted in the task brief / evadeclass evidence; no mechanism verdict has
been formed).
**Branch tip at freeze:** `sim-launchquad-trace-b` (worktree
`~/workspace/worktrees/sim-launchquad-trace-b`).

## Question (finding #2511, top tracker blank)

A launched quad never fielded four at a meeting on the allycap band —
does the launched party scatter en route, or does `villagerFightAllies`
just return whoever is near at the meeting? This blocks the partysize
B2 re-judgement (the 4th seat cannot show damage in a meeting it never
reaches).

## Corpus (frozen, existing — read-only)

sim-partysize-allycap-b corpora, band 103601–103608 —
`evidence/2026-11-17/perseed-partysize-allycap-b-ctl/` (8 seeds) and
`...-arm/` (8 seeds). Substrate: PARTYSIZE4=1 both legs; ctl =
FIGHTALLY2 off, arm = FIGHTALLY2 on; policy competent verbatim; horizon
150d death-aware.
**Corpus-location correction:** the corpora are NOT on master in this
worktree (its base predates the allycap landing); they live in the
sibling worktree `~/workspace/worktrees/sim-partysize-b/evidence/2026-11-17/`
and are read there, never written. The tracer takes corpus dirs as
arguments (defaults to the in-repo paths) so it still runs once the
allycap corpus lands on master.

## Population (frozen, from sim-evadeclass-b)

Three launched evades, all origin `expedition`, outcome `evade`,
rounds 0, dealt 0:

| # | Leg / seed / day | Fighter vs species | Launch (day, size, target) | Meeting party (sensed) |
| --- | --- | --- | --- | --- |
| E1 | ctl / 103606 / d77 | Mateo Alvarez vs The Eulogy (w4) | d61, size 2, target eulogy; party [Mateo], holder gen_a48xjkw absent at meeting | 3 (Mateo + gen_a7suqzn + elena_petrova) |
| E2 | arm / 103604 / d49 | Ivy Wang vs The Audit (w4) | d46, size 4, target audit; party [benoit_lambert, naran_tumen, gen_ke7f7nq] | 3 (Ivy + gen_256ihks + gen_x833x9m — NEITHER a launch companion) |
| E3 | arm / 103604 / d53 | Ava Garcia vs The Audit (w4) | d49, size 4, target audit; party [benoit_lambert, ava_garcia, naran_tumen] | 3 (Ava + benoit_lambert + ivy_wang — a subset of the quad) |

Trace order: E2 first (cleanest case), then E3, then E1 if time permits.
Launch join: reuse the analyzer's join loop (first match on
vid/party/allyVid membership) — seed 103604 launched THREE parties on
day 49, so a naive find-by-day grabs the wrong launch. Do NOT invent
distances (finding #2512: no distance/terrain field on encounter rows —
never infer them from plan nodes). The corpus cannot tell whether the
E2/E3 Audit is one spawn wounded or a second spawn — do not claim
either unless the trace settles it.

## Primary metric

**Classification completeness for the traced quad(s):** depart roster,
daily roster (if the corpus carries it), meeting party, mechanism
verdict, with EVERY claim tied to a cited recorder row
(file + seed + day + row fields).

## GO bar (frozen — judge the run against this header)

**GO iff at least 1 quad is fully traced with the mechanism named and
every claim tied to a cited row.** Mechanism verdicts (frozen rules):

- **SCATTER** — the corpus (or fresh tracer sweep) shows the launch
  roster together at depart and apart before the meeting: e.g. a
  launch companion meets/fights elsewhere, dies, or is recorded at a
  different encounter between launch day and meeting day while the
  holder proceeds — cited rows for both the together-state and the
  apart-state.
- **ALLY-PICK** — the code path shows the meeting party is computed
  at the meeting from proximity/sense (`villagerFightAllies` /
  field-fight ally join) with NO expedition-roster state carried from
  the launch, AND the corpus rows are consistent (meeting allies are
  whoever was near, launch companions absent with no apart-state row
  needed) — cited code lines + cited rows.
- **OTHER** — a named third mechanism with cited rows/code (e.g. the
  launch never formed a travelling party at all — depart row is only a
  dawn decision, no expedition object exists).
- **UNDECIDED** — neither the corpus nor the code settles it; the
  evidence must say exactly which row/field is missing and what
  recorder addition would settle it (fresh sweep design, not a claim).

A verdict of UNDECIDED with the missing field named is a completed
diagnostic (the bar is completeness + honesty, not a forced answer);
a verdict of SCATTER or ALLY-PICK asserted without cited rows is a
FAIL, not a GO.

## Method

1. Read the frozen corpus rows (`v4departs`, `v4encounters`, `v4gates`)
   and the code (`winPlanDepart`, `villagerFightAllies` in
   `src/js/party-wiring.js`, field-fight ally join) to see what exists
   to trace with.
2. Trace E2 first, then E3, then E1 if time permits.
3. If the frozen corpus lacks day-by-day expedition roster rows, run a
   FRESH tracer sweep on the SAME band (103601–103608, same substrate,
   150d, competent) with a recorder snapshotting the expedition roster
   daily — pre-registered here as the contingency, before running it.
   The fresh sweep is a recorder-only addition (no game-code change);
   its design (which state it snapshots, which days) is recorded in the
   evidence file if it runs.
4. Build `scripts/trace-launchquad-b.js` (tracer: depart roster →
   daily roster → meeting party → mechanism verdict per quad) +
   `scripts/test-launchquad-trace-b.js` (proof: fixtures for the join
   logic + a population check reproducing the 3 evades).
5. Evidence: `evidence/2026-11-18/sim-launchquad-trace-b.md` with a
   "metric review" section, sense-test quotes from the logs, village
   assessment in plain words, wall numbers inherited from the allycap
   run.

## Horizon, seeds, policies

- Frozen corpus: band 103601–103608, 8 seeds/leg, 150d death-aware,
  competent verbatim, PARTYSIZE4=1. No new sims in the primary path.
- Fresh tracer sweep (contingency only): SAME band/substrate/horizon/
  policy, recorder-only. Its results are reported separately and never
  mixed into the frozen-corpus verdicts.

## Canon

`docs/CANON.md` first, then `docs/MONSTER-WAVES.md` and `docs/PARTY.md`
for this area. No canon doc covers the sim recorder — say so in the
evidence file instead of inventing recorder canon.

## Wall numbers (inherited from sim-partysize-allycap-b — carried, not re-measured)

National 0/8 · table 0 · wins 0 · wave-4 unlock 7/8 ctl, 8/8 arm ·
wave-5 unlock 1/8 ctl, 4/8 arm · median survival 151d ctl / 148.5d arm.

## Convergence state (pre-run)

Axis (winnability chain): **not converged**. This arm is a diagnostic
for finding #2511; it moves no wall number and lands no game change.
