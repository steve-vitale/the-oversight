# Journey leg: SCALE (days 80–140) R11 — the Iron Court MERCY-GRACE re-measurement — 2026-10-19

**Run id:** 2026-10-19T09:45:00Z (oversight-playtest-loop, lane A). Worktree: `journey-scale`.
**Base:** master@f53227a4d (pulled at run start; contains the r7 MERCY-GRACE fix 58179595e).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — written before the pilot ran)

- **Leg question:** on the fixed tip, does the Iron Court MERCY answer now HOLD a conquest realm through the 30-day grace window — and at season's end, does the LEAD bar (30d seasoned + trust 40) apply honestly (hold if earned, dissolve ALOUD if unearned)?
- **Context:** r7 (2026-10-18) measured the conquest road pre-fix and found the MERCY trap: the beat promised eased links "a season," but MERCY cleared the conquered flags, flipping the hold bar from season-only to season+trust-40 overnight — +8 on strike-trust 15 / terms-trust 25 lands 23/33, short of 40, so the realm dissolved the next morning. Fixed in-commit 58179595e (link.mercyUntil = day+30; `_linkSeasoned` waives the trust component for polity membership while grace holds; after the season the LEAD bar applies honestly). Proof test RED→GREEN on 3 synthetic seeds. R11 is r7's explicit open item: re-measure the grace window on FULL runs.
- **Binding metrics (a miss is NO-GO, never re-scored; revisions go to "metric review"):**
  - M1 staging — ≥2/8 seeds stage the Iron Court by d140 (conquest bar: 3 active conquered fires).
  - M2 grace hold — of mercy seeds staging national, nationalLive holds continuously from mercyDay through mercyDay+30 while the village survives. A national-off INSIDE the grace window = the trap returning = NO-GO (death/scatter ends the watch, death-aware).
  - M2b season end — at mercyUntil+1 the LEAD bar applies honestly: links at trust≥40 (30d seasoned) hold; the realm dissolves ALOUD (scaleLog national-off + polityDissolve copy) if unearned. A SILENT clear = NO-GO.
  - M3 people — ≥8 transcripts sense-read, 0 senseless flags.
  - M4 survival — ≥2/8 reach d100 (death-aware; dead/scattered stops).
