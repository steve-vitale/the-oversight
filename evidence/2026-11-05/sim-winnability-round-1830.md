# Coordinator evidence — run fleshout-loop-b-20261105T1830Z

Loop B winnability-chain round. Axis: scale-onramp (winnability-chain
re-point). STALE-LOCK RECOVERY + ADOPTION of the dead 1611Z run (lock
139 min old, vetrest heartbeat 220 min stale, tbretreat heartbeat
31 min stale at run start; both branches complete, worktrees clean,
heartbeats refreshed 18:34Z). Claim:
hidden_files/lever-claims/fleshout-loop-b-20261105T1830Z.json (deleted
at closeout). Lock: hidden_files/fleshout-loop-b.lock (deleted at
closeout). Coordinator timed out at 7200s; the closeout below was
finished in the main session per INSPECT HELD WORK.

## Arms

### 1. sim-vetrest-b-land (ADOPTION of dead 1611Z run) — LANDED

VETREST_MANTLE_SKIP lever in src/js/ledger.js (06753b070, proof
30/30, driver/analyzer) + pilot evidence UNDERPOWERED (17cf539e4) +
pilot corpus 16 per-seed JSONs + analysis.json (d71d87154). Pilot
result: 1 banking seed per leg (99713 only), 1 observed first-killer
exit on the armed leg, skips 0 on both legs, legs byte-identical
(zero skip opportunities existed). The lever stayed committed,
default OFF via env flag, off-mode byte-identical (proof) and
on-mode neutral in the wild. Landed on master by this run's
adoption; later reverted by arm 3 below (the screen's NO-GO action).

### 2. sim-tbretreat-b-land (ADOPTION of dead 1611Z run) — LANDED, net zero game change

Pilot GO (b83867509) / 12-seed confirm NO-GO (012f0e707, G1 10.2%
(5/49) fails at scale) / lever reverted (fc219d88a — remove
TBRETREAT_RESTORE from game.js, delete competent-tbretreat-b
wrapper; no src/js trace remains) / proof-fix post-revert
(7f7475f59 — proof skips lever-dependent live legs, 14/14 PASS 5
SKIP). Net game change: zero. Landed on master by this run's
adoption.

### 3. sim-vetrest-screen-b (NEW) — NO-GO / CONCEPT-DEAD, lever reverted, LANDED as evidence + revert

The 32-seed screen the vetrest pilot proposed (band 99511–99542,
fresh, verified by whole-token grep before any judged sim).
Prereg: evidence/2026-11-05/sim-vetrest-screen-b-prereg.md.
Corpus: evidence/2026-11-05/perseed-vetrest-screen-b/ (64 files,
32 seeds x 2 legs, 0 instrument errors). Analysis:
evidence/2026-11-05/sim-vetrest-screen-b-analysis.json.
Evidence: evidence/2026-11-05/sim-vetrest-screen-b.md.

Verdict (analyzer, powered): NO-GO, reason "median 5d < 19d",
kill class CONCEPT-DEAD. Banking seeds 5 per leg (99513, 99514,
99515, 99532, 99539). First-killer median survival (observed
exits): baseline 5.5d, armed 5d — bar >= 19d. Pair clause PASS
(99532, 1 day of 2 living killers per leg). Cost bars all PASS,
legs identical (median village survival 79.5d, starvation 23,
village losses 31, median non-scholar fallen 8.5). Skips fired:
armed 6 across 2 seeds (99515, 99532), 0 violations. Paired
survival: 0 up, 0 down. Pair-days (L>=2): 1 → 1. Second-killer
production: 1 → 1 banking seed; post-blood fights 22 → 19,
kills 1 → 1. Readiness-5-ready days: 0 → 0. Sense test (99515,
Elijah Scott): 3 skips fired on day 75 during a Haven assault
chain that killed eight scholars; Elijah lived to village end
on the armed leg vs dead-in-fight at 9d on baseline — the one
censored paired gain, not enough to move the median or the
pair-days. Kill-class note: the prereg's METRIC-BROKEN needs
paired survival up on >= 1 banking seed counting observed
exits only; the analyzer resolved the fires-but-no-gain case
as CONCEPT-DEAD. The pre-registered action is the same either
way: on NO-GO the lever is reverted.

Revert (this closeout): ledger.js VETREST_MANTLE_SKIP block +
skip narration removed (reverse-applied the lever commit's
ledger hunk; grep VETREST_MANTLE_SKIP / vetrestSkips in src/js/
= 0). Proof test-vetrest-20261105.js updated the tbretreat way
(LEVER_PRESENT detection; 4 lever-dependent live legs SKIP with
a printed reason while the lever is absent): post-revert
26 passed, 0 failed, 4 skipped (30/30 pre-revert). Driver +
analyzer retained as tooling. No balanced panel (owed only on
GO). Commit 0b62eb72f (after rebase onto 4a065f050; pre-rebase
56f099d4a). The corpus was complete at timeout (64/64 — the
resume loop finished 99541–99542 before dying); only the
analysis, evidence, and revert were missing, all done in the
main session.

### 4. sim-tbretreat-refind-b (NEW) — pilot GO, LANDED (policy-only)

Policy-side retreat-and-refind (75/75 trigger, havenward +
persistent chase). Prereg 242cd81a9 (band 96811–96818), policy
variant + driver + analyzer + proof 42/42 (76880ab81), pilot GO
evidence + 32-file corpus (4a065f050): G1 6/15 = 40%, G2 18.2%
vs 15.0%, G3 0.60x, G4 1.0x. No game-code change (policy-only).
Landed on master; release step aborted at timeout and was
repaired in this closeout (tree clean, tip == HEAD, released
done-merged, branch deleted). **Confirm on fresh seeds is owed**
— next Loop B run's queue item, not this closeout's (the run
is over; no new worker fleet is spawned from the main session).

## Wall numbers (this round, screen legs, 32 seeds per leg)

Wins 0, national 0, table 0, wave-4 unlocks 21, wave-4 faced 20,
wave-4 kills 6, wave-5 unlocks 0, wave-5 faced 0, median survival
79.5d. Identical on both legs. The full seat stays unwon;
wave-5 kills stay 0. The binding link is unchanged: wave-4
kills happen (6 per 32 seeds) but first killers die within days
and pairs never form (1 L>=2 day per leg).

## Gate

check.js --quick on the rebased screen tree: **284 passed, 6
failed in 783s** — the standing 6 (measurement-proof-update,
measurement-workflow, mobile-combat-cadence, occupation-panels,
phone-frame-proof, establishment-r20-fixes), identical to the
r99/r100/r141 profile, no new failures. Proof re-run post-rebase:
26/0/4. Main tree clean at closeout; branch merged --ff-only
after rebase; worktree released done-merged; branch deleted.

## Telemetry deviation check

Refused, same class as the 1715Z and prior runs:
"refusing recorder-corpus input: all 64 --current rows carry
top-level anchorCommit, so they are sweep recorder rows, not
runs." No LOUD lines; baseline NOT rolled. (Recorder corpora
are compared with sweep-compare tables, never against a run
baseline here.)

