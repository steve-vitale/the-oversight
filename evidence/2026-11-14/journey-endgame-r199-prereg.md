# Journey endgame r199 — PREREG (Lane B, 2026-11-14 03:00 CST occurrence)

Leg 4 (endgame). This run ADOPTS the timed-out 01:00 CST r198 completion run
and lands it, then fixes the M23 metric-implementation miss r198 proposed
for r199. Rotation-b still reads 4 at this note's writing — it advances to
5 (social life) ONLY after a verified landing of the COMPLETE r198 + r199
work on this branch (r135/r138/r140/r194/r198 precedent: a partial adoption
does not advance the leg).

## Adoption (stale-lock recovery)

- Previous r198 completion run (lock run_id
  journey2-endgame-20261114-0655Z) TIMED OUT at 01:55 CST / 07:55Z.
  Registry heartbeat 07:51:40Z (69 min stale at the 03:00 check); no live
  process in the tree; newest write 07:36:55Z (r199 hb log). DEAD per the
  15-minute rule — lock deleted, "stale-lock recovery" recorded here.
  The 02:00 occurrence had stood down (heartbeat fresh at its check).
- This run (lock run_id journey2-endgame-20261114-0905Z) adopts the
  existing tree `journey2-endgame` (branch tip 58e56ba22) instead of
  registering a new one. Heartbeat loop
  `journey2-endgame-hbloop-r199.sh` restarted at run start; first
  heartbeat queued behind Lane A's journey-deepening registration
  (REGISTRY.lock held ~09:04–09:0xZ by PID 62154; reaper threshold is
  ~4h stale, heartbeat 07:51:40Z — no removal risk inside this run).
- Recovered state: prereg + instruments + proof tests (72425fef6) and
  pass-B/C corpora + analyzers + run note (58e56ba22). Pass A ALL GO,
  pass C ALL GO, pass B analyzer RC=1 on the sole M23 miss (see below).
  No src/js change in either r198 commit. The r199 chain logs
  (r199-chain.log / chain2.log) are the completion run's own corrected
  chains, committed in 58e56ba22; the only dirty file at adoption is
  evidence/2026-11-14/journey-endgame-r199-hb.log (+2 heartbeat lines).

## Flap window 3 (02:55–03:00 CST, 08:55–09:00Z)

- NEW true flap at run start: first failed watcher cycle 08:55:59Z
  (A=FAIL@write EPERM errno=1, B=FAIL update-ref rc=128); small-write
  probe failed the same way 08:57Z. Writes cleared by 09:01:17Z
  (watcher A–D/F–H OK; E/I are the known stale-lock artifacts, not
  flap). Window ~5 min — a brief blip, not a long stretch. No write
  was attempted while the probe failed, per the flap-response skill
  (lock swap + heartbeat waited for the 09:01 OK cycles; the git
  update-ref probe passed 09:04Z before any repo write).
- Pre-flight at run start (after the flap cleared): main tree clean
  (`git status --short` empty, verified 02:55 CST before the flap and
  again after); disk 40%; reaper started in the background at 09:0xZ
  (log ~/workspace/worktrees/journey2-endgame-r199-reap.log) — it
  shares the held REGISTRY.lock with Lane A's registration and may
  SKIP on the lock (known lock self-contention, open item).

## R199 QUESTION

The r198 metric review proved the M23 analyzer does not implement its
own prereg text. `capNoRefusal` (analyzer line 1272) is
`capEligible.every(x => x.refusedNonExempt === 0 && x.delivered)` —
it demands delivery from EVERY eligible seed. The prereg text (§M23-REV)
and the analyzer's own comment block both say GO iff ≥1 eligible seed
delivered AND tableSeat() priced 'full' on ≥1 delivered seed AND zero
non-exempt refusals on any eligible seed. The r198 pass-B mixed case
(89705 delivered + priced FULL, 89704 eligible-undelivered with all
refusals exempt, 0 non-exempt) is GO by the prereg text and NO-GO by
the code. This run fixes the implementation and proves it on the
committed corpora — no new sims.

Questions: (1) Does the r198 branch rebase cleanly onto the current
master tip (11875f939; 40 commits since the r198 base 8c83b6a9a, incl.
game-code moves: rageprecheck engine precheck, HEED fix, walkHome +
clearBlockage)? (2) Does the one-line fix make the committed r198
pass-B corpus score M23 GO, with pass C still ALL GO and pass A still
ALL GO? (3) Do the existing r198 proof tests still pass unchanged
after the fix + rebase (V/G/N synthetics + smoke)?

## THE FIX (exact, pre-registered)

