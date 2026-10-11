# Long-run sim — lever 2 r2: wave unlock pacing, dials 2–3 (2026-10-11)

**Context:** the morning run (sim-wave-pacing.md) played lever 2's bar dial
(wave-2 bar 5→4) and left three dials: perTypeCap breadth pressure,
villager-experience counting fidelity, wave-era thinness. This run goes deep
on all three. The bar dial was NOT re-played.

## Dial 1: perTypeCap 2 vs 3 — MEASURED, REJECTED, KEPT AT 2

**Question:** morning run measured cap 2 binding hard (54 w1 / 9 w2 cap hits
per 20-run sweep) and called it honest, but wave-2 kill throughput is only
~1.9 kills/run. Is 3 the right call for the wave-2/wave-3 ledger?

**Method:** identical 20 seeds × 200d, competent policy
(`scripts/sweep-wave-lever.js`; sweep's `capHit` metric made config-driven).
Before = morning run's `wavelever-after.json` (cap 2, bar 4 — the committed
state). After = cap 3 in `src/data/wave-ledger.json`, everything else
identical. The contest-kill fix (dial 2) was developed in parallel but
REVERTED for the sweep (pristine `contestEngine.js` from HEAD) so the cap
comparison is unconfounded; raw: `/tmp/wavelever-cap3.json`.

**Unit proof** `scripts/test-cap-lever-20261011.js` (15/15): exact scoring at
both caps, the counter-kill clipping quirk (perType banks POINTS — a
counter-kill against 1 banked point adds only 1), and breadth minimums:
cap 2 → {w1:3, w2:2, w3:2, w4:2, w5:1} types; cap 3 → {w1:2, w2:2, w3:2, w4:1,
w5:1}. Cap 3 preserves w2/w3 breadth but weakens w1 (3→2) and w4 (2→1).

**Sweep result — cap 3 is decisively WORSE:**

| measure (20 seeds) | cap 2 (before) | cap 3 (after) |
|---|---|---|
| median survival | 69d (5 villages reach day 200) | **50d (0/20 reach day 200)** |
| max days | 200 | 82 |
| wave-2 unlock | 18/20, median day 30 | 16/20, median day 24 |
| **wave-3 unlock** | **6/20, median day 58** | **4/20, median day 48** |
| wave-4 / wave-5 | 0/20 | 0/20 |
| deaths | 208 | 216 |
| w2 kills/run | 1.8 | 1.3 |
| villager w2 vKills (sweep) | 21 | 8 |
| w1 types-to-fill bar (median, dist) | 6 (4–8) | 5 (3–6) |
| w2 types-to-fill bar (median, dist) | 3 (3,3,3,3,5,5) | 2 (2,2,2,3) |
| w2 types touched (sweep) | 13 | 9 |
| counter-bonus extras w1/w2 | 12 / 3 | 27 / 6 |

**Mechanism (the interesting part):** raising the cap can only ADD ledger
points for a fixed kill sequence — but the sequence isn't fixed. Cap 3
fills the wave-1 bar with 2 farmed types instead of 3 (median w2 unlock day
30→24), escalating wave-2 monsters (mean dmg ~25 vs ~16, HP ~89 vs ~54)
into villages ~6 days weaker. Villages die faster (69→50d), kill less
(1.8→1.3 w2 kills/run), and reach wave 3 LESS (6/20→4/20). **The per-type
cap is a PACING BRAKE on escalation, not just breadth pressure.** The naive
"more points → more unlocks" prediction was exactly wrong — the escalation
feedback loop dominates. The w2 throughput problem (~1.9 kills/run) is
encounter/combat territory (lever 1), not the cap.

**Decision: KEEP cap 2.** Documented in `src/data/wave-ledger.json`
`_comment` (CALIBRATION 2026-10-11), `docs/PROGRESSION.md` lever table, and
the game.js wave-unlock comment block. No per-wave-cap refinement: the w2
cap channel is worth ≤+0.5 pts/run while the escalation risk is proven;
more config surface for a lever-1 problem.

## Dial 2: villager-experience counting fidelity — ONE BLANK FOUND AND FIXED

**Audit:** every villager combat path traced to `recordWaveKill` (the single
choke feeding ledger + villageSlain + unlock beats):

