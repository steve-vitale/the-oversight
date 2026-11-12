# sim-pairarming-a — PREREGISTRATION (arm sim-pairarming-a, run fleshout-20261112T1624Z follow-up)

Instrument-only diagnostic — ZERO src/js changes committed. This arm
answers the 1624Z run's next blank #5, carried from the r9 run
(evidence/2026-11-12/sim-bisect-r9-cut-a.md §5, §8.5): the wave-5
choke is now a PAIR-ARMING problem, not a pair-formation problem.

## The question

On the r9 base (ee30f22a2, 385th commit of d229b58f5..203a32775),
seed 190398 holds a wave-5 pair for 19 days (d131–149) with armed
4–5 vs demand 6 and never qualifies; armed count falls 4 → 3 over
the block. WHY do armed counts fall while a pair holds — not
whether pairs form.

## Canon read first

- docs/CANON.md read first.
- docs/MONSTER-WAVES.md design call #4 (2026-10-16): combat
  readiness gates the standing unlock. `waveCombatReadiness(w)`
  reads four bars from LIVE village state: ARMORED (living roster
  fighters with armor worn at P ≥ demand), ARMED (living roster
  fighters with a weapon to hand — equipped melee/ranged, or a
  weapon item carried), TRICKS (counters known), VETERANS (living
  roster members with a recorded wave-(w-1)+ kill in
  `state.waveKillLog`). Wave-5 demand (sim starting points, not
  canon; Steve can overrule): armored 4 @ P≥15, armed 6, tricks 3,
  veterans 2.
- docs/TABLE.md read: the table is the endgame win; it carries no
  readiness/armed rule of its own — the wave-5 door is the
  readiness gate's business. No canon doc covers pair-arming
  attribution; the event classes below are defined from what the
  CODE actually records, not from canon, and say so where they
  come from.

## The armed rule, as read on this base (src/js/standing.js, pre-fix)

`waveCombatReadiness(5)` counts, per living roster member:
- scholar: `armorBonus()` for armorP; `equippedWeapon()` (not
  unarmed) or a weapon item carried in `state.scholar.inventory`
  for armed. The scholar always counts as living.
- villager: `S.equipment.armorOf(vp, itemDefs)` for armorP;
  `S.equipment.meleeWeaponOf(vp)` (`eq.melee || eq.weapon`) or
  `S.equipment.rangedWeaponOf(vp)` (`eq.ranged`), or
  `carriesWeapon(vp.items)` (an item whose def has `.weapon`)
  for armed.
- veterans: distinct `by` in `state.waveKillLog` with `w >= 4`
  and living (`vp && !vp.dead`; scholar always living).
- tricks: `monsterCounterKnown(mid)` count over
  `state.monsterCounters`.

Weapon-loss mechanisms found in code (checked, not assumed):
- Lockpick steal (`game.js tbLockpickSteal`): a lockpick monster
  takes the SCHOLAR's equipped weapon; if it bolts twice it
  flees with it — the only code path that removes a weapon
  outright. Scholar-only.
- Gear sharing (`villager-build.js`): villagers gift spares to
  better fits and draw from the armory stash; an old weapon goes
  BACK to the pile on a swap — transfers, never destruction.
  `autoEquip` re-runs on spawn/gear events and always equips the
  best available weapon; it never leaves a fighter unarmed while
  a weapon sits in their items.
- Ammo is spent in fights (`fieldFights.js`); ammo is not a
  weapon def, so it cannot change the armed count.
- `unequip` returns the piece to inventory — still counts as
  armed (carried). No durability/breakage system for weapons
  exists in the code (grep: no weapon-break/durability path).
- Roster removal choke point (`betrayal.js`): exiled/fled/left
  removals filter the vid out of `v.roster` (and record
  `v.exiles`); death removes the same way. A roster member who
  dies or leaves takes their armed count with them.

## Base / band / policy / horizon

- Base: `ee30f22a2` (r9 cut base), checked out detached in this
  worktree. `git rev-parse HEAD` is `ee30f22a2` at run start.
- Band: seeds 190391–190398 — deliberately the SAME band as the
  r9 cut, the vetphantom fix leg, and every bisect leg. Band
  reuse is deliberate matched-control design: this arm replays
  the exact r9 holds, so the armed trajectories must reproduce
  the r9 corpus day-for-day (see Replay identity below). This is
  not a freshness violation; it is stated here before any sim.
