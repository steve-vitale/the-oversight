# sim-driedpath-b — the (dried) transformation path, instrumented (measurement only)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261026T2309Z, axis
food-economy. Arm: the spoilvol metric review's named next blank —
instrument the (dried) transformation path, plus opening stock for
generic channels, before judging any family ledger closed.
Measurement only: zero src/js changes, no default flips, no lever.
This arm does NOT re-judge the spoilvol DIAG-NO-GO — its verdict is
ONLY whether the family ledgers close once the transformation path
is captured. Judged ONLY against its pre-registration
(evidence/2026-10-26/sim-driedpath-b-prereg.md, committed BEFORE
any judged sweep as 2928ecadf, plus the instrument-fix commit
e75b4fb65 — see "Instrument correction" below; the judged sweep
ran entirely on the fixed instrument).

## Verdict against the pre-registered bar: NO-GO

| leg | bar | result |
|-----|-----|--------|
| 1. Neutrality / det-gate | DRIEDPATH=0 vs 1 identical on inflow/mealdraw/deaths/wall | byte-identical ✓ |
| 2. Coverage | events on >= 7/8 seeds; no dried-stock-but-no-event seed; linked post-kcal >= 95% pooled | 8/8; none; 100.0% ✓ |
| 3. Family closure | per-family-seed \|residual\| within 1% of family inflow on >= 6/8 seeds (seed passes iff ALL its focal families close) AND pooled \|residual\| within 1% of pooled focal inflow, with transformation loss + opening stock in the ledger | 0/8 seeds; pooled 90.42% ✗ |
| 4. Dried-channel closure | pooled \|dried residual\| within 2% of pooled transformed post-kcal | 8.78% ✗ |

Legs 1–2 pass, so this is NO-GO (measured, and the ledgers do
not close as barred) — NOT DIAG-NO-GO (the instrument works:
it sees the path completely, see below). No confirm band is
spent: the pilot is NO-GO, so the prereg forbids confirm spend,
and seeds 9768–9779 stay fresh for a future run. No re-scoring
was done: the diagnostic figures excluding the generic family
in the metric review do NOT change the verdict.

## Band and instrument

- Policy competent-nofeast: COMPETENT_FEAST=0, SEATDRIVE=0,
  PLENTYDEPRI=0, DEPOSITGATE=1, FEASTSCALE_R13 off. Pilot seeds
  9820–9827 REUSED as substrate (the spoilvol pilot band —
  stated in the prereg, no freshness claim; determinism check:
  the det-gate run reproduces the spoilvol corpus seed-9820
  counts exactly: inflows 255, mealDraw records 1249, deaths 4).
  Horizon 100d, death-aware; all 8 seeds survived to day 100.
- Instrument (DIAG only): scripts/inflow-capture.js,
  scripts/mealdraw-capture.js, and scripts/spoilvol-capture.js
  reused UNCHANGED, plus the NEW scripts/driedpath-capture.js
  (wraps Game.resolveOneAssignment once — the village cook's
  smoke-racks duty lives inside it — and Game.preserveFood once
  as a completeness check; snapshots the village pantry before
  and after each call, delegates identically, writes ONLY to
  the caller's arrays; no Game.state write, no RNG use, no
  say/log write) and the NEW scripts/sweep-driedpath-b.js
  (same band/env assertions as sweep-spoilvol-b.js, plus the
  driedpath recorder, an opening-stock snapshot after setupGame
  before the first policy day, and a smoke-rack say recorder
  gated by the same DRIEDPATH flag).
- Corpus: evidence/2026-10-26/sim-driedpath-b-corpus/ (8
  per-seed JSONs). Scripts: scripts/sweep-driedpath-b.js,
  scripts/driedpath-capture.js, scripts/analyze-driedpath-b.js.
  Proof: scripts/test-driedpath-b.js (green, exit 0 — see below).
- Canon read: docs/CANON.md + docs/PRESERVATION.md (ladder;
  "rot can't be smoked back into food" — the racks skip
  already-spoiled stacks, matching the code) + the code facts
  in the prereg (cook's racks, game.js ~7070; player
  preserveFood, food.js ~870). Nothing invented.
- Base commit: prereg commit 2928ecadf, instrument-fix commit
  e75b4fb65; the judged sweep ran on e75b4fb65 (no base move
  during the sweep).

