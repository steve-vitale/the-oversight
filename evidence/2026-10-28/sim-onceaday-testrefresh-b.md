# sim-onceaday-testrefresh-b — stale R13/R14 fixtures refreshed to the day-roll-aware precheck

Run: fleshout-loop-b-20261028T1530Z, axis food-economy.
Arm: sim-onceaday-testrefresh-b, tracker blank 1 from run
fleshout-loop-b-20261028T1430Z.
Worktree/branch: sim-onceaday-refresh-b. No push, no version bump,
no live verification — ready-to-merge for the coordinator; the ship
loop owns deploys.
Prereg: evidence/2026-10-28/sim-onceaday-testrefresh-b-prereg.md
(committed BEFORE any judged fixture run — see Order below).

## Verdict: GO

The refreshed test passes all 112 fixtures on two consecutive runs,
with R13/R14 now asserting exactly the landed behaviour: a repeat
tap on the same day refuses before anything is paid.

## What changed, in plain words

The game already fixed this; only the test was out of date. When a
player taps a once-a-day ability (a war cry challenge, or throwing
their weight around to end a dispute) a second time on the same day,
the game now checks first and says no before charging anything. The
old test still expected the old behaviour: the tap would pay its
time cost and silently burn 40 food-energy before being refused.
That old behaviour is gone — the test was the only place still
describing it — so this arm updated the test's expectations and its
explanatory comments to match the game as it actually plays today.
No game code changed, no other test changed, and nothing about how
the game plays changed.

Concretely, in scripts/test-refusalprecheck-b.js only:

- R13 (war_cry challenge, repeat) and R14 (intimidating_presence
  end_it_before, repeat), both at the non-boundary position
  dayTicks = 100, now expect `refuse-prepay-onceaday` instead of
  `refuse-postpay-onceaday`.
- The R13/R14 assertion block now requires: result false, day
  unchanged, dayTicks unchanged, kcal unchanged, the day flag
  (challengeDay / postureDay) unchanged, and the once-a-day refusal
  sentence present.
- The header comments were rewritten: the "pinned residual"
  language (post-payment refusal, ticks consumed, silent 40 kcal
  burn) is replaced with the day-roll-aware precheck description,
  citing evidence/2026-10-28/sim-onceaday-scope-b.md §1 and
  docs/ABILITY-REFUSALS.md §5. The old decision paragraph is kept
  recognisable as superseded history, not deleted silently.
- The `_actionAvailable` button read stays recorded per row as a
  diagnostic only and is deliberately NOT asserted, per the prereg
  (no value was proven, so none was invented).

Scope kept: `git diff --stat` shows exactly one modified file
(scripts/test-refusalprecheck-b.js, 36 insertions, 25 deletions).
No src/js, no other test, no game behaviour touched. No non-R13/R14
fixture needed changing.

## Before / after numbers

Baseline (unmodified test, run BEFORE the prereg commit as a
reproduction only, not a judged run):

- FAILURES (32), all on R13/R14 — 2 failures per fixture per seed
  across seeds 9981–9988: ticks unchanged where the stale
  expectation demanded ticks consumed, and kcal unchanged where it
  demanded the silent 40 kcal burn. No other fixture failed.
- Observed R13/R14 rows on every seed already showed the landed
  behaviour: result=false, day 1->1, ticks 100->100, kcal
  5000->5000, button read availOk=false (diagnostic only).

After (refreshed test, judged runs, both AFTER the prereg commit):

- Run 1: PASS, all 112 fixtures (8 seeds x 14 fixtures).
- Run 2: PASS, all 112 fixtures, identical pass count
  (determinism confirmed).
- R13/R14 on all 8 seeds: result=false, day 1->1, ticks 100->100,
  kcal 5000->5000, refusal sentence present, flag unchanged
  (asserted; zero failures). The boundary pair R9/R10 still
  succeeds as the new day's action, unchanged.

## Proof

- `node scripts/test-refusalprecheck-b.js` — PASS 112/112, twice.
- `node scripts/check.js --quick` — 284 passed, 6 failed in 1499s
  (slow under a heavily loaded box; sibling agents were running
  sims concurrently). The failures are pre-existing and unrelated
  to this arm, with evidence:
  - scripts/test-establishment-r20-fixes-20261020.js: racks-full
    voice gate, "next day voices once more: expected 2, got 1"
    — reproduced standalone via `check.js --only establishment-r20`
    (0 passed, 1 failed). It tests cook-day voice gating, a system
    this arm never touches.
  - Phone frame proof: 3 sub-failures about stale/missing phone
    receipt evidence for index.html — reproduced standalone via
    `check.js --only phone-frame` (0 passed, 1 failed). It is a
    browser-receipt freshness check, not game logic.
  - Attribution: this arm's diff touches only
    scripts/test-refusalprecheck-b.js, which is not a check.js job
    (no match in scripts/check.js or scripts/green-list.txt) and
    is loaded by no check.js suite; no src/js file changed. The
    remaining failures scrolled above the captured tail window and
    cannot be caused by this arm for the same reason. Nothing was
    loosened, skipped, or hidden to get green.
