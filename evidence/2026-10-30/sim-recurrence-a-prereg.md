# sim-recurrence-a — PREREGISTRATION (binding, committed BEFORE any judged analysis)

Run: flesh-out loop, run fleshout-20261030T0641Z (coordinator-assigned
worker sim-recurrence-a). Axis: scale-onramp (blocking axis, converging,
NOT converged). Ranked next #1 by run fleshout-20261030T0533Z
(sim-chainclose-a, evidence/2026-10-30/sim-chainclose-a.md).
DIAG arm, MEASUREMENT ONLY — zero src/js game changes, no default flip,
no gate change, no deed-bar move, no damage buff. This arm DECOMPOSES
chainclose's recurrence finding (only 2/10 wild wave-4 chains ever meet
twice; 8/10 are single meetings); it does not build to any target.
No game change is proposed here as a verdict.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (Wave 4: The Mirror Draft,
standing >= 100 gate; bands damage 35-95, HP 850-1500; a 4-6 round fight
for a godhood build). NO CANON-registered doc covers chain recurrence
or beast re-meeting — the fate taxonomy below is measurement-defined
from the recorders' own fields, stated exactly so it can be checked,
and is NOT canon. Governing canon rules: CANON.md "Monster encounters
are fought, not rolled" and the perception law (Steve 2026-10-28):
tile-mate presence is REPORTED from recorded state only, never fed
into any decision.

## Code-grounded mechanics (not canon — cited so the fate rules can be checked)

- World monsters persist on tiles as `state.worldMonsters` and wander
  (game.js `wanderWorldMonsters`: 35% per worldTick step to an adjacent
  non-safe, unoccupied tile, 9x9 world; `maintainWorldMonsters` only
  tops the population up toward the cap — it never culls).
- A non-kill field fight leaves the beast in the world at its reduced
  HP (fieldFights.js: `m.hp = rec.mHpLeft` unless vKill); an mFlee
  steps the beast to an adjacent tile ("still out there"); vFlee/vDie
  leave it on its tile.
- Villagers meet beasts only by standing on the beast's tile at a
  worldTick (`villagerMonsterTick`: 50% per tick, one random villager
  among those on the tile; sheltered and post-flee-resting villagers
  excluded). `worldTick` runs on tile entry, so encounter opportunity
  is villagers-out-on-tiles, not a rate the game rolls globally.
- World monsters are removed only by kill paths, the alreadyDead
  clearing (a fieldFight meeting, so it would join the chain), and
  campaign clears (finale-campaign.js clears ALL world monsters;
  network-campaign clears network nodes only — wave-4 mids are not
  network nodes). There is no ambient despawn for world monsters.
  CONSEQUENCE: a wounded instance that vanishes from the census
  without a recorded fight was almost certainly killed in scholar
  turn-based combat (which no fieldFight recorder sees) or wiped by
  a campaign clear — both are reported as CANDIDATES, never claimed
  as proven, unless the seed's entered-table flag supports the wipe.

## Band and substrate (binding — identical to chainclose, verified not invented)

