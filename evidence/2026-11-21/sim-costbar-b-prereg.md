# sim-costbar-b — prereg (FROZEN 2026-11-21)

Loop B run fleshout-loop-b-20261121T1630Z, arm 3 of 3: sim-costbar-b.
Instrument only — NO game change, NO src/ change. Finding #2641.

## 0. What this arm does

Build the v2 scalemetric cost bar: the bar that prices expedition deaths +
early loss alongside the frozen starvation/median terms. It EXTENDS the
frozen B1–B5 bar; it does not replace any term.

## 1. The taxonomy correction (why the bar is built this way)

Finding #2641 as filed reads "expedition deaths 285 → 349 (+64)" as parties
walking out and dying on the road. That reading is WRONG in the recorder's
taxonomy, and the bar is built on the corrected reading. Evidence, all
checked before this freeze:

- Every one of the 285 OFF / 349 ON `cause: 'expedition'` rows in the
  confirm corpora has `kind: 'monster'` and `who` = a monster id. ZERO
  have `kind: 'villager'`.
- Code: `src/js/villager-mapmem.js` `mapmemNoteKill` — "the expedition kill
  hook" — registers `kind: 'monster', cause: 'expedition', killerId: vid`
  when a villager KILLS a monster on expedition. The `+64` is 64 more
  monsters killed on expedition, i.e. the lever working (more launches →
  more expedition kills), NOT 64 more villagers dead on the road.
- The harness (`scripts/sim-harness.js`, live death capture) pushes EVERY
  `tele('death')` event — monster kills AND villager deaths — into one
  `samples.deaths` array. The §15 panel's "village deaths" is that same
  mixed stream: village deaths/run 78.375 = 1254/16 exactly, and the
  deaths/100d 56.1949 → 64.5186 is the mean of per-seed rates over the
  mixed stream (recomputed exactly from the corpora). The panel's +8.32
  regression signal is ~92% monster kills: the villager-only rate moves
  9.03 → 9.68 (+0.65).
- Villager-side deaths in the confirm band: OFF 200 (`kind: 'villager'`)
  + 5 (`kind: 'person'`) → ON 196 + 5. DOWN, not up. By cause:
  'the wild' 79 → 69, 'monster' 48 → 44, starvation 10 → 11.
- Therefore the v2 bar MUST split the death stream before pricing it.
  Counting `cause: 'expedition'` rows as a cost would penalise a benefit
  (more expedition kills) and kill good launch levers. The bar prices
  PEOPLE deaths (kind `villager`/`person`), never monster kills, and
  reports expedition monster kills as a separate benefit channel (C4,
  diagnostic only).

## 2. Bar definition (v2 — frozen)

Corpus: two legs of per-seed files, identical seeds, same policy/horizon.
All quantities are computed by `scripts/scalemetric-costbar-v2.js`
(frozen with this prereg; proof `scripts/test-costbar-b.js`).

Inherited terms (frozen, unchanged from the scalemetric bar as applied in
the profilegate confirm — starvation bar 12, arm-only bar 4, median bar
120.4d on that band):

- **B1 median**: `medianDays(ON) / medianDays(OFF) >= 0.8`. FAIL otherwise.
- **B3 starvation**: `starvTotals(ON) <= starvTotals(OFF) + 2` AND
  `starvArmOnly(ON) <= starvArmOnly(OFF) + 2`, where arm-only counts
  same-seed same-day matched starvation deaths (a starvation death on the
  ON leg whose (seed, day) has no starvation death on the OFF leg).
  FAIL otherwise. Starvation counts PEOPLE deaths (`kind` villager/person)
  with `cause: 'starvation'` only.

New terms (the v2 extension):

- **C1 people-death rate**: per-seed rate = people deaths (`kind` in
  {villager, person}) / gameDays × 100; take the MEAN over seeds (same
  construction as the §15 panel's deaths/100d, so C1 is directly
  comparable to the panel signal it corrects).
  FAIL iff `rate(ON) > rate(OFF) × 1.10` OR `rate(ON) − rate(OFF) > +1.0`.
  The 1.10 mirrors the frozen B5 death-rate strictness on the corrected
  channel; the +1.0 absolute guard is a priori (≈ one extra person death
  per village per 100 days).
- **C2 early loss**: `flips` = seeds surviving OFF (`endReason !=
  'village-lost'`) but lost ON; `earlierDays` = Σ over seeds lost on BOTH
  legs of max(0, days(OFF) − days(ON)).
  FAIL iff `flips >= 4` OR `earlierDays >= 100`. Both thresholds sit ABOVE
  every calibration-band observation (flips ≤ 3, earlierDays ≤ 34 — §3),
  so they are set from the calibration ceiling + margin, not from the
  judged band. C2 is deliberately loose: calibration shows flips are
  noise-dominated at n = 8–16 (known-good bands flip 2–3 villages), so
  C2 catches gross loss only; 3 flips with 2 reverse flips is reported
  as a WATCH, not a FAIL. The bar does NOT claim the collapse mechanism.
