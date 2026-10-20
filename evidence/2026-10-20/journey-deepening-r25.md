# Deepening leg R25 — the offer_food sub-funnel: do villagers carry food into field fights? (2026-10-20)

Run: oversight-playtest-loop (lane A), run_id 2026-10-20T18:29:22Z. Leg 2 (deepening, days 40–80).
Rotation-a: read 2 (file authoritative; r22/r24 both claimed "2→3 at end" but the file read 2 at r23, r24, and this run's starts — writing 2→3 at end).
Worktree: journey-deepening. Base: master@8ac811b08.
Pre-reg draft: hidden_files/journey-deepening-r25-prereg.md.

## Pre-register (MEASUREMENT.md 9–12, 14 — BINDING)

**Question** (r24 metric-review named-next): the offer_food sub-funnel. r24: all 3 non-performed in-window funnel opportunities were lockpick_raccoon offer_food fails — villagers don't carry food into field fights (`villagerHasFood` false), so the bribe path never aligned.
- (a) Do villagers EVER carry food into field fights? (all field fights, all seeds)
- (b) When offer_food is the known counter AND the villager has food at fight time, is it PERFORMED?
- (c) When known but no food: binding constraint or AI choice?

**Binding metrics**:
- R1 (instrument, PRIMARY): `hasFoodBefore` pre-fight in the fieldFight wrap; 4/4 pilot seeds complete, 0 instrument errors, hasFoodBefore non-null on ≥95% of recorded field fights.
- R2 (funnel, report-only): lockpick_raccoon fights, counter known at fight time (first counterDiscovered ≤ fight day, ≥1 turn), split by hasFoodBefore; 'offer_food' in trickLog = performed.
- R3 (breadth, report-only): fraction of ALL field fights with hasFoodBefore=true; named carriers.
- M4 (people): ≥6 transcripts sense-read, 0 senseless (report-only). Dialogue engine is the social loop's lane: NO dialogue code changes.
- M5 (winnable): ≥3/4 pilot seeds alive at end.
- Interesting-finding bar: ≥1 performed offer_food with a named villager; a hasFood=true-but-not-performed lockpick fight (AI choice vs constraint); a food-carrier with a non-food occupation.

**Seeds**: fresh 9801–9804 competent pilot (expand 9805–9808 on GO signal). Competent PINNED policy, DAYCAP=100, death-aware stop (+10d tail max). PROBE_W3 off.

**Race guards**: (1) no pacing lever (flesh-out territory) — observe only. (2) no dialogue code changes (social loop's lane) — report-only. (3) the kills-only wave-3 gate is Steve's design — measured, never moved. (4) telemetry per-seed (r20 lesson). (5) the offer_food AI (fieldFights.js: known counter + villagerHasFood → bribe) is landed design — measured, never levered.

**Canon read**: CANON.md, MONSTER-WAVES.md (2026-10-20); fieldFights.js offer_food: "costs 1 real food unit + the action, monster bolts — exactly tbPlayerOfferFood. No food, no bribe." No new canon.

## Infrastructure (fail-loud record)
- Lock: none at start (clean). Created with run_id 2026-10-20T18:29:22Z.
- Main tree: `git pull` already up to date; `git status --short` clean; disk 21%.
- Worktree register: took ~157s (index-restat class per AGENTS.md 2026-10-20, not a hang), exit 0. Tree at master@8ac811b08 = main head at registration. Registry entry verified with matching run_id; branch base verified current (stale-branch-reuse guard).
- **Duplicate-run incident (this run, ~18:35Z)**: the rotation file read 2, but deepening r22–r24 had already run today (all merged to master). I built an r22-labeled harness and launched a 9501–9504 pilot before discovering the completed `evidence/2026-10-20/journey-deepening-r22.md` in the worktree. Killed the pilot immediately; it had overwritten 10 r22 files (9501 JSON + 9 transcripts) and my builder had replaced `scripts/journey-deepening-r22-20261020.js`. RECOVERED: `git checkout HEAD --` on the 11 modified files (HEAD contains the true r22 — commit 09123a854 is an ancestor), deleted 21 stray showprobe files + the phantom builder. Verified: 9501 JSON shows unlock day 77 (matches r22's note), harness header is the true r22. Tree clean. Lesson for the loop: read the day's latest deepening evidence note BEFORE building — the rotation file alone doesn't reveal same-day replays.
- Heartbeat: manual after registration + standing loop `hidden_files/hb-deepening.sh` (540s cadence, pid 57545). Registry heartbeat verified fresh.
- Smoke test (pre-pilot): DAYCAP=45 seed 9801 — instrument green: hasFoodNullFrac=0, foodFrac=1/38, carrier 'Houria|gen_vuzktti'. Smoke transcripts cleaned.

## What ran
- Harness: `scripts/journey-deepening-r25-20261020.js` (built by `scripts/build-r25-harness.js` from the r24 trick-funnel harness). Changes: (1) pre-fight `hasFoodBefore` in the fieldFight wrap (`Game.villagerHasFood(vid)` before `_ff` — the bribe consumes the unit); (2) offerFood analysis block (lockpick funnel split + all-fights food-carrier census); (3) offerFood in per-seed JSON + summary line; (4) pre-reg header. `node --check` clean. **No game-code changes (measurement run).**
- Pilot: 4 seeds × 100d, competent pinned, PROBE_W3 off. Run log: evidence/2026-10-20/journey-deepening-r25-run.log.

[VERDICTS — pilot + expansion, 8 seeds]

- **R1 (instrument, PRIMARY) — GO.** 8/8 seeds complete, 0 instrument errors, hasFoodNullFrac=0 on all 8 (100% non-null pre-fight reads; bar was ≥95%). The pre-fight read convention is validated — post-fight reads would lie (the bribe consumes the unit).
- **R2 (funnel, report-only) — REPORTED.** 11 lockpick_raccoon field fights, 7 with the counter known at fight time (first counterDiscovered ≤ fight day, ≥1 turn). ALL 7 had hasFoodBefore=false; 0 performed. The 7: Diana d64 (9801, mFlee), Fiona d15 (9804, vKill), Chakib d36 (9804, mFlee), Leonardo d12 (9805, mFlee), Dante d12 (9806, vKill), Wanjiru d14 (9807, vKill), Daniyar d50 (9808, vKill). 4/7 ended in vKill without the bribe; 3/7 the raccoon fled. The constraint is the food, never the AI — there is no hasFood=true case on 8 seeds to test the AI's choice. Sub-question (c) is unanswerable on this substrate.
- **R3 (breadth, report-only) — REPORTED.** 5/420 field fights (1.19%) with food carried. Carriers: Houria (9801, 2 fights — gone from the end census), Wilhelm/pottery instructor (9804, trust 90), Elif/hotel housekeeper (9807, 2 fights). Answer to (a): yes, villagers carry food into field fights, but rarely (~1%); none of the carriers has a food-adjacent occupation — the carry looks incidental, not role-driven.
- **M4 (people) — GO.** 12 transcripts sense-read: 9 meaningful / 3 borderline / 0 senseless. See People check.
- **M5 (winnable) — GO.** 8/8 villages alive at end (days 87–102). 0 death-honesty mislabels (checked in JSONs).

## Village assessments (plain words)
- **9801 (8/8, d102, wave 3 @52, regional):** the trick-fight seed — 26 villager w3 field fights, 13 with tricks, 7 hold-lines, 1 player w3fight. 1 ambush death. Houria carried food into 2 field fights.
- **9802 (8/8, d94, wave 3 @55, regional):** 2 player w3fights, 5 villager w3 field fights (0 tricks). 2 deaths (ambush + combat).
- **9803 (10/10, d87, wave 3 @84, regional):** the quiet one — unlocked d84, 0 w3fights in 3 post-unlock days. 0 deaths. Juan's three-conversation arc (guilt admission → "I'm still here, asking nothing" → trust question) is the people-check standout.
- **9804 (10/10, d102, wave 3 @87, regional):** 2 player w3fights. Wilhelm (pottery instructor, trust 90) carried food into a field fight. 0 deaths. His hunger favor deflected honestly: "Forget I asked." — "They won't forget. They'll just stop asking."
- **9805 (8/8, d94, wave 3 @76, regional):** 1 player w3fight. 0 deaths.
- **9806 (8/8, d102, wave 2, regional):** the non-unlocker — 7 wave-2 types faced but never scored 4 ledger points. 1 ambush death. 3 regional links (most this run).
- **9807 (8/8, d102, wave 3 @37, regional):** the early unlocker — 3 player w3fights, 31 villager w3 field fights, 12 with tricks, 12 hold-lines, 10 monster-flees. 1 ambush death. Elif (hotel housekeeper) carried food into 2 field fights.
- **9808 (9/9, d102, wave 3 @77, regional):** 0 player w3fights, 7 villager w3 field fights (3 with tricks). 0 deaths.

## People check (SENSE-TESTING LAW — 12 full transcripts; REPORT-ONLY, dialogue lane is the social loop's; NO dialogue code touched)
- **9 MEANINGFUL / 3 BORDERLINE / 0 SENSELESS.**
- Meaningful: Paola 9801-d60 (wound-care favor → dlg:commit → promised); Niamh 9802-d45 ("What's the worst thing you've done since the sky changed?" — sharp, answered with grace); Kelsey 9802-d60 (food favor → "I won't forget who fed me when it mattered" — a real owe); Juan 9803-d45 (guilt question, engaged); Juan 9803-d60 (cross-conversation callback: "You said yes — you left someone behind. I never asked who."); Juan 9803-d80 (trust question → "Noted. I'll watch too." — the NPC takes a stance); Jordan 9802-d80 (hope exchange: "Eight hours of not being afraid"); Wilhelm 9804-d60 (hunger favor honestly deflected); Wilhelm 9804-d80 (seek_taken surfaces: "Have you ever asked? About the taken — about Aaliyah?").
- Borderline: Michelle 9801-d45 (characterful opener, then grief-pool recycling + "That's the whole of it. Sorry." filler; want never fires); Renee 9801-d80 (8 identical comfort loops — "You alright?" ×8 — seek_taken never engages, resolution=unestablished); Wilhelm 9804-d45 (genuine confession opener never followed up; teach-template ×4 verbatim).
- **Persisting clusters (handover to the social loop, NOT fixed here):** grief-pool verbatim recycling (Michelle: "Caroline is gone and the world just... continues." / "Nobody says Caroline's name right yet."; Jordan: "I keep turning over the last thing Dieter said to me." / "My part? I remember them. Someone has to do it properly."); dlg:more filler / stage advances on empty content (Michelle, Renee's 8-turn loop); teach-template verbatim ×3–4 (Paola, Wilhelm d45); stage-0 deflection on the strongest want (Renee's seek_taken, Wilhelm d45's seek_taken).

## Blanks filled (0 — measurement run, no game-code changes)

## Blanks documented
1. **The offer_food bribe never fired on 8 seeds** (7 known-at-fight opportunities, all no-food). The AI's choice is never the constraint — the food-carrying precondition (~1%) binds first. Whether villagers SHOULD carry food more often (or the bribe should work from pack proximity / a carried-snack concept) is a design question for Steve — the funnel's narrowest point is villager inventory behavior, not the bribe logic (which is parity-correct with tbPlayerOfferFood).
2. **Roster-price anomaly vs r21/r22:** 5 deaths across 8 seeds (4 ambush, 1 combat) vs r21's 13–34 combat deaths per unlock seed — same competent policy, same leg window. Seed variance or substrate drift; noted, not claimed. If it reproduces, the wave-5 wall's "roster price" substrate may have shifted too.
3. **9806 never unlocked wave 3** (7 wave-2 types faced, 0 unlocks by d102) — the contact-vs-kills distinction once more; the village survived fine, it just never scored 4 ledger points.

## Metric review (§14)
- **R1's instrument worked as designed**: pre-fight reads, 0 nulls on 420 fights. Propose keeping `hasFoodBefore` as standard in the fieldFight wrap for future funnel runs (cheap, honest).
- **R2's funnel**: the known-at-fight + ≥1-turn filter carried over cleanly from r24. The 0/7 food rate makes sub-question (c) unanswerable on this substrate — propose for r26: accept "the food, not the AI" as the funnel's answer, OR a constructed probe (policy-side food-carry) if Steve wants the AI's choice tested.
- **No mid-run re-scores**: all bars held as pre-registered. Expansion was on the pre-registered GO signal (clean pilot + open AI-choice question).

## Telemetry deviation check
`telemetry-check.js` vs deepening.json (w3fights, engaged.w3, fightsByWave.3, fightsTotal), 8 seeds: **quiet — no large deviations, no LOUD lines.** Baseline NOT rolled.

## Reachable / fun / winnable (deepening leg)
- **Reachable:** YES — wave 3 on 7/8 seeds (9806 the miss: contact without kills). The offer_food bribe is reachable in principle (the code path is parity-correct) but its precondition (food carried into the fight) fires ~1% in practice — the mechanic is nearly unreachable on this substrate, by inventory behavior, not by design of the bribe.
- **Fun:** 9807 is the leg at its best — 31 villager w3 field fights with 12 hold-lines. Juan's three-conversation arc and Wilhelm's deflected hunger favor show the village acting like people.
- **Winnable:** 8/8 survive to days 87–102 with 0–2 deaths each. The leg threatens nothing a competent village can't handle.

## Design notes for Steve (his calls, not levers)
1. **The offer_food bribe is the narrowest sub-funnel**: 7 known-counter opportunities on 8 seeds, 0 with food held, 0 performed. The AI is never the constraint — villager inventory behavior is. Whether villagers should carry food more often, or the bribe should reach into the pack, is your call.
2. **Food carriers aren't food people**: pottery instructor, hotel housekeeper — the carry looks incidental, not role-driven.
3. **Roster price was light this run** (5 deaths/8 seeds vs r21's 13–34/seed) — same policy. Seed variance or drift; flagging, not claiming.
4. **No pacing lever taken** (flesh-out territory), **no dialogue changes** (social loop's lane), **gate untouched** (your design).

## Files
- Run note: evidence/2026-10-20/journey-deepening-r25.md (this file)
- Pre-reg: hidden_files/journey-deepening-r25-prereg.md
- Builder: scripts/build-r25-harness.js
- Harness: scripts/journey-deepening-r25-20261020.js
- Per-seed JSONs: evidence/2026-10-20/journey-deepening-r25-competent-98{01..08}.json
- Transcripts: evidence/2026-10-20/journey-deepening-r25-transcript-competent-*.txt (day45/60/80 corpus + showprobes)
- Run logs: evidence/2026-10-20/journey-deepening-r25-run.log (pilot), evidence/2026-10-20/journey-deepening-r25-run-exp.log (expansion)

## Files
- Run note: evidence/2026-10-20/journey-deepening-r25.md (this file)
- Pre-reg: hidden_files/journey-deepening-r25-prereg.md
- Builder: scripts/build-r25-harness.js
- Harness: scripts/journey-deepening-r25-20261020.js
- Run log: evidence/2026-10-20/journey-deepening-r25-run.log
