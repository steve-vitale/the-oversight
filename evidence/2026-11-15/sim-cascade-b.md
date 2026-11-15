# sim-cascade-b — same-day scholar-death cascades: the lingering besieger

**Verdict: PILOT GO, CONFIRM NO-GO (cost bar) — lever NOT landed.**
Stage 1 is complete and decisive: the same-day cascade is **(B) — a
lingering besieger at Haven**, proven with instance ids, not inferred.
The pilot passed every pre-registered bar. The 16-seed confirm
reproduces the primary effect (P1 0.53x, held-days and survival both
up) but **fails the pre-registered cost bar on starvation (8 vs ≤5)**,
with a systematic lever-caused mechanism behind it (gorge nights
+82%). Under metric binding (§14) a missed bar is NO-GO: the lever
stays on branch `sim-cascade-b`, unmerged. The kill is documented
below, with the mechanism, so the next run can price the trade
properly instead of re-running it blind.

Loop B run `fleshout-loop-b-20261115T0730Z`, axis winnability chain, arm
sim-cascade-b (winnability-chain blank 3). Prereg:
`evidence/2026-11-15/sim-cascade-b-prereg.md` (committed `c2d78a8a8`
— binds). Branch: `sim-cascade-b`. Base master `8b77f0f40`.

## The question, in plain words

A national village does not die because one scholar loses one fight. It
dies because the SAME beast kills the scholar, then the next bearer, then
the next — sometimes three in a single day, in the hall itself. The
successor-caution policy (stay home two days after a succession) cut
next-day deaths but the same-day deaths rose to fill the gap, because the
deaths were never about the successor walking out. They are about
something already inside the village, waiting.

## Stage 0 — reproduction: PASS 3/3

The cascade driver (`scripts/cascade-driver-20261115.js`, copy of the
successorcaution driver + session/instance/provenance instrumentation)
reproduces the successorcaution fresh control exactly on seeds
100201/100203/100212 — all judged fields identical (days, endReason,
maxWave, standing, scaleRank, waveKills, series, deaths, verbEvents,
linkLines, seatTakes, tableState, capSummary, driveEnd). Only
`anchorCommit` (differs by construction), `arm`/`run` (renamed by
design), and the new `cascade` instrument differ. Comparison:
`/tmp/compare-stage0-cascade-b.js` (kept out of the repo; result:
`STAGE 0: 3/3 IDENTICAL`). The instrumentation is behavior-neutral.
No `src/js` change between the successorcaution fresh-control tip
(`31c51f32d`) and this run's tip — verified by
`git log 31c51f32d..HEAD -- src/js`, empty.

## Stage 1 — DIAG: (B) dominates, 23/23, same-instance PROVEN

Control corpus: `evidence/2026-11-15/perseed-cascade-b-control/`
(8 seeds 100201–100208, 150d, competent-answercourt-b, cascade driver).
Analyzer: `scripts/analyze-cascade-b.js`. It reproduces the
successorcaution fresh control exactly (P1 0.1649, held-days 47.5,
survival 117.5d, total deaths 652, gaps 23/22/5/38) and adds the
session/instance/provenance decomposition.

### The gap decomposition (88 scholar `the wild` deaths)

| gap to previous scholar death (any cause) | deaths |
|---|---|
| 0 (same day — the cascade bucket) | 23 |
| 1 | 22 |
| 2 | 5 |
| 3+ | 38 |

While national: gap-0 19, gap-1 18, gap-2 3, gap-3+ 23 (63 deaths).

### The A/B/C classification of the 23 gap-0 followers (frozen rules)

| mechanism | followers | share |
|---|---|---|
| (A) same fight session killed two bearers | **0** | 0% |
| (B) new fight, waiting killer at Haven (breach) | **23** | **100%** |
| (C) new fight, wild, successor's own trip | **0** | 0% |
| other | 0 | 0% |

While national: B 19/19. Dominance is not a plurality call — it is
unanimous. 19 of the 23 followers died in the SAME `daily()` call as
their predecessor's death (`sameDailyCall=true`); the other 4 died in
the next `daily()` call on the same calendar day (the day rolled over
mid-`daily()`). Every follower died on days-since-succession 0 — the
day they inherited.

