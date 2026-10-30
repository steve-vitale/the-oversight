# sim-stalkertick-a — PREREGISTRATION (binding, committed BEFORE any judged analysis)

Run: flesh-out loop, run fleshout-20261030T0855Z (coordinator-assigned
worker sim-stalkertick-a). Axis: scale-onramp (blocking axis, converging,
NOT converged). DIAG arm, MEASUREMENT ONLY — zero src/js game changes, no
default flip, no gate move, no deed-bar move. This arm builds an
instrument and reports what it measures; it proposes no game change.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (Wave 4: The Mirror Draft,
standing >= 100 gate; bands damage 35-95, HP 850-1500). NO CANON-registered
doc covers a stalker-tick target specifically — the definitions below are
measurement-defined from the recorders' own fields, stated exactly so they
can be checked, and are NOT canon. Governing canon rules: CANON.md
"Monster encounters are fought, not rolled" and the perception law (Steve
2026-10-28): tile-mate presence is REPORTED from recorded state only,
never fed into any decision.

## Question (from the coordinator assignment, with the verdicts it carries)

Do vanished wave-4 beasts accumulate lostSight/stalker ticks toward the
>6 removal threshold? The sibling arms' verdicts are CARRIED, not
re-judged here, and scholarmelt's matching window is NOT widened:

- s75102 eulogy 853 chain: judged LOSTSIGHT-REMOVE by the sibling
  removal arm (removal seq 41, d62, lostSight=7 > 6, monsterTurn stack,
  no fight). This arm reports its tick path day by day; it does not
  re-judge the verdict.
- s75116 suburb 1285: resolved as SCHOLAR-MELT via a toll bridge
  (uid-proven 1285→960 draft). This arm reports its tick path; it does
  not re-judge the verdict.
- s75102 algorithm 959: SCHOLAR-MELT (EDGE) under a same-day caveat.
  This arm reports its tick path; it does not re-judge the verdict.

The sibling removal arm's evidence file (sim-removal-a.md) was NOT
present in this worktree at prereg time; the verdicts above are taken
from the coordinator assignment verbatim. If the removal file appears
later, the coordinator reconciles; this arm does not re-derive its
verdicts from scratch.

## Mechanism, read from code (game.js, never invented)

- `spawnWorldMonster` sets `lostSight: 0` on every world monster.
- `monsterTurn()` — which runs ONLY for the scholar-tile monster
  (`playerMonster()`, on player move/wait/batch actions) — is the ONLY
  place `lostSight` moves in the world-monster path:
  - hummice branch: `lostSight = 0` (hears the scholar).
  - cannot see any target (scholar or nearest villager): `lostSight += 1`;
    if `lostSight > 6`, `removeWorldMonster(m)` — the >6 removal.
  - can see a target: `lostSight = 0`.
  - early returns (sleeping haven tier-2, table active, no player
    monster) move nothing.
- `wanderWorldMonsters()` moves monsters between tiles but never
  touches `lostSight`. `villagerMonsterTick()` never touches it.
- CONSEQUENCE (structural, stated before any measurement): a beast that
  never shares the scholar's tile can NEVER accumulate lostSight ticks;
  its census lostSight stays 0 forever. A lostSight removal is therefore
  possible only for a beast that was on the scholar's tile with
  monsterTurn ticks while unseen. The recorder must capture BOTH the
  daily census value AND the intra-day monsterTurn events, because a
  beast can tick 0→7 and vanish between two daily censuses.

## Band and substrate (binding)

- Seeds 75101-75116 (16, same band as chainclose/recurrence/spawnhp/
  scholarmelt/removal), 180d death-aware horizon (dead villages stop
  simulating; +10d tail max per MEASUREMENT.md §10).