- Policy: competent verbatim (`scripts/policies/competent.js`),
  single leg, mode `fix` only.
- Horizon: 150d death-aware (+10d tail max), same as r9.
- Fix-swap: this base PREDATES the r131 roster-check fix
  (`5d16916f4` — verified NOT an ancestor of `ee30f22a2`;
  on-disk `src/js/standing.js` sha256
  `98c8bfad70d744353681895ff41115c36d5ee96b8046fa80c24e04e7bf72d69d`,
  byte-identical to the r9 pre-fix file). The fix `standing.js`
  (sha256
  `f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`,
  extracted with `git show 5157782a4:src/js/standing.js`) is
  swapped in UNCOMMITTED for the run, exactly as vetphantom-b /
  r5–r9 cuts did. The driver REFUSES to run unless the on-disk
  standing.js carries the ROSTER CHECK marker AND its sha256 is
  exactly the fix sha. The swapped file is never committed and
  is restored byte-identical afterwards (sha256 + `cmp` clean +
  `git status` showing no `src/js` modification).

## Instrument

- Reused (unmodified, byte-identical to master, sha256
  `311f105b…`): `scripts/vetfirst-instrument-20261111.js` as
  untracked scratch in this worktree, deleted before finishing
  per the r9 pattern (it is tracked on master; the proof is
  re-run by the coordinator after rebase onto master).
- New: `scripts/pairarming-instrument-20261112.js` — a pure
  gear snapshot taken once per day (in the same `finally` block
  as the vetfirst snapshot, after it): per living roster member
  `{vid, name, isScholar, alive, armed, meleeId, rangedId,
  carriedWeaponIds, armorP, veteranW4}` computed by replicating
  the standing.js predicates with the same engine APIs, PLUS the
  engine's own `waveCombatReadiness(5)` read for cross-check, the
  capped standing (`war + diplomacy + min(plenty, cap)` — pure
  `villageStanding()` read, NEVER `villageStandingTotal()` /
  `unlockedWave()` mid-run: both release peaks / emit beats),
  and `state._standingPeakWave`. Read-only: no RNG consumed, no
  state mutated. A day whose recomputed armed/armored totals
  disagree with the engine's read is an instrument error, not a
  finding.
- New driver `scripts/pairarming-driver-20261112.js` (r9 driver
  pattern + the gear snapshot), new analyzer
  `scripts/pairarming-analyze-20261112.js`, proof
  `scripts/test-pairarming-a.js` (GREEN before any judged sim,
  re-run green after the band).
- Corpus: `evidence/2026-11-12/perseed-pairarming-a/` — 8
  per-seed JSONs; summary
  `evidence/2026-11-12/pairarming-a-summary.json`.

## Definitions (pre-registered, judge against these)

- **Pair-hold day**: a day with `ready5.veterans >= 2` and wave 5
  unreleased (`state._standingPeakWave < 5`).
- **Deferral-hold day**: a pair-hold day with capped standing
  `>= 200` (the T5 bar is met in standing terms, so the door is
  being held shut by readiness, not by standing). The r9
  190398 hold (d131–149) is expected to reproduce as 19
  deferral-hold days; the analyzer reports the count per seed
  and any pair-hold day that is NOT a deferral-hold day.
