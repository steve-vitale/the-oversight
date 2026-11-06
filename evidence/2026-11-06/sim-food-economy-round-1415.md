# sim-food-economy-round-1415 — Loop A coordinator evidence, 2026-11-06

Run: `fleshout-20261106T1415Z` (Loop A, scheduled 08:15:39 CST / 14:15:39 UTC).
Axis: **scale-onramp / winnability** (topmost, converging, NOT converged).
Rotation file: `3` (convergence work does not cycle it).

## 1. Stale-lock recovery (the run's first act)

- Lock at run start was `fleshout-20261106T1115Z` (created 2026-11-06T11:17:50Z,
  2h58m old). Its trees' heartbeats were 2h41m stale (sim-mootgate-a 11:35:04Z,
  sim-gorgeharness-a 11:35:05Z) while journey loops heartbeated fine
  (journey2-crisis 14:14:13Z), so no flap was masking liveness.
- Pre-flight: main tree clean, disk 23%. Only live claim was the 1115Z one
  (food-economy). Loop B's 1130Z run had finished (tracker updated, commit
  c6530f21 on master); no live B claim at 14:15Z.
- The 1115Z coordinator timed out at 7200s, but the main session finished both
  arms' after-legs + evidence in-session. Both arms were complete with GO
  verdicts, so this run ADOPTED and LANDED them instead of re-running.
- Recovery executed 14:31:48Z: deleted the 1115Z lock, retired its claim to
  `fleshout-20261106T1115Z.json.DEAD`, created my lock + claim
  (`hidden_files/lever-claims/fleshout-20261106T1415Z.json`, arms
  `sim-fightinterior-a` + `sim-killersurvive-a`, band 53001–53008), heartbeated
  both adopted trees.
- Live-worker caution observed: gorge tree files were still being written
  14:18–14:19Z (panel/after/cases) while the main session closed out the 1115Z
  run. I stood down on that tree until writes stopped (gorge newest write
  14:24:18Z, moot newest 14:06:52Z), then landed.

## 2. Adopted arms — verdicts and landings

### sim-mootgate-a (food-economy / narration) — GO, landed

- Evidence: `evidence/2026-11-06/sim-mootgate-a.md` (commit 015d99e2d).
- Verdict GO: stranded summons 0/22, convening 57 vs 54, median survival
  60 vs 60, proof 60/60.
- Fix: `mootConveneHeld()` gate in `src/js/betrayal.js` (+34 lines, exile
  exception, fail-open), applied in npcMootTick + playerCaseTick. `[needs-eyes]`.
- Pre-rebase fix commit ce961ecd3. Rebased clean 6/6 onto b13016733
  (tip d68e63d79, fix commit e53e86531); proof 60/60 green with substrate env
  `COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1 POLICY=nighttravel
  WOODCARRY=1 WOODWARM=0 BANKFOOD=1 STRANDNARR=1`. Merged `--ff-only`.

### sim-gorgeharness-a (food-economy / narration) — GO, landed

- Evidence: `evidence/2026-11-06/sim-gorgeharness-a.md` (commit 568007390).
- Verdict GO: away gorge 3→0, haven 80/80, trajectories identical on 40/40
  seeds, panel all-zero deltas, proof 42/42.
- Fix: `src/js/havenGrowth.js` — nightly gorge lines gated on
  `scholarAtHaven()`, drift-off line relayed via `sayHavenNews(kind 'raid')`;
  mechanics untouched. `[needs-eyes]`.
- Pre-rebase fix commit 7c0b27aba. Rebased clean 4/4 onto b13016733
  (00dc95369, proof 42/42), then again 4/4 onto d68e63d79 (tip f2c4a6708,
  fix commit 6aeba1c88), proof 42/42 again. Merged `--ff-only`.

### Landing mechanics

- Master moved 12cac2ec7 → b13016733 (journey crisis r132) before the rebases.
  Overlap check cc4345e1e..b13016733: 17 commits, zero overlap with arm files;
  only `src/js/build.js` changed among src/js.
