# sim-seedpaths-b — PREREG (binding)

Run: fleshout-loop-b-20261116T0915Z (Loop B), axis winnability chain, arm
sim-seedpaths-b — DIAG: the four-seed-paths re-measurement (0730Z run's
next blank #4). Branch `sim-seedpaths-b` (worktree
`~/workspace/worktrees/sim-seedpaths-b`). Base: master `796fa96ca` at arm
start (the worktree HEAD; the coordinator rebases at landing and re-runs
proofs).
Binding prereg: THIS file — frozen before any judged sim. The instrument
(driver, analyzer, proof test) is built AFTER this commit; no judged
numbers exist yet. Commit this file FIRST (`scripts/safe-commit.sh`
"sim-seedpaths-b: frozen prereg — ..." — see the worker brief), then build.

## The question, in plain words

A villager only goes back after a wave-4 beast if something first plants
the idea — a "seed". Poolmarginals proved the old story wrong: the
subject does NOT only exist when the world-tick seed call is present.
With that call ABSENT, the control leg still opened 3 instances and
launched 2 parties, through three other live paths — agency evade,
agency flee, gate avoid. This DIAG counts ALL FOUR seed paths per
instance and per launch, on the same band poolmarginals judged, so the
family can finally say which path actually seeds launches — and how much
of the subject the world-tick path owns at all.

## Prior art (read first)

