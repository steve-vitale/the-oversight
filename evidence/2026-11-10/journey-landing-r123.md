# journey-landing r123 — RUN NOTE (Lane A, leg 0 LANDING, days 1–14 judged, horizon d28)

**Run id:** playtest-loop-a-20261110T0445Z (scheduled Tue 2026-11-10 04:45 CST, started ~10:45Z).
**Base:** local master `53185abea` (sim-meleefirst-b adoption, pending ship). Branch: `journey-landing`.
**Seeds:** the r121 band 1142–1151, DELIBERATE REUSE per the r122 metric review ("seed the panel from the r121 defect seeds"). DAYS=28, BEFORE/AFTER matched (§15). BEFORE = r122-before driver verbatim (r121 driver: press-stop + stepping hop, flee gates OFF); AFTER = r122-after driver verbatim (BEFORE + COMPETENT_DIRECTIONAL_FLEE=1 COMPETENT_EXIT_VERIFIED_FLEE=1 COMPETENT_FLEE_REPAIR=1; DPS_RACE off, FIGHT_ASSESS off — flee execution only). Driver diff verified: header + seeds + OUTDIR + the gates block, nothing else.
**Lock:** created 10:43:25Z, run_id `2026-11-10T10:43:25Z`. Heartbeat loop `/tmp/hbloop-r123.sh` (PID 4306, every 10 min); registration took ~155s (slow checkout, no flap).
**Pre-flight deviations (LOUD, standing state):** `git pull --ff-only` FAILED — local master diverged from origin/master (same standing state as r120/r121/r122/r167; ship loop owns reconciliation). Proceeded on local master. Main tree clean; disk 34%.
**Rotation:** read 0 → leg 0 LANDING; closeout writes 0→1.

## Verdicts

### Q1 (PRIMARY) — THE FLEE THAT NEVER LEAVES, MECHANISM RE-TEST: UNTESTED (before-validity condition fires)
- Fleeloop analyzer (r122 instrument, proof-tested): BEFORE flee-loop deaths **0**, AFTER **0**; scholar fight deaths **0 → 0**; fights 14 → 14.
- The prereg's before-validity condition (r122 metric review, binding) says: if the BEFORE side shows 0 flee-loop deaths, the run is UNTESTED on mechanism, not GO. **Verdict: UNTESTED.**
- The defect does not reproduce on its home seeds on current master. The r121 fatal fights never stage: 1143 has no d11 gallowdeer fight (Blanca lives; her fights are d8/d15 lockpick routed + a d23 statickite WON with 16 scholar strikes), and 1148 has NO scholar fights at all (Jian never fights; no d25 arena contest fires for him). The villages diverged upstream from r121 — the base moved (melee-first slot rule, alien-fallen fix, crisis r168, and more) and the trajectories that produced the fatal fights no longer occur.
- The BEFORE/AFTER census JSONs are identical except file paths and stack-trace line numbers: the flee gates changed not one sim outcome on this band, because no fight ever reached a flee decision where the gates matter (14 fights: 9 won, 5 routed, 0 lost; the scholar struck in every fight that lasted past the face-off).
- The code-level defect still stands as read (r122): the legacy flee branch never pushes (competent.js:3542 `dpsRaceOn()` guards the only barrier push; the fall-through walks to the nearest x-edge and `findPath` returns `[[0,0]]` for start==target, a successful no-op). But no panel on current master reproduces it, so the gates remain unproven — and unneeded — on every band run since r121. See Metric review.

### Q2 — M-PR1 SETTLED-FAVOR EXCLUSION: GO
- Revised instrument (r122): AFTER sittings=18, offered=12, picked=12, promised=9, statedAfterPick=3, **neverOffered=6, settled=0** (post-fix corpus; pre-fix 17/11/11/9/2/6/0 — the extra sitting is 1142 d12, offered, away-guard stated; the RNG shift added it, see Q8).
- Per-seed never-offered ≤1 on **9/10** seeds (only 1147 has 2: d12 Marcus + d13 Aki) → **holds** (bar ≥8/10).
- The 6 never-offered sittings were read in full: all are short sittings where the player left before the favor surfaced, or the sitting was about a case (1148 d11 James: the ambush of Elif dominates; 1144 d12 Sanne: 0 turns, left at the opener; 1147 d12/d13: betrayal declined, then left). No commit could have been offered — the game is correct, the metric absorbs them.
- The settled-favor exclusion did NOT fire (settled=0): the r121 shape (1150 d9 Henry) does not exist in this corpus — the villages diverged and 1150 has only a d8 sitting. The instrument is the same proof-tested code as r122; it simply had no settled sitting to fire on. Not a re-proof of the exclusion, noted honestly.
- M-PR2: promised/(picked − away-guard) = 9/(12−3) = **100%** ≥ 80%. All 3 stated-after-pick are the away-guard line.

