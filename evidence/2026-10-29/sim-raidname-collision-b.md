# sim-raidname-collision-b — the species-id collision question (backlog #1451 residual (2))

Run: oversight-flesh-out-loop-b, arm sim-raidname-collision-b.
Claims findings-backlog item #1451 residual (2) ONLY (the
coordinator marks it — this arm does not edit the backlog
file). Residual (1) (aftermath guard) stays REMOVED per
sim-raidguard-b — not re-added, not re-litigated, and no
game.js change is made here. Residual (3) (browser ordering)
is NOT chased — it needs Steve's phone, [needs-eyes] stays
on the raidname wording commit. This arm is DIAG ONLY: zero
src/js changes, zero default flips, zero game-mechanism
changes. A fix is documented as a recommendation, never
built mid-run.

## Verdict against the pre-registered bar (judged ONLY against evidence/2026-10-29/sim-raidname-collision-b-prereg.md, committed as fb5135b29 BEFORE any judged leg, plus its amendment 1545b714f, committed BEFORE the v2 judged leg)

**MECHANISM-PROVEN / FREQUENCY-OPEN — the caveat is real, and it did not fire once on a 40-seed band.**

- Corpus COLLISION count (v2 all-fights census, prereg as
  amended): **0** — COLLISION-A 0, COLLISION-B 0, on 134
  fights (123 creations + 11 ended-inside attempts), 95
  raid lines, 0 unclassified lines, 61 dawn-raid mornings.
- Fixtures prove BOTH misfire mechanisms given their
  configurations (proof green, 33 pass, 0 fail): T-B1 — a
  non-raid pending resolving while a raidBorn lingerer of
  the same species sits on the player tile says the raid
  line, although the fought monster is a fresh
  instantiation, not the tile entity; T-A1 — a mismatch
  fight orphans the raid shadow (pending cleared, shadow
  kept), and a later non-raid pending of the same species
  then says the raid line although the raid pending is
  dead. Controls green both ways (no line without the
  raid provenance; line fires for genuine raid pendings;
  matching fights consume the shadow).
- Opportunities on the band: OPP-B 0, OPP-A-WINDOW 0,
  distinct-pending pairs 0. Shadows: 65 set, 65 consumed,
  0 overwrite-cleared, 0 live-at-end, 0 other-cleared.
  The band never produced the risky configuration at all
  — so the corpus zero is a frequency measurement (zero
  in 40 villages × 30 days), NOT a closure. Closure would
  require a structural proof that the configuration cannot
  arise, and the fixtures prove the opposite: given the
  configuration, the code misfires deterministically.
- Per the prereg ladder, that combination is
  MECHANISM-PROVEN / FREQUENCY-OPEN, not CAVEAT-CLOSED
  and not INSUFFICIENT-DATA (the band is rich: 61 dawn
  mornings, 65 shadows, 134 fights, 0 unknowns).
- Exact next measurement (named, not hand-waved): a
  TARGETED leg that stages the B1 configuration in live
  sims — a raidBorn lingerer held on the haven tile while
  a same-species non-raid (wanderer) pending resolves —
  and counts B-collisions per staged configuration. More
  blind seeds are NOT the next step: 40 blind seeds
  produced zero opportunities, so the natural rate is
  either zero or far below 1-in-40-villages, and only a
  staged configuration can measure the misfire rate
  given the configuration. A longer blind band answers a
  question the v2 band already answered (the
  configuration is rare-to-absent in insideevening play).
