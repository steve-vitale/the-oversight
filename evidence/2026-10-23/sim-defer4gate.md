# sim-defer4gate — WAVE-5 GATE: defer4 + stand-raw named bar-by-bar (run fleshout-20261023T1215Z, axis scale-onramp)

Coordinator-run DIAG arm (instrument-only, ZERO src/js, ZERO new sims). Namespaces: defer4gate-*.
Canon: docs/CANON.md + docs/MONSTER-WAVES.md read first; the gate design lives in
src/js/game.js:30670 unlockedWave() + src/js/standing.js:171 villageStandingTotal(),
:209 waveCombatReadiness(), :338 waveUnlockReady(4). Decompositions use the
committed instrument scripts/w5gates-lib.js (gateVector/attribute — PURE, no
harness writes).

## PRE-REGISTRATION (§14 binding — set at run start, before any analysis)
- **BINDING QUESTION (tracker's named next from sim-doorcensus-armor):** with
  defer5 cleared, defer4 (3/12) and stand-raw (4/12) surface as the next wall
  segments. Name each binding bar-by-bar (defer5gate precedent).
- **DIAG-GO (binding):** >=90% of defer4-bound + stand-raw-bound configs in the
  doorcensus corpus (24 configs: seeds 65511–65522 x {control=ARMORYDRIVE=1,
  armed=ARMORYDRIVE=1+ARMORVILLAGE=1}) attributed to NAMED sub-conditions.
- A miss is **insufficient-data, not a failure** — this is a DIAG arm.
- **OFFLINE-FIRST:** the retained corpus was inspected for defer4/stand-raw
  granularity BEFORE any new sims. The per-seed JSONs carry demand4, barRelease4
  (days each r4 bar was short) and the full gateVector — the offline route
  SUCCEEDED. No fresh census ran.
- §15 panel: no new sims — the corpus is the doorcensus-armor sweep, already
  paneled in sim-doorcensus-armor.md.

## Results — DIAG-GO: 11/11 bindings attributed (100%)

Corpus bindings (doorcensus-armor-summary.json): control {defer5:7, stand-raw:2,
w3rung:1, defer4:2}, armed {defer5:3, stand-raw:4, defer4:3, opened:2}.
Recomputed via w5gates-lib attribute() on the stored gateVectors — matches the
summary exactly. demand4 = {armored:3 @P>=10, armed:5, tricks:3, veterans:1}.

### defer4: 5/5 = VETERANS — 1 living wave-3+ killer, the SOLE short bar

| cfg | raw | r4 (armored/armed/tricks/vet) | short | rel4 days-short |
|---|---|---|---|---|
| control s65513 | 282 | 9/9/22/0 | [veterans] | armored 2, armed 2, tricks 8, veterans NEVER |
| control s65515 | 302 | 2/3/20/0 | [armor,weapons,veterans] | 2/2/11/veterans NEVER |
| armed s65513 | 342 | 10/10/23/0 | [veterans] | 2/2/8/veterans NEVER |
| armed s65514 | 242 | 8/8/21/0 | [veterans] | armored 48, 2/10/veterans NEVER |
| armed s65522 | 322 | 9/9/20/0 | [veterans] | armored 32, 2/5/veterans NEVER |

Armor/weapons/tricks sit 2–3x above demand on every config. The r4 binder is
veterans on 5/5 — the same veterans thread as the r5 universal binder, one
rung down. barRelease4 veterans=null means the bar never released on ANY of
these 5 configs (no wave-3+ killer ever lived long enough to count).

### stand-raw: 6/6 attributed — the diplomatic layer never engaged

stand-raw = raw standing < t5 (200) at the door check.

| cfg | raw | composition (war/dip/plenty) | warPts/links/feasts | named cause |
|---|---|---|---|---|
| control s65511 | 25 | 25/0/0 | 1/0/0 | dip+links zero; died d79 |
| control s65518 | 110 | 50/0/60 | 2/0/3 | dip+links zero; war+plenty cap at 110 |
| armed s65512 | 0 | 0/0/0 | 0/0/0 | village-lost d75 (starvation 4) before any standing |
| armed s65518 | 65 | 25/0/40 | 1/0/2 | dip+links zero |
| armed s65519 | 185 | 25/0/160 | 1/0/8 | dip+links zero; 8 feasts still 15 short |
| armed s65521 | 180 | 100/0/80 | 4/0/4 | dip+links zero; 4 warPts+4 feasts cap at 180 |

dip=0 AND links=0 on all 6. Standing built only via war + plenty caps at
0–185 — short of 200. Contrast the two OPENED doors (armed s65515/s65516):
raw=477/732 with dip=102 + links=3 + plenty=300/480 (15/24 feasts).

### Peak-ratchet grandfathering (context, not a binding)
The opened doors show r4/r5 NOT ready at end of run (veterans=0, armor 0–2):
the door opened when the defer5 bar briefly released (d80/d88 armed, per the
doorcensus review) and STAYED open while veterans died and armor decayed —
the one-way peak ratchet grandfathers the release. The wave-5 door is a
momentary coincidence, not a sustained state.

## Sense verdict — EARNED
The numbers compose into a coherent story: the defer4 rung asks "do you have
even ONE blooded fighter alive right now" and the answer is no on 5/5; the
stand-raw gate asks "are you a regional power" and villages that never
diplomatize or link cap out fighting and feasting. Both are people-shaped
blanks (fighters who live, diplomats who link), not math bugs.

## Blanks filled / documented
- FILLED (measured): defer4 = veterans 5/5; stand-raw = dip+links zero 6/6.
- DOCUMENTED (evidence, no design call made): the veterans thread now binds at
  BOTH rungs (r4: 1 veteran on 5 configs; r5: 2 veterans, the defer5 universal
  binder) — formation is the lever; sim-vetformation (same run) attacks it.
- DOCUMENTED: stand-raw names the diplomatic/regional engine (dip + links,
  lever-8 territory) as the standing source — the next wall segment after
  defer4. Candidate next arm: lever-8 link-formation DIAG/lever.
- steve-call (design): should the r4 deferral re-check like a held gate, or
  ratchet like the release? Currently the RELEASE grandfathers (door stays
  open after veterans die) while defer4's readiness re-evaluates — asymmetric
  by implementation, not by stated design.

## Metric review
The pre-registered bar (>=90% named attribution, offline-first) held. The
offline route succeeded beyond the defer5gate precedent: the doorcensus sweep
already retained demand4/barRelease4, so no new sims were needed. No metric
revision proposed.

## Wall numbers (this corpus, unchanged — DIAG arm moves no levers)
control: national 8/12, table 8/12, wins 0/12, wave4 9/12, wave5 0/12, median 141d.
armed: national 8/12, table 8/12, wins 0/12, wave4 8/12, wave5 2/12 (doors), median 179.5d.