### Q3 — PRACTICE: GO
- movedCells d1→d28 = **95**, attributed=95, seedsWithMove=10/10, skill0→pos=24, practiceReps=2857 (pre-fix 95/23/2873 — the RNG shift moved one skill).
- Movement by task: wood 28, stone 29, deadfall 5, water 22, cook 11; hunt/forage/fish/scout/patrol 0.
- Hunt reps 0 again (298 kills, 0 hunt practice) — the r117 hunt-assignment policy question carries, unchanged (sixth panel running).

### Q4 — ENGAGEMENT REGRESSION LINES: GO
- M-PR1 (see Q2) and M-PR2 (100%) both hold.

### Q5 — M7 GOAROUND: GOAROUND-HOLDS + RESCUE-GO
- R84 kcal: arrivals=3, arrived=3 (100% ≥ 80%). R85 kcal: skips=3, complete=3 (100%).

### Q6 — DOORSTEP-OUTINGLIVE (M6): UNTESTED
- 0 real triggered steps: all 278 doorstepSteps carry `skipped: "already-inside"` (62) / `"fed-and-watered"` (213) and none carries eatRecs. Same as r121/r122 — an empty sample is UNTESTED, not GO (r115's rule). Third consecutive landing run UNTESTED; see Metric review.

### Q7 — MELEE-FIRST SLOT RULE: LANDING SANITY (descriptive, no bar)
- Post-fix AFTER corpus: 15 fights, scholar strikes **48** (pre-fix 40; r121 corpus 26 across 12 fights), scholar moves 4 (r122: 15), won 9, routed 6, lost 0.
- Direction is up (more strikes, fewer moves, no losses), but the fight mix differs from r121 (15 vs 12 fights, different monsters), so no clean attribution to the melee-first rule — the rule was already proven GO on its own 32-seed panel by sim-meleefirst-b. Recorded as a landing-band sanity check: nothing in the landing numbers contradicts the rule.

### Q8 — OBSERVE-FALLBACK MISFIRE: GO (fix built, proven, panel re-run)
- **Root cause (read pre-panel, confirmed on this band):** the observe handler (conversation.js:6652) draws `drawTruthLine('observedReact', vid)` — but NO `observedReact` pool existed in `truthLinePools` (truth.js): the only reference in src/ was the call site. `drawTruthLine` returns `''` for a missing pool, so the handler ALWAYS served the hardcoded default `'"Something on your mind?"'`. First observe in a sitting: spoken. Second observe in the SAME sitting: the line is already in the per-sitting ledger → sayLine self-blocks → the convoTurn tail fallback (conversation.js:7169) serves `convoSelfRepeatLine`'s first entry, "I just said — did you miss it?". The accusation fires about a QUESTION she asked, not anything she told the player.
- **This band reproduces it:** 1142 d6 Jenny (curious want) — turn 5 observe → "Something on your mind?", turn 9 observe → "I just said — did you miss it?" (flagged `!! FALLBACK "I just said" fired`). Turns 13/17 observe escaped only because voiceLine happened to append a closer ("...Don't make me regret saying that.", "...That is all."), changing the composed line past the ledger key — luck, not design.
- **Fix (one src change):** a real `observedReact` pool in `truthLinePools` (8 distinct spoken reactions to being watched, drawn without replacement per game like observeCalm; first entry keeps the old default in circulation). The hardcoded default stays as the fallback if the draw ever returns empty. No other call site changes.
- **Proof test:** `scripts/test-journey-landing-r123-observe-react.js` (3 cases, separate processes: pool / observe / control). On UNFIXED code (fix stashed): **3 FAILURES** (pool draws all empty; second observe serves the accusation). After the fix: **ALL GREEN** (13 checks).
- **Panel re-run (r121 pattern):** AFTER driver re-ran on seeds 1142–1151 post-fix. "I just said" firings: **1 → 0** across the AFTER transcripts. Census: **9/10 byte-identical** (paths/stacks stripped); seed 1142 diverged — adjudicated below. All verdicts re-checked on the post-fix corpus and holding (Q1 0/0, Q2 9/10 + 100%, Q3 GO, Q5 3/3 + 3/3, zero-DMG 2 classified, navlog clean, HUNGRY 6/10, kill mean 29.8).
- **The 1142 divergence (adjudicated):** the fix adds `Math.random` draws (drawTruthLine's fresh-line selection) where unfixed code returned before drawing — the seeded RNG stream shifts from the first observe draw onward. On 1142 that shifted production numbers, two extra monster kills on d6 (anaconda_empress, speedbump_turtle), and downstream sittings from day 6. It is an RNG-stream artifact of the harness, not a behavior change: the fix changes no game logic, only which line a draw returns. Confined to one seed; every verdict re-measured on the post-fix corpus holds. (Same class as r121's one-seed butterfly, different mechanism — there a changed line altered picks, here added draws shift the stream.)

## Carried bindings (judged fresh on the post-fix AFTER corpus)
- **M1 ALIVE-D14: 10/10** (pop 10–12 at d14). **M2 SYSTEM CONTACT: 10/10** (d8, d9 on 1143).
- **M3 FIGHT-LOG:** 15 fights, 0 unknown/mixed trigger, 0 missing endResult.
- **M5 PEOPLE: PASS** (sense-read below).
- **Zero-DMG invariant: PASS** (15 fights, 2 zero-dmg, both classified: pending-face no-strikes, rounds=1, end=routed, monster at full HP — 1147 d27 Loud-Eyes, 1151 d19 Lockpick — the r121 "monster chooses to run at face-off" shape, honest).
- **Miriam line: 0** "That's settled" across all transcripts.
- **R66 HUNGRY:** 6/10 seeds with pantry <2000/person at d28 (r122: 5/10), **0 starvation deaths**. Leanest 1147 at 764/person; fattest 1150 at 4203.
- **R73 narrow windows:** NARROW 9, kept inside narrow 3 (r122: 12 / 7) — NARROW-PATTERN holds.
- **Mantle latency:** VACUOUS — zero holder deaths on this panel (R73 succession: latencies=[]), so no latency measured. Not 0 — unmeasured.
- **1130-d6 amnesia shape: 0 recurrences.**
- **Scholar-turns watch:** verbTotals player-move=4, wait=0, barrier-exit=0, ability=0. No living 0-strike ≥3-move fight.
- **Deflect-fallback repetition:** worst sitting **2×** (1142-d6: "Sorry — I shouldn't load that on you. What's up?" ×2; "Forget I said anything. What did you want?" ×2 with voice closers) — down from r122's 3×, still the carried voice-pass candidate (Issue 2: dlg:subject acknowledgment repeats verbatim — NOT this run's fix; Q8 is the observe pool only).
- **6394 flat fall-through:** 0 occurrences.
- **Kill-mean trend:** 29.8/seed (r120 31.1 → r121 26.1 → r122 26.5 → r123 29.8 — flat, seed mixture).
- **Poison re-test:** 0 live re-tests (the 1142 flesh-arc test=1 is the monster-meat pipeline, not a poison re-test).
- **Scholar-eats-first:** held design question, not changed. **M-A2:** not re-measured (DELIVER OVER MEASURE).
- **Presshop (carried Q1/Q2 outing shape):** pressFailEvening 0 → 1 (bar AFTER ≤2, holds — the one fail is on diverged 1142), strippedSecondFails 0 → 0, togetherStopped 7 → 8 (all g3After=0). Far-unreached 4 → 4 — **NOT-MET** (see below).
- **Far-unreached adjudication:** the 4 far + 1 near unreached are the same nodes both sides (H-OTHER:5, engine-named blocks) — one broken chain, 1150 Henry's favor, 4 stock-2 nodes the hop records as unreached. The hop works (hopReached=9, detourReached=2); these are outing/route geometries the r121 hop GO does not cover. Carried as an open question since r122, not a landing verdict — the flee gates don't touch it.

