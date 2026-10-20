# sim-corpsewire-b — corpse-channel wire collection audit (backlog #633, MATERIALS leg)

Run: `fleshout-loop-b-20261019T2230Z` (loop B, second axis). Worker tree: `sim-corpsewire-b`.
Arm: the trapline MATERIALS gate — wirebootstrap's open ACQUIRE leg, reframed.
The learnability sub-gap is CLOSED; the snareteach lane and knower-presence
(game-code, steve-call) are other arms' work. This arm asks one question:
**does the base policy actually COLLECT wire from every corpse, or does
wire strand on carcasses?**

Canon read: docs/CANON.md + docs/BEAR.md (butchering yields, fat, the bear
fight) + docs/PRESERVATION.md. CRITICAL CANON CONSTRAINT (steve-call #674,
open): the bear is a FIGHT — bear kills are excluded from any new
butchering path. This arm is measurement-first; IF a gap exists, the fix
will be policy-side (CORPSEWIRE=1, default OFF, zero src/js changes).

## Pre-registration (metric binding, MEASUREMENT.md §14 — written before sims)

### Code reading (pre-sims, what the engine says)

- `carcassToMeat` (food.js:509) NEVER yields snare_wire: butchering converts
  gross kcal → ~500-kcal meat portions. No butchering path mints wire —
  wire is not a butchering yield anywhere in the engine (no animal or
  monster loot table names it; verified in `scripts/test-corpsewire-b.js`).
  "The corpse channel" is looting DEAD VILLAGERS, whose death packs hold
  their actual carried+stashed gear (corpses.js `generatePossessions`,
  Steve 2026-10-09 loot-as-action) — including spawn-kit snare_wire
  (10 holders / 8 seeds at spawn, wireacquire-b3 metric review).
- The base policy strips corpses via `lootCorpses` (competent.js:173): batch
  `corpseLootAll` (skipFn = human meat only — trembles), range-gated to the
  scholar's current tile (`_corpseCheckRange` quiet pre-check). One deliberate
  verb per corpse; `units >= 12` daily cap; overweight stacks left behind
  (wire is 0.05 kg — never the overweight item).
- Stranding paths available to the engine: (1) the corpse is out of range
  when `lootCorpses` runs — `lootCorpses` is called once per `daily()` and
  the range pre-check skips far corpses; other villagers' corpses stay where
  they fell (`recoverBearer` only recovers the dead SCHOLAR's body —
  corpses.js:893, ledger.js:690; it's a succession mechanic, not a cleanup
  crew); (2) the 40-corpse list cap splices stage-4 corpses out (wire
  decays with them); (3) `buryCorpse` sends unlooted packs into the ground
  ("grave goods" — corpses.js:879) — no policy or engine caller buries in
  sims (app.js UI only), so this path is 0 in sims but real in live play.
- Instruments (the b3 `spiritKnown` lesson applied): wrap `registerDeath`
  (record wire units riding each death pack — read-only, post-creation),
  wrap `_corpseTakeStack` (count wire units taken — read-only), wrap
  `buryCorpse` (count wire buried — read-only), scan `Game.corpses()` at
  day end. NEVER call `Game.tradeSpirit`, never enumerate the roster,
  zero game RNG consumed, zero game state written. Det-gate proves it
  (8/8 bit-identical, instrumented vs plain, leadfeast × 60d).

### Measurement sweep (no layer — the pilot IS this arm's first stage)

- **Primary**: wire units stranded on death packs — deposited on corpses but
  never collected (decayed with the corpse / left on unlooted corpses at run
  end). Measurement: `wireDeposited − wireLooted − wireBuried`, bucketed into
  looted / buried / stranded-on-corpse / decayed-unlooted.
- **GO (measurement→build gate)**: build the CORPSEWIRE sharpening layer iff
  stranded ≥ 3 units across the 16 runs AND ≥ 2 distinct runs show stranding
  (a gap worth a verb must be structural, not one unlucky corpse). Otherwise
  document the materials sub-gap as CLOSED with the measurements.
