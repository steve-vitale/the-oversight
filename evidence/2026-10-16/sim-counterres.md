# sim-counterres — resolution-based confirm of the landed wave-3+ counter-wiring (flesh-out loop, 2026-10-16)

**Run:** flesh-out loop, run_id fleshout-20261016T0430Z (coordinator claim; axis scale-onramp blocking).
**Type:** POLICY-SIDE arm (zero src/js changes allowed). Named lever from evidence/2026-10-16/sim-counterwire.md ("Metric review"): confirm the landed 0815Z layer (26 villagerTrickDefs + 15 field-AI gates + 3 dead perform-kind fixes) under the revised resolution metric.
**Canon:** docs/CANON.md read; docs/MONSTER-WAVES.md read (stale-vs-data drift noted in sim-counterwire.md, not re-litigated here).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sweep trajectory was observed)

**Question:** the counterwire pilot's metric was blind — it demanded counter-executed KILLS while 5 of the 15 new tricks are non-lethal by design (redactor starve-out, focus bore-out, tos dismiss, suburb leave, eulogy dismiss). Do the landed wave-3+ tricks actually RESOLVE fights under the genuine full win-side stack (seat driver genuinely composed — the 0815Z pilot ran pre-seat per the METHOD NOTE)?

**PRIMARY (binding):** w3+ trick RESOLUTIONS on the armed side ≥ 20 across the pilot sweep, where a resolution = a fight vs a known-trick species ending in (trick-attributed kill) OR (mFlee/vFlee with ≥2 trick actions in the fight's trickLog — the trick drove the outcome). Scoped to wave-3+ species: this run confirms the landed wave-3+ layer (counting w1/w2 ledger kills would confirm nothing new — the pilot already showed 40). All-wave resolutions reported as context.
**SECONDARY (binding):** mean field deaths/run WITHIN wave-3+-reached runs (armed vs identical-seed control).
**Control-expectation note (not a re-score):** the task's "(control expected ~0)" is inherited from the counterwire pilot's pre-layer base-commit control. This run's paired control is SEATDRIVE=0 on the same master code — the layer is landed on both sides — so the control is expected to show the layer's own resolution rate on long non-truncated runs, not ~0. Both sides' numbers are reported; the GO binds the armed side only.
**Guardrails (binding):** national_armed ≥ national_control − 2 · median survival armed ≥ control − 10d · no new death mode.
**Substrate:** full win-side stack FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1. Armed = seatdrive composed EXPLICITLY via scripts/policies/seatdrive.js withSeatDrive (SEATDRIVE=1 — genuinely active, not merely unset). Control = same composition, SEATDRIVE=0 (pure delegation).
**Seeds:** pilot 8 reusing the counterwire pilot's [702,703,704,705,708,709,710,719] × leadfeast — identical-seed comparability with the pilot's treatment (same layer, pre-seat). Confirm (if GO): 12 FRESH seeds × leadfeast (freshness = 0 per-seed filename hits across evidence/).
**Horizon:** 180d death-aware (dead villages stop simulating, +10d tail max). Wave-3 unlocks ~d40, wave-4 ~d76; wins truncate (seatdrive evidence: wins end ~d90 — the truncation tension is part of what this run measures).
**Gates before spend:** proof RED→GREEN (scripts/test-counterres-20261016.js, 21/21: RED = kill-only metric scores 0 on flee fixtures; GREEN = exported countResolutions on fixtures + det-gate + compose + smoke) · WRAP-DET (fieldFight capture wrapper attached vs bare byte-identical, 60d, seed 702) · SMOKE green (20d armed run: won d89, maxWave 4, resW3=0, resAll=5, nFights=101).
**Per-seed JSONs:** evidence/2026-10-16/perseed-counterres/ · beats: evidence/2026-10-16/counterres-beats/ · analyzer: scripts/analyze-counterres-20261016.js.

## The build (all policy-side / tooling)

1. **scripts/sweep-counterres-20261016.js** — the measurement sweep. Env-gated: ARM=armed requires SEATDRIVE=1 (explicit), ARM=control requires SEATDRIVE=0. Policy composed explicitly through SD.withSeatDrive(WD.withWinDefer(TF.leadfeast)). Read-only fieldFight wrapper captures per-fight records (mid, wave, outcome, trickLog, known-at-start/end) for the flee channel; kill channel reads waveKillLog trick detail (field + TB + contest + patrol + wild + agency kills all attribute via trickSummary/trickSummaryFor). Exports { oneRun, countResolutions, policyFor, attachFightCapture }.
2. **scripts/test-counterres-20261016.js** — proof: RESDEF-RED (kill-only scores 0 on two flee fixtures) → RESDEF-GREEN (countResolutions: 3 w3 + 1 w1 resolutions on fixtures; all exclusions hold: single-action flee, unknown species, vDie, evade, trickless kill) · WRAP-DET byte-identical + captures fights · COMPOSE (desc carries seatdrive; layerOn honors SEATDRIVE) · SMOKE (20d armed green, schema-valid per-seed JSON incl. resolution fields).
3. **scripts/analyze-counterres-20261016.js** — pilot/confirm analyzer: PRIMARY verdict, secondary, guardrails, per-seed table, armed w3 resolutions by species/channel.

## Results

### Pilot (8 seeds × leadfeast, armed vs identical-seed SEATDRIVE=0 control)

| metric | armed (seatdrive ON) | control (SEATDRIVE=0) |
|---|---|---|
| w3+ RESOLUTIONS (PRIMARY) | **9** (kill 0 / flee 9) | 14 (kill 0 / flee 14) |
| all-wave resolutions | 38 | 48 |
| w3+ trick executions (tally) | 15 | **30** |
| w3+ tricks known (mean/run) | 2.25 | 3.75 |
| discoveries (mean/run) | 22.8 | 25.0 |
| mean field deaths/run (w3-reached pairs, 8/8) | 25.88 | 31.88 |
| national | 8/8 | 8/8 (guardrail ≥6: OK) |
| won | 6/8 | 0/8 |
| maxWave | 5 | 5 |
| median days | 89 | 125 (guardrail ≥115: BREACH — see metric review) |
| death modes armed-only | none (OK) | — |

**Armed w3 resolutions by species/channel:** redactor/flee ×2, chorus_line/flee ×1, terms_of_service/flee ×3, spool/flee ×3.
**Armed w3 executions:** wait:redactor-quiet 7, examine 6, farewell 1, wait:algorithm-tank 1.
**Control w3 executions:** contradict 7, farewell 7, wait:algorithm-tank 2, confess 1, wait:redactor-quiet 7, examine 6 (+ spool-record 29, shout 7, dance 3).

**PRIMARY verdict: NO-GO (9 < 20).** Per the task: kill — no confirm spend.

### What the pilot actually proved

1. **The resolution metric works.** 23 w3+ resolutions measured across 16 runs (9 armed + 14 control), every one auditable in the per-seed JSONs (channel, species, outcome, trick actions, day, villager). The flee channel — invisible to the old kill-only metric — carries 100% of w3+ resolutions: zero trick-attributed w3+ kills on either side. The kill-path tricks (gavel confess→strikes, callback farewell→strikes, ad_break look-away) still don't convert to kills, confirming the counterwire pilot's read: the tricks buy survival, not damage.
2. **Cross-run replication is exact.** The control side (SEATDRIVE=0, these seeds) produced 30 w3+ executions — byte-for-byte the counterwire pilot treatment's 30 on identical seeds. The layer is real, the measurement is stable, and the pre-seat reference replicates.
3. **The seat drive truncates the trick game.** 6/8 armed runs won at ~d89 (the driver working as designed); the trick game needs d81+ to start discovering. Armed runs got 15 w3+ executions vs control's 30 — the wins eat the late game where the counter game lives. s719 is the clean demonstration: 6 resolutions on BOTH sides (the trick game fired identically pre-d89, the seat drive didn't touch it); s704 is the null case (village lost d81 both sides, drive never engaged, 0/0).
4. **The resolution rate is stack-independent.** ~47–60% of w3+ executions became resolutions on both sides (9/15 armed, 14/30 control). The seat drive changes opportunities, not the trick mechanics.
5. **Secondary directionally favorable, structurally confounded.** Field deaths 25.88 vs 31.88 within w3-reached pairs — but armed runs are shorter (wins truncate), so fewer deaths is expected. Report-only, not a signal.

