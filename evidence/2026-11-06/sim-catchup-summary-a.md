# sim-catchup-summary-a — run note (Loop A 0315Z arm, closeout by main session)

**Verdict: GO — full 31-seed confirm. Land the summarize shape.**

Prereg: `evidence/2026-11-06/sim-catchup-summary-a-prereg.md` (re-registered metric
review 2115Z; held-volume accounting Correction 1, queue-snapshot method).
Game-code fix: `f363a8697` — summarize held naming catch-up (framing + 1 burst +
1 settle summary per return, <=3 lines). Branch total diff vs base `3eea6b3ab`:
59 files, 2637 insertions / 26 deletions; `src/js/game.js` 90 lines.

The 0315Z coordinator timed out before running the confirm; the main session
ran the confirm end-to-end on this branch (dead-run closeout, 2026-11-06
05:40–06:00Z). Nothing in the arm's design was changed; the confirm used the
worker's own driver, compare instrument, and prereg seeds/env verbatim.

## Pilot (worker, committed `b785201c3`) — GO

8 seeds (17021, 15003, 15009, 15091, 15211, 15215, 15220, 15221). Max delivery
3 lines/day (15221 d37) vs the 13-line verbatim wall on 17010. Guardrail (i)
ledger said==kicked exact; 0 lines lost; trajectories identical 8/8.

## Confirm-after leg (main session, 2026-11-06 ~05:40Z)

Driver `scripts/gossipcensus-trace-a.js` VERBATIM, prereg env
(COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1 POLICY=nighttravel
WOODCARRY=1 WOODWARM=0 BANKFOOD=1 STRANDNARR=1), 60 loop-days. Seeds
17001–17024 except 17021 (23 seeds). Exit 0; 23 files written to
`sim-catchup-summary-a-corpus/` (corpus now 31 files: 8 pilot + 23 confirm);
0 PENDING STAGED warnings. Log:
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/catchup-summary-confirm-after-20261106.log`.

Before leg (worker, committed `e1007e9b0`): the same 23 seeds on pre-fix code,
verbatim delivery, 23 files in `sim-catchup-summary-a-baseline/` (baseline now
31 files: 8 pilot + 23 confirm).

## Full 31-seed compare — GO (exit 0)

`scripts/awaynaming-compare-summary-a.js` — `catchup-summary-compare.md` + `.json`.

- (a) THE WALL: max single-day delivery 3 lines (15221 d37; also 17010 d13,
  17016 d13, 17020 d10 — all exactly 3). Budget <= 3. 0 summary lines failed
  to parse; 0 internally inconsistent. PASS.
- (c) Primary: 0 stranded sleep burst events after (0 in 18 windows, before
  also 0/18); 0 stranded settle lines after (before 0); 0 summary/framing
  lines said inside a stranded window. PASS.
- (i) NO SILENCING (ledger): effective said_after == kicked, exact, per kind
  per seed. 0 lines silenced on all 31 seeds. Phase-shift (descriptive only):
  non-stranded sleep burst rate 8.6% after (150/1737) vs 8.6% before. PASS.
- (b)/(ii-a) Conservation: effective said + stillHeld == kicked per kind per
  seed. 0 lines lost on all 31 seeds. PASS.
- (ii-b) Held-volume (queue-snapshot): lost == 0 on every stretch. PASS.
- (ii-c) Reconciliation: PASS. (iii-b) Trajectory identity: all 31 seeds
  identical (daysAlive, endReason, stranded nights, sleep windows). PASS.
- Before-leg loss: 0/0/0. My-gate loss: 0/0/0. Queue-snapshot notes: 0.
  Unknown fire-time positions: 0.
- Sense-test pool (e): every summary line quoted in the compare md. The
  17010 wall — 13 verbatim lines — is now 3 lines on day 13 (framing + burst
  "They argued over names for 4 beasts — 4 words, 4 debates" + settle "They
  settled names for 5 beasts"), with the full ledger conserved (33/33/33
  word/debate/settle, lost 0).

## Balanced panel (§15) — recorded as returned

`sim-catchup-summary-a-panel-after/` (8 cases, 0 cached, exit 0) vs the
pre-fix `sim-catchup-summary-a-panel-before/`. Compare decision:
**review_required** — exactly the rereg precedent the prereg named: every
paired metric delta is exactly 0 (Before == After on all 28 metrics; the
review_required comes from coverage-driven statuses — insufficient /
not_observed on a few luck percentiles — not from any signal). Trajectory
identity (d), 31/31 identical, remains the judge for gameplay neutrality.
Output: `catchup-summary-panel-compare.md` + `.json`.

## Proof test — 44/44

`scripts/test-catchup-summary-a.js` with the prereg env: **44/44 checks pass**
(det-gate ON vs OFF trajectories identical on fixed code; 17021 anchor:
52 days, village-lost, 0 stranded nights — the current-substrate state, also
seen in the fresh before leg and in the enddaybeats control run, i.e. a
substrate move, not the fix; wall leg 15221 <= 3 lines with the revised
ledger exact; queue drained after the big delivery).

## Landing recommendation

**Merge this branch.** The two catch-up shapes are alternatives and only one
can land; the install shape (sim-catchup-install-a) produced nothing durable
(branch tip == base, zero unique commits, clean tree — released abandoned),
so the summarize shape is the surviving candidate, and its confirm is GO on
all 31 seeds with 0 lines lost and 31/31 identical trajectories.

The 13-line catch-up wall on 17010 is now a 3-line summary at the fire. The
wall itself was never the game — the summarize shape is the loop's answer to
the awaynaming conservation price, and it holds.

## Closeout bookkeeping

- Arm index clobber (23 D + 23 ?? same paths, pure clobber — worktree hash ==
  HEAD blob) repaired by the main session via `git ls-tree -r HEAD |
  update-index --index-info`; tree verified clean (`git status` empty,
  `git diff HEAD` 0 lines) before any of this work.
- Uncommitted at note time: 23 confirm-after corpus files + compare md/json
  + panel-after dir + panel-compare md/json + this note. Commit, rebase onto
  current master, `check.js` gate, ff-merge, release — main session.
