# sim-w5counts-a — wave-5 exact readiness counts (axis scale-onramp)

Run: fleshout-20261029T2115Z. Arm: sim-w5counts-a — DIAG /
INSTRUMENTATION ONLY, follow-up to sim-w5ready-a (backlog #1453,
claimed by this run).
Worktree: `~/workspace/worktrees/sim-w5counts-a` (branch
sim-w5counts-a). Base: master at worktree cut (prereg commit
6844202c; no base move during the run — the analyzer re-read
standing.js at analysis time and the demand citation still
matched).
Prereg: evidence/2026-10-29/sim-w5counts-a-prereg.md (commit
6844202c, BEFORE the sweep and before the judged analyzer leg).
Corpus (NEW, written by this arm): evidence/2026-10-29/
perseed-w5counts-a/ (16 rows: seeds 76001–76008 × OFF substrate /
ON fullseat-pursuit, 180d death-aware). The w5ready corpus could
not be re-used: it records rd5short NAMES only, and exact counts
cannot be recovered from end state after the fact. The new corpus
runs the SAME seeds/policies, and it reproduces the pilot corpus
exactly — see "Reproduction check" below.
Instrument: scripts/policies/w5counts-diag.js (pure-read daily
recorder) + scripts/test-w5counts-a.js (sweep / --detgate /
--analyze / --sense). Output: evidence/2026-10-29/
w5counts-a-analysis.json (recomputed from the corpus by the
analyzer; it never copies a worker summary).
ZERO src/js changes. ZERO default flips. ZERO deed-bar moves.
No pursuit variant designed in this arm. The ON policy file
(fullseat-pursuit.js) was restored from git history
(4b795ab5f) for the sweep run ONLY and deleted again before
the final commit — it is never committed by this arm, exactly
as the fullseat pilot did.

## Canon read first

- docs/CANON.md, docs/MONSTER-WAVES.md (Wave 5: standing ≥ 200
  AND wave-4 faced; readiness-gate demand table: wave 5 =
  armored 4 at armorP ≥ 15, armed 6, tricks 3, veterans 2 killed
  wave-4+), docs/TABLE.md, docs/PROGRESSION.md.
- Two veteran concepts, kept SEPARATE throughout (checked in
  the data — no conflation):
  - MONSTER veterans: hardened older-wave monsters (game.js
    castMonster/spawn path: veteran flag, +50% HP, +3 damage,
    +1 speed, scarred/elder/pack-leader variants). A hardened
    monster's kill logs its BASE wave in state.waveKillLog —
    so a hardened wave-3 kill logs w=3 and never appears in
    this arm's wave-4+ killer lists. The killer lists below
    contain only w ≥ 4 entries, as the gate reads them.
  - LIVING-VILLAGER veterans bar: distinct LIVING roster
    members with a wave-4+ kill in state.waveKillLog
    (standing.js waveCombatReadiness: `e.w >= w-1`,
    `isLiving(e.by)`; dead killers do NOT count under default
    behavior). VETSHAPE=1 (living-or-dead) is OFF by default
    and is NOT the game; this arm never enables it.
- #1223 NOT chased. No deed bar moved.

## VERDICT: GO (measurement complete; zero intervals remaining)

Judged exactly against the prereg — no re-scoring:

| leg | bar | result |
|---|---|---|
| 1. Counts present as integers, 16/16 | end counts armored/armed/tricks/veterans + demand + short, non-empty daily trace, 2,183 daily snapshots total | PASS — 0 intervals anywhere in the analysis output |
| 2. Peak splits measured, 16/16 | peakStanding {gated, day, war, diplomacy, plenty, raw, capped, holdKind} per row; all 16 rows are gated-shortfall rows (peak gated < 200) and all 16 have peak splits | PASS |
| 3. Killer identities checkable | end killers list with living flag per killer, 16/16; gate veterans == living killers at END, 16/16; same equality on 100% of daily snapshots (0 mismatches / 2,183) | PASS |
| 4. Analyzer recomputation | max counts, peak standing + split, days-ready stats, first-met days recomputed from traces (+ final snap for END); recomputed trace-max == recorder max, 16/16 | PASS |
| 5. Cross-checks vs fullseat unlock block, 16/16 | end gated == unlock.standing; end raw/war/diplomacy/plenty/capped == unlock split; end holdKind matches under the prereg mapping; end rd5short == unlock.rd5short | PASS |
| 6. Demand citation | analyzer reads readyDemand[5] from standing.js: armored 4 / armorP 15 / armed 6 / tricks 3 / veterans 2 | PASS |

