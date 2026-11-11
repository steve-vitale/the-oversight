# journey-landing r125 — PRE-REGISTER (Lane A, leg 0 LANDING, days 1–14 judged, horizon d28)

**Run id:** playtest-loop-a-20261110T2345Z (scheduled Tue 2026-11-10 23:45 CST, started ~05:48Z Nov 11).
Rotation read 0 → leg 0 LANDING; wrote 0→1 at run start (verified by read-back).
**Base:** local master `fc0ffb37c` (journey-scale r130, pending ship). Branch: `journey-landing` (worktree).
**Lock:** created 05:48:25Z, run_id `2026-11-11T05:48:19Z-playtest-a`. Heartbeat loop `/tmp/hbloop-r125.sh` (PID 8503, every 10 min). Registration took ~157s (slow checkout, cf. r124 ~9 min).
**Numbering note:** Lane A leg counters are per-leg; the last landing run was r124, so this run is r125.
**Pre-flight deviations (LOUD, recorded, standing state):** `git pull --ff-only` FAILED — local master diverged from origin/master (ahead 524 / behind 156; same standing state as r120–r124; ship loop owns reconciliation, and a Steve-approved reconcile branch exists but is BLOCKED on person-trust errand-mix, not landed — main-session owned, untouched by this run). Proceeded on local master. Main tree clean at run start; disk 34%. `git worktree list` shows 10/16 trees active after reap (reap LOUD notes: sim-secondlink-a, reconcile-forward, sim-travelfirst-a, sim-conjurefix-retune-b hold uncommitted changes — other owners, untouched).

## Seed band — DELIBERATE REUSE (defect seeds)

