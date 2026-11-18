# Pre-registration — sim-wildavoid-confirm-a (Loop A, run fleshout-20261118T1415Z, axis: scale-onramp)

Committed BEFORE any judged sweep. Judge strictly against this file; a miss
is NO-GO per the verdict mapping below, never re-scored against a friendlier
metric mid-run. Metric doubts go under "metric review" in the evidence file,
for the NEXT run.

## Run identity

- Arm: sim-wildavoid-confirm-a (Loop A) · Branch: `sim-wildavoid-confirm-a`,
  based on the coordinator's registration (tip recorded in the evidence file).
  The branch already contains the landed fix 95ba293f2
  (sim-wildavoid-rejudge-a: B4 re-scoped to outmatched Suburb meetings only;
  B1 13/10, B2 30/30, B3 deaths 18→12, damage 4288→3552, B4 0
  outmatched-Suburb deaths, B5 instruments incl. D3 1.0; proof 91/91).
- CONFIRM-ONLY arm: NO src/js changes. If the confirm fails, decompose WHY
  on the fresh band (which bar failed, on which seeds, what the mechanism
  looks like) and name the next arm; do not re-tune the lever to chase a pass.
- Confirms the re-judged pilot (evidence/2026-11-18/sim-wildavoid-a.md,
  prereg sim-wildavoid-a-prereg.md; re-judge sim-wildavoid-rejudge-a.md,
  prereg sim-wildavoid-rejudge-a-prereg.md). The frozen bars B1–B5 below are
  copied VERBATIM from the re-judge prereg (B4 in its re-scoped form); the
  cost bars C1–C3 are new for this confirm, frozen here.

## Canon (read first)

- docs/CANON.md: read. docs/MONSTER-WAVES.md (leave-counter canon): The
  Suburb — "comfort as a trap — you don't kill it, you ESCAPE it" — and
  monsters.json weaknesses: "you can't kill it — LEAVE. Navigation is
  victory; the fight is a timer". The 'leave' itself is CORRECT
  counterplay per canon. This arm changes NO game code and NO canon.

## The lever, in plain words

When villagers meet a wave-4-or-worse beast out in the world with too small
or too poorly geared a party (fewer than 3, or anyone unarmed or unarmored),
they step aside instead of fighting — one spoken line, the beast stays in
the world, no plan touched. Full geared parties fight exactly as before.
Raids at the haven door are exempt. (Landed as 95ba293f2; this arm only
re-measures it on a fresh band.)

## Pre-registered metrics (frozen)

Two legs, identical seeds, one shared baseline: MODE=ctl
(WILDAVOID unset) vs MODE=arm (WILDAVOID=1). Substrate both legs:
VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1, SEEKGATE unset, FIGHTALLY2 unset.
Policy: competent verbatim. Horizon: 150d death-aware.

- **B1 (the avoid fires):** armed-leg wild avoids (`v4avoids` rows,
  wave >= 4, origin world-tick/aid/patrol) >= 50% of the control
  leg's would-avoid wild meetings (analyzer `classifyWouldAvoid`
  verbatim on ctl `v4encounters`). Contact precondition: ctl
  would-avoid wild meetings >= 8, else METRIC-BROKEN.
- **B2 (no launch loss):** wave-4 launch events (`dawnbidDeparts` rows
  with `result === 'launch'` and a wave-4 plan) armed >= 90% of ctl,
  AND launched instances (any-commit, frozen classifier) armed >= 90%
  of ctl.
- **B3 (the price banks):** armed-leg wild wave-4+ deaths (vDie
  outcomes on wild origins) <= ctl AND armed-leg wild vFlee damage
  (sum of `vTaken` over wild vFlee rows) <= ctl.
- **B4 (re-scoped, verbatim from the re-judge prereg):** count Suburb
  deaths ONLY among OUTMATCHED Suburb meetings (party < 3, or anyone
  unarmed/unarmored — the same `winPlanOutmatched` rule the lever
  applies). Matched-party pre-learning deaths are excluded. GO requires
  BOTH:
  - (a) arm outmatched-Suburb deaths == 0, AND
  - (b) every outmatched Suburb meeting on the arm leg was avoided
      (arm outmatched Suburb fought meetings == 0; each arm-leg
      outmatched Suburb meeting accounted for as avoided).
  - Any Suburb death on the arm leg is reported with the original-B4
    numbers as context, and must be VERIFIED from the corpora, not
    taken on trust: a matched-party death identical on both legs (same
    day, same outcome, same damage, same party) AND predating any avoid
    on that seed does not fail B4 re-scoped. Any other Suburb death on
    the arm leg fails B4.
- **B5 (instrument):** 16/16 files per leg, exactly the frozen seed
  list, 0 instrument errors, missingHp 0, recMismatch 0, D3
  replica-vs-live-gate agreement >= 0.95 on expedition rows (n >= 5)
  on BOTH legs, `winPlanStats.wildAvoids` == recorded avoids, say-lines
  == avoids ('gives it room' count == avoids on arm, 0 on ctl).
  Trajectory control: first diverging day per seed >= that seed's
  first avoid day, or no divergence when no avoid.
- **C1 (median-survival cost):** arm median survival >= 0.90 x ctl
  median survival (ratio reported).
- **C2 (starvation cost):** arm starvation deaths <= ctl starvation
  deaths (analyzer `starvDeaths`, reported alongside).
