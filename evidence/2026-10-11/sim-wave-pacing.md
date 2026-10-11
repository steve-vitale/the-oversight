# Long-run sim — lever 2: wave unlock pacing (2026-10-11)

**Lever played:** `barsPerWave` wave-2 bar **5 → 4** in `src/data/wave-ledger.json`
(bars now {5,4,4,3,2}). One number, documented in the JSON `_comment`.
Wave-3 unlock now needs 4 wave-2 ledger points (day 25+ floor unchanged).
perTypeCap=2, points 1/2, floors 8/25, spawn ratios, scale gates — all untouched.

**Method:** new `scripts/sweep-wave-lever.js` (20 fixed seeds 1–20 × 200 days,
competent policy, seeded mulberry32) measuring: first-unlock day per wave,
first ledger-bar-fill day per wave (to separate ledger-bound from
floor/scale-bound), per-type ledger detail (kills, points, counter-bonus
extras, perTypeCap hits), exact villager-vs-player kill split
(`villageSlain` totals minus exact villager kills from a `fieldFight`
wrapper), villager fight outcomes by wave, player fights/day, scale timeline,
endgame deed bars, counters, survival. Raw JSON:
`hidden_files/wavelever-before.json` / `wavelever-after.json`
(goal workspace, not the repo).

**Unit proof:** `scripts/test-wave-bar-20261011.js` — 13/13 × 3 seeds
(bar reads 4; 4pts+day30→w3, 3pts→stays w2, floor still binds at day 10,
w1 bar unchanged, perTypeCap intact, counter kill still 2, one type can
never fill the bar alone).

## Before → after (identical seeds)

| measure | before | after |
|---|---|---|
| wave-2 unlock | 18/20, median day 30 | 18/20, median day 30 (untouched) |
| **wave-3 unlock** | **4/20, median day 58** | **6/20, median day 58** |
| w3 unlock days | 60, 58, 54, 47 | 58, 57, 43, 46, 79(new), 97(new) |
| wave-4 / wave-5 unlock | 0/20 | 0/20 |
| median survival | 69d (5 survived, 15 village-lost) | 69d (identical) |
| deaths | 204 | 208 (same trajectories) |
| won / table | 0 / 0 | 0 / 0 |
| scale reach | 20/20 village | 20/20 village |
| w1 ledger (median pts / kills / villager share) | 9 / 171 / 76% | 9 / 168 / 76% |
| w2 ledger (median pts / kills / villager share) | 1 / 38 / 63% | 1 / 36 / 58% |
| perTypeCap hits (w1 / w2) | 56 / 10 | 54 / 9 |
| counter-bonus ledger points (w1+w2) | 15 | 15 |
| counters discovered | 153 | 151 |
| fights/day (player w1/w2/w3) | 0.108 / 0.049 / 0.010 | 0.108 / 0.050 / 0.014 |
| fights/day (villager w1/w2/w3) | 0.378 / 0.060 / 0.005 | 0.378 / 0.051 / 0.014 |

The two new w3 unlocks are exactly the two runs that had stalled at 4 w2
points (seeds 16, 18 — predicted from the before-data). The four existing
unlocks all moved earlier (1–11 days; seed 10: day 54 → 43). Nothing else
moved — the lever touches exactly its channel.

## Hypothesis verdict (Steve's question)

**Both, in sequence.** The unlock pacing WAS miscalibrated at exactly one
point, and the scale wall is real behind it:

1. **The wave-2 ledger bar was the binding constraint on wave 3** — not the
   day-25 floor (bars filled at days 47–60, median 58; the floor never bound
   a single run) and not kill scarcity alone. Lowering 5→4 moved w3 into
   6/20 runs. The bar, not the floor, was the dial — confirmed by
   bar-fill-day == unlock-day in every run (18/18 w2, 4/4→6/6 w3).
2. **The wave-1 bar (5 pts) is slow but working**: 18/20 fill, median day 30
   vs the day-8 floor. The floor is decorative in real sims — kills, not
   calendar, pace the early game. Not touched: wave 1 is the calibration era
   and 18/20 reach is healthy.
3. **Waves 4–5 are scale-bound, not ledger-bound** — 0/20 runs leave
   'village' (scaleFirst: only 'village', 20/20). The w4 gate needs
   scaleRank ≥ 'regional', w5 ≥ 'national'; sims never form the first link.
   **This is lever 8's (travel & regional) problem, not mine.** My lever
   cannot fix it without redefining the scale gates, which is explicitly
   out of scope. Stated plainly for the travel lever: no pacing change to
   bars/caps/floors/ratios can unlock waves 4–5 while scale stays at village.

## VILLAGER XP LAW: does it fire in sims? YES — loudly.

- **76% of wave-1 ledger kills and 63% of wave-2 kills are villager kills**
  (130/171 and 24/38). The village — not the player — is the protagonist
  of the ledger.
- 518 villager fights vs wave 1 (130 kills, 188 fled, 33 died, 122 monsters
  fled, 38 evaded), 121 vs wave 2 (24 kills, 60 fled, 1 died). Villagers
  fight, win, lose, run, and die — blow-by-blow, not rolls.
- The counter-bonus mastery channel fires through villager kills too
  (counter-known vKills tracked per type in the sweep).
