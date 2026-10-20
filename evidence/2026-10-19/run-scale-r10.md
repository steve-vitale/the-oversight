# Journey SCALE R10 (2026-10-19) — the table-sanctity gate arm

**Run id:** playtest-loop-2026-10-19-2045CDT (oversight-playtest-loop, LANE A).
**Base:** master 09123a854. Worktree: `journey-scale`.

## PRE-REGISTER (MEASUREMENT.md §§9–12, 14 — written before any code changed)

**Leg question:** Does the table-sanctity fix arm (the named next from
sim-sanctityaudit DIAG-GO, 2026-10-19) close the ambient-router gap without
breaking normal play? Gate the ambient contact block in `monsterTurn()` and
both `reengageWaitingMonsters` callers on `tableActive()`; leave the trial,
contests, player-initiated paths, and the lingerer treeline re-pinning
untouched. (R9 verdict was REFUSE road GO; this run jumps the queue per the
body's rule — a recent commit (74fa846ed) named this fix as its next, and it
is the scale leg's "table approach" beat.)

**Canon:** docs/TABLE.md (sanctity of the table, Steve 2026-10-12): "When
the table sits, the world holds its breath: ambient monster pressure
against villagers is suspended for the whole sequence — no random field
fights, no wild encounters, no patrol contact, and no new raids. ... the
crisis stays open and the player may still answer the call for help. ... ALL
stakes during the finale are the table's own."

**Binding metrics (a miss is NO-GO, never re-scored mid-run):**
- M1 proof RED→GREEN: `scripts/test-table-sanctity-gate-20261020.js` —
  RED on base (ambient site fires while tableActive, reengage fires while
  tableActive), GREEN after the gate: (a) 200 monsterTurn ticks with a
  suburb lingerer on the Haven tile + tableActive → zero ambient
  startCombat fires; (b) the lingerer is STILL pinned (crisis stays open);
  (c) the trial path still fires (startCombat('finale',{tableTrial:true})
  while tableActive); (d) reengageWaitingMonsters paths fire nothing while
  tableActive and the stash survives intact; (e) CONTROL — tableActive
  false → monsterTurn contact and reengage both fire normally.
- M2 static audit updated: 0 uncovered ambient sites, new gate lines cited
  in GATES, `node scripts/test-sanctityaudit-20261019.js` (static) PASS.
- M3 check.js --quick: no NEW failures vs the base run (4 pre-existing
  base failures per journey-establishment r18).
- M4 sweep: fresh 8-seed sweep (64201–64208 × belongfeast, SEATDRIVE=1 +
  TABLEPATHS=1) → zero ambient fights while tableActive() true, with the
  trial intact where a table sits. (Caveat, from the audit: the sanctity
  exposure window is ~1 day on this base; the REPLAY proof is the decisive
  instrument — the sweep is a regression check that the gate doesn't break
  table flow.)

**Interesting-finding bar:** does the reengage hold read honestly in the
fiction (a spoken line, not silence — "no silent actions"); does the
monster simply holding (no wander/lostSight during sanctity) cause any
downstream weirdness (a monster glued to the player tile for the whole
challenge); any collateral on non-table play (the control case).

**Horizon:** proof + static + quick are instant; sweep 8 seeds × 180d
(death-aware, same surface as the tablepaths corpus).

**Substrate checklist (§14b):**
1. Contact: the audit's REPLAY proved the gap (site 21865 fired with
   tableActive true) — the mechanism is live in this harness. PASS.
2. Pool sizing: the fix is two gate sites; the sweep is a regression
   surface, not a lever measure — 8 seeds suffices. PASS.
3. Verb existence: `this.tableActive && this.tableActive()` is the
   established idiom (7307, 18804); both callers of reengageWaitingMonsters
   are known (11063, 11125). PASS.
4. Horizon fit: the corpus incident was d90–91 on a 180d surface. PASS.

**Kill verdict taxonomy:** an M1 miss is METRIC-BROKEN unless the autopsy
finds the gate can't reach the mechanism (then CONCEPT-DEAD for "gating
reaches the ambient routers"). An M3 miss (new quick failures) is NO-GO
for the landing — fix or revert.

## IMPLEMENTATION

All in `src/js/game.js` (worktree), following the existing gate idiom
(`this.tableActive && this.tableActive()`, cf. 7307 resolvePatrol, 18818
villagerMonsterTick):

