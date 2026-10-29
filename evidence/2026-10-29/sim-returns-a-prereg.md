# sim-returns-a — PREREGISTRATION (binding, committed BEFORE any judged census)

Run: fleshout loop, run fleshout-20261029T0002Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-returns-a.
Assignment: DELIBERATE RETURNS diagnosis ONLY — zero src/js, zero
game-behavior changes, zero default flips, zero policy changes.
This arm classifies and quantifies; it does not build the fix.
The blank is a measurement blank: a complete, classified
returns census IS the fill.

## Ordering call (documented, per assignment)

Run 2236Z's next blank #4 (deliberate returns) is taken AHEAD of
the narration-only ghost blank. Reason: the scale wall's binding
constraint is kills — run 2115Z's chainkill census found 13
chains, 0 kills, 0 drive-offs, and runs 0205Z/0015Z found
villagers kill 0/87 wave-3+ monsters in the field. Whether
villagers ever deliberately return to a known monster decides
whether chaining can ever become a kill path (planned returns
raise meetings-per-beast) or stays accidental nibbling. A
narration-only blank cannot move the kill number; this one
could, so it goes first. The ghost blank is NOT closed by this
arm and is NOT claimed closed in its evidence.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law, wave-4
bands 850–1500 HP, damage 35–95). docs/PERCEPTION.md covers
perception hints, not travel. No CANON-registered doc covers
travel-to-known-monsters or field-fight returns — that gap is
stated here instead of invented canon. The mechanism below is
derived from code, stated exactly so it can be checked:

- RETURN-TO-FIGHT (villager-objectives.js header + game.js
  resolveWildMonsterEncounter comment, 2026-10-27): a villager
  who actually fights a living world monster remembers the
  fight's tile, and only that villager may be offered a HUNT
  errand back to it. Memory store:
  state.village.monsterSightings[vid] = [{mid, tx, ty, day,
  part}], cap 4 per villager, oldest dropped first. Recorded
  for the fight leader AND the answering ally (rec.allyVid);
  never from a mere sighting, never from gossip, never from
  the monster list; never for the scholar (player); never
  for raid fights (defence, not a place to return to); an
  'evade' records nothing, an 'alreadyDead' records nothing.
- HUNT OFFER (villager-objectives.js objPick + objHuntCandidate):
  at a dawn/idle pick, a villager with a fight memory may be
  offered HUNT at lottery weight 2.0 (food, water, hall life
  still compete — an offer is never a guarantee). Gates, all
  enforced by objHuntCandidate: memory fresh (age 0–3 days),
  villager armed, within roaming range (1 <= Chebyshev
  distance <= npcMaxDist), not sheltering, not resting off a
  bad flee. HUNT is solo by design (objMaybeDepart: a hunt
  never drags a companion who has not seen the beast).
- HUNT TRAVEL (objHuntFromSite / objAwayStep): the objective
  carries provenance (huntMid/huntTx/huntTy/huntDay) and
  targets the REMEMBERED tile — whether or not the beast is
  still on it when the villager arrives. On arrival at the
  hunt tile with the quarry gone (monsterAt missing or a
  different id), the memory is spent via objDropMonsterSighting
  — the ONLY caller of that function in src/js, so a drop
  record IS a deliberate-return arrival at an empty tile.
  Beasts wander between ticks (wanderWorldMonsters, 35%
  move chance per tick), so a remembered tile can empty
  while the beast still lives nearby.
- MEETING (game.js villagerMonsterTick): villagers on a
  monster's tile meet it through resolveWildMonsterEncounter
  (at most one npc per monster per tick, 0.5 probability) —
  the same fieldFight engine the chainkill census records.
  A HUNT villager meets the beast only if the beast is on a
  tile the villager stands on when the tick fires; standing
  on the remembered tile does not summon the beast.
- CONSEQUENCE FOR THIS CENSUS: a deliberate return is
  observable ONLY as (live HUNT travel intent) + (a fight
  memory that predates the meeting). Anything inferred from
  the meeting's outcome, from same-villager repeats, or
  from same-tile coincidence is NOT deliberate — chainkill
  already showed same-villager repeats (catalina d97/d99)
  that read as coincidence, and this arm must not re-label
  them deliberate without a travel record.

## Fresh band (this arm's own census, base code)

