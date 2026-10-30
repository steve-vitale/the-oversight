# sim-sicktele-b — PREREGISTRATION (committed BEFORE any judged sweep)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T1332Z, arm sim-sicktele-b.
Parent: loop-B arm sim-starveplenty-b (run fleshout-loop-b-20261030T1030Z),
evidence/2026-10-30/sim-starveplenty-b.md observation 1 + sim-findings #1514 (open).
Related, NOT re-litigated: sim-sicktick-b (landed bab13342b) — the sickness
tick step-up is illness replacement; the hurt label 'sickness' collapses
distinct illnesses. This arm's question is strictly: do tele death lists
undercount deaths vs living-count deltas, and by what mechanism?

Base pin (HEAD at prereg time): recorded in the evidence file at run end
(`git rev-parse HEAD` in the worktree at prereg commit time).
Branch: sim-sicktele-b (worktree ~/workspace/worktrees/sim-sicktele-b).
Policy: competent (scripts/policies/competent.js), same as the parent arms.
Horizon: 180d death-aware (run ends early on village-lost / over; dead
villages stop simulating, +10d tail max is not needed — the harness ends
the run at village-lost). Never a fixed 200d.

## Question, restated with the recorder flaw in view

The parent observation, as written, conflates three different signals:
(a) a sickness hurt row for elif_demir on seed 9983 day 32 with the
    sicktick recorder's `died` flag true;
(b) a living-count drop 8 -> 7 between the day-31 and day-32 villageEats
    entry snapshots, with elif absent from the day-32 roster;
(c) no death tele for elif in either instrument's death list (14 each).

BUT the sicktick recorder's `died` flag is `!!vpOf(vid).dead`, and vpOf
reads the shared person record — a flag set by 'killed'/'ambushed'
removals (src/js/betrayal.js removeVillager) and by lethal hurtVillager,
not by health reaching 0 in that hit. Elif's day-32 sickness hit was
health 52 -> 49 (sicktick trace, idx 71) — NOT lethal on its face. And
the sickness tick itself treats "already dead OR no longer on the roster"
as one silent-cleanup condition (src/js/game.js villageSicknessTick:
`_wasDead = vpOf.dead || !roster.includes(vid)`; if true, delete the
sick record and say nothing). So the parent's "death-tele gap" may be
one of: (i) a real death whose tele never fired, (ii) a non-death
roster exit (fled/exiled/splinter) misread as a death because the
living count dropped and the stale sick record was ticked, or
(iii) a killed-removal that set the dead flag without a registerDeath
call. This arm separates those three BEFORE counting anything.

## Instrument (zero src/js; recorder/analyzer only)

scripts/trace-sicktele-b.js — record-only wrappers, no RNG rolls, no
state initialization, no healing, no damage changes:
- Game.tele wrapper: captures every 'death' tele as fired (day, kind,
  who, cause, player) — the same live capture the harness already does,
  recorded here so the trace is self-contained.
- Game.registerDeath wrapper: captures every registerDeath call
  (day, kind, villagerId/monsterId, cause, caller-stack first named
  frame) — distinguishes "tele never fired" from "registerDeath never
  called" (tele fires inside registerDeath, corpses.js).
- Game.removeVillager wrapper: captures every removal (day, vid, how,
  caller-stack first named frame) — the roster-exit mechanism.
- Game.hurtVillager wrapper: captures damage/cause/caller plus THREE
  separate post-hit death signals, never collapsed into one flag:
  healthAfter (v.health map), getPerson(vid).dead, vpOf(vid).dead, and
  roster membership. This is the fix for the sicktick recorder's
  conflation: a hit is lethal only if healthAfter == 0 AND a death
  pipeline ran; vpOf.dead alone is a removal mark, not a death.
- Daily snapshots at villageEats entry: roster (ids), living count
  under THREE definitions (roster length; vpOf-dead-filtered, i.e. the
  starveplenty definition; getPerson-dead-filtered), v.fallen ids,
  v.exiles ids, corpse ids for persons. A roster exit is: present at
  entry day D, absent at entry day D+1 (or at end-of-run if the run
  ends between entries).
- Game.say wrapper: captures lines matching succumb|on the mend|fled|
  walked out|exiled|cast out|left the village (day, line) for the
  sense read around any gap event.

scripts/analyze-sicktele-b.js — classifies, per seed, every roster
exit into exactly one bucket:
  TELE-DEATH: a tele death for the same vid on the exit day (or, if
    the exit is dated to the interval, the day the removal fired).
  REGISTER-NO-TELE: registerDeath fired for the vid, no tele fired
    (would mean the tele inside registerDeath was skipped/guarded).
  REMOVAL-NO-REGISTER: removeVillager fired with how='killed' or
    'ambushed' (dead flag set) but no registerDeath for the vid.
  NON-DEATH-EXIT: removeVillager fired with how in
    fled/exiled/splinter/left (or no dead flag, no fallen entry,
    present in v.exiles) — a living departure, NOT a death.
  UNEXPLAINED-DELTA: roster exit with no removeVillager record, no
    registerDeath, no tele — a genuine delta with no named cause.
  STILL-COUNTED: not an exit at all (person still on roster at the
    next snapshot) — used only to catch snapshot artefacts.
