# sim-winnability-round-0915 — coordinator evidence (ADOPTION run, Loop A)

**Run:** `fleshout-20261117T0915Z`, axis winnability chain.
**Adoption of dead Loop A run `fleshout-20261117T0015Z`.** Master at run start
`b4cdf252d`; landed at `a61f03d22`, merged locally pending ship.

## Adoption diagnosis (why this run is an adoption, not a fresh round)

- No fleshout lock existed at 09:15Z. Loop A claim `fleshout-20261117T0015Z`
  was live (arms planignite-fix-a + vetreengage-confirm-a + trickshare-a
  adoption), but its worktree heartbeat was `2026-11-17T01:53:25Z` — 7h+
  stale — and the last tree write was 02:25Z. Per the closeout rule the
  run was dead; the claim is retired to `.DEAD` at this closeout.
- Two of its three arms were already ON master (verified by merge-base):
  sim-trickshare-a `580510a5d` (PILOT NO-GO, evidence-only) and
  sim-vetreengage-confirm-a `2ac3052b0` (CONFIRM NO-GO — pilot GO does not
  replicate; trio pick dropped before depart). No work needed on either.
- Only sim-planignite-fix-a was stranded: lever + proof committed at
  `cca565ec6`, sweep killed after 1/8 seeds per leg (seed 102601 only).
  The tree also carried a staged revert (win-plan.js lever removal +
  staged deletions of prereg/scripts). All 5 affected files were verified
  byte-identical to HEAD blobs and worktree `win-plan.js` == HEAD, so the
  staged revert was a dead-run artifact, NOT a verdict; the tree was
  restored to clean HEAD with `git reset` and re-heartbeated (09:20:29Z).
- Loop B `fleshout-loop-b-20261117T0830Z` LIVE on sim-deathcleanup-b
  (heartbeat 09:06Z, fresh) — NOT touched. Its band 103231–103238 does
  not collide with this arm's frozen band 102601–102608.

## Arm: sim-planignite-fix-a — PILOT GO (8/8 frozen bars)

Worker brief: rebase onto current master, re-run the full 8-seed x 2-leg
sweep on the rebased tip, judge strictly vs the frozen prereg
(`evidence/2026-11-16/sim-planignite-fix-a-prereg.md`). Full verdict in
`evidence/2026-11-16/sim-planignite-fix-a.md`; headline here.

The fix: `winPlanHavenTick` initializes the plan store on first call when
`PLANFIX=1` (env-gated default-OFF, `src/js/win-plan.js` only). The DIAG's
catch-22 — the store never exists until a wave-3+ seed or agency kill, so
the daily Haven check can never be the first spark — is closed.

Before/after on identical seeds (band 102601–102608, 150d, competent
verbatim, control → armed): creates **20 → 48**, departs **91 → 181**,
unexplained havenTick calls **920 → 0**, no-plan villages **4/8 → 0/8**
(both DIAG no-plan villages 102601/102607 ignite: 8 and 7 creates).
First creations day 6–9 on every armed seed. Proof
`scripts/test-planignite-fix-a.js` 47/47 on the rebased tip.

Wall (control → armed): national by standing 6/8 → 3/8, by rank 0/8 → 0/8,
table 0, wins 0, wave-4 unlocked 8/8 → 8/8, wave-5 unlocked 6/8 → 3/8,
median survival 151d → 151d, wave-4 kills 33 → 29, wave-5 kills 8 → 7,
total deaths 678 → 797.

## The price (not a re-score; it sets the confirm's bar)

