# sim-wave4demand-a — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: fleshout loop, run fleshout-20261028T1415Z. Axis: scale-onramp
(the blocking axis). Worker: sim-wave4demand-a.
CENSUS / MEASUREMENT ONLY — zero src/js changes, zero default flips,
no game lever, no meeting-rate change, no lethality re-judgement.
This arm does NOT re-judge the w4convert census, the lethality
verdict, or the partyfinish verdict. The deliverable is knowledge:
the DEMAND side of the wave-4 wall — what each wave-4 fight
actually brought with it, against Steve's standing demand
(2026-10-28 02:54 CDT): wave 4 should demand parties and fully
outfitted gear — taking on wave 4 is a party, fully geared
undertaking, not solo or under-equipped play. Documentation IS
the deliverable; no game change lands from it.

## Question

The w4convert census (same band, pre-partyfinish base) found
villages meet wave 4 and kill nothing: field fights deal ~11
damage then flee or die, TB fights always lose. This arm asks
the demand half of that zero: were those fights even the
demanded undertaking — a party, fully geared — or were they
solo / under-equipped play that no demand rule could expect
to win? Per wave-4 fight, at fight start: participants (count
+ identities), solo vs party, each participant's armed state,
armored state (P >= 10), tricks held (village-level, see
below), veteran-with-wave-3+-kill presence, and the outcome
(vKill / vDie / vFlee / mFlee / TB won / lost, raid tolled /
fought).

## Canon read first

- docs/CANON.md, then docs/MONSTER-WAVES.md (wave 4 = the Mirror
  Draft; bands anchored: damage 35-95, HP 850-1500, pierce
  0.2-0.5; "a 4-6 round fight for a godhood build (~220
  dmg/round)"; combat-readiness gates the standing unlock:
  wave 4 needs 3 armored (P >= 10), 5 armed, 3 tricks, 1
  veteran with a wave-3+ kill — `Game.waveCombatReadiness(4)`
  in src/js/standing.js, read from LIVE village state:
  ARMORED = living roster fighters with armor WORN at
  P >= demand (S.equipment.armorOf; scholar via armorBonus);
  ARMED = living roster fighters with a weapon TO HAND
  (equipped melee/ranged, or a weapon item carried);
  TRICKS = counters known under the monsterCounterKnown
  convention; VETERANS = living roster members with a
  recorded kill of a wave-(w-1)+ monster in
  state.waveKillLog).
- docs/MEASUREMENT.md sections 9-12 and 14-15 (pilot gate,
  death-aware horizons, pre-registration, convergence,
  metric binding, balanced panels).
- No canon invented. Where code and canon wording differ, the
  code reading governs the census and the difference is
  reported.

## Prior evidence read first (this arm's definitions come from these)

- evidence/2026-10-28/sim-w4convert-a.md +
  sim-w4convert-a-prereg.md (the census this arm is the
  demand side of: universe 51 wave-4 world spawns on
  75101-75108, faced 31, engaged 29, killed 0; field 16 -> 16
  -> 0; raid 22 -> 4 -> 0; TB 18 -> 18 -> 0; non-world
  reconciliation: 3 non-world TB fights, 2 expedition-leg
  field fights, reported separately, never folded into
  field/raid/TB).
- evidence/2026-10-28/sim-partyfinish-a.md +
  sim-partyfinish-a-prereg.md (the cornered-party hold
  mechanism; its CONTROL band is this run's parity partner,
  see "Base" below; its ARMED band differs by the sortie
  driver policy and is a contrast, never a parity partner).

## Base — stated explicitly (verified before this prereg was written)

