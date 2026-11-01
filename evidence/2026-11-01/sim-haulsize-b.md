# sim-haulsize-b — DIAG: WHY does the haul-size ceiling exist?

Run: oversight-flesh-out-loop-b, axis food-economy, arm sim-haulsize-b.
Worktree sim-haulsize-b, branch sim-haulsize-b. Answers the
coordinator's haul-size arm: packcomp proved 51103/51104/51108 never
carry more than 8 nuts / 5 acorns on any return (best combined
1,200 / 1,200 / 565), and shelling proved the shape persists on
fresh bands (51403/51406, 51411/51413/51417: max combined < 2,000
on every return). This arm decomposes the cap on FRESH seeds
(51501-51508 pilot; never 511xx/512xx/514xx) with a count, not a
story. DIAG ONLY: zero src/js changes, zero policy-default flips,
zero edits to existing scripts/policies. New files only, all named
*-haulsize-b.*. This worker does NOT push, bump, verify live, or
merge into master; the coordinator merges. Status to coordinator:
committed on branch, pending coordinator merge.

## Verdict: PILOT NO-GO on the primary (5/8 < 6/8) — NO confirm spend

Prereg: evidence/2026-11-01/sim-haulsize-b-prereg.md (commit
8a0b11e9f) + amendment v2 (commit 5cc47f309), both committed BEFORE
any judged sim. Judged exactly against the prereg bars:

- PRIMARY (successful-trip stopping reason): one mechanism
  attributed on >= 6/8 pilot seeds was required for confirm. The
  pilot attributes POLICY_ONE_TRIP on 5/8 seeds (51501, 51502,
  51503, 51507, 51508 — every attributed seed, share 1.0). The
  other 3 seeds (51504, 51505, 51506) are UNATTRIBUTED by the
  prereg's own floor: they have 1, 0, and 4 successful-trip days,
  below the >= 5 floor, so no modal stopping reason can be
  called. 5/8 is not 6/8: NO-GO, and per the task there is NO
  confirm spend. No re-score: the fact that POLICY_ONE_TRIP is
  unanimous across successful days (64/64, see below) does NOT
  convert 5/8 into a GO — the bar was 6/8 seeds and it missed.
- This is NOT the prereg's PILOT FAIL branch ("instrument could
  not attribute"): the instrument attributed everything it could.
  The 3 unattributed seeds are unattributed for a substantive
  reason their own day-shape states plainly (almost no successful
  trips at all), and the pre-registered SECONDARY metric
  attributes all 8 seeds. The pilot therefore reports a finding,
  not an instrument failure — but the finding rides on the
  secondary, and the secondary has no confirm rule in the prereg,
  so no 12-seed confirm is run on it either. A follow-up arm
  should pre-register its own confirm for the failed-trip
  mechanism (see Metric review).

## The answer in one paragraph

The ceiling has two stacked causes, and the bigger one is the one
nobody was measuring. FIRST, most days the trip fails outright:
160 of 240 pilot days (67%) end with zero successful forage —
the reached patches are worked out (cell-level depletion, ~2-day
regrow) and onward travel is often blocked (creek / rubble /
fallen_tree refusals). SECOND, on the days a trip DOES succeed
(64 of 240, 27%), the haul is exactly ONE sweep and then the
scholar stops: 64/64 successful-trip days classify
POLICY_ONE_TRIP — the competent policy calls its forage trip at
most once per day and breaks after its first successful forage,
even though 80-112 ticks remain (a trip costs 16), the pack sits
at most 87% full, and 4+ stocked tiles remain. One sweep is
~3 cells at 3-5 units each, nut-heavy, so a successful day's haul
is a few hundred to ~3,000 kcal combined — and most of that value
is unshelled or unknown, which is why no finished pack ever
clears the 2,000 keep (max finished 1,720; unload 0 band-wide).
Knowledge is NOT the cap (unknown species ARE harvested, into
the lump, on successful days); pack capacity is NOT the cap
(max 87%); time/ticks is NOT the cap (80+ ticks remain; node
travel costs 0 dayTicks); route TIME is not a cost at all, but
route BLOCKAGE is a real compounding friction on failed days.

