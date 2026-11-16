# Journey — Crisis (Lane B, leg 6) — r223

**Run:** oversight-playtest-loop-2, leg 6 crisis, r223. Scheduled 01:00 CST Mon 2026-11-16, started ~07:00Z. Base master `7d2de26f4` (sim-companionpool-b DIAG GO). Lock `playtest-loop-2.lock`, run_id `loop2-20261116T065700Z`. Worktree `journey2-crisis`, branch `journey2-crisis`, registered 07:08Z; hbloop pid 2651 every 7 min.

**Prereg:** `evidence/2026-11-16/journey-crisis-r223-prereg.md` (frozen before any scored seed). Leg question: do r216's verdicts hold on the new base — and does the C3c resume-opener watch finally get a qualifying case now that r137 changed resume openers? Seed band **14471–14475**, verified fresh per the seed-band skill (zero hits in all dated preregs; one 1447x hit, `14479` in the 2026-10-27 spanpromo prereg, is a per-action-table data value, not a seed). Panel binding: policy oracleV2, 150d death-aware +10d tail, 5 seeds sequential; pilot 14471–14473 first, then expanded. ORIGINS keyed all five (Seattle/Boston/Austin/Chicago/Phoenix). RUINROAD env OFF (arm parked; cumulative 0/301 proven constraint; supply owned by the medicine build brief — Steve ruled 2026-11-14 the medicine trio needs more complexity, richer layered design owed).

**Base movement since r216 (abc52dce1 → 7d2de26f4), src diff 4 files, +93/-8:** r137 conversation.js +49/-1 (want-thread resume re-poses the deflected question — directly on the C3c watch site); r218 succession convo-dialogue.js +13/-3 (commit-refusal lines never become thread memory); r219 scale conversation.js +15 (goon must not carry an ask tag onto substituted text); r216 itself (funeral-mend partial-payment honest line + analyzer seed-scoped dedupe). Diagnostics net-zero src; `git diff abc52dce1..HEAD -- src/js/game.js src/js/villager-brain.js src/js/win-plan.js` empty. Canon (docs/CANON.md + docs/DISEASES.md) re-read 2026-11-16, unchanged since r208.

**Pre-flight:** main tree clean (0 dirty), disk 42%. `worktree-reap.sh` exit 0, 12/16 active, removed nothing; LOUD lines all other owners' dirty trees — never auto-remove, not mine to touch. Write flap watcher ALL-OK on boot.

**Instruments:** driver `scripts/journey-crisis-r223-delayed-20261116.js` and analyzer `scripts/analyze-crisis-r223-delayed-20261116.js` cloned from r216 by sed renames only (42 driver diff lines, all rename-class; syntax OK; no leftover old seeds). Analyzer validated on r216's corpus before the panel: 0 non-seed diff lines vs published r216 analysis. Smoke SEED=14471 DAYS=5 exit 0, instrumentErrors []. Driver quirk: driver prints the per-seed JSON to stdout only (never writes the delayed-seed JSON); pilot logs were copied to the delayed-seed JSON names, expansion redirected directly. All 5 JSONs present and parse.

## Panel (5/5 seeds, complete)

| Seed | End | Raids | Gorge | Sorties | Convos | Fab | Errors | Alive | Pantry |
|---|---|---|---|---|---|---|---|---|---|
| 14471 | 131d game-over | 12 | 29 | 7 | 8 | 0 | 0 | 1 | 0 |
| 14472 | 141d game-over | 7 | 17 | 8 | 8 | 0 | 0 | 0 | 0 |
| 14473 | 150d horizon | 14 | 137 | 12 | 8 | 0 | 0 | 3 | 858 |
| 14474 | 118d game-over | 8 | 39 | 8 | 8 | 0 | 0 | 0 | 0 |
| 14475 | 150d horizon | 12 | 118 | 10 | 8 | 0 | 0 | 4 | 1200 |

**Totals:** 3/5 game-over, 2 horizon; median 141d (game-over median 131d); raids 53; gorge nights 340 (r216: 273; r208: 100); gorge kcal 396,823; sorties 45 attempts (35 ok, 10 refused, 9 cleared, deltaBad []); sortieFights 63; convos 40; fabricHits 0.

## Village assessment (plain words)

Three villages broke before the horizon and two held to day 150 — the crisis leg still bends villages hard, and the breaking point is the same as ever: the wild, not hunger. Raids hit every village (53 total), monsters camped at the treeline and ate the stores on 340 nights, and the villages that fell did so fighting, with food still in the pantry at the end (two of the three game-overs ended with pantry 0 only because the village was gone, not because it starved first). The two that held did it the same way the survivors always do: enough living fighters to meet the raids, a pantry that stayed ahead of the gorge, and people who kept showing up for each other — funerals, favors kept, debts thanked. Nobody starved to death as the named cause (famine 0); disease took 2, wounds 3, thirst 3, and the wild took the rest. Seven people died in the arena across four villages, same count as r216.

