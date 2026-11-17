# sim-scale-onramp-round-0415 — Loop A adoption run, collided with a main-session adoption, closed by verification + proof repair

**Run:** Loop A `fleshout-20261117T0415Z`, axis scale-onramp. Coordinator evidence.
**Master at start:** `2ac3052b0`. **Master at close:** `a1af78941` (proofadapt merge; ship bump `eb8e0cc18` in between).
**Claim:** `hidden_files/lever-claims/fleshout-20261117T0415Z.json` (deleted at closeout).

## What this run was

An ADOPTION run for the dead Loop A run `fleshout-20261117T0215Z` (arms
sim-rumortarget-a + sim-nightcarry-a). It became a VERIFICATION + REPAIR
run instead: the main session adopted the same dead run concurrently and
landed both arms while this run's workers were mid-flight.

## Stale-lock recovery (run start)

- Lock `fleshout-20261117T0215Z`, created 2026-11-17T02:38:48Z. Its trees
  `sim-rumortarget-a` / `sim-nightcarry-a` heartbeat `2026-11-17T02:56:10Z`
  — 98 min stale at recovery (04:34Z), no live processes in either tree.
  Lock deleted per the guard (heartbeat > 15 min stale; lock > 90 min old
  fallback also applies). Claim retired to `.DEAD` with a note.
- Pre-flight: main tree clean, disk 50%, reaper ran (14/16 trees active,
  none removed — all dirty trees protected, as designed).
- Loop B 0330Z was LIVE on winnability chain (companionguard-b heartbeat
  04:24Z) — NOT touched. Loop A 0015Z claim stayed live for main-session
  closeout (planignite-fix-a) — NOT touched.

## The collision (loud, recorded, no work repeated)

The main session's own adoption of the 0215Z run landed on master while
this run's two adoption workers were working:

- `sim-rumortarget-a`: fully landed (lever `97dfc7307`, revert `28930ed75`,
  evidence+panel `22d0096bf`, corpora `ecbc630a4`).
- `sim-nightcarry-a`: landed INCOMPLETE (`6956d0a6b` prereg, `2e31c9563`
  lever+instrument+proof, `cd32c023a` revert, `f7128f9f3` incomplete note
  + control corpora 6/8).
- Loop B's arms landed in the same window (expignite-b DIAG GO,
  nationalsticky-b DIAG-NO-GO, companionguard-b GO — see the main
  session's coordinator evidence `7199f371f`).
- Master moved under this run: `2ac3052b0` → `f7128f9f3` → `7199f371f`
  → `eb8e0cc18` (batch-ship version bump) → `a1af78941` (this run's merge).

Consequences, both contained:

- **Nightcarry worker superseded mid-run.** It had verified the 6 control
  files and finished control seeds 103107–103108 (53 s, valid files) when
  its branch/worktree were removed under it. Those two files were
  uncommitted in the removed tree and are LOST (full-`find` over
  `~/workspace` returns nothing). The committed state stands: control
  6/8, ON leg never started. No verdict was judged; the worker made no
  commits. Its report is filed as a recovered handoff, not a result.
- **Rumortarget worker stopped by the coordinator** once the landed state
  was verified, before it could duplicate the landed revert + evidence.
  It was cancelled mid-task; no result of its own.
- The race is structural, not a violation: the main session's adoption was
  already in flight before this run's lock existed (lock created 04:41Z;
  the adoption closeout is recorded in the main session's tracker entry
  for the 0215Z run). Two coordinators adopted the same dead run within
  minutes of each other. The lock did not prevent it because the other
  adoption predated the lock.

## Verification of the landed arms (coordinator, this run)

- **Rumortarget-a:** PILOT NO-GO stands as landed. Primary 3/8 vs frozen
  bar 4/8 (103101, 103103, 103107); launch bar + all three cost bars pass
  (deaths 90.125 → 88.625, median ratio 0.9225, starvation 3 → 1).
  Corpora 8+8 on master, all 16 files parse. `git diff 5d5293972 HEAD --
  src/js/win-plan.js` empty — the lever is reverted, net src/ diff 0.
  Evidence file matches the worker's uncommitted copy read at run start.
  Wall: wins 0/8 both legs, national 0/8, wave 4 8/8, wave 5 2/8 → 3/8,
  median survival 142d → 131d.
- **Nightcarry-a:** INCOMPLETE stands as landed. Control 6/8 committed;
  ON leg never started; frozen bars never evaluated. Resume instructions
  are committed in `evidence/2026-11-17/sim-nightcarry-a.md`: re-apply
  the lever from `00fb5745a`, finish control 103107–103108, run the ON
  leg on band 103101–103108, judge against the frozen prereg. Control
  observation (not a verdict): 47 `nightcarrySkips` on seed 103101, 0 on
  the other five — the phenomenon exists but is seed-concentrated.

