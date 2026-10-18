# sim-killdisc — companion kill-securing: damage-share diagnostic + kill-discipline lever (2026-10-18)

Run: flesh-out loop arm sim-killdisc (run_id fleshout-20261018T2017Z, loop A), axis scale-onramp (the blocking axis).
Canon: docs/CANON.md + docs/MONSTER-WAVES.md (VETERANS/veteran vocabulary; design call #4 readiness gate; wave-3 bands).

LINEAGE: sim-compchan (2026-10-18, DIAG-GO 16/16, commit 86144d799 — landed separately by the coordinator): 33 wave-3 kills = 32 scholar (97%) + 1 companion (3%); the base policy manufactures TRANSIENT scholar-veterans who all die; ZERO living veterans at end of 16/16 runs. The dc4-readiness wave-4 bar demands 2 LIVING veterans — companion veterans are the missing production channel. The staffing theory of veteran production is dead (vetblood 0-for-yield, vetstaff-a Δ-2 vs control). Compchan's named next: "companion damage-share vs kill-share diagnostic (the kill-securing question), then a policy-side kill-discipline rule." This arm executes it in two stages.

## Substrate (both stages)

- policy: tribfloor leadfeast/belongfeast (the pure tribfloor base; NO vetstaff, NO vetblood, NO vetrel) + killdisc layer (stage 2 only, KILLDISC_LAYER=1)
- env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0, NODEWITNESS=1 (exactly the compchan/vetstaff-a pre-seat substrate)
- seeds: 8 fresh (63201–63208 — verified filename-unused in evidence/2026-10-18/perseed-*/ before the sweep), x {leadfeast, belongfeast} = 16 runs per arm
- horizon: 180d death-aware (dead villages stop simulating; runDays handles this)
- instruments: KILLDISC=1 (read-only; kill/engagement/census wraps + per-source tbDamage attribution on wave-3+ monsters)

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14–15 — BINDING, written BEFORE the lever sweep)

**STAGE 1 — DIAGNOSTIC (census, no lever):** measure companion damage-share vs kill-share in wave-3 TB fights on the base policy. No GO threshold (it is a census); the diagnostic answers which lever is right:
- if companion damage-share >> kill-share → the leak is kill-SECURING → stage 2's kill-discipline rule is the right lever;
- if damage-share ~ kill-share → the problem is companion combat capability (arming/leveling), a different lever — stage 2 does not run.

**STAGE 2 — LEVER (kill-discipline, policy-side):**
- PRIMARY: companion wave-3 kill-share ≥15% armed vs ~3% control (bar = +8pp absolute), paired on identical seeds.
- GO = primary bar met AND guardrails green: median survival ≥ control −10d, no new death mode, national reach not regressed.
- §15: before/after through the balanced panel (scripts/balance-panel.js) — the panel is the instrument, the pre-registered threshold is the judge. The panel covers the guardrails; the primary comes from the paired instrumented sweeps.
- §14 binds: a miss is NO-GO, never re-scored against a friendlier metric mid-run. Metric doubts go under "metric review" for the NEXT run.

**THE LEVER (scripts/policies/killdisc.js, KILLDISC_LAYER=1, zero src/js):** when the scholar's turn comes in a TB fight with exactly one living wave-3+ monster, a living companion ally in the fight, and the monster's HP inside the companion's DEMONSTRATED kill range (max single-round damage any ally has dealt this fight, read live from the engine's v._dealt ledger), the scholar HOLDS (tbPlayerWait) instead of striking — the companion secures the killing blow and bloods toward veteran. Safety: scholar HP ≥35%, poised ally HP ≥50%, max 3 consecutive holds per fight, demonstrated damage ≥15 (MIN_RANGE).

## Proof

- `scripts/test-killdisc-20261018.js` — instrument proof: (a) det-gate installed-vs-not, trajectory-identical on stable seeds; (b) damage-source resolution fixtures; (c) wrap fixtures on a real TB fight (engine-shaped scholar/companion/monster damage; landed-not-asked attribution; fight-id keying; kill-time dmg attach; via='player' mis-tag); (d) real-sweep gate (180d, zero errors, byte-identical re-run). **33/33 GREEN.**
- `scripts/test-killdisc-layer-20261018.js` — layer proof: D0 gate-off purity (30d trajectory identical vs pure tribfloor); D1 hold behavior (layer ON holds in-range with ally; OFF delegates; 6 guards decline: above-range, wave<3, scholar fragile, ally dying, no ally); D2 hold cap (3 holds then decline). **20/20 GREEN.**

