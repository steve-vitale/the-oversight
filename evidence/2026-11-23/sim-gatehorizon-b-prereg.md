# sim-gatehorizon-b — FROZEN prereg (Loop B run fleshout-loop-b-20261123T1430Z)

**Frozen:** 2026-11-23 ~09:15 UTC, BEFORE any judged leg. Base master
`43ebee38c` (worktree HEAD at freeze: journey-establishment r274). Branch
`sim-gatehorizon-b`, worktree `~/workspace/worktrees/sim-gatehorizon-b`.
Run `fleshout-loop-b-20261123T1430Z`, arm `sim-gatehorizon-b` (the
150-DAY HORIZON judge of the leader-projection gate — the named next
step after doorstage-b).

## The question (what doorstage-b judged, and what it did NOT show)

Doorstage-b JUDGED D1 for the first time: 11 scored staged pool doors,
control bad 100% (6 flees, 5 deaths, 0 kills) → armed bad 0% (11 proj
fires), a 100-point drop against a 20-point bar. Its evidence (§10)
states plainly what it does NOT show:

1. Nothing about leaders above 75 HP (the safe controls still lost 2 of 4).
2. Nothing about the gate's effect over a 150-day horizon.
3. Nothing about whether refusing bad doors changes wave-4 kills, leader
   deaths, or survival over a run.

THIS arm judges (2) and (3). It does NOT re-judge D1. The gate is the
existing default-OFF policy instrument LEADERPROJ
(`src/js/villager-agency.js`); it stays OFF by default — this arm judges
only. Zero `src/js` changes in this arm.

## What was read first (do not re-measure what they answered)

- `docs/CANON.md` + `docs/MONSTER-WAVES.md` (wave-4 bands: damage 35–95,
  HP 850–1500, a 4–6 round fight; wave-5 bands: damage 50–130, HP
  1000–2200; wave-4 gate: standing ≥ 100 + the four readiness bars;
  wave-5 gate: standing ≥ 200 AND wave-4 faced).
- `evidence/2026-11-23/sim-doorstage-b.md` + its frozen prereg (D1 judged
  100pp; the 11-door scored pool; the door-10 win-plan-avoid lesson; the
  staged-door method this arm extends; the at-door armor observation).
- `evidence/2026-11-23/sim-gateavoid-b.md` + prereg (D1–D6 carried
  conceptually; the durable log `st.gateAvoids`).
- `evidence/2026-11-23/sim-gateavoid-doorrich-b.md` + prereg (organic
  pool-door supply is ~1 door per 8-seed band — the reason the horizon
  stages its door instead of screening for one).
- `docs/MEASUREMENT.md` §§9–12, 14–15 (staged method, pilot gate,
  death-aware horizons, metric binding, balanced panels).
- `~/workspace/custom-skills/local_seed_band_freshness/SKILL.md` — see
  "Seed bands" below.

## The mechanism (read from the sources, not taken on trust)

- The door-open decision lives in `expeditionMonster`
  (`src/js/villager-agency.js`). A pinned quad (`PINQUAD=1`, three pinned
  allies, `_pinDoor` true) meeting a wave-4+ monster passes three gates in
  order (HPGATE whole-party < 25 HP; LEADERHPGATE leader < 25 HP;
  LEADERPROJ leader projected ≤ 25 HP after two rounds at 25/round,
  i.e. leader HP ≤ 75) — each with the same avoid verb (encounter note +
  return, no fight, no flee, no death) and the same counter shape, plus
  the durable log entry in `st.gateAvoids`.
