# sim-poolfirstfail-b — why the companion pool is empty (DIAG)

- **Run:** `fleshout-loop-b-20261121T0430Z`, arm 2 of 3, arm `sim-poolfirstfail-b`, branch `sim-poolfirstfail-b`, base master `df40fced1`
- **Prereg:** `evidence/2026-11-21/sim-poolfirstfail-b-prereg.md` (frozen 2026-11-21 ~05:40 UTC, before any judged sim)
- **Verdict: DIAG-NO-GO** — on the frozen instrument bar only (see §1). The decomposition itself is complete: classification PASS, binding first-fail PASS.
- **Instrument only:** no `src/js` game-code changes, no lever build. `villager-brain.js` / `win-plan.js` untouched (held by sibling arms).
- **Corpora:** `evidence/2026-11-21/perseed-poolfirstfail-b-106731-106738/` (8 files, fresh band 106731–106738, 150d death-aware)
- **Analysis:** `evidence/2026-11-21/poolfirstfail-b-analysis.json` · **Leg log:** `evidence/2026-11-21/poolfirstfail-b-legs.log`

## In plain words

The last investigation found that when a villager tries to put together a hunting party for a wave-4 monster, there is never anyone to invite — the pool of possible companions is empty every single time. This arm took that empty pool apart member by member on eight fresh villages. The answer is not that the possible companions are away, dead, or untrusted. They are home, alive, and trusted — they just aren't rangers. The party rule only lets villagers who score as wanderers or explorers walk the road, and almost nobody in these villages scores that way: out of 781 villagers checked at the moment a party was needed, 417 failed on not being a ranger, 305 were away, and only 6 failed on trust. Lifting the ranger rule alone would have filled every single empty snapshot; bringing everyone home or fixing trust would have filled none. One village out of eight did have rangers — and it is the only village where companions ever existed. The pool is empty because the villages have almost no rangers, not because the rangers they have are busy.

## 1. Metric review (frozen bars from the prereg)

| Bar | Frozen requirement | Result | Pass? |
|---|---|---|---|
| (a) Classification completeness | 0 unclassified pool snapshots; census day-set C ⊆ daily day-set D, \|C\| ≥ \|D\|−1 | 138 snapshots, 0 problems; census 1030 rows, 0 bad seeds | **PASS** |
| (b) Binding first-fail named | Modal non-self first-fail holds a strict plurality | `notRanger` 417 vs next `away` 305 (of 781 non-self) | **PASS** |
| (c) Instrument validity | Proof test green, analyzer selftest green, 8/8 files parse, 0 instrument errors, substrate assertions pass (policy sha `1884c8852d38`, all 7 flags `1`, `allyslot3InSrc: false`, anchor base `df40fced1`) | Proof 40/40 green, selftest 74/74 green, 8/8 parse, 0 errors, policy + all 7 flags + `allyslot3InSrc` pass — **but substrate assertions fail on all 8 files on the anchor alone** (`anchor:38692c34c24b` vs frozen `df40fced1`) | **FAIL** |

**Verdict: DIAG-NO-GO.** The prereg freezes the rule — "a miss is NO-GO, never re-scored" — and bar (c) misses on the anchor assertion. This is reported as a NO-GO even though the miss is a label artifact, not a substrate difference, because the frozen bar is the frozen bar and this arm does not re-score it. The exact cause, and what the next run should do about it:

- The driver records `anchorCommit` as `git rev-parse HEAD` at run time (`scripts/poolfirstfail-driver-b.js:83-84`, inherited verbatim from the holderstate driver). At run time HEAD was `38692c34c` — the instrument commit the timed-out 0430Z run made *before* the judged leg ran. The analyzer's frozen `EXPECTED.anchor12` is `df40fced1`, the master base.
- Holderstate's corpora carry `anchorCommit = a6534c67b…` (its base) because at *its* run time HEAD was still the base. Same driver code, different resume ordering — that is the whole difference.
- **`git diff df40fced1 HEAD -- src/` is EMPTY.** The instrument commit adds 4 files only (prereg + 3 scripts, 4009 insertions, 0 deletions). The game code the corpora ran under is byte-identical to the frozen base `df40fced1`. Policy sha, all 7 env flags, and `allyslot3InSrc: false` pass on all 8 files. Nothing about the substrate differs; only the label the driver stamped on it does.
- A second gap the proof test could not catch: the proof test (40/40 green) asserts the policy sha but never asserts the anchor, so it passed on this tip while the analyzer's stricter substrate check fails. The next run's proof should assert the anchor too.
- **Recommended next run (coordinator call):** re-anchor the driver (record the merge-base / base commit instead of HEAD, or run the judged leg before committing the instrument, as holderstate did) and re-record the *same frozen band* 106731–106738, then re-judge. The content is deterministic — the proof test's D1 leg proves identical corpora on repeat runs — so the re-record should be identical except for the anchor label. Do NOT amend `EXPECTED.anchor12` to `38692c34c` after the fact: that would be re-scoring a frozen expectation, which the prereg forbids.

