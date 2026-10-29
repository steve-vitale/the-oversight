# sim-w5counts-a — PRE-REGISTRATION (binding, written BEFORE any judged analysis leg)

Run: fleshout-20261029T2115Z (coordinator run). Arm: sim-w5counts-a —
DIAG/INSTRUMENTATION ONLY, follow-up to sim-w5ready-a (backlog #1453,
claimed by this run). Axis: scale-onramp (blocking axis, converging,
NOT converged).
Worktree: `~/workspace/worktrees/sim-w5counts-a` (branch sim-w5counts-a).
Base: master at worktree cut (record the base commit in the evidence
file; note any move during the run).
Corpus: NEW, written by this arm — evidence/2026-10-29/
perseed-w5counts-a/ (16 rows: seeds 76001–76008 × OFF substrate / ON
fullseat-pursuit), 180d death-aware horizon (runDays stops on
village-lost / win; dead villages stop simulating, +10d tail max per
the harness). The w5ready corpus (perseed-fullseat-a) is NOT re-used
as the judged corpus: it records rd5short NAMES only, and exact
counts cannot be recovered from end state after the fact. The new
corpus is run on the SAME seeds/policies so counts stay comparable
to w5ready's bar-level table.

## Canon read first

- docs/CANON.md, docs/MONSTER-WAVES.md (§ Wave 5: standing ≥ 200 AND
  wave-4 faced; readiness-gate section with the demand table:
  wave 5 = armored 4 at armorP ≥ 15, armed 6, tricks 3, veterans 2
  killed wave-4+), docs/TABLE.md, docs/PROGRESSION.md.
- Two veteran concepts, kept SEPARATE throughout (conflating them
  is an error):
  - MONSTER veterans: hardened older-wave monsters (game.js
    castMonster/spawn path: veteran flag, +50% HP, +3 damage,
    +1 speed, scarred/elder/pack-leader variants). A hardened
    monster's kill logs its BASE wave in state.waveKillLog
    (`w: wave` from the monster def) — so killing a hardened
    wave-3 monster counts as a wave-3 kill, never toward the
    villagers bar, and never as a later wave.
  - LIVING-VILLAGER veterans bar: distinct LIVING roster members
    with a recorded kill of a wave-(w-1)+ monster in
    state.waveKillLog (src/js/standing.js waveCombatReadiness:
    `e.w >= w-1`, `isLiving(e.by)`; dead killers do NOT count
    under default behavior — VETSHAPE=1 is an instrument that
    counts living-or-dead and is OFF by default, not the game).
- #1223 (MEASURE ONLY — Steve call required before any move;
  NOTHING changed here): the deed gate's stage bar is ≥ 2 in
  code vs ≥ 3 in some docs. NOT chased in this arm.
- THIS ARM IS MEASUREMENT ONLY: zero src/js changes, zero
  default flips, zero deed-bar moves, zero pursuit-variant
  design. The ON arm is the EXISTING fullseat-pursuit policy
  (restored from git history for the sweep run only, then
  deleted again per the NO-GO rule — it is NOT committed by
  this arm, exactly as the fullseat pilot did).

## Instrument (new, policy-side only)

- scripts/policies/w5counts-diag.js — pure-read recorder layer
  (W5COUNTS=1; unset delegates byte-identically). After the
  inner daily runs, it snapshots, per game day (DAILY cadence
  — one snapshot per policy.daily call, after the inner
  daily, before sleep rolls the day):
  - the four readiness counts from the engine's OWN gate,
    Game.waveUnlockReady(5): armored, armed, tricks, veterans,
    plus demand + short list (the gate is authoritative; the
    recorder never re-implements the bars);
  - tricks identities: the distinct monster ids passing
    monsterCounterKnown() (re-read from state.monsterCounters
    with the same convention the gate uses);
  - killer identities: EVERY distinct waveKillLog killer with
    a wave-4+ kill, grouped by killer vid: {by, name-if-known,
    living, kills, waves, mids, firstDay, lastDay}. Living
    mirrors standing.js isLiving EXACTLY: the scholar id
    (Game.villagerId) counts living; otherwise vpOf(vid) and
    not vp.dead (vp null → not living). Dead killers are
    recorded too, with living=false, so living-vs-dead is
    checkable from the row alone. The gate's veterans count
    MUST equal the living-killers count on every snapshot
    (integrity check, see GO leg 3).
  - standing per snapshot: raw total, war/diplomacy/plenty
    split (Game.villageStanding()), plenty-capped total,
    gated total (Game.villageStandingTotal()), peak wave
    (state._standingPeakWave), holdKind (see below),
    unlockedWave, w4faced (Game.waveEngaged(4) > 0), day,
    w2points, w2bar (waveLedgerCfg barsPerWave[2] when
    available — the w3 rung is day ≥ 25 AND w2points ≥ w2bar;
    the code default bar[2] is 5, NOT the 4 in some docs;
    the analyzer reports day + w2points + w2bar and derives
    the rung from those, never from a hardcoded 4 or 5).
