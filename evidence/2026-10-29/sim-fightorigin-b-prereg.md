# sim-fightorigin-b — PRE-REGISTRATION (committed BEFORE any judged run)

Run: oversight-flesh-out-loop-b, arm sim-fightorigin-b
(run fleshout-loop-b-20261029T1630Z, axis food-economy).
MEASUREMENT ONLY: zero game-code change, zero policy change,
zero default flips. The only new files are the recorder driver,
the analyzer, the proof test, this prereg, and the evidence file
+ corpora. This arm claims findings-backlog item #1373 (it does
not edit the backlog file itself — the coordinator marks it).

## The open item being traced

sim-morningpersist-b (2026-10-28) traced the morning-after mover
3/3 — flee-by-door in a morning fight drive — but explicitly did
NOT trace the fight's origin: which monster, and how it reached
the hall at dawn. Its tracer logged verbs/positions, not tbfight
fighters or pendingEncounter provenance. The 3 misses, band
10710–10725, 30 loop-days, substrate COMPETENT_FEAST=0
SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1, POLICY=insideevening:
seed 10712 morning 21, seed 10720 morning 18, seed 10722
morning 30. For 10712/10720 the fight became live between
post-upkeep-1 and the fight drive; for 10722 the encounter was
already pending at post-sleep. This arm records, at every
fight-drive entry in the harness loop, the fighters and the
pending-encounter provenance, so each miss fight gets a named
arrival story.

## Instrument

Driver: scripts/fightorigin-trace-b.js — the morningpersist
driver's day loop, substrate, grant fixture and tap code
unchanged, PLUS read-only fight-origin layers that must not
move game state (pure reads; no RNG consumption; every wrapped
verb / startCombat call invokes the original exactly once):

- startCombat wrapper: before the call, pendingEncounter +
  pendingMonsterId + pendingInTent; after, the live tbfight's
  fighters snapshot (per fighter: key, kind, monsterId where
  present, display name, wave from the data.monsters lookup by
  monsterId, hp/maxHp, speed, mx/my, veteran + veteranVariant
  where present; villager fighters carry key + villagerId +
  name + hp) + fight over flag + phase + slot + say lines
  since the previous record + caller-stack function names
  (sanitized: function names only, no paths). Creations are
  numbered by creation ordinal per instance (1st, 2nd, …) —
  the raw tbfight.id is NOT stored, because it embeds
  Date.now()/Math.random and would break byte-determinism
  comparisons; the ordinal is the link key.
- policy.fight wrapper (first call per drive epoch): a
  fight-drive entry record — creation ordinal of the live
  fight, fighters snapshot at entry, pendingEncounter +
  pendingMonsterId at entry, phase + slot, inCombat flag.
  Drive epochs increment at every slot transition (sleep end,
  upkeep start, wait start/end, contest choice, startCombat,
  daily start), so repeated policy.fight calls inside one
  driveFights loop collapse to exactly one entry, while the
  pending-resolution driveFights inside driveContests (after
  contestChoose / startCombat) is a separate entry. A
  driveFights call with no live fight makes no policy.fight
  call and is not an entry — the denominator is live-fight
  drives only, stated here, not adjusted later.
