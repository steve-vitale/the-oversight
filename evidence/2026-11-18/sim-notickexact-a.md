# sim-notickexact-a — EXACT-population no-tick deferral (finding #2498 fix candidate)

**Arm:** sim-notickexact-a · **Loop A run:** fleshout-20261118T0647Z · **Axis:** scale-onramp
**Type:** BUILD (finding #2498 fix candidate — EXACT-population no-tick deferral).
**Branch:** `sim-notickexact-a` · **Base at arm start:** `03c53bf6e`
**Policy:** competent verbatim (`scripts/policies/competent.js`), sha256
`df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`
**Band:** fresh 103541–103548 (8 seeds) · **Horizon:** 150d death-aware
**Flags:** `VETREENGAGE=1 PROFILEGATE=1` both legs (bypass re-applied in-tree per leg,
reverted after; see Legs)
**Prereg:** `evidence/2026-11-18/sim-notickexact-a-prereg.md` (frozen before any sims)

## Verdict: BUILD GO

All eight frozen GO bars pass. The exact-population deferral removes the
measured no-tick population (5 → 0) without the trajectory collapse that
killed both broader scopings: launches hold (instances 6 → 8, wave-4
events 21 → 19 = 90.5%), footprint 5 (cap 20), cost bar green, trajectory
control exact on all 8 seeds, panel `review_required` (not
`regression_signal`), D1/D2 green, proof test green. The fix lands as one
file, `src/js/villager-brain.js` (+50/−1), with `[needs-eyes]` (villager
behavior change).

## The question (finding #2498)

sim-notick-a (DIAG GO, 17/17) traced part-3 `party_launch` commits with no
tick left to execute: the commit evaporates overnight, the plan re-bids or
departs within two days, 0 stalls, 0 attributable harm — the cost is one
lost part-3 action (an indoor hold instead of the core pick) per late bid.
Two broader deferral scopings are CONCEPT-DEAD: part-≥2 (428 deferred bids,
wave-4 events 18 → 17) and part-3-only (97 deferred bids, wave-4 events
48 → 2, median ratio 0.759, starvation 5 → 8). This arm scopes the
deferral to the EXACT measured population: a part-3 `party_launch` commit
is held ONLY when the plan has a target AND needWave ≥ 4 — the population
the diag's classifier opens instances from. The calibration (frozen in the
prereg, measured pre-run over the notickfix3 baseline corpus): 118
part-3 picks decompose to 15 wave-4-targeted rows (14 classifier no-tick
+ 1 night-skip with the same mechanism); stage is NOT gated (no-tick
selections occur in both hunt and party stages at score time).

## Fix shape (as built, `src/js/villager-brain.js` only)

In `vbrainScorePick`, when the winning pick is a `party_launch` override
AND the day-part is exactly 3 AND the holder's current win-plan has a
target AND needWave ≥ 4: no `writeCommit` is called; any earlier same-day
commitment for that vid is cleared (`delete br.commit[vid]`); the log
entry is marked `deferred = 'party_launch:no-tick-exact'`; the scorer
still returns the core pick, so the villager does their core pick (e.g.
forage) instead of the indoor EXPEDITION hold. `clearPerception` is NOT
called (it lives inside `writeCommit`), so a later re-score the same day
can re-pick. No RNG is consumed or skipped by the deferral.

## Legs (as run)

Both legs `VETREENGAGE=1 PROFILEGATE=1`, driver
`scripts/profilegate-driver-20261117.js` verbatim, recorder ON, 150d,
competent policy, seeds 103541–103548, RUN=notickexact-a:

- **BASELINE:** PROFILEGATE bypass re-applied in-tree (the exact
  profilegate-b change in the two `findCompanion` twins), NO fix.
  Corpus `evidence/2026-11-17/perseed-notickexact-a-base/` (8 files).
  Bypass reverted after the leg; `src/` verified clean vs the prereg
  commit before the fix was applied.
