# Evidence — sim-capabledeed-a: capable-bot fixture re-seed 35 → 63

Run: fleshout-2026-11-07T0715Z, Loop A. Worker: sim-capabledeed-a.
Branch: `sim-capabledeed-a`, base f043aa772 (master at rebase; journey-establishment r109).
Axis: food-economy / measurement (findings-backlog #1834).
Pre-registration: evidence/2026-11-07/sim-capabledeed-a-prereg.md (decision rule
pre-registered BEFORE judging or fixing; this file judges against it).

## 1. Reproduction

### Standalone, base f043aa772, fixture seed 35
`node scripts/test-capable-bot-20261014.js` → **39 passed, 1 failed, 0 todo**.
Only failure: section 7, "real capable player combat earns the food deed at
first use":
`[{"fighting":true,"before":true,"after":true,"earned":true,"source":"v:devon_okafor"}]`
Every other assertion green, including the reactor-refusal pair and the short
sims (seed 42: feast opportunity unobserved — INFO only; seed 1234:
foodDeeds=true, one granted feast day 17).

### Via check.js --quick, base f043aa772 (seed 35, BEFORE the re-seed)
`node scripts/check.js --quick` → **279 passed, 11 failed in 1318s**.
Caveat: output was piped through `tail -30`, so the full 11-failure list was
not preserved — only the tail (a racks-full voice gate failure in another
test, and test-table-endings-20261014.js hitting the 120s per-test timeout).
Notably, in this run test-capable-bot-20261014.js itself hit the **120s
per-test TIMEOUT** (listed among the slowest: synergy-stall, table-endings,
capable-bot all at 120s) rather than reporting the assertion failure — the
box is heavily loaded and the standalone file takes ~88s even unloaded.
The task brief's earlier note ("seed 1234 feast opportunity unobserved" in a
check.js --quick run) refers to the short-sims INFO line, a coverage watch,
not an assertion: in the standalone run seed 1234 DID observe a qualified
feast plan and earn the food deed.

### Timing probe (temporary, deleted before commit)
`scripts/probe-capabledeed-timing.js` wrapped `noteFeastedCombatUse` BEFORE
the section-7 `capable.upkeep` feast. Three calls in the feast-draw fight,
day 20:
1. buffUsedBefore=false, source `v:devon_okafor` → banks the deed
   (feastSurgeUsed=true, by=v:devon_okafor). First combat use in the fight,
   by a villager ally's blow via the tbDamage hook.
2. buffUsedBefore=true, source `v:gen_av9t2kp` → idempotent no-op.
3. buffUsedBefore=true, source `p` → the player's own first use arrives after
   the deed is already banked, so the strict player-first assertion fails.
(The test's own `uses` wrapper is installed AFTER upkeep, which is why it
records only the third call, with before=true.)

## 2. Root cause — the documented seed-drift class, 6th occurrence

The engine is correct; only the fixture seed drifted. The deed fires on the
first real combat use by whoever lands the blow (SEATBLOW-OPEN, Steve
2026-10-17, src/js/feastBuff.js) — devon_okafor's blow banked it, and
campaign seed 1234 earns the food deed in a natural 40-day sim. The
suspected stayrecover landing (f4dafd387, merged 2026-11-06) is exonerated:
`git show f4dafd387` adds only `tbEatRations` in src/js/game.js and a
`COMPETENT_RECOVER=1`-gated eat block in scripts/policies/competent.js.
feastBuff.js, foodPower.js, progression.js untouched; the eat verb never
calls noteFeastedCombatUse; the probe shows the banking is a villager strike
through the tbDamage hook (game.js:38633 sets `_feastUseSource`), not an eat
or a grant-path change. The drift comes from base movement since seed 35 was
set (2026-11-03): journey-establishment r109 and other landings shifted the
cumulative RNG stream through sections 1–6. This is the same class as the
five prior re-seeds (8→9→10→11→35), each recorded in the file's seed comment.

Decision per the pre-registered rule: **branch (a) — re-seed the fixture.
No assertion loosened; no engine change.**

## 3. Seed sweep (sections 1–7 screen, `scripts/probe-capabledeed-sweep.js`, temporary)

Tried in order on base f043aa772 (33 assertions in sections 1–7; the sweep
skips the short sims, whose seeds 42/1234 are independent of the fixture):

