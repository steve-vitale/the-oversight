# journey-landing r125 — RUN NOTE (Lane A, leg 0 LANDING, days 1–14 judged, horizon d28)

**Run id:** playtest-loop-a-20261110T2345Z (scheduled Tue 2026-11-10 23:45 CST, started ~05:48Z Nov 11).
**Base:** local master `fc0ffb37c` (journey-scale r130, pending ship). Branch: `journey-landing` (worktree).
**Seeds:** the r121 band 1142–1151, DELIBERATE REUSE (the Q1 personal-bridge defect reproduces on 1150 d6; r124's reuse rationale; the judge is the within-run before/after delta, never a cross-run comparison). DAYS=28, BEFORE/AFTER matched (§15). BEFORE = r124-before driver verbatim except OUTDIR/header; AFTER = the same driver verbatim except OUTDIR/header — the ONLY delta is the Q1 src fix. Driver diff verified: header + OUTDIR only.
**Lock:** created 05:48:25Z, run_id `2026-11-11T05:48:19Z-playtest-a`. Heartbeat loop `/tmp/hbloop-r125.sh` (PID 8503, every 10 min); registration took ~157s (slow checkout, cf. r124 ~9 min).
**Rotation:** read 0 → leg 0 LANDING; wrote 0→1 at run start (verified by read-back).
**Pre-flight deviations (LOUD, recorded, standing state):** `git pull --ff-only` FAILED — local master diverged from origin/master (ahead 524 / behind 156; same standing state as r120–r124; ship loop owns reconciliation, and a Steve-approved reconcile branch exists but is BLOCKED on person-trust errand-mix, not landed — main-session owned, untouched by this run). Proceeded on local master. Main tree clean; disk 34%. Reap LOUD notes (other owners' dirty trees, untouched): sim-secondlink-a, reconcile-forward, sim-travelfirst-a, sim-conjurefix-retune-b.
**Numbering note:** Lane A leg counters are per-leg; the last landing run was r124, so this run is r125. (r123's observe-react fix and r124's want-bridge fix are both on master; this run takes r124's named remainder, the personal bridge pool.)

## Verdicts

### Q1 (PRIMARY) — THE PERSONAL BRIDGE REPEATS VERBATIM: GO (fix built, proven, panel re-run)
- **Root cause (read pre-panel, confirmed on this band):** both repeated lines are the WHOLE `BRIDGES.personal` pool (convo-beats.js:182, 2 lines). `bridgeLine` draws via `convoPickCycle` (convo-beats.js:190), which cycles without replacement then reshuffles keeping the last `min(3, pool.length − 1)` = 1 line (conversation.js:2935). With a 2-line pool the cycle is strict alternation A,B,A,B — a third personal-bridge in one sitting repeats a line heard two turns earlier. Deterministic, not a fluke — the same mechanism r124 proved for `want`.
- **This band reproduces it (BEFORE):** 1150 d6 Wei — "Anyway. What did you want?" ×3 and "That's me, I guess. What's on your mind?" ×2 in one sitting (stronger than r124's ×2/×2). Personal-bridge analyzer (new, proof-tested): BEFORE sittings=102, servings=21, repeatSittings=1, repeatInstances=3.
- **Fix (one src change):** `BRIDGES.personal` 2 → 6 distinct lines (same voice — a villager stepping back from talking about themselves and handing the floor to the player; the two original lines stay as entries 1–2). No other call-site change.
- **Proof test:** `scripts/test-journey-landing-r125-personal-bridge.js` (3 cases, separate processes: pool / window / control). On UNFIXED code: **2 FAILURES** (pool: 6 calls alternate B,A,B,A,B,A → distinct=2; window: repeat inside the 3-window). After the fix: **ALL GREEN** (9 checks; the 12-call window case serves all 6 lines, then reshuffles into a different order, never repeating within 3).
- **Panel re-run:** AFTER driver re-ran on seeds 1142–1151 post-fix. Personal-bridge repeats in a sitting: **3 → 0** (repeatSittings 1 → 0, repeatInstances 3 → 0; no transcript file has any personal line more than once; the new lines are served live — "Enough about me…" ×5, "That's my story, anyway…" ×5, "I could go on about myself…" ×3, "Right. Me, me, me…" ×5). The 1150-d6 Wei sitting now serves FOUR different personal bridges (turns 65/119/173/227) and ends engaged (curious stage 3). The observe fix holds (justSaid 0); the want fix holds (each want line ≤1 per sitting).
- **Census: 8/10 identical in every number; the other 2 adjudicated by cause (see below).** Seeds 1144 and 1148 diverged; the other 8 are byte-identical in numbers. First differing series entry on both diverged seeds is day 6 — one day after their first personal-bridge serving (day 5). That is the predicted rejection-sampling draw-count shift (r124's prereg): the bigger pool changes how many draws `convoPickCycle` makes, the seeded RNG stream shifts after the first personal bridge, and the village lives a different life from the next day. Nothing else differs between the legs (drivers differ only in OUTDIR; src differs only in the pool), so the divergence is a stream shift, not a game-logic change. Consequences on the diverged seeds: 1144 AFTER has 2 villager deaths (BEFORE 0) and 1 fight vs 2; 1148 AFTER has a different monster-kill composition, 0 villager deaths both sides. The Q1 metric is transcript-based and unaffected; the carried bindings are judged on the AFTER corpus as-is.
- **Metric review note:** the r123 census bar ("9/10 identical") was missed (8/10) by the predicted mechanism, not by a defect — r124's 10/10 was luck of the draw. For the next pool-expansion fix the bar should read "any divergence adjudicated by cause" without a count, since a bigger pool shifts the stream on whichever seeds hit a branch point. The binding GO clause (proof GREEN + 0 repeats) holds regardless.

### Q2 — M-PR1 / M-PR2: GO
- AFTER: sittings=18, offered=14, picked=14, promised=11, statedAfterPick=3, **neverOffered=4, settled=0**.
- Per-seed never-offered ≤1 on **9/10** seeds (only 1147 has 2: d12 Marcus + d13 Aki) → **holds** (bar ≥8/10).
- The 4 never-offered sittings were read in full: all are short sittings where the player leaves after the opener or a declined betrayal invite (1146 d9 Ursula: leaves at the ambush-of-Kgomotso opener, 4 entries; 1147 d12/d13: betrayal declined, ambush case runs the sitting; 1151 d12 Brian: link proposal + trap-line invite, betrayal declined, ambush of Scott). No commit could have been offered — the game is correct, the metric absorbs them.
- M-PR2: promised/(picked − away-guard) = 11/(14−3) = **100%** ≥ 80%. All 3 stated-after-pick are the away-guard line.
- The settled-favor exclusion did NOT fire (settled=0) — no settled sitting exists in this corpus. The instrument is proven (r122); this panel adds no new evidence for it.

### Q3 — PRACTICE: GO
- movedCells d1→d28 = **96**, attributed=96, seedsWithMove=10/10, skill0→pos=24, practiceReps=2965 — above the ≥50 bar.
- Movement by task: wood 30, stone 30, deadfall 5, water 21, cook 10; hunt/forage/fish/scout/patrol 0.
- Hunt reps 0 again (308 kills, 0 hunt practice) — the r117 hunt-assignment policy question carries, unchanged (eighth panel running).

### Q4 — FAR-UNREACHED GEOMETRY: FIX NAMED FOR R126 (no fix in this run)
- Presshop: farUnreached 4 → 4 — **NOT-MET** (same deterministic cause as r122/r123/r124: the 1150-d9 Henry evening chain, combat-interrupted). H-OTHER:5 — the analyzer has no combat-interruption class, which is part of the follow-up.
- **Exact location (read this run, so r126 does not re-derive it):** the evening leg (outingWork (d), driver ~line 3506) checks `inCombat()` ONCE before the node loop; inside the loop `outingHopTo` (~line 2721) exits instantly on its own `inCombat` guard (`while (... && !(Game.inCombat && Game.inCombat()))`), so every hop after the mid-press fight returns `from=(0,0) steps=0 reached=False blocked=null`. The fight itself is played later by the main loop's `driveFights(Game, competent, ctx)` (~line 4257) — after the evening leg has already given up.
- **Fix shape for r126:** inside the evening node loop, before `outingHopTo`, if `Game.inCombat()` then call `driveFights(Game, competent, ctx)` (the same call the main loop uses) to play the interrupting fight to completion, then retry the hop; record `blocked: 'combat-interrupted'` in hopDetail when a hop is skipped for combat. Analyzer: split "hop failed to route" (steps>0, no named block, no combat) from "chain interrupted by combat" (inCombat at hop time), and judge the hop on the first only. The 1-seed debug probe pre-registered as optional was NOT run — the main panel + closeout took the budget; r124 already proved the cause with its debug driver, and the location is now pinned here.

### M6 DOORSTEP-OUTINGLIVE — MOVED OFF LANDING (r124 metric review, binding decision applied)
- Triggered steps: **0** (watch line only, not a verdict). All 278 doorstepSteps carry `skipped: "already-inside"` (60) / `"fed-and-watered"` (216) / `"not-at-haven"` (1) / `"in-combat"` (1) — the same shape as r124. Per r124's metric review this check is MOVED: the next run that exercises it is a deepening/scale leg where the scholar arrives at Haven needy from travel (the R84/R85 rescue path IS the same shape and fires there — 1/1 this run), or it is re-scoped as "rescue needed vs rescue given". It is not carried as a landing verdict again.

### Q6 (carried) — M7 GOAROUND: GOAROUND-HOLDS + RESCUE-GO
- R84 kcal: arrivals=1, arrived=1 (100% ≥ 80%). R85 kcal: skips=1, complete=1 (100%). Small sample (r124 had 3/3) — same verdict, weaker evidence.

## Carried bindings (judged fresh on the post-fix AFTER corpus)
- **M1 ALIVE-D14: 10/10** (pop 9–12 at d28; 11 villagers lost across 10 villages, 0 starvation deaths).
- **M2 SYSTEM CONTACT: 10/10** (d8 ×9, d9 on 1143).
- **M3 FIGHT-LOG:** 14 fights, all with monsterArg + endResult, 0 missing (11 pending-face).
- **M5 PEOPLE: PASS** (sense-read below).
- **Zero-DMG invariant: PASS** (14 fights, 2 zero-dmg, both classified: pending-face no-strikes, rounds=1, end=routed — the r121 "monster chooses to run at face-off" shape, honest).
- **Miriam line: 0** "That's settled" across all transcripts.
- **R66 HUNGRY:** 6/10 seeds with pantry <2000/person at d28, **0 starvation deaths** (same as r124).
- **R73 narrow windows:** NARROW 10, kept inside narrow 4 — NARROW-PATTERN holds (r124: 9/3).
- **Mantle latency:** VACUOUS — zero holder deaths on this panel (fifth run running: r122, r123, r124 all vacuous on this band).
- **1130-d6 amnesia shape: 0 recurrences.**
- **Scholar-turns watch:** verbTotals player-move=5, wait=0, barrier-exit=0, ability=0. No living 0-strike ≥3-move fight. Scholar struck 42× across 14 fights (8 won, 6 routed, 0 lost).
- **Deflect-fallback repetition:** worst sitting **1×** — no sitting repeats either dlg:subject ack more than once. The want-bridge + personal-bridge fixes together moved the overall worst from r124's 2× to 1×.
- **6394 flat fall-through:** 0 occurrences.
- **Kill-mean trend:** 30.8/seed (r120 31.1 → r121 26.1 → r122 26.5 → r123 29.8 → r124 29.8 → r125 30.8 — flat, seed mixture).
- **Poison re-test:** 0 live re-tests.
- **Scholar-eats-first:** held design question, not changed. **M-A2:** not re-measured (DELIVER OVER MEASURE).
- **Presshop (carried Q1/Q2 outing shape):** pressFailEvening 1→1, strippedSecondFails 0→0, togetherStopped 8→9 (all g3After=0). Far-unreached 4 → 4 — adjudicated in Q4 (combat interruption, not hop failure).

## Village assessment (plain words)

Ten villages, all alive at day 28 (pop 9–12 from a 12 start; eleven people lost across the ten villages, none to starvation). The System arrived on day 8 (day 9 on Blanca's village) in every one. People are learning: 24 villagers picked up a brand-new skill from nothing, 96 competence cells moved. The scholar fights now: 42 strikes across 14 fights, 8 won, 6 routed, none lost. The pantry is the pressure: 6 of 10 villages end the month under 2,000 kcal per person, and nobody starved — they just run lean. Favors move: 41 asked, 4 kept, 4 delivered, and the chain completes from far ground. Cases run through the conversations: the ambushes of Kgomotso, Aki, Elif, Scott — villagers press each other about those nights, and the village hasn't settled any of them. The beast-naming debate is still a living argument: on Aki's village the bamboo stripes are "The Loud Beast" (Ruth) against "The Ugly Beast" (Joseph) and "Big Big" (Xiaoli); on Marcus's village a raccoon with too many fingers is "Loud-Eyes" against "The Big Stare" and "The Ugly Beast" — nobody agrees, and the village keeps voting.

## People check (full transcripts read)

Read in full: 1150-day6 (Wei, the Q1 sitting); 1146-day9 (Ursula), 1147-day12 (Marcus), 1147-day13 (Aki), 1151-day12 (Brian) (the never-offered sittings).
- **Wei's sitting works — and now sounds like a person changing the subject instead of a loop.** He asks when the player last really laughed; the player answers "someone tripped over nothing and we all lost it. It felt like stealing"; Wei answers back ("Stealing joy. I like that. We should steal more of it, friend."); he sketches a map in the dirt ("Don't go there after rain. And this one's worth the walk."); the four personal bridges are four different deflections ("Enough about me — you've got something on your mind, I can tell.", "That's me, I guess. What's on your mind?", "Right. Me, me, me. Your turn — what's up? Just... be straight with me.", "Anyway. What did you want?"); the dream thread lands ("Groups make decisions slow and loud. I'll help. From over there."); the wind-down surfaces, the "one more thing" beat lands ("I think better when it's quiet. And out here, thinking is surviving."), and the sitting ends engaged. The NPC wants something, the options engage it, the ending resolves.
- **The never-offered sittings are honest.** Ursula's is 4 entries: the player leaves at the opener. Marcus and Aki both open on a betrayal invite the player declines ("Right — another time.", "Fair enough. Rain check."); the player leaves after one exchange, so no commit could be offered. Brian's is the link proposal plus the trap-line invite, betrayal declined, ambush of Scott running the sitting. None of these is the game failing to offer; the metric's per-seed bar absorbs them.
- **Betrayal held-offers:** declines acknowledged, invites not forced. Party invites spoken/dry: no dry invites on the read sittings.

## Reachable / fun / winnable (leg 0)

- **Reachable:** the landing content fires on every seed — System contact d8/9, favors asked (41), chains completing (kept 4, far haul on 4), practice moving, the naming debate, the goaround rescue (1/1). Nothing in the leg is gated behind unreached content.
- **Fun:** the village feels alive (gossip mutating, pantry-aware foraging, the naming argument, the ambush cases running through conversations) and the scholar now fights — 42 strikes, no losses — where r121's scholar walked into fatal fights. The personal-bridge fix removes a moment where an NPC repeated herself verbatim twice in one sitting; the sittings now sound like a person deflecting, not a loop.
- **Winnable:** leg 0 is the first fortnight — no win is expected here, and none is claimed. The chain toward it (practice moves, kills 30.8/seed, parties forming, trust pairs forming) is intact and flat vs r124.

## Telemetry

Check run against the post-fix AFTER corpus vs `telemetry-baselines/landing-split.json` (r66 roll; `landing.json` is superseded — do not compare against it). **3 LOUD lines, all EXPLAINED, baseline NOT rolled** (identical to r123/r124):
1. `systemDay 33 → 81 (+145%)` — seed-count artifact: 81 is the sum over 10 seeds (per-seed mean 8.1, baseline 8.25 over 4 seeds). First contact is d8–d9 on every seed, unchanged.
2. `monsterKills 24 → 308 (+1183%)` — seed-count artifact (10 vs 4 seeds) on a baseline that predates the current driver's fight count. Per-seed mean 30.8, in line with r120 (31.1), r121 (26.1), r122 (26.5), r123/r124 (29.8) — stable, not a surge.
3. `folTelemetry.fires 0 → 8` — the follow-volunteer signal postdates the r66 baseline. A new signal, not a regression.
- villagerDeaths and starvAutopsies quiet. Baseline NOT rolled: the checker's values are panel-size-dependent sums (10-seed vs the baseline's 4-seed roll), so rolling from this panel would bake in a size mismatch for the next run. The next landing run should roll the baseline from a same-size panel, or normalize per-seed first (carried from r122/r123/r124).

## Metric review

- **Q1's metric worked as designed** — the proof test failed RED on unfixed code (2 failures, exactly the predicted alternation) and went ALL GREEN on fixed code, and the panel confirmed the lived effect (personal-bridge repeats 3 → 0 in a sitting) with the new lines served live. The census bar ("9/10 identical") was missed at 8/10 by the predicted RNG-stream mechanism — see Q1 adjudication. For the next pool-expansion fix, drop the count from the bar: "any divergence adjudicated by cause" is the honest form, since a bigger pool shifts the stream on whichever seeds hit a branch point (r124's 10/10 was luck, not design).
- **Q4's metric needs the same honesty as Q1-flee's retirement:** "far-unreached" as a number has now been NOT-MET on four consecutive bands (r122 3→3, r123 4→4, r124 4→4, r125 4→4) with the same deterministic cause (a combat-interrupted chain on 1150). The number measures a misattribution, not the hop. The fix is named in Q4 above for r126: drive the fight mid-loop + split the instrument. Until then, far-unreached stays NOT-MET by construction on this band.
- **M6 (doorstep) is now MOVED off landing** (r124 metric review, applied this run) — 0 triggered steps for the fifth consecutive landing run is evidence the trigger's precondition is engineered away by the current policy in this window, not that the instrument is untested. The check moves to deepening/scale road returns or is re-scoped.
- **The settled-favor exclusion had no settled sitting to fire on this run** (settled=0, third run running) — the instrument is proven (r122) but this panel adds no new evidence for it. It stays in the instrument; no action.
- **The next voice-pass item:** the remaining 2-line bridge pools (grief, cheer, goal, past, village, plans, gossip, secret, small) share the defect shape; the voice pass covers them one pool at a time, each with its own proof — not a blind expansion. Which pool repeats next on a fresh band decides the order; on this band none repeated.

## Tooling (this run)

- **Drivers:** `scripts/journey-landing-r125-before-20261110.js` (r124-before verbatim except OUTDIR/header) and `scripts/journey-landing-r125-20261110.js` (same file, different OUTDIR; the only leg delta is the src fix). Diff verified: header + OUTDIR only.
- **Analyzers:** all standing r118–r122 instruments, unchanged. **New:** `scripts/analyze-landing-r125-personal-bridge.js` (per-sitting per-line substring counts, BEFORE/AFTER). **New proof test:** `scripts/test-journey-landing-r125-personal-bridge.js` (3 cases, separate processes; 2 FAILURES unfixed → ALL GREEN fixed).
- **Pilot gate:** PASS (3 seeds 1142/1148/1150, BEFORE driver; 0 FATALs; practice snapshots present; the defect reproduced in the pilot corpus — 1150 d6 "Anyway…" ×3, "That's me…" ×2; outingchain runs; invariant PASS; far together attempts present).
- **Proof:** the Q1 fix is proven by the test (unfixed FAIL / fixed GREEN) and by the panel (personal-bridge repeats 3 → 0 in a sitting, 8/10 census files identical in every number, 2 adjudicated by the predicted RNG-stream shift).

## What changed (this commit)

- `src/js/convo-beats.js` — `BRIDGES.personal` 2 → 6 lines (4 new deflections, same voice; originals kept as entries 1–2). The only game-code change.
- `scripts/test-journey-landing-r125-personal-bridge.js` — new proof test.
- `scripts/analyze-landing-r125-personal-bridge.js` — new Q1 analyzer.
- `scripts/journey-landing-r125-before-20261110.js`, `scripts/journey-landing-r125-20261110.js` — panel drivers.
- `evidence/2026-11-10/journey-landing-r125-prereg.md`, `evidence/2026-11-10/journey-landing-r125.md` (this note).
- Corpora (hidden_files evidence, not committed): `landing-r125-before-pilot/`, `landing-r125-before/`, `landing-r125-after/`.

## Gate

`node scripts/check.js --quick` (worktree, with the fix): **293 passed, 7 failed in 888s** (first run). A full-output re-run to adjudicate the 7th failure: **291 passed, 9 failed in 977s**. All 9 failures adjudicated — none names convo-beats.js, the personal bridge, or the new proof test:
- **Standing profile (r124's 6, identical):** `test-measurement-proof-update`, `test-measurement-workflow` (retained neutrality proof staleness — measurement-maintenance lane, not this landing); `test-mobile-combat-cadence` ("Continue does not wrap the announced round a second time"); `test-occupation-panels` ("real CLI workflow completed"); `test-phone-frame-proof` (retained browser input / boot inputs / phone receipt stale); `test-establishment-r20-fixes` (racks-full voice "next day voices once more": expected 2, got 1).
- **Load timeouts (3, all PASS standalone — flakes, not regressions):** `test-trust-observer-neutrality`, `test-synergy-stall`, `test-capable-bot-20261014` — each hit check.js's 120s cap under load average 14.5 with 4 parallel jobs (the three slowest tests in the run: 120s/120s/120s). Standalone: neutrality 6/6 exit 0, synergy exit 0, capable-bot 42/0 exit 0.
- The Q1 proof test passes standalone (ALL GREEN; 2 FAILURES on unfixed code), and the panel re-run's verdicts hold. No regression from this run's change.
- **Pre-existing, not in the gate:** `test-convo-beats-20261006.js` and `test-convo-depth-20261007.js` both fail standalone (exit 1) on PRISTINE code too (verified by stashing the fix: `Text is not defined` in genCharacter setup; null village in test setup) — harness-setup failures on current master, unrelated to the pool edit. Neither is quick-tagged, so neither ran in the gate. Filed here, not fixed (out of this run's scope).
