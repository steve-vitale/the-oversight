# sim-partyform-fix-a — evidence

Run fleshout-20261118T2330Z, Loop A (axis scale-onramp). Branch
`sim-partyform-fix-a`, base master 046ae5859 + substrate cherry-pick
0838e0142 (WILDSEEDPLAN, measurement only — dropped before any
delivery). Worktree `~/workspace/worktrees/sim-partyform-fix-a`.
Prereg: `evidence/2026-11-18/sim-partyform-fix-a-prereg.md` (frozen
2026-11-18, + addendum 1, 2026-11-19). Analyzer:
`scripts/analyze-partyform-fix-a.js` (selftest extended with
live-field and legacy cases). Panel: `scripts/build-partyform-fix-panels-a.js`
→ `evidence/2026-11-18/partyform-fix-a-panel.*`.

RECOVERY NOTE: the arm worker was cancelled by the coordinator
timeout before writing this file. The coordinator wrote it from the
worker's committed prereg/instruments and the uncommitted pilot
corpora + analysis JSON + panel the worker's orphaned sim processes
finished writing (last write 2026-11-19 01:24:51Z). Nothing in the
verdict below is re-scored: the numbers are read straight from
`partyform-fix-a-pilot-analysis.json` against the frozen bars.

## 1. The question

Finding #2547 (four party-formation gates the plan system never
checks — #2560 leaver, #2561 ranger-gated pool, #2562 range-0
holder, #2563 scholar-holder frozen away entry). Phase (a) only:
seed a wave-4 plan only onto a villager who is actually here and is
not the scholar; LEAVE departures and succession delete the plan
(`PARTYFORMFIX=1`, env-gated, default OFF). Does (a) alone lift the
launch-with-party rate to the frozen bar?

## 2. Verdict — NO-GO (pilot, frozen bars)

| Bar | ctl | arm | Requirement | Result |
|---|---|---|---|---|
| Launch-with-party rate (wave-4 seeded) | 0.263 (5/19) | 0.364 (8/22) | arm >= 0.50 AND >= 2x ctl | **FAIL** |
| Pool floor (seeded wave-4 / leg) | 19 | 22 | >= 8 | PASS |
| C1 starvation deaths (band) | 2 | 2 | arm <= ctl + 2 | PASS |
| C2 median survival | 150d | 150d | arm >= 0.8x ctl | PASS (1.00) |
| C3 community loss (seeds) | 1 | 2 | arm <= ctl + 1 | PASS (exactly at the boundary) |
| Instrument errors | 0 | 0 | 0 | PASS |
| Panel (§15) | — | review_required | no regression_signal | **FAIL — one regression_signal (see §5)** |

The fix moves the rate (0.263 → 0.364, +38% relative) but reaches
neither half of the bar: 0.364 < 0.50, and 0.364 < 2 × 0.263 = 0.526.
Per the frozen pilot gate: report NO-GO and STOP. No confirm spend
(confirm bands 104911–104922 untouched, still fresh).

## 3. Pilot attempt 1 — DISCARDED (instrument-broken)

Per prereg addendum 1: the first pilot attempt (104901–104908,
both legs) mislabeled every seed row — the driver read the holder's
plan AFTER `winPlanSeedFromFight` mutated it in place, so creates
and retargets read back inverted. DISCARDED as instrument-broken; it
produced no valid primary measurement. Its corpora are retained under
`perseed-partyform-fix-a-attempt1-{ctl,arm}/` and its re-analysis
under `partyform-fix-a-pilot-attempt1-analysis.json` (METRIC-BROKEN,
pool 0/0, legacy unclassifiable 36 ctl / 43 arm). What survives from
attempt 1 (does not depend on seed classification): the fix's gate
fired — 18 leaver refusals on the arm leg; costs C1–C3 pass;
band-wide first hunts with a party 18 ctl / 26 arm.

The re-run below uses the corrected driver (pre-call snapshot) on
the SAME bands, under the same frozen prereg. Reuse is not
contamination: attempt 1 produced no valid verdict on these seeds.

## 4. The re-run pilot (judged)

Bands 104901–104908, 8 seeds, 150d death-aware, competent policy,
legs differ ONLY by `PARTYFORMFIX` (substrate
`VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 WILDAVOID=1 WILDSEEDPLAN=1`
on both).

| | ctl | arm |
|---|---|---|
| Seeded wave-4 plans | 19 | 22 |
| Launched with party | 5 | 8 |
| Launched solo | 0 | 0 |
| Stalled | 5 | 2 |
| Retargeted | 6 | 4 |
| Deleted | 3 | 8 |
| Fix refusals (scholar / leaver / other) | 0 / 0 / 5 | 0 / 18 / 5 |
| Would-be refused (ctl-equivalent calls) | 20 | 21 |
| Band-wide first hunts with party | 18 | 26 |
| Band-wide first hunts solo | 0 | 0 |