- **Interesting-finding bar:** hold duration vs mercyUntil; the trust trajectory on eased links (does +8 + tending reach 40?); the exact season-end copy; revolt/sabotage during grace; the r7 A/B on the 3 identical seeds (9501/9502/9507).
- **Horizon:** DAYCAP=185 loop-days targeting ~140 game-days, death-aware stop. **Seeds:** 9501, 9502, 9507 (r7's pre-fix mercy seeds — identical re-runs) + 9901–9905 (fresh). **ALL mercy** (IRONCOURT_ANSWER=mercy). **Policy:** warcourt (competent + conquest force play; raids from day 35, terms-first), WARCOURT_RAID=1.
- **Kill verdict taxonomy:** an M1 miss is METRIC-BROKEN unless the autopsy finds a mechanism (the unit proof stages the court — a journey miss points at the tip's raid economy, not the mercy mechanic). An M2 miss (national-off inside the window) is CONCEPT-DEAD for "the grace fix holds on full runs."
- **Substrate checklist (§14b):** the fix is in the tip (hierarchy.js mercyUntil, verified pre-run); the unit proof stages mercy and holds (re-run green on the current tip this run); the r7 harness's warcourt policy stages the court on ~4/8 seeds. Conditional PASS (re-measured live).

## PILOT (4 seeds: 9501, 9502, 9507, 9901; DAYCAP=185)

Verdict: **interesting — full 8-seed run justified.** 3/4 staged the court by d140; the grace instrument fired on all three (mercyDay stamped, daily graceLog rows, trust trajectories readable).

| seed | end | mercyDay | grace | note |
|------|-----|----------|-------|------|
| 9501 | survived d187 | 108 | 46 rows, NL throughout | trusts 31/35/31 → 59/53/59 by d138; earned hold past grace |
| 9502 | survived d179 | 94 | 54 rows, NL throughout | pre-fix this seed staged d158 and dissolved d159 (the trap) |
| 9507 | village-lost d106 | 94 | 13 rows, NL=ON at death | death-aware stop, not a trap |
| 9901 | village-lost d33 | — | never staged | died d33, before raids begin (d35) — normal war-road attrition |

## EXPANSION (4 seeds: 9902–9905; DAYCAP=185)

All four completed cleanly, no crashes, no contest softlocks (contestStuck 0 all), no death mislabels.

| seed | end | mercyDay | grace | window-end | final |
|------|-----|----------|-------|------------|-------|
| 9902 | survived d171 | 94 | 54 rows, NL throughout | earned hold (55/59/56 ≥40) | global |
| 9903 | survived d187 | 130 | 46 rows, NL throughout | earned hold | national |
| 9904 | survived d179 | 115 | 54 rows, NL throughout | earned hold (52/67/53) | global |
| 9905 | survived d186 | 162 | 25 rows, NL throughout | window extends past run end; held throughout observed | national |

## Verdicts on the binding metrics (FULL 8 seeds)

- **M1 staging — GO (6/8).** Staged by d140: 9501 (d108), 9502 (d94), 9507 (d94), 9902 (d94), 9903 (d130), 9904 (d115). 9905 staged d162 (outside the leg window, still staged). 9901 died d33 pre-raid.
- **M2 grace hold — GO.** 0 national-off events inside any grace window across 7 stagings. 9507's village died at d106 with nationalLive ON — a death-aware stop, not the trap. The trap (next-morning dissolve) fired on 0/7.
- **M2b season end — GO (with scope note).** 5 completed windows (9501, 9502, 9902, 9903, 9904) transitioned to earned holds: every eased link at trust ≥40 and 30d+ seasoned when its mercyUntil passed; nationalLive stayed ON; 0 polityDissolve markers; 0 national-off transitions. 9905's window (d162–192) extends past run end but held NL=ON throughout the observed 25 days. **Scope note:** no seed failed the post-grace LEAD bar, so the "dissolve aloud if unearned" half was not exercised live — it is covered at unit level (test-iron-court-mercy-20261018.js: "after the grace season with trust unearned, the realm dissolves aloud," ALL GREEN on the current tip this run).
- **M3 people — GO.** 20 transcripts captured; 18 sense-read below; 0 senseless flags; 0 unexplained fabrication flags. Two copy/design notes investigated and kept (see blanks).
- **M4 survival — GO (7/8 reach d100+).** d187/179/106/171/187/179/186; only 9901 (d33) missed.

## The headline: the yoke's shadow holds — the kind answer is no longer a trap

On all 7 stagings the realm held nationalLive continuously from the mercy answer through the full 30-day grace window, and on all 5 windows that completed inside the run the eased links had been tended to trust ≥40 — the LEAD bar was met honestly and the realm held past the window as a real realm. The r7 trap (dissolve the next morning) fired nowhere.

Trust trajectories (the design's core bet — "earn their trust to 40 by then"):
- 9501: 31/35/31 → 40/46/40 (d118) → 58/51/58 (d128) → 59/53/59 (d138, grace end)
- 9902: 41/37/18 → 51/51/36 (d106) → 53/53/54 (d122, all ≥40, 2 days before grace end d124)
- 9904: 24/37/7 → 41/58/24 (d122) → 52/65/51 (d143) → 52/67/53 (d155, post-grace)

The warcourt policy's post-mercy tending ("MERCY links get tended like courtship") climbs ~20–40 trust over the season — the 40 bar is reachable but not free. A neglected realm would still dissolve, aloud, at season's end (unit-proven).

The r7 A/B (same seeds, pre-fix → post-fix): 9502 is the sharpest read — pre-fix it staged at d158 and the realm dissolved d159 (the trap, caught red-handed); post-fix it staged at d94 and held national to d179. **Caveat:** the tip moved between r7 (2026-10-18) and this run (commits landed: sim-cookbulk, journey-crisis r28, doomrevive, deepening r19, etc.), so the identical-seed comparison is "same seed, current tip," not a fix-only A/B. The clean claim is the current-tip verdict above, not a causal attribution to the fix alone.

## The beats, as played (9902, mercyDay 94)

- **The answer:** "🕊️ The Iron Court's answer: MERCY. The yoke comes off — tribute back to courtship terms, 4,000 kcal a week, and the hatred starts to decay. The Bloodied, Stonebrook and Thornfield don't trust it yet. They might, in a season — the realm holds them one season on the yoke's shadow. Earn their trust to 40 by then, or it comes apart. (Trust +8 with each.)"
- **The season:** duress tribute weeks at the eased 4,000 kcal rate; revolt markers 1–11 per seed (the trust<30 rebellion layer still fires where links lag); no dissolve copy anywhere.
- **After:** national held; 9902 and 9904 went on to global (viewership 41/32) — the war road's combat feeds the Watchers bar.

## Village assessments (plain words)

- **9501 (survived 8/8, d187, national):** staged the court d108, held it. The realm's three fires (The Bloodied, Stonebrook, Thornfield) were tended from suspicion (31/35/31) to loyalty (59/53/59). 8 villagers alive at end — the gentlest war-road seed.
- **9502 (survived 8/8, d179, national):** the redemption arc — pre-fix this village watched its mercy realm die overnight at d159; post-fix it staged at d94 and held. Lillian the electrician (trust 90) is the village's memory: first memories of Columbus, Ohio; the Blood Tithe on the screens.
- **9507 (village-lost, d106, global at death):** staged the court d94, died under it with national ON — wave-3 combat and the d100s attrition took the village mid-grace. Raj the pharmacist stood down The Loud Beast at the treeline and couldn't sleep after; Jesse the line cook buried friends and asked if it was enough.
- **9901 (village-lost, d33):** died before the road began — raids start d35. Normal attrition, not a finding.
- **9902 (survived 6/6, d171, global):** mercy d94, earned hold, then the Watchers (viewers 41). Nader the hunter carries the Taking thread — his sister Sophia, the pods, the humming; Hugo the fisherman dreams of his aunt Joyce. Keltoum the zookeeper begged for food and mourned Aishwarya in the same sitting.
- **9903 (survived 8/8, d187, national):** the late stager (mercy d130) — still held. Hugo's taken-kin thread ran all four conversations (d80/d100/d120/d140) with real continuity ("Still nothing on Joyce").
- **9904 (survived 5/5, d179, global):** mercy d115, the lowest starting trusts (24/37/7) — all climbed past 40. The war road's combat carried it to wave 4 and the Watchers.
- **9905 (survived 9/9, d186, national):** the latest staging (d162) — held through the observed window. 9/9 alive, the most intact roster of the run.

## People check (M3) — 18/18 sense-read, 0 senseless, 0 unexplained fabrication

- **Carmen, 9501-d80** (carpenter, withdrawn, ask_favor): "Pantry's thin and getting thinner. Come forage with me tomorrow — two of us can fill packs." Names the place (north treeline by the fallen oak). Committed, promised. Engaged, closed.
- **Oliver, 9501-d100/d120** (veterinarian, dry, trust 90, ask_favor fromSeed): the returning favor — "I hate to ask twice, but it's still open" → "the need hasn't gone anywhere. I'm still asking. I mean it." Escalating insistence across 20 days, not verbatim repetition. Borderline filler-watch, kept: a real unfilled need persisting reads true in a food economy.
- **Oliver, 9501-d140** (curious): "I know who took the extra rations but won't say. — comedy." The want engaged (question asked, deflected honestly, engaged close). The "— comedy." closer is the dry-humor speech-DNA marker (Steve 2026-10-07) — investigated, kept (see blanks #2).
- **Lillian, 9502-d80** (electrician, warm, curious): clean Q&A + teaching with varied reactions. "Noted. Filing that under 'extremely useful.'"
- **Lillian, 9502-d100** (curious): the callback — "Sassafras — I keep thinking about what you said. I'm seeing it everywhere now." First-memory exchange (Columbus, Ohio — "First memories are half real and half the story you needed"), then the lately: "They took Quinn — The Blood Tithe, on the screens. The whole fire watched." The village talks about the show. Strong.
- **Lillian, 9502-d120** (curious): the dream question — "Columbus, Ohio, always. Same dream: I'm walking home and the street keeps getting longer." Continuity with d100. Turns it back: "I asked how you're holding up. Honestly means honestly."
- **Lillian, 9502-d140** (curious): the food-sharing opener — "You eat first. No — don't argue. I already ate. (I hadn't.)" Then a trust/food philosophy riff. The last 4 turns thin into aphorisms ("I do the small things right. The big things notice.") — the weakest stretch of the run, but in-voice and after real substance. Pass with note.
- **Raj, 9507-d80** (pharmacist, cautious, curious): "That night — I stood down The Loud Beast at the treeline — it ran. I keep hearing it when I try to sleep." Real trauma, honest thinning ("That's the whole of it. Sorry.").
- **Jesse, 9507-d100** (line cook, withdrawn, grieving, seek_comfort): "We gave them a good burial. Doesn't feel like enough, does it?" Genuine comfort exchange. One stray-quote artifact ("They're already drifting away. "Later."") — minor copy blemish, noted.
- **Keltoum, 9902-d80** (zookeeper, intense, grieving, ask_favor): begs for food, then mourns Aishwarya — "Aishwarya is gone and the world just... continues. That's the part I can't stand." Hunger and grief in one sitting, both real.
- **Nader, 9902-d100** (hunter, intense, seek_taken): the Taking thread — "It's my sister, Sophia. Was taken at the Scattering. The boring half, they said — my sister, boring." KIN.md canon surfacing with feeling. The player commits to asking the System.
- **Ivy, 9902-d120** (journalist, cautious, curious): regret question with a real answer; deflects the first teach ("Hm. Never mind — go on." — a human beat); lately: "Siege. They just... took Tom. Came back like nothing happened. It wasn't nothing." Show-taking texture.
- **Enzo, 9902-d140** (veterinarian, earnest, curious): "Can we talk? Just... talk. Like people used to." Lately: "They took Ivy — Hardened The Echo, on the screens." Verified: Ivy (ivy_wang) is NOT in 9902's death list — "took" is a show-taking, and she came back (cf. Tom). The line is honest.
- **Hugo, 9903-d80** (fisherman, gentle, seek_taken): aunt Joyce — "She laughed like a screen door in a windstorm. Boring. Right." The "boring half" language, personal and specific.
- **Hugo, 9903-d100** (seek_taken): the strand — want selected at stage 0, opener ledger-blocked, grief fallback fired ("At night I talk to someone who isn't there anymore"), want stayed live, resurfaced d120. Investigated: working as designed (see blanks #1).
- **Hugo, 9903-d120** (seek_taken fromSeed): the resurface — "About what happened to my taken kin — You talk to it -- the System. Have you ever asked? About the taken -- about Joyce?" + "Still nothing on Joyce." Continuity across 40 days.
- **Gianni, 9903-d140** (piano tuner, prickly, Spanish-only): the no-shared-language path — "«No entiendo nada. ¡Nada!»" / mime / "Water?" / a pressed-palms goodbye. Honest, not faked (matches r10's finding).

## Blanks filled / documented

1. **The r7 open item: MERCY-grace re-measurement — CLOSED, GO.** The headline above. No src/ change — the fix (58179595e) holds on full runs. The r11 harness (`scripts/journey-scale-r11-20261019.js`) carries the reusable grace-window instrument (mercyDay stamp, daily graceLog with per-link trust/mercyUntil/inGrace, season-end transition detection) for future conquest measurements.
2. **"— comedy." closer (checked, kept).** The dry-humor speech-DNA closer (Steve 2026-10-07, conversation.js convoSpeechMarkers) renders inside quoted speech as "won't say. — comedy." 2 occurrences across ~100+ scale transcripts (r3 2026-10-16, r11). Read in context it's a dry person's flat wry tag, not a stage-direction leak — speakable, rare, in-voice. Kept as designed; not a blank.
3. **Hugo d100 seek_taken strand (checked, working as designed).** The want was selected but its opener was ledger-blocked; the OPENER-SKIP path fired the grief fallback instead of a dry line, the want stayed live at stage 0, and it resurfaced at d120 with continuity. This is the designed long-lived-want lifecycle (convoPickCycle never returns null; staleOpener exists; the r10 canOpen guard targets permanent inability, which doesn't apply — seek_taken's opener always CAN fire). Not a blank.

## Blanks documented (not fixed — other lanes / scope)

1. **Stale unit test (pre-existing, not a regression).** `scripts/test-national-shapes-20261010.js`: 4 failures on the current tip (wave-5 gate on covenant/trade/conquest national; refuse-road "tribute arrives whole, no x1.25 (got 500)"). Not in scripts/green-list.txt; last touched by the 10-16 version-bump commit; my run made zero src/ changes. The refuse-tribute expectation contradicts today's live r9 measurement ("comes in whole, never ×1.25" verified on 8 seeds with real numbers) — the test is stale relative to 9 days of tip movement, not a game regression. Flagged for the owning lane; not fixed here.
2. **Instrument noise (mine, noted for the next run).** The r11 `graceEnd` marker set includes "comes apart," which also matches Focus Group monster-death lines (~105 hits on 9902) — the marker is polluted and was not used for any verdict (verdicts rest on graceLog + scaleLog transitions). The graceLog link projection truncates ids to 6 chars and two links collided on the suffix (9903/9904 display) — display-only. Both fixed or dropped in the next harness revision.

## Metric review (§14)

- M1–M4 all GO. No re-scoring; the pilot's 3/4 staging stands as the pilot record.
- **Revision proposed for the NEXT conquest run:** M2b should pre-register the two halves separately — (a) "no silent clear inside the window" (instrument: graceLog) and (b) "the unearned-dissolve path" (instrument: the synthetic proof test, unless a journey seed actually fails the post-grace bar). This run proved (a) live and (b) at unit level; the metric as written conflated them.
- **Instrument honesty note:** the identical-seed A/B framing (9501/9502/9507) is "same seed, current tip," not a fix-only comparison — the tip moved between r7 and r11. Future re-measurements should say so up front.

## Telemetry deviation check

`telemetry-check.js` vs `scale-conquest.json` baseline (8 r11 files, 6 metrics: markerCounts.national/ironCourt/raid/revolt, fightsTotal, maxGameDay): **quiet — no large deviations.** Baseline NOT rolled forward (no LOUD lines to investigate; the set is consistent with the conquest-road baseline).

## Regressions

- `scripts/test-iron-court-mercy-20261018.js`: ALL GREEN on the current tip (9/9, incl. "dissolves aloud if unearned" and "earned trust re-stages as lead").
- `scripts/check.js --quick`: ran during the run (see console log); repo healthy.
- `scripts/test-national-shapes-20261010.js`: 4 pre-existing failures (stale test, not green-listed, zero src/ changes this run) — documented above, not a regression.

## Reachable / fun / winnable (scale leg, conquest road, mercy path)

- **Reachable:** YES — 6/8 seeds staged the Iron Court by d140 on the war road; the mercy answer is one choice among three and plays aloud with its terms stated ("Earn their trust to 40 by then, or it comes apart").
- **Fun:** the grace season is a real project — tending three suspicious fires from ~25 trust to 40+ while the realm holds on the yoke's shadow. The season-end transition is honest: earn it or lose it aloud. The beat's promise ("a season") is now kept.
- **Winnable:** YES, conditionally — the mercy path held national on 6/6 surviving stagings and two seeds (9902, 9904) went on to global. The condition is the same as the road's: the village must survive the war road's combat long enough to tend what it took (9507 shows the failure mode — death mid-grace, with the realm still flying).

## Files

- Harness: `scripts/journey-scale-r11-20261019.js` (r7 fork: R11 pre-registration, 8 mercy seeds, EVIDIR 2026-10-19, mercy-grace instrument — mercyDay stamp + daily graceLog + mercy/graceEnd markers)
- Proof (re-run, still green): `scripts/test-iron-court-mercy-20261018.js`
- Evidence: `evidence/2026-10-19/journey-scale-r11-warcourt-{9501,9502,9507,9901,9902,9903,9904,9905}.json` (+20 transcripts `journey-scale-r11-transcript-<seed>-day{80,100,120,140}.txt`)
- Fix: none (measurement run — the r7 fix holds; no src/ changes)
