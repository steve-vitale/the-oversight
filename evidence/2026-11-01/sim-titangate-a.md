# sim-titangate-a — Titan-gate refusal + Game.say capture

- Run: `fleshout-loop-a-20261101T1235Z`, axis scale-onramp (converging, NOT converged).
- Arm: DIAG ONLY. Zero `src/js` changes, no gate threshold moved, no existing policy file edited. New instrument files only.
- Verdict: **DIAG-GO.** All eight preregistered bar items pass (see Proof and legs).
- Stack (named exactly; numbers are NEVER compared across stacks/bases): substrate `scripts/policies/tableseat-nowait.js` (`LEANLINKRESCUE=1`, `TABLESEATNOWAIT=1`); recorders reused UNMODIFIED: `scripts/policies/fullseat-diag.js` (`FULLSEAT=1`), `scripts/policies/wavegate-diag.js` (`WAVEGATE=1`), `scripts/policies/vet2-diag.js` (`VET2=1`), `scripts/policies/vet2mfg-diag.js` (`VET2MFG=1`); new instrument: `scripts/titangate-a-sweep.js` (sweep driver + `Game.say` / `startCombat` / fight / removal wrappers), `scripts/titangate-a-analyze.js`, `scripts/titangate-det-compare.js`, `scripts/test-titangate-a.js`. Splitter `scripts/vet2mfg-split.js` reused UNMODIFIED.
- Band: 16 seeds 95301–95308 + 95311–95318 — a deliberate REUSE of the vet2mfg band (same stack, same band, same horizon), because the reproduction leg requires it.
- Horizon: `DAYS=180`, death-aware (runDays ends dead villages early).
- Corpus: `evidence/2026-11-01/perseed-titangate-a/` (16 files).
- Analysis: `evidence/2026-11-01/titangate-a-analysis.json`.
- Preregistration: `evidence/2026-11-01/sim-titangate-a-prereg.md` (commit `83f0ad9873011f1075abe280f4d000e9d8e96b8b`), plus Amendment 1 (commit `1c84b08e0de43b6da4b92c9a4228cecb89ff247d`).

## Preregistration history (read before trusting the numbers)

- The prereg was committed BEFORE any judged sims. A single-seed smoke run (95304, output to scratch only, never judged, never split into evidence) confirmed the instrument end to end and surfaced one refinement, fixed by Amendment 1 before any judged data existed: non-titan return-nulls are not always gate refusals — on 95304 the moderator and murkcap return-nulls speak a full fight-dissolve narration and resolve with a joined tbEnd (`routed`) the same day. The analyzer therefore reports `dissolvedSelf` per streak and excludes dissolved self-resolutions from `foughtAfter`. The reproduction leg and GO bar are unchanged by the amendment.
- Mid-run interruptions, both recovered without data loss: the container EPERM write flap killed the first smoke run's stdout write (the sim itself had completed; the re-run reproduced the identical done line, and the judged 95304 run reproduced it a third time); the safe-commit index clobber struck the instrument commit (worktree files byte-identical to HEAD, main index showing them deleted — repaired with `git update-index --add --cacheinfo` per the repo lesson, status clean, commit intact). Neither touched judged data.

## The answers, pooled (16 seeds)

| measure | count |
|---|---|
| refused audiences (startCombat creating no fight, vet2mfg definition) | 200 |
| titan-gate refusals (titan kind, return-null, not entry-refused) | 183 |
| titan-gate refusals with a captured `Game.say` line spoken during the call | 183 |
| **say coverage over titan-gate refusals** | **183/183 = 100%** |
| distinct gate refusal line texts (normalized for have/need numbers) | 2 (herald + nielsen variants of one line) |
| refused audiences unclassified | **0** |
| refused audiences by kind | herald 36, nielsen 147, other 17 |
| refused audiences by mechanism | return-null 200, entry-refused 0, threw 0 |
| `captureErrs` across all judged seeds | 0 |

### Q1 — What fraction carry a captured line, and what do the lines say?

100% (183/183). Every titan-gate refusal speaks exactly one line during the refused call, and there is only ONE refusal reason text in the whole band, modulo the titan's title and the have/need numbers:

> ⛔ THE HERALD / THE NIELSEN does not notice you the way prey notices a hunter. It notices you the way weather notices a field. You cannot face this alone — sound the call, muster N allied blades (you have M). This is not courage. This is arithmetic.

No second reason, no campaign-gate line, no variant wording appears anywhere in 183 refusals. The vet2mfg recorder gap is closed and its cause is confirmed: the gate calls `Game.say` directly, never `sysSay`, so a `sysSay` wrapper cannot hear it — while wrapping `say` hears every refusal, including repeats `emit` would dedupe for display.

### Q2 — Is refusal purely muster-completeness, or do other gates refuse too?

On this band, refusal is purely muster-completeness — and the completeness is always the same shape: **have 0, need 10 (herald) or 12 (nielsen), on all 183 refusals**. No village in the band ever formed even a partial muster for the refused titan (final muster state is empty on the refused seeds; the gate's own outcomes detail agrees: gate `muster`, have 0, need 10/12, every time). There is no `complete-but-refused` case, no campaign-gate case, and no partial muster (have 1–9) anywhere. The gate never sees a coalition that fell short — it sees no coalition at all.

The 17 `other` return-nulls are a different phenomenon, not a second gate: every one of them resolves with a joined tbEnd (mostly `routed`) and dissolve narration ("It comes apart — no one in reach, no one chasing. The fight ends; they melt back into the wilds.") — a fight that began and dissolved, not a refused audience. The return-null heuristic is valid for titans (zero titan refusals carry a tbEnd) but over-counts for non-titans; the analyzer now separates the two (see Amendment 1). Three `other` streaks carry TWO joined tbEnds for one start (mirrormoth 95303, living_wire 95308, bright_idea 95312) — a double-tbEnd curiosity, mechanism unknown, filed as an observation, not a claim.

### Q3 — What happens after a refusal?

Titan streaks (3) — one of each outcome:

| streak | refusals | days | next | detail |
|---|---|---|---|---|
| 95304 herald | 29 | 161–165 | fought | wild fight day 180, villagers flee (vFlee) — the same herald, via the wild router, as vet2mfg reported |
| 95312 herald | 7 | all day 169 | removed | removal day 170, no fight ever — the herald leaves the day after its refusal day |
| 95312 nielsen | 147 | 143–167 | lingering | still on the board when the village is lost day 172; never fought, never removed |

Across all 19 streaks (titan + other): fought 5, lingering 6, run-ended 6, removed 2. Lingering + fought (11) outnumber removed (2) — the refused monster usually stays or comes back as a fight, it rarely leaves. The herald's day-170 departure on 95312 is the exception, not the shape. At every refusal the titan is present on the board (world-present count exactly 1, all 183 times) — the pacing monster is really there, pacing, not a phantom.

### Q4 — Does the 95312 nielsen pattern match the herald pattern?

Yes on all three axes: same gate (`muster`, never campaign), same line shape (the arithmetic line, title swapped, have 0 / need 12), and repeated re-attempts while pacing (147 refusals over days 143–167, ~6 per day, monster present every time). The only difference is scale and aftermath: nielsen refuses ~5x as often as the heaviest herald streak and lingers to the run's end, while the 95312 herald refuses 7 times in a single day and leaves the next day. The wave-5 gate shape is the wave-4 gate shape, louder.

### Q5 — SENSE-TESTING: does a refusal beat read as a sensible decision?

Yes — read two beats, both first-refusal-of-kind captures (ring buffer + refusal line):

- **Herald, 95304 day 161.** The ring runs: "Omar heads out for water." → "— DUSK — Animals stir again." → "You wait. The light changes. Nothing asks anything of you." → then the Herald's line. The refusal lands exactly where the fiction puts it: you are waiting at dusk, something huge is on your tile, and the voice that answers is not a villager deciding — it is the gate stating a fact of scale ("notices you the way weather notices a field"). As a decision it is sensible: the game refuses a solo fight that would be suicide, says so in one characterful line, and tells you the exact remedy (sound the call, muster 10). What is NOT sensible is the repetition the instrument also proves: the same line, 29 times in 5 days (and 147 times for nielsen), because the herald keeps stepping onto your tile and being refused tick after tick. The line is good; hearing it 29 times is the pacing problem, not a wording problem. (Whether repeated refusals should throttle their telling is a design question for a later arm — this arm only proves the repetition exists and is spoken every time.)
- **Nielsen, 95312 day 143.** The ring runs through loot, a grave-robbed bone knife, coming home bloody, a learned Ambush, water hauling, "The eye opens. The viewer counter ticks up." / "👁️ It moves." / "The pupil dilates" — the show apparatus noticing — then gossip by the fire, Valeria leaving to forage, dusk, waiting — then the Nielsen's line. The beat coheres: the ratings titan arrives as the audience leans in, and the refusal is the same arithmetic. The fiction holds; the number (have 0 of 12) is the story — nobody has begun mustering at all.

## Hypotheses (judged)

- H1 (capture ≥ 90%, single text): CONFIRMED — 100%, one text.
- H2 (herald all muster-incomplete; nielsen either campaign or likewise all muster): CONFIRMED on the informative branch — nielsen is likewise ALL muster, have 0. No campaign gate observed in 183 refusals.
- H3 (lingering + fought outnumber removed): CONFIRMED — 11 vs 2 pooled, 2 vs 1 titan-only.
- H4 (nielsen matches herald on gate, line, re-attempts): CONFIRMED.

## Per-seed refusal table

unlock / refused / gate (herald+nielsen) / coverage / streak nexts

| seed | unlock | refused | gate | cov | streaks (next) |
|---|---|---|---|---|---|
| 95301 | 91 | 2 | 0 | — | murkcap fought (dissolved), white_noise_heron lingering (dissolved) |
| 95302 | never | 0 | 0 | — | — |
| 95303 | 134 | 1 | 0 | — | mirrormoth run-ended (dissolved ×2) |
| 95304 | 119 | 31 | 29 | 1.00 | herald fought, moderator fought, murkcap run-ended |
| 95305 | 66 | 0 | 0 | — | — |
| 95306 | 162 | 2 | 0 | — | bright_idea lingering, nightcourt lingering (both dissolved) |
| 95307 | 66 | 0 | 0 | — | — |
| 95308 | 84 | 3 | 0 | — | glasswing run-ended, living_wire fought (dissolved ×2) |
| 95311 | 79 | 1 | 0 | — | gavel run-ended (dissolved) |
| 95312 | 75 | 156 | 154 | 1.00 | herald removed, nielsen lingering, bright_idea run-ended, living_wire lingering |
| 95313 | 136 | 2 | 0 | — | cliffhanger lingering, moderator removed (both dissolved) |
| 95314 | never | 1 | 0 | — | living_wire fought (dissolved) |
| 95315 | 59 | 1 | 0 | — | moderator run-ended (dissolved) |
| 95316 | 83 | 0 | 0 | — | — |
| 95317 | never | 0 | 0 | — | — |
| 95318 | 74 | 0 | 0 | — | — |

Per-seed end fields reproduce vet2mfg's table exactly (endDay/won): 95301 170 lost, 95302 181, 95303 180 lost, 95304 181, 95305 84 lost, 95306 181, 95307 125 lost, 95308 99 won, 95311 96 won, 95312 172 lost, 95313 181, 95314 140 won, 95315 126 won, 95316 96 won, 95317 15 lost, 95318 181.

## Village assessment (plain words)

Your village never even starts the coalition the titan demands. When the Herald or the Nielsen paces onto your tile, the game stops the fight and tells you, plainly and every time, that you cannot face this alone — you have zero of the ten or twelve allied blades it needs. Nobody has sounded the call; no muster exists to fall short. So the titan keeps pacing and keeps being refused — 29 times on one village, 147 times on another — while life goes on around it (water fetched, gossip by the fire, dusk falling). Usually the titan is still there when the story ends, or it finally gets a wild fight that the villagers run from; once, the Herald simply leaves the next day. The refusal itself is honest and well-written. The blank it exposes is upstream: mustering — the call, the coalition, the reason to gather blades — never begins on any seed in this band, so the gate never gets anything but zero to judge.

## Blanks filled or documented

- Filled: `Game.say` capture instrument (say-wrapper + call-join + ring-buffer beats); exact refusal→line join for all 183 gate refusals; gate purity (muster only, have always 0); post-refusal fates per streak; nielsen/herald pattern match; the `other` dissolve reclassification (return-null + tbEnd = dissolved fight, not refusal).
- Documented, not filled (for later arms, not this one): why no muster ever forms (the call is never sounded — the upstream blank this arm exposes but does not explain); whether repeated refusal lines should throttle their telling (the 29×/147× repetition is spoken every time — a design question, not an instrument gap); the double-tbEnd joins on three `other` streaks (mechanism unknown); why the 95312 herald leaves the day after refusing while the nielsen lingers (departure rule uninstrumented).

## Metric review (mandatory)

- **Pre-registration bound the run.** The GO bar was judged exactly as written: 16 complete seeds, coverage 100% (bar 90%), 100% classified, reproduction exact (36 / 147), neutrality on 2 seeds, determinism on 1 seed, proof green, sense beats read. No re-scoring, no bar moved after seeing results. The two declared denominator exclusions (entry-refused, non-titan return-nulls) were fixed in the prereg before sims; in the event, the band contained zero entry-refused and zero throws, so the exclusions did not affect the headline coverage — and the `other` exclusion is now strengthened by evidence (all 17 dissolve, none are gate refusals).
- **Amendment 1 is the one judgment call, and it preceded all judged data.** It changed only what "what happens next" means for `other` streaks (dissolved self-resolutions excluded from `foughtAfter`); the judged corpus was generated after the amendment, and the smoke corpus it was based on was never judged data. If the amendment had been applied to judged data in place, the next-class results would be suspect; because the data was generated under the amended analyzer, they stand.
- **Doubts filed, not resolved by re-scoring.** (a) Final-muster alive counts are approximations (the gate's exact counter is internal); refusal-time have/need from the outcomes detail is exact and governs completeness — and on this band every refusal's outcomes detail is present, so no approximation was needed for any gate refusal. (b) "Removed" means a `removeWorldMonster` call for that type after the last refusal; whether the 95312 herald's day-170 removal is a departure or wave cleanup is unclassified by this instrument (it reads as departure — no fight, no slain flag — but the rule is uninstrumented). (c) "Captured line" means spoken by the gate (the wrapper sees the call); `emit` may dedupe a repeat for display, so on-screen repetition may be less than the spoken count — the 29×/147× figures are spoken counts.
- **Revisions for the NEXT run, not this one.** A muster-formation arm should pre-register: call-sounding attempts (does the player/village ever attempt the call?), muster growth over time (allies joining day by day), and what blocks the first blade — since this arm proves the gate always judges zero, the question moves upstream of the gate.

## Proof and legs (evidence, not assertion)

- Proof test `scripts/test-titangate-a.js`: **38 passed, 0 failed, 0 skipped** on the 16-seed corpus (31 synthetic cases + 7 corpus legs re-deriving verdict gates: 16 seeds, captureErrs 0, unclassified 0, coverage ≥ 0.90, herald refused == 36, 95312 nielsen refused == 147, every seed complete).
- Recorder-neutrality leg: TITANGATE ON vs OFF end fields identical on 2 seeds — 95304 (survived/181d/global) and 95308 (over-other/99d/global, won) — all 8 compared fields same on both (`DET-COMPARE … -> PASS`).
- Determinism leg: ON re-run byte-identical to judged corpus on 95304 (`cmp` clean).
- Recorder/capture errors: 0 on all 16 judged seeds (`captureErrs` 0 in every done line and every JSON).
- Instrument commits: prereg `83f0ad9873011f1075abe280f4d000e9d8e96b8b`; instruments + Amendment 1 `1c84b08e0de43b6da4b92c9a4228cecb89ff247d`.
- Readiness: merged locally, pending ship — NOT pushed, NOT version-bumped, NOT live-verified (the coordinator merges; the ship loop owns pushes).
