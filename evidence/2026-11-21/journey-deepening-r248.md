# journey-deepening r248 — run note (2026-11-21)

- Run: r248, Lane A leg 2 DEEPENING (days 40–80; DAYCAP 100)
- Run id: playtest-20261121T1345Z (scheduled Sat 2026-11-21 07:45 CST)
- Base: local master `b6aad8942` (Loop B lever round fleshout-loop-b-20261120T2130Z adoption closeout + endgame r263 adoption)
- Branch: `journey-deepening`, worktree `~/workspace/worktrees/journey-deepening`
- Rotation read `2` (deepening); write `2→3` at closeout with read-back
- Policy: competent + MUSTER POLICY (r227 verbatim + r236 growth amendment + r237 F1/F2 + r238 stand-down) + MARCH STEP (r228 verbatim)
- Seeds: panel 105061–105068 (8 seeds); probe seed 105069 (dedicated, NOT scored in panel metrics — Q1-probe only). Band verified fresh: 0 hits in `evidence/*-prereg.md`, evidence filenames, and git log. Nearest named bands 105051–105059 (r247), 105101.
- Prereg: `evidence/2026-11-21/journey-deepening-r248-prereg.md` (this note adjudicates against it; metric binding applies — a miss is NO-GO, never re-scored mid-run)

## Pre-registration (from `journey-deepening-r248-prereg.md`)

- **Q1 (primary, regression bar): growth-line honesty.** Bar: 0 bad lines; every growth call harvests exactly or cools honestly. Descriptive: does the "enough, if the morning holds" clause fire in the wild (r246: fired 2×, both honest; r247: 0)? Does the cooled path fire (r245/r246/r247: 0)?
- **Q2 (descriptive, NO bar): the wave-5 kill wall, fourth measurement.** r245: 3/8 unlocked, 2/3 faced, 0 kills. r246: 2/8 unlocked, 0/2 faced, 0 kills. r247: 0/8 unlocked, veteran bar 8/8. Report `summarizeWave5` classes + party sizes. Descriptive sub-watch: march-flee recurrence (r246 7× loop; r247 single flee).
- **Q3 (descriptive — NO bar): the bow watch, FIXED instrument.** Expected: `weapon_teach` = 0 (flag off).
- **Q4: people check.** Read 1–2 full transcripts from convo days 45/60/80; judge sense, not counts. Watch: (a) warn_you heed speaking the warning, (b) settled-help naming the favor (unobserved r247), (c) closing-line duplication third sighting (Modhi r245, Noah r246), (d) NEW link-raise opener variety (scale r248), (e) staged-witness sitting (succession r262), (f) Tashi favor-whiplash recurrence.
- **Q5: census + reachable / fun / winnable.**

## Rotation race (recorded in the prereg)
Deepening r247's closeout wrote rotation `2→3`, but the establishment r247 adoption (closed 13:47Z) overwrote it with a stale `1→2` write — its run had read `1` before deepening r247 closed out. This run re-plays deepening (r248) on the file's current read of `2`.

## What changed in the game (base delta vs r247, src/js +567/−13, 8 files)

- journey-scale r248 (`36d694f13`): link-raise opener voice pools (bond-initiation.js +65/−4) [needs-eyes]. **LIVE**; Q4 watches.
- sim-downedtwice-b (`f11b30882`): finding #2634 GO (downed ally never re-targeted, 'goes down' fires once). **LIVE**; unobservable this run (0 "goes down" lines panel-wide).
- journey succession r262 (`a3fe07b25`): M12 escalator cap fix, staged witness sitting, M4 strip (conversation.js +5, convo-dialogue.js +29). **LIVE**; Q4 watches.
- sim-reseed-b + sim-reseedbeat-b (win-plan.js +424, villager-brain.js +18, fieldFights.js +13): dead-target re-seed + launch beat. **No live behavior change — the whole arm is env-gated `PLANRESEED=1` (node sims only)**. The driver sets no env flags.
- Net-zero lever arms (added then reverted): SHAPE2, M2STEP2, LEADSIDE, DEPMAT/ROLL35/AMMO substrate, FIBERFETCH. game.js +9 is revert residue.
- build.js stamp only.

