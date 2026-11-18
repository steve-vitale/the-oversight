# sim-wildavoid-rejudge-a — re-judgment of the wildavoid lever (finding #2506)

**Arm:** sim-wildavoid-rejudge-a, Loop A run fleshout-20261118T1315Z, axis scale-onramp.
**Branch:** `sim-wildavoid-a`, build commit a54c8131e (unchanged — NO src/ changes in this arm; re-judge only).
**Verdict: GO** (re-scoped prereg: GO iff B4 re-scoped && B1 && B2 && B3 && B5 && panel has no `regression_signal`; all pass).
**Prereg:** `evidence/2026-11-18/sim-wildavoid-rejudge-a-prereg.md` (frozen BEFORE any re-judgment analysis).
**Re-judges:** the 1015Z pilot (evidence/2026-11-18/sim-wildavoid-a.md), frozen NO-GO solely on B4 (arm wild Suburb deaths == 0) failing on ONE death.
**Corpora (unchanged, no new sims):** 8 seeds 104411–104418, 150d death-aware, competent verbatim, substrate VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1; `perseed-wildavoid-a-ctl/` and `perseed-wildavoid-a-arm/`.
**Recomputation:** `scripts/rejudge-wildavoid-a.py` — an independent recomputation written from scratch (the outmatched rule re-implemented from the prereg's description), output `evidence/2026-11-18/wildavoid-rejudge-a-analysis.json`. Numbers below are the recomputed ones, not the 1015Z evidence's.

## The lever, in plain words

Same as the 1015Z pilot: when villagers meet a wave-4-or-worse beast out in the world with too small or too poorly geared a party (fewer than 3, or anyone unarmed or unarmored), they step aside instead of fighting — one spoken line, the beast stays in the world, no plan touched. Full geared parties fight exactly as before. Raids at the haven door are exempt. Nothing in the game changed in this arm; only the verdict on the existing pilot corpora was re-judged.

## Recomputed numbers per bar

| Bar | Control | Arm | Threshold | Result |
| --- | --- | --- | --- | --- |
| B1 arm avoids vs ctl would-avoids | 10 would-avoids | 13 avoids (world-tick 9, aid 4) | arm ≥ 50% of ctl | **PASS** (ratio 1.3) |
| B2 wave-4 launch events / instances | 30 / 30 | 30 / 30 | ≥ 90% of ctl | **PASS** |
| B3 wild wave-4+ deaths | 18 | 12 | arm ≤ ctl | **PASS** |
| B3 wild flee damage | 4,288 | 3,552 | arm ≤ ctl | **PASS** |
| B4 (re-scoped) outmatched-Suburb deaths | — | 0 | arm == 0 | **PASS** |
| B4 (re-scoped) outmatched Suburb fought on arm | — | 0 (1 avoided: seed 104414, day 127, duo) | every outmatched meeting avoided | **PASS** |
| B4 context: ctl outmatched Suburb fought / deaths | 1 fought / 0 deaths | — | — | — |
| B4 context: Suburb deaths, all parties | 1 | 1 | — | the 104417 death, verified below |
| B4 context: trick-known seeds | 2 | 2 | arm ≥ ctl − 1 | PASS |
| B5 instrument | 8/8 files, 0 errors, missingHp 0, recMismatch 0, D3 46/46 = 1.0 | 8/8 files, 0 errors, missingHp 0, recMismatch 0, D3 44/44 = 1.0 | see B5 | **PASS** |
| B5 wildAvoids stat == avoids; say lines == avoids | — | 13 == 13; 13 == 13 (0 on ctl) | equal | **PASS** |
| B5 trajectory control | — | all 8 seeds pass (first divergence ≥ first avoid, or identical with no avoid) | pass | **PASS** |
| Panel (§15) | review_required, two `regression_watch` lines, investigated in the 1015Z evidence (denominator effect; single-seed 104416 divergence) | — | no `regression_signal` | **PASS** (no `regression_signal` in `wildavoid-a-panel.md`) |

Per-seed wild deaths (ctl → arm): 104411: 1→1, 104412: 4→2, 104413: 1→1, 104414: 1→1, 104415: 0→0, 104416: 3→4, 104417: 3→2, 104418: 5→1. Per-seed wild flee damage (ctl → arm): 290→290, 1354→1080, 281→281, 208→142, 0→0, 376→156, 939→961, 840→642. Wild wave-4+ meetings: ctl 127, arm 108 (trajectory divergence after the first avoids, not a missed population — the B1 contact precondition, ctl would-avoids ≥ 8, holds at 10).

## The 104417 death — verified from the corpora (not taken on trust)

The single death that froze the 1015Z NO-GO, seed 104417, day 98, aid origin, Suburb:

- **Identical on both legs, field by field:** same day 98, same outcome vDie, same damage taken 17, same party — visjoin_92 + gen_0og0xvr + desmond_clarke — same origin (aid), same wave 4, same mid (suburb). The full `wild` snapshots are byte-identical: partySize 3, sensedSize 3, allArmed true, allArmored true (armorP 8 / 21 / 17), planStage "party", planTarget "eater", isTableVeteran false.
- **Matched, so the rule correctly did not fire:** the outmatched classifier returns false on both legs (party 3, all armed, all armored). The death is outside the lever's scope by construction.
- **Predates any avoid on the seed:** first avoid on seed 104417 is day 141 on the arm leg; first trajectory divergence is day 141 (recomputed from daily fingerprints). The death is 43 days before either.
- **The same seven-meeting chain on both legs:** Suburb meetings on days 94, 95, 96, 96, 96, 97, 98 — identical days, outcomes, and damage on both legs (25, 13, 13, 13, 14, 14, then 17 on day 98). All six pre-death meetings ended vFlee.

## Correction to the 1015Z mechanism story (from the corpora)

The 1015Z evidence described the d94–98 chain as a **pre-learning mauling** ("the village had not yet learned the Suburb's leave-trick, so the trio fought for real each time"). The corpora contradict that: `trickBefore` is **true** on every one of the seven meetings on both legs, and `fleeWise` is true on all of them — the village knew the trick and the trio did the wise round-1 leave each time, yet still took 13–25 damage per meeting and one villager died to a 17-damage hit on day 98. The leave-trick does not make the leave free on the aid path: a round-1 wise leave still costs a hit, and a villager already wounded from earlier meetings can die to it. (For contrast, the one expedition Suburb meeting on this seed, day 47, was trick-unknown, fought 3 rounds, took 55 damage, and fled — a genuinely pre-learning fight.) The verdict-relevant facts are unchanged — the death is matched-party, identical on both legs, and pre-avoid — but the mechanism is a trick-known leave that still costs a hit, not a pre-learning mauling. This is a finding for the coordinator to file (see "Findings updates" below), not a change to the lever.

## D3 note (recomputation difference, not a discrepancy)

My independent D3 counts are ctl 46/46 and arm 44/44 vs the original analyzer's 48/48 and 45/45. The difference is 2 ctl + 1 arm expedition rows whose live gate reason is `seek` (SEEK walk-in, e.g. ctl 104416 day 140 eulogy, ctl/arm 104418 day 99 eulogy). My replica implements only the outmatched rule, so it honestly excludes rows where another gate rule fired; the original replica includes the veteran-guard rule and counts SEEK rows as agreement (replica says no-avoid, live result is 'seek', not 'avoid'). Both give agreement 1.0 with n ≥ 5, so B5 passes under either definition.

## Proof test

- `scripts/test-wildavoid-a.js` re-run on the branch tip: **ALL PASS, 91 assertions** (exit 0; the only "fail" strings in output are the analyzer selftest's expected-failure cases, all marked "selftest ok").
- No check.js run in this arm (no src/ change; the coordinator runs the gate at merge).

## Verdict

**GO.** The wildavoid lever is landable: B4 re-scoped, B1, B2, B3, B5 all pass on recomputed numbers, the 104417 death is verified matched-party / identical / pre-avoid, the panel carries no `regression_signal`, and the proof test is green at 91/91. The branch is left clean and committed; the coordinator merges (this arm does not merge, push, bump, or verify live).

## Wall numbers (unchanged from the 1015Z pilot, both legs)

National standing 3/8, national rank 0, table 0, wins 0, wave-4 unlocked 7/8, wave-5 unlocked 3/8, median survival 132.5 days — identical on both legs. The lever moves wild-meeting survival, not the wall.

## Metric review

- The B4 re-scope worked as intended: it judges what the lever controls (outmatched Suburb meetings) instead of a matched-party death no outmatched-only rule could prevent. The re-scope was frozen before analysis and the corpora support it (arm avoided 1 of 1 outmatched Suburb meetings; 0 outmatched Suburb deaths).
- The 1015Z evidence's "pre-learning mauling" mechanism was wrong on the corpora (trick known throughout the d94–98 chain). Future Suburb bars should not assume trick-known means damage-free on the aid path — the wise leave still costs a hit there.
- B1's ratio above 1.0 (13 avoids vs 10 ctl would-avoids) is the same trajectory-divergence artifact noted in the 1015Z metric review; the bar as written passes with margin and is reported, not hidden.
- The D3 definition difference (SEEK rows counted vs excluded) is immaterial at agreement 1.0 / n ≥ 5, but a future analyzer should state its SEEK handling in the prereg.

## Findings updates (for the coordinator to file — this arm does not edit sim-findings.md)

- **#2506 (wildavoid lever): FIXED on re-judge — GO.** The 1015Z pilot NO-GO is overturned by the frozen re-scoped B4: arm outmatched-Suburb deaths 0, every outmatched Suburb meeting avoided, 104417 death verified matched-party / identical / pre-avoid. The lever (outmatched-avoid on the wild routers, WILDAVOID=1) is landable; branch `sim-wildavoid-a` awaits the coordinator's merge. No confirm spend was run (re-judge only; the pilot band stays 8 seeds).
- **NEW finding (from the 104417 verification): the Suburb's leave-trick does not make the leave free on the aid path.** Trick-known, wise round-1 leaves on aid-origin Suburb meetings still took 13–25 damage each across six meetings (seed 104417, days 94–97), and a wounded villager died to a 17-damage hit on day 98. The 1015Z "pre-learning mauling" story is contradicted by the corpora (`trickBefore` true, `fleeWise` true on all seven meetings). Worth a follow-up: whether the aid path should consult the trick-hold the way the expedition gate does, or whether the leave-hit is intended. (Coordinator: file as a new open finding; the lever itself is unaffected.)

## Files

- Prereg: `evidence/2026-11-18/sim-wildavoid-rejudge-a-prereg.md` (frozen before analysis).
- This evidence file: `evidence/2026-11-18/sim-wildavoid-rejudge-a.md`.
- Independent recomputation: `scripts/rejudge-wildavoid-a.py`, output `evidence/2026-11-18/wildavoid-rejudge-a-analysis.json`.
- No src/ changes. Proof test `scripts/test-wildavoid-a.js` unchanged, re-run green 91/91.
