# sim-wideduty-a — WIDEN THE DUTY (Loop A 1015Z arm 2, adopted by Loop A 1315Z, finished by main session)

**Verdict: GO — land.** G1 PASS, G2 PASS, G3 PASS (panel `review_required`,
no `regression_signal`), G4 PASS (proof 7/7). The Haven medic duty counted
only medical occupations; now a villager counts when they can do the job.
Duty-held days rise from 61% to 88% on the confirm band, trained (non-medic)
holders go from 0% to 52% of all duty days, and no village is left with
nobody on duty. Villages live about as long, starvation falls, cures rise
97 → 142. The wall (national / table / wins) is unmoved — this is a
medic-duty fix, not a scale fix.

## The lever

`src/js/game.js` (+66/−20), new `Game.isMedicDutyEligible`: a villager
counts for the duty when they match the occupation regex OR know
`wound_care` / `herbal_medicine` OR hold `triage` / `herbal_remedy` /
`field_medicine`. The holder is wired through both downstream gates:
`villagerCareTick` (duty holder joins the tenders list, tends first, cure
attempt fires) and `campHealerId` (returns the duty holder when present at
that camp). Preference tiers: (0) holds a healing ability, (1) occupation
medic, (2) skill-only trained; stable roster order within tiers. The "no
medic at all" say-line now requires NO eligible villager on the roster.
NOT touched: genRoster/genCharacter, villagerTreatTick,
villagerDiagnosisTick, cure channels.

[needs-eyes]: the camp-healer announcement line now fires for trained
villagers, not only occupation medics.

## Pilot (8 seeds, competent, 150d)

Before: dutyHeld 342/786 = 43.5%, dutyTrained 0, zeroDutySeeds 3/8,
median 97d, starvation 5, cures ability 43 / medicine 0.
After: dutyHeld 656/926 = 70.8%, dutyTrained 349/926 = 37.7%,
zeroDutySeeds 2/8, median 131d, starvation 1, cures 64/0.
Ceiling seeds 96306 + 96308 stayed 0 (no eligible villager ever — that is
the spawn arm's job, not this lever's). G1+G2 PASS; proof 7/7.

## Confirm (12 fresh seeds 96901–96912, 150d, competent, PLENTYDEPRI=1 / DEPOSITGATE=1)

| | Before | After |
|---|---|---|
| dutyHeld | 843/1382 = 61.0% | 1271/1439 = 88.3% |
| dutyTrained (share of duty days) | 0 (0.0%) | 746/1439 = 51.8% |
| zeroDutySeeds | 2/12 (96905, 96910) | 0/12 |
| median survival | 125d | 122d |
| starvation deaths | 2 | 1 |
| duty cures (ability / medicine) | 97 / 0 | 142 / 0 |
| eligible days | 1295/1382 = 93.7% | 1330/1439 = 92.4% |
| WALL national / table / wins | 0/12 / 0 / 0 | 0/12 / 0 / 0 |
| wave-5 reach | 5/12 | 4/12 |

**G1 PASS** (88.3% ≥ 60%; zeroDuty 0 ≤ 2). **G2 PASS** (median 122 ≥
100 = 0.8×125; starvation 1 ≤ 4; no new death mode ≥2).
**VERDICT: GO** (G3 + G4 judged separately below).
Analyzer: `evidence/2026-11-09/wideduty-a-confirm-analyzer.txt` (exit 0).

Per-seed standouts: 96905 0/76 → 127/136 (all trained — the prereg's
clean case, at scale); 96910 0/105 → 67/74 (all trained); 96911 22/130 →
148/150 (trained 148); 96908 12/47 → 82/92; 96902 127/129 → 143/150.

**Confirm-band substitution (recorded in the prereg):** the prereg's
96401–96412 was NOT fresh — 96401–96404 were used by journey-deepening
r116. Replacement 96901–96912 verified fresh (zero hits in any prior
prereg or evidence file; zero in committed preregs via git grep).

**Flap interruptions:** both confirm legs lost a single seed write to the
EPERM write flap (96910 before, 96908 after) and were recovered by
small-batch re-runs after probes cleared; all 12+12 per-seed files
verified valid JSON. The first G3 panel-before run completed into /tmp
and was destroyed by the 14:26Z service restart sweep — panels now write
into the worktree evidence dir, never /tmp.

## G3 — §15 balanced panel (PASS)

Before/after rebuilt on the adopt base (`01540e4c5` — the wideduty adopt
tree's actual HEAD; the sametick adopt tree sits one commit later at
`04d0bac8c`, the two adopt trees were registered at different times):
the adopt tree initially carried a copied panel-before from base
`8cee6a8d2` — it was rebuilt in-tree (lever stashed, panel-before,
lever popped, panel-after) rather than blessed with flags. Both panel
files record sourceHeadStart = sourceHeadEnd = `01540e4c5`, reused 0.
Seed 7 × capable, risk-aware, socialite, winseek × 150d, PLENTYDEPRI=1 /
DEPOSITGATE=1.

