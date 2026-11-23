# sim-departsafe-rejudge-a — PREREG (frozen)

**Arm:** sim-departsafe-rejudge-a · **Loop A run:** fleshout-20261123T1815Z
**Axis:** scale-onramp (converging, NOT converged) · **Blank:** tracker
blank #2 — re-judge the departsafe pair under the bid-inclusive
det-gate bound
**Type:** RE-JUDGE (instrument correction + replay judgment of a frozen
corpus) — NO NEW SIMS
**Base master:** `dbe748d46` (worktree
`~/workspace/worktrees/sim-departsafe-rejudge-a`, branch
`sim-departsafe-rejudge-a`)
**Frozen:** 2026-11-23 ~18:40 UTC, before any judged run. No judged run
has run under this prereg.

## 0. Why this run (read first)

sim-departsafe-a (NO-GO, HELD on branch `sim-departsafe-a`, commit
`e9dcc0ffe` — NOT merged) ran the departures-with-safety pair on band
107601–107616 (16 seeds): launches ctl 14 → lift 35 → arm 33; deaths
mean 77.1 → 80.4 → 80.8 (the death bar passes by 0.23 deaths/run, a
noise margin); 44 safety holds, zero lives saved vs the lift — a hold
delays, it does not save. Bar 2 (det-gate) fails on seed 107611 ONLY:
the frozen bound lags the lever's first effect by a day (deferred
part-3 bid day 64 vs first extra depart call day 65) — instrument lag,
diagnosed in evidence/2026-11-23/sim-departsafe-a.md §4. The 1315Z
adoption review states: under the corrected bound the gate passes
16/16 and every bar would pass. **This run VERIFIES that claim from
the frozen corpus — it does not assume it.** If the re-judge finds
otherwise, the verdict says so and names the failing bar.

## 1. The frozen corpus (no new sims, no new seeds)

- **Corpus:** the departsafe three-leg corpora, exactly as committed
  on held branch `sim-departsafe-a` (commit `e9dcc0ffe`):
  `evidence/2026-11-23/perseed-departsafe-a-ctl/` (16),
  `perseed-departsafe-a-lift/` (16), `perseed-departsafe-a-arm/` (16).
  Extracted READ-ONLY via `git archive sim-departsafe-a` (the held
  worktree `~/workspace/worktrees/sim-departsafe-a` belongs to the
  dead 1115Z run — NOT touched, the branch NOT checked out, NOTHING
  committed to it) and copied byte-identical into this worktree so
  the re-judge is self-contained and reproducible from this branch.
- **Frozen-corpus manifest:**
  `evidence/2026-11-23/departsafe-rejudge-a-corpus-manifest.txt`
  (sha256 of each of the 48 per-seed files, sorted paths). Manifest
  sha256: `feba39ac7cbd695cfcca90274239aa4625e0e665ae2ea83b75f2b179aeea3b38`.
  The judged run verifies the worktree copies against this manifest
  before judging; any mismatch is a loud failure, not a re-score.
- **Band:** 107601–107616 (16 seeds), 150d death-aware horizon,
  policy `tableseat-nowait` — the departsafe band, reused
  deliberately so the re-judge is comparable. No fresh band is
  consumed.
- **Frozen judgments carried in for reference (not re-judged
  blind):** `evidence/2026-11-23/departsafe-a-judge.json` (verdict
  NO-GO; bars instrument true, detGate false, primaryLaunches true,
  totalDeaths true, survival true, starvation true;
  instrumentRuns proofPass true, analyzerSelftestPass true,
  judgeSelftestPass true; detPass false, anchorPass true,
  detLiftPass false, liftAnchorPass true) and
  `departsafe-a-analyze-arm.json` / `departsafe-a-analyze-lift.json`
  (per-seed det details; the ONLY failing seed on either contrast
  is 107611: arm bound 65, firstExtra 65, firstSafety 66,
  firstDiv 64; lift bound 65, firstExtra 65, firstDiv 64).

## 2. The amended bound — bid-inclusive, shape-agnostic, order-insensitive (frozen, verbatim)

The det-gate bound fires at the first lever-attributable effect day.
A lever-effect day is one of three, whichever is earliest:

- **firstExtraDepartDay** — earliest day the armed leg records a
  brain-path depart call for a wave-4+ plan (planNeedWave ≥ 4 OR
  planTarget a wave-4+ species — the same OR as the re-judge) for a
  (vid, day) with no control-leg brain depart call for that vid
  that day. The re-judge rule, UNCHANGED.
