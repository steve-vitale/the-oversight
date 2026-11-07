# Pre-registration — sim-capabledeed-a (fleshout-2026-11-07T0715Z, Loop A)

Axis: food-economy / measurement (findings-backlog #1834).
Owner: worker sim-capabledeed-a. Branch: `sim-capabledeed-a`, base f043aa772
(master at rebase time; journey-establishment r109 landed).

## Target
`scripts/test-capable-bot-20261014.js`, section 7, assertion
"real capable player combat earns the food deed at first use". Fails on
current master; proven pre-existing (failed identically standalone on the
wanderspawn branch, 39 passed / 1 failed, AND on pure master 2f67b721c in a
temp registered worktree, 41 passed / 1 failed, same assertion).

## Reproduction (recorded BEFORE judging or fixing)

### Standalone (this worktree, base f043aa772)
`node scripts/test-capable-bot-20261014.js` → **39 passed, 1 failed, 0 todo**.
Failing assertion JSON:
`[{"fighting":true,"before":true,"after":true,"earned":true,"source":"v:devon_okafor"}]`
Fixture seed 35 (the file's `K.load({ seed: 35 })`). All other sections green,
including the reactor-refusal assertions and the short sims (seed 42: feast
opportunity unobserved; seed 1234: foodDeeds=true, one granted feast on day 17).

### Via check.js --quick
`node scripts/check.js --quick` — run on base f043aa772 (seed 35, BEFORE the
re-seed) → **279 passed, 11 failed in 1318s**. Caveat: output was piped
through `tail -30`, so the full 11-failure list was not preserved — only the
tail (a racks-full voice gate failure in another test, and
test-table-endings-20261014.js hitting the 120s per-test timeout). Notably,
in this run test-capable-bot-20261014.js itself hit the **120s per-test
TIMEOUT** (listed among the slowest: synergy-stall, table-endings, capable-bot
all at 120s) rather than reporting the assertion failure — the box is heavily
loaded and the standalone file takes ~88s even unloaded. The task brief's
earlier note ("seed 1234 feast opportunity unobserved" in a check.js --quick
run) refers to the short-sims INFO line, a coverage watch, not an assertion:
in the standalone run seed 1234 DID observe a qualified feast plan and earn
the food deed. A fresh full --quick run on the new tip is the required proof;
its result is appended to the evidence file when it lands.

### Timing probe (scripts/probe-capabledeed-timing.js, temporary, deleted before commit)
Wrapping `noteFeastedCombatUse` BEFORE the section-7 `capable.upkeep` feast:
1. day 20, buffUsedBefore=false, source `v:devon_okafor` → banks the deed
   (feastSurgeUsed=true, by=v:devon_okafor). First combat use in the feast-draw
   fight, by a villager ally's blow via the tbDamage hook.
2. day 20, buffUsedBefore=true, source `v:gen_av9t2kp` → idempotent no-op.
3. day 20, buffUsedBefore=true, source `p` → the player's own first use
   arrives after the deed is already banked, so the strict player-first
   assertion fails.

## Root-cause hypothesis (to be confirmed by the decision below)
The documented seed-drift class, 6th occurrence (seeds 8→9→10→11→35, now 35):
a villager's fight banks the feast deed before the player's first combat use.
The engine is behaving correctly — the deed fires on first real combat use by
whoever lands the blow (SEATBLOW-OPEN, Steve 2026-10-17). Evidence against an
engine break:
- The deed DOES fire (banked by devon_okafor); campaign seed 1234 earns it
  in a natural 40-day sim.
- The suspected stayrecover landing (f4dafd387, merged 2026-11-06) touched
  NO feast-path code: `git show f4dafd387` adds only `tbEatRations` in
  src/js/game.js and a `COMPETENT_RECOVER=1`-gated eat block in
  scripts/policies/competent.js. feastBuff.js, foodPower.js, progression.js
  untouched; the eat verb never calls noteFeastedCombatUse.
- The probe shows the banking is a villager strike through the tbDamage hook
  (game.js:38633 sets `_feastUseSource`), not an eat or a grant-path change.

## Decision rule (PRE-REGISTERED — judge the run against this, never re-score)
- (a) If engine behavior is correct and only the fixture seed drifted →
  RE-SEED the fixture to a seed that restores player-first consumption.
  Do NOT loosen the assertion; the SEATBLOW-OPEN design stands (a villager
  banking first is legitimate play, which is why the fixture is re-seeded
  rather than the assertion loosened). The re-seed must be proven: the full
  test file green standalone AND via check.js --quick on the new tip.
  Candidate seeds: try in order 56, 57, 58, ... (seeds 12–34, 36–43, 45–55
  were already tried on the 2026-11-03 base and failed; the base has moved
  since, so a previously-failed seed may now pass, but fresh seeds are tried
  first). Record every seed tried and why the chosen one is correct: it must
  preserve EVERY section precondition (flee, abilities, choices, conversation,
  beastStrikeTarget, bedtime, feast chain, reactor refusal, short sims) with
  no assertion changed.
- (b) If the engine broke the deed path (deed unearnable, or the player-first
  path unreachable by design rather than by seed) → fix the engine (small,
  proven, with a proof test that fails on base and passes with the fix), plus
  before/after evidence on identical seeds.

## Seed-band freshness
No multi-seed sim band is consumed by this arm: the repair is a fixture-seed
change inside one test file, not a sim sweep. No band is assigned, so no band
reservation applies. Fixture seeds tried are recorded in the evidence file
(they are a different thing from sim bands). If branch (b) ever needs a
before/after sweep, the freshness grep across ALL `evidence/*/sim-*-prereg.md`
plus forbidden/contaminated lists runs first, per
~/workspace/custom-skills/local_seed_band_freshness/SKILL.md.

## Canon
docs/CANON.md read. No canon doc covers the food-deed / feast-surge fixture
specifically (docs/ lists no food-deed canon note; PRESERVATION.md covers the
food ladder, not the feast deed). The governing design is the SEATBLOW-OPEN
note in src/js/feastBuff.js (Steve 2026-10-17) and the test file's own
re-seed history — stated here, not invented.

## Metric review (filled at run end)
Primary metric: section-7 assertion green with the player as first consumer,
full file green standalone + via check.js --quick, no assertion changed.
Outcome: branch (a) executed — fixture re-seeded 35 → 63. Standalone 40/0;
check.js --only 1/0 in 72s; full --quick 280/10 with this file timing out at
the 120s cap inside the short sims (all section-7 assertions `ok` in the
log) — pre-existing load artifact, identical on the seed-35 tip. Seeds tried:
56–70 (63 first restoring; 65, 66 also pass sections 1–7). No re-scoring.
