# sim-seedland-b — PREREG (binding)

Run: fleshout-loop-b-20261116T1115Z (Loop B), axis winnability chain, arm
sim-seedland-b — LAND the vetparty seed call as a permanent game change
on top of master, which already carries the gate fix. This is tracker
blank #1: the landing decision for the seed-call + gate-fix chain repair.
Branch `sim-seedland-b` (worktree `~/workspace/worktrees/sim-seedland-b`).
Base: master `612bb6994` at arm start (the worktree HEAD; the coordinator
rebases at landing and re-runs proofs).
Binding prereg: THIS file — frozen before any judged sim. Commit this file
FIRST, then build the instrument, then land the seed call, then run the
judged pilot. No judged numbers exist yet.

## The question, in plain words

A villager only goes back after a wave-4 beast if something first plants
the idea — a "seed". The seed call (a villager who faced a wave-4+ beast
in the wild and fled now remembers it and plans to go back with a party)
was measured, reverted, measured again, and reverted again — each time
the chain stalled one step further down: the seed call alone opens plans
but the gate vetoed non-ranger holders (seedpaths); the gate fix alone is
inert because almost no plans ever form without a seed source
(gateconfirm: 1 launch on 12 seeds, same on both legs); seed call + gate
parts got the first launched-party kills but failed the kill:death and
conversion bars (gatelever: 2 kills, kill:death 0.67, faced-not-killed
0.67). This arm lands the FIRST link of the repaired chain — seed call +
the gate fix ALREADY ON master — as a permanent game change, and judges
it on the frozen bars below. If it passes, the seed call ships; if it
fails, it is reverted and the evidence stands alone.

## Prior art (read first)

- `evidence/2026-11-16/sim-seedpaths-b.md` + prereg — the seed call owns
  27/28 plan instances and 6/7 launches, but the instrument leg produced
  0 launched-party wave-4 kills. Seed call reverted after measurement;
  NOT on master. The instrument (driver + analyzer) this arm reuses.
- `evidence/2026-11-16/sim-gatelever-b.md` + prereg — seed-call-only
  control leg: 0 launched-party kills; lever leg (seed call + 3 gate
  parts): 2 launched-party kills, PILOT NO-GO (kill:death 0.67 vs 0.92
  bar, faced-not-killed 0.67 vs 0.20 bar). The frozen bar definitions
  below are inherited from this prereg (bars 2–4) with the launch
  coverage re-expressed for the seedpaths instrument (see §Frozen
  definitions).
- `evidence/2026-11-16/sim-gateconfirm-a.md` — the gate fix AS LANDED is
  inert without a seed source (1 launch on 12 seeds, same on both legs).
- `evidence/2026-11-16/sim-killfail-a.md` — 9 launched wave-4 fights,
  0 kills, trick unknown 9/9. The kill bar below is judged against that
  background: a single launched-party kill on 8 seeds is a real move.
- `docs/CANON.md` (read first), `docs/MONSTER-WAVES.md` (wave law:
  escalation, earlier waves never leave), `docs/PARTY.md`.
- CANON GAP (recorded, not invented): no CANON-registered doc covers
  companion-pool seed paths, departure gates, or the pick lottery
  (checked 2026-11-16 by sim-seedpaths-b against the `docs/CANON.md`
  manifest; `docs/VILLAGER-BRAIN.md` §357 mentions `exped[]`/`away{}`
  / indoor checks only in passing). The evidence file states this gap
  instead of inventing canon.

## The change (frozen)

Re-land the 13-line VETPARTY seed-call block in `src/js/game.js`
`resolveWildMonsterEncounter`, VERBATIM, before
`if (rec.outcome === 'alreadyDead') {` (line 20935 on this base —
re-located fresh; lines drift). Source blob `a66d45a5e`, from revert
`7ba893b4b`; the exact text is preserved below and in git history
(seedpaths anchor `f8b1310b0` re-landed this same block):

```js
      // VETPARTY (sim-vetparty-a): a villager who FACED a wave-4+ beast
      // and lived — fought it and fled — now knows the type is real,
      // where it is, and that they survived it. That lived knowledge
      // seeds a win-plan re-engagement: go back after that type, with
      // a party. Only vFlee seeds: a kill already advances the plan
      // through winPlanNoteKill, a death ends the villager, a fleeing
      // monster was never faced, and raids/aid fights are defence, not
      // a place to return to. Wave-gated inside the seed (wave >= 3).
      try {
        if (!opts.raid && !wViaAid && rec && rec.outcome === 'vFlee' && this.winPlanSeedFromFight) {
          this.winPlanSeedFromFight(vid, mdef, 'fled');
        }
      } catch (e) {}
```

No other game-code change. The gate fix is NOT re-landed by this arm:
it is already on master and this arm tests seed-call + gate-fix
together.

