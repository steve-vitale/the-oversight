# sim-planignconfirm-b — PREREG (binding)

Run: oversight-flesh-out-loop-b, Loop B run `fleshout-loop-b-20261117T1130Z`,
axis winnability chain, arm sim-planignconfirm-b — CONFIRM of the
planignite-fix lever (tracker blank #1).
Binding prereg: THIS file — frozen before any judged sim. The instrument
clones, analyzer, panel builder, and proof test are built AFTER this
commit; no judged numbers exist yet. Commit this file FIRST
(`scripts/safe-commit.sh "sim-planignconfirm-b: frozen prereg — ..."`),
then build.

## The question, in plain words

The pilot proved the fix ignites plans (no-plan villages 4/8 → 0/8,
departures 91 → 181) — but at a real price: total deaths +14.9/village,
expedition deaths 113 → 280, wave-4 kills FLAT 33 → 29, wave-5 unlocks
6 → 3. The open question is no longer "do plans start" but "do the
departures the fix enables kill beasts or just villagers." This confirm
judges that question on a FRESH band, with a kills-per-departure bar
and a deaths bar the pilot's prereg lacked.

## Prior art (read first)

- `evidence/2026-11-16/sim-planignite-fix-a.md` + prereg — the PILOT
  this arm confirms. Its mechanism section is the lever's justification
  (`winPlanHavenTick` read the plan store directly and could never be
  the first spark); its price section is this confirm's bar set
  (kills-per-departure 0.363 → 0.160, deaths +17.6%, wave-5 6 → 3).
  Pilot numbers verified against its own corpus before this prereg
  was written (recomputed from
  `evidence/2026-11-16/perseed-planignite-fix-a-{control,armed}/`):
  control k4=33 dep=91 launch=80 deaths=678 expd=113 w5=6 nat300=6;
  armed k4=29 dep=181 launch=172 deaths=797 expd=280 w5=3 nat300=3.
  Kills-per-departure uses ALL v4departs rows (launch+hold), the
  pilot's stated definition; kills-per-launch is reported alongside
  (control 0.412, armed 0.169).
- `evidence/2026-11-16/sim-planignite-a.md` + prereg — the DIAG.
- `docs/CANON.md` (read first), `docs/MONSTER-WAVES.md`
  §Monster counters (the 2-observation rule).
- CANON GAP (recorded, not invented): no CANON-registered doc covers
  plan ignition or the winPlan store — checked against the
  `docs/CANON.md` manifest, same gap the pilot recorded. The evidence
  file states this gap instead of inventing canon. The lever changes
  no canon-covered rule.

## The lever (frozen design — already landed on master, env-gated OFF)

In `src/js/win-plan.js`, `winPlanHavenTick` only (pilot commit
`a61f03d22`, on master tip `3cb0782e5` after this branch's clean
rebase — branch had zero unique commits, fast-forwarded): when
`v.winPlan` is absent AND `PLANFIX=1`, initialize the store via the
existing `stateOf(this)`, then proceed through the existing
engagement / profile / Haven checks unchanged. Flag unset =
byte-for-byte old behavior. This confirm makes NO src/js change
unless the verdict is GO (see verdict rule). No threshold, gate, or
price moves; no new seeding path.

## Seed band (FRESH — verified before this commit)

- Band: **103501–103512** (12 seeds), two legs on this tip:
  control (PLANFIX unset) vs armed (PLANFIX=1). Identical seeds,
  competent verbatim, 150d death-aware.
- FRESHNESS CHECK (per `~/workspace/custom-skills/local_seed_band_freshness/SKILL.md`):
  every seed 103501–103512 grepped across ALL of `evidence/**/*.md`
  (0 hits per seed) and across the goal `hidden_files/` (only false
  positives: version strings and pantry numbers, no band
  reservation); the alternate candidate 104101–104112 was also clean
  and is held as the next fresh band, not used here. Named bands
  avoided from prior preregs (spot list): 102601–102608 (planignite
  pilot/DIAG), 102701–102708, 102801–102808, 103021–103028,
  103211–103218, 103221–103228, 103231–103238 (deathcleanup-b),
  89701–89705 + 89760–89767 (journey-endgame r233), 190391–190398,
  190525–190540, 190541–190548, 190581–190596, 150217–150248,
  160201–160208, 170201–170232, 180201–180224, 140101–140224.
  The pilot band is deliberately NOT reused: the confirm must show
  the lever generalizes beyond the villages that exhibited the
  defect, and the pilot band's wave-5 swing (4 → 6 on base drift
  alone) is inside the noise this confirm must not re-measure.
- Forbidden bands from the pilot prereg still apply (no seed outside
  103501–103512 is used).

## Primary metric + GO bars (frozen)

Primary metric: **wave-4 kills per plan departure** — killCalls with
wave === 4, divided by v4departs rows (launch + hold), per leg on
identical seeds. Pilot: control 33/91 = 0.363, armed 29/181 = 0.160.

CONFIRM GO iff ALL hold:

