# sim-pickband-a — PREREGISTRATION (binding, committed BEFORE any judged run)

Run: flesh-out loop, run fleshout-20261029T1315Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-pickband-a.
Assignment: FRESH-BAND WAVE-4 HUNT PICK CENSUS — measurement only,
zero game change. This arm runs a fresh band on seeds the funnel-a
band never used, with the funnel substrate verbatim, and censuses
every wave-4 HUNT pick in it with the departlag join rule. It does
NOT attempt to fix scarcity: if the band replicates scarcity, that
replication IS the result.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law; wave-4 bands:
damage 35-95, HP 850-1500, pierce 0.2-0.5; wave-4 gate standing >=
100 with the combat-readiness hold) and docs/PARTY.md (context
only — this arm touches no party behavior). CANON GAP, stated not
invented: no CANON-registered doc covers the daily pick lottery,
departure gates, travel-to-known-monsters, or field-fight returns.
The mechanism below is derived from code and predecessor evidence,
stated exactly so it can be checked (same mechanism text as the
funnel-a / departlag-a preregs):

- RETURN-TO-FIGHT: a villager who actually fights a living world
  monster remembers the fight's tile; only that villager may be
  offered a HUNT errand back to it. Memory store:
  state.village.monsterSightings[vid] = [{mid, tx, ty, day,
  part}], cap 4 per villager, oldest dropped first. Written by
  objNoteMonsterSighting; spent by objDropMonsterSighting, whose
  only caller in src/js is the HUNT arrival path (objAwayStep).
- HUNT OFFER (objPick + objHuntCandidate): at a dawn/idle pick, a
  villager with a fight memory may be offered HUNT at lottery
  weight 2.0 (food, water, hall life still compete — an offer is
  never a guarantee). Gates, all enforced by objHuntCandidate:
  memory fresh (age 0-3 days), villager armed, within roaming
  range (1 <= Chebyshev distance <= npcMaxDist), not sheltering,
  not resting off a bad flee. HUNT is solo by design.
- PICK vs DEPARTURE: objPick chooses the errand (state 'ready');
  objMaybeDepart later departs it through danger/heal gates
  (objDepart). Departure never re-checks memory age — a pick made
  age 3 departed age 5 on record (funnel-a: visjoin_115, picked
  d135 huntDay 132, departed d137). A HUNT pick can be superseded
  before it ever departs. Only the departlag join (pick ->
  earliest of matching departure / next recorded pick / death)
  classifies a pick's fate.
- RECORDER NOTE (read carefully — this prereg names the channels
  exactly, so "three recorders" is never misread): there is NO
  policy file named departlag-diag. The three named inputs are
  (1) scripts/policies/funnel-diag.js (FUNNEL=1: pick + note
  records), (2) scripts/policies/departhold-diag.js
  (DEPARTHOLD=1: departure-evaluation verdict records), and
  (3) the departlag census LOGIC (scripts/test-departlag-a.js,
  classifyPick, reused VERBATIM by import — a pure analyzer,
  not a recorder). The sweep additionally installs the two
  underlying channels the census joins against, reused verbatim:
  fieldparty-form-diag (FIELDPARTY=1) and returns-diag
  (RETURNS=1). No recorder file is edited by this arm.

## Fresh band (this arm's own corpus, base code)

- Seeds 75117-75124 (8, verified unused: no row in any
  evidence/2026-10-29/perseed-*/ dir carries these seeds — checked
  by grep before this prereg; do NOT use any other band).
  scripts/policies/tableseat-nowait.js VERBATIM,
  LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1,
  RETURNS=1, FUNNEL=1, DEPARTHOLD=1 (all recorders on).
  180d death-aware (runDays stops on death/win, as in the
  predecessor sweeps), competent policy (tableseat-nowait).
- SUBSTRATE (named, never switched mid-run): tableseat-nowait
  + the funnel substrate env flags verbatim above. No other
  policy, no policy edit, no game-code edit, no lever of any
  kind. This arm is measurement only: ZERO src/js changes,
  zero default flips, zero policy defaults changed.
