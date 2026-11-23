# sim-detgate-order-a — order-insensitive det-gate bound + dawnchoke re-judge

**Verdict: NO-GO.** The dawnchoke lever (forager companions may answer staged wave-4+ plans) stays killed. The det-gate instrument fix WORKS — bar 2 now passes 8/8 — and the re-judge numbers reproduce exactly, so the NO-GO now stands on the death cost alone (bar 8), not on bars 2+8.

## What this arm did, in plain words

The last re-judge of dawnchoke hit a measurement problem, not a game problem. Its rule for "when does the lever first change anything" compared whole rows of recorded data as text. The lever's first real effect on two villages was just shuffling the order of the same hunting party — same people, same departure, different lineup order — and the text comparison counted that shuffle as a change days before the lever actually caused any extra departure. So the test failed the lever on a technicality.

This arm fixed the measuring tool so it compares departures by what matters — which day, which villager, which target, which party members — and ignores the order names happen to be listed in. It also fixed a second, subtler order problem: when a party sets out, only the first companion listed keeps a blank target while the others carry the hunt target, so the same party can look different just because the lineup shuffled. The fix now compares each party's set of targets as a group, on the departure day and on every later day that party keeps hunting together.

Then it replayed the exact same eight villages (seeds 107423–107430, 150 days, competent play) twice — once without the lever, once with it — and judged dawnchoke again under the corrected measure.

## The fix, and the proof it works

- Analyzer: `scripts/analyze-dawnchoke-a.js`. The order-insensitive comparison applies ONLY to the divergence check (which day the legs first differ, and the pre-bound check). All metric counting still reads the raw rows.
  - Within-row arrays are deep-sorted and object keys sorted before comparison.
  - `companion` / `companion2` / `companion3` are compared as a set, not in slot order.
  - Departure-beat text "sets out with A, B and C" has its name list sorted before comparison (so a companion named by a physical description still canonicalizes).
  - Party plan-targets are compared as a multiset per party per day: parties are rebuilt each day from departures, the daily party census, and fights (union-find merged), targets are collected per member, sorted, and re-attached to sorted member ids. A real target change still counts as a divergence; a target difference outside a party still counts; any other field difference still counts. The fight-result field `allyVid` is NOT canonicalized — it is set by the fight, not by party order.
  - Analyzer selftest: **44/44 pass** (8 new cases cover party/member/companion order, target-multiset swaps, beat-text name order, `departBeats` launch order, a multiset-changing target difference that must still diverge, a non-party target difference that must still diverge, plan-seed target swaps, and a next-day fight of the same party).
- Diagnostic on the OLD re-judge corpora (before the replay, per prereg §8): the fixed analyzer passes bar 2 on 8/8 with numbers identical to the re-judge.
- Proof test for the lever (`scripts/test-dawnchoke-a.js`, from held branch `sim-dawnchoke-a`): 22/22 pass on the lever code, 14 pass / 8 fail on the old code. The test was used for verification only and is NOT on this branch — it asserts a departure on new code and none on old code, so it cannot live on reverted master.
- Lever replay: the lever hunks were applied verbatim from held commit `4ac23b12f` (only the two `src/js` files; the changed-line multiset is identical, and the resulting `villager-brain.js` blob `4dff1a8bf` matches the held commit exactly). Proof test green first, then the arm leg, then the lever was reverted: this branch was reset to the instrument commit `3550c154e`. The lever lives only on `sim-dawnchoke-a`.

## Before / after, identical seeds (107423–107430)

| | Before (no lever) | After (lever) |
| --- | --- | --- |
| Departure attempts | 12 | 57 |
| Launches | 4 | 36 |
| Choke rate (staged plans that never depart) | 0.863 | 0.792 |
| Stuck plans that eventually departed | 2 of 3 | — |
| Starvation deaths | 5 | 6 |
| Median survival (game days) | 141 | 131 |
| Total deaths (mean per run) | 91.875 | 102.625 |
| Extra deaths per extra launch | — | 2.69 |

Every number reproduces the dawnchoke re-judge exactly (G2 met).

Per seed (game days / deaths / starvation deaths / attempts / launches):

| Seed | Before | After |
| --- | --- | --- |
| 107423 | 151 / 104 / 0 / 7 / 4 | 131 / 102 / 0 / 3 / 3 |
| 107424 | 109 / 69 / 1 / 0 / 0 | 130 / 86 / 1 / 3 / 3 |
| 107425 | 131 / 193 / 0 / 0 / 0 | 131 / 193 / 0 / 0 / 0 |
| 107426 | 113 / 59 / 2 / 0 / 0 | 103 / 80 / 1 / 14 / 14 |
| 107427 | 84 / 70 / 1 / 0 / 0 | 84 / 70 / 1 / 0 / 0 |
| 107428 | 151 / 69 / 1 / 0 / 0 | 151 / 106 / 1 / 15 / 14 |
| 107429 | 151 / 88 / 0 / 5 / 0 | 151 / 88 / 0 / 6 / 0 |
| 107430 | 151 / 83 / 0 / 0 / 0 | 139 / 96 / 2 / 16 / 2 |

