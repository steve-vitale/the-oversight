# Readiness-5 release re-measurement — Loop A, run fleshout-20261103T2315Z, arm sim-ready5-a

Axis: scale-onramp (standing directive: the scale wall). DIAG-ONLY
arm: zero src/js changes. This arm re-measures, on the CURRENT
anchor, whether readiness-5 actually releases. It is tracker blank
3 from the 1945Z scale-onramp closeout / blank 5 from round 1819,
owed after the TB-lethality arm (DIAG-GO) and the party arm (wild
ally-join fix, landed). It proposes and makes NO gate/price/deed
change: gates stay untouched unless Steve orders otherwise; this
arm measures only.

## Calibration gate — DIVERGED, re-baselined (paid BEFORE this prereg)

Per the task brief and the 1819 metric review, the unmodified
w4convert driver was rerun on seed 99107 at THIS anchor before
any judged leg:

| seed 99107 | 1819 (anchor e742fa57) | this anchor (42f0bd49f) |
|---|---|---|
| days / end | 80 / village-lost | 38 / village-lost |
| spawns / TB / field / kills (wave 4) | 3 / 2 / 0 / 2 | 0 / 0 / 0 / 0 |
| maxWave | 4 | 3 |

Calibration file:
`evidence/2026-11-03/perseed-w4convert-a/w4convert-s99107-ready5-calib.json`
(anchorCommit 42f0bd49f821, 0 instrument errors, 0 orphans).

Cause (proven by `git diff`, not assumed): between the 1819
anchor and this anchor, `scripts/policies/competent.js` gained
+237 lines (gap-audit11 leg 1: the competent policy now presses
held combat-ability buttons in fights, where it previously pressed
only garden buttons; plus deadfall-duty staffing, gap-batch
items 14+15) and `src/js/game.js` gained gap-batch items
13/16/17/18, journey-scale r92 peer tending, and equipment
weapon-profile work. The policy named "competent VERBATIM" is
therefore a DIFFERENT policy than 1819's, so identical seeds
trace different villages. The TB-lethality arm's calibration at
its own anchor (77ff4a80) still matched 1819 exactly — the move
happened after that anchor, inside the gap-batch landings.

RE-BASELINE (binding on this arm): the 1819 numbers (ready days
76–80 on 99107, standing 150 vs the 199 hold, 28 exposures / 2
kills) are the PREVIOUS anchor and must NOT be pooled with this
arm's numbers and must NOT be cited as this arm's baseline. This
arm's baseline is its own judged leg on the current anchor.
Any funnel comparison to 1819 in the evidence file is
descriptive, anchor-move-aware, never a before/after claim.

## Door / release rule, as found in code (not taken on faith)

Read from `src/js/standing.js` (`villageStandingTotal`,
`waveCombatReadiness`, `standingDeferral`, `standingCfg`) and
`src/js/game.js` (`unlockedWave`), current anchor:

- Standing breakdown: `villageStanding()` = war (25 per wave-3+
  ledger kill point) + diplomacy (34 per seasoned regional+
  link) + plenty (20 per major feast, quality >= 1).
- Thresholds: t4 = 100, t5 = 200. Plenty counts at most
  plentyCapT5 = 100 toward the t5 bar (capped total).
- Readiness-5 demands (`readyDemand[5]`): armored 4 at armor P
  >= 15 (armor WORN, never pack), armed 6 (weapon equipped or
  carried), tricks 3 (counters known), veterans 2 (living
  roster members with a wave-4+ kill in `state.waveKillLog` —
  verified: the gate counts entries with `e.w >= w-1 = 4`,
  distinct `e.by`, living only by the gate's own living test:
  the scholar always counts as living, other villagers via
  `vpOf(vid)` not dead; VETSHAPE env is OFF by default, so
  dead killers do NOT count).
- Gated-total release to wave 5 requires ALL of: capped total
  >= 200 AND readiness-5 ready (all four bars). While capped
  >= 200 but readiness-5 is not ready, the gated total holds
  at t5-1 = 199 (the "199" in 1819 is the HOLD value, not a
  threshold the village must reach — a village at raw 150 was
  never near the hold at all; it was standing-short). While
  raw >= 200 but capped < 200, the plenty-cap hold also binds
  at 199. Once released, `_standingPeakWave = 5` ratchets the
  floor at 200 forever.
- `unlockedWave() == 5` additionally requires the wave-3 rung
  (day >= 25 AND wave-2 ledger points >= bar) AND wave-4 faced
  (`waveEngaged(4) > 0`). Peak release alone does not put wave
  5 in the pool without those two.