- HoldKind classification (pre-registered, derived from
  standing.js villageStandingTotal layering: holds bind at
  t5−1/t4−1; the ratchet floors at t4/t5 once released):
  - 'defer5': capped ≥ 200 AND rd5 not ready AND peak < 5
    (gated pins at 199 by construction).
  - 'cap': raw ≥ 200 AND capped < 200 AND peak < 5
    (bread capped; gated pins at 199).
  - 'defer4': raw ≥ 100 AND rd4 not ready AND peak < 4
    (gated pins at 99; the tightest bound wins, so a row
    with both defer4 and defer5 active reports defer4).
  - 'peak-ratchet floor': gated > raw (the floor lifted the
    total above the live raw — e.g. raw 95, gated 100).
  - 'released': gated ≥ 200 with rd5 ready (or peak ≥ 5 with
    gated ≥ 200 and no hold binding).
  - 'below-bar' (plain shortfall): none of the above and
    gated < 200.
  Priority: the tightest binding hold wins; else floor;
  else released/below-bar. The analyzer cross-checks this
  against the fullseat-diag holdKind with the mapping:
  my defer5 ⟺ fullseat defer5; my cap ⟺ fullseat cap; my
  defer4 / floor / below-bar ⟺ fullseat below-bar (the
  fullseat recorder does not distinguish those three);
  my released ⟺ fullseat released. Any other mismatch
  fails the cross-check leg.
- The sweep driver (scripts/test-w5counts-a.js) ALSO takes a
  FINAL snapshot after runDays returns (snapW5counts(Game),
  same function the recorder uses) and stores it as
  w5counts.end. The daily trace's last snapshot is pre-sleep
  state; the final snapshot is post-run state. Judged END =
  the final snapshot; judged MAX = max over the daily trace
  AND the final snapshot. A final snapshot exceeding the
  daily max is a cadence note (reported, with count of rows),
  NOT a failure — the daily cadence is stated here, and the
  final snap exists precisely because the last day's
  post-daily events are outside the daily cadence.
- Neutrality proof (REQUIRED before the sweep, gate G0):
  scripts/test-w5counts-a.js --detgate runs one OFF seed
  bare vs +w5counts-recorder and requires days, gameDays,
  starvation deaths, and final samples (pop/pantry/
  knowledge) identical. If G0 fails, the sweep does NOT run
  and the run reports NO-GO with the mismatch. (The recorder
  calls villageStandingTotal(), whose release/hold beats
  are engine-own bookkeeping the engine also triggers
  through unlockedWave() during play; G0 is the empirical
  test that the extra daily call moves nothing.)

## Staged method (docs/MEASUREMENT.md §§9–12, 14–15)

- PILOT: this band IS the pilot — 8 seeds × 2 arms, 16 rows.
  No confirm spend beyond it; there is no second sweep in
  this arm. A second round would be a new arm with its own
  prereg.
- DEATH-AWARE HORIZON: 180d cap, runDays endReason
  (village-lost / win / day-cap) recorded per row; never a
  fixed 200d. Horizon reason: the fullseat band ran 180d and
  produced the w5ready table this arm extends; re-using
  180d keeps counts comparable to that table.
- PRE-REGISTERED here: primary metric, GO threshold, horizon,
  seeds, policies (below). Judge the run against this file.
- METRIC BINDING (§14): a miss is NO-GO, never re-scored
  against a friendlier metric mid-run. If the metric proves
  wrong, write it under "metric review" in the evidence file
  and propose the revision for the NEXT run.
- BALANCED PANEL (§15): NOT APPLICABLE as a judged
  comparison — this is a DIAG instrument arm on a fixed
  band, not a before/after lever comparison. OFF vs ON is
  reported descriptively (did pursuit move the counts?)
  and is NOT judged as a lever win/loss. No panel compare
  is attempted, and none is claimed.

## Policies (exact pairing, identical seeds)

- OFF = scripts/policies/tableseat-nowait.js
  (LEANLINKRESCUE=1, TABLESEATNOWAIT=1) wrapped with
  scripts/policies/fullseat-diag.js (FULLSEAT=1) AND
  scripts/policies/w5counts-diag.js (W5COUNTS=1).
- ON = scripts/policies/fullseat-pursuit.js
  (LEANLINKRESCUE=1, FULLSEATPURSUIT=1; restored from git
  history commit 5a9f7579e for the sweep run ONLY, then
  deleted before the final commit) wrapped with the same
  two recorders. Fight behavior identical both arms
  (competent.fight; neither policy defines a fight hook).
  Contests harness-driven (choice 0) identically both arms.

## Primary metric + GO threshold (judged exactly as written)

