# sim-pelletpass-alone-b — the pellet pass alone does NOT heal the band (median 82d, sits 3/8) — AMBIGUOUS, minimal set is {#15, #16}

**Arm:** sim-pelletpass-alone-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261108T1230Z · **Axis:** scale-onramp / winnability chain · **Tracker blank:** (3) · **Findings:** #1885 · **Branch:** sim-pelletpass-b (tip `e434f6b4`, base master `715c2918d`) · **Prereg:** `evidence/2026-11-08/sim-pelletpass-alone-b-prereg.md` (commit `d10eefa3a`, before any judged sweep) · **Instrument:** doorwalk driver, BASELINE leg only (TAKESEAT_B=1, DOORWALK_B off), 150d death-aware, frozen band 53001–53008, full 8. Corpora committed under `evidence/2026-11-08/perseed-pelletpass-alone-b/`. Proof `scripts/test-pelletpass-alone-b.js` **26/26 green**.

## Verdict: AMBIGUOUS on the full-8 bars — the pellet pass alone does NOT heal the band

The counterfactual — #14 base (`2bc17d793`) + ONLY the pellet-pass change (`git diff e6ddaf32a 685dc9ec4 -- src`, `src/js/progression.js` +104) — reads **AMBIGUOUS**: median **82d**, sits **3/8**. It fails BOTH flip bars (median ≥120d AND sits ≥4/8). Per the pre-registered GO bars (prereg, committed before any judged sweep): anything else → AMBIGUOUS/COLLAPSED, and **the finger stays with the interval #15..#16**. No re-scoring, no friendlier metric.

