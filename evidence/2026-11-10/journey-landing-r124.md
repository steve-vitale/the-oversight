# journey-landing r124 — RUN NOTE (Lane A, leg 0 LANDING, days 1–14 judged, horizon d28)

**Run id:** playtest-loop-a-20261110T1345Z (scheduled Tue 2026-11-10 13:45 CST, started ~19:44Z).
**Base:** local master `70e3af870` (sim-diplo-a, pending ship). Branch: `journey-landing` (worktree).
**Seeds:** the r121 band 1142–1151, DELIBERATE REUSE (the Issue 2 defect reproduces on 1142/1148). DAYS=28, BEFORE/AFTER matched (§15). BEFORE = r123-before driver verbatim except seeds/OUTDIR/header (r121 driver: press-stop + stepping hop, flee gates OFF); AFTER = the same driver verbatim except seeds/OUTDIR/header — the ONLY delta is the Q1 src fix. Driver diff verified: header + OUTDIR only.
**Lock:** created 19:44:22Z, run_id `2026-11-10T19:44:22Z`. Heartbeat loop `/tmp/hbloop-r124.sh` (PID 24105, every 10 min); registration took ~9 min (registry-lock contention + slow checkout, cf. r123 ~155s).
**Pre-flight deviations (LOUD, recorded, standing state):** `git pull --ff-only` FAILED — local master diverged from origin/master (ahead 457 / behind 156, merge-base d229b58f5; same standing state as r120–r123; ship loop owns reconciliation, and a Steve-approved reconcile branch exists but is BLOCKED on person-trust errand-mix, not landed — main-session owned, untouched by this run). Proceeded on local master. Main tree clean; disk 35%. Tendexact adoption: NOT owed — the fix already landed as e6911eb80 + evidence 46459ac83; dangling be3fb880c is the pre-rebase copy. r123's observe fix is on master (57e0eb67b).
**Rotation:** read 0 → leg 0 LANDING; closeout writes 0→1.

## Verdicts

