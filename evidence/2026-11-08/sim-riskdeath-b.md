# sim-riskdeath-b — the risk-aware death-cause read on the healed leg (DIAG-NO-GO)

**Arm:** sim-riskdeath-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261108T1930Z · **Axis:** scale-onramp / winnability chain · **Tracker blank:** (1) from the 2026-11-08 1830Z review · **Branch:** sim-riskdeath-b, cut at master `6680d7924` · **Prereg:** evidence/2026-11-08/sim-riskdeath-b-prereg.md (committed 77b77f209, BEFORE any judged computation) · **Proof:** scripts/test-riskdeath-b.js — **8/8 green** · **Analyzer:** scripts/analyze-riskdeath-b.js (panel-only; no new sweep, no new panel build).

## Verdict: DIAG-NO-GO

No cause or cause family explains the risk-aware death increase on the healed leg. The lead candidate is real on totals but fails the interval leg of the prereg bar under BOTH interval methods, and the village-death increase is mostly monster kills, not human deaths.

- **Player deaths (the question):** risk-aware 43 → 55 (+12 over 8 seeds, +1.5/run). `player:the wild` accounts for +9 of the +12 (75%, over the 2/3 bar on share) — but its paired per-seed deltas are [7, 0, 0, 2, −1, 0, 1, 0]: the whole increase sits on three seeds (53001 +7, 53004 +2, 53007 +1) and five seeds are flat or down. Paired 95% t-interval [−0.99, 3.24] covers 0; the compare tool's own bootstrap interval [−0.13, 2.88] also covers 0. **Share passes, interval fails → NO-GO.**
- **Village deaths (the OR clause):** risk-aware 478 → 512 (+34, +4.25/run). The monster-kill family accounts for +23 of the +34 (68%, over the 2/3 bar on share) — but its paired deltas are [−1, 0, 2, −24, 3, 8, 23, 0]-shaped noise across seeds (t-interval [−8.24, 13.99], bootstrap [−6.63, 11.00]), both covering 0. **Share passes, interval fails → NO-GO.**
- The prereg bar requires BOTH share ≥2/3 AND an excluding-0 interval. Both candidates pass the first and fail the second. No other cause or family comes close on share (next best: violent family +14/34 = 41% of the village increase; `player:a stranger` +2; `player:the arena` +1).

## What the numbers actually say (the read, even though the bar fails)

