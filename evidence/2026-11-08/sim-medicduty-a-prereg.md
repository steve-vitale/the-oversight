# sim-medicduty-a — HAVEN MEDIC DUTY (arm sim-medicduty-a)

Run: oversight-flesh-out-loop, run fleshout-20261108T1017Z (Loop A), axis
food-economy (converging, NOT converged). Worker tree:
~/workspace/worktrees/sim-medicduty-a, branch sim-medicduty-a.
Substrate: worktree HEAD 76c16eeae at prereg time (verified `git rev-parse
HEAD` in the worktree; tree clean). Policy: competent ONLY
(scripts/policies/competent.js, UNMODIFIED). Env (explicit, = shipped
defaults): PLENTYDEPRI=1, DEPOSITGATE=1. Horizon: 150d death-aware cap
(dead villages stop; runDays endReason recorded per seed; no fixed-200d
run). Seeds: 96301–96308 (8 seeds — the feveranat / tendsick /
medicdiag band, deliberate reuse; see Seed-band note).

## Canon

READ docs/CANON.md first, then docs/DISEASES.md (two pools, never mix;
cure tiers per disease: folk remedies → occupation medicine → specific
ruin medicine → earned healer deepenings → the Fever's End synergy).
docs/PARTY.md was checked and contains NO healer-role / villager-care
canon — no canon doc covers how many medics a village should have or
what village-side care looks like; that gap was medicdiag's finding,
not an invention. The CANON.md law "human skills ≠ alien abilities"
bounds this build: the duty assigns an existing occupation-medic to
stay at Haven and tend; it creates NO cure, NO new ability, NO new
skill. The village-side cure question remains a flagged steve-call
(is a villager cure an occupation skill or a System ability?) and is
NOT built here — the census says cure is not the binding constraint,
presence is.

## The question (medicdiag C4's named next arm)

Medicdiag (DIAG-GO, evidence/2026-11-07/sim-medicdiag-a.md) measured:
presence 292 NPC sick-days healer-absent vs 206 present (old base;
260 vs 141 on the live leg); coverage absent episodes treated 20.0%
vs present 69.4%; capacity NOT binding (1109 tend-slots, every medic
holds triage); tending saves everyone it reaches (0/74 treated
deaths); modeled value 16.24 deaths avoided if absent episodes had
the present mortality rate. C4 named HAVEN MEDIC DUTY: a
duty/assignment keeping one roster medic at Haven as the camp healer,
prioritizing tending the sick. This arm BUILDS it and measures it.

## How the mechanism actually works (probes run BEFORE this prereg, not guessed)

Two probes change the mechanism story the prereg is written against:

- PROBE 1 (away medic tends): prepared game, seed 96301, Lena Ruiz
  (ER nurse) as medic, one sick patient, `villagerCareTick` called
  with the medic at Haven vs marked `v.away`. BOTH cases tended
  (daysLeft 5 → 4). `villagerCareTick` (game.js) filters the roster
  by occupation and sickness only — it never checks `v.away`.
  `campHealerId('haven')` correctly returns null with the medic away.
  CONSEQUENCE: the duty does NOT raise tending coverage through
  `villagerCareTick` — away medics already tend. The presence-gated
  mechanisms are: `healerFor(vid)` in `villageSicknessTick`
  (sickness damage 1+sev*2, −1 when a healer is physically in the
  patient's camp), `healerRounds` (+15 HP to the worst wound/day,
  requires a camp healer), `villagerTreatTick` (a medic eases the
  SCHOLAR's sickness, requires medic + scholar at Haven),
  `villagerDiagnosisTick` / `villagerTickTeachTick` (presence-gated).
  The present/absent treatment gap medicdiag measured is therefore
  largely a "medic exists at all" confound (see Pool sizing), not a
  "medic is home" effect — the duty is tested on PRESENCE, and
  treatment coverage carries a NULL PREDICTION below.
- PROBE 2 (pool sizing, from the medicdiag live-leg corpus,
  evidence/2026-11-07/medicdiag-a-corpus/): pooled NPC sick-days
  141 present / 260 absent (share 35.2%). Of the 260 absent
  sick-days, only 30 fall on days when a living roster medic exists
  but no healer is at Haven (medicCount ≥ 1); 230 fall on days with
  NO roster medic at all (medicCount = 0). All 30 addressable
  sick-days have the medic AWAY (place='away'; field place = 0
  days — the competent policy never puts a medic in the field camp,
  so the scholar-party override is a non-issue on this substrate).
  Living-medic days by place: away 289, haven 270 — medics spend
  ~52% of their days away from Haven. CEILING: if the duty reclaimed
  every addressable sick-day, present share would reach (141+30)/401
  = 42.6%. The GO bar is set as a fraction of this addressable pool
  (per MEASUREMENT.md §14b — never an absolute pulled from nowhere).
  The 230 no-medic sick-days are the MEDIC HEADCOUNT shape (medicdiag
  C4's second shape) and are NOT this arm; the duty cannot create
  medics where none exist. Honest scale note: the duty's addressable
  share of medicdiag's modeled 16.24 deaths-avoided is ~30/260 ×
  16.24 ≈ 1.9 deaths per band — this pilot tests the DUTY MECHANISM
  (presence), not the mortality claim; a mortality effect, if any,
  needs a bigger band and the headcount shape to show up in.

## The build (HAVEN MEDIC DUTY — what will be built, before it is built)

- `v.medicDuty` (vid | null) on the village state. `medicDutyTick()`
  (game.js, near `villagerCareTick`): at dawn (called from `objTick`
  when `dayPart === 0`), keeps the current holder while still
  eligible, else picks one living roster medic physically at Haven
  (not in `v.away`, not sev-2 sick, not the scholar), preferring
  triage holders, then first in roster order — deterministic, no RNG.
  `medicDutyHolder()` read-validates eligibility everywhere the duty
  is consulted (a departed / dead / sev-2-sick holder reads vacant).
- Departure blocks (the duty keeps the holder HOME):
  `objMaybeDepart` (villager-objectives.js) — if the holder's picked
  objective is not LEAVE, convert to HAVEN_CHORE indoor work and
  stay; LEAVE (desperate walk-out) is EXEMPT, duty passes on.
  `startExpedition` (villager-agency.js) — voluntary expeditions
  blocked for the holder; DIRECTED win-plan launches (opts.tx set,
  win-plan.js:419) are exempt — the plan's path to the table is not
  the duty's to veto. `objAskCompanion` — the holder is never picked
  as a companion/guard. Party invites are a scholar override (player
  agency): not blocked; the duty reassigns when the holder leaves.
- Tending priority: in `villagerCareTick`, the duty holder tends
  FIRST and targets the sickest patient (lowest `v.health`,
  tie-break lowest daysLeft); other medics keep existing behavior.
  No cure: no `v.sick` deletion, no `treatVillager` call, no new
  ability/skill, no change to `villageSicknessTick` damage or
  `healerRounds` beyond the holder being present to trigger them.
- Voice (player-facing text → commit carries [needs-eyes]): one say
  line when the duty changes hands (names the holder, plain words);
  one throttled line (once per 7 days, only while someone is sick)
  when the village has NO medic at all — medicdiag's sense section
  found zero say-lines anywhere mentioning a missing healer. Both
  lines use no RNG (no trajectory impact from narration).
- Bookkeeping: `v.medicDutyBlocked` counts blocked departures
  (voluntary only), read by the recorder.

## SEED-BAND NOTE (deliberate reuse, not fresh)

Seeds 96301–96308 are REUSED deliberately: they are the feveranat /
tendsick / medicdiag band, and this arm must be directly comparable
episode by episode (same villages, same trajectories, before vs
after). The band was verified FRESH for feveranat across every dated
sim-*-prereg.md, the convergence tracker, and sim-findings.md; this
run adds no new seeds and claims no freshness.

## PRE-REGISTRATION (binding per MEASUREMENT.md §14 — a miss is NO-GO, never re-scored)

- Substrate: worktree HEAD 76c16eeae (before leg, unmodified game);
  after leg = the same tree + the duty commit (hash recorded in the
  evidence file). Policy: competent ONLY, UNMODIFIED. Env (explicit):
  PLENTYDEPRI=1, DEPOSITGATE=1. Horizon: 150d death-aware cap.
  Seeds: 96301–96308 (8 seeds — pilot batch IS the measurement batch).
- Instruments (all NEW except the two reused recorders, run as-is):
  scripts/sweep-medicduty-a.js (COMPACT recorder, medicdiag pattern
  + ONE declared delta: per-day duty snapshot — dutyVid, duty holder
  name, duty-set-today, blocked-departure counter — plus the medicDay
  fields needed to join the medicdiag corpus day-by-day; pure reads,
  no RNG, no Game-state writes; bare mode for neutrality, fingerprint
  must equal the medicdiag fingerprint on the same base+seed),
  scripts/analyze-medicduty-a.js (joins the medicduty + medicdiag +
  feveranat corpora per leg and prints the census + gates),
  scripts/test-medicduty-a.js (proof: duty-assignment unit legs,
  departure-block legs, LEAVE-exempt leg, tending-priority leg,
  no-cure leg, recorder neutrality on 2 seeds, analyzer gates).
  Reused as-is (same base+seed+policy, both legs):
  scripts/sweep-feveranat-a.js (episodes, treatment, production)
  and scripts/sweep-medicdiag-a.js (medicDetail, deaths) — each with
  OUT/PERSEED_DIR pointed at
  evidence/2026-11-08/medicduty-a-corpus/<before|after>/; each leg's
  bare pass re-proves recorder neutrality on THAT base.
- PRIMARY METRIC (one): NPC sick-days healer-present share =
  present / (present + absent), pooled over the 8 seeds (medicdiag
  medicDays join; healerPresent = campHealerId('haven') non-null).
  Baseline (medicdiag live leg, base a04a6c0fc): 141/401 = 35.2%.
  GO requires BOTH: (a) after-leg present share ≥ 40%, AND
  (b) after-leg absent-with-medic sick-days ≤ 15 (baseline 30 —
  at least half the addressable pool reclaimed). Condition (b) is
  the pool-relative measure; it guards against passing (a) by
  denominator shrinkage (fewer total sick-days) instead of presence.
- GUARDRAILS (a GO met with a guardrail breached is NO-GO):
  (G1) after-leg median survival ≥ 0.8× before-leg median.
  (G2) after-leg starvation deaths ≤ before-leg starvation deaths + 2.
  (G3) no NEW death-cause mode in the after leg: any cause absent
  from the before-leg deaths appearing ≥ 2 times after is a breach.
  (G4) after-leg produced/need (feveranat flowSeries) ≥ before-leg
  produced/need − 0.03 (the duty holder not foraging must not starve
  the village; before-leg baseline TBD from the before corpus).
- SECONDARY (reported, not gated): NPC sickness deaths; wound-fever
  NPC deaths; treatment coverage (episodes treated share) — NULL
  PREDICTION: expect NO material change (±10pp band); away medics
  already tend (Probe 1), so a coverage move means the mechanism
  story is wrong and goes to metric review, not to a re-score;
  duty mechanism (duty-days, blocked departures, holder changes,
  holder stability); wall numbers (national / table / wins, wave
  reach 1–5, median/max survival).
- BALANCED PANEL (§15): before/after panels through
  scripts/balance-panel.js, `--seeds 96301..96308 --policies
  competent --days 150`, before root = unmodified worktree, after
  root = worktree + duty commit; compare with `balance-panel.js
  compare`, attach the compare .md to the evidence file. The panel
  is the INSTRUMENT (guardrail/regression check across its 23
  metrics); the pre-registered primary above is the JUDGE. Panel
  status never overrides the prereg verdict. Commit panel.json.gz +
  compare .md/.json ONLY — never the cases/ cache (delete it before
  committing).
- Gates (judged ONLY against this header):
  - G1 primary: present share ≥ 40% AND absent-with-medic ≤ 15.
  - G2 guardrails: G1–G4 all hold.
  - G3 panel: both panels valid, compare attached; any
    `regression_signal` is investigated in the evidence file (it
    does not re-score the primary, but an unexplained regression
    blocks a GO claim — say so plainly if it happens).
  - G4 proof: scripts/test-medicduty-a.js green (all legs, ≥3 seeds
    where the leg is aggregate).
- GO: G1 + G2 + G3 + G4 all pass. A miss is NO-GO, never re-scored
  mid-run; if a metric proves wrong, write it under "metric review"
  and propose the revision for the NEXT run.
- Reachability check (reported, not gated): national / table / wins,
  wave reach 1–5, median survival — expected 0/0/0 on competent-only
  150d per the sibling runs; any non-zero is reported as a deviation,
  not a win.
- Telemetry deviation check (loop-body step 10): after writing
  evidence, run `node scripts/telemetry-check.js --baseline
  ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
  --current 'evidence/2026-11-08/medicduty-a-corpus/after/medicduty-a-competent-s*.json'
  --metrics national,table,wins,exiled`. Any LOUD line is a same-run
  investigation item — dig into the deviation (explained vs real bug)
  BEFORE rolling the baseline forward. Report LOUD lines with verdict.
  (Expectation: competent-only 150d shows national/table/wins 0 — the
  medicdiag/awayconfirm runs hit the identical LOUD lines as a regime
  artifact; do NOT roll the baseline on a regime artifact.)

## Results

(to be filled after the sweeps — verdict judged ONLY against this header)

## AMENDMENT A1 (written BEFORE the duty is built and BEFORE any after-leg run, 2026-11-08 ~12:05Z)

SUBSTRATE MOVE — the GO bar is unachievable on this base, and the
before-leg baseline proves it. The prereg's GO bar (share ≥ 40%,
absent-with-medic ≤ 15) was set from the medicdiag live leg (base
a04a6c0fc: present 141 / absent 260, share 35.2%, addressable pool
30, ceiling share 42.6%). The before leg on THIS base (76c16eeae,
measured just now, all three recorders exit 0) gives a different
baseline: present 113 / absent 346, share 24.6%, addressable pool 38,
village-days 681 (vs 821), median survival 73d (vs 113d). The ceiling
on this base is (113+38)/459 = 32.9% — a 40% share is mathematically
impossible even with 100% pool capture. The bar was set in good faith
from the best available numbers, but the substrate moved underneath
it. This is a METRIC-BROKEN bar per MEASUREMENT.md §14a (a bar the
pilot could not have passed regardless of the concept's merit), not a
concept failure — and per §14b the bar must be set as a fraction of
the pool, not an absolute pulled from nowhere.

CORRECTED GO (same stringency as the original bar, expressed against
the measured before-leg pool): the original (a) required flipping
~19 of 30 addressable sick-days (63% capture); the original (b)
required flipping ≥15 of 30 (50% capture). Preserving those
fractions against the new pool of 38:
- (a) after-leg present share ≥ 30% (before 24.6%, ceiling 32.9%;
  requires flipping ~25 of 38, ~66% capture).
- (b) after-leg absent-with-medic sick-days ≤ 19 (before 38;
  requires flipping ≥19 of 38, 50% capture).
UNCHANGED: guardrail thresholds G1–G4 (their before-leg baselines
are now measured: median survival 73d → G1 needs ≥ 58.4d;
starvation deaths 8 → G2 needs ≤ 10; produced/need 0.995 → G4
needs ≥ 0.965; G3 new-cause rule unchanged). The secondary NULL
PREDICTION on treatment coverage stands (before-leg treated share
45.5%). The verdict is judged against THIS amended header. The
original bar is preserved above for the audit trail; this amendment
is a pre-registration correction made before any after-leg number
exists, not a re-score — no duty code exists yet and no after-leg
sweep has run.

## Metric review (post-run)

(to be filled after the sweeps)

## Sense (SENSE-TESTING LAW)

(to be filled after the sweeps — transcripts read on at least two
episodes: one where the duty holder tends, one where the village has
no medic; quote what the village actually says and whether the duty
reads as a person doing a job, not a flag)

## Village assessment in plain words

(to be filled after the sweeps)

## Blanks filled or documented

(to be filled after the sweeps)

## Findings for the backlog (coordinator appends — this worker does NOT edit sim-findings.md)

(to be filled after the sweeps)