### Q1 (PRIMARY) — ISSUE 2 WANT-BRIDGE REPEATS VERBATIM: GO (fix built, proven, panel re-run)
- **Root cause (read pre-panel, confirmed on this band):** both repeated lines are the WHOLE `BRIDGES.want` pool (convo-beats.js:182, 2 lines). `bridgeLine` draws via `convoPickCycle` (convo-beats.js:190), which cycles without replacement then reshuffles keeping the last `min(3, pool.length − 1)` = 1 line (conversation.js:2935). With a 2-line pool the cycle is strict alternation A,B,A,B — a third want-bridge in one sitting repeats a line heard two turns earlier. Deterministic, not a fluke.
- **This band reproduces it (BEFORE):** 1142 d6 Jenny — "Forget I said anything. What did you want?" ×2 in one sitting (driver flags `!! VERBATIM REPEATS (1)`); 1148 d6 — BOTH want lines ×2 each (lines 29/67/118/192, the strict alternation predicted by the code read; driver flags `(2)`). BEFORE verbatimRepeats = 4 across 3 sittings (the third is a personal-pool repeat, see below).
- **Fix (one src change):** `BRIDGES.want` 2 → 6 distinct lines (same voice — a villager backing off their own want and handing the floor to the player; the two original lines stay as entries 1–2). No other call-site change.
- **Proof test:** `scripts/test-journey-landing-r124-want-bridge.js` (3 cases, separate processes: pool / window / control). On UNFIXED code: **2 FAILURES** (pool: 6 calls alternate B,A,B,A,B,A → distinct=2; window: repeat inside the 3-window). After the fix: **ALL GREEN** (13 checks; the 12-call window case serves all 6 lines, then reshuffles into a different order, never repeating within 3).
- **Panel re-run:** AFTER driver re-ran on seeds 1142–1151 post-fix. Want-bridge repeats in a sitting: **3 → 0** (no transcript file has either original line more than once; the new lines are served live — "Look, forget it. You wanted something?", "...Never mind me. What were you going to say?", "That can wait — it isn't going anywhere. What's on your mind?"). verbatimRepeats 4 → 1 (the one remaining repeat is the personal pool, below). The 1142-d6 Jenny sitting now serves three DIFFERENT want-bridges (turns 2/7/11) and ends engaged (curious stage 3); the 1148-d6 sitting serves FOUR different ones and keeps its naming-vote thread. The observe fix holds (justSaid 0; two observes serve different reactions).
- **Census: 10/10 identical in every number.** The field-by-field diff of the scrubbed census JSONs finds 0 numeric differences; the only text differences are 29 stack-trace file paths (the r123 class) and 1 `themSoFar` line quoting the new bridge line. No RNG-stream shift at all — better than the prereg's 9/10 bar. All verdicts re-checked on the post-fix corpus and holding (Q2, Q3, Q5, zero-DMG, navlog clean, HUNGRY 6/10, kill mean 29.8).
- **Remainder (next voice-pass item, NOT this run's fix):** the personal bridge pool (`BRIDGES.personal`, also 2 lines) repeats the same way — 1150 d6 serves "Anyway. What did you want?" ×2 in one sitting (and "That's me, I guess. What's on your mind?" ×2 with a voice closer on the second, so exact-match misses it). The prereg scoped this fix to `want` and set the bar at ≥3× in a sitting; the personal repeat is ×2, so it becomes the next item rather than a blind expansion of all 11 two-line pools. The structural point stands: EVERY 2-line bridge pool can repeat within a sitting; the voice pass should cover them all, one pool at a time with its own proof.

### Q1-FLEE — RETIRED (per r123 metric review, no panel burned)
- No flee panel run this run. The gates stay out of both drivers. The code-level defect (legacy branch never pushes) stands as a known, unreproduced shape until a flee-loop death is observed in the wild again.

### Q2 — M-PR1 / M-PR2: GO
- AFTER: sittings=18, offered=12, picked=12, promised=9, statedAfterPick=3, **neverOffered=6, settled=0** — IDENTICAL to r123's post-fix numbers (the census is byte-identical in numbers, so this is the same corpus shape, re-measured).
- Per-seed never-offered ≤1 on **9/10** seeds (only 1147 has 2: d12 Marcus + d13 Aki) → **holds** (bar ≥8/10).
- The 6 never-offered sittings were read in full: all are short sittings where the player left before the favor surfaced, or the sitting was about a case (1148 d11 James: the ambush of Elif dominates; 1144 d12 Sanne: the player leaves at the opener; 1147 d12/d13: betrayal declined, then left; 1146 d9 Ursula + 1151 d12 Brian: the naming debate / ambush case runs the sitting). No commit could have been offered — the game is correct, the metric absorbs them.
- M-PR2: promised/(picked − away-guard) = 9/(12−3) = **100%** ≥ 80%. All 3 stated-after-pick are the away-guard line.
- The settled-favor exclusion did NOT fire (settled=0) — no settled sitting exists in this corpus. The instrument is proven (r122); this panel adds no new evidence for it.

### Q3 — PRACTICE: GO
- movedCells d1→d28 = **95**, attributed=95, seedsWithMove=10/10, skill0→pos=24, practiceReps=2857 — IDENTICAL to r123's post-fix numbers.
- Movement by task: wood 28, stone 29, deadfall 5, water 22, cook 11; hunt/forage/fish/scout/patrol 0.
- Hunt reps 0 again (298 kills, 0 hunt practice) — the r117 hunt-assignment policy question carries, unchanged (seventh panel running).

### Q4 — FAR-UNREACHED GEOMETRY: NAMED (investigation, no fix in this run)
- **The geometry is a combat-interrupted chain, not a routing failure.** The 5 unreached nodes are all on ONE chain — 1150 d9 Henry's evening leg — and all five hopDetails read `from=(0,0) steps=0 reached=False blocked=null`. A debug probe (seed 1150, DAYS=10, instrumented driver copy, since deleted) reproduced the shape exactly and proved the cause: the hop loop never attempted a step — `tryStep` was never called, so no HOP-DEBUG line printed for those five hops. The only HOP-DEBUG line in the run is the creek blockage at (3,4)→(3,3) on the successful hop INTO (0,0).
- **What happened:** the hop to (0,0) reached in 8 steps (detouring around the creek). The approach + press at (0,0) triggered a monster encounter mid-press — a sanjun ("The Mountain Lord", wave 1, 89 HP) with allies Henry, Blanca, Tao; the fight record's stack runs `performForageFavor → doAction → tickAction → monsterTurn`. The fight was won in 3 rounds (the scholar struck). But the evening leg checks `inCombat()` only once, before the node loop — it never drives the fight between nodes — so every subsequent hop exited instantly on the `inCombat` guard with steps=0 and no named block (H-OTHER:5). The scholar ended the day stranded at (0,0); day 10 the rescue walked home 8 steps; the promise broke on day 11 (departed, no deliver).
- **Why it recurs identically:** the sanjun encounter at (0,0) on d9 is deterministic on this seed — the same chain breaks the same way on r122/r123/r124. The r121 GO ("the hop reaches what it can reach") stands: the hop itself reached (0,0) through a creek detour, and 1142 d10 reached 6 edge targets (7,2), (4,8), (8,2), (4,0), (8,3), (8,1) — edge tiles ARE walkable, so the edge theory is dead. The "far-unreached" count misattributes a fight interruption as a hop failure.
- **Follow-up (not this run):** the evening leg should drive the fight when `inCombat()` is true before a hop, then retry the hop — and the analyzer should classify "chain interrupted by combat" separately from "hop failed to route". A competent player fights the monster and walks on; the driver records the nodes as unreached instead. Also a real player-visible consequence: a mid-outing fight strands the pair overnight and breaks the promise — the evening leg has no post-fight resume.

### Q5 — M6 DOORSTEP-OUTINGLIVE: UNTESTED (fourth consecutive run) — CHECK MOVES LEGS
- 0 real triggered steps: all 278 doorstepSteps carry `skipped: "already-inside"` (62) / `"fed-and-watered"` (213) / `"not-at-haven"` (1) / `"in-combat"` (2). The counts are identical to r123 — the census didn't move.
- **Code read (why it never fires):** `havenDoorstepStep` runs once per day after outingWork, before sleep. A triggered step needs ALL of: at Haven, NOT already inside the hall, NOT in a tent, AND hungry (kcal < 50% cap) OR thirsty (hyd < 25). The competent policy's daily flow puts the scholar inside-and-fed by that check point every day: the day's work ends inside, and the policy eats/drinks during the day, so kcal rarely drops below half-cap by the doorstep check. The original trap (r88: scholars sat outside the hall at kcal 0/hyd 0 for days) was a failure of an OLDER policy; the current policy has engineered the precondition away — the doorstep rescue (`guardEatOnArrival`) exists and fires when needed, but the need never arises in days 1–28.
- **Verdict:** the landing leg cannot exercise this instrument. The check should move to a leg where the scholar arrives at Haven needy from travel (deepening/scale road returns — the R84/R85 rescue path IS the same shape and fires there: 3 kcal rescues this run), or be re-scoped as "rescue needed vs rescue given" — 0 firings over 4 runs under this policy is evidence the trap is absent, not that the instrument is untested. Either way, landing is the wrong leg for it. Carried as the decision for the next run's prereg.

### Q6 (carried) — M7 GOAROUND: GOAROUND-HOLDS + RESCUE-GO
- R84 kcal: arrivals=3, arrived=3 (100% ≥ 80%). R85 kcal: skips=3, complete=3 (100%).

## Carried bindings (judged fresh on the post-fix AFTER corpus)
- **M1 ALIVE-D14: 10/10** (pop 9–12 at d28; 9 villagers lost across 10 villages, 0 starvation deaths).
- **M2 SYSTEM CONTACT: 10/10** (d8 ×9, d9 on 1143).
- **M3 FIGHT-LOG:** 15 fights, 0 unknown/mixed trigger (lockpick_raccoon 7, statickite 2, sanjun 1 — the 1150 d9 evening fight — gallowdeer 1, others 1 each), 0 missing endResult, 0 lost.
- **M5 PEOPLE: PASS** (sense-read below).
- **Zero-DMG invariant: PASS** (15 fights, 2 zero-dmg, both classified: pending-face no-strikes, rounds=1, end=routed, monster at full HP — 1147 d27 Loud-Eyes, 1151 d19 Lockpick — the r121 "monster chooses to run at face-off" shape, honest).
- **Miriam line: 0** "That's settled" across all transcripts.
- **R66 HUNGRY:** 6/10 seeds with pantry <2000/person at d28 (990, 1904, 1832, 1916, 764, 1255 per person), **0 starvation deaths**. Leanest 1147 at 764/person; fattest 1150 at 4203.
- **R73 narrow windows:** NARROW 9, kept inside narrow 3 — NARROW-PATTERN holds (identical to r123).
- **Mantle latency:** VACUOUS — zero holder deaths on this panel (fourth run running: r122, r123, r124 all vacuous on this band).
- **1130-d6 amnesia shape: 0 recurrences.**
- **Scholar-turns watch:** verbTotals player-move=4, wait=0, barrier-exit=0, ability=0. No living 0-strike ≥3-move fight.
- **Deflect-fallback repetition:** worst sitting **1×** for the want-bridge (down from r123's 2× — the fix moved it); the remaining worst is the personal bridge ("Anyway. What did you want?" ×2, 1150 d6 — see Q1 remainder).
- **6394 flat fall-through:** 0 occurrences.
- **Kill-mean trend:** 29.8/seed (r120 31.1 → r121 26.1 → r122 26.5 → r123 29.8 → r124 29.8 — flat, seed mixture).
- **Poison re-test:** 0 live re-tests (the 22 "poison" hits in census JSONs are flesh-arc/word matches, not re-tests).
- **Scholar-eats-first:** held design question, not changed. **M-A2:** not re-measured (DELIVER OVER MEASURE).
- **Presshop (carried Q1/Q2 outing shape):** pressFailEvening 1 (bar AFTER ≤2, holds), strippedSecondFails 0, togetherStopped 8 (all g3After=0). Far-unreached 4 → 4 — adjudicated in Q4 (combat interruption, not hop failure).

## Village assessment (plain words)

Ten villages, all alive at day 28 (pop 9–12 from a 12 start; nine people lost across the ten villages, none to starvation). The System arrived on day 8 (day 9 on Blanca's village) in every one. People are learning: 24 villagers picked up a brand-new skill from nothing, 95 competence cells moved. Denise checks the pantry before heading out; Ursula gathers deadfall day after day and gets visibly better at it. The beast-naming debate is a living argument: on James's village the red moon between the trees is "The Loud Stare" (Roberto, Jude, Wei, James, Elif) against "Don't-Look" (Ivy) and "Big-Bane" (Jovan); on Aki's village the bamboo stripes are "The Loud Beast" (Ruth) against "The Ugly Beast" (Joseph) and "Big Big" (Xiaoli) — nobody agrees, and the village keeps voting. The hard villages fight as parties: Vera's village killed 54 monsters in 28 days, Sophia's 42. The scholar fights now: 48 strikes across 15 fights (the fight log records the scholar striking in the won fights), 9 won, 6 routed, none lost — and on Amanda's village the scholar, Henry, Blanca and Tao beat a Mountain Lord together on day 9 after it jumped them mid-forage. The pantry is the pressure: 6 of 10 villages end the month under 2,000 kcal per person, and nobody starved — they just run lean, the leanest at 764 per person. Cases run through the conversations: the ambush of Liam, of Kgomotso, of Aki, of Elif, of Scott — villagers press each other about that night, and the village hasn't settled it.

## People check (full transcripts read)

Read in full: 1142-day6 (Jenny, the Q1 sitting); 1148-day6 (Ivy, the other Q1 sitting); 1150-day6 (Wei, the personal-repeat sitting); 1144-day12 (Sanne) + 1146-day9 (Ursula) + 1147-day12 (Marcus) + 1147-day13 (Aki) + 1148-day11 (James) + 1151-day12 (Brian) (the never-offered sittings).
- **Jenny's sitting works — and now sounds like a person changing her mind instead of a loop.** She asks what the player learned since arriving; the player answers "How to be hungry and keep going anyway"; she answers back ("The fundamental skill. Everything else is decoration."); the three want-bridges are three different deflections ("...Never mind me. What were you going to say?", "Forget I said anything. What did you want?", "Sorry — I shouldn't load that on you. What's up?"); the tension thread lands ("Everyone's choosing sides and pretending they aren't. I hate it."); the wind-down surfaces, the "one more thing" beat lands ("I eat fast and leave early. Not hiding. Just — scheduling."), and the sitting ends engaged. The NPC wants something, the options engage it, the ending resolves.
- **Ivy's sitting is the richest of the panel.** Four different want-bridges; she sketches a map in the dirt ("Don't go there after rain. And this one's worth the walk."); the belonging thread ("I want to be part of the 'we' when people say 'we made it.'"); the naming vote ("Big Loud" vs "Big-Eyes"). Nothing repeats; nothing stalls.
- **Wei's sitting is good except the one repeat.** "Stealing joy. I like that. We should steal more of it, friend." / "I think better when it's quiet. And out here, thinking is surviving." — but "Anyway. What did you want?" fires twice (turns 119/227), and "That's me, I guess. What's on your mind?" fires twice with a closer on the second. The personal pool is the same 2-line defect in miniature; it is the next voice-pass item.
- **The never-offered sittings are honest.** Marcus and Aki both open on a betrayal invite the player declines ("Right — another time.", "Fair enough. Rain check."); the player leaves after one exchange, so no commit could be offered. James's sitting is about the ambush of Elif — the favor never surfaces because the conversation is about the case, and the player leaves. Sanne's is 0 turns: the player leaves at the opener. Brian's is the naming debate plus the ambush of Scott. None of these is the game failing to offer; the metric's per-seed bar absorbs them.
- **Betrayal held-offers:** declines acknowledged, invites not forced. Party invites spoken/dry: no dry invites on the read sittings.

## Reachable / fun / winnable (leg 0)

- **Reachable:** the landing content fires on every seed — System contact d8/9, favors asked (43), chains completing (kept 3, far haul on 4), practice moving, the naming debate, the goaround rescue (3/3). Nothing in the leg is gated behind unreached content.
- **Fun:** the village feels alive (gossip mutating, pantry-aware foraging, the naming argument, the ambush cases running through conversations) and the scholar now fights — 48 strikes, no losses — where r121's scholar walked into fatal fights. The want-bridge fix removes a moment where an NPC repeated herself verbatim twice in one sitting; the sittings now sound like a person deflecting, not a loop.
- **Winnable:** leg 0 is the first fortnight — no win is expected here, and none is claimed. The chain toward it (practice moves, kills 29.8/seed, parties forming on Vera's and Sophia's villages, trust pairs forming) is intact and flat vs r123.

## Telemetry

Check run against the post-fix AFTER corpus vs `telemetry-baselines/landing-split.json` (r66 roll; `landing.json` is superseded — do not compare against it). **3 LOUD lines, all EXPLAINED, baseline NOT rolled** (identical to r123):
1. `systemDay 33 → 81 (+145%)` — seed-count artifact: 81 is the sum over 10 seeds (per-seed mean 8.1, baseline 8.25 over 4 seeds). First contact is d8–d9 on every seed, unchanged.
2. `monsterKills 24 → 298 (+1142%)` — seed-count artifact (10 vs 4 seeds) on a baseline that predates the current driver's fight count. Per-seed mean 29.8, in line with r120 (31.1), r121 (26.1), r122 (26.5), r123 (29.8) — stable, not a surge.
3. `folTelemetry.fires 0 → 9` — the follow-volunteer signal postdates the r66 baseline. A new signal, not a regression.
- villagerDeaths (9, matches baseline exactly) and starvAutopsies (0) quiet. Baseline NOT rolled: the checker's values are panel-size-dependent sums (10-seed vs the baseline's 4-seed roll), so rolling from this panel would bake in a size mismatch for the next run. The next landing run should roll the baseline from a same-size panel, or normalize per-seed first (carried from r122/r123).

## Metric review

- **Q1's metric worked as designed** — the proof test failed RED on unfixed code (2 failures, exactly the predicted alternation) and went ALL GREEN on fixed code, and the panel confirmed the lived effect (want-bridge repeats 3 → 0 in a sitting) with a census that moved in NO number. The "9/10 identical, any divergence adjudicated by cause" bar from r123's metric review was not needed: 10/10 census files are identical in every number (only stack-trace paths and one quoted line differ). The rejection-sampling draw-count shift I worried about in the prereg did not materialize — worth noting for the next pool-expansion fix: expanding a pool does not necessarily shift the stream.
- **Q4's metric needs the same honesty as Q1-flee's retirement:** "far-unreached" as a number has now been NOT-MET on three consecutive bands (r122 3→3, r123 4→4, r124 4→4) with the same deterministic cause (a combat-interrupted chain on 1150). The number measures a misattribution, not the hop. Proposed revision for the next run: split the instrument — "hop failed to route" (steps>0, no named block, no combat) vs "chain interrupted by combat" (inCombat at hop time) — and judge the hop on the first only. Until then, far-unreached stays NOT-MET by construction on this band.
- **M6 (doorstep) is now UNTESTED on four consecutive landing runs** (r121, r122, r123, r124) — the trigger (hungry/thirsty Haven day, outside the hall) never fires in the landing window because the competent policy ends every day inside-and-fed. Either the trigger needs a leg that exercises it (deepening/scale road returns), or the check should be re-scoped as "rescue needed vs rescue given". Landing is the wrong leg for it; the next landing prereg should move it, not carry it again.
- **The settled-favor exclusion had no settled sitting to fire on this run** (settled=0) — the instrument is proven (r122) but this panel adds no new evidence for it. It stays in the instrument; no action.
- **The personal bridge pool is the next voice-pass item** (see Q1 remainder): "Anyway. What did you want?" ×2 in the 1150-d6 sitting. The other 2-line bridge pools share the defect shape; the voice pass should cover them one pool at a time, each with its own proof — not a blind expansion.

## Tooling (this run)

- **Drivers:** `scripts/journey-landing-r124-before-20261110.js` (r123-before verbatim except seeds 1142–1151, OUTDIR, header) and `scripts/journey-landing-r124-20261110.js` (same file, different OUTDIR; the only leg delta is the src fix). Diff verified: header + OUTDIR only.
- **Analyzers:** all standing r118–r122 instruments, unchanged. **New:** `scripts/test-journey-landing-r124-want-bridge.js` (3 cases, separate processes; 2 FAILURES unfixed → ALL GREEN fixed). **Debug (deleted, not committed):** `scripts/journey-landing-r124-debug-hop.js` — an instrumented copy of the BEFORE driver that proved the Q4 cause (hop loop never attempts a step when inCombat; only one HOP-DEBUG line in the whole run, the creek blockage on the successful hop into (0,0)). Its census is kept in hidden_files as `landing-r124-debug-hop/` for the Q4 attribution.
- **Pilot gate:** PASS (3 seeds, BEFORE driver; 0 FATALs; practice snapshots present; the defect reproduced in the pilot corpus — 1142 d6 "Forget..." ×2, driver-flagged).
- **Proof:** the Q1 fix is proven by the test (unfixed FAIL / fixed GREEN) and by the panel (want-bridge repeats 3 → 0 in a sitting, census 10/10 identical in numbers).

## What changed (this commit)

- `src/js/convo-beats.js` — `BRIDGES.want` 2 → 6 lines (4 new deflections, same voice; originals kept as entries 1–2). The only game-code change.
- `scripts/test-journey-landing-r124-want-bridge.js` — new proof test.
- `scripts/journey-landing-r124-before-20261110.js`, `scripts/journey-landing-r124-20261110.js` — panel drivers.
- `evidence/2026-11-10/journey-landing-r124-prereg.md`, `evidence/2026-11-10/journey-landing-r124.md` (this note).
- Corpora (hidden_files evidence, not committed): `landing-r124-pilot-before/`, `landing-r124-before/`, `landing-r124-after/`, `landing-r124-debug-hop/`.

## Gate

`node scripts/check.js --quick` (worktree, with the fix): **294 passed, 6 failed in 466s** (re-run after a runtime restart wiped the first gate's /tmp log at ~290/300 scripts; the re-run is the adjudicated result). All 6 failures adjudicated standing — none names convo-beats.js, the want-bridge, or the new proof test:
- **Measurement-proof staleness pair (standing, r121):** `test-measurement-proof-update`, `test-measurement-workflow` ("retained neutrality proof covers the current Game/controller/harness inputs"). Fails identically without this run's changes — the staleness predates this run. Refresh (`scripts/balance-proof-update.js`) is owned by the measurement-maintenance lane, not this landing.
- **Standing profile (r120/r121):** `test-mobile-combat-cadence` ("Continue does not wrap the announced round a second time"), `test-occupation-panels` ("real CLI workflow completed"), `test-phone-frame-proof` (retained browser input / boot inputs / phone receipt stale), `test-establishment-r20-fixes` (racks-full voice "next day voices once more": expected 2, got 1).
- The Q1 proof test passes standalone (ALL GREEN; 2 FAILURES on unfixed code), and the panel re-run's verdicts hold. No regression from this run's change.
