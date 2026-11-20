# journey-deepening r246 — run note (2026-11-20)

- Run: r246, Lane A leg 2 DEEPENING (days 40–80; DAYCAP 100)
- Run id: playtest-loop-a-20261120T1745Z (scheduled Fri 2026-11-20 11:45 CST)
- Base: local master `cf3b5732e` (sim-winnability-round-1530 adoption closeout)
- Branch: `journey-deepening`, worktree `~/workspace/worktrees/journey-deepening`
- Rotation read `2` (deepening); write `2→3` at closeout with read-back
- Policy: competent + MUSTER POLICY (r227 verbatim + r236 growth amendment + r237 F1/F2 + r238 stand-down) + MARCH STEP (r228 verbatim)
- Seeds: panel 105041–105048 (8 seeds); probe seed 105049 (dedicated, NOT scored in panel metrics — Q1-probe only). Band verified fresh: 0 hits in `evidence/*-prereg.md`, evidence filenames, and git log. Nearest named bands 105031–105039 (r245), 105101.
- Prereg: `evidence/2026-11-20/journey-deepening-r246-prereg.md` (this note adjudicates against it; metric binding applies — a miss is NO-GO, never re-scored mid-run)

## Pre-registration (from `journey-deepening-r246-prereg.md`)

- **Q1 (primary, regression bar): growth-line honesty.** Bar: 0 bad lines; every growth call harvests exactly or cools honestly. Descriptive: does the "enough, if the morning holds" clause fire in the wild (r245: never)? Does the cooled path fire (r245: 0)?
- **Q2 (descriptive, NO bar): the wave-5 kill wall, second measurement.** r245: 3/8 unlocked, 2/3 faced, 0 kills, parties of 1–2. Report `summarizeWave5` classes + party sizes on this fresh band.
- **Q3 (NEW, descriptive — NO bar): the bow watch.** BOWCRAFT is TURNED ON in live play; BOWKNOW/BOWOPEN are flag-gated OFF. New driver end snapshot `bowWatch`: telemetry counts for `weapon_teach` / `weapon_craft` / `ammo_craft` / `craft`, equipped bows at end, bow items held, bow-knowers. Expected: `weapon_teach` = 0 (flag off — non-zero would be a defect).
- **Q4: people check.** Read 1–2 full transcripts from convo days 45/60/80; judge sense, not counts.
- **Q5: census + reachable / fun / winnable.**

## What changed in the game (base delta vs r245, src/js +208/−9, 9 files)

- r245 growth-line cooled-call fix (`e086cffcb`, titans.js) — the fix under regression watch (Q1).
- BOWKNOW mentoring (`eaf530d6a`, villager-build.js) — flag-gated OFF; Q3 checks it stays dormant.
- Scale r246 react wind-down fix (`db6f4d7ce`, convo-wants.js) — live-play re-read belongs to establishment r245 (CLEAN) and the scale r246 panel; the deepening driver carries no sitting-picks array, so NOT re-measured here (noted in prereg, not silently dropped).
- Succession r254 mourning witness variant (`aea63f6b5`), social r256 gossip-ask dry-line + M4-split + TRAIL 3-press (`ed19c3d57`), crisis r253 'The The' fix (`eb12c1471`), landing r149 dodge/close no-path + goal-bridge pool (`0d38a74d1`).
- sim-evade-a / sim-searsupply-a lever code is flag-gated default-off or reverted; the net game.js delta is the r253 fix only — no live behavior change from the sim arms.

## Tooling (r246 forks)