## 2. The decomposition (Leg P, fresh band 106731–106738)

138 pool snapshots (one per scored dawn for a wave-4 plan holder), 781 non-self member first-fails, 1030 end-of-day census rows. First-fail counts across all snapshots:

| First-fail | Count | Share of non-self (781) | What it means |
|---|---|---|---|
| `notRanger` | **417** | **53.4%** | Home, alive, trusted — profile is forager/homebody, not wanderer/explorer |
| `away` | 305 | 39.1% | Out of the village (forage / water / guard / expedition / …) |
| `trustLow` | 6 | 0.8% | Trust below 15 |
| `eligible` | 53 | 6.8% | Passed every filter |
| `dead` / `notAtHaven` / `engaged` / `onExped` | 0 | 0% | Never the first failure on this band |
| `selfOrScholar` (structural) | 276 | — | 2 per snapshot: holder + scholar; excluded from the plurality |

Eligibility distribution: 104 snapshots with 0 eligible, 20 with 1, 10 with 2, 4 with 3+. **104/138 snapshots (75.4%) are empty.** The binding gate over assessed days is `party-no-companion` on **134/134 assessed days (100%)** — every assessed day, on every seed.

### Per-seed picture — the pool is empty in 7 of 8 villages

| Seed | Days | End | Pool snapshots | Eligible members | notRanger | away | trustLow |
|---|---|---|---|---|---|---|---|
| 106731 | 150 | survived | 23 | 0 | 70 | 37 | 0 |
| 106732 | 150 | survived | 0 | — | — | — | — |
| 106733 | 97 | village-lost | 1 | 0 | 1 | 1 | 0 |
| 106734 | 82 | village-lost | 7 | 0 | 29 | 15 | 0 |
| 106735 | 150 | survived | 0 | — | — | — | — |
| 106736 | 143 | village-lost | 53 | 0 | 186 | 67 | 6 |
| 106737 | 149 | village-lost | 51 | **53** | 123 | 177 | 0 |
| 106738 | 129 | village-lost | 3 | 0 | 8 | 8 | 0 |

**All 53 eligible members on the whole band live on seed 106737** — the only village with rangers at dawn assessment time. Seeds 106732 and 106735 produced **zero pool snapshots at all**: no wave-4 plan holder was ever scored at dawn there — on 106735 all 159 dawn scores carry `needWave` 3 or null (none ≥ 4); on 106732 exactly one dawn score carries `needWave` 4 and it fired midday, not at dawn. The instrument only sees villages whose plans reach a dawn assessment, and those two never did. Seed 106736 is the heaviest case: 53 snapshots, the most on the band, and not one eligible companion in any of them.

### P2 — counterfactual relaxations: the profile gate alone fills everything

Per snapshot, eligibility recomputed with one filter lifted at a time (same check order):

| Relaxation | Snapshots with ≥1 eligible | Empty snapshots gained |
|---|---|---|
| none (as-is) | 34 | — |
| relax **profile** only | **138** | **104** |
| relax away only | 34 | 0 |
| relax trust only | 34 | 0 |
| relax all three | 138 | 104 |

Relaxing the ranger requirement fills **104/104 empty snapshots**. Relaxing away or trust fills **zero**. That is the read the prereg said to test, not assume — and it holds: the ranger requirement is the binding filter, by the counterfactual as well as by the plurality. Every empty snapshot already has at least one home, trusted non-ranger standing in the village who would be eligible the moment the profile gate lifts.

### P3 — the notRanger gap: how far short, and what closes it

Gap = points short of wanderer (live score 2). Distribution over the 417 notRanger members: gap 1: 78, gap 2: 159, gap 3: 34, gap 4: 130, gap 5: 16. Mean gap ≈ 2.6. The nearest fifth (78) is one point away; four-fifths (339) are 2–5 points short — the "one point away" story covers the nearest members only, not the mass.

