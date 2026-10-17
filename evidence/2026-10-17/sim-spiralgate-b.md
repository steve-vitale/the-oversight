# sim-spiralgate-b — gate the day-1 "SPIRAL HAS STARTED" alarm (sim-findings #457)

Run: fleshout-loop-b-20261017 (worker sim-spiralgate-b). Voice-only prose arm.
Fix: `src/js/engine/calories.js` — the spiral FRAMING now fires on the second
consecutive starving night of the same bearer; the first tick keeps honest
framing ("You went to bed on an empty stomach."). Proof:
`scripts/test-spiralgate-20261017.js` (GREEN). Sweep:
`scripts/sweep-spiralgate-20261017.js`, adjudication:
`scripts/analyze-spiralgate-20261017.js`.

## PRE-REGISTRATION (docs/MEASUREMENT.md §§9–12, 14 — binding, written before the armed sweep)

- PRIMARY GO: **0** 'spiral has started' beats at pre-gate positions
  (first-in-streak starving nights, same-bearer consecutive) on ARMED runs.
  Any armed pre-gate spiral beat = gate failed = NO-GO.
- BLANK-EXISTENCE: CONTROL fires day-1..3 'spiral has started' beats at
  pre-gate positions on **≥4/16** runs. Bar set from the finding's original
  sense probe (sim-flowrate-b, 60d leadfeast/s4403) plus one accidental
  pristine control run during smoke (leadfeast s1103: d1 + d4 pre-gate
  alarms) — before the full control sweep.
- GUARDRAILS (report-only): det-gate byte-identical per-dawn extHash armed
  vs control (voice-only); wall metrics identical
  (national/table/wins/exiled, median survival, death-cause shares).
- Horizon: 180d death-aware (+10d tail). SMOKE=1: 2 seeds × 2 policies × 25d
  (instrument check only).
- Seeds: 8 FRESH (1103, 2219, 3323, 4427, 5529, 6631, 7735, 8837 — no prior
  evidence mentions) × {leadfeast, belongfeast} × {control, armed} = 32 runs,
  identical seeds paired across sides. Substrate: FEASTSCALE_R13=1,
  SEATDRIVE=0 explicit.

## The code reading (gate choice, documented)

`resolveDay` (engine/calories.js) fires the STARVING branch when
`scholar.kcal < 0` after subtracting the day's need (~2200 kcal): the
scholar entered the night with ZERO reserves and took REAL damage
(`health -= min(20, 2 + deficit/180)`, `energy -= 25`). That is "genuine
hunger" in code — zero reserves + actual health/energy damage. The WARNING
branch (`kcal < 500`, no damage) is the existing honest telegraph
("Eat tomorrow or the spiral begins") — left untouched; it does the
teaching work the alarm was doing badly.