- **ARMED:** bypass re-applied the same way, + the fix. Corpus
  `evidence/2026-11-17/perseed-notickexact-a-armed/` (8 files).
  The armed leg was interrupted by the run timeout after 4 seeds
  (103541–103544); the adoption finished the remaining 4 seeds
  (103545–103548) with the identical command and the same tree state
  (fix + bypass), anchor `eba0da8d6` on all 8 files. Bypass reverted
  after the leg; `src/` diff vs base `03c53bf6e` is exactly the fix
  (`src/js/villager-brain.js` +50/−1, one file).

## Results (frozen classifier + tracer, `scripts/analyze-notickexact-a.js`)

| Metric | Baseline | Armed | Bar | Result |
| --- | --- | --- | --- | --- |
| No-tick selections (primary) | 5 | **0** | armed = 0, baseline ≥ 1 | PASS |
| Launched instances | 6 | 8 | armed ≥ 90% of baseline | PASS |
| Wave-4+ launch events | 21 | 19 | armed ≥ 90% of baseline (90.5%) | PASS |
| Deferred bids (footprint) | 0 | 5 | 1 ≤ armed ≤ 20 | PASS |
| Late commits (part ≥ 2) | 12 (launched 0) | 4 (launched 0) | — | — |
| Median survival | 139.5d | 144d | armed ≥ 0.8 × baseline (ratio 1.032) | PASS |
| Starvation totals | 3 | 3 | armed ≤ baseline + 2 | PASS |
| Starvation, arm-only deaths | 0 | 0 | armed ≤ baseline + 2 | PASS |
| Trajectory control | — | PASS all 8 seeds | first divergence ≥ first deferral | PASS |

Baseline no-tick fates (5): depart-next-day 1, depart-later 1,
re-bid-next-day 1, re-bid-later 2, stall 0 — the same harmless shape the
diag measured; the fix removes the population rather than changing its
fate. Armed no-tick fates: none (0 selections).

Deferred bids on the armed leg (5, all part 3, wave-4-targeted, core
pick recovered):

| Seed | Holder | Target | Day | Core pick recovered |
| --- | --- | --- | --- | --- |
| 103543 | visjoin_133 | eulogy | 135 | WATER |
| 103544 | ingrid_vik | algorithm | 52 | WATER |
| 103544 | petra_novak | algorithm | 58 | VISIT |
| 103547 | james_okonkwo | herald | 96 | WATER |
| 103548 | visjoin_111 | herald | 119 | HAVEN_CHORE |

Trajectory control (first divergence day ≥ first deferral day, or no
divergence when no deferral), all 8 seeds PASS: 103541 def—/div—,
103542 def—/div—, 103543 def135/div137, 103544 def52/div53,
103545 def—/div—, 103546 def—/div—, 103547 def96/div97,
103548 def119/div—. No trajectory delta before the fix's first effect
on any seed.

## D-checks (instrument validity, armed tip `eba0da8d6`)

- **D1 GREEN** — repeatability: seed 103541, 60d, recorder ON,
  `PROFILEGATE=1`, run twice (`perseed-notickexact-a-d1a` /
  `-d1b`, scratch, deleted after comparison): output files identical
  except the `file` path.
- **D2 GREEN** — wrap neutrality: same seed/days, recorder ON vs
  recorder OFF (`PROFILEGATE_RECORDER=off`, `MODE=rec`) on the armed
  tip: daily fingerprints identical (days 60, gameDays 60, standing
  199, maxWave 4, deaths 69, endReason survived, pantry 38171,
  waveKillLog 68, vetsW4 0, roster 11). The recorder is pure reads.

## Balanced panel (§15)

