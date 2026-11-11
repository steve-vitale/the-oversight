# journey-deepening r130 — deepening leg (days 40–80), Lane A

- **Run:** `playtest-loop-a-20261111T1043Z`, scheduled Wed 2026-11-11 04:45 CST (10:45 UTC); run 10:43Z–~11:45Z.
- **Leg:** 2 — deepening (DAYCAP 100, death-aware stop). Rotation read `2`; advance 2→3 at closeout.
- **Base:** local master `194f0eb6e`. Branch `journey-deepening`, worktree `~/workspace/worktrees/journey-deepening`.
- **Policy:** competent. Seeds: fresh 100009–100016 (8 seeds); smoke 100017. Freshness verified (0 filenames, 0 .md run records, 0 script seed literals).
- **Prereg:** `evidence/2026-11-11/journey-deepening-r130-prereg.md` (Amendments A1, A2 recorded in-run).

## What this run asked

The rotation-vs-hash question r129 left open: r129's stateless hash pick clustered 6/10 on one 1890-line variant (60%, NO-GO), and r129's own note said "only a stateful rotation would guarantee spread, and the read-only contract on `convoFavorAction` blocks it." This run asked whether the rotation can live at the display site instead — inside a live sitting, where the convo ledger IS available — and whether it fixes the clustering without breaking anything else.

## Before-panel verdicts (8 seeds + smoke)

- **Q1 (1890 line): VARIED** — total 14 (13 panel-only), distinct 4, maxRepeat 5 (4), share 36% (31%). **The r129 NO-GO did NOT reproduce on fresh seeds.**
- **Q1b (partner line): VARIED** — total 24, distinct 4, maxRepeat 10 (`rightnext` 10), share 42%.
- **Q3(a) (away line): VARIED** — total 16, distinct 4, maxRepeat 6, share 38%.
- **Q2 (place frame): VARIED** — frames 2, one sitting, same frame twice (maxSameFrame 2 < 3). No place fix built, per the prereg.
- **Q3(b) (cistern): CLEAN** — 0 bad, 0 good.
- Carried reads: Q1-VARIETY VARIED (4 answered, distinct 3, maxRepeat 2); Q1-TEACHFRAME VARIED (4 frames, maxSameFrame 1); Q1-LADDER OPENS+MINTS+HOLDS (9/9 opens, 5/5 tracks, holds 7/9); Q1-LANGGATE NOT-REPRODUCED; MENU-FLIP 0 flips; DEBRIEF 3/3 attributed (scholar-death-no-successor ×2, scatter-hunger ×1).
- Every block firing is exactly 1 per sitting — the clustering is purely across-sitting hash draws, never a within-sitting repeat.

**Amendment A1 (recorded after the before-panel, before any fix):** the hash + share-bar combination is verdict-unstable at this firing rate — r129's 60% and r130's 31% are two draws of the same mechanism. Re-rolling panels cannot settle the rotation-vs-hash question; only the mechanism can. The rotation fix was built as preregistered, framed as a robustness guarantee rather than a repair of a reproduced defect. The before-panel VARIED verdicts stand as measured. The after-panel judges the fix under the SAME bar, with the additional rotation-bound expectation maxRepeat ≤ ceil(total/4) and share ≤~30% (see A2 for why that bound was the wrong shape panel-wide).

## The fix (landed in this commit)

Stateful display-site rotation, with the read-only contract intact:

