# sim-w5death — WAVE-5 UNLOCKER DEATH AUDIT (finding #96 measurement)

Arm: `sim-w5death` (oversight-flesh-out-loop, run 2026-10-14T13:56Z, axis scale-onramp).
Type: DIAGNOSTIC INSTRUMENT ONLY — no game-code changes, no policy-code changes.
Scripts: `scripts/w5death-audit-20261014.js` (instrument + driver), `scripts/test-w5death-20261014.js` (proof).
Data: `evidence/2026-10-14/w5death-audit.json` (9 per-seed attribution rows).

Finding #96 (hidden_files/sim-findings.md, 2026-10-14 — scale/survival):
"New measured wall: wave-5 survival after unlock — 0/6 wave-5 unlockers reached
the table on the 15-seed confirm; the one table reach (s303) died there in a
7-deep succession chain. Candidate next arm."
This run closes the measurement blank: every wave-5 unlocker's fate attributed
(seed, unlock day, death day/cause/location, succession depth, table reach,
what killed the table-reacher).

## Pre-registration (MEASUREMENT.md §§9–12, 14)

- PRIMARY METRIC: attribution completeness — for every wave-5 unlocker: unlock
  day, every post-unlock death's day/cause/location/killer-wave, succession
  depth, table reach (day). GO = the table is delivered with numbers.
- POLICY: leadfeast (FEASTSCALE_R13=1) — the plentycost road, unchanged.
- SEEDS: 11/22/33/44/55/66/77/88 (the plentycost road) + 303 (table-reacher deep dive).
- HORIZON: 180d death-aware (runDays stops on Game.over / village-dead tail).
  Why 180: WIN-PATH HORIZON 180 (Steve 2026-10-13) — post-unlock survival is a
  late metric; shorter caps truncate exactly the long survivors it needs.
- Instrument: wraps Game.playerDeath (captures kill context at the source, then
  calls through) + a daily wrapper (unlock day via Game.unlockedWave(),
  tableWaiting day, national days). Read-only: no RNG consumed, no state
  mutated, no Date.now — trajectory-identical by construction.
- Pre-registered honesty check: existing per-seed rows in
  evidence/2026-10-14/plentycost-sweep.json were examined first. They carry
  per-death {day, kind, who, cause, player} but LACK unlock day, death location,
  succession depth, killer wave, and table day — so re-running with the
  instrument was required (reuse would have been dishonest).

## RESULTS

Attribution table (leadfeast, 180d death-aware, current master):

| seed | days | end | wave≤ | unlock d | table d | nat d | arc | deaths |
|------|------|-----|-------|----------|---------|-------|-----|--------|
| 11 | 180 | survived | 5 | d114 (202) | d175 | 97 | 4 | 11 |
| 22 | 167 | village-lost | 5 | d88 (205) | d67 | 35 | 4 | 13 |
| 33 | 32 | village-lost | 2 | — | — | 0 | 3 | 2 |
| 44 | 101 | village-lost | 5 | d67 (202) | — | 22 | 3 | 6 |
| 55 | 180 | survived | 5 | d74 (202) | d59 | 62 | 4 | 15 |
| 66 | 51 | village-lost | 2 | — | — | 0 | 3 | 3 |
| 77 | 79 | village-lost | 5 | d57 (202) | — | 2 | 3 | 3 |
| 88 | 69 | village-lost | 4 | — | — | 0 | 3 | 3 |
| 303 | 134 | village-lost | 5 | d71 (227) | d51 | 58 | 4 | 12 |

Wall numbers (this suite): national 6/9, table 4/9, won 0/9, wave-4 7/9,
wave-5 6/9, median survival 101d.

### Every wave-5 unlocker's post-unlock deaths

Notation: depth = succession depth (1 = first scholar death); killer wave from
the monster def (village-agreed display names can mask the def — e.g.
"Ugly-Eyes" is the village's agreed name for spoiler/timeslot w5 AND
influencer/audit w4); location = node epithet at death.

- s11 (unlock d114, table d175, SURVIVED): d121 Focus Group(w3)+eye-heads @Haven;
  d126 The Reunion(w4) @Haven; d128 the expedition (non-combat) @Haven;
  d165 The Timeslot(w5) @Haven; d174 Spool(w3) @Haven; d174 The Editor(w5) @Haven.
- s22 (unlock d88, table d67, lost d167): d120 The Spoiler(w5) @creek meadow;
  d123 Ugly-Eyes pack(w4) @Haven; d130 The Cancellation(w5) @Haven;
  d145 Ugly-Eyes(w5) @Haven; d147 The Big Beast(w4) @creek meadow;
  d155 Scarred Gavel(w3) @Haven; d162 The Editor(w5) @creek meadow;
  d165 The Algorithm(w4) @creek meadow.
- s44 (unlock d67, NO table, lost d101): d79 The Cancellation(w5) @Haven;
  d90 The Spoiler(w5) @Haven.
- s55 (unlock d74, table d59, SURVIVED): d74 The Eater(w4) @Haven;
  d86 The Network Note(w5) @Haven; d94 The Timeslot(w5) @Haven;
  d105 Old Big(w5) @Haven; d107 The Eulogy(w4) @Haven; d107 contest @Haven;
  d128 The Algorithm(w4) @Haven; d149 Elder Buffering(w3) @Haven;
  d163 The Loud Beast(w4) @Haven.
