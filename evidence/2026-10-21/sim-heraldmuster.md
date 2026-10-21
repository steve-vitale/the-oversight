# sim-heraldmuster — the Herald's titan muster gate (2026-10-21)

Run: flesh-out loop arm sim-heraldmuster, axis scale-onramp (the blocking axis), killdisc finding 3.
Canon: docs/CANON.md + docs/MONSTER-WAVES.md (wave law; wave-4 Mirror Draft identity; readiness gates; the VILLAGER XP LAW). The muster gate is Steve's titan class (src/js/titans.js @ontology: "No solo fights — hard gate, not a stat check. Coalition warfare.").

LINEAGE: sim-killdisc (2026-10-18, evidence/2026-10-18/sim-killdisc.md — READ IT): 38 of 82 TB engagements on the pre-seat substrate hit the Herald's muster gate and were REFUSED — "muster 10 allied blades (you have 0)... This is not courage. This is arithmetic." — before any fight started. Wave-4's signature titan is unreachable without a muster the sims never assemble. Killdisc named the next question: can a POLICY layer assemble the muster? This arm executes it in two steps: STEP 1 investigate (done below), STEP 2 arm (only if policy-reachable).

## STEP 1 — the muster gate, named precisely (INVESTIGATE)

All code: src/js/titans.js (ontology: titans), defs src/data/titans.json.

**The gate.** `titanWrapCombat()` wraps `Game.startCombat`. For mid='herald' (titanDefs()['herald'] exists): `Game.titanEntryGate('herald')` returns null (the finale-campaign override only answers 'finale'), so the HARD GATE applies: `titanMusterReady('herald')` must be true, else the refusal beat + `return null` — NO FIGHT STARTS. (Refused engagements are encounters that never became fights.)

**`titanMusterReady('herald')`**: `titanUniqueAllies(muster).length + |distinct haven vids| >= def.minAllies`, where herald minAllies = **10** (nielsen 12, finale 20, the_network 20 — titans.json).

**What counts as a blade** (two channels, both state records in `Game.state.titans.musters.herald` — not map locations):

1. **Allied blades** — added ONLY by `Game.soundTitanCall('herald')`. Walks `titanAlliedLinks()` = `Game.hierarchyState()` links with status 'active'. Per link, said aloud:
   - REFUSE: trust < 25, or opinion < −10, or arrears > 0 (−8 trust; refusals are remembered).
   - ANSWER: quota = 6 blades if trust ≥ 70 && opinion ≥ 10 (trustedBlades), else 2 (baseBlades). Named living-adult faces from that village's roster (speaker first); people already committed to another live muster are excluded; per-link quota caps re-sounding ("already march").
   - `titanUniqueAllies` then counts them: has vid, deduped by villageId:vid, alive (hp > 0 and roster person alive). `titanNormalizeMuster` prunes the dead on every call.
2. **Haven blades** (cap 3 — "the coalition is still mostly the many, never a solo with extra steps") — added ONLY by `Game.titanCommitOwn('herald')`, TWO-TAP: first call returns 'confirm' (names the volunteers, states the cost honestly); the second commits. Requires the omen at stage ≥ 2 (lair located — "There is nothing located to march against"). Pool = `titanVolunteers()`: Haven villagers who are members, not away, not traveling with the scholar, not engaged. Real costs: they leave the workforce, eat 1000 kcal/day each via `titanMusterUpkeep`, fight blow-by-blow via `titanInjectAllies`, and can die (`tbVillagerFalls` drops them from the roster).

**The engagement path.** The herald is a world monster (`titanPlace` → `Game.spawnWorldMonster(def.monster, ...)`); it never wanders (`monsterWavePool` filters titans out). TB engagements are the bot walking onto the lair tile after the omen is located. The refusal beat reports "(you have N)" where N = raw muster.allies.length — display-only; the gate counts unique-alive + Haven (display/gate discrepancy, filed as finding).