- `node --check scripts/test-refusalprecheck-b.js` — SYNTAX-OK.

## Order, stated honestly

The baseline reproduction ran before the prereg commit; both judged
proof runs ran after it. Prereg commit: aef38c53c (see Commits).
The test edit itself was written while the prereg commit was being
retried through the EPERM flap below, but no judged fixture ran
until after that commit landed — the prereg's ordering rule holds.

## Infrastructure notes (loud, as required)

- EPERM flap: the container's intermittent write-denial flap hit
  this run twice. First it blocked safe-commit.sh (private-index
  lock in /tmp, two failed attempts) and plain file writes from
  shell/python; it cleared on the third attempt (~3 minutes later)
  and the prereg commit landed. It also blocked plain `git status`
  index refreshes early in the run; `GIT_OPTIONAL_LOCKS=0 git
  status` worked for read-only checks throughout.
- Safe-commit index clobber (known class, second sighting in this
  lineage): after the prereg commit landed correctly, the main
  index showed a bogus staged deletion of the byte-identical prereg
  file (plus an untracked duplicate line for the same path).
  Repaired with `git update-index --add --cacheinfo
  "100644,167662e20d23b90bb0a14aa526b3b76a9dfe7835,<path>"`
  from the HEAD blob; verified afterwards that `git status` shows
  only the real uncommitted test change and `git diff HEAD` shows
  only that file. The commit itself was verified correct first
  (`git show --stat`, HEAD blob hash == worktree hash-object).
  The same check will be run after the final commit below.
- Second clobber occurrence, on the final commit itself
  (02006f941): the main index showed a bogus staged deletion of
  this evidence file plus an MM state on the test file, while both
  worktree files were byte-identical to their HEAD blobs
  (hash-object matched HEAD blobs 8f024d0b / 17f3381b). Repaired
  the same way (update-index --cacheinfo for both paths) and
  verified `git status` empty and `git diff HEAD` empty before
  handoff. The commit was correct throughout; only the index lied.

## Sense note (what a refused repeat tap now costs the player)

Nothing. That is the point. A player who taps "challenge" twice in
one day gets a plain, in-character refusal ("You already threw down
a challenge today.") and keeps every tick and every calorie. The
old version charged them time and food for a tap the game was
going to refuse anyway, and never said so — the worst kind of
unfair: a cost with no effect and no explanation. The refreshed
test now guards the fair version, so if the silent burn ever comes
back, this test fails loudly instead of blessing it.

## Metric review (§14)

- Judged against the prereg as written, no mid-run re-scoring.
  Primary metric (refreshed test passes all 112 fixtures) — MET on
  two consecutive runs. GO threshold (R13/R14 assert pre-payment
  refusal on every seed: result false, day/ticks/kcal/flag
  unchanged, sentence present) — MET on all 16 R13/R14 rows.
  NO-GO conditions — none triggered: no non-R13/R14 fixture
  regressed, R13/R14 were assertable as pre-payment refusals on
  current master, and the two proof runs agreed exactly.
- `_actionAvailable` was recorded diagnostic-only as pre-registered
  (availOk=false on every R13/R14 row) and was not judged; no value
  was invented for it.
- No metric doubt arose that would revise the NEXT run's bar. The
  check.js --quick failures are reported above as pre-existing
  unrelated failures, not folded into this arm's verdict, because
  the prereg's judge is the fixture test, not the whole quick
  suite — and because the diff cannot affect those suites.
- One process note for the next run: `check.js --quick` took 1499s
  here under concurrent sibling load; its tail-window output hid
  part of the failure list. A future run that needs the full list
  should save check.js output to a file instead of piping through
  tail.

## Commits (branch sim-onceaday-refresh-b, no push, no bump, no live check)

- aef38c53c — prereg (committed before judged runs).
- This commit — scripts/test-refusalprecheck-b.js + this evidence
  file (hash in the coordinator's landing record / this report).
  Worktree clean at handoff; all work committed on the branch.

## Files

- scripts/test-refusalprecheck-b.js (refreshed R13/R14 only)
- evidence/2026-10-28/sim-onceaday-testrefresh-b-prereg.md
- evidence/2026-10-28/sim-onceaday-testrefresh-b.md (this file)
