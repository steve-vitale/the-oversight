# sim-dutyalone-r15 — the surplus-only feast DUTY (loop B, 2026-10-14, food-economy axis, sim-findings #187)

STALE-LOCK ADOPTION RUN. This tree held uncommitted work from a dead run
(heartbeats 106m stale, no live agents). The adopting run inventoried all
three untracked files (scripts/policies/dutyalone.js 176 lines,
scripts/det-gate-dutyalone-20261014.js 47 lines,
scripts/test-dutyalone-20261014.js 425 lines), re-ran the proof RED→GREEN
independently (including the NAIVE RED — the displacement mechanism the
design removes), ran SMOKE=1 instrument-honesty on both sides, ran the
16/16 det-gate on both sides, wrote its OWN measure script
(scripts/measure-dutyalone-20261014.js), and measured its OWN paired
r13-only control on identical seeds. Nothing from the dead run was trusted
on its word.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING)

- **Lever**: surplus-only feast DUTY. Env DUTYALONE=1 (default OFF; requires
  FEASTSCALE_R13=1). The duty fires ONLY when the r13 allowance's own gate
  says NO today (allowanceWouldFire — an exact mirror of scaleFeast's gate —
  evaluated BEFORE the allowance runs), on its OWN cadence
  (ctx._dlLastFeastDay; NEVER marks the shared ctx._fsLastFeastDay — zero
  displacement by construction). Fire condition: allowance-gate-no AND
  pantry fresh-days > 4, spending only the above-4d floor (floor never
  breached). All r13 honesty gates kept. Policy-side only — ZERO src/js
  changes.
- **Why**: the killed feastdoor arm (evidence/2026-10-14/sim-feastdoor2-b.md)
  SHARED the allowance's _fsLastFeastDay cadence, so its surplus-only feasts
  REPLACED the allowance's pantry-blind feasts — deeds 13→11, tables 4→2.
  dutyalone keeps the openings BY CONSTRUCTION: it only fires when the
  allowance would not.
- **Road**: 8 seeds (11/22/33/44/55/66/77/88) × leadfeast/belongfeast
  (= leadcourt/belongseek via the r13 layer), 180d death-aware, IDENTICAL
  seeds control vs armed.
  - Control: FEASTSCALE_R13=1, DUTYALONE unset.
  - Armed: FEASTSCALE_R13=1 + DUTYALONE=1.
  - (The dead run's shared baseline sim-feastbase-b.json was INVALID —
    pristine fingerprint policy=leadcourt/belongseek, fdFeasts 0/16,
    FEASTSCALE_R13 never set. This run measured its own paired control.)
- **PRIMARY**: deeds ≥ control AND table ≥ control−1 (openings preserved/added).
- **GUARDRAILS**: starvation ≤ control+9 (A/A p90abs); hungryDays ≤ control×1.409
  (A/A p90rel, from the feastdoor2 run); national ≥ control−4; no new death
  mode; median report-only.
- **SECONDARY**: duty feast counts, allowance feast counts (displacement check:
  allowance feasts armed ≥ control — the zero-displacement proof in the wild),
  per-seed deed attribution, Standing per avenue, wave reach, table seats,
  death-cause shares, exiled.
- **Gates before trusting comparisons**: det-gate 16/16 bit-identical both
  sides; SMOKE=1 instrument-honesty (policy actually ran; gate-contrast
  fixtures per the proof header).

## Proof results (re-run by the adopting run, 2026-10-14)

**REAL RED (gates off)** — all verified live:
- R1 gate-off byte-identical: dutylead == leadfeast, dutybelong == belongfeast,
  40/40 per-day trajectory hashes each.
- R2 no duty fires gate-off on a 5.5d-surplus fixture (pantry 132000→132000
  untouched, no cause line).
- R3 **NAIVE RED**: an inline naive duty (surplus-triggered, undeferring,
  marks the SHARED _fsLastFeastDay, runs BEFORE the allowance) on an
  allowance-would-fire fixture — the naive duty fires (naiveFeasts=1), marks
  the shared cadence (_fsLastFeastDay=30), and the allowance's opening is
  GONE (fsFeasts=0), with the cadence poisoned into the next days. The
  displacement mechanism the dutyalone design removes is REAL — this is the
  feastdoor2 failure mode reproduced in miniature.

