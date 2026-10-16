# sim-patrolwave — do wave-gated patrols move NET monster-verb mortality? (flesh-out loop ARM, 2026-10-16)

**Run:** flesh-out loop ARM sim-patrolwave, run_id fleshout-20261016T0515Z (coordinator claim, arms: sim-patrolwave / sim-winwall / sim-seatvoice), axis scale-onramp (blocking).
**Type:** LEVER ARM — policy-side layer, zero src/js. Named next from finding #393 (evidence/2026-10-16/sim-patrolassign.md).
**Verdict: KILLED at pilot — PRIMARY NO-GO (1.314 vs the 0.750 bar), plus two guardrail FAILs. Layer deleted per kill protocol; evidence + instruments land.**

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sweep trajectory was observed)

**Question:** sim-patrolassign proved patrols thin the field ((b)-channel 74→52 on identical seeds) but patrollers die to wave-4/5 apexes at ~1:1.2, so NET monster-verb villager deaths didn't move (74→80). The refinement hypothesis filed at its kill: wave-gated patrols — don't feed patrollers to wave-4/5 apexes. This arm adds the gate: patrols stand down vs wave ≥4 threats (no engagement, named beat) while still thinning wave ≤3.

**PRIMARY (binding):** NET post-invite monster-verb villager combat deaths per run = (b)-channel (RAID + EXPEDITION + WILD-ENCOUNTER) + PATROL channel, per the fieldfightsrc tagging approach with the PATROL carve-out. **GO = armed NET sum ≤ 0.75× control NET sum on identical seeds.** The 0.75 bar is noise-aware per the sim-patrolassign metric review (the 0.700 bar was one death in 74 — too sharp for a 16-pair pilot on a noisy count outcome; the per-pair sign split was 6/4/6). A miss is NO-GO, never re-scored.

