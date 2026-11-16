# Journey — social life, run r220 (Lane B leg 5)

- **Run:** r220, Lane B leg 5 (social life), 17th Q1 datapoint for the continuity panel.
- **Base:** master `d39ce6e8c`. **Seeds:** 44901–44904 (fresh band; backup 45101–45104 unused). **Daycap:** 140, policy journey.
- **Mode:** `journey-social-life-r220`. Scripts cloned r215→r220 verbatim except seeds, OUTDIR, filenames, mode.
- **Panel:** 4 seeds, ~2.2 min, rc 0, 0 instrument errors. Log `journey-social-life-r220-panel.log`; JSONs `journey-social-life-r220-{44901..44904}.json`; analysis `journey-social-life-r220-analysis.txt` (617 lines).
- **Panel totals:** 365 full conversations, 339 natural ends, 50 feasts, 5 moots (1/2/0/2), 49 fallen, 23 successions.

## Pre-registration (summary)

- **Job A — continuity panel M1–M12**, 17th Q1 datapoint; M11/M12 confirmations folded into continuity (fifth panel).
- **Job B — new-base reads:** B1 curious-resume stutter fix; B2 goon ask-tag fix (blind-accept shape); B3 want-question re-pose; B4 commit-refusal as memory (F3); B5 funeral-mend partial voice.
- **Job C — watches:** vendetta decision point (see metric review), M1 hot-accomplice, HEED `warn_you` (3rd panel), M2 combined bar + rate, re-offer max, dropped threads, moots, FUNERALMEND.
- **Job D — NOT this run:** r171 M2b proof, measurement-proof refresh, courtship-rework-b BFS fix (band 100621–100636 stays fresh).
- **Job E — stretch only after a green gate:** telemetry baseline re-seed with metric mapping (NOT a same-run roll-forward of stale keys).

## Panel — what happened, per village

| seed | days | end | alive | fallen | pantry end | codex plants | successions |
|------|------|-----|-------|--------|-----------|--------------|-------------|
| 44901 | 56 | village-lost, scattered | 9 | 7 | 0 | 43 | 4 |
| 44902 | 69 | village-lost, scattered | 1 | 16 | 0 | 45 | 10 |
| 44903 | 138 | SURVIVED | 8 | 7 | 9,737 | 50 | 3 |
| 44904 | 94 | village-lost (wiped) | 0 | 19 | 0 | 56 | 6 |

Median lived 81.5 days; 1/4 past day 100. Two villages scattered (44901, 44902); 44904 lost everyone.

## Binding verdicts