**Attribution, precisely stated:** the minimal flipping set is **{#15, #16}** — both steps required, proven by construction. Removing #15 from the healed code state (this arm: #14 + pellet pass only) does NOT reproduce the heal. The two landings heal different villages by different routes, and neither alone reaches the bars: #15 heals the starvation village (53005) and the early-death village (53003); #16 heals the long-lived villages (53001, 53002) — but only on top of #15. The fingered landing stays the interval, not a single commit; the tracker must record the minimal set as the pair, not #16 alone.

The staircase, complete, full-8 medians: collapsed control 70.5d → #8 100d → #9 108.5d → #14 103d → #15 119d → **pellet-alone 82d** → #16 145d = healed control 145d. Sits: 0/8 → 2/8 → 4/8 → 4/8 → 4/8 → **3/8** → 4/8 → 4/8. The pellet pass alone sits BELOW #14 on both bars — it is not a partial heal, it is a step back from #14 on the median (−21d) and on the sits (−1), even while it heals one seed exactly.

## Per-seed table — pellet pass alone on the #14 base, full 8

| Seed | Days | End | Standing | maxWave | Seat | w4 | w5 | vs #14 | vs healed |
|---|---|---|---|---|---|---|---|---|---|
| 53001 | 105 | village-lost | 275 | 5 | — | 5 | 2 | 67d → 105d | exact (105/275/5) |
| 53002 | 59 | village-lost | 100 | 4 | — | 0 | 0 | 139d → 59d, seat lost | 140d → 59d |
| 53003 | 45 | village-lost | 84 | 3 | — | 0 | 0 | identical (45d) | 65d → 45d |
| 53004 | 150 | survived | 199 | 4 | lesser d90 | 8 | 0 | identical days/seat/stand; w4 9 → 8 | exact days/seat/stand; w4 3 → 8 |
| 53005 | 54 | village-lost | 199 | 4 | — | 1 | 0 | identical (54d, exactly collapsed) | 150d → 54d |
| 53006 | 150 | survived | 820 | 5 | lesser d90 | 6 | 3 | identical days/seat; stand 675 → 820, w5 8 → 3 | 150d, overshoots (820 vs 199, w5 3 vs 0) |
| 53007 | 59 | village-lost | 134 | 4 | — | 0 | 0 | identical (59d) | 50d → 59d |
| 53008 | 150 | survived | 199 | 4 | lesser d97 | 4 | 0 | identical days; seat d141 → d97, w4 1 → 4 | exact days/seat/stand; w4 3 → 4 |

0 instrument errors on all 8 seeds. Full-8 median 82d, sits 3/8. Smoke (53004 alone, 12:54:26–12:54:57Z, ~31s) validated the instrument before any judged seed; the other 7 seeds ran in one invocation (12:55:04–12:57:39Z, ~2.6 min). Total sim time ~3 min — the box was quiet.

## Flip tables (analyzer)

Collapsed control → pellet-alone: `A collapsed-control: n=8 median=70.5d sits=0/8 verdict=COLLAPSED; B pelletpass-alone: n=8 median=82d sits=3/8 verdict=AMBIGUOUS; seeds with moved death day: 7/8; instrument errors A=0 B=0`. Moved: 53001 +17, 53002 −25, 53003 −23, 53004 +77, 53006 +84, 53007 −4, 53008 +58. Unmoved: 53005 only (54d, exactly collapsed).

| Seed | Collapsed days | Alone days | Δdays | Collapsed seat/sat | Alone seat/sat | Collapsed stand | Alone stand | Collapsed w4 | Alone w4 | end |
|---|---|---|---|---|---|---|---|---|---|---|
| 53001 | 88 | 105 | +17 | — | — | 199 | 275 | 3 | 5 | village-lost → village-lost |
| 53002 | 84 | 59 | −25 | — | — | 100 | 100 | 0 | 0 | village-lost → village-lost |
| 53003 | 68 | 45 | −23 | — | — | 120 | 84 | 0 | 0 | village-lost → village-lost |
| 53004 | 73 | 150 | +77 | — | lesser d90 | 199 | 199 | 2 | 8 | village-lost → survived |
| 53005 | 54 | 54 | 0 | — | — | 199 | 199 | 1 | 1 | village-lost → village-lost |
| 53006 | 66 | 150 | +84 | — | lesser d90 | 190 | 820 | 1 | 6 | village-lost → survived |
| 53007 | 63 | 59 | −4 | — | — | 125 | 134 | 0 | 0 | village-lost → village-lost |
| 53008 | 92 | 150 | +58 | — | lesser d97 | 199 | 199 | 3 | 4 | village-lost → survived |

Mid14 → pellet-alone: `A mid14: n=8 median=103d sits=4/8 verdict=AMBIGUOUS; B pelletpass-alone: n=8 median=82d sits=3/8 verdict=AMBIGUOUS; seeds with moved death day: 2/8; instrument errors A=0 B=0`. Moved: 53001 +38, 53002 −80. Unmoved on days: 53003, 53004, 53005, 53006, 53007, 53008 — but their internals move: 53004's w4 kills 9 → 8, 53006's standing 675 → 820 and its wave-5 kills 8 → 3, 53008's seat comes 44 days earlier, d141 → d97, w4 1 → 4.

| Seed | Mid14 days | Alone days | Δdays | Mid14 seat/sat | Alone seat/sat | Mid14 stand | Alone stand | Mid14 w4 | Alone w4 | end |
|---|---|---|---|---|---|---|---|---|---|---|
| 53001 | 67 | 105 | +38 | — | — | 199 | 275 | 2 | 5 | village-lost → village-lost |
| 53002 | 139 | 59 | −80 | lesser d90 | — | 100 | 100 | 0 | 0 | village-lost → village-lost |
| 53003 | 45 | 45 | 0 | — | — | 84 | 84 | 0 | 0 | village-lost → village-lost |
| 53004 | 150 | 150 | 0 | lesser d90 | lesser d90 | 199 | 199 | 9 | 8 | survived → survived |
| 53005 | 54 | 54 | 0 | — | — | 199 | 199 | 1 | 1 | village-lost → village-lost |
| 53006 | 150 | 150 | 0 | lesser d90 | lesser d90 | 675 | 820 | 11 | 6 | survived → survived |
| 53007 | 59 | 59 | 0 | — | — | 134 | 134 | 0 | 0 | village-lost → village-lost |
| 53008 | 150 | 150 | 0 | lesser d141 | lesser d97 | 199 | 199 | 1 | 4 | survived → survived |

Mid15 → pellet-alone: `A mid15: n=8 median=119d sits=4/8 verdict=AMBIGUOUS; B pelletpass-alone: n=8 median=82d sits=3/8 verdict=AMBIGUOUS; seeds with moved death day: 5/8; instrument errors A=0 B=0`. Moved: 53001 +38, 53002 −29, 53003 −20, 53005 −96, 53007 +9. Unmoved on days: 53004, 53006, 53008 — but 53004's w4 kills rise 3 → 8, 53006's standing rises 425 → 820, 53008's seat comes 44 days earlier, d141 → d97.

| Seed | Mid15 days | Alone days | Δ | Mid15 seat/sat | Alone seat/sat | Mid15 stand | Alone stand | Mid15 w4 | Alone w4 |
|---|---|---|---|---|---|---|---|---|---|
| 53001 | 67 | 105 | +38 | — | — | 199 | 275 | 2 | 5 |
| 53002 | 88 | 59 | −29 | — | — | 199 | 100 | 0 | 0 |
| 53003 | 65 | 45 | −20 | — | — | 199 | 84 | 1 | 0 |
| 53004 | 150 | 150 | 0 | lesser d90 | lesser d90 | 199 | 199 | 3 | 8 |
| 53005 | 150 | 54 | −96 | lesser d99 | — | 199 | 199 | 2 | 1 |
| 53006 | 150 | 150 | 0 | lesser d90 | lesser d90 | 425 | 820 | 2 | 6 |
| 53007 | 50 | 59 | +9 | — | — | 75 | 134 | 0 | 0 |
| 53008 | 150 | 150 | 0 | lesser d141 | lesser d97 | 199 | 199 | 1 | 4 |

Healed control → pellet-alone: `A healed-control: n=8 median=145d sits=4/8 verdict=HEALTHY; B pelletpass-alone: n=8 median=82d sits=3/8 verdict=AMBIGUOUS; seeds with moved death day: 4/8; instrument errors A=0 B=0`. Only 53001 matches the healed endpoint exactly (days, seat, standing, wave-4 kills, and — verified below — the fallen list itself). 53004 and 53008 match on days/seat/standing but kill more wave-4 monsters (8 vs 3, 4 vs 3). The other four seeds are all short of healed.

| Seed | Healed days | Alone days | Δ | Healed seat/sat | Alone seat/sat | Healed stand | Alone stand | Healed w4 | Alone w4 |
|---|---|---|---|---|---|---|---|---|---|
| 53001 | 105 | 105 | 0 | — | — | 275 | 275 | 5 | 5 |
| 53002 | 140 | 59 | −81 | — | — | 199 | 100 | 1 | 0 |
| 53003 | 65 | 45 | −20 | — | — | 199 | 84 | 1 | 0 |
| 53004 | 150 | 150 | 0 | lesser d90 | lesser d90 | 199 | 199 | 3 | 8 |
| 53005 | 150 | 54 | −96 | lesser d99 | — | 199 | 199 | 2 | 1 |
| 53006 | 150 | 150 | 0 | lesser d90 | lesser d90 | 199 | 820 | 3 | 6 |
| 53007 | 50 | 59 | +9 | — | — | 75 | 134 | 0 | 0 |
| 53008 | 150 | 150 | 0 | lesser d97 | lesser d97 | 199 | 199 | 3 | 4 |

## Mechanism — #15 makes the food, #16 moves it; alone, the pass has nothing to move in 53005

The control analysis (0530Z) showed the healing signature is starvation disappearing: collapsed 7 starvation deaths → healed 0 (plus Boris d47 in 53007, the one death the healed endpoint itself keeps). Death-cause census, pellet-alone full-8 (83 fallen): 'the wild' 29, sickness 11, **starvation 11**, monster 9, wound 6, combat 5, ambush 4, arena 2, betrayal 1, stranger 1, Callback 1, thirst 1, night 1, contest 1. Eleven starvation deaths — worse than #15's four and #16/healed's one. The pellet pass alone does not remove starvation from the band; it moves it between villages. At #15 starvation sits in 53002/53007/53008; under the pellet pass alone it sits in 53003 (3), 53005 (5), 53007 (3).

**53005 is the proof.** Its fallen list under the pellet pass alone is **identical to the collapsed control's, day for day, name for name, cause for cause, all 13 deaths** — Robin ambushed d13, Joshua killed by The Callback d26, Cheryl lost in the wild d29, Caleb dead in combat d36, Desmond dies of a wound that won't close d39, Patrick of sickness d43, Aki to a monster d48, then five villagers starve on d50–51 (Adriano, Nikolai, Somchai, Jorge, Anayo), Brian dies in combat d52, village gone d54. The pellet pass changes nothing there — because there is nothing to pass. #15's first-rung fix is what lets the village's self-taught cooks and preservers actually gain the skill, so the village can feed itself at all; the pellet pass only re-routes food that already exists. In 53005, at the 10-XP first rung, nobody learns the work fast enough, the food never exists, and the pass is a dead lever. The two landings are complements, not substitutes: #15 makes the food, #16 moves it.

**53001 is the counter-proof.** Its fallen list under the pellet pass alone is **identical to #16's and to the healed control's, all 18 deaths** — Tomas d40 monster, then the wild takes nine, Lauren d68 betrayal, wounds and monsters through the autumn, The Editor killed d86 and d91, Daniyar d106 the wild, village gone d105. The pellet pass alone is 53001's healer, exactly and completely: 105d, standing 275, 5 wave-4 kills, 2 wave-5 kills (both The Editor). #15 never moved this seed (67d at #14 and #15 alike); the pass alone moves it the full +38d to the healed endpoint.

**53002 collapses worse than anywhere.** It dies at 59d with only 7 fallen — Joseph d9 wound, Kieran d31 sickness, Cheryl d37 monster, Colton d43 sickness, Ava d51 sickness, Nino d54 wound, Wilhelm d57 the wild. No starvation at all: a sickness cluster in the second month thins the village and it folds with most people still alive. It shares only the first death with #14's 53002 and only Joseph with #15's. At #14 it sat d90 and died d139; at #15 it died d88; healed it lives to 140d. Under the pellet pass alone it dies earliest of all — 80 days short of #14, 81 short of healed. The pass reshuffles who eats what and when, the downstream rolls change, and this seed draws the short straw. It is the seed that costs the median: sorted days 45, 54, 59, 59, 105, 150, 150, 150 → median (59+105)/2 = 82d.

**53006 overshoots further than #14.** It survives, sits d90, but stands at **820** (vs 675 at #14, 425 at #15, 199 at #16/healed) with 3 wave-5 kills (spoiler d122, timeslot d140, editor d149) and — the only seed anywhere in the staircase — an end-state `readiness5` that reads **ready: true, veterans 2/2** (at #14 veterans 0, at #15/#16 veterans 1). The pellet pass alone lets this village bank both veterans and hunt wave 5 harder than any prior point. The overshoot #15 half-tamed and #16 landed exactly is worst here: the pass without the skill-pace fix makes the strong village stronger and the starving village no better.

**53004 and 53008 keep the #14 kill-heavy shape.** 53004 kills 8 wave-4 monsters (influencer d46, congregation d50/d55, eater d57, strike d87/d149, influencer d131, suburb d131) where #15/#16 kill 3 — the same #14 pattern (9 kills, same mids) minus one. 53008 sits at healed timing (d97, not d141) but kills 4 wave-4 monsters vs the healed 3. The pellet pass alone does not tame the kill counts; #15's presence does.

## 53005 reading — EXACTLY COLLAPSED, as at every point before #15

53005 stays exactly collapsed under the pellet pass alone (54d; fallen list identical to the collapsed control — see Mechanism). It was exactly collapsed at #5, #7, #8, #9, and #14, and it heals only at #15 and #16 — that is, only where the first-rung fix is present. Its healer is #15, not #16, and the pellet pass alone cannot substitute. The 53005 caveat that ran through the whole bisect ("do not declare the healer found on any screen that leaves 53005 collapsed") is satisfied here in the negative: this arm leaves 53005 collapsed, so it cannot name a healer — and it does not.

## One village's trajectory, in plain words (53001 — the seed the pass alone heals)

The first five weeks are the collapse's shape: Tomas killed by a monster on d40, Oliver lost in the wild d41, Nikau d49, Owen and Marcus together d51, Hassan d58. Then it splits from #14/#15, where the village dies at 67d with eleven fallen. Here the village keeps going: Lauren is betrayed d68, Aki's wound won't close d74, James is killed by a monster d76, Mauricio's wound d82, Tom d84 — and the scholar's party kills the congregation d60, the algorithm d83, the herald d84, and The Editor twice, d86 and d91. Mara, Nino, Siphokazi, Declan, Tariq, Daniyar are lost in the wild and to monsters through the autumn, and the village is gone on d105 with 18 fallen — exactly the healed endpoint's story, death for death. The pellet moves to hungrier hands at dawn, the village eats through the second month, and the long-lived village that used to die at 67d lives to 105d. The same village under the same pass, without the first-rung fix beside it, still starves in 53005 on the same days — the pass feeds a village that can feed itself, and only that village.

## Village assessment — what the villages looked like

Three villages out of eight live out the 150 days, and all three sit down at the lesser table — the same three that sit at #14, minus 53002, which sits at #14 and dies unseated at 59d here. The other five die on schedules close to #14's, including the two that die early (53003 at 45d, 53007 at 59d — both identical to #14, fallen list and all) and the one that never heals anywhere (53005 at 54d, exactly collapsed). Nothing about the villages' daily life reads robotic: the death lists cohere with #14 where the seeds did not move (53003, 53005, 53007 identical fallen lists), and with the healed control where the seed healed (53001 identical fallen list). The odd village out is 53006: it stands at 820, hunts wave 5, banks both veterans — the strongest village on the staircase, and still only the lesser seat, because the table prices standing the village never converts.

Sense-check: sit days read from `takeseatStats.seatDay` (taken day). 53005's corpus shows `seatDays.lesser: 20` with `tsTaken: 0`, i.e. the table priced a lesser seat from d36 but nobody ever took it; it counts as no sit, correctly — same as at #14. 53002's lost seat (sat d90 at #14, unseated here) is the one sit the counterfactual costs, and it is what drops the sits bar from 4/8 to 3/8.

## Wall numbers (pellet-alone, full 8)

- National 0/8, table sits 3/8 (lesser only), wins 0/8 (baseline leg never walks a door).
- Wave-4 unlocks 8/8, wave-5 unlocks 2/8 (53001 — standing 275, 2 w5 kills; 53006 — standing 820, 3 w5 kills).
- Median survival 82d; max 150d; min 45d.
- Telemetry deviation check: not run — DIAG screen, no lever before/after; the classification is the validity check.

## Balanced panel (§15) — attempted, sweep-corpus screen only, NOT a panel verdict

Built flat sweep rows for the pellet-alone corpus (`policy: doorwalk-baseline`, `won`, `entered`/`table` = seat taken per panel-contract ruling 665, `maxRank` = `scaleRank`; `playerDeaths` not carried by doorwalk rows, never imputed) and ran two compares under `evidence/2026-11-08/panel-pelletpass-alone-b/`:

1. #14 → pellet-alone: decision **`review_required`**, exit 2. Table win rate 0 → 0 (descriptive); table entry rate 0.5 → 0.375, `regression_watch` (the one seed lost is 53002, which sat at #14 but not under the pellet pass alone); table sitting rate 0.5 → 0.375, `regression_watch`; national scale access 0 → 0. Every other contract metric is `not_observed`.
2. #16 → pellet-alone: decision **`review_required`**, exit 2. Same shape: table entry/sitting 0.5 → 0.375, `regression_watch` (the one seed lost is 53005, which sat at #16 but not under the pellet pass alone); win rate 0 → 0; national 0 → 0; everything else `not_observed`.

The compare .md files are attached below in full. The tool's own note says it plainly: **"Sweep-corpus comparison, NOT a balanced-panel verdict … For a §15 panel verdict, build real panels with scripts/balance-panel.js."** A real §15 verdict needs real panels built under both roots (16 matched seeds × policies) — that is panel-contract lane work, not a doorwalk-corpus compare, and this run does not fake one. The flip tables above are the before/after comparison for this run, on identical seeds, judged against the pre-registered bars.

### Attached compare .md (`compare-mid14-vs-pelletalone.md`, full text)

```markdown
# Sweep-corpus comparison (not a balanced-panel verdict)

**Decision: review_required**


## doorwalk-baseline

8 paired cases; screen only; review_required.

| Metric | Before | After | Paired delta | 95% exploratory interval | Pairs | Status |
| --- | ---: | ---: | ---: | --- | ---: | --- |
| Table win rate | 0 | 0 | 0 | 0 to 0 | 8/8 | descriptive |
| Table entry rate | 0.5 | 0.375 | -0.125 | -0.375 to 0 | 8/8 | regression_watch |
| Table sitting rate (seat taken, whether or not a waiting invitation was observed) | 0.5 | 0.375 | -0.125 | -0.375 to 0 | 8/8 | regression_watch |
| National scale access | 0 | 0 | 0 | 0 to 0 | 8/8 | no_material_signal |
| First bearer survives through day 30 | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| First bearer survives through day 60 | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Player deaths per run (player-flagged character only) | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Player deaths per 100 calendar days (player-flagged character only) | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Village deaths per run | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Village deaths per 100 calendar days | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Community loss (engine loss or sustained empty roster) | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Mean sampled living NPCs | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Sampled reserve below 500 kcal | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Sampled hydration below 25% | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Sampled HP below 25 | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Sampled hungry NPCs (hunger at least 80) | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Player named-class access | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Eligible NPC named-class access | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Earned player tier-3+ weapon/armor access | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Player tier-3+ contest/show weapon/armor | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Player tier-3+ craft/trade weapon/armor | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Player tier-3+ corpse weapon/armor | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Primary nourishment / physical food consumed on instrumented routes | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Bearer changes | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Accepted player ability events | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Hunt luck percentile | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Trap luck percentile | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Snare luck percentile | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Pit luck percentile | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Fishing luck percentile | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Combined run luck percentile | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |

Sweep-corpus comparison, NOT a balanced-panel verdict: rows paired by policy+seed; only won/entered/table/national/playerDeaths are carried by per-seed sweep rows, and every other contract metric is not_observed, never imputed. For a §15 panel verdict, build real panels with scripts/balance-panel.js.
```

### Attached compare .md (`compare-mid16-vs-pelletalone.md`, full text)

```markdown
# Sweep-corpus comparison (not a balanced-panel verdict)

**Decision: review_required**


## doorwalk-baseline

8 paired cases; screen only; review_required.

| Metric | Before | After | Paired delta | 95% exploratory interval | Pairs | Status |
| --- | ---: | ---: | ---: | --- | ---: | --- |
| Table win rate | 0 | 0 | 0 | 0 to 0 | 8/8 | descriptive |
| Table entry rate | 0.5 | 0.375 | -0.125 | -0.375 to 0 | 8/8 | regression_watch |
| Table sitting rate (seat taken, whether or not a waiting invitation was observed) | 0.5 | 0.375 | -0.125 | -0.375 to 0 | 8/8 | regression_watch |
| National scale access | 0 | 0 | 0 | 0 to 0 | 8/8 | no_material_signal |
| First bearer survives through day 30 | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| First bearer survives through day 60 | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Player deaths per run (player-flagged character only) | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Player deaths per 100 calendar days (player-flagged character only) | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Village deaths per run | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Village deaths per 100 calendar days | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Community loss (engine loss or sustained empty roster) | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Mean sampled living NPCs | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Sampled reserve below 500 kcal | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Sampled hydration below 25% | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Sampled HP below 25 | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Sampled hungry NPCs (hunger at least 80) | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Player named-class access | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Eligible NPC named-class access | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Earned player tier-3+ weapon/armor access | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Player tier-3+ contest/show weapon/armor | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Player tier-3+ craft/trade weapon/armor | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Player tier-3+ corpse weapon/armor | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Primary nourishment / physical food consumed on instrumented routes | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Bearer changes | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Accepted player ability events | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Hunt luck percentile | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Trap luck percentile | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Snare luck percentile | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Pit luck percentile | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Fishing luck percentile | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Combined run luck percentile | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |

Sweep-corpus comparison, NOT a balanced-panel verdict: rows paired by policy+seed; only won/entered/table/national/playerDeaths are carried by per-seed sweep rows, and every other contract metric is not_observed, never imputed. For a §15 panel verdict, build real panels with scripts/balance-panel.js.
```

## Method note

- CANON.md read first; the pellet pass is Steve's ruling 2026-11-07 (the pellet passes to hungrier hands; the trap it fixes is the bearer never hungering so the village never throws the feast the table counts). No canon doc covers the counterfactual itself; the prereg is the authority, and the bisect prereg + Amendments A1/B govern the instrument and bars.
- Flap: EPERM write flap active at run start (12:46Z — O_EXCL and plain writes refused filesystem-wide), cleared 12:47:52Z for the prereg commit + extraction + patch, back ~12:52Z (killed the proof test's /tmp fixture write twice), cleared again 12:54:05Z for the proof re-run + test commit + smoke + full sweep. Probe-gated before every write step; no force used. The sweep ran clean inside the window (smoke ~31s, 7 seeds ~2.6 min).
- Worktree heartbeat **hung** this run (`timeout 60 bash scripts/worktree-heartbeat.sh sim-pelletpass-b` → exit 124, killed at 60s, 13:00:44Z) — the known heartbeat-script hang from the 0530Z/0830Z/#16 runs, not git. The registry heartbeat is therefore stale from the coordinator's registration; the branch and evidence commits are the durable record.
- Old code extracted read-only with a single `git archive 2bc17d793 src scripts index.html manifest.json version.json | tar -x -C scratch-2bc17d793/` (after `mkdir -p`). `version.json` stamp `09e57528e-20261107-233501` (the #13 bump — consistent with #14 sitting after #13).
- **Patch pitfall, found and fixed this run:** `git apply` inside the scratch dir (a subdirectory of the worktree repo) silently SKIPPED the patch — `git apply --check --verbose` prints `Skipped patch 'src/js/progression.js'`, exit 0, nothing changed. Cause: `git apply` verifies the pre-image against the INDEX, and the index holds the worktree's own (master) progression.js, which already contains the pellet pass — so the pre-image never matches and the patch is skipped without failing. The fix: apply with GNU `patch -p1` (file-content only, no index), which applied cleanly. The construction was then verified blob-by-blob (452 src files: 451 equal to #14, progression.js byte-identical to #16; no extra/missing files) and locked by the proof test. Future arms patching an extracted tree inside a worktree must use `patch`, never `git apply`.
- Code identity verified: `git diff e6ddaf32a 685dc9ec4 -- src` is exactly `src/js/progression.js` +104 (2 hunks, pure addition); `git diff 2bc17d793 e6ddaf32a -- src` is exactly `src/js/food.js` 11 lines; progression.js identical between #14 and #15, food.js identical between #15 and #16 — the interval #15..#16 contains no other game-code change.
- The three frozen instrument files were overwritten from branch tip `715c2918d` via `git show` (driver, doorwalk policy, analyzer) and verified byte-identical to the worktree tip copies and to the mid15 (`d229b58f5`) and mid14 (`246ce6dc2`) tips. Instrument-freshness check: zero commits in `246ce6dc2..HEAD` touch any instrument file — the frozen copies are byte-identical to the ones used by the #14/#15/#16 runs.
- Require closure verified BEFORE the smoke: 17 files, none missing (driver + the 5 REPO-joined requires + their transitive set, including `stageally-instrument-20261106`, `bankkiller-instrument-20261105`, `killerdeath-instrument-20261105`, `competent`, `idle`, `vinebank`, `snareteach`, `conversation-pages`, `competent-feastdrive-b`, `competent-linkdrive-b`, `competent-linkfeast-b`). The smoke passed on the first try (0 errors).
- Anchor reads `e434f6b4fdb3` (the worktree tip at sweep time — the proof-test commit) in every corpus JSON. The code under test is not a commit — base `2bc17d793` + pellet-pass diff `e6ddaf32a..685dc9ec4` — recorded here, not inferred from the anchor.
- Fallen-list identity checks (post-sweep, read-only): 53001 pellet-alone == #16 == healed control (all 18 deaths); 53005 pellet-alone == collapsed control (all 13 deaths); 53003 and 53007 pellet-alone == #14 (all deaths); 53002 shares only the first death with #14 and only Joseph with #15/#16.
- The safe-commit index clobber hit both the prereg commit (`d10eefa3a`) and the proof-test commit (`e434f6b4`); repaired both times via `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, worktree hash == HEAD blob, status clean, `git diff HEAD` empty — same class as the 0530Z/#14/#15/#16 runs.
- Scratch dir `scratch-2bc17d793/` deleted before finishing (reproducible from `git archive` + the pellet-pass diff); prior runs' scratch dirs left as found.

## Metric review

- The full-8 bars were applied without re-scoring: the counterfactual meets neither bar (median 82d < 120d, sits 3/8 < 4/8) → AMBIGUOUS. The finger stays with the interval #15..#16 by the pre-registered rule, and the minimal flipping set is {#15, #16}. No friendlier metric was consulted — not "53001 heals exactly so the pass is the healer", not "3 of 8 seeds match the healed endpoint", not "the median is dragged down by one bad seed". The median bar is doing real work for the fifth time: without it, the 53001 exact match would tempt a single-landing claim while half the band still dies early.
- One correction to the prereg's expectation, not the metric: the prereg framed the counterfactual as deciding between {#16} and {#15, #16}. The result is the second — but the mechanism is sharper than the frame: the two steps are complements in different villages (#15 makes food in 53005/53003, #16 moves it in 53001), not two doses of the same medicine. A future arm that wants a single landing to claim the heal would need a change that does both jobs in one village, which neither landing does.
- One pre-existing instrument/prereg wording gap, recorded, no re-score: the analyzer's COLLAPSED bar reads sits ≤1/8 while the healerbisect prereg text says ≤2/8. It changes nothing here (sits 3/8 → AMBIGUOUS under either) and nothing at the controls (0/8), but the next arm that lands on sits 2/8 should pin which bar binds before judging.
- No metric change proposed. The GO bars' "fingered landing named with full-8 evidence on both sides" is now met for the minimal SET {#15, #16} with full-8 per-seed trajectory evidence on both sides of the interval and on the counterfactual that removes one member.

## Convergence state

scale-onramp stays **converging** (NOT converged): the healer question is now closed as a minimal set — **{#15 (specialist first rung 10 → 5 XP), #16 (pellet pass)}** — with full-8 per-seed trajectory evidence on both sides of the interval #15..#16 AND on the counterfactual that removes #15 (median 82d, sits 3/8, 53005 exactly collapsed, 53002 worse than anywhere). The 53005 caveat is satisfied in both directions (it heals at #15/#16, stays collapsed without #15). What remains: the tracker update naming the minimal set (not a single finger), and the real §15 panel verdict from the panel-contract lane. The next blanks, in order: tracker update (minimal set {#15, #16}, two-step mechanism, per-seed healer map), then the real panel build, then the residual questions (53007 never heals anywhere — best 63d collapsed, 59d here; 53002's collapse under the pellet pass alone and whether it is reshuffle noise or a real interaction; 53006's 820-standing overshoot and its veterans-2 readiness).

## Adoption handoff — tracker update + panel lane

1. Pellet pass alone on the #14 base reads **AMBIGUOUS** on the full 8 (median 82d, sits 3/8). The finger stays with the interval #15..#16 and the minimal flipping set is **{#15, #16}** — proven by construction (this arm removes #15 and the heal does not reproduce). No further bisect screen is owed: all 17 game-code points are mapped on the full 8, plus this counterfactual.
2. Per-seed healer map (full-8, complete): 53001 heals at #16 AND under the pellet pass alone (exact healed match, fallen list identical); 53005 heals at #15 only (stays exactly collapsed under the pellet pass alone); 53003 heals at #15 only (45d under the pellet pass alone, identical to #14); 53002 heals at #9 only, sits-then-lost at #14, regresses to 88d at #15, collapses to 59d under the pellet pass alone, exact healed at #16; 53004 heals #8 and stays healed everywhere (kill-heavy under the pellet pass alone, 8 w4 vs 3 healed); 53006 heals #8 (overshoots everywhere, worst under the pellet pass alone: standing 820, 3 w5 kills, veterans 2/2 — the only readiness-true end-state on the staircase); 53008 heals #9 (sits at healed timing d97 under the pellet pass alone); 53007 never heals anywhere (best 63d collapsed/#8; 59d here).
3. Balanced panel: the §15 attempt in this file is a sweep-corpus screen (two pairs, both review_required), not a panel verdict. A real verdict needs real panels built under both roots — panel-contract lane work. Do not re-run doorwalk corpora through `compare` expecting a different answer.
4. Worktree `~/workspace/worktrees/sim-pelletpass-b`, branch `sim-pelletpass-b` (tip: prereg `d10eefa3a` + proof test `e434f6b4` + this evidence commit). Scratch dir deleted; corpus + panel files committed under `evidence/2026-11-08/perseed-pelletpass-alone-b/` and `evidence/2026-11-08/panel-pelletpass-alone-b/`.
5. Staircase for the tracker: collapsed 70.5d/0 sits → #8 100d/2 → #9 108.5d/4 → #14 103d/4 → #15 119d/4 → **pellet-alone 82d/3** → **#16 145d/4 = healed control 145d/4**.