- **(A) is refuted empirically, not just in code.** 0 sessions killed
  two scholars (`sessionsWithTwoPlayerDeaths: 0`). The code reading
  holds: `tbEndCheck` ends the fight `lost` the moment the scholar
  falls (`tbEnd('lost')`, `f.over = true`, `tbfight` cleared in
  `tbEnd`'s finally) — the successor is never enrolled in the dead
  bearer's fight. The in-scope (A) lever (end the fight session when
  the scholar dies) has nothing to build: the fight already ends.
- **(C) is refuted.** 0 followers died on a wild trip. The successor
  does not die foraging alone the same day — successorcaution already
  closed that door, and this diag confirms the deaths were never
  there. The trip loop's missing bearer guard
  (`forageTripSeedFirst` continues to the next candidate tile after a
  mid-trip death) is real code but not the cascade mechanism: no
  follower's fatal fight started on a trip.
- **(B) is the mechanism, and it is one specific thing: the lingering
  besieger.** All 23 followers died in `breach`-provenance fights
  (a fight starting while the scholar is on the Haven node). Zero
  were treeline ambushes, zero door re-engages — the two (B) paths
  fighterhold hypothesized are not the ones that fire.

### Same-instance persistence — PROVEN (fighterhold's inference, closed)

World-monster instance ids (WeakMap over the lifted world object —
the engine carries no instance id) plus HP lockstep (the fighter's
starting HP equals the world monster's current HP, fight after fight):

- **10 repeat instances killed ≥2 scholars each, 38 of the 88
  scholar deaths (43%).** Top chain: seed 100207 instance 14, an
  `algorithm`, **6 kills** (d92–93). Then 100203:17 (5 kills),
  100208:10 (5), 100201:9 (4), 100202:11 (4), 100204:11 (4).
- **74 of 88 fatal fights are lockstep** (tile monster == fighter,
  HP matches) — the tile monster IS the killer, not a bystander
  (the bystander case exists and is detectable by the HP mismatch:
  e.g. 100207 session 22, a `buffering` fight with the algorithm
  sitting unwounded on the tile — correctly excluded).
- **50 of 88 fatal fights ended with `worldOrigin` restore** — the
  killer was put back on the tile after killing the scholar
  (titan/lingering restore in `tbEnd`; these species are lingerers,
  not titans). 44 of the 63 while-national deaths are lockstep
  lingering kills with restore.
- **17 of the 23 gap-0 followers were killed by a lockstep lingering
  killer with restore.** The other 6 are breach fights with no tile
  monster at combat start (pending/feast-resolved fights — instance
  unknowable; 5 such fatal sessions in the corpus).
- The HP bookkeeping is the cleanest proof there is: 100207's
  algorithm fought six times in two days with starting HP
  750 → 614 → 465 → 389 → 376 → 197 — each bearer wounded it a
  little more and died. The village never kills it; it just bleeds
  it, one bearer at a time.

### The mechanism, end to end (code-verified)

1. **The siege.** A raid leaves a lingerer: a wave-4/5 monster
   (`eulogy` 900–1100 HP, `algorithm` 1000–1200, `reunion`
   1200–1400, `suburb` 1300–1500) pinned to the Haven tile
   (`havenGrowthDaily` re-pins `tx,ty` to Haven every dawn). It
   gorges from the pantry each night (~500–1500 kcal) and drifts
   off after ~6 nights (`lingerSince` stamped once, never reset by
   a fled fight). The designed answers are **endure** (wait it out)
   or **sortie** (a mustered party of 2+ fighters via `fieldFight`;
   the code says a lone villager against a treeline monster is a
   funeral, not a sortie). The policy never sorties — there is no
   `answerLingerer` call site in `competent.js` or
   `competent-answercourt-b.js` — and the sortie-answering policy
   layer (`scripts/policies/sortieretry.js`, Loop A 20261103) was
   already judged PILOT NO-GO / NO-VALUE as gameplay (deaths
   402 = 402 across its arms). The policy door is closed by prior
   evidence, not just by this arm's brief.
2. **The hunt.** `monsterTurn()` — "monsters move when you do" —
   runs on every scholar move/action (8 call sites). It takes the
   player-tile monster and steps it toward the scholar; on contact
   (`m.mx === px && m.my === py`) it calls `startCombat`. There is
   **no safe-tile check** in that path (fighterhold's finding,
   re-verified here): the besieger steps onto the scholar inside
   the hall, on the Haven tile, and the fight starts — firing the
   breach crisis, because any fight starting while the scholar is
   on the Haven node fires `fireCrisis('breach')`.
3. **The duel the scholar cannot win alone.** A solo bearer at full
   health (php 100 in nearly every fatal session) meets a 900–1500
   HP wave-4 lingerer with no party and, for signature monsters,
   no knowledge of the counter-play (the Eulogy's 5-verse doom deals
   9999 damage when the verses run out — the −3217 / −4351 end-HP
   values in the probe are the narrated ending landing, by design;
   the bot never contradicts a verse). The scholar loses.
4. **The restore.** On `'lost'`, `tbEnd` puts the lingering world
   object back on the tile, wounded (`o.hp = min(preHp, fighter
   end HP)` — the wall-wounds rule). The siege continues. The next
   bearer wakes in the hall; the next scholar move lets the
   lingerer close in again; contact, duel, death. Three successors
   died inside one `daily()` call on 100207 d93, all to the same
   algorithm, all inside the hall at (4,4).
5. **Why successorcaution could not touch this.** The deaths do not
   need the successor to take a trip, leave Haven, or do anything
   at all except move — and `monsterTurn` runs on Haven chores,
   walks, and travel alike. A daily-level trip gate cannot stop a
   monster that comes into the hall. The 2-day window was aimed at
   the wrong door.

### Case study — 100207 d92–93: one algorithm, six scholars

| session | day | bearer | vs | HP in | result | end HP |
|---|---|---|---|---|---|---|
| 21 | 92 | petra_novak | algorithm | 750 | lost | −3 |
| 22 | 92 | caleb_jones | buffering (bystander: the algorithm watches) | — | won | 81 |
| 23 | 93 | caleb_jones | algorithm | 614 | lost | −3 |
| 24 | 93 | app_mgpsphpr | algorithm (inside hall) | 465 | lost | −14 |
| 25 | 93 | chantal_muke | algorithm (inside hall) | 389 | lost | −13 |
| 26 | 93 | visjoin_87 | algorithm (inside hall) | 376 | lost | −21 |
| 27 | 93 | visjoin_89 | algorithm (outside, 1,0) | 197 | lost | −9 |

Six scholars, one beast, two days. The successor's first `daily()`
after Petra's death (dc 92) contains five fights and four deaths.
Caleb even WINS a fight in the middle (the `buffering`, session 22)
— and then the algorithm, still sitting on the tile unwounded by
that win, kills him in the next fight of the same day.

## Stage 2 — THE LEVER (named before its pilot runs)

**LINGERER HOLDS THE TREELINE** (`src/js/game.js`, `monsterTurn()`):
when the player-tile monster is a lingering raider, `monsterTurn()`
returns early — it does not step onto the scholar and does not start
turn-based combat on contact.

- **Why this lever and not the others.** The proven mechanism is the
  monster-AI-initiated duel: the besieger hunts the bearer. The
  designed answers (sortie/endure) already exist and the policy door
  is closed by prior evidence (sortieretry NO-VALUE). The lever
  restores the design: a besieger holds the treeline; it does not
  hunt bearers in the hall. A human player may still walk up and
  press Fight (`startCombat` untouched); the sortie still fights it
  (`fieldFight`, not `monsterTurn`).
- **Boundaries honored.** No breach removal (non-lingering intruders
  still chase and breach exactly as before — the guard keys on
  `m.lingering`, set only by the raid/siege code in
  `havenGrowth.js:692,754`); no despawn (the lingerer stays, gorges
  nightly, drifts off in ~6 nights); no flee code touched; no
  toughness/gear/damage/ability tuning; policies byte-identical.
- **Ceiling (pre-pilot, from the control corpus).** 44 of the 63
  while-national scholar wild deaths are lockstep lingering kills
  with restore (70%). Perfect operation gives P1 0.1649 × (1 − 44/63)
  = **0.0498** — well below the 0.6x bar (0.0989). The bar is
  achievable in first order (unlike successorcaution's 0.737x
  ceiling). Gap-0 followers: 17/23 are lockstep lingering kills;
  the other 6 are pending/feast breach fights the guard cannot
  reach — the pilot gate requires gap-0 to FALL, not to vanish.
- **Pilot gate (i) mechanism check:** the armed leg must show zero
  scholar `the wild` deaths to a lockstep lingering killer on the
  showcase seed (100207, 100d) AND at least one breach-provenance
  session still occurring (the breach survives for non-lingering
  intruders). Proof test: `scripts/test-cascade-b.js` (4/4 required
  before the pilot is judged).

## Stage 2 — PILOT: GO (8 seeds 100201–100208, 150d, competent-answercourt-b)

**PILOT GO — all three gate conditions pass; 16-seed confirm running.**

Fresh control re-run on the rebased tip (`942e15ca5`, master
`7251dcb4f`): the analyzer reproduces the prereg control **exactly**
(P1 0.1649, held 47.5d, survival 117.5d, starvation 0, deaths 652,
gaps 23/22/5/38) — trajectories byte-identical to the old-tip corpus
except `anchorCommit`. **Zero tip drift.** (Control leg run with the
lever temporarily out of the tree; restored and re-verified 4/4 after.)

| metric | control (OFF) | armed (ON) | bar | verdict |
|---|---|---|---|---|
| **P1** scholar wild deaths / national-day | 0.1649 | **0.0573 (0.35x)** | ≤ 0.0989 (0.6x) | **PASS** |
| **P2** median national held-days | 47.5 | **84** | ≥ 47.5 | **PASS** |
| starvation pooled | 0 | 1 | ≤ control+2 (2) | PASS |
| median survival | 117.5d | **150d** | ≥ 94d (0.8x) | PASS |
| gap-0 followers (cascade bucket) | 23 | **3** | must fall | PASS |
| same-instance repeat-killer pairs | 27 | **0** | — | mechanism |
| survived to 150d | 0/8 | **5/8** | — | — |
| national-ever | 8/8 | 7/8 | — | watch (confirm) |
| end-state national | 7/8 | 6/8 | — | watch (confirm) |
| wave-5 unlocked | 3/8 | 2/8 | — | watch (confirm) |
| total deaths | 652 | 674 | — | see metric review |
| dissolutions | 1 | 2 | — | watch (confirm) |
| wins / table | 0 / 0 | 0 / 0 | — | — |

Per-seed survival, OFF → ON (days): 100201 113→145, 100202
132→150★, 100203 145→150★, 100204 97→150★, 100205 124→139, 100206
104→150★, 100207 93→137, 100208 122→150★ (★ = survived the horizon).
Every seed lived longer armed; none lived shorter.

**Pilot gate.** (i) Mechanism observable: proof test sim-mechanism
on showcase 100207 (100d) — lingerDeaths 0, gap-0 0, 8 breach
sessions still occurring; pilot same-instance pairs 27 → 0. (ii)
Cost bar clean: starvation 1 ≤ 2, survival 150 ≥ 94. (iii) P1 moves
GO-direction (0.1649 → 0.0573) AND gap-0 falls (23 → 3). **All
three pass → PILOT GO.**

**Ceiling check.** Predicted ceiling P1 0.0498 (19 residual deaths);
observed 0.0573 (30 deaths). 33 of the 44 lockstep lingering kills
removed (75% of ceiling). The residual 30 wild-national deaths are
gap-0 2, gap-1 4, gap-2 2, gap-3+ 22 — mostly lone deaths, not
cascades. The 3 residual gap-0 followers are NOT the chain: two are
different-instance breach fights (a new killer each time), one is a
door-fled stash re-engage (`influencer`, bearer tom_baker, 100201
d141) — a path the guard structurally cannot reach (stash
consumption, not `monsterTurn` stepping). The guard engaged fully on
its target: same-instance pairs 27 → 0.

**Balanced-panel compare (§15).**
`evidence/2026-11-15/cascade-b-panel.{json,md}` (+ `-before`/`-after`
`.json.gz`; builder `scripts/build-cascade-panels-20261115.js`,
cloned from the successorcaution builder; paired seeds, same policy,
the contrast IS the game code). Decision **review_required**; no
material signals — both regression_watch flags have CIs including
zero (national 0.875→0.75, CI [−0.375, 0]; village deaths per run
81.5→84.25, CI [−9.75, +12.875]). The material direction favors the
lever: deaths per 100 days 72.4→57.2 (CI [−32.8, −0.43], entirely
below zero); community loss 1→0.375 (CI [−0.875, −0.25], entirely
below zero). The panel agrees with the pre-registered bars.

**Telemetry deviation check.** Three LOUD lines on the ON leg
(national 12→0, table 16→0, wins 16→0) — investigated same-run:
the CONTROL leg fires the identical three lines, and the baseline
file's own `_regime.note` forbids comparing pre-seat substrates
against the winseat baseline ("wins are structurally ~0 there and
telemetry-check will fire a spurious LOUD 'wins disappeared'").
Regime artifact, not a lever regression. (The brief's `--current`
glob `perseed-cascade-b-*.json` matches no files — per-seed JSONs
live in the `perseed-cascade-b-{control,on}/` subdirs; ran against
each dir glob with `--allow-recorder-corpus`, as successorcaution
did.)

**Sense-testing.** The siege is voiced and now accumulates: on
100207 the ON leg has 80 siege/linger linkLines vs 51 OFF — "🌙
Night. The lingering X gorges at the treeline — N kcal gone from
the stores. Endure it (they drift off within ~6 nights — the gorge
is the price), or send a sortie…" The besieger now gorges night
after night without killing bearers: the endure-or-sortie choice is
actually presented instead of silently executing bearers. The Stage
1 gap (no line ever says the same beast is still waiting) is partly
answered — the nightly gorge lines name the beast each night — but
no line yet says "the same beast that killed your last bearer is
still out there." (Follow-up blank, not this arm.)

**Write-flap incident, this run.** The flap returned ~10:00–10:01Z
during the fresh-control sweep: seed 100205's write failed after
the driver's 480 retries (120s) and fell back to a stdout dump; the
exec session was then SIGTERM'd at ~6 min (seeds 100206–100208
never ran). Recovered by re-running 100205–100208 in 2-seed chunks;
100205's fallback summary matched the re-run exactly (days 124,
village-lost, deaths 68) — deterministic reproduction. All sweeps
since run in 2-seed chunks to stay under the ~6-min exec kill.
Flap window was brief (~2 min); probe OK before and after.