- **M1 arming motive — GO** by the pre-registered reasons bar: 8/8 arms carry "grievance" in the motive reasons. Flag for metric review: the analyzer's panel line counts grievance-linked 6/8 by gT→L>0; the other 2 are leader-held grievances (44902 plot_3 Theo, grievance voted_guilty→Pasquale d13, sev 22; 44903 plot_3 Lena, grievance ambushed→Nathan d9, sev 60). Accomplices all cold (grievance 0) — third panel cold; r206's hot Adaeze (66/88) remains the single exception.
- **M2 bonds — ANSWERED (18th datapoint):** 105 proposals, ALL villager-initiated (scholar 0). Person-kind 35 (accepted 19, refused 4, staged 11, expired 1); link-kind 70 (accepted 18). Max per initiator 10 (Lena, 44903) < combined bar 20; person-kind max 6 (Lena) < amendment-5 cap 8. End bonds 52/89/81/68. The engine still records NO initiator on bond records. Rate 105/357 lived days = **0.294/day** (r195 0.328, r200 0.177, r206 0.268, r215 0.235) — watch only.
- **M3 invite refusal — sometimes taken:** NPC lures 252 accept / 236 decline; player party invites 18 accept / 16 decline; NPC bond invites 9 accept / 4 decline. All lures NPC-invited, all party invites bearer-initiated.
- **M4 sense — GO:** 361 transcripts, 167 near-duplicate flags, 4/4 candidates printed, all natural ends. React shape: agree 0 / joke 0 / silence 2245; longest continuer run 4 (<5). See People check below.
- **M5 census — REPORT-ONLY, below control:** 1/4 past day 100, median 81.5d vs the 126d survival control. Sequence across runs: 2/4, 2/4, 1/4, 1/4, 1/4, 3/4 (r195), 2/4 (r200), 2/4 (r206), 3/4 (r215), **1/4 (r220)**. The r215 crack did not hold. Floor (0/4 past day 75) not triggered (2/4 past day 75).
- **M6 gossip-position — GO** (re-aligned, radius-1): gate-away 0/0/0/0; debates 139 kicked, 138 settled. Strict on-tile away total 21 — the known metric/gate definition discrepancy, not a failure.
- **M7 dedupe — HOLDS:** all 167 flags are jaccard≥0.5 / same-opening pool-cycle / legitimate variety; no verbatim same-beat repeat in a fixed pool, no new double-served scene line in one sitting. Blind spot unchanged (see metric review).
- **M8 counter-settle — SETTLED:** 2 settles (44902 ×2), both link-formed, 0 blocked re-raises, 0 fresh re-links. proposeLink 18, counter 2, fresh 18.
- **M9 recap cap — HOLDS:** max presses 3 per seed, total 241, 0 offered after cap, 0 cap failures.
- **M10 coach / M10b face-guard — HOLDS:** 0 coach verbatim, 0 face verbatim, panel max same-narrator 1, NARR near-duplicate flags 0.
- **M11 recap-empty — HOLDS (5th panel):** 0 flags of 167.
- **M12 door-requirement — CONFIRMED (5th panel, native):** three-times total 62, max per sitting 1, 0 sittings with 2+, exits 93 (≥1 required). Worst sitting maxDoorServes 8 (44904 gen_qkd3duz, 9 turns) — within the designed ceiling of 9. Door-requirement flags 118/167 (70.7%; r200 42%, r206 58%, r215 47.5%) — the flag rate tracks panel size, not the bar; see metric review.
- **B2 double-confession — HOLDS (10th re-confirmation):** 8 sittings with a confession, 0 double, 8 single. Panel CONFESS total 37, confessed 8.
- **Q11 scattering — CONFIRMED:** all 4 seeds record scattered / hungry-days / alive-at-end; scattered 2/4 (44901: 9 alive, 3 hungry days; 44902: 1 alive, 3 hungry days).

## Job B — new-base reads

- **B1 curious-resume stutter — HOLDS in the wild.** Corpus check over all 365 transcripts: **0 lines** matching the stutter shape ("About \<note\> — \<same question\>"). The fix (abc52dce1) is confirmed outside the proof test.
- **B2 blind-accept — HOLDS.** The goon ask-tag fix (25373172b) was supposed to stop the menu offering an accept for a proposal the player never heard. Corpus check flagged 6 sittings where an accept was offered with no proposal language spoken earlier in that sitting or any prior sitting with that villager. All 6 resolve to the **pending-ask shape** the fix explicitly preserves — a proposal staged on an earlier day, accepted on the sitting's day:
  - 44902 Omar d30 link:accept — Omar's d27 staged link to the same village, accepted d30.
  - 44903 gen_3d2mbcp d18 bond:accept — Leroy→Lily staged d15, accepted d18.
  - 44903 Lena d29 link:accept — Lena's d26 staged link to village_2, accepted d29.
  - 44903 gen_lquebtr d75 bond:accept — Kiara→Wanjiru staged d74, accepted d75.
  - 44904 David d12 link:accept — David's d11 staged link to village_2, accepted d12.
  - 44904 gen_qkd3duz d63 link:accept — Christina's d61 staged link to the same village, accepted d63.
  No genuine blind-accept in 365 conversations. (Note: the first, wider detector flagged 14 sittings; 8 of those had the proposal spoken in the sitting and were false positives of the narrow regex.)
