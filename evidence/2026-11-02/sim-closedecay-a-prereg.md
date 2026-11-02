# sim-closedecay-a — PREREG (written BEFORE any judged sim in this arm)

Arm: closecommit coalition decay trace, axis scale-onramp, blank (4) from
Loop A 1155Z review. Coordinator claim: fleshout-loop-a-20261102T1254Z
(sim-closedecay-a alongside sim-creekwide-a; sibling Loop B live on
food-economy — NOT touched; sibling trees NOT touched).

## Question (only this question; do NOT re-litigate roster cap,
## primary-arrears trap, or tend saturation — those are 1155Z findings)

1155Z's close + one-episode commit-own support leg on seed 97330 is
reported as: gate 11 at call day (8 allied + 3 commit-own) yet 0 fights,
with 12 MUSTER-GATE refusals on day 110 — i.e. the coalition allegedly
decayed below the fight gate between call and contact. Mechanism
unisolated. This arm isolates it with a daily muster trace.

## Arm under trace (exact reproduction)

closecommit = titanroute pilot stack + musterclose deepening leg
(recovered verbatim from the deleted musterclose branch's commit
ef378b534 — diagnosis reproduction only, NOT a re-landing of the killed
arm) + mustergap one-episode commit-own leg (current master
scripts/policies/mustergap.js, gap2 semantics). Zero src/js changes.
Policy/instrument only. The musterclose policy file is restored in this
worktree solely so the closecommit leg can be re-run; its killed verdict
from 1155Z stands unless this trace proves otherwise.

NOTE ON THE NUMBERS TO CHECK, NOT ASSUME: the mustergap-only records on
97330 (perseed-mustergap-b) show a different shape — gap2 gate 9 at
call day 85, refusals on days 86 and 121, not 11 / day 110. The 11 and
day-110 figures belong to the closecommit leg, whose per-seed records
were never merged (branch deleted). This trace must FIRST establish
closecommit's own call day, call-day gate, and refusal days on 97330
before any decay claim is judged.

## Primary metric (pre-registered, binds this arm)

The day-by-day gate decomposition on 97330 under closecommit, from call
day through the refusal/contact days, recorded by the driver instrument
(driver-side reads only; policies gain NO new reads):
- raw allied count (muster.allies.length) and raw Haven count
- LIVING-UNIQUE allied count (titanMusterReady's rule, replicated
  driver-side: deduplicated by villageId:vid, roster person alive and
  health > 0) and valid Haven count (in Haven roster, not the bearer,
  deduplicated) — i.e. the gate the engine actually judges
- titanMusterReady flag itself, per day
- per-face state for every muster face (muster hp, roster alive/health)
  so any face leaving the living set is dated and named
- per-link trust / opinion / arrears / quota / free-adult count, per day
- every MUSTER-GATE refusal attempt with the gate snapshot at that moment
- muster-hunger and night-strike say lines in the window (trust drains,
  which do NOT move the blade gate by themselves — recorded to rule
  them in or out)

## GO threshold for a mechanism claim (pre-registered)

A decay mechanism may be claimed ONLY if the trace names the
component(s) whose movement drops the judged gate below 10 (the herald's
minAllies), with dated values on at least 3 days (call day, a mid-window
day, a refusal day), AND the same dated gate series reproduces on 97330
under the identical arm in a second run (same seed, same arm, same
driver — determinism check, not a new seed).

If the trace shows the gate did NOT decay (e.g. the judged gate was
already below 10 at call day once living-unique filtering is applied,
or the refusals are a roster-availability / raw-vs-judged counting
effect, or the 11 / day-110 figures do not reproduce under closecommit),
that IS the finding — report it as such. Do NOT re-score it as decay,
and do NOT pool a different arm's numbers to rescue the decay story.

## Seeds, horizon, guardrails

- Seed 97330 first, 180d, death-aware (driver cap; run ends early on
  village-lost / win as the harness reports).
- Seed 97338 second ONLY if 97330 isolates cleanly (mechanism named
  under the GO bar above, or a clean non-decay verdict). 97338 is a
  check, not a pooled verdict.
- No policy-side fix is claimed in this arm unless the trace points to
  one AND a policy variant is prototyped and measured on identical
  seeds before/after. Instrument/diagnosis first.
- SENSE-TESTING LAW: read the transcript lines around the call and the
  refusals; judge meaning, not just counts.

## Metric review (for the NEXT run, not this verdict)

To be filled at closeout: whether raw-vs-living gate reporting, the
refusal line's allies-only "you have N" count, or the snapshot timing
(call-day snapshot after commit vs gate at contact) needs a standing
fix in audit drivers.

## Canon

docs/CANON.md read first; no canon doc covers the titan muster gate
decay specifically (MONSTER-WAVES.md covers wave law, not muster
accounting) — the gate math here is read from src/js/titans.js
(titanMusterReady, titanUniqueAllies, titanHavenBlades,
titanMusterUpkeep, titanEscalate), stated as code-read, not invented
canon. Hypotheses entering the trace (to be confirmed or killed by it):
(H1) allied faces leave the living set between call and contact
(roster death / health <= 0, filtered by titanUniqueAllies);
(H2) committed Haven blades leave the valid set (roster removal /
bearer change, filtered by titanHavenBlades);
(H3) the judged gate was never 11 — raw 11 vs living-unique < 10
already at call day;
(H4) trust drains (muster hunger -2/link/day, night strikes -5) do NOT
move the blade gate — recorded to exclude, not to claim.