**STEP 1 VERDICT: POLICY-REACHABLE.** Every verb is Game-exposed engine action (`Game.soundTitanCall`, `Game.titanCommitOwn` two-tap, `Game.titanMusterReady`, `Game.titanMusterState`) and the sim policy contract (`daily(Game, ctx)` wrapper layers, seatdrive/vgear pattern) can drive them: watch `Game.state.titans.omens.herald` for stage ≥ 2, sound the call (once per link-state change — re-sounding a refusing link costs −8 trust, so the layer tracks sounded links), two-tap the commit, stop when `Game.titanMusterReady('herald')`. Preconditions the run must supply: active hierarchy links with trust ≥ 25 (the court's `Game.proposeLink` diplomacy on the base policy builds these) and the omen reaching stage 2. → STEP 2 runs.

**The fiction.** The muster is a coalition army: the call to arms (allied fires answer aloud with named fighters — or refuse aloud, with reasons), Haven commits up to 3 of its own (named, said aloud, they eat, they bleed, they can die). The refusal — "This is not courage. This is arithmetic." — is the game's honesty about wave 4's signature titan: coalition warfare, not a duel.

## Substrate (STEP 2)

- policy: the SEATDRIVE=1 WINNING stack (seatdrive's prebuilt leadseat/belongseat = withSeatDrive(withWinDefer(TF leadfeast/belongfeast))) + heraldmuster layer OUTSIDE it (HERALDMUSTER=1), zero src/js
- env: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 (the winning substrate, pinned exactly) + HERALDCENSUS=1 (read-only instrument, both arms)
- seeds: 8 fresh (64831–64838 — verified filename-unused in evidence/2026-10-21/perseed-*/ and unmentioned in evidence/2026-10-21/*.md before the sweep), × {leadfeast, belongfeast} × {control, armed} = 32 runs, paired identical seeds
- horizon: 180d death-aware (dead villages stop; won runs stop on win; runDays handles this)

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14–15 — BINDING, written BEFORE any sims)

**PRIMARY: musters the gate ACCEPTS.** Per seed: ≥1 herald TB engagement that the gate ACCEPTS (startCombat('herald') returns a fight — the fight starts).
- GO = armed accepted-seeds ≥ 3/16 AND armed − control ≥ 3 (the decisive gap; reduces to the brief's ≥3 vs 0 when control is 0).
- Guardrails: median survival ≥ control −10d; no new death mode; starvation-death share ≤ control +2pp; national reach not regressed.
- If the gate never accepts on the armed side, the arm is NO-GO — kill protocol: delete the layer zero-trace, land instruments + evidence + KILLED-VERDICT.
- §15: before/after through the balanced panel (scripts/balance-panel.js) on the guardrail metrics — the panel is the instrument, the pre-registered threshold is the judge.
- §14 binds: a miss is NO-GO, never re-scored against a friendlier metric mid-run. Metric doubts go under "metric review" for the NEXT run. This file carries that section.

**THE LEVER (scripts/policies/heraldmuster.js, HERALDMUSTER=1, zero src/js):** a default-OFF layer OUTSIDE the winning seat stack. In `daily(Game, ctx)`: if the herald muster is gate-ready, record the day and stop; otherwise, when the herald omen is located (stage ≥ 2) — sound the call on new answerable capacity (track sounded links in ctx; never re-sound a refusing link — refusals cost −8 trust), and two-tap `Game.titanCommitOwn('herald')` while Haven's committed < 3 and volunteers exist. Safety: scholar alive; herald not slain; engagement of the layer is said aloud by the engine's own beats (SENSE-TESTING LAW: read the call/commit transcript).

## Proof

- scripts/test-heraldmuster-20261021.js — (a) det-gate: HERALDMUSTER unset ≡ control byte-identical on stable seeds; (b) env-gate: Usage header with the full env asserted up front; (c) engagement gate: the instrument classifies herald engagements refused/accepted on the wrapped startCombat with 0 unexplained; (d) layer behavior fixtures: call answers on a constructed active link, commit two-tap adds Haven blades, titanMusterReady flips when the muster is real.

## Results — PILOT COMPLETE: NO-GO (KILLED)

Pilot (16 seeds × {leadfeast, belongfeast} × {control, armed}, seeds 64831–64838, 180d, analysis generated 2026-10-21T07:12Z):

- PRIMARY (accepted herald fights): armed 0/16 seeds, control 0/16 seeds. Per the pre-registered bar: "If neither arm engages the herald at all, the PRIMARY resolves 0/16 vs 0/16 = NO-GO." **NO-GO.**
- Secondary (gate-ready muster as diagnostic context): armed musterReadyDays 0 on the sampled seed; refusedTotal 36 across armed (links refuse, never accept).
- Wall numbers (pilot, armed/control): national 13/13, table 15/15, won 14/14, wave4 14/14, wave5 0/0 — the substrate reaches wave 4 but the herald never engages.
- No metric re-score: judged against the pre-registered bar exactly as written before the pilot.

**KILL PROTOCOL EXECUTED:** scripts/policies/heraldmuster.js deleted zero-trace (default-OFF, zero src/js refs); scripts/probe-national-20261021.js deleted (required the layer). Instruments (heraldmuster-instrument, sweep, test, analyzer), per-seed corpus, and this evidence land as the killed-verdict record.

## Convergence

killed-at-pilot (NO-GO). The herald-muster channel does not engage on the winning substrate — wins truncate runs before omens reach stage 2 with staging.


## Village assessment (plain words) — (pending)

## Sense-testing (SENSE-TESTING LAW) — (pending: read the call/commit transcript)

## Metric review (§14 — binding, never re-scored) — (pending)

## Convergence — (pending)

## Out-of-arm findings (not chased) — (pending)

## Files

- scripts/policies/heraldmuster.js — the HERALDMUSTER layer (default-OFF; deleted zero-trace if killed)
- scripts/heraldmuster-instrument-20261021.js — the read-only herald engagement census instrument (HERALDCENSUS=1)
- scripts/sweep-heraldmuster-20261021.js — the 32-run pilot sweep
- scripts/test-heraldmuster-20261021.js — the proof test
- evidence/2026-10-21/perseed-heraldmuster/ — per-seed JSONs
- evidence/2026-10-21/sim-heraldmuster.md — this file
- ZERO src/js changes

## Pre-registration note (written before the pilot)

The pilot substrate is the WINNING substrate: on it, runs reach wave 4 on ~9/16 (w5gates corpus) but herald omens need wave ≥ 4 + regional+ and ~2+ weeks of staging, and wins truncate runs. If neither arm engages the herald at all, the PRIMARY resolves 0/16 vs 0/16 = NO-GO per the bar above (not a re-score: the bar demands accepted fights). The secondary read — seeds reaching a gate-ready muster (assembly without engagement) — is reported as diagnostic context only, never as the judge.