## Village assessment (plain words)

Ten villages, all alive at day 28 (pop 10–12 from a 12 start). The System arrived on day 8 (day 9 on Blanca's village) in every one. People are learning: 24 villagers picked up a brand-new skill from nothing, 95 competence cells moved. Denise checks the pantry before heading out and leaves the harvest standing; Ursula gathers deadfall day after day and gets visibly better at it. Trust pairs are forming (1142: Denise 90, Dmitri 90, Jenny 85, Kiprono 83). The beast-naming debate is a living argument: on Chen's village the lockpick raccoon is "Loud-Eyes" and the sunback "The Ugly Beast", nobody agrees, and the village keeps voting — 17 monsters named by day 28 there. Monster meat is being tested and cooked: Denise tested sunback flesh safe, and a hushwolf carcass came home with meat on it. The hard villages fight as parties: Vera's village killed 54 monsters in 28 days, Sophia's 42. The scholar fights now: 48 strikes across 15 fights, 9 won, 6 routed, none lost — Blanca's village won a 16-round statickite fight on day 23 with the scholar striking every round. Two monsters turned and ran at the face-off before a blow was struck (a lockpick raccoon, a Loud-Eyes) — a monster choosing to run is a real outcome, not a missing fight. The pantry is the pressure: 6 of 10 villages end the month under 2,000 kcal per person, and nobody starved — they just run lean, the leanest at 764 per person. Cases run through the conversations: the ambush of Aki, of Elif, of Liam — villagers press each other about that night, and the village hasn't settled it.

## People check (full transcripts read)

Read in full: 1142-day6 (Jenny, the Q8 misfire sitting); 1147-day12 (Marcus) + 1147-day13 (Aki) + 1148-day11 (James) + 1144-day12 (Sanne) (the never-offered sittings).
- **Jenny's sitting works as a conversation — except the one misfire.** She asks what the player learned since arriving; the player answers "How to be hungry and keep going anyway"; she answers back ("The fundamental skill. Everything else is decoration."); the tension thread lands ("Everyone's choosing sides and pretending they aren't. I hate it."); the wind-down surfaces and the sitting ends engaged. The NPC wants something, the options engage it, the ending resolves. The misfire (turn 9, "I just said — did you miss it?") is the Q8 defect, fixed this run — the post-fix re-run serves a fresh reaction there instead.
- **The never-offered sittings are honest.** Marcus and Aki both open on a betrayal invite the player declines; the player leaves after one exchange, so no commit could be offered. James's sitting is about the ambush of Elif — the favor never surfaces because the conversation is about the case, and the player leaves. Sanne's is 0 turns: the player leaves at the opener. None of these is the game failing to offer; the metric's per-seed bar absorbs them.
- **Issue 2 persists (carried, not fixed):** dlg:subject acknowledgments repeat verbatim — "Sorry — I shouldn't load that on you. What's up?" ×2 and "Forget I said anything. What did you want?" ×2 in the Jenny sitting (r122: up to 3×). A voice-pass candidate for a future run.
- **Betrayal held-offers:** declines acknowledged ("Fair enough. Rain check.", "Right — another time."), invites not forced. Party invites spoken/dry: no dry invites on the read sittings.

## Reachable / fun / winnable (leg 0)

- **Reachable:** the landing content fires on every seed — System contact d8/9, favors asked (40), chains completing (kept 4, far haul on 4), practice moving, the naming debate, the goaround rescue (3/3). Nothing in the leg is gated behind unreached content.
- **Fun:** the village feels alive (gossip mutating, pantry-aware foraging, the naming argument, the ambush cases running through conversations) and the scholar now fights — 48 strikes, no losses — where r121's scholar walked into fatal fights. The observe fix removes a moment where an NPC snapped at the player for something she never said.
- **Winnable:** leg 0 is the first fortnight — no win is expected here, and none is claimed. The chain toward it (practice moves, kills 29.8/seed, parties forming on Vera's and Sophia's villages, trust pairs at 90) is intact and a little stronger than r122.

## Telemetry

Check run against the post-fix AFTER corpus vs `telemetry-baselines/landing-split.json` (r66 roll; `landing.json` is superseded — do not compare against it). **3 LOUD lines, all EXPLAINED, baseline NOT rolled:**
1. `systemDay 33 → 81 (+145%)` — seed-count artifact: 81 is the sum over 10 seeds (per-seed mean 8.1, baseline 8.25 over 4 seeds). First contact is d8–d9 on every seed, unchanged.
2. `monsterKills 24 → 298 (+1142%)` — seed-count artifact (10 vs 4 seeds) on a baseline that predates the current driver's fight count. Per-seed mean 29.8, in line with r120 (31.1), r121 (26.1), r122 (26.5) — stable, not a surge.
3. `folTelemetry.fires 0 → 9` — the follow-volunteer signal postdates the r66 baseline. A new signal, not a regression.
- villagerDeaths and starvAutopsies quiet. Baseline NOT rolled: the checker's values are panel-size-dependent sums (10-seed vs the baseline's 4-seed roll), so rolling from this panel would bake in a size mismatch for the next run. The next landing run should roll the baseline from a same-size panel, or normalize per-seed first (carried from r122).