Proof gates: G0 neutrality PASS (seed 76001 OFF bare vs
+w5counts: days 129, gameDays 129, starvation 0, deaths 37,
pop 8, pantry 48,464, known 61 — identical); G3 corpus
integrity PASS (16/16 rows, every row with trace + end +
unlock block). The final snapshot exceeded the daily-trace
max on 0/16 rows — the daily cadence already covers the
final state everywhere, so the final snap is a safety net,
not a correction.

## Reproduction check (the new corpus IS the old band, re-run)

All 16 new rows match the pilot corpus (perseed-fullseat-a)
exactly on days, gameDays, endReason, waveReach,
nationalEver, table, entered, won, and the full unlock block
(standing, raw split, capped, unlockedWave, w4faced, rd5ready,
rd5short). The recorder moved nothing; the counts below are
the same band w5ready measured at bar level, now at exact
count precision. The one gloss correction: the live wave-2
ledger bar is 4 (src/data/wave-ledger.json barsPerWave[2],
calibrated 2026-10-11), not the ≥ 5 in w5ready's prereg
gloss — but NO classification changes on this band, because
the only row below 5 wave-2 points is the day-40 death
(76006-off), which fails the day-25 floor anyway. The
analyzer derives the w3 rung from day + w2points + the live
w2bar, never from a hardcoded number.

## The count table — end, max, and peak per row (recomputed)

Columns: END armored/armed/tricks/veterans (demand 4/6/3/2),
gated standing + holdKind at end, MAX per bar over the run,
PEAK gated standing + day + split (war/diplomacy/plenty).
Read END as "what the village had when the run stopped" and
MAX as "the best it ever fielded" — the gap between them is
the mortality/selection story w5ready could only infer.

| row | days/end | END a/w/t/v | gated (hold) | MAX a/w/t/v | PEAK gated (day, war/dipl/plenty, raw/cap) |
|---|---|---|---|---|---|
| 76001-off | 129 lost | 1/7/20/0 | 127 below-bar | 5/11/20/0 | 127 (d85, 25/102/0, 127/127) |
| 76001-on | 107 lost | 0/0/19/0 | 199 defer5 | 7/11/19/0 | 199 (d74, 25/102/80, 207/207) |
| 76002-off | 118 lost | 0/0/20/0 | 100 floor | 6/10/20/1 | 147 (d76, 25/102/20, 147/147) |
| 76002-on | 155 lost | 0/0/24/0 | 100 floor | 7/10/24/0 | 172 (d136, 50/102/20, 172/172) |
| 76003-off | 180 surv | 5/7/23/0 | 99 defer4 | 7/11/23/0 | 99 (d57, 0/102/0, 102/102) |
| 76003-on | 180 surv | 0/3/24/0 | 100 floor | 9/11/24/1 | 197 (d116, 75/102/20, 197/197) |
| 76004-off | 180 surv | 9/9/21/0 | 177 below-bar | 10/11/21/0 | 177 (d178, 75/102/0, 177/177) |
| 76004-on | 89 lost | 3/7/16/0 | 99 defer4 | 5/11/16/0 | 99 (d57, 0/102/20, 122/122) |
| 76005-off | 103 lost | 0/0/21/0 | 152 below-bar | 7/11/21/0 | 152 (d89, 50/102/0, 152/152) |
| 76005-on | 167 lost | 0/0/26/0 | 110 below-bar | 8/11/26/0 | 192 (d116, 50/102/40, 192/192) |
| 76006-off | 40 lost | 1/7/11/0 | 0 below-bar | 4/10/11/0 | 0 (d2, 0/0/0, 0/0) |
| 76006-on | 180 surv | 4/4/24/0 | 110 below-bar | 8/10/24/0 | 110 (d149, 50/0/60, 110/110) |
| 76007-off | 90 over | 7/9/20/0 | 199 defer5 | 7/11/20/0 | 199 (d79, 25/102/100, 227/227) |
| 76007-on | 120 lost | 0/0/21/0 | 199 defer5 | 6/10/21/1 | 199 (d71, 25/102/140, 267/227) |
| 76008-off | 171 over | 7/9/22/0 | 192 below-bar | 7/11/22/0 | 192 (d170, 50/102/40, 192/192) |
| 76008-on | 180 surv | 3/5/19/0 | 20 below-bar | 7/11/19/0 | 99 (d83, 0/102/0, 102/102) |