- `src/js/convo-wants.js`: the three 4-variant pools now live once as `convoFavorBlockPool()` / `convoFavorPartnerBlockPool()` / `convoFavorAwayPool()` (shared by the hash and cycle helpers — drift impossible by construction). New `convoFavorBlockLineCycle(vid)` / `convoFavorPartnerBlockLineCycle(vid)` / `convoFavorAwayLineCycle(vid)` — each `this.convoPickCycle(vid, KEY, POOL)`; the ledger (`c.said`) persists across sittings and cycles on exhaustion seeded with the last 3 lines, so no immediate repeat. The hash helpers are unchanged and keep serving the read-only paths. `convoFavorAction`'s adjacency block returns `reasonKey: 'favorblock'` (stable string — the menuKey does not churn); `convoFavorCommit`'s away refusal returns `reasonKey: 'favoraway'`.
- `src/js/favor-water.js`, `src/js/favor-forage.js`: the delegated partner block returns `reasonKey: 'favorpartner'` (forage propagates it through the `adjacent()` helper).
- `src/js/convo-dialogue.js`: the favour handler rotates the spoken line when `!result.ok && status.reasonKey` names a block pool — before the r21 reframe block, so the reframe keys on the rotated variant (it fires on the 5th same-sitting ask instead of the 2nd, preserved, deferred). The commit handler rotates the away beat on a refused commit. Blocked lines only; a successful favour performance is untouched. The journal path keeps the canonical hash line; `convoFavorAction` still creates no conv record.
- No toughness/gear/ability tuning — the 2026-11-10 combat-play gate does not bind this run (dialogue variety only).

## After-panel verdicts (same 8 seeds, fixed engine)

Per-seed outcomes are NOT identical to the before-panel (see A2): only seed 100010 matches exactly. The rotation consumes one `Math.random()` draw per display, shifting the sim's sequential RNG stream; the hash consumed zero. The fix touches no game logic, so the divergence is reshuffle noise (it cuts both ways: 100009 dies earlier, 100013/100015 survive). The after-panel verdicts are measurements of the fixed engine, not a controlled before/after; the firing counts moved because different sittings happened.

- **Q1: VARIED.** total 20, distinct 4, maxRepeat 7, share 35%.
- **Q1b: VARIED.** total 36, distinct 4, maxRepeat 13, share 36%.
- **Q3(a): VARIED.** total 27, distinct 4, maxRepeat 9, share 33%.
- **Q2: VARIED** (unchanged — no fix). **Q3(b): CLEAN.**
- Carried: LADDER OPENS+MINTS+HOLDS 9/9; Q1-VARIETY VARIED; Q1-TEACHFRAME VARIED; MENU-FLIP 0 flips; DEBRIEF 1/1 attributed.

**Amendment A2 — the rotation bound holds per villager, not panel-wide.** A1's maxRepeat ≤ ceil(total/4) prediction did not hold panel-wide (Q1 7 vs bound 5, Q1b 13 vs 9, Q3(a) 9 vs 7): the ledger is per-villager and every firing is 1 per sitting, so the panel-wide distribution is first-picks across many villagers — uniform-random under both mechanisms. What the after-panel proves in the wild is the per-villager guarantee: **Nadia Khoury (seed 100011, partner-block): 5 sittings, nextto → beside → rightnext → theirside → nextto — all four variants before any repeat, the cycle restarting exactly on the 5th.** Luis Fernandez: rightnext → beside → theirside (3 distinct, 3 sittings). gen_qa08t4u: rightnext → beside. Under the hash, 5 draws from 4 variants must repeat before the 5th; here the repeat waits until all four are used. The rotation's win is per-villager (never the same line twice running for the same person) and within-sitting (proof test: 4 distinct on re-ask, reframe on the 5th). Panel-wide shares improved modestly (Q1b 42%→36%, Q3(a) 38%→33%) and are not the verdict driver; the binding bar (share <50%, distinct ≥3) is met on all three lines.

## Proof tests (RED→GREEN)

- Fix: `scripts/test-journey-deepening-r130-favor-rotation-20261111.js` — **18/18 GREEN** on the fixed engine. Cases: cycle helpers return pool members; 4 consecutive cycle calls in one sitting are 4 distinct variants (all three pools); 5th call differs from the 4th; reasonKey on all three action returns with the canonical reason still a pool member; read-only contract (no conv record created); menuKey stable across rebuilds; end-to-end favour_requirements (4 distinct spoken lines, 5th reframes "As I said — ..."); end-to-end refused away commit speaks an away-pool member. RED verified on a temp copy with HEAD sources (`G.convoFavorBlockLineCycle is not a function`).
- Analyzer: `scripts/test-journey-deepening-r130-analyzer-20261111.js` — **23/23 GREEN** (r129 fork, seed band + run tag only). RED verified against the r125 analyzer (crash, as documented).
- Regression: `scripts/test-journey-deepening-r129-favor-variety-20261110.js` — **8/8 GREEN** on the fixed engine (hash helpers unchanged — the pools are shared).