## Tooling (r248 forks)

- Driver `scripts/journey-deepening-r248-20261121.js` (r247 fork: seed band, tag r248, EVIDIR 2026-11-21). Policy, instruments, probe staging unchanged.
- Analyzer `scripts/analyze-journey-deepening-r248-20261121.js` (r247 fork: EVIDIR 2026-11-21, probe-file regex r248).
- Proof tests forked from r247: analyzer **102/102**, muster **41/41**, march **11/11**. All GREEN before the panel was judged.
- Pilot: seed 105061 + probe 105069, exit 0, both survived (105061: day 101, wave 5, standing 384; probe: day 100, wave 3, no titan → stand-down unmeasured in the pilot). Panel re-ran all 9 seeds (~8.6 min).

## Results — panel (8 seeds; 8 survived day 100–101, 0 village-lost)

| Question | Verdict | Numbers |
|---|---|---|
| Q1 growth-line (primary) | **GROWTH-LINE-GO** | poolDays=8 lineDays=8 badLines=0 repeatLines=0 growthCalls=8 harvestMismatch=0 havenMismatch=0 cooledDays=0 cooledCalls=0 |
| Q1 "enough" clause | **fired 1×, honest** | 105068 d66: line promised 11 (need 10); call harvested the announced 2 allied blades exactly |
| Q1 cooled path | **still 0 in the wild** | 0 cooled days/calls; stands on the 28/28 unit proof |
| Q2 wave-5 wall | **moved: 1/8 unlocked, never faced** | unlocked=1 (105061 d80), neverFaced=1, facedNotKilled=0, killed=0 |
| Q2 veteran bar | **the whole story, again** | villageSlainW4: 105061=2, all others 0; 7 of 9 wave-4 kills the scholar's alone |
| Q2 march | **MARCH-SLAIN (2/2)** | marchDays=17, arrived=7, foughtOnMarch=2, slainOnMarch=2, both full-strength (11 blades, Herald at 700 HP); 0 fled |
| Q2 march-arrived-no-fight | **new shape: 105061 sat 9 days** | arrived, muster 19 ready, held blocked-at:4,4 ×9, Herald at 700 HP, never engaged |
| Q2 coalition-reach | **descriptive: reached10=4, stuck79=6** | 105065 16 days at exactly 9; 105062 26 days short (max 7); 105064 22 days short (max 7) |
| Q3 bow watch | **BOW-WATCH** | weaponTeach=0, weaponCraft=23, ammoCraft=144, equippedBows=28, bowKnowers=54 (bow=54 crude_bow=19; 0 crude-only this band) |
| F8 wild | **F8-UNMEASURED** | hits=0 — the confide line never fired panel-wide |
| F2 muster resets | **F2-REARM-GO** | resets=8, rearmed=2, stale=0 |
| Q1 refusal-heard | **REFUSAL-HEARD-GO** | refused=44, spoken=7, badDays=0 |
| Q1 titan | TITAN-MUSTER-MOVED | 8/8 seeds saw the titan, 106 titan-days, 61 verbs, slain=3 (105062, 105066, 105068) |
| Q1 wave 4 | 33 fights, 9 kills (1.125/seed) | banked2=1 (105061 only), unlockedW5=1. All 9 kills by the scholar except 105061's 2 villager kills |
| Q1 trick pipeline | TRICK-PIPELINE-FLOWS | w4killsKnown=1 vs unknown=8; 15 wave-3+ types countered; 12 learned; 10 taught; stalls flows 8/8. Knowledge still not the binding constraint |
| Q1 ladder | LADDER-OPENS + MINTS + HOLDS | opens=8/8, all five tracks minted on all seeds, holds=8/8, first stage day 14 on all seeds |
| Q2 trust | TRUST-EARNED-ONLY (footnote) | deaths=17, strangerGains=1 — the one "gain" is a −35 move on a scholar death (105061 d20); no trust paid to strangers; knownGains=36 |
| Q1 stand-down probe | **Q1-STANDDOWN-GO** | probe 105069 d84, 7 blades, released, 0 stranded; panel stand-downs 105063 d91 (11 blades), 105065 d74 (9), 105067 d68 (9) — all released |
| Q1 probe determinism | **DRIFT RECURRED** | pilot probe: no titan, no stand-down, day 100 wave 3; panel probe: stand-down d84, day 101 wave 4 — same seed, different outcome by process position |

