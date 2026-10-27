# Journey crisis r58 — REFUSED SORTIES NO LONGER EAT THE SLOT, AND THE BLOODIED ARE NO LONGER COUNTED DEAD (lane B, leg 6)

Direct handoff from r57's metric review §1–§2 (instrument fixes, not
game changes). Pre-registration:
`hidden_files/evidence/2026-10-27/journey-crisis-r58-prereg.md`
Instrument: `scripts/journey-crisis-r58-delayed-20261027.js` (r57
driver verbatim EXCEPT: lingerBook sorties increment gated on
ret.ok; DEATH_SAY_RE died/dead word-boundaried) +
`scripts/analyze-crisis-r58-delayed-20261027.js` (r57 analyzer
verbatim EXCEPT glob + refused-book check + bloodied-line check) +
`scripts/test-crisis-r58-instrument.js` (before/after proof test,
green before the panel ran and re-run after).
No src/js change this run (instrument only).
Policy: oracleV2, 120d death-aware (+10d tail). Delayed rule unchanged.
Per-seed records:
`hidden_files/evidence/2026-10-27/journey-crisis-r58-delayed-seed{9405,9406,9407,9409,9412}.{json,log}`
plus sheltered transcripts. Base: 112cd5154 (r57's base 64554bac6
plus landings since; the pilot reproduces r57 exactly, see E3).
Analyzer output:
`hidden_files/evidence/2026-10-27/journey-crisis-r58-analyzer.txt`

## Headline verdict: Q1 PROVEN LIVE, Q2 PROVEN LIVE

