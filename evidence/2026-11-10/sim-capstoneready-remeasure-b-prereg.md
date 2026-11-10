# sim-capstoneready-remeasure-b — prereg: ladder capstone-deed readiness re-measure (DIAG ONLY, zero src/js)

- Arm: sim-capstoneready-remeasure-b (Loop B, DIAG arm, run fleshout-loop-b-20261110T1142Z, axis scale-onramp / winnability chain)
- Branch: sim-capstoneready-remeasure-b; base anchor `57547c8dd` (worktree `~/workspace/worktrees/sim-capstoneready-remeasure-b`, `git status --short` empty at prereg time)
- Base verification (step 1, before any scored seed): `git merge-base --is-ancestor 203a32775 HEAD` PASSES (Loop A wave5kill-a, blooded damage/survivability lever for wave-5 kills); `git merge-base --is-ancestor 5db4f6fef HEAD` PASSES (Loop A answermail-a, link seasoning — seasoned 13/15 armed vs 2/15 control on fresh seeds 120101-120116). Both landings are in this base. Recorded anchor SHA: `57547c8dd61a645f6c403599a21ee20ab634e05b`.
- Grounding / baseline: the 1030Z census (evidence/2026-11-10/sim-capstoneready-b.md + sim-capstoneready-b-prereg.md, base anchor `53185abea`, seeds 140101–140108) is the PRE-answermail / PRE-wave5kill baseline. Its result: 0/8 ever-ready on all three deeds, peak 1 living non-scholar wave-4 veteran, 0 sealed charters, 0 feast bundles, scale never national (peak regional on 8/8), median survival 87d, wave-5 unlocked 1/8. This run re-measures the SAME census on current master to see whether the two landed levers moved any deed's ingredients.
- Canon: NO separate canon doc covers the Standing ladder. The spec is src/js/ladder.js (comments + rules block) and src/data/ladder-capstones.json (`_doc` field), per the 2026-11-07 victory-gating redesign (Steve: "Yes build it and test it"). The three deeds:
  - military_tribute — 2 living NON-scholar wave-4 veterans (`ladderCapstoneReady('military_tribute')`, `_ladderLivingVeterans(4)`).
  - trade_charter — 1 sealed charter (active trade link, chartered=true) + scaleRank national/global.
  - feast_embassy — feast bundle done (feast-log bundle flag, leg 2's write) + ladderStage 3 (National).
- Instrument: scripts/capstoneready-b-driver.js + scripts/capstoneready-b-analyze.js, REVISED by this arm (see below); proof: scripts/test-capstoneready-b.js (must pass ALL legs before any scored seed). Zero src/js changes. The sibling arm reuses this instrument after this arm's commit.

## Instrument revision (per the baseline Metric review)

- (a) The daily row now records `scholarId` (the current scholar's villager id, `Game.villagerId`) so veteran-to-scholar promotion days are observed directly instead of inferred from death-tele `player` flags.
- (b) The driver wraps `Game.recordWaveKill` / `Game.recordPyrrhicKill` (the kill-log choke points; zero src/js) and samples `_ladderLivingVeterans(4)` immediately after each new waveKillLog entry lands, recording kill-time samples `{day, mid, by, w, via, livingVeteransAtKill, scholarIdAtKill}` at the per-seed top level. A sub-day overlap of 2 living veterans is no longer missed by the daily snapshot. The wrapper performs pure reads only (the sample is the same read `ladderCapstoneReady` uses); neutrality is re-proven by the proof test.
- (c) The analyzer prints the per-deed blocker (modal reason per deed over that deed's own blocked days) + per-deed ever-ready rates and judges the new primary metric. It stays backward-compatible with the old corpus format (rows without `scholarId` / kill-time fields still analyze; the pooled-share line is kept for comparison only).

## Primary metric (binds the run — REVISED per the baseline Metric review)

- **Per-deed binding blocker named on >=7/8 seeds PER DEED.** For each deed, its binding blocker is the modal reason code over THAT deed's own blocked days (days the deed was not ready); it is **named** for a seed when the modal reason's share of that deed's blocked days is >=50%. (A deed with zero blocked days on a seed — ready every recorded day — counts as named-vacuous for that deed on that seed; it has no blocker to name.) **GO iff all three deeds name their binding blocker on >=7/8 seeds.**
- Judged alongside (reported, not re-scored): per-deed ever-ready rates + ingredient peaks (peak living non-scholar wave-4 veterans incl. kill-time peak, ever sealed charters, ever feast-bundle, peak scaleRank) vs the baseline (0/8 ever-ready on all three deeds, peak 1 veteran, 0 charters, 0 bundles, scale never national).
- The old pooled-share metric (top reason's share of ALL blocked deed-days, bar 0.5) is printed for comparison only and is NOT the judge: the baseline proved it structurally unsatisfiable (1/3–1/3–1/3 tie by construction when all three deeds are blocked every day).

## Horizon + why

- **150 days, death-aware** (`runDays` stops at `Game.over`; dead villages stop simulating). Same as the baseline: r162's eligible seed first hit deedGateReady at d77 — the census needs room past that point for the National climb and veteran banking, without paying for a fixed 200d tail on villages that die early.

## Seeds

- **Band: 140201-140208 (8 seeds), FRESH.** Verification (this run, before any scored seed): per seed, `rg -l <seed> evidence/ --glob '*.md'` = 0 hits, `find evidence -name '*<seed>*'` = 0 files, `rg -l <seed> scripts/` = 0 hits, `rg -l <seed> ~/memory/` = 0 hits — in BOTH this worktree and the main tree at ~/workspace/the-scattering (evidence + scripts, same base anchor). Coordinator note: only bare-number false positives inside old corpus JSON were reported before this check; the re-verification above is per-seed over evidence preregs + scripts + ~/memory/ and found zero hits for every seed 140201–140208. Used bands NOT reused: 140101-140108 (the 1030Z baseline band), 99641-99648, 99591-99598, 99101-99108, 110001-110016, 120101-120116, 53011-53018, 73671-73678.

## Policies

- Plain competent (`scripts/policies/competent.js`, no env arms) — the skill-ceiling seed, same base the scale-wall panels use. The recorder wraps `daily()` only plus the kill-log choke points; it performs no game actions, consumes no RNG, and writes no game state (neutrality proven in scripts/test-capstoneready-b.js).

## Verdict rule

- GO = primary metric met (all three deeds name their per-deed binding blocker on >=7/8 seeds). A miss is NO-GO, never re-scored against a friendlier metric mid-run. This is a census, not a lever: GO means the decomposition is solid enough to aim the next build at the named blockers; it does not claim any deed is reachable. Movement vs the baseline (ever-ready rates, ingredient peaks) is reported as the re-measure result either way.

## Metric review

- **The revised metric works as designed; verdict GO.** Per-deed modal blockers named on 8/8 seeds for all three deeds (modal share 1.0 on every seed — one blocking reason per deed all run). The revision fixed the baseline's structural flaw. Caveat: with shares of 1.0 the naming bar is nearly tautological — the metric certifies the decomposition is complete, not that the game improved; the movement signal is the ever-ready rates + ingredient peaks (military 0/8 → 2/8, kills 10 → 21, peak veterans 1 → 2). Full review in evidence/2026-11-10/sim-capstoneready-remeasure-b.md.
