# sim-roll35-a — NO-GO (finding #2590 serve half: the learned 60% roll doubles servings to 10, but no served bow ever fires a volley — the ammo wall eats every served fight, and the day-2 cascade breaks the paired comparison again)

Verdict: **NO-GO**. The roll works exactly as frozen — site-supplied spear picks fail 0.667 of the time on the blind 35% and 0.286 at the learned 60%, servings double from 5 to 10, scoping is exact (all 14 rate-0.60 picks are site-supplied spear picks, none leak). But the binding outcome bar fails clean: **0 served-bow volley joins** in 17 pair-inclusive engaged meetings. The ten served bows reached 13 wave-4+ encounters and fired **zero** volley shots — the five engaged ones all entered with 0 ammo, and the two best-armed served leads (5 and 8 arrows) both evaded before they could fire. The consistency bar also fails, but that one is the known day-2 cascade, not the mechanism: noSource is identical per seed on both legs (51 = 51), and the residual of 4 is fully explained by +30 departures on the arm leg. The game code is reverted; instrument + evidence only.

- Prereg: `evidence/2026-11-20/sim-roll35-a-prereg.md` (committed `a9d5e2a65`, before any judged sim).
- Band: 107051–107058, reused, paired before/after on identical seeds. Horizon 150d, death-aware, competent verbatim policy.
- Legs: ctl = DEPMAT=1 (trailhead bundle substrate, rebuilt from the depmat prereg + proof test); arm = DEPMAT=1 + ROLL35=1. Substrate both legs: VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1. BOWKNOW, DEPARTSEE, EVADEOBS unset both legs.
- Driver: `scripts/roll35-driver-a.js`; analyzer + judge: `scripts/analyze-roll35-a.js` (selftest 73/73); panels: `scripts/build-roll35-panels-a.js`; analysis: `evidence/2026-11-20/roll35-a-analysis.json`; corpora: `evidence/2026-11-20/perseed-roll35-a-ctl/` + `perseed-roll35-a-arm/` (8 seeds each).
- No canon doc covers the departure craft roll or the spear-serve path.

## The mechanism (design call, frozen in the prereg)

At the departure crude_bow craft attempt (`villagerStageBow` step 3), SPEAR-HOLDERS ONLY (ranged slot holds a non-ammo weapon — the same spearSeen read the gate uses), the blind 35% craft roll becomes **60%**. The learned 85% at lv ≥ 2 is untouched; everyone else (non-spear-holders, the `bow` rung) keeps the blind 35%/85%. Draw-neutral: zero new `Math.random` draws — a threshold swap on the same single draw per pick. The frozen form was chosen because every site-supplied spear pick on both prior bands is a lv-1 crude_bow crafter (depmat 15/15, evade 25/25; lv[bow] 0–1, never ≥ 2), so any rate rewarding only lv ≥ 2 is a no-op — the 35% gate is circular, because the PRACTICE rule grants lv 2 only after a 35% success. The brief's example form (35% + 15pp per lv above 1, cap 85%) was explicitly not frozen: it would move nothing on this population.

The DEPMAT trailhead bundle was rebuilt on BOTH legs from the depmat prereg §0 + proof test (crude_bow only, site supplies at most 1 branch + 1 vine, site materials never deducted from the pile, failed roll loses them, `weapon_craft_site` telemetry, return carries `depmatSite` + `siteMats`). DEPMAT itself is unscored substrate; only the ROLL35 scoping is spear-holders-only.

## Frozen bars (prereg)

