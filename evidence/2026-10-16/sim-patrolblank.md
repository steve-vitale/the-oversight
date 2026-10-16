# sim-patrolblank — WHY does resolvePatrol never fire on the courtship road? (flesh-out loop DIAGNOSTIC, 2026-10-16)

**Run:** flesh-out loop diagnostic sim-patrolblank, axis scale-onramp (blocking).
**Type:** READ-ONLY diagnostic — no lever, no src/js change, no policy change. New scripts only.
**Blank named from:** evidence/2026-10-16/sim-fieldpace.md + sim-helpcall.md context: resolvePatrol 0x in 60d probes on the courtship road; the patrol line is exhausted as a lever (sim-patrolwave killed both sides). The threat-thinning system is dead code on this substrate.

## Canon check (docs/CANON.md read first)

No canon doc covers patrol assignment: MONSTER-WAVES.md governs waves/escalation, VISION.md/DESIGN.md are general, and no row of the CANON.md manifest covers "who assigns patrols / when the village posts the treeline watch". **Saying so per the brief instead of inventing.** resolvePatrol itself is engine code (game.js:7021): patrols hunt the nearest roaming world monster via nearestWorldMonster, fall back to an uneventful walk (+1 trust) when none exists, route through fieldFight/aidFight blow-by-blow (canon-compliant, never outcome tables). The router is functional — sim-patrolassign proved 3655 fires when a policy layer assigned patrols (control 0/16). So the blank is upstream of the router: scheduling/assignment, not resolution logic.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sweep)

**Question:** WHY does resolvePatrol NEVER fire on the courtship substrate? Classify every non-fire as gate-blocked (which gate, with values) vs never-scheduled (why no patrol exists to resolve).

**DIAGNOSTIC GO (binding):** 100% attribution of patrol-resolution outcomes over the 16 runs AND a named fix (exact gate/condition + the one-line change that would make it fire, NOT applied — diagnostic only).

**Det-gate (binding):** the instrument must not perturb trajectories — byte-identical trajectory digests with/without instrumentation on identical seeds. Proven in scripts/test-patrolblank-det-20261016.js BEFORE the sweep runs.

**Substrate:** pre-seat courtship. Env: SEATDRIVE=0 explicit, FEASTSCALE_R13=1, TRIBFLOOR=1, SUCCGRACE=1, RAIDDENSITY=1, WINPURSUIT=1, WINDEFER=1, NODEWITNESS=1. Policies: TF.leadfeast / TF.belongfeast (courtship road).

**Seeds:** 8 FRESH seeds [301, 302, 303, 304, 305, 306, 307, 308] (fresh relative to the patrol work: patrolassign used [205..856], patrolwave used [917..548]) × {leadfeast, belongfeast} = 16 runs, all with the instrument ON.

**Horizon:** 180d death-aware (matches the patrol work; the full post-invite ladder window observable).

**Instrument:** scripts/patrolblank-20261016.js (read-only: wraps Game.assignTask, Game.resolveOneAssignment, Game.resolvePatrol, Game.resolveAssignments, Game.yieldChallenge / challenge machinery; logs every patrol-related attempt/gate; ZERO state mutation, ZERO RNG consumption, ZERO beats/narration).
- Attempt class: any assignTask(vid,'patrol') call → outcome: assigned vs refused (which gate: remote/not-at-haven, obedience trust<20, reluctant-roll trust<40, fitness HP<40 — with values).
- Direct-write class: assignments[vid].task==='patrol' seen in resolveAssignments snapshots with no matching assignTask call.
- Resolution class: resolveOneAssignment with task==='patrol' (incl. task-lead self-resolves via v.taskLeads.patrol) → did resolvePatrol fire?
- Lead class: any challenge with domain 'patrol', yieldChallenge('patrol'), v.taskLeads.patrol entries (the contender-takeover path that amplified sim-patrolassign).
- Threat-availability probe (read-only): nearestWorldMonster at Haven sampled once/day (RNG-free scan) — whether a patrol would even have a target.
- Also captures say-beats matching /patrol|perimeter|treeline watch/i for the sense-read (SENSE-TESTING LAW).

