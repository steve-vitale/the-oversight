# sim-gaps-ghost — THIRD-FIGHTER GHOST NARRATION: LANDED-candidate (narration only)

Arm: gaps-ghost (branch gaps-ghost, worktree
`~/workspace/worktrees/gaps-ghost`). Coordinator merges; this worker does
NOT merge, push, bump, or verify live. Prereg (binding, committed
before any build): evidence/2026-10-29/sim-gaps-ghost-prereg.md
(commit d3d5d0252).

## Plain words first

A village sortie marches three fighters to the treeline — the story
names all three and charges rations for all three — but the fight
itself only ever fields the leader plus, sometimes, one joined ally.
The third fighter was a ghost: named at the treeline, absent from the
blows. Now the fight log accounts for every marcher. When the fight
closes, the fighters who marched but never joined the blows get one
closing line: they "stood the rear through it, watching the treeline
behind them." Nobody's damage, kills, joins, or outcomes change —
the only thing that changes is that the story stops losing a person.

## The choice, as pre-registered

LOG PRESENCE, not a two-fighter muster. Three fighters genuinely
march and genuinely eat 3 x 2000 kcal — naming two would hide a real
marcher and a real price. Actually fielding only two would change
muster size, holdBonus, rations, and outcomes — a behavior change,
out of scope for a narration arm. The muster line stays exactly as
it is; the fight log is where the fighter was missing, so the fight
log is where they now appear.

## What changed (one file, one place)

src/js/fieldFights.js only, at the end of fieldFight, just before the
damage seal (after all rounds, after all RNG draws):

- Gated on `opts.cornered` AND leftover `allyVids` non-empty. Cornered
  is set by NO other caller than lingererSortie (grep-verified), so
  aid, wild, alien, and arena fights keep their exact current
  narration. Every join path shifts its fighter out of allyVids
  (allyFromStart, hopeless shout), so the leftovers are EXACTLY the
  mustered fighters who never joined the blows.
