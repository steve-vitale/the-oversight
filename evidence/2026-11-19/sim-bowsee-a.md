# sim-bowsee-a — NO-GO (finding #2590 serve half: departure-site seeing seeds, but materials starve the craft)

- **Arm:** sim-bowsee-a (BUILD + MEASURE pilot — finding #2590's OPEN serve half: departure-site seeing), scale-onramp axis
- **Run:** fleshout-20261120T0515Z (Loop A)
- **Prereg:** `evidence/2026-11-19/sim-bowsee-a-prereg.md` (frozen ~05:30 UTC, before any judged sim). Commit `0d925556a` base (rebased from 8cd4c0181 onto the ship loop's version bump; version files only).
- **Proof test:** `scripts/test-bowsee-a.js` — **39/39 GREEN** (flag off = no seeding, byte-identical repeat; flag on = mate bow seeds lv[bow] at the craft attempt and the craft succeeds; spear-mate seeds nothing; no-materials seeds-but-noSource; failing roll seeds-but-craftedFail; companion-side plan lookup seeds; solo departure seeds nothing; draw-neutrality counted: 0 draws with no materials, exactly 1 — the craft roll — with materials).
- **Analyzer:** `scripts/analyze-bowsee-a.js` — selftest **51/51** (partition formula, scalemetric cost pair, departSee seeded-split aggregation).
- **Driver:** `scripts/bowsee-driver-a.js` (clone of the bowknow driver; SPEARGATE=1 on both legs, DEPARTSEE decides the leg, BOWKNOW asserted unset both legs; ADDS the `departSeeRows` recorder — a pure-read wrap of `Game.villagerStageBow` capturing lv[bow] before/after, party, mate-bow visibility, and staging source per departure). **Panel builder:** `scripts/build-bowsee-panels-a.js`.
- **Band:** REUSED 107051–107058 (8 seeds × 2 legs, 150d, competent verbatim; substrate `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1 + SENSEEXPED=1 + BOWOPEN=1 + SPEARGATE=1`; BOWKNOW unset both legs). Reuse is deliberate paired before/after on identical seeds, one flag apart — the bowknow ctl corpus is the replication target (see below). The band is also the searsupply-a band (different lever, finding #2599, halted mid-pilot, no shared state).
- **Verdict: NO-GO** — the mechanism works (it seeds, and one seeded spear-holder later crafts), but SERVED misses the bar by one (2 < 3) and the noSource consistency bar misses by three (delta 6 > 3). The volley bar passes on paper (+0.101) but is NOT mechanism-caused — neither served villager ever fought a wave-4+ meeting. A miss is NO-GO, never re-scored. No 12–16 seed confirm (a NO-GO has nothing to confirm).

## The mechanism (design call, frozen in the prereg)

DEPARTSEE=1 seeing in `villagerStageBow` step 3 (`src/js/game.js`): at the departure craft attempt — and nowhere else — if a party-mate (the win-plan party the crafter departs with, as holder or listed companion) has an EQUIPPED volley-capable bow, the crafter gains lv[bow] = 1, with a `weapon_see` telemetry event and a witnessed line when the scholar is home. The crafter still needs materials and still faces the blind 35% craft roll. Solo departures seed nothing. Default OFF in live play; the turn-on decision is the coordinator's, NOT this arm's. Draw-neutral by construction (zero new `Math.random` draws — verified by grep over the diff and by counting draws in the proof test). **Per the frozen NO-GO ladder the game code is REVERTED before commit (killed arms leave no trace); this evidence + the instrument + the corpora are what land.**

Canon: `docs/CANON.md` read. No canon doc covers launch gear-up, the ranged-slot rules, or weapon-craft knowledge seeding — said here rather than inventing canon. The mechanism respects "If you don't know, it doesn't show": a mate's bow is SEEN at the departure site, and seeing is what already seeds knowledge (the BOWCRAFT rule).

## Frozen bars (prereg)

| Bar | Result | Pass |
|---|---|---|
| 0. Pool floor: arm spearSeen ≥ 10 | 111 | YES |
| 1. Gate replication: arm spearPassed/spearSeen == 1.0 | 111/111 = 1.000 | YES |
| 2. Gate replication: ctl spearPassed/spearSeen == 1.0 | 108/108 = 1.000 | YES |
| 3. alreadyHad consistency ±3 | arm 195 vs ctl 195 (delta 0) | YES |
| 4. noSource consistency ±3 (PARTITION formula) | arm 259 vs 255 − (2 − 0) = 253 (delta 6) | **NO** |
| 5. **SERVED: arm.staged − ctl.staged ≥ 3** | arm 2 − ctl 0 = **2** | **NO** |
| 6. **Volley-rate rise arm − ctl ≥ +0.10** (pair-inclusive) | 0.435 − 0.333 = **+0.101** | YES |
| 7. Cost: starvation ≤ ctl + 2 (totals AND villager-only) | 2 vs 3 (villager 2 vs 3) | YES |
| 8. Cost: median survival ≥ 0.8× ctl | 150d vs 150d | YES |

**Kind: NO-GO — served-short (2 < 3) with partition drift (delta 6).** The volley bar passes but is unattributed (see below); the verdict does not turn on it.

## Control replication (bowknow ctl, same band — exact)

The ctl leg reproduces the bowknow ctl corpus **exactly** on all eight seeds: spearSeen 108, spearPassed 108, alreadyHad 195, noSource 255, staged 0, craftedFail 8, volley 7/21 pair, starvation 3 (villager 3), median 150d, deaths 854, wave 4 8/8, wave 5 4/8. The instrument is faithful; the bowknow numbers stand unrevised.

## What the numbers say

**Departure-site seeing seeds — and the craft starves for materials.** The instrument (the bowknow gap, closed this run) finally separates the three fates. On the arm leg, 17 departures were seeded (lv[bow] 0 → ≥1 at the craft attempt), 5 of them spear-holders — and **all 5 seeded spear-holders landed in noSource in the same call: seeded but no materials**. The knowledge did not go away, though: one of the five (seed 107054, `app_mgpspk5a508`, seeded day 97 with mate `victor_lopez`'s bow visible) departed again day 103 with lv[bow] = 1, the mate's own newly crafted crude bow visible, and **crafted a crude bow** — the one clean DEPARTSEE-attributable serving in the pilot, a real causal chain (seed → persist → craft). The frozen SERVED count is 2, but only 1 of the 2 is attributable: the other crafted bow (seed 107054 day 97, `victor_lopez`, a NON-spear-holder crafting a crude bow from pre-existing crude_bow knowledge) is RNG-divergence, not the mechanism. Even the frozen count misses the bar; the attributable count is 1.

**The wall is materials, not knowledge — now measured, not guessed.** On the ctl leg, **55 spear-holder departures already knew the bow (lv[bow] ≥ 1 at the attempt) and all 55 went without** — noSource, every one. They knew how to make a bow and had nothing to make it from. Only 3 of the 53 who did not know the bow even attempted (crude_bow knowledge, all failed the 35% roll). Knowledge seeding of any kind — mentoring, departure-site seeing — cannot move a population that already knows and still goes empty-handed. The next lever is the departure-site materials (or the 35% roll), not more knowledge.

**The volley bar passes on drift, not on the mechanism — stated plainly.** Arm pair volley 10/23 vs ctl 7/21 (+0.101, one thousandth over the bar). The three extra volleys are sling / phase-sling volleys on meetings that exist on the arm leg only (seed 107052 day 71 sling, day 100 phase-sling 73 dmg; seed 107054 day 68 sling) — the drift seeds. **Neither served villager fought a wave-4+ meeting on either leg** (pair or trio+ populations searched by vid). The mechanism contributed 0 volleys. The bar passes as frozen — the judge reads the share, not the attribution — but the evidence must not let it read as mechanism proof. The next arm should judge volley attribution (served-bow volleys), not the raw share.

**The consistency miss is the bowknow divergence story, retold.** Arm departures total 461 vs ctl 458 (+3); craftedFail 5 vs 8 (−3); alreadyHad identical (195 = 195). The partition formula assumes equal totals and equal craftedFail, so the delta is 3 − (−3) = 6. The drift concentrates on seeds 107052 (alreadyHad 26 → 23, craftedFail 5 → 2) and 107054 (spearSeen 0 → 3, crafted 0 → 2, noSource 13 → 18); the other six seeds are staging-identical between legs. Seeding changes which craft attempts fire, which consumes `Math.random` differently downstream — the same class as bowknow's +9 departures / +4/+4 deltas. The verdict does not turn on this bar (SERVED fails on its own), but the formula's hidden assumption is now proven false twice — see metric review.

**Diagnostics (not binding):** pair kill share 0 both; damage/round 31.6 → 35.4; deaths per engaged meeting (pair) 40.67 → 37.7 (arm lower); volley damage 18.6 → 23.1; ranged-at-entry 0.667 → 0.739; trio+ meetings 12 → 10. Nothing is being killed on either leg — the fight population is thin and the volley rise is noise-shaped. Starvation improves on arm (2 vs 3); median and community loss identical.

## Per-seed staging

| Seed | Days ctl→arm | Standing ctl→arm | Max wave ctl→arm | spearSeen (ctl/arm) | alreadyHad ctl→arm | crafted ctl→arm | craftedFail ctl→arm | noSource ctl→arm | seededSpear (arm) |
|---|---|---|---|---|---|---|---|---|---|---|
| 107051 | 139 → 139 | 199 → 199 | 4 → 4 | 34 / 34 | 7 → 7 | 0 → 0 | 2 → 2 | 65 → 65 | 1 |
| 107052 | 150 → 150 | 365 → 390 | 5 → 5 | 0 / 0 | 26 → 23 | 0 → 0 | 5 → 2 | 29 → 28 | 0 |
| 107053 | 150 → 150 | 199 → 199 | 4 → 4 | 13 / 13 | 42 → 42 | 0 → 0 | 0 → 0 | 21 → 21 | 2 |
| 107054 | 111 → 150 | 199 → 275 | 4 → 5 | 0 / 3 | 10 → 13 | 0 → 2 | 0 → 0 | 13 → 18 | 1 |
| 107055 | 150 → 110 | 480 → 199 | 5 → 4 | 6 / 6 | 15 → 15 | 0 → 0 | 1 → 1 | 5 → 5 | 1 |
| 107056 | 150 → 150 | 199 → 199 | 4 → 4 | 0 / 0 | 49 → 49 | 0 → 0 | 0 → 0 | 26 → 26 | 0 |
| 107057 | 150 → 150 | 635 → 635 | 5 → 5 | 48 / 48 | 15 → 15 | 0 → 0 | 0 → 0 | 88 → 88 | 0 |
| 107058 | 150 → 150 | 425 → 425 | 5 → 5 | 7 / 7 | 31 → 31 | 0 → 0 | 0 → 0 | 8 → 8 | 0 |

Staging is identical on six seeds; the staging drift lives on 107052 and 107054. Days/standing/wave diverge on three seeds: 107052 standing 365 → 390; 107054 days 111 → 150, standing 199 → 275, wave 4 → 5 (the arm village survives where the ctl village was lost); 107055 days 150 → 110, standing 480 → 199, wave 5 → 4 (the arm village is lost where the ctl village survived). The aggregates still match — wave-5 4/8 both, median 150d both, community lost 2/8 both — but the composition swaps: the arm's wave-5 seeds are 107052/107054/107057/107058, the ctl's are 107052/107055/107057/107058. Deaths differ on 107052 (99 → 106), 107054 (63 → 83), 107055 (88 → 74). Seed 107057 carries 48 of the 108 ctl spear departures.

## The departSee instrument (the bowknow gap, closed)

| Measure | ctl | arm |
|---|---|---|
| Departures recorded (`departSeeRows`) | 458 | 461 |
| Spear-holder departures | 108 | 111 |
| Spear departures with a win-plan party | 105 | 107 |
| Spear departures with a mate bow visible | 26 | 28 |
| Spear departures with lv[bow] ≥ 1 at the attempt | 55 | 71 |
| Seeded (lv 0 → ≥1 at the attempt), all departures | 0 | 17 |
| Seeded spear-holders | 0 | 5 |
| Seeded spear-holders, split by outcome | — | crafted 0, craftedFail 0, noSource 5 |
| `weapon_see` telemetry events (`teleCounts`) | 0 | 17 (5+3+4+3+1+1+0+0 per seed — agrees exactly with the seeded rows) |

Read it as: the seeding opportunity among spear-holders is small (26–28 mate-bow-visible departures) because most spear-holders who depart with a bow-carrying mate ALREADY know the bow; the seeding that does fire lands on no materials; the knowledge persists and occasionally converts on a later departure (1 of 5). The instrument works — the next arm can judge on it.

## Panel (instrument)

- Built `bowsee-a-panel-before/after.json.gz` from the paired corpora.
- `node scripts/balance-panel.js compare` → decision `review_required` (exit 2 is the compare's review-required code); no material signal on any metric (won 0→0, national 0→0, community loss 0.25→0.25, village deaths 106.75→108.375, `regression_watch` with an interval covering 0). The panel confirms the legs are nearly identical; the frozen bars are the judge.

## Wall numbers (this band, per leg)

- Wave 4 reached 8/8 both legs, wave 5 reached 4/8 both, national 0/8 both, full wins 0/8 both.
- Median survival 150d both; community lost 2/8 both.
- Deaths 854 ctl / 867 arm (106.75 / 108.375 per village).

## What the village looked like (plain words)

Eight villages, five living to day 150, two lost along the way. The spear problem is not rare — 108 spear-holders walked out of their villages on the control leg, most of them from one village (seed 107057 sent 48). More than half of them already knew how a bow is made, and every single one of them walked out empty-handed anyway: no bow from their own stash, none from the armory pile, no craft — because there was nothing to make one from, or the one attempt in three failed. The departure-site seeing does what it says on the tin — five spear-holders learned the bow from a mate's hands at the trailhead, and one of them came back to the trailhead a few weeks later and made one — but learning was never the wall. The wall is wood and vine at the moment of leaving, and a one-in-three blind chance. The villages themselves are unchanged by the lever: same deaths, same standing, same wave reach, no seats, no wins. The scale wall stands exactly where it stood.

## Sense-test notes (transcripts)

- The `weapon_see` telemetry fired 17 times on the arm leg (teleCounts agree exactly with the seeded rows) and 0 times on ctl — the mechanism is observable in the record, not just in the proof test.
- The witnessed say line ("holds their bow up where … can see it") is **unobservable in the pilot corpora**: the driver records say lines only when they match the veteran SAY_RE, and the general say log is not kept — so the corpora cannot say how often the scholar was home to hear it. The proof test proves the line fires when the scholar is home; the pilot cannot measure its live frequency. That is an instrument blind spot, not a mechanism failure — the next arm that cares about the voiced beat should record say lines.
- The one clean narrative in the corpora is the 107054 chain: `victor_lopez` crafts a crude bow day 97 (a non-spear departure, pre-existing knowledge); the spear-holder he seeded that same day (`app_mgpspk5a508`) departs again day 103, sees Victor's new crude bow, and crafts one himself. It reads as people learning from each other at the trailhead — the intended story, happening once, by luck, on the drift seed. Nothing robotic was observed in the staging records; nothing in the transcripts contradicts the mechanism.

## What happened to the pilot (the restart + the lock queue)

- ~05:29Z: ctl leg launched. The VM restarted (uptime 1 min at 05:43Z) and killed it before any seed wrote — no corpus, no log; nothing to recover, nothing lost. The prereg, mechanism, instrument, and proof were all intact on disk.
- ~05:44Z: re-ran the full ctl leg (8 seeds, exit 0, ~10 min). Arm leg ran ~05:53–06:06Z (8 seeds, exit 0, ~13 min — the box was loaded, load average 15–17 under sibling loops).
- Registry-lock queue: a heartbeat call at 05:58Z queued ~10 min behind sibling `worktree-register.sh` runs holding `REGISTRY.lock` (flock, no timeout in the script); it landed 06:08Z ("heartbeat sim-bowsee-a"). The registry heartbeat went ~25 min stale in between — the tree was never dead (the arm driver ran throughout), only the heartbeat write was queued. If the queue recurs, the heartbeat script wants a timeout + retry rather than an unbounded flock wait — noted for the coordinator, not changed here.
- `check.js --quick` was NOT completed before commit: it ran 9+ min with ~0 CPU time under load average ~17 (sibling loops saturating the box) and was killed starved, not failing. It is not applicable anyway: the committed tree has zero `src/` diff vs base 0d925556a (game.js reverted, verified empty), and the new scripts are not on the green list, so the green-list outcome on this tree is identical to base by construction. The applicable proofs ran green: analyzer selftest 51/51 (post-revert) and proof test 39/39 (pre-revert base).

## Metric review

- **The partition formula's hidden assumption is false (bar design, not a re-score):** the formula assumes equal total departures and equal craftedFail across legs. Both broke here (totals +3, craftedFail −3, delta 6) and in bowknow (+9 departures, deltas +4/+4). Any lever that changes which craft attempts fire diverges the RNG streams and moves departure counts. The verdict is unaffected (SERVED fails on its own), but the next arm judging a knowledge/RNG-consuming lever must use a drift-tolerant consistency bar — a rate-based form (noSource per departure) or a tolerance that prices in the drift — and say so in its prereg. Do not re-judge this corpus under a friendlier bar.
- **The volley bar passed on drift (bar design, not a re-score):** the frozen bar counts any volley-share rise. The +0.101 here comes from sling volleys on drift-seed meetings, not from served bows. A future arm should judge volley attribution — volleys fired by served bows (join meeting rows to served vids) — or the bar will keep passing on noise. The instrument supports that join now (departSeeRows carry vid + day; meetings carry vid + rangedId).
- **SERVED counts all staged bows, not attributable ones (bar design):** the frozen count (2) includes a non-spear-holder crude_bow craft that the mechanism did not cause; the attributable count is 1. The next arm should judge attributable-SERVED (seeded-then-crafted spear rows, straight from departSeeRows) beside the frozen count, and pre-register which one binds.
- **lv[bow]-only recording misleads on crude_bow attempts:** craftedFail rows with lvBowBefore = 0 are villagers who knew crude_bow but not bow — the pick loop tries the rung they know. The next instrument should record lv[crude_bow] beside lv[bow], or a reader will call those attempts impossible.
- **Instrument gap — closed:** the bowknow gap (lv[bow] reach unrecorded) is closed by departSeeRows: seeded counts, the seeded split, mate-bow visibility, and lv[bow] at the attempt are all in the corpora and agree with teleCounts exactly (17/17). The next serve-half arm inherits this instrument rather than rebuilding it.
- **Owed but not done this run:** re-run the landed proofs (`test-spearstage-a.js`, `test-speargate-a.js`, `test-bowcraft-a.js`, `test-bowknow-a.js`) on this base before the pilot — DONE (26/26, 31/31, 58/58, 19/19, all green on base 0d925556a; the bowknow arm's owed re-runs are now covered). No confirm: the pilot is NO-GO; there is nothing to confirm.
- Finding #2590: stays OPEN on the serve half (gate half confirmed three times over: 49/49 spearstage, 108/108 bowknow, 108/108 + 111/111 here). Next lever named: **departure-site materials** — the 55-knowing-but-empty-handed wall (a pile reservation / materials check at the craft attempt, or the 35% blind roll) — judged on attributable-SERVED with a served-bow volley join. Knowledge seeding is proven non-binding and should not be re-tested as the serve path.

## Files

- Prereg: `evidence/2026-11-19/sim-bowsee-a-prereg.md`
- Proof test: `scripts/test-bowsee-a.js` (39/39 GREEN on the pre-revert base; on the committed tree it fails its static checks — correctly, because the mechanism is reverted)
- Instrument: `scripts/bowsee-driver-a.js`, `scripts/analyze-bowsee-a.js` (selftest 51/51), `scripts/build-bowsee-panels-a.js`
- Per-seed corpora: `evidence/2026-11-19/perseed-bowsee-a-ctl/` + `perseed-bowsee-a-arm/` (8 JSONs each, 107051–107058)
- Analysis: `evidence/2026-11-19/bowsee-a-analysis.json`
- Sweep logs: `evidence/2026-11-19/bowsee-a-ctl.log` / `.err` (from the re-run; the killed first launch wrote nothing), `bowsee-a-arm.log` / `.err` (exit 0)
- Panels: `evidence/2026-11-19/bowsee-a-panel-before.json.gz`, `...-after.json.gz`, `bowsee-a-panel.json`, `bowsee-a-panel.md` (decision `review_required`, no material signal)
- **Game code REVERTED per the frozen NO-GO ladder:** `src/js/game.js` is byte-identical to base 0d925556a in the committed tree. The DEPARTSEE mechanism (+58 lines, proof 39/39) exists only in this evidence file's description and in the pre-revert proof run — killed arms leave no trace.
