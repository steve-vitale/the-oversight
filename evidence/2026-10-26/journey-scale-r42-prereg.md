# journey-scale r42 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** oversight-playtest-loop-20261027T0017Z. Rotation read 3 → leg 3 SCALE;
write 3→0 on completion. Base master@8ecaac395 (deepening r54) at run start.
**No src/js change planned at pre-register time:** measurement first (journey
panel + removal-site recorder). A game-code fix is decided ONLY after the
recorder confirms a mechanism, and only lands with its own proof test and a
check-quick comparison at the standing failure set — otherwise the fix
direction is documented, not driven by.

## Leg question (binding)
Two parts, both measurement:
1. **JOURNEY (leg play):** on the matched r37–r41 seeds, does the scale leg
   still reach regional→national and the table approach (lesser seat), and
   do villagers still read as people in the leg's transcripts?
2. **BLANK (r41's named next work):** WHERE does each vanished wave-4 spawn
   go? A removal-site recorder wraps Game.removeWorldMonster and logs
   every removal with day, monster, tile, hp, lingering/titan flags,
   player distance, whether a tb fight is active, and whether the removed
   monster is one of the fight's monsters. The two r41 open items are the
   targets: (a) 73677's single-day eulogy (seen once, gone, no fight row,
   no kill-log entry); (b) 73675's gauntlet-day bystander deletions
   (s19/s28/s31 lifted at tb start, never restored after 'won').

## What would count as an interesting finding
- A removal site class holding a majority of vanished wave-4 spawns.
- 73677's eulogy removal site named (fight-lift vs ambient vs other).
- 73675's gauntlet-day deletions reproduced with removal rows showing
  removed-during-tb + not-a-fight-monster (bystander-lift confirmed).
- A journey seed reaching global + table approach in the leg window, or a
  transcript that is senseless, fabricated, or a filler loop on full read.

## Seeds, policies, horizons
- JOURNEY: seeds 85001–85004 (matched r30–r41), policy
  scripts/policies/scalecourt-nogate.js UNCHANGED, driver
  scripts/journey-scale-r42-20261026.js (r41 driver, labels/EVIDIR only,
  control mode — no picker variant), DAYCAP=180, death-aware stop,
  EVIDIR evidence/2026-10-26/journey-scale-r42 (scratch dir, never
  r41's dir).
- REMOVAL: seeds 73671–73678 (the wave4enc/spawnfate band, so removal
  sites answer on the band that asked), policy tableseat-nowait wrapped
  with the four wave4enc recorders + spawnfate census + the new
  removalsite recorder, DAYCAP=180, death-aware stop, EVIDIR
  evidence/2026-10-26/journey-scale-r42-removal. One process per seed
  (--one children); rows written incrementally.
- PILOT GATES (both batches): first seed runs before the rest; STOP if it
  crashes, if the journey pilot has pilgrimages == 0, or if the removal
  pilot writes no removal rows on a seed known to have removals
  (73677: expect the eulogy row or a stated recorder miss).

## Pre-registered metrics (binding, §14 — a miss is NO-GO, never re-scored)
- JOURNEY-PARITY: pilot completes with no crash, pilgrimages > 0,
  transcripts produced (vs r41 control: deltas reported as deltas).
- JOURNEY-PEOPLE: every sampled transcript sense-read; senseless count
  reported, not averaged away.
- REMOVAL-COMPLETE: GO iff ≥6/8 removal seeds have zero unclassified
  wave-4 removals (every vanished spawn's removal row found, or its
  absence honestly stated with the census gap named).
- REMOVAL-73677: the eulogy's removal site is named with its row, or the
  run reports it still-open with the recorder's limit stated — never a
  guessed mechanism.
- REMOVAL-BYSTANDER: 73675's gauntlet-day rows are classified
  fight-lift vs bystander-lift; a bystander-lift majority there confirms
  r41's mechanism and opens the fix decision (separate proof, separate
  verdict — confirmation is not itself a fix).

## Metric review
(written at closeout, not before)