- Fix recommendation (documented, NOT built — a later
  arm's work): (1) gate path (b) on provenance —
  pending-resolved and contest fights must not read the
  tile entity's flag, because the tile entity is not the
  fighter there (entity-identity checks cannot do this:
  world entity ids ARE species ids, so provenance is the
  only available discriminator); (2) consume-or-clear the
  shadow on ANY startCombat pending-clear, not only on
  match (closes orphan route A1); (3) exile/succession
  pending clears should clear the shadow with the pending
  (closes A2/A3). All three are narration-honesty fixes;
  none changes spawn, damage, or economy.

## Canon status (stated, not invented)

No canon doc covers raids or palisade sleep (same
finding as sim-raidname-b and sim-raidguard-b;
docs/CANON.md read first). The raid rule lives only
in a havenGrowth.js header comment. This arm invents
no canon: it measures whether existing narration can
misattribute a fight's origin.

## Base commit (pinned) + code audit (prereg, verified against the corpus)

Worktree HEAD at arm start: 7f74e1d15 (coordinator
evidence, with the raidname wording and the raidguard
removal in history). The audit in the prereg stands
as written; the corpus confirms its load-bearing
claims and corrects one expectation:

- Shadow write sites: SET only in havenRaidTick;
  CONSUME only on pending match in startCombat;
  CLEAR on all 6 non-raid pending overwrites
  (wanderer 1, tent breach 4, feast draw 1). The
  corpus shows the overwrite-clear path never even
  needed to fire (0 overwrite-cleared): every shadow
  on the band was consumed by its own raid fight.
- Keeps-shadow pending clears (startCombat's own
  pending clear, exile, succession, feast expiry /
  drive-off, person-fight, load-validation) exist in
  code as audited, but NONE produced an orphan on
  this band: 0 shadows live at instance end, 0
  other-cleared, and OPP-A-WINDOW (a fight starting
  while a shadow is live without matching it) is 0
  for creations AND attempts in v2. The A1 orphan
  route is therefore fixture-proven but band-absent.
- Entity-flag species-blindness is a code fact, not
  a hypothesis: _originIsFighter compares species
  ids on both disjuncts, and world entity ids ARE
  species ids. The corpus shows path (b) firing 30
  times, every time on a direct tile fight against
  the raidBorn entity itself (monsterTurn tile
  fights, including 3 ended-inside attempts) — the
  correct case. The misfire needs a pending-resolved
  or contest fight with a same-species raidBorn
  tile entity, which never occurred (OPP-B 0,
  contest fights 4, none lined).

## v1 vs v2 — the instrument correction (stated, not hidden)

The v1 instrument classified ONLY fight creations.
Its numbers (40 seeds, preserved as
sim-raidname-collision-b-corpus-v1 + -analysis-v1.json):
123 creations, 86 raid lines, 0 collisions,
58 dawn-raid mornings, shadows 65 set / 65 consumed.
The v1 numbers are NOT wrong for creations — they
are incomplete for fights. Inspecting v1 shadow
lifetimes exposed the blind spot: a fight that ENDS
INSIDE startCombat (in node the opening turns run
synchronously in the same call; a monster that flees
in the opening turns leaves tbfight.over true at
return) is recorded as an ATTEMPT (hadLive=false,
liveNow=false), not a creation — yet the raid line
is said LAST in startCombat, after the fight ended,
so it appears in the attempt's sayTail. The v1 band
holds 11 such attempts, 9 carrying the raid line.
The v1 creation-only census missed 9 real fights'
naming decisions (and its 59-vs-65 pending-match
discrepancy — 59 pending-match creation lines vs 65
shadow consumes — was exactly those 6 raid-pending
attempts plus 3 tile attempts).

The amendment (committed BEFORE the v2 judged leg)
redefines a FIGHT as a creation OR an ended-inside
attempt, with the same classification rules;
refused attempts (hadLive=true) are counted
separately and never classified (startCombat returns
before the raid block there; the band holds 0
refused attempts). The JUDGED numbers are the v2
re-run (same 40 seeds, same substrate / policy /
days, fixed instrument). The v1 legs are reported
as the v1 instrument's output, not hidden and not
judged.

## v2 judged numbers (40 seeds 10710–10749, 30 loop-days, insideevening)

- Fights: 134 (123 creations + 11 ended-inside
  attempts). Raid lines: 95 (65 via path (a)
  pending-match, 30 via path (b)-only). Collisions:
  A 0, B 0, total 0. Same-raid: 95. Unclassified
  lines: 0. Refused attempts: 0, refused lines: 0.
- Provenance: raid-pending 65, tile 65, contest 4.
  All 65 raid-pending fights carry the line (correct
  (a)); all 30 (b)-only lines are direct tile fights
  against the raidBorn entity itself (correct (b));
  all 4 contest fights are unlined (correct — no
  raidBorn same-species tile entity, no shadow
  match). Dawn-raid mornings: 61.
- Shadows: 65 set, 65 consumed, 0 overwrite-cleared,
  0 live-at-end, 0 other-cleared. Every shadow on
  the band died exactly the way the design intends
  (consumed by its raid fight).
- Opportunities: OPP-B 0 (no non-raid pending ever
  resolved with a same-species raidBorn origin on
  the tile), OPP-A-WINDOW 0 (no fight ever started
  while a live shadow mismatched it), distinct
  pending pairs 0 (no raid pending for species X
  was ever followed by a non-raid pending for X
  before the shadow died).
- Why zero opportunities is itself informative: in
  insideevening play, raid pendings resolve at dawn
  in the hall, wanderer/feast pendings arise on the
  move loop and at camp, and raidBorn lingerers sit
  on the haven tile — the three populations barely
  overlap in the same naming decision. The fixture
  configurations are reachable in code but rare to
  absent in this policy's play. A different policy
  (e.g. one that lingers at Haven by day, or faces
  wanderers at the hall door) might produce them;
  the targeted leg in the verdict is the way to find
  out, not more insideevening seeds.

## Sense (transcripts read end to end — SENSE-TESTING LAW)

- Pilot dawn-raid creation, 10712 ord3 (murkcap,
  day 21): BREACH + fight intro + raid line last —
  "a raid fighter, named as such" (same shape as
  raidname post-change). PASS: a waking player
  learns the hall fight came with the raid.
- Confirm dawn-raid creation, 10726 ord2
  (bulldozer, day 10): intro, Devon strikes, then
  the raid line, then the party-naming beat. PASS:
  reads as a person telling what happened — the
  bulldozer in the hall came with the raid, not
  wandering in. Note: a raidBorn murkcap sat on
  the same tile (origin murkcap, raidBorn) while
  the bulldozer fight matched the bulldozer shadow
  — the (a) path named the right raid, and the
  bystander murkcap did not confuse it.
- Confirm ended-inside attempt, 10716 living_wire
  (day 8, monsterTurn tile fight): the wire fights,
  melts back ("It comes apart — no one in reach"),
  then the raid line as a coda. PASS with a note:
  for fled fights the line lands as an after-the-
  fact attribution ("that thing that just melted
  away came with the raid"), which is honest — the
  fight did happen, and the origin was raidBorn
  (lingering=true on the tile entity). A collision
  transcript here would read smoothly and be WORSE
  than one that reads wrong (silent misattribution);
  no collision transcript exists on this band to
  read, and the fixtures' misfire lines read exactly
  as smoothly as the correct ones — which is why
  the caveat matters even at zero frequency: when
  it fires, nothing in the text betrays it.
- No collision transcript exists to sense-judge.
  The fixture misfires (T-B1/T-A1) were judged in
  the proof run: their lines are indistinguishable
  in tone from correct lines — the misattribution
  is invisible in prose, detectable only by
  provenance. That is the precise shape of this
  caveat: not a wording bug, a provenance bug.

## Village assessment (plain words, within what 30-day instances can say)

Forty month-long villages, all surviving to day 30
(median 30, max 30) — the same insideevening shape
as raidname and raidguard: the player comes home,
sleeps in the hall, and wakes to raid-born fights
on 61 mornings out of 1,200 village-days (roughly
one dawn raid a fortnight per village, plus daytime
raider meetings). What this arm adds to that picture
is the bookkeeping underneath the sentence the
player reads: every raid sentence on the band was
earned by its own fight's provenance — 65 by the
pending shadow, 30 by the tile entity's own flag —
and no sentence was borrowed from another fight.
Blank documented, not filled: the two provenance
holes (pending-resolved fights reading a tile
entity's flag; orphan shadows surviving their
pending) are real holes with working demonstrations
and a written fix, but zero band occurrences — so
the fix waits for the targeted leg to say how often
it would actually bite, rather than landing on a
zero-frequency finding. Blank filled: the census
itself — future raid-narration arms now classify
ended-inside fights as fights (see metric review),
so the next arm will not repeat the v1 blind spot.

## Wall numbers (30-day legs)

- National / table / wins: NOT OBSERVABLE inside
  30-day instances — reported as not claimed, never
  as zeros. Scale stays 'village', standing 0 on all
  40 seeds.
- Wave reach: max wave unlocked 1 on 6 seeds, 2 on
  32 seeds, 3 on 2 seeds; wave 4–5 reach 0. Wave
  kills total 244 (wave 1: 218, wave 2: 26). Median
  survival: 30 loop-days (all 40 survived to the
  30-day cap); max 30. Recorded death events in the
  samples counter: 339 across the band (individual
  deaths, not villages lost — all 40 villages
  survived to cap).

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

No balance-panel compare .md is produced, by the
same pre-registered analogy as sim-raidname-b and
sim-raidguard-b: this leg is a diagnosis on 30-day
instances, and panel metrics (national / table /
wins, wave reach) cannot move — and cannot even be
observed — inside 30-day instances. The judged
instrument is the collision corpus on identical
seeds, and the pre-registered DIAG thresholds are
the judge.

## Metric review (MEASUREMENT.md §14)

- Judged ONLY against the prereg as amended before
  the v2 leg. No band, substrate, threshold, or
  collision definition changed mid-run. Three
  instrument corrections, all disclosed here
  (none re-scores a metric):
  1. SET-ENTRY BUG (pilot, before confirm): the
     first analyzer counted a pending CLEAR entry
     (pendingEncounter false with the id still X,
     as the harness block logs before clearing the
     id) as a SET entry, so the resolver's stack
     (driveContestsImpl) looked like the setter and
     genuine raid pendings classified as unknown —
     producing 12 phantom COLLISION-A hits on the
     pilot. Fixed by counting only genuine sets
     (monsterId transition to X, or encounter true
     with id X); the pilot then read 0 collisions,
     20/20 lines same-raid. The prereg's words
     ("a set entry for the fight species") already
     excluded clears; the code was fixed to match
     the prereg, not the other way round.
  2. ATTEMPTS-ARE-FIGHTS (v1 → v2, amended prereg
     committed before the v2 leg): see "v1 vs v2"
     above. The v1 legs are not judged; the v2
     re-run is. The same blind spot exists in the
     raidname census (creations only) — raidname's
     25/25 verdict stands for creations, and the
     attempt lines found here STRENGTHEN its
     coverage story (more raid fights carry the
     line than creations alone show), but a future
     raid-narration arm should classify attempts
     from the start.
  3. NEUTRALITY NORMALIZATIONS (proof test, not
     the metric): (a) foSeq is the SHARED fight-
     origin order counter — the ON instrument adds
     shadow transitions to that order, so ON foSeq
     values run ahead of OFF values after the first
     shadow. The neutrality comparison strips foSeq
     (recorder metadata, not trajectory content)
     and proves every other shared field deep-equal
     8/8 pilot files; the order itself is validated
     by the analyzer running self-consistently on
     the ON corpus. (b) Creation stackLines carry
     source line numbers, which shift with ANY
     driver edit (v2 amended driver moved the
     runDays call 608 → 630) — normalized in the
     comparison, same class as raidname's
     stackLines strip; file + function names (what
     provenance reads) are preserved and verified
     by path-level diff (the only v2-vs-OFF diffs
     were those two line numbers).
  4. FIXTURE CORRECTION (proof, before judging):
     the first T-B1 run failed because staging
     runDays leaves raidBorn lingerers on the haven
     tile and monsterAt() returns the FIRST tile
     monster — a bystander rut_king shadowed the
     staged bulldozer for playerMonster() (the
     raidguard fixture note, same class). Fixed by
     clearing the player tile before staging and
     asserting playerMonster() is the staged entity;
     the mechanism then proved as designed. This
     is a fixture-hygiene fix, not a game finding.
- No revision proposed for the next run's metric
  except: the targeted B1-configuration leg should
  pre-register its staging (how a raidBorn lingerer
  is held on the tile while a wanderer pending
  resolves) and its own GO bar (e.g. collisions per
  staged configuration), rather than reusing the
  blind-band thresholds; and future raid-narration
  arms should record attempts-ended-inside as fights
  from the start (see 2).
- Quick check: NOT run, deliberately. This arm
  changes no src/js file, so the repo quick suite
  (which tests game code) cannot move; the relevant
  gates are the proof test (green, below) and node
  --check on the three scripts (clean). Claiming a
  quick-check result for a scripts-only diag arm
  would be theater, and re-running 400s of suite
  for zero information is the opposite of
  throughput. The base quick-check state (284
  passed / 6 failed, identical failing set, per
  sim-raidname-b and sim-raidguard-b) is unchanged
  by anything in this arm.

## Proof

- `node scripts/test-raidname-collision-b.js --corpus
  evidence/2026-10-29/sim-raidname-collision-b-corpus
  --base-corpus
  evidence/2026-10-29/sim-raidname-collision-b-corpus-off
  --analysis
  evidence/2026-10-29/sim-raidname-collision-b-analysis.json`
  — PROOF-GREEN on the v2 corpus: T-B1 (9 pass
  incl. preconditions + controls), T-A1 orphan
  chain (10 pass incl. control), T-ORIGIN (6 pass
  incl. preconditions), T-CORPUS integrity +
  OFF/ON neutrality 8/8 + pilot move counts +
  shadow sets 65 + analyzer invariants (4 pass).
  RESULT pass=33 fail=0 skip=0. (V1 proof run:
  33 pass after the B1 tile-clearing fix and the
  foSeq/stackLines normalizations; the pre-fix
  runs failed honestly on the tile-shadow and the
  neutrality strip and are reported in metric
  review, not hidden.)
- Census: `node scripts/analyze-collision-b.js --corpus
  evidence/2026-10-29/sim-raidname-collision-b-corpus
  --out evidence/2026-10-29/sim-raidname-collision-b-analysis.json`
  (v2: 134 fights, 95 lines, collisions 0/0,
  OPP-B 0, OPP-A-WINDOW 0, pairs 0, shadows 65/65
  consumed, dawn mornings 61). V1 census preserved
  at ...-analysis-v1.json (123 creations, 86 lines,
  0 creation-collisions, 58 dawn mornings).
- `node --check` clean on scripts/fightorigin-trace-b.js,
  scripts/analyze-collision-b.js,
  scripts/test-raidname-collision-b.js.
- Neutrality: pilot OFF vs ON shared fields
  deep-equal 8/8 (foSeq + stackLines line numbers
  normalized as named above); pilot move counts
  match the raidname band exactly
  (328/283/230/281/225/214/182/261) on both legs.
- Corpora: evidence/2026-10-29/
  sim-raidname-collision-b-corpus-off/ (pilot OFF, 8
  files), sim-raidname-collision-b-corpus/ (v2, 40
  files), sim-raidname-collision-b-corpus-v1/ (v1, 40
  files, creation-only instrument). Analyzer:
  scripts/analyze-collision-b.js. Proof:
  scripts/test-raidname-collision-b.js. Driver
  extension: scripts/fightorigin-trace-b.js
  (COLLISION_TRACE=1 layers only; default behavior
  unchanged).
- No [needs-eyes]: DIAG-only, no player-facing
  text changes, no game-code change. The raidname
  wording commit's [needs-eyes] (browser ordering)
  is untouched and still stands.

## Notes (coordinator backlog — goal hidden_files NOT edited by this arm)

- [for coordinator: mark #1451 residual (2)
  MECHANISM-PROVEN / FREQUENCY-OPEN, NOT closed]
  Corpus: 0 collisions on a 40-seed all-fights
  census (134 fights, 95 lines, 0 opportunities);
  fixtures: both misfire mechanisms proven (B1
  species-misfire, A1 orphan-shadow misfire).
  Caveat stays OPEN with the exact next measurement
  (targeted B1-configuration leg) and the written
  fix recommendation (provenance-gate (b),
  consume-or-clear shadow on any startCombat
  pending-clear, exile/succession clears clear the
  shadow). Do NOT mark it closed on the corpus zero:
  the fixtures prove the configuration misfires when
  it occurs.
- [method note for future raid-narration arms]
  Classify ended-inside attempts as fights from the
  start: fights that end inside startCombat (monster
  flees in opening turns) carry their raid line in
  the attempt tail, not a creation tail. The
  raidname 25/25 stands for creations; attempts add
  9 more lined fights on this band, strengthening
  coverage rather than weakening it.
- [not chased] Residual (3) browser ordering;
  residual (1) aftermath-guard removal (settled).
- [not chased, fixture note] Bystander tile monsters
  shadow staged monsters for playerMonster() in
  fixtures (raidguard note, same class) — clear the
  player tile before staging a tile entity.

## Convergence line

raidname-collision — MECHANISM-PROVEN /
FREQUENCY-OPEN: on band 10710–10749 (40 seeds, 30d,
insideevening) the all-fights census (134 fights:
123 creations + 11 ended-inside attempts) finds 0
species-id collisions (A 0, B 0) with 95 raid lines
all same-raid (65 via pending shadow, 30 via tile
entity flag), 61 dawn-raid mornings, 65 shadows all
consumed by their own raid fights, and ZERO risk
opportunities (OPP-B 0, OPP-A-WINDOW 0, distinct
pending pairs 0) — but fixtures prove both misfire
mechanisms deterministically given their
configurations (non-raid pending + same-species
raidBorn lingerer on tile; mismatch fight orphaning
the shadow for a later same-species non-raid
fight), so the caveat stays OPEN, not closed;
proof PROOF-GREEN (33 pass, 0 fail); wall numbers
on the band: national/table/wins NOT OBSERVABLE
(30d), wave 4–5 reach 0, median survival 30.
DIAG-only, no game change; next measurement is a
targeted B1-configuration leg, not more blind
seeds.

## Verdict (judged against the pre-registered bar as amended, not re-scored): MECHANISM-PROVEN / FREQUENCY-OPEN
