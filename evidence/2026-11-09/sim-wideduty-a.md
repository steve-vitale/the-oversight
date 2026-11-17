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

## GATE — RE-RUN ON THE REBASED TREE (2026-11-09 16:46–16:54Z)

After rebasing onto `0ba20ac1c` (sametick landing) and re-running the
proof test 7/7 green, the full gate was re-run on the rebased tree:
**294 passed, 6 failed in 444s, zero timeouts**
(log `wideduty-a-gate-rebased.log`). The 6 failures are exactly the
standing set: the measurement-proof staleness pair
(game.js is a manifest input; the owed refresh covers it),
mobile-combat-cadence, occupation-panels, phone-frame-proof,
establishment-r20-fixes. All five 120s timeouts from the first gate
passed here (slowest 53s) and standalone — confirmed load artifacts.
**No lever-attributable failure. Gate adjudicated GO on the rebased
tree. Wideduty is ready to land.**

## Adoption verification (2026-11-17, run fleshout-20261117T1015Z)

This file and the corpora it judges were stranded: the Nov 9 run had
finished and committed them (orphaned commits `48c93b22b` — lever +
evidence — and `4c44e35de` — rebased gate adjudication), but the branch
was later reset to base `8cee6a8d2`, leaving only uncommitted residue in
this worktree. This adoption recovered the stranded work from those
commits and re-verified it independently rather than trusting it:

- **Corpora verified, not blessed.** Every per-seed file in
  `wideduty-a-corpus/`, `wideduty-a-corpus-after/`,
  `wideduty-a-confirm-before/`, `wideduty-a-confirm-after/` parses as
  JSON; file counts now match the orphaned commit exactly (17 / 16 /
  16 / 13). Four pilot-after bare files (`wideduty-a-bare-s96305`–
  `s96308`) were missing from the worktree and recovered from
  `48c93b22b`. The tree's `panel-before/panel.json.gz` was the STALE
  base-`8cee6a8d2` copy — replaced with the rebuilt one (sourceHead
  `01540e4c5`, matching panel-after and the G3 account above).
- **Analyzer reproduced exactly.** `analyze-wideduty-a.js --leg` on the
  pilot before corpus gives the prereg baseline (342/786 = 43.5%,
  zeroDutySeeds 3/8, median 97d). `--before/--after` on pilot: GO
  (70.8%, trained 349, zeroDutySeeds 2/8). On the confirm band
  (`WIDEDUTY_SEEDS=96901..96912`): GO (88.3%, trained 746/1439,
  zeroDutySeeds 0/12, median 122d, starvation 1). Both analyzer outputs
  reproduce `wideduty-a-pilot-analyzer.txt` and
  `wideduty-a-confirm-analyzer.txt` byte-for-byte (exit 0).
- **Panel compare verified.** `compare.md` / `compare.json` decision
  `review_required`, no `regression_signal`; all four policy columns 1
  paired case, every metric `insufficient`; both panels share
  sourceHead `01540e4c5`. The `cases/` cache is NOT committed (§15).
- **Proof test adapted, green.** `node scripts/test-wideduty-a.js`:
  **7 PASS, 0 FAIL, 4 SKIP**. Legs L0–L3 (the lever spec) SKIP on this
  tree because the lever is absent — they run again the moment the
  lever is re-ported. L4–L10 prove the measurement: recorder
  neutrality, pilot baseline + verdict, confirm verdict, corpus
  validity, panel compare, byte-exact analyzer reproduction. The
  pre-adoption baseline run of the unadapted test was 3 PASS / 4 FAIL,
  the 4 failures all lever legs (`isMedicDutyEligible` undefined).
- **The lever is NOT in this adoption commit.** This tree's
  `src/js/game.js` is the unlevered base (`isMedicDutyEligible`
  count 0); nothing in this commit changes game behavior, so no
  `[needs-eyes]` flag on this commit — the flag belongs to the lever's
  landing commit. The lever survives as orphaned commit `48c93b22b`
  (game.js +66/−20, proof 7/7 on its levered tree, gate 289/11
  adjudicated GO with no lever-attributable failure). **Landing is the
  coordinator's call:** the prereg orders this arm to land AFTER the
  sibling medheadcount-suite arm, whose lever was HELD
  (`8419eefa4`, NO-GO on landing), and the lever was written against a
  Nov 9 lineage — it needs a re-port onto current master plus a fresh
  gate before it can land. The measurement verdict stands on its own:
  **GO (G1+G2+G3+G4 as measured)**; the landing itself is still owed.
- **Wall numbers (unchanged by this arm):** confirm band national 0/12,
  table 0, wins 0, wave-5 reach 5/12 before → 4/12 after, median
  survival 125d → 122d.