Aggregates (medians are the analyzer's upper median over 8):

| bar | OFF end median | OFF max median | ON end median | ON max median | end-short rows | max-short rows |
|---|---|---|---|---|---|---|
| armored (≥ 4) | 5 | 7 | 0 | 7 | OFF 4/8, ON 7/8 (11/16) | 0/16 |
| armed (≥ 6) | 7 | 11 | 3 | 11 | OFF 2/8, ON 7/8 (9/16) | 0/16 |
| tricks (≥ 3) | 21 | 21 | 24 | 24 | 0/16 | 0/16 |
| veterans (≥ 2) | 0 | 0 | 0 | 0 | 16/16 | 16/16 |

Wall numbers (descriptive, same band): wave-5 unlocked 0/16;
full seat 0/16; nationalEver OFF 6/8, ON 8/8; table OFF 2/8,
ON 6/8; wins OFF 2 (both lesser seats: 76007-off, 76008-off),
ON 0 (pursuit declines lesser seats and never reaches full).
Peak gated median OFF 152, ON 192; peak shortfall 16/16.

## What the counts say (the findings, in plain words)

1. THE VETERANS BAR WAS NEVER MET — NOT ONCE, ON ANY DAY.
   Demand is 2 living wave-4+ killers. Days with veterans ≥
   2: 0 across all 2,183 daily snapshots. Days with all four
   bars met (rd5ready): 0/16 rows. Maximum simultaneous bars
   met: 3 on every row — the stack assembles to 3/4 and
   stops there, because the fourth bar never arrives. The
   three-bars-met state (armor + weapons + tricks, veterans
   missing) held for a median 81 days per OFF run and 111
   days per ON run (range 23–165). This is not a near-miss
   on the veterans bar; it is a bar that never fills.
2. ONE VETERAN ARRIVED ON 3 ROWS — AND NEVER MET A SECOND
   LIVING ONE. Max veterans = 1 on 76002-off, 76003-on,
   76007-on; 0 on the other 13 rows. The life histories,
   with killer identities (the checkable part):
   - 76002-off: ava_garcia killed a wave-4 monster around
     day 90 and stayed living through the last daily
     snapshot (day 117, veterans 1 for 28 days) — then died
     on the village's final day (day 118, final snap:
     living=false, veterans 0). The village was lost the
     same day. Its only veteran died with the village.
   - 76003-on: gen_43n23b6 killed a wave-4 monster around
     day 96; gen_e7de7wh killed one around day 116 — but
     by the day-116 snapshot gen_43n23b6 was ALREADY DEAD,
     so the living count stayed 1 (the baton passed, never
     overlapped). gen_e7de7wh died by day 136. Veterans ≥ 1
     for 40 days, veterans ≥ 2 for 0 days. The run
     accumulated TWO wave-4 kills and still never held two
     living veterans at once — the bar demands overlap in
     life, not accumulation over a run.
   - 76007-on: gen_dzd8uo9 killed a wave-4 monster around
     day 85, dead by day 91 — 6 days as the village's only
     veteran, then gone.
   End-state killer lists confirm the same story from the
   other side: 76002-off ends with 1 dead killer, 76003-on
   ends with 2 dead killers, 76007-on ends with 1 dead
   killer, and the other 13 rows end with NO wave-4+
   killer at all (living or dead). A stack pursuit variant
   must therefore do more than "get more wave-4 kills" —
   it must get two kills close enough together that both
   killers are alive at the same time, and then KEEP them
   alive. The 76003-on baton-pass is the design target
   stated as a miss: the second kill landed ~20 days after
   the first, and the first killer did not survive the gap.