Compare: `evidence/2026-11-09/wideduty-a-confirm-panel/compare.md` —
**decision `review_required`, NO `regression_signal`**. All four policy
columns are 1 paired case, every metric `insufficient` — the verdict is
review-required because n=1 per column cannot judge, not because anything
regressed. Deltas are mixed single-seed noise in both directions:
village deaths/run capable 80→74, risk-aware 92→82, socialite 69→82,
winseek 73→77; deaths/100d −6.7 / +20.7 / −13.6 / −1.0 (the per-day
rate moves opposite the absolute count wherever the after-village lived a
different number of days — a denominator artifact, not a lever effect).
Table win/sit rates unchanged (capable 1/1 both legs; 0 elsewhere).
**G3 PASS.**

## G4 — proof (PASS)

`node scripts/test-wideduty-a.js` — **7/7 PASS, 0 FAIL** on the levered
adopt tree (VERDICT GO).

## Gate

`node scripts/check.js --quick` on the levered adopt tree —
**289 passed, 11 failed in 1343s** (log
`evidence/2026-11-09/wideduty-a-gate.log`). Adjudication: 6 exit-1
failures, all pre-existing or expected — the measurement-proof staleness
pair (`test-measurement-proof-update`, `test-measurement-workflow`;
game.js is a manifest input, the retained proof was already stale from
r122 before this lever; the refresh owed after the last src/ landing
covers it) and the 4 standing failures (`test-mobile-combat-cadence`,
`test-occupation-panels`, `test-phone-frame-proof`,
`test-establishment-r20-fixes-20261020`). 5 timeouts at the 120s limit
(`test-trust-observer-neutrality`, `test-synergy-stall`,
`test-throttlefeast-20261014`, `test-capable-bot-20261014`,
`test-table-endings-20261014`) — all documented intermittent load
artifacts; this gate ran concurrently with the sametick adopt gate under
heavy load, so the timeouts are re-run standalone before landing.
Standalone re-runs 2026-11-09 16:23–16:25Z: **all 5 exit 0**
(trust-observer-neutrality 6/6, synergy-stall, throttlefeast,
capable-bot, table-endings) — confirmed load artifacts. (The per-test
rerun logs were written to /tmp and swept by a restart minutes later;
the exit codes + trust 6/6 are recorded here from the run output.)
**No lever-attributable failure. Gate adjudicated GO.**

## Village assessment (plain words)

Before this fix, the duty post sat empty most days unless the village
happened to be born with a nurse or paramedic — and two villages in
twelve never had anyone at all. Now the post is held almost nine days in
ten, and more than half of those days the holder is someone who learned
the work rather than someone born to it: the farmer who knows wound care,
the hunter with the triage knack. The two empty villages now have
someone, and the sick get cured nearly half again as often (97 → 142).
Villages do not live longer or shorter in any way the numbers can tell
apart, and they starve slightly less. Nothing about the big wall moves:
no village reaches National, no seat, no win — the duty keeps people
alive through sickness, it does not open the road to the table. The
medicine channel still never fires in the wild (the Haven pharmacy holds
no doses on any seed — the same gap medicduty left; a seeded-stash run
is still owed). And a village that draws nobody able to do the work at
all still needs the spawn arm; on this band that never happened, but the
pilot showed it can.

## Findings for the backlog

- [needs-eyes] Camp-healer announcement now voices trained villagers.
- Medicine cure channel still unexercised live (0 cures on all 20
  confirm+pilot seeds) — Haven pharmacy empty; seeded-stash measurement
  owed (same gap as medicduty).
- Spawn guarantee remains the ceiling: a village with no eligible
  villager ever still gets no duty holder (medheadcount lever, HELD).
- The `review_required` panel verdict on 1-seed columns is the expected
  shape for a screen; the seed-42 capable death watch from the
  medheadcount panel (59 → 101 deaths) did not reproduce here
  (capable deaths fell 80 → 74).

## Files committed with this evidence

- `evidence/2026-11-09/sim-wideduty-a-prereg.md` (with the confirm-band
  substitution amendment + metric review)
- `src/js/game.js` (the lever; +66/−20)
- `scripts/analyze-wideduty-a.js`, `scripts/sweep-wideduty-a.js`,
  `scripts/test-wideduty-a.js` (new: analyzer, sweep, proof)
- `evidence/2026-11-09/wideduty-a-corpus/` (pilot corpora),
  `wideduty-a-corpus-after/` (pilot after),
  `wideduty-a-confirm-before/` + `wideduty-a-confirm-after/` (12+12
  per-seed files), `wideduty-a-confirm-analyzer.txt`,
  `wideduty-a-pilot-analyzer.txt`
- `evidence/2026-11-09/wideduty-a-confirm-panel/` (panel-before +
  panel-after `panel.json.gz` + `compare.md` + `compare.json`;
  `cases/` caches NOT committed per §15)
- `evidence/2026-11-09/wideduty-a-gate.log` (check.js --quick)
- `evidence/2026-11-09/wideduty-a-equivalence.log` + `wideduty-a-corpus-after-adopt/`
  (adopt-tree equivalence sweep on 96301–96308, 8/8 seeds, levered)
