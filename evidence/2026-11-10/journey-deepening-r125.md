# Journey-deepening r125 — run note (Lane A, leg 2)

**Run:** Tue 2026-11-10 06:45 CST (12:45 UTC), attempt 1. Lock run_id `2026-11-10T12:57:38Z`. Worktree `journey-deepening`, branch `journey-deepening`, base local master `7c2591d1f` (journey-establishment r127). Lock deleted at closeout; rotation-a advanced 2 → 3.

**Standing context this run:** local master diverges from origin (ahead ~412 / behind 156, tip `a628aeaf3` PR #121); `git pull --ff-only` fails as usual. Steve ordered reconciliation the morning of 2026-11-10 (~05:11 CST) — a reconcile coordinator is LIVE and owns the divergence; this run did not touch it. Master moved during the run (sim-answermail-drive-a landed 13:43 UTC, tip `e2983bb90`); this branch was rebased onto the explicit SHA before merging (see §7).

**New ruling that arrived mid-run (context, NOT in this run's scope):** Steve 2026-11-10 07:39 CST — **SCHOLAR COUNTS AS A VILLAGER.** The player character (the scholar) is part of the village, and their wave kills count toward the village's living-veteran bar, same as any villager's. The "scholar drain" (killers becoming scholar and dropping out of the veteran count) was a defect, not a design question. Fix direction: count scholar kills in the veteran bar. Noted here for the next run that touches the veteran bar; this run's scope was not expanded.

## Leg question (pre-registered)

**Q1 (PRIMARY) — SECRET-LINE VARIETY:** does the promise answer line repeat verbatim across secret sittings, and does the teach-plant frame repeat within a sitting? Driver records `answerLine` (THEM line on the answer turn) + `teachLines` (THEM lines on `teach` picks). Verdicts: REPETITIVE (max-repeat ≥3, or any sitting repeats one teach frame ≥3) / VARIED / THIN-PROBE (<2 answered) / MIXED.

**Q2 (SECONDARY) — WANT-OUTCOME SPLIT:** when a surfaced want establishes, does it LAND (promised/stated) or merely surface (deflected/unresolved)? Verdicts: LANDS (≥50% of established land) / SURFACES-ONLY / THIN-PROBE / MIXED.

**Q3 (carried, read-only):** LADDER, SURV-CONTROL-4, regression watches, Q2-TRUST carried, all-tracks read.

**Seeds:** fresh band **45001–45016**, smoke 45000. Freshness verified by the full check (0.md mentions, 0 scripts, 0 filenames, 0 seed-context patterns `s4500x`/`seed 4500x`, 0 live processes; false positives are seed-4501 files `s4501` and seed-64501 `s64501` — different seeds). Policy competent (LISTEN), CONVO_DAYS [45, 60, 80].

**Amendment A1** (recorded ~14:15Z 2026-11-10, before any fix): teach-frame instrument widened from secret-sitting `teachLines` to a panel-wide transcript scan (`summarizeTeachFrames` + Q1-TEACHFRAME PANEL; binding verdict REPETITIVE if any sitting repeats one frame ≥3; VARIED if frames ≥1 and max same-frame ≤2; NO-FRAMES if 0). Reason: the secret-sitting instrument saw 0 teach picks, but wild transcripts show the frame repeating outside secret sittings. Also records that Q1-VARIETY's VARIED verdict measures RENDERED lines (voice decoration differs) while the promise CORE sentence repeats 3/3 — the fix is justified by the people check + TEACHFRAME REPETITIVE, not by re-scoring Q1.

## Before-panel (16 seeds, 4 parallel chunks; 12/16 survived)

Losses: 45005 village-lost d74, 45008 d68, 45014 d32 (village-lost with pop 8/8 standing — scholar/village lost, not depopulation, like r124's 44011), 45016 d88. Survivors reached wave 4–5; ladder stage 3 on pilot seeds.

- **Q1-VARIETY: VARIED** (answered=4, distinctAnswers=4, maxRepeat=1, teachPicks=0 in secret sittings) — but the variety was voice decoration only; the promise core sentence repeated 3/3.
- **Q1-WANT: SURFACES** (4/4 established, 4 newly established — r124 fix holds on fresh seeds)
- **Q1-WANT-OUTCOME: LANDS** (established=4, landed=2, surfacedOnly=0, other=2 — both "other" are curious wants resolved `engaged`)
- **Q2-POSTSECRET: MIXED** (answered=4, medianPostAnswerTurns=4, dryFirst=0, referencing=1, refRate 0.25)
- **Q1-SECRET: SECRET-HOLDS** (4 openers, 4 addressed); **Q2-CONFRONT:** secretMenus=4, confrontRides=2
- **Q1-LADDER: OPENS+MINTS+HOLDS** (17/17 opens incl. smoke, 5/5 tracks, holds 15/17)
- **Q2-TRUST: CARRIED** (deaths=79, strangerGains=2, strangerTotal=-35, lateGains=0, knownGains=141)
- **Q1-TEACHFRAME (A1): REPETITIVE** (frames=8, sittingsWithFrames=2, distinctFrames=1, maxSameFrame=7)
- PANEL VERDICTS: `{"EXPLAINED":16,"NO-REGIONAL-DAYS":1}`

## People check (before-panel, 4 secret sittings read in full)

- **45003 d80 Heidi** (bike messenger, prickly, trust 92): secret "Before the scattering, I ran when I should have stayed" → promise → fixed promise line → want ask_favor surfaces (r124 fix working), water-hauling favor, commit → honest deferral "I'm away from Haven, out on the road…" → stated (landed).
- **45009 d80 Courtney** (lawyer, sardonic, trust 96): secret "At night I talk to someone who isn't there anymore" → betrayal declined first, then promise → `"Permit me: Thank you. …"` (voiceLine prefix) → seek_taken surfaces → "Have you heard anything? About the taken. The pods." → commit → promised. Best arc in the panel.
- **45010 d45 Victor** (mason, steady, trust 93): secret "I said something cruel" → betrayal accepted (taught slope-reading on the way) → comfort → fixed comfort line → curious want surfaces → "Has this changed you? Like, fundamentally?" → theory talk ("we're the control group") → engaged.
- **45012 d45 Karen** (pharmacist, bold, trust 90): secret "I saw something in the woods" → promise → `"Thank you. … Mark my words."` (voiceLine suffix) → curious want → "What's your first memory?" → regret talk ("All those Columbus, Ohio mornings…") → engaged.
- **Teach exhibit — Desmond Clarke, 45011 d80:** same plant frame 7× in one sitting (Tucumã, American Persimmon, Inajá, Hawthorn, Porcini, Wood Sorrel, Dandelion), only the plant changing. Panel-wide: 8 frame lines, 7 in this sitting.

Verdict: the secret→want arc is the strongest conversation this loop has produced; all 4 wants surface and establish. Defects: fixed answer core sentences (promise core 3/3 identical) and the teach frame. Also noted (not fixed): favor-commit line "Wait — I'm away from Haven, out on the road…" repeats verbatim across villagers (Heidi + Desmond); place-lesson line `"X — I'll show you on the map sometime. It's real."` is the same defect class as the plant frame.

## The fix (commit `dc74a94c`)

**Secret answers** (`src/js/conversation.js`): `convoSecretAnswerPool(kind)` + `convoSecretAnswerLine(vid, kind)` — 4 variants per kind (promise/comfort/offer/silence), picked through `convoPick` (per-villager dedupe + run-ledger freshness). Every variant keeps the phrase the r120 proof asserts (promise: 'needed someone to know'; comfort: 'Thanks for not looking away'; offer: 'Just knowing someone knows helps'; silence: "That's enough, for now") — the variants vary the sentence around it. Deflect stays single (the door-closing line is a signal); the literacy offer line stays single (already specific). Voice decoration can replace a terminal period with an ellipsis, so the proof test's membership check normalizes trailing punctuation.

**Teach frame** (`src/js/villager-agency.js`): `convoTeachPlantLine(vid, plantName)` — 4 frames, picked by **frame-index rotation** tracked on `c.teachFramesUsed` (the villager's convo state). Rotation, not convoPick, because convoPick dedupes by TEXT and the frames differ only by plant name, so text dedupe can never see a frame repeat. An unused frame is picked at random; the pool resets only once all four are spent. The plant name stays in every frame. The narration line (`teachPlantLine`) already varies by need — only the conversation transcript line changed.

**Analyzer** (`scripts/analyze-journey-deepening-r125-20261110.js`): TEACHFRAME panel-wide transcript scan (A1) + the 3 new frame patterns, so the after-panel normalizes new frames instead of reading them as unknown.

**Proof:** new test `scripts/test-journey-deepening-r125-secret-variety-20261110.js` ran **RED first** (8/10; cases 2 and 6 failed with distinct=1 — the promise core and the teach frame both repeated) and **GREEN after** (10/10). Analyzer proof 45/45 (28 inherited + 11 variety/outcome + 4 teachframe + 2 new-frame cases). No regressions: r120 secret-response 35/35, r122 postsecret 31/31, r124 confront 14/14, r124 want-after-secret 22/22. One real catch during proof: the first offer pool broke r120 (7a) because its variants dropped the asserted phrase — fixed by embedding 'Just knowing someone knows helps' in every offer variant, same pattern as the other kinds.

## After-panel (seeds 45003, 45009, 45010, 45011, 45012 re-run on the fixed engine)

Re-running re-rolls downstream RNG (menu changes consume the random stream differently — r124 noted this), so trajectories diverged: 45009 flipped survived→village-lost d94; 45010 survived but pop 9→1; 45003/45011/45012 survived. Judge on what fired.

- **Q1-VARIETY: VARIED** (answered=3, distinctAnswers=3, maxRepeat=1) — now backed by distinct core variants, not decoration: Karen's promise is the new "I needed someone to know — just one person. Thank you for being that person." while Heidi's is the original; Courtney's comfort is the new "I carried that a long time. ...Thanks for not looking away."
- **Q1-TEACHFRAME: VARIED** (frames=7, sittingsWithFrames=1, distinctFrames=4, maxSameFrame=2) — was REPETITIVE (maxSameFrame=7). The same kind of sitting now cycles all 4 frames: crush-taste, look-feel, original, remember.
- **Q1-WANT: SURFACES** (3/3 established, 3 newly) — r124 fix holds.
- **Q1-WANT-OUTCOME: LANDS** (established=3, landed=2, surfacedOnly=0, other=1)
- **Q1-SECRET: SECRET-HOLDS** (3 openers, 3 addressed); **Q2-CONFRONT:** secretMenus=3, confrontRides=2
- **Q2-POSTSECRET: POST-SECRET-MIXED** (answered=3, medianPostAnswerTurns=3, dryFirst=0, referencing=1, refRate 0.33)
- **Q1-LADDER: OPENS+MINTS+HOLDS** (5/5 opens, 5/5 tracks, holds 3/5)
- PANEL VERDICTS: `{"EXPLAINED":5}`

After-panel people check (3 sittings read in full): Courtney's arc holds on the re-roll with the new comfort variant; Karen's promise is a new variant and her curious arc still engages; Heidi's promise is the original variant and her favor arc still lands (stated). 45010 fired no secret on the re-roll (pop collapsed to 1).

## Verdicts for the leg

- **Reachable:** yes — secrets fire on CONVO_DAYS [45, 60, 80] across seeds; 7 sittings across the two panels.
- **Fun:** the secret→want arc is the strongest conversation this loop has produced; the variety fix removes the one jarring repetition (hearing the same sentence twice).
- **Winnable:** unchanged by this run — the fix is dialogue variety, not a winnability lever. The scholar-counts ruling (above) is the next winnability-relevant item for the veteran bar.

## Metric review

- **Q1-VARIETY measured rendered lines including voice decoration.** The before-panel scored VARIED while the promise CORE repeated 3/3 — decoration masked the defect. Propose for the next run: normalize voice decoration (strip known prefix/suffix markers and the ellipsis swap) before comparing answer lines, so VARIED means distinct cores. The fix is still justified by the people check + TEACHFRAME REPETITIVE, not by re-scoring Q1.
- **Q2 'engaged' (curious want) arguably counts as landed.** The before-panel's two "other" and the after-panel's one "other" are all curious wants resolved `engaged` — a real resolution, not a deflection. Propose for the next run: landed = promised/stated/engaged.
- **Teach instrument scope lesson (A1):** the secret-sitting instrument saw 0 teach picks while wild transcripts showed the frame repeating 7×. Panel-wide transcript scans catch what per-sitting instruments miss.
- **RNG re-roll on after-panel:** re-running seeds on a changed engine diverges trajectories (45009 flipped, 45010 pop 9→1). After-panel verdicts judge what fires, not seed-for-seed identity — but a pop collapse that large (9→1) is worth watching: it is trajectory noise from the random stream shifting, not a designed effect (the fix touches only conversation lines), and the before-panel's SURV-CONTROL-4 passed on the same seeds pre-fix.

## Gate + telemetry

- Gate: `node scripts/check.js --quick` in the worktree — first run 294 passed, 6 failed (739s): the 4 standing fails plus the measurement pair (test-measurement-proof-update.js + test-measurement-workflow.js), which fail whenever src/js changes invalidate the retained neutrality proof inputs ("Proof source inputs are not current"). Refreshed per SIMULATING.md: fresh neutral panel (balance-panel.js, 7 seeds × 4 policies, 150d) → `evidence/2026-11-10/neutral-r125.json.gz` → balance-proof-update.js (pair 9/9 + 9/9). Final gate re-run: **296 passed, 4 failed in 428s** — exactly the standing gate (mobile-combat-cadence, occupation-panels, phone-frame-proof, establishment-r20).
- Telemetry: `node scripts/telemetry-check.js --baseline .../telemetry-baselines/deepening.json --current '<before-fix snapshot seeds 45001–45004>' --metrics w3fights,engaged.w3,fightsTotal,fightsByWave.3` — **quiet** (4 files, 4 metrics, no large deviations). Baseline NOT rolled forward.

## §7 — Landing

- Master moved during the run (sim-answermail-drive-a, tip `e2983bb90` 13:43 UTC). Branch rebased onto the explicit SHA `e2983bb90` before merging (3 commits replayed clean, no rebase quirk); proof tests re-run after the rebase (secret-variety 10/10, analyzer 45/45, r120 35/35, r124 confront 14/14).
- Master moved AGAIN before the merge (sim-vetcount-reconcile-b, tip `a80b2d789` ~14:35 UTC — the veteran-counter reconciliation, touching the same veteran bar as the new scholar-counts ruling). Second rebase onto the explicit SHA `a80b2d789`: the measurement-refresh commit conflicted on `scripts/balance-proof.json` (both arms refreshed it) — resolved by keeping this run's panel pointer, then the proof was regenerated fresh against the final tree (panel digest `3baaca49…`, pair 9/9+9/9). Rebase hazards hit twice in the second rebase: a transient `index.lock` race (verified no git process, lock gone on re-check, re-ran) and `git rebase --continue` needing `GIT_EDITOR=true` (terminal dumb). A runtime restart mid-refresh killed the first panel re-run (SIGTERM) and killed the heartbeat loop (PID 19225); heartbeat went 10.5 min stale, was re-heartbeated manually at 14:42:40Z and the loop restarted (new PID 1780) — no work lost, branch intact.
- Gate: first run 294/6, measurement pair refreshed (neutral-r125), second run **296/4 — the standing gate exactly** on the e2983bb90-based tree. After the second rebase onto a80b2d789, the full gate was re-run on the final tree (result below in the landing line).
- Telemetry quiet; baseline not rolled forward.
- Safe-commit index clobber struck after FOUR commits this run (fix, run note, refresh, and the first prereg commit) — repaired each time via `git ls-tree HEAD -- <paths> | git update-index --add --index-info`; every commit verified correct (blobs match HEAD, status/diff empty after repair). The clobber is now a 4×-in-one-run pattern, not a one-off.
- Merged locally, pending ship (ship loop owns bump/push/live verification). Worktree released, rotation-a 2 → 3, lock deleted, heartbeat loop stopped.