Single-component closers, over the 78 gap-1 members only: knowsSnare +1 closes 78/78, goal change to explore closes 78/78, observant +1 closes 56/78, driven/potential +2 closes 47/78, **none closes 0/78** — every gap-1 member is one lived change away from ranger (learn to set snares, take up an explore goal, or be observant/driven). But those are the *nearest* members; a gap-4 homebody needs several such changes at once.

**Cache staleness is not the story:** `gapStale = 2` — only 2 members whose live score reaches ranger while the cached profile the filter sees does not. The cached profile matches the live person almost everywhere; the filter is seeing the real village, and the real village has no rangers.

Member profile census over all 781 non-self members in snapshots: forager 411, homebody 216, wanderer 139, explorer 15. Holder profiles: forager 98, homebody 26, wanderer 9, explorer 5. The villages are forager villages: 627/781 members (80%) are foragers or homebodies.

### P4 — the away decomposition: bringing rangers home fixes nothing

305 away members, cross-tabbed by purpose × onExped × ranger-or-not × trust:

| Away members | Count |
|---|---|
| Objective travel, non-ranger, trust OK (forage 65, water 60, guard 19, explore 1, leave 3) | 148 |
| Expedition, non-ranger, trust OK | 55 |
| Expedition, ranger, on expedition, trust OK | 86 |
| Guard, ranger, on expedition, trust OK | 1 |
| Objective travel, ranger, trust OK (guard 5, water 5, forage 4) | 14 |
| Objective travel, non-ranger, trust low (water 1) | 1 |

**Would-be-eligible if home: 14** — the rangers away on ordinary objective travel. All 14 sit on seed 106737, in snapshots that *already* have an eligible member. **Relaxing away gains 0 empty snapshots.** The away filter is second in count but not binding, for two separate reasons: 204/305 away members are non-rangers who would fail the profile gate even if home, and 87 are rangers on expedition who would fail the on-expedition filter (away catches them first in check order). Away is a real second filter — it hides the few rangers that exist on 106737 — but on this band it never decides an empty snapshot.

### P5 — trust: a non-issue

`trustLow` is 6 members, all on seed 106736, trust gaps 5/7/12 (trust 10/8/3). Trust distribution over all 781 non-self members: <15: 7, 15–24: 33, 25–39: 52, **40+: 689 (88%)**. Trust is not the binding filter and not close to it — the villages trust each other; they just don't range.

### P6 — census supply chain: rangers exist, but rarely at home

End-of-day census, 1030 rows (days with ≥1 ranger at each link, out of 1030 census days):

| Link | Days with ≥1 | Share |
|---|---|---|
| Ranger alive | 737 | 71.6% |
| Ranger at home | 343 | 33.3% |
| Ranger at home + trusted (≥15) | 329 | 32.0% |
| Full chain (… + not engaged + not on expedition) | 262 | 25.4% |

The chain dies at **"at home"**: rangers are alive on ~7 days in 10 but home on ~1 in 3. Home→trusted loses almost nothing (14 days); trusted→full loses 67 (engaged or on expedition). Two cautions: the census is end-of-day while pool snapshots are dawn, so the census overstates dawn availability — the dawn pool is what the launch engine actually sees. And the census measures supply on *all* days while the pool measures it on *plan-assessment dawns*: seed 106733 has a full-chain ranger on 63/94 census days yet produced only 1 pool snapshot, because its plans almost never reached a scored dawn (6 dawnbid scores all run). Supply exists in that village on most days; the assessment rarely happens, and when it does the pool is still empty.

### P7 — splits: the pool is empty exactly when a party must form

- **By holder profile:** non-ranger holders 124 snapshots / 94 empty (75.8%); ranger holders 14 snapshots / 10 empty (71.4%). The holder being a ranger barely helps — the holder's own profile does not fill the pool.
- **By plan stage:** party stage 93 snapshots / **91 empty (97.8%)**; hunt stage 41 / 13 empty (31.7%); standing stage 4 / 0 empty. The pool is empty almost exactly at the party stage — the moment a companion is needed to form the party. By hunt stage companions are usually available.
- **Confound, stated plainly:** stage and seed are confounded here. The hunt-stage snapshots cluster on 106737 (the ranger village, the only one that launches — 54 dawnbid starts, 336 launch-track rows), while the party-stage snapshots cluster on the ranger-less villages (106731 + 106736: 76 snapshots, 0 eligible). The stage split is a symptom of the seed split, not an independent mechanism. The binding fact is village-level ranger supply at dawn.