## Gate-fix verification (pre-condition, verified before this commit)

The PROFILEGATE bypass (`ed542bba4`, 18 lines in
`src/js/villager-agency.js` depart path) is present on this base,
verbatim: `grep PROFILEGATE` hits `src/js/villager-agency.js:383`, and
the block matches the `ed542bba4` diff line-for-line (bid-and-selected
`party_launch` commit bypasses the wanderer/explorer profile skip only;
all other launch conditions still apply). If it had been absent this
arm would have stopped here. It is present.

## Legs

- **Control leg:** this base as-is (seed call ABSENT, gate fix present).
  `MODE=control`, `RUN=seedland-b`.
- **On leg:** base + the 13-line seed call above, committed first as its
  own commit (the instrument anchor pattern from seedpaths).
  `MODE=on`, `RUN=seedland-b`.
- Identical seeds, policy, horizon, driver, analyzer on both legs.
  The ONLY difference between legs is the 13-line seed call.

## Frozen GO bars (binding — all four must pass for GO; any fail = NO-GO, revert the seed call, evidence-only)

1. **Launched-party wave-4+ kills >= 1** on the 8-seed on-leg
   (distinct meetings; control expected 0).
2. **Kill:death >= 0.92** across launched wave-4+ meetings (on-leg).
3. **Faced-not-killed share among wave-5-unlocked seeds <= 0.20**
   (on-leg).
4. **Cost bar:** starvation deaths <= control + 2 AND median survival
   >= 0.8x control (on-leg vs control leg).

## Frozen definitions

- **Launched instance:** the seedpaths analyzer's plan instance whose
  bucket is `launched` (dawnbid `resolved` outcome `launched`).
  Launch day = the resolved entry's `day`; companion = its
  `companion`; close day = the instance's `closeDay` (null = still
  open at the final day).
- **Launched-party wave-4+ meeting:** a `v4encounters` row with wave
  >= 4, origin `expedition`, whose `vid` is the launched instance's
  holder or its resolved companion, whose `mid` equals the instance's
  target, and whose `day` falls in `[launchDay, closeDay || finalDay]`.
  Distinct meetings are keyed `seed|vid|day|mid` (one meeting counted
  once even if two launches cover it — the gatelever distinct-meeting
  rule, re-expressed for this instrument because the seedpaths driver
  records no launch duration; the instance-lifetime window replaces
  the gatelever `[launch day, launch day + duration]` window).
- **Bar 1 kills:** distinct launched-party wave-4+ meetings with
  outcome `vKill`.
- **Bar 2 kill:death:** numerator = bar-1 kills; denominator =
  distinct launched-party wave-4+ meetings with outcome `vDie`
  (same meeting definition). The gatelever Correction C1 rule
  applies: death-log `'villager combat'` rows are the killed beasts'
  own records and contribute 0 — they are reported as a secondary
  only, never in the bar. Zero denominator with kills >= 1 PASSES
  (value null — no deaths to count against).