- Policy: scripts/policies/tableseat-nowait.js VERBATIM.
- Game substrate env (verbatim from chainclose's sweep):
  LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1, W4DPR=1,
  BREAKLINE=1, TILEJOIN=1, SHOUTREC=1, JOINENDLINES=1.
- Recorder stack (instruments, reused verbatim from the chainclose
  sweep, never edited): fieldparty-form-diag, w4dpr-diag,
  breakline-diag, tilejoin-diag, shoutrec-diag, joinendlines-diag.
  This arm installs ONE new engine wrap set, scripts/policies/
  stalkertick-diag.js (STALKERTICK=1 gate, record-only):
  - Daily census snapshot (same phase as scholarmelt's census: BEFORE
    base.daily runs): EVERY world monster, as copies, with id, wave,
    tx, ty, mx, my, hp, maxHp, lostSight (null when the field is
    absent on the object), titan, lingering, veteran. Census goes to
    its OWN file (`tick-s<seed>.json`), never inside the row, so the
    row minus the additive stalkertick field stays byte-comparable
    to chainclose's corpus rows.
  - `monsterTurn` wrap (record-only, pure reads, no RNG, no state
    mutation, engine throw recorded and RETHROWN unchanged): pre/post
    snapshot of the scholar-tile monster (found by a pure
    monsterAt(map.px, map.py) scan — NEVER via playerMonster(), which
    can adopt a detached alias and would mutate state), with day,
    scholar tile, lostSight before/after, HP, removed-during-call
    flag (identity check against the world list after the call).
  - `removeWorldMonster` wrap (same discipline): pre snapshot of the
    removed object (instance key, id, hp, tile, lostSight, titan,
    lingering, veteran), flags: wasInWorld, inMonsterTurn (set by the
    monsterTurn wrapper for its duration), tbfightLive at call time.
    Lifts (startCombat) also call removeWorldMonster and will appear
    here with inMonsterTurn=false; the analyzer labels those
    OTHER-REMOVE, never lostSight — the scholar-melt sink is the
    sibling arms' verdict, not this instrument's.
  - Instance identity: a module-side WeakMap (never serialized) maps
    each world-monster object to a stable per-seed instance key
    (`i1`, `i2`, …) assigned at first observation (census, turn, or
    removal). The same object keeps its key across lifts/restores
    (scholarmelt's identity semantics); a fresh spawn is a fresh
    object and a fresh key. tbfight.id is NEVER stored.
- The only new code is scripts/policies/stalkertick-diag.js,
  scripts/sweep-stalkertick-a.js (a chainclose-sweep copy writing to
  perseed-stalkertick-a, seeds 75101-75116, plus the tick census file),
  scripts/analyze-stalkertick-a.js (a pure analyzer: reads corpus
  JSON, never touches game state), and scripts/test-stalkertick-a.js
  (fixtures + determinism check). Shared kit only (sim-harness);
  never copy eval boilerplate; never hardcode absolute paths.

## Universe and definitions (binding, fixed here)

UNIVERSE: every world-monster instance whose wave == 4 on any census
snapshot (wave from the monster object, falling back to the data def),
all seeds. WILD subset (the judged traces): titan false AND lingering
false AT THE INSTANCE'S FATE OBSERVATION — the removal event for a
removed instance, the final census snapshot for a survived instance
(see correction #1). Titan/lingering-at-fate instances are counted in
a one-line census and excluded from every judged trace table.
Raid/other shapes are not a universe here (this instrument records
world monsters, not raid spawns, and raid rows are out of scope —
stated, not silently dropped: the row's fieldparty meetings still
carry the raid census for cross-reference).

CORRECTION #1 (committed after the 1-seed pilot, BEFORE the judged
full-band sweep — an instrument-definition fix, not a re-score: no
judged analysis exists yet, and the judged chains' tick paths
themselves are unchanged by it, only their universe membership).
The pilot exposed that `lingering` is a MUTABLE flag on the same
object, not an identity trait: the s75102 eulogy instance reads
lingering=true on census d56–61 but lingering=false on its d62
monsterTurn events and removal event (havenGrowth.js sets/clears it
around sieges); the s75102 algorithm instance flips false (d59–64)
→ true (d65–70) → false (d71 removal). The original "false on every
snapshot" rule therefore EXCLUDED the very judged chains this arm
exists to trace. The corrected rule matches the sibling arms'
fight-time semantics (scholarmelt classifies wild by flags at the
fight): an instance is wild iff it is not a titan and is not
lingering at its fate observation. Instances that END lingering
(e.g. still besieging at run end) are excluded from judged tables
and counted separately; that edge is named wherever it bites.

INSTANCE TRACE (per seed, per instance key): firstSeenDay (first
census day present), lastSeenDay (last census day present), census
series (day → tile, hp, lostSight), monsterTurn events (day, scholar
tile, lostSight before/after, removed flag), removal event if any
(day, lostSight at removal, inMonsterTurn, tbfightLive). An instance
present on census day D and absent on D+1 (with no later census
presence) has firstAbsentDay D+1. An instance present at the final
census has fate SURVIVED-TO-END (censored — the run ended, not the
beast).

REMOVAL CLASSIFICATION (analyzer labels, from recorded flags only):
- LOSTSIGHT-REMOVE: removal event with inMonsterTurn=true AND
  lostSight at removal >= 7 (the code removes when the increment
  makes it > 6, so the removal-time value is 7 in the normal path;
  >= 7 admits a double-increment edge without inventing one).
- OTHER-REMOVE: any other removal event (includes startCombat lifts,
  field-fight clears, glasswing/curious/titan paths, and any
  uninstrumented path — the analyzer does NOT attribute these to a
  code path; it names the flags and stops).
- NO-REMOVAL-EVENT: present-then-absent in census with no removal
  event between those censuses (a gap the instrument must report,
  e.g. a removal on a day with no census coverage or a path that
  bypasses removeWorldMonster — if this class is non-empty for a
  judged chain, the tick path is reported as PARTIAL with the gap
  named, never papered over).

TICK PATH (the deliverable per judged chain): the census lostSight
series day by day from firstSeenDay to lastSeenDay/firstAbsentDay,
PLUS every monsterTurn event for that instance in the same window
(day, lostSight before→after, removed flag). A tick path is COMPLETE
only if every census day in the window has a lostSight value (not
null) and the removal event (if any) is present; otherwise PARTIAL
with the missing piece named.

JUDGED CHAINS (traces reported, verdicts carried — see above):
- s75102 eulogy, remaining HP 853, lastSeen d61, firstAbsentDay d62.
- s75116 suburb, remaining HP 1285, lastSeen d158, firstAbsentDay d159.
- s75102 algorithm, remaining HP 959 (same-day caveat carried).
Instance matching for a judged chain: the wild wave-4 instance on
that seed whose census series contains the chain's remaining HP at
or before lastSeenDay and whose firstAbsentDay matches the chain's
(or, failing that, the closest wild wave-4 instance by (id, hp)
trajectory, reported as a MATCH-AMBIGUITY, never silently picked).
The villager-meeting HP trajectory (fieldparty/w4dpr meetings in the
row) is the cross-check, not the identity: census instance identity
is the object key, meeting HP is corroboration.

## Primary metrics (binding)

- COMPLETENESS (blocks DIAG-GO): 16/16 valid seeds (days > 0) AND
  every recorder (fieldparty, w4dpr, breakline, shoutrec, tilejoin,
  joinendlines, stalkertick) errs 0 with overflow empty AND census
  snapshots sorted by day with last snapshot day within 1 of the row's
  days, per seed.
- SUBSTRATE EQUIVALENCE (blocks DIAG-GO): own row minus the
  `stalkertick` field byte-identical to chainclose's row per seed,
  16/16. (The tick census file has no chainclose counterpart and is
  exempt; the row is the substrate proof.)
- TRACE COVERAGE (blocks DIAG-GO): a trace (census series +
  monsterTurn events + removal event or SURVIVED-TO-END fate) exists
  for EVERY wild wave-4 instance on the band; and the three judged
  chains each have a COMPLETE tick path, or an honestly PARTIAL path
  with the missing instrument named — a PARTIAL judged path fails
  this leg (it is reported, not softened into a pass).
- DETERMINISM GATE (blocks DIAG-GO): one seed re-run into a scratch
  EVID dir; its row JSON AND its tick census JSON byte-identical to
  the corpus files. Scratch dir removed after the diff (finally
  block; no process.exit inside try).
- SENSE BAR (blocks DIAG-GO): the full tick traces for the three
  judged chains read end to end, plus the full traces of at least 3
  non-vanishing wild wave-4 instances (beasts that do NOT vanish:
  SURVIVED-TO-END or removed by a non-lostSight event), judged for
  meaning/coherence (does lostSight reset when the beast sees a
  target? does it climb only while unseen on the scholar tile? does
  the census value agree with the turn events?). Node-sim stubs
  Game.say to no-op, so evidence is structured trace; the evidence
  file says so.
- FIXTURE BAR (blocks judging): scripts/test-stalkertick-a.js must
  prove, before the corpus is judged, on synthetic traces: instance
  trace building (first/last seen, firstAbsentDay, censored fate),
  removal classification (LOSTSIGHT-REMOVE at lostSight 7 in
  monsterTurn; OTHER-REMOVE for lifts and non-turn removals;
  NO-REMOVAL-EVENT for census gaps), tick-path completeness rules
  (null lostSight → PARTIAL), judged-chain instance matching by
  (id, hp) trajectory, and the non-vanishing comparison set
  selection.

## Verdict rule

- DIAG-GO iff COMPLETENESS PASS + SUBSTRATE PASS + TRACE COVERAGE
  PASS + DETERMINISM PASS + SENSE PASS + FIXTURE PASS + a RANKED
  NEXT named with numbers.
- A completeness/substrate/coverage/determinism/sense/fixture
  failure is DIAG-NO-GO.
- INSUFFICIENT-DATA (reported, never silently widened): if
  lostSight is not observable from the sweep harness (field absent
  on all census snapshots, or the monsterTurn wrap records nothing),
  the verdict is INSUFFICIENT-DATA with the missing instrument
  named — ticks are never inferred from absence, never fabricated.
  If the band yields ZERO wild wave-4 instances, the arm reports
  INSUFFICIENT-DATA with the counts and states the widen-or-close
  choice for the coordinator — seeds are NOT widened silently
  mid-run.
- A miss is NO-GO, never re-scored against a friendlier metric
  mid-run; metric doubts go under "metric review" for the NEXT run.
  Every evidence file carries a "metric review" section.
- NO lever verdict: this arm does not propose a tick-threshold move,
  gate move, or any game change. Its verdict is about the
  measurement (tick paths traced, removal classes split), not about
  building to a threshold.

## Method (staged, binding order)

1. This prereg, committed BEFORE any judged analysis.
2. Instruments (recorder + sweep copy + analyzer + fixtures),
   committed before the judged sweep is analyzed (fixture bar green
   first).
3. PILOT GATE: recorder fixtures green + 1-seed pilot (seed 75102,
   which hosts two judged chains) + substrate byte-identity for
   that seed vs the chainclose corpus + determinism re-run for that
   seed — BEFORE the full 16-seed sweep. Kill fast if lostSight is
   not observable (verdict INSUFFICIENT-DATA, pilot evidence only).
4. Full sweep (16 seeds), determinism gate (one seed, scratch dir,
   removed after diff), sense traces read per the bar above.
5. Evidence evidence/2026-10-30/sim-stalkertick-a.md with
   header-vs-result, per-judged-chain day-by-day tick paths,
   band tick census (instances, turn-event counts, max-lostSight
   distribution, removal classes), non-vanishing comparison traces,
   wall numbers (report-only, same upper-middle median convention
   as chainclose), sense notes, ranked next, and
   findings-backlog items found (reported to the coordinator, NOT
   appended to sim-findings.md by this worker).
6. No src/js change, no push, no bump, no live verification. Report
   'branch ready for coordinator merge, pending ship' (coordinator
   merges via --ff-only; sibling loop B may move master under this
   branch — rebase cleanly at the end and re-run the proof; rebase
   conflict = FAIL LOUDLY, no force, no merge).

## Node harness

Eval the FULL src/js/*.js list in index.html order (minus DOM-only
app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js) via the shared
sim-harness (loadGame seeds Math.random BEFORE eval). Never stub
Game.save. Never run concurrent jest; use
--cacheDirectory=/tmp/jest-cache-sim-stalkertick-a (no jest is run by
this arm — the sweep/analyzer are plain node scripts).
