# sim-planignconfirm-b — CONFIRM NO-GO (2/6 bars)

**Arm:** sim-planignconfirm-b, Loop B run `fleshout-loop-b-20261117T1130Z`,
axis winnability chain, tracker blank #1.
**Base:** branch rebased onto master `3cb0782e5` at arm start (branch had
zero unique commits — clean fast-forward; the pilot's lever commit
`a61f03d22` is on master, env-gated default-OFF). Judged tip
`239ddb02c` (prereg + instrument).
**Prereg:** `evidence/2026-11-17/sim-planignconfirm-b-prereg.md` (frozen,
binding; committed before any judged sim).
**Band:** 103501–103512 (FRESH — verified unused across all prior
preregs and forbidden lists; see prereg), 12 seeds, 150d death-aware,
competent verbatim (sha `df9b7dff4de4`).
**Verdict: CONFIRM NO-GO — Bars 1 (primary) and 2 fail.** The lever
stays env-gated default-OFF; NO src/js change; branch kept as
evidence-only. The pilot's price reproduces on a fresh band, worse:
kills per departure falls further and deaths rise further.

## The question, in plain words

The pilot proved the fix ignites plans — but at a price: more
departures, no more wave-4 kills, +15 deaths a village. This confirm
asked whether the departures the fix enables kill beasts or just
villagers, on villages that never had the defect. Answer: mostly
just villagers. The fix more than doubles departures (142 → 304)
for FEWER wave-4 kills (41 → 35) at +224 deaths.

## Bars (frozen prereg — judged strictly, no re-scoring)

| # | Bar | Result |
|---|---|---|
| 1 | Wave-4 kills per plan departure armed ≥ control | **FAIL** — 0.289 → 0.115 (41/142 → 35/304). Kills per launch 0.394 → 0.150. |
| 2 | Total deaths armed ≤ control × 1.10 | **FAIL** — 870 → 1094 (+25.7%; limit 957). Expedition deaths 169 → 367. |
| 3 | No-plan villages armed 0/12 | **PASS** — 0/12 (control: 4/12). |
| 4 | Wave-5 unlocks armed ≥ control − 1 AND national-by-standing armed ≥ control − 1 | **PASS** — wave-5 6 → 7; national-by-standing (≥300) 3 → 6. |
| 5 | Proof green (`scripts/test-planignconfirm-b.js`) | **PASS** — 53 passed, 0 failed, re-run on the final tip (see Proof). |
| 6 | Balanced panel attached (§15) | **PASS** — `planignconfirm-b-panel.md`, decision `review_required` (deaths regression_signal; see panel note). |

Analyzer: `scripts/analyze-planignconfirm-b.js` exits 1 (bars 1–2 fail,
by design); analysis `evidence/2026-11-17/planignconfirm-b-analysis.json`.

## Before / after on identical seeds (control → armed)

| Seed | Days | K4 | K5 | Creates | Departs | Deaths (exped) | Standing | W5 |
|---|---|---|---|---|---|---|---|---|
| 103501 | 150 → 150 | 3 → 3 | 0 → 0 | 4 → 4 | 25 → 25 | 61 → 61 (13) | 270 → 270 | ✓ → ✓ |
| 103502 | 149 → 151 | 7 → 7 | 0 → 1 | 9 → 6 | 39 → 36 | 122 → 122 (51 → 40) | 199 → 375 | ✗ → ✓ |
| 103503 | 151 → 151 | 3 → 0 | 0 → 0 | 3 → 3 | 10 → 17 | 66 → 43 (5 → 20) | 199 → 100 | ✗ → ✗ |
| 103504 | 87 → 151 | 0 → 2 | 0 → 1 | 9 → 10 | 13 → 42 | 58 → 128 (19 → 49) | 150 → 300 | ✗ → ✓ |
| 103505 | 134 → 151 | 3 → 9 | 0 → 0 | 7 → 7 | 27 → 57 | 97 → 159 (34 → 89) | 225 → 475 | ✓ → ✓ |
| 103506 | 151 → 151 | 3 → 5 | 0 → 0 | 0 → 5 | 0 → 32 | 55 → 116 (0 → 45) | 290 → 199 | ✓ → ✗ |
| 103507 | 89 → 54 | 0 → 0 | 0 → 0 | 0 → 2 | 0 → 9 | 40 → 50 (0 → 8) | 99 → 120 | ✗ → ✗ |
| 103508 | 117 → 151 | 1 → 1 | 0 → 0 | 6 → 7 | 10 → 28 | 55 → 85 (10 → 26) | 195 → 175 | ✗ → ✗ |
| 103509 | 152 → 152 | 4 → 2 | 0 → 0 | 0 → 3 | 0 → 10 | 63 → 86 (0 → 24) | 355 → 385 | ✓ → ✓ |
| 103510 | 151 → 151 | 9 → 2 | 1 → 1 | 3 → 4 | 5 → 17 | 93 → 68 (8 → 14) | 600 → 305 | ✓ → ✓ |
| 103511 | 151 → 151 | 3 → 1 | 0 → 0 | 0 → 2 | 0 → 10 | 59 → 63 (0 → 5) | 199 → 150 | ✗ → ✗ |
| 103512 | 150 → 146 | 5 → 3 | 0 → 3 | 4 → 5 | 13 → 21 | 101 → 113 (29 → 34) | 415 → 395 | ✓ → ✓ |
| **Panel** | | **41 → 35** | **1 → 6** | **45 → 58** | **142 → 304** | **870 → 1094** | | **6 → 7** |

