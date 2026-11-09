# sim-honeststakes-b — prereg (honest-stakes ledger fix)

**Arm:** sim-honeststakes-b (small game-code build) · **Run:** fleshout-loop-b-20261109T1930Z (Loop B) · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Branch:** sim-honeststakes-b, base master `fd306cac1` (verified `git log --oneline -1` before this prereg was written) · **Parent finding:** `evidence/2026-11-09/sim-arenadecomp-b.md`, finding (b).

## The blank (from the parent arm, verified there, not re-litigated here)

`contestDeathsById` reads `{}` on all 8 seeds of the 43001–43008 arenadecomp band after 10 arena deaths. The arena-lost path (`_contestArenaAfter`, `lost`, `src/js/contests.js`) never writes the ledger; only `_contestDie` (player, non-arena) and `_cxKillContestant` (villager) do. Proven live: on seed 43008, Sal is offered The Pit on d28 and told "No one has died in this one yet" — seven days after Howard died in The Pit (d21) in the same run, in the same village. The choice screen reads the ledger at `contests.js:2306` (`(this.state.contestDeathsById || {})[contest.id]`).

## The fix (design, frozen before judged computation)

In the arena-lost branch of `_contestArenaAfter`, write the death into `contestDeathsById` with the SAME keying and counting semantics as the existing writes: `dl[contest.id] = (dl[contest.id] || 0) + 1`, where `contest` is the already-computed `_cxScaledContest(ac)` in that function — the same key `_contestDie` uses. Two guards, both mirroring existing idioms:

1. **Once per contest object** (`ac._arenaDeathLedgered`, mirroring `_contestDie`'s `ac._dieLanded`): a re-entrant call can never write twice.
2. **Only when the death actually landed**: the tbEnd phoenix-link hold (`game.js`, `_held` branch) routes a lost arena fight through `_contestArenaAfter(arc, 'lost')` WITHOUT calling `playerDeath` — the fire holds the death. The ledger counts deaths, not holds, so the write is skipped while a player-bearing phoenix link is pending (`state.phoenixLink && bearerIsPlayer !== false`, the same condition tbEnd uses). The benevolent-lifeline save never reaches this branch at all (it clears the arena routing and calls `_contestEnd`), so no guard is needed for it.

Do NOT change: the death rate, any contest outcome, any other ledger, the choice-screen text template, or the billing. This changes the CHOICE, not the death rate.

## Primary metric (ONE — the thing this run is trying to move)

`contestDeathsById` at end of run on the 43001–43008 band (winseek, 150d, identical seeds before/after): the ledger counts the arena deaths that previously read `{}`.

## GO threshold (pilot gate — the full 8-seed band IS the pilot; no confirm spend follows a GO, the band is the verdict)

GO iff ALL of the following hold:

1. **Ledger truth:** the after-run ledger equals the arenadecomp arena-death join, per seed and per contest: 43001 Pit 1; 43003 Siege 1; 43004 Pit 2 + Gauntlet 1; 43005 Pit 1; 43007 Siege 1; 43008 Pit 3; 43002 and 43006 `{}`. Band total 10. In particular the 43008 pair (Howard d21 + Sal d29, both The Pit) must both appear — the before-run ledger there is `{}`.
2. **Neutrality (G2-style):** before/after fingerprints byte-identical on all 8 seeds — daysAlive, endReason, rank, maxWave, national, table, win, deathCauses, deathKeys, finalPop. Deaths, days, outcomes, and every other headline field unchanged on identical seeds.
3. **Choice-screen honesty (sense):** on 43008, the d28 offer of The Pit to Sal must now read "This one has killed 1 before" (Howard d21), not "No one has died in this one yet". Any other choice-screen record line that changes must change ONLY where a prior arena death in the same contest exists — that is the fix working, and it is enumerated in the evidence file.

A miss on any of the three is NO-GO, never re-scored against a friendlier metric mid-run.

## Guardrails (a GO met with a guardrail breached is NO-GO)

- No change to the death rate, contest outcomes, or any ledger other than `contestDeathsById`.
- `node scripts/check.js --quick` after the change: standing profile is 296 passed / 4 failed (mobile-combat-cadence, occupation-panels, phone-frame-proof, establishment-r20-fixes — pre-existing). Any NEW failure is a loud failure, not a pass.
- Proof script `scripts/test-honeststakes-b.js` green (fixture legs + live before/after legs).

## Horizon, seeds, policies (§§9–10)

- **Horizon:** 150d, death-aware (dead villages stop; +10d tail max). Same as the parent arenadecomp band: the band's measured survival distribution is median 81d, max 150d — 150d covers the whole band with no dead-village ticking.
- **Seeds:** exactly 43001–43008 (the arenadecomp band — the ledger gap was proven on it; no fresh band needed for a fix whose before-numbers already exist on it).
- **Policy:** winseek (`scripts/policies/winseek.js`, UNMODIFIED), default env.
- **Instrument:** reuse `scripts/sweep-arenadecomp-b.js` verbatim (same recorder, same sysSay call-through wrap — the arenadecomp lesson: the harness silences sysSay and it does NOT route through say), run TWICE via env overrides: `PERSEED_DIR=evidence/2026-11-09/perseed-honeststakes-b/before OUT=evidence/2026-11-09/perseed-honeststakes-b/sweep-winseek-before.json` on unmodified code, then `.../after/` + `sweep-winseek-after.json` after the fix. The sweep's own BARE pass runs inside each leg (G2 neutrality of the instrument per leg). Before/after comparison is the recorded-vs-recorded fingerprint equality plus the ledger diff.
- **No balanced-panel compare (§15):** the change writes one ledger counter in a terminal death branch, consumes no RNG, and touches no outcome path; the identical-seed fingerprint equality IS the neutrality proof, stronger than a panel tolerance check for this change class. Recorded here so the omission is a decision, not an oversight.

## Wall numbers (reported every run)

National / table / wins, wave 4–5 unlocks, median survival on the before/after band, in the evidence file.

## Convergence state

**converging** — this arm closes the parent arm's named honesty follow-up (finding (b)); the axis stays NOT converged (national 0/8, wave-5 0/8, wins 0/8 on the parent band under winseek).
