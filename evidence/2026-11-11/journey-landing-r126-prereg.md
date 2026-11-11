# journey-landing r126 — PRE-REGISTER (Lane A, leg 0 LANDING, days 1–14 judged, horizon d28)

**Run id:** playtest-loop-a-20261111T1543Z (scheduled Wed 2026-11-11 09:45 CST, started ~15:43Z).
Rotation read 0 → leg 0 LANDING; write 0→1 at run start (verified by read-back).
**Base:** local master `965e8d04e` (sim-fansfirst-a landed; sim-godpathfirst-a landed just before it). The run STARTED on `8445ab97f` (journey-scale r131); master moved twice during the 31-min reap + 20-min register (godpathfirst-a, then fansfirst-a). The registered worktree attached to a stale pre-existing `journey-landing` branch at `488506a47` (0 unique commits — it was master ~30 min earlier) and was fast-forwarded to current master with `git merge --ff-only master` inside the worktree. Branch: `journey-landing` (worktree).
**Lock:** created 15:43:40Z, run_id `oversight-playtest-loop-2026-11-11T15:43:40Z`. Registered ~16:36Z; heartbeat 16:37:29Z; heartbeat loop every 10 min after registration.
**Numbering note:** Lane A leg counters are per-leg; the last landing run was r125, so this run is r126.
**Pre-flight deviations (LOUD, recorded, standing state):** `git pull --ff-only` FAILED — local master diverged from origin/master (ahead 587 / behind 156; same standing state as r120–r125; ship loop owns reconciliation; the reconcile-divergence branch exists, main-session owned, untouched by this run). Proceeded on local master. Main tree clean at run start; disk 38%. Reap ran pre-flight (see run note for its LOUD notes).

## Seed band — DELIBERATE REUSE (defect band)

**Seeds 1142–1151 (the r121 band, reused on purpose — fourth run on this band).** The Q1 defect reproduces on this band (1150 d9 Henry evening chain, r124/r125). The judge is the WITHIN-RUN before/after delta on identical seeds (§15), never a cross-run comparison, so the reuse cannot contaminate the verdict.
**Freshness check (local_seed_band_freshness skill, this run, before any scored seed):** grepped `evidence/` preregs for the band — named in journey-landing r121–r125 preregs (r121, r122, r123, r124, r125) and mentioned in journey-establishment r117/r118/r127/r128/r131 preregs; no forbidden-band list names 1142–1151 (the "forbidden" hits are unrelated break/sim docs). Reuse is sanctioned here by r125's prereg + run note, which name the Q1 fix below "for r126" on this band — the reservation is explicitly released for this run's named remainder. Recorded here per the skill.

**Design — BEFORE/AFTER on matched seeds (§15, §9):** both drivers run the SAME seeds 1142–1151, DAYS=28. BEFORE = r125 driver verbatim except OUTDIR/header. AFTER = the same driver verbatim except OUTDIR/header + the Q1 driver fix (+ the Q2 src fix, ONLY if a pool repeats on the BEFORE corpus — see Q2). Drivers:
- scripts/journey-landing-r126-before-20261111.js (OUTDIR landing-r126-before)
- scripts/journey-landing-r126-20261111.js (OUTDIR landing-r126-after)
Analyzers: scripts/analyze-landing-r118-outingchain.js; scripts/analyze-landing-r126-presshop.js (clone of r121 with the H-COMBAT split — see Q1); scripts/analyze-landing-r125-personal-bridge.js (personal pool, carried); scripts/analyze-landing-r126-bridge-pools.js (NEW — all remaining 2-line pools, see Q2); scripts/analyze-landing-r104-20261105.js (DIR via argv);
scripts/analyze-landing-r112-practice.js (DIR via argv);
scripts/analyze-landing-r117-huntpractice.js;
scripts/analyze-landing-r117-zerodmg-v2.js; scripts/analyze-landing-r120-scholar-turns.js;
scripts/analyze-landing-r107-commit-offer.js (WITH the r122 settled-favor exclusion).
The r122 fleeloop analyzer is NOT run (Q1-flee retired).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, or gate change in this run. **Perception law (2026-10-28) stands** — all instruments read-only; pickers press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** Q1 is the fix for r125's named remainder (the combat-interrupted evening chain). A game-code fix is in scope ONLY for Q2, and only if a bridge pool repeats on the BEFORE corpus (r124/r125 voice-pass rule: one pool at a time, each with its own proof).

## Canon

