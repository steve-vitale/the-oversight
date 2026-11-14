# Journey endgame r199 — ADOPTION + M23-FIX run note (Lane B, 2026-11-14 03:00 CST occurrence)

Leg 4 (endgame). This run ADOPTED the timed-out 01:00 CST r198 completion
run and landed it, then fixed the M23 metric-implementation miss r198
proposed for r199. Rotation-b still reads 4 at this note's writing — it
advances to 5 (social life) ONLY after the verified landing below.

## Adoption (stale-lock recovery)

- Previous r198 completion run (lock run_id
  journey2-endgame-20261114-0655Z) TIMED OUT at 01:55 CST / 07:55Z.
  Registry heartbeat 07:51:40Z (69 min stale at the 03:00 check); no live
  process in the tree; newest write 07:36:55Z (r199 hb log). DEAD per the
  15-minute rule — lock deleted, "stale-lock recovery" recorded here.
  The 02:00 occurrence had stood down (heartbeat fresh at its check).
- This run (lock run_id journey2-endgame-20261114-0905Z) adopted the
  existing tree `journey2-endgame` (branch tip 58e56ba22) instead of
  registering a new one. Heartbeat loop
  `journey2-endgame-hbloop-r199.sh` restarted at run start; the first
  heartbeat queued ~4 min behind Lane A's journey-deepening
  registration (REGISTRY.lock held by PID 62154) and landed 09:08:53Z
  (readback verified, field is `heartbeat_at`, status active).
- Recovered state: prereg + instruments + proof tests (72425fef6) and
  pass-B/C corpora + analyzers + run note (58e56ba22). Pass A ALL GO,
  pass C ALL GO, pass B analyzer RC=1 on the sole M23 miss. No src/js
  change in either r198 commit. The only dirty file at adoption was
  evidence/2026-11-14/journey-endgame-r199-hb.log (+2 heartbeat lines,
  07:31:53Z + 07:36:55Z — committed with this run's work).

## Flap window 3 (02:55–03:00 CST, 08:55–09:00Z)

- NEW true flap at run start: first failed watcher cycle 08:55:59Z
  (A=FAIL@write EPERM errno=1, B=FAIL update-ref rc=128); the run's own
  small-write probe failed the same way 08:57Z. Writes cleared by
  09:01:17Z (watcher A–D/F–H OK; E/I are the known stale-lock artifacts,
  not flap). Window ~5 min — a brief blip. No write was attempted while
  the probe failed, per the flap-response skill: the lock swap and
  heartbeat waited for the 09:01 OK cycles, and the git update-ref
  probe passed 09:04Z before any repo write.
- Pre-flight: main tree clean (`git status --short` empty); disk 40%;
  reaper run in the background (log
  ~/workspace/worktrees/journey2-endgame-r199-reap.log): removed
  nothing; 12/16 active, all 12 dirty (never auto-removed) —
  sim-wideduty-a, sim-sametick-a, journey-scale-attr, sim-secondlink-a,
  sim-redactor-a, sim-saycap-a, sim-siegedialog-a, sim-inffight-ab,
  journey2-endgame, sim-transplant12-14-a, sim-fusionoffer-b,
  sim-proofrefresh-b15. Owners must commit or release.

## The M23 fix (r199's job, pre-registered)

- The r198 metric review proved the M23 analyzer did not implement its
  own prereg text. `capNoRefusal` (analyzer line 1272) demanded
  delivery from EVERY eligible seed; the prereg (§M23-REV) says GO iff
  ≥1 eligible delivered AND ≥1 priced full AND zero non-exempt
  refusals. The r198 pass-B mixed case (89705 delivered + priced FULL,
  89704 eligible-undelivered with all refusals exempt) is GO by the
  text and NO-GO by the code.
- Fix (exact, one line, scripts/analyze-endgame-r198-20261114.js:1272):
  `capEligible.every(x => x.refusedNonExempt === 0 && x.delivered)` →
  `capEligible.every(x => x.refusedNonExempt === 0)`. Nothing else in
  the analyzer changed. `capAllExempt` (line 1274) is already the same
  predicate and already drives the VACUOUS message branch; the verdict
  boolean (line 1294) is unchanged.
- New proof: scripts/test-m23-mixed-r199.js — re-scores the COMMITTED
  r198 pass-B corpus (read-only copy to /tmp) and asserts M23 GO
  naming 89705:feast_embassy@d68/FULL, 89704:none, delivered 1/2,
  NON-EXEMPT 0; plus pass C and pass A still RC=0. A revert of the
  one-line fix fails B (M23 NO-GO, RC=1).

## Proof results (pre-rebase, on branch tip 58e56ba22 + fix)

- test-m23-mixed-r199.js: ALL PASS (9/9). B: M23 GO — "2 eligible:
  delivered 1/2, none-ready 0, exempt-refused 3,
  NON-EXEMPT-refused-despite-ready 0, pricedFull 1/2 — 89704:none |
  89705:feast_embassy@d68/FULL", analyzer RC=0. C: M23 GO delivered
  2/2, RC=0. A: RC=0 (capstone leg disabled, as designed).
  Log: journey-endgame-r199-proof-m23mixed.log.
- test-m23-revision-r198.js: ALL PASS (V NO-GO/VACUOUS, G GO, N NO-GO
  naming NON-EXEMPT — unchanged by the fix). Log:
  journey-endgame-r199-proof-test-m23-revision-r198.log.
- test-m2c-adopted-refs-r198.js: ALL PASS. Log:
  journey-endgame-r199-proof-test-m2c-adopted-refs-r198.log.
- test-corpus-purity-r198.js: ALL PASS. Log:
  journey-endgame-r199-proof-test-corpus-purity-r198.log.
- test-competent-pin-r198.js: 6/6 PASS. Log:
  journey-endgame-r199-proof-test-competent-pin-r198.log.
- Direct analyzer re-scores (fixed analyzer, committed corpora):
  pass A RC=0 (42 GO lines), pass B RC=0 (42 GO lines), pass C RC=0
  (42 GO lines); zero NO-GO lines on any pass. Logs:
  journey-endgame-r199-analyzer.log, -b.log, -c.log.
- The Part-1 smoke run inside test-m23-revision-r198 (probe in SMOKE
  mode on 89704, current master code) passed — the probe shape holds
  on the new substrate. A full 15-seed panel re-run on the moved
  master is the proof-refresh loop's job (round 15 owed), not this
  run's; no new sims were run (corpora deterministic — r198 proved
  pass A/B bit-identical on headline fields).

