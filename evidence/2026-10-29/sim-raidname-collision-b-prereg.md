# sim-raidname-collision-b — PRE-REGISTRATION (committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-raidname-collision-b.
Claims findings-backlog item #1451 residual (2) ONLY (the
coordinator marks it — this arm does not edit the backlog
file). Residual (1) (aftermath guard) is REMOVED and settled
by sim-raidguard-b — do NOT re-add it, do NOT re-litigate it.
Residual (3) (browser ordering) is NOT chased — it needs
Steve's phone, [needs-eyes] stays on the raidname wording
commit. No src/js change is pre-registered: this arm is
DIAG ONLY. A fix, if the diagnosis warrants one, is a
documented recommendation for a later arm, never a
mid-run code change.

## Canon status (stated, not invented)

READ docs/CANON.md first: no canon doc covers raids or
palisade sleep (same finding as sim-raidname-b and
sim-raidguard-b). The raid rule lives only in a
havenGrowth.js header comment (reactive raids: 3+
world monsters, 3k+ pantry kcal, 7-day cooldown, 18%
roll; wealth draws teeth; without a palisade one
raider can reach the sleeping player via
pendingEncounter; with a palisade the watch holds
the wall). This arm invents no canon: it measures
whether an existing narration line can misattribute
a fight's origin; it changes no mechanism, balance,
or policy value.

## Background (read first)

evidence/2026-10-29/sim-raidname-b.md +
sim-raidname-b-prereg.md and sim-raidguard-b.md +
sim-raidguard-b-prereg.md. The raidname wording arm
landed (narration-only) a raid line at startCombat
via a UNION of two provenances:

  (a) PENDING SHADOW — havenGrowth.js havenRaidTick
      sets Game.raidPendingMonsterId = m.id alongside
      pendingMonsterId for the player-target raider
      (live[0]); game.js startCombat names the fight
      when mid === raidPendingMonsterId, and consumes
      the shadow on match. Cleared on every non-raid
      pending overwrite (wanderer, tent breach x4,
      feast draw — 6 sites).
  (b) ENTITY FLAG — a drafted raider entity carries
      raidBorn = true; startCombat names the fight
      when the player-tile monster (_origin) carries
      raidBorn AND _originIsFighter holds.