docs/CANON.md read at run start. docs/CONVERSATIONS.md is the canon doc for Q2 (dialogue) — it promises "No repeats, never": `convoPick` tracks said lines by TEXT across ALL threads per villager; generic pools "cycle in varying order". A 2-line pool cycling A,B,A,B inside one sitting is not varying order in any sense the player can hear (r124's finding for `want`, r125's for `personal`, same shape for any pool that repeats here). No canon doc covers the far-hop geometry (Q1) — that is a code read + panel, not invented canon. No canon doc covers the driver policy (Q1 is sim-harness policy, not game code).

## Q1 (PRIMARY) — THE COMBAT-INTERRUPTED EVENING CHAIN (r125 Q4 named fix)

**Basis (read pre-panel, confirmed by r124's debug driver + r125's adjudication):** on 1150 d9 Henry's evening chain, a monster jumps the pair mid-press; the evening leg checks `inCombat()` ONCE before the node loop (driver ~line 3506), so inside the loop `outingHopTo` (~line 2720) exits instantly on its own `inCombat` guard (`while (... && !(Game.inCombat && Game.inCombat()))`), and every hop after the fight returns `from=(0,0) steps=0 reached=False blocked=null`. The fight itself is played later by the main loop's `driveFights(Game, competent, ctx)` (~line 4271) — after the evening leg has already given up. far-unreached has read 4 on four consecutive bands (r122 3→3, r123 4→4, r124 4→4, r125 4→4) with this same deterministic cause.
**Fix (driver + analyzer, NO src/js change):**
- Driver — in the evening node loop, before each `outingHopTo(target.x, target.y)`: if `Game.inCombat()` then call `driveFights(Game, competent, ctx)` (the same call the main loop uses) to play the interrupting fight to completion, then retry the hop. After a hop returns unreached, if `inCombat()` is STILL true (fight started mid-walk, or driveFights hit its no-progress break), drive the fight once more and retry the same hop once. At most one drive + one retry per node — no unbounded loop. If the hop still fails with combat active, the node is recorded as `combat-interrupted` (nodeFails reason + `blocked: 'combat-interrupted'` on the hopDetail entry), NOT `unreached`.
- Analyzer — clone `scripts/analyze-landing-r121-presshop.js` to `scripts/analyze-landing-r126-presshop.js`: add H-COMBAT class (hopDetail with `blocked === 'combat-interrupted'`), excluded from the hop-failure judgment; farUnreached still counts only `unreached` reasons from the evening-blocked lines (the new `combat-interrupted` reason parses separately and does not count); Q2 verdict lines report `combatInterrupted` counts per corpus and judge the hop on non-combat failures only.
- `driveFights` is safe to call here: it loops only while `Game.tbfight && !Game.tbfight.over` (sim-harness.js:734) and is a no-op with no active fight; the driver already imports it and calls it in the main loop.
**Proof:** no standalone proof test is possible for this fix — the driver is a monolithic sim script, not a module (r124/r125 precedent: driver changes are proven by the panel itself). The panel IS the proof: the BEFORE corpus must reproduce the defect (1150 d9 chain, farUnreached ≥ 1 from steps=0 hops), and the AFTER corpus must show the chain reaching the node after the fight (or honestly recording combat-interrupted). A 1-seed debug probe on 1150 MAY run after the panel to confirm the mechanism (diagnostic only, driver deleted not committed, no verdict rides on it).
**Pre-registered metric (binding):** AFTER farUnreached < BEFORE farUnreached AND zero AFTER unreached hops with steps=0 and no named block while combat was active at hop time (i.e. every remaining unreached hop carries an engine-named block or a combat-interrupted record) → GO. If farUnreached does not fall, adjudicate by case in the run note — do not re-score.

## Q2 — VOICE PASS: WHICH 2-LINE BRIDGE POOL REPEATS NEXT