- `evidence/2026-11-16/sim-poolmarginals-b.md` + prereg — the instrument
  this arm EXTENDS (extend `scripts/poolmarginals-driver-20261116.js`,
  `scripts/analyze-poolmarginals-b.js`, `scripts/test-poolmarginals-b.js`;
  don't rebuild). Its metric review names the gap this arm closes:
  "The 'subject only exists with the seed call' premise is dead; a
  future arm should count all four seed paths, not the world-tick one
  alone." Its corpus is the reference: 35 instances, 3 launches, 1 solo
  target-kill, band 102131–102138.
- `evidence/2026-11-16/sim-companionpool-b.md` + prereg — the driver
  family origin; the vetparty seed-call text (13-line block) is preserved
  verbatim in the poolmarginals prereg §Design decision 1.
- `evidence/2026-11-16/sim-launchdef-a.md` — the gate-avoid seed path
  (`win-plan.js` gate avoid calling `winPlanSeedFromFight(vid, mdef,
  'avoided')`).
- `evidence/2026-11-16/sim-seedattach-a.md` — the world-tick seed gap
  finding (64 of 78 wave-4 flees leave no trace).
- `docs/CANON.md` (read first), `docs/VILLAGER-BRAIN.md` (one-brain
  contract; the brain owns dawn), `docs/PARTY.md`.
- CANON GAP (recorded, not invented): no CANON-registered doc covers
  companion-pool seed paths, departure gates, or the pick lottery
  (checked 2026-11-16 against the `docs/CANON.md` manifest;
  `docs/VILLAGER-BRAIN.md` §357 mentions `exped[]`/`away{}`/indoor
  checks only in passing). The evidence file states this gap instead of
  inventing canon.

## Design — the four paths (frozen)

The driver wraps the four seed call sites SCRIPTS-SIDE (monkey-patch /
wrap in the driver, zero `src/js` game-code change — same shape as
poolmarginals' `POOLMARGINALS_RECORDER=off` skip). Verify each site's
exact line in YOUR tree before wrapping (line numbers drift daily):

1. **world-tick** — the 13-line vetparty block re-landed verbatim from
   the poolmarginals prereg (in `resolveWildMonsterEncounter`,
   `src/js/game.js`, beside the existing return-to-fight sighting block,
   immediately before `if (rec.outcome === 'alreadyDead') {`). Present
   ONLY on the instrument leg; ABSENT on control (it is reverted on
   master by `7ba893b4b`).
2. **agency evade** — `src/js/villager-agency.js`, the evade branch that
   seeds a win plan (poolmarginals evidence cited :643; re-locate in
   tree). Fires when a villager evades a monster and the encounter seeds
   a plan.
3. **agency flee** — `src/js/villager-agency.js`, the flee branch
   (poolmarginals evidence cited :726; re-locate in tree). Fires when a
   villager flees a fight and the flight seeds a plan.
4. **gate avoid** — `src/js/win-plan.js`, the gate-avoid branch calling
   `winPlanSeedFromFight(vid, mdef, 'avoided')` (poolmarginals evidence
   cited :512; re-locate in tree). Fires when the gate turns a party
   away and seeds a plan from the avoidance.

Per INSTANCE (a plan-holder scored dawn that opens a re-engagement
instance, same instance definition as poolmarginals) record: every
seed-path firing (path, day, holder, beast id, wave) + which path seeded
FIRST. Per LAUNCH (an instance that departs with a party) record the
seeding path(s). Attribution rule (frozen): FIRST-SEEDER WINS for the
headline count; all firings are listed in the row so a later reader can
re-count under any rule. A path counts as firing only when its wrap
observes the actual `winPlanSeedFromFight` (or equivalent seeding) call
— a nearby sighting that does not seed is NOT a firing.

Legs (frozen): CONTROL = master as-is + recorder wraps on the three
live paths (world-tick absent — this leg measures the three-path world
alone). INSTRUMENT = control + the vetparty seed call re-landed
verbatim (four paths). Same band, same policy, same horizon. After
measurement the seed call is REVERTED on the branch; the instrument,
analyzer, proof test, corpora, and evidence merge evidence-only. This
is a DIAG reproduction of the subject, NOT a balance change: it changes
no number, no bar, no gate, no price, no default.

## Primary metric + GO bar (frozen)

Primary metric: **share of instances attributed to ≥1 named seed path**
(attribution coverage), reported separately per leg, with the
first-seeder distribution table (counts + shares per path, instances and
launches separately).

GO (instrument validity) iff ALL hold:

1. **≥90% of instances attributed** on EACH leg (every instance has ≥1
   named seed path; the 90% bar allows analyzer-edge misses).
2. **Every unattributed instance carries an explicit reason** in the
   row (named candidate path the wraps missed, or a recorder gap with
   the missing hook named) — no bare `unknown`.
3. **Corpus 16/16 files parse** (8 control + 8 instrument legs,
   one file per seed per leg).
4. **Proof green**: `scripts/test-seedpaths-b.js` — static/judge/
   recorder green + determinism D1 (recorder ON twice, identical
   trajectories) + D2 (recorder ON vs OFF, identical trajectories) on
   the instrument tip, and green again in the off shape after the
   revert (same shape as poolmarginals' 64/64).
5. **Wall numbers reported** for both legs (national by standing ≥200
   AND by scaleRank, table, wins, wave 4/5 unlocked, median survival,
   wave-4 kills, deaths).

The VERDICT is the distribution table itself: which path dominates
launches, and what share the world-tick path owns. A DIAG GO means the
instrument is valid and the table is trustworthy — not that any path
"wins". If the world-tick share is 0 on the instrument leg, say so
plainly: the seed call would be a dead lever.

## Seed bands (reuse-by-design, recorded per the seed-band-freshness skill)

- Band: **102131–102138** (8 seeds), control leg first (recorder only),
  then instrument leg (seed call + recorder), identical seeds, same
  policy/horizon.
- REUSE, NOT FRESH: this band is named in exactly one earlier prereg,
  `evidence/2026-11-16/sim-poolmarginals-b-prereg.md` (verified
  2026-11-16 by the coordinator: `grep -rl "102131"
  evidence/*/sim-*-prereg.md` returns that file only). The reuse is
  DELIBERATE and recorded here: attribution must be measured on the
  IDENTICAL corpus that produced poolmarginals' 35 instances / 3
  launches, or the path counts are not comparable to them. This is a
  reuse-by-design release for attribution against that judged corpus,
  not a fresh screening band; no fresh-band claim is made.
- NEVER 100621–100636, 100861–100868, 100821–100828, 100721–100728,
  100761–100768, 10100–10139, 190391–190398, 190621–190628,
  190631–190638, 190541–190548, 190561–190568 (the poolmarginals
  forbidden list, carried over).

## Horizon, policy, death-awareness, legs

- Horizon 150 days, death-aware (dead villages stop simulating),
  policy **competent verbatim** (`scripts/policies/competent.js` —
  worker: verify the sha with sha256sum before the prereg commit and
  record it in the evidence; poolmarginals recorded
  `74a890f0844ebc19fce2ac24da360f114b1f366fdb33a185a122f891dc2f0456`).
- Control anchor = the instrument commit (driver + analyzer + proof
  test, seed call ABSENT); instrument anchor = the seed-call commit
  (instrument + the 13-line seed call). Both SHAs are recorded in the
  evidence file. The judged comparison is control (three live paths)
  vs instrument (four paths).
- Determinism: D1/D2 as in §Primary metric. Drift check D3 (same shape
  as poolmarginals): the analyzer's `agree` check on the replica's
  ranked bid must pass on all scored dawns; any drift flag is
  investigated, not waived.

## Sense-testing (mandatory)

Read transcripts. Read the per-instance rows as stories: does the named
seed path match what the villager actually did that day (fled? evaded?
turned away at the gate? met the beast on a world tick)? One instance
where the recorded path contradicts the day's narration is a finding,
not a rounding error — name it in the evidence.

## Metric review (fill in at evidence time; do NOT re-score mid-run)

- Did the first-seeder-wins rule hide anything (instances with 2+
  firings where the first seeder was not the effective one)?
- Did any wrap miss a seeding (an instance with a plan but no firing)?
  Name the missed hook.
- Was 150d the right horizon, or did instances cluster at the tail?
- Did the control leg reproduce poolmarginals' 35 instances / 3
  launches closely enough to trust the comparison (same band, same
  policy — report the counts, don't assume)?

## Wall numbers (report every run)

National (standing ≥200 AND scaleRank), table, wins, wave-4 unlocked,
wave-5 unlocked, median survival, wave-4 kills, deaths — per leg.