## Pilot census (30d competent, DEPOSITGATE=0, keep 2,000)

live = returnToVillage calls with Game.over false at entry
(packcomp rule). tripDays = days with >= 1 successful forage;
failed = days with attempts but zero successes; noTrip = days
with no forage attempt. attr = primary attribution (modal
stopping reason, >= 50% share, >= 5 trip days). failAttr =
secondary failed-trip attribution (same rule over failed days).

| seed | wave | liveRet | unload | maxFin | maxComb | haulSize | trip | failed | noTrip | attr | failAttr | dayShape |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 51501 | 1 | 28 | 0 | 1720 | 2285 | no | 11 | 17 | 2 | POLICY_ONE_TRIP 1.0 | FAILED_WORKED_OUT 1.0 | failed |
| 51502 | 2 | 22 | 0 | 100 | 1343 | YES | 15 | 13 | 2 | POLICY_ONE_TRIP 1.0 | FAILED_WORKED_OUT 1.0 | success |
| 51503 | 1 | 22 | 0 | 900 | 1582 | YES | 13 | 15 | 2 | POLICY_ONE_TRIP 1.0 | FAILED_WORKED_OUT 1.0 | failed |
| 51504 | 2 | 28 | 0 | 0 | 339 | YES | 1 | 27 | 2 | UNATTRIBUTED (too few) | FAILED_WORKED_OUT 1.0 | failed |
| 51505 | 1 | 28 | 0 | 0 | 0 | YES | 0 | 28 | 2 | UNATTRIBUTED (too few) | FAILED_WORKED_OUT 1.0 | failed |
| 51506 | 1 | 29 | 0 | 0 | 904 | YES | 4 | 24 | 2 | UNATTRIBUTED (too few) | FAILED_WORKED_OUT 1.0 | failed |
| 51507 | 2 | 24 | 0 | 630 | 630 | YES | 10 | 18 | 2 | POLICY_ONE_TRIP 1.0 | FAILED_WORKED_OUT 1.0 | failed |
| 51508 | 2 | 28 | 0 | 1550 | 3050 | no | 10 | 18 | 2 | POLICY_ONE_TRIP 1.0 | FAILED_WORKED_OUT 1.0 | failed |
| BAND | | 209 | 0 | | | 6/8 | 64 | 160 | 16 | 5/8 | 8/8 | failed 7/8 |

Judged counts: primary POLICY_ONE_TRIP on 5/8 seeds (GO needed
6/8 — miss); successful-trip days POLICY_ONE_TRIP on 64/64
(59 on attributed seeds + 5 on unattributed seeds, all
POLICY_ONE_TRIP); secondary FAILED_WORKED_OUT on 8/8 seeds
(share 1.0 everywhere); failed-modal day-shape on 7/8 seeds
(only 51502 has more successful than failed days, 15 vs 13).

## Decomposition detail (the counts behind the claim)

SUCCESSFUL-TRIP DAYS (64 days, all POLICY_ONE_TRIP):
- Ticks remaining at trip-end: min 80, max 112 on 63 days (one
  51507 day: 239, a different day-part entry); median trip span
  16 ticks. OUT_OF_TIME never fires: remaining budget is 5-7x
  a trip's cost. The policy daily runs in the last day-part
  (entry dayTicks 384 on most days), so the effective evening
  budget is 128 ticks — and a second trip (16 ticks) still fits
  in it with room to spare.
- Pack at trip-end: max 17.48 kg of a 20 kg cap (51502, 87%);
  no day reaches the 95% PACK_FULL line, and no forage call
  ever returns null with a pack-full line. Pack capacity does
  not stop any successful day.