**Substrate:** pre-seat, SEATDRIVE=0 EXPLICIT (finding #389: c004b9dd flipped the seat default ON — `SEATDRIVE !== '0'` drives; the sweep REQUIRES `process.env.SEATDRIVE === '0'`). Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1. Policies: TF.leadfeast / TF.belongfeast (courtship road, matching the diagnostic). PATROLWAVE=1 on armed, unset on control.

**Seeds:** PILOT 8 FRESH seeds [917, 928, 939, 104, 215, 326, 437, 548] × {leadfeast, belongfeast} × {control, armed} = 32 runs (16 pairs), own paired control, identical seeds both sides. CONFIRM 8 FRESH seeds [659, 760, 871, 982, 193, 284, 375, 466] reserved — NOT run (no confirm on NO-GO). Never below 8 pairs.

**Horizon:** 180d death-aware (matches the diagnostic; the full post-invite ladder window must be observable).

**Exercise gates:** (1) resolvePatrol fires >0 on armed, 0 on control. (2) wave-4/5 stand-downs >0 on armed — the gate must have CONTACT.

**Guardrails:** national ≥ control−2; median survival ≥ control−10d; no new death mode; starvation share unchanged; exiled unchanged.

**Schema:** per-seed JSONs MUST carry numeric national/table/wins/exiled keys (schema-drift LOUD class).

**Instrument:** scripts/sweep-patrolwave-20261016.js · scripts/analyze-patrolwave-20261016.js · scripts/policies/patrolwave.js — the layer (DELETED per kill protocol) · scripts/test-patrolwave-20261016.js (proof record; live gates INFO-SKIP without the layer).

**Gates before spend:** unit 36/36 RED→GREEN; SMOKE 43/43 (RED: base alone 0 patrol fires/20d both policies; GREEN: armed fires >0, gate wrap live, every fire routed through it); DET 4/4 trajectory-identical (layer wrapped-but-OFF == base; purity proven).

## The layer (design calls, Steve can overrule) — DELETED

scripts/policies/patrolwave.js — PATROLWAVE=1 armed, default OFF. Zero src/js. Rebuilt the patrolassign honest assignment machinery (assignTask(vid,'patrol',{via:'in-person'}), in-person only, cap 2/day, competence ≥1.0, HP ≥60, trust ≥20, best-first, one decision beat/patrol-day, no silent actions) plus the wave gate: a setup-installed wrap of Game.resolvePatrol asking the engine's own target-selection question (nearestWorldMonster at Haven, table-sanctity null-out, `mdef.wave || 1` convention); wave ≥4 → stand down (named 🛡️ beat, knowledge-gated via monsterNoun, +1 trust, no fieldFight, counted on ctx.pwStanddowns); everything else delegates to the engine untouched.

Contender-takeover decision (finding #392): DESIGNED FOR — the gate is resolution-side (wraps resolvePatrol globally), so any contender-led patrols are gated too. Suppressing the takeover would fight the social sim; answering the challenge would rewrite the competent policy's identity. (As it happened, the takeover did not recur on these seeds: patrolLeadEver 0/16, fires 1.31× assigns vs 1.64× before — the design-for-it choice was untested by events, which changes nothing about the verdict.)

## Results

Sweep complete 2026-10-16 ~07:10 UTC: 32/32 runs finished, 0 dropped beats, exit 0.

Per-seed JSONs: evidence/2026-10-16/perseed-patrolwave/ (numeric wall-metric keys) · beats: evidence/2026-10-16/patrolwave-beats/ · analyzer: scripts/analyze-patrolwave-20261016.js

### PRIMARY: NO-GO — 1.314 vs the 0.750 bar (armed 67 vs control 51)

| pair | control NET | armed NET | bChan C→A | pat C→A | fires C→A | sd A |
|---|---|---|---|---|---|---|
| belongfeast-s104 | 6 | 4 | 6→3 | 0→1 | 0→110 | 3 |
| belongfeast-s215 | 1 | 4 | 1→4 | 0→0 | 0→157 | 10 |
| belongfeast-s326 | 7 | 8 | 7→8 | 0→0 | 0→106 | 7 |
| belongfeast-s437 | 5 | 1 | 5→1 | 0→0 | 0→522 | 4 |
| belongfeast-s548 | 5 | 6 | 5→6 | 0→0 | 0→219 | 19 |
| belongfeast-s917 | 0 | 5 | 0→5 | 0→0 | 0→146 | 3 |
| belongfeast-s928 | 1 | 0 | 1→0 | 0→0 | 0→77 | 0 |
| belongfeast-s939 | 2 | 0 | 2→0 | 0→0 | 0→33 | 0 |
| leadfeast-s104 | 6 | 3 | 6→3 | 0→0 | 0→92 | 0 |
| leadfeast-s215 | 5 | 5 | 5→5 | 0→0 | 0→165 | 34 |
| leadfeast-s326 | 3 | 9 | 3→9 | 0→0 | 0→150 | 22 |
| leadfeast-s437 | 4 | 5 | 4→5 | 0→0 | 0→268 | 6 |
| leadfeast-s548 | 0 | 6 | 0→6 | 0→0 | 0→185 | 7 |
| leadfeast-s917 | 0 | 0 | 0→0 | 0→0 | 0→72 | 0 |
| leadfeast-s928 | 4 | 11 | 4→11 | 0→0 | 0→108 | 8 |
| leadfeast-s939 | 2 | 0 | 2→0 | 0→0 | 0→27 | 0 |
| **SUM** | **51** | **67** | **51→66** | **0→1** | **0→2437** | **123** |

Ratio 67/51 = 1.314 — armed is 31% WORSE. **NO-GO per §14, not close.** Per-pair sign: armed better 6 / worse 8 / tied 2.

Decomposition: the gate WORKED mechanically — PATROL channel 0→1 (vs 28 ungated last run), 123 stand-downs observed. But the (b)-channel ROSE 51→66, driven by EXPEDITION (armed attribution: RAID 18 / EXPEDITION 47 / WILD-ENCOUNTER 1 / PATROL 1). The stand-down preserves the threat it refuses to fight.

### Exercise gates: both PASS

Control patrol fires 0/16; armed 2437 fires. Wave-4/5 stand-downs 123 on armed — the gate had contact (it met apexes and stood down, exactly as designed).

### Guardrails: two FAILs

- national: control 14/16, armed 8/16 (need ≥ 12) ✗ FAIL
- median survival: control 132.5d, armed 93.5d (need ≥ 122.5d) ✗ FAIL (−39d)
- starvation: 6 → 19 deaths (1.0% → 3.5% share) — tripled, flagged
- new death mode: analyzer flagged 'other' (1 death, belongfeast-s548-armed) — INVESTIGATED, not new: the sim-patrolassign sweep had 5 'other' deaths including 4 on CONTROL runs (belongfeast-s856-control ×3, leadfeast-s634-control ×1). Recurring classifier fallback on this substrate, not an arm-introduced mode. Guardrail holds with that note.
- exiled: 0 = 0 ✓

### Wall numbers

| | national | table | wins | wave4+ | wave5 | median |
|---|---|---|---|---|---|---|
| armed | 8/16 | 12/16 | 0/16 | 12/16 | 7/16 | 93.5d |
| control | 14/16 | 14/16 | 0/16 | 14/16 | 10/16 | 132.5d |

Armed villages die younger, reach less, and starve more. The wall stands; the arm pushed it the wrong way.

## Mechanism autopsy: the stand-down preserves the threat

The smoking gun is belongfeast-s104-armed's beat sequence: d58 "💀 The Suburb killed Greta in 2 rounds" → d61 "🛡️ Dmitri spots the The Suburb ranging the treeline — apex work, not patrol work. The patrol stands down and holds the watch." → d68 "💀 The Algorithm killed Paula in 1 round" → d70/d71 two more stand-downs vs The Suburb → d71 "💀 The Suburb killed Hazel in 1 round."

The Suburb (wave-4) ranged the treeline for two weeks. Every patrol part stood down correctly — and the apex killed villagers anyway. The ungated patrols' value was never patroller survival; it was THINNING. They removed apexes from the field at patroller cost (28 patrol deaths buying the 74→52 b-channel drop). The gate removed the price AND the thinning: apexes roam, expeditions walk into them (EXPEDITION 47 armed), and the patrol burns parts on +1-trust stand-downs instead of food work (starvation 6→19).

The refinement hypothesis is falsified, cleanly and for a reason: **there is no free lunch on the patrol axis — thinning apexes costs villager lives, and refusing to pay it costs more.** The patrol line is now exhausted on both sides (ungated: net 74→80; gated: net 51→67 with guardrail failures).

## Sense-reads (SENSE-TESTING LAW)

Read leadfeast-s215-armed (34 stand-downs) and leadfeast-s326-armed (patrol fights) end-to-end.

Stand-downs read as sensical person-decisions: "🛡️ Owen spots the The Suburb ranging the treeline — apex work, not patrol work. The patrol stands down and holds the watch." / "🛡️ The The Suburb is moving on the treeline. Benjamin waves the patrol back — live to warn the village, not feed the thing. Stand down." A person choosing not to feed themselves to an apex. Three rotating lines, no robotic repeat. Early-game honest beats when nobody qualifies: "nobody fit to walk it today" / "nobody takes it up today" (trust/competence floors biting before day ~11).

Wave ≤3 patrol fights read as real fights, knowledge-gated: "⚔️ Penelope killed the raccoon with too many fingers alone — 2 rounds, 19 taken." / "⚔️ Dieter stood down the creek went still and kept walking — 4 rounds, bloodied but breathing." / "⚔️ Mateo killed the Moderator alone — 5 rounds, 24 taken. Took Genesis seed off the body." (The wave-2 apex engaged and killed at real cost — the gate correctly lets wave ≤3 through.) Unnamed villagers render as descriptors ("A woman, maybe 30s stood down the absence of sound") — personlike.

Two beat-text defects filed (both die with the layer; documented for the next arm):
1. **"A and A walk the perimeter"** — my layer's `displayName(vid).split(' ')[0]` renders unknown villagers as "A" (displayName returns "A …" for the unnamed). Same bug class as the havenNeedGossip 'A' fix that is this worktree's HEAD commit — I repeated it. Next arm: use the full displayName/descriptor, never first-word split.
2. **"the The Suburb"** — double article when monsterNoun returns an already-proper name. The engine's own resolvePatrol has the same wart ("faced the ${mName}"); pre-existing convention, not mine to fix in a policy layer.

## Village assessment

Armed villages look like villages that posted a watch and then watched it fail: the treeline has patrols (2437 fires, 1861 layer assigns), the competent few walk it (Wei, Hassan, Priya, Dieter, Mateo — the competence floor concentrating risk honestly), wave-1/2 threats get thinned with real kills and loot, and wave-4/5 apexes get watched — while they kill the expedition crews. Who dies: expedition villagers to un-thinned apexes (The Suburb, The Algorithm — 1-round kills), plus the familiar combat grind. Who thrives: nobody in particular — the opportunity cost lands everywhere (starvation tripled; the patrol eats food-work parts from the most competent villagers and returns +1 trust). What was missing: nothing the patrol can provide — the threat needs REMOVING (kills, counters, driving it off), not watching. The blank is filled twice over: patrols thin (proven), patrollers die doing it (proven), and watching instead of thinning is worse (proven). The scale wall stands: national 8/16 armed, wins 0/16 pre-seat.

## Metric review (§14)

The 0.75 noise-aware bar worked exactly as designed: this is not a near-miss (1.314 vs 0.750), it's a genuine negative, and the metric caught it without ambiguity. The NET construction (b-channel + PATROL) proved its worth over the prior run's b-channel-only primary — it measures the village's total monster-verb mortality, which is what the wall cares about. No revision proposed: the metric did its job, the bar was honest, the kill is clean. One process note for future arms: the guardrail failures (national −6, survival −39d) were louder than the primary — on noisy count primaries, guardrails are the backstop, and they fired.

## Convergence state

**killed-at-pilot.** The scale-onramp axis is not converged. The patrol line is now exhausted on both sides: ungated patrols (sim-patrolassign) thin the field but don't reduce net mortality (74→80); wave-gated patrols (this arm) protect patrollers but worsen net mortality (51→67) and damage the village (national −6, survival −39d, starvation ×3). The mechanism lesson is durable: patrol value = apex thinning, and thinning apexes costs villager lives — there is no free lunch via patrol assignment. Named next (backlog, not chased): killing apexes without feeding villagers to them is the counter/trick game (wave-1/2 counters exist; waves 3–5 counterplay is engine-real but unwired to the ledger), or keeping expeditions away from known apex locations (map-memory-informed routing). Filed to sim-findings.

## Telemetry deviation check

(to be run after evidence is written — see below)

## Proof artifacts (retained)

- scripts/policies/patrolwave.js — DELETED per kill protocol (the lever)
- scripts/test-patrolwave.js — proof record: unit 36/36, SMOKE 43/43, DET 4/4 (live gates INFO-SKIP without the layer)
- scripts/sweep-patrolwave-20261016.js — the measurement instrument (armed arm requires the layer; exits with a clear message)
- scripts/analyze-patrolwave-20261016.js — the verdict analyzer
- Per-seed JSONs: evidence/2026-10-16/perseed-patrolwave/ (numeric wall-metric keys) · beats: evidence/2026-10-16/patrolwave-beats/

## Per-seed JSONs

evidence/2026-10-16/perseed-patrolwave/ (numeric wall-metric keys: national/table/wins/exiled as numbers) · beats: evidence/2026-10-16/patrolwave-beats/
