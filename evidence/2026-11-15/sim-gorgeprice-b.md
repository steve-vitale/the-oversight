# sim-gorgeprice-b — cascade gorge-pricing follow-up: PILOT NO-GO (revised cost bar, rate leg)

**Verdict: PILOT NO-GO — the lever is NOT landed; no confirm spend.**
The lever works (P1 0.52x, same-instance repeat-killer pairs 15 → 0,
survival 140d → 150d, survived 3/8 → 6/8) and the gorge price is now
measured, not assumed (voiced gorge kcal +53%, 338,321 → 518,450).
But the pilot gate requires all three conditions, and gate (ii) — the
REVISED cost bar — fails on its rate leg alone: the fresh control band
starved nobody (pooled 0, rate 0.0), so 1.25x a zero control rate is
zero, and the armed leg's 2 starvation deaths (rate 0.177 per 100
lived-days) fail a bar that allows exactly none. The pooled tripwire
passes at its boundary (2 ≤ 0 + 2) and survival passes (1.07x). Under
metric binding (§14) a missed bar is NO-GO: the lever stays on branch
`sim-gorgeprice-b`, unmerged. The kill classification is
**METRIC-BROKEN** (bar form — see Metric review), not concept-dead:
the lever returns to the queue with a corrected pre-registration; this
is a NEW run, not a re-score.

**The 0930Z NO-GO under the old bar stands.** This run is a NEW
judgment under the revised bar on fresh seeds (100301–100308) with a
fresh control — not a re-score of the kill. Nothing in this file
revises the cascade verdict: under the old pooled-count bar the lever
was NO-GO, and it remains so.

Loop B run `fleshout-loop-b-20261115T1055Z`, axis winnability chain,
arm sim-gorgeprice-b (winnability-chain blank: price the gorge).
Prereg: `evidence/2026-11-15/sim-gorgeprice-b-prereg.md` (committed
`3fb0edf47` — binds, before any sweep). Branch: `sim-gorgeprice-b`.
Base master `9fa74d252`.

## The question, in plain words

The lingerer guard halves same-day cascade deaths, but the beast it
spares keeps eating: every siege now runs its full ~6 nights instead
of being cut short in the hall, and the village pays in pantry food.
The old cost bar (pooled starvation ≤ control + 2) caught the price
but could not tell a designed price from an unpriced harm, and it
punished longer life. This run prices the gorge directly — nights and
pantry-kcal per siege, starvation per 100 lived-days — and re-judges
the same lever under that priced bar.

## The lever (unchanged from sim-cascade-b)

**LINGERER HOLDS THE TREELINE** (`src/js/game.js`, `monsterTurn()`):
`if (m.lingering) return;` — recovered from branch `sim-cascade-b`
commit `942e15ca5`; the game.js diff vs master is ONLY the guard
(1 hunk, +16 lines, verified by `scripts/test-gorgeprice-b.js`
static and by `scripts/test-cascade-b.js` static). No other
game-code change; policies byte-identical.

## Stage — PILOT: NO-GO (8 seeds 100301–100308, 150d, competent-answercourt-b)

Fresh control + armed legs on the current tip, same driver
(`scripts/cascade-driver-20261115.js`, `RUN=gorgeprice-b`), same
analyzer definitions as cascade plus the gorge parse
(`scripts/analyze-gorgeprice-b.js`).

