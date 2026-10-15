# sim-lev15census — succession ×1.5 tribute-leverage census (2026-10-15)

Diagnostic arm for **sim-findings #323** (steve-call, stays OPEN): OLD-LINK SUCCESSION HAS NO ANSWERABLE BEAT.
Zero src/js changes — instrument only (`scripts/lev15-lib-20261015.js` + sweep + proof).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING)

- **Nature**: diagnostic arm, NOT a lever. No lever GO/NO-GO. The deliverable is numbers + a design-call brief for #323.
- **PRIMARY (instrument GO)**: attribution rate ≥ 90% — every aloud leverage verdict paired with a wrapped event; unpaired verdict lines or link-history leverage notes count as misses. AND the frequency/magnitude/compounding distributions reported honestly.
- **Horizon**: 180d death-aware (the harness stops dead villages; +10d tail max). **Seeds**: 11/22/33/44/55/66/77/88. **Policies**: leadfeast, belongfeast (plain feastscale base; TRIBSHIELD deleted — the base policies never answer beats). **Substrate**: FEASTSCALE_R13=1, asserted up front (sweep fatals without it).
- **Instrument**: read-only spies on `successionCrisis`, `theirLeaderDied`, `_resolveRenegotiation` (the 7-day expiry funnel — see "instrument finding" below), plus `breakLink` for dissolution days. Detects the engine's `Math.round(tributeKcalPerWeek * 1.5)` via before/after snapshot per call. Det-gate: ON vs OFF byte-identical trajectory hashes.
- **Convergence state**: converging (diagnostic; first measurement of this mechanism).

## Instrument finding (before the numbers)

`_renegotiationTick` (hierarchy.js) calls `_resolveRenegotiation(link, pr, false)` **directly** — it never routes through `answerRenegotiation`. The first version of this census wrapped `answerRenegotiation` and scored attribution 50% on belongfeast-s11 (2 events, 1 unpaired verdict: the 7-day expiry). The wrapper now sits on `_resolveRenegotiation` (both paths funnel through it; `chosen` separates 'wait-chosen' from 'expiry-7d'). Sweep re-ran clean. This is documented, not a game bug — but it is the same class of "silent path" #323 is about.

## GO verdict

**DIAGNOSTIC-GO.** Attribution 35/35 = **100%** (bar ≥90%). Every event carries a complete trail (link id, day, call site, role, kind, age, trust before/after, arrears before/after, tribute before/after, compounding depth, young-national window, rank, the aloud verdict). Instrument errors: 0 across 16 runs. Det-gate byte-identical (proof D1/D2).

## The distributions (16 runs, 35 leverage events, 11 links)