## Metric review

- **Q1's before-validity condition worked as designed** — it caught a would-be empty GO: BEFORE 0 flee-loop deaths → UNTESTED, not GO. But the condition now exposes the deeper problem: the defect has not reproduced on ANY band since r121 (r122 fresh band 0/10, r123 defect band 0/10). The question as framed ("do the gates fix the flee-loop deaths?") cannot be answered by any landing panel on current master. **Proposed revision for the next run: RETIRE Q1 as a panel question until a flee-loop death is observed in the wild again** (a census fightLog with 0 strikes + ≥3 moves + scholar death). Until then the gates stay driver-env-only and unproven — and the code-level defect (legacy branch never pushes) stands as a known, unreproduced shape. Do NOT keep burning panels on it.
- **Q8's metric needs the same honesty about RNG:** the post-fix re-run diverged on one seed by RNG-stream shift (added draws), not by behavior. The "census identical except transcripts" bar should be written as "9/10 identical, any divergence adjudicated by cause" — a single-seed RNG shift is not a fix failure.
- **M6 (doorstep) is now UNTESTED on three consecutive landing runs** (r121, r122, r123) — the trigger (hungry/thirsty Haven day) never fires in the landing window. Either the trigger needs a leg that exercises it, or the check should move to a leg where it fires (carried from r122, now third time).
- **The settled-favor exclusion had no settled sitting to fire on this run** (settled=0) — the instrument is proven (r122) but this panel adds no new evidence for it. It stays in the instrument; no action.
- **Far-unreached (r121 hop Q2) is NOT-MET on two consecutive bands** (r122 3→3, r123 4→4) with the same stock-2-node shape. The r121 GO does not generalize. A future run should either name the geometry that defeats the hop (edge tiles? obstacle-locked stock-2 nodes?) or retire the hop question as "reaches what it can reach".

