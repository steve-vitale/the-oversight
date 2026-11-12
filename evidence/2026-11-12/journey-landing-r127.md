# journey-landing r127 — Lane A, leg 0 LANDING (2026-11-12)

Run: `oversight-playtest-loop`, Lane A, leg 0 LANDING, run **r127**. Run id `playtest-loop-a-20261112T0210Z`; scheduled Wed 2026-11-11 19:45 CST, started ~02:10Z. Rotation read 0 → wrote 1 (verified by read-back).
Base: local master `d897eab1f` (sim-voice-adopt-round-0130 landed). `git pull --ff-only`: already up to date. Main tree clean at start; disk 37%.
Worktree `~/workspace/worktrees/journey-landing`, branch `journey-landing`. Heartbeat loop `/tmp/hbloop-r127.sh` (PID 23502, every 10 min).
Lock: created 02:10:19Z, run_id `2026-11-12T02:10:00Z`. **Delete at closeout, even on failure.**

## Prereg (evidence/2026-11-12/journey-landing-r127-prereg.md)
Seeds **1142–1151, DELIBERATE REUSE** (r121 band, 5th run; freshness checked per `local_seed_band_freshness`; reuse sanctioned by r126's run note naming this fix for the owning run). Judge = within-run before/after delta (§15), never cross-run. DAYS=28.
- **Q1 (PRIMARY): beastStrikeTarget failed-move fallback** — r126's scholar-turns miss (1151 d28, 0 strikes / 3 failed moves to (6,6)).
- **Q2 (serving-rate):** why grief/cheer/past/secret serve 0–1× while personal serves 23×; fix ONLY if a pool serves ≥3× in one sitting on BEFORE.
- **Q3 practice (carried):** bar movedCells ≥ 50 with 10/10 seeds moving.
- Carried bindings judged fresh on AFTER: M1, M2, M3, M5, zero-DMG invariant, Miriam line, R66, R73, mantle latency, 1130-d6 amnesia, scholar-turns watch, deflect-fallback, 6394, kill-mean, poison re-test, scholar-eats-first (held), Q6 M7, personal bridge, r126 presshop regression check.

## What was built (worktree)
- `scripts/policies/competent.js` — **Q1 fix**: `beastStrikeTarget` tries EVERY adjacent tile (nearest first) and accepts a move only when the scholar's position actually changes (position check, not the return value); a failed move counts nothing; a turn where no tile is reachable returns `'stuck'` and records `ctx.stuckTurns` / `ctx._strikeStuck`. Turn-ending behavior unchanged for the working path; in-range strike path untouched.
- `scripts/policies/competent-r126.js` — frozen pre-fix policy (byte copy of `competent.js` at base) so BEFORE is a true baseline; frozen vs fixed differ by exactly the Q1 fix (`git diff` verified: +27/−6, the fix only).
- `scripts/test-journey-landing-r127-strike-fallback.js` — proof test (stub Game, 3 cases, separate processes): first-tile-blocked / all-blocked / control. **15/15 PASS on fixed code; 5 FAILs on unfixed code** (unmoved scholar; all-blocked returns 'moved' with closed=1, no stuck record).
- `src/js/convo-beats.js` — **Q2 fix**: `BRIDGES.small` 2→6 lines, same voice (villager steps back from chit-chat, hands the floor to the player); originals kept as entries 1–2.
- `scripts/test-journey-landing-r127-small-bridge.js` — proof test modeled on r125's (pool/window/control, separate processes). **ALL GREEN on fixed code; pool case FAILs on unfixed code** (A,B,A,B,A + null on the 6th call).
- `scripts/journey-landing-r127-before-20261112.js` / `scripts/journey-landing-r127-20261112.js` — r126 AFTER driver verbatim except header + OUTDIR (+ frozen-policy require on BEFORE).
- `scripts/analyze-landing-r127-topic-dwell.js` — NEW Q2 instrument: probe-only dwell/subjFrom (WD GATE thread=), all-transcript servings (r126 method), all-transcript ask-picks. Validated on the r126 AFTER corpus: servings reproduce the r126 analyzer exactly.
- `evidence/2026-11-12/journey-landing-r127-prereg.md`, `evidence/2026-11-12/journey-landing-r127.md` (this note).
- Analyzer outputs + panel logs in worktree `evidence/2026-11-12/` (`.log/.err/.txt`); corpora in goal hidden_files `evidence/2026-11-12/landing-r127-before/`, `landing-r127-after/` (judged corpus), `landing-r127-after-v1-strikeonly/` (strike-fix-only AFTER, superseded by the Q2 fix), `landing-r127-scan-before/`, `landing-r127-scan-after/` (fresh-band scan, see Q1). Corpora not committed.

## Panel (all observed 2026-11-12)
- **Pilot gate PASSED with one deviation** (seeds 1142/1148/1150, DAYS=28, BEFORE driver): 3/3 ran, systemDay 8, 0 FATALs; practice snapshots present (d1/d14/d28); outingchain CHAIN-COMPLETES-FAR; favors 6; far-node evening attempts present (farOk=4); invariant 0 violations; topic-dwell analyzer runs. **Deviation — pilot gate (g):** the frozen-policy BEFORE does NOT reproduce r126's census numbers (1142 kills 46→20, deaths differ). Cause is the BASE MOVE, not the freeze: between r126's base (965e8d04e) and this base (d897eab1f), `src/js/game.js` changed (+167/−27) and `competent.js` changed (garden-caretaker reorder, 91cb6fa20 + reconcile merge 743e07d87). The freeze itself is verified by diff (frozen vs fixed = the Q1 fix only). Cross-run byte-identity is unavailable on a moved base; the within-run isolation stands. Recorded under metric review, not re-scored.
- **BEFORE panel:** 10/10 seeds, exit 0, ~33s; systemDay 8 all seeds; 0 FATALs. **AFTER v1 (strike fix only):** 10/10, exit 0, 0 FATALs — **byte-identical to BEFORE on every analyzer** (see below). **AFTER2 (strike fix + small-pool fix, the judged corpus):** 10/10, exit 0, ~3 min; systemDay 8 all seeds; 0 FATALs.
- **Fresh-band scan (band 1200–1209, fresh — no prereg names it; the "1200" hits are HP values):** BEFORE driver, 10 seeds, exit 0, 0 FATALs; 20 scholar fights. No 0-strike ≥3-move fight. Three fights with ≥2 failed moves (1202 gallowdeer, 1208 callback, 1209 statickite — see Q1). Focused AFTER on 1202/1208/1209: **byte-identical fight tables** — the fix touches none of them (they are flee/dodge moves, not approach moves; see Q1).

## Verdicts

### Q1 PRIMARY — beastStrikeTarget fallback: PANEL-VACUOUS, fix held on unit proof
The defect does NOT reproduce on this base/band: seed 1151 has **0 scholar fights** on both corpora (r126: 4 fights, incl. the d28 Focus Group fight), and **zero-DMG fights = 0 on both corpora** (r126: 3). The pre-registered metric (ZERO 0-strike ≥3-move fights on AFTER) is satisfied trivially — and therefore proves nothing live. Per the prereg, the fix is NOT scored GO on the panel; it is held on its proof test (fails old, passes new) plus a clean no-regression panel.
What the panel DID prove about the fix: AFTER v1 is byte-identical to BEFORE on every analyzer (outingchain, presshop, practice, huntpractice, zerodmg, scholar-turns, personal-bridge, bridge-pools, topic-dwell, commit-offer, r104) — the fix changed no observable outcome anywhere on this panel. The scan-after focused run is byte-identical too.
**Why the defect is rarer than r126 suggested — the wider finding:** the panel's failed moves are NOT approach moves. `tbPlayerMove` results are ignored at FOUR more call sites in `competent.js`, all live on this panel:
- Legacy flee walk (`competent.js:3646`): `Game.tbPlayerMove(tx, py)` passes the FAR edge tile in one call — the same "step, don't teleport" shape the r6 fix cured in the strike path. Live: 1146 d27 redactor (3× failed step to (8,3) while the ally Wanjiru died beside the scholar; fight lost), 1202 d19 gallowdeer (2× to (0,3), fight lost), 1208 d29 callback (3× to (0,4)). The directional-flee one-step path (`:3539`) and the flee-repair stuck counter exist but are env-gated OFF (`COMPETENT_DIRECTIONAL_FLEE`, `COMPETENT_FLEE_REPAIR`, `COMPETENT_EXIT_VERIFIED_FLEE` — none set by the driver).
- Trick dodges (`:2527` move_windup, `:2576` sidestep, `:2608` keep_distance): `tbPlayerMove` result ignored. Live: 1209 d13 statickite (4× failed dodge to (5,3) under the scan-grid telegraph; scholar survived and won, 12 strikes — wasted turns, not a death).
- The refusal REASON is unknown from this corpus (Game.say is silenced by the harness; no say-line reaches the logs). Candidates: far destination exceeds moveLeft (legacy flee), destination occupied (dodge), moderator mute. NOT asserted — the owning run must instrument the refusal before fixing.
- **Carried for r128 / the combat-play gate:** extend the r127 fix shape (try alternates, check position, record 'stuck') to the legacy flee walk + the three trick-dodge call sites, each with its own proof test; first instrument which refusal fires. The 1146 redactor fight is the standing reproduction case (seed 1146, d27, frozen policy). Do NOT re-score Q1 on this panel — the metric stays vacuous.

### Q2 VOICE PASS: GO (small-pool fix)
BEFORE corpus (104 sittings): `small` servings=26, repeatSittings=2, repeatInstances=5 — 1148 d9 "Sure — what's on your mind?" x3 + "Yeah? What's up?" x2 (the transcript flags "VERBATIM REPEATS (3)"), 1142 d6 each x2. Trigger met (≥3 servings of one pool in one sitting). AFTER2: small servings=9, repeatSittings=0, repeatInstances=0. Proof test ALL GREEN post-fix. **GO.**
Serving-rate answer (the Q2 question): grief/cheer/secret starve structurally — `TOPIC_THREADS` (conversation.js:376) is village/past/goal/plans/gossip/personal, so NO ask: item ever sets thread to grief/cheer/secret; they can only arrive via `lastBeat.topic` when the NPC asks a grief/cheer/secret question (conversation.js ~3363/3406/3522/3529). Corpus proof: ask-picks personal=14 village=5 plans=4 goal=4 past=4 fears=2 gossip=1 — zero ask:grief/cheer/secret picks in 104 sittings, and zero dwell turns for grief/cheer/secret/past on the probe sample. `small` serves 26× because it is ALSO the fallback pool for fromTopics with no pool of their own (topic2 topics lately/others/fears/you). Whether topic2 topics deserve their own bridge pools instead of sharing the fallback is a design question for Steve/next run — noted, not built.
Other pools on AFTER2: grief 0, cheer 0, goal 3, past 2, village 5, plans 5, gossip 1, secret 0 — all 0 repeats. Personal 13 servings, 0 repeats (r125 fix holds). Want 46 servings, 0 repeats.

### Q3 PRACTICE: GO
BEFORE movedCells 97, AFTER2 97 (wood 32→31, the only task delta — RNG-stream shift from the bridge draws); seedsWithMove 10/10 both; skill0→pos 40→40; practiceReps 2692. Hunt reps 0 (tenth panel running).

## Carried bindings (AFTER2 corpus)
- **M1:** 10/10 alive at d28 (overAt null all seeds; pop 10–12). **M2:** 10/10 systemDay d8. **M3:** fights 8, 0 missing monsterArg/endResult, 0 unknown.
- **M5 (people):** PENDING — transcripts read while the gate runs; see below.
- **Zero-DMG:** 0 violations both sides. **Miriam line:** 0. **6394** flat fall-through ("Okay. Here's the thing —"): 0.
- **R66:** 5/10 seeds pantry <2000/person at d28 (1145: 1272, 1146: 1425, 1147: 819, 1148: 1395, 1151: 1200), 0 starvation deaths — same as r126.
- **R73:** NARROW 10, keptInsideNarrow 6 — NARROW-PATTERN holds (r126: 10/6).
- **Mantle latency:** NOT vacuous this run — 2 holder deaths, max latency **1 day** (1146: Wanjiru died d27, mantle passed d28; 1150: Amanda died d21 contest, mantle passed d22).
- **1130-d6 amnesia:** 0 — the line is absent from AFTER2 transcripts.
- **Scholar-turns watch:** verb totals move 13 / wait 0, barrier 0, ability 0 on both corpora; no living 0-strike ≥3-move fight on either side (see Q1 — vacuous).
- **Deflect-fallback:** VERBATIM REPEATS flags: 0 in AFTER2 transcripts (BEFORE had 2 sittings flagged — both were the small-pool repeats, now fixed). No other line repeats ≥2× in a sitting by the transcript detector.
- **Kill-mean:** 24.7/seed BEFORE → 24.6 AFTER2 (r126: 33.4 — the base move lowered the kill rate; not a fix effect, the strike-fix-only AFTER v1 was identical to BEFORE).
- **Poison re-test:** 30 meat tests across AFTER2 censuses, **0 in-village re-tests**.
- **Scholar-eats-first:** held design question, not changed.
- **Q6 M7:** arrivals 2 (1145 d11, 1149 d3), skips 2; both rescues completed with eat-on-arrival (ate, kcal 124→2324 / 521→2321). RESCUE-GO per R85 (complete == skips); R84's 80% rate not judgeable at n=2 — reported, not claimed.
- **Personal bridge (r125 fix):** 0 repeats (14 servings both sides).
- **Q1 r126 (combat-interrupted evening chain):** presshop farUnreached=1, nearUnreached=1 on both corpora — the 1 far-unreached is H-ROUTE (route failure), combatInterruptedNodes=0; the r126 fix holds (no combat-interrupted hops).
- **M6 doorstep:** watch line only (doorstep steps in census; 0 triggered expected — not re-verified this run beyond the r104 output).

## Census comparison (BEFORE → AFTER2)
**9/10 headline-identical** (systemDay, deaths, kills). Only 1150 differs: kills 16→15, scholar fights 2→0 — adjudicated by cause: RNG-stream shift from the small-pool bridge draws (the strike-fix-only AFTER v1 was byte-identical to BEFORE, so the divergence arrives with the Q2 src change, same mechanism as r126's 1150 divergence). Deaths total 6→6, kills 247→246.

## Village assessment (plain words)
Ten villages, all still standing at day 28 (10–12 people each from 12 starters; 6 villagers lost across the ten, none to starvation). The System arrived on day 8 everywhere. People are learning: 40 villagers picked up a brand-new skill from nothing, and practice moved competence in 97 cells. Favors move: 32 asked, 6 kept, 7 delivered, 6 hauled from far ground. Pantries are thin on half the villages (5 of 10 under 2000 kcal per person at day 28) but nobody starved. The naming debate is alive; three monster meats tested safe in most villages (30 tests, no second-tasting of the same meat). On 1146, the scholar fought the redactor for 13 rounds, struck it seven times — and then spent the last three rounds stepping toward the edge tile (8,3) and going nowhere while the redactor kept hitting and the ally Wanjiru died beside them. The fight was lost; the scholar lived. That stuck walk is the run's one live combat wound, and it is not the one this run fixed.

## People check (M5) — read in full: PASS, senseless 0
- **1148 d9, James (19 turns, 26 entries):** the worst repeat case on BEFORE, now clean on AFTER2 — FIVE subject changes, FIVE DIFFERENT bridge lines ("Yeah? What's up?", "Okay, I'm all ears.", "Right — go on, I'm listening.", "Alright, I'm listening. What's next?", "Sure — what's on your mind?"), zero repeats. The sitting itself: James opens "Can we talk? ... Like people used to."; sketches maps ("Don't go there after rain. And this one's worth the walk."); the party invite is refused honestly by the System ("You don't really KNOW James yet. Talk to them first — the party UI needs a person, not a stranger." Trust 19/20); the goal thread lands ("Ignorance got us here. Knowledge gets us out."); wind-down: "The scariest thing isn't what happened. It's that we don't know what happened." Naming debate at the end. Want stays curious stage 3, unestablished.
- **1142 d6, Dmitri (24 turns, 31 entries):** SIX subject changes, SIX distinct bridges (three small — "Alright, I'm listening. What's next?", "Go ahead — you've got my attention.", "Yeah? What's up?", "Okay, I'm all ears." — plus two personal: "That's me, I guess. What's on your mind, as it were?" with a voice closer, "Enough about me — you've got something on your mind, I can tell."). Real content throughout: Dmitri misses "Denver rain. Specific rain. I'm allowed to be specific."; his fear: "Don't laugh. Being a burden."; his goal: "Hungry people make bad decisions. Fed people can think."; wind-down: "A hungry village makes bad decisions. I've seen it. Keep bellies full, keep heads clear." Coherent, human, no fabricated shared history. (The confront item — "You said something odd the other day" — is offered from turn 0 in both sittings and never taken; the driver never picks it. An open thread, not a defect.)
- **Commit-offer (M-PR1/M-PR2):** AFTER2 sittings=20 (from the r107 analyzer): offered 16, picked 16, promised 12, stated refusals honest ("I'm out on the road, away from Haven — no dawn meet while I'm out"). M-PR1: per-seed never-offered ≤1 (1148 d8 + 1150 d10 unestablished). M-PR2: 100% of established offers resolve.

## Reachable / fun / winnable
- **Reachable:** yes — System d8 on all seeds; 32 favors asked, 6 kept, 7 delivered; chains complete from far ground; practice moves; the naming debate fires; the small-pool repeats are gone.
- **Fun:** yes — the two worst repeat sittings now read like people (Dmitri's Denver rain, his fear of being a burden, his fed-people-think goal; James's map sketch and "the scariest thing is that we don't know"); 0 verbatim-repeat flags on AFTER2; the evening chain pays off instead of stranding.
- **Winnable:** leg 0, no win expected; the chain toward it is intact (practice 97 cells, kills 24.6/seed, kept chains 6). The combat-play weakness is now precisely located (four unchecked `tbPlayerMove` call sites, one live stuck-flee reproduction) rather than vaguely "the scholar never strikes."

## Telemetry
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/landing-split.json --current '.../landing-r127-after/journey-landing-r62-census-*.json' --metrics systemDay,villagerDeaths,monsterKills,folTelemetry.fires,starvAutopsies`:
- LOUD: systemDay 33 → 80 (+142%) — seed-count artifact: 80 is the sum over 10 seeds (mean 8.0; baseline 8.25 over 4 seeds). First contact d8 on every seed, unchanged.
- LOUD: monsterKills 24 → 246 (+925%) — seed-count artifact (10 vs 4 seeds) on a baseline that predates the current driver's fight count. Per-seed mean 24.6 (r126: 33.4 — the base move lowered the kill rate; the strike-fix-only AFTER v1 was byte-identical to BEFORE, so this is not a fix effect).
- LOUD: folTelemetry.fires 0 → 15 — the follow-volunteer signal postdates the r66 baseline. A new signal, not a regression.
- villagerDeaths and starvAutopsies quiet.
Same 3 LOUD lines as r123–r126, all explained. Baseline NOT rolled (panel-size-dependent sums; rolling would bake in a size mismatch).

## Metric review
- **Q1's metric went vacuous on a moved base.** The defect (1151 d28) existed on r126's base and does not exist on this base — seed 1151 has no scholar fights at all now. The metric as written ("ZERO such fights on AFTER") cannot distinguish a working fix from an absent defect. Next run: the metric must require the defect to reproduce on BEFORE first (as r126's Q1 did with the pilot gate), or the fix must be judged by its unit proof + a targeted reproduction (a seed where the approach actually fails — the scan found none in 20 fights across two bands; the approach path fails rarely because the scholar usually strikes from range). The wider move-result finding (flee/dodge sites) is the live question now, not the approach path.
- **Pilot gate (g) assumed a stationary base.** It failed only because the base moved between r126 and r127. The freeze verification that replaces it: frozen vs fixed policy differ by exactly the fix (diff-checked). Keep that check; drop cross-run byte-identity as a gate when the base moved — record the base move instead.
- **Q2's trigger worked.** The serving-rate instrument (dwell + ask-picks) answered the "why" before the fix: `small` is the fallback pool, so it serves 5× the other 2-line pools. The pool-size fix was the right call for `small`; the grief/cheer/secret starvation is a topic-availability question, not a pool-size question. Next voice-pass run should ask whether topic2 topics (lately/others/fears/you) deserve their own bridge pools instead of sharing `small`.
- **The scholar-turns watch can't distinguish pre-existing from new** (r126's note, still true): it fired on neither corpus this run. Keep as a watch line.
- **Q6 M7 at n=2:** arrivals and skips both 2 — the R84 80% bar needs a bigger sample than a landing panel gives. Report raw counts; don't force the verdict.
- **Census bar:** 9/10 identical meets the r123 bar; the 1150 divergence adjudicated by the predicted stream-shift cause (strike-only AFTER v1 was byte-identical; the divergence arrives with the Q2 src change).

## Tooling
- New: `scripts/analyze-landing-r127-topic-dwell.js` (probe dwell + ask-picks; validated exact on r126 corpora), `scripts/test-journey-landing-r127-strike-fallback.js`, `scripts/test-journey-landing-r127-small-bridge.js`, `scripts/policies/competent-r126.js` (frozen baseline), r127 BEFORE/AFTER drivers.
- Pilot gate PASS (with the documented base-move deviation). Panels 10/10 both sides; scan 10/10 + focused AFTER 3/3.

## What changed (commit set)
- `scripts/policies/competent.js` (Q1 fix; plus gate repair: `tbIsPlayerTurn` guard made existence-guarded, house pattern — a stub Game without the function no longer reads as "not the player's turn")
- `scripts/test-capable-bot-20261014.js` (section-5 fixture updated for the r127 contract: stub `tbPlayerMove` now moves the player the way the real engine does, `tbIsPlayerTurn: () => true` declared; assertions UNCHANGED)
- `scripts/policies/competent-r126.js` (new, frozen baseline)
- `scripts/test-journey-landing-r127-strike-fallback.js` (new)
- `scripts/test-journey-landing-r127-small-bridge.js` (new)
- `src/js/convo-beats.js` (Q2 fix: BRIDGES.small 2→6)
- `scripts/journey-landing-r127-before-20261112.js` (new)
- `scripts/journey-landing-r127-20261112.js` (new)
- `scripts/analyze-landing-r127-topic-dwell.js` (new)
- `evidence/2026-11-12/journey-landing-r127-prereg.md` (new)
- `evidence/2026-11-12/journey-landing-r127.md` (new)
- `evidence/2026-11-12/journey-landing-r127-*.log/.err` (panel + scan logs)
No `[needs-eyes]` — the Q2 fix is dialogue wording (4 new bridge lines, same voice); the Q1 fix is sim-policy only. No game-rule change.

## Gate / merge (closeout)
- Gate (first run): `node scripts/check.js --quick` in the worktree — **334 passed, 6 failed in 616s.** Failures: `test-measurement-proof-update.js` + `test-measurement-workflow.js` STANDING (identical assertions failed on r126's gate); `test-phone-frame-proof.js` STANDING (identical 3 assertions, r126 too); `test-living-garden-deed-attainment.js` + `test-one-person-army-deed-attainment.js` both killed at the 120s per-script cap (exit null, 120.1s) — slow-by-design multi-seed godpath tests, standalone living-garden still progressing through seeds at 300s (slow, not hung; same timeout class as r126's trust-observer); `test-capable-bot-20261014.js` **NEW, caused by my r127 fix** (section 5, 2 failures): (a) my `tbIsPlayerTurn` guard was written `!Game.tbIsPlayerTurn || !Game.tbIsPlayerTurn()` — a stub Game without the function reads as "not the player's turn", so the loop broke before the first move; (b) the section-5 fixture's `tbPlayerMove` returned true without moving the player — exactly the moderator-block case the new position check correctly rejects. Repair: guard → `Game.tbIsPlayerTurn && !Game.tbIsPlayerTurn()` (real-engine behavior unchanged); fixture's `tbPlayerMove` now moves `p` and declares `tbIsPlayerTurn: () => true`; assertions UNCHANGED (no loosening). Standalone re-run: **40 passed, 0 failed** (was 38/2). r127 proof tests re-run green after the guard change. Gate log: evidence/2026-11-12/journey-landing-r127-gate.log.
- Gate (re-run after repair): PENDING — result below when it lands.
- Merge: `git merge --ff-only journey-landing` in main tree (READ-ONLY); verify `git merge-base --is-ancestor journey-landing HEAD` before releasing. Release + reap + verify main tree clean. Do NOT bump/push/verify live — ship loop owns that. Report "merged locally, pending ship".

## Carried items (for r128 / owning runs)
- **Unchecked `tbPlayerMove` results (combat-play gate):** legacy flee walk (`competent.js:3646`, far edge tile in one call) + trick dodges (`:2527` move_windup, `:2576` sidestep, `:2608` keep_distance). Live cases: 1146 d27 redactor (3× failed step to (8,3), ally died, fight lost), 1202 d19 gallowdeer (2× to (0,3), lost), 1208 d29 callback (3× to (0,4)), 1209 d13 statickite (4× failed dodge to (5,3)). Fix shape: the r127 strike-fix pattern (try alternates, check position, record 'stuck'), one proof test per site. First instrument WHICH refusal fires (say-lines are silenced by the harness — the refusal reason is currently unknown). The three COMPETENT_* flee gates are all OFF in the landing driver — the owning run should decide whether they belong on.
- **Q2 follow-up (design question for Steve):** topic2 topics (lately/others/fears/you) share the `small` fallback bridge pool — should they have their own bridge pools?
- **Trap-line invitation swallowed + raise-answer template** at `bond-initiation.js:747` / `convo-wants.js:426-428` (from r131).
- **`tbVillagerFalls` vp.dead lie; monster-veteran +3 damage gap; Baraka unvoiced raise; guest-death prereg; scale.json baseline re-label; origin/master divergence** (ship loop owns reconciliation).