## Results — STAGE 1 DIAGNOSTIC

**DIAGNOSTIC COMPLETE — the kill-securing gap is NOT confirmed.**

16-run census (seeds 63201–63208 × {leadfeast, belongfeast}, 180d death-aware, KILLDISC instrument, zero instrument errors on 16/16):

| metric | corpus |
|---|---|
| wave-3+ kills | 44 |
| companion kills (by ≠ kill-time scholar vid) | 0 (0.0%) |
| scholar kills | 44 (100.0%) |
| companion damage-share (all wave-3 killing fights) | 1.5% (362 / 24,031) |
| scholar damage-share | 98.5% |
| other-share (instrument-trust line) | 0.0% |
| fights with ANY companion damage | 5/44 |
| damage tables attached | 44/44 (36 single-monster) |

The 5 fights with companion damage (the entire convertible pool):

| fight | companion dmg | scholar dmg | comp-share | killer |
|---|---|---|---|---|
| d57 chorus_line (raid) | 48 | 365 | 12% | scholar |
| d58 ad_break (haven-TB, MULTI) | 106 | 414 | 20% | scholar |
| d65 redactor (raid) | 142 | 248 | 36% | scholar |
| d77 callback (haven-TB) | 31 | 261 | 11% | scholar |
| d82 terms_of_service (raid) | 35 | 414 | 8% | scholar |

By shape: haven-TB 34 kills, companion damage 0.7%; raid 10 kills, companion damage 5.0%.

**Reading:** companions are essentially ABSENT from wave-3 killing fights — 39/44 fights have literally zero companion damage. The compchan transcript's Katarina (45-51/hit) was the exception, not the rule. Even with PERFECT conversion of the 5 convertible fights, companion kill-share caps at ~9-11% — below the pre-registered PRIMARY (≥15%, bar +8pp). Realistic conversion (the rule must fire within its guards AND the companion must land the blow) is 2-5%. **The base channel has no companion damage to convert; the binding constraint is companion ABSENCE from wave-3 killing fights, not kill-securing.** Per the pre-registration, stage 2 does not run.

**STAGE 2 — LEVER: KILLED AT THE DIAGNOSTIC GATE.** The kill-discipline layer (scripts/policies/killdisc.js) was deleted zero-trace per the kill protocol; the sweep-compare.js registry addition reverted; the layer proof test repaired to INFO-SKIP (exit 0). The layer's D0/D1/D2 proofs had passed 20/20 before the kill — the mechanism was sound, the premise was not. No balanced panel was run (§15): there is no "after" — the lever never reached the pilot it was gated on. Documented here, not skipped silently.

## Village assessment (plain words)

The modal village fights wave-3 monsters alone. The scholar faces the Redactor, the Callback, the Spool at haven and on raids from ~day 40-80, usually outnumbered, usually with no companion dealing damage — 39 of 44 killing fights are solo scholar damage, 100% of the killing blows. When a companion does fight (5/44), they hit honestly (Nora's 51/40/51 with the feast behind her) but the scholar's burst (a 215 Phase-blade strike) ends the fight from outside the companion's range. Nobody bloods but the scholar, and the scholar never lives to hold it — the compchan finding stands: transient scholar-veterans who all die, zero living veterans at end of run. The village reaches national on some seeds (the wall numbers are the coordinator's), but the veteran bar is never held.

Who thrived: the scholars with big weapons (Phase blade 215s). Who died: everyone who blooded. What was missing: companions IN the wave-3 fights — not their damage, not their kills, their presence. The blank this run fills is the damage-share map; the blank it names is presence.

## Sense-testing (SENSE-TESTING LAW)