- Base commit at worktree creation: branch sim-wave4demand-a,
  tip e17a518f1 ("sim-food-economy-round-1330-b: coordinator
  record"). That tip CONTAINS the partyfinish game-code
  commit 37aa0a4fb (cornered-party hold in fieldFights.js).
- `git diff 37aa0a4fb HEAD -- src/js` is EMPTY: this run's
  game code is exactly partyfinish's game code. The
  cornered-hold mechanism is present in code, but on the
  tableseat-nowait substrate no policy calls a sortie
  (only lingererSortie sets opts.cornered, and no substrate
  policy calls answerLingerer), so the mechanism is DORMANT
  here — the same dormancy partyfinish's analyzer asserted
  for its control band (zero cornered fights). The analyzer
  re-asserts it: cornered wave-4 fights must be 0, or the
  divergence is diagnosed before judging.
- The w4convert base bcf137c40 IS an ancestor of HEAD, but
  the partyfinish commit is NOT an ancestor of bcf137c40:
  w4convert ran BEFORE the partyfinish mechanism landed,
  and `git diff bcf137c40 8e26af922 -- src/js` shows 218
  insertions across 8 files (betrayal, comms, game.js,
  titans, app.js, build.js, conversation.js — including
  the P2 finale-omen regional gate). W4CONVERT PARITY IS
  THEREFORE NOT EXPECTED and is NOT a gate: the w4convert
  band is an era comparison, reported with the intervening-
  code explanation, never re-scored as a parity failure.
- PARITY PARTNER (binding): the partyfinish CONTROL corpus
  (evidence/2026-10-28/perseed-partyfinish-a/control/,
  rows s<seed>-armed.json): same game code as HEAD, same
  policy (tableseat-nowait VERBATIM), same recorder stack
  plus this arm's demand recorder (neutrality pinned by
  the detgate). Per-seed days, gameDays, won, waveReach,
  nationalEver/Final, table, entered, deathTotal, AND
  wave-4 defwound rows by context, wave-4 nonworldkill
  starts, and wave-4 spawn seq sets must match EXACTLY, or
  the divergence is diagnosed with a detgate PASS proving
  recorder neutrality before any verdict is judged (the
  w4convert prereg's parity rule, applied to the correct
  partner).
- If master moves under this run, rebase inside this
  worktree, re-run the proof, and report the move — never
  merge master in, never touch the main tree, never touch
  a sibling lane.

## Substrate and pairing (VERBATIM reuse, zero edits)

- Single arm, CENSUS: scripts/policies/tableseat-nowait.js
  VERBATIM (never edited), env LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1 (TABLEDEFIANT unset), PLUS recorder
  on-switches RAFTDRAFT=1, SPAWNSRC=1, OLDCORE=1, W5BIRTHS=1,
  DEFWOUND=1, NONWORLDKILL=1, TBDMG=1 (via the tbdmg-rebase-diag
  copy), PLUS W4DMG=1 (w4damage-diag), PLUS W4DEMAND=1 (the
  new demand recorder below).
- NEVER edited: tableseat-nowait.js, any existing recorder file,
  any existing sweep/analyzer file, or any src/js file. New
  files only (one recorder, one sweep copy, one analyzer,
  one sense script, see below).
- Recorders reused verbatim, policy-side only: raftdraft-diag,
  spawnsrc-diag, oldcore-diag, w5births-diag, defwound-diag,
  nonworldkill-diag, tbdmg-rebase-diag, w4damage-diag. No
  recorder draws RNG, throws into the engine, or returns
  anything but the original value.

## New instrument (this arm only, policy-side, zero src/js)