3. GEAR IS EARNED, THEN LOST — END STATE UNDERSTATES
   CAPABILITY, MAX OVERSTATES DURABILITY. Armor reached
   demand (≥ 4) at MAX on 16/16 rows and weapons (≥ 6) at
   MAX on 16/16 rows, but at END armor is short on 11/16
   rows and weapons short on 9/16 rows — exactly
   w5ready's bar counts, now with exact deficits (end
   armored < max armored on 14/16 rows; end armed < max
   armed on 16/16 rows). Worst cases: 76002-off armor 6 → 0, weapons
   10 → 0; 76005-on armor 8 → 0, weapons 11 → 0; 76003-on
   armor 9 → 0. The ON arm ends WORSE than OFF on gear
   (end medians armor 0 vs 5, weapons 3 vs 7) while matching
   it at max (7/11 both arms) — longer, harder ON runs
   expose more fighters to death, so end snapshots punish
   the arm that fought more. Any pursuit variant judged on
   end state alone will misread gearing as failure; it
   must be judged on max + survival-to-window, i.e. on
   whether the gear counts are still up WHEN the other
   bars align.
4. TRICKS IS NOT A BLOCKER AT ANY PRECISION. End tricks
   11–26 (demand 3), max tricks 11–26, met from day 4–16 on
   every row. The one low row (76006-off, 11) is the day-40
   death, still 8 over demand. No pursuit needs to touch
   counters.
5. STANDING PEAKS ARE MEASURED, NOT JUST GATED TOTALS.
   Peak splits for all 16 rows are in the table above.
   Peak gated median OFF 152, ON 192; only 3 rows ever
   pinned at 199 (76001-on, 76007-off, 76007-on — the
   defer5 rows). The plenty cap is visible exactly once
   at peak: 76007-on peaked at raw 267 (25 war / 102
   diplomacy / 140 plenty) capped to 227, gated 199
   defer5 — bread over the 100 cap bought nothing, and
   the row still ended capped exactly 200 (100/0/180)
   gated 199 defer5. The other 13 rows are genuine points
   shortfalls at peak, not cap artifacts.
6. PEAK-TO-END DECAY IS DIPLOMACY COLLAPSE, NOW WITH
   COMPONENT DELTAS (not just direction). Five rows decay
   from peak to end; all five end with diplomacy 0:
   - 76002-off: peak 147 (25/102/20) → end raw 90
     (50/0/40), gated 100 (ratchet floor). Diplomacy −102,
     war +25, plenty +20.
   - 76002-on: peak 172 (50/102/20) → end raw 70
     (50/0/20), gated 100 (floor). Diplomacy −102, rest
     unchanged.
   - 76003-on: peak 197 (75/102/20) → end raw 95
     (75/0/20), gated 100 (floor). Diplomacy −102, rest
     unchanged. The 197→100 story w5ready told is now
     component-exact: the village lost all 3 links and
     nothing else moved.
   - 76005-on: peak 192 (50/102/40) → end raw 110
     (50/0/60), gated 110. Diplomacy −102, plenty +20.
   - 76008-on: peak gated 99, raw 102 (0/102/0, defer4)
     → end raw 20 (0/0/20), gated 20. Diplomacy −102,
     plenty +20.
   The other 11 rows end at peak (delta 0). Standing is
   movable up (ON peaks beat OFF peaks on 5/8 seeds) but
   not sticky — and the leak is entirely the diplomacy
   component (links dissolving / bearers dying), never war
   (ledger-cumulative, no decay path) in this band.

