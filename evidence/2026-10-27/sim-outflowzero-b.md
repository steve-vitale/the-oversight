# sim-outflowzero-b — the four remaining zero-record outflow paths: CLOSED × 4

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261028T0330Z,
axis food-economy, arm sim-outflowzero-b (second arm; arm 1
sim-onceaday-b landed as bcf137c40, not re-judged here). Base:
master bcf137c40. Measurement only: zero src/js changes, no
default flips, no lever. Judged ONLY against
evidence/2026-10-27/sim-outflowzero-b-prereg.md, committed BEFORE
any judged probe as 906d8b42.

## Verdict against the pre-registered bar: CLOSED × 4

| path | F1 scripted fire (9820 + 9850) | F2 capture exactness (0 kcal tol.) | F3 unscripted band (8 seeds) | verdict |
|------|-------------------------------|-------------------------------------|-------------------------------|---------|
| Light Fingers lifts (`thief.steal_pantry`) | fires both seeds, 400 kcal each | record 400 == snapshot 400, inventory +400, both seeds | calls 0, records 0; mechanism: competent never calls `useAbility` for thief | CLOSED |
| Event takes (`_evTakePantryKcal`: feed + trade) | feed fires both seeds, 600 kcal; trade fires both seeds, 300 kcal on a 250 ask | record == snapshot, sum == retTaken, retMismatch false, both seeds, both calls | calls 0, records 0; mechanism: competent never calls feed/tradeRiverTrader | CLOSED |
| Bulk takes (`takeFromPantryBulk`) | fires both seeds, 350 kcal each (Packed narration; see metric review) | record 350 == snapshot 350, inventory +350, both seeds | calls 0, records 0; mechanism: competent calls only single `takeFromPantry` | CLOSED |
| Child pantry eats (`npc-child-pantry`) | fires both seeds, 150 kcal (1 unit) each | record 150 == snapshot 150, 1 unit of first kcal>0 stack, hunger 80 → 50, both seeds | calls 0, records 0; census: 0 children in 96 roster slots (ages 19–69) | CLOSED |

No path was closed from zero events on a band where it never
fired: every path fired on a scripted fixture on BOTH fixture
seeds with the capture recording it to the kcal, AND the band
carries a counted non-firing explanation. A path with zero
scripted fires would not have closed under this bar — none
needed that clause.

Confirm rule (pre-registered): a 12-seed confirm band is spent
ONLY for a path recording >= 1 unscripted event in the pilot
band. No path recorded any unscripted event, so NO confirm was
spent — there is nothing to confirm, and the fixture closure
stands alone. The confirm spend never overrides a pilot verdict.

## What the zero-record paths were: player/UI doors the bot never opens

The stockdoors mystery is fully explained, and it was never a
ledger hole. All four paths are doors only a player opens:

- Light Fingers is a player ability tap (hold thief, camp
  context, carry room). The competent bot has no thief ability
  and never taps abilities for pantry purposes — its only
  pantry calls are single `takeFromPantry`.
- Event takes are player answers to the river-trader event
  (feed 600 kcal, trade 250/350/400). The bot never answers
  the trader; the event itself is a player conversation.
- Bulk takes are the player pack-slider UI. The bot packs one
  unit at a time through `takeFromPantry`.
- Child pantry eats need a child. Starting villages have none:
  the band census reads 12 roster slots per seed, ages 19–69,
  youngest 19 — consistent with KIN (kids in stasis). No child
  turn exists to reach the hunger branch, so `npc-child-pantry`
  calls are 0, not merely records 0 — and `nestedChildCalls`
  is 0 on all 8 seeds, as on all 20 stockdoors seeds.

The capture was never the problem for these four: the
stockdoors instrument wraps all of them (snapshot-diff around
`useAbility`, `_evTakePantryKcal`, `takeFromPantryBulk`,
`npcTakeAction`/`npcChildAction`), and the fixtures prove each
wrapper records exactly. The driedhunt wrapper requirement is
satisfied by reuse: the same installer folds `_removePantryKcal`
in as the `remove-pantry-kcal` door, and the band shows it
firing in the wild (18 takes on 7/8 seeds — raids/tributes,
corroborating driedhunt, not judged here). No fixture take was
contaminated by it (0 `remove-pantry-kcal` records in every
fixture run).

