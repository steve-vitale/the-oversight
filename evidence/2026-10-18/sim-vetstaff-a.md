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

**PRIMARY: NO-GO — 11/16 vs 13/16 (Δ−2, bar ≥ +4). Kill protocol applies.**

32-run pilot complete, 0 errors, 180d death-aware, seeds 58101–58108 × {leadfeast, belongfeast}:

| metric | armed (n=16) | control (n=16) | bar | verdict |
|---|---|---|---|---|
| STEP 1 sanity: hunts fired ≥1 | 13/16 | 0/16 | ≥4/16, control 0 | **SANE** |
| PRIMARY: ever-veteran | 11/16 | 13/16 | Δ ≥ +4/16 | **NO-GO (Δ−2)** |
| median firstVetDay (producers) | 81 | 90 | armed ≤ control−10 | MISS (81 > 80, by 1d) |
| villager wave-3+ kills | 21 | 23 | Δ | Δ−2 |
| wave-4 unlocks | 10/16 | 11/16 | — | — |
| national / table / won | 7 / 12 / 0 | 6 / 11 / 0 | — | — |
| scholar combat deaths | 67 | 86 | armed ≤ control | ok |
| median survival (days) | 177 | 155 | armed ≥ control−25 | ok |
| starvation deaths | 5 | 4 | armed ≤ control+1 | ok |
| new death mode | alien (4), the night (3), armed-only | — | none | FLAGGED (moot — primary NO-GO) |

The layer engaged exactly as designed (13/16 hunts, 0/16 control — gate-off purity confirmed live), but the control manufactures veterans on its own: 13/16 ever-veteran, 23 villager wave-3 kills, median firstVet 90d. The staffing adds hunt volume without adding production — the bottleneck was never hunt opportunities.

Per-seed pairs (armed firstVet vs control): the layer helps on some seeds (leadfeast-s58103: 54v90; leadfeast-s58104: 62v118), hurts on others (belongfeast-s58105: 101v53; leadfeast-s58106: nullv75) — noise around a zero marginal effect, which is what Δ−2 says.

## Village assessment (plain words)

The modal armed village: staffs its blood-list head (often the first armored fighter), rides out on deliberate wave-3 hunts from ~day 40, and the villagers do the killing — 11/16 villages blood a living veteran at median day 81. The scholars escort, hold the line on committed hunts, and watch their fighters take the blows. The fiction works.

But the control villages do the same thing without any of it: 13/16 ever-veteran at median day 90, 23 villager wave-3 kills. The tribfloor/competent base policy already routes companions into wave-3 fights in normal play — companions fight, and land killing blows, on their own. The staffing layer is a more expensive way to get the same fights: the 3-day cadence, the invite overhead, the travel time — motion without marginal production.

Who thrived: the Logans and Devons — staffed candidates who fought wave-3 monsters in normal combat and landed killing blows (leadfeast-s58103's Logan: the Callback d53; Devon: the Redactor d56; first veteran d54 — the earliest blooding in this corpus). Who died: villages died at the usual rate in both arms (median survival 177 armed vs 155 control — the layer doesn't kill villages; the wave-4 overtime and the pre-window mortality take them the same). What's missing: not hunts (13/16 engaged) and not kills (21 villager wave-3 kills banked) — but any MARGINAL production over the base policy's organic companion combat. The base policy is already the veteran manufacturer on this substrate; the staffing is redundant.

## Sense-testing (SENSE-TESTING LAW)

