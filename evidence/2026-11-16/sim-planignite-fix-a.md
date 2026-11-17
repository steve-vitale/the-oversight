# sim-planignite-fix-a — PILOT GO (8/8 bars)

**Arm:** sim-planignite-fix-a, Loop A run `fleshout-20261117T0915Z`, adopting dead run
`fleshout-20261117T0015Z`, axis winnability chain.
**Base:** rebased onto master `b4cdf252d` at arm start; branch tip after rebase
`745bff15d` (rebase clean, no conflicts, no sequencer quirk). Lever commit
`9bea2c868`, proof commit `745bff15d` (D3 env hygiene).
**Prereg:** `evidence/2026-11-16/sim-planignite-fix-a-prereg.md` (frozen, binding).
**Band:** 102601–102608 (REUSED per prereg — the DIAG's own band), 8 seeds,
150d death-aware, competent verbatim (sha `df9b7dff4de4`).
**Verdict: PILOT GO — all 8 frozen bars hold.** The lever stays env-gated
default-OFF on the branch for the confirm; no default flipped.

## The question, in plain words

The plan system only switched on after villagers had already done the thing
plans were meant to cause (a wave-3+ seed or an agency kill). Two villages in
eight heard monsters from day 5, slew beasts, survived 150 days at regional
standing, and never once started a plan — because the plan store never
existed and the daily Haven check returned before it ever looked at
engagement. This arm tests the minimal fix: let the first HavenTick
initialize the store, so a ranger at Haven who has heard the fire talk about
a slain beast can start thinking in gameplan terms.

## The lever (frozen design, kept)

In `src/js/win-plan.js`, `winPlanHavenTick` only: when `v.winPlan` is absent
AND `PLANFIX=1`, initialize the store via the existing `stateOf(this)`, then
proceed through the existing engagement / profile / Haven checks unchanged.
Flag unset = byte-for-byte old behavior. No threshold, gate, or price moves;
no new seeding path. Canon gap (recorded in the prereg, not invented): no
CANON-registered doc covers plan ignition or the winPlan store.

## Bars (frozen prereg — judged strictly, no re-scoring)

| # | Bar | Result |
|---|---|---|
| 1 | Plans created > 0 on BOTH 102601 and 102607 armed | **PASS** — 102601: 8, 102607: 7 |
| 2 | No-plan rate 0/8 armed | **PASS** — 0/8 (control on this tip: 4/8) |
| 3 | Store-never-initialized row 0 villages armed | **PASS** — 0 (control: 4) |
| 4 | Unexplained havenTick calls armed < 10% of control | **PASS** — 0 vs 920 (0%) |
| 5 | Cost bars: starvation armed ≤ control + 2; median survival armed ≥ 0.8× control | **PASS** — starvation 2 ≤ 3; median 151d = 151d |
| 6 | Proof green (`scripts/test-planignite-fix-a.js`) | **PASS** — 47 passed, 0 failed, re-run on the rebased tip |
| 7 | Balanced panel attached (§15) | **PASS** — `planignite-fix-a-panel.md`, decision `review_required` (see investigation note below; per prereg a secondary-metric signal is not a re-score) |
| 8 | Instrument holds both legs | **PASS** — 8/8 files per leg, 0 tick-gate mismatches, 0 holders without a creation, 0 initializer disagreements |

Analyzer: `scripts/analyze-planignite-fix-a.js` exits 0; analysis
`evidence/2026-11-16/planignite-fix-a-analysis.json`.

## Before / after on identical seeds (control → armed)

| Seed | Days | Creates | Departs | First creation | Unexplained calls | Starvation | Standing |
|---|---|---|---|---|---|---|---|
| 102601 | 150 → 150 | 8 → 8 | 37 → 31 | day 7 | 69 → 0 | 0 → 1 | 410 → 640 |
| 102602 | 150 → 150 | 3 → 5 | 19 → 18 | day 6 | 2 → 0 | 0 → 0 | 395 → 695 |
| 102603 | 150 → 150 | 0 → 2 | 0 → 6 | day 9 | 120 → 0 | 0 → 0 | 420 → 199 |
| 102604 | 150 → 120 | 5 → 6 | 15 → 27 | day 6 | 45 → 0 | 1 → 1 | 199 → 199 |
| 102605 | 147 → 150 | 0 → 7 | 0 → 27 | day 8 | 240 → 0 | 0 → 0 | 330 → 415 |
| 102606 | 150 → 150 | 0 → 8 | 0 → 36 | day 6 | 280 → 0 | 0 → 0 | 350 → 199 |
| 102607 | 142 → 120 | 0 → 7 | 0 → 14 | day 8 | 105 → 0 | 0 → 0 | 495 → 199 |
| 102608 | 130 → 150 | 4 → 5 | 20 → 22 | day 6 | 59 → 0 | 0 → 0 | 199 → 199 |
| **Panel** | | **20 → 48** | **91 → 181** | | **920 → 0** | **1 → 2** | |

Call-outcome distribution (the guard moved, it did not relocate):
control `{engagement-fail: 88, unexplained-call: 920, created: 16, plan-exists: 175}`;
armed `{engagement-fail: 88, created: 39, plan-exists: 419}` — the
unexplained-call outcome is gone entirely, engagement-fail identical (88),
and `plan-exists` more than doubles as plans persist.

## Wall numbers (every run)

| | Control | Armed |
|---|---|---|
| National by standing (≥300) | 6/8 | 3/8 |
| National by rank | 0/8 | 0/8 |
| Table | 0 | 0 |
| Wins | 0 | 0 |
| Wave-4 unlocked | 8/8 | 8/8 |
| Wave-5 unlocked | 6/8 | 3/8 |
| Median survival | 151d | 151d |
| Wave-4 kills (killCalls wave 4) | 33 | 29 |
| Wave-5 kills | 8 | 7 |
| Total deaths | 678 | 797 |

## Sense-testing (read the per-village rows as stories)

The ignition reads sensibly. On every armed seed the first creation falls
on day 6–9, the day after the village's first slaying (firstSlainDay 5–8 in
the DIAG): a ranger standing at Haven who heard the fire talk about a slain
beast (`source: "heard"`, `slainN: 1`, `foughtN: 0`) starts a plan and
launches within a day or two, in a pair. Seed 102606 day 6 is the clearest
story: five creations in one day, all `wanderer` rangers at Haven, all from
heard knowledge of the day-5 slaying, launching the next day as pairs.

