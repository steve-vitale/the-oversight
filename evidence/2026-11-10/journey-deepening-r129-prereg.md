# journey-deepening r129 — deepening leg (days 40–80), Lane A — PREREG

- **Run:** `laneA-20261110T1745CST`, scheduled Tue 2026-11-10 17:45 CST (2026-11-10 23:45 UTC)
- **Leg:** 2 — deepening (DAYCAP 100, death-aware stop). Rotation read `2` at run start; advance 2→3 owed after landing. Never touch `journey-rotation-b.txt` or `journey-rotation.txt`.
- **Base:** local master `3daa1a9b6` (sim-coverage-tier2-round-2115 evidence; includes r128 grant-rate dial (a) + r125 deepening secret-variety fix + scholar-counts fix `fe45ff679`).
- **Branch:** `journey-deepening`, worktree `~/workspace/worktrees/journey-deepening`.
- **Lock:** `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/playtest-loop.lock`, run_id `playtest-loop-a-20261110T234358Z` (created by this run; no prior lock existed). **Delete at end, re-reading it first.**
- **Heartbeat loop:** `~/workspace/worktrees/journey-deepening-hbloop-r129.sh`, PID 82160, 10-min cadence.
- **Policy:** competent (LISTEN). CONVO_DAYS [45, 60, 80].
- **Seeds:** fresh **100001–100016**; smoke 100000. Freshness verified by the full check: 0 word-boundary .md mentions of any seed in evidence/ + docs/ (the only "100000" hits are arithmetic literals, not seeds), 0 prereg hits, 0 scripts, 0 filenames (`s1000` files are seed 1000, different seeds). Rejected bands in the search, all used: 44001–44016 (r124), 45001–45016 (r125), 46001–46064 (enddaybeats), 47001–47040 (spandraw), 48001–48040 (mootgate), 49001–49040 (gorgeharness), 50001–50003 (journey-scale3), 51001–51008 (fightinterior), 52001–52008 (fightopen4), 53001–53008 (baseline9), 54001–61001 + 70001–77001 + 110001 (assorted sim arms — every xxx01 start checked).
- **Horizon:** DAYCAP=100 (mid-game, waves 2–3; MEASUREMENT §10).

## Pre-flight notes (this run)

