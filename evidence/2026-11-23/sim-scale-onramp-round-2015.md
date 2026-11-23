# Round record — Loop A flesh-out 2015Z (axis scale-onramp)

Run `fleshout-20261123T2015Z`, Loop A, axis scale-onramp. ADOPTION of the dead 1815Z run: its coordinator timed out at the 20:15Z boundary with both arms' work uncommitted and both workers cancelled ~20:18Z. This run recovered the stale lock (119 min old, no live coordinator, no registry tree for 1815Z), retired the 1815Z claim to `.DEAD`, and finished both arms in place in their registered trees — no new registration (cap full at 16).

Base master `dbe748d46` (Loop B 1730Z adoption round record). Master moved twice during the run: `b68134225` (journey deepening r275, tooling only) → `dcbaafeb0` (departsafe-rejudge merge) → `53ae1c2de` (musterask merge). Both branches rebased clean in their own trees (zero file overlap each time), proofs re-ran green after every rebase (musterask proof 111/113 with only the 2 expected frozen-base anchor failures; departsafe proof 77/77 + selftest 55/55).

## Arm 1 — sim-musterask-a: DIAG-GO (merged `53ae1c2de`)

Blank #1: name the dawn-scoring gap — the 82 never-scored holder-days from sim-muster-a (`hidden_files/sim-findings.md` line 2719).

Frozen prereg + Amendment 1 (recorded before any band judgment): the replay's `--diff` is 0/2 on causeCounts because the frozen corpus lacks dawn streams, so the new naming itself is the diff; the judged set is the replay's set, which coincides with the frozen 82. Instrument built by the dead run's worker and verified at adoption (fresh 107617 replay byte-identical to the inherited file); full 8-seed replay 107617–107624, 150d, competent verbatim.

Verdict: **82/82 never-scored holder-days named, 0 unclassified** (bar 1 needed ≤8). The 82: scholar-at-dawn 40 (Otto Herrera 33 straight days, seed 107624 d81–d113 + Daniyar Askarov 7 days, seed 107623 d132–d138 — mid-run successions the end-of-run scholar check missed); away-at-dawn 13; on-expedition-at-dawn 9; pick-early-return 14 (EAT 12, SEEK 2 — hunger answers before the line-660 feed; 2 also show a mid-day refresh refused on the same-day commit); plan-created-after-dawn 3; engaged-at-dawn 2; objective-live-all-day 1. End-of-day state proven a bad proxy for dawn state (direct contradiction on 65/82 days). The d58/d59 seed-107624 cluster is a shared holder fact (the village sent everyone out), not a day outage. Sense test (§8, visjoin_84 d100–d110): every silence sensible — a plan born mid-day, a man on guard duty, a hungry man eating.

Bars: 1 PASS (82/82, 100%); 2 PASS (one replay probe per sub-cause, seed/day/vid + code line); 3 PASS (proof test 113/0 on the frozen base, analyzer selftest 39/0, 0 instrument errors, 0 tick-gate mismatches, scored half reproduces 731/731); 4 PASS in substance (game fields identical on all 8 seeds vs the frozen corpus; literal `--diff` 0/2 per Amendment 1); 5 PASS (0 errors). Zero `src/js` changes — instrument only.

Wall (replay, 8 seeds — identical to frozen): wins 0, national 0, table 0, wave-5 reached 3, wave-4 reached 8, median survival 150, max 150, villages lost 2 (107618 d47, 107621 d144), total deaths 778. Launches 40 total on 2 seeds (107624: 29, first d48; 107622: 11, first d115).

Commit `7c6dd67ca` (pre-rebase) → `53e60a140` (rebased onto `dcbaafeb0`, byte-identical content) + `53ae1c2de` (replay corpora). Merged ff-only into master, exit 0. Findings update appended to line 2719.

## Arm 2 — sim-departsafe-rejudge-a: GO (merged `dcbaafeb0`)

Blank #2: departsafe re-judge under the bid-inclusive det-gate bound (no new sims; frozen corpus 107601–107616 from held branch `sim-departsafe-a`).

The dead run's worker left the judge, panel, and analyzer change uncommitted; the adoption worker re-verified every artifact from scratch rather than trusting the on-disk files. Corpus `sha256sum -c` 48/48 OK; analyzer `--selftest` 55/55, judge `--selftest` 15/15, proof test 77/77; analyzer re-run to /tmp byte-identical to on-disk outputs; judge re-run byte-identical; panel re-built byte-identical (and byte-identical to the frozen `departsafe-a-panel.md` read from the held branch via `git show`).

Verdict: **GO — all six frozen bars pass; det-gate 16/16 under the bid-inclusive bound on both contrasts.** Launches 14 ctl / 35 lift / 33 arm; deaths 1234 / 1287 / 1292 (mean 77.125 / 80.4375 / 80.75); deaths per extra launch 3.05; safety census 747 calls / 77 judged / 44 holds / 33 passes / 670 skips. Seed 107611 under the amended bound: bound 64 = first bid = first divergence, passes on both contrasts (the original NO-GO was the bound lagging the bid by a day — an instrument artifact, not a game finding). Panel adjudication: `review_required` (village deaths +3.625/run, 95% exploratory interval −1.44 to +12.44, includes zero; table win rate 0.75 → 0.8125) does NOT overturn the GO — the frozen bars are the judge, the panel is the instrument; bar 4 passes at 1.047× against a 1.05× threshold (0.23 deaths/run margin — a noise margin, recorded as a caveat). The safety bar still saves zero lives (arm 5 more deaths than lift).

