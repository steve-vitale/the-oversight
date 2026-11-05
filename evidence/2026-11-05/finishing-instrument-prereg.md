# Finishing instrument — pre-registration (arm build-finish-instrument)

Base: master `6b516a7ea` (2026-11-05). Branch: `build-finish-instrument`.
Worktree: `~/workspace/worktrees/build-finish-instrument`.
Date: 2026-11-05. Steve's winnability push: finishing is the tightest binding
link (secondkiller: 3 kills in 58 wild wave-4 fights, 5.2%; 0 kills in 19
post-first-blood fights; focus-fire NO-GO; hold-ground doubled damage, kills
unmoved). No instrument records how wave-4 fights end round by round. This
arm builds that instrument. Instrument only — zero outcome/behavior change.

## The instrument (game code, not test-harness-only)

New module `src/js/finishLog.js` (observe-only, no RNG, no state writes
except the telemetry ring and its own runtime ring):

- **Field fights** (`fieldFight`, villager channel): in-engine per-round
  capture. Each round records: round number, HPs at round start/end
  (villager, lead monster, ally), damage dealt/taken that round (leader +
  ally split), tricks performed and abilities fired that round, and the
  round's end state. Carried on the returned record as `rec.roundsDetail`
  (one entry per round, including the terminal round) plus `rec.roundCap`
  (true when the 15-round cap decided the ending).
- **Player turn-based fights** (`startCombat` / `tbAdvance` / `tbEnd`
  wraps): entry snapshot (fighters, entry HPs, gear, wave), one snapshot
  per round (fighter HPs at round boundary), close at `tbEnd` with result.
- **Emission**: one `fight_finish` telemetry event per wild wave-4+ fight
  (via the existing `tele()` ring), carrying channel, day, monster, wave,
  fighter composition + gear, outcome, ending, damage fraction, full
  `rounds` array and `last3` (the last three round records). A runtime-only
  ring `Game._finishLog` (bounded 200, never saved) holds the same records
  for sim drivers to read directly.
- **Ending taxonomy** (analyzer-facing, `ending`): `kill` (monster died),
  `flee` (fighter or monster fled), `death` (fighter died), `timeout`
  (round cap exhausted with no kill/death — field 15-round cap), `evade`
  (no contact, 0 rounds), `unfinished` (fight still open at finalize).
  `outcomeRaw` always carries the engine's own outcome alongside.
- **Off switch**: `FINISHLOG_OFF=1` (node env, same precedent as
  `NODEWITNESS=1`) skips every finishLog code path, so the off leg runs
  byte-identical engine behavior. No gate, price, deed, readyDemand, food
  cost, or six-slot change anywhere in this arm.

## Panel (judged leg)

- Policy: competent verbatim ONLY (no probe variant in this arm).
- Horizon: 150d, death-aware (runDays ends on village death / win).
- Seeds: **99311–99318** (8 seeds).
- Freshness check (done before any seed ran): grepped ALL dated preregs
  (`evidence/*/sim-*-prereg.md`) and dated evidence notes
  (`evidence/2026-11-04/*.md`, `evidence/2026-11-05/*.md`) for each seed.
  99311–99318 is named nowhere. REJECTED first candidate 99301–99308:
  it was the diplo-b band (2026-11-04). Forbidden/contaminated lists do
  not include it (standacc-b: 99201–99216; dmground: 99201–99208).
- Driver: `scripts/finishing-instrument-driver-20261105.js` (adapted from
  the secondkiller driver). Per-seed JSON to
  `evidence/2026-11-05/perseed-finish-instrument/`. Analyzer:
  `scripts/finishing-instrument-analyze-20261105.js`.
- Proof (committed with this prereg, before judged sims):
  `scripts/test-finishing-instrument-20261105.js` — prepared wave-4 field
  fight (roundsDetail complete, last3 correct, telemetry event present)
  + prepared wave-4 TB fight smoke + off/on neutrality on 2 seeds.

## Primary metrics (pre-registered, judged strictly)