- CORPUS LAYOUT (new arm dir — predecessor corpora are never
  overwritten): evidence/2026-10-29/perseed-pickband-a/
  s<seed>-fresh.json. Each row carries the fieldparty,
  returns, funnel, and departhold channels PLUS a deaths list
  (day, who, cause, player) from the harness live-death
  capture. Sweep: scripts/test-pickband-a-sweep.js (the
  departhold-a sweep adapted by seed band + corpus dir only;
  its install order and write-retry/verify logic are
  unchanged). Analyzer: scripts/test-pickband-a.js (imports
  classifyPick from scripts/test-departlag-a.js verbatim;
  no reimplementation of the join). Sense:
  scripts/test-pickband-a-sense.js (verbatim pick chains
  from the corpus). Fixtures: the departlag fixtures
  (scripts/test-departlag-a-fixtures.js, 18/18) are reused
  verbatim as the join-rule proof — no new join rule exists
  to fixture; a pickband fixtures script asserts only this
  arm's own legs (seed band, corpus dir, wave-4 lookup,
  classification completeness on the corpus).
- WHY 8 SEEDS: the assignment fixes this band (screening
  size for a census arm; seeds are nearly free, Steve
  2026-10-13, but the band is fixed by the task, not
  grown mid-run). A census count is reported with its n
  always; no rate is quoted without its n.

## Universe and join rule (fixed before any judged run)

PRIMARY UNIVERSE: every pick record in the pickband corpus
whose chosen.kind == 'HUNT' and whose chosen.huntMid maps to
a wave-4 monster in src/data/monsters.json (wave field).
The funnel recorder captures every such pick: it records any
pick where the villager held a wave-4 memory OR chose a
wave-4 HUNT, so no wave-4 HUNT pick can hide from it.

JOIN RULE (departlag, verbatim, via imported classifyPick):
for each primary pick P (seed, vid, mid = chosen.huntMid,
huntDay = chosen.huntDay, pick day/part), consider, in part
order after P: matching returns departures (same vid, kind
HUNT, same huntMid, same huntDay, part >= P.part); the next
funnel pick record for the same vid (part > P.part, any
chosen kind); the first deathsList record for the same vid
(day >= P.day). Classification, by the earliest of these
events:

- DEPARTED: a matching departure precedes any next pick; lag
  = departure day/part minus pick day/part; memory age at
  pick and at departure reported; stale-at-departure iff age
  at departure > 3; true-drop flag from the returns drops
  channel (dropped=true for that vid+mid at part >= dep).
- SUPERSEDED: a next pick precedes any matching departure;
  sub-kind RE-PICK / OTHER-HUNT / NEEDS (EAT or WATER) /
  OTHER, with lag to the superseding pick. Supersession
  outranks a later death (departlag fixture 10).
- DIED-HOLDING: no departure, no next pick, a death record
  exists; same-day flag iff death day == pick day.
- HELD-TO-HORIZON: no departure, no next pick, no death.
- UNKNOWN: a departure on/before the death day (day-granular
  death, part order unresolvable) — the only UNKNOWN shape
  in the imported rule.

For every primary pick the evidence reports: count, villager,
seed, pick day/part, memory age at pick, and outcome class
with lag for departed/superseded picks. Departhold verdicts
are reported alongside a pick's fate when an evaluation
exists for it (held-ready reason, danger verdict), labeled
as verdict context — never as a reclassification: the
departlag class stands on the pick/departure/death join
alone.

SECONDARY CENSUS (reported, NOT judged, labeled everywhere):
all HUNT picks by wave-4 memory holders in the corpus (any
wave huntMid), classified by the same rule. This is the
departlag secondary universe; it must never be pooled
silently with the primary.