- Seeds 75101–75116 (16, the chainkill band verbatim, so
  chain counts are comparable), scripts/policies/
  tableseat-nowait.js VERBATIM, LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1, FIELDPARTY=1 (fieldparty-form-diag
  recorder, reused VERBATIM, never edited) PLUS the new
  returns recorder (scripts/policies/returns-diag.js,
  RETURNS=1; observational only, pure pre-reads, no game
  writes, no RNG draws, never throws into the engine).
  180d death-aware (runDays stops on death/win, as in the
  predecessor sweeps), competent policy (tableseat-nowait
  wraps leanlinkrescue courtship, same as chainkill).
- WHY 16 SEEDS: chainkill's 13 chains came from this band;
  reusing it exactly lets this arm cross-tab deliberate
  returns against the known chain set instead of drawing a
  new, incomparable one. Seeds are nearly free (Steve
  2026-10-13).
- CONTROL-SHAPE GATE (must pass BEFORE any chain or return
  is judged): on this base-code band, judgedA
  (resolve/patrol/aid, wave-4, field, villager-led) formed
  0 AND kills 0, AND judgedB (resolve/patrol) formed 0 AND
  kills 0 — the known control shape (1528Z control, fresh
  retreatdiag, chainkill fresh: judgedA 42 formed 0 kills 0,
  judgedB 31 formed 0 kills 0). FORMED def verbatim from
  the chainkill sweep: crewRaw minus leader non-empty AND
  (calledHelp OR joinedAllyVid non-null). If the shape does
  NOT match, the census instrument is suspect: STOP,
  report, do not judge returns against a broken census.
- CORPUS LEGS (with the gate): 16/16 rows, days > 0,
  recorder errs 0 (BOTH recorders), overflow 0, returns
  join errors 0 (see Join below).
- Wall numbers for the fresh band (reported, never claimed
  as movement): national ever/final, table invited/entered,
  wins (lesser/full), wave-4/5 reach, median survival,
  death-cause shares. NO wall movement is claimed from
  re-analysis alone — the fresh band is a census, not an
  intervention.

## Returns recorder (what is captured, pre-meeting only)

At every fieldFight, BEFORE the engine runs (pre-reads are
pure state reads, never writes — objectives read via
state.village.objectives[vid] directly, NEVER via objOf(),
which creates entries; nodePos read directly, never via
npcNode(), which creates entries):

- MEETING RECORD: day, recorder part counter, vid (leader),
  mid, wave, caller, channel, mTile, mHpStart, then
  post-fight: outcome, rounds, mDealt, mHpLeft, calledHelp,
  joinedAllyVid (the answering ally, if any).
- LEADER TRAVEL SNAPSHOT (pre-meeting): current objective
  {kind, purpose, state, tx, ty, huntMid, huntTx, huntTy,
  huntDay} or null; full pre-meeting sightings list for the
  leader (copies of {mid, tx, ty, day, part}); pre-meeting
  sightings lists for every allyVid named in opts (known
  before the fight), so ally-knower flags also rest on
  pre-meeting state. Any sighting whose (day, part) is not
  strictly before the meeting's (day, part) does NOT count
  as pre-meeting (the meeting's own memory write happens
  after the fight and must never classify its own meeting).
- DEPARTURE RECORD: every objDepart call, post-call
  objective copy {vid, kind, purpose, state, tx, ty,
  huntMid, huntTx, huntTy, huntDay} + day/part. A HUNT
  departure is a travel-intent record independent of any
  later meeting.
- DROP RECORD: every objDropMonsterSighting call {vid,
  mid, tx, ty} + day/part + return value. Per the code
  above, a drop is a HUNT arrival at a remembered tile
  whose quarry is gone.
- JOIN: returns meeting records join to fieldparty meeting
  records by per-seed fight order index; the join is
  VERIFIED (mid, vid, day must match at every index).
  Join mismatches are counted as join errors and must be
  0, or the census is invalid. The chain analysis runs on
  the fieldparty records (identical to chainkill); the
  returns classification runs on the joined records.

## Classification (per meeting in universe U, never from outcome)

Universe U: every meeting with wave == 4, channel ==
'field', caller in {resolve, patrol, aid}, leader NOT the
scholar — judgedA verbatim from chainkill. Classes, in
priority order (first match wins; a meeting gets exactly
one class):

