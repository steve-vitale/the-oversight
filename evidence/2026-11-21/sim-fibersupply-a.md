# sim-fibersupply-a — fiber-supply diagnosis (finding #2590)

- **Arm:** sim-fibersupply-a, Loop A run fleshout-20261121T0015Z
- **Verdict: DIAG-NO-GO** (frozen bar (1) missed: pile-zero 0.208 < 0.40 — see Metric review; the WHY is fully quantified below, bars (0), (2), (3) pass)
- **Legs:** ctl (judged) + rep (identical-code re-run), 8 seeds 107091–107098, 150d death-aware horizon, competent verbatim policy, SPEARGATE substrate on master faa5d65a9
- **Prereg:** `evidence/2026-11-21/sim-fibersupply-a-prereg.md` (commit 98bce87b8; frozen before any judged sim)
- **Instrument:** `scripts/fibersupply-driver-a.js` (commit 4072df579); proof test `scripts/test-fibersupply-a.js` 41/41 GREEN on 3 seeds (31031, 7, 42); analyzer `scripts/analyze-fibersupply-a.js` selftest 10/10; panels `scripts/build-fibersupply-panels-a.js`
- **Corpora:** `evidence/2026-11-21/perseed-fibersupply-a-ctl/` + `perseed-fibersupply-a-rep/` (8 files each); analysis `evidence/2026-11-21/fibersupply-a-analysis.json`; panel compare `evidence/2026-11-21/fibersupply-a-panel-compare.md`
- **No canon doc covers launch gear-up / ranged-slot rules / weapon-craft knowledge seeding** (sim-evade-a established that); nothing here invents canon.

## The answer in plain words

Your villages are not short of fiber in total. Over the eight villages they brought in 336 fiber and used 174 — the pile should be growing. The problem is timing and who gets there first.

Fiber arrives as a trickle, one piece at a time, when a villager gathers fallen branches — and in every village that job falls to basically one person. That one person decides whether the village gets fiber at all: in one village a forager named Nino gathered 109 times and the pile ended the run holding 113 fiber; in another village nobody took the job up and the pile sat empty for 108 of 143 days, while 56 departing fighters found nothing to make arrows with.

What eats the trickle is not the departing fighters. Villagers sitting at home make arrows for themselves every day — they took 155 fiber from the pile, against 16 taken at departures. By the time a bow-carrier walks out the gate, the home craft has already spent the day's fiber. The departure craft can only use what's in the pile — it cannot use anything the fighter carries — so it fails, and the fighter walks out with an empty bow. That happened 65 times on this band: one departure in five hit "no materials" with zero fiber in the pile.

So the pile never has fiber *when a departure needs it*, even though the band as a whole takes in nearly twice what it spends. The shortage is a buffer problem, not a supply problem: the trickle is spent at home the same day it arrives, and no buffer ever builds up for departures.

## The quantified ledger (band, 966 village-days)

| Flow | Fiber | Rate / village-day |
| --- | --- | --- |
| IN — deadfall duty (only recurring source) | 336 | 0.348 |
| OUT — home arrow-craft (`villagerAmmoCraftDay`) | 155 | 0.160 |
| OUT — departure arrow-craft (`villagerPocketAmmo` step 3) | 16 | 0.017 |
| OUT — closed-village skim (theft) | 3 | 0.003 |
| Net (in − out) | +162 | — |
| Final pile fiber, summed over 8 seeds | 162 | — |

The ledger closes: 336 in − 174 out = 162, exactly the summed final pile fiber (3 + 34 + 0 + 113 + 0 + 12 + 0 + 0). The instrument's day-level reconciliation leaves a gap of 3 fiber band-wide (one fiber of census-timing jitter in three seeds) — no unattributed drain, no betrayal fiber on this band (a betrayal +4 would show as a +4 gap in one seed; the largest per-seed gap is +1).

