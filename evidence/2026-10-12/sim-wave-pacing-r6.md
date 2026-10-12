# Long-run sim — lever 2 r6: wave unlock pacing, BAR-COUNTING AUDIT (2026-10-12)

**Context:** r5 re-baselined post-combat-r6, added villager wave-drop reactions,
and measured-and-rejected the extra-cap experiment. Since r5, combat r7
(trauma relief) + food r6 (knap-first) landed. This run re-baselines on
current master and does the job r5 left open: a DIRECT audit of the wave
UNLOCK BARS' villager-experience counting, per wave (Steve's 2026-10-11 22:06
law: villager experiences count alongside the player's, definitions not
weakened).

Canon read: docs/CANON.md, docs/MONSTER-WAVES.md (wave law, VILLAGER XP LAW,
counter convention, breadth-not-throughput). Method:
`scripts/sweep-wave-lever.js`, 20 seeds × 200d, competent policy, seeds 1–20
(same seed set as r4/r5). Raw: `sweep-out/wavelever-r6-baseline.json`.

## 1. BAR-COUNTING AUDIT — the bars are fully villager-inclusive (no fix needed)

Audited every layer, per wave 2/3/4/5:

- **The gate** (`unlockedWave`, game.js): each wave's kill component is exactly
  `waveLedgerPoints(w) >= barsPerWave[w]`. Day floors (8/25) and scale floors
  (regional/national) never read killer identity.
- **The scorer** (`scoreLedgerKill`, waveLedger.js): takes only `monsterId`.
  Points, counter bonus, and perTypeCap are all killer-blind.
- **The choke point** (`recordWaveKill`, game.js): takes only `monsterId`.
  Every kill channel funnels through it — player TB (lineage-deduped),
  villager patrol/wild/expedition field fights, aid-crisis (dormant),
  contest blood/hide/beastmaster. (Channel completeness was r4's audit;
  re-verified no double-scoring: fieldFight never calls recordWaveKill
  itself; each caller calls it exactly once per vKill.)
- **Structural proof**: comment-stripped source scan of recordWaveKill,
  scoreLedgerKill, waveLedgerPoints, unlockedWave finds zero killer-branching
  identifiers.