Two wrinkles, both named, neither a bar:

1. **Launches go out targetless and green.** Departures carry
   `target: null, targetWave: null, partyKillers: 0, partyArmed: 0–1` —
   pairs of villagers who have never killed anything, hunting no particular
   beast. That is the plan system as built, not a fix artifact, but it is
   the shape behind the death cost below.
2. **A day-6 burst.** 102606 creates five plans on one day (and 102605
   four on day 8). Every heard ranger at Haven ignites at once rather than
   one sparking and the rest following — plausible for a village hearing the
   same fire talk, but it means ignition arrives as a burst, not a trickle.

No village ignited for a villager with no business hunting: every sampled
creation is a ranger at Haven with heard (or lived) engagement recorded.

## The price (panel investigation note — NOT a re-score)

The balanced panel decision is `review_required` on exactly one metric:
village deaths **84.75 → 99.625 per run (+14.875, 95% exploratory interval
4.125–24.375)** and per 100 days **57.9 → 70.5 (+12.57, CI 4.85–19.50)**.
Every other panel metric is `no_material_signal`, `descriptive`, or
`not_observed`; table win 0 → 0, national scale access 0 → 0.

The death-cause split names the mechanism: **expedition deaths 113 → 280
(+167)** while `villager combat` is flat (303 → 306) and `combat` falls
(140 → 107). The fix sends villagers out hunting (departures 91 → 181)
and the hunting kills them — at roughly one expedition death per extra
departure — **without buying kills: wave-4 kills 33 → 29, wave-5 kills
8 → 7.** The extra departures do not convert into dead beasts.

The same cost shows in the wall: standing ends pinned at the 199 floor on
5 armed seeds vs 2 control, national-by-standing 6 → 3, wave-5 unlocks
6 → 3. Two cautions before attributing the wave-5 drop to the lever:
(a) base drift alone moved wave-5 4 → 6 between the DIAG control and this
tip's re-run control, a swing the same size as control → armed (6 → 3),
so at n=8 the wave-5 move is inside the noise the base itself generates;
(b) the death mechanism gives a plausible causal path (dead villagers do
no deeds), so the drop is consistent with the lever but not proven by it.
The death signal itself, by contrast, has a CI that excludes zero and a
named mechanism — it is real, and it is the lever's.

**What this means for the confirm:** ignition is proven; the open question
is no longer "do plans start" but "do the departures the fix enables kill
beasts or just villagers." A confirm that only re-measures ignition would
rubber-stamp a lever that doubles departures for zero extra wave-4 kills
at +15 deaths a village. The confirm (or a follow-up arm) must carry a
kills-per-departure bar — e.g. wave-4 kills per plan departure — and watch
whether launched parties ever carry a killer or a target. The lever is
kept env-gated default-OFF, so nothing in live play changes until that
question is answered.

## Metric review (prereg questions, answered)

- **Did the fix ignite plans that then did nothing?** No — the opposite.
  Creates 20 → 48 and departs 91 → 181: ignition converts into pursuit on
  every seed (worst ratio 102602: 5 creates → 18 departs). The hollow-win
  shape does not appear.