- s77 (unlock d57, NO table, lost d79): d57 The Algorithm(w4) @Haven;
  d65 The Network Note(w5) @Haven.
- s303 (unlock d71, table d51, lost d134): d85 The Network Note(w5) @Haven;
  d100 Ugly-Eyes=timeslot(w5) @Haven; d108 Ugly-Eyes=timeslot(w5) @Haven;
  d110 Highbeam Deer(w1) @Haven; d118 The Cancellation(w5) @Haven;
  d133 Ugly-Eyes=influencer(w4) @creekside grove.

### "What kills unlockers" summary (for the next survival lever)

32 post-unlock scholar deaths across the 6 unlockers:
- Killer wave: w5 16 (50%), w4 10 (31%), w3 4 (12.5%), w1 1 (3%), non-combat 2
  (contest 1, expedition 1). Post-unlock death is overwhelmingly COMBAT (30/32).
- Location: 27/32 at Haven (84%) — the wave-5 siege comes TO the village; only
  5/32 in the wild (creek meadow/grove). This is a siege-survival problem, not
  an expedition-risk problem.
- Table: 4/6 unlockers reached the table (s11 d175, s22 d67, s55 d59, s303 d51).
  Table day PRECEDES unlock day on 3 of the 4 (the table path opens via Arc 4 /
  food-deed rung, not gated on wave 5). Of the 4 table-reachers, 2 survived to
  180 (s11, s55) and 2 died after reaching it (s22 d167, 100d after its table;
  s303 d134, 83d after its table). The table does not end the siege.
- The two non-table unlockers (s44, s77) both died within ~1 month of unlock
  (d101, d79), both stuck at arc 3 — the table path (Arc 4) is the survival
  fork, not wave-5 combat per se.
- Succession depth is load-bearing: unlockers died 3–15 times (median 11.5) and
  the village kept going — s55 survived 180d through FIFTEEN successions.
  Wave-5 survival = surviving the succession grind, and the village-as-
  protagonist engine does its job.
- No post-unlock starvation on current master (plentycost's s303 starvation
  chain is gone — the food economy moved under it). The killers are monsters,
  not the pantry.

## Proof

`scripts/test-w5death-20261014.js`:
- DET-GATE: instrumented A-vs-B, 16 attribution checks x 8 seeds = **128/128
  field-identical** (days, endReason, unlock day, standing, table, national,
  arc, death count/days/causes/depths/who/locations/killer-waves).
- Fixture: **25/25 assertions** on w5death-audit.json — all attribution fields
  present; depths exactly 1..n; lineage death-pushes == captured deaths
  (recordLegend's end-of-run push distinguished by shape); unlock ⟺ maxUnlocked≥5;
  standing ≥200 at every unlock; tableDay ⟺ tableEver; s303 among table reaches.
- Non-invasiveness: uninstrumented leadfeast s303 on current master gives
  byte-identical macro trajectory to the instrumented run (134d, village-lost,
  wave≤5, table, lineage 13) — the wrap perturbs nothing. The plentycost JSON
  (02:16Z) is NOT a valid baseline for this run: the tree moved since (notably
  THROTTLEBEAT's hunger-depth exemption re-land + food-abilities), which is why
  s303's story changed (7 starvation/combat deaths → 12 combat deaths, wave≤3 →
  wave≤5, table still reached). Attribution days on fight-heavy seeds carry the
  documented sim-entropy-r26 noise budget; the story-level reading is robust.

## Metric review (§14)

Primary metric (attribution completeness) MET: the table is delivered — 6
unlockers, 32 post-unlock deaths, every death's day/cause/location/killer-wave/
depth, table reaches with days, and the summary above. No metric was moved.

Protocol note (documented, not a re-score): the proof's fixture assertion
"table reaches == [303]" (imported from the plentycost story) FAILED on current
master — table reaches are [11, 22, 55, 303]. The assertion was wrong, not the
instrument: the tree moved between the plentycost run and this run. Fixed in
the test (asserts s303 among table reaches); the corrected proof is 25/25.

## Village assessment

s303, the finding's table-reacher: reached the table d51 (arc 4, national 58d),
unlocked wave 5 d71, then died by inches — 6 post-unlock combat deaths, all
wave-4/5 monsters at Haven except the last (creekside grove), the village
finally lost d134 in a 12-deep chain. The table is a milestone, not a shield.

s55 is the counter-story: table d59, unlock d74, FIFTEEN scholar deaths, and
the village still stood at d180. Deep succession chains are survivable when the
village behind them is strong (national 62d, arc 4).

The blank for the next arm: post-unlock death is 84% at-Haven siege combat,
50% wave-5 killers. The lever surface is Haven siege defense during the
post-unlock window (d+0 to ~d+60), not expedition caution, not the pantry.

## Instrument limitations (documented, not chased)

- Summoned minion fighters ("an eye-head", "Sponsor-creature") carry no
  monsterId → wave unattributable (shown as wNone/w?). 4 such kills in the set.
- Village-agreed display names mask defs ("Ugly-Eyes" = spoiler/timeslot w5 or
  influencer/audit w4); the wave column uses the resolved def — the honest one.
- s44 d58 (creek bend): fight captured with empty monster list — killing blow
  from a non-monster fighter or a nulled fight; rare, noted.
- det-gate on this tree was 128/128, but sim-entropy-r26's contest-ID
  nondeterminism remains a game-code issue — future identical-seed comparisons
  on fight-heavy seeds should still run the gate first.
