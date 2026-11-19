# sim-launchfunnel-b — screening survey for a launch-rich seed band

**Arm:** sim-launchfunnel-b (DIAG survey) · **Run:** fleshout-loop-b-20261119T1530Z · **Axis:** winnability chain
**Branch:** `sim-launchfunnel-b` · **Base master:** `1927a245e` (2026-11-19 1230Z adoption closeout) · **Instrument anchor:** `9f0937a12510` · **Policy sha (competent.js, first 12):** `729af71ccddd`
**Verdict: GO** — a launch-rich band is designated. **Designated band: seeds 106081–106088** (17 wave-4+ launches, 9 quad launches per 8 seeds).

## Prereg header (frozen before any judged sim)

- **Prereg file:** `evidence/2026-11-19/sim-launchfunnel-b-prereg.md`, committed `2b1ba41ac` before the first judged sim ran. Nothing in the prereg was changed after freezing.
- **Primary metric:** wave-4+ launches per 8-seed band (event count: a `v4departs` row with `result: 'launch'` and `targetWave >= 4`; one row per launch). Same counting as dmgshape's floor, so GO floors are calibrated to it.
- **GO threshold (frozen):** at least one screened band with **≥6 wave-4+ launches AND ≥2 quad launches** per 8 seeds, **AND** funnel taxonomy complete (**0 `unknown`**) on all screened bands, 8/8 files parse, 0 instrument errors, proof test green + D1/D2 green. Best band published as the designated band for the dmgshape/partysurvive re-runs.
- **Horizon:** 150 days, death-aware, competent verbatim. 150 days because a launch-rich band must show launches across the wave-4 window, not one lucky early fight; death-aware because a band that loses villages early cannot host a re-run.
- **Seeds (4 × 8 = 32, freshness VERIFIED before freezing):** 106051–106058, 106061–106068, 106071–106078, 106081–106088. Zero prior uses of any of the 32 seeds as sim seeds (checked filenames AND dated .md files; apparent hits adjudicated by hand — pantry-kcal values, the 7-digit October census seed `s1060511`, float fragments — none a seed use).
- **Policies / substrate (env flags only, no port, no src change — `src/` diff 0 lines):** `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1`, one leg per band (vre-equivalent, recorder ON). No OFF leg (launchfunnel-a already showed the master-default funnel dry) and no REC leg (D1/D2 proven for this instrument family; re-proven for this copy at 30d by the proof test). **Survey substrate ≠ re-run substrate on one flag:** ALLYSLOT3 was deliberately NOT ported — it gates only the fight engine's 4th slot, never launch formation. The designated band is designated by launch rate; the re-run re-verifies its pool on arrival (it re-ports ALLYSLOT3 if needed).
- **Instrument:** `scripts/launchfunnel-driver-20261119.js` (copy of the 20261117 driver; diff exactly the documented deltas), `scripts/analyze-launchfunnel-b.js` (survey ranker; reuses `analyze-partyquads-b.js` `summarizeLeg` and `analyze-launchfunnel-a.js` `funnelForSeed`/`summarize`), `scripts/test-launchfunnel-b.js` (proof test, **29/29 green** in ~32s, commit `9f0937a12` — covers src diff 0, env gates, ALLYSLOT3 absent from `src/js`, counting fixtures, funnel-taxonomy quad fixture, a live 5d shape run, D1 repeatability + D2 wrap neutrality at 30d on seed 106051).
- **Ranking (frozen):** launches desc, then quad launches desc, then joined quad meetings desc, then median survival desc.

## Judged numbers — all four bands, 150d, competent verbatim, survey substrate

| Band | Launches | Quads | Trios | Joined quad meetings | Instances | Launched inst. | Binding stage | Unknown |
|---|---|---|---|---|---|---|---|---|
| **106081–106088 (BEST)** | **17** | **9** | 8 | **4** | 21 | 5 | candidate-not-bid (7) — tied with plan-churned (7) | 0 |
| 106061–106068 | 13 | 10 | 3 | 1 | 14 | 4 | candidate-not-bid (5) | 0 |
| 106051–106058 | 11 | 7 | 4 | 5 | 24 | 6 | candidate-not-bid (9) | 0 |
| 106071–106078 | 1 | 1 | 0 | 1 | 10 | 1 | candidate-not-bid (6) | 0 |
| **Survey total** | **42** | **27** | 15 | **11** | **69** | **16** | — | 0 |