**In-sim confirmation** (this run's baseline): villager share of kills feeding
the bars — w1 72% (188/262), w2 53% (35/66), w3 50% (1/2). The village does
the majority of the killing on every bar. Steve's law holds in the counting
itself, not just the ledger totals.

**Edges examined and deliberately NOT changed:**
- *Pack kills*: player TB can pick off pack members (each scores, cap 2);
  a villager field fight strikes only the lead — lead falls → pack
  scatters/dies → 1 ledger point. This is fiction-honest ("kill it and the
  pack dies or scatters with it" — scattered ≠ killed), not an undercount.
  Documented, not "fixed".
- *Counter discovery channel 1* (perform the trick) is player-TB-only —
  field fights don't observe action-level behaviors. The bonus itself is
  killer-blind once known (shared `state.monsterCounters`; beasttricks
  teaching is villager-fed via villageSlain). Making field fights discover
  counters would mean inventing per-kind proxies — a design call, and the
  bonus is sim-decorative anyway (7 extras paid across 20 runs vs 172
  discoveries; the cap clips it — r5 proved the cap is load-bearing).
  Honest fix lives in teaching/discovery = lever 4/5 territory. Documented.
- *vDie/evade/alreadyDead/mFlee score nothing* — the definition (kills only),
  not weakened per Steve's directive.

**Contract pinned**: NEW `scripts/test-wave-bar-counting-20261012.js` —
21/21 × 3 seeds (2 asserts red-checked against pristine code).

## 2. BLANK FILLED: the ledger contradicted the unlock beat (sense fix)

Found while sense-reading the unlock sequence: when a bar fills AFTER its
day floor already passed (the normal case — measured medians: w1-bar fill
~20d vs floor 8; w2-bar fill ~49d vs floor 25), the System said:

> 📺 WAVE LEDGER — wave 2's bar is full (4/4 — kills only, not near-misses).
> **Wave 3 opens once day 25 passes.**
> 📺 RATINGS ARE UP! ... Wave 3 talent has been released into your sector.

— announcing a future condition for a release happening in the same breath.
**Fix** (waveLedger.js, `_ledgerAnnounce`): the day-floor gate sentence now
fires only when the floor is still in the future (waves 3/4 were already
scale-aware; waves 1/2 weren't day-aware). After the fix the sequence reads
clean: bar-full → RATINGS → System's wave beat → treeline narration → two
fire-side villager reactions. Proof: the new counting test §6 (red-checked:
fails 2/21 on pristine, 21/21 fixed). Pacing-neutral by construction —
narration only, zero gameplay effect, no re-sweep needed.

Also repaired `scripts/test-wave45-coherence-20261011.js` §5 to the new
canon (it asserted the old unconditional sentence; plus two PRE-EXISTING
stale asserts — w3/w4 "names regional/national" could never match the code's
actual "cleared for release" copy, failing 20/22 on pristine HEAD at SEED=1).
Now 24/24 × 3 seeds.

## 3. RE-BASELINE (current master: combat r7 + food r6)

| measure (20 seeds) | r5 | r6 |
|---|---|---|
| median survival | 54.5d | 49d |
| max days | 200 | 158 |
| deaths (20 runs) | 138 | 163 |
| monster+combat share | 66% | 62% (34+28) |
| starvation | 24 (17%) | 28 (17%) |
| wave-2 unlock | 19/20, med 20 | 18/20, med 19.5 |
| wave-3 unlock | 9/20, med 47 | 9/20, med 49 |
| wave-4 / wave-5 | 0/20 | 0/20 |
| bar→unlock gap | 0 (all 28) | 0 (all 27) |
| day floors | inert | inert (earliest w1-bar d12 > 8; w2-bar d27 > 25) |
| counter discoveries | 175 | 172 |
| counter extras paid | 1 | 7 (2 w1 + 5 w2) |
| w1 kills (vill %) | 263 (68%) | 262 (72%) |
| w2 kills (vill %) | 63 (63%) | 66 (53%) |
| w2 types touched | 13 | 13 |
| maxArc 3 | 20/20 | 19/20 |
| national / win / four-realm | 0 / 0 / 0 | 0 / 0 / 0 |

Wave pacing is stable across the combat-r7/food-r6 landings: w3 holds 9/20.
The counter bonus remains decorative (7 extras / 20 runs) — by design the
cap clips it; r5's rejection stands, do not retread.

## 4. SENSE: drop reactions fire; villagers read like people

- Verified in-sim (seed 1 probe, day 53): the w3 drop sequence fires at the
  honest moment — bar-full → RATINGS → FINAL DRAFT → treeline narration →
  two fire-side reactions, distinct temperaments, no echo:
  🔥 James: "The treeline's different now. We mark it, we tell everyone, we
  don't go alone." / 🔥 Sofia: "Don't go near the treeline alone anymore.
  Promise me." Coherent, present-tense, consequential. PASS.
- Fight summaries: "Moshe killed the Nightlight alone — 3 rounds, 40 taken.
  Word travels fast." / "The Highbeam Deer killed Ursula in 1 round. The
  village mourns." (Ursula was mauled twice before — a real arc.) Nothing
  robotic in the sampled lines.
- Villager w3 fights (85 across 20 runs): 66 flee, 13 die, 1 kill — sensible
  (w3 bands are mid-build fights; villagers aren't mid-build).
- Tooling note: the sweep truncates sense capture to the FIRST 60 lines
  (`sayLines.slice(0, 60)`), so all wave-3+ beats are invisible in sweep-out
  JSON — r5's `sense-wave-drops-20261012.js` remains the tool for unlock-day
  transcripts. Left as-is (documented, not changed).

## 5. REACHABILITY

- Waves 1–3: reachable (w3 9/20, days 27–77). Bar binds on all 27 unlocks;
  day floors inert.
- Wave 4: 0/20 — doubly gated, NEITHER gate a counting blank: (a) the w4 bar
  needs 4 w3 ledger points but w3 kills run 0.1/run (villagers flee 78% of
  w3 fights; the player fights ~1 w3/run) — throughput, not counting;
  (b) scaleRank >= regional, 0/20 reach it — the scale wall, lever 8's
  territory (`scaleRank` reads village-level `networkLive` flags, nothing
  player-only). The bar itself counts villager kills exactly like the
  player's (1 villager + 1 player w3 kill scored identically this run).
- Wave 5: 0/20 — same wall, one step further out. Decoration until the
  scale wall moves; the counting is ready.
- Arc III reached 19/20; table/win/national: 0/20 (scale wall).

## Village assessment (plain words)

The villages fight like villages: two-thirds of the wave-1 killing and half
the wave-2 killing is villagers, and now the ledger's own voice doesn't trip
over itself when the bar fills. Wave 3 remains a real era on nearly half the
runs, and the village still says something when it arrives. Nobody reached
regional — the late game is still behind the scale wall, and the wave-4 bar
is correctly waiting on both sides of it (kills AND scale), counting every
villager kill at full value.

## Blanks filled

1. **Ledger/unlock beat contradiction** (waveLedger.js): day-floor gate
   sentence now day-aware — no more "opens once day 25 passes" in the same
   breath as the release. Proof `test-wave-bar-counting-20261012` 21/21 ×3
   (2 red pre-fix).
2. **Bar-counting contract pinned** (new test): per-wave killer-blindness —
   structural scan + behavioral symmetry + shared per-type cap + villager-only
   unlock — 21/21 ×3.
3. **test-wave45-coherence repaired to canon** (was asserting the old
   sentence + 2 pre-existing stale asserts): 24/24 ×3.

## Documented (not fixed)

- Waves 4–5 sim-unreachable: scale wall (lever 8) + w3-kill throughput
  (~0.1/run vs 4 needed). Counting verified clean — not a lever-2 blank.
- Counter bonus decorative in sims (7 extras/20 runs): discovery/teaching
  side is lever 4/5; the cap is load-bearing (r5). Do not retread.
- Pack-kill ledger asymmetry (TB per-member vs field-fight lead-only):
  fiction-honest, documented.
- test-wave3-5 roster-count asserts stale (56→59): content loop's drift,
  pre-existing (fails on pristine HEAD).
- Sweep sense-capture truncates to first 60 lines: wave-3+ beats invisible
  in sweep-out JSON; use sense-wave-drops-20261012.js.

## Tests & commits

- NEW `scripts/test-wave-bar-counting-20261012.js` — 21/21 ×3 seeds
  (2 asserts red on pristine)
- FIXED `scripts/test-wave45-coherence-20261011.js` — 24/24 ×3
  (was 18/22 on this branch, 20/22 on pristine)
- Regressions: wave-ledger 31/31, wave-kill-channels 17/17, wave-bar 13/13,
  wave-drop-reactions 14/14, reach-wavebeat 8/8, wave-extra-cap 15/15,
  ontology 85/85
- Sweep: `sweep-out/wavelever-r6-baseline.json` (20 seeds × 200d competent)
- `[needs-eyes]`: the ledger full-beat copy changed (player-visible System
  voice Steve will see on his phone)