- scripts/policies/wave4demand-diag.js (new recorder,
  W4DEMAND=1 the only on-switch; unset delegates
  byte-identically: no wraps installed, no ctx surface,
  no record; wraps record AFTER delegating — fieldFight
  pre-reads are pure state reads taken before the call,
  never writes — write nothing to game state, draw no RNG,
  never throw into the engine, return the original value
  untouched). Installed FIRST at sweep setup (before the
  w4convert stack) so the nonworldkill startCombat wrap
  stays outermost and its stack-based door classification
  sees the true caller, and so w4damage's fieldFight caller
  classification sees the true caller. Install is
  idempotent (the _wave4demandDiagInstalled flag).
  It records, per fight:
  (a) FIELD fights — wrap of Game.fieldFight: pre-call
      leader vid, opts.allies count, opts.allyVids (named
      participants), opts.cornered, opts.allyFromStart,
      caller classification (same stack classifier as
      w4damage-diag: resolve / patrol / aid / sortie /
      other), worldMonster flag, monster seq/type/wave,
      monster HP start/max; per named participant (leader
      + each allyVid): armed boolean + armorP, computed
      EXACTLY the way waveCombatReadiness computes them
      (scholar: armorBonus() + equippedWeapon() non-unarmed
      or a weapon item carried in scholar inventory;
      villager: S.equipment.armorOf(vp, itemDefs),
      meleeWeaponOf/rangedWeaponOf, or a weapon item
      carried in vp.items); per participant veteran flag
      (a waveKillLog entry by that vid with w >= 3);
      village-level tricksKnown count
      (monsterCounterKnown true over state.monsterCounters)
      + monster-specific counter-known flag for this
      fight's monster type; village-level
      waveCombatReadiness(4) readout (armored/armed/
      tricks/veterans + demand + short bars) at fight
      start; post-call outcome (verbatim), rounds,
      mDealt, mHpLeft, corneredHold. Channel: 'raid' iff
      the call happens inside a havenRaidTick window (the
      wrap sets a depth counter around havenRaidTick, the
      same window technique w4damage-diag uses), else
      'field'. A fieldFight with worldMonster false and
      an expedition stack is channel 'other' (see
      "Channel split" — reported separately, never folded
      into field/raid/TB).
  (b) TB fights — wrap of Game.startCombat: pre-call
      world-origin seq (world monster on the player tile,
      read from Game.worldMonsters() by tile — NEVER
      playerMonster(), which can adopt a detached alias
      and mutate state on a refused call, per the
      nonworldkill-diag mechanism note), monster id/wave,
      world HP pre; post-call tbfight fighter snapshot
      (human side only: key, kind, villagerId, plus the
      monster fighters' ids/HPs for the start/end join);
      per human participant the same armed/armorP/veteran
      reads as (a) (scholar = fighter key 'p' = current
      villagerId; villagers = fighter villagerId, never
      inferred from key strings alone); village-level
      tricksKnown + monster-specific flag +
      waveCombatReadiness(4) readout, as in (a).
      Refused calls (a fight already live at entry:
      tbfight && !tbfight.over) are recorded as
      start-refused and push NOTHING onto the join queue.
      A startCombat throw is recorded and RETHROWN
      unchanged. Wrap of Game.tbEnd: pre-call fighter
      snapshot (keys, hp, alive, fled) + worldOrigin seq
      (same read as oldcore-diag) + result verbatim;
      joined to the oldest pending start whose monster
      id matches the end's monster fighter id; an end
      with no matching pending start is recorded as
      UNMATCHED (direct-build fight, per the
      nonworldkill-diag mechanism note) and pops nothing.
      A start still pending at run end is outcome
      'unresolved' (demand-classified, outcome missing —
      see "Classification rule").
  (c) RAID ticks — wrap of Game.havenRaidTick: pre-tick
      world-monster list (seq/type/wave/HP, live object
      references); post-tick per-object changes (same
      technique as w4damage-diag) + the in-window fight
      row indices, so a tick change with no in-window
      fight for its seq is a TOLLED-NOT-FOUGHT event.
      (Drafted-but-untolled raiders leave no trace when
      the wall is 0 — no palisade, no HP change, no fight:
      the tolled count is therefore a LOWER BOUND on
      drafted, and is labeled as such; the fought count
      is exact. Raftdraft draftedByWave counts are
      reported alongside as a cross-check, not as seqs.)
- scripts/test-wave4demand-sweep.js (copy of
  test-w4convert-sweep.js, differing ONLY in corpus dir
  (evidence/2026-10-28/perseed-wave4demand-a/), labels,
  loadGame mode label, the demand layer in the
  composition + detgate composition, and the demand store
  in the row + summary gates. The original is untouched.
  The sweep-side scholar-history capture from w4convert
  is retained verbatim.)
- scripts/test-wave4demand.js (new analyzer, proof
  validator): builds the fight-level demand table from
  the corpus rows (no re-simulation), validates rows,
  checks parity vs the partyfinish CONTROL corpus,
  cross-checks wins/deaths vs partyfinish ARMED (contrast,
  expected to differ by the driver) and vs w4convert
  (era comparison), and prints the demand-vs-outcome
  table + verdict. Exit 0 only when the judged legs
  below pass; any leg failure exits 1 with the leg named.
- scripts/test-wave4demand-sense.js (non-measured replay
  only, same say/sysSay tap pattern as
  test-w4convert-sense.js; replay text never enters any
  count, and the replay trajectory shift is stated, not
  hidden).

## Fight-level DEMAND-MET rule (BINDING — stated before any result)

Grounded in the MONSTER-WAVES readiness gates for wave 4
(3 armored P >= 10, 5 armed, 3 tricks, 1 veteran with a
wave-3+ kill). The village gates count the LIVING ROSTER;
a fight brings a SUBSET, so the fight-level translation is:

- PARTY: participant count n (field: leader + named
  allyVids, deduped; TB: 'p' + villager fighters). Solo
  iff n == 1, party iff n >= 2.
- ARMED-SHARE: armed participants / n.
- ARMORED-COUNT: participants with armorP >= 10.
- VETERAN: >= 1 participant with a wave-3+ kill in
  waveKillLog at fight start.
- TRICKS (proxy, justified): tricks are village knowledge
  by construction in waveCombatReadiness (a count over
  state.monsterCounters, not a per-fighter attribute) —
  no fight-level per-participant tricks value exists in
  state, so the fight row carries the VILLAGE tricksKnown
  count at fight start (plus the monster-specific
  counter-known flag). A fight "holds" the tricks leg iff
  village tricksKnown >= 3 at fight start. Inventing a
  per-fighter tricks split would be fabrication; the
  proxy is labeled wherever it appears.

DEMAND-MET (primary, strict): party (n >= 2) AND every
participant armed (armed-share == 1.0) AND armored-count
>= 1 AND veteran present AND village tricksKnown >= 3.
Rationale: Steve's demand is "a party, fully geared" —
a solo fight fails it no matter the gear; an unarmed
participant fails "fully geared"; the armored >= 1 floor
is the fight-level translation of the roster's 3-armored
bar (requiring 3 armored IN one fight would conflate
roster depth with fight composition — the full
armored >= 3 cut is reported as a secondary below, never
substituted for the primary); veteran + tricks are the
gate's own remaining bars, carried in at village level
for tricks (proxy above) and participant level for
veterans.

SECONDARY CUTS (pre-registered, published alongside,
never substituted for the primary):
- PARTY-ONLY: n >= 2 (is it even a party?).
- GEARED-PARTY: n >= 2 AND armed-share == 1.0 AND
  armored-count >= 1 (the gear legs without veteran/tricks).
- FULL-GATE-IN-FIGHT: n >= 2 AND armed-share == 1.0 AND
  armored-count >= 3 AND veteran present AND tricksKnown
  >= 3 (the roster gate read literally inside one fight).
Each leg's pass rate is ALSO reported separately (party
rate, full-arming rate, armored >= 1 rate, veteran rate,
tricks >= 3 rate), so a reader can see which leg binds
without re-scoring the primary.

