# sim-midshape-a — prereg

**Arm:** sim-midshape-a (game-code BUILD — the MIDDLE shape: protection-4
judgment) · **Run:** fleshout-20261108T1622Z · **Axis:** scale-onramp /
winnability chain (converging, NOT converged) · **Tracker blank:** (1)
(run 1530Z) · **Findings:** #1927 · **Branch:** sim-midshape-a, rebased
onto explicit master SHA `6680d7924e46911a963e3ad8dd06ab5e28f128c3` at run
start (pellet-boost landed; rebase clean, no stop-at-pick quirk, tree
clean after) · **Base for sweeps:** this worktree, before (baseline) and
after (candidate) the fix — no detached checkouts, no archive trees.

## The question

Does judging the field-fight hopeless/flee trajectory on incoming damage
mitigated **as if protection were 4** (fixed) restore the C1 fight shape?
Candidate (b) (`evidence/2026-11-08/sim-fightloop-b.md`, NO-GO) read
fully raw (protection 0) and over-fled: the 53002 Kieran day-4 fight fled
at 2 rounds / 82 HP instead of the C1 shape (5–7 rounds, 30–45 HP), sits
fell 7/8 → 5/8. The live code reads fully mitigated (protection 5 on
Kieran) and never flees. Judge at 4: the C1 value the 53002 fight was won
under. This arm is the named next arm from the fightloop-b evidence (a
middle shape), scoped by the run brief — NOT the blend variant (partial
mitigation), which is a different arm and is not substituted here.

## The fix — exact construction (confirmed implementable from src/js/fieldFights.js)

In `src/js/fieldFights.js` only, in the `fieldFight` morale path:

- Track a parallel accumulator of **protection-4 incoming damage**:
  the monster-phase `total` as it stands after board/ability modifiers
  (freeze tag, hogtie, peacemaker, godpath `fieldIncoming`) but before
  armor absorption — with `this.armorReduction(4, pierce)` applied in
  place of the worn value (same `Math.min(total - 1, Math.round(total *
  r))` clamp, so at least 1 lands). Computed once per monster hit, right
  after the `GPf.fieldIncoming` block, from the pre-armor `total`,
  regardless of actual `varmor` (even 0 — the judgment assumes 4).
  `wornDamage` (shawl avoidance), unbreakable brace, and shield wall are
  NOT applied to the P4 total, mirroring candidate (b)'s raw
  accumulator's exclusions — and, critically, no extra RNG draw is made
  (re-running `wornDamage` for the parallel total would draw RNG and
  split the streams).
- Lead hits accumulate into `rec.vTakenP4`; ally hits into
  `rec.allyTakenP4` (leech share split at the mitigated ratio, exactly as
  (b) split its raw totals, so the party P4 total is exactly the P4
  incoming). The current-ally P4 total resets when a new ally is called
  in (shout branch and ally-from-start setup, where `allyEntryHp` is
  set), mirroring the existing `_allyTakenLive` (current-ally-only) read.
  Initialized `vTakenP4: 0, allyTakenP4: 0` in the `rec` literal.
- The morale trajectory read uses the P4 totals: solo `mDpr =
  rec.vTakenP4 / round`; party variant `rtd = (vHp + allyHp) /
  Math.max(1, (rec.vTakenP4 + rec.allyTakenP4) / round)`. `hopeless =
  rtd < rtk * 0.85` and `winning = rtk <= rtd * 1.1` unchanged in form —
  only their incoming-damage input changes.
- NOTHING else changes: `rec.vTaken` (actual damage taken), HP,
  settlement (`hurtVillager`/`sealDamageResult`), narration, the floor
  flee, the committed-finish hold, trick holds, war cry / rally, and all
  round caps are byte-identical in behavior. No RNG draws added or
  removed, so baseline and candidate share the same RNG stream until the
  first morale decision differs. Player turn-based fight paths are NOT
  touched — this arm is the villager field fight only.
- The armor curve (`armorReduction`, `src/js/game.js`): reduction =
  effP / (effP + 6), pierce 0 on the cliffhanger. So the P4 judgment
  lands 60% of pre-armor incoming, vs 54.5% live at protection 5 and
  100% under candidate (b) — the middle shape is a ~10% harsher
  denominator than live, not a halfway house between 0 and 5 in effect.
  The `vHp` numerator in `rtd` still reads LIVE HP (protection-5
  trajectory): the C1 shape came from numerator AND denominator both at
  protection 4, so this arm restores only half the C1 condition. That
  asymmetry is the honest prediction below, not a hidden bar change.

