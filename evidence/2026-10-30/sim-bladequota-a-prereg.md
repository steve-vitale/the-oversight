# sim-bladequota-a — PRE-REGISTRATION (frozen before any judged sim)

Run: fleshout-20261030T1924Z, Loop A, axis scale-onramp. MEASUREMENT ONLY —
no game-code change; the gating freeze (Steve 2026-10-27/28) stands.
Base: worktree ~/workspace/worktrees/sim-bladequota-a, branch sim-bladequota-a,
HEAD c1b310c96 at prereg time (recorded in the corpus manifest at sweep time;
any base movement after this file is written invalidates the band and forces
a fresh band — never quote an old bank's numbers as current).

## Canon read first
- docs/CANON.md (manifest), docs/CONTESTS.md (contests are played, not RNG;
  the show's interruption logic — background only; the muster is a titan
  system, not a contest).
- No canon doc covers titan musters specifically (titans.json + titans.js
  are the source of truth, verified against code below, not invented).
- docs/MEASUREMENT.md §§9–12, 14–15: staged, death-aware, pre-registered,
  metric-binding, balanced panel only where a before/after comparison
  exists. This arm is a SINGLE-BASE measurement: there is NO comparison
  leg, so no panel file is fabricated for it (stated plainly in evidence).

## Formula verified against code on this base (not quoted from old banks)
- Herald gate: minAllies 10 (src/data/titans.json, herald entry).
- Per-link quota in soundTitanCall (src/js/titans.js): quota = 6 if
  trust >= 70 AND opinion >= 10, else 2 (cfg trustedAt 70, trustedOpinion
  10, trustedBlades 6, baseBlades 2).
- Refusal in the same function: a link refuses (and loses 8 trust) if
  trust < 25 OR opinion < -10 OR arrears > 0. Refused links yield 0.
- Free faces (titanAlliedFaces): living adults (age null or >= 18,
  health undefined or > 0) on the allied roster, excluding people already
  committed to a live muster. Yield per link = min(quota, free faces).
- Haven's own (titanCommitOwn, separate button, never auto-committed by
  the call): up to 3 named Haven villagers, counted toward the hard gate
  (titanMusterReady: unique allies + haven blades >= minAllies).
- Button gating (titanSelfActions): "Sound the call" and "Commit Haven's
  blades" are offered ONLY for a titan whose omen stage >= 2 (located).
  soundTitanCall itself does not check omen stage — so a hypothetical
  yield ("if the Herald were located, what would the call yield?") is
  computable on any state, and is reported SEPARATELY from offerability.
- In the wild no policy or game system ever presses either button, so
  every wild run has zero real musters; all yields below are hypothetical
  sounded-call yields computed by a pure-read replica of the formula.
  The replica is proven against the real soundTitanCall in
  scripts/test-bladequota-formula.js (analytic vs real call on a live
  linked state; snapshot purity asserted: trust map unchanged by reading).

## Primary metric
Sounded-call blade yield >= 10 rate, at each seed's PEAK-yield day
(max allied yield over the run; ties broken to the earliest day):
- allied-only rate: seeds with peak allied yield >= 10, / seeds run.
- allied+Haven rate: seeds with peak allied yield + min(3, haven pool) >= 10.
Headline = the 16-seed rate. Also reported at final day (yield decay).

## DIAG thresholds (judge the arm against this header; a miss is NO-GO,
## never re-scored mid-run)
- DIAG-GO: >= 12/16 seeds classifiable (a peak snapshot with >= 1 active
  link recorded, or a Herald omen recorded at any stage), AND one binding
  constraint (decision tree below) accounts for > 50% of shortfall seeds.
- DIAG-NO-GO: < 12/16 classifiable, or no constraint holds a strict
  majority of shortfall seeds (measurement inconclusive).
- INSUFFICIENT-DATA: sweep aborted, or instrument errors on > 0 seeds
  (an instrument error voids that seed; >= 4 voided seeds voids the band).

## Horizon + why (death-aware, never a fixed 200d)
Cap 200 game-days; a run stops early on Game.over (village-lost /
over-other) and dead villages simulate no further. The cap is an
observation ceiling, not a fixed horizon: Herald omens need wave 4 +
regional, which is late-game, so the ceiling must reach past day 150;
actual days simulated and endReason are reported per seed, and median
survival is computed on actual days, not the cap.

## Seeds (fresh band, registered on THIS base)
- Pilot: 76101–76108 (8 seeds), policy competent.
- Confirm: +76109–76116 (8 more) if the pilot completes without an
  instrument failure; the headline rate uses all 16. If the pilot shows
  an instrument failure, stop and fix the instrument — do not extend.
- Policy: competent only. Rationale recorded honestly: competent is the
  skill-ceiling, link-forming policy, so its yield is an UPPER-ish bound
  for wild play; weaker policies are expected to do no better on links
  and trust, and are a follow-up, not a silent assumption. Variant
  omission is a stated limitation, not a hidden one.

## Per-seed measurement (daily pure-read snapshot; no state writes, no RNG)
At every simulated day, and in full per-link detail at first-link day,
peak-yield day, and final day:
- active link count; per link: village, trust, opinion, arrears, refused?,
  quota (2/6), free faces, yielded blades, free-face-capped loss.
- allied yield, haven pool, total yield (allied + min(3, haven pool)).
- Herald omen: null / stage 0/1/2, day first seen at each stage.
- scale rank (final + max), national-ever, table waiting/entered, won,
  wave unlocked, game days, endReason, death count + causes.
- Counterfactual yields at peak day: (a) all non-refusing links trusted
  (quota 6), (b) no refusals, (c) no free-face cap, (d) trusted + no
  refusals + no cap. These are reported alongside the tree so the
  decomposition does not hinge on tree order alone.

## Binding-constraint decision tree (applied at peak day, allied-only)
1. yield >= 10 → REACHED (not a shortfall).
2. omen never reached stage 2 → recorded as NOT-OFFERABLE (separate
   layer: the call could not even be pressed); the tree below still
   classifies the hypothetical shortfall.
3. links == 0 → LINK-COUNT.
4. counterfactual (c) no-free-face-cap alone reaches 10 → FREE-FACES.
5. counterfactual (a) all-trusted alone reaches 10 → TRUST-BELOW-70.
6. counterfactual (b) no-refusals alone reaches 10 → REFUSALS.
7. otherwise → LINK-COUNT (even at trusted quota the fires are too few).
"What it would take" per seed: links needed at base quota (ceil((10 -
haven3)/2) with full Haven commit, ceil(10/2) allied-only), and the
trust gap (70 - trust) and opinion gap (10 - opinion) per sub-70 link.

## Wall numbers (reported for the band)
national-ever / national-final / table-reached / table-entered / wins,
wave 4 and wave 5 unlocks, median + max survival (actual days).

## Sense-testing
One seed (76101) re-run with Game.say/sysSay captured (external array,
no game-state writes); transcript lines about titans, musters, calls,
councils, links and trust are read for sense: does a village with few
links being asked for 10 blades read sensibly in fiction, and does any
transcript show the village reasoning about the call? The captured run's
peak/final yields must match the silent sweep's seed 76101, or the
transcript is reported as off-trajectory and not quoted.

## Metric review (filled at evidence time, not mid-run)
Doubts about the metric, the peak-day choice, or the competent-only
policy go here and apply to the NEXT run, never to re-score this one.

## No-comparison statement (§15)
The balanced panel (scripts/balance-panel.js) applies to before/after
comparisons. This arm has one base and no lever, so no panel compare
file exists or is claimed. The corpus JSONs are the evidence.
