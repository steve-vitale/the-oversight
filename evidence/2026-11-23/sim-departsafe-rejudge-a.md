# sim-departsafe-rejudge-a — Re-judge the Departures-With-Safety Pair Under the Bid-Inclusive Det-Gate Bound

- **Arm:** sim-departsafe-rejudge-a (Loop A, run fleshout-20261123T1815Z, axis scale-onramp)
- **Verdict: GO (re-judged)** — the det-gate passes 16/16 under the corrected bound, and every other frozen bar passes as originally judged.
- **Branch:** sim-departsafe-rejudge-a (worktree `~/workspace/worktrees/sim-departsafe-rejudge-a`, base `dbe748d46`)
- **Band:** seeds 107601–107616 (16 seeds), 150d death-aware horizon, policy `tableseat-nowait` — the frozen departsafe corpus, reused deliberately; NO NEW SIMS
- **Prereg:** `evidence/2026-11-23/sim-departsafe-rejudge-a-prereg.md` (frozen before any judged run)
- **Judge:** `evidence/2026-11-23/departsafe-rejudge-a-judge.json` (scripts/analyze-departsafe-a.js, with the `--proof-frozen` re-judge adaptation)
- **Frozen source:** held branch `sim-departsafe-a`, commit `e9dcc0ffe` (verdict NO-GO; the ONLY failing bar was bar 2, on seed 107611 only)

## 1. The claim, and what this run verified

The 1315Z adoption review stated: under the corrected bound the gate passes 16/16 and every bar would pass. This run VERIFIED that claim from the frozen corpus — it did not assume it. The corrected bound (prereg §2) adds a third lever-effect day to the det-gate: the first `party_launch` bid divergence, alongside the first extra depart call and the first safety effect. On seed 107611 the bid is day 64, the first extra depart call is day 65, the first safety effect is day 66 — and the first divergence is day 64, the bid itself. Under the amended bound the gate passes 16/16 on BOTH contrasts, and every other frozen bar reproduces its original verdict. The only bar that changes between the frozen judgment and this re-judge is bar 2 (false → true).

## 2. The amended bound, in plain words

The det-gate asks: did the two legs run identically until the lever acted? The old bound defined "the lever acts" as the first extra departure call. But a departure starts as a bid: at dawn a villager scores the day's options and bids to launch the hunting party. When that bid is made in the last part of the day, there is no time left to act on it, so the departure itself lands the next day — the bid is the lever acting a day before the call. The corrected bound counts the bid as a lever effect: the bound is the earliest of the first extra depart call, the first safety-check effect, or the first launch-bid the armed leg makes that the control leg does not, for a staged wave-4+ hunting plan. The bid's plan is proven from the departure call it produces (same-day call for an ordinary bid, next-day call for a deferred bid) — not from the census, because a launch consumes the plan before the end-of-day census records it. The comparison itself is unchanged: departures compared by day, villager, target, and party members, with plan-targets compared as a group, ignoring the order names happen to be listed in. The gate still fails on any unexplained divergence before the first lever effect — the bound is not vacuous.

## 3. The det-gate, seed by seed

Arm contrast (ctl-vs-arm; the judged contrast). `fe` = first extra depart call, `fs` = first safety effect, `fb` = first bid divergence, `fd` = first divergence:

| Seed | bound | fe | fs | fb | fd | Pass |
| --- | --- | --- | --- | --- | --- | --- |
| 107601 | 79 | 79 | 79 | 79 | 79 | yes |
| 107602 | — | — | — | — | — | yes (no divergence) |
| 107603 | — | — | — | — | — | yes (no divergence) |
| 107604 | — | — | — | — | — | yes (no divergence) |
| 107605 | 37 | 37 | 37 | 37 | 37 | yes |
| 107606 | — | — | — | — | — | yes (no divergence) |
| 107607 | — | — | — | — | — | yes (no divergence) |
| 107608 | — | — | — | — | — | yes (no divergence) |
| 107609 | — | — | — | — | — | yes (no divergence) |
| 107610 | — | — | — | — | — | yes (no divergence) |
| **107611** | **64** | 65 | 66 | **64** | 64 | **yes** |
| 107612 | — | — | — | — | — | yes (no divergence) |
| 107613 | — | — | — | — | — | yes (no divergence) |
| 107614 | — | — | — | — | — | yes (no divergence) |
| 107615 | — | — | — | — | — | yes (no divergence) |
| 107616 | — | — | — | — | — | yes (no divergence) |