- **C3 launch-attributed road deaths** (the #2634 separation term):
  a people death is attributed iff its victim (`who`) was a holder or
  party member of a wave-4 launch (`v4departs`, `result: 'launch'`) with
  `launchDay <= deathDay <= launchDay + 7`, AND its cause is NOT a home
  cause (`starvation, thirst, dehydration, disease, sickness,
  wound_fever, "a wound that wouldn't close", contest, the arena`).
  This separates the launched fight's own outcome (a party member dying
  within a week of walking out) from downstream cascade (deaths weeks
  later, or of villagers who never launched). Two sub-quantities:
  `attrRoad` (count) and `attrRoadPerLaunch` = attrRoad / v4 launches.
  FAIL iff `attrRoad(ON) − attrRoad(OFF) >= 1.0 × nSeeds` OR
  `attrRoadPerLaunch(ON) / attrRoadPerLaunch(OFF) >= 1.50`.
  No calibration corpus carries launch records, so both C3 thresholds
  are a priori round numbers, set loose to catch gross road lethality
  (a doubling of per-launch lethality, or ≥ 1 extra road death per seed
  in the band); small-n attribution noise (Poisson σ ≈ 5–6 on ~30 events)
  must not trip the bar. If a corpus carries no launch records, C3 is
  `not_observed` — reported, never FAIL.
- **C4 expedition monster kills** (diagnostic, NEVER a cost term):
  `expKills` = deaths with `cause: 'expedition'` (all `kind: 'monster'`).
  Reported alongside C1–C3 to prove the separation: a rise in expKills
  must not move any cost term.

**Overall v2 verdict: COST PASS iff B1 + B3 + C1 + C2 + C3 all pass.**
A FAIL on any term is a cost FAIL for the judged arm (the arm's own
GO/NO-GO still follows that arm's prereg; the v2 bar is the cost side).

## 3. Calibration (frozen with this prereg)

Calibration corpora (committed, read-only): the four scalemetric bands
under `evidence/2026-10-24/` (8 seeds each) — leanlink-pilot (known BAD:
failed B1, median ratio 0.77), leanlinkrescue-pilot (known GOOD: passed),
leanlinkcap5-pilot (known GOOD: passed), leanlinkcap5-confirm (mixed:
passed B1, FAILED old B2 lost-excess). C3 is not calibratable there (no
launch records — those corpora predate the launch recorder).

| band | C1 rate OFF → ON | C1 ratio | C1 delta | C1 verdict | flips | earlierDays | C2 verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| leanlink-pilot (BAD) | 7.47 → 8.53 | 1.142 | +1.06 | FAIL | 3 | 27 | pass |
| leanlinkrescue-pilot (GOOD) | 7.47 → 8.17 | 1.093 | +0.69 | pass | 2 | 34 | pass |
| leanlinkcap5-pilot (GOOD) | 7.47 → 7.67 | 1.027 | +0.20 | pass | 3 | 0 | pass |
| leanlinkcap5-confirm (mixed) | 5.93 → 8.34 | 1.407 | +2.41 | FAIL | 3 | 0 | pass |

Separation check: C1 as frozen FAILS exactly the two bands with a known
cost signal (leanlink-pilot, cap5-confirm) and PASSES exactly the two
known-good bands (rescue, cap5-pilot). C2 as frozen passes all four —
flips 2–3 and earlierDays ≤ 34 are the noise floor, which is why the C2
thresholds sit above them. Rates above are mean per-seed people-death
rates per 100 game-days, recomputed from the committed corpora (kind in
{villager, person}); the analyzer + proof test re-derive them.

## 4. Judgment plan (frozen)

Judge the committed confirm corpora
`evidence/2026-11-21/perseed-profilegate4-confirm-b-off/` and
`...-on/` (16 seeds, 106751–106766, competent policy, 150d horizon,
anchor df4867134afaf556232c4a7c377a4595b644a55c). Those per-seed files
are READ-ONLY — analyzer outputs go to new files only.

Judgment rule: run the analyzer on the confirm corpora, report B1/B3/C1/
C2/C3/C4 with the frozen thresholds, and state the v2 cost verdict.
Detection vs verdict: the analyzer must DETECT the confirm band's real
road-death cost (launch-attributed road deaths, collapse flips, earlier
collapse) and report its magnitude — that detection is asserted in the
proof test. Whether that detected cost FAILS the bar follows the frozen
thresholds only.

No new sims. No fresh calibration band is needed: the four scalemetric
bands calibrate C1/C2, and C3's thresholds are a priori (no corpus with
launch records exists outside the judged band itself, so calibrating C3
on the judged band would be tuning to the verdict). Seed-band freshness
check: NOT APPLICABLE — no new seeds are spent. (Had a fresh band been
needed it would have been capped at an 8-seed pilot with a full freshness
grep; it is not needed.)

## 5. Pre-freeze exposure (honesty note)