Read: evidence/2026-10-18/killdisc-transcripts/leadfeast-s63204.txt (d63–67 window around the d65 Redactor kill — the corpus's richest companion-damage fight, 36% share).

The d65 fight is coherent and the numbers are honest. "⚔ THE BIG STARE! Nora joins you!" — she joins organically, no staffing. She strikes three times (51/40/51, FEASTED ×2.53 — "the feast was the weapon"), taking Redact hits for 26 alongside the scholar. The Redactor has real mechanics (edge-handles POINT at the Phase blade, REDACTED for two rounds, starve-it counterplay). The scholar's 215 Phase-blade strike ends it — "The Big Stare falls" — with the village reacting ("Nathan nods, slow. 'Remind me not to cross you.'"). Nobody is confused about who killed it; the fiction matches the ledger exactly.

The sense-test CONFIRMS the diagnostic verdict: Nora fought well (142 damage, 36%), but the scholar's burst killed from 215 HP — far outside Nora's ~51 demonstrated range. A hold-inside-range rule would not have fired here; the scholar simply hit harder, earlier. This is not a refereeing error — it is the shape of the fights. Converting companion damage into companion kills requires companions to be dealing damage in the first place, and then requires the scholar's burst to not preempt them. Neither holds on this corpus.

Two notes: (1) Nora is not flagged as wounded/condition-limited while fighting at full strength — the same minor incoherence compchan filed (Katarina at 8 HP). (2) The d58 ad_break (106 companion damage, MULTI-monster) was not transcript-read; multi-monster fights are outside the hold rule's scope by design.

## Metric review (§14 — binding, never re-scored)

1. **Diagnostic has no GO threshold (census, pre-registered).** The stage-1 question was "damage-share vs kill-share" — answered: 1.5% vs 0.0%, 5/44 convertible fights. Not re-scored.
2. **Stage-2 PRIMARY (≥15% kill-share, bar +8pp) was NOT run** — the diagnostic gated it. This is the pre-registered pilot gate working as designed, not a skipped measurement. The lever was killed at the gate; the bar was never judged because the mechanism could not reach it (best-case ~9-11% < 15%).
3. **No balanced panel (§15).** The panel is the before/after instrument and there is no "after" — the lever died at the diagnostic gate. Documented here, not skipped silently.
4. **Seeds.** 63201–63208, verified filename-unused in evidence/2026-10-18/perseed-*/ before the sweep. 16/16 runs, 0 errors, 44/44 damage tables attached, 0.0% other-share.
5. **Determinism.** The instrument proof's real-sweep gate re-ran byte-identical. The transcript probe re-ran leadfeast-s63204 deterministically (the d65/d82 companion-damage kills reproduced).
6. **Pre-registration honored.** The header (PRIMARY, bar, guardrails, the diagnostic's no-threshold census, the "stage 2 does not run" condition) was written before the lever sweep. The kill follows it exactly.

## Out-of-arm findings (not chased)

Filed to hidden_files/sim-findings.md:
1. Companion ABSENCE from wave-3 killing fights (39/44 zero companion damage) — the 6th production attempt's diagnostic: do companions join wave-3 fights? (proximity? AI? dying early? elsewhere?)
2. Scholar burst preempts the hold range (215 Phase-blade kill from outside Nora's 51 range) — a kill-discipline rule needs burst-aware ranging, not just demonstrated-damage ranging.
3. Raid-shape companion presence (5.0% damage-share vs haven-TB 0.7%) — raids are the companion channel, such as it is.
4. Nora-at-full-strength (same minor incoherence as compchan's Katarina finding).

## Convergence

**DIAG (diagnostic complete) / LEVER KILLED-AT-GATE.** The instrument is proven (33/33) and the diagnostic is complete on current master: companion damage-share 1.5% vs kill-share 0.0% across 44 wave-3 kills. The kill-discipline lever was killed at its pre-registered pilot gate — the base channel has no companion damage to convert. The axis stays scale-onramp: the veteran question is now PRESENCE (why companions deal 0 damage in 39/44 wave-3 killing fights), not securing. The staffing theory is 0-for-2, protection 0-for-3, and now discipline is 0-for-1 at the gate — the 6th production attempt must diagnose companion presence in wave-3 fights. No game change: zero src/js; the policy layer was deleted zero-trace.

## Files

- scripts/killdisc-instrument-20261018.js — the KILLDISC read-only instrument (kill/census wraps + tbDamage per-source attribution; proof 33/33)
- scripts/killdisc-sweep-20261018.js — stage-1 diagnostic sweep (16 runs)
- scripts/killdisc-analyze-20261018.js — damage-share vs kill-share analysis
- scripts/killdisc-transcripts-20261018.js — sense-testing transcript probe
- scripts/test-killdisc-20261018.js — instrument proof (33/33 GREEN)
- scripts/test-killdisc-layer-20261018.js — INFO-SKIP stub (layer killed at gate, deleted zero-trace)
- evidence/2026-10-18/perseed-killdisc-diag/ — 16 per-seed diagnostic JSONs + _analysis.json
- evidence/2026-10-18/killdisc-transcripts/leadfeast-s63204.txt — sense-test transcript (d65 Redactor)
- evidence/2026-10-18/sim-killdisc.md — this file
- ZERO src/js changes; the killdisc policy layer deleted; sweep-compare.js registry reverted
