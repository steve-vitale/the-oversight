# sim-applystatus-a — PREREGISTRATION (arm: applyStatus freeze-line dedup, run fleshout-20261113T1115Z, Loop A)

## Arm
APPLYSTATUS FREEZE LINE — sim-findings.md #2294 (2026-11-13, open):
on the freezeline-a corpus the stun-application line "X is frozen —
War Cry. (stunned: no movement)" fires ~10x per fight (190396 d89
Big Loud, d130 Congregation). Same repetition class as the fixed
"still frozen from your scream" line (Loop A arm sim-freezeline-a,
LANDED 4a2cc89de), one layer down: a DIFFERENT emit site (the
applyStatus stun application in src/js/statusEffects.js, not the
skipped turn in tbMonsterTurn). Each bellow re-freezes, so each firing
is arguably honest — judged by SENSE-TESTING LAW: ten identical lines
for one fight reads as a stuck record. This arm checks current master
FIRST and fixes ONLY if it reproduces.

## Step 1 — CHECK (this prereg covers the check leg only)
- Anchor: **6a16152d5db0ebd1917387f24687d5752c910d1d** (worktree
  ~/workspace/worktrees/sim-applystatus-a, branch sim-applystatus-a,
  HEAD verified, tree clean). Driver refuses to run unless
  `git rev-parse HEAD` == 6a16152d5. Note: local master tip
  a1288c5c4 is a version-bump-only commit (index.html/sw.js/build.js/
  version.json — no game-logic change), so 6a16152d5 IS current master
  for every src file this arm touches. Sibling Loop B arm
  sim-combatdedup-b (strike/kill lines, findings #2293) has NOT landed
  on master — its commits 99531d01b/d1cba2acd live on its own branch
  only, and it touched src/js/game.js only. This arm's fix site is
  src/js/statusEffects.js — no file overlap, no duplication.
- Policy: competent VERBATIM (scripts/policies/competent.js as on
  master; sha256 recorded per seed — no policy edits, no candidate).
- Seeds: matched band **190391–190398** (8 seeds) PLUS targeted seed
  **190407** — the exact seed family of the freezeline-a observation
  (190396 d89/d130 are the applyStatus observation days, same band).
  WHY both: the phenomenon was seed-concentrated, so the matched band
  tests whether it still happens in general while the band already
  contains the exact observed instance (190396). Total 9 seeds. This
  is a reproduction check, not a new experiment.
- Horizon: **150d death-aware** (MEASUREMENT §10: reachability-class
  horizon; the observed days were d89/d130; villages stop at death).
- Instrument: scripts/applystatus-check-driver-20261113.js (adapted
  from the freezeline-a driver, same harness shape) — wraps Game.say,
  captures every line matching /is frozen — .*\(stunned: no
  movement\)/i with its game day, plus the sibling "still frozen from
  your scream" line count as a control (must stay at the freezeline-a
  after-leg values: total 21 across the band) and veteran-kill lines
  as sense context. Per-seed JSON to
  evidence/2026-11-13/perseed-applystatus-a-check/ (writeRobust,
  flap-proof, refuse-overwrite). Survival numbers per seed (days,
  endReason, scaleRank, maxWave, standing, deaths) recorded
  alongside, so a step-2 fix has its before-leg on identical seeds.
- §15 note: the check is a single-leg reproduction measurement, not a
  before/after lever comparison — no balanced-panel compare applies
  to the check leg. If step 2 runs, the after-leg re-runs this same
  driver on the same seeds and the comparison is the per-seed
  applyStatus-line counts + survival numbers (narration-only:
  survival must be byte-identical on the same seeds).

## Primary metric (check)
ApplyStatus freeze-line repeats: total count of the line across the
check set, and max identical-text group per seed-day.
- REPRODUCES (proceed to step 2) if any identical line text fires
  **≥2 times on the same seed-day on ANY check seed** — the old-base
  shape (same day, same line, repeated) is still present.
- KILLED-ON-CHECK (ALREADY-CORRECT, stop, no fix) if every
  (day, line-text) group has size ≤ 1 on all 9 seeds.

## Fix GO bar (pre-registered, judges the after leg)
- (a) applyStatus freeze total never rises on any seed.
- (b) every (day, line-text) group's size equals its distinct
  (fight, monster) count — verified by a diagnostic replay for any
  group > 1 (two different monsters, or two different fights, may
  honestly share one day and one text; the freezeline-a after-leg
  proved exactly this shape on 190398 d138). A group > 1 that the
  diagnostic shows is the SAME monster in the SAME fight is a FAIL.
- (c) survival/wave numbers BYTE-IDENTICAL on all 9 seeds (days,
  endReason, maxWave, standing, scaleRank, endPantryKcal, FULL deaths
  arrays) or the fix is rejected.
- Metric binding (§14): a miss on (a)/(b)/(c) is NO-GO, never
  re-scored against a friendlier metric mid-run. If the metric proves
  wrong, it is written under "metric review" in the evidence file and
  the revision proposed for the NEXT run.

## Fix design (intent, decided from the code before the check leg)
- Dedup at the applyStatus emit site ONLY (src/js/statusEffects.js
  applyStatus, the `!opts.silent` say of def.applyText). Once per
  monster per fight, keyed on the live fight object (this.tbfight —
  fresh per fight, same shape as freezeline-a's f._stunAnnounced).
- NOT once-per-stun-application: every stun source applies exactly 1
  turn (War Cry bellow, tripwire, scream), so each bellow IS a fresh
  application — per-application dedup would change nothing (the ~10x
  case would still fire ~10x). The bellow itself announces each fresh
  stun ("N of them flinch, losing their next turn. (War Cry)"), so the
  player is told at application time; the applyStatus line is a
  per-monster first-announcement that needs saying once.
- The stun MECHANIC is untouched: entry refresh, turnsLeft, legacy
  bridge (m.stunned), resistance/immunity all behave exactly as
  before; only the say() dedups. Out-of-combat / scholar applications
  (no live tbfight) narrate every time, unchanged — the never_silent
  rule (statusEffects.js header) holds outside fights.
- Do NOT touch the tbMonsterTurn site fixed by freezeline-a, and do
  NOT touch any file the sibling combatdedup-b arm owns (game.js
  strike/falls/snaps dedup). Narration/feel change: commit message
  carries [needs-eyes].

## Canon
- docs/CANON.md read: no canon doc covers scream-stun narration
  (MONSTER-WAVES.md has no stun/scream lines; grep confirms). The fix
  is narration hygiene, not a canon change.
- Mechanic sources (all turns:1): abilityActions.js war_cry.bellow
  (applyStatus stun, source 'War Cry', non-silent) + game.js:40704
  villager War Cry + game.js:42559 player bellow + game.js:42870
  tripwire (rounds:1, no source, non-silent). Scream stuns
  (game.js:38264/40563) and paparazzo flash (43784) are silent:true —
  they never emit this line.
