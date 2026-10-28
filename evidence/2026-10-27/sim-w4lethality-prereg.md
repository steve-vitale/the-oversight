# sim-w4lethality — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: fleshout loop, run fleshout-20261027T1926Z. Axis: scale-onramp
(the blocking axis). Worker: sim-w4lethality.
Worktree: `~/workspace/worktrees/sim-w4lethality` (branch sim-w4lethality).
DIAG / MEASUREMENT ONLY — zero src/js changes, zero default flips, no
game lever, no game-lever proposal. The deliverable is knowledge: a
wave-4 LETHALITY census — per wave-4 fight, damage dealt, rounds,
monster HP left, fighter HP left, by channel — answering the named
next arm from evidence/2026-10-27/sim-scale-onramp-round-2357.md
(the paired verdict: 0 wave-4 kills with the scholar fighting vs 0
with the scholar abstaining; the binding step is fight lethality,
not the scholar's presence) and the sim-findings backlog item
"wave-4 lethality census". This arm measures the damage gap; it does
NOT propose a lever, a meeting-rate change, or a damage change.

## Canon read first

- docs/CANON.md, then docs/MONSTER-WAVES.md (wave law; wave 4 = the
  Mirror Draft; bands anchored: damage 35-95, HP 850-1500, pierce
  0.2-0.5; "a 4-6 round fight for a godhood build (~220 dmg/round)";
  the Suburb's fiction: "you don't kill it, you ESCAPE it" — a
  fight whose fiction says escape is a live caveat on any
  damage-gap reading, reported, never smoothed over).
- docs/MEASUREMENT.md sections 9-12 and 14-15 (pilot gate,
  death-aware horizons, pre-registration, convergence, metric
  binding, balanced panels).
- No canon invented. Where code and canon wording differ, the code
  reading below governs the census and the difference is reported.

## Prior evidence read first (this arm's question comes from these)

- evidence/2026-10-27/sim-scale-onramp-round-2357.md (paired
  verdict 0 vs 0; named next arm: this census; metric-review
  notes carried: sense windows on the seed's wave-4 window, not
  the horizon tail; "melted" must be annotated wherever reported
  — it reads like a player kill and is not one).
- evidence/2026-10-27/sim-w4channel-a.md + sim-w4channel-a-prereg.md
  (channel census: 11 arrivals, 24 fights by channel, 0 kills;
  substrate VERBATIM below; recorder stack and outcome/channel
  vocabulary reused where they fit).
- evidence/2026-10-27/sim-w4abstain-a.md + prereg (paired
  abstention band; field-fight damage values quoted there come
  from defwound rows — see Freshness, below).

## Band freshness — disclosed, not assumed (verified by grep BEFORE sweeping)

- Judged band: seeds 75101-75108, as assigned. Substrate, policy,
  horizon, and seeds are IDENTICAL to the w4channel band, so this
  census's fight set is expected to reproduce the channel band's
  fight set exactly (parity leg (c) tests that, it does not
  assume it).
- Filename/content grep over evidence/2026-10-27/ BEFORE sweeping:
  no file mentions "w4lethality" or "tbdmg"; no .md outside the
  channel/abstain/2357 family mentions seeds 75101-75108 at all.
  The judged quantities — per-fight damage for TURN-BASED wave-4
  fights, the single-fight damage distribution vs monster max HP,
  the closest-loss gap, the >50% answer — do NOT exist for this
  band anywhere in committed evidence, and are FRESH. Proof:
  the channel corpus's tbEnd rows carry no HP (oldcore tbEnds:
  day/result/seq/type/wave/kind/restored only; nonworldkill ends:
  day/fightId/result/log-delta only), and its analysis.json
  carries no TB damage table.
- DISCLOSED PARTIAL EXCEPTION, not hidden: FIELD-fight damage
  rows DO exist in the channel corpus (defwound resolveFights
  carry mDealt/mHpLeft/mHpMax/rounds, and the channel/abstain
  evidence quotes some of them). This census therefore does NOT
  claim field-fight damage is newly measured from nothing: it
  re-records every field fight IN-BAND (its own corpus, its own
  rows, never imported from the channel corpus) and cross-checks
  the re-recorded field rows against the channel corpus under
  leg (c). The fresh, judged quantities are the TB-fight damage
  records, the unified per-fight table, the distribution, the
  closest-loss gap, and the >50% answer. If leg (c) parity
  FAILS (trajectories diverge), the field rows in this corpus
  are still this band's own measurement, and the divergence is
  reported with cause — never silently absorbed, never re-swept
  on fresh seeds.