## Channel split (BINDING)

- field: fieldFight rows with channel 'field' (not inside
  a raid tick, worldMonster true).
- raid: fieldFight rows with channel 'raid' (inside a
  havenRaidTick window, worldMonster true) — the fought
  side of the raid channel. The tolled side is reported
  separately: raidTick change rows (wave 4) with no
  in-window fight for their seq = TOLLED-NOT-FOUGHT
  events (lower bound on drafted, see instrument note).
- TB: startCombat/tbEnd joins with a world origin (tile
  seq present and matching the argued monster).
- TB-nonworld: TB joins whose origin is null or whose
  tile seq mismatches the argued monster (the w4convert
  non-world class) — demand rows published in their own
  section, never folded into the world TB counts.
- other: fieldFight rows with worldMonster false on an
  expedition stack (the w4convert expedition-leg class) —
  demand rows published in their own section, never
  folded into field/raid/TB.
- A fight row whose monster wave != 4 is NOT in the
  demand table at all (it is counted in the recorder's
  wave histogram, so the filter is auditable, never
  silent).

## Classification rule for missing participant data (BINDING)

A wave-4 fight row is DEMAND-CLASSIFIED iff every named
participant has a non-null armed boolean AND a non-null
armorP (scholar reads always available; a villager
participant whose vpOf returns null, or whose equipment
API is unavailable, yields nulls). Otherwise the row is
UNCLASSIFIED: it is reported in the UNCLASSIFIED bucket
per channel with its count, its seed/day/seq, and the
missing field named — never silently dropped, never
assumed armed/armored, never folded into the meet rates.
A TB start with no fighter snapshot is UNCLASSIFIED. A
TB start with a fighter snapshot but no matching end at
run end is DEMAND-CLASSIFIED with outcome 'unresolved'
(the demand state is known; only the outcome is missing)
and counts in the outcome table's 'unresolved' column,
never dropped. A raid tolled-not-fought event has no
participants by construction and is NOT a fight row: it
is counted in the raid-toll section, never in the fight
demand table, and never counted as UNCLASSIFIED.

