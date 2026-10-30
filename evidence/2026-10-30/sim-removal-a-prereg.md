# sim-removal-a — PREREGISTRATION (binding, committed BEFORE any judged analysis)

Run: flesh-out loop, run fleshout-20261030T0855Z (coordinator-assigned
worker sim-removal-a). Axis: scale-onramp (blocking axis, converging,
NOT converged). Sibling Loop B live on food-economy — NOT touched.
DIAG ONLY, measurement only, zero src/js game changes, no default flip,
no gate move, no deed-bar move.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (Wave 4: The Mirror Draft,
standing >= 100 gate; bands damage 35-95, HP 850-1500). NO CANON-registered
doc covers a removal taxonomy specifically — the taxonomy below is
measurement-defined from code-read function names (game.js, havenGrowth.js,
titans.js, finale/network-campaign.js), stated exactly so it can be
checked, and is NOT canon. Governing canon rules: CANON.md "Monster
encounters are fought, not rolled" and the perception law (Steve
2026-10-28): tile-mate presence is REPORTED from recorded state only,
never fed into any decision.

## Band and substrate (binding)

- Seeds 75101-75116 (16, same fresh band as chainclose/recurrence/
  spawnhp/scholarmelt), 180d death-aware horizon (dead villages stop
  simulating; +10d tail max per MEASUREMENT.md §10).
- Horizon why: identical to the prior arms so chain sets, census
  trajectories, and wall numbers are comparable in kind; the question
  is explicitly "inside a village lifetime".