Lift contrast (ctl-vs-lift; diagnostic, not judged): identical bound structure — 107601 bound 79 (fb 79), 107605 bound 37 (fb 37), 107611 bound **64** (fb 64, fe 65, fd 64; no safety effect on the lift leg by design), all other seeds no divergence. **Det-gate passes 16/16 on both contrasts.**

Two checks that the bid component is a third attribution source, not a replacement: on 107601 and 107605 the bid does NOT move the bound (79 and 37 respectively — the bid, the call, the safety effect, and the divergence all agree on the same day); on the 13 silent seeds the bid is null and nothing changes. The bid moves exactly one seed's bound — 107611, 65 → 64 — which is the seed the frozen judgment diagnosed as instrument lag.

## 4. Before / after on identical seeds (unchanged — frozen corpus)

| | ctl | lift | arm |
| --- | --- | --- | --- |
| Wave-4+ launches (judge count) | 14 | 35 | 33 |
| Wave-4+ attempts (analyzer count) | 22 | 36 | 83 |
| Total deaths | 1234 | 1287 | 1292 |
| Mean deaths / run | 77.125 | 80.44 | 80.75 |
| Median survival (days) | 93.5 | 92.5 | 94 |
| Starvation deaths (total) | 5 | 6 | 5 |
| Wins (any run-ending win) | 12 | 13 | 13 |
| National scale reached | 0 | 0 | 0 |
| Wave 5 reached | 3 | 3 | 3 |
| Wave 4 reached | 16 | 16 | 16 |
| Villages lost | 4 | 3 | 3 |

Every number reproduces the frozen departsafe judgment exactly (launches 14/35/33, deaths 1234/1287/1292, safety census 747 calls / 77 judged / 44 holds / 33 passes / 670 skips, hold reasons party-too-small 30 / sick 11 / hp<70 5). The bound change touches only the det-gate comparison — metric counting reads the raw rows, so nothing else could move, and nothing did. The balanced panel (`departsafe-rejudge-a-panel.md`) is byte-identical to the frozen `departsafe-a-panel.md`: decision **review_required**, village deaths per run 77.125 → 80.75 (+3.625, 95% exploratory interval −1.44 to +12.44 — includes zero), table win rate 0.75 → 0.8125 (change_watch), national scale access 0.8125 → 0.8125 (no change).

## 5. The frozen bars

| Bar | Threshold (frozen) | Observed | Result |
| --- | --- | --- | --- |
| 1. Instrument validity | proof test 100% (frozen record, prereg §6), analyzer selftest 100%, judge selftest 100%, 0 instrument errors on all 48 files | proof inherited from frozen `departsafe-a-judge.json` (`instrumentRuns.proofPass: true`; proof test 48/48 on the lever code, failing on old code — see sim-departsafe-a.md §9); analyzer selftest 55/55 (50 carried + 5 new bid cases); judge selftest 15/15 (14 carried + 1 new 107611-shape case); proof test `test-departsafe-rejudge-a.js` 77/77; 0 errors on 48/48 | **PASS** |
| 2. Det-gate (AMENDED bound) | legs identical before the lever's first effect, on all 16 seeds | passes 16/16 (arm) and 16/16 (lift, diagnostic); 107611 bound 64 = first bid = first divergence | **PASS** |
| 3. PRIMARY launches | arm ≥ 1.25× ctl | 33 vs 14 (2.36×) | **PASS** |
| 4. GUARDRAIL total deaths (deciding cost bar) | arm mean ≤ 1.05× ctl mean | 80.75 vs 80.98 allowed (1.047×) — passes by 0.23 deaths/run | **PASS** |
| 5. Survival | arm median ≥ 0.8× ctl median | 94 vs 93.5 (1.005×) | **PASS** |
| 6. Starvation | arm total ≤ ctl total + 2 | 5 vs 5 | **PASS** |

GO (re-judged) = all bars pass. Zero-launch rule did not trigger (both legs ≥ 5 launches).

## 6. Does the lever's case now support landing? — plainly, with the caveats

