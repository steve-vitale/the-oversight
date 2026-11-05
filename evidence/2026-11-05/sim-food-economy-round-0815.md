# Run fleshout-20261105T0815Z — STALE-LOCK RECOVERY + verification/landing of run fleshout-20261105T0515Z (axis food-economy)

Coordinator: Loop A run fleshout-20261105T0815Z. This run did NO new sims and
landed NO new game change. It recovered the dead 0515Z run, verified the two
arms the main session completed and merged, and closed the loop bookkeeping.
Merged locally, pending ship (ship loop owns push/bump/live verification).

## Stale-lock recovery (the dead run)

- Lock fleshout-20261105T0515Z created 2026-11-05T05:20:00Z; at this run's
  start (08:15:47Z) it was 175 min old — past the 90-min fallback, so the
  lock was deleted and this run's lock (fleshout-20261105T0815Z, 08:15:00Z)
  created. The 0515Z claim file was left in place until closeout.
- The dead run's trees (sim-pantrymealword-a, sim-bankadded-a) last
  heartbeated 2026-11-05T07:08:24Z (67 min stale). Heartbeat age alone did
  NOT retire the run: the EPERM flap morning flare 3 (AGENTS.md, added this
  run: ~00:36–01:48 CST, O_EXCL creation refused filesystem-wide, one
  isolated success 07:08:24Z) made live runs look dead — the same flare
  blocked the workers' own heartbeat retries (pantrymealword worker: two
  failed heartbeat attempts, PermissionError on the REGISTRY.json atomic
  write, ~06:4xZ).
- Triple-check dead was NOT met: at 08:13Z a process was verifying commit
  b7d853b02 + resyncing the index in sim-pantrymealword-a, and at 08:16Z the
  bankadded worker launched a 16-seed extension sweep (17073–17088) into
  sim-bankadded-a-screen-guard-variant. Per the 2026-10-30 lesson (dead
  coordinator != dead workers), this run STOOD DOWN on both trees and ran a
  25-min quiet monitor (no worker process referencing either tree, no
  non-.git file writes in 3 min). Monitor reported QUIET 08:34:32Z — but by
  then the main session had already completed and merged both arms (see
  below), removed both worktree dirs, and (during this run) deleted branch
  sim-bankadded-a. Nothing was re-run, re-merged, or re-done by this run.
- The "recent writes" the monitor saw at 08:25–08:30 in both trees
  (journey-endgame-r135-* files, scripts/analyze-*.js) were rebase-checkout
  mtime bumps, not a foreign writer: those files are tracked master content
  (commit 0f6a43bba). Verified via git ls-files/log before adopting.
- Sibling Loop B live throughout on scale-onramp (0618Z claim:
  sim-finishhold-b + sim-postblood-b) — NOT touched. Loop B retired its own
  claim during this run (fleshout-loop-b-20261105T0618Z.json.DEAD + note,
  0830Z recovery run: postblood already merged, finishhold adopted with a
  continuation worker). Loop B's finishhold continuation is NOT this run's.

## Arm 1 — sim-pantrymealword-a: GO (landed, wording fix)

- Verdict (worker evidence evidence/2026-11-04/sim-pantrymealword-a.md):
  GO. False-claim nights 7 -> 0 on the 8-seed pilot band (17021, 15003,
  15009, 15091, 15211, 15215, 15220, 15221; 60 loop-days, death-aware);
  every beat-reaching stranded night still carries a stranded-night line
  (10/10, reworded); honest no-meal wording still fires under genuine
  'none' access (targeted probe). Transcript diff wording-only: 12
  differing lines, all camp-wild OLD->NEW substitutions, 0 other diffs.
  Per-seed days/end reasons and morning pantry gains identical.