- Policy: scripts/policies/tableseat-nowait.js VERBATIM, exactly as
  chainclose used it (verified from chainclose's sweep, not assumed).
- Game substrate env (verbatim from chainclose): LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1, FIELDPARTY=1, W4DPR=1, BREAKLINE=1, TILEJOIN=1,
  SHOUTREC=1, JOINENDLINES=1, plus the new record-only switch
  REMOVAL=1 (new recorder only; no game behavior reads it).
- Recorder stack, reused verbatim (never edited): fieldparty-form-diag,
  w4dpr-diag, breakline-diag, tilejoin-diag, shoutrec-diag,
  joinendlines-diag. The scholarmelt recorder is NOT re-installed in
  this sweep: its corpus (perseed-scholarmelt-a) is substrate-identical
  to this band, so melt/kill/restored verdicts are CROSS-REFERENCED
  from it, never re-judged here. This arm does NOT re-score
  scholarmelt's verdict and does NOT widen its matching window
  (same-day window stays a next-run prereg, not this arm).
- New code only: scripts/policies/removal-diag.js (record-only
  removeWorldMonster + spawnWorldMonster wraps + object-identity uid),
  scripts/sweep-removal-a.js (a copy of the scholarmelt sweep with
  exactly the deltas disclosed below), scripts/analyze-removal-a.js
  (pure analyzer: reads corpus JSON, never touches game state), and
  scripts/test-removal-a.js (fixtures + determinism check).
- Sweep deltas vs sweep-scholarmelt-a.js (all else identical):
  (a) default EVID dir perseed-removal-a; (b) removal recorder
  (REMOVAL=1) installed at setup + daily hook, serialized as the
  additive `removal` row field; (c) census snapshot enriched (uid,
  wave, maxHp, veteran, lingering, titan, stance, lostSight, mx, my)
  in the daily hook, written to census-s<seed>.json beside (never
  inside) the row — census files are separate from rows, so the
  enriched format does not affect row byte-identity; (d) NO
  scholarmelt recorder in this sweep (cross-ref only, see above).
  The row minus the additive `removal` field must be byte-identical
  to chainclose's row per seed.

## The removal recorder (what it observes, read from code)

Every engine removal path calls Game.removeWorldMonster (game.js
removeWorldMonster splices state.worldMonsters; verified by grep —
no direct splice of that array exists in src/js outside debug
scenarios). The wrapper records BEFORE and AFTER delegating, draws
no RNG, writes nothing to game state (store arrays + a module-side
WeakMap only), never throws into the engine, returns the original
value untouched:

- Removal row: per-seed event seq (monotonic order within the day,
  so same-day ordering is observable), scholar day, monster id,
  uid (object-identity, see below), wave, hp, maxHp, tx, ty, mx, my,
  stance, lostSight, fearTurns, watchTurns, lingering, titan,
  veteran, tbActive, fightMonsterIds, fledMonsters snapshot
  (keys + same-id entries, before and after the call), and the
  call stack (first game.js frame + enclosing function names).
  A null monster argument is recorded as a null-row (engine
  no-op), never silently dropped.
- Spawn row: same seq/day fields for every spawnWorldMonster call:
  id, uid, wave, hp, maxHp, tx, ty, mx, my, stance, veteran, and
  stack. Spawn rows distinguish a genuinely new entity from a
  tbEnd restore: restores push the lifted object directly
  (game.js tbEnd worldOrigin path, ~44395) and do NOT call
  spawnWorldMonster, so a reappearance with no spawn row is a
  restore, not a birth. Fled-monster re-entry DOES call
  spawnWorldMonster (game.js ~12632) and carries wounded hp.
- Object-identity uid: a per-seed counter assigned in a
  module-side WeakMap keyed by monster object, shared by the
  removal wrap, the spawn wrap, and the sweep's census snapshot
  (lazy assignment on first sight for objects created before
  install). Uid continuity is the trajectory proof: a census
  trajectory is a uid's day-by-day (tile, hp) path, never a
  hp+tile adjacency guess. Two same-type entities are never
  merged by uid, whatever their hp.
- Census snapshot timing is unchanged from the prior arms: the
  daily hook, BEFORE base.daily, so a snapshot day is
  start-of-day state, not end-of-day state (the scholarmelt
  census-phase note, carried here verbatim).

## Universe and definitions (binding, fixed here)

- CHAINS: chainclose's buildChains (required, never re-implemented):
  maximal runs of meetings of the same mid on the same seed, in
  day order, split when a meeting's mHpStart differs from the
  previous meeting's mHpLeft. Universe for chain ends: wild
  (field-channel) wave-4 chains only, all callers.
- CHAIN END / FATE: recurrence's censusMatch + classifyFate
  (required, never re-implemented), run against THIS sweep's
  census (not the old census): FINISHED (last mHpLeft == 0),
  BEAST-VANISHED (absent from all later snapshots through the
  final snapshot day), VILLAGE-GONE (run ended, window <= 7d),
  STILL-PRESENT-AT-HORIZON, NEVER-CROSSED, VILLAGE-NEVER-OUT,
  UNCLASSIFIED (census unusable or no post snapshot with
  window > 7d). Judged chain ends are the BEAST-VANISHED chains:
  every one gets a removal class below, or an honest
  UNCLASSIFIED with its missing instrument named. FINISHED
  chains are reported by their kill meeting (not removal rows);
  STILL-PRESENT / NEVER-CROSSED / VILLAGE-NEVER-OUT chains are
  not ends and are reported as counts only; VILLAGE-GONE chains
  are run-end, not removals, and are reported as counts only.
- REMOVAL WINDOW for a vanished chain: removal rows for the
  chain's census uid with day in (lastSeen, firstAbsentDay],
  where lastSeen is the chain instance's last census day at its
  chain hp and firstAbsentDay is the first post-lastDay
  snapshot day not containing the instance (recurrence
  definitions). If the census uid cannot be pinned (the
  instance never appears in this sweep's census at chain hp),
  the fallback window is (chain lastDay, firstAbsentDay] matched
  on (mid, hp) and disclosed as uid-unpinned.
- DROPS: adjacent-day census drops on a uid trajectory: same
  uid, consecutive snapshot days D -> D+1, hp strictly lower,
  tile (4,4) on the later snapshot (the spawnhp shape). The
  drop window is day D's events (removal rows, spawn rows,
  fieldparty meetings, scholarmelt fights with dayStart == D
  or D+1 — scholarmelt fights are cross-referenced by day,
  never re-matched under this arm's window rules). A drop whose
  uid changes between snapshots is an ENTITY REPLACEMENT, not
  a wound, and is classified as such.
- SENSE: node-sim stubs Game.say to no-op, so evidence is
  structured trace (removal/spawn rows, census trajectory,
  fieldparty logs, scholarmelt traces), stated in the evidence
  file. The sense bar is: villager logs for every judged
  chain's meetings + matched scholarmelt traces + removal rows
  read end to end, judged for meaning and coherence, never
  counts alone.

## Removal taxonomy (binding priority order)

Applied to the removal row(s) in a chain's removal window, in
this order; the first matching class wins, and the evidence
string names the row(s) it rests on:

1. SCHOLAR-MELT — removal stack is startCombat AND the
   cross-referenced scholarmelt fight (same seed, same mid,
   lift hp == chain hp, dayStart == removal day) is classified
   SCHOLAR-FLEE-MELT there. Cross-reference only: this arm
   never re-classifies a scholarmelt fight.
2. SCHOLAR-KILL — same, scholarmelt class SCHOLAR-KILL.
3. SCHOLAR-RESTORED — same, scholarmelt class
   SCHOLAR-RESTORED (a lift followed by a restore is not a
   chain end; if it appears in a vanished window it is
   reported as a contradiction, not silently absorbed).
4. SCHOLAR-SPAWN-ENDED / SCHOLAR-BYSTANDER — same, those
   scholarmelt classes (spawned/bystander fights remove
   nothing of this instance; a vanished chain with only such
   rows stays unexplained by scholar combat).
5. LOSTSIGHT-REMOVE — stack is monsterTurn AND removal-row
   lostSight > 6 (game.js monsterTurn: lostSight increments
   while nothing is visible, removal at > 6).
6. FLED-BOLT — stack is monsterTurn, stance fearful, monster
   at a grid edge (mx/my 0 or 8) AND a fledMonsters entry for
   the adjacent node exists after the call with this id/hp.
7. FLED-GAVE-UP — stack is monsterTurn, stance fearful,
   fearTurns >= 4, NOT at an edge, no fledMonsters entry
   (game.js: "melts back into the treeline. Gone.").
8. GLASSWING-TRAP-VANISH — stack is monsterTurn AND id is
   glasswing (trap trigger removes on sight within 5).
9. CURIOUS-FADE — stack is monsterTurn, stance curious,
   id is nightlight_catfish, watchTurns >= 2, not nightlight-
   active (glow dims and sinks).
10. TITAN-FALL-CLEANUP — stack is titanVictory (titans.js).
11. VILLAGER-KILL — stack is a villager fight router
    (resolveWildMonsterEncounter / resolvePatrol /
    lingererSortie / aidFight) AND a fieldparty meeting on
    the same seed+mid+day closes at the removal hp (vKill /
    alreadyDead). (A vanished chain should never land here —
    a kill is FINISHED — so any hit is reported as a
    chain-definition contradiction.)
12. CAMPAIGN-CLEAR — stack is finale-campaign.js or
    network-campaign.js (finale/network wipe of world
    monsters).
13. OTHER-<enclosing-function> — any other stack function,
    named in full (never folded into a generic class).
14. VILLAGE-GONE — no removal row in the window AND no post
    snapshots (run-end class; only for chains that are not
    BEAST-VANISHED — a vanished chain can never land here).
15. UNCLASSIFIED — no removal row in the window for a
    BEAST-VANISHED chain, or removal rows that match no
    class above. Terminal and honest: the evidence names
    the missing instrument (e.g. "per-tick hp-mutation
    recorder" for a wound with no removal, or "pre-install
    removal" if the uid was never seen alive). An
    unmatched startCombat lift (no scholarmelt cross-ref
    fight) counts as UNCLASSIFIED for GO purposes, named
    "scholarmelt cross-ref miss".

Drop classes (same priority where applicable, plus):
- DROP-SCHOLAR-RESTORED-WOUND — a scholarmelt fight with
  lift hp == drop-from, restoredHp == drop-to, lingering,
  day in the drop window (tb restore wounds a besieger).
- DROP-RAID-TOLL — drop == round(maxHp * 0.25) with a
  haven-tile move (havenGrowth.js toll, ~545: drafted
  lingerer loses 25% of maxHp) — expected NOT to match the
  three named drops (their amounts are not toll-shaped),
  stated so a toll-shaped hit is not mistaken for a match.
- DROP-VILLAGER-FIGHT — a fieldparty meeting on the drop
  day closing at drop-to.
- DROP-ENTITY-REPLACEMENT — uid changes across the drop
  (different entity at the same tile/hp band).
- DROP-UNCLASSIFIED — no event in the window explains the
  drop; missing instrument named.

## Named cases (must each get a verdict or a named missing instrument)

(a) s75102 eulogy 853: present d57-61 at (4,4), gone d62
    (scholarmelt INSUFFICIENT-DATA; no scholar fight vs the
    853 instance).
(b) s75116 suburb 1285: villager log d140 (Miguel strikes
    1300->1285, dies), beast roams d141-158, gone d159
    (scholarmelt INSUFFICIENT-DATA; near-miss seq 23 d159
    lingering 960 melt is a different instance).
(c) The 3 unexplained (4,4) drops from the spawnhp census:
    s75105 suburb 975->872 (d128), s75114 reunion 900->745
    (d126), s75114 algorithm 750->624 (d159). The analyzer
    first REPRODUCES these drops from this sweep's census
    (uid trajectory preferred, per-id fallback disclosed);
    a drop that does not reproduce is reported as
    NOT-REPRODUCED with the census difference stated, never
    silently redefined.

## GO bars (binding — judge against this header)

- PREREG: this file committed before any judged analysis.
- PILOT GATE (before the full 16-seed sweep): analyzer
  fixtures green + 1-seed determinism + substrate
  byte-identity vs the chainclose corpus on the pilot seed.
  Kill fast if the instrument cannot observe removals
  (removal rows == 0 on a seed with world monsters, or
  census uid continuity broken).
- SEEDS: 16/16 valid (row days > 0, all recorder errs 0,
  no overflow, census present/sorted/within-1 of row days).
- SUBSTRATE: every row minus the additive `removal` field
  byte-identical to chainclose's row for the same seed
  (16/16). Census presence/sorted/within-1 judged on this
  sweep's own census files.
- CHAIN-END COMPLETENESS: every BEAST-VANISHED chain in
  this corpus carries a taxonomy class above, or an honest
  UNCLASSIFIED with its missing instrument named; no
  vanished chain is silently dropped. Vanished-set
  agreement with recurrence's 4 pairs is reported as a
  diagnostic (a difference is substrate divergence, not
  a re-score of recurrence).
- NAMED CASES: (a) and (b) each get a taxonomy class or
  UNCLASSIFIED-with-named-instrument; (c) each drop gets a
  drop class or DROP-UNCLASSIFIED-with-named-instrument.
  A NOT-REPRODUCED drop is reported as such and counts
  against this bar (it is not a verdict).
- DETERMINISM: 1 seed (75102) scratch re-run, row +
  census byte-identical, scratch removed in a finally
  block (never /tmp for sweep outputs — scratch under
  evidence/2026-10-30/ and removed).
- SENSE: logs/traces/rows for every judged chain read
  end to end (named in the evidence file).
- FIXTURES: scripts/test-removal-a.js green.
- VERDICT: DIAG-GO iff ALL bars above are met, else
  DIAG-NO-GO reported honestly, never softened. A miss is
  NO-GO, never re-scored against a friendlier metric
  mid-run (MEASUREMENT.md §14); metric doubts go under
  "metric review" for the NEXT run.
- SCHOLARMELT BOUNDARY: scholarmelt's verdict stands.
  Nothing in this arm re-judges it, widens its window, or
  promotes its same-day candidate; a removal-row match
  to that candidate is reported as a removal observation
  with the scholarmelt status quoted, not as a melt
  verdict under scholarmelt's prereg.

## Wall numbers (report-only, if computable)

Same convention as the prior arms from this corpus's own
rows: wins (lesser/full), national ever/final, table
reached/entered, wave reach, median survival, death total.
Report-only: no lever is judged on them here.
