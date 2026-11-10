# journey-deepening r124 — WANT-AFTER-SECRET (Lane A, leg 2 deepening)

- **Run:** Lane A `oversight-playtest-loop`, run r124, leg 2 **deepening** (days 40–80, DAYCAP=100, death-aware stop). Scheduled Mon 2026-11-09 19:45 CST (2026-11-10 01:45 UTC).
- **Rotation-a:** read `2` at run start; advance **2→3** after landing. Never touched `journey-rotation-b.txt` or `journey-rotation.txt`.
- **Base:** local master `74debf969` (Loop B 2330Z round: foodrung, standaccum, midfifth, vetfinish; gate 296/4 standing). Branch `journey-deepening`, worktree `~/workspace/worktrees/journey-deepening`.
- **Lock:** `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/playtest-loop.lock`, run_id `2026-11-10T01:43:39Z` (created by this run; no prior lock existed). **Delete at end, re-reading it first.**
- **Heartbeat loop:** PID 46562, 10-min cadence — script `~/workspace/worktrees/journey-deepening-hbloop-r124.sh`.
- **Pre-flight (done):** main tree clean, disk 33%, `worktree-reap.sh` ran (removed nothing; LOUD dirty trees belong to other owners, never auto-removed).
- **Origin divergence (standing, unresolved):** local master ahead ~318 / behind 156 vs origin/master (origin tip `a628aeaf3`, PR #121). No reconciliation, no merge of origin/master, no push — the ship loop / main session owns it. Steve's reconciliation direction awaited since 2026-11-08 ~15:25 CST; **do NOT re-ping**. Work is based on local master only.

## Pre-registration

- **Leg question (Q1, PRIMARY) — WANT-AFTER-SECRET:** after a confession is answered (r122 follow-up now in the engine), does the villager's underlying want (`seek_taken`/`ask_favor`) surface — established (want resolution leaves `none`/`unestablished`) or voiced in a post-answer line?
  - **Verdicts:** SURFACES if ≥50% of answered secret sittings establish; STAYS-BURIED if 0 of ≥2 answered; MIXED otherwise; THIN-PROBE if <2 secret sittings fire.
  - **Background (r122):** WANT-OPEN 2/2 in both panels; the want never surfaced.
- **Q2 (SECONDARY) — CONFRONT-ON-SECRET:** the secret menu also offers a `confront:d_*` option alongside the secret answers (seen in both r122 secret transcripts, unjudged). Wild count (`confrontRides` / secret sittings) + forced probe.
  - **Verdicts:** SECRET-SURVIVES / SECRET-DIES / UNREACHED.
- **Q3 (carried, read-only):** LADDER (opens/mints/holds), SURV-CONTROL-4 (first four ≥2/4), regression watches (langGate 0 'none', replay 0, menuFlip 0, goalLine capture >0, V-INIT, D-THING, RAJ-PHOTO), Q2-TRUST watch (stranger gains + terminal-death clustering — design call stays with the main session), all-tracks read.
- **Instrument:** `POSTSECRET_STEMS` widened with `'night'` (matches "nights are still long") and `'keep'` (matches "I still keep it to myself" / "I still keep the photo") — r122 metric-review proposal; the old stems matched the secret TEXT, not the follow-up lines the instrument reads. Analyzer-only change.
- **Seeds:** fresh 44001–44008; smoke 44000. Freshness verified by the full check: 0 word-boundary .md mentions in evidence/ + docs/, 0 scripts, 0 filenames, 0 prereg hits, 0 seed-context patterns (`s4400x`, `seed 4400x`), 0 live processes. The two apparent hits are false positives: a case-cache hash filename containing `44004` (`68b33d2344004f36f...json`, not a seed file) and a pantry quantity `44000` in scripts/test-inflow-b.js (a value, not a seed). Rejected bands in the search, all used: 92101–92108 (r104), 92401 (r106), 92601 (r107), 92501/92701 (r110), 95001–95008 (ragerepress), 95101–95116 (cookbulk), 97101/97201 (heraldcontact), 97405 (heralddepart), 98601–98616 (hurthome-fix-c), 98000–98099 (mealday/doublenight). **Amendment A1 expands the panel to 16 seeds: +44009–44016, verified fresh by the same full check (0 prereg hits, 0 .md mentions).**
- **Policies:** competent (LISTEN). CONVO_DAYS [45, 60, 80].
- **Mechanism (verified in source before the panel):** the secret menu itself offers only the five `secret:` answers + leave (`src/js/conversation.js` secret branch). `finalizeMenu` drops the cruel `secret:deflect` at trust ≥35. `truth.js` wraps `convoChoices` and appends `confront:<doubtId>` before `leave` on ANY menu whenever the player holds an open doubt — the secret menu is no exception. A gossip lead planted in the engine's own shape (evidence carrying "haven't heard their own story yet", field with no live lie) resolves deterministically as `cleared` (tentative, no RNG roll, no accuser cost); the RNG confess/deflect/attack roll only runs when a live lie matches. `convoDropUnspoken` does NOT touch `c.thread` or `c.secretAnswered` — only clears `secretFollowup` (not yet armed) and held beats. R122 evidence: Ivan (seed 92002, day 60, literacy secret) — want `seek_taken` stage 0 at sitting start → stage 3/unestablished at end; `confront:d_so5hy67` rode every menu in the sitting.
- **Tooling (forked from r122, committed):** driver `scripts/journey-deepening-r124-20261109.js` (seeds default 44001–44008; secret record gains `wantStart`, `secretMenu`, `confrontOnSecretMenu`); analyzer `scripts/analyze-journey-deepening-r124-20261109.js` (new `summarizeWantAfterSecret`, `summarizeSecret` counts `confrontRides`, stems widened, new panel lines `Q1-WANT PANEL` and `Q2-CONFRONT PANEL`); proof tests `scripts/test-journey-deepening-r124-analyzer-20261109.js` (28/28) and `scripts/test-journey-deepening-r124-confront-secret-20261109.js` (14/14, run 3× deterministic). RED verified: with the r122 analyzer the proof passes cases (1)–(17) then crashes at case (18) with `TypeError: A.summarizeWantAfterSecret is not a function`. No-regression checks green: r122 postsecret test 31/31; r120 secret-response test 35/35. Zero src/js changes at that point. Commit `8ceb20a8a` (5 files, +4361 lines). Index clobber struck the commit; repaired via the documented pipe; status empty, diff HEAD empty, commit verified correct.

## Amendment A1 — panel expansion 8 → 16 seeds (recorded before judging, 2026-11-10 ~02:40Z)

The 8-seed panel drew SECRET-SILENT (0 openers in 52 convo-day openings; r122 drew 2/49 on the same denominator). The phenomenon is rare (~4% per opening: the secret hook's 20% roll only fires when no want/grief/question claims the opening first) and this panel drew the ~11% blank. The primary question (Q1) cannot be judged on 0 sittings, so the panel expands to 16 seeds with fresh band 44009–44016 (verified fresh by the same full check). This is a panel-size change recorded before any verdict is drawn, not a re-score: the 8-seed blank stays reported as-is, and Q1/Q2 verdicts will be judged on the full 16-seed panel. If the expansion still yields <2 answered secrets, Q1 stays THIN-PROBE/NO-ANSWERS.

## Panel verdicts (16-seed panel, before fix)

- **Panel survival:** 13/16 survived (44001–44007 except 44008; 44009–44015 except 44011, 44016). First four 4/4 (SURV-CONTROL-4 PASS). Losses: 44008 village-lost d95 (pop 0/0), 44011 village-lost d82 (pop 10/10 — not depopulation; the scholar/village was lost with people still standing), 44016 village-lost d68 (pop 0/0). Waves reached: 5 seeds hit wave 5 (44004, 44005, 44012, 44013, 44014).
- **Q1-SECRET PANEL: openers=6 addressingPicked=6 teachPicks=3 wantEstablished=0 teachCrowdedSittings=0 wantOpenSittings=6 → SECRET-HOLDS + WANT-OPEN.** The secret fired 6 times, all 6 with a want open at sitting start.
- **Q1-WANT PANEL: answered=6 established=0 newlyEstablished=0 → STAYS-BURIED.** The primary verdict before the fix: 6 answered secrets, 0 established the want.
- **Q2-CONFRONT PANEL: secretMenus=6 confrontRides=3.** Confront rode half the wild secret menus; never picked by the bot in the wild.
- **Q2-POSTSECRET PANEL: answered=6 medianPostAnswerTurns=2.5 dryFirst=0 referencing=3 dryRate=0.00 refRate=0.50 → POST-SECRET-MIXED.** The r122 follow-up arms and fires (half the follow-up lines reference the secret); the other half the sitting moves on.
- **Q1-LADDER PANEL: opens=17 late=0 silent=0 broken=0 mintedTracks=5/5 mintedPerTrack={fight:17,forage:17,craft:17,talk:17,explore:17} holds=14/17 → LADDER-OPENS + LADDER-MINTS + LADDER-HOLDS.**
- **Q2-TRUST PANEL: deaths=93 strangerGains=1 strangerTotal=10 lateGains=1 knownGains=172 nonDeathMoves=1274 deadBearerDays=2 latencyMax=1 → CARRIED** (computed=TRUST-PAID-TO-STRANGERS; r119 verdict stands, no new trust verdict this run).
- **Regression watches:** LANGGATE NOT-REPRODUCED (0 'none' in 125 offers / 104 decisions); REPLAY 0; BLOCKED-AGREEMENT all seeds badBlocked=0 badRevisit=0; Q1-REQUESTS REACHED (131 staged, 104 decided, 26 expired, 11 talkable-untalked); B-SIT 69 betrayal sittings (accept 40 / decline 29, unanswered 0); D-THING pocketed=29 testable=10 mentioned=3 old-rule=4; RAJ-PHOTO plants=2 testable=1 returned=0.
- **PANEL VERDICTS: {"EXPLAINED":17}** — all 17 files (16 panel + smoke) explained.

### The six secret sittings (all read in full)

| Seed | Day | Villager | Secret | Want at start | Answer | Want at end |
|---|---|---|---|---|---|---|
| 44009 | 60 | Linda (police officer, sardonic, trust 92) | can't swim | seek_taken | promise | stage 3 / unestablished |
| 44010 | 60 | Lucas (police officer, steady, trust 90) | hiding an injury | repay | promise | stage 3 / unestablished |
| 44011 | 60 | Jaxon (pottery instructor, steady, trust 100) | can't swim | repay | promise (after betrayal:accept) | stage 3 / unestablished |
| 44013 | 45 | Anthony (social worker, warm, trust 90) | saw something in the woods | ask_favor | promise | stage 3 / unestablished |
| 44013 | 85 | Valeria (pottery instructor, steady, trust 99) | froze when it mattered | pocketed | comfort (after link:decline) | stage 3 / unestablished |
| 44014 | 60 | Jordan (carpenter, fidgety, trust 100) | stole medicine | ask_favor | promise (after betrayal:decline) | stage 3 / unestablished |

In none of the 6 does the villager voice the want in a post-answer line — not even a mention. The follow-up machinery works (the promise/comfort answers each arm a follow-up line, and the secret-specific second lines land in 3/6: Lucas's shame line, Linda's and Jaxon's swimming lines, Valeria's "I still think about it every day"), but the want never follows the confession. The sharpest case is Linda: her want is seek_taken — her taken kin — the heavier thing, and it stays buried while the lighter secret (can't swim) gets the airtime. Confront rode the menu in 3/6 (Anthony, Linda, Jordan) and was never picked. Betrayal branches fired first in 3/6 (Linda decline, Jaxon accept — Jaxon taught slope-reading on the way — Jordan decline).

### Q2 forced probe (already judged, before the panel)

**SECRET-SURVIVES.** Confront rides the secret menu; picking it clears the gossip lead ("Marisol blinks, then groans. 'Oh, that's my fault, I worded that terribly...'"); the sitting continues (`ended === false`); the secret is NOT marked answered; thread stays `'secret'`; the next menu offers the secret answers again; the promise then resolves normally and arms the follow-up. Control: with no open doubt, no `confront:` rides the menu.

### Mechanism of STAYS-BURIED (found by probe)

The want only owns the OPENING, and the secret took the opening. After a secret answer, `buildMenu` only lets `convoWhatsAlive` items ride when `choosingSubject` is true — the sitting is in the beat-matrix flow, so the want item never reaches the menu (probe: `convoWhatsAlive` returns `[alive:want:curious]` while the post-answer menu is `[goon, dlg:more, dlg:react, teach, dlg:subject, leave, silence]`). Second cause: the WANT_Q map in `convo-scene.js` lacks seek_taken / seek_comfort / pocketed / warn_you — those wants could never be menu-offered at all (only via the opening); 2 of the 6 secret wants were seek_taken / pocketed. The driver had the same gap: ENGAGE lacked seek_taken / repay / pocketed, so the bot would never have engaged them even when offered (Heidi 44007 d45: `alive:want:repay` offered, bot picked gossip).

## Amendment A2 — want-after-secret fix (recorded before the after-panel, 2026-11-10 ~03:10Z)

Fix (`src/js/conversation.js` + `src/js/convo-scene.js`, commit `6fa3ecde`): answering a secret (not deflect) arms `c.wantAfterSecret` when an open want exists; `buildMenu` then leads the post-answer menu with the want item (beat-menu prelude + alive block, want first so it can't be crowded out); the flag clears when the want is picked or the sitting ends — never on an unrelated pick, so the want stays live for the rest of the sitting (unlike `secretFollowup`, a single line tied to the immediate moment); the menu cache key includes the flag; WANT_Q gains seek_taken / seek_comfort / pocketed / warn_you labels. Driver-only change (same commit): ENGAGE gains `alive:want:seek_taken` / `repay` / `pocketed` — the competent player engages an offered want. Proof test `scripts/test-journey-deepening-r124-want-after-secret-20261109.js`: RED 13 passed / 9 failed pre-fix (exactly the fix's cases), GREEN 22/22 post-fix; r122 postsecret 31/31, r120 secret-response 35/35, r124 analyzer proof 28/28 unchanged. After-panel scope: the 5 secret-bearing seeds (44009, 44010, 44011, 44013, 44014), re-run on the fixed engine; before-panel evidence snapshotted to `hidden_files/evidence/2026-11-09-r124-before-fix/` (218 files: 17 JSONs + 201 transcripts) before the re-run. The other 11 seeds are unchanged by the fix except the WANT_Q addition (new menu items on subject menus) — full-16 after-panel owed only if the main session wants it.

## After-panel verdicts (5 secret seeds, fixed engine)

- **Q1-WANT PANEL: answered=6 established=5 newlyEstablished=5 → SURFACES.** The fix works: 5 of 6 answered secrets now establish the want (before: 0/6). Same villagers/days as before, plus one new secret (Charlotte 44013 d45, ask_favor — the RNG stream diverged after the fix, as any engine change re-rolls downstream randomness).
- **The 5 established, in words:** Linda (seek_taken) — the want is offered on the post-answer menu ("About your taken kin — what do you need?"), picked, and resolves to a promise ("You'd do that? Ask it? ...Thank you. Really. Even asking is more than the silence."); Lucas and Jaxon (repay) — picked, deflected; Anthony (ask_favor) — picked, stated; Jordan (ask_favor) — offered 7 times across the sitting (the want stays live), picked, unresolved. **The 1 unestablished is Charlotte** (ask_favor): the want was offered twice, but the bot picked `dlg:more` twice instead (ENGAGE order: `dlg:more` outranks the want) and walked out. Engine did its job; the picker chose the continuer. I did NOT re-tune the driver order after seeing this — that would be re-scoring by changing the instrument to the result.
- **Q1-SECRET PANEL: openers=6 addressingPicked=6 teachPicks=0 wantEstablished=5 → SECRET-HOLDS.** teachPicks fell 3→0: the bot now picks the want instead of teaching.
- **Q2-CONFRONT PANEL: secretMenus=6 confrontRides=3** — unchanged by the fix, as designed.
- **Q2-POSTSECRET PANEL: answered=6 medianPostAnswerTurns=2 dryFirst=0 referencing=1 refRate=0.17 → POST-SECRET-MIXED.** refRate fell 0.50→0.17: the want now wins the post-answer turn, so the r122 secret follow-up line often never fires (picking the want drops the follow-up by the `convoDropUnspoken` rule). Honest tradeoff, recorded, not hidden: the sitting trades secret-follow-up airtime for want airtime. The follow-up still works when the player picks a continuer first (Charlotte's sitting: "The nights are still long. But it's easier, now that someone knows.").
- **Q1-LADDER PANEL: opens=5 mintedTracks=5/5 holds=4/5 → LADDER-OPENS + LADDER-MINTS + LADDER-HOLDS.**
- **Q2-TRUST PANEL: deaths=31 strangerGains=3 → CARRIED** (r119 verdict stands).
- **Q1-REQUESTS PANEL: staged=34 decided=28 expired=6 → REACHED.**
- **PANEL VERDICTS: {"EXPLAINED":5}.**
- **Trajectory note:** 44011 flipped from village-lost (d82) to survived (d101) after the fix, and 44009's w3fights went 2→14 — the fix re-rolls downstream RNG (menu changes consume the random stream differently), so same-seed trajectories diverge. That's trajectory noise from the change, not a designed effect; the before-panel evidence is snapshotted for comparison.

## People check (full transcripts read)

- **Heidi (44007 d45, grief opener):** "Every laugh out there feels wrong today. Then I feel wrong for thinking it." — real grief, coherent comfort ("They shake their head, then nod — both true at once"). Gossip defends a real person ("People need to stop whispering about Ahmad."). One filler-ish beat: two "Did you hear?" gossip drops back-to-back, the second re-skins the first (Giulia won The Drop → You won The Drop). Her want (repay) was offered as a menu item and never engaged — the pre-fix shape.
- **Yesenia (44001 d60, seek_taken):** the want OWNS the opening and resolves to a promise ("You'd do that? Ask it? ...Thank you. Really. Even asking is more than the silence."). The want system works when the want owns the opening — the contrast case for Q1: the want only fails to surface when the secret takes the opening. One slightly awkward tail ("Sorry, what was the question") — fits a fidgety temperament losing the thread.
- **Sari (44001 d26, no shared words):** the language-barrier path works beautifully — she tries Indonesian, laughs "with you, mostly", teaches a word, and the player slowly catches words: food, leadership, safety — exactly the questions a stranger would ask. Closing line is honest: "The conversation ends where language couldn't reach."
- **Fixed line repetition (noted, not fixed):** the promise follow-up line ("Thank you. ...I needed someone to know, and I needed it to stop there.") is a single fixed sentence, identical in 5/6 secret sittings. The teach line frame ("This one — X. Leaf, stem, smell. You won't forget it now.") repeats verbatim with only the plant swapped (Jordan's sitting: 3 in a row). Both are variety gaps for a later pass, not bugs — the lines are true and specific where they count (the secret-specific second lines vary by secret).

## Village assessment (plain words)

Sixteen villages played to day ~100. Thirteen survived; three were lost. The villages are alive and learning: every one opened the Standing ladder on day 14 and minted all five tracks; the Codex grew by 67–100 entries per village; people taught each other Bark armor, Snare, Pit Trap. But survival is thin at the edges: seed 44007 ended with ONE person alive and an empty pantry; seed 44005 survived with 200 kcal in the pantry for seven people; seed 44010 with two people. Deaths came from the wild and contests and sickness in roughly equal measure (sickness took 6 of 44007's 15). The deepening leg is reachable (wave 4 in all 16, wave 5 in 5), the villages feel like people living through something hard, and the win path is still ahead of them — no village reached the table in this leg, which is correct for days 40–80. The conversation system is the leg's strongest suit right now: wants, grief, secrets, language barriers and betrayals all fire and read like people.

## Reachable / fun / winnable

- **Reachable:** yes — secrets fire (6/16 seeds), the ladder opens everywhere, wants/betrayals/links all fire.
- **Fun:** yes, with a caveat — the secret-then-want arc now lands (Linda's sitting is the best conversation this loop has produced), but the fixed follow-up line and the teach template repeat verbatim across sittings.
- **Winnable:** the leg moves villages toward the win (standing climbs, wave 5 reached) but no win happens here by design — the leg is the middle of the road, not the end of it.

## Metric review

- **POSTSECRET_STEMS widening (r122 proposal, applied this run):** the widened stems ('night', 'keep') did their job — the after-panel's refRate is computed on follow-up lines the old stems would have missed ("The nights are still long", "I still keep it to myself"). Keep the widening.
- **Q1-WANT metric:** the "established" bar worked as designed — it caught the buried want (0/6) and confirmed the fix (5/6). One weakness: "established" counts any non-none resolution including deflected/unresolved — a want that surfaces and is refused counts the same as one that is promised. For the next run, consider splitting established into promised/stated vs deflected/unresolved, so the metric says whether the want merely surfaced or actually landed.
- **POSTSECRET refRate:** the metric now measures a tradeoff, not just the follow-up's health — when the want wins the post-answer turn, the follow-up line drops and refRate falls. The metric should be read alongside Q1-WANT, not alone.
- **Secret rate (~4% per opening):** the phenomenon is rare enough that an 8-seed panel can draw a blank (this run did). Future secret-question runs should pre-register 16 seeds, or accept THIN-PROBE as a likely outcome.
- **Telemetry:** first run used wrong metric names (deaths/wavesFaced aren't in the baseline — the LOUD lines were my error, not a deviation). Re-run with the baseline's own metrics (w3fights, engaged.w3, fightsTotal, fightsByWave.3): **quiet** (4 files, 4 metrics, no large deviations). Baseline NOT rolled forward.

## Telemetry

- Baseline: `hidden_files/telemetry-baselines/deepening.json` (4-seed r120 after-panel sums). Current: before-panel seeds 44001–44004 (same-n). Metrics w3fights / engaged.w3 / fightsTotal / fightsByWave.3: quiet, no large deviations. Baseline not updated.

## Gate

- (to fill: `node scripts/check.js --quick` in the worktree)

## Landing

- (to fill: merge `--ff-only`, release, rotation 2→3, lock delete)