**GREEN (DUTYALONE=1 + FEASTSCALE_R13=1)** — all verified live:
- G1 duty fires on surplus when the allowance's gate says no: real pantry draw
  (132000→127000), engine feast beat fired, duty cause line AFTER the verb
  (beat@2 cause@4, #201), floor 5.29 ≥ 4, own cadence marked (_dlLastFeastDay=30),
  SHARED cadence sentinel 23 INTACT. Cause line:
  "🕯️ The duty fire burns — 5.5 days of fresh on hand and no allowance feast
  tonight. The mountain gets eaten before it eats itself. (−5,000 kcal of would-be rot)"
- G2 3.9d holds the duty off (trigger strictly > 4).
- G3 floor binds: at 6.2d/2000-burn, spendTarget 4500 < cost 4800 → held
  (dlFloorNo=1); at 6.5d fires, lands at 4.00 — toward 4, never below.
- G4 **ZERO DISPLACEMENT**: on an allowance-would-fire fixture the allowance
  fired (fsFeasts=1), the duty did NOT (dlDefer=1 counted), own cadence
  unmarked, shared cadence marked BY THE ALLOWANCE (_fsLastFeastDay=30).
- G5 mirror exactness 7/7: allowanceWouldFire prediction == scaleFeast's
  actual fire/no-fire (gate clears; cadence blocked; contribution thin; not
  dusk; not at haven; feastDay set; plan not ok).
- G6 contribution <1500 holds the duty off. G7 armed determinism bit-identical.
  G8 duty inert without FEASTSCALE_R13. G9 feastDay set → duty off.

**Gates**: SMOKE=1 control (12/12: policy drives, no duty feasts on the
surplus fixture — gate-contrast) and SMOKE=1 armed (11/11: policy drives,
duty fired on the surplus fixture) both green. Det-gate 16/16 bit-identical
on BOTH sides (r13-control and armed, 180d × 8 seeds × 2 policies, run
in-process twice).

## Pilot table (8 seeds × 2 policies, 180d death-aware, identical seeds)

| metric | control (r13-only) | armed (duty) | pre-reg bar | verdict |
|---|---|---|---|---|
| foodDeeds (PRIMARY) | 13/16 | 11/16 | ≥ 13 | MISS |
| table (PRIMARY) | 4 (3 full, 1 lesser) | 1 (lesser) | ≥ 3 | MISS |
| starvation deaths | 21 | 11 | ≤ 30 | PASS |
| hungryDays | 48 | 54 | ≤ 67.6 | PASS |
| national | 7/16 | 4/16 | ≥ 3 | PASS |
| wins | 0 | 0 | — | — |
| exiled | 0 | 0 | — | — |
| wave4 reach | 11/16 | 14/16 | — | — |
| wave5 reach | 4/16 | 10/16 | — | — |
| maxWave / maxArc | 5 / 4 | 5 / 4 | — | — |
| median survival | 92d | 75d | report-only | −17d |
| max survival | 180d | 143d | — | — |
| duty feasts | 0 | 58 (159,150 kcal) | — | — |
| allowance feasts | 107 | 75 | ≥ control* | see note |
| duty defers | — | 75 | — | — |
| Standing med total | 134 | 219 | — | — |
| Standing med plenty | 120 | 180 | — | — |
| combat deaths | 62 | 116 | — | — |
| monster deaths | 20 | 39 | — | — |
| new death mode | — | none | none | PASS |

\* The allowance-feast aggregate is confounded by differential survival
(median 75d armed vs 92d control — shorter runs hold fewer feasts of any
kind). Per-seed pairs at matched days show parity (s33: 1=1 at 32d;
s88: 1=1 at 41d; s66: 4=4 with MORE armed days). Mechanistic proof stands:
G4 showed the duty defers on the allowance's day and never touches
_fsLastFeastDay; dlDefer=75 counts 75 stood-down openings. No displacement.

Deed decomposition: sentimentTaught 16/16 both sides (saturated);
feastSurgeUsed 13/16 → 11/16 — the duty's 58 extra feasts did not arm or
spend surges, so no new deeds. The one attributed deed (belongseek-s77:
duty feast preceded the surge use) shows the mechanism CAN fire; net
deeds still fell because villages died earlier.

Per-seed armed (policy-seed: days, wave, table, dl/allow):
leadcourt — s11: 138d w5, s22: 81d w5, s33: 32d w2, s44: 97d w5 table(lesser),
s55: 59d w5, s66: 74d w4, s77: 75d w5, s88: 86d w4.
belongseek — s11: 49d w4, s22: 60d w5, s33: 103d w5, s44: 143d w5,
s55: 51d w4, s66: 67d w5, s77: 75d w5, s88: 41d w2.

## Wall numbers (this run)

| side | national /16 | table /16 | wins /16 | wave4 /16 | wave5 /16 | median surv |
|---|---|---|---|---|---|---|
| control | 7 | 4 | 0 | 11 | 4 | 92d |
| armed | 4 | 1 | 0 | 14 | 10 | 75d |

## Village assessment (plain words)

The control villages lived the familiar story: a couple of leadcourt runs
went the distance (180d, global rank, full table seats), most died in the
mid-game to combat, monsters, sickness, and the occasional starvation —
varied, sensible deaths, no single mode dominating. The r13 allowance
feasted 107 times across 16 runs and the villages climbed to wave 5 in
4 of them, slowly enough to survive it.

The armed villages ate better and died younger. The duty fired 58 times,
converting 159,150 kcal of would-be rot into feasts — starvation deaths
actually FELL (21→11). But every feast bought plenty-Standing (median
plenty 180 vs 120), and Standing is what unlocks waves: 10 of 16 armed
villages hit wave 5 (vs 4 control), and wave-5 combat shredded them
(combat deaths 116 vs 62, monster 39 vs 20). They died at a median of 75
days instead of 92, before they could consolidate arc 4 and earn table
seats (1 vs 4). The duty kept its promise — it never displaced an
allowance opening and never breached the 4-day floor — but the game's
wave pacing turned the extra Standing into a death sentence. The villages
didn't starve; they got promoted into a war they couldn't fight.

Sense check: the duty's cause lines read honestly in context ("🕯️ The duty
fire burns — 22.5 days of fresh on hand and no allowance feast tonight.
The mountain gets eaten before it eats itself. (−2,900 kcal of would-be
rot)"), always AFTER the engine's feast beat. No robotic repetition
beyond the game's own feast-beat templates. The one jarring note is
cadence, not language: the duty feasted on day 28, the morning after the
allowance's day-27 feast — back-to-back feast nights, which reads as
gluttony even though each fire was "honest" by its own gate.

## Blanks filled / documented

- FILLED (then killed): the duty layer itself — built, proved RED→GREEN
  with NAIVE RED, measured against a valid paired control. Killed per
  protocol; instruments kept.
- DOCUMENTED (sim-findings backlog): the plenty-Standing → wave-unlock
  acceleration trap. Feast-driven Standing outpaces combat readiness:
  villages that earn wave 5 fast die in wave 5. Any future feast lever
  must either cap its Standing contribution or gate on combat readiness.
  Also: sentimentTaught saturates at 16/16 on the r13 substrate — the
  food-deed rung's binding constraint is feastSurgeUsed, not feast count.
- DOCUMENTED: the dead run's shared baseline (sim-feastbase-b.json) was
  invalid — pristine fingerprint, FEASTSCALE_R13 never set. Any future
  arm on this axis must measure its own paired control (done here).

## Metric review (§14)

The pre-registered primary (deeds ≥ control AND table ≥ control−1) bound
the run and both prongs missed: deeds 11 < 13, table 1 < 3. Per §14 this
is NO-GO, not re-scored. The metric was not wrong — it measured exactly
what the arm promised ("openings preserved/added") and the arm failed it:
the duty ADDED 58 feast events but LOST 2 deeds and 3 tables, because
feast events are not feast deeds and extra Standing is not extra power.

One metric-design note for the NEXT run, not this one: the allowance-feast
displacement secondary ("armed ≥ control") is confounded by differential
survival and should be re-specified as a rate (allowance feasts per 10
days alive) or as the mechanistic defer count (dlDefer), which is clean.
The G4 fixture proof remains the load-bearing zero-displacement evidence;
the aggregate count is not.

## Verdict

**KILLED AT PILOT** — NO-GO on the pre-registered primary (both prongs).
Guardrails all passed (the duty is SAFE: starvation improved, no new
death mode, floor never breached). Kill protocol executed: layer deleted
(scripts/policies/dutyalone.js), proof + det-gate + measure + sense
instruments kept (proof/sense degrade to INFO-SKIP), evidence committed.
The design lesson is real and filed: feast-rate levers must reckon with
the Standing→wave-unlock accelerator, or they will keep promoting
villages into wars they can't fight.
