# Loop B 2030Z round — winnability chain: PARTYSIZE4 re-run GO + allyslot3 NO-GO METRIC-BROKEN

## Round verdict

Two arms, one landed, one held. **Arm 1 sim-partysize4-rerun-b: GO, LANDED** — the PARTYSIZE4 lever code is now on master, env-gated `PARTYSIZE4=1`, default OFF (live play unaffected). **Arm 2 sim-allyslot3-b: NO-GO METRIC-BROKEN, HELD** — the 3rd-ally slot fired once in live play, but the pilot band delivered no pool and the analyzer's join rule is blind to the one fight that happened. Evidence only for arm 2; its lever stays on the branch.

**Run:** `fleshout-loop-b-20261118T2030Z`, axis winnability chain. The scheduled run timed out at 2h; this round evidence was closed out by adoption (arm 2 evidence + round file + gate attribution finished from the committed corpora — no panel re-run).

## Arm 1 — sim-partysize4-rerun-b: GO, LANDED

**Evidence:** `evidence/2026-11-18/sim-partysize4-rerun-b.md` (+ analysis, LAUNCHSURVIVE report, panel, corpora).
**Lever commits on master:** `83db8255f` (partyQuads counter re-land) → `1032897dc` (win-plan half) → `a9a4108fe` (brain half) → `0957053db` (prereg) → `9a4a982ba` (evidence). Env-gated: the third companion launches only when `process.env.PARTYSIZE4 === '1'`; in the browser `process` is undefined, so the gate is false and live play is unchanged.
**Pilot:** launch-rich band 104704–104711, 8 seeds, 150d, competent verbatim. Control launched 29 wave-4+ parties (floor ≥20); arm launched 16 (floor ≥6), of which **11 were quads, every one counted** (`partyQuads` 11/11, ratio 1.00, per-seed exact 8/8); control 0 quads. All 7 frozen bars PASS. Panel decision `review_required` (screen-only); the one `regression_watch` row (village deaths per 100 days) was investigated and cleared as a denominator artifact (deaths per run actually fell 85.5 → 84.625).
**Finding #2557 — ANSWERED as mixed.** The post-quad launch drought is a trajectory-divergence artifact, not a systematic lever cost: seed 104708 refutes it (three quads in 20 days after the first), seed 104711 reproduces it hard (control launched 5 more times, arm never again — the quad holder died in a contest 9 days after the launch). No lever code runs between a launch and the next plan seeding that could block a launch. Follow-up question (not this run's): why arm villages seed fewer launchable plans after a quad on drought seeds (104711: `dawnbidCensus` 64 vs 185; `v4seeds` 22 vs 37) — plan seeding, not launch blocking, is where the gap opens.
**Damage note:** the fourth member still travels but rarely fights — size-4 damage share n=1, mean 0.0099 (finding #2559 stands).

## Arm 2 — sim-allyslot3-b: NO-GO METRIC-BROKEN, HELD

**Evidence:** `evidence/2026-11-18/sim-allyslot3-b.md` (+ analysis, corpora).
**Lever commit:** `ddc7e78ed` [needs-eyes] — HELD on branch `sim-allyslot3-b`, never merged.
**Pilot:** band 104431–104438, 8 seeds, 150d, competent verbatim. Launches 4/4 per leg (floor ≥6); quad launches 1/1 (seed 104437, identical on both legs — a substrate effect). Field-4 denominator 0/0 on both legs, so the primary rate is n/a and the pool floor fails on both clauses. Cost bars all pass (starvation 0 vs 0; median 150d vs 150d; village deaths 646 vs 643); instrument clean (0 errors).
**The one live-fire row:** arm leg, seed 104437, day 133, the Reunion, wave 4 — quad launched day 130 vs the Herald; the party met the Reunion instead, and the third ally fought (`ally3Vid gen_353ni1r`, `ally3Dealt` 23 of 239 total vs 1,322 HP, 7 rounds, vFlee). Control: zero `ally3Vid` rows. The analyzer's field-4 join requires the fight's monster to be the launch target (`e.mid !== l.target` → skip), so this off-target meeting is invisible to the metric. That is the METRIC-BROKEN mechanism (finding #2564).
**Finding #2515 stays open:** the meeting-party 2-ally cap question is unjudged — the slot fires, but at n=1 on an off-target meeting the pilot cannot rate it.

## Wall numbers (pooled per arm band, 8 seeds per leg)

Arm 1 band (104704–104711): wins 0/0, national 0/0, wave-5 3 ctl / 4 arm, wave-4 8/8, standing ≥200 3 ctl / 4 arm, median survival 146.5d ctl / 131d arm, survived 150d 3/3.
Arm 2 band (104431–104438): wins 0/0, national 0/0, wave-5 3/3, wave-4 8/8, standing ≥200 3/3, median survival 150d/150d, survived 150d 5/5.
No village took the full seat or reached national on any leg of either arm. The wall stands where the 1735Z round left it.

## Findings filed this round

- **#2564 (open)** — ALLYSLOT3 join blind to off-target meetings: the field-4 join's `target == mid` rule excludes the one fight where the slot fired. Decision owed for the next run: drop the rule (keep the 21-day window + launch-party membership) or keep it and re-run on a launch-richer band.
- **#2565 (open)** — PARTYSIZE4 LANDED env-gated OFF: the quad lever code is on master behind `PARTYSIZE4=1`; live play unaffected. The turn-on decision is owed (confirm + deliberate call — it changes live behavior).
- **#2566 (open)** — Pool floor set above the measured pool: the allyslot3 prereg set ≥6 launches/leg on a band measured at 4 launched meetings per 8 seeds. The next prereg must set the floor from the band's measured launch rate.
- **#2567 (open)** — 3rd-ally damage unmeasured at n=1: one fight, 23 damage, party fled after 7 rounds. The slot firing does not imply quads win more; the damage share belongs to the fightcap arm.
- **#2557 → [answered] as mixed** (see arm 1 above).

## Gate

`node scripts/check.js --quick` on the rebased tip (branch `sim-allyslot3-b`, base master `1dc8b1641`): **339 passed, 5 failed in 482s**. Gate log: `evidence/2026-11-18/sim-winnability-round-2030-gate.log`. All 5 failures individually adjudicated; **0 attributable to this run** (evidence-only adoption; no game code changed on this branch since the rebase — the only src-adjacent change is the test-partyquads-b.js resolution, which took master's landed copy).

| Failure | Attribution |
| --- | --- |
| `test-measurement-proof-update.js` (exit 1, 3.2s) — "Proof source inputs are not current" | **Standing** — the measurement-proof staleness pair. The retained neutrality proof no longer covers current Game/controller/harness inputs because master moved under it (Loop A landed the ladderbase fix + foodgate evidence since the proof was refreshed). Pre-existing; refresh via `scripts/balance-proof-update.js` is maintenance, not this adoption's scope. |
| `test-measurement-workflow.js` (exit 1, 3.2s) — "retained neutrality proof covers the current Game/controller/harness inputs" | **Standing** — the other half of the same pair (8 passed, 1 failed). Same cause as above. |
| `test-phone-frame-proof.js` (exit 1, 5.4s) — "Phone receipt source is stale or missing: index.html" (3 passed, 3 failed) | **Standing** — phone-frame stale receipt. The retained browser inputs no longer match current source (index.html moved on master). Pre-existing; refresh via `scripts/phone-frame-proof-update.js` is maintenance, not this adoption's scope. |
| `test-living-garden-deed-attainment.js` (exit null, 120.1s timeout) | **Load artifact** — passes solo in 57s (re-run by adoption on this tip). Under the gate's 4-parallel run it hit the 120s cap. Not attributable. |
| `test-one-person-army-deed-attainment.js` (exit null, 120.0s timeout) | **Load artifact** — passes solo in 30s (re-run by adoption on this tip). Same cause. Not attributable. |

**Cleared this run:** the standing ladder-bundle control failure does NOT appear — the Loop A adoption's ladderbase fix (rig un-lingered, regression test landed on master) cleared it. That failure is gone from the standing set as of this gate run.
**Not run:** no cache-flags failure appeared in this gate (no load-artifact attribution needed).
**Proofs on the rebased tip:** `test-allyslot3-b.js` 18/18, `analyze-allyslot3-b.js --selftest` 10/10, `test-partyquads-b.js` 29/29 (0 skipped — the live §5q quad-fire leg now runs since PARTYSIZE4 landed). Analyzer re-run on the rebased tip reproduces the committed analysis byte-identically (verdict NO-GO METRIC-BROKEN).

## Telemetry

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json --current 'perseed-allyslot3-b-arm/*.json' --metrics national,table,wins,exiled` **refused** the input: "refusing recorder-corpus input: all 8 --current rows carry top-level anchorCommit, so they are sweep recorder rows, not runs." Same documented refusal as the 1735Z round and arm 1 of this round; the baseline was **not** rolled. No LOUD line — the check refused the input outright, so there is no deviation to investigate. Wall numbers above are reported from the analyzer instead.

## Tracker

Winnability chain stays converging (NOT converged). Next blanks, in order: (1) allyslot3 re-run — decide the join rule (#2564) first, then a launch-richer band; (2) PARTYSIZE4 turn-on decision (#2565) after a confirm; (3) fourth-seat spoken line (#2558) if the lever turns on; (4) fight-ally cap is the binding question for quad damage (#2559 → fightcap arm); (5) field-engine carrier port (#2552).
