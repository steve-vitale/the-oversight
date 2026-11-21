# sim-costbar-b — the v2 scalemetric cost bar (finding #2641)

Loop B run fleshout-loop-b-20261121T1630Z, arm 3 of 3: sim-costbar-b.
Instrument only — NO game change, NO src/ change.
Prereg: `evidence/2026-11-21/sim-costbar-b-prereg.md` (frozen, with dated
amendment A1). Analyzer: `scripts/scalemetric-costbar-v2.js`. Proof:
`scripts/test-costbar-b.js` (47/47 PASS, run twice, deterministic).
Judgment output: `evidence/2026-11-21/costbar-b-confirm.json`.

## 0. Verdict (one line)

**The v2 cost bar is built, proven, and ready for the next launch-cost
judgment. On the profilegate confirm corpora it returns COST PASS — and it
corrects the premise it was built on: the headline "+64 expedition deaths"
are monster kills, not villagers dead on the road.**

## 1. The bar (frozen definition)

The v2 bar EXTENDS the frozen B1–B5 scalemetric bar; no inherited term
moves. Full definition in the prereg §2; the terms:

- **B1 median** (inherited): medianDays(ON)/medianDays(OFF) ≥ 0.8.
- **B3 starvation** (inherited): ON totals ≤ OFF + 2 AND ON arm-only
  (same-seed same-day matched) ≤ OFF arm-only + 2.
- **C1 people-death rate** (new): mean per-seed people deaths
  (`kind` in {villager, person}) per 100 game-days. FAIL iff the ON rate
  exceeds OFF × 1.10 **AND** exceeds OFF by more than +1.0/100d (AND
  connective per amendment A1 — a cost must be both relatively and
  absolutely large).
- **C2 early loss** (new): FAIL iff gross collapse flips (survived OFF →
  lost ON) ≥ 4 OR earlier-collapse days (both-lost seeds) ≥ 100.
  Deliberately loose: calibration shows flips are noise-dominated.