- Driver `scripts/journey-deepening-r246-20261120.js` (r245 fork: seed band, tag r246, EVIDIR 2026-11-20, + `bowWatch` end snapshot). Policy, instruments, probe staging unchanged.
- Analyzer `scripts/analyze-journey-deepening-r246-20261120.js` (r245 fork: EVIDIR 2026-11-20, + `summarizeBow` + BOW-WATCH panel print). **Fork correction:** the r245 test's `runPanel` still targeted the r244 analyzer (panel-level cases tested the old analyzer); the r246 test's `runPanel` targets the r246 analyzer + r246 seed/transcript filenames, so the panel cases now exercise the fork.
- Proof tests forked from r245: analyzer **100/100** (95 carried + 5 new bow cases 97–101), muster **41/41**, march **11/11**. All GREEN before the panel was judged.
- Pilot: seed 105041 + probe 105049, exit 0, both survived, GROWTH-LINE-GO (1 pool day, 1 line, 1 exact harvest), probe STANDDOWN-GO (day 61, 13 blades, 0 stranded), bowWatch populated on both. Panel re-ran all 9 seeds (~10.3 min).

## Results — panel (8 seeds, all survived day 100–101, wave 4–5)

| Question | Verdict | Numbers |
|---|---|---|
| Q1 growth-line (primary) | **GROWTH-LINE-GO** | poolDays=8 lineDays=8 badLines=0 repeatLines=0 growthCalls=8 harvestMismatch=0 havenMismatch=0 cooledDays=0 cooledCalls=0 |
| Q1 "enough" clause | **fired in the wild, 2×, both honest** | 105047 + 105048 heard "enough, if the morning holds" (would stand at 11 of 10); both announced 2 allied blades and harvested exactly 2. First wild firing (r245: never). Allied-leg lines also exact on 105042 (2/2). |
| Q1 cooled path | **still 0 in the wild** | 0 cooled days/calls; stands on the 28/28 unit proof. |
| Q2 wave-5 wall | **moved: unlock without encounter** | unlocked=2 (105043 d91, 105048 d100), neverFaced=2, facedNotKilled=0, killed=0. 105043: 10 days post-unlock, daily world census never showed a wave-5 monster (90 monster entries d91–101, all w2–4). 105048: unlocked on the last day — no runway (horizon artifact, not a finding). |
| Q2 coalition-reach | **descriptive: reached10=3, stuck79=5** | 105044 ready d76 (1 day), slew Herald d89; 105047 ready d88 after 33 days (26-day run at 9); 105048 ready d68 (1 day), ready=true at end; 105045 10-day run at exactly 9; 105046 never located the Herald (omen d93, 0 titan-days). |
| Q3 bow watch | **BOW-WATCH (descriptive)** | weaponTeach=0, weaponCraft=45, ammoCraft=159, equippedBows=23, bowKnowers=55. Bows ARE equipped in the wild (23 across 6/8 seeds); one seed (105047) shows zero bow activity of any kind. |
| F8 wild | **F8-UNMEASURED** | hits=0 — the confide line never fired panel-wide. |
| F2 muster resets | **F2-REARM-GO** | resets=12, rearmed=7, stale=0. 105048 re-armed daily d69–76 (7×). |
| Q1 refusal-heard | **REFUSAL-HEARD-GO** | refused=22, spoken=5, badDays=0. 105048's 20 refusals are the daily march re-arms re-sounding the call. |
| Q2 march | **MARCH-SLAIN (1/1) + MARCH-FLED (0/7)** | marchDays=21, arrived=14, foughtOnMarch=8, slainOnMarch=1. 105044: ready d75 → fight d89 (latency 14d, held blocked-at:4,4 ×7), slew the Herald at 11 blades. 105048: 7 march fights d68–75, ALL fled at full HP (see below). |
| Q1 titan | TITAN-MUSTER-MOVED | 7/8 seeds saw the titan, 155 titan-days, 75 verbs, slain=3 (105042, 105043, 105044). |
| Q1 wave 4 | 32 fights, 3 kills (0.375/seed) | banked2=2, unlockedW5=2. Player deaths 25, 10 wild. Kills down from 9 (r244/r245) — band noise, no mechanism (no combat tuning in the base delta; r243 had 2). |
| Q1 trick pipeline | TRICK-PIPELINE-FLOWS | w4killsKnown=2 vs unknown=1; 9 wave-3+ types learned; 11 types countered; stalls flows 8/8. Knowledge still not the binding constraint. |
| Q1 ladder | LADDER-OPENS + MINTS + HOLDS | opens=8/8, all five tracks minted on all seeds, holds=8/8, first stage day 14 on all seeds. |
| Q2 trust | TRUST-EARNED-ONLY | deaths=25, strangerGains=0, knownGains=63, deadBearerDays=1. The r244 single stranger instance has not recurred in two panels. |