## Fixture detail (identical on both seeds — the numbers repeat exactly)

Opening pantry on both fixture seeds: 47,250 kcal (Rice, Dried
beans, Dried meat, Canned soup, Peanuts — same split as
stockdoors). Fixture manipulations touch only the fixture's own
fresh game and are printed by the script.

- LIFT (seed 9820 and 9850, identical): access `inside`, thief
  held after grant, `useAbility` returns true. Lift takes 2
  units of Rice × 200 = 400 kcal (the largest-total stack).
  Record: `thief.steal_pantry`, 400 kcal, Rice 2u × 200.
  Inventory gain: +400 kcal. Outcome both seeds: clean, not
  caught (the 50% coin landed clean twice; a caught lift moves
  identical kcal — the coin changes trust, not the ledger).
- EVENT FEED (both seeds, identical): `evRiverTrader` then
  `feedRiverTrader` returns true. Takes 4 units Dried beans ×
  150 = 600 kcal exactly (need 600, pantry first, pack fallback
  0). Record: `event-take`, total 600, retTaken 600,
  retMismatch false.
- EVENT TRADE (both seeds, identical): `tradeRiverTrader('rope')`
  returns true. Takes 2 units Dried beans × 150 = 300 kcal on
  a 250-kcal price — whole-unit over-removal, honest and
  reported as actuals (retTaken 300, not 250). Record:
  `event-take`, total 300, retTaken 300, retMismatch false.
- BULK (both seeds, identical): `takeFromPantryBulk({0: 1,
  1: 1})` packs 1 Rice (200) + 1 Dried beans (150) = 350 kcal.
  Record: `player-take-bulk`, 350 kcal, both items. Inventory
  gain: +350 kcal. (Return-value note: see metric review —
  the method returns null on success; its success signal is
  the "Packed:" narration, which the fixture asserts.)
- CHILD (both seeds, identical): NO roster child existed on
  either fresh game, so the fixture set age 10 on a roster
  adult via `rosterChars[rid].age` (recorded as `ageSet=true`;
  the unscripted census says this override was necessary
  because starting rosters hold no children). With hunger 80,
  fear 0, not sick, a direct depth-0 `npcChildAction` call
  eats exactly 1 unit of Dried beans (the first kcal>0 stack,
  150 kcal), hunger 80 → 50 (−30, as coded). Record:
  `npc-child-pantry`, 150 kcal, 1 unit. Announce fired (see
  sense note on the display name).

Proof: scripts/test-outflowzero-b.js GREEN (exit 0, all checks
pass on both seeds; the first run caught the bulk
return-value definition — fixed in the script, re-run green,
see metric review).

## Unscripted band detail (competent-nofeast, 100d, seeds 9850–9857)

Corpus: evidence/2026-10-27/sim-outflowzero-b-corpus/ (8 files,
sweep exit 0). Instrument: scripts/sweep-outflowzero-b.js
(stockdoors capture reused UNCHANGED + roster census; new file,
no sibling file modified).

| seed | days | rank | wave | deaths | roster | children | judged records | remove-pantry-kcal takes |
|------|------|------|------|--------|--------|----------|----------------|--------------------------|
| 9850 | 100 | village | 2 | 2 | 12 | 0 | 0 | 1 |
| 9851 | 100 | village | 3 | 1 | 12 | 0 | 0 | 1 |
| 9852 | 100 | village | 3 | 2 | 12 | 0 | 0 | 3 |
| 9853 | 100 | village | 4 | 3 | 12 | 0 | 0 | 5 |
| 9854 | 100 | village | 3 | 4 | 12 | 0 | 0 | 0 |
| 9855 | 100 | village | 3 | 3 | 12 | 0 | 0 | 1 |
| 9856 | 100 | village | 3 | 2 | 12 | 0 | 0 | 2 |
| 9857 | 100 | village | 3 | 6 | 12 | 0 | 0 | 5 |