- **Horizon**: 180d death-aware (dead villages stop, +10d tail max).
- **Policies**: leadfeast / belongfeast (FEASTSCALE_R13=1, SEATDRIVE=0).
- **Seeds**: 31701–31708 (the wirebootstrap b2 substrate seeds, for
  comparability).
- **Guardrails** (bind only if the layer is built): median survival ≥
  control−10d; no new death mode (≥2-event rule); traps set ≥ control.
- **Wall** (report-only): national / table / wins, wave 4–5 unlocks,
  median/max survival.

### If the gap exists: CORPSEWIRE lever (policy-side, zero src/js)

`scripts/policies/corpsewire.js` (env-gated CORPSEWIRE=1, default OFF): a
sharpening pass that collects wire the base looting leaves — e.g. loot
unlooted corpses encountered during wild travel (the daily `lootCorpses`
runs once and only loots the scholar's tile; corpses on forage/fight nodes
strand). Pre-registered primary: mechanism-attributed wire-sets — runs
with ≥1 wire collection through the layer (cwWireLooted > 0) ≥ 3/16 runs.
Guardrails per above. Pilot 8 seeds; confirm 12–16 only on pilot GO.
Black bears EXCLUDED per steve-call #674 — the layer never routes a bear
kill through anything; bear = fight, full stop.

## Lever played

`scripts/policies/corpsewire.js` (policy-side, zero src/js, default OFF,
env-gated CORPSEWIRE=1):

**Check bodies you walk past.** After every successful `travelTo`, run the
SAME in-range loot pass the base runs in `daily()` (same range gate, same
human-meat skip, same deliberate `corpseLootAll` verb) — plus an honest
approach: a corpse the scholar KNOWS about (`deathKnown`) on the current
tile gets walked to (`microMove`, 1 tick/step, max 6 steps) before the
check. No new verbs, no omniscience. Per-day cap (4 corpses beyond the
base pass); no looting mid-combat. Black bears EXCLUDED per steve-call
#674 — the layer only loots corpse packs the engine already made; bear
death packs carry no wire by construction (proven in the test).

Design drivers (from the strand autopsy, scripts/probe-corpsewire-strands.js):
the scholar visited the strand nodes 12–140 days after each death without
ever checking the body — the base loot pass runs once per `daily()` and
only sees corpses in range at that moment. The gap is TIMING, not
willingness.

## Measurement (no layer — the wire flow, 16 runs)

`sweep-corpsewire-b.js`: seeds 31701–31708 × {leadfeast, belongfeast},
180d death-aware, FEASTSCALE_R13=1 / SEATDRIVE=0.

| flow | units |
|---|---|
| wire on living villagers at spawn (carried+stashed) | 20 (20 holders) |
| wire latent in fullPool (never carried) | 20 |
| wire deposited on death packs | 8 (8 corpses) |
| wire looted by the base policy | 5 |
| wire stranded on unlooted corpses | 3 (3 runs) |
| wire buried / decayed | 0 / 0 |

Accounting identity: 8 = 5 + 0 + 3 + 0 (exact, per-corpse).
Build gate: stranded ≥3 AND ≥2 runs → **BUILD** (3 units, 3 runs).

Code facts pinned by `scripts/test-corpsewire-b.js` (12/12 GREEN):
- `carcassToMeat` never yields wire; no animal/monster loot table names it.
- Monster packs (incl. black_bear) and animal packs never carry wire.
- Held wire rides the death pack (sapient gear rule) — with one wrinkle:
  `generatePossessions` dedupes gear by id and pushes units:1, so a
  villager carrying 2 coils deposits 1 (death-conversion strand, engine
  design, not the looting question).
- `corpseLootAll` collects the wire; `buryCorpse` strands unlooted wire in
  the ground (grave-goods mechanic — real in live play, 0 in sims since
  nothing buries).