**Degenerate case (finding #1016):** if `vTakenP4` is 0 (no damage
taken), `mDpr = 0` and `rtd = vHp / Math.max(1, 0) = vHp` — the same
degenerate shape as the live code (hopeless false). The construction
neither fixes nor worsens #1016; no division by zero is introduced
(`Math.max(1, mDpr)` already guards it).

**Ally-tanking shape (finding #1461):** if a root fight shows the ally
tanking every post-shout hit with leader incoming exactly 0 while the
leader still flees on trajectory, record it in the evidence file; do not
re-scope this arm.

## Proof (written with the fix, run before any judged candidate sweep)

`scripts/test-midshape-a.js` (legs selectable by `LEG=unit|fight53002|all`, default `all`):
- **Unit leg — decision invariant to protection:** the same scripted
  field fight run at two worn-protection values straddling the retune's
  bump (rain_poncho prot 3 vs good_boots prot 5). Fixture, calibrated on
  unfixed code this run (seed 53002, first adult non-scholar fighter, HP
  70, sharpened_stick wb 3, cliffhanger pack 1, `rng: () => 0.5`, intent
  `fight`, no allies; each protection in its own process so the roster is
  identical): unfixed P3 → `vFlee`, 2 rounds, vTaken 22, mDealt 22, 48
  HP left, hopeless; unfixed P5 → `vKill`, 8 rounds, vTaken 63, mDealt
  88, 7 HP left, never hopeless. (Identical to the fightloop-b
  calibration on its base — the fixture is stable across the rebase.)
  Assert on fixed code the hopeless/flee outcome (outcome, flee round,
  `fleeHopeless`) is IDENTICAL while `vTaken` differs, and `vTakenP4`
  is identical across the two legs, greater than worn-5 taken and less
  than worn-3 taken (protection 4 absorbs between the two). On unfixed
  code this leg fails 6 assertions (verified this run: 3 passed, 6
  failed — outcome/rounds/fleeHopeless diverge, `vTakenP4` null) — the
  instrument fails on unfixed code as designed.
- **Before/after leg — the 53002 Kieran day-4 fight shape:** replay the
  frozen-band fight on baseline vs candidate code and assert the
  candidate returns the C1 behavior — `vFlee` with `fleeHopeless`, 5–7
  rounds, HP left 30–45 (C1 point: 6 rounds, 38 HP) — while the baseline
  reproduces the P2 behavior (10 rounds, `vKill`, 13 HP). Read off the
  pilot corpora's `fieldFights` streams (same driver, same seeds), not a
  separate harness. Root-fight keys (fighter + day + monster): 53001 g1
  d3 Mara Vasquez vs hushwolf; 53002 g1 d4 Kieran Lorenz vs cliffhanger;
  53003 g1 d4 Jorge Silva vs lockpick_raccoon; 53004 g2 d7 Nora Wilson
  vs anaconda_empress; 53005 g1 d5 Robin Gordon vs nightcourt; 53006 g1
  d7 David ONeill vs drumbelly_tanuki; 53007 g1 d7 Diego Miranda vs
  nightcourt; 53008 g1 d5 Hassan Ali vs cliffhanger.
- **No-regression leg:** `node scripts/check.js --quick` on the fixed
  tree (or each failing line named in the evidence file with its cause).

**Prediction (not a bar — the pilot judges):** the unit leg is a
near-boundary judgment, not guaranteed by construction: the `vHp`
numerator still differs by worn protection, so identity holds only if
both legs cross the hopeless line in the same round. Calibrated numbers
(mDealt 11/round; cliffhanger HP 80 at `rng: () => 0.5`; raw ~17/round):
at round 2 the P4 read gives rtd ≈ 4.85 (P3, 48 HP) and ≈ 5.25 (P5, 52
HP) against a threshold ≈ 4.48 — neither hopeless yet; at round 3 the
P3 leg sits at rtd ≈ 3.74 vs threshold ≈ 3.63 (marginal); at round 4
the P3 leg turns hopeless while the P5 leg holds until round 5. If the
per-round rolls land as estimated, the unit legs flee a round apart and
primary (b) FAILS — the instrument, not the construction, decides.
For 53002: the P4 denominator is ~10% harsher than live (mDpr ≈ 9.6 vs
8.7/round) while the kill comes into sight by round 8 (mlead.hp ≈ 19,
rtk ≈ 2.0, winning true), so the trajectory may never turn hopeless at
all. The C1 flee was itself marginal (C1 rtd ≈ 3.7 vs threshold ≈ 3.4–
3.7 at round 6). If the pilot misses on (a), the mechanism story is
that a denominator-only middle shape cannot restore a shape that came
from numerator + denominator together — a finding, not a re-score.

## Sweeps — pilot first, confirm only on GO

- **Instrument:** `scripts/combatdiv-20261107.js` (the combatdiv driver)
  — doorwalk baseline leg, policy `competent-doorwalk-b`,
  `TAKESEAT_B=1`, door drive off, 150d death-aware. Corpora:
  `evidence/2026-11-08/perseed-midshape-a-baseline/` and
  `evidence/2026-11-08/perseed-midshape-a-candidate/`. One read-only
  instrument addition vs the fightloop-b run: the `fieldFights` row
  records `vTakenP4` / `allyTakenP4` from the returned record (null on
  the unfixed leg, where the fields do not exist) alongside the retained
  `vTakenRaw` / `allyTakenRaw` reads. Pure reads, no game-state writes,
  no RNG draws. The driver's `fieldFights` streams carry `outcome` /
  `rounds` / `vTaken` / `vTakenP4` / `vHpLeft` / `fleeHopeless` per fight.
- **Baseline leg runs FIRST, on the unfixed worktree** (before the fix is
  applied), so the before/after is identical seeds, identical code except
  the fix. Baseline expectation (prior, not control): the fightloop-b
  baseline on master `715c2918d` gave median 133.5d, sits 7/8, root
  fights P2 shapes (53002: 10r, vKill, 87 taken, 13 HP). Master has since
  moved to `6680d7924` (pellet-boost landed). If this baseline does NOT
  reproduce the P2 shape, that is a reproduction note to investigate
  before judging — the control is this run's baseline leg, not the
  fightloop-b numbers.
- **Pilot seeds:** 53001–53008, FROZEN — the bisect's diagnostic band,
  reused deliberately. **Horizon:** 150d death-aware (`runDays` stops on
  village death / win, +10d tail max). **Policy:** doorwalk baseline leg,
  as the bisect, loadoutcensus, combatdiv, and fightloop-b did — the same
  substrate the collapse was measured on.
- **Confirm (only if pilot GO):** FRESH band **53801–53812**, 12 seeds,
  same policy/horizon, baseline + candidate legs. **Freshness check
  (re-verified by this arm, per the seed-band skill — do not trust the
  fightloop-b note):** grep over ALL 647 `evidence/*/sim-*-prereg.md`
  for `5380`/`5381` → 6 files hit; precise `5380[1-9]|5381[0-2]` hits
  only in the 0245Z fightloop prereg (which names 53801–53812 as its own
  reserved confirm band), the fightloop-b prereg (re-verification +
  reservation), and the darkwit prereg's coordinator correction (which
  cites it as "the verified-fresh confirm band for the fight-loop fix" —
  a citation, not a use); the spoilname/pantryspoil/sweepcount loose hits
  are substrings of other numbers (precise grep: zero hits there). Grep
  over ALL 2737 `evidence/*/sim-*.md` for each of 53801–53812 → hits
  only in the 0245Z fightloop prereg/evidence, the fightloop-b
  prereg/evidence, the darkwit prereg citation, and
  `sim-winnability-round-1530.md:70` ("No confirm band spent
  (53801–53812 stays fresh)") — a statement of non-use, not a use.
  Forbidden/contaminated lists named in preregs (standacc-b 99201–99208
  et al.) name no 538xx seed (the precise grep over all sim `.md` covers
  every list file naming a seed). **No judged corpus uses any of
  53801–53812: the band is fresh and remains reserved for this arm's
  confirm.** Rejected bands, recorded so the next worker does not repeat
  them: 53201–53212 (named in sim-doorwalk-b-prereg.md,
  sim-doorwalk-confirm-b-prereg.md, sim-feareddoor-b-prereg.md — used);
  53701–53712 (53704/53707/53708 used by sim-compvet 2026-10-18);
  53501–53512 and 53601–53612 (named in preregs — used).
- **Balanced panel (§15):** `scripts/balance-panel.js` run on the before
  tree (unfixed worktree, `--seeds 53001,53002,53003,53004,53005,53006,53007,53008 --policies capable,risk-aware,socialite,winseek --days 150`) and again on the after tree (fixed worktree, same seeds/policies/days); `compare --before <before-panel>/panel.json.gz --after <after-panel>/panel.json.gz --out evidence/2026-11-08/midshape-a-panel-compare` and the compare `.md` attached to the evidence file. The panel is the instrument; the pre-registered GO bars below are the judge.

## GO bars (binding, §14)

Primary metric: fight-level property on the pilot corpora (53001–53008, 150d, doorwalk leg), candidate vs baseline on identical seeds.

- **PRIMARY — GO (pilot):** (a) the 53002 Kieran day-4 fight returns to the C1 shape on the candidate leg: `vFlee` with `fleeHopeless`, 5–7 rounds, HP left 30–45 — AND the baseline leg reproduces the P2 shape (10 rounds, `vKill`, ~13 HP); (b) the unit leg: the same scripted field fight at two worn-protection values straddling the retune bump gives an IDENTICAL hopeless/flee outcome while `vTaken` differs; (c) all 8 combatdiv root fights' decision shapes reported baseline vs candidate (table in the evidence file — reporting bar, not a pass/fail bar per fight).
- **SECONDARY — non-inferiority (frozen band, 53001–53008, 150d, doorwalk leg, TAKESEAT_B=1):** candidate median ≥0.8× control median, sits ≥ control−1, starvation ≤ control+2 (totals and arm-only). Control = the baseline leg run in this arm (current master, pellet-boost live), NOT the fightloop-b numbers (different master).
- **GO = primary holds AND secondary holds. NO-GO = any bar missed, never re-scored against a friendlier metric mid-run.** If NO-GO: revert the game-code change completely (zero src/js diff) and commit prereg + instruments + evidence + corpora only.
- **Confirm GO (fresh band 53801–53812):** same primary (fight-level shapes: the 538-band root fights are whatever the fresh band's first-divergence fights are — judged on the same property, decision invariant to protection, via the unit leg re-run on the confirm code base) + secondary (non-inferiority vs the fresh-band baseline leg). Confirm NO-GO holds the fix for re-judgment; it does not land.
- **Proof bars:** `scripts/test-midshape-a.js` green (unit leg + 53002 leg + check-quick); pilot corpora complete (8/8 seeds both legs, 0 instrument errors); panel compare `.md` attached.
- **Sense-test:** the 53002 Kieran fight read in plain words on both legs (who fought what, what changed, what it meant), plus the village assessment (what the villages looked like, who thrived/died and why).

## Scale-wall numbers (reported for baseline and candidate pilot corpora, and for the confirm band if run)

National / table / wins, wave 4–5 unlocks, median survival — per leg.

## Non-goals

- No blend-variant (partial mitigation) substitution; no candidate (a) substitution; no TB-fight-path changes; no loadout/equip-score changes; no retune-value changes. The fix touches the morale decision input only.
- No landing, no merge, no push, no version bump — report ready-to-merge; the coordinator lands it.
- No new measurement arm on an already-proven constraint beyond this fix's own before/after (the re-point's standing rule).

## Metric review (pre-registered note)

- The re-scope from fightloop-b holds: the fight-level primary discriminated where band bars could not (baseline already met median/sits GO on a healthy band), and the secondary non-inferiority bar caught the sits cost the primary alone would have missed. No re-scoring is available or used.
- The unit leg's identity bar is a genuine judgment, not a construction guarantee: the `vHp` numerator still differs by worn protection, so two protections can cross the hopeless line in different rounds even with a fixed-4 denominator. If the legs split by a round, that is a NO-GO on primary (b) — the bar as written — and the evidence will say the middle shape is not decision-invariant, not that the bar was too strict.
- The `winning` read shares the `rtd` input with `hopeless`, so it moves with the fix too — that is the same decision input, not a second change. The floor flee reads live HP, not the trajectory, so it is untouched by design: protection still saves HP, and a fighter at 5% still runs.
- One known limit, stated before the read: the pilot reuses the frozen band the collapse was diagnosed on, so it can show the fix restores *that band's fights*; the fresh-band confirm is what shows it generalizes. A pilot GO with a confirm NO-GO holds the fix.