| seed | result |
|------|--------|
| 56 | section 7 villager-first (v:gen_kqf5bzb) |
| 57 | section 7 villager-first (v:aria_thompson) |
| 58 | section 7 villager-first (v:gen_9jphfxb) |
| 59 | section 7 villager-first (v:gen_mkez5y1) |
| 60 | NO feast draw + section 7 (no uses) — precondition fail |
| 61 | flee-fixture failures + section 7 villager-first |
| 62 | section 7 villager-first (v:gen_73sohy8) |
| **63** | **33 passed, 0 failed — FIRST restoring seed** |
| 64 | flee "left the node havenward" fail |
| 65 | 33 passed, 0 failed |
| 66 | 33 passed, 0 failed |
| 67 | section 7 villager-first (v:nadia_khoury) |
| 68 | section 7 villager-first (v:gen_mrrc5hu) |
| 69 | flee-fixture failures |
| 70 | section 7 villager-first (v:gen_p8i6x9h) |

63 taken as the first restoring seed, per precedent (lowest passing seed in
tried order). 65 and 66 also pass sections 1–7 and are recorded here as
fallbacks if 63 ever drifts again.

## 4. The change

`scripts/test-capable-bot-20261014.js`, one line: `K.load({ seed: 35 })` →
`K.load({ seed: 63 })`, with the seed-history comment extended (2026-11-07
entry: probe result, f4dafd387 exoneration, seeds tried, why 63 is correct).
No assertion changed. No src/js, policy, or data change. Pure test re-seed —
no `[needs-eyes]` (no feel/combat/UI change).

## 5. Proof

- Standalone, new tip, seed 63: `node scripts/test-capable-bot-20261014.js`
  → **40 passed, 0 failed, 0 todo**. Section 7 all green, including "real
  capable player combat earns the food deed at first use"; reactor-refusal
  pair green; short sims identical to the seed-35 run (seed 42 unobserved,
  seed 1234 foodDeeds=true).
- Via check.js --quick, new tip: full run → **280 passed, 10 failed in
  1316s** (vs 279/11 on the seed-35 tip). test-capable-bot-20261014.js shows
  `FAIL (exit null, 120.2s)` — but the log proves this is the 120s per-test
  TIMEOUT, not an assertion failure: every section-7 assertion is `ok`
  (including the food-deed assertion), and the run was killed inside "short
  sims: 2 seeds x 40 days" (the child-process campaigns) under 4-parallel
  load. The identical timeout hit the same file on the seed-35 tip, so it is
  a pre-existing load artifact, not a regression from the re-seed.
- Via check.js --only (single-test, same harness, box quieter):
  `node scripts/check.js --only test-capable-bot-20261014` →
  **1 passed, 0 failed in 72s**. The file is green through the check.js
  harness.
- The other 9 --quick failures are untouched by this change (one-line seed
  change in a single test file) and pre-existing on this base: measurement
  proof/workflow/cache-flags, phone-frame proof staleness, occupation
  panels, mobile-combat-cadence, establishment-r20-fixes, plus 120s timeouts
  on trust-observer-neutrality and table-endings. Not investigated further
  here — outside this arm's assignment; the coordinator/loop owns the
  --quick baseline. Full new-tip --quick log preserved at
  /tmp/capabledeed-check-quick.log (ephemeral; the summary counts are in
  this file).

## 6. Metric review

Primary metric (pre-registered): section-7 assertion green with the player as
first consumer, full file green standalone + via check.js --quick, no
assertion changed. Standalone: MET (40/0). check.js: MET via --only (1/0,
72s); the full --quick run timed the file out at the 120s cap inside the
short sims (all section-7 assertions `ok` in the log) — a pre-existing load
artifact identical on the seed-35 tip, reported as-is, not worked around.
No re-scoring: the metric was not changed mid-run.

## 7. Village assessment / blanks

No gameplay blank filled — this was a measurement-instrument repair, not a
game change. The food deed itself is proven earnable (natural sim seed 1234,
controlled section-7 proof, villager banking). Standing observation for the
backlog: the player-first fixture is fragile by construction (the player is
1 of ~6 fighters in the feast-draw fight, so most seeds bank villager-first;
hit rate on this base was 3/15 screened). If it drifts again, the next worker
should try 65, then 66, before sweeping fresh seeds. No new findings-backlog
entry: this is the known class, already documented in the file.