| metric | control (OFF) | armed (ON) | bar | verdict |
|---|---|---|---|---|
| **P1** scholar wild deaths / national-day | 0.1338 (70 / 523) | **0.0699 (40 / 572; 0.52x)** | ≤ 0.6x control | **PASS** |
| **P2** median national held-days (secondary) | 68.5 | **79** | reported | up |
| starvation pooled | 0 | 2 | tripwire ≤ control+2 (≤ 2) | PASS (at boundary) |
| starvation / 100 lived-days | 0.0 | **0.177** | ≤ 1.25x control (≤ 0.0) | **FAIL** |
| median survival | 140d | **150d (1.07x)** | ≥ 0.8x control (≥ 112d) | PASS |
| gap-0 followers (all / while-national) | 12 / 11 | **6 / 6** | must fall | PASS |
| same-instance repeat-killer pairs | 15 | **0** | must fall | PASS |
| total deaths | 663 | 624 | — | — |
| villager combat deaths / 100 lived-days (§14c) | 558 (52.39) | 552 (48.89) | reported | — |
| survived to 150d | 3/8 | **6/8** | — | — |
| national-ever / end-state national | 8/8 / 8/8 | 8/8 / 8/8 | — | — |
| wave-5 unlocked / wave-4 | 4/8 / 8/8 | 3/8 / 8/8 | — | watch |
| dissolutions | 0 | 0 | — | — |
| wins / table | 0 / 0 | 0 / 0 | — | — |

**Pilot gate.** (i) Mechanism fires: gap-0 falls (12 → 6) AND
same-instance pairs fall (15 → 0) — PASS. (ii) Revised cost bar clean
— FAIL (rate leg only; tripwire and survival pass). (iii) P1 moves
GO-direction AND gap-0 falls — PASS. **Two of three pass → PILOT
NO-GO.** No confirm spend, per the prereg.

Per-seed survival, OFF → ON (days): 100301 131→150★, 100302
150★→150★, 100303 149→150★, 100304 103→150★, 100305 124→150★,
100306 108→98, 100307 150★→150★, 100308 150★→131 (★ = survived the
horizon). Five improved, two unchanged at the horizon, two shorter
(100306 −10d, 100308 −19d).

### The gorge price (voiced — a lower bound; see prereg caveat)

Gorge lines are only SAID when the scholar is at Haven (GORGE GATE)
while the take runs identically when away, so these are voiced gorge
nights/kcal, not the full gorge.

| gorge price | control | armed | change |
|---|---|---|---|
| voiced gorge nights | 309 | **468** | **+51%** |
| voiced gorge kcal | 338,321 | **518,450** | **+53%** |
| gorge nights / 100 lived-days | 29.01 | **41.45** | +43% |
| gorge kcal / 100 lived-days | 31,767 | **45,921** | +45% |
| mean kcal / voiced gorge night | 1,095 | 1,108 | +1% |
| kcal / siege (prereg definition) | 1,230 | 1,160 | −6% |
| zero-kcal circle nights (empty pantry) | 0 | **7** | — |
| sieges (consecutive-day runs) | 275 | 447 | +63% |

The price is VOLUME, not price-per-night: each gorge night costs
~the same (~1,100 kcal), but there are half again as many nights,
because every siege now runs to its drift valve instead of ending in
a hall fight. Kcal-per-siege even falls slightly — the prereg's
per-siege grouping fragments (275 sieges for 309 nights: most
"sieges" are a single voiced night, because lines go unvoiced while
the scholar is away and because several lingerers gorge at once).
Per-siege adds nothing over per-night; the per-100-lived-days
figures are the priced comparison (see Metric review).

Per-seed gorge nights OFF → ON: 100301 25→30, 100302 59→65, 100303
106→90, 100304 7→17, 100305 19→80, 100306 9→30, 100307 34→75,
100308 50→81. Up on 7/8 seeds; 100303 is the exception (its control
leg already carried the longest siege in the band — 106 nights — and
the armed leg ran shorter, 90).

### The two starvation deaths — one gorge-adjacent, one exposure

Both on seed 100304 armed (the seed that lived longest relative to
its control: 103d → 150d). Both villagers, not the scholar.

