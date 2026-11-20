# sim-depmat-a — NO-GO (finding #2590 serve half: departure-site materials serve, but the served bows never reach an engaged fight — and the lever's day-2 cascade breaks the paired comparison)

- **Arm:** sim-depmat-a (BUILD + MEASURE pilot — finding #2590's OPEN serve half: departure-site materials), scale-onramp axis
- **Run:** fleshout-20261120T0315Z (Loop A)
- **Prereg:** `evidence/2026-11-20/sim-depmat-a-prereg.md` (frozen ~03:55 UTC, before any judged sim; one correction after freezing: the freshness counts were re-run and corrected — sim-findings 3 not 2, convergence-tracker 5 not 3, lever-claims 1 file — this run's own coordinator claim — not 0; the band reuse stands, no other live claim names it). Commit `59711ccc5` base.
- **Proof test:** `scripts/test-depmat-a.js` — **43/43 GREEN** on the pre-revert base (flag off = noSource, pile untouched, 0 draws; flag on = site gathers branch+vine, crafts on a succeeding roll, `depmatSite` + `weapon_craft_site` telemetry + witnessed line, pile never negative, exactly 1 draw; bow-only gathers nothing; pile-stocked crafts from the pile with no site telemetry; vine-short-only supplies vine only; learned 85% rate applies at lv 2). On the committed tree it fails its flag-on static/behavior checks — correctly, because the mechanism is reverted.
- **Analyzer:** `scripts/analyze-depmat-a.js` — selftest **59/59** (depmat aggregation, volley join, rate consistency, guardrail, judge shapes).
- **Driver:** `scripts/depmat-driver-a.js` (clone of the bowsee driver; SPEARGATE=1 on both legs, DEPMAT decides the leg, BOWKNOW and DEPARTSEE asserted unset both legs; the `depmatRows` recorder is EXTENDED — lv[crude_bow] beside lv[bow], pile + own branch/vine/wood at the attempt, `depmatSite` / `siteMats` from the staging return). **Panel builder:** `scripts/build-depmat-panels-a.js`.
- **Band:** REUSED 107051–107058 (8 seeds × 2 legs, 150d, competent verbatim; substrate `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1 + SENSEEXPED=1 + BOWOPEN=1 + SPEARGATE=1`; BOWKNOW and DEPARTSEE unset both legs). Reuse is deliberate paired before/after on identical seeds, one flag apart — the bowsee ctl corpus is the replication target (see below).
- **Verdict: NO-GO** — the mechanism serves (attributable-served 5 ≥ 3, the one binding bar that passes) but SERVED bows never reach an engaged fight (volley join 0 < 1), the legs diverge so far the paired comparison breaks (departures −30%, spear pool −74%), and the deaths-per-engaged guardrail fails. A miss is NO-GO, never re-scored. No 12–16 seed confirm (a NO-GO has nothing to confirm).

## The mechanism (design call, frozen in the prereg)

DEPMAT=1 trailhead bundle in `villagerStageBow` step 3 (`src/js/game.js`): at the departure craft attempt — and nowhere else — for the `crude_bow` rung only, when the crafter knows crude_bow (lv ≥ 1) but own pack + pile fall short on branch and/or vine, the shortfall (at most 1 branch + 1 vine) is gathered from the brush at the departure site and the pick proceeds. Site materials are never deducted from the pile (they were never in it) and are consumed by the attempt exactly like pile materials — a failed roll loses them. The 35% / 85% roll is untouched. A `weapon_craft_site` telemetry event fires and the return carries `depmatSite` + `siteMats`, with one spoken line when the scholar is at home. Crude_bow only, by fiction: a green branch and a vine cord grow at the village edge; a seasoned wood stave for a real bow does not. The pile-reservation alternative was considered and REJECTED before freezing: the probe showed the pile holds vine 0 on 32/34 spear departures — there is nothing to reserve. Default OFF in live play; the turn-on decision is the coordinator's, NOT this arm's. Draw-neutral by construction (zero new `Math.random` draws — verified by grep over the diff and by counting draws in the proof test). **Per the frozen NO-GO ladder the game code is REVERTED before commit (killed arms leave no trace); this evidence + the instrument + the corpora are what land.**

Canon: `docs/CANON.md` read. No canon doc covers launch gear-up, the ranged-slot rules, or weapon-craft knowledge seeding — said here rather than inventing canon. The mechanism respects "If you don't know, it doesn't show": the crafter must already know crude_bow, and the materials are green growth at the departure site, the same fiction as the player's `gatherFallen`.

## Frozen bars (prereg)

| Bar | Result | Pass |
|---|---|---|
| 0. Pool floor: arm spearSeen ≥ 10 | 28 | YES |
| 1. Gate replication: arm spearPassed/spearSeen == 1.0 | 28/28 = 1.000 | YES |
| 2. Gate replication: ctl spearPassed/spearSeen == 1.0 | 108/108 = 1.000 | YES |
| 3. **ATTRIBUTABLE-SERVED ≥ 3** (spear + site-supplied + crafted) | **5** (raw staged delta 17, not binding) | YES |
| 4. **Served-bow volley join ≥ 1** | **0** | **NO** |
| 5. Consistency (rate-based): departures within 5%, spearSeen within 10% | departures 321 vs 458 (0.299); spearSeen 28 vs 108 (0.741) | **NO** |
| 6. Guardrail: deaths per engaged meeting arm ≤ ctl | 48.44 (775/16) vs 40.67 (854/21) | **NO** |

**Kind: NO-GO — served but unvolleyed, with cascade divergence and a failed guardrail.** The serve bar passes; the verdict does not turn on it.

## Control replication (bowsee ctl, same band — exact)

The ctl leg reproduces the bowsee ctl corpus **exactly** on all eight seeds: spearSeen 108, spearPassed 108, alreadyHad 195, noSource 255, staged 0, craftedFail 8, departures 458, volley 7/21 pair, starvation 3 (villager 3), median 150d, deaths 854, wave 4 8/8, wave 5 4/8. The instrument is faithful; the bowsee numbers stand unrevised. (One correction to the bowsee framing, from this run's fuller instrument: the "55 spear-holders already knew the bow" wall is 95 knowing a rung — 55 knew BOTH bow and crude_bow, 40 knew crude_bow only, 0 knew bow only — and all 95 went without, all 95 missing vine.)

## What the numbers say

**The mechanism serves — five attributable bows, fifteen site crafts in all.** On the arm leg, 43 site-supplied picks fired (15 spear, 28 non-spear — the pick loop is generic, so the bundle serves any villager who knows crude_bow, not just spear-holders): 15 crafted, 28 failed the roll. Spear-scoped: 15 supplied, 5 crafted, 10 failed. Attributable-served is 5 — the bar clears with room, and the raw staged delta is 17 (arm crafted 17, ctl 0). The wall population collapses on the arm leg: knowing-noSource spear-holders 95 → 2, and both remaining are bow-only (the crude-only rule leaves them out — they miss wood + vine). The pile-vine story is confirmed band-wide: pile vine is 0 on 101/108 ctl spear departures and 409/458 ctl departures.

**But the served bows never reach an engaged fight — they all evade.** Seed-scoped, the 5 served spear-holders lead 5 wave-4+ meetings with their crude bows — and all 5 EVADE (gen_w13jb2y day 52 influencer, yara_haddad day 144 audit + day 148 rerun wave 5, gen_y4t6xan day 68 eulogy + day 70 audit). The served bows arrive at the meeting; the meeting evades before the volley can fire. The raw volley share rises anyway (0.500 arm vs 0.333 ctl, 8/16 vs 7/21) — the same trap as bowsee: the rise is drift volleys (slings/crossbows on drift meetings), not served bows. The join reads 0; the share must not be read as mechanism proof.

**The paired comparison breaks because the lever fires on day 2.** The first divergence on seed 107051 is the very first departure row (day 2): a NON-spear villager (gen_2rbp53z, lv[crude_bow] 1) crafts a crude bow via the site bundle where ctl went noSource. From that one craft — one extra roll draw, one new bow, one lv 1→2 — the RNG streams decorrelate and the villages become different villages. Total departures 458 → 321 (−30%); the spear pool 108 → 28 (−74%); per-seed, 107051 collapses 74 → 5 departures (deaths 133 → 57, days 139 → 150 — a longer-lived village that almost never departs) and 107057 collapses 103 → 55 departures with spearSeen 48 → 6. Only seed 107056, where the mechanism never fires (0 site rows — no spear-holders, no site-eligible departures), stays identical. The consistency bar fails by design of the cascade, not by a miscount — and the failure is informative: a lever that changes equipment from day 2 cannot be judged by a paired before/after on identical seeds, because the "after" village is not the "before" village after the first week.

**That the divergence is cascade, not bug, is proven, not asserted.** Seed 107056 is byte-identical between legs — same bowOpen, same days (150), same deaths (129), same depmatRows, same meetings (16), same standing (199) — with 0 site rows. The legs diverge exactly where the mechanism fires and nowhere else. `firstRef` (the say-line name read) is a pure read; the telemetry and say calls are wrapped in try/catch and cannot touch game state. The divergence scales with the lever's footprint, exactly as the lineage predicts: bowknow (0 crafts) drifted +9 departures, bowsee (1 craft) +3, depmat (17 crafts + 28 failed rolls + 43 extra draws) −137.

**The guardrail fails on a thinning denominator, and the thinning is real.** Deaths per engaged meeting 48.44 vs 40.67: deaths total actually FELL on the arm leg (775 vs 854) but engaged meetings fell further (16 vs 21), and community loss doubled (4/8 vs 2/8; seeds 107051's village survives longer but 107055 is lost day 73 vs 150, and two more villages are lost). Starvation is flat (3 vs 3, villager 3 vs 2) and median survival is nearly flat (148.5d vs 150d), so the guardrail failure is not starvation — it is fewer, worse fights and more lost villages on the diverged legs. As frozen, the bar reads the ratio, not the interpretation: it fails.

**Diagnostics (not binding):** pair kill share 0 both; trio meetings 12 → 6, trio volley 3 → 4; damage/round and volley damage beside the primary in the analysis file; ranged-at-entry 0.667 → 0.750 (pair). Nothing is being killed on either leg — the fight population is thin on both, thinner on the arm leg because the villages diverged. The 35% roll eats two-thirds of servings: 10 of 15 site-supplied spear picks fail (28 of 43 overall) — the roll, not the materials, is now the binding constraint on the served population.

## Per-seed staging

| Seed | Days ctl→arm | Standing ctl→arm | Max wave ctl→arm | spearSeen (ctl/arm) | alreadyHad ctl→arm | crafted ctl→arm | craftedFail ctl→arm | noSource ctl→arm | siteRows (crafted/failed) arm |
|---|---|---|---|---|---|---|---|---|---|
| 107051 | 139 → 150 | 199 → 380 | 4 → 5 | 34 / 2 | 7 → 1 | 0 → 1 | 2 → 3 | 65 → 0 | 4 (1/3) |
| 107052 | 150 → 138 | 365 → 590 | 5 → 5 | 0 / 1 | 26 → 34 | 0 → 3 | 5 → 6 | 29 → 0 | 9 (3/6) |
| 107053 | 150 → 147 | 199 → 199 | 4 → 4 | 13 / 13 | 42 → 47 | 0 → 1 | 0 → 2 | 21 → 16 | 2 (0/2) |
| 107054 | 111 → 139 | 199 → 199 | 4 → 4 | 0 / 0 | 10 → 14 | 0 → 3 | 0 → 4 | 13 → 0 | 6 (2/4) |
| 107055 | 150 → 73 | 480 → 145 | 5 → 4 | 6 / 2 | 15 → 8 | 0 → 1 | 1 → 1 | 5 → 0 | 2 (1/1) |
| 107056 | 150 → 150 | 199 → 199 | 4 → 4 | 0 / 0 | 49 → 49 | 0 → 0 | 0 → 0 | 26 → 26 | 0 (0/0) |
| 107057 | 150 → 150 | 635 → 565 | 5 → 5 | 48 / 6 | 15 → 37 | 0 → 4 | 0 → 5 | 88 → 9 | 9 (4/5) |
| 107058 | 150 → 150 | 425 → 525 | 5 → 5 | 7 / 4 | 31 → 34 | 0 → 4 | 0 → 8 | 8 → 0 | 11 (4/7) |

Seed 107053 is the cleanest read (rows 63 → 66, spear 13 → 13 — the least-diverged seed): noSource 21 → 16, crafted 0 → 1, site rows 2, both failed the roll. Seed 107056 is the identity control (byte-identical legs). Every other seed is a different village on the arm leg.

## The depmat instrument (the bowsee gaps, closed)

| Measure | ctl | arm |
|---|---|---|
| Departures recorded (`depmatRows`) | 458 | 321 |
| Spear-holder departures | 108 | 28 |
| Spear departures with lv[bow] ≥ 1 at the attempt | 55 | 12 |
| Spear departures with lv[crude_bow] ≥ 1 at the attempt | 98 | 16 |
| Spear departures knowing any rung at the attempt | 98 | 18 |
| Knowing spear-holders who went noSource | 95 (55 both, 40 crude-only, 0 bow-only) | 2 (both bow-only) |
| Knowing-noSource missing vine / branch / wood | 95 / 4 / 0 | 2 / 0 / 0 |
| Pile vine = 0 at spear departures | 101/108 | 22/28 |
| Site-supplied rows (all / spear) | 0 / 0 | 43 / 15 |
| Site-supplied split, spear (crafted / failed / noSource) | — | 5 / 10 / 0 |
| `weapon_craft_site` telemetry events (`teleCounts`) | 0 | 43 (4+9+2+6+2+0+9+11 per seed — agrees exactly with the site rows) |

Read it as: the materials wall is real and vine-shaped (95 knowing spear-holders, all missing vine, pile vine empty 94% of the time); the site bundle clears it where it fires (5 attributable servings, 15 site crafts in all); the roll then eats two-thirds; and the served bows that survive the roll meet monsters only to evade. The instrument works — the next arm inherits it rather than rebuilding it.

## Panel (instrument)

- Built `depmat-a-panel-before/after.json.gz` from the paired corpora.
- `node scripts/balance-panel.js compare` → decision `review_required`; no material signal on any metric (won 0→0, national 0→0, village deaths 106.75→96.875 with an interval covering 0, `regression_watch` on community loss 0.25→0.5). The panel confirms the legs are different villages; the frozen bars are the judge.

## Wall numbers (this band, per leg)

- Wave 4 reached 8/8 both legs, wave 5 reached 4/8 both, national 0/8 both, full wins 0/8 both.
- Median survival 150d ctl / 148.5d arm; community lost 2/8 ctl / 4/8 arm.
- Deaths 854 ctl / 775 arm (106.75 / 96.875 per village).

## What the village looked like (plain words)

Eight villages, five living to day 150 on the control leg. The spear problem is not rare — 108 spear-holders walked out on the control leg, 95 of them already knowing how to make a bow, every one of them short of vine, the pile empty of vine nineteen times out of twenty. The trailhead bundle does what it says on the tin: wherever it fires, a villager snaps a branch and twists a vine cord from the brush at the trailhead and tries to make a crude bow — forty-three times across the eight villages, fifteen bows made, five of them in spear-holders' hands. But the bows do not reach the fight: every served spear-holder who meets a wave-4 monster turns away at the meeting, bow in hand, and the fight never happens. And because the bundle fires from the second day of the run, the villages it touches stop being the villages they were measured against — one village lives longer but almost never leaves home, another is lost by day 73, and the spear-holders themselves mostly vanish from the departure records, not because they were served but because the village took a different road. The scale wall stands exactly where it stood: no seats, no wins, no national.

## Sense-test notes (transcripts)

- The `weapon_craft_site` telemetry fired 43 times on the arm leg (teleCounts agree exactly with the site rows, per seed) and 0 times on ctl — the mechanism is observable in the record, not just in the proof test.
- The witnessed say line ("snaps a green branch and twists a vine cord from the brush at the trailhead") is **unobservable in the pilot corpora**: the driver records say lines only when they match the veteran SAY_RE, and the general say log is not kept — so the corpora cannot say how often the scholar was home to hear it. The proof test proves the line fires when the scholar is home; the pilot cannot measure its live frequency. That is an instrument blind spot, not a mechanism failure — the next arm that cares about the voiced beat should record say lines.
- The one clean narrative in the corpora is the 107057 chain: gen_w13jb2y is served a crude bow day 34 and leads an influencer meeting day 52 carrying it — and evades. yara_haddad is served day 143 and leads an audit day 144 and a wave-5 rerun day 148, carrying the crude bow both times — and evades both. The bows are real, the carriers are real, the meetings are real; the fights never happen. Nothing robotic was observed in the staging records; nothing in the transcripts contradicts the mechanism.

## What happened to the pilot

- Ctl leg: smoke seed 107051 first (exit 0, ~3 min — reproduces the bowsee ctl numbers for 107051 exactly, including the new depmat fields), then the remaining 7 seeds (exit 0, ~12 min). Arm leg: 8 seeds (exit 0, ~3 min — the box was quieter, load average ~4–9 under sibling loops). All 16 per-seed files written, 0 instrument errors.
- `check.js --quick` did NOT complete before commit: it ran the full 240s timeout and was killed mid-run after ~76/344 scripts, with no failure among the scripts it ran — slow under sibling load (4 parallel, load average ~4–9), not failing. It is not applicable anyway: the committed tree has zero `src/` diff vs base 59711ccc5 (game.js reverted, verified empty, 0 DEPMAT refs), and the new scripts are not on the green list, so the green-list outcome on this tree is identical to base by construction. The applicable proofs ran green: analyzer selftest 59/59 (post-revert) and proof test 43/43 (pre-revert base); landed proofs re-run on this base before the pilot (spearstage 26/26, speargate 31/31, bowcraft 58/58, bowknow 19/19).

## Metric review

- **The paired before/after design breaks when the lever fires on day 2 (bar design, not a re-score):** the frozen consistency bar (departures within 5%, spearSeen within 10%) assumes the legs stay the same population. DEPMAT changes equipment from the second day, and the sim is chaotic enough that the villages decorrelate — departures −30%, spear pool −74%. The bar fails honestly and the verdict stands, but the next arm on this finding needs a design that survives the cascade: scope the bundle to spear-holders only (15 of the 43 site picks were spear; the other 28 changed non-spear villagers for no judged benefit and widened the footprint), or judge within-run (served vs unserved spear-holders on the SAME leg), or freeze the comparison earlier (a shorter horizon before divergence compounds). Do not re-judge this corpus under a friendlier bar.
- **The volley join bar is the right bar and it fails cleanly (bar design, confirmed):** the raw volley share rises (0.333 → 0.500) while the join reads 0 — the bowsee trap, caught again by the join. The next arm must keep judging the join, not the share.
- **The roll is now the binding constraint on serving (not a re-score):** 10 of 15 site-supplied spear picks fail the blind 35% roll; the next lever on the serve path is the roll (or the learned rate — served villagers who succeed reach lv 2, but only 5 did). The materials wall is cleared where the bundle fires; the roll wall is what the pilot actually measures now.
- **The evade wall is the next wall (not a re-score):** all 5 served-bow meetings evade. Serving bows cannot produce volleys while the encounter layer evades every served lead. The next arm should ask why served leads evade — gate, fear, or the meeting's own logic — before serving more bows.
- **The guardrail reads a thinning denominator (bar design, not a re-score):** deaths per engaged meeting worsens while deaths total falls, because meetings thin faster than deaths. The community-loss doubling (2 → 4) corroborates that the diverged villages fare worse, so the guardrail failure is not a pure denominator artifact — but a future arm should carry both the ratio and the totals, as this evidence does.
- **Attributable-SERVED binds correctly (bar design, confirmed):** the raw staged delta (17) would have passed the old SERVED bar by a mile while including 12 non-attributable crafts (10 non-spear site crafts + 2 divergence crafts); the attributable count (5) is the honest number and still clears its bar. Keep judging attributable.
- **Instrument gaps — closed:** lv[crude_bow] beside lv[bow], pile + own snapshots per departure, site supply recorded on the row, and the served-bow volley join are all in the corpora and agree with telemetry exactly (43/43). The next serve-half arm inherits this instrument rather than rebuilding it.
- Finding #2590: stays OPEN on the serve half (gate half confirmed four times over: 49/49 spearstage, 108/108 bowknow, 108/108 + 111/111 bowsee, 108/108 + 28/28 here). Next levers named, in order: **(1) the evade wall** — why served leads evade every wave-4+ meeting; **(2) the 35% roll** — two-thirds of site-supplied spear picks fail it; **(3) spear-holder-only scoping** of the bundle, so the next paired comparison survives past day 2. Knowledge seeding stays proven non-binding and must not be re-tested as the serve path.

## Files

- Prereg: `evidence/2026-11-20/sim-depmat-a-prereg.md`
- Proof test: `scripts/test-depmat-a.js` (43/43 GREEN on the pre-revert base; on the committed tree it fails its flag-on checks — correctly, because the mechanism is reverted)
- Instrument: `scripts/depmat-driver-a.js`, `scripts/analyze-depmat-a.js` (selftest 59/59), `scripts/build-depmat-panels-a.js`
- Per-seed corpora: `evidence/2026-11-20/perseed-depmat-a-ctl/` + `perseed-depmat-a-arm/` (8 JSONs each, 107051–107058)
- Analysis: `evidence/2026-11-20/depmat-a-analysis.json`
- Sweep logs: `evidence/2026-11-20/depmat-a-smoke-ctl.log` / `.err` (seed 107051 ctl), `depmat-a-ctl.log` / `.err` (seeds 107052–107058 ctl), `depmat-a-arm.log` / `.err` (8 seeds arm, exit 0)
- Panels: `evidence/2026-11-20/depmat-a-panel-before.json.gz`, `...-after.json.gz`, `depmat-a-panel.json`, `depmat-a-panel.md` (decision `review_required`, no material signal)
- **Game code REVERTED per the frozen NO-GO ladder:** `src/js/game.js` is byte-identical to base 59711ccc5 in the committed tree (0 DEPMAT refs). The DEPMAT mechanism (+53 lines, proof 43/43) exists only in this evidence file's description and in the pre-revert proof run — killed arms leave no trace.
