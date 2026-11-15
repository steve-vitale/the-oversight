# journey-deepening r212 — deepening leg (days 40–80), Lane A — PREREG

- **Run:** `playtest-loop-a-20261115T0245CST`, scheduled Sun 2026-11-15 02:45 CST (08:45 UTC; run started ~09:40 UTC — scheduler/queue delay ~55 min).
- **Run id:** `playtest-loop-a-20261115T0940Z`.
- **Leg:** 2 — deepening (DAYCAP 100, death-aware stop). Rotation read `2` at run start; advance 2→3 at closeout with read-back verification. (r192's and r193's closeout advances did not stick — the file still read `2` at this run's start; r211 left it at `2` with nothing played.)
- **Base:** local master `7251dcb4f` at run start (journey-establishment r210 landing addendum). `git pull` quirk: pull fails "no such ref was fetched" but `ls-remote` confirms origin/master `542c6ecc2` is an ancestor of HEAD (56 ahead, 0 behind) — nothing to pull, config quirk only. No push (ship loop owns pushes).
- **Branch:** `journey-deepening`, worktree `~/workspace/worktrees/journey-deepening` (registered 09:49–09:53Z; heartbeat stamped 09:53:07Z immediately after registration; 10-min heartbeat loop PID 47177).
- **Lock:** run_id `2026-11-15T09:40:36Z-playtest-loop-a`. No lock present at run start — no stale-lock recovery. **Delete at end, re-reading it first.**
- **Pre-flight:** main tree clean (0 files), disk 39%. Reap: SKIP — registry lock held by another reaper run (1 consecutive skip; fresh streak); no cleanup this run.
- **Write flap window #7:** active 08:52:28Z–09:48:43Z (~56 min; the longest window today, third on boot 7b3d2e31). This run waited per the flap skill (probe-first, no repeated writes) and cleared the stale O_EXCL lock files the flap left (`scratch-flap-probes/oexcl-probe.lock`, `nodeprobe-oexcl.lock`, both 0-byte from 08:52Z) after the 09:48:43Z all-OK probe + a successful `git update-ref` probe. The predecessor occurrence r211 (scheduled 01:45 CST) was flap-blocked with no play: registration failed on `refs/heads/journey-deepening.lock` EPERM at ~09:39Z; rotation left at 2, no worktree/branch/commit created.
- **Policy:** competent. Seeds: fresh **100091–100098** (8-seed panel, no smoke — the 8 seeds ARE the panel). DAYCAP=100. CONVO_DAYS [45, 60, 80] (r192 driver clone).
- **Seed freshness (per the seed-band skill):** full search of `evidence/**/*.md` preregs for `10009[1-8]` = 0 hits. Broader grep of `evidence/` + goal `hidden_files/evidence/` finds 16 JSON files, ALL false positives — kcal/float substrings, zero seed uses: `pantryFreshBefore 100097` / `pantryFreshAfter 100095` (crumbdefault Oct 16 census JSONs), `away_wild 1867.310009408233` (perseed-retagrot Oct 20), `freshKcal 100096` (perseed-retagrot-confirm Oct 20), `kcal 22109.398734100097` (storageshed Oct 23), `ate 1433.1000976800917` (fullpantry Oct 24), `nourishment 1343.1521191000938` / `1158.2344210009728` / `2607.382100093837` (panel-plentydepri Oct 22, medheadcount Nov 8). Rejected bands, all used or named: 100075–100082 (r192), 100083–100090 (r193), 100070–100074 (r191), 100050–100069 (r189), 100001–100058 (r129/r130/r183/r184/r187/r188/r189 + smokes), 2501–2516 (r133/r134), 44001–44016 (r124), 45001–45016 (r125), 46001–46064 (enddaybeats), 47001–47040 (spandraw), 48001–48040 (mootgate), 49001–49040 (gorgeharness), 50001–50003 (journey-scale3), 51001–51008 (fightinterior), 52001–52008 (fightopen4), 53001–53008 (baseline9), 54001–61001 + 70001–77001 + 110001 (assorted sim arms).
- **Single-seed-per-process (r183 adoption):** every seed runs as its own `node` invocation (SEEDS=<single>), 2 waves of 4 parallel.

## Standing context (read before scoring)

- **r193 (deepening, landed 2026-11-14, commits 77747122 + run note):** Q1 PARTNERBLOCK panel line total=4 distinct=3 maxRepeat=2 → REPETITIVE by the letter of the A2 share bar (2/4 = 0.5), but the 4 firings sit in 4 DIFFERENT sittings across 4 seeds/days/villagers — verdict WATCH-CLEAR, the share bar fires on any 2× wording at n=4. **Metric-review proposal (this run adopts it): total < 6 → THIN-PROBE regardless of share; REPETITIVE only at total ≥ 6 with share ≥ 0.5.** FAVORBLOCK re-verify VARIED (8/4/3). Double-ask 0/91 — fifth clean panel. RE-ASK-ORPHAN 7, all FROMSEED. Moot-events instrument works (events 3–41, median 7.5; 100088 outlier 41 events in 97 days, carried as observation). Knowledge track GOALS-FAULT-thin (tops=1, below the ≥4 diagnosis bar — report only). bank_veterans HEALTHY (3/0/1). Census 4/8 survived, 8/8 regional+wave 4, 3/8 wave 5. Telemetry QUIET vs r192 baseline (no roll). Gate 328/340, GO after adjudication (0 attributable).
- **r192 (deepening, landed 2026-11-14, commit 22a61e348):** Q1 FAVORBLOCK WATCH-CLEAR (9 firings, 9 sittings, VARIED 4/9 = 0.44). PARTNERBLOCK REPETITIVE-thin (total=4) — the flag r193 cleared. Double-ask 0/72. Knowledge track HEALTHY-thin (tops=1, capture=1). Moot correction: knowMoot is narration-frequency, NOT a pile. Census 5/8 survived, 7/8 regional, 7/8 wave 4. Telemetry baseline RE-SEEDED (8-seed sums 35/42/139/35, seeds 100075–100082). Gate 333/340, GO after adjudication.
- **r211 (deepening, flap-blocked, no play — this run's predecessor):** scheduled 01:45 CST, started 02:37 CST, closed ~03:40 CST blocked. Registration failed on the flap; prereg intent inherited here (not yet written there): Q1 adopt the r193 A2 floor + fresh 8-seed panel; Q2 carried-wrinkle sweep. Seed band 100091–100098 verified fresh (this prereg re-verifies it with full context — see above).
- **Carried (not this run's to build):** GOALS-FAULT knowledge track + Nora top-null (one-brain program); moot-frequency spread 3–41 events (observation); held tree `journey-scale-attr` (heartbeat 2026-11-10 06:08Z, 5+ days stale — real work, the unlanded revert of live sim-wideduty-a medic-duty code — not released, not touched; flagged again); reaper-lock self-contention fix (Steve-approved, needs the build); phone-frame-proof receipt refresh (separate owed job); measurement-proof refresh round 21 (owed after the next manifest change).
- **Combat-play gate (Steve 2026-10-10):** no toughness/gear/ability tuning until the fight-play census lands. This run touches conversation/knowledge-instrument code only if Q1 confirms a single clear defect. The gate does not bind it.

## Q1 (PRIMARY) — A2 FLOOR ADOPTION + FRESH 8-SEED PANEL

**The question.** (a) Does the adopted floor (total < 6 → THIN-PROBE) behave as designed on synthetic inputs — thin panels read THIN-PROBE, real repetition at total ≥ 6 still reads REPETITIVE? (b) On a fresh 8-seed panel, what do the FAVORBLOCK and PARTNERBLOCK panel lines read under the NEW bar?

**Instrument change (this run's build, committed BEFORE any judged sim):** clone the r193 analyzer → r212 with ONLY the floor change in `summarizeFavorBlock` and `summarizePartnerBlock` (`if (total < 3)` → `if (total < 6)`), the header verdict docs updated to match, and the r193 analyzer proof cloned → r212 with 4 new checks:
- (11) favorblock synthetic panel total=4, distinct=3, maxRepeat=2 (the r193 shape) → THIN-PROBE under the new floor (was REPETITIVE).
- (12) favorblock synthetic panel total=6, distinct=3, maxRepeat=3 (share 0.5) → REPETITIVE still fires at total ≥ 6.
- (13) partnerblock synthetic panel total=4, distinct=3, maxRepeat=2 → THIN-PROBE.
- (14) partnerblock synthetic panel total=6, distinct=3, maxRepeat=3 → REPETITIVE.
The AWAY summarizer is OUT of scope (its verdicts are maxRepeat-based, a different shape — the r193 proposal names only the two block summarizers). Driver cloned r193 → r212 with ONLY the seed band, run tag, and EVIDIR date. Proof must be green (14/14) before the panel runs.

**Pre-registered decision (reads straight off the analyzer's panel lines under the NEW bar — no re-scoring):**
- If a panel line reads **THIN-PROBE** (total < 6) → the watch CONTINUES unjudged on that block this run — carry, no verdict, no fix. (The floor doing its job is itself the Q1(a) result.)
- If **VARIED** (total ≥ 6, distinct ≥ 3, share < 0.5) → **WATCH-CLEAR** for that block — the earlier flags were panel noise at this firing rate; the watch closes.
- If **REPETITIVE** (total ≥ 6, distinct < 3 or share ≥ 0.5) → read the detail rows in full. If one pattern is ≥50% of firings AND those sittings share one trigger path (same sitting shape / same door geometry): verdict **DEFECT** — name the path; if a single clear fix exists, build it + proof test + before/after re-run in this run; else carry the diagnosis with transcript + code evidence, no game change. If REPETITIVE comes from distinct < 3 with an even spread (a content-variety question, not a trigger defect): verdict **WATCH-CONTINUES** — report counts, carry, no fix.
- FAVORBLOCK and PARTNERBLOCK are judged independently under the same rule.

## Q2 (SECONDARY) — CARRIED-WRINKLE SWEEP

**The question.** Do the six carried wrinkles from r193/r210 recur on this fresh panel, in the same shape?

1. **Water-haul favor template** repeats near-verbatim across villagers (r193: Booker/Tom — "The cistern's nearly dry" / "Water's almost gone", same "Dawn, then" close).
2. **Teach-loop same-pick** repetition in one sitting (r193: Nora 4× "Watch. This matters." across four plants).
3. **`betrayal:accept` label** on a benign walk (r193: Nora's walk to the tree line filed under a betrayal branch name).
4. **Meat-dinner step** not firing on a surviving village (r193: 100087 — 22 kills, 2 tested, 2 revealed, 0 dinners in 102 days).
5. **"(ended by engine)" closes** — sittings ending with no closing line (r210: Miguel's sitting).
6. **Recap paraphrase "that's still where we are"** — now 2 in a row (r138 1, r139 1, r210 2); the r193 A2 floor question applies in spirit: count recurrences before treating it as a pattern.

**Pre-registered decision:** count each wrinkle on the panel (seeds/sittings/shapes). A wrinkle counts as CONFIRMED only if it recurs on ≥2 seeds/sittings with the same shape; a single-seed occurrence stays an observation. The sweep is diagnostic: no game change unless a CONFIRMED wrinkle is a single clear defect with a proof test — otherwise carry the counts with transcript evidence. (Wrinkle 6's floor: fewer than 3 total recurrences across the panel → THIN-PROBE, carry without a verdict.)

## Q3 (census)

Plain-words village assessment per seed; waves 2–3 reached, knowledge economy (counters taught, places learned, meat tested/cooked), regional links; books close on all seeds; unattributed 0.

## Q4 (people check)

Full transcripts read: every block-repeat sitting (Q1), plus a sample of secret/grief sittings across the panel. SENSE-TESTING LAW: wants, consequences, specific memories — no filler loops, no fabricated shared history.

## Q5 (carried, read-only)

LADDER (opens/mints/holds), SECRET-PROBE funnel, GUARDLINES on the r134 6-line pool, FAVORBLOCK / PARTNERBLOCK / AWAY re-verify under the r130 rotation, PLACEPROBE, REQUESTS, B-SIT / B-FOLLOW / P-KEEP / RE-ASK / FIZZLE / MENU-FLIP / LANGGATE / LANGARC / REPLAY / D-THING / RAJ-PHOTO, GOALJOIN, TRUST, double-ask watch. PANEL VERDICTS read as before.

## Telemetry

`telemetry-check.js` vs the deepening baseline (8-seed sums, r192, seeds 100075–100082) on seeds 100091–100098, metrics `w3fights,engaged.w3,fightsTotal,fightsByWave.3`. Same-n panel (8 vs 8), so raw-sums comparison IS binding this run — no n-mismatch excuse. Any LOUD line is a same-run investigation item before any baseline roll.

## Shape

prereg (committed BEFORE any judged sim) → instrument clone (driver + analyzer + proof test, proof green before the panel) → 8-seed panel (single-seed processes, 2 waves of 4) → analyzer verdicts (fresh panel + full-transcript reads of block repeats + wrinkle sweep) → run note → telemetry check → gate → rebase onto current master → merge. Heartbeat loop: 10-min cadence, PID 47177.

## Metric review (to fill at closeout)

- Q1: floor proof result (14/14?) + both panel lines under the new bar + verdicts (THIN-PROBE-carry / WATCH-CLEAR / DEFECT / WATCH-CONTINUES).
- Q2: per-wrinkle counts (seeds/sittings/shapes) + CONFIRMED vs observation + any fix built or carried.
- Whether the 8-seed panel was enough for the Q1/Q2 verdicts, and whether any telemetry LOUD line was real.
- Whether the flap or the registry-lock queue delayed any step, and whether the rotation 2→3 write stuck (read-back).