## Village assessment (what the village looked like)

A village on this band gears up fast (weapons in hands from
day 2, armor at demand within weeks, counters learned by
week 2), fights its way to wave 4, and then lives for
months at 3/4 readiness: armed, armored, and learned, but
with no veteran core. Its standing climbs on bonds and
blood and bread toward 200 — ON villages peak at a median
192, close enough to smell the fifth draft — and then the
bonds break: bearers die, links dissolve, 102 points
evaporate, and the village ends at 100 (floor) or 110 or
20, with its gear counts gutted by the same deaths. The
villages that "win" here win lesser seats (76007-off,
76008-off) — the full seat is not lost by a little on one
bar; it is lost by a bar that never fills (veterans 0/16
at end, 0 days at demand) stacked with a standing total
that decays through its diplomacy leg. Who thrived: the
fighters who lived long enough to be counted at max (up to
10 armored, 11 armed on a run). Who died and why: the
veterans — all four wave-4 killers on this band are dead
by their runs' ends, and the one village that produced two
of them never held both alive at once. What knowledge /
capability was missing: not counters (met everywhere),
not gear (met at max everywhere) — the missing capability
is keeping two wave-4 killers alive simultaneously while
holding gear counts and standing up at the same time.
That simultaneity, not any single count, is the blank the
next arm must fill.

## Sense-testing read (76005 ON, days 166–167 ring)

