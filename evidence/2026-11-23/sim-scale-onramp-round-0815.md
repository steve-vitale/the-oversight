# sim-scale-onramp-round-0815 — coordinator round record (Loop A, run fleshout-20261123T0815Z)

**Run:** fleshout-20261123T0815Z · **Loop A** · **Axis:** scale-onramp (converging, NOT converged)
**Base master at spawn:** `80e7da0bc` · **Closeout tip:** `4ed324733`
**Claim:** `hidden_files/lever-claims/fleshout-20261123T0815Z.json` (arms below; deleted at closeout)
**Loop B:** live claim none at run start; Loop B landed `39e1a8ec1` (sim-launchfield-horizonfix-b) mid-run — zero file overlap with any arm; all three branches rebased onto it clean, proofs re-run green after every rebase.

## Stale-lock recovery

Lock `fleshout-20261123T0515Z` (created 2026-11-23T05:23:00Z) was ~173 min old at run start, with no registry tree, no live claim, and no coordinator process — deleted under the 90-min fallback, same-call verified (cat + run_id match + delete). Its gate work was already captured by the 0215Z adoption record (commit `8a032676f`); nothing was lost. New lock `fleshout-20261123T0815Z` created 08:18:26Z; deleted at closeout.

## Arm 1 — sim-homebody-metric-a: GO (lever certified, LANDED)

Homebody-holder handoff re-judged under the corrected metric (tracker next blank 2).
Commits: `f99f9c0c6` (lever, [needs-eyes]) + `4ed324733` (instrument + evidence).
Evidence: `evidence/2026-11-23/sim-homebody-metric-a.md`, prereg `evidence/2026-11-23/sim-homebody-metric-a-prereg.md` (frozen before any judged run).

Fresh band 107455–107470 (16 seeds, 150d, competent; verified fresh across `evidence/**/*.md`):
convertible-hold pool **3**, converted share **3/3 = 100%**, party conversions **3** (two trios, one pair; **0 solo**), holds 36 → 0, launches 15 → 16 (reported, never judged), deaths 1370 → 1350 (cap 1507), median survival 149.5 → 146 (floor 119.6). All frozen bars pass. The old 107431–107446 corpus re-scores GO under the same bar (pool 2, share 100%, conversions 2). The 0215Z METRIC-BROKEN kill is answered. Proofs: 38/38, analyzer 28/28, pool-judge 23/23, ontology 138/138.

Honest caveats (in the arm evidence, not re-scored): the whole pool lives in the pilot half — the confirm half (107463–107470) contributed zero pool cases, its control leg held nothing, so the verdict rests on 3 triples. On all 3 conversion seeds the armed village was lost sooner (2 survived→lost flips; 107459 lost d151→d113); villages lost 8 → 10 while total deaths fell, so the frozen guardrail passes but community loss rose. Findings **#2498 / #2568 / #2705 closed** by this landing.

## Arm 2 — sim-detgate-order-a: instrument GO, dawnchoke NO-GO stands (bar 8 alone)

Order-insensitive det-gate bound + dawnchoke re-judge (tracker next blank 3).
Commits: `d0ed41382` (instrument + frozen prereg) + `18d475572` (evidence, judgment, panel, corpora).
Evidence: `evidence/2026-11-23/sim-detgate-order-a.md`, prereg `evidence/2026-11-23/sim-detgate-order-a-prereg.md`.

Deliberate replay of band 107423–107430 (same seeds as the re-judge; recorded as a replay, not a fresh assignment). The analyzer now compares departures by day/vid/target/member-set (party arrays as sets, plan-targets as multisets per party per day); selftest 44/44. Bar 2 passes **8/8** — first-divergence day = first-extra-depart day on all 6 diverging seeds; the two order-permutation seeds (107423 d99, 107429 d146) now pass. Every re-judge number reproduces exactly: attempts 12 → 57, launches 4 → 36, deaths 91.875 → 102.625 (+10.75/run, 2.69/extra launch), median 141 → 131, starvation 5 → 6. The NO-GO now stands on the death cost alone (bar 8), not bars 2+8 — bar 2 passing is the expected outcome of the fix, not a failure of it. The lever stays reverted on held branch `sim-dawnchoke-a`. Findings **#2702 / #2709 closed**. Sense-test: the physical-description departure beat recurs 5× across seeds 107423/107425/107429, identical on both legs — finding #2710 stays open, confirmed.

## Arm 3 — sim-wornstack-equip-a: GO (finding #2707 FIXED, LANDED)

Scholar equip/unequip worn-stack collapse fix (tracker next blank 4, first half).
Commit: `46370f4d2`. Evidence: `evidence/2026-11-23/sim-wornstack-equip-a.md`, prereg alongside it.

In plain words: wearing a stacked item used to destroy the extra units — a 2-cell stack worn as a trinket lost the second cell, and taking it off put exactly one back. `equip()` now carries `units` onto the worn entry when >1 (same rule as the mantle fix) and `unequip()` restores them; the displaced piece on overwrite returns whole. Proof test 21/21 on new code, 9/21 on old code (exactly the stack assertions fail); gunloss 42/42, mantle 13/13, analyzer selftest 20/20. The gunloss recorder now counts worn units instead of per-slot. No player-visible behavior change beyond the missing units coming home — no [needs-eyes].