## Substrate and pairing (VERBATIM reuse, zero edits)

- Single arm, DIAG: scripts/policies/tableseat-nowait.js VERBATIM
  (LEANLINKRESCUE=1, TABLESEATNOWAIT=1, TABLEDEFIANT unset — the
  w4channel band's exact env set) PLUS recorder on-switches only.
- NEVER edited: tableseat-nowait.js, leanlinkrescue.js, any
  existing recorder file, or any src/js file. New instruments
  only: scripts/policies/tbdmg-diag.js (the one new recorder,
  see below), scripts/test-w4lethality-sweep.js (census sweep,
  the w4channel sweep copied with the new recorder composed),
  scripts/test-w4lethality.js (proof validator / analyzer),
  scripts/test-w4lethality-sense.js (non-measured sense replay,
  windowed on the seed's wave-4 window).
- Recorders reused verbatim, policy-side only, never edited:
  raftdraft-diag (RAFTDRAFT=1), spawnsrc-diag (SPAWNSRC=1),
  oldcore-diag (OLDCORE=1), w5births-diag (W5BIRTHS=1),
  defwound-diag (DEFWOUND=1), nonworldkill-diag (NONWORLDKILL=1).
  No recorder draws RNG, throws into the engine, or returns
  anything but the original value.

## The one new recorder: tbdmg-diag (why it exists, what it proves)

The w4channel stack cannot answer this arm's question: it records
field-fight damage (defwound) but NO turn-based damage at all.
TB fights are the band's dominant wave-4 channel (13/24 fights,
all lost, in the channel census), so a lethality census built
only on defwound would measure the minority channel and miss
the question. tbdmg-diag closes exactly that gap, as a read-only
observer in the same class as the existing recorders:

- TB end record: wraps tbEnd; BEFORE delegating, reads
  Game.tbfight (fightId, round, fighters with key/kind/
  monsterId/villagerId/hp/maxHp/alive/fled) into the store only.
  It writes nothing to game state, draws no RNG, throws nothing
  into the engine, and returns the original value untouched.
  Installed LAST (outermost tbEnd reader among the recorders,
  but every recorder's pre-record sees the intact tbfight —
  none of them mutates it before delegating).
- Field supplement record: wraps resolveWildMonsterEncounter;
  AFTER delegating, records the engine's own return record
  (outcome, rounds, mDealt, vTaken, mHpLeft, vHpLeft) keyed by
  day/vid/seq/mid, so field fights gain the fighter HP left
  (vHpLeft) that defwound does not carry. Same observational
  discipline: store only, no RNG, no state writes.
- On-switch: TBDMG=1 only. Unset, it delegates byte-identically
  (no wraps installed, no ctx surface, no record) — the detgate
  below proves that shape, exactly as prior arms did.
- Damage derivation (analyzer, never the recorder): for a TB
  fight, damage dealt = start monster fighter HP (nonworldkill
  start fighters, post-start) minus end monster fighter HP
  (tbdmg tbEnd pre-record). Monster max HP = start fighter
  maxHp. Fighter HP left = end player fighter HP (plus ally
  fighters if present). Rounds = tbfight.round at tbEnd pre.
  For a field fight, damage dealt = defwound mDealt, monster HP
  left = defwound mHpLeft, max HP = defwound mHpMax, fighter HP
  left = tbdmg field-supplement vHpLeft, rounds = defwound
  rounds. A fight with no joinable end record is INCOMPLETE,
  counted in leg (b), never estimated or filled from another
  corpus.

## Definitions (fixed BEFORE sweeping — the analyzer repeats them)

- FIGHT (this census's unit): one deduplicated wave-4 fight
  event, exactly the w4channel fight-event vocabulary: a TB
  fight = one nonworldkill initiation (start row, not excluded
  by classifyStart: table-trial / refused / thrown excluded)
  joined to its tbdmg tbEnd row by fightId; a field fight = one
  defwound resolve row with wave 4. Evades (defwound rounds 0,
  damage 0) are fights in the w4channel count and are kept in
  this census's fight total, flagged `evade`, and EXCLUDED from
  the closest-loss ranking (a 0-damage evade is not a loss
  that almost killed — ranking it would name "the closest
  loss" as a fight in which nobody swung).
- CHANNEL (w4channel vocabulary, same precedence): trap >
  contest-arena-door (non-world) > non-world-TB (null-origin) >
  player-tb-world (world-origin TB) > raid-defender >
  villager-field > other. TB channel derivation: origin
  world-origin => player-tb-world; origin null-origin =>
  non-world-TB (door glasswing-trap => trap); door
  contest-arena with a mismatch origin => contest; any other
  mismatch origin => other. Field channel: defwound context
  field => villager-field; context raid => raid-defender.
  World-origin-only seq-linkage (the w4channel analyzer
  correction): a mismatch TB fight NEVER seq-links its tile
  bystander, and its damage is attributed to the FOUGHT
  monster (nwk start mid), never to the bystander.
- MONSTER IDENTITY: nwk start mid (TB) / defwound mid (field);
  max HP from the start record (TB: start fighter maxHp; field:
  defwound mHpMax). A TB fight whose start fighters are missing
  (no monster fighter) is incomplete, not assigned a max HP by
  lookup in the monster defs — defs give ranges (e.g. suburb
  1300-1500), not the instance's HP, and a range is not a
  measurement.
- MELTED (annotation, per the 2357Z metric-review note): a
  monster that dissolves after a lost TB fight against a
  non-lingering, non-titan monster (oldcore kind
  player-fight-melt) is NOT a kill: no kill-log entry, no
  killer, no damage threshold crossed. Every melted outcome in
  this census is annotated "melted (lost-fight dissolution,
  not a kill)" wherever it is reported.
- CLOSEST LOSS: among non-kill, non-evade wave-4 fights, the
  fight with the smallest monster HP left at fight end, reported
  BOTH as absolute HP left and as percent of that monster's max
  HP, with its damage dealt, rounds, channel, monster identity,
  seed, and day. Ties: smallest percent-of-max, then lowest
  seed, then earliest day. The "gap" is stated in plain words:
  how many HP the monster still had, and what share of its
  total that was.
- >50% QUESTION: did any single wave-4 fight deal damage
  strictly greater than 50% of that fight's monster's max HP?
  Answered with counts (fights over 50% / fights total, by
  channel), never with an average alone. The same question is
  also answered on the start-HP basis (damage / monster HP at
  fight start) as a secondary column, because a previously
  wounded monster can show >50% of start HP while far from
  50% of max — the max-HP basis is the judged one.
- WALL NUMBERS (every run reports these, from THIS band only,
  never pooled with channel/abstain): national ever/final,
  table invited (tableWaiting ever) / entered (tableDone ever),
  wins (lesser/full split via tableState.seat), wave-4 unlock,
  wave-5 unlocks, median survival (days; convention labelled —
  the analyzer reports BOTH the upper median and the
  conventional median, after the abstain metric-review note),
  death-cause shares.

## Pre-registered primary metric (BINDING, MEASUREMENT.md §14)

PRIMARY: the wave-4 lethality census on this band.

GO RULE (DIAG, judged ONLY against this prereg):
  (a) 8/8 configs valid (row per seed, days > 0, every gate +
      deed + damage field present, recorder errors 0 on all
      seven recorders, no overflow);
  (b) 100% of wave-4 fights on the band have a complete damage
      record (TB: joined start + tbdmg end with monster
      fighter HP at both ends; field: defwound row + tbdmg
      field supplement OR a stated defwound-only completeness
      rule — see below);
  (c) fight-count parity vs the w4channel band explained (same
      seeds/policy/substrate: per-seed days/wins/wave/national/
      table/courtship AND wave-4 fight counts by channel, with
      every divergence stated with cause, never silently
      absorbed);
  (d) single-fight damage distribution vs monster max HP
      computed (per fight: damage, max HP, % of max, HP left,
      % left; band distribution: max, median, and the full
      sorted % list), and the closest-loss gap NAMED in plain
      words;
  (e) the >50% question answered with counts (by channel);
  (f) SENSE: one seed's wave-4 fight thread read in plain
      words, windowed on that seed's wave-4 window (first
      wave-4 arrival day minus 10 to last wave-4 fight day
      plus 10, from THIS band's corpus — not the horizon
      tail), with "melted" annotated wherever reported.
  Any leg missing = DIAG-NO-GO. No re-scoring mid-run; metric
  doubts go under a mandatory "metric review" section, and any
  revision applies to the NEXT run, never this one.

FIELD-COMPLETENESS RULE (fixed here, so leg (b) is not
re-scored later): a field fight is complete if its defwound row
carries mDealt + mHpLeft + mHpMax + rounds (the damage record
itself). The tbdmg field supplement (vHpLeft) is a fighter-side
enrichment: if a field fight lacks a supplement join, the fight
still counts complete for damage, and the missing vHpLeft is
reported as a supplement-gap count (not a leg-(b) failure),
with the reason investigated. Rationale: the judged question
is monster damage; fighter HP left for field fights is a
secondary column, and the prereg must not let a supplement
join gap veto a complete damage census. TB fights have no
such fallback: no tbdmg end join = incomplete, leg (b) fails.

PILOT GATE (MEASUREMENT.md §§9-12): the 8-seed band IS the
pilot. If its completeness gates pass, it is the judged band
(this census measures a specific band's fights, not a sample
for a confirm). If the pilot shows recorder gaps or fight-count
parity failure vs the channel band, that is a NO-GO diagnosis,
not a reason to re-sweep fresh seeds silently — report it and
stop for coordinator direction, unless the gap is a pure
instrument bug that can be fixed and re-proved (in which case
the fix, the re-proof, and the re-sweep are all disclosed, and
the original failed pilot rows are kept, never overwritten
silently).

DETGATE (pre-sweep STOP gate, as prior arms did): seed 75101,
baseline (plain tableseat-nowait, no recorders) vs wrapped
(all seven recorders composed but every on-switch UNSET):
days, gameDays, and the ts* counters must be equal, with no
diag ctx surface and no wraps installed. A detgate FAIL stops
the run before any judged sweep.

SUBSTRATE-ACTIVATION GATE (rule3trial lesson, binding, same
as w4channel): band courtship combined > 0 AND >= 6/8 seeds
with non-zero combined courtship. If the gate FAILS, the sweep
is INVALID (not NO-GO): no verdict is judged, the failure is
reported loudly, and the run stops for an env fix.

SENSE SEED RULE (fixed here): the seed with the closest-loss
fight (leg (d) winner); ties by most wave-4 fights, then
lowest seed. Non-measured narration replay (say/sysSay taps,
windowed as above) read for whether the wave-4 fight thread
reads as people meeting monsters with consequences. Replay
text never enters any count, and the replay trajectory shift
is stated, not hidden.

BALANCED PANEL (§15): scripts/balance-panel.js has NO
corpus-ingest mode (standing census-family exception, sixth+
round — verified again for this arm: the tool builds panels
from live roots, not census rows). No panel artifact will be
faked; the sweep tables + analyzer outputs are the comparison
of record, and this exception is stated in the evidence file.

TELEMETRY DEVIATION CHECK (loop body step 10): run AFTER
writing evidence (telemetry-check.js vs scale-wall baseline,
metrics national,table,wins,exiled, current glob
evidence/2026-10-27/perseed-w4lethality/*.json), report LOUD
lines with verdict, do NOT roll the baseline (the baseline's
WINSEAT regime forbids comparing it to a tableseat-nowait
census substrate, and per-seed rows carry nationalEver/
entered/won, not top-level national/table/wins paths — say
which artifact class applies, or investigate if a line fits
neither).

## Metric review (to be filled at judging time, not before)

- (pending at pre-registration; doubts arising during the run go
  here, and any revision applies to the NEXT run, never this one.)