1. **The player-death increase is a wild-death increase, concentrated, not a new way to die.** Every risk-aware player death on both legs is violent-family (wild / arena / contest / stranger); attrition player deaths are ZERO on both risk-aware legs. The healed leg adds no sickness, starvation, thirst, or wound bearer deaths under cautious play. The +12 is +9 wild, +2 stranger, +1 arena — and all of it is successor bearers (see 3).
2. **The village-death increase is two-thirds monster kills.** Decomposed, the +34 is: monster kills +23 (villager combat +22, combat +7, expedition −6), human deaths +11 (player +12, villager/person −1). The panel's `villageDeaths` metric sums ALL `row.deaths` values INCLUDING monster kills (ruling 753), so its `regression_watch` fired mostly on villagers killing MORE monsters. Human deaths rose by 11, and all 11 are bearer deaths; non-bearer villager/person deaths FELL by 1 (47 → 46... precisely: villager+person 47 → 46).
3. **First bearers are NOT the story; successors are.** Risk-aware first-bearer survival d30 is flat 7/8 → 7/8; d60 rises 0/8 → 2/8 (compare: `insufficient`, 7/8 pairs). First-bearer deaths 7 → 7 flat; successor-bearer deaths 36 → 48 — the ENTIRE +12 is successors. The capable leg is the mirror image: first-bearer survival d30 FELL 7/8 → 4/8 (`regression_signal` in the compare), while total capable player deaths fell 17 → 16. So the healed code does not kill first bearers under cautious play; it churns through successors faster once the first bearer falls.
4. **The increase is not exposure alone.** Risk-aware playerDeaths per 100 days rises 6.03 → 7.74 (capable 1.94 → 2.21). The healed risk-aware villages also live slightly shorter (median 69d → 67d), so the per-run +1.5 is a genuinely higher death RATE, not just longer runs accumulating deaths. Seed 53007 is the exception that proves it: it lives nearly twice as long on the healed leg (74d → 144d) and accumulates deaths of every kind (human 14 → 23, monster kills 45 → 68) — exposure DOES inflate its counts, but the panel-wide rate still rises.
5. **Seed heterogeneity is the whole story.** Risk-aware village-death deltas per seed: [18, −2, 3, −26, 1, 8, 32, 0]. Two seeds drive the increase (53001 +18, 53007 +32) and one seed offsets it (53004 −26, where monster kills fell 76 → 52 while the village lived longer, 94d → 109d). With n=8 and sd 16.7, no cause-level claim can clear an interval — the instrument is under-powered for this question at this band size, and the prereg bar correctly refuses the verdict.
6. **Capable contrast (why the same code kills fewer under capable):** capable player deaths 17 → 16 (wild 10 → 6, contest 2 → 4); human deaths 60 → 61 (flat); monster kills 415 → 367 (−48). Under capable the healed villages kill far fewer monsters while humans die at the same rate; under risk-aware they kill more monsters (+23) while bearers die more in the wild (+9). The same code change moves the two policies in opposite directions on kills — the heal's effect is policy-dependent, not a uniform deadliness change.
7. **One real paired signal, off the verdict path:** capable `person:alien` deaths fall 6 → 0, paired t-interval [−1.49, −0.01] and bootstrap [−1.38, −0.25], both excluding 0. The healed code stops aliens killing non-roster people under capable play. It explains no increase (it is a decrease, on the wrong policy), so it is an investigation note, not a verdict input.

## Per-seed cause tables (risk-aware, the judged policy)

Player deaths by seed (before → after). `wild` = `player:the wild`; other player causes in brackets; bearer-change days are the proxy death days (§ Day distribution).

| Seed | Player deaths | Wild | Other player causes | Bearer-change days (proxy) |
| --- | --- | --- | --- | --- |
| 53001 | 12 → 18 (+6) | 10 → 17 (+7) | arena 2 → 1 | 50,52,70,85,86,95,102,114,123,124,127,133 → 50,52,70,75,83,103,104,107,108,115,119 |
| 53002 | 0 → 0 | 0 → 0 | — | — |
| 53003 | 4 → 4 | 4 → 4 | — | 43,45,46 → 43,45,46 |
| 53004 | 9 → 12 (+3) | 9 → 11 (+2) | — → stranger 1 | 26,62,68,72,76,86,93 → 26,42,55,60,63,64,93,106 |
| 53005 | 2 → 2 | 2 → 1 (−1) | — → arena 1 | 48,60 → 45,51 |
| 53006 | 10 → 10 | 10 → 10 | — | 43,53,66,79,80,81 → 58,59,60,62,63 |
| 53007 | 1 → 4 (+3) | 1 → 2 (+1) | — → stranger 1, arena 1 | 61 → 70,74,82,141 |
| 53008 | 5 → 5 | 4 → 4 | contest 1 → 1 | 37,56,60,63 → 37,56,60,63 |
| **Total** | **43 → 55 (+12)** | **40 → 49 (+9)** | **stranger +2, arena +1** | |

Risk-aware human/monster totals by seed (before → after):