**Basis:** the remaining 2-line `BRIDGES` pools in `src/js/convo-beats.js:174` share the r124/r125 defect shape: grief, cheer, goal, past, village, plans, gossip, secret, small (9 pools; `personal` and `want` are already 6). r125's metric review: "Which pool repeats next on a fresh band decides the order; on this band none repeated."
**Instrument (NEW):** `scripts/analyze-landing-r126-bridge-pools.js` — generalizes the r125 personal-bridge analyzer to all 9 remaining pools: per transcript file, per pool, per line, substring counts; reports per-pool sittings/servings/repeatSittings/repeatInstances + the repeating cases. Run on the BEFORE corpus first (the decision point), then on the AFTER corpus.
**Fix (CONDITIONAL — only if a pool repeats on the BEFORE corpus):** if any pool shows a line >1× in a sitting, expand THAT pool (only that one) from 2 to 6 distinct lines in the same voice (the pool's own topic voice — a villager stepping back from that topic and handing the floor to the player; the two original lines stay as entries 1–2), with its own proof test modeled on r125's (`scripts/test-journey-landing-r126-<pool>-bridge.js`: pool / window / control cases; must FAIL on unfixed code, ALL GREEN after). The AFTER driver then runs with the new src. If NO pool repeats, Q2 is measurement-only (no src change) and the pool order stays open for r127.
**Pre-registered metric (binding):** if a fix lands — proof test ALL GREEN post-fix AND 0 verbatim repeats of the expanded pool's lines in a sitting on the post-fix AFTER corpus → GO. If no pool repeats — report the per-pool counts and call Q2 MEASURED (no fix owed this run).

## Q3 — PRACTICE (carried)

movedCells d1→d28, attributed, seedsWithMove, skill0→pos, practiceReps.
Hunt reps 0 watch (r117 hunt-assignment policy question carries — ninth panel running).
**Bar:** GO if movedCells ≥ 50 with 10/10 seeds moving (r121: 97, r122: 103, r123: 95, r124: 95, r125: 96).

## Q4 — FAR-UNREACHED GEOMETRY (this run's Q1 — see above)

r125's Q4 IS this run's Q1. The fix is built here; the metric above judges it.

## M6 DOORSTEP-OUTINGLIVE — MOVED OFF LANDING (r124 metric review, binding decision applied)

Watch line only (0 expected), not a verdict. Same shape as r121–r125.

## Carried bindings (judged fresh on the post-fix AFTER corpus)

- **M1 ALIVE-D14:** 10/10 villages alive at d28.
- **M2 SYSTEM CONTACT:** 10/10 (systemDay d8–d9).
- **M3 FIGHT-LOG:** 0 unknown/mixed trigger.
- **M5 PEOPLE:** PASS (sense-read below — read full transcripts).
- **Zero-DMG invariant:** 0 violations.
- **Miriam line:** 0 "That's settled".
- **R66 HUNGRY:** report hungry share + starvation deaths (r125: 6/10, 0 deaths).
- **R73 narrow windows:** report NARROW / kept-inside-narrow.
- **Mantle latency:** report max (r125: VACUOUS — zero holder deaths).
- **1130-d6 amnesia shape:** 0 recurrences.
- **Scholar-turns watch:** verb totals; no living 0-strike ≥3-move fight.
- **Deflect-fallback repetition:** worst sitting count (r125: 1× — report the new worst and whether any non-personal line still repeats ≥2×; the Q2 analyzer covers the bridge pools, this watch covers the rest).
- **6394 flat fall-through:** 0 occurrences.
- **Kill-mean trend:** report per-seed mean.
- **Poison re-test:** count live re-tests.
- **Scholar-eats-first:** held design question, not changed.
- **Q6 M7 GOAROUND:** R84 prompt arrival ≥80% = GOAROUND-HOLDS; R85 complete == skips = RESCUE-GO.
- **Personal bridge (r125 fix):** 0 repeats in a sitting on the AFTER corpus (the r125 analyzer runs as a regression check).

## Seeds, pilot, shape

- Panel: seeds 1142–1151 (deliberate reuse — see above), DAYS=28, OUTDIR landing-r126-before (BEFORE driver) and landing-r126-after (AFTER driver), both under goal hidden_files evidence/2026-11-11/.
- PILOT FIRST: 3 seeds (1142, 1148, 1150 — includes the Q1 defect seed 1150), BEFORE driver, before expanding. The pilot validates (a) seeds run; (b) the practice snapshots present in census JSON (d1/d14/d28, non-null competence maps, practice['hunt'] fields present); (c) the outingchain analyzer runs on the pilot corpus; (d) the invariant test passes (0 violations); (e) ≥1 forage_help favor observed; (f) ≥1 evening together attempt on a far node (d≥4); (g) the Q1 defect reproduces in the pilot corpus (1150 d9 chain: far-node hops with steps=0, no named block — if it does not reproduce, the panel still runs for the carried bindings, but Q1 is UNTESTED on the pilot and the fix rides on the full-panel comparison); (h) the Q2 bridge-pool analyzer runs on the pilot corpus. If the pilot shows 0 favors, document and still run the panel only if the carried bindings need the panel — the pilot decides; do not burn a full run on a dead question.
- Shape: the r118 outingchain analyzer runs on BOTH corpora as-is. The r126 presshop analyzer compares the two corpora for the outing shape. The invariant test re-runs on the AFTER panel corpus as the after-proof. Q1 is measured by the presshop analyzer + transcript/census grep. keptTotal for the chain guard is read from the outingchain analyzer (already run on both corpora), not re-counted. The scholar-turns analyzer runs on the AFTER corpus as the watch read.

## Metric review (filled at closeout, never mid-run)

- (to be filled)
