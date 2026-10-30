# sim-contestdeath-b — PREREG (committed BEFORE any judged sweep)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T1436Z,
arm sim-contestdeath-b, axis food-economy (backlog item #1541, open).
Parent: loop-B run fleshout-loop-b-20261030T1332Z, arm sim-sicktele-b
(evidence/2026-10-30/sim-sicktele-b.md, landed e3491697c).
Branch: sim-contestdeath-b (worktree ~/workspace/worktrees/sim-contestdeath-b).

## The gap (as found, not re-litigated)

`_cxKillContestant` (src/js/contests.js ~6049) is the choke point for
EVERY villager contest death (watch path `_contestDie`, multi-take path
`_contestResolveOthers`). It removes the villager from the roster and
ledgers `state.contestDeathsById`, but never calls `registerDeath` —
so contest deaths get no death tele, no fallen entry, and no grief
event, though the village narrates them ("X is gone. The village will
say the name for a long time."). Repro seed 9983: elif_demir day 32,
marcus_webb day 23. Blind band 10201–10208 showed 0 gaps in 81 exits,
so a blind band will NOT measure this — this run uses a
contest-enriched band (direct drive of the real call sites, below).

## CORRECTION to the parent evidence's mechanism note

The parent evidence says registerDeath "writes the fallen entry". It
does not: `registerDeath` (src/js/corpses.js) fires the death tele,
builds the corpse, fires the grief event, seeds witness-gated gossip,
and sets `deathSeen`. The fallen entry is written by the CALLER —
the lethal-hurt branch in game.js pairs registerDeath with a
`v.fallen.push(...)` (same pattern in the wound/thirst paths). So the
fix must pair registerDeath with a fallen push mirroring that branch,
or the metric below fails on the fallen half. This is a correction of
the mechanism description, not of the gap: the gap is real either way.

## The lever (specified, to be implemented after this prereg)

In `_cxKillContestant`, after the roster removal, for a villager pid
(player never routes here — guard anyway):
1. `registerDeath({ kind: 'villager', villagerId: pid, name:
   displayName(pid), cause: 'contest', killerId: null })` — no
   witnesses (see double-fire audit), no mx/my (see corpse decision).
2. `v.fallen.push({ villagerId: pid, day: scholar.day, cause:
   'contest', name: fallenName(pid) })` — mirroring the lethal-hurt
   branch.
3. Remove the corpse registerDeath just created from the corpses list
   (see corpse decision — no phantom field body).

## Open question (a): corpse placement — RESOLVED in design, to be proven by the test

A default registerDeath call plants a corpse at the scholar's current
tile (`mx/my` default to scholar position, node defaults to the
player's node), and `corpseAt` makes it lootable/examinable there.
A contest death happens on camera in the System's arena, off-map:
there is no honest field tile. No canon doc covers body return —
docs/CANON.md has no death/corpse/fallen section, docs/CONTESTS.md
says nothing about bodies coming home, and the only body hint is a
`_contestDie` code comment ("the village buries them") with zero
implementing code. Inventing "the System returns the body to the
haven" would be inventing canon. DECISION: record tele + fallen +
grief, NO field corpse. The corpse registerDeath builds is removed
immediately after registration (tele, deathSeen, grief, deeds already
fired inside registerDeath; removal only drops the phantom body).
Corpse count is therefore tracked separately and is EXPECTED to be 0
after the fix — that is the design, not a miss. If a later run finds
canon for body return, the corpse half re-opens under metric review.

## Open question (b): grief/gossip double-fire — AUDIT (to be proven by the test)

Audit of what registerDeath fires internally vs what contest paths
already fire, per death:
- tele('death'): NEW, wanted — this is the gap.
- audioEvent('villagerDeath') + death_in_family deeds: NEW, wanted,
  no contest-side equivalent.
- seedGossip('death:<id>'): fires ONLY if witnesses.length. The fix
  passes NO witnesses, so this never fires. Village news already
  exists as `_cxGossip('died')`, seeded BEFORE `_cxKillContestant`
  at both call sites (watch path, multi-take path) — so no duplicate
  gossip and no missing gossip.
- villageEvent('death') (grief): NEW, wanted. Contest deaths
  currently get ZERO grief events; blood-on-air is a separate crisis
  kind (fireCrisis dedupes per kind per run), not a grief event, and
  no `_contestDie`/`_contestResolveOthers` path calls deathGriefBeat.
  Adding exactly one grief event fills the blank; it is not a
  duplicate. The deathGriefBeat fallback (fires only when deathSeen
  is unset) cannot double-fire after this fix because registerDeath
  sets deathSeen first.
- fireCrisis('first-grave'): fires inside registerDeath for a
  villager death, but fireCrisis dedupes per kind per run — so it
  fires only when this is the run's FIRST death of any kind. A
  first-death contest victim getting the first-grave crisis is honest
  (the village digs a grave for someone who never came home; the
  line says "digs", not "buries the body"). It is a different crisis
  from blood-on-air, so no duplicate. Tracked, not counted as
  duplicate grief.
- deathSeen guard: a second registration for the same vid no-ops
  (one tele, one fallen push guarded by the same call structure —
  the fix pushes fallen only when registerDeath returns non-null,
  i.e. only on the first registration).
- killerId null (never the player) → no murder event from the
  grief branch. Contest death is not a player murder.

DUPLICATE-GRIEF (operational, judged per death): villageEvent('death')
fires exactly once; contest_died gossip entries for the pid == 1 (the
pre-existing one); death: gossip seeds for the pid == 0; death teles
for the pid == 1; fallen entries for the pid == 1; blood-on-air
firings per run unchanged vs baseline (deduped per kind: ≤ 1).

## Primary metric (binding)

Contest-death record coverage = villager contest deaths with (death
tele AND fallen entry) / villager contest deaths on the enriched
band. Corpse is tracked separately (expected 0 by design, above)
and is NOT in the numerator.

## GO threshold (binding, §14 — a miss is NO-GO, never re-scored)

GO iff ALL of: (1) coverage >= 0.80 on the confirm band;
(2) zero duplicate-grief cases by the operational definition above;
(3) roster-exit counts identical before/after per seed (deaths are
RECORDED, not added); (4) contestDeathsById counts identical
before/after per seed. A duplicate-grief case or a changed death
count is NO-GO even if coverage is 1.0 — in that case the fix ships
as specified-but-blocked with the exact blocker, per the brief.

## Enriched band (why blind bands cannot judge this)

Direct drive of the real call sites, one fresh game per (seed, path)
via scripts/sim-harness.js loadGame + setupGame (never two harnesses
in one process; one process per seed, paths run sequentially inside
it on fresh games):
- Path W (watch): `_contestDie({ participant: pid, contestId: <real
  pool id> }, <how>)` — the real watch-death path, including its
  pre-kill `_cxGossip('died')` and post-kill say/trauma lines.
- Path M (multi-take): `_contestResolveOthers({ others: [pid],
  contestId: <real pool id> })` with `contestResolveVillager`
  stubbed to `{ outcome: 'died', detail: '', log: [] }` — the stub
  replaces ONLY the fate roll; the gossip + kill + say code measured
  is real. (Contest fates are "played, not RNG" in live play; the
  stub stands in for a played loss, and the choke point under test
  is `_cxKillContestant`, not the fate engine.)
- Path U (unit): `_cxKillContestant(pid, contestId)` directly, with
  `_cxGossip('died')` pre-seeded exactly as both call sites do —
  the choke-point unit, isolating the fix from call-site wiring.
Coverage is judged on W + M (the real call sites); U is diagnostic.
Each drive uses the first living non-player roster villager of a
fresh day-1 game, so no prior death confounds first-grave/grief
counts. Wrappers (record-only, no state changes): tele, registerDeath,
removeVillager, villageEvent, seedGossip, fireCrisis, say/sysSay.

## Horizon, seeds, policies

Horizon: death-aware by construction — each drive IS one death event;
no day horizon applies (drives run on fresh day-1 games). No bot
policy applies (direct drive, no sim days). Pilot: seeds
10401–10408 (8 seeds × 3 paths). Pilot gate: coverage >= 0.80 AND
zero duplicate-grief, else stop — no confirm spend. Confirm (only if
the pilot gate passes): seeds 10411–10426 (16 seeds × 3 paths).
Baseline leg runs the identical driver on HEAD code before the fix;
the after leg runs it after the fix. Identical seeds, identical
driver, only src/js/contests.js differs.

## Balanced panel (§15, supporting instrument, never the judge)

A short competent-policy sweep (8 seeds, death-aware horizon) run
before and after, compared with scripts/balance-panel.js, as a
no-regression guard on wins/national/deaths-exits. Pre-registered
interpretation: panel villageDeaths counts teles, so a RISE there
equal to the recorded contest deaths is the fix working, verified by
roster-exit equality — not a regression. The panel never overrides
the GO threshold above. Compare .md attached to the evidence file.

## Sense-testing (law, Steve 2026-10-11)

Read the say/sysSay transcript around each driven death and judge
meaning/coherence: the death line, the "is gone" line, the grief
beat, and the absence of a phantom body. Quote the lines in the
evidence file; counts alone never pass this run.

## Metric review (filled at end of run; revisions apply to the NEXT run)

- (to be filled)
