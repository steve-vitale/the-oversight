# sim-unlockdrift — root-cause the wave-4 unlock collapse (flesh-out loop, 2026-10-18)

Axis: scale-onramp (the blocking axis). Run: fleshout-20261018T0415Z-redirect (arm sim-unlockdrift).
Named next from evidence/2026-10-18/sim-openersurv.md (finding #522): the fightopen
round-1 named set [975–982] measured 14/16 wave-4 on 2026-10-16 but yields ~0 wave-4
on current master (2026-10-18) — "the readiness gate or standing curve moved; 
root-causing the drift is a standing item for the scale-onramp axis."

This arm was tasked to bisect the 180 commits between the 2026-10-16 tip and
current master to find the culprit commit.

## Pre-registration (binding, MEASUREMENT.md §§9–12, 14 — written BEFORE any sweep trajectory)

- **Question:** which master change(s) between 2026-10-16 and 2026-10-18 collapsed
  wave-4 unlocks on the named set from 14/16 to ~0?
- **Instrument:** scripts/sweep-unlockdrift-20261018.js — the pure fightopen round-1
  substrate on the named seed set [975–982] x {leadfeast, belongfeast} (16 runs),
  180d death-aware. Exact round-1 env (evidence/2026-10-16/sim-fightopen.md +
  scripts/sweep-fightopen-20261016.js): FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1
  RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 (explicit, pre-seat)
  NODEWITNESS=1 FIGHTOPEN=1. Policies: TF.leadfeast / TF.belongfeast (tribfloor).
  Wave-4 reach is FIGHTOPEN-independent (14/16 both arms in round-1), so a single
  condition suffices. Metric: maxWave >= 4 count (from sim-harness runDays
  maxWaveUnlocked).
- **Anchors (must both reproduce before bisecting):**
  - (a) 2026-10-16 tip (`git log --until="2026-10-16 23:59"` → 00a004cb): expect
    >= 12/16 wave-4 (round-1 measured 14/16).
  - (b) current master: expect <= 2/16 wave-4 (dead worker measured 0/5 pure
    substrate; reunioncost 0/32).
  - If either anchor fails, STOP — the drift premise (collapse in the 180-commit
    window) is wrong.
- **PRIMARY (diagnostic):** the bisection identifies the commit(s) with 100%
  anchor agreement: 2026-10-16 tip >= 12/16 AND the identified commit's
  first-appearance sweep <= 2/16 AND its parent >= 12/16 on identical seeds.
  GO = culprit commit named with mechanism; MISS = anchors don't reproduce or no
  single culprit (report the window honestly).
- **Sibling check:** at the culprit point, compare national/table/median survival
  vs the parent on the same seeds (did the same commit move other bars?).

## Canon read
- docs/CANON.md: read. "Monster encounters are fought, not rolled" (untouched —
  the instrument is read-only; no game-code changes).
- docs/MONSTER-WAVES.md: read. Wave-4 gate (The Mirror Draft): village standing
  >= 100 (t4) AND combat readiness (design call #4, 2026-10-16): 4 armored
  (P>=15), 5 armed, 3 tricks, 2 living veterans (wave-3+ kills). The readiness
  gate is the suspected mover.

## Anchor results

### Anchor (a): 2026-10-16 tip (00a004cb) — FAILED

16/16 runs complete, 0 instrument errors. Detached HEAD at 00a004cb
(2026-10-16 23:47:13 +0000), tree clean before/after.

| metric | anchor (a) at 00a004cb | round-1 (2026-10-16) |
|---|---|---|
| runs | 16 | 16 |
| wave-4 reached | **0/16** | 14/16 |
| wave-5 reached | 0/16 | 8/16 |
| national | 9/16 | (not directly comparable) |
| table | 16/16 | (not directly comparable) |
| median survival | 180d | (not directly comparable) |

Per-seed: all 16 runs maxWave=3. Full table in perseed-unlockdrift/anchor-a/
(16 JSONs + _summary.json).

**The anchor FAILED** (0/16 < 12/16 bar). The 2026-10-16 tip in the CURRENT
(rebuilt) history does NOT reproduce the round-1 result.

### Why the anchor failed — the history rebuild

The round-1 measurement (14/16) was taken on 2026-10-16 BEFORE 19:40Z, on the
OLD (pre-rebuild) history. Master's history was REBUILT on 2026-10-16 at
23:25:30 +0000 (commit 6f134de2, new root, 104 commits, force-pushed —
AGENTS.md "NEVER REBUILD PUBLIC HISTORY WITHOUT A BACKUP TAG"). The
"2026-10-16 tip" (00a004cb, 23:47) is in the NEW (rebuilt) history.

The 5 commits between the rebuild root (6f134de2) and the anchor (00a004cb)
are all evidence/tooling/policy commits (r15 tooling, sim-arming kill,
sim-ledgerreset-b) — none touch the wave/unlock/readiness game code. The
collapse is therefore NOT in those 5 commits.

**Conclusion:** the wave-4 unlock collapse predates 00a004cb. It is either:
1. IN THE REBUILD ITSELF (6f134de2, 2026-10-16 23:25) — the rebuilt history
   does not faithfully preserve the old history's game code, OR
2. The old history (pre-rebuild) had different game code than the rebuilt
   history at the "corresponding" point.

The old history is unrecoverable (force-pushed; reflog only goes back to
2026-10-18). The 180-commit bisection window (00a004cb..master) is therefore
the WRONG window — both ends already show the collapse.

### Anchor (b): current master — collapse confirmed (not re-run)

The collapse on current master is already established by three independent
measurements (no need to burn 16 runs re-confirming):
- Dead worker sim-openersurv diagnostics: 0/5 wave-4 on pure round-1 substrate
  (s975/s976/s977).
- sim-reunioncost (2026-10-18): 0/32 wave-4 on fresh seeds [987–994].
- Smoke test (this arm, 2026-10-18): 0/2 wave-4 (s975/s976 leadfeast).

## PRIMARY: MISS (anchor failed — no bisection)

Per the pre-registered STOP condition, the bisection was not attempted. The
drift premise — that the collapse happened in the 180 commits between
2026-10-16 and 2026-10-18 — is WRONG. The collapse is already present at the
2026-10-16 tip in the rebuilt history.

This is a DIAGNOSTIC MISS with a high-value redirect: the investigation must
move to the history rebuild (2026-10-16 23:25), not the 180-commit window.

## Sibling check (at anchor (a) — for the record)

National 9/16, table 16/16, median survival 180d on the named set at 00a004cb.
The villages reach national and table but never unlock wave 4 — the same
"rich but wave-locked" profile as current master. The readiness gate (not
standing — deferral days happen) is the binding constraint at both ends of
the window.

## What the anchor rules out

- **NOT the 180 commits** (00a004cb..master): both ends show 0/16 wave-4.
  The 15 src/js/game.js touchers, the vetshape instrument (default OFF,
  byte-identical), the pyrrhic ledger fix, seatblow-open, and all loop
  evidence commits are EXONERATED as the collapse cause.
- **NOT the instrument**: the sweep uses the exact round-1 env (all 9 env
  vars), the same tribfloor policies, the same seeds, the same 180d
  death-aware horizon. The `mode` parameter is metadata-only (sim-harness.js:
  manifest only). The execensus capture (which round-1 used and this
  instrument omits) is read-only — its wrappers (tele/say/villagerTrickAction/
  fieldFight/tbEnd) draw no RNG and mutate no game state.
- **NOT seed luck**: 0/16 when the true rate is 14/16 has p ≈ 1e-15.

## Named nexts

1. **Audit the history rebuild** (2026-10-16 23:25, 6f134de2): the rebuilt
   history's game code does not reproduce the old history's measured behavior.
   Either the rebuild introduced a behavioral change, or the old history's tip
   (when round-1 ran) differs from the rebuilt history's "corresponding" point.
   The old history is gone (force-pushed), but the round-1 per-seed JSONs
   (evidence/2026-10-16/perseed-fightopen/, committed) contain full trajectories
   — a code archaeologist could diff the behavior, if not the code.
2. **Alternative anchor**: if any 2026-10-16 pre-rebuild artifact survives
   (a worker tree, a /tmp dump, a backup), run the instrument there to get a
   true "before" anchor. Without it, the bisection has no lower bound.
3. **The vetshape control** (2026-10-17, 1/16 wave-4) and **wave4reach control**
   (2026-10-17, 1/16) both postdate the rebuild — they are consistent with the
   collapse being in the rebuild, not with a 10-17 cause.

## Metric review (§14)

- The PRIMARY bound the run: MISS per the pre-registered anchor gate (0/16 <
  12/16). Not re-scored as a "no culprit found" — the anchor failure is itself
  the finding (the window is wrong).
- The STOP condition fired exactly as designed: "If either anchor fails, STOP
  and report (the drift premise is wrong)." The bisection was not attempted;
  no compute was burned on a meaningless bisect.
- Proposed revision for the NEXT run: the bisection needs a valid lower-bound
  anchor. Options: (a) audit the rebuild for the behavioral change directly
  (code review of 6f134de2's game-code diff vs the old history's last known
  good — if recoverable); (b) find a pre-rebuild artifact to anchor on;
  (c) treat the rebuild as the culprit and diff its game code against the
  round-1 behavior (the per-seed JSONs are the spec).
- No sense reads were applicable (diagnostic arm, no villager dialogue in scope).

## Convergence state

scale-onramp: **the unlock-collapse investigation is redirected, not closed.**
The 180-commit bisection is void — the collapse predates the window. The new
suspect is the 2026-10-16 history rebuild. The wave-4 readiness gate remains
the binding constraint (veterans bind 100% of deferral days per defercensus2),
but the *cause* of the collapse is now a version-control archaeology problem,
not a game-balance problem. Directive lift remains a Steve call.

## Per-seed JSONs

~/workspace/unlockdrift-dev/anchor-a/ (16 runs: 8 seeds x {leadfeast,
belongfeast}; _summary.json carries the judged totals). NOTE: these are in
~/workspace/unlockdrift-dev/ (outside the repo) because they were generated
while the worktree was detached at 00a004cb — they are the anchor evidence.
Copies + the instrument are committed below.

## Proof artifacts

- scripts/sweep-unlockdrift-20261018.js — the 16-run bisection instrument
  (pure round-1 substrate, named seeds, 180d death-aware; env-gated like
  sweep-fightopen-20261016.js)
- Anchor (a) per-seed JSONs + _summary.json (in the commit, under
  evidence/2026-10-18/perseed-unlockdrift/anchor-a/)

## Blank-fill record

- FILLED (diagnostic): the 180-commit bisection window is EXONERATED — the
  collapse predates 00a004cb. The investigation moves to the history rebuild.
- FILLED (instrument): the 16-run bisection instrument (scripts/
  sweep-unlockdrift-20261018.js), ready for use once a valid lower-bound
  anchor is found.
- DOCUMENTED (not fixed): the history rebuild (2026-10-16 23:25) as the new
  prime suspect for the unlock collapse; the old history is unrecoverable
  from the current repo.
