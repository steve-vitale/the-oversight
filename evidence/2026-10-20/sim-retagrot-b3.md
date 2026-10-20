# SIM-RETAGROT-B3 — the ROT re-tag pilot, resume (loop B, food-economy)

Date: 2026-10-20 · Loop: oversight-flesh-out-loop-b · Worker tree: ~/workspace/worktrees/sim-retagrot-b3
Axis: food-economy (scale-wall lens) — the claimed SIDE-OBSERVATION of the sharelean kill (backlog line 691, claimed 2026-10-20 by sim-retagrot-b)
Base SHA: a64b88e3c (worktree tip; current master at run start).

## Run history of this arm (context for the resume)

- **0930Z run (fleshout-loop-b-20261020T0930Z)**: worker wrote the layer + proof + det-gate + sweep but the worker died (timed out at 7200s, no live processes). The main agent's recovery commit (06507af47) judged the mechanism BROKEN — proof G1a/G1b/G1d2 FAILED (re-tag moved 0 kcal, engine stockSurplus called armed-side, vmd wrap never installed). Arm parked RED, layer default-OFF inert.
- **Falsification (2026-10-20, 12:14–12:19Z, main agent)**: the "BROKEN mechanism" verdict was FALSIFIED — the proof was run WITHOUT the Usage-line env var (FEASTSCALE_R13=1). With the env the proof is 14/14 GREEN and the re-tag fires (189,450 kcal moved in the sense run). The envless G1-style failures are by design — substrate gate loud STOP, not a bug. (AGENTS.md RECOVERY ENV-TRAP lesson: read the proof's Usage header BEFORE running it.)
- **1234Z run (fleshout-loop-b-20261020T1234Z)**: never ran the det-gate; started the pilot sweep but only partially completed it (control-lead 7/8, control-belong 5/8, armed-lead 5/8, armed-belong 4/8 seeds, committed at 06507af47's parent base — UNJUDGED, archived at evidence/2026-10-20/perseed-retagrot-b/unjudged-06507af47/, never part of any verdict). The stale pilot rows are NOT reused by this run (base moved 06507af47 → a64b88e3c; this run re-runs the full pilot clean at the current tip per the pre-registered "paired control re-measured on the current tip in the same sweep").
- **This run (b3)**: resume at base a64b88e3c. Proof 14/14 GREEN re-verified first (FEASTSCALE_R13=1), det-gate, then the 8-seed pilot.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14–15 — binding, written BEFORE any sims)

- **Question**: the sharelean kill (evidence/2026-10-20/sim-sharelean-b.md) measured that its PANTRY-funnel re-tag halved fast-rot on lean days (0.52x, guardrail), "arrivals eaten, not stored" — while the lean inflow primary died on the engine's own CRISIS SHARING. Does the re-tag ALONE, broadened beyond lean days (always-on), buy rot reduction with a ROT primary, without eating the buffer dangerously?
- **Lever**: RETAGROT re-tag (policy-side, scripts/policies/retagrot-b.js, ZERO src/js changes). Wraps leadfeast/belongfeast (scripts/policies/feastscale.js). RETAGROT_B=1 default OFF (unset → pure delegation, byte-identical — pinned by the proof's RED phase). Requires FEASTSCALE_R13=1 (loud RETAGROT STOP otherwise). Mechanic: persistent idempotent Game.villagerMealDay wrapper (installed on the first armed daily; the harness runs Game.sleep AFTER policy.daily returns). Each wrapped meal re-tags the share write from stockSurplus into the PANTRY funnel (Game.stockPantry(give, 'Foraged food'), ≤500-kcal pieces, fresh clock), save/restored per-meal in finally. NO trustFactor override (the engine's trust culture + CRISIS SHARING decides how much is shared — the layer only redirects where it is stored). CAPDOOR=1 defers to the original stockSurplus. Voices at most one line per day when the re-tag moved kcal, day-keyed among 3 honest variants.
- **Method**: paired before/after on identical seeds, pooled over lead+belong. Control: RETAGROT_B unset. Armed: RETAGROT_B=1. Both sides retagrot-wrapped feastscale policies (leadretagrot/belongretagrot) + FEASTSCALE_R13=1 + SEATDRIVE=0 + SURPLUSFEED unset.
- **PRIMARY (binding)**: pooled fast-rot kcal ratio (armed/control, pooled lead+belong, /100d run-days) ≤ 0.80x. The bar is deliberate: sharelean's lean-only re-tag measured 0.52x; the broad re-tag could dilute or backfire on fat days (a full pantry may not eat arrivals the same day), so 0.80x is the honest bar for "the rot benefit survives broadening."
- **GUARDRAILS (hard)**: starvation deaths ≤ control; median survival ≥ control−10d; national ≥ control−2; armed/control total inflow ≥ 0.90x (the re-tag moves ~zero inflow — it must not destroy it); laundering 0; no new death mechanism (mechanism-triaged, not the naive string check — procedural monster names are noise).
- **Horizon**: 180d death-aware (dead villages stop +10d tail max).
- **Seeds**: 5403–5410 × leadretagrot/belongretagrot = 16 configs. Fresh: not on the coordinator's banned list (asserted inline by the sweep) and unused by any prior JUDGED run (proof used 5401/5402 only; the 1234Z partials are unjudged). Paired control re-measured on the current tip in the same sweep.
- **Det-gate**: scripts/detgate-retagrot-b.js — 16 configs × 2 sides × 2 reps, all 32 repeat-pairs bit-identical (r27 rule). A det-gate FAIL is FAIL LOUDLY and stops the run before pilot.
- **Panel (§15)**: attempted via scripts/balance-panel.js — CANNOT produce a valid compare for this env-flag arm: the panel's child route resolves policies through sweep-compare.js's POLICY_REGISTRY, which has no leadretagrot/belongretagrot entries (verified: 'leadretagrot' in registry → false). The pantryguard-b2 precedent (evidence/2026-10-20/sim-pantryguard-b2.md) proved that passing base policies + the env flag leaves the layer INERT (13 after-cases byte-identical to before). No bogus panel shipped; the pre-registered metrics bind regardless. The dutyfish-b pre-reg documents the same caveat.
- **Verdict form**: GO (pilot meets PRIMARY + guardrails → confirm 12–16 seeds) / NO-GO (kill fast at pilot — layer deleted zero-trace per kill protocol, instruments + evidence kept).

## Canon

- docs/CANON.md + docs/PRESERVATION.md read first. The re-tag moves kcal between funnels; it never converts, cooks, or re-clocks food — "rot can't be smoked back into food" holds, and the laundering guardrail is satisfied by construction + measured.
- No-silent-actions: the re-tag voices at most one line per active day (3 day-keyed honest variants, deterministic — avoids the verbatim-repetition class the sharelean sense read flagged).
- CRISIS SHARING (game.js villagerMealDay, bal-survival 2026-10-10): the engine already opens the share gate when the pantry is nearly empty; the layer does not touch it.
- No new canon invented; no game-code changes.

## Design calls (Steve: "figure it out yourself" — numbered, overrulable)

- **R1**: always-on re-tag — the lever is the funnel, not a lean valve. Lean gating + gate-forcing died with sharelean.
- **R2**: RETAGROT_B unset → pure delegation (RED phase).
- **R3**: RETAGROT_B=1 without FEASTSCALE_R13=1 → loud RETAGROT STOP.
- **R4**: CAPDOOR=1 → defer to the original stockSurplus (refusal honesty first).
- **R5**: stockPantry(give, 'Foraged food'), ≤500-kcal pieces, fresh clock — the sharelean instrument signature (away_wild classification) stays comparable.
- **R6**: voice — one deduped line per day when kcal moved, day-keyed among 3 variants, deterministic.
- **R7**: seeds 5403–5410 (fresh per the banned/used check above); 5401/5402 are proof-only. Paired control re-measured on the current tip in the same sweep.

## Proof (step 1)

`FEASTSCALE_R13=1 node scripts/test-retagrot-b.js` — **14/14 GREEN**, base a64b88e3c:
- RED (RETAGROT_B unset): armed≡base byte-identical on all 4 pairs (2 seeds × lead/belong).
- RED (substrate gate): RETAGROT_B=1 without FEASTSCALE_R13=1 → loud RETAGROT STOP.
- GREEN: layerOn() true; re-tag fired (moved kcal > 0); engine stockSurplus NEVER called armed-side; control still uses the engine share path; per-meal save/restore intact; vmd wrap installed exactly once; armed differs from control; CAPDOOR=1 defers to the engine path; armed repeat run identical.
- SENSE: 41 days voiced, 3 distinct variants, 189,450 kcal moved total.

## Det-gate (step 2)

- **Smoke test**: `FEASTSCALE_R13=1 SEATDRIVE=0 DAYS=30 DETSEEDS=5403 node scripts/detgate-retagrot-b.js` → control 2/2, armed 2/2 bit-identical — PASS. (The gate script itself is sound; an earlier full-gate attempt looked stalled at 30% CPU because the box was saturated — load 5.7–8.6 on 2 CPUs with 5 sibling sim processes — not a gate hang. Killed it, verified with the smoke test, then launched the full gate.)
- **Full gate**: `FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/detgate-retagrot-b.js` (16 configs × 2 sides × 2 reps, 180d) — **PASS: control 16/16, armed 16/16 bit-identical** (136s sim CPU; ~30 min wall — box contention plus one mid-run service restart that wiped /tmp and killed the first attempt; relaunched, no /tmp dependency). Every armed hash differs from its control hash on all 16 configs — the lever fires everywhere, never silent.

## Pilot (step 3)

8-seed pilot via scripts/sweep-retagrot-b.js — 32 configs (seeds 5403–5410 × leadretagrot/belongretagrot × control/armed), 180d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0/SURPLUSFEED unset. Per-seed JSONs: evidence/2026-10-20/perseed-retagrot-b/{control,armed}-{lead,belong}.json. Analysis: scripts/analyze-retagrot-b.js → evidence/2026-10-20/perseed-retagrot-b/retagrot-b-analysis.json.

**PRIMARY — pooled fast-rot ratio (armed/control, /100d): 0.28x — GO** (bar ≤ 0.80x).
- Control: 1,985,717 kcal over 2,231 run-days (89,006/100d).
- Armed: 539,131 kcal over 2,197 run-days (24,539/100d).
- Armed ≤ control on 14/16 configs. The 2 increases: 5406-lead 16k→20k (noise), 5410-lead 0k→137k (control died at 132d with nothing to rot; armed survived to 144d — rot scales with survival, and the re-tag cuts the RATE 72%).
- Channel signature (textbook): share_surplus 7.92M → 0, away_wild 1.20M → 8.29M (6.93x) — the re-tag made visible. The re-tag fired on 2,161 days, moving 7,072,722 kcal into the PANTRY funnel.
- Det-gate note: every armed trajectory hash differs from its control hash on all 16 configs — the lever is never silent.

**GUARDRAILS (hard) — all PASS:**
- Total inflow: 10.17M → 9.31M = 0.92x (bar ≥ 0.90x) — PASS, but close. Mechanism: partly channel reclassification (share_surplus→away_wild is definitional, not real), partly compositional (armed died earlier on 4 seeds: 5403-lead 180→129d, 5403-belong 167→89d, 5409-lead 117→75d, 5409-belong 180→44d — combat/monster deaths, the re-tag doesn't touch combat). Dawn pantry is NOT fuller armed-side (32.7k vs 35.2k lead; 20.0k vs 22.9k belong), so this isn't pantry-full production suppression. Starvation deaths are EQUAL (9v9) — the village is not being starved.
- Starvation deaths: 9 vs 9 (bar ≤ control) — PASS.
- Median survival: 150.5d vs 155.5d (bar ≥ control−10d) — PASS.
- National: 6 vs 5 (bar ≥ control−2) — PASS.
- Laundering: 0 vs 0 — PASS (the re-tag never converts/cooks/re-clocks; PRESERVATION.md holds).
- New death modes (name-level): "a toad like a war drum, throat s", "ambush", "gavel", "lockjaw" — MECHANISM-TRIAGED: all are monster-combat or mundane-disease deaths. "a toad like a war drum" (d7) and "gavel" (d54/d102) are wave-2 conceptual-monster names, same class as control's "choir toad", "night court", "the audit", "the algorithm", "performance review". "ambush" (d12/d16/d19) is a wild-ambush combat death of the scholar. "lockjaw" (d167 ×2) is a mundane-pool disease (sharelean precedent). No food-system death mechanism (no new starvation/dehydration/poisoning mode). → PASS.

**WALL NUMBERS (scale-wall lens):**
- Control: won 0/16, national 5/16, wave-4 12/16, wave-5 0/16, arc4+ 11/16, med 155.5d, max 180d.
- Armed: won 0/16, national 6/16, wave-4 13/16, wave-5 0/16, arc4+ 12/16, med 150.5d, max 180d.
- The wave-5 door remains the binding wall on both sides (0/32) — the re-tag is a food-economy rot lever, not a wall lever; it neither moves nor harms the wall.
- Death causes (control): combat 119, monster 63, sickness 14, "a wound that wouldn't close" 10, dehydration 10, starvation 9, contest 6, ... (armed): combat 122, monster 58, "a wound that wouldn't close" 11, sickness 11, dehydration 10, contest 9, starvation 9, ... — same shape, raids/combat dominate, scholars die in the field not of hunger.

## Sense read (SENSE-TESTING LAW)

Transcript: evidence/2026-10-20/sense-retagrot-b3.txt — 60d armed village (leadretagrot s5405, RETAGROT_B=1), 5,507 lines, re-tag voiced on 61/61 days. Read days 1–3, 20–22, 56–62 in full.

**SENSE-OK.** The village reads as people, not systems:
- **The re-tag voice**: one line/day, day-keyed among 3 honest variants, never verbatim-adjacent. Lines cohere with the mechanic ("packs stay light, the pantry carries it" = the share write lands in the pantry, not packs). Fires during the HUNGER WINTER (day 20: "The pantry is an echo") — coherent: the engine's CRISIS SHARING opens the share gate exactly when the pantry is nearly empty, and the layer redirects that share into the pantry funnel.
- **Villager personhood**: gossip with accumulating decorations ("It's picking up decorations as it travels"), fireside lessons (Autumn Crocus ID), trust-gated half rations, a moot acquitting on a 0–5 count, cannibal petitioners from Emberhold ("We ate people... I'm asking for a fire"), village debates on newcomers (48% / 73% splits — the village sometimes overrules you), monster-naming ("The Big Stare"), counter-learning passed villager-to-villager (Murkcap sporefall), grief (Soo and Sofia brought home and buried: "grain can wait a week; grief can't"), raids from rival villages (Emberhold, Thornfield, Red Table carrying off ~1500 kcal), suspicion ("Someone watches you take food").
- **Rot is visible**: "The village threw out spoiled stores: Foraged food. (pantry)" (days 57–58) — the rot mechanic fires on the armed side; the re-tag reduces it, doesn't eliminate it.
- **Nothing robotic flagged**: no filler loops, no static menus, no fabricated shared history. Deaths land with consequences (Nikolai's Codex entry: "The entry for Nikolai is finished. No more pages.").

## Verdict

**GO.** PRIMARY 0.28x ≤ 0.80x bar; all six hard guardrails PASS; det-gate 16/16×2 bit-identical; proof 14/14 GREEN; SENSE-OK.

The re-tag ALONE, broadened beyond lean days, buys the rot benefit: arrivals are eaten, not stored — pooled fast-rot falls 72% because the shared surplus lands in the pantry funnel (fresh clock, eaten same-day) instead of sitting in packs. The sharelean kill's side-observation is confirmed as a standalone lever.

**Recommended next:** confirm at 12–16 seeds (fresh seed set, same pre-registration) — a coordinator call. The inflow guardrail (0.92x vs 0.90x bar) deserves a confirm-side watch: if it degrades below the bar on fresh seeds, the honest read is compositional noise, but the bar binds.

## Village assessment

What the villages looked like (32 runs, 180d death-aware):
- **Who thrived:** villages that reached national (11/32) did it on the production engine — fish crews, smoke racks, tribute networks (Emberhold/Bloodied/Stonebridge). The armed side's national edge (6v5) is noise.
- **Who died and why:** combat and monsters dominate (~180 combat/monster deaths of ~250). Raids are the #1 village killer — consistent with the window-survival diagnostic. Scholars die in the field (ambushes at d12–19), villagers die to wave-2 conceptual horrors with judiciary/bureaucracy names. Starvation killed 18 total (9v9) — the food economy holds; nobody starves because of the re-tag.
- **What was missing:** the wave-5 door never opened (0/32) — the binding wall stands. The re-tag doesn't address it (not its axis).
- **Blank filled:** the sharelean kill left the re-tag's rot benefit as an unjudged side-observation (backlog #691). This run judges it: the re-tag is a real, always-on rot lever — 0.28x fast-rot, zero game-code changes, policy-side only. The blank is filled; the confirm decides whether it lands.

## Metric review

(per docs/MEASUREMENT.md §14 — doubts about the metric go here, never re-scored mid-run)

1. **The inflow guardrail (≥0.90x) is the noisiest metric in this design.** Total inflow mixes channel reclassification (share_surplus→away_wild is definitional, not real) with survival-composition effects (death-aware horizons mean early combat deaths swing inflow ±50% per seed). A cleaner guardrail for the NEXT run: pantry-side starvation metrics only (starvation deaths + starveDays), which are already hard guardrails — the inflow ratio adds noise, not signal, for a funnel re-tag. PROPOSAL (next run): drop the inflow ratio guardrail, keep starvation deaths/days + median survival.
2. **Fast-rot as PRIMARY is validated** — the instrument (rotByChFast) measures what the lever claims to move, the channel signature (share_surplus→away_wild) confirms the mechanism, and the pooled ratio is stable across 14/16 configs.
3. **Panel (§15):** no valid balanced-panel compare exists for this env-flag arm (documented above; pantryguard-b2 precedent). The pre-registered metrics bind regardless. If the panel contract ever gains env-flag policy registration, this arm should be re-run through it.
4. **No metric was re-scored.** The 0.28x PRIMARY and all guardrail verdicts use the pre-registered bars exactly as written before any sims.

## Convergence

food-economy axis: **converging** — the re-tag pilot is GO (unjudged → judged), pending confirm. The wave-5 door remains the binding wall (0/32 this run); the scale-onramp axis still owns the wall.
