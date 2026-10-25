# sim-food-adoption-round-1329 — coordinator evidence (loop B, run fleshout-loop-b-20261025T1329Z, axis food-economy)

## Run shape: adoption, not a fresh round

STALE-LOCK RECOVERY at start: the 1029Z B lock was 3h old (past the 90-min
fallback) with NO registry tree or heartbeat for that run_id, so the run
was DEAD per the guard. Lock retired to
`fleshout-loop-b.lock.stale-20261025T1029Z`; the dead 1029Z claim was
retired to `.DEAD`. Loop A had no lock and no claim at run start (its
quick-check tree sim-quickcheck-1226 was heartbeating, NOT touched);
per the role rule B worked the second axis, food-economy. Main tree
clean at start; disk 25%. `worktree-reap.sh` removed nothing (9 active
trees, dirty ones flagged and preserved).

The dead 1029Z run had in fact finished the work its claim promised —
both confirms were complete, only the judging/merging was missing:
- sim-packtail-b: confirm band 94909–94924 baseline 16/16 + armed 16/16
  swept, analyzer output written, but unjudged and uncommitted.
- sim-awayvoice-b: confirm committed as 2c29b691e (claimed GO 35/35)
  but never merged.
So this run adopted both held trees (NO fresh tree registered for
either arm, per the 0730Z recovery checklist) and finished them.

## Arm 1 — sim-packtail-adopt-b: CONFIRM-GO, LANDED

Lever (pilot a9f3aa7d5, unchanged): tail pack top-up — on pool-binding
days (dawn pack < dayWant) the meal tops the pack up from REAL pantry
items via pantryDraw, once per pack-day, floor-only.

Judged ONLY against the confirm pre-registration
(evidence/2026-10-25/sim-packtail-confirm-b.md, §14 binding):
- PRIMARY median binding-day coverage (drawn/dayWant, pool-binding days
  only): baseline 0.772 (n=191) -> armed 1.000 (n=282). Bar >= 0.90 AND
  n >= 30 — BOTH LEGS PASS. Mean 0.747 -> 0.993; share at full coverage
  0.000 -> 0.989.
- Guardrails, all pass: pack-draw-day capture 1.000 both arms;
  median survival 150d -> 150d (ratio 1.000, bar >= 0.8); full-pantry
  away starvation deaths 4 -> 0 (bar <= control+2 = 6); armed-only
  death causes >= 3 deaths: none (largest alien=2).
- ARENA LANDING GATE (pre-registered for this confirm only): baseline
  arena deaths 65 -> armed 82, ratio 1.262, excess +17. The gate needs
  BOTH >= 1.5x AND >= +10 — the ratio leg fails, so the gate DOES NOT
  TRIP. The lever is NOT held. Note: the pilot's excess did not
  reproduce at gate scale (pilot 22 -> 49, 2.2x/+27; confirm 65 -> 82,
  1.26x/+17), and the confirm's much higher baseline shows the pilot's
  low baseline made its ratio fragile.
- Verifier scripts/test-packtail-confirm-b-verdict.js: ALL CHECKS PASS
  (fresh analyzer re-run byte-identical to the stored output).
- Sense: coherent. Armed starvation deaths 17 -> 4, all four with a
  0-kcal pantry — genuine scarcity, not the full-pantry bug the lever
  targets. Death-adjacent narration reads human (grief lines, warnings
  preceding the spiral, village meals matching pantry state).
- Gap recorded as inapplicable, never forced: the causebase cross-check
  could not run (scripts/analyze-causebase-b.js absent from that tree);
  the analyzer's own armed-only cause check covers the guardrail.
- Metric review (written into the evidence file, NOT applied to this
  verdict): future arena gates should consider pooled arena share or
  per-village-day rates instead of a raw ratio, given baseline swings
  of 22 vs 65 across bands; binding coverage saturates at the ceiling,
  so a future lever in this family may need a finer primary.

Worker commit 626488554 (40 files, evidence + analyzer + runner +
sweep + corpus + verifier, NO src/js). Index-clobber variant hit on
that commit, repaired via cacheinfo by the worker, commit verified.

## Arm 2 — sim-awayvoice-adopt-b: CONFIRM-GO stands, LANDED

Lever (pilot c586cfe2c, narration only): away-hunger voice beat —
a low-health away meal names its traveler + pack/starvation context.

