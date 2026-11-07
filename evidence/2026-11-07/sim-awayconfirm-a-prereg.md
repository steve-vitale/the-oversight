# sim-awayconfirm-a — CASE-COUNT-SIZED CONFIRM for away-ration harm (measurement only)

Run: oversight-flesh-out-loop, run fleshout-20261107T1205Z, arm sim-awayconfirm-a,
axis food-economy. Worker tree: ~/workspace/worktrees/sim-awayconfirm-a,
branch sim-awayconfirm-a. DIAG/CONFIRM ONLY: zero src/js game changes. No
away-ration fix is built here; that is a LATER run's arm (confirm-first rule,
backlog #953/#961, tracker prerequisite (1)). This run MEASURES the harm; it
does not build the fix. The away-voice blank stays open pending this confirm.

## Canon

READ docs/CANON.md first, then docs/PRESERVATION.md (the food ladder:
cleaned 2d < cooked 5d < smoked 30d < rendered 90d < pemmican 120d; smoking
16 ticks; pack food moves only what fits in the actual pack) and
docs/BALANCING.md (2,000 kcal/day adult need; pantry start ~47,250 kcal;
tier-1 food bar 8,000 kcal). The mechanism under test is game code, not
canon: villagerMealDay (src/js/game.js) feeds at-haven villagers from the
pantry (pantryDraw) and away villagers ONLY from their pack (packMeal —
"On the move, people eat what they carry"; the dawn ration is drawn from the
pantry by packKcal). No canon doc covers away-ration sizing or a haven
distribution rule — if the measurement names one, it is a finding, not
canon. No canon doc is invented here.

## Substrate note (recorded before sims)

This worktree's HEAD is c92a873f4 (journey-establishment r110), TWO commits
behind master tip 794adcb8a (sim-preserverleg2-a, evidence + instruments
only, zero src/js — verified by git show --stat on both commits). The branch
is strictly behind master (linear, not divergent: `git log HEAD..master`
shows exactly those 2 commits, `git log master..HEAD` is empty). Per the
task, this worker does NOT rebase and does NOT merge — the coordinator lands
the work and can rebase the branch onto 794adcb8a at landing. Sim behavior
is identical on either base (the 2-commit gap touches no src/js, no
policies, no harness, no data), so the corpus is valid on master tip as
well. The gap is flagged here and in the worker's final report; it is not
silently papered over.

## The question (backlog #953/#961, tracker prerequisite (1))

The diag-b claim (3/3 full-pantry starvation deaths away, GO-small-sample)
was put to a fresh-seed confirm (confirm-b, 16 seeds) and came back
NO-GO-on-sample (n=1). The casecount run then collected n=8 on 64 seeds
(94601–94664, CASECOUNT-GO, shareA 8/8) — but under the casecount rule
(n>=8 AND shareA>=0.80), NOT under the confirm rule, which additionally
requires every named mechanism >=2 cases + quoted. This run is the
case-count-sized CONFIRM under the confirm rule on FRESH seeds: does the
away-ration harm confirm at scale, with enough cases to price (or dismiss)
a fix? Pooled-with-prior-runs numbers are context ONLY — the verdict is on
THIS run's pooled deaths only (per fullpantry-confirm-b).

Prior rates (why 100 seeds): diag-b 3 cases/16 seeds, confirm-b 1/16,
casecount 8/64 (~1 case per 8 seeds). At 1/8–1/16 seeds per case, 100 seeds
expect ~6–12 cases. If the low rate holds (1/16), 100 seeds yield ~6 and
the verdict is NO-GO-on-sample — which is itself the honest answer: the
harm is too rare to price a fix on.

Do NOT re-attempt (killed shapes, recorded so no worker re-litigates them):
- dayWant sizing (sim-food-awayration-round-0630, KILLED at pilot:
  pack/need 0.240 vs bar 0.80; dayWant ~330 kcal typical; pool cap binds
  11.3% of draw days).
- The second fix shape (sim-awayration2-adopt-b, KILLED at pilot: armed
  mean shortfall 15.2 kcal vs GO <=5.0; shortfall-meal share 0.024 vs
  <=0.010). Its confirm band 96109–96124 never ran but is NAMED/reserved —
  do NOT use it.
- The away-voice fix is a separate blank (bands 96001–96008 used by the
  away-voice work) — do NOT build it in this arm.

## PRE-REGISTRATION (binding per MEASUREMENT.md §14 — a miss is NO-GO, never re-scored)

