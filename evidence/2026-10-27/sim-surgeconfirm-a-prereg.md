# sim-surgeconfirm-a — PRE-REGISTRATION (binding, written BEFORE any sweep)

Run: fleshout loop A, run fleshout-20261027T1121Z, axis scale-onramp.
Arm: sim-surgeconfirm-a — CONFIRMING MEASUREMENT for the wave-4
arrival surge attribution from run fleshout-20261027T1121Z.
DIAG / MEASUREMENT ONLY — zero src/js changes, zero default flips,
no game lever, no lever proposal. No [needs-eyes] flag applies:
measurement only, no feel/combat/UI change.

## CANON READ FIRST

- docs/CANON.md, docs/MONSTER-WAVES.md. Wave law used here, read
  from canon + code (never invented): wave 4 = The Mirror Draft,
  standing >= 100 (blood / bonds / bread, pure or hybrid);
  wave 5 = The Producers, standing >= 200 AND wave-4 faced
  (bread counts at most 100 toward the t5 bar). Readiness gates
  hold waves 4-5: wave 4 demands 3 armored @ P>=10 / 5 armed /
  3 tricks / 1 living wave-3+ killer (src/js/standing.js
  waveCombatReadiness()).
- docs/MEASUREMENT.md §§9-12, 14-15: pilot gate (8 seeds IS the
  pilot here — the full band is 8 seeds, no confirm spend beyond
  it), death-aware horizons (§10), pre-registration (§11, this
  file), metric binding (§14 — a miss is NO-GO, never re-scored
  mid-run), balanced panels (§15 — see the panel note below).

## CONTEXT READ FIRST

- evidence/2026-10-27/sim-arrivalsurge-a.md + its prereg
  (sim-arrivalsurge-a-prereg.md): verdict NO SINGLE COMMIT, with
  staffing fallbacks (commits 908ad0f12 cook fallback +
  8a7540534 fish fallback, both in scripts/policies/competent.js,
  DEFAULT-ON) as primary CONTRIBUTES and social visibility as
  secondary; attribution share unsettled, with the exact
  confirming measurement named in its UNSETTLED section.
  This arm runs that measurement, in the form specified by the
  coordinator task (two arms on current master, fallback-on vs
  fallback-off, judged by the BINDING PROMOTION RULE below).
- evidence/2026-10-27/sim-w4funnel-repin-a.md + its prereg
  (sim-w4funnel-repin-a-prereg.md): the control table this arm
  must reproduce (see CONTROL REPRODUCTION GATE), the five
  recorders reused verbatim, and the definitions (arrival,
  outcome, fought) reused verbatim.

## SUBSTRATE (fixed before sweeping)

- Seeds 73671-73678 (identical seeds, always).
- Policy: scripts/policies/tableseat-nowait.js, composed upon,
  NEVER edited (LEANLINKRESCUE=1, TABLESEATNOWAIT=1).
- Horizon: 180d death-aware (runDays stops on death/win; 180 is
  the cap, not a fixed horizon — MEASUREMENT §10).
- Two sweeps on current master, same seeds, same substrate,
  both with the five recorders below (armed):
  - CONTROL (fallback-on, policy as-is).
  - FALLBACK-OFF (current master with ONLY the 908ad0f12 +
    8a7540534 fallback hunks in scripts/policies/competent.js
    reverted). Implemented as a separate policy variant file
    used only by the sweep — NEVER a change to
    scripts/policies/competent.js itself (see VARIANT below).
- Do NOT run a social-family (D) third arm; the arrivalsurge
  evidence sequences it after this arm reports.

## PREMISE VERIFICATION (before sweeping — STOP if it fails)

The arm's premise is that tableseat-nowait routes through
competent.js, i.e. the fallback code actually executes on
this band. Verified from code BEFORE any sweep (read, not
assumed):
- tableseat-nowait daily (TABLESEATNOWAIT=1) calls
  leanlinkrescue.daily (scripts/policies/tableseat-nowait.js).
- leanlinkrescue daily (LEANLINKRESCUE=1) calls
  competent.daily unconditionally
  (scripts/policies/leanlinkrescue.js line 128).
- competent.daily calls counterPlay
  (scripts/policies/competent.js line 2829, unless a rescue
  leg already ran), and counterPlay holds both staffing
  blocks: the cook pick (freshKcal > 1500 branch) and the
  fish loop (assignAnother calls).
Empirical probe gate, run before the full sweep: one CONTROL
seed (73671, 180d) must show cookStaffed + fishStaffed > 0
in the final ctx counters (competent staffing executed on
this band). Fallback counters (cookStaffFallback /
fishStaffFallback) are REPORTED on the probe, not gated — a
seed whose top candidate always accepts needs no fallback.
If the probe shows zero staffing, STOP: the premise fails
and no sweep is run. The probe row is the control row for
73671 (reused by the sweep, not re-run).

