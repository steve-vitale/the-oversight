# sim-gardenpool-b — GARDEN-POOLING TIMING: PILOT GO + CONFIRM GO

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261102T0330Z,
axis food-economy, arm sim-gardenpool-b (0047Z next blank #1).
Worktree sim-gardenpool-b, branch sim-gardenpool-b. This worker
does NOT push, bump, verify live, or merge into master; the
coordinator merges. Status to coordinator: committed on branch,
PILOT GO + CONFIRM GO — ready for coordinator merge (see
Confirm section and the landing-value recommendation).

## Verdict: PILOT GO — all eight prereg bars pass

Prereg: evidence/2026-11-01/sim-gardenpool-b-prereg.md (commit
e468cec17, BEFORE any judged sim). Judged exactly against the
prereg — NO re-score. Fresh 8-seed pilot band 74001-74008, 30d
competent, DEPOSITGATE=0, identical seeds both legs; baseline
leg = policy competent-entrywindow-b on BASE code, armed leg =
same policy on GARDENPOOL code (harvestGarden change only,
carry base still 20). Driver + analyzer reused verbatim from
the entrywindow arm; garden diagnostics by
scripts/analyze-gardenpool-b.js --judge (prints PILOT GO).

| Bar (prereg) | Baseline (base code) | Armed (gardenpool) | Bar | Result |
|---|---|---|---|---|
| (0) Regime guard: baseline pack_full total | 17 | — | >= 4 | PASS |
| (1) pack_full band total | 17 | 3 | <= 0.5 x baseline (= 8.5) | PASS, -82% |
| (2) Day-start overload days (day-start packKg >= cap) | 10 | 0 | < baseline | PASS |
| (3) mean daily haul, band mean-of-means | 963.5 kcal | 1040.2 kcal | >= baseline | PASS, +76.7 |
| (4) away day-ends, band total | 12 | 7 | <= baseline | PASS |
| Shape veto: no seed armed awayE >= 10 AND >= baseline+10 | — | none | none | PASS |
| (5) starvation deaths, band total | 0 | 0 | <= baseline | PASS |
| (6) Mechanism gate: armed pooled/deferred event fired | — | 21 pooled lines, 4 deferred lines, 127,705 kcal pooled | >= 1 event | PASS |

Diagnostics: failed-trip share 0.083 -> 0.046; day-start mean
packKg 8.5 -> 7.7 kg, max 37.7 -> 19.8 kg; median survival
30 = 30; max wave 2 = 2; collapses 0 = 0. Food reaching the
village is UP, not merely preserved: return-pool unload
159,995 -> 63,405 kcal PLUS garden-pooled 127,705 kcal =
191,110 kcal armed vs 159,995 baseline (+31,115). The unload
drop is an accounting shift (garden food now pools at
harvest, kind 'other', instead of at the next return), not a
loss — haul is up and pooled kcal exceeds the unload drop.

## Per-seed table

Per seed: pf = pack_full attempts, haul = seed mean daily
haul, surv = daysAlive, starv = starvation deaths, awayE =
away day-ends, overload = day-start overload days, dsMean /
dsMax = day-start packKg mean / max, pooled = garden-pooled
kcal (armed only).

| seed | base pf | base haul | base awayE | base overload | base dsMax | armed pf | armed haul | armed awayE | armed overload | armed dsMax | armed pooled |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 74001 | 0 | 239.2 | 7 | 0 | 17.4 | 0 | 239.2 | 7 | 0 | 17.4 | 0 |
| 74002 | 2 | 1259.5 | 0 | 2 | 36.9 | 0 | 1274.5 | 0 | 0 | 17.4 | 29,070 |
| 74003 | 5 | 887.1 | 0 | 1 | 20.9 | 3 | 914.9 | 0 | 0 | 19.8 | 15,750 |
| 74004 | 5 | 1672.4 | 0 | 2 | 30.8 | 0 | 1787.7 | 0 | 0 | 17.7 | 27,120 |
| 74005 | 0 | 1013.3 | 0 | 0 | 10.1 | 0 | 1013.3 | 0 | 0 | 10.1 | 0 |
| 74006 | 5 | 810.6 | 0 | 3 | 37.7 | 0 | 815.0 | 0 | 0 | 16.8 | 31,140 |
| 74007 | 1 | 1037.8 | 0 | 1 | 36.1 | 0 | 1144.0 | 0 | 0 | 19.7 | 4,500 |
| 74008 | 1 | 787.8 | 5 | 1 | 33.5 | 0 | 1133.0 | 0 | 0 | 19.5 | 20,125 |
| BAND | 17 | 963.5 | 12 | 10 | 37.7 | 3 | 1040.2 | 7 | 0 | 19.8 | 127,705 |

No seed worsens on pack-full. Two seeds are byte-identical
on haul (74001, 74005 — the garden gate never binds there).
74001 is unchanged on every column (awayE 7 both legs): a
pre-existing stranding shape, untouched by this arm,
reported not vetoed (armed 7 < 10). 74008's away ends fall
5 -> 0 and its haul rises 787.8 -> 1133.0 — unblocking the
pack unblocks the scholar's returns.

## The residual: 74003's 3 pack-full attempts are standing load, not garden

74003 is the only seed with armed pack-full attempts, and
all 3 are attempt-1 with packKgBefore equal to that day's
day-start packKg (19.75, 19.35, 19.35 kg against a 20 kg
cap) — the scholar starts the day already within one
forage-estimate (max 3.6 kg) of the cap, AFTER that
evening's garden harvest pooled to the pantry (day 27/28/29
pooled lines on this seed). The garden component is gone;
what remains is kept road food + gear + materials that
never pool because they are not finished food. This is the
remainder the confirm's capacity recommendation must judge:
standing-load bind on one seed, not a garden bypass. It is
NOT a reason to re-open the garden mechanism — the
mechanism did its job on this seed (5 -> 3, overload
days 1 -> 0, haul up).