The people still read as people. Forty conversations, no fabricated history, no filler loops. Priya mourned Andre by taking up his burnt piece at the fire. Ernestine confessed she was a butcher, not a sailor, and then refused to confess it twice for dramatic effect. Tamika, grieving Dylan, asked to stick together properly — and meant it. Hamoud, who speaks only Arabic, thinned gracefully with gestures and a gift of a tool. Jamie's village counted a guilty vote on a murder that turned out to be an ambush, and Jamie shared stockpiled wood and fiber anyway. The funerals tell the truth about what the feast can and can't buy back: "+4 — the feast could not buy back the full -8" is said aloud, with "(Trust -8 stands.)", and full mends say so too. Nothing in this panel was a lie.

## Verdicts (vs prereg)

- **D1 DRY CENSUS: GO.** 40 transcripts, 0 dry lines, deflect_q 0.
- **Q6: descriptive.** Id-matched 0 — **9th consecutive zero panel**; name-matched 117, rising with gorge nights. Metric stays retired.
- **C1: GO.** Every game-over named a cause, not a siege-mechanic failure; 0 softlock seeds.
- **C2: GO.** Raids all seeds; fought resolutions present; D1 45/45 delayed ≥3; deltaBad []; D3 drift unknown [].
- **C2b: GO.** All 5 seeds judged on gorge+sorties.
- **C3: GO.** All 40 transcripts read in full; fabricHits 0; no voiceLine prefix stacking ≥3, no double confession, no naming-stance wobble sighting.
- **C3b: GO.** 3 "settled" lines, all honest (d21 Priya "that one's settled... Good — that debt, settled."; d38 Priya "what's been happening, settled." on a talked-through lately thread; d16 Jayden "Nobody's settled it." — honest unsettled).
- **C3c: UNMEASURED again.** 10 resume openers naming "We never finished/did finish" across 4 checked seeds; only one names a favor — "We never finished — that wound care." (d20 Priya, 14471) — and it named the CURRENT favor (planted in that same sitting; fulfilled by d21). No favor change within 14 days followed by a resume opener naming the stale favor. Third panel without a qualifying case; the r137 re-pose path produced no wrong-favor re-pose. Watch stays open.
- **C3d: no 2nd sighting.** "Nothing important" recaps 0. Watch stays open.
- **WRAP-CHECK: GO.** 40/40 marked, 0 unmarked (39 engine-ended, 1 refused).
- **C7b: reported.** Famine 0, disease 2, wound 3, thirst 3; wild dominates, sayWild 8–9/seed. Buried: Ellis Okafor, Andrea Ortiz, Andre Nguyen (14471); Talia Tanaka, Rafael Ibrahim (14472); Maricela Porter (14473); Linda, Mia (14474); Dylan Beck (14475).
- **A1–A6: VACUOUS.** 0 kills, 0 silent, 0 cooldown violations — 9th consecutive zero panel.
- **Fight-1 (R181):** okSorties 35, brokeAfterFight1 12, cleared 23; multiMonsterCleared 17/26 (r216: 10/17; r208: 5/9). Cleared fight-1 vTaken max 66 — Q4 trigger (≥70) not hit. Broke-after-fight-1 openers all vFlee (12/12); cleared openers mFlee 9 / vKill 14.
- **Missed-window (R154):** corrected 9 (valve-expiry 8, drawn-off 1) — descriptive, carried. R154 drift duplicates 0; driverSkipped=1 (seed 14474 only, driver-side per-run same-seed duplicate — legitimate, unlike r216's analyzer-side cross-seed F2).
- **R186 encounter-eligible days 0** on all seeds (channel never opens under home-based play, carried). **S1–S5 NOT RUN** (cumulative stays 0/301 for the arm).

**Refused sorties (BENCH):** 10 refused; shape gateOneShort 4 / supplyEmpty 6 / availabilityDrain 0; nodeAway exclusions 18 across refusals; alive-bench refusals 3, all gateOneShort, aliveNodeAwayExclusions 15 — all three on seed 14474 d50/d50/d52 with 5 nodeAway each (5 villagers out on node-travel at once). **NodeAway watch REPEATS** (r216: 39 exclusions, 11 gate-one-short): per prereg, the muster-vs-travel tension is now a **design question, not an instrument artifact** — record, don't fix in-run without a design decision.

**Supply:** ruinSearches 4 on seed 14474 only (forageByTile ruin:4, 4 scavenge items, 0 med items, 0 acquisitions) — **first non-zero ruin-search count on a crisis panel in this series** (r208/r216: 0); still 0 medicine acquired (S3 = 0, trigger not hit). Pharmacy 0 days on all seeds. Medic-duty: ability cures 15/19/19/6/0 = 59, medicine cures 0. **Seed 14475 had NO medic-duty holder at all** (spans [], blocked 0, cures 0) — the holder-less shape from the r196 re-analysis, second instance after r216's 14464; 14475 still reached horizon with 4 alive.

**Arena watch:** 7 arena deaths on 4/5 seeds (14471 Naran d63; 14472 Cole d41, Brian d129; 14474 Grace d78; 14475 Andre d31, Stan d130, Ava d143) — identical to r216 (7 on 4/5). No Reunion-arena fight record in driver data; wild Reunion balance is Steve's standing holistic-Reunion call, not this leg's.

**CASCADE watch:** 0 scholar deaths to a lingerer. Player deaths: 14471 Ellis Okafor d9 dehydration; 14475 Dylan Beck d10 the wild — mantle passed both times, villages carried on (14471 to d131, 14475 to horizon d150).

**FUNERAL-MEND CONFIRM: GO — r216's F1 fix holds in the wild.** 30 funeral-feast lines, all voiced. Partial mends state the true gain honestly: 14471 d117 "+4 — the feast could not buy back the full -8"; 14475 d53 "+7", d75 "+14" (two links × +7), d130 "+9", d143 "+7". Zero over-claim lines. Shortfalls said aloud with "(Trust -8 stands.)" (5 lines). Full mends "(Trust mended — the -8 bought back with grain.)" (19 lines). F1 favor no-longer entries empty on all seeds.

**Recap paraphrase (A2 watch, from r193 floor via r210):** formulations vary widely (20+ distinct). Most common: "Still on that question." ×4; "that's still where we are" ×3 this panel (Rafael d27, Delali d71, Jamie d28). r210 had the same paraphrase at 2 in a row across panels and called it still THIN-PROBE by the r193 A2 floor. Counts reported here as a watch tick, not a finding. Two one-off odd suffixes (single sightings, watch only): "Still on the worst thing you've done. — or so they tell me." (d42 Ernestine, 14473) and "Still on that personal stuff. Extremely normal, all of it." (d64 Ernestine, 14473).

## People check (all 40 transcripts read in full)

- **14471 (8):** Priya wound-care want + mourning Andre ("Andre always took the burnt piece. Said someone had to. I take it now."); d21 favor thanked, recap "still on that debt" ×3 while favor thanked but NPC herself says "that one's settled. I just like saying it out loud" — coherent; close "Good — that debt, settled." honest. d28 party named "The Company" (Priya suggests "The Firetenders"). d37 Priya becomes Scout ("Trust is slow out here. It's the one thing the System can't grant us."). d38 fears ("Running out of winter before the cold does."), "They took Kira — The Pit, on the screens." d47 Kira funny-story question. d48 resume opener "what scares them — 10 days back". d66 Ivy water-haul favor (promised), teaches slope-reading, mourning Naran ("I dreamed Naran was still here. Woke up angry at the dream."), declines party ("I don't do parties....It's not you. It's the party.").
- **14472 (8):** d26 Cole secret (photo of someone left behind), confront holds line ("I told you the truth... We went over this"), first-memory question. d27 Rafael dreams of before, "They took Olivia — Lie Detector, on the screens." Party named "THE ENSEMBLE" (Rafael suggests "The Unlost"). Recap paraphrase "what you dream about — that's still where we are." d41 Lucy **refused/ended** — cause verified: Lucy herself died d40 (monster); honest refusal, same class as r216's Carl case. d42 Olivia burial comfort, "Are you going to stay? With us. For real." d65 Onni starving food_share favor (promised), mourning Olivia ("Olivia owed me a favor. I keep thinking about collecting. Stupid."). d83 Lena "Did you leave someone behind?" d84 Petra staying/regrets. d98 Nikos perfect-Saturday question, declines party.
- **14473 (8):** d16 Jayden betrayal investigation (ambush of Simone, case_4) — site, witnesses, bribery, moot, let-lie; "Nobody's settled it" honest unsettled line. d32 Ernestine regrets ("I regret the ordinary days I rushed through. All those Austin, Texas mornings..."). d33 follow-up on the regret across sittings. d42 Ernestine guilt question; recap "Still on the worst thing you've done. — or so they tell me." (odd paraphrase suffix, single sighting, watch only); confront confession "I wasn't a Sailor. I was a Butcher." d51 secret (cries quietly at night); double-confront refused — "I confessed that already. I'm not confessing it twice for dramatic effect." (double-confession guard holds). d64 "are you carrying it any lighter?" follow-up; recap "Still on that personal stuff. Extremely normal, all of it." (wry variant, watch only). d71 Delali "Watch the quiet ones..."; recap "your read on people here — that's still where we are."; mourning Ava; party named "The Hearth"; "I'm picking up Ava's share of the work." d78 "Ava is gone and the world just... continues."; "You're family now. Chosen family."
- **14474 (8):** d9 Jamie betrayal (ambush of Moumita, case_2). d20 same death escalated to "murder of Moumita" (case_12), moot + GUILTY vote counted; Jamie shares stockpiled wood/fiber (+4/+4). d21 resume opener quotes d20; "Have you ever hurt someone?" d27 "The Blood Tithe. They just... took Nino."; party named "The Company" (Jamie suggests "The Second Try"). d28 recap "that question — that's still where we are."; "They took Nino — The Blood Tithe, on the screens." d39 Nino alive (secret: talks to someone who isn't there) — Nino's Tithe taking was a contest summons, not death; consistent. d40 Linda HEED warn_you ("the treeline at dusk. Don't.") — heed picked 4×, replies escalate honestly ("Promise me that. Please."); r192/r206 HEED fix holds. d48 Hamoud non-verbal (Arabic only) — gestures, gift of a tool, thins gracefully; r132 nod-loop fix holds.
- **14475 (8):** d10 Tamika Choir Toad naming debate ("'belltoad' got shouted down"); invite declined with condition "We've barely spoken. Ask me after we've bled together." — repeated identically twice in the sitting (unchanged condition, honest, not a defect). d11 Tamika — **F1 (below)**. d18 Fernando "Can I trust you? I mean really."; doubt presses escalate; silence "lands wrong". d19 Tamika mourning Dylan ("Since Dylan died... I keep expecting to see Dylan at the fire."). d29 Tamika bond proposal accepted ("I want us to stick together. Properly."), wound-care favor planted (promised). d30 link proposal to Ashford; "You came through on this wound. I won't forget it." (favor thanked); recap "Still on that debt." d41 Tamika — **F2 investigated and WITHDRAWN (below)**. d49 Heitor mourning Fernando; party named "FINAL GIRLS CLUB" (System suggests; player picks it); "The fire feels smaller without Fernando."

## Findings

### F1 — RESUME OPENER QUOTES A STAGE DIRECTION (seed 14475, d11 Tamika) — FIXED IN-RUN

Opener: "We never finished talking about grief — we wandered off it. 'Tamika has an edge today — something curdled.'" The quoted text is the mood/stage-direction narration from the d10 sitting, not spoken dialogue — the NPC quotes the narrator about herself. Same class as r220's "one stage direction spoken as dialogue" polish item.

**Mechanism (verified in code):** the line is a `convoDriftNote` beat — when a drift channel crosses ≥2, the next conversation opens with one short stage-direction beat: `{FirstName} has an edge today — something curdled.` (bitterness template; four siblings: hollowed-out grief, glancing wariness, lighter warmth, weathered hardness). The resume opener is built in `src/js/conversation.js` (~2180–2330, `convoResumeOpener`); the quote is appended only if `convoSnippetIsRealBeat(o.snippet)`, which calls `convoSnippetIsStageDirection` — but that guard matches only "They ...", "A comfortable ...", "Still on ...", and similar openings. A proper-name subject ("Tamika has...") slips through, so the drift note passed as a real beat at plant time (`convoThreadOpen`, ~1835) and again at resume time (~2313).

**Fix:** `convoSnippetIsStageDirection` now matches the five `convoDriftNote` template tails verbatim (one alternation, in `src/js/conversation.js`). The plant then walks back to substance (or plants nothing), and the resume-time guard drops quotes planted before the fix. The fix is a pure string test — no RNG spent, no trajectory change.

**Proof:** `scripts/test-journey-crisis-r223-drift-note-quote-20261116.js` — RED on unfixed code (first drift-note assertion fails), GREEN after (`PASS test-journey-crisis-r223-drift-note-quote`). Covers: all 5 drift-note templates rejected by the gate; spoken controls (mourning line, goodbye, quoted debate) still quotable; drift-note-only plant plants no ghost thread; pre-fix plant resumes without quoting the drift note. Neighbor guards re-run green: `test-snippet-stage-direction.js` PASS, `test-journey-crisis-r176-resume-quote.js` 15 passed / 0 failed, `test-journey-crisis-r208-lapse-label-20261114.js` 9 pass / 0 fail, `test-journey-crisis-r216-funeral-partial-20261115.js` all PASS.

**Postfix (seed 14475 re-run with the fix, EVID=/tmp/r223postfix):** panel JSON vs postfix JSON — **zero top-level keys differ** (days, end, deaths, raids, gorge, sorties identical). Exactly one transcript differs, the d11 Tamika sitting, and only its opener line: before "...'Tamika has an edge today — something curdled.'", after "...'Don't mind me. Today's just heavy.'" — the plant walked back to the actual spoken grief line from d10. The grief thread still resumes and still names grief; it now quotes real spoken words.

### F2 — WITHDRAWN, not a defect

d41 Tamika opener "Andre and I never did finish talking about that debt — that was 11 days back. Want to hear where it left off? 'Okay — I need to move. But I'm glad we talked.'" Initially suspected misattribution (debt talk was with the player, quote from the player's d30 sitting). **Verified honest via mantle timeline in the 14475 JSON sayLines:** d10 Dylan Beck dies (the wild) → mantle passes to **Andre Joshi**; d29–30 Tamika's wound-care favor promised/thanked with **Andre as the player character**; d31 Andre Joshi dies (the arena) → mantle passes to Fernando Sharma; d41 Fernando (current bearer) resumes the thread planted with Andre. `inheritedName(rec)` returns the predecessor bearer's first name — the "Andre and I" branch (ago 11 > 7) is the r183 inherited-thread design working exactly as intended. The quote is Tamika's own last line from d30. Tamika's mourning line in the same sitting ("Since Andre died...") is consistent. **Do not file F2.**

## Reachable / Fun / Winnable

- **Reachable: YES.** Raids, gorge, sorties, favors, mourning, funerals, betrayal investigations, party namings all fire.
- **Fun: YES.** 40 transcripts, 0 fabrications, confessions land, mourning names the dead, funerals mend honestly.
- **Winnable: NO (this leg).** 3/5 game-over, 0/5 national; the crisis leg is not a win path on its own.

## Telemetry

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/crisis.json --current '.../evidence/2026-11-16/journey-crisis-r223-delayed-seed*.json' --metrics defendedFights,playerFights,latelyDefenseCount` → **quiet** (5 files, 3 metrics, no large deviations). Baseline NOT rolled (single-panel variance; units check from r201's metric review still owed — succession.json stores per-seed means while telemetry-check.js sums; verify crisis.json units before any roll).

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2` — started at closeout; result recorded by the adopting run (see Landing). Expect ~330/340 with known standing failures (measurement-proof staleness pair, phone-frame staleness, load-timeout standalones); adjudicate 0 attributable; run standalones for any load timeouts.

## Landing

Merged locally, pending ship (ship loop owns bump/push/live verification). [To be completed by the adopting run: merge ff-only, release, rotation, lock.]

## Metric review

- Q6 stays retired (9th consecutive zero panel, id-matched 0).
- C3c stays UNMEASURED (third panel without a qualifying case) — the watch needs a favor change within 14 days followed by a resume opener naming the stale favor; r137's re-pose path produced no wrong-favor re-pose. Consider whether the watch is starved by design: resume openers name favors rarely (1/10 this panel) and favors change rarely inside 14 days. A targeted harness case (force a favor change, then a resume) may be the only way to close it — propose for the next run, don't widen the panel.
- A2 recap paraphrase: "that's still where we are" at 3 this panel (was 2 in a row at r210) — still THIN-PROBE by the r193 A2 floor; watch tick only.
- Telemetry baseline re-base owed (units check first).
- Proof refresh round 16 owed (carried since r201; more keys stale).

## Remaining gaps / carried items

- NodeAway muster-vs-travel tension is a design question (see BENCH above), not an in-run fix.
- C3d recap-after-favor-commit: no 2nd sighting; watch stays open.
- Ruin-medicine supply: first non-zero ruin-search count on a crisis panel (4 on 14474), still 0 acquired. Medicine build brief (richer layered design) still owed per Steve 2026-11-14.
- 14475 holder-less medic-duty village reached horizon anyway — the holder-less shape recurs (r216's 14464, r223's 14475); worth a named watch.
- Lane decision on daily-play accept handling owed; held scale-attr tree unlanded; open loop question (what copied 5.6 GB of evidence into ~/workspace/worktrees/journey2-crisis ~11:55Z on 2026-11-14) carried, not chased.
- Rotation: this run plays 6 (crisis); next is 7 (succession).
