# journey-endgame r46 (lane B) — THE VETERANS BAR, COMMITTED (2026-10-24)

Leg 4 (endgame). Rotation-b 4 -> 5. Worktree journey2-endgame, branch
journey2-endgame, base ef04cd8cb. No src/js changes (policy instrument
only); merged locally, pending ship.

## Pre-registration (bound before the sweep)

Leg question: r45 proved the capable+deedhunt road faces wave-4s (5/2/1
distinct facings) but kills none — competent's fight logic bails before the
kill (start-of-fight walk-away, mid-fight 35% HP eject, DPS-race conviction
eject) — so standing caps at 199 on the wave-5 readiness deferral's
VETERANS bar (0/2 living roster members with a wave-4+ kill). Hypothesis: a
brave-but-not-suicidal player on the SAME road — walk-away removed and HP
eject lowered to 12% for live wave-4+ fights while the veterans bar is
short (new policy scripts/policies/vetcommit.js, VETCOMMIT=1; DPS-race
conviction eject deliberately KEPT) — converts facings into kills and
unlocks wave 5. Single-variable vs r45: the seek side is IDENTICAL
(deedPatrol patrols only); only the fight side changes.

Bindings (a miss is NO-GO, never re-scored mid-run):
- M1 GUARD (r45 restatement): >=3/4 seeds reach the window (announceDay !=
  null) OR resolve via a voiced non-table path. Counting coherent
  resolution, not just sits.