Stall shapes — ctl: range-0-holder 2, leaver 2, scholar-holder 1;
arm: pool-empty 1, range-0-holder 1. The fix's gate fires as
designed (18 leaver refusals, 0 scholar — no scholar-held plans were
seeded on either leg). Deletions dominate the arm leg (8 of 22
seeded plans deleted, reasons incl. holder death) — the plan leaves
the pool by dying, not by stalling.

One quad launch on the arm leg: seed 104902, `visjoin_121` vs the
eulogy, launched day 131 with THREE companions (party of 4:
jovan_milic, gen_y9sagmy, owen_smith). The mechanism works; the rate
does not reach the bar.

## 5. Panel (§15) — review_required, one regression_signal

`partyform-fix-a-panel.md`: decision review_required, 8 paired
cases. Village deaths per run 85.375 → 88.375 (+3, regression_watch);
village deaths per 100 calendar days 57.79 → 62.97 (+5.19, 95%
interval 0.79 to 9.79, **regression_signal**); community loss 0.125
→ 0.25 (regression_watch). Table win rate, national access, table
entry: 0 on both legs, no material signal. Per the prereg the panel
bar is "no regression_signal" — it fails. This is an investigation
note, not a verdict override: the verdict is already NO-GO on the
frozen primary. The death-rate rise is consistent with C3 passing
exactly at its boundary (community loss 1 → 2 seeds) and belongs to
any future re-judge of this lever, not to this pilot's verdict.

## 6. Phase (b) trigger — NOT triggered

Frozen trigger: build (b) ONLY if the pilot arm stages >= 8 seeded
plans AND the launch-with-party rate is below 50% AND pool-empty is
the DOMINANT stall shape (>= 50% of stalled holder-days). The first
two hold (22 seeded, 0.364 < 0.50); the third does not: pool-empty
is 1 of 2 stalled plans on the arm leg — tied with range-0-holder,
not dominant, and the stalled population itself is tiny (2). The
binding shape is deletion/retarget, not an empty companion pool.
Phase (b) (widen `findCompanion` beyond ranger profiles + score the
holder's range at staging) is NOT built. The (b) question stays open
for the diagnosis in §8, not as a triggered build.

## 7. Wall numbers (both legs identical)

nationalStanding 2 / nationalRank 0 / table 0 / wins 0 / wave4 8 /
wave5 2 / median survival 150d. Per-seed: arm seed 104901 standing
705 regional maxWave 5; ctl and arm each lose 1–2 villages
(communityLost ctl 1, arm 2). The wall does not move on this arm.

## 8. Sense test + what stays open

The fix does what it says: leavers no longer hold zombie plans (18
refusals), and a real quad launched with a party of four. But the
launch rate only climbs from about a quarter to about a third of
seeded plans — the seeded plan still mostly dies with its holder or
gets retargeted before it ever hunts. The next question is not the
seed gate (fixed, measurably) but the funnel after seeding: why 8 of
22 arm plans delete, and whether the ranger-gated companion pool
(#2561) or the holder's range (#2562) binds the plans that do
survive to staging. That is a diag question for a later run, on a
fresh band, with the pool floor derived from the measured launch
rate — not a re-run of this pilot.

## 9. Metric review

- The frozen primary was the right metric: it separated the legs
  (0.263 vs 0.364) and the bar was reachable in principle (0.50).
  No revision proposed.
- The (b)-trigger's "dominant stall shape" wording needs a tie rule
  for tiny stalled populations (n=2 here): a 1–1 tie is not
  dominance. Propose for the next prereg: require pool-empty to be
  strictly the plurality AND >= 3 stalled plans before (b) triggers.
- Panel note: the deaths-per-100-days regression_signal fired while
  C1–C3 all passed — the panel and the cost bars measure different
  things (rate vs count). A future prereg should state which one
  binds when they disagree; here it did not matter (primary failed).

## 10. Landing

Lever HELD on branch `sim-partyform-fix-a` (tip 3fbf58be1 + the
evidence commit below), UNMERGED. Evidence-only landing: prereg,
this file, analysis JSON, panel files, pilot corpora (attempt 1 +
re-run). Fix commits (9f68831b1), instruments (452ddf042,
3fbf58be1) and substrate (0838e0142) stay on the held branch. No
push, no bump, no live verification — merged locally, pending ship.