1. **Coverage**: every wild wave-4 fight with rounds >= 1 in the panel has
   a `roundsDetail` with exactly one entry per round AND a matching
   `fight_finish` telemetry event. Bar: 100%, 0 missing, 0 instrument
   errors. (Evade/0-round fights are reported separately, not counted
   against coverage.)
2. **Ending distribution**: counts of kill / flee / death / timeout /
   evade / unfinished across wild wave-4 fights, split by channel
   (field vs player-TB). Kill conversion = kills / fights with rounds>=1.
   Reported, not barred — this is measurement.
3. **Last-3-rounds**: every fight with rounds>=1 carries `last3` (the
   final min(3, rounds) round records). Report median damage dealt per
   round inside last3, HP fractions at the start of last3, and
   tricks/abilities fired inside last3.
4. **Terminal-round signature**: for each ending, what the final round
   looked like — killing-blow damage share of monster entry HP, flee at
   which fighter-HP fraction and round, death at which round, timeout at
   which damage fraction. Reported as a table.
5. **Neutrality**: `FINISHLOG_OFF=1` on seeds 99311, 99312 must match the
   on-leg on days, endReason, and waveKillLog length exactly. Bar: exact
   match on all three, both seeds.
6. **Suite**: `node scripts/check.js --quick` — no NEW failures vs the
   standing 279 passed / 11 failed profile (cite base and run).

## Verdict rule

DIAG instrument run. **GO** iff metrics 1, 5, and 6 pass: the instrument
fires completely, changes nothing, and breaks nothing. The ending
distribution itself (metric 2–4) is the finding — no kill-rate bar is
pre-registered, because this arm measures finishing, it does not lever it.
A missed coverage bar is NO-GO, never re-scored against a friendlier split.
If a metric proves wrong, write it under "metric review" and propose the
revision for the NEXT run.

## Amendment 1 (2026-11-05, before any seed ran — implementation detail)

- TB `won` splits two ways: `kill` when a waveKillLog row matches this
  fight strictly (same monster id, same day, killer among the fight's
  fighters, scholar counting as `player`), else `rout` (the monster broke
  and no kill is logged — never counted as a kill). The ending taxonomy
  therefore gains `rout` for the player-TB channel only.
- Field records carry `preRoundDealt`: damage dealt before round 1
  (opening volley / closing strike). Per-round deltas sum to
  `damageDealt` minus `preRoundDealt`; the analyzer states the split
  rather than re-deriving the volley.

## Amendment 2 (2026-11-05, before the judged panel run — r1 pilot findings)

- The r1 pilot (RUN finish-instrument-pilot, same seeds 99311–99318, same
  policy/horizon) fired and proved coverage on its own terms (45/45 fights
  with rounds, 45/45 matching fight_finish events, 0 instrument errors),
  but its analysis found two instrument gaps, fixed before the judged run:
  1. TB round snapshots were HP-only: no per-round dealt/taken/abilities,
     so the last-3 and terminal tables were field-only. Fixed: each TB
     snapshot now carries dealt/taken (backward delta from the previous
     snapshot; the terminal round's dealt is exact, interior rounds carry
     the documented one-snapshot attribution lag of the tbAdvance timing),
     leaderTaken/allyTaken, vHpStart/vHpEnd, mHpStart/mHpEnd, and the
     abilities fired in that round (drained at snapshot time).
  2. Strict kill match missed the scholar: the killer id in waveKillLog
     is the scholar's villager id, but the analyzer only accepted
     'player' or a companion id, while the instrument already records the
     scholar id in the record's `fighter` field. Fixed in both the
     instrument's tbKillMatched and the analyzer: a log row matches when
     by === record.fighter (scholar) as well as by === 'player' or a
     companion id.
  3. TB round snapshots now fill the player entry's vid from the record's
     fighter id (was null — the scholar's tbfight entry carries no
     villagerId).
- The judged run is R2 (RUN finish-instrument-pilot-r2, OUTDIR
  perseed-finish-instrument-r2, same seeds 99311–99318, same
  policy/horizon). R1 files are retained as the pilot that found the
  gaps. Verdict rule unchanged.

## Metric review (to fill after the panel)

- (pending)