1. **monsterTurn() ambient contact block** (~21683): early return when the
   table sits, placed AFTER the glasswing trap-trigger block (the player's
   own device — stays live per the audit's scoping) and BEFORE the hummice
   sonar block. One choke point covering all 8 stance/contact sites
   (21690–21949). The world monster simply doesn't take its turn — "the
   world holds its breath."
2. **exitBuilding hall-door exit** (~11060): when the table sits, the
   door-fled stash is NOT consumed — a spoken hold line instead:
   "⚠️ They're still out there. Waiting. Even they hold their breath
   while the table sits." The stash (incl. stashed HP) survives the finale
   intact. No silent action.
3. **treelineAmbush()** (~11122): returns false immediately when the table
   sits, BEFORE any stash mutation — the dead bearer's killer holds, the
   stash stays intact, the crisis stays open. Returns false (not the
   encounter) so the tile-entry roll proceeds as the player's own travel
   choice.

Untouched per the named-next scope: the trial (table-feared.js:158 —
startCombat itself carves tableTrial out of the breach crisis, 31159),
contests, player-initiated paths (gwTrapTick 21556, tent "Face it" 22572,
feast draw, UI), the lingerer treeline re-pinning (havenGrowth.js:220 —
the siege persists; only the mid-finale ENGAGEMENT is gated).

## PROOF (RED → GREEN)

`scripts/test-table-sanctity-gate-20261020.js` — 11 checks:
- RED on base: A2 (ambient suburb fires mid-sanctity), A3 (lingerer
  consumed), C1/C2 (door re-engage fires, stash consumed), D1/D2
  (treeline ambush fires, stash consumed) all FAIL. B1 (trial fires) and
  E1/E2/E3 (control: table down → contact + re-engage fire) PASS on base.
- GREEN after the gate: all 11 PASS. 200 monsterTurn ticks with a suburb
  lingerer on the Haven tile + tableActive → 0 ambient fires; lingerer
  still pinned; trial still fires; door-exit mid-sanctity fires nothing and
  keeps the stash; treelineAmbush returns false with the stash intact;
  control proves normal play untouched.

## STATIC AUDIT (M2)

`scripts/test-sanctityaudit-20261019.js` (static): SITES line numbers
refreshed, `cover` cites the new gate lines, GATES inventory extended to
5 gates. Result: **9 ambient sites, 0 uncovered — STATIC AUDIT: PASS.**

## SENSE-READ

- Door-exit hold: "You push through the doors into open air..." →
  "⚠️ They're still out there. Waiting. Even they hold their breath while
  the table sits." Honest, names the situation, stash intact with HP.
  PASS — no silent action.
- monsterTurn during sanctity: 30 ticks, 0 say lines. The monster simply
  holds. Acceptable: the System already announced the hold aloud at the
  sitting ("EVERYONE. SIT. WATCH."); per-tick narration of inaction would
  be filler, and the existing gates (villagerMonsterTick, resolvePatrol)
  are equally silent. The inaction IS the fiction — "the world holds its
  breath."

## CHECK --QUICK (M3)

**253 passed, 4 failed** — identical to the pre-change baseline (253/4).
The 4 failures are the same pre-existing phone-frame-proof staleness
("every retained browser input matches current source" + "current phone
evidence is required") — environment/browser-evidence, untouched by this
change. M3 PASS: no new failures.

## SWEEP (M4)

8 seeds × belongfeast (64201–64208, SEATDRIVE=1 + TABLEPATHS=1, 180d
death-aware), gated engine, evidence in
`evidence/2026-10-19/perseed-sanctitygate-r10/belongfeast/`:

| seed | days | sit | fights | during-sanctity |
|------|------|-----|--------|-----------------|
| 64201 | 100 | d100 | 17 | none |
| 64202 | 90 | d90 | 20 | none |
| 64203 | 143 | d142 | 19 | finale@d142 (trial) |
| 64204 | 38 | — | 3 | none (died pre-table) |
| 64205 | 90 | d90 | 21 | none |
| 64206 | 90 | d90 | 9 | none |
| 64207 | 154 | d154 | 29 | none |
| 64208 | 91 | d90 | 17 | finale@d90 (trial) |

**M4 PASS:** zero ambient fights while tableActive() true; the only two
during-sanctity fights are the trial-by-combat — the table's own stake,
correctly ungated. 8/8 runs clean, 0 instrument errors.

Telemetry deviation check (step 14): compared the gated sweep against the
audit's ungated corpus (same seeds, same substrate, same instrument —
the honest baseline) on fights / fightsDuringSanctity / gameDays:
aggregates are BYTE-IDENTICAL (135 / 2 / 796 both). telemetry-check: quiet,
no LOUD lines. The gate changes nothing on this seed set's trajectories —
expected, since the exposure window is ~1 day (the audit's own caveat);
the REPLAY proof is the decisive instrument. (The scale.json baseline's
metrics don't map to this instrument's schema — no bogus baseline rolled
forward.)

## VILLAGE ASSESSMENT — the sanctity sweep census in plain words

Eight belongfeast villages walked the scale leg under the seat-drive. Seven
reached the table (sat d90–154); one (s64204) collapsed at d38, pre-table,
of ordinary attrition — three fights, no seat, no sanctity to violate.
Where the table sat, it sat undisturbed: the only blood during the
sanctity windows was the trial's own — two finales, both opt-in, both
televised. No background wolves.

The villages lived: Rut King met at the door on s64203 d13 with the
codex counter learned live ("Go for the eyes"); raids of five answered by
Gertrude, Ekua, Stan and the roster; the barter economy stirring; gardens
keeping honest books (untended Muscadine Grapes drowned in weeds — six
untended days); audience trials ("haul 1,000 kcal"); standings read aloud
(Haven 1st of 5). What they knew: foragers handling coconut and pupunha
"8 days running" until the uses clicked; Olivia teaching Rowan Generous
Heart; DeShawn drawing White Oak Acorns in the dirt for the others. What
was missing: nothing the gate touched — the missing thing on the one lost
run was survivors, not mechanics.

## PEOPLE CHECK

Sense-read of the sweep sayTails (Steve 2026-10-11 SENSE-TESTING LAW):
DeShawn's acorn report is grounded in place ("coming back thick on the
damp slope"); Lucas pronounces a Denver place-name wrong the way a
non-local would — voice with specificity; Ekua asks whether the audience
can feel proud — the fiction's central question in a villager's mouth;
Olivia teaches, Stan and Sofia linger over the fire, the village throws
out spoiled stores and says so. 0 senseless flags on the sampled tails.
They act like people.

## BLANK FILLED

sim-sanctityaudit's named next — the two uncovered ambient routers are now
gated. The corpus incident class (raid lingerers re-pinned to the Haven
tile engaging via monsterTurn mid-finale, killing post-trial scholars as
"background wolves") cannot recur: the stance machine won't walk them in,
the door-flee stash won't re-engage, the treeline ambush won't fire — and
the siege itself persists (re-pinning untouched, stash intact, trial
ungated), so the crisis stays open exactly as TABLE.md requires.

## VERDICTS

- REACHABLE: engine-level correctness — every table reached gets sanctity
  automatically. N/A as player content; the fix removes a forbidden outcome.
- FUN: removes the single anti-fun outcome (mid-finale background-wolf
  deaths); the hold line adds a beat ("Even they hold their breath").
- WINNABLE: strictly more honest — no run loses villagers to stakes TABLE.md
  forbids. The trial (the one opt-in existential risk) is untouched.

## METRIC REVIEW

No revision proposed. M4's pre-registered caveat held — the exposure window
is ~1 day on this base, the REPLAY proof was decisive, the sweep was the
regression surface. M1's control case (E) earned its keep: the first
control draft failed to lift the table (tableActive reads
pg.tableDone && T.phase !== 'done'), which the fixed control now does
explicitly. No metric was re-scored mid-run.

## Files

- This note: `evidence/2026-10-19/run-scale-r10.md`
- Proof: `scripts/test-table-sanctity-gate-20261020.js` (RED→GREEN 11/11)
- Audit instrument: `scripts/test-sanctityaudit-20261019.js` (SITES/GATES
  refreshed; static PASS; +SWEEP_EVIDIR override)
- Fix: `src/js/game.js` (3 gates: monsterTurn ~21683, exitBuilding ~11060,
  treelineAmbush ~11122)
- Sweep evidence: `evidence/2026-10-19/perseed-sanctitygate-r10/belongfeast/s6420{1..8}.json`
- Console: (sweep stdout captured in run)