- **firstSafetyDay** — earliest day the armed leg records a
  NON-SKIPPED `departSafeCalls` row (a skipped call returns before
  any gear-up, stats bump, or member judgment and has zero state
  effect, so skipped rows are invisible to the det-gate — the
  departsafe pilot-gate fix, UNCHANGED).
- **firstBidDivergenceDay** — earliest day D such that ALL of the
  following hold:
  (a) the armed leg records a `scorePicks` row with
  `winPlanAction === 'party_launch'` for villager V on day D;
  (b) the control leg records NO `scorePicks` row with
  `winPlanAction === 'party_launch'` for villager V on day D;
  (c) the armed leg records a brain-source `departCalls` row for
  villager V on the bid's execution day — day D when the bid is
  not deferred, day D+1 when the bid's `deferred` field is
  `'party_launch:no-tick-exact'` — whose plan is wave-4+
  (planNeedWave ≥ 4 OR planTarget a wave-4+ species, the same OR
  as firstExtraDepartDay).
  Null when no day satisfies all three. (NEW — this arm.)

**bound** = the minimum of the non-null values among
{firstExtraDepartDay, firstSafetyDay, firstBidDivergenceDay};
when all three are null, bound = firstDivergenceDay (the
unchanged fallback shape).

**firstDivergenceDay** = the earliest day on which any recorded
event stream differs between the legs, comparing departures by
day/vid/target/member-set and plan-targets as multisets under the
detgate-order-a order-insensitive canonicalization (merged
`d0ed41382`; reused UNCHANGED — deep-sorted arrays, companion
triple as a set, beat-text name order, party plan-target
multiset per party per day, including parties persisting past
their departure day).

**The det-gate passes for a seed iff ALL of the following hold:**
the ctl leg records 0 first-release rows AND 0 `departSafeCalls`
rows; every recorded event stream is identical between the legs
for rows with day < bound, under the order-insensitive
canonicalization; and the first divergence is on a lever-effect
day — i.e. firstDivergenceDay is null, or equals
firstExtraDepartDay, firstSafetyDay, or firstBidDivergenceDay;
and the anchor checks pass with the expected anchor/sha values
actually supplied and compared (a missing expectation is a FAIL,
never vacuous).

Nothing else in the det-gate changes. The comparison still
canonicalizes departures by (day, vid, target, member-set) with
plan-targets as multisets; a target difference that CHANGES the
party's target multiset still diverges; a plan-target difference
for a villager who is NOT a member of a departure that day still
diverges; a difference in any other field still diverges. The
canonicalization never touches the metric counting paths — metric
counting still reads the raw rows, so the judged numbers must
reproduce the departsafe judgment exactly (§5).

## 3. Mechanism grounding (diagnostic, pre-freeze — no judged run)

Read from the frozen corpus before freezing, not assumed:

- **Seed 107611 (the only failing seed).** Day 64 part 3, holder
  desmond_clarke (wanderer, sign_painter): ctl bids `party_wait`
  (HAVEN_CHORE); lift and arm both bid `party_launch`
  (EXPEDITION, `deferred: 'party_launch:no-tick-exact'`) for his
  wave-4+ plan (target "eulogy", needWave 4 — the day-65 depart
  call and the day-65 census row both show stage 'party' /
  'eulogy' / 4). The bid is the lever's first effect: the door
  admits a forager companion for the staged plan. Day 65 part 2
  both armed legs make the extra depart call (firstExtra = 65);
  the safety check's first real effect follows day 66 (a pass for
  a 4-person party; firstSafety = 66). The day-64 contest
  difference (ctl fires a windfall contest; the armed legs fire
  none) is downstream of the same bid. Under the amended bound:
  firstBid = 64, bound = min(65, 66, 64) = 64, firstDiv = 64 =
  firstBid. The pre-bound check covers days < 64 only.
- **Seeds 107601 and 107605 (the other diverging seeds).** The
  bid component does NOT move their bounds: 107601 firstBid 79
  (zoltan_nagy, part 0, same-day call) = firstExtra 79 =
  firstSafety 79 = firstDiv 79; 107605 firstBid 37 (ethan_hunt,
  part 1, same-day call) = firstExtra 37 = firstSafety 37 =
  firstDiv 37. The bid is a third attribution source, not a
  replacement: bound takes the minimum, so a later bid can never
  mask an earlier depart call or safety effect.
- **All other 13 seeds.** firstBid null on both contrasts, and
  firstExtra / firstSafety / firstDiv all null — the legs are
  identical there (no divergence at all). The bid component
  changes nothing on those seeds.