## Pre-registered primary metric and GO rule (BINDING, MEASUREMENT.md §14)

PRIMARY: census completeness of the wave-4 demand table on
the current base.

GO RULE (DIAG-GO, judged ONLY against this prereg):
  DIAG-GO iff (a) census complete 8/8 seeds (row per seed,
  days > 0, every recorder clean: errs 0, no overflow) AND
  (b) every wave-4 fight demand-classified OR explicitly
  UNCLASSIFIED with a count (no silently dropped fights:
  the analyzer reconciles recorder fight-row counts
  against the demand table + UNCLASSIFIED bucket +
  non-world/other sections, and any unreconciled row
  fails the leg) AND (c) the demand-meet share per channel
  (primary rule + all three secondary cuts + each leg's
  pass rate) published AND (d) the demand-met vs not-met
  outcome table published (outcomes: vKill / vDie / vFlee /
  mFlee / evade for field+raid; won / lost / routed / fled /
  unresolved for TB; tolled-not-fought counts alongside
  the raid rows).
  This is measurement, not a lever: NO outcome threshold
  gates GO. A demand-meet share of 0% is a GO census with
  a 0%-demand finding, not a failure. Incompleteness or
  silently dropped fights FAIL GO. A kill-rate or win-rate
  disappointment is never re-scored as a census failure.
  No confirm band unless a census gap needs a re-proved
  instrument — then the confirm band is pre-registered
  BEFORE running it (seeds, horizon, GO threshold), never
  run first and justified after.

DETGATE (pre-sweep STOP gate): seed 75101, baseline (plain
tableseat-nowait, no recorders) vs wrapped (ALL recorders
composed, every on-switch UNSET, including W4DEMAND):
days, gameDays, and tsNationalDay must be equal, with no
diag ctx surface and no wraps installed. Expected numbers
from the partyfinish detgate on this code: 132/132 days,
tsNationalDay 77. If base drift moved those numbers on
the CURRENT base, DO NOT force the old numbers: prove
same-base neutrality the way sim-waitlong-a did — run
the PRIOR instrument stack (the w4convert stack,
recorders-OFF) on this base and show it diverges
identically (same new numbers) — and disclose the
amendment loudly in the evidence file (old numbers, new
numbers, prior-stack check result). Detgate PASS on this
base's own numbers, with the amendment disclosed, is a
PASS; detgate FAIL (baseline != recorders-OFF on this
base) is a STOP. If the detgate differs from 132/132/77,
STOP and report the divergence before judging any sweep
— do not judge a diverged corpus.

PARITY RULE (binding, do not soften): judge parity ONLY
against the partyfinish CONTROL corpus (the exact-code,
exact-policy partner above). Per-seed days, gameDays,
won, waveReach, nationalEver/Final, table, entered,
deathTotal, AND wave-4 defwound rows by context,
wave-4 nonworldkill starts, and wave-4 spawn seq sets
must match, or the divergence must be diagnosed with a
detgate PASS proving recorder neutrality (base drift is
then the diagnosis, stated with the per-seed diffs —
never hidden, never re-scored against a retired corpus).
NEVER re-score the w4convert, lethality, or partyfinish
verdicts. The w4convert band is reported as an ERA
COMPARISON (same policy, earlier code) with its
divergence explained by the intervening src changes
listed under "Base", not as a parity gate.