Call-outcome distribution: control `{engagement-fail: 110, created:
36, plan-exists: 275, unexplained-call: 1021}`; armed
`{engagement-fail: 110, created: 46, plan-exists: 680}` — the
unexplained-call outcome is gone entirely (1021 → 0), engagement-fail
identical (110), and `plan-exists` more than doubles. Creates rise
only 45 → 58 while departures rise 142 → 304: the fix's main effect
is not more plans but more DEPARTURES per plan — plans persist and
re-launch, again and again.

## Wall numbers (every run)

| | Control | Armed |
|---|---|---|
| National by standing (≥300) | 3/12 | 6/12 |
| National by rank | 0/12 | 0/12 |
| Table | 0 | 0 |
| Wins | 0 | 0 |
| Wave-4 unlocked | 11/12 | 12/12 |
| Wave-5 unlocked | 6/12 | 7/12 |
| Median survival | 150d | 151d |
| Wave-4 kills | 41 | 35 |
| Wave-5 kills | 1 | 6 |
| Total deaths | 870 | 1094 |

## The price, named

The death-cause split names the mechanism, same as the pilot:
**expedition deaths 169 → 367 (+198 of the +224 total)** while
`villager combat` is flat (423 → 413) and starvation falls (5 → 2).
`combat` rises 120 → 172 (+52). The fix sends villagers out hunting
and the hunting kills them — at roughly one expedition death per
extra departure — without buying wave-4 kills (41 → 35). The one
counter-note: wave-5 kills rise 1 → 6 (seeds 103502, 103504, 103512
each gain one), so the extra departures do occasionally kill a
wave-5 beast — but Bar 1 is frozen on wave-4 kills per departure,
and no re-scoring against the friendlier wave-5 number is allowed.
The wall passing (wave-5 6 → 7, national 3 → 6) does not rescue the
verdict either: the primary bar is the judge, and it fails by a
factor of 2.5.

The lever does not just add departures on top of the old game — it
reshuffles trajectories. Seed 103501 is bit-identical both legs (the
store was already initialized by other means there; PLANFIX is a
no-op). Seed 103502 has identical deaths (122) but standing 199 →
375 and wave-5 unlocked. Seed 103510 has FEWER deaths armed (93 →
68) but wave-4 kills collapse 9 → 2 and standing halves 600 → 305.
Seed 103506 is the sharpest harm: control reached wave 5 with zero
departures; armed loses the wave-5 unlock (maxWave 5 → 4) while
deaths double (55 → 116). Seed 103507 dies day 54 armed vs day 89
control — the fix's departures hasten the collapse.

## Sense-testing (read the per-village rows as stories)

The ignition reads sensibly. First creations fall on days 5–11 on
every armed seed, the day after the village's first slaying: a
ranger at Haven who heard the fire talk starts a plan. Seed 103506
day 8–9 is the clearest story: three creations in two days, all
`heard`, all target null, launching the next day as pairs —
Katarina and Wanjiru going out together, neither having killed
anything, hunting no particular beast.

Two wrinkles, both named, and both worse than the pilot's:

1. **Launches go out targetless and green — proportionally worse
   armed.** Departures carrying a killer: control 29/142 (20.4%),
   armed 61/304 (20.1%) — flat. Departures carrying a target:
   control 10/142 (7.0%), armed 9/304 (3.0%) — the extra departures
   are even more targetless than control's. Launches with a target:
   5/104 (4.8%) → 6/234 (2.6%). The fix does not send hunters after
   beasts; it sends pairs of villagers who have never killed
   anything out to wander, and the wandering kills them.
2. **A day-6 burst, again.** Seed 103504 creates four plans on day
   6 (and 103506 three across days 8–9). Every heard ranger at
   Haven ignites at once rather than one sparking and the rest
   following — plausible for a village hearing the same fire talk,
   but it means ignition arrives as a burst, and the burst launches
   the same day as pairs.

