# journey-deepening r130 — deepening leg (days 40–80), Lane A — PREREG

- **Run:** `playtest-loop-a-20261111T1043Z`, scheduled Wed 2026-11-11 04:45 CST (10:45 UTC).
- **Leg:** 2 — deepening (DAYCAP 100, death-aware stop). Rotation read `2` at run start; advance 2→3 owed after landing. Never touch `journey-rotation-b.txt` or `journey-rotation.txt`.
- **Base:** local master `194f0eb6e` (sim-trustfirst-a addendum; includes r129 favour-variety fix `ed33b42b8` [needs-eyes]).
- **Branch:** `journey-deepening`, worktree `~/workspace/worktrees/journey-deepening` (registered 10:46Z).
- **Lock:** `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/playtest-loop.lock`, run_id `2026-11-11T10:43:29Z` (created by this run; no prior lock existed). **Delete at end, re-reading it first.**
- **Heartbeat loop:** `~/workspace/worktrees/journey-deepening-hbloop-r130.sh`, PID 35062, 10-min cadence.
- **Policy:** competent. Seeds: fresh **100009–100016** (8 seeds); smoke 100017. Freshness verified: 0 filenames, 0 .md run records, 0 script seed literals for 100009–100017 as played seeds (the only mentions are r129's prereg "100013–100016 stay fresh and unused" and the r129 driver's 16-seed default list, which r129 ran only 8 of — 100001–100008). Rejected bands, all used: 100001–100008 (r129), 44001–44016 (r124), 45001–45016 (r125), 46001–46064 (enddaybeats), 47001–47040 (spandraw), 48001–48040 (mootgate), 49001–49040 (gorgeharness), 50001–50003 (journey-scale3), 51001–51008 (fightinterior), 52001–52008 (fightopen4), 53001–53008 (baseline9), 54001–61001 + 70001–77001 + 110001 (assorted sim arms).
- **Horizon:** DAYCAP=100 (mid-game, waves 2–3; MEASUREMENT §10). CONVO_DAYS [45, 60, 80].

## Pre-flight notes (this run)