- Seeds 75101-75116 (16, the chainclose band), 180d death-aware
  horizon (dead villages stop simulating; +10d tail max per
  MEASUREMENT.md §10 — the harness's death-aware stop).
- Horizon why: same as chainclose — the question is explicitly
  "inside a village lifetime", so the horizon must exceed observed
  village lifetimes without being a fixed 200d claim; keeping
  chainclose's horizon makes windows comparable in kind.
- Policy: scripts/policies/tableseat-nowait.js VERBATIM.
- Game substrate env (verbatim from chainclose's prereg):
  LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1, W4DPR=1.
- Recorder stack (reused verbatim, never edited):
  fieldparty-form-diag, w4dpr-diag, breakline-diag, tilejoin-diag,
  shoutrec-diag, joinendlines-diag, with env BREAKLINE=1, TILEJOIN=1,
  SHOUTREC=1, JOINENDLINES=1. TILEJOIN=1 disclosure carried from
  chainclose: it enables the tilejoin prototype feed (tile mates only,
  perception-law compliant — never a roster feed), part of the reused
  instrument stack, NOT a new game change by this arm.
- Sweep: scripts/sweep-chainclose-a.js run VERBATIM with EVID pointed
  at evidence/2026-10-30/perseed-recurrence-a (the script reads EVID;
  its row stores only the BASENAME, so rows are comparable file to
  file). NO copy of the sweep with edited defaults: editing defaults
  is how comparability silently breaks. The ONLY new sweep code is
  scripts/sweep-recurrence-a.js, a thin wrapper that (a) sets EVID to
  perseed-recurrence-a, (b) additionally snapshots the world-monster
  census once per simulated day (see below), and (c) delegates every
  seed run to the chainclose sweep's runOne. If the wrapper's
  presence changes any fieldparty row, the SUBSTRATE-EQUIVALENCE leg
  fails and the run stops — the census must be provably non-perturbing.
- NEW INSTRUMENT (additive, record-only, never a game change):
  the world-monster census. Once per simulated day, inside the sweep
  wrapper's daily hook (which runs before sleep rolls the day, per
  sim-harness runDays), snapshot `Game.worldMonsters()` as COPIES
  (never references — the objects mutate): [{id, tx, ty, hp}] plus
  the scholar day. Written to a SEPARATE file per seed
  (perseed-recurrence-a/census-s<seed>.json), never inside the
  s<seed>-fresh.json row, so the row file stays byte-comparable to
  chainclose's. The census reads state only; it consumes no RNG, calls
  no game mutator, and feeds no decision. Instance identity in the
  census is (mid, hp): a wounded beast's HP is stable between fights
  (only fights change it, and fights are recorded), so a (mid, hp)
  pair tracks the instance; a same-day count >= 2 for one (mid, hp)
  pair is a COLLISION and is reported wherever it affects a fate.
- RE-DERIVATION CLAUSE (binding): this run's OWN corpus IS the
  baseline. Do NOT quote chainclose's band numbers as current — not
  its meeting counts, not its chain prices, not its 2/10 recurrence.
  Any comparison to chainclose is a drift diagnostic only, never a
  GO/NO-GO leg — EXCEPT the SUBSTRATE-EQUIVALENCE leg below, which
  compares FILES (byte identity), not judged numbers.

## Universe and definitions (binding, fixed here)

UNIVERSE: every joined row with fieldparty wave == 4 AND channel ==
'field' (wild shape only), all callers, scholar-led flagged (never
silently pooled or dropped). Raid/other wave-4 rows are counted in a
one-line census and excluded from every judged table.

CHAIN (carried verbatim from chainclose, grouping FIXED): a maximal
run of meetings of the SAME mid on the SAME seed, in day order, in
which each meeting's mHpStart equals the previous meeting's mHpLeft
(wound continuity). Grouping key is (seed, mid) — the chainclose
analyzer bug (mid alone) is NOT repeated: this arm REQUIRES
`buildChains` from scripts/analyze-chainclose-a.js (the fixed code)
rather than re-implementing grouping, and fixtures prove the
cross-seed separation through that require. This arm does NOT edit
another arm's files. A meeting whose mHpStart differs from the
previous same-mid meeting's mHpLeft STARTS A NEW CHAIN. Zero-dealt
meetings have mHpStart == mHpLeft trivially, so chain assignment
across a zero meeting is by continuity + order. A chain is "finished"
only if a meeting ends with mHpLeft == 0 (a kill); no chain is called
finished by extrapolation.

CENSUS MATCHING (binding): for a chain with last meeting day L and
last HP H (the last meeting's mHpLeft), a census snapshot on day d
CONTAINS the instance iff some entry has id == mid AND hp == H.
Post-window snapshots are snapshots with day > L (strict — a
same-day snapshot may precede the meeting). lastSeen = max post
snapshot day containing the instance, or null if none. finalDay =
max snapshot day for the seed. Census days are the scholar days the
wrapper recorded; a gap between consecutive snapshot days is
reported, never interpolated.

WINDOW: windowDays = seed days - lastDay (whole days from the chain's
last meeting to the run's end; a lower bound when censored, i.e.
endReason == 'survived'). FIRST-CONTACT RUNWAY: days - firstDay.
SHORT WINDOW (binding threshold, justified): windowDays <= 7.
Justification, stated before seeing this corpus: chainclose's two
recurring chains re-met at gaps of 1, 1, 2 and 5, 1 days — the
longest observed re-meeting gap is 5 days, so a 7-day window covers
every observed re-meeting interval with margin. A village that ends
within 7 days of last contact ended before a re-meeting could
plausibly occur on the observed cadence; a longer window that
produces no re-meeting is a crossing failure, not a window failure.

## Recurrence fate taxonomy (binding — exactly one fate per chain, priority order)

Apply in order; the first matching rule is the fate. Every fate
carries its evidence fields (no bare labels).

1. FINISHED — the chain's last meeting ends with mHpLeft == 0.
   Evidence: killing meeting day, dealt that meeting.
2. BEAST-VANISHED — the instance is gone from the census before the
   run ends, with NO recorded fight killing it. Matches when post
   snapshots exist AND (no post snapshot contains the instance, OR
   lastSeen < finalDay with at least one snapshot after lastSeen).
   Evidence: lastSeen (or "gone by first post snapshot"), finalDay,
   entered-table flag (finale wipe is a candidate ONLY if entered),
   and the candidate list (scholar tb-combat kill; finale wipe if
   entered; never "despawned" — world monsters do not ambiently
   despawn, per the code section above). If a same-mid meeting AFTER
   the chain's last meeting exists in ANY channel, report it
   separately as TYPE-REAPPEARED (a fresh instance of the type, NOT
   this beast) — it never converts VANISHED into anything else.
3. VILLAGE-GONE — the run ended (endReason != 'survived') with
   windowDays <= 7. The village's story ended before a re-meeting
   could plausibly occur. Evidence: endReason, windowDays, and (if
   any) census presence at end as CONTEXT, not as a fate change.
   (A survived seed can never be VILLAGE-GONE — the village is alive
   at the horizon.)
4. STILL-PRESENT-AT-HORIZON — endReason == 'survived' AND the
   instance is present on the final census day. Evidence: finalDay
   presence, windowDays, fieldDaysInWindow.
5. NEVER-CROSSED — windowDays > 7, the instance is present on the
   final census day (or, for a run ended by win/loss after a long
   window, present on the last census day), AND fieldDaysInWindow
   >= 1. The beast lived, the village went out, they never crossed
   again. Evidence: all opportunity measures below.
6. VILLAGE-NEVER-OUT — windowDays > 7, the instance is present on
   the last census day, AND fieldDaysInWindow == 0. The beast lived
   but the village never went out again in the window (haven-bound,
   table-sitting, or otherwise out of the field). Evidence:
   fieldDaysInWindow == 0, windowDays, last census presence.
7. UNCLASSIFIED — anything else (in practice: long window, run
   ended, and NO post snapshot exists to prove presence or absence).
   UNCLASSIFIED is a leg failure, not a fate to report proudly: any
   UNCLASSIFIED chain fails the CLASSIFICATION leg.

Notes: a chain that re-meets (n >= 2) is NOT assigned a recurrence
fate for its non-recurrence — recurring chains are reported in the
recurrence table with their gaps, and their post-LAST-meeting fate
is classified by the same tree (their last meeting is still a last
meeting). The headline decomposition counts ALL chains; the
single-meeting (n = 1) sub-count is reported separately, since
chainclose's finding is about n = 1 chains. FINISHED chains (if any)
are counted separately from all non-finished fates.

## Encounter-opportunity measures (per chain, all chains, not just NEVER-CROSSED)

Computed from the full fieldparty corpus (all waves, all channels)
plus the census, for the post window (days > lastDay, up to the run's
end):

- windowDays, fieldDaysInWindow (distinct days > lastDay with >= 1
  fieldparty meeting with channel == 'field', any wave),
  fieldMeetingsInWindow (count), distinctTilesVisited (distinct
  mTile values of field-channel meetings in the window),
  beastLastTile (mTile of the chain's last meeting),
  tileRevisits (field-channel meetings in the window whose mTile ==
  beastLastTile), adjacentTileVisits (meetings on the 8-neighbor
  tiles of beastLastTile), beastCensusDays (post snapshots containing
  the instance), beastLastSeenDay, beastTileDrift (max Chebyshev
  distance from beastLastTile across census positions of the
  instance in the window; null if never seen post),
  typeReappeared (later same-mid meetings on the same seed in ANY
  channel after lastDay: count + opening HPs), typeKilledLater
  (among those, count ending mHpLeft == 0 — instance UNPROVEN, labeled
  as such), beastHpAtLast (mHpLeft), totalDealtToChain, firstDay,
  lastDay, firstContactRunway (days - firstDay).

## Primary metrics (binding)

- COMPLETENESS (blocks DIAG-GO): 16/16 valid seeds (days > 0) AND
  every recorder (fieldparty, w4dpr, breakline, shoutrec, tilejoin,
  joinendlines) errs 0 with overflow empty AND joins 100% (all six
  recorders index-aligned per seed; mid/vid/day match at every
  index; join errors 0) AND mDealt agreement breakline==w4dpr at
  every row AND shoutrec PREFIX-CONSISTENCY at every row
  (roundTotals entries non-decreasing and each <= the final total)
  AND census files present and parseable for 16/16 seeds, snapshots
  sorted by day, final snapshot day within 1 of the seed's days.
- SUBSTRATE-EQUIVALENCE (blocks DIAG-GO): all 16
  s<seed>-fresh.json rows byte-identical to chainclose's corpus
  rows (evidence/2026-10-30/perseed-chainclose-a/s<seed>-fresh.json).
  This proves the census wrapper did not perturb the game and the
  substrate is the chainclose substrate. Any byte difference fails
  this leg — the run stops and reports drift, it does not re-baseline
  silently.
- CLASSIFICATION (primary metric, blocks DIAG-GO): EVERY wild wave-4
  chain (seed, mid) assigned exactly one fate from the taxonomy, with
  0 UNCLASSIFIED, and every chain's opportunity measures computed
  (null only where the measure is definitionally unknowable, with
  the reason stated — e.g. beastTileDrift null when never seen post).
  NaN, missing, or silently dropped chains fail this leg.
- DETERMINISM GATE (blocks DIAG-GO): one seed re-run into a scratch
  EVID dir; its row JSON byte-identical to the corpus row AND its
  census JSON byte-identical to the corpus census. Scratch dir
  removed after the diff.
- SENSE BAR (blocks DIAG-GO): EVERY first-meeting transcript of
  every non-recurring (n = 1) chain read end to end, PLUS the
  first-meeting transcript of every recurring chain (so all chains'
  first meetings are read; recurring chains' later meetings are
  sampled at one per chain when a log exists). Judgment is
  meaning/coherence/consequences (does the first meeting read as a
  beast the village could plausibly meet again — same tile region,
  a flee the beast survives, a village that walks away alive — or
  does the story itself foreclose return), not counts
  (SENSE-TESTING LAW). Meetings with rounds < 1 have short or empty
  logs; the log length is reported, never padded.
- FIXTURE BAR (blocks judging): scripts/test-recurrence-a.js must
  prove, before the corpus is judged, on synthetic rows: the fate
  decision tree in priority order (FINISHED beats VANISHED; VANISHED
  beats VILLAGE-GONE; short-window run-end beats NEVER-CROSSED;
  survived+present beats NEVER-CROSSED; presence+no-activity gives
  VILLAGE-NEVER-OUT; no-post-snapshot long-window gives
  UNCLASSIFIED), the cross-seed chain separation THROUGH the required
  chainclose `buildChains` (not a local re-implementation), census
  matching by (mid, hp) including a collision report, window and
  opportunity arithmetic (field days, tile revisits, adjacency,
  drift, lastSeen), and the byte-identity comparison used by the
  substrate-equivalence and determinism legs.

## Verdict rule

- DIAG-GO iff COMPLETENESS PASS + SUBSTRATE-EQUIVALENCE PASS +
  CLASSIFICATION PASS + DETERMINISM PASS + SENSE PASS + FIXTURE PASS
  + a RANKED NEXT named with numbers.
- A completeness/substrate/classification/determinism/sense/fixture
  failure is DIAG-NO-GO.
- INSUFFICIENT-DATA (reported, never silently widened): if the band
  yields ZERO wild wave-4 meetings, the arm reports INSUFFICIENT-DATA
  with the counts and states the widen-or-close choice for the
  coordinator — seeds are NOT widened silently mid-run. A fate class
  with too few cases to characterize is reported as
  INSUFFICIENT-DATA for that class (counts only, no lever judgment
  from it) — it does not soften the CLASSIFICATION leg (classification
  itself must still be complete) but it does bound what the evidence
  may claim about that class.
- A miss is NO-GO, never re-scored against a friendlier metric
  mid-run; metric doubts go under "metric review" for the NEXT run.
  Every evidence file carries a "metric review" section.
- NO lever verdict: this arm does not propose a damage buff, gate
  move, recurrence lever, or any game change. Its verdict is about
  the measurement (fates decomposed, opportunity measured), not
  about building to a target.

## Method (staged, binding order)

1. This prereg, committed BEFORE any judged analysis.
2. Instruments (sweep wrapper + analyzer + fixtures), committed
   before the judged sweep is analyzed (fixture bar green first).
3. Sweep (16 seeds into perseed-recurrence-a), substrate-equivalence
   diff vs chainclose corpus, determinism gate (one seed, scratch
   dir, removed after diff), sense transcripts read per the bar.
4. Evidence evidence/2026-10-30/sim-recurrence-a.md with
   header-vs-result, the recurrence decomposition table (per chain:
   first/last day, HP/wounds at last meeting, first-contact runway,
   days beast alive after last meeting, fate + evidence), the
   opportunity table for NEVER-CROSSED chains (and summary for all),
   wall numbers (report-only, same upper-middle median convention
   as chainclose), sense notes, ranked next, and findings-backlog
   items found (reported to the coordinator, NOT appended to
   sim-findings.md by this worker).
5. No src/js change, no push, no bump, no live verification. Report
   'branch ready for coordinator merge, pending ship' (coordinator
   merges; sibling loop B may move master under this branch — rebase
   cleanly at the end and re-run the proof; rebase conflict = FAIL
   LOUDLY, no force, no merge).

## Node harness

Eval the FULL src/js/*.js list in index.html order (minus DOM-only
app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js) via the shared
sim-harness (loadGame seeds Math.random BEFORE eval). Never stub
Game.save. Never run concurrent jest; use
--cacheDirectory=/tmp/jest-cache-sim-recurrence-a (no jest is run by
this arm — the sweep/analyzer are plain node scripts).