- **Bars:** launch-rich PASS (bands 1, 2, 4 all meet ≥6 launches and ≥2 quads), taxonomy PASS (0 `unknown` on all 32 seeds), instrument PASS (proof test 29/29, D1/D2 green, 0 errors on all 32 files). **Verdict GO.**
- **Frozen ranking:** 106081–106088 > 106061–106068 > 106051–106058 > 106071–106078. Band 4 designates on launches (17, the most) and is second on quads (9 vs band 2's 10) and second on joined quad meetings (4 vs band 1's 5). The ranking tension flagged mid-run (band 1's 5 joined meetings vs band 2's launch count) is moot: band 4 leads on launches and is near-top on both secondary keys.
- **Every launch was a trio or a quad — no pairs anywhere.** Event sizes: band 1 {3:4, 4:7}, band 2 {3:3, 4:10}, band 3 {4:1}, band 4 {3:8, 4:9}. Launchfunnel-a's launches were all pairs; this survey's PARTYSIZE4 substrate means a launch is now a party of 3–4 by construction. `partyQuads` (the counter) equals observed quads on every band (7/7, 10/10, 1/1, 9/9) — the counter is exact.
- **Launch richness is lumpy, not spread.** Each band's launches ride on one or two seeds: band 1 — 106057 (7), band 2 — 106067 (7) + 106065 (4), band 3 — 106073 (1), band 4 — 106083 (10) + 106084 (5). On the designated band, 15 of 17 launches come from two seeds. The re-run's measured launch rate will be carried by 106083 and 106084; the other six seeds are launch-dry. That is the band as measured — report it, don't smooth it.
- **Event counts run higher than instance-attributed launches.** Band 4: 17 launch events but 5 launched instances; band 1: 11 events, 6 instances. Holders re-launch after an instance closes (the same shape launchfunnel-a showed: 8 events vs 6 instances). The survey's numbers are event counts, comparable to dmgshape (5) and fightcap (15) — same code, same definition. Do not mix the two counts when judging the re-runs.
- **First launched kills in this instrument's history.** Launchfunnel-a had 0; this survey has 2, both quad launches, both with the gate silent (no gate row on the meeting):
  - Band 1, seed 106055: yuki_mori → eater, party of 4, launched d122. Met d125 (fled after 2 rounds, 42 damage dealt), met again d126 and a companion (app_mgpspkdq903) got the kill in 5 rounds (142 damage). The launched party persisted and re-met the next day; the holder did not land the killing blow — a companion did.
  - Band 2, seed 106065: valeria_quispe → herald, party of 4, launched d90, met and killed the same day in 6 rounds (220 damage, took only 25). The cleanest launched kill in the corpus.
  - Band 4 has **no** launched kill: its 2 launched-fought instances both fled (see below).

## Best band (106081–106088) — full funnel taxonomy

21 instances, 0 `unknown`. Binding stage **candidate-not-bid reproduces** — but tied: candidate-not-bid 7 (33.3%) and plan-churned-before-dawn 7 (33.3%). Launchfunnel-a's binding stage was candidate-not-bid 8/12 (66.7%); the share fell because far more instances now launch.

| Bucket | Count | Detail |
|---|---|---|
| candidate-not-bid | 7 | no-companion-party 6, not-scored 1 |
| plan-churned-before-dawn | 7 | retargeted 5, holder-died 2 |
| launched-no-meeting | 3 | windows 68–129, 103–114, 114–118 |
| selected-blocked | 2 | away-as-companion-this-tick 1, inviter-range-0 1 |
| launched-fought-no-kill | 2 | pavel→reunion (fled ×3), nina→eulogy (see below) |
| launched-killed | 0 | — |
| target-killed | 0 | — |
| bid-not-selected | 0 | — |

- **Pool (the thin companion pool, again):** 215 scored dawns, 175 (81%) with 0 eligible companions; 30 with 1, 10 with 2, none with 3+. First-fail tallies: notRanger 566, away 490, selfOrScholar 430, engaged 2, onExped 1; only 50 eligible across the band. Launchfunnel-a: 81/87 (93%) zero-eligible — the pool is still thin, just slightly less thin.
- **Attach:** 76 wave-4 seed rows, 34 attached, 42 non-attaching, 29 target-null. Paths: world-tick 36, agency-evade 25, agency-flee 15.
- **Skips:** away-on-expedition 96 (dominant — the holder is out on expedition when the commit fires), night 20, danger-gate 18.
- **Gate, joined:** seek 1 (trick known — see the sense-testing note), avoid 0, null 0. Corpus-wide gate rows: seek 4, avoid 75, null 40, trickKnown 9 of 119. The gate now says "seek" sometimes on this band (launchfunnel-a: 0 seeks joined, 1 null); it still says "avoid" 75 times across the band's rows.
- **The five launched instances on the best band:**
  - 106083 pavel_dubinin → reunion, trio, launched d79: met 3 times (d107 fled 1 round; d110 mateo_alvarez fled after 11 rounds, 329 damage; d110 again fled after 5 rounds, 247 damage). The biggest launched-party damage in the survey — and it still ended in flight.
  - 106084 luis_fernandez → eater, trio, launched d103: never met (window 103–114).
  - 106084 visjoin_111 → influencer, quad, launched d114: never met (window 114–118).
  - 106087 nina_petrova → eulogy, quad, launched d116: met 4 times — monster fled twice, holder fled once, **nina died d124** — and the party dealt **0 damage in all four meetings**. See sense-testing.
  - 106088 fatima_hassan → eater, trio, launched d68: never met (window 68–129 — a 61-day window with no meeting).

