# Long-run sim — lever 2 r3: wave unlock pacing, contest-kill fix measured + beat honesty (2026-10-11)

**Context:** r2 committed the contest-kill counting fix (contest vKills →
`recordWaveKill`) but reverted it for the cap comparison and never swept it;
bars/caps are SETTLED (bar {5,4,4,3,2}, perTypeCap 2 — not re-litigated).
This run: (1) before/after the contest-kill fix on identical seeds, (2) the
day/scale floors — what actually binds each unlock, (3) wave 4/5 pacing
coherence by construction (still 0/20 scale-bound), (4) sense-testing the
ledger beats. Current master HEAD 2444956b at run start.

## 1. Contest kills scoring: BEFORE/AFTER on identical seeds — PACING-NEUTRAL, KEEP AS COMMITTED

**Method:** 20 seeds × 200d, competent policy (`scripts/sweep-wave-lever.js`).
BEFORE = pristine `contestEngine.js` from `c37267a0^` (the fix commit's
parent — the ONLY delta vs HEAD is the fix); AFTER = committed HEAD. Raw:
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/wavelever-r3-before.json`
/ `-after.json`.

| measure (20 seeds) | BEFORE (not scoring) | AFTER (scoring) |
|---|---|---|
| median survival | 57d | 55d |
| max days | 89 | 89 |
| wave-2 unlock | 16/20, median day 35 | 15/20, median day 29 |
| wave-3 unlock | 2/20, days 53/77 | 2/20, days 53/77 |
| wave-4 / wave-5 | 0/20 | 0/20 |
| deaths | 202 | 202 |
| w1 ledger pts (20-run total) | 148 | 151 |

**19 of 20 seeds are byte-identical** (same days, same unlock days, same
ledger points). The fix's measured ledger contribution: **+3 points across
20 runs** (seed 17: two televised hummice vKills scored +1 pt, cap-clipped
the third; seed 18: two televised vKills — hummice, nevermore — scored +2).
No unlock day moved. No bar-fill day moved.

**Seed 18 diverged** (died day 42 vs 86) — honest accounting: the two
contest vKills pushed `villageSlain` to 1 for two types, unlocking the
'beasttricks' teaching topic (threshold is 1+ slain, game.js:27160) where it
was locked before; the knowledge-economy butterfly shifted the trajectory.
Chaotic single data point, NOT escalation (after-run had FEWER points, no
unlock). The mechanism is the fix working as intended — televised kills now
feed the village's teaching, exactly what the VILLAGER XP LAW wants.

**Verdict on Steve's directive** ("wave unlock should include villager
experiences not just the players — don't weaken the definitions — Idk
playtest it"): PROVEN WITH SIMS. Villager experiences count (the fix works
in organic sims — 4 televised vKills scored across 40 runs); definitions
NOT weakened (bars, perTypeCap untouched); **not a farm vector** (contests
~2/week max, threat-matched beasts, ~23% pit death risk, perTypeCap=2 clips
any type at 2 pts — farming 5 bar points via televised kills would take 3+
types × weeks of real death risk, while wild kills fill it anyway). The
channel is real but rare: ~0.15 ledger pts/run. **Pacing effect: nil.
Decision: KEEP the committed fix, no dial change.**

## 2. Wave timing floors: what binds each unlock — DAY FLOORS PROVABLY INERT, KEPT AS FICTION BACKSTOPS

AFTER sweep, per unlock (unlockDay − barFillDay):

- **Wave 2** (floor day 8): 15/15 unlocks gap = 0 — the BAR binds every time.
  Earliest bar fill: day 13 > 8. The floor never bound once.
- **Wave 3** (floor day 25): 2/2 unlocks gap = 0 — the BAR binds. Bar fills
  day 53/77 > 25. Floor never bound.
- **Waves 4/5** (scale floors): bind ABSOLUTELY — 0/20 runs reach regional
  (scale stays 'village' all 20 runs; `scaleFirst` = village day 1 only).

The pacing work is done by **bars + perTypeCap + scale floors**; the day
floors are backstops. **Decision: DO NOT dial them.** They are inert in the
measured state but they are FICTION guards, not pacing dials: wave 2 is
"System arrival, day 7+" (MONSTER-WAVES.md) with its beat woven into
`checkSystemArrival` — a village filling the w1 bar by day 4 must not see
wave-2 talent released before the System arrives. Removing the floors gains
zero pacing and risks incoherence. Documented as provably inert (20/20),
kept intentionally.

## 3. Wave 4/5 pacing coherence: VERIFIED BY CONSTRUCTION (22/22)

Waves 4-5 remain 0/20 (scale-bound — lever 8's territory, not fixed here).
The dials themselves were verified in `scripts/test-wave45-coherence-20261011.js`
(new, **22/22**; the 5 beat-honesty asserts RED pre-fix):

- Gates: w4 = w3-bar (4 pts) + regional, **no day floor** (unlocks at day 10
  in-test); w5 = w4-bar (3 pts) + national. Canon holds: "ledger points +
  scale, never pure calendar."
- Scale floor HOLDS: bar full at village rank → stays wave 3.
- perTypeCap interaction: w4's bar (4) needs 2+ types (one farmed type caps
  at 2); w5's bar (3) needs 2+ types (2+1). Breadth, not farming — coherent.
- Beats fire honestly and idempotently: RATINGS line only promises talent
  when the roster has it (`hasTalent` check), Mirror Draft / Producers woven
  beats land, no re-fire.
- `monsterWavePool()` admits the new wave once unlocked (the delivery side).

**Gap documented (not fixed — lever 8's file):** the scale path never calls
`checkWaveUnlockBeat` — `_fireRegionalDawn` / the national-set path don't
touch it. A scale-earned unlock lands silently; the beat fires on the NEXT
kill/combat (deed wrap on `startCombat`, `recordWaveKill`). In practice the
first new-wave encounter and the beat are near-simultaneous, but the ideal
is the RATINGS beat riding the Dawn/national moment itself. Handoff to
lever 8: add `try { this.checkWaveUnlockBeat(); } catch (e) {}` after
`networkLive = true` / `nationalLive = true`. I did not touch hierarchy.js —
out of lever scope.

## 4. Sense-testing: ONE NARRATIVE LIE FOUND AND FIXED

- **Ledger beats are honest television** (sweep transcripts): "📺 WAVE
  LEDGER — wave 1 is halfway there (3/5 kills — the ledger counts kills
  only, not near-misses)." / "…bar is full (5/5 — kills only, not
  near-misses)." The unlock beat ("📺 RATINGS ARE UP! … Wave 2 talent has
  been released into your sector") fires the same day the bar fills.
  Coherent, reactive, no lies.
- **Fight summaries read like people fighting**: "James stood down the
  Hushpuppy and kept walking — 1 round, bloodied but breathing." /
  "Marcus killed the Lockpick alone — 2 rounds, 10 taken. Word travels
  fast." The "1 rounds" grammar fix from r2 is live in sweeps.
- **Contest transcripts honest**: "📺 CONTEST: The Pit. Thrown into an arena
  with a wave-appropriate beast. Kill or be killed."
- **THE LIE (fixed):** `_ledgerAnnounce`'s 100% beat said "The next wave
  opens when the day and scale floors pass." — wrong for EVERY wave:
  w1→w2 and w2→w3 have day floors ONLY (no scale); w3→w4 and w4→w5 have
  scale floors ONLY (no day floor); and for **wave 5's bar there is no
  next wave at all** — the old line promised casting directives that never
  come. Now per-wave honest (`src/js/waveLedger.js`): w1 → "Wave 2 opens
  once day 8 passes."; w2 → "Wave 3 opens once day 25 passes."; w3 →
  "Wave 4 opens when Haven goes regional."; w4 → "Wave 5 opens when Haven
  goes national."; w5 → "That's the whole ledger — the village has bloodied
  the Producers themselves. No further casting directives. You're the show
  now." The floor values read live from config, never hardcoded.

## Reachability verdict

- Wave 1: 20/20, fought blow-by-blow. ✅
- Wave 2: 15–16/20, median day 29–35, ledger-bound. ✅
- Wave 3: 2/20 (days 53, 77); era contact-thin (lever 1's problem, r2). ⚠️
- Waves 4–5: 0/20 — scale-bound (lever 8). Dials verified coherent. ❌
- Contest-kill channel: real, rare, pacing-neutral. ✅ (this run)

## Village assessment (plain words)

The typical village kills its fifth wave-1 beast around day 29 and meets
wave 2 underprepared — combat is 45% of deaths, monsters another 25%,
starvation 21% (202 deaths across 20 runs, all village-lost, 0 wins, median
55 days). The villages that reach wave 3 do it on villager kills, not the
player's — the village is the protagonist in the ledger too. The knowledge
economy hums underneath: 123 counter discoveries across 20 runs (~6/run).
The ledger's pacing is a three-part machine and this run checked all three:
the bars do the work (every unlock ledger-bound), the day floors stand
watch over the fiction (never fired, correctly), and the scale floors are
the wall the whole late game waits behind. Televised killing joined the
ledger this week — the cameras now write into the village's permanent
record — and the sims say the show doesn't rush the war.

## Blanks filled

1. **Contest-kill fix measured on identical seeds** — pacing-neutral,
   directive satisfied, not a farm vector. Decision documented; no dial.
2. **Ledger 100% beat per-wave honesty** (`src/js/waveLedger.js`) — the old
   generic line was wrong for every wave and a lie for wave 5. Proof
   `scripts/test-wave45-coherence-20261011.js` 22/22 (5 red pre-fix).
3. **Wave 4/5 coherence proven by construction** — gates, caps, beats, pool.

## Documented (not fixed)

- Day floors provably inert (20/20) but kept as fiction backstops — not dialed.
- Scale path never calls `checkWaveUnlockBeat` → handoff to lever 8
  (hierarchy.js `_fireRegionalDawn` / national-set).
- Seed 18 butterfly: villageSlain→beasttricks (1+ threshold) shifted one run;
  intended mechanism, single chaotic data point.
- Carried from r2: wave-3 era thinness (lever 1), `aidFight` dead code
  (comms.js), waves 4–5 scale-bound (lever 8).

## Tests & commits

- `scripts/test-wave45-coherence-20261011.js` — 22/22 (new; 5 red pre-fix)
- `scripts/test-wave-ledger-20261010.js` — 31/31 (unchanged)
- `scripts/test-contest-ledger-20261011.js` — 22/22 (unchanged)
- `scripts/test-cap-lever-20261011.js` — 15/15 (unchanged)
- `scripts/test-wave-bar-20261011.js` — 13/13 (unchanged)
- `scripts/test-bal-waves-20261010.js` — 30/30 (unchanged)
- `scripts/test-villager-wave-xp-20261010.js` — 20/20 (unchanged)
- `scripts/test-wave3-5-20261010.js` — 215/215 (unchanged)
- `scripts/validate-ontology.js` — 79/79 systems
- Sweeps: `scripts/sweep-wave-lever.js`; 20 seeds × 200d BEFORE
  (pristine `contestEngine.js` from `c37267a0^`, restored byte-identical
  after) vs AFTER (committed HEAD); raw JSON in goal hidden_files
  (`wavelever-r3-before.json`, `wavelever-r3-after.json`).
- `[needs-eyes]`: ledger 100% beat copy changed (System voice lines Steve
  may want to hear on his phone).