## Gap found in the landing, fixed by this run

Both proof tests were landed RED on the reverted tree (the reverts removed
the code the tests assert). Neither test is in `scripts/green-list.txt`
and `check.js` does not run them (it runs `scripts/godpath/test-*.js` +
the green list), so `check.js --quick` was NOT red — but two knowingly-red
proof tests in `scripts/` are a trap for the next agent that runs them.

- `scripts/test-rumortarget-a.js`: 25 passed / 14 failed before adaptation
  (`TypeError: Game.winPlanRumorAttach is not a function`, static anchor
  "src diff is win-plan.js only" failing, all `lever:` legs failing).
- `scripts/test-nightcarry-a.js`: 55 passed / 10 failed (gate/hook/carry
  legs failing; armed legs reading control behavior).

Fix — arm `sim-proofadapt-a`, commit `a1af78941` (rebased once onto the
ship bump `eb8e0cc18`, clean; merged `--ff-only`):

- Both tests are now MODE-AWARE: mode detected at runtime from the source
  (never an env flag). Lever-present branches run the original assertions
  verbatim (whitespace-insensitive diff: no original assertion dropped or
  loosened). Reverted branches run off-mode counterparts that genuinely
  assert the reverted state (lever strings absent, empty src diff,
  target-null births, zero attach/carry rows, determinism legs green).
- Green on the reverted tree: **rumortarget 56/56, nightcarry 68/68**
  (re-run on the rebased tip and verified by the coordinator's merge).
- On-mode spot-checks (temp lever checkout, restored after):
  rumortarget 66/67 (the one miss is the committed-diff anchor reading
  an uncommitted temp checkout — passes on a real re-application branch,
  as it did at the arm tip 67/67); nightcarry 65/65. Caveat: the
  nightcarry temp checkout used the stale `00fb5745a` brain file, which
  clobbered the companionguard change to `villager-brain.js` (22 lines)
  — the resume round re-applying the lever onto current master MUST
  re-run this test on its own tip; this run's 65/65 is not a
  faithful lever+guard run.

## Telemetry deviation check

Ran on both rumortarget legs (basename globs — the tool supports `*` in
the basename only): **REFUSED recorder-corpus input on both legs** (all
8 rows carry top-level `anchorCommit`; sweep recorder rows, not runs).
Same documented refusal the main session recorded for these arms.
Baseline NOT rolled. No LOUD lines. The §15 panel remains the instrument
for these arms (rumortarget panel: `review_required`, no material signal).

## Findings appended (coordinator owns sim-findings.md)

Four new items from the rumortarget arm (evidence §Findings 5–8):
attach-once locks in wave-3 (re-attach on higher wave is the design call);
display-name flip (one beast, two names across a run); self-tale attach
(holder cites a tale they themselves told); safe-commit delete guard
blocks mandated NO-GO reverts (coordinator-approved `--force-delete`
worked twice this round — rumortarget `28930ed75`, nightcarry
`cd32c023a` — carve-out vs per-revert approval still open).

## Infrastructure

- Safe-commit index clobber struck the proofadapt commit (`MM` on both
  test files; commit correct) — repaired with the documented `ls-tree -r
  HEAD | update-index --add --index-info` recipe; hashes verified vs HEAD.
- `check.js --quick` did not complete in 8.5 min on the proofadapt tree
  (worker killed it; the two tests are not in the green list, so
  non-gating). Worth knowing the quick check is that slow on this box
  right now.
- No EPERM write flap this run. No rebase-stop quirk (one clean rebase).
- Main tree clean at closeout (`git status --short` empty). No push, no
  version bump by this run (the ship loop owns both).

## Scale-onramp stays converging (NOT converged)

No lever landed a game change this run (both levers reverted; only the
proof tests changed). Wins still 0 on competent legs, national still 0
on this band, the table still unreached. Next blanks, in order (tracker):
(1) the never-commit village (103004 shape — why does a healthy village
never commit?); (2) re-attach on higher wave (rumortarget follow-up);
(3) nightcarry resume (re-apply lever from `00fb5745a`, finish control,
run ON leg — the next Loop A arm); (4) trick question (Steve/design
call); (5) profile-gate design call (Loop A); (6) veterans alive together
(Steve's #427 readiness-gate call); (7) answercourt landing decision,
competent seat-taking BUILD, family-7 program decision (Steve-calls).
Claim deleted; lock deleted.
