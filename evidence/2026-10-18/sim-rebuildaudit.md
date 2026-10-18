# sim-rebuildaudit — the wave-4 unlock collapse is the dc4-readiness design call, not the history rebuild (2026-10-18)

Axis: scale-onramp (the blocking axis). Run: flesh-out loop arm sim-rebuildaudit
(DIAGNOSTIC — zero game-code changes).
Named next from evidence/2026-10-18/sim-unlockdrift.md ("Named nexts" #1): audit
the history rebuild (2026-10-16 23:25Z) as the prime suspect for the wave-4
unlock collapse (14/16 → 0/16 on the fightopen round-1 named set).

## Pre-registration (binding, MEASUREMENT.md §§9–12, 14 — written BEFORE any sweep trajectory)

- **Question:** is the 2026-10-16 23:25 history rebuild (new root 6f134de2) the
  cause of the wave-4 unlock collapse, or does the cause predate it?
- **Instrument:** scripts/test-rebuildaudit-sweep.js — the pure fightopen round-1
  substrate on the named seed set [975–982] x {leadfeast, belongfeast} (16 runs),
  180d death-aware. Exact round-1 env (evidence/2026-10-16/sim-fightopen.md):
  FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
  WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1. ONE deliberate deviation from the
  unlockdrift instrument: the FIGHTOPEN=1 hard check is dropped — the layer did
  not exist at the pre-dc4 anchors (merged 20:28Z), and round-1 measured wave-4
  FIGHTOPEN-independent (14/16 on BOTH arms). FIGHTOPEN=1 is still set in the
  shell; nothing at the old anchors reads it.
- **Anchors:**
  - (a) pre-dc4 lower bound: 4fc725b8 (dc5-armorl1 merge, 2026-10-16 19:33:40Z —
    the master tip at the round-1 run time): expect >= 12/16 wave-4 (round-1
    measured 14/16).
  - (b) post-dc4, pre-rebuild: 26b3b226 (old master tip, 2026-10-16 23:14:40Z):
    expect <= 2/16 wave-4 (collapse reproduced on a pre-rebuild checkout).
- **PRIMARY (diagnostic, binding):** GO = a named, reproducible cause (exact file
  + behavior diff between the rebuilt tree and the round-1 tree, with a
  reproduction showing unlocks present vs absent) OR a verified pre-rebuild
  lower-bound anchor commit restoring ~14/16 on the named set. MISS = rebuild
  exonerated with equal-or-better evidence (tree-identical to round-1's tree,
  or the collapse reproduced on a pre-rebuild checkout) — then name the next
  suspect explicitly.
- **Horizon:** 180d death-aware (matches round-1; the unlock game lives late).
- **Seeds:** the named set [975–982] (8, fixed — the round-1 spec).
- **Policies:** TF.leadfeast / TF.belongfeast (tribfloor; the round-1 stack).

## Canon read

- docs/CANON.md: read. No game-code changes in this run (diagnostic) — canon
  is context for the gate design, not a build target.
- docs/MONSTER-WAVES.md: read. Wave-4 gate (The Mirror Draft): village standing
  >= 100 (t4) AND combat readiness (design call #4, 2026-10-16): 4 armored
  (P>=15), 5 armed, 3 tricks, 2 living veterans (wave-3+ kills).
- evidence/2026-10-16/designcalls/04-readiness.md: read — the design intent
  record (deliberate bar replacement, not an accident).

## The archaeology (code, before any sweep)

### Round-1 commit
sim-fightopen round 1 ran 2026-10-16 ~19:40Z on the OLD (pre-rebuild) history.
From the master reflog: master at 19:33:40Z was 4fc725b8 (merge dc5-armorl1),
at 19:45:00Z a8c804c8 (merge dc7-water). The round-1 tree is <= 4fc725b8.
Anchor (a) uses 4fc725b8 — the master tip at the round-1 run time.

CORRECTION to sim-unlockdrift.md: the old history is NOT unrecoverable and the
reflog does NOT stop at 2026-10-18 — the master reflog goes back to 2026-10-03
(3293 entries; the unlockdrift run likely read a worktree HEAD reflog instead
of `git reflog master`). Every pre-rebuild commit referenced here was resolved
from it.

### The rebuild, exonerated
The rebuild root 6f134de2 (2026-10-16 23:25:30Z, message "Version bump
26b3b226-20261016-232453 (batch ship)") is a NEW ROOT carrying the OLD TIP's
tree: `git diff 26b3b226 6f134de2` touches exactly 5 files — index.html,
src/data/build-notes.json, src/js/build.js, sw.js, version.json — all
version-bump artifacts. ZERO unlock files differ (src/js/standing.js,
src/js/game.js, src/data/wave-ledger.json, src/js/ledger.js,
src/js/havenGrowth.js all byte-identical). The 183-commit content window and
the 5 post-rebuild commits were already exonerated by sim-unlockdrift; the
rebuild itself is now exonerated too. **The collapse predates the rebuild.**

The collapse window is therefore the OLD history between the round-1 run
(~19:40Z) and the old tip (23:14:40Z): merges dc7-water, dc6-batch,
dc3-sanctuary, dc4-readiness, dc8-lingerer, sim-trickres, sim-fightopen,
sim-fieldpace, journey-establishment-r10, sim-drawvol-confirm-b,
journey-deepening, journey-scale, sim-wave3ledger, plus three empty-message
landings.

### The culprit: dc4-readiness (design call #4)
Merge `ebcdf3971c9da74d0bdee092fc6ebd8857700d8c` —
"[needs-eyes] combat readiness gates wave unlocks (standing opens door,
readiness decides) (#designcall4)", 2026-10-16 19:55:10Z — landed 15 minutes
after the round-1 run and is the ONLY commit in the window to touch
src/js/standing.js. `git log -S waveCombatReadiness 4fc725b8..26b3b226`
returned exactly this merge (verified 2026-10-18; the object has since been
pruned — see infrastructure note). The dc7/dc6/dc3 merges touched only
game.js journalNote hunks (thirst duties, batch verbs, sanctuary semantics) —
nothing touching unlockedWave/waveEngaged/standing.

**Exact file + behavior diff (src/js/standing.js, `waveUnlockReady(4)`):**

| | BEFORE (4fc725b8, round-1 era) | AFTER (dc4 merged) |
|---|---|---|
| Gate | faced-experience bar | combat-readiness bar |
| Code | `waveEngaged(3) >= (readyFacedW3 \|\| 3)` | `waveCombatReadiness(4)` |
| Bar | 3 distinct wave-3 types faced blow-by-blow (fleeing counts — "you stood on the grid") | 4 armored @P>=15, 5 armed, 3 tricks known, 2 living veterans (wave-3+ kills) |
| Nature | exposure — reachable by fleeing | capability — demands a built fighting force |

This was a DELIBERATE design decision (design call #4,
evidence/2026-10-16/designcalls/04-readiness.md): the old bar was judged
"exposure, not capability" — a village could flee three wave-3 monsters and be
deemed ready for wave-4 (dmg 35–95, HP 850–1500) while unarmored, unarmed,
trickless, and bloodless. The demands are "sim starting points — tune on
evidence, Steve can overrule."

### Static audit proof: 5/5 GREEN
scripts/test-rebuildaudit-gate.js (read-only git inspection, zero game code):
- A1: pre-dc4 gate is the faced-experience bar (waveEngaged(3)/readyFacedW3, no waveCombatReadiness) — PASS
- A2: post-dc4 gate delegates to waveCombatReadiness with readyDemand
  `4: { armored: 4, armorP: 15, armed: 5, tricks: 3, veterans: 2 }` — PASS
- A2b: the old bar (readyFacedW3) is retired — PASS
- A3: symbol introduced in-window (present post, absent pre); single-commit
  pinpoint via `git log -S` recorded 2026-10-18 — PASS
- A4: rebuild tree-faithful on unlock code (old tip vs rebuild root) — PASS

## Anchor sweep results

### Anchor (a): pre-dc4 lower bound (4fc725b8) — 16/16 runs, 0 errors

| metric | anchor (a) | fightopen round-1 control |
|---|---|---|
| wave-4 reached | **14/16** | 14/16 |
| wave-5 reached | 8/16 | 8/16 |
| national | 9/16 | 9/16 |
| table | 14/16 | 14/16 |
| median survival | 145d | 145d |

Byte-identical aggregates to round-1's control arm. The lower bound is
verified: the pre-dc4 tree reproduces the round-1 measurement exactly
(determinism fix holding — in-process sequential runs are stable).

### Anchor (b): post-dc4, pre-rebuild tip (26b3b226) — 16/16 runs, 0 errors

| metric | anchor (b) | anchor (a) |
|---|---|---|
| wave-4 reached | **0/16** | 14/16 |
| wave-5 reached | 0/16 | 8/16 |
| national | 9/16 | 9/16 |
| table | 16/16 | 14/16 |
| median survival | 180d | 145d |

The collapse reproduces on a PRE-REBUILD checkout: 0/16 wave-4 on identical
seeds, policies, and env. Per-seed: all 16 runs maxWave=3. The villages are
rich (national 9/16, table 16/16) but wave-locked — the "rich but wave-locked"
profile — and live longer (180d median) because they never meet wave-4/5
monsters. 0/16 when the true rate is 14/16 has p ≈ 1e-15: not seed luck.

**PRIMARY: GO.** Named, reproducible cause with present-vs-absent reproduction
on identical seeds:
- Culprit: dc4-readiness merge (design call #4, 2026-10-16 19:55:10Z)
- File: src/js/standing.js — `waveUnlockReady(4)` replaced (table above)
- Present: 14/16 at 4fc725b8 (pre-dc4) · Absent: 0/16 at 26b3b226 (post-dc4, pre-rebuild)
- The history rebuild is exonerated (tree-faithful on unlock code).

## Village assessment

At anchor (a) the villages play the round-1 story: they face wave-3 monsters
(including fleeing — the old bar counts it), the door opens, and 14/16 walk
through to wave 4, 8/16 to wave 5. At anchor (b) the SAME villages on the SAME
seeds reach national (9/16) and the table (16/16) but the readiness bars stay
short — the defercensus2b census (2026-10-18) measured why: veterans binds
98.5–100% of deferral days, armor co-binds ~60%. The villages stand at the
standing door with the System naming the short bars, and live to 180d in a
world that never escalates past wave 3. The design call's intent (no
promotion into unwinnable wars) is legible; its measured price is the scale
on-ramp stalling at wave 3 on the courtship road.

## Metric review (§14)

- The PRIMARY bound the run: GO on the pre-registered terms — named cause
  (dc4-readiness, src/js/standing.js) + behavior diff + present-vs-absent
  reproduction on identical seeds, plus a verified lower-bound anchor (14/16).
  Not re-scored: the 12/16 bar for anchor (a) was met at exactly 14/16, and the
  <=2/16 bar for anchor (b) at 0/16.
- The FIGHTOPEN-check deviation from the unlockdrift instrument is documented
  in the instrument header (layer did not exist at the anchors;
  FIGHTOPEN-independent per round-1 both-arms 14/16). No metric was re-scoped.
- Proposed revision for the NEXT run: this closes the root-cause hunt. The
  next arm on this axis is a TUNING arm on readyDemand (the demands are "sim
  starting points"), not another archaeology run. Suggested primary for it:
  wave-4 reach on the named set with a pre-registered bar, judged against the
  0/16 measured here.

## Convergence state

scale-onramp: **the unlock-collapse investigation is CLOSED with a named
cause.** The collapse is not drift, not the rebuild, not the 183-commit
window — it is design call #4 (2026-10-16 19:55Z), a deliberate bar
replacement whose measured consequence is 14/16 → 0/16 wave-4 on the
courtship road. The readiness gate is now the binding constraint by
measurement (defercensus2b: veterans 98.5–100%, armor ~60% of deferral days).
The bar's demands are "sim starting points — tune on evidence, Steve can
overrule": the tuning arm is the named next. Directive lift remains a Steve
call.

## Infrastructure note (for the coordinator)

During this run, the dc4 merge object `ebcd...` vanished from the object store
mid-run ("Not a valid object name"; neighbors 089ff4bd/c77fbfb2/362a2230 all
survive; `git fsck` finds it neither reachable nor dangling). Its full diff
and the `git log -S` pinpoint were captured BEFORE the prune and are recorded
above; the committed proof script was rewritten to assert against surviving
commits only. If concurrent maintenance is pruning reflog-referenced objects,
future archaeology runs should pin anchors with a temporary ref first.

## Per-seed JSONs

evidence/2026-10-18/perseed-rebuildaudit/anchor-predc4/ (16 runs + _summary.json)
evidence/2026-10-18/perseed-rebuildaudit/anchor-postdc4/ (16 runs + _summary.json)

## Proof artifacts

- scripts/test-rebuildaudit-sweep.js — the 16-run anchor instrument (unlockdrift
  instrument minus the FIGHTOPEN hard check; deviation documented in header)
- scripts/test-rebuildaudit-gate.js — static audit proof 5/5 (gate replacement
  verified; rebuild tree-faithful on unlock code)

## Blank-fill record

- FILLED (diagnostic): the unlock collapse is attributed to a named commit
  with an exact file+behavior diff — the history rebuild is exonerated, the
  180-commit window stays exonerated, and the old history is recoverable from
  the reflog (correcting sim-unlockdrift.md).
- FILLED (instrument): anchor sweep instrument + static gate audit proof
  (both committed, both green).
- DOCUMENTED (not fixed — design call, Steve's bar): readyDemand values are
  "sim starting points — tune on evidence." The next arm is the tuning arm.
- DOCUMENTED (infrastructure): mid-run object prune anomaly (above).