Verification (no sims re-run, corpus intact):
- Corpus 32/32 present and parseable, seeds exactly 94901–94916 both
  cells; days match evidence exactly (150d except 94909 = 53d,
  94914 = 115d, identical baseline vs armed per seed).
- Analyzer re-run pre- and post-rebase reproduces the CONFIRM TABLE
  exactly: fire rate 35/35 = 1.000 >= 0.80; name-borrowing 0 fails;
  meal-row identity 0 diffs; death-row identity 0 diffs; pack-call
  identity 0 diffs; uncovered low-health away days 0; say-log
  subsequence 35 insertions, 0 missed, 0 non-beat insertions; beat
  variants short 30 / adequate 4 / empty 1; starvation away deaths
  with death-day beat 6/6. Proof scripts/test-awayvoice-b.js 10/10
  pre- and post-rebase.
- Raw cross-check: baseline packCalls 1,380 with 0 beatLines; armed
  1,380 with 35 — consistent with the baseline cell running on code
  without the beat and game.js being the only file differing between
  cells. game.js blob identical at pilot tip and confirm tip
  pre-rebase; the pilot's game.js change is narration-only
  (44 insertions).
- Sense: all 35 beats spot-read; every line names its traveler and
  pack context with matching numbers; decline arcs coherent; non-hunger
  away deaths correctly silent. Zero robotic lines.
- Rebased onto master 490b01506 clean inside its own worktree (new
  tip 862721ade; pilot rebased as a7d84bdba). Post-rebase preservation
  verified: arm script blobs identical, evidence + corpus + script
  tree diff old-vs-new tip empty, awayHungerVoice method text
  byte-identical (game.js blob moved only by the postflee base churn
  in a distant region).
- Evidence note now stale: the file's "Rebase: none performed" line
  described the pre-adoption state; this file is the rebase record.
  The analyzer's verdict string literally renders "PILOT-GO" even for
  confirm runs (hardcoded label); the verdict rests on the numbers,
  correctly called CONFIRM-GO in evidence.
- Wall numbers (from evidence, not independently re-derived — the
  analyzer emits no wave/national fields): national 0/16, table 0/16,
  wins 0/16, wave-4 6/16, wave-5 0/16, median 150d. Expected
  competent-only substrate profile, not a regression.

## Coordinator merge sequence (both arms land as game code)

1. Merged sim-awayvoice-b --ff-only onto 490b01506 -> 862721ade.
   Main tree clean before and after.
2. Rebased sim-packtail-b onto 862721ade in its own worktree. ONE
   conflict, in src/js/game.js packMeal (both arms touch it):
   awayvoice's take<=0 narration call vs packtail's top-up block.
   Resolved by keeping BOTH, in order: top-up block first, then
   take = min(topped-up kcal, want), then the awayvoice call on
   take <= 0. Verified: node --check clean, zero conflict markers,
   all awayvoice call sites preserved (2 calls + method), top-up
   markers present, rebased pilot diff vs awayvoice tip touches
   ONLY game.js (+43/-1) and removes ZERO awayvoice lines.
3. The combined code exposed a REAL interaction in the awayvoice
   proof: leg L1 asserted pack kcal falls by exactly take, which is
   false once a top-up fires in the same meal (L1 setup: dawn 1000,
   want 1500, pantry full -> top-up 500, take 1500, pack ends 0, not
   before - take = -500). This is the packtail design working, not a
   defect: the villager ate the full take, the pantry paid the
   top-up, the beat's numbers stay true. Per the design-changed
   rule the test was updated IN THE SAME merge sequence (commit
   50d75fb6d, test file only): L1 now asserts
   before + topup - take, with dawn read from the pack object.
   After the fix: awayvoice proof 10/10 AND packtail pilot proof
   40 legs pass on the combined code. Safe-commit index clobber
   hit the fix commit (MM on the just-committed file), repaired
   via cacheinfo from the HEAD blob, status empty, hash matches.
4. Merged sim-packtail-b --ff-only -> 50d75fb6d. Post-merge proofs
   on merged master: awayvoice 10/10, packtail confirm verifier
   ALL CHECKS PASS. No push, no bump, no live verification — merged
   locally, pending ship.