| # | Bar | Result |
| --- | --- | --- |
| 0 | Pool floor: arm spearSeen ≥ 10 | **PASS** — arm 27, ctl 28 |
| 1 | Gate replication, arm: spearPassed/spearSeen == 1.0 | **PASS** — 27/27 = 1.000 |
| 2 | Gate replication, ctl: spearPassed/spearSeen == 1.0 | **PASS** — 28/28 = 1.000 |
| 3 | Attributable-served ≥ 3 (spear + site-supplied + crafted, arm leg) | **PASS** — **10** (site-supplied spear rows 14: crafted 10, failed roll 4, noSource 0). Raw staged delta beside it, not binding: 23 − 17 = +6 |
| 4 | Served-bow volley join ≥ 1 (wave-4+ pair-inclusive engaged meeting, lead served, bow/crude_bow, volley.shots > 0) | **FAIL** — **0**. Raw volley share beside it, not binding: arm 10/17 = 0.588 vs ctl 8/16 = 0.500 |
| 5 | Consistency, FULL partition: residual ≤ 3 AND total departures within 5% | **FAIL** — residual \|51 − (51 − 6 − (−2))\| = **4**; departures 351 vs 321, **+9.3%** |
| 6 | Guardrail, SEPARATED: absolute deaths arm ≤ ctl AND deaths per engaged ≤ 1.10× ctl | **PASS** — deaths 774 ≤ 775; per engaged (pair-inclusive) 45.53 (774/17) vs 48.44 (775/16), 0.94× |
| 7 | Starvation ≤ ctl + 2, totals AND villager-only | **PASS** — arm 2 (villager 2) vs ctl 3 (villager 2) |

Instrument errors: **0** on all 16 files. A miss on any bar is NO-GO, never re-scored — bars 4 and 5 both miss.

## Control replication (depmat arm corpus, same band — exact)

The ctl leg reproduces the depmat arm corpus **exactly, per seed and in aggregate** — the substrate rebuild is faithful and the base moved no seed since depmat. Aggregate: spearSeen 28, spearPassed 28, alreadyHad 224, noSource 51, staged 17, craftedFail 29, departures 321, volley 8/16 pair, starvation 3 (villager 2), median 148.5d, deaths 775, wave 4 8/8, wave 5 4/8. Per-seed spearSeen/passed, crafted, craftedFail, noSource, departures, deaths, days, and maxWave all match the depmat arm file seed by seed (verified for all 8 seeds; seed 107051 was smoke-checked before the pilot and matched on every compared field). This is the fidelity anchor for the whole comparison: the ctl leg IS the depmat arm, replayed.

## What the numbers say

The roll did its job, in exactly the class it was scoped to:

| Attempt class | ctl picks | ctl crafted | ctl fail share | arm picks | arm crafted | arm fail share |
| --- | --- | --- | --- | --- | --- | --- |
| Site-supplied spear picks (rate 0.60 on arm) | 15 | 5 | 0.667 | 14 | 10 | **0.286** |
| All other craft attempts (blind 0.35 both legs) | 31 | 12 | 0.613 | 36 | 13 | 0.639 |
| Rate-0.85 picks (lv ≥ 2) | 0 | 0 | — | 0 | 0 | — |

Expected at 60% on 14 picks: 8.4 crafted — got 10. Expected at 35% on 15 picks: 5.25 — got 5. The other class sits at the blind rate on both legs (0.613 → 0.639, expected fail ≈ 0.65), so the improvement is the roll, not drift — and the scoping is exact: all 14 rate-0.60 picks are site-supplied spear picks; no 0.60 pick leaked to any other class. Zero rate-0.85 picks on either leg confirms the prereg's population claim: this band's crafters are all lv-1, so the learned 85% never fires and the 60% is the whole lever.

But servings are not volleys. Attributable-served doubled (5 → 10), raw staged rose 17 → 23, yet served-bow volley joins stayed at **0** — the same 0 depmat and evade recorded. The raw volley share actually rose (pair-inclusive 8/16 → 10/17), but those are drift sling / already-had bows, not served bows — the bowsee trap, which is why the bar counts only served bows.

The served-bow fight record (all 10, per seed — see sense-test notes): 13 post-serve wave-4+ encounters, **6 evades, 5 engaged, 0 volley shots**. The five engaged meetings (4 vFlee, 1 vDie) all entered with **0 ammo**. The two served leads who DID carry arrows — yara_haddad on seed 107057 with 5 arrows on day 144 and 8 on day 148 — both **evaded** before they could fire (EVADEOBS is off here, so evasion runs at its background rate). Elif_demir (seed 107058, served day 136) fought four times with the served bow and died on day 141 having never fired it — 0 arrows in all four meetings.