## Instrument correction (before the judged sweep, reported not hidden)

The first, DISCARDED partial run (seed 9820 only, killed before
judging anything) exposed a recorder error: an in-place
conversion's preKcal was recorded as the whole pre-call stack
kcal, but the racks' dinner reserve SPLITS a fresh share off
the same stack inside the same call (pre units 8 → post units
2 on the first event). Recording the whole stack as "lost"
overstated transformation loss by the surviving fresh share
(3,010 kcal on that one event). The fix (commit e75b4fb65):
in-place preKcal = post.units × pre.kcalEach — the converted
portion only; the fresh share stays in the pantry under the base
name and is counted in closing stock. The discarded seed-9820
file was deleted and the full pilot re-run from scratch on the
fixed instrument. The prereg itself was NOT amended after the
fact: its loss definition ("sum of preKcal/postKcal/lossKcal")
holds under the corrected portion semantics, and this section
is the record of the change.

## Control: the det-gate (leg 1)

Seed 9820 run twice (DRIEDPATH=1 vs DRIEDPATH=0, stdout-JSON
mode): inflow records, mealdraw records, death lists, and wall
fields are BYTE-IDENTICAL excluding driedpath fields and `ms`
(spoilvol fields present in both runs and identical too). The
DRIEDPATH=1 det-gate run also reproduces the corpus seed-9820
counts exactly (inflows 255, mealDraw records 1249, deaths 4)
and records 163 dried events; the DRIEDPATH=0 run records
none. The new recorders are neutral: they read, they do not
move the game.

## What was measured: the path is fully seen, the ledgers still don't close

### Transformation census (leg 2 detail)

893 transformation events across 8 seeds, ZERO unlinked, ZERO
player-preserve events (the competent policy never calls
preserveFood — the scholar's own smoking path is not the
pantry's dried source; the cook's racks are):

| seed | events | in-place | split | pre-kcal | post-kcal | loss | smoke-rack say lines | cooks (events) |
|------|--------|----------|-------|----------|-----------|------|----------------------|----------------|
| 9820 | 163 | 158 | 5 | 95,788 | 76,933 | 18,855 | 43 | Benedicte 110, Jovan 50, Megan 3 |
| 9821 | 109 | 86 | 23 | 124,974 | 123,437 | 1,537 | 49 | Hannah 88, Colleen 19, Frankie 2 |
| 9822 | 97 | 82 | 15 | 103,733 | 95,970 | 7,763 | 45 | Zoltan 61, Evelyn 33, Catalina 3 |
| 9823 | 107 | 99 | 8 | 95,310 | 91,757 | 3,553 | 39 | Araceli 61, Vanessa 38, Ruby 6, Hassan 2 |
| 9824 | 73 | 61 | 12 | 83,394 | 73,336 | 10,058 | 39 | Kelly 36, Isamu 16, Gildardo 14, Isadora 5, Hannah 2 |
| 9825 | 139 | 129 | 10 | 106,130 | 84,903 | 21,227 | 40 | Wilhelm 139 |
| 9826 | 98 | 70 | 28 | 125,389 | 120,705 | 4,684 | 36 | Jorge 65, Carolina 21, Hannah 12 |
| 9827 | 107 | 79 | 28 | 109,163 | 107,495 | 1,668 | 34 | Hannah 101, Emmett 6 |
| pooled | 893 | 764 | 129 | 843,881 | 774,536 | 69,345 | 325 | — |

Loss ratios run from ~1% (preserver-rate villages: 9821, 9827)
to ~20% (blind-rate villages: 9820, 9825) — the racks' blind
0.80x vs preserver 0.95x+ rates are visible in the records, not
assumed. Dried inflow records: 0 on all 8 seeds (re-confirmed
in this corpus too) — dried stock STILL enters the pantry with
no inflow-door record, but now every unit of it is accounted
by a transformation event instead.

### Opening stock (the generic-channel correction)

Opening stock is 47,250 kcal on every seed — but it is NOT
"Foraged food". It is the starting staples: Rice 13,000, Dried
beans 12,000, Dried meat 8,800, Canned soup 7,500, Peanuts
5,950. This CORRECTS spoilvol's explanation of the generic
channel: spoilvol said Foraged food "holds the village's
STARTING pantry stock". It does not — the starting stock is
staples under their own names, and the Foraged food gap is
something else entirely (see "The fourth door" below).

