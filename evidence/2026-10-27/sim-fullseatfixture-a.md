# sim-fullseatfixture-a — the fullseat-diag TEST mock fixture now carries the scale term (TRAP-CONFIRMED + fixed)

Run: flesh-out loop, axis scale-onramp. Worktree:
~/workspace/worktrees/sim-fullseatfixture-a (branch sim-fullseatfixture-a).
Preregistration (binding, committed BEFORE any judged work):
evidence/2026-10-27/sim-fullseatfixture-a-prereg.md (commit 6ad5bb38).
Verdict: **TRAP-CONFIRMED, fixed** — no game behavior changed, no
default flipped, test/mock-fixture scope only. [needs-eyes] does NOT
apply (test-only scope).

## Plain words

On 2026-10-27 Steve ruled the full seat needs national standing, and
the scalegate arm enforced that in the real gate and fixed one test
fixture. This arm checked every other test and instrument that talks
about the full seat. One of them was still living in the past: the
practice village used by the full-seat measuring instrument said a
regional village that had done everything else was ready for the full
seat, while the real game would only offer it the lesser seat. A
future reader trusting that practice village would have learned the
wrong rule. It now says what the real game says: regional is not
enough, national is. Nothing about how the game plays changed.

## Canon read

docs/CANON.md, then docs/TABLE.md. Contract used: the full seat keeps
the national bar (national/global scale, wave bars 5/5/4/3/2, 3+
contests, 3+ crises, stage >= 2 in code, food-thesis deeds); the
lesser seat requires regional+. Code as found: deedGateReady() ok now
includes scale (scalegate arm). No canon invented. No src/js file
touched by this arm.

## The trap, precisely (pre-registered test)

Village meeting EVERY full-seat bar except scale: wave bars 5/5/4/3/2
distinct fought, contestsSurvived 3 (4 in the mock inputs), crises 3,
integration stage 2, sentimentTaught + feastSurgeUsed, rank REGIONAL.
- Real deedGateReady(): ok FALSE, seat lesser (the downgrade, not a
  loss). National twin: ok TRUE, seat full.
- Old mock (git HEAD text, evaluated by the proof): ok TRUE for the
  regional village — the trap, demonstrated, not asserted from memory.
- Fixed mock: ok FALSE for regional, TRUE for national/global, FALSE
  for village — agreeing with the real gate on every rank.

Why the mock counts (prereg scope rule): mockGame builds a
deedGateReady-shaped gate object and derives the mock tableSeat from
its ok. It IS claiming to compute ok; it is not a deliberate
isolation of another term. The diag instrument's component tests all
use this mock as the gate's stand-in, so the old-ok reading would
have propagated to any future fixture built on it.

## The fix (fixture/mock scope ONLY)

- scripts/test-fullseat-diag-20261021.js, mockGame(): ok now includes
  `&& (f.rank === 'national' || f.rank === 'global')`, with a comment
  citing the 2026-10-27 scale ruling and naming the trap. The gate
  object also gains a `scale` field (national/global), matching the
  real breakdown. The ok expression is self-contained in `f` (no
  hidden local) so a reader sees the term at a glance.
- scripts/policies/fullseat-diag.js, comments ONLY (zero behavior
  change): the header no longer claims scale is "REPORTED but NOT
  gating" (the 2026-10-13 reading, superseded 2026-10-27); the BARS
  comment now states scale is enforced in `ok` and is read from the
  real gate's ok/seat/rank, not a distance bar. The instrument itself
  never computed ok — snapFullSeat reads g.ok and the seat from the
  real gate — so it reported the new truth automatically; only its
  words were stale.

NOT changed, deliberately:
- The mock's non-full seat fallback (`f.seat || 'none'`) is untouched:
  the mock never implemented lesser-seat logic (its own bars differ),
  and callers supply f.seat when they need a lesser seat. A regional
  all-bars village with no f.seat reads seat 'none' in the mock while
  the real gate says 'lesser' — a stub limitation, not a scale-ok
  trap, and widening the mock to implement lesser logic would be
  scope creep. The judged quantity is ok, and ok now agrees.