**Frequency**: 35 events / 16 runs = 2.2 per run. 11 of 16 runs saw ≥1 application; 5 leadfeast runs saw 0 (lead road forms fewer sub-links; all events are Haven-as-**subordinate**, role=100% subordinate — the lead road's own-subordinate links never took leverage in this sample).

**Call sites**: `successionCrisis` 25 (71%) — all old links, Haven's speaker died, immediate ×1.5, no beat. `renegotiation:expiry-7d` 10 (29%) — staged young-link beats that expired unanswered; silence answers and the deferred leverage lands anyway. `theirLeaderDied` 0 in this sample (Haven-primary links rare on the belong road).

**Age**: old (≥21d) 27, young (<21d) 8 — all 8 young are beat expiries, never successionCrisis. Age at application: min 7d, median 42d, max 150d.

**Trust at application (old links)**: min 0, median **86**, max 100. The leverage lands on the HEALTHIEST links — high-trust bonds, not neglected ones. Neglect is not the mechanism's habitat.

**Arrears**: median 0 before; max 102,500. The ×1.5 does not need arrears to fire — it *creates* them (tribute bill outruns the pantry; arrears accrue downstream). arrearsAfter > arrearsBefore within the same call: 0/35 — the crisis moves tribute, never arrears directly.

**Magnitude (weekly hike)**: min 2,500, p50 3,750, p90 12,657, max 22,782, mean 5,912 kcal/week per application.

**Compounding depth** (×1.5s stacked on one link): depth1: 11, depth2: 8, depth3: 7, depth4: 5, depth5: 3, depth6: 1. The deepest link (belongfeast-s44): 6,000 → 68,345 kcal/week, arrears 118,231 at end, outcome DEMOTE. The s77 link (the #323 exhibit): 5,000 → 7,500 → 11,250 → 16,875 → 25,313 → **37,970** kcal/week across two beat-expiries + three successionCrisis applications — five deaths, trust 49–72 throughout, arrears 0 at every application.

**Young-national window**: 6/35 inside the realm's first 60 national hold-days; 29/35 outside. (National was rare this sample — see wall numbers.)

**Outcomes per link** (dissolve > paid-off > demote > hold): hold 7, dissolve 3, demote 1, paid-off **0**. No link ever bought the leverage back down. Dissolves: 2 'walked', 1 'succession'. The 7 holds carry tribute bills of 7,500–37,970 kcal/week with arrears up to 75,940 — they hold the link and starve the pantry.

## The village this substrate showed (wall numbers, 16 runs)

Median survival 136d. **national 0, table 14, wins 0.** (14 table seats with 0 national — the table routes that don't require national; reported as measured.) Death-aware: 13 runs ended village-lost, 3 survived to 180d.

## Sense-testing (SENSE-TESTING LAW)

Read the belongfeast-s77 beats end to end (in the per-seed record). The spiral reads as political attrition, not numbers: young-link beats expire ("Seven days of silence, and the silence answered for Haven"), then each death's leverage lands with "Grief is leverage, and they know it" — and Thornfield raids the pantry after every grab ("They carried off ~1,500 kcal… Nobody's dead, but the message is clear"). Chapters, not bugs.

## Design-call brief for Steve — the #323 question

**The measured facts** (16 runs, 35 attributed events, 100% trail):

1. Old-link succession (≥21d) applies the ×1.5 **immediately** — no beat, no verb, no recourse. 25 of 35 events. It lands on high-trust links (median trust 86), arrears-free, and compounds without bound: 5,000 → 37,970/week over five deaths on one link; 6,000 → 68,345/week (depth 6) on another.
2. The young-link answerable beat (<21d) does NOT stop the leverage in practice on the base policies: all 8 young-link events are **beat expiries** — the beat was staged, nobody answered, silence answered, the deferred ×1.5 landed anyway. Answering is the only way to prevent it, and the base policies never answer.
3. Outcomes: nothing ever pays the leverage back down (paid-off 0/11). Links either hold the bill and starve (7), dissolve (3), or drag the polity down with them (1 demote at depth 6, 118k arrears).
4. The 7-day expiry path is invisible to any policy-side instrument that watches `answerRenegotiation` — it bypasses it entirely (instrument finding, above).

**The question (unchanged, now with numbers):** should old-link succession stage an answerable beat (gift/visit/wait with real costs, per the young-bond ruling's "relief must be asked for") instead of applying the ×1.5 immediately — or is the immediate leverage the intended "grief is leverage" pressure, and the compounding is the game working as designed? A game-code lever, not policy-side. #323 stays OPEN; the diagnostic exists for it.

## Metric review (§14)

1. The pre-registered GO bar was met (100% attribution ≥ 90%), and the distribution is reported without re-scoring. The bar was the instrument's, and it held on the second sweep after the expiry-path fix — the first sweep's 50%-attribution run (belongfeast-s11) is discarded, not averaged in; it measured the old wrapper, not the mechanism.
2. **Sample caveat**: all 35 events are Haven-as-subordinate (the belong road). The lead road produced zero leverage events — Haven-primary `theirLeaderDied` leverage (hierarchy.js:1657) is unmeasured. A future census on a lead-dominant substrate should close that.
3. **Outcome taxonomy note**: 'demote' is polity-relative (rank at end < rank at event). On a 0-national sample it fired once via regional demotion. The taxonomy holds but the demote cell is thin.
4. **No lever was run.** Nothing to kill, nothing to land.

## Blanks filled / documented

- **FILLED (instrument)**: the `_resolveRenegotiation` direct-call path — a policy-side wrapper on `answerRenegotiation` is structurally blind to the 7-day expiry, the same blindness class as #323. The census watches the funnel, not the door. Proof G6 pins it.
- **DOCUMENTED**: the young-link beat's practical failure mode — staged beats expire unanswered on base policies (8/8), so the answerable surface only exists when a policy answers. Filed in the brief above.
- **CLAIMED**: none. #323 stays open for Steve.

## Files

- `scripts/lev15-lib-20261015.js` — the census instrument (read-only).
- `scripts/sweep-lev15-20261015.js` — the sweep driver (SMOKE + full sweep; GO bar enforced).
- `scripts/test-lev15-20261015.js` — proof (9/9: G1–G6 attribution fixtures incl. compounding + 7d expiry, D1/D2 det-gate, H1 honesty).
- `evidence/2026-10-15/telemetry-lev15census/` — 16 per-seed records + `lev15-summary.json`.
