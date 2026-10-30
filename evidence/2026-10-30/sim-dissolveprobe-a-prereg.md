# sim-dissolveprobe-a — PREREGISTRATION (binding, committed BEFORE any judged analysis)

Run: flesh-out loop, run fleshout-20261030T1315Z, worker
sim-dissolveprobe-a. Axis: scale-onramp (blocking axis, converging,
NOT converged). Ranked-next #1 from sim-dissolvecause-a
(evidence/2026-10-30/sim-dissolvecause-a.md): 120/120 dissolved
scholar fights are 'start-post-gone' — the fight is gone at the
startCombat post-record, with no tbEnd, no throw, no death, no
mantle pass, no barrier stamp, and 0 HP cost per dissolved start.
The surviving question: WHICH step inside the startCombat call
nulls tbfight?

DIAG ONLY. No game change, no src/js change, no gate move, no
deed-bar move, no default flip. The probe is a NEW policy-side
recorder layering on top of the untouched scholarmelt recorder
(zero edits to scripts/policies/scholarmelt-diag.js, zero src/js
changes). If implementing the probe would change game behavior,
STOP and report that instead of landing a behavior change. No
[needs-eyes]: this arm changes no feel, combat, or UI — it only
records.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law; the
dissolved population is wave-4 herald titans — herald mdef:
wave 4, size 3, HP 700-900). NO CANON-registered doc covers a
scholar-fight dissolve specifically — the mechanism below is
read from code and stated exactly so it can be checked, and is
NOT canon.

## Mechanism, read from code (leads, NOT findings)

- The startCombat opening window, in order: tbfight is created
  (fighters, order, turnIdx 0, over false), Godpath.beginApexHunt
  runs, telemetry + batch-2 init run, pending is cleared,
  playerMonster() is read, the tile monster is lifted iff it IS
  one of this fight's monsters (bystander hold), worldOrigin is
  set iff the lifted monster is a titan or lingerer, then
  `tbfight.turnIdx = -1; tbBeginTurn();` (no-op until a turn
  lands: tbCurrent is null at turnIdx -1, after its tbEndCheck),
  then `if (!tbIsPlayerTurn()) tbAdvance();` (node: sync path;
  the async path needs window/setTimeout and does not run in
  sims). tbAdvance loops monster/villager turns with a
  tbEndCheck after each, returning at the player's turn.
- Every `tbfight = null` site in src/js (grep, exhaustive at
  prereg time): game.js load() (a save restore, not in-fight),
  game.js tbBarrierExit's death-mid-crossing branch (needs a
  live fight, a player turn, and a barrier push — NOT the
  opening window on its face, but the probe wraps
  tbBarrierExit and will show whether it fires in the window),
  game.js tbEnd's finally (every real Game.tbEnd run nulls),
  party.js tbEnd-wrapper betrayal early-returns (betrayal
  fights only; the recorder's tbEnd post still records a
  result for those, so they cannot be dissolved rows).
