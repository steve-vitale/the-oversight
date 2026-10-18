# sim-vetblood — blood-list expedition staffing (2026-10-18)

Run: flesh-out loop arm sim-vetblood (run_id sim-vetblood pilot), axis scale-onramp (the blocking axis).
Canon: docs/CANON.md + docs/MONSTER-WAVES.md (read first; design call #4 — the four readiness bars; VETERANS = living roster with wave-3+ kills in state.waveKillLog; VILLAGER XP LAW — villager kills score the ledger exactly like the player's). POLICY-SIDE ONLY — zero src/js changes. New file scripts/policies/vetblood.js (VETBLOOD=1, default OFF), guard-classified like SEATDRIVE=1. Composes on the tribfloor base (leadfeast/belongfeast), NOT on vetrel — clean attribution: this is an alternative production theory, not a stack.

LINEAGE: vetwindow (2026-10-18) — the veteran leg binds on PRODUCTION (median 16.5d to blood the first living veteran, 8/16 runs never do); 8/8 veteran deaths are scholar successions — villager veterans SURVIVE. Three protection kills (vetsurvive, compvet-protection, deferguard — all KILLED-AT-PILOT): the bind is veteran MANUFACTURING + pre-window mortality, not protection. vetrel's companion channel manufactures but the scholar still lands most killing blows (scholar-first: non-veteran scholar commits and fights for their own kills; yield fires only once the scholar is blooded).

## The lever

`scripts/policies/vetblood.js` — villager-first blooding, different IN KIND from vetrel and the 3 protection kills:
- **Blood-list staffing**: the hunt is staffed through the BLOOD LIST — ordered kill-candidates, living roster villagers (never the scholar), per vetdemand rule (iii): tier 0 = rule-iii proven (≥1 wave-3+ kill AND village cumulative ≥2), tier 1 = blooded/record thin, tier 2 = armor-paired candidates (armorP ≥ 10 — per armorbreak, a naked blooding is a dead blooding), tier 3 = unarmored (listed, never staffed).
- **The candidate leads; the scholar escorts**: the hunt leg runs ONLY with the designated candidate in the party (every 3rd day, candidate healthy ≥60, scholar healthy/fed, same-day return).
- **Kill-steering in TB**: the scholar softens the wave-3 monster (base combat), then HOLDS (real tbPlayerWait) at near-death (≤20%) so the candidate's turns land the killing blow — from the very first hunt, UNGATED on scholar veteran status. Bounded (6 yield turns/fight, 2-turn stall cut), guarded (scholar hp ≥50%, round ≥2, candidate ≥40% else the escort fights = rescue). Sets ctx._huntCommit (competent's committed-hunt flee discipline).

## Substrate (pilot)

- policy: withVetblood(TF.leadfeast / TF.belongfeast) — TF = scripts/policies/tribfloor
- env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0, NODEWITNESS=1 (the readconfirm pure round-1 instrument, exactly)
- armed: + VETBLOOD=1. control: VETBLOOD unset. Identical seeds, 8 fresh.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14–15 — BINDING, written BEFORE the sweep)

**ENGAGEMENT GATE (binding, STEP 1):** kill-steering engages (ctx vetYields ≥ 1) in ≥ 4/16 armed runs. Miss → KILL at pilot — delete scripts/policies/vetblood.js zero-trace, land instruments + evidence. Do NOT spend confirm seeds on a mechanism that never fires. Leading indicator (report-only): hunt leg fires (vetbloodHunts ≥ 1) in ≥ 4/16.