## People check

Three full before-panel transcripts read in full (Brooklyn d45, Fatima d45, Nikolai d60):

- **Fatima (paramedic, steady, trust 91)** opens guarded, stalls, then asks what the player hopes for — "A full night's sleep. Just one. Where I don't wake up listening." — and answers with real feeling ("Eight hours of not being afraid... That's my whole theology now") before asking for help herself, achy and barely keeping food down. The block line fires, the player promises, she thanks them with feeling. A real arc: guard → small human exchange → her need → promise.
- **Nikolai (welder, prickly, trust 87)** re-asks about food from a seed ("I hate to ask twice, but it's still open. Will you?") — the seed system working, the want persisting across conversations. Block line, promise, plain thanks. Then a betrayal invitation ("Help me haul something back?") — declined honestly ("Fair enough. Rain check."), and he ends it himself: "Okay, that's my quota of socializing." Personality showing.
- **Brooklyn (rancher, warm, trust 92)** asks for a water haul; the player asks why they can't help now (partner-block line), commits anyway, and is refused honestly with the away line ("I'm away from Haven... find me when I'm back") — the want resolves as 'stated'. Coherent: the block, the attempt, the honest refusal, the resolution.
- **Noted, not fixed:** in Brooklyn's sitting the place-lesson frame repeats verbatim twice ("a ridge with a view for miles — I'll show you on the map sometime. It's real." / "an old trapline — I'll show you on the map sometime. It's real.") — the same defect class r125 fixed for the plant frame (whose four variants all fire distinctly in the same sitting). The metric reads VARIED (maxSameFrame 2 < 3), so no fix this run; the place frame stays a carried item for the next run.

## Census (Q3) — plain words (before-panel)

Five of eight villages lived to day 100–101; three were lost (100009 day 78, 100013 day 84, both after the scholar died with no successor; 100015 day 61, scattered by hunger). The five survivors ended with 6–10 people alive (44 total). Every village reached wave 4, five reached wave 5. Wave-3 fights happened 1–14 times per village; villagers engaged 5–8 of them each. The knowledge economy is working on every seed: villagers killed 15–56 monsters, tested 3–22, revealed 3–21, and served 2–23 monster-meat dinners. Social life is dense: 76 bond proposals panel-wide, 31 decided, 20 accepted (65%); villagers themselves initiated 27 bonds; 20 link raises. Language arcs fire (1–12 decisions per seed, grants on 3 seeds). The Standing ladder opens on day 14 on every seed, all five tracks mint points everywhere, and holds on 7 of 9. The deepening leg is still lethal — and the deaths come after real fights and real hunger, not from a single bad day.

## Reachable / fun / winnable (leg verdict)