### Focal family ledgers (leg 3 detail; inflow >= 10,000 kcal)

| family-seed | inflow | draws | sweep | trans loss | closing | residual | share |
|-------------|--------|-------|-------|------------|---------|-----------|-------|
| LQ 9826 | 359,700 | 53,010 | 276,880 | 360 | 29,400 | −50 | 0.01% |
| LQ 9825 | 48,750 | 34,230 | 3,850 | 2,350 | 9,450 | +1,130 | 2.32% |
| Burdock 9822 | 159,030 | 44,571 | 64,380 | 3,360 | 42,978 | −3,741 | 2.35% |
| Burdock 9826 | 29,250 | 4,005 | 22,809 | 2,436 | 0 | 0 | 0.00% |
| Burdock 9823 | 78,480 | 47,423 | 12,510 | 2,563 | 448 | −15,536 | 19.80% |
| Burdock 9821 | 12,420 | 8,220 | 267 | 106 | 0 | −3,827 | 30.81% |
| Burdock 9824 | 117,180 | 80,460 | 29,232 | 1,818 | 7,290 | +1,620 | 1.38% |
| Muscadine 9821 | 151,830 | 5,916 | 123,871 | 327 | 21,360 | −356 | 0.23% |
| Muscadine 9822 | 147,960 | 28,218 | 66,648 | 540 | 52,554 | 0 | 0.00% |
| Muscadine 9824 | 139,410 | 73,566 | 41,850 | 2,736 | 23,058 | +1,800 | 1.29% |
| Muscadine 9825 | 222,750 | 142,596 | 71,820 | 5,688 | 1,710 | −936 | 0.42% |
| Purslane 9827 | 220,560 | 137,250 | 38,520 | 0 | 44,790 | 0 | 0.00% |
| Foraged food (all 8 seeds) | 27,772–83,845 ea. | — | — | — | — | +88,009 to +341,126 ea. | 105–1,228% |

The calibration family IMPROVED tenfold with the path
captured: 9826 Lamb's Quarters goes from spoilvol's −410
(0.11%, without the path) to −50 (0.01%, with it). Purslane
9827 and Burdock 9826 and Muscadine 9822 close EXACTLY (0).
But only 6 of 12 non-generic focal family-seeds close within
1%, and the pooled non-generic share is 1.18% — still over
the 1% bar even before the generic family is counted. The
NO-GO is robust, not a generic-family artifact.

### Dried-channel ledgers (leg 4 detail)

Pooled dried residual −67,999 on pooled transformed post
774,536 (8.78%). Excluding the generic family: −28,796 on
305,506 (9.43%). The sign is almost always NEGATIVE: dried
stock VANISHES without a recorded draw or sweep. The worst
case is 9823 Burdock dried: 26,147 transformed in, 10,163
drawn, 0 swept, 178 standing — 15,806 kcal gone with no
record. The base-channel ledgers, by contrast, close EXACTLY
(baseResidual 0) on 17 of 31 families with inflow >= 10k: the
transformation accounting is exact on the base side, and the
leak is on the dried side specifically.

### The fourth door (Foraged food's real explanation)

Game.stockSurplus (game.js ~28794) is a FOURTH pantry door
the three-door recorder does not see: every villager meal day,
a villager's shared surplus is pushed DIRECTLY into the
pantry as 'Foraged food' 200-kcal units (with a sub-unit
remainder carried forward), bypassing stockPantry,
depositPantryPieces, and pantryAdd entirely. At village scale
(~12 villagers sharing daily for 100 days) that is hundreds
of thousands of kcal — exactly the Foraged food residual
shape (+88k to +341k per seed). The generic family cannot
close until stockSurplus is recorded; no opening-stock
correction can fix it, because the inflow is ongoing, not
initial.

### The dried-side leak (unrecorded dried outflows)

