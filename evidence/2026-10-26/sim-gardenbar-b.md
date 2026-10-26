# sim-gardenbar-b — garden bar revision, fresh-band sweep

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261026T1630Z, axis
food-economy. Measurement only: zero src/js changes, no default flips.
This arm does NOT re-judge the gardenstate corpus — it is a FRESH-BAND
sweep on new seeds, testing the bar revision proposed in gardenstate's
metric review.

Predecessor: sim-gardenstate-b (evidence/2026-10-26/sim-gardenstate-b.md).
Gardenstate's single-mechanism >= 95% bar failed as a bar artifact: (a)
dominates early days, (b) dominates later days, so no single letter can
cover 95% even though (a) + (b) + (d) = 100% of seed-days. This arm
tests the revised bar on fresh seeds.

## Pre-registration (binding, MEASUREMENT.md §14 — written before sweeping)

- Instrument: the gardenstate instrument, reused unchanged
  (scripts/garden-capture.js + scripts/inflow-capture.js; same recorder,
  no game-code change).
- Band: competent-nofeast (COMPETENT_FEAST=0, SEATDRIVE=0,
  PLENTYDEPRI=0, DEPOSITGATE=1, FEASTSCALE_R13 off). Fresh seeds
  9760–9767, 100d death-aware horizon (matches gardenstate; ripening
  at 90d–730d outruns it by design, so the question is the (a)+(b)
  decomposition, not ripe counts).
- Primary metric: combined share (a) planted == 0 + (b) planted > 0,
  ripe == 0, as a share of seed-days, with a pre/post-first-sow phase
  split reported per seed. First-sow day = first snapshot day with
  planted > 0 in that seed; pre phase = days before it (all days if
  never sown), post phase = days from it on.
- GO threshold: combined (a)+(b) >= 95% of seed-days AND the phase split
  shows (a) concentrated pre-first-sow and (b) dominant post-first-sow.
  A miss is NO-GO vs the bar, never re-scored mid-run.
- Guardrails: seeds 8/8 valid; instrument neutrality vs the gardenstate
  code path (same recorder, no game-code change).
- Scripts: scripts/sweep-gardenbar-b.js (stdout-carrier mode added for
  the container write flap — see below; payload bytes identical to
  the normal write path), scripts/analyze-gardenbar-b.js,
  scripts/test-gardenbar-b.js (proof).
- Corpus: evidence/2026-10-26/sim-gardenbar-b-corpus/ (8 per-seed JSONs).
- Canon read: docs/CANON.md + docs/GARDENS.md. Cultivation is covered by
  a canon doc; nothing invented. Crop profiles from src/data/gardening.json
  (shoots 30d, roots 90d, berries 180d, woody 730d) as in gardenstate.

## Verdict against the pre-registered bar: GO

| measure | result | bar |
|---------|--------|-----|
| Raw (a)+(b) share of seed-days | 800/800 = 100.0% | >= 95% ✓ |
| (a) in pre-first-sow phase | 140/140 pre days = 100.0% | concentrated pre ✓ |
| (b) in post-first-sow phase | 660/660 post days = 100.0% | dominant post ✓ |
| (c) ripe > 0 at end of day | 0/800 = 0.0% | — |

The phase split is not just passing — it is exact. Every pre-first-sow
seed-day is (a) and every post-first-sow seed-day is (b), on all 8
seeds. The bar revision holds on a fresh band: the garden's 100-day
story is "nothing sown yet" followed by "sown but never ripe at end of
day," with no third state anywhere in 800 seed-days.

## Counts (primary, raw snapshot classes)

| class | seed-days | share |
|-------|-----------|-------|
| (a) planted == 0 | 140 | 17.5% |
| (b) planted > 0, ripe == 0 | 660 | 82.5% |
| (c) ripe > 0 | 0 | 0.0% |
| (a)+(b) | 800 | 100.0% |

## Phase split table (per seed)