- Substrate: branch sim-awayconfirm-a (base c92a873f4, see substrate note).
  Policy: competent ONLY (scripts/policies/competent.js, UNMODIFIED). Env
  (explicit, = shipped defaults): PLENTYDEPRI=1, DEPOSITGATE=1. Horizon:
  150d death-aware cap (dead villages stop; runDays endReason recorded per
  seed; no fixed-200d run, no tail padding beyond the harness's own stop).
- Seeds: batches of 25 from 98000 — B1 98000–98024, B2 98025–98049,
  B3 98050–98074, B4 98075–98099. Hard cap 100 seeds. The sweep mechanically
  refuses any seed list other than exactly one batch; the runner refuses to
  run once a line-start VERDICT-RENDERED line exists in the evidence file
  (anchored guard: pre-reg prose mentioning the token does not trip it).
- STOPPING RULE (pre-registered, fixed before sweeping): B1 is the PILOT
  batch. The pilot is NOT a verdict — no verdict is rendered mid-batch or
  from a partial batch. After each batch boundary, count cumulative
  full-pantry villager starvation deaths n in the corpus so far; STOP at
  the first batch boundary where n >= 8. The count rule (every named
  mechanism >= 2 cases + quoted) is a VERDICT gate, NOT a stopping
  condition: if n >= 8 is reached with a lone B or C case (count 1), the
  run stops and the verdict is judged on the stopped corpus (NO-GO on the
  count rule) — no extension batch is run to chase a second B/C case. If
  n < 8 after B4 (100 seeds), the verdict is NO-GO-on-sample.
- Freshness (verified BEFORE sims, 2026-11-07, by this worker — re-verified
  independently of the coordinator's check): band 98000–98099 is FRESH.
  Scope: all 607 dated preregs (evidence/*/sim-*-prereg.md); all 4,318
  evidence .md files; per-seed filename scan across evidence/ (zero files
  named *s980xx*); exact seed-field scan over all evidence JSON (zero
  `"seed": 980xx` fields in 98000–98099 — the near hits are 98765 in
  evidence/2026-10-12/sim-disease-r4-sweep.json and 98101–98108 in
  evidence/2026-11-02/perseed-heraldband-a/, both outside the band);
  forbidden/contaminated lists named in preregs (standacc lists,
  tendfloor 99401–99412, askplus-a 99401–99408) — none near 98000.
  Nearby USED bands (not collisions, recorded so the next worker does not
  re-check them): 98101–98108, 98201–98208, 98301–98308, 98401–98408,
  98501–98508. The 98041 / 98043 / 98076 strings in evidence .md files
  are commit-SHA prefixes (98041cc, ac98043a1), not seeds. Reserved/used
  bands NOT used here: 94601–94664, 94701–94732, 94801–94820,
  96101–96124, 96001–96008, 9750–9773, 9500–9515, 96500–96515,
  99201–99208, 99101–99108, 99601–99612, 53001–53008, 49001–49040,
  48001–48008. The analyzer re-asserts the C1 gate over actually-run
  seeds (see Deltas).
- Sample: starvation deaths (cause canon 'starvation') across the runs.
  Player starvation deaths are excluded from the sample (recorded
  separately if any, including any meeting the full-pantry gate); the
  sample is villagers only.
- FULL-PANTRY definition (fixed before sims, same as diag-b/confirm-b/
  casecount): at death, pantryKcalLive >= 8,000 kcal AND pantryFreshDays
  >= 3.0 days. Deaths meeting the kcal gate but missing the fresh gate
  are counted separately as kcal-only context, never in the verdict
  denominator.
- Per-death fields, meal record, and mechanism classes: exactly as defined
  in the diag-b evidence (analyzer applies classes from the deceased's
  OWN meal/away records + death ctx only — never from window words):
  A AWAY-RATION (away at death OR away-share of window meal-days
  [deathDay-7, deathDay] >= 0.5); B HAVEN-DISTRIBUTION (not A AND a haven
  meal-day in the window with drawn < 0.25 * needEst AND ate < 0.6 *
  needEst); C OTHER (neither, with a sub-reason from the record). Meal-row
  dedupe: one row per (vid,day). One quoted case per named mechanism.
- Primary metric: attribution shares over FULL-PANTRY starvation deaths
  only (shareA, shareB, shareC; denominator = count of full-pantry
  starvation deaths, NOT all starvation deaths).
- CONFIRM-GO (binding, carried UNCHANGED from fullpantry-confirm-b) iff
  pooled deaths from THIS RUN ONLY meet: n >= 8 full-pantry villager
  starvation deaths AND share A (away-ration) >= 0.80 AND every named
  mechanism with count > 0 has count >= 2 and >= 1 quoted case. ("Named
  mechanism" = A/B, exactly as confirm-b's analyzer implements the carried
  rule; C is the residual OTHER class, reported with a sub-reason but not
  a verdict gate.) If pooled
  n < 8 after the cap, the verdict is NO-GO-on-sample even if share A is
  1.00. A miss is NO-GO, never re-scored against a friendlier metric
  mid-run. If the confirm GOes, the fix is a LATER run's arm; if it
  NO-GOs on sample again, say so honestly with the measured rate.
- WATCH (report-only): win rate, vesting/national reach, Arc reach, wave
  reach (1–5), median/max survival, death-cause shares, wall numbers
  (national / table / wins, wave 4–5 unlocks, median survival), total
  starvation deaths and full-pantry subset, days-since-adequate-meal
  distribution, haven vs away meal adequacy rates, villager behavior
  (SENSE-TESTING LAW: transcripts read, beats quoted — never just
  counts). Competent-only runs are expected to show 0 national/table —
  report it, do not chase it.
- Instruments: scripts/sweep-awayconfirm-a.js, scripts/analyze-awayconfirm-a.js,
  scripts/test-awayconfirm-a.js, scripts/run-awayconfirm-a.sh — all DERIVED
  from the casecount family (sweep/analyze/test/run-fullpantry-casecount-b);
  the casecount scripts are NOT modified. Deltas (declared, verified by
  test-awayconfirm-a.js):
  1. Names/paths: awayconfirm-a-*, corpus evidence/2026-11-07/awayconfirm-a-corpus/.
  2. Seeds: 25-seed batches B1 98000–98024, B2 98025–98049, B3 98050–98074,
     B4 98075–98099 (sweep accepts exactly one batch per invocation; days
     150 ONLY). Runner stops at the first batch boundary with n >= 8;
     hard cap 100 seeds (4 batches).
  3. Analyzer verdict rule (the ONLY semantic change vs casecount):
     CONFIRM-GO requires n >= 8 AND shareA >= 0.80 AND every named
     mechanism (A/B/C) with count > 0 has count >= 2 and >= 1 quoted
     case — the confirm-b rule, carried unchanged. The casecount rule
     (n>=8 AND shareA>=0.80 alone) is NOT reused: a thin unanimous sample
     or a lone contrary mechanism is NO-GO here by design.
  4. Quote-picker (confirm-b metric-review proposal, adopted here as a
     declared pre-run delta): a STARVING/spiral line now scores ABOVE a
     name-only beat (spiral +4, name +3, Village-meal +1, camp-wild +1).
     Classification is unchanged — quotes are corroboration only, the
     analyzer never classifies from windows.
  5. Analyzer C1 (generalization of the c1scope fix, landed 6fc8d44ae):
     scopes to seeds this corpus ACTUALLY RAN (read from its own
     per-seed filenames) AND scans ALL dated evidence corpora (every
     *-corpus dir under evidence/, any date — not just the run's own
     date — plus per-seed JSONs in perseed-* dirs), via a fast string
     pre-filter for exact `"seed": <run-seed>` fields with JSON-parse
     confirmation on matches only. A planned-but-unrun seed can never
     fail C1; a real collision still fails loudly.
  6. Everything else identical in behavior to the casecount family:
     competent FIXED, env FATAL asserts, registerDeath CALLS THROUGH,
     meal wrapper (reads only, no RNG), extended death ctx, meal-row
     dedupe (replace, last call wins, mealDupCount), writeRobust (300
     attempts, 2s backoff), stdout to the caller's pipe, never
     redirected to a file.
- Balanced panel per §15: ATTEMPTED (not silently skipped) — run
  `node scripts/balance-panel.js compare` on the sweep corpora and
  attach the compare .md. This is a single-policy DIAG with no
  before/after comparison arm, so no before/after panel exists; the
  KNOWN failure class is recorder-row ingestion (the panel ingests
  panel.json.gz outputs, not per-seed sweep corpora — third/fourth
  sighting incl. cover-b and the 0630Z round). If it fails in that
  class, attach the analyzer's sweep-compare replication table instead
  (§15 fallback: this run's replication diagnostics vs casecount /
  size-b / confirm-b numbers) and name the class. A tooling failure
  NEVER blocks or re-scores the verdict.
- Telemetry deviation check (loop-body step 10): after writing evidence,
  run `node scripts/telemetry-check.js --baseline
  ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
  --current 'evidence/2026-11-07/awayconfirm-a-corpus/awayconfirm-a-competent-s*.json'
  --metrics national,table,wins,exiled`. Any LOUD line is a same-run
  investigation item — dig into the deviation (explained vs real bug)
  BEFORE rolling the baseline forward. Report LOUD lines with verdict.
- Metric review (pre-sims): same as diag-b/confirm-b (registerDeath
  call-through keeps game behavior intact; death-day pantry read is a
  post-meal lower bound, so the full-pantry gate is conservative; v.away
  is a travel-state record, exactly the state routing meals through
  packMeal; player "camp wild" lines never classify a villager). New in
  this run: the quote-picker spiral-over-name change is a pre-run
  declared delta (see Deltas 4), not a post-hoc re-score; the stopping
  rule stops at n>=8 regardless of the count rule (see Stopping Rule),
  so a lone-B/C NO-GO is a verdict on the stopped corpus, not a reason
  to extend; the batch size is 25 (not 32) because the sizing math
  (#953: ~1 case per 16 seeds, ~100 seeds) divides cleanly into four
  25-seed batches with a pilot that is itself a full batch.

## Results

(to be filled after the sweep — verdict judged ONLY against this header)

## Metric review (post-run)

(to be filled after the sweep)

## Sense (SENSE-TESTING LAW)

(to be filled after the sweep — transcripts read, beats quoted)

## Village assessment in plain words

(to be filled after the sweep)

## Blanks filled or documented

(to be filled after the sweep)

## Findings for the backlog (coordinator appends — this worker does NOT edit sim-findings.md)

(to be filled after the sweep)