- **Armed-count drop**: `armed(d) < armed(d-1)` on a
  deferral-hold day (engine's `ready5.armed` read).
- **Headcount ceiling**: on a deferral-hold day, `rosterSize < 6`
  means the armed demand (6) is unreachable even at a 100%
  armed rate — armed can never exceed the living roster. The
  analyzer reports ceiling days per hold.

## Event classes (defined from what the code records)

Every armed-count drop on a deferral-hold day is attributed to
exactly one class by diffing consecutive gear snapshots, or
counted unattributed:

1. **death** — a member armed yesterday is dead today:
   a `registerDeath` row names them that day, or their
   `vp.dead` flag flips alive→dead between snapshots. Includes
   scholar death (the succession that follows is recorded in
   the member row: old scholar vid → new scholar vid).
2. **departure** — a member armed yesterday is alive today
   (`vp` exists, not dead) but absent from the roster
   (exiled/fled/left via the betrayal.js removal choke point;
   a `v.exiles` entry is recorded when present).
3. **gear-loss** — a member alive and in the roster on both
   days was armed yesterday and is unarmed today (weapon gone
   from equipped slots AND carried items). Subclass:
   **transferred** (the lost weapon itemId is found on another
   roster member's items/equipped, or in the village stash /
   pantry, on the later day) vs **stolen/vanished** (no
   transfer found; the lockpick steal is the only code path
   that removes a weapon outright, scholar-only).
4. **armor-loss** — the armored analogue of gear-loss
   (armorP falls below 15 while the member lives and stays;
   same transferred/vanished subclass). Tracked for the
   armored bar, which r9 notes also slipped 4→2 on 190398;
   armor drops do NOT count toward the armed GO bar.
5. **veteran-loss** — a veterans-bar drop: a wave-4+ killer
   dies or leaves (attributed through that killer's death /
   departure class). A veterans drop is not an armed drop but
   it ends the pair-hold; reported alongside, with the same
   member-level cause.
6. **other** — an armed drop with a member-level delta that fits
   none of 1–3 (the delta is recorded verbatim).
7. **unattributed** — an armed drop with NO member-level delta
   at all (instrument read failure, or a rule the instrument
   mis-models). Each one counts against the GO bar.

NOT a class: **readiness decay**. No decay mechanism exists in
the code — readiness is a live read of roster state
(standing.js `waveCombatReadiness`). A drop with no member
delta lands in **unattributed** by design, never in a decay
bucket. "Pair member loss" is not an armed class; it is
**veteran-loss** (class 5) when a pair member dies or leaves.

Gains are recorded too (join-armed, gear-gain, recruit) for the
trajectory narrative; they do not count toward the GO bar.

## GO bar — instrument validity ONLY

The mechanism finding itself is REPORTED, not judged. The GO
bar judges only whether the instrument can answer the question:

- (a) the gear trajectory is captured on 100% of
  deferral-hold days on all 8 seeds;
- (b) every armed-count drop on a deferral-hold day is
  attributed to classes 1–6 or counted unattributed;
- (c) REPLAY IDENTITY: the ready5 armed/armored/veterans
  trajectory AND roster length match the r9 corpus
  (`evidence/2026-11-12/perseed-bisect-r9-cut-a/`) day-for-day
  on 100% of days on all 8 seeds. A mismatch is investigated
  before any judging — a diverged replay makes the diag
  NO-GO, never a re-scored one.

GO requires: unattributed drops **≤ 1 across the whole band**
AND 100% deferral-hold-day coverage AND replay identity on
100% of days. Anything else is instrument NO-GO: the evidence
reports what failed and what instrument would settle it, and
the mechanism finding is not presented as settled.

## What the run reports

Per seed: hold days (pair-hold + deferral-hold), the armed /
armored / veterans trajectory during each hold, every
armed-count drop with its attributed cause (member, class,
subclass, day), the unattributed count, ceiling days
(roster < 6), and the wall numbers (national / table / wins,
wave 4–5 unlocks, median survival). Plus: the concrete next
lever this points at (e.g. gear durability during holds,
wound recovery, veteran retention, headcount/recruitment) —
or a plain statement that the diag is inconclusive and what
instrument would settle it.

## Metric review (§14)

- Primary: instrument validity per the GO bar above. The
  mechanism finding (which class explains the drops) is
  reported, never re-scored against a friendlier bar.
- Panel (§15): N/A — instrument-only single leg, no code
  change, no before/after pair on this base. The before/after
  IS the r9 corpus vs this replay on identical seeds, judged
  by the replay-identity rule.
- Telemetry check: attempted per the loop body step 10
  (`node scripts/telemetry-check.js --baseline
  ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
  --current '<per-seed-glob>' --metrics
  national,table,wins,exiled`). If it refuses (recorder-corpus
  class, as all prior bisect arms), the refusal is recorded,
  NOT waived, and the baseline is NOT rolled.
- Proof: `scripts/test-pairarming-a.js` green before any
  judged sim and again after the band (leg guard; gear
  snapshot vs the standing.js rule on stub Game; attribution
  classes on synthetic day-pairs incl. death / departure /
  gear-loss transferred / gear-loss stolen / succession /
  join-gain / unattributed; hold detection; replay-identity
  comparison on a synthetic corpus; analyzer GO-bar table).
