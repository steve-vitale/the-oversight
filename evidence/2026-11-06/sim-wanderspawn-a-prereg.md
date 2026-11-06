# sim-wanderspawn-a — preregistration (build the wanderer-spawn 20-HP fix)

- Run: `fleshout-20261106T1515Z` (Loop A follow-up; coordinator arm
  sim-wanderspawn-a), axis scale-onramp / winnability chain
- Arm: `sim-wanderspawn-a`, branch `sim-wanderspawn-a`,
  worktree `~/workspace/worktrees/sim-wanderspawn-a`
- Base: `c9df669e0b5c27446953ef627fefbcef7e52476d` (worktree HEAD at
  registration; includes sim-congtrace-a DIAG-GO + coordinator evidence)
- Fix source: `evidence/2026-11-06/sim-congtrace-a.md` (DIAG-GO) — read
  first. The bug: the wanderer-contact spawn (`src/js/game.js:24384`)
  passes a bare `{id, veteran}` object to `spawnWorldMonster`
  (`game.js:20271`), whose def lookup only fires for string `mdef`, so
  `baseHp` falls back to the `|| 20` default — a wave-4 Congregation
  spawned day 75 at 20/20 HP, drifted 74 days unfought, and died day 149
  to one ordinary 56-damage scholar strike (the "1-round solo kill" on
  seed 53006). Same bug class: trap spawn (`game.js:23565`, `{id}` + no
  hp) and finale-campaign spawns (`finale-campaign.js:73, 359`,
  `{id}` + `{titan: true}`). Fled-monster recovery (`game.js:12817`)
  passes explicit `hp`/`maxHp` — safe, fix only if the shape proves
  otherwise (it does not on inspection).
- Fix named: resolve the def by id in `spawnWorldMonster` when
  `full.hp` is missing (central fix — heals wanderer, trap, finale,
  and the debug-button caller at once), honoring `mdef.veteran` which
  the wanderer call passes but `opts.veteran` drops. No gate / price /
  deed / readyDemand change. No `table.js` touch. No competence or
  practice code touch. No pyrrhic-attribution touch. Scope: spawn code
  only (`spawnWorldMonster` + its call sites as the fix requires,
  `finale-campaign.js` only if the bug class is proven there — it is,
  by code path: `finale_crew` hp [700,900], `finale_opening` [900,1100],
  `finale` [1800,2200] all exist in `src/data/monsters.json`, all three
  finale spawns pass bare `{id}`, and `tbWorldHpFor` lifts the world
  monster's HP into the fight for wave-4+ non-veterans with a matching
  id, titans explicitly not special-cased — so a campaign node enters
  its fight at 20 HP today).

## Primary metric and verdict rule (BUILD arm)

- **Primary metric:** zero wave-4+ spawns at 20 HP in a reproduction
  probe — a wanderer-cast Congregation spawns at full def HP (900,
  `hp[0]` of [900,1100]); trap-spawned glasswing darter and
  finale-campaign nodes spawn at their def HP; a veteran wanderer
  spawn keeps its veteran flag.
- **GO** iff ALL of: (a) proof test `scripts/test-wanderspawn-20261106.js`
  is RED pre-fix and GREEN post-fix on the spawn-HP checks; (b) the
  before/after pilot on the COMMITTED band 53001–53008 (staged policy,
  150d death-aware) shows the d149 1-round-kill shape GONE on the fixed
  leg — no wave-4+ kill of a beast that entered the fight at 20/20 HP;
  (c) no new death mode and no `check.js --quick` regression.
- **NO-GO** iff any of (a)–(c) fails. A miss is NO-GO, never re-scored
  against a friendlier metric mid-run (METRIC BINDING §14).
- Reported alongside (context, NOT re-judged): the wall numbers
  (national / table / wins, wave 4–5 unlocks, median survival) on the
  band before vs after. **Honest note: this fix REMOVES a spurious
  kill, so wall numbers on band 53001–53008 may DIP — that is
  correctness, reported plainly, not a failed lever.** Trajectories
  will shift (a 900-HP beast where a 20-HP one stood changes fights);
  that is expected — report it, don't hide it.