- **B3 want-question re-pose — EVIDENCED.** Dropped threads that resurface re-pose the question and the conversation engages it: gen_m963u45 re-poses "What do YOU think actually happened to us?"; sam_wilson resurfaces the dream question ("You said you dream about before… Is it still there?"); benoit_lambert resurfaces named live favors ("About the sickness I'm fighting", "About the food I needed").
- **B4 commit-refusal as memory (F3) — UNPROVEN IN THE WILD, not disproven.** The panel produced 4 person-proposal refusals (Connor→Rudra d19, Niamh→Daniyar d19, Felipe→Henry d86, Daniyar→Henry d107), so the F3 situation arises. But the corpus holds **0 spoken lines containing "refus"** — refusals are recorded as decisions, not spoken beats — and no resurface of a refused bond was observed in the transcripts. The mechanism itself is covered by the carried proof tests (green); the voice path has no wild evidence this panel. Watch, not a fail.
- **B5 funeral-mend partial voice — INSTRUMENT GAP, not a regression.** The partial-mend voice (edd53a489) is a village announcement (`this.say()`), and the social harness serializes **no say-log** into the evidence JSON: 0 occurrences of "funeral" anywhere in the 4 JSONs, no `funeralMendStats` key, and `nightlyNews` is a gossip counters table, not announcements. Whether the partial-voice line fired in these 4 villages cannot be established from this evidence. The mechanism is covered by r216's own proof tests (3/3 + 2/2, landed in edd53a489). Documented blank: a future run that wants to read this voice in the wild needs the harness to capture the say-log or `funeralMendStats`.
- **HEED `warn_you` — 1 line, 3rd panel.** "About that warning — I keep turning it over." (44903 gen_3d2mbcp). Watch continues.
- **Parting pool (r214) — fires regularly:** 90 partings across the three pool lines (27 / 26 / 37).
- **Injury lines:** 0 lines containing "injur" in the corpus.

## Watches

- **Vendetta — decision point fires (see metric review):** maxUnordered **2** (Lena↔Nathan 2, Benoit↔Kavya 2). Third panel ≤7 (7, 4, 2).
- **Re-offer max:** panel max 12, furniture-free 11 — same order as prior runs.
- **Dropped threads:** 5 drops, **all 5 resurfaced next sitting**, 0 never resurfaced.
- **Moots:** 5 convened (1/2/0/2) — the trigger is alive.
- **M2 bars:** combined 10 < 20, person-kind 6 < 8 — not approached.
- **M1 hot-accomplice:** none this panel (all cold).

## Village assessment (plain words)

Four villages, one survivor. The story of this panel is the same as the survival control's: villages die fighting and hungry, and the one that lived did it with a full pantry and warm friendships.

- **44901 — lost at day 56, scattered, 9 alive.** The mantle passed four times in 25 days (Kelly→Ezra→Roman→Connor→Esteban) — the bearer kept dying. Seven fell, mostly to the wild (4) plus an ambush (Quinn d8, the arming plot sprung), the arena (Kelly d31), and thirst (Liam d55). The pantry hit zero by day 55. The nine left standing are led by Esteban (trust 82) with Diana the paramedic (trust 92, 3 abilities) and Tashi (trust 97) — a village that knows how to care for people but ran out of food while its leaders kept dying.
- **44902 — lost at day 69, scattered, 1 alive.** The worst attrition of the panel: 16 fallen, 10 successions in 69 days — the mantle changed hands almost every week (Pasquale→Marcus→Catalina→Miguel→Omar→Ava→Sanne→Rudra→Eduardo→Heinrich→Tashi). Eight died to the wild, five to monsters, three to strangers. Only Tashi the arborist is left, alone, friendly but with no abilities. A village ground down to a single person.
- **44903 — SURVIVED 138 days, 8 alive.** The one that worked. Pantry 9,737 kcal at the end, 50 codex plants, and a warm village: Felipe, Nina, Daniyar, Henry, Zhibek all trust 91–100, Nathan 92, Lena 79. Seven fell (monster 2, arena 1, wild 1, stranger 2, contest 1) but the village absorbed the losses — the mantle passed only three times (Lily→Wanjiru→Leroy→Lena). This is what the good ending looks like from the inside: food in the store, people who trust each other, and enough strength that a death doesn't end the story.
- **44904 — lost at day 94, nobody left.** Nineteen fallen, the heaviest toll: monsters 6, the wild 4, strangers 3, ambush 2, starvation 2, the arena/combat 1 each. Six successions and then the line runs out — Christina passed the mantle to Benoit on day 94 and there was no one left to carry it after. The most codex knowledge of the panel (56 plants) and nothing to show for it.

## People check (M4 candidates — full transcripts read)

All four candidates end naturally. Villagers want things, ask for them, remember what was dropped, and close with warmth or a clean break. The blemishes are polish, not sense failures.