Pooled judged calls: `thief.steal_pantry` 0, `event-take` 0,
`player-take-bulk` 0, `npc-child-pantry` 0 — calls, not just
records, on every seed; `missingPaths` empty on every seed
(every path WAS wrapped, it simply never fired). Pooled
non-judged pantry traffic for contrast: `player-take` 460
calls (all with decrease), `npc-adult-pantry` 611 calls (11
with decrease — adults mostly do other things on their turn),
`remove-pantry-kcal` 18 calls (all with decrease).
Census ages pooled: 96 slots, min 19, max 69, zero under 15.

Policy-call verification (this run, not inherited): competent.js
contains no `useAbility` call for thief, no `feedRiverTrader` /
`tradeRiverTrader` call, and no `takeFromPantryBulk` call — it
calls `takeFromPantry` (single) only. The three player-path
zeros are therefore mechanism-explained, not unexplained.

## Sense transcripts (SENSE-TESTING LAW — meaning, not just counts)

Primary read — the clean Light Fingers lift (seed 9820, same on
9850). The game says: "The food disappears. Magic. (It's not
magic. Nobody saw. Light Fingers.)" The ledger says: 2 units of
Rice left the pantry (400 kcal), 2 units of Rice entered the
player's pack (400 kcal). Narration and ledger agree exactly —
a lift, not a haul; the joke ("not magic") is honest about
what happened, and the trust coin (clean this time) is the
only thing luck touched. Nothing robotic: the lift reads as a
person pocketing food while nobody looks.

Supporting reads. Bulk pack: "Packed: 1 Rice, 1 Dried beans.
(350 kcal, 1.0 kg)" — the narration names the items, the
kcal, and the weight, and all three match the ledger (200 +
150 = 350). Child eat: "<name> eats from the pantry." with a
150-kcal unit gone and hunger down 30 — the sentence is small
because the act is small, and that restraint reads right. ONE
caveat, stated not smoothed: the child fixture's subject is an
age-overridden adult, and its announce still reads "A person,
maybe 20s" — the display name follows the adult's true record,
not the overridden age. That is a fixture artifact, NOT a judged
claim about real children: a true in-game child's announce
would need a band where children exist (births), which this
band cannot supply. The ledger facts (1 unit, 150 kcal, hunger
−30) are unaffected by the name line.

No robotic, static, or repeated dialogue was found in the
sampled outflow events beyond the already-known racks-full
repetition (backlog 1149, unchanged, not chased here).

## Village assessment

What the village looked like: 8 villages, all surviving the
full 100 days, around pantries the ledger now watches
completely — every removal door the stockdoors lineage ever
named is now either recorded in the wild (surplus pushes,
meal draws, direct takes, spoil sweeps, raid/tribute takes)
or proven by fixture with a counted reason it stays silent
here (thief/event/bulk/child). Rank stayed village on all 8
seeds; one seed (9853) reached wave 4, the rest wave 2–3.

Who thrived and died and why: 23 deaths total (9850: 2, 9851:
1, 9852: 2, 9853: 3, 9854: 4, 9855: 3, 9856: 2, 9857: 6) —
the arena 13, ambush 3, monster 3, choir toad 1, expedition 1,
a wound that wouldn't close 1, alien 1. No death is attributed
to any outflow path: the arena dominates this band as it did
the stockdoors confirm band, and starvation appears nowhere
(0 starvation deaths on this band).

What knowledge/capabilities were missing: none in the game for
these paths — the missing piece was proof, and it is now
supplied. What remains genuinely unobserved (not unproven):
a child pantry eat by a REAL child in the wild, and a caught
lift's trust narration against the ledger (both fixture lifts
landed clean; the caught branch moves identical kcal by code
read, but was not observed). Neither blocks the CLOSED verdicts
— the bar required a fire + exact record + counted band
account, all met — but a future band with children (births)
should watch for a wild child eat, and a caught lift should be
observed once for the sense record.