**On the frozen bars, yes: the pair is certified as a default-OFF instrument under the corrected bound.** Every bar passes, including the deciding death bar. But this arm does NOT land the lever — landing as default-OFF is a coordinator/Steve call — and the substantive caveats from the departsafe evidence stand unchanged, because the re-judge changes no sims and no numbers:

1. **The death bar passes by 0.23 deaths per run — a noise margin, not a safety finding.** One seed (107605) carries the entire death increase (+67 deaths, 133→200); two quiet seeds getting slightly cheaper hold the line. A one-seed band shift the other way flips the bar.
2. **The safety bar still saves zero lives.** Against the lift, the arm has 5 MORE deaths (1292 vs 1287); deaths per extra launch 3.05. The 44 holds delay departures; they do not save the villagers who are held. A hold is a delay, not a life.
3. **The panel still says review_required** (deaths regression_watch, interval includes zero) — the panel and the frozen bar agree the death direction is up, not proven.
4. **The launch funnel is still the wall, not the safety bar.** 13 of 16 villages never launch on any leg; no leg reaches national standing (0/16); the table seat stays unmeasured.

So: GO on the bars, with the landing decision owed to the coordinator/Steve, carrying the departsafe evidence's own caution — the deaths margin and the zero lives saved argue for caution even under a GO. What this re-judge settles is narrower and worth settling: the departsafe NO-GO was an instrument artifact (the bound lagging the bid by a day), not a game finding. The pair was never judged NO-GO on its deaths or its launches; it was judged NO-GO on a bound that could not see the bid. That is now corrected and verified.

## 7. Village assessment, in plain words

Nothing about the villages changes in this re-judge — no new sims ran, and the villages are the same sixteen, frozen. The story is the same as the departsafe run told it: thirteen villages never send a hunting party at all, door or no door; three do, and one of them pays two hundred deaths for twenty-six launches. The safety check stops the sick, the hurt, and the too-small parties forty-four times, and they go out the next day anyway. What changes is only the measuring: the old measure said the two legs first differed a day before the lever could have acted, which was wrong — the lever had already acted, the day before, when desmond_clarke's dawn scoring picked launching over waiting. The corrected measure sees that bid, and the legs are comparable after all. The villages are unchanged; the verdict about whether we can trust the comparison is what flipped.

## 8. Instrument notes

