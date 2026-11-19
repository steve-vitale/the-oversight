# Journey leg ESTABLISHMENT — r243 run note (2026-11-19, Lane A)

## Run

- **Run id:** `lane-a-20261119T115425Z` — scheduled Thu 2026-11-19 04:45 CST, started ~11:05Z 2026-11-19.
- **Leg:** establishment (days 14–40, 42-day horizon, death-aware tail +10d). **Rotation read 1; write 1→2 at closeout** with read-back.
- **Base:** local master `e1b6cc7d6` (post r147 adoption merge — see below).
- **Pre-flight:** main tree CLEAN, disk 44%, `git pull` already up to date.
- **Stale-lock recovery + r147 adoption (Part 1 of this run):** the 02:45 CST landing run's lock (`2026-11-19T09:04:57Z-playtest-loop-a`, run `lane-a-20261119T090508Z`) had a registry heartbeat last `10:11:11Z` (~55 min stale), no live coordinator, no process with the worktree as cwd, no file writes in the tree in 15 min. Dead per the heartbeat rule. `docs/ONTOLOGY.md` was emptied to 0 lines in the worktree (known write-flap shape); restored from HEAD, hash-object verified equal to HEAD blob `c4fcc0454`. Fix commit `9efd6870b` (maps-pool dry lines, `compare_maps` nonenew 2→6, shared 3→6 in `src/js/conversation.js`, + proof test) was NOT on master. Adopted: proof test green on the original tip and both rebased tips; rebase 1 onto `385f07995` → `4ea7686ea`; evidence committed `ebaf457be`; gate `338 passed, 6 failed in 992s`, 0 attributable (5 = r242's standing set, 6th = `test-measurement-cache-flags.js`, the r241 load artifact); rebase 2 onto `2c2b6b293` (ship-loop batch + speargate-a GO landing) → `e1b6cc7d6`; merge `--ff-only` exit 0, master `e1b6cc7d6`; worktree released, branch deleted, reap; rotation 0→1. Full record in `evidence/2026-11-19/journey-landing-r147.md` (adoption addendum + Q4 gate tally). Safe-commit index clobber struck twice on that worktree; repaired the same way each time and verified (status empty, diff empty, hash-object == HEAD blob). A chat-spawned sibling adoption agent for the same r147 run was running concurrently; it made no git writes to the branch and the merge landed cleanly.
- **Prereg:** `evidence/2026-11-19/journey-establishment-r243-prereg.md`. Leg question: **Q1 family, sixth fresh-band re-read** — widened LOST trigger, F5 floor watch, Q5 moot-path instrument with same-day fix, F2 scholar-death watch, senseexped launch watch, counter-label watch, F2 echo re-read. Fresh band **101801–101805** (verified fresh: prereg-scope grep zero hits; filename + git-log greps zero; no 1018 range named in any earlier prereg/forbidden list; the full-tree `git grep -w` hung on index-lock contention and was killed, not completed — noted in the prereg). Pilot 101801, panel 101802–101805, competent policy, 42d.
- **Base delta vs r242's panel base `6b47e98b6`** (6 commits): `e7bd782ab` social r238 (wild F6 dry fix, `conversation.js`); `eccc08af2` endgame r246 (counter-label fix + peakVet 8→3, `game.js`); `97e78670d` senseexped-b GO (`party-wiring.js`); `d3dcd1acd` deepening r243 (titan refusal counts Haven blades, `titans.js`); `b76d65445` version bump; `4ea7686ea` landing r147 (maps-pool expansion, `conversation.js`). **No `convo-wants.js` change, no want-raise-floor change.**
- **Analyzer revisions (r243)** in `scripts/analyze-journey-establishment-r243-20261119.js` (driver in `scripts/journey-establishment-r243-20261119.js`), committed as `ed7cc241c` (prereg + driver/analyzer clones; index clobber hit and repaired, verified clean after):
  - STRANDED relabel (r242 metric review): a stranded dawn with a mode='work' wedge sit reads "wedge working a live favor (not a miss)", counted separately.
  - Q5 same-day flag (r242 metric review): an exile whose exiling case was never seen LIVE in `caseLog` (firstDay null, resolution 'exile') + exile-day moot convening lines + pronouncement counts as same-day open+resolve; verdict unchanged.
  - Pilot-gate marker correction is prereg-text only (`nv:*` picks are the nonverbal marker, not `openThread`).