The confirm band's aggregates were already published in
`evidence/2026-11-21/sim-profilegate-confirm-b.md` §3.5/§10 (starvation
11 vs 10, median 151 vs 150.5d, expedition +64, 3 extra collapses, panel
56.2 → 64.5) and the task brief quoted them, so they were seen before
this freeze. The thresholds above do NOT depend on them: C1's 1.10
mirrors frozen B5 and its separation is verified on the four
calibration bands (§3); C2's thresholds sit above all calibration
observations; C3's are a priori. The judgment in §4 is therefore
mechanical once the analyzer runs. If the analyzer's recomputation
disagrees with any number in §3 or in the confirm evidence, the
analyzer's recomputation governs and the discrepancy is reported.

## 6. Proof test (frozen — must be green BEFORE judging any band)

`scripts/test-costbar-b.js` asserts, with an independent recount code
path (separate from the analyzer, same pattern as test-sim-scalemetric):

- T1 taxonomy: the analyzer splits monster kills from people deaths;
  a synthetic corpus with +64 expedition kills and zero people-death
  change passes C1/C2/C3 (expKills cannot move any cost term).
- T2 confirm quantities match the independent recount (people-death
  rates, flips, earlierDays, attrRoad, attrRoadPerLaunch, expKills,
  starvation totals + arm-only, median days).
- T3 detection: on the confirm corpora the analyzer DETECTS the real
  road-death cost — attrRoad delta ≥ +5, flips = 3, earlierDays = 73 —
  and reports them (detection, not verdict).
- T4 neutral bands PASS: A/A self-comparison (confirm OFF vs OFF, all
  deltas zero) passes every term; leanlinkcap5-pilot passes C1/C2.
- T5 known-costly bands FAIL: leanlink-pilot FAILs C1; cap5-confirm
  FAILs C1; leanlinkrescue-pilot passes C1.
- T6 analyzer agrees with the independent recount on all four
  calibration bands (C1 rates, flips, earlierDays).

## 7. Wall numbers (to be reported for the judged corpus)

National / table / wins, wave 4–5 unlocks, median survival — recomputed
from the confirm corpora by the analyzer (expected from the confirm
evidence: national 0/16, table 0, wins 0, wave 4 16/16, wave 5 5–6/16,
median 151d).

## 8. Metric review (placeholder — filled in the evidence file)

Per §14, the evidence file carries a metric-review section. Pre-noted
candidate: C2's loose thresholds mean a 3-flip / 73-day-early loss does
not fail the bar — if Steve wants early loss to bite harder, that is a
threshold decision for the next run, not a re-score of this one.

---
*Frozen 2026-11-21 by Loop B arm sim-costbar-b. Any threshold move after
this freeze is a dated amendment below, with its reason — and a moved bar
never changes a verdict already rendered under the frozen bar.*

## Amendment A1 — 2026-11-21 (pre-judgment calibration correction)

Found while building the analyzer, BEFORE any verdict was rendered (the
proof test is not yet green, the confirm judgment has not run):

1. **§3 table correction — `kind: 'person'` counts.** The §3 table was
   computed on `kind: 'villager'` rows only, but the frozen C1 definition
   (§2) counts people deaths as `kind` in {villager, person}. The `person`
   rows ARE villager deaths: code-verified, `src/js/alienPlayers.js`
   registers `kind: 'person'` when an alien player kills a villager, and
   the confirm corpora carry `kind: 'person'` ambush deaths of generated
   villagers. Corrected §3 table (mean per-seed people-death rate /100d,
   recomputed by the analyzer):
   - leanlink-pilot (BAD): 7.68 → 9.12, ratio 1.187, delta +1.44
   - leanlinkrescue-pilot (GOOD): 7.68 → 8.68, ratio 1.130, delta +1.00
     (exact delta +0.996)
   - leanlinkcap5-pilot (GOOD): 7.68 → 8.28, ratio 1.077, delta +0.59
   - leanlinkcap5-confirm (mixed): 6.20 → 8.48, ratio 1.367, delta +2.28
   (The old `deathTotals.villager` is NOT this quantity — it equals total
   minus scholar deaths, i.e. it counts monster kills too. Do not use it.)
2. **C1 connective OR → AND.** Under the frozen OR form, the known-good
   rescue band FAILS C1 on the ratio clause alone (1.130 > 1.10) while its
   absolute delta (+0.996) sits inside the bar. At n = 8 with ~100 people
   deaths, the ratio's Poisson σ is ~15% — a 1.10 bar is inside 1σ, so the
   OR form trips on noise: METRIC-BROKEN as frozen. Corrected C1: FAIL
   iff ratio > 1.10 AND delta > +1.0 — a cost must be BOTH relatively and
   absolutely large, mirroring B3's two-clause form. The numbers (1.10,
   +1.0) do not move. Separation under AND: FAIL leanlink-pilot
   (1.187, +1.44) and cap5-confirm (1.367, +2.28); PASS rescue
   (1.130, +0.996) and cap5-pilot (1.077, +0.59). The confirm band
   (1.077, +0.71) PASSES C1 under either connective, so this correction
   does not touch the judged band's C1 outcome.
3. **C3 `not_observed` fix.** The frozen §2 says C3 is `not_observed`
   when a corpus carries no launch records; the analyzer as first written
   returned PASS (attrRoad 0) for the scalemetric bands instead. Fixed:
   C3 is null unless BOTH legs carry launch records. This changes no
   verdict (a null C3 never fails), only the reporting.