- BEFORE the projection gate, `winPlanFightGate` runs
  `winPlanOutmatched` (`src/js/win-plan.js:1648`): wave ≥ 4 AND (party
  < 3 OR not all armed OR not all armored) → avoid ("going back for
  help"). `gearOf` reads: armed = weapon bonus > 0 OR a weapon item
  carried in the pack; armored = `armorOf(person)` > 0. This is the
  door-10 gate: a staged quad with an unarmored member never reaches
  LEADERPROJ. The horizon staging pre-checks it (see "Staging").
- `fieldFight(vid, mdef, m, opts)` is the villager field-fight path
  (record: rounds, outcome, mDealt, vTaken, log). The horizon driver
  wraps it for the whole run — pure observation, no RNG, no state
  writes — to census every wave-4+ fight with its leader entry HP and
  whether the leader died in it.
- Wave-4 kills are read from `state.waveKillLog` rows `{d, mid, w, by,
  via, trick}` (`src/js/game.js` kill-attribution block): a wave-4 kill
  is a row with `w === 4`. Downstream kills are those with `d` after the
  staging day.
- `unlockedWave()` (`src/js/game.js`) is the wave gate the sim reads;
  wave 4 unlocks when standing ≥ 100 AND the four readiness bars hold
  (`villageStandingTotal()` holds at t4-1 while any bar is short).
- Deaths are captured live by the harness (`runDays` `_liveDeaths` from
  the `death` telemetry event: `{day, kind, who, cause, player}`).
  Starvation deaths carry cause `'starvation'` (`src/js/game.js`
  hurtVillager / playerDeath paths).

## THE STAGED-HORIZON DESIGN — frozen (the driver implements exactly this)

One 150-day `capable`-policy sim per seed per leg (two legs: control
gate OFF, armed `LEADERPROJ=1`), with ONE staged pool door injected
mid-run and the run then continued to the horizon:

1. **Load + policy:** `loadGame({seed})`, `setupGame`, policy `capable`
   (the default lever-work policy — real flee, abilities, scored
   choices, held talks, the Table; `scripts/policies/capable.js`).
   The driver installs the `fieldFight` wrap before the first day and
   keeps it for the whole run (both phases + staging).
2. **Chunked day loop:** `runDays(Game, capable, {days: 10})` in 10-day
   chunks. After each chunk, test the staging condition. Chunks are a
   driver composition, not a harness change: `runDays` is called
   repeatedly on the same `Game` (its `policy.setup` re-runs per chunk;
   `competent.setup` only sets `ctx.knownAtStart` — idempotent; the
   verb wrapping is guarded by `_verbWrapped`; the death capture is
   merged across chunks by the driver).
   - **Policy-RNG quirk (stated, not hidden):** `runDays` re-seeds
     `global.__policyRandom` from the manifest seed on every call, so
     the policy's random stream restarts at each 10-day chunk boundary.
     Both legs chunk identically (same seed, same pre-staging
     trajectory, same staging chunk), so the restart lands at the same
     points on both legs and the comparison stays matched. The
     determinism proof (M3m) is chunked-vs-chunked (same chunks twice
     → identical end state), NOT chunked-vs-single — a single 20-day
     runDays is a different policy-RNG stream by construction.
3. **Staging condition (first qualifying chunk boundary, cap day 120):**
   village alive (`!Game.over`) AND `unlockedWave() >= 4` AND a
   stageable quad exists (≥ 4 living ranging villagers — wanderer /
   explorer profile — not currently on an expedition, not the scholar).
   If the village dies or day 120 passes without staging, the seed is
   UNSCORED with its reason (`dead` / `no-unlock` / `no-quad`).
4. **Staging (the doorstage pattern, moved mid-run):** pickQuad + gearUp
   + startExpedition ×4 + pinQuadParty + staged leader HP + single-
   monster pool override + `expeditionMonster` loop (max 30 calls to a
   fight or a gate fire). The staged door is ONE pool door per scored
   seed, rotated over the 12 doorstage pool doors by band position
   (pilot seed i → pool door (i mod 12) + 1; confirm seeds continue
   i = 8..15). Leader HP and monster come from
   `evidence/2026-11-23/gatehorizon-b-spec.json` (the 12 doorstage pool
   doors, re-frozen here as this arm's own spec — same monsters and
   leader HPs; the door seeds 424200–424211 are NOT reused, the spec
   rows are). The pool override is restored immediately after staging.
5. **Door-10 fix (frozen):** before `startExpedition`, each quad member
   gets `hide_armor` + `hunting_spear` placed INTO their pack items
   (in addition to `gearUp` setting `equipped`) — `startExpedition`
   calls `villagerGearUp(vid, true)`, which re-equips from the person's
   OWN pack (`autoEquip`, `src/js/equipment.js`: "equipment comes from
   the person's own items, never conjured"), and `fieldFight` re-equips
   again at entry. The doorstage failure was that the issued kit was
   never in the pack, so autoEquip could not re-select it. Pre-check
   AFTER `startExpedition` (the at-door point): every member on an
   expedition (`st.exped[vid]` present), every member armed AND armored
   (the `gearOf` rule: weapon bonus > 0 or weapon carried; armorOf > 0).
   A failing member is replaced with the next ranging villager (up to 3
   replacement tries per slot); if staging still cannot satisfy the
   pre-check, the seed is UNSCORED with reason `unstageable` and the
   staged door is NOT counted. Budget: at most 1 unscored door per 12
   staged (doorstage §10) — on the 16-seed band, ≥ 12 of 16 scored or
   the run is SUPPLY-THIN (see "Supply rule").
6. **Resume:** chunked `runDays` continues to day 150 (death-aware:
   `runDays` stops when `Game.over`; no dead village is ticked to fill
   a horizon).
7. **End snapshot per seed per leg:** `won`, `scaleRank`, `gameDays`,
   `endReason`, `deaths` (all death-tele entries merged across chunks,
   with cause), `waveKillLog` wave-4 kills (total + downstream of the
   staging day), staged-leader alive at end, gate-fire totals
   (`hpgateFires` / `leaderhpgateFires` / `leaderprojFires`),
   `gateAvoidNotes` + `gateAvoidLog`, `v4encounters` (every wave-4+
   fight row, staged + organic, with leader entry HP and leader-died
   flag), `stagedDoor` (spec row, staging day, fought/refused,
   outcome, leader died), `scored` + `unscoredReason`.

**Pool-door leader-death attribution (frozen):** a leader death is
pool-door-attributed when a `v4encounters` row has wave ≥ 4 AND
leaderEntryHp ≤ 75 AND the leader (vid) is dead immediately after that
fight returns (checked in the wrap, before any later event can kill
them). The staged door is attributed the same way (its row carries
`staged: true`). Scholar-led fights are recorded but never attributed
(the scholar has no expedition path through this gate; LEADERPROJ
reads a villager expedition leader).

## Seed bands

**Band 109101–109116 (16 seeds): pilot 109101–109108, confirm
109109–109116 (confirm only on pilot GO).** Freshness check (per the
seed-band skill, run before freezing):

- Grep of `evidence/*/sim-*-prereg.md` for `1091[0-9][0-9]` → zero hits;
  for the exact band `10910[1-9]` / `10911[0-6]` → zero hits; for the
  pilot seeds individually → zero hits.
- Known-held bands do not collide: Loop A 107617–107669, B 107533–
  107581, B 107471–107494, journey-establishment r274 109001–109008.
- The word "forbidden" in older preregs is prose ("editing it is
  forbidden"), not a band list; no prereg names a separate forbidden /
  contaminated list this band collides with.
- Transparency note: the bare number 109105 appears in Oct-14 JSON
  artifacts (`sim-subaid-b-aa.json`, `sim-subaid-b-screen.json`) as a
  metric VALUE (`"?/?": 109105`), and 10910 as `arrears` / `need` /
  `carcassKcal` / `killedTotal` values — none of them is a seed or a
  band reservation, and no prereg names them. Recorded here so a later
  grep does not mistake a metric value for a reservation.

## Frozen bars (a miss is NO-GO, never re-scored)

Judged by `scripts/analyze-gatehorizon-b.js` (NEW — the horizon
question needs its own analyzer; the gateavoid analyzer judges
staged-door D1, not horizon deltas) over the two horizon corpus dirs,
plus the proof battery below and the balanced-panel compare for M5.
All counts are over SCORED seeds only (unscored seeds are reported,
never scored).

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
- (M3m) **Horizon proof** (`scripts/test-gatehorizon-b.js`, NEW): count
  recorded at build (the post-freeze run is the judged one) —
  chunked-vs-chunked determinism (same 10+10 chunks twice → identical
  end-state hash); staging pre-checks (pack-armor staging leaves all
  four members armed + armored at the door on a fixture; a member
  staged unarmored is replaced, never fought unarmored); staged door
  refused on armed / fought on control on a fixture door (leader 55,
  audit, collapse2); horizon corpus shape carries every D5 field plus
  the horizon extras (`stagedDoor`, `leaderAliveAtEnd`,
  `wave4KillsDownstream`, `starvationDeaths`); analyzer selftest.
- (Analyzer selftest) `analyze-gatehorizon-b.js --selftest` (target:
  count recorded at build, all green).
- (M4) **Panel bars (control vs armed +LEADERPROJ, same seeds, same
  substrate):**
  - (H1a) **Pool-door leader deaths, PRIMARY:** total attributed
    pool-door leader deaths (staged + organic, per the attribution
    rule above) across scored seeds. Armed ≤ control − 1 (at least
    one fewer pool-door leader death on the armed leg).
  - (H1b) **Downstream wave-4 kills, CO-PRIMARY:** total wave-4 kills
    with `d` after the staging day (plus the staged-door kill, if
    any) across scored seeds. Armed ≥ control − 1 (at most one kill
    lost to trajectory noise after the legs diverge).
  - (D5) **Substrate sanity:** every corpus file carries
    `anchorCommit` equal to the frozen anchor (see "Anchor rule") and
    `policySha` = capable.js sha `4c4d1535d76c` (first 12) and
    `basePolicySha` = competent.js sha `1884c8852d38` and
    `pinquadFlag` '1' AND `dmgpinFlag` '1' AND `doorflee2Flag` '1'
    AND `hypofloorFlag` '1' AND `hpgateFlag` '1' (BOTH legs) AND
    `leaderhpgateFlag` null (BOTH legs) AND `leaderprojFlag` null
    (control) / '1' (armed) AND `leaderprojFires` /
    `leaderhpgateFires` / `hpgateFires` as numbers AND
    `gateAvoidNotes` / `gateAvoidLog` as arrays AND `slotPresent` +
    `pinPresent` true AND `stagedDoor` present on scored seeds.
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
- (S2) Staged-door leader deaths per leg (control vs armed).
- (S3) Staged-door table: per scored seed — staging day, spec door,
  monster, leader HP, fought/refused, outcome, rounds, dealt, leader
  died, at-door armor P per member.
- (S4) Organic pool-door census: organic wave-4+ fights with leader
  ≤ 75 HP per leg, outcomes, attributed deaths.
- (S5) Wave-4 kills per seed (total + downstream), wave-5 kills.
- (S6) Wall numbers (measurable on this instrument — real 150d sims):
  wins, national reach, table (invited / entered), wave-4–5 unlocks,
  median / max survival, death-cause shares.
- (S7) Gate-fire census per leg: `hpgateFires` + `leaderhpgateFires` +
  `leaderprojFires` summed, plus the durable log; log-vs-notes gap.
- (S8) Unscored seeds: reason per seed (`dead` / `no-unlock` /
  `no-quad` / `unstageable`).
- (S9) Pacing: mean deliberate verbs/day, ticks/day (from the merged
  runDays pacing), per leg.

## Base + substrate (verified, not assumed)

- Base: master `43ebee38c` at arm start (worktree HEAD;
  journey-establishment r274). The LEADERPROJ lever, the GATEAVOID
  durable log, PINQUAD, DMGPIN, DOORFLEE2, HYPOFLOOR, HPGATE are all
  ON this base (landed on master; zero `src/` changes in this arm).
  The doorstage driver/test are NOT on this base (still in the 1230Z
  adoption tree) — this arm re-implements the staging pattern from the
  doorstage evidence + prereg (read-only reference), it does not depend
  on the adoption landing.
- **Policy frozen:** `scripts/policies/capable.js` sha256
  `4c4d1535d76c8327d40e746ede8f09d97ee26d7451b6daabb401d409e05443ff`
  (first 12: `4c4d1535d76c`) — verified live on this base at freeze
  time. Base policy `scripts/policies/competent.js` sha256
  `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
  (first 12: `1884c8852d38`) — identical to the three prior arms.
- Substrate flags (both legs):
  `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1
  LAUNCHSURVIVE=1 ALLYSLOT3=1 PINQUAD=1 DMGPIN=1 DOORFLEE2=1
  HYPOFLOOR=1 HPGATE=1`. Armed leg adds `LEADERPROJ=1` only.

## Anchor rule (the poolfirstfail lesson, frozen — adapted for the prereg commit)

- This arm's task brief directs the prereg to be COMMITTED before
  the judged legs run. The commit that adds this prereg (+ the spec
  JSON) therefore becomes the legs' anchor: the driver stamps
  `anchorCommit` as `git rev-parse HEAD` at load time, and HEAD at
  leg time MUST be that prereg commit (it adds only this file + the
  spec JSON — zero code changes vs the frozen base `43ebee38c`). The
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

## Instrument (the horizon driver is new; the panel builder is reused verbatim)

- Driver: `scripts/gatehorizon-driver-b.js` — NEW. Per seed per leg:
  load + setupGame + capable policy + fieldFight wrap; chunked
  runDays(10) to the staging condition (cap day 120); stage one pool
  door (pack-armor fix + pre-checks + replacement tries); restore the
  pool override; chunked runDays to day 150; end snapshot; one corpus
  file per seed per leg in the pinquaddoor corpus shape
  (`gatehorizon-b-s<seed>-gatehorizon-b-pinquaddoor.json`) + the
  horizon extras. Refuses to overwrite, exit 3. `writeRobust` for the
  flap.
- Analyzer: `scripts/analyze-gatehorizon-b.js` — NEW (H1a/H1b/D5/D6/
  guardrails + S1–S9 censuses + `--selftest`). The gateavoid analyzer
  is NOT reused: it judges staged-door D1, not horizon deltas.
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
  `scripts/test-gatehorizon-b.js` (M3m, NEW — see "Frozen bars").
- Panel: `scripts/build-pinquaddoor-b-panels.js` — REUSED VERBATIM
  (`RUN=gatehorizon-b CORPUS_PREFIX=gatehorizon-b node
  scripts/build-pinquaddoor-b-panels.js --out
  evidence/2026-11-23/gatehorizon-b-panel --before
  evidence/2026-11-23/perseed-gatehorizon-b-control --after
  evidence/2026-11-23/perseed-gatehorizon-b-armed --seeds
  <band seeds> --before-seeds <same>`) +
  `node scripts/balance-panel.js compare`; the compare `.md` is
  attached to the evidence file. Corpus filenames follow the
  builder's pattern
  (`gatehorizon-b-s<seed>-gatehorizon-b-pinquaddoor.json`).

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
- M3m `test-gatehorizon-b.js` (target: count recorded at build;
  the post-freeze run is the judged one).
- Analyzer selftest `analyze-gatehorizon-b.js --selftest` (target:
  count recorded at build, all green).

## Expectation (not a bar)

Pre-staging trajectories are identical on the two legs (same seed,
same policy, same substrate except the gate; the gate cannot fire
before a wave-4+ door is met, and wave 4 is locked until unlock).
The staged door is the designed divergence: doorstage's control
pool ran 5 deaths / 11 doors, so on 8 scored pilot seeds the control
leg should see ~3–4 staged-door leader deaths and the armed leg 0
from the staged door. Organic pool-door deaths add noise on both
legs. Wave-4 kills are rare (3 in 98 real fights in the fight-play
census) — expect 0–2 per leg total on the pilot; H1b's −1 tolerance
is the noise allowance, stated above. **If control pool-door leader
deaths land at 0 on the pilot, H1a is unpassable even with a perfect
gate** — the verdict is then NO-GO kind METRIC-BROKEN, and the
evidence must say so rather than re-scoring. If the staging condition
never fires (no unlock by day 120 on most seeds), the verdict is
DIAG-NO-GO kind SUPPLY-THIN — the horizon instrument cannot stage
what the sims will not unlock. If the staged-horizon instrument
proves unbuildable within the run (e.g. no game-code entry point
exists to stage a door mid-sim), report that honestly as an
instrument DIAG-NO-GO with the exact blocker and what was tried —
do not re-score, do not fake a verdict from staged loads alone.

## Legs log + evidence discipline

- Legs tee to `evidence/2026-11-23/gatehorizon-b-legs.log` (one JSON
  line per seed per leg + EXIT lines; fallback recovery).
- Evidence: `evidence/2026-11-23/sim-gatehorizon-b.md` (verdict,
  frozen-bar table, staged-door table, horizon table per seed, wall
  numbers, sense-test transcript read, metric review) +
  `gatehorizon-b-panel.md` + panel JSONs + analysis JSON (analyzer
  --json over each corpus dir).
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

- **H1a is a count bar, not a rate bar.** It presumes the control leg
  supplies pool-door leader deaths to reduce. The pilot's supply rule
  and the zero-control-deaths METRIC-BROKEN clause are the guards
  against judging a perfect gate on an empty pool.
- **H1b's −1 tolerance is a noise allowance, stated before the run.**
  After staging, the legs' RNG streams diverge (the staged fight
  consumes RNG on control only), so organic wave-4 kills are
  independent trajectories from the same pre-staging state — a
  one-kill difference either way is noise, not signal. A larger gap
  is reported in the metric review, not absorbed by the tolerance.
- **The staged door is the intervention; organic doors are the
  context.** H1a counts both, but the staged door is the designed
  divergence and the per-seed table separates staged from organic
  attribution so a reader can see which moved.
- **The panel's villageDeaths is all deaths in the 150d run** (the
  per-seed `deaths` array) — the guardrail prices whether the gate
  kills more villagers over a horizon, not per staged door. Starvation
  and median survival ARE measurable here (real day loop, real pantry)
  — unlike doorstage, nothing is faked or marked not-measurable.
- **H1a/H1b are judged on scored seeds only.** Unscored seeds (dead /
  no-unlock / no-quad / unstageable) are reported with reasons; they
  neither help nor hurt the bars. The supply rule bounds how many
  unscored seeds the run can absorb before it stops judging.

## Files

- Prereg: `evidence/2026-11-23/sim-gatehorizon-b-prereg.md` (this file)
- Spec: `evidence/2026-11-23/gatehorizon-b-spec.json` (the frozen
  12-door pool table, machine-readable)
- Instrument: `scripts/gatehorizon-driver-b.js` (NEW),
  `scripts/analyze-gatehorizon-b.js` (NEW),
  `scripts/test-gatehorizon-b.js` (NEW, M3m),
  `scripts/build-pinquaddoor-b-panels.js` (reused verbatim)
- Corpora (fresh, judged): `evidence/2026-11-23/perseed-gatehorizon-b-control/`
  + `...-armed/` (one file per seed per leg)
- Analysis: `evidence/2026-11-23/gatehorizon-b-analysis.json`
  (analyzer --json over both corpus dirs) + `gatehorizon-b-panel.md`
  + panel JSONs
- Evidence: `evidence/2026-11-23/sim-gatehorizon-b.md`
- Leg log: `evidence/2026-11-23/gatehorizon-b-legs.log`
- `src/` diff: NONE. No default flip.
