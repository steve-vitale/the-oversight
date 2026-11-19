# sim-partysize4-confirm-b — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-partysize4-confirm-b · **Loop B run:** fleshout-loop-b-20261118T2330Z
**Type:** MEASUREMENT CONFIRM — 12–16 seed confirm of the PARTYSIZE4
lever (4th companion seat on wave-4+ hunt plans) to support the
turn-on decision (finding #2565). The lever is ALREADY ON MASTER,
env-gated (`PARTYSIZE4=1`, default OFF, `src/js/villager-brain.js:258`)
— no game-code change is expected from this arm; this is a
measurement confirm.
**Frozen:** 2026-11-19 ~00:30 UTC, before the judged panel sweep.
The freeze binds the metrics, thresholds, band, and policies below
— a miss is NO-GO, never re-scored mid-run (§14).
**Branch tip:** `sim-partysize4-confirm-b` at `046ae5859` (master,
batch-ship version bump ac1b82736-20261118-232437).
**Base:** master `046ae5859`, which contains the lever commits
`1032897dc` (win-plan half) + `a9a4108fe` (brain half) and the
partyQuads counter re-land `83db8255f`.
**Builds on:** `evidence/2026-11-18/sim-partysize4-rerun-b.md`
(pilot GO: arm 11/11 quads counted, ratio 1.00, per-seed exact 8/8,
ctl 29 launches / arm 16 on band 104704–104711, 150d) and its frozen
prereg `sim-partysize4-rerun-b-prereg.md`; findings #2557 (post-quad
launch drought — answered as mixed), #2558 (fourth-seat spoken
line — still open, NOT this arm), #2559 (quad fights cap at the
usual ally count — stands), #2565 (turn-on decision — this confirm
supports it), #2566 (never a blind floor — this run's method).

## Why this confirm, and what is different

The rerun pilot proved quad formation + counting on a second band
(11/11 quads, 8/8 per-seed exact), but on 8 seeds only. A turn-on
decision wants the wider band: 16 seeds, same 150d horizon, same
competent policy, same substrate. The pilot's one open thread is
the #2557 follow-up: on drought seeds the arm leg seeds fewer
wave-4 plans after a quad (104711: `v4seeds` 22 arm vs 37 ctl;
`dawnbidCensus` 64 vs 185) — the gap opens at plan SEEDING, not at
launch. This confirm instruments that follow-up as a reported
secondary (see below).

## Band choice — measured, not guessed (finding #2566)

Band **104730–104745** (16 seeds), FRESH for the PARTYSIZE4 lever:
no dated prereg names any seed in 104730–104745 (grep over
`evidence/*/sim-*-prereg.md` — the only `104730` hits in evidence
are hex-digest substrings in old panel case files, not seed
numbers); not on any forbidden/contaminated list (9700–9711,
9930–9941, 73601–73608, 74201–74208). The band was surveyed with
a control-only quick pass on THIS master anchor BEFORE the freeze
(see Survey below) — the floor is derived from that measured rate,
never from a stale anchor (the rerun's metric review: measured
launch rates do not transfer across master moves).

## Survey — control-only pass on this anchor (pre-freeze)

Run BEFORE the freeze, control leg only (PARTYSIZE4 unset,
substrate VETREENGAGE=1 + FLEEREPAIR2=1, LAUNCHSURVIVE=1, 150d,
competent verbatim), corpus
`evidence/2026-11-18/perseed-partysize4-confirm-b-survey-ctl/`:

| Seed | Ctl w4+ launches | Standing / days |
| --- | --- | --- |
| 104730 | 0 | 125 / 114d lost |
| 104731 | 0 | 125 / 67d lost |
| 104732 | 2 | 199 / 151d |
| 104733 | 19 | 535 / 151d |
| 104734 | 0 | 350 / 146d lost |
| 104735 | 0 | 175 / 110d lost |
| 104736 | 0 | 199 / 109d lost |
| 104737 | 0 | 220 / 151d |
| 104738 | 0 | 465 / 151d |
| 104739 | 0 | 175 / 151d |
| 104740 | 0 | 350 / 151d |
| 104741 | 0 | 199 / 150d |
| 104742 | 12 | 275 / 151d |
| 104743 | 5 | 199 / 95d lost |
| 104744 | 2 | 325 / 150d |
| 104745 | 0 | 100 / 150d |
| **TOTAL** | **40** | median survival 150d; 0 wins; 0 national |

The band is launch-SKEWED, recorded honestly before the freeze:
11 of 16 seeds launch zero wave-4+ parties; two rich seeds carry
31 of the 40 launches (104733: 19, 104742: 12). The zero seeds
are not dead villages — 104734 seeds 11 wave-4 plans (strike,
audit, eater, congregation, eulogy) and reaches maxWave 5 at
standing 350, yet launches no wave-4+ party: its plans seed but
never convert to a wave-4 depart. That non-conversion on
launch-poor seeds is itself a finding for the backlog (see
evidence file), not a reason to scrub the band — the window was
NOT scrubbed of zeros, and the pool floor below is derived from
the measured total including them.