Gate chosen: **second CONSECUTIVE starving night of the same bearer**
(N=2, "the second hunger event, not the first tick"). Consecutive because
the spiral is a sustained-process concept — a fed night breaks it in
fiction (the body ate) and in mechanics (no starvation damage that
night). The counter (`scholar.hungerNights`) resets on any non-starving
night. First tick framing: 'STARVING: health and energy falling. You went
to bed on an empty stomach.' — keeps the STARVING: state report and the
damage report (no silent actions; canon's "every action narrates
honestly"), drops only the alarm.

## Mid-run root cause found during the sweep (the mantle)

The first armed sweep flagged 7 pre-gate spiral beats. Root cause, not a
classifier artifact: the mantle passes mid-run by MUTATING the scholar
object in place (`mantleBecome`, ledger.js `playerDeath` — "you become
that villager," Steve 2026-10-14). The hunger ledger is per-PERSON body
state, so the successor inherited the dead bearer's streak (observed:
giulia hn=3 → nino hn=4 + the spiral alarm on nino's first night — the
day-1 blank re-firing mid-run). Fix: a `_hungerVid` stamp in `resolveDay`;
a bearer-id change restarts the count. Proof A7 pins it; the wild confirms
it (armed-belongfeast-s1103 d99: nino's first night as bearer gets the
honest framing mid-streak). Without this the fix would have been
incomplete — the blank would survive every succession.

## Proof results (`scripts/test-spiralgate-20261017.js` — GREEN, 0 failures)

- PART 0 (RED, pristine module executed from git base ab046665): the alarm
  fires on the FIRST starving night; no hungerNights ledger; the damage
  itself is real (health 85.8, energy −25).
- PART A (GREEN fixtures): night 1 → honest framing, damage unchanged;
  night 2 consecutive → spiral alarm; night 3+ → alarm persists; fed night
  → counter resets, WARNING telegraph intact, no STARVING state; broken
  streak → first-tick framing again; mantle transfer → counter restarts,
  new bearer gets honest framing.
- PART B (det-gate): pristine vs fixed 6-night trajectories byte-identical
  except the two new ledger fields (`hungerNights`, `_hungerVid`); no
  `Math.random` anywhere in calories.js (zero RNG draws in the voice path).
- PART C (real-sim wiring, belongfeast s1103 40d): 17 starving beats,
  0 pre-gate spiral, 13 post-gate spiral, 4 pre-gate honest — the gate
  holds in the wild.

## Sweep results (16+16 paired, 180d death-aware)

| side | pre-gate spiral | post-gate spiral | pre-gate honest | starving | warnings | day1–3 alarm runs |
|---|---|---|---|---|---|---|
| control (pristine) | 302 | 476 | 0 | 778 | 906 | 16/16 |
| armed (gate) | **0** | 476 | 302 | 778 | 906 | 0/16 |

- PRIMARY: **GO** — 0 pre-gate spiral beats on armed (observed=0).
- BLANK-EXISTENCE: **PASS** — 16/16 control runs fire the day-1..3 alarm
  (bar was ≥4/16). The blank was universal, not occasional: every broken
  streak re-fired the alarm on control (302 pre-gate beats total).
- The re-framing is exactly 1:1 — control's 302 pre-gate alarms became
  armed's 302 honest first-tick beats; post-gate alarms identical (476).
- DET-GATE: **PASS** — per-dawn extHash byte-identical armed vs control,
  16/16 pairs, 0 differing entries (voice-only confirmed on real sims).
- Wall guardrails: **PASS, all identical** — national 10/16, table 15/16,
  wins 0/16, exiled 0/16, wave45 0/16, median survival 133d, max 182d,
  death-cause shares byte-identical (top: monster:combat 324,
  monster:villager combat 140, player:combat 101, villager:monster 97).

Scale-wall numbers (this run): national 10/16 · table 15/16 · wins 0/16 ·
wave 4–5 unlocks 0/16 · median survival 133d (max 182d) · maxArc 4 ·
maxWave 3.

Telemetry deviation check vs scale-wall.json baseline: LOUD "wins
disappeared: baseline 16 → current 0". NOT a lever effect: the identical
0/16 appears on pristine control (byte-identical trajectories), and the
task substrate is SEATDRIVE=0 explicit — wins ride the seat driver (0/16
without it is the known substrate reading). No same-run investigation
item; documented here.

## Sense verdict (SENSE-TESTING LAW — day-1..5 transcripts, 3 armed runs)

Armed, all three runs:
```
[d1] ⚠ STARVING: health and energy falling. You went to bed on an empty stomach.
[d2] ⚠ WARNING: reserves critical. Eat tomorrow or the spiral begins.
[d3] ⚠ WARNING: reserves critical. Eat tomorrow or the spiral begins.
[d4] ⚠ STARVING: health and energy falling. You went to bed on an empty stomach.
[d5] ⚠ STARVING: health and energy falling. The spiral has started.
```
Control d1 for contrast: "The spiral has started." on arrival — the alarm
blank, verbatim.

Verdict: the gated sequence reads as PEOPLE, not counts. Day 1 is an
empty stomach on arrival — human-scale, honest about the falling health.
The WARNING telegraph does the teaching ("Eat tomorrow or the spiral
begins"); the spiral alarm on d5 arrives as a CONSEQUENCE the player has
been warned about twice, not a jump-scare. The escalation tracks the
body's actual history, including across successions (d99 nino). No
information is hidden: every hungry night still reports STARVING + the
damage. The fix changes framing, never removes information (canon's "no
silent actions" holds).

## Metric review

The metric proved right, not wrong: the primary (0 pre-gate spiral beats)
was theory-driven and held; the blank-existence bar (≥4/16) was exceeded
16× over, which suggests the bar was conservative — but the conservative
bar was the honest one to pre-register from a single probe. No revision
proposed. One instrument note for future voice arms: streak
reconstruction keyed on say-time vid can false-positive across the
mantle when the code's ledger keys on scholar.villagerId and the hook
falls back to Game.villagerId — key the instrument on the same field the
code stamps (or read the ledger directly off the scholar in the hook).

## Village assessment — what the runs looked like

The villages are long-lived (median 133d, max 182d) and reach far: 10/16
national, 15/16 table, maxArc 4, maxWave 3 — but 0/16 wins and 0/16 wave
4–5 on the SEATDRIVE=0 substrate (the seat driver is the win engine; this
substrate is the delegation baseline). Death is overwhelmingly combat:
324 monster:combat + 140 monster:villager combat + 101 player:combat vs 11
villager:starvation — the spiral alarm was firing 302 times at first-tick
hunger in villages where starvation kills almost nobody. The alarm was
crying wolf over a survivable rhythm: hungry night → warning → hungry
night → spiral, with streaks constantly breaking and restarting (778
starving beats, 302 of them first-in-streak). The blank filled: first-tick
hunger now reads as an empty stomach; the spiral alarm is reserved for
hunger that has actually become a spiral — including for successors, who
no longer inherit the dead bearer's alarm.

## Blanks filled

- sim-findings #457 FIXED: the day-1 "SPIRAL HAS STARTED" alarm is gated
  behind the second consecutive starving night of the same bearer; the
  mantle no longer carries the spiral across successions.
- No new findings filed; nothing chased off-axis.
