# Journey Endgame r35 (Lane B) — seated audit names w4/w5 deeds

Run: lane-B endgame r35, 2026-10-21. Coordinator timed out at the 7200s cutoff;
recovered by main agent (proof re-run 15/15 GREEN, wiring verified).

## Pre-registered header
- Leg question: after the Table is announced and a village with wave-4/5 deeds
  sits, does the seated audit read the run back honestly?
- Interesting finding: r34 blank #1 (documented, no game-code change) — the
  lesser-seat audit hardcoded "waves 1–3 faced" (table.js:486); villages that
  bled for w4/w5 deeds in the overtime window hear an audit that pretends those
  deeds don't exist. TABLE.md canon: "The pricing beat reads the run aloud."
- Seeds: 81001 (full seat, won), 81002 (binding lesser seat, w4=5 w5=0,
  auditNamed=true, won); 81003/81004 still running at coordinator timeout.
- Bar: audit line names nonzero w4/w5 counts; byte-identical to old voicing
  when there are none; pricing unchanged.

## Blank filled
- table.js: tableSeat()'s detail now counts w4/w5 deeds (was w1–w3 only).
- New Game.tableSeatLine(seat) helper builds the audit seat line:
  full seat names every wave; lesser seat names w4/w5 counts when nonzero;
  with no w4/w5 deeds the line is byte-identical to the old voicing.
- tableScene calls tableSeatLine (wired, verified by grep + check-wired).
- progression.js: comment updated — the lesser-seat Arc IV line names w1–w3
  (the ones the lesser bar checks); w4/w5 deeds, when faced, are named in the
  seated audit.
- Voicing only — pricing unchanged. [needs-eyes] (player-facing audit text).

## Proof
- scripts/test-tableaudit-20261021.js: 15/15 GREEN (re-run by main agent
  after coordinator timeout; no env required).
- Fixtures touch only real stores the engine reads (fixture pattern from
  test-fullseat-superset-20261014.js).
- Regression suites: 274 pass / 3 known pre-existing phone-frame staleness
  failures (per coordinator report, unchanged).

## Village assessment (partial — pilot only)
- Seed 81001: full seat won. Seed 81002: binding lesser seat (w4=5, w5=0,
  auditNamed=true) won. Seeds 81003/81004 were still running at cutoff and
  were NOT completed — no claims made from them.

## Metric review
- Pre-registered bar met on the completed pilot seeds. The run's planned
  analysis/telemetry/village-census/people-sense-read steps did not run —
  they are documented here as incomplete, not scored.

## Recovery note (main agent)
- Uncommitted game-code (table.js, progression.js) + untracked scripts and
  evidence were left in the worktree by the timed-out coordinator. Recovered:
  proof re-run GREEN, wiring verified, committed via safe-commit, rebased onto
  current master (incl. origin 00412b13f merge), merged ff-only, tree released,
  lock deleted, rotation advanced.