A "delta-death" is a roster exit in TELE-DEATH, REGISTER-NO-TELE,
REMOVAL-NO-REGISTER, or UNEXPLAINED-DELTA where the person is dead by
end of run (getPerson.dead or a fallen entry) — OR where a lethal
hurtVillager hit (healthAfter 0) fired with no tele. NON-DEATH-EXIT
is never a delta-death, however the living count moves.

## Primary metric (pre-registered, binds the run)

Per seed, over the full run: D = number of delta-deaths (as defined
above); T = number of delta-deaths with a matching tele death.
Gap rate = (D - T) / D, reported only when D >= 1; seeds with D = 0
contribute "no delta-deaths" and are excluded from the rate, not
counted as 0% gaps.
Classification coverage = (exits placed in a named bucket) / (all
roster exits). Every exit must land in a bucket; an exit that cannot
be bucketed is reported as UNEXPLAINED-DELTA, never dropped.

## GO / DIAG-GO bar (DIAG arm — judge against this header, never re-score)

DIAG-GO requires ALL of:
(a) Seed 9983 reproduces under the new instrument with the SAME
    trajectory as the parent traces (39 days, village-lost, the same
    14 tele deaths) — fidelity gate; if the trajectory diverges, the
    instrument perturbed the run and the arm is NO-GO until fixed.
(b) The elif_demir day-32 event is classified into exactly one bucket
    above with the firing wrapper record quoted (which wrapper, which
    how/cause, which day) — i.e. the mechanism is NAMED, not counted.
(c) Classification coverage >= 90% across the judged band (pilot +
    confirm, pooled): at least 90% of roster exits land in a named
    bucket (TELE-DEATH / REGISTER-NO-TELE / REMOVAL-NO-REGISTER /
    NON-DEATH-EXIT); UNEXPLAINED-DELTA is the only un-named bucket.
(d) The elif-class gap (a delta-death with no tele, i.e. buckets
    REGISTER-NO-TELE, REMOVAL-NO-REGISTER, or UNEXPLAINED-DELTA with
    a dead person) is reproduced OR refuted on >= 1 fresh seed:
    reproduced = at least one fresh-seed delta-death with no tele and
    a named mechanism; refuted = every fresh-seed delta-death has a
    tele AND the 9983 elif event classifies as NON-DEATH-EXIT (the
    parent observation was a departure misread as a death, in which
    case the tele list undercounts nothing and the finding is
    reclassified, not left open).
A miss on any clause is DIAG-NO-GO. No re-scoring against a friendlier
metric mid-run; metric doubts go under "metric review" in the
evidence file and apply to the NEXT run only.

## Legs

1. REPRODUCTION: seed 9983, competent, 180d death-aware. Fidelity
   gate (a) + elif classification (b).
2. PILOT: 8 fresh seeds (10201-10208), competent, 180d death-aware,
   BEFORE any confirm spend. Pilot is judged on coverage + whether
   any elif-class gap appears at all; it is not a confirm.
3. CONFIRM (only if pilot shows >= 1 elif-class gap OR coverage <
   90% needing a bigger denominator — otherwise the pilot band IS
   the judged band and no confirm is spent): 12-16 fresh seeds
   (10211-10226 range), same policy/horizon. If the pilot already
   settles (d) cleanly either way with coverage >= 90%, no confirm.
   This is a DIAG arm: no game-code change is judged here. An
   instrument fix that makes teles complete is in scope ONLY if it
   is reporting-only and pre-registered here: it is NOT
   pre-registered — no instrument fix lands from this arm without a
   separate pre-registered follow-up. Any fix found is documented
   as a proposal, not landed, unless the gap is a pure recorder
   bug in scripts/ (not src/js), in which case a scripts-only fix
   may land as its own commit.

## Sense test (SENSE-TESTING LAW)

Read the say lines + the removal/tele records around every gap
event. A death with no tele should still read as a death in the
village's story (corpse, grief line, fallen entry, gossip) or it did
not happen as a death at all. Report, per gap event, whether the
village itself registered the loss (corpse/fallen/grief) or whether
only an instrument's counter moved. A gap where the village never
registered anything is a departure or a phantom, not a missing tele.

## Canon

docs/CANON.md read first; docs/DISEASES.md for sickness systems
(two pools, never mix; villageSicknessTick is the only 'sickness'
hurt caller). No canon doc covers tele/death-registration plumbing;
that absence is stated here, not filled by invention. The mechanism
answer comes from the wrapper records + the code paths they name.

## Out of scope (do not touch)

gearUp, vest, courtship, warmth code. No src/js changes in this arm
unless clause (3) above is triggered by a scripts-only recorder bug.
No pushes, no version bumps, no live verification — coordinator
merges; this arm reports 'committed on branch sim-sicktele-b,
pending coordinator merge'.

## Metric review (placeholder — filled at run end, §14)

Filled in the evidence file at run end. No revisions apply to this
run's numbers.