- **Why the bid's wave-4+ plan is proven from the depart call,
  not the census.** The same-day census row is an END-OF-DAY
  snapshot: a same-day (non-deferred) launch CONSUMES the plan
  before the census (107601 day 79: zoltan bids party_launch
  part 0 for eater/needWave-4, launches part 1, and the day-79
  census row shows plan stage 'gear', target null — the
  census-plan test misses this bid entirely). The depart call
  carries the plan at call time, so the qualifier reads the call:
  same-day call for a non-deferred bid, next-day call for a
  deferred bid (a part-3 bid has no tick left to execute, so the
  departure lands the next day — the 107611 shape). The window is
  tight on purpose: a wider window could attribute a wave-3 bid
  to a wave-4+ plan staged the next day. A bid with no wave-4+
  depart call on its execution day is NOT counted (conservative:
  a missed bid can only cause a false NO-GO, never a false GO —
  the bound falls back to firstExtra/firstSafety).
- **Census coverage check.** 967 of 977 arm-leg party_launch bids
  have a same-day census row; the 10 without one are all
  post-bound on their seeds (107601 day 89, 107605 days 49/83,
  the rest matching a ctl bid the same vid/day) and cannot move
  any bound. The depart-call qualifier does not depend on census
  coverage at all.
- **The bid cannot precede the first divergence.** A bid
  difference IS a scorePicks difference, so firstDiv ≤ firstBid
  always; likewise firstDiv ≤ firstExtra and firstDiv ≤
  firstSafety (each effect day is itself a divergence day). The
  gate therefore still fails on any unexplained divergence
  BEFORE the first lever-effect day — the bound is not vacuous:
  if some other stream diverges on a day earlier than all three
  effect days, firstDiv is earlier than the bound and the
  attribution check fails. The gate's meaning is unchanged:
  "the legs run identically until the lever acts" — and the bid
  IS the lever acting.
- **Boundary (frozen).** The gate's granularity is the DAY, not
  the row — the established semantics from the re-judge and
  detgate-order-a: a same-day divergence in another stream is
  attributed to the lever's first effect that day. A bid
  difference for a NON-wave-4+ plan never counts (the door and
  the safety bar both apply to wave-4+ plans only).

## 4. Instrument (frozen design)

- `scripts/analyze-dawnchoke-a.js`: the CURRENT master analyzer
  (order-insensitive canonicalization from `d0ed41382`) PLUS the
  departsafe extension ported from the held branch UNCHANGED
  (`departSafeCalls` in DET_STREAMS with the skipped-row filter,
  `firstSafetyDay`, the safety census in `analyzeSeed`, the
  extended bound/attribution in `detGateForSeed`) PLUS the bid
  extension (NEW in this arm): `firstBidDivergenceDay` (§2),
  bound = min(firstExtra, firstSafety, firstBid) with the
  firstDiv fallback, attribution accepts firstDiv equal to any
  of the three effect days, `firstBidDivergenceDay` reported in
  each per-seed det detail. `--selftest` 100% required before the
  judged run, including new bid cases: deferred-bid bound (the
  107611 shape: bid 64, call 65, safety 66 → bound 64, pass);
  same-day-bid bound (bid = call day → bound = that day, pass);
  a bid for a non-wave-4+ plan does NOT count (bound stays at
  firstExtra, gate fails when the divergence precedes it); a
  divergence BEFORE the first bid still fails; a bid with no
  wave-4+ depart call on its execution day does NOT count; the
  order-insensitivity cases from `d0ed41382` still pass.
- `scripts/analyze-departsafe-a.js`: the judge, copied from the
  held branch UNCHANGED except for one re-judge adaptation (see
  §6): a `--proof-frozen <file>` option that takes the proof-test
  result from the frozen departsafe judge JSON's
  `instrumentRuns.proofPass` instead of running the proof test
  as a child process. Nothing else in the judge changes; it still
  implements the departsafe prereg §7 bars exactly over the three
  legs. `--selftest` 100% required before the judged run,
  including a new case: a staged 107611-shape pair (bid-only
  divergence) passes the det-gate under the amended bound.
- `scripts/test-departsafe-rejudge-a.js` (NEW proof test): proves
  the amended bound — staged synthetic cases (deferred bid,
  same-day bid, non-wave-4+ bid ignored, pre-bid divergence
  fails, no-call bid ignored) AND a live case on the frozen
  corpus itself (seed 107611: `firstBidDivergenceDay` == 64 on
  both contrasts, `detGateForSeed` passes; seeds 107601/107605
  bounds unchanged at 79/37). 100% required before the judged
  run.