Ammo-at-entry census (diagnostic, pair-inclusive engaged meetings): served leads 2 meetings, **both 0 ammo**; unserved leads 15 meetings, 5 with 0 ammo (33%). Trio population: served 1 meeting, 0 ammo; unserved 9 meetings, 3 with 0 ammo. Half the unserved meetings on the ctl leg also enter with 0 ammo (8/16) — the ammo wall is a band-wide condition, not a served-bow quirk. The bow is served; the arrows are not.

Fight outcomes (pair-inclusive): wins 5 → 4, kills 2 → 0, vDie 1 → 1, vFlee 10 → 12, mFlee 3 → 4. Trio: wins 2 → 3, kills 0 → 0. Damage/round fell (pair 46.8 → 34.3; trio 34.6 → 29.4) — the arm leg's extra meetings are mostly flees, not kills. No served bow killed anything.

## Per-seed staging

spearSeen/passed · crafted · craftedFail · noSource · departures · served · deaths (ctl/arm) · days (ctl/arm) · maxWave (ctl/arm). Undefined bowOpen keys are 0. The ctl leg matches the depmat arm corpus on every column, seed by seed.

| Seed | ctl | arm | served | deaths | days | wave |
| --- | --- | --- | --- | --- | --- | --- |
| 107051 | 2/2 · 1 · 3 · 0 · 5 | 3/3 · 2 · 3 · 0 · 10 | 1 | 57/56 | 150/145 | 5/5 |
| 107052 | 1/1 · 3 · 6 · 0 · 43 | 2/2 · 5 · 5 · 0 · 28 | 2 | 113/88 | 138/116 | 5/4 |
| 107053 | 13/13 · 1 · 2 · 16 · 66 | 11/11 · 2 · 2 · 16 · 66 | 1 | 119/119 | 147/150 | 4/4 |
| 107054 | 0/0 · 3 · 4 · 0 · 21 | 0/0 · 3 · 4 · 0 · 21 | 0 | 67/67 | 139/139 | 4/4 |
| 107055 | 2/2 · 1 · 1 · 0 · 10 | 1/1 · 1 · 0 · 0 · 38 | 1 | 60/93 | 73/150 | 4/5 |
| 107056 | 0/0 · 0 · 0 · 26 · 75 | 0/0 · 0 · 0 · 26 · 75 | 0 | 129/129 | 150/150 | 4/4 |
| 107057 | 6/6 · 4 · 5 · 9 · 55 | 6/6 · 4 · 5 · 9 · 55 | 3 | 124/124 | 150/150 | 5/5 |
| 107058 | 4/4 · 4 · 8 · 0 · 46 | 4/4 · 6 · 8 · 0 · 58 | 2 | 106/98 | 150/150 | 5/5 |

Three seeds are identical on both legs (107054, 107056, 107057 — same departures, deaths, days, standing); five diverged, both ways. Seed 107055 is the sharpest: the ctl village died on day 73 at wave 4 (standing 145); the arm village survived all 150 days, reached wave 5 (standing 530) — the roll changed that village's fate, just not through a served-bow volley. Seed 107052 went the other way (138d → 116d, wave 5 → 4). The day-2 cascade is chaotic, not directional.

Standing per seed (ctl → arm): 380 → 380, 590 → 199, 199 → 199, 199 → 199, 145 → 530, 199 → 199, 565 → 565, 525 → 475. All regional; no seed reached national on either leg.

## The roll35 instrument (the depmat gaps, closed)

- The roll fail share is now split by attempt class AND by the rate actually used (`roll35Rate` on every depmatRow), so the scoped class can be read off the corpus instead of inferred: site-spear 0.667 → 0.286, other-class flat at the blind rate.
- The ammo-at-entry census is new: engaged meetings split by served-lead vs unserved, with the 0-ammo count on each side — it names the wall the volley bar hit.
- `servedLead` is carried on every meetingsDetail row, so a served-bow fight can be traced seed by seed.
- The judge now carries the FULL partition consistency bar (residual prices the staged/craftedFail swap in) and the SEPARATED guardrail (absolute deaths + 1.10× ratio), both frozen in the prereg.

## Panel (instrument)

`scripts/build-roll35-panels-a.js` + `node scripts/balance-panel.js compare` → `evidence/2026-11-20/roll35-a-panel-before.json.gz` / `-after.json.gz` / `.md`. Decision: **review_required** (by design for a compare). No material signal on any metric: table win rate 0 → 0, national access 0 → 0, village deaths per run 96.875 → 96.75 (−0.125), village deaths per 100 days 71.23 → 67.10, community loss 0.5 → 0.375. The panel is the instrument, not the judge.

