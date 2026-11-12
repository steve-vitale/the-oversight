# journey-deepening r184 — deepening leg (days 40–80), Lane A

- **Run:** `playtest-loop-a-20261112T0345CST`, scheduled Thu 2026-11-12 03:45 CST (09:45 UTC).
- **Leg:** 2 — deepening (DAYCAP 100, death-aware stop). Rotation read `2` at run start; advance 2→3 owed after landing.
- **Base:** local master `0436a04e0` (r133 run-note commit; verified in worktree: `git log` HEAD = 0436a04e0, branch `journey-deepening`, status clean — the chained `git status` took ~14 min on the 12G tree, output empty = clean).
- **Branch:** `journey-deepening`, worktree `~/workspace/worktrees/journey-deepening` (registered 09:58Z, FIRST attempt — flap probe 5/5 WRITE-OK before it).
- **Lock:** `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/playtest-loop.lock`, run_id `2026-11-12T09:55:38Z` (created 09:55:38Z; no prior lock existed). **Delete at end, re-reading it first.**
- **Heartbeat loop:** `~/workspace/worktrees/journey-deepening-hbloop-r184.sh`, 10-min cadence, started 10:13Z (PID 16954); manual heartbeat 10:12:44Z.
- **Policy:** competent. Seeds: fresh **100027–100030** (4-seed panel — pilot-scale; see Shape); smoke **100031**. Freshness verified: 0 hits in `*-prereg.md` files, 0 in `scripts/`, no filenames (the only `10002*` filenames are 5-digit seeds 10002/10003 from 2026-10-22). DAYCAP=100. CONVO_DAYS [45, 60, 80].
- **Single-seed-per-process (r183 adoption finding):** every seed ran as its own `node` invocation, parallel across processes.

## Pre-flight notes (this run)