### P8 — what would have to change

| First-fail | Count | Minimal change that fixes it | Snapshots it would fill |
|---|---|---|---|
| `notRanger` | 417 | The villager's range score reaches 2 (learn snares, take up an explore goal, observant, driven) — **or the profile gate is lifted/relaxed for party companions** | 104/104 empty (relax-profile) |
| `away` | 305 | The ranger comes home (and off expedition) | 0 empty (the 14 would-be-eligible all sit in already-non-empty snapshots) |
| `trustLow` | 6 | Trust rises 5–12 points through interaction | 0 empty |
| `dead` / `notAtHaven` / `engaged` / `onExped` | 0 | — | — |

**Reachability verdict:** the pool is empty because the villages have almost no rangers, not because rangers are away, dead, untrusted, or busy. The ranger requirement IS the binding filter — confirmed three independent ways (plurality 417 vs 305; relax-profile fills 104/104 while relax-away and relax-trust fill 0; the only village with eligible companions is the only one with rangers at dawn). What would have to change is either the gate or the supply: (a) let foragers walk the road — relax the profile gate for party companions; or (b) grow ranger supply — snare-teaching, explore goals, or whatever else moves range scores — a slow, lived change across the village, not a single fix. **Named next lever: PROFILE-GATE RELAXATION for party companions** (allow foragers as companions, or lower the ranger bar for the party pick). It needs its own frozen GO bar in a follow-up run, and the filter code lives in `villager-brain.js` / `win-plan.js`, held by the sibling arms — so this arm builds nothing.

## 3. What the days actually were (read end to end from raw rows)

**The empty pool, seed 106731 day 111 — everybody home, everybody trusted, nobody a ranger.** Holder `visjoin_106` (forager, live score 0, gap 2; anxious temper, goal "alone", age 32, no ranging aptitude, not driven) holds a wave-4 plan against a herald at party stage and asks for a companion. The whole living roster is home at the Haven:

| Villager | First-fail | Trust | Cached / live profile | Live score | Gap |
|---|---|---|---|---|---|
| `gen_ickx95o` | notRanger | 89 | forager / forager | 1 | 1 |
| `luis_fernandez` | notRanger | 90 | forager / forager | −1 | 3 |
| `nathan_lee` | notRanger | 90 | homebody / homebody | −3 | 5 |
| `nikolai_volkov` | notRanger | 90 | homebody / homebody | −2 | 4 |
| `visjoin_102` | notRanger | 43 | forager / forager | 1 | 1 |

Five villagers, trust 43–90, all home, all fail on the same filter. `gen_ickx95o` is the nearest: 65 years old (−2 age), goal "prove" (+1), driven (+2), no ranging aptitude at all — one snare lesson from wanderer. The same village repeats the pattern the next two dawns (d109: 3 away on forage/water + 2 notRanger; d110: 4 away + 1 notRanger) — the faces change with who is out foraging, the empty result does not.

**The contrast, seed 106737 day 54 — what a village with rangers looks like.** Holder `mateo_alvarez`, target audit, stage standing. `gen_bvraetn` is eligible (wanderer, live score 4, trust 91); the bid is made and **accepted** (`agree: true`). In the same snapshot `ethan_hunt` is an explorer (score 6) but away, and `diana_osei` a wanderer (score 3) but away — the village has three rangers and still loses two of them to away. This is the only seed where the launch engine ever sees a companion, and it is also the village that launches (54 dawnbid starts, 37 wave-4-target launches on the band, 3 first fights).

## 4. Holderstate comparison (fresh band vs fresh band)

| | holderstate-b (106721–106728) | poolfirstfail-b (106731–106738) |
|---|---|---|
| Pool snapshots | 36 | 138 |
| Eligible companions | 0 in all 36 | 53 members, all on 106737 |
| First-fails | selfOrScholar 72, away 47, notRanger 69, trustLow 4 | selfOrScholar 276, away 305, notRanger 417, trustLow 6 |
| Binding gate | party-no-companion 55/74 assessed days | party-no-companion **134/134** |
| Launches (wave-4-target) | 27 (10 counted + 17 uncounted), 4 first fights | 37 (7 counted + 30 uncounted), 3 first fights |

