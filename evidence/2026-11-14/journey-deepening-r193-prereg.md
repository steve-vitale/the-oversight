# journey-deepening r193 — deepening leg (days 40–80), Lane A — PREREG

- **Run:** `playtest-loop-a-20261114T2045CST`, scheduled Sat 2026-11-14 20:45 CST (02:45 UTC; run started ~02:56 UTC — scheduler/queue delay ~11 min).
- **Run id:** `playtest-loop-a-20261115T0256Z`.
- **Leg:** 2 — deepening (DAYCAP 100, death-aware stop). Rotation read `2` at run start; advance 2→3 at closeout with read-back verification. (r192's closeout advance did not stick — the file still read `2` at this run's start; this run performs the advance.)
- **Base:** worktree branch `journey-deepening` at `0054751ad` (sim-holdbuild-b tip) at run start. Main tree `master` was `f1400295b` at reaper time and advanced to `a4d0b2038` (Loop B coordinator evidence, evidence-only) during registration — rebase onto then-current master before landing, per the body. `git pull` already up to date at run start. No push (ship loop owns pushes).
- **Branch:** `journey-deepening`, worktree `~/workspace/worktrees/journey-deepening` (registered 02:57–03:01Z; heartbeat stamped 03:01:13Z immediately after registration; 10-min heartbeat loop PID 36873).
- **Lock:** run_id `2026-11-15T02:57:08Z-playtest-loop-a`. No lock present at run start — no stale-lock recovery. **Delete at end, re-reading it first.**
- **Pre-flight:** main tree clean (0 files), disk 38%. Reap: SKIP — registry lock held by another reaper run (1 consecutive skip); no cleanup this run.
- **Policy:** competent. Seeds: fresh **100083–100090** (8-seed panel, no smoke — the 8 seeds ARE the panel). DAYCAP=100. CONVO_DAYS [45, 60, 80] (r192 driver clone).
- **Seed freshness (per the seed-band skill):** full search of `evidence/**/*.md` (all dated preregs) for `10008[3-9]` / `100090` = 0 hits. Forbidden/contaminated keyword hits in sim preregs are metric bans, not seed bands (sim-fallbackfeared-a forbids 74201–74208 — not this band). Two JSON hits in goal hidden_files are false positives: kcal floats (`100086.xxx` pantry values), not seeds. Rejected bands, all used or named: 100075–100082 (r192), 100070–100074 (r191), 100050–100069 (r189), 100001–100058 (r129/r130/r183/r184/r187/r188/r189 + smokes), 2501–2516 (r133/r134), 44001–44016 (r124), 45001–45016 (r125), 46001–46064 (enddaybeats), 47001–47040 (spandraw), 48001–48040 (mootgate), 49001–49040 (gorgeharness), 50001–50003 (journey-scale3), 51001–51008 (fightinterior), 52001–52008 (fightopen4), 53001–53008 (baseline9), 54001–61001 + 70001–77001 + 110001 (assorted sim arms).
- **Single-seed-per-process (r183 adoption):** every seed runs as its own `node` invocation (SEEDS=<single>), 2 waves of 4 parallel.

## Standing context (read before scoring)