| Seed | Human deaths | Monster kills | Village deaths (panel) | Days | Wave |
| --- | --- | --- | --- | --- | --- |
| 53001 | 14 → 21 | 74 → 85 | 88 → 106 | 137 → 119 | 4 → 5 |
| 53002 | 9 → 7 | 30 → 30 | 39 → 37 | 55 → 62 | 4 → 4 |
| 53003 | 6 → 7 | 51 → 53 | 57 → 60 | 59 → 56 | 4 → 4 |
| 53004 | 14 → 12 | 76 → 52 | 90 → 64 | 94 → 109 | 4 → 4 |
| 53005 | 11 → 9 | 37 → 40 | 48 → 49 | 60 → 52 | 4 → 4 |
| 53006 | 10 → 10 | 30 → 38 | 40 → 48 | 94 → 71 | 4 → 4 |
| 53007 | 14 → 23 | 45 → 68 | 59 → 91 | 74 → 144 | 4 → 4 |
| 53008 | 12 → 12 | 45 → 45 | 57 → 57 | 64 → 63 | 4 → 4 |
| **Total** | **90 → 101 (+11)** | **388 → 411 (+23)** | **478 → 512 (+34)** | **median 69 → 67** | **w5 0 → 1** |

Full cause table (risk-aware, before → after, Δ, paired t-95%, bootstrap 95%):

| Raw cause | Before | After | Δ | t-95% | boot-95% |
| --- | --- | --- | --- | --- | --- |
| monster:villager combat | 243 | 265 | +22 | [−2.68, 8.18] | [−1.63, 7.13] |
| monster:combat | 45 | 52 | +7 | [−4.03, 5.78] | [−2.88, 4.88] |
| monster:expedition | 100 | 94 | −6 | [−4.18, 2.68] | [−3.38, 1.75] |
| player:the wild | 40 | 49 | +9 | [−0.99, 3.24] | [−0.13, 2.88] |
| player:a stranger | 0 | 2 | +2 | [−0.14, 0.64] | [0.00, 0.50] |
| player:the arena | 2 | 3 | +1 | [−0.41, 0.66] | [−0.25, 0.50] |
| player:contest | 1 | 1 | 0 | [0.00, 0.00] | [0.00, 0.00] |
| person:alien | 0 | 1 | +1 | [−0.17, 0.42] | [0.00, 0.38] |
| villager:a wound that wouldn't close | 3 | 7 | +4 | [−0.39, 1.39] | [0.00, 1.25] |
| villager:monster | 7 | 9 | +2 | [−0.82, 1.32] | [−0.50, 1.25] |
| villager:thirst | 4 | 5 | +1 | [−1.01, 1.26] | [−0.75, 1.13] |
| villager:sickness | 11 | 9 | −2 | [−0.64, 0.14] | [−0.63, 0.00] |
| villager:starvation | 10 | 8 | −2 | [−1.22, 0.72] | [−1.13, 0.25] |
| villager:the phoenix link | 12 | 7 | −5 | [−2.10, 0.85] | [−1.88, 0.00] |

Family table (risk-aware): monsterKill 388 → 411 (+23, t [−8.24, 13.99]); violent (human) 50 → 64 (+14, t [−0.69, 4.19]); wound 3 → 7 (+4); alien 0 → 1 (+1); thirst 4 → 5 (+1); sickness 11 → 9 (−2); starvation 10 → 8 (−2); other 12 → 7 (−5, all phoenix-link).

Capable cause table (contrast, before → after): monster:combat 157 → 124 (−33); monster:villager combat 231 → 205 (−26); monster:expedition 27 → 38 (+11); player:the wild 10 → 6 (−4); player:contest 2 → 4 (+2); person:alien 6 → 0 (−6, the only excluding-0 paired signal in the corpus); villager:monster 9 → 13 (+4); villager:sickness 8 → 11 (+3); villager:thirst 2 → 5 (+3); villager:wound 6 → 3 (−3). Capable family table: monsterKill 415 → 367 (−48); violent (human) 27 → 30 (+3); sickness 9 → 13 (+4); thirst 3 → 6 (+3); alien 6 → 0 (−6); wound 6 → 3 (−3).

## Day-of-death distribution (proxy — see caveat)

The panels carry no per-death day records, so days come from the bearer-change proxy (`samples[].bearer` changes; each change implies the previous bearer died the day before, ±1 sample day). The proxy captures 35/43 before-leg and 37/55 after-leg player deaths — it UNDERCOUNTS, because two bearer deaths between consecutive daily samples collapse into one observed change (samples are daily; the only gap is the known d2→d4 instrument shape). Buckets are a lower-bound sketch, not a census:

