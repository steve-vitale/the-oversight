# journey-deepening r192 — deepening leg (days 40–80), Lane A — PREREG

- **Run:** `playtest-loop-a-20261114T0945CST`, scheduled Sat 2026-11-14 09:45 CST (15:45 UTC; run started ~16:01 UTC — scheduler/queue delay ~16 min).
- **Run id:** `playtest-loop-a-20261114T160156Z`.
- **Leg:** 2 — deepening (DAYCAP 100, death-aware stop). Rotation read `2` at run start; advance 2→3 at closeout with read-back verification.
- **Base:** local master `3263ddb1f` at run start (journey-establishment r138 tip). `git pull` already up to date. No push (ship loop owns pushes).
- **Branch:** `journey-deepening`, worktree `~/workspace/worktrees/journey-deepening`.
- **Lock:** `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/playtest-loop.lock`, run_id `2026-11-14T16:01:56Z-playtest-loop-a` (created 16:01:56Z). No lock present at run start — no stale-lock recovery. **Delete at end, re-reading it first.**
- **Pre-flight:** main tree clean (0 files), disk 38%. Reap: SKIP — registry lock held by another reaper run (1 consecutive skip); no cleanup this run. Registration slow: `worktree-register.sh` ran 16:05–16:21Z (~15 min; checkout `git reset --hard` genuinely running through the large evidence tree under box load ~13, plus a competing sim-holdpantry-b registration queued on the same registry lock). Registry entry created 16:06:26Z with heartbeat 16:06:26Z (entry is stamped at registration start, so the heartbeat was already ~15 min old when the checkout finished); manual re-heartbeat queued at 16:21Z behind the lock (held by sim-holdpantry-b's registry write, PID 11438) — no reaper running in the window, so the tree was never exposed to a reap while the heartbeat was queued.
- **Policy:** competent. Seeds: fresh **100075–100082** (8-seed panel, no smoke — the 8 seeds ARE the panel; r191's smoke added nothing to the verdicts). DAYCAP=100. CONVO_DAYS [45, 60, 80] (r191 driver clone).
- **Seed freshness (per the seed-band skill):** grep of all `*-prereg.md` under `evidence/` for `10007[5-9]` / `10008[0-2]` = 0 hits. Rejected bands, all used or named: 100070–100074 (r191), 100050–100069 (named in r189's prereg freshness-check range string), 100001–100058 (r129/r130/r183/r184/r187/r188/r189 + smokes), 2501–2516 (r133/r134), 44001–44016 (r124), 45001–45016 (r125), 46001–46064 (enddaybeats), 47001–47040 (spandraw), 48001–48040 (mootgate), 49001–49040 (gorgeharness), 50001–50003 (journey-scale3), 51001–51008 (fightinterior), 52001–52008 (fightopen4), 53001–53008 (baseline9), 54001–61001 + 70001–77001 + 110001 (assorted sim arms).
- **Single-seed-per-process (r183 adoption):** every seed runs as its own `node` invocation (SEEDS=<single>), 2 waves of 4 parallel.

## Standing context (read before scoring)

- **r191 (deepening, landed 2026-11-14, commit 47557e3ba [needs-eyes]):** Q1 H1 STAGE-0 GUARD CONFIRMED + FIXED (stage-0 guard reorder in src/js/conversation.js; probe RED→GREEN; r53 test green before/after). Q2 double-ask WATCH-CLEAR (0/52; third clean panel). PARTNERBLOCK VARIED (4/4 distinct — watch closes). FAVORBLOCK REPETITIVE-thin (total=4, distinct=3, maxRepeat=2 — `favorblock-nextto` ×2). Census 2/4 survived to day 101, 1/8 global, standing blood-only on one survivor. GOALS-FAULT knowledge track (tops 1, lined 0, capture 0). Moot pile 24–36/seed. Telemetry QUIET vs the Nov 9 baseline; baseline NOT rolled (re-seed needs an 8-seed panel with per-seed means — THIS run).
- **r189 (deepening, landed 2026-11-14):** re-ask orphans all FROMSEED (0 true-no-thread); double-ask 0/79; PARTNERBLOCK repetitive (3 patterns, max 4); census 5/8 survived; telemetry LOUD on w3fights −76% — adjudicated EXPLAINED (baseline staleness + pacing variance).
- **r197 (scale, landed 2026-11-14):** national 0/4, wave-5 door open (2/4 seeds, 5 kills), tribute delivered 1/1 — the scale leg's wall is seasoned links, not the wave-5 door.
- **Carried (not this run's to build):** GOALS-FAULT knowledge track (one-brain program); the `moot` knowledge pile; Baraka unvoiced raise; daily-play chooser never takes invites (lane decision owed); nod loop 3×–4× (third band running); ask_favor goal-thread non-voicing; post-delivery phantom persistence; measurement-proof refresh round 15 (owed after the next manifest change); reaper-lock self-contention fix (Steve-approved 2026-11-12 — needs the build, not this run); held tree `journey-scale-attr` (heartbeat 2026-11-10 06:08Z, 4+ days stale — real work, the unlanded revert of live sim-wideduty-a medic-duty code — not released, not touched; flagged again).
- **Combat-play gate (Steve 2026-10-10):** no toughness/gear/ability tuning until the fight-play census lands. This run touches conversation/knowledge-instrument code only if Q1/Q2 confirm a single clear defect. The gate does not bind it.

## Q1 (PRIMARY) — FAVORBLOCK WATCH ON AN 8-SEED PANEL

**The question.** Is the FAVORBLOCK repetition r191 saw (thin: total=4, maxRepeat=2 on 4 seeds) a real defect or panel noise? Instrument: r191 driver clone (favor trace retained) + r191 analyzer clone with the FAVORBLOCK panel verdict (total / distinct / maxRepeat / patternCounts). Seeds 100075–100082, DAYCAP=100, CONVO_DAYS [45, 60, 80].

**Pre-registered decision (uses the instrument's own verdict — Amendment A2 share bar, NOT a new bar):** the analyzer calls the panel REPETITIVE if distinct < 3 OR maxRepeat/total ≥ 0.5; VARIED otherwise; THIN-PROBE if total < 3. r191's flag was REPETITIVE at total=4, distinct=3, maxRepeat=2 (share 2/4 = 0.5).
- If the analyzer verdict is **VARIED** → **WATCH-CLEAR** — the r191 flag was panel noise at this firing rate; the watch closes.
- If **REPETITIVE** → read the detail rows in full. If one pattern is ≥50% of firings AND those sittings share one trigger path (same sitting shape / same door geometry): verdict **DEFECT** — name the path; if a single clear fix exists, build it + proof test + before/after re-run in this run; else carry the diagnosis with transcript + code evidence, no game change. If REPETITIVE comes from distinct < 3 with an even spread (a content-variety question, not a trigger defect): verdict **WATCH-CONTINUES** — report counts, carry, no fix.
- If **THIN-PROBE** (total < 3) → carry, no verdict.
- No re-scoring: the verdict reads straight off the analyzer's panel line.

## Q2 (SECONDARY) — KNOWLEDGE TRACK: GOALS-FAULT + MOOT PILE ON 8 SEEDS

**The question.** Does the knowledge goal track stay faulted on a bigger panel, and how big is the moot pile? Instrument: the analyzer's Q2-GOALJOIN per-track pooled verdicts + K-CONTEXT (knowMoot per seed, lessonsOk, knowExperiment, knowTraderDeep).

**Pre-registered decision:**
- Knowledge track: if pooled GOALS-FAULT with tops ≥4, diagnose from goalSnaps (which top, why never lined — read the goalSnap rows) and carry the diagnosis to the one-brain program with the numbers — NO build this run (one-brain owns the goal machinery). If HEALTHY or NO-DATA, report and move on.
- Moot pile: report per-seed knowMoot range + median. If any seed's knowMoot > 40, read what went moot (which kinds — plants? skills? places?) from the seed JSON and name the dominant kind in the run note. No fix this run — the moot pile is a standing observation until a run owns it.

## Q3 (census)

Plain-words village assessment per seed; waves 2–3 reached, knowledge economy (counters taught, places learned, meat tested/cooked), regional links; books close on all seeds; unattributed 0.

## Q4 (people check)

Full transcripts read: every FAVORBLOCK repeat sitting (Q1), plus a sample of secret/grief sittings across the panel. SENSE-TESTING LAW: wants, consequences, specific memories — no filler loops, no fabricated shared history.

## Q5 (carried, read-only)

LADDER (opens/mints/holds), SECRET-PROBE funnel, GUARDLINES on the r134 6-line pool, FAVOUR-BLOCK / PARTNER-BLOCK / AWAY re-verify under the r130 rotation, PLACEPROBE, REQUESTS, B-SIT / B-FOLLOW / P-KEEP / RE-ASK / FIZZLE / MENU-FLIP / LANGGATE / LANGARC / REPLAY / D-THING / RAJ-PHOTO, GOALJOIN, TRUST, double-ask watch. PANEL VERDICTS read as before.

## Telemetry + baseline re-seed (the r189/r191 proposal — THIS run)

`telemetry-check.js` vs the deepening baseline (4-seed sums, r120 Nov 9) on seeds 100075–100082, metrics `w3fights,engaged.w3,fightsTotal,fightsByWave.3`.
- **n-mismatch, pre-registered:** the baseline is 4-seed SUMS; this panel is 8 seeds. The tool sums the current files, so raw-sums comparison will read ~2× by construction. A LOUD line on raw sums is therefore NOT binding — compare per-seed MEANS by hand (panel sum / 8 vs baseline sum / 4) alongside the tool output and record both.
- **Re-seed:** roll the baseline forward with `--update-baseline` from this 8-seed panel, then hand-correct the preserved `_meta` (old `_meta` says n=4, panel r120 — the tool preserves it verbatim) to n=8, panel r192 seeds 100075–100082, note "Sums across an 8-seed panel; compare only against same-n panels". Record the per-seed means in the run note. If any LOUD line survives the means comparison (a real deviation, not the n-mismatch), investigate BEFORE rolling forward — do not roll a real deviation into the baseline.

## Shape

prereg (committed BEFORE any judged sim) → instrument clone (driver + analyzer + proof test, proof green before the panel) → 8-seed panel (single-seed processes, 2 waves of 4) → analyzer verdicts (fresh panel + full-transcript reads of FAVORBLOCK repeats) → run note → telemetry check + re-seed → gate → merge. Heartbeat loop: `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/journey-deepening-hbloop-r192.sh`, 10-min cadence.

## Metric review (to fill at closeout)

- Q1: FAVORBLOCK panel line (total/distinct/maxRepeat/patternCounts) + verdict (DEFECT / WATCH-CLEAR / WATCH-CONTINUES) + fix built or carried.
- Q2: knowledge-track pooled verdict + tops; knowMoot range/median; moot-kind diagnosis if >40.
- Whether the 8-seed panel was enough for the Q1/Q2 verdicts, and whether the telemetry LOUD lines (if any) were the n-mismatch or real.
- Whether the flap or the registry-lock queue delayed any step, and whether the rotation 2→3 write stuck (read-back).