1. DELIBERATE: leader's pre-meeting objective is kind
   HUNT, state 'out', huntMid == meeting mid, AND the
   leader's pre-meeting sightings contain an entry with
   the same mid whose (day, part) is strictly before the
   meeting's (day, part). Travel intent + prior knowledge,
   both recorded before the meeting.
2. DELIBERATE-ORPHANED: leader's pre-meeting objective
   is kind HUNT, state 'out', huntMid == meeting mid, but
   NO pre-meeting sighting for that mid (memory spent on
   an empty-tile arrival, or capped out at 4). Travel
   intent is proven; the memory link is broken. Reported
   separately, NEVER pooled into clean DELIBERATE.
3. HUNT-READY-NOT-OUT: leader's objective is kind HUNT
   with huntMid == meeting mid but state != 'out'
   (ready, returning, indoor). Picked but not travelling
   — not a deliberate return.
4. MEMORY-ONLY: leader has a pre-meeting sighting for
   the meeting mid, but no live HUNT objective for that
   mid. A knower present by another errand — accidental
   with knowledge, not deliberate travel.
5. ACCIDENTAL: no pre-meeting sighting for the meeting
   mid by the leader, and no HUNT objective for that mid.
   Pure accident (includes the chainkill same-villager
   repeats unless a travel record proves otherwise).
