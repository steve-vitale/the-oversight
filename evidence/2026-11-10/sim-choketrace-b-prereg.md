# sim-choketrace-b — preregistration (DIAG ONLY, zero src/js changes)

- Arm: sim-choketrace-b (Loop B run fleshout-loop-b-20261110T1445Z, axis scale-onramp / winnability chain)
- Branch: sim-choketrace-b; base anchor `3838d86dc` (worktree `~/workspace/worktrees/sim-choketrace-b`)
- Instrument: scripts/choketrace-b-driver.js + scripts/choketrace-b-analyze.js (new; derived from scripts/vetcount-b-driver.js — same daily census, competent policy, 150d death-aware — PLUS per-call attribution: caller path from the call stack, settlement-invocation id, fight/monster-instance identity, dead-fighter census, and per-call ledger scoring). Proof: scripts/test-choketrace-b.js.
- Context (must-read): evidence/2026-11-10/sim-vetcount-reconcile-b.md § "The disagreement was bigger than wave 4". The kill-call accounting on seeds 140201–140208 (competent, 150d) shows 32 duplicate recordWaveKill calls across the 8 seeds (2–8 per seed; only 140207 had none). Duplicates cluster as bursts — same day, same monster, same killer, same channel, up to 7 extra reports of one kill (140204 d75 belltoad x7 by Ella Johnson via player; 140202 d54 x7 across belltoad/hummice/giant_mosquito; 140208 d135 congregation by Sam Wilson via companion). The counter now follows the log (one body = one count, landed a80b2d789), so the symptom is contained — but WHICH caller paths re-fire, and whether the ledger's per-type-capped double-score on re-fires matters, is unexamined. That is this arm's question. Do NOT touch the counter/log agreement — no changes to recordWaveKill, the log dedupe, or the counter read.

## Primary metric

**Attribution coverage of re-fire bursts.** A re-fire burst is a maximal group of
recordWaveKill calls sharing one dedupe key (day, mid, by, via, trick) with
size >= 2 (the first call is the kill, the rest are re-fires). DIAG-GO iff
every re-fire burst on the band is attributed to a named caller path, none
UNATTRIBUTED.

## DIAG-GO threshold (strict)

- Every re-fire burst on seeds 140201–140208 is attributed to one of the nine
  named caller paths below; zero bursts classified UNATTRIBUTED.
- For each burst, the attribution states the burst shape: same settlement
  invocation (one fight, several dead fighters of the type — genuine
  multi-body) vs several settlement invocations (separate fights same day),
  with the monster-instance identity where the path stamps it.
- Ledger verdict quantified: for each re-fire call, whether scoreLedgerKill
  scored it twice (cap room existed, add > 0) or it was already capped
  (add = 0); count and verdict on whether the double-score matters.

## Candidate caller paths (from the grep census, read before running)

Nine recordWaveKill call sites, eight `via` channels:

1. `tb-end` — src/js/game.js:46716, tbEnd, via `player` / `companion`.
   One call per dead monster fighter in the fight (snake-lineage deduped);
   tbEnd settles a fight object once (`f.over` guard), so a TB burst is
   either several dead fighters of one type in one fight (pack / belltoad
   chorus `_pendingPack` reinforcements) or several fights the same day.
2. `patrol` — src/js/game.js:8073, resolvePatrol, via `patrol`.
3. `wild` — src/js/game.js:20756, resolveWildMonsterEncounter, via `wild`.
4. `aid-crisis` — src/js/comms.js:669, aidFight, via `aid-crisis`.
5. `contest-blood` — src/js/contestEngine.js:401, _cxBlood, via `contest`.
   Per-wave loop: the same beast type across waves of one contest is the
   same dedupe key, a genuine repeat.
6. `contest-hide` — src/js/contestEngine.js:633, _cxOther (hide), via `contest`.
7. `contest-beastmaster` — src/js/contestEngine.js:661, _cxOther (beastmaster), via `contest`.
8. `sortie` — src/js/havenGrowth.js:913, lingererSortie, via `sortie`.
9. `agency` — src/js/villager-agency.js:465, expeditionMonster, via `agency`.

recordPyrrhicKill has one call site only (game.js:46714, tbEnd, lost fights);
it is recorded for completeness but is not a re-fire path (it never calls
scoreLedgerKill).

## Horizon

150d death-aware (same as the vetcount band: reachability horizon per
MEASUREMENT.md §10 — the bursts live on the vetcount band and the question
is about that band's accounting, not a new lever).

## Seeds

140201–140208 (the vetcount band, identical seeds). Policy: competent
(plain competent policy, as in the vetcount driver).

## Method

1. Recorder derived from scripts/vetcount-b-driver.js. Each recordWaveKill /
   recordPyrrhicKill call stamps: method, day, mid, by, via, trick, logged,
   dup (as vetcount did) PLUS caller path (from the call stack, mapped to
   the nine paths above), settlement-invocation id (wrappers around tbEnd,
   resolvePatrol, resolveWildMonsterEncounter, aidFight, _cxBlood, _cxOther,
   lingererSortie, expeditionMonster — pass-through, no RNG, no state
   mutation), fight/monster-instance identity (tbfight object id for TB;
   fieldFight monster-object id for field paths), dead-fighter census by
   type at call time (TB), and per-call ledger scoring (ledger per-type
   before/after around the call, so each re-fire's add is known).
2. Classify every re-fire burst by caller path; per-path counts; burst
   shapes (same-day / same-killer / same-monster / same-channel, same vs
   several invocations, same vs several monster instances).
3. Ledger question: for each re-fire, inside cap room (scored twice) or
   already capped (no effect). Count + verdict.
4. Scale-wall numbers for the corpus: national / table / wins, wave 4–5
   unlocks, median survival.
5. Proof test scripts/test-choketrace-b.js: determinism (same seed = same
   attribution), attribution completeness on a synthetic burst corpus (a
   forced multi-path re-fire is attributed, never UNATTRIBUTED), neutrality
   (recorder off = byte-identical trajectories vs recorder on).
6. Neutrality cross-check: trajectories vs the vetcount after-leg corpus
   (evidence/2026-11-10/perseed-vetcount-reconcile-b/after/) — same seeds,
   policy, days, fixed engine; days/endReason/maxWave/waveKills must match.

## Attribution limit (stated up front)

The (day, mid, by, via, trick) dedupe key cannot distinguish a re-reported
kill from a genuine second beast of the same type killed the same day by the
same killer via the same channel with the same trick. This arm's attribution
goes one level deeper — settlement-invocation id + monster-instance identity
+ dead-fighter census — which separates (a) one settlement, several dead
fighters of the type (genuine multi-body, e.g. belltoad chorus pack in one
TB fight), from (b) several settlements the same day, and (c) the same world
monster object fought twice (re-fire of one instance) from different
instances. Where a path cannot stamp a monster instance (agency picks a
fresh mdef each encounter; sortie/contest beasts are fresh objects), the
limit stands and is stated as such in the evidence — the burst is still
attributed to its caller path, but the same-instance vs second-beast call
is marked UNRESOLVED for that burst, not guessed.

## Metric review

(To be filled in the evidence file after the run.)