- **C3 (community-loss cost):** arm community loss (panel
  `communityLost`) <= ctl + 1 on the 16-seed band.
- **Panel (§15):** `scripts/balance-panel.js compare` on the built
  panels must not return `regression_signal`. Any `regression_watch`
  line is investigated in the evidence file, not waived.

**Verdict: GO iff B1 && B2 && B3 && B4 && B5 && C1 && C2 && C3 && panel clean.**
**NO-GO iff any B or C fails with population present.**
**METRIC-BROKEN iff ctl would-avoid wild meetings < 8, or ctl wild
wave-4+ meetings < 40, or D3 n < 5 on either leg** (population
absent — unanswered, not answered-no). No re-scoring.

Reported (not gated): wild wave-4+ kills ctl vs arm; wild meetings by
origin ctl vs arm; avoids by origin/rule on arm; avoids with foreign help
at the door; wild deaths by origin; Suburb slice (meetings, outcomes,
trick-known seeds, damage taken) + original-B4 numbers as context; wall
numbers (national / table / wins, wave 4–5 unlocks, median survival) both
legs; sense-testing notes from transcripts (at least 2 avoided meetings
and 2 fought meetings read on the fresh band).

## Design (seeds, policy, horizon, instruments)

- Confirm band: **104431–104446** (16 seeds, FRESH — verified
  2026-11-18: word-boundary grep of every `evidence/*/sim-*-prereg.md`
  for 10443x/10444x/10445x/10446x returns 0 hits; grep of all
  `evidence/**/*.md` for "10443" returns 0 hits; no filename under
  `evidence/` contains 10443x; no forbidden/contaminated band list
  names this band. Rejected collisions found during the check:
  104411–104418 is the pilot band; 104401–104408 named in the pilot
  prereg's collision list; 104421–104428 is the sibling
  sim-scale-onramp-round-1015 band
  (evidence/2026-11-18/sim-scale-onramp-round-1015.md:131);
  104301–104308 is the fightgate-scope census band; 104201–104208
  belongs to the sibling arm sim-expedroster-b; 103601–103608 is the
  seekgate/fleerepair2 band; 103901–103908 is the launchparty band.
  Per the seed-band skill, a named band counts as used even without a
  judged corpus.)
- Horizon: 150d death-aware (the pilot horizon; the wall numbers and
  the avoid price are 150d phenomena). Policy: competent verbatim
  (scripts/policies/competent.js).
- Substrate: VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 (the pilot
  substrate). FIGHTALLY2 unset. SEEKGATE unset (not on this base).
- Instruments (confirm copies, distinct names — never modify the pilot
  instruments or shared analyzers):
  `scripts/wildavoid-driver-a.js` (unchanged pilot driver: RUN is kept
  `wildavoid-a` so the per-seed filename shape matches the panel
  builder; OUTDIR is the confirm corpus dir, which carries the confirm
  identity),
  `scripts/analyze-wildavoid-confirm-a.js` (pilot analyzer copy: frozen
  seeds 104431–104446, expected files 16, B4 re-scoped per above,
  cost bars C1–C3 added, output
  `evidence/2026-11-18/wildavoid-confirm-a-analysis.json`, selftest
  extended with re-scoped-B4 cases),
  `scripts/build-wildavoid-panels-a.js` (unchanged pilot panel builder,
  run with `--out evidence/2026-11-18/wildavoid-confirm-a-panel`
  `--before evidence/2026-11-18/perseed-wildavoid-confirm-a-ctl`
  `--after evidence/2026-11-18/perseed-wildavoid-confirm-a-arm`
  `--seeds 104431,...,104446`).
- Corpora: `evidence/2026-11-18/perseed-wildavoid-confirm-a-ctl/` and
  `perseed-wildavoid-confirm-a-arm/` (16 files each).
- Pilot gate does not apply (this IS the confirm), but if the first 8
  seeds show a gross instrument failure, stop and report rather than
  burning the full band.
- D-checks (instrument validity, run before the judged sweep):
  D1 repeatability — seed 104431, 60d, recorder ON, arm leg, run
  twice; output files identical except the `file` path. D2 wrap
  neutrality — same seed/days, recorder ON vs recorder OFF on the
  armed tip: daily fingerprints identical. D3 (in-analyzer, both
  legs) — replica vs live gate >= 0.95, n >= 5 (B5).
- A 1-seed 30d driver smoke precedes the sweep (seed 104431, arm leg,
  same substrate) to prove the recorder writes `v4avoids` rows; the
  smoke output is discarded, not judged — the judged corpora are the
  16-seed 150d legs only. (Pilot note: wave 4 may not have unlocked
  by day 31; if the smoke shows no avoids, extend to 150d on the same
  seed to prove the rows, as the pilot did.)
- Encounter-gear rule (Steve 2026-11-13): the panel stages the
  competent policy (geared scholar with a party) — never a fresh
  un-geared solo scholar. The proof test stages a geared scholar
  with a party for the live Suburb cases.

## Proof (frozen)

- Re-run `scripts/test-wildavoid-a.js` on the branch tip; expect ALL
  PASS, 91 assertions. Record the result. A failure is a loud failure
  of the confirm, not a re-score.
- Run `scripts/analyze-wildavoid-confirm-a.js --selftest`; expect
  SELFTEST ALL PASS (includes the re-scoped-B4 cases and the cost-bar
  cases). A failure is a loud failure of the confirm instrument.