- Main tree clean at run start; disk 38%. Worktree reaper (pre-flight run): removed nothing; 4 LOUD dirty trees (sim-siegedialog-a, journey2-social, sim-bisect-r5-cut1-a, sim-bisect-r5-cut2-a) — none mine, left alone. Active 13/16, cap has room.
- **REGISTRY FLOCK BLOCK (10:11–10:12Z):** after registration, `worktree-heartbeat.sh` timed out twice — the flock on `~/workspace/worktrees/REGISTRY.lock` was held by a stuck `worktree-reap.sh` subprocess chain from MY OWN registration (PID 13820 `bash scripts/worktree-reap.sh` + child 16454 python reaper, holding fd 200 since 09:58). The reaper was stuck ~14 min doing per-tree git status on this slow host. Killed 13820 + 16454 (my own registration's subprocesses; the reap is a cleanup step, registration itself had already completed), flock freed, heartbeat landed 10:12:44Z in 1.6s. The other agent's queued heartbeat (sim-bisect-r5-cut1-a) was unblocked too. **Confirmed the same morning in `~/AGENTS.md` (outside this run): REAPER LOCK SELF-CONTENTION — `worktree-reap.sh` holds REGISTRY.lock for its whole 9–14 min run while the cron fires every 10 min, so overlapping reapers queue on the lock. Fix owed, needs a Steve nod — not this run's to build.**
- **Combat-play gate (Steve 2026-11-10 17:52 CST):** no toughness/gear/ability tuning until the fight-play census lands. This run touches dialogue/instrument code only, so the gate does not bind it (same as r129/r130/r183).

## Q1 (PRIMARY) — PLACE-LESSON WILD PROBE (r183's named next step)

**Panel verdict: NO-FRAMES again — but the probe names the bottleneck, and the re-probe closes it.**

Panel (4 seeds, 51 sittings, analyzer `scripts/analyze-journey-deepening-r184-20261112.js`):
- **Q1-PLACEPROBE: sittings=51, withPlaces≥1=15, withPlaces≥2=11, askFieldPicks=4, askFieldLines=4, placeFrames=0 → bottleneck=SPEND-FIRST** (the label is the funnel's; the precise diagnosis is below).
- **Q2-PLACEFRAME: frames=0 → NO-FRAMES** (third consecutive panel: r129, r183, r184).

**The bottleneck, precisely (read from the code + the transcripts).** All 4 panel asks fired in sittings where the villager knew ZERO places, drawing the honest closer `"There's more, but that's for another fire."` — and in all 15 places-known sittings the field ask was offered ZERO times. The menu in those sittings offered `agency:ask_expedition` instead ("What did you see out there?"). The cause is in `villager-agency.js:1102-1110` (`agencyChoices`): when a villager has pending expedition news (`explorerNews[vid].agency`), the menu offers ONLY the expedition ask — the field ask is REPLACED, not added. Expedition news never expires and is cleared only by asking (`agencyTurn` deletes it), so for a villager with news the field ask stays hidden indefinitely. And the driver NEVER picked the expedition ask — it is in no picker list — so in sims the news never cleared all panel. The teach block is SHARED between the two asks (monster > plant > place), so a real player asking "What did you see out there?" gets the same place lesson — the lesson was reachable in real play all along; only the sim couldn't reach it.

**The fix (driver-only, this run).** Added `'agency:ask_expedition'` to the driver's ENGAGE list (same shape as the r129 favour-requirements and r124 want-after-secret picker fixes — harness-only, the game offers the same menu either way; a competent player who sees "What did you see out there?" asks it). One line + comment in `scripts/journey-deepening-r184-20261112.js`.

**Re-probe proof (same seed 100030, fixed picker, DAYCAP=100).** The panel record was frozen first (`hidden_files/evidence/2026-11-12/panel/`, 55 files), then seed 100030 re-ran:
- **Q2-PLACEFRAME: frames=18, sittingsWithFrames=7, distinctFrames=4, maxSameFrame=2 → VARIED.** All four r183 frames fired in the wild (trace 4, mark 6, remember 4, walk 4). No sitting repeats a frame more than twice — the 2× readings are pool cycling across sittings (the ledger persists across sittings by design; e.g. gen_4xriwfn d60 traces twice after the d45 sitting had already used walk/mark/remember). **The r183 rotation is CONFIRMED in the wild.**
- **Q1-PLACEPROBE: sittings=17, withPlaces≥1=7, askFieldPicks=30, askFieldLines=30, placeFrames=17 → bottleneck=FIRES.** The 18th frame came through the expedition ask itself (the probe counts only ask_field picks) — both asks teach places.
- **Q1-TEACHFRAME (plant rotation, r125): frames=17, distinct 4, maxSameFrame=1 → VARIED** — the plant rotation is also confirmed in the wild.
- The expedition ask was picked 7×; the news cleared; the field ask followed. Seed 100030 re-ran to the same outcome class (survived d101, pop 9, wave 4; meatK 37 vs panel 30 — the trajectory moved, the verdict didn't).

**Q1 verdict: GO.** The r183 rotation works in the wild; the panel's NO-FRAMES was a driver gap, now fixed in the driver. No game-code change.

## Q2 (SECONDARY, people-check dial) — "SOFTENS" / "WARMTH" CANNED GO-ON RESPONSES

**Verdict: NOT A DEFECT. No fix owed. The r133 reading was a misread — corrected here twice before scoring.**

The two lines are the **mood-GUARD beat** (`src/js/convo-mood.js:108-121`): when the player makes a WARMING move (`convoMoodShift(vid, delta>0)`) toward a villager with negative 5-day receptivity (recent hurts), the warming is absorbed and the guard beat is queued — picked by `convoPickCycle 'moodguard'` between the two lines, once per conversation max. The beat is SPOKEN only when the player later picks `goon` — the continuer reveals a held beat ("Nothing else happens this turn — the beats belonged to the turn that queued them", `conversation.js:6370`). So the trigger is the last NON-GOON player pick before the firing (the move that queued the beat), never the goon pick that reveals it and never the preceding THEM line. (Prereg Amendments A1→A2 record both corrections, made before any scoring, from reading the code + a full transcript.)

- **r183 after-corpus (primary, 110 transcripts — `convo-mood.js` is byte-identical between the r183 base and current master, verified by diff): softens 10, warmth 6, total 16.** Every firing's trigger pick is a genuine warming move: answering a personal question honestly (`ans:q_left_behind`, `ans:q_laugh:a_story` ×2, `ans:q_first_week:a_shock` ×2, `ans:q_dream:a_before`, `ans:q_guilty:a_tell`, `ans:q_angry:a_yes`, `ans:q_someone:a_tell`, `ans:q_think:a_end`), trying their language (`speak_back` ×3), teaching (`teach`, `agency:ask_field` ×2), answering yes (`gq:yn:yes`). **MISS 0/16.**
- **r184 fresh panel (confirmation, 51 sittings): softens 4, warmth 3, total 7.** Trigger picks: `teach` ×2, `gq:yn:yes` ×2, `speak_back`, `agency:ask_field` ×2. **MISS 0/7.**
- **Re-probe seed 100030 (same-seed confirmation under the fixed picker): 5 firings, all warming triggers. MISS 0/5.**
- **Total: MISS 0/23 independent firings (re-probe overlaps the panel seed, counted as confirmation).** The guard beat CANNOT fire on a non-warming move — `'moodguard'` is called only in the guard branch (`grep` confirms a single call site) — so a 0% MISS rate is by construction, and the human read of all 23 triggers agrees: every one is the player opening up to a guarded villager. The counts (10/6 on 110 sittings, 4/3 on 51) are the guard working, once per conversation max — not repetition spam. The r133 count (11× each, "rising") measured the guard firing correctly and often; the "go on" framing was wrong. **No fix is owed; the dial is closed.** The analyzer's `summarizeSoftWarm` (triggerPick attribution) is the instrument that settles it — keep it for future panels.

Worked example (read in full, r183 after-corpus seed 100019 day 45, Yara): the player tells her something funny (`ans:q_laugh:a_story`), she really laughs — "the first real one you've heard in days. Okay. Okay, that's good. I needed that." — and the next turn's goon reveals "Something in them almost softens — then doesn't. Not yet." She almost softens after shared laughter and holds back. That is the line doing its job.

## Q3 (census) — the villages in plain words

3/4 villages survived to day 100–101; one lost (seed 100027, day 96, scatter-hunger — pantry empty, 1 person left when the village scattered; debrief attributed 1/1). Survivors ended with 5–9 people alive. Every village reached wave 4; seed 100027 reached wave 5 before it fell. Deaths are the fighting shape, not the hungry shape: 58–78 deaths per village over the run, dominated by 'villager combat' (30–47) and 'combat', with expeditions and the wild taking the rest — the survival-collapse shape (dying fighting, not hungry) that Loop B is hunting; carried, not this run's. No starvation deaths on survivors, no thirst, no sickness deaths.

The villages know things and use them. Monster meat is hauled, tested, and cooked on every seed: 27–37 kills, 4–14 tests, 1–11 dinners. Belltoad is correctly identified as poison on three seeds (tested, never eaten as safe); hushwolf, drumbelly, gallowdeer, bulldozer and others go from unknown to food-safe across the run, and the safe list grows from 2 species at day 50 to 6–11 by day 100. Villagers know places: 1–5 each by day 45–80, and in the re-probe they teach them (18 place lessons on one seed). The Standing ladder opens on all four seeds, mints all five tracks, holds all four, first days all 14, stage 3 everywhere; standing 200–462, scale regional on three seeds and global on one (100028). Bonds are alive: 39 proposals panel-wide, 16 decided, 8 accepted (50%), 7 link raises, 14 bonds initiated. Requests staged 34, decided 23.

Per seed: 100027 lost d96 (scatter-hunger; wave 5 reached; standing 240, regional); 100028 survived d101 (8 alive, wave 4, standing 462, global, 3 links); 100029 survived d100 (5 alive, wave 4, standing 225, regional); 100030 survived d101 (9 alive, wave 4, standing 200, regional; re-probe: survived d101, pop 9, wave 4).

## Q4 (carried, read-only)

- LADDER: opens 4/4, mints 5/5 tracks, holds 4/4, firstDays all 14. Identical shape to r183.
- REQUESTS: staged 34, decided 23, expired 10, REACHED. BOND-CHOICE 23/23 answered. B-SIT: 16 betrayal sittings, accept 10 / decline 6 / unanswered 0. P-KEEP: 7 threads (NAMED 4, DEAD 2, SILENT 1). FIZZLE 0 — fix holds. MENU-FLIP 0. LANGGATE NOT-REPRODUCED (offers 23, 0 'none'). LANGARC ARC-UNEXERCISED (2 sittings, 0 grants). REPLAY 0. D-THING 6 pocketed / 3 testable / 1 named. RAJ-PHOTO 0.
- GOALJOIN: HEALTHY on every track (knowledge capture 1 — thin but >0; r183 read GOALS-FAULT there with capture 0). TRUST carried (TRUST-EARNED-ONLY, 0 stranger gains, 44 known gains).
- FAVOUR-BLOCK: VARIED (total 7, distinct 3, maxRepeat 3, share 43%). PARTNER-BLOCK: VARIED (total 6, distinct 4, maxRepeat 2). AWAY: REPETITIVE (total 6, distinct 3, maxRepeat 3 — the `rightnow` variant 3×) — but every sitting fires at most once (maxRepeat 1 per sitting, all 6 rows), so this is the same small-sample first-pick draw r183 diagnosed for favour-block (A2), NOT a regression on the rotation. At n=6 the share bar is verdict-unstable; the per-villager guarantee holds perfectly.
- CISTERN clean (0 bad, 0 good). DEBRIEF 1/1 attributed.
- **Watch — SECRET-SILENT:** 0 confession openers in 51 sittings (Q1-SECRET, Q1-VARIETY THIN-PROBE, Q1-WANT NO-ANSWERS all read 0). The secret/confession content never fired this panel. Not a verdict — the opener needs high trust + specific conditions, and 51 sittings is a thin sample — but the next deepening run should check whether the confession path has gone quiet or this panel was just unlucky. V-INIT also 0 (no NPC-initiated bonds; player invites offered in 36 sittings) — same standing shape as r183.

## People check (transcripts read in full)

Villagers read like people. The Yara sitting (above) is the cleanest guard-beat example on the panel: shared laughter, a real laugh after days, then the almost-softening that doesn't come — the line lands because the warmth before it was earned. Tariq corrects the player's Hindi and can't leave it standing that wrong ("That was — no. Say it like you mean it.") — a person, not a menu. Rini lights up teaching the player's mouth the shape of a word. The place lessons in the re-probe read as real teaching: "a ridge with a view for miles — walk it with me sometime and you'll know the ground. It's real." The plant lessons vary properly (Blackberry, Jamun, Mahua, Mayapple, Bilberry, Maracujá — four distinct frames, maxSameFrame 1). No fabricated shared history, no filler loops in the sittings read. What was read in full: the Yara d45 sitting, all 23 guard-beat firing contexts (trigger pick + preceding line), and the re-probe place-lesson sittings; the remaining panel transcripts were scanned by the analyzer with the detail rows reviewed.

## Metric review

- Q1: the panel's NO-FRAMES was NOT a fix failure — the probe named the bottleneck (expedition-news replacement + driver never picking the expedition ask), the one-line driver fix unblocked it, and the same-seed re-probe reads VARIED with all 4 frames. The pre-registered "NO-FRAMES with the bottleneck named" outcome is exactly what happened, and the fix followed inside the run rather than waiting for the next one. The funnel instrument (`summarizePlaceProbe`) is the right tool for this class of question — keep it.
- Q2: the MISS metric was corrected twice before scoring (A1: preceding THEM line → firing pick; A2: firing pick → queuing trigger pick). The final metric is the right one — the beat is queued on the warming turn and revealed by goon — and the verdict is unambiguous (0/23). The r133 "rising counts" observation is retired: counts of a correctly-firing guard are not a defect signal. Future panels should count the guard beat but judge it only by trigger picks.
- The 4-seed pilot-scale panel was enough for both questions (the probe's funnel and the guard-beat read), but the SECRET-SILENT watch wants a full 8-seed panel next run — 51 sittings is thin for rare content.
- Q2 favour/partner lines stayed VARIED (r130 rotation holds); away's REPETITIVE is the known first-pick small-sample shape, per-sitting maxRepeat 1.

## Telemetry

`telemetry-check.js` vs the deepening baseline (guardrails.deaths, guardrails.popAlive, guardrails.pantryKcal, c3.starvationDeaths; panel JSONs in `hidden_files/evidence/2026-11-12/panel/`): **quiet, no large deviations**. Baseline NOT rolled forward: the panel is a probe panel, and the baseline stays until a future run decides otherwise.

## Landing

- Commit: [FILL at commit time].
- Gate: `node scripts/check.js --quick` in the worktree — **331 passed, 9 failed in 1358s — GO.** The 9 are the identical pre-existing set (r133's 335/5, r183's 330/10, same shape): 5 × 120s timeouts (living-garden, occupation-panels, one-person-army, trust-observer-neutrality, synergy-stall) — 4 of the 5 verified green standalone (cache-flags 4/4, synergy-stall, occupation-panels, trust-observer-neutrality all exit 0); the 2 deed-attainment tests (living-garden, one-person-army) still time out even serially at 300s under this box's sibling-sim load (they progress through seeds 6/8/2026/31337… and never finish in the window) — the same 120s timeouts r133 recorded, not a regression. 2 × measurement-proof staleness pair (proof-update "Proof source inputs are not current" + workflow 8/9) — STANDING, carried. 1 × phone-frame-proof stale receipt — STANDING (the stale inputs are index.html, foreignSpeech.json, regions.json, statusEffects.json, table-endings.json, alienPlayers.js — none of them touched by this run, which changes scripts/ only). 1 × measurement-cache-flags — verified green standalone 4/4. Zero new failures from this run's change. Proof test `scripts/test-journey-deepening-r184-analyzer-20261112.js`: **11/11 green** (RED-verified against the r183 analyzer).
- Merge: [FILL at merge time].
- Rotation 2→3 written at closeout. Lock deleted.

## Carried (not this run's to build)

SECRET-SILENT watch (confession path quiet on 51 sittings — 8-seed re-check next run); V-INIT 0 (NPC-initiated bonds — standing); Baraka unvoiced raise; Stella/Nathan trap-line invitation swallowed by raise-answer template; guest deaths (Bing) prereg; survival-collapse cause (combat side — Loop B bisect is the top job); scholar-payment open item (Steve-call); scale.json baseline regime re-label; preserve_food has no villager-side job; taken-kin pod sentence / deflect pivot / quiet-place walk / stockpile / night-thread repetition items (r128 counts); r171 M2b scholar-open proof still owed; measurement-proof refresh (fresh neutral panel + `balance-proof-update.js`) — this run's change is driver/analyzer-only, so the pair is carried, not rebuilt; reaper-lock self-contention fix (needs a Steve nod).