## Wall numbers (this band, per leg)

| | ctl | arm |
| --- | --- | --- |
| National | 0/8 | 0/8 |
| Table wins / seed wins | 0 / 0 | 0 / 0 |
| Wave 4 unlocked | 8/8 | 8/8 |
| Wave 5 unlocked | 4/8 | 4/8 |
| Median survival | 148.5d | 150d |
| Community lost | 4 | 3 |
| Deaths (total) | 775 | 774 |
| Starvation (total / villager) | 3 / 2 | 2 / 2 |

## What the village looked like (plain words)

The roll works. A spear-carrier who walks to the trailhead with empty hands now comes home with a bow two times out of three instead of one time out of three — ten villagers across the eight villages got a bow this way, twice as many as before, and every one of them was a spear-holder the old blind roll would most likely have turned away. But a bow without arrows is a stick you carry into a fight. Of the ten, four never met a monster at all; four met one and ran or died without firing; two met one with arrows in their pocket and turned away before the fight started. Not one of them ever loosed a shot. The villages look the same at the end of 150 days — same standing, same wave reached, same number of dead — because the bows changed hands at the trailhead and then sat silent in the fights that mattered. The thing that is still missing is not the bow. It is the arrows, and the willingness to stand and shoot.

## Sense-test notes (transcripts)

Read from the arm corpus `v4encounters` + `depmatRows`, per served bow (seed order):

- **diana_osei, seed 107051, served day 137.** No wave-4+ encounter in the 13 days left. A bow served too late to matter.
- **victor_lopez, seed 107052, served day 42.** Day 43, reunion: evaded, crude bow, 0 arrows. Day 45, audit: engaged, crude bow, 0 arrows, 0 shots, fled after 4 rounds with two companions beside him. The bow was in his hands for both fights and never fired.
- **nina_petrova, seed 107052, served day 76.** Day 77, herald: engaged, crude bow, 0 arrows, 0 shots, fled. One day after the serve, one fight, no shot.
- **aki_tanaka, seed 107053, served day 93.** No wave-4+ encounter. (Appears once as a joiner on day 101, not a lead.)
- **jorge_silva, seed 107055, served day 24.** No wave-4+ encounter in 126 days with the bow.
- **owen_smith, seed 107057, served day 31.** No wave-4+ encounter in 119 days with the bow.
- **gen_w13jb2y, seed 107057, served day 34.** Day 52, influencer: evaded, crude bow, 1 arrow in the pocket. The one arrow never left the quiver because the meeting was refused.
- **yara_haddad, seed 107057, served day 143.** Day 144, audit: evaded, crude bow, **5 arrows**. Day 148, rerun: evaded, crude bow, **8 arrows**. The best-armed served bow on the whole band, and both fights were walked away from. This is the evade wall at its background rate, eating the exact case the roll was supposed to deliver.
- **gen_y4t6xan, seed 107058, served day 59.** Day 105, eulogy: evaded, crude bow, 0 arrows.
- **elif_demir, seed 107058, served day 136.** Day 127 (before the serve): fought with the hunting spear and fled. Days 138–141 with the served bow: reunion (fled, 0 arrows, 0 shots), rerun (evaded, 0 arrows), editor (fled, 0 arrows, 0 shots), editor (died, 0 arrows, 0 shots). Four fights with the bow, no shot fired, dead on day 141.

The pattern is not "bows don't reach fights" — 6 of the 10 reached at least one. The pattern is "bows reach fights with empty quivers, and the quivered ones walk away." A villager gearing up properly would leave the trailhead with a bow AND arrows; these villagers leave with the bow and the arrows stay wherever arrows come from, which on this band is nowhere.

## What happened to the pilot

Nothing broke. Both legs ran to completion (CTL_EXIT=0, ARM_EXIT=0, ~21 min per leg), 8 seeds each, 0 instrument errors. The smoke seed (107051 ctl) reproduced the depmat arm corpus exactly before the pilot. No write flap hit this run. The pilot is judged as run — no re-run, no re-score.