Read: evidence/2026-10-18/vetstaff-transcripts/leadfeast-s58103.txt (d51–58 window around the d53–56 kills; re-run reproduced the sweep's kill set exactly — d53 Callback + d56 Redactor, same villager vid — determinism holds).

The d53 Callback fight is the staffing fiction working as designed: "⚔ THE CALLBACK! Logan, Devon join you!" — the scholar softens (158/76 Machete strikes), Logan and Devon chip in, Logan lands the killing blow ("Logan hits callback for 8... The Callback falls."). Then the consequences: "Logan nods, slow. 'Remind me not to cross you.'" — "📺 Logan, Devon brought down The Callback. Together. (The village watches the broadcast. Nobody blinks.)"

The d56 Redactor fight is richer: full signature mechanics (the Machete redacted for two rounds — "For two rounds it is just a shape in your hands"; "The Redactor redacts your last turn — the wound on redactor un-writes itself"), companions patching the scholar ("Devon patches you up (+12 HP). 'Hold still!'"), Logan taking a 49 hit and running ("Logan takes the hit and runs — while running still works"), Devon landing the final blow. Then the wave-4 unlock beat fires — "The MIRROR DRAFT" — and the village reacts with a genuine social consequence: "🔥 Emma, at the fire: 'We check each other now. Names, scars — the things only we know.'" (the Callback wore Carmela's face two days earlier; the village learned).

Coherent, consequential, collective — the same shape vetblood's sense-testing named. The staffing production is SENSIBLE. It just doesn't manufacture more veterans than the base policy already does.

Also confirmed in this transcript: the via='player' mis-tag on villager kills (d56 redactor by=gen_vy8vg0h via='player') — the instruments' `by`-keying correctly counted it as a villager kill, which is why the kill counts are trustworthy.

## Village-behavior check (mission item 4)

Sampled from the transcript (leadfeast-s58103, d51–58): villagers act like people. Routines are visible and differentiated — Rosa checks the pantry before heading out ("the shelves are full, ~38 days of fresh on hand… leaves the fish nets standing and turns to the stone pile instead"), pries stone, fishes; Kenneth cooks for the haven and works the smoke racks; Kenneth fetches water; Anabella forages. Leveling is personal — "◈ THE SYSTEM has been watching Devon — Combat 1. Three offers; they took War Cry. Earned, chosen." Relationships surface — "Devon and Anabella lingered over the fire together." Gossip mutates as it travels — "You catch fragments by the fire — Kenneth telling Emma about Devon. Half of it's true anymore." Language barriers hold — "Yuki speaks only 🇯🇵 Japanese. No shared words at all — just eyes, hands, and patience." Teaching happens without the player — "📚 Village knowledge: Yuki taught everyone about Tiger Nut. The Codex grows without you lifting a finger."

Minor robotic note (not chased): "Logan nods, slow. 'Remind me not to cross you.'" fires verbatim after both kills, and "The village watches the broadcast. Nobody blinks." is formulaic — ritual phrases, acceptable, but the repetition is visible across kills. Filed as a finding; the dialogue-variety lever owns it.

## Metric review (§14 — binding, never re-scored)

1. **STEP 1 sanity is SANE (13/16), not a kill gate** — per the pre-registration, vetblood proved 13/16, so engagement is sanity, not the gate. The binding PRIMARY is NO-GO (Δ−2 < +4). Not re-scored against hunts, staffing counts, or the median-firstVetDay near-miss.
2. **Balanced panel (§15) not run.** The panel is the before/after instrument for a GO lever; the primary NO-GO kills the arm at pilot. Documented, not skipped silently (same posture as vetblood).
3. **Guardrail flag, moot.** The analyzer's new-death-mode check flagged "alien" (4, armed-only) and "the night" (3, armed-only). The primary is NO-GO so the layer is killed regardless; the flag is recorded, not adjudicated. At n=3–4 on 16 runs with villager-combat deaths 108v107 (identical) and total combat 250v300, this reads as noise, not a mode — but it's flagged in the record, and a future arm on this substrate should watch it.
4. **Secondary near-miss recorded, not re-scored:** median firstVetDay 81 vs the 80 bar (armed ≤ control−10) — misses by 1 day. Villager wave-3+ kills 21v23 (Δ−2). Neither rescues the primary.
5. **Seeds:** 58101–58108, verified filename-unused in evidence/2026-10-18/perseed-*/ before the sweep. 32/32 runs, 0 errors.
6. **Determinism:** the transcript probe's re-run reproduced the sweep's wave-3 kill set exactly (d53 Callback + d56 Redactor, same vid, same days) — the harness determinism the det-gate pins holds through the full 180d.

## Out-of-arm findings (not chased)

1. **[open] 2026-10-18 — axis — THE BASE POLICY IS THE VETERAN MANUFACTURER (sim-vetstaff-a):** the tribfloor/competent control manufactures veterans on its own — 13/16 ever-veteran, 23 villager wave-3 kills, median firstVet 90d, no staffing layer. Deliberate blood-list staffing (13/16 engagement, 21 villager kills) adds hunt volume without marginal production (Δ−2). The VETERANS bar is not starved on this substrate; the manufacturing question for the axis is answered for the staffing theory — future veteran arms should look at what the base policy's organic companion combat is already doing, not at adding more hunts.
2. **[open] 2026-10-18 — telemetry — via=player MIS-TAG RE-CONFIRMED (sim-vetstaff-a):** waveKillLog d56 (leadfeast-s58103) shows via='player' with by=gen_vy8vg0h (a villager, Devon's kill on the Redactor) — the pre-tricktag mis-tagging (finding #405, sim-vetblood's open entry) still occurs. Instruments keyed on `by` vs scholar vid counted it correctly (this arm's w3VillagerKills); anything keyed on `via` undercounts companion kills.
3. **[open] 2026-10-18 — telemetry — ARMED-ONLY DEATH CAUSES "alien" (4) / "the night" (3) (sim-vetstaff-a):** the analyzer's new-death-mode check flagged two causes present armed-only at n≥3, absent in control. Moot for this verdict (primary NO-GO), and likely noise at n=3–4 (villager-combat deaths 108v107 identical) — but a future arm on this substrate should watch whether deliberate wave-3 hunts shift deaths into these causes.
4. **[open] 2026-10-18 — dialogue — KILL-CONsequence RITUAL LINES REPEAT VERBATIM (sim-vetstaff-a):** "Logan nods, slow. 'Remind me not to cross you.'" and "📺 X, Y brought down Z. Together. (The village watches the broadcast. Nobody blinks.)" fire verbatim after consecutive wave-3 kills (d53 Callback, d56 Redactor, same run). Ritual phrases are fine once; verbatim repetition across kills reads robotic. The dialogue-variety lever (lever 3) owns it.

## Convergence

**killed-at-pilot (NO-GO on the binding primary).** The vetstaff layer is KILLED per the pre-registered primary (Δ−2 < +4/16). Kill protocol: layer deleted zero-trace (scripts/policies/vetstaff.js); proof + sweep + transcripts repaired to honest INFO-SKIP (pre-kill: proof 32/32 GREEN, det-gate 4/4 byte-identical); analyzer kept (pure JSON reader, no layer dependency); evidence + per-seed JSONs (32) + the d53–56 transcript landed. The axis stays scale-onramp; the veteran bar remains the binding constraint, but the manufacturing theory is now 0-for-2 on the staffing line (vetblood's yield never engaged; vetstaff's staffing adds no marginal production over the base policy's organic companion combat). The base policy's companion channel is the thing to understand next — not another staffing variant.

## Files

- scripts/policies/vetstaff.js — DELETED per kill protocol (NO-GO on the binding primary)
- scripts/test-vetstaff-a-20261018.js — proof: 32/32 GREEN before the kill (kept, INFO-SKIP)
- scripts/vetstaff-sweep-20261018.js — pilot sweep (kept, INFO-SKIP)
- scripts/vetstaff-analyze-20261018.js — two-arm analyzer (kept; pure JSON reader, no layer dependency)
- scripts/vetstaff-transcripts-20261018.js — sense-testing probe (kept, INFO-SKIP)
- evidence/2026-10-18/perseed-vetstaff/armed/ — 16 per-seed JSONs + _summary.json
- evidence/2026-10-18/perseed-vetstaff/control/ — 16 per-seed JSONs + _summary.json
- evidence/2026-10-18/vetstaff-transcripts/leadfeast-s58103.txt — the d53 Callback / d56 Redactor transcript
- evidence/2026-10-18/sim-vetstaff-a.md — this file
- ZERO src/js changes (policy-side only)
