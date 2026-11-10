# sim-capstoneready-remeasure2-b — prereg: ladder capstone-deed readiness re-measure, band 2 (DIAG ONLY, zero src/js)

- Arm: sim-capstoneready-remeasure2-b (Loop B, DIAG arm, run fleshout-loop-b-20261110T1142Z, axis scale-onramp / winnability chain)
- Branch: sim-capstoneready-remeasure2-b; base anchor `57547c8dd` (worktree `~/workspace/worktrees/sim-capstoneready-remeasure2-b`, `git status --short` empty at prereg time)
- Base verification (before any scored seed): `git merge-base --is-ancestor 203a32775 HEAD` PASS (wave5kill-a in base); `git merge-base --is-ancestor 5db4f6fef HEAD` PASS (answermail-a tip in base). Both levers whose effect this re-measure tests are therefore IN the base, unlike the 1030Z baseline which was pre-answermail / pre-wave5kill.
- Grounding: evidence/2026-11-10/sim-capstoneready-b.md (1030Z baseline census, 8 seeds 140101–140108): 0/8 ever-ready on all three deeds; peak 1 living veteran; 0 sealed charters; 0 feast bundles; scale never national; median survival 87d. Its Metric review: the pooled-share primary metric was structurally unsatisfiable (1/3–1/3–1/3 tie by construction when all three deeds are blocked every day). THIS run uses the per-deed revision. Pooled with the sibling arm sim-capstoneready-remeasure-b (band 1, seeds 140201–140208) to 16 seeds.
- Canon: NO separate canon doc covers the Standing ladder. The spec is src/js/ladder.js (comments + rules block) and src/data/ladder-capstones.json (`_doc` field), per the 2026-11-07 victory-gating redesign (Steve: "Yes build it and test it"). The three deeds:
  - military_tribute — 2 living NON-scholar wave-4 veterans (`ladderCapstoneReady('military_tribute')`, `_ladderLivingVeterans(4)`).
  - trade_charter — 1 sealed charter (active trade link, chartered=true) + scaleRank national/global.
  - feast_embassy — feast bundle done (feast-log bundle flag, leg 2's write) + ladderStage 3 (National).
- Instrument: scripts/capstoneready-b-driver.js (current instrument on master at prereg time; the sibling arm owns the instrument revision — scholarId per row, veteran count sampled at kill time, per-deed blocker metric — and I DO NOT TOUCH scripts/capstoneready-b-driver.js, scripts/capstoneready-b-analyze.js, or scripts/test-capstoneready-b.js). My band runs with the current instrument; my verdict is computed with the REVISED analyzer after it lands (rebase onto the coordinator-named commit SHA, re-run the revised proof test green, then run the revised analyzer over my corpus with PERSEED_DIR env).

## Primary metric (binds the run — the sibling arm's per-deed revision)

- **Per-deed binding blocker named on >=7/8 seeds PER DEED.** For each deed separately, over that deed's own blocked days (days where the deed was not ready), the deed's **binding blocker** is the reason code with the largest share of that deed's blocked days. A seed **names** the deed's blocker when the modal reason's share is >=50% of that deed's blocked days. GO iff, for EACH of the three deeds, >=7/8 seeds name that deed's binding blocker.
- Judged alongside (reported, not a second GO gate, but the decision-useful comparison): per-deed ever-ready rates + ingredient peaks vs the 1030Z baseline (0/8 ever-ready on all three deeds, peak 1 living veteran, 0 charters, 0 bundles, scale never national). A GO with ever-ready rates still 0/8 would mean the decomposition is solid but the levers have not moved readiness — say so plainly, do not re-score.
- Reason codes as recorded by the driver: `ready`, `veterans-short`, `no-sealed-charter`, `scale-short`, `no-bundle-feast`, `stage-short`, `delivered`, `read-error`, `unknown-capstone`.

## Horizon + why

- **150 days, death-aware** (`runDays` stops at `Game.over`; dead villages stop simulating). Same horizon as the 1030Z baseline so the two bands compare like-for-like: r162's eligible seed first hit deedGateReady at d77, so 150d gives room past that point for the National climb and veteran banking without paying for a fixed 200d tail on villages that die early.

## Seeds

- **Band: 140209-140216 (8 seeds), FRESH.** Verification (this run, before any scored seed): per seed, `rg -l <seed> evidence/ --glob '*.md'` = 0 hits, `find evidence -name '*<seed>*'` = 0 files, `rg -l <seed> scripts/` = 0 hits — in this worktree; `rg -l <seed> ~/workspace/the-scattering/evidence/ --glob '*.md'` = 0 hits in the main tree; `rg -l "14021[0-6]|140209" ~/memory/` = 0 hits. (Coordinator note: only bare-number false positives inside old corpus JSON were found previously; the rg checks above over evidence preregs + scripts + ~/memory/ found none for these seeds.) Used bands NOT reused: 140101-140108 (1030Z baseline), 99641-99648, 99591-99598, 99101-99108, 110001-110016, 120101-120116, 53011-53018, 73671-73678, 140201-140208 (sibling band 1).

## Policies

- Plain competent (`scripts/policies/competent.js`, no env arms) — the skill-ceiling seed, same base the scale-wall panels use. The recorder wraps `daily()` only; it performs no game actions, consumes no RNG, and writes no game state (neutrality proven in scripts/test-capstoneready-b.js).

## Verdict rule

- GO = primary metric met (>=7/8 seeds name a binding blocker for EACH deed). A miss is NO-GO, never re-scored against a friendlier metric mid-run. This is a census, not a lever: GO means the per-deed decomposition is solid enough to aim the next build at the named blockers; it does not claim any deed is reachable. The before/after vs the 1030Z baseline (ever-ready rates, ingredient peaks) is reported alongside and is the winnability-chain signal for answermail + wave5kill.

## Metric review

- (Filled at verdict time. If the metric proves wrong — e.g. the per-deed modal bar still ties, or ever-ready rates turn out to be the more decision-useful number — write it here and propose the revision for the NEXT run.)
