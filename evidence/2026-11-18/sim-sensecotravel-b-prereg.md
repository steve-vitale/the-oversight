# sim-sensecotravel-b — FROZEN prereg (Loop B 0130Z run, DIAG arm sim-sensecotravel-b)

**Frozen:** 2026-11-19 ~01:50 UTC, BEFORE any analyzer change and before any
new sim. Base master `48c81dac6` (Loop B 2330Z adoption closeout). Branch
`sim-sensecotravel-b`.
**Arm:** DIAG, findings #2570 (join) + #2571 (sense) from the Loop B 2330Z
allyslot3-rerun-b pilot (evidence/2026-11-18/sim-allyslot3-rerun-b.md,
verdict NO-GO, field-4 3/7 = 0.43 < 0.80; sense 5/10). The task brief
numbers these #2577 + #2578; the filed numbers in
`hidden_files/sim-findings.md` are #2570 (first-match join) and #2571
(launch-party sense coverage) — same items, filed numbers used here.
**No game code changes in this arm.** The work is: (a) a corrected join in
the analyzer, (b) a co-location decomposition of every sense miss on the
already-recorded corpora. The pilot's NO-GO verdict is NOT re-scored and
stands under its frozen prereg.

## Corpora (already landed, no new sims)

The 2330Z pilot corpora, on master at `48c81dac6`:
`evidence/2026-11-18/perseed-allyslot3-rerun-b-ctl/` +
`evidence/2026-11-18/perseed-allyslot3-rerun-b-arm/` — band 104720–104727,
8 seeds/leg, 150d, competent policy, 0 instrument errors. This arm
re-judges those files under the corrected instrument; it runs no new
sweeps. **Fresh-band rule:** a fresh 8-seed pilot band is run ONLY if
the corpora cannot answer the co-location question (#2571). They can:
every judged meeting carries a `v4gates` row (the fighter's
`planParty` at the meeting instant), the `dawnbidCensus` records every
wave-4 holder's plan party + node + on-expedition flag per day, the
`v4departs`/`dawnbidDeparts` record every launch, `deaths` records
every villager death, and `companionPool` records dawn nodes +
on-expedition flags per roster member. No fresh band is run, so no
seed-band freshness search is needed for this arm; that decision is
recorded here, not assumed.

## Corrected join — finding #2570 (frozen definition)

The analyzer's first-match join (first quad launch in file order
within the 21-day window, joined via the fighter OR any ally) is
replaced by the fighter-anchored best-match join:

- Candidates: quad launches (`result: 'launch'`, `targetWave >= 4`,
  size >= 4) with the meeting day inside `[launch day, launch day + 21]`.
- The fighter MUST belong to the joined launch: `e.vid` is in the
  launch party (holder + members). A trio-expedition fight joined only
  via a shared ally never enters the denominator.
- Score each candidate by the number of sensed allies (`e.allyVids`)
  in its party. Best score wins; ties go to the MOST RECENT launch
  day; a same-day tie falls back to file order (deterministic).
- No meeting joins when no candidate contains the fighter.
- Sense (reported): the sensed set equals the fighter's launch
  companions (launch party minus the fighter — all 3).
- Denominator (unchanged): joined quad meetings where the second ally
  joined (`ally2Vid` present). Numerator (unchanged): those where the
  third ally also joined (`ally3Vid` present) AND is a member of the
  joined launch party.
- The shared `size4Shares` damage-share join moves to the same
  corrected join, so the instrument stays one join (it is REPORTED,
  not binding; its numbers may shift and are reported old-vs-new).

**Test case (frozen):** seed 104722 day 117, the editor — fighter
miguel_santos, ally3 nikos_papadopoulos joined and dealt 17. Under
the corrected join it MUST count as fielded (joined to the day-111/
115 launch whose party is petra + hannah + miguel + nikos — the
sensed trio exactly — not the day-102 launch).

## Co-location decomposition — finding #2571 (frozen classes)

For EVERY sense miss on the arm leg (joined quad meeting where the
sensed set is not the full trio of launch companions), each missing
companion is classified by cause, in this order, from the corpus:

1. `dead` — a villager death row for the companion with day <= the
   meeting day (the death cleanup purges them from the plan party by
   design).
2. `not-in-plan-party` — the companion is NOT in the fighter's gate
   `planParty` at the meeting instant (the sense's launch branch never
   considered them; the same-target guard was never reached). Sub-class
   from the census / departs / dawn rows:
   - `different-expedition` — the companion is a member of a different
     in-window quad launch than the joined one (e.g. the fighter
     re-launched after the quad).
   - `expedition-ended` — the companion's only in-window launch
     membership is the joined launch, and their expedition had ended
     before the meeting (census `holderExped: false` on/before the
     meeting day, or dawn `onExped: false`).
   - `trim-unproven` — the plan party shrank with no recorded launch,
     death, or leave to explain the trim (recorded as unproven, not
     guessed).
