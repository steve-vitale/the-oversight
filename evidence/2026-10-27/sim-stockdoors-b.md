# sim-stockdoors-b (2030Z) — the boundary-aware pantry ledger, re-judged on current master (measurement only)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261027T2030Z, axis
food-economy. Arm: the stockSurplus + direct-pantry-consumption ledger
re-judged with the post-run closing the 0530Z round ordered. Measurement
only: zero src/js changes, no default flips, no lever. This arm does NOT
re-judge the 0049Z stockdoors NO-GO against its own prereg — its verdict
is ONLY whether the family ledgers close under the boundary-aware
closing defined in its prereg
(evidence/2026-10-27/sim-stockdoors-b-prereg.md, committed BEFORE any
judged sweep as fd5223eb9d57d4c8e9e975a1f0aabf3c7799aed0). Judged ONLY
against that prereg.

## Verdict against the pre-registered bar: GO (pilot) + CONFIRM-GO

| leg | bar | pilot result | confirm result |
|-----|-----|--------------|----------------|
| 1. Neutrality / det-gate | STOCKDOORS=0 vs 1 identical on inflow/mealdraw/spoilvol/driedpath/finalPantry/deaths/wall (seed 9820) | byte-identical ✓ (240/1247/3/155, stockdoor 656 / direct 22 on-run) | — (pilot leg) |
| 2. Coverage | stockdoor records on >= 7/8 seeds; driedpath events on >= 7/8, linked >= 95%; every wrapped path reported | 8/8; 8/8; 100.0% linked ✓ | 12/12; 12/12; 100.0% linked ✓ |
| 3. Named-family closure (BOUNDARY-AWARE) | (a) pass rate >= 80% AND (b) pooled \|residual\| within 1% of pooled inflow | (a) 6/6 = 100% ✓; (b) 0 / 973,680 = 0.000% ✓ — PASS | (a) 5/5 = 100% ✓; (b) 0 / 286,220 = 0.000% ✓ — PASS |
| 4. Generic-family closure (BOUNDARY-AWARE, separate) | (a) pass rate >= 80% AND (b) pooled \|residual\| within 1% | (a) 8/8 = 100% ✓; (b) −1,021 / 2,103,491 = 0.049% ✓ — PASS | (a) 12/12 = 100% ✓; (b) −3,040 / 3,473,310 = 0.088% ✓ — PASS |
| 5. Dried-channel closure (BOUNDARY-AWARE) | pooled \|dried residual\| within 2% of pooled transformed post-kcal | −1,021 / 610,566 = 0.17% ✓ — PASS | −3,040 / 1,033,545 = 0.29% ✓ — PASS |

The confirm NEVER overrides the pilot verdict: the verdict is the
pilot's GO; the confirm is reported alongside as CONFIRM-GO. The
0049Z stockdoors NO-GO stands as judged against its own prereg (its
closing basis was the last day-end snapshot); what this run establishes
is that under the post-run closing, the same doors close the same
ledgers — the 0049Z failures were boundary artifacts, as residualhunt
diagnosed, not missing doors.

## Band and instrument

- Policy competent-nofeast: COMPETENT_FEAST=0, SEATDRIVE=0,
  PLENTYDEPRI=0, DEPOSITGATE=1, FEASTSCALE_R13 off. Pilot seeds
  9820–9827 REUSED as substrate (stated, no freshness claim);
  confirm seeds 9730–9741 (12 seeds; pre-prereg collision check found
  no evidence file for any of them; the 0049Z confirm band 9768–9779
  was NOT reused — the 0530Z round records it as spent-but-unjudged
  for stockdoors purposes). Horizon 100d, death-aware; pilot seed
  9824 died day 75 (village-lost), the rest survived to day 100;
  all 12 confirm seeds survived to day 100.