SMALL-N DISCIPLINE (binding): report COUNTS with their n
everywhere. Never quote a pick share, departure rate, or
lag median as a rate without its n. This band is reported
SEPARATELY from funnel-a; a pooled count (funnel-a primary
n=2 + this band's primary n) appears as ONE clearly-labeled
secondary line only, never as the headline.

## Pre-registered DIAG-GO threshold (binding — a miss is NO-GO)

PRIMARY METRIC: pick count + classification completeness on
the fresh band.
DIAG-GO requires ALL of:
  (1) 8/8 seeds valid: every row present, days > 0, all four
      recorder channels present with errs 0, overflow 0,
      installed true (departhold evaluations present);
  (2) every wave-4 HUNT pick classified, UNKNOWN <= 1
      (UNKNOWN counts against the leg; an UNKNOWN pick is
      still listed with its seed/villager/day);
  (3) determinism: one seed's scratch re-run (into a scratch
      dir inside this worktree, removed after comparison)
      produces a row JSON byte-identical to the corpus row;
  (4) recorder-neutrality: one seed run with recorders OFF
      (plain tableseat-nowait via the sim harness, same
      seed/env/days, no diag installs) matches the corpus
      row EXACTLY on every comparable field (days,
      endReason, won, waveReach, maxArc, finalRank, maxRank,
      nationalEver, nationalFinal, table, entered,
      deathTotal, starvationDeaths, deaths summary,
      finalPop, finalPantry, finalKnown). Recorder channels
      themselves cannot exist in the OFF run by
      construction, so deep-equality is claimed on the
      comparable snapshot only — never on the full row;
  (5) sense bar: at least one verbatim pick chain quoted
      from the corpus and judged in plain words as people
      making choices or not. Chain hierarchy, fixed here
      (so scarcity cannot silently re-score the bar):
      prefer a primary wave-4 HUNT pick chain; if the
      primary universe is empty, a wave-4 memory-holder
      pick chain (offered picks, chosen kinds, candidate
      at pick) from the funnel channel; if the funnel
      channel holds no wave-4 pick at all, a wave-4
      survivor's note+meeting chain. The quoted chain's
      tier is named in the evidence; a chain that does not
      read as a played sequence is a sense failure even
      if the counts pass.
Horizon 180d death-aware (why: matches the funnel substrate;
dead villages stop simulating, +10d tail max per the loop
body). Seeds 75117-75124. Policy tableseat-nowait (substrate
named above — do NOT switch substrates mid-run).

## Guards (reported, NOT judged — a guard miss is investigated,
never re-scored into a GO)

- RECORDER ERRORS: errs/overflow/dangerOutside counts per
  channel, reported per seed; any non-zero errs is a
  neutrality smell, investigated before any census claim.
- WALL NUMBERS (reported for comparability to funnel-a, NOT
  claimed as movement — fresh seeds, no baseline): national
  ever/final, table invited/entered, wins (full vs lesser),
  wave-4/5 reach, median survival (with the horizon-cap
  caveat when the median equals 180), deaths, starvation.
- DEPARTHOLD JOIN: for each primary pick, whether a
  departhold evaluation covers its hold window; a pick
  whose supersession hides a tighten-overwrite (the
  departlag murkcap caveat) is flagged, not reclassed.
- PANEL NOTE (standing): scripts/balance-panel.js has no
  census-ingest mode; identical-substrate fresh-band
  corpora are the section 15 substitute, as in funnel-a /
  departlag-a. No panel artifact faked, no panel verdict
  claimed.

## Metric review (for the NEXT run — never a mid-run re-score)

Doubts about the metric, the universe, or the join go here
in the evidence file, for the next run's prereg. In
particular: (a) the sense-bar hierarchy above is new — if
the primary universe is empty, the next prereg should say
whether a memory-holder chain still counts as the sense
bar or whether an empty primary universe should itself
fail sense; (b) recorder-neutrality on comparable fields
only (leg 4) is weaker than full-row equality by
construction — a future arm that wants full-row equality
must define a recorder-off row shape first; (c) the
departhold verdict join is descriptive here; a future
holds prereg should judge on pick-linked departures AND
stale-at-departure share with verdicts joined, per the
departlag metric review.