## Tooling (this run)

- **Drivers:** `scripts/journey-landing-r123-before-20261110.js` (r122-before verbatim except seeds 1142–1151, OUTDIR, header) and `scripts/journey-landing-r123-20261110.js` (r122-after verbatim except seeds/OUTDIR/header). Diff verified: gates block only.
- **Analyzers:** all standing r118–r122 instruments, unchanged. **New:** `scripts/test-journey-landing-r123-observe-react.js` (3 cases, separate processes; 3 FAILURES unfixed → ALL GREEN fixed).
- **Pilot gate:** PASS (3 seeds, both drivers; practice snapshots present; invariants clean; the defect did not reproduce even on its home seeds — the pilot already signaled UNTESTED).
- **Proof:** the Q8 fix is proven by the test (unfixed FAIL / fixed GREEN) and by the panel (misfire 1 → 0, verdicts re-checked on the post-fix corpus).

## What changed (this commit)

- `src/js/truth.js` — added the `observedReact` pool (8 lines + comment) to `truthLinePools`. The only game-code change.
- `scripts/test-journey-landing-r123-observe-react.js` — new proof test.
- `scripts/journey-landing-r123-before-20261110.js`, `scripts/journey-landing-r123-20261110.js` — panel drivers.
- `evidence/2026-11-10/journey-landing-r123-prereg.md`, `evidence/2026-11-10/journey-landing-r123.md` (this note).
- Corpora (hidden_files evidence, not committed): `landing-r123-before/`, `landing-r123-after/`, `landing-r123-after-postfix/`, pilots.

## Gate

`node scripts/check.js --quick` (worktree, with the fix): run 1 — **294 passed, 6 failed** in 545s; run 2 (full log, `/tmp/r123-check-quick.log`) — **293 passed, 7 failed** in 856s. The count differs by one flaky load timeout (see below). All failures adjudicated standing — none names truth.js, the observe path, or the new proof test:
- **Measurement-proof staleness pair (standing, r121):** `test-measurement-proof-update`, `test-measurement-workflow` ("retained neutrality proof covers the current Game/controller/harness inputs"). Attribution (r121, clean-tree): fails identically without r121's changes — the staleness predates this run. Refresh (`scripts/balance-proof-update.js`) is owned by the measurement-maintenance lane, not this landing.
- **Standing profile (r120/r121):** `test-mobile-combat-cadence` ("Continue does not wrap the announced round a second time"), `test-occupation-panels` ("real CLI workflow completed"), `test-phone-frame-proof` (retained browser input / boot inputs / phone receipt stale), `test-establishment-r20-fixes` (racks-full voice "next day voices once more": expected 2, got 1).
- **Load timeout (flaky, not a regression):** `test-trust-observer-neutrality` hit the 120s timeout in run 2 (exit null); run standalone this run: **6 passed, 0 failed**.
- The Q8 proof test passes standalone (ALL GREEN; 3 FAILURES on unfixed code), and the panel re-run's verdicts hold. No regression from this run's change.
