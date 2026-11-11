# Gardening — first numbers — EVIDENCE
(arm sim-garden-b, run fleshout-loop-b-20261111T0025Z, Loop B; Coverage
Program Tier 2 #2, Steve order 2026-11-10 11:11 CST "Measure all so we
can improve on all gaps")

Adoption note: the coordinator died after the pilot ran. This file was
written by the adoption worker from the stranded pilot corpus
(`perseed-garden-b/`, 16 files) and the regenerated summary
(`garden-summary-garden-pilot.json`). Every number below was re-checked
against the corpus by the adoption worker; the analyzer was re-run and
reproduced the summary byte-identically (sha256
d6ca9fedafb49ab2d87758c400718b0ac792d35f6f6d347e82f3723228b73a24
before and after).

## Prereg
`evidence/2026-11-10/sim-garden-b-prereg.md` (committed dcc2adbb9).
Band 180217–180224, 8 seeds, 150d death-aware horizon, competent
policy, control + neutral legs. Base at spawn: master 6d7212cda.

## GO verdict: GO (all-true)
The prereg GO bar is instrument validity + complete first-numbers
capture. Judged strictly against it (see Metric review):

| GO clause | Result | How verified |
|---|---|---|
| 1. Every harvest classified by crop + path; none 'other', none forced | PASS | 126 harvests, 0 'other' (`harvestOtherTotal: 0`); every harvest carries pid + player-harvest/npc-duty |
| 2. Every wrapped method's call path verified live in the proof miniature or marked dead | PASS | 13 mine-wraps live; 4 mine-wraps dead and marked dead below; 8/9 capture wraps live, 1 dead and marked |
| 3. Neutrality 8/8 (days + end pantry kcal + death count identical, instrument ON vs OFF) | PASS | Re-checked independently from the raw per-seed files: 8/8 matched exactly (days 150/137/150/150/39/150/98/75; pantry 0/0/1209/24237/0/13067/19042/0; deaths 83/106/61/82/29/69/56/59) |
| 4. Instrument errors 0 on all seeds, all legs | PASS | `instrumentErrorsTotal: 0` |
| 5. Complete first-numbers capture, metrics 1–7, every metric counted or explicitly marked unmeasurable | PASS | Tables below cover metrics 1–7; unmeasurable items listed under "Unmeasurable (confirmed)" |

GO makes NO landing claim and spends NO confirm band: there is no
lever here to land. Zero src/js changed in this arm.

## Dead wraps (marked dead; their zeros are NEVER evidence)
- Mine: `tendGarden`, `cookFood`, `shellNuts`, `eatOne` — no live call
  observed in the pilot. Player tending and garden food prep
  (shelling nuts / cooking garden food) are therefore UNMEASURED in
  this pilot, not zero. (`tendsPlayerTotal: 0` and `prepsByMethod: {}`
  must not be read as "the player never tends / never preps".)
- Capture: `assignTask` — duty-assign counts (`assignsTotal: 0`) are
  unmeasured, not zero. Keeper sets (128) and keeper turns (3,750)
  were captured through `setGardenKeeper` / `gardenKeeperTurn`
  instead.
- Live wraps (13 mine + 8 capture): tele, makePlot, pantryDraw, eat,
  creditDeed, gardenMaintain, noteDeed, teachPlant, sowPlot,
  cultivateGarden, gardenHarvestTaken, harvestGarden, reclaimGarden;
  gardenKeeperTurn, resolveOneAssignment, villagerSowPlot,
  setGardenKeeper, stockPantry, depositPantryPieces, pantryAdd, say.

## Capture-quality notes (limits on what the numbers below can say)
- Cultivate attribution is blank: all 282 casts record vid null and
  source null (`cultivatesBySource: {"?:player": 564}` raw calls).
  The calls arrive through the ability engine, not a vid-carrying
  call, so "who cultivated with what" is unmeasured. Counts, beds
  affected (1,946) and growth are measured.
- Teach path attribution is a raw frame name: all 108 teachPlant
  calls record path `Object.w` (first stack frame), not a classified
  caller path. The prereg's "sowPlot -> guided-sow, else first
  frame" classification did not resolve to anything readable.
- NPC sow failures carry no reason: failed `villagerSowPlot` calls
  return null with no message. The instrument records the attempt
  (day + vid) but the engine never says why it failed.
- Ripe plot-days read 0 on all 8 seeds despite 126 harvests: the
  daily snapshot runs before the day's ripening/harvest, so it never
  catches a ripe plot. Snapshot timing artifact, not a game fact.
- `practiceStepsEnd` covers only villagers present in the final
  daily snapshot (the dead and departed drop out of it);
  `practiceMax` (max reps seen across snapshots) is the complete
  figure.
- Nominal-vs-deposited harvest gap: 487,650 nominal kcal harvested
  vs 393,573 kcal reaching the pantry through garden doors — a
  94,077 kcal gap (packed food eaten from the pack, spoilage, and
  unpooled harvests). Labelled UNRECONCILED, not waste.

## Metric 1 — Gardening events (pooled, 8 seeds, 949 village-days)
| Action | Count | Notes |
|---|---|---|
| makePlot (beds broken) | 33 calls, 32 ok | 4 beds on every seed (policy target min(4, capacity)); 1 make failed, reason unrecorded |
| sowPlot (player) | 315 ok, 0 guided | By crop: burdock 67, purslane 43, cattail 40, blackberry 31, spicebush 26, muscadine 24, wild_onion 23, wild_strawberry 13, mayapple 13, chickweed 11, wood_sorrel 10, sassafras 11, lambs_quarters 2, staghorn_sumac 1 |
| villagerSowPlot (NPC) | 305 attempts, **2 ok** | Both successes Cattail, seed 180221, days 11–12, both by farmers (Sierra, Liam). See headline finding below. |
| gardenMaintain (NPC tend) | 614 calls, 1,779 plots tended | Every live plot, every duty day |
| tendGarden (player) | UNMEASURED (dead wrap) | — |
| harvestGarden (player calls) | 74 calls → 120 player harvests | 120 of 126 total harvests are player-harvest |
| gardenHarvestTaken (all harvests) | 126 | By crop: purslane 55, wild_onion 27, blackberry 20, wild_strawberry 10, cattail 7, sassafras 5, burdock 2 |
| reclaimGarden | 278 ok | 274 policy + 4 duty; dead beds cleared steadily all run |
| cultivateGarden | 564 raw calls = 282 casts, 1,946 beds affected | Double-counted internal + policy per cast; casts are the real figure |
| keeper sets / keeper turns | 128 / 3,750 | A keeper was set on every seed; turns run ~daily |
| duty resolutions | 647, of which **338 throttled (52.2%)** | Throttle redirects to wood/water/stone after maintenance; compare sim-gardenstate-b's 89.3% (different denominator: share of NPC garden work, not resolutions) |
| duty assigns | UNMEASURED (dead capture wrap) | — |
| gardening deeds credited | 559 | Across 51 villagers |

## Metric 2 — Yield (nominal kcal, per gardenHarvestTaken)
| Crop | Harvests | Nominal kcal | Units |
|---|---|---|---|
| blackberry | 20 | 195,000 | 3,000 |
| purslane | 55 | 110,160 | 3,672 |
| cattail | 7 | 75,840 | 632 |
| wild_onion | 27 | 50,610 | 1,446 |
| wild_strawberry | 10 | 39,600 | 880 |
| burdock | 2 | 9,540 | 106 |
| sassafras | 5 | 6,900 | 345 |
| **Total** | **126** | **487,650** | **10,081** |

- By path: player-harvest 472,530 kcal (120 harvests); npc-duty
  15,120 kcal (6 harvests). **The scholar brings in 97% of garden
  kcal; the NPC duty brings in 3%.**
- Origin: ALL 487,650 kcal "assisted" (cultivate magic on the bed);
  **zero ordinary (unassisted) harvests** in the pilot. Legacy
  kcal 0. Weeds-halved: 1 harvest, 2,275 kcal.
- Pantry-door garden inflow: 393,573 kcal (deposit door 380,065 +
  stock door "Garden harvest" 13,508). Peak pantry garden stock
  134,974 kcal summed across seeds; peak pack garden stock 54,350.
  Garden stock was present in the pantry on 231 of 949 days, in the
  pack on 84.

## Metric 3 — Who gardens
- Keepers (most keeper-days): Meera Reddy, a dentist, 129 days;
  Dmitri Sokolov, appliance repair tech, 71; gen_v43fp0i, wild-food
  forager, 57; gen_2f2hgkl, piano tuner, 53; Lena Ruiz, ER nurse, 52;
  Emma Larsen, veterinarian, 41. The keeper is picked by
  known-plants count + magic, not by occupation — dentists and
  nurses keep the beds, and that is by design.
- Duty holders (most resolutions): Meera Reddy 67, Emma Larsen 42,
  Lena Ruiz 36, gen_2f2hgkl 30, Lucas Brown (police officer) 30.
- Sowers: the scholar sows (315 ok). NPCs try 305 times and succeed
  twice. Only 3 of the 305 NPC attempts were by a green-hands
  occupation (all "farmer"); the rest were veterinarians (36),
  dentists (21), musicians (18), welders (16), line cooks (16),
  wild-food foragers (15), nurses (13), and 25 other occupations.
  The duty hands the sow attempt to whoever holds it, and the
  engine's green-hands gate turns nearly everyone away silently.
- Practice: 16 villagers reached 8+ garden practice reps (step 1);
  max reps 36 (Emma Larsen, veterinarian — did not survive to her
  seed's final snapshot). End steps among villagers present at the
  final snapshot: step 1 at best (Sigrun, Miguel, Meera, visjoin_129,
  visjoin_128, Lena Ruiz); nobody reached step 2 there.
- Green Thumb / Green Whisper at end: 4 of 8 seeds hold garden
  magic (180218 Whisper L1; 180220 Whisper L1 + Thumb L3; 180223
  Whisper L1; 180224 Whisper L1 + Thumb L2 + Cornucopia L1).
  Scholar magic drove all 282 cultivate casts.

## Metric 4 — Skill gains + teaching
- Scholar plant knowledge (gardenable pids known): 24 entries
  summed across seeds at start (2–4 per seed) → 199 at end (12–33
  per seed). The scholar learns the gardenable flora fast; the
  garden is also a knowledge engine.
- Villager known-plants counts: up to 126 (Nora Wilson), 123 (Lucas
  Brown) — villagers know far more plants than the scholar starts
  with; knowledge is not the bottleneck, the sow gate is.
- teachPlant: 108 calls, 107 outcome null, **1 taught**
  (Dmitri Sokolov → blackberry, seed 180217, day 56). The 107 nulls
  are ambient plant-ID during hauls (acorn, hickory, knotweed, …),
  not garden teaching. 0 guided sows in the pilot, so guided-sow
  teaching never fired. Villager→villager garden teaching:
  confirmed absent — no code path exists besides teachPlant to the
  scholar, and the pilot shows no villager-villager path.
- foodXp gardener task: 0 keys on all 8 seeds — confirmed absent
  (no 'gardener' task exists; 'spotter' covers plant ID).

## Metric 5 — Garden stock over time
- Plot-days pooled: beds 3,674; planted 2,812 (77%); unplanted 501;
  dead 361 (10%); ripe 0 (snapshot artifact, see above).
- Beds peak 4 on every seed (policy four-bed target; Haven tier
  capacity 2/4/6/9 never exercised past 4 — the policy, not the
  game, caps it).
- Pantry garden stock peaked at 10,800 kcal on seed 180217 and
  134,974 summed; it sat at 0 on 718 of 949 days — garden food is
  a pulse (harvest day), not a standing stock.

## Metric 6 — Garden-vs-forage kcal share (pantry inflow)
- Total pantry inflow pooled: 1,736,855 kcal.
- Garden inflow (stock "Garden harvest" + deposit door with
  gardenShares): 393,573 kcal = **22.7%** of all pantry inflow.
- Foraged food: 371,465 (21.4%). Fish catch: 441,799 (25.4%).
  Expedition haul: 219,657. Tribute grain (all villages): ~103,000.
- Garden is the second-largest single pantry source on this panel —
  ahead of foraging, behind fish — but remember the share counts
  pantry inflow only; player-packed garden harvests (94,077 kcal
  nominal gap, partly eaten from the pack) are NOT in it.
- Eaten: the scholar ate 17,783 garden kcal from the pack (3.7% of
  the 485,541 kcal they ate; tele reconciliation 483,090 vs wrap
  485,541, diff 2,451 = 0.5%). The village meal drew 206,563 garden
  kcal from the pantry (6.7% of 3,092,654 drawn). So most garden
  kcal reaches the pantry and is drawn by the meal, but garden food
  is a small share of what anyone actually eats — the meal draws
  mostly non-garden food.

## Metric 7 — Wall numbers (per seed)
| Seed | Days | End | Scale | Max wave | Standing | Deaths | Harvest kcal |
|---|---|---|---|---|---|---|---|
| 180217 | 150 | survived | regional | 4 | 199 | 83 | 39,600 |
| 180218 | 137 | village-lost | regional | **5** | 395 | 106 | 195,000 |
| 180219 | 150 | survived | regional | 4 | 199 | 61 | 75,840 |
| 180220 | 150 | survived | regional | 4 | 199 | 82 | 114,930 |
| 180221 | 39 | village-lost | village | 3 | 0 | 29 | 0 |
| 180222 | 150 | survived | regional | **5** | 275 | 69 | 11,670 |
| 180223 | 98 | village-lost | regional | 4 | 199 | 56 | 50,610 |
| 180224 | 75 | village-lost | regional | 4 | 199 | 59 | 0 |

- Wins 0/8. National 0/8. Table 0/8. Wave 4 reached 7/8, wave 5
  reached 2/8 (180218, 180222). Median survival 150d (censored at
  the horizon; 4/8 villages lost before day 150). Standing median
  199; the 199 figure recurs on five seeds (a standing plateau —
  villages sit at 199 and do not climb past it on this panel).
- Arc II/III/IV reach: NOT measured by this instrument (no arc
  field captured). No arc claim is made.
- Deaths pooled: 545. Causes: villager combat 236, combat 99,
  expedition 94, the wild 63, monster 14, starvation 11, contest 6,
  arena 6, wound-that-wouldn't-close 4, sickness 4, the night 2,
  stranger 1, ambush 1, Gavel 1, thirst 1, dehydration 1, alien 1.
  Combat kills; starvation barely registers on this panel.

## Before/after (neutrality comparison — the only "before/after" a measurement arm has)
Control (instrument ON) vs neutral (instrument OFF), identical seeds:
8/8 matched exactly on days, end pantry kcal, and death count (see
GO table). The instrument does not perturb the game. There is no
lever before/after: this arm measures the base game under the plain
competent policy.

## Reachability verdict
- Waves 1–5: reachable in sims. Wave 4 on 7/8 seeds, wave 5 on 2/8.
  Nothing about gardening blocks wave reach; the villages that
  died, died to combat, not to hunger.
- Regional: 7/8. National / table / win: 0/8 — the scale wall is
  untouched by this arm and unmoved on this panel. Gardening feeds
  the village (22.7% of pantry inflow) but does not, on its own,
  push anyone past regional.
- Garden content reach: beds, sowing, tending, harvest, reclaim,
  cultivate magic, keeper — all exercised. Berries/woody first
  harvest: NOT reachable inside the 150d horizon by design (180d /
  365–730d maturity); the only berry harvests in the pilot are
  blackberry/wild strawberry/muscadine sown early and pulled forward
  by cultivate magic. Roots (90d) had one cycle in view; burdock
  harvested twice, 9,540 kcal.
- Vests: not measured by this instrument.

## Village assessment (plain words)
Four villages lived the full 150 days and four died, and the garden
was the same story in all eight: the scholar does the gardening.
The scholar breaks the ground, sows 315 times, harvests 120 of the
126 harvests, and pays for every single cultivate cast with their
own food. The villagers keep the beds alive — they water and weed
614 times, they stand as keeper for 3,750 keeper-days, they clear
278 dead beds — but they almost never put a seed in the ground
themselves. Twice in 949 village-days a villager sowed a crop, both
times a farmer, both times cattail, both times on the shortest-lived
seed. Everyone else tries and is turned away without a word: the
dentist, the vet, the nurse, the musician all take the duty, walk to
the beds, and come back empty-handed. The garden still feeds the
village — about a fifth of everything in the pantry, more than
foraging — but it feeds it as the scholar's project with villagers
as groundskeepers, not as a village that gardens together.

The people who thrived are the ones who knew plants and held the
magic: Meera the dentist kept the beds 129 days and worked 67
duties; Emma the vet piled up 36 practice reps. The scholar's plant
knowledge exploded from a handful of plants to dozens. But nobody
became a gardener: practice steps top out at step 1, the food
system has no gardener task to grow into, and no villager ever
taught another villager anything about the beds. The village that
died fastest (seed 180221, 39 days) never harvested at all — its
two farmer sows on days 11–12 were the only NPC sows in the whole
pilot, and the village was gone before the cattail matured.

What was missing: a reason for a villager to sow (the green-hands
gate plus a duty that hands the job to anyone), a teaching path
between villagers, and any growth path for garden skill beyond the
first practice step. The beds themselves work; the people around
them don't, yet.

## Which blank this arm filled
- FIRST NUMBERS for everyday gardening under the competent policy:
  events by crop/action, yield by crop and path, who gardens,
  skill/teaching, garden stock, garden-vs-forage share. No earlier
  arm measured the base game's everyday gardening (earlier garden
  work measured the policy controller and the plot-state/throttle
  mechanism).
- Documented, not fixed (measurement arm, zero src/js): the NPC
  sow failure (2/305), the all-assisted harvest pattern, the
  teach-path absence, the practice-step ceiling, the standing-199
  plateau. Each is listed under Findings for backlog.

## Sense-testing (SENSE-TESTING LAW — read the lines, judge meaning)
Garden voice was sampled from the 1,529 captured garden lines (888
distinct). Quoted scenes:

- First sow (s180217 d1): "You break ground behind the hall — bed 1
  of 2, turned and ready. Sow seed to start a crop." Clear, honest,
  tells the player what to do next. Good.
- Keeper set (s180217 d2): "Dale will work the garden once each day
  while at Haven. Other orders take priority." Plain and true — and
  it is the only keeper voice in the corpus; keepers never speak
  about the garden again.
- Throttle redirect (s180217 d3, repeated with variation): "🌿 Dale
  checks the pantry before heading out — the shelves are full, ~6
  days of fresh on hand… leaves the harvest standing and turns to
  the stone pile instead. The pantry can't take more; the wild will
  keep." This is the best garden writing in the corpus: it names
  the reason, the alternative work, and the consequence. It varies
  (stone pile / wood run; 5–6 days of fresh), so it reads as a
  decision, not a stamp.
- Cultivate (repeated): "You coax 4 growing beds forward by 12 days.
  The next harvest carries the growth magic." Plus the cost line
  "(−200 kcal — food becomes green thumb.)" 63 times. The magic is
  voiced as the scholar's act every time — villagers never cultivate
  in voice, matching the counts (all casts are the scholar's).
- NPC tend (repeated report lines): "🌱 Meera waters and weeds the
  beds before taking up other work. The harvest can wait." / "🌱 Emma
  works the garden — watered, weeded, turned. Nothing ripe yet."
  These are report lines, not dialogue — expected, and they do name
  the worker, which is the minimum for the work to feel owned.
- Teach (s180217 d4): "Tashi presses something into your hand.
  'Knotweed Shoot — for what you did. Look for the leaves. You'll
  know it.'" Warm and specific — but it is plant-ID on a haul, not
  garden teaching. No garden-teaching scene exists in the corpus.
- Weed-death scene: NONE found. The closest is a journal line,
  "Journal: Trampled ground. The humble weeds win." Dead beds are
  cleared with "You clear a dead bed. Sow fresh seed to start a new
  crop. (40 kcal.)" 24 times — the death itself is never voiced.
  A crop dying after six weedy days passes without a word.

Judgment: the garden's voice is coherent and honest where it exists
— sowing, throttle, and cultivate lines all say true things in
plain words. It is thin where villagers are concerned: NPC garden
work is reported in third-person template lines ("X waters and
weeds the beds"), keepers never speak, nobody ever talks about a
sow that failed, and a dead crop is cleared, not mourned or even
noticed. The repetition is template repetition of report lines,
which the prereg expects; the gap is not repetition but silence —
the 303 failed NPC sows have no voice at all, in either direction.
A villager who tries to sow and cannot should say so, or the duty
should not hand them the job.

## Unmeasurable (confirmed)
- Per-villager eaten garden kcal: the village meal draws as an
  aggregate; the meal's garden-kcal draw is measured, individual
  plates are not.
- Villager → villager garden teaching: no code path exists besides
  teachPlant to the scholar; the pilot confirms it (0 guided sows,
  1 taught event, both scholar-facing).
- Garden-stock spoilage: inferred from daily snapshot diffs only,
  labelled INFERRED, never exact.
- Berries / woody first harvest: outside the 150d horizon (180d /
  365–730d maturity). Horizon limitation, not a miss.
- Player tending + garden food prep: unmeasured (dead wraps), not
  zero. Duty assigns: unmeasured (dead capture wrap), not zero.
- Cultivate actor/source: unmeasured (vid/source null on all casts).
- NPC sow failure reason: unmeasured (engine returns null silently).
- Arc II/III/IV reach, vests: not measured by this instrument.

## Metric review (§14 — no in-run re-scoring; for the NEXT run)
GO was judged strictly against the prereg bar and passed on all
five clauses. No metric was re-scored. Candidates for revision by
the next run:
1. The nominal-vs-deposited harvest gap (94,077 kcal here) should
   be closed by recording the packed item's actual kcal alongside
   the nominal figure at harvest time, so the gap decomposes into
   packed-eaten / spoiled / unpooled instead of one lump.
2. The garden-vs-forage share as defined counts pantry inflow only.
   A later run should decide whether player-packed garden harvests
   (eaten from the pack, never entering the pantry) belong in the
   share — on this pilot they are ~19% of nominal harvest and their
   exclusion understates the garden.
3. The teach-path classifier should resolve a real caller path
   (guided-sow vs haul-ID vs fireside) instead of recording the raw
   first stack frame ("Object.w" on all 108 calls).
4. The cultivate wrap should attribute vid + ability source (all
   null here); until it does, "who cultivated" is unmeasured.
5. `villagerSowPlot` should return a failure reason (or the
   instrument should read the gate) so the 99% NPC sow failure can
   be decomposed instead of reported as a bare rate.
6. Berries/woody first harvest needs a longer-horizon arm (or a
   prepared-scene proof) before any berry/woody verdict.
7. The ripe-plot snapshot should run after the day's ripening (or
   record ripe-at-harvest) — ripe plot-days read 0 on all seeds,
   which is a snapshot artifact.
8. The talkturn-a cost bar is already known-wrong; this arm carries
   NO cost bar and does not re-judge it.

## Findings for backlog (coordinator appends to sim-findings.md; do NOT chase mid-run)
- [open] 2026-11-10 — gardening / NPC sowing — the garden duty
  hands the sow attempt to whoever holds it, and the green-hands
  gate turns away nearly everyone silently: 305 NPC sow attempts,
  2 successes (0.7%), both farmers; only 3 attempts were by a
  green-hands occupation at all (sim-garden-b).
- [open] 2026-11-10 — gardening / NPC harvest — the NPC duty
  harvests almost nothing: 6 of 126 harvests, 15,120 of 487,650
  kcal (3%); the scholar brings in 97% (sim-garden-b).
- [open] 2026-11-10 — gardening / magic dependence — every harvest
  in the pilot was "assisted" (cultivate magic on the bed); zero
  ordinary unassisted harvests in 126 (sim-garden-b).
- [open] 2026-11-10 — gardening / voice — 303 failed NPC sows and
  every dead crop pass without a word; no weed-death scene exists
  (sim-garden-b).
- [open] 2026-11-10 — standing — standing sits at 199 on five of
  eight seeds (median 199), a plateau the villages do not climb
  past on this panel (sim-garden-b).
- [open] 2026-11-10 — gardening / skill — villager garden practice
  tops out at step 1 and the food system has no gardener task
  (foodXp gardener keys 0 on all seeds); no growth path past the
  first step (sim-garden-b).
- [open] 2026-11-10 — gardening / instrument — cultivate casts
  record vid/source null on all 282 casts; teachPlant paths record
  the raw frame "Object.w" on all 108 calls; NPC sow failures carry
  no reason (sim-garden-b).

## Proof
- `node scripts/test-garden-b.js` — **77 passed, 0 failed**
  (re-run by the adoption worker after the analyzer re-run; also
  green via `node --test` in the same session).
- Analyzer re-run reproduces
  `garden-summary-garden-pilot.json` byte-identically (sha256
  d6ca9fedafb49ab2d87758c400718b0ac792d35f6f6d347e82f3723228b73a24).
- Neutrality re-verified independently from the raw per-seed files:
  8/8 matched on days + end pantry kcal + death count.
- Harvest kcal reconciliation re-verified per seed (per-crop sums
  equal per-seed totals on all 8 seeds).
- Base: prereg + instrument + proof committed on branch sim-garden-b
  (dcc2adbb9, e3241506a, c868e2657, b7c3b70b1); corpus + summary +
  this evidence committed by the adoption worker (see commit below).

## Files
- Prereg: `evidence/2026-11-10/sim-garden-b-prereg.md`
- Instrument: `scripts/gardenb-instrument-20261110.js`
- Driver: `scripts/gardenb-driver-20261110.js`
- Analyzer: `scripts/gardenb-analyze-20261110.js`
- Proof: `scripts/test-garden-b.js` (77/77)
- Corpus: `evidence/2026-11-10/perseed-garden-b/` (16 files,
  control + neutral per seed, band 180217–180224)
- Summary: `evidence/2026-11-10/garden-summary-garden-pilot.json`
- This evidence: `evidence/2026-11-10/sim-garden-b.md`