- **44901 gen_q5eal8g (C-friendship, 11 turns):** a foraging-help resurface ("We never did finish talking about that foraging help — that was 9 days back") and a village argument over naming Inspiration ("The Big Beast"). Ends warmly. Blemishes: "And then?" ×3 driver repetition; double NPC opener lines; "Something in them stays shut, for now." delivered as unquoted NPC speech; and the door-requirement loop firing four times in a row ("Why can't I do this now?" ×4 with four door variants) — the M12 cluster in the flesh, correct but tedious.
- **44902 omar_farouk (C-friendship, 11 turns):** the strongest of the four. Omar digs up buried food (+1,669 kcal to the pantry), confesses "I wasn't a midwife. I was a piano tuner.", proposes a link to The Red Table II, and says "I never finished anything I started back home. Here, finishing is survival." Blemish: "How would that even work?" ×3, and a stage direction ("(A little too quickly.)") spoken aloud as dialogue.
- **44903 gen_3d2mbcp (D-talk-request, 11 turns):** dropped-thread resurface, a remembered opinion of Thornfield ("-1 remembering Haven acted"), and "They took Nathan — Gauntlet, on the screens." A villager carrying the village's history into the conversation.
- **44904 sam_wilson (D-talk-request, 11 turns):** an interrogation — the player presses "That doesn't quite add up." ×6 and Sam escalates to "I've told you everything I'm going to tell you." The NPC holds a boundary instead of folding, which is exactly the behavior the sense bar asks for.

## Blanks filled

- **Two proof-test pins fixed (test-side only, no game code changed).** Both carried tests failed on the current base and were proven pre-existing on the r215 base (checked out the 4 changed source files at e6f239a8c, reproduced, restored — source hashes match HEAD after restore):
  - `test-journey-social-r172-confessguard`: the reset works, but the third sitting's opener volunteers the villager's unshared secret — which IS a confession and legitimately sets the flag during open. The test assumed a clean open. Fix: null the secret before opening sitting 3 (RE-PIN comment). Now 17/17.
  - `test-journey-social-r172-confesswrap`: the scenario drifted — seed 43402 now yields two doubt confessions in 13 days (different sittings, each recorded once). The one-event-per-press property holds. Fix: count pin replaced by property assertions (≥1 event, every event method ∈ {confrontDoubt, confrontTheft} and outcome ∈ {confessed, deflected}, ≥1 confession, no sitting double) + RE-PIN header note (r180 precedent). Now 5/5.
  - Full carried set after fixes: **19/19 PASS**.
- **Polish warts documented, not fixed:** the "And then?" / "How would that even work?" / "That doesn't quite add up." driver repetitions (×3–×6); "(A little too quickly.)" stage direction spoken as dialogue; "Something in them stays shut, for now." as unquoted NPC speech; double NPC opener lines; the ×4 door-requirement loop in one sitting. All small; none breaks sense.

## Interesting (not pre-registered)

- **Omar's buried food** (44902) is the single most hopeful beat in the panel: a villager who hid food before the Scattering digs it up and hands the village 1,669 kcal. Villagers acting on their own past to save the present.
- **44902's ten successions** — the mantle passed ten times in 69 days and the village still lasted to day 69. Succession works as a shock absorber; it just can't absorb that much shock forever.
- **44903 is the counter-example to the panel's gloom:** the only village with a positive pantry, the only one with trust in the 90s across the board, the only survivor. Food + trust + time is the whole recipe, and it is visible in the numbers.
- **The accept-before-proposal ordering** (B2, Omar d30): the menu offered `link:accept` at turn 5 while the proposal line itself was voiced later in the sitting. It reads as a defect on first sight; the records show it is the pending d27 proposal being answered, not a blind accept. Worth knowing for the next person who reads that transcript cold.

## Metric review