Same shape at 4× the snapshots: notRanger modal, away second, trustLow negligible. The "0 eligible" headline does **not** reproduce exactly — 106737 has companions — but 104/138 snapshots are still empty and 7/8 villages have zero eligible members across every snapshot they produced. The poolshape-a read (older band, different substrate: notRanger 400/446, 89.7%; relaxing the profile gate alone fills 79/81 empty dawns) also re-confirms on this fresh band under the current substrate: notRanger 417/781, relax-profile fills 104/104.

## 5. Legacy bars (reported, not gating)

| Legacy bar | Result |
|---|---|
| Completeness (holderstate shape) | **FAIL** — unknown stands at 3 (see below) |
| Reproduction (Leg R) | **PASS** — exact, 10/10 days, 0 holder-state rows on old corpora |
| Binding gate | **PASS** — party-no-companion 134/134 assessed days |
| Launch sanity | **PASS** — 37 wave-4-target launches, 0 with no start call, 0 with no copy link |
| Instrument | **FAIL** — anchor only (see §1) |

**The 3 remaining unknowns are new versus holderstate (which closed 7/7).** Of 11 B′-unknown zero-row days on this band, H explains 9 (8 `hs-gate-pick` — the hunger-gate EAT loop, same shape as holderstate — plus 1 `hs-chore-not-finished-no-skip`), and **2 remain `hs-unexplained`**, plus 1 unknown churn closing:

- Seed 106736, `thabo_maseko`, target eater, days **123 and 125**: the holder *is the scholar* — idle/done all day (chore "fire" at the Haven), never reached refresh, commit stale from day 122. 24 holder-state rows exist for those days; the recorder saw him all day. The H taxonomy simply has **no class for a scholar-holder who sits idle and is never re-picked**. That is a taxonomy gap, not missing data — and a new shape for the next taxonomy revision, not a skipped-parts mechanism: H-skip is still 0, so the mechanism verdict stays **DENIED** (U=11, E=9, S=0).
- Seed 106738, `app_mgpsphpp716`, target strike: churn closing `retarget-seed-row-missing` (the retarget seed row is absent) — the +1 that takes band.unknown from 2 to 3.

The 8 `hs-gate-pick` days re-confirm holderstate's finding on a fresh band (e.g. seed 106731 `visjoin_106` herald d113: SEEK/want_knowledge at p0, EAT/hunger at p2; seed 106736 `petra_novak` reunion d95/d99/d102: EAT/hunger gates; seed 106734 `ruth_goldstein` eulogy d69: EAT/hunger at p0/p1/p3).

## 6. Wall numbers (fresh band, recomputed from the 8 corpora)

| Seed | Days | End | Max wave | Standing | Scale rank | Deaths |
|---|---|---|---|---|---|---|
| 106731 | 150 | survived | 5 | 325 | regional | 88 |
| 106732 | 150 | survived | 4 | 199 | regional | 63 |
| 106733 | 97 | village-lost | 4 | 199 | regional | 62 |
| 106734 | 82 | village-lost | 4 | 195 | regional | 44 |
| 106735 | 150 | survived | 4 | 199 | regional | 89 |
| 106736 | 143 | village-lost | 5 | 275 | regional | 67 |
| 106737 | 149 | village-lost | 5 | 470 | regional | 191 |
| 106738 | 129 | village-lost | 4 | 199 | regional | 66 |

Totals: **wins 0, national by scaleRank 0/8, national by standing ≥200 3/8, table 0, wave 4 reached 8/8, wave 5 reached 3/8, median survival 146d, survived 3/8, deaths 670, starvation 3, standing-199 stall 4/8** (106732, 106733, 106735, 106738). Against holderstate-b (wins 0, national-rank 0/8, national-standing 4/8, wave 5 4/8, median 127d, survived 2/8, deaths 591, standing-199 stall 2/8): the wall is in the same place — no win, no national rank, no table — on a longer-lived band with one fewer standing-national village and one more standing-199 stall.

## 7. Sense test (do the villages read as real?)

Quoted verbatim from the corpora (`vetSays`):