- Fix (src/js/game.js villageMeal camp-wild branch, [needs-eyes] — a line
  the player reads): under havenStoresAccess 'remote', "You camp wild
  tonight — no hall meal, but the pantry still reaches you through System
  requisition. Eat from your pack tonight."; otherwise the old line
  verbatim. Both legs set lastPlayerMeal = 0, return null. No kcal, state,
  RNG, gate, price, or policy change. Canon: no canon doc covers pantry
  requisition narration; the fix follows the code-canon (game.js
  havenStoresAccess 'remote' + app.js STORES GATE).
- Commits on master (rebased by the main session): prereg 2b4763e10,
  fix 30be75354, corpora 5a1d280a0. This run verified the fix diff on
  master (remote/none legs as described) and re-ran the proof on merged
  master: scripts/test-pantrymealword-a.js 23/23 green. node --check on
  src/js/game.js passes. check.js --quick NOT re-run (worker documented
  the ~9.2-min stall with no output past the preamble, same shape as the
  strandnarr arm; this change touches one say branch + new scripts only).
- Backlog: the item that spawned this arm (sim-findings.md line 1743,
  2026-11-05 food-economy/narration 'NO PANTRY MEAL' wording) marked
  `fixed` by this run with this evidence file.
- Metric review (carried from the worker evidence, not re-scored): the
  honest-line denominator is beat-reaching stranded nights (10/10), not
  all stranded nights (11 — night 15003/27 never reaches the beat, a
  structural mid-sleep wake, unchanged before/after). Next census should
  pre-register that denominator. Balanced panel N/A with cause (wording
  only; transcript diff is the neutrality proof).

## Arm 2 — sim-bankadded-a: INSUFFICIENT-DATA (landed, diagnosis only)

- Verdict (worker evidence evidence/2026-11-04/sim-bankadded-a.md):
  INSUFFICIENT-DATA. Pre-registered GO bar was >= 3 distinct judged
  bank-added events with a unanimous retention verdict; the 64-seed
  BANK-mode screen (17025–17088, 6+2 blocks of 8) reached its cap with 1
  judged event. Bar not met, not re-scored: flip-mode delta > 0 events
  (5 judged) are screen context only, never counted toward the bar.
- The single judged event was RETAINED — suggestive, not judged: seed
  17063, loopDay 13, source 'banked' (pack-before edible 0), +325 kcal,
  retained at the true post-sleep morning, disposition 'upkeep-eaten';
  replicated exactly on the strandnarr census leg (same seed, loopDay,
  delta, verdict; 0 DISAGREED). Yield: 64 seeds screened, 1 bank-mode
  evening, 1 bank-added judged, 0 censored; raw mode counts bank 1,
  flip 21, skip 8. What the run proved is the RARITY of the pool (~1
  bank-mode evening per 64 seeds under this stack), not the retention
  verdict. Zero src/js, zero policy change, no game change.
- Closeout provenance (from the arm evidence): the worker timed out with
  the screen at 48 seeds and the verdict unwritten; the MAIN SESSION
  completed the arm per the prereg — extension sweep 17073–17088 (16
  files, same driver/legs/env), analyzer re-run on the full 64-seed
  corpus, census leg for candidate seed 17063, replication check, and
  the evidence file. This run verified the completed arm, not the work.
- Commits on master: prereg + instrument 8cba76e7a (proof 24/24),
  instrument extension 9d5535cb5 (proof 33/33), evidence + corpora
  11d6789c1. This run re-ran the proof on merged master:
  scripts/test-bankadded-a.js 33/33 green. The evidence commit carries
  a 0-byte flap artifact (evidence/2026-11-04/
  sim-bankadded-a-screen-guard-variant/.flap-probe-big.json, 0 bytes,
  mtime 08:31Z) — harmless, left as committed; it tripped the first
  telemetry-check parse (see below).
- Backlog: new open item appended by this run (sim-findings.md):
  bank-added retention needs a richer substrate — a bank-screened band
  pre-filtered on bank-mode evenings, or a probe-given-food leg staging a
  bank-added evening directly, each with its own prereg. Metric review:
  the metric held; the 64-seed cap bound the screen as designed.

