# sim-routstall-b — preregistration (DIAG ONLY, zero src/js)

- Run: `fleshout-loop-b-20261106T2300Z`, Loop B, arm `sim-routstall-b`,
  worktree `~/workspace/worktrees/sim-routstall-b`, branch `sim-routstall-b`
  (base 987766c0c; rebase onto explicit current master SHA before finishing,
  re-run proof green, report both SHAs).
- Question (finding #1825, Loop A arm sim-baseline9-a,
  evidence/2026-11-06/sim-baseline9-a.md §4): seed 53001 day 41,
  Congregation, BOTH legs, 159 rounds, scholar HP 1.0 at end, monster at
  ~0.59 (0.584 baseline, 0.597 staged), outcome 'routed'. A fight neither
  side can finish, identical across legs on the same seed. Same family as
  the 121-round Strike standoff (finding #1821, a policy loop) but vs an
  attacking monster with the scholar untouched.
- No new seed band is consumed: deterministic reproduction of 53001 +
  existing corpora only (stageally-confirm band 53001–53008 corpus,
  evidence/2026-11-06/perseed-stageally-confirm-b/).

## Method

1. Re-run seed 53001 with the fightinterior recorder lineage
   (scripts/fightinterior-instrument-20261106.js, with the midnightkill
   ±1-day kill matcher and the 'routed'→'rout' normalization from commit
   304ced6cf), both policies (competent baseline verbatim;
   competent-stageally-a staged verbatim), horizon 45d death-aware —
   just past the day-41 fight. No policy or game-code change.
2. Extract the day-41 Congregation trace from each leg: per-round verbs
   (player + ally + monster turns), hit log (damage requested vs applied,
   HP after), positions where recorded, HP curves for scholar and beast.
3. Read the turn-based fight code (tbfight / tbEnd, monster turn, flee /
   rout paths) and name the terminating condition in code with a
   file:line cite. Read docs/MONSTER-WAVES.md for the Congregation
   (wave-4 Mirror Draft: faith as a weapon — genuine absolution at the
   price of obedience; heresy is the counter).
4. Compare directly with the 121-round Strike standoff (51006 staged
   d105, 0 hits, 120 failed moves; evidence/2026-11-06/sim-fightinterior-b.md).
5. Sense-test: read the fight's transcript lines and judge whether the
   stall reads as a fight or as nothing happening.

## Classification bars (DIAG arm — judge the run against this header, §14)

- **D1 deterministic reproduction** — GO iff the day-41 Congregation fight
  reproduces on re-run on the same seed/day/beast/rounds (159 rounds, both
  legs, scholar HP 1.0, beast ~0.59), OR the exact reproduction condition
  is named (e.g. which leg/policy/state differs and why).
- **D2 round-by-round verb + HP census** — GO iff the stall is censused
  round by round: verb counts by actor, damage dealt/taken per side,
  HP curves, and the repeating pattern named (which verb loops, what the
  monster does each round, why neither side's HP moves).
- **D3 terminating condition named in code** — GO iff the condition that
  ends the fight is named with a file:line cite (round cap? flee check?
  tbEnd 'routed'? which branch, what triggers it).
- **DIAG-GO** iff D1 + D2 + D3 all GO. **DIAG-NO-GO** iff any bar fails
  and a recorder re-run cannot answer it.
- Classification verdict (one of): policy loop / engine stall / designed
  attrition — with the evidence for the chosen class and what rules the
  others out. If it is a defect, NAME the fix (do NOT build game code in
  this DIAG arm). If it is a policy loop, name which policy verb loops
  and what blocked-step treatment would break it.
- Guards (reported, not gated): instrumentErrors 0 on both legs; the
  reproduction must not change game behavior (recorder only, zero RNG
  draws, zero game-state writes); no new seed band consumed.

## Metric review

(To be filled at evidence time: whether D1–D3 were the right bars, and
any revision proposed for the next run.)