## VARIANT (fallback-off policy files, sweep-side only)

- scripts/policies/competent-nofallback.js: a copy of current
  scripts/policies/competent.js with EXACTLY the two reverse
  hunks applied: (1) the 908ad0f12 cook block restored to the
  old single-best-pick code (no candidate walk, no
  cookStaffFallback counting); (2) the 8a7540534 fish block
  restored to the old assignAnother (top scorer only, success
  reported without checking {ok:false}, no ctx parameter, no
  fishStaffFallback counting), the fish call site restored to
  no ctx argument, and the added
  `module.exports.assignAnother` line removed. No other byte
  differs. Proof, checked by scripts/test-surgeconfirm-a.js:
  (a) `git diff` between competent.js and
  competent-nofallback.js contains ONLY those reverse hunks;
  (b) competent-nofallback.js is byte-identical to
  `git show 908ad0f12^:scripts/policies/competent.js`
  (no competent.js commit has landed since 8a7540534, so the
  double reversal must land exactly on the pre-fallback file).
- scripts/policies/leanlinkrescue-nofallback.js: a copy of
  leanlinkrescue.js differing ONLY in the require line
  ('./competent' -> './competent-nofallback') and the policy
  id/desc strings.
- scripts/policies/tableseat-nowait-nofallback.js: a copy of
  tableseat-nowait.js differing ONLY in the require line
  ('./leanlinkrescue' -> './leanlinkrescue-nofallback').
- scripts/policies/competent.js itself is NEVER edited in this
  run; `git status` / `git diff` for it must stay empty.

## INSTRUMENTS (recorders reused VERBATIM from current master, never edited)

- scripts/policies/raftdraft-diag.js, spawnsrc-diag.js,
  oldcore-diag.js, w5births-diag.js, defwound-diag.js —
  the same five as the repin.
- sha256 at this base (identical to the repin prereg, proving
  the verbatim claim; re-checked by the proof validator):
  raftdraft 5aef723cb3c902bee6d03eb9b40f8194bbd616a7798049f226c1417194e10b97,
  spawnsrc 31c496ac41e1213095b3b25854a6c7e584cc05c0bbb255e39c9376a0a3da4e17,
  oldcore efedd0cd0999d9f1b4987671b1da791109579ebdf72bb97d7478dc85c6e706cd,
  w5births b2f2d909f0bdc8a3d4bb2fd40e6d70d7a7a578da169e4b3d49ab63b7b0da1ebe,
  defwound 3f3f8eed58bb1a4bf02e124ae47f0ff5255a059339898cc93b1231bcb1fd9401.
- Analyzer reused VERBATIM: scripts/test-w4funnel-diag.js
  (via its exported analyzeW4funnel, applied to each arm's
  rows by the new analyzer script — the analyzer's own CLI
  reads only s<seed>-armed.json, so the new script drives it
  per row instead of renaming rows to fit the CLI).
- New this run (sweep-side only, pure reads, no recorder):
  scripts/test-surgeconfirm-diag-sweep.js — the repin sweep
  adapted: two arms (control / fallbackoff) writing
  evidence/2026-10-27/perseed-surgeconfirm-a/s<seed>-<arm>.json,
  plus, in the daily wrapper AFTER base.daily delegates, pure
  reads only (no writes, no beats, no gated-total call):
  Game.villageStanding() (raw breakdown: total / war /
  diplomacy / plenty / feasts — feasts counts major feasts,
  quality >= feastQualityMin, exactly the standing bread
  input) and Game.waveCombatReadiness(4) (ready flag + four
  bars). The gated villageStandingTotal() is NEVER called by
  the wrapper: it writes peak state and fires hold/release
  beats, so calling it daily would perturb the trajectory it
  measures. First-crossing days are derived from the pure
  reads (see METRICS). Final ctx counters (cookStaffed,
  fishStaffed, cookStaffFallback, fishStaffFallback) are read
  at row-build time from the shared run ctx. No recorder draws
  RNG, throws into the engine, or returns anything but the
  original value; the new reads draw nothing and write
  nothing.
- New proof validator: scripts/test-surgeconfirm-a.js (pure
  corpus analysis + unit checks, no harness, no RNG):
  re-derives the control band, the control-vs-repin
  comparison, the corpus-error counts, the per-seed metrics,
  and the promotion-rule verdict from the corpus files, and
  unit-tests the promotion-rule boundaries. Written before
  the sweep; run after. Exit non-zero on any mismatch with
  the evidence numbers it is given.
- New sense script: scripts/test-surgeconfirm-sense.js
  (parameterized by SEED/ARM/DAYS; NON-MEASURED replay only).