**Per-seed panel:** 105041 d100 survived w4 pop 7/12 standing 175; 105042 d101 survived w4 pop 5 standing 200 (Herald slain); 105043 d101 survived **w5** pop 8 standing 260 (Herald slain, w5 unlocked d91, never faced); 105044 d101 survived w4 pop 11 standing 360 (Herald slain d89, 11 blades); 105045 d101 survived w4 pop 8 standing 200 (stuck at 9 for 10 days); 105046 d101 survived w4 pop 8 standing 452 (Herald never located); 105047 d101 survived w4 pop 10 standing 150 (ready d88 after 33 days, muster stood down); 105048 d100 survived **w5** pop 8 standing 255 (w5 unlocked d100; 7 march fights, 7 fled).

## The wave-5 wall, this run: TWO walls, not one

**Wall 1 — the veteran bar holds the door shut.** 105044 (standing 360) and 105046 (standing 452) never unlocked wave 5 despite standing far past the 200 bar. The wave-5 readiness gate needs 2 living veterans with wave-4+ kills; both villages have zero village wave-4 kills (analyzer villageSlainW4=0; 105044's single wave-4 kill is the scholar's alone, 105046 has none). Standing is not the wall — the veteran bar is. The villages are rich in standing and short on wave-4 killers. (105043/105048 unlocked with villageSlainW4=2 each.)

**Wall 2 — the door opens and nothing comes through.** 105043 unlocked wave 5 on day 91 (standing 260, Herald slain, readiness met) and in the 10 days after, the daily world census never showed a wave-5 monster — 90 monster entries, all waves 2–4 — and no wave-5 fight ever engaged. r245's villages faced wave-5 monsters (1 + 3 fights); this band's unlocked village faced none. Spawn cadence after unlock is the open question for the build arm (the census counts presence, not spawn events, so the exact spawn rate is not pinned here).

## The 105048 march-flee loop (7 fled)

The village reached 11 blades (8 allies + 3 Haven) on day 67, marched on day 68, and fought the Herald **seven days running (d68–75), fleeing every time at full HP** (hpAtFight=700 each morning). The muster re-armed daily and marched again the next day — a daily flee loop, 0 damage dealt across 7 coalition fights. Then on day 98 the Herald's HP dropped 700→342 in a field encounter (still alive at day 100): the same village CAN hurt the Herald outside the march. The march-fight flee is the finding — the coalition reaches the lair and walks away seven days running while a field fight lands 358 damage. Whether the flee is the fight brain's call or the march step's, the shape is real; mechanism owed to the build arm. (Contrast r244: 4/4 march fights slain.)

## Q3 bow watch — what it actually measured

- **Bows are equipped in the wild:** 23 equipped bows across 6/8 seeds (crude_bow ×14, bow ×5, crossbow ×4), 21 bow items held. The BOWCRAFT turn-on is observable on this leg — the establishment r245 watch was blind only because it scanned the wrong keys.
- **weaponCraft=45 is NOT "45 bow crafts":** the `weapon_craft` telemetry key counts ALL weapon crafts (spears, knives, bows) — the key carries no item. The hard bow evidence is the equipped count (23) + ammoCraft=159 (arrow/bolt batches). The run note does not claim 45 bow crafts.
- **weaponTeach=0** — BOWKNOW stays dormant with its flag off, as expected.
- **bowKnowers=55 counts the `bow` key only.** The BOWCRAFT seeing code seeds the EQUIPPED rung's recipe id (`crude_bow` as often as `bow`), so `crude_bow`-only knowers are invisible to this metric. That is the likely read on 105044/105045 (0 knowers despite 6/5 equipped crude_bows) — an instrument key-coverage gap, not a game verdict. The analyzer test now covers the metric as written; the instrument fix (count `bow` OR `crude_bow`) is owed to the next run, and the same key question goes to the bowknow arm: BOWKNOW mentors require `.bow >= 1`, so a `crude_bow`-only knower cannot mentor even with the flag on.
- **105047 shows zero bow activity of any kind** (0 craft, 0 ammo, 0 equipped, 0 knowers) — the turn-on does not reach every village.

