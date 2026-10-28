# sim-wallwounds-a — PRE-REGISTRATION (written BEFORE any judged sweep and BEFORE any game-code change)

Run: fleshout loop, run fleshout-20261028T0416Z. Axis: scale-onramp
(the blocking axis). Worker: sim-wallwounds-a. Backlog item #1300
(wall-wounds-finished).
Worktree: `~/workspace/worktrees/sim-wallwounds-a` (branch
sim-wallwounds-a).
FIX ARM (not DIAG-only): one small game-code change, measured
before/after on identical seeds. If any GO leg below misses, the
game-code change is REVERTED, evidence + instruments only are
left, and the verdict is NO-GO stated plainly. The visibility
alternative (naming toll-wounded lingerers in the village's
language) is the NAMED NEXT STEP if min() fails on evidence —
never this arm's silent pivot.

## Base — stated explicitly (verified before this prereg was written)

- Base commit at worktree creation: b1eb04456 ("sim-scale-onramp
  round 0320: w4damage + w4tbhp DIAG arms GO, merged locally
  pending ship").
- `git diff 3264dbb80..HEAD -- src/` is EMPTY: every commit
  between the w4damage band's base and this base is DIAG /
  instrument / evidence only, zero src/js changes. Trajectories
  on this base are therefore expected to reproduce the w4damage
  band exactly. If the traced case does NOT recur on this base,
  that is a leg-(a) reproduction failure (NO-GO), reported as
  such — never re-scored against a friendlier case, never
  bridged by arithmetic.
- The coordinator owns the loop claim file for this run; this
  worker neither writes nor deletes claim files.

## Canon read first

- docs/CANON.md, then docs/MONSTER-WAVES.md (wave 4 = the Mirror
  Draft, gate village standing >= 100; bands anchored: damage
  35-95, HP 850-1500, pierce 0.2-0.5; "a 4-6 round fight for a
  godhood build (~220 dmg/round)"; readiness bars in standing.js;
  the lingerer siege fiction: a besieging raider the scholar
  fled from or lost to goes back to the treeline, "Restored
  wounded, not full: the scholar's blows landed").
- docs/MEASUREMENT.md sections 9-12 and 14-15 (pilot gate,
  death-aware horizons, pre-registration, convergence, metric
  binding, balanced panels).
- No canon invented. The fix changes no fiction: a monster that
  comes home from a lost fight keeps the wounds it already had
  (the wall's), plus whatever the fight added — it never comes
  home healthier than it went into the fight.

## Prior evidence read first (this arm's definitions come from these)

- evidence/2026-10-28/sim-w4damage-a.md + sim-w4damage-a-prereg.md
  (GO 5/5): the traced case is seed 75106, seq 55, eulogy —
  raid toll d127: world HP 900 -> 675 (wall 225, tollExact);
  TB fight d129, result lost, monster fighter end 740/914;
  lingerer restore d129: world HP 675 -> 740 (+65); net drop
  -160 instead of -225. The same-day wobble (field reads 740,
  TB start reads 675 on d129) is intra-day TB ordering, not a
  second source.
- The restore site (read from code BEFORE this prereg):
  src/js/game.js tbEnd(), lingerer branch, line 43768:
  `o.hp = Math.max(1, Math.min(o.maxHp || o.hp,
  (standing[0] && standing[0].hp) || 1));`
  The cap is the world monster's MAX HP, not its pre-fight HP —
  so a fighter ending above the pre-fight world HP heals the
  toll wound on restore. The fighter is a FRESH copy built from
  mdef.hp range at startCombat (game.js ~line 33045), NOT from
  the world monster's current HP — that is why a 675-HP lingerer
  can fight as a 914-HP fighter and end at 740. The lifted world
  object leaves the world list at startCombat and nothing writes
  its hp during the fight, so o.hp at tbEnd IS the pre-fight
  world HP. The fix relies on that fact, and the proof test
  asserts it (a restore after a mid-fight world-HP write would
  be a different mechanism, reported if found, never assumed).
- The titan branch in the same block (`o.hp = o.maxHp`) is NOT
  touched: titans go back at full strength by design (canon
  comment in code, diagnosis-endgame 2026-10-15). "Lingerer
  restore code only" means exactly the lingerer line above.
- The fix does NOT change: raid tolls, field fights, fled/ won/
  routed handling (a routed lingerer still breaks and runs, no
  restore; a won fight still kills, no restore), or any
  narration. No [needs-eyes] applies unless the sense read
  finds a narration change is needed — the fix itself adds no
  words, no UI, no feel change beyond the wound number.

## The fix (stated before it is written)

In the lingerer branch only, the restore cap changes from the
world monster's max HP to its pre-fight world HP:

  BEFORE: o.hp = max(1, min(o.maxHp || o.hp, fighterEndHp))
  AFTER:  o.hp = max(1, min(preFightHp, fighterEndHp))

where preFightHp is o.hp at tbEnd (the untouched pre-fight
value), with a defensive fallback to o.maxHp when o.hp is not
a finite number (preserving old behavior in that impossible
case, never NaN). Plain words: a lost or fled fight against a
lingering raider can now only keep or deepen the wounds the
monster already had when the fight started — it can never hand
back health the wall already took. If the fight hurt the monster
below its pre-fight wounds, the deeper wound stands.

## Substrate and pairing (VERBATIM reuse, zero edits)

- Single arm, FIX: scripts/policies/tableseat-nowait.js VERBATIM
  (never edited), env LEANLINKRESCUE=1, TABLESEATNOWAIT=1
  (TABLEDEFIANT unset), PLUS the w4damage recorder stack
  VERBATIM (raftdraft-diag, spawnsrc-diag, oldcore-diag,
  w5births-diag, defwound-diag, nonworldkill-diag,
  tbdmg-rebase-diag, w4damage-diag) with on-switches
  RAFTDRAFT=1, SPAWNSRC=1, OLDCORE=1, W5BIRTHS=1, DEFWOUND=1,
  NONWORLDKILL=1, TBDMG=1, W4DMG=1.
- Sweep driver reused VERBATIM: scripts/test-w4damage-sweep.js
  via its EVID env override (no copy, no transcription drift):
  BEFORE corpus -> evidence/2026-10-28/perseed-wallwounds-a/
  before/, AFTER corpus -> .../after/. Row files are
  s<seed>-armed.json in each dir, summary.json per dir.
- NEVER edited: tableseat-nowait.js, any existing recorder
  file, or any existing sweep/analyzer file. New files only:
  scripts/test-wallwounds.js (analyzer / proof validator),
  scripts/test-wallwounds-restore.js (unit proof on real tbEnd),
  this prereg, the evidence file, the corpus dirs.
- Seeds 75101-75108, horizon 180d DEATH-AWARE (runDays stops on
  death/win; +10d tail max). The 8-seed band IS the pilot and
  the judged band (MEASUREMENT.md §§9-12).

## Pre-registered primary metric (BINDING, MEASUREMENT.md §14)

PRIMARY: on traced toll+TB cases, restored HP ==
min(pre-fight world HP, fighter end HP). The 75106 case must
read net -225 after the fix (900 -> 675 toll, restore holds
675, no +65).

GO RULE (judged ONLY against this prereg, ALL legs must pass;
a miss on ANY leg is NO-GO and the game-code change is
reverted):

  (a) REPRODUCTION on UNMODIFIED code matches 900 -> 675 ->
  740: the BEFORE corpus (unmodified code, identical seeds/
  substrate) contains the 75106 seq 55 case exactly — raid
  toll d127 900 -> 675 (wall 225), TB d129 result lost with
  monster fighter end 740, oldcore re-entry d129, and actual
  post-restore world HP 740 (read from the w4damage daily
  snapshot on/after d129 and/or the next defwound row's
  mHpStart for seq 55 — NEVER recomputed from the old
  formula; the w4damage analyzer's recomputation is NOT a
  measurement of restored HP). BEFORE-corpus parity vs
  evidence/2026-10-28/perseed-w4damage-a/ must also hold
  EXACT on days, gameDays, won, waveReach, nationalEver/
  Final, table, entered, deathTotal, courtship combined,
  wave-4 defwound rows by context, and wave-4 nonworldkill
  starts (zero src/ diff makes this the expected outcome;
  any diff is diagnosed, never hidden).
  (b) POST-FIX same seed/case restores to 675 with no crash:
  the AFTER corpus contains the same 75106 seq 55 case (same
  toll 900 -> 675, same TB d129 lost, same fighter end 740,
  oldcore re-entry d129) and its actual post-restore world
  HP reads 675, and the AFTER sweep completes all 8 seeds
  with every recorder clean (errs 0, no overflow).
  (c) FULL 8-SEED BEFORE/AFTER on identical seeds 75101-75108
  (tableseat-nowait VERBATIM, env above, 180d death-aware):
  detgate on 75101 PASSES on both code versions (within-code
  neutrality: baseline vs recorders-OFF equal on days,
  gameDays, tsNationalDay; cross-code numbers may differ by
  the fix's own trajectory effect, disclosed, never forced
  to the old 132/132/77); median survival (AFTER) >= 0.8 x
  median survival (BEFORE); starvation deaths (AFTER) <=
  starvation deaths (BEFORE) + 2; substrate-activation gate
  passes on both bands (courtship combined > 0 AND >= 6/8
  seeds active — else that band is INVALID, not NO-GO, and
  the run stops for an env fix).
  (d) NO OTHER RESTORE PATH REGRESSED in the proof test:
  scripts/test-wallwounds-restore.js, driving the REAL
  tbEnd on a loaded game, passes all cases: lingerer lost
  with fighter above pre-fight -> pre-fight (675, not 740);
  lingerer fled with fighter above pre-fight -> pre-fight;
  lingerer lost with fighter BELOW pre-fight -> fighter end
  (wounds deepen, never erased); titan lost -> full maxHp
  (unchanged); won -> no restore (monster gone); routed
  lingerer -> no restore (breaks and runs). PLUS a
  corpus-level check on the AFTER band: every joined
  lingerer re-entry (NWK start + tbdmg end + oldcore
  re-entry) has actual restored HP <= its pre-fight HP.
  A failed case is a NO-GO leg-(d) miss, not a note.

  NO-GO handling: revert the game-code change (git checkout
  of that file's committed state is forbidden as a restore
  step for OTHER files — revert by editing the line back to
  the BEFORE formula, then re-verify with node --check and
  the unit test on unmodified behavior), leave evidence +
  instruments committed, and say NO-GO plainly with the
  failing leg named. Do NOT silently switch to the
  visibility alternative; name it as the next step.

SENSE RULE (binding): non-measured replay only, using
scripts/test-w4damage-sense.js VERBATIM with SEED=75106,
windowed on that seed's wave-4 window (FROM_DAY=69, the
w4damage supplement window d69-d146). Replay text proves
wording and presence only, never counts, and the replay
trajectory shift is stated, not hidden. The sense question:
after the fix, does a lost fight against a toll-wounded
lingerer read sensically — the wound the wall took stays
taken, and nothing in the village's language claims the
monster came back healthier? The sense note is short and
bears on that question only.

PILOT GATE (MEASUREMENT.md §§9-12): the 8-seed BEFORE band is
run first and judged for reproduction + parity before the
fix is written. If leg (a) fails, the fix is NOT written and
the run ends NO-GO on reproduction. If the gap is a pure
instrument bug that can be fixed and re-proved, the fix, the
re-proof, and the re-sweep are all disclosed, and the
original failed pilot rows are kept, never overwritten
silently.

## Balanced panel (§15) and telemetry

BALANCED PANEL: attempt scripts/balance-panel.js compare and
record the outcome. The known limitation is documented in
prior arms (no corpus-ingest mode for a single-arm census
corpus; the tool compares panel files from live roots, not
census rows). If it fails the same way, say so and use the
paired before/after sweep tables + analyzer outputs (this
band vs itself, identical seeds/policy/substrate) as the
section-15 substitute. No panel artifact will be faked.

TELEMETRY DEVIATION CHECK (loop body step 10): run AFTER
writing evidence (telemetry-check.js vs scale-wall baseline,
metrics national,table,wins,exiled, current glob
evidence/2026-10-28/perseed-wallwounds-a/before/*.json and
.../after/*.json), report LOUD lines with verdict, do NOT
roll the baseline on an unexplained LOUD line (the
baseline's WINSEAT regime forbids comparing it to a
tableseat-nowait census substrate, and per-seed rows carry
nationalEver/entered/won, not top-level national/table/
wins paths — say which artifact class applies, or
investigate if a line fits neither).

## Metric review (to be filled at judging time, not before)

- (pending at pre-registration; doubts arising during the run go
  here, and any revision applies to the NEXT run, never this one.)