- `git pull --ff-only` fails (diverging branches) as usual: local master ahead of origin/master (unpushed loop landings incl. r129/r131/r178/r179) and behind origin/master (Cursor PRs #118–121, Nov 8). No reconciliation, no merge of origin/master, no push — the ship loop / main session owns it. The `reconcile-divergence` branch exists and is main-session owned; it owns the divergence, not this run. Work is based on local master `194f0eb6e` only. Master may move during this run; rebase onto the explicit SHA before merging, as r124/r125/r127/r129 did.
- Main tree clean at run start; disk 34%. Worktree reaper: removed nothing; 7 LOUD dirty trees (build-ladder-leg4-baseline, sim-wideduty-a, sim-sametick-a, journey-scale-attr, sim-secondlink-a, reconcile-forward, sim-convfirst-a) — none mine, left alone. Active 10/16, cap has room.
- **Write-flap watch:** an EPERM flap ran intermittently all morning 2026-11-11 (O_EXCL creates refused, plain writes flapping; reaper blocked ~16 min on REGISTRY.lock; registration of this run's tree took ~2 min). If a flap strikes mid-run, follow the flap skill: probe with a UNIQUE filename per attempt, unlink on every outcome, stop writing, keep the heartbeat fresh, wait it out. Never trust a stale heartbeat alone during a flap.
- **Combat-play gate (Steve 2026-11-10 17:52 CST):** no toughness/gear/ability tuning until the fight-play census lands. This run touches dialogue-variety code only, so the gate does not bind it.

## Standing context (read before scoring)

- **r129 (deepening, landed `ed33b42b8` [needs-eyes]):** favour-line variety — 4 variants each for the 1890 block line, the partner line, and the away line, picked STATELESSLY by `convoFavorHash`. After-panel (same 8 seeds, identical trajectories): Q1b VARIED (share 33%), Q3(a) VARIED (39%), **Q1 NO-GO — REPETITIVE (share 60%: `beside` 6/10)**. Root cause per r129: the hash is even in the large (14,14,14,13 over 55 pairs) — the 6/10 is a small-sample draw (~15–20% for any stateless pick), not hash bias. "Only a stateful rotation would guarantee spread, and the read-only contract on `convoFavorAction` blocks it. The rotation-vs-hash question goes to the next run." **That question is this run's Q1.**
- **r131 (establishment, landed `a16ce1cc8` [needs-eyes]):** cook/mend routine-work grants ladder rungs. r178/r179 landed on Lane B. All merged locally, pending ship.
- **Carried (not this run's to build):** Baraka unvoiced raise (French-only speaker); Stella/Nathan trap-line invitation swallowed by raise-answer template; guest deaths (Bing) prereg; survival-collapse cause (combat side); scholar-payment open item (Steve-call); scale.json baseline regime re-label; 1415Z 17-failure gate attribution (still owed); preserve_food has no villager-side job; taken-kin pod sentence / softens beat / deflect pivot / quiet-place walk / stockpile / night-thread repetition items (r128 counts); r171 M2b scholar-open proof still owed; measurement-proof refresh (fresh neutral panel + `balance-proof-update.js`) owed since r129 — this run's change is dialogue-only with identical before/after trajectories, so the pair is carried, not rebuilt, unless a trajectory moves.
- **Gate standing:** quick gate ~291/9 shape (3 standing + load/timeout artifacts under sibling load); the measurement pair whenever src/js changes (see carried note above).

## Q1 (PRIMARY) — STATEFUL ROTATION FOR THE 1890 FAVOUR-BLOCK LINE

**The mechanism question r129 left open.** The read-only contract blocks a stateful pick *inside* `convoFavorAction` (it is called from the journal path outside any sitting, and from `buildMenu` for the menu cache key — a stateful pick there would rotate on every menu rebuild and burn variants without display). But the line is only ever *spoken* at display sites inside a live sitting, where the convo ledger IS available:

- `convo-dialogue.js:169-176` — the `dlg:favor_requirements` / `dlg:favor_action` handler: `status.reason` is shown via `let line = result.line`, and `convoPickCycle` (run-ledger, `c.said` persists across sittings, cycles on exhaustion seeded with the last 3 lines so no immediate repeat) is callable there because `c` exists.
- `convo-dialogue.js:612-638` — the `dlg:commit` handler: a failed commit speaks `fc.line` (the away line).

**Fix design (to build after the before-panel):**
1. `convoFavorAction` gains a stable `reasonKey` on the block returns — `'favorblock'` for the 1890 adjacency block, `'favorpartner'` for the delegated water/forage partner block — alongside the unchanged canonical `reason` (the journal path and the menuKey keep the hash line; a stable string in the status does not churn the menu cache key). `convoFavorCommit`'s away refusal gains `reasonKey: 'favoraway'`.
2. New cycle helpers in `convo-wants.js` — `convoFavorBlockLineCycle(vid)`, `convoFavorPartnerBlockLineCycle(vid)`, `convoFavorAwayLineCycle(vid)` — each `this.convoPickCycle(vid, 'favor:block' | 'favor:partnerblock' | 'favor:away', POOL)` with POOL shared with the existing hash helpers (pool literals defined once, both helpers draw from them). The hash helpers stay for the read-only paths.
3. Display sites rotate: in the favour handler, when `!result.ok && status.reasonKey` names a known block pool, `line` is replaced by the cycle pick (before the r21 reframe block, so the reframe keys on the rotated variant — it then fires on the 5th same-sitting ask instead of the 2nd, preserved, deferred); in the commit handler, when `fc.reasonKey === 'favoraway'`, `beat` is replaced by the away cycle pick.
4. No other reason strings change: non-block reasons (food, wound-care, closed requests) keep the canonical line.

**Metric (analyzer: r129's `summarizeFavorBlock` / `summarizePartnerBlock` / `summarizeAwayLineVariety`, A2 share bar, unchanged):** REPETITIVE iff maxRepeat/total ≥ 0.5; VARIED iff total ≥ 3, distinct ≥ 3, maxRepeat/total < 0.5; THIN-PROBE iff total < 3. Before-panel verdicts document the defect on fresh seeds (Q1 expected REPETITIVE, mirroring r129's 60%); after-panel verdicts judge the fix. **Rotation predicts share ~25–30% (maxRepeat ≤ 3 on ~10 firings) — the bar stops being luck-dependent, which is the point: a stateful rotation makes the verdict robust at n≈10 instead of re-rolling the hash dice.**

## Q2 (SECONDARY) — PARTNER + AWAY LINES UNDER THE SAME MECHANISM

Q1b (partner) and Q3(a) (away) already passed with the hash (33% / 39%). They move to the same rotation mechanism because they share the display channel and the hash is proven fragile at small n — but the move is only a win if the after-panel re-verifies them: **Q1b and Q3(a) must still read VARIED on the after-panel under the same share bar.** If rotation regresses either, that is a NO-GO on the unification (revert that pool to the hash, keep the 1890 rotation).

## Q3 (census)

Plain-words village assessment per seed; waves 2–3 reached, knowledge economy (counters taught, places learned, meat tested/cooked), regional links; books close on all seeds; unattributed 0.

## Q4 (carried, read-only)

LADDER (opens/mints/holds), SURV-CONTROL-4, regression watches (langGate 0 'none', replay 0, menuFlip 0, goalLine capture >0, V-INIT, D-THING, RAJ-PHOTO), Q2-TRUST carried, all-tracks read. PANEL VERDICTS read as before. Q1-VARIETY / Q1-TEACHFRAME carried (r129 holds).

## Shape

prereg → driver/analyzer fork (r129 → r130, seed band + run tag only) + analyzer proof test → smoke 100017 × DAYCAP=45 → 2-seed pilot (100009, 100010) × DAYCAP=100 (pilot gates: crash, census errors > 0, 0 census rows, 0 favour-block/away/partner firings COMBINED across both seeds → STOP and diagnose the instrument before the full panel; the r129 rates say these lines fire, so a silent pilot is an instrument failure, not a verdict) → 8-seed panel (4 parallel chunks, r125 shape) → analyzer verdicts → if Q1 REPETITIVE with the rotation mechanism available: fix + proof test (RED→GREEN) + after-panel on the same 8 seeds → run note → gate → merge.

## Amendment A2 — after-panel trajectories diverged + rotation-bound correction (recorded after the after-panel, before the gate, 2026-11-11 ~11:20Z)

**The after-panel is NOT trajectory-identical to the before-panel.** Only seed 100010 matches exactly (d100 survived, wave 5). The rest diverge: 100009 d78→d68 (both lost), 100011 wave 5→4, 100012 d100→d102 wave 5→4, 100013 LOST d84→SURVIVED d101, 100014 d100→d101, 100015 LOST d61 scatter-hunger→SURVIVED d101, 100016 wave 5→4. Survival 5/8→7/8; ladder holds 7/9→9/9. **Mechanism:** each rotation pick consumes one `Math.random()` draw (`convoPickCycle` → `convoPick`), and the sim's RNG stream is sequential — the hash pick consumed zero draws, so r129's fix was trajectory-neutral, but any RNG-consuming change reshuffles the deterministic stream. The fix touches no game logic (only which variant string is spoken at display sites), so the divergence is reshuffle noise, not a gameplay effect — it cuts both ways (100009 dies earlier, 100013/100015 survive). The after-panel verdicts are therefore measurements of the FIXED engine, not a controlled before/after; the firing counts themselves moved (Q1 13→20 panel-only, Q1b 24→36, Q3(a) 16→27) because different sittings happened.

**After-panel verdicts (fixed engine, same bar):** Q1 VARIED — total 20, distinct 4, maxRepeat 7, share 35%. Q1b VARIED — total 36, distinct 4, maxRepeat 13, share 36%. Q3(a) VARIED — total 27, distinct 4, maxRepeat 9, share 33%. Q2 VARIED (unchanged, no fix). Q3(b) CLEAN. Carried: LADDER OPENS+MINTS+HOLDS 9/9; Q1-VARIETY VARIED; Q1-TEACHFRAME VARIED; MENU-FLIP 0; DEBRIEF 1/1 attributed.

**Rotation-bound correction (A1's prediction was wrong as a panel-wide expectation):** maxRepeat did NOT cap at ceil(total/4) panel-wide (Q1 7 vs bound 5, Q1b 13 vs 9, Q3(a) 9 vs 7). The ledger is PER-VILLAGER (`c.said` lives on each villager's conv record) and every firing is 1 per sitting, so the panel-wide distribution is first-picks across many villagers — uniform-random under both mechanisms. The rotation bound holds PER VILLAGER, and the after-panel proves it in the wild: **Nadia Khoury (seed 100011, partner-block): 5 sittings, nextto → beside → rightnext → theirside → nextto — all four variants before any repeat, the cycle restarting exactly on the 5th.** Luis Fernandez: rightnext → beside → theirside (3 distinct, 3 sittings). gen_qa08t4u: rightnext → beside. Under the hash, 5 draws from 4 variants must repeat before the 5th; here the repeat waits until all four are used. The rotation's win is per-villager (never the same line twice running for the same person) and within-sitting (proof test: 4 distinct on re-ask, reframe on the 5th) — the panel-wide share improvement (Q1b 42%→36%, Q3(a) 38%→33%, Q1 31%→35% on more firings) is modest and partly reshuffle, and is NOT the verdict driver. The binding bar (share <50%, distinct ≥3) is met on all three lines. If the after-panel had read REPETITIVE, the rotation would have failed its own test; it did not.

## Metric review (to fill at closeout)

- Whether the share bar at n≈10 is now robust under rotation (compare before/after maxRepeat: rotation should cap it at ~3 regardless of draw).
- Whether the r21 reframe still fires correctly after rotation (5th same-sitting ask, not 2nd) — transcript check.
- Whether the journal path still shows the canonical line (read-only contract held) — proof-test case.
- Whether the menuKey stays stable across rebuilds with reasonKey present — proof-test case.

## Amendment A1 — before-panel verdicts + fix proceeds as a robustness guarantee (recorded after the before-panel, before any fix, 2026-11-11 ~11:00Z)

**Before-panel verdicts (8 panel seeds 100009–100016 + smoke 100017; panel-only counts in parens):**
- **Q1 (1890 line): VARIED** — total 14 (13), distinct 4, maxRepeat 5 (4: `beside` 4, `theirside`/`rightnext`/`nextto` 3 each), share 36% (31%).
- **Q1b (partner line): VARIED** — total 24, distinct 4, maxRepeat 10 (`rightnext` 10, `nextto` 6, `theirside` 6, `beside` 2), share 42%.
- **Q3(a) (away line): VARIED** — total 16, distinct 4, maxRepeat 6 (`dawnmeet` 6, `rightnow` 5, `wait` 4, `outroad` 1), share 38%.
- **Q2 (place frame): VARIED** — frames 2, one sitting, same frame twice (maxSameFrame 2 < 3). No place fix is built, per the prereg.
- **Q3(b) (cistern): CLEAN** — 0 bad, 0 good.
- Carried reads: Q1-VARIETY VARIED (4 answered, distinct 3, maxRepeat 2); Q1-TEACHFRAME VARIED (4 frames, maxSameFrame 1); Q1-LADDER OPENS+MINTS+HOLDS (9/9 opens, 5/5 tracks, holds 7/9 — two seeds drop a stage late: 100010 d70, 100012 d60); Q1-LANGGATE NOT-REPRODUCED; MENU-FLIP 0 flips; DEBRIEF 3/3 attributed (scholar-death-no-successor ×2, scatter-hunger ×1).
- Every block firing is exactly 1 per sitting — the clustering is purely across-sitting hash draws, never a within-sitting repeat.

**The r129 NO-GO did NOT reproduce on fresh seeds.** The hash + share-bar combination is verdict-unstable at this firing rate: r129's 60% and r130's 31% are two draws of the same mechanism. Re-rolling panels cannot settle the rotation-vs-hash question; only the mechanism can. **Decision: build the rotation fix as preregistered** (reasonKey + display-site `convoPickCycle`), framed as a robustness guarantee rather than a repair of a reproduced defect. The before-panel VARIED verdicts stand as measured — nothing is re-scored. The after-panel judges the fix under the SAME bar, with the additional rotation-bound expectation: maxRepeat ≤ ceil(total/4) (Q1 ≤4 on ~13 firings, Q1b ≤6 on ~24, Q3(a) ≤4 on ~16) and share ≤~30%. If the after-panel reads REPETITIVE, the rotation mechanism itself fails — that is a NO-GO on the rotation, not on the hash. Q1b's 42% share is the closest to the bar and the sharpest test of the mechanism.