## Census (plain words)

96 villagers started across 8 villages; **65 alive at day 100**. 31 died — 25 of them scholars (the player character, dying 25 times, 10 out in the wild), only 6 other villagers. The villages hold; the scholar is the one who dies on the roads. Two exiles (105041). Nobody scattered, nobody starved out — but three villages end day 100 with a literally empty pantry (0 kcal: 105041, 105042, 105044) and 5–11 people still alive; the store empties faster than the village starves (pantries swing hard: 105045 fell 71,992 → 8,750 in 20 days; 105046 127,341 → 44,203 in 15). The ladder opens everywhere (stage 3 at day 80 on all seeds); the Herald walks the roads for 155 titan-days; three villages slew him. Two villages opened the wave-5 door; neither walked through it. Wave-4 kills are down (3 vs 9) — the villages fight plenty (32 fights) and mostly lose the kill.

## People check (Q4) — PASS

Two full transcripts read:

- **Chen (105041, day 60, mason, mischievous, trust 90):** wants a joint forage tomorrow — "We're eating through stores faster than we replace them. Come forage with me tomorrow." The player commits; Chen defers honestly because he's away from Haven ("I can't promise a dawn meet while I'm out — find me when I'm back, and we'll set it then"). The want resolves as stated-deferred, not evaporated. Sensical, characterful.
- **Noah (105043, day 80, comic shop owner, withdrawn, trust 100, grieving):** re-asks about food he needed ("About the food I needed — I still haven't found anyone. Any chance?"). The player commits; he thanks them, then invites a trapline walk; the player declines and he takes it gracefully ("Right — another time"). The want stays promised. Sensical.

Two carried notes (not defects for this run):
1. **Closing-line duplication recurs** (Noah d80): the closing line renders twice verbatim (closing line + first winddown line: "I'll be okay. Don't worry about me..."). Same cosmetic shape r245 noted for Modhi — now twice-observed, on a second seed/villager.
2. **favor_requirements lines read as mechanics instructions** ("Move next to them, on the same side of the Haven door, to help." / "Get to your partner's side of the Haven door...") — informative, off-voice; two instances this run.

## Carried findings (not built this run)

- **Wave-5 wall 1 (veteran bar):** standing 360/452 without the door — the 2-veterans-with-wave-4+-kills bar is the binding constraint. Design/build-arm question, with this panel's numbers.
- **Wave-5 wall 2 (spawn absence):** unlock d91, zero wave-5 monsters in 10 days of world census. Spawn-cadence question for the build arm.
- **105048 march-flee loop:** 7 coalition fights, 7 fled at full HP; the same village dealt 358 damage to the Herald in a field fight. Mechanism owed to the build arm.
- **Bow-watch instrument fix owed:** count `bow` OR `crude_bow` knowers (the seeing code seeds the equipped rung's id). Same key question for the bowknow arm (BOWKNOW's `.bow >= 1` mentor gate).
- **Closing-line duplication (cosmetic, twice-observed):** closing line + first winddown line identical (Modhi r245, Noah r246).
- **Q2 coalition-reach design call** (r243 + r244 + r245 + r246, four panels now): reached10 1/8 → 4/8 → 4 → 3; the 9-blade shape persists (105045's 10-day run at exactly 9; 105047's 26-day run at 9). Still with the build arm.
- **Wave-4 kills down (3 vs 9):** band noise on this read — no combat tuning in the base delta, r243 had 2. No fix owed.

