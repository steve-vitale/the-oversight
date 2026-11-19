# sim-fightcap-b — the fight-ally cap (#2559 family)

**Verdict: NO-GO** — the 4th member, when fielded, deals a real share of the damage (18.3% pooled, above the 0.10 bar) but launched quads still kill nothing (0 kills in 18 joined meetings, bar 0.20). The cap lifts; quads still do not kill. That IS the #2559 answer.

- **Branch:** `sim-fightcap-b`, tip `4aa091c1d` after adoption rebase onto master `385f07995` (base master `eccc08af2`, journey-endgame r246)
- **Prereg:** `evidence/2026-11-19/sim-fightcap-b-prereg.md` (frozen 2026-11-19 09:32 UTC, before any judged sim)
- **Analysis:** `evidence/2026-11-19/fightcap-b-analysis.json` (analyzer exit 0)
- **Panel:** `evidence/2026-11-19/fightcap-b-panel.md` (balanced compare, decision `review_required`)
- **Corpora:** `evidence/2026-11-19/perseed-fightcap-b-{ctl,arm}/` (8 seeds each, 150 days, 0 instrument errors)
- **Seeds:** 104770–104777 (fresh band; survey + judged legs identical)
- **Legs differ ONLY by ALLYSLOT3** (ctl unset, arm =1). Shared substrate both legs: SENSEEXPED=1, PARTYSIZE4=1, VETREENGAGE=1, FLEEREPAIR2=1, FIGHTALLY2=1. Competent verbatim, 150-day death-aware.

## 1. The lever, in plain words

A launched party that sets out as four (a "quad") used to fight as three: the sense that picks who stands beside you in a fight was capped at two companions. This lever opens a third companion slot — but only for a party that actually launched as four, and only when the third companion is standing near the fight. The fourth person answers a third shout for help, fights with their own health, gear, and strikes, and can be wounded. Nothing else changes: non-launched meetings still cap at two allies, and the sense that finds the party is the launch-party sense already on master (SENSEEXPED), not a new one.

Ported from held branch `sim-allyslot3-b` (slot commit `7efbf26a8`); the old LAUNCHPARTY sense was NOT re-applied. Proof test `scripts/test-allyslot3-b.js` 18/18; measurement proof `scripts/test-fightcap-b.js` 13/13 (d133 Reunion row fields 1/1 under the loose join; rerun-corpus reproduction exact).

## 2. Judged numbers (frozen bars, §14 of the prereg)

| Bar | Control | Arm | Bar | Result |
| --- | ---: | ---: | ---: | --- |
| **Primary 1 — 4th-member damage share** (pooled ally3Dealt/mDealt over fielded quad fights) | 0 fielded (0 by construction) | **246/1344 = 0.183** over 2 fielded fights | ≥ 0.10 | **PASS** |
| **Primary 2 — kill share on joined quad meetings** | 0/9 = 0.000 | **0/18 = 0.000** | ≥ 0.20 | **FAIL** |
| Pool floor (launches/leg ≥ 6; arm meetings ≥ 4) | launches 15; meetings 9 | launches 24; meetings 18 | — | PASS |
| No-leak (ctl fields no third ally) | 0/6 | — | 0 | PASS |
| Community-loss share | 5/8 = 0.625 | 5/8 = 0.625 | arm ≤ ctl + 0.125 | PASS |
| Starvation (total / villager) | 3 / 2 | 3 / 2 | arm ≤ ctl + 2 | PASS |
| Median survival | 142.5d | 147d (ratio 1.03) | arm ≥ 0.8× ctl | PASS |
| Instrument errors | 0 | 0 | 0 | PASS |

GO required both primaries + pool floor + all cost bars. Damage share passes; kill share fails decisively (0/18; the bar needed 4 kills). **No 12–16-seed confirm** — the prereg gates the confirm on a GO pilot.

### The two fielded fights (all the 4th member's damage)

Both on seed 104771, fighter Rosa Mendez, 4th member Katarina Novak:

| Fight | 4th-member damage | Party total | Monster HP | Outcome |
| --- | ---: | ---: | ---: | --- |
| d58 The Congregation (wave 4) | 141 (20.6% of dealt) | 686 | 999 | fled after 9 rounds — 68.7% of the monster's health |
| d76 The Spoiler (wave 5) | 105 (16.0% of dealt) | 658 | 1346 | fled after 6 rounds — 48.9% of the monster's health |

Pooled 246/1344 = 18.3% — above the rerun's 12.5% (over 2 damage-dealing fights) and above the 0.10 bar. Per-fight shares 16–21%: the 4th member is a real contributor, not a bystander.

### The cleanest before/after pair in the run

The same d58 Congregation fight, same seed, same monster: control dealt **435/999 (43.5%) in 8 rounds** with two allies; the arm dealt **686/999 (68.7%) in 9 rounds** with Katarina's 141 on top. The lever's effect is directly visible — and still a flee. The party needed ~111 damage/round to kill in 9 rounds; it dealt ~76.

### Damage/round ladder (fightcap-a ladder: typical ~40–60/round, winning shape ~111/round, canon godhood ~220/round)

