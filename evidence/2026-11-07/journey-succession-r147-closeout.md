# Journey succession r147 — TIMEOUT CLOSEOUT (main session, 2026-11-07 ~06:00Z)

Run r147 (Lane B, leg 7 succession) did NOT complete before the 3600s cron
timeout. This note is the closeout record; the run note itself was never
written. Rotation-b stays 7 (succession) — the next Lane B run replays this
leg and picks up this branch.

## Liveness verification (main session)

- Lock `playtest-loop-2.lock` read: run_id `2026-11-07T04:55:44Z` — the dead run.
- Registry heartbeat for `journey2-succession` frozen at `2026-11-07T05:54:10Z`
  across re-checks (05:58, 06:00Z); no heartbeat-loop process; zero node
  worker processes with cwd in the worktree. The worker's report said
  "heartbeat stale" — correct in substance (frozen, no workers), though the
  last heartbeat was only minutes old at report time. Dead by the closeout
  rule (frozen heartbeat + zero workers across re-checks). The 00:00 CST
  occurrence stood down on the overlap guard, as designed.
- Main tree clean; master tip `41007b9d4` (Loop B 0420Z coordinator commit)
  at closeout. This branch is based at `06b93e063` (pre-0420Z master) and
  must be REBASED onto current master by the next run before any merge.

## What the run did (preserved here, branch kept)

- Carried question: r146's ASK_FAVOR dry-line class, finding line 1827 in
  sim-findings.md (reproducing seeds 33803/33806; r146's guard covered only
  dlg:details at stage >= 2). Prereg:
  `evidence/2026-11-07/journey-succession-r147-prereg.md`.
- Before-leg reproduction on 33803/33806 ran (saydumps, transcripts, tele
  JSONs in this commit). The r147 repro confirmed the mechanism: Katarina
  d+30, water_haul, dlg:details at stage 0 dried through the unguarded
  `ask_favor.engageBeat` return of the single `favor.whyLine`.
- Fix: source-level guard in `src/js/convo-wants.js` (+23/-1). When the
  whyLine is ledger-blocked, the favor names the live need fresh via
  `convoFavorNeedLine` (if that too is unblocked); only then does the
  whyLine go back to the caller, whose existing fallback answers. Same
  shape as r146's dlg:details guard, moved to the source so no caller
  (dlg:details any stage, dlg:help, conversation.js engage paths) can
  miss it.

## What main session verified in closeout (proof only, NOT a panel)

- `scripts/test-journey-succession-r147-askfavor-engage.js`: ALL GREEN
  (re-run by main session in the worktree).
- `scripts/test-journey-succession-r146-askfavor.js`: ALL GREEN (re-run
  by main session in the worktree).

## Explicitly NOT done — this commit is UNPROVEN at panel level

- After-leg re-runs on 33803/33806 on fixed code: NOT run.
- CAP-NC panel 33901–33908: NOT executed.
- Telemetry deviation check: NOT performed.
- `check.js --quick` gate: NOT run.
- Evidence run note: NOT written (this closeout note stands in).
- Rotation-b NOT advanced (stays 7).

## Next run (succession replay)

Rebase this branch onto current master, re-run BOTH proof tests, run the
after-leg seeds (33803/33806) on fixed code, run the CAP-NC panel
33901–33908, run the telemetry deviation check, run `check.js --quick`,
and merge ONLY if green. Do NOT merge this commit as-is.
