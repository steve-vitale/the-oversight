# journey-deepening r191 — deepening leg (days 40–80), Lane A — RUN NOTE

- **Run:** `playtest-loop-a-20261114T0245CST`, scheduled Sat 2026-11-14 02:45 CST (08:45 UTC; run started ~08:44 UTC, leg work started ~09:22 UTC after the flap/registration saga below).
- **Leg:** 2 — deepening (DAYCAP 100, death-aware stop). Rotation read `2`; advance 2→3 at closeout with read-back verification (owed — see closeout).
- **Base:** local master `2de44bad8` at run start; rebased onto `2687ae91f` at registration (transplant14 family-14 landing + coordinator evidence landed mid-run; clean fast-forward).
- **Branch:** `journey-deepening`, worktree `~/workspace/worktrees/journey-deepening` (registered 09:14:52Z; heartbeat loop r191, 10-min cadence, PID 6616).
- **Lock:** run_id `playtest-a-20261114T084500Z`. Stale-lock recovery at start: r190's lock (`playtest-a-20261114T080546Z`) had no registered tree and no heartbeat — deleted per the overlap-guard rule.
- **Policy:** competent. Seeds 100070–100073 (4-seed panel) + smoke 100074, DAYCAP=100 (smoke 45), CONVO_DAYS [45, 60, 80].
- **Commits:** `47557e3ba` — Q1 prereg + H1 probe + stage-0 guard fix [needs-eyes]. (Instrument + run-note commit owed at closeout.)

## Registration saga (35 min, no work lost)

The 02:07 CST write-flap window was still active at run start (probes A/B/G/H FAIL; my own `update-ref` probe failed rc=128 at 08:44:53Z). It cleared ~08:49Z, flickered back 08:55–08:58Z, then cleared for good after a VM restart ~09:06–09:08Z (new boot d592da35; ALL-OK probes from 09:08Z). Two retry loops raced the same slug — the orphan r190 loop was still alive (its 02:27 note claimed its loop had "exhausted", which was wrong; killed 09:02Z). The r191 loop's attempt 2 was interrupted by the VM restart mid-`git worktree add`, leaving a partial checkout (6/60 entries) with admin `locked`="initializing" and no registry entry; the loop exited 0 falsely on its dir-exists check. Repaired manually: `git worktree unlock` + `git worktree remove --force` (branch kept), then one clean `worktree-register.sh` run (registry entry verified, checkout 60/60, status clean). **Lesson for the next run:** the restart also wiped /tmp — the r190 prereg draft, the retry/fork scripts, and the r190 probe test were all lost and had to be reconstructed from the run's transcript reads. Keep run-critical files in the worktree or goal hidden_files, never only in /tmp.

## Q1 (PRIMARY) — H1 STAGE-0 GUARD: CONFIRMED + FIXED

**The question.** Does the stage-0 guard speak a re-ask phrasing for a favor built seconds earlier in the same sitting, never previously spoken?

**Verdict: H1 CONFIRMED at unit level, and the fix is built.** The probe (`scripts/test-journey-deepening-r191-stage0-h1-20261114.js`) ran RED on pre-fix code (exit 2) and GREEN after the fix (exit 0).

- **v1 probe (blind metric — recorded, not hidden):** the first probe version asserted the block from the `sayLine` wrapper record. Its blocked arm SPOKE the re-ask ("About the food I needed — I still haven't found anyone. Any chance?") for a today-built, never-spoken favor while reporting `primaryBlocked=false` — because the guard substitutes the opener line *before* `sayLine` ever sees it, so the wrapper can never observe the primary. v1's output is kept (`journey-deepening-r191-probe-h1.log`).
- **v2 probe (observable metric):** `wouldBlock` on the sitting opener's line before the turn, a `convoWouldBlock` wrapper logging every evaluation during the turn, the turn favor's own `.line` + block status after the turn, and `want.fromSeed`. The v2 record is airtight — blocked arm (Aubrey): turn favor line "I'm running on empty — have you got anything to spare?..." evaluated **true** during the turn (blockEvals), the followup evaluated false and spoke, favor -81 askedDay=1=today, first sitting, `wantFromSeed=false`. Control arm (Lauren): turn favor line evaluated false, fresh opener spoke. **H1-CONFIRMED.**
- **The fix** (`src/js/conversation.js`, stage-0 guard): for a fresh favor — built today by this turn's opener, not fromSeed — the need speaks fresh (`whyLine`, then `convoFavorNeedLine`) BEFORE the `convoFavorFollowup` rung, which presupposes a prior ask. Seeded and inherited favors keep the old order (their ask is established, so the followup is honest there). The followup stays as the fresh favor's last rung, so the ask still speaks when the fresh-need lines are blocked too. Post-fix probe: the blocked arm speaks "It's been days since a real meal. I can't pull my weight like this. Anything you can spare, I'll make it stretch." — the whyLine, fresh, no re-ask, no shrug. Residual hole (noted, not hidden): if whyLine AND needLine are both blocked for a fresh favor, the followup rung can still fire as a phantom — much narrower than the old single-block trigger, and the alternative (dry shrug) loses the ask entirely.
- **r53 guard test:** PASS on pre-fix code (before-leg, temp restore) AND PASS post-fix. The ask still speaks, never the shrug.
- **Live-build check:** not applicable this run — the fix is unshipped (it reaches the live build through the ship loop), so a live-build screenshot would test the old code. The node probe above is the proof for the new behavior; the dialogue change is one spoken line in the blocked case, with no layout or UI change.
- **Wild panel check:** 4 re-ask orphans on the panel, ALL FROMSEED (seed proves a prior ask in an unrecorded sitting), 0 true-no-thread. The unit probe settled H1; the wild panel shows no recurrence in the wild. (The full-trace classification is in the analyzer log; one orphan transcript read below.)