- Arm, fled fights: **49.5/round** (n=15, 5.4 rounds avg) vs ctl 43.1/round (n=8) — the arm is ~15% hotter, still squarely in the typical band.
- Arm, fights where a villager died: 28.1/round (n=3) vs ctl 24/round (n=1) — deaths are fast, low-damage fights.
- All 18 arm quad meetings: 15 fled, 3 villager-died, **0 kills**. Closest any quad came to a kill was d58 at 68.7% of the monster's health — and that one HAD the 4th member.

### Why the 4th member so rarely fields (field-4 rate 2/13 = 0.15; sense rate 5/18 = 0.28)

The sense misses on the arm leg classify (13 missed meetings, 21 missing-companion causes):

- **Dead: 10** — the launch party's members die before the fight. Seed 104771's quad bled out across days 64–83: Catalina died in the d64 Spoiler fight itself, Rosa and Katarina were both dead by d83, Naran died d142.
- **Expedition ended: 5** — the launch is over by the time the fight happens.
- **In-plan party but unsensed, different tile: 3; same tile: 1** — companions alive and on the plan, but not standing where the fighter can sense them (d50 Eater: the second shout brought Heinrich, a bystander, because the launch companions weren't co-located).
- Different expedition: 1; trim-unproven: 1.

The sense works; the party doesn't survive to the fight. Senseexped-b's 0.892 sense rate was measured on a band where launch parties stayed intact — here the binding constraint is party decay by death, not the sense.

### Reachability (waves 1–5, unlocks, national/table/wins, median survival)

| | Control | Arm |
| --- | ---: | ---: |
| Full wins | 0 | 0 |
| National scale | 0 | 0 |
| Wave 5 reached | 3/8 | 3/8 |
| Wave 4 reached | 8/8 | 8/8 |
| Standing ≥ 200 | 3/8 | 3/8 |
| Survived 150d | 3/8 | 3/8 |
| Median survival | 142.5d | 147d |

Nothing moves. The lever changes how deep a quad fight goes, not whether the village reaches the table.

### Balanced panel (instrument, not judge)

`fightcap-b-panel.md`: decision `review_required`, carried by one flag — village deaths per run 86.875 → 90.25 (**+3.375/run**, 95% exploratory interval 0 to 8.375, `regression_watch`). The mechanism is visible in the analyzer: the arm launches more (24 vs 15) and fights more quad meetings (18 vs 9), so it takes more exposure; community loss is flat (0.625 → 0.625, delta 0) and no extra village is lost. The frozen cost bar (community-loss share) passes; the deaths flag is a watch item, not a verdict-changer. All other panel metrics: no material signal or not observed (player deaths, sampled NPC stats — screen-only coverage, documented as instrument limits).

### Trajectory divergence (reported, not re-scored)

- **Launches 15 → 24.** The arm's parties re-launch more: seed 104772 went from 1 launch (ctl) to 8 (arm). The slot keeps holders alive through fights they would otherwise have died in, so the same plan keeps re-launching. The legs' populations therefore differ — the arm's 18 meetings include more thin/overlapping quads. The prereg did not cap launch divergence; noted for the next run.
- **Non-quad kills 9 → 15** (all world-tick or aid origin — the scholar's party and aid fights, never launched expeditions). 8 shared with control; 1 lost (104771 d118 Herald, visjoin_102); 7 gained (visjoin_90 ×3, visjoin_89 ×2 on 104771; benoit_lambert ×2 on 104772). These are outside the judged population — the join missed no kills — but they confirm the slot's trajectory effect extends beyond launched meetings.

## 3. Sense-test: reading the fights

Four full transcripts read (arm corpus, seed 104771). The 4th member reads as a person joining, not a stat:

- **d58 Congregation:** "Rosa is still losing — shouts a third time! Katarina charges in!" The third shout is a distinct, legible beat — the fight escalates from one companion to two to three as Rosa loses. Katarina's 141 damage is the difference between 43.5% and 68.7% of the monster.
- **d76 Spoiler:** Rosa fights The Spoiler for 6 rounds with Desmond and Heinrich before Katarina arrives. The walk-in line calls it "The Ugly Beast" — verified as the village's knowledge-gated nickname for a monster whose true name it hasn't learned (the same log names The Spoiler in the mechanics lines). Minor fiction wrinkle: one fight, two names for the same monster. Noted, not chased.
- **d64 Spoiler (villager dies):** Catalina opens with a bow (3 of 4 arrows hit, 47 damage), Rages (eyes go red, next 3 strikes double), strikes for 57 at double strength — and still dies in 2 rounds to 35 + 34 damage. The winning-shape ingredients are there; the fight is over before they matter. Tragic and legible, not a numbers artifact.
- **d50 Eater:** Rosa's second shout brings Heinrich, a bystander — the launch companions weren't where she was. The sense-miss is visible in the fiction: the party that set out isn't the party that fights.

Nothing in the transcripts reads robotic or incoherent. The fiction holds; the numbers don't.

## 4. Village assessment, in plain words

Give a village a fourth fighter and the fourth fighter fights — about a fifth of the damage, in the two fights where she actually stood beside her party. But she almost never gets to stand there: launch parties fall apart before the fight, members dying one by one on the road, and when the four do come together the monster still walks away with a third of its health. The cap was a real constraint on damage and not the constraint on killing. What kills quads is the road to the fight and the damage rate once they're in it — the party needs to deal roughly twice as much per round as it does now, and it needs to arrive whole.

## 5. Metric review (for the NEXT run — this run is judged as frozen)

1. **Field-4 rate 0.15 vs the rerun's 0.67.** The denominator grew (13 vs 6) because the arm fought more meetings, mostly with decayed parties. The rerun's failed 0.80 field-4 bar was rightly not copied; field-4 stays reported-only. But the sense rate (0.28) being far below senseexped-b's 0.892 needs the explanation this run supplies: sense rate is a party-survival metric as much as a sense metric. A future run should pre-register the sense-miss classification (dead / expedition-ended / unsensed) as a secondary, so the cause is priced in advance.
2. **Damage share passed on n=2.** The pooled definition is fragile when fielding is rare — two fights carry the whole primary. A future run could pre-register a per-fight minimum or judge the damage/round delta (arm 49.5 vs ctl 43.1) alongside the share.
3. **Kill share 0/18.** The 0.20 bar needed 4 kills; even counting the d58 near-kill as a kill (which it is not) the verdict doesn't move. No re-score.
4. **Launch divergence (24 vs 15) unpriced.** The arm's extra launches are themselves a lever effect, but they change the meeting population. A future run should pre-register a launch-divergence note or cap, or judge kill share per launch as well as per meeting.

## 6. Blanks

- No 12–16-seed confirm: pilot NO-GO, prereg gates the confirm on GO.
- Panel `not_observed` rows (player deaths, sampled NPC stats, luck percentiles): the panel builder's screen-only coverage; the analyzer's own cost bars (community loss, starvation, median survival) cover the costs the prereg named.
- Telemetry check: `scripts/telemetry-check.js` refuses recorder-corpus input ("all 8 --current rows carry top-level anchorCommit… Recorder corpora are compared with sweep-compare tables, never against a run baseline here") — same as the rerun arms. No deviation recorded.
- `node scripts/check.js --quick` (adoption, rebased tip, solo): **338 passed, 6 failed in 1012s, 0 attributable** — log `evidence/2026-11-19/fightcap-b-check-adoption.log`. The 6 are the standing set: deed-attainment 120s timeouts (living-garden, one-person-army), measurement-proof staleness pair (proof-update "inputs are not current"; workflow "retained neutrality proof covers the current inputs"), cache-flags (solo GREEN 4/4 in 38s — load artifact), phone-frame stale receipt. Ladder-bundle control absent — cleared. The worker's gate (329/15, log `fightcap-b-check.log`) carried 9 extra failures, all cleared on the re-run: 7 EPERM/flap-caused, 1 ontology failure from the flap-emptied ONTOLOGY.md (restored from HEAD by the adoption, never committed), 1 occupation-panels (green solo-side, 112s in the adoption gate).
- Adoption verification (independent of the worker's numbers): the adoption re-aggregated both primaries from the raw per-seed corpora with its own code (CORRECTED join, finding #2570): arm 18 joined quad meetings, 0 kills; 4th-member damage 246/1344 = 0.183 over exactly 2 fielded fights (104771 d58 Congregation 141/686, d76 Spoiler 105/658); field-4 2/13, sense 5/18. All match the analyzer. NO-GO stands.
- Adoption proofs on the rebased tip: analyzer selftest 28/28; `test-allyslot3-b.js` 18/18; `test-fightcap-b.js` 12/13 — the one failure is §C's hardcoded anchor pin (`eccc08af2`): the driver records `git rev-parse HEAD` faithfully, so the pin breaks on any commit after the base (rebased tip `4aa091c1d` recorded instead). Sections §A/§B (d133 regression, rerun-corpus reproduction) all pass. The pin is a test limitation, not a measurement defect; the test was NOT loosened. `test-fightcap-b.js` is not in `check.js` — the gate is unaffected.

## 7. Findings notes for the coordinator (file these; do not edit sim-findings.md)

- **#2559 answer:** the 4th member, when fielded, deals a real share (16–21% per fight, 18.3% pooled) and lifts the party from 43.5% to 68.7% of a wave-4 monster's health in the matched pair — but launched quads still kill nothing (0/18). The cap was not the binding constraint on killing. Damage/round (~50 vs ~111 winning shape) and party survival to the fight are.
- **Binding constraints now:** (a) launch parties decay by death before the fight (10/21 sense-miss causes on this band); (b) even with the 4th member, damage/round sits in the typical 40–60 band.
- **Out-of-scope gap (note only):** the d76 "Ugly Beast" double-naming — the walk-in line uses the village's nickname while the mechanics lines use the true name. Minor fiction wrinkle; no action owed.
- **Secondary observation:** the slot's trajectory effect extends beyond launched meetings (launches 15→24; non-quad world-tick/aid kills 9→15). Worth watching if the slot ever lands: more hunting means more exposure (panel deaths +3.375/run) with no extra village losses.