## Telemetry deviation check (Steve 2026-10-13)

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --metrics
national,table,wins,exiled` on both landed corpora:
- Packtail confirm baseline + armed cells: 3 LOUD lines each
  (national 12 -> 0, table 16 -> 0, wins 16 -> 0).
- Awayvoice confirm corpus (n=32): same 3 LOUD lines.
All are the known winseat-regime artifact class: competent-only,
pre-seat measurement substrates vs a WINSEAT baseline; actuals
national 0/16, table 0/16, wins 0/16 on every cell, which is the
expected profile for food-economy measurement, not a regression.
Baseline NOT rolled, no investigation item. (Tool note: the
checker's glob expander does not accept `*` in a middle path
segment — it scandirs the literal segment and ENOENTs; per-subdir
globs were used instead.)

## Wall numbers (this run's judged corpora)

Packtail confirm (competent-only, 150d, 32 configs): national 0/16
-> 0/16, wins 0/16 -> 0/16, wave w1 16/16, w2 16/16, w3 14/16,
w4 6/16, w5 0/16, median survival 150d both arms. The scale wall is
unmoved by this lever, as expected: it fixes away-day hunger, not
reach. Awayvoice confirm: same wall profile (national/table/wins
0/16, wave-4 6/16, wave-5 0/16, median 150d).

## Village assessment (plain words)

Two separate hunger fixes are now in the game. First: when a
traveler leaves with too little food for the day, the village now
tops their pack up from the pantry at mealtime — on the fresh
16-seed test, travelers on short-food days went from getting about
three-quarters of what they needed to getting all of it, and
full-pantry starvation deaths fell from 4 to 0. Second: when a
traveler is away, hungry, and hurting, the game now says so out
loud, naming the person and what's in their pack — every one of the
35 test cases fired correctly, including all 6 starvation deaths.
Neither fix moves the village toward the national table or wave 5;
that wall still belongs to the scale-onramp lane. What they do fix
is a specific, measured way villagers died while the pantry was
full — and the death narration now reads like people noticing, not
numbers ticking.

## Blanks filled / documented

- FILLED (landed as game code): tail pack top-up (backlog: pack
  re-try under a tail pre-registration, 0630Z blank 1) and the
  away-hunger voice beat (0630Z blank 2).
- DOCUMENTED, not chased (stay-on-axis rule): metric review items
  above (arena-gate metric, coverage ceiling); the causebase
  cross-check gap on the packtail tree; the telemetry glob tool
  quirk; the stale "Rebase: none performed" line in the awayvoice
  evidence (this file supersedes it).

## Next blanks for food-economy, in order

1. A pooled baseline cause list before any "new death mode"
   guardrail reuse (0630Z blank 3, still open).
2. The rot step's raggedness as a behavior question — which seeds
   win/lose under preserver widening and why (carried from 0335Z).
3. The leg2decide string-sort display fix (separate analyzer,
   still open).
4. The combined packtail + awayvoice behavior is now live and
   proof-covered (L1 updated); no further combined-behavior work
   is queued unless a fresh corpus shows a divergence.

## Infrastructure

- No EPERM flap blocked this run's ref writes. Worktree
  registration for the coordinator tree took ~2 min under sibling
  load (slow, not failed); an early read during registration
  showed transient deletion markers that resolved to a clean tree
  once registration completed — do not act on mid-registration
  reads.
- Safe-commit index clobber hit the packtail worker commit, the
  coordinator L1 fix commit, and (per worker reports) the
  awayvoice-adjacent commits — repaired via cacheinfo every time,
  commits always verified correct.
- check.js --quick NOT re-run by the coordinator: zero new src/js
  beyond the two landed arms (each proof-covered above), and loop
  A's 1226Z closeout addendum just attributed the standing 8
  quick failures to pre-existing causes on the pre-arms base
  (see tracker addendum) — re-running would re-prove that profile,
  not this run's arms.
- Loop A quick-check trees (sim-quickcheck-1226, sim-quickbase-1226)
  and all other lanes' trees NOT touched. Held trees
  sim-packtail-b and sim-awayvoice-b are released below; the
  sim-leg2drift-b / sim-belongcost-b / sim-fullpantry-casecount-b
  dirty trees flagged by the reaper belong to older runs and were
  left alone.

food-economy stays converging (NOT converged): two hunger fixes
landed and the rot step is settled under one governing system, but
no deciding corpus under that system has produced a food-economy
lever that moves the scale wall, and the pooled-cause-list blank
is still open. scale-onramp stays converging (untouched; sibling
loop A). Claim deleted; lock deleted.