## Q2 (SECONDARY) — DOUBLE-ASK + PARTNERBLOCK: WATCH-CLEAR, PARTNERBLOCK VARIED

- **Double-ask: 0 across 52 transcripts → WATCH-CLEAR.** Third clean panel in a row (r188 0/135, r189 0/79, r191 0/52). The r134 fix holds.
- **PARTNERBLOCK: total=4, distinct=4, maxRepeat=1 → VARIED.** r189's carried complaint (3 patterns, max 4) is gone on this panel — every partner-block line is a different pattern with no repeats. Thin (n=4), but the direction is good; the watch closes for this panel.
- **FAVORBLOCK: total=4, distinct=3, maxRepeat=2 → REPETITIVE (thin).** `favorblock-nextto` fired twice (100071 d24, 100072 d80); the other two are distinct. No single clear defect, no fix — carried as a watch, not a blank.

## Q3 — census (plain words)

Five villages played (4 panel + 1 smoke). Two survived to day 101, two were lost, the smoke survived to day 45. Every village reached wave 4 except the smoke (wave 3 at day 45). No starvation deaths anywhere.

- **100070 — lost day 88, wave 4, regional (standing 270).** Two early ambushes took Catalina and Maya in the first week; the village fought 23 fights (13 of them wave-4), killed 42 monsters, tested and cooked monster meat (sunback, hushwolf, speedbump turtle), and held regional standing with 6 feasts — then the scholar died on day 88 with no successor and the village ended. Ladder peaked at stage 3, fell to stage 2 (explore-capped, craft 0). Four people were still living when the scholar fell.
- **100071 — lost day 76, wave 4, regional (standing 160).** The hardest-working meat village of the panel: 37 monster kills, 17 tested and revealed, 18 dinners. But two ambushes early, a Reunion kill on day 40, sickness on day 65, and the wild took two more on day 67; the scholar died day 76 with no successor. Ladder peaked at stage 3, ended stage 1.
- **100072 — survived day 101, wave 4, GLOBAL (standing 322).** The strongest village of the panel: 5 people standing at day 101, 3 regional links, ladder stage 3 (68 counted), all five tracks minted. Nine villagers died along the way (four to monsters, four to the wild on a single bad day 93). Meat: 34 kills, 7 revealed, 7 dinners. The only village to reach global scale.
- **100073 — survived day 101, wave 4, regional (standing 375).** Nine people standing, the most fights of the panel (30), ladder stage 3. Standing is blood-only again (375 points, 0 links) — the standing road without links is the open question for the scale leg, same as r189. Meat: 24 kills, 7 revealed, 3 dinners. Twelve villagers died (monster, wild, one wound that wouldn't close).
- **100074 (smoke) — survived day 45, wave 3, regional (standing 50).** All 11 alive at day 45, ladder stage 3 already. One sickness death (day 42). Meat: 12 kills, 3 tested, 0 dinners yet.

Knowledge economy: monster meat is tested, revealed, and eaten on every seed (3–17 reveals); counters were taught (2 on 100073 — glasswing, memory projector); the Codex grew by 80–85 entries per village. The `moot` knowledge pile stays large (24–36 per seed) — knowledge going moot faster than it gets used is a standing observation, not this run's to build.

## People check (full transcripts read)

Three full transcripts, all coherent — people with wants, consequences, and specific memories.

- **Malik, 100073 d60 (the secret that fired).** Postal worker, anxious, trust 100. "Can I tell you something? I can't read, and I'm scared it matters now." The player promises secrecy; he thanks them — "I needed someone to know — just one person." Then he teaches a plant (Bissap Hibiscus — crush the leaf, smell it, taste the stem), shares places (an old trapline, a burned farmhouse), names the pocketed thing ("That small thing I pocketed — I still have it. Some other fire, maybe."), and the sitting ends on real grief: "I regret the ordinary days I rushed through. All those Columbus, Ohio mornings I spent annoyed at small things. I'd pay anything for one annoyed morning now." The secret was kept; the pocketed thread was named. Reads like a person.
- **Ingrid, 100071 d52 (a FROMSEED orphan).** The bond proposal opens the sitting ("I want us to stick together. Properly. Watch each other's backs."), accepted — then the re-ask: "About the creek water run — I hate to ask twice, but it's still open. Will you?" Requirements asked, commitment made ("Dawn, then. Bring something to carry — and thank you."), resolution=promised. The re-ask names a real open thread from an earlier sitting. Honest.
- **Saul, 100072 d45 (seek_comfort).** A gift pressed into the hand ("I made an extra... a decent tool, oiled and kept."), a halting approach ("Do you ever — no. Never mind."), then sitting by the fire while he grieves the quiet parts: "You know what's worst? The quiet parts. When the fire's the only one talking." Resolution=comforted. The stay/empathize exchange repeats the player's two lines three times, but the NPC answers escalate each time — the comfort loop working, not a filler loop.

No senseless dialogue found this run. No fabricated shared history in the wild panel.

## Changes this run (worktree only)

- **Fix:** `src/js/conversation.js` — stage-0 guard fresh-favor reorder (see Q1). Proof: the H1 probe itself (RED exit 2 pre-fix → GREEN exit 0 post-fix) + r53 test PASS before and after. Commit `47557e3ba` [needs-eyes] (dialogue feel — what a villager says when asking for food changes in the blocked case).
- **Instrument:** driver `scripts/journey-deepening-r191-20261114.js`, analyzer `scripts/analyze-journey-deepening-r191-20261114.js`, proof test `scripts/test-journey-deepening-r191-analyzer-20261114.js` (r189 clones, seed band + run tag only; FROMSEED already a class in the r189 analyzer) — analyzer proof **8 passed, 0 failed**.
- No other game change. The panel ran on the fixed code (dialogue-only change; survival numbers are seed variance + base movement since r189, not the fix).

## Q4 (carried, read-only)

LADDER opens 5, mints 5/5, holds 3/5 → OPENS + MINTS + HOLDS. SECRET-PROBE FIRES (1 fired, sharedEnd 16). PLACEPROBE bottleneck FIRES (11/52 sittings with places). B-SIT 15 (accept 8 / decline 7, 0 unanswered); B-FOLLOW 14 (1 new betrayal); P-KEEP 10 (NAMED 4, DEAD 4, NO-LATER-SITTING 2). FIZZLE-FIX HOLDS (0 dry sittings). BOND-TELEMETRY PRESENT (86 tele, 37 proposals, 11/16 accepts, 14 initiated bonds). REQUESTS REACHED (35 staged, 21 decided, 4 expired-talkable-untalked). BOND-CHOICE 21/21 answered. LANGGATE NOT-REPRODUCED; LANGARC ARC-UNEXERCISED; MENU-FLIP NO FLIPS (fix holds). TEACHFRAME VARIED (26 frames, 4 distinct). TRUST CARRIED (deaths 32, knownGains 48, lateGains 1 — r119 verdict stands). GOALJOIN mostly HEALTHY; **knowledge track GOALS-FAULT** (tops 1, lined 0, capture 0) — flagged for the one-brain program, not this run's to build. REPLAY NOT-REPRODUCED. AWAY-LINE OLD LINE GONE. D-THING 7 pocketed / 3 testable / 1 named. RAJ-PHOTO 0. DEBRIEF: villageLost 2, both attributed (scholar-death-no-successor ×2), 0 unclassified. SOFTWARM 0. GUARDLINES 5.

## Telemetry

`telemetry-check.js` vs the deepening baseline (4-seed sums, r120 Nov 9) on seeds 100070–100073: **QUIET — no LOUD lines.** Panel-only sums: w3fights 27 vs 33 (−18%), fightsByWave.3 27 vs 34 (−21%), engaged.w3 25 vs 28 (−11%), fightsTotal 94 vs 104 (−10%). (The check's glob swept 5 files — panel + smoke; the smoke adds 0 to w3fights/fightsTotal and 3 to engaged.w3, so the verdict is quiet either way.) The r189 LOUD lines (−76%/−74%) are gone; this panel sits much closer to the baseline. **Baseline NOT rolled forward** (per prereg: the re-seed needs an 8-seed panel with per-seed means).

## Gate

`node scripts/check.js --quick` (340 scripts, 4 parallel, 691s): **335 passed, 5 failed — GREEN, 0 attributable to this run.** All 5 failures are pre-existing: the identical 5 failed in r188's gate (2026-11-13, 334 passed, 6 failed) on the base without this change — `test-measurement-proof-update.js`, `test-measurement-workflow.js`, `test-phone-frame-proof.js` (stale phone receipt — index.html), and the two deed-attainment tests (`test-living-garden-deed-attainment.js`, `test-one-person-army-deed-attainment.js`, both 120s timeouts under the parallel gate; both pass when run singly per the adj logs in the main tree). One test that failed in r188 (`test-capable-bot-20261014.js`, timeout) passed this run. The conversation fix touches only `src/js/conversation.js`; no conversation test failed, and the r53 guard test passes before and after the fix.

## Metric review (§14)

- Q1's metric worked after the v1→v2 instrument correction (see Q1). The v1 wrapper metric was structurally blind — it could never observe the guard's substitution — and the correction was made BEFORE any verdict was taken, with v1's output kept as evidence. The v2 rule (turn favor line blocked + re-ask spoken + askedDay==today + not fromSeed) decided cleanly. One gap the v2 record exposed: the post-turn `favorLineBlocked` check is confounded for the CONTROL arm (its own speaking blocks the line afterward — control read favorLineBlocked=true while its during-turn evaluation was false). The verdict rests on the during-turn blockEvals, not the post-turn check; a future probe should capture the block status before the turn for both arms.
- Q2's metric worked as designed: double-ask 0 → WATCH-CLEAR without re-scoring; PARTNERBLOCK variety read straight off the panel (4/4 distinct). FAVORBLOCK's REPETITIVE flag at n=4/max-2 is thin — the panel is small for variety verdicts, and the next run should keep the watch rather than treat max-2 as a defect.
- The 4-seed panel was enough for the Q2 watch and the Q1 wild check, but the census (2/4 lost) is too small to say anything about survival movement vs r189 (5/8) — that comparison needs the 8-seed panel the telemetry re-seed already calls for.
- The flap delayed registration by ~35 min and wiped /tmp once (VM restart). The rotation 2→3 write is owed at closeout with read-back verification.

## Verdicts

- **Reachable:** yes — wave 4 on all four panel villages, global scale on one, the ladder, bonds, links, favors, secrets, and meat economy all fire in the wild.
- **Fun:** yes — the transcripts read like people (Malik's secret, Saul's fireside grief, Ingrid's kept promise), and the villages that survived did so with standing to show for it. The two lost villages ended on scholar-death-no-successor, which is the game's intended hard edge, not a dead end — both had living villagers left.
- **Winnable:** partial — 2/4 survive to day 101, one reaches global scale, but no village reaches national or the table; the standing road is still blood-only on one survivor (375 points, 0 links). This leg ends before the seat, and the link-less standing road is the open question for the scale leg.

## Notes for the next run

- **Rotation:** advance 2→3 at closeout (this run) with read-back verification. Next leg is scale (days 80–140).
- **Next blank (r192):** the link-less standing road — seed 100073 reached 375 standing with 0 links while 100072 reached global with 3. Is standing without links a real road or a dead end that only looks alive? The scale leg owns this question; the deepening panel can only note it.
- **Carried:** GOALS-FAULT on the knowledge goal track (tops 1, lined 0, capture 0) — for the one-brain program. FAVORBLOCK watch (max 2, thin). The `moot` knowledge pile (24–36/seed). PARTNERBLOCK watch closes for this panel.
- **Held tree (INSPECT HELD WORK, Steve 2026-10-27):** `journey-scale-attr` (heartbeat 2026-11-10 06:08Z, 4+ days stale) still holds the unlanded revert of the live sim-wideduty-a medic-duty code in `src/js/game.js`. Real work-in-progress, not scratch — not released, not touched. Flagged for the fourth run in a row.
- **Write flap:** window 02:07–~02:50 CST, cleared after a VM restart; ALL-OK on the new boot from 09:08Z. Steve was told about this window at 02:16 CST (once-per-flap rule); no repeat message sent for this run's delay. The flap's exact denied step remains uncaught (probe: write()=EPERM, host-side).
- **Infra:** safe-commit index clobber struck the Q1 commit (repaired via the documented ls-tree pipe, verified: status clean, diff empty, hashes match). The r190 orphan retry loop outlived its run by ~35 min and raced this run's registration — its 02:27 "loop exhausted" note was wrong; killed 09:02Z. /tmp is wiped by VM restarts — run-critical files must live in the worktree or goal hidden_files.