- Stocked tiles remaining at trip-end: min 4, typically 9-21.
  NO_MORE_TARGETS never fires on the tile-stock measure. Caveat
  (honest): the amendment's cell-availability measure mostly
  did NOT materialize — candidate tiles usually have no
  generated detail grid yet, so availableCells is null and the
  classification falls back to tile stock. A stock-43 grove can
  still be cell-picked-clean (control 51509 proved it), so the
  next tile's cell state on a successful day is unmeasured on
  most days. What IS measured is that the policy never TRIES a
  second sweep: forageTripSeedFirst breaks after its first
  success and daily() calls it once. Even if the next tile were
  barren, the stop is policy-structural — no second attempt is
  ever made to discover it.
- Yield per successful day: 1 sweep, ~2-3 harvested cells
  (band: 159 cells over 64 days), 3-5 units per cell. Band
  successful-day gains: 659 species units, of which 278 nut
  units; edible-now 17,520 kcal, shelled-potential 27,460 kcal
  (nut-heavy: 51502's successful days yield 91 nut units and
  ZERO edible-now kcal — pure in-shell value until shelled).
- Knowledge: successful days mix known and unknown species
  (e.g. 51501: 148 units across known + unknown; unknowns
  arrive via the lump wrapper on real sweeps). Unknown species
  are harvested, not skipped — knowledge state does not cap
  the sweep. Target choice is nearest-stocked-tile, not
  species-targeted, but that is downstream of the two causes
  above: the trip usually fails before choice matters, and
  when it succeeds it stops after one tile.

FAILED-TRIP DAYS (160 days, FAILED_WORKED_OUT on 8/8 seeds):
- Failure say lines: 376 "worked out" + 12 "nothing left"
  across the band; every failed day's failures are all
  worked-out/nothing-left, hence share 1.0 everywhere. The
  sweep reached a tile and found no harvestable cells (detail
  regrow, ~2 days), or the tile's cells were already picked
  clean. This is depletion, not identification: the same
  tiles reappear as candidates (tile stock does not deplete
  on a sweep) while their cells stay unharvestable.
- Blocked travel (day-level count, all daily walks, not
  trip-only): 135 blocked attempts band-wide (51505: 55,
  51508: 39, 51507: 30, 51503: 6, 51502: 5; 51501/51504/51506:
  0). FAILED_BLOCKED_TRAVEL as a classified reason never
  fires in the pilot (every failed day has >= 1 forage call),
  so blockage is a compounding friction — it bars the walk to
  the next candidate after a worked-out patch — not the
  classified reason. The trip tries up to 3 candidates; on
  failed days the reached ones are worked out and the rest
  are often unreachable.
- The extreme seed, 51505: 0 successful days, max combined 0,
  28 failed days, 55 blocked travels — and still 28 live
  returns, every one carrying zero food value (materials only).
  A "return" here is a homecoming event, not a haul delivery:
  the scholar comes home daily and brings nothing edible.
- Stranding (control context, not a pilot classified reason):
  control 51509 showed the walk-home failure mode precisely —
  walkTo picks the direct d<=3 jump as its best step, a
  washed_out refusal ends the walk (route-around and
  standing-home gates OFF in this substrate), and the scholar
  stays at the away tile for 9 days while the trip's walkHome
  target (its origin) keeps it there. Pilot seeds return home
  22-29 times each, so stranding does not dominate the pilot
  band — but it is the same blockage family as the failed-day
  travel refusals.

## Sense test (SENSE-TESTING LAW: read, don't just count)

Full extracts: evidence/2026-11-01/sim-haulsize-b-corpus/.

