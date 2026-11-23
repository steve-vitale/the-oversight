# sim-planform-a — PREREG (frozen)

**Arm:** sim-planform-a · **Loop A run:** fleshout-20261123T1415Z
**Axis:** scale-onramp (converging, NOT converged) · **Finding:** tracker
next blank #2 — "NO WAVE-4+ PLAN EVER FORMS WHILE WAVE-4 MONSTERS WALK
PAST" (sim-launchsilence-a, evidence/2026-11-23/sim-launchsilence-a.md §3a/§8;
sim-findings.md line 2712)
**Type:** DIAGNOSTIC (no game change, no new policy; one control leg only)
· **Base master:** `43ebee38cae79a7ba12d149dd8b8dc15b619c8c5` (worktree
`~/workspace/worktrees/sim-planform-a`, branch `sim-planform-a`; verified
`git rev-parse HEAD` at run start. NOTE: this tree branched from a newer
master than the sibling arm's 8a949703a — master moved mid-run. The
FROZEN_BASE is the actual HEAD recorded here; do NOT rebase.)
**Frozen:** 2026-11-23 ~15:00 UTC, before any judged run. No judged run
has run.

## 0. Why this run (read first)

On the launchsilence band 107517–107532, three villages reached wave 4
(one reached wave 5) and never took a wave-4 target, even while meeting
wave-4 monsters and fleeing them (seed 107517: The Eulogy d63, The Audit
d63, The Reunion d89, The Eulogy d117; plans stayed wave-3 or
targetless). Seed 107529 killed a wave-4 herald day 108 and still formed
no wave-4+ plan until day 112. This arm answers the formation question:
from each wave-4 meeting, does a plan seed — and if not, which rule
blocks it? The profile-flip follow-up (sim-findings.md line 2678) needs
the same rows for wave-3 plans: FIGHT ORIGIN on every plan-seed row
(world-tick vs expedition vs patrol vs aid), so the wave-3 vs wave-4
seed profiles are comparable on one band before anyone tunes the seed
channels.

## 1. Band — fresh (verified)

**Band: 107633–107648 (16 seeds).** Pilot 107633–107640, confirm
107641–107648. Freshness check (seed-band skill: every dated prereg
under `evidence/*/sim-*-prereg.md`, plus all `evidence/2026-11-2*/*.md`):

- Coordinator-verified 2026-11-23 ~14:30Z for 107617–107669: grep
  `-rEoh` over all preregs + `evidence/2026-11-2*/*.md` returns ZERO
  hits (recorded in the live claim
  `hidden_files/lever-claims/fleshout-20261123T1415Z.json`).
- This arm re-checked its own band: grep for `10763[3-9]|10764[0-8]`
  over the same scope returns zero hits (2026-11-23 ~15:00 UTC).
- Neighbor bands do not overlap: sim-muster-a (sibling, same run)
  holds 107617–107632; Loop B holds 107471–107494 (0230Z) and
  107533–107581 (1230Z killarrive-b); sim-departsafe-a holds
  107601–107616. None names 107633–107648.

## 2. The instrument (new this run)

Copy of the proven recorder `scripts/launchsilence-driver-a.js`
(the launchfunnel + planignite instrument: v4seeds / v4departs /
v4gates / v4encounters / dawnbidScores / dawnbidDeparts / dawnbidCensus /
dawnbidStarts / companionPool / v4creates / planCensus / havenTickCalls /
tickGates / tickGateChecks / tickGateTotals / igniteCensus / igniteVillage /
funnelStage / deadTargetChecks) → `scripts/planform-driver-a.js`, deltas
frozen here:

1. Output evidence dir 2026-11-23 (`EVIDENCE_DATE` override), run
   `planform-a`, MODE `ctl` (single control leg; CLI refuses any
   other MODE), file names `planform-a-s<seed>-planform-a-ctl.json`,
   outdir `perseed-planform-a-ctl`.