- **r192 (deepening, landed 2026-11-14, commit 22a61e348):** Q1 FAVORBLOCK WATCH-CLEAR (9 firings, 9 sittings, VARIED 4/9 = 0.44 < 0.5). Double-ask 0/72 — fourth clean panel. PARTNERBLOCK REPETITIVE-thin (total=4, distinct=3, maxRepeat=2, share 0.5) — carried as a watch. RE-ASK-ORPHAN 3, all FROMSEED. Knowledge track HEALTHY-thin (tops=1, lined=0, capture=1); bank_veterans GOALS-FAULT thin (1 top, never lined). **Moot correction:** knowMoot is narration-frequency (substring hits, overlapping markers), NOT a pile — r192's "moot pile" reading was a misread. Metric-review proposal for the next run: rename the field (mootMentions) or count moot EVENTS (distinct days) instead — **THIS run implements the events count.** Census 5/8 survived to day 100–101, 7/8 regional, 7/8 wave 4. Telemetry baseline RE-SEEDED (8-seed sums 35/42/139/35, seeds 100075–100082). Gate 333/340, 7 failures all adjudicated load artifacts / pre-existing phone-frame receipt staleness.
- **r191 (deepening, landed 2026-11-14):** stage-0 guard fix landed; double-ask 0/52; PARTNERBLOCK VARIED (4/4 distinct); FAVORBLOCK REPETITIVE-thin (the flag r192 cleared).
- **Carried (not this run's to build):** GOALS-FAULT knowledge track + bank_veterans (one-brain program); Nora top-null (one-brain); held tree `journey-scale-attr` (heartbeat 2026-11-10 06:08Z, 5+ days stale — real work, the unlanded revert of live sim-wideduty-a medic-duty code — not released, not touched; flagged again); reaper-lock self-contention fix (Steve-approved, needs the build); phone-frame-proof receipt refresh (separate owed job); measurement-proof refresh round 15 (owed after the next manifest change).
- **Combat-play gate (Steve 2026-10-10):** no toughness/gear/ability tuning until the fight-play census lands. This run touches conversation/knowledge-instrument code only if Q1 confirms a single clear defect. The gate does not bind it.

## Q1 (PRIMARY) — PARTNERBLOCK WATCH ON AN 8-SEED PANEL

**The question.** Is the PARTNERBLOCK repetition r192 saw (thin: total=4, distinct=3, maxRepeat=2, share 0.5 on 8 seeds) a real defect or panel noise? Instrument: r192 driver clone (favor trace retained) + r192 analyzer clone with the PARTNERBLOCK panel verdict (total / distinct / maxRepeat / patternCounts). Seeds 100083–100090, DAYCAP=100, CONVO_DAYS [45, 60, 80].

**Pre-registered decision (uses the instrument's own verdict — Amendment A2 share bar, NOT a new bar):** the analyzer calls the panel REPETITIVE if distinct < 3 OR maxRepeat/total ≥ 0.5; VARIED otherwise; THIN-PROBE if total < 3. r192's flag was REPETITIVE at total=4, distinct=3, maxRepeat=2 (share 2/4 = 0.5).
- If the analyzer verdict is **VARIED** → **WATCH-CLEAR** — the r192 flag was panel noise at this firing rate; the watch closes.
- If **REPETITIVE** → read the detail rows in full. If one pattern is ≥50% of firings AND those sittings share one trigger path (same sitting shape / same door geometry): verdict **DEFECT** — name the path; if a single clear fix exists, build it + proof test + before/after re-run in this run; else carry the diagnosis with transcript + code evidence, no game change. If REPETITIVE comes from distinct < 3 with an even spread (a content-variety question, not a trigger defect): verdict **WATCH-CONTINUES** — report counts, carry, no fix.
- If **THIN-PROBE** (total < 3) → carry, no verdict.
- No re-scoring: the verdict reads straight off the analyzer's panel line.
- **FAVORBLOCK re-verify (same panel):** expect VARIED (r192 cleared it); if it flips REPETITIVE, read the detail rows and apply the same decision rule above.

## Q2 (SECONDARY) — KNOWLEDGE TRACK + MOOT-EVENTS METRIC CORRECTION

**The question.** (a) Does the knowledge goal track stay healthy-thin, and does bank_veterans recur? (b) Does the new moot-events count (distinct days with moot narration) behave sanely vs the old substring count? Instrument: the analyzer's Q2-GOALJOIN per-track pooled verdicts + K-CONTEXT (now `mootMentions` + `mootEvents`).

**Pre-registered decision:**
- Knowledge track: if pooled GOALS-FAULT with tops ≥4, diagnose from goalSnaps and carry the diagnosis to the one-brain program — NO build this run. If HEALTHY or NO-DATA, report and move on.
- Moot events: report per-seed mootEvents range + median alongside mootMentions. Sanity bar: mootEvents ≤ mootMentions on every seed, and mootEvents ≥ 1 on every seed that reaches day 40 (moots are a real, recurring gathering — zero events on a long-lived village would mean the instrument is blind, not that moots never happen). If the bar fails, the instrument is wrong — fix or drop the field, do not report the number as a finding.
- The old substring count is relabeled `mootMentions` in the K-CONTEXT line; the "moot pile" reading stays retired.

## Q3 (census)

Plain-words village assessment per seed; waves 2–3 reached, knowledge economy (counters taught, places learned, meat tested/cooked), regional links; books close on all seeds; unattributed 0.

## Q4 (people check)

Full transcripts read: every PARTNERBLOCK repeat sitting (Q1), plus a sample of secret/grief sittings across the panel. SENSE-TESTING LAW: wants, consequences, specific memories — no filler loops, no fabricated shared history.

## Q5 (carried, read-only)

LADDER (opens/mints/holds), SECRET-PROBE funnel, GUARDLINES on the r134 6-line pool, FAVORBLOCK / PARTNERBLOCK / AWAY re-verify under the r130 rotation, PLACEPROBE, REQUESTS, B-SIT / B-FOLLOW / P-KEEP / RE-ASK / FIZZLE / MENU-FLIP / LANGGATE / LANGARC / REPLAY / D-THING / RAJ-PHOTO, GOALJOIN, TRUST, double-ask watch. PANEL VERDICTS read as before.

## Telemetry

`telemetry-check.js` vs the deepening baseline (8-seed sums, r192, seeds 100075–100082) on seeds 100083–100090, metrics `w3fights,engaged.w3,fightsTotal,fightsByWave.3`. Same-n panel (8 vs 8), so raw-sums comparison IS binding this run — no n-mismatch excuse. Any LOUD line is a same-run investigation item before any baseline roll.

## Shape

prereg (committed BEFORE any judged sim) → instrument clone (driver + analyzer + proof test, proof green before the panel) → 8-seed panel (single-seed processes, 2 waves of 4) → analyzer verdicts (fresh panel + full-transcript reads of PARTNERBLOCK repeats) → run note → telemetry check → gate → rebase onto current master → merge. Heartbeat loop: 10-min cadence, PID 36873.

## Metric review (to fill at closeout)

- Q1: PARTNERBLOCK panel line (total/distinct/maxRepeat/patternCounts) + verdict (DEFECT / WATCH-CLEAR / WATCH-CONTINUES) + fix built or carried; FAVORBLOCK re-verify line.
- Q2: knowledge-track pooled verdict + tops; mootEvents vs mootMentions per seed; sanity bar result.
- Whether the 8-seed panel was enough for the Q1/Q2 verdicts, and whether any telemetry LOUD line was real.
- Whether the flap or the registry-lock queue delayed any step, and whether the rotation 2→3 write stuck (read-back).