- `git pull --ff-only` fails (diverging branches) as usual: local master ahead ~472 / behind 156 vs origin/master. No reconciliation, no merge of origin/master, no push — the ship loop / main session owns it. A reconcile coordinator is LIVE (`reconcile-divergence` worktree in today's reap); it owns the divergence, not this run. Work is based on local master `3daa1a9b6` only. Master may move during this run; rebase onto the explicit SHA before merging, as r124/r125/r127 did.
- Worktree registration took ~9.2 min (slow checkout under sibling contention). Heartbeat loop running at 10-min cadence (PID recorded above).
- **Write-flap watch:** an EPERM flap ran 2026-11-10 ~21:35–22:23Z (r128 + coverage round). Ref writes verified working at run start (lock file + registration both clean). If a flap strikes mid-run, follow the flap skill: stop writing, keep the heartbeat fresh, wait it out.
- **New ruling arriving mid-run (context, NOT in this run's scope):** Steve 2026-11-10 17:52 CST — **COMBAT-PLAY GATE:** before tuning monster toughness, gear, or abilities, establish that villagers actually play combat properly — in parties, fighting smartly, using abilities. Measure fight-level play first (party size at fight start, ability uses per fight, flee/engage vs monster knowledge, trick use, ammo pocketed); no toughness/gear/ability tuning until the census lands. Queued as the fight-play census arm, top priority among unreserved Tier 2 items. This run touches NO toughness/gear/ability tuning (dialogue-variety fixes only), so the gate does not bind it; the census arm belongs to the coverage program, not this journey run.

## Standing context (read before scoring)

- **Scholar-counts fix LANDED (`fe45ff679`) and PROVEN** on the ladder band (r127: Q1 GO — 97902 flips, 13 ready days; Q2 NO-GO as written, band==control proves trajectory neutrality). Not this run's to build.
- **r128 (establishment, landed `b6cf13684`):** grant-rate dial (a) GO. Carried repetition items with exact counts on a fresh band: taken-kin pod sentence 12×, Haven-door favour line 9×, "They hear the warmth in it" 9×, softens beat 5×, deflect pivot 4×, quiet-place walk outcome 6×, stockpile outcome 4×, night-thread cluster, gossip verbatim (Devon). NEW small fix, unowned: "1 liters" pluralization (2× on 2201).
- **r125 (deepening, landed `dc74a94c`):** secret-answer variety + teach-plant frame variety. Carried defects, not fixed: favour-commit away line repeats verbatim across villagers (Heidi + Desmond); place-lesson line `"X — I'll show you on the map sometime. It's real."` is the same defect class as the plant frame.
- **Gate standing:** 296/4 (mobile-combat-cadence, occupation-panels, phone-frame-proof, establishment-r20) + the measurement pair whenever src/js changes (fresh neutral panel + balance-proof-update.js).

## Q1 (PRIMARY) — FAVOUR-BLOCK VARIETY

The Haven-door adjacency line is ONE fixed sentence (`src/js/convo-wants.js:1890`, `convoFavorAction`): "Move next to them, on the same side of the Haven door, to help." It is the `dlg:favor_requirements` answer ("Why can't I do this now?") whenever the player is not adjacent. r128 counted it **9× across 64 convos** — the worst repeater on that panel, and it reads like a system instruction, not a person talking. Question: on a fresh deepening panel, does the same blocked-reason sentence repeat verbatim across favour attempts?

- **Metric (analyzer reads the existing `scanAwayLines` `adjacencyReason` count per transcript; no driver change):** panel total of ADJACENCY_REASON hits + max per sitting.
- **Verdicts:** REPETITIVE if panel total ≥3 (one fixed sentence heard 3+ times is the defect — the r128 bar); VARIED if total 1–2; THIN-PROBE if 0.
- **Fix (if REPETITIVE):** variant pool through `convoPickCycle` (4 variants, every variant conveying both halves: move adjacent AND same side of the Haven door). Proof test RED→GREEN; after-panel on the favour-bearing seeds re-run on the fixed engine. The favour variants in `favor-water.js` / `favor-forage.js` ("Move next to your partner, on the same side of the Haven door.") are sibling wordings, not this line — left alone.

## Q2 (SECONDARY) — PLACE-LESSON FRAME

The place-lesson line (`src/js/villager-agency.js:985`) is ONE fixed frame with only the place swapped: `"${taughtPlace} — I'll show you on the map sometime. It's real."` — the same defect class r125 fixed for the plant frame (7× in one sitting). Question: does the place frame repeat within a sitting on a fresh deepening panel?

- **Metric (analyzer: new `PLACE_FRAME_PATTERNS` + `summarizePlaceFrames`, mirroring r125's `summarizeTeachFrames` — panel-wide transcript scan, the place name blanked by the pattern):** frames, sittingsWithFrames, distinctFrames, maxSameFrame.
- **Verdicts:** REPETITIVE if any sitting repeats one frame ≥3; VARIED if frames ≥1 and max same-frame ≤2; NO-FRAMES if 0.
- **Fix (if REPETITIVE):** `convoTeachPlaceLine(vid, place)` with 4 frames, picked by frame-index rotation on `c.teachPlaceFramesUsed` (a separate tracker from `teachFramesUsed`, mirroring `convoTeachPlantLine` r125). Proof test RED→GREEN; after-panel on the place-bearing seeds.

## Q3 (SECONDARY) — AWAY-LINE + CISTERN

- **(a) AWAY-LINE:** the favour-commit away line (`src/js/convo-wants.js:1787`) is ONE fixed sentence: "Wait — I'm away from Haven, out on the road. I can't promise a dawn meet while I'm out — find me when I'm back, and we'll set it then." r125 saw it verbatim from two villagers (Heidi + Desmond). Metric: analyzer `AWAY_NEW_LINE` count (existing `scanAwayLines` `newLine`). Verdicts: REPETITIVE if ≥3; VARIED if 1–2; THIN-PROBE if 0. Fix (if REPETITIVE): variant pool through `convoPickCycle` (4 variants; every variant keeps the truth: away from Haven, no dawn meet while out, find them when back).
- **(b) CISTERN:** the water-haul opener (`src/js/convo-wants.js:149`) says "1 liters left" — no pluralization (`${liters} liters` in all three openers + whyBits). r128 counted it 2× on 2201. Metric: analyzer scan for `/1 liters?/ ` — count of "1 liters" occurrences in transcripts. The fix is a one-line pluralization (`liter` vs `liters`) made regardless of the panel count — the defect is proven by the line's own text + r128's 2×; the panel count is the re-measure, not the verdict driver. Proof test covers 0/1/2 liters.

## Q4 (carried, read-only)

LADDER (opens/mints/holds), SURV-CONTROL-4 (first four ≥2/4), regression watches (langGate 0 'none', replay 0, menuFlip 0, goalLine capture >0, V-INIT, D-THING, RAJ-PHOTO), Q2-TRUST carried, all-tracks read. PANEL VERDICTS read as before.

## Q5 (census)

Plain-words village assessment per seed; waves 2–3 reached, knowledge economy (counters taught, places learned), regional links; books close on all seeds; unattributed 0.

## Shape

prereg → analyzer delta + proof test → smoke 100000 × DAYCAP=45 → 2-seed pilot (pilot gates: crash, census errors > 0, 0 census rows, 0 favour-block/place/away/cistern firings COMBINED across both seeds → STOP and diagnose the instrument before the full panel; the r128/r125 bands prove these lines fire, so a silent pilot is an instrument failure, not a verdict) → 16-seed panel (4 parallel chunks, r125 shape) → analyzer verdicts → if REPETITIVE with a mechanism: fix + proof test + after-panel on the bearing seeds → run note → gate → merge.

## Amendment A1 — picker change + panel 16→8 + maxRepeat metrics (recorded before any panel seed runs, 2026-11-11 ~00:25Z)

**The r125 corpus proves Q1 untestable as written.** The deepening driver's picker never selects `dlg:favor_requirements` (`dlg:commit` is in ENGAGE; `dlg:favor_requirements` is in no list), so the Haven-door block line fired **0× in the r125 corpus (215 transcripts)** — while the establishment corpus reaches it **14×** via the competent policy's `live[0]` fallback (requirements is first in the menu when the action isn't ready). The same corpus check shows the other instruments' real rates: away line **27×** (well-probed), place frame **1×** (thin), "1 liters" **0×** (thin). **Driver change (harness-only, pre-registered here):** `pickChoiceInner` gains a favour-requirements rule — pick `dlg:favor_requirements` once per sitting, before `dlg:commit` (same position the competent policy's menu order gives it). A competent player who wants to help but is blocked asks why before promising. The game offers the same menu either way.

**Metric revision (same amendment):** the Q1/Q3(a) verdicts as written count panel TOTALS — but after the fix the block still fires (only the wording varies), so a total-count verdict would still read REPETITIVE after a working fix. The binding metric is **maxRepeat of any single wording** (r125 Q1-VARIETY shape): Q1 REPETITIVE iff one Haven-door wording repeats ≥3× panel-wide; VARIED iff total ≥3 and maxRepeat ≤2; THIN-PROBE iff total <3. Q3(a) likewise: REPETITIVE iff one away-line wording repeats ≥3×; VARIED iff total ≥3 and maxRepeat ≤2; THIN-PROBE iff total <3. The analyzer gains `summarizeFavorBlock` (reframe-prefix-normalized per-wording counts + the 4 fix-variant patterns) and `summarizeAwayLineVariety` (per-wording counts + the 4 fix-variant patterns). Q2/Q3(b) stand as written; their expected reads are NO-FRAMES/THIN (place frame 1×, cistern 0× on r125) — if they come back thin, no fix is built for them on this panel (the defect class is noted, not built).

**Panel size 16→8 seeds (100001–100008).** The 16-seed shape was set for the ~4%-rate secret instrument (r125 prereg). These lines fire ~1–2× per seed (away 27/16, favour-block ~0.9/seed on the establishment panel), so 8 seeds yield ~7–13 firings each — well above the ≥3 bar. Seeds 100013–100016 stay fresh and unused. Smoke 100000 × DAYCAP=45 stands; pilot 2 seeds × DAYCAP=100 stands, with the pilot gate: ≥1 favour-block OR away-line firing across the two seeds (the r125 rates say both fire; a silent pilot is an instrument failure, not a verdict).

## Amendment A2 — before-panel verdicts + partner-wording expansion + share bar (recorded after the before-panel, before any fix, 2026-11-11 ~01:00Z)

**Before-panel verdicts (8 panel seeds 100001–100008 + smoke 100000; panel-only counts in parens):**
- **Q1 (1890 line): REPETITIVE** — total 11 (10), distinct 1, maxRepeat 11 (10). One fixed sentence, 10× on the panel seeds alone.
- **Q3(a) away line: REPETITIVE** — total 19 (18), distinct 1, maxRepeat 19 (18).
- **Q2 place frame: NO-FRAMES** — 0 place frames on the whole panel (r125's 1× rate held). No place fix is built.
- **Q3(b) cistern: CLEAN** — 0 "1 liters", 0 "1 liter" (the cistern never held exactly 1 liter on this panel). The one-line pluralization is still built regardless, per the prereg.
- Carried reads: Q1-VARIETY VARIED (r125 fix holds: 3 answered secrets, distinct answers, maxRepeat 1); Q1-TEACHFRAME NO-FRAMES (0 teach frames this panel); Q1-LADDER OPENS+MINTS+HOLDS (9/9 opens, 5/5 tracks, holds 8/9); PANEL VERDICTS EXPLAINED 9.

**Partner wording (NEW Q1b) — the dominant repeater, found by the before-panel.** The delegated favour-block wording (`favor-water.js:95`, `favor-forage.js:53`): "Move next to your partner, on the same side of the Haven door." fires **37× panel-wide (18× on the panel seeds: 14 bare + 4 "As I said — " reframes)** — nearly twice the 1890 line. A1's "left alone" call was wrong: it is the same blank (same requirement, same door, same fixed sentence), and fixing only the 1890 line would leave the player hearing this sentence 18×. **Q1b joins the fix with the same 4-variant pool shape and the same mechanism** (a stateless `convoFavorHash` pick — stable person key + day + per-pool seq — NOT `convoPickCycle`: the block lines are returned by action-check functions, and `convoFavorAction` is documented read-only, so the convo-state ledger `convoPickCycle` writes is not available there; the hash also preserves the r21 re-ask reframe, since the same villager on the same day gets the same variant). The partner pool is shared by both delegated sites so one villager's water and forage favours draw from the same four wordings. Before-panel: **Q1b REPETITIVE** (total 18, maxRepeat 18, distinct 1, panel seeds). The analyzer gains a partner family (`PARTNERBLOCK_PATTERNS`, `summarizePartnerBlock`, `Q1-PARTNERBLOCK PANEL` line) and the proof test gains partner cases.

**Metric revision — absolute maxRepeat ≤2 is unreachable at this firing rate.** A1 set VARIED = total ≥3 and maxRepeat ≤2. The before-panel proves the firing rate (~1.2–3.5×/seed; 10–28 firings per panel) is far above the rate A1 assumed: with 4 variants and 10–28 firings, even perfect rotation gives maxRepeat ~3–7, so VARIED was unreachable with any finite variant pool — the bar, not the fix, was wrong. **Revised bar (applies to Q1, Q1b, Q3(a), set before the fix): DOMINANT SHARE** — REPETITIVE iff maxRepeat/total ≥ 0.5 (one wording is half or more of firings); VARIED iff total ≥3, distinct ≥3, and maxRepeat/total < 0.5; THIN-PROBE iff total <3. Before-panel verdicts are unchanged under the new bar (100% share on all three). The after-panel target is a ~25% share per wording (4-way even split).

**Fix mechanism (all blocked-line sites):** a stateless `convoFavorHash` pick (stable person key + day + per-pool seq: 11 for the 1890 line, 22 for the partner line, 33 for the away line) — chosen over `convoPickCycle` because the block lines are returned by action-check functions and `convoFavorAction` is documented read-only (it reads the conv map without creating one; the journal path calls it outside any sitting), so the convo-state ledger `convoPickCycle` writes is not available there. The same villager on the same day gets the same variant, which preserves the r21 re-ask reframe ("As I said — ...") on a repeat ask; different villagers and days spread across the four wordings. The reason string is computed on action checks that sometimes discard it; the hash pick is pure, so a discarded check costs nothing.

## After-panel (fixed engine, same 8 seeds, 2026-11-11 ~01:00Z)

Per-seed outcomes IDENTICAL to the before-panel (same days, waves, pop) — the fix changes dialogue text only, so the after-panel is a true before/after on identical trajectories. Verdicts:
- **Q1 (1890 line): REPETITIVE — NO-GO.** total 10, distinct 4, maxRepeat 6 (`favorblock-beside` 6, `nextto` 2, `theirside` 1, `rightnext` 1), share 60% ≥ 50%. Improved from 100%/1 wording to 60%/4 wordings, but the bar was missed.
- **Q1b (partner line): VARIED.** total 18, distinct 4, maxRepeat 6, share 33% < 50%. ✓
- **Q3(a) away line: VARIED.** total 18, distinct 4, maxRepeat 7, share 39% < 50%. ✓
- **Q2 place frame: NO-FRAMES** (0, unchanged — no fix built, as preregistered).
- **Q3(b) cistern: CLEAN** (0 bad, 0 good — the cistern never held exactly 1 liter on either panel; the pluralization is proven by the fix proof test case (6)).
- Carried reads hold: Q1-VARIETY VARIED, Q1-TEACHFRAME NO-FRAMES, Q1-LADDER OPENS+MINTS+HOLDS (8/8, holds 7/8).

**Q1 root cause (why the hash clustered):** the 10 firings are 10 DIFFERENT (seed, day, villager) sittings — no re-ask double-counts — and the hash mapped 6 of the 10 distinct inputs to `beside`. A 55-pair aggregate check on a live roster shows the hash is even in the large (14,14,14,13), so this is a small-sample draw (P(one bucket ≥6 of 10) ≈ 15–20% for any stateless pick), not a systematic hash bias — a shifted hash would just re-roll the dice. Only a stateful rotation would guarantee spread, and the read-only contract on `convoFavorAction` blocks it. The fix lands as a PARTIAL: Q1b and Q3(a) verified fixed, Q1 improved but still repetitive; the rotation-vs-hash question (and whether the share bar is too fragile at n≈10) goes to the next run's metric review. No re-roll, no bar change — the miss stands as measured.

## Metric review (to fill at closeout)

- Whether the Q1 bar (panel total ≥3) was the right shape vs a per-sitting bar (the Haven-door line fires across favour attempts, not within one sitting — the r125 teach-frame bar is per-sitting; this one is panel-wide by design).
- Whether the Q3(b) cistern fix's "fix regardless" call was right, or whether a 0-count panel should have held it.
- Whether the favour-block instrument needs a driver pick change (does the competent policy ask "Why can't I do this now?" often enough to measure the fix?).