| seed | first sown | pre days (a/b) | post days (a/b) | ripe ever | harvest (stock 'Garden harvest') |
|------|------------|----------------|-----------------|-----------|----------------------------------|
| 9760 | day 7 | 6 (6/0) | 94 (0/94) | never | never |
| 9761 | day 6 | 5 (5/0) | 95 (0/95) | never | never |
| 9762 | day 10 | 9 (9/0) | 91 (0/91) | never | never |
| 9763 | day 7 | 6 (6/0) | 94 (0/94) | never | never |
| 9764 | day 6 | 5 (5/0) | 95 (0/95) | never | never |
| 9765 | day 6 | 5 (5/0) | 95 (0/95) | never | never |
| 9766 | never | 100 (100/0) | 0 (—) | never | never |
| 9767 | day 5 | 4 (4/0) | 96 (0/96) | never | never |
| TOTAL | — | 140 (140/0) | 660 (0/660) | never | never |

Seed 9766 is the extreme case that still fits the bar: it never sowed
anything in 100 days, so all 100 of its days are pre-phase (a). Its
keeper rotated daily and garden duty was announced, but zero player
sows and zero NPC sows occurred all run (see sense notes).

## Secondary: gardenstate cascade classes (comparability, not the bar)

Applying gardenstate's cascade precedence (a deposit-door garden inflow
on a day counts that day as (d) before (a)/(b)):

| class | seed-days | share |
|-------|-----------|-------|
| (d) garden food via a non-'Garden harvest' door | 150 | 18.8% |
| H stockPantry 'Garden harvest' kcal > 0 | 0 | 0.0% |
| (e) no garden-duty signal ever in the seed | 0 | 0.0% |
| (a) planted == 0 | 140 | 17.5% |
| (b) planted > 0, ripe == 0 | 510 | 63.8% |
| (c) ripe > 0, no harvest | 0 | 0.0% |
| cascade (a)+(b) | 650 | 81.3% |

The cascade reading is NOT the bar, and it is reported here only so the
two arms stay comparable. The 150 (d) days are post-sow days whose
end-of-day snapshot is (b) but on which the player harvested a crop
that ripened intra-day and donated it (same-day ripen-and-harvest, so
no ripe crop ever stands at an end-of-day snapshot). Under cascade
precedence those days leave (a)+(b) at 81.3% — below 95% — which is
exactly why the brief judges the bar on the raw snapshot classes, not
the cascade. See "metric review."

## Non-cascade tallies

Beds made 32 (4 per seed, Haven tier capacity). Player sows 235. NPC
sows 11 (all on seed 9763; zero on the other seven seeds). KeeperSets
310 (first keeper day 2 on every seed). Keeper turns 3,167. Garden
resolutions 761, of which 750 (98.6%) entered with the production
throttle engaged (pantry holds > 4 fresh days) — higher even than
gardenstate's 89.3%. Garden inflows 276 records, all deposit-door;
inflow 'Garden harvest' records 0. Ripe-safe days 0, ripe-unsafe
days 0. Assigns of task 'garden' 0 (keeper mechanism, not task
assignment, as in gardenstate).

## Wall numbers for this band (band facts, not arm findings)