Blanks filled: (1) all four remaining zero-record paths from
backlog 1283 are CLOSED — with driedhunt's alien raids, all
five stockdoors zero-record paths are now accounted for;
(2) the pantry-removal door set on current master is now fully
instrumented and proven: every named door either fires in the
wild with exact records or fires on fixture with exact records
and a counted reason for wild silence; (3) the bulk
return-value definition is corrected (see metric review);
(4) starting-roster childlessness is measured (0/96), which
explains the child zero and scopes the next child observation
to a births band.

## Reachability verdict

On this band (competent-nofeast, seeds 9850–9857, 100d):
waves 1–3 reached on all seeds, wave 4 on 1/8 (9853), wave 5 on
0/8. Regional, national, table, wins: 0/8. Arc II/III/IV,
four-realm formation, trap acquisition, counter discovery/kill,
and young-link succession survival are not recorded in this
corpus and are not estimated here. The scale wall stands on
this band; this arm measures a pantry ledger, it does not move
the wall numbers — with one note in the wall's favor: wave 4
appears on a ledger band where stockdoors saw 0/20, so wave-4
reach is not zero on competent-nofeast in general.

## Wall numbers

National / table / wins: 0/8. Wave-4/5 unlocks: wave 4 on 1/8
(9853), wave 5 on 0/8. Wave reach per seed: 9850: 2, 9851: 3,
9852: 3, 9853: 4, 9854: 3, 9855: 3, 9856: 3, 9857: 3. Median
survival: 100d (censored at the 100d horizon; 8/8 survived to
day 100). Deaths: 23 total (causes above).

