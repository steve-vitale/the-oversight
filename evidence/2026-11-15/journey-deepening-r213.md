# journey-deepening r213 — deepening leg (days 40–80), Lane A — RUN NOTE

- **Run:** `playtest-loop-a-20261115T1045CST`, Sun 2026-11-15 10:45 CST. Run id `loop-a-20261115-1656`. **Adopted** by the 12:45 CST occurrence after the 10:45 run timed out (7200s): panel, analyzer, telemetry and gate were complete; only the run note was unfinished. Orphan heartbeat loop killed; no live processes; the heartbeat at adoption was orphan-written (18:54:51Z), not a live coordinator.
- **Leg:** 2 — deepening. Rotation read `2` at start; still `2` when the adopting run picked it up (the timed-out run never advanced it); advanced 2→3 at closeout by the adopting run (read-back verified).
- **Policy:** competent. Seeds: fresh **100111–100118** (8-seed panel, DAYCAP 100, CONVO_DAYS [45, 60, 80]).
- **Base:** local master `493b82c6c`. Branch `journey-deepening`, worktree `~/workspace/worktrees/journey-deepening`.
- **Commits this run:** prereg `eb4657288`, Amendment A1 `f4a9620c4`, count correction `30e810c15`, instruments `54e454fc1` (analyzer proof 20/20 green; red control fails exactly as pre-registered), Amendment A2 `28cb45304` (analysis-time instrument correction — see below), plus the run note committed by the adopting occurrence (rebased onto master `5453f710e`; rebase stop-at-pick quirk struck once at pick 2, recovered per the documented rule). Instruments + evidence only; **no `src/js` change this run.**
- **Merged locally, pending ship** (ship loop owns version bump, push, live verification).

## Short version (plain words)

Eight villages, all eight alive at day 100 — the second 8-for-8 panel in a row. They are healthy but stuck one step earlier than last time: seven reached the fourth wave of monsters, none reached the fifth, and across all eight villages they killed only **one** fourth-wave monster between them (last panel: eleven). The door to the fifth wave never opened because it opens when a village banks two fourth-wave kills, and nobody banked any. The only game-code change since last panel is a guard that stops lurking monsters from walking up to the scholar and starting a fight they always win — it may be the cause, or it may be bad luck across eight villages; the run does not claim either, and the next step is a head-to-head test with the guard on and off on the same villages.

The people are the bright spot. Conversations read like real people: a paramedic asks for help hauling creek water, a dockworker grieving a loss shares a quiet "me too", a line cook admits she can't set a meeting time because she's out on the road. Two old wrinkles came back: the same creek-water errand gets asked over and over by different villagers while promises to do it quietly expire, and the menu still labels friendly offers — a village-link proposal, a walk together — as "betrayal: accept". Two villages never got a single monster-meat dinner on the table despite killing plenty — the step where someone works out whether the meat is safe to eat never happened there. And the parting-words check I planned could not be read at all: the tool that writes down conversations never records the goodbye lines, so that question stays open for the next run.

## Q1 (PRIMARY) — third-branch decision rule — VERDICTS

The rule works as designed. It fired on exactly one block and stayed quiet on the other two:

- **FAVORBLOCK: VARIED → WATCH-CLEAR.** total=18, 4 distinct lines, biggest single line 6/18 (share 0.33). The dominant line ("You need to be right next to them, same side of the Haven door, to help.") fired in 6 sittings across 6 seeds, once each. The watch closes.
- **PARTNERBLOCK: VARIED → WATCH-CLEAR.** total=19, 4 distinct, biggest 7/19 (share 0.37), 7 sittings across 5 seeds, once each. The r212 beside-dominance (7/11) is gone; the line that dominates now is "rightnext". The watch closes.
- **AWAY: WATCH-CONTINUES.** total=12, 3 distinct, "out on the road" line 6/12 (share 0.50) in 6 sittings across 6 seeds, once each — the third branch fired on real panel data for the first time. Detail rows: 100111 day 54 Miguel, 100113 day 48, 100114 day 16, 100115 day 79, 100116 day 80, 100117 day 80 Rosa. The line is used sensibly in context (Rosa agrees to the favor in principle, then says she can't pin a dawn meeting while she's traveling). Carried as a variant-pool watch, no fix.
- **Caveat honored:** the branch is a spread-vs-stuck proxy, not proof of no shared trigger. The favor-block lines still all come through the one `dlg:favor_requirements` menu path, and the block line itself is written in flat instruction-manual voice ("You need to be right next to your partner…") — it breaks character every time it fires. That voicing, not the repetition, is the remaining defect shape. Double-ask: 0/123 sittings (seventh clean panel in a row by the r212 count; the analyzer's RE-ASK-ORPHAN lines are the water-haul re-ask, a different thing — see wrinkles).

## Q2 — wave-5 killing DIAG read — UNMEASURED (vacuous) + LOUD NEW FINDING

- **Verdict: UNMEASURED.** `Q2-WAVE5 PANEL: unlocked=0 neverFaced=0 facedNotKilled=0 killed=0` — all 8 seeds `LOCKED`, 0 errors. There is no class split to read, so this panel neither confirms nor refutes the wave5kill-b blocker (half of unlocked villages facing the fifth wave without killing anything). The 100-day deepening horizon is too short to read fifth-wave killing when the door does not open; the read belongs on a longer horizon or the scale leg.
- **LOUD FINDING (not a pre-registered verdict): the binding link moved one step earlier — villages cannot kill fourth-wave monsters.** `wildFightTable` fourth-wave fights 72→26 and kills 11→1 vs r212; village-kills of fourth-wave monsters at the last snapshot 6→0. The three r212 villages that reached wave 5 are exactly the three with 2 village fourth-wave kills each — the door opens at 2, and nobody here banked any. The only game-code change since r212's base is the gorgeprice2 lingerer guard (`dc8cbd3f3`, +16 lines in `game.js`: a lingering raider no longer steps onto the scholar and starts a solo fight it always wins) plus the r214 dialogue-only parting pool. The guard's stated purpose (stop unfair solo deaths) vs the observed side effect (far fewer fourth-wave fights and kills, fifth-wave door never opens) is a real tension, but eight seeds and rare kill events cannot prove causation. **Follow-up owed: a discriminating head-to-head — same seeds, guard on vs off — before anyone touches the guard.** No game change in this run.
- Scholar share of wave-5 fights: unmeasurable (no wave-5 fights exist). The prereg's dropped confirmation condition (scholar in 0 wave-5 fights) stays dropped.

## Q4 — plain-parting pool (first deepening panel on the fixed code) — UNMEASURED (instrument error)

- **Amendment A2 (committed before any verdict):** `summarizeParting` measures the `closing line:` field, which is the exit line `endConvo` returns — not the mood goodbye. The goodbye is a separate line spoken inside `endConvo` (`conversation.js:8221`) that the conversation-writing tool never records: it logs only each turn's spoken line plus the closing line, and uses the full transcript only to check for repeated lines. Verified: 0 plain-pool and 0 warm/cold-pool lines in all 123 r213 transcripts **and** 0 in the r213/r214 establishment transcripts that ran on the fixed code. **Q4 verdict: UNMEASURED via this driver.** The r214 unit proof (10/10) stands as the fix evidence; no panel verdict for or against the pool is drawn.
- The NO-CLOSE count is a separate, comparable read: 27/123 sittings end with no closing line vs r212's 19/103 by the same measure — no regression. The full-transcript reads show why it is not alarming: the sittings end on the character's own last line (Scott withdrawing to be quiet; Rafael's abrupt "Moving! But — good talk! More later!"), which reads as a close.
- **Follow-up for r215:** the driver must record the winddown spoken lines (the transcript's own them-lines at `endConvo`) before Q4 can be read on a panel.

## Q3 — carried-wrinkle sweep

| Wrinkle | This panel | Verdict |
|---|---|---|
| Water-haul template (same creek-water errand, asked and re-asked) | "creek water run" 13× across 6 seeds; re-asked on days 45–80 by different villagers; promises made at dawn and quietly dropped (Scott day 60: "You said you'd help with the creek water run. …It's done now. Forget it.") | **CONFIRMED** (4th panel) |
| Teach-loop same-pick | Teach frames 24 across 11 sittings, 4 distinct, max same-frame 2 → VARIED; r212's 7-in-one-sitting shape absent | Not reconfirmed |
| Betrayal:accept label on benign offers | 17 of 32 betrayal sittings accept; the label is offered next to friendly village-link proposals and walks ("All right. Let's go." → Rafael shows you his thinking place; Miguel hands you a tool he made) | **CONFIRMED** |
| Meat-dinner (0 dinners = confirmed) | Dinners 18, 14, **0, 0**, 3, 8, 2, 11. Villages 100113 (17 kills) and 100114 (18 kills) ate **0** monster-meat dinners — and both have **0 reveals**: the step where someone works out whether the meat is safe never happened there | **CONFIRMED** (r193's 0-dinner case recurs, worse than r212's thin end of 1) |
| "(ended by engine)" closes | 0 literal lines in both r212 and r213 transcripts | Not reconfirmed |
| Recap paraphrase "that's still where we are" | 0 | Not reconfirmed |
| Secret-template verbatim repeat | Secret never opens (openers=0 in 124 sittings), so no template can repeat | Not reconfirmed |
| Dry-line curious-path | No secret answers (answered=0), so the curious path's dry line cannot be judged | Not reconfirmable |
| Knowledge-goal thin engagement | Knowledge tops=1 panel-wide (r212: 2); goal-lines knowledge 0–1 per village; `knowledge` tops 0 on 5 of 8 seeds | **CONFIRMED** (3rd panel) |

## Q5 (read-only carries)

- **LADDER:** 8/8 opens, 8/8 hold stage 3, all five tracks minted on all 8 seeds, first days all 14. **REACHED.**
- **REQUESTS:** staged 79, decided 58, expired 21 (7 expired while talkable and untalked). **REACHED** with the talkability caveat carried.
- **LANGGATE:** NOT-REPRODUCED (72 offers, 58 decisions, 0 none). **LANGARC:** ARC-FLIPS-NO-PAYOFF (3 flips, 0 post-flip decisions).
- **SECRET:** SILENT (0 openers, 0 addressing, 0 teach picks, 0 wants established) — the secret path stays quiet on this leg. **WANT:** NO-ANSWERS (0 established). **VARIETY:** THIN-PROBE. **POSTSECRET:** NO-ANSWERS (dryFirst=0).
- **TEACHFRAME:** VARIED (24 frames, 4 distinct, max same 2). **PLACEFRAME:** VARIED (24 frames, 4 distinct, max same 1). **PLACEPROBE:** bottleneck=FIRES (124 sittings, only 12 with places).
- **SECRETPROBE:** QUIET-PATH (eligible 61, branch reached 7, fired 0, shared-end 27). **SOFTWARM:** 0 softens. **GUARDLINES:** 10 total, spread across 5 lines.
- **GOALJOIN:** party_up tops 56, food_security 52, bonds 36, build_standing 15, safety 13, knowledge 1, bank_veterans 0, gear_up 0 — all HEALTHY; knowledge stays the thin track.
- **TRUST:** CARRIED (r119 verdict stands; deaths=24, stranger gains 0, known gains 39). **REPLAY:** NOT-REPRODUCED (0 replays in ~58 decision sittings). **CISTERN:** CLEAN (0 bad liters).
- **B-SIT:** 32 betrayal sittings, accept 17 / decline 15 / unanswered 0. **P-KEEP:** promises named and kept in view (Scott's creek run named at day 60 as expired; Rosa's re-ask tracked).

## Village assessment — census in plain words

All eight villages survived to day 99–102. Seven reached wave 4, one (100114) only wave 3. Standing 100–362 (r212's best was 577 — this panel is weaker); three villages reached global scale (100112, 100116, 100118), five stayed regional. Diplomacy points appear for the first time on this leg (170, 102, 34 on three seeds; r212 had 0 everywhere) and links exist on three seeds (5, 3, 1). Deaths 452 total (r212: 509) — fewer deaths, but also far fewer kills: the villages are surviving by enduring, not by winning fights.

- **100111 — survived day 100, 8 alive, wave 4, regional.** Standing 225, war-only, 0 links, 0 feasts. 40 kills, 16 reveals, 18 dinners — the best-fed village on the panel. The water-haul ask opens day 45 and is still being re-asked at day 62.
- **100112 — survived day 101, 10 alive, wave 4, global.** Standing 340, the panel's second-best; diplomacy 170, 5 links, 1 feast. The most connected village — the only one with five links.
- **100113 — survived day 99, 8 alive, wave 4, regional.** Standing 230, 4 feasts but **0 monster-meat dinners** (17 kills, 0 reveals — nobody ever worked out whether the meat was safe). The panel's only fourth-wave kill.
- **100114 — survived day 101, 4 alive, wave 3, regional.** Standing 220, the thinnest village; only 4 people left and it never reached wave 4. **0 dinners** (18 kills, 0 reveals). Surviving on a knife's edge.
- **100115 — survived day 101, 9 alive, wave 4, regional.** Standing 100 — the weakest standing on the panel; 0 links, 0 feasts, 3 dinners. Alive but going nowhere.
- **100116 — survived day 102, 7 alive, wave 4, global.** Standing 362 — the panel's best; diplomacy 102, 3 links, 3 feasts, 8 dinners. The most complete village.
- **100117 — survived day 101, 4 alive, wave 4, regional.** Standing 190, 0 links, 2 feasts, 2 dinners. Four people holding wave 4 — brave, fragile.
- **100118 — survived day 101, 7 alive, wave 4, global.** Standing 259, diplomacy 34, 1 link, 5 feasts, 11 dinners. Well-fed, middling standing.

What the villages know: moot-event knowledge dominates everywhere (5–32 counts); experiment knowledge 3–11; trader-deep knowledge 0–6. Nobody is starving for facts about the moot; the thin knowledge is everything else.

## People check (full transcripts read)

Four sittings read end to end. The villagers act like people — the conversations have wants, consequences, and character.

- **Scott, day 45 (100111):** asks for help hauling creek water — specific, urgent (7 liters). The player commits for dawn. Then a second ask (walk the trap line), declined, and Scott withdraws: "I need to go be quiet for a while." Withdrawn temperament showing, not a menu.
- **Miguel, day 62 (100111):** proposes linking with Stonebridge; the player accepts through the mislabeled "betrayal:accept" and Miguel hands over a tool he made — warmth, not betrayal. Then the creek-water re-ask ("I still haven't found anyone. Any chance?") — the same need, 17 days later, still unmet.
- **Rosa, day 80 (100117):** re-asks the creek run, the player commits, and Rosa answers with the away line — she's out on the road, catch her when she's back. Then a walk to the tree line: "It's quiet at the tree line. Rosa doesn't say much. Sometimes that's the whole point." Closes in-voice: "See you at the fire."
- **Rafael, day 19 (100111):** shows the player his thinking place ("Don't tell the others. Everyone needs one place."), then the grief exchange — "Did you leave someone behind? …Sorry. You don't have to answer that." / "Yes." / "Yeah. A long quiet. 'Me too.'" — and a real boundary: "I don't talk about that. Not because it's secret — because saying it out loud makes it real in a way I can't afford yet. Someday. Not today."

**People-check verdict: PASS.** The defects are structural (labels, engine-voice gate lines, the unresolving errand), not tonal.

## Blanks filled / documented

- **Filled:** the third branch now has real panel data (AWAY fired it; FAVOR/PARTNER did not need it). The Q4 instrument error is documented with the exact mechanism and the r215 fix. The meat-dinner 0-case is re-established with its mechanism (0 reveals).
- **Documented, not fixed (no `src/js` change this run):** the betrayal-label misnomer; the engine-voice favor-block lines; the water-haul errand that never resolves; the wave-4 kill collapse and its guard-on/off follow-up; knowledge-goal thinness (3rd panel).

## Reachable / fun / winnable

- **Reachable:** the deepening content is reached (8/8 survive, 7/8 wave 4, ladder stage 3 holds everywhere, links and diplomacy appear). **Yes.**
- **Fun:** the conversations are the fun — the people feel real and the wants matter. The fights are the dull part this panel: villages face wave 4 and almost never kill anything, so the middle of the leg is a long endurance slog rather than a climb. **Mixed — people yes, fights no.**
- **Winnable:** no village is on a path to a win from here — none reached wave 5, none banked the two fourth-wave kills the door needs, and the strongest standing (362) is far below r212's 577. The winnability chain is blocked one link earlier than wave5kill-b named. **Not from this panel's position — the block is wave-4 killing.**

## Metric review

- The third branch worked as designed on live data (Q1a answered: AWAY fired it; the stuck-shape control (16) still reads REPETITIVE in proof). No metric change proposed for Q1.
- **Q2's metric is horizon-bound:** the wave-5 class split cannot be read on a 100-day leg when the door does not open. Proposal for the next run: read Q2 on the scale leg (140d) or a 150d horizon, and add a wave-4-kills panel line (fights/kills by wave 4) to the deepening read — the telemetry baseline's four metrics (w3fights, engaged.w3, fightsTotal, fightsByWave.3) do not cover wave-4 kills, which is why telemetry read QUIET while the kill collapse stood beside it.
- **Q4's instrument is broken by construction** (A2a): the driver must log winddown spoken lines before the next deepening panel, or Q4 stays UNMEASURED. Proof (21) still passes on synthetic transcripts; the failure is the driver's dump, not the analyzer.
- Q3's sharpened meat-dinner bar (0 = confirmed) fired correctly. The teach-loop bar stays as written; the loop did not recur.
- No metric was re-scored mid-run. The two UNMEASURED verdicts are instrument/population limits, recorded here, not re-judged.

## Telemetry

`node scripts/telemetry-check.js --baseline <deepening r192> --current 'journey-deepening-r213-seed*.json' --metrics w3fights,engaged.w3,fightsTotal,fightsByWave.3` → **QUIET** (8 files, 4 metrics, no large deviations). No baseline roll. (Caveat in metric review: these metrics do not cover wave-4 kills.)

## Gate

`node scripts/check.js --quick` (re-run 18:49Z, in the worktree, 623s): **333 passed, 7 failed — GO after adjudication, 0 attributable to this run** (this run changed no `src/js`: instruments + evidence only).

- 5 known/pre-existing, same class as r214's adjudicated set: `test-measurement-proof-update.js` (proof source inputs not current), `test-measurement-workflow.js`, `test-phone-frame-proof.js` (fails identically on pristine code), `test-living-garden-deed-attainment.js` + `test-one-person-army-deed-attainment.js` (both 120s timeouts; pass with `--timeout 600` per r214).
- 2 new, both substrate-attributable (present on the base, not introduced by this run):
  - `test-ladder-bundle-20261108.js` — control "200 monster turns WITHOUT delivery fire the ambient raid" fires 0 (78 passed, 1 failed). Mechanism: the gorgeprice2 lingerer guard stops lingering raiders from stepping onto the scholar, so the ambient raid never triggers — the same suppression as this panel's wave-4 kill collapse, read on a unit test. A guard-side-effect signal, not a defect in this run's code.
  - `test-person-trust-20261108.js` — "non-aimed errands within ±25% of prereg baseline — HAUL:3 vs 0" (18 passed, 1 failed). Correlational drift: HAUL errands appear where the prereg baseline had 0. Consistent with the known RNG-stream shift from r214's parting-pool draw (1 draw per sitting close, proven in sim-guardablate-a), not a behavior this run changed.
- Standalone re-runs on the rebased branch (adopting occurrence, master `5453f710e`): both fail identically to the gate log (ladder-bundle 78/1, same control; person-trust HAUL:3 vs 0, same PANEL) — confirmed substrate, not branch-introduced. Analyzer proof re-run on the rebased branch: 20/20 green. Telemetry re-run: QUIET (8 files, 4 metrics).

## Carries to the next run

1. **Wave-4 kill A/B** (guard on vs off, same seeds) — the follow-up to this panel's LOUD finding. Do not touch the lingerer guard before it.
2. **Q4 driver fix** — log winddown spoken lines (`c2.transcript` them-lines at `endConvo`) so the parting pool is observable on a panel.
3. **AWAY watch continues** (outroad 6/12, spread across 6 seeds) — variant-pool watch, no fix.
4. **Wrinkles confirmed:** water-haul template (4th panel), betrayal:accept label, meat-dinner 0-cases (100113, 100114 — check the reveal step), knowledge-goal thinness (3rd panel).
5. **Q2 read moves** to a longer horizon (scale leg / 150d) — the 100d deepening leg cannot read wave-5 killing when the door stays shut.
6. **Rotation:** advanced 2→3 (next run plays scale). Lane B untouched.