CROSS-CHECK RULE (binding): wins/deaths are cross-checked
against the partyfinish corpus on identical seeds BEFORE
judging: vs CONTROL, expected EXACT (any diff is
investigated before judging — it would mean recorder
non-neutrality or a base difference, since code and
policy are identical); vs ARMED, expected to DIFFER
(the sortie driver policy changes trajectories — report
the armed-vs-mine table with the driver explanation, never
as a parity failure). A cross-check disagreement that
fits NEITHER explanation (not exact-vs-control, not
driver-explained-vs-armed) is a STOP: investigate before
judging.

SUBSTRATE-ACTIVATION GATE (binding, same as both
predecessors): band courtship combined > 0 AND >= 6/8
seeds with non-zero combined courtship. If the gate
FAILS, the sweep is INVALID (not NO-GO): no verdict is
judged, the failure is reported loudly, and the run stops
for an env fix. Expected from the partyfinish control
band: combined 121, 8/8 active (the w4damage band's
number; verify against the control corpus at analysis
time and report any difference).

SENSE RULE (binding): sense seed = the seed with the most
wave-4 fight rows on THIS band's corpus (tie -> lowest
seed) — a deterministic rule, not a narrative pick.
Window = that seed's first wave-4 fight day minus 10 to
last wave-4 fight day plus 10, from THIS band's corpus,
capped at the seed's actual end day. The sense note reads
ONE demand-classified wave-4 fight from that window (the
window's first, in corpus order) in plain words: what
the village actually did, what each participant brought,
and whether the participants act like people (goals,
reactions, retreat judgment) or robotic — plus the
deliverable judgment in plain words: do the fights look
like the demanded party+geared undertaking, or like
solo/under-equipped play? Non-measured narration replay
(say/sysSay taps); replay text never enters any count,
and the replay trajectory shift is stated, not hidden.

PILOT GATE (MEASUREMENT.md §§9-12): the 8-seed band IS
the pilot for a census (seeds 75101-75108, horizon 180d
DEATH-AWARE: runDays stops on death/win; 180 is the cap,
not a fixed horizon — reachability question, §10's
150-200d guide). If its completeness gates pass, it is
the judged band. If parity fails, that is a diagnosis to
report (see PARITY RULE), not a reason to re-sweep fresh
seeds silently. If the gap is a pure instrument bug that
can be fixed and re-proved, the fix, the re-proof, and
the re-sweep are all disclosed, and the original failed
pilot rows are kept, never overwritten silently.

## Balanced panel (§15) and telemetry

BALANCED PANEL: attempt scripts/balance-panel.js compare
and record the outcome. The known scorecard TypeError
failure mode is documented in prior arms — if it fails
the same way, say so and use the paired sweep-compare
tables (this band vs the partyfinish control corpus,
identical seeds/policy/code) as the section-15 substitute.
No panel artifact will be faked. Note: this arm changes
nothing in the game, so the panel is expected to show
zero movement; a non-zero panel delta would itself be a
parity failure to investigate.

TELEMETRY DEVIATION CHECK (loop body step 10, coordinator
step — corpus path supplied for it):
evidence/2026-10-28/perseed-wave4demand-a/*.json, metrics
national,table,wins,exiled, baseline
.../telemetry-baselines/scale-wall.json. The evidence
file reports the corpus path; the coordinator runs the
check and judges LOUD lines (the baseline's WINSEAT
regime forbids comparing it to a tableseat-nowait census
substrate, and per-seed rows carry nationalEver/entered/
won, not top-level national/table/wins paths — the same
two artifact classes as the w4convert arm).

## Metric review (to be filled at judging time, not before)

- (pending at pre-registration; doubts arising during the run go
  here, and any revision applies to the NEXT run, never this one.)
