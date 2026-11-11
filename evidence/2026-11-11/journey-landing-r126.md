# journey-landing r126 — Lane A, leg 0 LANDING (2026-11-11)

Run: `oversight-playtest-loop`, Lane A, leg 0 LANDING, run **r126**. Run id `playtest-loop-a-20261111T1543Z`; scheduled Wed 2026-11-11 09:45 CST, started ~15:43Z. Rotation read 0 → wrote 1 (verified by read-back; r131 scale closed the cycle 3→0 at ~15:30Z; this run re-opens it at 0).
Base: local master `965e8d04e` (journey-scale r131; started on `8445ab97f`, master moved twice during pre-flight — `sim-godpathfirst-a`, then `sim-fansfirst-a` landed). `git pull --ff-only` FAILED — local master diverged from origin/master (ahead 587 / behind 156), standing state since r120–r125; ship loop owns reconciliation; proceeded on local master. Main tree clean at start; disk 38%.
Worktree `~/workspace/worktrees/journey-landing`, branch `journey-landing`, HEAD `965e8d04e`. Heartbeat 16:37:29Z; heartbeat loop `/tmp/hbloop-r126.sh` (PID 20176, every 10 min) — re-heartbeat every <15 min for the whole run; a stale heartbeat is how a live run looks dead.
Lock: created 15:43:40Z, run_id `oversight-playtest-loop-2026-11-11T15:43:40Z`. **Delete at closeout, even on failure.**
Pre-flight reap (LOUD, infrastructure): `bash scripts/worktree-reap.sh` started 15:44Z and crawled under fleet load (load 13–16 on the 1.5-CPU box): a single `git status --short` in `sim-justicefirst-a` took 27+ min wall. Causes: repo holds 91,436 tracked files; `sim-justicefirst-a` is 12 GB (evidence/log dumps in-tree). Reaper holds the registry lock for its whole pass; two more reapers + register attempts queued behind it. Reap finished 16:15Z (31 min): 9 LOUD dirty trees, all other owners' — build-ladder-leg4-baseline, sim-wideduty-a, sim-sametick-a, journey-scale-attr, sim-secondlink-a, sim-justicefirst-a, reconcile-forward-2, sim-corruptfirst-a, journey2-succession (untouched); active 13/16; `sim-ctraj-b` left the active list. Register took ~20 min (queued behind another loop's reap + its own internal reap) and completed ~16:36Z; it attached to a stale pre-existing `journey-landing` branch at `488506a47` (0 unique commits) and was fast-forwarded with `git merge --ff-only master` inside the worktree to `965e8d04e`, clean.