- Instrument (DIAG only): scripts/inflow-capture.js,
  scripts/mealdraw-capture.js, scripts/spoilvol-capture.js,
  scripts/driedpath-capture.js, scripts/stockdoor-capture.js,
  scripts/stockdoors-capture.js, scripts/dedupspan-apply-b.js reused
  UNCHANGED from the 0049Z arm (the prereg's stale-premise disclosure
  records why no recorder was rebuilt: the recorders already exist,
  committed and landed at 0530Z — rebuilding them would duplicate
  committed instrument code for no measurement gain). ONE addition,
  pre-registered and committed with the prereg: scripts/
  sweep-stockdoors-b.js now records `finalPantry`, a post-runDays
  spoilvol snapshot (pure read), on every per-seed payload.
  NEW scripts/analyze-stockdoors-b-2030.js (boundary-aware legs +
  control legs + case diagnostic) and scripts/test-stockdoors-b-2030.js
  (proof). Corpus: evidence/2026-10-27/sim-stockdoors-b-corpus/ (8
  pilot files) + evidence/2026-10-27/sim-stockdoors-b-confirm-corpus/
  (12 confirm files) + evidence/2026-10-27/sim-stockdoors-b-diag9750/
  (1 diagnostic file, never judged). The sweep was run with
  PERSEED_DIR set to each of these directories — its default
  (evidence/2026-10-26/sim-stockdoors-b-corpus/) was NOT used, so
  the 0049Z corpus is untouched.
- Canon read: docs/CANON.md + docs/PRESERVATION.md, plus the
  driedpath, stockdoors, residualhunt, and mealdraw evidence. The
  code facts in the prereg (stockSurplus game.js ~28794; npcTakeAction
  ~20561 / npcChildAction ~20721; alien raids alienPlayers.js ~2448;
  Light Fingers abilityActions.js ~1654; event takes game.js ~25133;
  player takes game.js ~15730/~15886) were read before the prereg,
  not invented.
- Base commit pinned: prereg commit fd5223eb9 (tooling-only, zero
  src/js); the judged sweeps ran on that commit. Trajectories moved
  vs 0049Z, as expected on a moved base: pilot seed 9820 now reads
  240/1247/3/155 (inflows/mealdraw/deaths/driedEvents) vs the pinned
  pre-c04d4e0cb 255/1249/4/163 — the residualhunt current-base
  numbers (240/1247/3/155) reproduce exactly, so there is no new
  fork to report. Pilot seed 9824 dies day 75 here vs surviving 100d
  on the old base; named-family counts fall (6 pilot / 5 confirm vs
  12 on 0049Z) because fewer named families clear the 10,000-kcal
  inflow floor on current trajectories — the bars are rates, so the
  verdict is not a small-n artifact of the floor alone, but the
  smaller named counts are stated, not hidden.

## Snapshot basis (backlog 1179 — every stock figure names its basis)

- Opening: post-setupGame, pre-first-policy-day snapshot. 47,250 kcal
  on every seed on both bands, composition re-derived on this head
  (seed 9820): Rice 13,000, Dried beans 12,000, Dried meat 8,800,
  Canned soup 7,500, Peanuts 5,950 — identical to driedpath's split.
- Day-end: spoilDays entries, one per policy daily AFTER
  competent.daily. Control closing: last spoilDays entry.
- Closing (JUDGED): finalPantry, post-runDays snapshot. Control and
  judged closings are DIFFERENT numbers by design; every residual
  below names which closing it uses.
- All stock figures are FRESH kcal only. Spoiled stock is excluded
  from opening/closing in both definitions (it leaves via the spoil
  sweep, itself a counted flow). Median survival uses the
  conventional median over daysAlive.

## Control: the det-gate (leg 1) and the last-day-end control legs

