# sim-trickfunnel — the trick-execution funnel census (flesh-out loop DIAGNOSTIC, 2026-10-16)

**Run:** flesh-out loop, run_id fleshout-20261016T2315Z (coordinator claim live: arms sim-reposition / sim-vetrel / sim-trickfunnel; axis scale-onramp blocking). Sibling arm sim-reposition owns the policy lane (reposition.js); sim-vetrel owns the veteran-reliability lane. Zero file overlap by claim.
**Type:** READ-ONLY DIAGNOSTIC INSTRUMENT. ZERO src/js changes. ZERO scripts/policies changes. New scripts/sweep-*/analyzer + evidence/2026-10-16/ ONLY.
**Canon:** docs/CANON.md read; docs/MONSTER-WAVES.md read. No new canon invented. NOTE: the assignment says "wave-1/2/3 wired kinds" — MONSTER-WAVES.md is explicit that waves 3–5 are deliberately counter-less (signature mechanics instead; counterwire's scoring decision keeps w3+ out of the ledger convention). The checkMonsterCounter-wired `counter` fields exist on waves 1–2 only (14 kinds). This census measures those 14 kinds; the wave-3 absence is documented, not invented.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written before the sweep)

**Question:** on current master, end-to-end, where does the trick-execution funnel narrow for the wave-1/2 wired perform-kinds — and is every TB fight vs a trick-bearing species classifiable?

**Funnel stages** (engine-honest, separately observable, all read-only):
1. **contact** — a completed TB fight (startCombat→tbEnd) with ≥1 monster fighter of species `mid` where `mdef.counter` exists. Counted per species (multi-species fight = one row per trick-bearing species).
2. **known_at_start** — `Game.villageKnowsTrick(mid)` true at fight start (startCombat-time snapshot).
3. **condition_met** — ≥1 `checkMonsterCounter` hit for (mid, kind) during the fight: the player's action matched the kind's condition. Observed via wrapping checkMonsterCounter — hit ⇔ the engine pushes to `f.trickLogByMid[mid]` (detected as before/after length growth around the wrapped call; the push is the engine's own hit record).
4. **performed** — `f.trickLogByMid[mid]` non-empty at fight end: the engine's per-fight performance record (feeds trickSummary/trickSummaryFor kill attribution).
5. **kill_attributed** — waveKillLog entry, same mid, within ±1d of fight end, with non-empty trick string — the trickSummary/tricktag channel.
6. **survived/dismissed** — fight outcome: scholar/fighter alive at fight end (survived) and/or the fight ending non-lethally with the monster gone (mFlee/fled = dismissed). Both recorded.

**PRIMARY (diagnostic GO, binding):** 100% attribution — every completed TB fight vs a trick-bearing species across the 16 runs is classified into the funnel stages with ZERO unattributed fights (no unclassified rows, no null stages). A miss is NO-GO — the instrument is incomplete, never re-scored mid-run.

**Substrate:** pre-seat courtship — SEATDRIVE=0 EXPLICIT, FEASTSCALE_R13=1, TRIBFLOOR=1 (the base leadfeast/belongfeast sweep this attaches to; policies from scripts/policies/tribfloor.js, untouched). NODEWITNESS unset.
**Seeds:** 8 FRESH [1801–1808] × {leadfeast, belongfeast} = 16 runs. FRESH = 0 per-seed filename hits across evidence/ (verified 2026-10-16 with rg: `s180[1-8][^0-9]` → 0 hits).
**Horizon:** 180d death-aware (dead villages stop; +10d tail max).
**Gates before spend:** proof RED→GREEN (funnel classification on synthetic fixtures) · det-gate (instrument attached vs bare byte-identical trajectories) · SMOKE green.
**Guardrails:** wall metrics (national/table/wins) within noise of the base sweep's known wall state on this substrate; no new death mode.
**Per-seed JSONs:** evidence/2026-10-16/perseed-trickfunnel/ · beats: evidence/2026-10-16/trickfunnel-beats/ · instrument: scripts/trickfunnel-instrument-20261016.js · sweep: scripts/sweep-trickfunnel-20261016.js · proof: scripts/test-trickfunnel-20261016.js.

**Deliverable:** the funnel table per perform-kind (contact → known → condition-met → performed → attributed → survived/dismissed), the widest-gap stage per kind, and named nexts for future arms (widest gap = where to push). This sharpens the evidence for steve-call #411 (tricks vs win truncation) — the evidence file notes what this census says about it, without re-litigating the call.

## Metric review

Every evidence file carries one. The PRIMARY is attribution completeness, not a trick-count bar — this is a diagnostic census, not a lever. The funnel table is descriptive; no GO/NO-GO on trick volume. If the reviewer judges that "condition_met" and "performed" should collapse (they are adjacent engine lines — the push IS the hit record), that revision belongs to the NEXT run's header — this run measures them as separate columns and reports any divergence as a finding.

## steve-call #411 note (tricks vs win truncation)

This census does NOT re-litigate #411. What it contributes: the funnel table shows, per kind, how much of the trick game happens on the pre-seat substrate's TB path at all — i.e., whether "tricks are truncated by wins" is even the binding constraint, or whether the funnel narrows earlier (contact→known→condition-met) on the substrate where wins never happen. If the widest gaps sit at known-at-start or condition-met, then the win-truncation question is downstream of the knowledge/execution gaps this census measures.

## Results

### Proof: scripts/test-trickfunnel-20261016.js — 30/30 GREEN
- PURE: kindOf/trickMids/classifyFunnelFight on synthetic captures — full funnel row, known-at-start, discovered-in-fight, no-hit, unattributed (loud by design), ±1d join window (a ±2d entry and an empty-trick kill do NOT attribute), multi-species one-row-per-species, lost-fight survived=0.
- LIVE: real engine path — startCombat → checkMonsterCounter hit → discovery → kill → tbEnd('won') → waveKillLog carries non-empty trick via the trickSummary/tricktag channel → the capture classifies the full funnel (contact=1, known_at_start=0, discovered_in_fight=1, condition_met=1, performed=1, kill_attributed=1, survived=1). Pre-known fight: hit recorded, no discovery, fled → dismissed=1. Counter-less wave-3 species: zero rows. Bypass path (direct tbfight assignment, the encounters/justice/party initiation class): captured with known_at_start, zero unattributed.
- DET-GATE: instrument attached vs bare game byte-identical on identical seeds (3/3) — the tbfight property interception is fully transparent.
- SMOKE: 20d pre-seat instrumented run completes green.

### Census sweep: 16 runs (8 FRESH seeds [1801–1808] × {leadfeast, belongfeast}, 180d death-aware, SEATDRIVE=0, FEASTSCALE_R13=1, TRIBFLOOR=1)

**PRIMARY: GO.** 0 unattributed rows across 307 funnel rows (457 TB fights) — 100% attribution. The tbfight property interception closed the bypass-path gap found in the pilot (1 unattributed row from a non-startCombat initiation); the re-run is clean on all 16 seeds.

**INTEGRITY:** 0 rows with condition_met=1 but performed=0 — the engine's hit⇒push invariant holds everywhere. cond→perf is a lossless stage.

### The funnel table (per perform-kind, pooled 16 runs)

contact → known_at_start → condition_met → performed → kill_attributed (survived / dismissed):

| kind | contact | known | cond | perf | attr | widest gap |
|---|---|---|---|---|---|---|
| strike_windup | 50 | 46 | 13 | 13 | 13 | known→cond (−33) |
| move_windup | 43 | 24 | 23 | 23 | 6 | contact→known (−19) |
| keep_distance | 42 | 27 | 5 | 5 | 3 | known→cond (−22) |
| move_x2 | 29 | 16 | 10 | 10 | 6 | contact→known (−13) |
| strike_lead | 29 | 29 | 11 | 11 | 3 | known→cond (−18) |
| sidestep | 26 | 9 | 5 | 5 | 6 | contact→known (−17) |
| shout | 16 | 8 | 8 | 8 | 8 | contact→known (−8) |
| fresh_weapon | 16 | 12 | 0 | 0 | 0 | known→cond (−12) |
| wait | 14 | 6 | 5 | 5 | 2 | contact→known (−8) |
| offer_food | 12 | 10 | 1 | 1 | 0 | known→cond (−9) |
| strike_first | 6 | 2 | 4 | 4 | 2 | contact→known (−4) |
| eyes | 6 | 6 | 3 | 3 | 3 | known→cond (−3) |
| strike_nonhead | 6 | 2 | 6 | 6 | 0 | perf→attr (−6) |
| strike_recovery | 4 | 3 | 4 | 4 | 4 | contact→known (−1) |
| blindside | 4 | 1 | 0 | 0 | 0 | contact→known (−3) |
| face_it | 4 | 2 | 0 | 0 | 0 | contact→known (−2) |

Pooled: **307 contact → 203 known (66%) → 98 performed (32%) → 56 kill-attributed (18%)**. The funnel narrows at exactly two stages: **contact→known (−104, the knowledge gap)** and **known→cond (−105, the execution gap)**. cond→perf is lossless (0); perf→attr loses 42 (the kill-conversion gap, largely lethality — see sense-read 2).

Discoveries by via (16 runs): taught 161, observed 262, scholar-observed 8, **trick 15**. Only 15/446 discoveries (3%) come from actual trick performance — the knowledge game is carried 95%+ by the taught/observed channels. The perform-channel is a thin discovery source on bot policies.

### Widest-gap stages and named nexts (widest gap = where to push)

1. **known→cond is the execution wall for 7 kinds.** The bots know the trick and don't do it. Two flavors:
   - (a) **Bot-unreachable behaviors** (policy lane — sibling sim-reposition's question): `fresh_weapon` (understudy 16/12/0/0/0 — bots never switch weapons mid-fight), `keep_distance` (murkcap 13/12/0/0/0, living_wire 7/6/0/0/0 — bots close to melee), `blindside` (sunback 4/1/0/0/0) and `face_it` (sweeps_week 4/2/0/0/0 — 0 performances, replicating the wave3ledger finding on fresh seeds). **Named next:** the reposition policy arm (live, sibling) — if it teaches bots to reposition, re-run this census to measure the known→cond movement.
   - (b) **Known but unneeded**: `strike_windup` on anaconda_empress (20/19/0/0/0 — 12/20 fights WON without ever performing; the trick is an optimization the bots don't need). Not a gap to push — a signal that the trick's value is situational.
2. **contact→known is the knowledge wall for 9 kinds** — biggest for move_windup (−19), sidestep (−17), move_x2 (−13). The taught/observed channels carry this (423/446 discoveries), but contact outruns them. **Named next:** none new — the knowledge pursuit line (w3drive, killed at confirm: knowledge moved but survival cost failed the bar) already owns this; the census just sizes it.
3. **perf→attr (−42 pooled)** is the kill-conversion gap. The channel itself works (56 attributed; trickSummary/tricktag intact). The gap is lethality: `strike_nonhead` (ducks_in_a_row 6/2/6/6/0 — the scholar died in all 6 fights; see sense-read 2), `strike_lead` (hushwolf 29/29/11/11/3), `move_windup` (gallowdeer 19/14/18/18/3). **Named next:** a lethality-side arm (can the performer survive to land the kill?) — not a trick-wiring question.
4. **cond→perf: nothing to push.** Lossless across all 16 kinds. The engine's hit⇒push invariant is the funnel's healthiest stage.

### #411 verdict from this census (not a re-litigation)

On the pre-seat substrate (wins 0/16 by design — nothing truncates anything), the trick game narrows at **knowledge (−104) and execution (−105)**, not at attribution. The win-truncation question is downstream: even with wins removed from the picture, only 18% of trick-bearing contacts reach kill-attribution, and only 3% of discoveries come from performance. If #411 asks "do wins truncate the trick game," this census answers that the trick game has ~80% headroom before wins enter the picture — fix knowledge and execution first; truncation is a second-order question.

### Wall metrics (this substrate)

national 10/16, table 15/16, wins 0/16 (pre-seat by design), wave4 0/16, wave5 0/16, mean days 139.8. Consistent with the pre-seat wall state (readiness-gated waves 4-5 behind the arming substrate question).

## Sense-testing (transcript reads)

**Read 1 — the performed kill (belongfeast-s1806, day 16, drumbelly_tanuki, strike_windup):** Day 13 the village learned the trick via the observed channel — "💡 COUNTER LEARNED — Drum-Belly: Strike the taut drum... (Two survived encounters — the fire has a theory.)" (the wave3ledger narration fix, working as designed). Day 16: knownAtStart=true, the scholar strikes during the windup twice (2 hits, 2 perfs), wins, kill attributed via the trickSummary channel. Verdict: fully coherent — the village learned together from survived encounters, the scholar applied the named behavior in a real fight, the kill carried the trick tag. Knowledge → execution → attribution reads as one story.

**Read 2 — performed but not attributed (leadfeast-s1801, day 82, ducks_in_a_row, strike_nonhead):** The scholar struck non-head segments 4 times (4 hits, 4 perfs); the discovery fired — "💡 COUNTER LEARNED — ducks in a row: Break the line... (You did the thing — and it worked.)" — but the fight was lost and the scholar died. Verdict: coherent with tension. "You did the thing — and it worked" is about the trick (the line split; the discovery is the proof), not the fight. Doing the trick right doesn't guarantee survival — the knowledge persists in the village (monsterCounters is village state) even though the performer died. This is the perf→attr gap made flesh: 6 ducks_in_a_row performances, 0 attributed kills, because the scholar died in all 6. The blank here is lethality, not wiring.

## Metric review

The PRIMARY (100% attribution) is met: 0/307 unattributed. The funnel table is descriptive per the pre-registered diagnostic design — no trick-volume bar was set, and none is retrofitted. One metric note for the next run: `condition_met` and `performed` never diverge (hit⇒push is an engine invariant, 0/307 divergences) — a future census could collapse them, but this run measured both and the collapse would lose the integrity check that proves the invariant. Keep both.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-10-16/perseed-trickfunnel/*.json' --metrics national,table,wins,exiled` fired 1 LOUD line — EXPLAINED, no baseline roll:
- wins 16→0: substrate-mismatch (baseline = composed-driver full win-side stack; this census runs pre-seat by design, SEATDRIVE=0 explicit — the recurring pre-seat LOUD class; own substrate has no seat driver).
Baseline kept.

## Findings / named nexts

- **Filed to sim-findings (policy lane):** the known→cond execution wall has two flavors — (a) bot-unreachable behaviors (fresh_weapon, keep_distance, blindside, face_it: 0 performances despite knowledge; the reposition question belongs to sibling sim-reposition, live this run); (b) known-but-unneeded (anaconda_empress: 12/20 wins with 0 performances — the trick is situational optimization, not a gap).
- **Filed to sim-findings (lethality lane):** the perf→attr gap is a survival gap, not a wiring gap — ducks_in_a_row 6 performances / 0 attributed kills / scholar died in all 6; gallowdeer 18/18/3. A future arm on performer survival (not trick wiring) owns this.
- **Instrument note:** wrapping startCombat alone undercounts fight initiations AND double-counts refused startCombats (the pilot's 149 vs the setter's 24 on the same seed — the refusals came from repeated startCombat calls against a live fight). The tbfight property interception is the correct census hook; the det-gate proves it behavior-neutral.
- Steve-call #411 stays OPEN — this census sizes the pre-win headroom (~80%) without re-litigating the call.