- Both proofs re-run on merged master: gorge 42/42, mootgate 60/60, green.
- Fix diffs verified by `git show` against the evidence descriptions.
- Master tip after both merges: f2c4a6708. (A journey commit, f1a070306, landed
  on top of that afterwards; see §6.)
- Trees released as done-merged and removed after landing (branches deleted);
  `git worktree list` + `git status --short` verified clean afterwards.
- The gorge tree held 3 untracked scratch logs
  (`.gorgeharness-after-pilot.log`, `.gorgeharness-after-screen.log`,
  `.gorgeharness-panel-before.log`); they duplicate the committed corpus and
  were preserved under
  `hidden_files/adopted-logs/sim-gorgeharness-a/` before tree removal.
  The mootgate tree was fully clean.

## 3. Telemetry deviation check

- Before the merges, both corpora read LOUD on national 12→0, table 16→0,
  wins 16→0. This is the known artifact class: narration censuses carry no
  scale-wall fields. Baseline NOT rolled.
- Baseline: `hidden_files/telemetry-baselines/scale-wall.json`.

## 4. Secondary deliverable — `lastLingererOffer` is dead state in the game

- The gorge arm's supplementary pointer subagent was cancelled before
  finishing; the coordinator closed it by grep.
- FOUND READER in the policy layer only: `scripts/policies/sortietarget.js:32`
  and `scripts/policies/sortieretry.js:27` read `Game.state.lastLingererOffer`;
  writer is `src/js/havenGrowth.js:260`.
- No src/js reader besides the writer → **DEAD STATE in the shipped game code;
  readers only in sim policies.** The gorge evidence file does not include this.

## 5. `check.js` reconciliation (the investigation that had to close first)

