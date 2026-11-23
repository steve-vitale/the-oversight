# sim-gatehorizon-reprereg-b — FROZEN prereg (Loop B run fleshout-loop-b-20261123T1830Z)

**Frozen:** 2026-11-23 ~19:10 UTC, BEFORE any judged leg. Base: worktree
HEAD `dbe748d46` (the 1730Z adoption tip: killbundle GO merged
`97cf9d7c2`, gatehorizon-b DIAG-NO-GO merged `9f329a6a5`). Branch
`sim-gatehorizon-reprereg-b`, worktree
`~/workspace/worktrees/sim-gatehorizon-reprereg-b`. Run
`fleshout-loop-b-20261123T1830Z`, arm `sim-gatehorizon-reprereg-b`
(the re-prereg'd 150-DAY HORIZON judge of the leader-projection gate
— the named next blank #3 after the 1730Z round).

**Do NOT edit the frozen gatehorizon-b prereg.** This is a FRESH prereg.
The gatehorizon-b prereg stays frozen as the record of what was judged
there; this file freezes what is judged here.

## The defect this re-prereg fixes (1730Z metric review §7, recorded not re-scored)

The gatehorizon-b H1a flag read `p.dead` synchronously after
`fieldFight` returned, but the game sets the death flag at settlement
afterwards. Nine same-day monster deaths of leaders who entered
wave-4 fights at ≤75 HP read as survived, so the frozen H1a read 0
deaths on both legs while the deaths log said the phenomenon was
nonzero. The gate fired 29 times and refused all five staged doors,
but every refused door was winnable on control (5/5 killed, 0 leader
deaths), so refusals cost wave-4 kills instead of saving leaders
(downstream wave-4 kills 37 → 14; wave-5 kills 14 → 1; wave-5
unlocks 8 → 6). The leaders who actually die in wave-4 fights die on
unpinned doors the gate never sees (all six armed-leg low-HP deaths
unpinned, none fire-covered; armed 109104 byte-identical to control).

Validated from the COMMITTED gatehorizon-b corpora before freezing
(proof-of-effect: the observable effect, not green assertions — the
computation is in the evidence file §0 and in the new M3m test §7):

- Control pilot (8 seeds): 11 vDie rows at ≤75 HP; synchronous flag
  reads 0 deaths; deaths-log attribution (rule below) reads **9**.
- Armed pilot (8 seeds): 6 vDie rows at ≤75 HP; synchronous flag
  reads 0 deaths; deaths-log attribution reads **4**.
- The two unconfirmed control rows (109106 brian_otieno 74 HP,
  109107 jesse_cortez 34 HP) carry same-day AND day+1 deaths with
  cause `'The Big Beast'`, not `'monster'` — they are NOT pool-door
  monster deaths under the rule below and correctly do not count.
  The two unconfirmed armed rows (109101 jesse_cortez 19 HP,
  emma_larsen 44 HP) carry same-day deaths with cause `'Big Loud'`,
  not `'monster'` — likewise not counted.
- Every one of the 17 rows above has `pinned: false` — the gate
  never saw any of them.

## What was read first (do not re-measure what they answered)

- `docs/CANON.md` + `docs/MONSTER-WAVES.md` (wave-4 bands: damage
  35–95, HP 850–1500, a 4–6 round fight; wave-5 bands: damage 50–130,
  HP 1000–2200; wave-4 gate: standing ≥ 100 + the four readiness
  bars; wave-5 gate: standing ≥ 200 AND wave-4 faced).
- `evidence/2026-11-23/sim-gatehorizon-b.md` + its frozen prereg
  (the DIAG-NO-GO SUPPLY-THIN pilot: 5/8 scored, H1a 0/0 by the
  broken flag, H1b 37 → 14, starvation guardrail 1 → 6; diag table
  #2–#4 are what this arm fixes).
- `evidence/2026-11-23/sim-gatehorizon-b-prereg.md` (frozen bars,
  150d horizon, LEADERPROJ=1 env-gated, zero src/js) — the design
  this prereg revises, not re-judges.
- `evidence/2026-11-23/sim-winnability-round-1230.md` (doorstage-b:
  staged-pool method, D1 judged GO, and the armor pre-check
  learning — door 10 unscored because the win-plan outmatched gate
  turned its party back for an unarmored member; future staged pools
  should pre-check at-door armor or budget one unscored door
  per 12).
- `evidence/2026-11-23/sim-winnability-chain-round-1730.md`
  (gatehorizon verdict DIAG-NO-GO SUPPLY-THIN + metric review §7).
- `docs/MEASUREMENT.md` §§9–12, 14–15 (staged method, pilot gate,
  death-aware horizons, metric binding, balanced panels).
- `~/workspace/custom-skills/local_seed_band_freshness/SKILL.md` —
  see "Seed bands" below.
- `~/workspace/custom-skills/local-proof-of-effect/SKILL.md` — the
  proof must demonstrate the observable effect (a leader death
  actually attributed to the door the gate saw or missed), not just
  green assertions. The M3m §7 old-corpus validation is that proof:
  flag 0/0 vs deaths-log 9/4 on the committed gatehorizon-b corpora.

## The mechanism (read from the sources, not taken on trust)

- The door-open decision lives in `expeditionMonster`
  (`src/js/villager-agency.js`). A pinned quad (`PINQUAD=1`, three
  pinned allies, `_pinDoor` true) meeting a wave-4+ monster passes
  three gates in order (HPGATE whole-party < 25 HP; LEADERHPGATE
  leader < 25 HP; LEADERPROJ leader projected ≤ 25 HP after two
  rounds at 25/round, i.e. leader HP ≤ 75) — each with the same
  avoid verb (encounter note + return, no fight, no flee, no death)
  and the same counter shape, plus the durable log entry in
  `st.gateAvoids`.
- BEFORE the projection gate, `winPlanFightGate` runs
  `winPlanOutmatched` (`src/js/win-plan.js:1648`): wave ≥ 4 AND
  (party < 3 OR not all armed OR not all armored) → avoid ("going
  back for help"). `gearOf` reads: armed = weapon bonus > 0 OR a
  weapon item carried in the pack; armored = `armorOf(person)` > 0.
- `fieldFight(vid, mdef, m, opts)` is the villager field-fight path
  (record: rounds, outcome, mDealt, vTaken, log). The driver wraps
  it for the whole run — pure observation, no RNG, no state writes
  — to census every wave-4+ fight with its leader entry HP.
- **Death settlement (the defect's root, verified in code):** the
  fight record's outcome `vDie` means the leader's HP was driven
  to 0 in the fight, but the person's `dead` flag is set at
  settlement afterwards, so a synchronous `p.dead` read after
  `fieldFight` returns misses it. The deaths log (`Game.tele`
  `'death'` events, captured whole-run by the driver) carries the
  settled death with `{day, kind, who, cause}` — `who` is the
  villager id, `cause` is `'monster'` for a monster kill. The new
  attribution reads that log, not the flag.
- Wave-4 kills are read from `state.waveKillLog` rows `{d, mid, w,
  by, via, trick}` (`src/js/game.js` kill-attribution block): a
  wave-4 kill is a row with `w === 4`. Downstream kills are those
  with `d` after the staging day.
- `unlockedWave()` (`src/js/game.js`) is the wave gate the sim
  reads; wave 4 unlocks when standing ≥ 100 AND the four readiness
  bars hold (`villageStandingTotal()` holds at t4-1 while any bar
  is short).
- Deaths are captured live by the harness (`runDays` `_liveDeaths`
  from the `death` telemetry event: `{day, kind, who, cause,
  player}`). Starvation deaths carry cause `'starvation'`.

## THE RE-PRE-REG'D DESIGN — frozen (the driver implements exactly this)

One 150-day `capable`-policy sim per seed per leg (two legs: control
gate OFF, armed `LEADERPROJ=1`), with ONE staged pool door injected
mid-run and the run then continued to the horizon. Changes vs
gatehorizon-b, each frozen here:

### (a) H1a attribution via the deaths log (the defect fix)

A `v4encounters` row counts as an attributed pool-door leader death
iff ALL of these hold:

1. `wave >= 4` AND `leaderEntryHp <= 75` (the pool the gate is
   supposed to protect);
2. `outcome === 'vDie'` (the fight itself drove the leader to 0 —
   the door did the killing, not a later event the same day);
3. the run's `deaths` array contains an entry with `day ===
   row.day` AND `who === row.vid` AND `cause === 'monster'` (the
   settled death, same day, same villager, monster cause);
4. the row is not scholar-led (the scholar has no expedition path
   through this gate; scholar rows never attribute).

The driver stamps `leaderDiedLog` (boolean) on every wave-4+ row at
end-snapshot, computed from the merged whole-run deaths array, and
keeps the synchronous `leaderDied` flag alongside it for the
contrast. The analyzer computes attribution from the primitives
(row + deaths array) and D5 fails the corpus if any row's stamped
`leaderDiedLog` disagrees with the recomputation. Rows that match
(1)+(2) but not (3) are reported separately (S4c: vDie rows with no
same-day monster death, with their same-day death cause named) so a
reader can see what the rule excludes and why.

### (b) Stage earlier — relaxed quad + boundary logging

Gatehorizon-b staged only when a stageable quad of RANGING
(wanderer/explorer-profile) villagers existed. On its band that
filter starved supply: seed 109106 first faced wave 4 on day 52
and won on day 90 without ever staging; seed 109104 first faced
wave 4 on day 82 and won on day 91 without ever staging. The
corpus could not say why — no staging-attempt records existed
(diag #3). This arm fixes both halves:

1. **Boundary log:** at EVERY 10-day chunk boundary from the first
   chunk until staging succeeds or the run ends, the driver records
   one `stagingChecks` entry: `{day, alive, unlockedWave,
   eligibleRanging, eligibleTotal, quadOk, decision}` where
   `decision` is one of `staged` / `wait-no-unlock` /
   `wait-no-quad` / `wait-unstageable` / `ended`. The corpus
   carries the full array; the analyzer censuses it (S8b) and the
   evidence names the exact boundary where each unscored seed
   failed.
2. **Relaxed quad:** eligibility widens from ranging-only to any
   living non-scholar villager not currently on an expedition and
   not dead, with ranging-profile villagers taken FIRST (the
   staged door keeps its ranging character whenever the village
   can supply it). The staged party is still geared exactly as
   before (gearUp + packStage + at-door armor pre-check, §(d)
   below), so the door's character is unchanged — only the
   selection pool widens. The staged record carries `widenedN`
   (party members taken from outside the ranging pool) so the
   reader can see whether the widening mattered. The gate's pinned
   quad requires a pinned party, not a range profile — the profile
   filter was a driver convenience, never a gate requirement.
3. **Staging condition otherwise unchanged:** first chunk boundary
   where the village is alive AND `unlockedWave() >= 4` AND a
   stageable quad exists (cap day 120); else unscored. Staging
   attempts retry at every later boundary until staged or the cap
   (a `wait-no-quad` boundary is a wait, not a verdict).

### (c) Organic unpinned doors are counted, not staged

The staged door stays PINNED, deliberately and for a stated
reason: LEADERPROJ fires only on the pinned-quad path in
`expeditionMonster` (game code, not a driver choice). An unpinned
staged door would be identical on both legs — the gate cannot act
on it — and could not move H1a; staging one would measure a door
the gate cannot touch while pretending to test the gate. What the
assignment's "organic unpinned doors" half requires is that the
JUDGE see the doors where leaders actually die, and that is
delivered through H1a itself: every organic wave-4+ fight —
pinned or unpinned — with a low-HP leader is now attributed via
the deaths log and counted, and the evidence reports the
pinned/unpinned split of attributed deaths (S4b). If the armed leg
still cannot beat control by one death because the deaths sit on
doors the gate never sees, that IS the verdict (CONCEPT-DEAD on
coverage, stated plainly) — not a reason to re-stage the same
blind spot. The 1730Z finding stands as the prediction: 17/17
deaths-log candidate rows on the old band were unpinned.

### (d) Door-10 fix retained verbatim (armor pre-check)

Before `startExpedition`, each quad member gets `hide_armor` +
`hunting_spear` placed INTO their pack items (in addition to
`gearUp` setting `equipped`) — `startExpedition` calls
`villagerGearUp(vid, true)`, which re-equips from the person's OWN
pack, and `fieldFight` re-equips again at entry. Pre-check AFTER
`startExpedition` (the at-door point): every member on an
expedition (`st.exped[vid]` present), every member armed AND
armored (the `gearOf` rule). A failing member is replaced with the
next eligible villager (up to 3 replacement tries per slot); if
staging still cannot satisfy the pre-check, the seed is UNSCORED
with reason `unstageable` and the staged door is NOT counted.
Budget: at most 1 unscored door per 12 staged (doorstage §10) — on
the 16-seed band, ≥ 12 of 16 scored or the run is SUPPLY-THIN
(see "Supply rule").

### (e) Unscored reasons split (diag #2 fixed)

The old `dead` conflated won-before-staging with wiped. The new
reasons are exact: `won` (`Game.over && won` — the village won
before any stageable boundary), `lost` (`Game.over && !won` —
the village was wiped before staging), `no-unlock` (never
unlocked wave 4 by the cap), `no-quad` (unlocked but never a
stageable quad — the boundary log names the counts), `unstageable`
(the at-door pre-check could not be satisfied).

### (f) Run shape (unchanged from gatehorizon-b unless stated)

1. **Load + policy:** `loadGame({seed})`, `setupGame`, policy
   `capable`. The driver installs the `fieldFight` wrap before the
   first day and keeps it for the whole run (both phases +
   staging). The wrap records every wave-4+ fight row with leader
   entry HP, `pinned` at fight time, outcome, and BOTH death
   readings (`leaderDied` synchronous flag + `leaderDiedLog`
   deaths-log attribution, stamped at end-snapshot).
2. **Chunked day loop:** `runDays(Game, capable, {days: 10})` in
   10-day chunks; the staging condition is tested after each
   chunk and the boundary check is logged whether or not staging
   fires (see (b)). The policy-RNG restart quirk is unchanged
   (both legs chunk identically; determinism proof is
   chunked-vs-chunked).
3. **Staging:** pickQuad (relaxed, (b)) + gearUp + packStage +
   startExpedition ×4 + pinQuadParty + staged leader HP +
   single-monster pool override + `expeditionMonster` loop (max 30
   calls to a fight or a gate fire). The staged door is ONE pool
   door per scored seed, rotated over the 12 doorstage pool doors
   by band position (pilot seed i → pool door (i mod 12) + 1;
   confirm seeds continue i = 8..15). Leader HP and monster come
   from `evidence/2026-11-23/gatehorizon-reprereg-b-spec.json`
   (the 12 doorstage pool doors, re-frozen here as this arm's own
   spec — same monsters and leader HPs as gatehorizon-b-spec.json;
   the door seeds 424200–424211 are NOT reused, the spec rows
   are). The pool override is restored immediately after staging.
4. **Resume:** chunked `runDays` continues to day 150 (death-aware:
   `runDays` stops when `Game.over`; no dead village is ticked to
   fill a horizon).
5. **End snapshot per seed per leg:** `won`, `scaleRank`,
   `gameDays`, `endReason`, `deaths` (all death-tele entries merged
   across chunks, with cause), `waveKillLog` wave-4 kills (total +
   downstream of the staging day), staged-leader alive at end,
   gate-fire totals (`hpgateFires` / `leaderhpgateFires` /
   `leaderprojFires`), `gateAvoidNotes` + `gateAvoidLog`,
   `v4encounters` (every wave-4+ fight row, staged + organic, with
   leader entry HP, `pinned`, `leaderDied`, `leaderDiedLog`),
   `stagedDoor` (spec row, staging day, fought/refused, outcome,
   leader died by both readings, `widenedN`, at-door armor),
   `stagingChecks` (the boundary log, (b)), `scored` +
   `unscoredReason`.

## Seed bands

**Band 109201–109216 (16 seeds): pilot 109201–109208, confirm
109209–109216 (confirm only on pilot GO).** Freshness check (per the
seed-band skill, run before freezing):

- Grep of `evidence/*/sim-*-prereg.md` for `1092[0-9][0-9]` → zero
  hits; for the exact band `10920[1-9]` / `10921[0-6]` → zero hits;
  for the pilot seeds individually → zero hits.
- Grep of all of `evidence/` (`.md` + `.json`) for `10920[1-9]` /
  `10921[0-6]`: the only hits are NOT seed reservations — a float
  `0.014777109211372971` in `evidence/2026-10-19/snareteach-panel-compare.json`,
  a stateHash hex fragment `...81092011cb1892` in
  `evidence/2026-10-21/garden-controller-diagnostics-r1.json`, and
  a calorie count `pantryKcal: 109213` in
  `evidence/2026-10-20/perseed-retagrot-confirm/control-lead.json`
  (plus the same shapes in sibling Oct files). None is a seed or a
  band reservation. Recorded here so a later grep does not mistake
  a metric value or hash fragment for a reservation — the same
  transparency treatment gatehorizon-b gave its 109105 note.
- Known-held bands do not collide: Loop A 107617–107669, B 107533–
  107581, B 107471–107494, gatehorizon-b 109101–109116 (USED — do
  not reuse; this arm's predecessor band), journey-establishment
  r274 109001–109008.
- No prereg names a separate forbidden / contaminated list this
  band collides with (the forbidden-list hits in older preregs name
  74xxx/78xxx bands).

## Frozen bars (a miss is NO-GO, never re-scored)

Judged by `scripts/analyze-gatehorizon-reprereg-b.js` (NEW — same
shape as the gatehorizon-b analyzer, with the attribution rule
changed) over the two horizon corpus dirs, plus the proof battery
below and the balanced-panel compare for M5. All counts are over
SCORED seeds only (unscored seeds are reported, never scored).

**GO requires ALL of:**

- (M1) **Port gate:** `test-allyslot3-b.js` 18/18 on this tree.
- (M2) **Staged pin proof** (`scripts/test-pinquaddoor-b.js`): 35/35.
- (M2w) **Wide-instrument proof** (`scripts/test-pinquaddoor-wide-b.js`
  + analyzer selftest): 16/16.
- (M3) **Damage proof** (`scripts/test-dmgpin-b.js`): 29/29.
- (M3d) **Staying proof** (`scripts/test-doorflee2-b.js`): 49/49.
- (M3e) **Downedtwice regression** (`scripts/test-downedtwice-b.js`):
  exit 0, **25/25**.
- (M3f) **Floor proof** (`scripts/test-hypofloor-b.js`): 48/48.
- (M3g) **Whole-party gate proof** (`scripts/test-hpgate-b.js`): 43/43.
- (M3h) **Leader-gate proof** (`scripts/test-leaderhpgate-b.js`): 50/50.
- (M3i) **Projection-gate proof** (`scripts/test-leaderproj-b.js`):
  55/55.
- (M3j) **Durable-log proof** (`scripts/test-gateavoid-b.js`): 36/36.
- (M3k) **Screen proof** (`scripts/test-gateavoid-screen-b.js`): 11/11.
- (M3m) **Re-prereg proof** (`scripts/test-gatehorizon-reprereg-b.js`,
  NEW): count recorded at build (the post-freeze run is the judged
  one) — chunked-vs-chunked determinism (same 10+10 chunks twice →
  identical end-state hash); staging pre-checks (pack-armor staging
  leaves all four members armed + armored at the door on a fixture;
  a member staged unarmored is replaced, never fought unarmored);
  staged door refused on armed / fought on control on a fixture
  door (leader 55, audit, collapse2); relaxed-quad staging (a
  fixture with fewer than 4 ranging villagers still stages from
  the widened pool, with `widenedN` recorded); boundary logging
  (every chunk boundary before staging carries a `stagingChecks`
  entry with the exact wait reason; a won-before-staging smoke
  records `unscoredReason: won`, never `dead`); deaths-log
  attribution (§7: the flag reads 0/0 while the deaths-log rule
  reads 9/4 on the committed gatehorizon-b corpora, and the
  analyzer reproduces those counts from the raw corpus fields);
  horizon corpus shape carries every D5 field plus the horizon
  extras (`stagedDoor`, `leaderAliveAtEnd`,
  `wave4KillsDownstream`, `starvationDeaths`, `stagingChecks`);
  analyzer selftest.
- (Analyzer selftest) `analyze-gatehorizon-reprereg-b.js --selftest`
  (target: count recorded at build, all green).
- (M4) **Panel bars (control vs armed +LEADERPROJ, same seeds, same
  substrate):**
  - (H1a) **Pool-door leader deaths, PRIMARY — DEATHS-LOG
    ATTRIBUTION:** total attributed pool-door leader deaths
    (staged + organic, pinned + unpinned, per rule (a) above)
    across scored seeds. Armed ≤ control − 1 (at least one fewer
    pool-door leader death on the armed leg).
  - (H1b) **Downstream wave-4 kills, CO-PRIMARY:** total wave-4
    kills with `d` after the staging day (plus the staged-door
    kill, if any) across scored seeds. Armed ≥ control − 1 (at
    most one kill lost to trajectory noise after the legs
    diverge).
  - (D5) **Substrate sanity:** every corpus file carries
    `anchorCommit` equal to the frozen anchor (see "Anchor rule")
    and `arm` equal to `gatehorizon-reprereg-b` and `policySha` =
    capable.js sha `4c4d1535d76c` (first 12) and `basePolicySha` =
    competent.js sha `1884c8852d38` and `pinquadFlag` '1' AND
    `dmgpinFlag` '1' AND `doorflee2Flag` '1' AND `hypofloorFlag`
    '1' AND `hpgateFlag` '1' (BOTH legs) AND `leaderhpgateFlag`
    null (BOTH legs) AND `leaderprojFlag` null (control) / '1'
    (armed) AND `leaderprojFires` / `leaderhpgateFires` /
    `hpgateFires` as numbers AND `gateAvoidNotes` /
    `gateAvoidLog` as arrays AND `slotPresent` + `pinPresent`
    true AND `stagedDoor` present on scored seeds AND
    `stagingChecks` an array with one entry per chunk boundary
    before staging AND every wave-4+ row carries `leaderDiedLog`
    as a boolean equal to the deaths-log recomputation.
  - (D6) **Durability:** per leg, the durable log is COMPLETE —
    `gateAvoidLog` length equals the total gate fires
    (`hpgateFires + leaderhpgateFires + leaderprojFires`) AND the
    per-kind log counts equal the per-kind counters, with no entry
    of unknown kind. A D6 miss means the log itself is broken and
    the horizon cannot be trusted — verdict NO-GO kind METRIC-BROKEN
    regardless of H1a/H1b.
  - **SUPPLY rule (frozen):** the pilot judges only if scored ≥ 6 of
    8; the confirm (16 total) judges only if scored ≥ 12 of 16.
    Below that the verdict is DIAG-NO-GO kind SUPPLY-THIN, not a
    lever failure. If the CONTROL leg yields ZERO attributed
    pool-door leader deaths on the pilot, H1a is unpassable even with
    a perfect gate — the verdict is then NO-GO kind METRIC-BROKEN
    (the gateavoid-b shape: the bar presumes bad outcomes to reduce).
- (M5) **Guardrail — no regression:** the balanced-panel compare
  (`scripts/build-pinquaddoor-b-panels.js` reused verbatim +
  `node scripts/balance-panel.js compare`) returns
  `review_required` with NO `regression_signal` on village deaths,
  AND the scalemetric cost bar holds: starvation deaths (cause
  `'starvation'`) armed ≤ control + 2 (totals across scored seeds),
  village deaths armed ≤ control + 2, median survival (gameDays)
  armed ≥ 0.8 × control. A `regression_signal` on village deaths or
  any breached cost bar is NO-GO.

A miss on any of M1–M5 is NO-GO, never re-scored against a friendlier
metric. If the metric proves wrong, write it under "metric review" and
propose the revision for the NEXT run. A NO-GO is classified per §14a
(CONCEPT-DEAD / METRIC-BROKEN / SUBSTRATE-MISSING / SUPPLY-THIN) in
the evidence file's verdict section.

## Secondary (REPORTED, not binding — do not re-score the primaries)

- (S1) Staged-leader alive at horizon end, per leg (armed − control).
- (S2) Staged-door leader deaths per leg (control vs armed), by BOTH
  readings (`leaderDied` flag vs `leaderDiedLog`).
- (S3) Staged-door table: per scored seed — staging day, spec door,
  monster, leader HP, fought/refused, outcome, rounds, dealt, leader
  died (both readings), at-door armor P per member, `widenedN`.
- (S4) Organic pool-door census: organic wave-4+ fights with leader
  ≤ 75 HP per leg, outcomes, attributed deaths.
- (S4b) Pinned/unpinned split of attributed deaths per leg (the
  coverage diagnostic: deaths the gate could see vs deaths it
  could not).
- (S4c) vDie rows at ≤75 HP with NO same-day monster death, per leg,
  with the same-day death cause named (what the rule excludes).
- (S5) Wave-4 kills per seed (total + downstream), wave-5 kills.
- (S6) Wall numbers (measurable on this instrument — real 150d sims):
  wins, national reach, table (invited / entered), wave-4–5 unlocks,
  median / max survival, death-cause shares.
- (S7) Gate-fire census per leg: `hpgateFires` + `leaderhpgateFires` +
  `leaderprojFires` summed, plus the durable log; log-vs-notes gap.
- (S8) Unscored seeds: exact reason per seed (`won` / `lost` /
  `no-unlock` / `no-quad` / `unstageable`).
- (S8b) Staging-boundary census: per unscored seed, the last boundary
  check (day, unlockedWave, eligibleRanging, eligibleTotal,
  decision); per scored seed, how many boundaries waited and why.
- (S9) Pacing: mean deliberate verbs/day, ticks/day (from the merged
  runDays pacing), per leg.

## Base + substrate (verified, not assumed)

- Base: worktree HEAD `dbe748d46` at arm start (the 1730Z adoption
  tip). The LEADERPROJ lever, the GATEAVOID durable log, PINQUAD,
  DMGPIN, DOORFLEE2, HYPOFLOOR, HPGATE are all ON this base (landed
  on master; zero `src/` changes in this arm). The gatehorizon-b
  driver/analyzer/test are on this base (merged `9f329a6a5`) — this
  arm copies them under new names and changes only the instrument
  (attribution, staging, boundary log); it does not depend on any
  unmerged tree.
- **Policy frozen:** `scripts/policies/capable.js` sha256
  `4c4d1535d76c8327d40e746ede8f09d97ee26d7451b6daabb401d409e05443ff`
  (first 12: `4c4d1535d76c`) — verified live on this base at freeze
  time (2026-11-23 19:05 UTC). Base policy
  `scripts/policies/competent.js` sha256
  `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
  (first 12: `1884c8852d38`) — identical to the four prior arms.
- Substrate flags (both legs):
  `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1
  LAUNCHSURVIVE=1 ALLYSLOT3=1 PINQUAD=1 DMGPIN=1 DOORFLEE2=1
  HYPOFLOOR=1 HPGATE=1`. Armed leg adds `LEADERPROJ=1` only.

## Anchor rule (the gatehorizon-b rule, adapted for the re-prereg commit)

- This arm's task brief directs the prereg to be COMMITTED before
  the judged legs run. The commit that adds this prereg (+ the spec
  JSON) therefore becomes the legs' anchor: the driver stamps
  `anchorCommit` as `git rev-parse HEAD` at load time, and HEAD at
  leg time MUST be that prereg commit (it adds only this file + the
  spec JSON — zero code changes vs the frozen base `dbe748d46`). The
  evidence records the prereg commit's full sha and verifies
  `anchorCommit` on EVERY corpus file against it; a mismatch voids
  that leg.
- **Nothing else is committed before the judged legs run** — the
  instrument (driver + analyzer + proof test) stays uncommitted
  during the legs; its content is frozen by sha, recorded in the
  evidence. The final commit (instrument + corpora + panel +
  evidence) happens only AFTER the legs + evidence are written.
- **If anything is committed before the judged legs besides the
  prereg + spec, the legs must be re-run after a dated prereg
  CORRECTION** — never amend the expected anchor post-hoc.

## Instrument (the re-prereg driver is new; the panel builder is reused verbatim)

- Driver: `scripts/gatehorizon-reprereg-driver-b.js` — NEW (copy of
  `gatehorizon-driver-b.js` with the (a)/(b)/(d)/(e) changes above;
  `arm: 'gatehorizon-reprereg-b'`). Per seed per leg: load +
  setupGame + capable policy + fieldFight wrap; chunked runDays(10)
  to the staging condition (cap day 120) with a boundary log entry
  per chunk; stage one pool door (relaxed quad + pack-armor fix +
  pre-checks + replacement tries); restore the pool override;
  chunked runDays to day 150; end snapshot with both death
  readings + `stagingChecks`; one corpus file per seed per leg in
  the pinquaddoor corpus shape
  (`gatehorizon-reprereg-b-s<seed>-gatehorizon-reprereg-b-pinquaddoor.json`)
  + the horizon extras. Refuses to overwrite, exit 3. `writeRobust`
  for the flap.
- Analyzer: `scripts/analyze-gatehorizon-reprereg-b.js` — NEW (H1a
  deaths-log attribution + D5 `stagingChecks`/`leaderDiedLog`
  checks + S4b/S4c/S8b censuses + `--selftest`). The gatehorizon-b
  analyzer is NOT reused: it judges the broken flag.
- Proof tests: `scripts/test-allyslot3-b.js` (M1),
  `scripts/test-pinquaddoor-b.js` (M2),
  `scripts/test-pinquaddoor-wide-b.js` (M2w),
  `scripts/test-dmgpin-b.js` (M3),
  `scripts/test-doorflee2-b.js` (M3d),
  `scripts/test-downedtwice-b.js` (M3e),
  `scripts/test-hypofloor-b.js` (M3f),
  `scripts/test-hpgate-b.js` (M3g),
  `scripts/test-leaderhpgate-b.js` (M3h),
  `scripts/test-leaderproj-b.js` (M3i),
  `scripts/test-gateavoid-b.js` (M3j),
  `scripts/test-gateavoid-screen-b.js` (M3k) — on master already,
  run verbatim;
  `scripts/test-gatehorizon-reprereg-b.js` (M3m, NEW — see "Frozen bars").
- Panel: `scripts/build-pinquaddoor-b-panels.js` — REUSED VERBATIM
  (`RUN=gatehorizon-reprereg-b CORPUS_PREFIX=gatehorizon-reprereg-b
  node scripts/build-pinquaddoor-b-panels.js --out
  evidence/2026-11-23/gatehorizon-reprereg-b-panel --before
  evidence/2026-11-23/perseed-gatehorizon-reprereg-b-control --after
  evidence/2026-11-23/perseed-gatehorizon-reprereg-b-armed --seeds
  <band seeds> --before-seeds <same>`) +
  `node scripts/balance-panel.js compare`; the compare `.md` is
  attached to the evidence file. Corpus filenames follow the
  builder's pattern
  (`gatehorizon-reprereg-b-s<seed>-gatehorizon-reprereg-b-pinquaddoor.json`).

## Proofs (to run after freezing, before judged legs, on this tree)

- M1 `test-allyslot3-b.js` **18/18** (target).
- M2 `test-pinquaddoor-b.js` **35/35** (target).
- M2w `test-pinquaddoor-wide-b.js` **16/16** (target).
- M3 `test-dmgpin-b.js` **29/29** (target).
- M3d `test-doorflee2-b.js` **49/49** (target).
- M3e `test-downedtwice-b.js` **exit 0, 25/25** (target).
- M3f `test-hypofloor-b.js` **48/48** (target).
- M3g `test-hpgate-b.js` **43/43** (target).
- M3h `test-leaderhpgate-b.js` **50/50** (target).
- M3i `test-leaderproj-b.js` **55/55** (target).
- M3j `test-gateavoid-b.js` **36/36** (target).
- M3k `test-gateavoid-screen-b.js` **11/11** (target).
- M3m `test-gatehorizon-reprereg-b.js` (target: count recorded at
  build; the post-freeze run is the judged one).
- Analyzer selftest `analyze-gatehorizon-reprereg-b.js --selftest`
  (target: count recorded at build, all green).

## Expectation (not a bar)

Pre-staging trajectories are identical on the two legs (same seed,
same policy, same substrate except the gate; the gate cannot fire
before a wave-4+ door is met, and wave 4 is locked until unlock).
The staged door is the designed divergence. On the OLD band the
fixed attribution reads control 9 / armed 4 — H1a WOULD have
passed there (4 ≤ 8) while H1b would still have failed (14 vs 37)
and supply would still have bound first (5/8). That is an
expectation about the old band only: the new band is fresh, the
gate's coverage gap (unpinned deaths) may still dominate H1a, and
the relaxed quad may or may not lift supply to 6/8. **If the pilot
supply is still thin (<6/8 scored), that is a DIAG-NO-GO
SUPPLY-THIN verdict, not a reason to re-run the same band — say so
and stop; do not burn a confirm on a supply failure.** If control
attributed pool-door leader deaths land at 0 on the pilot, H1a is
unpassable even with a perfect gate — the verdict is then NO-GO
kind METRIC-BROKEN, and the evidence must say so rather than
re-scoring. If the re-prereg shows the gate still refuses winnable
doors, say so plainly — that is the verdict, not a failure to
re-measure.

## Legs log + evidence discipline

- Legs tee to `evidence/2026-11-23/gatehorizon-reprereg-b-legs.log`
  (one JSON line per seed per leg + EXIT lines; fallback recovery).
- Evidence: `evidence/2026-11-23/sim-gatehorizon-reprereg-b.md`
  (verdict, frozen-bar table, staged-door table, horizon table per
  seed, boundary census, wall numbers, sense-test transcript read,
  metric review) + `gatehorizon-reprereg-b-panel.md` + panel JSONs
  + analysis JSON (analyzer --json over each corpus dir).
- `check.js --quick`: NOT run by this arm (zero `src/` changes;
  the gate is already on master and the prior arms' gates cover
  it). The proof battery above is the gate for this arm.
- Write flap: intermittent EPERM on fresh-file writes is active
  this week (windows Nov 19–21, brief blips + long blocks, all
  clearing on their own, nothing lost). Probes run before writes
  that matter; the driver uses write-robust paths; a blocked final
  commit leaves files on disk intact for coordinator adoption,
  never forced. Never remove an index.lock on a ps grep alone.
- Git slowness: index-touching git commands can run minutes under
  hot-tree load. Prefer commit-to-commit reads (`git show` /
  `git diff <commit> <commit>`) and `git grep`, which stay fast.
- VM replacement: if a process dies or the machine restarts under
  this run, re-establish state from disk and report it — do not
  redo finished work silently.

## Metric review (adopted — this run is judged as frozen)

- **H1a now counts deaths the gate cannot prevent.** The deaths-log
  rule counts organic unpinned deaths alongside staged pinned ones,
  because the 1730Z evidence showed that is where leaders actually
  die. The bar (armed ≤ control − 1) therefore measures the gate's
  effect against the whole pool-death population, not just its
  coverage. A fail can mean the gate is weak OR its coverage is
  narrow; the S4b pinned/unpinned split is the diagnostic that
  separates the two, and the evidence must name which it is before
  classifying the NO-GO. This is deliberate: a gate that only
  protects doors leaders don't die at is a coverage finding, and
  the horizon judge should say so.
- **H1b's −1 tolerance is a noise allowance, stated before the run.**
  After staging, the legs' RNG streams diverge (the staged fight
  consumes RNG on control only), so organic wave-4 kills are
  independent trajectories from the same pre-staging state — a
  one-kill difference either way is noise, not signal. A larger gap
  is reported in the metric review, not absorbed by the tolerance.
- **The staged door is the intervention; organic doors are the
  context — and now both count in H1a.** The per-seed table
  separates staged from organic attribution and pinned from
  unpinned, so a reader can see which moved.
- **The panel's villageDeaths is all deaths in the 150d run** (the
  per-seed `deaths` array) — the guardrail prices whether the gate
  kills more villagers over a horizon, not per staged door.
  Starvation and median survival ARE measurable here (real day
  loop, real pantry) — nothing is faked or marked not-measurable.
- **H1a/H1b are judged on scored seeds only.** Unscored seeds
  (`won` / `lost` / `no-unlock` / `no-quad` / `unstageable`) are
  reported with reasons and their boundary checks; they neither
  help nor hurt the bars. The supply rule bounds how many unscored
  seeds the run can absorb before it stops judging.
- **The synchronous flag is kept, not deleted.** `leaderDied`
  stays on every row so the old-vs-new contrast (0/0 vs 9/4 on the
  old band) remains checkable from the corpus itself; it is never
  used by any bar in this prereg.

## Files

- Prereg: `evidence/2026-11-23/sim-gatehorizon-reprereg-b-prereg.md` (this file)
- Spec: `evidence/2026-11-23/gatehorizon-reprereg-b-spec.json` (the frozen
  12-door pool table, machine-readable — same rows as gatehorizon-b-spec.json)
- Instrument: `scripts/gatehorizon-reprereg-driver-b.js` (NEW),
  `scripts/analyze-gatehorizon-reprereg-b.js` (NEW),
  `scripts/test-gatehorizon-reprereg-b.js` (NEW, M3m),
  `scripts/build-pinquaddoor-b-panels.js` (reused verbatim)
- Corpora (fresh, judged): `evidence/2026-11-23/perseed-gatehorizon-reprereg-b-control/`
  + `...-armed/` (one file per seed per leg)
- Analysis: `evidence/2026-11-23/gatehorizon-reprereg-b-analysis.json`
  (analyzer --json over both corpus dirs) + `gatehorizon-reprereg-b-panel.md`
  + panel JSONs
- Evidence: `evidence/2026-11-23/sim-gatehorizon-reprereg-b.md`
- Leg log: `evidence/2026-11-23/gatehorizon-reprereg-b-legs.log`
- `src/` diff: NONE. No default flip.