**Floor derivation (from the measured total above):** control-leg
pool floor = max(12, 40% of measured control total, rounded down);
arm-leg floor = 12 launches (absolute, same order as the pilot's
6-on-8 scaled to 16 seeds); ≥1 observed arm quad. The floor is
the pilot's method (haircut on a measured rate), not a blind
number. The band is usable when (a) the survey stages a real pool
(measured total ≥ the derived floor by construction — the floor's
job is band validation, which the survey itself answers), and
(b) the arm leg can plausibly clear its absolute floor: the
pilot's arm/ctl launch ratio was 16/29 ≈ 0.55, so expected arm
launches ≈ 0.55 × measured total; the band proceeds only if that
expectation is ≥ 12. A measured total below ~22 would fail (b)
and the band would be abandoned as launch-poor in favour of
another surveyed band — the survey total is recorded above, so
the call is auditable.

**Survey reuse (stated before the freeze):** the survey IS the
panel's control leg — the analyzer and panel builder read the
survey dir directly (`perseed-partysize4-confirm-b-survey-ctl/`)
as the control corpus; no second control sweep is run and no
files are copied. This is honest because the floor's job is band
validation (did the band stage a pool?), which the survey itself
answers, and the floor is set from the survey's own measured
total: the control floor passes by construction at the haircut
level, and the BINDING judgement is the arm leg's
quad-counting ratio (independent of the floor derivation) plus
the absolute arm pool floor. The survey data is fixed before
the freeze and cannot change under it; only the arm leg is
judged after it. The alternative (a second control sweep)
would re-measure the same band on the same anchor at ~25 min
for no new information. NOTE: the first survey exec (16 seeds
in one call) was killed by SIGTERM at ~25 min with 11 seeds
done; the remaining 5 seeds ran clean in a second call. No
seed was run twice; the 16 files are one anchor
(`046ae5859128`), flag unset, lever present.

## Primary metric (BINDING, §14)

**Quad-fire** = on the armed leg, analyzer-observed quad launches
(`v4departs`, `result === 'launch'`, `targetWave >= 4`,
`partySize >= 4`) AND `winPlanStats.partyQuads` counting them.