- **d95, gen_s070527 — gorge-adjacent.** d94–95 brought a TRIPLE
  siege: three lingerers (The Loud Stare, Big Loud, Don't-Look)
  gorging the same nights — 1,359 + 1,753 + 1,000 kcal on d94, then
  1,200 + 1,200 on d95 (~5,300 kcal in two nights). The starvation
  lands the same day as the second triple-gorge night. The gorge
  mechanism is the proximate cause here, and it is plural: sieges
  stack, and the design's "~6 nights" is per beast, not per village.
- **d131, visjoin_118 — exposure, not gorge.** No gorge line falls
  in the d120–131 window. The pantry slid 13,000 → 0 over twenty
  days (d110 → d131) while the roster shrank 6 → 2 and nobody
  brought food in. This is the "lived longer" exposure the old bar's
  critics warned about: a village that survives to day 150 can starve
  on day 131 for ordinary reasons, and a rate bar counts it the same
  as a gorge kill.

### The reversals (100306, 100308) — not lever failures

- **100306 (108 → 98).** Scholar wild deaths 12 → 5 — the lever did
  its job. The village died of roster combat instead (villager
  combat deaths 23 → 27, expedition deaths 6 → 9). Its control leg
  ended on a same-day double scholar death (d108, visjoin_88 +
  visjoin_84 — a gap-0 cascade pair); the armed leg has no end
  cascade at all.
- **100308 (150 → 131).** The one pilot seed where P1 did not
  improve: scholar wild deaths 11 → 12, villager combat 24 → 29.
  No starvation on either leg. Trajectory chaos in the roster, not
  a guard failure (same-instance pairs are 0 armed across the band).

### Residual gap-0: still class B, halved

All 6 armed gap-0 followers are class (B) breach, as were all 12
control followers (A 0, C 0 both legs). Breach-provenance scholar
wild deaths fell 82 → 44; wild-provenance 5 → 7. The guard removes
the lingering-besieger duels; what remains is non-lingering
intruders and pending/feast breach fights the guard structurally
cannot reach — the same residual the cascade confirm found. The
gap-1 bucket collapsed with the cascade (24 → 3 while-national);
gap-3+ fell 32 → 26.

### §15 panel, pilot band

`evidence/2026-11-15/gorgeprice-b-panel.{json,md}` (+ `-before` /
`-after` `.json.gz`; builder `scripts/build-gorgeprice-panels-20261115.js`,
cloned from the cascade builder; paired seeds, same policy, the
contrast IS the game code). Decision **review_required**; no material
signals — every observed CI includes zero. Village deaths per run
82.9 → 78; deaths per 100 days 62.3 → 55.3 (CI [−15.6, +1.1]);
community loss 0.625 → 0.25 (CI [−0.75, +0.125]). The panel agrees
with the pre-registered bars: primary effect real, no material
signal either way on deaths.

### Telemetry deviation check

Three LOUD lines on the ON leg (national 12→0, table 16→0, wins
16→0) — investigated same-run: the CONTROL leg fires the identical
three lines, and the baseline file's own `_regime.note` forbids
comparing pre-seat substrates against the winseat baseline ("wins
are structurally ~0 there and telemetry-check will fire a spurious
LOUD 'wins disappeared'"). Regime artifact, not a lever regression.

## Proof tests

- `scripts/test-gorgeprice-b.js` — **4/4 GREEN** (static, gorge-parse,
  bars, determinism; seed 100301, 60d determinism leg). RED→GREEN
  leg: the gorge-parse case first failed on a missing module
  (`analyze-gorgeprice-b.js` not yet written), then went green; the
  test fixture itself was corrected twice during the leg (a siege
  split across a day gap, and a 1-decimal rounding tolerance) — the
  parser was right both times.
- `scripts/test-cascade-b.js` — **4/4 GREEN** on the recovered lever
  (seed 100207): unit-lingering (lingering adjacent/on-cell: no move,
  no fight; non-lingering adjacent: fights; direct startCombat on a
  lingerer: fights); sim-mechanism (100d: 4 wild scholar deaths,
  lingerDeaths 0, gap-0 0, 8 breach sessions still occurring);
  determinism (60d, 45 deaths).
- Analyzer cross-check (not a judged run): on the OLD cascade
  16-seed corpora the new analyzer reproduces every published number
  exactly (P1 0.1248 / 0.0665, starvation 3 / 8, gap-0 39 / 11,
  pairs 41 / 3) and the published gorge counts exactly (645 → 1172
  nights). The parser is verified against the published count, not
  just its own fixtures. Under the REVISED bar that old corpus would
  also be NO-GO (starvation rate 0.148 → 0.369, 2.49x; tripwire
  8 vs 5) — the bar is demanding, not a softening. (Context only:
  different seeds; the old corpus is never the judge.)
- `src/js` is unchanged from the branch lever; `check.js` did not
  run in this arm and no claim is made that it did.

## Sense-testing

The siege is voiced and now accumulates. On 100305 armed, FIVE
lingerers gorge on the same night (d60: The Loud Beast, The
Landlord, Big Ugly, The Audit, The Eulogy — ~5,800 kcal in one
night), and two monsters gorge 18 nights each across d60–85. The
nightly line names the beast and its price every time — the
endure-or-sortie choice is actually presented instead of silently
executing bearers. But the cascade evidence's missing line is still
missing: nothing ever says "the same beast that killed your last
bearer is still out there" — and the village still grieves in
isolation (100305's d140 double death, david_kim + hassan_ali the
same day, reads as two tragedies, not one enemy). The siege voice
also sits oddly beside the realm voice: on d60–62 the same nights
bring court speakers, feast lines, and five gorge reports — a realm
holding court while monsters eat its stores. Coherent, grim, and
true to the design; the feast-on-the-same-night as a triple gorge
(d62: a proper feast while three beasts eat) reads as a village that
does not connect the two ledgers. (Follow-up blank, not this arm.)

## Reachability verdict (control leg)

- **Waves 1–5:** wave-4 8/8; wave-5 4/8. The lever does not unlock new
  waves; it lets villages live long enough to face wave 5 more often
  on this band (survived 3/8 → 6/8).
- **Regional → national:** national-ever 8/8; end-state national 8/8.
- **The table:** 0/8. **Wins:** 0/8. (Both legs.)

## Wall numbers (pilot band, 8 seeds — final)

- **Control:** P1 0.1338 (70 / 523); held-days 68.5; survival 140d;
  starvation 0 (rate 0.0); deaths 663; national-ever 8/8; end
  national 8/8; wave-5 4/8; wave-4 8/8; survived 3/8; wins 0;
  table 0. Gorge: 309 voiced nights, 338,321 kcal.
- **Armed:** P1 0.0699 (40 / 572); held-days 79; survival 150d;
  starvation 2 (rate 0.177); deaths 624; national-ever 8/8; end
  national 8/8; wave-5 3/8; wave-4 8/8; survived 6/8; wins 0;
  table 0. Gorge: 468 voiced nights, 518,450 kcal.
- The scale wall stands: no wins, no table on either leg. The lever
  moves the winnability chain's middle links (cascade deaths halved,
  survival doubled at the horizon) but does not open the wall — and
  on this band it trades a little scale reach (wave-5 4 → 3) for that
  survival.

## Metric review (pilot NO-GO on the revised cost bar)

**The revised bar as frozen degenerates to zero-tolerance when the
control band starves nobody.** The rate leg ("armed ≤ 1.25x control
rate") multiplies the control rate; with a control rate of 0.0 the
allowance is exactly 0, so ONE starvation death anywhere in the armed
leg fails it — including the d131 exposure death, which has no gorge
line near it and is the "lived longer" case the revision was meant to
stop punishing. The tripwire (the prereg's own allowance for small
counts) passed at its boundary, 2 ≤ 2. The bar's two legs therefore
disagree by construction on any zero-starvation control band: the
tripwire says "two deaths is the allowed price," the rate leg says
"any death is too many." That is a mis-scoped bar (METRIC-BROKEN,
§14a), not a concept failure: P1 passed at 0.52x, the mechanism fired
cleanly (pairs 15 → 0), and the priced cost is real but small (2
deaths; gorge +53% kcal, ~1,100 kcal per gorge night — the price is
volume, not price-per-night).

Proposed revision for the NEXT run (not a re-score of this one): the
rate leg needs a floor — judge armed rate against
`max(control rate, F)` with F set from the pool before the run (e.g.
0.5 starvations per 100 lived-days, roughly one death per
200 lived-days), or bind the rate leg only when the control pooled
count is ≥ 3 and let the tripwire alone judge smaller bands. Either
form must be frozen in the next run's prereg before its sweep.
Second finding: the per-siege metric is not measurable from voiced
lines — sieges fragment to ~1.1 nights each (unvoiced away-nights +
simultaneous lingerers), so "kcal per siege" ≈ "kcal per night" and
adds nothing; the next prereg should price the gorge per 100
lived-days only, and drop per-siege or segment sieges from the
engine's lingerer records instead of linkLines. Third: the rate
conflates gorge cost with trajectory chaos — the old corpus's rate
failure was driven by the 100216 wipe (5 starvations, zero gorge
lines), and this pilot's d131 death is the same class. A gorge-cost
bar should ideally be judged on gorge-attributed starvation, but
attribution needs a pantry-ledger join the driver does not yet
record; until then the rate + tripwire pair is the honest proxy, with
the floor above.

**No metric revision is applied to this run.** The pilot verdict
stands as NO-GO under the frozen bar.

## Files changed

- `evidence/2026-11-15/sim-gorgeprice-b-prereg.md` (new) — binding
  prereg (committed `3fb0edf47`, before any sweep).
- `src/js/game.js` — the lever (one guard in `monsterTurn()`),
  recovered from `sim-cascade-b` `942e15ca5`. **NOT merged —
  pilot NO-GO on the revised cost bar; stays on this branch only.**
- `scripts/test-cascade-b.js` (recovered from `942e15ca5`) — proof
  test (4/4 on this tip).
- `scripts/analyze-gorgeprice-b.js` (new) — cascade analyzer +
  gorge parse + rate/tripwire/survival bars; reproduces the cascade
  16-seed numbers and gorge counts exactly on the old corpora.
- `scripts/test-gorgeprice-b.js` (new) — proof test (4/4; RED→GREEN
  leg recorded above).
- `scripts/build-gorgeprice-panels-20261115.js` (new) — §15 panel
  builder (cloned from the cascade builder).
- `evidence/2026-11-15/perseed-gorgeprice-b-control/` — 8 files
  (fresh control, seeds 100301–100308).
- `evidence/2026-11-15/perseed-gorgeprice-b-on/` — 8 files (fresh
  armed, seeds 100301–100308).
- `evidence/2026-11-15/gorgeprice-b-panel.{json,md}` +
  `gorgeprice-b-panel-before.json.gz` /
  `gorgeprice-b-panel-after.json.gz` — §15 balanced-panel compare
  (decision review_required, no material signals).
- This file: `evidence/2026-11-15/sim-gorgeprice-b.md`.

## Village assessment (plain words)

Two versions of the same villages, and the same beasts standing at
the treeline. The old way, a wave-4 monster walked into the hall,
killed the scholar, and killed the next bearer the same day — one
beast bleeding a little more with each bearer it killed, the village
grieving six times and never learning it was one enemy. The new way,
the beast holds the treeline and never comes in — and the village
lives: six of eight villages survive the season where three did, the
realm holds longer, the same-day deaths halve and the repeat killer
vanishes entirely. But the beasts still eat, and now they eat
together: five of them at the treeline on one night, eighteen nights
apiece, fifty thousand more pantry calories over the season — and on
the village that lived longest, two people starved, one while three
beasts ate at once. The village does not die of the beast anymore.
It lives longer, holds its realm, and pays for the extra weeks in
food — two hungers' worth, no more, and the bar as written allows
none at all.

## Infrastructure

- No write-flap incident this run: all 16 per-seed files wrote
  first time, non-zero (550–828 KB), in 2-seed chunks (~2–4 min per
  chunk).
- Safe-commit index clobber struck 2× (prereg commit, lever-base
  commit) — repaired each time with the documented
  `git ls-tree -r HEAD | git update-index --add --index-info` pipe;
  commits verified correct (`3fb0edf47`, `3efd2b42`), no work lost.
- The lever was taken out of the tree for the control leg
  (`git checkout HEAD -- src/js/game.js`, patch saved to /tmp) and
  restored with `git apply` before the armed leg; guard presence
  verified 0 (control) / 1 (armed) by grep at each stage.