- **Reachable:** yes — the block, partner, and away lines all fire in ordinary play (20–36× per 8-seed panel on the fixed engine), and the rotation variants are reachable through the same menu choices. A repeat asker now hears four distinct wordings before the "As I said —" reframe.
- **Fun:** improved — the same villager never repeats the same block wording twice running; Nadia's five sittings cycled all four partner wordings before any repeat. The panel-wide share is still ~35% (first-picks across many villagers are random under any mechanism), so the improvement is felt per-villager, not panel-wide.
- **Winnable:** unchanged by this run (dialogue only). The ladder opens and holds on 9/9 seeds on the fixed engine; the winnability chain (wave-4 kills → veterans → readiness) is untouched.

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest` — first run **293 passed, 7 failed** in 417s. Accounting for all 7: **1 was this run's own** (`test-foodpower-20261014.js`, ontology validation — my `provides:` edit listed three functions on one line; fixed to one function per line, ontology now 135/135 validated, foodpower 30/30 green on re-run); **2 are the measurement pair** (`test-measurement-proof-update.js` + `test-measurement-workflow.js` — the retained neutrality proof no longer covers current inputs because this run touched src/js files in the manifest; the change is dialogue-only with QUIET before/after telemetry, so the pair is carried as OWED, per the r129 precedent — a fresh neutral panel + `balance-proof-update.js` is the follow-up, not this run); **4 are standing pre-existing** (`test-mobile-combat-cadence.js`, `test-occupation-panels.js`, `test-phone-frame-proof.js`, `test-establishment-r20-fixes-20261020.js` — the same standing set r129 recorded). No regression from this change. Gate re-run after the ontology fix: **294 passed, 6 failed** in 532s — the foodpower failure is gone; the remaining 6 are the same 2 measurement-pair + 4 standing failures listed above. The ontology fix (a comment-only `provides:` reformat + the validator's ONTOLOGY.md regeneration) changed no executable code; all three proof tests re-run green after it (rotation 18/18, r129 variety 8/8, analyzer 23/23).

## Telemetry

`telemetry-check.js` on the 8 after-panel seed JSONs vs the 8 before-panel seed JSONs (same seeds, same n — the leg baseline `deepening.json` is a 4-seed r120 panel and would print false 2× LOUD lines, as its own note warns): metrics w3fights, engaged.w3, fightsTotal, fightsByWave.3. Before aggregates: w3fights 43, engaged.w3 51, fightsTotal 175, fightsByWave.3 43. **Compare: QUIET — no large deviations** (exit 0). The baseline generation step printed two LOUD lines against the stale 4-seed baseline (engaged.w3 +82%, fightsTotal +68%) — the expected n-mismatch artifact, not a real deviation. Baseline NOT rolled forward (nothing unexplained to absorb; the leg baseline stays the r120 4-seed panel until a same-n reseed is run).

## Metric review

- The share bar at n≈10–36 is verdict-unstable for the HASH (r129 60% vs r130 31% on the same mechanism) but the ROTATION's panel shares (33–36%) sit in the same band as the hash's good draws — the panel cannot distinguish the mechanisms, because firings are 1-per-sitting and the ledger is per-villager. The rotation's guarantee is per-villager (proof test + Nadia's 5-sitting cycle), and the panel's job is to confirm no harm + VARIED verdicts, which it does. Future variety work on blocked lines should judge per-villager repetition (same villager, same pool, consecutive firings) rather than panel-wide share alone.
- The r21 reframe fires correctly after rotation (5th same-sitting ask, proof test 7b) — deferred, not broken.
- The journal path still shows the canonical line and `convoFavorAction` creates no conv record (proof test 5) — read-only contract held.
- The menuKey stays stable across rebuilds with reasonKey present (proof test 6).
- The A1 rotation-bound prediction (maxRepeat ≤ ceil(total/4) panel-wide) was the wrong shape — corrected in A2. A per-sitting or per-villager bar would have caught the mechanism's actual guarantee; the share bar stays as the panel verdict, with per-villager repetition as the mechanism check.

## Carried (not this run's to build)

Baraka unvoiced raise (French-only speaker); Stella/Nathan trap-line invitation swallowed by raise-answer template; guest deaths (Bing) prereg; survival-collapse cause (combat side); scholar-payment open item (Steve-call); scale.json baseline regime re-label; 1415Z 17-failure gate attribution (still owed); preserve_food has no villager-side job; taken-kin pod sentence / softens beat / deflect pivot / quiet-place walk / stockpile / night-thread repetition items (r128 counts); r171 M2b scholar-open proof still owed; measurement-proof refresh (fresh neutral panel + `balance-proof-update.js`) owed since r129 — this run's change is dialogue-only with RNG-reshuffled (not logic-changed) trajectories, so the pair is carried, not rebuilt; **place-lesson frame repeats within a sitting (Brooklyn d45, 2× — same defect class as the r125 plant frame, metric VARIED at maxSameFrame 2)**; Q1's r129 NO-GO is now answered (hash verdict-unstable; rotation verified per-villager) and closes.