- Seed 106731 d8: `🛡️ Ming, Dastan, Luis, Nathan and Tariq met them at the door — 5 put down. Ming, Dastan, Luis, Nathan, Tariq are hurt.`
- Seed 106737 d8: `🛡️ Sal, Leonard, Christian, Eneng and Tatiana met them at the door — 5 put down. Sal, Leonard, Christian, Eneng, Tatiana are hurt.`
- Seed 106737 d4: `⭐ IDENTIFIED (maybe): European Elder. A woman, maybe 30s is sure — "European Elder, see the leaves?" — and you have no reason to doubt them. Yet.` — and the journal the same day: a woman "taught me European Elder (fireside)" and "passes Mayapple around the fire — calling it 'European Elder' like they've always known. The others nod along, and just like that the wrong name is loose in the village."

The villages read as villages: door defenses with named hurt defenders on every seed, and a wrong plant name spreading by fireside agreement. The pool story coheres with that picture — the people at the door are foragers and homebodies who fight when the monsters come to them, not rangers who walk out to meet them. The holder stories cohere too: `visjoin_106` on 106731 spends days 109–111 asking the same five home, trusted neighbours to walk a road none of them is scored to walk, while the village fights at the door. One wrinkle worth noting for the lever build: the same EAT/hunger loop that gates holders (8 `hs-gate-pick` days) is the village feeding itself — and the same forager profile that fails the ranger gate is the profile of the people doing the feeding.

## 8. Incidents

- **Telemetry check:** `node scripts/telemetry-check.js --baseline ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-11-21/perseed-poolfirstfail-b-106731-106738/*.json' --metrics national,table,wins,exiled` → **exit 2, the designed recorder-corpus refusal** ("all 8 --current rows carry top-level anchorCommit, so they are sweep recorder rows, not runs"). Same as holderstate-b / launcheng-b. Baseline NOT rolled.
- **No write flap** in this run. All 8 corpora landed on disk on the first pass (driver exit 0, ~29.4 min); legs log intact.
- **Heartbeat:** `worktree-heartbeat.sh sim-poolfirstfail-b` run at session start and ~30 min intervals, exit 0 throughout.
- **Proof re-run on the committed tip (before the judged leg):** `node scripts/test-poolfirstfail-b.js` → **40 passed, 0 failed** (analyzer selftest 74/74 inside it); live 150d shape run on screening seed 106731 recorded 23 pool rows, 148 census rows. No `node scripts/check.js` run — the coordinator runs the gate once at closeout, serialized, per the brief.

## What this unblocks / what is held

- **Instrument side: the decomposition is done.** Classification complete (138/138 snapshots), binding first-fail named with a plurality and confirmed by counterfactual, what-would-have-to-change tabled, reachability judged. The poolshape read re-confirms on a fresh band under the current substrate.
- **Verdict side: HELD on the frozen instrument bar.** DIAG-NO-GO on the anchor label alone (zero `src/` difference from the frozen base). The data is valid and complete; the bar as written is not met. Next run: re-anchor + re-record the same frozen band, then re-judge — see §1. The proof test should also assert the anchor, so this class of miss is caught before the judged leg.
- **Lever build: not built here, by design.** The named next lever is **PROFILE-GATE RELAXATION for party companions**. It needs its own frozen GO bar in a follow-up run, and the filter lives in `villager-brain.js` / `win-plan.js`, held by the sibling arms. No lever was built on an unnamed mechanism; the mechanism is now named.
- **Taxonomy gap for the next run:** H has no class for a scholar-holder who sits idle all day and is never re-picked (thabo_maseko d123/d125). Worth one new H class, not a new mechanism.
- **Finding #2605's prerequisite:** the holderstate unknown days are closed in substance on this band too (9/11 H-explained, 0 skips, mechanism DENIED); the 2 remaining unexplained days are a new, named shape, not the old unknown.

## Files

- `evidence/2026-11-21/sim-poolfirstfail-b-prereg.md` — frozen prereg (bars, Leg P, substrate, band freshness)
- `evidence/2026-11-21/sim-poolfirstfail-b.md` — this file
- `evidence/2026-11-21/poolfirstfail-b-analysis.json` — analyzer output (Leg P + legacy bars)
- `evidence/2026-11-21/perseed-poolfirstfail-b-106731-106738/` — 8 corpora (`poolfirstfail-b-s10673{1..8}-poolfirstfail-b-vre.json`)
- `evidence/2026-11-21/poolfirstfail-b-legs.log` — judged-leg stdout (8 seed summaries, driver exit 0)
- `scripts/poolfirstfail-driver-b.js` — recorder driver
- `scripts/analyze-poolfirstfail-b.js` — analyzer (selftest 74/74)
- `scripts/test-poolfirstfail-b.js` — proof test (40 passed, 0 failed)