**Confirm:** 16 seeds (100201–100216) complete — see "Stage 2 —
CONFIRM" below. Verdict: **NO-GO on the cost bar. Do not merge.**

## Stage 2 — CONFIRM: NO-GO (16 seeds 100201–100216, 150d, competent-answercourt-b)

Pilot 8 seeds + confirm 8 seeds (100209–100216) per leg, same driver
and tip (`942e15ca5`). The confirm reproduces the primary effect but
fails one pre-registered bar.

| metric | control 16 | armed 16 | bar | verdict |
|---|---|---|---|---|
| **P1** scholar wild deaths / national-day | 0.1248 | **0.0665 (0.53x)** | ≤ 0.6x control (≤ 0.0749; pilot abs. ≤ 0.0989) | **PASS** |
| **P2** median national held-days | 57 | **70.5** | ≥ control | **PASS** |
| starvation pooled | 3 | **8** | ≤ control+2 (≤ 5) | **FAIL (by 3)** |
| median survival | 123d | **145.5d** | ≥ 0.8x control (≥ 98.4d) | PASS |
| gap-0 followers (all / while-national) | 39 / 26 | **11 / 9** | must fall | PASS |
| same-instance repeat-killer pairs | 41 | **3** | — | mechanism |
| survived to 150d | 3/16 | **6/16** | — | — |
| national-ever | 14/16 | 12/16 | — | softer |
| end-state national | 13/16 | 11/16 | — | softer |
| wave-5 unlocked | 7/16 | 4/16 | — | softer |
| wave-4 unlocked | 16/16 | 15/16 | — | softer |
| total deaths | 1329 | 1235 | — | — |
| dissolutions | 1 | 3 | — | softer |
| wins / table | 0 / 0 | 0 / 0 | — | — |