**Per-seed panel:** 105061 d101 survived w5 standing 384 global (Herald alive 700 HP, muster 19, 9 days blocked); 105062 d101 survived w4 standing 199 regional (Herald slain, muster 0, wounded to 350 first); 105063 d101 survived w4 standing 120 regional (never faced wave 4 — 0 fights); 105064 d101 survived w4 standing 199 regional (Herald alive 350 HP, 32 titan-days); 105065 d101 survived w4 standing 199 global (16 days at 9); 105066 d100 survived w4 standing 199 regional (Herald slain d70, 11 blades); 105067 d101 survived w4 standing 199 global (7 w4 fights, 0 kills); 105068 d101 survived w4 standing 199 global (Herald slain d67, 11 blades).

## Q1 GO — the r247 NO-GO does not recur

All 8 growth calls exact (4 seeds had no growth line at all: 105061/105063/105065/105066 poolDays=0). The r247 mismatch shape — a fresh split-village link's roster generating between dawn and the call — did not fire on this band: the one "enough" call (105068 d66) harvested exactly what the dawn line named. The designed undercount is still in the code; this band simply never presented it. The bar stays as pre-registered for the next run.

## The wave-5 wall, this run: the veteran bar + the 199 stall

**Six of eight villages sit at exactly standing 199** — the readiness gate holding at t5−1 while the 2-veterans bar is short. Only 105061 broke past (384) — the only seed with 2 living wave-4 veterans (both its wave-4 kills are villagers'). 105063 never faced wave 4 at all (0 fights, standing 120). The wall's shape this run is unlock-without-encounter: 105061 unlocked day 80 and no wave-5 monster spawned in the remaining 21 days. Series: r245 3/8 unlocked, r246 2/8, r247 0/8, r248 1/8 — the door opens rarely, and when it opens nothing comes through.

## The march-arrived-no-fight shape (105061)

The coalition reached the lair (arrived=1, muster 19, ready day 92) and spent **9 days blocked at (4,4)** without fighting while the Herald sat at full 700 HP. No flee (r246's loop shape), no slay — a third shape: arrival without engagement. The hold code is `blocked-at:4,4` — the haven-edge tile, the same tile family as the scholar haven-edge deaths. Worth a look by the march arm: a ready 19-blade coalition that never engages is a dead end for the player who sounded the call. (Contrast: the two march fights this run both slew the Herald at full HP with 11 blades, latencies 1–2 days.)

## Probe determinism — drift recurred

Pilot probe (105069, run 2nd in its process): day 100, wave 3, no titan, probeDay=null, no stand-down. Panel probe (same seed, run 9th in its process): day 101, wave 4, stand-down day 84, 7 blades, released. Same seed, same driver, different trajectory — the probe's outcome depends on process position (shared state leaks between seeds in one process, or an unseeded input). r247's pilot/panel probes agreed; r246's drifted; r248 drifts again. The panel's own probe is the scored one (STANDDOWN-GO); the pilot probe is not a predictor. Instrument finding for the driver arm: the probe needs process isolation (separate process per seed) or the drift needs root-causing.

## Census (plain words)

71 villagers started across 8 villages; **71 alive at day 100** — zero roster deaths panel-wide (r247: 96→70). The scholar died 17 times (8 in the wild, 4 in the arena, 2 in contests, 2 to a stranger, 1 to sickness) — the villages hold, the scholar is the one who dies on the roads. One village (105063) had zero scholar deaths and never faced wave 4; one village (105061) reached wave 5 and global scale with standing 384. Six villages parked at standing 199 waiting on a second veteran. Nobody starved out; pantries not measured this run (no pantry field in the end snapshot — the r246 empty-pantry observation is not re-checked here).

## People check (Q4) — PASS with a graduating defect

Three full transcripts read (a third for the warn watch):

- **Esteban (105063, day 60, hotel housekeeper, dry, trust 100, hungry):** settled-help NAMES the favor — "About the food I needed — I keep thinking about what you did." The scale r247 change is now observed in the wild. The want (repay) deflects gracefully ("Right. Forget it... No — that one's settled."). BUT: closing line "See you at the fire." == first winddown line verbatim — **closing-line duplication, 3rd sighting** (Modhi r245, Noah r246).
- **Rafael (105061, day 80, interpreter, dry, trust 100, cheerful):** asks for help cleaning a wound one-handed; "Finish the fight before helping" gates honestly; commits to come back; want promised. Sensical. BUT: closing line "I'm going to go stare at something else now." == first winddown line verbatim — **4th sighting, 2/2 in this run's main sample**.
- **Luigi (105064, day 80, police officer, withdrawn, trust 12, steady):** warn_you — the heed speaks the warning in his voice ("the treeline at dusk. Don't." → "I don't want to be the one telling the fire you didn't come back."), resolution heeded. A second voice confirming landing r150 (Stella r247 was trust 92; Luigi is trust 12). Closing NOT duplicated here ("Take care of yourself." vs "This was good.").
- Link-raise opener variety (scale r248): 13 raises across 2 frames ("Word is X holds together." / "I've heard good things about X.") — the pool works; no more one fixed sentence.
- Staged-witness sitting (succession r262): not directly observed — the 6 "witness" hits are betrayal-case menu options + one "days need witnesses" line.
- Tashi whiplash (r247 soft note): no recurrence in the read sample.
- Stage-direction-as-dialogue: 1 serving (Esteban's "They're smiling as you go.").

**Q4 verdict: PASS on sense; the closing-line duplication graduates from watch to named recurring defect** — 4 sightings across 3 runs, 2/2 in this run's sample. The closing line and the first winddown line draw the same string. Build arm (conversation): the two slots need distinct pools, or the winddown must exclude the closing line.

## Carried findings (not built this run)

- **Q1 growth-line GO (this run):** 8/8 calls exact; r247 NO-GO does not recur. The "enough" clause fired 1× and was honest.
- **Wave-5 wall (veteran bar + 199 stall):** 1/8 unlocked, never faced; 6/8 villages parked at exactly 199. Third panel confirming the wall's shape; the build arm's launch/damage work is the next move, not another measurement of the gate.
- **9-blade shape persists:** 105065 sat at exactly 9 for 16 days; 105062/105064 never above 7. Coalition-reach design call still with the build arm (r243 + r244 + r245 + r246 + r247 + r248, six panels).
- **March-flee loop:** NOT a systemic loop (0 fled this run; 2/2 slain). The new arrived-no-fight shape (105061) is the thing to watch.
- **Bow-watch instrument:** 28 bows equipped (r247: 23); 54 knowers, 0 crude-only this band (r247: 14 crude-only). The BOWKNOW mentor gate (`.bow >= 1`) still excludes crude-only knowers — same key question for the bowknow arm.
- **Probe determinism drift recurred** (pilot vs panel probe disagree) — driver arm owns process isolation or a root-cause.
- **Downedtwice fix:** unmeasured (0 "goes down" lines panel-wide).
- **Trust:** no trust paid to strangers (the 1 counted "gain" is a −35 move).

## Metric review

- **Q1 bar held as pre-registered** (0 bad lines; 8/8 calls exact → GO). The "enough" clause fired 1× and was honest — the clause is now measured honest 3× across runs (r246 2×, r248 1×). Cooled path still 0 in the wild (three runs running); stands on the 28/28 unit proof. No revision.
- **Q2/Q3 descriptive as pre-registered; no verdicts taken on them.**
- **Probe determinism:** r247 agreed, r248 disagrees — propose the driver arm run the probe in a separate process (or root-cause the order dependence) before the next run leans on the pilot probe. Not a mid-run re-score: the panel probe is the scored one.
- **Q4 closing-line duplication:** graduate from watch to named defect (4 sightings, 2/2 this run). The watch stays; the build arm owns the fix.
- **Bow-watch metric caveat (instrument, not game):** `weapon_craft` counts all weapon crafts, not bow crafts. The r246 `bowKnowers` key-coverage gap stays FIXED (bow OR crude_bow + split).

## Telemetry

`telemetry-check.js` **quiet** on the 8-seed panel (w3fights, engaged.w3, fightsTotal, fightsByWave.3 — no large deviations vs the r192 baseline). Baseline NOT rolled.

## Infrastructure

- **Write flap:** new window 13:46–~14:28Z (~43 min) + flicker; registration failed twice (full checkout EPERM; stale branch); recovered via the sparse workaround (see prereg). Registry lock held by the LIVE Lane B `journey2-social` registration 14:39–14:47Z; waited, never force-released.
- **Reaper:** SKIPPED (registry lock held, 9th consecutive skip — ALERT threshold crossed earlier today; holder is live sibling registrations, not a stuck reaper).
- **Heartbeat loop:** detached (setsid, 9-min cadence, pid 77620), alive for the whole run; registry heartbeat never went stale.
- **Safe-commit index clobber:** watch for it after every safe-commit (known class; repair via `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`).
- **Gate (`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`, log `hidden_files/evidence/2026-11-21/journey-deepening-r248-gate.log`): 333 passed, 11 failed, 0 attributable.** The 11: (a) 5× sparse-worktree ENOENT — `test-controller-census`, `test-conversation-answer-context`, `test-legacy-map-nightfall`, `test-regional-sprites`, `test-phone-frame-proof` all fail opening committed `evidence/2026-10-17` / `2026-10-18` fixture files that exist in master and are absent only in this sparse worktree (verified by `ls` + `git ls-files` in the main tree) — an artifact of the flap workaround, not the game; (b) 3× measurement staleness family (`test-measurement-proof-update`, `test-measurement-workflow`, `test-measurement-comparison` — standing set, proof re-sign round 22 still owed); (c) 3× 120s timeouts (`test-living-garden-deed-attainment`, `test-occupation-panels`, `test-one-person-army-deed-attainment` — standing set, exceed the cap even solo). This run changed no src/js, so no failure is attributable to it. The r247 adoption gate was 335/9; the delta (+2 failures) is the sparse-worktree ENOENT set (phone-frame was already failing there as stale receipt; controller-census, conversation-answer-context, legacy-map-nightfall, regional-sprites are the new ENOENTs) minus the two that passed this time (`test-measurement-cache-flags`, `test-trust-observer-neutrality` / `test-capable-bot-20261014` did not fail — load variance).

## Verdicts

| Leg question | Verdict |
|---|---|
| Q1 growth-line (proof) | **GO** — 8/8 calls exact; r247 NO-GO does not recur |
| Q1 "enough" clause | **FIRED 1×, honest** |
| Q1 stand-down probe | **GO** — probe d84, 7 blades, released, 0 stranded |
| Q2 wave-5 wall | **moved** — 1/8 unlocked, never faced; veteran bar + 199 stall |
| Q3 bow watch | **measured** — 28 bows equipped; BOWKNOW dormant (teach 0); 54 knowers |
| Coalition-reach | **descriptive** — reached10=4, stuck79=6; 9-blade shape persists |
| March | **improved** — 2/2 slain, 0 fled; new arrived-no-fight shape (105061) |
| People check | **PASS** — 3/3 sensical; settled-help named; warn heed voiced in a 2nd voice; closing-line duplication graduates to defect (4 sightings) |
| Telemetry | quiet (8 files, 4 metrics) |
| **Deepening r248** | **reachable: yes; fun: yes (conversations sensical, marches slay, bows in hands); winnable: not yet — the wave-5 door opened once and no wave-5 monster ever showed; six villages parked at standing 199 waiting on a second veteran** |

## Closeout

- Panel evidence + run note committed via `bash scripts/safe-commit.sh` in the worktree (watch for index clobber after every safe-commit).
- Merge `git merge --ff-only journey-deepening` in the main tree; release + remove worktree + branch; final `bash scripts/worktree-reap.sh`; verify main tree clean.
- Rotation write `2→3` with read-back. Delete the lock.
- Merged locally, pending ship — no version bump, no push, no live verification (ship loop owns that).