## Sense-testing (SENSE-TESTING LAW)

Read live. Synthetic field fights vs known-trick species (harness, seed 719) — the narration:

- **redactor:** "goes quiet — no strikes, no shouts, nothing to redact. (1/3)" → "the quiet starves the redaction — the missing piece of the world's attacks come thin. 44 → 22." Deliberate inaction as the weapon — reads as the lateral trick working.
- **terms_of_service:** "reads the fine print — squinting at the crawling clauses. (1/2)" → "finds it — the loophole clause. '...hereby DISMISSED.' The scroll folds itself away." The Undertale beat, verbatim in the fiction.
- **eulogy:** "contradicts the narration — it says X runs — X advances." Reads as lateral play (the repeated full descriptor is the synthetic player-vid's lack of a name; real villagers have names).

From the sweep beats (s702-control, d91–94): "📖 Sari contradicts the story — a verse restored (5 remain, 1/3 true contradictions)." — a named villager performing the trick mid-fight, interleaved with audience trials ("They're sending Vex after you tomorrow") and codex discoveries ("Tom lived to tell it, twice — the village pieced it together"). The resolutions read as the trick game working, not as noise. Verdict: the non-lethal channel is the design working as Steve described it (2026-10-06).

## Village assessment

The villages that reached the trick game looked alive: named villagers (Sari, Nathan, Victor, Tom) discovering tricks through survival ("Tom lived to tell it, twice"), performing them days later, codex entries landing in the fiction. Social texture persisted around the fights — fire-circle gossip, audience trials, villagers eating apart after hard days. Nothing robotic in the sampled transcripts; the trick performances are situational (reactive gates: strike's meet_demand only when hurting, suburb's leave only round 1) rather than spammed.

Who died and why: the two armed village-losses (s704 d81, s709 d125) died to ordinary pressure, not to tricks — trick-aware morale held villagers in fights they then survived (the flee resolutions). No death mode is trick-attributed.

The blank this run fills: the measurement blank — the revised resolution metric now has a real baseline (9 armed / 14 control on 8 seeds, kill 0 / flee 23) and a proven instrument (proof 21/21, det-gate byte-identical).

## Metric review (§14)

1. **PRIMARY GO (≥20 armed) missed: 9.** Not a metric-design miss this time — the metric measured what it was built to measure, and the instrument is proven (exact cross-run replication of the 30-execution pilot number). The miss is substantive: the win-side stack truncates the trick game. Whether "tricks must survive the win" is a design question or an acceptable interaction (the trick game is a long-run system; winning at d90 is the point of the win-side stack) is a STEVE-CALL — filed in sim-findings, not decided here.
2. **Median-survival guardrail (89 vs 125, bar ≥115): BREACH — structural confound, not a kill.** The sim-seatdrive precedent (2026-10-15) pre-registered exactly this: wins truncate long runs, so the all-runs median is confounded; the matched non-winning computation is the honest one. Matched non-winning pairs here: s704 (81/81), s709 (125/125) — identical; the other 6 pairs all have an armed win. The guardrail as literally written cannot pass on a stack that wins 6/8 — it needs the seatdrive precedent's matched formulation. Proposed revision for the NEXT run: median survival computed on matched non-winning pairs only (the pre-registered wintrace method).
3. **The "(control expected ~0)" note in the task** was inherited from the counterwire pilot's pre-layer base-commit control and does not describe this run's SEATDRIVE=0 control (same code, layer landed both sides). Control showed 14 w3+ resolutions — the layer's own long-run rate. No re-scoring was done; the GO bound the armed side only, as written.
4. **Kill-channel zero on both sides** (0 w3+ trick-attributed kills in 16 runs) reinforces the counterwire metric-review point: for wave-3+, the trick game is a survival game, not a kill game. Any future GO that demands w3+ trick KILLS is misdesigned for this layer; the flee channel is the signal.

## Convergence state

scale-onramp: converging (game-code arm landed 0815Z; the resolution metric is now proven and baselined; the open question is the win-truncation interaction — steve-call filed).

**Killed at pilot per pre-registered protocol — no confirm spend.** The arm leaves no game-code trace (policy-side only); the instrument (sweep + proof + analyzer) is committed as reusable measurement infrastructure.

## Blank-fill record

- FILLED (tooling): the resolution metric — scripts/sweep-counterres-20261016.js (kill channel via waveKillLog trick detail + flee channel via read-only fieldFight capture), scripts/test-counterres-20261016.js (21/21: RED→GREEN on the revised definition, WRAP-DET byte-identical, COMPOSE, SMOKE), scripts/analyze-counterres-20261016.js (pilot/confirm analyzer with verdict).
- FILLED (measurement): w3+ resolution baseline on the genuine win-side stack — 9 armed / 14 control (8 seeds × leadfeast), all flee-channel, zero trick-attributed w3+ kills either side; exact replication of the pilot's 30 w3+ executions on the control side.
- FILLED (sense): live fight transcripts read as lateral tricks working (redactor starve, tos loophole-DISMISS, eulogy contradict); villagers perform tricks situationally and read as people.
- DOCUMENTED (not fixed — needs Steve's call): the win-side stack truncates the trick game (6/8 armed wins ~d89 vs discoveries landing d81+) — filed in sim-findings as a steve-call: is "tricks must survive the win" a design requirement or an acceptable lever interaction?
- DOCUMENTED (metric): median-survival guardrail needs the matched-non-winning formulation on win-side stacks (seatdrive precedent); "(control expected ~0)" inheritance noted.