`node scripts/balance-panel.js compare` on the built panels
(`notickexact-a-panel-before/after.json.gz`): decision
**review_required** (not `regression_signal` — bar 5 passes on its
letter). The single `regression_watch` line is "Village deaths per 100
calendar days" +0.38 (92.41 → 92.79, exploratory interval −0.57 to
+1.70, straddles 0) while absolute deaths per run FELL −2.125
(113.25 → 111.125) — the rate rose only because villages lived longer
(median 139.5d → 144d), i.e. more days at risk, not more dying. No
material signal on any other observed metric (national access 0/0,
first-bearer survival d30 1/1, d60 0.875/0.875, community loss
0.625 → 0.5). Investigated, not a regression; the corpus cost bar is
the judge and it passes.

## Proof test

`scripts/test-notickexact-a.js` — all checks green (static + 27 deferral
units + corpus legs C1–C10): fix present and confined to
`villager-brain.js` (sibling voice lines #2499/#2505 and `firstNameOf`
untouched, PROFILEGATE reverted, `src/` diff vs base exactly the fix);
units prove the exact population only (wave-3 and targetless picks still
write at part 3; hunt-stage wave-4 still held; part-2 untouched; the
deferred pick leaves the core pick, not the indoor hold; a launchable
part-0 commit still launches); corpus legs re-derive every bar above
from the corpora + analyses + panel.

## Wall numbers (this band, PROFILEGATE=1 both legs)

| | Baseline | Armed |
| --- | --- | --- |
| National standing | 2/8 | 2/8 |
| National rank | 0/8 | 0/8 |
| Table | 0 | 0 |
| Wins | 0 | 0 |
| Wave 4 unlocked | 7/8 | 7/8 |
| Wave 5 unlocked | 2/8 | 2/8 |
| Median survival | 139.5d | 144d |
| Survived | 3/8 | 4/8 |
| Deaths (total) | 906 | 889 |
| Starvation | 3 | 3 |

The wall is unchanged: national reached, rank never follows, table 0,
wins 0. The fix is a scheduling repair, not a wall lever — it was never
expected to move the wall, and it does not.

## Village assessment (plain words)

The villages on this band look like the profilegate-b ON villages that
came before: standing parks at 199 on most seeds, wave-4 fights happen
(21 launch events on the baseline leg) but rarely convert, and the
villages that survive do so by outlasting the clock rather than by
winning. The five deferred bids are the whole story of the fix: five
times a villager would have spent their last day-part of the day
standing indoors on a launch that could never happen, and instead they
went and did their real work — fetched water, visited, did a chore.
Nothing about the village changed except that small honesty. The
launches did not collapse (19 of 21 events kept; instances actually
rose 6 → 8), which is the difference between this scoping and the two
dead ones: the fix fires only where the diag measured contact, five
times in eight villages, and leaves every other late bid alone.

## Metric review

- The frozen bars held as written; no re-scoring. The wave-4 launch
  events bar passed at 90.5% (19/21) — one more lost event and this arm
  would have been NO-GO. A confirm on a second band is the honest next
  step before calling the launch-hold robust; the panel's
  `review_required` (driven by the deaths/100d watch line) is the same
  signal in miniature.
- The armed leg's interruption (4/8 seeds at timeout) is an
  infrastructure fact, not a metric fact: the remaining seeds ran with
  the identical command and tree state, and the analyzer's trajectory
  control confirms no divergence before the fix's first effect on any
  seed, so the split run did not contaminate the comparison.
- Footprint cap 20 was generous against the observed 5; the calibration
  (118 → 15) predicted ~8–15, and the fresh band staged 5. No revision
  proposed.

## Convergence state

scale-onramp: **converging** (not converged). The #2498 no-tick edge is
closed by this fix; the wall (deed gate after national, rank never
following, table 0) is untouched by it.

## Disposition

Fix + proof test: commit `eba0da8d6` (`[needs-eyes]`). Evidence +
analyses + panels + corpora: committed on this branch with the closeout.
The fix is a one-file behavior change; it needs Steve's eyes on his
phone before it ships (a villager's late-day behavior changes, though
only in the five measured cases per band).