Per-seed survival, OFF → ON (days), confirm band: 100209 120→138,
100210 150★→130, 100211 122→149, 100212 150★→150★, 100213 150★→146,
100214 141→132, 100215 118→127, 100216 143→**26**. Three reversals in
the confirm band (100210, 100213, 100214 lived shorter armed; 100216
collapsed at day 26) against five improvements — the pilot band was
unanimous (8/8 lived longer); the confirm band is not.

**Why the cost bar failed — the mechanism, established not assumed.**
Starvation pooled 3 → 8. Per-seed: OFF (100215: 1, 100216: 2); ON
(100201: 1, 100210: 2, 100216: 5). Two components:
- **Systematic, lever-caused: the gorge.** Lingerers now survive to
  gorge the full ~6 nights instead of being fought (and sometimes
  killed) in the hall. Gorge lines across 16 seeds: **645 → 1172
  (+82%)**, up on 14/16 seeds. Each gorge night drains ~500–1500
  kcal from the pantry. The lever trades bearer lives for pantry
  kcal — the design's own stated price ("the gorge is the price") —
  but the price is real and it is paid in food. The pilot band hid
  it (starvation 0 → 1); the confirm band caught it.
- **One chaotic wipe: seed 100216.** Trajectories identical through
  d12 (same deaths, same pantry 23850). The lever fired at d12 — OFF
  had two breach sessions (sanjun + murkcap, same instance 1), ON
  had one (the murkcap was a lingerer; the guard skipped it). The
  skipped fight shifted the RNG stream; ON then drew a bad branch
  (expedition deaths d19–23, pantry 8468 → 1600 → 0 by d25) and five
  villagers starved d25–26. Crucially, **100216 ON has ZERO gorge
  lines** — the wipe was not the gorge mechanism; it was trajectory
  chaos downstream of the lever firing. (OFF 100216 gorged 61 nights
  and starved only twice in 143 days — gorge alone does not starve a
  village.) The 100210 late starvations (d124/126, 2 deaths) are
  exposure: a village that lived 130 days.