**GO threshold:** arm observed quads ≥ 1 **AND** arm
`partyQuads` ≥ 95% of arm observed quads (confirm bar, tightened
from the pilot's 80% — the pilot showed 11/11, so the confirm
holds the higher bar) **AND** control observed quads == 0
**AND** control `partyQuads` == 0 **AND** per-seed exact (arm
`partyQuads` == observed quads) on ≥15/16 seeds (matches the
analyzer's coded bar, total−1).
**Pool floor (binding, derived from the measured survey rate —
see Survey):** control leg ≥ 16 wave-4+ launches **AND** arm
leg ≥ 12 wave-4+ launches **AND** ≥ 1 observed arm quad.
Derivation: 16 = 40% of the measured survey total 40 (rounded
down, floor of 12); the arm floor 12 is absolute. The band
proceeds under the Survey rule: expected arm launches at the
pilot's 0.55× ratio ≈ 22 ≥ 12.
Below the floor the confirm is under-powered and the verdict is
NO-GO (METRIC-BROKEN / NO-QUAD-POOL), never a pass on a vacuous
0==0. The analyzer's coded floor (6 launches/leg) is looser
than this prereg's derived floor and is reported, not binding —
as in the rerun, the stricter prereg floor binds.

**Predicted outcome (stated before the sweep):** GO on formation
+ counting — the lever converted 11/16 launches into quads on
the pilot band and 2/2 on the first band; the mechanism has now
passed twice. The open questions are the confirm-band quad ratio
at the tighter 95% bar and the #2557 seeding follow-up.

## Finding #2557 follow-up — plan seeding after a quad (REPORTED, not binding)

The pilot's follow-up question: do arm villages seed fewer
launchable plans after a quad on drought seeds? Method: for
every seed where the arm leg launches a quad AND the arm leg
then goes quiet (0 wave-4+ launches in the 30 days after the
first quad while control launches ≥2 in the same window),
compare `dawnbidCensus` (plan-seeding census rows) and `v4seeds`
(wave-3+ seed events) arm vs ctl on that seed, plus the
30-day post-quad launch counts per leg (same window, same seed,
from `v4departs`). Report whether the seeding gap reproduces
and by how much. This analysis is REPORTED, not a GO bar: it
answers a question, it does not judge the lever.

## Secondary metrics (supporting, not binding unless marked)

- **Quad conversion (REPORTED):** quads / arm wave-4+ launches.
- **Trio accounting (binding):** per-seed `partyTrios` ==
  analyzer-observed size≥3 launches on ≥15/16 seeds on EACH leg
  (matches the analyzer's coded bar, total−1).
- **No-misfire (binding guardrail):** arm `partyQuads` == 0 on
  every seed where observed quads == 0; control `partyQuads` ==
  0 everywhere. A nonzero count with zero observed quads is a
  misfire — NO-GO outright.
- **Damage share on size-4 meetings (REPORTED, not binding):**
  mean `mDealt / mHpStart` on launched size-4 fought meetings
  vs control launched meetings. NOT a GO bar: the fight-ally cap
  is known-binding (finding #2559).
- **Cost bars (GUARDRAIL, binding):** starvation arm ≤ ctl+2 on
  totals; median survival arm ≥ 0.8× ctl median; community loss
  arm ≤ ctl+16 (same bars as the pilot). A GO met with these
  breached is NO-GO (§14).
- **Instrument:** 0 instrument errors on all per-seed files;
  16/16 files both legs; `missingHp` 0 on fought rows;
  `v4launchTrack` present on every file (LAUNCHSURVIVE bar).
- **Balanced panel** (`build-partysize4-confirm-b-panels.js` with
  SEEDS=104730..104745 + `balance-panel.js compare`): the panel
  is the instrument, not the judge. Expectation is
  `no_material_signal` on most metrics with `review_required`
  from the 16-seed screen size investigated row by row, never
  waved.
- **Sense-test:** read villager dialogue/transcripts from the
  sims; judge meaning and coherence, not just counts. Flag
  anything robotic. Note whether the fourth-seat narration gap
  (finding #2558 — no spoken line for a fourth joiner) recurs;
  do NOT build the line in this arm.
- **Wall numbers (reported every run):** wins / national /
  table, wave 4–5 unlocks, median survival, both legs.

## What this confirm does NOT judge

- Wins / national / table (the lever attacks damage-via-numbers,
  not standing; no movement expected — wall numbers are reported,
  not judged).
- The fight-ally cap (#2559) or the damage a 4th member adds in
  the fight (reported above, judged by the cap arm).
- Gate-4s (finding #2550: `partyQuads` counts LAUNCHES only).
- The trio lever (substrate, judged already).
- Finding #2558 (fourth-seat spoken line) — a follow-up build,
  not this run's lever.

## Fixture staging (local-proof-of-effect)

The confirm runs live sims (competent policy), not a staged
fixture — the "fixture" is the live village, and the two pilots
already showed live quads forming. The proof tests' §5 fixtures
stage the encounter as measured: a wave-4-target plan holder at
Haven with armed, trusted, Haven-idle companions including a
living wave-3 killer — the party a player actually has when they
reach wave-4 content — never a fresh un-geared solo scholar.
`test-partysize4-b.js` §5 + `test-partyquads-b.js` §5q fire on
this tip (see Proofs below; the §1 frozen-diff leg of
test-partysize4-b fails on master drift — unrelated landed work
in build.js/fieldFights.js/godpath.js since the 1735Z freeze —
and is documented, not chased).

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (§10: reachability lever, waves
  4–5 / national / table). Dead villages stop simulating (+10d
  tail max).
- **Seeds: 104730–104745 (16 seeds).**
- **Policies:** competent verbatim. **Substrate both legs:**
  `VETREENGAGE=1 + FLEEREPAIR2=1`, `FIGHTALLY2` unset,
  `LAUNCHPARTY` unset. **Tracker both legs:** `LAUNCHSURVIVE=1`.
  **Legs differ ONLY by the lever flag:** ctl `PARTYSIZE4`
  unset, arm `PARTYSIZE4=1` — same branch code both legs (the
  lever is env-gated default-OFF, so flag-off IS the control).
  The driver asserts MODE↔env (ctl ⟺ flag unset, arm ⟺ flag
  =1) and records `leverPresent` + flag state per corpus file.
- **Instrument:** `scripts/partysize4-driver-b.js` (unchanged
  from the rerun lineage). Analyzer:
  `scripts/analyze-partysize4-b.js` (reuses
  `analyze-partyquads-b.js`). Panel builder:
  `scripts/build-partysize4-confirm-b-panels.js` (clone of the
  rerun builder with RUN `partysize4-confirm-b`, seeds
  104730–104745). Proof: `scripts/test-partysize4-b.js` (41/42 —
  §1 frozen-diff leg fails on master drift, see above) +
  `scripts/test-partyquads-b.js` (29/29), both run on this tip
  before the freeze; `scripts/analyze-partysize4-b.js --selftest`
  12/12.
- **Confirm scope:** 16 seeds, both legs, one shared baseline
  (the survey control leg, see Survey reuse).