## Findings backlog

sim-findings.md: vetrest-screen verdict recorded (lever dead;
do not re-screen this mechanism on a new band expecting a
different median — the next lever for first-killer survival has
to address the wild death channel, not the succession pick).
Refind confirm queued as the next Loop B arm (fresh seeds).

## Infrastructure

- EPERM flap 20:12–20:25Z during the landings: heartbeat,
  rebase, and proof writes refused, recovered via retry and
  manual dir removal. The reaper's 14:08 CST run failed the
  same way (registry write EPERM) and was reported to Steve
  in chat; the 14:18 run succeeded.
- safe-commit index clobber hit the screen commit (64 corpus
  files + evidence staged-as-deleted after a correct commit;
  repaired via HEAD-blob cacheinfo, worktree files verified
  byte-identical to HEAD blobs, 0 mismatches).
- safe-commit refused the first attempt as a "stale-tree revert
  signature" (pure 51-line deletion); re-run with
  --force-delete as closeout coordinator, after verifying the
  deletion is exactly the lever commit's own hunk (blob
  e5b7d6ddf restored).
- Rebase onto 4a065f050 clean, no stop-at-pick quirk. The
  screen branch's prereg commit and evidence commit rebased
  as f9e546c98 + 0b62eb72f.
- Loop A live on adoption/landing (1915Z claim, enddaybeats
  landed 5d8715e80) — NOT touched. Sibling landings during the
  run: enddaybeats (Loop A) + refind (this run) — zero file
  overlap with the screen arm.

scale-onramp stays converging (NOT converged): vetrest answers
its blank as NO-GO (lever reverted) and refind pilots GO on the
grind-price question, but wins are still 0, wave-5 kills still
0, readiness-5-ready days still 0. Next blanks, in order: (1)
refind confirm on fresh seeds (policy-only, next Loop B run);
(2) a lever on the wild death channel for first killers
(succession picks are measured and do not move survival);
(3) re-screen sigoff/gearoff/trickoff on a fresh seed set;
(4) flee-repair game-code port — STEVE CALL on scope.
food-economy stays converging (NOT converged): untouched by
this run. Claim deleted; lock deleted.
Evidence: evidence/2026-11-05/sim-winnability-round-1830.md.
