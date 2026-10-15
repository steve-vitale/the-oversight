# SIM-TRIBHEALTH2 — ARM 2 NOT RUN: #257 named revival already built and killed as sim-tribstreak today (loop B, food-economy)

Date: 2026-10-15 · Loop: oversight-flesh-out-loop-b · Run: fleshout-b-20261015T0805Z · ARM 2 of 3
Worker tree: sim-tribhealth2 · Axis: food-economy (scale-wall lens) — tribute discipline.
Claims sim-findings #257 (tribute-timing revival needs the hungryStreak gate).

## What happened

This arm's full specification — policy-side early tribute pull-forward, pantry gate (pantryFreshDays() >= 4 + pantry kcal >= week's tribute), village-health gate on **progState().hungryStreak <= 2** (>= 3 = the engine's hunger-winter crisis threshold fired by actual individual intake, never v.hungryDays), link-stability gate (link age >= 14d, trust >= 30), pre-payment-depth beat said after payTribute confirms, belong-road-only by construction, default-OFF env gate, zero src/js changes, 8 seeds (11/22/33/44/55/66/77/88) × belongseek judged + leadcourt coverage, 180d death-aware, own control in the same sweep — was **already built, proof-verified (RED 6/6 + GREEN 15/15), det-gated (16/16 × 2), SMOKE-gated, piloted, and KILLED AT PILOT earlier today** by flesh-out loop B run **fleshout-b-20261015T021443Z ARM 1 of 2** ("sim-tribstreak", scripts/policies/tribstreak.js behind TRIBSTREAK=1).

Evidence: `evidence/2026-10-15/sim-tribstreak-b.md` · sim-findings **#261** ([killed], 2026-10-15).
The killed layer was deleted per kill protocol (verified this run: `scripts/policies/tribstreak.js` absent; proof + det-gate + sweep + sense + per-seed evidence retained).

**This arm was therefore not built and not piloted.** Re-implementing the identical instrument under a second env name would be a fifth early-payment timing variant of the tribgate → tribdisc → tribhealth → tribstreak lineage — exactly the work #261's metric review names as a wasted pilot:

> "The next tribute arm should NOT be another early-payment timing variant — it should either (a) change the tribute terms themselves (amounts, young-bond relief — see the young-bond relief-valve steve-call), or (b) prove the room exists first with a constructed scenario where the base discipline misses many weeks (predcond 6/6 pattern). A fifth early-pay variant without that proof is a wasted pilot."

## The measurement that already exists (tribstreak pilot, 8 seeds/side, belong road judged)

| metric (BELONG road) | control | armed (TRIBSTREAK=1) | tribstreak pre-reg |
|---|---|---|---|
| arrears notes | 14 | 13 | <= 8 (0.6x) — MISS |
| (missed+thin) weeks | 25 | 22 | <= 16 (0.65x) — MISS |
| full/thin/missed weeks | 81f/0t/25m | 78f/1t/21m | report |
| early pays | — | 54 (2 village holds — the hungryStreak gate bit, unlike the vacuous tribhealth gate) | report |
| starvation deaths | 5 | 4 | <= 7 PASS |
| hungryDays | 18 | 20 | <= 19.8 BREACH (0.2d) |
| national | 4/8 | 3/8 | >= 2 PASS |
| median survival | 106d | 115d | report-only |

Lead road: verb inert (0 fires), day-for-day identical both sides. **Killed at pilot per §14.**

Against THIS arm's pre-registered bars (starvation <= control AND hungryDays <= control × 0.85): starvation 4 <= 5 would pass, but hungryDays 20 <= 15.3 would miss — the primary fails on the same direction tribstreak measured. The mechanism reading stands: the current-tip base belongseek discipline already pays 81 full weeks with only 25 missed+thin; 54 early pays bought a 3-week net improvement. The room is gone.

## Metric review (§14)

1. **No re-run was spent, so no re-scoring question arises.** The arm's instrument, substrate, and question are tribstreak's; the kill is binding. Re-running a killed arm without a terms change would contradict both the kill protocol and #261's lineage note. The right action was one honest verification pass (layer state, evidence, findings) and a no-duplicate record — this file.
2. **The #257 finding's named next is answered and closed.** #257 asked for the hungryStreak gate; it exists, it was RED/GREEN-proven, it fires where the killed gate never did (2 live holds; G2b divergence fixture), and the tribute-timing discipline question was answered NO at pilot. Recommend the coordinator mark #257 superseded by #261 (not re-claimed) — the named revival is no longer an open arm.
3. **Coordination gap.** This run's claim file (fleshout-b-20261015T0805Z.json, coordinator-owned, read-only to this worker) claims #257 and names this evidence file as its deliverable — apparently written against a stale reading of sim-findings (missing #261). Recommend coordinators re-read sim-findings at ARM-PLANNING time, not just at loop start.
4. **The arm-2 slot is free for a genuine next step.** Options consistent with the axis and the lineage note: (a) a terms-change arm (amounts / asked-for relief path — note #258 already RULED against automatic young-bond relief, so the design space there is the asked-for renegotiation path); (b) the room-exists constructed-scenario proof (predcond 6/6 pattern) before any further timing work. Both are coordinator-level arm decisions — not taken here.

## Wall numbers

No sims were run by this arm (no duplicate pilot spend). Tribstreak's own wall numbers on identical substrate: national 8/16 · table 0/16 · wins 0/16 · wave 4–5 unlocks 8/0 · median 115d (armed) / 106d (control). The scale wall stands.

## Sense-testing

No new beats were generated. Tribstreak's sense pass (s77, 19 early pays) already verified the lineage's narration: every beat names the pre-payment depth + actual streak, cause line said only after payTribute confirms. Coherence PASS (carried).

## Blanks filled / documented

- **MEASURED ELSEWHERE, NOT DUPLICATED** (the #257 named revival — hungryStreak-gated early tribute pull-forward): implemented + killed at pilot by sim-tribstreak, run fleshout-b-20261015T021443Z, evidence evidence/2026-10-15/sim-tribstreak-b.md, sim-findings #261. This file is the non-duplicate record for the ARM-2 slot (run fleshout-b-20261015T0805Z).
- No new open findings appended (no sims run; nothing new observed).

## Convergence state

food-economy: **no-duplicate** (tribhealth2). The tribute-timing lineage is four arms deep and asymptoted; the hungryStreak instrument is proven policy-readable and retained in tribstreak's evidence for any future crisis policy. The arm-2 slot remains available for a terms-change or room-exists arm per #261's lineage note.