- **Analyzer:** current master `analyze-dawnchoke-a.js` (order-insensitive canonicalization from `d0ed41382`) + the departsafe extension ported from the held branch unchanged + the bid extension (new): `firstBidDivergenceDay`, bound = min(firstExtra, firstSafety, firstBid), attribution accepts any of the three effect days. Selftest 55/55 (50 carried + 5 new bid cases: 13a deferred-bid 107611 shape, 13b same-day bid, 13c non-wave-4+ bid ignored, 13d pre-bid divergence fails, 13e no-call bid ignored).
- **Judge:** the departsafe judge copied from the held branch unchanged except the `--proof-frozen` re-judge adaptation (prereg §6): the proof-test result is read from the frozen `departsafe-a-judge.json` (`instrumentRuns.proofPass: true`) and recorded as inherited with the source file named; a missing file or non-true value fails bar 1. Selftest 15/15 (14 carried + 1 new 107611-shape case). The proof test `scripts/test-departsafe-a.js` itself is NOT in this tree (it asserts lever behavior; the lever is held) — that is the reason for the adaptation, stated in the prereg before the judged run.
- **Proof test:** `scripts/test-departsafe-rejudge-a.js` (new): §A unit checks on `firstBidDivergenceDay` (6), §B live checks on the frozen corpus per seed and contrast (64), §C metric-counting reproduction (3) — **77/77**.
- **Frozen corpus:** 48 per-seed files copied byte-identical from branch `sim-departsafe-a` (commit `e9dcc0ffe`); verified against the prereg manifest (`departsafe-rejudge-a-corpus-manifest.txt`, sha256 `feba39ac7cbd695cfcca90274239aa4625e0e665ae2ea83b75f2b179aeea3b38`) before the judged run — MANIFEST-MATCH. The held worktree was not touched; the held branch was not checked out; nothing was committed to it.
- **Anchors:** supplied from the corpus and compared on every seed (ctl brain `dc247673d540` / winplan `8b5cfd05cb33`; lift+arm brain `20af98840978` / winplan `9fca0685eda2`; anchorCommit `fdd7042b8…` on all three legs). Anchor checks pass on both contrasts.
- **Panel:** `departsafe-rejudge-a-panel.md` (+ `.json`, `-before.json.gz`, `-after.json.gz`) — byte-identical to the frozen `departsafe-a-panel.md` (verified with `diff`).
- **Sense-test:** no new sims, so no new beats; the sense-test from sim-departsafe-a.md §7 stands (launched departures name the whole party and the monster; held departures are silent; finding #2710 — a companion named by physical description instead of a name — recurs, pre-existing, not lever-caused).
- **Write flap:** none observed during this run (heartbeat exit 0; one slow registry write ~75s early in the run, retried, succeeded — a sibling loop held the lock; hands off).

## 9. Metric review

- **Bar 1's proof component is inherited, not re-run — by design, stated in the prereg.** The lever proof test cannot run in a lever-less tree. If a future re-judge ever needs a fresh proof run, it must run in a tree that holds the lever code — but that is a different arm (a lever arm, not a re-judge). For this re-judge the frozen record is the correct evidence, and the judge names its source in the output (`instrumentRuns.proofInherited: true`, `proofFrozenFile`).
- **The death bar's margin is unchanged and still noise (0.23/run).** The re-judge does not re-litigate it; it was judged PASS as written in the departsafe run and reproduces exactly. Any future arm that lands this pair should re-prove the death cost on a fresh band — the margin does not survive contact with a new seed set.
- **The bid component is the third attribution source, and the min() makes it safe in one direction only.** A bid can move the bound EARLIER (107611) but never later; a later bid never masks an earlier call or safety effect. The residual risk is a bid misattributed to the lever (a wave-4+ depart call on the execution day for a different plan than the bid) — bounded by the tight execution-day window (same-day, or next-day only for a deferred bid) and by the fact that any such misattribution would still require the first divergence to fall exactly on the bid day.
- **No bar re-scored.** The only change from the frozen judgment is the one the prereg froze: bar 2's bound. Every other bar is judged on the same frozen numbers by the same code.
- **What would change the verdict back.** Nothing in this corpus can: the re-judge is exhaustive over the frozen bars (16/16 det-gate on both contrasts, all other bars reproduce). A future NO-GO would have to come from a new band, a new substrate, or a new bar — not from re-reading this corpus.

## 10. Sim-findings update (for the coordinator to append to hidden_files/sim-findings.md)

- [open] 2026-11-23 — measurement / det-gate — Bid attribution must prove the bid's plan from the depart call, not the census: the same-day census row is an end-of-day snapshot and a same-day launch consumes the plan before the census (seed 107601 day 79: zoltan bids party_launch for eater/needWave-4, launches, census shows stage 'gear', target null). A census-plan test misses such bids entirely. (sim-departsafe-rejudge-a, evidence/2026-11-23/sim-departsafe-rejudge-a.md §3.)

## 11. Files

- Prereg: `evidence/2026-11-23/sim-departsafe-rejudge-a-prereg.md`
- Judge: `evidence/2026-11-23/departsafe-rejudge-a-judge.json`
- Analyzer cross-checks: `evidence/2026-11-23/departsafe-rejudge-a-analyze-arm.json`, `evidence/2026-11-23/departsafe-rejudge-a-analyze-lift.json`
- Panel: `evidence/2026-11-23/departsafe-rejudge-a-panel.md` (+ `.json`, `-before.json.gz`, `-after.json.gz`)
- Corpora (frozen, byte-identical to held branch `sim-departsafe-a` commit `e9dcc0ffe`): `evidence/2026-11-23/perseed-departsafe-a-ctl/` (16), `perseed-departsafe-a-lift/` (16), `perseed-departsafe-a-arm/` (16); manifest `evidence/2026-11-23/departsafe-rejudge-a-corpus-manifest.txt`
- Frozen references (carried in from the held branch, read-only): `evidence/2026-11-23/departsafe-a-judge.json`, `evidence/2026-11-23/departsafe-a-analyze-arm.json`, `evidence/2026-11-23/departsafe-a-analyze-lift.json`
- Instrument: `scripts/analyze-dawnchoke-a.js` (bid extension), `scripts/analyze-departsafe-a.js` (`--proof-frozen` + selftest case), `scripts/test-departsafe-rejudge-a.js` (new proof test, 77/77)
- Lever: NOT in this tree. The departsafe lever stays HELD on branch `sim-departsafe-a` (commit `e9dcc0ffe`); this arm lands instrument + evidence only. Landing as default-OFF is a coordinator/Steve call.

## 12. Adoption verification — independent re-run (2026-11-23 ~21:00 UTC)

The 1815Z run's worker was cancelled before committing; this arm was
finished by an adoption worker that re-verified every artifact from
scratch rather than trusting the on-disk files. Everything reproduced
exactly:

- **Corpus:** `sha256sum -c departsafe-rejudge-a-corpus-manifest.txt` —
  48/48 OK, 0 mismatches; manifest sha256 matches the prereg.
- **Selftests / proof, re-run:** analyzer `--selftest` 55/55,
  judge `--selftest` 15/15, `test-departsafe-rejudge-a.js` 77/77.
- **Analyzer, re-run to /tmp with the frozen anchors:** ctl-vs-arm
  and ctl-vs-lift outputs byte-identical to the on-disk
  `departsafe-rejudge-a-analyze-arm.json` / `-lift.json`
  (`detPass: true` on both).
- **Judge, re-run to /tmp with the frozen anchors and
  `--proof-frozen`:** byte-identical to the on-disk
  `departsafe-rejudge-a-judge.json` — verdict GO, all six bars true.
- **Panel, re-built to /tmp and compared:** `.md`, `.json`, and both
  `.json.gz` byte-identical to the on-disk panel files; the panel
  `.md` is also byte-identical to the frozen `departsafe-a-panel.md`
  read from held branch `sim-departsafe-a` via `git show` (the frozen
  panel file itself is not carried in this tree).
- **Bound implementation vs prereg §2:** read the full analyzer diff
  against master and against the held branch. The held branch already
  carries the departsafe extension (`departSafeCalls` stream,
  skipped-row filter, `firstSafetyDay`, safety census); this arm adds
  only the bid extension: `firstBidDivergenceDay` implements prereg
  §2(a)–(c) exactly (arm `party_launch` bid with no ctl bid same
  vid/day; wave-4+ brain depart call on the execution day — same day,
  or next day for a `party_launch:no-tick-exact` deferred bid),
  bound = min(firstExtra, firstSafety, firstBid) with the firstDiv
  fallback, attribution accepts firstDiv equal to any of the three
  effect days, plus the ctl zero-`departSafeCalls` check. The judge
  diff vs the held branch is only the `--proof-frozen` adaptation and
  the new 107611-shape selftest case, as the prereg states.
- **Frozen references cross-checked:** the carried-in
  `departsafe-a-judge.json` is NO-GO with only bar 2 false; its
  107611 arm detail is bound 65 / firstExtra 65 / firstSafety 66 /
  firstDiv 64 / pass false, exactly as the prereg diagnoses.
  Analyzer per-seed holds sum to 44 and launches to 33, matching
  the judge's safety census and launch totals.
- **detgate-order-a diagnostic (for the record, not cited as
  evidence):** `detgate-order-a-judgment.json` is the bound's own
  diagnostic on the dawnchoke band 107423–107430: verdict NO-GO,
  but `detPass: true` / `detGate: true` — the failing bar is
  `totalDeaths`, not the det-gate. It validates the order-insensitive
  canonicalization the re-judge reuses; it does not bear on the
  departsafe verdict either way.
- **Panel adjudication (re-stated by the adoption worker):** the
  panel's `review_required` does not overturn the GO. The frozen
  bars are the judge; the panel is the instrument. The panel and
  the bar agree: deaths run +3.625/run with an exploratory interval
  that includes zero (regression_watch, not a proven regression),
  and bar 4 passes at 1.047× against a 1.05× threshold — a noise
  margin, recorded as a caveat in §6, not a safety finding.
- **Landing call (unchanged):** instrument + evidence only. The
  departsafe lever stays HELD on `sim-departsafe-a`; nothing in
  this commit merges, re-enables, or ships it.