- The 3 excess deaths over the bar are exactly 100216's +3 (2 → 5).
  Excluding that seed, starvation is OFF 1 vs ON 3 against a bar of
  ≤ 3 — a pass — but that exclusion is post-hoc and the gorge
  mechanism is real, so it is recorded here as adjudication context,
  NOT as a re-score. The bar stands as failed.

**§15 panel, 16 seeds** (`cascade-b-panel-16.{json,md}`, builder
with `--seeds 100201..100216`): decision **review_required**, no
material signals — every CI includes zero. Village deaths per run
83.1 → 77.2 (no_material_signal; the pilot's regression_watch on
this metric is gone at 16 seeds). Remaining watches: national
0.8125 → 0.6875 (CI [−0.3125, 0]); first-bearer survival through
day 30/60 1 → 0.9375 (the single 100216 wipe). The panel agrees
with the prereg verdict: primary effect real, scale reach softer,
no material signal either way on deaths.

**Kill discipline.** A missed bar alone is not a kill — the WHY is
established above, and the lever itself is not wrong at its job
(P1 0.53x, gap-0 39 → 11, same-instance pairs 41 → 3, survival
+22d, survived 3 → 6). What is wrong for landing is the unpriced
trade: the lever saves scholars by letting every siege run its full
gorge, and the program's cost bar — set before the gorge cost was
known — does not allow that price at this size. The lever is killed
**for landing**, not for the idea: the next run should either price
the gorge (a cost metric in pantry-kcal or starvation per lived-day
rather than a pooled absolute count, which punishes longer
survival) or pair the guard with a gorge answer (the sortie door
is closed by prior evidence — a design call, not a tuning knob).
Do not re-run this lever unchanged on a friendlier metric.