The residual caveat (raidname evidence, "Residual
risks (1)"): path (b) is species-blind by
construction for pending-resolved fights — pending
fights are INSTANTIATED BY SPECIES ID (startCombat
builds fighters from the monster def), not lifted
from the world entity — so a non-raid monster of
the same species as a raidBorn lingerer stacked on
the same tile could inherit the line. The caveat as
stated names path (b); this arm measures BOTH
paths, because the code audit for this prereg
found a second, symmetric channel on path (a)
(see "Code audit" below). Neither channel fired on
the raidname band (DBG-verified) — the question is
whether either ever fires, and how often.

## Code audit (fixed here, before any judged leg)

All line references are this worktree's code at arm
start (line numbers drift; function/file names are
the stable anchors). This audit states hypotheses
to be measured, not verdicts.

SHADOW WRITE SITES (Game.raidPendingMonsterId):
  SET: havenGrowth.js havenRaidTick only (raid).
  CONSUME: game.js startCombat, ONLY on pending
      match (mid === shadow). On mismatch the shadow
      is KEPT by design (raidname T1b proved: kept
      on mismatch).
  CLEAR ON OVERWRITE: game.js wanderer pending (1),
      wandererTentBreach (4 branches), feastBuff.js
      feast draw (1) — 6 sites. Each overwrites
      pendingMonsterId with a non-raid id AND clears
      the shadow. So a non-raid pending OVERWRITE
      cannot stale-match path (a): the overwrite
      itself clears the shadow. Any (a) misfire must
      come from a keeps-shadow route, not an
      overwrite.
  KEEPS-SHADOW PENDING CLEARS (pending cleared
      WITHOUT clearing the shadow):
      - game.js startCombat itself: clears
        pendingEncounter/pendingMonsterId/
        pendingInTent for EVERY fight. On a
        non-matching fight (tile fight, contest
        fight, or any fight while a raid pending is
        outstanding) the raid pending dies but the
        shadow SURVIVES. A later same-species
        non-raid fight then matches (a) falsely.
        This is ORPHAN ROUTE A1 (mismatch fight
        while shadow live).
      - betrayal.js exile path: clears pending
        fields, not the shadow. ORPHAN ROUTE A2
        (exile while raid pending live).
      - ledger.js succession path: clears pending
        fields (all pendings, and the feast-matched
        pending), not the shadow. ORPHAN ROUTE A3
        (death/succession while raid pending live).
      - feastBuff.js feast expiry / drive-off:
        clears a feast-matched pending, not the
        shadow. Reachability for a RAID shadow is
        doubtful (a feast draw cannot be set while
        a pending is live — "already pending" —
        and a raid never overwrites a live pending
        — NO SILENT CLOBBER — so a raid shadow and
        a feast pending cannot coexist), recorded
        here so the analyzer does not mistake a
        feast clear for a raid orphan.
      - encounters.js person-fight path: clears
        pendingEncounter only. A person fight while
        a raid pending is live would orphan the
        shadow the same way as A1.
      - game.js load-validation: clears a phantom
        pending (no monster def). The shadow is not
        persisted in saves (no raidPendingMonsterId
        in the save snapshot/restore), so a loaded
        game starts shadow-free; this route cannot
        orphan a live shadow in a running instance.
  NO-SILENT-CLOBBER BOUND: havenRaidTick sets the
      shadow ONLY when no pending is live (else
      raiders become lingerers only). So at most one
      shadow is ever live, it is always raid-set,
      and it is never stacked over another pending.
      Two DISTINCT pendings therefore cannot
      coexist; the collision is SEQUENTIAL: a raid
      pending (species X) whose shadow/lingerers
      outlive the pending itself, followed by a
      non-raid fight of species X whose naming
      decision reads the leftover provenance.

ENTITY-FLAG (b) SPECIES-BLINDNESS (code fact):
  _originIsFighter = fighters' species ids contain
      _origin.id OR _origin.id === mdef.id. World
      monster entity ids ARE species ids
      (spawnWorldMonster: id = mdef.id), so the two
      disjuncts are both species comparisons: (b)
      cannot distinguish the tile entity from any
      other individual of the same species. For a
      DIRECT tile fight this is correct (the fought
      monster IS the tile entity in fiction, lifted
      by removeWorldMonster). For a PENDING-RESOLVED
      fight it is not: the fought monster is a fresh
      instantiation from the def, and the tile
      entity is a different individual that merely
      shares the species. So (b) misfires exactly
      when: a raidBorn lingerer of species X sits on
      the player's tile at the moment a non-raid
      pending fight of species X resolves (or a
      contest fight of species X starts). This is
      COLLISION-B. Note the raidname G2 rule
      (monsterTurn tile fights as legitimate
      follow-ups) is the direct-tile case, not this
      case — this arm does not re-litigate G2.

## Instrument (new recorder layers, measurement-only)

Driver: scripts/fightorigin-trace-b.js, UNCHANGED
in default behavior. New layers activate ONLY with
COLLISION_TRACE=1 and are pure reads around the
original calls (same pattern as the existing
pending interceptors, already proven neutral by
the raidname/raidguard arms):

  1. SHADOW LOG: an accessor intercept on
     Game.raidPendingMonsterId (value-preserving
     getter/setter, same pattern as the pending
     interceptors) logging every transition with
     old/new value, loopDay, phase, slot, foSeq,
     stackFrames, stackLines. If installation
     fails, the run stops and reports — no fallback
     instrument is improvised mid-run.
  2. STARTCOMBAT ENTRY SNAPSHOT (in the existing
     wrapper, COLLISION_TRACE only): shadowAtEntry
     (Game.raidPendingMonsterId before the call),
     originAtEntry (the player-tile world monster
     read DIRECTLY as worldMonsters().find(tx ==
     map.px, ty == map.py) — the same value
     playerMonster() returns in sims, without the
     debug-adoption write branch: fields id,
     raidBorn, lingering, hp, tx, ty, or null),
     and after the call: fightSpecies (monster
     fighters' species ids), raidLineFired (creation
     sayTail contains "This one came with the raid
     on Haven"), pendingMatch (shadowAtEntry &&
     shadowAtEntry === fightSpecies),
     entityMatchCandidate (originAtEntry &&
     originAtEntry.raidBorn && originAtEntry.id ===
     fightSpecies).
  All pre-existing corpus fields are recorded
  identically with the flag off or on; the new
  fields are the ONLY additions. The game is never
  written by the instrument: the wrapper calls the
  original exactly once, the interceptors store
  exactly the assigned values, originAtEntry is a
  find() over an existing array.

Analyzer: new scripts/analyze-collision-b.js over a
COLLISION_TRACE corpus. Proof: new
scripts/test-raidname-collision-b.js (fixtures +
corpus legs, below).

## Classification (fixed here — the judge's definitions)

For EVERY fight creation in the corpus, the analyzer
records:

  PROVENANCE (exactly one):
    - raid-pending: pending-resolved (below) AND
      the resolved pending's setter kind is raid.
    - nonraid-pending: pending-resolved AND the
      resolved pending's setter kind is a known
      non-raid kind (wanderer / tent-breach /
      feast-draw).
    - tile: NOT pending-resolved, stackLines do not
      name contest paths, and the creation has an
      explicit monsterId arg (direct startCombat
      call — monsterTurn tile fights and direct
      encounters).
    - contest: stackLines name contestChoose /
      contestEngine paths, without a pending
      set+clear pair for the fight species.
    - unknown: none of the above. Unknown is
      reported, NEVER counted as raid or non-raid.
  PENDING-RESOLVED: creation stackLines name
      driveContestsImpl AND the pendingLog shows a
      set entry for the fight species since the
      previous creation (foSeq between prev
      creation foSeq and this creation foSeq)
      followed by a clear before this creation.
      (The harness pending block clears pending
      fields then calls startCombat(mid); the
      creation wrapper therefore sees pending
      already cleared — the pendingLog pair, not
      the wrapper's pendingBefore, is the detector,
      exactly as in fightorigin/raidname.)
  RESOLVED-PENDING SETTER KIND: from the LAST set
      entry for the fight species since the previous
      creation: raid if any of its stackFrames /
      stackLines match havenRaidTick; feast if its
      stackLines name feastBuff.js; wanderer /
      tent-breach if its stackLines name wanderer
      paths in game.js (wandererFindsYou /
      wandererTentBreach). Any other last-setter is
      unknown (provenance unknown, never raid).
  ORIGIN CLASSES (from originAtEntry):
    - raidBorn-same: originAtEntry.raidBorn true
      and originAtEntry.id === fightSpecies.
    - raidBorn-other / nonraid / none: as named.

COLLISION-A (pending-shadow misfire): raidLineFired
  AND pendingMatch AND NOT (provenance is
  raid-pending) AND NOT (origin class is
  raidBorn-same). Rationale: the correct (a) case
  is a raid pending resolving; a tile fight against
  a raidBorn same-species entity is substantively
  raid-born even if (a) also fires, so it is
  excluded (it is counted under same-raid, below).
  A tile/contest fight with a non-raid (or no)
  tile entity, or a non-raid pending resolving
  while an orphan shadow is live, IS a misfire:
  the line attributes to the raid a fight whose
  provenance is not the raid.
COLLISION-B (entity-flag species misfire):
  raidLineFired AND NOT pendingMatch AND
  entityMatchCandidate AND provenance is
  nonraid-pending or contest. Rationale: (b) alone
  fired on a fight that was instantiated, not
  lifted — the tile entity is a different
  individual sharing the species. Direct tile
  fights are excluded by the provenance condition
  (for them (b) is correct); raid-pending fights
  are excluded (same raid in substance).
SAME-RAID (reported, NOT a collision): raidLineFired
  AND (provenance is raid-pending, OR origin class
  is raidBorn-same with provenance tile, OR a
  raid-pending fight's follow-up lingerer meeting).
  These are the raidname G1/G2-correct cases.
UNCLASSIFIED-LINE: raidLineFired with provenance
  unknown. Reported with count and seed/ordinal
  list; never counted as collision or as correct.
OPPORTUNITIES (denominators, reported never judged
  as collisions by themselves):
  - OPP-B: nonraid-pending creations with origin
    class raidBorn-same (the B-risk configuration),
    split fired / not-fired (the code path is
    deterministic given the inputs, so not-fired
    here would indicate the analyzer's origin
    model is wrong — reported as an instrument
    finding, investigated before any verdict).
  - OPP-A-WINDOW: creations with shadowAtEntry
    live and fightSpecies !== shadowAtEntry
    (a fight started while a raid shadow was live
    without matching it — the orphan window).
  - SHADOW LIFETIMES: from the shadowLog, every
    shadow's set → consume / overwrite-clear /
    still-live-at-instance-end outcome.
  - DISTINCT-PENDING PAIRS: per instance, a raid
    pending set for species X followed later by a
    non-raid pending set for species X before the
    raid shadow is consumed/cleared (the task's
    "two distinct pending fights sharing a species
    id" in sequential form). Counted regardless of
    naming outcome; each pair's second fight is
    then checked against COLLISION-A/B.

## Primary metric + DIAG thresholds (judged ONLY against this prereg)

Primary metric: corpus COLLISION count
(COLLISION-A + COLLISION-B) on the judged band,
with known provenance only (unknown-provenance
line fires never count).

  COLLISION-PROVEN: corpus COLLISION count >= 1.
      Verdict: the species-id caveat is REAL and
      measured — report the count, the path(s),
      and the seed/ordinal witnesses, plus the
      sense reading of each collision transcript.
      Fix recommendation documented (not built):
      gate (b) on provenance (pending-resolved /
      contest fights must not read the tile
      entity's flag — the tile entity is not the
      fighter there), and consume-or-clear the
      shadow on ANY startCombat pending-clear, not
      only on match (closes A1); exile/succession
      clears should clear the shadow with the
      pending (closes A2/A3). Note the (b) gate
      cannot be an entity-identity check: entity
      ids ARE species ids, so provenance, not
      identity, is the only available
      discriminator.
  MECHANISM-PROVEN / FREQUENCY-OPEN: corpus
      COLLISION count = 0 BUT a fixture proves a
      collision given its configuration (T-B1 /
      T-A1 below green) AND the band exercised the
      risk (OPP-B + OPP-A-WINDOW reported, whether
      zero or nonzero). Verdict: the caveat is a
      real mechanism with measured zero frequency
      on this band — it stays OPEN, not closed.
      Exact next measurement named (e.g. a
      targeted band seeding raidBorn lingerers +
      same-species wanderer pendings, or a longer
      band if OPP counts show the configuration is
      merely rare).
  CAVEAT-CLOSED: corpus COLLISION count = 0 AND
      the band exercised the risk (OPP-B > 0 or
      OPP-A-WINDOW > 0 with 0 fires — impossible
      for the deterministic (b) path, so in
      practice this requires a STRUCTURAL proof
      that the risk configuration cannot arise:
      e.g. a code-level proof that a raidBorn
      lingerer can never share the player tile at
      a non-raid pending resolution, or that a
      shadow can never survive to a same-species
      non-raid fight). A bare corpus zero with
      zero opportunities is NOT closure — it is
      INSUFFICIENT-DATA (below). Closure must
      state its structural reason explicitly.
  INSUFFICIENT-DATA / DIAG-OPEN: the band yields
      zero dawn-raid mornings, zero pendings, or
      the instrument fails such that no census can
      be judged; OR corpus zero with zero
      opportunities and no structural proof. Report
      the exact next measurement (wider band, or
      the targeted configuration fixture as the
      next corpus leg).

No other verdict is available: a corpus zero is
never re-scored as closure, and a fixture-only
proof is never re-scored as corpus frequency.

## Neutrality gate for the instrument (exact definition)

The instrument touches no game path (driver-side
wrappers + value-preserving interceptors only),
but neutrality is still PROVEN, not assumed:
pilot 8 seeds run OFF (COLLISION_TRACE unset) and
ON (COLLISION_TRACE=1) on identical code/seeds/
substrate/policy/days. Shared fields must be
deep-equal across all 8 files (the new collision
fields and the shadowLog are the only allowed
additions; stackLines are identical because both
legs run in this same worktree). Any shared-field
difference = instrument MOVED trajectories →
stop, diagnose, do not judge the band. Trajectory
stability vs the raidname band is also checked
(pilot move counts must match raidname's pilot
328/283/230/281/225/214/182/261 — the guard
removal was proven neutral, so a mismatch would
be new information, reported not hidden).

## Staging (MEASUREMENT.md §§9-12)

- PILOT (8 seeds, 10710–10717): OFF leg, then ON
  leg, neutrality comparison first. If neutrality
  fails, stop. Pilot ON is the first judged signal
  (collisions in the pilot count toward the band
  total; the pilot is a subset of the judged band,
  not a separate experiment).
- CONFIRM (32 seeds, 10718–10749): ON leg only.
  Judged band total = 40 seeds (10710–10749),
  wider than the raidname band's 16, 30 loop-days,
  same substrate and policy as raidname (below).
- Death-aware horizon: instances run 30 loop-days
  or to game-over, never a fixed 200d (runDays
  stops dead villages; the prior band survived to
  30 on all seeds — if this band shows deaths,
  they are reported as the horizon, not extended).
- Corpora: evidence/2026-10-29/
  sim-raidname-collision-b-corpus-off/ (pilot OFF),
  evidence/2026-10-29/
  sim-raidname-collision-b-corpus/ (40 seeds ON).
  Analyzer output: evidence/2026-10-29/
  sim-raidname-collision-b-analysis.json.

## Band / substrate / policy (fixed here)

Band: seeds 10710–10749 (40 seeds). Days: 30 loop-
days. Substrate: COMPETENT_FEAST=0 SEATDRIVE=0
PLENTYDEPRI=0 DEPOSITGATE=1. Policy: insideevening
(the fightorigin/raidname driver policy). Driver:
scripts/fightorigin-trace-b.js with
COLLISION_TRACE=1 for ON legs. No other driver,
no policy change, no substrate change. If the
driver crashes or corpora are incomplete, the run
stops and reports — no substitute instrument is
improvised mid-run.

## Fixtures (mechanism proof, scripts/test-raidname-collision-b.js)

All fixtures use the shared harness (loadGame with
seed BEFORE eval, oracleV2 runDays staging, same
pattern as test-raidname-b.js freshGame). They
prove the code paths, not corpus frequency; a
green fixture never substitutes for a corpus
collision, and a red fixture never cancels one.

  T-B1 (B mechanism): stage a raidBorn lingerer of
      species X on the player tile, set a NON-RAID
      pending for X (wanderer path: pending fields
      set directly with a wanderer provenance
      note — the fixture stages state, the
      provenance claim is the pending's non-raid
      setter, which the corpus leg classifies from
      real setter stacks), then resolve
      harness-style (clear pending fields, call
      startCombat(X)). Expect: raid line FIRES
      although the pending was non-raid and the
      fought monster is a fresh instantiation, not
      the tile entity. Controls: same staging
      without the raidBorn tile entity → no line;
      raid pending resolving → line fires (correct
      case, not a collision).
  T-A1 (A orphan chain): stage a raid shadow X
      (raidPendingMonsterId = X, pending live for
      X), then a NON-MATCHING fight (startCombat(Y),
      Y !== X) — expect pending cleared and shadow
      KEPT (the A1 orphan). Then stage a non-raid
      pending for X and resolve harness-style —
      expect: raid line FIRES although the pending
      was non-raid and the raid pending is dead.
      Control: the same chain with a matching
      first fight consumes the shadow (no orphan).
  T-ORIGIN (origin model): tile entity raidBorn X
      on the player tile + startCombat(X) direct
      (tile fight) → line fires (correct case);
      tile entity NON-raid X + startCombat(X)
      direct → no line. This validates that the
      analyzer's originAtEntry model (worldMonsters
      find on the player tile) matches the engine's
      _origin for direct fights.
  T-CORPUS (corpus legs, --corpus/--base-corpus):
      COLLISION count + OPP counts + shadow
      lifetimes from the ON corpus; neutrality
      (OFF vs ON shared fields deep-equal on the
      pilot files); sense transcripts listed.
  Exit 0 = all green (SKIPs reported, never
  converted to passes).

## Sense bar (fixed here)

Read at least one dawn-raid transcript per leg
(pilot ON, confirm) end to end, plus EVERY
collision transcript if any collision fires, and
judge meaning/coherence as a person telling what
happened: does the raid line read as true of THIS
fight's arrival, or as a label pasted from another
fight's provenance? A collision transcript that
reads smoothly is WORSE than one that reads wrong
(a silent misattribution); say so explicitly.

## Wall numbers (30-day legs)

National / table / wins: NOT OBSERVABLE inside
30-day instances — reported as not claimed, never
as zeros. Wave 4–5 reach, median survival reported
from the corpora as observed.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

No balance-panel compare .md is produced, by the
same pre-registered analogy as sim-raidname-b and
sim-raidguard-b: this leg is a diagnosis on 30-day
instances, and panel metrics (national / table /
wins, wave reach) cannot move — and cannot even be
observed — inside 30-day instances. The judged
instrument is the collision corpus on identical
seeds, and the pre-registered DIAG thresholds
above are the judge.

## Metric review (mandatory section in the evidence file)

Every evidence file carries a metric review:
whether the prereg metric proved right, what
diverged (classifier unknowns, origin-model
mismatches, neutrality detail), and any revision
proposed for the NEXT run — never a mid-run
re-score.