## The change (harvestGarden only, base cap still 20)

Per ripe plot, at Haven (the garden is behind the hall):

1. `canCarry(plotKg)` -> pack, as before.
2. Else finished food (kcalEach > 0 AND NOT isUnprocessed,
   the exact return-pooling definition) AND the plot's kcal
   fits the pantry's remaining room -> `depositPantryPieces`
   with return pooling's field contract, narrated with pack
   state, load (units x name, kg, kcal), and destination.
3. Else -> DEFER: no push, no `gardenHarvestTaken` (the
   plot stays ripe), narrated with pack state, load, and
   the reason (needs identifying/preparing, or the pantry's
   exact remaining kcal). Deferred plots narrate once per
   day (workGarden calls harvest twice per counterPlay).
   All-deferred harvests spend no action time (no tick).

Proof test scripts/test-gardenpool-b.js: 10/10 green
(fitting plot -> pack; overflowing finished plot -> pantry
with exact kcal; overflowing unknown plot -> deferred, still
ripe; pantry-full finished plot -> deferred, still ripe;
deferral narrates once per day; code anchors; carry base
still 20). `node --check` clean on game.js.

GRAMMAR NOTE (disclosed): after the pilot legs ran, the
pooled/deferred lines gained verb agreement (multi-plot
"go"/"stay" vs single "goes"/"stays") and the analyzer's
narration regexes widened to match ("straight to the
pantry", "in its bed"). Zero behavior delta — the proof
test re-ran 10/10 and the pilot re-judged PILOT GO on the
same corpora with identical counts. The confirm legs run on
the final code.

## Sense: the lines read like a person managing a pantry, not a counter

Pooled (74002): "Your pack is full (9.7 kg of 20 kg) — 113x
Burdock (11.3 kg, 10170 kcal) goes straight to the pantry
instead." Pack state, load, destination, all named — the
takeFromPantry honesty bar, met. The 0047Z complaint (a
refusal that never names the load) is closed for garden
overflow: the load is named in kg AND kcal.

Deferred, and the story that proves it is not a disappearance
(74007, pantry ~150k kcal — a rich village at its pantry
cap): day 27-28 both plots defer, honestly ("the pantry
has only 0 kcal of room", then "only 199 kcal of room");
day 29 the pantry has drained enough that Lamb's Quarters
pools (4500 kcal) while Blackberry still defers ("only
2701 kcal of room"); day 30 Blackberry still defers
("only 5638 kcal of room") — still on its plant when the
window ends, not lost, not silently eaten. This seed has
ZERO pack-full forage failures on the armed leg: deferral
protected foraging while the pantry was full. A follow-up
blank, not this arm's scope: on rich seeds the pantry cap
itself becomes the garden bottleneck (see sim-findings
line below).

Baseline contrast (74006 baseline): day-start 37.7 kg
after a garden night, then a day of pack-full refusals with
no line ever naming the load. Armed 74006: day-start max
16.8 kg, pack-full 5 -> 0. The behavior (try, fail, go
home, pool) was sound in 0047Z; now the morning after a
harvest is no longer a lost day.

## Wall numbers (in-window only)

This 30d pre-seat window cannot measure national / table /
wins: no seed can reach national in 30 days, and none does
on either leg. In-window: median survival 30/30, max wave 2
both legs, collapses 0 both legs, vests 0 both legs.
National 0, table 0, wins 0 IN THIS WINDOW ONLY — not a
wall movement claim. Full seat 0 / wave 5 reached 0 stand
as last measured (Loop A lane) — UNCHANGED in kind by
this run.

## Balanced panel (section 15, context only)

Panel runs its own substrate and compares policies, not
code variants, so it cannot judge this game-code arm. Run
on the ARMED code (see sim-gardenpool-b-panel-summary.md):

```
node scripts/balance-panel.js --out /tmp/gardenpool-panel-b \
  --policies competent,competent-entrywindow-b \
  --seeds 74001,74002,74003,74004,74005,74006,74007,74008 \
  --days 30 --par 4
```

16 cases, 0 reused. Validity: sourcesStable true,
neutrality matched on both policies (proof seed 74001,
observer on/off identical), zero warnings, zero observer
errors. Raw panel retained as
evidence/2026-11-01/sim-gardenpool-b-panel.json.gz; summary
in evidence/2026-11-01/sim-gardenpool-b-panel-summary.md.

| | competent | competent-entrywindow-b |
|---|---|---|
| cases | 8 | 8 |
| endReason survived | 8 | 8 |
| won | 0 | 0 |
| national | 0 | 0 |
| table (entered) | 0 | 0 |
| maxRank | village | village |
| maxArc | 3 | 3 |
| waveReach | 2 (8x wave 2) | 1–2 (1x wave 1, 7x wave 2) |
| vests | 0 | 0 |

Panel numbers are CONTEXT, never verdict: the panel runs
its own substrate and its survival/death definitions
differ from the driver's judged bars. The two policies are
near-identical on this band under garden pooling. No wall
movement is shown or claimed: in a 30-day pre-seat window
national / table / wins are not reachable, and none is
reached on either policy.

## Metric review (for the NEXT run, never this one)

- Day-start overload bar (2) behaved as designed: 10 -> 0,
  tracking the mechanism (garden load sets the day-start
  number), not standing load. Keep as a bar.
- The away shape veto did not fire (no seed near it); the
  74001 pre-existing stranding (7 both legs) stays
  reported, not vetoed — correct.
- Panel decision strings are not bars (0047Z redeploy
  lesson): driver bars above are the judge.
- If the confirm's residual pack-full is still
  standing-load-shaped on several seeds, the next prereg
  should judge a standing-load lever (capacity value or a
  materials/road-food pool) as its own arm, not re-score
  this one.

## Confirm: CONFIRM GO — all eight prereg bars pass on a fresh band

Fresh 12-seed confirm band 74101-74112, 30d competent,
DEPOSITGATE=0, identical seeds both legs; baseline leg on
BASE code (game.js temporarily reverted to the prereg
commit, then restored byte-identical — hash verified
50b4f2f5 == HEAD blob, proof test re-ran 10/10), armed leg
on GARDENPOOL code. Judged by
scripts/analyze-gardenpool-b.js --judge --confirm (same
bars, same computation as the pilot judge; --confirm only
relabels the verdict string).

| Bar (prereg) | Baseline (base code) | Armed (gardenpool) | Bar | Result |
|---|---|---|---|---|
| (0) Regime guard: baseline pack_full total | 24 | — | >= 4 | PASS |
| (1) pack_full band total | 24 | 1 | <= 0.5 x baseline (= 12) | PASS, -96% |
| (2) Day-start overload days | 10 | 0 | < baseline | PASS |
| (3) mean daily haul | 973.4 kcal | 1012.6 kcal | >= baseline | PASS, +39.2 |
| (4) away day-ends, band total | 12 | 12 | <= baseline | PASS (equal, not worse) |
| Shape veto: no seed armed awayE >= 10 AND >= baseline+10 | — | none | none | PASS |
| (5) starvation deaths | 0 | 0 | <= baseline | PASS |
| (6) Mechanism gate | — | 16 pooled lines, 114,060 kcal pooled | >= 1 event | PASS |

Diagnostics: failed-trip share 0.067 -> 0.036; day-start
mean packKg 7.3 -> 7.0 kg, max 40.4 -> 24.8 kg; median
survival 30 = 30; max wave 2 = 2; collapses 0 = 0. Food
reaching the village is UP again: return-pool unload
161,020 -> 73,080 kcal PLUS garden-pooled 114,060 kcal =
187,140 kcal armed vs 161,020 baseline (+26,120).

### Confirm per-seed table

| seed | base pf | base haul | base awayE | base overload | armed pf | armed haul | armed awayE | armed overload | armed pooled |
|---|---|---|---|---|---|---|---|---|---|
| 74101 | 1 | 1966.8 | 3 | 0 | 1 | 1966.8 | 3 | 0 | 0 |
| 74102 | 0 | 1345.8 | 9 | 0 | 0 | 1346.1 | 9 | 0 | 3,000 |
| 74103 | 0 | 1134.7 | 0 | 0 | 0 | 1134.7 | 0 | 0 | 0 |
| 74104 | 0 | 795.0 | 0 | 0 | 0 | 795.0 | 0 | 0 | 0 |
| 74105 | 0 | 457.0 | 0 | 0 | 0 | 457.0 | 0 | 0 | 0 |
| 74106 | 0 | 514.7 | 0 | 0 | 0 | 514.7 | 0 | 0 | 0 |
| 74107 | 1 | 502.9 | 0 | 1 | 0 | 557.1 | 0 | 0 | 9,750 |
| 74108 | 4 | 367.3 | 0 | 3 | 0 | 450.7 | 0 | 0 | 5,400 |
| 74109 | 4 | 988.6 | 0 | 2 | 0 | 894.1 | 0 | 0 | 28,500 |
| 74110 | 0 | 1165.4 | 0 | 0 | 0 | 1165.4 | 0 | 0 | 0 |
| 74111 | 12 | 1402.5 | 0 | 3 | 0 | 1782.2 | 0 | 0 | 47,760 |
| 74112 | 2 | 1040.5 | 0 | 1 | 0 | 1087.5 | 0 | 0 | 19,650 |
| BAND | 24 | 973.4 | 12 | 10 | 1 | 1012.6 | 12 | 0 | 114,060 |

No seed worsens on pack-full. 74111 is the clearest win
(pack-full 12 -> 0, haul 1402.5 -> 1782.2). Away ends are
identical per seed on both legs (74102: 9, 74101: 3, rest
0): pre-existing rotation stranding shapes, untouched by
this arm — which is exactly what the shape veto is for,
and it correctly does not fire.

### The confirm residual is not garden-shaped at all

The single armed pack-full attempt (74101, day 28,
attempt 2, grove tile) is BYTE-IDENTICAL on both legs:
same day-start packKg (18.58/20), same attempt ordinal,
same tile, same haul (1966.8 both legs), zero garden
pooled kcal on this seed. It is a standing-load / trip
case the garden mechanism never touches — not a garden
remainder. The garden bypass is closed on this band:
every garden-shaped pack-full day in the baseline (74107,
74108, 74109, 74111, 74112) is gone on the armed leg.

### 74109's haul dip is the accounting shift, not a loss

74109's haul falls 988.6 -> 894.1 while its forage
successes RISE (25 -> 27) and its pack-full attempts fall
(4 -> 0). What moved: baseline day 26/30 harvest 300
blackberries (30 kg) into the pack, and those berries
count in meanDailyHaul when they pool at the next return;
armed, the same berries pool at harvest (28,500 kcal
pooled on this seed) and meanDailyHaul by definition does
not count harvest-time pooling. The band haul bar still
passes (+39.2) DESPITE this definitional headwind, and
village food is up (+26,120). The dip must not be read
as food lost.

### Landing-value capacity recommendation: LAND base 20 (no cap change)

Stated explicitly, as the prereg requires. The garden
fix achieves MORE than the CAP40 screen did, without
touching the live default: CAP40 on its band, 18 -> 4
pack-full; garden-pooling on the pilot band, 17 -> 3, and
on the harder confirm band, 24 -> 1. The residual on both
bands is standing-load-shaped (pilot 74003: 3 attempts
starting the day at 19.35-19.75/20 kg after the garden
pooled; confirm 74101: 1 attempt identical on both legs)
— kept road food + gear + materials, not garden produce.
Flipping the live carry default 20 -> 40 for 1-3 residual
standing-load attempts per band would be a game-wide
default change judged on no standing-load evidence. So:
LAND the garden-pooling change with base 20 unchanged;
the CAP40 branch stays held (its screen value is
superseded, not landed); any future capacity value is a
separate standing-load arm's job, not this confirm's.
No [needs-eyes]: the new lines are narration honesty
(pack state + load + destination), not a feel change
needing Steve's phone — though the pooled/deferred lines
are player-visible and will read on the next deploy.

## Infrastructure (loud, per task)

- SAFE-COMMIT INDEX CLOBBER (known class) hit the prereg
  commit e468cec17 (staged deletion + untracked copy of
  the same file after a correct commit). Repaired with
  `git update-index --add --cacheinfo` from the HEAD blob,
  then verified `git status --short` and `git diff HEAD`
  empty before any sims.
- worktree-heartbeat.sh sim-gardenpool-b hung once on
  registry-lock contention (Loop A concurrent
  registration, same class as 0047Z); killed, retried
  successfully within the same hour.
- No EPERM flap on this arm. No sibling tree or branch
  touched (Loop A trees and held Loop B branches
  read-only via `git show` only, per task).
- check.js --quick: 284 passed, 6 failed in 733s, run
  on the gardenpool code between the pilot and confirm
  legs. The 6 failures (measurement-proof-update,
  measurement-workflow, mobile-combat-cadence,
  occupation-panels, phone-frame-proof,
  establishment-r20-fixes-20261020) were then re-run
  individually on BASE code (game.js reverted to the
  prereg commit): all 6 fail identically there —
  pre-existing on this master, none caused by
  gardenpool. (Prior arms measured 283/7; capable-bot,
  previously failing, passes now — master moved under
  the run.) The new proof test is not in check.js's
  quick list (290 scripts both before and after); it
  runs standalone, 10/10, before and after the revert
  round-trip. Zero mentions of harvestGarden /
  carryCapacity / packWeight in the check log's failure
  section beyond the pre-existing set.