- Slot vocabulary (fixed here): post-sleep-contest-drive
  (the driveContests after Game.sleep, before upkeep-1),
  upkeep-N-post-upkeep-drive, wait-N-post-wait-drive,
  contest-drive (driveContests slots inside a cycle),
  daily (fights driven during competent.daily / the evening
  step), other-harness. The slot is tracked by wrappers on
  sleep / upkeep / doAction('wait') / contestChoose /
  startCombat / daily, mirroring the morningpersist phase
  tracking; the morning interval itself is unchanged
  (evening snapshot post-daily pre-sleep → morning snapshot
  at the next loop-day's daily wrapper, pre-daily).
- Recorder switch: FIGHTORIGIN=0 disables ONLY the
  fight-origin layers (startCombat wrapper, drive-entry
  recording); the morningpersist layers stay identical, so
  an OFF run is the neutrality control on the same band.

Analyzer: scripts/analyze-fightorigin-b.js. Proof:
scripts/test-fightorigin-b.js.

Provenance classification (closed taxonomy, fixed here —
no new class may be invented mid-run; a record matching
none of these is UNCLASSIFIED and breaks GO):
- pending-resolved: pendingEncounter was true before the
  linked creation (startCombat consumed the pending slot),
  OR pendingEncounter was true at the post-sleep checkpoint
  and the creation happened in the post-sleep-contest-drive
  slot.
- direct-live: pendingEncounter was false before the
  linked creation AND the fight was already live at the
  drive entry (created in an earlier slot than the drive).
- same-slot-live: pendingEncounter was false before the
  linked creation AND the creation happened in the same
  slot as the drive entry (e.g. a wait encounter roll that
  starts a fight the immediately following drive then
  drives). The creation's caller-stack names are recorded
  alongside so the story can say which slot created it.
A record is FULL iff it carries (a) fighter identities at
creation AND at drive entry (at least the player fighter
plus every monster fighter, each with monsterId + wave +
hp), (b) the provenance class above, (c) the slot, and
(d) pendingEncounter + pendingMonsterId before creation
and at drive entry. Missing any of (a)–(d) = UNCLASSIFIED.

## Bands, staging, base-movement branch (all fixed up front)

- Reused band: the morningpersist confirm band, seeds
  10710–10725 (16 seeds), 30 loop-days, same substrate
  (gates FATAL, as in the morningpersist driver).
- Pilot first: seeds 10710–10717 (8 seeds). The pilot
  judges INSTRUMENT sanity only (driver completes, corpora
  complete, recorder records entries, neutrality control
  runs). It does not judge completeness.
- BASE-MOVEMENT BRANCH (stated here, never decided
  mid-run): first re-run the morningpersist band to
  reproduce the misses on current master.
  - If >= 1 miss reproduces on the full band, the JUDGED
    TARGET SET is all fight-drive entries in the reproduced
    miss intervals (morning intervals whose morning snapshot
    reads outside after an inside evening), and the GO bar
    below is judged on that set. The flee fight (the drive
    containing the exitBuilding(true) flee) is reported as
    a subset and must itself be 100% — both the set and the
    subset must pass.
  - If NO miss reproduces on the full band, the JUDGED
    TARGET SET is all morning fight-drive entries on the
    PILOT band (fight-drive entries in morning intervals
    on seeds 10710–10717), the recorder verdict is judged
    on that set, and the misses are reported as
    NON-REPRODUCING on current master as a separate
    finding. The recorder verdict and the reproduction
    verdict are reported separately; neither is re-scored
    against the other.
- Confirm: the full 16 seeds 10710–10725, run after the
  pilot shows the recorder working (entries recorded, no
  crash, corpora complete).
- Corpora: evidence/2026-10-29/sim-fightorigin-b-corpus/
  (pilot files are the first 8 of the confirm corpus;
  the confirm run is the judged run). Neutrality OFF
  corpus: evidence/2026-10-29/sim-fightorigin-b-corpus-off/
  (same band, FIGHTORIGIN=0). Determinism re-run corpus:
  evidence/2026-10-29/sim-fightorigin-b-corpus-rerun/
  (seed 10712 only, recorder ON).

## Primary metric and GO threshold (judged ONLY against this)

- Primary metric: FIGHT-ORIGIN COMPLETENESS = (fight-drive
  entries in the judged target set with a FULL origin
  record) / (all fight-drive entries in the judged target
  set).
- GO: completeness = 100% on the judged target set, AND
  zero UNCLASSIFIED entries, AND the neutrality proof
  passes (below), AND the determinism proof passes
  (below). The GO bar from backlog #1373 is 100%
  completeness on the fights behind the morningpersist
  misses; under the no-reproduction branch that bar is
  judged on the pilot-band morning entries instead, and
  the non-reproduction is reported separately — it does
  not convert a recorder GO into a miss-mechanism claim.
- NO-GO: any entry in the target set is UNCLASSIFIED
  (missing fighters, missing provenance class, missing
  slot, or no linked creation record). An unclassified
  entry is a failed instrument, never papered over with
  a guessed class.
- KILLED at pilot: recorder crashes, corpora incomplete,
  zero fight-drive entries recorded on a band that the
  morningpersist corpus shows has morning fights, or the
  neutrality control diverges (recorder perturbs
  trajectories) — stop, diagnose, do not spend confirm
  seeds.

## Secondary observations (reported, never judged)

- Miss rate on the judged band vs morningpersist (3/411)
  on identical / labelled bands; miss-set reproduction
  detail (seed + morning per miss, or non-reproduction).
- Sense-test: for each traced miss fight, a plain-words
  story of how the monster reached the hall at dawn, and
  whether that story is coherent; at least one trace
  quoted end to end in the evidence file.
- Wall numbers for the judged corpora (national / table /
  wins, wave 4–5 reach, median survival) — expected NOT
  OBSERVABLE inside 30-day instances; reported as NOT
  OBSERVABLE where the horizon cannot show them, never
  as movement.
- Village assessment in plain words (what the village
  looked like, who thrived/died and why, what knowledge
  was missing, which blank was filled or documented).

## Guards

- G1 (neutrality, mandatory): recorder OFF vs ON corpora
  on the same band must be deep-equal on every field
  except the fight-origin records themselves
  (fightOrigins / fightDrives arrays): report the exact
  count (e.g. 16/16 seeds identical on compared fields).
  Any perturbation kills the instrument, not the verdict.
- G2 (determinism): one re-run seed (10712, recorder ON)
  must be byte-identical to its confirm corpus file. A
  mismatch is investigated before judging; timestamp-only
  id fields are already excluded by design (creation
  ordinals, not raw tbfight.ids), so a mismatch is a real
  divergence, not a known artifact — if investigation
  shows a field that is timestamp noise despite that
  design, it is named in metric review and the comparison
  is re-run with that field named and normalized, never
  silently dropped.
- G3: median days alive on the judged band >= 24 (0.8x
  the morningpersist 30). A recorder that kills villages
  is a broken instrument.
- G4: no src/js file modified in this arm's commits
  (additions under scripts/ + evidence/ only). Violation
  = stop and report.

## Metric review (mandatory section in the evidence file)

Every evidence file carries a metric review: whether the
prereg metric proved right, what diverged (miss set vs
morningpersist, neutrality/determinism detail, branch
taken), and any revision proposed for the NEXT run —
never a mid-run re-score.
