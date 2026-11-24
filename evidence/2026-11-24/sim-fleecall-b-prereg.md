# sim-fleecall-b — prereg (finding #2602)

**Arm:** sim-fleecall-b, run fleshout-loop-b-20261124T1930Z.
**DIAG, corpus re-read — NO new sims, NO game-code change.**
Base: master tip `6297eb21c` (basedmg merged; confirmed still the tip
at 21:11Z).

> PRESERVATION NOTE (coordinator, 21:36Z): the worker's original file
> (`/tmp/fleecall-draft/sim-fleecall-b-prereg.md`, 7,117 bytes) was
> wiped by the 21:32Z machine restart along with the analyzer, proof
> test, and evidence draft. This file is a faithful reconstruction
> from the worker's checkpoint handoff (delivered 21:12Z), which
> quoted the prereg in full. The evidence file beside it
> (`sim-fleecall-b.md`) is reproduced verbatim from the coordinator's
> read of the worker's draft before the restart. The analyzer
> (`scripts/analyze-fleecall-b.js`, 27,646 B) and proof test
> (`scripts/test-fleecall-b.js`, 13,385 B) were NOT preserved and must
> be re-derived from this prereg on landing. Commit order on landing:
> prereg first (fill in its commit hash here), then instrument, then
> evidence.

## Question

"WINNABLE FIGHTS END ON THE FLEE CALL, NOT ON DAMAGE" — on band
109501–109508, 20/27 launched meetings end vFlee, kill share 0/27.
Sharpest case: seed 109505 day 118 vs The Network Note (Rage lead,
Blooded 1.5×, wb 12/31/44, 8 rounds, 119/round, 952 damage) — fled
with the monster at 95 HP, one round from a kill, lead at 50 HP.

## Corpus (frozen)

`evidence/2026-11-24/perseed-basedmg-b-ctl/` (8 seeds 109501–109508)
+ `evidence/2026-11-24/basedmg-b-analysis.json` (27 launched
meetings: 20 vFlee, 7 vDie). Second sample: fightcap-recheck corpus
(seeds 110101–110108) ONLY where fields match — its logs are truncated
before the flee decision and it carries no `fleeHpFrac` and no fighters
snapshot, so lead HP at flee is NOT recoverable there; its
mHpStart/mDealt/rounds/outcome DO match, so rounds-to-kill IS
computable. Partial second sample only, never pooled. Ctl leg: 1 fled;
arm leg (fightcap lever ON): 4 fled + 1 died, reported separately.

## Frozen definitions (per fled launched meeting)

- `mHpRemaining = mHpStart − mDealt`
- `dpr = mDealt / rounds` (from the analysis JSON)
- `roundsToKill = ceil(mHpRemaining / dpr)` when dpr > 0; `Infinity`
  when dpr = 0 (never a division by zero, never an invented rate)
- `withinOneRound = (mHpRemaining <= dpr)` when dpr > 0, else `false`
- `leadHpAtFlee`: from the transcript — last `hits <lead> for N (M left)`
  line naming the lead, plus any `+N HP` heal lines naming the lead
  after it. Cross-checked against `fleeHpFrac` (leadHp / fleeHpFrac
  must be within 0.6 of an integer max HP — a miss is a parse error,
  not a silent pass).
- `fleeVariant` from the terminal log line: `hopeless` ("sees how this
  ends — and runs…"), `floor` ("is past holding — they run…", with or
  without the "Y answered X's shout, but" prefix), `learn` ("has seen
  enough — withdraws…"), `committed-floor` ("past holding even a
  finished fight"), `other` = UNCLASSIFIED.
- A meeting is `classified` iff variant ≠ `other` AND leadHpAtFlee is
  a number AND roundsToKill is a number or Infinity.

## Frozen bars — judge ONLY against these

| Bar | Pass condition |
|---|---|
| **B1** classification complete | 20/20 fled meetings classified, 0 unclassified |
| **B2** pool floor | fled meetings ≥ 10 |
| **B3** within-one-round share | share stated WITH its denominator (dpr=0 meetings count as NOT within one round) |
| **B4** instrument health | 0 parse errors; analyzer selftest green; determinism byte-identical on re-run; proof test green |

Verdict: DIAG-GO iff B1–B4 all pass; else DIAG-NO-GO naming the failed
bar. **No threshold on the share value itself** — this is a
measurement DIAG; the share IS the finding. No re-scoring; metric
review section in the evidence file. Sense-test: full transcripts of
≥4 fled meetings (sharpest case + low-HP floor flee + long grind +
zero-damage Eulogy flee), judged as sensible human call vs mechanical
tripwire. Mechanism section from code reading (fieldFights.js morale),
line numbers cited.
