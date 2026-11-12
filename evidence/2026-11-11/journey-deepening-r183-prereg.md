# journey-deepening r183 — deepening leg (days 40–80), Lane A — PREREG

- **Run:** `playtest-loop-a-20261111T2045Z`, scheduled Wed 2026-11-11 14:45 CST (20:45 UTC).
- **Leg:** 2 — deepening (DAYCAP 100, death-aware stop). Rotation read `2` at run start; advance 2→3 owed after landing. Never touch `journey-rotation-b.txt` or `journey-rotation.txt`.
- **Base:** local master `d33ca69f9` (verified in worktree: `git log` HEAD = d33ca69f9, branch `journey-deepening`, status clean). Origin divergence note: local master is ahead of origin/master (unpushed loop landings) — no reconciliation, no merge of origin/master, no push; the ship loop / main session owns it.
- **Branch:** `journey-deepening`, worktree `~/workspace/worktrees/journey-deepening` (registered 21:35Z, attempt 6 — see flap note).
- **Lock:** `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/playtest-loop.lock`, run_id `2026-11-11T20:45:00Z` (created 20:45:47Z; no prior lock existed). **Delete at end, re-reading it first.**
- **Heartbeat loop:** `~/workspace/worktrees/journey-deepening-hbloop-r183.sh`, 10-min cadence, started ~21:39Z; manual heartbeat 21:39Z.
- **Policy:** competent. Seeds: fresh **100018–100025** (8 seeds); smoke 100026. Freshness verified: 0 hits in all `evidence/` `*.md` files, 0 in `scripts/`, 0 filenames (search scope: `grep -rInE "1000(18|19|2[0-9])" evidence/ --include="*-prereg.md"`, `grep -rIlE "10002[0-9]" evidence/ --include="*.md"`, `grep -rIlE "10002[0-9]" scripts/`, `find evidence/ -name "*1000*"`). Rejected bands, all used: 100001–100017 (r129/r130), 44001–44016 (r124), 45001–45016 (r125), 46001–46064 (enddaybeats), 47001–47040 (spandraw), 48001–48040 (mootgate), 49001–49040 (gorgeharness), 50001–50003 (journey-scale3), 51001–51008 (fightinterior), 52001–52008 (fightopen4), 53001–53008 (baseline9), 54001–61001 + 70001–77001 + 110001 (assorted sim arms).
- **Horizon:** DAYCAP=100 (mid-game, waves 2–3; MEASUREMENT §10). CONVO_DAYS [45, 60, 80].

## Pre-flight notes (this run)

- Main tree clean at run start; disk 32%. Worktree reaper: removed nothing; 8 LOUD dirty trees (build-ladder-leg4-baseline, sim-wideduty-a, sim-sametick-a, journey-scale-attr, sim-secondlink-a, sim-siegedesign-a, journey2-social, sim-survivalcontrol-b) — none mine, left alone. Active 8/16, cap has room.
- **WRITE FLAP (registration took 6 attempts, 20:47–21:35Z):** `git worktree add` writes 93,182 files per attempt. Attempt 1 (20:47–20:59Z) wrote all files, then `fatal: Could not reset index file to revision 'HEAD'` (two `unable to write file` errors: tools/mobile-sim.html, version.json). Attempt 2 (13.9 min) failed the same way (r2 stderr hidden by the script). Attempts 3–5 failed FAST (≤24s) — the attach retry died on an early checkout write. Root cause verified: **O_EXCL creates refused host-wide with EPERM** (`python3 os.open(O_CREAT|O_EXCL)` fails in both `.git/refs/heads/` and `~/workspace/`; plain writes also flap intermittently) — seconds-long clear windows between refusals (probe-gating single-success per AGENTS.md). Branch `journey-deepening` was created by attempt 1 (0 commits ahead of master, verified) and the register script re-attached to it on retries; a `git branch -D` attempt failed mid-flap (packed-refs.new EPERM) and was abandoned — the branch was kept, not deleted. Attempt 6 (21:28–21:35Z) succeeded, rc 0. A leftover broken ref `refs/heads/__oexcl_test__` (0-byte file from a failed O_EXCL probe) was found and removed by hand 21:18Z; `git branch` clean after. **Lesson for the next run: when the flap is flickering, registration is a lottery per attempt (checkout survives; the final index reset needs a clear moment) — probe O_EXCL, retry the unmodified register script, do NOT route around with manual ref edits.**
- **Combat-play gate (Steve 2026-11-10 17:52 CST):** no toughness/gear/ability tuning until the fight-play census lands. This run touches dialogue-variety code only, so the gate does not bind it (same as r129/r130).