Det-gate (seed 9820, STOCKDOORS=0 vs 1, stdout-JSON mode): inflow,
mealdraw, spoilvol, driedpath records, finalPantry, death lists, and
wall fields are BYTE-IDENTICAL excluding stockdoors fields and `ms`.
The on-run records stockdoor=656 and direct=22; the off-run records
no stockdoors fields. FinalPantry fresh is 25,416 kcal in BOTH runs
(vs the last day-end snapshot's 25,036) — the post-run snapshot is a
pure read that moves nothing, and the 380-kcal post-snapshot
difference on this seed is itself the boundary effect the new
closing exists to capture. The det-gate run reproduces the pilot
corpus seed-9820 counts exactly (240/1247/3/155/656/22).

Control legs (last-day-end closing, the 0049Z definition, on THIS
head's corpora — reported for comparison, never judged): pilot named
6/6 (pooled 1,860 / 973,680 = 0.191%), generic 7/8 (pooled −240 /
2,103,491 = 0.011%), dried −192 / 610,566 = 0.03%; confirm named 4/5
(80.0%, pooled 2,260 / 286,220 = 0.790%), generic 10/12 (83.3%, pooled
−11,900 / 3,473,310 = 0.343%), dried −4,139 / 1,033,545 = 0.40%. The
boundary-aware closing improves every control leg on both bands
(pilot generic 7/8 -> 8/8; confirm named 4/5 -> 5/5, generic 10/12 ->
12/12) — the improvement is the closing definition, not a door,
because the doors are identical in both computations.

## What was measured: the doors close the ledgers once the closing is post-run

### Coverage census (leg 2 detail)

Pilot pooled: stockdoor 4,881 records / 1,807,600 kcal; direct 433
records / 77,728 kcal (player-take 377 / 67,182; npc-adult-pantry 56 /
10,546); transformed post 610,566 kcal, linked 100.0%.

| seed | days | deaths | wave | dried ev. | sweeps | stockdoor recs / kcal | direct recs / kcal |
|------|------|--------|------|-----------|--------|------------------------|---------------------|
| 9820 | 100 | 3 | 2 | 155 | 100 | 656 / 245,400 | 22 / 4,848 |
| 9821 | 100 | 5 | 2 | 68 | 99 | 623 / 204,000 | 53 / 10,312 |
| 9822 | 100 | 4 | 3 | 97 | 100 | 691 / 206,400 | 128 / 18,766 |
| 9823 | 100 | 10 | 3 | 72 | 99 | 437 / 209,000 | 27 / 4,768 |
| 9824 | 75 | 14 | 3 | 37 | 74 | 318 / 134,200 | 122 / 24,380 |
| 9825 | 100 | 8 | 3 | 110 | 100 | 594 / 213,600 | 64 / 12,036 |
| 9826 | 100 | 2 | 2 | 98 | 100 | 827 / 282,400 | 9 / 1,318 |
| 9827 | 100 | 2 | 3 | 93 | 100 | 735 / 312,600 | 8 / 1,300 |

All seven wrapper paths installed on all 20 seeds (wrappedPaths
complete, missingPaths empty). Paths with ZERO records on both
bands — alien-raid, thief.steal_pantry, event-take, player-take-bulk,
npc-child-pantry — are reported as zero, not claimed: no raid, lift,
event take, bulk take, or child pantry eat fired on these 20 seeds
(their call counts are 0 except useAbility cultivate keys, which
never move the pantry). Event-take retMismatch count is 0
everywhere. The zero-record paths' accounting is still unproven
here and needs a band where they fire — same caveat as 0049Z, now
on 20 seeds instead of 8.

### Named-family ledgers (leg 3 detail; boundary-aware closing, inflow >= 10,000 kcal)

Pilot (6/6): 9822 Burdock 159,660 / 0; 9822 Muscadine Grapes 148,050 /
0; 9823 Burdock 66,420 / 0; 9826 Lamb's Quarters 359,700 / 0; 9826
Burdock 29,250 / 0; 9827 Purslane 210,600 / 0. Pooled 973,680 / 0.
Confirm (5/5): 9730 Burdock 47,880 / 0; 9731 Burdock 54,540 / 0; 9737
Burdock 153,900 / 0; 9738 Lamb's Quarters 12,700 / 0; 9740 Lamb's
Quarters 17,200 / 0. Pooled 286,220 / 0. Every counted named
family-seed closes EXACTLY (0 kcal) under the post-run closing on
both bands.

### Generic-family ledgers (leg 4 detail; boundary-aware closing)

Pilot (8/8): 9820 300,996 / 0; 9821 225,299 / 0; 9822 240,014 / 0;
9823 267,450 / 0; 9824 156,012 / 0; 9825 254,471 / −1,021 (0.40%);
9826 313,977 / 0; 9827 345,272 / 0. Pooled 2,103,491 / −1,021
(0.049%). Confirm (12/12): 9730 321,385 / 0; 9731 368,045 / 0; 9732
275,965 / 0; 9733 299,090 / 0; 9734 328,073 / 0; 9735 303,176 / −800
(0.26%); 9736 274,966 / 0; 9737 272,397 / 0; 9738 394,610 / −2,240
(0.57%); 9739 265,104 / 0; 9740 158,011 / 0; 9741 212,488 / 0.
Pooled 3,473,310 / −3,040 (0.088%).

### Dried-channel ledgers (leg 5 detail)

Pilot pooled dried BA −1,021 on transformed post 610,566 (0.17%);
confirm pooled dried BA −3,040 on transformed post 1,033,545
(0.29%). In both bands the entire nonzero dried residual sits in
the generic family (pilot: 9825 Foraged food dried −1,021; confirm:
9735 −800 + 9738 −2,240 = −3,040) — the same small-dried-residual
class residualhunt left open (LQ dried −800, a mid-run dried drop
with no record in any instrument). It passes both bars with wide
margin on both bands, so it does not block GO, but it is the one
component the boundary fix does NOT explain, and it is carried
forward as the next ledger pass's open item (see "Out-of-arm
observations"). No family-seed's dried residual exceeds 0.57% of
its inflow on either band.

## Case diagnostics (reported, NOT judged — they cannot change the verdict)

### (a) Analogue procedure: the band's largest single-day non-draw removal

Per seed, per record-day, non-draw removals = spoil sweep pantry
kcal + direct-consumption kcal dated that day. The band's largest
such day is seed 9822, day 83: 21,321 kcal, 100% spoil sweep, 0
direct. Door split: one spoil sweep removing 6 stacks, all
spoilDay 77 (a spoil cliff — clocks running out together):
Muscadine Grapes base 15,390 (171u x 90) + Muscadine Grapes (dried)
3,306 (38u x 87) = 18,696 top family, plus Foraged food 2,625
(4 stacks). Zero direct records dated day 83 on that seed; 6
stockSurplus calls that day stored 3,000 kcal. The analogue
answers the mealdraw candidate question in the sweep direction on
this band: large non-draw removals ARE the recorded spoil sweep,
not a mystery door — and the 9822 Muscadine ledger still closes
exactly (BA 0) with the sweep counted. Other seeds' max days:
9820 day 70, 3,794 (sweep 3,454 + player-take 340); 9821 day 43,
4,123 (sweep 3,331 + player-take 792); 9823 day 33, 8,805 (all
sweep, Burdock 8,010); 9824 day 27, 1,500 (all player-take, Canned
soup); 9825 day 89, 7,987 (sweep 6,245 + player-take 1,742); 9826
day 52, 19,950 (all sweep, Lamb's Quarters 15,100); 9827 day 78,
11,614 (all sweep, Expedition haul 5,000).

### (b) Seed-9750 diagnostic: the day-82/83 ~5,900 kcal case does NOT reproduce on current master

Single-seed run, same instrument, separate corpus dir (never
judged): seed 9750 survives 100d, wave 2 (vs the mealdraw era's
wave 3 — trajectory moved, as the prereg warned), deaths 6,
stockdoor 576 records, direct 32 records. Days 81–84: spoil sweeps
0 kcal, direct records 0 kcal, on every one of those days
(pantryDraws 5,231 / 4,660 / 7,936 / 4,320; stockSurplus pushes
3,600 / 2,400 / 3,000 / 3,800). The largest single-day non-draw
removal on the whole 9750 run is day 68 at 1,027 kcal (direct
only). There is no ~5,900-scale non-draw removal on days 82–83
to attribute on current master, and no sweep/direct door fires
there at all. Conclusion, stated as a base fact and not a
failure: the mealdraw-era ~5,900 case is base-pinned to its era
(first-cook-snapshot window, pre-r53 trajectory) and does not
exist on current master in this instrument's day-end/record-day
cut. The analogue procedure (a) is therefore the operative
answer for this band, and it points at the sweep door.

## Sense transcripts (SENSE-TESTING LAW — meaning, not just counts)

First direct event (9820, day 7): an NPC pantry eat — "a person,
maybe 60s" — 1 unit of Rice, 200 kcal, spoilDay 366. It reads as
what it is: a hungry villager feeding themselves outside the
meal, one unit at a time, not a system drain. Small, human, and
— at 56 npc-adult records pilot-wide — not the story.

First stockSurplus night (9820, day 3): vDay 3, give 67, stored
200, spoilDay 6. The night meal's leftover becomes a 200-kcal
Foraged-food unit in the pantry, good for three days. The village
does not "generate" surplus in the abstract — one villager's
uneaten share becomes tomorrow's stock, night after night,
4,881 records across this pilot band (8,669 on confirm).

Smoke racks (9820, day 12): "Megan cooked for the haven — meals
stretched. Megan worked the smoke racks too — 3 batches preserved
(~1568 kcal, keeps for weeks)." The racks, the surplus door, and
the direct takes are all one village's food story now — and under
the post-run closing, the ledger watches all three to the kcal.
Nothing robotic, static, or repeated was found in the sampled
dialogue beyond the known racks-full repetition (backlog 1149,
unchanged, not chased here).

## Village assessment

What the village looked like: pilot 8 villages (7 surviving the
full 100 days, 9824 lost day 75) and confirm 12 villages (all
surviving 100 days) around pantries that now close to the kcal
under the post-run closing — 4,881 surplus pushes, 433 direct
takes, 772 spoil sweeps (pilot); 8,669 surplus pushes, 1,452
direct takes, 1,200 spoil sweeps (confirm). Rank stayed village
on all 20 seeds; no seed approached regional, let alone national.

Who thrived and died and why: pilot 48 deaths (9820: 3, 9821: 5,
9822: 4, 9823: 10, 9824: 14, 9825: 8, 9826: 2, 9827: 2) — sickness
16, arena 9, monster 8, ambush 4, starvation 4, wound 3, night 1,
sunback 1, hushpuppy 1, buffering 1. Confirm 48 deaths (9730: 1,
9731: 4, 9732: 5, 9733: 2, 9734: 4, 9735: 2, 9736: 2, 9737: 4, 9738:
5, 9739: 4, 9740: 8, 9741: 7) — arena 22, monster 9, ambush 5,
sickness 4, wound 4, contest 2, expedition 1, big beast 1. Two
shape changes vs 0049Z are worth noting, not judged: starvation
deaths appear on the pilot band (4, vs 0 on 0049Z) and the arena
dominates confirm deaths (22/48, vs 3/38 on 0049Z) — death-cause
shapes move with the base, and neither shape is starvation-free
or arena-free anymore. No death is attributed to the pantry
ledger itself: the food story here is a bookkeeping story that
now closes, not a hunger story — except that the 4 pilot
starvation deaths deserve a look from a survival arm, not this
ledger arm.

What knowledge/capabilities were missing: nothing big — the two
doors this lineage was built to capture are captured, and the
closing boundary is now defined. What remains is small and
specific: the generic dried residuals (pilot 9825 −1,021;
confirm 9735 −800, 9738 −2,240) — the mid-run dried-drop class
with no record in any instrument — plus the zero-record paths
(raids, lifts, event takes, bulk takes, child pantry eats),
whose accounting is still unproven because they never fired on
these 20 seeds.

Blanks filled: (1) the boundary-aware closing is now DEFINED and
JUDGED — post-run finalPantry snapshot, all flows counted, no
flow excluded — and it closes the ledgers: pilot GO, confirm
CONFIRM-GO; (2) the 0049Z NO-GO is explained, not overturned: its
failures were the last-day-end closing, proven by the control
legs on the same corpora (pilot generic 7/8 -> 8/8, confirm
named 4/5 -> 5/5 and generic 10/12 -> 12/12 when the closing
moves to post-run); (3) the day-82/83 ~5,900 kcal case is
resolved as far as current master allows: it does not reproduce
on 9750 (zero sweep/direct days 81–84), and its analogue on this
band (9822 day 83, 21,321 kcal) is 100% recorded spoil sweep;
(4) opening stock is re-derived on current master (47,250 kcal,
same staple split). Documented, not fixed: no game-code change
was made (DIAG only).

## Reachability verdict

On the pilot band (competent-nofeast, seeds 9820–9827, 100d):
waves 1–3 reached (wave 3 on 9822/9823/9824/9825/9827, wave 2 on
9820/9821/9826); waves 4–5 reached on 0/8 seeds. Regional,
national, table, and wins: 0/8. On the confirm band (seeds
9730–9741, 100d): wave 3 on 9/12, wave 2 on 3/12; waves 4–5 on
0/12; regional, national, table, wins: 0/12. Rank stayed village
on all 20 seeds. Arc II/III/IV, four-realm formation, trap
acquisition, counter discovery/kill, and young-link succession
survival are not recorded in these corpora and are not estimated
here. The scale wall stands on both bands; these arms measure a
pantry ledger, they do not move the wall numbers.

## Wall numbers (both bands)

Pilot: national / table / wins: 0/8. Wave-4/5 unlocks: 0/8. Wave
reach per seed: 9820: 2, 9821: 2, 9822: 3, 9823: 3, 9824: 3, 9825:
3, 9826: 2, 9827: 3. Median survival: 100d (censored at the 100d
horizon; 7/8 survived to day 100, 9824 lost day 75). Deaths: 48
total (causes above).
Confirm: national / table / wins: 0/12. Wave-4/5 unlocks: 0/12.
Wave reach per seed: 9730: 3, 9731: 2, 9732: 2, 9733: 3, 9734: 3,
9735: 3, 9736: 3, 9737: 3, 9738: 3, 9739: 2, 9740: 3, 9741: 3.
Median survival: 100d (12/12 survived). Deaths: 48 total (causes
above).

## Confirm band: SPENT (pilot GO)

Per the prereg, confirm seeds 9730–9741 (12 seeds) are spent ONLY
if the pilot verdict is GO. The pilot verdict is GO, so the
confirm band was spent with the identical instrument and band,
and reports CONFIRM-GO (see legs above). The confirm does not
override the pilot verdict. Seeds 9730–9741 are now spent for
stockdoors purposes.

## Metric review (MEASUREMENT.md section 14)

- The pre-registered metric worked as written and the verdict
  follows from it: leg 1 passes byte-identically including the
  new finalPantry field, leg 2 passes completely (8/8 pilot,
  12/12 confirm, 100.0% linked both), legs 3–5 pass on both bands
  under the boundary-aware closing (pilot named 6/6 pooled 0,
  generic 8/8 pooled 0.049%, dried 0.17%; confirm named 5/5
  pooled 0, generic 12/12 pooled 0.088%, dried 0.29%). No
  re-scoring was done (no dropping the generic family, no
  switching to last-day-end residuals, no single-seed rescue, no
  ignoring unlinked events — there are none, no excluding
  day-100/day-101 flows — the post-run closing counts them by
  construction, no reverting to the OLD draw definition).
- Bar lesson for the NEXT run: the named-family counts are
  shrinking with the base (12 on 0049Z -> 6 pilot / 5 confirm
  here) because fewer named families clear the 10,000-kcal inflow
  floor on current trajectories. The rate bars still work, but
  a future prereg should consider whether the 10k floor still
  selects a representative named set, or whether it now selects
  only Burdock/Lamb's Quarters/Purslane/Muscadine survivors by
  luck of the trajectory. The pooled bars (0.000% named on both
  bands) carry the verdict more than the rates do at these
  counts — that asymmetry belongs in the next prereg's bar
  discussion, not retrofitted here.
- The boundary-aware closing's one surviving component is the
  small generic dried residual (pilot −1,021; confirm −800 and
  −2,240). It passes every bar, but it is the same class as
  residualhunt's open LQ dried −800: a mid-run dried drop with no
  record in any instrument. The next ledger pass should hunt
  that class directly (per-stack walk on a seed carrying one,
  e.g. confirm 9738) before claiming the ledger closes to zero
  everywhere — GO here means "closes as barred," not "closes to
  zero on every family-seed."
- Definition lesson (carried, now closed): draws are pantryDraw +
  drawSpoiled + direct-consumption records (0049Z definition,
  inherited unchanged); closing is the post-run snapshot (this
  run's definition, ordered by 0530Z). Future ledger arms inherit
  both; they do not re-litigate them without a new prereg.
- Balanced panel (MEASUREMENT.md §15): NO comparison exists —
  this arm changes no lever and no game code, so there is no
  before/after to panel. The det-gate (leg 1) is the before/after
  comparison: identical records with the instrument off vs on.
  The before/after that DOES exist is instrument before/after:
  0049Z last-day-end ledgers vs this run's post-run-closing
  ledgers — reported via the control legs above.

## Out-of-arm observations (for the coordinator's sim-findings backlog; not chased, not edited into the backlog from this worktree)

- The boundary-aware ledger closes: pilot GO + confirm CONFIRM-GO
  — the 0049Z NO-GO's cause was the closing definition, now fixed
  by prereg. The next ledger arm's open item is the small generic
  dried residual class (pilot 9825 −1,021; confirm 9735 −800, 9738
  −2,240) — hunt it per-stack on a carrying seed before claiming
  zero residuals everywhere.
- The mealdraw-era day-82/83 ~5,900 kcal case does NOT reproduce
  on current master (seed 9750: zero sweep/direct days 81–84; max
  non-draw day on the run is day 68, 1,027 kcal). Its analogue on
  this band (9822 day 83, 21,321 kcal) is 100% recorded spoil
  sweep — large non-draw removals on current master are the sweep
  door, not a mystery.
- Zero-record paths still unproven after 20 seeds: alien raids,
  Light Fingers lifts, event takes, bulk takes, child pantry eats
  never fired on the pilot or confirm bands. Their accounting
  needs a band where they fire.
- Death-shape movement with the base: pilot starvation deaths 4
  (vs 0 on 0049Z) and confirm arena deaths 22/48 (vs 3/38) — worth
  a survival arm's look, not this ledger arm's verdict input.
- Named-family counts are shrinking with the base (12 -> 6 pilot /
  5 confirm clearing the 10k floor) — the next prereg should
  revisit whether the floor still selects a representative set.
- Sickness is no longer the top pilot death cause (16/48, still
  first on pilot) but falls to 4/48 on confirm, where the arena
  dominates — death-cause shapes are band-volatile on current
  master.

## Reproduction check (this run)

- Prereg committed BEFORE any judged sweep (fd5223eb9, including
  the sweep's finalPantry addition and the new analyzer). Judged
  sweeps ran on that commit: pilot 8 files + confirm 12 files +
  diagnostic 1 file, all "written", exit 0.
- Analyzer scripts/analyze-stockdoors-b-2030.js prints per-seed
  per-family ledgers under BOTH closings, the per-path direct
  census, stockSurplus totals, GO legs, wall numbers, case
  diagnostic, and the sense block.
- Proof scripts/test-stockdoors-b-2030.js GREEN in this worktree,
  exit 0: corpus validity (8 + 12 files, policy fields, no
  truncation, finalPantry present, spoilDays length == daysAlive),
  det-gate byte-identical incl. finalPantry (240/1247/3/155 both
  runs, stockdoor 656 / direct 22 on-run, none off-run),
  det-gate reproduces corpus 9820 counts, independent BA
  recomputation matches the analyzer on every leg (pilot 6/6/0/
  973,680 named, 8/8/−1,021/2,103,491 generic, −1,021/610,566 dried;
  confirm 5/5/0/286,220 named, 12/12/−3,040/3,473,310 generic,
  −3,040/1,033,545 dried), verdict follows from legs (pilot GO,
  confirm CONFIRM-GO), stockdoor invariant holds (10,392 kcal>0
  records, spoilDay == vDay + 3, name 'Foraged food', 0 bad),
  no unknown direct paths, event-take retMismatch 0, and hygiene
  (0 src/js files modified, 0 sibling capture files modified, no
  modified tracked file outside this run's own files). No jest
  was run (nothing to test in jest — the proof is node, not
  jest). No [needs-eyes]: this lands a measurement, not a
  player-visible change.
- No game-code change: zero src/js files touched. Files in this
  run's commits: prereg commit fd5223eb9 (prereg,
  scripts/sweep-stockdoors-b.js finalPantry addition,
  scripts/analyze-stockdoors-b-2030.js), plus the evidence commit
  (scripts/test-stockdoors-b-2030.js,
  evidence/2026-10-27/sim-stockdoors-b.md, and the 8 + 12 + 1
  corpus files).
- Infrastructure notes (loud, per the flap/clobber rules): the
  documented safe-commit index-clobber variant hit the prereg
  commit (committed files showing staged-as-deleted in the
  worktree's main index, worktree files byte-identical to HEAD,
  verified by hash-object). Repaired per the documented recipe
  (git update-index --add --cacheinfo with the HEAD blob per
  file); after repair `git status --short` showed only the
  intended untracked files and `git diff HEAD` was empty. The
  judged sweeps' wall-clock ran ~15 min (pilot) and ~13 min
  (confirm) for ~15 s of sim compute each — the known ~60–140 s
  gaps between file writes (cause not established, no EPERM flap
  observed this run; all writes succeeded first try). No ref
  surgery was performed at any point. No EPERM flap hit this run.

## Verdict (judged against the pre-registered bar, not re-scored): GO (pilot) + CONFIRM-GO

Leg 1 (det-gate byte-identical including finalPantry), leg 2
(coverage 8/8 pilot, 12/12 confirm, 100.0% linked), leg 3 (named
6/6 pooled 0 pilot, 5/5 pooled 0 confirm), leg 4 (generic 8/8
pooled 0.049% pilot, 12/12 pooled 0.088% confirm), and leg 5
(dried 0.17% pilot, 0.29% confirm) all pass. The recorded doors
close the family ledgers once the closing is defined as post-run
— the 0049Z NO-GO's cause was the closing boundary, and the
boundary-aware ledger is now the judged definition. The confirm
band 9730–9741 is spent. The one component the boundary fix does
not explain — small generic dried residuals (pilot −1,021;
confirm −800, −2,240) — passes every bar and is carried forward
as the next ledger pass's open item.