## Wall numbers (every band)

| Band | Wins | National rank | Standing ≥200 | Wave 5 | Wave 4 | Median survival | Survived 150d | Deaths | Starvation |
|---|---|---|---|---|---|---|---|---|---|
| 106051–106058 | 0/8 | 0/8 | 2/8 | 2/8 | 8/8 | 151d | 6/8 | 810 | 2 |
| 106061–106068 | 0/8 | 0/8 | 2/8 | 2/8 | 8/8 | 151d | 5/8 | 567 | 2 |
| 106071–106078 | 0/8 | 0/8 | 1/8 | 1/8 | 7/8 | 140d | 4/8 | 616 | 2 |
| **106081–106088** | **0/8** | **0/8** | **4/8** | **4/8** | **8/8** | **143d** | **4/8** | **725** | **5** |
| Survey total | 0/32 | 0/32 | 9/32 | 9/32 | 31/32 | — | 19/32 | 2718 | 11 |

- No band won; no village reached national rank. Band 4 is the strongest wall band too: 4/8 wave-5 unlocks (vs 2, 2, 1) and 4/8 standing ≥200 — the only band where half the villages are at regional-or-better standing. Standing ≥200 is the wall column that separates band 4 from the rest.
- Deaths are heavy everywhere (567–810 per band); starvation is a sliver (2–5 per band). Villages die fighting, not hungry — same picture as the 1230Z round.
- One seed never reached wave 4: 106072 (village lost d37 at wave 3). One seed barely met wave 4 at all: 106056 (a single wave-4 seed row — agency-evade, target-null — and 0 instances).

## Per-seed launch map (designated band and runners-up)

