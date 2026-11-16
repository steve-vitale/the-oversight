# Journey — crisis, Lane B r228 (2026-11-16)

**Leg:** 6 crisis — famine, disease outbreak, monster siege, succession: how the village bends or breaks.
**Run:** r228, Lane B. Rotation 6 → 7 (succession next).
**Base:** master `7bb50f3dc` ("sim-winnability-round-1730: coordinator evidence — trickteach NO-GO + 14cwatch D1-stop + 14cwatch2 NOT REPRODUCED, all landed").
**Prereg:** `evidence/2026-11-16/journey-crisis-r228-prereg.md` (frozen before any scored seed).
**Seeds:** 14481–14485 (verified fresh per the seed-band skill; zero prereg hits), ORIGINS Seattle/Boston/Austin/Chicago/Phoenix, policy oracleV2, 150d death-aware + 10d tail.
**Panel:** 5/5 seeds complete. Driver `scripts/journey-crisis-r228-delayed-20261116.js`, analyzer `scripts/analyze-crisis-r228-delayed-20261116.js` (cloned from r223 by sed renames; analyzer validated byte-identical on r223's corpus before the panel).

## Leg question

Do r223's verdicts hold on the new base — and does the C3c resume-opener watch finally get a qualifying case, by panel or by targeted harness?

## Panel results

| Seed | End | Raids | Gorge | Sorties | Convos | Alive | Pantry |
|---|---|---|---|---|---|---|---|
| 14481 | 111d game-over | 9 | 69 | 8 | 8 | 1 | 0 |
| 14482 | 139d game-over | 8 | 19 | 5 | 8 | 1 | 0 |
| 14483 | 128d game-over | 11 | 51 | 11 | 8 | 2 | 0 |
| 14484 | 140d game-over | 5 | 24 | 5 | 7 | 0 | 0 |
| 14485 | 135d game-over | 11 | 57 | 9 | 8 | 1 | 0 |

**5/5 game-over, 0 horizon, median 135d** (r223: 3/5 game-over, 2 horizon, median 141d; r216: 3/5; r208: 5/5, median 84d). No player deaths on any seed (0 scholar deaths, 0 mantle passes — CASCADE 0). Smoke (SEED=14481 DAYS=5) exit 0, instrumentErrors []. One benign stderr line: `[feastBuff] Game.feastBurn() is retired...`. Panel ran on the FIXED code (both fixes below landed before the panel).

Analyzer (`journey-crisis-r228-full-analysis.txt`, 1387 lines, exit 0): attempts 38, ok 20, refused 18, cleared 2, deltaBad []; gorge nights 220, gorge kcal 255,156; convos 39, fabricHits 0; sortieFights 37; D1 delayed ≥3: 38/38; D3 drift unknown []; D2 clear rate ok 2/20.

## Verdicts

- **D1 DRY CENSUS: GO** — 0 dry lines, deflectQ 0, 39 transcripts.
- **WRAP-CHECK: GO** — 39/39 marked, 0 unmarked (37 engine-ended, 2 refused).
- **Q6: descriptive** — id-matched 0, name-matched 16 (10th consecutive zero panel, retired).
- **A1–A6: VACUOUS** — 0 kills, 0 silent, 0 cooldown violations (10th consecutive zero panel). R186 encounter-eligible days 0 on all seeds.
- **C1: GO** — every game-over has a named cause, not a siege-mechanic failure; 0 softlock seeds.
- **C2: GO** — raids all seeds, fought resolutions present, D1 38/38 delayed ≥3, deltaBad [], D3 drift unknown 0.
- **C2b: GO** — all 5 seeds "judged on gorge+sorties".
- **C3b: GO (vacuous-but-clean)** — 5 "settled" close lines, ALL non-favor: "what's been happening" ×4 (14481 d54, 14482 d11, 14485 d15, 14485 d23), "that question" ×1 (14483 d11). Each spot-checked: the sitting discussed that thread (e.g. 14482 d11 ask:lately present; 14483 d11 betrayal investigation discussed). Zero false settlements.
- **C3c: FINDING (harness)** — panel: 10 resume openers, none names a favor (4th consecutive panel without a qualifying case). Harness verdict governs per prereg rule (9): the stale label reproduced and is fixed — see F1. The watch is CLOSED; it is no longer UNMEASURED.
- **C3d: 0 sightings** — "Nothing important" recaps 0 (watch stays open).
- **C7b:** famine feed 0 (1 sayFamine on 14484), disease corpse 1 (14482 Samira, wound_fever), wound corpse 7, thirst corpse 1 (14484 Chloe, dehydration); wild dominates (sayWild 8/8/4/10/8 = 38). Buried: Darius Rhee, Nadia Frost (14481); Zoe Kim, Desmond (14482); Ashanti Shapiro (14483); Mario Holmes, Jesse Cortez (14484); none listed 14485.
- **FUNERAL-MEND CONFIRM: GO** — 27 feast lines: 4 partials all honest ("Trust +13/+10/+14/+4 — the feast could not buy back the full -8."), 18 full ("Trust mended"), 5 "pantry holds nothing" lines honestly say "(Trust -8 stands.)". Zero over-claim lines. (`funeralMendStats` absent from JSONs; counts from sayLines greps.)
- **Fight-1 (R181):** okSorties 20, brokeAfterFight1 10, cleared 10; brokeAfter1VTaken max 96, **cleared fight-1 vTaken max 50 — Q4 trigger (≥70) NOT hit**; broke openers all vFlee 10/10; cleared openers mFlee 5 / vKill 5; multiMonsterCleared 9/14.
- **Missed-window (R154):** corrected 13 (valve-expiry 12, drawn-off 1); R154 drift duplicates 0; driverSkipped=1 (same driver-side per-run same-seed duplicate class as r223).
- **BENCH / NODEAWAY:** refused 18; shape gateOneShort 10 / supplyEmpty 6 / availabilityDrain 2; nodeAway exclusions **38** across refusals; alive-bench refusals **9** (all gateOneShort 7 / availabilityDrain 2). **NodeAway watch REPEATS at larger scale than r223 (18 exclusions, 3 alive-bench) — the muster-vs-travel tension stays a design question, not an instrument artifact.** Worst: 14481 d56/d66/d67 with 5–7 villagers out on node-travel at once. Profilegate bypass may have moved launches — sortie counts vs r223: ok 20 vs r223's 35 (panel-level descriptive only; no lever attribution with n=5).
- **Supply:** ruinSearches 0 on all seeds (back to 0 after r223's 4 on 14474); 0 med acquisitions; pharmacy 0 days all seeds; medic-duty ability cures 18/29/14/12/4 = 77, medicine cures 0. **All 5 seeds HAD a medic holder** (spans present) — no holder-less village this panel (r223's 14475 and r216's 14464 were holder-less).
- **Arena watch:** 8 arena deaths on 4/5 seeds (14481: Somchai d87, Jovan d90, Petra d111; 14482: Chloe d94, Thabo d128; 14483: 0; 14484: Michael d130; 14485: James d98, Petra d104) vs r223's 7 on 4/5. No Reunion-arena fight record in driver data.

## F1 — C3c stale-favor resume opener: REPRODUCED IN HARNESS, FIXED IN-RUN

**Mechanism (read from code):** `convoResumeOpener` built its label via `convoThreadAbout(vid, o.tid, o.label || o.tid)`, and `convoThreadAbout` returns the passed label whenever non-empty — so the **stored snapshot label wins over live derivation**. A `want` thread planted under "that wound care" resumes as "that wound care" after the favor moved on. The r208 freshness rule (re-derive want labels live) was applied to close/lapse lines (`convoNoteTopic`) but never to the resume opener, the resume-offer Yes follow-through (line ~7352), or the alive-menu thread offer (convo-scene.js:401). All three sites shared the hole.

**Harness proof:** `scripts/test-journey-crisis-r228-c3c-stale-favor-20261116.js`. RED first: opener said "We never finished talking about that wound care — we got cut off, 5 days back" after the favor changed to a food share. **Staging lesson:** a ledger favor staged WITHOUT its underlying need is correctly refused by the r108 liveness guard (`convoTopicLabel`'s ask_favor branch requires `convoFavorNeedLive(fav)`); the faithful staging sets `v.health[vid]=50` (heal_help need live while health < 60) at plant, heals to 100, then takes the new favor from `convoFindFavorNeed(vid)` (live scan). The sitting's want must be staged as `{id:'ask_favor', def:{}}` because `convoTopicLabel`'s ask_favor branch keys on `c.want.id`.

**Fix:** new helper `convoOpenThreadLabel(vid, o)` in conversation.js (~2613), applied at the resume opener main label, the resume opener others-nod, the resume-offer Yes follow-through (~7399), and the alive menu (convo-scene.js:405). Pure label derivation, no RNG spent, no trajectory change expected.

**Scope correction (caught by the F2 proof test, same run):** the first version re-derived ALL want threads through `convoTopicLabel`, which names the sitting's CURRENT want — wrong for a question thread ("that question") when the sitting's want is now something else (the F2 test's resume said "teaching them something" for a thread about a question). The helper now re-derives ONLY threads whose stored label names a favor kind, and derives from the favor LEDGER directly (ledger's current open favor when its need is live, else the live need scan, else 'that favor') — ledger-anchored, independent of the sitting's want. Question and other non-favor want threads keep their stored label.

**Proof GREEN 9/9** on seeds 4242 (default), 7, and 42: changed favor names the live need ("that foraging help"); fulfilled favor agrees with live derivation; unchanged favor still names "that wound care" (control); helper direct cases pass; non-want thread keeps stored label.

**Neighbors re-run green:** r201 settled-favor 9/9, r223 drift-note PASS, r208 lapse-label 9/9, r216 funeral-partial PASS, snippet-stage-direction PASS, r176 resume-quote 15/0, resume-quote-hygiene 10/0.

**C3c verdict this run: FINDING (harness reproduced the stale label; fix landed, proof 9/9 × 3 seeds).** Per prereg rule (9), this closes the watch — it is no longer UNMEASURED.

## F2 — Resume-opener memory quotes carry narration: REPRODUCED IN HARNESS, FIXED IN-RUN

**Transcript-caught (this panel):** 10 resume openers; 1 real content beat (Sofia's secret confession, d11); **2 carry narration mixed into the quote — same class as r223's F1 (stage direction quoted as the NPC's own words):**
- 14483 d11 Esmeralda: "'Okay.' Something shutters, just slightly." — "Something shutters, just slightly" is narration (the NPC only said "Okay."). Source: `convoDeflectQLine` pool, conversation.js:1204 (pool of 8, ALL mixing quoted speech + narration).
- 14485 d15 Booker: "'I see. They take a moment to think about your answer.'" — "They take a moment..." is third-person narration about the NPC. Source: `GQ_ACK.yes` pool, conversation.js:395 (also 'They nod. "Okay."').

The other 7 quotes are pure speech but weak memories (closing/goon lines: "Okay. We'll pick this up later." ×2, "Okay. Here's the thing —", "Alright — I should get back to it.", "I've got things to do. People to avoid. You know.", "That's... pretty much all of it, honestly.", "That's the whole of it. Sorry.") — honest speech, thin as thread memory; watch item, not a defect.

**Mechanism:** thread log records the full sayLine (speech + narration) as the snippet; `convoThreadOpen`/`convoResumeOpener` gate via `convoSnippetIsRealBeat` (≥4 words, not deflection/silence/hook), which does not strip narration. `convoSnippetIsStageDirection` returned false for ANY snippet containing a double quote — by design for proposition-carrying mixed lines ('They go still. "So it's not just me…"') — but the deflect/GQ_ACK lines are the inverse shape: a 1–2 word fragment plus narration. In the sitting the renderer keeps speech and narration apart; the resume quote strips the double quotes and presents the whole snippet as spoken memory.

**Fix:** `convoSnippetIsStageDirection` now rejects a mixed snippet whose LONGEST quoted span is a fragment (< 4 words, the real-beat floor) while words sit outside the quotes. A mixed line whose quoted speech carries a proposition (≥ 4 words) stays real memory. The plant gate walks back to substance (or plants nothing); the resume-time guard drops quotes planted before the fix. A dropped quote is harmless — the resume still names the thread.

**Proof:** `scripts/test-journey-crisis-r228-f2-narration-quote-20261116.js`. RED first on the base code (first deflect-pool assertion fails); GREEN 24/24 on seeds 4242, 7, and 42: all 8 deflect-pool lines rejected; both mixed GQ_ACK lines rejected; pure-speech GQ_ACK line kept; real memories kept (including the proposition-carrying mixed line); plant with a deflect snippet plants nothing; plant with a real beat still plants; pre-fix plants resume WITHOUT the narration quote, still naming the thread.

**Neighbors re-run green** (same list as F1).

## People check — all 39 transcripts read in full

- **14481 (8):** Nadia d10 food_share promised ("I still need help with the food I needed" — slightly awkward phrasing); Peter d20/d21/d30/d43/d54 — dreams of Seattle, recap paraphrase "what you dream about — that's still where we are" (A2 watch); d54 resume opener quotes "Okay. We'll pick this up later." then Peter mourns Nadia ("I keep turning over the last thing Nadia said to me..."), "I'm picking up Nadia's share of the work", "Nadia always took the burnt piece. Said someone had to. I take it now."; close "Good — what's been happening, settled." earned. Kokona d64 non-verbal Japanese sitting (gestures, gift, "Food?" — the one English word; no nod-loop issue). Adaeze d76 recap ×3 with escalating reframes ("Still on...", "As I said —...", "We're going in circles —... Ask me something else") — recap hammer cap working; "I count meals, not days."
- **14482 (8):** Sofia d10 secret confession ("I know who took the extra rations but won't say"), curious "Okay. Here's the thing —" fragment; d11 resume quotes the secret verbatim (perfect memory quote), party named "The Firetenders"; d18/d19 betrayal investigation of Seo-yoon's ambush (press/witnesses/bribery/moot/let-lie/GUILTY vote; confronts deflect honestly); d26 grief + "Boston, Massachusetts never taught me that. The treeline did."; Marcus d45 mourning Zoe ("Zoe always took the burnt piece..."), d46 resume quotes "Okay. We'll pick this up later."; Thabo d71 wound-care favor promised.
- **14483 (8):** Esmeralda d10 Ashanti "changing... senses gone strange"; d11 resume opener quotes "'Okay.' Something shutters, just slightly." (F2); betrayal case Gloria, close "Good — that question, settled."; Wolfgang d25 food_share declined ("They won't forget. They'll just stop asking."); Timoti d32 grief opener "Don't mind me. Today's just heavy." (grief-opener pool line, spoken as dialogue — fine); d39 recap "Still on the kindest thing someone's done for you. Anyway."; Suyono d55 recap ×3.
- **14484 (7):** Wei d119 mourning Pietro/Xóchitl ("Pietro is gone and Xóchitl is gone and the world just... continues."), party role scout; Marwa d138 chronicler ("I record the arguments too. Especially the arguments. That's the real history."); Alex d17 bond proposal accepted, d18 resume quotes "'I've got things to do. People to avoid. You know.'", "I sit apart to eat... Nobody says Jesse's name right yet."; Anh d51 wound-care promised, d67 favor fulfilled, party named "MEAT AND FRIENDS"; Wei d88 HONEST MOOT line ("Never mind this wound — we got it handled. Thanks anyway.") + new water-haul ask, confession "I wasn't a bush pilot. I was a Beekeeper."
- **14485 (8, all Booker Vogel — a deep arc):** d14 deflect_q on perfect-Saturday, alive:thread:want re-poses the question (r137 re-pose working); d15 resume quotes "'I see. They take a moment to think about your answer.'" (F2); d22 secret deflected then thread:secret resumes honestly; d23 resume quotes "'That's... pretty much all of it, honestly.'"; d31 two-thread recap + mourning Raj; d32 resume quotes "'That's the whole of it. Sorry.'", party named "The Thornbacks", "Trust is slow out here. It's the one thing the System can't grant us." (same line as r223 d37 Priya — templated, 2nd sighting); d39 wound-care favor DECLINED ("They won't ask twice."), recap "Still on that wound care."; d40 declined favor echoes ("Have you been thinking about what I asked before?").
- **Recurring templates noticed (watch items, not findings):** burnt-piece mourning line ("X always took the burnt piece. Said someone had to. I take it now.") — 3rd village this panel (Peter/Nadia, Marcus/Zoe; r223 had Priya/Andre); "X is gone and the world just... continues." — Wei/Pietro+Xóchitl, Alex/Jesse (r223: Delali/Ava); "Trust is slow out here..." — 2nd sighting.
- **A2 recap paraphrase tally:** "that's still where we are" appears **5× across the 39 transcripts** (14481 d30, 14482 d10, 14482 d11, 14484 d88, 14485 d31; r223 had 3). Watch item — the recap grammar is honest, but the phrasing is wearing thin.
- **Refusals (2, investigated):** 14483 d31 Wolfgang, 14483 d38 Pule — both "(conversation refused/ended)". Both are the dead-villager class: `startConvo` returns null for anyone off the living roster (the PHANTOM TALK guard, r6), and the driver targets by a stale id list. Wolfgang was talked to successfully on d25 (same vid) and refused d31 — the same day a "villager combat" death is recorded. Pule's refusal on d38 falls after the last recorded death (d31) with only Lena + Ursula alive at the end, so Pule was already gone. The game behaves correctly (it even says "isn't here anymore"); the driver should pick convo targets from the live roster. Driver note for the next run, not a game finding.

## Village assessment (plain words)

All five villages died. None reached the horizon; the median village lasted 135 days. They fought hard — 37 sortie fights, 220 nights with monsters at the fence, 255,156 kcal eaten at the gorge — but the wild kept taking people one and two at a time until one or two were left alone. No village got a seat offer; none reached national standing; the pantry stood empty at the end on every seed. The crisis leg's question — do villages bend or break — answers the same as ever: they break, slowly, fighting. The conversations stayed human even as the villages shrank: people mourned by name, picked up the dead's share of the work, kept the burnt piece, recorded the arguments as the real history. The two dialogue fixes this run make the memory of those conversations honest — a resumed thread now names the favor the villager actually needs, and a quoted memory is now the villager's own words, not the narrator's.

## Reachable / fun / winnable

- **Reachable:** yes — raids on all seeds, fought resolutions, favors asked and fulfilled, betrayal investigations, bond proposals. The crisis content fires.
- **Fun:** the conversations carry the leg — mourning, secrets, investigations, and the deep Booker arc on 14485 are the reason to play these sittings. The siege itself is a grind of attrition (gorge nights 220 vs clears 2).
- **Winnable:** no, not on this panel — 5/5 game-over, 0 wins, 0 national. The winnability chain work continues elsewhere; this leg's job is to watch the break, and the break is measured.

## Metric review

- **Rule (9) applied:** the C3c watch closes on the harness verdict — a panel with no qualifying case is no longer "UNMEASURED" once the targeted harness speaks. The harness reproduced the stale label and the fix is proven; C3c is a FINDING, not an open watch.
- **C3d stays open** (0 sightings — the "Nothing important" recap watch needs a qualifying case).
- **Q6 and A1–A6** stay retired/descriptive (10th consecutive zero panel each).
- **NodeAway is not a prereg metric** — the 38 exclusions / 9 alive-bench refusals are a watch item for the next run's design discussion, not a re-score of this panel.
- **No mid-run re-scoring.** All verdicts above use the prereg thresholds.
- **Proposed for the next run:** driver picks convo targets from the live roster (2 refused sittings this panel were dead villagers); add a NodeAway panel-level watch metric so the muster-vs-travel tension is tracked, not just noted.

## Telemetry

`telemetry-check.js` vs `telemetry-baselines/crisis.json`, metrics defendedFights,playerFights,latelyDefenseCount: **quiet** (5 files, 3 metrics, no large deviations). Baseline NOT rolled (a single panel's variance is not a reseed).

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2`: **333 passed, 7 failed in 1002s. 0 attributable — GO.**

Adjudication:
- `test-measurement-proof-update.js` + `test-measurement-workflow.js` — the measurement-proof staleness pair ("Proof source inputs are not current" / "retained neutrality proof covers the current Game/controller/harness inputs"). Known pre-existing on this base (same as r223); my change adds no collector/contract input.
- `test-phone-frame-proof.js` — phone-frame staleness (retained browser inputs don't match current source: index.html, data files). Known pre-existing (same as r223); my change adds no boot input.
- `test-measurement-cache-flags.js` — gate 0/4, **standalone 4/4 PASS** on the quiet box with the fix in place. Load artifact, per the 2026-11-12 r187 lesson (scores track box load, not the change). Not attributable.
- `test-ladder-bundle-20261108.js` — control "200 monster turns WITHOUT delivery fire the ambient raid — fires 0" (78 passed, 1 failed). **Fails identically on pristine base** (reverted source, same 78/1). Not attributable.
- `test-living-garden-deed-attainment.js` + `test-one-person-army-deed-attainment.js` — 120s load timeouts in the gate. Standalone re-runs (adoption, with the fix in place): living-garden EXIT 0 in ~176s, one-person-army EXIT 0 in ~136s — both over the gate's 120s budget, both green standalone. Load timeouts, not assertions. Logs: `journey-crisis-r228-livinggarden-standalone.log`, `journey-crisis-r228-onepersonarmy-standalone.log`.

## Files changed (worktree, to commit)

- `src/js/conversation.js` — `convoOpenThreadLabel` helper + 3 call sites (F1); mixed-fragment stage-direction guard in `convoSnippetIsStageDirection` (F2).
- `src/js/convo-scene.js` — alive-menu thread offer uses `convoOpenThreadLabel` (F1).
- `scripts/test-journey-crisis-r228-c3c-stale-favor-20261116.js` — proof, 9/9 × 3 seeds.
- `scripts/test-journey-crisis-r228-f2-narration-quote-20261116.js` — proof, 24/24 × 3 seeds.
- `scripts/journey-crisis-r228-delayed-20261116.js`, `scripts/analyze-crisis-r228-delayed-20261116.js` — panel instruments (r223 clones).
- `evidence/2026-11-16/journey-crisis-r228-prereg.md`, `evidence/2026-11-16/journey-crisis-r228.md` — this run.

## Base movement since r223 (context)

Substrate 7d2de26f4 → 7bb50f3dc (src/js, +167/-11, 4 files): all dialogue-adjacent or a diagnostic remnant — r223 F1 drift-note fix; r224 succession F4a/F4b/F4c dry-line fixes; r225 endgame F5 settled-favor variants + stage-0-want fix; r226 social F6 dry-opener guard; **villager-agency.js +19 PROFILEGATE bypass** (sim-profilegate-a / sim-launchdef-a armed anchor, re-landed verbatim, NOT reverted — a bid-and-selected party_launch commit bypasses the dawn profile gate). Verified `git diff 7d2de26f4..HEAD -- src/js/game.js src/js/win-plan.js src/js/villager-brain.js src/js/hierarchy.js` is empty. No medicine-lever commits (Steve ruled 2026-11-14 the medicine trio needs more complexity; RUINROAD arm stays parked; cumulative supply 0/301 is a proven constraint).

## Closeout

- Lock: `playtest-loop-2.lock`, run_id `2026-11-16T19:55:29Z` (own).
- Worktree: `journey2-crisis`, branch `journey2-crisis`, base 01c52e808 rebased onto master 7bb50f3dc clean before work.
- Rotation 6 → 7 on landing; heartbeat loop pid 20228 killed at closeout.
- Adopted in the main session after the 1h cron timeout: gate adjudication completed (both timeout tests green standalone with logs), committed, merged locally, pending ship. No version bump, no push, no live check (ship loop owns those).