- Bearer-change days pooled, risk-aware before (n=35): d1–30: 1; d31–60: 12; d61–90: 14; d91+: 8.
- After (n=37): d1–30: 1; d31–60: 16; d61–90: 11; d91+: 9.
- Living-NPC drops pooled (net human deaths per day, joins aside), before n=84: d1–30: 6; d31–60: 33; d61–90: 30; d91+: 15. After n=91: 5 / 36 / 30 / 20.

No day-bucket shift: deaths concentrate in d31–90 on both legs. The increase is spread across the mid-game, not an early wipe or a late collapse. The first bearer almost never dies before d30 on either leg (1/35 before, 1/37 after in the proxy; survival30 7/8 both legs).

## Sense-testing

Read the committed doorwalk day-records for seed 53001 (the seed that carries half the player-death increase) on both legs, plus the panel sample series for risk-aware 53001-after.

**Collapsed 53001 (doorwalk, 88 days, village-lost, standing 199, regional).** The village loses ten people and the story reads as a slow thinning: Mara dies in a contest on day 37; Sanjay is killed by the Spool on day 38; Oliver is betrayed on day 41; Tomas dies of a wound that won't close on day 45; then the wild takes Nikau (day 47), Owen (50), Marcus (56), Lauren (58), and finally Declan (81). Four wild deaths in twelve days in the middle of the run — the village keeps going, the roster shrinks, the pantry empties at the end. Nothing incoherent; the deaths are spaced, named, and each has a distinct mechanism.

**Healed 53001 (doorwalk, 105 days, village-lost, standing 275, regional).** The same village lives seventeen days longer and meets the wave-2 conceptual monsters the collapsed village never saw: Tomas is killed by the Hummice on day 40; the wild takes Oliver (41), Nikau (49), Owen and Marcus on the same day (51), Hassan (58); Lauren is betrayed on day 68; Aki dies of a wound on day 74; James is killed by The Eulogy on day 76; Mauricio dies of a wound on day 82; Tom is killed by Ad Break on day 84; Sanjay dies in combat on day 86; the wild takes Mara (90) and Nino (91); Siphokazi is killed by The Suburb on day 97; Declan dies in the wild on day 104; Tariq and Daniyar on day 106. The healed village is not safer in the wild — it is out in the wild MORE, longer, meeting stranger monsters, and the wild keeps taking people at the same steady rate. That is exactly what the panel read says in numbers: wild deaths dominate, and the increase is exposure-shaped (more days out, more wild deaths), not a new killer.

**Panel risk-aware 53001-after (119 days, village-lost).** The sample series ends in a clean collapse, not a glitch: nine living on day 100, six on day 103, four on day 107, a brief recovery to seven on day 112 as joiners arrive, five on day 115, four on day 118, and zero on day 119 with the last bearer's health at 0 — the village dies out with its last scholar. The day-by-day ledger moves sensibly throughout (standing climbs, waves unlock, roster shrinks as people die). No robotic repetition, no incoherent jumps.

**"Ad Break" / "The Eulogy" are NOT new death causes — correction to sim-53007-a.** The 53007 arm recorded them as unmapped death causes on current master. They are monster NAMES: the healed 53001 fallen list has James killed by "The Eulogy" (cause `monster`) and Tom killed by "Ad Break" (cause `monster`), and `src/data/monsters.json` carries both names, plus "Sweeps Week", "The Moderator", and "Buffering" — which appear in the panel rows as `villager:<name>` cause strings via the villager-agency death path (`src/js/villager-agency.js`: cause = monster name). In the panels a villager killed by one of them reads as `villager:monster` (doorwalk fallen path) or `villager:<monster name>` (villager-agency path) — the same death recorded two ways. The 53007 registration gap is closed differently than proposed: there is nothing to register; the classifier should map monster-name cause strings to the violent/monster family (see Findings).