## Standing context (read before scoring)

- **r130 (deepening, landed — rotation fix):** stateful display-site rotation for the 1890 favour-block line + partner + away lines. After-panel: Q1/Q1b/Q3(a) all VARIED; per-villager rotation proven (Nadia Khoury, 5 sittings, all four partner variants before any repeat). **Carried item for this run, verbatim from the r130 note: "place-lesson frame repeats within a sitting (Brooklyn d45, 2× — same defect class as the r125 plant frame, metric VARIED at maxSameFrame 2)".** That is this run's Q1.
- **r129 (deepening):** Q2 place-frame came back **NO-FRAMES** (0 place frames on the whole 8-seed panel) — no fix built. But the r129/r130 analyzer ALREADY carries the four fix-variant patterns (`teachplace-trace/mark/walk/remember`, `PLACE_FRAME_PATTERNS` in the analyzer) anticipating a `convoTeachPlaceLine` that was never built. The fix is owed, not designed from scratch.
- **r125 (deepening):** plant-frame fix — `convoTeachPlantLine` with 4 frames + frame-index rotation on the villager's convo state (`c.teachFramesUsed`; unused frame picked at random, pool resets only after all four used). The place fix mirrors it exactly.
- **r131/r132 (establishment)** landed; r178/r179/r182 landed on Lane B (phantom-veteran fix live; matched-pilot re-run on current master still owed — Loop B's item, not this run's).
- **Carried (not this run's to build):** Baraka unvoiced raise (French-only speaker); Stella/Nathan trap-line invitation swallowed by raise-answer template; guest deaths (Bing) prereg; survival-collapse cause (combat side); scholar-payment open item (Steve-call); scale.json baseline regime re-label; 1415Z 17-failure gate attribution (still owed); preserve_food has no villager-side job; taken-kin pod sentence / softens beat / deflect pivot / quiet-place walk / stockpile / night-thread repetition items (r128 counts); r171 M2b scholar-open proof still owed; measurement-proof refresh (fresh neutral panel + `balance-proof-update.js`) owed since r129 — this run's change is dialogue-only, so the pair is carried, not rebuilt.
- **Gate standing:** quick gate ~294/6 shape (2 measurement-pair + 4 standing failures, per r130).

## Q1 (PRIMARY) — PLACE-LESSON FRAME VARIETY

**The defect, carried from r130.** The place-lesson line (`src/js/villager-agency.js` ~1175) is ONE fixed frame — `"${taughtPlace} — I'll show you on the map sometime. It's real."` — with only the place name swapped. In r130's before-panel, Brooklyn (seed 100011, d45) spoke it twice in one sitting with two different places; the metric read VARIED (maxSameFrame 2 < 3) so no fix was built. The same defect class r125 fixed for plants (7× in one sitting). The place lesson fires when a villager with known places is asked "What did you see out there?" and no monster/plant lesson spends first — the rate is low (r129: 0 frames / 8 seeds; r130: 2 frames / 8 seeds), so the before-panel may read NO-FRAMES again. **Pre-registered decision: NO-FRAMES on the before-panel does NOT block the fix** — r130 already proved the defect in the wild, and the fix is the carried r125-class repair; the proof test proves the rotation mechanism, and the after-panel measures whether fired frames vary.

**Fix design (to build after the before-panel):**
1. New `convoTeachPlaceLine(vid, placeName)` in `src/js/villager-agency.js`, mirroring `convoTeachPlantLine`: four frames, picked by frame-index rotation on the villager's convo state (`c.teachPlaceFramesUsed` — a separate ledger key from the plant one, so the two rotations never interfere); an unused frame is picked at random, the pool resets only once all four have been used. Falls back to a random frame when the convo state is unavailable. The place name stays in every frame — the lesson stays specific.
2. The four frames are EXACTLY the wordings the r129/r130 analyzer already normalizes (`PLACE_FRAME_PATTERNS`):
   - `"${place} — trace it with your finger. That's where it is, and it's real."`
   - `"${place} — I'll mark it on your map when we're back. It's real, I've stood there."`
   - `"${place} — walk it with me sometime and you'll know the ground. It's real."`
   - `"${place} — remember the shape of it. It's real, and it's worth knowing."`
   The pre-fix frame (`... I'll show you on the map sometime. It's real.`) is retired — the four fix variants replace it, as the analyzer's "R129 fix variants" comment anticipates.
3. Call site: `villager-agency.js` ~1175 (`else if (taughtPlace)`) calls `this.convoTeachPlaceLine(vid, taughtPlace)` instead of the inline template. No other line changes; the places pool (`expeditionSign`, 5 places) and the pop-once spending are untouched.
4. No toughness/gear/ability tuning. No other reason strings change.

**Metric (analyzer: `summarizePlaceFrames`, panel-wide transcript scan, unchanged):** REPETITIVE iff any sitting repeats one frame ≥ 3; VARIED iff frames ≥ 1, maxSameFrame ≤ 2; NO-FRAMES iff 0 frames. Before-panel verdicts document the defect on fresh seeds; after-panel verdicts judge the fix. **Rotation predicts maxSameFrame 1 in any sitting with ≤ 4 place lessons, and distinctFrames up to 4 panel-wide.** The binding bar is maxSameFrame < 3 with distinctFrames ≥ 2 when frames fire.

## Q2 (SECONDARY, carried re-verify, read-only)

Favour-block / partner-block / away lines under the r130 rotation: must still read VARIED on the before-panel (same share bar as r130). If any reads REPETITIVE, that is a regression on the r130 fix — diagnose before building Q1, do not silently re-score.

## Q3 (census)

Plain-words village assessment per seed; waves 2–3 reached, knowledge economy (counters taught, places learned, meat tested/cooked), regional links; books close on all seeds; unattributed 0.

## Q4 (carried, read-only)

LADDER (opens/mints/holds), SURV-CONTROL-4, regression watches (langGate 0 'none', replay 0, menuFlip 0, goalLine capture >0, V-INIT, D-THING, RAJ-PHOTO), Q2-TRUST carried, all-tracks read. PANEL VERDICTS read as before. Q1-VARIETY / Q1-TEACHFRAME carried (r130 holds).

## Shape

prereg → driver/analyzer fork (r130 → r183, seed band + run tag only; no instrument change — place frames are already scanned panel-wide from transcripts) + analyzer proof test → smoke 100026 × DAYCAP=45 → 2-seed pilot (100018, 100019) × DAYCAP=100 (pilot gates: crash, census errors > 0, 0 census rows; place-frame silence is NOT a stop — see Q1 pre-registered decision) → 8-seed panel (4 parallel chunks, r125 shape) → analyzer verdicts → fix + proof test (RED→GREEN) + after-panel on the same 8 seeds → run note → gate → merge. Heartbeat loop: `~/workspace/worktrees/journey-deepening-hbloop-r183.sh`, 10-min cadence.

## Amendment A1 — driver write-retry (recorded 2026-11-11 ~22:15Z, before the pilot)

**The flap defeated the unpatched driver.** Smoke (100026) landed cleanly in a ~90s clear window (22:03–22:04), but the 2-seed pilot FATAL'd on both seeds (0-byte seed JSONs, 16/16 transcripts 0 bytes), and two probe-gated retry rounds died within 2–13s of starting — the refusal phases have shrunk to seconds, so a seed's 17 evidence writes cannot all land in one clear window. **Change (tooling only, no simulation change):** the driver gains `writeFileRetry` (retry each evidence write up to 30×, 1s apart, verifying byte size) at the two transcript sites + the seed-JSON site (which throws on exhaustion, preserving the FATAL behavior). The /tmp diagnostic writes are already try/catch'd and are untouched. Trajectories are identical to the unpatched driver — the retry only changes whether outputs land. The analyzer is untouched. The pilot/panel run under the same probe-gated wrapper as before; per-seed outputs are still validated (JSON > 1KB, zero 0-byte transcripts) before a seed counts.

## Amendment A2 — before-panel verdicts + Q2 favour-block diagnosis (recorded after the before-panel, before any fix, 2026-11-11 ~22:32Z)

**Before-panel verdicts (8 panel seeds 100018–100025; smoke 100026 excluded):**
- **Q1 (place frame): NO-FRAMES** — 0 place frames on the whole panel (r129 shape, not r130's 2 frames). Per the pre-registered decision, this does NOT block the fix: r130 already proved the defect in the wild (Brooklyn d45, same frame 2× in one sitting), and the fix is the carried r125-class repair. The proof test proves the rotation mechanism; the after-panel measures whether fired frames vary.
- **Q2 favour-block: REPETITIVE** — total 6, distinct 2, maxRepeat 4 (`favorblock-nextto` 4/6, 67% share). **Diagnosis (not a re-score): NOT a regression on the r130 rotation.** All 6 firings are from 6 DIFFERENT villagers, each exactly 1 firing per sitting (maxRepeat 1 per sitting) — no villager repeated a variant. The 4× `nextto` are first-picks across 4 different villagers, and per r130 A2 the panel-wide first-pick distribution is uniform-random under BOTH mechanisms — the rotation governs per-villager repeats, never first-picks. At n=6 the share bar is verdict-unstable (r130 A1: r129 60% vs r130 31% on the same mechanism); 4/6 on one variant is a small-sample draw. The rotation is visibly working in the wild on the same panel: mara_vasquez (partner) fired `rightnext` then `theirside` across two sittings; gen_ypfz4j8 fired `theirside` then `beside`. The per-villager guarantee holds perfectly (0 within-sitting repeats). The before-panel verdict stands as measured; the fix proceeds.
- **Q2 partner-block: VARIED** — total 10, distinct 4, maxRepeat 3, share 30%. **Q2 away: VARIED** — total 6, distinct 4, maxRepeat 2. **Q3(b) cistern: CLEAN** — 0 bad, 0 good.
- Carried reads: Q1-VARIETY VARIED (answered 6, distinct 4, maxRepeat 2, teachPicks 5, maxSameFrame 1); Q1-TEACHFRAME NO-FRAMES (0 plant frames — the teach-plant instrument saw nothing this panel); Q1-LADDER OPENS+MINTS+HOLDS (8/8 opens, 5/5 tracks, holds 8/8, firstDays all 14); Q1-LANGGATE NOT-REPRODUCED; MENU-FLIP 0 flips; DEBRIEF 1/1 attributed (scatter-hunger ×1).
- Census: 7/8 villages survived to day 100+; 1 lost to scatter-hunger (livingN 5, pantry 0). Survivors ended with 2–9 people alive. Every village reached wave 2 (first wave-2 kills day 14–34); 35–64 beasts slain each; Codex grew 62–96 entries everywhere.

## Metric review (to fill at closeout)

- Whether the before-panel re-observed the place-frame repeat (r130: maxSameFrame 2) or read NO-FRAMES (r129 shape) — and whether the fix proceeded on the pre-registered decision.
- Whether the after-panel shows distinct place frames (distinctFrames ≥ 2) with maxSameFrame 1 in multi-lesson sittings.
- Whether the proof test's within-sitting rotation (4 distinct frames, 5th differs from 4th) matches the wild behaviour.
- Whether Q2 favour lines stayed VARIED (r130 rotation holds).