## Det-gate: the bound, seed by seed (G1 met)

Bar 2 passes 8/8. On every seed where the legs diverge, the first divergence day equals the first extra-departure day — zero false divergences from order permutations:

| Seed | First extra depart day | First divergence day | Pass |
| --- | --- | --- | --- |
| 107423 | 101 | 101 | yes |
| 107424 | 98 | 98 | yes |
| 107425 | — (no divergence) | — | yes |
| 107426 | 63 | 63 | yes |
| 107427 | — (no divergence) | — | yes |
| 107428 | 97 | 97 | yes |
| 107429 | 150 | 150 | yes |
| 107430 | 111 | 111 | yes |

The two seeds that failed bar 2 in the re-judge (107423 d99, 107429 d146 — both pure order permutations of the same departure) now pass: the d99 party's target multiset is identical on both legs, and the d146 departure differs only in companion order.

## Bars (frozen, prereg §6 with bar 2 corrected)

| Bar | Result |
| --- | --- |
| 1 Instrument (0 errors, anchors match) | PASS |
| 2 Det-gate (order-insensitive) | PASS |
| 3 Anchors (ctl/arm code shas) | PASS |
| 4 Primary attempts (arm ≥ ctl +10, attempts ≥ 5) | PASS (12 → 57) |
| 5 Primary stuck departs (≥1 of 3 stuck plans departs) | PASS (2 of 3) |
| 6 Starvation total (arm ≤ ctl +2) | PASS (5 → 6) |
| 7 Starvation per seed (max excess ≤ 2) | PASS (max +2, seed 107430) |
| 8 Total deaths (arm mean ≤ ctl mean +5) | **FAIL** (+10.75/run; bar allows +5) |
| 9 Survival (arm median ≥ ctl median −10) | PASS (141 → 131) |

Zero-attempt rule not triggered (12 / 57 attempts). Verdict NO-GO via bar 8 alone.

**Reading note for the coordinator:** the brief's parenthetical "(bars 2+8 fail → dawnchoke NO-GO stands)" describes the PRIOR re-judge's verdict, not a frozen expectation for this run. Under the corrected bound bar 2 passes by design; the NO-GO stands via bar 8 alone. If that reading is wrong, the coordinator can overrule — but the numbers are the same either way: the lever kills 2.69 extra villagers per extra launch.

## Balanced-panel comparison

`evidence/2026-11-23/detgate-order-a-panel.md` — decision **review_required**, driven by the deaths signal:

- Village deaths per run: 91.875 → 102.625, paired delta +10.75, 95% exploratory interval 2.125 to 19.875 (excludes 0) — `regression_signal`.
- Village deaths per 100 calendar days: 71.75 → 81.24, delta +9.49 — `regression_signal`.
- Community loss (village lost): 0.5 → 0.75 — `regression_watch`.
- Table win rate 0 → 0; national scale access 0 → 0; no other material signal.

The panel agrees with the frozen bars: the death cost is real, not noise, and it is the only material movement.

## Village assessment, in plain words

Letting foragers answer the call does what it was supposed to do: villages that were stuck now send hunting parties — 36 launches instead of 4, and two of the three plans that had been sitting staged for weeks finally left the village. But the parties it sends mostly die. The extra launches cost 2.69 deaths each, the villages end up with about 11 more dead per run, and the typical village survives 10 fewer days. Two villages that held on to day 150 without the lever still hold on with it; one that survived to day 150 without it (107423) is gone by day 131 with it. Nobody wins on either leg, nobody reaches national standing, and the table never offers a seat — the lever moves the death toll, not the outcome. The wall is unchanged: parties go out and get killed, and the extra bodies do not turn into wave-4 kills that matter. The lever stays killed.

Wall numbers (not instrumented where noted, never faked): wins 0/8 both legs; national standing 0/8 both legs (best standing 460, regional, seed 107429 both legs); wave 5 reached on 2/8 ctl villages (107426, 107429) and 1/8 arm villages (107429); table offers / seat-taking not instrumented by this driver.

## Sense test

The departure-beat finding from the re-judge **recurs, on both legs, with identical text** — it is a real, recurring quirk, not lever-caused and not a one-off:

