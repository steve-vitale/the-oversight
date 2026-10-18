# sim-compvet — companion kill-opportunity layer (2026-10-18)

Run: flesh-out loop arm sim-compvet (run_id fleshout-20261018T1035Z), axis scale-onramp (the blocking axis).
Canon: docs/CANON.md + docs/MONSTER-WAVES.md (read first; design call #4 — the four readiness bars; VETERANS = living roster with wave-3+ kills; VILLAGER XP LAW). POLICY-SIDE ONLY — zero src/js changes. Composes ON vetrel (read-only, never modified).

LINEAGE: sim-vetsurvive's named next (evidence/2026-10-18/sim-vetsurvive.md — KILLED-AT-PILOT, +1 vs +3). Its verdict: "the bottleneck is veteran manufacturing rate (vetrel pipeline) and pre-window mortality" — preservation-during-deferral is NOT the lever. This arm MANUFACTURES veterans faster via the companion-veteran channel (the arming run's 2/16 wave-4 unlocks both came via companion wave-3 kills, tricktag via='companion', finding #405; vetrel went GO at pilot+confirm on companion kills, 18-0).

## The lever

`scripts/policies/compvet.js` (COMPVET=1, default OFF), composed as withCompvet(vetrelLead/vetrelBelong). VETREL=1 still required (the pipeline).

**THE ALPHA-STRIKE FINDING** (this run's diagnostic, seed 51904 vetrel-lead): the scholar's round-1 opening strike one-shots wave-3 monsters (measured: 196 pre → 306 landed vs a 291-HP redactor — Hardlight knife + FEASTED ×2.03 + PATIENT AIM ×2 + AMBUSH ×1.5, all round-1-gated). Across the vetsurvive corpus: 66 wave-3 fights, 4 vetrel yields — the yield (round ≥ 2, ≤20% HP) almost never fires because the fight ends in round 1. The scholar's optimal play (alpha-strike) IS the companion-kill bottleneck. The lever makes the scholar play a deliberate, fictionally-coherent training doctrine: blood your fighters.

Three pushes (all gated on the scholar being NON-veteran — compvet's lane; veteran-scholar fights keep vetrel's proven discipline untouched):

(a) ROUND-1 RALLY (the alpha sacrifice): on a live wave-3 fight with ≥1 engaged companion and scholar hpPct ≥ 0.5, the scholar RALLIES on round 1 (Game.tbPlayerRally — the real coalition verb, costs the turn, once per fight) instead of alpha-striking. The round-1 multipliers (patient_aim, ambush, clean_kill — all round-1-gated) are sacrificed; the allies regroup on the scholar, hold the line (hopeless-flee suppressed 3 rounds), and focus the foe nearest the scholar. Rally unavailable → honest wait (the alpha is still sacrificed).

(b) COMPANION-FIRST YIELD: from round 2 the scholar strikes normally, but HOLDS (tbPlayerWait) when the weakest live wave-3 is ≤40% maxHp and a companion is engaged. The 40% threshold (vs vetrel's 20%) is the scholar's round-2+ one-shot range (~120 dmg vs ~291 HP) — stopping earlier prevents the overshoot kill. Bounded (6 turns/fight, stall-guarded), guarded (scholar hpPct ≥ 0.5). Never fakes a kill. Sets ctx._huntCommit=true and ctx._vetYield=true (vetrel conventions).

(c) BLOODED ESCORT: vetrel breaks off at 40% for any hurt companion. A VETERAN companion (wave-3+ kill in waveKillLog) is the scarce asset — they get the escort at 55%: the scholar breaks off honestly (walk to edge + tbBarrierExit). Near-death exception (weakest wave-3 bloodied): the scholar resumes striking to END the fight instead of walking out (yield cancelled for the fight).

QUARTERMASTER (investigated, not built): no policy verb exists to hand a weapon to a companion — companions fight with their own equipped weapon (game.js:30376, half bonus in TB). vetrel's combatScore ranking already selects the best-armed companions. Documented blank.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14–15 — BINDING, written BEFORE the sweep)

**Arms** (identical seeds, 180d death-aware, own in-sweep paired control):
- control: vetrel-lead, vetrel-belong (VETREL=1, COMPVET unset)
- armed: compvet-lead, compvet-belong (VETREL=1, COMPVET=1)

The vetrel pipeline runs identically on both arms — the only difference is the companion-first doctrine.

**Substrate:** pre-seat courtship — SEATDRIVE=0 explicit, FEASTSCALE_R13=1, TRIBFLOOR=1, SUCCGRACE=1, RAIDDENSITY=1 (defercensus3/vetsurvive sibling convention).

**PRIMARY (binding):** companion wave-3 kills (via='companion', w=3 in waveKillLog) armed − control ≥ +2, OR wave-4 unlocks (maxWave ≥ 4) armed − control ≥ +1, across the 16 paired runs (8 seeds × {lead, belong}). GO → land. NO-GO → layer deleted zero-trace per kill protocol.

**Guardrails:** median survival ≥ control −10d (per policy pair); national ≥ control −2; starvation deaths ≤ control +1; no new death mode (n ≥ 3, kind-filtered person deaths only).

**Seeds:** 8 fresh — 53704, 53707, 53708, 55104, 55106, 56101, 56104, 56106 (verified 0 hits in evidence/ via grep --exclude='*.gz'). Horizon: 180d death-aware.

**Why this horizon:** the veteran-manufacturing window runs from wave-3 unlock (~day 25+) through the standing deferral (~day 50-150); 180d covers the full arc on surviving villages.

**Why this primary:** the lever's job is manufacturing veterans via the companion channel. +2 companion kills is the mechanism's direct product; +1 wave-4 unlock is the downstream gate effect. Either demonstrates the lever works.

## Proof

`scripts/test-compvet-20261018.js` — (a) 9 mechanism fixtures on a real harness game (RED: gate-off shows no yield; GREEN: round-1 rally fires, alpha-wait fallback when rally unavailable, companion-first yield at 40% with commit set, veteran-scholar lane exclusion, blooded escort trigger + honest exit, escort near-death exception, gate-off ctx purity), (b) det-gate (COMPVET unset → byte-identical to vetrel-lead on 2 fixed seeds, 60d), (c) smoke (45d gate-on run). Result: **14/14 GREEN**.

Two fixture-debug findings (kept as lessons): `tbAfterPlayerAction()` only ENDS the player's turn — advancing to the player's turn needs `tbAdvance()`; `tbBarrierExit` checks the WORLD map edge (map.px+dx), so fixtures must set a non-edge world position.

## Pilot results

32/32 runs complete (8 fresh seeds × {lead, belong} × {armed, control}), 180d death-aware, 16 paired runs. Numbers recomputed from `perseed-compvet/` + `sweep-compvet.json` during recovery (2026-10-18) — they match the worker's report exactly.

| prong | armed | control | diff | bar | verdict |
|---|---|---|---|---|---|
| companion wave-3 kills (via='companion', w=3) | 11 | 12 | **−1** | ≥ +2 | **MISS** |
| wave-4 unlocks (maxWave ≥ 4) | 0/16 | 3/16 | **−3** | ≥ +1 | **MISS** |

Guardrails (all met): median survival 115d armed / 115d control (≥ control−10 ✓); national 14 vs 12 (≥ control−2 ✓); starvation deaths 3 vs 2 (≤ control+1 ✓); no new death mode.

The mechanism ENGAGED but did not CONVERT. Doctrine telemetry (armed runs): cvRallies fired on most runs, cvYields fired on a subset (e.g. s53704: 3 rallies, 3 yields, 1 yield-fight) — the scholar did sacrifice the alpha and hold for companions. But companion wave-3 kills are rare events on this substrate (23 total across 32 runs, 16 pairs) and the armed arm produced one FEWER than control. Wave-4 unlocks went 0/16 armed vs 3/16 control — the control arm's three unlocks all came via the plain vetrel pipeline.

One real signal, report-only (not a prong): **vetDeaths armed 5 vs control 15.** The doctrine's protection half worked — veterans survived the deferral window at 3× the control rate. Manufacturing did not follow: protection without manufacturing, exactly as the worker's report states.

**VERDICT: PILOT NO-GO (KILL)** per the binding pre-registration. Both primary prongs missed; no re-scoring.

## Village assessment (plain words)

Limited — the worker left no census notes and the run timed out before the assessment was written; what follows is read from the per-seed data only.

The two arms lived the same lives: median 115 days both, national reached on 14/16 armed vs 12/16 control, deaths overwhelmingly combat (the court's usual tax). The armed villages were not safer in the aggregate — they were safer specifically for veterans (5 vs 15 vet deaths), and that protection bought nothing downstream: 0/16 wave-4 unlocks. The control arm's three unlocks are the familiar vetrel story — a companion happens to land the killing blow on a wave-3, the veteran exists, the gate clears. The doctrine tried to make that happen on purpose (rallies, yields, escorts) and the kills did not come. A village that keeps its veterans alive but cannot make new ones is still stuck at the same gate.

## Sense-testing (SENSE-TESTING LAW)

No compvet-run transcripts were captured (no transcript files exist for this arm in evidence/2026-10-18/). Stated plainly: the sense check was not performed on this arm's play. What exists is the mechanism proof (`scripts/test-compvet-20261018.js`, 14/14 GREEN), which verified the doctrine's beats are legible on a real harness game (rally fires, alpha-wait fallback, yield at 40% with commit set, veteran-scholar lane exclusion, blooded escort + honest exit, near-death exception). The beats fire; the kills don't follow.

## Metric review (§14 — binding, never re-scored)

The metric was fair and the miss is real. The primary measured the mechanism's direct product (+2 companion kills on 16 pairs) — the right thing to measure for a manufacturing lever, and the bar was modest (one extra kill per 8 pairs). The doctrine engaged (rallies/yields in telemetry) yet produced −1. This is not a measurement artifact: it is the alpha-strike finding playing out at scale — the scholar's round-1 one-shot ends wave-3 fights before the yield window opens, and sacrificing the alpha (rally/wait) lengthens fights without handing the killing blow to companions often enough to matter.

No revision proposed for a next run: the line is killed. The durable finding is the asymmetry — **veteran protection works (5 vs 15 deaths), veteran manufacturing does not** — which sharpens the #427 readiness question: the dc4 combat-readiness bar demands 2 living veterans, and keeping the ones you have alive is now a proven lever while making new ones remains the unsolved half.

## Convergence

**killed-at-pilot.** The compvet layer is NO-GO per the pre-registered primary. Kill protocol: layer deleted zero-trace (scripts/policies/compvet.js, untracked — not committed), proof test + sweep + diagnostic retained as instruments, evidence + per-seed JSONs landed. This is the third veteran-manufacturing miss in the lineage (vetdemand 4/16 flips no release; vetsurvive +1/+3; compvet −1/−3) — the manufacturing half of the veteran problem is now 0-for-3 at honest bars.

## Files

- scripts/policies/compvet.js — the layer (this run)
- scripts/test-compvet-20261018.js — proof (this run)
- scripts/sweep-compvet-20261018.js — pilot sweep (this run)
- scripts/diag-compvet-funnel-20261018.js — diagnostic (this run, not evidence)
- evidence/2026-10-18/perseed-compvet/ — per-seed JSONs (this run)
- evidence/2026-10-18/sim-compvet.md — this file
- ZERO src/js changes (policy-side only)