- File: scripts/analyze-endgame-r198-20261114.js, line 1272.
- Before: `const capNoRefusal = capEligible.every(x => x.refusedNonExempt === 0 && x.delivered);`
- After: `const capNoRefusal = capEligible.every(x => x.refusedNonExempt === 0);`
- Nothing else in the analyzer changes. `capAllExempt` (line 1274) is
  already the same predicate and already drives the VACUOUS message
  branch; the verdict boolean at line 1294
  (`capDelivered > 0 && capNoRefusal && capPriced`) is unchanged, so
  the fix implements the prereg rule exactly: delivered ≥1 AND priced
  full ≥1 AND zero non-exempt refusals.
- New proof test: scripts/test-m23-mixed-r199.js — copies the
  COMMITTED r198 pass-B corpus (evidence/2026-11-14/perseed-endgame-
  r198-b, read-only) to /tmp, runs the analyzer, asserts the M23 line
  is GO and names 89705 delivered/FULL with 89704 none and 0
  NON-EXEMPT refusals. Writes only under /tmp.

## SEEDS / POLICIES

- No new seeds, no new sims. Corpora are the committed r198 pass A/B/C
  (evidence/2026-11-14/perseed-endgame-r198-{,b,c}, seeds 89701–89705).
  The probe is deterministic on a fixed substrate (r198 proved pass A/B
  bit-identical on headline fields); re-running the probe would
  reproduce the same JSONs, not new evidence. The substrate check on
  the NEW master tip is the proof tests' Part-1 smoke run (probe in
  SMOKE mode on 89704), re-run after the rebase. A full 15-seed panel
  re-run on the moved master is the proof-refresh loop's job (round 15
  owed after the manifest change), not this run's.
- Policies: n/a — analyzer-only run; no bot policy is exercised.

## BINDINGS (§14 — a miss is NO-GO, never re-scored mid-run)

- M23-MIXED (new, binding): on the committed r198 pass-B corpus, the
  fixed analyzer prints M23 GO naming 89705:feast_embassy@d68/FULL and
  89704:none with NON-EXEMPT-refused-despite-ready 0.
- M23-C (binding, HOLD): pass C still scores ALL GO (analyzer RC=0),
  M23 GO with 2/2 delivered and priced full.
- M23-A (binding, HOLD): pass A still scores ALL GO (analyzer RC=0).
- PROOFS (binding): scripts/test-m23-revision-r198.js ALL PASS
  (V NO-GO/VACUOUS, G GO, N NO-GO — unchanged by the fix),
  scripts/test-m23-mixed-r199.js ALL PASS,
  scripts/test-m2c-adopted-refs-r198.js ALL PASS,
  scripts/test-corpus-purity-r198.js ALL PASS,
  scripts/test-competent-pin-r198.js ALL PASS — each re-run AFTER the
  rebase onto the master tip.
- LANDING (binding): rebase of the 3-commit branch onto master tip
  11875f939 (or its successor if master moves mid-run — then rebase
  onto the new tip and re-run proofs) with zero conflicts; ff-only
  merge; tree released; rotation-b 4→5; lock deleted.
- TELEMETRY: pass-A sums vs the r188 baseline (uw 22, won 4, peakVet
  8) — r198 already QUIET (uw 22, won 5, peakVet 7, same regime);
  re-scoring the same corpus must reproduce the same sums; baseline
  NOT rolled.

## INTERESTING FINDING (what would count)

- Any proof-test failure after the rebase (a game-code move breaking
  the probe shape or the analyzer's expectations — FAIL LOUDLY, do
  not land over it).
- The mixed case scoring anything but GO after the fix, or pass C
  regressing from ALL GO.
- A rebase conflict on the branch (the r198 files are all new names;
  a conflict would mean master grew a same-named file — investigate,
  do not force).

## OUT OF SCOPE (carried, not this run)

- r198 people-check findings (a) SAY-line repetition batching,
  (b) Indispensable middle-beats linearization, (c) doubled quotes on
  SYSTEM lines, (d) unmerged Blackberry stacks — each needs its own
  prereg + proof; documented in the r198 run note.
- C-wide: stays CUT (fresh band 89714–89721 unused).
- The app.js-only capstone-refusal voicing (in-sim slice honestly
  empty) — carried gap, not a metric miss.
- The 89704 pass-C thirst-led crunch (d53–62, 4 thirst + 2 starvation
  deaths) — named for the water-economy question (open item).
- The sat-day shift hypothesis (narration-dedup RNG consumption) —
  carried from r198; a same-run investigation item for a later panel,
  not re-probed here.

## METRIC REVIEW (to be filled at closeout; §14)

- M23-CAPSTONE (REVISED in r198, FIXED in r199): the implementation
  now matches the prereg text. The V/G/N synthetics are unchanged;
  the new M (mixed) case is the proof the revision was written for.