- The superset test's dated 2026-10-14 audit note ("the full seat
  still has no rank bar — design question") is left as dated history:
  the same file's 2026-10-27 UPDATE block directly below it already
  answers it, and the fixture itself sets nationalLive.

## Files checked (binding list + sweep — cleared or fixed)

1. scripts/test-fullseat-superset-20261014.js — ALL assertions:
   CLEARED. Stage-0 legs still fail ok on real gate; the full leg's
   fixture sets nationalLive (scalegate fix) and passes; the no-surge
   leg still fails ok. No other assertion computes ok. Run: 9/9.
2. scripts/test-fullseat-diag-20261021.js — FIXED (above). All ten
   component/guard checks pass after the fix; no existing assertion
   depended on old-ok (every full-seat fixture in the file already
   carried rank national; the one village-ranked fixture fails ok on
   waves regardless).
3. scripts/test-fullseat-diag-sweep.js — CLEARED. No mock ok: it runs
   the real game and reads snapFullSeat from the real gate. Its
   COMP_ORDER/binding lists deed components only (scale is not a
   distance bar); the snap's ok/seat/rank fields carry scale.
4. scripts/policies/fullseat-diag.js — COMMENT FIX ONLY (above).
   snapFullSeat logic untouched: s.ok = !!g.ok, seat from real
   tableSeat. Full-env run: 14/14 (see below).
5. Repo-wide sweep for other deedGateReady/tableSeat mock DEFINITIONS
   in scripts/ (callers excluded): only three definitions exist.
   - scripts/journey-scale3-20261012.js, scripts/journey-scale5-
     20261012.js: thin wrappers delegating to the REAL tableSeat —
     cleared, not mocks.
   - scripts/test-wintrace-20261015.js fakeGame: replays recorded
     rows; tableSeat returns the recorded pricedSeat and it defines
     NO deedGateReady — a deliberate replay stub, not a gate
     computation — cleared under the prereg scope rule, not "fixed".
   - Helper scripts analyze-fullseat-20261021.js,
     probe-fullseat-20261021.js, fullseat-transcripts-20261021.js:
     probe reads real scaleRank; none defines a gate mock — cleared.
   - Stale-comment sweep also found the superset header note above
     (dated history, corrected in-file) and unrelated "not gating"
     phrasing in windfall analyzers (about their own metrics, not the
     seat gate) — cleared, out of scope.

## Proof (before/after legs on the FILE itself)

scripts/test-fullseatfixture-a.js — **21 passed, 0 failed.**
- NEW formula (extracted from the working file by paren scan, not
  copied): regional FALSE, national TRUE, global TRUE, village FALSE.
- OLD formula (extracted from git HEAD text, same inputs):
  regional TRUE (trap demonstrated), national TRUE. Run before the
  fix commit; after the fix commit HEAD text IS the fixed text, so
  the OLD leg then reads the fixed formula — the pre-commit trap
  demonstration is this evidence, not a re-run.
- Real gate (real loaded Game, godpath/lib harness, seed 7, same
  bar-setting as test-scalegate-a.js): regional ok FALSE + seat
  lesser + all non-scale bars pass (the flip is exactly scale);
  national ok TRUE + seat full. Mock agrees with real on both.
- File-text legs: new mock carries the scale term + 2026-10-27
  comment; instrument header no longer says "NOT gating" and cites
  the ruling; superset fixture sets nationalLive.

No-regression runs (all green):
- scripts/test-fullseat-diag-20261021.js, FULLSEAT=1: 10/10
  component/guard checks. (Without FULLSEAT the recordDaily check
  fails 9/10 — that is the test's own env gate, not this fix: the
  layer is off without FULLSEAT=1, so nothing is recorded. Verified
  by the FULLSEAT=1 run passing, and the failure predates this arm's
  change in shape.)