3. `in-plan-party-but-unsensed` — the companion IS in the fighter's
   gate `planParty` but NOT in the sensed list (the only class where
   the sense's same-target guard — NOTE: the code guards on expedition
   TARGET `(tx, ty)`, there is NO tile-equality check in
   `party-wiring.js` — could have bitten). Sub-class by the dawn nodes
   (fighter vs companion, preferring non-bidder rows, which carry the
   real node): `same-tile` vs `different-tile`. If this class is empty,
   the tile question is answered as moot, not assumed.

The control leg is the cap-control: its sense is capped at 2 by
construction, so a third companion in `planParty` but unsensed there
is a cap artifact, not a guard failure; ctl misses are reported for
comparison, not classified as sense failures.

## Primary metric (BINDING for THIS DIAG, §14)

1. **Corrected field-4 rate on re-judgment** (arm leg, frozen corpora).
   Pre-registered expectation from the pilot evidence's own
   sensitivity note (NOT a re-score of the pilot verdict): **4/6 =
   0.67**, still below the pilot's 0.80 bar. The pilot's NO-GO stands;
   this arm formalizes the 0.67 with the corrected analyzer.
2. **Co-location classification completeness:** every arm-leg sense
   miss classified by cause (classes above), with the per-meeting
   evidence cited (gate planParty, census trail, departs, deaths,
   dawn rows).

## GO threshold (DIAG-GO, this arm only)

DIAG-GO iff ALL of: (a) the analyzer reproduces the d117 test case
as fielded; (b) `scripts/analyze-allyslot3-b.js --selftest` green;
(c) every arm-leg sense miss classified by cause, none left
`unclassified`; (d) a named next lever follows from the
classification. The pilot's 0.80 field-4 bar is NOT this arm's bar:
a corrected rate below 0.80 is the expected outcome and does not fail
the DIAG. A corrected rate that does NOT match the pre-registered
4/6 = 0.67 expectation fails the instrument (the join is wrong),
not the lever.

## Design

- Horizon: none — re-judgment of the frozen 150d corpora. No new
  sims, no new seeds, no policies.
- Proof: `scripts/test-sensecotravel-b.js` — corrected-join unit
  cases (d117 test case, trio-exclusion case, best-match + most-recent
  tie-break, fighter-must-belong) + classification unit cases
  (dead / different-expedition / expedition-ended /
  in-plan-party-but-unsensed) on synthetic corpus rows; the analyzer
  selftest extended with the d117 regression (synthetic + the real
  corpus row asserted fielded).
- Evidence: `evidence/2026-11-18/sim-sensecotravel-b.md` with the
  re-judgment table (old join vs corrected join, both legs), the
  per-miss classification table, wall numbers from the existing
  analysis (no new wall measurement — the corpora are unchanged),
  and a "metric review" section.

## Fixture (encounter-gear rule, Steve 2026-11-13)

No staged fixtures in this arm: the judged population is the
recorded corpora, staged by the pilot's competent policy with its
encounter-gear driver. The proof test's synthetic rows mirror the
real d117 / d112 / d69 rows (geared wave-4/5 quad parties), never a
fresh un-geared solo scholar.

## Metric review (pre-registered)

- The corrected join is a BETWEEN-run instrument revision, frozen
  here before the analyzer change — it is not a re-score of the
  2330Z pilot (which keeps its NO-GO verdict under its frozen
  first-match join) and not a mid-run change. The next run inherits
  the fighter-anchored best-match join as the definition.
- The 4/6 = 0.67 expectation is the pilot evidence's own sensitivity
  note, quoted here before the re-judgment runs. If the corrected
  analyzer returns anything else, the instrument is wrong — the
  expectation is not adjusted to fit the output.
- The sense "tile-equality guard" wording in the pilot evidence and
  the task brief is imprecise: the code (`party-wiring.js`,
  LAUNCHPARTY substrate) guards on expedition TARGET `(tx, ty)`,
  with an explicit "no node check" comment. The classification
  classes above are written to test the guard as it actually is:
  only the `in-plan-party-but-unsensed` class can implicate it.
- Dawn `companionPool` rows carry a known artifact: a bidder's OWN
  member entry reads `node: null` / `firstFail: selfOrScholar`; the
  real node comes from rows where the member is not the bidder.
  The classification prefers non-bidder rows and says so where a
  meeting day has no usable dawn rows (d82, d112: 0 rows — those
  classifications rest on census + departs + deaths).
