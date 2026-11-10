# sim-scholardrain-b — prereg: quantify the scholar drain on veteran-days (DIAG ONLY, zero src/js)

- Arm: sim-scholardrain-b (Loop B, DIAG arm, run fleshout-loop-b-20261110T1248Z, axis scale-onramp / winnability chain)
- Branch: sim-scholardrain-b; base anchor `7c2591d1f` (worktree `~/workspace/worktrees/sim-scholardrain-b`, `git status --short` empty at prereg time)
- Base verification (step 1, before any scored seed): `git merge-base --is-ancestor 203a32775 HEAD` PASSES (Loop A wave5kill-a, blooded damage/survivability lever for wave-5 kills); `git merge-base --is-ancestor 5db4f6fef HEAD` PASSES (Loop A answermail-a, link seasoning); `git merge-base --is-ancestor 75f376185 HEAD` PASSES (capstoneready-b driver revision: scholarId per daily row + kill-time veteran sampling). All three landings are in this base. Recorded anchor SHA: `7c2591d1f5064ba5f0b9e78c78c2743c59cb197f`.
- Grounding / baseline: the 1142Z re-measure (evidence/2026-11-10/sim-capstoneready-remeasure-b.md, seeds 140201–140208) and its band 2 (evidence/2026-11-10/sim-capstoneready-remeasure2-b.md, seeds 140209–140216) are the measurement this arm quantifies. Their observations, to be quantified here, not re-argued: 15 of 21 wave-4 kills on band 1 were made by the scholar at kill time (never count toward the tribute); both ready windows closed when the pair's members took the scholar's seat; Valeria Quispe killed FOUR wave-4 beasts d90–112 on 140210 and the tribute counter never moved — all four kills were the scholar's; the seat changed hands 14 times in 142 days on that seed. Pooled 16 seeds: tribute ever-ready 2/16, kills 34, median survival 121.5d.
- Canon: NO separate canon doc covers the Standing ladder. The spec is src/js/ladder.js (comments + rules block) and src/data/ladder-capstones.json (`_doc` field) — the 2026-11-07 victory-gating redesign (Steve: "Yes build it and test it"). The rule being measured: `_ladderLivingVeterans(4)` counts living roster members with a wave-4+ kill in `state.waveKillLog`, and the scholar is NEVER counted (`vid === this.villagerId` → false). The scholar's seat passes on scholar death (succession); the killer list is the KILL LOG, never the counter (backlog #2077: log and counter disagree; the log is the right source — a pyrrhic kill writes the log but never increments waveKills; a same-day repeat is deduped by the log while the counter still increments).
- Purpose: DIAG ONLY. Quantify the drain — how many living-veteran-days the tribute loses to succession (killer alive but holding the scholar's seat) versus to death — to inform the design question (succession vs scholar exemption vs killer protection) WITHOUT deciding it. No fix is built here; no shape is chosen here.

## Instrument

- Driver: scripts/scholardrain-b-driver.js (new), reusing scripts/capstoneready-b-driver.js patterns (`snapshotLadder`, `wrapKillRecorder` — imported, not copied): scholarId per daily row, kill-time veteran sampling via `recordWaveKill`/`recordPyrrhicKill` wrappers, same competent `daily()` wrap. Additions, all pure reads: (a) per-day `killerFates` — for every distinct wave-4+ killer in `state.waveKillLog` so far (INCLUDING scholar kills, which the daily `veterans` list excludes): `{vid, name, kills, firstKillDay, lastKillDay, alive, isScholar}` via the data-array alive lookup and `vid === Game.villagerId`; (b) `scholarChanges` — scholarId transitions between consecutive daily rows `{day, from, fromName, fromAlive, to, toName}` (initial scholar recorded with `from: null`); (c) the full capstoneready daily row is kept (deeds, ladder, scaleRank, livingVeterans) so ready windows and wall numbers come from the same corpus. Proof: scripts/test-scholardrain-b.js (must pass ALL legs before any scored seed). Analyzer: scripts/scholardrain-b-analyze.js (pure functions over the corpus; CLI prints the per-seed table + pooled numbers). Zero src/js changes.

## Primary metric (binds the run)

- **Living-veteran-days lost to succession vs lost to death, named per seed on 8/8 seeds (GO needed: both numbers named on 8/8).**
- Definitions (fixed before any scored seed):
  - Killer set per seed: distinct `by` values in the kill-time samples with `w >= 4` (the KILL LOG via the wrapper). Any killer appearing only in a daily `veterans` list and not in the samples is reported as a discrepancy, not silently added.
  - Veteran window per killer: recorded daily rows with `day` from the killer's `firstKillDay` through the last recorded daily row day, inclusive. ONLY recorded rows count — unrecorded days are never invented (~97% daily coverage per the baseline).
  - Each recorded day in the window classifies from that day's `killerFates` entry: **counted** (alive && !isScholar — the day contributes to the tribute), **lost-to-succession** (alive && isScholar — the killer lives but holds the seat), **lost-to-death** (!alive — the killer is dead). A killer who kills and dies the same day counts that day as lost-to-death (they were never a living veteran on any recorded day); a killer who was scholar at kill time counts succession-lost days from day one of the window.
  - Per-seed totals: `countedDays`, `successionDays`, `deathDays`. **Named** = the per-seed table carries both `successionDays` and `deathDays` as computed integers. A seed with zero wave-4+ killers carries 0/0 and is flagged `no-killers` so a zero row reads as "no killers", not "no drain".
- **GO iff both numbers are named on 8/8 seeds.** Reported alongside (not re-scored): pooled succession:death ratio, succession share of all lost veteran-days (`successionDays / (successionDays + deathDays)`), and counted share of all veteran-days.
- The old pooled-share / per-deed-blocker metrics are NOT the judge here: this arm measures the drain inside the tribute deed only.

## Secondaries (reported, not judged)

1. **Kills made as scholar (uncounted toward tribute):** kill-time samples with `w >= 4` and `by === scholarIdAtKill` — count + share of all wave-4+ kills, per seed and pooled.
2. **Time from kill to scholar seat per killer:** firstKillDay → first recorded day at/after the kill where `isScholar` (0 if scholar at kill time; null/never if the killer never holds the seat). Report median + the per-killer list with names and days.
3. **Ready windows closed by succession vs death:** each maximal run of recorded days with `military_tribute.ready === true`; a window that ends on a following unready row is **closed** — classify by which counted veteran(s) left between the last ready day and the first unready day (succession: alive && scholar on the first unready day; death: dead on the first unready day). A window still ready on the last recorded row is **censored** (open at end), not closed. Count closed-by-succession vs closed-by-death.
4. **Peak living veterans:** max daily `livingVeterans` + kill-time peak (w>=4 samples).
5. **Scholar turnover:** succession events per seed; how many successions promoted a wave-4+ killer (incoming scholar had a wave-4+ kill already) vs a non-killer.

## Horizon + why

- **150 days, death-aware** (`runDays` stops at `Game.over`; dead villages stop simulating). Same as the three capstone censuses: the tribute's ready windows opened at d90 and d135 on band 1 — the drain needs room past d90 for veteran banking, without paying for a fixed 200d tail on villages that die early.

## Seeds

- **Band: 140217–140224 (8 seeds), FRESH.** Verification (this run, before any scored seed): per seed, `rg -l <seed> evidence/ --glob '*.md'` = 0 hits, `find evidence -name '*<seed>*'` = 0 files, `rg -l <seed> scripts/` = 0 hits, `rg -l <seed> ~/memory/` = 0 hits — all 0 for every seed 140217–140224. (A bare-regex sweep over evidence JSON hit only hash/number fragments inside old corpus files, not these seeds; the per-seed checks above are the binding ones, per the seed-band-freshness skill.) Used bands NOT reused: 140101–140108 (1030Z baseline), 140201–140208 (band 1), 140209–140216 (band 2), 99641–99648, 99591–99598, 99101–99108, 110001–110016, 120101–120116, 53011–53018, 73671–73678.

## Policies

- Plain competent (`scripts/policies/competent.js`, no env arms) — the skill-ceiling seed, same base the scale-wall panels use. The recorder wraps `daily()` only plus the kill-log choke points; it performs no game actions, consumes no RNG, and writes no game state (neutrality proven in scripts/test-scholardrain-b.js, including neutrality vs the capstoneready recorder: identical trajectories and identical kill-time samples on the same seed).

## Verdict rule

- DIAG-GO = primary metric met (both drain numbers named on 8/8 seeds). A miss is DIAG-NO-GO, never re-scored against a friendlier metric mid-run. This is a measurement, not a lever: DIAG-GO means the drain is quantified solidly enough to aim the design question at real numbers; it does not claim any deed is reachable and it does not choose between succession, scholar exemption, or killer protection. Movement vs the 16-seed pooled baseline (tribute 2/16, kills 34, scholar-kill share 15/21 on band 1) is reported as the measurement result either way.

## Metric review

- (To be filled after the run, in the evidence file. Prompt for the review: is "named on 8/8" too weak a bar when zero-kill seeds carry 0/0 — does the metric certify the quantification, or only that the table has two columns? If a seed has no killers, is its 0/0 informative or vacuous? Propose the revision for the next measurement run; do not re-score this run under it.)