- Panel builder `scripts/build-dawnchoke-panels-a.js` (unchanged,
  from master): `--before
  evidence/2026-11-23/perseed-departsafe-a-ctl --after
  evidence/2026-11-23/perseed-departsafe-a-arm --seeds
  107601,...,107616 --out
  evidence/2026-11-23/departsafe-rejudge-a-panel`; then `node
  scripts/balance-panel.js compare` and attach the compare `.md`.
  The panel is the instrument, the frozen bars below are the
  judge. The panel runs because the re-judge changes a judged
  number (bar 2's per-seed results, §5); the metric numbers are
  expected to reproduce the departsafe panel exactly (frozen
  corpus, counting reads raw rows).
- The departsafe driver, policy, and lever proof test are NOT
  brought into this tree (no new sims; the lever is held and
  stays on `sim-departsafe-a`). The lever game code
  (`src/js/win-plan.js`, `src/js/villager-brain.js`,
  `docs/ONTOLOGY.md`) is NOT touched. Do NOT merge branch
  `sim-departsafe-a`. Do NOT touch its files on master.

## 5. Frozen bars (judge: scripts/analyze-departsafe-a.js, full 16-seed band)

The departsafe prereg §7 bar set, with bar 2's bound replaced by
the amended definition in §2 above and NOTHING else changed:

| # | Bar | Threshold |
|---|---|---|
| 1 | **Instrument validity** — departsafe proof test 100% (see §6 for the re-judge evidence of this component); dawnchoke analyzer `--selftest` 100% (including the new bid cases); departsafe judge `--selftest` 100% (including the new 107611-shape case); 0 instrument errors on all 48 seed files (16 ctl + 16 lift + 16 arm) | all must hold |
| 2 | **Det-gate (AMENDED bound, §2)** — ctl leg records 0 first-release rows AND 0 `departSafeCalls` rows on all 16 seeds; for each seed, every recorded event stream is identical between legs for rows with day < the bound, where bound = min(first extra depart call day, first safety-effect day, first bid-divergence day), under the order-insensitive canonicalization; the first divergence is on a lever-effect day (or no divergence); anchor checks pass with the expected anchor/sha values actually supplied and compared | all must hold |
| 3 | **PRIMARY — launches** — arm wave-4+ launches ≥ 1.25 × ctl wave-4+ launches | must hold for GO |
| 4 | **GUARDRAIL — total deaths (deciding cost bar)** — arm mean total village deaths per run ≤ 1.05 × ctl mean | must hold for GO |
| 5 | **GUARDRAIL — survival** — median survival armed ≥ 0.8 × control median | must hold for GO |
| 6 | **GUARDRAIL — starvation** — total starvation deaths armed ≤ control total + 2 | must hold for GO |
| 7 | **NO-GO rule** — any of bars 2–6 missed → NO-GO (never re-scored against a friendlier metric mid-run, §14) | frozen |

**Zero-launch rule (frozen, no re-scoring):** if EITHER leg sees
**fewer than 5 wave-4+ launches**, there is nothing to attribute
and the verdict is **INCONCLUSIVE** (not GO, not NO-GO).

**Lift reference (frozen, descriptive only):** the ctl-vs-lift
judgment is reported alongside the verdict — lift launches, lift
deaths, lift median survival, and the safety ledger. The lift leg
is never judged; it exists so a GO/NO-GO can be attributed (gate
effect vs safety effect). The lift det-gate is reported per seed
as in the departsafe evidence (it failed on 107611 there too);
it is diagnostic, not part of bar 2's verdict, which is the
ctl-vs-arm contrast as implemented in the judge.

**Anchors (frozen, read from the corpus — supplied, never
assumed):** ctl anchorCommit `fdd7042b8b8d6385ee1e717aad3acfd89d7bd57f`
(12-char prefix `fdd7042b8b8d`), brainSha `dc247673d540`,
winplanSha `8b5cfd05cb33`; lift AND arm anchorCommit the same
`fdd7042b8…`, brainSha `20af98840978`, winplanSha `9fca0685eda2`
(the armed shas from the departsafe evidence §9; the anchor is
`fdd7042b8` on all three legs because the lever was uncommitted
— stash/pop never moved HEAD — and the file shas are what
differ).

GO (re-judged) = det-gate passes 16/16 under the corrected bound
AND every other frozen bar passes as originally judged. GO
certifies the PAIR as a default-OFF instrument (both flags on in
sims) under the corrected bound — it does NOT land the lever:
landing as default-OFF is a coordinator/Steve call, and this
arm's commit carries instrument + evidence ONLY. NO-GO = any bar
missed; the evidence says which, with the §14a kill
classification. A miss is NO-GO, never re-scored against a
friendlier metric mid-run. If a metric proves wrong, write it
under "metric review" and propose the revision for the NEXT run.

## 6. Re-judge adaptation to bar 1 (stated here, before any judged run — NOT a bar change)

Bar 1's proof-test component ("departsafe proof test 100%") cannot
be re-run in this worktree: `scripts/test-departsafe-a.js` asserts
lever behavior (the `departSafeCheck` game hook) and the lever
code is HELD on `sim-departsafe-a`, absent from this tree by
design — the test would fail here on missing code, not on a
regression. The bar itself is unchanged; the EVIDENCE for that
component in this re-judge is the frozen record: the departsafe
judge JSON (`evidence/2026-11-23/departsafe-a-judge.json`,
carried into this tree from the branch) records
`instrumentRuns.proofPass: true` (proof test 48/48 on the lever
code, failing on old code via §C against `fdd7042b8` — see
sim-departsafe-a.md §9). The judge's new `--proof-frozen <file>`
option reads that value from the frozen file and reports it as
inherited, with the source file named in the output; it does not
invent a pass. The components that CAN be verified in this tree
— analyzer `--selftest` 100% (with the new bid cases), judge
`--selftest` 100% (with the new 107611-shape case), and 0
instrument errors on all 48 seed files — ARE re-run here and
must all hold. If the frozen file is missing or its recorded
proofPass is not true, bar 1 FAILS (never vacuous).

## 7. Run plan (frozen, staged)

- **Pre-flight (NOT judged):** `node
  scripts/analyze-dawnchoke-a.js --selftest` → 100% (with the
  new §4 bid cases); `node scripts/analyze-departsafe-a.js
  --selftest` → 100% (with the new 107611-shape case); `node
  scripts/test-departsafe-rejudge-a.js` → 100% (staged cases +
  the frozen-corpus 107611 live case); verify the worktree corpus
  against the §1 manifest (sha256, all 48 files) — all before
  any judged run.
- **Judged run (no sims):** analyzer ctl-vs-lift →
  `evidence/2026-11-23/departsafe-rejudge-a-analyze-lift.json`;
  analyzer ctl-vs-arm →
  `evidence/2026-11-23/departsafe-rejudge-a-analyze-arm.json`
  (both with the §5 anchor values, full 16-seed band); then the
  judge over all three legs →
  `evidence/2026-11-23/departsafe-rejudge-a-judge.json` (with
  `--proof-frozen` pointing at the frozen departsafe judge JSON).
  Then the panel builder + `balance-panel.js compare` →
  `evidence/2026-11-23/departsafe-rejudge-a-panel.md` (attached;
  metric numbers expected to reproduce
  `departsafe-a-panel.md` exactly).
- **Per-seed tables** in the evidence file from the judge output
  (det details per seed on both contrasts: bound, firstExtra,
  firstSafety, firstBid, firstDiv, pass).
- **Wall numbers** recorded: wins, national, table (not
  instrumented by this driver — recorded as not instrumented,
  never faked), wave 4–5 unlocks, median survival.
- **Sense-test:** the re-judge changes no sims and no beats; the
  sense-test from sim-departsafe-a.md §7 stands (launched
  departures name the whole party and the monster; held
  departures are silent — finding #2710 recurs). No new
  sense-test is run on a frozen corpus.
- **Canon:** docs/CANON.md read. **No canon doc covers the
  det-gate, the analyzer, or departure safety bars** — said here
  rather than inventing canon. The bound rule is code-derived
  (§3).

## 8. Metric review (to be filled in the evidence file)

- (filled after the run; no bar re-scored)

## Run notes (infrastructure, not judged)

- **Held branch handling.** The departsafe corpus, analyzer,
  judge, and prereg live ONLY on branch `sim-departsafe-a`
  (commit `e9dcc0ffe`). Read via `git show` / `git archive`
  only. The held worktree `~/workspace/worktrees/sim-departsafe-a`
  was NOT touched. Nothing is committed to the held branch.
  This arm's commit carries instrument + evidence ONLY.
- **Write flap.** No flap observed at run start (heartbeat exit
  0 after a slow registry write, ~75s — the registry lock was
  briefly held by a sibling loop; hands off, retried, succeeded).
  If the flap returns mid-run, probe-first discipline per the
  local_write_flap_response skill.
