# sim-killerwild-b — PREREG ADDENDUM (Stage 0 read + Stage 1 decision)

Date: 2026-11-06 ~08:10Z. Recorded BEFORE any armed sim. There are no
armed sims in this run: Stage 1 does NOT build. This addendum is the
decision record, not a lever definition.

## Stage 0 result (judged baseline, tbretreat-refind, seeds 56001–56008, 150d)

Corpus: `evidence/2026-11-06/perseed-killerwild-b/` (8 files,
`killerwild-s<seed>-killerwild-baseline.json`), 0 instrument errors.
Analyzer: `scripts/killerwild-analyze-20261106.js` (frozen in the prereg
commit efacb3243; NOT changed after the judged sims).

- 7 wave-4 killers ever on 8 seeds; 5 seeds blooded a first killer,
  3 seeds (56002, 56005, 56007) faced wave 4 repeatedly (10/7/11 fights)
  and killed nothing.
- Channels of dead FIRST killers (n=5): TB-home 4 (56003, 56004, 56006,
  56008), other:combat 1 (56001, the Tumelo record disagreement — see
  below). TB-wild 0, field 0, arena 0, expedition 0.
- Across ALL scholar deaths (84): 81 at haven, 3 away. Scholars die at
  home, in combat, at map (4,4).
- Trigger coverage on the 4 TB-home first-killer deaths: haven-hold 1
  (56004 dale — fired, held, died in the fight), no-fire 2 (56006, 56008),
  no-fire-other-fighter 1 (56003 ursula — a party member fired and held
  in a same-day fight; ursula's own fatal fight never fired).
- Refind fires on the band: 15 total — 10 haven-holds, 2 exits, 1
  consumed-worldEdge, 1 open (died mid-retreat) + 1 open on 56008
  (total opens 2; recount: holds 10, exits 2, worldEdge 1, open 2 = 15).
  The trigger fires AT HOME and cannot retreat: 10/15 fires are holds.
- Baseline primary (prereg rule): first killers alive 14d after first
  blood = 2/8 (56001 + 56004 dale, k2d 19). The 56001 count rests on a
  record disagreement: the first killer (Tumelo, companion kill day 59)
  has a fallen entry day 60 (cause 'combat', health 0) yet deadMap says
  not-dead, he speaks at the grave the same day, and the engine's own
  readiness5.veterans stays 1 through the horizon — the engine credits
  him as a living veteran. Excluding that seed, the baseline primary is
  1/8. The prereg's deadMap rule is kept for the count (and would be kept
  for any armed leg, so the comparison stays fair); the disagreement is
  disclosed, not resolved here.
- Wall (baseline): wins 0/8, national 0/8, table 0/8, wave-4 unlocks 8/8,
  wave-4 faced 8/8, wave-5 unlocks 1/8 (56004, standing 250), wave-5 faced
  0/8, median survival 87.5d. Kill-to-death median 5.5d (n=6 dead killers).

## Stage 1 decision: NO BUILD (DIAG)

The brief's leading candidate — a killer-aware earlier retreat trigger
(tighter scholar-HP and/or monster-HP thresholds for a fresh killer) —
is FALSIFIED by Stage 0 for this band, and no different policy-actionable
lever was identified:

1. The deaths it would need to prevent are TB-home. At haven,
   `chooseFleeDir` returns null, so the trigger HOLDs at ANY threshold —
   the one fired TB-home death (56004 dale) already proves it: the trigger
   fired at s0.58/m0.994 and the fighter held and died where he stood.
   A tighter threshold changes a hold into a hold.
2. The no-fire deaths cannot be saved by firing either: the fatal fights
   were at haven (no barrier-crossing line on any of the four fatal
   death days; scholarDeaths show map (4,4) in combat; the same days
   carry haven-hold fires by party members). Had the trigger fired, it
   would have held. The only escape from a haven fight is an exit that
   does not exist there.
3. The remaining candidate shapes were examined and rejected, not ignored:
   - Last-stand / fight-harder-at-home: competent.fight already presses
     combat abilities (abilityPressPlay, one press/turn) and attempts
     counter-tricks; the corpus carries no per-turn fight trace showing a
     missing action, so any "fight harder" mechanism would be a guess,
     not a lever identified by Stage 0.
   - Avoid haven fights / be away when wave 4 triggers: the scholar must
     sleep at haven and the monsters come to haven (the Reunion dominates
     the fatal fights); "spend more time away" is not a defined policy
     mechanism, and competent's routine already sends the scholar out on
     daily legs.
   - Party/ally levers: Loop A owns staging+rally this hour; not
     duplicated. NPC companions in TB fights are engine-driven; the
     policy controls only the scholar.
4. The production half is out of this arm's reach too: 3/8 seeds never
   blooded a killer in 7–11 wave-4 fights each. A retreat lever cannot
   conjure a first killer.

Per the prereg's staged design ("if no policy-actionable lever exists,
the run ends DIAG with the census as deliverable and no Stage 1 build"),
the verdict is DIAG. No armed pilot runs, no confirm band is spent
(57001–57016 stays fresh for the next run), and the Stage 1 primary
metric is not judged against any armed leg — there is none.

## What would change this decision (for the NEXT run, not this one)

- A per-turn fight trace (scholar HP + monster HP + position per turn in
  fatal fights) showing no-fire deaths began AWAY from haven: then an
  earlier trigger could exit before the walk home, and the killer-aware
  trigger should be built and judged.
- A haven-fight mechanism a policy CAN touch (e.g. a pending-encounter
  hook that faces an arriving monster away from haven, or a defined
  last-stand action competent.fight demonstrably lacks in fatal fights):
  then that mechanism, not a threshold, is the lever.
- A band where first killers die TB-wild: then the killer-aware trigger
  is live again on its original terms.