## DEFINITIONS (verbatim from the repin unless noted)

- ARRIVAL, OUTCOME, FOUGHT, LIVING, CUMULATIVE, DIVERGENCE:
  exactly as in the repin prereg (arrival = wave-4
  world-monster birth joined on seq; fled-recovery re-entry a
  NEW arrival; outcome precedence still-present > pending >
  last-removal-kind mapping; fought = resolve row or tbEnd
  for the seq).
- Per-seed metrics (all five, every seed, both arms):
  (i) wave-4 arrivals (analyzer count from the arm's rows);
  (ii) first day standing >= 100 = first daily wrapper point
  at which Game.villageStanding().total >= 100 (RAW total,
  ungated — the gated total is not read, per the instrument
  note above; a seed that never reaches it within its run is
  recorded as null, never imputed);
  (iii) first day readiness-met for wave 4 = first daily
  wrapper point at which Game.waveCombatReadiness(4).ready
  is true (null if never met). NOTE: the first day the gated
  total can release wave 4 is the first day BOTH (ii) and
  (iii) hold (raw >= 100 and ready, peak/cap aside for t4) —
  reported as the derived wave-4-open day, never as a
  separately measured call;
  (iv) major-feast counts = final Game.villageStanding().feasts
  (major feasts, quality >= 1, over the whole run);
  (v) cook/fish staffed counts = final ctx cookStaffed /
  fishStaffed, plus fallback counts cookStaffFallback /
  fishStaffFallback for the fallback-firing check.
- Median first-standing-100 day (promotion rule): the median
  over seeds that REACH standing >= 100 within their run in
  that arm; the reaching count per arm is reported alongside,
  and a median computed over different reaching counts is
  flagged, not hidden. Never-reached seeds are listed, never
  imputed with the horizon or the end day.

## CONTROL REPRODUCTION GATE (report-only, never a stop)

CONTROL must reproduce the repin table:
arrivals 31: tile-entry 28 + scripted-titan 3; headlines
wins 4/8, national-ever 7/8, national-final 5/8, invited 5/8,
entered 4/8, wave-4 5/8, wave-5 0/8, median 130d, deaths 284,
starvation 2. If CONTROL differs, report base movement field
by field; the fallback verdict is then judged WITHIN-RUN
(control vs fallback-off) and the repin table is flagged
superseded — never re-judged, never silently adjusted.
A control difference is NOT a gate failure and does NOT
stop the run: the within-run comparison is the verdict.
Additionally, control-vs-repin exactness on the shared fields
doubles as the wrapper-neutrality check: if control
reproduces the repin armed band exactly, the new pure reads
moved nothing.

## BINDING PROMOTION RULE (verbatim — judge only against this)

EXPLAINS (staffing fallbacks promoted from CONTRIBUTES to
EXPLAINS) iff fallback-off total arrivals ≤ 18 AND median
first-standing-100 day ≥ control median + 5 days. DEMOTE
(surge is chaotic-trajectory noise; fallbacks are a survival
contributor, not an arrivals cause) iff fallback-off arrivals
≥ 24. Otherwise INCONCLUSIVE — neither promoted nor demoted,
never re-scored mid-run.

## SENSE PLAN (selection rule fixed before sweeping)

- Sense seed = the seed with the richest wave-4 thread in the
  CONTROL corpus: most wave-4 arrivals, ties broken by most
  wave-4 kills, then lowest seed number. Its census timeline
  is the authoritative thread. A NON-MEASURED narration replay
  (seed + arm + end day, say/sysSay taps) is run for
  wording/meaning only; if the replay's trajectory shifts past
  the census thread, the divergence is disclosed, not hidden,
  and the replay proves wording only. Replay text never enters
  any count.
- Plus the mandatory plain-words reading: what fallback-off
  villages look like versus control (one thread, clearly
  labeled as color if from a non-measured replay).

## METRIC REVIEW (mandatory section in the evidence file)

Pre-registered metrics bind the run — a miss is NO-GO, never
re-scored against a friendlier metric mid-run. Metric doubts
go here for the NEXT run. No metric is re-scored in this run.

## BALANCED-PANEL / TELEMETRY NOTE (standing exception, carried)

scripts/balance-panel.js cannot ingest per-seed recorder
corpora (twelfth sighting, carried from the repin) — the
sweep-compare table + analyzer output are attached instead,
and telemetry-check is NOT run on recorder rows. No panel
file is faked and no telemetry baseline is rolled on
recorder rows.

## WALL NUMBERS TO REPORT (every run)

national-ever / national-final, table invited / entered,
wins, wave 4-5 unlocks, median survival, deaths, starvation
deaths, wave-4 kills total + per seed, death-cause shares,
plus the five per-seed metrics above for both arms.
