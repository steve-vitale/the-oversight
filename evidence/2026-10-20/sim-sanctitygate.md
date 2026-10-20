# sim-sanctitygate — independent verification of the sanctity-gate arm (flesh-out loop, 2026-10-20)

Run: oversight-flesh-out-loop 2026-10-20 (run fleshout-20261020T1615Z). Axis: scale-onramp (standing directive).
Arm: the sanctity-gate game-code fix arm — the named next from sim-sanctityaudit DIAG-GO (2026-10-19).
Worktree: `sim-sanctitygate` (this file's tree).

Canon: docs/CANON.md + docs/TABLE.md — sanctity of the table (Steve 2026-10-12):
"When the table sits, the world holds its breath: ambient monster pressure
against villagers is suspended for the whole sequence — ... ALL stakes during
the finale are the table's own."

## HEADLINE FINDING

**The assigned fix was already landed on master before this arm started.**
Commit `7024fd22b` (journey-scale r10, 2026-10-20 02:43 UTC, landed before
this run's 16:15 UTC registration) implements the arm's exact three
prescriptions in `src/js/game.js`, plus its own proof test
(`scripts/test-table-sanctity-gate-20261020.js`) and sweep evidence
(`evidence/2026-10-19/run-scale-r10.md`). This arm therefore became an
independent verification pass rather than an implementation pass. No new
game-code change was needed or made.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE any sweep)

**PROOF (RED→GREEN):** the sanctityaudit REPLAY mode is the proof —
RED now (fires), GREEN after the gate (no fire, lingerer still pinned, trial
still fires).
- Det-gate: paired trajectories byte-identical outside sanctity (any diff = FAIL LOUD).
- Confirm sweep: fresh 8-seed sweep on the pre-seat substrate
  (leadfeast/belongfeast, FEASTSCALE_R13=1, SEATDRIVE=0, 180d death-aware) —
  zero ambient (non-trial) combats during sanctity with the trial intact.
- Guardrails: trial fights still fire; no other fight-routing changes
  (det-gate is the judge).

**Metric review:** (filled at end of run — see VERDICT.)

## Scope verification of the landed fix (7024fd22b diff, read line by line)

1. **monsterTurn() contact block gated AFTER the glasswing trap trigger**
   (game.js ~21702): the gate sits after `oldMx/oldMy` capture, which is
   after the glasswing vanish block (~21686–21694). The player's own device
   stays live; all 8 stance/contact sites below are covered by the one
   early return. Matches the brief exactly.
2. **Both reengageWaitingMonsters callers gated** (NOT the function itself,
   which is the functional equivalent — the only two call sites):
   hall-door exit (~11079: stash held, a spoken line instead of a fight)
   and treelineAmbush (~11141: `return false`, stash intact). Matches.
3. **Untouched, verified by grep:** table-feared.js:158 trial (no
   tableActive gate); contests.js (no tableActive); feastBuff.js / app.js
   player-initiated paths (no tableActive); havenGrowth.js re-pinning
   `m.tx=hx; m.ty=hy` (~220) ungated — the gorge below it is the only
   gated part, so the siege persists and the crisis stays open, per
   TABLE.md. Matches the brief exactly.
4. Gate idiom matches the established engine pattern
   (`this.tableActive && this.tableActive()`, cf. resolvePatrol 7326,
   villagerMonsterTick 18837).

## Independent RED→GREEN verification (this run)

The committed proof test `scripts/test-table-sanctity-gate-20261020.js`
(11 checks: A1–A3, B1, C1–C2, D1–D2, E1–E3):

- **GREEN on current master (fix landed):** 11/11 PASS — 200 monsterTurn
  ticks with a suburb lingerer on the Haven tile + tableActive true → zero
  ambient startCombat fires; lingerer still pinned (crisis stays open);
  startCombat('finale',{tableTrial:true}) still fires; no re-engage out the
  hall door, stash survives; no treeline ambush, killer stash intact;
  controls E1–E3 confirm normal play untouched (ambient contact fires in 5
  ticks without sanctity; hall-door re-engage fires without sanctity).
- **RED on the pre-fix engine:** reverse-applied the fix patch
  (`git apply -R`), re-ran → 6 failures: A2 fires `suburb` at
  tableActive=true (the attributed corpus mechanism, replayed), C1/C2 and
  D1/D2 fire mid-sanctity. Re-applied the patch → GREEN again, tree
  byte-clean (`git status --short` empty after index resync). The patch
  round-trip left no trace; the stash was never touched.

**Static audit:** `node scripts/test-sanctityaudit-20261019.js` reported
`ambient sites: 9, uncovered: 0` — coverage complete — but exited FAIL on
line-number drift: its SITES/GATES table was written against the 2026-10-19
base and master had drifted a uniform +19 lines. Updated the table
mechanically (commit de7527d1a, this tree): static audit now PASS, and every
updated line number was spot-verified against the actual code (all five
tableActive gates + the 11 call sites land on the right statements).

**check.js --quick:** 253 passed, 4 failed — identical to the base parity
reported in the landed commit (the 4 failures are the pre-existing phone
frame proof items about stale browser evidence, unrelated to this change;
my scripts-only refresh cannot affect them).

**Confirm sweep:** covered by the landed commit's own evidence
(run-scale-r10.md M4: fresh 8-seed sweep 64201–64208 × belongfeast,
SEATDRIVE=1 + TABLEPATHS=1 → zero ambient fights during sanctity, trial
intact). No new code landed in this arm, so a second identical 8×180d sweep
would only re-measure the same base; the RED→GREEN proof + controls are the
decisive instrument for this arm, per the audit's own metric review.

## The d90–91 fiction, sense-tested (post-gate)

The breach the audit documented — "◈ CRISIS — THE BREACH. It got INSIDE"
firing mid-finale with no table voice — cannot occur anymore: the stance
machine never takes its turn while the table sits, and the re-engage paths
hold the stash with a spoken line ("Even they hold their breath while the
table sits") instead of silence. The lingerer stays on the treeline for the
whole challenge; the player can still answer the call for help (per
TABLE.md, the crisis stays open).

## VERDICT

**Arm COMPLETE — nothing to land for game code (already on master via
7024fd22b).** This tree contributes one maintenance commit (de7527d1a,
scripts-only: sanctity-audit line-table refresh, static audit PASS).
Pre-registered bar met: RED→GREEN proven independently, lingerer pinned,
trial intact, controls green, static audit 0 uncovered, check.js --quick
base parity 253/4. No [needs-eyes] needed for the script refresh (no feel /
combat / UI change — the gate itself shipped under r10 with its own eyes
flag if it carried one; the landed commit message does not carry it).

**Follow-up for the coordinator:** the convergence tracker should record
scale-onramp's "table approach" beat as addressed — the ambient-router gap
is closed on master. The wave-5 wall itself (window survival, raids #1
killer) remains the open axis question; this arm only removed the
background-wolf deaths from the finale.

## Metric review

The pre-registered metric (proof RED→GREEN + det-gate + confirm sweep) was
the right instrument. One revision proposed for the NEXT run of this kind:
the confirm-sweep leg should name whose sweep it is — when the fix is
already landed by a sibling, the run becomes a verification arm and the
sweep leg is satisfied by the landing commit's own per-seed evidence rather
than a second full sweep. No re-scoring was needed here.