Panel decision `review_required` on one metric: village deaths
+14.9/run (CI 4.1–24.4). Death-cause split names the mechanism:
expedition deaths **113 → 280 (+167)** while villager combat is flat
(303 → 306). The fix sends villagers hunting and the hunting kills them
— without buying kills (wave-4 kills 33 → 29). Launches go out
targetless and green (`target: null, partyKillers: 0`). The confirm must
carry a kills-per-departure bar and watch whether launched parties ever
carry a killer or a target; a confirm that only re-measures ignition
would rubber-stamp departures for zero extra kills. The lever stays
env-gated default-OFF: nothing in live play changes until that question
is answered. Caution recorded in the evidence: the wave-5 drop (6 → 3)
is inside the noise the base itself generates (base drift alone moved
wave-5 4 → 6 between the DIAG control and this tip's re-run control).

## Landing

- Rebase onto master `34bcb7b0b` (journey-deepening r232 landed mid-run;
  zero file overlap with the branch) — clean, 4 commits replayed, new
  tip `a61f03d22`.
- Proof re-run on the rebased tip: first attempt 43 passed / 1 failed —
  the failure was a write-flap EPERM (child could not write
  `/tmp/planignite-fix-proof-d2off.json`; file left at 0 bytes, the
  flap's truncate-then-refuse signature — not an assertion). Re-ran
  after the flap cleared: **47/47, exit 0**.
- `git merge --ff-only sim-planignite-fix-a` (unpiped, exit 0): master
  `34bcb7b0b` → `a61f03d22` (30 files, lever + instruments + corpora +
  panel + evidence). Tree released `done-merged`, worktree removed,
  branch deleted. Main tree clean at closeout.
- `check.js --quick` on the arm: 333 passed / 7 failed, 0 attributable
  (worker's baseline comparison on clean master `7328a88fa`; 4 stale-proof
  failures + 3 load artifacts under box load 12–17).

## Telemetry deviation check

`telemetry-check.js` REFUSED the recorder corpus (all 8 rows carry
top-level `anchorCommit`; sweep recorder rows, not runs) — the same
documented refusal as the last three arms. Baseline NOT rolled. No
investigation item: the refusal is the instrument's shape rule, and the
arm's own balanced panel is the §15 instrument for this comparison.

## Metric review

- The prereg's frozen cost bars (starvation ≤ control+2, median ≥ 0.8×)
  did not bind — both pass easily. The cost that actually bit was total
  deaths, which the prereg did not bar. That is a prereg gap the confirm
  must fix: bar deaths and kills-per-departure, not just starvation.
- Base drift is now a measured quantity on this band: the DIAG control
  (base `7bb50f3dc`) had no-plan 2/8 and 33 creates; this tip's re-run
  control has no-plan 4/8 and 20 creates. The prereg's rule (judge on
  the re-run control, DIAG corpus as cross-check only) held and mattered.
- The store-never-initialized taxonomy row works: 0 armed vs 4 control,
  firing exactly on the control villages that never ignite.

## Infrastructure

- Write flap episode ~10:44–10:54Z: worker's final heartbeat blocked
  (EPERM, two attempts); coordinator proof re-run's D2 child EPERM'd on
  a `/tmp` write (0-byte file left). Writes verified working again at
  10:54Z; proof re-ran green. No data lost.
- Pre-flight `worktree-reap.sh`: 12/16 active, no live tree touched
  (LOUD notes only for uncommitted-changes trees, which the reaper never
  auto-removes).
- Safe-commit index clobber hit the worker's evidence commit; repaired
  via `ls-tree -r HEAD | update-index --add --index-info`, verified
  (status empty, diff empty, hash matches).

## Next blanks, in order

1. **planignite-fix CONFIRM** with a kills-per-departure bar (+ deaths
   bar) — the pilot's named next step. Not started here; it needs its
   own prereg.
2. Death cleanup BUILD (deadplan-b's named lever) — Loop B's live arm;
   NOT touched.
3. Trick question, profile-gate, veterans-alive-together (#427),
   answercourt / competent seat-taking / family-7 — all Steve-calls,
   NOT taken.

## Closeout

- winnability chain stays converging (NOT converged): plan ignition is
  proven, but wins still come only through default-OFF instruments, the
  full seat is untested on this band, and the fix's departures do not
  yet convert into kills. The standing directive stands.
- Claim `fleshout-20261117T0015Z.json` retired to `.DEAD`; this run's
  claim deleted; lock deleted. Evidence:
  `evidence/2026-11-16/sim-planignite-fix-a.md` (arm),
  `evidence/2026-11-17/sim-winnability-round-0915.md` (this file).