No village ignited for a villager with no business hunting: every
sampled creation is a ranger at Haven with heard (or lived)
engagement recorded. The narration matches: the fire talk on day 5
("Mabel, Amy, Alper, Fainche and Fatima met them at the door — 4
put down") precedes the day-8 plans on 103506, and the day-35
veteran-kill broadcast on 103504 ("Daniel just put down The Big
Beast... on CAMERA. That's a veteran kill, folks. REMEMBER the
name.") follows the day-6 burst.

## Panel note (§15)

`planignconfirm-b-panel.md`, decision `review_required` on exactly
the deaths signal: villageDeaths **+18.67 per run (95%
exploratory interval 2–36.5)** and per 100 days **+11.94 (CI
0.24–23.09)**; survival60 a regression_watch (−0.083, CI
[−0.25, 0]). Every other panel metric is `no_material_signal`,
`descriptive`, or `not_observed`; table win 0 → 0, national scale
access 0 → 0. The panel agrees with the frozen bars; per prereg a
secondary-metric signal is an investigation note, not a re-score.

## Metric review (prereg questions, answered)

- **Did kills per departure hold, or did the fresh band reproduce
  the pilot's fall?** Reproduced, worse: 0.289 → 0.115 on a fresh
  band (pilot 0.363 → 0.160). The fall is not a pilot-band artifact.
- **Did the deaths bar bind (total deaths), or did the cost move to
  a cause the bar does not see?** The bar bound: +25.7% vs a 10%
  allowance, and the full death-cause split shows the cost is
  expedition deaths (+198) plus combat (+52) — the bar sees the
  mechanism, not just the total.
- **Did ignition hold on a fresh band (0/12 no-plan), or does the
  fix only ignite villages that already had the defect?** Held:
  0/12 armed vs 4/12 control. The defect reproduces on the fresh
  band (103506, 103507, 103509, 103511 never start a plan
  unflagged) and the fix cures it everywhere.
- **Did the wall move, and is the move inside the noise the base
  itself generates?** The wall moved FAVORABLY armed (wave-5 6 →
  7, national 3 → 6) — but the pilot's base-drift caution cuts both
  ways: at n=12 a ±1 wave-5 move is inside noise, and the national
  move rides on standing reshuffles (103502: 199 → 375 with
  identical deaths). The wall pass does not overturn the primary
  failure.
- **Was 150d the right horizon, or did armed kills cluster at the
  tail?** Right: first creations cluster days 5–11, none at the
  tail; wave-4 kills are spread across the run, not back-loaded.

## Base drift note

The judged control is a re-run on this tip (`239ddb02c`), not the
pilot's corpus. The fresh band's control reproduces the defect
(4/12 no-plan) at a higher rate than the pilot band's control
(4/8) — the catch-22 is not a pilot-band quirk. Seed 103501's
bit-identical trajectories both legs are a useful control on the
instrument: where the store was already initialized, the flag
changes nothing, exactly as designed.

## Proof

`scripts/test-planignconfirm-b.js`: **53 passed, 0 failed** on the
judged tip `239ddb02c`, re-run on the final tip after the evidence
commit (same count). Static off-mode checks (empty src diff, flag
read in exactly one place) + live unit (off: uninitialized store
returns null even when engaged; on: store initialized + plan
created) + live geared fight (encounter gear: a geared ranger with
two geared allies + geared scholar — the ignition observable out of
real play) + D1 (repeatability, recorder ON twice, armed 150d seed
103501) + D2 (wrap neutrality, recorder ON vs OFF, armed 150d seed
103501) + D3 (drift: confirm-driver control vs pilot-driver
control, same seed 102601 150d, identical trajectory fingerprints).

`node scripts/check.js --quick` was NOT run: this arm changes no
`src/` file (the lever is already on master, env-gated), so there
is no new code for the green list to judge; the proof test is the
gate, and it is green on the final tip.

## Findings backlog

Appended to `hidden_files/sim-findings.md`:

- The fix's main effect is departures-per-plan, not plans: creates
  45 → 58 (+13) while departs 142 → 304 (+162). Plans persist and
  re-launch; the launch decision, not ignition, is now the binding
  question for the winnability chain. (This arm's evidence.)
- Armed launches are proportionally MORE targetless than control's
  (target 7.0% → 3.0% of departs): ignition without a target sends
  green pairs wandering. A follow-up arm needs a target/killer
  requirement on launches, or the plan system keeps converting
  ignition into expedition deaths. (This arm's evidence.)
- Seed 103506: a village that reached wave 5 with zero departures
  LOSES the wave-5 unlock under the fix while deaths double —
  ignition can actively harm a village's progression, not just fail
  to help it. (This arm's evidence.)

## Closeout

- CONFIRM NO-GO: lever stays env-gated default-OFF
  (`src/js/win-plan.js` untouched by this arm — `git diff
  master...HEAD -- src/` empty).
- Corpora: `evidence/2026-11-17/perseed-planignconfirm-b-{control,armed}/`
  (12/12 files each), analysis `planignconfirm-b-analysis.json`,
  panel `planignconfirm-b-panel.{json,md}` (+ `.gz` pair).
- No version bump, no push, no live check (ship loop owns those).
  Branch kept as evidence-only, ready for coordinator closeout.
- NOTE FOR COORDINATOR: no merge hazard — this branch carries no
  src change. The next arm on this axis should attack the LAUNCH
  decision (target/killer requirements), not ignition: ignition is
  proven twice over and is no longer the binding constraint.
  The tracker blank #1 (planignite-fix CONFIRM) is now answered:
  NO-GO.