## Telemetry deviation check (loop-B body step 10)

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-10-27/sim-outflowzero-b-corpus/*.json' --metrics
national,table,wins,exiled` reports LOUD: national 12 -> 0,
table 16 -> 0, wins 16 -> 0 (n=8 files). Investigated same-run:
this is band composition, not a regression — the same LOUD
shape driedhunt reported for the same reason. The scale-wall
baseline mixes bands that reach national/table, while this
corpus is the competent-nofeast ledger band whose published
wall numbers are 0/20 (stockdoors), reproduced here at 0/8.
The correct comparator (the stockdoors band itself) shows
zero deviation, and wave-4 reach actually improves (0/20 ->
1/8). No further investigation item. Exiled: no LOUD line.

## Metric review (MEASUREMENT.md section 14)

- The pre-registered bar worked as written and the verdicts
  follow from it: F1 fired on both fixture seeds for every
  path (including both event calls separately), F2 matched to
  0 kcal on every fixture (record == independent snapshot ==
  inventory gain, where applicable; event sum == retTaken with
  retMismatch false), F3 carried a counted explanation for
  every band zero (policy grep + census, both produced in this
  run, not inherited). No re-scoring was done: no leg was
  dropped, no tolerance was widened, no single-seed rescue was
  used (both fixture seeds agree exactly on every path).
- Definition correction, disclosed not hidden (bulk F1): the
  prereg's F1 wording says "method returns success". For
  `takeFromPantryBulk` that wording is wrong as written — the
  method returns null on SUCCESS (function tail: `this.say
  ('Packed: ...'); return null;`). The first fixture run
  failed bulk F1 on exactly this (pantry −350, record 350,
  inventory +350, return null). The fix keeps the bar's
  substance and strengthens its signal: bulk F1 is the
  "Packed:" narration (a positive success signal naming items
  + kcal + weight) PLUS the pantry decrease — never the return
  value, and never the decrease alone. The verdict does not
  rest on the weakened reading: bulk still had to show the
  Packed line, the exact record, and the exact inventory gain
  on both seeds. Proposed revision for the NEXT run's prereg:
  define F1 per path as "the method's own success signal"
  (return value, narration, or state change as the method
  defines it), named per path before the run — never assume a
  return value means success.
- Lesson for the NEXT run: fixture seeds repeating EXACTLY
  (400/600/300/350/150 on both seeds) is expected, not
  suspicious — fixtures seed the same opening pantry and make
  the same calls; the seeds differ in trajectory, not in the
  fixture's controlled state. A future prereg should say that
  up front so identical fixture numbers are not misread as a
  determinism failure.
- Balanced panel (MEASUREMENT.md §15): NO comparison exists —
  this arm changes no lever and no game code, so there is no
  before/after to panel. The standing panel exception applies
  explicitly: the corpus is census rows (counters + census +
  wall fields) with no panel-ingest mode; no panel was faked.
  The before/after comparison is the fixture's independent
  pantry snapshot vs the capture record on identical seeds
  (capture on, independent read).

## Out-of-arm observations (for the coordinator's sim-findings backlog; not chased)

- Backlog 1283 is now closable: all five of its zero-record
  paths (alien raids via driedhunt; Light Fingers, event,
  bulk, child eats via this arm) are accounted for. Coordinator
  to mark it fixed.
- A wild child pantry eat still needs a births band: starting
  rosters hold no children (0/96 here, min age 19), so any
  future child-observation arm must first produce a living
  child (birth or a child-bearing scenario), then watch its
  turn at hunger > 60. The branch + capture are proven; the
  wild event is not yet observed.
- A caught Light Fingers lift (trust −20 narration against the
  ledger) is unobserved: both fixture lifts landed clean. The
  kcal are identical by code read, but the sense record for
  the caught branch is open.
- Wave 4 on 9853 (1/8) on a ledger band vs 0/20 on stockdoors
  bands: wave-4 reach is not zero on competent-nofeast. Worth
  one line in the wall picture, not a lever claim.

## Reproduction check (this run)

- Prereg committed BEFORE any judged probe or capture change
  (906d8b42; the commit hit the documented safe-commit
  index-clobber variant — committed file showing
  staged-as-deleted — repaired per the documented recipe
  (`git update-index --add --cacheinfo` with the HEAD blob)
  and verified with `git status --short` empty + `git diff
  HEAD` empty + hash-object match before proceeding).
- Judged fixtures ran on the prereg commit's script
  (scripts/test-outflowzero-b.js): ALL CHECKS PASSED, exit 0,
  both seeds, every path (lift 400/400, feed 600/600, trade
  300/300, bulk 350/350, child 150/150; records equal
  independent snapshots to 0 kcal throughout).
- Judged band ran on the same commit
  (scripts/sweep-outflowzero-b.js): exit 0, 8 files written,
  analyzer (scripts/analyze-outflowzero-b.js) reproduces every
  pooled number quoted above.
- Hygiene: 0 src/js files modified, 0 sibling files modified,
  0 sibling capture files modified. New files in this run
  only: prereg, this evidence file, scripts/test-outflowzero-b.js,
  scripts/sweep-outflowzero-b.js,
  scripts/analyze-outflowzero-b.js, and the 8 corpus files.
  No jest was run (nothing to test in jest — the proof is
  node, not jest; the three new scripts were each executed
  green). No [needs-eyes]: this lands a measurement, not a
  player-visible change. No EPERM flap hit this run's writes
  (all sweep writes succeeded first try; the run-start flap
  had cleared before this arm began). No ref surgery was
  performed at any point.

## Verdict (judged against the pre-registered bar, not re-scored): CLOSED × 4

Light Fingers CLOSED (400/400 exact, band zero explained by
the bot never tapping thief). Event takes CLOSED (feed 600/600
and trade 300/300 exact with retMismatch false, band zero
explained by the bot never answering the trader). Bulk takes
CLOSED (350/350 exact, band zero explained by the bot packing
single units only). Child pantry eats CLOSED (150/150 exact,
hunger −30, band zero explained by the census: no children
exist in starting villages). Backlog 1283's remaining paths
are closed; with driedhunt, the whole zero-record set is
accounted for.