PRIMARY METRIC: exact wave-5 readiness counts + standing
peak splits, recomputed by the analyzer from the new corpus
(never hand-copied summaries), for all 16 rows.

GO iff ALL of:
1. Counts present: 16/16 rows have w5counts.end with all
   four counts as INTEGERS (armored, armed, tricks,
   veterans) plus demand + short list, and a non-empty
   daily trace. Zero intervals remaining anywhere in the
   analysis output — no bar is reported as [lo,hi].
2. Peak splits measured: 16/16 rows have peakStanding
   {gated, day, war, diplomacy, plenty, raw, capped,
   holdKind}; and every gated-shortfall row (peak gated
   < 200) has its peak split measured (this is the same
   16/16 set unless a row unlocks wave 5, in which case
   the unlock is reported and the row still counts as
   measured).
3. Killer identities checkable: 16/16 rows have an end
   killers list with a living flag per killer; gate
   veterans == living-killers count at END on 16/16 rows;
   and the same equality holds on 100% of daily snapshots
   (any daily mismatch fails this leg — the recorder
   mirrors the gate's living rule exactly, so a mismatch
   means the recorder drifted from the gate).
4. Analyzer recomputation: max counts per bar, peak
   standing (+ split), days-ready statistics, and
   first-met days are recomputed from the daily trace (+
   final snap for END); recomputed trace-max == recorder
   max on 16/16 rows. Recomputed values are what the
   evidence file quotes.
5. Cross-checks vs the fullseat unlock block pass on
   16/16 rows: end gated == endSnapFull.unlock.standing;
   end raw/war/diplomacy/plenty/capped == unlock
   raw/war/diplomacy/plenty/capped; end holdKind matches
   unlock.holdKind under the mapping above; end rd5short
   == unlock.rd5short. Any mismatch fails this leg.
6. Demand citation verified: the analyzer reads
   readyDemand[5] out of src/js/standing.js itself and
   requires armored 4 / armorP 15 / armed 6 / tricks 3 /
   veterans 2 (the MONSTER-WAVES.md table); a mismatch
   fails the run (citation broken or demand moved).
Otherwise NO-GO (or INSUFFICIENT-DATA if the corpus itself
is incomplete/unreadable — e.g. fewer than 16 rows, or a
row missing its trace/end block).

## Secondary measurements (reported, not judged)

- Per bar, per arm: end count distribution, max count
  distribution, days the bar was met, first-met day,
  end-vs-max gap (how much of the peak survived to end —
  the mortality/selection question w5ready raised).
- Stack statistics: days rd5ready true; days all bars
  except veterans met; max simultaneous bars met; days
  gated ≥ 200 (capped) vs gated == 199 (defer5) vs floor.
- Standing peak attribution: peak split per row + which
  component fell from peak to end (war/diplomacy/plenty
  deltas, end split vs peak split).
- OFF→ON descriptive comparison: did pursuit move counts
  (end and max) vs the w5ready bar-level table? Quoted
  with the w5ready table alongside, never as a lever
  verdict.
- Reachability (descriptive): waveReach, nationalEver/
  Final, table/entered, wins per arm — the wall numbers.
- Sense read: one ON seed narration replay (non-measured,
  same pattern as the fullseat sense replay) with the tail
  read for whether the counted wall is voiced (hold beats
  naming short bars on defer5 rows; silence on below-bar
  rows) and whether villagers still read like people.
  Method limit stated in the evidence file (tail window
  only; narration shifts trajectories, so the replay never
  enters the census).

## Ranked next step (fixed)

This arm designs NO pursuit variant. Its output is the
count table + peak splits the NEXT arm needs to design a
stack pursuit variant (spread wave-4 killing blows across
≥ 2 villagers AND keep both killers alive AND hold gear
counts AND hold standing simultaneously) instead of
guessing from intervals. If GO fails on a data-integrity
leg (3/4/5/6), the next step is a recorder fix + re-run,
not a pursuit variant.

## Hard constraints (restated, binding)

- ZERO default flips. ZERO deed-bar moves. Do NOT chase
  #1223. Do NOT move any deed bar.
- Prefer ZERO src/js changes — this arm makes NONE.
- Do NOT touch sibling arm files (no tilejoin/allydpr/
  shoutrec files, no fieldparty recorder).
- This arm's files only: scripts/test-w5counts-a.js (new)
  + scripts/policies/w5counts-diag.js (new) +
  evidence/2026-10-29/sim-w5counts-a-prereg.md,
  sim-w5counts-a.md, sim-w5counts-a-sense.txt (if the
  sense replay runs), w5counts-a-analysis.json, and the
  corpus dir evidence/2026-10-29/perseed-w5counts-a/.
  The restored fullseat-pursuit.js is a RUN-TIME ONLY
  restore: it is deleted before the final commit and is
  never committed by this arm.
