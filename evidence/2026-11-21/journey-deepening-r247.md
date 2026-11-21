# journey-deepening r247 — run note (2026-11-21)

- Run: r247, Lane A leg 2 DEEPENING (days 40–80; DAYCAP 100)
- Run id: playtest-loop-a-20261121T0043Z (scheduled Fri 2026-11-20 18:45 CST)
- Base: local master `faa5d65a9` (Loop B lever round fleshout-loop-b-20261120T2130Z adoption closeout)
- Branch: `journey-deepening`, worktree `~/workspace/worktrees/journey-deepening`
- Rotation read `2` (deepening); write `2→3` at closeout with read-back
- Policy: competent + MUSTER POLICY (r227 verbatim + r236 growth amendment + r237 F1/F2 + r238 stand-down) + MARCH STEP (r228 verbatim)
- Seeds: panel 105051–105058 (8 seeds); probe seed 105059 (dedicated, NOT scored in panel metrics — Q1-probe only). Band verified fresh: 0 hits in `evidence/*-prereg.md`, evidence filenames, and git log. Nearest named bands 105041–105049 (r246), 105101.
- Prereg: `evidence/2026-11-21/journey-deepening-r247-prereg.md` (this note adjudicates against it; metric binding applies — a miss is NO-GO, never re-scored mid-run)

## Pre-registration (from `journey-deepening-r247-prereg.md`)

- **Q1 (primary, regression bar): growth-line honesty.** Bar: 0 bad lines; every growth call harvests exactly or cools honestly. Descriptive: does the "enough, if the morning holds" clause fire in the wild (r246: fired 2×, both honest)? Does the cooled path fire (r245/r246: 0)?
- **Q2 (descriptive, NO bar): the wave-5 kill wall, third measurement.** r245: 3/8 unlocked, 2/3 faced, 0 kills. r246: 2/8 unlocked, 0/2 faced, 0 kills. Report `summarizeWave5` classes + party sizes. Descriptive sub-watch: march-flee recurrence (r246 seed 105048 fled 7 coalition fights in a row).
- **Q3 (descriptive — NO bar): the bow watch, FIXED instrument.** The driver now counts a bow-knower when `weaponCraft.bow >= 1` OR `weaponCraft.crude_bow >= 1` and reports the split. Expected: `weapon_teach` = 0 (flag off).
- **Q4: people check.** Read 1–2 full transcripts from convo days 45/60/80; judge sense, not counts. Watch for the two new live dialogue behaviors (warn_you heed speaks the warning, landing r150; settled-help names the favor, scale r247) and a third sighting of the closing-line duplication.
- **Q5: census + reachable / fun / winnable.**

## What changed in the game (base delta vs r246, src/js +419/−15, 6 files)