Wall (frozen corpus, 16 seeds): wins 12 ctl / 13 lift / 13 arm; national 0/16 all legs; wave-5 reached 3/16; wave-4 reached 16/16; median survival 93.5 / 92.5 / 94 days; villages lost 4 / 3 / 3.

**LANDING CALL: instrument + evidence only. The departsafe lever stays HELD** on branch `sim-departsafe-a` (commit `e9dcc0ffe`) — nothing in this commit merges, re-enables, or ships it. Whether the GO re-judge changes the lever's HOLD status is a coordinator/Steve call, NOT this run's. Evidence records this explicitly (§6, §11, §12).

Commit `c1e830f55` (pre-rebase) → `addfcc9a5` (rebased onto `b68134225`, byte-identical content) + `d653da6a1` (frozen corpus, rebased as `dcbaafeb0`). Merged ff-only into master, exit 0. Findings item appended (bid attribution must prove the bid's plan from the depart call, not the census).

## Gate

check.js --quick on the merged tip `53ae1c2de` (log `hidden_files/check-quick-2015.log`): **335 passed, 9 failed in 1209s, 0 attributable.** Adjudicated by the finisher (standalone log `hidden_files/check-quick-2015-standalone.log`):

- 5× 120s timeouts (load class): `test-living-garden-deed-attainment.js`, `test-occupation-panels.js`, `test-one-person-army-deed-attainment.js`, `test-trust-observer-neutrality.js`, `test-capable-bot-20261014.js`. Re-ran green standalone: occupation-panels, one-person-army (7/0), capable-bot (40/0) per the endgame r275 finisher's standalone log on tip `9456a8e2c`; trust-observer-neutrality re-ran green standalone here, 6/0 in 187s; living-garden passes at a 900s budget per the r275 finisher (`r275-living-garden-900s.log`, LG900 exit=0) — the 120s check.js budget, not the test, is the binding constraint under load.
- 3× standing staleness (reproduce identically standalone): `test-measurement-proof-update.js` (exit 1, 7s), `test-measurement-workflow.js` (exit 1, 5s, 8/1 — "retained neutrality proof covers the current Game/controller/harness inputs"), `test-phone-frame-proof.js` (exit 1, 7s, 3/3 — stale receipt: index.html). Same three failed at the 1415Z gate, before either arm merged.
- 1× NEW `test-measurement-cache-flags.js` (exit 1, 88s, 0/4), adjudicated a **load artifact, not a cache-identity regression**: the test spawns `balance-panel.js` three times with a 30s timeout each (88s ≈ 3×30s), and a manual balance-panel run takes 41–43s under the current box load (load average 13.5, 17 node processes; both manual runs exit 0 when given time) — the spawns time out before any cache identity is evaluated. No harness file changed since the 1415Z pass (`balance-panel.js` / `sim-harness.js` / `godpath/lib.js` untouched since old commits), and neither arm touched `src/js` or any harness file (0 src/js files in both arm commits). Remediation owed, not a re-score: the test's 30s spawn budget is too tight for a loaded box.

Master moved once during the gate (`53ae1c2de` → `04717109b`: endgame r275 dead-whisper fix + Voice-collapse fix); the r275 finisher's own gate on that tip was 312/32, 0 attributable. The 2015Z gate result stands for the merged tip — zero src/js overlap with either 2015Z arm.

## Telemetry

Deviation check against the scale-wall baseline (`hidden_files/telemetry-baselines/scale-wall.json`) on the per-seed evidence globs, metrics national, table, wins, exiled. The script refuses recorder corpora by default; run with `--allow-recorder-corpus`. Musterask (8 files): LOUD national 12→0, table 16→0, wins 16→0; exiled quiet. Departsafe ctl (16 files): same 3 LOUD lines; exiled quiet. All 6 LOUD lines are the documented regime artifact (baseline's own `_regime` note forbids comparing the competent-verbatim control substrate against the winseat baseline; same call as r251/r273 and the 1415Z round). Baseline NOT rolled.

## Scale-onramp axis

scale-onramp stays converging (NOT converged): the launch funnel is now decomposed one step further — the muster ask is fully named (the 82 days were ordinary dawn life, not a pool failure) and the departsafe pair is re-judged GO on a corrected bound — but wins are still 0 on both judged corpora and national 0 everywhere in this round. The departsafe lever stays HELD pending a coordinator/Steve call on the re-judge. Next blanks in order: (1) whether a hunt-locked plan should retarget on a wave-4 meeting (design call — changes the lock's purpose); (2) held departures are silent — whether a hold should speak (design call); (3) Omar's corpse thread (#2672); (4) finding #2710 (departure-beat physical-description naming, recurred again); (5) the pick-early-return share (14/82 muster days) — whether the dawn body gates, not the pool, are the first wall on those days (from musterask metric review).

Merged `dcbaafeb0` (departsafe-rejudge) + `53ae1c2de` (musterask). Claim deleted; lock deleted.

## Infrastructure

- Registry-lock jam ~21:08–21:10Z: a journey-scale `worktree-register.sh` (pid 34315, python child 35048) held the exclusive REGISTRY.lock flock for ~22 min; two heartbeat processes (musterask, journey2-endgame) queued behind it and failed loud after the 120s flock timeout by design. No work lost; the musterask heartbeat landed on retry after the registration finished (release succeeded). The jam owner is a sibling loop's registration — not touched, not killed.
- Safe-commit index clobber hit both workers' commits + the coordinator rebase-verify cycle (repaired via `git ls-tree -r HEAD | git update-index --add --index-info` each time; commits always correct).
- `worktree-reap.sh` skipped at pre-flight (registry lock held by a sibling reaper run); no new registrations were needed this run.
- No EPERM flap this run.