## Wall numbers (re-derived from the panel rows, both legs)

| Leg × policy | National | Table (sits, ruling 665 = entered) | Wins | Median survival | Wave 4 | Wave 5 | Max arc |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Collapsed × capable | 7/8 | 6/8 | 6/8 | 91.5d | 8/8 | 4/8 | 4 |
| Healed × capable | 7/8 | 6/8 | 6/8 | 90.5d | 8/8 | 2/8 | 4 |
| Collapsed × risk-aware | 0/8 | 0/8 | 0/8 | 69.0d | 8/8 | 0/8 | 3 |
| Healed × risk-aware | 0/8 | 0/8 | 0/8 | 67.0d | 8/8 | 1/8 | 3 |
| Full seat | 0 everywhere (all wins are the lesser seat) | | | | | | |

Note: `row.table` reads 7/8 on the capable legs while `row.entered` reads 6/8; per ruling 665 the sittings count is `entered` (6/8, matching the published compare). The analyzer reports both (`tableFlag` 7/8) so the discrepancy is visible, not hidden.

## Metric review

- The prereg bar (≥2/3 share AND excluding-0 paired t-interval) did its job: `the wild` owns 75% of the player-death increase on totals, and a totals-only read would have declared it the cause. The per-seed distribution ([7,0,0,2,−1,0,1,0]) says otherwise — three seeds carry it, five do not. The bar refuses a verdict that five flat seeds contradict. No re-score was performed.
- **Interval-method note:** the TOTAL risk-aware player-death increase (+1.5/run) is significant under the compare tool's bootstrap interval ([0.375, 3], excludes 0) but NOT under the preregistered t-interval ([−0.40, 3.40], covers 0). The prereg binds the t-interval, so the cause-level test fails on its own terms — but the disagreement is worth recording: the compare's bootstrap is the instrument that published the `regression_signal`, and a t-test on the same 8 diffs does not reproduce its significance. Either the increase itself is method-fragile at n=8, or the bootstrap is the right tool for these skewed diffs. A follow-up with more seeds (or a recorder sweep with day-level causes) settles which; this arm does not re-litigate the compare's method.
- The `villageDeaths` metric's monster-kill contamination (ruling 753) is confirmed as a live misread risk: 68% of its +34 is kills. Any future sentence about "the village dying more" from a panel compare must decompose first. The compare contract could carry a human-deaths metric alongside; that is a tooling note for the next arm, not a re-score here.
- The day-of-death secondary is a proxy by construction (35/43 and 37/55 capture). If the next arm needs WHEN deaths happen per cause, it needs a recorder sweep, not a better proxy.
- **Prereg bucketing note (no re-score):** the prereg filed monster-name cause strings (`villager:Big-Eyes` etc.) as OTHER. The code read during this arm (`villager-agency.js` cause = monster name; `monsters.json` names) shows they are monster kills and belong in the violent family. Re-bucketing changes NOTHING in the judged verdict: risk-aware has no such keys, and the capable violent family would move by ±1 on 1-count cells. The verdict stands on the prereg table; the re-registration is proposed for the next prereg (see Findings).

## Method note

- CANON.md read first; DISEASES.md + MONSTER-WAVES.md for the area (two pools; wave-2 conceptual horrors are named monsters — The Eulogy, Ad Break, The Suburb, The Moderator, Buffering, Sweeps Week — which is what resolves the 53007 registration gap). No canon doc covers death-cause classification; the taxonomy used is the 53007 classifier's + death-census.js's kind-aware taxonomy, extended by the registrations in the prereg.
- Panel-only: no sweep, no panel build, no extraction. The analyzer reads the committed `panel.json.gz` files; the map sums reproduce both panel metrics on all 32 rows (proof test asserts this on the real corpus).
- Proof: `node scripts/test-riskdeath-b.js` — 8/8 green (kind-aware fixtures, planted-cause DIAG-GO fixture, smeared-cause DIAG-NO-GO fixture, real-corpus totals + first-bearer split + recorded verdict).
- No game-code change. `git diff HEAD -- src/` is empty. No EPERM flap observed this run. The safe-commit index clobber struck the prereg commit once — repaired via the documented `ls-tree | update-index --add --index-info` pipe; blob verified == HEAD.

