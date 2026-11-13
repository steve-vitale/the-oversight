# sim-freezeline-a — PREREGISTRATION (arm: pack-leader freeze line, run fleshout-20261113T0715Z)

## Arm
PACK-LEADER FREEZE LINE — findings-backlog blank #6 (2026-11-13, open):
on the OLD far-end base 203a32775 the line "The Pack-leader The Focus
Group is still frozen from your scream." fired 63–64 times across the
8-seed fresh band 190401–190408 — all 64 counted instances on ONE
seed/day (190407 d72, one Focus Group fight: 2 pack-leaders + 8
eye-heads, war_cry re-stunning every round). Observed on the OLD base
only; this arm checks current master FIRST and fixes ONLY if it
reproduces. (Evidence: evidence/2026-11-13/sim-tendexact-confirm-a.md
§Sense-testing; backlog line 2291.)

## Step 1 — CHECK (this prereg covers the check leg only)
- Anchor: current master tip **f7352f946** (worktree
  ~/workspace/worktrees/sim-freezeline-a, HEAD verified, tree clean).
  Driver refuses to run unless `git rev-parse HEAD` == f7352f946.
- Policy: competent VERBATIM (scripts/policies/competent.js as on
  master; sha256 recorded per seed — no policy edits, no candidate).
- Seeds: matched band **190391–190398** (8 seeds, per the brief) PLUS
  targeted seed **190407** — the exact seed of the old-base observation
  (64 lines, d72). WHY both: the phenomenon was seed-concentrated
  (all of it on one seed/day), so the matched band tests whether it
  still happens in general while 190407 tests the exact observed
  instance. Total 9 seeds. This is a reproduction check, not a new
  experiment, so re-running 190407 does not spend fresh-band budget.
- Horizon: **150d death-aware** (MEASUREMENT §10: reachability-class
  horizon; the observed day was d72; villages stop at death).
- Instrument: scripts/freezeline-check-driver-20261113.js — wraps
  Game.say, captures every line matching /still frozen from your
  scream/i with its game day, plus sibling stun-family lines
  (Freeze Tag rooted, Bind strains, "shakes off") and veteran-kill
  announcement lines as sense context. Per-seed JSON to
  evidence/2026-11-13/perseed-freezeline-a-check/ (writeRobust,
  flap-proof, refuse-overwrite). Survival numbers per seed
  (days, endReason, scaleRank, maxWave, standing, deaths) recorded
  alongside, so a step-2 fix has its before-leg on identical seeds.
- §15 note: the check is a single-leg reproduction measurement, not a
  before/after lever comparison — no balanced-panel compare applies
  to the check leg. If step 2 runs, the after-leg re-runs this same
  driver on the same seeds and the comparison is the per-seed freeze
  counts + survival numbers (narration-only: survival must be
  identical on the same seeds).

## Primary metric (check)
Freeze-line repeats: total count of the line across the check set,
and max per seed-day.
- REPRODUCES (proceed to step 2) if the line fires **≥2 times on the
  same seed-day on ANY check seed** (maxPerDay ≥ 2) — the old-base
  shape (same day, same line, repeated) is still present.
- KILLED-ON-CHECK (verdict CHECK-NO-REPRO, NO-GO, no code change) if
  maxPerDay ≤ 1 on every check seed — the line fires at most once
  per day, i.e. the repetition is gone upstream.
- The old-base reference numbers: 64 total, maxPerDay 64 (190407 d72),
  0 on the other 7 seeds of 190401–190408 (recounted from the
  tendexact corpus this run; the evidence file says 63 — the recount
  is 64, see evidence §Check).

## Step 2 — FIX (only if it reproduces; design sketched here, NOT pre-committed)
- Emit site: src/js/game.js tbMonsterTurn, the `m.stunned > 0` branch
  (~line 43252): decrements the stun and says the line on EVERY
  monster turn while stunned. War Cry bellow re-applies a 1-turn stun
  per round (abilityActions.js war_cry.bellow, applyStatus stun
  turns:1, ~60% fail per enemy), so a bellowing scholar re-stuns the
  same leader every round and the line fires once per leader per round.
- Minimal dedup (design to be finalized in evidence if step 2 runs):
  announce the freeze once per monster per fight (first stunned turn
  in that fight says the line; later stunned turns in the same fight
  stay silent). The stun MECHANIC is untouched — the monster still
  loses its turn, the fight plays identically; only the narration
  dedups. Sibling lines (Freeze Tag / Bind per-round lines) are OUT
  of scope unless they share the emit site.
- GO bar for the fix (pre-registered now so step 2 cannot move it):
  after-leg maxPerDay ≤ 1 on every seed AND total freeze count ≤
  number of distinct stunned-monster fights; survival/wave numbers
  BYTE-IDENTICAL to the check leg on the same seeds (narration-only:
  any survival move rejects the fix). Proof test
  scripts/test-freezeline-a.js must show the line firing once where
  it fired dozens (RED on pre-fix code, GREEN on fixed code).
  Fix commit carries [needs-eyes] (narration/feel change).
- Canon: no canon doc covers the scream-stun narration
  (MONSTER-WAVES.md has no scream/stun lines; CANON.md manifest
  checked). The fix is narration hygiene, not a canon change — said
  so in evidence, not invented.

## Sense notes in scope
- Double veteran-kill announcement (one instance, 190406 d40, same
  family): sense note only — if the same emit site causes it, say so;
  do NOT expand the arm to fix it unless it shares the fix.
- Read surrounding fight lines for coherence (SENSE-TESTING LAW).

## Convergence
killed-at-pilot if the check does not reproduce; converging if the fix
lands and the after-leg meets the GO bar above.
