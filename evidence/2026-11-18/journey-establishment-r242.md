# Journey leg ESTABLISHMENT — r242 run note (2026-11-18, Lane A)

## Run

- **Run id:** `lane-a-20261119T044421Z` — scheduled Wed 2026-11-18 22:45 CST, started ~04:44Z 2026-11-19.
- **Leg:** establishment (days 14–40, 42-day horizon, death-aware tail +10d). **Rotation read 1; write 1→2 at closeout** with read-back.
- **Base:** local master `6b47e98b6`. Heartbeat loop, 8-minute cadence, kept alive until closeout.
- **Pre-flight:** main tree CLEAN, disk 44%, `git pull` already up to date.
- **Stale-lock recovery:** previous lock (`lane-a-20261119T012424Z`, created 2026-11-19T01:24:24Z, 3h19m old) had no registered tree in `~/workspace/worktrees/REGISTRY.json`, no live coordinator in `ps`, and the r146 adoption agent had already completed that run (master `1b27bf524`, merged locally, pending ship). Deleted per the 90-minute fallback + heartbeat rule.
- **Prereg:** `evidence/2026-11-18/journey-establishment-r242-prereg.md` (450 lines). Leg question: **Q1 family re-read** — widened LOST trigger + F5 floor tie-breaker + Q5 moot-path instrument + F2 echo re-read. Fresh band **101701–101705** (verified fresh: `git grep -w` over committed evidence + scripts zero hits; filesystem prereg grep zero; `evidence/2026-11-1*/` grep zero; search done 2026-11-19 ~04:50Z). Pilot 101701, panel 101702–101705, competent policy, 42d.
- **Base delta vs r241's panel base `6a97f3a07`** (7 src/js+policy commits): `05921a54d` landing r146 (door-guard follow-up in `scripts/policies/competent.js` + want-bridge pool 6→10 in `src/js/convo-beats.js`, HEED-V fix); `ee4e9d07f` scale r243 (raise-accept echo fix in `src/js/bond-initiation.js`, linkAcceptLine); PARTYSIZE4 lever (`a9a4108fe`, `1032897dc`, `83db8255f` — dawn third-companion pick + quad launches); `a519253b9` foodgate-instr (flags only); `046ae5859` version bump. **No `conversation.js` / `convo-wants.js` change** — r241 F1 (pre-empted seed: talk request pre-empts a seeded follow-up, seed deleted as phantom) is untouched, still proposed-not-landed for the conversation build arm.
- **Analyzer revisions (r242)** in `scripts/analyze-journey-establishment-r242-20261118.js` (driver in `scripts/journey-establishment-r242-20261118.js`), committed as `426cfa59b` (prereg + driver/analyzer clones; index clobber hit and repaired, verified clean after):
  - Q1c widened: ANY favorless ask whose kinded ask never surfaces later is a LOST ask (defect finding, documented + proposed). Old E1-only scope was a gap (r241 metric review: "the class names the mechanism, the surfacing names the harm").
  - Q5 moot-path instrument (r241-owed): per-exile block — path from pronouncement text (moot `"Take what you can carry and go."` per `src/js/betrayal.js:2227` vs freeloader `It's done. "Take what you can carry and go."` per `src/js/game.js` freeloadVote); warning lines require name AND warning-regex (fixed after fork proof caught the d23 Anjali gossip line miscounting for Morris/Pavel); moot/case lines naming the person (`mootLines`); cases naming them accused (`caseLog`, live statuses open/dormant/advisory only — fixed after fork proof showed listed-window overstatement); case-thread-held proxy (wedge sit inside a case's live window + `betrayal:*` picks); 3-way verdict HEARD (advance notice) / PRESENT-at-sentencing (in the room, voted at the sentencing moot, no advance naming) / UNHEARD.
  - Q5 path classifier fix: prefer a line matching `/ is exiled\.|^It's done\./` because the moot says two "take what you can carry" lines on the exile day (sentencing + pronouncement); first-match misread 3/5 as unknown.
  - Driver `mootLines` regex tightened to `/\bmoot\b|the case|a case|case against/i` — bare `/moot/` matches "smooth" (3 false positives on 101703: travel line, Pokeweed line, deflect tip line). Panel corpus used the loose regex; verdicts unaffected (every Q5 read filters by person name or convening-line patterns, neither matches "smooth" lines — verified by grep when writing this note).
  - Q1b F5 floor min/max + tie-breaker rule: thin<7% while fat>15% recurring a third time in four panels sends the floor question to the build arm as a finding; thinnest seed ≥10% closes it.
- **Analyzer fork proof** on the r241 corpus (`/tmp/r242-analyzer-proof`, r241 JSONs+txts renamed to r242 names): all old-bar numbers reproduced exactly — Q1 1/55 C 1/1, stage-0-surfaced 0/1; Q1b 55/353 (15.6%), per-seed 6.6/16.7/22.4/19.7/13.8, F5 RECURS; SPOTTER 43, 5/5; LADDER 5/5; FASTER-ID 5/5 (80/126); END 7/7; VILLAGE 5/5; Q2 0/10 CUT; Q3 distinct 2; Q6 per-seed exact; scholar deaths 2. New lines as expected: LOST = 1 (Fatima 101602 d14, class C); Q5 4 exiles all moot, HEARD 0, PRESENT 0, UNHEARD-instrument-absent 4 (mootLines/caseLog ABSENT on pre-r242 corpus — not silence evidence; never quote as findings). Re-verified identical old-bar lines after the later analyzer fixes (logs `/tmp/r242-analyzer-proof.log`, `-proof2.log`, `-proof3.log`).

## Pre-registered bars — verdicts

| Bar | Result | Verdict |
|---|---|---|
| END (ending beats on engine-ended sittings) | 11/11, THREAD 2/2, TRAVEL 0/0 | **GO** (best yet; r241 was 7/7) |
| Q1 favorless asks | 2/70 (2.9%), E1 2/2, stage-0-surfaced 2/2, **LOST 0** | **GO** |
| Q1b want-raise rate | 70/347 (20.2%), zero-raise 0/5 | **GO**; F5 floor shape **RECURS** → build arm (F1) |
| Q2 cut conversations | 0/10, 5 engine-ended WITH closing beats | **GO** |
| Q3 recap paraphrase | distinct 1 of 10 sittings (raw 2) | report-only |
| Q5 exile warning | 5 exiles, all moot; HEARD 3, PRESENT 2, UNHEARD 0 | **answered** |
| Q6 policy foraging | no F4 shape (min bumpCalls 13); zero-commit shape did NOT recur (min 1 commit) | report-only |
| SPOTTER | 36 total, 5/5 | **GO** |
| LADDER (≥1 villager at 5+ spotter on ≥4/5 seeds) | 3/5 (per-seed 5/3/17/1/10) | pace-read **MISS** (report-only under SPOTTER GO) |
| FASTER-ID | 5/5, 118 benefit plays in 189 bump calls | **GO** |
| CODEX | 152 plants | report-only |
| STRANDED | 20 dawns, 2 runs, worked 0, guard 0, social sits 18/20 | **GO** in substance (see adjudication) |
| TRUST / JAM / VILLAGE / ROSTER | 0 drops / 0 / 5/5 / 0 unaccounted | **GO** |
| Scholar deaths | **6/5** | **INVESTIGATE** (≥3 rule; F2) |

## Pilot (seed 101701) — gate PASS

Exit 0, endDay 43, over=false, aliveEnd 9, wave 4, standing 160, pantry 31,554, wedgeSits 69, committed 5, bumpCalls 66, codexPlants 34. Two people-check sittings (Consuelo, Innocent), transcript 69 lines with FULL-TRANSCRIPT, sittingCloses beats 4 and 2, bumpLog 66 with pid, standingEnd 160, scholarDawns 42, teleTypeCounts 55 keys, mootLines 17, caseLog 42, exileLines 0, "pull weight" present in driver source (grep = 3). The 3 verbal sits with no wantId pick are all Innocent's nonverbal-by-picks sits (`nv:*` picks, `openThread` undefined) — the gate clause's `openThread === 'nonverbal'` marker is wrong; **the picks are the marker** (see metric review). Innocent stands accused (case_2, d10) and the pilot's people-check closing line is "The conversation ends where language couldn't reach."

## Analyzer verdicts — detail

**Q1 (favorless asks, 2/70 = 2.9%, GO).** Both class E1 — the seeded opener never ran, and both asks surfaced later (a day's delay, not a loss): Kate d31 on 101701 (openThread secret, need forage_help/u2, stage max 1) and Ivan d10 on 101703 (openThread request, case picks 6/7 — the case thread pre-empted the opener again, stage max 0). The widened LOST trigger's first run finds **LOST 0**; the class-C shape (ask never surfaces) did not recur. Kinds panel: forage_help 50, food_share 8, heal_help 7, (no-kind) 2, stay_close 2, sick_help 1; no water_haul. Contentless re-seeds after favorless sits: 0/2.

**Q1b (want-raise, 70/347 = 20.2%, GO).** Per-seed: 101701 19/62, 101702 25/72, 101703 12/70, 101704 9/66, 101705 5/77. **F5 floor shape RECURS — thinnest 6.5% (101705: 5/77) vs fattest 34.7% (101702: 25/72).** Third time in four panels (r233, r241, r242; r240 closed) → per the prereg rule the floor question goes to the build arm as a finding (F1). Zero-raise seeds: 0/5.

**Q2 (cut conversations, 0/10 CUT, GO).** 5 engine-ended sittings, all WITH closing beats.

**Q3 (recap paraphrase, report-only).** Distinct 1 of 10 sittings (raw 2); parting-plain-see 1. No other canned-line hits (pod-dream 0, recap-stitch 0, slope-reading 0, walked-in 0, take-it 0, stew-bowl 0). The one distinct paraphrase is the same family as r241's ("that's still where we are").

**Q5 (exile warning, answered).** **5 exiles, all moot path; HEARD (advance notice) 3, PRESENT-at-sentencing 2, UNHEARD 0.** No freeloader exile — the d7-warning question stays open. 101703: Priya/Yuki/Wanjiru exiled d25; Yuki HEARD (d9 "Yuki stands accused over what happened to Zoltan"); Priya/Wanjiru PRESENT (d25 moot convening lines — "You call a moot… The moot turns to you. Your vote matters here" — the player was in the room and voted). case_7 (accused all three, resolution exile) was never seen open — same-day open+resolve, below the per-dawn snapshot resolution (instrument blind spot, see metric review). case_2/case_4 open d7–d9, acquitted. 101705: Greta/Brian exiled d18; Greta HEARD (4 moot/case lines d13–17, incl. "Antonio stands accused over what happened to Greta" and "Greta stands accused over what happened to Antonio"); Brian HEARD via proxy (d17 sits with Axel/Logan, case_8 open). case_8 open d17–d17, case_10 open d18–d20. **The exile is never a surprise on this panel** — every exile had advance notice or the player in the room. The PRESENT verdict is new this run: being in the room and voting is a real form of being present at the decision, distinct from advance notice.

**Q6 (policy foraging, report-only).** bumpCalls/wedgeSits/joint-forage-commits per seed: 101701 66/69/5, 101702 36/97/3, 101703 29/73/3, 101704 45/73/3, 101705 13/78/1. No F4 shape (bumpCalls ≤ 2 with wedgeSits ≥ 50 — min bumpCalls is 13). The r241 101602 zero-commit shape did NOT recur (min commits 1).

**SPOTTER 36 (5/5 GO). LADDER 3/5 — pace-read MISS** (bar needs 4; report-only under SPOTTER GO). Per-seed spotter: 101701 5, 101702 3, 101703 17, 101704 1, 101705 10. The bench is one person per village: Nathan holds all 17 on 101703; Ruby holds all 3 on 101702; Paraone holds the only 1 on 101704; everyone else sits at 0. The grant mechanism works (r139 proof 35/35 green) — the miss is a foraging-volume shape: only one villager forages regularly per village, and on 2/5 seeds that person never reaches 5 XP in 42 days. Foraging-volume context: bumpCalls 36–45 on the thin seeds (the scholar's own bumping is healthy) but villager spotter 1–3. **FASTER-ID 5/5** (118 benefit plays in 189 bump calls). **CODEX 152 plants** (per-seed 34/38/24/26/30).

**STRANDED (20 dawns, 2 runs, GO in substance).** worked 0, guard 0, social sits 18/20. The 2 "misses" (101702 d35/d36) are adjudicated, not failures: the wedge was NOT idle those dawns — it worked Hassan's live favor (mode='work', 8 favor-action presses d35, 6 d36). The stranded run (DeShawn's, bearer Maricela who died d23) was never touched. The analyzer's "BAR MISS" label overstates; the bar's actual requirement (worked=0, guard=0) held. The stranded chain itself is worth one line: Maricela died d23 as scholar, her run stranded d24–36 under DeShawn; DeShawn then died d36 as scholar, and Hassan's run (bearer DeShawn) stranded d37–43. Stranded runs follow scholar deaths — the mechanism works as designed (0 work on stranded runs); they pile up when bearers die.

**END 11/11 GO (best yet; r241 was 7/7). THREAD 2/2** — first exercise of the paged/Yara branch (Linda d5 PAGED + Mara d13 PAGED on 101701; Wei d9 PAGED on 101703). All 11 END ops closed the same day they opened. **TRAVEL 0/0 NO-OPPORTUNITY. TRUST 0 drops. JAM 0. VILLAGE 5/5. ROSTER 0 unaccounted.**

## FINDING F1 — the want-raise floor goes to the build arm

**The floor question.** The want-raise rate — how often a villager actually asks for something in a sitting — is wildly uneven between villages. On this panel the thinnest village raised a want in only 6.5% of its sittings (5 of 77 on 101705) while the fattest raised one in 34.7% (25 of 72 on 101702). That is the third time in four panels the thin seed sat under 7% while the fat seed sat over 15% (r233, r241, r242; r240 closed). The prereg's tie-breaker rule fires: **the floor question goes to the build arm as a finding.**

What it means in plain words: in the thinnest village, villagers almost never ask the player for anything — the player is spoken to, not spoken with. Whether that is a floor set too low (the slowest village should still ask sometimes) or natural variance between villages is a build-arm call, not a panel call. The rate itself is healthy on the panel as a whole (70/347 = 20.2%, GO; zero villages with no raises at all), so this is a variance question, not a broken-mechanism question. **Documented + proposed; no code change this run.**

## FINDING F2 — scholar deaths 6/5: investigate

**Six scholars died across the five villages — three times the count on each of the last four panels (2/5 on r233, r240, r241 and the panel before).** The ≥3 rule fires: investigate.

Causes and places (last dawn in parentheses):
- 101701: Olivia d35, "the wild" — woke at the home tile (4,4), at Haven, outside the Haven node.
- 101702: Maricela d23, "a stranger" — woke at (0,0), the map edge, away from Haven. DeShawn d36, "a stranger" — woke at (5,0), the map edge, away from Haven.
- 101704: Tyler d39, "the wild" — woke at (4,4), at Haven, outside the node. Nia d40, "the wild" — woke at (4,4), inside Haven. Felix d40, "the wild" — woke at (4,4), inside Haven.
- 101703, 101705: no scholar deaths.

The sharpest shape is the **101704 cascade: three scholars in two days** (Tyler d39, then Nia and Felix both d40), all "the wild", all waking on the home tile. A successor inherits the previous scholar's spot and dies the same way the next day — the succession is handing each new scholar a doomed position. The other shape is the **stranger kills**: two scholars died to "a stranger" deep in the wild at map-edge tiles (0,0) and (5,0) — the alien-player stranger fight, not a monster. That cause shape is new on establishment panels (r241's two scholar deaths were both "the wild").

**Adjudication.** One panel cannot separate a base effect from band noise. Candidates in this run's base delta are the r146 door-guard fight movement (it changes how fights play out for the scholar) and PARTYSIZE4 (dawn third-companion pick + quad launches — should help, not hurt, but it changes who is in the field). The wildavoid / flee-repair A/B is the lane that can discriminate, since it exists to test exactly this — whether the scholar survives the wild better. **Referred there; no panel finding alone.** What is established: the scholar dies in the wild in 3 of 5 villages, and when the scholar dies the village keeps going (9 of 12 alive at the end on every seed) — the village survives its scholars; the succession is the thing that stumbles.

## Observation O1 — two villages end with standing 0 (not a defect)

101702 and 101705 both end at standing 0 (wave 3), while 101701/101703/101704 end at 160/100/135 (wave 4). Probed with a temp driver print (reproduced the panel exactly — determinism confirmed; probe deleted): standing = war points (wave-3/4/5 ledger kills) + diplomacy (seasoned regional links) + plenty (quality feasts). Zero means **no wave-3+ ledger kills, no seasoned links, no quality feasts by day 42** — the villages never did the things standing measures. The standing split at t4=100 holds (100/135/160 → wave 4; 0/0 → wave 3). Census observation, not a defect: two villages spent 42 days surviving without ever killing a wave-3+ beast, seasoning a link, or holding a quality feast.

## Observation O2 — the spotter bench is one person per village

See LADDER above. Nathan holds all 17 spotter points on 101703; Ruby all 3 on 101702; Paraone the only 1 on 101704. The village's foraging knowledge lives in one head. If that person dies, the bench empties.

## Q4 — village census (plain words)

**Panel totals:** 5 villages, 60 people at start, 42 alive at the end (9/9/8/9/9 of 12). Roster losses: 18 — 13 deaths (6 scholars + 7 villagers) + 5 exiled. Pantries: 31,554 / 30,927 / 57,162 / 60,049 / 15,613 kcal (101705 thinnest). Standing: 160 / 0 / 100 / 135 / 0. Waves reached: 4 / 3 / 4 / 4 / 3. Companion kill beats (the kill signal available): 1 / 0 / 4 / 2 / 0 = 7. **No party-launch signal in any telemetry type-count map** — PARTYSIZE4 produced no launch type on this panel (same as r241); the quad-launch lever is in the base but silent here.

- **101701** (wave 4, standing 160, pantry 31,554): 9 of 12 alive. Olivia died in the wild d35 as scholar; Dale was ambushed d15; one woman in her sixties was killed by a monster d35. The village held two moots (Linda d5, Mara d13 — both paged, both closed the same day) and planted 34 codex entries. The scholar's bumping worked (66 calls, 5 joint forage commits).
- **101702** (wave 3, standing 0, pantry 30,927): 9 of 12 alive. Two scholars died to a stranger in the deep wild (Maricela d23 at the map edge, DeShawn d36); Scarlett died of a wound d30. No wave-3+ kills, no seasoned links, no quality feasts — standing never moved. The village's foraging knowledge is Ruby's alone (3 points).
- **101703** (wave 4, standing 100, pantry 57,162): 8 of 12 alive — the hardest-hit village. Three villagers were killed (Anastasia ambushed d6, Ezra d11, Irving d16) and three were exiled by moot d25 (Priya, Yuki, Wanjiru). Nathan carries the whole spotter bench (17 points); the village still reached wave 4 and standing 100 on the strength of its ledger kills.
- **101704** (wave 4, standing 135, pantry 60,049): 9 of 12 alive, but it lost no villagers at all — it lost its scholar three times in two days (Tyler d39, Nia d40, Felix d40, all in the wild). The cascade is the story of this village: the succession kept handing the next scholar the same doomed spot. Paraone holds the only spotter point in the village.
- **101705** (wave 3, standing 0, pantry 15,613): 9 of 12 alive, thinnest pantry. Antonio was ambushed d17; Greta and Brian were exiled by moot d18 (both had advance warning — see Q5). The want-raise rate was the panel's thinnest (5 of 77 sittings, 6.5%).

**End-day note:** endDay reads 42–44 across seeds (101703: 42, 101705: 44), but daily.length is 42 and scholarDawns is 42 on every seed — all five villages played the full 42 days; the variance is a day-counter quirk at snapshot time, not a run-length difference.

## People check — PASS

Read the full convo transcript for one panel seed (101703, the exile seed) in full — Ivan and Akorfa.

**Ivan (ER nurse).** Opens bursting with news ("Have you heard? No? Good, I get to tell you first.") — a person with something to share. Pressed twice to take his time, he goes from "Something in them stays shut, for now" to "Something eases in their shoulders. They're really talking to you now" — a real arc from shut to open. The gossip lands ("Leah? A zookeeper, back before. Solid person. Don't say I told you.") and a genuinely human beat follows: "People are smiling today. I wanted someone to notice it with me." The recap names the thread ("that news — that's still where we are"), and the joke lands ("Snorts. 'Okay, that was good.'") before the engine closes with "This was good." PASS.

**Akorfa (blacksmith).** Opens on taken kin ("About what happened to my taken kin — Have you heard anything? About the taken. The pods. Anything at all.") — a person with a real wound (Bruno, taken). "Still nothing on Bruno. I told you about the pods — I keep thinking about them. The humming. Some nights I'm sure it's a dream. Other nights I'm sure it's not." The commit ("I'll ask it. I promise.") gets a real answer ("You'd do that? Ask it? ...Thank you. Really. Even asking is more than the silence."). The silence pick lands ("A comfortable quiet settles. They smile a little, and let it be."), and the closing beats stack honestly ("If it answers — you'll tell me? Whatever it says. I can take it." / "Good — that taken person, settled. Feels better said out loud." / "This was good."). PASS — the better of the two sittings.

**Watches.** F2 echo: no acceptance echo in either sitting (no link/raise accept was offered in these two sittings, so the watch is only weakly exercised here — the r243 fix holds in this read, 0 sightings). The r241 dry beat ("The moment passes without landing. Not yet.") does NOT appear in either sitting. One canned beat recurs twice in one seed: "Something eases in their shoulders. They're really talking to you now." is served verbatim in both sittings after the second goon — the goon-progression beat, fine in context, noticeable when read back-to-back. The soft-deflection beats ("They let the words sit there, unanswered", "Something in them stays shut, for now") read as a person thinking, not a loop.

## Verdicts

- **Reachable: YES.** Establishment content is reachable — all five villages reached wave 3+, routines ran, moots convened and exiled, codex planted 152 times, the paged/Yara END branch fired for the first time. Nothing on this leg is behind a door the player cannot open.
- **Fun: MIXED-PASS.** The conversations pass the people test (real wants, real arcs, real closings), and the moots are real social events the player votes in. What drags is not the content but the succession: on 3 of 5 villages the scholar dies in the wild, and on one village three scholars die in two days — the player keeps being handed a doomed spot. That is a winnability problem wearing a fun costume.
- **Winnable: NOT YET (leg-level).** This leg ends at day 42 of a ~150-day arc, so no full seat is expected here — but the chain feeding the win still shows the same wall: no party launch on any seed, two villages at standing 0, six scholar deaths. The establishment leg delivers a living village; it does not yet deliver the veteran/standing/party chain the win needs.

## Metric review (§14)

- **Pilot-gate marker correction (proposed for r243).** The gate clause's `openThread === 'nonverbal'` marker is wrong: Innocent's 3 nonverbal sits have `openThread` undefined and are marked by `nv:*` picks. **The picks are the marker.** Revise the gate clause to read the picks, not openThread.
- **Q1c widened trigger (worked).** First run with the widened LOST trigger: 0 LOST, class-C shape did not recur. Keep the trigger; the LOST class stays defined for when an ask genuinely never surfaces.
- **F5 rule applied.** Third recurrence in four panels → the floor question goes to the build arm as a finding (F1 above). The rule did its job; no further change to the metric this run.
- **Q5 instrument (revision + blind spot).** The 3-way verdict (HEARD / PRESENT / UNHEARD) worked — every exile got a verdict, and the PRESENT distinction (in the room, voted, no advance naming) proved its worth on Priya/Wanjiru. Blind spot for r243: **same-day open+resolve cases are invisible** — case_7 (accused Priya/Yuki/Wanjiru, resolution exile) was never seen open because it opened and resolved between dawn snapshots. The instrument should record case open+resolve at the moot level, not only per-dawn.
- **"smooth" regex fix.** Driver `mootLines` tightened to `/\bmoot\b/`; the panel corpus used the loose regex (3 false positives on 101703: a travel line, a Pokeweed line, a deflect tip line). Verdicts unaffected — every Q5 read filters by person name or convening-line patterns, and none of the "smooth" lines match either. Verified by grep while writing this note.
- **STRANDED "BAR MISS" label overstates (propose relabel for r243).** On 101702 d35/d36 the wedge worked a live favor (mode='work' presses), not idly — the bar's actual requirement (worked=0, guard=0) held. The label should read "no social sit — wedge working a live favor" when mode='work' sits exist that day.
- **endDay variance (42–44)** is a snapshot counter quirk; daily.length=42 and scholarDawns=42 on all seeds. No metric effect.
- **Carried items.** Q6 zero-commit shape watch (r241 101602: 14 asks, 0 commits) — did NOT recur (min 1 commit). F2 echo watch — 0 sightings in the people-check read, weakly exercised (no accept offered). r240 walkHome axis-step oscillation residual — watch item, build arm (no new evidence this run).

## Telemetry check

`node scripts/telemetry-check.js --baseline …/telemetry-baselines/establishment.json --current '…/evidence/2026-11-18/journey-establishment-r242-seed*.json' --metrics guardrails.deaths,guardrails.popAlive,guardrails.pantryKcal,c3.starvationDeaths` — 3 LOUD lines, same as r241/r240, **known schema mismatch** (the driver never emits `guardrails.*` fields, so the checker reads missing paths as 0): guardrails.deaths 604 → 0, guardrails.popAlive 178 → 0, guardrails.pantryKcal 1210411 → 0. c3.starvationDeaths quiet. **Adjudicated: not a game change; baseline NOT rolled.** (Do not roll a baseline on a mismatch — the baseline is a different instrument's shape than the driver's output.)

## Gate check

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest` — **339 passed, 5 failed in 603s** (r241: 333/11 in 1349s). The 5 failures are a strict subset of r241's 11 standing failures, **0 attributable** — this run changed no src/js (tooling + evidence only):

| Failure | Verdict |
|---|---|
| `test-living-garden-deed-attainment.js` (120s timeout) | standing deed-attainment timeout class (r241 same) |
| `test-measurement-proof-update.js` ("Proof source inputs are not current") | standing stale balance-proof manifest (r241/r240 same) |
| `test-measurement-workflow.js` (neutrality proof coverage) | same stale-manifest family (r241 same) |
| `test-phone-frame-proof.js` (phone receipt stale/missing: index.html) | standing phone-frame receipt staleness (r241/r240 same) |
| `test-one-person-army-deed-attainment.js` (120s timeout) | standing deed-attainment timeout class (r241 same) |

Cleared vs r241 (6): cache-flags (load artifact — passed in-gate this time), occupation-panels (passed at 82s), trust-observer, ladder-bundle control (CLEARED on master per `6b47e98b6`), synergy-stall, capable-bot.

## Carried proof tests (re-run on the new base, all green)

r240 walkHome 27/27 · r231 settled-help 19/19 · r230 stage0-help 13/13 · r225 stage0-cant 18/18 · r214 mood-goodbye 10/10 · r139 spotter 35/35 · r221 want-raise 7/7 · r137 clearhome 37/37 · r146 want-bridge ALL GREEN · r243 link-accept 61/61. No new proof test this run (no defect found, no code change).

## Closeout

- Run note + pilot/panel/analyzer/gate logs committed via safe-commit in the worktree (analyzer + driver fixes included).
- Merged locally, pending ship — do NOT bump, push, or verify live (ship loop owns those).
- Rotation 1→2 written with read-back; lock deleted after verifying run_id.
- Evidence: `evidence/2026-11-18/journey-establishment-r242-prereg.md`, `journey-establishment-r242.md` (this note), driver `scripts/journey-establishment-r242-20261118.js`, analyzer `scripts/analyze-journey-establishment-r242-20261118.js`, logs `journey-establishment-r242-{pilot,panel-10170*,analyzer,gate}.log/.err`; panel corpus in the goal hidden_files evidence dir (`journey-establishment-r242-seed10170*.json`, `journey-establishment-r242-convo-seed10170*.txt`).
- Carried to the build arm: **F1 (F5 want-raise floor — third recurrence)**; **F2 scholar-death investigation referred to the wildavoid/flee-repair A/B**; r241 F1 (pre-empted seed in conversation.js/convo-wants.js) still proposed-not-landed.