- perTypeCap=2 binds hard and honestly: hushwolf capped in 15/20 runs
  (56 w1 cap hits) — breadth pressure works; nobody farms one type to
  wave 3.

## Reachability verdict

- **Wave 1:** 20/20 runs fight it blow-by-blow (~640 fights/sweep). ✅
- **Wave 2:** 18/20 unlock, fought in all 18. ✅
- **Wave 3:** 4/20 → 6/20 unlock after lever. Barely reachable — improving,
  but a 100-day game wants this higher; the remaining drag is wave-2 kill
  throughput (~1.9 kills/run), which is encounter/combat territory, not
  bars. ⚠️
- **Waves 4–5:** 0/20, decoration in sims. Blocked by the scale gate
  (travel lever). ❌
- **Endgame deed gate:** w1 bar (5 distinct faced) 20/20, median day 15;
  w2 bar 6/20, median day 56; w3+ never. Table/win 0/20 — blocked upstream.
- **Spawn ratios** (60/40, 60/25/15, 60/20/15/5, 55/20/12/8/5) verified as
  coded; untouched.

## Village assessment (plain words)

The village is a real protagonist and a fragile one. Scholars die about
every 8 days (204 deaths/20 runs: combat 118, starvation 44, the rest the
long tail); the mantle passes, the ledger survives on `state` (inherited by
the next adventurer — verified), and the village keeps killing monsters
without the player: villagers scored three-quarters of the wave-1 ledger.
Nobody thrives — 5/20 villages see day 200, and those do it on pantry
discipline, not power. The wave-2 era is the whole mid-game: it unlocks
around day 30 and the village usually dies around day 69 having filled
~1 of the 5 (now 4) wave-2 ledger points. Wave 3 is a rumor glimpsed in
6/20 runs, a real fight in ~4.

## Sense-testing (transcripts read)

- **Villager fight summaries read like people fighting.** "James killed the
  Hummice alone — 1 round, 12 taken. Word travels fast." / "The Highbeam
  Deer mauled Moshe (-83 health) over 2 rounds. They're lucky to be
  breathing." / "Scarlett stood down the Lockpick and kept walking — 3
  rounds, bloodied but breathing." Names, costs, outcomes vary sensibly.
- **FIXED (blank filled):** two grammar bugs in `fieldFightSummary`
  (fieldFights.js): "David stood down **the The Loud Beast**" (monsterNoun
  already carries the article) and "mauled (-46 health) **over 1 rounds**".
  Now strips a leading article and pluralizes. Verified by direct
  invocation across all six outcomes.
- **Ledger beats are honest:** "📺 WAVE LEDGER — wave 1 is halfway there
  (3/5 kills — the ledger counts kills only, not near-misses)." /
  "wave 1's bar is full (5/5 — kills only, not near-misses). The next wave
  opens when the day and scale floors pass." The unlock beat fires the same
  day the bar fills ("Wave 2 talent has been released into your sector").
- **awayNews reads like a village talking:** "💀 The Hushpuppy killed Marcus
  in 1 rounds. The village mourns." (now "in 1 round" after the fix).

## Blanks filled

1. **Wave-2 bar 5→4** (the lever). Measured, proven, documented.
2. **fieldFightSummary grammar** ("the The Loud Beast", "1 rounds").
3. **Stale "counter bonus dormant" language** removed from
   `src/data/wave-ledger.json` `_comment`, `src/js/waveLedger.js` @ontology
   header, and `docs/PROGRESSION.md` §12 + lever table (the bonus has been
   LIVE since 2026-10-10; measured 15 bonus points in the sweep).

## Documented (not fixed — out of lever scope)

- **Waves 4–5 unreachable in sims: scale gate** (travel lever). 0/20 runs
  leave 'village'; no pacing dial in my machinery can change that.
- **Wave-3 era is thin even when unlocked:** 3–6 villager fights per sweep,
  all fled or lost. Kill throughput vs wave-2 monsters (~1.9/run) is the
  remaining drag — encounter/combat territory.
- **Pre-existing failure:** `scripts/test-villager-agency.js` "monster: kill
  reachable (strong vs weak, full path)" fails 42/43 on the PRISTINE tree
  too (verified via stash) — not my regression; flagged for whoever owns
  that suite.
- **Ontology drive-by:** `docs/ONTOLOGY.md` regenerated — includes my
  ledger rule update plus one pre-existing staleness fix
  (`emission_choke_point` in convo-dialogue.js, from the 2026-10-11 convo
  rebuild, whose ONTOLOGY.md was never regenerated).

## Tests & commits

- `scripts/test-wave-bar-20261011.js` — 13/13 × 3 seeds (new, the lever proof)
- `scripts/test-wave-ledger-20261010.js` — 31/31 (bar assertion updated 5→4)
- `scripts/test-wave3-5-20261010.js` — 215/215 × 3 seeds (gate assertions
  updated to the calibrated bar)
- `scripts/test-bal-waves-20261010.js` — 30/30 × 3 seeds (same)
- `scripts/test-villager-wave-xp-20261010.js` — 20/20 (unchanged)
- `scripts/test-real-fights-20261008.js` — 15/15 (summary change safe)
- `scripts/validate-ontology.js` — 63/63 systems validated
- No [needs-eyes]: tuning number + grammar + doc sync; no feel/combat/UI
  change. Steve can overrule the 5→4 call.
