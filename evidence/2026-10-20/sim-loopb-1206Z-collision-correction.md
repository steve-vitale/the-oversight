# Loop B 1206Z — collision correction (coordinator, run fleshout-loop-b-20261020T1206Z)

Date: 2026-10-20 ~12:30Z. This file corrects the record left by the main-agent
timeout closeout of run fleshout-loop-b-20261020T0930Z (commits 0843e7793,
06507af47, 11e4193af + evidence/2026-10-20/sim-loopb-0930Z-recovery.md).

## What happened (collision timeline, all UTC 2026-10-20)

- ~10:02Z: run 0930Z's coordinator died mid-det-gate (heartbeats stale).
- 12:05:07Z: main agent began a timeout closeout of 0930Z (proof process pid
  4559, env WITHOUT FEASTSCALE_R13 — verified later via /proc/4559/environ).
- 12:06:04Z: THIS run (1206Z) created its lock + claim file and adopted the two
  orphan trees (sim-dutyfish-b, sim-retagrot-b) per the stale-lock protocol —
  registry heartbeats were >15min stale, the 90-min fallback applied. Two
  recovery workers spawned 12:08:01Z.
- 12:14–12:19:30Z: retagrot-b recovery worker ran the proof with the CORRECT
  env (FEASTSCALE_R13=1): 14/14 PASS, exit 0.
- 12:15:18Z / 12:17:15Z: main agent committed 0843e7793 (dutyfish-b
  INCOMPLETE) and 06507af47 (retagrot-b INCOMPLETE+BROKEN) — the latter WHILE
  the worker's proof was running.
- 12:20:48Z: main agent committed 11e4193af ("claim+lock cleared"), removed both
  worktrees and deleted both branches while both recovery workers were live.
- Both workers FAIL-LOUD-stopped per instructions; reported from memory.

This was a genuine race, not malice: two legitimate closers, one dead run.
The main agent started its closeout ~1 min BEFORE this run's lock existed and
never read this run's claim file. The structural lesson (same class as the
2026-10-09 same-owner landing race): check the lever-claims dir AND the
registry run_id AND live workers before removing any tree — a fresh claim file
is liveness evidence the registry heartbeat alone does not carry.

## CORRECTION 1 — sim-retagrot-b is NOT broken (06507af47's verdict falsified)

The parked verdict ("vmd wrapper never installs (G1a/G1b/G1d2 FAIL), re-tag
never fires; next run fixes wrapper installation") does NOT describe the
committed code. Verified twice:

1. Independent re-run by this run's recovery worker, 12:14–12:19:30Z,
   `FEASTSCALE_R13=1 node scripts/test-retagrot-b.js` on base 8de1b508b:
   **14/14 PASS, exit 0** — RED gate-off byte-identical 4/4; RED substrate
   gate loud STOP verified; GREEN all green (re-tag fired, 189,450 kcal moved
   / 40d; engine stockSurplus NEVER called armed-side; per-meal save/restore
   intact; vmd wrap installed exactly once, idempotent; CAPDOOR=1 defers;
   armed deterministic). Full report:
   hidden_files/sim-retagrot-b-recovery-report.md.
2. The partial pilot JSONs committed on master (evidence/2026-10-20/
   perseed-retagrot-b/) show the armed side re-tagging on real 180d runs:
   retag_days 128–181, retag_kcal 272k–575k per run. The wrapper installs and
   fires. Falsified twice.

Why the main agent's run failed: its proof process had NO FEASTSCALE_R13 in
its environment. The layer's substrate gate throws a loud RETAGROT STOP
without it, so GREEN could never pass — producing exactly the observed
G1a/G1b/G1d2 signature. (Its own dutyfish-b note acknowledges "the Usage-line
env; envless fails … by design" — the same env discipline was not applied to
the retagrot-b run.) The "never installs" mode matches the FIRST layer draft's
known transient-wrap bug — documented IN THE PRE-REGISTRATION ("verified by a
failing G1b on the first layer draft") — not the final persistent-wrapper code.

TRUE STATE: proof-green (14/14), det-gate 0/16, pilot unrun, sense PASS
(60d armed transcript read; honest rotating voice lines; villagers act like
people). Unjudged — binding metrics (PRIMARY pooled fast-rot ≤0.8x
armed/control; guardrails) untested. **NEXT: resume from det-gate in a fresh
worktree. Do NOT "fix the wrapper" — there is no bug.**

## CORRECTION 2 — sim-dutyfish-b det-gate is 2/64, not 0/16

This run's recovery worker independently re-ran the proof:
`FEASTSCALE_R13=1 node scripts/test-dutyfish-b.js`, base 8de1b508b:
**15/15 PASS** — the dead run's claim is verified real (RED 4/4 byte-identical;
GREEN G0–G6 all pass; additive-only staffing confirmed).

Det-gate: the worker re-ran the dead run's 2 journaled reps fresh
(leaddutyfish s5601 + s5605, control+armed × 2 reps): 4/4 repeat-pairs
bit-identical, journaled hashes reproduced exactly. The journal is real —
det-gate stands at **2/64 valid**, not 0/16. (Side note resolved: the ~2.4s
"ms" values are frozen-clock ticks — the sim harness mocks Date.now() as a
monotonic counter — not wall time; ~85s/rep real. No integrity anomaly.)

Pilot: never started. The committed perseed-dutyfish-b JSONs are control
halves for seed 5601 only (run by the closeout in the main tree; village-lost
both); seeds 5602–5608 and both armed halves never ran. Do not fold into a
verdict.

TRUE STATE: proof-green (15/15), det-gate 2/64, pilot unrun, sense PASS (dead
run's 60d read; honest voice; throttle stack visible and honest). Unjudged —
binding metrics (PRIMARY lean-day duty_fish inflow ≥1.3x; CO-PRIMARY
per-villager capture ≥1.0x; guardrails) untested. **NEXT: resume the det-gate
from the journal (~/workspace/detgate-dutyfish-b-progress.jsonl — empty at
closeout; the 2 valid reps' hashes are in the worker's handoff), then pilot.**

## Partial pilot JSONs on master (both arms): SUSPECT

perseed-dutyfish-b/ (control halves, seed 5601 only) and perseed-retagrot-b/
(4–7 rows of 8 per file, unpaired seed sets) are partial outputs of dead
runs' interrupted sweeps. They are committed for provenance, NOT for verdicts.
The next run re-runs det-gate + pilot fresh; never fold partials into a GO/NO-GO.

## Wall numbers

No pilot completed this run — no wall movement. Last recorded
(pre-seat+windefer, 16 runs): national 15/16, table 13/16, wins 0/16,
wave-4 15/16, wave-5 0/16, median 181.5d. Telemetry deviation check skipped:
no completed pilot corpora (partial JSONs excluded as suspect).

## Convergence

food-economy stays **converging**: both arms proof-green and parked
mid-flight, neither killed, neither judged. The hunger problem remains
villager-production-side; duty_fish scale-up and the always-on ROT re-tag are
the named nexts, both awaiting det-gate + pilot.

## Out-of-scope finding (worker's, logged to sim-findings.md by worker)

Un-interpolated `{kin}` placeholder in the dog-tags keepsake line — 8
occurrences in the dutyfish-b 60d sense transcript. Cosmetic; not this axis's
work.