## Telemetry deviation check

- First run against the screen-corpus glob: LOUD — could not parse
  .flap-probe-big.json (0-byte flap artifact, unexpected end of JSON).
  Explained, not a metric deviation; re-ran against a clean copy of the
  64 per-seed files.
- Second run (64 files): LOUD national 12 -> 0, table 16 -> 0, wins
  16 -> 0; no LOUD for exiled. EXPLAINED, not a regression — same class
  as the 0415Z run: these are narration-diagnostic recorder corpora
  (bankfood strand screens), not scale panels; they never record
  national/table/wins outcomes, so the metrics read 0 by corpus shape.
  Baseline NOT rolled; no compare fabricated.
- Wall numbers NOT re-measured this run (diag/narration arms only).
  Carried state: standaccum2 band national/table/wins 0/16, wave-5 0/16,
  median survival 90.5d; Loop B 0430Z secondkiller band wins 0/8,
  national 0/8, table 0/8, wave-5 0/8, median survival 89.5d; Loop B
  0618Z postblood verdict (b) wild-dominant — pair released wave 5 on
  99179 and died facing it. Full seat still unwon; wave-5 kills still 0
  in normal play.

## Convergence state

- food-economy: CONVERGING, NOT converged. One wording fix landed (GO),
  one narrow retention case closed as INSUFFICIENT-DATA with its rarity
  measured; the sweep unit-count question (spoilname metric review) and
  the bank-added follow-up substrate stay open. No food-economy game
  number changed this run.
- scale-onramp: untouched by this run (sibling Loop B). Stays converging
  (NOT converged) per the tracker.

## Infrastructure

- Pre-flight: main tree clean at 6650762eb, disk 33%, reaper running
  concurrently from the playtest loop's journey-scale release (not this
  run's). No registration by this run (cap: 15 worker trees at start);
  no new worktree was needed — both arms were adopted from the dead run.
- Safe-commit index clobber: NOT hit by this run (no worker commits made
  here). The pantrymealword worker's 08:13 index resync (git read-tree
  HEAD after its corpora commit) is consistent with the known clobber
  repair pattern.
- Main session removed both worktree dirs during this run's monitor
  window (pantrymealword ~08:28–08:35, bankadded ~08:34–08:36) and
  deleted branch sim-bankadded-a (this run's `git branch -d` returned
  "not found"); branch sim-pantrymealword-a already deleted. This run
  ran `git worktree prune` for the leftover admin entry and a final
  `worktree-reap.sh` sweep; main tree verified clean after every step.
- Registry note: sim-bankadded-a / sim-pantrymealword-a registry entries
  still show heartbeat 07:08:24Z (stale — the flap's single success);
  the trees are gone and the branches deleted, so the entries are stale
  bookkeeping for the reaper, not live work.

## Files

- This evidence: evidence/2026-11-05/sim-food-economy-round-0815.md
  (this commit).
- Arm 1: evidence/2026-11-04/sim-pantrymealword-a.md + corpora
  sim-pantrymealword-a-corpus-before/ + -after/; scripts/
  pantrymealword-trace-a.js, analyze-pantrymealword-a.js,
  test-pantrymealword-a.js (23/23 on merged master).
- Arm 2: evidence/2026-11-04/sim-bankadded-a-prereg.md +
  sim-bankadded-a.md + screen corpus
  sim-bankadded-a-screen-guard-variant/ (64 files) + census corpus
  sim-bankadded-a-corpus/ (strandnarr-s17063.json); scripts/
  analyze-bankadded.js, test-bankadded-a.js (33/33 on merged master).
- Hidden-files bookkeeping: claim fleshout-20261105T0515Z.json retired
  to .DEAD with a note; this run's claim fleshout-20261105T0815Z.json
  retired to .DEAD; lock deleted at closeout; tracker entry appended;
  sim-findings.md: pantrymealword item fixed, bankadded-substrate item
  opened.
