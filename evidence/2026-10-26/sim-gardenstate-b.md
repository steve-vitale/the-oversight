# sim-gardenstate-b — why the garden never stocks the pantry (DIAG)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261026T1529Z, axis
food-economy. DIAG arm, measurement only, zero src/js changes, no default
flips. Pre-registration (written before sweeping):
evidence/2026-10-26/sim-gardenstate-b-PRE-REGISTRATION.md.

Parent finding (sim-inflow-b, 1345Z): zero 'Garden harvest' calls in 1,608
inflow records across 8 seeds x 100d on the competent-nofeast band. This
arm re-ran the band with a plot-state capture to name the mechanism.

## Band and instrument
- Policy competent-nofeast: COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
  DEPOSITGATE=1, FEASTSCALE_R13 off. Seeds 9750-9757, 100d, death-aware.
- Instrument (DIAG only): per-day plot-state snapshot at each policy.daily
  call (beds, planted, ripe split ripe-safe/ripe-unsafe, unplanted, dead,
  keeper identity) + event capture (assignTask('garden'), gardenKeeperTurn,
  garden resolutions with a pure-read prodThrottleEngaged() flag, makePlot,
  sowPlot, villagerSowPlot, setGardenKeeper, all three pantry doors with a
  gardenShares flag) + garden say-lines for sense transcripts.
- Corpus: evidence/2026-10-26/sim-gardenstate-b-corpus/ (8 per-seed JSONs).
- Scripts: scripts/sweep-gardenstate-b.js, scripts/garden-capture.js,
  scripts/analyze-gardenstate-b.js.
- Canon read: docs/CANON.md + docs/GARDENS.md (cultivation IS covered by
  a canon doc; nothing invented). Crop profiles from src/data/gardening.json:
  shoots 30d, roots 90d (single-harvest), berries 180d, woody 730d.

## Verdict against the pre-registered bar: NO-GO (mechanism unclear)

The bar demanded exactly ONE mechanism (a)-(e) covering >= 95% of all
745 observed seed-days. No single letter reaches it:

| class | seed-days | share |
|-------|-----------|-------|
| (d) garden food via a non-'Garden harvest' door | 42 | 5.6% |
| H stockPantry 'Garden harvest' kcal > 0 | 0 | 0.0% |
| (e) no garden-duty signal ever in the seed | 0 | 0.0% |
| (a) planted == 0 | 216 | 29.0% |
| (b) planted > 0, ripe == 0 | 487 | 65.4% |
| (c) ripe > 0, no harvest | 0 | 0.0% |

Largest single mechanism is (b) at 65.4% — short of 95%, so the verdict
is NO-GO per the bar as written, and it is NOT re-scored here. But the
bar's failure is a bar artifact, not a mystery: (a) + (b) = 94.4% of all
seed-days, and (d) = 5.6% accounts for the rest. In plain words: **on
every seed-day, either nothing was planted, nothing was ripe, or the
only garden food that reached the pantry came through the player's
hands, never through NPC garden duty.** Zero seed-days in 745 had a ripe
crop standing at end of day for NPC duty to harvest, and zero
'Garden harvest' stock calls occurred — confirming inflow-b's zero
through a second instrument (inflow 'Garden harvest' records: 0).

## The causal chain (why NPC duty never stocks)

1. **Garden duty exists — (e) is refuted.** A standing keeper is set on
   day 2 in every seed (257 keeperSets; 2,948 keeper turns; 690 garden
   resolutions). Nuance: the competent policy never calls
   assignTask('garden') (0 across all seeds) — because once a keeper is
   set, workGarden's "assign garden task if no keeper" branch never
   fires. Duty flows through the keeper mechanism, not task assignment.
   This is NOT a policy gap: the keeper works daily.