- Sets `rec.rearGuard` to the leftover vid list (machine-checkable,
  same spirit as partyfinish's rec.partySize).
- Pushes ONE line to rec.log, via the fight's own refName:
  "`<Name>` stood the rear through it, watching the treeline behind
  them." / "`<Name>` and `<Name>` stood the rear through it, ...".
  Names resolving to 'Someone'/falsy are skipped; if none resolve,
  no line and no field. Outcome-neutral wording, one line, no
  outcome-specific variants — true for vKill, mFlee, vFlee, and vDie
  alike (the vDie say line already says "The party carries the body
  home" — consistent).
- No say-line change (a per-fight say line would repeat the same
  rear-guard three times across a three-fight sortie; an
  end-of-sortie say line would need sortie-loop surgery with
  break/vDie early-exit care — bigger, not smaller). The say stream
  already credits the party generically ("with their party").
- No RNG draw, no stat, no HP, no outcome variable, no gate, no
  decision input touched. Nothing in the engine reads rec.log
  contents to decide anything (only pushes; trickLog is separate).
  PERCEPTION LAW kept: only fighters who actually marched (the
  passed allyVids) are ever named; no roster or list feeds any
  decision (this arm makes no decisions).
- Forbidden files untouched: src/js/storage.js,
  src/js/villager-build.js, src/js/villager-objectives.js,
  docs/MAP.md. docs/ONTOLOGY.md left alone (no module added/renamed,
  no provides: header changed). No gates changed.

## Proof of record

### 1. Proof test: scripts/test-gaps-ghost.js — GREEN 9/9

Node-direct, shared sim-harness pattern (from
test-partyfinish-proof.js), real 3-muster with roster villagers:

- A (1-HP cornered kill, no join — the d89 1-HP shape): vKill round
  1; rearGuard = BOTH allies; the log names BOTH standing the rear.
- B (cornered, one ally joined from the start — deterministic
  stand-in for the shout path): joined ally is NOT in rearGuard;
  rearGuard = the other ally only; the rear line names the other,
  never the joined ally.
- C (cornered, single ally joins): no rear line, no rearGuard —
  no ghost, no line.
- D (non-cornered fight, same leftover shape): no rear line, no
  rearGuard — scope gate holds, other callers untouched.
- E (partyfinish summary wording): unchanged.

Note on names in the proof: the fresh harness's villagers are not
yet "known," so firstRef returns descriptors ("the person in their
40s...") rather than first names — the test compares using the
engine's own refName, so the assertion (log names exactly the
leftover fighters' engine names) holds regardless. The live replay
below shows real first names.

### 2. BEFORE/AFTER sense replay: seed 75105, 180d, same driver

The replay reproduces the judged sortiedpr corpus exactly on both
runs (d89: 4 fights — 3 kills + redactor; d95, d152, d173 attempts
match; the two no-fighters failures match). Full outputs:
evidence/2026-10-29/gaps-ghost/sense-before-75105.txt and
sense-after-75105.txt.

Full-file diff between the two outputs is EXACTLY ONE ADDED LINE
(line 38 of the after file). All attempts, sortie lines, and
picked-fight numerics are byte-identical (verified by diff on the
ATTEMPT / SORTIE-LINE / picked-fight lines: identical).

BEFORE (picked fight: d89 redactor, leader Caleb, vFlee, 4 rounds,
71 dealt, 7 ally, 56 taken, partySize 3) — the log ends:
"  Caleb sees how this ends — and runs while running still works."
Miguel appears nowhere in it. (Vasyl appears via "Caleb is losing
— shouts for help! Vasyl charges in!")

AFTER — the same log, plus one closing line:
"  Miguel stood the rear through it, watching the treeline behind
them."
Vasyl is correctly NOT named in the rear line (he already has his
"charges in!" line); Miguel, the leftover, now has his presence.

### 3. Sense-bar precision note (disclosure, not a re-score)

The prereg's sense bar said the d89 1-HP kill logs would show both
non-joined fighters. The sortiedpr sense script prints only the
picked (first multi-round) fight's log, not the 1-HP kill logs — so
the 1-HP two-leftover case is proven by proof-test case A, not by
the replay print. The bar itself (ghost gone, numbers unchanged)
holds on both surfaces; the surface split is stated here exactly
rather than implied.

### 4. check.js --quick — 284 passed, 6 failed, all 6 pre-existing

Run with `--cacheDirectory=/tmp/jest-cache-gaps-ghost` (1077s).
FIRST attempt started while three sibling check.js --quick runs were
already in flight (gaps-grudge, journey-establishment, gaps-gear;
load ~16) and stalled at ~0% CPU for ~13 minutes — killed as
untrustworthy under the no-concurrent-jest rule, NOT as a failure.
SECOND run started alone (no check.js anywhere) and finished:
284 passed, 6 failed. The 6 failures, each re-run alone on this
tree (still failing — deterministic, not concurrent-jest phantoms)
and each re-run alone against PRISTINE HEAD fieldFights.js
(cp-backup + cp-restore, never checkout-as-restore — all 6 exit 1
on pristine too, and the proof test re-greens 9/9 after restore):

- scripts/godpath/test-measurement-proof-update.js
- scripts/godpath/test-measurement-workflow.js
- scripts/godpath/test-mobile-combat-cadence.js
- scripts/godpath/test-occupation-panels.js
- scripts/godpath/test-phone-frame-proof.js
- scripts/test-establishment-r20-fixes-20261020.js

None of the 6 references fieldFight, cornered, or rearGuard
(grep 0 matches each) — none touches this arm's code path. They
are pre-existing failures on this base, NOT regressions from this
arm. No assertion was loosened to go green. (Two sibling check.js
runs started during the tail of the second run; the failures above
were all reproduced alone, so that tail contention does not taint
the verdict.)

## Commits (this branch, coordinator to merge)

- d3d5d0252 [needs-eyes] gaps-ghost prereg (evidence only)
- fix commit (this commit — hash in the coordinator report)
  [needs-eyes] gaps-ghost: rear-guard log line + proof test +
  evidence (src/js/fieldFights.js, scripts/test-gaps-ghost.js,
  evidence/2026-10-29/sim-gaps-ghost.md,
  evidence/2026-10-29/gaps-ghost/sense-before-75105.txt,
  evidence/2026-10-29/gaps-ghost/sense-after-75105.txt).
  Sense scratch dirs (sense-before/, sense-after/) hold the
  sweep's per-seed row files and are NOT committed (same rule as
  the sortiedpr sense scratch dir).

## Metric review (§14 — binding, no mid-run re-scores)

No metric re-scored: the prereg's bars (ghost gone in transcript,
every number identical) were judged exactly as written. The only
correction is the surface split in §3 above (which instrument
proves which case), disclosed rather than smuggled. The
before/after diff (one added line) is the behavior-inertness
evidence: DPR, kills, joins, and outcomes cannot have moved when
the full 180d replay output differs by one log line.

## Infrastructure notes

- Safe-commit index clobber hit the prereg commit (bogus staged
  deletion for the file byte-identical to HEAD); repaired via
  HEAD-blob cacheinfo with hash verification, never git reset.
  The fix commit must be checked the same way before merge.
- Heartbeat landed before the before-replay, before the
  after-replay, and before check.js (each slow, ~2-6 min, under
  sibling load — the tree stayed fresh throughout).
- No push, no bump, no live verification (coordinator/ship-loop
  line, not this arm's). NOT merged, NOT live — LANDED-candidate
  pending coordinator merge + ship-loop verification.