## Village assessment (carried from r198 — no new sims this run)

- All five villages survived to the table; nobody scattered. The
  wave-4 wall still holds for the waves seeds (0/3 face wave 5 on
  pass A/B; the full seats come from the forcedrift control and the
  buyout-perturbed trajectories, not from wild wave-5 kills). The
  villages that sat full did it by buying the feast bundle early and
  delivering the embassy — the road works, but it runs on the pantry,
  and one village paid for the early buy with a thirst-led crunch a
  month later (89704 pass C: 4 thirst + 2 starvation deaths d53–62).
  The scholar+1 shape (89704) is the honest edge: the bar counts the
  scholar, the payment cannot take them, and the game says so out loud
  in the refusal — it just cannot say it where the player can hear it
  (app.js-only voicing, carried gap).
- People check: r198 read the B/C transcripts in full — the finales
  read as people (relay/dark pods "not like morning. Like a
  barracks"; 89705 "A full seat... The table rises when you enter";
  89703 "Zoe waits two days at your fire, getting thinner. Nobody
  answers... They'll remember the silence"). No new transcripts this
  run; the analyzer re-score changes no words.

## Verdicts (r198's, confirmed by the fixed re-score)

- REACHABLE yes (5/5 sat on every pass; the table, the ladder, the
  bundle and the capstone roads all fire in-sim). FUN yes (the finales
  land — relay/dark and indispensable/light both read as earned, with
  real grief and real social cost on the way). WINNABLE yes-rarely via
  the bought-bundle road (pass C full 2/5; pass B full 1/5) — the
  tribute road still never fires (M24 VACUOUS again), and the full seat
  on pass A stays 0/5 by design (no delivery policy).
- With the fix, pass B joins passes A/C at ALL GO: the leg's three
  passes now agree, and the M23 NO-GO is closed as a
  metric-implementation miss, not a game verdict.

## Metric review (§14)

- M23-CAPSTONE (REVISED in r198, FIXED in r199): the implementation
  now matches the prereg text. V/G/N synthetics unchanged; the new M
  (mixed) case is the proof the revision was written for. The mixed
  shape (delivered + exempt-undelivered) is now GO; the VACUOUS shape
  (delivered 0, all exempt) still prints NO-GO with a VACUOUS note
  by the analyzer's established convention, and M24b still carries
  that verdict.
- M25c / M24b / M2c / CORPUS-PURITY: HOLD (all GO on their passes).
- Telemetry: pass-A sums vs the r188 baseline (uw 22, won 4, peakVet
  8) — r198 already QUIET (uw 22, won 5, peakVet 7, same regime);
  re-scoring the same corpus reproduces the same sums; baseline NOT
  rolled. (Telemetry-check run recorded at closeout.)
- C-wide: CUT (two VM replacements consumed the r198 window; the
  committed core A+B+C is complete; fresh band 89714–89721 stays
  unused for a later run).

## Post-rebase verification (on master tip 7b1f10c18)

- Rebase: 4 commits replayed cleanly onto 7b1f10c18, zero conflicts,
  no stop-at-pick quirk. New hashes: 96a3aa11e (r198 prereg),
  02a67fdc7 (r198 completion), 3efaf0a21 (r199 M23 fix), ebedbdde8
  (r199 hb log final). Master had moved by 3 transplant commits
  (2687ae91f, 03139ea47, 7b1f10c18) since the run start; none touches
  any r198/r199 file. `git fetch origin master` verified before the
  rebase: origin/master (249da4729, batch ship) is an ancestor of the
  local master — local is current.
- Proof re-run AFTER the rebase (all green): test-m23-mixed-r199 ALL
  PASS; test-m23-revision-r198 ALL PASS; test-m2c-adopted-refs-r198
  ALL PASS; test-corpus-purity-r198 ALL PASS; test-competent-pin-r198
  6/6 PASS. Direct analyzer re-scores: pass A RC=0 (42 GO lines),
  pass B RC=0 (42 GO lines), pass C RC=0 (42 GO lines); zero NO-GO
  lines on any pass. Logs: journey-endgame-r199-proof-*-postrebase.log
  and journey-endgame-r199-analyzer*-postrebase.log.
- The safe-commit index clobber struck twice this run (after the r199
  commit and after the hb-log commit): committed files showed as
  staged-deleted in the main index while the commits were correct.
  Repaired both times with the `git ls-tree -r HEAD -- <paths> |
  git update-index --add --index-info` pipe; verified with
  `git status --short` empty + `git diff HEAD` empty + hash-object ==
  HEAD blob. A `git read-tree HEAD` resync was started once and
  killed after ~9 min under load (no index.lock left behind); the
  ls-tree pipe is the faster repair — prefer it.
- Flap window 3 (~5 min) and the REGISTRY.lock contention (Lane A
  journey-deepening registration) are recorded above; neither blocked
  the landing.

## Closeout — LANDING (merge record in the memory log)

- Landing: ff-only merge of journey2-endgame into master, tree
  released via worktree-release.sh, rotation-b 4→5 (social life
  next), lock deleted, telemetry check run. The merge hash, master
  HEAD, and rotation confirmation are recorded in the memory log
  (~/memory/2026-11-14.md, Lane B r199 entry) — the run note's
  Closeout section is written before the merge, so the merge itself
  cannot be named here.

## Files

- Prereg: evidence/2026-11-14/journey-endgame-r199-prereg.md.
- Fix: scripts/analyze-endgame-r198-20261114.js (line 1272, one line).
- New proof: scripts/test-m23-mixed-r199.js.
- Proof logs: journey-endgame-r199-proof-m23mixed.log,
  journey-endgame-r199-proof-test-m23-revision-r198.log,
  journey-endgame-r199-proof-test-m2c-adopted-refs-r198.log,
  journey-endgame-r199-proof-test-corpus-purity-r198.log,
  journey-endgame-r199-proof-test-competent-pin-r198.log.
- Analyzer re-scores: journey-endgame-r199-analyzer.log, -b.log, -c.log.
- Chain/hb scripts (r198 completion run, committed in 58e56ba22):
  journey-endgame-r199-chain.sh, journey-endgame-r199-chain2.sh,
  journey2-endgame-hbloop-r199.sh (tree root).
- r198 record: evidence/2026-11-14/journey-endgame-r198.md (prereg,
  corpora, analyzer logs — see its Files section).
