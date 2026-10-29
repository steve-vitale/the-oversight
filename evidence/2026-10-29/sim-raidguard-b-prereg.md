# sim-raidguard-b — PRE-REGISTRATION (committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-raidguard-b
(run fleshout-loop-b-20261029T1930Z, axis food-economy).
Claims findings-backlog item #1451 residual (1) (the
coordinator marks it — this arm does not edit the
backlog file). SCOPE DISCIPLINE: residual (1) ONLY.
Residual (2) (species-id collision caveat) and
residual (3) (browser ordering — needs Steve's phone
eyes, hence [needs-eyes] on the raidname wording
commit) are NOTED ONLY, not chased, per the arm brief.

## Canon status (stated, not invented)

READ docs/CANON.md first: no canon doc covers raids
or palisade sleep (same finding as sim-raidname-b).
The raid rule lives only in a havenGrowth.js header
comment (reactive raids: 3+ world monsters, 3k+
pantry kcal, 7-day cooldown, 18% roll; without a
palisade one raider can reach the sleeping player
via pendingEncounter; with a palisade the watch
holds the wall). This arm invents no canon: it
either proves a code-level impossibility or
documents a firing transcript; a removal, if it
lands, deletes narration that never fires and
changes no mechanism, balance, or policy value.

## Background (read first)

evidence/2026-10-29/sim-raidname-b.md +
sim-raidname-b-prereg.md + sim-raidname-b-corpus/
+ sim-raidname-b-corpus-on/ (the 1730Z run, GO,
narration-only wording change: dawn raid fights now
name the raid at fight start via pending shadow +
raidBorn flag union). The question this arm answers
is sim-raidname-b's residual (1): the aftermath
guard line ("already fell to the raid…",
src/js/game.js startCombat, said only when a
villager fighter is already dead at the fight's
opening line AND the fight is raid-born) fired
0 times on the raidname band (25 dawn-raid
mornings/fights). That is correct if no fighter
was pre-dead at any opening line — but it guards
a case the engine may make impossible. Question:
prove a firing case, or prove the case cannot
occur. sim-raidname-b's T2 already hints at the
answer (a 0-HP villager is NOT seated by the
engine); this arm proves it or refutes it.

## The guard, exactly (so the proof targets the right predicate)

Location: src/js/game.js startCombat. Snapshot
(before the opening turns): `_raidFallenAtStart =
fighters.filter(f => f.kind === 'villager' &&
(f.alive === false || (typeof f.hp === 'number'
&& f.hp <= 0))).map(f => f.name)`. Said at the
end of startCombat, ONLY inside the raid-match
block (`_raidPendingMatch || _raidEntityMatch`):
`🕯️ <names> already fell to the raid before this
fight — they do not rise for it.` The guard can
fire ONLY if a villager fighter is seated with
alive === false or numeric hp <= 0 at snapshot
time, in a raid-born fight. A villager who dies
in the fight's own opening turns does NOT count:
the snapshot precedes the opening turns.

## Base commit (pinned before judging)

Worktree HEAD at arm start: ef9219748
(sim-food-economy-round-1730 coordinator evidence)
with the raidname wording (559c5787f) in history.
The "before" corpus for removal neutrality is
evidence/2026-10-29/sim-raidname-b-corpus-on/
(guard present + raid line, 16 seeds) — the
guard-present trajectories. The pre-raidname corpus
(sim-raidname-b-corpus/) is the second guard-
present witness for the zero-fire census.

## Instrument (reused, unchanged)

Driver: scripts/fightorigin-trace-b.js, run with
OUTDIR=evidence/2026-10-29/sim-raidguard-b-corpus.
Measurement-only (read-only tracing layers; every
wrapped verb / startCombat call invokes the
original exactly once), already proven on this
band by sim-fightorigin-b and sim-raidname-b.
Proof: new scripts/test-raidguard-b.js (unit
gates + corpus zero-fire + removal-neutrality
comparer). No other driver, no policy change, no
substrate change. If the driver crashes or corpora
are incomplete, the run stops and reports — no
substitute instrument is improvised mid-run.

## Legs (staged, §§9–12)

Band: seeds 10710–10725 (16 seeds), 30 loop-days,
substrate COMPETENT_FEAST=0 SEATDRIVE=0
PLENTYDEPRI=0 DEPOSITGATE=1, POLICY=insideevening
— identical to sim-raidname-b. Death-aware
horizon: instances run 30 loop-days or to
game-over, never a fixed 200d.
"Seeds" for this DIAG arm are the raidname band
plus fixture seeds constructed in the proof test
(say so, per the arm brief).