- Seed 107423: "Sean sets out with A person, maybe 40s, with deep-set eyes — the fire marks the trail." (the exact beat from the re-judge, d7)
- Seed 107425 (3 beats): "A person, maybe 40s, with a gap-toothed grin sets out with Lucas…", "A man, maybe 40s, with a scarred cheek sets out with Desmond…", "Owen sets out with A man, maybe 20s, with calloused knuckles…"
- Seed 107429: "DeAndre sets out with A woman, maybe 30s — the fire marks the trail."

Five distinct departure beats across three seeds name a companion by a physical description ("A person, maybe 40s…") instead of a name. Noted here as a separate open finding; not chased — this arm judges the instrument and the dawnchoke verdict only.

## Diagnostic (control leg)

`evidence/2026-11-23/detgate-order-a-diag.json` — ctl leg: 12 attempts, 4 launches, 5 holds, 3 normals; 241 staged days, 208 choke days, choke rate 0.863. Choke is dominated by `party-wait-no-companion` (91 staged days) and `never-scored` (59); by occupation the worst are dockworker (47/47 choke) and taxi_driver (41/41); by profile, foragers choke 139/139. Stuck plans: miguel_santos (107426, 47 staged days, d63–113), visjoin_87 (107428, 7 days), visjoin_108 (107430, 12 days).

## Anchors and reproducibility

- Base master: `80e7da0bcf29d0b5017384ead04cbad652114c5c`.
- Instrument commit (this branch): `3550c154e01f752a0b122a4a7dcab2c604447d12` — order-insensitive analyzer + frozen prereg.
- Ctl anchor: `80e7da0bcf29` (brain `89d73e040fbe`, win-plan `9de1187e731d`).
- Arm anchor: lever commit `5d41e4b92ae173fd94902ba58f98e21611825fe9` (brain `8753dc2d5e65`, win-plan `c32618daf0ef`) — **reverted; the branch was reset to the instrument commit after the arm leg**. Lever held on `sim-dawnchoke-a` (`4ac23b12f`).
- Game sha both legs: `a4ed2a321381`. 0 instrument errors on all 16 runs.
- Substrate (frozen): `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`; `LEND`, `PRESENCE`, `KILLBUNDLE`, `HPGATE`, `PINQUAD`, `HYPOFLOOR` unset; competent policy verbatim; horizon 150d death-aware.
- Band 107423–107430 is a DELIBERATE REPLAY of the dawnchoke re-judge band (same seeds, corrected bound), not a fresh assignment.
- Corpus move note: the driver (`scripts/dawnchoke-driver-a.js`, reused unchanged) hardcodes its output date directory to `evidence/2026-11-22/` (line 1002), so the replay corpora initially landed in `evidence/2026-11-22/perseed-detgate-order-a-{ctl,arm}/` and were moved to `evidence/2026-11-23/perseed-detgate-order-a-{ctl,arm}/` after both legs completed and before analysis. The run logs still record the original `evidence/2026-11-22/` paths; the files themselves are unchanged.
- Judgment: `evidence/2026-11-23/detgate-order-a-judgment.json`. Panel inputs: `evidence/2026-11-23/detgate-order-a-panel-before.json.gz` / `-after.json.gz`; compare output: `evidence/2026-11-23/detgate-order-a-panel.json` / `.md`. Run logs: `evidence/2026-11-23/detgate-order-a-{ctl,arm}-{1,2}.log`.
- Index-clobber note: the `safe-commit.sh` index-clobber (AGENTS.md, 2026-10-22) struck on BOTH commits in this arm (instrument + lever). Both commits were verified correct; the main index was repaired with `git ls-tree HEAD -- <paths> | git update-index --add --index-info` and re-verified (`git status` clean apart from untracked evidence, `git diff HEAD` empty, hash-object == HEAD blob per file).

## Metric review

- Metrics are the frozen prereg §6 bars (re-judge §6 with bar 2 corrected to the order-insensitive comparison); no metric was re-scored or redefined mid-run.
- G1 (bound detector passes 8/8, 0 false divergences from order permutations): MET — first divergence day equals first extra-depart day on all 6 diverging seeds, no divergence on the other 2.
- G2 (re-judge numbers reproduce exactly): MET — attempts 12 → 57, launches 4 → 36, choke 0.863 → 0.792, starvation 5 → 6, median 141 → 131, deaths 91.875 → 102.625.
- G3 (verdict stands: dawnchoke NO-GO, death cost judged): MET — NO-GO via bar 8 alone; the death cost (+10.75/run, 2.69/extra launch) is the judged cost.
- Binding: every evidence claim traces to the judgment JSON, the per-seed corpora, or the panel compare output listed above. No claim rests on a metric outside the frozen set. Wins / national / table are reported from the per-seed records where present and marked not instrumented where the driver does not record them.
- Out of scope, reported not fixed: the physical-description departure beat (sense test above); the driver's hardcoded `evidence/2026-11-22/` output directory (worked around by moving the corpora, not by editing the driver).