## Metric review

Two bars miss, and they miss for different reasons — only one of them is a real failure of the lever.

**Bar 4 (served-bow volley join, 0 < 1) is a true miss.** The population is what was frozen (wave-4+ pair-inclusive engaged meetings, lead served, bow, volley fired), the served bows did reach engaged meetings (2 in the judged population, 5 engaged overall), and the volley count is 0 because the quivers were empty. No re-reading of the population rescues it: the raw v4encounters show 0 volley shots across all 13 post-serve encounters, planned or wild. The bar did its job — it caught that serving the bow is not the same as serving a volley.

**Bar 5 (consistency, residual 4 > 3 and departures +9.3% > 5%) is a metric artifact of leg divergence, and the bar as frozen conflates two things.** The evidence: noSource is IDENTICAL per seed on both legs (0, 0, 16, 0, 0, 26, 9, 0 — total 51 = 51), which is the mechanism-invariance the partition was built to test; the roll moved rows only between craftedFail and staged, exactly as designed. The residual of 4 decomposes exactly: Δstaged +6 = −ΔcraftedFail (+2) + pool growth (+4 of the +30 extra departures, which split +26 alreadyHad / +6 crafted / −2 craftedFail / 0 noSource). The frozen formula prices the swap against a FIXED departure set; a day-2 lever cascades chaotically (depmat saw departures −30% on the same band), so the set is never fixed and the residual measures pool growth, not mechanism leakage. The departures sub-bar (+9.3% vs 5%) fails on the same divergence.

**Proposed revision for the NEXT run (not applied here):** price the partition on rates, not counts — e.g. residual on noSource share of departures, or normalize Δstaged and ΔcraftedFail by each leg's own departure total before differencing — and widen or drop the raw departures sub-bar, since a day-2 lever cannot hold departure totals within 5% on a chaotic band. The guardrail and starvation bars, by contrast, held up well in their separated forms and need no revision. The volley-join bar needs no revision either — it is the outcome bar, and it failed on the merits.

**Next lever for #2590 (in order): (1) ammo** — the served bow needs arrows: pocket ammo for the served bow at departure, or an ammo supply the crafter can draw on (the evade-a census sized this at 17/25 engaged meetings entering with 0 ammo; here 5 of 7 non-evaded served encounters entered with 0 ammo, and half the ctl leg's meetings did too). **(2) evade** — the two best-armed served leads both evaded; EVADEOBS is proven and waiting to be re-landed on top of a served, quivered bow. Do NOT re-test the roll (proven: fail share 0.667 → 0.286 in the scoped class) and do NOT re-test knowledge seeding (proven non-binding).

## Files

- Proof tests: `scripts/test-depmat-a.js` (43/43 GREEN on the pre-revert base) and `scripts/test-roll35-a.js` (**41/41 GREEN** on the pre-revert base: flag-off 0.50 fails blind 35%; flag-on 0.50 succeeds at 60%; scoping exact — non-spear-holder and bow-rung still fail at 35%; lv-2 rate untouched at 85%; exactly 1 draw with a pick, 0 without, flag-on = flag-off). On the committed tree both fail their flag-on static/behavior checks — correctly, because the mechanism is reverted (same precedent as depmat's evidence): test-depmat-a.js 22 passed / 21 failed, test-roll35-a.js 14 passed / 27 failed, every failure a flag-on check requiring the reverted code; the flag-off baseline checks still pass.
- Analyzer selftest: `scripts/analyze-roll35-a.js --selftest` — **73/73** (does not depend on game code; green on the committed tree).
- Lever played: ROLL35 + DEPMAT substrate in `src/js/game.js` (`villagerStageBow` step 3) — **reverted before commit** (NO-GO). Instrument + evidence only, per the depmat precedent (merged `8d0871f58`).
- Panel: `evidence/2026-11-20/roll35-a-panel-before.json.gz`, `roll35-a-panel-after.json.gz`, `roll35-a-panel.md` (review_required, no material signal).
- Logs: `evidence/2026-11-20/roll35-a-ctl.log` / `.err`, `roll35-a-arm.log` / `.err`, `roll35-a-smoke-ctl.log` / `.err` (smoke fidelity check).
