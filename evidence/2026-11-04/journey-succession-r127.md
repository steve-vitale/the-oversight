# Journey succession r127 — closeout note (main-session closeout of timed-out run)

Run: Lane B succession (leg 7), scheduled 08:00 CST 2026-11-04, worker timed out in
execution phase. Main session closed it out: orphan heartbeat loop (pid 11691) killed
after worker death established (no worker node processes; runtime timeout), evidence
committed, branch rebased onto master, ff-merged, tree released, rotation 7→4, lock
deleted. No game code changed (instrument + evidence only).

## Verdict: r123's expedition-death funeral miss is an instrument artifact, not a game gap

Carried seed 33204 re-run resolves the question r123 left open. The in-call buffer
captures the death beat (d23: "Jacob Winkler is dead — the expedition", 28 lines,
inCall entryDay 23, cause "the expedition"), corpse recovered/buried, grief present
in conversation. The surviving capped log shows windowSliceN=0 with
sayLogLenAtFinish=15,000 — the d23–d25 slice was evicted, so the r123 rule (which
reads the capped log) scored m1=false while the arc actually fired. The funeral arc
fires; the measurement was wrong, not the game.

## Pilot panel (33301–33304)

4 seeds, all organic deaths (wild/stranger), in-call beats present, windows
non-empty. Instrument proven (FUNERAL-INCALL + EVICTION CHECK driver), but no "the
expedition" deaths in the pilot — the carried seed carries the verdict.

## People check

Full transcripts from carried seed (Fritz d+3/d+7/d+14/d+30 panels): conversations
senseful — NPC want/engage/refuse/owe, grief by name, role promises, teaching
Pawpaw. Recurring driver artifact noted, not a defect: scout role ping-pong; r123's
"The Company" naming line still lands as party-wide.

## Outstanding (not completed — recorded, not hidden)

- check.js --quick not run pre-merge (evidence-only merge: no src/js changes, so no
  game regression possible from this commit; post-merge suite run is a standing
  verification, expected 284/6 families).
- Telemetry deviation check vs baseline succession.json not run (worker timed out
  before it; no baseline rolled).
- No new design work; the only carried item was this procedural closeout.

## Files

Prereg, carried-seed record (33204.stdout.json), pilot panel records (33301–33304),
saydumps, telemetry JSONs, transcripts, and the r127 driver
(scripts/journey-succession-r127-20261104.js). Excluded from commit:
hidden_files/r127-heartbeat.log (heartbeat loop's own log, not run evidence).