1. **Bar 1 (PRIMARY): kills per departure armed ≥ control.**
   A fall is NO-GO, however small — the pilot's fall (0.363 → 0.160)
   is the defect this bar exists to catch.
2. **Bar 2 (deaths): total deaths armed ≤ control × 1.10.**
   Total deaths = `deaths` rows per leg, summed. The pilot was
   +17.6% (678 → 797) — it would fail this bar as staged. Expedition
   deaths (cause === 'expedition') reported alongside, not judged.
3. **Bar 3 (ignition hold): no-plan villages armed 0/12.**
   No-plan = zero v4creates rows in 150d (the pilot's definition).
4. **Bar 4 (wall): wave-5 unlocks armed ≥ control − 1 AND
   national-by-standing armed ≥ control − 1.** Wave-5 unlock =
   maxWave ≥ 5. National-by-standing = standing ≥ 300 (the pilot's
   definition; scaleRank-national counts reported alongside).
5. **Bar 5: proof green** — `scripts/test-planignconfirm-b.js`:
   static off-mode/gate checks + live unit (off: uninitialized store
   returns null even when engaged; on: store initialized + plan
   created) + live geared fight (encounter gear: a geared scholar
   fighting with a party — never a fresh un-geared scholar alone) +
   D1 (repeatability, recorder ON twice, armed 150d seed 103501) +
   D2 (wrap neutrality, recorder ON vs OFF, armed 150d seed 103501)
   + D3 (drift: confirm-driver control vs pilot-driver control,
   same seed 102601 150d, identical trajectory fingerprints — the
   driver copy must not perturb off-mode behavior).
6. **Bar 6: balanced panel attached** — §15 compare of the two legs
   (`scripts/build-planignconfirm-b-panels-20261117.js`, paired
   seeds, pseudo-policy `planignconfirm-b`), `.md` attached to the
   evidence file. The panel is the instrument; this prereg is the
   judge. A `review_required` / `regression_signal` on a secondary
   metric is an investigation note, not a re-score.

CONFIRM NO-GO (any bar fails) → lever stays env-gated OFF, NO
src/js change, evidence records NO-GO and why; branch kept as
evidence-only. CONFIRM GO (all bars) → flip the default ON (remove
the PLANFIX env gate so the fix is live by default) in its OWN
commit with [needs-eyes] in the message, proof green on the flipped
tip.

## Horizon, policy, death-awareness, legs

- Horizon 150 days, death-aware (dead villages stop simulating),
  policy **competent verbatim** (`scripts/policies/competent.js` —
  sha `df9b7dff4de4`, verified in the worktree before this commit).
  150d because first creations cluster days 6–9 (pilot) — the
  horizon must be long enough for departures to convert into kills
  or deaths, and 150d is the pilot's horizon, keeping the two runs
  comparable.
- Legs: TWO on this tip — control (PLANFIX unset) and armed
  (PLANFIX=1), one shared baseline. Driver:
  `scripts/planignite-confirm-driver-20261117.js` (copy of the pilot
  driver with MODE control|armed, env set in oneRun, same recorder —
  the pilot driver file itself is NOT modified; D3 is the check).
  Outdirs: `evidence/2026-11-17/perseed-planignconfirm-b-control/`
  and `...-armed/`. Analyzer:
  `scripts/analyze-planignconfirm-b.js` (reuses the pilot analyzer's
  `legSummary` + the DIAG classifier; judges the frozen bars above;
  writes `evidence/2026-11-17/planignconfirm-b-analysis.json`).
- Determinism: D1/D2/D3 as in §Primary metric bar 5.
- D3 env hygiene (pilot lesson): set PLANFIX explicitly on armed
  legs ONLY and scrub it from child env — a leaked PLANFIX once
  armed the control leg.

## Sense-testing (mandatory)

Read transcripts. Read the per-village rows as stories. The pilot
found departures targetless/green (target null, partyKillers 0) on
its sampled rows — but the full corpus says 26/91 control and
34/181 armed departures DO carry a killer, and 12/91 vs 7/181 carry
a target. Report on the fresh band whether launched parties ever
carry a killer or a target, and whether the armed leg's launches
are proportionally greener than control's. One village whose
ignition contradicts the day's narration is a finding, not a
rounding error — name it in the evidence.

## Metric review (fill in at evidence time; do NOT re-score mid-run)

- Did kills per departure hold, or did the fresh band reproduce the
  pilot's fall (more departures, same kills)?
- Did the deaths bar bind (total deaths), or did the cost move to a
  cause the bar does not see (report the full death-cause split)?
- Did ignition hold on a fresh band (0/12 no-plan), or does the fix
  only ignite villages that already had the defect?
- Did the wall move (wave-5 / national), and is the move inside the
  noise the base itself generates (pilot: base drift alone moved
  wave-5 4 → 6 at n=8)?
- Was 150d the right horizon, or did armed kills cluster at the tail
  (a day-140+ first wave-4 kill says the horizon matters)?

## Wall numbers (report every run)

National (standing >=300 AND scaleRank), table, wins, wave-4
unlocked, wave-5 unlocked, median survival, wave-4 kills, deaths.