## Method

1. **Prereg commit** (this file) before any judged sim.
2. **Proof test first, RED:** `scripts/test-wanderspawn-20261106.js`
   — harness-loaded game, `spawnWorldMonster` called in each bare-`{id}`
   caller shape (wanderer, trap, finale crew/opening/heart, debug
   button), plus the safe shapes as no-regression controls (string id,
   full def, explicit hp/maxHp fled recovery, veteran flag). Expect
   FAIL pre-fix on the bare-`{id}` HP checks (20, not def HP).
3. **Baseline (before) pilot:** stageally driver, POLICY=staged,
   SEEDS=53001..53008, DAYS=150, death-aware, to
   `evidence/2026-11-06/perseed-wanderspawn-a-before/` — BEFORE the fix
   is applied. RUN name `wanderspawn-before`.
4. **Fix:** central def resolution in `spawnWorldMonster` only
   (plus call-site changes only if the central fix proves insufficient).
   Verify `git diff` touches only spawn regions before committing.
5. **Proof GREEN** post-fix; `node scripts/check.js --quick`.
6. **Fixed pilot:** same driver / seeds / policy / horizon, to
   `evidence/2026-11-06/perseed-wanderspawn-a-after/`, RUN name
   `wanderspawn-after`. Confirm 12–16 seeds ONLY if the pilot passes
   GO — the pilot IS the 8-seed band (53001–53008); no new band is
   consumed by this arm.
7. **Compare:** before/after on identical seeds — wave-4+ entry-HP
   census (any 20/20 entries?), the d149 shape (present before / absent
   after), wall numbers, median survival, death-cause shares.
   Balanced panel (`scripts/balance-panel.js`): run its `compare` if it
   accepts corpus input; per the congtrace precedent it runs its own
   full panel and takes no corpus input, in which case record
   INAPPLICABLE rather than fabricating a compare `.md`.
8. **Telemetry:** run `scripts/telemetry-check.js` with the scale-wall
   baseline against the after-corpus glob; record LOUD lines or the
   refusal, do not roll the baseline forward on a deviation without
   investigation.

## Seeds (REUSE, not fresh — do NOT consume a new band)

- Band **53001–53008**, committed by the stageally confirms
  ("extension band 53001–53008 RESERVED for this run's confirms").
  Reused deliberately for a before/after on identical seeds — same
  band, same driver, new question (does the fix remove the spurious
  kill shape?). No forbidden-band list names it. The d149 1-round kill
  is on seed 53006 of this band; the pilot re-runs all 8 so the shape's
  absence after the fix is measured across the band, not asserted from
  one seed.

## Policy / horizon

- Policy: `scripts/policies/competent-stageally-a.js` VERBATIM
  (POLICY=staged) — the same policy the d149 kill was recorded under.
- Horizon: **150d, death-aware** (the confirm corpus ran 150d
  death-aware on this band; the same horizon keeps before/after
  comparable). Dead villages stop simulating (+10d tail max).

## Metric review (pre-run note)

- The primary metric is a spawn-shape metric (world HP at spawn), not
  a kill-count metric — the fix's job is to stop crippled births, and
  the kill shape is the downstream evidence. If the pilot shows the
  d149 shape gone but wall numbers dip, that is the fix working as
  designed (a spurious kill removed), and the verdict stays GO — the
  dip is reported, not hidden, and not re-scored as a lever failure.
- If trajectories shift so much that seed 53006 no longer reaches the
  Congregation at all (different wanderer, different day), the shape
  check falls back to the band-wide census: any wave-4+ world spawn or
  fight entry at 20/20 HP on the after leg is a GO failure; zero such
  entries across 8 seeds is a GO pass. The probe (proof test) remains
  the decisive check either way.
- The trap spawn's intended species (`glasswing`, the glasswing darter,
  def HP [18,26] per the trap comment's 18–26 HP window) is roughly in-range
  at 20 HP, so the trap fix changes little for its own species — the
  fix is still correct in general, and the proof test asserts the
  glasswing spawns at def HP, not at the fallback.
