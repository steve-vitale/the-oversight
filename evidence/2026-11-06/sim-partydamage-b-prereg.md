# Party-damage-per-round lever — prereg (arm sim-partydamage-b)

Run: `fleshout-loop-b-20261106T1630Z`. Axis: scale-onramp / winnability chain
(wild ally-join → wave-4 kills → veterans → readiness-5 release → wave-5
facing → full seat). Arm: `sim-partydamage-b`, branch `sim-partydamage-b`,
worktree `~/workspace/worktrees/sim-partydamage-b`.
Coordinator claim:
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/lever-claims/fleshout-loop-b-20261106T1630Z.json`
(arms sim-partydamage-b + sim-pyrrhic-b; sibling arm owns game.js this run).

## Blank (from the 1430Z run, fightinterior next blank #1)

`evidence/2026-11-06/sim-fightinterior-b.md` sized this lever and did not
build it: with company the party deals a median 28 damage/round against a
beast that enters at a median 709 HP (~25 rounds to kill) and survives a
median 6 rounds — a damage race lost about fourfold. Stage-2-style sizing
(finishprobe shape: best observed damage-per-round on EVERY round
survived, plus one aimed strike at 2.5x): baseline ceiling 12% (1 flip of
22 lost fights), staged ceiling **35.3%** (7 flips of 28 lost fights).
The lever: hold ground and strike together every round the party
survives — the finishprobe P3 build (hold-ground + cascade extension)
extended to the party, so party damage is in the numerator. The SOLO
version of P3 was NO-GO by arithmetic (ceiling 7.5% < 10% bar); this arm
differs because party damage is in the numerator (ceiling 35.3%).

## The build (policy only — scripts/policies/*)

`scripts/policies/competent-partydamage-b.js`, wrapping
`competent-stageally-a.js` (companion staging + round-1 rally, unchanged)
and overriding ONLY the fight hook for wave-4+ TB fights:

- **Hold ground, never flee once committed.** The competent fight hook's
  start-of-fight walk-away (outmatched: total monster HP > 2.5x scholar
  max HP — true for nearly every wave-4 fight) and its mid-fight 35%-HP
  eject are BOTH bypassed in wave-4+ TB fights. The scholar stays and
  fights. Non-wave-4+ fights delegate to the staged policy untouched.
- **Rally round 1** (inherited from the stageally base): `tbPlayerRally`
  once when allies are present, then fight normally.
- **P3 cascade, extended to the party, in the frozen order**
  (finishprobe spec): `patient_aim` (take_aim: next shot 2.5x, cannot
  miss — verified in `src/js/abilityActions.js:1216`, sets
  `scholar.aimBonus`), `freeze_tag` (tag), `hogtie` (bind — requires a
  controlled adjacent size-1 monster, so the engine's own availability
  gate will refuse it against most wave-4 beasts; the cascade tries it
  and falls through honestly), `rage` (unleash_rage), `war_cry`
  (bellow). At most one press per ability per fight; at most one
  turn-costing press per turn; dinner reserve 200 kcal (competent's
  rule, unchanged). A refused press costs nothing and falls through to
  striking.
- **Strike together every round:** weakest live monster, in range →
  strike; out of range → close the distance one step (interior tiles
  1..7 only, step-don't-teleport, never onto the flee-by-barrier edge);
  no reachable adjacent tile → wait so the monster's turn can change
  the geometry (approach-fallback shape). Allies are engine-driven;
  the rally's coordKey focuses their damage — the party-damage
  numerator is scholar strikes + ally strikes + aimed/ability damage.
- **No gate / price / deed / readyDemand change.** No `src/js` change:
  if game-code support is needed, this arm reports DIAG-only and names
  the engine change; it does NOT edit `src/js/game.js` (the sibling
  arm sim-pyrrhic-b owns game.js this run).

## Scope: policy-vs-engine

The P3 cascade is a policy (`scripts/policies/*`). The instrument
(`scripts/partydamage-instrument-20261106.js`) is a copy of the
fightinterior recorder with its header changed; it already normalizes
the engine's `tbEnd` result `'routed'` → `'rout'` (the one-line fix
fightinterior named for the next run — present in the recorder as
carried on this worktree). The pyrrhic-kill attribution path
(`src/js/game.js` ~34015, writes waveKillLog directly and bypasses
`recordWaveKill`) is owned by the sibling arm sim-pyrrhic-b, NOT this
arm: this arm does not wrap it and does not claim fight-level kill
counts equal the log. The primary metric counts kills from
`waveKillLog` (which the pyrrhic path DOES write), not from fight
endings — so pyrrhic kills are counted, not hidden.

## Design (frozen — do not tune mid-run)

- Baseline: competent policy VERBATIM (`scripts/policies/competent.js`).
- Armed: `competent-partydamage-b` (staging + rally + hold-ground +
  P3 cascade + strike-together).
- Horizon: 150d, death-aware (dead villages stop simulating; +10d tail
  max). Seeds: 8 + 8, identical seeds both legs.
- Anchor: worktree HEAD at prereg commit (recorded in the evidence file).
- Instruments: `scripts/partydamage-instrument-20261106.js`,
  `scripts/partydamage-driver-20261106.js`,
  `scripts/partydamage-analyze-20261106.js`,
  `scripts/test-partydamage-20261106.js` (proof: fixtures + live smoke
  + off/on neutrality). Corpus:
  `evidence/2026-11-06/perseed-partydamage-b/` (16 files).

### Seed-band freshness check (skill local_seed_band_freshness)

- Candidate band: **87001–87008**.
- Searched: ALL `evidence/**/*.md` (every dated prereg + every evidence
  .md) for the digit strings 87001–87008 — **0 hits**. Searched for
  per-seed filenames (`*8700*`) — none. Searched for `"seed": 8700x`
  in evidence .json — none (bare `8700` hits in .json are decimal
  substrings inside float fields, e.g. `"fd":3.969488559276475`, not
  seed namings). Searched the convergence tracker and the
  `lever-claims/` directory for 87001 — 0 hits.
- Collisions checked and rejected: 57001–57008 (linkseek, named in
  sim-proposefirst-b-prereg forbidden list), 58001–58008 / 59001–59008
  (hold), 60001 (journey-scale r5), 61001/61007/61008, 62001–62008,
  63001–63008, 64001–64008, 65001/65008, 66001–66008, 67001/67008,
  68001/68005/68008, 69001/69005/69008, 70001–70008, 71001–71006,
  73001/73003/73005/73008, 74001–74008, 75001–75008, 76001–76008,
  77001–77003/77008, 79001–79004/79006/79008, 80001–80004/80008 (all
  named in `evidence/2026-11-06/sim-proposefirst-b-prereg.md` used-band
  list); 84001–84100 (vfrac screen, sim-vfrac-a-prereg). Forbidden /
  contaminated per the task brief, never re-picked: 51001–51008
  (fightinterior), 53001–53008 (stageally/killersurvive),
  55001–55008 (finishprobe), 99761–99772 (tableoffer sweep), 72001,
  73671–73678, 56001–56008 (56006 named).
- Verdict: band **87001–87008 FRESH**.

## Pre-registered verdict (judged, not fished)

**Primary metric: wave-4 TB kill rate, armed vs competent-verbatim
baseline on identical seeds.** Kill rate = wave-4 kills in
`waveKillLog` (all channels that write the log, pyrrhic included) /
wild wave-4 TB fights (traced fights, both legs counted the same way).
Fight-level endings are reported alongside but do not judge.

- **GO iff armed wave-4 TB kill rate ≥ 10%** (the finishprobe bar),
  with the 35.3% staged ceiling as context. A pilot that moves the
  kill rate from the staged leg's 5/34 (~15% on its band — note: the
  ceiling was sized on the STAGED leg, so the baseline on THIS band
  is the honest comparator) toward even half the ceiling is a real
  move; the bar is the pre-registered 10%.
- **NO-GO iff armed kill rate < 10%.** A miss is NO-GO, never re-scored
  against a friendlier metric (§14). If the metric proves wrong, it
  goes under "metric review" and a revision is proposed for the NEXT
  run.

**Secondaries (reported, not judged):**

- **Best-round composition recording** (the fightinterior metric-review
  ask): for each lost fight's best round, the analyzer records the
  composition — scholar damage vs ally damage, ability verbs in that
  round, strikes in that round, monster damage taken. Verdict note:
  whether best rounds 143–159 are repeatable (rage + full-party focus
  fire, seen across fights) or one-off spikes (a crit cluster, a
  wounded-entry round). If the armed leg's best rounds are dominated
  by single-round spikes that never repeat, the ceiling is fantasy
  and the evidence file says so.
- **Survival time as co-lever:** median rounds survived in lost wave-4
  TB fights (armed vs baseline) + median survival days (guard below).
  The 25-round Suburb flip in the sizing was a survival story, not a
  damage story — if rounds survived do not move while damage/round
  does, the evidence file says which half of the race moved.
- **Damage per round, by side:** median player-side damage/round and
  monster-side damage/round (trace hit log), scholar strikes/fight,
  fights with zero scholar strikes, ally damage/fight.

**Guards (a GO that breaks a guard is NO-GO):**

- G-survival: armed median survival ≥ baseline median survival − 10d.
- G-starvation: starvation deaths on the armed leg ≤ baseline + 2
  (the scalemetric bar).
- G-wins: wins must not fall on the armed leg vs baseline (reported;
  a fall is investigated, not auto-failed — a win fall with a kill
  rise is a finding, not a GO).

**Wall numbers (reported every run):** wins / national / table /
wave-4 unlocks / wave-4 faced / wave-5 unlocks / wave-5 faced /
readiness-5-ready days / living wave-4 killers at end / median
survival, per seed and band-wide, both legs.

**Balanced panel (§15):** before/after comparison runs through
`scripts/balance-panel.js`; the compare `.md` is attached to the
evidence file. Prior killer-chain arms found the tool takes no corpus
input (it runs its own full panel) — if it refuses again, the matched
identical-seed paired comparison (the analyzer output) is the
comparison and the refusal is recorded, not fabricated.

## Metric review (per §14 — written before the run)

- Kill rate uses `waveKillLog`, not fight endings: fight-level counts
  undercount the log by the pyrrhic kills (fightinterior: 2 of 9 on
  its band), and the pyrrhic path bypasses the instrument's only kill
  hook. The denominator is traced wave-4 TB fights; field fights are
  the untouched control channel and are counted separately, never
  mixed into the TB kill rate.
- The staged ceiling (35.3%) was sized on the STAGED leg of the
  51001 band, where the party was already staged and rallied. The
  armed leg here ADDS hold-ground + cascade + strike-together on top
  of staging+rally, so the ceiling is an upper bound on the
  INCREMENTAL move, not a prediction of the armed leg's rate. The GO
  bar (10%) is judged against the armed leg's own rate, not against
  the ceiling.
- The sizing bound's best round repeats a single round's damage every
  round — the best-round composition secondary exists precisely to
  test whether that repetition is reachable. A GO driven by one
  wounded-entry kill (a beast entering at ~123 HP, the 51005 shape)
  is reported as such, not as a damage-race win.
- TB `swingsAttempted` counts player strikes only; companion strikes
  are uncounted, so TB damageFrac (HP lost across the fight) and the
  trace hit log are the reliable damage measures, not swings.
- 8 seeds / 150d is a pilot: thin buckets (<5 fights) are reported as
  unjudgeable, not as firing or failing. A GO/NO-GO verdict rests on
  the pre-registered rules above, not on a re-scored metric. Every
  evidence file carries a "metric review" section.

## Canon read before writing this prereg

- docs/CANON.md, docs/MONSTER-WAVES.md (wave-4 bands HP 850–1500,
  damage 35–95, pierce 0.2–0.5; gate standing >= 100; readiness-5
  bar needs 2 living veterans with wave-4+ kills), docs/CONTESTS.md
  (contests are played, not RNG — this arm touches no contest).
- MONSTER COMMITMENT (Steve 2026-11-02): a monster stays committed
  unless its kind carries an explicit `flee` component; no wave-4
  monster carries one (finishprobe verified). This arm does not
  change any flee component.
- No canon doc covers party-damage-per-round as a lever; the lever is
  sized from the fightinterior + finishprobe evidence, not invented
  from a standing start.