| Seed | Band | Launches | Quads | End |
|---|---|---|---|---|
| 106083 | 106081–106088 | 10 | 6 | village-lost d136, standing 199 |
| 106084 | 106081–106088 | 5 | 2 | village-lost d136, standing 199 |
| 106087 | 106081–106088 | 1 | 1 | survived 150d, standing 395 |
| 106088 | 106081–106088 | 1 | 0 | survived 150d, standing 445 |
| 106081 / 106082 / 106085 / 106086 | 106081–106088 | 0 | 0 | lost d89/d90; survived d150/d150 |
| 106057 | 106051–106058 | 7 | 4 | (launch engine of band 1) |
| 106067 | 106061–106068 | 7 | 5 | (launch engine of band 2) |
| 106065 | 106061–106068 | 4 | 4 | (includes the valeria kill) |
| 106055 | 106051–106058 | 2 | 2 | (includes the yuki kill) |
| 106073 | 106071–106078 | 1 | 1 | (band 3's only launch) |

Zero-instance seeds (band 1): 106053 — 10 wave-4 seed rows, all agency paths (flee 4, evade 6), half target-null, none attached; the village met wave-4 beasts out on expedition and the plan never opened. 106056 — 1 wave-4 seed row, target-null; there was almost nothing to attach to. Same pattern may recur on band 3's dry seeds (106071/106072/106074/106075/106076/106077/106078) — not dug into; the designated band is what the re-runs need.

## Village assessment (plain words)

This survey found the launches the earlier diagnostics were starving for — and found them concentrated. On the designated band, two villages (106083 and 106084) launch again and again: fifteen of the band's seventeen launches, and they do it with real parties of three and four, not solo heroes. The rest of the band is quiet: four of the eight seeds never launch at all. That is not a flaw in the survey; it is what a launch-rich band looks like under this instrument — a couple of villages where the plan store wakes up and keeps firing, and the rest where it never does.

The launches themselves are real in a way the earlier census's were not. Parties form, walk out, meet the monster they named, and fight for real — eleven rounds, three hundred damage, a companion stepping in to finish the kill. Two of them actually killed their target, the first launched kills this instrument has ever recorded. But the kills are the exception. On the best band, the five launched parties fought and fled, never met, or — in the worst case — dealt no damage at all across four meetings and lost their leader. The launch problem and the damage problem are two different walls now: villages can be made to launch, but a launched party still usually cannot hurt a wave-4 monster.

The villages around the launches are still dying young. Nineteen of thirty-two survived to day 150, none won, none reached national standing, and the death toll is over two thousand seven hundred people across the survey. The strongest band by standing (106081–106088) is also the one where half the villages still die before day 150. The launches are a real signal inside a hard game — not a sign the game is fixed.

## Sense-testing (reading the transcripts, judging meaning)

**The biggest launched fight — mateo_alvarez vs reunion, seed 106083, day 110 (11 rounds, 329 damage, fled at 12% HP).** This reads like a real fight, not a template. Mateo has a bow but no arrows — "the string stays drawn, useless" — an honest equipment failure in the middle of combat. Strikes land for ~20, the monster's hits are absorbed in chunks of 50–66 by gear, and in round 3 Mateo "stands on one foot and recites a poem mid-fight" — a novelty trick that makes the Reunion falter because "it has nothing to wear." He binds his own wound for +20 HP in round 4, calls for help, and flees at 12% HP. The voice lines land. The repetition is the weakness: "Mateo holds the line — working the trick, not the damage race" repeats three times in five rounds, and the monster's attack is always the same "Your Move hits Mateo for 10." The fight is vivid in its first telling and flat by the fifth.

**The joined seek — hannah_kim vs eulogy, seed 106087, day 119.** This is the one launched meeting where the gate said "seek": armed, armored trio, trick known, plan stage "hunt." And they dealt **zero damage in three rounds** while the monster fled. Hannah's lines are the same sentence three times with the verb swapped — "it says Hannah runs — Hannah advances," "it says Hannah falters — Hannah stands straighter," "it says Hannah begs — Hannah laughs." The trick-reading is coherent (contradicting the narration is the eulogy's trick), but three rounds of the same joke with no damage dealt makes the "seek" verdict look hollow: the gate sent a prepared party in, and the party could not hurt the monster at all. Nina's later death in the same instance (d124, 1 round, 15 taken, 0 dealt) is the same story ending worse.

**Veteran-kill and door-defense lines (seed 106081, days 8–52).** The System's veteran-kill call — "Oh — OH. Everybody saw that, right? Frieda just put down The Callback... on CAMERA. That's a veteran kill, folks. REMEMBER the name." — repeats verbatim with only the name swapped, six times on this one seed. The door-defense line — "Ming, Marisol, Carmen and Chantal met them at the door — 4 put down" — is the same template with the roster swapped. The ARC IV and MIRROR DRAFT lines are vivid ("We've been watching you for a LONG time... So we built something out of... well. Out of YOU."), and the Final Draft intro is strong. The verdict is the same one launchfunnel-a reached: the lines are good once and thin on repeat — the village's voice is a handful of sentences, not a conversation. That is a content-depth note, not a survey failure.

## Metric review