2. Policy module `scripts/policies/tableseat-nowait.js` (see §3).
3. Anchor pin: `FROZEN_BASE =
   43ebee38cae79a7ba12d149dd8b8dc15b619c8c5`. The CLI refuses to run
   unless run-time `git rev-parse HEAD` IS the frozen base; the corpus
   records `anchorCommit` (frozen) + `anchorHead` (run-time) side by side.
4. NEW planform fields on the three meeting/seed streams (no new
   game-function hooks — all three wraps already exist in the copied
   driver; only their recorded rows widen):
   - `fieldFight` wrap: watch widens from wave === 4 to wave >= 3
     (every wave-3+ fight is a meeting). Each row gains `origin`
     (classified from the caller's stack — see §2a), `caller` (first
     frame below the wrap), `monsterTile` (the world-monster tile
     when present, else null), `havenTile` (village px/py),
     `optsRaid` / `optsCornered` (the fight's own opts flags).
   - `winPlanFightGate` wrap: watch widens from wave === 4 to
     wave >= 3; each row gains `origin` + `caller`. A gate `avoid`
     with no following fight is itself a meeting (outcome
     `avoided`); a gate `seek`/`other` is the same meeting as the
     fight that follows (deduped by the analyzer on vid+day+mid).
   - `winPlanSeedFromFight` wrap: each row gains `planBefore`
     `{stage, target, needWave}`, `planAfter` `{stage, target,
     needWave}`, `retNull` (the call returned null), `profile`
     (the holder's profile via the cache-safe replica — never the
     caching `npcRangeProfile` call), and `seq` (a per-run sequence
     number, so the analyzer's meeting↔seed join is order-stable).
     The seed row's existing `path` IS its fight origin, mapped in
     §2a; the `path` values are unchanged.
   - New end-of-run out-block fields: `scholarId` (Game.villagerId)
     and `roster` (end-of-run village roster), so the analyzer can
     split scholar meetings out of the villager population without
     guessing.
5. The analyzer (`scripts/analyze-planform-a.js`, new) derives the
   **planform stream**: one row per wave-3+ meeting (see §5), joining
   the three widened streams in file order on (vid, day, mid) with
   the seed path ↔ meeting origin matched where both are known.
   The meetings table is written into the analysis JSON
   (`evidence/2026-11-23/planform-a-analysis.json`); per-seed
   meeting rows are also embedded in the analysis JSON under
   `meetings` (never re-written into the corpus files).
6. `firstCallerFrame` skip list gains `planform-driver-a.js`.
7. Recorder env flag `PLANFORM_RECORDER` (off skips the wraps —
   determinism / neutrality leg).

All wraps remain pure reads + driver-local writes; no game-state writes,
no RNG. Zero `src/js` changes in this arm.

### 2a. Fight-origin map (frozen — classified from the stack, never guessed)

| Origin | Caller frame contains | Notes |
|---|---|---|
| `world-tick` | `resolveWildMonsterEncounter` (game.js) | The wild sweep (game.js:21162) + havenGrowth raid router (game.js:681, `{raid:true}`). Aid-routed fights do NOT appear here: they go through `aidFight` below. |
| `patrol` | `resolvePatrol` (game.js) | The Haven patrol router (lingering raiders during an aid crisis). Never calls the seeder (§12). |
| `expedition` | `expeditionMonster` (villager-agency.js) | The expedition router. Evade + flee seed here (§12). |
| `aid` | `aidFight` (comms.js) | The aid-crisis fight. Never seeds (seed suppressed by `!wViaAid`, §12). |
| `sortie` | `lingererSortie` (havenGrowth.js) | Cornered lingerer fights. Never calls the seeder (§12). |
| `contest` | `contestEngine` | Contest fights. Never calls the seeder. |
| `alien-player` | `alienPlayers` | Stranger fights. Never calls the seeder. |
| `psycho` | `corruption` | Psycho-spawn fights. Never calls the seeder. |
| `unknown-*` | matches no rule above | Explicit, never a silent default; the analyzer names it as the reason a meeting is unattributed. |

Seed-origin map (for the profile comparison — the seed row's `path`):
`world-tick` → world-tick; `agency-evade` / `agency-flee` →
expedition; `gate-avoid` → expedition (the gate is consulted only
by `expeditionMonster`, villager-agency.js:710). Patrol / aid /
sortie / contest / alien-player / psycho never produce a seed row —
that absence is itself a formation fact (§5, rules B2–B5).

## 3. Policy + substrate (frozen)

- **Policy module:** `scripts/policies/tableseat-nowait.js` (the brief's
  baseline). **Layers OFF:** `TABLESEATNOWAIT` unset and `LEANLINKRESCUE`
  unset — the driver CLI refuses to run if either is `'1'`. With both
  layers off, `tableseatNowait.daily` delegates to `leanlinkrescue.daily`,
  which delegates to `competent.daily` (both modules' det-gates pin
  off-daily as competent.daily byte-identically; the existing test
  `scripts/test-tableseat-nowait-sweep.js` is re-run green in the proof
  step). Net effect: **competent verbatim play**, recorded as
  `policy: 'tableseat-nowait (layers off → competent verbatim)'` with
  the shas of all three policy files on every corpus. This is deliberate:
  the silence was measured under competent verbatim (launchsilence
  band), and recording formation under courtship-on leanlinkrescue
  would measure a different funnel.
- **Substrate env (read by game code), identical to the launchsilence
  prereg §3:** `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
  SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`; `LEND`,
  `PRESENCE`, `KILLBUNDLE`, `HPGATE`, `PINQUAD`, `PROFILEGATE4` unset.
  Note: `FLEEREPAIR2=1` is load-bearing for this arm — it is what makes
  the Suburb a non-seeder (§12, rule S2).
- **Horizon:** 150d death-aware (dead villages stop simulating, +10d tail
  max — the sim-harness death-aware horizon, as on the launchsilence
  band). Why 150d: the formation question is a 150d-band fact; the
  wave-4 window (standing 100 + readiness) needs the full horizon to
  open and close.

## 4. The question

On a fresh 16-seed band under the launchsilence substrate, for every
wave-4 meeting (a villager facing a wave-4 monster blow-by-blow, or
giving it room at the gate): does a wave-4+ plan seed from it — same
day, days later, or never — and if not, which rule blocks it? The same
classification runs over wave-3 meetings, so the wave-3 vs wave-4
seed profiles (holder profile × fight origin × outcome) are comparable
on one band.

## 5. Meeting taxonomy (frozen — the decision procedure, evaluated in order, first match wins)

**Population:** every wave-4 meeting on the band. A meeting is one
`fieldFight` row with wave >= 3 and wave == 4 for the judged set
(wave == 3 rows are classified identically and reported, but the
frozen bars judge wave-4 meetings only), PLUS one `winPlanFightGate`
row with wave >= 3, result `avoid`, and no fieldFight row for the
same (vid, day, mid) — a meeting that never became a fight. The
scholar's meetings (vid === `scholarId`) are OUT of the population:
plans belong to villagers, and the scholar's fights go through
`startCombat`, not the villager seed paths; scholar rows, if any, are
counted and reported separately, never classified. A meeting is
`seeded` when a seed call for that (vid, day, mid) sets
target = the faced monster with needWave >= 4 — whether it created a
new plan, retargeted an existing gear/party plan, or refreshed the
same target (the sub-count is recorded).

| # | Classification | Code-grounded definition |
|---|---|---|
| A1 | `seeded` | A seed call for this meeting set target = mid, needWave >= 4. Sub-counts: `seeded-new` (no plan before), `seeded-retarget` (gear/party plan, different target before), `seeded-refresh` (same target before). |
| A2 | `bounced-hunt-lock` | A seed call fired AND the plan came back unchanged with stage in {hunt, standing, table}: `winPlanSeedFromFight` early-returns when the stage is not `gear`/`party` (win-plan.js `winPlanSeedFromFight`). |
| A3 | `bounced-suburb` | A seed call fired for mid `suburb` AND returned null: `fleerepair2On() && mdef.id === 'suburb'` returns null (FLEEREPAIR2=1 on this substrate). |
| A4 | `bounced-other` | A seed call fired, target did not become mid, and neither A2 nor A3 applies. The row evidence (plan before/after, retNull) is attached for manual audit. A large A4 count means the taxonomy is incomplete (see metric review). |
| B1 | `no-call-kill` | No seed call AND outcome `vKill`: kills never seed — the world-tick seed block fires only on `vFlee` (game.js, VETREENGAGE block), and the expedition `vKill` branch calls `winPlanNoteKill` only (villager-agency.js). A kill advances a hunt/party plan to `standing`; it never creates or retargets one. |
| B2 | `no-call-aid` | No seed call AND origin `aid`: the world-tick seed is suppressed by `!wViaAid`, and `aidFight` itself never calls the seeder. |
| B3 | `no-call-patrol-router` | No seed call AND origin `patrol`: `resolvePatrol` never calls the seeder (the only game.js seed call site is the world-tick router). |
| B4 | `no-call-sortie` | No seed call AND origin `sortie`: `lingererSortie` never calls the seeder. |
| B5 | `no-call-other-router` | No seed call AND origin in {contest, alien-player, psycho}: none of those routers calls the seeder. The origin is named in the row. |
| B6 | `no-call-raid` | No seed call AND origin `world-tick` AND outcome `vFlee` AND the monster tile is the Haven tile (monsterTile == havenTile): the raid router calls `resolveWildMonsterEncounter(d, m, {raid:true})` (havenGrowth.js:681) and the seed is suppressed by `!opts.raid`. |
| B7 | `no-call-outcome-<outcome>` | No seed call AND the outcome is one no seed site covers on that origin: `evade` / `mFlee` / `vDie` / `alreadyDead` on world-tick (the wild seed block is `vFlee`-only), `mFlee` / `vDie` / `alreadyDead` on expedition. The outcome is named in the row. |
| B8 | `gate-avoid-plan-exists-no-retarget` | The meeting is a gate `avoid` AND the holder already held a plan: the gate's outmatched branch resets an existing plan's stage to gear/party but never sets its target (win-plan.js `winPlanFightGate`) — the meeting produces no wave-4 target. (Gate `avoid` with NO plan seeds via the seed call, and falls under A1–A4.) |
| C | `unclassified` | The classifier could not determine a rule (missing streams / instrument errors on that seed, OR an expected seed call is absent: expedition `evade`/`vFlee` with no seed row, world-tick `vFlee` off the Haven tile with no seed row — the code says the call fires there). Must be 0. |

**Join rule:** seed calls join to meetings in file order on
(vid, day, mid), preferring a seed whose `path` matches the
meeting's origin (`world-tick`↔`world-tick`,
`agency-evade`/`agency-flee`↔`expedition`,
`gate-avoid`↔`expedition`-gate). If two meetings share
(vid, day, mid) and one seed call matches both, the first unmatched
meeting takes it and the join is flagged `join-ambiguous` in the
row detail (still classified; the count is reported).

**Seeded-later (secondary, reported not judged):** for each meeting
classified anything other than A1, the analyzer checks the
`planCensus` for the same vid over the 7 days after the meeting:
did a wave-4+ plan appear, and what created/retargeted it
(`v4creates` creator / a later `v4seeds` row)? A targetless
`havenTick` plan does NOT count as seeded — `winPlanHavenTick`
creates plans with target null (§12); only a later seed call
setting the wave-4 target counts, and it is credited to the LATER
meeting, not this one. The later-plan count is reported as
context; the frozen bars judge the same-meeting classification
only.

## 6. Pre-registered bars (judge — DIAG-GO / DIAG-NO-GO)

| # | Bar | Threshold |
|---|---|---|
| 1 | PRIMARY — classification completeness | ≥ 90% of wave-4 meetings classified with a named rule (A1–B8 count as named; C does not) |
| 2 | PRIMARY — unclassified | 0 unclassified wave-4 meetings |
| 3 | Determinism | A replay of 2 pilot seeds (107633 + one further pilot seed, named in the evidence) reproduces the classification AND the launch count exactly |
| 4 | Recorder neutrality | The same 2 seeds with `PLANFORM_RECORDER=off` reproduce the RECORDER-INDEPENDENT game outcomes exactly — `winPlanStats.partyDepartures`, survival days, maxWave, standing, total deaths, VF killCalls (launchsilence prereg §12 lesson: never compare recorder rows across legs — they are empty by construction when off) |
| 5 | Instrument validity | Proof test `scripts/test-planform-a.js` green (classification completeness + determinism fixtures, incl. old-code-fails control where the fixture demands it); analyzer `--selftest` green; 0 instrument errors on all 16 seed files |
| 6 | Pilot gate (8 seeds 107633–107640, before the confirm half) | Bars 1–2 evaluated on the pilot meetings (≥ 90% named, 0 unclassified) AND bar 5 on the pilot seeds. A pilot failure stops the run (DIAG-NO-GO at pilot, no confirm spend). |

Balanced panel (§15): N/A — single control leg, no before/after
comparison; the panel is the instrument only where a comparison applies.
No panel is run and none is claimed. The pre-registered threshold above
is the judge either way.

## 7. Pilot → confirm plan

1. Proof test + analyzer selftest green (bar 5, fixtures only).
2. Pilot: 8 seeds 107633–107640, control leg, recorder on.
3. Pilot gate (§6 bar 6). If it passes: determinism + neutrality replays
   on 2 pilot seeds (bars 3–4).
4. Confirm: 8 seeds 107641–107648, control leg, recorder on.
5. Analyzer over all 16; evidence + sense-test (one village's days
   read as a story, §8).

## 8. Sense-test (frozen)

Pick one village that meets wave-4 monsters and never forms a wave-4
plan, and read its days as a story — its meetings, its plans, its
departure-beat lines, its death/loss story. Judge whether the silence
is sensible (a village whose every wave-4 meeting ends in a kill —
which never seeds — has honestly earned no plan that way) or
senseless (a villager flees the same Eulogy four times and the plan
store never moves). The verdict section names the village and quotes it.

## 9. Wall numbers (reported every run, never judged)

Wins, national, table, wave-5 reached, wave-4 reached, median survival,
max survival, villages lost, total deaths — on the control leg (16 seeds).

## 10. Metric review (to fill at evidence time, never mid-run)

- Whether A4 (`bounced-other`) stayed small; if not, what the
  un-named bounces were.
- Whether the join-ambiguous count stayed small; if not, whether
  same-day same-type re-meetings need a finer meeting key.
- Whether the seeded-later secondary check changes the story (a
  meeting that never seeds same-day but reliably seeds within 7 days
  through a later meeting is a different mechanism than a meeting
  that never seeds at all).
- Whether the wave-3 vs wave-4 seed profiles differ by origin in the
  direction the profile flip hypothesized (wave-3 expedition-evade
  vs wave-4 world-tick-flee), or not at all.
- Whether the tableseat-nowait-layers-off reading (§3) should have
  been layers-on, and what that would change.

## 11. Freshness check (record, per the seed-band skill)

- Searched: all `evidence/*/sim-*-prereg.md` + all
  `evidence/2026-11-2*/*.md` for `10763[3-9]|10764[0-8]` (this band).
- This band 107633–107648: ZERO hits in preregs and `.md` evidence
  (checked 2026-11-23 ~15:00 UTC; the coordinator's wider check for
  107617–107669 in the live claim returns zero hits as well).
- Neighbor bands: muster-a 107617–107632, departsafe-a 107601–107616,
  Loop B 107471–107494 and 107533–107581 — none overlaps 107633–107648.

## 12. Code-grounded seed-call map (frozen — read from the code on this base, not invented)

`winPlanSeedFromFight(vid, mdef, outcome)` (src/js/win-plan.js) seeds
or retargets ONLY when all of these hold: `mdef.wave >= 3`; NOT
(`fleerepair2On()` AND `mdef.id === 'suburb'`); the holder's plan, if
any, is in stage `gear` or `party` (a `hunt`/`standing`/`table` plan
early-returns unchanged). When it seeds it sets `target = mdef.id`,
`needWave = mdef.wave`, stage `party` if armed+armored else `gear`.
It does NOT check the wave gate, standing, or whether the holder is
at Haven — a seed can fire from any router, anywhere.

The four call sites (call TEXT is the anchor — line numbers drift):

| # | Site | Outcome arg | When it fires |
|---|---|---|---|
| 1 | game.js `resolveWildMonsterEncounter` (VETREENGAGE block) | `fled` | Only when `VETREENGAGE=1` AND NOT a raid (`!opts.raid`) AND NOT aid (`!wViaAid`) AND the fight record is `vFlee`. A kill, a death, a fleeing monster, an evade, a raid, and an aid fight all pass through this block without seeding. |
| 2 | villager-agency.js `expeditionMonster`, evade branch | `evaded` | Every expedition `evade` (unconditional, in try/catch). |
| 3 | villager-agency.js `expeditionMonster`, flee branch | `fled` | Every expedition `vFlee` (unconditional, in try/catch). |
| 4 | win-plan.js `winPlanFightGate`, outmatched branch | `avoided` | ONLY when the holder has NO plan. When a plan exists the gate resets its stage to gear/party and never sets its target. The gate is consulted only by `expeditionMonster`. |

Paths that NEVER seed (no call site exists): kills (both routers —
a kill calls `recordWaveKill` + `winPlanNoteKill`, which advances a
hunt/party plan to `standing` but never creates or retargets one),
aid fights (`aidFight`, comms.js), patrol fights (`resolvePatrol`,
game.js), lingerer sorties (`lingererSortie`, havenGrowth.js),
contest / alien-player / psycho fights, raid fights (`{raid:true}`),
monster-flees (`mFlee`), deaths (`vDie`), corpses (`alreadyDead`).

The other plan creator is `winPlanHavenTick` (win-plan.js): it creates
a plan ONLY for a wanderer/explorer at Haven with lived engagement
(personally fought a beast of any wave — `agencyState.know.fought`)
or heard engagement (the village has slain any type), and the plan it
creates is TARGETLESS (target null, stage `gear`). It never takes a
wave-4 target by itself; a target arrives only through a later seed
call. The companion sync (`launchParty`, win-plan.js) copies stage /
party / target / node but NOT `needWave` (leadgate-a finding) — a
companion-inherited plan can carry a wave-4 target with
`needWave: null`; the analyzer's wave-4+ plan test is therefore the
OR definition (needWave >= 4 OR target is a wave-4+ species), as in
leadgate-a §6.

## 13. Sibling boundary (merge safety — sim-muster-a works in parallel)

All new logic lives in the new files (`scripts/planform-driver-a.js`,
`scripts/analyze-planform-a.js`, `scripts/test-planform-a.js`);
hooks are the pre-existing pure-read wraps in the copied driver (no
game-state writes, no RNG). Do NOT touch the muster/companion side
(`companion-score.js`, `findCompanion`, the dawn scorer's
`party_launch` candidacy, `winPlanDepart`'s companion read) — that
is the sibling arm's area. This arm's area is plan creation/seeding:
`winPlanSeedFromFight`, the plan store, `winPlanCommitDeadTarget`'s
plan reads. If a hook is needed in a file the sibling owns, STOP and
report it to the coordinator instead of editing it.