## Blanks filled / documented

- **Filled:** the risk-aware death-cause read is now answered as far as the panels can answer it — DIAG-NO-GO, with the lead (`the wild`, +9, three seeds) and the decomposition (villageDeaths +34 is ⅔ monster kills; human +11 is entirely successor bearers; first bearers flat) named in full. The analyzer + proof test are committed as the reusable instrument.
- **Documented (not fixed):** the Ad Break / Eulogy correction (monster names, not causes); the interval-method disagreement on the total increase; the capable `person:alien` 6 → 0 paired signal; the `villageDeaths`-includes-kills misread risk; the bearer-change proxy's undercount; the phoenix-link fall (12 → 7, show deaths down on healed code).

## Findings to append

(The coordinator appends these to hidden_files/sim-findings.md — listed here, not appended by this arm.)

- [open] 2026-11-08 — death-cause read — risk-aware player-death increase on the healed leg has no single cause: `player:the wild` +9/12 (75%) but paired t-interval [−0.99, 3.24] covers 0 (three seeds carry it: 53001 +7, 53004 +2, 53007 +1); DIAG-NO-GO per the prereg bar (sim-riskdeath-b).
- [open] 2026-11-08 — panel metric — `villageDeaths` includes monster kills (ruling 753): the risk-aware +34 is +23 kills / +11 human deaths; the guardrail fired mostly on villagers killing MORE monsters. A human-deaths metric alongside would stop the misread (sim-riskdeath-b).
- [open] 2026-11-08 — death taxonomy — "Ad Break" / "The Eulogy" are monster NAMES, not death causes (fallen lists + monsters.json); `villager:<name>` cause strings are the villager-agency path recording the monster's name as the cause. Next classifier prereg should map monster-name causes to the violent/monster family instead of OTHER (sim-riskdeath-b, correcting sim-53007-a).
- [open] 2026-11-08 — death-cause read — risk-aware successor-bearer deaths carry the whole +12 (36 → 48); first-bearer deaths flat 7 → 7, survival d30 flat 7/8. The healed code churns successors under cautious play; first bearers are untouched (sim-riskdeath-b).
- [open] 2026-11-08 — death-cause read — capable `person:alien` deaths 6 → 0 with paired t-interval [−1.49, −0.01] and bootstrap [−1.38, −0.25], both excluding 0: the healed code stops aliens killing non-roster people under capable play. Unexamined mechanism (sim-riskdeath-b).
- [open] 2026-11-08 — measurement — the total risk-aware player-death increase (+1.5/run) is significant under the compare's bootstrap ([0.375, 3]) but not under a paired t-interval ([−0.40, 3.40]) at n=8. Method-fragile at this band size; a recorder sweep or a wider band should settle it (sim-riskdeath-b).
- [open] 2026-11-08 — death-cause read — phoenix-link deaths fall 12 → 7 on risk-aware (godhood show deaths down on healed code); mechanism unexamined (sim-riskdeath-b).

## Convergence

scale-onramp stays converging (NOT converged): the risk-aware death-cost question is answered as NO-GO (no cause found), the full seat is still unreached (0 everywhere), wins still come only through the lesser seat, and the healed code's death effect is policy-dependent (capable kills fewer monsters, risk-aware kills more and loses more successors). Next blanks, in order: (1) a recorder sweep with day-level per-death causes on the risk-aware leg (the panel cannot say WHEN each cause kills; a wider band or a recorder resolves whether `the wild` is real); (2) the socialite/winse ek panel columns for the flip; (3) the post-endpoint bisect on 53007 (medic duty first). food-economy stays converging (untouched).
