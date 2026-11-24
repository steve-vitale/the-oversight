# Journey landing r158 — prereg (Lane A, leg 0)

Run: playtest-loop-a-20261124T0759Z. Leg 0 landing, horizon DAYS=28
(driver scripts/journey-landing-r62-20261027.js, the r155/r156/r157 panel driver).
Rotation-a read 0 at run start; leg played is landing. Next index 1 after merge.

## Question
Does the contest-death ledger gap filed by landing r155 reproduce, and does
the fix close it? r155 found, on seed 1364: Tanya died day 27 in a Duel and
the contest ledger entry stayed open — endDay null, outcome null at day 28 —
because `_contestDie` never emits `contest_end` telemetry. The ledger is built
from `contest_fired` / `contest_end` tele rows, so any contest ending in death
(or refusal, or an arena loss) never closes. An unclosed entry also swallows
later deaths into its span (the autopsy span rule treats endDay null as
open-ended), so the gap corrupts death attribution, not just one row.

Root cause (verified in code before playing): the only `tele('contest_end')`
in src is in `_contestEnd` (contests.js:5232). Three terminals never touch it:
`_contestDie` (player + watched death), `_contestRefuse`, and the arena-lost
branch of `_contestArenaAfter`. Same class as the held-counter gap the
`_cxCountHeld` comment documents (r12): "every end path flows through here"
was false for the counter, and it is still false for the end telemetry.
`_contestResolveOthers` also emits nothing for co-taken fates, but those ride
on the same contest object, so closing the terminal closes the contest.

## Fix (planned, in worktree before the panel)
Emit `tele('contest_end', { id, outcome })` — the exact shape `_contestEnd`
emits — from the three missing terminals:
- `_contestDie`: outcome 'died', placed after the `_dieLanded` per-participant
  guard so a re-entrant death emits nothing twice.
- `_contestRefuse`: outcome 'refused'.
- `_contestArenaAfter` lost branch: outcome 'died'.
`_contestEnd` itself is untouched (its per-contestant emission in multi-take
is existing analyzer-visible behavior; the ledger tolerates multiple ends per
contest via its endDays array).

Proof test scripts/test-contest-end-tele-landing-r158.js (new): watch-death,
player-death (+ re-entry emits once), refusal, arena-loss, and a control that
`_contestEnd` still emits. Red on base, green on the fix.

## Pre-registered metrics (binding, MEASUREMENT.md §14)
- M-PR1 (primary): on the r155 panel band (seeds 1362–1371), TERMINATED
  contests left open in the ledger: a ledger entry with endDay null whose
  contestId has a recorded contest death (state.contestDeathsById[id] > 0,
  or a contest death autopsy naming that contestId). Bar 0. r155 baseline:
  1 (seed 1364 duel — Tanya died d27, endDay null). A miss is NO-GO, never
  re-scored. NOTE: a bare "endDay null" count would false-positive on a
  contest legitimately still in progress at the horizon (r157 had 1: the
  1388 Siege, still active at d28); the death-join is what makes an open
  entry a defect rather than an unfinished show.
- M-PR2: every contest death autopsy with context LEDGER has a non-null
  contestOutcome; bar 0 nulls (r155: the day-28 duel deaths carried null).
- Stay-green watches (carried from r62): System contact <= d10; 0 starvation
  deaths; plenty-voice present; villages alive at d28 unless killed by a
  contest/monster (death-aware horizon, +10d tail max).

## Seeds / policies
- Pilot: seed 1364 alone (the exact r155 reproduction) on BASE first, then on
  the fix. If the pilot does not reproduce on base, stop and document — do not
  burn the full band.
- Full panel (only if pilot reproduces + fix closes it): seeds 1362–1371,
  policy competent verbatim, DAYS=28.
- Seed band freshness: 1362–1371 was the r155 panel band; re-running the SAME
  band is the point (before/after on identical seeds). No other run has used
  1362–1371 since r155 (r156: 1372–1381, r157: 1382–1391).

## People check
Read full transcripts for at least one seed: do villagers act like people in
the first fortnight (sense-testing law)? Note any contest-death grief lines
after a ledger-closed death.

## Verdicts
Reachable / fun / winnable for the landing leg, in plain words.

## Metric review (filled after the run)
- (to fill)
