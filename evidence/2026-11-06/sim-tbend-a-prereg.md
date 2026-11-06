# sim-tbend-a — prereg: diagnose the 51002 kill-logged-but-never-closed fight

- Run: `fleshout-20261106T2256Z`, Loop A, axis scale-onramp / winnability chain
- Arm: `sim-tbend-a`, branch `sim-tbend-a`, worktree `~/workspace/worktrees/sim-tbend-a`
- Tracker blank: (2) from the 2130Z entry — the 51002 interleaving unexplained at engine level
- Source: `evidence/2026-11-06/sim-pyrrhic-b.md` (metric review: "The 51002
  interleaving is still unexplained at the engine level"), corpus
  `evidence/2026-11-06/perseed-fightinterior-b/` (seeds 51001–51008, committed)
- Canon read: `docs/CANON.md`, `docs/MONSTER-WAVES.md` (wave-4 Strike:
  "a house-sized inflatable rat; it doesn't attack, it shuts the grid down —
  negotiate or scab"; wave-4 gate standing >= 100; readiness bars untouched)

## The shape to explain (corpus facts, verified from the committed file)

- 51002 baseline, day 80, Strike (wave 4), trace seq 2, tbSeq 7:
  fighter grace_obi (via 'player'), 21 rounds, entry HP 1071.
- Hit log: player strikes rounds 4–21; round-21 hit dmg 63, beast HP −14.
- Verb log: strikes rounds 2, 4–20 — NO round-21 verb. Turn log: monster
  turns rounds 1–20 only — NO round-21 monster turn. Monster dealt 0
  damage all fight (Strike does not attack).
- `killsLive` HAS the kill: day 80, strike, wave 4, by grace_obi, via
  'player' — so `recordWaveKill` ran.
- Trace outcome 'unfinished', ending re-classified 'kill-unclosed',
  mHpLeft 0. It was closed as 'unfinished' by the stale path when the
  next fight opened (Eulogy, same day, tbSeq 10).
- Instrument mechanics that constrain the cause: the verb wrapper pushes
  its record AFTER the original call returns, only if the trace is still
  open; the hit wrapper pushes after `tbDamage` returns, same guard. The
  round-21 hit IS recorded but the round-21 verb is NOT — so the trace
  was already gone (closed) by the time `tbPlayerStrike` returned, while
  it was still open when `tbDamage` ran inside that same strike call.
  `t._trace` becomes null only in `closeTrace`, reached from the tbEnd
  wrapper, the startCombat wrapper (stale close), or finalize. So DURING
  the killing strike, either tbEnd ran and something inside it opened a
  new fight (whose startCombat stale-closed this trace before the tbEnd
  wrapper's own close), or a new startCombat ran without tbEnd, or an
  exception escaped after `recordWaveKill` and the trace stayed open
  until the next startCombat stale-closed it.

## Candidate sites (to test, not to assume)

- H1 — tbEnd-internal chain startCombat: `tbEnd('won')` runs, `recordWaveKill`
  logs the kill, then victory/aftermath code inside tbEnd starts a new
  fight; the startCombat wrapper stale-closes the Strike trace as
  'unfinished' before the tbEnd wrapper can close it as 'won'; the tbEnd
  wrapper's close then no-ops on the null/new trace, and the verb push
  is skipped. Predicts: a new (wave < 4) fight opens inside the killing
  strike's call stack, before `tbPlayerStrike` returns.
- H2 — strike-side startCombat without tbEnd: the killing strike (or
  `tbAfterPlayerAction`) opens a new fight directly without calling
  tbEnd. Predicts: tbEnd never runs for the Strike fight; a new fight
  opens inside the strike call.
- H3 — throw after recordWaveKill inside tbEnd: an exception escapes
  tbEnd (or a function it calls) after the kill is logged but before
  tbEnd returns; the tbEnd wrapper rethrows, the verb push never runs,
  the trace stays open until the next startCombat stale-closes it.
  Predicts: a throw observable in a live repro (caught or fatal at the
  driver/policy layer), `tbfight` null (not a new fight) immediately
  after the killing strike.
- Control — the dissolve-without-tbEnd path (`game.js` ~36590: death
  mid-crossing dissolves with result 'dissolved', `tbfight = null`, no
  tbEnd): check whether 51002 is that shape (scholar death
  mid-crossing) or a different one. Corpus already says scholar HP at
  trace end 91.5 (alive), so the dissolve path as written (death-gated)
  should NOT fit — verify against the code, don't assume.

## Primary metric (binding — diagnostic arm)

- GO: a LIVE REPRODUCTION pinning the throw/interleave site — the exact
  code path by which a logged kill's fight trace escapes tbEnd without
  closing — named as file + function + line context, with a reproduction
  script and a proof test (`scripts/test-tbend-20261106.js`) that
  reproduces the kill-logged-but-never-closed shape live. A fix is
  OPTIONAL; the pinned cause is the GO. If the cause is small and the
  fix sits inside fight-close machinery only, a fix may land with proof
  (proof green on the rebased tip). No gate/price/deed/readyDemand
  change. No `table.js` change.
- NO-GO: no live reproduction, or a reproduction that shows the shape
  without naming the site (e.g. "a new fight opened somewhere" with no
  call stack / call site).

## Method

- NO new seed band for the diagnosis: reuse the committed fightinterior
  corpus (51001–51008). If a fix needs a fresh band, do the
  SEED-BAND FRESHNESS check then (read
  `~/workspace/custom-skills/local_seed_band_freshness/SKILL.md` — grep
  ALL dated preregs plus every forbidden/contaminated band list; a band
  named ANYWHERE is used) and record it.
- Reproduce live in a focused harness (seeded, `loadGame`, full
  `src/js/*.js` eval in index.html order minus DOM-only files): open a
  TB fight vs the Strike with a strong player, strike until the killing
  blow, and instrument/wrap `tbEnd`, `startCombat`, `tbPlayerStrike`,
  `recordWaveKill` to record the call order, call stacks, and
  `tbfight` state at each step. Also re-run seed 51002 baseline through
  the fightinterior driver if the focused repro does not reproduce, to
  confirm the shape on the original seed/policy.
- Boundary: do NOT touch the 159-round rout stall (53001 d41
  Congregation) — Loop B claimed it as sim-routstall-b this run (claim
  fleshout-loop-b-20261106T2300Z.json, live). If the diagnosis touches
  rout/stall code, note the overlap in the evidence and stop at the
  boundary — no rout fix here.

## Proof

- `scripts/test-tbend-20261106.js`: the kill-logged-but-never-closed
  shape reproduced live (kill in `killsLive`/waveKillLog, trace never
  closed through tbEnd, verb row lost for the killing round), the
  dissolve path as a control (death-mid-crossing dissolve shape, if
  reachable), and any fix, if landed.
- Regression: re-run `scripts/test-pyrrhic-20261106.js` and
  `scripts/test-fightinterior-20261106.js` green on the final tree.
- Metric review section in the evidence file per docs/MEASUREMENT.md §14.

## Evidence

- `evidence/2026-11-06/sim-tbend-a.md`: pinned site (file + function +
  line context), reproduction, corpus evidence, metric review, and a
  plain-words explanation of what happened to grace_obi's fight.
- SENSE-TESTING LAW: read the fight transcript — does the unclosed trace
  read as a real fight that happened, or as bookkeeping losing track
  of one?