## Prereg (evidence/2026-11-11/journey-landing-r126-prereg.md)
Seeds **1142–1151, DELIBERATE REUSE** (r121 band, 4th run; freshness checked per `local_seed_band_freshness`; reuse sanctioned by r125's prereg naming the Q1 fix for r126 on this band). Judge = within-run before/after delta (§15), never cross-run. DAYS=28.
- **Q1 (PRIMARY): combat-interrupted evening chain** — r125 Q4's named fix. Driver + analyzer only, no `src/js` change.
- **Q2 (voice pass):** measure which of the 9 remaining 2-line `BRIDGES` pools (grief, cheer, goal, past, village, plans, gossip, secret, small) repeats on the BEFORE corpus; expand only the repeating pool (own proof test) if one repeats; otherwise measurement-only.
- **Q3 practice (carried):** bar movedCells ≥ 50 with 10/10 seeds moving.
- Carried bindings judged fresh on AFTER: M1, M2, M3, M5, zero-DMG invariant, Miriam line, R66, R73, mantle latency, 1130-d6 amnesia, scholar-turns watch, deflect-fallback, 6394, kill-mean, poison re-test, scholar-eats-first (held), Q6 M7. M6 doorstep MOVED off landing (watch line only, 0 expected).

## What was built (worktree; drivers + analyzers only — no src/js change)
- `scripts/journey-landing-r126-before-20261111.js` — r125 AFTER driver verbatim except header + OUTDIR `landing-r126-before`.
- `scripts/journey-landing-r126-20261111.js` — same + Q1 fix. Diff BEFORE↔AFTER is exactly header (7 lines) + OUTDIR (1 line) + Q1 fix (69 diff lines total); both `node --check` OK.
  - **Q1 fix:** helper `outingHopToAfterCombat(tx,ty)` in the evening node loop (~line 3518): if `Game.inCombat()` then `driveFights(Game, competent, ctx)` (the same call the main loop uses), retry the hop once; if a hop still fails with combat active, record reason `combat-interrupted` + `hopDetail.blocked='combat-interrupted'` (not `unreached`); `gameOver` breaks the node loop. At most one drive + one retry per node. `driveFights` is safe: loops only while `Game.tbfight && !Game.tbfight.over` (sim-harness.js:734), no-op with no active fight.
- `scripts/analyze-landing-r126-presshop.js` — clone of r121 presshop + H-COMBAT split (`blocked==='combat-interrupted'` hops excluded from routing judgment; `combat-interrupted` line reasons don't count as far-unreached). Validated on r125 corpora: reproduces r125's numbers exactly (farUnreached 4→4, H-OTHER:5, combat 0).
- `scripts/analyze-landing-r126-bridge-pools.js` — generalizes r125's personal-bridge analyzer to all 9 remaining pools (substring match, per-sitting per-line counts). Validated on r125 corpora: 0 repeats on every pool.
- `evidence/2026-11-11/journey-landing-r126-prereg.md`, `evidence/2026-11-11/journey-landing-r126.md` (this note).
- Analyzer outputs + panel logs in worktree `evidence/2026-11-11/` (`.log/.err/.txt`); corpora in goal hidden_files `evidence/2026-11-11/landing-r126-before-pilot/`, `landing-r126-before/`, `landing-r126-after/` (not committed).

## Panel (all observed 2026-11-11)
- **Pilot gate PASSED** (seeds 1142/1148/1150, DAYS=28, <2 min): 3/3 ran, systemDay 8, 0 FATALs; Q1 defect reproduced (farUnreached 4, H-OTHER 5); practice 34 cells 3/3 seeds; outingchain CHAIN-COMPLETES-FAR; zero-DMG 0 violations (2 fights).
- **BEFORE panel:** 10/10 seeds, exit 0, ~6.3 min; systemDay 8 (9 on 1143). **AFTER panel:** 10/10 seeds, exit 0, ~6.4 min; system days identical; 0 FATALs.

## Verdicts

### Q1 PRIMARY — combat-interrupted evening chain: GO
Presshop BEFORE farUnreached=4, nearUnreached=1, hopUnreached=5 (H-OTHER:5), hopReached=1 → AFTER farUnreached=0, nearUnreached=0, hopUnreached=0, combatInterruptedNodes=0, hopReached=0 (no evening-blocked attempts at all). Verdict line: COMBAT-FIX-HELPS.
Outingchain: kept 6→8, haulFavors 6→8, deliverFavors 6→8, farHaul 5→7, togetherOkFavors 7→8, farOk 7→10; EVENING-BLOCKED {} in AFTER (was 1: 4 far + 1 near). Double-press stop holds (strippedSecondFails 0 both; togetherStopped 4→5).
**Mechanism proof (seed 1150, day 9, Henry):** BEFORE and AFTER driver logs are identical through the (0,0) press — same talk, same blocked hop, same approach (0,0), same press ok haul 0, same STOP. In BEFORE the chain then strands (5 hops steps=0 from (0,0)). In AFTER it approaches (0,3), presses, approaches (8,6), presses 540 kcal (3× Muscadine Grapes each), delivers 540 kcal. AFTER log has 0 `evening-blocked` lines (BEFORE: 1). AFTER census 1150: sanjun corpse `corpse_9_0ldlhx` died d9 at (0,0) — the fight the fix drove. Henry died d11 (ambush) in AFTER — the only villager death on 1150.
The only delta between the two drivers is the fix, and the logs diverge exactly at the fix point. The fix works by playing the fight the evening had already started, instead of leaving the chain standing on the monster's tile.

### Q2 VOICE PASS: MEASURED, no fix
BEFORE corpus (102 sittings): all 9 pools 0 repeatInstances — grief 1, cheer 0, goal 2, past 0, village 7, plans 3, gossip 2, secret 0, small 5 servings; AFTER also 0 on all pools. Personal bridge 23 servings, 0 repeats both sides (r125 fix holds). Per prereg, no src change; pool order stays open for r127. Metric-review note: pools barely serve (20 total servings vs personal's 23), so the repeat trigger (3 servings of one pool in one sitting) rarely gets a chance to fire.

### Q3 PRACTICE: GO
BEFORE movedCells 101, AFTER 100; seedsWithMove 10/10 both; skill0→pos 56→58; practiceReps 3004→3039. By task: wood 32, stone 31, deadfall 5, water 21, cook 12; hunt/forage/fish/scout/patrol 0. Hunt reps 0 (ninth panel running); kills 329→334 (33.4/seed AFTER vs r125's 30.8).

## Carried bindings (AFTER corpus)
- **M1:** 10/10 alive at d28 (pop 12,12,10,10,12,11,12,9,11,12). **M2:** 10/10 systemDay d8–9. **M3:** fights 15 (BEFORE 14), 0 missing monsterArg/endResult, 0 unknown.
- **M5 (people): PASS** — 6 full transcripts read (see People check below). Senseless 0.
- **Zero-DMG:** 3 on both sides, all classified — 2 pending-face no-strikes (routed, rounds 1–2) + 1 B-scholar-stood-through; invariant PASS by the r125 rule. (The `test-landing-r117-zerodmg-v2.js` test runs its bundled reference corpora, not a panel dir — it printed PASS on fixtures + 3 corpora; the after-proof is the analyzer on AFTER.)
- **Miriam line:** 0. **6394** flat fall-through: 0. **R66:** 5/10 seeds pantry <2000/person at d28 (1143: 1920, 1146: 1916, 1147: 764, 1148: 936, 1151: 1062), 0 starvation deaths. **R73:** NARROW 10, keptInsideNarrow 6 (r125: 10/4) — NARROW-PATTERN holds.
- **Mantle latency:** VACUOUS (0 holder deaths, sixth run running). **1130-d6 amnesia:** 0 — the line `"Huh. I wouldn't have guessed that about you."` is absent from AFTER transcripts ("your plan here" resume appears in 3 transcripts, never followed by the amnesia line).
- **Q6 M7:** GOAROUND **VACUOUS** — R84/R85 arrivals and skips are 0 on every seed (all four guard fields `outingGuardWaterArrivals/Skips`, `outingGuardArrivals/Skips` are 0; rescue never needed this panel, unlike r125's 1/1). Doorstep steps 27–29/seed, all skipped (M6 watch line, 0 triggered).
- **Navlog:** 102 files, navLines 57, all menuMore, 0 issues. **R104 arms-why:** maxWave 2–3, wave4kills 0, table 0; M-A2 counterexample present (carried).
- **Deflect-fallback:** worst sitting 1× (small pool 0 repeats; the two `dlg:subject` acks never repeat in a sitting).
- **Kill-mean:** 33.4/seed AFTER (r125: 30.8). **Poison re-test:** 59 meat tests across AFTER censuses, **0 live re-tests** (no monster tested twice).
- **Scholar-turns watch: MISSES** — new finding, carried, **NOT a Q1 regression** (see below).

### Scholar-turns watch miss — seed 1151 d28 (carried, not caused by the fix)
Fight vs The Focus Group (wave 3, 248 HP) + 2 eye-heads, ally Nadia: scholar moved 4× (1 real to (7,7) + 3 failed attempts at (6,6)), struck 0×, lived at 77 HP; monster routed at 158 HP; Nadia dealt all 90 damage (25+23+19+23); monster hit scholar once for 23. The identical fight happens in BEFORE (same day/monster/ally/positions) — pre-existing on this band/base, not caused by the fix. New vs r125 (r125's 1151 census had only 2 fights, no d28 fight) — arrived with the base change (fansfirst/godpathfirst).
Mechanism read in code: `beastStrikeTarget` (`scripts/policies/competent.js:2334`) returns `'moved'` without checking whether `tbPlayerMove` actually moved; it retried the same (6,6) step 3× and ended each turn without striking or trying an alternate tile. Fix shape for the owning run (competent fight policy / combat-play gate): check the move result and fall back (alternate approach tile, or strike if in range) instead of ending the turn on a failed step. Scholar verb totals: BEFORE move 9 / wait 1, AFTER move 10 / wait 1, barrier-exit 0, ability 0.

## Census comparison (BEFORE → AFTER)
**9/10 identical** in headline numbers (systemDay, pop, alive, villager deaths, kills array, starvation, pantry, pantry/person, kept-delivers). Only 1150 differs: B pop 10 / vd 2 / kept 0 / pantry 42027 → A pop 11 / vd 1 / kept 2 / pantry 28560 — adjudicated by cause: **RNG-stream shift after the d9 combat drive**, the predicted r124/r125 mechanism. Verified: the 1150 daily series is identical d1–d9 (pantry, pop, deaths), first divergence d10 — the morning after the d9 fight. Villager deaths total 10→9.

## Village assessment (plain words)
Ten villages, all still standing at day 28 (9–12 people each from 12 starters; 9 villagers lost across the ten, none to starvation). The System arrived on day 8 everywhere (day 9 on one). People are learning: 58 villagers picked up a brand-new skill from nothing, and practice moved competence in 100 cells. Favors now move: 8 kept and 8 delivered (was 6 and 6), and the evening chain that used to strand on a monster's tile now walks home with the food — Henry's village brought 540 kcal home the night the scholar fought the sanjun off the patch. The naming debate is alive on every village; monsters are named (The Loud Beast, Big-Eyes, Loud-Eyes); three monster meats tested safe. Pantries are thin on half the villages (5 of 10 under 2000 kcal per person at day 28) but nobody starved. Henry's village: Henry himself died on day 11 in an ambush — the only death there — after his day-9 evening chain paid off.

## People check (M5) — read in full
- **1150 d6, Wei (21 turns, 278 lines):** opens on laughter ("When's the last time you really laughed?"), player tells the tripping story, Wei: "Stealing joy. I like that. We should steal more of it, friend." The player changes the subject 4 times; the bridges are 5 DIFFERENT lines (1 want + 4 personal) — the r124/r125 repeat fix holds live in the same sitting that used to repeat. Map sketch: "Don't go there after rain. And this one's worth the walk." Dream: "Groups make decisions slow and loud. I'll help. From over there." Wind-down: "I think better when it's quiet. And out here, thinking is surviving." Ends engaged (curious stage 3): "Good talk. I feel like I know you a little better now."
- **1148 d6, Ivy (19 turns, 244 lines):** opens "Has this changed you? Like, fundamentally?" — the player deflects; Ivy: "Okay." Something shutters, just slightly. The deflection is felt, and honestly recorded (want resolves deflected). Bridges 5 distinct lines. Resume works: "We never finished — how this changed you." → "About how this changed you — yeah, we never did get back to that." (no amnesia). Past: "I used to complain about Shanghai, China traffic. I'd kill for traffic. Orderly, honking traffic." Dream: "I want to be part of the 'we' when people say 'we made it.'" Ending owes: "I just want a place where people notice when I'm gone. Is that too much?" Naming debate runs at the end (two knobs on glass-still water).
- **4 never-offered sittings (M-PR1/M-PR2):** 1146 d9 Ursula (player leaves at opener, 4 entries, ambush of Kgomotso); 1147 d12 Marcus (betrayal declined "Right — another time", naming debate Loud-Eyes vs The Big Stare); 1147 d13 Aki (betrayal declined "Fair enough. Rain check", ambush-against-Aki unsettled, naming debate The Loud Beast vs The Ugly Beast); 1151 d13 Brian (link proposal, player leaves at 0 turns, naming debate). All honest: no commit could have been offered. M-PR1: per-seed never-offered ≤1 on 9/10 seeds (only 1147 has 2: d12 + d13). M-PR2: 12/(16−4)=100% ≥ 80%. AFTER sittings=20, offered=16, picked=16, promised=12, statedAfterPick=4, neverOffered=4, settled=0 (BEFORE: 19/15/15/11/4/4/0).

## Reachable / fun / winnable
- **Reachable:** yes — System d8/9 on all seeds; 44 favors asked, 8 kept, 8 delivered; chains complete from far ground now; practice moves; the naming debate fires; the Q1 chain completes instead of stranding.
- **Fun:** yes — the sittings sound like people (deflections felt, dreams with a stance, endings that owe); the evening chain now pays off instead of dying on a monster tile.
- **Winnable:** leg 0, no win expected; the chain toward it is intact (practice 100 cells, kills 33.4/seed, kept chains 8). The one watch-miss (1151 d28, scholar never striking) is a combat-play weakness for the owning run, not a winnability blocker at this leg.

## Telemetry
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/landing-split.json --current '.../landing-r126-after/journey-landing-r62-census-*.json' --metrics systemDay,villagerDeaths,monsterKills,folTelemetry.fires,starvAutopsies`:
- LOUD: systemDay 33 → 81 (+145%) — seed-count artifact: 81 is the sum over 10 seeds (mean 8.1; baseline 8.25 over 4 seeds). First contact d8–9 on every seed, unchanged.
- LOUD: monsterKills 24 → 334 (+1292%) — seed-count artifact (10 vs 4 seeds) on a baseline that predates the current driver's fight count. Per-seed mean 33.4 (r125: 30.8; r120: 31.1) — stable, not a surge.
- LOUD: folTelemetry.fires 0 → 8 — the follow-volunteer signal postdates the r66 baseline. A new signal, not a regression.
- villagerDeaths and starvAutopsies quiet (9 deaths AFTER vs baseline 9 — exact; 0 starvation both).
Same 3 LOUD lines as r123–r125, all explained. Baseline NOT rolled (panel-size-dependent sums; rolling would bake in a size mismatch).

## Metric review
- **Q1's metric worked.** The panel IS the proof (no standalone test is possible for a driver change); the log comparison (identical prefix through the (0,0) press, divergence exactly at the fix point) + the sanjun corpse at (0,0) d9 make the causal claim tight. Keep the pattern for driver-only fixes.
- **Q2's trigger needs rethinking.** With 20 servings across 9 pools in 102 sittings, a repeat needs 3 servings of one pool in one sitting — nearly impossible on this band. Next voice-pass run should either use a band where the pools serve more, or first ask why grief/cheer/past/secret serve 0–1× while personal serves 23×.
- **The scholar-turns watch can't distinguish pre-existing from new.** It fired on BOTH corpora this run, so as written it can't tell a regression from a standing weakness. Next run: split "new on AFTER" from "present on BEFORE" before calling a miss.
- **Q6 M7 went VACUOUS (0/0).** Same treatment as M6: if the trigger never fires, it's a watch line, not a verdict. It fired 1/1 in r125, so keep it as a carried check for now, but note the vacuity.
- **Census bar:** 9/10 identical meets the r123 bar; the 1150 divergence adjudicated by the predicted stream-shift cause (series identical d1–d9, first divergence d10).
- **r126-census-compare.js** (one-off comparer in /tmp, not committed) has a bug — `monsterKills` is an array, so its kill-mean printed NaN; huntpractice analyzer numbers used instead.

## Tooling
- New: `scripts/analyze-landing-r126-bridge-pools.js` (all 9 pools; validated against r125 corpora). Cloned/adapted: r126 presshop analyzer (H-COMBAT split; validated exact on r125 corpora), r126 BEFORE/AFTER drivers (diff = header + OUTDIR + Q1 fix only).
- Pilot gate PASS. Panel 10/10 both sides, ~6.3–6.4 min each.

## What changed (commit set)
- `scripts/journey-landing-r126-before-20261111.js` (new)
- `scripts/journey-landing-r126-20261111.js` (new, Q1 fix)
- `scripts/analyze-landing-r126-presshop.js` (new)
- `scripts/analyze-landing-r126-bridge-pools.js` (new)
- `evidence/2026-11-11/journey-landing-r126-prereg.md` (new)
- `evidence/2026-11-11/journey-landing-r126.md` (new)
No `src/js` change — driver + analyzer only. No `[needs-eyes]` (no game change to playtest).

## Gate / merge (closeout 2026-11-11, adoption — the run timed out at its 2h cron deadline, gate killed by SIGTERM; adoption re-ran it)
- `node scripts/check.js --quick` in the worktree: **293 passed, 7 failed in 890s — GO.** The 7: measurement-proof staleness pair + mobile-combat-cadence + occupation-panels + phone-frame-proof + establishment-r20-fixes (all 6 standing) + trust-observer-neutrality (120s timeout under fleet load; re-ran standalone GREEN, 6/6). Gate log: evidence/2026-11-11/journey-landing-r126-gate.log; trust re-run log: journey-landing-r126-trust-rerun.log.
- Merge: `git merge --ff-only journey-landing` in main tree (READ-ONLY); verify `git merge-base --is-ancestor journey-landing HEAD` before releasing. Release + reap + verify main tree clean. Do NOT bump/push/verify live — ship loop owns that. Report "merged locally, pending ship".

## Carried items (for r127 / owning runs)
- **Scholar-turns miss (1151 d28):** `beastStrikeTarget` (`scripts/policies/competent.js:2334`) returns `'moved'` without checking whether `tbPlayerMove` actually moved — 3 failed (6,6) steps, 0 strikes, Nadia does all the damage. Fix shape: check the move result and fall back (alternate approach tile, or strike if in range). Owning run: competent fight policy / combat-play gate.
- **Q2 pool order** stays open for r127 (no pool repeated; serving-rate question first).
- **Trap-line invitation swallowed + raise-answer template** at `bond-initiation.js:747` / `convo-wants.js:426-428` (from r131).
- **`tbVillagerFalls` vp.dead lie; monster-veteran +3 damage gap; Baraka unvoiced raise; guest-death prereg; scale.json baseline re-label; origin/master divergence** (ship loop owns reconciliation).