- sim-lendfix-a (`13a0c5ed2`): GUNRATE + CELLGATE + LEND rebuilt env-gated OFF by default (`process.env.GUNRATE/LEND === '1'`); dead-borrower return fix (finding #2629 FIXED) lands behind the gate. **No live behavior change** — verified by grep; the driver sets no env flags.
- sim-ammo-a lever added then reverted (`a06e640bd` + `8ca5da828`, net 0). No live change.
- landing r150 (`a11df1fac`): first heed of a warn_you want speaks the warning [needs-eyes]. LIVE; Q4 watches.
- scale r247 (`b6a551691`): settled-help names the favor [needs-eyes]. LIVE; Q4 watches.
- succession r258 (`ef5e65cb1`): self-witness fix in the ambush path. LIVE.
- Version bump only otherwise.

## Tooling (r247 forks)

- Driver `scripts/journey-deepening-r247-20261121.js` (r246 fork: seed band, tag r247, EVIDIR 2026-11-21, + bowWatch knower fix + split). Policy, instruments, probe staging unchanged.
- Analyzer `scripts/analyze-journey-deepening-r247-20261121.js` (r246 fork: EVIDIR 2026-11-21, + `summarizeBow` split carry-through + panel print).
- Proof tests forked from r246: analyzer **102/102** (101 carried + 2 new bow cases 102–103: crude_bow-only knower counted; split totals printed), muster **41/41**, march **11/11**. All GREEN before the panel was judged.
- Pilot: seed 105051 + probe 105059, exit 0, both survived, probe STANDDOWN-GO (day 64, 5 blades, released, 0 stranded), bowWatch populated with the split (105051: knowers 9, bow=9 crude_bow=9). Panel re-ran all 9 seeds (~5.3 min).

## Results — panel (8 seeds; 7 survived day 100–101, 1 village-lost day 96)

| Question | Verdict | Numbers |
|---|---|---|
| Q1 growth-line (primary) | **GROWTH-LINE-NO-GO** | poolDays=12 lineDays=11 badLines=0 repeatLines=0 growthCalls=11 harvestMismatch=1 havenMismatch=0 cooledDays=0 cooledCalls=0 |
| Q1 "enough" clause | **never fired** | 0 occurrences panel-wide (grep over all 8 seed JSONs) |
| Q1 cooled path | **still 0 in the wild** | 0 cooled days/calls; stands on the 28/28 unit proof |
| Q2 wave-5 wall | **moved again: 0 unlocked** | unlocked=0, neverFaced=0, facedNotKilled=0, killed=0 — ALL 8 LOCKED; villageSlainW4=0 on every seed |
| Q2 coalition-reach | **descriptive: reached10=3, stuck79=7** | 105054 15-day run at 9; 105055 11-day; 105056 17-day; 105057 **26-day run at exactly 9** |
| Q2 march | **MARCH-SLAIN (2/3)** | marchDays=10, arrived=9, foughtOnMarch=3, slainOnMarch=2; 1 fled (105051 d96, 11 blades, full HP 700) — single flee, no 7× loop recurrence |
| Q3 bow watch | **BOW-WATCH (fixed instrument)** | weaponTeach=0, weaponCraft=17, ammoCraft=162, equippedBows=23, bowKnowers=79 (bow=65 crude_bow=64) |
| F8 wild | **F8-UNMEASURED** | hits=0 — the confide line never fired panel-wide |
| F2 muster resets | **F2-REARM-GO** | resets=6, rearmed=2, stale=0 |
| Q1 refusal-heard | **REFUSAL-HEARD-GO** | refused=32, spoken=19, badDays=0 |
| Q1 titan | TITAN-MUSTER-MOVED | 8/8 seeds saw the titan, 193 titan-days, 78 verbs, slain=3 (105052, 105053, 105056) |
| Q1 wave 4 | 25 fights, 5 kills (0.625/seed) | banked2=0, unlockedW5=0. All 5 kills are the scholar's alone (villageSlainW4=0 everywhere) |
| Q1 trick pipeline | TRICK-PIPELINE-FINDING | w4killsKnown=0 vs unknown=5; 9 wave-3+ types learned; 12 types countered; stalls flows 8/8. Knowledge still not the binding constraint |
| Q1 ladder | LADDER-OPENS + MINTS + HOLDS | opens=8/8, all five tracks minted on all seeds, holds=8/8, first stage day 14 on all seeds |
| Q2 trust | TRUST-EARNED-ONLY | deaths=28, strangerGains=0, knownGains=51, deadBearerDays=0 |
| Q1 stand-down probe | **Q1-STANDDOWN-GO** | day 64, 5 blades, released, 0 stranded (pilot and panel agree this run — r246's probe-day drift did not recur) |

**Per-seed panel:** 105051 d101 survived w4 pop 10/12 standing 177 (Herald alive, hp 525, muster 9); 105052 d101 survived w4 pop 8/12 standing 175 (Herald slain); 105053 d101 survived w4 pop 9/12 standing 447, scale global (Herald slain d74, 2 titan-days); 105054 d100 survived w4 pop 8/12 standing 300 (15 days at 9 blades); 105055 d101 survived w4 pop 12/12 standing 100 (never faced wave 4 — 0 fights); 105056 d101 survived w4 pop 8/12 standing 150 (Herald slain d91 at hp 350, 17 days at 9); 105057 d101 survived w4 pop 8/12 standing 330 (26 days at 9); 105058 d96 **village-lost** w4 pop 7/12 standing 195 (Herald at 310 HP when the village fell; debrief attributed).

## Q1 NO-GO — the one mismatch, mechanism pinned

Seed **105058, day 85**: the dawn line said *"Haven has 1 volunteer free to march — the commit sends them. The muster would stand at 5 of the 10 THE HERALD demands. Still short."* The call that day harvested **2 allied blades the line never named** (allies 2→4; Haven 2→3 as announced). Analyzer: `{"day":85,"announced":0,"gained":2}`. The other 10 calls panel-wide were exact; the Haven leg was exact on all 11.

The mechanism is the **documented dawn-projection undercount** (`titanMusterGrowth`, titans.js): *"A link whose roster was never generated counts 0 free adults — undercount, never overclaim: the call itself generates the roster when sounded."* The growthWatch trace shows it:

- Day 85 dawn: a fresh split-village link, **The Bloodied** (`village_spl_28_25144`), sits in the projection with `freeAdults: 0` (roster never generated), trust 31, opinion −3 — gain 0. Emberhold refuses; Stonebridge (trust 18) refuses. Projection: harvestable 1 (Haven only), total 5.
- The call sounds the same day: it **generates The Bloodied's roster** (2 free adults), trust 31 passes the bars, quota 2 → 2 allied blades join. Muster 4 → 7.
- Day 86 dawn: The Bloodied's trust has fallen to 21 (below the 25 bar) — it refuses from then on; the day-86 call harvests only the announced Haven 1, exactly.

So the line was honest as of dawn and the call over-delivered by 2 — an **under-promise, not an over-promise**. The r245 cooled-call fix is NOT regressed (cooled path still 0/0; no contest death ate a promise this run), and the "enough" clause never fired, so its honesty is unmeasured this run. The bar as pre-registered is exactness, so the verdict stands as NO-GO — but the defect class is "the dawn number understates the call's yield when a fresh link's roster generates between dawn and the call," not "the line lies about what the call brings." Fix options for the build arm: (a) generate the roster before the dawn projection (breaks the projection's pure-reads design); (b) qualify the "still short" branch the way "enough" is qualified ("if the morning holds" — the number is the dawn's, the morning can move it); (c) have the call re-announce the true harvest when it exceeds the dawn promise. No game-code change landed this run — the design call is the arm's.

## The wave-5 wall, this run: the veteran bar, 8/8

**Wall 1 is now the whole story.** No village unlocked wave 5 on any seed — the first deepening panel with zero unlocks (r245: 3/8, r246: 2/8). Three villages cleared the 200 standing bar (105053: 447, global scale; 105054: 300; 105057: 330) and faced wave 4 (2/3/5 fights), yet stayed LOCKED: `villageSlainW4=0` on **every** seed. All five wave-4 kills this run are the scholar's alone; no villager holds a wave-4 kill, so no village has even one living veteran with a wave-4+ kill, let alone the two the gate needs. Standing is not the wall — the villages are rich in standing and short on wave-4 killers, exactly as r246 found, now without exception. Wall 2 (spawn absence after unlock) is unmeasurable this run — nothing unlocked. The wave-5 door is shut by the veteran bar on the entire band.

## The march-flee loop did NOT recur as a loop

r246's 105048 fled 7 coalition fights in a row. This band: 3 march fights, 2 slain, **1 fled** (105051 d96, 11 blades, full HP 700). One single flee, not a loop — the 7× shape looks like band variance / a one-seed shape, not a systemic march defect. The single flee is still the same shape (coalition reaches the lair at full strength and walks away), and the slain fights are real: 105053 slew the Herald d75 at 10 blades in 2 days from ready; 105056 slew him d91 at 11 blades after the field had already wounded him to 350 HP (held `tbfight` 1 — the march waited a turn on a fight already in progress).

## Q3 bow watch — the instrument fix proved its worth

- **weaponTeach=0** — BOWKNOW stays dormant with its flag off, as expected.
- **bowKnowers=79 (bow=65, crude_bow=64)** — the split shows the fix matters: **105054 has 11 knowers, all `crude_bow`-only (bow=0)** — the old instrument would have read 0 knowers on a seed with 2 equipped bows. 105056 is the mirror (bow=10, crude_bow=0). 14 of the 79 knowers are crude-only; the old count would have been 65.
- **Equipped bows 23** (same as r246) across all 8 seeds; ammoCraft=162.
- **105052 is the thin seed:** 0 weapon crafts, 0 knowers, 1 equipped crossbow, 19 ammo crafts — bows arrive (one crossbow + arrows) without the village ever learning to make them.
- `weapon_craft`=17 still counts ALL weapon crafts, not bow crafts — reported with the caveat, as in r246.

## Census (plain words)

96 villagers started across 8 villages; **70 alive at day 100**. 26 roster deaths; the scholar (the player character) died 28 times, 16 out in the wild — the villages hold, the scholar is the one who dies on the roads. One village lost (105058, day 96, with the Herald already wounded to 310 HP — the village fell just short of finishing him). 435 beasts slain panel-wide. Three villages end the leg with standing past 200 (105053 reaches global scale at 447) yet none opens the wave-5 door — the villages are standing-rich and veteran-poor. The ladder opens everywhere (stage 3 by day 80 on all seeds); the Herald walks the roads for 193 titan-days; three villages slew him. Nobody starved out; pantries not measured this run (no pantry field in the end snapshot — the r246 empty-pantry observation is not re-checked here).

## People check (Q4) — PASS

Two full transcripts read:

- **Stella (105053, day 45, florist, withdrawn, trust 92, grieving):** warn_you — "People are saying things. About you. Is any of it true?" The player heeds four times and she escalates honestly each time: "the treeline at dusk. Don't." → "Promise me that. Please." → "I've watched people walk out sure and not walk back. Don't be the next one I have to stop waiting for." Resolution: heeded. The landing r150 change is visible in her voice — the heed DOES speak the warning, in her words, not in system voice. Sensical, characterful.
- **Tashi (105054, day 80, arborist, steady, trust 99, grieving):** opens with a bond proposal ("You and me — we should be bonded… Will you stick with me?"), the player declines, he takes it gracefully ("Right — another time."). Then his ask_favor re-surfaces ("I still need a hand with the food I needed") and he deflects twice when pressed ("All sorted. Some things just work out." / "No, really, it's fine. Forget I even asked."). The want stays honestly "stated" (unresolved), and the closing plants the bond again ("Think about it? I'll be around."). Sensical.

Two carried notes (not defects for this run):
1. **Closing-line duplication did NOT recur** — both transcripts end with two distinct winddown lines. Modhi r245 + Noah r246 remain the only two sightings.
2. **Settled-help favor naming (scale r247) not observed** — no transcript in the 114 contains "settled"; the branch simply did not fire on this leg's convo days. Not a defect, just unmeasured in the wild.
3. **Tashi's favor whiplash (soft note):** "I still need a hand" → "All sorted, forget I asked" within two turns reads as pride/embarrassment and the want is honestly left unresolved — acceptable, but the flip has no reason given in the lines.

## Carried findings (not built this run)

- **Q1 growth-line NO-GO (NEW, this run):** 105058 d85 — the dawn line understates the call's yield by 2 allied blades when a fresh split-village link's roster generates between dawn and the call. Mechanism pinned (projection undercount by design); fix options (a)/(b)/(c) above with the build arm. The bar stays as pre-registered for the next run.
- **Wave-5 wall (veteran bar):** 0/8 unlocked this run; villageSlainW4=0 on all seeds. Standing clears on 3/8; the door is shut by the 2-veterans bar alone. Third panel confirming the wall; the build arm's launch/damage work is the next move, not another measurement of the gate.
- **9-blade shape persists:** 105057 sat at exactly 9 for 26 days; 105054 15 days; 105056 17 days; 105055 11 days. Coalition-reach design call still with the build arm (r243 + r244 + r245 + r246 + r247, five panels).
- **March-flee loop:** NOT a systemic loop (1 single flee this run vs 7× on one r246 seed). The single-flee shape remains worth watching.
- **Bow-watch instrument:** fixed and validated (crude-only knowers now counted). The BOWKNOW mentor gate (`.bow >= 1`) still excludes crude-only knowers — same key question for the bowknow arm.
- **Tashi favor whiplash (soft):** a want that flips from need to dismissal in two turns with no reason given. Worth one line in the convo pass, not a defect.

## Metric review

- **Q1 bar held as pre-registered** (0 bad lines; every growth call harvests exactly or cools honestly). harvestMismatch=1 → **NO-GO**, not re-scored. The mismatch is the designed undercount, not a cooled-call regression — recorded under this review, and the bar is NOT revised this run; the build arm decides whether the bar or the line changes.
- **Q2/Q3 descriptive as pre-registered; no verdicts taken on them.** The wave-5 wall moved shape again (0 unlocked vs r246's unlock-without-encounter) — reported, not judged.
- **Bow-watch metric caveat (instrument, not game):** `weapon_craft` counts all weapon crafts, not bow crafts. The r246 `bowKnowers` key-coverage gap is FIXED this run (bow OR crude_bow + split); the Q3 numbers stand as measured, with the caveat attached.
- **Probe determinism:** pilot and panel probe agreed this run (both day 64, 5 blades, released, 0 stranded) — r246's pilot/panel drift did not recur.

## Telemetry

`telemetry-check.js` **quiet** on the 8-seed panel (w3fights, engaged.w3, fightsTotal, fightsByWave.3 — no large deviations vs the r192 baseline). Baseline NOT rolled.

## Infrastructure

- **Write flap:** none seen this run.
- **Registration slow (~3.4 min):** host load; the `git reset --hard` inside `git worktree add` ran the whole time. Not a flap, not a stall.
- **Reaper:** completed, active 13/16, 4 LOUD uncommitted-tree notices (siblings' held flesh-out trees, untouched).
- **Heartbeat loop:** detached (setsid, 9-min cadence), alive for the whole run; registry heartbeat never went stale.
- **Safe-commit index clobber:** watch for it after every safe-commit (known class; repair via `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`).
- **Gate (`node scripts/check.js --quick`, adoption re-run from scratch 2026-11-21 01:29–01:53Z, log `hidden_files/evidence/2026-11-21/journey-deepening-r247-gate-adopt.log`): 335 passed, 9 failed, 0 attributable.** The 9: measurement-proof staleness pair (`test-measurement-proof-update.js`, `test-measurement-workflow.js` — standing set, proof re-sign round 22 still owed); phone-frame stale receipt (`test-phone-frame-proof.js` — standing set); `test-measurement-cache-flags.js` — passes solo 4/4, load flake; five 120s timeouts under concurrent load (`test-living-garden-deed-attainment.js`, `test-occupation-panels.js`, `test-one-person-army-deed-attainment.js`, `test-trust-observer-neutrality.js`, `test-capable-bot-20261014.js` — the deed-attainment/bot tests exceed the 120s cap even solo). The run's own first gate attempt was interrupted mid-run (log `journey-deepening-r247-gate.log`, partial); the adoption re-ran from scratch. This run changed no src/js, so no failure is attributable to it.

## Verdicts

| Leg question | Verdict |
|---|---|
| Q1 growth-line (proof) | **NO-GO** — 10/11 calls exact; 105058 d85 harvested 2 allied blades the dawn line never named (designed projection undercount on an ungenerated roster) |
| Q1 stand-down probe | **GO** — day 64, 5 blades, released, 0 stranded |
| Q2 wave-5 wall | **moved** — 0/8 unlocked; veteran bar shuts the door on the whole band |
| Q3 bow watch | **measured, instrument fixed** — 23 bows equipped; BOWKNOW dormant (teach 0); 14 crude-only knowers now visible |
| Coalition-reach | **descriptive** — reached10=3, stuck79=7; 9-blade shape persists (26-day run) |
| March | **improved** — 2/3 slain; 1 single flee, no loop recurrence |
| People check | **PASS** — 2/2 transcripts sensical; warn_you heed voiced; no third closing-line duplication |
| Telemetry | quiet (8 files, 4 metrics) |
| **Deepening r247** | **reachable: yes; fun: yes (conversations sensical, bows in hands, marches slay); winnable: not yet — the wave-5 door never opened on this band, and the growth line that tells the player when to sound the call understated the harvest once** |

## Closeout

- Panel evidence + run note committed via `bash scripts/safe-commit.sh` in the worktree (watch for index clobber after every safe-commit).
- Merge `git merge --ff-only journey-deepening` in the main tree; release + remove worktree + branch; final `bash scripts/worktree-reap.sh`; verify main tree clean.
- Rotation write `2→3` with read-back. Delete the lock.
- Merged locally, pending ship — no version bump, no push, no live verification (ship loop owns that).