## Metric review

- **Q1 bar held as pre-registered** (0 bad lines; every growth call harvests exact or cools honestly). The "enough" clause fired twice in the wild and both harvests were exact — the descriptive part of Q1 is answered, not re-scored.
- **Q2/Q3 descriptive as pre-registered; no verdicts taken on them.** The wave-5 wall moved shape (unlock-without-encounter vs r245's faced-without-kill) — reported, not judged.
- **Bow-watch metric caveat (instrument, not game):** `weapon_craft` counts all weapon crafts, not bow crafts; `bowKnowers` counts the `bow` key only. Both are reported with the caveat above; the equipped-bow count is the hard number. The instrument fix is owed to the next run — the Q3 numbers stand as measured, with the caveat attached.
- **Probe determinism (standing observation):** the probe seed ran twice — pilot (day-61 staging) and panel re-run (day-65 staging), same seed, same code, different trajectories. Both staged and stood down cleanly, so the Q1-PROBE verdict is unaffected — but a later run should not assume a probe seed replays identically.

## Telemetry

`telemetry-check.js` **quiet** on the 8-seed panel (w3fights, engaged.w3, fightsTotal, fightsByWave.3 — no large deviations vs the r192 baseline). Baseline NOT rolled.

## Infrastructure

- **Write flap:** none seen this run.
- **Registration slow (~19 min):** host load ~9 (sibling jest runs + git status scans); the `git reset --hard` inside `git worktree add` ran the whole time (file count 90k→93k→complete). Not a flap, not a stall — load.
- **Reaper:** completed, active 12/16, 4 LOUD uncommitted-tree notices (siblings' trees, untouched).
- **Safe-commit index clobber:** watch for it after every safe-commit (known class; repair via `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`).
- **Gate (`node scripts/check.js --quick`): 339 passed, 5 failed in 813s — 0 attributable.** The 5 are the standing master set (also 339/5 on establishment r245): measurement-proof-update + measurement-workflow (proof staleness), phone-frame-proof (stale receipt), living-garden + one-person-army deed-attainment (120s timeouts under load; capable-bot passed at 111s). None touches the deepening driver/analyzer/proofs, and this run has zero src/js changes. Gate GO.

## Verdicts

| Leg question | Verdict |
|---|---|
| Q1 growth-line (proof) | **GO** — 8/8 lines exact, 0 bad; "enough" clause fired 2× in the wild, both honest |
| Q1 stand-down probe | **GO** — day 65 (panel re-run), 7 blades, released, 0 stranded |
| Q2 wave-5 wall | **moved** — unlock without encounter (2 unlocked, 0 faced, 0 kills); veteran bar + spawn absence are the two walls |
| Q3 bow watch | **measured** — 23 bows equipped in the wild; BOWKNOW dormant (teach 0); instrument key caveat recorded |
| Coalition-reach | **descriptive** — reached10=3, stuck79=5; 9-blade shape persists |
| March | **mixed** — 1/1 slain (105044, 11 blades) + 0/7 fled (105048) |
| People check | **PASS** — 2/2 transcripts sensical |
| Telemetry | quiet (8 files, 4 metrics) |
| **Deepening r246** | **reachable: yes; fun: yes (conversations sensical, muster voice honest, bows in hands); winnable: not yet — the wave-5 door opens on standing the villages can't convert into kills, and when it opens nothing comes through** |

## Closeout

- Panel evidence + run note committed via `bash scripts/safe-commit.sh` in the worktree (watch for index clobber after every safe-commit).
- Merge `git merge --ff-only journey-deepening` in the main tree; release + remove worktree + branch; final `bash scripts/worktree-reap.sh`; verify main tree clean.
- Rotation write `2→3` with read-back. Delete the lock. 
- Merged locally, pending ship — no version bump, no push, no live verification (ship loop owns that).