Dried stock leaves the pantry through paths no recorder
wraps: NPCs eating directly from the pantry (game.js
npcChildAction/villager routines decrement pantry units and
splice without calling pantryDraw, so mealdraw never sees
them), alien pantry raids (alienPlayers.js ~2448: 500–1,000
kcal per raid, max 1 per 6 days, spliced from the pantry
list — voiced, but not recorded by any instrument), and
Light Fingers lifts out of the pantry (abilityActions.js
~1654). Raids alone cap at ~16,000 kcal per 100 days, so
they cannot explain 9823 Burdock's 15,806 alone; direct NPC
eating is the larger suspect. Either way, the prereg's draw
definition (pantryDraw records only) misses these flows, and
the dried ledger inherits the miss. (DrawSpoiled is NOT the
explanation: the corpus holds zero drawSpoiled records on
all 8 seeds.)

## Sense transcripts (SENSE-TESTING LAW — meaning, not just counts)

Seed 9820, day 12 — the first transformation the village ever
records, and it reads as a person doing a job:

> Megan takes the Expedition haul — 8 slabs at 500 kcal, due
> to spoil on day 14 — and works the racks. Six slabs' worth
> stays fresh for dinner (the reserve split, visible in the
> record as 8 units in, 2 units converted); the 2 converted
> slabs come out as "Expedition haul (dried)" at 495 kcal
> each, good until day 52. Loss: 10 kcal — the preserver's
> rate, not the rough 0.80x. The village's own line for the
> day says it plainly: "Megan cooked for the haven — meals
> stretched. Megan worked the smoke racks too — 3 batches
> preserved (~1568 kcal, keeps for weeks)."

Judgment: the racks read as people behavior — a NAMED cook
doing NAMED work for a NAMED reason (food about to spoil),
with the loss rate telling you whether she knows the craft.
The people-shape has one striking feature: the racks are
basically one person's job per village. Wilhelm does all 139
transformations on 9825; Hannah does 101 of 107 on 9827;
Benedicte does 110 of 163 on 9820. The village does not
"preserve food" in the abstract — one cook preserves food,
day after day, while the others cook or do other work. That
concentration is worth knowing: if that one cook dies or
leaves, the racks presumably go quiet, and the rot returns.
(Not tested here — a single-cook dependency is an
observation, not a measured claim.)

The one thing that does NOT read as people behavior is the
same gap spoilvol found, now sharper: the village diligently
smokes its about-to-rot surplus (893 batches, 774,536 kcal
saved onto the racks) while dried stock quietly vanishes
off the racks (67,999 kcal pooled) through eats and raids
nobody records — and while the generic pile grows by
hundreds of thousands of kcal nobody accounts. The village
works the racks; the ledger does not watch everything else.

## Village assessment

What the village looked like: 8 villages surviving the full
100 days around pantries that the cooks actively manage —
893 smoke-rack batches, 774,536 kcal moved onto the racks,
325 smoke-rack say lines. The pantry is not passive churn
anymore: it is churn PLUS a named worker fighting the rot
with her hands. Rank stayed village on all 8 seeds; no seed
approached regional, let alone national.

Who thrived and died and why: 38 deaths across 8 seeds (9820:
4, 9821: 1, 9822: 4, 9823: 9, 9824: 10, 9825: 6, 9826: 2,
9827: 2) — identical to spoilvol's band, as determinism
requires (same seeds, same policy, instrument neutral).
Sickness dominates (17), then monster 5, ambush 4, a wound
that wouldn't close 4, the arena 3, contest 2, sunback 1,
alien 1, dehydration 1. No death is starvation-shaped.