- **Analyzer fork proof** on the r242 corpus (renamed r242→r243, durable copy in `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/r243-analyzer-proof/`, log `r243-analyzer-proof.log`): first run reproduced every old-bar number exactly EXCEPT same-day read 0 (bug: condition used `myCases.length === 0`, but case_7 IS in myCases as a terminal-only snapshot). Fix: `myCases.some(mc => mc.firstDay === null && mc.resolution === 'exile') && presentLines.length > 0 && !!pron`. Re-run: same-day = 3 (Priya/Yuki/Wanjiru, case_7), HEARD 3 / PRESENT 2 / UNHEARD 0 unchanged; SPOTTER 36, LADDER 3/5, FASTER-ID 5/5 (118/189), CODEX 152, END 11/11, THREAD 2/2, TRAVEL 0/0, TRUST 0, JAM 0, VILLAGE 5/5, Q2 0/10, Q3 distinct 1, Q1 2/70, Q6 exact, scholar deaths 6 with the same locations; STRANDED now "misses=0; wedge-working-a-live-favor dawns=2" (the expected new line). **Fork proof PASSES.** Fix committed `d25ece6c8` (index clobber hit a fourth time, `MM` manifestation; repaired and verified). Note: a sibling cleanup deleted `/tmp/r243/` and `/tmp/r243-analyzer-proof/` mid-run — do not use /tmp for scratch on this box; the proof corpus lives durably in goal hidden_files.

## Pre-registered bars — verdicts

| Bar | Result | Verdict |
|---|---|---|
| END (broken-live forage closes) | 11/11 qualifying (printed 11/12 incl. 1 excused), THREAD 1/1, TRAVEL 0/0 | **GO** (see adjudication) |
| Q1 favorless asks | 2/53 (3.8%), E1 2/2, stage-0-surfaced 2/2, **LOST 0** | **GO** |
| Q1b want-raise rate | 53/332 (16.0%), zero-raise 0/5 | **GO**; F5 floor shape **absent** (thinnest 10.3%) |
| Q2 cut conversations | 0/10, 3 engine-ended WITH closing beats | **GO** |
| Q3 recap paraphrase | distinct 0 of 10 sittings (raw 0) | report-only |
| Q5 exile warning | 4 exiles, all moot; HEARD 3, PRESENT 1, UNHEARD 0; same-day 2 | **answered** |
| Q6 policy foraging | no F4 shape (min bumpCalls 16); commits 3/5/1/4/4 | report-only |
| SPOTTER | 45 total, 5/5 | **GO** |
| LADDER (≥1 villager at 5+ spotter on ≥4/5 seeds) | 4/5 (per-seed 8/10/4/18/5) | pace-read **PASS** (r242 was 3/5 MISS) |
| FASTER-ID | 5/5, 112 benefit plays in 157 bump calls | **GO** |
| CODEX | 131 plants | report-only |
| STRANDED | 13 entries / 11 distinct days, 1 run, worked 0, guard 0, social sits 11/11 days, misses 0 | **GO** in substance (see adjudication) |
| TRUST / JAM / VILLAGE / ROSTER | 0 drops / 0 / 5/5 / 0 unaccounted | **GO** |
| Scholar deaths | **3/5** | **INVESTIGATE** (≥3 rule; F2) |

## Pilot (seed 101801) — gate PASS

Exit 0, endDay 43, over=false, aliveEnd 9, aliveAt40 9, wave 3, standing 0, pantry 8100, wedgeSits 76, committed 3, bumpCalls 16, codexPlants 25. Two sittings held, transcript written, sittingCloses 2, spotter 8, END 2/2. Q1 0/14 favorless; Q1b 14/68 (20.6%). All pilot-gate clauses verified: standingEnd 0 (non-null), scholarDawns 42, teleTypeCounts 47 keys, mootLines 2, caseLog 42, rosterDepartures 3, verbal sits carry pick wantIds (76/76), 20 sits carry all four Q1 trace fields in traceStart (fromSeed/seedFavorId/need/ledgerFavor), "pull weight" present in driver source (grep = 3). No `nv:*` sits on the pilot (the marker revision is prereg-text; nothing to check). Scholar death Maricela d8 (the wild), last dawn (4,4) atHaven=true insideHaven=false — the r242 F2 shape on the pilot itself.

## Analyzer verdicts — detail