- **The GO bar worked as a survey instrument, but it keys on the wrong secondary number for the re-runs' actual need.** The frozen ranking keys on launches, then quads, then joined quad meetings. The re-runs (dmgshape/partysurvive) need launched parties that actually MEET the monster — joined meetings are their sample. Band 1 has the most joined quad meetings (5) and the fewest launches of the passing bands (11); band 2 has the most quads (10) and the fewest joined meetings (1). The frozen rule picks band 4, which is second on both secondaries, so the tension did not change this verdict — but a future survey should weight joined meetings at least as heavily as quads, or rank on a combined "usable launched meetings" count. Do not re-score this survey; the frozen ranking stands.
- **Event counts vs instance counts.** The survey reports event counts (42 launches) because dmgshape's floor is calibrated to them. Instance-attributed launches are 16. Anyone comparing this survey to a future instance-counted diagnostic must convert first; the two counts differ by a factor of ~2.6 on the designated band (17 vs 5).
- **Lumpiness.** A band's launch rate is carried by 1–2 seeds (10 + 5 of 17 on the designated band). A re-run that samples only part of the band, or that re-rolls a seed, will see a very different launch rate. The re-runs should run the full designated band and report per-seed launches alongside the total.
- **competent.js changed since launchfunnel-a.** The policy sha is `729af71ccddd`, not launchfunnel-a's frozen `df9b7dff4de4` (journey landings r127–r146 landed in between). This survey is internally consistent — all 32 seeds ran the same verbatim file — but launch counts are NOT directly comparable to launchfunnel-a's (3 launched instances on 8 seeds then vs 16 launched instances on 32 seeds now, under different policy code and a different substrate). The binding-stage reproduction is the cross-survey comparison that holds; the absolute rates are this tip's.
- **Survey-substrate caveat (pre-registered).** The survey ran WITHOUT ALLYSLOT3 (fight engine's 4th slot unported). Launch formation does not depend on it, so the designated band is valid for launch rate — but the re-runs' fight outcomes on quad launches will change when ALLYSLOT3 lands, because the 4th companion may not actually fight. The re-run must re-verify the designated band's pool on arrival, per its own prereg.
- **The gate's "seek" is no longer zero, but it is still rare and its verdicts are not yet trustworthy.** One joined seek on the best band, and it produced a 0-damage fight. The gate saying "seek" is a necessary condition for a launched kill, not evidence of one.
- **check.js --quick was not run.** The instrument was proven by the frozen 29/29 proof test (including a live 5d shape run and D1/D2 at 30d) rather than a full gate pass. The survey's evidence is the 32 corpora + survey JSON, all 0-error.
- **Band 3 is a useful negative control.** 1 launch on 8 seeds, 97% of scored dawns with 0 eligible companions, 4/8 villages lost before day 150. It bounds the survey: launch-richness is a property of the seed band, not of the substrate — the same substrate produced 17 launches on one band and 1 on another. That is exactly what a screening survey is for.

## Findings notes for the coordinator

- **Designated band for the dmgshape/partysurvive re-runs: seeds 106081–106088.** 17 wave-4+ launches, 9 quads, 4 joined quad meetings per 8 seeds. Report the per-seed map with it (106083: 10 launches, 106084: 5 — the launches live there). Full band, not a subset.
- **Finding #2604 (quad-launch rate) is answered with a number:** 27 quad launches across 32 seeds (0.84/seed), 9 on the designated band; quad launches are no longer the binding unknown — 64% of launches on the designated band are quads (9/17), and every launch in the survey was a trio or a quad.
- **Binding stage reproduces, tied.** candidate-not-bid is still the top leak (7/21 on the best band), now tied with plan-churned-before-dawn (7/21). The pool is still thin (81% of scored dawns with 0 eligible companions) and churn is now equally large — retargeting (5) is the churn sub-stage to look at next, not a new binding claim.
- **Two launched kills exist now** (seeds 106055, 106065 — both quads, both gate-silent). The re-runs should read those two fights before designing around them: one kill took two meetings and a companion's finishing blow; the other was a same-day 220-damage kill.
- **The damage wall is visible inside launched parties, not just in the census.** On the best band, the two launched-fought instances dealt 602 damage across three meetings and fled (pavel), and 0 damage across four meetings and lost their leader (nina). Launching is solved enough to measure; hurting wave-4 monsters is not. The re-runs should carry a damage-per-launched-meeting number, not just a kill count.
- **Do not re-run dmgshape/partysurvive on band 3 or on a fresh band without a survey.** Band 3 (1 launch) is what an unsurveyed band can look like; the survey cost ~15 minutes for 32 seeds (band 1: 216s, band 2: 239s, band 3: 288s, band 4: 219s).

## Infrastructure notes

- **Write flap:** active ~15:51–16:10Z during instrument build — git writes (index.lock, update-ref) and file writes (`cp`, python `open('w')`) intermittently EPERM'd in the repo, the worktree, and `~/workspace/`. A failed python patch truncated the draft proof test to 0 bytes; it was rewritten whole from context and verified. Flap cleared by ~16:29Z; no failures after. Probe before writes that matter; verify every write by size/readback.
- **Safe-commit index clobber struck twice** (after both instrument commits): the index showed committed files as staged-deleted / MM while the commits were correct. Repaired both times with `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, verified status empty + diff HEAD empty + `hash-object` == HEAD blob per file. Run `git status --short` after EVERY safe-commit.
- **Timing:** band runs 216s / 239s / 288s / 219s (~4–5 min per band, ~16 min total for 32 seeds). Proof test ~32s. Survey analyzer ~4s.
- **Files:** prereg `evidence/2026-11-19/sim-launchfunnel-b-prereg.md` (commit `2b1ba41ac`); instrument `scripts/launchfunnel-driver-20261119.js`, `scripts/analyze-launchfunnel-b.js`, `scripts/test-launchfunnel-b.js` (commit `9f0937a12`); corpora `evidence/2026-11-19/perseed-launchfunnel-b-106051-106058/`, `...-106061-106068/`, `...-106071-106078/`, `...-106081-106088/` (8 files each, 0 errors); survey JSON `evidence/2026-11-19/launchfunnel-b-survey.json`.