Strand autopsy (the 3 cases): scholar visited the node 12–140 days after
the death, `deathKnown=true` throughout, 0 loots. The base pass never saw
them (daily-time range gate).

## Proof

`scripts/test-corpsewire-b.js` — **18/18 GREEN**:
- Mechanics (12): butchering mints no wire; no wire in monster/animal data
  or packs (incl. black_bear); held wire → death pack → lootable →
  collected; burial strands it; instruments RNG-clean (never tradeSpirit,
  zero game state writes, instrumented vs plain identical).
- Layer (6): gate-off returns base unchanged (strict no-op); gate-on
  arrival walks to the known corpse and collects the wire
  (`_cwWireCollected=1`); RED without the layer the strand is real;
  quiet pass fires zero verbs and zero tradeSpirit; per-day cap honored;
  no looting mid-combat.

Det-gate `scripts/det-gate-corpsewire-20261019.js`: **8/8 identical**
(instrumented vs plain, leadfeast × 60d) — instruments consume zero RNG,
write zero game state. Layer det-gate: gate-off 16/16 identical; gate-on
runs with zero layer loot verbs bit-identical to control (see below).

## Before/after (16 runs/arm: seeds 31701–31708 × {leadfeast, belongfeast}, 180d death-aware)

`sweep-corpsewire-armed-b.js`. CORPSEWIRE=1 armed; unset = control.

| metric | control | armed | verdict |
|---|---|---|---|
| mechanism-attributed wire collections, runs (PRIMARY) | 0/16 | 0/16 | MISS (bar ≥3/16) |
| layer loot verbs fired | — | 41 | the layer acted, collected nothing |
| wire deposited on death packs | 8 | 2 | trajectories diverged (see below) |
| wire looted (total) | 5 | 0 | — |
| wire stranded | 3 | 2 | — |
| runs with first-trap ≤ d30 | 0/16 | 0/16 | — |
| total traps set | 37 | 0 | guardrail MISS (bar ≥ control) |
| trapline kcal | 26,150 | 0 | — |
| median survival (days) | 158 | 79 | −79d — guardrail MISS (bar −10d) |
| starvation deaths | 4 | 11 | guardrail MISS (paired fails) |
| national / table / wins | 0/0/0 | 0/0/0 | — |
| wave max | 4 | 4 | — |

Every armed run ended village-lost (16/16), all earlier than its control
pair. Death causes: dehydration 51 (control 4), combat 209, villager
combat 99 — the scholar stopped drinking and foraging.

**Harm mechanism (diagnosed, not guessed):** the layer's approach walked
the scholar toward known corpses with up to 6 unbounded micro-steps per
corpse per arrival — measured ~2,547 micro-steps on leadfeast s31702
(vs ~0 from the base policy, which never microMoves). Each step costs
kcal + 1 tick and fires monster/animal turns; the approach is NOT covered
by the per-day loot cap (the cap counts loots, not walks). The scholar
spent its days walking to bodies instead of working the food economy:
traps 37→0, dehydration 4→51. A diagnostic variant with the approach
disabled (microMove refused) still diverged — the displacement starts at
the first walk.

The layer collected ZERO wire on all 16 runs — including the 3 strand
seeds, where the armed trajectories collapsed (d83/d79/d105) before the
mechanism could engage. The 0/16 is confounded by the harm: the pilot
measures a harmful layer, not a working one.

## §15 balanced-panel compare

`scripts/build-corpsewire-panels-b.js` →
`evidence/2026-10-19/corpsewire-panel-b.{md,json}` (+ `-before.json.gz` /
`-after.json.gz`). Panel decision: **review_required** — leadfeast
communityLost **regression_signal** (+0.5, CI [0.125, 0.875]),
survival60 regression_watch on both policies. The panel is the instrument;
the pre-registered threshold is the judge. The instrument confirms the
harm the telemetry shows.