**Attribution accounting (100% by construction):** patrol-resolution "opportunities" = attempts + direct-writes + task-lead entries. Every opportunity gets one terminal class: FIRED / REFUSED:<gate> / RESOLVED-WITHOUT-FIRE (why) / DIRECT-WRITE-<source>. If opportunities == 0 across 16 runs, the whole table is NEVER-SCHEDULED and the attribution is: which assigner is missing (policy never calls assignTask('patrol'); engine only calls assignTask from app.js UI; taskLeads.patrol only arises from challenge takeovers on a patrol domain that was never delegated).

**Convergence:** scale-onramp — diagnostic instrument only; no convergence movement unless the fix names a lever.

## Metric review (filled post-run)

**DIAGNOSTIC GO: GO.** 100% of patrol-resolution outcomes attributed across all 16 runs (instrument clean, zero errors) + the named fix below (not applied — diagnostic only). **Det-gate: PASS** — byte-identical trajectory digests with/without instrumentation on 2 seeds × 2 roads (gameDays, endReason, maxWaveUnlocked, waveKills, per-day pop/pantry samples, telemetry death records all identical).

## Results

Sweep complete 2026-10-16: 16/16 runs finished, 0 dropped beats, exit 0.
Per-seed JSONs: evidence/2026-10-16/perseed-patrolblank/ · beats: evidence/2026-10-16/patrolblank-beats/ · log: evidence/2026-10-16/patrolblank-sweep.log.

| run | days | fires | attempts | resolves | dirWrites | leads | chall | threat(present/days/near) | nat | tbl | win |
|---|---|---|---|---|---|---|---|---|---|---|---|
| belongfeast-s301 | 153 | 0 | 0 | 0 | 0 | 0 | 0 | 151/153/146 | 1 | 0 | 0 |
| belongfeast-s302 | 182 | 0 | 0 | 0 | 0 | 0 | 0 | 179/181/172 | 1 | 0 | 0 |
| belongfeast-s303 | 117 | 0 | 0 | 0 | 0 | 0 | 0 | 115/117/111 | 0 | 0 | 0 |
| belongfeast-s304 | 104 | 0 | 0 | 0 | 0 | 0 | 0 | 103/105/101 | 0 | 0 | 0 |
| belongfeast-s305 | 143 | 0 | 0 | 0 | 0 | 0 | 0 | 141/143/132 | 1 | 0 | 0 |
| belongfeast-s306 | 160 | 0 | 0 | 0 | 0 | 0 | 0 | 160/162/157 | 1 | 0 | 0 |
| belongfeast-s307 | 181 | 0 | 0 | 0 | 0 | 0 | 0 | 178/180/178 | 1 | 0 | 0 |
| belongfeast-s308 | 182 | 0 | 0 | 0 | 0 | 0 | 0 | 179/181/177 | 1 | 0 | 0 |
| leadfeast-s301 | 182 | 0 | 0 | 0 | 0 | 0 | 0 | 179/181/172 | 1 | 0 | 0 |
| leadfeast-s302 | 182 | 0 | 0 | 0 | 0 | 0 | 0 | 180/182/178 | 1 | 0 | 0 |
| leadfeast-s303 | 182 | 0 | 0 | 0 | 0 | 0 | 0 | 179/181/176 | 1 | 0 | 0 |
| leadfeast-s304 | 121 | 0 | 0 | 0 | 0 | 0 | 0 | 119/121/117 | 1 | 0 | 0 |
| leadfeast-s305 | 181 | 0 | 0 | 0 | 0 | 0 | 0 | 178/180/178 | 1 | 0 | 0 |
| leadfeast-s306 | 182 | 0 | 0 | 0 | 0 | 0 | 0 | 182/184/179 | 1 | 0 | 0 |
| leadfeast-s307 | 180 | 0 | 0 | 0 | 0 | 0 | 0 | 179/181/179 | 1 | 0 | 0 |
| leadfeast-s308 | 109 | 0 | 0 | 0 | 0 | 0 | 0 | 107/109/105 | 1 | 0 | 0 |

Aggregate: **fires 0, attempts 0, directWrites 0, resolutions 0, patrolLeads 0, patrolChallenges 0** across 16 runs and 2,541 sampled days. Opportunity universe = 0. Threat probe: world monsters present on **2,509/2,541 days (98.7%)**, within 2 tiles of Haven on **2,458/2,541 (96.7%)**.

## Verdict: NEVER-SCHEDULED (100% attribution) — substrate property, NOT a gate bug

There is no blocked gate because nothing ever reaches a gate. The patrol-resolution chain is `assignments/taskLeads → resolveOneAssignment → resolvePatrol`, and it is unwired at the FIRST link:

1. **Game.assignTask is the only assignment source.** grep src/js: the engine never calls it — the only caller is the app.js talk-menu UI (the human leader's verb). In sims, only policies call it.
2. **The courtship policies never pass 'patrol'.** grep scripts/policies/*.js: every assignTask call in the stack passes only `water`, `wood`, `fish`, `garden`, `forage`, `cook` (competent.js: workWater, counterPlay, assignBest/assignAnother; tribfloor/feastscale delegate). Zero patrol-task strings in the whole policy tree.
3. **Nothing mutates assignments around the engine** — zero direct writes observed in 16 runs.
4. **The contender-takeover path can't ignite either** — taskLeads.patrol arises only from challenge-aging/yieldChallenge on a patrol DOMAIN, which requires a prior patrol delegation (leadershipFriction on patrol). With zero patrol assignments, ch.task='patrol' never exists. Zero patrol-domain challenges in 16 runs.
5. **resolvePatrol's internal gates were never evaluated** — fires=0 means gearUp/healCheck/table-sanctity/nearestWorldMonster never saw a call. (For the record: inside the router, none of them would suppress a *fire* anyway — table sanctity and no-monster both fall into the narrated uneventful-patrol branch; the router still fires.)

So: the router is live but unscheduled. sim-patrolassign already proved the mechanism end-to-end (3655 fires, real fights, kills, loot, carcasses when a policy layer assigned patrols) — **nothing in the engine prevents patrols on the courtship road; the courtship road simply never asks.**

### The named fix (NOT applied — diagnostic only)

Policy-side, in the competent.js upkeep rotation (the pattern already exists — workWater's `assignOne`): when a world monster is within ~2 tiles of Haven and nobody is assigned patrol, assign the best-free fighter-capable villager via the leader's honest verb — `Game.assignTask(best, 'patrol', { via: 'in-person' })` with the same judgment gates the killed patrolassign layer proved safe (in-person only, trust ≥20, competence ≥1.0, HP ≥60). The engine change is zero lines; the exact one-line form inside `watchTreeline(Game,ctx)` would be:

```js
if (!onTask('patrol') && threatNearHaven(2)) assignBest(Game, 'patrol', ['soldier','police','hunter','fighter']);
```

NOT engine-side auto-assignment: auto-posting in resolveAssignments would bypass assignTask — the leader's core verb — and contradict the DRIFTER gating design (remote assignment refused without an ability). The fix belongs in the policy stack, which is where every other staffing decision lives. A future arm should re-test on fresh seeds: the patrolassign layer's exact machinery (assignTask + those gates) is the proven reference implementation, minus the contender-takeover decision that needs a design call.

## Sense-read (SENSE-TESTING LAW)

The only "patrol"-matched narration across 16 runs is the System's raid alarm: `"Perimeter violated! This is unprecedented! ...Is this unprecedented? Checking. Yes. Unprecedented."` — **byte-identical in all 16 runs** (days 8–31). It reads as intended System personality (unhinged, self-correcting) the first time; word-for-word on every raid in every village it reads robotic. Filed as a narration finding (lever-3 territory, not chased here).

The deeper sense-read: raids DO arrive early (d8–31) and world monsters camp within 2 tiles of Haven on 96.7% of days — villagers forage, fish, cook, and garden around a treeline that is never watched, while the System announces the violation every time. The village looks busy and cared-for but blind: patrols are the one task the competent leader never staffs.

## Village assessment

The villages are sim-patrolassign's controls, down to the shape: they die of combat, not hunger. 9/16 survived the 180d horizon; 7/16 village-lost between days 104–180 (median survival ~180d on leadfeast's survivors, lower on belongfeast). National 14/16, table 0/16, wins 0/16 — the pre-seat scale wall holds. What was missing: nobody stands the treeline watch, even on days when a world monster sits 1–2 tiles from Haven (96.7% of days). The blank is filled as diagnosed, not fixed: patrols are dead code on the courtship substrate because no one schedules them — threat-thinning is a scheduling blank, not a resolution blank.

## Convergence

scale-onramp — diagnostic instrument + named fix, no convergence movement. The fix (policy-side patrol staffing) is a candidate arm; the patrol line as a LEVER stays exhausted (sim-patrolwave killed the threat-thinning hypothesis itself), but the blank — why nothing ever scheduled — is now documented and reusable.