- National: 0/8. Table: 0. Wins: 0. Wave 4 reach: 0/8. Wave 5 reach: 0/8.
- Median survival: 100d (capped horizon; all 8 seeds survived to day
  100 — no village was lost on this band, unlike gardenstate's 2).
- Wave reach per seed: 9760: 3, 9761: 2, 9762: 2, 9763: 2, 9764: 2,
  9765: 3, 9766: 3, 9767: 3. All seeds ended at village rank.
- Deaths per seed: 9760: 0, 9761: 2 (ambush, arena), 9762: 2 (monster,
  arena), 9763: 3 (ambush, a wound that wouldn't close, dehydration),
  9764: 1 (dehydration), 9765: 1 (expedition), 9766: 5 (arena ×3,
  monster ×2), 9767: 4 (monster, arena, "big ugly", "extended
  warranty"). Total 18 deaths, none of them starvation.

## Sense transcripts (SENSE-TESTING LAW — meaning, not just counts)

One garden day, read in full (seed 9760, days 2–10):

- Day 2, keeper set: "A man, maybe 60s, with a wiry build will work the
  garden once each day while at Haven. Other orders take priority." —
  the game promises daily garden work by a named person, and the keeper
  does turn up daily (395 keeper turns on this seed). The promise is
  kept as attendance, not as food.
- Day 7, first sow: "You sow Burdock: 90 days to first harvest. Harvest
  removes the crop; sow new seed afterward. Tend daily; garden magic
  can accelerate growth. (2 units sown.)" — honest about the wait;
  the player is told the crop is three months away.
- Days 8–10, throttle days, rotating keepers: "🌱 Rosa waters and
  weeds the beds before taking up other work. The harvest can wait."
  then Kwame, then Aria with the same line. The rotation makes the
  village feel staffed, not robotic — different people, same honest
  maintenance line. But the line also names the mechanism: with the
  pantry full, garden duty is weeding, never sowing or harvesting.
  On seed 9760 the keeper never sowed once (0 NPC sows); all 51 sows
  were the player's.
- Seed 9766, the never-sown village: keeper names rotate daily (a man
  in his 30s, then Quinn, Roman, Giulia, Ivy, Nadia…), the garden-duty
  announcement repeats, and Green Thumb is even granted on day 8 —
  yet nothing is ever sown. The village reads like people doing their
  rounds while the garden itself stays empty: the narration never lies
  (it promises work, not crops), but a player watching this village
  would reasonably expect a garden that never gets planted to be a
  problem someone notices. That gap — duty announced, beds built, seed
  never sown — is documented here, not fixed (measurement arm).

Judgment: garden days read sensibly and coherently. The people feel
like people (named, rotating, honest lines). What reads odd is the
system behind the lines, not the lines themselves: full-pantry
throttle turns a staffed garden into a weeding rota, and on one seed
out of eight the garden never gets planted at all.

## Metric review (MEASUREMENT.md §14)

- The revised bar works as written on a fresh band: raw (a)+(b) =
  100.0% with a perfectly separated phase split. The gardenstate
  metric-review proposal is confirmed, not just plausible.
- Caveat carried forward (not a re-score): under gardenstate's cascade
  precedence, (a)+(b) = 81.3%, because 150 post-sow days carry a
  deposit-door garden inflow. Those days are still (b) at end of day;
  the inflow is same-day ripen-and-player-harvest, invisible to the
  end-of-day snapshot. Any future bar that wants to count "days with
  no garden food at all" must use the cascade, not the raw classes —
  and on this band that bar would still fail (81.3% < 95%), because
  the (d) stream is real garden food reaching the pantry through the
  player's hands. The two bars answer different questions; this arm
  was pre-registered on the raw one and passes it.
- Second caveat: "ripe == 0 at end of day" is partly an artifact of
  same-day harvest. A future instrument that wants a true ripe-day
  count needs an intra-day ripe event, as gardenstate noted. This arm
  does not re-litigate that; it reports the snapshot truth.
- No metric revision is proposed for the NEXT run beyond keeping both
  readings (raw for the bar, cascade for comparability) side by side,
  as done here.

## Blanks filled / documented

- FILLED (evidence): the gardenstate bar revision is confirmed on
  fresh seeds — (a)+(b) = 100% of seed-days with (a) entirely
  pre-first-sow and (b) entirely post-first-sow. The garden's 100-day
  story has exactly two states and no third.
- DOCUMENTED (not fixed — measurement arm, no code changes): the
  throttle now engages on 98.6% of garden resolutions (up from 89.3%
  in gardenstate); NPC sows fell to 11 across 8 seeds (from 74), all on
  one seed; one seed in eight never sowed at all despite daily keeper
  turns and a granted Green Thumb. Whether the throttle's weeding-only
  branch and the never-sown village are intended design or levers is
  Steve's call — this arm flips no defaults.

## Infrastructure note (loud, for the coordinator)

This run hit the container write flap (EPERM on node/python file
writes, intermittent, ~16:34–16:52Z) plus a self-inflicted instrument
bug found because of it: the sweep's final "wrote N files" line went
to stdout, so stdout-carrier captures were JSON + trailer = invalid
JSON. Fixed in scripts/sweep-gardenbar-b.js (diagnostics to stderr in
stdout mode; payload bytes unchanged). The proof script was changed
to match: determinism re-runs capture stdout instead of using a
scratch dir. All 8 corpus files were produced by the fixed script
and validate as pure JSON; the proof re-run of seed 9760 is
byte-identical to its corpus file. The flap itself cleared on its own;
no bypass, no manual ref edits, no --force anywhere in this run.