- ORTHOGONAL FLAGS (never change the class):
  (a) ALLY-KNOWER: the joined ally has a pre-meeting
  sighting for the meeting mid while the leader does not.
  (b) HUNT-OTHER-MID: the leader is on a HUNT objective
  for a DIFFERENT mid at meeting time (a travelling
  hunter who met another beast).
  (c) HUNT-TILE (for DELIBERATE + DELIBERATE-ORPHANED
  only): EXACT (huntTx/huntTy == meeting mTile), NEAR
  (Chebyshev distance <= 2, the engine's objDist), FAR
  (> 2 — intent toward the beast, met elsewhere).
- CHAIN CROSS-TAB (chain rule verbatim from chainkill):
  chains are maximal sequences of >= 2 meetings linked
  by exact HP equality (next mHpStart == previous
  mHpLeft, same seed, same mid, chronological file
  order, most-recent predecessor, AMBIGUOUS/FORK/
  IMPOSSIBLE-LINK flags). Every chain meeting after the
  first is a re-meeting; the census cross-tabs: chains
  containing >= 1 DELIBERATE meeting; chains whose
  TERMINAL meeting is DELIBERATE; kills/drive-offs split
  by the terminal meeting's class; and DELIBERATE
  meetings that are NOT chain links (HP trail broken by
  censored scholar damage — a deliberate return the chain
  rule cannot see).
- HUNT ATTEMPT CENSUS (secondary, never pooled into
  meetings): HUNT departures (all, and wave-4-mid only
  via the monsters.json wave field); HUNT drops (arrived,
  quarry gone); DELIBERATE meetings paired to their most
  recent prior HUNT departure for the same vid+mid
  (reported paired count + median lag in day-parts;
  unpaired DELIBERATE meetings are a data-quality item
  to explain, not silently dropped).

## Questions and metrics (fixed before judging)

- PRIMARY Q: do villagers EVER deliberately return to a
  known monster's location? Answer = clean DELIBERATE
  meeting count (orphaned listed separately; an orphaned
  meeting does NOT answer "yes" cleanly, and is reported
  as such). Zero is a complete answer, not a failure.
- SECONDARY: do deliberate returns convert? For each
  class: meetings, kills, drive-offs, flees, deaths
  (vDie), and per chain: chains with a deliberate meeting,
  chains with a deliberate terminal meeting, kills from
  deliberate terminals vs accidental terminals.
- ATTEMPT CONVERSION: HUNT departures -> HUNT drops ->
  DELIBERATE meetings -> kills. Each step counted; a
  step at zero names the break precisely (never offered?
  never departed? never arrived with quarry present?
  never met? never killed?).
- CENSORING, STATED UP FRONT: (a) scholar fights are NOT
  in U and can wound beasts between villager meetings,
  breaking HP chains invisibly — DELIBERATE meetings
  that are not chain links are therefore counted
  separately, not lost; (b) a beast met once then never
  again may still be alive at horizon — STILL-ALIVE
  means "alive at its last villager meeting", as in
  chainkill; (c) the memory cap (4) and 3-day freshness
  mean older chains CANNOT be deliberate via HUNT — a
  chain spanning > 3 days from its first meeting can
  contain a deliberate meeting only via a REFRESHED
  memory (a later fight re-recording it), which the
  pre-meeting sighting check captures honestly.

## Sense-testing law (transcripts read + quoted)

- S1 (corpus-derived): the LONGEST chain thread in the
  fresh band, end to end — every meeting with its class,
  plus the HUNT departure/drop records for its villagers
  in the thread's window. Judge: does any meeting read
  as a deliberate return (a departure line, a hunt
  errand, a "going back for it" beat), or do the
  re-meetings read as accidents? If no deliberate
  meeting exists in the band, the thread's absence of
  travel records IS the reading, stated as such.
- S2 (fresh fixture, base code): a seeded objPick lottery
  for a villager holding a fresh, armed, in-range fight
  memory — 200 picks, HUNT pick share, and one quoted
  departure line (objDepart) if the fixture drives one
  cleanly; if the departure line cannot be driven in the
  fixture, that failure is reported honestly and the
  lottery counts + corpus threads carry the sense bar.
  The fixture's job is the mechanism + the reading, not
  a kill claim: any outcome is reported, none is failed
  on.
- SENSE VERDICT categories: DELIBERATE-RETURNS-READ
  (a corpus meeting with a pre-meeting travel record
  that reads as a person going back) / ACCIDENTAL-ONLY
  (re-meetings with no travel record, reading as
  coincidence) / MIXED. If a deliberate meeting exists
  but no line ever names it as a return to a player who
  could follow it, that is a NARRATION blank to name,
  not a mechanism claim. No narration fixes are built —
  this arm is diag only.

## Bars (judge against this header; a miss is DIAG-NO-GO)

- CENSUS-VALIDITY: 16/16 rows, errs 0 (both recorders),
  overflow 0, control shape matches (formed 0, kills 0 on
  BOTH judged cuts), join errors 0.
- CLASSIFICATION BAR: 100% of U meetings classified
  into the scheme above, OTHER = 0; 100% of found chains
  classified (chainkill scheme), OTHER = 0.
- DETERMINISM GATE: re-run seed 75106 (the highest-yield
  chainkill seed) into a scratch dir; its row JSON must
  be byte-identical to the corpus row. A diff is an
  instrument failure to report, not a footnote.
- SENSE BAR: >= 1 corpus chain thread read + quoted
  (S1) AND the fixture mechanism read + quoted (S2).
- DIAG-GO BAR: census valid AND every meeting and chain
  classified AND determinism gate passes AND >= 2 sense
  reads quoted AND one ranked next step named with
  numbers. Any leg missed → DIAG-NO-GO. No re-scoring
  against a friendlier metric mid-run; metric doubts go
  under "metric review" in the evidence file.

## What this arm does NOT do

No src/js change, no policy change, no default flip, no
fight routing, no feed, no roster read, no narration fix,
no push, no bump, no live verification. No re-judgment of
predecessor verdicts (chainkill DIAG-GO, fieldfeed
pilot-GO-only, shoutgate NO-GO all stand). No wall movement
claimed from re-analysis. No panel artifact (standing
exception: the panel has no census-ingest mode; identical-
seed before/after corpora are the §15 substitute, as in
prior rounds). Instruments:
scripts/policies/returns-diag.js (new recorder, diag only),
scripts/test-returns-a-sweep.js (fresh band),
scripts/test-returns-a.js (returns analyzer + judge),
scripts/test-returns-a-fixtures.js (analyzer correctness
on fixtures), scripts/test-returns-a-sense.js (corpus
thread + mechanism fixture). Each must pass `node --check`;
analyzer + fixtures + sense must print green. Never run
concurrent jest; cache dir /tmp/jest-cache-sim-returns-a
(no jest expected — node scripts only; the rule is
recorded, not waived). Never touch docs/ONTOLOGY.md.
Never touch sibling loop-B trees/branches or their claims.
Never touch the main tree or any other worktree.

## Metric review (filled at judging time)

- (to be filled when the analyzer runs)