**Q1 (favorless asks, 2/53 = 3.8%, GO).** Both class E1 — the seeded opener never ran, and both asks surfaced later (a day's delay, not a loss): Rahul d11 on 101803 (openThread request, case picks 5/7, dlg:help pressed NO — ask never offered a hearing) and Nikolai d23 on 101804 (openThread secret, case picks 0/6, dlg:help pressed NO). The E1 shape is the stable residual for the second straight panel (r242: 2/2 E1, both surfaced; r243: 2/2 E1, both surfaced). Kinds panel: forage_help 26, stay_close 1, heal_help 11, sick_help 10, food_share 3, (no-kind) 2; no water_haul. Contentless re-seeds after favorless sits: 0/2. Favorless repeats per villager: Rahul 1, Nikolai 1.

**Q1b (want-raise, 53/332 = 16.0%, GO).** Per-seed: 14/68 (101801), 14/55 (101802), 8/78 (101803), 9/71 (101804), 8/60 (101805). Any-want sits 316/332. Zero-raise seeds 0/5. **F5 floor: thinnest 10.3%, fattest 25.5% — the thin<7% while fat>15% shape is ABSENT on this band.** Per the r242 rule (thinnest seed ≥10% closes it), the floor question closes on this band; the finding already sits with the build arm (F1) and does not recur here. This is the fourth panel the shape was tracked on (r233 thin, r240 closed, r241 re-opened, r242 recurred→finding, r243 absent).

**Q2 (0/10 CUT, GO).** 3 engine-ended sittings WITH closing beats, 0 other no-close. The conversation-ending machinery holds.

**Q3 (distinct 0, report-only).** No recap paraphrase in any of the 10 sittings. Canned lines: pod-dream 1/2, slope-reading 1/2, take-it 1/4, parting-plain-see 1/1, rest 0.

**Q5 (4 exiles, answered).** All four by the moot path; HEARD 3, PRESENT-at-sentencing 1, UNHEARD 0. The new same-day instrument fires on this panel: **2 same-day open+resolve** cases (Oliver and Daniyar, both d10 on 101804, case_2 — never seen open in caseLog, moot convening + pronouncement the same day). Under the old instrument both would have read as nothing. Detail:
- Aroha + Aria, d11 on 101803 (case_4 open d9–d11): HEARD — moot/case lines naming Aroha (5), case-thread-held proxy sits with Zoe and Rahul on d11, 2 present-at-exile-day-moot lines. Aria had 0 lines naming her but shares the case and the d11 proxy sits.
- Oliver, d10 on 101804 (case_2, same-day): HEARD — moot/case lines d9 (accusation + Codex "Heard about the case against Oliver"), 3 present-at-moot lines.
- Daniyar, d10 on 101804 (case_2, same-day): PRESENT-at-sentencing — in the room, no advance naming, 3 present-at-moot lines.
- No freeloader exile on this panel, so the d7-warning question stays open. One freeloader-warning line did appear (101804 d22: "Around the fire, low voices: Deborah isn't pulling weight. Nobody says it to their face. Yet.") with no exile following.

**Q6 (report-only).** Per-seed bumpCalls/wedgeSits/commits: 16/76/3, 34/64/5, 38/79/1, 50/81/4, 19/66/4. No F4 shape (min bumpCalls 16, far above the ≤2 bar); the r241 zero-commit shape did not recur (min 1 commit).

**SPOTTER (45, 5/5, GO). LADDER (4/5, PASS). FASTER-ID (5/5, 112/157, GO).** The identification machinery is healthy; the ladder pace-read recovers from r242's 3/5 miss. CODEX 131 plants (fieldwork identifications).

**END (11/11 qualifying, GO — adjudication).** The analyzer prints 11/12. The 12th is Ethel on 101805 (broken d30, ending never ready — every end attempt `end-not-ready:Finish the current event before foraging together.`), which the analyzer itself marks **EXCUSED (condition c unmet)**. The prereg bar definition excludes condition-(c)-unmet runs from the opportunity set, so the true bar is 11 closed of 11 qualifying. The headline denominator is an analyzer counting quirk (`allOps++` fires before the excused branches) — see metric review; it is fixed in the next clone, not re-scored mid-run. Per-seed: 101801 2/2, 101802 5/5, 101803 1/1 (Owen, PAGED), 101804 no-opportunity, 101805 3/3 + 1 excused. THREAD 1/1 (Owen paged, closed same day). TRAVEL 0/0.

**STRANDED (GO in substance — adjudication).** 13 stranded entries on 1 run (101805), worked-on-stranded 0, guard fires 0, new commits after first stranding 0. The 13 entries span 11 distinct days and all 11 had a social sit (the summary prints 11/13 — entries vs days; see metric review). Misses 0; wedge-working-a-live-favor dawns 0 (the new relabel line did not fire on this panel — the instrument is in place, unfired).

**Scholar deaths (3/5, INVESTIGATE — F2).** Maricela d8 (the wild), Jorge d37 (the night), Rosa d30 (the night). All three: last dawn at (4,4), atHaven=true, insideHaven=false — the same home-tile shape as r242 (6 deaths), now with a new cause label: two of the three died to "the night" rather than "the wild" or "a stranger". The position is identical; the killer label varies. **Proposed (not landed):** the succession handover leaves the new scholar standing at the home tile outside the node, exposed to a night/wild death before they can act. The fix is a design call for the goals arm — succession placement or night safety at the home tile — not a measurement-run change. The F2 rule fired at ≥3 for the second straight panel (r242: 6, r243: 3).

**Wave / standing move (watch).** No seed reached wave 4 (0/5; r242 was 3/5). Standing: 0 / 25 / 70 / 20 / 25, max 70 — none near the t4=100 split. Companion kill beats: 1 total (101802 only; r242 was 7). Adjudication: **band noise, not a base effect** — nothing in this run's base delta touches the wave-kill chain (senseexped should help launches and produced none; the counter-label, titan-refusal and maps-pool changes are narration or later content; the social dry fix is dialogue). n=5; a matched-band A/B is still owed before any claim about the wave-4 door. The villages are healthy (5/5 alive at d40, pantries 8k–68k) but not killing upward.

**Senseexped launch watch.** No party-launch signal in any telemetry type-count map — the senseexped GO build (`97e78670d`) is in the base but silent on this panel, same as r241/r242. The launch-party sense has now gone three panels without a launch.

**Counter-label watch.** Zero "counter" mentions (case-insensitive) in any of the 5 convo files, although telemetry records counter_discovered 14–21 per seed. Counter discoveries never reach the establishment-leg conversation prose — they live in codex/telemetry. The watch is NO-OPPORTUNITY on this leg's transcripts; the r246 fix's live behavior is carried by its r147 proof test, not by this panel.

## Census (plain words)

Five villages, 60 people at the start, 47 alive at day 40 (9/10/8/9/11 of 12). Thirteen people are gone: 9 died, 4 were exiled. Of the dead, 3 were the scholar (Maricela on day 8, Rosa on day 30, Jorge on day 37 — all three struck down at the home camp at night or in the wild, right after taking over as scholar). Of the other 6, two died of wounds that wouldn't close (Nina, Alina) and four were killed by monsters (Rafael, and three others whose names the village only half-remembers). Four people were thrown out after moots the player heard about — two pairs, Aroha and Aria on day 11, Oliver and Daniyar on day 10 — each after days of accusation talk around the fire. The villages are fed (pantries 8,100 to 68,300 kcal) and alive, but none of them is strong enough yet to take on the fourth wave: the best village stands at 70 of the 100 standing the table wants, and no village has killed a wave-3 beast for the ledger. The pilot village is the thinnest (8,100 kcal) and lost its scholar on day 8. People are learning — 131 plants identified, 45 spotter-XP earners across the panel, 112 faster identifications — and the village talks: 332 social sittings, 53 of them with someone asking for help, mostly foraging help and healing.

## People check (2 held convos, seed 101803, read in full)

**Aisling (exterminator), day 43 — PASS.** She opens with a real want (someone has to count the days — what's the count today?), asks the scholar to walk with her for a second pair of eyes, and teaches slope-reading for water the way her grandmother did it — knowledge freely given, the Codex notes it. The scholar teaches Sassafras back; she laughs that she's been walking past it for weeks. A recap beat ("Wait — what were we talking about?") lands, then she asks a real question: "Do you believe in anything? Now, I mean. After everything." It ends warmly ("Later." / "Come back anytime."). The NPC wants something, the options engage it, the ending resolves. One soft spot: the stage direction "Different subject, same worry:" reads system-made rather than like a person thinking.

**Dieudonne (firefighter), French-only, nonverbal — PASS.** No shared words at all — just eyes, hands, and patience. He asks where they are and where they sleep; the scholar nods, smiles, points at self, them, the fire — together. He warms ("You're a darling, thanks"), offers his one English word ("Food?"), and the sitting closes with a promise without words (a touch to the chest, a point at the scholar). The translations are explicitly uncertain ("you're fairly sure"), so no fabricated shared history. Minor: the closing stacks three beats in a row ("See you at the fire." / "Good talk. I feel like I know you a little better now." / the nod) — a pile-up, but each in a different register.

## Metric review (for the NEXT run)

1. **END denominator quirk (analyzer, fix in the next clone).** `allOps++` fires at the top of the per-opportunity loop, before the `excluded` / `excusable` / `bearerChanged` branches, so excused runs inflate the printed denominator (11/12 printed, 11/11 true). The verdict is GO per the prereg definition; the analyzer's headline should count only qualifying opportunities.
2. **STRANDED denominator quirk (analyzer, fix in the next clone).** The summary prints social-sit dawns against the entry count (11/13) while the miss/work-favor counts use distinct days (11). Print entries and distinct days separately.
3. **Q5 same-day instrument PROVEN.** It caught 2 same-day open+resolve cases (Oliver, Daniyar) the old instrument would have missed entirely. Keep it.
4. **STRANDED relabel unfired.** No wedge-working-a-live-favor dawns on this panel (0). The instrument is in place; nothing to revise.
5. **F5 floor closes on this band.** Thinnest seed 10.3% clears the 10% rule. The finding already sits with the build arm (F1); no recurrence to report.
6. **Counter-label watch is NO-OPPORTUNITY on this leg's transcripts.** The watch should be re-scoped: judge the r246 label where counter prose actually appears (codex/combat narration), not in sitting transcripts.
7. **Q1 E1 residual is stable.** Two straight panels, 2/2 E1 each, all surfaced later. The named mechanism: the wedge opener never runs on those sits (request/secret threads, dlg:help never pressed, resumedOnce false). A day's delay, not a loss — but the opener-not-running is the thing to fix if anyone wants Q1 to read 0.
8. **F2 is now a two-panel finding** (r242: 6, r243: 3, same home-tile position, new "the night" label). The next run should carry it as a named open item for the goals arm, not re-derive it from scratch.

## Telemetry

`node scripts/telemetry-check.js --baseline …/telemetry-baselines/establishment.json --current '…/evidence/2026-11-19/journey-establishment-r243-seed*.json' --metrics guardrails.deaths,guardrails.popAlive,guardrails.pantryKcal,c3.starvationDeaths` — 3 LOUD lines, same as r242/r241/r240, **known schema mismatch** (the driver never emits `guardrails.*` fields, so the checker reads missing paths as 0): guardrails.deaths 604 → 0, guardrails.popAlive 178 → 0, guardrails.pantryKcal 1210411 → 0. c3.starvationDeaths quiet. **Adjudicated: not a game change; baseline NOT rolled.** (Do not roll a baseline on a mismatch — the baseline is a different instrument's shape than the driver's output.)

## Gate

[PENDING — `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest` running at note time; result to be filled before merge.]

## Reachable / fun / winnable

- **Reachable:** the establishment content is all reachable — sittings, wants, favors, moots, exiles, spotter XP and codex plants all fire on every seed. The wave-4 door is not reached on this band (0/5), but the villages are alive and fed; the door is a strength question, not a reachability one.
- **Fun:** the conversations hold up — the two read in full have real wants, real exchanges (a taught skill both ways; a wordless friendship), and warm endings. The moot/exile machinery now narrates its warnings: no exile on this panel came as a surprise. The stranded run on 101805 (13 dawns, no work done on it, no new commits) is the one flat spot — a village stuck in a state it cannot work its way out of, visible only in the ledger.
- **Winnable:** not yet on this band — standing tops out at 70 and no village kills upward to wave 4. The chain from r242 (3/5 wave 4, standing to 160) to r243 (0/5, standing to 70) is the move to watch; adjudicated as band noise until a matched-band A/B says otherwise.

## Blanks filled / documented

- No game fix landed this run — the leg's question is a measurement re-read, and every binding bar is GO. Two analyzer-instrument fixes are owed to the NEXT clone (END and STRANDED denominators, metric review §1–2) — tooling, not game.
- **Open finding, proposed not landed:** F2 scholar deaths at the home tile (3/5, second panel running) — succession handover leaves the new scholar outside the node at (4,4), exposed to night/wild death. Design call for the goals arm: succession placement or night safety at the home tile.
- **Open watch:** wave-4 0/5 (band-noise adjudication; matched-band A/B owed) and the senseexped launch silence (three panels, no launch).

## Closeout

- Evidence + run note committed [COMMIT — to fill].
- Rebase onto current master if it moved, proof tests re-run [to fill].
- Merge `--ff-only` [to fill], worktree released, branch deleted, reap [to fill].
- Rotation 1→2 with read-back [to fill].
- Lock deleted last after run_id verification [to fill].
