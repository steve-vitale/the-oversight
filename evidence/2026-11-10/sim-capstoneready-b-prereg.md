# sim-capstoneready-b — prereg: ladder capstone-deed readiness census (DIAG ONLY, zero src/js)

- Arm: sim-capstoneready-b (Loop B, DIAG arm, run fleshout-loop-b-20261110T1030Z, axis scale-onramp / winnability chain)
- Branch: sim-capstoneready-b; base anchor `53185abea` (worktree `~/workspace/worktrees/sim-capstoneready-b`, `git status --short` empty at prereg time)
- Grounding: journey-endgame r162 (evidence/2026-11-09/journey-endgame-r162.md, pass B): 1 eligible seed (89704, deedGateFirstOk d77), 0 delivered, 14 none-ready attempts, refused-despite-ready 0, pricedFull 0/1. "On these seeds the capstone deeds are the wall." This run decomposes readiness on current master BEFORE Loop A's in-flight answermail (link seasoning) and wave5kill (veteran supply) land — this is the pre-answermail / pre-wave5kill baseline; do not treat later movement as this run's verdict.
- Canon: NO separate canon doc covers the Standing ladder. The spec is src/js/ladder.js (comments + rules block) and src/data/ladder-capstones.json (`_doc` field), per the 2026-11-07 victory-gating redesign (Steve: "Yes build it and test it"). The three deeds:
  - military_tribute — 2 living NON-scholar wave-4 veterans (`ladderCapstoneReady('military_tribute')`, `_ladderLivingVeterans(4)`).
  - trade_charter — 1 sealed charter (active trade link, chartered=true) + scaleRank national/global.
  - feast_embassy — feast bundle done (feast-log bundle flag, leg 2's write) + ladderStage 3 (National).
- Instrument: scripts/capstoneready-b-driver.js — a daily recorder (pure reads only: `villageLadder()`, `ladderCapstoneReady(kind)` x3, `scaleRank()`, `ladderCapstoneDelivered()`, waveKillLog + roster reads) wrapped around the plain competent policy's `daily()` hook. Zero src/js changes. Proof: scripts/test-capstoneready-b.js (determinism, classification, neutrality legs).

## Primary metric (binds the run)

- **Per-seed binding blocker named on >=7/8 seeds.** For each seed-day and each deed, the recorder stores the deed's readiness reason code (`ready`, `veterans-short`, `no-sealed-charter`, `scale-short`, `no-bundle-feast`, `stage-short`, `delivered`, `read-error`, `unknown-capstone`). A seed's **binding blocker** is the reason code with the largest share of that seed's blocked deed-days (deed-days where the deed was not ready; a day contributes up to 3 blocked deed-days, one per deed). The blocker is **named** for that seed when its share is >=50% of the seed's blocked deed-days. GO iff >=7/8 seeds name a binding blocker.
- Reported (not judged): per-deed ever-ready rates (seeds where the deed was ever ready / 8), first-ready day per deed per seed, peak living non-scholar wave-4 veterans (distribution), peak ladder stage (distribution), ever chartered trade links, ever feast-bundle flag, peak scaleRank, and the scale-wall numbers (national / table / wins, wave 4-5 unlocks, median survival).

## Horizon + why

- **150 days, death-aware** (`runDays` stops at `Game.over`; dead villages stop simulating). 150d because r162's eligible seed first hit deedGateReady at d77 — the census needs room past that point for the National climb and veteran banking, without paying for a fixed 200d tail on villages that die early.

## Seeds

- **Band: 140101-140108 (8 seeds), FRESH.** Verification (this run, before any scored seed): per seed, `rg -l <seed> evidence/ --glob '*.md'` = 0 hits, `find evidence -name '*<seed>*'` = 0 files, `rg -l <seed> scripts/` = 0 hits — in BOTH this worktree and the main tree at ~/workspace/the-scattering (same base anchor); `rg -l "14010[1-8]" ~/memory/` = 0 hits. Used bands NOT reused: 99641-99648, 99591-99598, 99101-99108, 110001-110016, 120101-120116, 53011-53018, 73671-73678 (per the task brief; the 99591-99598 freshness check in sim-volleysoft-b-prereg.md is the model for this verification).

## Policies

- Plain competent (`scripts/policies/competent.js`, no env arms) — the skill-ceiling seed, same base the scale-wall panels use. The recorder wraps `daily()` only; it performs no game actions, consumes no RNG, and writes no game state (neutrality proven in scripts/test-capstoneready-b.js).

## Verdict rule

- GO = primary metric met (>=7/8 seeds name a binding blocker). A miss is NO-GO, never re-scored against a friendlier metric mid-run. This is a census, not a lever: GO means the decomposition is solid enough to aim the next build (answermail / wave5kill follow-ups) at the named blocker; it does not claim any deed is reachable.

## Metric review

- (Filled at verdict time. If the metric proves wrong — e.g. the >=50% share rule names a blocker that is really two tied ingredients, or ever-ready rates turn out to be the more decision-useful number — write it here and propose the revision for the NEXT run.)