- **Did the store-never-initialized row classify every armed no-plan
  village?** Vacuously yes — there are no armed no-plan villages, and the
  row is 0 armed vs 4 control. The row works as a taxonomy: it fires
  exactly on the control villages that never ignite.
- **Did unexplained havenTick calls collapse, or did the guard move?**
  Collapsed to zero (920 → 0); the full call-outcome distribution above
  shows no new unexplained outcome anywhere — engagement-fail is
  unchanged and `plan-exists` absorbs the rest.
- **Was 150d the right horizon?** Yes — first creations cluster days 6–9,
  not at the tail; a shorter horizon would have caught the same effect.
- **Did the cost bars bind?** The frozen bars (starvation, median
  survival) did not bind — both pass easily. The cost that actually bit
  was total deaths, which the prereg did not bar. That is a prereg gap to
  fix for the confirm: bar deaths, not just starvation.

## Base drift note (why the judged control is a re-run, not the DIAG)

The DIAG control (base `7bb50f3dc`) had no-plan 2/8 and 33 creates; this
tip's re-run control has no-plan **4/8** and 20 creates — the defect got
worse on the new base, and the no-plan villages moved (102601 ignites on
this tip; 102603/102605/102606 join 102607 as no-plan). The prereg's rule
held: the judge is the re-run control on this tip, the DIAG corpus a
cross-check only. The dead run's partial corpora (seed 102601 only, run on
the pre-rebase base) survive as
`perseed-planignite-fix-a-{control,armed}-oldbase/` — reference only, not
the judge, not re-run.

## Proof

`scripts/test-planignite-fix-a.js`: **47 passed, 0 failed** on the rebased
tip `745bff15d` (static off-mode checks + live unit + live geared fight +
D1 repeatability + D2 wrap neutrality + D3 drift vs the DIAG driver).
`node scripts/check.js --quick`: **333 passed, 7 failed** (803s at the default
120s timeout; re-run at 300s timeout: same 333/7 in 1303s). **0 failures
attributable to this arm** — verified against a clean master baseline
(`7328a88fa`, no lever), where the same four fail identically:
`test-measurement-proof-update.js` + `test-measurement-workflow.js` (the
retained neutral panel `neutral-r211-rebased` predates master — its recorded
`src/js/game.js` / `index.html` / `src/js/win-plan.js` hashes match neither
master nor this branch, so the neutrality proof was already stale on master);
`test-phone-frame-proof.js` (stale phone receipt for `index.html`, untouched
by this arm); `test-ladder-bundle-20261108.js` (one control assertion: 200
monster turns without delivery fire the ambient raid — fires 0; no winPlan /
PLANFIX reference in the test, `overtimeScaleFight` lives in
`src/js/overtime.js`). The other three are load artifacts under the day's
box load (load 12–17, sibling sims): two deed-attainment tests time out at
both 120s and 300s, and `test-measurement-cache-flags.js` fails the panel-
completion sub-check — the documented box-load artifact (AGENTS.md
2026-11-12). Note the r211 adoption recorded checkquick 336/4 (0
attributable); the count moves run to run with load. The lever itself is
env-gated OFF during check.js (`PLANFIX` unset), so its code path is the
old guard.

## Instrument footnote

The `igniteVillage` daily census undercounts `v4creates` by 1 on several
seeds (102601: 7 vs 8; 102605: 2 vs 7 — the gap is creations via
`winPlanOf`, which the village-row census does not count). The analyzer
judges on `v4creates`, so no bar is affected; the census is a secondary
view, not the ledger.

## Findings backlog

Nothing appended: every observation above is inside this arm (the lever's
ignition, its death cost, the confirm's kills-per-departure question).
No out-of-arm item surfaced.

## Closeout

- PILOT GO: lever kept env-gated default-OFF (`src/js/win-plan.js` only).
- Corpora: `evidence/2026-11-16/perseed-planignite-fix-a-{control,armed}/`
  (8/8 files each), analysis `planignite-fix-a-analysis.json`, panel
  `planignite-fix-a-panel.{json,md}` (+ `.gz` pair). Old-base partial
  corpora archived as `-oldbase/`.
- No version bump, no push, no live check (ship loop owns those).
  Ready to merge, pending coordinator landing.
- NOTE FOR COORDINATOR: master has moved since this arm's rebase
  (`b4cdf252d` → `7328a88fa`, journey-succession r230 landed mid-run), so
  the branch is no longer ff-mergeable as-is — rebase onto the new tip and
  re-run `scripts/test-planignite-fix-a.js` before landing, per the usual
  adoption pattern. The judged sweep stands as run on tip `745bff15d`;
  a rebase replays the same three commits and should not change behavior,
  but the proof is the check, not the assumption.