- Same test, FULL env (FEASTSCALE_R13 + TRIBFLOOR + WINPURSUIT +
  WINDEFER + SEATDRIVE + FULLSEAT): 14/14, including READ-ONLY
  trajectories identical 30d (2 seeds) and DET-GATE paired 60d runs
  byte-identical (2 seeds).
- scripts/test-fullseat-superset-20261014.js: 9/9.
- scripts/test-scalegate-a.js (untouched, sanity): 22/22.
- node --check on all three touched/added scripts.

## Village assessment / sense test

Scope note (SENSE-TESTING LAW): this arm read no villager transcripts
— the investigation touches gate state, not dialogue — so no sense
judgement is offered beyond gate honesty, which IS proven: a
regional village meeting every deed bar is told 'lesser', never
'full', by both the real gate and the fixed mock. No village is
promised a full seat it cannot sit in by any fixture this arm
checked. No villager behavior was observed or changed; nothing here
bears on routines, goals, or dialogue.

## Metric review

- The pre-registered metric (fixture/real ok agreement on the
  regional-false + national-true villages, per file) held with no
  mid-run re-score. The one judgement call worth recording: the
  verdict rule counts only ok, not the mock's seat fallback — a
  regional all-bars village still reads seat 'none' (not 'lesser')
  in the mock when the caller supplies no f.seat. That gap is
  disclosed above rather than scored, because the mock never claimed
  lesser-seat logic; if a future run wants seat agreement too, it
  should pre-register seat as a judged quantity and implement the
  lesser bars in the mock as its own arm.
- Proposed revision for the NEXT run (not this one): none to the
  metric itself. The sweep method worth keeping: judge mocks by
  DEFINITION (files that build a gate object), not by mention
  (files that merely call the real gate) — the mention list was
  ~200 files, the definition list was 3.
- Balanced panel (§15): not applicable as a separate artifact — this
  arm changes no game behavior, so there is no before/after sim
  panel to compare; the before/after legs above ARE the comparison
  (old formula vs new formula on identical inputs).

## Loud failures / deviations (none hidden)

- The first safe-commit in this run (prereg, 6ad5bb38) hit the known
  index-clobber class (commit correct, main index showing the file as
  deleted + untracked). Repaired with the recorded recipe
  (update-index --cacheinfo from the HEAD blob) and verified with
  empty status + matching hashes before any further work. The fix
  commit below was re-checked the same way.
- Master moved under this run (60e260dc0 -> a70555396, two
  sim-cultnest-b commits touching none of this arm's files). This
  arm rebased inside its own worktree only (clean, no conflicts; new
  hashes 306819128 prereg + 9e1bcf1a7 fix) and re-ran the proof after
  the rebase: test-fullseatfixture-a 20/20 (the 21st pre-rebase check
  was the trap demonstration, which correctly skips once HEAD holds
  the fixed text), diag test 10/10 (FULLSEAT=1), superset 9/9 — all
  green post-rebase.
- No EPERM flap on .git writes in this run. No push, no version bump,
  no live verification — merging to local master is the
  coordinator's job. This worktree reports ready-to-merge, pending
  coordinator.

## Files

- Prereg: evidence/2026-10-27/sim-fullseatfixture-a-prereg.md
- Evidence (this file): evidence/2026-10-27/sim-fullseatfixture-a.md
- Proof: scripts/test-fullseatfixture-a.js
- Fixed: scripts/test-fullseat-diag-20261021.js (mock ok + scale
  field + ruling comment)
- Comment fix: scripts/policies/fullseat-diag.js (header + BARS
  comment only; zero behavior change)
- Untouched: every src/js file (progression.js gate as ruled and
  landed by sim-scalegate-a); sibling trees untouched.
