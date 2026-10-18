# sim-vetstaff-a — blood-list staffing ONLY, against a real control (2026-10-18)

Run: flesh-out loop arm sim-vetstaff-a (run_id fleshout-20261018T1615Z, loop A), axis scale-onramp (the blocking axis).
Canon: docs/CANON.md + docs/MONSTER-WAVES.md (read first; design call #4 — the four readiness bars; VETERANS = living roster with wave-3+ kills in state.waveKillLog; VILLAGER XP LAW — villager kills score the ledger exactly like the player's). POLICY-SIDE ONLY — zero src/js changes. New file scripts/policies/vetstaff.js (VETSTAFF=1, default OFF), guard-classified like SEATDRIVE=1. Composes on the tribfloor base (leadfeast/belongfeast), NOT on vetrel — clean attribution: an alternative production theory, not a stack.

LINEAGE: sim-vetblood (2026-10-18, KILLED-AT-PILOT) — the blood-list staffing half manufactured without the kill-steering yield: 152 hunts on 13/16 runs, 20 of 23 wave-3 kills by villagers (87%), 12/16 ever-veteran (median firstVet 72d, earliest d42) — against NO control (STEP 1 failed first: the yield's ≤20%-window premise never coincides with a scholar turn). The production delta of the staffing itself is UNMEASURED. This arm is the tracker's named next: staffing-only (blood-list hunts, no yield complexity) against a real control.

## The lever

`scripts/policies/vetstaff.js` — the staffing half of vetblood, rebuilt from the pinned API surface in scripts/test-vetblood-20261018.js (vetblood.js was deleted zero-trace per kill protocol; the hunt-leg mechanics follow the vetrel.js pattern, credited but not composed):
- **(a) Blood-list staffing**: ordered kill-candidates, living roster (never the scholar), per vetdemand rule (iii) (evidence/2026-10-17/sim-vetdemand.md): tier 0 = rule-iii proven (≥1 wave-3+ kill AND village cumulative wave-3+ kills ≥2), tier 1 = blooded/record thin, tier 2 = armor-paired (armorP ≥ 10 — per armorbreak, a naked blooding is a dead blooding), tier 3 = unarmored (listed, never staffed). The head is invited through the real inviteToParty verb (trust-20 floor + personality/goals acceptance stay the last word); a refusal is honest.
- **(b) The candidate leads; the scholar escorts**: hunt legs run ONLY with the blood-list head in the party (every 3rd day, candidate healthy ≥60, scholar healthy/fed, same-day return, wave-3 unlocked, veterans bar unmet) — deliberate thicket/ruin/forest/grove expeditions, walk up to visible wave-3 monsters via the real pathStep verbs, then come HOME.
- **(c) Normal combat only**: NO kill-steering yield. Committed staffed hunts DO mark ctx._huntCommit (competent's committed-hunt flee discipline — the escort holding the line on a deliberate hunt, not steering: no tbPlayerWait, no yield turns, no kill assignment). The fight wrapper otherwise delegates purely. JUDGMENT CALL (documented): the _huntCommit marking is part of the staffing half (a deliberate hunt holds together), not the yield; dropping it would confound "staffing works" with "the flee discipline ejects".

## Substrate (pilot)

- policy: withVetstaff(TF.leadfeast / TF.belongfeast) — TF = scripts/policies/tribfloor
- env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0, NODEWITNESS=1 (the readconfirm pure round-1 instrument, exactly as sim-vetblood.md)
- armed: + VETSTAFF=1. control: VETSTAFF unset. Identical seeds, 8 fresh.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14–15 — BINDING, written BEFORE the sweep)

**ENGAGEMENT SANITY (STEP 1, report-only — NOT a kill gate):** hunt legs fired (vetstaffHunts ≥1) in ≥4/16 armed runs. vetblood proved 13/16, so this is a sanity check that the rebuilt machinery engages; the binding gate is the PRIMARY. Control must show 0 (gate off = pure delegation).

**PRIMARY (binding, STEP 2):** ever-produced share — runs with firstVetDay != null (first day waveCombatReadiness(4).veterans ≥ demand, the engine's own VETERANS reading) — armed − control ≥ +4/16.

**Secondaries:** median firstVetDay among producers, armed ≤ control − 10d; villager wave-3+ kills (by != scholar vid — never `via`, per the mis-tag finding) armed − control.

**Guardrails:** scholar combat deaths (player, cause in combat/monster/ambush) armed ≤ control; median survival armed ≥ control − 25d; starvation deaths armed ≤ control + 1; no new death mode (n ≥ 3, kind-filtered person deaths only).

**Seeds:** 8 fresh (58101–58108 — verified filename-unused in evidence/2026-10-18/perseed-*/ before the sweep). **Horizon:** 180d death-aware (dead villages stop simulating; runDays handles this).

**Why this primary:** the lever's job is veteran MANUFACTURING — the readiness gate's binding bar. +4/16 ever-produced is the downstream production effect on the engine's own veteran reading, armed vs a real control.

**If GO at pilot:** 12-seed confirm + the balanced panel (scripts/balance-panel.js) with the compare .md attached.

**If NO-GO at pilot:** kill protocol — delete scripts/policies/vetstaff.js zero-trace, repair the proof to honest INFO-SKIP, land instruments + evidence.

## Proof

`scripts/test-vetstaff-a-20261018.js` — (a) 26 mechanism fixtures on a real harness game: gate-off purity (daily/fight delegate, zero ctx writes); blood-list ordering (tier 0 > tier 1 > tier 2/3 boundary via real armorP read + documented armorOf stubs at 15/9; scholar excluded; dead excluded; tier-3-listed-never-staffed); staffing invites the blood-list head through the real verb (accepted invites recorded; refusal honest); hunt-leg GREEN (fires with staffed healthy candidate, 3-day cooldown stamped) and RED guards (no candidate in party / candidate health <60 / cooldown — no fire); fight wrapper marks _huntCommit on staffed hunt fights only (escort holds) with tbPlayerWait NEVER called (no steering, proven), random fights keep standard discipline, gate-off pure delegation; (b) det-gate (VETSTAFF unset → byte-identical to tribfloor base, 2 fixed seeds × {lead,belong} × 60d); (c) smoke (45d gate-on run, no crash). Result: **32/32 GREEN**. Two fixture bugs caught and fixed during the run: (1) the third pickVillager could return the first villager again (vC === vA — kills3 double-counted); (2) village.health is undefined on fresh games (engine default-100 convention, game.js:5995) — the fixture's direct health assignment threw silently and the <60 guard passed vacuously; both fixed, re-run green.

## Pilot results

(FILLED AFTER THE SWEEP)

## Village assessment (plain words)

(FILLED AFTER THE SWEEP — who thrived, who died and why, what was missing)

## Sense-testing (SENSE-TESTING LAW)

(FILLED AFTER THE SWEEP — read one full transcript around the first veteran blooding)

## Village-behavior check (mission item 4)

(FILLED AFTER THE SWEEP — goals, routines, dialogue sampled from the sweeps; anything robotic flagged)

## Metric review (§14 — binding, never re-scored)

(FILLED AFTER THE SWEEP)

## Out-of-arm findings (not chased)

(FILLED AFTER THE SWEEP — appended to hidden_files/sim-findings.md in the file's format)

## Convergence

(FILLED AFTER THE SWEEP)

## Files

- scripts/policies/vetstaff.js — the layer (or DELETED per kill protocol)
- scripts/test-vetstaff-a-20261018.js — proof: 32/32 GREEN before the sweep
- scripts/vetstaff-sweep-20261018.js — pilot sweep
- scripts/vetstaff-analyze-20261018.js — two-arm analyzer
- scripts/vetstaff-transcripts-20261018.js — sense-testing probe
- evidence/2026-10-18/perseed-vetstaff/armed/ — 16 per-seed JSONs + _summary.json
- evidence/2026-10-18/perseed-vetstaff/control/ — 16 per-seed JSONs + _summary.json
- evidence/2026-10-18/sim-vetstaff-a.md — this file
- ZERO src/js changes (policy-side only)