Diag (non-gating, existing corpora only): Omar's corpse thread — scholar-corpse gear is taken only by the living scholar, as a same-day bulk strip when they happen to be at the corpse (50 corpseTakeEvents on the gunloss band, zero searcaster/cell takes; corpsecap band: 32 gun-days stranded). Whether villagers ever loot a scholar's corpse is unmeasured, not proven absent. Thread stays open (finding #2672 updated).

## Wall (this run's judged corpora, 48 configs)

Wins 0/48, national 0/48, table 0/48. Wave-5 reached: homebody 3/16 both legs; detgate 2/8 control, 1/8 armed. Wave-4: homebody 16/16 both legs; detgate 8/8 both legs. Median survival: homebody 149.5 → 146; detgate 141 → 131. Villages lost: homebody 8 → 10; detgate 4 → 6 (dawnchoke re-judge numbers).

## Telemetry deviation check

`telemetry-check.js` vs the scale-wall baseline (metrics national, table, wins, exiled; `--allow-recorder-corpus --sweep-rows`) on all four leg dirs (homebody arm/ctl n=16, detgate arm/ctl n=8): exactly the 3 LOUD regime lines on every dir (national 12→0, table 16→0, wins 16→0), exiled quiet. EXPLAINED regime artifact (pre-seat competent-policy substrate vs the WINSEAT-regime baseline; the baseline's own _regime note predicts it). Baseline NOT rolled.

## Round gate (check.js --quick on the merged tip)

`node scripts/check.js --quick` on merged tip `4ed324733`: **335 passed, 9 failed in 1469s** (log `hidden_files/check-quick-0815.log`). **0 attributable.**

- The 5 timeouts — `test-living-garden-deed-attainment.js`, `test-occupation-panels.js`, `test-one-person-army-deed-attainment.js`, `test-trust-observer-neutrality.js`, `test-capable-bot-20261014.js` (all exit null, ~120s) — re-ran green standalone, serialized, on the same tip by the adoption (script `hidden_files/run-0815-standalone.sh`, log `hidden_files/check-quick-0815-standalone.log`, 10:19–10:27Z): exits 0 in 257s / 54s / 112s / 34s / 36s; 86 assertions, 0 failed. Load flakes, confirmed.
- The 4 remaining failures are the standing staleness set, all pre-existing and none touching any 0815Z arm file: `test-measurement-proof-update.js` + `test-measurement-workflow.js` (proof inputs not current / retained neutrality proof), `test-measurement-cache-flags.js` (both actual CLI configurations complete valid neutral panels), `test-phone-frame-proof.js` (stale phone receipt, index.html).
- Master has since moved (deepening r272, tip `9c458f55a`); that tip was separately gated by r272 at 338/6, 0 attributable, which covers these arms — no re-run on the current tip was needed.

## Infrastructure

- Worktree registrations took ~7 min total (three registrations, each slow; no EPERM flap observed, no failed attempts).
- Safe-commit index clobber struck on all three workers' commits (and the wornstack repair) — repaired via the `ls-tree -r HEAD | update-index --add --index-info` pipe each time, commits verified correct.
- Machine restart ~09:24Z killed the homebody worker's first check.js attempt (no output); its retry starved under load (sibling check.js contending). Coordinator re-ran the gate at merge time (see gate section).
- The detgate worker deleted two tracked `evidence/2026-11-22/dawnchoke-a-panel-*.json.gz` files mistaking them for strays; restored via `git checkout HEAD`, verified byte-identical, status clean.
- Master moved once under the run (Loop B `39e1a8ec1`); one ff-merge was correctly refused after the first merge moved master, and the branch was rebased and re-proved before merging (see landing notes).

## Metric review

No mid-run re-scoring occurred. The corrected homebody metric worked as designed: the pool-share primary replaces the unmeasured-base +4 bar, and the solo-vs-party split answers the #2705 caveat on the fresh band (3 party, 0 solo). The det-gate bound needed the order-insensitive revision the re-judge itself filed (#2709) — the instrument fix and the verdict re-judge are one arm by design, and the verdict (NO-GO) is now cleaner, resting on the death cost alone. The wornstack arm's proof is the effect itself (the round-trip), with the old-code-fails control. Small-pool honesty: the homebody verdict rests on 3 triples, all in the pilot half — the next arm on this axis should expect a thin pool and pre-register accordingly, not re-litigate this verdict on a bigger band without a new question.

## Convergence

scale-onramp stays converging (NOT converged): the homebody handoff lands certified and the det-gate instrument is fixed, but wins still come only through default-OFF courtship + seat instruments, only through the lesser seat, and wave 5 is still reached by a minority of villages with no full seat in this round's corpora. The directive stands until the tracker records this axis converged on measured evidence.

Next blanks, in order: (1) pair departures with safety (gear/party composition on the way out); (2) the launch funnel's silence — 11/16 villages launch nothing on either leg; (3) the 49-seed kill-loot searcaster arrival band (still unrun); (4) Omar's corpse thread — whether villagers ever loot a scholar's corpse; (5) the departure-beat physical-description naming (#2710).
