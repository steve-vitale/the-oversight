# Recoverylong test — Loop B, arm sim-recoverylong-b

Axis: scale-onramp / winnability chain (the recovery leg of the
polityfrag diagnosis). This arm tests ONLY the HELD
zombie-clear rule, never tend-through, never bundled
(0930Z: never bundled). Gates, win prices, and deed
gates stay UNTOUCHED. The ability-use game-code
follow-up is a separate builder arm owned by the main
session — not rebuilt here.

## Context read before this prereg

- evidence/2026-11-04/sim-recovery-zombie-b.md and
  sim-recovery-zombie-b-prereg.md (Loop B 0930Z, NO-GO).
- docs/CANON.md (manifest) read first; docs/SCALE.md
  read for the 0930Z arm and re-cited here: a polity is
  one primary with >= 3 SEASONED subordinates; seasoned
  = 30+ days old AND trust 40+; national cannot stage
  until Haven has been regional for a full season. No
  canon doc covers the diplomacy pipeline's day-to-day
  trust mechanics in the same detail — stated here
  instead of inventing canon; trust mechanics are read
  from src/js/hierarchy.js, as in the 0930Z prereg.
- docs/MEASUREMENT.md §§9–12, 14–15 apply as the loop
  brief encodes them (pilot gate, death-aware horizon,
  pre-registration, metric binding, balanced panel
  where a comparison exists — see the panel note).

## Question (the blank left by 0930Z)

The 0930Z NO-GO proved the mechanism and disproved the
recovery on its corpus: the clear works in the wild
(seed 99402: faded line d140, broken snapshot d141,
pre-clear determinism exact over 131 snapshots) but
the village died d141, one day after the clear, pantry
1,000 kcal vs the 12,000 proposal gate and ~35 days
short of re-seasoning. Re-proposals 0, re-links 0,
recoveries 0 on all 8 seeds. Other collapsed seeds
never reach trust 0 in life. Tend-through prevention
works, but post-drop recovery is still unproven.
Question: on a FRESH seed band, does any village
survive a zombie clear long enough — >= 35 days, with
pantry >= 12,000 kcal at re-seasoning — for a
re-proposal or re-link to land?

## The rule (cherry-picked, not re-invented)

ONLY commit c42730d4d from branch sim-recovery-zombie-b
is cherry-picked onto this branch (not the pilot /
evidence commit, not a wholesale branch merge): in
linkTick's Haven-primary branch, after the week's
tribute accounting and the speaker-death check, a link
with `primary === 'haven'`, `status === 'active'`, NOT
conquered, with `trust <= 0` is said aloud and broken
via `breakLink(id, 'faded')`. Its proof suite
(scripts/test-recoveryzombie-20261104.js) must be
green on this branch before any verdict sims (verified
34/34 at cherry-pick). If the cherry-pick had
conflicted, this worker would have FAILED LOUDLY to
the coordinator rather than hand-editing the rule —
it did not conflict (clean cherry-pick, 2 files:
src/js/hierarchy.js + the proof).

## Pre-registration (committed before any verdict sim)

- Policy (judged legs): scripts/policies/leadcourt.js
  {leadcourt} VERBATIM, default env. No policy file is
  created or edited. Same substrate as the 0930Z
  zombie pilot: same policy, same diplo instrument
  (scripts/diplo-instrument-20261104.js reused
  verbatim), same 300d death-aware horizon, same
  snapshot discipline (daily snapshot never calls
  villageStandingTotal or unlockedWave; ONE end-of-run
  unlockedWave call reported separately, never counted
  as a natural door-open).