Telemetry deviation check vs `telemetry-baselines/scale-wall.json`: LOUD
on national/table/wins — the known pre-seat regime artifact (b2 §5, b3
§7). Not investigated.

## Village assessment

What the villages looked like: 16 control villages, median life 158 days,
wave 4 reached across the board, all ending village-lost to combat except
the four 180-day survivors. The corpse wire economy is small but real:
20 wire units sat on living villagers at spawn (carried+stashed), 8
reached death packs, the base policy collected 5, 3 stranded on bodies the
scholar walked past for weeks. The armed villages are a different story:
16/16 dead by day 113, median 79 — not to the wave-4 wall but to thirst
and unravelled routines. The trapline, which paid 26k kcal in control,
never engaged once under the layer.

Who thrived and died and why: in control, villages died to combat at the
wave-4 wall (the standing story on this substrate). Under the layer, the
scholar's days were consumed by corpse-walking: 51 dehydration deaths
against 4 in control. Nobody reached national/table/wins on either arm
(pre-seat substrate regime).

What knowledge was missing: the wire-tackle path (wire → improvised
2-use snare, no recipe) is engine-real and the base policy uses it
(trapsWireSet=3 in control) — but the ACQUIRE side's corpse channel leaks
3 units per 16 runs through a timing gap (the daily loot pass only sees
corpses in range at daily-time). The blank is confirmed, bounded, and —
after this arm — known to resist policy-side fixing by approach.

## Sense section (SENSE-TESTING LAW — transcripts read, not just counted)

Two control transcripts (belongfeast s31702/s31708, 35d, narration on)
plus the strand autopsy:

1. **The strand reads as a human omission, not a bug.** Wanjiru Kamau's
   body lay one tile north of haven from day 30; the scholar passed that
   tile 140 days running and never once walked over. "What they carried
   goes into the ground with them" — except nothing buries in sims, so
   the wire just sits, visible in the instrument, invisible to the
   policy. A real player who knew the body was there would check. The
   policy doesn't know how.
2. **The armed transcripts read as a scholar losing the plot.** Days
   fill with micro-walks to old bones; the trapline patter ("Wire
   doesn't lie") never appears because no traps are ever set. The
   dehydration deaths have no fiction — the scholar just stops drinking.
   The harm is legible in the transcript before it's legible in the
   numbers.
3. **The corpse channel's honest voice is intact in control.** "You take
   rain shell, kitchen knife, snare wire from Moise. Your hands know
   what they did. (+14 trauma)" — the working channel, with its price
   attached. Nothing about the layer's failure changes that the base
   collection reads like a person making a hard call.

## Metric review (REQUIRED)

1. **Primary 0/16 vs bar ≥3/16 — NO-GO, not re-scored.** The layer fired
   41 loot verbs and collected zero wire. The miss is confounded by the
   harm (trajectories collapsed before strands could be engaged), but
   under metric binding a miss is a miss.
2. **Guardrails missed catastrophically, and the mechanism is diagnosed.**
   Median survival −79d (bar −10d); starvation 11 vs 4; traps 37→0. Root
   cause: unbounded approach micro-walks (~2.5k on one run) displaced the
   scholar and burned the day's ticks/kcal — the per-day cap counted
   loots, not walks. This is an implementation-harm kill, not a
   concept-dead one: the proof test showed the approach DOES collect
   wire (18/18 GREEN pre-kill), but the walk's side effects dominate any
   3-unit gain.
3. **The safe variant is redundant, not just unproven.** Looting only
   in-range corpses on arrival (no approach) can't fix the strands —
   they're out of micro-range by construction (inRangeAtDaily=0 across
   12–140 visits). The approach is the only policy-side fix, and the
   approach is harmful. The gap needs game-code work (engine loot pass on
   arrival, or body recovery) — steve-call sized — or acceptance as a
   3-unit/16-run leak.
