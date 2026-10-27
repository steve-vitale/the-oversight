# Journey crisis r57 — THE RESET FIRES TWICE AND THE MUSTER CLOSES THE GAP (lane B, leg 6)

Direct handoff from r54's metric review §1–§2 (instrument fixes, not
game changes). r54 left two items: the episode reset was
code-reviewed but unproven (0 live re-lingers in the panel), and
death attribution missed every non-roster muster death by
construction (roster-only name matching). This run fixes the
second in the instrument and hunts the first in live play — and
both land.

Pre-registration: `hidden_files/evidence/2026-10-27/journey-crisis-r57-prereg.md`
Instrument: `scripts/journey-crisis-r57-delayed-20261027.js` (r54
driver verbatim EXCEPT muster parsing from the SORTIE line) +
`scripts/analyze-crisis-r57-delayed-20261027.js` (r54 analyzer
verbatim EXCEPT muster-aware D3 + muster parse rate).
No src/js change this run (instrument only).
Policy: oracleV2, 120d death-aware (+10d tail). Delayed rule unchanged
(first sortie ≥3 nights waited; second 3+ days after the first).
Per-seed records:
`hidden_files/evidence/2026-10-27/journey-crisis-r57-delayed-seed{9405..9413}.{json,log}`
plus sheltered transcripts. Base: 64554bac6 (lane A scalegate /
defiantdoor landings since r54's fc57dd0bd).
Pilot (9405–9407) reproduces r54 EXACTLY in every headline number
(9405: 3 alive, 0 kcal; 9406: 3 alive, 21,878 kcal; 9407: 6 alive,
2,500 kcal; early resolutions 6/6 same days) — the base movement
since r54 is NEUTRAL on crisis legs for these seeds, a useful
base-neutrality check, not an instrument error. The pilot met the
pre-registered expansion trigger (0 episode resets), so the run
expanded to 9408–9413 as pre-registered. 9412–9413 are the tail of
the already-launched expansion batch, not a post-hoc extension:
the capture (9411) was found while the batch was running.

## Headline verdict: Q1 PROVEN, Q2 CLOSED

Q1 — the episode reset fires in live play, in BOTH flavors:
- 9411 glasswing / Ugly-Eyes, re-linger-after-clear: episode 1
  first seen d59, cleared by the d62 sortie (drift d64
  sortie-clear, 5 nights waited), returns d66 as episode 2
  (firstSeenDay 66, firstSeenEver 59, sorties reset to 0,
  resetReason 're-linger-after-clear'). Its same-day drift (d66,
  player-drawn-off) carries episode 2 with nightsWaited 0 vs
  nightsWaitedOld 7 — the old-vs-new comparison works: without
  the reset it would have reported 7 nights for a 0-night episode.
- 9412 callback / The Callback, re-linger-after-drift: episode 1
  first seen d44, drifted d50 (moved-on-valve), returns d54 as
  episode 2 (firstSeenDay 54, firstSeenEver 44, resetReason
  're-linger-after-drift'). Its d57 sortie entry carries
  episode 2 — with a wart noted below (that call was refused
  no-fighters, yet the book counted it as a sortie).
The reset is now proven, not just code-reviewed. No further
hunting needed; the next run can retire this question.

Q2 — the muster closes the Dina-class gap, exactly as r54
prescribed: muster parse 15/15 sortie lines (2 no-line entries
are the 2 refused no-fighters attempts, which fire no sortie
line — consistent). Muster-aware mismatches (say name in neither
the roster diff nor the muster): 0 across all 9 seeds. The legacy
roster-only mismatch still shows 4 names (Dina, Roberto, Ella,
Aylin) — the comparison proves the fix is what closed it:
- True muster-explained deaths (6 lines): 9406 d121 Dina ×3
  ("Dina faced The Ugly Thing at the treeline... and didn't come
  back") and 9411 d65 Roberto ×3, all with namesRoster [] and
  namesMuster [name] — the exact r53/r54 Dina class, now
  attributed.
- Ella (9409 d33) and Aylin (9413 d99) are NOT deaths: they are
  stare-down survivors ("stood down the Flashbulb Moth / the
  Redactor... 3 rounds, bloodied but breathing"). They land in
  deathsDuringSay only because "bloodied" contains "died" as a
  substring — a regex-precision wart for the next run (match
  died/dead on word boundaries, or exclude bloodied). It does not
  change the verdict: no villager death goes unattributed.
- Residual unattributed death lines (2, both explained, neither
  a missing villager death): 9406 d121 Emberhold grief-card line
  (a tribute-mechanics line matching "grieving", naming nobody)
  and 9410 d108 "Loud-Eyes is dead" (a MONSTER death — Loud-Eyes
  is not a villager, so roster ∪ muster correctly finds no name).

## Pre-registered verdicts (§14 — bindings, not re-scores)
- D1 episode accounting: GO-PROVEN — every drift/sortie entry
  carries episode firstSeenDay AND firstSeenEver; 2 live resets
  with reset fields; drift old-vs-new diffs 1 (9411 d66).
  Instrument wart (not a game bug): the driver increments a
  book entry's sorties even when the sortie call is REFUSED
  (9412 d57 no-fighters still set sorties 1 / lastSortieDay 57
  for the episode-2 callback). Conservative (it delays, never
  advances, the next real sortie) but the next run should gate
  the increment on ret.ok.
- D2 early-resolution census: GO — 0 resolutions missing
  lingeringAtResolution. Early instances now 9 (r54's 6 + 9408
  d21, 9411 d60, 9413 d98), ALL beat-alive. The aidFight-check
  question stays Steve's call; this run adds 3 more beat-alive
  instances to r54's narration-only bound.
- D3 death accounting: GO-CLOSED — every sortie entry carries
  deathsDuring, deathsDuringSay (roster/muster splits) AND
  musterNames; muster-aware mismatches 0; the Dina class is
  demonstrated twice (Dina, Roberto) and attributed both times.
- D4 contest verifiability: GO — 55/55 convo records carry a
  playerContests snapshot. Re-verified on the new base: 9405
  d32 Marco's Secret Deck line lands with held=5, seen including
  'secrets' — grounded in played history, as r54.
- D5 price honesty: GO — pantryDelta == -paid on 15/15 ok
  attempts (deltaBad []).
- D6 people check: GO — 55 convos driven, 0 fabrication flags
  (r50 regex). Read in full this round: 9405 d32 Marco (Secret
  Deck, verified above), 9405 d89 Nikos (honest "no playable
  joint foraging outing yet" limitation, repeated 5× by the
  driver's repeated pick — a driver-amplified loop around a real
  missing beat, documented not fixed), 9406 d122 Fatima (names
  the actual dead — Dina, Yawo, Pablo — the day after they fell;
  "The fire doesn't care" reproduces exactly on the new base),
  9411 d46 Yuying (food-is-care philosophy, coherent, ends with
  a soft close). Villagers read as people; grief is specific and
  correctly attributed.
- D7 beat availability: GO — 9/9 early-resolution instances
  classified beat-alive.

## Panel totals (9 seeds)
- Attempts 17: ok 15, refused 2 (both no-fighters). Clears 8
  (remaining 0). Sortie fights 21. Paid in rations: see per-seed
  records (deltaExact 15/15).
- Gorged: 131,835 kcal over 119 nights. Raids 31 (pilot) +
  expansion panel; total raids across 9 seeds per analyzer.
- Drifts: moved-on-valve 4, player-drawn-off 12, sortie-clear 13,
  unknown 0.
- Ends: horizon 9405/9406/9407/9408/9410/9413; game-over 9409
  (d95, 0 alive), 9411 (d68, scattered, 2 alive), 9412 (d58,
  1 alive) — the death-aware horizon was respected, never ticked
  past game-over. 9411's siege is the harsh end: 31 gorge nights
  while the village collapses; 9412 similar at 26 gorge nights.
- Stare-down note (r54 metric review §4, updated): the Ella/Aylin
  stare-downs cost 3 rounds and blood ("bloodied but breathing")
  and end with the monster breaking and running — NOT the free
  0-round stare-down r54 flagged. Whether the stare-down as a
  whole is too cheap stays Steve's call; the 0-round instance
  class did not recur here.

## Village assessment (plain words)
The siege is still a tax, and on the expansion seeds it is the
tax that kills: 9409, 9411 and 9412 all end with villages that
fought the treeline until there was nobody left to fight it —
9411 scattered with 2 people and empty stores after 31 gorge
nights, 9412 down to 1 person after 26. That is the crisis leg
working as designed (a village that cannot answer the siege
does not get to keep its pantry), not a balance complaint from
this run: the pilot villages all survived the horizon, and the
expansion villages died of the same siege the pilot villages
paid through. The people, meanwhile, keep the record straight:
Fatima names the dead correctly the day after, Dina's and
Roberto's deaths are now counted by the instrument as well as
mourned in the fiction, and Yuying's "feed people first" is the
thesis the whole leg runs on. What the game still will not do
is take you on the joint foraging outing Nikos promises — it
says so plainly instead of faking it, which is honest, but it
is still a promised beat with no play behind it.

## Metric review (§14)
No metric was re-scored mid-run. Notes for the NEXT run:
1. D1 is proven — retire the reset hunt. Remaining instrument
   wart: gate the lingerBook sorties increment on ret.ok so a
   refused call does not consume a sortie slot.
2. D3 regex precision: match died/dead on word boundaries (or
   exclude "bloodied") so stare-down survivor lines stop landing
   in deathsDuringSay. The verdict stands either way; the list
   just gets cleaner.
3. The aidFight-check question stays Steve's call (r53/r54/r57:
   9/9 early instances beat-alive — narration-only cost, now
   triple-confirmed).
4. Open items carried forward (documented, not fixed): (i) dead
   discoverer's orphaned fireside entry (r51, Steve's call);
   (ii) unfed marches proceed (r50, Steve's call); (iii) no
   playable joint foraging outing (this run, Nikos d89);
   (iv) stare-down cost as a class (Steve's call; 0-round
   instances did not recur here).

## Telemetry check
Ran `telemetry-check.js` against `telemetry-baselines/crisis.json`
(metrics defenderFights, playerFights, defendedCount,
latelyDefenseCount) on the 9 r57 files. Two LOUD lines fired, both
EXPLAINED, same as r53/r54:
- defenderFights 95 -> 0: vocabulary mismatch. The journey
  instrument records the same concept as `defendedFights` — panel
  total 304 raid defenses plus 21 sortie fights; nothing
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
- REACHABLE: yes — raids, lingerers, gorges, sorties, refusals,
  drifts, re-lingers, early resolutions and all exits fired
  across 9 seeds without intervention beyond the delayed rule.
- FUN: mixed, same shape as r54 but sharper at the edges — the
  march is legible and costly, the people grieve specifically
  and now count correctly, but the "door is quiet" line still
  lands mid-siege (9 instances, all still answerable) and the
  promised joint outing still has no play behind it.
- WINNABLE: yes on the pilot (all 3 villages reached the horizon
  alive); the expansion villages show the losing branch of the
  same leg — a village that cannot answer the siege dies by it,
  which is the leg's stated stakes, not a winnability failure.

## Files
- Driver: `scripts/journey-crisis-r57-delayed-20261027.js`
- Analyzer: `scripts/analyze-crisis-r57-delayed-20261027.js`
- Analyzer output:
  `hidden_files/evidence/2026-10-27/journey-crisis-r57-analyzer.txt`
- Per-seed (base 64554bac6):
  `hidden_files/evidence/2026-10-27/journey-crisis-r57-delayed-seed{9405..9413}.{json,log}`