What knowledge/capabilities were missing: the stockSurplus
door (the generic family's inflow); the direct-pantry-eating
/ raid / lift outflows (the dried side's leak); and any
answer to why dried stock vanishes while the racks work.

Blanks filled: (1) the (dried) transformation path is now
INSTRUMENTED and its events are complete — 893 events, 0
unlinked, base ledgers exact wherever the other doors are
complete; (2) the calibration family closes tenfold tighter
with the path captured (9826 LQ 0.01% vs spoilvol's 0.11%);
(3) the opening-stock question is answered AND corrected —
opening stock is staples, not Foraged food; (4) the Foraged
food gap is re-attributed from "starting stock" to the
ongoing stockSurplus door, with the code location named.
Documented, not fixed: no game-code change was made (DIAG
only), and no prior evidence needs numeric revision — the
spoilvol numbers stand; this arm adds the transformation
measurement and corrects one attribution (the Foraged food
starting-stock story), which is a correction to an
explanation, not to a number.

## Reachability verdict

On this band (competent-nofeast, seeds 9820–9827, 100d):
waves 1–3 reached (9822/9824/9825 reach wave 3; the rest wave
2); waves 4–5 reached on 0/8 seeds. Regional, national,
table, and wins: 0/8. Rank stayed village on all 8 seeds. Arc
II/III/IV, four-realm formation, trap acquisition, counter
discovery/kill, and young-link succession survival are not
recorded in this corpus and are not estimated here. The scale
wall stands on this band; this arm measures a pantry
transformation, it does not move the wall numbers.

## Wall numbers (this band, competent-nofeast, seeds 9820–9827)

National / table / wins: 0/8. Wave-4/5 unlocks: 0/8. Wave
reach per seed: 9820: 2, 9821: 2, 9822: 3, 9823: 2, 9824: 3,
9825: 3, 9826: 2, 9827: 2. Median survival: 100d (censored at
the 100d horizon; all 8 seeds survived to day 100). Deaths:
38 total (causes above).

## Confirm band: NOT spent

Per the prereg, confirm seeds 9768–9779 (12 seeds) are spent
ONLY if the pilot verdict is GO. The pilot verdict is NO-GO,
so no confirm band is spent and 9768–9779 remain fresh (for
this arm's purposes; their lqpersist-substrate reuse status
is unchanged).

## Metric review (MEASUREMENT.md section 14)

- The pre-registered metric worked as written and the verdict
  follows from it: leg 1 passes byte-identically, leg 2
  passes completely (8/8, 0 unlinked, 100% linked), legs 3–4
  fail by wide margins (90.42% pooled, 8.78% dried) that no
  honest re-scoring rescues — excluding the generic family
  still fails both (pooled 1.18%, dried 9.43%). No re-scoring
  was done (no dropping the generic family from the verdict,
  no switching to base-only residuals, no single-seed rescue,
  no ignoring unlinked events — there are none to ignore).
- Bar lesson for the NEXT run: leg 3's seed-pass rule (ALL
  focal families within 1% for the seed to pass) is brittle
  by construction — one unclosable family fails every seed
  regardless of the others. The next ledger arm should judge
  per-family-seed pass RATES (e.g. >= 80% of focal
  family-seeds within 1%) alongside the pooled bar, and should
  judge the generic family separately from named-food
  families, since the generic channel's doors are different
  in kind (surplus pushes, not harvests).
- Instrument lesson for the NEXT run: the ledger needs TWO
  more recorders before it can close — (a) a stockSurplus
  recorder (the fourth inflow door: villager shared surplus
  → 'Foraged food' 200-kcal units, game.js ~28794), and (b)
  a direct-pantry-consumption recorder (NPC pantry eating,
  alien pantry raids, Light Fingers pantry lifts — all of
  which bypass pantryDraw). Until those exist, dried-channel
  residuals will stay negative and generic residuals
  positive, and no bar tightening will fix that — it is a
  coverage gap, not a threshold problem.
- Definition lesson: the prereg's draw definition
  (pantryDraw records only) is now known to miss real
  pantry outflows. The NEXT run's prereg should define draws
  as pantryDraw records PLUS the direct-consumption recorder
  above, and state that explicitly — the change belongs in
  the next prereg, not retrofitted into this verdict.
- Attribution correction (recorded here, not hidden): spoilvol's
  claim that Foraged food "holds the village's STARTING
  pantry stock" is wrong in mechanism. Opening stock is
  staples (Rice, Dried beans, Dried meat, Canned soup,
  Peanuts — 47,250 kcal). The Foraged food gap is ongoing
  stockSurplus pushes. Spoilvol's NUMBERS are unaffected;
  only its explanation of the generic channel changes, and
  the next run's prereg should cite stockSurplus, not
  starting stock, for that channel.
- In-place preKcal lesson: a wrapper that snapshots around
  a whole duty call must define converted-portion kcal
  (post.units × pre.kcalEach), not whole-stack kcal, whenever
  the duty can split the stack inside the same call. This
  run's fix commit (e75b4fb65) is the precedent; future
  duty-wrapping recorders should state the portion rule in
  their prereg.
- Balanced panel (MEASUREMENT.md §15): NO comparison exists —
  this arm changes no lever and no game code, so there is no
  before/after to panel. The det-gate (leg 1) is the
  before/after comparison: identical records with the
  instrument off vs on. The before/after that DOES exist is
  instrument before/after: spoilvol's ledgers without the
  transformation path vs this run's with it — 9826 LQ 0.11%
  → 0.01%, and 3 focal family-seeds now close exactly.

## Out-of-arm observations (for the coordinator's sim-findings backlog;
not chased, not edited into the backlog from this worktree)

- stockSurplus is a fourth pantry door (game.js ~28794):
  villager shared surplus → 'Foraged food' 200-kcal units,
  bypassing all three recorded doors; the next ledger arm
  must record it before judging the generic family.
- Direct pantry consumption bypasses pantryDraw (NPC pantry
  eating, alien pantry raids, Light Fingers pantry lifts):
  the next ledger arm must record it before judging dried
  channels.
- Spoilvol's Foraged-food "starting stock" explanation is
  corrected: opening stock is staples (47,250 kcal); the
  generic gap is ongoing surplus pushes.
- Single-cook dependency: one cook does nearly all racks
  work per village (Wilhelm 139/139 on 9825, Hannah 101/107
  on 9827) — if that cook dies, the racks presumably go
  quiet; untested, worth a look.
- Sickness remains the top death cause on this band (17/38),
  as in spoilvol — same shape, same band, no change.

## Reproduction check (this run)

- Sweep scripts/sweep-driedpath-b.js ran 8 pilot seeds, 100d,
  competent-nofeast; corpus at
  evidence/2026-10-26/sim-driedpath-b-corpus/ (8 files, pure
  JSON).
- Analyzer scripts/analyze-driedpath-b.js prints per-seed
  family ledgers, transformation census, GO legs, wall
  numbers, and the sense block.
- Proof scripts/test-driedpath-b.js green in this worktree,
  exit 0: corpus validity (8 files, policy fields, no
  truncation), det-gate byte-identical (plus corpus-9820
  count reproduction: 255/1249/4), independent leg-2
  recomputation (seeds=8, totPost=774,536, linkedPost=
  774,536), verdict follows from legs (NO-GO, leg2 pass,
  leg3 fail, leg4 fail), spoilvol-corpus reproduction (zero
  dried inflow records on all 8 seeds), and hygiene (0 src/js
  files modified, 0 sibling capture files modified). No jest
  was run (nothing to test in jest — the proof is node, not
  jest). No [needs-eyes]: this lands a measurement, not a
  player-visible change.
- No game-code change: zero src/js files touched. Files in
  this run's commits: prereg commit 2928ecadf
  (scripts/driedpath-capture.js, scripts/sweep-driedpath-b.js,
  evidence/2026-10-26/sim-driedpath-b-prereg.md), instrument-
  fix commit e75b4fb65 (scripts/driedpath-capture.js), plus
  the evidence commit (scripts/analyze-driedpath-b.js,
  scripts/test-driedpath-b.js,
  evidence/2026-10-26/sim-driedpath-b.md, and the 8 corpus
  files).
- Infrastructure notes (loud, per the flap/clobber rules):
  the documented safe-commit index-clobber variant hit on
  BOTH commits (committed files showing staged-as-deleted /
  stale-index entries in the worktree's main index, worktree
  files byte-identical to HEAD, verified by hash-object).
  Repaired per the documented recipe (git update-index
  --cacheinfo with the HEAD blob per file); after repair
  `git status --short` shows only the intended untracked
  files and `git diff HEAD` is empty. Both commits verified
  correct (message + file list + blob hashes). No ref surgery
  was performed at any point. No EPERM flap hit this run.

## Verdict (judged against the pre-registered bar, not re-scored): NO-GO

Leg 1 (det-gate byte-identical) and leg 2 (coverage 8/8, 0
unlinked, 100% linked) pass; leg 3 fails (0/8 seeds, pooled
90.42% vs the 1% bar) and leg 4 fails (8.78% vs the 2% bar).
The transformation path itself is captured completely — the
ledgers fail because two more pantry doors are unrecorded
(stockSurplus in, direct pantry eating/raids/lifts out), not
because the racks escape measurement. The next ledger arm
needs those two recorders first; the confirm band 9768–9779
is unspent.