- The recorder's tbEnd wrap adopts the pending row only when
  the fight is live and NOT over at tbEnd pre-call, and only
  for the pending-stack top matching by monster ids. A
  Game.tbEnd call inside the window MUST therefore either
  (a) be recorded (row gets a result, not dissolved), or
  (b) miss adoption (fight already over at pre-call — but
  core tbEnd early-returns on an over fight WITHOUT nulling,
  so an over-at-pre tbEnd cannot be the nulling step either).
  The probe discriminates the remaining shapes directly: its
  OWN tbEnd wrap logs EVERY Game.tbEnd invocation in the
  window. tbEnd-event present + row still dissolved = a
  recorder-adoption failure to diagnose from the log, not a
  mystery. tbEnd-event absent + null transition present =
  the null came from OUTSIDE Game.tbEnd (a direct-null path
  or a stale captured tbEnd reference invoked without going
  through Game.tbEnd — several modules capture Game.tbEnd at
  load time, e.g. titans.js, justice.js, party-formal.js; a
  direct call through such a capture bypasses every wrap
  installed later, including the recorder's).
- The probe therefore does NOT guess which shape holds. It
  records the full wrapped-call event sequence inside every
  startCombat call and brackets the first live->null (or
  live->over) transition to the innermost wrapped call (or
  the gap between two consecutive events). The bracket, not
  a hypothesis, is the judged output.

## The build (NEW files only)

- `scripts/policies/dissolveprobe-diag.js` (new; zero edits to
  any existing recorder, policy, or game file): a policy-side
  in-call probe, gated by DISSOLVEPROBE=1. Installed at sweep
  setup + daily hook AFTER the scholarmelt install (wrap order
  is irrelevant to correctness: the probe logs independently
  and attaches by fightSeq-set difference, see below).
  Same discipline as the other recorders: delegate, record
  after, never throw into the engine (recording errors are
  counted, an engine throw is recorded and RETHROWN
  unchanged), draw no RNG, write nothing to game state (the
  event log lives on the scholarmelt meeting row + the
  probe store's diag, never on Game), return the original
  value untouched.
- Wrapped functions (each guarded by typeof-function at
  install; a missing function is a counted probe diag error,
  never a crash): startCombat (window bracketing only),
  tbBeginTurn, tbAdvance, tbEnd, tbEndCheck, tbBarrierExit,
  tbMonsterTurn, tbVillagerTurn, tbRoundWrap, tbDamage,
  maybeCheatDeath, playerDeath, identifyMonster,
  combatWitnessReact, villageEvent, observe,
  removeWorldMonster, playerMonster, tele, plus S.Godpath
  beginApexHunt / observeApexHunt / finishApexHunt /
  finishWardRescues / finishTacticalEscape when present at
  install time. Wraps outside an active startCombat window
  are a fast pass-through (flag check only) — no per-call
  cost to the rest of the sim.
- Event record (per wrapped call, entry + exit): fn name,
  phase, callStack snapshot (the probe's own nesting of
  wrapped calls inside this window, innermost last),
  tbfight state ('null' | 'live' | 'over'), fight result,
  turnIdx, round, fighter counts (total, monsters alive,
  monsters fighting), player fighter HP, current fighter key.
  On the FIRST event where the state leaves 'live' (to
  'over' or 'null'), the record additionally carries
  stackNames: the Error stack parsed to FUNCTION NAMES
  ONLY (file paths, line numbers, and worktree slugs are
  stripped — a stack name containing '/' is dropped), so
  the corpus carries no filesystem paths from this probe.
- Window close: the probe's startCombat post attaches the
  buffer to every scholarmelt row whose fightSeq was not
  present at the window's entry (fightSeq-set difference —
  correct regardless of probe/recorder wrap order) as
  `row.dissolveInCallProbe = { events, overflow }`. The
  buffer is capped (2000 events per window; overflow is
  flagged, never silently truncated into a false bracket).
  The probe store itself is NOT serialized into the corpus
  row; only its diag counters ride inside the scholarmelt
  diag literal (see sweep delta), so the substrate leg
  (row-minus-scholarmelt) is unaffected by construction.
- `scripts/sweep-dissolveprobe-a.js` (new): VERBATIM copy of
  scripts/sweep-dissolvecause-a.js with exactly these
  deltas: default EVID dir perseed-dissolveprobe-a; header
  comment updated; DISSOLVEPROBE=1 set in runOne alongside
  the other env flags; probe install at setup + daily AFTER
  the scholarmelt install; the scholarmelt diag literal
  extended with `dissolveprobe: { errs, errors, overflow,
  installed, windows, attached }` (INSIDE the scholarmelt
  field — stripped by the substrate comparison, so the
  substrate leg still tests the game, not the probe).
  Summary-mode validity additionally requires probe errs 0,
  overflow empty, installed true, and windows > 0.
- `scripts/analyze-dissolveprobe-a.js` (new): REUSES the
  dissolvecause analyzer's analyze() by require for
  classification, cause/HP coverage, substrate, and wall
  numbers (never re-implemented), and adds the bracket
  analysis: for each dissolved row, read its
  dissolveInCallProbe from the raw corpus row and compute
  the bracket per the rule below. Fixtures:
  scripts/test-dissolveprobe-a.js.

## Bracket rule (binding)

For each dissolved row carrying a probe log, scan events in
order from the window's start:
- firstLive = first event with state 'live'. (Events before
  tbfight creation show 'null' and are not transitions.)
- nullEvent = first event after firstLive with state 'over'
  or 'null'. If none, the row is UNBRACKETED (the fight was
  still live at window close — an instrument anomaly for a
  start-post-gone row, counted against the GO bar).
- If nullEvent.phase === 'exit': windowCall = nullEvent.fn
  (that call's exit first shows the null), windowKind =
  'call'. If nullEvent.phase === 'enter': windowCall =
  'gap:' + prevEvent.fn + '->' + nullEvent.fn (the nulling
  happened in unwrapped code between the previous event's
  exit and this entry), windowKind = 'gap', and the common
  innermost wrapped call of the two events' callStacks is
  named as windowContext.
- tbEndSeen = any event with fn 'tbEnd' from firstLive
  through nullEvent inclusive. windowTurn = nullEvent's
  turnIdx/round/currentKey. The bracket is the tuple
  (windowKind, windowCall, windowContext, tbEndSeen,
  windowTurn) — reported in full for every bracketed row,
  never summarized away before judging.
- A bracket COUNTS toward the GO bar iff windowKind is
  'call' or 'gap' (exactly one named call, or exactly one
  named gap between two consecutive events). UNBRACKETED
  rows and rows with no probe log do NOT count.

## Corpus and substrate (binding)

- Fresh sweep: seeds 75101-75116, 180d death-aware horizon,
  tableseat-nowait policy, env LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1, FIELDPARTY=1, W4DPR=1, BREAKLINE=1,
  TILEJOIN=1, SHOUTREC=1, JOINENDLINES=1, REMOVAL=1,
  SCHOLARMELT=1, DRAFTFLAG=1, DISSOLVEPROBE=1 (set inside
  runOne, as in the dissolvecause sweep). EVID:
  evidence/2026-10-30/perseed-dissolveprobe-a/ (fresh dir;
  the dissolvecause and draftflag corpora are READ-ONLY and
  untouched).
- Substrate leg, written as "identical modulo recorded
  filesystem paths" from the start (dissolvecause metric
  review): row-minus-scholarmelt identical to the
  draftflag corpus rows on 16/16 seeds AFTER normalizing
  recorded worktree paths (the removal recorder embeds
  absolute worktree paths in stack frames; raw byte
  identity is reported AND disclosed, but the leg judges
  the normalized comparison), census files byte-identical
  on 16/16 seeds. Any divergence beyond the path slug is
  investigated before judging; the probe must not move
  the game.

## Populations and rules (binding)

DISSOLVED POPULATION — every scholarmelt meeting in the
fresh corpus with result 'dissolved-no-tbend' (the same
population dissolvecause judged: expected 120 rows on
seeds 75102/75104/75105 if the substrate holds, but the
judged numbers come ONLY from this arm's fresh sweep).
Each dissolved row is classified exactly one way by the
reused classifier AND carries (or lacks) a probe log +
bracket. A dissolved row with a null/empty probe log is a
probe-coverage failure, counted against the GO bar — never
dropped from the denominator.

## GO thresholds (binding)

- Prereg committed BEFORE any judged analysis: PASS
  required. (Corpus reads, code reads, and the prior arm's
  counts above preceded this prereg as design input; this
  arm's judged numbers come only from the fresh sweep.)
- Pilot gate (8 seeds 75101-75108, before any confirm
  spend): fixtures green + pilot sweep rows valid (days >
  0, scholarmelt errs 0, PROBE errs 0, probe overflow
  empty, census sorted + lastDay within 1) + instrument
  firing evidenced (pilot dissolved rows, if any, carry a
  probe log; probe windows > 0) + substrate leg on pilot
  seeds (row-minus-scholarmelt path-normalized identical
  to draftflag pilot rows). A failed pilot gate stops the
  run. If the pilot band reproduces 0 dissolved rows, the
  pilot gate FAILS as an instrument/reproduction NO-GO
  (the probe cannot bracket a population that is absent) —
  it is never a pass by absence.
- Seeds: 16/16 valid on the confirm sweep, same validity
  criteria.
- Probe coverage: dissolveInCallProbe present (a non-empty
  events array) on >= 95% of dissolved rows.
- Bracket rate: a counting bracket (call or gap, per the
  rule above) on >= 95% of probe-carrying dissolved rows.
- Questions: the bracket distribution is reported in full
  (every windowCall x tbEndSeen cell with counts), and the
  DOMINANT window is named with its turn context. If the
  dominant window is a gap, the report states the gap's
  two bounding events and the common wrapped context —
  that IS the tightest bracket, not a failure to bracket,
  provided the gap bar above is met.
- Classification completeness: every dissolved row
  classified (exactly one fate each), 0 UNCLASSIFIED —
  carried from dissolvecause's rule, re-checked here.
- Substrate: as above, 16/16 normalized rows + 16/16
  census. Any divergence beyond the path slug is
  investigated before judging.
- Determinism: pilot rows saved to worktree scratch,
  full-sweep rows for pilot seeds byte-identical to pilot
  rows; scratch removed after the diff.
- Sense: at least 2 dissolved chains read end to end for
  meaning (a same-seed day-cluster of dissolved rows plus
  the event log of one row each plus the census snapshots
  bracketing it: does the bracket cohere with the fight
  the scholar was in, does the turn context make sense,
  does anything read as a melt). Node-sim stubs Game.say
  to no-op, so there is no say transcript; sense evidence
  is the structured trace + census, stated as such.
- Fixtures: scripts/test-dissolveprobe-a.js green before
  the judged analysis: probe window attach by
  fightSeq-set difference under BOTH wrap orders (probe
  outside recorder, probe inside recorder); tbEnd-inside-
  startCombat brackets to windowCall tbEnd with tbEndSeen
  true; direct-null inside a tbAdvance subtree without
  tbEnd brackets to that subtree call with tbEndSeen
  false; null in the startCombat body gap brackets to a
  gap window; a live fight gets no bracket and no false
  null; an engine throw inside a wrapped call is rethrown
  unchanged and the window still closes; stackNames carry
  no '/' path characters; buffer cap flags overflow; probe
  delegation returns the orig value and preserves tbfight
  identity on a non-dissolving call; analyzer bracket
  computation on synthetic logs (call, gap, tbEndSeen,
  unbracketed, missing-log).
- Wall numbers: recomputed from the fresh corpus rows
  (same definitions as dissolvecause: wins, national ever/
  final, table reached/entered, wave reach, median
  survival, deaths) and checked against the dissolvecause
  numbers; any divergence is reported, never smoothed
  (divergence is EXPECTED to be zero if the substrate leg
  holds — a nonzero divergence contradicts the substrate
  leg and is investigated, not averaged).

## Verdict rule

- DIAG-GO iff prereg PASS + pilot gate PASS + 16/16 seeds
  + probe coverage PASS + bracket rate PASS + bracket
  distribution reported in full + classification
  completeness PASS + substrate PASS + determinism PASS +
  sense PASS + fixtures PASS.
- DIAG-NO-GO on any failed leg, including 0 dissolved rows
  reproduced, or a bracket rate below the bar even if the
  tightest bracket achieved is named. A miss is NO-GO,
  never re-scored against a friendlier metric mid-run;
  metric doubts go under "metric review" for the NEXT run.
  Every evidence file carries a "metric review" section.
- NO lever verdict: this arm proposes no damage buff, gate
  move, deed-bar move, or any game change. The probe is an
  instrument; its bracket names follow-up work, but no fix
  lands here.

## Method (staged, binding order)

1. This prereg, committed BEFORE any judged analysis.
2. Probe policy + sweep copy + analyzer + fixtures,
   committed before the judged analysis is run (fixture
   bar green first).
3. Pilot: seeds 75101-75108 — fixtures + per-seed validity
   + instrument firing + substrate leg — before the
   confirm sweep is judged.
4. Confirm: full 16 seeds, determinism gate (pilot rows to
   scratch, diff, scratch removed), sense reads per the
   bar above.
5. Evidence evidence/2026-10-30/sim-dissolveprobe-a.md
   with a prereg-legs table, the judged bracket numbers
   in full, the dominant window plainly, sense notes, wall
   numbers (recomputed), plain-words village assessment,
   metric review, and ranked next.
6. No src/js change, no push, no bump, no live
   verification, no merge to master by this worker (the
   coordinator merges; sibling loop B may move master
   under this branch — rebase cleanly at the end and
   re-run the proof; rebase conflict = FAIL LOUDLY, no
   force, no merge).

## Node harness

The sweep runs through scripts/sim-harness.js (the shared
kit: seeded Math.random before eval, full src/js list in
index.html order minus DOM-only files, window stubbed then
deleted for sync combat, never stubbing Game.save). No jest
is run by this arm; any jest invocation would use
--cacheDirectory=/tmp/jest-cache-sim-dissolveprobe-a and
never run concurrently with another jest.
