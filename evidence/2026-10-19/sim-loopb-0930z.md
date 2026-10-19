# Loop B run fleshout-loop-b-20261019T0930Z — food-economy, 3 arms (2 landed levers + 1 narration fix + 1 integrity repair)

Axis: food-economy (second non-converged axis; loop A live on scale-onramp, zero file overlap). Substrate: FEASTSCALE_R13=1/SEATDRIVE=0 pre-seat, competent-player policy + variants, death-aware horizons, balanced panels per §15.

## Recovery first
The dead 0730Z run's arms were both finished by good-neighbor finishers before this coordinator acted:
- sim-doomrevive-b2 landed 00b63e8b6 (09:31Z, ff-merge; verified: policy-side layer + proof 45/45 + evidence; #619 FIXED).
- sim-cookbulk-confirm-b landed f53227a4d (09:34Z) WITH STALE VERDICT NUMBERS (7-seed partial: 24,849/118v117/2v0/11v12) committed alongside the full 64 per-seed files.

## Arms this run

### (a) sim-cookbulk-repair-b — evidence integrity repair, LANDED 8ef833b3e
Recomputed primary + guardrails independently from the 64 committed per-seed JSONs; rewrote the Verdict to the true full-64 figures; rebuilt the summary JSON; did the deferred sense-testing read; wrote a reusable repair analysis script.
- PRIMARY mean cooked kcal b3 = 24,653.6 ≥ 20,000 → GO (control 0)
- median survival 120.5d vs 111d (bar ≥101) → GO
- starvation deaths 8 vs 15 (bar ≤17) → GO
- national 24/32 vs 22/32 (bar ≥20) → GO
- no new death mode → GO; laundering 0 → GO
- Watch (metric review, not guardrail): exiled 2 (b3) vs 0 (control).
Wall numbers (full 64): national 75%/69%, table 81%/78%, wins 0/64 both, wave4 59%/56%, wave5 0, median 120.5v111d, max 180d. GO holds — the full-64 story is honestly stronger than the stale partial.

### (b) sim-trapline-teach-b — SNARETEACH teach drive, PILOT GO, LANDED 9797a7238
The trapline chicken-and-egg finding (0 traps crafted/set in 12/12 establishment sims; snare L1+ gated on knowing villagers): a policy-side drive (SNARETEACH=1, default OFF, zero src/js) that courts the trapper — one held sitting/day via the real teach beat + a surplus gift — accelerating the trust-15 regard gate. Killed before sim spend: "stay home to witness" (probe: playerAtHaven already true at every return) and NPC-side steering (out of policy lane).
- Before/after (8 seeds x leadfeast/belongfeast, 180d): scholar snare-L1 learn rate 4/8→5/8, median learn day 6→2 (both pre-registered GO disjuncts met; proof 11/11).
- Gift never fired (0/8, surplus bar too high); sittings alone moved the metric.
- Survival 144→105d on paper = noise (no mechanism, death-cause mix identical, paired median diff 0; §15 panel: review_required/no signal). Wall unmoved (national 7/8, table 0, wins 0, waveMax 4 both).
- Sense: the teach reads as a person teaching a person ("Theo catches you watching the snares come off the line..."). PASS.
Documented (not filled): snare_wire L2/L3 trap_success mechanicals dormant (zero readers) — new backlog item; gift-bar refinement; seed-screening note (s11 starts L3, s44 dead cast); blind-craft 3+3 materials gate downstream. Status: converging.

### (c) sim-beatidentity-b — narration blank fill, LANDED 25094e45e
Two 2026-10-13 narration/sense findings fixed, voice-only, zero RNG draws, zero mechanics:
- Sentimental-item devotion beat now threads each item's `memory` field (the holder's lived story) between "You hold X." and the beat core; generic "worn smooth by use" retired.
- Spoil mutter: deterministic day-keyed speaker variety ("A woman, maybe 20s gives the smoke rack a long look, then walks off."), same-day rotation stable, teaching line byte-identical.
Proof test-beatidentity-20261019.js GREEN (0 failures) on rebased tip; prosefix regression: feasts-fired assertion fails identically on pristine base (pre-existing seed drift since 10-17, not this change). Both findings marked [fixed] in sim-findings.md.

## Village assessment (plain words)
The food economy on this substrate is not broken — it is at its floor (racksanswer-b's verdict, reaffirmed). This run's honest wins are reachability blanks: the batch-cook trigger is now confirmed on 64 runs (the village's batch-cook day visibly moves the needle, ~25k kcal/side, no survival cost); the scholar can now deliberately learn the snare wire instead of waiting for a mid-run joiner to apprentice them (the teach moment is human); and the village's voice stopped repeating itself on the beats that matter (devotion lines now know the object). No rot lever will move the scale wall from here — the wall is measured open on food and bound on survival/window combat.

## Metric review
- The f53227a4d integrity bug: a finisher landed correct-looking data with stale analysis. Pre-reg against the committed data, not the claim text; coordinators must recompute verdict numbers from the committed per-seed files before trusting a landed commit.
- Trapline metric review: median survival on n=8 is a noise metric — next runs gate on panel deaths/community-loss instead.
- check.js --quick hung 3.5+ min on an untouched-by-arm call — filed as infra anomaly (worker report).
- git EPERM flap active with longer windows (~50 min incident class) — every git write was probe-gated; no routing around.
- TELEMETRY DEVIATION CHECK (Steve 2026-10-13): `node scripts/telemetry-check.js --baseline scale-wall.json --current 'perseed-cookbulk-confirm-b/*.json' --metrics national,table,wins,exiled` returned LOUD lines (national 12→46, table 16→51, wins 16→0). INVESTIGATED, NOT A REGRESSION: the baseline is the full win-side stack substrate (FEAST + TRIBFLOOR + SUCCGRACE + RAIDDENSITY + WINPURSUIT + WINDEFER + SEATDRIVE, post-seat, wins 40/48); the current data is pre-seat FEASTSCALE_R13=1/SEATDRIVE=0 (wins 0/64 by substrate design). Apples-to-oranges by construction — the valid before/after is each arm's own paired control on identical seeds, and both arms went green on those terms. Do not re-investigate this comparison.

## Convergence state
- sim-cookbulk-repair-b: converged (confirm + repair both landed)
- sim-trapline-teach-b: converging (pilot GO; confirm 12–16 seeds is the named next)
- sim-beatidentity-b: converged (fix landed)
- food-economy axis: converging (no wall movement expected from this class of arm)

All three merged locally, pending ship (ship loop owns bumps/pushes).