## Sense-testing

The d92–93 transcript on 100207 reads as isolated tragedies, and that
is the dishonesty: nothing names the algorithm as the repeat killer.
"🕯️ Petra is dead — and the dead hold no treaties. Every link Haven
has shakes." / "The Codex doesn't pause for grief. Caleb blinks — and
it's already there..." / "At the grave, Ekene speaks for Caleb." Then
Caleb dies the same way, and the next bearer, and the next — each
death voiced, each mantle transfer voiced, but no line ever says the
same beast is still standing at the treeline, bleeding, waiting. The
village grieves six times and never learns it is one enemy. (The
"🖱️ Thumbnails" lines are the Algorithm's signature narration,
firing every round — accurate, but they crowd out any siege line.)
The grave-speaking and the good seat by the fire still read as a
village that cares; the missing line is the siege itself.

## Reachability verdict (control leg)

- **Waves 1–5:** wave-4 8/8; wave-5 3/8. The lever does not unlock new
  waves; the pilot measures whether it lets villages live long enough
  to face wave 5 more often.
- **Regional → national:** national-ever 8/8; end-state national 7/8.
- **The table:** 0/8. **Wins:** 0/8. (Control leg; the armed leg is
  judged against these.)

## Wall numbers (control leg, 8 seeds)

- P1 **0.1649** (63 while-national scholar `the wild` deaths / 382
  national-days); median national held-days **47.5**; median survival
  **117.5d**; starvation pooled **0**; total deaths 652; dissolutions
  **1**; wave-5 unlocked 3/8; wave-4 8/8; wins 0; table 0.