**PRIMARY (binding, STEP 2):** ever-produced share — runs with firstVetDay != null (first day waveCombatReadiness(4).veterans ≥ demand(1), the engine's own VETERANS reading) — armed − control ≥ +4/16.

**Secondary:** median firstVetDay among producers, armed ≤ control − 10d; villager wave-3+ kills (by != scholar) armed − control.

**Guardrails:** scholar combat deaths (player, cause in combat/monster/ambush) armed ≤ control; median survival armed ≥ control − 25d; starvation deaths armed ≤ control + 1; no new death mode (n ≥ 3, kind-filtered person deaths only).

**Seeds:** 8 fresh (57101–57108 — verified filename-unused in evidence/2026-10-18/perseed-*/ before the sweep). **Horizon:** 180d death-aware (dead villages stop simulating; runDays handles this). The release window opens at Standing ≥ 100 (typically day 50–80); 180d covers the full deferral arc.

**Why this primary:** the lever's job is veteran MANUFACTURING — the gate's binding bar. +4/16 ever-produced is the downstream production effect on the new 1-veteran bar.

**If GO at pilot:** run the balanced panel (scripts/balance-panel.js) and attach the compare .md.

## Proof

`scripts/test-vetblood-20261018.js` — (a) 15 mechanism fixtures on a real harness game: gate-off purity (daily/fight delegate with zero ctx writes), blood-list ordering (tier 0 > tier 2 > tier 3, scholar excluded, dead excluded), staffing invite via the real verb (attempt recorded; refusal is the verb's honest answer), pickSteerTarget decisions (candidate engaged + near-death → steer; not near-death / candidate hurt / no candidate / gate off → base combat), yield bounds (6-turn cap, 2-turn stall cut); (b) det-gate (VETBLOOD unset → byte-identical to tribfloor base, 2 fixed seeds × {lead,belong} × 60d); (c) smoke (45d gate-on run, no crash). Result: **21/21 GREEN**. One fixture bug caught and fixed during the run: the monster-id 'the_redactor' doesn't exist (real id is 'redactor') — the steering GREEN initially never fired and the REDs passed vacuously; the debug probe caught it before the sweep.

## Pilot results

**ENGAGEMENT GATE: KILLED — 2/16 armed runs engaged (bar ≥ 4/16). Kill protocol applies.**

32-run pilot planned; STEP 1 judged on the 16 armed runs (control never run — STEP 2 not reached). 16/16 armed runs complete, 0 errors, 180d death-aware, seeds 57101–57108 × {leadfeast, belongfeast}:

| metric | armed (n=16) | bar | verdict |
|---|---|---|---|
| engagement (kill-steering yields ≥1) | 2/16 | ≥ 4/16 | **KILL** |
| hunts fired (vetbloodHunts ≥1) | 13/16 | report | 152 hunts total |
| staff invites ok | 56 | report | — |
| steering fights (candidate engaged) | 24 | report | 9/16 runs |
| ever-veteran (firstVetDay != null) | 12/16 | — | median firstVet 72d (42–107) |
| villager wave-3+ kills | 20/23 | — | 87% of all w3 kills |
| wave-4 unlocks | 10/16 | — | — |
| national / table | 10/16 / 12/16 | — | — |
| village-lost | 5/16 | — | d34, d47, d90, d93, d121 |

The two engaging runs: belongfeast-s57106 (Y=1, w3v=4, firstVet=42) and leadfeast-s57108 (Y=2, w3v=1, firstVet=90).

**Why the yield doesn't fire.** The kill-steering yield triggers when the weakest live wave-3 monster is ≤20% HP at the START of a scholar turn (round ≥2, scholar ≥50%, candidate ≥40%). In real fights that window never opens: the staffed candidate (tier 0/2, a competent fighter) closes from above 20% on their own turns, or the scholar's softening strike lands the killing blow itself. The mechanism is proven (proof fixture A4: the yield fires correctly when the window occurs) but the premise — the ≤20% window coinciding with a scholar turn — is false in practice. Same class as deferguard's kill: proven mechanism, false premise on this substrate.

**What DID engage.** The blood-list staffing + hunt legs fired hard (152 hunts on 13/16 runs, 56 accepted staff invites) and routed kills to villagers: 20 of 23 wave-3 kills (87%) were landed by villagers, 12/16 runs blooded a living veteran. The production happened through normal combat with the candidate in the fight — not through the yield. The yield was designed to be the steering; the staffing was sufficient without it.

## Village assessment (plain words)

The modal armed village: staffs its blood-list head (often the first armored fighter), rides out on deliberate wave-3 hunts from ~day 40, and the villagers do the killing — 12/16 villages blood a living veteran at median day 72. The scholars escort, soften, and watch their fighters take the blows. Five villages died trying (two early, d34/d47 — the pre-window mortality the bind names; three mid, d90–d121). Ten reached national, ten unlocked wave 4, twelve reached the table. Nobody won in 180d on this pre-seat substrate.

Who thrived: the Ilkers — staffed candidates who became the village's blooded (belongfeast-s57106's Ilker: 2 wave-3 kills d42–43, first veteran at d42, the earliest blooding in the corpus). Who died: the early villages (d34, d47) before the window even opened, and three mid-game villages in the wave-4 overtime. What's missing: not kills (20 villager wave-3 kills banked) — but the yield mechanism that was supposed to steer them, which never engaged.

## Sense-testing (SENSE-TESTING LAW)

Read: evidence/2026-10-18/vetblood-transcripts/belongfeast-s57106.txt (d40–45 window around the d42–43 kills; re-run reproduced the sweep's 4 wave-3 kills exactly — determinism holds).

The d42 Spool fight is the staffing fiction working as designed: "⚔ SPOOL! Ilker joins you!" — the scholar softens (59/60/63 Machete strikes), Elif and Ilker chip in, and Ilker lands the killing blow ("Ilker strikes the Spool... Ilker hits spool for 7. The Spool falls."). The scholar NEVER yielded — this kill came from normal combat with the candidate in the fight. Then the consequences: "Elif nods, slow. 'Remind me not to cross you.'" — "You came back bloody. Nobody asks. Someone saves you the good seat by the fire." — "📺 Ilker, Elif brought down Spool. Together. (The village watches the broadcast. Nobody blinks.)" — and the next day at the fire: "You catch Minh telling the fire about Ilker. 'Ilker, Elif brought down Spool. Together.' The story's already growing."

Coherent, consequential, collective — the village remembers kills as shared history (the same shape vetdemand's sense-testing named). The staffing production is SENSIBLE. The yield's absence changes nothing in the fiction — nobody waits for a yielded blow; the candidate just kills.

## Metric review (§14 — binding, never re-scored)

1. **Engagement miss is KILL, not re-scored.** 2/16 < 4/16. The kill-steering mechanism is proven (21/21 proof) but doesn't engage in real fights. Not re-scored against hunts, staffing, or the villager-kill production — those are findings, not the gate.
2. **Balanced panel (§15) not run.** The pre-registered STEP 1 instrument is the engagement gate; the panel is the STEP 2 before/after instrument. STEP 1 failed, so no control arm ran and there is no before/after to panel. Documented, not skipped silently.
3. **No control arm.** Per the kill protocol: do not spend confirm seeds on a lever that never fires. All production numbers above are armed-only, report-only — no delta claims.
4. **Seeds:** 57101–57108, verified filename-unused in evidence/2026-10-18/perseed-*/ before the sweep. 16/16 runs, 0 errors.
5. **Determinism:** the transcript probe's re-run reproduced the sweep's wave-3 kill set exactly (4 kills, same days/vids) — the harness determinism the det-gate pins holds through the full 180d.
6. **scholarCombatDeaths=60 armed** — report-only (no control). Not a guardrail verdict.

## Out-of-arm findings (not chased)

1. **[open] 2026-10-18 — axis — STAFFING-WITHOUT-YIELD MANUFACTURES (sim-vetblood):** the blood-list staffing layer (blood-list head in party + deliberate wave-3 hunts) produced 20 villager wave-3 kills across 16 runs (87% of all w3 kills) and 12/16 ever-veteran WITHOUT the yield ever firing. The yield's ≤20% trigger never coincides with scholar turns — candidates close in normal combat. A future arm could test staffing-only (no yield complexity) as the production lever against a real control. The fiction is already excellent (the d42 Spool transcript).
2. **[open] 2026-10-18 — telemetry — via=player mis-tag on villager kills (sim-vetblood):** waveKillLog entries d76/d83 (belongfeast-s57106) show via='player' with by=gen_a4l4owr (a villager) — the pre-tricktag mis-tagging (finding #405) still occurs on some kill paths. Death-count instruments keyed on `via` undercount companion kills; key on `by` vs scholar vid instead (as this arm's w3VillagerKills does).

## Convergence

**killed-at-pilot.** The vetblood layer is KILLED per the binding engagement gate (2/16 < 4/16). Kill protocol: layer deleted zero-trace (scripts/policies/vetblood.js); proof + sweep + transcript instruments kept as historical record with INFO-SKIP guards (same convention as deferguard/vetsurvive); evidence + per-seed JSONs + the d42 transcript landed. The axis stays scale-onramp; the veteran bar remains the binding constraint. The open question is now sharper: veteran MANUFACTURING via staffing works (12/16 ever-veteran, 20 villager kills) — but this run's steering mechanism doesn't engage, and the production delta vs control is unmeasured. The staffing-only arm is the named next.

## Files

- scripts/policies/vetblood.js — DELETED per kill protocol (KILLED-AT-PILOT)
- scripts/test-vetblood-20261018.js — proof: 21/21 GREEN before the kill (kept, INFO-SKIP)
- scripts/vetblood-sweep-20261018.js — pilot sweep (kept, INFO-SKIP)
- scripts/vetblood-analyze-20261018.js — two-arm analyzer (kept; needs both arms)
- scripts/vetblood-transcripts-20261018.js — sense-testing probe (kept, INFO-SKIP)
- evidence/2026-10-18/perseed-vetblood/armed/ — 16 per-seed JSONs + _summary.json
- evidence/2026-10-18/vetblood-transcripts/belongfeast-s57106.txt — the d42 Spool kill transcript
- evidence/2026-10-18/sim-vetblood.md — this file
- ZERO src/js changes (policy-side only)