- PILOT (gate, before any confirm spend): 8 seeds
  (10710–10717), guard-removed driver corpus vs
  the guard-present -on corpus slice for the same
  8 seeds. Pilot passes ONLY if the comparer
  reports exact deep-equal modulo stackLines
  (source line numbers shift with ANY edit, the
  same named edit artifact as sim-raidname-b).
  Any other diff kills the removal on the spot;
  no confirm spend follows.
- CONFIRM (only if pilot passes): remaining 8
  seeds (10718–10725), same comparison; judged
  on the full 16-seed band.
- UNITS (fixture seeds, run before the pilot
  corpus leg is judged): tbHumanFighter gates,
  startCombat seating gates, snapshot-timing
  control (see G1).

## Primary metric + GO bar (judged ONLY against this prereg)

Primary metric: impossibility proven vs firing
case proven (binary, not a rate).

GO-REMOVE (removal lands as its own separate
commit, narration-only, no mechanism/balance
change) requires ALL of:
  G1 (gates, unit): test-raidguard-b.js proves
      (a) tbHumanFighter returns null for a
      dead-flagged villager, for hp 0, hp < 0,
      and non-finite hp, and returns a fighter
      with alive === true and hp > 0 for a
      healthy villager; (b) startCombat never
      seats a 0-HP villager placed within 4
      squares of the player, raid-born or not;
      (c) a 1-HP villager seated in a raid-born
      fight who dies in the fight's own opening
      turns does NOT trigger the aftermath line
      (snapshot precedes opening turns — the
      timing leg, not just the seating leg).
  G2 (zero-fire on band): 0 aftermath lines in
      BOTH guard-present corpora (base +
      -on, 16 seeds each) AND 0 in the pilot
      and confirm guard-removed corpora
      (trivially, the code is gone — the
      judged part is the guard-present zero).
  G3 (removal neutrality): guard-removed driver
      corpora deep-equal the guard-present -on
      corpora on ALL recorded fields INCLUDING
      say, modulo stackLines only, on the full
      16-seed band (pilot 8 + confirm 8).
      Any non-stackLines diff = removal MOVED
      something → removal KILLED, guard stays.
  G4 (proofs green): test-raidguard-b.js green
      (unit + corpus + neutrality), node --check
      clean on changed files, and the repo quick
      check (scripts/check.js --quick) shows
      NO NEW FAILURES vs the sim-raidname-b
      recorded base (284 passed, 6 failed,
      identical failing set — "quick green"
      is unachievable on this base, proven by
      sim-raidname-b, and is NOT re-claimed).
  G5 (sense PASS): one post-removal flagship
      dawn-raid tail (10713/28, the Rasha
      fight) read end to end: raid line
      present, no aftermath line, no gap
      introduced by the removal — the tail
      reads exactly as the guard-present tail
      minus nothing (the guard contributed
      no line to it).
GUARD-VALID (guard stays, evidence documents the
firing case with transcript): any leg constructs
a seated pre-dead villager fighter in a raid-born
fight and the aftermath line fires naming them.
A firing case found ANYWHERE (unit fixture or
corpus) overrides GO-REMOVE immediately — the
removal is killed, not debated.
NO-GO (evidence-only, guard stays): any G-item
miss without a firing case.
INSUFFICIENT-DATA (evidence-only, guard stays):
the driver/corpus fails such that no census can
be judged, or the unit harness cannot stage the
seating gates at all. The exact blocker is
stated; a removal is NEVER landed on an
unproven claim.

## What the removal deletes (fixed here, if GO-REMOVE)

src/js/game.js ONLY: the `_raidFallenAtStart`
snapshot block (read-only, before the opening
turns) and the aftermath `say` inside the
raid-match block, plus their comments. The raid
line itself stays untouched. No [needs-eyes]:
the removed line never fired on any corpus and
the impossibility proof is band-independent
(the seating gates are universal, not
band-specific), so no player-visible text
changes in any play. If a firing case is found
instead, no removal commit exists at all.

## Wall numbers (30-day legs)

National / table / wins: NOT OBSERVABLE inside
30-day instances — reported as not claimed,
never as zeros. Wave 4–5 reach, median survival
reported from the corpora as observed.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

No balance-panel compare .md is produced, by
the same pre-registered analogy as
sim-raidname-b: this leg is a narration-code
removal on 30-day instances, and panel metrics
(national / table / wins, wave reach) cannot
move — and cannot even be observed — inside
30-day instances. The before/after instrument
is the fightorigin corpus on identical seeds
(G3 neutrality, above), and the pre-registered
GO bar is the judge.

## Metric review (mandatory section in the evidence file)

Every evidence file carries a metric review:
whether the prereg metric proved right, what
diverged, and any revision proposed for the NEXT
run — never a mid-run re-score.
