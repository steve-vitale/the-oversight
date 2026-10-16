# sim-patrolassign — does proactive patrol assignment move the field-exposure death rate? (flesh-out loop ARM, 2026-10-16)

**Run:** flesh-out loop ARM sim-patrolassign, run_id fleshout-20261016T034500Z (coordinator claim), axis scale-onramp (blocking).
**Type:** LEVER ARM — policy-side layer, zero src/js. Named next from sim-fieldfightsrc's fork verdict ("the patrol blank just filed — assigning patrols is the cheapest experiment for whether proactive threat-thinning moves the 72%").
**Verdict: KILLED at pilot — PRIMARY NO-GO (0.703 vs the 0.700 bar). Layer deleted per kill protocol; evidence + instruments land.**

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sweep trajectory was observed)

**Question:** the diagnostic found post-invite monster-verb villager combat deaths are FIELD-EXPOSURE-DOMINANT (RAID 28.4%, EXPEDITION 68.9%, WILD-ENCOUNTER 2.7%) and that patrols never fire on the courtship road (resolvePatrol 0x in 60d probes). This arm assigns patrols via the leader's honest verb and measures whether proactive threat-thinning moves the field-exposure death rate.

**PRIMARY (binding):** (b)-channel field-exposure villager combat deaths per run — post-invite 'monster'-verb villager combat deaths tagged RAID/EXPEDITION/WILD-ENCOUNTER by the fieldfightsrc tagging approach, with patrol-router deaths carved into a separate PATROL channel (the diagnostic folded them; wrong once patrols fire). **GO = armed sum ≤ 0.7× control sum on identical seeds** (30% reduction). A miss is NO-GO, never re-scored.