- M2 VETERAN KILLS (the leg's question): >=1/3 waves seeds ends with >=1
  LIVING veteran (veterans.livingVeteranCount >= 1). Strong form: >=1 seed
  reaches veterans 2/2 (the bar met).
- M3 WAVE-5 OPEN / FULL-SEAT REACH: >=1/3 waves seeds unlocks wave 5
  (veterans.unlockedWave >= 5) OR earns the FULL seat (diag
  firstFullSeatDay != null). Strong hypothesis, falsifiable.
- M4 VOICING CANONICAL (carried): 88014 (forcedrift, capable substrate) —
  bandCrossings >= 1 AND noticedCount >= 1.
- M5 PEOPLE: >=2 beats sense-read in full, 0 senseless flags.
- REG (binding, inherited): r35 auditNamed on sat seeds with nonzero
  w4/w5; r37 satPenalty present + voiced-line match on sat seeds.

Substrate (PILOT, 4 seeds): r45's substrate exactly — capable base +
deed-seeking deedPatrol + surgeUpkeep + fullseat-diag outside everything —
PLUS vetcommit on waves seeds only. 88014 swaps the deed-hunt for the
relaygrey FORCEDRIFT=1 road (grey-owned; CAPABLE_RELAYROAD='0' on that seed
only). FULLSEAT=1, VETCOMMIT=1, RELAYGREY=1 (forcedrift seed only),
TELEMETRY_FULL=1. 180d, death-aware (all four runs ended at the win, d90–129).
Seeds fresh 88011–88014. Baseline: r45's waves seeds (0/3 living veterans,
0/3 wave-5 unlocks, 0/3 full seats, standing capped 199).
Interesting-finding bar: a living wave-4 veteran; a wave-5 unlock; a full
seat; OR deaths-by-commit honestly counted (bravery's price) — any of these
moves the question. 0 kills with a bail census is also a finding (it names
the next bail), not a null.

Instrument: scripts/probe-endgame-r46-20261024.js (r45 probe + vetcommit
wrap + veterans census block reading the engine's own waveUnlockReady(5)
and state.waveKillLog), scripts/analyze-endgame-r46-20261024.js (M1–M4 +
REG), scripts/policies/vetcommit.js (new), scripts/repro-vet-20261024.js
(per-committed-fight outcome recorder + killer-fate forensics),
scripts/test-vetcommit-20261024.js (unit proof).
Gates: SMOKE (88011, 120d: announced d111, lesser seat, feared/light win,
final choice resolved) GREEN; DET (instrument-on twice, 2x120d, seed 88011)
GREEN byte-identical; FID (VETCOMMIT/FULLSEAT/RELAYGREY unset: wrapped ==
pure capable+deedhunt base, gameDays 111, won, alive 8, pantry 51054)
GREEN; unit proof 8/8 (gate-off delegation untouched; gate-on sets both
flags on wave-4 only; stand-down on veterans-met / wave-5-unlocked /
hurt-scholar / no-fight).

## RESULTS (4/4 seeds)

- **M1 GUARD: GO 4/4** — 88011 announced d111, 88012 d90, 88013 d90,
  88014 d129. All four sat the SAME day they announced and all four WON
  lesser seats (88011 feared/light, 88012 feared/light, 88013
  beloved/light, 88014 beloved/light). Final choices resolved 4/4.
- **M2 VETERAN KILLS: NO-GO (binding) 0/3** — no waves seed ends with a
  living veteran. Per seed (vetFights below counts committed fight TURNS,
  not fights — see the correction note):
  - 88011: living 0, bar 0, w4+ kills 0, vet turns 0, unlockedWave 3.
    It never unlocked wave 4 at all (standing max 99, w4 faced 0) — the
    commit lever never engaged. A different failure: no wave-4 access,
    not failed kills. It sat d111 anyway.
  - 88012: living 0, bar 0, w4+ kills 1, vet turns 18, unlockedWave 4.
    The kill LANDED (eater d76, see below) — then evaporated.
  - 88013: living 0, bar 0, w4+ kills 0, vet turns 13, unlockedWave 4.
    Two committed wave-4 fights, zero conversions.
- **M3 WAVE-5 OPEN / FULL-SEAT: NO-GO (binding) 0/3** — 0/3 wave-5 unlocks,
  0/3 full seats. And the other bars were short too: standing max
  99/170/192 (all < 200), armor short on 88012 (3/4) and 88013 (2/4). Even
  a veterans breakthrough alone would not have opened wave 5 on these
  seeds — the full seat is a multi-bar convergence, and this run isolated
  only one bar.
- **M4 VOICING CANONICAL: GO 1/1** — 88014: bandCrossings=1, noticed=1.
  The control still fires on the capable substrate.
- **M5 PEOPLE: GO** — 3 beats sense-read in full (below), 0 senseless flags.
- **REG r35: GO 4/4** — audit names w4/w5 aloud on all sat seeds with
  nonzero w4/w5. **REG r37: GO 4/4** — satPenalty records present, no
  voiced-line mismatch (all tier 0, penalty 0 — quick sits).
- **PRIMARY: NO-GO** (M2/M3 binding). **ALL: NO-GO.**

## THE THREE MECHANISMS (repro-verified, deterministic re-runs)

The sweep's headline (0 living veterans) hides three different mechanisms.
Each was confirmed by re-running the seed with the exact r46 composition
(scripts/repro-vet-20261024.js; DET-proven byte-identical trajectories):

1. **THE KILL THAT EVAPORATED (88012).** Committed fight d76, 11 turns:
   Camila (gen_5gttbp5) put down the eater (wave 4, "The Loud Bastard").
   The table's own war-path audit names it: "On day 76, Camila put down
   The Loud Bastard." Then on d90 — the day the village sat — Camila died
   in a contest and Māui died in the Eulogy fight (fallen ledger: Camila
   d90 contest, Māui d90 combat), and the village sat under Sanne Bakker
   with 0 living veterans. The audit names the gap aloud at the table:
   "Even now the wave-4 bar reads: blood your fighters (0 of 1 veterans).
   Even now the wave-5 bar reads: armor the village (3 of 4 fighters
   armored); blood your fighters (0 of 2 veterans)." The veterans bar
   demands LIVING veterans, and a kill earned 14 days before the sit died
   hours before it. This is not a kill failure — it is a mortality
   failure, and it is voiced, not silent.
2. **COMMITMENT WITHOUT CONVERSION (88013).** Two genuine committed
   wave-4 fights — reunion d74 (9 turns), algorithm d82 (6 turns) — both
   ended with the scholar alive and ZERO kills, DPS-race bails 0. The
   fights were fought to the 12% eject and left without the kill. Lowering
   the eject from 35% to 12% bought more turns, not kills, against
   wave-4 HP pools. The next bail to investigate is the 12% eject itself
   (and whether wave-4 fights are winnable attrition at all at this
   build), not the DPS-race eject — which never fired on either seed.
3. **THE SEED THAT NEVER GOT THERE (88011).** Standing max 99, wave-4
   never unlocked, zero wave-4 facings, sat d111. The commit lever is
   irrelevant when the road never reaches wave-4 country — and the
   village sits anyway, the same day it announces. Every seed in r45 and
   r46 sat within a day of announcing. The full seat's window is bounded
   by the announce, and a sit-promptly village never gets a veteran
   window at all.

Correction note (read the numbers right): the probe's `vetFights`
counts committed fight TURNS (the wrapper increments per fight() call),
not fights — 88012's 18 turns span 3 fight-ends, 88013's 13 turns span 2.
One repro-recorder artifact: the d78 hushwolf pack on 88012 reads as
"committed" only because the recorder sampled the flags before the
wrapper ran (stale flags from the previous fight's last turn); the
wrapper itself never commits wave-1 fights (unit proof #3). Genuine
committed fights: 88012 eater d76 (kill) + eulogy d90 (no kill); 88013
reunion d74 + algorithm d82 (no kills).

## VILLAGE ASSESSMENT (plain words)

- **88011 — Caleb Ramos's village, 8 alive, pantry 51,054, national.**
  Caleb, Sergio, Que, Xavier, Elena, Nora, Petra, Fatima. A rich, intact
  village that never saw a wave-4: it won the lesser feared seat at d111
  without ever reaching wave-4 country. Comfortable, unblooded.
- **88012 — Sanne Bakker's village, 6 alive, pantry 8,790, regional.**
  Petra, Sanne, Elif, Priya, Tariq, Olivia survived. The fallen ledger is
  the story: Antonio starved d9, Zuri fell in combat d31, Leo dehydrated
  d48, Ethan starved d69, Camila died in a contest d90, Māui died in
  combat d90 — two bearers in one day, and Sanne sat at the table the
  same evening. A village that paid for its seat in bearers.
- **88013 — James Okonkwo's village, 8 alive, pantry 9,416, global.**
  Christopher, Greta, James, Tom, Petra, Arifin, Omar, Emma. Greta did
  what the bearer would not (the OUTSHONE beat) and the village thrives
  for it; the bearer won beloved anyway. A village with its own heroes.
- **88014 — Austin Banks's village, 8 alive, pantry 15,241, global.**
  Austin, Finn, Gloria, Khai, Elijah, Aroha, Miguel, Priya. The relay
  office ran dark (lean -100, band dark, 76 verbs, 8 communes) while the
  table path stayed light — the dark lean lives on the office, not on
  the ending. Finn watched the pods open and will remember the shape of
  the bearer's hand.
- (Census lists survivors only; the dead live in the village fallen
  ledger, which the repro reads directly. No census in this run lists
  the dead — that is a census-tool gap, not a game gap.)

## PEOPLE CHECK (SENSE-TESTING LAW — full reads)

1. **The double succession + feared win (88012, full 381-line window).**
   The beats want things: the table wants to price the run; the village
   wants a bearer it trusts ("You're not Camila. No heat in it. Just
   fact. You'll have to earn this face."); the Eulogy wants its story
   told ("and then they stood their ground, poor brave fools" — the
   contradiction mechanic is legible: 3 contradictions rewrites the
   ending). The mantle passes Camila -> Māui -> Sanne in a single day and
   every transfer is witnessed and vouched ("Camila trusted them. We saw
   it. Give them the fire's hearing."). The feared win resolves (terror
   pledged as a shield, never a sword) and owes (the architect beat
   credits Priya's relay ascension: "The galaxy will remember the god's
   name. The village will remember who built the door."). 0 senseless
   flags. Note, not a flag: the scholar eats "Unknown flesh (400 kcal)"
   twice — the direct-eat path prices it, unlike the pantry-draw path
   (the known quirk-channel observation; a different path, not a
   contradiction to chase here).
2. **The beloved win + outshone (88013, full 73-line window).** The
   audience wants a favorite; Tom tells "the unproduced kind" of truth;
   the show becomes a constitution ("You made popularity into a
   constitution — and constitutions, unlike ratings, don't dip"). The
   OUTSHONE beat is the honest sting: "Greta Hansen did what you would
   not: acted, boldly, while there was still time... The record notes,
   kindly and accurately, that you watched. It stings exactly as much as
   it should." The System-as-friend beat ("IS THIS WHAT HAVING A FRIEND
   IS. DO NOT ANSWER. LET ME HAVE THIS ONE UNSOLVED.") wants
   companionship and is left unsolved on purpose. 0 senseless flags.
3. **The dark relay + beloved win (88014, full 48-line window).** The
   relay wants integration; the System offers the pods ("children adapt
   SO fast... Don't look at us like that. You were already thinking
   it."); the village answers with silence ("The village has never been
   this quiet. Somewhere, someone starts packing — not for a journey.
   Just... away."). The merge falters one button short, the smaller door
   is taken ("It is still a door."), and the beloved finale still lands.
   Dark lean on the office, light road at the table — two axes, both
   voiced, no contradiction. 0 senseless flags.

## BLANKS

- Documented, not filled (Steve-call territory): the full seat needs a
  deferral strategy nobody has run yet — sit LATE while banking
  veterans, armor, and standing together. r47's natural question:
  VETCOMMIT + DEFERRAL (wait at the table while hunting wave-4s).
  Whether the full seat is MEANT to require deferral is a design call,
  not an instrument gap.
- Census-tool gap (this run's note, not the game's): censusOf lists
  survivors only; the fallen ledger (the run's best story on 88012) is
  readable only via repro forensics. A future census should print the
  fallen alongside the living.
- No src/js changes (kill discipline: the finding is about roads and
  bars, not broken code — the bars work exactly as canon describes, and
  the table voices them).

## Metric review (§14)

1. **M1's restatement held again** — 4/4 announced, 0 non-table
   resolutions needed. Keep the restated form.
2. **M2's 0/3 is the finding, not a metric failure** — the three seeds
   fail three different ways (no access / evaporation / no conversion),
   and the repro names each mechanism. No revision proposed; the metric
   measured exactly what it should.
3. **M3's 0/3 is the finding** — the full seat is a multi-bar
   convergence (veterans + armor + standing 200), and this run isolated
   one bar. A future M3 should either pre-register the convergence
   (all bars together) or keep isolating one bar at a time and say so.
4. **M4's substrate rule held** — control fired on capable (1/1).
5. **vetFights is a turns counter, not a fights counter** — the probe
   header and analyzer now say so; future runs should report both
   (turns + fight-ends) to avoid the misread this run almost made.
6. **Telemetry deviation check:** run below.

## Regressions / checks

- SMOKE (88011, 120d): GREEN — pipeline end-to-end.
- DET (instrument-on twice, 2x120d, seed 88011): GREEN byte-identical.
- FID (FULLSEAT/VETCOMMIT/RELAYGREY unset: wrapped == pure
  capable+deedhunt): GREEN byte-identical (mini: gameDays/won/alive/pantry).
- Proof tests: scripts/test-vetcommit-20261024.js 8/8 (incl. RED-side
  guards: wave-1, veterans-met, wave-5-unlocked, hurt-scholar, no-fight).
- Existing suites: check.js --quick — 282 passed, 5 failed in 1419s (recovery run, worktree at master a44478652). The 5 failures are EXACTLY the known pre-existing baseline (test-measurement-comparison, test-measurement-proof-update, test-measurement-workflow, test-occupation-panels, test-phone-frame-proof). The timed-out worker's "12 failures unnamed" was a count of sub-assertions inside those 5 suites, not 12 failing suites — resolved, no regressions from this run (zero src/js changes; the new test file is not in check.js scope).
- No src/js behavior changes. Tooling: probe-endgame-r46-20261024.js,
  analyze-endgame-r46-20261024.js, policies/vetcommit.js,
  repro-vet-20261024.js, test-vetcommit-20261024.js (all committed under
  scripts/).

## Evidence

- evidence/2026-10-24/journey-endgame-r46.md (this note)
- evidence/2026-10-24/perseed-endgame-r46/endgame-r46-{88011..88014}.json
- evidence/2026-10-24/perseed-endgame-r46/endgame-r46-{88011..88014}-transcript.txt
- scripts/probe-endgame-r46-20261024.js
- scripts/analyze-endgame-r46-20261024.js
- scripts/policies/vetcommit.js
- scripts/repro-vet-20261024.js
- scripts/test-vetcommit-20261024.js

**Game-code changes this run:** none (zero src/js).
**Tooling:** r46 probe/analyzer/vetcommit/repro/proof (new).

## Telemetry deviation check (2026-10-24)

- LOUD: maxTier disappeared (baseline 16 -> current 0, n=4 files).
  LOUD: satPenalty.penalty disappeared (baseline 91 -> current 0, n=4).
- VERDICT: EXPLAINED, not a behavior change. All four seeds sat the same
  day they announced (tier 0, penalty 0) while the baseline was seeded on
  long-deferral sits (r37's 81001 rode 38 days/6 tiers). The mechanism is
  verified live: satPenalty records {tier 0, losses 0, penalty 0} match
  REG-r37 GO (no voiced penalty line expected at 0). Baseline NOT
  rolled — different population (quick-sit vs long-deferral); the
  baseline still describes sitting runs that wait out the clock. The
  quick-sit population is itself the r47 lead: nobody has yet run the
  deferral axis.

## Recovery closeout (main agent, 2026-10-24 ~05:45 CDT)

The 04:00 run timed out mid-landing with the work above uncommitted.
Recovery verified: no live procs, heartbeat kept fresh through the
recovery, EPERM probe CLEAR, branch rebased onto master a44478652
(clean — all 7 items untracked, zero src/js), check.js --quick re-run
282/5 matching baseline exactly, ONTOLOGY.md regeneration side effect
from the check run discarded (1-line stale bloodrestraintBlooded entry
— pre-existing doc nit, not this run's work). Committed via safe-commit,
ff-merged, worktree released/removed, lock deleted, rotation advanced
4 -> 5 (social next). No src/js changes in the landed commit.