File: evidence/2026-10-29/sim-w5counts-a-sense.txt (240-line
ring; NON-MEASURED replay — narration shifts trajectories,
so it never enters the census).
METHOD LIMIT, stated up front: the ring covers only the
final two days, so the table announcement, the lesser
skips, and any earlier hold beats are NOT in the readable
window. This read judges the endgame window only. The
replay's end state matches the census row for 76005-on
exactly (armored 0 / armed 0 / tricks 26 / veterans 0,
gated 110, below-bar) — the counted wall and the voiced
window are the same village.
Judgment — the counted wall is still VOICED AS
CONSEQUENCES, SILENT AS SPECIFICATION, now with numbers
attached: this village peaked at gated 192 (day 116) and
ended at 110 below-bar with 0 armored, 0 armed, 0
veterans — and NOTHING in the final two days names any of
those missing pieces. No hold-beat line appears in the
ring at all (grep for the fifth-draft / readiness-bar
lines: zero hits), which is exactly what the code
predicts for a below-bar row: hold beats fire only in
deferral, and this row is below the bar, so it hears
nothing about readiness. What IS voiced, and voiced
well: bearer deaths drive everything (Ivy Wang dies day
167 — "Ivy is dead — and the dead hold no treaties. Every
link Haven has shakes." — the diplomacy-decay mechanism
from the count table, spoken aloud as people dying), and
the overtime price is constant (RERUN ×6, +150% HP, +72%
damage). Villagers still read like people in this window
(the reunion fight's "someone you brought, or someone
who brought you" dread; the Codex turning a page on its
own for Ivy's death). No robotic or repeated dialogue
flagged beyond the deliberate RERUN refrain, which is
the overtime mechanic voicing itself, not filler. The
counts do not change w5ready's sense verdict; they pin
it: the village that ends 0/0/26/0 hears harder monsters
and dying bearers, not a missing-pieces list.

## Metric review

- The prereg worked as written; no mid-run re-scoring.
  The GO legs (integers, peak splits, killer identities
  with daily equality, recomputation, cross-checks,
  citation) all passed on the first analyzer run with
  zero failures — the instrument design (gate-authoritative
  counts + mirrored living rule + daily trace + final
  snap) held up against 2,183 snapshots without a single
  integrity mismatch.
- The daily + final-snap design proved slightly
  conservative: the final snap exceeded the daily max on
  0/16 rows, so a daily-only trace would have sufficed
  for maxima on this band. The final snap stays in the
  design anyway — it is what caught ava_garcia's final-day
  death (alive at the last daily, dead in the final snap),
  i.e. it captures end-of-run mortality the daily cadence
  cannot by construction. Future arms should keep both:
  daily for maxima, final for end-state truth.
- "Distance 2" discipline (from w5ready) still applies:
  the deed w5 distance is 2 on every row (downstream of
  the lock), while the unlock distance is now a count
  table, not a single number. Quote counts with bar
  names, or the wall will keep being misread.
- End-state snapshots are now a known-bad judge for gear:
  end medians (armor 0 ON) vs max medians (7 ON) differ
  by the full demand. Proposed revision for the NEXT
  run's prereg (not applied here): a pursuit variant's
  GO threshold must be written on max counts + days of
  simultaneous readiness, never on end counts alone.
  Similarly, the veterans bar's GO must be written as
  "days with 2 living veterans > 0" (overlap), never as
  "wave-4 kills ≥ 2" (accumulation) — 76003-on proves
  accumulation without overlap fails the bar.
- Balanced panel (§15): not applicable — this is a DIAG
  instrument arm on a fixed band, not a before/after lever
  comparison. OFF vs ON is reported descriptively only,
  and no panel compare is claimed.

## Landing + ranked next step

- LANDING (DIAG rule): instruments + evidence + analysis +
  corpus land; zero game code, zero policy files created
  or deleted (the pursuit restore was run-time only and
  is deleted before the final commit), zero default
  flips. No push, no version bump, no live check — ready
  for coordinator merge, pending ship.
- RANKED NEXT STEP (fixed order, per brief): this arm
  delivers the count table the next arm designs from.
  The next variant, when it comes, must be designed
  around the stack, now with numbers: (a) produce TWO
  living wave-4 killers whose lives OVERLAP (the
  76003-on baton-pass — second kill ~20 days after the
  first, first killer dead before it landed — is the
  failure mode to beat); (b) keep both killers alive to
  the window (all 4 wave-4 killers on this band died);
  (c) hold armor ≥ 4 AND weapons ≥ 6 up at the same time
  (max proves both reachable; end proves both losable);
  (d) hold standing against diplomacy decay (all 5
  decays are −102 diplomacy). A variant that chases any
  one of these without the other three will re-measure
  the same 3/4 stack. Do NOT chase the stage bar (#1223)
  without a Steve call; do NOT move any deed bar — the
  bar is not the problem, the simultaneity is.

## Findings outside this arm (reported, NOT touched)

- Below-bar silence, now counted: villages below the
  standing bar hear nothing about readiness (hold beats
  fire only in deferral). 76005-on ends 0/0/26/0 below-bar
  and its final days name no missing piece. Whether a
  below-bar readiness readout belongs in the standing
  line or the table preview is a design question, not a
  bug claim.
- End-state "standing 100" readings on floor rows (76002
  both arms, 76003-on) overstate live standing (raw
  70–95). Any future standing report should print raw +
  gated + floor separately. This arm's snapshots already
  do (raw/capped/gated/holdKind per snapshot).
- The w2bar gloss correction (live bar 4, not 5) is
  recorded above under "Reproduction check." It changes
  no classification on this band.
- 76008-on's end war = 0 despite 5 distinct wave-3 types
  fought at max (w5ready's note, still true in the new
  corpus): fought ≠ killed. War standing requires kills.

## Convergence state

Axis scale-onramp: CONVERGING, not converged. The wave-5
wall is now measured at exact-count precision: veterans
0 days at demand across 2,183 snapshots, gear met at max
on 16/16 rows but lost by end on 14–16/16, tricks met
everywhere, standing peaks measured with component splits
on 16/16 rows, and the killer identities that make
living-vs-dead checkable (4 wave-4 killers, all dead by
their runs' ends, never two living at once). The full
seat remains 0/16 unlocks on this band (0/64 across the
substrate-family rounds plus this audit's band, counting
w5ready's fixed corpus once). The standing directive
stands until the tracker records this axis converged on
measured evidence. Claim file + lock are the
coordinator's to retire, not this worker's.