**Seeds 1142–1151 (the r121 band, reused on purpose — third run on this band).** The Q1 defect reproduces on this band (1150 d6 Wei sitting, r124). The judge is the WITHIN-RUN before/after delta on identical seeds (§15), never a cross-run comparison, so the reuse cannot contaminate the verdict. The band is not in the forbidden-band list. (Freshness skill: reuse is explicitly sanctioned here by r124's run note naming the personal pool as "the next voice-pass item" and by the defect reproducing on this band — the same release r124 used.)

**Design — BEFORE/AFTER on matched seeds (§15, §9):** both drivers run the SAME seeds 1142–1151, DAYS=28. BEFORE = r124-before driver verbatim except OUTDIR/header (r121 driver: press-stop + stepping hop, flee gates OFF). AFTER = the same driver verbatim except OUTDIR/header — the ONLY delta between the legs is the Q1 src fix (no driver-env change). Drivers:
- scripts/journey-landing-r125-before-20261110.js (OUTDIR landing-r125-before)
- scripts/journey-landing-r125-20261110.js (OUTDIR landing-r125-after)
Analyzers: scripts/analyze-landing-r118-outingchain.js; scripts/analyze-landing-r121-presshop.js;
scripts/analyze-landing-r104-20261105.js (DIR via argv);
scripts/analyze-landing-r112-practice.js (DIR via argv);
scripts/analyze-landing-r113-navlog.js; scripts/analyze-landing-r107-commit-offer.js
(WITH the r122 settled-favor exclusion); scripts/analyze-landing-r117-huntpractice.js;
scripts/analyze-landing-r117-zerodmg-v2.js; scripts/analyze-landing-r120-scholar-turns.js;
plus transcript greps for the personal-bridge lines (see Q1). The r122 fleeloop analyzer is NOT run (Q1-flee retired).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, or gate change in this run. **Perception law (2026-10-28) stands** — all instruments read-only; pickers press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** Q1 is the fix for r124's named remainder (the personal bridge pool). A game-code fix is in scope ONLY for Q1 (root cause established pre-panel by reading the code and the r124 transcript).

## Canon

docs/CANON.md read at run start. docs/CONVERSATIONS.md is the canon doc for Q1 (dialogue) — it promises "No repeats, never": `convoPick` tracks said lines by TEXT across ALL threads per villager; generic pools "cycle in varying order". A 2-line pool cycling A,B,A,B inside one sitting is not varying order in any sense the player can hear (r124's finding for `want`, same shape here for `personal`). No canon doc covers the far-hop geometry (Q4) or the doorstep trigger — those are code reads + panel, not invented canon.

## Q1 (PRIMARY) — THE PERSONAL BRIDGE REPEATS VERBATIM (r124 remainder, the named next voice-pass item)

**Basis (read pre-panel, not run):** r124's 1150-d6 Wei sitting serves the dlg:subject acknowledgment twice verbatim for the personal bridge: '"Anyway. What did you want?"' ×2 (turns 119/227), and '"That\'s me, I guess. What\'s on your mind?"' ×2 (the second with a voice closer, so exact-match grep misses it). I read the code: both lines are the WHOLE `BRIDGES.personal` pool (convo-beats.js:182, 2 lines). `bridgeLine` draws via `convoPickCycle(vid, 'bridge:personal', pool)` (convo-beats.js:190), which cycles without replacement then reshuffles keeping the last `min(3, pool.length − 1)` = 1 line (conversation.js:2935). With a 2-line pool the cycle is strict alternation A,B,A,B — a third personal-bridge in one sitting repeats a line heard two turns earlier. Deterministic, not a fluke — the same mechanism r124 proved for `want`.
**Fix (one src change):** expand `BRIDGES.personal` from 2 to 6 distinct lines (same voice — a villager stepping back from talking about themselves and handing the floor to the player; the two original lines stay as entries 1–2). No other call-site change. The other 2-line bridge pools (grief, cheer, goal, past, village, plans, gossip, secret, small) are NOT expanded here: no repetition was observed for them on this band; the voice pass covers them one pool at a time with their own proofs (r124's rule).
**New lines (voice-checked against every existing bridge pool — no full-line collisions, and none reuses a `want`-pool line):**
3. '"Enough about me — you\'ve got something on your mind, I can tell."'
4. '"That\'s my story, anyway. What\'s yours today?"'
5. '"I could go on about myself all day. Better if I don\'t — what do you need?"'
6. '"Right. Me, me, me. Your turn — what\'s up?"'
**Proof test:** new `scripts/test-journey-landing-r125-personal-bridge.js` (modeled on r124's, 3 cases, separate processes: pool / window / control). Pool: `bridgeLine(vid, 'personal')` 6 times — all 6 served bridge texts distinct (substring match against the known pool lines, since voiceLine may add an opener/closer). Window: 12 calls — no repeat within any 3-consecutive window. Control: `bridgeLine(vid, 'small')` 2 times — both served, distinct (pins the untouched pools). BEFORE (unfixed code): the test must FAIL (6 calls alternate A,B,A,B,A,B → distinct=2). AFTER: ALL GREEN.
**Panel re-run (r123/r124 pattern):** AFTER driver re-runs on seeds 1142–1151 post-fix. Q1 metric: 0 verbatim personal-bridge repeats within any sitting across the post-fix AFTER transcripts (per-sitting per-line count ≤ 1 for each of the 6 bridge lines, counted by SUBSTRING match against the known pool lines — the r124 voice-closer case proved exact-match misses real repeats), AND the census JSONs identical except transcript files up to the r123 metric-review bar ("9/10 identical, any divergence adjudicated by cause" — r124 needed no adjudication: 10/10 identical).
**Pre-registered metric (binding):** proof test ALL GREEN post-fix AND 0 verbatim personal-bridge repeats in a sitting on the post-fix AFTER corpus → GO. If the pool change moves any non-transcript census number, adjudicate the movement by cause before calling it done.

## Q1-FLEE — RETIRED AS A PANEL QUESTION (r123 metric review, binding)

The flee-loop defect has not reproduced on ANY band since r121 (r122 fresh band 0/10, r123 defect band 0/10, r124 defect band 0/10). RETIRED until a flee-loop death is observed in the wild again (a census fightLog with 0 strikes + ≥3 moves + scholar death). No panel is burned on it this run; the flee gates stay OUT of both drivers (r124-before verbatim); the code-level defect (legacy branch never pushes) stands as a known, unreproduced shape. This run does not re-litigate it.

## Q2 — M-PR1 / M-PR2 (carried, re-measured on the post-fix corpus)

**Metric (binding):** per-seed (≥3-turn rule) never-offered ≤1 sitting on ≥8/10 seeds; M-PR2: promised/(picked − away-guard) ≥ 80%.

## Q3 — PRACTICE (carried)

movedCells d1→d28, attributed, seedsWithMove, skill0→pos, practiceReps.
Hunt reps 0 watch (r117 hunt-assignment policy question carries — eighth panel running).
**Bar:** GO if movedCells ≥ 50 with 10/10 seeds moving (r121: 97, r122: 103, r123: 95, r124: 95).

## Q4 — FAR-UNREACHED GEOMETRY (follow-up named, no fix in this run)

r124 adjudicated the cause: a combat-interrupted chain (1150 d9 Henry's evening leg — a sanjun jumps the pair mid-press at (0,0); the evening leg checks `inCombat()` only once, before the node loop, so every subsequent hop exits instantly with steps=0 and no named block). The fix for the NEXT run is named here so it is not re-derived: (1) driver — the evening leg drives the fight when `inCombat()` is true before a hop, then retries the hop (a competent player fights the monster and walks on; the driver records the nodes as unreached instead); (2) analyzer — split "hop failed to route" (steps>0, no named block, no combat) from "chain interrupted by combat" (inCombat at hop time), and judge the hop on the first only. Until then, far-unreached stays NOT-MET by construction on this band. A 1-seed debug probe on 1150 MAY run after the panel to confirm the fix shape (diagnostic only, driver deleted not committed, no verdict rides on it).

## M6 DOORSTEP-OUTINGLIVE — MOVED OFF LANDING (r124 metric review, binding decision)

UNTESTED on four consecutive landing runs (r121, r122, r123, r124) — the trigger (hungry/thirsty Haven day, outside the hall) never fires in the landing window because the competent policy ends every day inside-and-fed; r124's code read proved the precondition is engineered away by the current policy, not absent from the game. Per r124's metric review, this check MOVES: the next run that exercises it is a deepening/scale leg where the scholar arrives at Haven needy from travel (the R84/R85 rescue path IS the same shape and fires there), or it is re-scoped as "rescue needed vs rescue given". It is NOT carried as a landing verdict again. The triggered-step count is still reported as a watch line (0 expected), not a verdict.

## Carried bindings (judged fresh on the post-fix AFTER corpus)

- **M1 ALIVE-D14:** 10/10 villages alive at d28.
- **M2 SYSTEM CONTACT:** 10/10 (systemDay d8–d9).
- **M3 FIGHT-LOG:** 0 unknown/mixed trigger.
- **M5 PEOPLE:** PASS (sense-read below — read full transcripts).
- **Zero-DMG invariant:** 0 violations.
- **Miriam line:** 0 "That's settled".
- **R66 HUNGRY:** report hungry share + starvation deaths (r124: 6/10, 0 deaths).
- **R73 narrow windows:** report NARROW / kept-inside-narrow.
- **Mantle latency:** report max (r124: VACUOUS — zero holder deaths).
- **1130-d6 amnesia shape:** 0 recurrences.
- **Scholar-turns watch:** verb totals; no living 0-strike ≥3-move fight.
- **Deflect-fallback repetition:** worst sitting count (r124: 1× for the want-bridge — the personal fix should move the overall worst; report the new worst and whether any non-personal line still repeats ≥2×).
- **6394 flat fall-through:** 0 occurrences.
- **Kill-mean trend:** report per-seed mean.
- **Poison re-test:** count live re-tests.
- **Scholar-eats-first:** held design question, not changed.
- **Q6 M7 GOAROUND:** R84 prompt arrival ≥80% = GOAROUND-HOLDS; R85 complete == skips = RESCUE-GO.

## Seeds, pilot, shape

- Panel: seeds 1142–1151 (deliberate reuse — see above), DAYS=28, OUTDIR landing-r125-before (BEFORE driver) and landing-r125-after (AFTER driver), both under goal hidden_files evidence/2026-11-10/.
- PILOT FIRST: 3 seeds (1142, 1148, 1150 — includes the Q1 defect seed 1150), BEFORE driver, before expanding. The pilot validates (a) seeds run; (b) the practice snapshots present in census JSON (d1/d14/d28, non-null competence maps, practice['hunt'] fields present); (c) the outingchain analyzer runs on the pilot corpus; (d) the invariant test passes (0 violations); (e) ≥1 forage_help favor observed; (f) ≥1 evening together attempt on a far node (d≥4); (g) the personal defect reproduces in the pilot corpus (1150 d6 "Anyway. What did you want?" ×2 — if it does not reproduce, the panel still runs for the carried bindings, but Q1 is UNTESTED on the pilot and the fix rides on the proof test + full-panel grep). If the pilot shows 0 favors, document and still run the panel only if the carried bindings need the panel — the pilot decides; do not burn a full run on a dead question.
- Shape: the r118 outingchain analyzer runs on BOTH corpora as-is. The r121 presshop analyzer compares the two corpora for the outing shape. The invariant test re-runs on the AFTER panel corpus as the after-proof. Q1 is measured by transcript grep (substring match per sitting per line, see above) + the proof test. keptTotal for the chain guard is read from the outingchain analyzer (already run on both corpora), not re-counted. The scholar-turns analyzer runs on the AFTER corpus as the watch read.

## Metric review (filled at closeout, never mid-run)

- (to be filled)