2. **The production throttle redirects 89.3% of NPC garden work.**
   616 of 690 garden resolutions entered with prodThrottleEngaged()
   true (pantry holds > 4 fresh days). The throttle branch tends the
   beds ("waters and weeds the beds before taking up other work. The
   harvest can wait.") and sends the worker to wood/water/stone — it
   never sows and never harvests.
3. **Every unthrottled resolution sows, none harvests.** Unthrottled
   resolutions == NPC sows, exactly, on every seed (9750: 3 = 3;
   9751: 21 = 21; 9754: 47 = 47; 9756: 3 = 3; all others 0 = 0).
   Unthrottled days are days the pantry is low (early days, or crisis
   — seed 9751 lost its village on day 48 with 50% unthrottled days),
   when plots are empty or unripe. By the time a crop ripens, the
   pantry is full again, so the throttle is back on. Ripeness and
   throttle-off never coincide for NPC duty.
4. **Ripening is slow without player magic.** Burdock (roots) needs
   90 days, staghorn sumac (woody) 730 days, shoots 30 days. In a 100d
   horizon with no magic, essentially nothing ripens. The only fast
   ripening observed came from the player's daily Green Thumb/Whisper
   coaxing ("You coax 4 growing beds forward by 8/12 days"), which
   brought seed 9752's burdock from growthLeft 79 to ripe in ~9 days.
5. **Whatever ripens is player-harvested first.** All 73 garden-origin
   pantry records arrived through the deposit door (player harvest to
   pack, then policy donation), never through NPC stock: seed 9752
   Burdock (47 records), seed 9757 Muscadine Grapes (24), seed 9756
   Hawthorn (2). This is mechanism (d): garden food DOES reach the
   pantry, but only via the player's harvest-and-donate route. The
   inflow instrument never saw it as 'Garden harvest' because it isn't.
6. **Side hazards observed, not chased:** a night raid on seed 9752
   day 14 "trampled 2 garden plots into mud" (one burdock destroyed
   outright); seed 9753's first player sow did not happen until day 89
   (88 unplanted days — seed/knowledge gating on the player side).

## Per-seed cascade (d / H / e / a / b / c, days, first planted)

| seed | cascade | days | first planted | first ripe | first harvest |
|------|---------|------|---------------|------------|---------------|
| 9750 | 0/0/0/54/46/0 | 100 | 24 | — | — |
| 9751 | 0/0/0/8/40/0 | 48 (village lost) | 9 | — | — |
| 9752 | 33/0/0/2/65/0 | 100 | 4 | — | — |
| 9753 | 0/0/0/88/12/0 | 100 | 89 | — | — |
| 9754 | 0/0/0/48/49/0 | 97 (village lost) | 14 | — | — |
| 9755 | 0/0/0/5/95/0 | 100 | 6 | — | — |
| 9756 | 1/0/0/5/94/0 | 100 | 6 | — | — |
| 9757 | 8/0/0/6/86/0 | 100 | 7 | — | — |

Non-cascade tallies: beds made 32 (4 per seed, Haven tier capacity);
player sows 155; NPC sows 74; keeperSets 257; garden resolutions 690
(616 throttle-engaged); garden inflows 73 (all deposit-door);
inflow 'Garden harvest' records 0; ripe-safe days 0; ripe-unsafe days 0
(no ripe crop ever stood at an end-of-day snapshot).

## Sense transcripts (SENSE-TESTING LAW — meaning, not just counts)

- A planted day (seed 9750, day 24): "You sow Common Plantain: 30 days
  to first harvest. Later harvests need 28 days of regrowth. Tend daily;
  garden magic can accelerate growth. (2 units sown.)" — honest about
  the wait; the game tells the player the crop is a month away.
- The throttle day, repeated daily (seed 9752, days 11-20): "Mason waters
  and weeds the beds before taking up other work. The harvest can wait."
  — the keeper IS working, but the work is maintenance, not food. The
  narration is honest; the system behind it is what starves the pantry.
- The magic that actually ripens crops (seed 9752, day 17): "You coax 4
  growing beds forward by 12 days. The next harvest carries the growth
  magic." — without this daily player magic, the 90-day burdock would
  not have ripened inside the 100d horizon at all.
- The raid (seed 9752, day 14): "Raid — Ashford came in the night from
  the southwest. They trampled 2 garden plots into mud." — garden loss
  is a real, narrated hazard, not a silent number.
- No ripe-day or NPC-harvest transcript exists in the corpus, because
  no such day exists: that absence IS the finding. The only harvest
  evidence is the deposit stream (Burdock, day 20+, seed 9752).

## Wall numbers for this band (band facts, not arm findings)
- National: 0/8. Table: 0. Wins: 0. Wave 4 reach: 0/8. Wave 5 reach: 0/8.
- Median survival: 100d (capped horizon; 6/8 survived to day 100,
  village-lost on days 48 and 97). Deaths per seed: 5, 12, 2, 4, 14, 2, 2, 2.
- Wave reach per seed: 3, 2, 2, 3, 3, 3, 2, 2. All seeds ended at village rank.

## Metric review (MEASUREMENT.md section 14)
The pre-registered >= 95% single-mechanism bar proved too strict for a
phased mechanism: (a) dominates early days (nothing sown yet) and (b)
dominates later days (sown but unripe), so no single letter can cover
95% even though (a) + (b) + (d) = 100% of seed-days. Proposed revision
for the NEXT run (not applied here): judge the bar on "no ripe crop
available to NPC duty" ((a) + (b)) with a >= 95% threshold, and report
the phase split (pre-first-sow vs post-sow) alongside it. Also: the
end-of-day snapshot can never see a crop that ripens and is
player-harvested the same day — the (d) deposit stream is the
compensating instrument, and it worked (42 days caught). A future run
that wants a true ripe-day count needs an intra-day ripe event, not a
daily snapshot.

## Blanks filled / documented
- FILLED (evidence): the garden never stocks via NPC duty because the
  throttle redirects that duty, unthrottled duty always sows, ripening
  outruns the horizon without player magic, and ripe crops are
  player-harvested first. (e) refuted as "no duty"; (d) confirmed as the
  only pantry route for garden food.
- DOCUMENTED (not fixed — DIAG arm, no code changes): the throttle's
  garden branch tends but never sows/harvests, so a full pantry
  paradoxically prevents the garden from ever contributing; and the
  NPC duty has no window in which ripeness and throttle-off coincide.
  Whether that is intended design or a lever is Steve's call — this arm
  flips no defaults.
