# sim-handoff-diag-a — PREREG (frozen before any sims)

**Arm:** sim-handoff-diag-a · **Loop A run:** fleshout-20261118T0112Z · **Axis:** scale-onramp
**Type:** DIAG (classification only). No game change lands from this arm.
**Branch:** `sim-handoff-diag-a` · **Worktree:** `~/workspace/worktrees/sim-handoff-diag-a`
**Base at arm start:** `3d0f5770c` (coordinator evidence, round 2315: selblock DIAG GO + homebodyvoice BUILD GO).
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`
— verified against the file in this tree before writing this prereg.
**Band:** seeds 103411–103418 (8 seeds) · **Horizon:** 150d death-aware.
**Prereg frozen:** before any sim runs in this arm (corpus reads only before this line).

## The question (finding #2498, design call)

sim-selblock-a classified 113 blocked win-plan selections: 79
`inviter-range-0` (70%) — the plan holder is a homebody (travel range
0) who bids at dawn and can never walk out. The fix is a Steve design
call: STOP range-0 holders from bidding/holding, OR HAND their plan to
a walker. This arm measures the hand-off option so the call is made on
numbers, not a guess: for each range-0-holder blocked selection, could
a walker in the SAME village have held the plan instead?

## What was read first (do not re-measure what they answered)

- `evidence/2026-11-17/sim-selblock-a.md` + prereg — the source
  classification. 12 selected-blocked instances; first-block tally
  inviter-range-0 6, no-tick-after-commit 3, inviter-sick 1,
  inviter-hurt 1, companion-not-started:sick 1 (12/12 named, 0
  unknown). All-selections tally: inviter-range-0 **79** (70%),
  danger-gate 12, companion-range-0 6, no-tick 4, night 3,
  not-at-haven 3, inviter-sick 2, companion-sick 2, inviter-hurt 1,
  selected-not-executed 1. Per-instance table names every holder,
  companion, target, day, and backing depart/skip row.
- `evidence/2026-11-17/sim-profilegate-b.md` + prereg — the frozen
  ON-leg measurement this arm enriches (pool filled 81/87 → 3/99
  empty dawns, launches 3 → 7, selected-blocked 12, median survival
  147.5 → 116.5d, national 1/8, table 0, wins 0).
- `evidence/2026-11-17/profilegate-b-analysis.json` — frozen ON/OFF
  funnel, pool-shape, and wall numbers (D3 comparison target).

## Canon read

- `docs/CANON.md` (manifest), `docs/MONSTER-WAVES.md` (wave law),
  `docs/PARTY.md` (party unlock day 7, cap 3→4→5; travelling parties
  stay together), `docs/VILLAGER-BRAIN.md` (one brain, one scorer;
  departure honors the dawn commitment; range is a consideration
  input, hard shelter rules zero departure candidates).
- **Canon gap, recorded not invented:** no canon doc covers
  expedition companion eligibility, the depart-gate block reasons,
  plan hand-off, or what a range-0 holder may do with a plan. The
  block reasons are grounded in the recorder code
  (`scripts/profilegate-driver-20261117.js` `deriveLaunchBlock`:
  `sick` / `range-0` (`npcMaxDist < 1`) /
  `hurt-no-medicine-no-healer`) and in `src/js/villager-agency.js:349-352`
  (`npcMaxDist`: explorer 6, wanderer 3, forager 1, homebody 0).
  A hand-off has no canon; this arm measures whether one COULD work,
  it does not invent the fiction for it.

## Corpus gap — VERIFIED, and why a fresh run is needed

The frozen ON corpus (`evidence/2026-11-17/perseed-profilegate-b-on/`,
8 files) was inspected field by field before this prereg. It carries:

- **Range, per villager:** YES — `companionPool` member rows carry
  `profile` (explorer/wanderer/forager/homebody), which maps exactly
  onto `npcMaxDist` (6/3/1/0).
- **Location, per villager:** YES — member rows carry `node`,
  `away`, `engaged`, `onExped`, plus the row's `haven` tile; at-Haven
  is node == haven.
- **Plan-hold/commit, for holders:** YES — `dawnbidCensus` rows (one
  per holder per day, with `holderSick`/`holderHealth`/`holderNode`),
  `v4seeds` (plan seeds by vid + day + target), `dawnbidScores`
  (per-holder bids), and `winPlanStats`.
- **Veteran status, per villager per day:** YES — `daily` rows carry
  `vetsW3`/`vetsW4` killers and `waveKillLog` (by/d/mid/w).
- **Sick / health, for NON-picked pool members:** NO — the corpus
  records sickness only for the holder (`dawnbidCensus.holderSick`)
  and, via `companionBlock`, for the PICKED companion. An unpicked
  forager's sickness is nowhere in the corpus.
- **A single snapshot joining all of the above at the depart tick:**
  NO — pool rows are dawn snapshots; the depart happens later the
  same day, and a villager's state (away, sick, onExped, holding a
  plan) can change between the bid and the tick.

A handoff verdict needs sick/health for EVERY candidate walker at the
tick the holder is blocked — otherwise "available" would be overstated
by an unknown amount. The corpus cannot answer the question as asked.
**Therefore the contingency in the brief triggers: run the frozen band
again at 150d with a recorder that carries per-villager max range,
location, sick/health, and plan-hold/commit state at each blocked
depart.** Same seeds, same policy, same flags — a matched
re-measurement, not a new band (see Band freshness below).

## Band freshness (verified before this prereg)

Intentional same-band reuse of 103411–103418 so the classification is
directly comparable with profilegate-b and selblock-a (same villages,
same dawns, same instances — this is a deliberate frozen-band
re-measurement, not a fresh band). Search scope:
`grep -rln "103411" evidence/*/sim-*-prereg.md`. Result: the band is
named by `sim-launchfunnel-a-prereg.md`,
`sim-part2night-a-prereg.md`, `sim-part2target-a-prereg.md`,
`sim-poolshape-a-prereg.md`, `sim-profilegate-b-prereg.md`,
`sim-selblock-a-prereg.md`, `sim-homebodyvoice-a-prereg.md`, and
`sim-fightallycap-confirm-b-prereg.md` (names it among several bands).
**No other prereg names a conflicting use.** A second search,
`grep -rln "forbidden|contaminated" evidence/*/sim-*-prereg.md`,
returns 10 preregs (callertag-b, fallbackfeared-a, ledgerbound-b,
raidcallers-b, shoutgate-a, w4tbhp-a, wallwounds-a, detourgeo-b,
geartier-a, lackingline-b) — **none of them names 103411–103418**;
the two lists are disjoint, so no forbidden/contaminated list reserves
this band. Reuse is by design, recorded here, following the selblock-a
precedent. (The local seed-band rule reserves a band against *new*
measurement; a matched re-measurement of the priced band is the
point.)

## Instrument (new recorder; lever re-applied in-tree only)

- **Lever re-application (in-tree only, REVERTED before commit):**
  the PROFILEGATE bypass is NOT in this tree (verified: no
  `PROFILEGATE` match in `src/js/villager-brain.js` /
  `src/js/win-plan.js`). To reproduce the frozen ON leg it is
  re-applied exactly as profilegate-b commit `6bb3375a1`: in the two
  `findCompanion` twins (`villager-brain.js:129`,
  `win-plan.js:208`), skip the line
  `if (prof !== 'wanderer' && prof !== 'explorer') continue;`
  when `PROFILEGATE=1` (env-gated, browser-off). `VETREENGAGE=1`
  (the funnel planter) is already env-gated in `src/js/game.js`
  and needs no change. The re-application is never committed; net
  `src/` diff vs base must be zero at the end (verified with
  `git diff` before reporting).
- **Driver:** `scripts/handoff-driver-20261117.js` — a copy of
  `scripts/profilegate-driver-20261117.js` with names
  `handoff-a` / `perseed-handoff-a-<leg>` / recorder flag
  `HANDOFF_RECORDER`, PLUS the handoff snapshot (below). All other
  recorder behavior identical, so the D3 comparison against the
  frozen analyzer output is meaningful.
- **Handoff snapshot:** inside the `vbrainExecuteDepart` wrap, at the
  point the `dawnbidDeparts` row is built, when
  `commit.winPlanAction === 'party_launch'` AND `vidBlock ===
  'range-0'` (a range-0-holder blocked depart, result `hold`),
  record one `handoffSnapshots` row: `{seq, day, vid (holder),
  target, stage, companion (picked), holderProfile}` plus a
  `members` array with ONE entry per roster member (excluding none —
  holder and scholar are included and flagged `isHolder` /
  `isScholar`, so the snapshot is a complete village census at the
  tick): `{id, profile, maxDist, node, atHaven, alive, away,
  engaged, onExped, sick, health, block (deriveLaunchBlock result
  or null), holdsPlan ({target, stage, needWave} or null), vetW3
  (wave-3+ kill count from state.waveKillLog), vetW4 (wave-4+ kill
  count), isHolder, isScholar}`. Every field is a pure read (same
  accessors the pool replica and `deriveLaunchBlock` already use:
  `Game.npcRangeProfile`, `Game.npcMaxDist`, `Game.npcNode`,
  `Game.getPerson`, `state.village.{sick,health,away,winPlan}`,
  `Game.isEngaged`, `agencyState().exped`, `state.waveKillLog`) —
  no game-state writes, no RNG. The snapshot fires only on
  range-0-holder blocks, so a recorder-OFF leg differs only by the
  absence of these rows.
- **Legs:** ON leg only is judged (`VETREENGAGE=1 PROFILEGATE=1
  MODE=on`, 8 seeds, 150d, OUTDIR `perseed-handoff-a-on`).
  D-check legs are scratch (compared, deleted, not committed) —
  selblock-a precedent.
- **Analyzer:** `scripts/analyze-handoff-a.js` — enumerates the
  range-0-holder blocked selections from the new ON corpus, joins
  each to its snapshot, classifies per the frozen rule below, and
  emits the per-selection table, the tally, the veteran split, and
  the wall numbers. Reuses `scripts/analyze-launchdef-a.js`
  `classifySeed` / the selblock selection enumeration so the 79
  are the same selections selblock-a counted.
- **D3 reproduction:** run the frozen `scripts/analyze-profilegate-b.js`
  over the new ON corpus and compare funnel buckets, pool shape, and
  wall numbers against `evidence/2026-11-17/profilegate-b-analysis.json`,
  per seed. See the frozen rule below — D3 is a REPORT, not a GO gate.
- **Panel:** no balance panel — this is a DIAG, not a lever; there is
  no before/after to compare. The before/after numbers in the
  evidence are the profilegate-b OFF vs ON numbers quoted from its
  frozen analysis, not re-measured here.

## Instance set (frozen)

A **range-0-holder blocked selection** is a `dawnbidDeparts` row in
the new ON corpus with `result === 'hold'`, `vidBlock ===
'range-0'`, `winPlanAction === 'party_launch'` — selblock-a's
`inviter-range-0` selections (79 on the frozen corpus). The analyzer
enumerates them from the new corpus; the frozen 79 is the D3
expectation, not the denominator (see D3 rule).

## Classification rule (frozen)

For each range-0-holder blocked selection, take the `handoffSnapshots`
row with the same `seq` (same depart tick). Candidates = every roster
member except the holder and the scholar (`isHolder` / `isScholar`).
A candidate is a **walker** iff `alive` and `maxDist > 0`
(profile forager/wanderer/explorer). A walker is
**handoff-available** iff ALL hold at the snapshot tick:

- alive, at Haven (`atHaven` true), not `away`, not `engaged`, not
  `onExped`;
- not `sick`, and `block` is null (the depart gate's own
  `deriveLaunchBlock` — covers the hurt-no-medicine-no-healer gate
  as well as range; a walker with `block !== null` is unavailable
  for the reason the gate names);
- not holding another win plan (`holdsPlan` null) — holding a plan
  is being committed to it; a villager on an expedition or engaged
  is likewise committed (covered by `onExped` / `engaged` above).

The **named walker** is the first available walker in
`Game.companionRank` order when the snapshot carries it, else
roster-first; ALL available walkers are listed in the row so the
tally never depends on pick order. Veteran status is recorded for
each available walker (`vetW4 > 0` = living wave-4 veteran,
`vetW3 > 0` = wave-3+ killer) and split in the tally.

Buckets (frozen — one per selection, no double counting):

| Bucket | Meaning |
| --- | --- |
| `handoff-available` | ≥1 handoff-available walker. Sub-split: named walker IS the picked companion vs another walker; and veteran-walker vs non-veteran. |
| `no-walker-in-village` | Zero living roster members with maxDist > 0 exist in the village at the tick (no walker at all — not even an unavailable one). |
| `walker-exists-but-unavailable` | ≥1 walker exists; none is available. The row states WHY per walker (first failing check each: away / sick / hurt-block / onExped / engaged / not-at-Haven / holding-a-plan), and the tally groups the dominant reason. |
| `unknown` | No snapshot row exists for the selection, or the snapshot is unreadable (missing roster, missing fields). Counts against the ≤2 bar. A selection whose snapshot exists but shows zero available walkers is NOT unknown — it is one of the two walker buckets above. |

## Primary metric (frozen)

**Share of range-0-holder blocked selections with a handoff-available
walker** (handoff-available count ÷ enumerated selection count).
The metric is the ANSWER for the design call, not a pass/fail on the
game: a high share says hand-off is viable (walkers are standing at
Haven while homebody holders bid); a low share says stop-bidding is
the honest fix (nobody could take the plan anyway). The GO bar
judges the CLASSIFICATION, mirroring selblock-a: a complete
classification that shows hand-off is hopeless is still GO.

## GO bars (frozen — a miss is NO-GO, never re-scored)

**DIAG GO** iff ALL of:
1. **Classification complete:** every range-0-holder blocked
   selection enumerated from the new ON corpus is classified into
   a named bucket, **unknown ≤ 2**. (Mirror of selblock-a's 12/12
   bar, scaled to the selection count.)
2. **Instrument D-checks green:** D1 repeatability green, D2 wrap
   neutrality green (see below).
3. **Proof test green:** `scripts/test-handoff-diag-a.js` passes all
   checks (synthetic instances per bucket + corpus checks).

A miss on any bar is DIAG NO-GO. The verdict judges the
CLASSIFICATION, not the game.

## D-checks (frozen)

- **D1 repeatability:** seed 103414, 150d, recorder ON,
  `VETREENGAGE=1 PROFILEGATE=1`, run twice; output files identical
  except the `run` label. Seed 103414 is chosen deliberately: it
  holds the most range-0 selections on the frozen corpus (giulia
  28 + visjoin_73 24 + visjoin_85 5 + visjoin_134 companion 1),
  so D1 exercises the snapshot path itself, not just the early
  trajectory.
- **D2 wrap neutrality (full-band):** recorder ON vs recorder OFF,
  both `PROFILEGATE=1`, all 8 seeds, 150d; 0 divergences on the
  daily fingerprints (days/gameDays/standing/maxWave/death-count/
  endReason/pantry + waveKillLog length + vetsW4 killers + roster).
  The snapshot is pure reads by construction; D2 proves it.
- **D3 reproduction (REPORT, not a GO gate):** the frozen
  `analyze-profilegate-b.js` over the new ON corpus vs
  `profilegate-b-analysis.json`, per seed: funnel buckets, pool
  shape, wall numbers, and the enumerated range-0 selection count
  (frozen: 79). Report match/mismatch PER SEED. **Frozen rule for
  drift:** if a seed's instance set differs from the frozen corpus
  (base drift since profilegate-b — its own rebase note already
  showed seed 103413 planting no plans on a newer base), the
  classification for that seed proceeds on the NEW corpus's
  instances, the drift is reported loudly with counts, and a frozen
  instance with no counterpart is listed as "not reproduced
  (drift)" — it does NOT count as `unknown`. If >2 seeds mismatch,
  the evidence says so in the verdict line. D3 mismatch never
  fails the arm by itself: the design question is about walkers at
  blocked departs, and the new corpus's departs are real departs
  on the same band.

## Horizon (why 150d death-aware, same as profilegate-b)

The instances being classified ARE the profilegate-b ON-leg
instances, measured on 150d death-aware horizons. Any other horizon
would re-define the instance set and break comparability with the
frozen analysis. Death-aware: dead villages stop simulating (+10d
tail max), per MEASUREMENT.md §§9–12 — the same rule profilegate-b
used.

## What the evidence must contain

- Before/after numbers on identical seeds (quoted from the frozen
  profilegate-b analysis: OFF vs ON funnel buckets, pool fill, launches).
- Per-selection classification table: seed / day / holder [profile] /
  target / picked companion [profile] / named walker [profile,
  vetW3/vetW4] / bucket / why (per-walker first-failing checks where
  unavailable). All selections, no exceptions (expected 79; if D3
  drift changes the count, the table covers the new count and the
  evidence names the drift).
- Per-bucket totals with the mechanism each names, in plain words,
  plus the veteran split and the picked-companion vs other-walker
  split.
- The design-call reading: what the share says about hand-off viable
  vs stop-bidding — stated as a measurement, not a ruling (the ruling
  is Steve's).
- Village assessment in plain words (what the village looked like on
  a blocked morning: who was standing at Haven, who could have
  walked, who was away/sick/holding).
- Sense-testing note (transcripts: does anything say a plan was
  handed on, or a walker took over? The hand-off does not exist yet;
  note what the fiction would need to say for either fix to read as
  people acting).
- Metric review section.
- D3 reproduction table (per-seed match/mismatch vs frozen).
- Wall numbers on the new band (national/table/wins, wave 4–5
  unlocks, median survival).
- The #2498 follow-up claim for the coordinator to file; this arm
  does NOT edit `hidden_files/sim-findings.md` (outside the repo).

## Disposition

DIAG arm: nothing to revert in `src/` at the end (the PROFILEGATE
re-application is in-tree only and reverted before commit; net
`src/` diff vs base: zero). Commits are instrument + evidence only:
this prereg, `scripts/handoff-driver-20261117.js`,
`scripts/analyze-handoff-a.js`, `scripts/test-handoff-diag-a.js`,
`evidence/2026-11-17/sim-handoff-diag-a.md`, and the new ON corpus
`evidence/2026-11-17/perseed-handoff-a-on/` (8 files). D-check
scratch legs are compared and deleted, not committed. Do NOT push,
do NOT bump, do NOT merge — the coordinator lands the work.