| path | ledger | deed feed | verdict |
|---|---|---|---|
| patrol fieldFight vKill (game.js:5995) | ✅ | ✅ | was fine |
| wild-encounter fieldFight vKill (game.js:16306) | ✅ | ✅ | was fine |
| expedition fieldFight vKill (villager-agency.js:339) | ✅ | ✅ | was fine |
| player TB kill (game.js:35005) | ✅ | ✅ | was fine |
| contest pit/gauntlet/siege vKill (`_cxBlood`) | ❌→✅ | ✅ | **BLANK, fixed** |
| contest hide seeker vKill | ❌→✅ | ✅ | **BLANK, fixed** |
| contest beastmaster vKill | ❌→✅ | ✅ | **BLANK, fixed** |
| `aidFight` (comms.js crisis fight) | n/a | n/a | dead code, 0 callers — documented |

**The blank:** the contest engine runs REAL blow-by-blow fieldFight bouts
with REAL monster defs, but nobody called `recordWaveKill` on a vKill —
fought and killed, never recorded. A sibling of the 2026-10-10 fieldFight
deed-wrap bug. The deed feed already counted these fights (the fieldFight
wrap → wavesFaced), so the game treated contest bouts as real encounters
for the endgame deed gate while the ledger ignored the kills. No canon
carve-out exists (VILLAGER XP LAW: villager kills score exactly like the
player's; contests are unavoidable/feared, not a farm vector; perTypeCap
still applies).