- Gap shares (88 scholar wild deaths): gap-0 23, gap-1 22, gap-2 5,
  gap-3+ 38. Same-instance chains: 10 instances ≥2 kills, 38 deaths.
- Control corpus: `evidence/2026-11-15/perseed-cascade-b-control/`
  (8 files + Stage-0 file for seed 100212 in the same dir).

## Wall numbers (confirm band, 16 seeds — final)

- **Control:** P1 0.1248 (104 / 833); held-days 57; survival 123d;
  starvation 3; deaths 1329; national-ever 14/16; end national
  13/16; wave-5 7/16; wave-4 16/16; survived 3/16; wins 0; table 0.
- **Armed:** P1 0.0665 (60 / 902); held-days 70.5; survival 145.5d;
  starvation 8; deaths 1235; national-ever 12/16; end national
  11/16; wave-5 4/16; wave-4 15/16; survived 6/16; wins 0; table 0.
- The scale wall stands: no wins, no table on either leg. The lever
  moves the winnability chain's middle links (cascade deaths,
  survival, held-days) but does not open the wall — and at 16 seeds
  it trades some scale reach (national-ever −2, wave-5 −3) for that
  survival. The wall numbers to carry forward are the armed ones
  above: the next arm inherits a lever that halves cascade deaths
  and doubles 150d survival, at a priced pantry cost.

## Metric review (pilot GO; confirm NO-GO on the cost bar)

P1 moved 0.35x against the 0.6x bar — a real effect, not a
ceiling artifact. The shortfall against the predicted ceiling
(0.0573 observed vs 0.0498 ceiling) is residual non-lingering breach
deaths (pending/feast fights, one door-fled stash re-engage) plus
lone gap-3+ deaths the lever structurally cannot reach — NOT a guard
failure: same-instance repeat-killer pairs went 27 → 0, so the guard
engaged fully on its target. The metric was the right one: P1's
cascade bucket (gap-0) fell 23 → 3 while gap-3+ stayed 38 → 38, so
the lever touched exactly the bucket it was built for and nothing
else. Total deaths rose 652 → 674 only because villages live longer
(524 vs 382 national-days — more days at risk); deaths per 100 days
fell 72.4 → 57.2, and community loss fell 1 → 0.375. The
national-ever dip (8/8 → 7/8) and end-state dip (7/8 → 6/8) are the
confirm band's question, not a pilot kill: P2 (median held-days)
nearly doubled (47.5 → 84), and the dipped seed (100202) survived
the horizon at regional — it lived, it just never re-climbed. No
metric revision proposed: the bars judged the pilot as designed.

**Confirm addendum.** At 16 seeds P1 holds (0.53x of the 16-seed
control; 0.0665 ≤ both the relative 0.0749 and the pilot absolute
0.0989) and P2 holds (70.5 ≥ 57), but the cost bar fails
(starvation 8 vs ≤ 5). The bar did its job — it caught a real,
systematic, lever-caused side effect (gorge nights +82%) plus one
chaotic wipe. The bar's *form* is what the next run should revise,
not its existence: a pooled absolute starvation count punishes a
lever that extends life (more lived-days = more exposure) and
cannot distinguish a designed price (gorge kcal, priced by the
design itself) from an unpriced harm. Proposed revision for the
next run: judge starvation per 100 lived-days against the control
rate, with a separate pooled cap as a tripwire — or price the gorge
directly in pantry-kcal per siege and set the allowance on that.
Either way the revision belongs to the NEXT run's prereg, not to
this one: this run's verdict stands as NO-GO.

## Files changed (so far)

- `scripts/cascade-driver-20261115.js` (new) — diag + judged driver.
- `scripts/analyze-cascade-b.js` (new) — A/B/C + same-instance
  analyzer.
- `evidence/2026-11-15/sim-cascade-b-prereg.md` (new) — binding
  prereg (committed `c2d78a8a8`).