- **C3 launch-attributed road deaths** (new, the #2634 separation term):
  a people death counts iff its victim launched on a wave-4 party
  (`v4departs`, `result: 'launch'`, holder or party) within 7 days before
  the death, and the cause is not a home cause (starvation/thirst/
  dehydration/disease/sickness/wound_fever/wound/contest/arena). FAIL
  iff the attributed count rises by ≥ 1.0 × nSeeds OR the per-launch
  lethality ratio ≥ 1.50. Corpora without launch records report C3 as
  `not_observed`, never FAIL.
- **C4 expedition monster kills** (diagnostic, NEVER a cost term):
  `cause: 'expedition'` rows, reported to prove the separation.

Overall: **COST PASS iff B1 + B3 + C1 + C2 + C3 all pass.**

## 2. The taxonomy correction (the finding that changes the bar)

Finding #2641 as filed reads "expedition deaths 285 → 349 (+64)" as
parties walking out and dying on the road. That reading is wrong in the
recorder's taxonomy, and the bar is built on the corrected reading:

- Every one of the 285 OFF / 349 ON `cause: 'expedition'` rows has
  `kind: 'monster'` and `who` = a monster id. Zero have
  `kind: 'villager'`.
- Code: `src/js/villager-mapmem.js` `mapmemNoteKill` — "the expedition
  kill hook" — registers `kind: 'monster', cause: 'expedition',
  killerId: vid` when a villager KILLS a monster on expedition. The +64
  is 64 more monsters killed on expedition: the lever working (more
  launches → more expedition kills), not 64 more villagers dead.
- The harness (`scripts/sim-harness.js`, live death capture) pushes EVERY
  `tele('death')` event — monster kills AND people deaths — into one
  `samples.deaths` array. The §15 panel's "village deaths" is that same
  mixed stream: deaths/run 78.375 = 1254/16 exactly, and deaths/100d
  56.1949 → 64.5186 is the mean of per-seed rates over the mixed stream
  (recomputed exactly from the corpora).
- People-side deaths in the confirm band: OFF 205 → ON 201 (DOWN).
  By cause: 'the wild' 79 → 69, 'monster' 48 → 44, starvation 10 → 11.
  The old `deathTotals.villager` is not this quantity either — it equals
  total minus scholar deaths, i.e. it counts monster kills too.

Consequence: any bar that prices `cause: 'expedition'` rows as a cost
penalises a benefit and would kill good launch levers. The v2 bar prices
people deaths only.

## 3. Calibration (frozen)

Four committed scalemetric bands, `evidence/2026-10-24/` (8 seeds each).
C3 is not calibratable there (no launch records — those corpora predate
the launch recorder). People-death rates are mean per-seed rates /100d.

| band | C1 rate OFF → ON | ratio | delta | C1 | flips | earlierDays | C2 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| leanlink-pilot (known BAD) | 7.68 → 9.12 | 1.187 | +1.44 | FAIL | 3 | 27 | pass |
| leanlinkrescue-pilot (known GOOD) | 7.68 → 8.68 | 1.130 | +1.00 | pass | 2 | 34 | pass |
| leanlinkcap5-pilot (known GOOD) | 7.68 → 8.28 | 1.077 | +0.59 | pass | 3 | 0 | pass |
| leanlinkcap5-confirm (mixed) | 6.20 → 8.48 | 1.367 | +2.28 | FAIL | 3 | 0 | pass |

Separation: C1 FAILS exactly the two bands with a known cost signal and
PASSES exactly the two known-good bands. C2 passes all four — flips 2–3
and earlierDays ≤ 34 are the noise floor, which is why the C2 thresholds
(flips ≥ 4, earlierDays ≥ 100) sit above them. Note the rescue band is
the reason for amendment A1: under the originally-frozen OR connective
it failed C1 on the ratio alone (1.130 > 1.10, delta +0.996 inside the
bar) — n = 8 Poisson noise tripping a single clause. The AND connective
fixes it without moving any number.

## 4. Proof (green BEFORE judgment)

`node scripts/test-costbar-b.js` — 47/47 PASS, run twice (deterministic).
Independent recount code path, separate from the analyzer (same pattern
as test-sim-scalemetric):

- T1 taxonomy: synthetic corpora with +64 expedition monster kills and
  zero people-death change pass C1/C2/C3 (expKills cannot move any cost
  term); the synthetic join counts the launched party member's death.
- T2 confirm quantities match the recount exactly (peopleDeaths 205/201,
  expKills 285/349, starvation 10/11, arm-only 2/3, median 150.5/151d,
  lost 5/6, rates 9.2423/9.9524, attrRoad 27/38, launches 227/281,
  flips 3, revFlips 2, earlierDays 73, wall numbers).
- T3 detection: attrRoad delta +11 (≥ +5 floor), flips 3, earlierDays
  73, per-launch lethality ratio 1.137 — the real road-death cost is
  detected and reported.
- T4 neutral: A/A self-comparison (OFF vs OFF) COST PASS with all deltas
  zero; leanlinkcap5-pilot COST PASS, C3 `not_observed`.
- T5 known-costly: leanlink-pilot and cap5-confirm FAIL C1; rescue
  PASSES C1.
- T6 analyzer agrees with the recount on all four calibration bands.

One proof failure on the first run, fixed before judgment: my test's
arm-only recount used a SET of B-days instead of the frozen multiset
definition (a day with 2 A-deaths and 1 B-death leaves 1 arm-only death).
The analyzer matched the frozen definition and the confirm evidence
(arm-only 3 vs bar 4); the test was wrong, not the analyzer.

## 5. Judgment: the confirm corpora under the v2 bar

Corpora: `perseed-profilegate4-confirm-b-off/` and `-on/`, 16 seeds
106751–106766, competent policy, 150d, anchor
df4867134afaf556232c4a7c377a4595b644a55c. Per-seed files read-only;
analyzer output is the new `costbar-b-confirm.json`.

| term | OFF | ON | bar | verdict |
| --- | --- | --- | --- | --- |
| B1 median days | 150.5 | 151 | ratio ≥ 0.8 (1.003) | PASS |
| B3 starvation totals | 10 | 11 | ≤ 12 | PASS |
| B3 starvation arm-only | 2 | 3 | ≤ 4 | PASS |
| C1 people-death rate /100d | 9.24 | 9.95 | ratio ≤ 1.10 (1.077) AND delta ≤ +1.0 (+0.71) | PASS |
| C2 flips / earlierDays | — | 3 flips (2 reverse), 73d | < 4 / < 100 | PASS |
| C3 attrRoad (per launch) | 27 (0.1189) | 38 (0.1352) | delta < 16 AND ratio < 1.50 (delta +11, ratio 1.137) | PASS |
| C4 expKills (diagnostic) | 285 | 349 | — | +64, benefit |

**V2 verdict on the confirm arm: COST PASS.** Every term passes; C1's
ratio margin is the tightest (1.077 vs 1.10).

What the bar DOES catch on this band (detection, not verdict): the real
road-death cost is launch-attributed people deaths 27 → 38 (+11), with
per-launch lethality 0.119 → 0.135 (+14%). Launches rose 227 → 281
(+24%), so most of the +11 is exposure (more walks out), not deadlier
walks. Per-seed: the rise concentrates in 106752 (2 → 7, a village that
survived ON after being lost OFF — more days alive, more exposure) and
106759 (0 → 5); 106753's attributed deaths fall 7 → 1 because it
collapses 73 days earlier ON. The 3 collapse flips (106754/106757/106764)
arrive with FEWER or equal people deaths on the ON leg (13 = 13, 14 → 6,
12 → 10) — the bar reports them as early loss (C2 WATCH) and does NOT
claim road deaths caused them. That is the #2634 separation working as
designed: the launched fight's own outcome (C3) is measured separately
from downstream collapse (C2), and on this band the two do not line up.

What the bar does NOT reproduce: the old reading's "+64 road deaths."
The +64 is expedition monster kills (C4). Decomposed, the panel's
+8.32 deaths/100d regression signal is ≈91% monster kills (people-rate
delta +0.71 of +8.32). The panel signal is real arithmetic on a mixed
stream; it is not a villager-death signal. **The confirm arm's cost
verdict under the new bar is COST PASS — the launch cost on the people
channel is small and inside every calibrated bar, and the headline +64
was a benefit counted as a cost.** The confirm arm's own GO (B1+B2+B3+B5
in its prereg) is unaffected — the v2 bar is the cost side only, and it
passes too.

## 6. Reachability / wall numbers (judged corpus, recomputed)

National 0/16, table 0/16, wins 0/16 — the scale wall stands past
regional on both legs. Wave 4 unlocks 16/16 both legs; wave 5 unlocks
6/16 OFF, 5/16 ON. Median survival 150.5d OFF, 151d ON. The bar prices
cost, not reach: it does not move any of these numbers, and none of them
is a bar term.

## 7. Village assessment (plain words)

Sixteen villages, same starting conditions, two rules about who may walk
with a hunting party. Under the new rule the parties walk out more —
281 departures against 227 — and they kill more monsters on the road
(349 against 285). The villages themselves do not bleed more people:
201 villagers die against 205 before, and the death rate per hundred
days barely moves. Eleven more villagers die within a week of walking
out than before, which is the real price of the extra walks — about one
extra road death for every ten extra departures, not the sixty-four the
old count suggested. Three villages that stood before fall now, and two
that fell before stand now; the falls do not come with more bodies, so
the bar records them as early loss without blaming the road. The wall
past regional is untouched: no village reaches national, no seat, no
win, on either rule.

## 8. Sense-testing

No transcripts were read in this arm — it is an instrument arm over
committed corpora, not a playtest. The one sense-relevant check: the
`cause: 'expedition'` label reads as "died on expedition" and misled the
prior evidence; the code (`mapmemNoteKill`, "the expedition kill hook")
shows it means "killed [a monster] on expedition." A label fix in the
recorder (e.g. `cause: 'expedition-kill'`) is a candidate follow-up so
the next reader does not repeat the misread — noted, not built (out of
this instrument arm's scope; it would change recorder output).

## 9. Metric review (§14)

- **C1 AND-connective (amendment A1, pre-judgment):** the OR form was
  METRIC-BROKEN on n = 8 bands (rescue failed on ratio noise alone).
  Fixed to AND before any verdict; numbers unmoved. Watch item: the
  rescue delta (+0.996 vs bar +1.0) passes by 0.004 — the AND structure
  makes that knife-edge harmless (ratio alone cannot fail), but a future
  band landing exactly on both clauses would deserve a second look, not
  a silent pass.
- **C2 is deliberately loose.** A 3-flip / 73-day-early loss does not
  fail the bar, by design (calibration: known-good bands flip 2–3).
  If Steve wants early loss to bite harder, that is a threshold decision
  for the next run, not a re-score of this one.
- **C3 has no calibration band.** Its thresholds (≥ 1.0/seed, ratio
  ≥ 1.50) are a priori and loose; the first launch corpus with a real
  road-death problem will be the first calibration point. Do not tighten
  C3 on the confirm's +11 — that would be tuning to the judged band.
- **The panel's "village deaths" still counts monster kills.** The v2
  bar corrects the cost judgment, but the §15 panel instrument itself
  still mixes the streams. A panel-contract fix (split people deaths
  from monster kills) is a Steve-call — the contract digest changes with
  it, so it cannot be done inside this arm.
- **Metrics held otherwise.** No re-scoring: the confirm judgment ran
  once, under the frozen (amended) bar, and the verdict is as rendered.

## 10. Blanks filled / documented

- FILLED: the v2 cost bar exists (`scripts/scalemetric-costbar-v2.js`,
  proof `scripts/test-costbar-b.js`, 47/47 green), with the launch
  attribution join (C3) and the monster-kill/people-death split the
  next launch-cost judgment needs.
- CORRECTED: finding #2641's premise — the +64 expedition deaths are
  monster kills (code-proven), and the panel's +8.32/100d signal is
  ≈91% monster kills. The real road-death cost on the confirm band is
  +11 launch-attributed people deaths, per-launch lethality +14%.
- DOCUMENTED (not built): recorder label `cause: 'expedition'` misleads
  (candidate `expedition-kill`); panel contract still mixes death
  streams (Steve-call to split; digest changes).
- Convergence state: instrument delivered — this arm is done; the bar is
  ready for the next launch-cost judgment.