- **Bar 3 wave-5 classes (per seed, mirroring wave5kill):**
  unlocked = `maxWave >= 5` (the seedpaths corpora carry no deed
  series or unlock events, so the event-based half of the wave5kill
  definition cannot run here — this is the frozen adaptation, not a
  mid-run change); faced = >= 1 wave-5 encounter row (any outcome,
  any origin); killed = >= 1 wave-5 kill in `killCalls` (wave 5).
  Classes: LOCKED (not unlocked), NEVER-FACED (unlocked, faced 0),
  FACED-NOT-KILLED (unlocked, faced > 0, kills 0), KILLED (unlocked,
  kills > 0). Share = FACED-NOT-KILLED / unlocked; null when 0
  unlocked, and null FAILS bar 3 (no wave-5 access means the chain
  did not get there — the gatelever judge's rule).
- **Bar 4 cost:** starvation = death-log rows matching
  `isStarvation` (cause/kind `/starv|hunger/i`, the gatereach2
  function, reused); median survival = median `gameDays` across the
  leg's 8 seeds.
- **Wall numbers** (reported every run, not judged): national by
  standing >= 200 AND by scaleRank, table (seat taken), wins, wave-4
  unlocks, wave-5 unlocks, median survival — from the seedpaths
  analyzer's `wall` + `medianSurvival` (poolmarginals substrate).
- **Instrument validity (judged alongside the bars):** 8/8 files parse
  on each leg, 0 instrument errors on each leg, seedpaths attribution
  coverage >= 0.90 on each leg (the analyzer exits non-zero
  otherwise). A GO on a broken instrument is not a GO.

## Instrument (extend minimally, do not rebuild)

- **Driver:** `scripts/seedpaths-driver-20261116.js`, extended
  behind an env flag `SEEDLAND=1` (flag unset = seedpaths behavior
  byte-identical: the fieldFight wrap watches wave == 4 only, no
  `origin` field). With `SEEDLAND=1`: (a) the fieldFight watch
  becomes wave >= 4, so wave-5 encounters are recorded in
  `v4encounters` alongside wave-4; (b) each encounter row carries
  `origin`, read from the call stack at the wrap with the same caller
  taxonomy as the gatelever driver's `fightOrigin`
  (`expedition` | `world-tick` | `patrol` | `aid` |
  `other:<fn>` | `unclassified`), skipping seedpaths-driver frames.
  Both additions are pure reads (no RNG, no game-state writes). The
  seed-path wrap, dawnbid capture, and per-seed summary are
  untouched.
- **Analyzer:** new `scripts/analyze-seedland-b.js`, requiring
  `scripts/analyze-seedpaths-b.js` (instances, launches, wall,
  median) and `isStarvation` from `scripts/analyze-gatereach2-b.js`.
  It computes the four bars from the corpora (launched-party
  meetings/kills/deaths, wave-5 classes, starvation, median
  survival) and the judgment. It writes
  `evidence/2026-11-16/seedland-b-analysis.json`. It does not copy
  the seedpaths driver or analyzer.
- **Proof test:** new `scripts/test-seedland-b.js` — static check
  (seed call present verbatim on the on-tip, absent + `src/` diff 0
  post-revert), judge fixtures (covering-launch window, distinct
  meetings, kill:death incl. zero-denominator pass, wave-5 classes
  incl. 0-unlocked null), origin classification fixtures, live
  recorder shape, determinism D1 (recorder ON twice identical) +
  D2 (recorder ON vs OFF identical trajectories) at 60d on seed
  102141. Green on the on-tip AND post-revert.
- **Balanced panel (§15):** before/after comparison runs through
  `scripts/balance-panel.js` (`compare --before <control-panel>
  --after <on-panel> --out evidence/2026-11-16/seedland-b-panel`);
  the panel is the instrument, the frozen bars above are the judge.
  Attach the compare `.md` to the evidence file. Panel builder
  adapted from `scripts/build-gatelever-panels-20261116.js`
  (same schema, seedland corpora).

## Horizon, policy, seeds, determinism

- **Seeds:** 102141–102148 (8-seed pilot ONLY; no 12–16 seed confirm
  unless the pilot passes all four bars).
- **Seed freshness (re-verified by this worker, recorded here):**
  zero hits for `10214[1-8]` in any prereg, the convergence tracker,
  `scripts/`, per-seed filenames, or `~/memory/`. The digit string
  `102143` appears in exactly 2 evidence `.md` files, both as
  incidental game numbers, not seed namings:
  `evidence/2026-10-15/sim-aidspoil-b.md:132` ("102143 on real
  overstock") and `evidence/2026-10-16/sim-floorday3-b.md:22`
  ("maxDrawdownKcal == fresh − 2×burn exact (102143)"). The other
  evidence-corpus hits for that string are the same incidental class
  (pantry/kcal numbers in `.json` corpora). The band is fresh.
- **Horizon:** 150d, death-aware (dead villages stop simulating;
  +10d tail max, per MEASUREMENT.md).
- **Policy:** competent verbatim (`scripts/policies/competent.js`,
  sha256 `74a890f0844ebc19fce2ac24da360f114b1f366fdb33a185a122f891dc2f0456`
  — verified with sha256sum before this commit; same sha the
  seedpaths / gatelever / gateconfirm preregs record).
- **Determinism:** D1/D2 as in the seedpaths proof (same shape, seed
  102141, 60d). D3 drift smoke: first divergence day vs first
  world-tick seed day per seed, reported in the evidence file.
- **Telemetry deviation check:** after writing evidence, run
  `node scripts/telemetry-check.js` per the loop body; recorder
  corpora are expected to be refused (seedpaths precedent) — record
  the refusal, do not work around it.

## Commit sequence (frozen order)

1. This prereg (this commit).
2. Instrument: driver extension (`SEEDLAND=1`) + analyzer +
   proof test + panel builder.
3. The seed call (13 lines, verbatim) — its own commit.
4. Judged pilot: control leg, then on leg, 8 seeds each.
5. Evidence + analysis + corpora + panel; then EITHER keep the seed
   call (GO — it ships as the landing) OR revert it (NO-GO —
   evidence-only, `src/` diff 0 vs base).

## Metric review (to be filled in the evidence file)

- Whether the instance-lifetime window (vs gatelever's
  duration window) admitted or excluded any meeting, and whether
  any bar turns on the choice.
- Whether the wave-5 class adaptation (maxWave-only unlock, no deed
  series) changes any seed's class vs the event-based definition.
- Whether the origin taxonomy produced any `unclassified` or
  `other:<fn>` encounter rows.