4. **New measurement durable from this arm:** the exact wire-flow
   accounting (deposited/looted/buried/stranded/decayed, identity exact)
   and the RNG-clean instrument set (`scripts/corpsewire-instruments.js`,
   det-gate 8/8). Future corpse-economy work reuses both.
5. **Panel compare**: review_required with a leadfeast community-loss
   regression_signal — the instrument agrees with the telemetry. The
   judge (pre-reg) says NO-GO.
6. **Telemetry-check LOUD is the known regime artifact** (b2 §5). Not
   investigated.

## Convergence verdict

**KILLED-AT-PILOT** (harmful implementation; concept needs game-code).
Classification:
- The GAP is real and precisely bounded: 3 wire units strand on 3/16
  runs through a timing gap (daily loot pass only sees in-range corpses
  at daily-time; the scholar walks past the bodies 12–140×).
- The LAYER is killed: the approach that fixes the strands displaces the
  scholar (~2.5k micro-steps/run), zeroes the trapline, halves survival.
  A non-displacing variant can't reach the strands. Policy-side is the
  wrong layer for this fix.
- #633 MATERIALS leg: REMAINS OPEN. The corpse channel moves 5/8 units;
  the 3-unit leak needs engine work (loot-on-arrival in game code, or
  villager body recovery) — named next, steve-call sized. The learnability
  sub-gap stays CLOSED; knower presence and the trust/presence drive are
  other lanes' work.

Kill protocol executed: `scripts/policies/corpsewire.js` deleted
zero-trace. Instruments + evidence kept: `scripts/test-corpsewire-b.js`
(18/18 GREEN pre-kill; layer section self-skips post-kill with the proof
record), `scripts/corpsewire-instruments.js`,
`scripts/det-gate-corpsewire-20261019.js` (8/8 PASS),
`scripts/sweep-corpsewire-b.js` (measurement),
`scripts/sweep-corpsewire-armed-b.js` (self-skips post-kill with the kill
record), `scripts/probe-corpsewire-strands.js`,
`scripts/build-corpsewire-panels-b.js`, per-seed JSONs
(`evidence/2026-10-19/perseed-corpsewire-b/`,
`evidence/2026-10-19/perseed-corpsewire-armed/`), panel compare
(`evidence/2026-10-19/corpsewire-panel-b.*`).

## Run notes

- Pre-registration written BEFORE any sims (evidence header). Metric
  binding honored: the 0/16 is not re-scored.
- Proof: 18/18 GREEN pre-kill (12 mechanics + 6 layer). Det-gate: 8/8
  identical (instruments). Pilot: 32 runs (16/arm) + 16 measurement runs,
  180d death-aware.
- Mid-run infra: a VM service restart wiped /tmp and killed the first
  armed sweep at 10/16 control seeds (no summary). Re-ran both arms from
  scratch with logs in the worktree (AGENTS.md lesson: /tmp is
  ephemeral). No data lost (per-seed JSONs live in the worktree).
- Sim cost: proof ~1 min, det-gate ~2 min, measurement ~3 min, armed
  pilot ~6 min, probes ~2 min, panel ~1 min.
- #633 NOT fixed — see sim-findings.md update (materials leg: corpse
  channel leaks 3u/16 runs; needs game-code, steve-call).
- Design decisions (Steve: decide, list, await correction):
  1. Measured the wire flow with exact per-corpse accounting rather than
     building the layer first — the gap had to be bounded before tuning.
  2. Chose the arrival-loot + honest-approach design over a wider range
     gate (can't change the engine's gate policy-side) and over
     inter-node detours (too invasive).
  3. Required deathKnown for the approach (no omniscience) — the scholar
     walks only to bodies they know about.
  4. Killed at pilot on the guardrails, not just the primary — a layer
     that halves survival is harmful even if the primary had hit.
  5. Named the next fix game-code (engine loot-on-arrival or body
     recovery) rather than iterating the policy layer — the safe variant
     is provably redundant.