**Fix** (`src/js/contestEngine.js`, +ontology rule `contest-kills-score`):
vKill in `_cxBlood`/hide/beastmaster → `recordWaveKill(beast.id)`.
Two honesty fixes in the same hunks: a pit mFlee win reported "killed the
beast" (now "drove the beast off"; evade → "the beast would not engage"),
and a hide vKill logged "Found — but walking" (now "Found — and slew the
seeker").

**Proof** `scripts/test-contest-ledger-20261011.js` — 22/22 (was 11 FAILED
pre-fix: the RED run is the blank demonstrated). Real contest resolution
across days×villagers (day-seeded `_cxWithSeed` stream, buffed
contestants so vKills occur in sampling — no stubbed fights). Asserts per
path: recordWaveKill called with the beast id, ledger scores, villageSlain
increments (beasttricks channel), deed feed records; and the negative:
flee engagements score ZERO on the ledger (8730921c reversal holds) but
still feed the deed.

**Documented (not fixed):** `aidFight` in comms.js — the crisis fight with
arrived allies — has ZERO callers. Designed and commented, never wired.
Wiring it is comms/lever-8 behavior, not a counting fix; noted here so the
next worker in that area knows the hook exists.

## Dial 3: wave-era thinness — DOCUMENTED AS OUT OF SCOPE (lever 1)

**Decomposition** (cap-2 baseline, 6 runs that unlocked w3):

| seed | w3 unlock | era | villager w3 fights | player w3 fights |
|---|---|---|---|---|
| 1 | d58 | 142d | 0 | 2 |
| 4 | d57 | 17d | 1 (vFlee) | 1 |
| 10 | d43 | 157d | 0 | 2 |
| 14 | d46 | 154d | 1 (vFlee) | 1 |
| 16 | d79 | 22d | 1 (vFlee) | 3 |
| 18 | d97 | 17d | 3 (2 vFlee, 1 vDie) | 2 |

Sweep totals: 6 villager w3 fights (0 vKills), 11 player w3 fights, across
509 era-days. The era is LONG enough in surviving runs (142–157d) —
**timing is not the problem; contact is.** The delivery machinery in my
lever is verified working: `monsterWavePool()` gates on `unlockedWave()`,
`spawnWaveTarget` delivers 60/25/15 as coded (morning run verified), the
wanderer's `castMonster()` casts from the unlocked pool with the same
ratios. The thinness is absolute encounter rate × 15% share — both are
lever 1 (combat & death share: monster pressure) territory, explicitly
out of my scope per the morning run's classification. When contact does
happen, villagers flee/die (0 vKills) — also combat balance, not counting.

**Handoff for lever 1:** w3 contact rate ≈ 0.03 fights/day in-era; the
60/25/15 split is correct as coded; if lever 1 raises absolute encounter
pressure, w3 content (and the deed gate's 4-distinct-w3 bar) becomes
reachable. No lever-2 dial (bars, caps, floors) can create contacts.

## Reachability verdict (unchanged levers)

- Wave 1: 20/20, fought blow-by-blow. ✅
- Wave 2: 18/20 unlock (cap-2 state). ✅
- Wave 3: 6/20 unlock; era exists but is contact-thin (lever 1's problem). ⚠️
- Waves 4–5: 0/20 — scale-bound (travel lever), unchanged. ❌
- Endgame deed gate: w3+ bars unreachable in practice (contact rate) — noted for lever 10.
- Contest kills now score the ledger — the village's televised kills count like wild kills. ✅ (fix above)

## Village assessment (plain words)

The cap-3 sweep is the story of this run: a village that proves itself
against wave 1 with six kinds of kills earns wave 2 at day 30 and usually
dies at day 69 having glimpsed wave 3. Rush the escalation by six days and
the same village dies at day 50 without ever learning to kill wave-2
beasts (villager w2 vKills 21→8). The ledger's per-type cap isn't a tax on
farming — it's the village's training schedule. Two types isn't a
curriculum; the System knows it, even if the reason is written in the
casualty lists. The contest fix closes a quieter gap: villagers were
already dying on camera in pits and gauntlets, and now those deaths and
kills enter the village's permanent record — the ledger, the slain counts
that unlock beast-trick teaching, the unlock beats. The village is the
protagonist; its televised kills count.

## Sense-testing (transcripts read)

- **Ledger beats are honest television.** "📺 WAVE LEDGER — wave 1's bar is
  full (5/5 — kills only, not near-misses). The next wave opens when the
  day and scale floors pass." The 50% beat shows the true count ("3/5" or
  "4/5" depending on when the kill lands). The unlock beat ("RATINGS ARE
  UP! … Wave 2 talent has been released into your sector") fires the same
  day the bar fills. Coherent, no lies.
- **Fight summaries read like people fighting** (seed 10): "Cheyenne stood
  down the Flashbulb Moth and kept walking — 5 rounds, bloodied but
  breathing." / "Miriam killed the Glasswing Darter alone — 3 rounds, 42
  taken. Word travels fast." / "The Highbeam Deer mauled Emma (-64 health)
  over 6 rounds. They're lucky to be breathing."
- **Stale-data note:** the morning run's `wavelever-after.json` still shows
  "1 rounds" in fight samples — that sweep ran BEFORE the grammar fix
  landed (verified by direct invocation only). Re-checked live:
  `fieldFightSummary` now renders "1 round" correctly across outcomes.
  No live bug.
- **Two narrative lies found and fixed in this run** (contest copy):
  a pit drive-off reported "killed the beast"; a hide seeker-slaying
  logged "Found — but walking." Both now say what happened.

## Blanks filled

1. **Contest vKills score the ledger** (`_cxBlood`, hide, beastmaster) +
   honest contest copy — proof 22/22 (11 red pre-fix).
2. **perTypeCap 2 vs 3 measured and decided** — 3 rejected with numbers;
   calibration documented in JSON `_comment`, PROGRESSION.md lever table,
   game.js wave-unlock comments.
3. **Stale wave-gate comments fixed** (game.js): "4 wave-1 kills" →
   "5 wave-1 ledger points (kills only)" (×2), and the unlock block that
   still cited the reversed 8730921c engagement lanes + "dormant" counter
   bonus + old bars {5,5,4,3,2} → current {5,4,4,3,2}, bonus LIVE.

## Documented (not fixed — out of scope)

- **Wave-3 era thinness is a contact-rate problem** (lever 1: monster
  pressure). Decomposition above; handoff written.
- **`aidFight` (comms.js) is dead code** — crisis fight designed, never
  wired. Noted for the comms/lever-8 area.
- **Waves 4–5 still 0/20** — scale-bound (travel lever), unchanged.

## Tests & commits

- `scripts/test-contest-ledger-20261011.js` — 22/22 (new; 11 red pre-fix)
- `scripts/test-cap-lever-20261011.js` — 15/15 (new)
- `scripts/test-wave-bar-20261011.js` — 13/13 (unchanged)
- `scripts/test-wave-ledger-20261010.js` — 31/31 (unchanged)
- `scripts/test-wave3-5-20261010.js` — 215/215 (unchanged)
- `scripts/test-bal-waves-20261010.js` — 30/30 (unchanged)
- `scripts/test-villager-wave-xp-20261010.js` — 20/20 (unchanged)
- `scripts/test-real-fights-20261008.js` — 15/15 (unchanged)
- `scripts/test-contests.js` — 29/29 (unchanged)
- `scripts/validate-ontology.js` — 72/72
- Sweep: `scripts/sweep-wave-lever.js` (capHit now config-driven);
  20 seeds × 200d cap-3 run raw: `/tmp/wavelever-cap3.json`
- `[needs-eyes]`: contest copy changes + ledger beats now firing from
  televised kills — Steve may want to see a pit kill land on the ledger.