- **Vendetta bar RETIRED (pre-registered decision fires).** The r215 metric review pre-registered that a third panel ≤7 retires the 8 bar as unhittable-in-practice, replaced with a watch on the maxUnordered trend. This panel reads **2**. Trend: 7, 4, 2. The bar is retired in this run's metric review; it is NOT a re-score — the decision was pre-registered in r215. Next runs watch the trend only.
- **M1 reasons-vs-grievance divergence.** The reasons bar (8/8 "grievance" in motive reasons) and the gT→L>0 count (6/8) disagree because 2 plots are leader-held grievances (the leader, not the target, holds the grudge). Either the panel line should count leader-held grievances as grievance-linked, or the reasons bar should stay the judge and the panel line is informational. Propose for the next run: count both directions (grievance held by any plot party) in the panel line, and keep the reasons bar as the binding judge.
- **M12 flag rate tracks panel size, not the bar.** 118/167 (70.7%) vs 47.5% in r215 — the numerator grows with the panel (365 conversations vs fewer before). The binding numbers (max per sitting 1, 0 sittings with 2+, 93 exits) are unchanged and green. Propose for the next run: report the flag rate as a share of conversations, not of near-duplicate flags, so it stays comparable across panel sizes.
- **M2 rate watch.** 0.294/day, between r215 (0.235) and r195 (0.328). No bar, no action; the rate wanders with panel composition.
- **M7 blind spot unchanged.** The dedupe check still cannot see verbatim repeats that differ only by pool cycling, and it still cannot judge whether a near-duplicate flag is a real sense failure or legitimate variety — the flags are adjudicated by reading, not by the metric. No change proposed; the reading step is the control.
- **M5: the r215 crack did not hold.** 3/4 past day 100 in r215, 1/4 now; the 10-run sequence is 2/4, 2/4, 1/4, 1/4, 1/4, 3/4, 2/4, 2/4, 3/4, 1/4. No proposal — M5 is report-only, and the survival control (126d median) is the standing comparison, not a bar to chase in this leg.

## Telemetry

`node scripts/telemetry-check.js --baseline …/telemetry-baselines/social.json --current 'evidence/2026-11-16/journey-social-life-r220-*.json' --metrics l3.bonds,l3.deepBonds,l3.betrayalCases,l3.mootsConvened,l3.gossipConvos` — **5 LOUD lines, all "disappeared"** (baseline → current 0, n=4 files): l3.bonds 318, l3.deepBonds 168, l3.betrayalCases 8, l3.mootsConvened 7, l3.gossipConvos 99. Same 5 lines as r206/r215 — explained schema drift, not a real loss: the current harness records these under different keys (end bonds 52/89/81/68 per seed, moots in `social.moots` = 5, gossip in the `nightlyNews` counters, betrayal cases in `darkEnd.cases`). **Baseline NOT rolled.** Re-seeding with a metric mapping is job E (stretch, after a green gate).

## Gate

`node scripts/check.js --quick --timeout 300 --cacheDirectory=/tmp/jest-cache-playtest2`, 782s, run by the adopting coordinator on the worktree tip: **334 passed, 6 failed, 0 attributable.** The 6: measurement-proof pair (proof-source staleness, standing failure set), phone-frame-proof (stale receipt, standing), living-garden deed-attainment 300s timeout (box-load artifact, standing), ladder-bundle (gorgeprice2 guard side-effect, r213-adjudicated), person-trust HAUL 3 vs 0 (stale pin — r138 re-pinned HAUL 0→3 on master; resolved by the rebase onto current master). The run changed no src/js — two test-side pins only — so nothing in the 6 traces to this run.

## Landing

PENDING — commit, rebase onto current master (3322fb0df, r221 establishment), re-verify the two fixed proofs + person-trust on the rebased tip, merge ff-only, release worktree, rotation-b 5 → 6.

## Reachable / fun / winnable

- **Reachable — yes.** The social content fires from day 1 (first-meeting, talk-request, friendship sits) through day 138; bonds, links, moots, feasts, dropped-thread resurfaces, and counter-settles all appear in the wild without staging. A real player meets this content by talking to people.
- **Fun — yes, with polish owed.** The best conversations (Omar's buried food, the Thornfield memory, Sam holding a boundary) read like people, not menus. The worst moments are repetition: the same driver prompt three to six times, the door loop four times in one sitting, stage directions spoken aloud. None of it breaks the game; all of it would read better with variety.
- **Winnable — the leg's content doesn't block the win, but the villages mostly don't get there.** 1/4 survived to day 138 and only 44903 looked like a village that could keep going. The social systems themselves (bonds, links, moots) are healthy; the winnability bottleneck is the same one the survival control shows — villages die fighting and hungry before the social fabric can carry them. Nothing in this leg's content needs a gate change.
