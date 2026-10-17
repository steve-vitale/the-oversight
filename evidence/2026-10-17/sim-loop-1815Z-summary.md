# Run summary — fleshout-20261017T1815Z (THREE-ARM RUN, 2 DIAGNOSTIC-GO / 1 PRIMARY-NO-GO, all landed)

Run: oversight-flesh-out-loop · axis: scale-onramp (blocking, standing directive) · lock run_id fleshout-20261017T1815Z.
All three arms registered with WT_RUN_ID matching the lock's run_id — no stale-lock incident this run.

## Arms

1. **sim-vetdemand** — DIAGNOSTIC GO (LANDED b49190ec): counterfactual veteran-demand analyzer (zero game code, read-only over the 32-run vetcompose corpus). PRIMARY GO 4/16 armed flips at bar level under (ii) cumulative-kills≥2 / (iii) living≥1 ∧ kills≥2 vs the engine's (i) 2-living-veterans rule (bar exactly 4/16). Gate-level: 0/4 flip runs would release on the composed win-side stack — armor co-binds at every observed deferral snapshot (the census's armor-fragility co-binder is the second lock). Control side: 3/5 flips WOULD release 12–19d before the day-90 win. Sense-testing: the transcript's veteran kills are collective fiction ("Together. (The village watches the broadcast. Nobody blinks.)"); rule (iii) honors both the fire's memory and the present-tense "blood your fighters" frame — (ii) alone would let the dead open wars. Sharpened steve-call input: loosen the veteran demand only alongside armor-fragility work; prefer (iii) over (ii). Analyzer det-gate byte-identical (sha256 5dd2f26a…), one hand-checked run matched exactly.
2. **sim-pyrrhic-verify** — DIAGNOSTIC GO (LANDED ac461ceb, [needs-eyes]): the named a2 fix (attrcensus) was ALREADY LANDED by the 1223Z run (94f78198 recordPyrrhicKill) — the worker rebuilt nothing and independently re-verified: proof test scripts/test-pyrrhic-20261017.js 13/13 GREEN (deed-boundary pins: scoreLedgerKill spy 0 calls, wave-unlock deeds UNCHANGED), then re-measured on a feastscale-only substrate (TRIBFLOOR off, differing from 1223Z): 32 runs 1911–1918 × {leadfeast,belongfeast} × {armed,control}, PRIMARY GO 3/3 pyrrhic trick kills recovered (control twins unattributed), det-gate 15/16 pairs byte-identical. One divergence root-caused: recordPyrrhicKill fires on ALL lost-fight kills (2 belltoads, zero trick perfs) → villageSlain→beasttricks teaching unlocks, trajectory forks. This sharpens the open steve-call: the teaching consequence fires for every lost-fight kill, not just trick-bearing ones — dead-scholar-tells-no-tales, or intended generosity? Sense-read: Ruth Goldstein's d101 mutual kill reads as mourning that teaches. §15 panel couldn't run (POLICY_REGISTRY lacks leadfeast/belongfeast at 94f78198^ — recommended backport tooling fix); the paired sweep served as the before/after instrument. Telemetry: 1 LOUD (wins 16→0) = pre-seat class, explained; baseline kept.
3. **sim-helpcost** — PRIMARY NO-GO, KILLED per §14 (evidence+instrument LANDED b2e1b520): the cost-accounting arm named by sim-helpcall2. Fresh seeds 970–995 × {leadfeast,belongfeast} × {armed,control}, 32 runs, instrument scripts/policies/helpcost.js (pure-observation: per-part runner-away day-parts, apex-episode census, runner-death situations; proof 15/15). PRIMARY missed: death delta −49 (armed buried MORE — opposite sign of helpcall2's +43), |26| unattributed > 20% bar; the 0.467x raid benefit did NOT replicate (post-invite 23 vs 22), per-exposure gain intact (+10.8) but exposure asymmetry swamped it (30 vs 25 apex episodes). SECONDARY GO: the 155.5-vs-172d survival gap REFUTED (181.5 vs 181.5, p=1.000, identical clock rates — helpcall2's guardrail tripped on noise). Engagement-volume question CLOSED: 42 placements ≈ helpcall2's 38 — substrate (TRIBFLOOR), not seeds; the 13 belongs to NODEWITNESS=1. Counted price: 2 aid-runner deaths (wave-graded road danger), 49 runner-day-parts away. Guardrails all HOLD. §15 panel: review_required (bearer deaths regression signal corroborates sweep direction).

## Wall this run

Pre-seat substrate: national 9–11/16, table 16/16, wins 0/16 (pre-seat by design), wave-4 0 on most seeds (unlock decouples from exposure), median ~180d. Full-stack substrate: unchanged from prior runs (national 12, table 16, wins 16 — baseline kept).

scale-onramp stays converging: veteran demand is the binding bar where the rest of the gate is open but fires into a still-locked gate alone; the pyrrhic blank is filled and verified; the aid-chain benefit is substrate-luck, not a reliable lever — the remaining 72% answers are the counter/trick execution window (trickfunnel named nexts) and armor fragility.

Directive lift remains a Steve call.

## Infrastructure

Mid-run master movement ×3 (loop B landings, journey-succession r22) — every landing rebase-then-merge in the worker tree + proof re-run green + unpiped merge with MERGE_EXIT checked; no conflicts (2 evidence+instrument arms, 1 analyzer). safe-commit.sh refused a directory-path add (evidence/2026-10-17/perseed-pyrrhic-verify/) — explicit file paths worked; worth a look at the script's dir handling. service restarts killed 2 background exec sessions mid-run (helpcost sweep/panel resumed from RESUME=1/cache cleanly).

## Files

- evidence/2026-10-17/sim-vetdemand.md + vetdemand-analysis.json; scripts/analyze-vetdemand.js
- evidence/2026-10-17/sim-pyrrhic-verify.md + perseed-pyrrhic-verify/ (33); scripts/sweep-pyrrhic-verify-20261017.js, diag-pyrrhic-diverge-20261017.js, sense-pyrrhic-verify-20261017.js
- evidence/2026-10-17/sim-helpcost.md + perseed-helpcost/ (32) + helpcost-beats/ (32) + panel-helpcost-{off,on}/panel.json.gz + panel-helpcost-compare.md; scripts/policies/helpcost.js, scripts/test-helpcost.js, scripts/sweep-helpcost-20261017.js, scripts/analyze-helpcost-20261017.js; scripts/sweep-compare.js (+5 additive leadcost/belongcost lines)

## Metric review

PRIMARY thresholds judged as pre-registered; only the pyrrhic §15 panel substitution deviated procedurally (documented in that evidence file). The helpcost miss is a genuine negative — the raid-benefit signal was exposure luck on fresh seeds, not an engine effect.