- Deadfall: 652 hauls, 336 fiber (0.52/haul — the 50% coin, as coded), 1,296 sticks (1.99/haul). No other recurring source exists: the open-village contribution gives branch/wood/bark/vine/hide, never fiber; no forage, expedition, or loot yield gives fiber; the betrayal +4 is a rare one-off and did not fire here. The scholar's own fiber (clearing brush, deadfall) goes to the scholar's personal pack, never the pile.
- The 155 home-craft takes are read off the stash ledger (`'take', 'fiber', 1, vid` lines). Only one code path can write such a line for fiber: the home arrow-craft's "own carried first, then the pile" take (`villager-build.js:1658`). The home weapon-craft ladder (spear/bow) and the departure bow-staging ladder (bow/crude_bow) use no fiber and cannot write it; the medicine take (`game.js:34210`) takes pharmacy items, never fiber; the skim writes `'Plant fiber'`, a different label, and only 3 times.
- Departure arrow crafts: 22 attempts on the band (16 arrow, 6 bolt), 18 ok / 4 fail. The 6 bolt crafts correctly spend 0 fiber (the bolt recipe has none) — they are not missing fiber. The 16 arrow crafts each spent exactly 1 pile fiber.
- The departure craft reads ONLY the pile (`game.js:8100-8110`: it checks `mats[m]` and deducts from the pile; it never looks at the carrier's pack). The home craft reads the carrier's pack first and the pile second — but villagers hold no fiber at any census moment (see below), so in practice the home craft also draws the pile.

## Per-seed table

| Seed | Days | End | Pile-zero days | Fiber in | Fiber out* | Final pile | Need events† | Departures | Hauls | Top hauler (share) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 107091 | 151 | survived | 2/148 | 16 | 2 | 3 | 0 | 74 | 26 | gen_igdqxjm (9/16) |
| 107092 | 74 | village-lost | 2/71 | 65 | 6 | 34 | 0 | 34 | 112 | gen_oapurdo (55/65) |
| 107093 | 151 | survived | 10/147 | 58 | 6 | 0 | 3 | 62 | 105 | rosa_mendez (45/58) |
| 107094 | 150 | survived | 2/148 | 113 | 0 | 113 | 0 | 0 | 237 | nino_kapanadze (109/113) |
| 107095 | 92 | village-lost | 28/90 | 11 | 0 | 0 | 6 | 27 | 22 | gen_q2j0woe (4/11) |
| 107096 | 148 | village-lost | 4/145 | 41 | 4 | 12 | 0 | 61 | 88 | gen_cudvv14 (37/41) |
| 107097 | 76 | village-lost | 45/74 | 15 | 1 | 0 | 0 | 1 | 29 | gen_sdk4f1m (7/15) |
| 107098 | 146 | village-lost | 108/143 | 17 | 0 | 0 | 56 | 80 | 33 | sofia_chen (6/17) |
| **Band** | — | 3 survived / 5 lost | **201/966 = 0.208** | **336** | **19** | **162** | **65** | **339** | **652** | **top hauler 272/336 = 81%** |

\* Attributed outflow only (departure craft + skim). The home craft's 155 is the wrap-blind remainder, closed by the stash-ledger cross-check above.
† Need events = departures hitting `no-mats` with pile fiber 0 at the attempt. None of the 65 involved a bow served that same departure (served-bow need events: 0; served departures on the band: 1, which left with 0 arrows). The shortage bites villagers who already carry bows, not newly served ones.

Two regimes live in one band, and that is why the frozen pile-zero bar missed (see Metric review): seed 107094 ends holding 113 fiber with 0 departures and 0 home crafts — a village with no bows at all, where fiber piles up untouched. Seed 107098 ends holding 0 with 108 of 143 days empty and 56 need events — a village with bows, where every fiber is spent at home the day it arrives. Averaging the two regimes gives 0.208; the departure-time pile-zero share is 106/339 = 0.313, and the need-event rate is 65/339 = 19.2% of departures (65/101 = 64.4% of all no-mats departures).

## The three mechanisms

**1. The tap is one villager's habit, not a throttle.** Deadfall hauls per village-day range 0.17–1.58 by seed, and one villager does 81% of all hauling band-wide (272/336). In 107094 a forager named Nino gathered 109 times; in 107098 nobody took the job up (top hauler 6 times). The prereg's stick-throttle hypothesis (§0.3) is NOT supported: the village with the most hauls (107094, 237) also has pile sticks ≥ 6 on 145 of 148 days, and sticks sit ≥ 6 on 777/966 days band-wide (80%) while hauls continue. Deadfall floods sticks (~2/haul; 1,296 sticks in against ~44 out in arrow crafts, so the pile holds 100–179 sticks mid-game), yet hauling does not stop when sticks are high — the hauls follow whichever villager keeps choosing deadfall, through a path that does not check the stick count. (The census's `deadfallStaffed` snapshot — assignments read at end of day — proved unreliable as a staffing measure: it reads 3 staffed days for the seed with 237 hauls. It is not used as evidence here; the haul counts and the who-table are.)
**2. The home craft eats first.** The home arrow-craft runs daily at home for every bow-holder (≤1 attempt per 3 days each) and took 155 fiber — 89% of all outflow, 10× the departure craft's 16. It spends the trickle as it arrives, so no buffer builds for departures. This is legitimate use, not a defect in itself: villagers making arrows at home is the craft working as built.
**3. The departure craft is pile-only and last in line.** It reads only the communal pile, never the carrier's pack, and runs after the home craft has had the day's fiber. With the pile empty at the attempt, it fails before the roll (`no-mats`), so no arrows are made and none are burned — the fighter simply leaves empty-handed. The ammo arm's Lelisa case is the same shape: pile fiber 0 on day 96 and still 0 on day 101, five fights with an empty bow.

## Personal vs pile

- Scholar personal fiber: mean 0.03/village-day, max 1, across the band. The scholar almost never holds fiber (the scholar's own fiber sources exist but the competent policy rarely works them, and the scholar never crafted a fiber recipe: 0 scholar craft attempts).
- Villagers' personal fiber: 0 at every census moment (end-of-day scan of each villager's carried items). Nobody holds fiber overnight. (The home and departure crafts read carried items first — the zero census means there is effectively nothing to draw on; the 6 bolt crafts are the only zero-pile-fiber departures and they need no fiber at all.)
- The two fiber economies never meet: the scholar's personal fiber never reaches the pile (no deposit under the competent policy), and pile fiber never reaches a personal pack except through the skim (3 times) — which steals it into nowhere, not into a usable pack.

## Sense-test (transcripts)

349 fiber say-lines on the band. 336 are the deadfall narration — every fiber landing is narrated the same way ("🍂 Emma gathers deadfall — 1 stick + 1 fiber. The pile grows. (6 sticks now.)"). One is a witnessed theft ("👁️ You saw A woman, maybe 60s, with a shaved head palm 1 plant fiber from the village stash and slide it into their pack."), two are the unseen-theft line ("The stash count is off. 1 plant fiber missing. Nobody saw anything. Everybody suspects something."). The other 10 are knowledge entries and plant-study lines ("fiber: tough stalk fiber for rough cordage", "dropping pods full of silky fiber").

**No villager ever talks about, seeks, or notices fiber.** Zero lines ask for it, notice the pile is empty, or go looking for it. Fiber is narrated as a byproduct of gathering sticks and once as a theft — never as something anyone wants. That is the sense-test verdict: the shortage is invisible to the villagers themselves; nothing in the village ever treats fiber as a need. (The one apparent "need" hit is a false positive — the scholar's own deadfall line mentioning "bark fiber".)

## Wall numbers (ctl; rep identical)

National 0/8, wins 0, wave 4 reached 8/8, wave 5 reached 3/8, median survival 147d, community lost 5/8, starvation deaths 2 (both villagers), total deaths 643. The fiber shortage is not the wall on this band — no village reached national — but it is a live leak in the winnability chain: 65 departures left without arrows they should have had, and only 1 departure on the band was served a bow at all.

## Determinism (ctl vs rep)

The analyzer's literal string-equality check reads 0/8 identical, but that is an artifact of two label fields, and the true picture is full determinism on everything simulated:

- All fiber arrays identical 8/8: `fiberCensus`, `fiberEvents`, `fiberCrafts`, `fiberSays`, `fiberStashLog`, `ammoRows`, `depmatRows`, `deaths`, `daily`, and every summary field (days, endReason, maxWave, standing, scaleRank).
- The only differences: (a) `anchorCommit` — the ctl leg's first 7 seeds ran before the instrument commit (anchor 98bce87b8) and seed 107098 + the whole rep leg ran after it (anchor 4072df579); the commit changed the recorded HEAD hash, not the code the sims ran (the instrument files were already on disk, unchanged, when the leg started). (b) On seed 107098 only, the `seq` counter inside the inherited `dawnbidDeparts`/`launchdefSkips` recorder rows — a process-scoped sequence number (ctl 107098 ran alone in its own process so its seq restarts at 1; in the rep process it continues from the earlier seeds at 717). The row contents are identical. The panel compare confirms it: every observed contract metric has paired delta 0 (`no_material_signal`), 8/8 pairs; the overall compare decision is `review_required` because this is a screen-only identical-panel compare, not a treatment contrast.

Provenance: the ctl leg was killed by a machine restart (SIGTERM, `uptime` 1 min) at 7/8 seeds; seed 107098 was resumed alone in its own process with the identical env, which is what produced the `seq` artifact above. No seed was lost; the `.err` files are empty on both legs.

## Blanks — what this diag did not measure

- Own-funded home arrow crafts (a villager spending fiber they carry, without touching the pile): unmeasured. The census shows villagers hold no fiber at day's end, so the remainder above the 155 pile-funded takes is small, but the instrument cannot count it.
- Intraday order (home craft before departures): inferred from the daily structure and the 155-vs-16 ratio, not directly timestamped; the instrument records day, not hour.
- WHY one villager takes up deadfall and another does not (dawn-bid choice vs policy staffing): outside this instrument. The who-table is measured; the chooser is not.
- Why seed 107094 has no bows at all (no departures, no home crafts): not investigated — that is the weapon-craft knowledge/materials side of finding #2590 (bowknow/depmat chain), out of this arm's scope.
- Table metrics are null in the panels (not instrumented by this driver — left null, never faked), as in the ammo arm.

## Metric review

- Bar (0) instrument validity: PASS. Proof test 41/41 green on 3 seeds before the legs; instrument errors 0 on all 16 per-seed files; the ledger closes to within 3 fiber of 336 in / 174 out (timing jitter). One instrument gap was found by the data itself and is recorded, not hidden: `villagerAmmoCraftDay` (the home arrow-craft, the dominant sink) was not wrapped, so its fiber shows up only through the stash-ledger cross-check and the day-level residual — not as attributed ledger rows. The next arm's instrument should wrap it directly. The bar's letter is met; the gap is a coverage note for the follow-up, not a verdict change.
- Bar (1) supply gap quantified: FAIL as frozen (pile-zero 0.208 < 0.40), though the source (deadfall, 0.348/day) and sink (home arrow-craft, 0.160/day) are named with rates. The bar's population was wrong, not the measurement: it counted all village-days, mixing bow-less villages where fiber accumulates (107094: 113 fiber) with bow-holding villages where it starves (107098: 108/143 days empty). The operational populations tell the real story — pile-zero at departures 0.313, need events 65 — but the prereg binds the verdict, so this is DIAG-NO-GO, never re-scored. A future diag bar should be stated on departures (or on bow-holding village-days), not on all village-days.
- Bar (2) fiber-need events ≥ 5: PASS, by an order of magnitude (65).
- Bar (3) personal-vs-pile separation: PASS on its letter (census present every seed, scholar mean 0.03 / max 1 stated, villagers max 0). The villagers' zero is a genuine end-of-day zero, verified against the craft code that reads the same carried-items store.
- Seed band: 107091–107098 confirmed fresh (no prereg, tracker, finding, or forbidden list names it; the 7 corpus mentions of `107091` are not seed designations — see prereg §0.1).

## Named next lever (for the build arm)

**Trailhead fiber fetch at the departure arrow-craft attempt.** Premise: the measured failure is at the departure — 65 no-mats events with pile fiber 0 — and the departure craft reads only the pile while the home craft drains the same-day trickle first. So the fix fetches the missing fiber at the point of need: when a bow-holder departs and the pile is short of the arrow recipe's fiber, the departing villager gathers 1 fiber at the trailhead (or from the departure site) before the craft attempt, so the craft can proceed. It closes the exact measured gap without re-throttling the deadfall duty (whose rate follows one villager's choice, not the stick count) and without taxing the home craft (legitimate use). Alternates, held not named: (i) deadfall re-throttle on pile fiber instead of pile sticks; (ii) a home-craft reserve that holds back 1 fiber when a departure is imminent. The follow-up arm's instrument should wrap `villagerAmmoCraftDay` directly so the home sink is attributed, not inferred from the ledger.