`node scripts/check.js --quick` on merged master: **283 passed, 7 failed in
486s** — exactly the standing profile recorded by the 0730Z and 1130Z runs
(and by the journey loop's f1a070306, "gate 283/7 standing-set"). The two
failures visible in the tail are the known pre-existing quick families
(test-capable-bot-20261014 food deed at first use; test-establishment-r20-
fixes-20261020 racks-full voice next-day gate). My arms broke nothing in the
quick suite.

Important scoping fact found while digging: `--quick` runs only tests tagged
`quick` (check.js filters `j.tags.includes('quick')`). Most moot/gorge tests
are NOT quick-tagged, so they were never in the 283/7 at all. Direct runs of
8 non-quick moot/gorge/betrayal/havenGrowth files on merged master:

| test | result | classification |
|---|---|---|
| test-betrayal-fixes-20261008.js | exit 1 | pre-existing: `ReferenceError: Text is not defined` at `genCharacter` — harness staleness, fails in setup before any moot code |
| test-moot-justice-aftermath.js | exit 1 | pre-existing: same `Text is not defined` |
| test-social-party-betrayal-state-20261008.js | exit 1 | pre-existing: same, via harness-detective.js |
| test-gorgcall-20261014.js | exit 1 | pre-existing: `Cannot find module './policies/gorgcall'` — module absent on BOTH the pre-merge base b13016733 and merged master (verified via `git ls-tree`) |
| test-enddaybeats-fix-a.js | exit 2 | pre-existing: fails fast without `COMPETENT_FEAST=0` env — the test's own requirement |
| test-awaynaming-cap-a.js | exit 0 | passes |
| test-gorgedrive-20261014.js | exit 1 | see below |
| test-haven-growth-20261010.js | exit 2 | pre-existing: `FAIL havenGrowth.js loads in index.html order` / `TypeError: Game.havenTier is not a function` at test line 76. `havenTier()` IS defined in `havenGrowth.js:137`; my change did not touch it. Load-order staleness in a 2026-10-10 test; fails at load, before any gorge code runs. |

### test-gorgedrive-20261014.js GREEN — analysed, not a regression

The failing assertion is `ok(!said.some(t => /gorges at the treeline/.test(t)),
'GREEN: no gorge line after the answer')`. The GREEN part: 25-day run (seed 11),
inject a lingering 'cancellation' raider on the haven tile, gorgeDrive marches
the scholar to it, fight, `tbEnd('fled')`, then a direct `Game.havenGrowthDaily()`
call, asserting no gorge line appears in the captured `said` window.

Why this cannot be caused by the gorge gate: the gate only NARROWS the nightly
gorge say (fires only when the scholar is at Haven). The new code's nightly
gorge lines are a strict subset of the old code's — the gate can only remove
lines, never add one. The asserted line is a nightly gorge line, and the
drift-off relay text ("paces the treeline one last night... The gorge is
over") does not match the asserted regex. The failing line must therefore also
fire on the pre-merge code. Likely cause: another lingering raider exists after
the 25-day seed-11 run (the test clears only the haven tile, not all lingerers),
and the scholar is at Haven at the final call. This is a test-fragility finding
(recorded in `hidden_files/sim-findings.md` as open), not a landing blocker.
Residual caveat, stated honestly: the moot gate can shift WHEN a trial moot
consumes RNG during the 25-day run, so the seed-11 trajectory could in principle
diverge from the pre-merge one; the arm proofs' det-gates (trajectory identity)
passed, which bounds that effect. A definitive baseline run was attempted twice
and blocked by the EPERM flap (see §8); the subset argument plus the identical
283/7 quick profile plus both arm proofs green on merged master is the basis
for proceeding.

Exoneration already established for the moot side: `mootConveneHeld` exists only
at betrayal.js:5429, 5478, 5518 — nowhere near `genCharacter` or the `Text`
global.

## 6. What landed on master around this run

- f1a070306 (journey loop, after my merges): "journey crisis r132: amend C3
  to NO-GO (full transcript read: 4 FAIL + 7 MARGINAL, loop mechanism) + gate
  283/7 standing-set" — independent corroboration of the 283/7 standing set.
- Local master is ahead of origin/master (30fe8dc00, batch ship bump); the ship
  loop owns all pushes/bumps/live verification. This run reports "merged
  locally, pending ship" and does NOT push.

## 7. Tracker gap — the missing 0930Z stageally-confirm NO-GO

The Loop B 0930Z run has **no tracker entry at all**, and the 1130Z entry still
lists "(1) confirm stageally on reserved band 53001–53008" as an open blank —
stale. The confirm already ran: `evidence/2026-11-06/sim-stageally-confirm-b.md`,
verdict **NO-GO**. Band 53001–53008, 150d, competent vs staged: kills 9→3,
TB survival 29.4%→13.5% (worse armed), post-blood kills 4→1, living pair 0/8
both, first-killer survival median 9.5d vs 19d bar. Mechanism reproduces (ally
presence 44%→73%, party-days ≥2 16→141, rally 27/27). Pooled n=16 reads GO only
because pilot seed 55007 carries every headline. Its next blanks: (1) fight
interior with company present; (2) first-killer survival; (3) why baseline
killed 9; (4) 1-round solo Congregation kill (53006 d149) damage trace;
(5) party persistence across succession (design question); (6) pending
encounters (unmeasurable). This is recorded in the tracker by this run.

### finishprobe (context for the new arms)

`evidence/2026-11-06/sim-finishprobe-a.md`: Stage 1 DIAG-GO via P3; Stage 2
NO-GO by arithmetic — even granting every round as a strike + one aimed strike
at 2.5x, at most 1/38 lost fights flips; kill rate 7.5% < 10% bar;
post-first-blood 0. "A finishing move cannot fix a fight the scholar does not
live long enough to finish. The binding constraint is survival time × damage
per strike vs entry HP — a game-balance fact, not a fight-policy gap."
Game-code proposal NOT built — Steve call: (a) survival time/armor mitigation,
(b) damage/strike, (c) entry-HP wounding, (d) party damage.

## 8. This round's arms — collision, and the arm that survives

Claimed at 14:31:48Z (before the Loop B claim below was known to this run):
(1) sim-fightinterior-a, (2) sim-killersurvive-a, shared band 53001–53008.

**Collision found at 15:07Z while closing the adoption:** Loop B's run
`fleshout-loop-b-20261106T1430Z` is LIVE, claim file
`fleshout-loop-b-20261106T1430Z.json`, arms `sim-tableoffer-b` +
`sim-fightinterior-b`, axis "scale-onramp / winnability chain", started
14:30:00Z — one minute before my claim. Its note takes the 1130Z next blanks,
including "(b) DIAG the fight interior once company is there -
stageally-confirm NO-GO ... damage/staying/finishing with company present is
the open problem." Loop B's sim-fightinterior-b is instrument-only (zero
src/js) and is the SAME diagnosis my sim-fightinterior-a would do, on the same
band. **sim-fightinterior-a is DROPPED** — standing down to Loop B's live claim
rather than duplicating it. My claim file is updated to a single arm.

**Kept: sim-killersurvive-a** (stageally-confirm blanks 2 + 5). First-killer
death-channel trace on 53001–53008 + party-persistence-across-succession
policy probe (default-OFF instrument). GO bar shape: living pair ≥1 seed OR
post-first-blood wave-4 kills ≥3, guards median survival ≥ baseline −10d, no
new death mode. Complementary to Loop B's fight-interior (inside-fight) work:
killersurvive is post-kill survival channels + succession persistence. No file
overlap (Loop B's arm is instrument-only in its own tree; mine is policy-side
in its own tree). Baseline policy `scripts/policies/competent-stageally-a.js`
(landed, use verbatim). No gate/price/deed/readyDemand change. If the variant
needs game-code support, the worker reports DIAG-only + names the engine change.

### EPERM flap during this run

- The baseline-archive comparison (git archive b13016733 → /tmp) was hit by
  the EPERM flap: tar writes refused ("Operation not permitted") across the
  tree. The failed full-repo extraction also filled the 512M /tmp tmpfs
  (510M of partial files); cleaned by hand (`rm -rf /tmp/base-b13016733`),
  /tmp back to 509M free. A sparse retry (src/js + scripts + src/data +
  index.html) was EPERM-blocked the same way. No data lost; the flap flaps,
  it does not stick.
- AGENTS.md lesson applied: retry the blocked write rather than working
  around it; never hand-edit a flap-truncated file.

### Orphan tree (observed only, NOT touched)

`sim-ctraj-b` remains in `git worktree list` (locked, NOT in the registry) and
shows staged deletions of `.nojekyll` / `.vercelignore` / `AGENTS.md` / icons.
Flagged in this report; not touched.

## 9. Metric review

- Pre-registered metrics bound the adopted arms (their own evidence files
  carry the headers); this coordinator file is a landing/closeout record, not
  a new judged sim. The check.js 283/7 standing profile is re-confirmed, not
  re-scored.
- The gorgedrive GREEN failure is recorded as a test-fragility finding rather
  than a metric miss: the test is not in the quick suite, its asserted line
  cannot be added by the landed gate, and its most likely cause (a second
  lingerer on seed 11) is independent of the fix. If a later baseline run
  shows it green on b13016733 and red on the merged tip, this verdict must be
  revisited — the finding is written as open for that reason.
- The stageally-confirm NO-GO stands as recorded; the pooled-n=16 GO reading
  is rejected (single-seed carry), per the confirm evidence.

## 10. Closeout status (this file's commit)

- Coordinator evidence committed via `scripts/safe-commit.sh` (this commit).
- Tracker + findings updates follow in the same closeout (see tracker).
- Claim file updated to the single surviving arm; deleted at run end.
- Lock deleted at run end.