**Substrate:** pre-seat, SEATDRIVE=0 EXPLICIT (method lesson: c004b9dd flipped the seat default ON; seatdrive.js is a composition wrapper — sweeps that don't compose it run pre-seat regardless; pre-seat runs MUST set SEATDRIVE=0 or they silently run the win-side stack). Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1; SEATDRIVE/WAVE5REACH/W3DRIVE unset. Policies: TF.leadfeast / TF.belongfeast (courtship road, matching the diagnostic).

**Seeds:** PILOT 8 seeds [205, 246, 321, 412, 523, 634, 745, 856] (the diagnostic's set, deliberate re-use — the paired control should reproduce its baseline) × {leadfeast, belongfeast} × {control, armed} = 32 runs, own paired control, identical seeds both sides. CONFIRM 12–16 fresh seeds ONLY if pilot GO. Never below 8.

**Horizon:** 180d death-aware (matches the diagnostic; the full post-invite ladder window must be observable).

**Exercise gate:** resolvePatrol must fire on armed (>0 across the sweep; 0 on control per the finding) — no-contact = kill.

**Guardrails:** national ≥ control−2; median survival ≥ control−10d; no new death mode; starvation share unchanged; exiled unchanged.

**Schema:** per-seed JSONs MUST carry numeric national/table/wins/exiled keys (schema-drift LOUD class).

**Instrument:** scripts/sweep-patrolassign-20261016.js (before/after sweep; FFS instrument + PATROL channel carve-out) · scripts/analyze-patrolassign-20261016.js (verdict) · scripts/policies/patrolassign.js — DELETED per kill protocol · scripts/test-patrolassign-20261016.js (proof; retained as the proof record, live gates skip without the layer).

**Gates before spend:** unit 20/20 RED→GREEN; SMOKE 26/26 (RED: base alone 0 patrol fires/20d both policies; GREEN: armed fires >0); DET-GATE 4/4 trajectory-identical (layer wrapped-but-OFF == base; purity proven).

## The layer (design calls, Steve can overrule) — DELETED

scripts/policies/patrolassign.js — PATROLASSIGN=1 armed, default OFF (delegated byte-identically; DET pinned it). Zero src/js. Used Game.assignTask(vid,'patrol',{via:'in-person'}) so patrols resolved through resolvePatrol → fieldFight/aidFight (real fights, canon; never outcome tables). Judgment gates: in-person only (DRIFTER lesson — assigns only at haven); cap 2/day; competence floor 1.0 (never feed lambs); HP floor 60 (above the engine's 40); trust pre-check 20 (the engine's own obedience gate for dangerous work); no wave gate (the layer didn't pick targets — whether patrollers can thin wave-3/4/5 was the empirical question); one decision beat per patrol day (no silent actions). Probe-grounded: scholar at haven at daily time 100/100 days both policies; trust ≥20 for ~9/10 villagers by day 30.

## Results

Sweep complete 2026-10-16 ~06:30 UTC: 32/32 runs finished, 0 dropped beats.

Per-seed JSONs: evidence/2026-10-16/perseed-patrolassign/ (numeric wall-metric keys) · beats: evidence/2026-10-16/patrolassign-beats/ · analyzer: scripts/analyze-patrolassign-20261016.js

### PRIMARY: NO-GO — 0.703 vs the 0.700 bar (armed 52 vs control 74)

| pair | control bChan | armed bChan | fires C | fires A | assigns A |
|---|---|---|---|---|---|
| belongfeast-s205 | 0 | 2 | 0 | 753 | 330 |
| belongfeast-s246 | 0 | 0 | 0 | 35 | 35 |
| belongfeast-s321 | 0 | 0 | 0 | 191 | 91 |
| belongfeast-s412 | 2 | 3 | 0 | 93 | 93 |
| belongfeast-s523 | 6 | 1 | 0 | 85 | 79 |
| belongfeast-s634 | 13 | 4 | 0 | 285 | 187 |
| belongfeast-s745 | 5 | 6 | 0 | 314 | 208 |
| belongfeast-s856 | 7 | 9 | 0 | 275 | 117 |
| leadfeast-s205 | 0 | 0 | 0 | 283 | 153 |
| leadfeast-s246 | 2 | 2 | 0 | 120 | 120 |
| leadfeast-s321 | 4 | 4 | 0 | 307 | 183 |
| leadfeast-s412 | 4 | 1 | 0 | 79 | 79 |
| leadfeast-s523 | 12 | 6 | 0 | 140 | 129 |
| leadfeast-s634 | 5 | 4 | 0 | 219 | 127 |
| leadfeast-s745 | 6 | 0 | 0 | 200 | 170 |
| leadfeast-s856 | 8 | 10 | 0 | 276 | 123 |
| **SUM** | **74** | **52** | **0** | **3655** | **2224** |

Ratio 52/74 = 0.703 — a 29.7% reduction against the pre-registered 30% bar. **NO-GO per §14 (never re-scored).** The paired control reproduces the diagnostic's baseline exactly (74 post-invite monster-verb deaths, same split shape) — the measurement is sound; the lever just missed.

Per-pair sign: armed better on 6 pairs, worse on 4, tied on 6 — the aggregate is driven by a few high-count pairs (s634, s523, s745), i.e. noisy. One fewer armed death (51 vs 52) would have been 0.689 → GO. This is within noise — see metric review.

### Exercise gate: PASS

Control patrol fires 0/16 (the diagnostic's finding reproduced); armed 3655 fires across 16 runs. Contact made — the blank is filled (patrols CAN fire on the courtship road; nothing in the engine prevents it, only the absence of assignment).

### Guardrails: all PASS

- national: control 11/16, armed 11/16 (need ≥ 9) ✓
- median survival: control 117d, armed 110.5d (need ≥ 107d) ✓
- no new death mode: death families identical on both arms ✓
- starvation: 3 → 8 deaths (0.5% → 1.3% share) — small absolute, noted
- exiled: 0 = 0 ✓

### The PATROL channel: the lever's own cost (28 deaths)

Armed post-invite monster-verb attribution: RAID 17 / EXPEDITION 35 / WILD-ENCOUNTER 0 / **PATROL 28** / unattributed 0. The (b)-channel fell by 22 (74→52) while patrol-router deaths added 28. Net post-invite monster-verb villager deaths: 74 → 80. **The lever moves deaths from the field to the patrol — it doesn't eliminate them.** Patrols thin (fewer wild encounters: EXPEDITION 51→35 on the diagnostic's terms) but patrollers die, mostly to the same wave-3/4/5 apexes.

### Wall numbers

| | national | table | wins | wave4+ | wave5 | median |
|---|---|---|---|---|---|---|
| armed | 11/16 | 15/16 | 0/16 | 15/16 | 9/16 | 110.5d |
| control | 11/16 | 13/16 | 0/16 | 13/16 | 6/16 | 117d |

Armed pushes slightly further (wave5 9/16 vs 6/16, invites 15/16 vs 13/16) — thinning has a real reach effect — but wins stay 0/16 on the pre-seat substrate, and the mortality cost lands on the patrollers.

### Emergent behavior: the contender-takeover amplification (filed as finding)

Patrol fires (3655) run at 2.3× patrol assigns (2224). A tracking probe (belongfeast s205, 60d: 101 assigns → 224 fires, leadDays=42) closed the math: **assigning patrols provokes contender challenges for the patrol domain** (leadershipFriction on delegation → heat → challenge → ignored 8 parts → the contender TAKES the domain per the challenge-aging rule) **and the taker patrols 3×/day as a task lead** (fires = assigns + 3×leadDays). The social system amplifies the layer beyond its 2/day cap — honest engine behavior, but it means the measured effect includes an un-designed 3×/day patrol lead, and the lead is a contender (lead-goal, not necessarily a fighter). A refined arm must decide what to do about the patrol-domain challenge: answer it, or design for the takeover.

## Sense-reads (SENSE-TESTING LAW)

Read leadfeast-s523-armed (bChan 12→6) end-to-end beats. Patrol fight beats are coherent and knowledge-gated: "⚔️ James killed the Mountain Lord alone — 3 rounds, 26 taken... Took Gravity hook off the body. The carcass is out there — haul it home before it rots." / "⚔️ Khaled stood down the Hushpuppy and kept walking — 1 round, bloodied but breathing. It's still out there, somewhere." / unnamed threats stay descriptors ("the something displaced a LOT of water", "the toad like a war drum"). Outcomes vary honestly: kills with loot and carcasses, stand-downs (wounded monster flees), quiet patrols (+1 trust). The 1–2 round wave-4/5 kills ("💀 The Reunion killed Moshe in 2 rounds. The village mourns.") read as the lethality story, not as bugs. Decision beats name names: "🛡️ Caroline posts the treeline watch — Knut walks the perimeter, eyes out for what's stirring." No duplicate-maul-beat double-fire seen (near-duplicates checked: garden/mantle/rerun template repeats only, all legitimate). No robotic patrol behavior — the same competent few (Knut, Nadia, Nikolai, Harper) walk it, which is the competence floor working, and concentrating risk on 3–4 villagers.

## Village assessment

The villages look like the diagnostic's villages — they die of combat, not hunger, on the same schedule — with one visible difference: the treeline has watches now, and the watch changes the death ledger's shape without changing its sum. Who thrives: the competent fighters (soldiers, hunters) get a named role and real kills; who dies: patrollers against wave-4/5 apexes, at 1–2 rounds a fight, plus the contender who takes the patrol domain and walks it 3×/day. What was missing: the patrol-domain challenge goes unanswered (the competent policy never answers challenges) — the takeover is emergent, not designed. The blank filled: patrols CAN fire on the courtship road (3655 fires vs the diagnostic's 0), and proactive threat-thinning moves the field-exposure rate (−30% b-channel) — but the patrollers pay for it 1:1.2, so the net village mortality doesn't move. The scale wall stands: national 11/16 both arms, wins 0/16 pre-seat.

## Metric review (§14)

The miss is 0.703 vs 0.700 — one death in 74. The threshold (30% reduction, no noise margin) was too sharp for a 16-pair pilot on a noisy count outcome; the per-pair sign split (6 better / 4 worse / 6 tied) confirms the noise. A future run should pre-register a noise-aware bar (e.g. GO ≤ 0.75 on the sum, or a per-pair sign test) — proposed for the NEXT run, not applied here. The metric itself (b-channel with the PATROL carve-out) proved sound: the paired control reproduced the diagnostic exactly, attribution stayed at 100%, and the carve-out cleanly separated the lever's mechanism cost from the field-exposure outcome. No revision to the tagging; the threshold calibration is the lesson.

## Convergence state

**killed-at-pilot.** The scale-onramp axis is not converged: patrols are now a measured lever (they thin the field but don't reduce net mortality), and the wall stands (national 11/16, wins 0/16 pre-seat, median ~111–117d). The refinement hypothesis — wave-gated patrols (don't feed patrollers to wave-4/5 apexes) and/or answering the patrol-domain challenge instead of letting the takeover run at 3×/day — is filed to the findings backlog for a future arm; it was not chased mid-run.

## Telemetry deviation check

3 LOUD lines vs the scale-wall baseline (national 12→22/32, table 16→28/32, wins 16→0/32). **EXPLAINED, not a bug** — same class as sim-fieldfightsrc's: the baseline reflects the full win-side stack (seat driver, 16/16 wins); this arm runs the pre-seat substrate (SEATDRIVE=0) where wins are 0 by construction, matching the diagnostic's same-substrate 0/16. Baseline NOT rolled forward — rolling it would corrupt the full-stack baseline with a different substrate's numbers.

## Proof artifacts (retained)

- scripts/policies/patrolassign.js — DELETED per kill protocol (the lever)
- scripts/test-patrolassign-20261016.js — proof record: unit 20/20, SMOKE 26/26 (RED→GREEN), DET 4/4 (retained; live gates skip without the layer)
- scripts/sweep-patrolassign-20261016.js — the measurement instrument (armed arm requires the layer; exits with a clear message)
- scripts/analyze-patrolassign-20261016.js — the verdict analyzer
- Per-seed JSONs: evidence/2026-10-16/perseed-patrolassign/ · beats: evidence/2026-10-16/patrolassign-beats/

## Per-seed JSONs

evidence/2026-10-16/perseed-patrolassign/ (numeric wall-metric keys: national/table/wins/exiled as numbers) · beats: evidence/2026-10-16/patrolassign-beats/