- "Release" in this arm = the gated total recording peak 5
  (the `_standingReleaseBeat(5)` event / peak transition).
  "Door-open" is used for the same event. "Wave-5 faced" is
  stricter: `unlockedWave() >= 5` observed, or wave-5 faced
  recorded in the deed feed, or a wave-5 spawn/fight observed.

Instrument neutrality note: the daily snapshot NEVER calls
`villageStandingTotal()` or `unlockedWave()` — both are
side-effecting (they record the peak and fire release/hold
beats). The snapshot reads only read-only functions
(`waveCombatReadiness`, `villageStanding`,
`standingPlentyCappedTotal`, `standingDeferral`,
`_standingPeakWave`, `waveEngaged`, `scaleRank`). Door-open
events are therefore observed as the ENGINE announces them
(release say-lines + peak transitions across snapshots),
never manufactured by the instrument. A single end-of-run
`unlockedWave()` call is reported separately and is NEVER
counted as a natural door-open; if that end call itself moves
the peak, it is classified `end-call-release`, not a release.

## Pre-registration (binding, §11/§14)

- Policy: `scripts/policies/competent.js` `{competent}` VERBATIM
  (the CURRENT file at this anchor — see calibration note
  above), default env. No env overrides.
- Seeds: 99101–99108 (the 1819 band, re-baselined above).
- Horizon: 140 days, death-aware (dead villages stop
  simulating; never a fixed 200d). 140d was adequate in 1819
  (all 8 villages died before the cap) and matches the
  reachability question (waves 4–5, national, table, wins).
- Balanced panel (§15): INAPPLICABLE — pure diagnostic, no
  before/after change; no comparison is fabricated.
- Primary metric: per-day readiness-5 bar table completeness
  and reconciliation (see DIAG-GO bar), NOT a reach count.
- Primary questions: (a) how many villages reach
  readiness-5-ready days on the current anchor? (b) does
  readiness-ready lead to release/door-open, and if not, what
  exactly blocks it (standing shortfall with war/diplomacy/
  plenty split? plenty cap? readiness bar? wave-3 rung /
  wave-4-faced for pool entry?)? (c) what does the funnel
  look like now (ready days, door opens, wave-5 faced) —
  described on the current anchor, with 1819 shown only as a
  previous-anchor reference, never pooled.

## DIAG-GO bar (pre-registered; no threshold on reach counts)

GO requires ALL of:
1. All 8 seeds measured with a complete per-day bar table
   (armored/armed/tricks/veterans vs demand, standing raw +
   capped + war/diplomacy/plenty split, peak, deferral,
   w4faced, w3 rung, scale rank) from first day to village
   death or horizon.
2. Ready-day counts reconciled against veteran kill events:
   every counted veteran reconciles to a wave-4+ kill entry
   in `state.waveKillLog` for a living roster member; every
   wave-4+ kill event is accounted for (counted veteran,
   dead killer, or non-roster killer — none silently dropped).
3. 0 unclassified release/door events: every peak transition
   to 5 and every release say-line is classified (natural
   release, end-call-release, or explained artifact); 0
   release lines without a matching peak state, 0 peak
   transitions without a line or a stated engine path.
4. Instrument health: 0 instrument errors, 0 orphan events
   (0 unlinked wave-4+ kill rows, 0 veteran-recount
   mismatches between the gate count and the instrument's
   independent waveKillLog recount).

A miss on any leg is DIAG-NO-GO and is reported as such; no
metric is re-scored mid-run (§14). No threshold is set on how
many villages reach ready — this is a diagnostic.

## Sense-testing law

Transcripts are read: standing/hold/release say-lines and a
sample of kill-beat lines per seed are judged for meaning,
coherence, repetition, and robotic behavior — never just
counts. The sense sample lives in the per-seed JSONs
(`standingLines`) and is quoted in the evidence file.

## Deliverables

- `scripts/ready5-instrument-20261103.js` (snapshot +
  recordWaveKill wrap + say/sysSay line capture + tele death
  wrap), `scripts/ready5-driver-20261103.js`,
  `scripts/ready5-analyze-20261103.js`,
  `scripts/test-ready5-20261103.js` (proof: bar math,
  veteran-to-kill linkage, door-rule reading, live-harness
  smoke) — green BEFORE the judged leg.
- Per-seed JSONs under
  `evidence/2026-11-03/perseed-ready5-a/`.
- Evidence `evidence/2026-11-03/sim-ready5-a.md` with a
  "metric review" section (§14; no in-run re-scoring).
- Zero src/js changes. No push, no bump, no live verification
  (coordinator merges --ff-only; ship loop owns deploys).