- Seeds (judged legs): 99801–99808 — FRESH. Freshness
  verified before this prereg against dated evidence:
  0 hits for each of 99801–99808 in
  evidence/2026-11-04/*.md and 0 hits in
  evidence/2026-11-04/perseed-*/ corpus filenames
  (the 99xxx bands used today are 991, 993, 994, 995,
  996, 997; 992 was excluded because it is named in
  today's standacc/diplo preregs as an extension band).
  The band is the next free block in the 99xxx series,
  chosen BEFORE any verdict sim — not selected for
  long life, not swept for a pass.
- Horizon: 300 days, death-aware (dead villages stop
  simulating; +10d tail max as implemented by runDays).
  WHY 300: same as 0930Z — the clear, when it comes,
  comes late (0930Z: d140), and 35+ days of post-clear
  life must be observable; death, not the cap, is
  expected to end these runs.
- Legs: TWO runs on identical seeds, one shared
  baseline in-run — ARMED (rule on, current HEAD) and
  CONTROL (rule off). The control is produced by
  swapping src/js/hierarchy.js for its HEAD~1
  (pre-rule) version for the control run only, then
  restoring the armed version and verifying
  `git diff HEAD -- src/js/hierarchy.js` empty before
  any verdict is written. HEAD (and therefore the
  recorded anchorCommit) is identical for both legs;
  the only difference between legs is the one rule.
  Instruments: scripts/test-recoverylong-driver-
  20261104.js (output evidence/2026-11-04/
  perseed-recoverylong-b/, RUN=recoverylong-armed /
  recoverylong-control; refuses to overwrite) and
  scripts/test-recoverylong-analyze-20261104.js
  (self-contained clear detector, same definition as
  0930Z). Analyzer proof
  scripts/test-recoverylong-20261104.js must be green
  before verdict sims (verified 14/14 at prereg).
- PRIMARY METRIC (per seed, armed leg): clear events
  (Haven-primary link active -> non-active with trust
  0 at break, named with day and village) + survival
  after clear (death day minus first broken snapshot
  day when lost; censored at last snapshot when alive
  — snapshot-based, conservative by the 1-day
  say/snapshot lag documented in 0930Z) + re-proposals
  / re-links after a clear + diplomacy recovery after
  a clear + pantryKcal at that recovery's snapshot.
- GO THRESHOLD (binding): GO iff at least 1 armed
  seed has ALL of: (a) a clear, (b) a re-proposal OR
  re-link after the clear, (c) survival after clear
  >= 35 days, AND (d) a post-clear diplomacy recovery
  whose snapshot pantryKcal >= 12,000. Otherwise
  NO-GO, with the blocker named. If the pilot yields
  zero clears surviving 35+ days, that IS the NO-GO
  result: the evidence reports the full
  survival-after-clear distribution and names the next
  lever for the next run — this worker does NOT keep
  sweeping unregistered seeds to hunt a pass, and does
  NOT expand to 12–16 on its own authority.
- COST BAR (paired, armed vs control on the same
  seeds): starvation deaths armed <= control + 2 on
  totals AND on per-seed excess (armed minus control
  per seed, floored at 0, summed) AND armed median
  survival >= 0.8 x control median. A cost-bar failure
  is reported as a cost failure alongside the GO/NO-GO
  verdict, never folded into it silently. Starvation =
  deathEvents cause 'starvation' via the polityfrag
  analyzer's deathCauses.
- SECONDARY (reported, not judged): wall numbers every
  run — wins, national / table (scaleRank), wave 4–5
  unlocks (peak transitions) and facing (waveEngaged),
  median survival, wave reach 1–5, death-cause shares,
  ready days. Arc reach: not instrumented by this arm
  (stated, not faked). Table: not instrumented (stated,
  not faked).
- SENSE-TEST (SENSE-TESTING LAW): read the clear +
  aftermath transcripts and judge them as a player
  (is the faded line legible? does the aftermath read
  as a real recovery chance or a formality?).
- BALANCED PANEL (§15): the comparison is the PAIRED
  per-seed before/after on identical seeds (armed vs
  control legs above) — that pairing IS the panel
  discipline for this corpus. scripts/balance-panel.js
  is attempted as a supplement after the legs; it
  expects panel-format corpora (communityExposure
  etc.), not diplo per-seed JSONs, so if it refuses
  for field-shape reasons the refusal is recorded
  honestly and the paired per-seed table stands as
  the comparison — no panel comparison is fabricated.
- TELEMETRY DEVIATION CHECK: attempted after the legs
  (node scripts/telemetry-check.js against
  hidden_files/telemetry-baselines/scale-wall.json);
  if the tool refuses for field-shape reasons, the
  refusal is recorded honestly, never fabricated.
- The 8 seeds ARE the pilot/screening leg; do NOT
  expand to 12–16 on this worker's own authority —
  report the pilot verdict and let the coordinator
  decide on confirm.

## Metric review (placeholder — completed in the evidence file)

- The evidence file carries the completed metric review:
  what the metric proved, what it missed, and any revision
  proposed for the NEXT run (never applied in-run).