- `evidence/2026-11-15/perseed-cascade-b-control/` — 16 files
  (fresh re-run on the rebased tip `942e15ca5`, seeds 100201–100216;
  the Stage-0 seed 100212 file lives in that commit's history).
- `src/js/game.js` — the lever (one guard in `monsterTurn()`).
  **NOT merged — killed at confirm on the cost bar; stays on this
  branch only.**
- `scripts/test-cascade-b.js` (new) — proof test (4 cases; static
  case adapted 2026-11-15 to fall back to the branch diff vs
  merge-base when the lever is committed — same assertion).
- `scripts/build-cascade-panels-20261115.js` (new) — §15 panel
  builder (cloned from the successorcaution builder).
- `evidence/2026-11-15/cascade-b-panel.{json,md}` +
  `cascade-b-panel-before.json.gz` /
  `cascade-b-panel-after.json.gz` — §15 balanced-panel compare
  (decision review_required, no material signals).
- `evidence/2026-11-15/perseed-cascade-b-on/` — 16 files (armed
  pilot + confirm, seeds 100201–100216).
- `evidence/2026-11-15/cascade-b-panel-16.{json,md}` +
  `cascade-b-panel-16-before.json.gz` /
  `cascade-b-panel-16-after.json.gz` — §15 panel on 16 seeds
  (decision review_required, no material signals).
- This file: `evidence/2026-11-15/sim-cascade-b.md`.

## Adoption note (0930Z run — stale-lock recovery of the 0730Z run)

Recovered 2026-11-15 ~09:40Z: Stage 1 diag + control corpus intact;
lever in the tree (uncommitted `src/js/game.js` +16, guard
`if (m.lingering) return;` inside `monsterTurn()`); proof test
present; report present to the "Stage 2 — PILOT (pending)" line. The
0730Z workers were cancelled ~08:54Z; their orphaned sweep kept
writing the "on" leg until ~09:33Z, but every per-seed output came
back 0 bytes — the write flap ate them (deleted as debris by the
adopting run). No live processes remain.

Adoption verification, this run (all read-only; the flap blocks git
ref writes and fresh-file writes in the repo):
- `node scripts/test-cascade-b.js`: **3/4 green**. unit-lingering
  PASS (lingering adjacent/on-cell: no move, no fight; non-lingering
  adjacent: fights; direct startCombat on a lingerer: fights —
  Fight-button path preserved). sim-mechanism PASS on showcase seed
  100207, 100d: 4 wild scholar deaths, **lingerDeaths 0, gap-0 0**,
  8 breach sessions still occurring — pilot gate (i) demonstrated.
  determinism PASS (60d, 45 deaths). static FAILS **only** because
  its `git diff HEAD --name-only` exits 128 on the flap
  (`index.lock` write EPERM); its assertions were hand-verified:
  `GIT_OPTIONAL_LOCKS=0 git diff HEAD --stat` shows exactly one file,
  `src/js/game.js | 16 ++++`, policies byte-identical, guard inside
  `monsterTurn()`. Re-run the test after the flap clears; expect 4/4.
- `node --check src/js/game.js`: syntax OK. Guard NOT in main-tree
  game.js (the lever exists only in this tree).

Stage 2 pilot re-run owed after the flap clears (same band/policy as
the prereg: 8 seeds 100201–100208, 150d, competent-answercourt-b,
cascade driver; the "on" leg must be re-run from scratch — the old
outputs were 0 bytes, deterministic seeds so a re-run reproduces the
trajectories). Judge against the prereg bars: P1 GO ≤ 0.0989 (0.6x
control 0.1649), P2 held-days ≥ 47.5, cost bar starvation ≤ 2 and
median survival ≥ 94d, pilot gate (i)+(ii)+(iii) with gap-0 falling.
If GO: confirm 100201–100216, §15 panel, telemetry check, then
safe-commit the lever + test + report + corpora, rebase onto current
master, re-run proof 4/4, merge ff-only, release tree. Resume:
`cd ~/workspace/worktrees/sim-cascade-b && git update-ref
refs/heads/probe HEAD` (must succeed) → re-run pilot sweep →
`bash scripts/safe-commit.sh "sim-cascade-b: lingerer holds the
treeline ..." -- src/js/game.js scripts/test-cascade-b.js
scripts/cascade-driver-20261115.js scripts/analyze-cascade-b.js
evidence/2026-11-15/sim-cascade-b.md
evidence/2026-11-15/sim-cascade-b-prereg.md
evidence/2026-11-15/perseed-cascade-b-control/
evidence/2026-11-15/perseed-cascade-b-on/` → merge ff-only.