- 51508, day 30 — a successful day that reads as a person, then
  stops like a policy: two worked-out patches ("This patch is
  worked out — step to another green patch and forage again."),
  then the third tile pays: "You work the patch with practiced
  hands: 10x Hickory Nuts, 10x Muscadine Grapes, 10x Blackberry
  (1550 kcal). This patch is picked clean — it'll recover in a
  few days." Then a straight walk home (5,4) -> (4,4), pack
  12.05 kg. Nothing robotic in the forage lines; what never
  happens is a second outing. The day reads as one good patch
  and a walk home — which is exactly the ceiling: one patch
  per day, by construction, not by constraint.
- 51505, day 5 — a failed day that reads as a person thwarted
  by the land, not by the UI: one worked-out creek patch, then
  creek-blocked and fallen-tree-blocked onward walks, then the
  walk home with a 3.46 kg pack of materials and no food. The
  game is honest about every refusal; the frustration is the
  world's, not the narration's.

## Wall numbers (as measured in-window; wall NOT measurable here)

This 30d pre-seat window cannot measure national / table / wins:
no seed can reach national in 30 days, and none does. What the
pilot returns in-window: 8/8 seeds survived 30 days (median
survival 30, max 30, collapses 0); wave reach max 2 (wave 1 on
51501/51503/51505/51506, wave 2 on 51502/51504/51507/51508);
waves 3-5 not reached (expected — early window). National 0,
table 0, wins 0 IN THIS WINDOW ONLY — not a wall movement claim.
Unload 0 band-wide (no finished pack ever exceeds the 2,000
keep: max finished 1,720) — the shelling-shaped gap, already
proven real by sim-shelling-b, not re-litigated here.

## Balanced panel (section 15)

No panel compare is fabricated, per the prereg's inapplicability
declaration: the panel compares lever arms through its
standardized observer/scorecard/cohort rows; this arm changes no
game code, has no lever arm and no before/after pair — it is a
within-trajectory diagnostic on a single substrate, the same
standing as packcomp/depositkeep. The per-day decomposition
tables above ARE the comparison surface.

## Caveats and attribution limits (honest, per prereg)

- SINGLE policy (competent), 30-day early window, gate-off
  substrate only. Other policies, later windows, and gate-ON
  play may shape differently — in particular, a later window's
  regrown patches could fail less often, and gate-ON keeps
  (6,000) would need far bigger hauls.
- CELL AVAILABILITY MOSTLY UNMEASURED: the next tile's cell
  state on successful days is null on most days (detail grids
  not yet generated for unvisited tiles). POLICY_ONE_TRIP is
  therefore a claim about the observed stop (no second attempt
  despite time, pack room, and tile-stock menu), not a proof
  that the next tile held harvestable cells. The policy code
  (forageTripSeedFirst breaks after first success; daily()
  calls it once) is the structural fact behind it.
- BLOCKED-TRAVEL COUNTS ARE DAY-LEVEL: the travel wrapper
  records every daily walk, not just trip walks, so the 135
  blocked attempts include non-trip walks. The failed-day
  classification itself uses forage say lines only.
- RETURN ≠ HAUL DELIVERY: returnToVillage fires on homecoming
  (including zero-food returns like 51505's 28). Max-combined
  is computed over live returns, so a seed can show 28 returns
  and a 0 max — the return census and the trip-day census
  answer different questions, and both are reported.
- The pilot's 6/8 haul-size-shaped seeds (max combined < 2,000)
  reproduce the shelling band's shape on fresh seeds (there:
  5/20 across pilot+confirm). The ceiling is a band property,
  not a seed quirk.

## Metric review (for the NEXT run; this run judged against its header)

- THE PRIMARY BAR ASSUMED SUCCESSFUL TRIPS ARE THE NORM: the
  6/8-seed bar with a >= 5-trip-day floor silently assumes most
  seeds trip successfully most days. On this band they do not
  (67% failed days). The NEXT run on this axis should pre-register
  TWO primaries, judged separately: (a) successful-trip stopping
  reason (this arm's primary, unchanged), and (b) failed-trip
  reason (this arm's secondary, promoted) — with its own GO bar
  and its own confirm band. Forcing one primary to cover both
  day-shapes is what produced the awkward "5/8 + 3 too-few"
  verdict shape here; the verdict itself is not re-scored.
- THE DECISION TREE MISSED A BRANCH: "primary misses only
  because 3 seeds have < 5 trip days while the secondary
  attributes 8/8" is neither GO, nor no-dominant (which needs
  >= 6/8 individually attributed), nor instrument failure. The
  NEXT prereg should name that branch explicitly ("primary
  NO-GO with complete secondary attribution → finding stands,
  no confirm, follow-up arm pre-registers the secondary as
  primary") instead of leaving it between FAIL and NO-DOMINANT.
- CELL AVAILABILITY NEEDS A REAL MEASURE: the detail-grid
  proxy failed to materialize for unvisited tiles. A future
  instrument that wants next-tile cell state must read it
  without generating detail (or accept that it can only be
  measured on visited tiles) — otherwise NO_MORE_TARGETS rests
  on tile stock, which provably does not deplete on a sweep.
- NO_TRIP DAYS ARE UNIFORM (2/seed, 16 band-wide): every pilot
  seed has exactly 2 no-trip days (needTrip false: pantry >=
  25,000 and scholar kcal >= half cap with a recent give).
  NeedTrip gating is not a ceiling driver on this band.
- No metric, threshold, seed, or classification rule was changed
  mid-run. Amendment v2 (failed-trip secondary, cell measure,
  day-part budget note, stranding context) was committed BEFORE
  the pilot, after the control only. The NO-GO verdict stands
  as written; the 64/64 POLICY_ONE_TRIP days and the 8/8
  FAILED_WORKED_OUT attribution are interpretation of a NO-GO
  result, not a re-score.

## Findings for backlog (for the coordinator to append)

This worker does NOT edit the tracker (coordinator owns it) and
does not append to sim-findings.md directly. The lines below are
in backlog format for the coordinator to append verbatim if it
wants them:

- [open] 2026-11-01 — food-economy / scholar supply — one-sweep-per-day cap: on every successful-trip day (64/64 pilot days) the scholar stops after ONE forage sweep although 80-112 ticks remain (trip costs 16), the pack is at most 87% full, and 4+ stocked tiles remain — the competent policy calls its forage trip at most once per day and breaks after its first success; the ceiling on successful days is policy-structural, not time, pack, or knowledge (sim-haulsize-b evidence).
- [open] 2026-11-01 — food-economy / scholar supply — failed trips dominate the band: 160/240 pilot days (67%) end with zero successful forage, classified FAILED_WORKED_OUT on 8/8 seeds (share 1.0) — reached patches are cell-picked-clean (tile stock does not deplete on a sweep, so candidates keep appearing while their cells stay unharvestable) and onward travel is often blocked (135 blocked day-level attempts); the haul ceiling is mostly days with no haul at all, not small hauls (sim-haulsize-b evidence).
- [open] 2026-11-01 — food-economy / scholar supply — zero-food homecomings: seed 51505 returns home 28 times in 30 days carrying zero food value (materials only) while failing every forage trip — return counts are not haul deliveries, and a seed can look well-travelled while starving its pantry (sim-haulsize-b evidence).

## Next lever candidate (or why there is none)

There is no single-lever follow-up from the primary alone — that
is what NO-GO means here. The candidate NEXT arms, in the order
the evidence points (each needs its own prereg; none is claimed
GO by this diag):

1. SECOND-TRIP / MULTI-SWEEP arm (for the POLICY_ONE_TRIP shape):
   a policy variant that attempts a second forage trip after a
   successful first (same day, ticks charged, targets re-read)
   and measures whether successful-day hauls grow past the keep
   on identical seeds. Judged on successful-trip days only.
2. REGROW / PATCH-ROTATION arm (for the FAILED_WORKED_OUT shape):
   measure cell regrow timing against trip cadence (is the
   ~2-day regrow vs daily trips the depletion engine?), and/or
   a rotation policy that prefers unworked tiles over nearest
   ones; judged on failed-trip rate. This is the bigger lever
   (67% of days), but it needs its own decomposition first —
   this diag proves the failure mode, not the regrow timing.
3. ROUTE-BLOCKAGE arm (compounding friction): measure whether
   route-around / standing-home gates (currently OFF in this
   substrate) change failed-trip rates and stranding duration
   on identical seeds. Do NOT bundle with (1) or (2) — the gates
   touch different systems and the arms must stay separable.

## Infrastructure (loud, per task)

- EPERM FLAP, LONG: from ~16:05 to ~17:07 UTC the container's
  write flap denied file writes, git object writes, and
  safe-commit private-index writes in waves (windows at 16:09
  and 16:13, then a ~20-minute continuous denial 16:20-16:40,
  then a .git-scoped denial with /tmp writes working at 17:04).
  Effects, all recovered loudly: (a) the analyzer's single
  console.log of the 160KB summary silently dropped under
  redirect (exit 0, 0 bytes) — fixed with a chunked-retry file
  writer + a stdout error listener + timeout guard, and pilot
  analysis verified by size + JSON parse; (b) the amendment
  commit needed 20 + 6 + 27 safe-commit attempts before
  landing (5cc47f309) — no bare commits, no script edits, the
  loop simply out-waited the flap; (c) the control analysis
  file (/tmp, non-deliverable) never landed through the flap
  and was abandoned — its numbers were already established
  from piped runs and are not needed for any judged claim.
- INDEX CLOBBER (known class) hit both commits: after the
  prereg commit the index showed staged deletions + untracked
  copies; after the amendment commit (private-index commit,
  main index untouched) it showed MM stale entries. Repaired
  both times via git update-index --add --cacheinfo from HEAD
  blobs; verified git status --short empty + git diff HEAD
  empty + git diff --cached empty after each repair. Both
  commits themselves verified correct (8a0b11e9f: 929
  insertions; 5cc47f309: 215 insertions, 8 deletions).
- INSTRUMENT NEUTRALITY, VERIFIED: the shelling baseline driver
  on control seed 51509 records the same 7 live returns and
  unload 0 as the haulsize driver — the low return count is
  seed behavior (stranding), not driver contamination. Live-det
  on 51509 is byte-identical across runs (see Proof tests).
- Sibling trees untouched. Main tree at
  ~/workspace/the-scattering never touched.

## Proof tests

scripts/test-haulsize-b.js: 30 pure checks green (pack formulas,
classification priority + boundaries, cell-availability
precedence, failed-day classification, seed attribution,
dominant-mechanism/scattered flags). Live modes on NON-JUDGED
seed 51509 only: --live-control 9/9 (30 loopDays, live returns,
forage events, successes, trip-end snapshots, analyzer runs on
the instance); --live-det identical census across two runs.
Proof runs executed before the closeout commit: pure 30/30,
live-control 9/9, live-det 1/1 — all green.

## Files

- Prereg: evidence/2026-11-01/sim-haulsize-b-prereg.md
  (commit 8a0b11e9f; amendment v2 commit 5cc47f309, both BEFORE
  any judged sim)
- Instrument: scripts/haulsize-b-lib.js,
  scripts/haulsize-b-driver.js, scripts/analyze-haulsize-b.js
- Proof test: scripts/test-haulsize-b.js (30 pure;
  --live-control 51509, --live-det 51509)
- Pilot census: evidence/2026-11-01/sim-haulsize-b-pilot.jsonl
  (8 lines), sim-haulsize-b-pilot-analysis.json (analyzer
  summary + full per-day tables)
- Corpus extracts: evidence/2026-11-01/sim-haulsize-b-corpus/
  51508-day30-trip.txt, 51505-day05-failed.txt
- Evidence: evidence/2026-11-01/sim-haulsize-b.md (this file)