Q1 — a refused sortie no longer consumes a sortie slot, proven on
the known refusal seed 9412 (r57's d57 no-fighters callback refusal):
- r57 book for the episode-2 callback: sorties 1, lastSortieDay 57.
- r58 book for the same object: sorties 0, lastSortieDay null — and
  the same holds for every refused target on d57 AND on the d58
  retries (refused-book check: 12 target rows, all bookSorties 0,
  refusedDayIsLastSortie false).
- The behavioral difference is visible, not just bookkeeping: with
  the slot unconsumed, the driver RETRIES on d58 (two further
  no-fighters refusals, attempts 3 total on 9412 vs 2 in r57),
  because eligibility (sorties 0, nights waited >= 3) still holds.
  In r57 the consumed slot plus the 3-day-after-last-sortie rule
  blocked any retry before the d58 game-over. A refused call now
  costs the village nothing in the book — the siege, not the
  refusal, is what kills it.
Q2 — "bloodied" no longer counts as "died", proven on the known
stare-down seed 9409 (r57's Ella d33 line):
- r57 9409: bloodied deathsDuringSay lines = 1 (Ella stood down
  the Flashbulb Moth, "3 rounds, bloodied but breathing").
- r58 9409: the same line is still present in the call lines, but
  bloodied deathsDuringSay lines = 0. Everything else on 9409 is
  identical to r57 (95d game-over, 0 alive, 0 pantry, one ok
  sortie d33).
- True deaths are still captured: 9406 d121 Dina lines ("Dina is
  dead", "Dina faced The Ugly Thing... and didn't come back") all
  still land in deathsDuringSay, and muster-aware mismatches stay 0
  across the full 5-seed panel.

## Pre-registered verdicts (§14 — bindings, not re-scores)
- E1 refused-sortie bookkeeping: GO — 3 refusals captured (d57 +
  2× d58 on 9412), every refused target's book untouched
  (sorties 0 / lastSortieDay null), and the retry behavior above
  confirms the slot genuinely stayed open.
- E2 death-say precision: GO — bloodied deathsDuringSay lines 0
  panel-wide AND 0 on the targeted 9409 repro (r57: 1); true Dina
  death lines still captured; muster-aware mismatches 0.
- E3 no-regression: GO — pilot seeds 9405/9406/9407 reproduce r57
  EXACTLY (9405: 3 alive, 0 kcal, horizon; 9406: 3 alive, 21,878
  kcal, horizon; 9407: 6 alive, 2,500 kcal, horizon; same sortie
  days, gorge counts, drift counts, convo counts, fab 0). 9412
  differs from r57 ONLY in the pre-registered E1 way (extra d58
  refusals, same end: 58d game-over, 1 alive, 0 pantry).
- E4 people check: GO — 29 convos driven, 0 fabrication flags
  (r50 regex). Read in full: 9405 d89 Nikos (same honest
  "no playable joint foraging outing yet" limitation as r57,
  repeated 5× by the driver's repeated pick — a driver-amplified
  loop around a real missing beat, documented not fixed) and
  9405 d32 Marco (Secret Deck grounded in played history, as
  r57; one mild coherence wart — a "lost my train of thought"
  after a goon pick — but the conversation still closes softly,
  no fabrication).
- E5 beat availability: GO — 6/6 early-resolution instances
  classified beat-alive (9406 d67/d117/d121, 9407 d110/d114/
  d119), extending r57's 9/9 to 15/15 across the two runs.

## Panel totals (5 seeds)
- Attempts 11: ok 8, refused 3 (all 9412 no-fighters). Clears 5
  (remaining 0). Sortie fights 12. Price honesty: deltaExact 8/8,
  deltaBad [].
- Gorged: 80,395 kcal over 68 nights. Raids 43. Drifts: see
  analyzer (unknown 0, as r57).
- Convo contest snapshots: 29/29 present, fab 0.
- Ends: horizon 9405/9406/9407; game-over 9409 (d95, 0 alive),
  9412 (d58, 1 alive) — the death-aware horizon was respected,
  never ticked past game-over.
- Residual unattributed death line (1, explained, not a missing
  villager death): 9406 d121 Emberhold grief-card line — it
  matches via the standalone word "grief" (the grief alternation
  was intentionally left unchanged; only died/dead were
  boundaried). It names nobody, so it is not a villager death.

## Village assessment (plain words)
The siege still does what the crisis leg says it does: villages
that can answer it pay through it and reach the horizon with
stores or survivors (9405 scraping by on nothing, 9406 holding
21,878 kcal, 9407 six people standing), and villages that cannot
answer it die by it — 9412 down to one person after 26 gorge
nights, 9409 gone entirely by day 95. What changed this run is
only the record-keeping, and the record is now honest in both
directions: a village that is refused fighters is no longer
charged a sortie it never got, and a villager who walks away
bloodied is no longer written down as dead. The people still read
as people: Fatima's grief in r57 named the real dead, Dina's
death is now counted as well as mourned, and Nikos still tells
you plainly that the outing he promises has no play behind it —
honest, but still a promise waiting on the work Steve ordered
tackled this evening (see metric review §5).

## Metric review (§14)
No metric was re-scored mid-run. Notes for the NEXT run:
1. E1/E2 are proven — retire both instrument questions. The
   refused-book and bloodied-line checks can stay in the analyzer
   as regression guards (cheap, and they caught exactly what
   they were built for).
2. Prereg deviation, declared: seed 9409 was added as a targeted
   E2 repro on the same rationale as the pre-registered targeted
   9412 repro (the pilot cannot prove a bloodied-line fix because
   no pilot seed carries one). It is not an expansion for a new
   question and it changed no verdict threshold.
3. The aidFight-check question (early 'fought' resolutions with
   lingerers remaining, now 15/15 beat-alive across r57+r58)
   stays a game-change-lane item: the 2026-10-27 standing context
   records a Muse call that aidFight checks lingerers first like
   the other crisis paths, and a gating freeze holding the
   full-seat stage restore. This instrument run implements
   neither; it only keeps reporting the census.
4. The telemetry mapping proposal (defenderFights ->
   defendedFights) is still a proposal, not a rewrite — see below.
5. Carried open items (documented, not fixed): (i) dead
   discoverer's orphaned fireside entry (r51, Steve's call);
   (ii) unfed marches proceed (r50, Steve's call); (iii) no
   playable joint foraging outing (r57/r58, Nikos d89) — now
   inside Steve's 2026-10-27 17:07 CDT TACKLE ALL commitment
   (villager-rationality items, gating freeze still standing);
   (iv) stare-down cost as a class (Steve's call; the Ella
   stare-down here cost 3 rounds and blood, as in r57).
6. Process note: this run's heartbeats queued behind heavy
   registry-lock contention from the concurrent TACKLE ALL wave
   (multiple worktree-register / release / reap processes
   holding REGISTRY.lock). No files were touched outside this
   run's worktree; the lock file, not the heartbeat alone,
   is what kept the lane safe.

## Telemetry check
Ran `telemetry-check.js` against `telemetry-baselines/crisis.json`
(metrics defenderFights, playerFights, defendedCount,
latelyDefenseCount) on the 5 r58 files. Two LOUD lines fired, both
EXPLAINED, same as r53/r54/r57:
- defenderFights 95 -> 0: vocabulary mismatch. The journey
  instrument records the same concept as `defendedFights` — panel
  totals here are 43 raids plus 12 sortie fights; nothing
  disappeared.
- defendedCount 21 -> 0: no such field exists in journey records
  (a convo-instrument count, not a journey field).
playerFights and latelyDefenseCount are 0 -> 0 (quiet). The baseline
was NOT rolled forward: overwriting a convo-instrument baseline
with journey-instrument numbers under mismatched keys would
destroy its meaning. The mapping fix (defenderFights ->
defendedFights) remains a proposal for the next run, not a silent
rewrite.

## Reachable / fun / winnable (leg 6)
- REACHABLE: yes — raids, lingerers, gorges, sorties, refusals
  AND refusal retries, drifts, re-lingers, early resolutions and
  both exits fired across 5 seeds without intervention beyond
  the delayed rule.
- FUN: same shape as r57, slightly cleaner — the march is legible
  and costly, the people grieve specifically and now count
  correctly in both directions, but the promised joint outing
  still has no play behind it and the "door is quiet" line
  still lands mid-siege (r57's instances stand).
- WINNABLE: yes on the pilot (all 3 villages reached the horizon
  alive); 9409/9412 show the losing branch of the same leg — a
  village that cannot answer the siege dies by it, which is the
  leg's stated stakes, not a winnability failure.

## Files
- Driver: `scripts/journey-crisis-r58-delayed-20261027.js`
- Analyzer: `scripts/analyze-crisis-r58-delayed-20261027.js`
- Proof test: `scripts/test-crisis-r58-instrument.js`
- Analyzer output:
  `hidden_files/evidence/2026-10-27/journey-crisis-r58-analyzer.txt`
- Per-seed (base 112cd5154):
  `hidden_files/evidence/2026-10-27/journey-crisis-r58-delayed-seed{9405,9406,9407,9409,9412}.{json,log}`
